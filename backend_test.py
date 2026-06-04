#!/usr/bin/env python3
"""
VetBuddy Passport Backend API Testing Script
Tests all passport-related endpoints as specified in review request
"""

import requests
import json
import sys

BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test counters
tests_passed = 0
tests_failed = 0

def print_test(name, passed, details=""):
    global tests_passed, tests_failed
    if passed:
        tests_passed += 1
        print(f"✅ {name}")
        if details:
            print(f"   {details}")
    else:
        tests_failed += 1
        print(f"❌ {name}")
        if details:
            print(f"   {details}")

def test_login(email, password, expected_role):
    """Test login and return token"""
    print(f"\n🔐 Testing login: {email}")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                if data["user"].get("role") == expected_role:
                    print_test(f"Login {expected_role}", True, f"Token received, role: {expected_role}")
                    return data["token"]
                else:
                    print_test(f"Login {expected_role}", False, f"Wrong role: {data['user'].get('role')}")
                    return None
            else:
                print_test(f"Login {expected_role}", False, "Missing token or user in response")
                return None
        else:
            print_test(f"Login {expected_role}", False, f"Status {response.status_code}: {response.text[:200]}")
            return None
    except Exception as e:
        print_test(f"Login {expected_role}", False, f"Exception: {str(e)}")
        return None

def test_clinic_dashboard(token):
    """Test GET /api/passport/clinic/dashboard"""
    print(f"\n📊 Testing Clinic Dashboard")
    try:
        response = requests.get(
            f"{BASE_URL}/passport/clinic/dashboard",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "stats" in data and "lists" in data:
                stats = data["stats"]
                required_stats = ["totalPets", "passportActive", "passportIncomplete", "qrGenerated"]
                missing_stats = [s for s in required_stats if s not in stats]
                
                if not missing_stats:
                    print_test("Clinic Dashboard", True, 
                              f"Stats: {stats['totalPets']} pets, {stats['passportActive']} active, {stats['qrGenerated']} QR generated")
                    return True
                else:
                    print_test("Clinic Dashboard", False, f"Missing stats: {missing_stats}")
                    return False
            else:
                print_test("Clinic Dashboard", False, "Missing 'stats' or 'lists' in response")
                return False
        else:
            print_test("Clinic Dashboard", False, f"Status {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        print_test("Clinic Dashboard", False, f"Exception: {str(e)}")
        return False

def test_get_pets(token):
    """Test GET /api/pets and return first petId"""
    print(f"\n🐾 Testing Get Pets")
    try:
        response = requests.get(
            f"{BASE_URL}/pets",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                pet_id = data[0].get("id")
                pet_name = data[0].get("name", "Unknown")
                if pet_id:
                    print_test("Get Pets", True, f"Found {len(data)} pets, using {pet_name} (ID: {pet_id})")
                    return pet_id
                else:
                    print_test("Get Pets", False, "Pet has no ID")
                    return None
            else:
                print_test("Get Pets", False, "No pets found or invalid response format")
                return None
        else:
            print_test("Get Pets", False, f"Status {response.status_code}: {response.text[:200]}")
            return None
    except Exception as e:
        print_test("Get Pets", False, f"Exception: {str(e)}")
        return None

def test_get_passport(token, pet_id):
    """Test GET /api/passport/{petId}"""
    print(f"\n📋 Testing Get Passport for pet {pet_id}")
    try:
        response = requests.get(
            f"{BASE_URL}/passport/{pet_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["pet", "passport", "completion", "emergencyContacts", "vaccinations"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if not missing_fields:
                completion = data.get("completion", {})
                score = completion.get("score", 0)
                print_test("Get Passport", True, 
                          f"Completion score: {score}%, Emergency contacts: {len(data.get('emergencyContacts', []))}, Vaccinations: {len(data.get('vaccinations', []))}")
                return True
            else:
                print_test("Get Passport", False, f"Missing fields: {missing_fields}")
                return False
        else:
            print_test("Get Passport", False, f"Status {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        print_test("Get Passport", False, f"Exception: {str(e)}")
        return False

def test_add_emergency_contact(token, pet_id):
    """Test POST /api/passport/emergency-contacts"""
    print(f"\n🚨 Testing Add Emergency Contact")
    try:
        response = requests.post(
            f"{BASE_URL}/passport/emergency-contacts",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "petId": pet_id,
                "name": "Contatto Test",
                "relationship": "Familiare",
                "phone": "+39 333 1234567"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("name") == "Contatto Test":
                print_test("Add Emergency Contact", True, f"Contact created with ID: {data['id']}")
                return data["id"]
            else:
                print_test("Add Emergency Contact", False, "Missing ID or name mismatch")
                return None
        else:
            print_test("Add Emergency Contact", False, f"Status {response.status_code}: {response.text[:200]}")
            return None
    except Exception as e:
        print_test("Add Emergency Contact", False, f"Exception: {str(e)}")
        return None

def test_add_vaccination(token, pet_id):
    """Test POST /api/passport/vaccinations"""
    print(f"\n💉 Testing Add Vaccination")
    try:
        response = requests.post(
            f"{BASE_URL}/passport/vaccinations",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "petId": pet_id,
                "name": "Rabbia",
                "date": "2025-06-01",
                "nextDueDate": "2026-06-01",
                "type": "vaccino"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("name") == "Rabbia":
                print_test("Add Vaccination", True, f"Vaccination created with ID: {data['id']}, status: {data.get('status')}")
                return data["id"]
            else:
                print_test("Add Vaccination", False, "Missing ID or name mismatch")
                return None
        else:
            print_test("Add Vaccination", False, f"Status {response.status_code}: {response.text[:200]}")
            return None
    except Exception as e:
        print_test("Add Vaccination", False, f"Exception: {str(e)}")
        return None

def test_generate_qr(token, pet_id):
    """Test POST /api/passport/qr/generate"""
    print(f"\n🔲 Testing Generate QR Code")
    try:
        response = requests.post(
            f"{BASE_URL}/passport/qr/generate",
            headers={"Authorization": f"Bearer {token}"},
            json={"petId": pet_id},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "qrToken" in data and "qrPageUrl" in data:
                print_test("Generate QR", True, f"QR Token: {data['qrToken'][:20]}..., URL: {data['qrPageUrl']}")
                return data["qrToken"]
            else:
                print_test("Generate QR", False, "Missing qrToken or qrPageUrl")
                return None
        else:
            print_test("Generate QR", False, f"Status {response.status_code}: {response.text[:200]}")
            return None
    except Exception as e:
        print_test("Generate QR", False, f"Exception: {str(e)}")
        return None

def test_public_passport(qr_token):
    """Test GET /api/passport/public/{qrToken} - NO AUTH"""
    print(f"\n🌐 Testing Public Passport Access (No Auth)")
    try:
        response = requests.get(
            f"{BASE_URL}/passport/public/{qr_token}",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "publicData" in data and "petId" in data:
                public_data = data["publicData"]
                visible_fields = [k for k in public_data.keys() if public_data[k] is not None]
                print_test("Public Passport", True, 
                          f"Public data accessible, visible fields: {', '.join(visible_fields)}")
                return True
            else:
                print_test("Public Passport", False, "Missing publicData or petId")
                return False
        else:
            print_test("Public Passport", False, f"Status {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        print_test("Public Passport", False, f"Exception: {str(e)}")
        return False

def test_create_sharing(token, pet_id):
    """Test POST /api/passport/sharing"""
    print(f"\n🔗 Testing Create Sharing Link")
    try:
        response = requests.post(
            f"{BASE_URL}/passport/sharing",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "petId": pet_id,
                "recipientName": "Pet Sitter Test",
                "recipientRole": "pet_sitter"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "accessToken" in data and "shareUrl" in data:
                print_test("Create Sharing", True, 
                          f"Share created for {data.get('recipientName')}, URL: {data.get('shareUrl')}")
                return data["accessToken"]
            else:
                print_test("Create Sharing", False, "Missing id, accessToken or shareUrl")
                return None
        else:
            print_test("Create Sharing", False, f"Status {response.status_code}: {response.text[:200]}")
            return None
    except Exception as e:
        print_test("Create Sharing", False, f"Exception: {str(e)}")
        return None

def test_update_lost_pet_mode(token, pet_id):
    """Test PUT /api/passport/{petId} - Lost Pet Mode"""
    print(f"\n🚨 Testing Update Lost Pet Mode")
    try:
        response = requests.put(
            f"{BASE_URL}/passport/{pet_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "lostPetMode": True,
                "lostPetZone": "Milano Centro",
                "lostPetMessage": "Gatto smarrito"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("lostPetMode") == True:
                print_test("Update Lost Pet Mode", True, 
                          f"Lost pet mode enabled, zone: {data.get('lostPetZone')}, message: {data.get('lostPetMessage')}")
                return True
            else:
                print_test("Update Lost Pet Mode", False, "lostPetMode not set to true")
                return False
        else:
            print_test("Update Lost Pet Mode", False, f"Status {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        print_test("Update Lost Pet Mode", False, f"Exception: {str(e)}")
        return False

def main():
    print("=" * 80)
    print("VetBuddy Passport Backend API Testing")
    print("=" * 80)
    
    # Step 1: Login as clinic
    clinic_token = test_login("demo@vetbuddy.it", "VetBuddy2025!Secure", "clinic")
    if not clinic_token:
        print("\n❌ CRITICAL: Clinic login failed, cannot continue")
        sys.exit(1)
    
    # Step 2: Test clinic dashboard
    test_clinic_dashboard(clinic_token)
    
    # Step 3: Login as owner
    owner_token = test_login("proprietario.demo@vetbuddy.it", "demo123", "owner")
    if not owner_token:
        print("\n❌ CRITICAL: Owner login failed, cannot continue")
        sys.exit(1)
    
    # Step 4: Get pets
    pet_id = test_get_pets(owner_token)
    if not pet_id:
        print("\n❌ CRITICAL: No pets found, cannot continue")
        sys.exit(1)
    
    # Step 5: Get passport
    test_get_passport(owner_token, pet_id)
    
    # Step 6: Add emergency contact
    test_add_emergency_contact(owner_token, pet_id)
    
    # Step 7: Add vaccination
    test_add_vaccination(owner_token, pet_id)
    
    # Step 8: Generate QR
    qr_token = test_generate_qr(owner_token, pet_id)
    
    # Step 9: Test public passport (no auth)
    if qr_token:
        test_public_passport(qr_token)
    else:
        print_test("Public Passport", False, "Skipped - no QR token available")
    
    # Step 10: Create sharing link
    test_create_sharing(owner_token, pet_id)
    
    # Step 11: Update lost pet mode
    test_update_lost_pet_mode(owner_token, pet_id)
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"✅ Passed: {tests_passed}")
    print(f"❌ Failed: {tests_failed}")
    print(f"📊 Total: {tests_passed + tests_failed}")
    print(f"📈 Success Rate: {(tests_passed / (tests_passed + tests_failed) * 100):.1f}%")
    print("=" * 80)
    
    if tests_failed > 0:
        sys.exit(1)
    else:
        print("\n🎉 All tests passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()
