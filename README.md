# DHA-Sync: Smart Immigration Case Management System

[![Python](https://img.shields.io/badge/Python-3.12-blue)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1.1-blue)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-purple)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-teal)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-3-blue)](https://sqlite.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

A full-stack web application that digitises immigration and asylum case management for the
Department of Home Affairs (DHA). It replaces paper-based, fragmented processes with a single
auditable system covering case registration, document handling, deportation workflow, and
analytics.

**Status:** Backend and frontend are both complete and working end-to-end.

---

## Problem Context

The system targets documented operational failures at the DHA:

- **Backlog** — 300,000+ unprocessed visa applications
- **Manual processes** — paper-based and fragmented across offices
- **Capacity** — the department operates at roughly 40% of required staffing
- **No track-and-trace** — applicants have no visibility of case progress
- **Corruption exposure** — manual handling is difficult to audit

The design response is an append-only audit trail on every state change, role-based access
control enforced server-side, and dashboards that surface backlog and bottlenecks directly.

---

## Features

### Authentication & Security
- JWT authentication (`Flask-JWT-Extended`) with bcrypt password hashing
- Role-based access control enforced on **every** API endpoint
- Password reset flow with time-limited tokens
- Append-only audit log capturing user, action, before/after values, IP, and user-agent

### Case Management
- Full CRUD with auto-generated case numbers (`DHA-2026-0001`)
- Four-step registration wizard with per-step validation
- Status lifecycle: Pending → Under Review → Interview Scheduled → Approved / Rejected / Appeals
- Priority levels (Normal, High, Urgent) and statutory deadline tracking

### Documents
- Upload, list, and delete files scoped to a case
- Permitted types: `pdf`, `png`, `jpg`, `jpeg`, `doc`, `docx`, `txt`
- Metadata tracked: uploader, size, MIME type, document type, timestamp

### Dashboards & Analytics
- Role-specific landing pages (Officer, Supervisor, Administrator)
- Case statistics, monthly trends, per-country breakdown, officer productivity
- Overdue-case detection against statutory deadlines

### Deportation Workflow
- Kanban board: Order Issued → Detention → Travel Docs → Removal Confirmed
- Drag-and-drop between stages

### Search & Filtering
- Search across case number, passport number, surname, and nationality
- Filter by status, officer, case type, and priority, with pagination and sorting

---

## Roles & Permissions

All five roles are enforced server-side; the UI mirrors these permissions and hides
actions a role cannot perform.

| Role | Access |
|------|--------|
| **Admin** | Full access — cases, documents, user management, audit log, settings |
| **Supervisor** | Team oversight, case assignment, deportation board, reports, audit log |
| **Officer** | Own assigned cases — create, update, upload documents |
| **Auditor** | *Read-only* — cases, documents, reports, full audit log |
| **BorderOfficial** | *Read-only* — case lookup and document verification |

> The API rejects writes from Auditor and BorderOfficial with `403`, and the last remaining
> Admin cannot be demoted or deactivated (this would otherwise lock the system out of its own
> user-management functions).

---

## Technology Stack

### Backend
| Component | Technology |
|-----------|------------|
| Language | Python 3.12 |
| Framework | Flask 3.1.1 |
| ORM | Flask-SQLAlchemy 3.1.1 |
| Database | SQLite (development) · PostgreSQL-ready |
| Auth | Flask-JWT-Extended 4.7.1 |
| Hashing | bcrypt 4.3.0 |
| CORS | Flask-Cors 6.0.1 |
| Email | Flask-Mail 0.9.1 |
| Migrations | Flask-Migrate 4.1.0 |

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | React 18.2 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3.4 |
| Routing | React Router DOM 7 |
| HTTP | Axios |
| Charts | Recharts |
| Drag & drop | @hello-pangea/dnd |
| Icons | Heroicons · Lucide |
| State | React Context API |

---

## Project Structure

```
DHA-SYNC/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Application factory, CORS, JWT, logging
│   │   ├── models.py            # User, Case, Document, AuditLog, Interview, Notification
│   │   ├── routes/
│   │   │   ├── auth.py          # Login, register, password reset
│   │   │   ├── cases.py         # Case CRUD, search, filtering
│   │   │   ├── documents.py     # Upload, list, delete
│   │   │   ├── dashboard.py     # Statistics and analytics
│   │   │   ├── audit.py         # Audit log queries
│   │   │   ├── users.py         # User administration
│   │   │   └── health.py        # Health check
│   │   └── utils/seed.py        # Default user seeding
│   ├── instance/                # SQLite database and uploaded files
│   ├── requirements.txt
│   ├── run.py                   # Entry point
│   └── .env                     # Environment configuration
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Routes and role-based redirects
│   │   ├── api.js               # Axios instance with JWT interceptor
│   │   ├── context/AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Header, role-based sidebar
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── case/            # Overview, Documents, Timeline, Audit tabs
│   │   │   └── registration/    # Four-step wizard
│   │   ├── pages/               # Dashboards, Cases, Documents, Users, Audit, Reports
│   │   └── utils/               # Token storage, permission helpers
│   ├── package.json
│   └── tailwind.config.js
├── database/                    # SQL schema and seed scripts
├── documentation/               # SRS, SDLC, and API documentation
├── test_api.py
└── README.md
```

---

## Getting Started

### Prerequisites

- **Python 3.10+** (developed on 3.12)
- **Node.js 18+** and npm
- Git

### 1. Clone

```bash
git clone https://github.com/gandi-lesiba/dha-sync.git
cd dha-sync
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

The API starts on **http://localhost:5000**. On first run it creates the SQLite database and
seeds the demo accounts automatically.

> On macOS/Linux, activate with `source venv/bin/activate` instead.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The application starts on **http://localhost:5173**. Open that URL in a browser.

> Both servers must be running. The frontend calls the API at `http://localhost:5000`, which is
> already whitelisted in the backend's CORS configuration.

### 4. Environment configuration

`backend/.env` ships with working development defaults and requires no changes to run locally.
For deployment, replace `SECRET_KEY` and `JWT_SECRET_KEY` with strong random values, and set
`MAIL_USERNAME` / `MAIL_PASSWORD` to enable outbound password-reset email. Without mail
credentials the reset link is written to the application log instead of being sent.

---

## Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Administrator | `admin` | `Admin123!` |
| Supervisor | `supervisor` | `Super123!` |
| Case Officer | `officer1` | `Officer123!` |
| Case Officer | `officer2` | `Officer123!` |
| Auditor | `auditor` | `Audit123!` |
| Border Official | `border_official` | `Border123!` |

Each role lands on a different home page and sees a different sidebar.

---

## API Overview

All routes are prefixed with `/api`. Every endpoint except login and registration requires an
`Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Authenticate, returns JWT and user |
| `POST` | `/auth/register` | Create a user account |
| `POST` | `/auth/forgot-password` | Request a password reset link |
| `GET` | `/cases/` | List cases (search, filter, paginate) |
| `POST` | `/cases` | Create a case |
| `GET` | `/cases/<id>` | Case detail with documents |
| `PUT` | `/cases/<id>` | Update status, priority, or assignment |
| `GET` | `/documents/` | List documents across cases |
| `POST` | `/documents/upload` | Upload a document to a case |
| `GET` | `/dashboard/stats` | Case statistics |
| `GET` | `/dashboard/monthly` | Monthly application trend |
| `GET` | `/audit/` | Audit log with filters |
| `GET` | `/users/` | List users |

---

## Testing

```bash
python test_api.py
```

Exercises the authentication flow and the main case endpoints against a running backend.

---

## Deployment

Netlify hosts static sites and serverless functions — it cannot run the Flask backend, which is
a stateful process with a SQL database and JWT sessions. Deploy the two halves separately:
**Netlify for the frontend, Render for the backend.** The steps below assume Render; Railway or
Fly.io work the same way in spirit if you prefer one of those instead.

### 1. Backend → Render

1. Push this repo to GitHub (already done if you're reading this from there).
2. At [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints), click **New
   Blueprint Instance** and select this repo. Render reads `render.yaml` from the repo root and
   proposes a web service plus a free Postgres database — review and create both.
3. Render builds and deploys automatically. Once live, copy the service URL (something like
   `https://dha-sync-api.onrender.com`).
4. In the service's **Environment** tab, set `ALLOWED_ORIGINS` to your Netlify URL from step 2
   below (you can add it after step 2, then it redeploys automatically).

`SECRET_KEY` and `JWT_SECRET_KEY` are generated automatically by the Blueprint — never reuse the
placeholder values from `.env.example`. `DATABASE_URL` is wired to the Postgres database
automatically; the app switches from SQLite to Postgres based solely on whether this variable is
set, no code change needed.

> Free-tier notes: the web service spins down after ~15 minutes idle and takes 30–60s to wake on
> the next request — the first login after inactivity will be slow, not broken. The free
> Postgres database expires after 90 days.

### 2. Frontend → Netlify

1. At [app.netlify.com](https://app.netlify.com), **Add new site → Import an existing project**,
   and select this repo. Netlify reads `netlify.toml` from the repo root and picks up the build
   settings (`base: frontend`, `npm run build`, publish `dist`) automatically.
2. Before the first deploy, go to **Site configuration → Environment variables** and add:
   ```
   VITE_API_URL = https://dha-sync-api.onrender.com/api
   ```
   (your actual Render URL from step 3 above, with `/api` appended — this is what `frontend/src/api.js` reads).
3. Deploy. Netlify gives you a URL like `https://dha-sync.netlify.app`.
4. Go back to Render and set `ALLOWED_ORIGINS` to that Netlify URL (step 4 above) — without this,
   the browser blocks every API call with a CORS error even though the backend itself is up.

### 3. Verify

Open the Netlify URL, log in with a [demo account](#demo-accounts), and confirm the dashboard
loads real data. If login fails with a network error, it's almost always `ALLOWED_ORIGINS` on
Render not matching the Netlify URL exactly (including `https://`, no trailing slash).

---

## Notes

- The database is SQLite for ease of assessment; `DATABASE_URL` in `.env` allows switching to
  PostgreSQL without code changes.
- Uploaded files are stored on disk under `backend/instance/uploads/`, with only metadata and
  paths held in the database.
- The audit log is append-only by design — the application never issues `UPDATE` or `DELETE`
  against it.
- `database/schema.sql` and `database/seed.sql` are a reference copy of the schema and demo
  data, generated from the live database rather than hand-written. The application itself does
  not read these files — `db.create_all()` and `backend/app/utils/seed.py` create the schema
  and demo accounts in Python on first run. Running both files against a fresh SQLite database
  independently reproduces the same six accounts and passwords listed above (verified).

---

## License

Released under the [MIT License](LICENSE).

Copyright (c) 2026 Gandi Lesiba Mmatli
