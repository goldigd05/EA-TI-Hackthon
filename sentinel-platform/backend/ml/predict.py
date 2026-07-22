"""
predict.py
-----------
Lightweight Flask microservice that loads the trained model and serves
real-time predictions. Node.js (predictionService.js) calls this over HTTP.

Run:
    python predict.py
Runs on:
    http://localhost:5001/predict
"""

from flask import Flask, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(MODEL_DIR, 'model.pkl'))
scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
le_permit = joblib.load(os.path.join(MODEL_DIR, 'le_permit.pkl'))
le_shift = joblib.load(os.path.join(MODEL_DIR, 'le_shift.pkl'))

FEATURE_COLS = [
    'temperature', 'gas_level', 'humidity', 'pressure', 'smoke',
    'worker_count', 'maintenance', 'equipment_health',
    'permit_status_enc', 'shift_enc',
    'danger_index', 'equipment_risk', 'high_occupancy'
]

INCIDENT_TYPES = {
    'gas': 'Toxic Gas Leak',
    'fire': 'Fire / Explosion Risk',
    'equipment': 'Equipment Failure',
    'structural': 'Structural Collapse Risk',
    'health': 'Worker Health Emergency',
}


def classify_incident_type(payload):
    """Rule-informed labeling of WHICH incident type is most likely,
    layered on top of the ML risk probability (not a replacement for it)."""
    if payload['gas_level'] > 45:
        return INCIDENT_TYPES['gas']
    if payload['smoke'] > 40 or payload['temperature'] > 65:
        return INCIDENT_TYPES['fire']
    if payload['equipment_health'] < 35 or payload['maintenance'] == 1:
        return INCIDENT_TYPES['equipment']
    if payload['pressure'] > 125:
        return INCIDENT_TYPES['structural']
    return INCIDENT_TYPES['health']


def recommend_action(risk_score, incident_type):
    if risk_score >= 80:
        return f"IMMEDIATE EVACUATION — {incident_type} risk critical. Halt all operations in zone and dispatch emergency response team."
    if risk_score >= 60:
        return f"HIGH ALERT — Restrict access, inspect equipment/sensors immediately, notify safety officer for {incident_type}."
    if risk_score >= 35:
        return f"CAUTION — Increase monitoring frequency, schedule preventive maintenance, review permit conditions."
    return "Normal operations. Continue routine monitoring."


def emergency_level(risk_score):
    if risk_score >= 80:
        return 'critical'
    if risk_score >= 60:
        return 'high'
    if risk_score >= 35:
        return 'medium'
    if risk_score >= 15:
        return 'low'
    return 'none'


def analyze_compound_factors(payload):
    """
    Identifies individual hazard factors and flags COMPOUND risk — when 2+
    conditions co-occur that no single sensor threshold would catch alone.
    This directly targets the 'compound risk detection' requirement: e.g.
    gas readings + overdue maintenance + approved permit, simultaneously,
    is far more dangerous than any one of those alone.
    """
    factors = [
        {
            'key': 'gas_level', 'label': 'Gas Level', 'value': payload['gas_level'],
            'unit': 'ppm', 'triggered': payload['gas_level'] > 40,
            'detail': f"{payload['gas_level']} ppm (safe threshold: 40 ppm)",
        },
        {
            'key': 'smoke', 'label': 'Smoke', 'value': payload['smoke'],
            'unit': '', 'triggered': payload['smoke'] > 35,
            'detail': f"{payload['smoke']} (safe threshold: 35)",
        },
        {
            'key': 'temperature', 'label': 'Temperature', 'value': payload['temperature'],
            'unit': '°C', 'triggered': payload['temperature'] > 60,
            'detail': f"{payload['temperature']}°C (safe threshold: 60°C)",
        },
        {
            'key': 'maintenance', 'label': 'Maintenance Status', 'value': payload['maintenance'],
            'unit': '', 'triggered': payload['maintenance'] == 1,
            'detail': 'Overdue' if payload['maintenance'] == 1 else 'Current',
        },
        {
            'key': 'equipment_health', 'label': 'Equipment Health', 'value': payload['equipment_health'],
            'unit': '%', 'triggered': payload['equipment_health'] < 40,
            'detail': f"{payload['equipment_health']}% (safe threshold: above 40%)",
        },
        {
            'key': 'permit_status', 'label': 'Permit Status', 'value': payload['permit_status'],
            'unit': '', 'triggered': payload['permit_status'] in ('pending', 'rejected'),
            'detail': payload['permit_status'],
        },
        {
            'key': 'worker_count', 'label': 'Worker Occupancy', 'value': payload['worker_count'],
            'unit': ' workers', 'triggered': payload['worker_count'] > 15,
            'detail': f"{payload['worker_count']} workers in zone (high-occupancy threshold: 15)",
        },
    ]

    triggered = [f for f in factors if f['triggered']]
    is_compound = len(triggered) >= 2

    explanation = None
    if is_compound:
        labels = ' + '.join(f["label"] for f in triggered)
        explanation = (
            f"COMPOUND RISK: {labels} detected simultaneously in {payload['zone']}. "
            f"No single one of these readings would trigger an alert alone — it is their "
            f"co-occurrence that elevates this beyond a normal single-sensor threshold breach."
        )
    elif len(triggered) == 1:
        explanation = f"Single factor elevated: {triggered[0]['label']} ({triggered[0]['detail']}). Monitoring recommended."
    else:
        explanation = 'No individual hazard factors currently exceed safe thresholds.'

    return {
        'factors': factors,
        'triggeredCount': len(triggered),
        'isCompoundRisk': is_compound,
        'explanation': explanation,
    }


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': True})


@app.route('/predict', methods=['POST'])
def predict():
    try:
        payload = request.get_json(force=True)

        required = ['temperature', 'gas_level', 'humidity', 'pressure', 'smoke',
                    'worker_count', 'maintenance', 'permit_status', 'equipment_health', 'shift', 'zone']
        missing = [f for f in required if f not in payload]
        if missing:
            return jsonify({'error': f'Missing fields: {missing}'}), 400

        permit_enc = le_permit.transform([payload['permit_status']])[0] \
            if payload['permit_status'] in le_permit.classes_ else 0
        shift_enc = le_shift.transform([payload['shift']])[0] \
            if payload['shift'] in le_shift.classes_ else 0

        danger_index = payload['gas_level'] * 0.4 + payload['smoke'] * 0.3 + payload['temperature'] * 0.3
        equipment_risk = 100 - payload['equipment_health']
        high_occupancy = 1 if payload['worker_count'] > 15 else 0

        features = np.array([[
            payload['temperature'], payload['gas_level'], payload['humidity'],
            payload['pressure'], payload['smoke'], payload['worker_count'],
            payload['maintenance'], payload['equipment_health'],
            permit_enc, shift_enc, danger_index, equipment_risk, high_occupancy
        ]])

        features_scaled = scaler.transform(features)

        probability = model.predict_proba(features_scaled)[0][1]  # P(incident)
        risk_score = round(float(probability) * 100, 2)
        confidence = round(float(max(model.predict_proba(features_scaled)[0])) * 100, 2)

        incident_type = classify_incident_type(payload)
        recommendation = recommend_action(risk_score, incident_type)
        compound = analyze_compound_factors(payload)

        response = {
            'riskScore': risk_score,
            'confidence': confidence,
            'probability': round(float(probability), 4),
            'predictedIncident': incident_type if risk_score >= 35 else 'No significant risk detected',
            'recommendation': recommendation,
            'zone': payload['zone'],
            'emergencyLevel': emergency_level(risk_score),
            'modelVersion': 'v1.0',
            'compoundRisk': compound,
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('ML_SERVICE_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)