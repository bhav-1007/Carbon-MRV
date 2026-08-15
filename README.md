# 🌱 Carbon-MRV — Carbon Accounting Dashboard

A carbon accounting dashboard for institutions. Colleges and campuses can log activity data — electricity usage, transport fuel, waste generated — and the platform converts it into emissions, visualizes it, generates reports, and recommends ways to cut the institution's carbon footprint.

> **In one line:** Collect carbon activity data, convert it into verified emissions, visualize it, compare departments, generate reports, and get AI-assisted recommendations to reduce emissions.

---

## Table of Contents

- [Features](#features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Emission Calculation](#emission-calculation)
- [Emission Scopes](#emission-scopes)
- [Digital MRV Audit Trail](#digital-mrv-audit-trail)
- [API Overview](#api-overview)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [License](#license)

---

## Features

- Activity data logging (electricity, fuel, transport, waste) — manual entry or CSV upload
- Automatic emissions calculation (Scope 1 / 2 / 3) using configurable emission factors
- Real-time dashboard with total emissions, monthly trends, and department-wise breakdowns
- AI-assisted reduction recommendations (solar, LED lighting, bus routing, composting, etc.)
- Department leaderboard and benchmarking
- PDF report generation
- In-app assistant for natural-language questions ("Which scope is highest?")
- Tamper-aware **Digital MRV** audit trail using a hash-chained emission ledger
- Role-based access control scoped per organization and department

---

## User Roles

| Role | Access | Description |
|---|---|---|
| **Admin** | Full control | Sets up the institution, manages users and departments, controls emission factors. Every request is scoped by `organizationId`. |
| **Sustainability Officer** | Data entry + reporting | Uploads activity data (manually or via CSV), reviews emissions, generates reports and recommendations. |
| **Department User** | Department-scoped entry | Enters data for their own department/hostel only. Data is tagged with `departmentId` and `organizationId`. |
| **Viewer** | Read-only | Views dashboards, reports, leaderboards, and recommendations. No write access. |

Access is enforced via JWT-based role checks on every protected route.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS + Recharts |
| Backend | Node.js + Express.js + Mongoose |
| Database | MongoDB Atlas |
| ML Service | Python + FastAPI |
| Auth | JWT-based role access |

**Frontend pages:** Login, Dashboard, Activity Logs, Recommendations, Simulator, Benchmarking, Leaderboard, Reports, Assistant, Emission Factors.

**ML Service:** Provides `/forecast` and `/recommend`. If the ML service is unavailable, the backend automatically falls back to built-in logic so the app keeps working.

---

## How It Works

1. The institution logs in.
2. Users enter activity data — electricity, fuel, transport, waste.
3. The app calculates carbon emissions from that activity.
4. The dashboard shows total emissions, Scope 1/2/3 breakdowns, monthly trends, and department comparisons.
5. The app suggests reductions — solar panels, better bus routing, LED lighting, composting.
6. Reports can be exported as PDFs.
7. Departments are ranked on a leaderboard.
8. An in-app assistant answers natural-language questions about the data.

---

## Emission Calculation

Emissions are calculated as:

```
Quantity × Emission Factor = kgCO2e
kgCO2e ÷ 1000 = tCO2e
```

**Example:**

```
Electricity usage: 1000 kWh
Emission factor: 0.716 kgCO2e/kWh

1000 × 0.716 = 716 kgCO2e
716 ÷ 1000  = 0.716 tCO2e
```

The result (`0.716 tCO2e`) is stored as an `EmissionRecord`.

---

## Emission Scopes

| Scope | Definition | Example |
|---|---|---|
| **Scope 1** | Direct emissions | Diesel used by college buses or generators |
| **Scope 2** | Electricity emissions | Grid electricity used by classrooms, hostels, labs |
| **Scope 3** | Indirect emissions | Student commuting, waste disposal, outsourced transport |

---

## Digital MRV Audit Trail

**MRV** = Measurement, Reporting, Verification.

Each `EmissionRecord` stores a hash of its own data plus the hash of the previous record, forming a **hash chain** — a simple blockchain-style audit trail. If any historical record is altered, the chain breaks and reveals the inconsistency, making the emissions ledger tamper-aware.

---

## API Overview

### Activity & Emissions

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/activity-logs` | Submit a single activity data entry |
| `POST` | `/api/v1/activity-logs/upload-csv` | Bulk upload activity data via CSV |
| `GET` | `/api/v1/emissions/dashboard` | Retrieve calculated emissions for the dashboard |
| `POST` | `/api/v1/reports` | Generate an emissions report |

### ML Service

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/forecast` | Forecast future emissions trends |
| `POST` | `/recommend` | Generate AI-assisted reduction recommendations |

> All routes are protected and scoped by `organizationId` (and `departmentId` where applicable) based on the authenticated user's role.

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/bhav-1007/Carbon-MRV.git
cd Carbon-MRV

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# (Optional) Install ML service dependencies
cd ../ml-service
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the backend with values such as:

```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
PORT=5000
ML_SERVICE_URL=http://localhost:8000
```

### Run Locally

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# ML service (optional — backend falls back gracefully if not running)
cd ml-service
uvicorn main:app --reload
```

---

## Project Structure

```
Carbon-MRV/
├── backend/          # Node.js + Express + Mongoose API
├── frontend/          # React + Vite + Tailwind + Recharts UI
├── ml-service/         # Python + FastAPI forecasting & recommendations
└── README.md
```

*(Adjust paths above to match your actual repo layout.)*

---

## License

Add your license here (e.g., MIT).
