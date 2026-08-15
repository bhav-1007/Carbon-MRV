# Institutional Carbon MRV Platform

Production-quality MVP for Smart India Hackathon problem statement IH-45: an AI-based institutional carbon footprint monitoring web application.

## Stack

- Frontend: React + Vite + Tailwind CSS + Recharts
- Backend: Node.js + Express.js REST API
- Database: MongoDB + Mongoose
- AI/ML service: Python + FastAPI + scikit-learn
- Auth: JWT with role-based access control
- Reporting: PDFKit
- Dev: single-command local runner

## MongoDB Connection

MongoDB is connected through `MONGO_URI`.

- Local backend uses `mongodb://localhost:27017/carbon_mrv`
- MongoDB Atlas can be used by replacing `MONGO_URI` in `.env`

## Quick Start

### Recommended: Local Run With MongoDB Atlas

This is the easiest path for a college project because you do not need local MongoDB.

1. Create a free MongoDB Atlas cluster.
2. In Atlas, create a database user and password.
3. In Atlas Network Access, add your current IP address. For quick demos, you can allow `0.0.0.0/0`, but do not use that for production.
4. Click Connect, choose Drivers, and copy the MongoDB URI.
5. Create `.env` in the project root:

```powershell
Copy-Item .env.example .env
```

6. Replace `MONGO_URI` in `.env` with your Atlas URI. It should look like:

```env
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/carbon_mrv?retryWrites=true&w=majority
```

7. Install dependencies once:

```powershell
npm run install:all
```

8. Install Python ML dependencies once:

```powershell
cd ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

9. Seed demo data once:

```powershell
npm run seed
```

10. Start frontend, backend, and ML service together:

```powershell
npm run dev
```

Open:

- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/health
- API docs summary: http://localhost:5000/api/v1/docs
- ML service health: http://localhost:8000/health

Seeded login:

```txt
admin@sih.local
Password123
```

### If Python Is Not Installed Yet

You can still start only the MERN app:

```powershell
$env:SKIP_ML="1"
npm run dev
```

Recommendations have a backend fallback, but forecasting needs the ML service.

## Features

- Organization registration and JWT login
- Role-based protected routes
- Manual activity log entry
- CSV activity upload
- Versioned, admin-editable emission factors
- Scope 1/2/3 emission calculation
- Hash-chained digital MRV audit trail
- Dashboard with time-wise, scope-wise, and department-wise charts
- PDF report generation
- FastAPI forecasting endpoint
- ROI-ranked recommendations endpoint
- What-if emission reduction simulator
- Peer per-capita benchmarking
- Department leaderboard and badges
- Conversational assistant fallback over emission records

## CSV Format

```csv
category,subtype,quantity,unit,date,departmentId
electricity,grid,1200,kWh,2026-02-01,
transport,diesel,100,litre,2026-02-02,
waste,landfill_mixed,300,kg,2026-02-03,
```

## Product Assumptions

- Emission factor values are `kgCO2e` per activity unit.
- Stored emissions are `tCO2e`.
- Electricity is Scope 2.
- Institution-owned fuel transport is Scope 1.
- Commuting, third-party transport, and waste disposal are Scope 3.
- The assistant uses a deterministic fallback unless an LLM provider is integrated behind `assistantService`.

## API Shape

All endpoints are versioned under `/api/v1`. Errors follow:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "field: reason"
  }
}
```
