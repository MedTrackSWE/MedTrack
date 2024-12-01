# views/__init__.py

from .auth import auth_bp  # Import the blueprint from auth.py
from .dashboard import dashboard_bp  # Import the blueprint from dashboard.py
from .medical_history import medical_history_bp

__all__ = ['auth_bp', 'dashboard_bp','medical_history_bp'] #just added new 
