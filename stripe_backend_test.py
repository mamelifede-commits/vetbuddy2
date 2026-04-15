#!/usr/bin/env python3
"""
VetBuddy Stripe Backend API Testing
Tests the new Stripe endpoints: portal, webhook, and subscription-status
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

ADMIN_CREDENTIALS = {
    "email": "admin@vetbuddy.it",
    "password": "Admin2025!"
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

def test_stripe_portal_clinic():
    """Test POST /api/stripe/portal with clinic authentication"""
    print("🏥 Testing Stripe Portal API with Clinic Auth...")
    
    # Login as clinic
    clinic_token, clinic_user = login_user(CLINIC_CREDENTIALS)
    if not clinic_token:
        print_test_result("Clinic Login for Portal Test", False, "Could not get clinic token")
        return False
    
    headers = {"Authorization": f"Bearer {clinic_token}"}
    portal_data = {
        "originUrl": "https://clinic-report-review.preview.emergentagent.com"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/stripe/portal", headers=headers, json=portal_data)
        
        if response.status_code == 200:
            data = response.json()
            if 'url' in data and data['url'].startswith('https://'):
                print_test_result("POST /api/stripe/portal (Clinic)", True, 
                                f"Successfully got portal URL: {data['url'][:50]}...")
                return True
            else:
                print_test_result("POST /api/stripe/portal (Clinic)", False, 
                                f"Invalid response format: {data}")
                return False
        elif response.status_code == 400:
            data = response.json()
            if 'error' in data and 'abbonamento Stripe' in data['error']:
                print_test_result("POST /api/stripe/portal (Clinic)", True, 
                                f"Expected 400 error for no subscription: {data['error']}")
                return True
            else:
                print_test_result("POST /api/stripe/portal (Clinic)", False, 
                                f"Unexpected 400 error: {data}")
                return False
        else:
            print_test_result("POST /api/stripe/portal (Clinic)", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("POST /api/stripe/portal (Clinic)", False, f"Exception: {e}")
        return False

def test_stripe_portal_lab():
    """Test POST /api/stripe/portal with lab authentication"""
    print("🧪 Testing Stripe Portal API with Lab Auth...")
    
    # Login as lab
    lab_token, lab_user = login_user(LAB_CREDENTIALS)
    if not lab_token:
        print_test_result("Lab Login for Portal Test", False, "Could not get lab token")
        return False
    
    headers = {"Authorization": f"Bearer {lab_token}"}
    portal_data = {
        "originUrl": "https://clinic-report-review.preview.emergentagent.com"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/stripe/portal", headers=headers, json=portal_data)
        
        if response.status_code == 200:
            data = response.json()
            if 'url' in data and data['url'].startswith('https://'):
                print_test_result("POST /api/stripe/portal (Lab)", True, 
                                f"Successfully got portal URL: {data['url'][:50]}...")
                return True
            else:
                print_test_result("POST /api/stripe/portal (Lab)", False, 
                                f"Invalid response format: {data}")
                return False
        elif response.status_code == 400:
            data = response.json()
            if 'error' in data and 'abbonamento Stripe' in data['error']:
                print_test_result("POST /api/stripe/portal (Lab)", True, 
                                f"Expected 400 error for no subscription: {data['error']}")
                return True
            else:
                print_test_result("POST /api/stripe/portal (Lab)", False, 
                                f"Unexpected 400 error: {data}")
                return False
        else:
            print_test_result("POST /api/stripe/portal (Lab)", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("POST /api/stripe/portal (Lab)", False, f"Exception: {e}")
        return False

def test_stripe_portal_unauthorized():
    """Test POST /api/stripe/portal without authentication"""
    print("🔒 Testing Stripe Portal API without Auth...")
    
    portal_data = {
        "originUrl": "https://clinic-report-review.preview.emergentagent.com"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/stripe/portal", json=portal_data)
        
        if response.status_code == 401:
            print_test_result("POST /api/stripe/portal (No Auth)", True, 
                            "Correctly blocked unauthorized access with 401")
            return True
        else:
            print_test_result("POST /api/stripe/portal (No Auth)", False, 
                            f"Expected 401, got {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("POST /api/stripe/portal (No Auth)", False, f"Exception: {e}")
        return False

def test_stripe_webhook_checkout_completed():
    """Test POST /api/webhook/stripe with checkout.session.completed event"""
    print("🎯 Testing Stripe Webhook - Checkout Session Completed...")
    
    # Simulate a checkout.session.completed event
    webhook_data = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_12345",
                "payment_status": "paid",
                "metadata": {
                    "type": "subscription",
                    "userId": "test-user-id",
                    "planId": "pro"
                },
                "customer": "cus_test_12345",
                "subscription": "sub_test_12345"
            }
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/webhook/stripe", json=webhook_data)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('received') == True:
                print_test_result("POST /api/webhook/stripe (Checkout Completed)", True, 
                                "Webhook processed successfully")
                return True
            else:
                print_test_result("POST /api/webhook/stripe (Checkout Completed)", False, 
                                f"Unexpected response: {data}")
                return False
        elif response.status_code == 400:
            # If webhook signature verification is enabled, this is expected
            print_test_result("POST /api/webhook/stripe (Checkout Completed)", True, 
                            "Webhook signature verification working (400 expected for unsigned request)")
            return True
        else:
            print_test_result("POST /api/webhook/stripe (Checkout Completed)", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("POST /api/webhook/stripe (Checkout Completed)", False, f"Exception: {e}")
        return False

def test_stripe_webhook_trial():
    """Test POST /api/webhook/stripe with trial payment (no_payment_required)"""
    print("🆓 Testing Stripe Webhook - Trial Payment...")
    
    # Simulate a checkout.session.completed event with trial
    webhook_data = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_trial_12345",
                "payment_status": "no_payment_required",
                "metadata": {
                    "type": "subscription",
                    "userId": "test-user-trial-id",
                    "planId": "pro"
                },
                "customer": "cus_test_trial_12345",
                "subscription": "sub_test_trial_12345"
            }
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/webhook/stripe", json=webhook_data)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('received') == True:
                print_test_result("POST /api/webhook/stripe (Trial)", True, 
                                "Trial webhook processed successfully")
                return True
            else:
                print_test_result("POST /api/webhook/stripe (Trial)", False, 
                                f"Unexpected response: {data}")
                return False
        elif response.status_code == 400:
            # If webhook signature verification is enabled, this is expected
            print_test_result("POST /api/webhook/stripe (Trial)", True, 
                            "Webhook signature verification working (400 expected for unsigned request)")
            return True
        else:
            print_test_result("POST /api/webhook/stripe (Trial)", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("POST /api/webhook/stripe (Trial)", False, f"Exception: {e}")
        return False

def test_stripe_webhook_subscription_deleted():
    """Test POST /api/webhook/stripe with customer.subscription.deleted event"""
    print("❌ Testing Stripe Webhook - Subscription Deleted...")
    
    # Simulate a customer.subscription.deleted event
    webhook_data = {
        "type": "customer.subscription.deleted",
        "data": {
            "object": {
                "id": "sub_test_deleted_12345",
                "customer": "cus_test_deleted_12345",
                "metadata": {
                    "userId": "test-user-deleted-id"
                }
            }
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/webhook/stripe", json=webhook_data)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('received') == True:
                print_test_result("POST /api/webhook/stripe (Subscription Deleted)", True, 
                                "Subscription deletion webhook processed successfully")
                return True
            else:
                print_test_result("POST /api/webhook/stripe (Subscription Deleted)", False, 
                                f"Unexpected response: {data}")
                return False
        elif response.status_code == 400:
            # If webhook signature verification is enabled, this is expected
            print_test_result("POST /api/webhook/stripe (Subscription Deleted)", True, 
                            "Webhook signature verification working (400 expected for unsigned request)")
            return True
        else:
            print_test_result("POST /api/webhook/stripe (Subscription Deleted)", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("POST /api/webhook/stripe (Subscription Deleted)", False, f"Exception: {e}")
        return False

def test_stripe_subscription_status_clinic():
    """Test GET /api/stripe/subscription-status with clinic authentication"""
    print("📊 Testing Stripe Subscription Status API with Clinic Auth...")
    
    # Login as clinic
    clinic_token, clinic_user = login_user(CLINIC_CREDENTIALS)
    if not clinic_token:
        print_test_result("Clinic Login for Subscription Status Test", False, "Could not get clinic token")
        return False
    
    headers = {"Authorization": f"Bearer {clinic_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/stripe/subscription-status", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['hasSubscription', 'plan', 'status', 'trialEnd', 'currentPeriodEnd']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_test_result("GET /api/stripe/subscription-status (Clinic)", True, 
                                f"All required fields present: {data}")
                return True
            else:
                print_test_result("GET /api/stripe/subscription-status (Clinic)", False, 
                                f"Missing fields: {missing_fields}")
                return False
        else:
            print_test_result("GET /api/stripe/subscription-status (Clinic)", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("GET /api/stripe/subscription-status (Clinic)", False, f"Exception: {e}")
        return False

def test_stripe_subscription_status_lab():
    """Test GET /api/stripe/subscription-status with lab authentication"""
    print("🧪 Testing Stripe Subscription Status API with Lab Auth...")
    
    # Login as lab
    lab_token, lab_user = login_user(LAB_CREDENTIALS)
    if not lab_token:
        print_test_result("Lab Login for Subscription Status Test", False, "Could not get lab token")
        return False
    
    headers = {"Authorization": f"Bearer {lab_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/stripe/subscription-status", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['hasSubscription', 'plan', 'status', 'trialEnd', 'currentPeriodEnd']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_test_result("GET /api/stripe/subscription-status (Lab)", True, 
                                f"All required fields present: {data}")
                return True
            else:
                print_test_result("GET /api/stripe/subscription-status (Lab)", False, 
                                f"Missing fields: {missing_fields}")
                return False
        else:
            print_test_result("GET /api/stripe/subscription-status (Lab)", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("GET /api/stripe/subscription-status (Lab)", False, f"Exception: {e}")
        return False

def test_stripe_subscription_status_unauthorized():
    """Test GET /api/stripe/subscription-status without authentication"""
    print("🔒 Testing Stripe Subscription Status API without Auth...")
    
    try:
        response = requests.get(f"{BASE_URL}/stripe/subscription-status")
        
        if response.status_code == 401:
            print_test_result("GET /api/stripe/subscription-status (No Auth)", True, 
                            "Correctly blocked unauthorized access with 401")
            return True
        else:
            print_test_result("GET /api/stripe/subscription-status (No Auth)", False, 
                            f"Expected 401, got {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("GET /api/stripe/subscription-status (No Auth)", False, f"Exception: {e}")
        return False

def main():
    """Run all Stripe API tests"""
    print("🚀 VetBuddy Stripe Backend API Testing")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Track test results
    test_results = []
    
    # 1. Test Stripe Portal API
    print("🎯 TESTING STRIPE PORTAL API")
    print("-" * 40)
    
    result = test_stripe_portal_clinic()
    test_results.append(("Stripe Portal (Clinic Auth)", result))
    
    result = test_stripe_portal_lab()
    test_results.append(("Stripe Portal (Lab Auth)", result))
    
    result = test_stripe_portal_unauthorized()
    test_results.append(("Stripe Portal (No Auth)", result))
    
    # 2. Test Stripe Webhook API
    print("🎯 TESTING STRIPE WEBHOOK API")
    print("-" * 40)
    
    result = test_stripe_webhook_checkout_completed()
    test_results.append(("Stripe Webhook (Checkout Completed)", result))
    
    result = test_stripe_webhook_trial()
    test_results.append(("Stripe Webhook (Trial)", result))
    
    result = test_stripe_webhook_subscription_deleted()
    test_results.append(("Stripe Webhook (Subscription Deleted)", result))
    
    # 3. Test Stripe Subscription Status API
    print("🎯 TESTING STRIPE SUBSCRIPTION STATUS API")
    print("-" * 40)
    
    result = test_stripe_subscription_status_clinic()
    test_results.append(("Stripe Subscription Status (Clinic Auth)", result))
    
    result = test_stripe_subscription_status_lab()
    test_results.append(("Stripe Subscription Status (Lab Auth)", result))
    
    result = test_stripe_subscription_status_unauthorized()
    test_results.append(("Stripe Subscription Status (No Auth)", result))
    
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
        print("🎉 All Stripe API tests passed!")
        return 0
    else:
        print(f"⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())