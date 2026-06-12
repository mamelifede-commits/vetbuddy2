#!/usr/bin/env python3
"""
VetBuddy Backend API Testing - 6 New Intelligent Automations
Tests the new work-management automations module
"""

import requests
import json
import sys

# Base URL from .env
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_test(message):
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST: {message}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")

def print_success(message):
    print(f"{GREEN}✅ SUCCESS: {message}{RESET}")

def print_error(message):
    print(f"{RED}❌ ERROR: {message}{RESET}")

def print_info(message):
    print(f"{YELLOW}ℹ️  INFO: {message}{RESET}")

def test_1_clinic_login():
    """Test 1: POST /api/auth/login with clinic credentials"""
    print_test("Test 1: Clinic Login")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": CLINIC_EMAIL,
                "password": CLINIC_PASSWORD
            },
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'token' in data:
                print_success(f"Login successful! Token received.")
                print_info(f"User: {data.get('user', {}).get('name', 'N/A')}")
                print_info(f"Role: {data.get('user', {}).get('role', 'N/A')}")
                return data['token']
            else:
                print_error("Login response missing token")
                return None
        else:
            print_error(f"Login failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print_error(f"Exception during login: {str(e)}")
        return None

def test_2_get_automation_settings(token):
    """Test 2: GET /api/automations/settings - verify 6 new keys exist"""
    print_test("Test 2: GET Automation Settings - Verify 6 New Keys")
    
    try:
        response = requests.get(
            f"{BASE_URL}/automations/settings",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success') != True:
                print_error(f"Response success field is not true: {data.get('success')}")
                return None
            
            settings = data.get('settings', {})
            plan = data.get('plan', 'N/A')
            automations_count = data.get('automationsCount', 0)
            
            print_success(f"Settings retrieved successfully!")
            print_info(f"Plan: {plan}")
            print_info(f"Automations Count: {automations_count}")
            
            # Check for the 6 new keys
            new_keys = [
                'noShowRiskPrediction',
                'smartAgendaFiller',
                'noShowRecovery',
                'estimateFollowup',
                'paymentEscalation',
                'labDelayAlert'
            ]
            
            print_info("\nChecking for 6 new automation keys:")
            all_found = True
            for key in new_keys:
                if key in settings:
                    value = settings[key]
                    print_success(f"  ✓ {key}: {value}")
                else:
                    print_error(f"  ✗ {key}: NOT FOUND")
                    all_found = False
            
            if all_found:
                print_success("\nAll 6 new automation keys found in settings!")
                return settings
            else:
                print_error("\nSome automation keys are missing!")
                return None
        else:
            print_error(f"Failed to get settings with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print_error(f"Exception during get settings: {str(e)}")
        return None

def test_3_toggle_automation(token, plan):
    """Test 3: POST /api/automations/settings - toggle noShowRiskPrediction"""
    print_test("Test 3: POST Toggle Single Automation (noShowRiskPrediction)")
    
    try:
        # First, toggle to false
        print_info("Toggling noShowRiskPrediction to FALSE...")
        response = requests.post(
            f"{BASE_URL}/automations/settings",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "key": "noShowRiskPrediction",
                "enabled": False
            },
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        # Check if plan allows this automation
        if response.status_code == 403:
            data = response.json()
            print_info(f"Plan '{plan}' does not allow this automation (expected for 'starter' plan)")
            print_info(f"Response: {data.get('error', 'N/A')}")
            print_success("403 response is CORRECT behavior for starter plan!")
            return True
        elif response.status_code == 200:
            data = response.json()
            if data.get('success') == True:
                print_success(f"Toggle to FALSE successful!")
                print_info(f"Message: {data.get('message', 'N/A')}")
                
                # Now toggle back to true
                print_info("\nToggling noShowRiskPrediction back to TRUE...")
                response2 = requests.post(
                    f"{BASE_URL}/automations/settings",
                    headers={"Authorization": f"Bearer {token}"},
                    json={
                        "key": "noShowRiskPrediction",
                        "enabled": True
                    },
                    timeout=10
                )
                
                if response2.status_code == 200:
                    data2 = response2.json()
                    if data2.get('success') == True:
                        print_success(f"Toggle back to TRUE successful!")
                        return True
                    else:
                        print_error("Toggle back to TRUE failed")
                        return False
                else:
                    print_error(f"Toggle back failed with status {response2.status_code}")
                    return False
            else:
                print_error("Toggle response success field is not true")
                return False
        else:
            print_error(f"Toggle failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception during toggle: {str(e)}")
        return False

def test_4_put_full_settings(token, original_settings):
    """Test 4: PUT /api/automations/settings - update full settings object"""
    print_test("Test 4: PUT Full Settings Object")
    
    try:
        print_info("Sending full settings object via PUT...")
        response = requests.put(
            f"{BASE_URL}/automations/settings",
            headers={"Authorization": f"Bearer {token}"},
            json={"settings": original_settings},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') == True:
                print_success("PUT full settings successful!")
                print_info(f"Message: {data.get('message', 'N/A')}")
                
                # Verify via GET
                print_info("\nVerifying settings persisted via GET...")
                verify_response = requests.get(
                    f"{BASE_URL}/automations/settings",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=10
                )
                
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    new_settings = verify_data.get('settings', {})
                    
                    # Check if the 6 new keys still exist
                    new_keys = [
                        'noShowRiskPrediction',
                        'smartAgendaFiller',
                        'noShowRecovery',
                        'estimateFollowup',
                        'paymentEscalation',
                        'labDelayAlert'
                    ]
                    
                    all_persist = True
                    for key in new_keys:
                        if key not in new_settings:
                            print_error(f"Key {key} not found after PUT!")
                            all_persist = False
                    
                    if all_persist:
                        print_success("All 6 new keys persisted after PUT!")
                        return True
                    else:
                        print_error("Some keys did not persist after PUT")
                        return False
                else:
                    print_error("Failed to verify settings after PUT")
                    return False
            else:
                print_error("PUT response success field is not true")
                return False
        else:
            print_error(f"PUT failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception during PUT: {str(e)}")
        return False

def test_5_cron_daily(token):
    """Test 5: GET /api/cron/daily - verify 6 new keys in results (ONLY ONCE!)"""
    print_test("Test 5: GET /api/cron/daily - Verify 6 New Result Keys")
    
    print_info("⚠️  WARNING: This endpoint sends REAL EMAILS and sets idempotency flags!")
    print_info("⚠️  Calling ONLY ONCE as per review request instructions!")
    
    try:
        response = requests.get(
            f"{BASE_URL}/cron/daily",
            timeout=30  # Longer timeout for cron job
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success') != True:
                print_error(f"Cron response success field is not true: {data.get('success')}")
                return False
            
            results = data.get('results', {})
            
            print_success("Cron job executed successfully!")
            print_info(f"Timestamp: {data.get('timestamp', 'N/A')}")
            
            # Check for the 6 new result keys
            new_result_keys = [
                'noShowRiskPrediction',
                'smartAgendaFiller',
                'noShowRecovery',
                'estimateFollowup',
                'paymentEscalation',
                'labDelayAlert'
            ]
            
            print_info("\nChecking for 6 new automation result keys:")
            all_found = True
            all_no_errors = True
            
            for key in new_result_keys:
                if key in results:
                    result = results[key]
                    sent = result.get('sent', 0)
                    errors = result.get('errors', 0)
                    skipped = result.get('skipped', 0)
                    
                    print_success(f"  ✓ {key}: sent={sent}, errors={errors}, skipped={skipped}")
                    
                    if errors > 0:
                        print_error(f"    ⚠️  {key} has {errors} errors!")
                        all_no_errors = False
                else:
                    print_error(f"  ✗ {key}: NOT FOUND in results")
                    all_found = False
            
            if all_found and all_no_errors:
                print_success("\n✅ All 6 new automation results found with 0 errors!")
                return True
            elif all_found:
                print_error("\n⚠️  All keys found but some have errors")
                return False
            else:
                print_error("\n❌ Some automation result keys are missing!")
                return False
        else:
            print_error(f"Cron job failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            
            # Check supervisor logs for errors
            print_info("\nChecking supervisor logs for errors...")
            import subprocess
            try:
                log_output = subprocess.check_output(
                    ["tail", "-n", "50", "/var/log/supervisor/nextjs.out.log"],
                    stderr=subprocess.STDOUT,
                    text=True
                )
                print_info("Last 50 lines of nextjs.out.log:")
                print(log_output)
            except Exception as log_err:
                print_error(f"Could not read logs: {str(log_err)}")
            
            return False
            
    except Exception as e:
        print_error(f"Exception during cron job: {str(e)}")
        return False

def test_6_regression_check(token):
    """Test 6: Regression check - GET /api/auth/me and GET /api/automations/settings"""
    print_test("Test 6: Regression Check After Cron Run")
    
    try:
        # Check /api/auth/me
        print_info("Testing GET /api/auth/me...")
        me_response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        print_info(f"Status Code: {me_response.status_code}")
        
        if me_response.status_code == 200:
            me_data = me_response.json()
            print_success(f"GET /api/auth/me still working!")
            print_info(f"User: {me_data.get('name', 'N/A')}")
        else:
            print_error(f"GET /api/auth/me failed with status {me_response.status_code}")
            return False
        
        # Check /api/automations/settings
        print_info("\nTesting GET /api/automations/settings...")
        settings_response = requests.get(
            f"{BASE_URL}/automations/settings",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        print_info(f"Status Code: {settings_response.status_code}")
        
        if settings_response.status_code == 200:
            settings_data = settings_response.json()
            if settings_data.get('success') == True:
                print_success("GET /api/automations/settings still working!")
                return True
            else:
                print_error("Settings response success field is not true")
                return False
        else:
            print_error(f"GET /api/automations/settings failed with status {settings_response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Exception during regression check: {str(e)}")
        return False

def main():
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}VetBuddy Backend API Testing - 6 New Intelligent Automations{RESET}")
    print(f"{BLUE}Base URL: {BASE_URL}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    results = {
        "test_1_login": False,
        "test_2_get_settings": False,
        "test_3_toggle": False,
        "test_4_put_settings": False,
        "test_5_cron": False,
        "test_6_regression": False
    }
    
    # Test 1: Login
    token = test_1_clinic_login()
    if token:
        results["test_1_login"] = True
    else:
        print_error("\n❌ Login failed. Cannot proceed with other tests.")
        sys.exit(1)
    
    # Test 2: Get automation settings
    settings = test_2_get_automation_settings(token)
    if settings:
        results["test_2_get_settings"] = True
        
        # Get plan info for test 3
        plan_response = requests.get(
            f"{BASE_URL}/automations/settings",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        plan = plan_response.json().get('plan', 'starter') if plan_response.status_code == 200 else 'starter'
    else:
        print_error("\n❌ Get settings failed. Cannot proceed with other tests.")
        sys.exit(1)
    
    # Test 3: Toggle automation
    if test_3_toggle_automation(token, plan):
        results["test_3_toggle"] = True
    
    # Test 4: PUT full settings
    if test_4_put_full_settings(token, settings):
        results["test_4_put_settings"] = True
    
    # Test 5: Cron daily (ONLY ONCE!)
    if test_5_cron_daily(token):
        results["test_5_cron"] = True
    
    # Test 6: Regression check
    if test_6_regression_check(token):
        results["test_6_regression"] = True
    
    # Summary
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST SUMMARY{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_flag in results.items():
        status = f"{GREEN}✅ PASSED{RESET}" if passed_flag else f"{RED}❌ FAILED{RESET}"
        print(f"{test_name}: {status}")
    
    print(f"\n{BLUE}Total: {passed}/{total} tests passed{RESET}")
    
    if passed == total:
        print(f"\n{GREEN}{'='*80}{RESET}")
        print(f"{GREEN}🎉 ALL TESTS PASSED! 🎉{RESET}")
        print(f"{GREEN}{'='*80}{RESET}\n")
        sys.exit(0)
    else:
        print(f"\n{RED}{'='*80}{RESET}")
        print(f"{RED}❌ SOME TESTS FAILED{RESET}")
        print(f"{RED}{'='*80}{RESET}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
