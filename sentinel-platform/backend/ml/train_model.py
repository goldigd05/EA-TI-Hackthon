"""
train_model.py
---------------
Trains and compares Random Forest vs XGBoost on the industrial safety dataset.
Saves the better-performing model + scaler + encoders to disk for use by predict.py

Run:
    python dataset/generate_dataset.py   (only once, to create the CSV)
    python train_model.py
"""

import pandas as pd
import numpy as np
import joblib
import json
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)

try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("⚠️  xgboost not installed — will train Random Forest only. "
          "Run: pip install xgboost --break-system-packages")

RANDOM_STATE = 42

# ---------------------------------------------------------------------------
# 1. LOAD DATA
# ---------------------------------------------------------------------------
df = pd.read_csv('dataset/industrial_safety_data.csv')
print(f"Loaded dataset: {df.shape}")

# ---------------------------------------------------------------------------
# 2. CLEAN DATA — handle missing values
# ---------------------------------------------------------------------------
numeric_cols = ['temperature', 'gas_level', 'humidity', 'pressure', 'smoke',
                 'worker_count', 'maintenance', 'equipment_health']
for col in numeric_cols:
    df[col] = df[col].fillna(df[col].median())

df['permit_status'] = df['permit_status'].fillna(df['permit_status'].mode()[0])
df['shift'] = df['shift'].fillna(df['shift'].mode()[0])

# ---------------------------------------------------------------------------
# 3. FEATURE ENGINEERING
# ---------------------------------------------------------------------------
df['danger_index'] = df['gas_level'] * 0.4 + df['smoke'] * 0.3 + df['temperature'] * 0.3
df['equipment_risk'] = 100 - df['equipment_health']
df['high_occupancy'] = (df['worker_count'] > 15).astype(int)

le_permit = LabelEncoder()
le_shift = LabelEncoder()
df['permit_status_enc'] = le_permit.fit_transform(df['permit_status'])
df['shift_enc'] = le_shift.fit_transform(df['shift'])

feature_cols = [
    'temperature', 'gas_level', 'humidity', 'pressure', 'smoke',
    'worker_count', 'maintenance', 'equipment_health',
    'permit_status_enc', 'shift_enc',
    'danger_index', 'equipment_risk', 'high_occupancy'
]

X = df[feature_cols]
y = df['incident']

# ---------------------------------------------------------------------------
# 4. TRAIN / TEST SPLIT
# ---------------------------------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
)

# ---------------------------------------------------------------------------
# 5. SCALING
# ---------------------------------------------------------------------------
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ---------------------------------------------------------------------------
# 6. TRAIN RANDOM FOREST (with hyperparameter tuning)
# ---------------------------------------------------------------------------
print("\n🌲 Training Random Forest with GridSearchCV...")
rf_params = {
    'n_estimators': [150, 250],
    'max_depth': [8, 12, None],
    'min_samples_split': [2, 5],
}
rf_grid = GridSearchCV(
    RandomForestClassifier(random_state=RANDOM_STATE, class_weight='balanced'),
    rf_params, cv=3, scoring='f1', n_jobs=-1
)
rf_grid.fit(X_train_scaled, y_train)
rf_model = rf_grid.best_estimator_
rf_pred = rf_model.predict(X_test_scaled)

def evaluate(name, y_true, y_pred):
    metrics = {
        'accuracy': round(accuracy_score(y_true, y_pred), 4),
        'precision': round(precision_score(y_true, y_pred), 4),
        'recall': round(recall_score(y_true, y_pred), 4),
        'f1_score': round(f1_score(y_true, y_pred), 4),
    }
    print(f"\n📊 {name} Results:")
    for k, v in metrics.items():
        print(f"   {k}: {v}")
    print(f"   Confusion Matrix:\n{confusion_matrix(y_true, y_pred)}")
    return metrics

rf_metrics = evaluate("Random Forest", y_test, rf_pred)
print(f"   Best Params: {rf_grid.best_params_}")

best_model = rf_model
best_name = "RandomForest"
best_metrics = rf_metrics

# ---------------------------------------------------------------------------
# 7. TRAIN XGBOOST (if available) AND COMPARE
# ---------------------------------------------------------------------------
if XGBOOST_AVAILABLE:
    print("\n⚡ Training XGBoost...")
    xgb_model = XGBClassifier(
        n_estimators=250, max_depth=6, learning_rate=0.08,
        subsample=0.9, colsample_bytree=0.9,
        random_state=RANDOM_STATE, eval_metric='logloss'
    )
    xgb_model.fit(X_train_scaled, y_train)
    xgb_pred = xgb_model.predict(X_test_scaled)
    xgb_metrics = evaluate("XGBoost", y_test, xgb_pred)

    if xgb_metrics['f1_score'] > rf_metrics['f1_score']:
        best_model = xgb_model
        best_name = "XGBoost"
        best_metrics = xgb_metrics

print(f"\n🏆 Best Model Selected: {best_name} (F1 = {best_metrics['f1_score']})")

# ---------------------------------------------------------------------------
# 8. FEATURE IMPORTANCE
# ---------------------------------------------------------------------------
importances = best_model.feature_importances_
feat_imp = sorted(zip(feature_cols, importances), key=lambda x: -x[1])
print("\n🔑 Feature Importance:")
for name, score in feat_imp:
    print(f"   {name}: {score:.4f}")

# ---------------------------------------------------------------------------
# 9. SAVE ARTIFACTS
# ---------------------------------------------------------------------------
joblib.dump(best_model, 'model.pkl')
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(le_permit, 'le_permit.pkl')
joblib.dump(le_shift, 'le_shift.pkl')

metadata = {
    'model_name': best_name,
    'model_version': 'v1.0',
    'feature_cols': feature_cols,
    'metrics': best_metrics,
    'feature_importance': [{'feature': f, 'importance': round(float(s), 4)} for f, s in feat_imp],
}
with open('model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("\n✅ Saved model.pkl, scaler.pkl, encoders, and model_metadata.json")
