import requests

print("=" * 60)
print("🧪 DHA-Sync API Test Suite")
print("=" * 60)


# 1. Test Health Check

print("\n📡 1. Testing Health Check...")
try:
    health = requests.get('http://localhost:5000/health', timeout=5)
    print(f"   Status: {health.status_code}")
    print(f"   Response: {health.json()}")
except requests.exceptions.ConnectionError:
    print("   ❌ ERROR: Server not running! Start with: python run.py")
    exit(1)


# 2. Test Login

print("\n🔐 2. Testing Login...")
login = requests.post(
    'http://localhost:5000/api/auth/login',
    json={'username': 'admin', 'password': 'Admin123!'}
)

if login.status_code == 200:
    token = login.json()['access_token']
    print(f"✅ Login successful!")
    print(f"Full Token: {token}")
    print(f"Token length: {len(token)}")
    headers = {'Authorization': f'Bearer {token}'}
    print(f"Authorization Header: {headers['Authorization']}")
else:
    print(f"   ❌ Login failed: {login.status_code}")
    print(f"   Response: {login.json()}")
    exit(1)


# 3. Test Create Case

print("\n📋 3. Testing Create Case...")
new_case = {
    "applicant_full_name": "Test Applicant",
    "passport_number": "TEST-12345",
    "nationality": "Testland",
    "case_type": "Visa",
    "date_of_birth": "1990-01-01"
}

create = requests.post(
    'http://localhost:5000/api/cases',
    json=new_case,
    headers=headers
)

if create.status_code == 201:
    print(f"   ✅ Case created!")
    case_data = create.json()
    print(f"   Case Number: {case_data.get('case_number')}")
    case_id = case_data.get('id')
else:
    print(f"   ❌ Create failed: {create.status_code}")
    print(f"   Response: {create.json()}")


# 4. Test Get All Cases

print("\n📋 4. Testing Get All Cases...")
get_all = requests.get('http://localhost:5000/api/cases', headers=headers)

if get_all.status_code == 200:
    data = get_all.json()
    print(f"   ✅ Success!")
    print(f"   Total Cases: {data.get('total', 0)}")
    print(f"   Cases returned: {len(data.get('cases', []))}")
else:
    print(f"   ❌ Failed: {get_all.status_code}")


# 5. Test Dashboard Stats

print("\n📊 5. Testing Dashboard Stats...")
stats = requests.get('http://localhost:5000/api/dashboard/stats', headers=headers)

if stats.status_code == 200:
    data = stats.json()
    print(f"   ✅ Success!")
    print(f"   Total Cases: {data.get('total_cases', 0)}")
    print(f"   Pending: {data.get('pending', 0)}")
    print(f"   Approved: {data.get('approved', 0)}")
    print(f"   Rejected: {data.get('rejected', 0)}")
else:
    print(f"   ❌ Failed: {stats.status_code}")


# 6. Test Get Users (Admin only)

print("\n👥 6. Testing Get Users...")
users = requests.get('http://localhost:5000/api/users', headers=headers)

if users.status_code == 200:
    data = users.json()
    print(f"   ✅ Success!")
    print(f"   Total Users: {len(data)}")
    for user in data[:3]:
        print(f"   - {user.get('username')} ({user.get('role')})")
else:
    print(f"   ❌ Failed: {users.status_code}")


# Summary

print("\n" + "=" * 60)
print("✅ API Test Complete!")
print("=" * 60)