#!/usr/bin/env python3
"""
VetBuddy Passport Email Notifications Backend Test
Tests event-triggered email notifications for passport module
"""

import requests
import json
import time
import sys

# Configuration
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"
OWNER_EMAIL = "proprietario.demo@vetbuddy.it"
OWNER_PASSWORD = "demo123"
PET_ID = "f1f3b7d9-01fe-4955-b6c8-bdf183a62d28"

# Test results
test_results = []
owner_token = None
qr_token = None

def log_test(test_name, passed, message):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status}: {test_name} - {message}"
    print(result)
    test_results.append({"test": test_name, "passed": passed, "message": message})
    return passed

def test_login():
    """Test 1: Login with owner credentials"""
    global owner_token
    print("\n" + "="*80)
    print("TEST 1: Owner Login")
    print("="*80)
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data:
                owner_token = data["token"]
                log_test("Owner Login", True, f"Login successful, token received")
                return True
            else:
                log_test("Owner Login", False, f"No token in response: {data}")
                return False
        else:
            log_test("Owner Login", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Owner Login", False, f"Exception: {str(e)}")
        return False

def test_qr_generate_email():
    """Test 2: QR Generate + Email Notification"""
    global qr_token
    print("\n" + "="*80)
    print("TEST 2: QR Generate + Email Notification")
    print("="*80)
    
    if not owner_token:
        log_test("QR Generate + Email", False, "No owner token available")
        return False
    
    try:
        response = requests.post(
            f"{BASE_URL}/passport/qr/generate",
            json={"petId": PET_ID},
            headers={"Authorization": f"Bearer {owner_token}"},
            timeout=15
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "qrToken" in data and "qrPageUrl" in data:
                qr_token = data["qrToken"]
                log_test("QR Generate + Email", True, 
                        f"QR generated successfully. Token: {qr_token[:20]}..., URL: {data['qrPageUrl'][:50]}... Check server logs for 📧 email notification")
                return True
            else:
                log_test("QR Generate + Email", False, f"Invalid response structure: {data}")
                return False
        else:
            log_test("QR Generate + Email", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("QR Generate + Email", False, f"Exception: {str(e)}")
        return False

def test_vaccination_email():
    """Test 3: Vaccination + Email Notification"""
    print("\n" + "="*80)
    print("TEST 3: Vaccination + Email Notification")
    print("="*80)
    
    if not owner_token:
        log_test("Vaccination + Email", False, "No owner token available")
        return False
    
    try:
        response = requests.post(
            f"{BASE_URL}/passport/vaccinations",
            json={
                "petId": PET_ID,
                "name": "Test Vaccino Email",
                "date": "2026-06-04",
                "nextDueDate": "2027-06-04"
            },
            headers={"Authorization": f"Bearer {owner_token}"},
            timeout=15
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("name") == "Test Vaccino Email":
                status = data.get("status", "unknown")
                log_test("Vaccination + Email", True, 
                        f"Vaccination created successfully. ID: {data['id']}, Status: {status}. Check server logs for 📧 email notification")
                return True
            else:
                log_test("Vaccination + Email", False, f"Invalid response structure: {data}")
                return False
        else:
            log_test("Vaccination + Email", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Vaccination + Email", False, f"Exception: {str(e)}")
        return False

def test_lost_pet_activate_email():
    """Test 4: Lost Pet Mode Activate + Email Notification"""
    print("\n" + "="*80)
    print("TEST 4: Lost Pet Mode Activate + Email Notification")
    print("="*80)
    
    if not owner_token:
        log_test("Lost Pet Activate + Email", False, "No owner token available")
        return False
    
    try:
        response = requests.put(
            f"{BASE_URL}/passport/{PET_ID}",
            json={
                "lostPetMode": True,
                "lostPetMessage": "Test smarrimento",
                "lostPetZone": "Milano Centro"
            },
            headers={"Authorization": f"Bearer {owner_token}"},
            timeout=15
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("lostPetMode") == True and data.get("lostPetStatus") == "active":
                log_test("Lost Pet Activate + Email", True, 
                        f"Lost Pet Mode activated. Status: {data.get('lostPetStatus')}, Zone: {data.get('lostPetZone')}. Check server logs for 📧 email notifications (owner + emergency contacts)")
                return True
            else:
                log_test("Lost Pet Activate + Email", False, f"Lost Pet Mode not properly activated: {data}")
                return False
        else:
            log_test("Lost Pet Activate + Email", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Lost Pet Activate + Email", False, f"Exception: {str(e)}")
        return False

def test_lost_pet_deactivate_email():
    """Test 5: Lost Pet Mode Deactivate + Email Notification"""
    print("\n" + "="*80)
    print("TEST 5: Lost Pet Mode Deactivate + Email Notification")
    print("="*80)
    
    if not owner_token:
        log_test("Lost Pet Deactivate + Email", False, "No owner token available")
        return False
    
    try:
        response = requests.put(
            f"{BASE_URL}/passport/{PET_ID}",
            json={"lostPetMode": False},
            headers={"Authorization": f"Bearer {owner_token}"},
            timeout=15
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("lostPetMode") == False and data.get("lostPetStatus") == "found":
                log_test("Lost Pet Deactivate + Email", True, 
                        f"Lost Pet Mode deactivated. Status: {data.get('lostPetStatus')}. Check server logs for 📧 email notification (pet found)")
                return True
            else:
                log_test("Lost Pet Deactivate + Email", False, f"Lost Pet Mode not properly deactivated: {data}")
                return False
        else:
            log_test("Lost Pet Deactivate + Email", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Lost Pet Deactivate + Email", False, f"Exception: {str(e)}")
        return False

def test_emergency_contact_email():
    """Test 6: Emergency Contact + Email Notification"""
    print("\n" + "="*80)
    print("TEST 6: Emergency Contact + Email Notification")
    print("="*80)
    
    if not owner_token:
        log_test("Emergency Contact + Email", False, "No owner token available")
        return False
    
    try:
        response = requests.post(
            f"{BASE_URL}/passport/emergency-contacts",
            json={
                "petId": PET_ID,
                "name": "Test Email Contact",
                "phone": "+39123456789",
                "email": "testcontact@example.com",
                "relationship": "Familiare"
            },
            headers={"Authorization": f"Bearer {owner_token}"},
            timeout=15
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("name") == "Test Email Contact":
                log_test("Emergency Contact + Email", True, 
                        f"Emergency contact created. ID: {data['id']}, Email: {data.get('email')}. Check server logs for 📧 email notification to contact")
                return True
            else:
                log_test("Emergency Contact + Email", False, f"Invalid response structure: {data}")
                return False
        else:
            log_test("Emergency Contact + Email", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Emergency Contact + Email", False, f"Exception: {str(e)}")
        return False

def test_qr_scan_email():
    """Test 7: Public QR Scan + Email Notification (when lost mode active)"""
    print("\n" + "="*80)
    print("TEST 7: Public QR Scan + Email Notification (Lost Mode)")
    print("="*80)
    
    if not qr_token:
        log_test("QR Scan + Email", False, "No QR token available from previous test")
        return False
    
    # First, activate lost mode again
    print("Step 1: Activating lost mode for QR scan test...")
    try:
        activate_response = requests.put(
            f"{BASE_URL}/passport/{PET_ID}",
            json={
                "lostPetMode": True,
                "lostPetMessage": "Test scan email"
            },
            headers={"Authorization": f"Bearer {owner_token}"},
            timeout=15
        )
        
        if activate_response.status_code != 200:
            log_test("QR Scan + Email", False, f"Failed to activate lost mode: {activate_response.status_code}")
            return False
        
        print("Lost mode activated successfully")
    except Exception as e:
        log_test("QR Scan + Email", False, f"Exception activating lost mode: {str(e)}")
        return False
    
    # Now scan the QR (public endpoint, no auth)
    print("Step 2: Scanning QR code (public endpoint)...")
    try:
        response = requests.get(
            f"{BASE_URL}/passport/public/{qr_token}",
            timeout=15
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if "publicData" in data and data["publicData"].get("isLostPetMode") == True:
                log_test("QR Scan + Email", True, 
                        f"QR scan successful. Lost mode visible: {data['publicData'].get('isLostPetMode')}. Check server logs for 📧 email notification (rate limited to 1 per 10 min)")
                
                # Deactivate lost mode after test
                print("Step 3: Deactivating lost mode...")
                requests.put(
                    f"{BASE_URL}/passport/{PET_ID}",
                    json={"lostPetMode": False},
                    headers={"Authorization": f"Bearer {owner_token}"},
                    timeout=15
                )
                return True
            else:
                log_test("QR Scan + Email", False, f"Lost mode not visible in public data: {data}")
                return False
        else:
            log_test("QR Scan + Email", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("QR Scan + Email", False, f"Exception: {str(e)}")
        return False

def test_api_data_integrity():
    """Test 8: Verify all APIs still return correct data (not broken by email additions)"""
    print("\n" + "="*80)
    print("TEST 8: API Data Integrity Check")
    print("="*80)
    
    if not owner_token:
        log_test("API Data Integrity", False, "No owner token available")
        return False
    
    try:
        response = requests.get(
            f"{BASE_URL}/passport/{PET_ID}",
            headers={"Authorization": f"Bearer {owner_token}"},
            timeout=15
        )
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            # Check for required fields
            required_fields = ["pet", "passport", "completion", "emergencyContacts", "vaccinations"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                completion_score = data.get("completion", {}).get("score", 0)
                log_test("API Data Integrity", True, 
                        f"GET /api/passport/{PET_ID} returns all required fields. Completion score: {completion_score}%. Email additions did not break API response.")
                return True
            else:
                log_test("API Data Integrity", False, f"Missing required fields: {missing_fields}")
                return False
        else:
            log_test("API Data Integrity", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("API Data Integrity", False, f"Exception: {str(e)}")
        return False

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    total_tests = len(test_results)
    passed_tests = sum(1 for result in test_results if result["passed"])
    failed_tests = total_tests - passed_tests
    
    print(f"\nTotal Tests: {total_tests}")
    print(f"Passed: {passed_tests} ✅")
    print(f"Failed: {failed_tests} ❌")
    print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%\n")
    
    if failed_tests > 0:
        print("Failed Tests:")
        for result in test_results:
            if not result["passed"]:
                print(f"  ❌ {result['test']}: {result['message']}")
    
    print("\n" + "="*80)
    print("IMPORTANT NOTES:")
    print("="*80)
    print("1. Email notifications are fire-and-forget (wrapped in try/catch)")
    print("2. Check server logs for '📧 Email sent' or '📧 [MOCK EMAIL]' messages")
    print("3. Email sending should NOT block API responses (all APIs should return 200)")
    print("4. QR scan email is rate-limited to 1 notification per 10 minutes")
    print("5. Resend API may be in MOCK mode if no API key is configured")
    print("="*80)
    
    return failed_tests == 0

def main():
    """Run all tests"""
    print("="*80)
    print("VetBuddy Passport Email Notifications Backend Test")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Owner: {OWNER_EMAIL}")
    print(f"Pet ID: {PET_ID}")
    print("="*80)
    
    # Run tests in sequence
    test_login()
    time.sleep(1)
    
    test_qr_generate_email()
    time.sleep(1)
    
    test_vaccination_email()
    time.sleep(1)
    
    test_lost_pet_activate_email()
    time.sleep(1)
    
    test_lost_pet_deactivate_email()
    time.sleep(1)
    
    test_emergency_contact_email()
    time.sleep(1)
    
    test_qr_scan_email()
    time.sleep(1)
    
    test_api_data_integrity()
    
    # Print summary
    success = print_summary()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
