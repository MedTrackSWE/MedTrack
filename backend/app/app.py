from flask import Flask
from flask_cors import CORS
from config import Config
from database import get_db_connection
from views.auth import auth_bp
from views.dashboard import dashboard_bp
from views.appointments import appointments_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
