import sys, os
from datetime import timedelta
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import get_db_connection
class Appointment:
    
    @staticmethod
    def get_appointment_id(user_id):
        """Retrieve the appointment_id for a user's upcoming appointment."""
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT appointment_id
                FROM Appointments
                WHERE user_id = %s AND status = 'Scheduled' AND appointment_time > NOW()
                ORDER BY appointment_time ASC
                LIMIT 1
            """, (user_id,))
            result = cursor.fetchone()
            return result['appointment_id'] if result else None
        except Exception as e:
            print(f"Error fetching appointment ID: {e}")
            return None
        finally:
            cursor.close()
            connection.close()


    @staticmethod
    def get_upcoming_appointment(user_id):
        """Retrieve the next upcoming appointment for a user."""
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
            
            return cursor.fetchone()
        
        except Exception as e:
            print(f"Error fetching upcoming appointment: {e}")
            return None
        
        finally:
            cursor.close()
            connection.close()

    @staticmethod
    def get_available_times(selected_date, user_id, hospital_id):
        """Retrieve available times for a given day for booking appointments."""
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
            WHERE t.hospital_id = %s 
                AND t.timeslot_date = %s  -- Explicitly filter by timeslot_date
                AND (a.appointment_id IS NULL OR a.status = 'Cancelled')
        """, (selected_date, user_id, hospital_id, selected_date))
            
            available_times = cursor.fetchall()
            
            # Convert timedelta to a string format if present
            for slot in available_times:
                if isinstance(slot['timeslot_time'], timedelta):
                    slot['timeslot_time'] = str(slot['timeslot_time'])  # Converts to 'HH:MM:SS' format

            return available_times
        
        except Exception as e:
            print(f"Error fetching available times: {e}")
            return []
        
        finally:
            cursor.close()
            connection.close()

    @staticmethod
    def book_appointment(user_id, appointment_time, hospital_id):
        """Book an appointment for a specific date and time, preventing double booking."""
        connection = get_db_connection()
        cursor = connection.cursor()
        
        try:
            # Check for an existing appointment at the same time and hospital
            cursor.execute("""
                SELECT appointment_id FROM Appointments
                WHERE appointment_time = %s AND hospital_id = %s AND status = 'Scheduled'
            """, (appointment_time, hospital_id))
            
            if cursor.fetchone():  # If an appointment exists, prevent double booking
                print("Appointment already exists at this time and hospital.")
                return False
            
            # Proceed to book the appointment
            cursor.execute("""
                INSERT INTO Appointments (user_id, appointment_time, hospital_id, status)
                VALUES (%s, %s, %s, 'Scheduled')
            """, (user_id, appointment_time, hospital_id))
            connection.commit()
            
            return True
        
        except Exception as e:
            print(f"Error booking appointment: {e}")
            return False
        
        finally:
            cursor.close()
            connection.close()

    @staticmethod
    def reschedule_appointment(appointment_id, new_time):
        """Reschedule an appointment to a new time."""
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        try:
            # Check if the appointment exists and is scheduled
            cursor.execute("""
                SELECT status
                FROM Appointments
                WHERE appointment_id = %s
            """, (appointment_id,))
            appointment = cursor.fetchone()

            if not appointment or appointment['status'] != 'Scheduled':
                print(f"Appointment ID {appointment_id} not found or not scheduled.")
                return False

            # Update the appointment time
            cursor.execute("""
                UPDATE Appointments
                SET appointment_time = %s
                WHERE appointment_id = %s AND status = 'Scheduled'
            """, (new_time, appointment_id))
            connection.commit()
            if cursor.rowcount > 0:
                return True
            
            print(f"Failed to reschedule appointment ID {appointment_id}.")
            return False
        except Exception as e:
            print(f"Error rescheduling appointment: {e}")
            return False
        finally:
            cursor.close()
            connection.close()

    @staticmethod
    def cancel_appointment(appointment_id):
        """Cancel an appointment."""
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        try:
            # Check if the appointment exists and is scheduled
            cursor.execute("""
                SELECT status
                FROM Appointments
                WHERE appointment_id = %s
            """, (appointment_id,))
            appointment = cursor.fetchone()

            if not appointment or appointment['status'] != 'Scheduled':
                print(f"Appointment ID {appointment_id} not found or not scheduled.")
                return False

            # Cancel the appointment
            cursor.execute("""
                UPDATE Appointments
                SET status = 'Cancelled'
                WHERE appointment_id = %s AND status = 'Scheduled'
            """, (appointment_id,))
            
            if cursor.rowcount > 0:
                connection.commit()
                return True

            print(f"Failed to cancel appointment ID {appointment_id}.")
            return False
        except Exception as e:
            print(f"Error cancelling appointment: {e}")
            return False
        finally:
            cursor.close()
            connection.close()