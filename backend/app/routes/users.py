# backend/app/routes/users.py
# User management (admin only)

from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, AuditLog
import json

users_bp = Blueprint("users", __name__)


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


@users_bp.route("/", methods=["GET"])
@role_required(["Admin", "Supervisor", "Auditor"])
def get_users(user):
    """Get all users."""
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200


@users_bp.route("/<int:user_id>", methods=["GET"])
@role_required(["Admin", "Supervisor", "Auditor"])
def get_user(user, user_id):
    """Get a specific user."""
    target_user = User.query.get_or_404(user_id)
    return jsonify(target_user.to_dict()), 200


@users_bp.route("/<int:user_id>", methods=["PUT"])
@role_required(["Admin"])
def update_user(user, user_id):
    """Update a user (admin only)."""
    target_user = User.query.get_or_404(user_id)
    data = request.get_json()
    changes = {}

    if "full_name" in data and data["full_name"] != target_user.full_name:
        changes["full_name"] = {"old": target_user.full_name, "new": data["full_name"]}
        target_user.full_name = data["full_name"]

    if "role" in data and data["role"] != target_user.role:
        changes["role"] = {"old": target_user.role, "new": data["role"]}
        target_user.role = data["role"]

    if "is_active" in data and data["is_active"] != target_user.is_active:
        changes["is_active"] = {"old": target_user.is_active, "new": data["is_active"]}
        target_user.is_active = data["is_active"]

    if "employee_id" in data and data["employee_id"] != target_user.employee_id:
        changes["employee_id"] = {"old": target_user.employee_id, "new": data["employee_id"]}
        target_user.employee_id = data["employee_id"]

    if data.get("password"):
        target_user.set_password(data["password"])
        changes["password"] = {"old": "***", "new": "***"}

    db.session.commit()

    if changes:
        audit = AuditLog(
            user_id=user.id,
            action="UPDATE_USER",
            table_name="users",
            record_id=target_user.id,
            old_value=json.dumps({k: v["old"] for k, v in changes.items()}),
            new_value=json.dumps({k: v["new"] for k, v in changes.items()}),
            ip_address=request.remote_addr,
            user_agent=request.headers.get("User-Agent")
        )
        db.session.add(audit)
        db.session.commit()

        return jsonify({"message": "User updated", "changes": changes}), 200

    return jsonify({"message": "No changes made"}), 200


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@role_required(["Admin"])
def delete_user(user, user_id):
    """Delete a user (admin only)."""
    target_user = User.query.get_or_404(user_id)

    if target_user.id == user.id:
        return jsonify({"error": "Cannot delete yourself"}), 403

    audit = AuditLog(
        user_id=user.id,
        action="DELETE_USER",
        table_name="users",
        record_id=target_user.id,
        old_value=json.dumps({"username": target_user.username, "email": target_user.email}),
        new_value=None,
        ip_address=request.remote_addr,
        user_agent=request.headers.get("User-Agent")
    )
    db.session.add(audit)
    db.session.delete(target_user)
    db.session.commit()

    return jsonify({"message": "User deleted"}), 200