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
    appointment = Appointment.get_upcoming_appointment(user_id)  
    
    if appointment:
        # Explicitly format the datetime object to ISO 8601 format
        if 'appointment_time' in appointment:
            appointment['appointment_time'] = appointment['appointment_time'].strftime('%Y-%m-%d %H:%M:%S')
        return jsonify(appointment), 200
    else:
        return jsonify({"message": "No upcoming appointments"}), 200
    
@appointments_bp.route('/available-times', methods=['GET'])
def get_available_times():
    """Retrieve available times for a given day for booking appointments."""
    user_id = request.args.get('user_id')
    selected_date = request.args.get('date')
    hospital_id = request.args.get('hospital_id')
    
    available_times = Appointment.get_available_times(selected_date, hospital_id)  
    return jsonify(available_times), (200 if available_times else 500)


@appointments_bp.route('/book', methods=['POST'])
def book_appointment():
    """Book an appointment for a specific date and time."""
    data = request.json
    user_id = data.get('user_id')
    print(user_id)
    appointment_time = data.get('appointment_time')  # Expected format: YYYY-MM-DD HH:MM:SS
    print(appointment_time)
    hospital_id = data.get('hospital_id')
    print(hospital_id)
    
    success = Appointment.book_appointment(user_id, appointment_time, hospital_id)  
    
    if success:
        return jsonify({"message": "Appointment successfully booked"}), 201
    else:
        return jsonify({"error": "Failed to book appointment"}), 500

@appointments_bp.route('/reschedule', methods=['POST'])
def reschedule_appointment():
    """Reschedule an appointment to a new time."""
    try:
        data = request.json
        appointment_id = data.get('appointment_id')
        new_time = data.get('new_time')

        if not appointment_id or not new_time:
            return jsonify({"error": "Missing required parameters"}), 400

        success = Appointment.reschedule_appointment(appointment_id, new_time)
        if success:
            return jsonify({"message": "Appointment successfully rescheduled"}), 200
        else:
            return jsonify({"error": "Failed to reschedule appointment"}), 500
    except Exception as e:
        print(f"Error in reschedule route: {e}")
        return jsonify({"error": "Internal server error"}), 500


@appointments_bp.route('/cancel', methods=['POST'])
def cancel_appointment():
    """Cancel an appointment."""
    try:
        data = request.json
        appointment_id = data.get('appointment_id')

        if not appointment_id:
            return jsonify({"error": "Missing required parameters"}), 400

        success = Appointment.cancel_appointment(appointment_id)
        if success:
            return jsonify({"message": "Appointment successfully cancelled"}), 200
        else:
            return jsonify({"error": "Failed to cancel appointment"}), 500
    except Exception as e:
        print(f"Error in cancel route: {e}")
        return jsonify({"error": "Internal server error"}), 500


@appointments_bp.route('/get-appointment-id', methods=['GET'])
def get_appointment_id():
    """Retrieve the appointment ID based on user, date, time, and hospital."""
    try:
        user_id = request.args.get('user_id')
        appointment_time = request.args.get('appointment_time')  # Expected format: YYYY-MM-DD HH:MM:SS
        hospital_id = request.args.get('hospital_id')

        if not user_id or not appointment_time or not hospital_id:
            return jsonify({"error": "Missing required parameters"}), 400

        appointment_id = Appointment.get_appointment_id(user_id, appointment_time, hospital_id)
        if appointment_id:
            return jsonify({"appointment_id": appointment_id}), 200
        else:
            return jsonify({"error": "Appointment not found"}), 404
    except Exception as e:
        print(f"Error in get-appointment-id route: {e}")
        return jsonify({"error": "Internal server error"}), 500

