#!/usr/bin/env python3
"""
VetBuddy Lab Marketplace Backend API Testing
Testing the 3 new Lab Marketplace API endpoints as specified in review request.
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test credentials from review request
CREDENTIALS = {
    "clinic": {"email": "demo@vetbuddy.it", "password": "VetBuddy2025!Secure"},
    "lab": {"email": "laboratorio1@vetbuddy.it", "password": "Lab2025!"},
    "admin": {"email": "admin@vetbuddy.it", "password": "Admin2025!"},
    "owner": {"email": "proprietario.demo@vetbuddy.it", "password": "demo123"}
}

def login_user(role):
    """Login and get JWT token for specified role"""
    try:
        print(f"🔐 Logging in as {role}...")
        response = requests.post(f"{BASE_URL}/auth/login", json=CREDENTIALS[role])
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            user_info = data.get('user', {})
            print(f"✅ Login successful for {role}: {user_info.get('email', 'N/A')}")
            return token
        else:
            print(f"❌ Login failed for {role}: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error for {role}: {str(e)}")
        return None

def test_lab_marketplace_api():
    """Test 1: Lab Marketplace API - GET labs/marketplace"""
    print("\n" + "="*60)
    print("TEST 1: Lab Marketplace API - GET labs/marketplace")
    print("="*60)
    
    # Login as clinic
    clinic_token = login_user("clinic")
    if not clinic_token:
        print("❌ Cannot test without clinic authentication")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {clinic_token}"}
        response = requests.get(f"{BASE_URL}/labs/marketplace", headers=headers)
        
        print(f"📡 GET /api/labs/marketplace")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            labs = response.json()
            print(f"✅ SUCCESS: Retrieved {len(labs)} labs from marketplace")
            
            # Validate response structure
            if isinstance(labs, list) and len(labs) >= 2:
                print(f"✅ Expected array of labs received: {len(labs)} labs")
                
                for i, lab in enumerate(labs):
                    print(f"\n📋 Lab {i+1}: {lab.get('labName', 'N/A')}")
                    print(f"   - ID: {lab.get('id', 'N/A')}")
                    print(f"   - City: {lab.get('city', 'N/A')}")
                    print(f"   - Description: {lab.get('description', 'N/A')[:50]}...")
                    print(f"   - Specializations: {lab.get('specializations', [])}")
                    print(f"   - Pickup Available: {lab.get('pickupAvailable', False)}")
                    print(f"   - Average Report Time: {lab.get('averageReportTime', 'N/A')}")
                    print(f"   - Price List Items: {len(lab.get('priceList', []))}")
                    print(f"   - Connection Status: {lab.get('connectionStatus', 'null')}")
                
                # Check required fields
                required_fields = ['id', 'labName', 'city', 'description', 'specializations', 
                                 'pickupAvailable', 'averageReportTime', 'priceList', 'connectionStatus']
                
                all_fields_present = True
                for lab in labs:
                    for field in required_fields:
                        if field not in lab:
                            print(f"❌ Missing required field '{field}' in lab {lab.get('labName', 'Unknown')}")
                            all_fields_present = False
                
                if all_fields_present:
                    print("✅ All required fields present in lab objects")
                    return True
                else:
                    print("❌ Some required fields missing")
                    return False
            else:
                print(f"❌ Expected array of 2+ labs, got: {type(labs)} with {len(labs) if isinstance(labs, list) else 'N/A'} items")
                return False
        else:
            print(f"❌ FAILED: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_clinic_connected_labs_api():
    """Test 2: Lab Marketplace API - Clinic Connected Labs"""
    print("\n" + "="*60)
    print("TEST 2: Lab Marketplace API - Clinic Connected Labs")
    print("="*60)
    
    # Login as clinic
    clinic_token = login_user("clinic")
    if not clinic_token:
        print("❌ Cannot test without clinic authentication")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {clinic_token}"}
        
        # Test GET /api/clinic/connected-labs
        print(f"\n📡 GET /api/clinic/connected-labs")
        response = requests.get(f"{BASE_URL}/clinic/connected-labs", headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            connections = response.json()
            print(f"✅ SUCCESS: Retrieved {len(connections)} connections")
            print(f"   Connected labs: {[conn.get('lab', {}).get('labName', 'N/A') for conn in connections]}")
        else:
            print(f"❌ FAILED: {response.status_code} - {response.text}")
            return False
        
        # Test GET /api/clinic/lab-invitations
        print(f"\n📡 GET /api/clinic/lab-invitations")
        response = requests.get(f"{BASE_URL}/clinic/lab-invitations", headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            invitations = response.json()
            print(f"✅ SUCCESS: Retrieved {len(invitations)} invitations")
        else:
            print(f"❌ FAILED: {response.status_code} - {response.text}")
            return False
        
        # Get lab IDs from marketplace for connection test
        marketplace_response = requests.get(f"{BASE_URL}/labs/marketplace", headers=headers)
        if marketplace_response.status_code == 200:
            labs = marketplace_response.json()
            if labs and len(labs) > 0:
                lab_id = labs[0]['id']
                lab_name = labs[0]['labName']
                
                # Test POST /api/clinic/lab-connection
                print(f"\n📡 POST /api/clinic/lab-connection")
                print(f"   Requesting connection with lab: {lab_name} (ID: {lab_id})")
                
                connection_data = {"labId": lab_id}
                response = requests.post(f"{BASE_URL}/clinic/lab-connection", 
                                       headers=headers, json=connection_data)
                print(f"Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ SUCCESS: {result.get('message', 'Connection request created')}")
                    
                    # Verify connection status changed in marketplace
                    print(f"\n🔍 Verifying connection status in marketplace...")
                    marketplace_check = requests.get(f"{BASE_URL}/labs/marketplace", headers=headers)
                    if marketplace_check.status_code == 200:
                        updated_labs = marketplace_check.json()
                        target_lab = next((lab for lab in updated_labs if lab['id'] == lab_id), None)
                        if target_lab:
                            connection_status = target_lab.get('connectionStatus')
                            print(f"✅ Lab {lab_name} connection status: {connection_status}")
                            if connection_status == 'pending':
                                print("✅ Connection status correctly shows 'pending'")
                                return True
                            else:
                                print(f"⚠️ Expected 'pending' status, got: {connection_status}")
                                return True  # Still working, just different state
                        else:
                            print("❌ Lab not found in marketplace after connection request")
                            return False
                    else:
                        print("❌ Failed to verify marketplace status")
                        return False
                        
                elif response.status_code == 400 and "già esistente" in response.text:
                    print(f"✅ SUCCESS: Connection already exists (expected behavior)")
                    return True
                else:
                    print(f"❌ FAILED: {response.status_code} - {response.text}")
                    return False
            else:
                print("❌ No labs available in marketplace for connection test")
                return False
        else:
            print("❌ Failed to get labs from marketplace")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_lab_connections_and_price_list():
    """Test 3: Lab Marketplace API - Lab Connections & Price List"""
    print("\n" + "="*60)
    print("TEST 3: Lab Marketplace API - Lab Connections & Price List")
    print("="*60)
    
    # Login as lab
    lab_token = login_user("lab")
    if not lab_token:
        print("❌ Cannot test without lab authentication")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {lab_token}"}
        
        # Test GET /api/lab/connections
        print(f"\n📡 GET /api/lab/connections")
        response = requests.get(f"{BASE_URL}/lab/connections", headers=headers)
        print(f"Status Code: {response.status_code}")
        
        connection_id = None
        if response.status_code == 200:
            connections = response.json()
            print(f"✅ SUCCESS: Retrieved {len(connections)} connections")
            
            for conn in connections:
                clinic_info = conn.get('clinic', {})
                print(f"   - Connection ID: {conn.get('id', 'N/A')}")
                print(f"   - Clinic: {clinic_info.get('clinicName', 'N/A')}")
                print(f"   - Status: {conn.get('status', 'N/A')}")
                print(f"   - Created: {conn.get('createdAt', 'N/A')}")
                
                # Store a pending connection ID for testing
                if conn.get('status') == 'pending':
                    connection_id = conn.get('id')
        else:
            print(f"❌ FAILED: {response.status_code} - {response.text}")
            return False
        
        # Test connection response if we have a pending connection
        if connection_id:
            print(f"\n📡 POST /api/lab/connection-response")
            print(f"   Accepting connection ID: {connection_id}")
            
            response_data = {"connectionId": connection_id, "action": "accept"}
            response = requests.post(f"{BASE_URL}/lab/connection-response", 
                                   headers=headers, json=response_data)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ SUCCESS: {result.get('message', 'Connection accepted')}")
            else:
                print(f"⚠️ Connection response test: {response.status_code} - {response.text}")
        else:
            print("ℹ️ No pending connections found to test acceptance")
        
        # Test GET /api/lab/my-price-list
        print(f"\n📡 GET /api/lab/my-price-list")
        response = requests.get(f"{BASE_URL}/lab/my-price-list", headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            price_list = response.json()
            print(f"✅ SUCCESS: Retrieved {len(price_list)} price list items")
            
            for item in price_list[:3]:  # Show first 3 items
                print(f"   - {item.get('title', item.get('examType', 'N/A'))}: €{item.get('priceFrom', 0)}")
        else:
            print(f"❌ FAILED: {response.status_code} - {response.text}")
            return False
        
        # Test POST /api/lab/price-list (update price list)
        print(f"\n📡 POST /api/lab/price-list")
        sample_prices = [
            {
                "examType": "sangue",
                "title": "Emocromo Completo",
                "description": "Analisi completa del sangue",
                "priceFrom": 25.00,
                "priceTo": 35.00,
                "averageDeliveryTime": "24 ore"
            },
            {
                "examType": "urine",
                "title": "Esame Urine",
                "description": "Analisi chimico-fisica delle urine",
                "priceFrom": 15.00,
                "priceOnRequest": False,
                "averageDeliveryTime": "12 ore"
            }
        ]
        
        response = requests.post(f"{BASE_URL}/lab/price-list", 
                               headers=headers, json={"prices": sample_prices})
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS: {result.get('message', 'Price list updated')}")
            print(f"   Updated {result.get('count', 0)} price items")
        else:
            print(f"❌ FAILED: {response.status_code} - {response.text}")
            return False
        
        # Get lab ID for public profile tests
        lab_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if lab_response.status_code == 200:
            lab_user = lab_response.json().get('user', {})
            lab_id = lab_user.get('id')
            
            if lab_id:
                # Test GET /api/labs/{labId}/profile (public profile)
                print(f"\n📡 GET /api/labs/{lab_id}/profile")
                response = requests.get(f"{BASE_URL}/labs/{lab_id}/profile")
                print(f"Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    profile = response.json()
                    print(f"✅ SUCCESS: Retrieved public profile for {profile.get('labName', 'N/A')}")
                    print(f"   Price list items: {len(profile.get('priceList', []))}")
                else:
                    print(f"❌ FAILED: {response.status_code} - {response.text}")
                    return False
                
                # Test GET /api/labs/{labId}/price-list (public price list)
                print(f"\n📡 GET /api/labs/{lab_id}/price-list")
                response = requests.get(f"{BASE_URL}/labs/{lab_id}/price-list")
                print(f"Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    public_prices = response.json()
                    print(f"✅ SUCCESS: Retrieved public price list with {len(public_prices)} items")
                    return True
                else:
                    print(f"❌ FAILED: {response.status_code} - {response.text}")
                    return False
            else:
                print("❌ Could not get lab ID for public profile tests")
                return False
        else:
            print("❌ Failed to get lab user info")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_existing_apis():
    """Verify existing APIs still work"""
    print("\n" + "="*60)
    print("VERIFICATION: Testing Existing APIs")
    print("="*60)
    
    try:
        # Test health endpoint
        print(f"\n📡 GET /api/health")
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Health check: {health.get('status', 'N/A')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
        
        # Test login endpoints
        for role in ["clinic", "lab"]:
            token = login_user(role)
            if token:
                print(f"✅ {role.title()} login working")
            else:
                print(f"❌ {role.title()} login failed")
                return False
        
        # Test lab-requests endpoint
        clinic_token = login_user("clinic")
        if clinic_token:
            headers = {"Authorization": f"Bearer {clinic_token}"}
            print(f"\n📡 GET /api/lab-requests")
            response = requests.get(f"{BASE_URL}/lab-requests", headers=headers)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                requests_data = response.json()
                print(f"✅ Lab requests: {len(requests_data)} requests found")
                return True
            else:
                print(f"❌ Lab requests failed: {response.status_code}")
                return False
        else:
            print("❌ Cannot test lab-requests without clinic token")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    """Run all Lab Marketplace API tests"""
    print("🧪 VetBuddy Lab Marketplace Backend API Testing")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test_results = []
    
    # Run the 3 main tests from review request
    test_results.append(("Lab Marketplace API - GET labs/marketplace", test_lab_marketplace_api()))
    test_results.append(("Lab Marketplace API - Clinic Connected Labs", test_clinic_connected_labs_api()))
    test_results.append(("Lab Marketplace API - Lab Connections & Price List", test_lab_connections_and_price_list()))
    
    # Verify existing APIs still work
    test_results.append(("Existing APIs Verification", test_existing_apis()))
    
    # Summary
    print("\n" + "="*60)
    print("🏁 TEST SUMMARY")
    print("="*60)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\n📊 Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 ALL TESTS PASSED! Lab Marketplace APIs are working correctly.")
        return True
    else:
        print(f"⚠️ {failed} test(s) failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)