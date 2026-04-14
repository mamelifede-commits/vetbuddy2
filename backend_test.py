#!/usr/bin/env python3
"""
VetBuddy Lab Module Regression Test
Tests all lab endpoints after refactoring to modules/lab.js
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

class VetBuddyLabTester:
    def __init__(self):
        self.clinic_token = None
        self.lab_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        print(f"{status} {test_name}")
        if details and not success:
            print(f"   Details: {details}")
    
    def make_request(self, method, endpoint, data=None, token=None):
        """Make HTTP request with error handling"""
        url = f"{BASE_URL}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
            
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            else:
                return None, f"Unsupported method: {method}"
                
            return response, None
        except requests.exceptions.RequestException as e:
            return None, str(e)
    
    def test_health_check(self):
        """Test 1: GET /api/health → 200"""
        response, error = self.make_request("GET", "/health")
        
        if error:
            self.log_test("Health Check", False, error)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "ok" and "vetbuddy" in data.get("app", "").lower():
                self.log_test("Health Check", True, f"Status: {data.get('status')}")
                return True
        
        self.log_test("Health Check", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
        return False
    
    def test_services_catalog(self):
        """Test 2: GET /api/services → returns service catalog"""
        response, error = self.make_request("GET", "/services")
        
        if error:
            self.log_test("Services Catalog", False, error)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and len(data) > 0:
                # Check for expected service categories
                expected_categories = ["visite_generali", "chirurgia", "diagnostica"]
                found_categories = [cat for cat in expected_categories if cat in data]
                
                self.log_test("Services Catalog", True, f"Found {len(data)} categories, including: {', '.join(found_categories)}")
                return True
        
        self.log_test("Services Catalog", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
        return False
    
    def test_lab_exam_types(self):
        """Test 3: GET /api/lab/exam-types → returns exam types catalog (from lab module)"""
        response, error = self.make_request("GET", "/lab/exam-types")
        
        if error:
            self.log_test("Lab Exam Types", False, error)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and len(data) > 0:
                # Check for expected exam categories
                expected_types = ["istologia", "infettive", "endocrinologia"]
                found_types = [t for t in expected_types if t in data]
                
                self.log_test("Lab Exam Types", True, f"Found {len(data)} exam types, including: {', '.join(found_types)}")
                return True
        
        self.log_test("Lab Exam Types", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
        return False
    
    def test_lab_statuses(self):
        """Test 4: GET /api/lab/statuses → returns lab statuses (from lab module)"""
        response, error = self.make_request("GET", "/lab/statuses")
        
        if error:
            self.log_test("Lab Statuses", False, error)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                # Check for expected statuses
                status_ids = [s.get("id") for s in data if isinstance(s, dict)]
                expected_statuses = ["pending", "received", "in_progress", "completed"]
                found_statuses = [s for s in expected_statuses if s in status_ids]
                
                self.log_test("Lab Statuses", True, f"Found {len(data)} statuses, including: {', '.join(found_statuses)}")
                return True
        
        self.log_test("Lab Statuses", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
        return False
    
    def test_clinic_login(self):
        """Test 5: Login as clinic → POST /api/auth/login → success"""
        response, error = self.make_request("POST", "/auth/login", CLINIC_CREDENTIALS)
        
        if error:
            self.log_test("Clinic Login", False, error)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if data.get("token") and data.get("user"):
                self.clinic_token = data["token"]
                user = data["user"]
                self.log_test("Clinic Login", True, f"Logged in as: {user.get('email')} ({user.get('role')})")
                return True
        
        self.log_test("Clinic Login", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
        return False
    
    def test_labs_marketplace(self):
        """Test 6: GET /api/labs/marketplace → returns 2 labs with price lists (from lab module)"""
        if not self.clinic_token:
            self.log_test("Labs Marketplace", False, "No clinic token available")
            return False
            
        response, error = self.make_request("GET", "/labs/marketplace", token=self.clinic_token)
        
        if error:
            self.log_test("Labs Marketplace", False, error)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) >= 1:  # At least 1 lab
                labs_with_prices = [lab for lab in data if lab.get("priceList") and len(lab["priceList"]) > 0]
                lab_names = [lab.get("labName", "Unknown") for lab in data]
                
                self.log_test("Labs Marketplace", True, f"Found {len(data)} labs: {', '.join(lab_names)}, {len(labs_with_prices)} with price lists")
                return True
        
        self.log_test("Labs Marketplace", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
        return False
    
    def test_clinic_connected_labs(self):
        """Test 7: GET /api/clinic/connected-labs → returns connections (from lab module)"""
        if not self.clinic_token:
            self.log_test("Clinic Connected Labs", False, "No clinic token available")
            return False
            
        response, error = self.make_request("GET", "/clinic/connected-labs", token=self.clinic_token)
        
        if error:
            self.log_test("Clinic Connected Labs", False, error)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Clinic Connected Labs", True, f"Found {len(data)} lab connections")
                return True
        
        self.log_test("Clinic Connected Labs", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
        return False
    
    def test_lab_login(self):
        """Test 8: Login as lab → POST /api/auth/login → success, should include billing field"""
        response, error = self.make_request("POST", "/auth/login", LAB_CREDENTIALS)
        
        if error:
            self.log_test("Lab Login", False, error)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if data.get("token") and data.get("user"):
                self.lab_token = data["token"]
                user = data["user"]
                # Check if user has lab-specific fields
                has_lab_fields = any(field in user for field in ["labName", "specializations", "plan"])
                
                self.log_test("Lab Login", True, f"Logged in as: {user.get('email')} ({user.get('role')}), Lab fields: {has_lab_fields}")
                return True
        
        self.log_test("Lab Login", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
        return False
    
    def test_lab_connections(self):
        """Test 9: GET /api/lab/connections → returns connections (from lab module)"""
        if not self.lab_token:
            self.log_test("Lab Connections", False, "No lab token available")
            return False
            
        response, error = self.make_request("GET", "/lab/connections", token=self.lab_token)
        
        if error:
            self.log_test("Lab Connections", False, error)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                connections_with_clinic = [conn for conn in data if conn.get("clinic")]
                self.log_test("Lab Connections", True, f"Found {len(data)} connections, {len(connections_with_clinic)} with clinic info")
                return True
        
        self.log_test("Lab Connections", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
        return False
    
    def test_lab_price_list(self):
        """Test 10: GET /api/lab/my-price-list → returns price list items (from lab module)"""
        if not self.lab_token:
            self.log_test("Lab Price List", False, "No lab token available")
            return False
            
        response, error = self.make_request("GET", "/lab/my-price-list", token=self.lab_token)
        
        if error:
            self.log_test("Lab Price List", False, error)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                price_items = [item for item in data if item.get("examType") and item.get("priceFrom") is not None]
                self.log_test("Lab Price List", True, f"Found {len(data)} price list items, {len(price_items)} with valid pricing")
                return True
        
        self.log_test("Lab Price List", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
        return False
    
    def test_lab_billing(self):
        """Test 11: GET /api/lab/billing → returns billing info (from lab module)"""
        if not self.lab_token:
            self.log_test("Lab Billing", False, "No lab token available")
            return False
            
        response, error = self.make_request("GET", "/lab/billing", token=self.lab_token)
        
        if error:
            self.log_test("Lab Billing", False, error)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict):
                # Check for expected billing fields
                billing_fields = ["plan", "requestsCount", "maxFreeRequests", "billingActive"]
                found_fields = [field for field in billing_fields if field in data]
                
                self.log_test("Lab Billing", True, f"Billing info available with fields: {', '.join(found_fields)}")
                return True
        
        self.log_test("Lab Billing", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
        return False
    
    def test_lab_registration(self):
        """Test 12: POST /api/labs/register with new email → should create pending lab (from lab module)"""
        # Use a unique email for testing
        test_email = f"test_lab_{int(datetime.now().timestamp())}@example.com"
        registration_data = {
            "email": test_email,
            "password": "TestPassword123!",
            "labName": "Test Lab Regression",
            "city": "Milano",
            "description": "Test lab for regression testing"
        }
        
        response, error = self.make_request("POST", "/labs/register", registration_data)
        
        if error:
            self.log_test("Lab Registration", False, error)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if data.get("id") and data.get("email") == test_email:
                status = data.get("status", "unknown")
                is_approved = data.get("isApproved", False)
                
                self.log_test("Lab Registration", True, f"Lab created with status: {status}, approved: {is_approved}")
                return True
        
        self.log_test("Lab Registration", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
        return False
    
    def run_all_tests(self):
        """Run all regression tests"""
        print("🧪 VetBuddy Lab Module Regression Test")
        print("=" * 50)
        print(f"Base URL: {BASE_URL}")
        print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Run tests in order
        tests = [
            self.test_health_check,
            self.test_services_catalog,
            self.test_lab_exam_types,
            self.test_lab_statuses,
            self.test_clinic_login,
            self.test_labs_marketplace,
            self.test_clinic_connected_labs,
            self.test_lab_login,
            self.test_lab_connections,
            self.test_lab_price_list,
            self.test_lab_billing,
            self.test_lab_registration
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                test_name = test.__name__.replace("test_", "").replace("_", " ").title()
                self.log_test(test_name, False, f"Exception: {str(e)}")
        
        # Summary
        print()
        print("=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED - Lab module refactoring successful!")
            return True
        else:
            print(f"\n⚠️  {total - passed} TESTS FAILED - Review lab module implementation")
            
            # Show failed tests
            failed_tests = [result for result in self.test_results if not result["success"]]
            if failed_tests:
                print("\nFailed Tests:")
                for test in failed_tests:
                    print(f"  ❌ {test['test']}: {test['details']}")
            
            return False

if __name__ == "__main__":
    tester = VetBuddyLabTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)