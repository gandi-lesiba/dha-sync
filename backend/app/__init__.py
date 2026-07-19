# backend/app/__init__.py
# Application Factory - creates and configures the Flask app.

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from dotenv import load_dotenv
from datetime import timedelta
import logging
from logging.handlers import RotatingFileHandler

# Load environment variables
load_dotenv()

# Initialize extensions (but don't bind to app yet)
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
mail = Mail()
cors = CORS()


def create_app():
    """Application factory - creates and configures the Flask app."""
    
    # Create Flask instance
    app = Flask(__name__)

    # Database with absolute path
    basedir = os.path.abspath(os.path.dirname(__file__))  
    backend_dir = os.path.dirname(basedir)
    instance_dir = os.path.join(backend_dir, "instance")
    os.makedirs(instance_dir, exist_ok=True)
    db_path = os.path.join(instance_dir, "dha_sync.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"

    # --- Configuration ---
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # JWT
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'

    # Mail
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True') == 'True'
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME')

    # CORS
    cors.init_app(app, origins=[os.environ.get('FRONTEND_URL', 'http://localhost:5173')])

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)

    # --- Logging ---
    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = RotatingFileHandler('logs/dha_sync.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('DHA-Sync application started.')

      # --- Blueprints ---
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

      # --- Error Handlers ---
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Resource not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Server Error: {error}')
        return {'error': 'Internal server error'}, 500

    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return {'error': 'Missing or invalid authentication token'}, 401

    @jwt.invalid_token_loader
    def invalid_token_response(callback):
        return {'error': 'Invalid authentication token'}, 401

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_data):
        return {'error': 'Token has expired. Please login again.'}, 401

    # --- Create tables and seed users ---
    with app.app_context():
        from app import models
        db.create_all()
        try:
            from app.utils.seed import create_default_users
            create_default_users()
        except ImportError:
            app.logger.info('Seed module not found. Skipping default user creation.')

    # --- Health check endpoint ---
    @app.route('/health', methods=['GET'])
    def health_check():
        return {'status': 'ok', 'message': 'DHA-Sync API is running'}, 200

    # --- Return the configured app ---
    return app




