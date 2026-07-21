# backend/app/routes/dashboard.py
# Dashboard analytics - stats, charts, and officer productivity

from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Case, User, AuditLog
from datetime import datetime, timedelta
from sqlalchemy import func

dashboard_bp = Blueprint("dashboard", __name__)


def role_required(allowed_roles):
    """
    Decorator to check if user has required role.
    Fetches user from database using string identity (user ID).
    """
    from functools import wraps
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            # get_jwt_identity() now returns a string (user ID)
            user_id_str = get_jwt_identity()
            try:
                user_id = int(user_id_str)
            except ValueError:
                return jsonify({"error": "Invalid user identity"}), 401

            user = User.query.get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404

            if user.role not in allowed_roles:
                return jsonify({"error": "Insufficient permissions"}), 403

            # Pass the user object to the route
            return fn(user, *args, **kwargs)
        return wrapper
    return decorator


@dashboard_bp.route("/stats", methods=["GET"])
@role_required(["Admin", "Supervisor", "Officer", "Auditor"])
def get_stats(user):
    """Get dashboard statistics."""
    query = Case.query

    if user.role == "Officer":
        query = query.filter_by(assigned_officer_id=user.id)

    total = query.count()
    pending = query.filter_by(status="Pending").count()
    under_review = query.filter_by(status="Under Review").count()
    approved = query.filter_by(status="Approved").count()
    rejected = query.filter_by(status="Rejected").count()
    appeals = query.filter_by(status="Appeals").count()
    interview_scheduled = query.filter_by(status="Interview Scheduled").count()

    # Average processing days for completed cases
    avg_days = db.session.query(func.avg(
        func.julianday(Case.decision_date) - func.julianday(Case.application_date)
    )).filter(Case.status.in_(["Approved", "Rejected"]))

    if user.role == "Officer":
        avg_days = avg_days.filter(Case.assigned_officer_id == user.id)

    avg_days = avg_days.scalar()
    avg_days = round(avg_days, 1) if avg_days else 0

    # Overdue cases (past statutory deadline)
    overdue = Case.query.filter(
        Case.statutory_deadline < datetime.utcnow().date(),
        Case.status.notin_(["Approved", "Rejected", "Closed"])
    )
    if user.role == "Officer":
        overdue = overdue.filter_by(assigned_officer_id=user.id)
    overdue = overdue.count()

    return jsonify({
        "total_cases": total,
        "pending": pending,
        "under_review": under_review,
        "approved": approved,
        "rejected": rejected,
        "appeals": appeals,
        "interview_scheduled": interview_scheduled,
        "average_processing_days": avg_days,
        "overdue_cases": overdue
    }), 200


@dashboard_bp.route("/monthly", methods=["GET"])
@role_required(["Admin", "Supervisor", "Auditor"])
def get_monthly_data(user):
    """Monthly application data for charts."""
    months = int(request.args.get("months", 6))
    cutoff = datetime.utcnow() - timedelta(days=months * 30)

    data = db.session.query(
        func.strftime("%Y-%m", Case.created_at).label("month"),
        func.count(Case.id).label("total"),
        func.sum(Case.status == "Approved").label("approved"),
        func.sum(Case.status == "Rejected").label("rejected")
    ).filter(Case.created_at >= cutoff).group_by("month").order_by("month").all()

    result = [{"month": r.month, "total": r.total, "approved": r.approved or 0, "rejected": r.rejected or 0} for r in data]
    return jsonify(result), 200


@dashboard_bp.route("/countries", methods=["GET"])
@role_required(["Admin", "Supervisor", "Auditor"])
def get_country_stats(user):
    """Country statistics."""
    limit = int(request.args.get("limit", 10))
    data = db.session.query(
        Case.nationality,
        func.count(Case.id).label("total"),
        func.sum(Case.status == "Approved").label("approved"),
        func.sum(Case.status == "Rejected").label("rejected")
    ).group_by(Case.nationality).order_by(func.count(Case.id).desc()).limit(limit).all()

    result = []
    for row in data:
        total = row.total or 0
        approved = row.approved or 0
        rejected = row.rejected or 0
        approval_rate = round((approved / total * 100), 1) if total > 0 else 0
        result.append({
            "country": row.nationality,
            "total": total,
            "approved": approved,
            "rejected": rejected,
            "approval_rate": approval_rate
        })
    return jsonify(result), 200


@dashboard_bp.route("/officer-productivity", methods=["GET"])
@role_required(["Admin", "Supervisor", "Auditor"])
def get_officer_productivity(user):
    """Officer productivity metrics."""
    officers = User.query.filter(User.role.in_(["Officer", "Supervisor"])).all()
    result = []
    for officer in officers:
        cases = Case.query.filter_by(assigned_officer_id=officer.id)
        total = cases.count()
        if total == 0:
            continue
        approved = cases.filter_by(status="Approved").count()
        rejected = cases.filter_by(status="Rejected").count()
        pending = cases.filter_by(status="Pending").count()
        avg_days = db.session.query(func.avg(
            func.julianday(Case.decision_date) - func.julianday(Case.application_date)
        )).filter(Case.assigned_officer_id == officer.id,
                  Case.status.in_(["Approved", "Rejected"])).scalar()
        avg_days = round(avg_days, 1) if avg_days else 0
        result.append({
            "officer_id": officer.id,
            "full_name": officer.full_name,
            "username": officer.username,
            "total_cases": total,
            "approved": approved,
            "rejected": rejected,
            "pending": pending,
            "avg_processing_days": avg_days
        })
    result.sort(key=lambda x: x["total_cases"], reverse=True)
    return jsonify(result), 200


@dashboard_bp.route("/overdue", methods=["GET"])
@role_required(["Admin", "Supervisor", "Officer"])
def get_overdue_cases(user):
    """Get cases past their statutory deadline."""
    query = Case.query.filter(
        Case.statutory_deadline < datetime.utcnow().date(),
        Case.status.notin_(["Approved", "Rejected", "Closed"])
    )
    if user.role == "Officer":
        query = query.filter_by(assigned_officer_id=user.id)

    cases = query.order_by(Case.statutory_deadline.asc()).limit(50).all()
    result = []
    for case in cases:
        days_overdue = (datetime.utcnow().date() - case.statutory_deadline).days
        result.append({**case.to_dict(), "days_overdue": days_overdue})

    return jsonify(result), 200