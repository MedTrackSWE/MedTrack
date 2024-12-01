# models/__init__.py

from .user import User  # Import the User class from user.py
from .medical import MedicalRecord  # Import the MedicalRecord class from medical.py

__all__ = ['User', 'MedicalRecord']
