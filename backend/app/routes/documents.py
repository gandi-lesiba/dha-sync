# backend/app/routes/documents.py
# Document upload and management

from flask import request, jsonify, Blueprint, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity  
from app import db  
from app.models import Document, Case, AuditLog  
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime

documents_bp = Blueprint("documents", __name__)

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "doc", "docx", "txt"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def log_audit(user_id, case_id, action, table_name, record_id, old_val, new_val):
    audit = AuditLog(
        user_id=user_id,
        case_id=case_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        old_value=json.dumps(old_val) if old_val else None,
        new_value=json.dumps(new_val) if new_val else None,
        ip_address=request.remote_addr,
        user_agent=request.headers.get("User-Agent")
    )
    db.session.add(audit)
    db.session.commit()


def role_required(allowed_roles):
    from functools import wraps
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user = get_jwt_identity()
            if current_user["role"] not in allowed_roles:
                return jsonify({"error": "Insufficient permissions"}), 403
            return fn(current_user, *args, **kwargs)
        return wrapper
    return decorator


@documents_bp.route("/upload", methods=["POST"])
@role_required(["Admin", "Supervisor", "Officer"])
def upload_document(current_user):
    """Upload a document for a case.""" 
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    case_id = request.form.get("case_id")
    document_type = request.form.get("document_type", "Other")  # added this line

    if not case_id:  # FIXED: was checking "case" instead of "case_id"
        return jsonify({"error": "case_id required"}), 400

    # Verify case exists
    case = Case.query.get(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    # Create upload directory
    upload_dir = os.path.join("instance", "uploads", str(case_id))
    os.makedirs(upload_dir, exist_ok=True)

    # Save file
    original_filename = secure_filename(file.filename)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{original_filename}"  # removed extra space
    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)

    # Create document record
    doc = Document(
        case_id=case_id,
        uploaded_by_id=current_user["id"],
        file_name=original_filename,
        file_path=file_path,
        file_size=os.path.getsize(file_path),  # FIXED: getsisze → getsize
        file_type=file.content_type,
        document_type=document_type  # FIXED: now defined
    )
    db.session.add(doc)
    db.session.commit()  # FIXED: sessiom → session

    log_audit(current_user["id"], case_id, "UPLOAD_DOCUMENT", "documents", doc.id,
              None, {"file_name": original_filename, "document_type": document_type}) 

    return jsonify({"message": "Document uploaded", "document_id": doc.id}), 201


@documents_bp.route("/case/<int:case_id>", methods=["GET"]) 
@role_required(["Admin", "Supervisor", "Officer", "Auditor", "BorderOfficial"])
def get_case_documents(current_user, case_id):
    """Get all documents for a case."""
    case = Case.query.get_or_404(case_id)
    if current_user["role"] == "Officer" and case.assigned_officer_id != current_user["id"]:
        return jsonify({"error": "Access denied"}), 403

    docs = Document.query.filter_by(case_id=case_id).order_by(Document.uploaded_at.desc()).all()  # FIXED: upload_at → uploaded_at
    return jsonify([doc.to_dict() for doc in docs]), 200


@documents_bp.route("/<int:document_id>", methods=["DELETE"])
@role_required(["Admin", "Supervisor", "Officer"])
def delete_document(current_user, document_id):
    """Delete a document."""
    doc = Document.query.get_or_404(document_id)

    if current_user["role"] == "Officer" and doc.uploaded_by_id != current_user["id"]:
        return jsonify({"error": "Cannot delete other users' documents"}), 403  # FIXED: removed escaped quotes

    # Delete file from disk
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    case_id = doc.case_id
    log_audit(current_user["id"], case_id, "DELETE_DOCUMENT", "documents", doc.id,
              {"file_name": doc.file_name}, None)
    db.session.delete(doc)
    db.session.commit()
    return jsonify({"message": "Document deleted"}), 200