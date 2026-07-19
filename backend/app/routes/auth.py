# Authentication routes

from flask import request, jsonify, Blueprint, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User, AuditLog
from datetime import datetime, timedelta
import re
import secrets

auth_bp = Blueprint("auth", __name__)

def is_valid_email(email):
    """Simple email validation using regex."""
    pattern = r"[^@]+@[^@]+\.[^@]+"
    return re.match(pattern,email) is not None

def log_audit(user_id, action, table_name=None, record_id=None, old_val=None, new_val=None):
    """Helper function to  create audit log entries."""
    audit = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        old_value=old_val,
        new_value=new_val,
        ip_address=request.remote_addr,
        user_agent=request.hehaders.get("User-Agent")
    )
    db.session.add(audit)
    db.session.commit()

@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user."""
    data = request.get_json()

    # Validate required fields
    required_fields = ["username", "email", "password", "full_name"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing requred field: {field}"}), 400
            
    # Validate email format
    if not is_valid_email(data["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    # Check if username or email already exists
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already taken"}), 409

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    # Create new user
    user = User(
        username=data["username"],
        email=data["email"],
        full_name=data["full_name"],
        role=data.get("role", "Officer"),
        employee_id=data.get("employee_id")
    )
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    log_audit(user.id, "REGISTER", "users", user.id, None, f"User {user.username} registerd")

    return jsonify({
        "message": "User created successfully",
        "user": user.to_dict()
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    """Login user and return JWT token."""
    data = request.get_json()

    if not data.get("username") or not data.get("password"):
        return jsonify({"error": "Username and password required"}), 400

    user = User.query.filter_by(username=data["username"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid username or password"}), 401

    if not user.is_active:
        return jsonify({"error": "Account is deactivated. Contact admin."}), 403

    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()

    # Create JWT token
    access_token = create_access_token(
        identity={
            "id": user.id,
            "useername": user.username,
            "role": user.role
        }
    )

    log_audit(user.id, "LOGIN", "users", user.id, None, f"User {user.username} logged in")

    return jsonify({
        "access_token": access_token,
        "user": user.to_dict()
    }), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Get current authenticated user's details."""
    current_user = get_jwt_identity()
    user = User.query.get(current_user["id"])

    if not user:
        return jsonify({"error": "User not found"}), 404

    log_audit(user.id, "VIEW_PROFILE", "users", user.id, None, "User view own pprofile")

    return jsonify(user.to_dict()), 200

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Lgout user."""
    current_user = get_jwt_identity()
    user = User.query.get(current_user["id"])

    if user:
        log_audit(user.id, "LOGOUT", "users", user.id, None, f"User {user.username} logged out")

    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Send password reset link"""
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "If an account exists, a reset link has been sent."}), 200

    # Generate reset token
    token = secrets.token_urlsafee(32)
    user.reset_token = token
    user.reset_tooken_expiry = datetime.utcnow() + timedelta(hours=1)
    db.session.ccommit()

    reset_link = f"http://localhost:5173/reset-password?token={token}"
    current_app.logger.info(f"Password reset link: {reset_link}")

    log_audit(user.id, "PASSSWORD_RESET_REQUEST", "users", user.id, None, "Password reset requested")

    return jsonify({"message": "if an account exists, a reset link has been sent."}), 200

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """Reset password using token.""" 
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("new_password")

    if not token or not new_password:
        return jsonify({"error": " Token and new password required"}), 400

    user = User.query.filter_by(reset_token=token).first()

    if not user:
        return jsonify({"error": "Invalid or expired token"}), 400

    if user.reset_token_expiry < datetime.utcnow():
        return jsonify({"error": "Token has expired"}), 400

    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()

    log_audit(user.id, "PASSWORD_RESET", "users", user.id, None, "Password reset successfully")

    return jsonify({"message": "Password reset successfully"}), 200  
