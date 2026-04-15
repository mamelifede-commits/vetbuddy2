#!/usr/bin/env python3
"""
VetBuddy Lab Payment Backend API Testing
Tests all lab payment endpoints with proper authentication and authorization
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test credentials from /app/memory/test_credentials.md
CLINIC_CREDENTIALS = {
    "email": "demo@vetbuddy.it", 
    "password": "VetBuddy2025!Secure"
}

LAB_CREDENTIALS = {
    "email": "laboratorio1@vetbuddy.it",
    "password": "Lab2025!"
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

def test_lab_stripe_settings_get(lab_token):
    """Test GET /api/lab/stripe-settings"""
    print("🔧 Testing Lab Stripe Settings GET...")
    
    headers = {"Authorization": f"Bearer {lab_token}"}
    
    try:
        # Test GET /api/lab/stripe-settings
        response = requests.get(f"{BASE_URL}/lab/stripe-settings", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['stripePublishableKey', 'stripeSecretKey', 'stripeConfigured']
            
            missing_fields = [field for field in required_fields if field not in data]
            if not missing_fields:
                # Check that secret key is masked
                secret_key = data.get('stripeSecretKey', '')
                is_masked = secret_key.startswith('••••••••') or secret_key == ''
                
                print_test_result("GET /api/lab/stripe-settings", True, 
                                f"All required fields present. Secret key properly masked: {is_masked}. Configured: {data['stripeConfigured']}")
                return True, data
            else:
                print_test_result("GET /api/lab/stripe-settings", False, 
                                f"Missing required fields: {missing_fields}")
                return False, None
        else:
            print_test_result("GET /api/lab/stripe-settings", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False, None
            
    except Exception as e:
        print_test_result("GET /api/lab/stripe-settings", False, f"Exception: {e}")
        return False, None

def test_lab_stripe_settings_post(lab_token):
    """Test POST /api/lab/stripe-settings"""
    print("💾 Testing Lab Stripe Settings POST...")
    
    headers = {"Authorization": f"Bearer {lab_token}"}
    
    # Test data - using test keys as specified in review request
    test_data = {
        "stripePublishableKey": "pk_test_123456789",
        "stripeSecretKey": "sk_test_123456789"
    }
    
    try:
        # Test POST /api/lab/stripe-settings
        response = requests.post(f"{BASE_URL}/lab/stripe-settings", headers=headers, json=test_data)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_test_result("POST /api/lab/stripe-settings", True, 
                                "Successfully saved Stripe settings")
                return True
            else:
                print_test_result("POST /api/lab/stripe-settings", False, 
                                f"Unexpected response: {data}")
                return False
        else:
            print_test_result("POST /api/lab/stripe-settings", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("POST /api/lab/stripe-settings", False, f"Exception: {e}")
        return False

def test_lab_stripe_settings_verification(lab_token):
    """Test that Stripe settings were saved correctly"""
    print("✅ Testing Lab Stripe Settings Verification...")
    
    headers = {"Authorization": f"Bearer {lab_token}"}
    
    try:
        # Test GET /api/lab/stripe-settings again to verify
        response = requests.get(f"{BASE_URL}/lab/stripe-settings", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check that stripeConfigured is now true
            if data.get('stripeConfigured') == True:
                # Check that publishable key is saved
                if data.get('stripePublishableKey') == "pk_test_123456789":
                    # Check that secret key is masked but shows last 4 digits
                    secret_key = data.get('stripeSecretKey', '')
                    if secret_key.endswith('6789') and secret_key.startswith('••••••••'):
                        print_test_result("Stripe Settings Verification", True, 
                                        "Settings saved correctly, secret key properly masked")
                        return True
                    else:
                        print_test_result("Stripe Settings Verification", False, 
                                        f"Secret key not properly masked: {secret_key}")
                        return False
                else:
                    print_test_result("Stripe Settings Verification", False, 
                                    f"Publishable key not saved correctly: {data.get('stripePublishableKey')}")
                    return False
            else:
                print_test_result("Stripe Settings Verification", False, 
                                f"stripeConfigured should be true, got: {data.get('stripeConfigured')}")
                return False
        else:
            print_test_result("Stripe Settings Verification", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Stripe Settings Verification", False, f"Exception: {e}")
        return False

def test_lab_quote_checkout_auth_errors(clinic_token, lab_token):
    """Test authentication and authorization errors for lab quote checkout"""
    print("🔒 Testing Lab Quote Checkout Auth Errors...")
    
    test_data = {
        "labRequestId": "nonexistent",
        "originUrl": "https://clinic-report-review.preview.emergentagent.com"
    }
    
    try:
        # Test without auth - should return 401
        response = requests.post(f"{BASE_URL}/stripe/checkout/lab-quote", json=test_data)
        
        if response.status_code == 401:
            print_test_result("Lab Quote Checkout - No Auth", True, 
                            "Correctly blocked unauthenticated request")
        else:
            print_test_result("Lab Quote Checkout - No Auth", False, 
                            f"Expected 401, got {response.status_code}")
            return False
        
        # Test with lab token - should return 401 (only clinics can pay)
        lab_headers = {"Authorization": f"Bearer {lab_token}"}
        response = requests.post(f"{BASE_URL}/stripe/checkout/lab-quote", headers=lab_headers, json=test_data)
        
        if response.status_code == 401:
            print_test_result("Lab Quote Checkout - Lab Auth", True, 
                            "Correctly blocked lab user (only clinics can pay)")
            return True
        else:
            print_test_result("Lab Quote Checkout - Lab Auth", False, 
                            f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        print_test_result("Lab Quote Checkout Auth Errors", False, f"Exception: {e}")
        return False

def test_lab_quote_checkout_missing_request(clinic_token):
    """Test lab quote checkout with missing/invalid request ID"""
    print("🔍 Testing Lab Quote Checkout - Missing Request...")
    
    headers = {"Authorization": f"Bearer {clinic_token}"}
    
    try:
        # Test with missing labRequestId
        response = requests.post(f"{BASE_URL}/stripe/checkout/lab-quote", headers=headers, json={})
        
        if response.status_code == 400:
            data = response.json()
            if 'mancante' in data.get('error', '').lower():
                print_test_result("Lab Quote Checkout - Missing ID", True, 
                                f"Correctly returned 400 for missing ID: {data.get('error')}")
            else:
                print_test_result("Lab Quote Checkout - Missing ID", False, 
                                f"Wrong error message: {data.get('error')}")
                return False
        else:
            print_test_result("Lab Quote Checkout - Missing ID", False, 
                            f"Expected 400, got {response.status_code}")
            return False
        
        # Test with nonexistent labRequestId
        test_data = {
            "labRequestId": "nonexistent-request-id",
            "originUrl": "https://clinic-report-review.preview.emergentagent.com"
        }
        
        response = requests.post(f"{BASE_URL}/stripe/checkout/lab-quote", headers=headers, json=test_data)
        
        if response.status_code == 404:
            data = response.json()
            print_test_result("Lab Quote Checkout - Nonexistent Request", True, 
                            f"Correctly returned 404 for nonexistent request: {data.get('error')}")
            return True
        else:
            print_test_result("Lab Quote Checkout - Nonexistent Request", False, 
                            f"Expected 404, got {response.status_code}")
            return False
            
    except Exception as e:
        print_test_result("Lab Quote Checkout Missing Request", False, f"Exception: {e}")
        return False

def find_lab_request_with_quote(clinic_token):
    """Find a lab request that has a quotedPrice"""
    print("🔍 Finding Lab Request with Quote...")
    
    headers = {"Authorization": f"Bearer {clinic_token}"}
    
    try:
        # Get lab requests
        response = requests.get(f"{BASE_URL}/lab-requests", headers=headers)
        
        if response.status_code == 200:
            requests_data = response.json()
            
            # Look for a request with quotedPrice
            for request in requests_data:
                if request.get('quotedPrice') and request.get('quotedPrice') > 0:
                    print_test_result("Find Lab Request with Quote", True, 
                                    f"Found request {request['id']} with quote €{request['quotedPrice']}")
                    return request['id']
            
            print_test_result("Find Lab Request with Quote", False, 
                            "No lab requests found with quotedPrice")
            return None
        else:
            print_test_result("Find Lab Request with Quote", False, 
                            f"Could not get lab requests: {response.status_code}")
            return None
            
    except Exception as e:
        print_test_result("Find Lab Request with Quote", False, f"Exception: {e}")
        return None

def test_lab_invoices_get(lab_token):
    """Test GET /api/lab/invoices"""
    print("📄 Testing Lab Invoices GET...")
    
    headers = {"Authorization": f"Bearer {lab_token}"}
    
    try:
        # Test GET /api/lab/invoices
        response = requests.get(f"{BASE_URL}/lab/invoices", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_test_result("GET /api/lab/invoices", True, 
                                f"Successfully retrieved {len(data)} lab invoices")
                return True
            else:
                print_test_result("GET /api/lab/invoices", False, 
                                f"Expected array, got: {type(data)}")
                return False
        else:
            print_test_result("GET /api/lab/invoices", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("GET /api/lab/invoices", False, f"Exception: {e}")
        return False

def test_clinic_lab_invoices_get(clinic_token):
    """Test GET /api/clinic/lab-invoices"""
    print("📋 Testing Clinic Lab Invoices GET...")
    
    headers = {"Authorization": f"Bearer {clinic_token}"}
    
    try:
        # Test GET /api/clinic/lab-invoices
        response = requests.get(f"{BASE_URL}/clinic/lab-invoices", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_test_result("GET /api/clinic/lab-invoices", True, 
                                f"Successfully retrieved {len(data)} clinic lab invoices")
                return True
            else:
                print_test_result("GET /api/clinic/lab-invoices", False, 
                                f"Expected array, got: {type(data)}")
                return False
        else:
            print_test_result("GET /api/clinic/lab-invoices", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("GET /api/clinic/lab-invoices", False, f"Exception: {e}")
        return False

def test_auth_required_endpoints():
    """Test that all endpoints require proper authentication"""
    print("🔐 Testing Authentication Requirements...")
    
    endpoints = [
        ("GET", "/lab/stripe-settings"),
        ("POST", "/lab/stripe-settings"),
        ("POST", "/stripe/checkout/lab-quote"),
        ("GET", "/lab/invoices"),
        ("GET", "/clinic/lab-invoices")
    ]
    
    all_passed = True
    
    for method, endpoint in endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}")
            else:
                response = requests.post(f"{BASE_URL}{endpoint}", json={})
            
            if response.status_code == 401:
                print_test_result(f"{method} {endpoint} - No Auth", True, 
                                "Correctly requires authentication")
            else:
                print_test_result(f"{method} {endpoint} - No Auth", False, 
                                f"Expected 401, got {response.status_code}")
                all_passed = False
                
        except Exception as e:
            print_test_result(f"{method} {endpoint} - No Auth", False, f"Exception: {e}")
            all_passed = False
    
    return all_passed

def reset_lab_stripe_settings(lab_token):
    """Reset lab Stripe settings to clean state"""
    print("🧹 Resetting Lab Stripe Settings...")
    
    headers = {"Authorization": f"Bearer {lab_token}"}
    
    # Reset with empty values
    reset_data = {
        "stripePublishableKey": "",
        "stripeSecretKey": ""
    }
    
    try:
        response = requests.post(f"{BASE_URL}/lab/stripe-settings", headers=headers, json=reset_data)
        
        if response.status_code == 200:
            print_test_result("Reset Lab Stripe Settings", True, 
                            "Successfully reset Stripe settings to empty values")
            return True
        else:
            print_test_result("Reset Lab Stripe Settings", False, 
                            f"Failed to reset: {response.status_code}")
            return False
            
    except Exception as e:
        print_test_result("Reset Lab Stripe Settings", False, f"Exception: {e}")
        return False

def main():
    """Run all lab payment API tests"""
    print("🚀 VetBuddy Lab Payment Backend API Testing")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Track test results
    test_results = []
    
    # 1. Test authentication requirements
    result = test_auth_required_endpoints()
    test_results.append(("Authentication Requirements", result))
    
    # 2. Login users
    print("🔐 Logging in users...")
    lab_token, lab_user = login_user(LAB_CREDENTIALS)
    if not lab_token:
        print("❌ Cannot proceed without lab token")
        sys.exit(1)
    
    clinic_token, clinic_user = login_user(CLINIC_CREDENTIALS)
    if not clinic_token:
        print("❌ Cannot proceed without clinic token")
        sys.exit(1)
    
    print_test_result("User Login", True, f"Lab: {lab_user.get('email')}, Clinic: {clinic_user.get('email')}")
    
    # 3. Test lab Stripe settings GET (initial state)
    result, initial_settings = test_lab_stripe_settings_get(lab_token)
    test_results.append(("Lab Stripe Settings GET (Initial)", result))
    
    # 4. Test lab Stripe settings POST
    result = test_lab_stripe_settings_post(lab_token)
    test_results.append(("Lab Stripe Settings POST", result))
    
    # 5. Test lab Stripe settings verification
    result = test_lab_stripe_settings_verification(lab_token)
    test_results.append(("Lab Stripe Settings Verification", result))
    
    # 6. Test lab quote checkout auth errors
    result = test_lab_quote_checkout_auth_errors(clinic_token, lab_token)
    test_results.append(("Lab Quote Checkout Auth Errors", result))
    
    # 7. Test lab quote checkout with missing request
    result = test_lab_quote_checkout_missing_request(clinic_token)
    test_results.append(("Lab Quote Checkout Missing Request", result))
    
    # 8. Try to find a lab request with quote for full checkout test
    lab_request_id = find_lab_request_with_quote(clinic_token)
    if lab_request_id:
        print("ℹ️  Found lab request with quote - could test full checkout flow")
    else:
        print("ℹ️  No lab requests with quotes found - skipping full checkout test")
    
    # 9. Test lab invoices GET
    result = test_lab_invoices_get(lab_token)
    test_results.append(("Lab Invoices GET", result))
    
    # 10. Test clinic lab invoices GET
    result = test_clinic_lab_invoices_get(clinic_token)
    test_results.append(("Clinic Lab Invoices GET", result))
    
    # 11. Reset lab Stripe settings (cleanup)
    result = reset_lab_stripe_settings(lab_token)
    test_results.append(("Reset Lab Stripe Settings", result))
    
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
        print("🎉 All lab payment API tests passed!")
        return 0
    else:
        print(f"⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())