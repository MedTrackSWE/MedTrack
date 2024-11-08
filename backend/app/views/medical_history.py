# views.py

from flask import Blueprint, jsonify, request
from models.medical import MedicalRecord

medical_history_bp = Blueprint('medical_history', __name__)

@medical_history_bp.route('/api/medical_history/appointments', methods=['GET'])
def get_appointments():
    user_id = get_jwt_identity()
    medical_record = MedicalRecord(user_id)
    appointments = medical_record.get_prior_appointments()
    return jsonify(appointments), 200

@medical_history_bp.route('/api/medical_history/conditions', methods=['GET'])
def get_conditions():
    user_id = get_jwt_identity()
    medical_record = MedicalRecord(user_id)
    conditions = medical_record.get_prior_conditions()
    return jsonify(conditions), 200
