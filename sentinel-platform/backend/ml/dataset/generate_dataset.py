"""
generate_dataset.py
--------------------
Generates a realistic synthetic industrial-safety dataset for training.
In a real deployment, replace this with historical sensor + incident logs
exported from MongoDB (Sensors, Workers, Permits, Incidents collections).

Run:
    python generate_dataset.py
Produces:
    industrial_safety_data.csv
"""

import numpy as np
import pandas as pd

np.random.seed(42)
N = 8000

shift = np.random.choice(['day', 'night', 'swing'], size=N, p=[0.5, 0.3, 0.2])
permit_status = np.random.choice(['approved', 'pending', 'rejected'], size=N, p=[0.7, 0.2, 0.1])

temperature = np.random.normal(38, 12, N).clip(10, 90)
gas_level = np.random.exponential(15, N).clip(0, 100)
humidity = np.random.normal(55, 15, N).clip(10, 100)
pressure = np.random.normal(101, 8, N).clip(60, 140)
smoke = np.random.exponential(8, N).clip(0, 100)
worker_count = np.random.poisson(6, N).clip(0, 40)
maintenance = np.random.choice([0, 1], size=N, p=[0.85, 0.15])  # 1 = overdue maintenance
equipment_health = np.random.normal(80, 15, N).clip(0, 100)

# Base risk score, a weighted combination of dangerous conditions
risk = (
    (temperature > 60) * 0.25
    + (gas_level > 40) * 0.30
    + (smoke > 35) * 0.20
    + (maintenance == 1) * 0.15
    + (equipment_health < 40) * 0.20
    + (permit_status == 'rejected') * 0.10
    + (worker_count > 20) * 0.05
    + (pressure > 120) * 0.10
)

noise = np.random.normal(0, 0.08, N)
risk_prob = (risk + noise).clip(0, 1)

incident = (risk_prob > np.random.uniform(0.18, 0.32, N)).astype(int)

df = pd.DataFrame({
    'temperature': temperature,
    'gas_level': gas_level,
    'humidity': humidity,
    'pressure': pressure,
    'smoke': smoke,
    'worker_count': worker_count,
    'maintenance': maintenance,
    'permit_status': permit_status,
    'equipment_health': equipment_health,
    'shift': shift,
    'incident': incident,
})

df.to_csv('industrial_safety_data.csv', index=False)
print(f"Dataset generated: {df.shape[0]} rows, incident rate = {df['incident'].mean():.2%}")
