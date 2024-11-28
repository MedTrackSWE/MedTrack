import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import get_db_connection

class MedicalRecord:
    @staticmethod
    def format_date(date):
        """Formats a date into a readable string."""
        return date.strftime('%Y-%m-%d')
    
    @staticmethod
    def get_prior_appointments(user_id):
        """Fetches all prior completed appointments with notes for the user."""
        db = get_db_connection()
        cursor = db.cursor()
        query = """
            SELECT appointment_date, notes
            FROM appointments
            WHERE user_id = %s AND status = 'completed'
            ORDER BY appointment_date DESC
        """
        cursor.execute(query, (user_id,))
        return cursor.fetchall()


    @staticmethod
    def get_prior_conditions(user_id):
        """Fetches prior conditions or surgeries for the user """
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        try:
            cursor.execute("SELECT history_id FROM Medical_History WHERE user_id = %s", (user_id,))
            history = cursor.fetchone()
            if not history:
                return []
            history_id = history['history_id']
            query = """ 
            SELECT condition_name, condition_description, diagnosed_date
            FROM Conditions
            WHERE history_id = %s
            ORDER BY diagnosed_date DESC
            """
            cursor.execute(query, (history_id,))
            conditions = cursor.fetchall()
            return conditions
        except Exception as e:
            print(f"Error fetching conditions: {e}")
            return []
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def get_medications(user_id):
        """Fetches medications for the user"""
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        try:
            cursor.execute("SELECT history_id FROM Medical_History WHERE user_id = %s", (user_id,))
            history = cursor.fetchone()
            if not history:
                return []
            history_id = history['history_id']
            query = """ 
            SELECT medication_name, dosage, start_date, end_date
            FROM Medications 
            WHERE history_id = %s 
            ORDER BY start_date DESC 
            """
            cursor.execute(query,(history_id,))
            medications = cursor.fetchall()
            return medications 
        except Exception as e:
            print (f"Error fetching medications: {e} ")
            return []
        finally:
            cursor.close()
            db.close()

        
    @staticmethod
    def get_medical_history(user_id):
        """Fetches medical history records for a specific user."""
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        try:
            cursor.execute("SELECT * FROM MedicalHistory WHERE user_id = %s", (user_id,))
            history = cursor.fetchall()
            return history
        except Exception as e:
            print(f"Error fetching medical history: {e}")
            return []
        finally:
            cursor.close()
            connection.close()

    @staticmethod
    def add_medical_record(user_id, details, date):
        """Adds a new medical record for a user."""
        connection = get_db_connection()
        cursor = connection.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO MedicalHistory (user_id, details, date) VALUES (%s, %s, %s)",
                (user_id, details, date)
            )
            connection.commit()
            return True
        except Exception as e:
            print(f"Error adding medical record: {e}")
            return False
        finally:
            cursor.close()
            connection.close()


    @staticmethod
    def delete_medical_record(record_id):
        """Deletes a specific medical record by its ID."""
        connection = get_db_connection()
        cursor = connection.cursor()
        
        try:
            cursor.execute("DELETE FROM MedicalHistory WHERE record_id = %s", (record_id,))
            connection.commit()
            return True
        except Exception as e:
            print(f"Error deleting medical record: {e}")
            return False
        finally:
            cursor.close()
            connection.close()
