#!/usr/bin/env python3
"""
VetBuddy Backend Testing Script - Batch 2-3-4 Features
Tests: Pre-visita, Consensi Digitali, Appointment Hook, Daily Cron, Settings
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

def test_1_settings_keys():
    """Test 1: Clinic login → GET /api/automations/settings → contains previsitForm, missingConsentCheck, puppyProgram"""
    print("\n" + "="*80)
    print("TEST 1: Automation Settings - New Keys")
    print("="*80)
    
    try:
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{API_URL}/automations/settings", headers=headers)
        
        if response.status_code != 200:
            log_test("Test 1 - Settings GET", False, f"Status {response.status_code}")
            return False
        
        data = response.json()
        settings = data.get('settings', {})
        
        # Check for new keys
        required_keys = ['previsitForm', 'missingConsentCheck', 'puppyProgram']
        missing_keys = [key for key in required_keys if key not in settings]
        
        if missing_keys:
            log_test("Test 1 - Settings Keys", False, f"Missing keys: {missing_keys}")
            return False
        
        # Verify all are true
        all_true = all(settings.get(key) == True for key in required_keys)
        if not all_true:
            log_test("Test 1 - Settings Values", False, f"Not all keys are true: {[(k, settings.get(k)) for k in required_keys]}")
            return False
        
        log_test("Test 1 - Settings Keys", True, f"All 3 new keys present and true: {required_keys}")
        return True
        
    except Exception as e:
        log_test("Test 1 - Settings", False, f"Exception: {e}")
        return False

def test_2_previsita_e2e():
    """Test 2: Pre-visita E2E flow"""
    print("\n" + "="*80)
    print("TEST 2: Pre-visita E2E Flow")
    print("="*80)
    
    form_id = None
    token = None
    
    try:
        # 2a. POST /api/previsit (clinic token) - Manual send
        print("\n2a. Creating pre-visita form (manual send)...")
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.post(f"{API_URL}/previsit", headers=headers, json={
            "ownerName": "Test Owner",
            "ownerEmail": OWNER_EMAIL,
            "petName": "TestPet",
            "type": "generale"
        })
        
        if response.status_code != 201:
            log_test("Test 2a - Create Form", False, f"Status {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        form_id = data.get('formId')
        if not form_id:
            log_test("Test 2a - Create Form", False, "No formId returned")
            return False
        
        log_test("Test 2a - Create Form", True, f"Form created: {form_id}")
        
        # 2b. Read token from MongoDB
        print("\n2b. Reading token from MongoDB...")
        form_doc = db.previsit_forms.find_one({"id": form_id})
        if not form_doc:
            log_test("Test 2b - Read Token", False, "Form not found in DB")
            return False
        
        token = form_doc.get('token')
        if not token:
            log_test("Test 2b - Read Token", False, "Token not found in form")
            return False
        
        log_test("Test 2b - Read Token", True, f"Token retrieved: {token[:20]}...")
        
        # 2c. GET /api/previsit?id=<formId>&t=<token> (no auth) - Public access
        print("\n2c. Public GET with valid token...")
        response = requests.get(f"{API_URL}/previsit?id={form_id}&t={token}")
        
        if response.status_code != 200:
            log_test("Test 2c - Public GET Valid", False, f"Status {response.status_code}")
            return False
        
        data = response.json()
        if not data.get('success') or not data.get('form'):
            log_test("Test 2c - Public GET Valid", False, "Invalid response structure")
            return False
        
        log_test("Test 2c - Public GET Valid", True, "Form data retrieved successfully")
        
        # 2d. GET /api/previsit?id=<formId>&t=WRONGTOKEN - Should fail
        print("\n2d. Public GET with wrong token...")
        response = requests.get(f"{API_URL}/previsit?id={form_id}&t=WRONGTOKEN")
        
        if response.status_code != 404:
            log_test("Test 2d - Public GET Invalid", False, f"Expected 404, got {response.status_code}")
            return False
        
        log_test("Test 2d - Public GET Invalid", True, "Correctly rejected wrong token")
        
        # 2e. POST /api/previsit - Submit with urgency Alta
        print("\n2e. Submitting form with urgency Alta...")
        response = requests.post(f"{API_URL}/previsit", json={
            "id": form_id,
            "token": token,
            "answers": {
                "reason": "Vomito",
                "symptoms": "vomita da ieri",
                "urgency": "Alta"
            }
        })
        
        if response.status_code != 200:
            log_test("Test 2e - Submit Form", False, f"Status {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        if data.get('status') != 'da_revisionare':
            log_test("Test 2e - Submit Form", False, f"Expected status 'da_revisionare', got {data.get('status')}")
            return False
        
        log_test("Test 2e - Submit Form", True, "Form submitted with urgency Alta → status 'da_revisionare'")
        
        # 2f. GET /api/previsit (clinic) - List forms
        print("\n2f. Clinic GET - List forms...")
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{API_URL}/previsit", headers=headers)
        
        if response.status_code != 200:
            log_test("Test 2f - Clinic List", False, f"Status {response.status_code}")
            return False
        
        data = response.json()
        questionnaires = data.get('questionnaires', [])
        
        # Find our form
        our_form = next((q for q in questionnaires if q.get('id') == form_id), None)
        if not our_form:
            log_test("Test 2f - Clinic List", False, "Form not found in list")
            return False
        
        if our_form.get('status') != 'da_revisionare':
            log_test("Test 2f - Clinic List", False, f"Wrong status: {our_form.get('status')}")
            return False
        
        if our_form.get('reason') != 'Vomito':
            log_test("Test 2f - Clinic List", False, f"Wrong reason: {our_form.get('reason')}")
            return False
        
        log_test("Test 2f - Clinic List", True, "Form listed with correct status and reason")
        
        # 2g. PUT /api/previsit - Mark as reviewed
        print("\n2g. Marking form as reviewed...")
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.put(f"{API_URL}/previsit", headers=headers, json={
            "id": form_id,
            "status": "compilato"
        })
        
        if response.status_code != 200:
            log_test("Test 2g - Review Form", False, f"Status {response.status_code}")
            return False
        
        log_test("Test 2g - Review Form", True, "Form marked as reviewed")
        
        # 2h. GET page /previsit/<formId>?t=<token> - Check page exists
        print("\n2h. Checking public page exists...")
        response = requests.get(f"{BASE_URL}/previsit/{form_id}?t={token}")
        
        if response.status_code != 200:
            log_test("Test 2h - Public Page", False, f"Status {response.status_code}")
            return False
        
        log_test("Test 2h - Public Page", True, "Public page accessible")
        
        print("\n✅ TEST 2 COMPLETE - All pre-visita tests passed")
        return True
        
    except Exception as e:
        log_test("Test 2 - Pre-visita E2E", False, f"Exception: {e}")
        return False

def test_3_appointment_hook():
    """Test 3: Appointment creation hook"""
    print("\n" + "="*80)
    print("TEST 3: Appointment Hook - Auto Pre-visita Creation")
    print("="*80)
    
    appointment_id = None
    
    try:
        # Create appointment
        print("\n3a. Creating appointment...")
        headers = {"Authorization": f"Bearer {clinic_token}"}
        
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        response = requests.post(f"{API_URL}/appointments", headers=headers, json={
            "clinicId": clinic_id,
            "ownerId": owner_id,
            "petName": "TestPet Hook",
            "ownerName": "Test Owner Hook",
            "date": tomorrow,
            "time": "16:00",
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
        
        # Wait for async hook to complete
        print("\n3b. Waiting 3 seconds for hook to complete...")
        time.sleep(3)
        
        # Check previsit_forms collection
        print("\n3c. Checking previsit_forms collection...")
        previsit_form = db.previsit_forms.find_one({"appointmentId": appointment_id})
        
        if not previsit_form:
            log_test("Test 3c - Previsit Created", False, "No previsit form found for appointment")
            return False
        
        log_test("Test 3c - Previsit Created", True, f"Previsit form created: {previsit_form.get('id')}")
        
        # Check automation_logs collection
        print("\n3d. Checking automation_logs collection...")
        log_entry = db.automation_logs.find_one({
            "type": "previsitForm",
            "clinicId": clinic_id
        }, sort=[("executedAt", -1)])
        
        if not log_entry:
            log_test("Test 3d - Automation Log", False, "No automation log found")
            return False
        
        log_test("Test 3d - Automation Log", True, f"Automation log created: {log_entry.get('title')}")
        
        # Cleanup: Delete appointment
        print("\n3e. Cleaning up - deleting appointment...")
        response = requests.delete(f"{API_URL}/appointments/{appointment_id}", headers=headers)
        
        if response.status_code == 200:
            log_test("Test 3e - Cleanup", True, "Appointment deleted")
        else:
            log_test("Test 3e - Cleanup", False, f"Failed to delete: {response.status_code}")
        
        print("\n✅ TEST 3 COMPLETE - Appointment hook working")
        return True
        
    except Exception as e:
        log_test("Test 3 - Appointment Hook", False, f"Exception: {e}")
        return False

def test_4_consents_e2e():
    """Test 4: Consensi Digitali E2E flow"""
    print("\n" + "="*80)
    print("TEST 4: Consensi Digitali E2E Flow")
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
        
        # 4g. GET page /consent/<id>?t=<token> - Check page exists
        print("\n4g. Checking public page exists...")
        response = requests.get(f"{BASE_URL}/consent/{consent_id}?t={token}")
        
        if response.status_code != 200:
            log_test("Test 4g - Public Page", False, f"Status {response.status_code}")
            return False
        
        log_test("Test 4g - Public Page", True, "Public page accessible")
        
        print("\n✅ TEST 4 COMPLETE - All consents tests passed")
        return True
        
    except Exception as e:
        log_test("Test 4 - Consents E2E", False, f"Exception: {e}")
        return False

def test_5_cron_daily():
    """Test 5: Daily cron job"""
    print("\n" + "="*80)
    print("TEST 5: Daily Cron Job - New Result Keys")
    print("="*80)
    
    try:
        print("\n5a. Calling GET /api/cron/daily ONCE...")
        response = requests.get(f"{API_URL}/cron/daily")
        
        if response.status_code != 200:
            log_test("Test 5a - Cron Call", False, f"Status {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        results = data.get('results', {})
        
        # Check for new keys
        required_keys = ['postSurgeryFollowup', 'medicationRefill', 'missingConsentCheck', 'puppyProgram']
        missing_keys = [key for key in required_keys if key not in results]
        
        if missing_keys:
            log_test("Test 5a - Cron Keys", False, f"Missing keys: {missing_keys}")
            return False
        
        log_test("Test 5a - Cron Call", True, f"All 4 new keys present: {required_keys}")
        
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
    """Test 6: Authentication checks"""
    print("\n" + "="*80)
    print("TEST 6: Authentication Checks")
    print("="*80)
    
    try:
        # 6a. GET /api/previsit without token
        print("\n6a. GET /api/previsit without token...")
        response = requests.get(f"{API_URL}/previsit")
        
        if response.status_code != 401:
            log_test("Test 6a - Previsit No Auth", False, f"Expected 401, got {response.status_code}")
            return False
        
        log_test("Test 6a - Previsit No Auth", True, "Correctly rejected")
        
        # 6b. GET /api/consents without token (no id/t params)
        print("\n6b. GET /api/consents without token...")
        response = requests.get(f"{API_URL}/consents")
        
        if response.status_code != 401:
            log_test("Test 6b - Consents No Auth", False, f"Expected 401, got {response.status_code}")
            return False
        
        log_test("Test 6b - Consents No Auth", True, "Correctly rejected")
        
        # 6c. POST /api/consents with owner token
        print("\n6c. POST /api/consents with owner token...")
        headers = {"Authorization": f"Bearer {owner_token}"}
        response = requests.post(f"{API_URL}/consents", headers=headers, json={
            "type": "chirurgia",
            "ownerName": "Test",
            "ownerEmail": "test@test.com",
            "petName": "Test"
        })
        
        if response.status_code != 401:
            log_test("Test 6c - Consents Owner Auth", False, f"Expected 401, got {response.status_code}")
            return False
        
        log_test("Test 6c - Consents Owner Auth", True, "Correctly rejected owner token")
        
        print("\n✅ TEST 6 COMPLETE - All auth checks passed")
        return True
        
    except Exception as e:
        log_test("Test 6 - Auth Checks", False, f"Exception: {e}")
        return False

def test_7_regression():
    """Test 7: Regression checks"""
    print("\n" + "="*80)
    print("TEST 7: Regression Checks")
    print("="*80)
    
    try:
        # 7a. GET /api/auth/me (clinic)
        print("\n7a. GET /api/auth/me (clinic)...")
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        
        if response.status_code != 200:
            log_test("Test 7a - Auth Me", False, f"Status {response.status_code}")
            return False
        
        log_test("Test 7a - Auth Me", True, "Working correctly")
        
        # 7b. GET /api/automations/log (clinic)
        print("\n7b. GET /api/automations/log (clinic)...")
        response = requests.get(f"{API_URL}/automations/log", headers=headers)
        
        if response.status_code != 200:
            log_test("Test 7b - Automation Log", False, f"Status {response.status_code}")
            return False
        
        data = response.json()
        logs = data.get('logs', [])
        
        if not isinstance(logs, list):
            log_test("Test 7b - Automation Log", False, "Logs is not a list")
            return False
        
        log_test("Test 7b - Automation Log", True, f"Working correctly - {len(logs)} entries")
        
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
        # Delete test previsit forms
        result = db.previsit_forms.delete_many({
            "$or": [
                {"ownerName": "Test Owner"},
                {"ownerName": "Test Owner Hook"},
                {"petName": "TestPet"},
                {"petName": "TestPet Hook"}
            ]
        })
        print(f"✅ Deleted {result.deleted_count} test previsit forms")
        
        # Delete test consents
        result = db.consents.delete_many({
            "$or": [
                {"ownerName": "Test Owner"},
                {"petName": "TestPet"},
                {"detail": "Sterilizzazione test"}
            ]
        })
        print(f"✅ Deleted {result.deleted_count} test consents")
        
        # Delete test appointments (if any remain)
        result = db.appointments.delete_many({
            "$or": [
                {"ownerName": "Test Owner Hook"},
                {"petName": "TestPet Hook"},
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
    print("VetBuddy Backend Testing - Batch 2-3-4 Features")
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
    
    # Run tests
    test_1_settings_keys()
    test_2_previsita_e2e()
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
    
    print("\n✅ ALL TESTS COMPLETE")

if __name__ == "__main__":
    main()
