import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import get_db_connection

class MedicalRecord:
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
