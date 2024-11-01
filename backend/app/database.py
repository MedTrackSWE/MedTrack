import mysql.connector
from config import Config

def get_db_connection():
    """Creates and returns a new database connection using the configuration settings."""
    return mysql.connector.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        unix_socket=Config.DB_UNIX_SOCKET  # Uses the socket if specified, otherwise defaults to TCP
    )
