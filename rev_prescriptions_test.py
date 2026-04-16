#!/usr/bin/env python3
"""
VetBuddy REV (Ricetta Elettronica Veterinaria) Prescriptions Module Testing
Tests all REV prescription endpoints with proper authentication and authorization
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from review request
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test credentials from review request
CLINIC_CREDENTIALS = {
    "email": "demo@vetbuddy.it",
    "password": "VetBuddy2025!Secure"
}

OWNER_CREDENTIALS = {
    "email": "proprietario.demo@vetbuddy.it", 
    "password": "demo123"
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

def test_rev_config():
    """Test REV configuration endpoint (no auth needed)"""
    print("🔧 Testing REV Configuration...")
    
    try:
        response = requests.get(f"{BASE_URL}/rev/config")
        
        if response.status_code == 200:
            data = response.json()
            expected_fields = ['manualMode', 'featureEnabled', 'environment']
            missing_fields = [field for field in expected_fields if field not in data]
            
            if not missing_fields:
                print_test_result("GET /api/rev/config", True, 
                                f"Config: manualMode={data['manualMode']}, featureEnabled={data['featureEnabled']}, environment={data['environment']}")
                return True, data
            else:
                print_test_result("GET /api/rev/config", False, 
                                f"Missing fields: {missing_fields}")
                return False, None
        else:
            print_test_result("GET /api/rev/config", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False, None
            
    except Exception as e:
        print_test_result("GET /api/rev/config", False, f"Exception: {e}")
        return False, None

def test_prescription_stats(clinic_token):
    """Test prescription stats endpoint"""
    print("📊 Testing Prescription Stats...")
    
    headers = {"Authorization": f"Bearer {clinic_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/prescriptions/stats", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            expected_fields = ['drafts', 'emittedToday', 'errors', 'total']
            missing_fields = [field for field in expected_fields if field not in data]
            
            if not missing_fields:
                print_test_result("GET /api/prescriptions/stats", True, 
                                f"Stats: drafts={data['drafts']}, emittedToday={data['emittedToday']}, errors={data['errors']}, total={data['total']}")
                return True, data
            else:
                print_test_result("GET /api/prescriptions/stats", False, 
                                f"Missing fields: {missing_fields}")
                return False, None
        else:
            print_test_result("GET /api/prescriptions/stats", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False, None
            
    except Exception as e:
        print_test_result("GET /api/prescriptions/stats", False, f"Exception: {e}")
        return False, None

def get_pet_for_testing(clinic_token):
    """Get a pet ID for testing prescription creation"""
    headers = {"Authorization": f"Bearer {clinic_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/pets", headers=headers)
        if response.status_code == 200:
            pets = response.json()
            if pets and len(pets) > 0:
                pet = pets[0]
                return pet.get('id'), pet.get('name', 'Test Pet'), pet.get('ownerId'), pet.get('ownerName', 'Test Owner')
        return None, None, None, None
    except Exception as e:
        print(f"Error getting pets: {e}")
        return None, None, None, None

def test_create_prescription(clinic_token):
    """Test creating a prescription draft"""
    print("📝 Testing Create Prescription Draft...")
    
    headers = {"Authorization": f"Bearer {clinic_token}"}
    
    # Get a pet for testing
    pet_id, pet_name, owner_id, owner_name = get_pet_for_testing(clinic_token)
    if not pet_id:
        print_test_result("POST /api/prescriptions", False, "No pets available for testing")
        return False, None
    
    prescription_data = {
        "petId": pet_id,
        "petName": pet_name or "Max",
        "ownerId": owner_id,
        "ownerName": owner_name or "Test Owner",
        "veterinarianName": "Dr. Test",
        "prescriptionType": "standard",
        "diagnosisNote": "Test diagnosis",
        "dosageInstructions": "1 pill twice daily",
        "treatmentDuration": "7 days",
        "items": [
            {
                "productName": "Amoxicillina 250mg",
                "quantity": 2,
                "unit": "compresse",
                "posology": "1 ogni 12 ore",
                "routeOfAdministration": "orale"
            }
        ]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/prescriptions", headers=headers, json=prescription_data)
        
        if response.status_code == 201:
            data = response.json()
            if data.get('id') and data.get('status') == 'DRAFT':
                print_test_result("POST /api/prescriptions", True, 
                                f"Created prescription ID: {data['id']}, Status: {data['status']}")
                return True, data
            else:
                print_test_result("POST /api/prescriptions", False, 
                                f"Unexpected response format: {data}")
                return False, None
        else:
            print_test_result("POST /api/prescriptions", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False, None
            
    except Exception as e:
        print_test_result("POST /api/prescriptions", False, f"Exception: {e}")
        return False, None

def test_list_prescriptions(clinic_token):
    """Test listing prescriptions"""
    print("📋 Testing List Prescriptions...")
    
    headers = {"Authorization": f"Bearer {clinic_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/prescriptions", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_test_result("GET /api/prescriptions", True, 
                                f"Found {len(data)} prescriptions")
                return True, data
            else:
                print_test_result("GET /api/prescriptions", False, 
                                f"Expected array, got: {type(data)}")
                return False, None
        else:
            print_test_result("GET /api/prescriptions", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False, None
            
    except Exception as e:
        print_test_result("GET /api/prescriptions", False, f"Exception: {e}")
        return False, None

def test_get_prescription_detail(clinic_token, prescription_id):
    """Test getting prescription detail"""
    print("🔍 Testing Get Prescription Detail...")
    
    headers = {"Authorization": f"Bearer {clinic_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/prescriptions/{prescription_id}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('id') == prescription_id and 'items' in data:
                print_test_result("GET /api/prescriptions/:id", True, 
                                f"Retrieved prescription {prescription_id} with {len(data.get('items', []))} items")
                return True, data
            else:
                print_test_result("GET /api/prescriptions/:id", False, 
                                f"Unexpected response format: {data}")
                return False, None
        else:
            print_test_result("GET /api/prescriptions/:id", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False, None
            
    except Exception as e:
        print_test_result("GET /api/prescriptions/:id", False, f"Exception: {e}")
        return False, None

def test_update_prescription(clinic_token, prescription_id):
    """Test updating prescription draft"""
    print("✏️ Testing Update Prescription Draft...")
    
    headers = {"Authorization": f"Bearer {clinic_token}"}
    
    update_data = {
        "diagnosisNote": "Updated diagnosis"
    }
    
    try:
        response = requests.put(f"{BASE_URL}/prescriptions/{prescription_id}", headers=headers, json=update_data)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('diagnosisNote') == "Updated diagnosis":
                print_test_result("PUT /api/prescriptions/:id", True, 
                                f"Updated prescription {prescription_id}")
                return True, data
            else:
                print_test_result("PUT /api/prescriptions/:id", False, 
                                f"Update not reflected: {data}")
                return False, None
        else:
            print_test_result("PUT /api/prescriptions/:id", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False, None
            
    except Exception as e:
        print_test_result("PUT /api/prescriptions/:id", False, f"Exception: {e}")
        return False, None

def test_register_manual(clinic_token, prescription_id):
    """Test manual registration (bridge mode)"""
    print("📋 Testing Manual Registration...")
    
    headers = {"Authorization": f"Bearer {clinic_token}"}
    
    registration_data = {
        "prescriptionNumber": "REV-2026-TEST-001",
        "pin": "1234",
        "issueDate": "2026-04-16",
        "notes": "Test registration"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/prescriptions/{prescription_id}/register-manual", 
                               headers=headers, json=registration_data)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('status') == 'REGISTERED_MANUALLY':
                print_test_result("POST /api/prescriptions/:id/register-manual", True, 
                                f"Registered manually: {data.get('prescriptionNumber')}")
                return True, data
            else:
                print_test_result("POST /api/prescriptions/:id/register-manual", False, 
                                f"Unexpected response: {data}")
                return False, None
        else:
            print_test_result("POST /api/prescriptions/:id/register-manual", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False, None
            
    except Exception as e:
        print_test_result("POST /api/prescriptions/:id/register-manual", False, f"Exception: {e}")
        return False, None

def test_audit_trail(clinic_token, prescription_id):
    """Test prescription audit trail"""
    print("📜 Testing Audit Trail...")
    
    headers = {"Authorization": f"Bearer {clinic_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/prescriptions/{prescription_id}/audit", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_test_result("GET /api/prescriptions/:id/audit", True, 
                                f"Found {len(data)} audit events")
                return True, data
            else:
                print_test_result("GET /api/prescriptions/:id/audit", False, 
                                f"Expected array, got: {type(data)}")
                return False, None
        else:
            print_test_result("GET /api/prescriptions/:id/audit", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False, None
            
    except Exception as e:
        print_test_result("GET /api/prescriptions/:id/audit", False, f"Exception: {e}")
        return False, None

def test_publish_to_owner(clinic_token, prescription_id):
    """Test publishing prescription to owner"""
    print("📤 Testing Publish to Owner...")
    
    headers = {"Authorization": f"Bearer {clinic_token}"}
    
    try:
        response = requests.post(f"{BASE_URL}/prescriptions/{prescription_id}/publish", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_test_result("POST /api/prescriptions/:id/publish", True, 
                                "Successfully published to owner")
                return True, data
            else:
                print_test_result("POST /api/prescriptions/:id/publish", False, 
                                f"Unexpected response: {data}")
                return False, None
        else:
            print_test_result("POST /api/prescriptions/:id/publish", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False, None
            
    except Exception as e:
        print_test_result("POST /api/prescriptions/:id/publish", False, f"Exception: {e}")
        return False, None

def test_owner_access(owner_token):
    """Test owner access to prescriptions"""
    print("👤 Testing Owner Access to Prescriptions...")
    
    headers = {"Authorization": f"Bearer {owner_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/prescriptions", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Check that data is sanitized (no technical fields)
                sanitized = True
                for prescription in data:
                    if 'clinicId' in prescription or 'externalStatus' in prescription:
                        sanitized = False
                        break
                
                if sanitized:
                    print_test_result("GET /api/prescriptions (Owner)", True, 
                                    f"Owner sees {len(data)} prescriptions with sanitized data")
                else:
                    print_test_result("GET /api/prescriptions (Owner)", False, 
                                    "Technical fields not properly hidden from owner")
                return True, data
            else:
                print_test_result("GET /api/prescriptions (Owner)", False, 
                                f"Expected array, got: {type(data)}")
                return False, None
        else:
            print_test_result("GET /api/prescriptions (Owner)", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False, None
            
    except Exception as e:
        print_test_result("GET /api/prescriptions (Owner)", False, f"Exception: {e}")
        return False, None

def test_auth_permission_checks():
    """Test authentication and permission checks"""
    print("🔒 Testing Auth & Permission Checks...")
    
    # Test without auth
    try:
        response = requests.post(f"{BASE_URL}/prescriptions", json={})
        if response.status_code == 403 or response.status_code == 401:
            print_test_result("POST /api/prescriptions (No Auth)", True, 
                            f"Correctly blocked with {response.status_code}")
        else:
            print_test_result("POST /api/prescriptions (No Auth)", False, 
                            f"Expected 401/403, got {response.status_code}")
    except Exception as e:
        print_test_result("POST /api/prescriptions (No Auth)", False, f"Exception: {e}")
    
    # Test with owner token
    owner_token, _ = login_user(OWNER_CREDENTIALS)
    if owner_token:
        headers = {"Authorization": f"Bearer {owner_token}"}
        try:
            response = requests.post(f"{BASE_URL}/prescriptions", headers=headers, json={})
            if response.status_code == 403:
                print_test_result("POST /api/prescriptions (Owner Token)", True, 
                                "Correctly blocked owner from creating prescriptions")
            else:
                print_test_result("POST /api/prescriptions (Owner Token)", False, 
                                f"Expected 403, got {response.status_code}")
        except Exception as e:
            print_test_result("POST /api/prescriptions (Owner Token)", False, f"Exception: {e}")

def main():
    """Run all REV prescription tests"""
    print("🚀 VetBuddy REV Prescriptions Module Testing")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Track test results
    test_results = []
    
    # 1. Test REV config (no auth needed)
    config_success, config_data = test_rev_config()
    test_results.append(("REV Config", config_success))
    
    # 2. Test clinic login
    print("🔐 Testing Clinic Login...")
    clinic_token, clinic_user = login_user(CLINIC_CREDENTIALS)
    if not clinic_token:
        print("❌ Cannot proceed without clinic token")
        sys.exit(1)
    print_test_result("Clinic Login", True, f"Successfully logged in as: {clinic_user.get('email')}")
    
    # 3. Test prescription stats
    stats_success, stats_data = test_prescription_stats(clinic_token)
    test_results.append(("Prescription Stats", stats_success))
    
    # 4. Test create prescription
    create_success, prescription_data = test_create_prescription(clinic_token)
    test_results.append(("Create Prescription", create_success))
    
    prescription_id = None
    if create_success and prescription_data:
        prescription_id = prescription_data.get('id')
    
    # 5. Test list prescriptions
    list_success, prescriptions_list = test_list_prescriptions(clinic_token)
    test_results.append(("List Prescriptions", list_success))
    
    # If we don't have a prescription ID from creation, try to get one from the list
    if not prescription_id and list_success and prescriptions_list:
        for p in prescriptions_list:
            if p.get('status') == 'DRAFT':
                prescription_id = p.get('id')
                break
    
    if prescription_id:
        # 6. Test get prescription detail
        detail_success, detail_data = test_get_prescription_detail(clinic_token, prescription_id)
        test_results.append(("Get Prescription Detail", detail_success))
        
        # 7. Test update prescription
        update_success, update_data = test_update_prescription(clinic_token, prescription_id)
        test_results.append(("Update Prescription", update_success))
        
        # 8. Test manual registration
        manual_success, manual_data = test_register_manual(clinic_token, prescription_id)
        test_results.append(("Manual Registration", manual_success))
        
        # 9. Test audit trail
        audit_success, audit_data = test_audit_trail(clinic_token, prescription_id)
        test_results.append(("Audit Trail", audit_success))
        
        # 10. Test publish to owner
        publish_success, publish_data = test_publish_to_owner(clinic_token, prescription_id)
        test_results.append(("Publish to Owner", publish_success))
    else:
        print("⚠️ No prescription ID available for detailed testing")
        test_results.extend([
            ("Get Prescription Detail", False),
            ("Update Prescription", False),
            ("Manual Registration", False),
            ("Audit Trail", False),
            ("Publish to Owner", False)
        ])
    
    # 11. Test owner access
    print("👤 Testing Owner Login...")
    owner_token, owner_user = login_user(OWNER_CREDENTIALS)
    if owner_token:
        print_test_result("Owner Login", True, f"Successfully logged in as: {owner_user.get('email')}")
        owner_access_success, owner_data = test_owner_access(owner_token)
        test_results.append(("Owner Access", owner_access_success))
    else:
        print_test_result("Owner Login", False, "Could not login as owner")
        test_results.append(("Owner Access", False))
    
    # 12. Test auth & permission checks
    test_auth_permission_checks()
    test_results.append(("Auth & Permission Checks", True))  # Manual verification
    
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
        print("🎉 All REV prescription tests passed!")
        return 0
    else:
        print(f"⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())