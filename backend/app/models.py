# backend/app/models.py
# Database models - defines the structure of all tables

from app import db
from flask_bcrypt import Bcrypt
from datetime import datetime

bcrypt = Bcrypt()


class User(db.Model):
    """User table - stores all system users with role-based access."""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    employee_id = db.Column(db.String(50), unique=True, nullable=True)
    role = db.Column(db.String(50), nullable=False, default='Officer')
    is_active = db.Column(db.Boolean, default=True)
    is_email_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)

    assigned_cases = db.relationship(
        "Case", backref="assigned_officer", lazy="dynamic",
        foreign_keys="Case.assigned_officer_id"
    )
    created_cases = db.relationship(
        "Case", backref="created_by", lazy="dynamic",
        foreign_keys="Case.created_by_id"
    )
    audit_logs = db.relationship(
        "AuditLog", lazy="dynamic",
        foreign_keys="AuditLog.user_id"
    )

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def has_role(self, role):
        return self.role == role

    def has_any_role(self, roles):
        return self.role in roles

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "employee_id": self.employee_id,
            "role": self.role,
            "is_active": self.is_active,
            "is_email_verified": self.is_email_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None
        }

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"


class Case(db.Model):
    """Case table - stores all immigration/asylum case applications."""
    
    __tablename__ = "cases"
    
    id = db.Column(db.Integer, primary_key=True)
    case_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    reference_number = db.Column(db.String(50), unique=True, nullable=True)
    applicant_full_name = db.Column(db.String(150), nullable=False)
    applicant_surname = db.Column(db.String(100), nullable=False, index=True)
    applicant_given_names = db.Column(db.String(100), nullable=True)
    passport_number = db.Column(db.String(50), nullable=False, index=True)
    national_id = db.Column(db.String(50), nullable=True)
    nationality = db.Column(db.String(100), nullable=False, index=True)
    country_of_birth = db.Column(db.String(100), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(20), nullable=True)
    case_type = db.Column(db.String(50), nullable=False)
    sub_type = db.Column(db.String(50), nullable=True)
    priority = db.Column(db.String(20), default="Normal")
    status = db.Column(db.String(50), default="Pending", index=True)
    application_date = db.Column(db.Date, default=datetime.utcnow().date)
    statutory_deadline = db.Column(db.Date, nullable=True)
    decision_date = db.Column(db.Date, nullable=True)
    assigned_officer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    additional_data = db.Column(db.JSON, nullable=True)

    documents = db.relationship("Document", backref="case", lazy="dynamic", cascade="all, delete-orphan")
    audit_records = db.relationship("AuditLog", backref="case", lazy="dynamic", cascade="all, delete-orphan")
    interviews = db.relationship("Interview", backref="case", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self, include_documents=False):
        data = {
            "id": self.id,
            "case_number": self.case_number,
            "reference_number": self.reference_number,
            "applicant_full_name": self.applicant_full_name,
            "applicant_surname": self.applicant_surname,
            "passport_number": self.passport_number,
            "nationality": self.nationality,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "case_type": self.case_type,
            "sub_type": self.sub_type,
            "status": self.status,
            "priority": self.priority,
            "application_date": self.application_date.isoformat() if self.application_date else None,
            "statutory_deadline": self.statutory_deadline.isoformat() if self.statutory_deadline else None,
            "decision_date": self.decision_date.isoformat() if self.decision_date else None,
            "assigned_officer_id": self.assigned_officer_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
        if self.assigned_officer:
            data["assigned_officer_name"] = self.assigned_officer.full_name
        if include_documents:
            data["documents"] = [doc.to_dict() for doc in self.documents.all()]
        return data

    def __repr__(self):
        return f"<Case {self.case_number} - {self.status}>"


class Document(db.Model):
    """Document table - stores file metadata for uploaded documents."""
    
    __tablename__ = "documents"
    
    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id"), nullable=False)
    uploaded_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=True)
    file_type = db.Column(db.String(50), nullable=True)
    document_type = db.Column(db.String(50), nullable=False)
    ocr_text = db.Column(db.Text, nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    uploader = db.relationship("User", foreign_keys=[uploaded_by_id])
    
    def to_dict(self):
        return {
            "id": self.id,
            "case_id": self.case_id,
            "file_name": self.file_name,
            "file_path": self.file_path,
            "file_size": self.file_size,
            "file_type": self.file_type,
            "document_type": self.document_type,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "uploaded_by": self.uploader.full_name if self.uploader else None
        }


class AuditLog(db.Model):
    """Audit Log table - tracks ALL changes in the system."""
    
    __tablename__ = "audit_logs"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id"), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    table_name = db.Column(db.String(50), nullable=True)
    record_id = db.Column(db.Integer, nullable=True)
    old_value = db.Column(db.Text, nullable=True)
    new_value = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    user = db.relationship("User", foreign_keys=[user_id])
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else None,
            "case_id": self.case_id,
            "case_number": self.case.case_number if self.case else None,
            "action": self.action,
            "table_name": self.table_name,
            "record_id": self.record_id,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "ip_address": self.ip_address,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }


class Interview(db.Model):
    """Interview table - schedules interviews for cases."""
    
    __tablename__ = "interviews"
    
    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id"), nullable=False)
    officer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    scheduled_date = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, default=30)
    status = db.Column(db.String(50), default="Scheduled")
    location = db.Column(db.String(200), nullable=True)
    is_online = db.Column(db.Boolean, default=False)
    meeting_link = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    feedback = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    officer = db.relationship("User", foreign_keys=[officer_id])
    
    def to_dict(self):
        return {
            "id": self.id,
            "case_id": self.case_id,
            "case_number": self.case.case_number if self.case else None,
            "officer_id": self.officer_id,
            "officer_name": self.officer.full_name if self.officer else None,
            "scheduled_date": self.scheduled_date.isoformat() if self.scheduled_date else None,
            "duration_minutes": self.duration_minutes,
            "status": self.status,
            "location": self.location,
            "is_online": self.is_online,
            "meeting_link": self.meeting_link,
            "notes": self.notes,
            "feedback": self.feedback
        }


class Notification(db.Model):
    """Notification table - stores system notifications for users."""
    
    __tablename__ = "notifications"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default="Info")
    is_read = db.Column(db.Boolean, default=False)
    is_archived = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime, nullable=True)
    
    user = db.relationship("User", foreign_keys=[user_id])
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "is_archived": self.is_archived,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "read_at": self.read_at.isoformat() if self.read_at else None
        }