#!/usr/bin/env python3
"""
VetBuddy REV Prescriptions Module - Final Comprehensive Test
Tests all endpoints from the review request with proper data flow
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

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
            return None, None
    except Exception as e:
        return None, None

def main():
    """Run comprehensive REV prescription test as per review request"""
    print("🚀 VetBuddy REV Prescriptions Module - Final Comprehensive Test")
    print("=" * 70)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    test_results = []
    
    # 1. GET /api/rev/config (No auth needed)
    print("1️⃣ Testing GET /api/rev/config (No auth needed)")
    try:
        response = requests.get(f"{BASE_URL}/rev/config")
        if response.status_code == 200:
            data = response.json()
            expected = {"manualMode": True, "featureEnabled": True, "environment": "sandbox"}
            if all(data.get(k) == v for k, v in expected.items()):
                print_test_result("GET /api/rev/config", True, f"✅ Expected response: {data}")
                test_results.append(True)
            else:
                print_test_result("GET /api/rev/config", False, f"❌ Unexpected response: {data}")
                test_results.append(False)
        else:
            print_test_result("GET /api/rev/config", False, f"❌ Status: {response.status_code}")
            test_results.append(False)
    except Exception as e:
        print_test_result("GET /api/rev/config", False, f"❌ Exception: {e}")
        test_results.append(False)
    
    # Login as clinic
    print("🔐 Logging in as clinic...")
    clinic_token, clinic_user = login_user(CLINIC_CREDENTIALS)
    if not clinic_token:
        print("❌ Cannot proceed without clinic token")
        sys.exit(1)
    clinic_headers = {"Authorization": f"Bearer {clinic_token}"}
    print(f"✅ Clinic login successful: {clinic_user['email']}")
    
    # Login as owner
    print("👤 Logging in as owner...")
    owner_token, owner_user = login_user(OWNER_CREDENTIALS)
    if not owner_token:
        print("❌ Cannot proceed without owner token")
        sys.exit(1)
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    print(f"✅ Owner login successful: {owner_user['email']}")
    
    # Get pet for testing
    pets_response = requests.get(f"{BASE_URL}/pets", headers=clinic_headers)
    pets = pets_response.json()
    if not pets:
        print("❌ No pets available for testing")
        sys.exit(1)
    pet = pets[0]
    print(f"🐕 Using pet: {pet['name']} (ID: {pet['id']})")
    
    # 2. GET /api/prescriptions/stats (Clinic auth)
    print("2️⃣ Testing GET /api/prescriptions/stats (Clinic auth)")
    try:
        response = requests.get(f"{BASE_URL}/prescriptions/stats", headers=clinic_headers)
        if response.status_code == 200:
            data = response.json()
            required_fields = ['drafts', 'emittedToday', 'errors', 'total']
            if all(field in data for field in required_fields):
                print_test_result("GET /api/prescriptions/stats", True, f"✅ Stats: {data}")
                test_results.append(True)
            else:
                print_test_result("GET /api/prescriptions/stats", False, f"❌ Missing fields: {data}")
                test_results.append(False)
        else:
            print_test_result("GET /api/prescriptions/stats", False, f"❌ Status: {response.status_code}")
            test_results.append(False)
    except Exception as e:
        print_test_result("GET /api/prescriptions/stats", False, f"❌ Exception: {e}")
        test_results.append(False)
    
    # 3. POST /api/prescriptions (Create draft - Clinic auth)
    print("3️⃣ Testing POST /api/prescriptions (Create draft - Clinic auth)")
    prescription_data = {
        "petId": pet['id'],
        "petName": pet['name'],
        "ownerId": owner_user['id'],
        "ownerName": owner_user.get('name', 'Test Owner'),
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
        response = requests.post(f"{BASE_URL}/prescriptions", headers=clinic_headers, json=prescription_data)
        if response.status_code == 201:
            prescription = response.json()
            if prescription.get('status') == 'DRAFT':
                prescription_id = prescription['id']
                print_test_result("POST /api/prescriptions", True, f"✅ Created prescription {prescription_id} with status DRAFT")
                test_results.append(True)
            else:
                print_test_result("POST /api/prescriptions", False, f"❌ Wrong status: {prescription.get('status')}")
                test_results.append(False)
                prescription_id = None
        else:
            print_test_result("POST /api/prescriptions", False, f"❌ Status: {response.status_code}")
            test_results.append(False)
            prescription_id = None
    except Exception as e:
        print_test_result("POST /api/prescriptions", False, f"❌ Exception: {e}")
        test_results.append(False)
        prescription_id = None
    
    if not prescription_id:
        print("❌ Cannot continue without prescription ID")
        sys.exit(1)
    
    # 4. GET /api/prescriptions (List - Clinic auth)
    print("4️⃣ Testing GET /api/prescriptions (List - Clinic auth)")
    try:
        response = requests.get(f"{BASE_URL}/prescriptions", headers=clinic_headers)
        if response.status_code == 200:
            prescriptions = response.json()
            if isinstance(prescriptions, list) and any(p['id'] == prescription_id for p in prescriptions):
                print_test_result("GET /api/prescriptions", True, f"✅ Found {len(prescriptions)} prescriptions including newly created one")
                test_results.append(True)
            else:
                print_test_result("GET /api/prescriptions", False, f"❌ Newly created prescription not found")
                test_results.append(False)
        else:
            print_test_result("GET /api/prescriptions", False, f"❌ Status: {response.status_code}")
            test_results.append(False)
    except Exception as e:
        print_test_result("GET /api/prescriptions", False, f"❌ Exception: {e}")
        test_results.append(False)
    
    # 5. GET /api/prescriptions/:id (Detail)
    print("5️⃣ Testing GET /api/prescriptions/:id (Detail)")
    try:
        response = requests.get(f"{BASE_URL}/prescriptions/{prescription_id}", headers=clinic_headers)
        if response.status_code == 200:
            prescription = response.json()
            if prescription.get('id') == prescription_id and 'items' in prescription and len(prescription['items']) > 0:
                print_test_result("GET /api/prescriptions/:id", True, f"✅ Retrieved prescription with {len(prescription['items'])} items")
                test_results.append(True)
            else:
                print_test_result("GET /api/prescriptions/:id", False, f"❌ Missing items array or wrong ID")
                test_results.append(False)
        else:
            print_test_result("GET /api/prescriptions/:id", False, f"❌ Status: {response.status_code}")
            test_results.append(False)
    except Exception as e:
        print_test_result("GET /api/prescriptions/:id", False, f"❌ Exception: {e}")
        test_results.append(False)
    
    # 6. PUT /api/prescriptions/:id (Update draft)
    print("6️⃣ Testing PUT /api/prescriptions/:id (Update draft)")
    try:
        update_data = {"diagnosisNote": "Updated diagnosis"}
        response = requests.put(f"{BASE_URL}/prescriptions/{prescription_id}", headers=clinic_headers, json=update_data)
        if response.status_code == 200:
            updated = response.json()
            if updated.get('diagnosisNote') == "Updated diagnosis":
                print_test_result("PUT /api/prescriptions/:id", True, f"✅ Successfully updated prescription")
                test_results.append(True)
            else:
                print_test_result("PUT /api/prescriptions/:id", False, f"❌ Update not reflected")
                test_results.append(False)
        else:
            print_test_result("PUT /api/prescriptions/:id", False, f"❌ Status: {response.status_code}")
            test_results.append(False)
    except Exception as e:
        print_test_result("PUT /api/prescriptions/:id", False, f"❌ Exception: {e}")
        test_results.append(False)
    
    # 7. POST /api/prescriptions/:id/register-manual (Bridge mode registration)
    print("7️⃣ Testing POST /api/prescriptions/:id/register-manual (Bridge mode registration)")
    try:
        manual_data = {
            "prescriptionNumber": "REV-2026-TEST-001",
            "pin": "1234",
            "issueDate": "2026-04-16",
            "notes": "Test registration"
        }
        response = requests.post(f"{BASE_URL}/prescriptions/{prescription_id}/register-manual", 
                               headers=clinic_headers, json=manual_data)
        if response.status_code == 200:
            result = response.json()
            if result.get('success') and result.get('status') == 'REGISTERED_MANUALLY':
                print_test_result("POST /api/prescriptions/:id/register-manual", True, f"✅ Registered manually: {result.get('prescriptionNumber')}")
                test_results.append(True)
            else:
                print_test_result("POST /api/prescriptions/:id/register-manual", False, f"❌ Unexpected response: {result}")
                test_results.append(False)
        else:
            print_test_result("POST /api/prescriptions/:id/register-manual", False, f"❌ Status: {response.status_code}")
            test_results.append(False)
    except Exception as e:
        print_test_result("POST /api/prescriptions/:id/register-manual", False, f"❌ Exception: {e}")
        test_results.append(False)
    
    # 8. GET /api/prescriptions/:id/audit (Audit trail)
    print("8️⃣ Testing GET /api/prescriptions/:id/audit (Audit trail)")
    try:
        response = requests.get(f"{BASE_URL}/prescriptions/{prescription_id}/audit", headers=clinic_headers)
        if response.status_code == 200:
            audit_events = response.json()
            if isinstance(audit_events, list) and len(audit_events) > 0:
                print_test_result("GET /api/prescriptions/:id/audit", True, f"✅ Found {len(audit_events)} audit events")
                test_results.append(True)
            else:
                print_test_result("GET /api/prescriptions/:id/audit", False, f"❌ No audit events found")
                test_results.append(False)
        else:
            print_test_result("GET /api/prescriptions/:id/audit", False, f"❌ Status: {response.status_code}")
            test_results.append(False)
    except Exception as e:
        print_test_result("GET /api/prescriptions/:id/audit", False, f"❌ Exception: {e}")
        test_results.append(False)
    
    # 9. POST /api/prescriptions/:id/publish (Publish to owner)
    print("9️⃣ Testing POST /api/prescriptions/:id/publish (Publish to owner)")
    try:
        response = requests.post(f"{BASE_URL}/prescriptions/{prescription_id}/publish", headers=clinic_headers)
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print_test_result("POST /api/prescriptions/:id/publish", True, f"✅ Successfully published to owner")
                test_results.append(True)
            else:
                print_test_result("POST /api/prescriptions/:id/publish", False, f"❌ Unexpected response: {result}")
                test_results.append(False)
        else:
            print_test_result("POST /api/prescriptions/:id/publish", False, f"❌ Status: {response.status_code}")
            test_results.append(False)
    except Exception as e:
        print_test_result("POST /api/prescriptions/:id/publish", False, f"❌ Exception: {e}")
        test_results.append(False)
    
    # 10. GET /api/prescriptions with Owner token
    print("🔟 Testing GET /api/prescriptions with Owner token")
    try:
        response = requests.get(f"{BASE_URL}/prescriptions", headers=owner_headers)
        if response.status_code == 200:
            owner_prescriptions = response.json()
            if isinstance(owner_prescriptions, list):
                # Check for sanitized data (no technical fields)
                sanitized = True
                for p in owner_prescriptions:
                    if 'clinicId' in p or 'externalStatus' in p or 'createdByUserId' in p:
                        sanitized = False
                        break
                
                if sanitized:
                    print_test_result("GET /api/prescriptions (Owner)", True, f"✅ Owner sees {len(owner_prescriptions)} prescriptions with sanitized data")
                    test_results.append(True)
                else:
                    print_test_result("GET /api/prescriptions (Owner)", False, f"❌ Technical fields not properly hidden")
                    test_results.append(False)
            else:
                print_test_result("GET /api/prescriptions (Owner)", False, f"❌ Expected array, got: {type(owner_prescriptions)}")
                test_results.append(False)
        else:
            print_test_result("GET /api/prescriptions (Owner)", False, f"❌ Status: {response.status_code}")
            test_results.append(False)
    except Exception as e:
        print_test_result("GET /api/prescriptions (Owner)", False, f"❌ Exception: {e}")
        test_results.append(False)
    
    # 11. Auth & Permission checks
    print("1️⃣1️⃣ Testing Auth & Permission checks")
    
    # Test without auth
    try:
        response = requests.post(f"{BASE_URL}/prescriptions", json={})
        if response.status_code in [401, 403]:
            print_test_result("POST /api/prescriptions without auth", True, f"✅ Correctly blocked with {response.status_code}")
            auth_test_1 = True
        else:
            print_test_result("POST /api/prescriptions without auth", False, f"❌ Expected 401/403, got {response.status_code}")
            auth_test_1 = False
    except Exception as e:
        print_test_result("POST /api/prescriptions without auth", False, f"❌ Exception: {e}")
        auth_test_1 = False
    
    # Test with owner token
    try:
        response = requests.post(f"{BASE_URL}/prescriptions", headers=owner_headers, json={})
        if response.status_code == 403:
            print_test_result("POST /api/prescriptions with owner token", True, f"✅ Correctly blocked owner with 403")
            auth_test_2 = True
        else:
            print_test_result("POST /api/prescriptions with owner token", False, f"❌ Expected 403, got {response.status_code}")
            auth_test_2 = False
    except Exception as e:
        print_test_result("POST /api/prescriptions with owner token", False, f"❌ Exception: {e}")
        auth_test_2 = False
    
    test_results.append(auth_test_1 and auth_test_2)
    
    # Summary
    print("=" * 70)
    print("📊 FINAL TEST SUMMARY")
    print("=" * 70)
    
    test_names = [
        "GET /api/rev/config",
        "GET /api/prescriptions/stats", 
        "POST /api/prescriptions (Create)",
        "GET /api/prescriptions (List)",
        "GET /api/prescriptions/:id (Detail)",
        "PUT /api/prescriptions/:id (Update)",
        "POST /api/prescriptions/:id/register-manual",
        "GET /api/prescriptions/:id/audit",
        "POST /api/prescriptions/:id/publish",
        "GET /api/prescriptions (Owner Access)",
        "Auth & Permission Checks"
    ]
    
    passed = sum(test_results)
    total = len(test_results)
    
    for i, (test_name, result) in enumerate(zip(test_names, test_results)):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print()
    print(f"Overall Result: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 ALL REV PRESCRIPTION ENDPOINTS WORKING PERFECTLY!")
        print("✅ VetBuddy REV Prescriptions Module is fully functional")
        return 0
    else:
        print(f"⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())