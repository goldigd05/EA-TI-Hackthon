# SENTINEL — AI-Powered Industrial Safety Intelligence Platform

Complete MEAN + ML stack. Node 24, Angular 22, MongoDB (Atlas or Compass/local),
Python ML microservice with a pre-trained model (93.6% accuracy).

```
sentinel-platform/
├── backend/     → Node.js + Express + MongoDB + Python ML pipeline
└── frontend/    → Angular 22 app (dark control-room UI)
```

You need **3 things running at once**: MongoDB → Backend → ML service → Frontend.
Use 3 separate terminals (frontend needs its own too).

---

## 1. MongoDB (Atlas)

Since you already have MongoDB Atlas connected, just grab your connection string:

1. Atlas dashboard → **Connect** → **Drivers** → copy the string, it looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
2. Add a database name before the `?`, e.g. `.../industrial_safety_platform?retryWrites...`
3. Make sure your current IP is allow-listed in Atlas → **Network Access** (or allow `0.0.0.0/0` for local dev/hackathon).

You'll paste this into `backend/.env` in the next step.

---

## 2. Backend setup — **Terminal 1**

```bash
cd sentinel-platform/backend
npm install
cp .env.example .env
```

Open `.env` and edit two lines:
```
MONGO_URI=mongodb+srv://youruser:yourpass@yourcluster.mongodb.net/industrial_safety_platform?retryWrites=true&w=majority
JWT_SECRET=any_long_random_string_here
```

Start it:
```bash
npm run dev
```
You should see:
```
✅ MongoDB Connected: ...
🚀 Server running on http://localhost:5000
```
Verify: open `http://localhost:5000/api/health` in a browser → `{"status":"ok",...}`

**Leave this terminal running.**

---

## 3. ML prediction service — **Terminal 2**

```bash
cd sentinel-platform/backend/ml
python -m pip install -r requirements.txt --break-system-packages
python predict.py
```
(If `--break-system-packages` errors on your Python, just drop that flag.)
(If `python` isn't found, try `py` instead.)

You should see Flask start on `http://localhost:5001`.

The model (`model.pkl`, `scaler.pkl`) is **already trained** and included —
no need to retrain unless you want to swap in real data or add XGBoost
(instructions in `backend/README.md`).

**Leave this terminal running too.**

---

## 4. Frontend — **Terminal 3**

```bash
cd sentinel-platform/frontend
npm install
npm start
```
Opens on **http://localhost:4200**.

---

## 5. Using it

1. Go to `http://localhost:4200` → you'll land on the login page.
2. Click **"Don't have an account? Register"** → create your first user.
3. You're in. Explore:
   - **Command Center** — live KPIs (will be zero until you add data)
   - **Workers / Sensors / Permits / Incidents** — add some test records using the "+ Add" buttons on each page
   - **AI Predictor** — the core feature. Adjust the sliders/inputs (temperature, gas level, etc.) and click **Run AI prediction** — this calls the real trained model in Terminal 2 and returns a risk score, predicted incident, and recommendation.
   - **Reports** — generate a PDF summary
   - **Alerts** — notifications auto-created by critical sensor readings, worker vitals, or high-risk predictions

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Backend won't connect to MongoDB | Check Atlas Network Access allow-list includes your IP; check username/password in the URI don't have unescaped special characters (`@`, `#` etc. need URL-encoding) |
| `/api/predict` returns "AI prediction service unavailable" | Terminal 2 (predict.py) isn't running — start it |
| Frontend shows blank/errors on every page | Check Terminal 1 backend is running on port 5000; check browser console for CORS errors |
| `pip install` launcher error on Windows | Use `python -m pip install ...` instead of bare `pip install ...` |
| Login/register does nothing | Open browser dev tools → Network tab → check the request to `/api/auth/register` for the actual error message |

---

## What's inside (quick reference)
- **Backend**: 9 MongoDB models, 10 controllers, JWT auth, rate limiting, Helmet, PDF report generation, AI-assisted permit/worker services — see `backend/README.md` for full API reference.
- **ML**: Random Forest classifier trained on 8,000 synthetic records (93.6% accuracy, F1 0.705). Retrain instructions with real data or XGBoost comparison in `backend/README.md`.
- **Frontend**: Angular 22 standalone components, signals, JWT interceptor + route guard, 8 pages, dark industrial-safety themed UI — see `frontend/README.md`.
