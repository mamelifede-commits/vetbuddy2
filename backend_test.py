#!/usr/bin/env python3
"""
VetBuddy Backend API Test Suite
Test all backend APIs focusing on:
1. Login & Authentication
2. Automazioni - Verifica personalizzazione email
3. Ricerca Cliniche
4. Feedback
5. API Generali
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

class VetBuddyAPITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.clinic_token = None
        self.owner_token = None
        
    def test_health_api(self) -> dict:
        """Test GET /api/health"""
        print("🏥 Testing Health API...")
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                print("✅ Health API working correctly")
                print(f"   Response: {result['data']}")
            else:
                print(f"❌ Health API failed with status {result['status_code']}")
                
            return result
        except Exception as e:
            print(f"❌ Health API error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}
    
    def test_services_api(self) -> dict:
        """Test GET /api/services"""
        print("🛠️ Testing Services API...")
        try:
            response = self.session.get(f"{self.base_url}/api/services")
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                services = result['data']
                categories = len(services.keys()) if isinstance(services, dict) else 0
                total_services = sum(len(cat.get('services', [])) for cat in services.values()) if isinstance(services, dict) else 0
                print("✅ Services API working correctly")
                print(f"   Categories: {categories}")
                print(f"   Total Services: {total_services}")
                print(f"   Sample categories: {list(services.keys())[:3] if isinstance(services, dict) else 'N/A'}")
            else:
                print(f"❌ Services API failed with status {result['status_code']}")
                
            return result
        except Exception as e:
            print(f"❌ Services API error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

    def test_clinic_login(self, email: str, password: str) -> dict:
        """Test clinic login"""
        print(f"🏥 Testing clinic login with {email}...")
        try:
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json={'email': email, 'password': password}
            )
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                self.clinic_token = result['data'].get('token')
                user_info = result['data'].get('user', {})
                print("✅ Clinic login successful")
                print(f"   User: {user_info.get('name', 'N/A')}")
                print(f"   Clinic: {user_info.get('clinicName', 'N/A')}")
                print(f"   Role: {user_info.get('role', 'N/A')}")
                print(f"   Token: {self.clinic_token[:20]}..." if self.clinic_token else "   No token received")
            else:
                print(f"❌ Clinic login failed with status {result['status_code']}")
                if isinstance(result['data'], dict) and 'error' in result['data']:
                    print(f"   Error: {result['data']['error']}")
                
            return result
        except Exception as e:
            print(f"❌ Clinic login error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

    def test_owner_login(self, email: str, password: str) -> dict:
        """Test owner login"""
        print(f"👤 Testing owner login with {email}...")
        try:
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json={'email': email, 'password': password}
            )
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                self.owner_token = result['data'].get('token')
                user_info = result['data'].get('user', {})
                print("✅ Owner login successful")
                print(f"   User: {user_info.get('name', 'N/A')}")
                print(f"   Role: {user_info.get('role', 'N/A')}")
                print(f"   Token: {self.owner_token[:20]}..." if self.owner_token else "   No token received")
            else:
                print(f"❌ Owner login failed with status {result['status_code']}")
                if isinstance(result['data'], dict) and 'error' in result['data']:
                    print(f"   Error: {result['data']['error']}")
                
            return result
        except Exception as e:
            print(f"❌ Owner login error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

    def test_auth_me(self, token: str, user_type: str) -> dict:
        """Test GET /api/auth/me with authentication"""
        print(f"🔐 Testing auth/me for {user_type}...")
        try:
            headers = {'Authorization': f'Bearer {token}'}
            response = self.session.get(f"{self.base_url}/api/auth/me", headers=headers)
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                user_info = result['data']
                print("✅ Auth/me working correctly")
                print(f"   User ID: {user_info.get('id', 'N/A')}")
                print(f"   Name: {user_info.get('name', 'N/A')}")
                print(f"   Role: {user_info.get('role', 'N/A')}")
                if user_info.get('role') == 'clinic':
                    print(f"   Clinic: {user_info.get('clinicName', 'N/A')}")
            else:
                print(f"❌ Auth/me failed with status {result['status_code']}")
                
            return result
        except Exception as e:
            print(f"❌ Auth/me error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

    def test_automation_settings(self, token: str) -> dict:
        """Test GET /api/automations/settings"""
        print("⚙️ Testing automation settings API...")
        try:
            headers = {'Authorization': f'Bearer {token}'}
            response = self.session.get(f"{self.base_url}/api/automations/settings", headers=headers)
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                settings_data = result['data']
                settings = settings_data.get('settings', {}) if isinstance(settings_data, dict) else {}
                total_settings = len(settings)
                enabled_count = sum(1 for v in settings.values() if v is True)
                print("✅ Automation settings API working correctly")
                print(f"   Total settings: {total_settings}")
                print(f"   Enabled: {enabled_count}")
                print(f"   Disabled: {total_settings - enabled_count}")
                print(f"   Sample settings: {list(settings.keys())[:5]}")
            else:
                print(f"❌ Automation settings failed with status {result['status_code']}")
                
            return result
        except Exception as e:
            print(f"❌ Automation settings error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

    def test_automation_toggle(self, token: str, key: str = 'appointmentReminders', enabled: bool = False) -> dict:
        """Test POST /api/automations/settings - toggle single setting"""
        print(f"🔄 Testing automation setting toggle ({key} = {enabled})...")
        try:
            headers = {'Authorization': f'Bearer {token}'}
            response = self.session.post(
                f"{self.base_url}/api/automations/settings",
                json={'key': key, 'enabled': enabled},
                headers=headers
            )
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                print("✅ Automation toggle working correctly")
                print(f"   Setting '{key}' set to: {enabled}")
            else:
                print(f"❌ Automation toggle failed with status {result['status_code']}")
                
            return result
        except Exception as e:
            print(f"❌ Automation toggle error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

    def test_cron_daily(self) -> dict:
        """Test GET /api/cron/daily"""
        print("⏰ Testing daily cron job API...")
        try:
            response = self.session.get(f"{self.base_url}/api/cron/daily")
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                cron_data = result['data']
                results = cron_data.get('results', {}) if isinstance(cron_data, dict) else {}
                print("✅ Daily cron API working correctly")
                print(f"   Success: {cron_data.get('success', False)}")
                print(f"   Automation categories: {len(results)}")
                
                # Show summary of each automation
                for category, stats in results.items():
                    if isinstance(stats, dict):
                        sent = stats.get('sent', 0)
                        errors = stats.get('errors', 0)
                        skipped = stats.get('skipped', 0)
                        print(f"   {category}: sent={sent}, errors={errors}, skipped={skipped}")
            else:
                print(f"❌ Daily cron failed with status {result['status_code']}")
                
            return result
        except Exception as e:
            print(f"❌ Daily cron error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

    def test_clinic_search(self) -> dict:
        """Test GET /api/clinics/search"""
        print("🔍 Testing clinic search API...")
        try:
            response = self.session.get(f"{self.base_url}/api/clinics/search")
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                clinics = result['data'] if isinstance(result['data'], list) else []
                print("✅ Clinic search API working correctly")
                print(f"   Total clinics found: {len(clinics)}")
                if clinics:
                    sample_clinic = clinics[0]
                    print(f"   Sample clinic: {sample_clinic.get('clinicName', 'N/A')}")
                    print(f"   Location: {sample_clinic.get('city', 'N/A')}")
                    print(f"   Rating: {sample_clinic.get('avgRating', 'N/A')}")
            else:
                print(f"❌ Clinic search failed with status {result['status_code']}")
                
            return result
        except Exception as e:
            print(f"❌ Clinic search error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

    def test_clinic_search_city_filter(self, city: str = "Milano") -> dict:
        """Test GET /api/clinics/search?city=Milano"""
        print(f"🏙️ Testing clinic search with city filter ({city})...")
        try:
            response = self.session.get(f"{self.base_url}/api/clinics/search?city={city}")
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                clinics = result['data'] if isinstance(result['data'], list) else []
                print("✅ Clinic search with city filter working correctly")
                print(f"   Clinics in {city}: {len(clinics)}")
                for clinic in clinics[:3]:  # Show first 3
                    print(f"   - {clinic.get('clinicName', 'N/A')} ({clinic.get('city', 'N/A')})")
            else:
                print(f"❌ Clinic search with city filter failed with status {result['status_code']}")
                
            return result
        except Exception as e:
            print(f"❌ Clinic search with city filter error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

    def test_feedback_submission(self, token: str) -> dict:
        """Test POST /api/feedback with clinic authentication"""
        print("💬 Testing feedback submission API...")
        try:
            headers = {'Authorization': f'Bearer {token}'}
            feedback_data = {
                'type': 'suggestion',
                'subject': 'Test Feedback da API Test',
                'message': 'Questo è un feedback di test inviato dalla suite di test automatici. Sistema funzionante correttamente!',
                'rating': 5
            }
            
            response = self.session.post(
                f"{self.base_url}/api/feedback",
                json=feedback_data,
                headers=headers
            )
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                feedback_response = result['data']
                print("✅ Feedback submission working correctly")
                print(f"   Success: {feedback_response.get('success', False)}")
                print(f"   Message: {feedback_response.get('message', 'N/A')}")
                print(f"   Feedback ID: {feedback_response.get('feedbackId', 'N/A')}")
            else:
                print(f"❌ Feedback submission failed with status {result['status_code']}")
                
            return result
        except Exception as e:
            print(f"❌ Feedback submission error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

    def test_feedback_unauthorized(self) -> dict:
        """Test POST /api/feedback without authentication"""
        print("🔒 Testing feedback submission without authentication...")
        try:
            feedback_data = {
                'type': 'bug',
                'message': 'Test unauthorized access'
            }
            
            response = self.session.post(
                f"{self.base_url}/api/feedback",
                json=feedback_data
            )
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 401,  # Should be unauthorized
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                print("✅ Feedback unauthorized access correctly blocked")
            else:
                print(f"❌ Feedback should return 401 but got {result['status_code']}")
                
            return result
        except Exception as e:
            print(f"❌ Feedback unauthorized test error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

def main():
    """Run all backend API tests"""
    
    # Configuration
    BASE_URL = "https://automation-verify.preview.emergentagent.com"
    CLINIC_EMAIL = "demo@vetbuddy.it"
    CLINIC_PASSWORD = "DemoVet2025!"
    OWNER_EMAIL = "proprietario.demo@vetbuddy.it"  
    OWNER_PASSWORD = "demo123"
    
    tester = VetBuddyAPITester(BASE_URL)
    
    print("=" * 60)
    print("🐾 VETBUDDY BACKEND API TEST SUITE")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print()
    
    # Track test results
    test_results = {}
    
    # 1. Test General APIs (no auth required)
    print("📋 SECTION 1: GENERAL APIs")
    print("-" * 40)
    
    test_results['health'] = tester.test_health_api()
    print()
    
    test_results['services'] = tester.test_services_api()
    print()
    
    test_results['clinic_search'] = tester.test_clinic_search()
    print()
    
    test_results['clinic_search_city'] = tester.test_clinic_search_city_filter("Milano")
    print()
    
    # 2. Test Authentication
    print("🔐 SECTION 2: AUTHENTICATION")
    print("-" * 40)
    
    test_results['clinic_login'] = tester.test_clinic_login(CLINIC_EMAIL, CLINIC_PASSWORD)
    print()
    
    test_results['owner_login'] = tester.test_owner_login(OWNER_EMAIL, OWNER_PASSWORD)
    print()
    
    # Test auth/me if we have tokens
    if tester.clinic_token:
        test_results['auth_me_clinic'] = tester.test_auth_me(tester.clinic_token, "clinic")
        print()
    
    if tester.owner_token:
        test_results['auth_me_owner'] = tester.test_auth_me(tester.owner_token, "owner")
        print()
    
    # 3. Test Automation APIs (clinic auth required)
    print("⚙️ SECTION 3: AUTOMATION APIs")
    print("-" * 40)
    
    if tester.clinic_token:
        test_results['automation_settings'] = tester.test_automation_settings(tester.clinic_token)
        print()
        
        test_results['automation_toggle'] = tester.test_automation_toggle(tester.clinic_token, 'appointmentReminders', False)
        print()
        
        # Test cron job (no auth required)
        test_results['cron_daily'] = tester.test_cron_daily()
        print()
    else:
        print("❌ Skipping automation tests - no clinic token")
        print()
    
    # 4. Test Feedback API
    print("💬 SECTION 4: FEEDBACK API")  
    print("-" * 40)
    
    test_results['feedback_unauthorized'] = tester.test_feedback_unauthorized()
    print()
    
    if tester.clinic_token:
        test_results['feedback_submission'] = tester.test_feedback_submission(tester.clinic_token)
        print()
    else:
        print("❌ Skipping feedback submission test - no clinic token")
        print()
    
    # 5. Test Summary
    print("📊 SECTION 5: TEST SUMMARY")
    print("-" * 40)
    
    total_tests = len(test_results)
    passed_tests = sum(1 for result in test_results.values() if result.get('success', False))
    failed_tests = total_tests - passed_tests
    
    print(f"Total tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    print()
    
    # Show failures
    if failed_tests > 0:
        print("❌ FAILED TESTS:")
        for test_name, result in test_results.items():
            if not result.get('success', False):
                status = result.get('status_code', 'N/A')
                error = result.get('error', result.get('data', 'Unknown error'))
                print(f"   - {test_name}: Status {status} - {error}")
        print()
    
    # Show successes
    if passed_tests > 0:
        print("✅ PASSED TESTS:")
        for test_name, result in test_results.items():
            if result.get('success', False):
                print(f"   - {test_name}")
        print()
    
    # Return appropriate exit code
    if failed_tests > 0:
        print("🔴 Some tests failed")
        return 1
    else:
        print("🟢 All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())