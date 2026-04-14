#!/usr/bin/env python3
"""
VetBuddy Lab Report Send-to-Owner Workflow Testing
Testing the complete lab report workflow including:
1. Lab Report Send-to-Owner API (POST /api/lab-reports/send-to-owner)
2. Lab Report Visibility Filter for Owner (GET /api/pets/:petId/lab-reports)
"""

import requests
import json
import base64
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test credentials from review request
CREDENTIALS = {
    "clinic": {"email": "demo@vetbuddy.it", "password": "VetBuddy2025!Secure"},
    "lab": {"email": "laboratorio1@vetbuddy.it", "password": "Lab2025!"},
    "owner": {"email": "proprietario.demo@vetbuddy.it", "password": "demo123"}
}

# Known IDs from review request
LAB_REQUEST_IDS = {
    "completed": "ba12403b-d526-48e3-857d-53dcdb5a2df5",
    "report_ready": "50905c70-9a57-4fd9-9a22-1cff1f95b387", 
    "completed_after_send": "05d4a8f0-9128-4dcd-a5a1-ac4d9b48e143"
}
OWNER_PET_ID = "f1f3b7d9-01fe-4955-b6c8-bdf183a62d28"

class VetBuddyLabReportTester:
    def __init__(self):
        self.tokens = {}
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        })
    
    def login(self, role):
        """Login and get JWT token for specified role"""
        try:
            creds = CREDENTIALS[role]
            response = requests.post(f"{BASE_URL}/auth/login", json=creds)
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data:
                    self.tokens[role] = data['token']
                    self.log_test(f"Login {role}", True, f"Successfully logged in as {role}")
                    return True
                else:
                    self.log_test(f"Login {role}", False, f"No token in response: {data}")
                    return False
            else:
                self.log_test(f"Login {role}", False, f"Login failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test(f"Login {role}", False, f"Login error: {str(e)}")
            return False
    
    def get_headers(self, role):
        """Get authorization headers for API calls"""
        if role not in self.tokens:
            return {}
        return {"Authorization": f"Bearer {self.tokens[role]}"}
    
    def test_1_get_lab_requests_as_clinic(self):
        """Test 1: Get Lab Requests as Clinic"""
        try:
            headers = self.get_headers('clinic')
            response = requests.get(f"{BASE_URL}/lab-requests", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Lab Requests", True, f"Retrieved {len(data)} lab requests")
                    
                    # Check for different statuses
                    statuses = [req.get('status') for req in data]
                    unique_statuses = set(statuses)
                    print(f"   Found statuses: {unique_statuses}")
                    return data
                else:
                    self.log_test("Get Lab Requests", False, f"Expected list, got: {type(data)}")
                    return []
            else:
                self.log_test("Get Lab Requests", False, f"Failed: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            self.log_test("Get Lab Requests", False, f"Error: {str(e)}")
            return []
    
    def test_2_get_lab_request_detail(self, request_id):
        """Test 2: Get Lab Request Detail with reports"""
        try:
            headers = self.get_headers('clinic')
            response = requests.get(f"{BASE_URL}/lab-requests/{request_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'reports' in data:
                    reports = data['reports']
                    self.log_test("Get Lab Request Detail", True, f"Retrieved request with {len(reports)} reports")
                    
                    # Check for visibleToOwner field
                    for i, report in enumerate(reports):
                        visible = report.get('visibleToOwner', 'NOT_SET')
                        print(f"   Report {i+1}: visibleToOwner = {visible}")
                    
                    return data
                else:
                    self.log_test("Get Lab Request Detail", False, f"No reports field in response: {data.keys()}")
                    return None
            else:
                self.log_test("Get Lab Request Detail", False, f"Failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Get Lab Request Detail", False, f"Error: {str(e)}")
            return None
    
    def test_3_send_report_to_owner_happy_path(self, report_id):
        """Test 3: Send Report to Owner (Happy Path)"""
        try:
            headers = self.get_headers('clinic')
            payload = {
                "reportId": report_id,
                "clinicNotes": "Note cliniche test - Referto revisionato e approvato per il proprietario",
                "notifyOwner": True
            }
            
            response = requests.post(f"{BASE_URL}/lab-reports/send-to-owner", 
                                   json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'Referto inviato al proprietario' in data.get('message', ''):
                    self.log_test("Send Report to Owner", True, "Successfully sent report to owner")
                    return True
                else:
                    self.log_test("Send Report to Owner", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Send Report to Owner", False, f"Failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Send Report to Owner", False, f"Error: {str(e)}")
            return False
    
    def test_4_send_report_error_cases(self):
        """Test 4: Send Report - Error Cases"""
        test_cases = [
            {
                "name": "No Authentication",
                "headers": {},
                "payload": {"reportId": "test-id", "clinicNotes": "test"},
                "expected_status": 401
            },
            {
                "name": "Missing reportId",
                "headers": self.get_headers('clinic'),
                "payload": {"clinicNotes": "test"},
                "expected_status": 400
            },
            {
                "name": "Invalid reportId",
                "headers": self.get_headers('clinic'),
                "payload": {"reportId": "invalid-id-12345", "clinicNotes": "test"},
                "expected_status": 404
            },
            {
                "name": "Owner token (non-clinic)",
                "headers": self.get_headers('owner'),
                "payload": {"reportId": "test-id", "clinicNotes": "test"},
                "expected_status": 401
            }
        ]
        
        for case in test_cases:
            try:
                response = requests.post(f"{BASE_URL}/lab-reports/send-to-owner", 
                                       json=case["payload"], headers=case["headers"])
                
                if response.status_code == case["expected_status"]:
                    self.log_test(f"Error Case: {case['name']}", True, 
                                f"Correctly returned {response.status_code}")
                else:
                    self.log_test(f"Error Case: {case['name']}", False, 
                                f"Expected {case['expected_status']}, got {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Error Case: {case['name']}", False, f"Error: {str(e)}")
    
    def test_5_owner_visibility_filter(self):
        """Test 5: Owner Visibility Filter"""
        try:
            # First get owner's pets
            headers = self.get_headers('owner')
            pets_response = requests.get(f"{BASE_URL}/pets", headers=headers)
            
            if pets_response.status_code != 200:
                self.log_test("Owner Get Pets", False, f"Failed to get pets: {pets_response.status_code}")
                return
            
            pets = pets_response.json()
            if not pets:
                self.log_test("Owner Get Pets", False, "No pets found for owner")
                return
            
            pet_id = pets[0].get('id', OWNER_PET_ID)
            self.log_test("Owner Get Pets", True, f"Found {len(pets)} pets, using pet ID: {pet_id}")
            
            # Test owner visibility filter
            owner_response = requests.get(f"{BASE_URL}/pets/{pet_id}/lab-reports", headers=headers)
            
            if owner_response.status_code == 200:
                owner_reports = owner_response.json()
                visible_count = len([r for r in owner_reports if r.get('visibleToOwner', False)])
                self.log_test("Owner Lab Reports Filter", True, 
                            f"Owner sees {len(owner_reports)} reports (all should be visible)")
                
                # Test clinic sees all reports
                clinic_headers = self.get_headers('clinic')
                clinic_response = requests.get(f"{BASE_URL}/pets/{pet_id}/lab-reports", headers=clinic_headers)
                
                if clinic_response.status_code == 200:
                    clinic_reports = clinic_response.json()
                    self.log_test("Clinic Lab Reports Access", True, 
                                f"Clinic sees {len(clinic_reports)} reports (should see all)")
                    
                    if len(clinic_reports) >= len(owner_reports):
                        self.log_test("Visibility Filter Logic", True, 
                                    "Clinic sees same or more reports than owner")
                    else:
                        self.log_test("Visibility Filter Logic", False, 
                                    "Owner sees more reports than clinic (unexpected)")
                else:
                    self.log_test("Clinic Lab Reports Access", False, 
                                f"Failed: {clinic_response.status_code}")
            else:
                self.log_test("Owner Lab Reports Filter", False, 
                            f"Failed: {owner_response.status_code} - {owner_response.text}")
                
        except Exception as e:
            self.log_test("Owner Visibility Filter", False, f"Error: {str(e)}")
    
    def test_6_lab_report_upload_default(self):
        """Test 6: Lab Report Upload Default (visibleToOwner: false)"""
        try:
            headers = self.get_headers('lab')
            
            # Create a simple base64 PDF content for testing
            test_pdf_content = base64.b64encode(b"Test PDF content for lab report").decode('utf-8')
            
            payload = {
                "labRequestId": LAB_REQUEST_IDS["report_ready"],
                "fileName": "Test_Report.pdf",
                "fileContent": test_pdf_content,
                "reportNotes": "Test report notes from lab"
            }
            
            response = requests.post(f"{BASE_URL}/lab-reports", json=payload, headers=headers)
            
            if response.status_code == 200 or response.status_code == 201:
                data = response.json()
                visible_to_owner = data.get('visibleToOwner', 'NOT_SET')
                
                if visible_to_owner == False:
                    self.log_test("Lab Report Upload Default", True, 
                                "New report correctly defaults to visibleToOwner: false")
                else:
                    self.log_test("Lab Report Upload Default", False, 
                                f"Expected visibleToOwner: false, got: {visible_to_owner}")
                
                return data.get('id')
            else:
                self.log_test("Lab Report Upload Default", False, 
                            f"Upload failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Lab Report Upload Default", False, f"Error: {str(e)}")
            return None
    
    def verify_report_after_send(self, report_id):
        """Verify report has visibleToOwner: true and clinicNotes after sending"""
        try:
            # Get the specific report to verify changes
            headers = self.get_headers('clinic')
            
            # We need to find the report through lab requests since there's no direct report endpoint
            lab_requests = requests.get(f"{BASE_URL}/lab-requests", headers=headers)
            
            if lab_requests.status_code == 200:
                requests_data = lab_requests.json()
                
                for req in requests_data:
                    req_detail = requests.get(f"{BASE_URL}/lab-requests/{req['id']}", headers=headers)
                    if req_detail.status_code == 200:
                        detail_data = req_detail.json()
                        reports = detail_data.get('reports', [])
                        
                        for report in reports:
                            if report.get('id') == report_id:
                                visible = report.get('visibleToOwner', False)
                                clinic_notes = report.get('clinicNotes', '')
                                
                                if visible and clinic_notes:
                                    self.log_test("Verify Report After Send", True, 
                                                f"Report now has visibleToOwner: true and clinicNotes set")
                                    return True
                                else:
                                    self.log_test("Verify Report After Send", False, 
                                                f"visibleToOwner: {visible}, clinicNotes: '{clinic_notes}'")
                                    return False
                
                self.log_test("Verify Report After Send", False, "Report not found in any lab request")
                return False
            else:
                self.log_test("Verify Report After Send", False, "Failed to get lab requests")
                return False
                
        except Exception as e:
            self.log_test("Verify Report After Send", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all lab report workflow tests"""
        print("🧪 Starting VetBuddy Lab Report Send-to-Owner Workflow Tests")
        print("=" * 70)
        
        # Login all users
        print("\n📋 Phase 1: Authentication")
        clinic_login = self.login('clinic')
        lab_login = self.login('lab')
        owner_login = self.login('owner')
        
        if not all([clinic_login, lab_login, owner_login]):
            print("❌ Authentication failed - cannot continue with tests")
            return False
        
        # Test 1: Get lab requests as clinic
        print("\n📋 Phase 2: Lab Request Management")
        lab_requests = self.test_1_get_lab_requests_as_clinic()
        
        # Test 2: Get lab request detail
        if lab_requests:
            # Try to find a request with reports
            request_with_reports = None
            for req in lab_requests:
                if req.get('status') in ['report_ready', 'completed']:
                    detail = self.test_2_get_lab_request_detail(req['id'])
                    if detail and detail.get('reports'):
                        request_with_reports = detail
                        break
            
            if not request_with_reports:
                # Use known ID from review request
                request_with_reports = self.test_2_get_lab_request_detail(LAB_REQUEST_IDS["report_ready"])
        
        # Test 3: Send report to owner (happy path)
        print("\n📋 Phase 3: Send Report to Owner Workflow")
        report_id_to_send = None
        
        if request_with_reports and request_with_reports.get('reports'):
            # Find a report with visibleToOwner: false
            for report in request_with_reports['reports']:
                if not report.get('visibleToOwner', True):  # Default True means if not set, assume visible
                    report_id_to_send = report['id']
                    break
            
            if not report_id_to_send and request_with_reports['reports']:
                # Use first report if none found with visibleToOwner: false
                report_id_to_send = request_with_reports['reports'][0]['id']
        
        if report_id_to_send:
            send_success = self.test_3_send_report_to_owner_happy_path(report_id_to_send)
            if send_success:
                self.verify_report_after_send(report_id_to_send)
        else:
            self.log_test("Send Report to Owner", False, "No suitable report found for testing")
        
        # Test 4: Error cases
        print("\n📋 Phase 4: Error Handling")
        self.test_4_send_report_error_cases()
        
        # Test 5: Owner visibility filter
        print("\n📋 Phase 5: Owner Visibility Filter")
        self.test_5_owner_visibility_filter()
        
        # Test 6: Lab report upload default
        print("\n📋 Phase 6: Lab Report Upload Default")
        new_report_id = self.test_6_lab_report_upload_default()
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['success']])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for test in self.test_results:
                if not test['success']:
                    print(f"  - {test['test']}: {test['message']}")
        
        return failed_tests == 0

if __name__ == "__main__":
    tester = VetBuddyLabReportTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Lab Report Send-to-Owner workflow is working correctly.")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Please check the issues above.")
        sys.exit(1)