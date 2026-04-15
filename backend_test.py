#!/usr/bin/env python3
"""
VetBuddy Admin Dashboard Backend API Testing
Tests all admin endpoints with proper authentication and authorization
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test credentials
ADMIN_CREDENTIALS = {
    "email": "admin@vetbuddy.it",
    "password": "Admin2025!"
}

CLINIC_CREDENTIALS = {
    "email": "demo@vetbuddy.it", 
    "password": "VetBuddy2025!Secure"
}

LAB_CREDENTIALS = {
    "email": "laboratorio1@vetbuddy.it",
    "password": "Lab2025!"
}

def print_test_result(test_name, success, details=""):
    """Print formatted test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"    {details}")
    print()

def login_user(credentials):
    """Login and return JWT token"""
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=credentials)
        if response.status_code == 200:
            data = response.json()
            return data.get('token'), data.get('user')
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            return None, None
    except Exception as e:
        print(f"Login error: {e}")
        return None, None

def test_admin_login():
    """Test admin login functionality"""
    print("🔐 Testing Admin Login...")
    
    try:
        token, user = login_user(ADMIN_CREDENTIALS)
        
        if token and user:
            if user.get('role') == 'admin':
                print_test_result("Admin Login", True, f"Successfully logged in as admin: {user.get('email')}")
                return token
            else:
                print_test_result("Admin Login", False, f"User role is {user.get('role')}, expected 'admin'")
                return None
        else:
            print_test_result("Admin Login", False, "Failed to get token or user data")
            return None
            
    except Exception as e:
        print_test_result("Admin Login", False, f"Exception: {e}")
        return None

def test_pilot_applications(admin_token):
    """Test pilot applications endpoint"""
    print("📋 Testing Pilot Applications API...")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    try:
        # Test GET /api/pilot-applications?status=pending
        response = requests.get(f"{BASE_URL}/pilot-applications?status=pending", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if 'applications' in data and 'counts' in data:
                pending_count = len([app for app in data['applications'] if app.get('status') == 'pending'])
                print_test_result("GET /api/pilot-applications?status=pending", True, 
                                f"Found {len(data['applications'])} applications, {pending_count} pending. Counts: {data['counts']}")
                return True
            else:
                print_test_result("GET /api/pilot-applications?status=pending", False, 
                                f"Missing 'applications' or 'counts' in response: {data}")
                return False
        else:
            print_test_result("GET /api/pilot-applications?status=pending", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("GET /api/pilot-applications?status=pending", False, f"Exception: {e}")
        return False

def test_admin_labs(admin_token):
    """Test admin labs endpoint"""
    print("🏥 Testing Admin Labs API...")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    try:
        # Test GET /api/admin/labs
        response = requests.get(f"{BASE_URL}/admin/labs", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                labs_with_stats = [lab for lab in data if 'stats' in lab and 'billing' in lab]
                print_test_result("GET /api/admin/labs", True, 
                                f"Found {len(data)} labs, {len(labs_with_stats)} with stats and billing info")
                
                # Show sample lab data
                if data:
                    sample_lab = data[0]
                    stats = sample_lab.get('stats', {})
                    billing = sample_lab.get('billing', {})
                    print(f"    Sample lab: {sample_lab.get('labName', 'N/A')}")
                    print(f"    Stats: {stats}")
                    print(f"    Billing: {billing}")
                
                return True
            else:
                print_test_result("GET /api/admin/labs", False, f"Expected array, got: {type(data)}")
                return False
        else:
            print_test_result("GET /api/admin/labs", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("GET /api/admin/labs", False, f"Exception: {e}")
        return False

def test_admin_lab_stats(admin_token):
    """Test admin lab stats endpoint"""
    print("📊 Testing Admin Lab Stats API...")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    try:
        # Test GET /api/admin/lab-stats
        response = requests.get(f"{BASE_URL}/admin/lab-stats", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_keys = ['labs', 'billing', 'requests', 'connections', 'reports', 'topLabs', 'requestsByExamType']
            
            missing_keys = [key for key in required_keys if key not in data]
            if not missing_keys:
                print_test_result("GET /api/admin/lab-stats", True, 
                                f"All required fields present: {required_keys}")
                
                # Show key stats
                print(f"    Labs: {data['labs']}")
                print(f"    Requests: {data['requests']}")
                print(f"    Top Labs: {len(data['topLabs'])} entries")
                print(f"    Exam Types: {len(data['requestsByExamType'])} types")
                
                return True
            else:
                print_test_result("GET /api/admin/lab-stats", False, 
                                f"Missing required keys: {missing_keys}")
                return False
        else:
            print_test_result("GET /api/admin/lab-stats", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("GET /api/admin/lab-stats", False, f"Exception: {e}")
        return False

def test_admin_stats(admin_token):
    """Test admin platform stats endpoint"""
    print("📈 Testing Admin Platform Stats API...")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    try:
        # Test GET /api/admin/stats
        response = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for required counts structure
            if 'counts' in data:
                counts = data['counts']
                required_count_fields = ['totalUsers', 'clinics', 'owners', 'pets', 'appointments', 'documents']
                missing_fields = [field for field in required_count_fields if field not in counts]
                
                if not missing_fields:
                    print_test_result("GET /api/admin/stats", True, 
                                    f"All required count fields present")
                    
                    # Show platform stats
                    print(f"    Total Users: {counts['totalUsers']}")
                    print(f"    Clinics: {counts['clinics']}")
                    print(f"    Owners: {counts['owners']}")
                    print(f"    Pets: {counts['pets']}")
                    print(f"    Appointments: {counts['appointments']}")
                    print(f"    Documents: {counts['documents']}")
                    
                    return True
                else:
                    print_test_result("GET /api/admin/stats", False, 
                                    f"Missing count fields: {missing_fields}")
                    return False
            else:
                print_test_result("GET /api/admin/stats", False, 
                                f"Missing 'counts' object in response")
                return False
        else:
            print_test_result("GET /api/admin/stats", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("GET /api/admin/stats", False, f"Exception: {e}")
        return False

def test_admin_users(admin_token):
    """Test admin users endpoint"""
    print("👥 Testing Admin Users API...")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    try:
        # Test GET /api/admin/users
        response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Check that passwords are not included
                users_with_passwords = [user for user in data if 'password' in user]
                
                if not users_with_passwords:
                    print_test_result("GET /api/admin/users", True, 
                                    f"Found {len(data)} users, no passwords exposed")
                    
                    # Show user role breakdown
                    role_counts = {}
                    for user in data:
                        role = user.get('role', 'unknown')
                        role_counts[role] = role_counts.get(role, 0) + 1
                    
                    print(f"    User roles: {role_counts}")
                    return True
                else:
                    print_test_result("GET /api/admin/users", False, 
                                    f"Security issue: {len(users_with_passwords)} users have exposed passwords")
                    return False
            else:
                print_test_result("GET /api/admin/users", False, f"Expected array, got: {type(data)}")
                return False
        else:
            print_test_result("GET /api/admin/users", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("GET /api/admin/users", False, f"Exception: {e}")
        return False

def test_admin_lab_billing(admin_token):
    """Test admin lab billing update endpoint"""
    print("💰 Testing Admin Lab Billing API...")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    try:
        # First get a lab ID from the labs list
        labs_response = requests.get(f"{BASE_URL}/admin/labs", headers=headers)
        if labs_response.status_code != 200:
            print_test_result("POST /api/admin/labs/{labId}/billing", False, 
                            "Could not get lab list to test billing update")
            return False
        
        labs = labs_response.json()
        if not labs:
            print_test_result("POST /api/admin/labs/{labId}/billing", False, 
                            "No labs available to test billing update")
            return False
        
        lab_id = labs[0]['id']
        
        # Test billing update
        billing_data = {
            "extendTrialDays": 30,
            "maxFreeRequests": 100,
            "resetRequestsCount": False,
            "plan": "partner_free"
        }
        
        response = requests.post(f"{BASE_URL}/admin/labs/{lab_id}/billing", 
                               headers=headers, json=billing_data)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'lab' in data:
                print_test_result("POST /api/admin/labs/{labId}/billing", True, 
                                f"Successfully updated billing for lab {lab_id}")
                return True
            else:
                print_test_result("POST /api/admin/labs/{labId}/billing", False, 
                                f"Unexpected response format: {data}")
                return False
        else:
            print_test_result("POST /api/admin/labs/{labId}/billing", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("POST /api/admin/labs/{labId}/billing", False, f"Exception: {e}")
        return False

def test_authorization_controls(admin_token):
    """Test that non-admin users cannot access admin endpoints"""
    print("🔒 Testing Authorization Controls...")
    
    # Test with clinic token
    clinic_token, _ = login_user(CLINIC_CREDENTIALS)
    if not clinic_token:
        print_test_result("Authorization Test Setup", False, "Could not get clinic token")
        return False
    
    # Test with lab token  
    lab_token, _ = login_user(LAB_CREDENTIALS)
    if not lab_token:
        print_test_result("Authorization Test Setup", False, "Could not get lab token")
        return False
    
    admin_endpoints = [
        "/admin/labs",
        "/admin/lab-stats", 
        "/admin/stats",
        "/admin/users"
    ]
    
    unauthorized_tokens = [
        ("clinic", clinic_token),
        ("lab", lab_token)
    ]
    
    all_passed = True
    
    for role, token in unauthorized_tokens:
        headers = {"Authorization": f"Bearer {token}"}
        
        for endpoint in admin_endpoints:
            try:
                response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
                
                if response.status_code == 403:
                    print_test_result(f"{role.upper()} access to {endpoint}", True, 
                                    "Correctly blocked with 403 Forbidden")
                else:
                    print_test_result(f"{role.upper()} access to {endpoint}", False, 
                                    f"Expected 403, got {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                print_test_result(f"{role.upper()} access to {endpoint}", False, f"Exception: {e}")
                all_passed = False
    
    return all_passed

def main():
    """Run all admin API tests"""
    print("🚀 VetBuddy Admin Dashboard Backend API Testing")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Track test results
    test_results = []
    
    # 1. Test admin login
    admin_token = test_admin_login()
    if not admin_token:
        print("❌ Cannot proceed without admin token")
        sys.exit(1)
    
    # 2. Test pilot applications
    result = test_pilot_applications(admin_token)
    test_results.append(("Pilot Applications API", result))
    
    # 3. Test admin labs
    result = test_admin_labs(admin_token)
    test_results.append(("Admin Labs API", result))
    
    # 4. Test admin lab stats
    result = test_admin_lab_stats(admin_token)
    test_results.append(("Admin Lab Stats API", result))
    
    # 5. Test admin platform stats
    result = test_admin_stats(admin_token)
    test_results.append(("Admin Platform Stats API", result))
    
    # 6. Test admin users
    result = test_admin_users(admin_token)
    test_results.append(("Admin Users API", result))
    
    # 7. Test admin lab billing
    result = test_admin_lab_billing(admin_token)
    test_results.append(("Admin Lab Billing API", result))
    
    # 8. Test authorization controls
    result = test_authorization_controls(admin_token)
    test_results.append(("Authorization Controls", result))
    
    # Summary
    print("=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print()
    print(f"Overall Result: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 All admin API tests passed!")
        return 0
    else:
        print(f"⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())