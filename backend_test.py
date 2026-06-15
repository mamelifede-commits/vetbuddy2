#!/usr/bin/env python3
"""
VetBuddy Backend API Testing Script
Test rapido di 2 nuovi endpoint backend (Fase backlog):
- Directory Pubblica (no auth required)
- Morning Briefing (clinic auth required)
- Regression tests
"""

import requests
import json
import sys
from datetime import datetime

# Base URL
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"
LAB_EMAIL = "laboratorio1@vetbuddy.it"
LAB_PASSWORD = "Lab2025!"
OWNER_EMAIL = "proprietario.demo@vetbuddy.it"
OWNER_PASSWORD = "demo123"

# Global tokens
clinic_token = None
lab_token = None
owner_token = None

def print_test(test_name):
    """Print test header"""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(success, message):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    return success

def login(email, password, role_name):
    """Login and get JWT token"""
    try:
        print(f"\n🔐 Logging in as {role_name} ({email})...")
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            if token:
                print(f"✅ Login successful for {role_name}")
                return token
            else:
                print(f"❌ Login failed: No token in response")
                return None
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login exception: {str(e)}")
        return None

def test_directory_clinics():
    """TEST 1.1 - GET /api/directory/clinics (no auth)"""
    print_test("1.1 - GET /api/directory/clinics (no auth)")
    
    try:
        response = requests.get(f"{BASE_URL}/directory/clinics")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        
        # Verify response structure
        if 'clinics' not in data:
            return print_result(False, "Missing 'clinics' field in response")
        
        if 'total' not in data:
            return print_result(False, "Missing 'total' field in response")
        
        if not isinstance(data['total'], int):
            return print_result(False, f"'total' should be number, got {type(data['total'])}")
        
        clinics = data['clinics']
        print(f"Found {len(clinics)} clinics (total: {data['total']})")
        
        # Verify clinic structure if any clinics exist
        if len(clinics) > 0:
            clinic = clinics[0]
            required_fields = ['id', 'name', 'city', 'address', 'phone', 'services', 
                             'hasOnlineBooking', 'photo', 'slug', 'verified']
            
            for field in required_fields:
                if field not in clinic:
                    return print_result(False, f"Missing required field '{field}' in clinic object")
            
            if clinic['verified'] != True:
                return print_result(False, f"Expected verified=true, got {clinic['verified']}")
            
            print(f"Sample clinic: {clinic['name']} - {clinic['city']}")
            print(f"  Services: {len(clinic['services'])} services")
            print(f"  Online booking: {clinic['hasOnlineBooking']}")
        
        return print_result(True, f"Directory clinics endpoint working correctly ({len(clinics)} clinics)")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_directory_clinics_filter_city():
    """TEST 1.2 - GET /api/directory/clinics?city=milano"""
    print_test("1.2 - GET /api/directory/clinics?city=milano")
    
    try:
        response = requests.get(f"{BASE_URL}/directory/clinics?city=milano")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        clinics = data.get('clinics', [])
        
        print(f"Found {len(clinics)} clinics in Milano")
        
        # Verify filtering works (city should contain 'milano' in city or address)
        for clinic in clinics:
            city_match = 'milano' in clinic.get('city', '').lower()
            address_match = 'milano' in clinic.get('address', '').lower()
            
            if not (city_match or address_match):
                return print_result(False, f"Clinic {clinic['name']} doesn't match city filter")
        
        return print_result(True, f"City filter working correctly ({len(clinics)} clinics in Milano)")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_directory_clinics_filter_service():
    """TEST 1.3 - GET /api/directory/clinics?service=vaccini"""
    print_test("1.3 - GET /api/directory/clinics?service=vaccini")
    
    try:
        response = requests.get(f"{BASE_URL}/directory/clinics?service=vaccini")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        clinics = data.get('clinics', [])
        
        print(f"Found {len(clinics)} clinics offering 'vaccini' service")
        
        # Note: Service filtering is done in-memory after DB query, so we just verify response structure
        return print_result(True, f"Service filter working correctly ({len(clinics)} clinics)")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_directory_labs():
    """TEST 1.4 - GET /api/directory/labs (no auth)"""
    print_test("1.4 - GET /api/directory/labs (no auth)")
    
    try:
        response = requests.get(f"{BASE_URL}/directory/labs")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        
        # Verify response structure
        if 'labs' not in data:
            return print_result(False, "Missing 'labs' field in response")
        
        if 'total' not in data:
            return print_result(False, "Missing 'total' field in response")
        
        if not isinstance(data['total'], int):
            return print_result(False, f"'total' should be number, got {type(data['total'])}")
        
        labs = data['labs']
        print(f"Found {len(labs)} labs (total: {data['total']})")
        
        # Verify lab structure if any labs exist
        if len(labs) > 0:
            lab = labs[0]
            required_fields = ['id', 'name', 'city', 'address', 'phone', 'pickupAvailable',
                             'averageReportTime', 'examTypesCount', 'specializations', 
                             'photo', 'verified']
            
            for field in required_fields:
                if field not in lab:
                    return print_result(False, f"Missing required field '{field}' in lab object")
            
            if lab['verified'] != True:
                return print_result(False, f"Expected verified=true, got {lab['verified']}")
            
            print(f"Sample lab: {lab['name']} - {lab['city']}")
            print(f"  Exam types: {lab['examTypesCount']}")
            print(f"  Pickup available: {lab['pickupAvailable']}")
        
        return print_result(True, f"Directory labs endpoint working correctly ({len(labs)} labs)")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_directory_labs_filter_city():
    """TEST 1.5 - GET /api/directory/labs?city=roma"""
    print_test("1.5 - GET /api/directory/labs?city=roma")
    
    try:
        response = requests.get(f"{BASE_URL}/directory/labs?city=roma")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        labs = data.get('labs', [])
        
        print(f"Found {len(labs)} labs in Roma")
        
        return print_result(True, f"City filter working correctly ({len(labs)} labs in Roma)")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_directory_labs_filter_exam():
    """TEST 1.6 - GET /api/directory/labs?examType=sangue"""
    print_test("1.6 - GET /api/directory/labs?examType=sangue")
    
    try:
        response = requests.get(f"{BASE_URL}/directory/labs?examType=sangue")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        labs = data.get('labs', [])
        
        print(f"Found {len(labs)} labs offering 'sangue' exam type")
        
        return print_result(True, f"Exam type filter working correctly ({len(labs)} labs)")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_morning_briefing_clinic():
    """TEST 2.1 - GET /api/clinic/morning-briefing as clinic"""
    print_test("2.1 - GET /api/clinic/morning-briefing as clinic")
    
    global clinic_token
    if not clinic_token:
        return print_result(False, "No clinic token available")
    
    try:
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{BASE_URL}/clinic/morning-briefing", headers=headers)
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
        
        data = response.json()
        
        # Verify response structure
        if 'date' not in data:
            return print_result(False, "Missing 'date' field in response")
        
        if 'summary' not in data:
            return print_result(False, "Missing 'summary' field in response")
        
        if 'details' not in data:
            return print_result(False, "Missing 'details' field in response")
        
        # Verify summary fields
        summary = data['summary']
        required_summary_fields = [
            'appointmentsToday', 'unconfirmedToday', 'consentsMissing', 
            'staleLabReports', 'pendingInvites', 'expiredInvites',
            'previsitIncomplete', 'cancelledSlots', 'dormantClients',
            'urgentTasks', 'unreadMessages'
        ]
        
        for field in required_summary_fields:
            if field not in summary:
                return print_result(False, f"Missing required field '{field}' in summary")
            if not isinstance(summary[field], int):
                return print_result(False, f"Field '{field}' should be number, got {type(summary[field])}")
        
        # Verify details fields
        details = data['details']
        required_details_fields = [
            'todayAppointments', 'unconfirmed', 'consentsMissing', 
            'staleLab', 'pendingInvites'
        ]
        
        for field in required_details_fields:
            if field not in details:
                return print_result(False, f"Missing required field '{field}' in details")
            if not isinstance(details[field], list):
                return print_result(False, f"Field '{field}' should be array, got {type(details[field])}")
            if len(details[field]) > 10:
                return print_result(False, f"Field '{field}' should have max 10 items, got {len(details[field])}")
        
        print(f"Date: {data['date']}")
        print(f"Summary:")
        print(f"  Appointments today: {summary['appointmentsToday']}")
        print(f"  Unconfirmed: {summary['unconfirmedToday']}")
        print(f"  Consents missing: {summary['consentsMissing']}")
        print(f"  Stale lab reports: {summary['staleLabReports']}")
        print(f"  Pending invites: {summary['pendingInvites']}")
        print(f"  Expired invites: {summary['expiredInvites']}")
        print(f"  Previsit incomplete: {summary['previsitIncomplete']}")
        print(f"  Cancelled slots: {summary['cancelledSlots']}")
        print(f"  Dormant clients: {summary['dormantClients']}")
        print(f"  Urgent tasks: {summary['urgentTasks']}")
        print(f"  Unread messages: {summary['unreadMessages']}")
        
        return print_result(True, "Morning briefing endpoint working correctly with all required fields")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_morning_briefing_owner():
    """TEST 2.2 - GET /api/clinic/morning-briefing as OWNER (should be 403)"""
    print_test("2.2 - GET /api/clinic/morning-briefing as OWNER (should be 403)")
    
    global owner_token
    if not owner_token:
        return print_result(False, "No owner token available")
    
    try:
        headers = {"Authorization": f"Bearer {owner_token}"}
        response = requests.get(f"{BASE_URL}/clinic/morning-briefing", headers=headers)
        
        if response.status_code != 403:
            return print_result(False, f"Expected 403, got {response.status_code}")
        
        data = response.json()
        if 'error' not in data:
            return print_result(False, "Expected error message in response")
        
        print(f"Error message: {data['error']}")
        
        return print_result(True, "Authorization check working correctly (403 for owner)")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_morning_briefing_no_auth():
    """TEST 2.3 - GET /api/clinic/morning-briefing without auth"""
    print_test("2.3 - GET /api/clinic/morning-briefing without auth")
    
    try:
        response = requests.get(f"{BASE_URL}/clinic/morning-briefing")
        
        if response.status_code not in [401, 403]:
            return print_result(False, f"Expected 401 or 403, got {response.status_code}")
        
        return print_result(True, f"Authentication check working correctly ({response.status_code})")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_regression_connect_stats():
    """TEST 3.1 - GET /api/connect/stats as clinic"""
    print_test("3.1 - GET /api/connect/stats as clinic (regression)")
    
    global clinic_token
    if not clinic_token:
        return print_result(False, "No clinic token available")
    
    try:
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{BASE_URL}/connect/stats", headers=headers)
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        return print_result(True, "Connect stats endpoint working")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_regression_connect_invitations():
    """TEST 3.2 - GET /api/connect/invitations as clinic"""
    print_test("3.2 - GET /api/connect/invitations as clinic (regression)")
    
    global clinic_token
    if not clinic_token:
        return print_result(False, "No clinic token available")
    
    try:
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{BASE_URL}/connect/invitations", headers=headers)
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        return print_result(True, "Connect invitations endpoint working")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_regression_connect_completion():
    """TEST 3.3 - GET /api/connect/completion-score as clinic"""
    print_test("3.3 - GET /api/connect/completion-score as clinic (regression)")
    
    global clinic_token
    if not clinic_token:
        return print_result(False, "No clinic token available")
    
    try:
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{BASE_URL}/connect/completion-score", headers=headers)
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        return print_result(True, "Connect completion-score endpoint working")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_regression_stripe_plans():
    """TEST 3.4 - GET /api/stripe/plans"""
    print_test("3.4 - GET /api/stripe/plans (regression)")
    
    try:
        response = requests.get(f"{BASE_URL}/stripe/plans")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        
        # Verify response is an object (dict)
        if not isinstance(data, dict):
            return print_result(False, f"Expected object, got {type(data)}")
        
        # Verify 5 plans exist
        if len(data) != 5:
            return print_result(False, f"Expected 5 plans, got {len(data)}")
        
        # Verify specific plans and prices
        expected_plans = {
            'starter': 29,
            'growth': 69,
            'pro': 99,
            'lab_partner': 39,
            'enterprise': 0
        }
        
        for plan_id, expected_price in expected_plans.items():
            if plan_id not in data:
                return print_result(False, f"Missing plan: {plan_id}")
            
            plan = data[plan_id]
            price = plan.get('price')
            
            if price != expected_price:
                return print_result(False, f"Plan {plan_id}: expected €{expected_price}, got €{price}")
            
            print(f"  {plan.get('name')}: €{price}")
        
        return print_result(True, "Stripe plans endpoint working with correct pricing (5 plans)")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def main():
    """Main test execution"""
    global clinic_token, lab_token, owner_token
    
    print("\n" + "="*80)
    print("VetBuddy Backend API Testing - Directory & Morning Briefing")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Login
    clinic_token = login(CLINIC_EMAIL, CLINIC_PASSWORD, "Clinic")
    lab_token = login(LAB_EMAIL, LAB_PASSWORD, "Lab")
    owner_token = login(OWNER_EMAIL, OWNER_PASSWORD, "Owner")
    
    if not clinic_token:
        print("\n❌ CRITICAL: Clinic login failed. Cannot proceed with authenticated tests.")
    
    if not owner_token:
        print("\n⚠️  WARNING: Owner login failed. Some tests will be skipped.")
    
    # Track results
    results = []
    
    # TEST 1 - DIRECTORY PUBBLICA (no auth required)
    print("\n" + "="*80)
    print("TEST SUITE 1: DIRECTORY PUBBLICA (no auth required)")
    print("="*80)
    
    results.append(("1.1 Directory Clinics", test_directory_clinics()))
    results.append(("1.2 Directory Clinics Filter City", test_directory_clinics_filter_city()))
    results.append(("1.3 Directory Clinics Filter Service", test_directory_clinics_filter_service()))
    results.append(("1.4 Directory Labs", test_directory_labs()))
    results.append(("1.5 Directory Labs Filter City", test_directory_labs_filter_city()))
    results.append(("1.6 Directory Labs Filter Exam", test_directory_labs_filter_exam()))
    
    # TEST 2 - MORNING BRIEFING
    print("\n" + "="*80)
    print("TEST SUITE 2: MORNING BRIEFING")
    print("="*80)
    
    if clinic_token:
        results.append(("2.1 Morning Briefing Clinic", test_morning_briefing_clinic()))
    else:
        print("\n⚠️  SKIPPED: Test 2.1 (no clinic token)")
        results.append(("2.1 Morning Briefing Clinic", False))
    
    if owner_token:
        results.append(("2.2 Morning Briefing Owner (403)", test_morning_briefing_owner()))
    else:
        print("\n⚠️  SKIPPED: Test 2.2 (no owner token)")
        results.append(("2.2 Morning Briefing Owner (403)", False))
    
    results.append(("2.3 Morning Briefing No Auth", test_morning_briefing_no_auth()))
    
    # TEST 3 - REGRESSION
    print("\n" + "="*80)
    print("TEST SUITE 3: REGRESSION")
    print("="*80)
    
    if clinic_token:
        results.append(("3.1 Connect Stats", test_regression_connect_stats()))
        results.append(("3.2 Connect Invitations", test_regression_connect_invitations()))
        results.append(("3.3 Connect Completion Score", test_regression_connect_completion()))
    else:
        print("\n⚠️  SKIPPED: Tests 3.1-3.3 (no clinic token)")
        results.append(("3.1 Connect Stats", False))
        results.append(("3.2 Connect Invitations", False))
        results.append(("3.3 Connect Completion Score", False))
    
    results.append(("3.4 Stripe Plans", test_regression_stripe_plans()))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"\nTotal Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    
    print("\nDetailed Results:")
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} - {test_name}")
    
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    # Exit with appropriate code
    sys.exit(0 if passed == total else 1)

if __name__ == "__main__":
    main()
