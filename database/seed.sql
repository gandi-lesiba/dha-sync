-- DHA-Sync demo data
-- Mirrors backend/app/utils/seed.py, which is what actually creates these
-- accounts on first application startup (create_default_users(), run
-- automatically inside the Flask app factory). Running this file directly
-- against a fresh schema.sql produces the same six accounts.
--
-- Password hashes below are real bcrypt hashes (cost factor 12) for the
-- plaintext passwords documented in README.md — copied from a running
-- instance, not fabricated placeholders. Logging in with the credentials
-- below against a database seeded from this file will work.

INSERT INTO users (username, email, password_hash, full_name, employee_id, role, is_active, is_email_verified)
VALUES
    -- admin / Admin123!
    ('admin', 'admin@dha.gov.za',
     '$2b$12$xUDNooSSag3bqMB42aYdk.SSZwie/V5C8eyiJCzD0Q7a6bZMAC8l2',
     'System Administrator', 'DHA-ADMIN-001', 'Admin', 1, 1),

    -- officer1 / Officer123!
    ('officer1', 'officer1@dha.gov.za',
     '$2b$12$Zo7VoE/W3a9Z/DqiFSs.8OelV7DMnwx764hEpF.sH.isbCEgFcD6m',
     'John Smith', 'DHA-OFF-001', 'Officer', 1, 1),

    -- officer2 / Officer123!
    ('officer2', 'officer2@dha.gov.za',
     '$2b$12$xtdKOmwL3V/ZhO5RaUSVWOy9jcEOzWHEiCP25fzQPe5hgdDtCel1a',
     'Sarah Johnson', 'DHA-OFF-002', 'Officer', 1, 1),

    -- supervisor / Super123!
    ('supervisor', 'supervisor@dha.gov.za',
     '$2b$12$hYGfCuWsnMS7IsvtYGiBDuMUNfiYpUsUnM2FSKsjl2hv1sP5nMIUC',
     'Michael Brown', 'DHA-SUP-001', 'Supervisor', 1, 1),

    -- auditor / Audit123!
    ('auditor', 'auditor@dha.gov.za',
     '$2b$12$8rkSXzh8BFblTXJDmF.cr.fANOaDcjjowWZAKqJBpe8esVonL.L96',
     'Jane Doe', 'DHA-AUD-001', 'Auditor', 1, 1),

    -- border_official / Border123!
    ('border_official', 'border@dha.gov.za',
     '$2b$12$r1g5bkRfrWa93lV5XV6GR.rsxqoSmFeJDirtmiFbE9ah9/f5vihG6',
     'David Williams', 'DHA-BOR-001', 'BorderOfficial', 1, 1);
