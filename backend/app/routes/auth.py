# backend/app/routes/auth.py
# Authentication routes - Login, Register, Forgot Password

from flask import request, jsonify, Blueprint, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User, AuditLog
from datetime import datetime, timedelta
import re
import secrets

auth_bp = Blueprint('auth', __name__)

def is_valid_email(email):
    pattern = r"[^@]+@[^@]+\.[^@]+"
    return re.match(pattern, email) is not None

def log_audit(user_id, action, table_name=None, record_id=None, old_val=None, new_val=None):
    audit = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        old_value=old_val,
        new_value=new_val,
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.add(audit)
    db.session.commit()

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()
    
    required = ['username', 'email', 'password', 'full_name']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    if not is_valid_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 409
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    user = User(
        username=data['username'],
        email=data['email'],
        full_name=data['full_name'],
        role=data.get('role', 'Officer'),
        employee_id=data.get('employee_id')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    log_audit(user.id, 'REGISTER', 'users', user.id, None, f'User {user.username} registered')
    
    return jsonify({'message': 'User created', 'user': user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid request'}), 400
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        # Find user
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Check password
        if not user.check_password(password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account deactivated'}), 403
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create JWT token
        access_token = create_access_token(
    identity=str(user.id)  # Use user ID as a string
)
        
        log_audit(user.id, 'LOGIN', 'users', user.id, None, f'User {user.username} logged in')
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Login error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if user:
        log_audit(user.id, 'LOGOUT', 'users', user.id, None, f'User {user.username} logged out')
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    
    user = User.query.filter_by(email=email).first()
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
        # In production, send email with link: http://localhost:5173/reset-password?token={token}
        current_app.logger.info(f"Password reset link: http://localhost:5173/reset-password?token={token}")
        log_audit(user.id, 'PASSWORD_RESET_REQUEST', 'users', user.id, None, 'Password reset requested')
    return jsonify({'message': 'If an account exists, a reset link has been sent.'}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    
    if not token or not new_password:
        return jsonify({'error': 'Token and new password required'}), 400
    
    user = User.query.filter_by(reset_token=token).first()
    if not user:
        return jsonify({'error': 'Invalid or expired token'}), 400
    if user.reset_token_expiry < datetime.utcnow():
        return jsonify({'error': 'Token expired'}), 400
    
    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()
    
    log_audit(user.id, 'PASSWORD_RESET', 'users', user.id, None, 'Password reset successful')
    return jsonify({'message': 'Password reset successfully'}), 200