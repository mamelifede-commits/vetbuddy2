#!/usr/bin/env python3
"""
VetBuddy Import API Backend Test
Testing Patient Import functionality via CSV
"""

import requests
import json
import os
import time
from datetime import datetime

# Configuration
NEXT_PUBLIC_BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://navigation-refactor-1.preview.emergentagent.com')
BASE_URL = f"{NEXT_PUBLIC_BASE_URL}/api"

# Authentication token provided in review request
AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMwY2MzOTMzLTI0NGMtNDRiOS1iNmYzLWIyYjYzNzJjNjI2MCIsImVtYWlsIjoiZGVtb0B2ZXRidWRkeS5pdCIsInJvbGUiOiJjbGluaWMiLCJpYXQiOjE3NzA5ODE4MzYsImV4cCI6MTc3MTU4NjYzNn0.n3VGgI21Bcf5K5J54pOOvW3gsR4-6lk86WCaimyHw74"

def log_test(message, is_success=None):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status = ""
    if is_success is True:
        status = "✅ PASS"
    elif is_success is False:
        status = "❌ FAIL"
    print(f"[{timestamp}] {status} {message}")

def make_request(method, endpoint, headers=None, data=None, files=None, json_data=None):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}/{endpoint}" if not endpoint.startswith('http') else endpoint
    
    default_headers = {
        'Authorization': f'Bearer {AUTH_TOKEN}',
    }
    
    if headers:
        default_headers.update(headers)
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=default_headers, timeout=30)
        elif method.upper() == 'POST':
            if files:
                # For file uploads, don't set Content-Type header
                response = requests.post(url, headers={'Authorization': f'Bearer {AUTH_TOKEN}'}, data=data, files=files, timeout=30)
            elif json_data:
                response = requests.post(url, headers=default_headers, json=json_data, timeout=30)
            else:
                response = requests.post(url, headers=default_headers, data=data, timeout=30)
        
        log_test(f"{method} {endpoint} -> Status: {response.status_code}")
        return response
    except Exception as e:
        log_test(f"Request error for {method} {endpoint}: {str(e)}", False)
        return None

def test_import_api_get():
    """Test 1: GET /api/import - Should return template info"""
    log_test("=" * 60)
    log_test("TEST 1: GET /api/import - Template Information")
    log_test("=" * 60)
    
    try:
        response = make_request('GET', 'import')
        
        if not response:
            log_test("Failed to make request", False)
            return False
        
        if response.status_code != 200:
            log_test(f"Expected status 200, got {response.status_code}", False)
            log_test(f"Response: {response.text}")
            return False
        
        data = response.json()
        
        # Check required fields
        required_fields = ['success', 'requiredColumns', 'optionalColumns', 'exampleRow']
        for field in required_fields:
            if field not in data:
                log_test(f"Missing required field: {field}", False)
                return False
        
        # Check required columns
        if 'nome' not in data['requiredColumns'] or 'specie' not in data['requiredColumns']:
            log_test("Missing expected required columns (nome, specie)", False)
            return False
            
        # Check optional columns
        expected_optional = ['razza', 'data_nascita', 'microchip', 'proprietario', 'email', 'vaccino']
        for col in expected_optional:
            if col not in data['optionalColumns']:
                log_test(f"Missing expected optional column: {col}", False)
                return False
        
        # Check example row
        example = data['exampleRow']
        if not example.get('nome') or not example.get('specie'):
            log_test("Example row missing required data", False)
            return False
            
        log_test("✅ Template info returned correctly", True)
        log_test(f"Required columns: {data['requiredColumns']}")
        log_test(f"Optional columns count: {len(data['optionalColumns'])}")
        log_test(f"Example pet: {example['nome']} ({example['specie']})")
        
        return True
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_import_csv_success():
    """Test 2: POST /api/import with CSV file - Should import patients successfully"""
    log_test("=" * 60)
    log_test("TEST 2: POST /api/import - CSV Import (Success)")
    log_test("=" * 60)
    
    try:
        # Read the template CSV file
        csv_file_path = '/app/public/downloads/template_import_pazienti.csv'
        
        if not os.path.exists(csv_file_path):
            log_test(f"Template CSV file not found at {csv_file_path}", False)
            return False
            
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            csv_content = f.read()
        
        log_test(f"CSV file loaded, size: {len(csv_content)} bytes")
        
        # Prepare request using requests directly
        response = requests.post(
            f"{BASE_URL}/import", 
            headers={'Authorization': f'Bearer {AUTH_TOKEN}'}, 
            data={'type': 'data'},
            files={'file': ('template_import_pazienti.csv', csv_content, 'text/csv')},
            timeout=30
        )
        
        log_test(f"POST import -> Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test(f"Expected status 200, got {response.status_code}", False)
            log_test(f"Response: {response.text}")
            return False
        
        result = response.json()
        
        # Check success field
        if not result.get('success'):
            log_test(f"Import failed: {result.get('error', 'Unknown error')}", False)
            log_test(f"Errors: {result.get('errors', [])}")
            return False
        
        # Check imported counts
        imported = result.get('imported', {})
        log_test(f"✅ Import successful!")
        log_test(f"Imported owners: {imported.get('owners', 0)}")
        log_test(f"Imported pets: {imported.get('pets', 0)}")
        log_test(f"Imported vaccines: {imported.get('vaccines', 0)}")
        
        # Check for warnings (acceptable)
        warnings = result.get('warnings', [])
        if warnings:
            log_test(f"Warnings: {len(warnings)}")
            for warning in warnings[:3]:  # Show first 3 warnings
                log_test(f"  - {warning}")
        
        # Check for errors (should be minimal)
        errors = result.get('errors', [])
        if errors:
            log_test(f"Errors encountered: {len(errors)}")
            for error in errors[:3]:  # Show first 3 errors
                log_test(f"  - {error}")
        
        # Verify at least some data was imported
        if imported.get('pets', 0) == 0:
            log_test("No pets were imported - this might be an issue", False)
            return False
            
        log_test(f"✅ CSV import completed successfully", True)
        return True
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_import_no_file():
    """Test 3: POST /api/import without file - Should return error"""
    log_test("=" * 60)
    log_test("TEST 3: POST /api/import - No File Error")
    log_test("=" * 60)
    
    try:
        # Send request without file using form data
        response = requests.post(
            f"{BASE_URL}/import", 
            headers={'Authorization': f'Bearer {AUTH_TOKEN}'}, 
            data={'type': 'data'},
            timeout=30
        )
        
        log_test(f"POST import -> Status: {response.status_code}")
        
        if response.status_code != 400:
            log_test(f"Expected status 400, got {response.status_code}", False)
            log_test(f"Response: {response.text}")
            return False
        
        result = response.json()
        
        if 'error' not in result:
            log_test("Expected error field in response", False)
            return False
        
        error_message = result['error'].lower()
        if 'file' not in error_message or 'caricato' not in error_message:
            log_test(f"Unexpected error message: {result['error']}", False)
            return False
        
        log_test(f"✅ Correctly returned error: {result['error']}", True)
        return True
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_import_empty_file():
    """Test 4: POST /api/import with empty file - Should return error"""
    log_test("=" * 60)
    log_test("TEST 4: POST /api/import - Empty File Error")
    log_test("=" * 60)
    
    try:
        # Create empty CSV content
        empty_csv = ""
        
        response = requests.post(
            f"{BASE_URL}/import", 
            headers={'Authorization': f'Bearer {AUTH_TOKEN}'}, 
            data={'type': 'data'},
            files={'file': ('empty.csv', empty_csv, 'text/csv')},
            timeout=30
        )
        
        log_test(f"POST import -> Status: {response.status_code}")
        
        if response.status_code != 400:
            log_test(f"Expected status 400, got {response.status_code}", False)
            log_test(f"Response: {response.text}")
            return False
        
        result = response.json()
        
        if 'error' not in result:
            log_test("Expected error field in response", False)
            return False
        
        error_message = result['error'].lower()
        if 'vuoto' not in error_message and 'formato' not in error_message:
            log_test(f"Unexpected error message: {result['error']}", False)
            return False
        
        log_test(f"✅ Correctly returned error for empty file: {result['error']}", True)
        return True
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def test_authentication():
    """Test 5: Authentication check"""
    log_test("=" * 60)
    log_test("TEST 5: Authentication Verification")
    log_test("=" * 60)
    
    try:
        # Test GET without auth token (should be public)
        response = requests.get(f"{BASE_URL}/import", timeout=30)
        
        if response.status_code != 200:
            log_test(f"GET /import should be public, got {response.status_code}", False)
            return False
        
        # Test POST without auth token (should require auth)
        response = requests.post(f"{BASE_URL}/import", json={'type': 'data'}, timeout=30)
        
        if response.status_code != 401:
            log_test(f"Expected 401 for POST without auth, got {response.status_code}", False)
            return False
        
        # Test with provided token
        response = make_request('GET', 'import')
        
        if not response or response.status_code != 200:
            log_test(f"Authentication with provided token failed: {response.status_code if response else 'No response'}", False)
            return False
        
        log_test("✅ Authentication working correctly", True)
        return True
        
    except Exception as e:
        log_test(f"Test failed with exception: {str(e)}", False)
        return False

def main():
    """Run all import API tests"""
    log_test("🐾 VetBuddy Import API Backend Test Suite")
    log_test("=" * 60)
    log_test(f"Base URL: {BASE_URL}")
    log_test(f"Testing with clinic credentials: demo@vetbuddy.it")
    log_test("=" * 60)
    
    tests = [
        ("Authentication Check", test_authentication),
        ("GET Template Info", test_import_api_get),
        ("POST CSV Import Success", test_import_csv_success),
        ("POST No File Error", test_import_no_file),
        ("POST Empty File Error", test_import_empty_file),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if result:
                passed += 1
        except Exception as e:
            log_test(f"Test {test_name} crashed: {str(e)}", False)
        
        time.sleep(1)  # Brief pause between tests
    
    log_test("=" * 60)
    log_test("🔍 IMPORT API TEST RESULTS SUMMARY")
    log_test("=" * 60)
    log_test(f"Tests Passed: {passed}/{total}")
    
    if passed == total:
        log_test("✅ ALL IMPORT API TESTS PASSED", True)
    else:
        log_test(f"❌ {total - passed} TESTS FAILED", False)
    
    log_test("=" * 60)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)