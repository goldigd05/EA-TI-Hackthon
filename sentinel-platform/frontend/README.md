# SENTINEL — Frontend (Angular 22)

Complete Angular 22 standalone-component app for the AI-Powered Industrial
Safety Intelligence Platform. Dark control-room UI with amber/red hazard
accents. Talks to the Node backend at `http://localhost:5000/api`.

## Pages
- `/login` — sign in / register
- `/dashboard` — Command Center (KPIs, safety score, AI recommendation)
- `/workers` — worker CRUD + live vitals
- `/sensors` — sensor readings log
- `/permits` — AI-checked permit requests
- `/incidents` — incident log
- `/predictions` — **run the ML model directly** and see risk score, recommendation
- `/reports` — generate & download PDF reports
- `/notifications` — alert center

## Setup

```bash
cd frontend
npm install
npm start
```
Runs on **http://localhost:4200**.

Make sure the backend (`http://localhost:5000`) and the ML service
(`http://localhost:5001`) are already running — see the backend README.

## How auth works
`auth.interceptor.ts` automatically attaches the JWT from `localStorage` to
every API request. `auth.guard.ts` blocks all routes except `/login` until
you're signed in. Register a user first at `/login` → "Don't have an
account? Register".

## Notes
- Built with Angular 22 standalone components + signals (no NgModules).
- `provideHttpClient(withInterceptors([authInterceptor]))` is already wired
  in `app.config.ts` — nothing else to configure.
- If you already have your own Angular UI you were planning to reuse, you
  can instead just copy `src/app/services/*.ts` into your project (see the
  main `industrial-safety-platform/angular-services` folder for the
  original standalone copies) and skip everything else here.
