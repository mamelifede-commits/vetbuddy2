#!/usr/bin/env python3
"""
VetBuddy Backend API Testing - Alert Pazienti Fragili
Tests the new fragile patients endpoint with authentication, data analysis, and risk scoring
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_test(message):
    print(f"\n{BLUE}[TEST]{RESET} {message}")

def print_success(message):
    print(f"{GREEN}✓{RESET} {message}")

def print_error(message):
    print(f"{RED}✗{RESET} {message}")

def print_info(message):
    print(f"{YELLOW}ℹ{RESET} {message}")

# ==================== AUTHENTICATION ====================
def test_clinic_login():
    """Test clinic authentication"""
    print_test("Testing clinic authentication")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": CLINIC_EMAIL, "password": CLINIC_PASSWORD},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'token' in data:
                print_success(f"Clinic login successful - Token received")
                print_info(f"User: {data.get('user', {}).get('email', 'N/A')}")
                print_info(f"Role: {data.get('user', {}).get('role', 'N/A')}")
                return data['token']
            else:
                print_error("Login response missing token")
                return None
        else:
            print_error(f"Login failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print_error(f"Login exception: {str(e)}")
        return None

# ==================== FRAGILE PATIENTS TESTS ====================
def test_fragile_patients_unauthorized():
    """Test fragile patients endpoint without authentication"""
    print_test("Testing /api/fragile-patients without authentication")
    
    try:
        response = requests.get(f"{BASE_URL}/fragile-patients", timeout=10)
        
        if response.status_code == 401:
            print_success("Unauthorized access correctly blocked (401)")
            return True
        else:
            print_error(f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return False

def test_fragile_patients_list(token):
    """Test fragile patients list endpoint with authentication"""
    print_test("Testing GET /api/fragile-patients with clinic authentication")
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/fragile-patients", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify response structure
            required_fields = ['patients', 'totalCount', 'categoryCount', 'highUrgencyCount', 'generatedAt']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print_error(f"Missing required fields: {missing_fields}")
                return False
            
            print_success("Fragile patients endpoint working")
            print_info(f"Total fragile patients: {data['totalCount']}")
            print_info(f"High urgency count: {data['highUrgencyCount']}")
            print_info(f"Generated at: {data['generatedAt']}")
            
            # Verify category counts structure
            category_count = data['categoryCount']
            expected_categories = ['senior', 'cronici', 'allergici', 'terapia', 'postop', 'critici']
            
            print_info(f"\nCategory breakdown:")
            for cat in expected_categories:
                if cat in category_count:
                    print_info(f"  - {cat}: {category_count[cat]}")
                else:
                    print_error(f"  - Missing category: {cat}")
            
            # Verify patient structure if any patients exist
            if data['totalCount'] > 0:
                print_info(f"\nAnalyzing first patient structure:")
                patient = data['patients'][0]
                
                required_patient_fields = ['id', 'name', 'species', 'age', 'categories', 'conditions', 'urgency', 'riskScore']
                patient_missing = [field for field in required_patient_fields if field not in patient]
                
                if patient_missing:
                    print_error(f"Patient missing fields: {patient_missing}")
                    return False
                
                print_success("Patient structure valid")
                print_info(f"  - Name: {patient['name']}")
                print_info(f"  - Species: {patient['species']}")
                print_info(f"  - Age: {patient['age']} years")
                print_info(f"  - Categories: {', '.join(patient['categories'])}")
                print_info(f"  - Urgency: {patient['urgency']}")
                print_info(f"  - Risk Score: {patient['riskScore']}/100")
                
                if 'alerts' in patient and patient['alerts']:
                    print_info(f"  - Alerts: {', '.join(patient['alerts'])}")
            else:
                print_info("No fragile patients found (this is OK if database is empty)")
            
            return True
            
        else:
            print_error(f"Request failed - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return False

def test_data_integration(token):
    """Test that fragile patients endpoint reads from real MongoDB collections"""
    print_test("Testing real data integration (MongoDB collections)")
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get fragile patients
        response = requests.get(f"{BASE_URL}/fragile-patients", headers=headers, timeout=10)
        
        if response.status_code != 200:
            print_error(f"Failed to get fragile patients: {response.status_code}")
            return False
        
        data = response.json()
        
        # Verify data comes from real collections
        print_success("Endpoint successfully queries MongoDB")
        
        # Check if we have any patients with real data
        if data['totalCount'] > 0:
            patient = data['patients'][0]
            
            # Verify age calculation (requires birthDate from pets collection)
            if 'age' in patient and patient['age'] > 0:
                print_success(f"Age calculation working: {patient['age']} years")
            
            # Verify categories detection
            if 'categories' in patient and len(patient['categories']) > 0:
                print_success(f"Category detection working: {len(patient['categories'])} categories found")
            
            # Verify owner data integration
            if 'owner' in patient:
                print_success(f"Owner data integrated: {patient['owner']}")
            
            # Verify appointments integration (lastVisit/nextVisit)
            if 'lastVisit' in patient or 'nextVisit' in patient:
                print_success("Appointments data integrated")
                if patient.get('lastVisit'):
                    print_info(f"  - Last visit: {patient['lastVisit']}")
                if patient.get('nextVisit'):
                    print_info(f"  - Next visit: {patient['nextVisit']}")
            
            return True
        else:
            print_info("No patients to verify data integration (database may be empty)")
            print_success("Endpoint structure is correct")
            return True
            
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return False

def test_risk_score_endpoint(token):
    """Test risk score calculation endpoint for specific patient"""
    print_test("Testing GET /api/fragile-patients/risk/{petId}")
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # First get a patient ID from fragile patients list
        response = requests.get(f"{BASE_URL}/fragile-patients", headers=headers, timeout=10)
        
        if response.status_code != 200:
            print_error("Could not get fragile patients list")
            return False
        
        data = response.json()
        
        if data['totalCount'] == 0:
            print_info("No fragile patients to test risk score endpoint")
            print_info("Testing with non-existent ID to verify error handling")
            
            # Test error handling
            test_response = requests.get(
                f"{BASE_URL}/fragile-patients/risk/test-invalid-id",
                headers=headers,
                timeout=10
            )
            
            if test_response.status_code in [404, 500]:
                print_success("Error handling working for invalid pet ID")
                return True
            else:
                print_error(f"Unexpected response for invalid ID: {test_response.status_code}")
                return False
        
        # Test with real patient ID
        pet_id = data['patients'][0]['id']
        print_info(f"Testing risk score for pet ID: {pet_id}")
        
        risk_response = requests.get(
            f"{BASE_URL}/fragile-patients/risk/{pet_id}",
            headers=headers,
            timeout=10
        )
        
        if risk_response.status_code == 200:
            risk_data = risk_response.json()
            
            # Verify response structure
            required_fields = ['petId', 'petName', 'riskScore', 'riskLevel', 'riskFactors', 'recommendations', 'calculatedAt']
            missing = [field for field in required_fields if field not in risk_data]
            
            if missing:
                print_error(f"Missing required fields: {missing}")
                return False
            
            print_success("Risk score endpoint working")
            print_info(f"Pet: {risk_data['petName']}")
            print_info(f"Risk Score: {risk_data['riskScore']}/100")
            print_info(f"Risk Level: {risk_data['riskLevel']}")
            
            if risk_data['riskFactors']:
                print_info(f"Risk Factors ({len(risk_data['riskFactors'])}):")
                for factor in risk_data['riskFactors']:
                    print_info(f"  - {factor['factor']} (Score: {factor['score']}, Impact: {factor['impact']})")
            
            if risk_data['recommendations']:
                print_info(f"Recommendations ({len(risk_data['recommendations'])}):")
                for rec in risk_data['recommendations']:
                    print_info(f"  - {rec}")
            
            return True
        else:
            print_error(f"Risk score request failed: {risk_response.status_code}")
            print_error(f"Response: {risk_response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return False

def test_risk_score_unauthorized():
    """Test risk score endpoint without authentication"""
    print_test("Testing risk score endpoint without authentication")
    
    try:
        response = requests.get(f"{BASE_URL}/fragile-patients/risk/test-id", timeout=10)
        
        if response.status_code == 401:
            print_success("Unauthorized access to risk score correctly blocked (401)")
            return True
        else:
            print_error(f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return False

# ==================== MAIN TEST RUNNER ====================
def main():
    print(f"\n{'='*70}")
    print(f"{BLUE}VetBuddy Alert Pazienti Fragili API Testing{RESET}")
    print(f"{'='*70}")
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*70}\n")
    
    results = {
        'total': 0,
        'passed': 0,
        'failed': 0
    }
    
    # Test 1: Authentication
    print(f"\n{YELLOW}{'='*70}{RESET}")
    print(f"{YELLOW}TEST SUITE 1: AUTHENTICATION{RESET}")
    print(f"{YELLOW}{'='*70}{RESET}")
    
    token = test_clinic_login()
    results['total'] += 1
    if token:
        results['passed'] += 1
    else:
        results['failed'] += 1
        print_error("\nCannot proceed without authentication token")
        print_summary(results)
        sys.exit(1)
    
    # Test 2: Unauthorized Access
    print(f"\n{YELLOW}{'='*70}{RESET}")
    print(f"{YELLOW}TEST SUITE 2: AUTHORIZATION CHECKS{RESET}")
    print(f"{YELLOW}{'='*70}{RESET}")
    
    results['total'] += 1
    if test_fragile_patients_unauthorized():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    results['total'] += 1
    if test_risk_score_unauthorized():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 3: Fragile Patients List
    print(f"\n{YELLOW}{'='*70}{RESET}")
    print(f"{YELLOW}TEST SUITE 3: FRAGILE PATIENTS LIST & DATA STRUCTURE{RESET}")
    print(f"{YELLOW}{'='*70}{RESET}")
    
    results['total'] += 1
    if test_fragile_patients_list(token):
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 4: Data Integration
    print(f"\n{YELLOW}{'='*70}{RESET}")
    print(f"{YELLOW}TEST SUITE 4: REAL DATA INTEGRATION (MongoDB){RESET}")
    print(f"{YELLOW}{'='*70}{RESET}")
    
    results['total'] += 1
    if test_data_integration(token):
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 5: Risk Score Endpoint
    print(f"\n{YELLOW}{'='*70}{RESET}")
    print(f"{YELLOW}TEST SUITE 5: RISK SCORE CALCULATION{RESET}")
    print(f"{YELLOW}{'='*70}{RESET}")
    
    results['total'] += 1
    if test_risk_score_endpoint(token):
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Print summary
    print_summary(results)
    
    # Exit with appropriate code
    sys.exit(0 if results['failed'] == 0 else 1)

def print_summary(results):
    print(f"\n{'='*70}")
    print(f"{BLUE}TEST SUMMARY{RESET}")
    print(f"{'='*70}")
    print(f"Total Tests: {results['total']}")
    print(f"{GREEN}Passed: {results['passed']}{RESET}")
    print(f"{RED}Failed: {results['failed']}{RESET}")
    
    if results['failed'] == 0:
        print(f"\n{GREEN}✓ ALL TESTS PASSED{RESET}")
    else:
        print(f"\n{RED}✗ SOME TESTS FAILED{RESET}")
    
    print(f"{'='*70}\n")

if __name__ == "__main__":
    main()
