# backend/app/routes/audit.py
# Audit log viewing

from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import AuditLog, User

audit_bp = Blueprint("audit", __name__)


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

            return fn(user, *args, **kwargs)
        return wrapper
    return decorator


@audit_bp.route("/", methods=["GET"])
@role_required(["Admin", "Supervisor", "Auditor"])
def get_audit_logs(current_user):
    """Get audit logs with filters."""
    query = AuditLog.query
    
    user_id = request.args.get("user_id")
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    action = request.args.get("action")
    if action:
        query = query.filter_by(action=action)  
    
    case_id = request.args.get("case_id")
    if case_id:
        query = query.filter_by(case_id=case_id)

    limit = int(request.args.get("limit", 100))
    query = query.order_by(AuditLog.timestamp.desc()).limit(limit)
    
    return jsonify([log.to_dict() for log in query.all()]), 200


@audit_bp.route("/case/<int:case_id>", methods=["GET"]) 
@role_required(["Admin", "Supervisor", "Officer", "Auditor"])
def get_case_audit(current_user, case_id):
    """Get audit logs for a specific case."""
    query = AuditLog.query.filter_by(case_id=case_id).order_by(AuditLog.timestamp.desc()).limit(100)
    return jsonify([log.to_dict() for log in query.all()]), 200  


@audit_bp.route("/user/<int:user_id>", methods=["GET"])  
@role_required(["Admin", "Supervisor", "Auditor"])
def get_user_audit(current_user, user_id):
    """Get audit logs for a specific user."""
    query = AuditLog.query.filter_by(user_id=user_id).order_by(AuditLog.timestamp.desc()).limit(100)
    return jsonify([log.to_dict() for log in query.all()]), 200  


@audit_bp.route("/actions", methods=["GET"])
@role_required(["Admin", "Supervisor", "Auditor"])
def get_actions(current_user):
    """Get list of all unique actions."""
    actions = db.session.query(AuditLog.action).distinct().all()
    return jsonify([a[0] for a in actions]), 200