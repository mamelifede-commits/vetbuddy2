#!/usr/bin/env python3
"""
VetBuddy Admin Labs Management, Webhook, and Integration APIs Test Suite
Testing the new endpoints as specified in the review request.
"""

import requests
import json
import time
import uuid
from datetime import datetime

# Base URL from .env
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test credentials from review request
ADMIN_EMAIL = "admin@vetbuddy.it"
ADMIN_PASSWORD = "Admin2025!"

CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"

LAB_EMAIL = "laboratorio1@vetbuddy.it"
LAB_PASSWORD = "Lab2025!"

class VetBuddyLabsAPITester:
    def __init__(self):
        self.admin_token = None
        self.clinic_token = None
        self.lab_token = None
        self.lab_id = None
        self.integration_id = None
        self.webhook_secret = None
        
    def authenticate(self, email, password, role_name):
        """Authenticate and get JWT token"""
        try:
            response = requests.post(f"{BASE_URL}/auth/login", json={
                "email": email,
                "password": password
            })
            
            if response.status_code == 200:
                data = response.json()
                token = data.get('token')
                user = data.get('user', {})
                print(f"✅ {role_name} authentication successful: {user.get('email')} (role: {user.get('role')})")
                return token
            else:
                print(f"❌ {role_name} authentication failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ {role_name} authentication error: {str(e)}")
            return None
    
    def test_admin_labs_list(self):
        """Test GET /api/admin/labs - Admin Labs List API"""
        print("\n🧪 Testing Admin Labs List API...")
        
        # Test with admin token
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BASE_URL}/admin/labs", headers=headers)
            
            if response.status_code == 200:
                labs = response.json()  # Direct array response
                print(f"✅ Admin labs list successful: Found {len(labs)} labs")
                
                # Check for required stats fields
                for lab in labs:
                    stats = lab.get('stats', {})
                    required_fields = ['totalRequests', 'pendingRequests', 'completedRequests', 'totalReports']
                    missing_fields = [field for field in required_fields if field not in stats]
                    if missing_fields:
                        print(f"⚠️  Lab {lab.get('name', 'unknown')} missing stats fields: {missing_fields}")
                    else:
                        print(f"✅ Lab {lab.get('name', 'unknown')} has all required stats: {stats}")
                        
                # Store first lab ID for later tests
                if labs:
                    self.lab_id = labs[0].get('id')
                    print(f"📝 Using lab ID for tests: {self.lab_id}")
                    
            else:
                print(f"❌ Admin labs list failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Admin labs list error: {str(e)}")
        
        # Test without auth - should return 403
        try:
            response = requests.get(f"{BASE_URL}/admin/labs")
            if response.status_code == 403:
                print("✅ Unauthorized access correctly blocked (403)")
            else:
                print(f"⚠️  Expected 403 for unauthorized access, got {response.status_code}")
        except Exception as e:
            print(f"❌ Unauthorized test error: {str(e)}")
            
        # Test with clinic token - should return 403
        try:
            headers = {"Authorization": f"Bearer {self.clinic_token}"}
            response = requests.get(f"{BASE_URL}/admin/labs", headers=headers)
            if response.status_code == 403:
                print("✅ Clinic access correctly blocked (403)")
            else:
                print(f"⚠️  Expected 403 for clinic access, got {response.status_code}")
        except Exception as e:
            print(f"❌ Clinic access test error: {str(e)}")
    
    def test_admin_lab_requests_overview(self):
        """Test GET /api/admin/lab-requests - Admin Lab Requests Overview"""
        print("\n🧪 Testing Admin Lab Requests Overview API...")
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BASE_URL}/admin/lab-requests", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                requests_list = data.get('requests', [])
                stats = data.get('stats', {})
                
                print(f"✅ Admin lab requests overview successful: {len(requests_list)} requests")
                
                # Check required stats fields
                required_stats = ['total', 'pending', 'reportReady', 'completed']
                missing_stats = [field for field in required_stats if field not in stats]
                if missing_stats:
                    print(f"⚠️  Missing stats fields: {missing_stats}")
                else:
                    print(f"✅ All required stats present: {stats}")
                    
            else:
                print(f"❌ Admin lab requests overview failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Admin lab requests overview error: {str(e)}")
        
        # Test without auth - should return 403
        try:
            response = requests.get(f"{BASE_URL}/admin/lab-requests")
            if response.status_code == 403:
                print("✅ Unauthorized access correctly blocked (403)")
            else:
                print(f"⚠️  Expected 403 for unauthorized access, got {response.status_code}")
        except Exception as e:
            print(f"❌ Unauthorized test error: {str(e)}")
    
    def test_admin_lab_integration_config(self):
        """Test POST /api/admin/labs/integration - Admin Lab Integration Config"""
        print("\n🧪 Testing Admin Lab Integration Config API...")
        
        if not self.lab_id:
            print("❌ No lab ID available for integration test")
            return
            
        # Test successful integration config with custom webhook secret
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            self.webhook_secret = "test_webhook_secret_12345"  # Use a known secret for testing
            integration_data = {
                "labId": self.lab_id,
                "integrationType": "webhook",
                "webhookSecret": self.webhook_secret,
                "autoSync": True,
                "examTypeMapping": {
                    "blood_test": "Esame del sangue",
                    "urine_test": "Esame delle urine",
                    "xray": "Radiografia"
                }
            }
            
            response = requests.post(f"{BASE_URL}/admin/labs/integration", 
                                   headers=headers, json=integration_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.integration_id = data.get('integrationId')
                    print(f"✅ Lab integration config successful: {self.integration_id}")
                    print(f"📝 Webhook secret set for testing: {self.webhook_secret}")
                else:
                    print(f"⚠️  Integration config returned success=false: {data}")
            else:
                print(f"❌ Lab integration config failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Lab integration config error: {str(e)}")
        
        # Test without labId - should return 400
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.post(f"{BASE_URL}/admin/labs/integration", 
                                   headers=headers, json={"integrationType": "webhook"})
            if response.status_code == 400:
                print("✅ Missing labId correctly rejected (400)")
            else:
                print(f"⚠️  Expected 400 for missing labId, got {response.status_code}")
        except Exception as e:
            print(f"❌ Missing labId test error: {str(e)}")
            
        # Test without admin auth - should return 401 or 403
        try:
            response = requests.post(f"{BASE_URL}/admin/labs/integration", 
                                   json={"labId": self.lab_id, "integrationType": "webhook"})
            if response.status_code in [401, 403]:
                print(f"✅ Unauthorized access correctly blocked ({response.status_code})")
            else:
                print(f"⚠️  Expected 401/403 for unauthorized access, got {response.status_code}")
        except Exception as e:
            print(f"❌ Unauthorized test error: {str(e)}")
    
    def test_webhook_lab_results(self):
        """Test POST /api/webhooks/lab-results - Webhook Lab Results"""
        print("\n🧪 Testing Webhook Lab Results API...")
        
        # Test without x-webhook-secret header - should return 401
        try:
            webhook_data = {
                "requestId": str(uuid.uuid4()),
                "results": {
                    "test_type": "blood_test",
                    "values": {"glucose": "95 mg/dl", "cholesterol": "180 mg/dl"}
                }
            }
            
            response = requests.post(f"{BASE_URL}/webhooks/lab-results", json=webhook_data)
            if response.status_code == 401 and "Webhook secret mancante" in response.text:
                print("✅ Missing webhook secret correctly rejected (401)")
            else:
                print(f"⚠️  Expected 401 'Webhook secret mancante', got {response.status_code}: {response.text}")
        except Exception as e:
            print(f"❌ Missing webhook secret test error: {str(e)}")
        
        # Test with invalid x-webhook-secret - should return 401
        try:
            headers = {"x-webhook-secret": "invalid_secret"}
            response = requests.post(f"{BASE_URL}/webhooks/lab-results", 
                                   headers=headers, json=webhook_data)
            if response.status_code == 401 and "Webhook secret non valido" in response.text:
                print("✅ Invalid webhook secret correctly rejected (401)")
            else:
                print(f"⚠️  Expected 401 'Webhook secret non valido', got {response.status_code}: {response.text}")
        except Exception as e:
            print(f"❌ Invalid webhook secret test error: {str(e)}")
        
        # Test with valid secret and real request ID
        if self.webhook_secret:
            try:
                # First get a real lab request ID from the admin endpoint
                headers_admin = {"Authorization": f"Bearer {self.admin_token}"}
                response = requests.get(f"{BASE_URL}/admin/lab-requests", headers=headers_admin)
                
                real_request_id = None
                if response.status_code == 200:
                    data = response.json()
                    requests_list = data.get('requests', [])
                    if requests_list:
                        real_request_id = requests_list[0].get('id')
                        print(f"📝 Using real request ID for webhook test: {real_request_id}")
                
                headers = {"x-webhook-secret": self.webhook_secret}
                webhook_data = {
                    "requestId": real_request_id or str(uuid.uuid4()),
                    "results": {
                        "test_type": "blood_test",
                        "values": {"glucose": "95 mg/dl", "cholesterol": "180 mg/dl"},
                        "notes": "Test results from webhook integration"
                    }
                }
                
                response = requests.post(f"{BASE_URL}/webhooks/lab-results", 
                                       headers=headers, json=webhook_data)
                if response.status_code == 200:
                    print("✅ Valid webhook secret processed successfully")
                    data = response.json()
                    print(f"📝 Webhook response: {data}")
                else:
                    print(f"⚠️  Valid webhook processing failed: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"❌ Valid webhook test error: {str(e)}")
        else:
            print("⚠️  No webhook secret available for valid webhook test")
    
    def create_test_lab_request(self):
        """Create a test lab request for webhook testing"""
        try:
            headers = {"Authorization": f"Bearer {self.clinic_token}"}
            lab_request_data = {
                "petId": "f1f3b7d9-01fe-4955-b6c8-bdf183a62d28",  # Known pet ID from previous tests
                "labId": self.lab_id,
                "examType": "blood_test",
                "urgency": "normal",
                "clinicNotes": "Test lab request for webhook integration testing",
                "requestedTests": ["glucose", "cholesterol", "complete_blood_count"]
            }
            
            response = requests.post(f"{BASE_URL}/lab-requests", 
                                   headers=headers, json=lab_request_data)
            
            if response.status_code == 200:
                data = response.json()
                request_id = data.get('id')
                print(f"✅ Test lab request created: {request_id}")
                return request_id
            else:
                print(f"⚠️  Failed to create test lab request: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error creating test lab request: {str(e)}")
            return None
    
    def test_admin_approve_lab(self):
        """Test POST /api/admin/labs/approve - Admin Approve Lab"""
        print("\n🧪 Testing Admin Approve Lab API...")
        
        if not self.lab_id:
            print("❌ No lab ID available for approval test")
            return
            
        # Test successful lab approval
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            approval_data = {"labId": self.lab_id}
            
            response = requests.post(f"{BASE_URL}/admin/labs/approve", 
                                   headers=headers, json=approval_data)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Lab approval successful: {data}")
            else:
                print(f"❌ Lab approval failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Lab approval error: {str(e)}")
        
        # Test without admin token - should return 401
        try:
            response = requests.post(f"{BASE_URL}/admin/labs/approve", 
                                   json={"labId": self.lab_id})
            if response.status_code == 401:
                print("✅ Unauthorized approval correctly blocked (401)")
            else:
                print(f"⚠️  Expected 401 for unauthorized approval, got {response.status_code}")
        except Exception as e:
            print(f"❌ Unauthorized approval test error: {str(e)}")
    
    def run_all_tests(self):
        """Run all test scenarios"""
        print("🚀 Starting VetBuddy Admin Labs Management, Webhook, and Integration APIs Testing")
        print("=" * 80)
        
        # Step 1: Authenticate all users
        print("\n📋 Step 1: Authentication")
        self.admin_token = self.authenticate(ADMIN_EMAIL, ADMIN_PASSWORD, "Admin")
        self.clinic_token = self.authenticate(CLINIC_EMAIL, CLINIC_PASSWORD, "Clinic")
        self.lab_token = self.authenticate(LAB_EMAIL, LAB_PASSWORD, "Lab")
        
        if not self.admin_token:
            print("❌ Cannot proceed without admin authentication")
            return
        
        # Step 2: Test Admin Labs List API
        self.test_admin_labs_list()
        
        # Step 3: Test Admin Lab Requests Overview
        self.test_admin_lab_requests_overview()
        
        # Step 4: Test Admin Lab Integration Config
        self.test_admin_lab_integration_config()
        
        # Step 5: Test Webhook Lab Results
        self.test_webhook_lab_results()
        
        # Step 6: Test Admin Approve Lab
        self.test_admin_approve_lab()
        
        print("\n" + "=" * 80)
        print("🏁 VetBuddy Admin Labs APIs Testing Complete")

if __name__ == "__main__":
    tester = VetBuddyLabsAPITester()
    tester.run_all_tests()