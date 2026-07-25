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

## Notes

- The database is SQLite for ease of assessment; `DATABASE_URL` in `.env` allows switching to
  PostgreSQL without code changes.
- Uploaded files are stored on disk under `backend/instance/uploads/`, with only metadata and
  paths held in the database.
- The audit log is append-only by design — the application never issues `UPDATE` or `DELETE`
  against it.

---

## License

Released under the [MIT License](LICENSE).

Copyright (c) 2026 Gandi Lesiba Mmatli
