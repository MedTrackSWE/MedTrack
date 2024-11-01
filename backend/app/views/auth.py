from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import sys,os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import get_db_connection  # Import the database connection function

from models.user import User  # Import the User model for database interactions

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Handles user signup by creating a new user record."""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Check if the user already exists
    existing_user = User.get_user_by_email(email)
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    # Hash the password and create the new user
    hashed_password = generate_password_hash(password)
    if User.create_user(email, hashed_password):
        return jsonify({"message": "User created successfully"}), 201
    else:
        return jsonify({"error": "An error occurred while creating the user"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Handles user login by verifying credentials."""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Retrieve the user by email
    user = User.get_user_by_email(email)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    # Check if the provided password matches the stored hash
    if check_password_hash(user['password_hash'], password):
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401