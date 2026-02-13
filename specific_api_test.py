#!/usr/bin/env python3
"""
Specific VetBuddy API Tests
Tests the specific APIs mentioned in the review request.
"""

import requests
import json

BASE_URL = "https://vigilant-germain.preview.emergentagent.com/api"

def test_api(method, endpoint, data=None, description=""):
    """Test a specific API endpoint"""
    url = f"{BASE_URL}/{endpoint.lstrip('/')}"
    headers = {"Content-Type": "application/json"}
    
    print(f"\n🧪 Testing: {description}")
    print(f"📍 {method} {endpoint}")
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=30)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
            
        print(f"📊 Status: {response.status_code}")
        
        try:
            response_data = response.json()
            print(f"📄 Response: {json.dumps(response_data, indent=2)[:500]}...")
            
            if 200 <= response.status_code < 300:
                print("✅ SUCCESS")
                return True
            else:
                print(f"❌ FAILED - Status {response.status_code}")
                return False
                
        except:
            print(f"📄 Response (text): {response.text[:200]}...")
            if 200 <= response.status_code < 300:
                print("✅ SUCCESS")
                return True
            else:
                print(f"❌ FAILED - Status {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    """Run specific API tests mentioned in review request"""
    print("🏥 VetBuddy Specific API Tests")
    print("=" * 50)
    
    tests = []
    
    # 1. API Servizi
    tests.append({
        "method": "GET",
        "endpoint": "/services",
        "description": "GET /api/services - catalogo servizi veterinari"
    })
    
    tests.append({
        "method": "GET", 
        "endpoint": "/services/flat",
        "description": "GET /api/services/flat - lista flat dei servizi"
    })
    
    # 2. API Invita Clinica
    tests.append({
        "method": "POST",
        "endpoint": "/invite-clinic",
        "data": {
            "clinicName": "Clinica Test Milano",
            "clinicEmail": "test@clinicatest.it", 
            "message": "Ciao, sono un tuo cliente!",
            "inviterName": "Mario Rossi",
            "inviterEmail": "mario@test.it"
        },
        "description": "POST /api/invite-clinic - invita clinica"
    })
    
    # 3. API Ricerca Cliniche
    tests.append({
        "method": "GET",
        "endpoint": "/clinics/search",
        "description": "GET /api/clinics/search - ricerca base"
    })
    
    tests.append({
        "method": "GET",
        "endpoint": "/clinics/search?city=Milano", 
        "description": "GET /api/clinics/search?city=Milano - filtro per città"
    })
    
    tests.append({
        "method": "GET",
        "endpoint": "/clinics/search?service=visita_clinica",
        "description": "GET /api/clinics/search?service=visita_clinica - filtro per servizio"
    })
    
    # 4. API Auth
    tests.append({
        "method": "POST",
        "endpoint": "/auth/login",
        "data": {
            "email": "demo@vetbuddy.it",
            "password": "DemoVet2025!"
        },
        "description": "POST /api/auth/login - login clinica demo"
    })
    
    tests.append({
        "method": "POST", 
        "endpoint": "/auth/login",
        "data": {
            "email": "anna.bianchi@email.com",
            "password": "Password123!"
        },
        "description": "POST /api/auth/login - login proprietario demo"
    })
    
    # 5. API Health
    tests.append({
        "method": "GET",
        "endpoint": "/health",
        "description": "GET /api/health - health check"
    })
    
    # Run all tests
    passed = 0
    failed_tests = []
    
    for i, test in enumerate(tests, 1):
        print(f"\n{'='*20} Test {i}/{len(tests)} {'='*20}")
        
        success = test_api(
            test["method"],
            test["endpoint"], 
            test.get("data"),
            test["description"]
        )
        
        if success:
            passed += 1
        else:
            failed_tests.append(test["description"])
    
    # Summary
    print(f"\n{'='*50}")
    print("📊 SUMMARY")
    print(f"{'='*50}")
    print(f"✅ Passed: {passed}/{len(tests)}")
    print(f"❌ Failed: {len(failed_tests)}/{len(tests)}")
    
    if failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in failed_tests:
            print(f"   • {test}")
    else:
        print(f"\n🎉 All specific API tests passed!")
        
    return len(failed_tests) == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)