from flask import Blueprint, request, jsonify
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import get_db_connection
from models.appointment import Appointment  
from datetime import datetime, date

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/hospitals', methods=['GET'])
def get_hospitals():
    """Retrieve a list of hospitals for the user to choose from."""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT hospital_id, name, address, phone_number FROM Hospitals")
        hospitals = cursor.fetchall()
        return jsonify(hospitals), 200
    
    except Exception as e:
        print(f"Error fetching hospitals: {e}")
        return jsonify({"error": "Failed to retrieve hospitals"}), 500
    
    finally:
        cursor.close()
        connection.close()

@appointments_bp.route('/upcoming', methods=['GET'])
def get_upcoming_appointment():
    """Retrieve the next upcoming appointment for the logged-in user."""
    user_id = request.args.get('user_id')
    appointment = Appointment.get_upcoming_appointment(user_id)  # Using Appointment class method
    
    if appointment:
        return jsonify(appointment), 200
    else:
        return jsonify({"message": "No upcoming appointments"}), 200

@appointments_bp.route('/available-times', methods=['GET'])
def get_available_times():
    """Retrieve available times for a given day for booking appointments."""
    user_id = request.args.get('user_id')
    selected_date = request.args.get('date')
    hospital_id = request.args.get('hospital_id')
    
    available_times = Appointment.get_available_times(selected_date, user_id, hospital_id)  # Using Appointment class method
    return jsonify(available_times), 200 if available_times else jsonify({"error": "No available times found"}), 500

@appointments_bp.route('/book', methods=['POST'])
def book_appointment():
    """Book an appointment for a specific date and time."""
    data = request.json
    user_id = data.get('user_id')
    appointment_time = data.get('appointment_time')  # Expected format: YYYY-MM-DD HH:MM:SS
    hospital_id = data.get('hospital_id')
    
    success = Appointment.book_appointment(user_id, appointment_time, hospital_id)  # Using Appointment class method
    
    if success:
        return jsonify({"message": "Appointment successfully booked"}), 201
    else:
        return jsonify({"error": "Failed to book appointment"}), 500
