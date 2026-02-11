#!/usr/bin/env python3
"""
VetBuddy API Backend Testing Suite
Tests all API endpoints for the veterinary clinic management system.
"""

import requests
import json
import sys
import os
from typing import Dict, Any, Optional

# Base URL from environment
BASE_URL = "https://clinic-admin-test.preview.emergentagent.com/api"

class VetBuddyAPITest:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.user_data = None
        self.test_data = {}
        
    def log(self, message: str):
        """Log test messages"""
        print(f"🧪 {message}")
        
    def error(self, message: str):
        """Log error messages"""
        print(f"❌ ERROR: {message}")
        
    def success(self, message: str):
        """Log success messages"""
        print(f"✅ SUCCESS: {message}")
        
    def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None) -> Dict[str, Any]:
        """Make HTTP request to API"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        request_headers = {"Content-Type": "application/json"}
        
        if headers:
            request_headers.update(headers)
            
        if self.token:
            request_headers["Authorization"] = f"Bearer {self.token}"
            
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=request_headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=request_headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=request_headers, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=request_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return {
                "status_code": response.status_code,
                "data": response.json() if response.text else {},
                "success": 200 <= response.status_code < 300
            }
        except requests.exceptions.RequestException as e:
            return {
                "status_code": 0,
                "data": {"error": str(e)},
                "success": False
            }
        except json.JSONDecodeError:
            return {
                "status_code": response.status_code,
                "data": {"error": "Invalid JSON response", "text": response.text},
                "success": False
            }
    
    def test_health_check(self) -> bool:
        """Test health check endpoint"""
        self.log("Testing health check endpoint...")
        
        try:
            response = self.make_request("GET", "/health")
            
            if not response["success"]:
                self.error(f"Health check failed with status {response['status_code']}: {response['data']}")
                return False
                
            data = response["data"]
            if data.get("status") != "ok" or "VetBuddy" not in data.get("app", ""):
                self.error(f"Health check returned unexpected data: {data}")
                return False
                
            self.success("Health check endpoint working correctly")
            return True
            
        except Exception as e:
            self.error(f"Health check test failed: {str(e)}")
            return False
    
    def test_register(self) -> bool:
        """Test user registration"""
        self.log("Testing user registration...")
        
        try:
            user_data = {
                "email": "testclinic@example.com",
                "password": "SecurePass123!",
                "name": "Test Veterinary Clinic",
                "role": "clinic",
                "clinicName": "Test Vet Clinic",
                "phone": "+1234567890",
                "address": "123 Main Street, Test City"
            }
            
            response = self.make_request("POST", "/auth/register", user_data)
            
            if not response["success"]:
                self.error(f"Registration failed with status {response['status_code']}: {response['data']}")
                return False
                
            data = response["data"]
            if not data.get("token") or not data.get("user"):
                self.error(f"Registration response missing token or user: {data}")
                return False
                
            # Store for later tests
            self.token = data["token"]
            self.user_data = data["user"]
            self.test_data["clinic_id"] = data["user"]["id"]
            
            self.success(f"User registration successful. User ID: {self.user_data['id']}")
            return True
            
        except Exception as e:
            self.error(f"Registration test failed: {str(e)}")
            return False
    
    def test_login(self) -> bool:
        """Test user login"""
        self.log("Testing user login...")
        
        try:
            login_data = {
                "email": "testclinic@example.com",
                "password": "SecurePass123!"
            }
            
            response = self.make_request("POST", "/auth/login", login_data)
            
            if not response["success"]:
                self.error(f"Login failed with status {response['status_code']}: {response['data']}")
                return False
                
            data = response["data"]
            if not data.get("token") or not data.get("user"):
                self.error(f"Login response missing token or user: {data}")
                return False
                
            # Update token
            self.token = data["token"]
            self.success("User login successful")
            return True
            
        except Exception as e:
            self.error(f"Login test failed: {str(e)}")
            return False
    
    def test_auth_me(self) -> bool:
        """Test get current user endpoint"""
        self.log("Testing get current user...")
        
        try:
            response = self.make_request("GET", "/auth/me")
            
            if not response["success"]:
                self.error(f"Get current user failed with status {response['status_code']}: {response['data']}")
                return False
                
            data = response["data"]
            if not data.get("id") or data["role"] != "clinic":
                self.error(f"Get current user returned unexpected data: {data}")
                return False
                
            self.success("Get current user endpoint working correctly")
            return True
            
        except Exception as e:
            self.error(f"Get current user test failed: {str(e)}")
            return False
    
    def test_create_appointment(self) -> bool:
        """Test creating an appointment"""
        self.log("Testing appointment creation...")
        
        try:
            appointment_data = {
                "petName": "Buddy",
                "ownerName": "John Smith",
                "date": "2025-01-15",
                "time": "10:30",
                "reason": "Annual vaccination",
                "notes": "First time visit"
            }
            
            response = self.make_request("POST", "/appointments", appointment_data)
            
            if not response["success"]:
                self.error(f"Appointment creation failed with status {response['status_code']}: {response['data']}")
                return False
                
            data = response["data"]
            if not data.get("id") or data["petName"] != "Buddy":
                self.error(f"Appointment creation returned unexpected data: {data}")
                return False
                
            self.test_data["appointment_id"] = data["id"]
            self.success(f"Appointment created successfully. ID: {data['id']}")
            return True
            
        except Exception as e:
            self.error(f"Appointment creation test failed: {str(e)}")
            return False
    
    def test_list_appointments(self) -> bool:
        """Test listing appointments"""
        self.log("Testing appointment listing...")
        
        try:
            response = self.make_request("GET", "/appointments")
            
            if not response["success"]:
                self.error(f"Appointment listing failed with status {response['status_code']}: {response['data']}")
                return False
                
            data = response["data"]
            if not isinstance(data, list):
                self.error(f"Appointment listing should return a list: {data}")
                return False
                
            # Should have at least the appointment we created
            if len(data) == 0:
                self.error("No appointments found after creating one")
                return False
                
            self.success(f"Appointment listing successful. Found {len(data)} appointments")
            return True
            
        except Exception as e:
            self.error(f"Appointment listing test failed: {str(e)}")
            return False
    
    def test_create_document(self) -> bool:
        """Test creating a document"""
        self.log("Testing document creation...")
        
        try:
            document_data = {
                "name": "Vaccination Certificate",
                "type": "vaccination",
                "content": "Vaccination certificate content for Buddy",
                "petName": "Buddy"
            }
            
            response = self.make_request("POST", "/documents", document_data)
            
            if not response["success"]:
                self.error(f"Document creation failed with status {response['status_code']}: {response['data']}")
                return False
                
            data = response["data"]
            if not data.get("id") or data["name"] != "Vaccination Certificate":
                self.error(f"Document creation returned unexpected data: {data}")
                return False
                
            self.test_data["document_id"] = data["id"]
            self.success(f"Document created successfully. ID: {data['id']}")
            return True
            
        except Exception as e:
            self.error(f"Document creation test failed: {str(e)}")
            return False
    
    def test_list_documents(self) -> bool:
        """Test listing documents"""
        self.log("Testing document listing...")
        
        try:
            response = self.make_request("GET", "/documents")
            
            if not response["success"]:
                self.error(f"Document listing failed with status {response['status_code']}: {response['data']}")
                return False
                
            data = response["data"]
            if not isinstance(data, list):
                self.error(f"Document listing should return a list: {data}")
                return False
                
            self.success(f"Document listing successful. Found {len(data)} documents")
            return True
            
        except Exception as e:
            self.error(f"Document listing test failed: {str(e)}")
            return False
    
    def test_send_document_email(self) -> bool:
        """Test sending document via email (MOCK mode)"""
        self.log("Testing document email sending...")
        
        try:
            if "document_id" not in self.test_data:
                self.error("No document ID available for email test")
                return False
                
            email_data = {
                "documentId": self.test_data["document_id"],
                "recipientEmail": "owner@example.com"
            }
            
            response = self.make_request("POST", "/documents/send-email", email_data)
            
            if not response["success"]:
                self.error(f"Document email sending failed with status {response['status_code']}: {response['data']}")
                return False
                
            data = response["data"]
            if not data.get("success"):
                self.error(f"Document email sending returned failure: {data}")
                return False
                
            self.success("Document email sending successful (MOCK mode)")
            return True
            
        except Exception as e:
            self.error(f"Document email sending test failed: {str(e)}")
            return False
    
    def test_create_staff(self) -> bool:
        """Test creating staff member"""
        self.log("Testing staff creation...")
        
        try:
            staff_data = {
                "name": "Dr. Sarah Johnson",
                "role": "vet",
                "email": "sarah.johnson@testclinic.com",
                "phone": "+1234567891"
            }
            
            response = self.make_request("POST", "/staff", staff_data)
            
            if not response["success"]:
                self.error(f"Staff creation failed with status {response['status_code']}: {response['data']}")
                return False
                
            data = response["data"]
            if not data.get("id") or data["name"] != "Dr. Sarah Johnson":
                self.error(f"Staff creation returned unexpected data: {data}")
                return False
                
            self.test_data["staff_id"] = data["id"]
            self.success(f"Staff member created successfully. ID: {data['id']}")
            return True
            
        except Exception as e:
            self.error(f"Staff creation test failed: {str(e)}")
            return False
    
    def test_list_staff(self) -> bool:
        """Test listing staff members"""
        self.log("Testing staff listing...")
        
        try:
            response = self.make_request("GET", "/staff")
            
            if not response["success"]:
                self.error(f"Staff listing failed with status {response['status_code']}: {response['data']}")
                return False
                
            data = response["data"]
            if not isinstance(data, list):
                self.error(f"Staff listing should return a list: {data}")
                return False
                
            self.success(f"Staff listing successful. Found {len(data)} staff members")
            return True
            
        except Exception as e:
            self.error(f"Staff listing test failed: {str(e)}")
            return False
    
    def test_create_pet(self) -> bool:
        """Test creating a pet"""
        self.log("Testing pet creation...")
        
        try:
            pet_data = {
                "name": "Buddy",
                "species": "dog",
                "breed": "Golden Retriever",
                "birthDate": "2020-05-15",
                "weight": "28.5",
                "notes": "Very friendly dog, loves treats"
            }
            
            response = self.make_request("POST", "/pets", pet_data)
            
            if not response["success"]:
                self.error(f"Pet creation failed with status {response['status_code']}: {response['data']}")
                return False
                
            data = response["data"]
            if not data.get("id") or data["name"] != "Buddy":
                self.error(f"Pet creation returned unexpected data: {data}")
                return False
                
            self.test_data["pet_id"] = data["id"]
            self.success(f"Pet created successfully. ID: {data['id']}")
            return True
            
        except Exception as e:
            self.error(f"Pet creation test failed: {str(e)}")
            return False
    
    def test_list_pets(self) -> bool:
        """Test listing pets"""
        self.log("Testing pet listing...")
        
        try:
            response = self.make_request("GET", "/pets")
            
            if not response["success"]:
                self.error(f"Pet listing failed with status {response['status_code']}: {response['data']}")
                return False
                
            data = response["data"]
            if not isinstance(data, list):
                self.error(f"Pet listing should return a list: {data}")
                return False
                
            self.success(f"Pet listing successful. Found {len(data)} pets")
            return True
            
        except Exception as e:
            self.error(f"Pet listing test failed: {str(e)}")
            return False
    
    def test_authentication_required(self) -> bool:
        """Test that authentication is required for protected endpoints"""
        self.log("Testing authentication requirements...")
        
        try:
            # Save current token
            saved_token = self.token
            self.token = None
            
            # Test protected endpoint without token
            response = self.make_request("GET", "/appointments")
            
            if response["status_code"] != 401:
                self.error(f"Expected 401 for unauthenticated request, got {response['status_code']}")
                self.token = saved_token
                return False
            
            # Test with invalid token
            self.token = "invalid_token"
            response = self.make_request("GET", "/appointments")
            
            if response["status_code"] != 401:
                self.error(f"Expected 401 for invalid token, got {response['status_code']}")
                self.token = saved_token
                return False
            
            # Restore valid token
            self.token = saved_token
            
            self.success("Authentication requirements working correctly")
            return True
            
        except Exception as e:
            self.error(f"Authentication requirements test failed: {str(e)}")
            # Restore token even on error
            if saved_token:
                self.token = saved_token
            return False
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🏥 Starting VetBuddy API Backend Tests")
        print("=" * 50)
        
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_register),
            ("User Login", self.test_login),
            ("Get Current User", self.test_auth_me),
            ("Create Appointment", self.test_create_appointment),
            ("List Appointments", self.test_list_appointments),
            ("Create Document", self.test_create_document),
            ("List Documents", self.test_list_documents),
            ("Send Document Email", self.test_send_document_email),
            ("Create Staff", self.test_create_staff),
            ("List Staff", self.test_list_staff),
            ("Create Pet", self.test_create_pet),
            ("List Pets", self.test_list_pets),
            ("Authentication Requirements", self.test_authentication_required),
        ]
        
        passed = 0
        total = len(tests)
        failed_tests = []
        
        for test_name, test_func in tests:
            print(f"\n🔍 Running: {test_name}")
            print("-" * 30)
            
            try:
                if test_func():
                    passed += 1
                else:
                    failed_tests.append(test_name)
            except Exception as e:
                self.error(f"Test '{test_name}' crashed: {str(e)}")
                failed_tests.append(test_name)
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   • {test}")
        else:
            print(f"\n🎉 All tests passed!")
        
        return passed == total

if __name__ == "__main__":
    try:
        print(f"🌐 Using API Base URL: {BASE_URL}")
        
        tester = VetBuddyAPITest()
        success = tester.run_all_tests()
        
        if success:
            print("\n✅ All backend API tests completed successfully!")
            sys.exit(0)
        else:
            print("\n❌ Some backend API tests failed!")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⏹️ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test suite crashed: {str(e)}")
        sys.exit(1)