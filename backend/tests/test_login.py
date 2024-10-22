import pytest
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app.app import app, get_db_connection 

@pytest.fixture
def client():
    app.config['TESTING'] = True
    client = app.test_client()

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Disable foreign key checks to allow deletion during setup
    cursor.execute("SET FOREIGN_KEY_CHECKS=0")

    # Backup existing data from both Users and Appointments
    cursor.execute("SELECT * FROM Users")
    backup_users = cursor.fetchall()

    cursor.execute("SELECT * FROM Appointments")
    backup_appointments = cursor.fetchall()

    # Clean both tables for the tests
    cursor.execute("DELETE FROM Appointments")
    cursor.execute("DELETE FROM Users")
    connection.commit()

    # Enable foreign key checks after cleanup
    cursor.execute("SET FOREIGN_KEY_CHECKS=1")

    yield client

    # Restore original data in Users table
    for user in backup_users:
        cursor.execute(
            "INSERT INTO Users (user_id, email, password_hash, created_at, updated_at) VALUES (%s, %s, %s, %s, %s)",
            (user['user_id'], user['email'], user['password_hash'], user['created_at'], user['updated_at'])
        )

    # Restore original data in Appointments table
    for appointment in backup_appointments:
        cursor.execute(
            "INSERT INTO Appointments (appointment_id, user_id, date, details) VALUES (%s, %s, %s, %s)",
            (appointment['appointment_id'], appointment['user_id'], appointment['date'], appointment['details'])
        )

    connection.commit()

    cursor.close()
    connection.close()

def test_database_connection(client):
    try:
        connection = get_db_connection()  # Use the existing function to get the DB connection
        assert connection.is_connected()
    except mysql.connector.Error as err:
        pytest.fail(f"Database connection failed: {err}")
    finally:
        if connection.is_connected():
            connection.close()

def test_signup_success(client):
    # Simulate a signup request
    response = client.post('/api/signup', json={
        'email': 'testuser@example.com',
        'password': 'securepassword'
    })
    
    assert response.status_code == 201
    assert b'User created successfully' in response.data

def test_signup_user_already_exists(client):
    # Simulate signup for the same user twice to test duplicate case
    client.post('/api/signup', json={
        'email': 'testuser@example.com',
        'password': 'securepassword'
    })
    
    response = client.post('/api/signup', json={
        'email': 'testuser@example.com',
        'password': 'securepassword'
    })
    
    assert response.status_code == 400
    assert b'User already exists' in response.data

def test_login_success(client):
    # First, signup a user
    client.post('/api/signup', json={
        'email': 'testuser@example.com',
        'password': 'securepassword'
    })
    
    # Now, attempt login
    response = client.post('/api/login', json={
        'email': 'testuser@example.com',
        'password': 'securepassword'
    })
    
    assert response.status_code == 200
    assert b'Login successful' in response.data

def test_login_invalid_credentials(client):
    # First, signup a user
    client.post('/api/signup', json={
        'email': 'testuser@example.com',
        'password': 'securepassword'
    })
    
    # Attempt login with wrong password
    response = client.post('/api/login', json={
        'email': 'testuser@example.com',
        'password': 'wrongpassword'
    })
    
    assert response.status_code == 401
    assert b'Invalid credentials' in response.data
