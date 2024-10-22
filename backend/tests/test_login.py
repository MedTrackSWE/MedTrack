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

    # Backup existing data
    cursor.execute("SELECT * FROM Users")
    backup_data = cursor.fetchall()

    # Clean the table for the tests
    cursor.execute("DELETE FROM Users")
    connection.commit()

    yield client

    # Restore original data after the tests
    for user in backup_data:
        cursor.execute(
            "INSERT INTO Users (user_id, email, password_hash, created_at, updated_at) VALUES (%s, %s, %s, %s, %s)",
            (user['user_id'], user['email'], user['password_hash'], user['created_at'], user['updated_at'])
        )
    connection.commit()

    cursor.close()
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
