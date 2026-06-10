#!/usr/bin/env python3
"""
VetBuddy Backend API Testing Script
Tests the Preventivi Digitali (Estimates) API endpoints
"""

import requests
import json
import os
from datetime import datetime, timedelta

# Configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://clinic-report-review.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

# Test credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"

# Test data from database (created for estimates testing)
OWNER_ID = "7c56fdac-2082-447d-a28a-1736d8a0f73c"
PET_ID = "e5d6338e-e59e-49a4-abc8-26a1e5cb1b98"

# Global variables
clinic_token = None
created_estimate_id = None

def print_test_header(test_name):
    """Print a formatted test header"""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(success, message):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")

def login_clinic():
    """Login as clinic and get JWT token"""
    global clinic_token
    
    print_test_header("Clinic Authentication")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json={
                "email": CLINIC_EMAIL,
                "password": CLINIC_PASSWORD
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            clinic_token = data.get('token')
            print_result(True, f"Clinic login successful. Token: {clinic_token[:20]}...")
            return True
        else:
            print_result(False, f"Login failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"Login error: {str(e)}")
        return False

def test_estimates_authentication():
    """Test 1: Authentication Test - Verify clinic authentication required"""
    print_test_header("Test 1: Authentication Required")
    
    try:
        # Test without authentication
        response = requests.get(f"{API_URL}/estimates")
        
        if response.status_code == 401:
            print_result(True, "Unauthorized access correctly blocked (401)")
        else:
            print_result(False, f"Expected 401, got {response.status_code}")
            
        # Test with clinic authentication
        response = requests.get(
            f"{API_URL}/estimates",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code == 200:
            print_result(True, "Clinic authentication successful (200)")
            return True
        else:
            print_result(False, f"Clinic auth failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Authentication test error: {str(e)}")
        return False

def test_create_estimate():
    """Test 2: Create Estimate - POST /api/estimates"""
    global created_estimate_id
    
    print_test_header("Test 2: Create Estimate")
    
    try:
        # Prepare estimate data
        valid_until = (datetime.now() + timedelta(days=30)).isoformat()
        
        estimate_data = {
            "ownerId": OWNER_ID,
            "petId": PET_ID,
            "title": "Intervento Chirurgico",
            "description": "Sterilizzazione gatto",
            "items": [
                {"name": "Visita pre-operatoria", "quantity": 1, "price": 50},
                {"name": "Intervento chirurgico", "quantity": 1, "price": 180},
                {"name": "Medicazioni post-op", "quantity": 3, "price": 20}
            ],
            "subtotal": 290,
            "tax": 0,
            "discount": 0,
            "totalAmount": 290,
            "notes": "Include controllo post-operatorio gratuito",
            "validUntil": valid_until
        }
        
        response = requests.post(
            f"{API_URL}/estimates",
            json=estimate_data,
            headers={
                "Authorization": f"Bearer {clinic_token}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code == 201:
            data = response.json()
            created_estimate_id = data.get('id')
            
            # Verify response structure
            checks = [
                ('id' in data, "Estimate ID present"),
                (data.get('status') == 'draft', "Status is 'draft'"),
                (data.get('ownerId') == OWNER_ID, "Owner ID matches"),
                (data.get('petId') == PET_ID, "Pet ID matches"),
                (data.get('totalAmount') == 290, "Total amount correct"),
                (len(data.get('items', [])) == 3, "Items count correct"),
                ('createdAt' in data, "Created timestamp present"),
            ]
            
            all_passed = True
            for check, message in checks:
                print_result(check, message)
                if not check:
                    all_passed = False
            
            if all_passed:
                print(f"\n📝 Created Estimate ID: {created_estimate_id}")
                return True
            else:
                return False
        else:
            print_result(False, f"Create failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Create estimate error: {str(e)}")
        return False

def test_get_estimates_list():
    """Test 3: Get Estimates List - GET /api/estimates with analytics"""
    print_test_header("Test 3: Get Estimates List with Analytics")
    
    try:
        response = requests.get(
            f"{API_URL}/estimates",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify response structure
            checks = [
                ('estimates' in data, "Estimates array present"),
                ('analytics' in data, "Analytics object present"),
                ('generatedAt' in data, "Generated timestamp present"),
            ]
            
            # Verify analytics structure
            analytics = data.get('analytics', {})
            analytics_checks = [
                ('totalEstimates' in analytics, "totalEstimates field present"),
                ('statusCount' in analytics, "statusCount field present"),
                ('totalValue' in analytics, "totalValue field present"),
                ('acceptedValue' in analytics, "acceptedValue field present"),
                ('pendingValue' in analytics, "pendingValue field present"),
                ('conversionRate' in analytics, "conversionRate field present"),
                ('averageValue' in analytics, "averageValue field present"),
                ('estimatesNeedingFollowUp' in analytics, "estimatesNeedingFollowUp field present"),
                ('last30DaysStats' in analytics, "last30DaysStats field present"),
            ]
            
            # Verify statusCount structure
            status_count = analytics.get('statusCount', {})
            status_checks = [
                ('draft' in status_count, "draft count present"),
                ('sent' in status_count, "sent count present"),
                ('accepted' in status_count, "accepted count present"),
                ('declined' in status_count, "declined count present"),
                ('expired' in status_count, "expired count present"),
            ]
            
            all_passed = True
            for check, message in checks + analytics_checks + status_checks:
                print_result(check, message)
                if not check:
                    all_passed = False
            
            # Print analytics summary
            print(f"\n📊 Analytics Summary:")
            print(f"   Total Estimates: {analytics.get('totalEstimates', 0)}")
            print(f"   Status Count: {status_count}")
            print(f"   Total Value: €{analytics.get('totalValue', 0)}")
            print(f"   Conversion Rate: {analytics.get('conversionRate', 0)}%")
            print(f"   Estimates Needing Follow-up: {analytics.get('estimatesNeedingFollowUp', 0)}")
            
            return all_passed
        else:
            print_result(False, f"Get estimates failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Get estimates error: {str(e)}")
        return False

def test_send_estimate():
    """Test 4: Send Estimate - POST /api/estimates/{id}/send"""
    print_test_header("Test 4: Send Estimate")
    
    if not created_estimate_id:
        print_result(False, "No estimate ID available (create test may have failed)")
        return False
    
    try:
        response = requests.post(
            f"{API_URL}/estimates/{created_estimate_id}/send",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            
            checks = [
                (data.get('success') == True, "Success flag is true"),
                ('message' in data, "Message present"),
                (data.get('estimateId') == created_estimate_id, "Estimate ID matches"),
                ('sentAt' in data, "SentAt timestamp present"),
            ]
            
            all_passed = True
            for check, message in checks:
                print_result(check, message)
                if not check:
                    all_passed = False
            
            # Verify status changed to 'sent'
            verify_response = requests.get(
                f"{API_URL}/estimates",
                headers={"Authorization": f"Bearer {clinic_token}"}
            )
            
            if verify_response.status_code == 200:
                estimates_data = verify_response.json()
                estimates = estimates_data.get('estimates', [])
                sent_estimate = next((e for e in estimates if e.get('id') == created_estimate_id), None)
                
                if sent_estimate:
                    status_check = sent_estimate.get('status') == 'sent'
                    print_result(status_check, f"Status changed to 'sent': {sent_estimate.get('status')}")
                    all_passed = all_passed and status_check
                else:
                    print_result(False, "Could not find sent estimate in list")
                    all_passed = False
            
            return all_passed
        else:
            print_result(False, f"Send estimate failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Send estimate error: {str(e)}")
        return False

def test_update_estimate():
    """Test 5: Update Estimate - PUT /api/estimates/{id}"""
    print_test_header("Test 5: Update Estimate")
    
    if not created_estimate_id:
        print_result(False, "No estimate ID available (create test may have failed)")
        return False
    
    try:
        # Test updating various fields
        update_data = {
            "title": "Intervento Chirurgico - AGGIORNATO",
            "notes": "Note aggiornate dal test",
            "discount": 10,
            "totalAmount": 280
        }
        
        response = requests.put(
            f"{API_URL}/estimates/{created_estimate_id}",
            json=update_data,
            headers={
                "Authorization": f"Bearer {clinic_token}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            
            checks = [
                (data.get('title') == update_data['title'], "Title updated correctly"),
                (data.get('notes') == update_data['notes'], "Notes updated correctly"),
                (data.get('discount') == update_data['discount'], "Discount updated correctly"),
                (data.get('totalAmount') == update_data['totalAmount'], "Total amount updated correctly"),
                ('updatedAt' in data, "Updated timestamp present"),
            ]
            
            all_passed = True
            for check, message in checks:
                print_result(check, message)
                if not check:
                    all_passed = False
            
            # Test status change to 'accepted'
            status_update = {"status": "accepted"}
            status_response = requests.put(
                f"{API_URL}/estimates/{created_estimate_id}",
                json=status_update,
                headers={
                    "Authorization": f"Bearer {clinic_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if status_response.status_code == 200:
                status_data = status_response.json()
                status_check = status_data.get('status') == 'accepted'
                print_result(status_check, f"Status changed to 'accepted': {status_data.get('status')}")
                all_passed = all_passed and status_check
            else:
                print_result(False, f"Status update failed: {status_response.status_code}")
                all_passed = False
            
            return all_passed
        else:
            print_result(False, f"Update estimate failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Update estimate error: {str(e)}")
        return False

def run_all_tests():
    """Run all estimate API tests"""
    print("\n" + "="*80)
    print("VETBUDDY PREVENTIVI DIGITALI (ESTIMATES) API TEST SUITE")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    # Login first
    if not login_clinic():
        print("\n❌ CRITICAL: Clinic login failed. Cannot proceed with tests.")
        return
    
    # Run tests
    results = []
    
    results.append(("Authentication Test", test_estimates_authentication()))
    results.append(("Create Estimate Test", test_create_estimate()))
    results.append(("Get Estimates List Test", test_get_estimates_list()))
    results.append(("Send Estimate Test", test_send_estimate()))
    results.append(("Update Estimate Test", test_update_estimate()))
    
    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\n{'='*80}")
    print(f"TOTAL: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    print(f"{'='*80}\n")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Estimates API is fully functional.")
    else:
        print(f"⚠️  {total - passed} test(s) failed. Review the output above for details.")

if __name__ == "__main__":
    run_all_tests()
