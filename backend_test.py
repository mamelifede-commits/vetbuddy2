#!/usr/bin/env python3
"""
VetBuddy Backend API Testing - 7 New Advanced Automations
Tests the new advanced automations module with 7 automations:
morningBriefing, bookingDropAlert, expiryStockAlert, healthPlanRenewal, 
ownerBirthday, therapyReminder, labMonthlyReport
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://clinic-report-review.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

# Test credentials from /app/memory/test_credentials.md
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"
OWNER_EMAIL = "proprietario.demo@vetbuddy.it"
OWNER_PASSWORD = "demo123"

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def log_success(message):
    print(f"{GREEN}✅ {message}{RESET}")

def log_error(message):
    print(f"{RED}❌ {message}{RESET}")

def log_info(message):
    print(f"{BLUE}ℹ️  {message}{RESET}")

def log_warning(message):
    print(f"{YELLOW}⚠️  {message}{RESET}")

def test_clinic_login():
    """Test 1: POST /api/auth/login (clinic) → 200 + token"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 1: Clinic Authentication{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json={"email": CLINIC_EMAIL, "password": CLINIC_PASSWORD},
            timeout=10
        )
        
        log_info(f"POST /api/auth/login - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'token' in data:
                log_success(f"Clinic login successful - Token received")
                log_info(f"Clinic: {data.get('user', {}).get('clinicName', 'N/A')}")
                log_info(f"Plan: {data.get('user', {}).get('subscriptionPlan', 'N/A')}")
                return data['token']
            else:
                log_error("Login response missing token")
                return None
        else:
            log_error(f"Login failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return None
            
    except Exception as e:
        log_error(f"Exception during clinic login: {str(e)}")
        return None

def test_automation_settings_get(token):
    """Test 2: GET /api/automations/settings → verify 6 new keys present"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 2: Get Automation Settings - Verify 6 New Keys{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(
            f"{API_URL}/automations/settings",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        log_info(f"GET /api/automations/settings - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            settings = data.get('settings', {})
            
            # Check for the 6 new clinic automation keys
            new_keys = [
                'morningBriefing',
                'bookingDropAlert',
                'expiryStockAlert',
                'healthPlanRenewal',
                'ownerBirthday',
                'therapyReminder'
            ]
            
            all_found = True
            for key in new_keys:
                if key in settings:
                    log_success(f"Key '{key}' found in settings: {settings[key]}")
                else:
                    log_error(f"Key '{key}' NOT found in settings")
                    all_found = False
            
            if all_found:
                log_success("All 6 new automation keys present in settings")
                log_info(f"Total settings keys: {len(settings)}")
                log_info(f"Plan: {data.get('plan', 'N/A')}")
                log_info(f"Automations count: {data.get('automationsCount', 'N/A')}")
                return True
            else:
                log_error("Some automation keys are missing")
                return False
        else:
            log_error(f"Failed to get settings with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        log_error(f"Exception during get settings: {str(e)}")
        return False

def test_toggle_automation(token):
    """Test 3: POST /api/automations/settings - Toggle morningBriefing"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 3: Toggle morningBriefing Automation{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        # Toggle to false
        log_info("Toggling morningBriefing to FALSE")
        response = requests.post(
            f"{API_URL}/automations/settings",
            headers={"Authorization": f"Bearer {token}"},
            json={"key": "morningBriefing", "enabled": False},
            timeout=10
        )
        
        log_info(f"POST /api/automations/settings (disable) - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            log_success(f"Disabled morningBriefing: {data.get('message', '')}")
        else:
            log_error(f"Failed to disable with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return False
        
        # Toggle back to true
        log_info("Toggling morningBriefing back to TRUE")
        response = requests.post(
            f"{API_URL}/automations/settings",
            headers={"Authorization": f"Bearer {token}"},
            json={"key": "morningBriefing", "enabled": True},
            timeout=10
        )
        
        log_info(f"POST /api/automations/settings (enable) - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            log_success(f"Enabled morningBriefing: {data.get('message', '')}")
            return True
        else:
            log_error(f"Failed to enable with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        log_error(f"Exception during toggle automation: {str(e)}")
        return False

def test_cron_daily():
    """Test 4: GET /api/cron/daily → verify all 7 automation results (ONLY ONCE)"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 4: Daily Cron Job - Verify 7 New Automations{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    log_warning("IMPORTANT: This endpoint sends REAL emails via Resend - calling ONLY ONCE")
    
    try:
        response = requests.get(
            f"{API_URL}/cron/daily",
            timeout=60  # Longer timeout for cron job
        )
        
        log_info(f"GET /api/cron/daily - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if not data.get('success'):
                log_error(f"Cron job returned success=false")
                log_error(f"Response: {json.dumps(data, indent=2)}")
                return False
            
            results = data.get('results', {})
            
            # Check for all 7 new automation keys
            new_automation_keys = [
                'morningBriefing',
                'bookingDropAlert',
                'expiryStockAlert',
                'healthPlanRenewal',
                'ownerBirthday',
                'therapyReminder',
                'labMonthlyReport'
            ]
            
            all_found = True
            all_errors_zero = True
            
            print(f"\n{BLUE}Checking 7 New Automation Results:{RESET}")
            for key in new_automation_keys:
                if key in results:
                    result = results[key]
                    sent = result.get('sent', 0)
                    errors = result.get('errors', 0)
                    skipped = result.get('skipped', 0)
                    
                    status_icon = "✅" if errors == 0 else "❌"
                    print(f"{status_icon} {key}: sent={sent}, errors={errors}, skipped={skipped}")
                    
                    if errors > 0:
                        all_errors_zero = False
                        log_error(f"  {key} has {errors} errors!")
                else:
                    log_error(f"Key '{key}' NOT found in results")
                    all_found = False
            
            if all_found and all_errors_zero:
                log_success("All 7 automation keys present in results with errors=0")
                log_info(f"Timestamp: {data.get('timestamp', 'N/A')}")
                return True
            elif all_found and not all_errors_zero:
                log_error("All keys found but some have errors > 0")
                return False
            else:
                log_error("Some automation keys are missing from results")
                return False
        else:
            log_error(f"Cron job failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            
            # Check supervisor logs for error details
            log_info("Checking supervisor logs for error details...")
            return False
            
    except Exception as e:
        log_error(f"Exception during cron job: {str(e)}")
        return False

def test_owner_birthdate_flow():
    """Test 5: Owner birthDate flow - login, update profile, verify persistence"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 5: Owner birthDate Flow{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        # Step 1: Owner login
        log_info("Step 1: Owner login")
        response = requests.post(
            f"{API_URL}/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD},
            timeout=10
        )
        
        log_info(f"POST /api/auth/login (owner) - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_error(f"Owner login failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return False
        
        data = response.json()
        owner_token = data.get('token')
        if not owner_token:
            log_error("Owner login response missing token")
            return False
        
        log_success(f"Owner login successful - {data.get('user', {}).get('name', 'N/A')}")
        
        # Step 2: Update profile with birthDate
        log_info("Step 2: Update profile with birthDate")
        update_data = {
            "birthDate": "1990-05-15",
            "phone": "+39 333 0000000"
        }
        
        response = requests.put(
            f"{API_URL}/owner/profile",
            headers={"Authorization": f"Bearer {owner_token}"},
            json=update_data,
            timeout=10
        )
        
        log_info(f"PUT /api/owner/profile - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_error(f"Profile update failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            return False
        
        log_success("Profile updated with birthDate and phone")
        
        # Step 3: Verify persistence via GET /api/auth/me
        log_info("Step 3: Verify birthDate persistence via GET /api/auth/me")
        response = requests.get(
            f"{API_URL}/auth/me",
            headers={"Authorization": f"Bearer {owner_token}"},
            timeout=10
        )
        
        log_info(f"GET /api/auth/me - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_error(f"Get profile failed with status {response.status_code}")
            return False
        
        data = response.json()
        stored_birthdate = data.get('birthDate')
        stored_phone = data.get('phone')
        
        if stored_birthdate == "1990-05-15":
            log_success(f"birthDate persisted correctly: {stored_birthdate}")
        else:
            log_error(f"birthDate mismatch - Expected: 1990-05-15, Got: {stored_birthdate}")
            return False
        
        if stored_phone == "+39 333 0000000":
            log_success(f"phone persisted correctly: {stored_phone}")
        else:
            log_warning(f"phone value: {stored_phone}")
        
        return True
        
    except Exception as e:
        log_error(f"Exception during owner birthDate flow: {str(e)}")
        return False

def test_regression(clinic_token):
    """Test 6: Regression - verify settings and auth/me still work after cron"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 6: Regression Tests{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        # Test GET /api/automations/settings
        log_info("Testing GET /api/automations/settings after cron run")
        response = requests.get(
            f"{API_URL}/automations/settings",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            log_success("GET /api/automations/settings still working")
        else:
            log_error(f"Settings endpoint failed with status {response.status_code}")
            return False
        
        # Test GET /api/auth/me
        log_info("Testing GET /api/auth/me after cron run")
        response = requests.get(
            f"{API_URL}/auth/me",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            log_success(f"GET /api/auth/me still working - {data.get('clinicName', 'N/A')}")
            return True
        else:
            log_error(f"Auth/me endpoint failed with status {response.status_code}")
            return False
        
    except Exception as e:
        log_error(f"Exception during regression tests: {str(e)}")
        return False

def main():
    """Run all tests"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}VetBuddy Backend API Testing - 7 New Advanced Automations{RESET}")
    print(f"{BLUE}Base URL: {BASE_URL}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    results = {
        "test_1_clinic_login": False,
        "test_2_settings_get": False,
        "test_3_toggle_automation": False,
        "test_4_cron_daily": False,
        "test_5_owner_birthdate": False,
        "test_6_regression": False
    }
    
    # Test 1: Clinic login
    clinic_token = test_clinic_login()
    if clinic_token:
        results["test_1_clinic_login"] = True
    else:
        log_error("Cannot proceed without clinic token")
        print_summary(results)
        sys.exit(1)
    
    # Test 2: Get automation settings
    if test_automation_settings_get(clinic_token):
        results["test_2_settings_get"] = True
    
    # Test 3: Toggle automation
    if test_toggle_automation(clinic_token):
        results["test_3_toggle_automation"] = True
    
    # Test 4: Cron daily (ONLY ONCE - sends real emails)
    if test_cron_daily():
        results["test_4_cron_daily"] = True
    
    # Test 5: Owner birthDate flow
    if test_owner_birthdate_flow():
        results["test_5_owner_birthdate"] = True
    
    # Test 6: Regression
    if test_regression(clinic_token):
        results["test_6_regression"] = True
    
    # Print summary
    print_summary(results)
    
    # Exit with appropriate code
    if all(results.values()):
        sys.exit(0)
    else:
        sys.exit(1)

def print_summary(results):
    """Print test summary"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST SUMMARY{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_flag in results.items():
        status = f"{GREEN}PASSED{RESET}" if passed_flag else f"{RED}FAILED{RESET}"
        print(f"{test_name}: {status}")
    
    print(f"\n{BLUE}Total: {passed}/{total} tests passed{RESET}")
    
    if passed == total:
        print(f"{GREEN}{'='*80}{RESET}")
        print(f"{GREEN}ALL TESTS PASSED ✅{RESET}")
        print(f"{GREEN}{'='*80}{RESET}")
    else:
        print(f"{RED}{'='*80}{RESET}")
        print(f"{RED}SOME TESTS FAILED ❌{RESET}")
        print(f"{RED}{'='*80}{RESET}")

if __name__ == "__main__":
    main()
