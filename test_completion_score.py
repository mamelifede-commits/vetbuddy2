#!/usr/bin/env python3
"""
VetBuddy Connect Module - Completion Score Endpoint Testing
Test rapido del nuovo endpoint GET /api/connect/completion-score (Fase 4 del riposizionamento Ecosistema)
"""

import requests
import json
import time
from pymongo import MongoClient
import os

# Configuration
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"
MONGO_URL = os.getenv("MONGO_URL", "mongodb+srv://mamelifede_db_user:8XjA0yK3dnnyxy0M@cluster0.kk2vrpt.mongodb.net/vetbuddy")
DB_NAME = "vetbuddy"

# Test credentials from /app/memory/test_credentials.md
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

# Test data storage
test_invitation_id = None

def print_test_header(test_name):
    """Print formatted test header"""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(success, message):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")

def login(email, password, role_name):
    """Login and return JWT token"""
    print_test_header(f"Login {role_name}")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            print_result(True, f"{role_name} login successful, token received")
            return token
        else:
            print_result(False, f"{role_name} login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print_result(False, f"{role_name} login error: {str(e)}")
        return None

def get_mongo_client():
    """Get MongoDB client"""
    return MongoClient(MONGO_URL)

# ==================== TEST 1: COMPLETION SCORE PER RUOLO ====================
def test_1_1_completion_score_clinic():
    """TEST 1.1 - GET /api/connect/completion-score come CLINIC"""
    print_test_header("TEST 1.1 - Completion Score CLINIC")
    
    try:
        response = requests.get(
            f"{BASE_URL}/connect/completion-score",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code != 200:
            print_result(False, f"GET /connect/completion-score failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Verify response structure
        required_fields = ['score', 'completed', 'total', 'checklist', 'level']
        for field in required_fields:
            if field not in data:
                print_result(False, f"Missing field: {field}")
                return False
        
        # Verify total = 9 for clinic
        if data['total'] != 9:
            print_result(False, f"Total should be 9 for clinic, got {data['total']}")
            return False
        
        # Verify score is 0-100
        if not (0 <= data['score'] <= 100):
            print_result(False, f"Score should be 0-100, got {data['score']}")
            return False
        
        # Verify checklist has 9 items
        if len(data['checklist']) != 9:
            print_result(False, f"Checklist should have 9 items, got {len(data['checklist'])}")
            return False
        
        # Verify expected keys in checklist
        expected_keys = ['profile', 'services', 'whatsapp', 'qr', 'invite_owners', 'lab_connect', 'first_doc', 'automations', 'passport']
        checklist_keys = [item['key'] for item in data['checklist']]
        for key in expected_keys:
            if key not in checklist_keys:
                print_result(False, f"Missing checklist key: {key}")
                return False
        
        # Verify each checklist item has required fields
        for item in data['checklist']:
            if 'key' not in item or 'label' not in item or 'done' not in item or 'action' not in item:
                print_result(False, f"Checklist item missing required fields: {item}")
                return False
        
        # Verify level is one of the expected values
        if data['level'] not in ['excellent', 'good', 'progress', 'starter']:
            print_result(False, f"Invalid level: {data['level']}")
            return False
        
        print_result(True, f"Clinic completion score: {data['score']}%, completed: {data['completed']}/{data['total']}, level: {data['level']}")
        print(f"Checklist keys: {checklist_keys}")
        return True
        
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

def test_1_2_completion_score_owner():
    """TEST 1.2 - GET /api/connect/completion-score come OWNER"""
    print_test_header("TEST 1.2 - Completion Score OWNER")
    
    try:
        response = requests.get(
            f"{BASE_URL}/connect/completion-score",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        
        if response.status_code != 200:
            print_result(False, f"GET /connect/completion-score failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Verify response structure
        required_fields = ['score', 'completed', 'total', 'checklist', 'level']
        for field in required_fields:
            if field not in data:
                print_result(False, f"Missing field: {field}")
                return False
        
        # Verify total = 7 for owner
        if data['total'] != 7:
            print_result(False, f"Total should be 7 for owner, got {data['total']}")
            return False
        
        # Verify checklist has 7 items
        if len(data['checklist']) != 7:
            print_result(False, f"Checklist should have 7 items, got {len(data['checklist'])}")
            return False
        
        # Verify expected keys in checklist
        expected_keys = ['add_pet', 'microchip', 'emergency', 'allergies', 'invite_clinic', 'qr_emergency', 'documents_viaggio']
        checklist_keys = [item['key'] for item in data['checklist']]
        for key in expected_keys:
            if key not in checklist_keys:
                print_result(False, f"Missing checklist key: {key}")
                return False
        
        # Verify documents_viaggio has optional:true
        documents_viaggio = next((item for item in data['checklist'] if item['key'] == 'documents_viaggio'), None)
        if not documents_viaggio:
            print_result(False, "documents_viaggio not found in checklist")
            return False
        if not documents_viaggio.get('optional'):
            print_result(False, "documents_viaggio should have optional:true")
            return False
        
        print_result(True, f"Owner completion score: {data['score']}%, completed: {data['completed']}/{data['total']}, level: {data['level']}")
        print(f"Checklist keys: {checklist_keys}")
        return True
        
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

def test_1_3_completion_score_lab():
    """TEST 1.3 - GET /api/connect/completion-score come LAB"""
    print_test_header("TEST 1.3 - Completion Score LAB")
    
    try:
        response = requests.get(
            f"{BASE_URL}/connect/completion-score",
            headers={"Authorization": f"Bearer {lab_token}"}
        )
        
        if response.status_code != 200:
            print_result(False, f"GET /connect/completion-score failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Verify response structure
        required_fields = ['score', 'completed', 'total', 'checklist', 'level']
        for field in required_fields:
            if field not in data:
                print_result(False, f"Missing field: {field}")
                return False
        
        # Verify total = 6 for lab
        if data['total'] != 6:
            print_result(False, f"Total should be 6 for lab, got {data['total']}")
            return False
        
        # Verify checklist has 6 items
        if len(data['checklist']) != 6:
            print_result(False, f"Checklist should have 6 items, got {len(data['checklist'])}")
            return False
        
        # Verify expected keys in checklist
        expected_keys = ['profile', 'price_list', 'pickup', 'avg_time', 'invite_clinics', 'clinic_connected']
        checklist_keys = [item['key'] for item in data['checklist']]
        for key in expected_keys:
            if key not in checklist_keys:
                print_result(False, f"Missing checklist key: {key}")
                return False
        
        print_result(True, f"Lab completion score: {data['score']}%, completed: {data['completed']}/{data['total']}, level: {data['level']}")
        print(f"Checklist keys: {checklist_keys}")
        return True
        
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

def test_1_4_completion_score_no_auth():
    """TEST 1.4 - GET /api/connect/completion-score senza Authorization (NEGATIVE)"""
    print_test_header("TEST 1.4 - Completion Score NO AUTH (NEGATIVE)")
    
    try:
        response = requests.get(f"{BASE_URL}/connect/completion-score")
        
        if response.status_code != 401:
            print_result(False, f"Expected 401, got {response.status_code}")
            return False
        
        print_result(True, f"Correctly returned 401 for unauthenticated request")
        return True
        
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

# ==================== TEST 2: REGRESSION CONNECT MODULE ====================
def test_2_1_connect_stats():
    """TEST 2.1 - GET /api/connect/stats come clinic"""
    print_test_header("TEST 2.1 - Connect Stats Regression")
    
    try:
        response = requests.get(
            f"{BASE_URL}/connect/stats",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code != 200:
            print_result(False, f"GET /connect/stats failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Verify required fields
        required_fields = ['sentTotal', 'sentAccepted', 'sentPending', 'conversionRate']
        for field in required_fields:
            if field not in data:
                print_result(False, f"Missing field: {field}")
                return False
        
        # Verify clinic-specific fields
        clinic_fields = ['ownersConnected', 'petsLinked', 'labsConnected']
        for field in clinic_fields:
            if field not in data:
                print_result(False, f"Missing clinic field: {field}")
                return False
        
        print_result(True, f"Connect stats working: sentTotal={data['sentTotal']}, ownersConnected={data['ownersConnected']}")
        return True
        
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

def test_2_2_connect_invitations():
    """TEST 2.2 - GET /api/connect/invitations come owner"""
    print_test_header("TEST 2.2 - Connect Invitations Regression")
    
    try:
        response = requests.get(
            f"{BASE_URL}/connect/invitations",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        
        if response.status_code != 200:
            print_result(False, f"GET /connect/invitations failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2, default=str)}")
        
        # Verify required fields
        if 'sent' not in data or 'received' not in data:
            print_result(False, "Missing sent or received arrays")
            return False
        
        if not isinstance(data['sent'], list) or not isinstance(data['received'], list):
            print_result(False, "sent and received should be arrays")
            return False
        
        print_result(True, f"Connect invitations working: sent={len(data['sent'])}, received={len(data['received'])}")
        return True
        
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

def test_2_3_connect_invite():
    """TEST 2.3 - POST /api/connect/invite (clinic→owner)"""
    print_test_header("TEST 2.3 - Connect Invite Creation")
    
    global test_invitation_id
    
    try:
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            headers={
                "Authorization": f"Bearer {clinic_token}",
                "Content-Type": "application/json"
            },
            json={
                "type": "clinic_to_owner",
                "toEmail": "test_completion@example.com",
                "toName": "Test Completion User",
                "message": "Test invitation for completion score testing"
            }
        )
        
        if response.status_code != 200:
            print_result(False, f"POST /connect/invite failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2, default=str)}")
        
        if not data.get('success'):
            print_result(False, "Response should have success:true")
            return False
        
        if 'invitation' not in data:
            print_result(False, "Response should have invitation object")
            return False
        
        test_invitation_id = data['invitation'].get('id')
        print_result(True, f"Invitation created successfully: {test_invitation_id}")
        return True
        
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

def test_2_4_cleanup():
    """TEST 2.4 - CLEANUP: rimuovi invito e provisional profile"""
    print_test_header("TEST 2.4 - Cleanup Test Data")
    
    global test_invitation_id
    
    try:
        client = get_mongo_client()
        db = client[DB_NAME]
        
        # Delete invitation
        if test_invitation_id:
            result = db.invitations.delete_one({"id": test_invitation_id})
            print_result(True, f"Deleted invitation: {result.deleted_count} document(s)")
        
        # Delete provisional profile
        result = db.provisional_profiles.delete_one({"email": "test_completion@example.com"})
        print_result(True, f"Deleted provisional profile: {result.deleted_count} document(s)")
        
        client.close()
        return True
        
    except Exception as e:
        print_result(False, f"Cleanup error: {str(e)}")
        return False

# ==================== MAIN TEST RUNNER ====================
def run_all_tests():
    """Run all tests in sequence"""
    global clinic_token, lab_token, owner_token
    
    print("\n" + "="*80)
    print("VetBuddy Connect - Completion Score Endpoint Testing")
    print("Base URL:", BASE_URL)
    print("="*80)
    
    # Login all users
    clinic_token = login(CLINIC_EMAIL, CLINIC_PASSWORD, "CLINIC")
    if not clinic_token:
        print("\n❌ CRITICAL: Clinic login failed, cannot continue")
        return
    
    lab_token = login(LAB_EMAIL, LAB_PASSWORD, "LAB")
    if not lab_token:
        print("\n❌ CRITICAL: Lab login failed, cannot continue")
        return
    
    owner_token = login(OWNER_EMAIL, OWNER_PASSWORD, "OWNER")
    if not owner_token:
        print("\n❌ CRITICAL: Owner login failed, cannot continue")
        return
    
    # Track results
    results = {
        "passed": 0,
        "failed": 0,
        "tests": []
    }
    
    # TEST 1 - COMPLETION SCORE PER RUOLO
    tests = [
        ("TEST 1.1 - Completion Score CLINIC", test_1_1_completion_score_clinic),
        ("TEST 1.2 - Completion Score OWNER", test_1_2_completion_score_owner),
        ("TEST 1.3 - Completion Score LAB", test_1_3_completion_score_lab),
        ("TEST 1.4 - Completion Score NO AUTH", test_1_4_completion_score_no_auth),
    ]
    
    # TEST 2 - REGRESSION CONNECT MODULE
    tests.extend([
        ("TEST 2.1 - Connect Stats", test_2_1_connect_stats),
        ("TEST 2.2 - Connect Invitations", test_2_2_connect_invitations),
        ("TEST 2.3 - Connect Invite", test_2_3_connect_invite),
        ("TEST 2.4 - Cleanup", test_2_4_cleanup),
    ])
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            result = test_func()
            results["tests"].append({"name": test_name, "passed": result})
            if result:
                results["passed"] += 1
            else:
                results["failed"] += 1
        except Exception as e:
            print_result(False, f"{test_name} exception: {str(e)}")
            results["tests"].append({"name": test_name, "passed": False})
            results["failed"] += 1
    
    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Total Tests: {results['passed'] + results['failed']}")
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"Success Rate: {(results['passed'] / (results['passed'] + results['failed']) * 100):.1f}%")
    print("\nDetailed Results:")
    for test in results["tests"]:
        status = "✅ PASS" if test["passed"] else "❌ FAIL"
        print(f"  {status}: {test['name']}")
    print("="*80)

if __name__ == "__main__":
    run_all_tests()
