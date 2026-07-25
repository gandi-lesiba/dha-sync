# backend/app/routes/cases.py
# Case management routes - CRUD operations, search, filtering

from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Case, User, AuditLog
from datetime import datetime
import json
from sqlalchemy import or_

cases_bp = Blueprint("cases", __name__)


def log_audit(user_id, case_id, action, table_name, record_id, old_val, new_val):
    """Helper to create audit log entries."""
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


@cases_bp.route("/", methods=["GET"])
@role_required(["Admin", "Supervisor", "Officer", "Auditor", "BorderOfficial"])
def get_cases(user):
    """Get all cases with search and filtering."""
    print("Received Authorization Header:", request.headers.get("Authorization"))

    query = Case.query

    # Search
    search_term = request.args.get("search", "").strip()
    if search_term:
        query = query.filter(
            or_(
                Case.case_number.ilike(f"%{search_term}%"),
                Case.passport_number.ilike(f"%{search_term}%"),
                Case.applicant_surname.ilike(f"%{search_term}%"),
                Case.nationality.ilike(f"%{search_term}%"),
                Case.applicant_full_name.ilike(f"%{search_term}%")
            )
        )

    # Filters
    status_filter = request.args.get("status")
    if status_filter:
        query = query.filter_by(status=status_filter)

    officer_filter = request.args.get("officer_id")
    if officer_filter:
        query = query.filter_by(assigned_officer_id=officer_filter)

    case_type_filter = request.args.get("case_type")
    if case_type_filter:
        query = query.filter_by(case_type=case_type_filter)

    priority_filter = request.args.get("priority")
    if priority_filter:
        query = query.filter_by(priority=priority_filter)

    # Role-based visibility
    if user.role == "Officer":
        query = query.filter_by(assigned_officer_id=user.id)

    # Sorting
    sort_by = request.args.get("sort_by", "created_at")
    sort_order = request.args.get("sort_order", "desc")
    if sort_order == "asc":
        query = query.order_by(getattr(Case, sort_by).asc())
    else:
        query = query.order_by(getattr(Case, sort_by).desc())

    # Pagination
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    # Audit log for search
    if search_term or status_filter or officer_filter:
        log_audit(user.id, None, "SEARCH_CASES", "cases", None,
                  None, f"Search: {search_term}, Status: {status_filter}")

    return jsonify({
        "cases": [case.to_dict() for case in paginated.items],
        "total": paginated.total,
        "page": page,
        "per_page": per_page,
        "pages": paginated.pages
    }), 200


@cases_bp.route("/<int:case_id>", methods=["GET"])
@role_required(["Admin", "Supervisor", "Officer", "Auditor", "BorderOfficial"])
def get_case(user, case_id):
    """Get a single case by ID."""
    case = Case.query.get_or_404(case_id)
    if user.role == "Officer" and case.assigned_officer_id != user.id:
        return jsonify({"error": "Access denied"}), 403

    log_audit(user.id, case.id, "VIEW_CASE", "cases", case.id,
              None, f"Viewed case {case.case_number}")
    return jsonify(case.to_dict(include_documents=True)), 200


@cases_bp.route("/", methods=["POST"])
@role_required(["Admin", "Supervisor", "Officer"])
def create_case(user):
    """Create a new case."""
    data = request.get_json()
    required = ["applicant_full_name", "passport_number", "nationality", "case_type"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Generate case number
    last_case = Case.query.order_by(Case.id.desc()).first()
    next_id = (last_case.id + 1) if last_case else 1
    case_number = f"DHA-{datetime.utcnow().year}-{str(next_id).zfill(4)}"

    # Parse date of birth
    dob = None
    if data.get("date_of_birth"):
        try:
            dob = datetime.strptime(data["date_of_birth"], "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    # Parse statutory deadline (optional)
    statutory_deadline = None
    if data.get("statutory_deadline"):
        try:
            statutory_deadline = datetime.strptime(data["statutory_deadline"], "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid statutory_deadline format. Use YYYY-MM-DD"}), 400

    # Assigned officer is an optional FK — treat "" the same as not provided.
    # An officer registering a case defaults to being assigned to their own
    # case, otherwise they'd immediately get a 403 viewing what they just created.
    assigned_officer_id = data.get("assigned_officer_id") or None
    if not assigned_officer_id and user.role == "Officer":
        assigned_officer_id = user.id

    new_case = Case(
        case_number=case_number,
        reference_number=data.get("reference_number"),
        applicant_full_name=data["applicant_full_name"],
        applicant_surname=data.get("applicant_surname", data["applicant_full_name"].split()[-1]),
        applicant_given_names=data.get("applicant_given_names"),
        passport_number=data["passport_number"],
        national_id=data.get("national_id"),
        nationality=data["nationality"],
        country_of_birth=data.get("country_of_birth"),
        date_of_birth=dob,
        gender=data.get("gender"),
        case_type=data.get("case_type"),
        sub_type=data.get("sub_type"),
        priority=data.get("priority", "Normal"),
        assigned_officer_id=assigned_officer_id,
        created_by_id=user.id,
        statutory_deadline=statutory_deadline
    )
    db.session.add(new_case)
    db.session.commit()

    log_audit(user.id, new_case.id, "CREATE_CASE", "cases", new_case.id,
              None, {"case_number": case_number, "applicant": new_case.applicant_full_name})

    return jsonify({"message": "Case created", "case_number": case_number, "id": new_case.id}), 201


@cases_bp.route("/<int:case_id>", methods=["PUT"])
@role_required(["Admin", "Supervisor", "Officer"])
def update_case(user, case_id):
    """Update a case (status, priority, assigned officer)."""
    case = Case.query.get_or_404(case_id)
    if user.role == "Officer" and case.assigned_officer_id != user.id:
        return jsonify({"error": "You are not assigned to this case"}), 403

    data = request.get_json()
    changes = {}
    allowed = ["status", "priority", "assigned_officer_id", "decision_date"]
    for field in allowed:
        if field in data:
            new_val = data[field]
            if field == "assigned_officer_id":
                new_val = new_val or None
            elif field == "decision_date" and new_val:
                try:
                    new_val = datetime.strptime(new_val, "%Y-%m-%d").date()
                except ValueError:
                    return jsonify({"error": "Invalid decision_date format. Use YYYY-MM-DD"}), 400
            elif field == "decision_date":
                new_val = None

            old_val = getattr(case, field)
            if old_val != new_val:
                changes[field] = {
                    "old": old_val.isoformat() if hasattr(old_val, "isoformat") else old_val,
                    "new": new_val.isoformat() if hasattr(new_val, "isoformat") else new_val,
                }
                setattr(case, field, new_val)

    if "status" in data and data["status"] in ["Approved", "Rejected"]:
        case.decision_date = datetime.utcnow().date()
        changes["decision_date"] = {"old": None, "new": case.decision_date.isoformat()}

    db.session.commit()
    if changes:
        log_audit(user.id, case.id, "UPDATE_CASE", "cases", case.id,
                  {k: v["old"] for k, v in changes.items()},
                  {k: v["new"] for k, v in changes.items()})

    return jsonify({"message": "Case updated", "changes": changes}), 200


@cases_bp.route("/<int:case_id>", methods=["DELETE"])
@role_required(["Admin", "Supervisor"])
def delete_case(user, case_id):
    """Delete a case (admin/supervisor only)."""
    case = Case.query.get_or_404(case_id)
    log_audit(user.id, case.id, "DELETE_CASE", "cases", case.id,
              {"case_number": case.case_number}, None)
    db.session.delete(case)
    db.session.commit()
    return jsonify({"message": "Case deleted"}), 200