import mysql.connector
import os, sys
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)  
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)
# print(f"DB_HOST={os.getenv('DB_HOST')}")
# print(f"DB_USER={os.getenv('DB_USER')}")
# print(f"DB_PASSWORD={os.getenv('DB_PASSWORD')}")
# print(f"DB_NAME={os.getenv('DB_NAME')}")
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        unix_socket=None
    )

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Check if the user already exists in the database
        cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user:
            return jsonify({"error": "User already exists"}), 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Insert the new user into the database
        cursor.execute(
            "INSERT INTO Users (email, password_hash) VALUES (%s, %s)",
            (email, hashed_password)
        )
        connection.commit()  

        return jsonify({"message": "User created successfully"}), 201

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        cursor.close()
        connection.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user is None:
            return jsonify({"error": "User not found"}), 404

        if check_password_hash(user['password_hash'], password):
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    
    except mysql.connector.Error as err:
        print(f"Database error: {err}")  # Log error details safely
        return jsonify({"error": "Internal server error"}), 500
    
    finally:
        cursor.close()
        connection.close()

    
if __name__ == '__main__':
    app.run(debug=True)