import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import get_db_connection

class User:
    @staticmethod
    def create_user(email, password_hash):
        """Inserts a new user into the Users table."""
        connection = get_db_connection()
        cursor = connection.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO Users (email, password_hash) VALUES (%s, %s)",
                (email, password_hash)
            )
            connection.commit()
            return True
        except Exception as e:
            print(f"Error creating user: {e}")
            return False
        finally:
            cursor.close()
            connection.close()

    @staticmethod
    def get_user_by_email(email):
        """Fetches a user from the Users table by email."""
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        try:
            cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
            user = cursor.fetchone()
            return user
        except Exception as e:
            print(f"Error fetching user by email: {e}")
            return None
        finally:
            cursor.close()
            connection.close()

    @staticmethod
    def update_user_password(user_id, new_password_hash):
        """Updates the password hash for a user."""
        connection = get_db_connection()
        cursor = connection.cursor()
        
        try:
            cursor.execute(
                "UPDATE Users SET password_hash = %s WHERE user_id = %s",
                (new_password_hash, user_id)
            )
            connection.commit()
            return True
        except Exception as e:
            print(f"Error updating user password: {e}")
            return False
        finally:
            cursor.close()
            connection.close()
