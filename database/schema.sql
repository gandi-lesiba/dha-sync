-- DHA-Sync database schema
-- SQLite dialect (matches DATABASE_URL in backend/.env for local development).
--
-- This file is generated from the live schema actually created by the
-- SQLAlchemy models in backend/app/models.py (db.create_all() at app
-- startup), not hand-written separately from the ORM. Table order follows
-- foreign-key dependency: users first, then cases (which reference users),
-- then everything that references cases.

PRAGMA foreign_keys = ON;

-- ============================================================
-- users — staff accounts for all roles (Admin, Supervisor,
-- Officer, Auditor, BorderOfficial). Role is a plain string
-- column, not a DB-level enum; role names are enforced in the
-- application layer (see backend/app/routes/*.py role_required()).
-- ============================================================
CREATE TABLE users (
    id                  INTEGER NOT NULL,
    username            VARCHAR(80)  NOT NULL,
    email               VARCHAR(120) NOT NULL,
    password_hash       VARCHAR(128) NOT NULL,   -- bcrypt hash, never plaintext
    full_name           VARCHAR(150) NOT NULL,
    employee_id         VARCHAR(50),
    role                VARCHAR(50)  NOT NULL,
    is_active           BOOLEAN,
    is_email_verified   BOOLEAN,
    created_at          DATETIME,
    updated_at          DATETIME,
    last_login          DATETIME,
    reset_token         VARCHAR(100),             -- set by /auth/forgot-password
    reset_token_expiry  DATETIME,
    PRIMARY KEY (id),
    UNIQUE (employee_id)
);

CREATE UNIQUE INDEX ix_users_username ON users (username);
CREATE UNIQUE INDEX ix_users_email    ON users (email);

-- ============================================================
-- cases — central record for an immigrant/asylum seeker. Every
-- other domain table hangs off this one via case_id.
-- ============================================================
CREATE TABLE cases (
    id                      INTEGER NOT NULL,
    case_number             VARCHAR(50)  NOT NULL,   -- system-generated, e.g. DHA-2026-0001
    reference_number        VARCHAR(50),              -- optional external/file reference
    applicant_full_name     VARCHAR(150) NOT NULL,
    applicant_surname       VARCHAR(100) NOT NULL,
    applicant_given_names   VARCHAR(100),
    passport_number         VARCHAR(50)  NOT NULL,
    national_id             VARCHAR(50),
    nationality             VARCHAR(100) NOT NULL,
    country_of_birth        VARCHAR(100),
    date_of_birth           DATE NOT NULL,
    gender                  VARCHAR(20),
    case_type               VARCHAR(50)  NOT NULL,   -- Visa | Asylum | Permit | Citizenship | Deportation
    sub_type                VARCHAR(50),
    priority                VARCHAR(20),              -- Normal | High | Urgent
    status                  VARCHAR(50),              -- Pending | Under Review | Interview Scheduled | Appeals | Approved | Rejected
    application_date        DATE,
    statutory_deadline      DATE,                      -- 6-month asylum rule
    decision_date            DATE,
    assigned_officer_id     INTEGER,                   -- FK users.id, nullable (unassigned)
    created_by_id           INTEGER NOT NULL,          -- FK users.id, who registered the case
    created_at              DATETIME,
    updated_at              DATETIME,
    additional_data         JSON,
    PRIMARY KEY (id),
    UNIQUE (reference_number),
    FOREIGN KEY (assigned_officer_id) REFERENCES users (id),
    FOREIGN KEY (created_by_id)       REFERENCES users (id)
);

CREATE UNIQUE INDEX ix_cases_case_number       ON cases (case_number);
CREATE INDEX        ix_cases_applicant_surname ON cases (applicant_surname);
CREATE INDEX        ix_cases_passport_number   ON cases (passport_number);
CREATE INDEX        ix_cases_nationality       ON cases (nationality);
CREATE INDEX        ix_cases_status            ON cases (status);

-- ============================================================
-- documents — versioned file uploads attached to a case.
-- file_path points at backend/instance/uploads/<case_id>/...;
-- the file bytes themselves are not stored in the database.
-- ============================================================
CREATE TABLE documents (
    id              INTEGER NOT NULL,
    case_id         INTEGER NOT NULL,
    uploaded_by_id  INTEGER NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    file_size       INTEGER,
    file_type       VARCHAR(50),
    document_type   VARCHAR(50) NOT NULL,   -- Passport | Affidavit | Proof of Entry | Interview Notes | Other
    ocr_text        TEXT,
    uploaded_at     DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (case_id)        REFERENCES cases (id),
    FOREIGN KEY (uploaded_by_id) REFERENCES users (id)
);

-- ============================================================
-- audit_logs — append-only log of every state-changing action.
-- The application only ever INSERTs here; no route issues an
-- UPDATE or DELETE against this table.
-- ============================================================
CREATE TABLE audit_logs (
    id          INTEGER NOT NULL,
    user_id     INTEGER NOT NULL,
    case_id     INTEGER,                    -- nullable: some actions (e.g. LOGIN) aren't case-scoped
    action      VARCHAR(100) NOT NULL,      -- LOGIN, CREATE_CASE, UPDATE_CASE, UPLOAD_DOCUMENT, ...
    table_name  VARCHAR(50),
    record_id   INTEGER,
    old_value   TEXT,
    new_value   TEXT,
    ip_address  VARCHAR(50),
    user_agent  VARCHAR(255),
    timestamp   DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (case_id) REFERENCES cases (id)
);

CREATE INDEX ix_audit_logs_timestamp ON audit_logs (timestamp);

-- ============================================================
-- interviews — scheduled interviews for a case (RSD interviews,
-- appeal hearings). Defined in the model layer; not yet exposed
-- through a dedicated API route as of this schema's generation.
-- ============================================================
CREATE TABLE interviews (
    id                 INTEGER NOT NULL,
    case_id            INTEGER NOT NULL,
    officer_id         INTEGER NOT NULL,
    scheduled_date     DATETIME NOT NULL,
    duration_minutes   INTEGER,
    status             VARCHAR(50),   -- Scheduled | Completed | Cancelled
    location           VARCHAR(200),
    is_online          BOOLEAN,
    meeting_link       VARCHAR(255),
    notes              TEXT,
    feedback           TEXT,
    created_at         DATETIME,
    updated_at         DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (case_id)    REFERENCES cases (id),
    FOREIGN KEY (officer_id) REFERENCES users (id)
);

-- ============================================================
-- notifications — in-app/email notifications for a user.
-- Defined in the model layer; not yet exposed through a
-- dedicated API route as of this schema's generation.
-- ============================================================
CREATE TABLE notifications (
    id           INTEGER NOT NULL,
    user_id      INTEGER NOT NULL,
    title        VARCHAR(200) NOT NULL,
    message      TEXT NOT NULL,
    type         VARCHAR(50),    -- Info | Warning | Deadline | ...
    is_read      BOOLEAN,
    is_archived  BOOLEAN,
    created_at   DATETIME,
    read_at      DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);
