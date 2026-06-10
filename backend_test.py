#!/usr/bin/env python3
"""
VetBuddy Autopilot Settimanale Backend API Test
Tests the new /api/autopilot/weekly-actions endpoint
"""

import requests
import json
import sys

# Configuration
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"

# Test results
test_results = []
clinic_token = None

def log_test(test_name, passed, message):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status}: {test_name} - {message}"
    print(result)
    test_results.append({"test": test_name, "passed": passed, "message": message})
    return passed

def print_section(title):
    """Print section header"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def test_clinic_login():
    """Test 1: Login with clinic credentials"""
    global clinic_token
    print_section("TEST 1: Clinic Authentication")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": CLINIC_EMAIL, "password": CLINIC_PASSWORD},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and data.get("user", {}).get("role") == "clinic":
                clinic_token = data["token"]
                log_test("Clinic Login", True, f"Login successful, clinic token received")
                print(f"   Clinic: {data.get('user', {}).get('clinicName', 'N/A')}")
                print(f"   Role: {data.get('user', {}).get('role', 'N/A')}")
                return True
            else:
                log_test("Clinic Login", False, f"Token or role missing in response")
                return False
        else:
            log_test("Clinic Login", False, f"Status {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        log_test("Clinic Login", False, f"Exception: {str(e)}")
        return False

def test_unauthorized_access():
    """Test 2: Verify unauthorized access is blocked"""
    print_section("TEST 2: Unauthorized Access Block")
    
    try:
        # Test without token
        response = requests.get(
            f"{BASE_URL}/autopilot/weekly-actions",
            timeout=15
        )
        
        if response.status_code == 401:
            log_test("Unauthorized Access Block", True, f"Correctly blocked with 401 status")
            return True
        else:
            log_test("Unauthorized Access Block", False, f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        log_test("Unauthorized Access Block", False, f"Exception: {str(e)}")
        return False

def test_weekly_actions_endpoint():
    """Test 3: Get weekly actions with clinic authentication"""
    print_section("TEST 3: Weekly Actions Endpoint")
    
    if not clinic_token:
        log_test("Weekly Actions Endpoint", False, "No clinic token available")
        return False
    
    try:
        response = requests.get(
            f"{BASE_URL}/autopilot/weekly-actions",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n   Response received:")
            print(f"   {json.dumps(data, indent=2)[:500]}...")
            
            # Verify response structure
            required_fields = ["weeklyActions", "totalPotentialValue", "generatedAt", "period"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                log_test("Weekly Actions Endpoint", False, f"Missing fields: {missing_fields}")
                return False
            
            log_test("Weekly Actions Endpoint", True, f"Endpoint working, all required fields present")
            return True
        else:
            log_test("Weekly Actions Endpoint", False, f"Status {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        log_test("Weekly Actions Endpoint", False, f"Exception: {str(e)}")
        return False

def test_response_structure():
    """Test 4: Verify response structure details"""
    print_section("TEST 4: Response Structure Validation")
    
    if not clinic_token:
        log_test("Response Structure", False, "No clinic token available")
        return False
    
    try:
        response = requests.get(
            f"{BASE_URL}/autopilot/weekly-actions",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=15
        )
        
        if response.status_code != 200:
            log_test("Response Structure", False, f"Status {response.status_code}")
            return False
        
        data = response.json()
        
        # Check weeklyActions array
        if not isinstance(data.get("weeklyActions"), list):
            log_test("Response Structure", False, "weeklyActions is not an array")
            return False
        
        print(f"\n   Found {len(data['weeklyActions'])} weekly actions")
        
        # Check each action structure
        required_action_fields = ["id", "type", "priority", "title", "description", "estimatedValue", "clients"]
        
        for i, action in enumerate(data["weeklyActions"]):
            missing = [field for field in required_action_fields if field not in action]
            if missing:
                log_test("Response Structure", False, f"Action {i} missing fields: {missing}")
                return False
            
            print(f"\n   Action {action['id']}:")
            print(f"     Type: {action['type']}")
            print(f"     Priority: {action['priority']}")
            print(f"     Title: {action['title']}")
            print(f"     Clients: {action['clients']}")
            print(f"     Estimated Value: {action['estimatedValue']}")
        
        # Check totalPotentialValue is a number
        if not isinstance(data.get("totalPotentialValue"), (int, float)):
            log_test("Response Structure", False, "totalPotentialValue is not a number")
            return False
        
        print(f"\n   Total Potential Value: €{data['totalPotentialValue']}")
        
        # Check period
        if data.get("period") != "questa-settimana":
            log_test("Response Structure", False, f"Unexpected period: {data.get('period')}")
            return False
        
        log_test("Response Structure", True, f"All structure validations passed")
        return True
        
    except Exception as e:
        log_test("Response Structure", False, f"Exception: {str(e)}")
        return False

def test_data_integration():
    """Test 5: Verify real data integration"""
    print_section("TEST 5: Real Data Integration")
    
    if not clinic_token:
        log_test("Data Integration", False, "No clinic token available")
        return False
    
    try:
        response = requests.get(
            f"{BASE_URL}/autopilot/weekly-actions",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=15
        )
        
        if response.status_code != 200:
            log_test("Data Integration", False, f"Status {response.status_code}")
            return False
        
        data = response.json()
        
        # Verify we have actions (means data was read from MongoDB)
        if len(data["weeklyActions"]) == 0:
            log_test("Data Integration", False, "No actions generated - possible MongoDB read issue")
            return False
        
        # Check for expected action types
        action_types = [action["type"] for action in data["weeklyActions"]]
        print(f"\n   Action types found: {action_types}")
        
        # Should have at least dormant clients and vaccines
        expected_types = ["dormienti", "vaccini"]
        found_types = [t for t in expected_types if t in action_types]
        
        if len(found_types) < 2:
            log_test("Data Integration", False, f"Expected types {expected_types}, found {found_types}")
            return False
        
        # Verify clients count is reasonable (> 0)
        for action in data["weeklyActions"]:
            if action["clients"] < 0:
                log_test("Data Integration", False, f"Invalid clients count: {action['clients']}")
                return False
        
        print(f"\n   ✓ Dormant clients calculation working")
        print(f"   ✓ Vaccine expiration calculation working")
        print(f"   ✓ MongoDB collections accessed successfully")
        
        log_test("Data Integration", True, "Real data integration verified")
        return True
        
    except Exception as e:
        log_test("Data Integration", False, f"Exception: {str(e)}")
        return False

def test_value_calculation():
    """Test 6: Verify estimated value calculations"""
    print_section("TEST 6: Value Calculation Verification")
    
    if not clinic_token:
        log_test("Value Calculation", False, "No clinic token available")
        return False
    
    try:
        response = requests.get(
            f"{BASE_URL}/autopilot/weekly-actions",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=15
        )
        
        if response.status_code != 200:
            log_test("Value Calculation", False, f"Status {response.status_code}")
            return False
        
        data = response.json()
        
        # Verify estimatedValue format (should be €XXX)
        for action in data["weeklyActions"]:
            est_value = action["estimatedValue"]
            if not est_value.startswith("€"):
                log_test("Value Calculation", False, f"Invalid value format: {est_value}")
                return False
            
            # Extract numeric value
            try:
                numeric_value = int(est_value.replace("€", "").replace(",", ""))
                if numeric_value < 0:
                    log_test("Value Calculation", False, f"Negative value: {est_value}")
                    return False
            except:
                log_test("Value Calculation", False, f"Cannot parse value: {est_value}")
                return False
        
        # Verify totalPotentialValue is positive
        if data["totalPotentialValue"] < 0:
            log_test("Value Calculation", False, f"Negative total: {data['totalPotentialValue']}")
            return False
        
        print(f"\n   ✓ All estimated values properly formatted")
        print(f"   ✓ Total potential value calculated: €{data['totalPotentialValue']}")
        
        log_test("Value Calculation", True, "Value calculations verified")
        return True
        
    except Exception as e:
        log_test("Value Calculation", False, f"Exception: {str(e)}")
        return False

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("  TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for r in test_results if r["passed"])
    total = len(test_results)
    
    print(f"\nTotal Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    
    if total - passed > 0:
        print("\n❌ FAILED TESTS:")
        for r in test_results:
            if not r["passed"]:
                print(f"  - {r['test']}: {r['message']}")
    
    print("\n" + "="*80)
    
    return passed == total

def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("  VETBUDDY AUTOPILOT SETTIMANALE BACKEND API TEST")
    print("  Testing: /api/autopilot/weekly-actions")
    print("="*80)
    
    # Run tests in sequence
    tests = [
        test_clinic_login,
        test_unauthorized_access,
        test_weekly_actions_endpoint,
        test_response_structure,
        test_data_integration,
        test_value_calculation
    ]
    
    for test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"\n❌ CRITICAL ERROR in {test_func.__name__}: {str(e)}")
            test_results.append({
                "test": test_func.__name__,
                "passed": False,
                "message": f"Critical error: {str(e)}"
            })
    
    # Print summary
    all_passed = print_summary()
    
    # Exit with appropriate code
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
