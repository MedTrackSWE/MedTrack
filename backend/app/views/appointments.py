from flask import Blueprint, request, jsonify
import sys,os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.appointment import Appointment

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/upcoming', methods=['GET'])
def get_upcoming_appointment():
    user_id = request.args.get('user_id')
    appointment = Appointment.get_upcoming_appointment(user_id)
    
    if appointment:
        return jsonify(appointment), 200
    else:
        return jsonify({"message": "No upcoming appointments"}), 200

@appointments_bp.route('/available-times', methods=['GET'])
def get_available_times():
    user_id = request.args.get('user_id')
    selected_date = request.args.get('date')
    hospital_id = request.args.get('hospital_id')
    
    available_times = Appointment.get_available_times(selected_date, user_id, hospital_id)
    return jsonify(available_times), 200

@appointments_bp.route('/book', methods=['POST'])
def book_appointment():
    data = request.json
    user_id = data.get('user_id')
    appointment_time = data.get('appointment_time')
    hospital_id = data.get('hospital_id')
    
    success = Appointment.book_appointment(user_id, appointment_time, hospital_id)
    if success:
        return jsonify({"message": "Appointment successfully booked"}), 201
    else:
        return jsonify({"error": "Failed to book appointment"}), 500
