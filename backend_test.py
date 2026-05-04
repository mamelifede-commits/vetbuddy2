#!/usr/bin/env python3
"""
VetBuddy Backend API Testing Script - Health Plans (Piani Salute) Module
Tests all Health Plans API endpoints as specified in the review request
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_test(message):
    print(f"{BLUE}[TEST]{RESET} {message}")

def print_success(message):
    print(f"{GREEN}✅ {message}{RESET}")

def print_error(message):
    print(f"{RED}❌ {message}{RESET}")

def print_info(message):
    print(f"{YELLOW}ℹ️  {message}{RESET}")

def print_separator():
    print("\n" + "="*80 + "\n")

# Global variables to store data between tests
auth_token = None
created_plan_id = None
pet_id = None
assignment_id = None

def test_1_login():
    """Test 1: Login with clinic credentials"""
    global auth_token
    print_separator()
    print_test("Test 1: POST /api/auth/login - Clinic Authentication")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": CLINIC_EMAIL, "password": CLINIC_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'token' in data:
                auth_token = data['token']
                print_success(f"Login successful! Token received (length: {len(auth_token)})")
                print_info(f"User: {data.get('user', {}).get('email', 'N/A')}")
                print_info(f"Role: {data.get('user', {}).get('role', 'N/A')}")
                return True
            else:
                print_error("Login response missing token")
                print_info(f"Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print_error(f"Login failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Login test failed with exception: {str(e)}")
        return False

def test_2_get_plans_empty():
    """Test 2: Get health plans (should be empty initially)"""
    print_separator()
    print_test("Test 2: GET /api/health-plans - List Plans (Empty)")
    
    try:
        response = requests.get(
            f"{BASE_URL}/health-plans",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'plans' in data:
                plans_count = len(data['plans'])
                print_success(f"Plans retrieved successfully. Count: {plans_count}")
                print_info(f"Response structure: {json.dumps(data, indent=2)[:200]}...")
                return True
            else:
                print_error("Unexpected response structure")
                print_info(f"Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Test failed with exception: {str(e)}")
        return False

def test_3_get_stats_empty():
    """Test 3: Get health plans stats (should show zeros)"""
    print_separator()
    print_test("Test 3: GET /api/health-plans/stats - Get Statistics (Empty)")
    
    try:
        response = requests.get(
            f"{BASE_URL}/health-plans/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'stats' in data:
                stats = data['stats']
                print_success("Stats retrieved successfully")
                print_info(f"Total Plans: {stats.get('totalPlans', 0)}")
                print_info(f"Total Assignments: {stats.get('totalAssignments', 0)}")
                print_info(f"Completed Assignments: {stats.get('completedAssignments', 0)}")
                print_info(f"Upcoming Services: {stats.get('upcomingServices', 0)}")
                return True
            else:
                print_error("Unexpected response structure")
                print_info(f"Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Test failed with exception: {str(e)}")
        return False

def test_4_create_plan():
    """Test 4: Create a new health plan"""
    global created_plan_id
    print_separator()
    print_test("Test 4: POST /api/health-plans - Create Health Plan")
    
    plan_data = {
        "name": "Piano Cucciolo Test",
        "description": "Piano test per cuccioli",
        "targetGroup": "cucciolo",
        "durationMonths": 12,
        "services": [
            {"name": "Prima visita", "type": "visita", "monthOffset": 0},
            {"name": "Vaccino polivalente", "type": "vaccino", "monthOffset": 1},
            {"name": "Sverminazione", "type": "trattamento", "monthOffset": 2}
        ],
        "price": 150
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/health-plans",
            json=plan_data,
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            if data.get('success') and 'plan' in data:
                plan = data['plan']
                created_plan_id = plan.get('id')
                print_success(f"Plan created successfully! ID: {created_plan_id}")
                print_info(f"Name: {plan.get('name')}")
                print_info(f"Target Group: {plan.get('targetGroup')}")
                print_info(f"Duration: {plan.get('durationMonths')} months")
                print_info(f"Services: {len(plan.get('services', []))}")
                print_info(f"Price: €{plan.get('price')}")
                return True
            else:
                print_error("Unexpected response structure")
                print_info(f"Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Test failed with exception: {str(e)}")
        return False

def test_5_get_plans_with_data():
    """Test 5: Get health plans (should now have 1 plan)"""
    print_separator()
    print_test("Test 5: GET /api/health-plans - List Plans (With Data)")
    
    try:
        response = requests.get(
            f"{BASE_URL}/health-plans",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'plans' in data:
                plans_count = len(data['plans'])
                print_success(f"Plans retrieved successfully. Count: {plans_count}")
                
                if plans_count > 0:
                    print_info(f"First plan: {data['plans'][0].get('name')}")
                    print_info(f"Plan ID: {data['plans'][0].get('id')}")
                
                if plans_count >= 1:
                    return True
                else:
                    print_error("Expected at least 1 plan but got 0")
                    return False
            else:
                print_error("Unexpected response structure")
                print_info(f"Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Test failed with exception: {str(e)}")
        return False

def test_6_get_pet_id():
    """Test 6: Get a pet ID for assignment"""
    global pet_id
    print_separator()
    print_test("Test 6: GET /api/pets - Get Pet ID for Assignment")
    
    try:
        response = requests.get(
            f"{BASE_URL}/pets",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            # Handle both array response and object with pets key
            pets = data if isinstance(data, list) else data.get('pets', [])
            
            if len(pets) > 0:
                pet_id = pets[0].get('id')
                print_success(f"Pet ID retrieved: {pet_id}")
                print_info(f"Pet Name: {pets[0].get('name', 'N/A')}")
                print_info(f"Species: {pets[0].get('species', 'N/A')}")
                return True
            else:
                print_error("No pets found in the system")
                print_info(f"Response: {json.dumps(data, indent=2)[:500]}...")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Test failed with exception: {str(e)}")
        return False

def test_7_assign_plan():
    """Test 7: Assign plan to pet"""
    global assignment_id
    print_separator()
    print_test("Test 7: POST /api/health-plans/assign - Assign Plan to Pet")
    
    if not created_plan_id:
        print_error("No plan ID available. Skipping test.")
        return False
    
    if not pet_id:
        print_error("No pet ID available. Skipping test.")
        return False
    
    assignment_data = {
        "planId": created_plan_id,
        "petId": pet_id
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/health-plans/assign",
            json=assignment_data,
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            if data.get('success') and 'assignment' in data:
                assignment = data['assignment']
                assignment_id = assignment.get('id')
                print_success(f"Plan assigned successfully! Assignment ID: {assignment_id}")
                print_info(f"Plan Name: {assignment.get('planName')}")
                print_info(f"Pet ID: {assignment.get('petId')}")
                print_info(f"Status: {assignment.get('status')}")
                return True
            else:
                print_error("Unexpected response structure")
                print_info(f"Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Test failed with exception: {str(e)}")
        return False

def test_8_get_assignments():
    """Test 8: Get assignments (should have 1 assignment)"""
    print_separator()
    print_test("Test 8: GET /api/health-plans/assignments - List Assignments")
    
    try:
        response = requests.get(
            f"{BASE_URL}/health-plans/assignments",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'assignments' in data:
                assignments_count = len(data['assignments'])
                print_success(f"Assignments retrieved successfully. Count: {assignments_count}")
                
                if assignments_count > 0:
                    print_info(f"First assignment ID: {data['assignments'][0].get('id')}")
                    print_info(f"Plan Name: {data['assignments'][0].get('planName')}")
                    print_info(f"Status: {data['assignments'][0].get('status')}")
                
                if assignments_count >= 1:
                    return True
                else:
                    print_error("Expected at least 1 assignment but got 0")
                    return False
            else:
                print_error("Unexpected response structure")
                print_info(f"Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Test failed with exception: {str(e)}")
        return False

def test_9_complete_service():
    """Test 9: Complete a service in the assignment"""
    print_separator()
    print_test("Test 9: POST /api/health-plans/complete-service - Complete Service")
    
    if not assignment_id:
        print_error("No assignment ID available. Skipping test.")
        return False
    
    completion_data = {
        "assignmentId": assignment_id,
        "serviceIndex": 0
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/health-plans/complete-service",
            json=completion_data,
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success("Service completed successfully!")
                print_info(f"All services completed: {data.get('completed', False)}")
                print_info(f"Completed services count: {len(data.get('completedServices', []))}")
                return True
            else:
                print_error("Unexpected response structure")
                print_info(f"Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Test failed with exception: {str(e)}")
        return False

def test_10_update_plan():
    """Test 10: Update the health plan"""
    print_separator()
    print_test("Test 10: PUT /api/health-plans/{planId} - Update Plan")
    
    if not created_plan_id:
        print_error("No plan ID available. Skipping test.")
        return False
    
    update_data = {
        "name": "Piano Cucciolo Aggiornato",
        "price": 180
    }
    
    try:
        response = requests.put(
            f"{BASE_URL}/health-plans/{created_plan_id}",
            json=update_data,
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success("Plan updated successfully!")
                print_info(f"Updated name: {update_data['name']}")
                print_info(f"Updated price: €{update_data['price']}")
                return True
            else:
                print_error("Unexpected response structure")
                print_info(f"Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Test failed with exception: {str(e)}")
        return False

def test_11_delete_plan():
    """Test 11: Delete (deactivate) the health plan"""
    print_separator()
    print_test("Test 11: DELETE /api/health-plans/{planId} - Delete Plan (Soft Delete)")
    
    if not created_plan_id:
        print_error("No plan ID available. Skipping test.")
        return False
    
    try:
        response = requests.delete(
            f"{BASE_URL}/health-plans/{created_plan_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success("Plan deleted (deactivated) successfully!")
                return True
            else:
                print_error("Unexpected response structure")
                print_info(f"Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Test failed with exception: {str(e)}")
        return False

def test_12_verify_stats():
    """Test 12: Verify stats after all operations"""
    print_separator()
    print_test("Test 12: GET /api/health-plans/stats - Verify Final Statistics")
    
    try:
        response = requests.get(
            f"{BASE_URL}/health-plans/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'stats' in data:
                stats = data['stats']
                print_success("Final stats retrieved successfully")
                print_info(f"Total Plans: {stats.get('totalPlans', 0)}")
                print_info(f"Total Assignments: {stats.get('totalAssignments', 0)}")
                print_info(f"Completed Assignments: {stats.get('completedAssignments', 0)}")
                print_info(f"Upcoming Services: {stats.get('upcomingServices', 0)}")
                return True
            else:
                print_error("Unexpected response structure")
                print_info(f"Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Test failed with exception: {str(e)}")
        return False

def main():
    """Run all tests in sequence"""
    print("\n" + "="*80)
    print(f"{BLUE}VetBuddy Health Plans (Piani Salute) API Testing{RESET}")
    print(f"Base URL: {BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    tests = [
        ("Login", test_1_login),
        ("Get Plans (Empty)", test_2_get_plans_empty),
        ("Get Stats (Empty)", test_3_get_stats_empty),
        ("Create Plan", test_4_create_plan),
        ("Get Plans (With Data)", test_5_get_plans_with_data),
        ("Get Pet ID", test_6_get_pet_id),
        ("Assign Plan", test_7_assign_plan),
        ("Get Assignments", test_8_get_assignments),
        ("Complete Service", test_9_complete_service),
        ("Update Plan", test_10_update_plan),
        ("Delete Plan", test_11_delete_plan),
        ("Verify Stats", test_12_verify_stats)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print_error(f"Test '{test_name}' crashed: {str(e)}")
            results.append((test_name, False))
    
    # Print summary
    print_separator()
    print(f"{BLUE}TEST SUMMARY{RESET}")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{GREEN}✅ PASSED{RESET}" if result else f"{RED}❌ FAILED{RESET}"
        print(f"{test_name:.<50} {status}")
    
    print("="*80)
    print(f"Total: {passed}/{total} tests passed ({(passed/total*100):.1f}%)")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80 + "\n")
    
    # Exit with appropriate code
    sys.exit(0 if passed == total else 1)

if __name__ == "__main__":
    main()
