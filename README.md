# SENTINEL — AI-Powered Industrial Safety Intelligence Platform

**ET AI Hackathon 2.0 — Problem Statement 1: AI-Powered Industrial Safety Intelligence for Zero-Harm Operations**

An AI-powered platform that fuses IoT sensor data, worker vitals, permit-to-work logs, and machine-learning risk prediction into a single real-time safety intelligence layer — detecting **compound risk conditions** (e.g. overdue maintenance + elevated gas readings + an approved permit, occurring together) before they escalate into incidents, not after.

## 🔴 Live Demo
- **Frontend:** https://ea-ti-hackthon.vercel.app
- **Backend API:** https://ea-ti-hackthon.onrender.com/api/health

> Note: hosted on Render's free tier, which sleeps after 15 minutes of inactivity — the first request after idle time can take 30–50 seconds to wake up.

---

## The Problem
DGFASLI recorded 6,500+ fatal workplace accidents in Indian industry in FY2023. Investigations into incidents like the January 2025 Visakhapatnam Steel Plant explosion repeatedly show the same pattern: sensor data existed, but no intelligence layer connected those readings to a decision in time. The gap isn't missing sensors — it's a missing layer that **fuses** disparate signals into one risk picture and flags dangerous *combinations* that no single sensor would catch alone.

## What SENTINEL Does
1. **Compound Risk Detection Engine** — the trained ML model doesn't just output a risk score; it explains *which* factors (gas level, maintenance status, equipment health, permit status, temperature, smoke, occupancy) are simultaneously elevated, and flags when 2+ co-occur as a compound risk — directly targeting the "data present but unacted upon" failure mode.
2. **Geospatial Zone Heatmap** — a real-time plant-layout view that fuses sensor status, worker vitals, and the latest AI prediction per zone into one color-coded risk map, so a safety officer sees the whole facility at a glance instead of isolated readings.
3. **Digital Permit Intelligence Agent** — cross-checks every permit request against live sensor readings and worker status before approval, auto-rejecting dangerous combinations (e.g. hot-work permits near elevated gas readings) with a stated reason.
4. **Worker Vitals AI** — flags abnormal heart rate, temperature, oxygen saturation, and PPE (helmet) non-detection in real time.
5. **Automated Reporting** — on-demand PDF daily/weekly/monthly safety reports.
6. **Notification layer** — auto-generated alerts on critical sensor readings, critical worker status, rejected permits, and high-risk AI predictions.

---

## Tech Stack
- **Frontend:** Angular 22 (standalone components, signals), deployed on Vercel
- **Backend:** Node.js 24, Express.js, deployed on Render
- **Database:** MongoDB Atlas
- **ML:** Python, scikit-learn (Random Forest, 93.6% accuracy / F1 0.705, trained on 8,000 records), served via Flask
- **Auth:** JWT, bcrypt password hashing
- **Security:** Helmet, CORS allow-list, express-rate-limit, express-validator

## Architecture
```
Angular 22 (Vercel)
        │  REST / JWT
        ▼
Node.js + Express (Render)
        │  MongoDB driver          │  HTTP (compound-risk features)
        ▼                          ▼
   MongoDB Atlas          Python + Flask ML service
   (Workers, Sensors,     (Random Forest model,
    Permits, Incidents,    compound factor analysis)
    Predictions, ...)
```

---

## Key Differentiator: Compound Risk, Not Single-Threshold Alerts
A traditional dashboard would fire an isolated "gas level high" alert. SENTINEL's `/api/predict` endpoint returns a structured breakdown like:

```json
{
  "riskScore": 74.4,
  "predictedIncident": "Fire / Explosion Risk",
  "compoundRisk": {
    "isCompoundRisk": true,
    "triggeredCount": 3,
    "explanation": "COMPOUND RISK: Gas Level + Maintenance Status + Equipment Health detected simultaneously in Zone-A. No single one of these readings would trigger an alert alone — it is their co-occurrence that elevates this beyond a normal single-sensor threshold breach.",
    "factors": [ /* per-factor detail, triggered/not */ ]
  }
}
```
This is surfaced visually on both the **AI Predictor** page (per-prediction breakdown) and the **Zone Heatmap** (per-zone active signal list), so the reasoning — not just the number — is visible to a safety officer.

---

## Local Setup
See `backend/README.md` and `frontend/README.md` for full local development instructions (MongoDB Atlas connection, running the ML microservice, running the Angular dev server).

Quick start:
```bash
# Backend
cd backend && npm install && cp .env.example .env   # fill in MONGO_URI, JWT_SECRET
npm run dev

# ML service
cd backend/ml && pip install -r requirements.txt
python predict.py

# Frontend
cd frontend && npm install && npm start
```

---

## Judging Criteria Alignment
| Criteria | How SENTINEL addresses it |
|---|---|
| **Innovation** | Compound risk detection surfaces *why*, not just a score — matches the problem statement's core ask directly |
| **Business Impact** | Targets the exact failure mode from the Vizag Steel Plant incident: data existed, no intelligence layer acted on it in time |
| **Technical Excellence** | Real trained ML model (not rule-based), full MEAN stack, JWT auth, rate limiting, PDF generation, deployed and live |
| **Scalability** | Stateless Express API + separate ML microservice; MongoDB Atlas scales independently; each layer deployable/scalable separately |
| **User Experience** | Zone heatmap gives at-a-glance situational awareness; permit/worker AI gives explicit reasoning, not black-box scores |

---

## Team  Details & Links

Team Name: rajputaditirajput0

Goldi Kumari	(MEAN Stack Developer)

LinkedIn	 -: https://www.linkedin.com/in/goldi-k-35a019316/	

GitHub	-: https://github.com/goldigd05

Leetcode -: https://leetcode.com/u/gol_ldi/

Built for ET AI Hackathon 2.0, Phase 2 — Build Sprint.
