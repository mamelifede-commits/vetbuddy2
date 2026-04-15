#!/usr/bin/env python3
"""
VetBuddy Lab External API Integration (Webhook System) Testing
Tests the webhook system endpoints as specified in the review request.
"""

import requests
import json
import base64
import time
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test credentials from review request
LAB_CREDENTIALS = {
    "email": "laboratorio1@vetbuddy.it",
    "password": "Lab2025!"
}

CLINIC_CREDENTIALS = {
    "email": "demo@vetbuddy.it", 
    "password": "VetBuddy2025!Secure"
}

class VetBuddyWebhookTester:
    def __init__(self):
        self.lab_token = None
        self.clinic_token = None
        self.api_key = None
        self.webhook_secret = None
        self.test_results = []
        
    def log_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
    
    def login_lab(self) -> bool:
        """Login as lab user"""
        try:
            response = requests.post(f"{BASE_URL}/auth/login", json=LAB_CREDENTIALS)
            if response.status_code == 200:
                data = response.json()
                self.lab_token = data.get('token')
                self.log_result("Lab Login", True, f"Logged in as {LAB_CREDENTIALS['email']}")
                return True
            else:
                self.log_result("Lab Login", False, f"Status {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Lab Login", False, f"Exception: {str(e)}")
            return False
    
    def login_clinic(self) -> bool:
        """Login as clinic user"""
        try:
            response = requests.post(f"{BASE_URL}/auth/login", json=CLINIC_CREDENTIALS)
            if response.status_code == 200:
                data = response.json()
                self.clinic_token = data.get('token')
                self.log_result("Clinic Login", True, f"Logged in as {CLINIC_CREDENTIALS['email']}")
                return True
            else:
                self.log_result("Clinic Login", False, f"Status {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Clinic Login", False, f"Exception: {str(e)}")
            return False
    
    def test_generate_api_key(self) -> bool:
        """Test POST /api/lab/generate-api-key"""
        try:
            headers = {"Authorization": f"Bearer {self.lab_token}"}
            response = requests.post(f"{BASE_URL}/lab/generate-api-key", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('apiKey') and data.get('webhookSecret'):
                    self.api_key = data['apiKey']
                    self.webhook_secret = data['webhookSecret']
                    self.log_result("Generate API Key", True, 
                                  f"API Key: {self.api_key[:20]}..., Webhook Secret: {self.webhook_secret[:20]}...")
                    return True
                else:
                    self.log_result("Generate API Key", False, "Missing required fields in response", data)
                    return False
            else:
                self.log_result("Generate API Key", False, f"Status {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Generate API Key", False, f"Exception: {str(e)}")
            return False
    
    def test_get_integration_settings(self) -> bool:
        """Test GET /api/lab/integration"""
        try:
            headers = {"Authorization": f"Bearer {self.lab_token}"}
            response = requests.get(f"{BASE_URL}/lab/integration", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ['configured', 'apiKeyMasked', 'hasApiKey', 'isActive']
                missing_fields = [field for field in expected_fields if field not in data]
                
                if not missing_fields and data.get('configured') and data.get('hasApiKey'):
                    self.log_result("Get Integration Settings", True, 
                                  f"Configured: {data['configured']}, Active: {data.get('isActive')}, "
                                  f"Masked Key: {data.get('apiKeyMasked')}")
                    return True
                else:
                    self.log_result("Get Integration Settings", False, 
                                  f"Missing fields: {missing_fields} or not configured", data)
                    return False
            else:
                self.log_result("Get Integration Settings", False, f"Status {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Get Integration Settings", False, f"Exception: {str(e)}")
            return False
    
    def test_get_webhook_logs(self) -> bool:
        """Test GET /api/lab/webhook-logs"""
        try:
            headers = {"Authorization": f"Bearer {self.lab_token}"}
            response = requests.get(f"{BASE_URL}/lab/webhook-logs", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Webhook Logs", True, f"Retrieved {len(data)} webhook logs")
                    return True
                else:
                    self.log_result("Get Webhook Logs", False, "Response is not a list", data)
                    return False
            else:
                self.log_result("Get Webhook Logs", False, f"Status {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Get Webhook Logs", False, f"Exception: {str(e)}")
            return False
    
    def test_toggle_integration(self) -> bool:
        """Test POST /api/lab/integration/toggle"""
        try:
            headers = {"Authorization": f"Bearer {self.lab_token}"}
            
            # First toggle (should turn off)
            response = requests.post(f"{BASE_URL}/lab/integration/toggle", headers=headers)
            if response.status_code == 200:
                data = response.json()
                first_state = data.get('isActive')
                
                # Second toggle (should turn back on)
                response2 = requests.post(f"{BASE_URL}/lab/integration/toggle", headers=headers)
                if response2.status_code == 200:
                    data2 = response2.json()
                    second_state = data2.get('isActive')
                    
                    if first_state != second_state:
                        self.log_result("Toggle Integration", True, 
                                      f"Successfully toggled: {first_state} → {second_state}")
                        return True
                    else:
                        self.log_result("Toggle Integration", False, 
                                      f"State didn't change: {first_state} → {second_state}")
                        return False
                else:
                    self.log_result("Toggle Integration", False, 
                                  f"Second toggle failed: {response2.status_code}", response2.json())
                    return False
            else:
                self.log_result("Toggle Integration", False, f"Status {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Toggle Integration", False, f"Exception: {str(e)}")
            return False
    
    def test_webhook_pending_requests(self) -> bool:
        """Test GET /api/webhook/lab/{apiKey}/pending-requests"""
        try:
            if not self.api_key:
                self.log_result("Webhook Pending Requests", False, "No API key available")
                return False
            
            response = requests.get(f"{BASE_URL}/webhook/lab/{self.api_key}/pending-requests")
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ['labId', 'count', 'requests']
                missing_fields = [field for field in expected_fields if field not in data]
                
                if not missing_fields:
                    self.log_result("Webhook Pending Requests", True, 
                                  f"Lab ID: {data['labId']}, Count: {data['count']}, "
                                  f"Requests: {len(data['requests'])}")
                    return True
                else:
                    self.log_result("Webhook Pending Requests", False, 
                                  f"Missing fields: {missing_fields}", data)
                    return False
            else:
                self.log_result("Webhook Pending Requests", False, f"Status {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Webhook Pending Requests", False, f"Exception: {str(e)}")
            return False
    
    def test_webhook_update_status(self) -> bool:
        """Test POST /api/webhook/lab/{apiKey}/update-status"""
        try:
            if not self.api_key:
                self.log_result("Webhook Update Status", False, "No API key available")
                return False
            
            # First get pending requests to find a valid requestId
            response = requests.get(f"{BASE_URL}/webhook/lab/{self.api_key}/pending-requests")
            if response.status_code != 200:
                self.log_result("Webhook Update Status", False, "Could not fetch pending requests")
                return False
            
            data = response.json()
            requests_list = data.get('requests', [])
            
            if not requests_list:
                # Test with invalid requestId to verify error handling
                test_payload = {
                    "requestId": "invalid-request-id",
                    "status": "in_progress"
                }
                
                response = requests.post(f"{BASE_URL}/webhook/lab/{self.api_key}/update-status", 
                                       json=test_payload)
                
                if response.status_code == 404:
                    self.log_result("Webhook Update Status", True, 
                                  "Correctly returned 404 for invalid requestId")
                    return True
                else:
                    self.log_result("Webhook Update Status", False, 
                                  f"Expected 404 for invalid requestId, got {response.status_code}")
                    return False
            else:
                # Use first available request
                request_id = requests_list[0]['id']
                test_payload = {
                    "requestId": request_id,
                    "status": "in_progress",
                    "notes": "Test status update via webhook API"
                }
                
                response = requests.post(f"{BASE_URL}/webhook/lab/{self.api_key}/update-status", 
                                       json=test_payload)
                
                if response.status_code == 200:
                    result_data = response.json()
                    if result_data.get('success'):
                        self.log_result("Webhook Update Status", True, 
                                      f"Updated request {request_id} to {test_payload['status']}")
                        return True
                    else:
                        self.log_result("Webhook Update Status", False, 
                                      "Success field is false", result_data)
                        return False
                else:
                    self.log_result("Webhook Update Status", False, 
                                  f"Status {response.status_code}", response.json())
                    return False
        except Exception as e:
            self.log_result("Webhook Update Status", False, f"Exception: {str(e)}")
            return False
    
    def test_webhook_upload_report(self) -> bool:
        """Test POST /api/webhook/lab/{apiKey}/upload-report"""
        try:
            if not self.api_key:
                self.log_result("Webhook Upload Report", False, "No API key available")
                return False
            
            # First get pending requests to find a valid requestId
            response = requests.get(f"{BASE_URL}/webhook/lab/{self.api_key}/pending-requests")
            if response.status_code != 200:
                self.log_result("Webhook Upload Report", False, "Could not fetch pending requests")
                return False
            
            data = response.json()
            requests_list = data.get('requests', [])
            
            if not requests_list:
                # Test with invalid requestId to verify error handling
                test_pdf_content = base64.b64encode(b"Test PDF content for VetBuddy webhook").decode('utf-8')
                test_payload = {
                    "requestId": "invalid-request-id",
                    "reportPdfBase64": test_pdf_content,
                    "fileName": "test_report.pdf",
                    "notes": "Test report upload via webhook API"
                }
                
                response = requests.post(f"{BASE_URL}/webhook/lab/{self.api_key}/upload-report", 
                                       json=test_payload)
                
                if response.status_code == 404:
                    self.log_result("Webhook Upload Report", True, 
                                  "Correctly returned 404 for invalid requestId")
                    return True
                else:
                    self.log_result("Webhook Upload Report", False, 
                                  f"Expected 404 for invalid requestId, got {response.status_code}")
                    return False
            else:
                # Use first available request
                request_id = requests_list[0]['id']
                test_pdf_content = base64.b64encode(b"Test PDF content for VetBuddy webhook").decode('utf-8')
                test_payload = {
                    "requestId": request_id,
                    "reportPdfBase64": test_pdf_content,
                    "fileName": "test_report.pdf",
                    "notes": "Test report upload via webhook API"
                }
                
                response = requests.post(f"{BASE_URL}/webhook/lab/{self.api_key}/upload-report", 
                                       json=test_payload)
                
                if response.status_code == 200:
                    result_data = response.json()
                    if result_data.get('success'):
                        self.log_result("Webhook Upload Report", True, 
                                      f"Uploaded report for request {request_id}")
                        return True
                    else:
                        self.log_result("Webhook Upload Report", False, 
                                      "Success field is false", result_data)
                        return False
                else:
                    self.log_result("Webhook Upload Report", False, 
                                  f"Status {response.status_code}", response.json())
                    return False
        except Exception as e:
            self.log_result("Webhook Upload Report", False, f"Exception: {str(e)}")
            return False
    
    def test_error_cases(self) -> bool:
        """Test various error cases"""
        error_tests_passed = 0
        total_error_tests = 0
        
        # Test 1: Invalid API key returns 401
        total_error_tests += 1
        try:
            response = requests.get(f"{BASE_URL}/webhook/lab/invalid_api_key/pending-requests")
            if response.status_code == 401:
                self.log_result("Error Case - Invalid API Key", True, "Correctly returned 401")
                error_tests_passed += 1
            else:
                self.log_result("Error Case - Invalid API Key", False, 
                              f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_result("Error Case - Invalid API Key", False, f"Exception: {str(e)}")
        
        # Test 2: Missing required fields returns 400
        total_error_tests += 1
        if self.api_key:
            try:
                response = requests.post(f"{BASE_URL}/webhook/lab/{self.api_key}/update-status", 
                                       json={"status": "in_progress"})  # Missing requestId
                if response.status_code == 400:
                    self.log_result("Error Case - Missing Fields", True, "Correctly returned 400")
                    error_tests_passed += 1
                else:
                    self.log_result("Error Case - Missing Fields", False, 
                                  f"Expected 400, got {response.status_code}")
            except Exception as e:
                self.log_result("Error Case - Missing Fields", False, f"Exception: {str(e)}")
        
        # Test 3: Invalid status value returns 400
        total_error_tests += 1
        if self.api_key:
            try:
                response = requests.post(f"{BASE_URL}/webhook/lab/{self.api_key}/update-status", 
                                       json={"requestId": "test", "status": "invalid_status"})
                if response.status_code == 400:
                    self.log_result("Error Case - Invalid Status", True, "Correctly returned 400")
                    error_tests_passed += 1
                else:
                    self.log_result("Error Case - Invalid Status", False, 
                                  f"Expected 400, got {response.status_code}")
            except Exception as e:
                self.log_result("Error Case - Invalid Status", False, f"Exception: {str(e)}")
        
        # Test 4: Non-lab user trying to generate API key returns 403
        total_error_tests += 1
        if self.clinic_token:
            try:
                headers = {"Authorization": f"Bearer {self.clinic_token}"}
                response = requests.post(f"{BASE_URL}/lab/generate-api-key", headers=headers)
                if response.status_code == 403:
                    self.log_result("Error Case - Non-lab Generate API Key", True, "Correctly returned 403")
                    error_tests_passed += 1
                else:
                    self.log_result("Error Case - Non-lab Generate API Key", False, 
                                  f"Expected 403, got {response.status_code}")
            except Exception as e:
                self.log_result("Error Case - Non-lab Generate API Key", False, f"Exception: {str(e)}")
        
        return error_tests_passed == total_error_tests
    
    def test_integration_toggle_workflow(self) -> bool:
        """Test the complete integration toggle workflow"""
        try:
            if not self.api_key:
                self.log_result("Integration Toggle Workflow", False, "No API key available")
                return False
            
            headers = {"Authorization": f"Bearer {self.lab_token}"}
            
            # Step 1: Toggle integration off
            response = requests.post(f"{BASE_URL}/lab/integration/toggle", headers=headers)
            if response.status_code != 200:
                self.log_result("Integration Toggle Workflow", False, "Failed to toggle off")
                return False
            
            # Step 2: Verify webhook calls fail when integration is off
            response = requests.get(f"{BASE_URL}/webhook/lab/{self.api_key}/pending-requests")
            if response.status_code == 401:
                # Step 3: Toggle back on
                response = requests.post(f"{BASE_URL}/lab/integration/toggle", headers=headers)
                if response.status_code == 200:
                    # Step 4: Verify webhook calls work again
                    response = requests.get(f"{BASE_URL}/webhook/lab/{self.api_key}/pending-requests")
                    if response.status_code == 200:
                        self.log_result("Integration Toggle Workflow", True, 
                                      "Complete workflow: off → fail → on → success")
                        return True
                    else:
                        self.log_result("Integration Toggle Workflow", False, 
                                      "Webhook still fails after toggle on")
                        return False
                else:
                    self.log_result("Integration Toggle Workflow", False, "Failed to toggle back on")
                    return False
            else:
                self.log_result("Integration Toggle Workflow", False, 
                              "Webhook didn't fail when integration was off")
                return False
        except Exception as e:
            self.log_result("Integration Toggle Workflow", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all webhook system tests"""
        print("🧪 Starting VetBuddy Lab External API Integration (Webhook System) Tests")
        print("=" * 80)
        
        # Authentication
        if not self.login_lab():
            print("❌ Cannot proceed without lab authentication")
            return
        
        if not self.login_clinic():
            print("⚠️  Clinic authentication failed, some error tests may be skipped")
        
        # Lab Self-Service API Key Management Tests
        print("\n📋 Testing Lab Self-Service API Key Management...")
        self.test_generate_api_key()
        self.test_get_integration_settings()
        self.test_get_webhook_logs()
        self.test_toggle_integration()
        
        # Public Webhook Endpoints Tests
        print("\n🔗 Testing Public Webhook Endpoints...")
        self.test_webhook_pending_requests()
        self.test_webhook_update_status()
        self.test_webhook_upload_report()
        
        # Error Cases Tests
        print("\n⚠️  Testing Error Cases...")
        self.test_error_cases()
        
        # Integration Workflow Tests
        print("\n🔄 Testing Integration Toggle Workflow...")
        self.test_integration_toggle_workflow()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! VetBuddy Lab External API Integration is working correctly.")
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Review the details above.")
            
            # Show failed tests
            failed_tests = [result for result in self.test_results if not result['success']]
            if failed_tests:
                print("\n❌ Failed Tests:")
                for test in failed_tests:
                    print(f"   - {test['test']}: {test['details']}")
        
        return passed == total

if __name__ == "__main__":
    tester = VetBuddyWebhookTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)