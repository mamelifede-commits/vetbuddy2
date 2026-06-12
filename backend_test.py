#!/usr/bin/env python3
"""
VetBuddy Backend Regression Test Suite
Test di regressione dopo fix alias GET /api/rewards e GET /api/settings
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"
OWNER_EMAIL = "proprietario.demo@vetbuddy.it"
OWNER_PASSWORD = "demo123"
LAB_EMAIL = "laboratorio1@vetbuddy.it"
LAB_PASSWORD = "Lab2025!"

# Global tokens
clinic_token = None
owner_token = None
lab_token = None

def print_test(test_name):
    """Print test name"""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print('='*80)

def print_result(success, message):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    return success

def login_user(email, password, role_name):
    """Login and return token"""
    print_test(f"Login {role_name}")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            if token:
                print_result(True, f"{role_name} login successful, token received")
                return token
            else:
                print_result(False, f"{role_name} login response missing token")
                return None
        else:
            print_result(False, f"{role_name} login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print_result(False, f"{role_name} login exception: {str(e)}")
        return None

def test_new_alias_rewards():
    """Test 1: NEW ALIAS GET /api/rewards"""
    print_test("1) NEW ALIAS: GET /api/rewards")
    
    # Test 1a: Without auth -> 401
    print("\n1a) GET /api/rewards without auth -> 401")
    try:
        response = requests.get(f"{BASE_URL}/rewards", timeout=10)
        if response.status_code == 401:
            print_result(True, f"Correctly returns 401 without auth")
        else:
            print_result(False, f"Expected 401, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 1b: With clinic token -> 200 with types and assigned
    print("\n1b) GET /api/rewards with clinic token -> 200 { success, types, assigned }")
    try:
        response = requests.get(
            f"{BASE_URL}/rewards",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'types' in data and 'assigned' in data:
                # Check no MongoDB _id in arrays
                has_mongo_id = False
                for item in data.get('types', []):
                    if '_id' in item:
                        has_mongo_id = True
                        break
                for item in data.get('assigned', []):
                    if '_id' in item:
                        has_mongo_id = True
                        break
                
                if has_mongo_id:
                    print_result(False, f"Response contains MongoDB _id fields (should be removed)")
                else:
                    print_result(True, f"Correct structure: success={data.get('success')}, types={len(data.get('types', []))}, assigned={len(data.get('assigned', []))}, no _id fields")
            else:
                print_result(False, f"Missing required fields. Got: {list(data.keys())}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 1c: With owner token -> 200 with rewards
    print("\n1c) GET /api/rewards with owner token -> 200 { success, rewards }")
    try:
        response = requests.get(
            f"{BASE_URL}/rewards",
            headers={"Authorization": f"Bearer {owner_token}"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'rewards' in data:
                # Check no MongoDB _id
                has_mongo_id = False
                for item in data.get('rewards', []):
                    if '_id' in item:
                        has_mongo_id = True
                        break
                
                if has_mongo_id:
                    print_result(False, f"Response contains MongoDB _id fields (should be removed)")
                else:
                    print_result(True, f"Correct structure: success={data.get('success')}, rewards={len(data.get('rewards', []))}, no _id fields")
            else:
                print_result(False, f"Missing required fields. Got: {list(data.keys())}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

def test_new_alias_settings():
    """Test 2: NEW ALIAS GET /api/settings"""
    print_test("2) NEW ALIAS: GET /api/settings")
    
    # Test 2a: Without auth -> 401
    print("\n2a) GET /api/settings without auth -> 401")
    try:
        response = requests.get(f"{BASE_URL}/settings", timeout=10)
        if response.status_code == 401:
            print_result(True, f"Correctly returns 401 without auth")
        else:
            print_result(False, f"Expected 401, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 2b: With clinic token -> 200 with settings
    print("\n2b) GET /api/settings with clinic token -> 200 { success, settings }")
    try:
        response = requests.get(
            f"{BASE_URL}/settings",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'settings' in data:
                settings = data.get('settings', {})
                required_fields = ['clinicName', 'email', 'phone', 'plan', 'automationSettings']
                missing_fields = [f for f in required_fields if f not in settings]
                
                if missing_fields:
                    print_result(False, f"Missing required fields in settings: {missing_fields}")
                else:
                    automation_settings = settings.get('automationSettings', {})
                    automation_count = len(automation_settings)
                    print_result(True, f"Correct structure: success={data.get('success')}, clinicName={settings.get('clinicName')}, email={settings.get('email')}, phone={settings.get('phone')}, plan={settings.get('plan')}, automationSettings keys={automation_count}")
            else:
                print_result(False, f"Missing required fields. Got: {list(data.keys())}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 2c: With owner token -> 401
    print("\n2c) GET /api/settings with owner token -> 401")
    try:
        response = requests.get(
            f"{BASE_URL}/settings",
            headers={"Authorization": f"Bearer {owner_token}"},
            timeout=10
        )
        if response.status_code == 401:
            print_result(True, f"Correctly returns 401 for owner role")
        else:
            print_result(False, f"Expected 401, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

def test_regression_rewards_endpoints():
    """Test 3: REGRESSION - Existing rewards endpoints"""
    print_test("3) REGRESSION: Existing rewards endpoints")
    
    # Test 3a: GET /api/rewards/types (clinic)
    print("\n3a) GET /api/rewards/types (clinic) -> 200 array")
    try:
        response = requests.get(
            f"{BASE_URL}/rewards/types",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_result(True, f"Returns array with {len(data)} reward types")
            else:
                print_result(False, f"Expected array, got {type(data)}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 3b: GET /api/rewards/assigned (clinic)
    print("\n3b) GET /api/rewards/assigned (clinic) -> 200 array")
    try:
        response = requests.get(
            f"{BASE_URL}/rewards/assigned",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_result(True, f"Returns array with {len(data)} assigned rewards")
            else:
                print_result(False, f"Expected array, got {type(data)}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 3c: GET /api/rewards/my-rewards (owner)
    print("\n3c) GET /api/rewards/my-rewards (owner) -> 200 array")
    try:
        response = requests.get(
            f"{BASE_URL}/rewards/my-rewards",
            headers={"Authorization": f"Bearer {owner_token}"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_result(True, f"Returns array with {len(data)} owner rewards")
            else:
                print_result(False, f"Expected array, got {type(data)}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

def test_regression_settings_endpoints():
    """Test 4: REGRESSION - Existing settings endpoints"""
    print_test("4) REGRESSION: Existing settings endpoints")
    
    # Test 4a: GET /api/automations/settings (clinic)
    print("\n4a) GET /api/automations/settings (clinic) -> 200 with settings")
    try:
        response = requests.get(
            f"{BASE_URL}/automations/settings",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'settings' in data:
                print_result(True, f"Returns settings with success={data.get('success')}, plan={data.get('plan')}")
            else:
                print_result(False, f"Missing required fields. Got: {list(data.keys())}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 4b: GET /api/services (public)
    print("\n4b) GET /api/services (public) -> 200 catalog")
    try:
        response = requests.get(f"{BASE_URL}/services", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict):
                print_result(True, f"Returns services catalog with {len(data)} categories")
            else:
                print_result(False, f"Expected object, got {type(data)}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 4c: GET /api/services/flat (public)
    print("\n4c) GET /api/services/flat (public) -> 200 array")
    try:
        response = requests.get(f"{BASE_URL}/services/flat", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_result(True, f"Returns flat services array with {len(data)} services")
            else:
                print_result(False, f"Expected array, got {type(data)}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

def test_general_smoke():
    """Test 5: GENERAL SMOKE tests"""
    print_test("5) GENERAL SMOKE: Core endpoints")
    
    # Test 5a: GET /api/auth/me (clinic)
    print("\n5a) GET /api/auth/me (clinic) -> 200")
    try:
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Returns user data: role={data.get('role')}, email={data.get('email')}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 5b: GET /api/appointments (clinic)
    print("\n5b) GET /api/appointments (clinic) -> 200")
    try:
        response = requests.get(
            f"{BASE_URL}/appointments",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_result(True, f"Returns appointments array with {len(data)} items")
            else:
                print_result(False, f"Expected array, got {type(data)}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 5c: GET /api/tasks (clinic)
    print("\n5c) GET /api/tasks (clinic) -> 200")
    try:
        response = requests.get(
            f"{BASE_URL}/tasks",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'tasks' in data:
                print_result(True, f"Returns tasks with success={data.get('success')}, count={len(data.get('tasks', []))}")
            else:
                print_result(False, f"Missing required fields. Got: {list(data.keys())}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 5d: GET /api/previsit (clinic)
    print("\n5d) GET /api/previsit (clinic) -> 200")
    try:
        response = requests.get(
            f"{BASE_URL}/previsit",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'questionnaires' in data:
                print_result(True, f"Returns previsit with success={data.get('success')}, questionnaires={len(data.get('questionnaires', []))}")
            else:
                print_result(False, f"Missing required fields. Got: {list(data.keys())}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 5e: GET /api/inventory (clinic)
    print("\n5e) GET /api/inventory (clinic) -> 200")
    try:
        response = requests.get(
            f"{BASE_URL}/inventory",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'items' in data:
                print_result(True, f"Returns inventory with success={data.get('success')}, items={len(data.get('items', []))}")
            else:
                print_result(False, f"Missing required fields. Got: {list(data.keys())}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 5f: GET /api/labs (clinic)
    print("\n5f) GET /api/labs (clinic) -> 200")
    try:
        response = requests.get(
            f"{BASE_URL}/labs",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_result(True, f"Returns labs array with {len(data)} items")
            else:
                print_result(False, f"Expected array, got {type(data)}")
        else:
            print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

def test_frontend_pages():
    """Test 6: Frontend pages (simple GET HTML)"""
    print_test("6) FRONTEND PAGES: Homepage and Login")
    
    # Test 6a: GET / (homepage)
    print("\n6a) GET / (homepage) -> 200 HTML")
    try:
        response = requests.get("https://clinic-report-review.preview.emergentagent.com/", timeout=10)
        if response.status_code == 200:
            if 'text/html' in response.headers.get('content-type', ''):
                print_result(True, f"Homepage returns 200 with HTML content")
            else:
                print_result(False, f"Homepage returns 200 but not HTML: {response.headers.get('content-type')}")
        else:
            print_result(False, f"Expected 200, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test 6b: GET /login
    print("\n6b) GET /login -> 200 HTML")
    try:
        response = requests.get("https://clinic-report-review.preview.emergentagent.com/login", timeout=10)
        if response.status_code == 200:
            if 'text/html' in response.headers.get('content-type', ''):
                print_result(True, f"Login page returns 200 with HTML content")
            else:
                print_result(False, f"Login page returns 200 but not HTML: {response.headers.get('content-type')}")
        else:
            print_result(False, f"Expected 200, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

def main():
    """Main test runner"""
    global clinic_token, owner_token, lab_token
    
    print("\n" + "="*80)
    print("VETBUDDY BACKEND REGRESSION TEST SUITE")
    print("Test di regressione dopo fix alias GET /api/rewards e GET /api/settings")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Started at: {datetime.now().isoformat()}")
    
    # Login all users
    print("\n" + "="*80)
    print("AUTHENTICATION SETUP")
    print("="*80)
    
    clinic_token = login_user(CLINIC_EMAIL, CLINIC_PASSWORD, "Clinic")
    owner_token = login_user(OWNER_EMAIL, OWNER_PASSWORD, "Owner")
    lab_token = login_user(LAB_EMAIL, LAB_PASSWORD, "Lab")
    
    if not clinic_token or not owner_token:
        print("\n❌ CRITICAL: Failed to authenticate required users. Aborting tests.")
        sys.exit(1)
    
    # Run all tests
    try:
        test_new_alias_rewards()
        test_new_alias_settings()
        test_regression_rewards_endpoints()
        test_regression_settings_endpoints()
        test_general_smoke()
        test_frontend_pages()
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR during test execution: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUITE COMPLETED")
    print("="*80)
    print(f"Completed at: {datetime.now().isoformat()}")
    print("\nNOTE: Review output above for detailed test results")
    print("IMPORTANT: GET /api/cron/daily was NOT called (as instructed)")

if __name__ == "__main__":
    main()
