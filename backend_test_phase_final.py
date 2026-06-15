#!/usr/bin/env python3
"""
VetBuddy Backend API Testing Script - FASE FINALE BACKLOG
Test dei 2 nuovi endpoint backend:
1. Profilo pubblico laboratorio (GET /api/laboratorio/:slug)
2. Referral credits (GET /api/connect/referral-credits)
3. Regression tests
4. End-to-end test: accept invitation → credit added
"""

import requests
import json
import sys
from datetime import datetime
from pymongo import MongoClient
import os

# Base URL
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"
LAB_EMAIL = "laboratorio1@vetbuddy.it"
LAB_PASSWORD = "Lab2025!"
OWNER_EMAIL = "proprietario.demo@vetbuddy.it"
OWNER_PASSWORD = "demo123"

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb+srv://mamelifede_db_user:8XjA0yK3dnnyxy0M@cluster0.kk2vrpt.mongodb.net/vetbuddy')
DB_NAME = os.getenv('DB_NAME', 'vetbuddy')

# Global tokens
clinic_token = None
lab_token = None
owner_token = None
mongo_client = None
db = None

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

def connect_mongodb():
    """Connect to MongoDB"""
    global mongo_client, db
    try:
        print(f"\n🔌 Connecting to MongoDB...")
        mongo_client = MongoClient(MONGO_URL)
        db = mongo_client[DB_NAME]
        # Test connection
        db.command('ping')
        print(f"✅ MongoDB connected successfully")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {str(e)}")
        return False

def get_lab_id_from_db():
    """Get lab ID from MongoDB for laboratorio1@vetbuddy.it"""
    try:
        users = db['users']
        lab = users.find_one({'email': LAB_EMAIL, 'role': 'lab'})
        if lab and 'id' in lab:
            print(f"✅ Found lab ID: {lab['id']}")
            return lab['id']
        else:
            print(f"❌ Lab not found in database")
            return None
    except Exception as e:
        print(f"❌ Error getting lab ID: {str(e)}")
        return None

def cleanup_test_data(email_pattern):
    """Cleanup test data from database"""
    try:
        # Remove test user
        users = db['users']
        result = users.delete_many({'email': {'$regex': email_pattern}})
        print(f"  Deleted {result.deleted_count} test users")
        
        # Remove test invitations
        invitations = db['invitations']
        result = invitations.delete_many({'toEmail': {'$regex': email_pattern}})
        print(f"  Deleted {result.deleted_count} test invitations")
        
        # Remove test provisional profiles
        provisional = db['provisional_profiles']
        result = provisional.delete_many({'email': {'$regex': email_pattern}})
        print(f"  Deleted {result.deleted_count} test provisional profiles")
        
        return True
    except Exception as e:
        print(f"❌ Cleanup error: {str(e)}")
        return False

def remove_referral_credit_from_clinic(invitation_id):
    """Remove referral credit from clinic user"""
    try:
        users = db['users']
        result = users.update_one(
            {'email': CLINIC_EMAIL},
            {'$pull': {'referralCredits': {'sourceInvitationId': invitation_id}}}
        )
        print(f"  Removed referral credit (matched: {result.matched_count}, modified: {result.modified_count})")
        return True
    except Exception as e:
        print(f"❌ Error removing referral credit: {str(e)}")
        return False

# ==================== TEST 1 - PROFILO PUBBLICO LABORATORIO ====================

def test_1_1_lab_profile_public():
    """TEST 1.1 - GET /api/laboratorio/:slug (no auth, slug = lab ID)"""
    print_test("1.1 - GET /api/laboratorio/:slug (public lab profile)")
    
    try:
        # Get lab ID from database
        lab_id = get_lab_id_from_db()
        if not lab_id:
            return print_result(False, "Could not get lab ID from database")
        
        # GET public lab profile
        response = requests.get(f"{BASE_URL}/laboratorio/{lab_id}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
        
        data = response.json()
        
        # Verify required fields
        required_fields = ['id', 'name', 'city', 'address', 'phone', 'specializations', 
                          'averageReportTime', 'pickupAvailable', 'priceList', 'verified']
        
        for field in required_fields:
            if field not in data:
                return print_result(False, f"Missing required field '{field}' in response")
        
        # Verify verified is true
        if data['verified'] != True:
            return print_result(False, f"Expected verified=true, got {data['verified']}")
        
        # Verify priceList is array
        if not isinstance(data['priceList'], list):
            return print_result(False, f"priceList should be array, got {type(data['priceList'])}")
        
        print(f"Lab profile: {data['name']} - {data['city']}")
        print(f"  Phone: {data['phone']}")
        print(f"  Pickup available: {data['pickupAvailable']}")
        print(f"  Average report time: {data['averageReportTime']}")
        print(f"  Price list items: {len(data['priceList'])}")
        print(f"  Verified: {data['verified']}")
        
        return print_result(True, f"Lab profile endpoint working correctly (ID: {lab_id})")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_1_2_lab_profile_invalid():
    """TEST 1.2 - GET /api/laboratorio/INVALID_SLUG (should be 404)"""
    print_test("1.2 - GET /api/laboratorio/INVALID_SLUG (should be 404)")
    
    try:
        response = requests.get(f"{BASE_URL}/laboratorio/INVALID_SLUG_12345")
        
        if response.status_code != 404:
            return print_result(False, f"Expected 404, got {response.status_code}")
        
        data = response.json()
        if 'error' not in data:
            return print_result(False, "Expected error message in response")
        
        if 'non trovato' not in data['error'].lower():
            return print_result(False, f"Expected 'non trovato' in error, got: {data['error']}")
        
        print(f"Error message: {data['error']}")
        
        return print_result(True, "Invalid slug correctly returns 404")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_1_3_lab_profile_not_published():
    """TEST 1.3 - GET /api/laboratorio/:id where publishInDirectory=false (should be 404)"""
    print_test("1.3 - GET /api/laboratorio/:id with publishInDirectory=false")
    
    try:
        # Get lab ID
        lab_id = get_lab_id_from_db()
        if not lab_id:
            return print_result(False, "Could not get lab ID from database")
        
        # Update lab to set publishInDirectory=false
        users = db['users']
        users.update_one({'id': lab_id}, {'$set': {'publishInDirectory': False}})
        print(f"  Set publishInDirectory=false for lab {lab_id}")
        
        # Try to get lab profile
        response = requests.get(f"{BASE_URL}/laboratorio/{lab_id}")
        
        # Should be 404
        if response.status_code != 404:
            # Cleanup before returning
            users.update_one({'id': lab_id}, {'$unset': {'publishInDirectory': ''}})
            return print_result(False, f"Expected 404, got {response.status_code}")
        
        print(f"  Lab profile correctly hidden (404)")
        
        # Cleanup: remove publishInDirectory field
        users.update_one({'id': lab_id}, {'$unset': {'publishInDirectory': ''}})
        print(f"  Cleanup: removed publishInDirectory field")
        
        return print_result(True, "Lab profile correctly hidden when publishInDirectory=false")
        
    except Exception as e:
        # Cleanup on error
        try:
            lab_id = get_lab_id_from_db()
            if lab_id:
                users = db['users']
                users.update_one({'id': lab_id}, {'$unset': {'publishInDirectory': ''}})
        except:
            pass
        return print_result(False, f"Exception: {str(e)}")

# ==================== TEST 2 - REFERRAL CREDITS ====================

def test_2_1_referral_credits_clinic():
    """TEST 2.1 - GET /api/connect/referral-credits as clinic"""
    print_test("2.1 - GET /api/connect/referral-credits as clinic")
    
    global clinic_token
    if not clinic_token:
        return print_result(False, "No clinic token available")
    
    try:
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{BASE_URL}/connect/referral-credits", headers=headers)
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code} - {response.text}")
        
        data = response.json()
        
        # Verify response structure
        if 'credits' not in data:
            return print_result(False, "Missing 'credits' field in response")
        
        if 'totals' not in data:
            return print_result(False, "Missing 'totals' field in response")
        
        if 'stats' not in data:
            return print_result(False, "Missing 'stats' field in response")
        
        # Verify totals structure
        totals = data['totals']
        required_totals = ['pending', 'available', 'redeemed', 'expired']
        
        for field in required_totals:
            if field not in totals:
                return print_result(False, f"Missing '{field}' in totals")
            if 'count' not in totals[field]:
                return print_result(False, f"Missing 'count' in totals.{field}")
            if 'amount' not in totals[field]:
                return print_result(False, f"Missing 'amount' in totals.{field}")
        
        # Verify credits is array
        if not isinstance(data['credits'], list):
            return print_result(False, f"credits should be array, got {type(data['credits'])}")
        
        print(f"Referral credits:")
        print(f"  Total credits: {len(data['credits'])}")
        print(f"  Pending: {totals['pending']['count']} credits, €{totals['pending']['amount']}")
        print(f"  Available: {totals['available']['count']} credits, €{totals['available']['amount']}")
        print(f"  Redeemed: {totals['redeemed']['count']} credits, €{totals['redeemed']['amount']}")
        print(f"  Expired: {totals['expired']['count']} credits, €{totals['expired']['amount']}")
        print(f"  Stats: {data['stats']}")
        
        return print_result(True, "Referral credits endpoint working correctly")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_2_2_referral_credits_no_auth():
    """TEST 2.2 - GET /api/connect/referral-credits without auth (should be 401)"""
    print_test("2.2 - GET /api/connect/referral-credits without auth")
    
    try:
        response = requests.get(f"{BASE_URL}/connect/referral-credits")
        
        if response.status_code != 401:
            return print_result(False, f"Expected 401, got {response.status_code}")
        
        return print_result(True, "Unauthorized access correctly blocked (401)")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_2_3_e2e_accept_invitation_credit():
    """TEST 2.3 - End-to-end: accept invitation → credit added"""
    print_test("2.3 - E2E: Clinic invites lab → lab accepts → credit added")
    
    global clinic_token
    if not clinic_token:
        return print_result(False, "No clinic token available")
    
    test_email = "referral_test@example.com"
    test_password = "Test123!"
    invitation_id = None
    token = None
    new_lab_token = None
    
    try:
        # Step A: Clinic invites lab
        print(f"\n  Step A: Clinic invites lab to {test_email}")
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            json={
                "type": "clinic_to_lab",
                "toEmail": test_email,
                "toName": "Test Lab Referral",
                "message": "Test invitation for referral credit"
            },
            headers=headers
        )
        
        if response.status_code != 200:
            return print_result(False, f"Step A failed: {response.status_code} - {response.text}")
        
        data = response.json()
        if not data.get('success'):
            return print_result(False, f"Step A failed: {data}")
        
        invitation_id = data.get('invitation', {}).get('id')
        print(f"  ✅ Invitation sent (ID: {invitation_id})")
        
        # Step B: Get token from database
        print(f"\n  Step B: Retrieve invitation token from database")
        invitations = db['invitations']
        invite = invitations.find_one({'id': invitation_id})
        if not invite:
            return print_result(False, "Step B failed: Invitation not found in database")
        
        token = invite.get('token')
        if not token:
            return print_result(False, "Step B failed: Token not found in invitation")
        
        print(f"  ✅ Token retrieved: {token[:20]}...")
        
        # Step C: Register new lab user
        print(f"\n  Step C: Register new lab user {test_email}")
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": test_email,
                "password": test_password,
                "role": "lab",
                "name": "Test Lab Referral",
                "labName": "Test Lab Referral"
            }
        )
        
        if response.status_code != 200:
            return print_result(False, f"Step C failed: {response.status_code} - {response.text}")
        
        data = response.json()
        new_lab_token = data.get('token')
        if not new_lab_token:
            return print_result(False, "Step C failed: No token in registration response")
        
        print(f"  ✅ Lab user registered")
        
        # Step D: Accept invitation as new lab
        print(f"\n  Step D: New lab accepts invitation")
        headers = {"Authorization": f"Bearer {new_lab_token}"}
        response = requests.post(
            f"{BASE_URL}/connect/accept",
            json={"token": token},
            headers=headers
        )
        
        if response.status_code != 200:
            return print_result(False, f"Step D failed: {response.status_code} - {response.text}")
        
        data = response.json()
        if not data.get('success'):
            return print_result(False, f"Step D failed: {data}")
        
        print(f"  ✅ Invitation accepted")
        
        # Step E: Verify credit added to clinic
        print(f"\n  Step E: Verify referral credit added to clinic")
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{BASE_URL}/connect/referral-credits", headers=headers)
        
        if response.status_code != 200:
            return print_result(False, f"Step E failed: {response.status_code} - {response.text}")
        
        data = response.json()
        credits = data.get('credits', [])
        
        # Find credit for this invitation
        credit_found = False
        for credit in credits:
            if credit.get('type') == 'clinic_to_lab' and credit.get('amount') == 30 and credit.get('status') == 'pending':
                credit_found = True
                print(f"  ✅ Credit found: €{credit['amount']}, status: {credit['status']}, type: {credit['type']}")
                break
        
        if not credit_found:
            return print_result(False, f"Step E failed: Credit not found in clinic's referral credits")
        
        # Cleanup
        print(f"\n  Cleanup: Removing test data")
        cleanup_test_data(test_email)
        if invitation_id:
            remove_referral_credit_from_clinic(invitation_id)
        
        return print_result(True, "E2E test passed: Invitation accepted → credit added (€30, pending)")
        
    except Exception as e:
        # Cleanup on error
        try:
            cleanup_test_data(test_email)
            if invitation_id:
                remove_referral_credit_from_clinic(invitation_id)
        except:
            pass
        return print_result(False, f"Exception: {str(e)}")

# ==================== TEST 3 - REGRESSION ====================

def test_3_1_regression_directory_clinics():
    """TEST 3.1 - GET /api/directory/clinics (regression)"""
    print_test("3.1 - GET /api/directory/clinics (regression)")
    
    try:
        response = requests.get(f"{BASE_URL}/directory/clinics")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        
        if 'clinics' not in data or 'total' not in data:
            return print_result(False, "Missing required fields in response")
        
        print(f"  Found {len(data['clinics'])} clinics (total: {data['total']})")
        
        return print_result(True, "Directory clinics endpoint working")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_3_2_regression_directory_labs():
    """TEST 3.2 - GET /api/directory/labs (regression)"""
    print_test("3.2 - GET /api/directory/labs (regression)")
    
    try:
        response = requests.get(f"{BASE_URL}/directory/labs")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        
        if 'labs' not in data or 'total' not in data:
            return print_result(False, "Missing required fields in response")
        
        print(f"  Found {len(data['labs'])} labs (total: {data['total']})")
        
        return print_result(True, "Directory labs endpoint working")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_3_3_regression_connect_stats():
    """TEST 3.3 - GET /api/connect/stats as clinic (regression)"""
    print_test("3.3 - GET /api/connect/stats as clinic (regression)")
    
    global clinic_token
    if not clinic_token:
        return print_result(False, "No clinic token available")
    
    try:
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{BASE_URL}/connect/stats", headers=headers)
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        print(f"  Stats: {data}")
        
        return print_result(True, "Connect stats endpoint working")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_3_4_regression_morning_briefing():
    """TEST 3.4 - GET /api/clinic/morning-briefing as clinic (regression)"""
    print_test("3.4 - GET /api/clinic/morning-briefing as clinic (regression)")
    
    global clinic_token
    if not clinic_token:
        return print_result(False, "No clinic token available")
    
    try:
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{BASE_URL}/clinic/morning-briefing", headers=headers)
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        
        # Verify 11 summary fields
        summary = data.get('summary', {})
        required_fields = [
            'appointmentsToday', 'unconfirmedToday', 'consentsMissing', 
            'staleLabReports', 'pendingInvites', 'expiredInvites',
            'previsitIncomplete', 'cancelledSlots', 'dormantClients',
            'urgentTasks', 'unreadMessages'
        ]
        
        for field in required_fields:
            if field not in summary:
                return print_result(False, f"Missing field '{field}' in summary")
        
        print(f"  Summary fields: {len(summary)} (all 11 present)")
        
        return print_result(True, "Morning briefing endpoint working with all 11 fields")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_3_5_regression_completion_score():
    """TEST 3.5 - GET /api/connect/completion-score as owner (regression)"""
    print_test("3.5 - GET /api/connect/completion-score as owner (regression)")
    
    global owner_token
    if not owner_token:
        return print_result(False, "No owner token available")
    
    try:
        headers = {"Authorization": f"Bearer {owner_token}"}
        response = requests.get(f"{BASE_URL}/connect/completion-score", headers=headers)
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        
        if 'score' not in data or 'checklist' not in data:
            return print_result(False, "Missing required fields in response")
        
        print(f"  Completion score: {data['score']}%")
        print(f"  Checklist items: {len(data['checklist'])}")
        
        return print_result(True, "Completion score endpoint working")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def main():
    """Main test execution"""
    global clinic_token, lab_token, owner_token
    
    print("\n" + "="*80)
    print("VetBuddy Backend API Testing - FASE FINALE BACKLOG")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Connect to MongoDB
    if not connect_mongodb():
        print("\n❌ CRITICAL: MongoDB connection failed. Cannot proceed.")
        sys.exit(1)
    
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
    
    # TEST 1 - PROFILO PUBBLICO LABORATORIO
    print("\n" + "="*80)
    print("TEST SUITE 1: PROFILO PUBBLICO LABORATORIO")
    print("="*80)
    
    results.append(("1.1 Lab Profile Public", test_1_1_lab_profile_public()))
    results.append(("1.2 Lab Profile Invalid Slug", test_1_2_lab_profile_invalid()))
    results.append(("1.3 Lab Profile Not Published", test_1_3_lab_profile_not_published()))
    
    # TEST 2 - REFERRAL CREDITS
    print("\n" + "="*80)
    print("TEST SUITE 2: REFERRAL CREDITS")
    print("="*80)
    
    if clinic_token:
        results.append(("2.1 Referral Credits Clinic", test_2_1_referral_credits_clinic()))
    else:
        print("\n⚠️  SKIPPED: Test 2.1 (no clinic token)")
        results.append(("2.1 Referral Credits Clinic", False))
    
    results.append(("2.2 Referral Credits No Auth", test_2_2_referral_credits_no_auth()))
    
    if clinic_token:
        results.append(("2.3 E2E Accept Invitation Credit", test_2_3_e2e_accept_invitation_credit()))
    else:
        print("\n⚠️  SKIPPED: Test 2.3 (no clinic token)")
        results.append(("2.3 E2E Accept Invitation Credit", False))
    
    # TEST 3 - REGRESSION
    print("\n" + "="*80)
    print("TEST SUITE 3: REGRESSION")
    print("="*80)
    
    results.append(("3.1 Directory Clinics", test_3_1_regression_directory_clinics()))
    results.append(("3.2 Directory Labs", test_3_2_regression_directory_labs()))
    
    if clinic_token:
        results.append(("3.3 Connect Stats", test_3_3_regression_connect_stats()))
        results.append(("3.4 Morning Briefing", test_3_4_regression_morning_briefing()))
    else:
        print("\n⚠️  SKIPPED: Tests 3.3-3.4 (no clinic token)")
        results.append(("3.3 Connect Stats", False))
        results.append(("3.4 Morning Briefing", False))
    
    if owner_token:
        results.append(("3.5 Completion Score", test_3_5_regression_completion_score()))
    else:
        print("\n⚠️  SKIPPED: Test 3.5 (no owner token)")
        results.append(("3.5 Completion Score", False))
    
    # Close MongoDB connection
    if mongo_client:
        mongo_client.close()
        print("\n🔌 MongoDB connection closed")
    
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
