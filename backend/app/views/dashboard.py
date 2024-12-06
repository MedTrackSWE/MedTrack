from flask import Blueprint, request, jsonify
import sys,os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import get_db_connection

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/medical-history', methods=['GET'])
def medical_history():
    return jsonify({"message": "Medical history endpoint works"}), 200
    # Logic to fetch and return medical history

@dashboard_bp.route('/appointments', methods=['POST', 'GET'])
def appointments():
    # Logic to schedule or view appointments
    ...

@dashboard_bp.route('/lab-results', methods=['GET'])
def lab_results():
    # Logic to view lab results
    ...
