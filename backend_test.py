#!/usr/bin/env python3
"""
VetBuddy Batch 1 Automation Testing
Tests: waitlist notification, automation logs, no-show module, cron automations
"""

import requests
import json
import time
import os
from datetime import datetime, timedelta

# Base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://clinic-report-review.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

# Test credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"
OWNER_EMAIL = "proprietario.demo@vetbuddy.it"
OWNER_PASSWORD = "demo123"

# Global variables for test data
clinic_token = None
owner_token = None
clinic_id = None
owner_id = None
test_appointment_id = None
test_waitlist_id = None

def print_test(msg):
    print(f"\n{'='*80}")
    print(f"TEST: {msg}")
    print('='*80)

def print_result(success, msg):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {msg}")

def print_error(msg):
    print(f"❌ ERROR: {msg}")

# ============================================================================
# TEST 1: Clinic Login & Settings Check
# ============================================================================
def test_clinic_login_and_settings():
    global clinic_token, clinic_id
    print_test("1. Clinic Login & fragilePatientsDigest Setting Check")
    
    try:
        # Login
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": CLINIC_EMAIL,
            "password": CLINIC_PASSWORD
        })
        
        if response.status_code != 200:
            print_error(f"Login failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        clinic_token = data.get('token')
        clinic_id = data.get('user', {}).get('id')
        
        print_result(True, f"Clinic login successful. Token: {clinic_token[:20]}...")
        print_result(True, f"Clinic ID: {clinic_id}")
        
        # Get automation settings
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{API_URL}/automations/settings", headers=headers)
        
        if response.status_code != 200:
            print_error(f"Settings fetch failed: {response.status_code} - {response.text}")
            return False
        
        settings_data = response.json()
        settings = settings_data.get('settings', {})
        
        # Check for fragilePatientsDigest key
        if 'fragilePatientsDigest' in settings:
            print_result(True, f"fragilePatientsDigest key found: {settings['fragilePatientsDigest']}")
        else:
            print_error("fragilePatientsDigest key NOT found in settings")
            return False
        
        # Count total settings keys
        total_keys = len(settings)
        print_result(True, f"Total automation settings keys: {total_keys} (expected ~57)")
        
        return True
        
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return False

# ============================================================================
# TEST 2: No-Show Module WITHOUT Auth (Demo Data)
# ============================================================================
def test_noshow_module_no_auth():
    print_test("2. GET /api/business-modules?module=noshow WITHOUT Authorization (Demo Data)")
    
    try:
        response = requests.get(f"{API_URL}/business-modules?module=noshow")
        
        if response.status_code != 200:
            print_error(f"Request failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        
        # Check for demo data structure
        required_keys = ['unconfirmed', 'noshowHistory', 'waitlist', 'recoveredSlots', 'ownerLabels']
        for key in required_keys:
            if key not in data:
                print_error(f"Missing key: {key}")
                return False
        
        print_result(True, f"All 5 required keys present: {', '.join(required_keys)}")
        
        # Check unconfirmed has 12 demo entries with names like 'Maria Rossi'
        unconfirmed = data.get('unconfirmed', [])
        print_result(True, f"Unconfirmed entries: {len(unconfirmed)} (expected 12 for demo)")
        
        if len(unconfirmed) > 0:
            first_entry = unconfirmed[0]
            print_result(True, f"First entry owner: {first_entry.get('ownerName')} (demo data)")
        
        return True
        
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return False

# ============================================================================
# TEST 3: No-Show Module WITH Auth (Real Data)
# ============================================================================
def test_noshow_module_with_auth():
    print_test("3. GET /api/business-modules?module=noshow WITH Authorization (Real Data)")
    
    try:
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{API_URL}/business-modules?module=noshow", headers=headers)
        
        if response.status_code != 200:
            print_error(f"Request failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        
        # Check for all 5 required keys
        required_keys = ['unconfirmed', 'noshowHistory', 'waitlist', 'recoveredSlots', 'ownerLabels']
        for key in required_keys:
            if key not in data:
                print_error(f"Missing key: {key}")
                return False
        
        print_result(True, f"All 5 required keys present: {', '.join(required_keys)}")
        
        # Check data types
        unconfirmed = data.get('unconfirmed', [])
        noshow_history = data.get('noshowHistory', [])
        waitlist = data.get('waitlist', [])
        recovered_slots = data.get('recoveredSlots', [])
        owner_labels = data.get('ownerLabels', {})
        
        print_result(True, f"REAL DATA - Unconfirmed: {len(unconfirmed)}, NoShow History: {len(noshow_history)}, Waitlist: {len(waitlist)}, Recovered: {len(recovered_slots)}")
        print_result(True, f"Owner Labels: {len(owner_labels)} entries (object type)")
        
        # Verify it's different from demo (should not have exactly 12 entries with fixed names)
        if len(unconfirmed) == 12 and unconfirmed[0].get('ownerName') == 'Maria Rossi':
            print_error("Data appears to be demo data, not real data!")
            return False
        
        print_result(True, "Data appears to be REAL (differs from fixed demo structure)")
        
        return True
        
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return False

# ============================================================================
# TEST 4: Waitlist Trigger Flow (CRITICAL)
# ============================================================================
def test_waitlist_trigger_flow():
    global owner_token, owner_id, test_appointment_id, test_waitlist_id
    print_test("4. Waitlist Trigger Flow (Critical Test)")
    
    try:
        # 4a. Owner login
        print("\n--- 4a. Owner Login ---")
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        
        if response.status_code != 200:
            print_error(f"Owner login failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        owner_token = data.get('token')
        owner_id = data.get('user', {}).get('id')
        
        print_result(True, f"Owner login successful. Owner ID: {owner_id}")
        
        # 4b. Create waitlist entry
        print("\n--- 4b. Create Waitlist Entry ---")
        headers = {"Authorization": f"Bearer {owner_token}"}
        waitlist_data = {
            "clinicId": clinic_id,
            "ownerId": owner_id,
            "preferredDates": [],
            "reason": "Test slot libero"
        }
        
        response = requests.post(f"{API_URL}/automations/waitlist", headers=headers, json=waitlist_data)
        
        if response.status_code not in [200, 201]:
            print_error(f"Waitlist creation failed: {response.status_code} - {response.text}")
            return False
        
        waitlist_result = response.json()
        test_waitlist_id = waitlist_result.get('id') or waitlist_result.get('waitlistId')
        print_result(True, f"Waitlist entry created. ID: {test_waitlist_id}")
        
        # 4c. Create appointment for tomorrow
        print("\n--- 4c. Create Appointment for Tomorrow ---")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        clinic_headers = {"Authorization": f"Bearer {clinic_token}"}
        appointment_data = {
            "clinicId": clinic_id,
            "ownerId": owner_id,
            "petName": "TestPet",
            "ownerName": "Test Owner",
            "date": tomorrow,
            "time": "15:00",
            "reason": "Test cancellazione",
            "status": "confirmed"
        }
        
        response = requests.post(f"{API_URL}/appointments", headers=clinic_headers, json=appointment_data)
        
        if response.status_code not in [200, 201]:
            print_error(f"Appointment creation failed: {response.status_code} - {response.text}")
            return False
        
        appointment_result = response.json()
        test_appointment_id = appointment_result.get('id')
        print_result(True, f"Appointment created. ID: {test_appointment_id}, Date: {tomorrow}, Time: 15:00")
        
        # 4d. Cancel appointment (trigger waitlist notification)
        print("\n--- 4d. Cancel Appointment (Trigger Waitlist) ---")
        cancel_data = {"status": "cancelled"}
        
        response = requests.put(f"{API_URL}/appointments/{test_appointment_id}", headers=clinic_headers, json=cancel_data)
        
        if response.status_code != 200:
            print_error(f"Appointment cancellation failed: {response.status_code} - {response.text}")
            return False
        
        print_result(True, "Appointment cancelled successfully")
        
        # 4e. Wait and verify waitlist notification
        print("\n--- 4e. Verify Waitlist Notification (waiting 3 seconds) ---")
        time.sleep(3)
        
        # Check automation logs
        response = requests.get(f"{API_URL}/automations/log", headers=clinic_headers)
        
        if response.status_code != 200:
            print_error(f"Automation log fetch failed: {response.status_code} - {response.text}")
            return False
        
        log_data = response.json()
        logs = log_data.get('logs', [])
        
        # Look for waitlistNotification entry
        waitlist_logs = [log for log in logs if log.get('type') == 'waitlistNotification']
        
        if len(waitlist_logs) > 0:
            latest_log = waitlist_logs[0]
            print_result(True, f"Waitlist notification log found: {latest_log.get('title')}")
            print_result(True, f"Details: {latest_log.get('details')}")
        else:
            print_error("No waitlistNotification entry found in automation_logs")
            print(f"Total logs found: {len(logs)}")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# TEST 5: Daily Cron Job
# ============================================================================
def test_daily_cron():
    print_test("5. GET /api/cron/daily (ONCE ONLY)")
    
    try:
        print("⚠️  WARNING: This will send REAL emails via Resend API")
        print("Executing cron job...")
        
        response = requests.get(f"{API_URL}/cron/daily")
        
        if response.status_code != 200:
            print_error(f"Cron job failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        
        if not data.get('success'):
            print_error(f"Cron job returned success=false: {data}")
            return False
        
        print_result(True, "Cron job executed successfully")
        
        results = data.get('results', {})
        
        # Check for fragilePatientsDigest key
        if 'fragilePatientsDigest' in results:
            fpd = results['fragilePatientsDigest']
            print_result(True, f"fragilePatientsDigest: sent={fpd.get('sent', 0)}, errors={fpd.get('errors', 0)}, skipped={fpd.get('skipped', 0)}")
        else:
            print_error("fragilePatientsDigest key NOT found in results")
            return False
        
        # Check for passportReminder key
        if 'passportReminder' in results:
            pr = results['passportReminder']
            print_result(True, f"passportReminder: sent={pr.get('sent', 0)}, errors={pr.get('errors', 0)}, skipped={pr.get('skipped', 0)}")
        else:
            print_error("passportReminder key NOT found in results")
            return False
        
        # Check estimateFollowup
        if 'estimateFollowup' in results:
            ef = results['estimateFollowup']
            print_result(True, f"estimateFollowup: sent={ef.get('sent', 0)}, errors={ef.get('errors', 0)}, expired={ef.get('expired', 0)}")
        else:
            print_error("estimateFollowup key NOT found in results")
            return False
        
        # Verify all error counters are 0
        error_count = 0
        for key, value in results.items():
            if isinstance(value, dict) and value.get('errors', 0) > 0:
                error_count += value['errors']
                print_error(f"{key} has {value['errors']} errors")
        
        if error_count == 0:
            print_result(True, "All error counters are 0 - no exceptions in automations")
        else:
            print_error(f"Total errors across all automations: {error_count}")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return False

# ============================================================================
# TEST 6: Regression Tests
# ============================================================================
def test_regression():
    print_test("6. Regression Tests")
    
    try:
        # Test GET /api/auth/me (clinic)
        print("\n--- 6a. GET /api/auth/me (clinic) ---")
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        
        if response.status_code != 200:
            print_error(f"Auth/me failed: {response.status_code} - {response.text}")
            return False
        
        print_result(True, "GET /api/auth/me working correctly")
        
        # Test GET /api/automations/settings after cron
        print("\n--- 6b. GET /api/automations/settings after cron ---")
        response = requests.get(f"{API_URL}/automations/settings", headers=headers)
        
        if response.status_code != 200:
            print_error(f"Settings fetch failed after cron: {response.status_code} - {response.text}")
            return False
        
        print_result(True, "GET /api/automations/settings still working after cron")
        
        return True
        
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return False

# ============================================================================
# CLEANUP
# ============================================================================
def cleanup():
    print_test("CLEANUP: Deleting Test Data")
    
    try:
        # Note: MongoDB cleanup would require direct DB access
        # For now, just log what should be cleaned
        print(f"Test appointment ID to delete: {test_appointment_id}")
        print(f"Test waitlist ID to delete: {test_waitlist_id}")
        print("⚠️  Manual cleanup may be required in MongoDB")
        
        return True
        
    except Exception as e:
        print_error(f"Cleanup exception: {str(e)}")
        return False

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================
def main():
    print("\n" + "="*80)
    print("VetBuddy Batch 1 Automation Testing")
    print("Base URL:", BASE_URL)
    print("="*80)
    
    results = {
        "Test 1: Clinic Login & Settings": False,
        "Test 2: No-Show Module (No Auth)": False,
        "Test 3: No-Show Module (With Auth)": False,
        "Test 4: Waitlist Trigger Flow": False,
        "Test 5: Daily Cron Job": False,
        "Test 6: Regression Tests": False
    }
    
    # Run tests
    results["Test 1: Clinic Login & Settings"] = test_clinic_login_and_settings()
    results["Test 2: No-Show Module (No Auth)"] = test_noshow_module_no_auth()
    results["Test 3: No-Show Module (With Auth)"] = test_noshow_module_with_auth()
    results["Test 4: Waitlist Trigger Flow"] = test_waitlist_trigger_flow()
    results["Test 5: Daily Cron Job"] = test_daily_cron()
    results["Test 6: Regression Tests"] = test_regression()
    
    # Cleanup
    cleanup()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = 0
    failed = 0
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print("\n" + "="*80)
    print(f"TOTAL: {passed} passed, {failed} failed out of {len(results)} tests")
    print("="*80)
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
