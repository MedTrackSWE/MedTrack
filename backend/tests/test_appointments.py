import pytest
import sys, os
from mysql.connector import Error

# Set the current directory to the 'backend' root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../app')))

from app import create_app
from database import get_db_connection

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    client = app.test_client()

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Disable foreign key checks to allow deletion during setup
    cursor.execute("SET FOREIGN_KEY_CHECKS=0")

    # Backup existing data
    cursor.execute("SELECT * FROM Users")
    backup_users = cursor.fetchall()
    cursor.execute("SELECT * FROM Appointments")
    backup_appointments = cursor.fetchall()
    cursor.execute("SELECT * FROM Timeslots")
    backup_timeslots = cursor.fetchall()
    cursor.execute("SELECT * FROM Hospitals")
    backup_hospitals = cursor.fetchall()

    # Clean tables for tests
    cursor.execute("DELETE FROM Appointments")
    cursor.execute("DELETE FROM Users")
    cursor.execute("DELETE FROM Timeslots")
    cursor.execute("DELETE FROM Hospitals")
    connection.commit()

    # Enable foreign key checks
    cursor.execute("SET FOREIGN_KEY_CHECKS=1")

    # Insert sample data
    cursor.execute("INSERT INTO Users (user_id, email, password_hash, created_at, updated_at) VALUES (1, 'testuser@example.com', 'hashedpassword', NOW(), NOW())")
    cursor.execute("INSERT INTO Hospitals (hospital_id, name, address, phone_number) VALUES (1, 'Sample Hospital', '123 Health St', '555-1234')")
    cursor.execute("INSERT INTO Hospitals (hospital_id, name, address, phone_number) VALUES (2, 'Another Hospital', '456 Wellness Ave', '555-5678')")
    cursor.execute("INSERT INTO Timeslots (timeslot_id, hospital_id, timeslot_time, timeslot_date) VALUES (1, 1, '10:00:00', '2024-12-01')")
    cursor.execute("INSERT INTO Timeslots (timeslot_id, hospital_id, timeslot_time, timeslot_date) VALUES (2, 1, '11:00:00', '2024-12-01')")
    connection.commit()

    yield client  # Provide the client to the test

    # Restore original data
    cursor.execute("DELETE FROM Appointments")
    for user in backup_users:
        cursor.execute(
            "INSERT INTO Users (user_id, email, password_hash, created_at, updated_at) VALUES (%s, %s, %s, %s, %s)",
            (user['user_id'], user['email'], user['password_hash'], user['created_at'], user['updated_at'])
        )
    for appointment in backup_appointments:
        cursor.execute(
            "INSERT INTO Appointments (appointment_id, user_id, appointment_time, hospital_id, status) VALUES (%s, %s, %s, %s, %s)",
            (appointment['appointment_id'], appointment['user_id'], appointment['appointment_time'], appointment['hospital_id'], appointment['status'])
        )
    for timeslot in backup_timeslots:
        cursor.execute(
            "INSERT INTO Timeslots (timeslot_id, hospital_id, timeslot_time, timeslot_date) VALUES (%s, %s, %s, %s)",
            (timeslot['timeslot_id'], timeslot['hospital_id'], timeslot['timeslot_time'], timeslot['timeslot_date'])
        )
    for hospital in backup_hospitals:
        cursor.execute(
            "INSERT INTO Hospitals (hospital_id, name, address, phone_number) VALUES (%s, %s, %s, %s)",
            (hospital['hospital_id'], hospital['name'], hospital['address'], hospital['phone_number'])
        )

    connection.commit()
    cursor.close()
    connection.close()

def test_select_hospital(client):
    response = client.get('/api/appointments/hospitals')
    assert response.status_code == 200
    hospitals = response.json
    assert isinstance(hospitals, list)
    assert all("hospital_id" in hospital and "name" in hospital for hospital in hospitals)

def test_upcoming_appointments(client):
    user_id = 1
    response = client.get(f'/api/appointments/upcoming?user_id={user_id}')
    assert response.status_code == 200
    appointment = response.json
    if appointment:
        assert "appointment_time" in appointment
        assert "hospital_name" in appointment
    else:
        assert appointment.get("message") == "No upcoming appointments"

def test_available_times(client):
    user_id = 1
    selected_date = "2024-12-01"
    hospital_id = 1
    
    response = client.get(f'/api/appointments/available-times?user_id={user_id}&date={selected_date}&hospital_id={hospital_id}')
    assert response.status_code == 200
    available_times = response.json
    assert isinstance(available_times, list)
    assert all("timeslot_time" in slot for slot in available_times)

def test_book_appointment(client):
    user_id = 1
    appointment_time = "2024-12-01 10:00:00"
    hospital_id = 1

    response = client.post('/api/appointments/book', json={
        'user_id': user_id,
        'appointment_time': appointment_time,
        'hospital_id': hospital_id
    })
    assert response.status_code == 201
    message = response.json
    assert message.get("message") == "Appointment successfully booked"

def test_full_appointment_process(client):
    user_id = 1

    hospital_response = client.get('/api/appointments/hospitals')
    assert hospital_response.status_code == 200
    hospitals = hospital_response.json
    assert len(hospitals) > 0
    hospital_id = hospitals[0]["hospital_id"]

    upcoming_response = client.get(f'/api/appointments/upcoming?user_id={user_id}')
    assert upcoming_response.status_code == 200

    selected_date = "2024-12-01"
    available_times_response = client.get(f'/api/appointments/available-times?user_id={user_id}&date={selected_date}&hospital_id={hospital_id}')
    assert available_times_response.status_code == 200
    available_times = available_times_response.json
    assert len(available_times) > 0
    selected_time = available_times[0]["timeslot_time"]

    appointment_time = f"{selected_date} {selected_time}"
    book_response = client.post('/api/appointments/book', json={
        'user_id': user_id,
        'appointment_time': appointment_time,
        'hospital_id': hospital_id
    })
    assert book_response.status_code == 201
    booking_message = book_response.json
    assert booking_message.get("message") == "Appointment successfully booked"

def test_book_already_taken_slot(client):
    user_id = 1
    appointment_time = "2024-12-01 10:00:00"
    hospital_id = 1

    # Book the first appointment
    client.post('/api/appointments/book', json={
        'user_id': user_id,
        'appointment_time': appointment_time,
        'hospital_id': hospital_id
    })

    # Attempt to book the same slot again
    response = client.post('/api/appointments/book', json={
        'user_id': user_id,
        'appointment_time': appointment_time,
        'hospital_id': hospital_id
    })
    assert response.status_code == 500
    assert b"Failed to book appointment" in response.data

def test_no_available_times(client):
    user_id = 1
    selected_date = "2024-12-25"  # Assuming this date has no available times in test data
    hospital_id = 1

    response = client.get(f'/api/appointments/available-times?user_id={user_id}&date={selected_date}&hospital_id={hospital_id}')
    assert response.status_code == 200
    available_times = response.json
    assert available_times == []
