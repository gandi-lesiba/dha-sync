# backend/app/utils/seed.py
# Creates default users for testing and initial setup.

from app import db
from app.models import User


def create_default_users():
    """Create default users if they don't exist."""
    
    # Check if any users exist
    if User.query.count() > 0:
        print("Users already exist. Skipping seed.")
        return
    
    # Default users to create
    default_users = [
        {
            'username': 'admin',
            'email': 'admin@dha.gov.za',
            'password': 'Admin123!',
            'full_name': 'System Administrator',
            'employee_id': 'DHA-ADMIN-001',
            'role': 'Admin'
        },
        {
            'username': 'officer1',
            'email': 'officer1@dha.gov.za',
            'password': 'Officer123!',
            'full_name': 'John Smith',
            'employee_id': 'DHA-OFF-001',
            'role': 'Officer'
        },
        {
            'username': 'officer2',
            'email': 'officer2@dha.gov.za',
            'password': 'Officer123!',
            'full_name': 'Sarah Johnson',
            'employee_id': 'DHA-OFF-002',
            'role': 'Officer'
        },
        {
            'username': 'supervisor',
            'email': 'supervisor@dha.gov.za',
            'password': 'Super123!',
            'full_name': 'Michael Brown',
            'employee_id': 'DHA-SUP-001',
            'role': 'Supervisor'
        },
        {
            'username': 'auditor',
            'email': 'auditor@dha.gov.za',
            'password': 'Audit123!',
            'full_name': 'Jane Doe',
            'employee_id': 'DHA-AUD-001',
            'role': 'Auditor'
        },
        {
            'username': 'border_official',
            'email': 'border@dha.gov.za',
            'password': 'Border123!',
            'full_name': 'David Williams',
            'employee_id': 'DHA-BOR-001',
            'role': 'BorderOfficial'
        }
    ]
    
    # Create each user
    for user_data in default_users:
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            full_name=user_data['full_name'],
            employee_id=user_data['employee_id'],
            role=user_data['role'],
            is_active=True,
            is_email_verified=True
        )
        user.set_password(user_data['password'])
        db.session.add(user)
        print(f"Created user: {user_data['username']} ({user_data['role']})")
    
    db.session.commit()
    
    print("\n" + "="*50)
    print("✅ DEFAULT USERS CREATED SUCCESSFULLY!")
    print("="*50)
    print("\n📋 LOGIN CREDENTIALS:")
    print("-" * 40)
    for user_data in default_users:
        print(f"  {user_data['role']:15} | {user_data['username']:15} | {user_data['password']}")
    print("-" * 40)