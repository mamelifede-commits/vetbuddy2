#!/usr/bin/env python3
"""
VetBuddy Admin Passport Stats and Passport Automations API Testing Script
Tests:
1. POST /api/auth/login (admin credentials)
2. GET /api/admin/passport-stats (admin token)
3. POST /api/automations/passport-vaccine-reminder (NO auth, dryRun: true)
4. POST /api/automations/passport-completion-reminder (NO auth, dryRun: true)
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

def test_admin_login():
    """Test admin login and return token"""
    print(f"\n{'='*80}")
    print(f"TEST 1: Admin Login")
    print(f"{'='*80}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": "admin@vetbuddy.it", "password": "Admin2025!"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                if data["user"].get("role") == "admin":
                    token = data["token"]
                    print_test("Admin Login", True, 
                              f"Token received, role: admin, email: {data['user'].get('email')}")
                    return token
                else:
                    print_test("Admin Login", False, 
                              f"Wrong role: {data['user'].get('role')}, expected: admin")
                    return None
            else:
                print_test("Admin Login", False, "Missing token or user in response")
                return None
        else:
            print_test("Admin Login", False, 
                      f"Status {response.status_code}: {response.text[:300]}")
            return None
    except Exception as e:
        print_test("Admin Login", False, f"Exception: {str(e)}")
        return None

def test_admin_passport_stats(admin_token):
    """Test GET /api/admin/passport-stats"""
    print(f"\n{'='*80}")
    print(f"TEST 2: Admin Passport Stats")
    print(f"{'='*80}")
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/passport-stats",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Check required fields
            required_fields = [
                "totalPets", "passportActive", "qrGenerated", "activeShares",
                "vaccinesExpiring", "petsWithoutMicrochip", 
                "petsWithoutEmergencyContact", "petsWithoutVaccines", 
                "lostPetModeActive"
            ]
            
            missing_fields = [f for f in required_fields if f not in data]
            
            if not missing_fields:
                # Validate data types
                type_checks = []
                type_checks.append(("totalPets", isinstance(data["totalPets"], int)))
                type_checks.append(("passportActive", isinstance(data["passportActive"], int)))
                type_checks.append(("qrGenerated", isinstance(data["qrGenerated"], int)))
                type_checks.append(("activeShares", isinstance(data["activeShares"], int)))
                type_checks.append(("vaccinesExpiring", isinstance(data["vaccinesExpiring"], list)))
                type_checks.append(("petsWithoutMicrochip", isinstance(data["petsWithoutMicrochip"], int)))
                type_checks.append(("petsWithoutEmergencyContact", isinstance(data["petsWithoutEmergencyContact"], int)))
                type_checks.append(("petsWithoutVaccines", isinstance(data["petsWithoutVaccines"], int)))
                type_checks.append(("lostPetModeActive", isinstance(data["lostPetModeActive"], int)))
                
                failed_types = [name for name, check in type_checks if not check]
                
                if not failed_types:
                    print_test("Admin Passport Stats", True, 
                              f"All required fields present with correct types. "
                              f"totalPets: {data['totalPets']}, passportActive: {data['passportActive']}, "
                              f"qrGenerated: {data['qrGenerated']}, activeShares: {data['activeShares']}, "
                              f"vaccinesExpiring: {len(data['vaccinesExpiring'])} items, "
                              f"petsWithoutMicrochip: {data['petsWithoutMicrochip']}, "
                              f"petsWithoutEmergencyContact: {data['petsWithoutEmergencyContact']}, "
                              f"petsWithoutVaccines: {data['petsWithoutVaccines']}, "
                              f"lostPetModeActive: {data['lostPetModeActive']}")
                    return True
                else:
                    print_test("Admin Passport Stats", False, 
                              f"Type validation failed for: {failed_types}")
                    return False
            else:
                print_test("Admin Passport Stats", False, 
                          f"Missing required fields: {missing_fields}")
                return False
        elif response.status_code == 403:
            print_test("Admin Passport Stats", False, 
                      f"Access denied (403) - admin authorization failed")
            return False
        else:
            print_test("Admin Passport Stats", False, 
                      f"Status {response.status_code}: {response.text[:300]}")
            return False
    except Exception as e:
        print_test("Admin Passport Stats", False, f"Exception: {str(e)}")
        return False

def test_passport_vaccine_reminder():
    """Test POST /api/automations/passport-vaccine-reminder (NO auth)"""
    print(f"\n{'='*80}")
    print(f"TEST 3: Passport Vaccine Reminder Automation")
    print(f"{'='*80}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/automations/passport-vaccine-reminder",
            json={"daysAhead": 30, "dryRun": True},
            timeout=15
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Check required fields
            required_fields = ["success", "reminders", "errors", "dryRun", "details"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if not missing_fields:
                # Validate response structure
                checks = []
                checks.append(("success is true", data["success"] == True))
                checks.append(("reminders is number", isinstance(data["reminders"], int)))
                checks.append(("errors is number", isinstance(data["errors"], int)))
                checks.append(("dryRun is true", data["dryRun"] == True))
                checks.append(("details is array", isinstance(data["details"], list)))
                
                failed_checks = [name for name, check in checks if not check]
                
                if not failed_checks:
                    print_test("Passport Vaccine Reminder", True, 
                              f"Automation executed successfully. "
                              f"success: {data['success']}, reminders: {data['reminders']}, "
                              f"errors: {data['errors']}, dryRun: {data['dryRun']}, "
                              f"details: {len(data['details'])} items")
                    
                    # Print sample details if available
                    if data['details'] and len(data['details']) > 0:
                        print(f"   Sample detail: {json.dumps(data['details'][0], indent=2)}")
                    
                    return True
                else:
                    print_test("Passport Vaccine Reminder", False, 
                              f"Validation failed: {failed_checks}")
                    return False
            else:
                print_test("Passport Vaccine Reminder", False, 
                          f"Missing required fields: {missing_fields}")
                return False
        else:
            print_test("Passport Vaccine Reminder", False, 
                      f"Status {response.status_code}: {response.text[:300]}")
            return False
    except Exception as e:
        print_test("Passport Vaccine Reminder", False, f"Exception: {str(e)}")
        return False

def test_passport_completion_reminder():
    """Test POST /api/automations/passport-completion-reminder (NO auth)"""
    print(f"\n{'='*80}")
    print(f"TEST 4: Passport Completion Reminder Automation")
    print(f"{'='*80}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/automations/passport-completion-reminder",
            json={"minCompletionThreshold": 60, "dryRun": True},
            timeout=15
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Check required fields
            required_fields = ["success", "reminders", "errors", "dryRun", "details"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if not missing_fields:
                # Validate response structure
                checks = []
                checks.append(("success is true", data["success"] == True))
                checks.append(("reminders is number", isinstance(data["reminders"], int)))
                checks.append(("errors is number", isinstance(data["errors"], int)))
                checks.append(("dryRun is true", data["dryRun"] == True))
                checks.append(("details is array", isinstance(data["details"], list)))
                
                failed_checks = [name for name, check in checks if not check]
                
                if not failed_checks:
                    print_test("Passport Completion Reminder", True, 
                              f"Automation executed successfully. "
                              f"success: {data['success']}, reminders: {data['reminders']}, "
                              f"errors: {data['errors']}, dryRun: {data['dryRun']}, "
                              f"details: {len(data['details'])} items")
                    
                    # Print sample details if available
                    if data['details'] and len(data['details']) > 0:
                        print(f"   Sample detail: {json.dumps(data['details'][0], indent=2)}")
                    
                    return True
                else:
                    print_test("Passport Completion Reminder", False, 
                              f"Validation failed: {failed_checks}")
                    return False
            else:
                print_test("Passport Completion Reminder", False, 
                          f"Missing required fields: {missing_fields}")
                return False
        else:
            print_test("Passport Completion Reminder", False, 
                      f"Status {response.status_code}: {response.text[:300]}")
            return False
    except Exception as e:
        print_test("Passport Completion Reminder", False, f"Exception: {str(e)}")
        return False

def main():
    print("\n" + "="*80)
    print("VetBuddy Admin Passport Stats & Automations API Testing")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    # Test 1: Admin Login
    admin_token = test_admin_login()
    if not admin_token:
        print("\n❌ CRITICAL: Admin login failed. Cannot proceed with admin-only tests.")
        print(f"\n{'='*80}")
        print(f"FINAL RESULTS: {tests_passed} passed, {tests_failed} failed")
        print(f"{'='*80}")
        sys.exit(1)
    
    # Test 2: Admin Passport Stats
    test_admin_passport_stats(admin_token)
    
    # Test 3: Passport Vaccine Reminder (NO auth required)
    test_passport_vaccine_reminder()
    
    # Test 4: Passport Completion Reminder (NO auth required)
    test_passport_completion_reminder()
    
    # Final Summary
    print("\n" + "="*80)
    print("FINAL RESULTS")
    print("="*80)
    print(f"✅ Tests Passed: {tests_passed}")
    print(f"❌ Tests Failed: {tests_failed}")
    print(f"📊 Total Tests: {tests_passed + tests_failed}")
    print(f"Success Rate: {(tests_passed / (tests_passed + tests_failed) * 100):.1f}%")
    print("="*80)
    
    if tests_failed > 0:
        sys.exit(1)
    else:
        print("\n🎉 All tests passed successfully!")
        sys.exit(0)

if __name__ == "__main__":
    main()
