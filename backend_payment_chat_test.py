#!/usr/bin/env python3
"""
VetBuddy Payment System & Chat API Backend Test
Testing Payment APIs and Virtual Assistant Chat functionality
"""

import requests
import json
import os
import time
from datetime import datetime

# Configuration
NEXT_PUBLIC_BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://dashboard-tutorials.preview.emergentagent.com')
BASE_URL = f"{NEXT_PUBLIC_BASE_URL}/api"

# Credentials from review request
OWNER_EMAIL = "proprietario.demo@vetbuddy.it"
OWNER_PASSWORD = "demo123"
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "password123"

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

def make_request(method, endpoint, headers=None, data=None, json_data=None, auth_token=None):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}/{endpoint}" if not endpoint.startswith('http') else endpoint
    
    default_headers = {}
    if auth_token:
        default_headers['Authorization'] = f'Bearer {auth_token}'
    
    if headers:
        default_headers.update(headers)
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=default_headers, timeout=30)
        elif method.upper() == 'POST':
            if json_data:
                default_headers['Content-Type'] = 'application/json'
                response = requests.post(url, headers=default_headers, json=json_data, timeout=30)
            else:
                response = requests.post(url, headers=default_headers, data=data, timeout=30)
        
        log_test(f"{method} {endpoint} -> Status: {response.status_code}")
        return response
    except requests.exceptions.RequestException as e:
        log_test(f"Request error for {method} {endpoint}: {str(e)}", False)
        return None
    except Exception as e:
        log_test(f"Unexpected error for {method} {endpoint}: {str(e)}", False)
        return None

def login_user(email, password):
    """Login user and return auth token"""
    log_test(f"Attempting login for: {email}")
    
    login_data = {
        "email": email,
        "password": password
    }
    
    response = make_request('POST', 'auth/login', json_data=login_data)
    
    if not response or response.status_code != 200:
        log_test(f"Login failed for {email}: {response.status_code if response else 'No response'}", False)
        if response:
            log_test(f"Response: {response.text}")
        return None
    
    data = response.json()
    if 'token' not in data:
        log_test(f"No token in login response for {email}", False)
        return None
    
    log_test(f"Login successful for {email}", True)
    return data['token']

def create_test_appointment(auth_token):
    """Create a test appointment for payment testing"""
    log_test("Creating test appointment for payment testing")
    
    # First get current user to get clinic/owner info
    user_response = make_request('GET', 'auth/me', auth_token=auth_token)
    if not user_response or user_response.status_code != 200:
        log_test("Failed to get user info for appointment creation", False)
        return None
    
    user = user_response.json()
    
    # Create appointment data
    appointment_data = {
        "reason": "Visita di controllo per test pagamento",
        "date": "2026-02-15",
        "time": "14:00",
        "petId": "test-pet-id",
        "price": 65.00,
        "duration": 30
    }
    
    # Add appropriate IDs based on user role
    if user.get('role') == 'clinic':
        appointment_data['clinicId'] = user.get('id')
        appointment_data['ownerId'] = 'test-owner-id'
    else:
        appointment_data['ownerId'] = user.get('id')
        appointment_data['clinicId'] = 'test-clinic-id'
    
    response = make_request('POST', 'appointments', json_data=appointment_data, auth_token=auth_token)
    
    if not response or response.status_code != 201:
        log_test(f"Failed to create test appointment: {response.status_code if response else 'No response'}", False)
        return None
    
    appointment = response.json()
    appointment_id = appointment.get('id') or appointment.get('appointmentId')
    log_test(f"Created test appointment: {appointment_id}", True)
    return appointment_id

def test_payment_create_checkout():
    """Test 1: POST /api/payments/appointment - Create Stripe checkout session"""
    log_test("=" * 60)
    log_test("TEST 1: POST /api/payments/appointment - Create Stripe Checkout")
    log_test("=" * 60)
    
    try:
        # Try with provided test appointment ID first
        test_data = {
            "appointmentId": TEST_APPOINTMENT_ID,
            "originUrl": NEXT_PUBLIC_BASE_URL
        }
        
        response = make_request('POST', 'payments/appointment', json_data=test_data)
        
        if response and response.status_code == 200:
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
            
        elif response and response.status_code == 404:
            # Appointment not found, try to create one and test again
            log_test(f"Test appointment {TEST_APPOINTMENT_ID} not found, trying to create new one")
            
            # Get auth token
            auth_token = login_user(CLINIC_EMAIL, CLINIC_PASSWORD)
            if not auth_token:
                log_test("Cannot create test appointment without authentication", False)
                return False
            
            # Create new appointment
            new_appointment_id = create_test_appointment(auth_token)
            if not new_appointment_id:
                log_test("Failed to create test appointment", False)
                return False
            
            # Test with new appointment
            test_data['appointmentId'] = new_appointment_id
            response = make_request('POST', 'payments/appointment', json_data=test_data)
            
            if response and response.status_code == 200:
                data = response.json()
                log_test(f"✅ Stripe checkout created with new appointment", True)
                log_test(f"Session ID: {data.get('sessionId', 'N/A')}")
                log_test(f"Amount: €{data.get('amount', 'N/A')}")
                return True
            else:
                log_test(f"Failed even with new appointment: {response.status_code if response else 'No response'}", False)
                return False
        else:
            log_test(f"Payment creation failed: {response.status_code if response else 'No response'}", False)
            if response:
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
        # Send request without appointmentId
        test_data = {
            "originUrl": NEXT_PUBLIC_BASE_URL
        }
        
        response = make_request('POST', 'payments/appointment', json_data=test_data)
        
        if not response:
            log_test("Failed to make request", False)
            return False
        
        if response.status_code != 400:
            log_test(f"Expected status 400, got {response.status_code}", False)
            return False
        
        try:
            data = response.json()
            if 'error' not in data:
                log_test("Expected error field in response", False)
                return False
            log_test(f"✅ Correctly returned error for missing appointmentId: {data['error']}", True)
        except:
            log_test(f"✅ Correctly returned 400 status for missing appointmentId", True)
        
        return True
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_payment_non_existent_appointment():
    """Test 3: POST /api/payments/appointment - Test error handling for non-existent appointment"""
    log_test("=" * 60)
    log_test("TEST 3: POST /api/payments/appointment - Non-existent Appointment")
    log_test("=" * 60)
    
    try:
        # Use non-existent appointment ID
        fake_id = "00000000-0000-0000-0000-000000000000"
        test_data = {
            "appointmentId": fake_id,
            "originUrl": NEXT_PUBLIC_BASE_URL
        }
        
        response = make_request('POST', 'payments/appointment', json_data=test_data)
        
        if not response:
            log_test("Failed to make request", False)
            return False
        
        if response.status_code != 404:
            log_test(f"Expected status 404, got {response.status_code}", False)
            return False
        
        try:
            data = response.json()
            if 'error' not in data:
                log_test("Expected error field in response", False)
                return False
            log_test(f"✅ Correctly returned error for non-existent appointment: {data['error']}", True)
        except:
            log_test(f"✅ Correctly returned 404 status for non-existent appointment", True)
        
        return True
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_payment_status_get():
    """Test 4: GET /api/payments/appointment - Get payment status"""
    log_test("=" * 60)
    log_test("TEST 4: GET /api/payments/appointment - Get Payment Status")
    log_test("=" * 60)
    
    try:
        # Test with provided appointment ID
        response = make_request('GET', f'payments/appointment?appointmentId={TEST_APPOINTMENT_ID}')
        
        if not response:
            log_test("Failed to make request", False)
            return False
        
        # If appointment exists, should return 200
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
            
        # If appointment doesn't exist, should return 404
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
            if response:
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
        # Request without appointmentId parameter
        response = make_request('GET', 'payments/appointment')
        
        if not response:
            log_test("Failed to make request", False)
            return False
        
        if response.status_code != 400:
            log_test(f"Expected status 400, got {response.status_code}", False)
            return False
        
        try:
            data = response.json()
            if 'error' not in data:
                log_test("Expected error field in response", False)
                return False
            log_test(f"✅ Correctly returned error for missing appointmentId parameter: {data['error']}", True)
        except:
            log_test(f"✅ Correctly returned 400 status for missing appointmentId parameter", True)
        
        return True
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_chat_api():
    """Test 6: POST /api/chat - Test virtual assistant chat"""
    log_test("=" * 60)
    log_test("TEST 6: POST /api/chat - Virtual Assistant Chat")
    log_test("=" * 60)
    
    try:
        # Test message asking about VetBuddy in Italian
        chat_data = {
            "messages": [
                {
                    "role": "user",
                    "content": "Ciao! Puoi parlarmi di VetBuddy?"
                }
            ],
            "sessionId": "test_session_" + str(int(time.time()))
        }
        
        response = make_request('POST', 'chat', json_data=chat_data)
        
        if not response:
            log_test("Failed to make request", False)
            return False
        
        if response.status_code != 200:
            log_test(f"Expected status 200, got {response.status_code}", False)
            if response:
                log_test(f"Response: {response.text}")
            return False
        
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
        
        # Check message content (should be in Italian and about VetBuddy)
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
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_chat_invalid_messages():
    """Test 7: POST /api/chat - Test error handling for invalid messages"""
    log_test("=" * 60)
    log_test("TEST 7: POST /api/chat - Invalid Messages Format")
    log_test("=" * 60)
    
    try:
        # Test with invalid messages format
        chat_data = {
            "messages": "invalid_format",
            "sessionId": "test_session"
        }
        
        response = make_request('POST', 'chat', json_data=chat_data)
        
        if not response:
            log_test("Failed to make request", False)
            return False
        
        if response.status_code != 400:
            log_test(f"Expected status 400, got {response.status_code}", False)
            return False
        
        try:
            data = response.json()
            if 'error' not in data:
                log_test("Expected error field in response", False)
                return False
            log_test(f"✅ Correctly returned error for invalid messages format: {data['error']}", True)
        except:
            log_test(f"✅ Correctly returned 400 status for invalid messages format", True)
        
        return True
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_chat_multiple_messages():
    """Test 8: POST /api/chat - Test with conversation context"""
    log_test("=" * 60)
    log_test("TEST 8: POST /api/chat - Multiple Messages Conversation")
    log_test("=" * 60)
    
    try:
        # Test with conversation history
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
        
        response = make_request('POST', 'chat', json_data=chat_data)
        
        if not response:
            log_test("Failed to make request", False)
            return False
        
        if response.status_code != 200:
            log_test(f"Expected status 200, got {response.status_code}", False)
            if response:
                log_test(f"Response: {response.text}")
            return False
        
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