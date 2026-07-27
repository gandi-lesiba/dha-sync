# backend/app/routes/dashboard.py
# Dashboard analytics - stats, charts, and officer productivity

from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Case, User, AuditLog
from datetime import datetime, timedelta
from sqlalchemy import func, case
from collections import defaultdict

dashboard_bp = Blueprint("dashboard", __name__)


def average_processing_days(query):
    """
    Mean days between application_date and decision_date for a filtered
    Case query. Computed in Python rather than SQL (e.g. julianday(),
    which is SQLite-only and would raise on Postgres) so this works
    identically across both database backends.
    """
    pairs = query.with_entities(Case.application_date, Case.decision_date).all()
    diffs = [
        (decision - application).days
        for application, decision in pairs
        if application and decision
    ]
    return round(sum(diffs) / len(diffs), 1) if diffs else 0


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
    completed_query = Case.query.filter(Case.status.in_(["Approved", "Rejected"]))
    if user.role == "Officer":
        completed_query = completed_query.filter_by(assigned_officer_id=user.id)
    avg_days = average_processing_days(completed_query)

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

    # Grouped in Python rather than via strftime() (SQLite-only, raises on
    # Postgres) so this works identically across both database backends.
    rows = Case.query.filter(Case.created_at >= cutoff).with_entities(
        Case.created_at, Case.status
    ).all()

    buckets = defaultdict(lambda: {"total": 0, "approved": 0, "rejected": 0})
    for created_at, status in rows:
        key = created_at.strftime("%Y-%m")
        buckets[key]["total"] += 1
        if status == "Approved":
            buckets[key]["approved"] += 1
        elif status == "Rejected":
            buckets[key]["rejected"] += 1

    result = [
        {"month": month, **counts} for month, counts in sorted(buckets.items())
    ]
    return jsonify(result), 200


@dashboard_bp.route("/countries", methods=["GET"])
@role_required(["Admin", "Supervisor", "Auditor"])
def get_country_stats(user):
    """Country statistics."""
    limit = int(request.args.get("limit", 10))
    # func.sum() on a raw boolean comparison works on SQLite (booleans are
    # just 0/1 there) but raises "function sum(boolean) does not exist" on
    # Postgres. case() produces an explicit 1/0 that both accept.
    data = db.session.query(
        Case.nationality,
        func.count(Case.id).label("total"),
        func.sum(case((Case.status == "Approved", 1), else_=0)).label("approved"),
        func.sum(case((Case.status == "Rejected", 1), else_=0)).label("rejected")
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
        avg_days = average_processing_days(
            cases.filter(Case.status.in_(["Approved", "Rejected"]))
        )
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