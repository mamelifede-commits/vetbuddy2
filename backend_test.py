#!/usr/bin/env python3
"""
VetBuddy Lab Self-Registration and Billing APIs Test Suite
Testing after refactoring - comprehensive backend API testing
"""

import requests
import json
import uuid
import time
from datetime import datetime

# Configuration
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"
FALLBACK_URL = "http://localhost:3000/api"

# Test credentials from review request
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

class VetBuddyAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.clinic_token = None
        self.lab_token = None
        self.admin_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def try_request(self, method, endpoint, **kwargs):
        """Try request with fallback URL"""
        try:
            url = f"{self.base_url}{endpoint}"
            response = self.session.request(method, url, timeout=10, **kwargs)
            return response
        except Exception as e:
            print(f"   Primary URL failed ({e}), trying fallback...")
            try:
                self.base_url = FALLBACK_URL
                url = f"{self.base_url}{endpoint}"
                response = self.session.request(method, url, timeout=10, **kwargs)
                return response
            except Exception as e2:
                print(f"   Fallback URL also failed: {e2}")
                return None

    def login_user(self, credentials, user_type):
        """Login and get JWT token"""
        try:
            response = self.try_request('POST', '/auth/login', json=credentials)
            if response and response.status_code == 200:
                data = response.json()
                token = data.get('token')
                user = data.get('user', {})
                self.log_test(f"{user_type} Login", True, f"Token: {token[:20]}...")
                return token, user
            else:
                error_msg = response.json().get('error', 'Unknown error') if response else 'No response'
                self.log_test(f"{user_type} Login", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
                return None, None
        except Exception as e:
            self.log_test(f"{user_type} Login", False, f"Exception: {str(e)}")
            return None, None

    def test_health_api(self):
        """Test 1: Health Check API"""
        try:
            response = self.try_request('GET', '/health')
            if response and response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok' and 'vetbuddy' in data.get('app', '').lower():
                    self.log_test("Health Check API", True, f"Response: {data}")
                else:
                    self.log_test("Health Check API", False, f"Unexpected response: {data}")
            else:
                self.log_test("Health Check API", False, f"Status: {response.status_code if response else 'None'}")
        except Exception as e:
            self.log_test("Health Check API", False, f"Exception: {str(e)}")

    def test_services_api(self):
        """Test 2: Services Catalog API"""
        try:
            response = self.try_request('GET', '/services')
            if response and response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and len(data) > 0:
                    categories = list(data.keys())
                    self.log_test("Services Catalog API", True, f"Found {len(categories)} categories: {categories[:3]}...")
                else:
                    self.log_test("Services Catalog API", False, f"Empty or invalid response: {data}")
            else:
                self.log_test("Services Catalog API", False, f"Status: {response.status_code if response else 'None'}")
        except Exception as e:
            self.log_test("Services Catalog API", False, f"Exception: {str(e)}")

    def test_lab_marketplace_api(self):
        """Test 3: Lab Marketplace API (requires clinic login)"""
        if not self.clinic_token:
            self.log_test("Lab Marketplace API", False, "No clinic token available")
            return
            
        try:
            headers = {'Authorization': f'Bearer {self.clinic_token}'}
            response = self.try_request('GET', '/labs/marketplace', headers=headers)
            if response and response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Lab Marketplace API", True, f"Found {len(data)} labs")
                    for lab in data[:2]:  # Show first 2 labs
                        print(f"   Lab: {lab.get('labName', 'Unknown')} - {lab.get('city', 'Unknown city')}")
                else:
                    self.log_test("Lab Marketplace API", False, f"Expected array, got: {type(data)}")
            else:
                error_msg = response.json().get('error', 'Unknown error') if response else 'No response'
                self.log_test("Lab Marketplace API", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        except Exception as e:
            self.log_test("Lab Marketplace API", False, f"Exception: {str(e)}")

    def test_lab_connections_api(self):
        """Test 4: Lab Connections API (requires lab login)"""
        if not self.lab_token:
            self.log_test("Lab Connections API", False, "No lab token available")
            return
            
        try:
            headers = {'Authorization': f'Bearer {self.lab_token}'}
            response = self.try_request('GET', '/lab/connections', headers=headers)
            if response and response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Lab Connections API", True, f"Found {len(data)} connections")
                    for conn in data[:2]:  # Show first 2 connections
                        clinic_name = conn.get('clinic', {}).get('clinicName', 'Unknown')
                        status = conn.get('status', 'Unknown')
                        print(f"   Connection: {clinic_name} - Status: {status}")
                else:
                    self.log_test("Lab Connections API", False, f"Expected array, got: {type(data)}")
            else:
                error_msg = response.json().get('error', 'Unknown error') if response else 'No response'
                self.log_test("Lab Connections API", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        except Exception as e:
            self.log_test("Lab Connections API", False, f"Exception: {str(e)}")

    def test_lab_self_registration(self):
        """Test 5: Lab Self-Registration API"""
        # Generate unique email for testing
        unique_id = str(uuid.uuid4())[:8]
        test_lab_data = {
            "email": f"test-lab-{unique_id}@test.it",
            "password": "TestLab2025!",
            "labName": "Test Lab Registrazione",
            "vatNumber": "IT99999999999",
            "phone": "02-9999999",
            "city": "Firenze",
            "province": "FI",
            "contactPerson": "Dr. Test",
            "description": "Lab test registration",
            "specializations": ["Ematologia", "Biochimica"],
            "pickupAvailable": True,
            "pickupDays": "Lun-Ven",
            "pickupHours": "09:00-12:00",
            "averageReportTime": "24-48h"
        }
        
        try:
            # Test successful registration
            response = self.try_request('POST', '/labs/register', json=test_lab_data)
            if response and response.status_code == 200:
                data = response.json()
                if data.get('status') == 'pending_approval' and data.get('labName') == test_lab_data['labName']:
                    self.log_test("Lab Self-Registration (Success)", True, f"Lab registered: {data.get('labName')} - Status: {data.get('status')}")
                else:
                    self.log_test("Lab Self-Registration (Success)", False, f"Unexpected response: {data}")
            else:
                error_msg = response.json().get('error', 'Unknown error') if response else 'No response'
                self.log_test("Lab Self-Registration (Success)", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
            # Test duplicate email (should fail)
            time.sleep(1)  # Brief pause
            response2 = self.try_request('POST', '/labs/register', json=test_lab_data)
            if response2 and response2.status_code == 400:
                error_data = response2.json()
                if 'già registrata' in error_data.get('error', '').lower():
                    self.log_test("Lab Self-Registration (Duplicate Email)", True, f"Correctly rejected duplicate: {error_data.get('error')}")
                else:
                    self.log_test("Lab Self-Registration (Duplicate Email)", False, f"Wrong error message: {error_data.get('error')}")
            else:
                self.log_test("Lab Self-Registration (Duplicate Email)", False, f"Expected 400 error, got: {response2.status_code if response2 else 'None'}")
                
        except Exception as e:
            self.log_test("Lab Self-Registration", False, f"Exception: {str(e)}")

    def test_lab_billing_api(self):
        """Test 6: Lab Billing API"""
        if not self.lab_token:
            self.log_test("Lab Billing API", False, "No lab token available")
            return
            
        try:
            headers = {'Authorization': f'Bearer {self.lab_token}'}
            response = self.try_request('GET', '/lab/billing', headers=headers)
            if response and response.status_code == 200:
                data = response.json()
                required_fields = ['plan', 'freeUntil', 'requestsCount', 'maxFreeRequests', 
                                 'trialExpired', 'requestsExhausted', 'billingActive', 
                                 'daysRemaining', 'requestsRemaining']
                
                missing_fields = [field for field in required_fields if field not in data]
                if not missing_fields:
                    self.log_test("Lab Billing API", True, f"All required fields present. Plan: {data.get('plan')}, Requests: {data.get('requestsCount')}/{data.get('maxFreeRequests')}")
                    print(f"   Billing Status: Active={data.get('billingActive')}, Trial Expired={data.get('trialExpired')}, Days Remaining={data.get('daysRemaining')}")
                else:
                    self.log_test("Lab Billing API", False, f"Missing fields: {missing_fields}")
            else:
                error_msg = response.json().get('error', 'Unknown error') if response else 'No response'
                self.log_test("Lab Billing API", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        except Exception as e:
            self.log_test("Lab Billing API", False, f"Exception: {str(e)}")

    def test_billing_in_login_response(self):
        """Test 7: Billing info in lab login response"""
        try:
            response = self.try_request('POST', '/auth/login', json=LAB_CREDENTIALS)
            if response and response.status_code == 200:
                data = response.json()
                user = data.get('user', {})
                
                # Check if billing info is included in user object
                billing_fields = ['plan', 'freeUntil', 'requestsCount', 'maxFreeRequests']
                billing_present = any(field in user for field in billing_fields)
                
                if billing_present:
                    self.log_test("Billing in Login Response", True, f"Billing fields found in user object: {[f for f in billing_fields if f in user]}")
                else:
                    # Check if there's a separate billing field
                    if 'billing' in user:
                        self.log_test("Billing in Login Response", True, f"Billing object found in user: {list(user['billing'].keys())}")
                    else:
                        self.log_test("Billing in Login Response", False, "No billing information found in login response")
            else:
                self.log_test("Billing in Login Response", False, f"Login failed: {response.status_code if response else 'None'}")
        except Exception as e:
            self.log_test("Billing in Login Response", False, f"Exception: {str(e)}")

    def test_clinic_connected_labs(self):
        """Test 8: Clinic Connected Labs API"""
        if not self.clinic_token:
            self.log_test("Clinic Connected Labs API", False, "No clinic token available")
            return
            
        try:
            headers = {'Authorization': f'Bearer {self.clinic_token}'}
            response = self.try_request('GET', '/clinic/connected-labs', headers=headers)
            if response and response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Clinic Connected Labs API", True, f"Found {len(data)} connected labs")
                else:
                    self.log_test("Clinic Connected Labs API", False, f"Expected array, got: {type(data)}")
            else:
                error_msg = response.json().get('error', 'Unknown error') if response else 'No response'
                self.log_test("Clinic Connected Labs API", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        except Exception as e:
            self.log_test("Clinic Connected Labs API", False, f"Exception: {str(e)}")

    def test_lab_price_list(self):
        """Test 9: Lab Price List API"""
        if not self.lab_token:
            self.log_test("Lab Price List API", False, "No lab token available")
            return
            
        try:
            headers = {'Authorization': f'Bearer {self.lab_token}'}
            response = self.try_request('GET', '/lab/my-price-list', headers=headers)
            if response and response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Lab Price List API", True, f"Found {len(data)} price list items")
                    for item in data[:2]:  # Show first 2 items
                        print(f"   Item: {item.get('examType', 'Unknown')} - €{item.get('priceFrom', 0)}")
                else:
                    self.log_test("Lab Price List API", False, f"Expected array, got: {type(data)}")
            else:
                error_msg = response.json().get('error', 'Unknown error') if response else 'No response'
                self.log_test("Lab Price List API", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        except Exception as e:
            self.log_test("Lab Price List API", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🧪 VetBuddy Lab Self-Registration and Billing APIs Test Suite")
        print("=" * 70)
        print(f"Base URL: {self.base_url}")
        print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Step 1: Test basic APIs (no auth required)
        print("📋 STEP 1: Basic API Tests (No Authentication)")
        print("-" * 50)
        self.test_health_api()
        self.test_services_api()
        print()
        
        # Step 2: Login users
        print("🔐 STEP 2: Authentication Tests")
        print("-" * 50)
        self.clinic_token, clinic_user = self.login_user(CLINIC_CREDENTIALS, "Clinic")
        self.lab_token, lab_user = self.login_user(LAB_CREDENTIALS, "Lab")
        print()
        
        # Step 3: Test authenticated APIs
        print("🏥 STEP 3: Authenticated API Tests")
        print("-" * 50)
        self.test_lab_marketplace_api()
        self.test_lab_connections_api()
        self.test_clinic_connected_labs()
        self.test_lab_price_list()
        print()
        
        # Step 4: Test Lab Self-Registration
        print("📝 STEP 4: Lab Self-Registration Tests")
        print("-" * 50)
        self.test_lab_self_registration()
        print()
        
        # Step 5: Test Lab Billing
        print("💰 STEP 5: Lab Billing Tests")
        print("-" * 50)
        self.test_lab_billing_api()
        self.test_billing_in_login_response()
        print()
        
        # Summary
        print("📊 TEST SUMMARY")
        print("=" * 70)
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total*100):.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['details']}")
        
        print(f"\n🎯 Lab Self-Registration and Billing APIs Testing Complete!")
        return passed == total

if __name__ == "__main__":
    tester = VetBuddyAPITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)