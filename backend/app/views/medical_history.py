from flask import Blueprint, jsonify, request
from models.medical import MedicalRecord
#from models.medical import MedicalRecord

medical_history_bp = Blueprint('medical_history', __name__)

@medical_history_bp.route('/appointments', methods=['GET'])
def get_appointments():
    user_id = request.args.get('user_id')
    medical_record = MedicalRecord(user_id)
    appointments = medical_record.get_prior_appointments()
    return jsonify(appointments), 200

@medical_history_bp.route('/conditions', methods=['GET']) 
def get_conditions():
    user_id = request.args.get('user_id')
    #medical_record = MedicalRecord(user_id)
    conditions = MedicalRecord.get_prior_conditions(user_id)
    return jsonify(conditions), 200
