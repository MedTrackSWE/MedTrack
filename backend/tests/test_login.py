import pytest
import sys, os
from mysql.connector import Error

# Set the current directory to the 'backend' root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../app')))


from app import create_app  # Import the app factory function
from database import get_db_connection  # Import the database connection function

@pytest.fixture
def client():
    app = create_app()  # Create an app instance
    app.config['TESTING'] = True
    client = app.test_client()

    # Initialize database connection
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

    yield client  # Provide the client to the test

    cursor.execute("SET FOREIGN_KEY_CHECKS=0")
    cursor.execute("DELETE FROM Appointments")
    cursor.execute("DELETE FROM Users")
    connection.commit()

    cursor.execute("SET FOREIGN_KEY_CHECKS=1")
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
        connection = get_db_connection()
        assert connection.is_connected()
    except Error as err:
        pytest.fail(f"Database connection failed: {err}")
    finally:
        if connection.is_connected():
            connection.close()

def test_signup_success(client):
    response = client.post('/api/auth/signup', json={
        'email': 'testuser@example.com',
        'password': 'securepassword'
    })
    
    assert response.status_code == 201
    assert b'User created successfully' in response.data

def test_signup_user_already_exists(client):
    client.post('/api/auth/signup', json={
        'email': 'testuser@example.com',
        'password': 'securepassword'
    })
    
    response = client.post('/api/auth/signup', json={
        'email': 'testuser@example.com',
        'password': 'securepassword'
    })
    
    assert response.status_code == 400
    assert b'User already exists' in response.data

def test_login_success(client):
    client.post('/api/auth/signup', json={
        'email': 'testuser@example.com',
        'password': 'securepassword'
    })
    
    response = client.post('/api/auth/login', json={
        'email': 'testuser@example.com',
        'password': 'securepassword'
    })
    
    assert response.status_code == 200
    assert b'Login successful' in response.data

def test_login_invalid_credentials(client):
    client.post('/api/auth/signup', json={
        'email': 'testuser@example.com',
        'password': 'securepassword'
    })
    
    response = client.post('/api/auth/login', json={
        'email': 'testuser@example.com',
        'password': 'wrongpassword'
    })
    
    assert response.status_code == 401
    assert b'Invalid credentials' in response.data
