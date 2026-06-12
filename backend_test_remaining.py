#!/usr/bin/env python3
"""
VetBuddy Backend Testing Script - REMAINING Batch 2-3-4 Tests
Pre-visita API tests 1-2 were ALREADY DONE and PASSED - NOT retesting
Running REMAINING tests: Server Health, Public Pages, Appointment Hook, Consensi E2E, Cron, Auth, Regression
"""

import requests
import json
import time
from datetime import datetime, timedelta
from pymongo import MongoClient
import os

# Configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://clinic-report-review.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"
MONGO_URL = os.getenv('MONGO_URL', 'mongodb+srv://mamelifede_db_user:8XjA0yK3dnnyxy0M@cluster0.kk2vrpt.mongodb.net/vetbuddy')
DB_NAME = os.getenv('DB_NAME', 'vetbuddy')

# Credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"
OWNER_EMAIL = "proprietario.demo@vetbuddy.it"
OWNER_PASSWORD = "demo123"

# Global variables
clinic_token = None
owner_token = None
clinic_id = None
owner_id = None
mongo_client = None
db = None

# Test tracking
test_results = []

def log_test(test_name, passed, message=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status}: {test_name}"
    if message:
        result += f" - {message}"
    print(result)
    test_results.append({"test": test_name, "passed": passed, "message": message})

def setup_mongo():
    """Setup MongoDB connection"""
    global mongo_client, db
    try:
        mongo_client = MongoClient(MONGO_URL)
        db = mongo_client[DB_NAME]
        print(f"✅ MongoDB connected to {DB_NAME}")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

def cleanup_mongo():
    """Close MongoDB connection"""
    if mongo_client:
        mongo_client.close()
        print("✅ MongoDB connection closed")

def login_clinic():
    """Login as clinic and get token"""
    global clinic_token, clinic_id
    try:
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": CLINIC_EMAIL,
            "password": CLINIC_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            clinic_token = data.get('token')
            clinic_id = data.get('user', {}).get('id')
            print(f"✅ Clinic login successful - ID: {clinic_id}")
            return True
        else:
            print(f"❌ Clinic login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Clinic login error: {e}")
        return False

def login_owner():
    """Login as owner and get token"""
    global owner_token, owner_id
    try:
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            owner_token = data.get('token')
            owner_id = data.get('user', {}).get('id')
            print(f"✅ Owner login successful - ID: {owner_id}")
            return True
        else:
            print(f"❌ Owner login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Owner login error: {e}")
        return False

def test_1_server_health():
    """Test 1: SERVER HEALTH - GET /api/auth/me with clinic token"""
    print("\n" + "="*80)
    print("TEST 1: SERVER HEALTH - GET /api/auth/me")
    print("="*80)
    
    try:
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        
        if response.status_code != 200:
            log_test("Test 1 - Server Health", False, f"Status {response.status_code}")
            return False
        
        data = response.json()
        if not data.get('id') or not data.get('role'):
            log_test("Test 1 - Server Health", False, "Invalid response structure")
            return False
        
        log_test("Test 1 - Server Health", True, f"Server stable, clinic ID: {data.get('id')}")
        return True
        
    except Exception as e:
        log_test("Test 1 - Server Health", False, f"Exception: {e}")
        return False

def test_2_public_pages():
    """Test 2: PUBLIC PAGES - GET /previsit/test-id?t=test and GET /consent/test-id?t=test"""
    print("\n" + "="*80)
    print("TEST 2: PUBLIC PAGES - Previsit & Consent Pages")
    print("="*80)
    
    try:
        # 2a. GET /previsit/test-id?t=test
        print("\n2a. Testing previsit public page...")
        response = requests.get(f"{BASE_URL}/previsit/test-id?t=test")
        
        if response.status_code != 200:
            log_test("Test 2a - Previsit Page", False, f"Status {response.status_code}")
            return False
        
        # Check it's HTML
        content_type = response.headers.get('content-type', '')
        if 'html' not in content_type.lower():
            log_test("Test 2a - Previsit Page", False, f"Not HTML: {content_type}")
            return False
        
        log_test("Test 2a - Previsit Page", True, "Page renders (200 HTML, 'Modulo non trovato' inside is expected)")
        
        # 2b. GET /consent/test-id?t=test
        print("\n2b. Testing consent public page...")
        response = requests.get(f"{BASE_URL}/consent/test-id?t=test")
        
        if response.status_code != 200:
            log_test("Test 2b - Consent Page", False, f"Status {response.status_code}")
            return False
        
        # Check it's HTML
        content_type = response.headers.get('content-type', '')
        if 'html' not in content_type.lower():
            log_test("Test 2b - Consent Page", False, f"Not HTML: {content_type}")
            return False
        
        log_test("Test 2b - Consent Page", True, "Page renders (200 HTML)")
        
        print("\n✅ TEST 2 COMPLETE - Both public pages accessible")
        return True
        
    except Exception as e:
        log_test("Test 2 - Public Pages", False, f"Exception: {e}")
        return False

def test_3_appointment_hook():
    """Test 3: APPOINTMENT HOOK - Create appointment, verify previsit_forms and automation_logs"""
    print("\n" + "="*80)
    print("TEST 3: APPOINTMENT HOOK - Auto Pre-visita Creation")
    print("="*80)
    
    appointment_id = None
    
    try:
        # 3a. Create appointment
        print("\n3a. Creating appointment...")
        headers = {"Authorization": f"Bearer {clinic_token}"}
        
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        response = requests.post(f"{API_URL}/appointments", headers=headers, json={
            "clinicId": clinic_id,
            "ownerId": owner_id,
            "petName": "TestHookPet",
            "ownerName": "Test Hook Owner",
            "date": tomorrow,
            "time": "16:30",
            "reason": "Visita test hook",
            "status": "confirmed"
        })
        
        if response.status_code != 200:
            log_test("Test 3a - Create Appointment", False, f"Status {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        appointment_id = data.get('id')
        if not appointment_id:
            log_test("Test 3a - Create Appointment", False, "No appointment ID returned")
            return False
        
        log_test("Test 3a - Create Appointment", True, f"Appointment created: {appointment_id}")
        
        # 3b. Wait for async hook to complete
        print("\n3b. Waiting 3 seconds for hook to complete...")
        time.sleep(3)
        
        # 3c. Check previsit_forms collection
        print("\n3c. Checking previsit_forms collection...")
        previsit_form = db.previsit_forms.find_one({"appointmentId": appointment_id})
        
        if not previsit_form:
            log_test("Test 3c - Previsit Created", False, "No previsit form found for appointment")
            # Don't return False yet, continue to cleanup
        else:
            log_test("Test 3c - Previsit Created", True, f"Previsit form created: {previsit_form.get('id')}")
        
        # 3d. Check automation_logs collection
        print("\n3d. Checking automation_logs collection...")
        log_entry = db.automation_logs.find_one({
            "type": "previsitForm",
            "clinicId": clinic_id
        }, sort=[("executedAt", -1)])
        
        if not log_entry:
            log_test("Test 3d - Automation Log", False, "No automation log found")
        else:
            log_test("Test 3d - Automation Log", True, f"Automation log created: {log_entry.get('title')}")
        
        # 3e. Cleanup: Delete appointment
        print("\n3e. Cleaning up - deleting appointment...")
        response = requests.delete(f"{API_URL}/appointments/{appointment_id}", headers=headers)
        
        if response.status_code == 200:
            log_test("Test 3e - Cleanup", True, "Appointment deleted")
        else:
            log_test("Test 3e - Cleanup", False, f"Failed to delete: {response.status_code}")
        
        print("\n✅ TEST 3 COMPLETE - Appointment hook tested")
        return True
        
    except Exception as e:
        log_test("Test 3 - Appointment Hook", False, f"Exception: {e}")
        # Try to cleanup if appointment was created
        if appointment_id:
            try:
                headers = {"Authorization": f"Bearer {clinic_token}"}
                requests.delete(f"{API_URL}/appointments/{appointment_id}", headers=headers)
            except:
                pass
        return False

def test_4_consents_e2e():
    """Test 4: CONSENSI E2E - Full consent flow"""
    print("\n" + "="*80)
    print("TEST 4: CONSENSI DIGITALI E2E Flow")
    print("="*80)
    
    consent_id = None
    token = None
    
    try:
        # 4a. POST /api/consents (clinic) - Create consent
        print("\n4a. Creating consent...")
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.post(f"{API_URL}/consents", headers=headers, json={
            "type": "chirurgia",
            "ownerName": "Test Owner",
            "ownerEmail": OWNER_EMAIL,
            "petName": "TestPet",
            "detail": "Sterilizzazione test"
        })
        
        if response.status_code != 201:
            log_test("Test 4a - Create Consent", False, f"Status {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        consent_id = data.get('consent', {}).get('id')
        if not consent_id:
            log_test("Test 4a - Create Consent", False, "No consent ID returned")
            return False
        
        log_test("Test 4a - Create Consent", True, f"Consent created: {consent_id}")
        
        # 4b. Read token from MongoDB
        print("\n4b. Reading token from MongoDB...")
        consent_doc = db.consents.find_one({"id": consent_id})
        if not consent_doc:
            log_test("Test 4b - Read Token", False, "Consent not found in DB")
            return False
        
        token = consent_doc.get('token')
        if not token:
            log_test("Test 4b - Read Token", False, "Token not found in consent")
            return False
        
        log_test("Test 4b - Read Token", True, f"Token retrieved: {token[:20]}...")
        
        # 4c. GET /api/consents?id=<id>&t=<token> (no auth) - Public access
        print("\n4c. Public GET with valid token...")
        response = requests.get(f"{API_URL}/consents?id={consent_id}&t={token}")
        
        if response.status_code != 200:
            log_test("Test 4c - Public GET", False, f"Status {response.status_code}")
            return False
        
        data = response.json()
        consent = data.get('consent', {})
        
        # Check status changed to 'visto'
        if consent.get('status') != 'visto':
            log_test("Test 4c - Status Visto", False, f"Expected 'visto', got {consent.get('status')}")
            return False
        
        log_test("Test 4c - Public GET", True, "Consent retrieved and marked as 'visto'")
        
        # 4d. POST /api/consents - Sign consent
        print("\n4d. Signing consent...")
        response = requests.post(f"{API_URL}/consents", json={
            "id": consent_id,
            "token": token,
            "sign": True,
            "signedName": "Mario Rossi Test"
        })
        
        if response.status_code != 200:
            log_test("Test 4d - Sign Consent", False, f"Status {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        if data.get('status') != 'firmato':
            log_test("Test 4d - Sign Consent", False, f"Expected status 'firmato', got {data.get('status')}")
            return False
        
        log_test("Test 4d - Sign Consent", True, "Consent signed successfully")
        
        # 4e. POST same sign again - Should fail
        print("\n4e. Trying to sign again (should fail)...")
        response = requests.post(f"{API_URL}/consents", json={
            "id": consent_id,
            "token": token,
            "sign": True,
            "signedName": "Mario Rossi Test"
        })
        
        if response.status_code != 400:
            log_test("Test 4e - Double Sign", False, f"Expected 400, got {response.status_code}")
            return False
        
        log_test("Test 4e - Double Sign", True, "Correctly rejected double signing")
        
        # 4f. GET /api/consents (clinic) - List consents
        print("\n4f. Clinic GET - List consents...")
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{API_URL}/consents", headers=headers)
        
        if response.status_code != 200:
            log_test("Test 4f - Clinic List", False, f"Status {response.status_code}")
            return False
        
        data = response.json()
        consents = data.get('consents', [])
        
        # Find our consent
        our_consent = next((c for c in consents if c.get('id') == consent_id), None)
        if not our_consent:
            log_test("Test 4f - Clinic List", False, "Consent not found in list")
            return False
        
        if our_consent.get('status') != 'firmato':
            log_test("Test 4f - Clinic List", False, f"Wrong status: {our_consent.get('status')}")
            return False
        
        if not our_consent.get('signedName'):
            log_test("Test 4f - Clinic List", False, "signedName not present")
            return False
        
        log_test("Test 4f - Clinic List", True, "Consent listed with status 'firmato' and signedName")
        
        print("\n✅ TEST 4 COMPLETE - All consents tests passed")
        return True
        
    except Exception as e:
        log_test("Test 4 - Consents E2E", False, f"Exception: {e}")
        return False

def test_5_cron_daily():
    """Test 5: CRON - GET /api/cron/daily ONCE ONLY"""
    print("\n" + "="*80)
    print("TEST 5: CRON - Daily Job (ONCE ONLY)")
    print("="*80)
    
    try:
        print("\n5a. Calling GET /api/cron/daily ONCE...")
        response = requests.get(f"{API_URL}/cron/daily")
        
        if response.status_code != 200:
            log_test("Test 5a - Cron Call", False, f"Status {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        
        if not data.get('success'):
            log_test("Test 5a - Cron Success", False, f"Success is {data.get('success')}")
            return False
        
        results = data.get('results', {})
        
        # Check for required keys
        required_keys = ['postSurgeryFollowup', 'medicationRefill', 'missingConsentCheck', 'puppyProgram']
        missing_keys = [key for key in required_keys if key not in results]
        
        if missing_keys:
            log_test("Test 5a - Cron Keys", False, f"Missing keys: {missing_keys}")
            return False
        
        log_test("Test 5a - Cron Call", True, f"All 4 required keys present: {required_keys}")
        
        # Check error counters are 0
        print("\n5b. Checking error counters...")
        errors_found = []
        for key in required_keys:
            result = results.get(key, {})
            errors = result.get('errors', 0)
            if errors > 0:
                errors_found.append(f"{key}: {errors} errors")
        
        if errors_found:
            log_test("Test 5b - Error Counters", False, f"Errors found: {errors_found}")
            return False
        
        log_test("Test 5b - Error Counters", True, "All error counters are 0")
        
        # Log results for visibility
        print("\n5c. Cron results summary:")
        for key in required_keys:
            result = results.get(key, {})
            print(f"  - {key}: sent={result.get('sent', 0)}, errors={result.get('errors', 0)}, skipped={result.get('skipped', 0)}")
        
        print("\n✅ TEST 5 COMPLETE - Cron job working correctly")
        return True
        
    except Exception as e:
        log_test("Test 5 - Cron Daily", False, f"Exception: {e}")
        return False

def test_6_auth_checks():
    """Test 6: AUTH - Test 401 scenarios"""
    print("\n" + "="*80)
    print("TEST 6: AUTH - 401 Scenarios")
    print("="*80)
    
    try:
        # 6a. GET /api/previsit without token (no id/t params)
        print("\n6a. GET /api/previsit without token...")
        response = requests.get(f"{API_URL}/previsit")
        
        if response.status_code != 401:
            log_test("Test 6a - Previsit No Auth", False, f"Expected 401, got {response.status_code}")
            return False
        
        log_test("Test 6a - Previsit No Auth", True, "Correctly rejected")
        
        # 6b. POST /api/consents with owner token (clinic-only endpoint)
        print("\n6b. POST /api/consents with owner token...")
        headers = {"Authorization": f"Bearer {owner_token}"}
        response = requests.post(f"{API_URL}/consents", headers=headers, json={
            "type": "chirurgia",
            "ownerName": "Test",
            "ownerEmail": "test@test.com",
            "petName": "Test"
        })
        
        if response.status_code != 401:
            log_test("Test 6b - Consents Owner Auth", False, f"Expected 401, got {response.status_code}")
            return False
        
        log_test("Test 6b - Consents Owner Auth", True, "Correctly rejected owner token")
        
        print("\n✅ TEST 6 COMPLETE - All auth checks passed")
        return True
        
    except Exception as e:
        log_test("Test 6 - Auth Checks", False, f"Exception: {e}")
        return False

def test_7_regression():
    """Test 7: REGRESSION - GET /api/automations/log and /api/automations/settings"""
    print("\n" + "="*80)
    print("TEST 7: REGRESSION - Automations Endpoints")
    print("="*80)
    
    try:
        headers = {"Authorization": f"Bearer {clinic_token}"}
        
        # 7a. GET /api/automations/log
        print("\n7a. GET /api/automations/log...")
        response = requests.get(f"{API_URL}/automations/log", headers=headers)
        
        if response.status_code != 200:
            log_test("Test 7a - Automation Log", False, f"Status {response.status_code}")
            return False
        
        data = response.json()
        logs = data.get('logs', [])
        
        if not isinstance(logs, list):
            log_test("Test 7a - Automation Log", False, "Logs is not a list")
            return False
        
        log_test("Test 7a - Automation Log", True, f"Working correctly - {len(logs)} entries")
        
        # 7b. GET /api/automations/settings
        print("\n7b. GET /api/automations/settings...")
        response = requests.get(f"{API_URL}/automations/settings", headers=headers)
        
        if response.status_code != 200:
            log_test("Test 7b - Automation Settings", False, f"Status {response.status_code}")
            return False
        
        data = response.json()
        settings = data.get('settings', {})
        
        if not isinstance(settings, dict):
            log_test("Test 7b - Automation Settings", False, "Settings is not a dict")
            return False
        
        log_test("Test 7b - Automation Settings", True, f"Working correctly - {len(settings)} settings")
        
        print("\n✅ TEST 7 COMPLETE - Regression checks passed")
        return True
        
    except Exception as e:
        log_test("Test 7 - Regression", False, f"Exception: {e}")
        return False

def cleanup_test_data():
    """Cleanup test data from database"""
    print("\n" + "="*80)
    print("CLEANUP: Removing test data")
    print("="*80)
    
    try:
        # Delete test consents
        result = db.consents.delete_many({
            "$or": [
                {"ownerName": "Test Owner"},
                {"petName": "TestPet"},
                {"detail": "Sterilizzazione test"}
            ]
        })
        print(f"✅ Deleted {result.deleted_count} test consents")
        
        # Delete test previsit forms
        result = db.previsit_forms.delete_many({
            "$or": [
                {"ownerName": "Test Hook Owner"},
                {"petName": "TestHookPet"}
            ]
        })
        print(f"✅ Deleted {result.deleted_count} test previsit forms")
        
        # Delete test appointments (if any remain)
        result = db.appointments.delete_many({
            "$or": [
                {"ownerName": "Test Hook Owner"},
                {"petName": "TestHookPet"},
                {"reason": "Visita test hook"}
            ]
        })
        print(f"✅ Deleted {result.deleted_count} test appointments")
        
        print("\n✅ CLEANUP COMPLETE")
        return True
        
    except Exception as e:
        print(f"❌ Cleanup error: {e}")
        return False

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for r in test_results if r['passed'])
    total = len(test_results)
    
    print(f"\nTotal Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    
    if total - passed > 0:
        print("\n❌ FAILED TESTS:")
        for r in test_results:
            if not r['passed']:
                print(f"  - {r['test']}: {r['message']}")
    
    print("\n" + "="*80)

def main():
    """Main test execution"""
    print("="*80)
    print("VetBuddy Backend Testing - REMAINING Batch 2-3-4 Tests")
    print("Pre-visita API tests 1-2 ALREADY DONE - NOT retesting")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    print(f"MongoDB: {DB_NAME}")
    print("="*80)
    
    # Setup
    if not setup_mongo():
        print("❌ Cannot proceed without MongoDB connection")
        return
    
    if not login_clinic():
        print("❌ Cannot proceed without clinic login")
        cleanup_mongo()
        return
    
    if not login_owner():
        print("❌ Cannot proceed without owner login")
        cleanup_mongo()
        return
    
    # Run REMAINING tests
    test_1_server_health()
    test_2_public_pages()
    test_3_appointment_hook()
    test_4_consents_e2e()
    test_5_cron_daily()
    test_6_auth_checks()
    test_7_regression()
    
    # Cleanup
    cleanup_test_data()
    
    # Summary
    print_summary()
    
    # Cleanup MongoDB
    cleanup_mongo()
    
    print("\n✅ ALL REMAINING TESTS COMPLETE")

if __name__ == "__main__":
    main()
