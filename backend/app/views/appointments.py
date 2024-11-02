from flask import Blueprint, request, jsonify
import sys,os
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
    
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT a.appointment_time, a.status, h.name AS hospital_name, h.address
            FROM Appointments a
            JOIN Hospitals h ON a.hospital_id = h.hospital_id
            WHERE a.user_id = %s AND a.appointment_time > NOW() AND a.status = 'Scheduled'
            ORDER BY a.appointment_time ASC
            LIMIT 1
        """, (user_id,))
        
        appointment = cursor.fetchone()
        
        if appointment:
            return jsonify(appointment), 200
        else:
            return jsonify({"message": "No upcoming appointments"}), 200
    
    except Exception as e:
        print(f"Error fetching upcoming appointment: {e}")
        return jsonify({"error": "Failed to retrieve upcoming appointments"}), 500
    
    finally:
        cursor.close()
        connection.close()

@appointments_bp.route('/available-times', methods=['GET'])
def get_available_times():
    """Retrieve available times for a given day for booking appointments."""
    user_id = request.args.get('user_id')
    selected_date = request.args.get('date')
    hospital_id = request.args.get('hospital_id')
    
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT t.timeslot_time
            FROM Timeslots t
            LEFT JOIN Appointments a ON t.hospital_id = a.hospital_id 
                AND t.timeslot_time = TIME(a.appointment_time) 
                AND DATE(a.appointment_time) = %s
                AND a.user_id = %s
            WHERE t.hospital_id = %s AND a.appointment_id IS NULL
        """, (selected_date, user_id, hospital_id))
        
        available_times = cursor.fetchall()
        return jsonify(available_times), 200
    
    except Exception as e:
        print(f"Error fetching available times: {e}")
        return jsonify({"error": "Failed to retrieve available times"}), 500
    
    finally:
        cursor.close()
        connection.close()

@appointments_bp.route('/book', methods=['POST'])
def book_appointment():
    """Book an appointment for a specific date and time."""
    data = request.json
    user_id = data.get('user_id')
    appointment_time = data.get('appointment_time')  # Expected format: YYYY-MM-DD HH:MM:SS
    hospital_id = data.get('hospital_id')
    
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        # Insert a new appointment into the database
        cursor.execute("""
            INSERT INTO Appointments (user_id, appointment_time, hospital_id, status)
            VALUES (%s, %s, %s, 'Scheduled')
        """, (user_id, appointment_time, hospital_id))
        connection.commit()
        
        return jsonify({"message": "Appointment successfully booked"}), 201
    
    except Exception as e:
        print(f"Error booking appointment: {e}")
        return jsonify({"error": "Failed to book appointment"}), 500
    
    finally:
        cursor.close()
        connection.close()