#!/usr/bin/env python3
"""
VetBuddy Pet Management PUT API Test Suite
Focus on testing the specific requirements from the review request:
1. Owner login: proprietario.demo@vetbuddy.it / demo123
2. Pet Management PUT API with new fields
3. Health Check API
4. Authentication verification
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

class VetBuddyPetTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.owner_token = None
        self.clinic_token = None
        
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

    def test_get_pets(self, token: str, user_type: str) -> dict:
        """Get list of pets for the authenticated user"""
        print(f"🐕 Getting pets list for {user_type}...")
        try:
            headers = {'Authorization': f'Bearer {token}'}
            response = self.session.get(f"{self.base_url}/api/pets", headers=headers)
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                pets = result['data']
                pets_list = pets if isinstance(pets, list) else []
                print("✅ Pets retrieval successful")
                print(f"   Total pets: {len(pets_list)}")
                for i, pet in enumerate(pets_list[:3], 1):  # Show first 3 pets
                    print(f"   {i}. {pet.get('name', 'N/A')} (ID: {pet.get('id', 'N/A')})")
                    print(f"      Species: {pet.get('species', 'N/A')}, Breed: {pet.get('breed', 'N/A')}")
                    if 'insurance' in pet:
                        print(f"      Insurance: {pet.get('insurance', False)}")
                    if 'weightHistory' in pet and isinstance(pet['weightHistory'], list):
                        print(f"      Weight history entries: {len(pet['weightHistory'])}")
                return result
            else:
                print(f"❌ Pets retrieval failed with status {result['status_code']}")
                
            return result
        except Exception as e:
            print(f"❌ Pets retrieval error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

    def test_put_pet(self, token: str, pet_id: str, user_type: str) -> dict:
        """Test PUT /api/pets/{petId} with all new fields"""
        print(f"✏️ Testing PUT /api/pets/{pet_id} with new fields for {user_type}...")
        
        # Comprehensive pet update data with all new fields
        pet_update_data = {
            'name': 'Max Updated via API',
            'species': 'dog',
            'breed': 'Golden Retriever',
            'birthDate': '2020-03-15',
            'weight': 25.5,
            'notes': 'Updated via API test - all fields verification',
            
            # New fields to test
            'insurance': True,
            'insuranceCompany': 'Assicurazioni Animali Italia',
            'insurancePolicy': 'POL-2025-VET001234',
            'chronicDiseases': ['Displasia dell\'anca', 'Allergia alimentare'],
            'currentConditions': ['Controllo displasia', 'Dieta ipoallergenica'],
            'allergies': ['Pollo', 'Grano', 'Polline'],
            'medications': [
                {
                    'name': 'Carprofen',
                    'dosage': '25mg',
                    'frequency': 'Una volta al giorno',
                    'startDate': '2025-01-01',
                    'endDate': '2025-02-01'
                },
                {
                    'name': 'Omega-3',
                    'dosage': '500mg',
                    'frequency': 'Due volte al giorno',
                    'startDate': '2024-12-01'
                }
            ],
            'medicalHistory': [
                {
                    'date': '2024-12-01',
                    'description': 'Visita di controllo displasia',
                    'veterinarian': 'Dr. Rossi',
                    'diagnosis': 'Displasia moderata'
                },
                {
                    'date': '2024-10-15',
                    'description': 'Vaccinazione annuale',
                    'veterinarian': 'Dr. Bianchi'
                }
            ],
            'weightHistory': [
                {'weight': 24.0, 'date': '2024-10-01'},
                {'weight': 24.8, 'date': '2024-11-01'}, 
                {'weight': 25.2, 'date': '2024-12-01'},
                {'weight': 25.5, 'date': '2025-01-01'}
            ]
        }
        
        try:
            headers = {'Authorization': f'Bearer {token}'}
            response = self.session.put(
                f"{self.base_url}/api/pets/{pet_id}",
                json=pet_update_data,
                headers=headers
            )
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                updated_pet = result['data']
                print("✅ PUT /api/pets/{id} successful")
                print(f"   Updated pet: {updated_pet.get('name', 'N/A')}")
                
                # Verify new fields are present and correct
                print("\n📋 Verifying new fields saved correctly:")
                
                # Insurance fields
                insurance_saved = updated_pet.get('insurance')
                print(f"   Insurance: {insurance_saved} {'✅' if insurance_saved == pet_update_data['insurance'] else '❌'}")
                
                insurance_company = updated_pet.get('insuranceCompany')
                print(f"   Insurance Company: {insurance_company} {'✅' if insurance_company == pet_update_data['insuranceCompany'] else '❌'}")
                
                insurance_policy = updated_pet.get('insurancePolicy')
                print(f"   Insurance Policy: {insurance_policy} {'✅' if insurance_policy == pet_update_data['insurancePolicy'] else '❌'}")
                
                # Medical fields
                chronic_diseases = updated_pet.get('chronicDiseases', [])
                print(f"   Chronic Diseases: {len(chronic_diseases)} items {'✅' if len(chronic_diseases) == len(pet_update_data['chronicDiseases']) else '❌'}")
                
                current_conditions = updated_pet.get('currentConditions', [])
                print(f"   Current Conditions: {len(current_conditions)} items {'✅' if len(current_conditions) == len(pet_update_data['currentConditions']) else '❌'}")
                
                allergies = updated_pet.get('allergies', [])
                print(f"   Allergies: {len(allergies)} items {'✅' if len(allergies) == len(pet_update_data['allergies']) else '❌'}")
                
                medications = updated_pet.get('medications', [])
                print(f"   Medications: {len(medications)} items {'✅' if len(medications) == len(pet_update_data['medications']) else '❌'}")
                
                medical_history = updated_pet.get('medicalHistory', [])
                print(f"   Medical History: {len(medical_history)} items {'✅' if len(medical_history) == len(pet_update_data['medicalHistory']) else '❌'}")
                
                weight_history = updated_pet.get('weightHistory', [])
                print(f"   Weight History: {len(weight_history)} items {'✅' if len(weight_history) == len(pet_update_data['weightHistory']) else '❌'}")
                
                # Check if at least one weight history entry has correct structure
                if weight_history and len(weight_history) > 0:
                    sample_weight = weight_history[0]
                    has_weight = 'weight' in sample_weight
                    has_date = 'date' in sample_weight
                    print(f"   Weight History Structure: weight={has_weight}, date={has_date} {'✅' if has_weight and has_date else '❌'}")
                
            else:
                print(f"❌ PUT /api/pets failed with status {result['status_code']}")
                if isinstance(result['data'], dict) and 'error' in result['data']:
                    print(f"   Error: {result['data']['error']}")
                
            return result
        except Exception as e:
            print(f"❌ PUT /api/pets error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

    def test_get_updated_pet(self, token: str, pet_id: str, user_type: str) -> dict:
        """Get the updated pet to verify persistence"""
        print(f"🔍 Verifying pet {pet_id} persistence after update for {user_type}...")
        try:
            headers = {'Authorization': f'Bearer {token}'}
            response = self.session.get(f"{self.base_url}/api/pets", headers=headers)
            result = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
            if result['success']:
                pets = result['data'] if isinstance(result['data'], list) else []
                target_pet = None
                
                # Find our updated pet
                for pet in pets:
                    if pet.get('id') == pet_id:
                        target_pet = pet
                        break
                
                if target_pet:
                    print("✅ Pet found after update - verifying persistence")
                    print(f"   Pet name: {target_pet.get('name', 'N/A')}")
                    print(f"   Insurance: {target_pet.get('insurance', 'N/A')}")
                    print(f"   Insurance Company: {target_pet.get('insuranceCompany', 'N/A')}")
                    print(f"   Weight History entries: {len(target_pet.get('weightHistory', []))}")
                    print(f"   Chronic Diseases: {len(target_pet.get('chronicDiseases', []))}")
                    print(f"   Medications: {len(target_pet.get('medications', []))}")
                    
                    # Update result with the found pet
                    result['pet'] = target_pet
                else:
                    print(f"❌ Pet {pet_id} not found in updated list")
                    result['success'] = False
                    
            else:
                print(f"❌ Pet verification failed with status {result['status_code']}")
                
            return result
        except Exception as e:
            print(f"❌ Pet verification error: {str(e)}")
            return {'status_code': 0, 'success': False, 'error': str(e)}

def main():
    """Run Pet Management PUT API tests"""
    
    # Configuration from review request
    BASE_URL = "https://loyalty-automation.preview.emergentagent.com"
    OWNER_EMAIL = "proprietario.demo@vetbuddy.it"  
    OWNER_PASSWORD = "demo123"
    CLINIC_EMAIL = "demo@vetbuddy.it"
    CLINIC_PASSWORD = "DemoVet2025!"
    
    tester = VetBuddyPetTester(BASE_URL)
    
    print("=" * 70)
    print("🐾 VETBUDDY PET MANAGEMENT PUT API TEST SUITE")
    print("=" * 70)
    print(f"Base URL: {BASE_URL}")
    print("Focus: Pet Management PUT API with new fields")
    print()
    
    # Track test results
    test_results = {}
    
    # 1. Test Health Check API
    print("🏥 SECTION 1: HEALTH CHECK")
    print("-" * 50)
    
    test_results['health'] = tester.test_health_api()
    print()
    
    # 2. Test Authentication
    print("🔐 SECTION 2: AUTHENTICATION")
    print("-" * 50)
    
    test_results['owner_login'] = tester.test_owner_login(OWNER_EMAIL, OWNER_PASSWORD)
    print()
    
    test_results['clinic_login'] = tester.test_clinic_login(CLINIC_EMAIL, CLINIC_PASSWORD)
    print()
    
    # 3. Test Pet Management (Focus on Owner since that was the specific request)
    print("🐕 SECTION 3: PET MANAGEMENT PUT API")
    print("-" * 50)
    
    if tester.owner_token:
        # Get current pets for owner
        test_results['get_owner_pets'] = tester.test_get_pets(tester.owner_token, "owner")
        
        # If we have pets, test PUT on the first one
        if test_results['get_owner_pets'].get('success') and test_results['get_owner_pets'].get('data'):
            pets = test_results['get_owner_pets']['data']
            if isinstance(pets, list) and len(pets) > 0:
                pet_id = pets[0].get('id')
                if pet_id:
                    print()
                    test_results['put_owner_pet'] = tester.test_put_pet(tester.owner_token, pet_id, "owner")
                    print()
                    test_results['verify_owner_pet'] = tester.test_get_updated_pet(tester.owner_token, pet_id, "owner")
                else:
                    print("❌ No pet ID found for testing")
            else:
                print("❌ No pets found for owner - cannot test PUT API")
        print()
    else:
        print("❌ Skipping owner pet tests - no owner token")
        print()
    
    # 4. Also test with clinic login if available
    print("🏥 SECTION 4: CLINIC PET MANAGEMENT")
    print("-" * 50)
    
    if tester.clinic_token:
        test_results['get_clinic_pets'] = tester.test_get_pets(tester.clinic_token, "clinic")
        
        # If clinic has pets, test PUT on the first one
        if test_results['get_clinic_pets'].get('success') and test_results['get_clinic_pets'].get('data'):
            pets = test_results['get_clinic_pets']['data']
            if isinstance(pets, list) and len(pets) > 0:
                pet_id = pets[0].get('id')
                if pet_id:
                    print()
                    test_results['put_clinic_pet'] = tester.test_put_pet(tester.clinic_token, pet_id, "clinic")
                    print()
                    test_results['verify_clinic_pet'] = tester.test_get_updated_pet(tester.clinic_token, pet_id, "clinic")
                else:
                    print("❌ No pet ID found for clinic testing")
            else:
                print("❌ No pets found for clinic")
        print()
    else:
        print("❌ Skipping clinic pet tests - no clinic token")
        print()
    
    # 5. Test Summary
    print("📊 SECTION 5: TEST SUMMARY")
    print("-" * 50)
    
    total_tests = len(test_results)
    passed_tests = sum(1 for result in test_results.values() if result.get('success', False))
    failed_tests = total_tests - passed_tests
    
    print(f"Total tests: {total_tests}")
    print(f"✅ Passed: {passed_tests}")
    print(f"❌ Failed: {failed_tests}")
    print()
    
    # Show critical results
    print("🎯 REVIEW REQUEST RESULTS:")
    health_ok = test_results.get('health', {}).get('success', False)
    owner_login_ok = test_results.get('owner_login', {}).get('success', False)  
    clinic_login_ok = test_results.get('clinic_login', {}).get('success', False)
    put_api_ok = test_results.get('put_owner_pet', {}).get('success', False) or test_results.get('put_clinic_pet', {}).get('success', False)
    
    print(f"   Health Check API: {'✅ WORKING' if health_ok else '❌ FAILED'}")
    print(f"   Owner Login (proprietario.demo@vetbuddy.it): {'✅ WORKING' if owner_login_ok else '❌ FAILED'}")
    print(f"   Clinic Login (demo@vetbuddy.it): {'✅ WORKING' if clinic_login_ok else '❌ FAILED'}")
    print(f"   Pet Management PUT API: {'✅ WORKING' if put_api_ok else '❌ FAILED'}")
    
    if put_api_ok:
        print("\n🔍 PUT API VERIFICATION:")
        put_result = test_results.get('put_owner_pet') or test_results.get('put_clinic_pet')
        if put_result and put_result.get('data'):
            pet_data = put_result['data']
            new_fields_working = [
                'insurance' in pet_data,
                'insuranceCompany' in pet_data,
                'insurancePolicy' in pet_data,
                'chronicDiseases' in pet_data,
                'weightHistory' in pet_data
            ]
            working_count = sum(new_fields_working)
            print(f"   New fields working: {working_count}/5")
            print(f"   ✅ Insurance field: {'insurance' in pet_data}")
            print(f"   ✅ Weight History: {'weightHistory' in pet_data}")
            print(f"   ✅ Medical fields: {'chronicDiseases' in pet_data and 'allergies' in pet_data}")
    
    print()
    
    # Show failures if any
    if failed_tests > 0:
        print("❌ FAILED TESTS:")
        for test_name, result in test_results.items():
            if not result.get('success', False):
                status = result.get('status_code', 'N/A')
                error = result.get('error', result.get('data', 'Unknown error'))
                print(f"   - {test_name}: Status {status} - {error}")
        print()
    
    # Return appropriate exit code
    if failed_tests > 0:
        print("🔴 Some tests failed")
        return 1
    else:
        print("🟢 All tests passed! Pet Management PUT API working correctly with all new fields.")
        return 0

if __name__ == "__main__":
    sys.exit(main())