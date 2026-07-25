# DHA-Sync: Smart Immigration Case Management System

[![Python](https://img.shields.io/badge/Python-3.12-blue)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-blue)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org)
[![SQLite](https://img.shields.io/badge/SQLite-3.45-blue)](https://sqlite.org)

## 📌 Project Overview

**DHA-Sync** is a full-stack web application designed to digitize and streamline immigration and asylum case management for the Department of Home Affairs (DHA). It addresses critical challenges including:

- **Massive backlogs** (300,000+ unprocessed visa applications)
- **Outdated manual systems** (paper-based, fragmented processes)
- **Capacity constraints** (DHA operates with only 40% of required personnel)
- **Lack of transparency** (no track-and-trace for applicants)
- **Corruption vulnerabilities** (manual processes prone to exploitation)

> *"The Department of Home Affairs has struggled to process and deport illegal immigrants due to severe capacity constraints, outdated digital systems, and a massive backlog in asylum claims."*

---

## 🎯 Key Features

### 🔐 Authentication & Security
- JWT-based authentication with role-based access control
- Secure password hashing with bcrypt
- Forgot password functionality with email reset links
- Session management with token expiry

### 👥 Role-Based Access Control (RBAC)
| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, system configuration |
| **Supervisor** | Team oversight, case assignment, performance metrics |
| **Officer** | Case management, status updates, document uploads |
| **Auditor** | Read-only access, audit trail viewing, compliance reports |
| **BorderOfficial** | Case verification, search functionality |

### 📋 Case Management
- Complete CRUD operations for immigration cases
- Auto-generated case numbers (e.g., DHA-2026-0001)
- Multi-step case registration form
- Case status tracking: Pending → Under Review → Approved/Rejected
- Priority levels: Normal, High, Urgent
- Statutory deadline tracking (6-month rule for asylum)

### 📎 Document Management
- Upload, view, and delete case documents
- Support for: Passport, Visa, Birth Certificate, Photograph, Police Clearance, Medical Certificate
- Secure file storage with path tracking

### 📊 Analytics Dashboard
- Real-time statistics (total cases, pending, approved, rejected)
- Monthly application trends
- Country-wise statistics with approval rates
- Officer productivity metrics
- Overdue case alerts

### 🕵️ Audit Trail
- Every change is logged: Who, What, When, Old/New Values
- Action types: LOGIN, LOGOUT, CREATE_CASE, UPDATE_CASE, STATUS_CHANGE, UPLOAD_DOCUMENT, DELETE_DOCUMENT
- IP address and user-agent tracking for compliance

### 🔍 Search & Filtering
- Search by: Case Number, Passport Number, Applicant Surname, Nationality
- Filters: Status, Officer, Case Type, Priority
- Pagination and sorting

### 🗺️ Deportation Workflow
- Kanban board view
- Pipeline stages: Order Issued → Detention → Travel Docs → Removal Confirmed
- Drag-and-drop status updates

---

## 🛠️ Technology Stack

### Backend
| Component | Technology |
|-----------|------------|
| Framework | Flask 3.1.1 |
| Database | SQLite (Development) / PostgreSQL (Production) |
| ORM | SQLAlchemy 3.1.1 |
| Authentication | JWT (Flask-JWT-Extended) |
| Password Hashing | bcrypt (Flask-Bcrypt) |
| CORS | Flask-CORS |
| Email | Flask-Mail |
| Testing | Pytest |

### Frontend (Coming Soon)
| Component | Technology |
|-----------|------------|
| Framework | React.js 18.2 |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Routing | React Router DOM |
| Charts | Recharts |
| State Management | React Context API |

---

## 📁 Project Structure
DHA-SYNC/
├── backend/
│ ├── app/
│ │ ├── init.py # Flask application factory
│ │ ├── models.py # Database models
│ │ ├── routes/
│ │ │ ├── auth.py # Authentication routes
│ │ │ ├── cases.py # Case management routes
│ │ │ ├── dashboard.py # Analytics routes
│ │ │ ├── documents.py # Document management routes
│ │ │ ├── audit.py # Audit log routes
│ │ │ └── users.py # User management routes
│ │ └── utils/
│ │ └── seed.py # Default user seeder
│ ├── instance/ # SQLite database
│ ├── logs/ # Application logs
│ ├── venv/ # Virtual environment
│ ├── requirements.txt
│ ├── run.py # Application entry point
│ └── .env # Environment variables
├── frontend/ # React frontend 
├── database/
│ ├── schema.sql
│ └── seed.sql
├── documentation/
│ ├── API.md
│ ├── SDLC.md
│ └── SRS.md
├── .gitignore
├── README.md
└── test_api.py # API test script



---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ (for frontend)
- pip & npm




