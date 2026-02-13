#!/usr/bin/env python3
"""
VetBuddy Payment System & Chat API Backend Test - Clean Version
Testing Payment APIs and Virtual Assistant Chat functionality
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://clinic-zip-export.preview.emergentagent.com/api"

# Test appointment ID from review request
TEST_APPOINTMENT_ID = "ec9673c0-9b83-4160-a381-eb9174604700"

def log_test(message, is_success=None):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status = ""
    if is_success is True:
        status = "✅ PASS"
    elif is_success is False:
        status = "❌ FAIL"
    print(f"[{timestamp}] {status} {message}")

def test_payment_create_checkout():
    """Test 1: POST /api/payments/appointment - Create Stripe checkout session"""
    log_test("=" * 60)
    log_test("TEST 1: POST /api/payments/appointment - Create Stripe Checkout")
    log_test("=" * 60)
    
    try:
        test_data = {
            "appointmentId": TEST_APPOINTMENT_ID,
            "originUrl": "https://clinic-zip-export.preview.emergentagent.com"
        }
        
        response = requests.post(f"{BASE_URL}/payments/appointment", json=test_data, timeout=30)
        log_test(f"POST payments/appointment -> Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check required fields in response
            required_fields = ['url', 'sessionId', 'amount', 'description']
            for field in required_fields:
                if field not in data:
                    log_test(f"Missing required field: {field}", False)
                    return False
            
            # Verify Stripe URL format
            if not data['url'].startswith('https://checkout.stripe.com/'):
                log_test(f"Invalid Stripe checkout URL: {data['url']}", False)
                return False
            
            # Verify session ID format
            if not data['sessionId'].startswith('cs_'):
                log_test(f"Invalid Stripe session ID format: {data['sessionId']}", False)
                return False
            
            # Verify amount is positive
            if data['amount'] <= 0:
                log_test(f"Invalid amount: {data['amount']}", False)
                return False
            
            log_test(f"✅ Stripe checkout created successfully", True)
            log_test(f"Session ID: {data['sessionId']}")
            log_test(f"Amount: €{data['amount']}")
            log_test(f"Description: {data['description'][:50]}...")
            log_test(f"Checkout URL: {data['url'][:50]}...")
            return True
        else:
            log_test(f"Payment creation failed: {response.status_code}", False)
            log_test(f"Response: {response.text}")
            return False
            
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_payment_missing_appointment():
    """Test 2: POST /api/payments/appointment - Test error handling for missing appointmentId"""
    log_test("=" * 60)
    log_test("TEST 2: POST /api/payments/appointment - Missing AppointmentId")
    log_test("=" * 60)
    
    try:
        test_data = {
            "originUrl": "https://clinic-zip-export.preview.emergentagent.com"
        }
        
        response = requests.post(f"{BASE_URL}/payments/appointment", json=test_data, timeout=30)
        log_test(f"POST payments/appointment -> Status: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data:
                log_test(f"✅ Correctly returned error for missing appointmentId: {data['error']}", True)
                return True
            else:
                log_test("Expected error field in response", False)
                return False
        else:
            log_test(f"Expected status 400, got {response.status_code}", False)
            return False
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_payment_non_existent_appointment():
    """Test 3: POST /api/payments/appointment - Test error handling for non-existent appointment"""
    log_test("=" * 60)
    log_test("TEST 3: POST /api/payments/appointment - Non-existent Appointment")
    log_test("=" * 60)
    
    try:
        fake_id = "00000000-0000-0000-0000-000000000000"
        test_data = {
            "appointmentId": fake_id,
            "originUrl": "https://clinic-zip-export.preview.emergentagent.com"
        }
        
        response = requests.post(f"{BASE_URL}/payments/appointment", json=test_data, timeout=30)
        log_test(f"POST payments/appointment -> Status: {response.status_code}")
        
        if response.status_code == 404:
            data = response.json()
            if 'error' in data:
                log_test(f"✅ Correctly returned error for non-existent appointment: {data['error']}", True)
                return True
            else:
                log_test("Expected error field in response", False)
                return False
        else:
            log_test(f"Expected status 404, got {response.status_code}", False)
            return False
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_payment_status_get():
    """Test 4: GET /api/payments/appointment - Get payment status"""
    log_test("=" * 60)
    log_test("TEST 4: GET /api/payments/appointment - Get Payment Status")
    log_test("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/payments/appointment?appointmentId={TEST_APPOINTMENT_ID}", timeout=30)
        log_test(f"GET payments/appointment -> Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check required fields
            required_fields = ['appointmentId', 'paymentStatus']
            for field in required_fields:
                if field not in data:
                    log_test(f"Missing required field: {field}", False)
                    return False
            
            log_test(f"✅ Payment status retrieved successfully", True)
            log_test(f"Appointment ID: {data['appointmentId']}")
            log_test(f"Payment Status: {data['paymentStatus']}")
            log_test(f"Paid At: {data.get('paidAt', 'Not paid')}")
            log_test(f"Paid Amount: €{data.get('paidAmount', 0)}")
            return True
            
        elif response.status_code == 404:
            data = response.json()
            if 'error' in data:
                log_test(f"✅ Correctly returned 404 for non-existent appointment: {data['error']}", True)
                return True
            else:
                log_test("Expected error field in 404 response", False)
                return False
        else:
            log_test(f"Unexpected status code: {response.status_code}", False)
            log_test(f"Response: {response.text}")
            return False
            
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_payment_status_missing_id():
    """Test 5: GET /api/payments/appointment - Test missing appointmentId parameter"""
    log_test("=" * 60)
    log_test("TEST 5: GET /api/payments/appointment - Missing AppointmentId")
    log_test("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/payments/appointment", timeout=30)
        log_test(f"GET payments/appointment -> Status: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data:
                log_test(f"✅ Correctly returned error for missing appointmentId parameter: {data['error']}", True)
                return True
            else:
                log_test("Expected error field in response", False)
                return False
        else:
            log_test(f"Expected status 400, got {response.status_code}", False)
            return False
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_chat_api():
    """Test 6: POST /api/chat - Test virtual assistant chat"""
    log_test("=" * 60)
    log_test("TEST 6: POST /api/chat - Virtual Assistant Chat")
    log_test("=" * 60)
    
    try:
        chat_data = {
            "messages": [
                {
                    "role": "user",
                    "content": "Ciao! Puoi parlarmi di VetBuddy?"
                }
            ],
            "sessionId": "test_session_" + str(int(time.time()))
        }
        
        response = requests.post(f"{BASE_URL}/chat", json=chat_data, timeout=30)
        log_test(f"POST chat -> Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check required fields
            required_fields = ['success', 'message', 'sessionId']
            for field in required_fields:
                if field not in data:
                    log_test(f"Missing required field: {field}", False)
                    return False
            
            # Check success status
            if not data['success']:
                log_test(f"Chat API returned success=false: {data.get('error', 'No error message')}", False)
                return False
            
            # Check message content
            message = data['message']
            if len(message) < 50:
                log_test(f"Response message too short: {len(message)} characters", False)
                return False
            
            # Basic check for Italian content and VetBuddy mention
            message_lower = message.lower()
            if 'vetbuddy' not in message_lower:
                log_test("Response doesn't mention VetBuddy", False)
                log_test(f"Response preview: {message[:100]}...")
                return False
            
            log_test(f"✅ Chat API working correctly", True)
            log_test(f"Session ID: {data['sessionId']}")
            log_test(f"Response length: {len(message)} characters")
            log_test(f"Response preview: {message[:150]}...")
            return True
        else:
            log_test(f"Expected status 200, got {response.status_code}", False)
            log_test(f"Response: {response.text}")
            return False
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_chat_invalid_messages():
    """Test 7: POST /api/chat - Test error handling for invalid messages"""
    log_test("=" * 60)
    log_test("TEST 7: POST /api/chat - Invalid Messages Format")
    log_test("=" * 60)
    
    try:
        chat_data = {
            "messages": "invalid_format",
            "sessionId": "test_session"
        }
        
        response = requests.post(f"{BASE_URL}/chat", json=chat_data, timeout=30)
        log_test(f"POST chat -> Status: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data:
                log_test(f"✅ Correctly returned error for invalid messages format: {data['error']}", True)
                return True
            else:
                log_test("Expected error field in response", False)
                return False
        else:
            log_test(f"Expected status 400, got {response.status_code}", False)
            return False
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_chat_multiple_messages():
    """Test 8: POST /api/chat - Test with conversation context"""
    log_test("=" * 60)
    log_test("TEST 8: POST /api/chat - Multiple Messages Conversation")
    log_test("=" * 60)
    
    try:
        chat_data = {
            "messages": [
                {
                    "role": "user",
                    "content": "Cosa offre VetBuddy?"
                },
                {
                    "role": "assistant",
                    "content": "VetBuddy è una piattaforma gestionale per cliniche veterinarie..."
                },
                {
                    "role": "user",
                    "content": "Quanto costa?"
                }
            ],
            "sessionId": "test_conversation_" + str(int(time.time()))
        }
        
        response = requests.post(f"{BASE_URL}/chat", json=chat_data, timeout=30)
        log_test(f"POST chat -> Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check required fields
            if not data.get('success') or 'message' not in data:
                log_test("Invalid response format", False)
                return False
            
            message = data['message']
            message_lower = message.lower()
            
            # Should mention pricing information
            pricing_terms = ['prezzo', 'costo', '€', 'euro', 'gratuito', 'piano']
            has_pricing_info = any(term in message_lower for term in pricing_terms)
            
            if not has_pricing_info:
                log_test("Response doesn't seem to contain pricing information", False)
                log_test(f"Response: {message}")
                return False
            
            log_test(f"✅ Conversation context handled correctly", True)
            log_test(f"Response contains pricing info: {message[:100]}...")
            return True
        else:
            log_test(f"Expected status 200, got {response.status_code}", False)
            log_test(f"Response: {response.text}")
            return False
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def main():
    """Run all payment system and chat API tests"""
    log_test("🐾 VetBuddy Payment System & Chat API Backend Test Suite")
    log_test("=" * 60)
    log_test(f"Base URL: {BASE_URL}")
    log_test(f"Testing Payment APIs and Virtual Assistant Chat")
    log_test("=" * 60)
    
    tests = [
        ("Payment Checkout Creation", test_payment_create_checkout),
        ("Payment Missing Appointment Error", test_payment_missing_appointment),
        ("Payment Non-existent Appointment Error", test_payment_non_existent_appointment),
        ("Payment Status GET", test_payment_status_get),
        ("Payment Status Missing ID", test_payment_status_missing_id),
        ("Chat API Basic Functionality", test_chat_api),
        ("Chat Invalid Messages Error", test_chat_invalid_messages),
        ("Chat Conversation Context", test_chat_multiple_messages),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if result:
                passed += 1
        except Exception as e:
            log_test(f"Test {test_name} crashed: {str(e)}", False)
        
        time.sleep(1)  # Brief pause between tests
    
    log_test("=" * 60)
    log_test("🔍 PAYMENT SYSTEM & CHAT API TEST RESULTS SUMMARY")
    log_test("=" * 60)
    log_test(f"Tests Passed: {passed}/{total}")
    
    if passed == total:
        log_test("✅ ALL PAYMENT & CHAT TESTS PASSED", True)
    else:
        log_test(f"❌ {total - passed} TESTS FAILED", False)
    
    log_test("=" * 60)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)