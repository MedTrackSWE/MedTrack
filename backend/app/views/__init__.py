# views/__init__.py

from .auth import auth_bp  # Import the blueprint from auth.py
from .dashboard import dashboard_bp  # Import the blueprint from dashboard.py

__all__ = ['auth_bp', 'dashboard_bp']
