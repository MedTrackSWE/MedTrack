import pytest
import sys, os
from mysql.connector import Error
from werkzeug.security import generate_password_hash

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

    password = generate_password_hash('hashed_password')
    password2 = generate_password_hash('hashed_password2')


    # Insert sample data
    cursor.execute("INSERT INTO Users (user_id, email, password_hash, created_at, updated_at) VALUES (%s, %s, %s, NOW(), NOW())",(1, 'testuser@example.com', password))
    cursor.execute("INSERT INTO Users (user_id, email, password_hash, created_at, updated_at) VALUES (%s, %s, %s, NOW(), NOW())",(2, 'testuser2@example.com', password2))        
    cursor.execute("INSERT INTO Hospitals (hospital_id, name, address, phone_number) VALUES (1, 'Sample Hospital', '123 Health St', '555-1234')")
    cursor.execute("INSERT INTO Timeslots (timeslot_id, hospital_id, timeslot_time, timeslot_date) VALUES (1, 1, '10:00:00', '2024-12-01')")
    cursor.execute("INSERT INTO Timeslots (timeslot_id, hospital_id, timeslot_time, timeslot_date) VALUES (2, 1, '11:00:00', '2024-12-01')")

    # Add a future appointment for the user
    future_appointment_time = "2024-12-01 10:00:00"
    cursor.execute("INSERT INTO Appointments (user_id, appointment_time, hospital_id, status) VALUES (%s, %s, %s, 'Scheduled')", 
                   (1, future_appointment_time, 1))
    connection.commit()

    yield client  # Provide the client to the test

    # Restore original data
    cursor.execute("SET FOREIGN_KEY_CHECKS=0")
    cursor.execute("DELETE FROM Appointments")
    cursor.execute("DELETE FROM Appointments")
    cursor.execute("DELETE FROM Users")
    cursor.execute("DELETE FROM Timeslots")
    cursor.execute("DELETE FROM Hospitals")
    connection.commit()
    cursor.execute("SET FOREIGN_KEY_CHECKS=1")
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

def get_last_inserted_appointment_id(client):
    """Fetch the most recently inserted appointment ID."""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT MAX(appointment_id) AS last_id FROM Appointments")
        result = cursor.fetchone()
        return result['last_id'] if result else None
    finally:
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
    appointment_time = "2024-12-01 13:00:00"
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

    user_id2 = 2

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

    # Attempt to book the same slot again with a different user
    response = client.post('/api/appointments/book', json={
        'user_id': user_id2,
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
    assert response.status_code == 500
    available_times = response.json
    assert available_times == []

def test_reschedule_appointment_success(client):
    """Test successful rescheduling of an appointment."""
    new_time = "2024-12-01 11:00:00"
    appointment_id = get_last_inserted_appointment_id(client)
    assert appointment_id is not None, "No appointment found to reschedule."

    response = client.post('/api/appointments/reschedule', json={
        'appointment_id': appointment_id,
        'new_time': new_time
    })
    assert response.status_code == 200
    assert response.json.get("message") == "Appointment successfully rescheduled"
    
def test_reschedule_appointment_timeslot_assignment(client):
    """Test that rescheduling updates the timeslot assignment in the database."""
    appointment_id = get_last_inserted_appointment_id(client)
    new_time = "2024-12-01 11:00:00"
    response = client.post('/api/appointments/reschedule', json={
        'appointment_id': appointment_id,
        'new_time': new_time
    })
    assert response.status_code == 200

    # Check that the new timeslot is assigned to the appointment
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT appointment_id
        FROM Timeslots
        WHERE timeslot_time = TIME(%s) AND timeslot_date = DATE(%s)
    """, (new_time, new_time))
    timeslot = cursor.fetchone()
    assert timeslot['appointment_id'] == 1

    # Check that the old timeslot is freed
    cursor.execute("""
        SELECT appointment_id
        FROM Timeslots
        WHERE timeslot_time = '10:00:00' AND timeslot_date = '2024-12-01'
    """)
    timeslot = cursor.fetchone()
    assert timeslot['appointment_id'] is None

    cursor.close()
    connection.close()

def test_cancel_appointment_timeslot_release(client):
    """Test that canceling an appointment releases the timeslot in the database."""
    appointment_id = get_last_inserted_appointment_id(client)
    response = client.post('/api/appointments/cancel', json={
        'appointment_id': appointment_id
    })
    assert response.status_code == 200

    # Check that the timeslot is released
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT appointment_id
        FROM Timeslots
        WHERE timeslot_time = '10:00:00' AND timeslot_date = '2024-12-01'
    """)
    timeslot = cursor.fetchone()
    assert timeslot['appointment_id'] is None

    cursor.close()
    connection.close()


def test_original_timeslot_available_after_reschedule(client):
    """Test that the original timeslot becomes available after rescheduling."""
    user_id = 1
    original_time = "10:00:00"
    hospital_id = 1
    appointment_id = get_last_inserted_appointment_id(client)
    assert appointment_id is not None, "No appointment found to reschedule."

    # Reschedule to a new time
    client.post('/api/appointments/reschedule', json={
        'appointment_id': appointment_id,
        'new_time': "2024-12-01 11:00:00"
    })

    # Check availability of original timeslot
    response = client.get(
        f'/api/appointments/available-times?user_id={user_id}&date=2024-12-01&hospital_id={hospital_id}'
    )
    assert response.status_code == 200
    available_times = [slot['timeslot_time'] for slot in response.json]
    assert original_time in available_times

def test_no_double_booking_on_rescheduled_timeslot(client):
    """Test that the rescheduled timeslot cannot be double-booked."""
    user_id = 2  # Another user trying to book the rescheduled slot
    new_time = "2024-12-01 11:00:00"
    hospital_id = 1
    appointment_id = get_last_inserted_appointment_id(client)
    assert appointment_id is not None, "No appointment found to reschedule."

    # Reschedule to a new time
    client.post('/api/appointments/reschedule', json={
        'appointment_id': appointment_id,
        'new_time': new_time
    })

    # Attempt to book the rescheduled timeslot
    response = client.post('/api/appointments/book', json={
        'user_id': user_id,
        'appointment_time': new_time,
        'hospital_id': hospital_id
    })
    assert response.status_code == 500
    assert b"Failed to book appointment" in response.data


def test_cancel_appointment_success(client):
    """Test successful cancellation of an appointment."""
    appointment_id = get_last_inserted_appointment_id(client)
    assert appointment_id is not None, "No appointment found to cancel."

    response = client.post('/api/appointments/cancel', json={
        'appointment_id': appointment_id
    })
    assert response.status_code == 200
    assert response.json.get("message") == "Appointment successfully cancelled"

def test_canceled_timeslot_becomes_available(client):
    """Test that the canceled timeslot becomes available for booking."""
    user_id = 1
    appointment_id = get_last_inserted_appointment_id(client)
    assert appointment_id is not None, "No appointment found to cancel."

    # Cancel the appointment
    client.post('/api/appointments/cancel', json={
        'appointment_id': appointment_id
    })

    # Check that the timeslot is released
    response = client.get(
        f'/api/appointments/available-times?user_id={user_id}&date=2024-12-01&hospital_id=1'
    )
    assert response.status_code == 200
    available_times = [slot['timeslot_time'] for slot in response.json]
    assert "10:00:00" in available_times

def test_database_update_after_reschedule_and_cancel(client):
    """Test that the database is updated correctly after rescheduling and cancellation."""
    user_id = 1
    appointment_id = get_last_inserted_appointment_id(client)
    # Check rescheduling database integrity
    new_time = "2024-12-01 11:00:00"
    client.post('/api/appointments/reschedule', json={
        'appointment_id': appointment_id,
        'new_time': new_time
    })
    rescheduled_response = client.get(f'/api/appointments/upcoming?user_id={user_id}')
    assert rescheduled_response.status_code == 200
    rescheduled_appointment = rescheduled_response.json
    assert rescheduled_appointment.get("appointment_time") == "2024-12-01 11:00:00"

    # Check cancellation database integrity
    client.post('/api/appointments/cancel', json={
        'appointment_id': appointment_id
    })
    canceled_response = client.get(f'/api/appointments/upcoming?user_id={user_id}')
    assert canceled_response.status_code == 200
    assert canceled_response.json.get("message") == "No upcoming appointments"

