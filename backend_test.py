#!/usr/bin/env python3
"""
VetBuddy Stripe Subscription Integration Testing
Tests all Stripe subscription endpoints as specified in the review request.
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test credentials
CLINIC_CREDENTIALS = {
    "email": "demo@vetbuddy.it",
    "password": "VetBuddy2025!Secure"
}

LAB_CREDENTIALS = {
    "email": "laboratorio1@vetbuddy.it", 
    "password": "Lab2025!"
}

def log_test(test_name, status, details=""):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"[{timestamp}] {status_symbol} {test_name}")
    if details:
        print(f"    {details}")

def make_request(method, endpoint, data=None, headers=None, expected_status=None):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}/{endpoint.lstrip('/')}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=30)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        # Check expected status if provided
        if expected_status and response.status_code != expected_status:
            return {
                "success": False,
                "status_code": response.status_code,
                "error": f"Expected {expected_status}, got {response.status_code}",
                "response": response.text[:500]
            }
            
        # Try to parse JSON response
        try:
            json_data = response.json()
        except:
            json_data = {"raw_response": response.text}
            
        return {
            "success": response.status_code < 400,
            "status_code": response.status_code,
            "data": json_data,
            "headers": dict(response.headers)
        }
        
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": str(e),
            "status_code": 0
        }

def authenticate_user(credentials, user_type):
    """Authenticate user and return token"""
    log_test(f"Authenticating {user_type}", "INFO", f"Email: {credentials['email']}")
    
    result = make_request("POST", "/auth/login", credentials)
    
    if not result["success"]:
        log_test(f"{user_type} Authentication", "FAIL", f"Login failed: {result.get('error', 'Unknown error')}")
        return None
        
    if "token" not in result["data"]:
        log_test(f"{user_type} Authentication", "FAIL", "No token in response")
        return None
        
    log_test(f"{user_type} Authentication", "PASS", f"Token received")
    return result["data"]["token"]

def test_stripe_plans():
    """Test GET /api/stripe/plans (No auth needed)"""
    log_test("Testing Stripe Plans Endpoint", "INFO")
    
    result = make_request("GET", "/stripe/plans")
    
    if not result["success"]:
        log_test("GET /api/stripe/plans", "FAIL", f"Request failed: {result.get('error', 'Unknown error')}")
        return False
        
    plans = result["data"]
    
    # Check if all required plans exist
    required_plans = ["starter", "pro", "lab_partner", "enterprise"]
    expected_prices = {"starter": 29.00, "pro": 59.00, "lab_partner": 39.00, "enterprise": 0}
    
    for plan_id in required_plans:
        if plan_id not in plans:
            log_test("GET /api/stripe/plans", "FAIL", f"Missing plan: {plan_id}")
            return False
            
        plan = plans[plan_id]
        expected_price = expected_prices[plan_id]
        
        if plan.get("price") != expected_price:
            log_test("GET /api/stripe/plans", "FAIL", f"Plan {plan_id} price mismatch: expected €{expected_price}, got €{plan.get('price')}")
            return False
            
        # Check required fields
        required_fields = ["name", "description", "features"]
        for field in required_fields:
            if field not in plan:
                log_test("GET /api/stripe/plans", "FAIL", f"Plan {plan_id} missing field: {field}")
                return False
    
    log_test("GET /api/stripe/plans", "PASS", f"All 4 plans found with correct prices: starter (€29), pro (€59), lab_partner (€39), enterprise (€0)")
    return True

def test_subscription_status(token, user_type):
    """Test GET /api/stripe/subscription-status (Auth required)"""
    log_test(f"Testing Subscription Status - {user_type}", "INFO")
    
    headers = {"Authorization": f"Bearer {token}"}
    result = make_request("GET", "/stripe/subscription-status", headers=headers)
    
    if not result["success"]:
        log_test(f"GET /api/stripe/subscription-status ({user_type})", "FAIL", f"Request failed: {result.get('error', 'Unknown error')}")
        return False
        
    status = result["data"]
    
    # Check required fields
    required_fields = ["hasSubscription", "plan", "status", "trialEnd", "currentPeriodEnd"]
    for field in required_fields:
        if field not in status:
            log_test(f"GET /api/stripe/subscription-status ({user_type})", "FAIL", f"Missing field: {field}")
            return False
    
    log_test(f"GET /api/stripe/subscription-status ({user_type})", "PASS", f"Status: {status}")
    return True

def test_subscription_status_unauthorized():
    """Test GET /api/stripe/subscription-status without auth"""
    log_test("Testing Subscription Status - Unauthorized", "INFO")
    
    result = make_request("GET", "/stripe/subscription-status", expected_status=401)
    
    if result["status_code"] != 401:
        log_test("GET /api/stripe/subscription-status (No Auth)", "FAIL", f"Expected 401, got {result['status_code']}")
        return False
        
    log_test("GET /api/stripe/subscription-status (No Auth)", "PASS", "Correctly returns 401")
    return True

def test_checkout_subscription_valid(token, user_type, plan_id, should_succeed=True):
    """Test POST /api/stripe/checkout/subscription with valid data"""
    test_name = f"Checkout Subscription - {user_type} - {plan_id}"
    log_test(f"Testing {test_name}", "INFO")
    
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "planId": plan_id,
        "originUrl": "https://clinic-report-review.preview.emergentagent.com"
    }
    
    result = make_request("POST", "/stripe/checkout/subscription", data, headers)
    
    if should_succeed:
        if not result["success"]:
            log_test(f"POST /api/stripe/checkout/subscription ({test_name})", "FAIL", f"Request failed: {result.get('error', 'Unknown error')}")
            return False
            
        response_data = result["data"]
        
        # Check required fields
        if "url" not in response_data or "sessionId" not in response_data:
            log_test(f"POST /api/stripe/checkout/subscription ({test_name})", "FAIL", "Missing url or sessionId in response")
            return False
            
        # Validate Stripe URL
        if not response_data["url"].startswith("https://checkout.stripe.com"):
            log_test(f"POST /api/stripe/checkout/subscription ({test_name})", "FAIL", f"Invalid Stripe URL: {response_data['url']}")
            return False
            
        log_test(f"POST /api/stripe/checkout/subscription ({test_name})", "PASS", f"Valid Stripe checkout URL generated: {response_data['url'][:50]}...")
        return response_data["sessionId"]
    else:
        if result["success"]:
            log_test(f"POST /api/stripe/checkout/subscription ({test_name})", "FAIL", "Expected failure but request succeeded")
            return False
            
        if result["status_code"] != 400:
            log_test(f"POST /api/stripe/checkout/subscription ({test_name})", "FAIL", f"Expected 400, got {result['status_code']}")
            return False
            
        log_test(f"POST /api/stripe/checkout/subscription ({test_name})", "PASS", f"Correctly rejected: {result['data'].get('error', 'Unknown error')}")
        return True

def test_checkout_subscription_unauthorized():
    """Test POST /api/stripe/checkout/subscription without auth"""
    log_test("Testing Checkout Subscription - Unauthorized", "INFO")
    
    data = {
        "planId": "starter",
        "originUrl": "https://clinic-report-review.preview.emergentagent.com"
    }
    
    result = make_request("POST", "/stripe/checkout/subscription", data, expected_status=401)
    
    if result["status_code"] != 401:
        log_test("POST /api/stripe/checkout/subscription (No Auth)", "FAIL", f"Expected 401, got {result['status_code']}")
        return False
        
    log_test("POST /api/stripe/checkout/subscription (No Auth)", "PASS", "Correctly returns 401")
    return True

def test_stripe_webhook():
    """Test POST /api/webhook/stripe (No auth needed)"""
    log_test("Testing Stripe Webhook", "INFO")
    
    # Mock checkout.session.completed event
    webhook_data = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_123",
                "customer": "cus_test_123",
                "payment_status": "paid",
                "metadata": {
                    "userId": "some_id",
                    "userRole": "clinic",
                    "planId": "starter",
                    "type": "subscription"
                },
                "subscription": "sub_test_123"
            }
        }
    }
    
    result = make_request("POST", "/webhook/stripe", webhook_data)
    
    if not result["success"]:
        log_test("POST /api/webhook/stripe", "FAIL", f"Request failed: {result.get('error', 'Unknown error')}")
        return False
        
    response_data = result["data"]
    
    if response_data.get("received") != True:
        log_test("POST /api/webhook/stripe", "FAIL", f"Expected received: true, got: {response_data}")
        return False
        
    log_test("POST /api/webhook/stripe", "PASS", "Webhook processed successfully")
    return True

def test_checkout_status():
    """Test GET /api/stripe/checkout/status/{sessionId} (No auth needed)"""
    log_test("Testing Checkout Status", "INFO")
    
    # Test with non-existent session ID
    fake_session_id = "cs_test_nonexistent_12345"
    result = make_request("GET", f"/stripe/checkout/status/{fake_session_id}")
    
    # Should return error since session doesn't exist in Stripe
    if result["success"]:
        log_test("GET /api/stripe/checkout/status/{sessionId}", "FAIL", "Expected error for non-existent session but got success")
        return False
        
    # Should be 400 or 500 error
    if result["status_code"] not in [400, 500]:
        log_test("GET /api/stripe/checkout/status/{sessionId}", "FAIL", f"Expected 400/500 error, got {result['status_code']}")
        return False
        
    log_test("GET /api/stripe/checkout/status/{sessionId}", "PASS", f"Correctly returns error for non-existent session: {result['status_code']}")
    return True

def main():
    """Main test execution"""
    print("=" * 80)
    print("VetBuddy Stripe Subscription Integration Testing")
    print("=" * 80)
    
    total_tests = 0
    passed_tests = 0
    
    # Test 1: GET /api/stripe/plans (No auth needed)
    total_tests += 1
    if test_stripe_plans():
        passed_tests += 1
    
    # Authenticate users
    clinic_token = authenticate_user(CLINIC_CREDENTIALS, "Clinic")
    lab_token = authenticate_user(LAB_CREDENTIALS, "Lab")
    
    if not clinic_token:
        log_test("CRITICAL ERROR", "FAIL", "Cannot authenticate clinic user - aborting tests")
        return
        
    if not lab_token:
        log_test("CRITICAL ERROR", "FAIL", "Cannot authenticate lab user - aborting tests")
        return
    
    # Test 2: GET /api/stripe/subscription-status (Auth required)
    total_tests += 2
    if test_subscription_status(clinic_token, "Clinic"):
        passed_tests += 1
    if test_subscription_status(lab_token, "Lab"):
        passed_tests += 1
    
    # Test 3: GET /api/stripe/subscription-status (No auth)
    total_tests += 1
    if test_subscription_status_unauthorized():
        passed_tests += 1
    
    # Test 4: POST /api/stripe/checkout/subscription (Valid cases)
    total_tests += 4
    
    # Clinic with starter plan (should succeed)
    session_id = test_checkout_subscription_valid(clinic_token, "Clinic", "starter", True)
    if session_id:
        passed_tests += 1
    
    # Clinic with pro plan (should succeed)
    if test_checkout_subscription_valid(clinic_token, "Clinic", "pro", True):
        passed_tests += 1
    
    # Lab with lab_partner plan (should succeed)
    if test_checkout_subscription_valid(lab_token, "Lab", "lab_partner", True):
        passed_tests += 1
    
    # Test 5: POST /api/stripe/checkout/subscription (Invalid cases)
    total_tests += 4
    
    # Clinic with lab_partner plan (should fail)
    if test_checkout_subscription_valid(clinic_token, "Clinic", "lab_partner", False):
        passed_tests += 1
    
    # Lab with starter plan (should fail)
    if test_checkout_subscription_valid(lab_token, "Lab", "starter", False):
        passed_tests += 1
    
    # Enterprise plan (price is 0, should fail)
    if test_checkout_subscription_valid(clinic_token, "Clinic", "enterprise", False):
        passed_tests += 1
    
    # Test 6: POST /api/stripe/checkout/subscription (No auth)
    if test_checkout_subscription_unauthorized():
        passed_tests += 1
    
    # Test 7: POST /api/webhook/stripe (No auth needed)
    total_tests += 1
    if test_stripe_webhook():
        passed_tests += 1
    
    # Test 8: GET /api/stripe/checkout/status/{sessionId} (No auth needed)
    total_tests += 1
    if test_checkout_status():
        passed_tests += 1
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! Stripe subscription integration is working correctly.")
        return True
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed. Please review the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)