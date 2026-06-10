#!/usr/bin/env python3
"""
VetBuddy Backend API Testing Script - ROI Dashboard Sistema Anti-Spreco
Tests the ROI Dashboard API endpoint that aggregates data from all Sistema Anti-Spreco modules
"""

import requests
import json
import os
from datetime import datetime

# Configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://clinic-report-review.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

# Test credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"

# Global variables
clinic_token = None

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
            print(f"   User: {data.get('user', {}).get('email')}")
            print(f"   Role: {data.get('user', {}).get('role')}")
            return True
        else:
            print_result(False, f"Login failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"Login error: {str(e)}")
        return False

def test_roi_dashboard_authentication():
    """Test 1: Authentication Test - Verify clinic authentication required"""
    print_test_header("Test 1: Authentication Required")
    
    try:
        # Test without authentication
        print("\n🔒 Testing unauthorized access (no token)...")
        response = requests.get(f"{API_URL}/roi-dashboard")
        
        if response.status_code == 401:
            print_result(True, f"Unauthorized access correctly blocked (401)")
            data = response.json()
            print(f"   Error message: {data.get('error', 'N/A')}")
        else:
            print_result(False, f"Expected 401, got {response.status_code}")
            print(f"   Response: {response.text}")
            
        # Test with clinic authentication
        print("\n🔓 Testing authorized access (clinic token)...")
        response = requests.get(
            f"{API_URL}/roi-dashboard",
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

def test_roi_dashboard_data_aggregation():
    """Test 2: Data Aggregation Test - Verify response structure"""
    print_test_header("Test 2: Data Aggregation Structure")
    
    try:
        response = requests.get(
            f"{API_URL}/roi-dashboard",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code != 200:
            print_result(False, f"Request failed with status {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        
        # Verify top-level structure
        print("\n📊 Verifying top-level structure...")
        top_level_checks = [
            ('summary' in data, "summary object present"),
            ('moduleBreakdown' in data, "moduleBreakdown array present"),
            ('trends' in data, "trends object present"),
            ('recommendations' in data, "recommendations array present"),
            ('generatedAt' in data, "generatedAt timestamp present"),
        ]
        
        all_passed = True
        for check, message in top_level_checks:
            print_result(check, message)
            if not check:
                all_passed = False
        
        # Verify summary structure
        print("\n📈 Verifying summary structure...")
        summary = data.get('summary', {})
        summary_checks = [
            ('totalRecoveredValue' in summary, "totalRecoveredValue field present"),
            ('totalPotentialValue' in summary, "totalPotentialValue field present"),
            ('conversionRate' in summary, "conversionRate field present"),
            ('last30DaysRecovered' in summary, "last30DaysRecovered field present"),
            ('activeModules' in summary, "activeModules field present"),
            ('totalActions' in summary, "totalActions field present"),
            (summary.get('activeModules') == 5, "activeModules equals 5"),
            (isinstance(summary.get('totalRecoveredValue'), (int, float)), "totalRecoveredValue is numeric"),
            (isinstance(summary.get('totalPotentialValue'), (int, float)), "totalPotentialValue is numeric"),
            (isinstance(summary.get('conversionRate'), (int, float)), "conversionRate is numeric"),
        ]
        
        for check, message in summary_checks:
            print_result(check, message)
            if not check:
                all_passed = False
        
        # Print summary values
        print(f"\n💰 Summary Values:")
        print(f"   Total Recovered: €{summary.get('totalRecoveredValue', 0):,.2f}")
        print(f"   Total Potential: €{summary.get('totalPotentialValue', 0):,.2f}")
        print(f"   Conversion Rate: {summary.get('conversionRate', 0)}%")
        print(f"   Last 30 Days: €{summary.get('last30DaysRecovered', 0):,.2f}")
        print(f"   Active Modules: {summary.get('activeModules', 0)}")
        print(f"   Total Actions: {summary.get('totalActions', 0)}")
        
        return all_passed
            
    except Exception as e:
        print_result(False, f"Data aggregation test error: {str(e)}")
        return False

def test_roi_dashboard_module_breakdown():
    """Test 3: Module Breakdown Test - Verify 5 modules present"""
    print_test_header("Test 3: Module Breakdown (5 Modules)")
    
    try:
        response = requests.get(
            f"{API_URL}/roi-dashboard",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code != 200:
            print_result(False, f"Request failed with status {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        module_breakdown = data.get('moduleBreakdown', [])
        
        # Verify module count
        print(f"\n🔢 Module Count: {len(module_breakdown)}")
        count_check = len(module_breakdown) == 5
        print_result(count_check, f"Expected 5 modules, found {len(module_breakdown)}")
        
        if not count_check:
            return False
        
        # Expected modules
        expected_modules = [
            'Autopilot Settimanale',
            'Alert Pazienti Fragili',
            'Preventivi Digitali',
            'No-Show Recovery',
            'Clienti Riattivati'
        ]
        
        # Verify each module
        print("\n📦 Verifying individual modules...")
        all_passed = True
        
        for i, module in enumerate(module_breakdown, 1):
            module_name = module.get('module', 'Unknown')
            print(f"\n   Module {i}: {module_name}")
            
            # Check required fields
            module_checks = [
                ('module' in module, "module name present"),
                ('icon' in module, "icon present"),
                ('color' in module, "color present"),
                ('recovered' in module, "recovered value present"),
                ('potential' in module, "potential value present"),
                ('conversionRate' in module, "conversionRate present"),
                ('impact' in module, "impact present"),
                (isinstance(module.get('recovered'), (int, float)), "recovered is numeric"),
                (isinstance(module.get('potential'), (int, float)), "potential is numeric"),
                (isinstance(module.get('conversionRate'), (int, float)), "conversionRate is numeric"),
            ]
            
            for check, message in module_checks:
                if not check:
                    print(f"      ❌ {message}")
                    all_passed = False
            
            # Print module values
            print(f"      Recovered: €{module.get('recovered', 0):,.2f}")
            print(f"      Potential: €{module.get('potential', 0):,.2f}")
            print(f"      Conversion: {module.get('conversionRate', 0)}%")
            print(f"      Impact: {module.get('impact', 'N/A')}")
        
        # Verify all expected modules are present
        print("\n✅ Verifying expected modules...")
        found_modules = [m.get('module') for m in module_breakdown]
        for expected in expected_modules:
            is_present = expected in found_modules
            print_result(is_present, f"Module '{expected}' present")
            if not is_present:
                all_passed = False
        
        return all_passed
            
    except Exception as e:
        print_result(False, f"Module breakdown test error: {str(e)}")
        return False

def test_roi_dashboard_recommendations():
    """Test 4: Recommendations Test - Verify recommendations array"""
    print_test_header("Test 4: Recommendations Array")
    
    try:
        response = requests.get(
            f"{API_URL}/roi-dashboard",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code != 200:
            print_result(False, f"Request failed with status {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        recommendations = data.get('recommendations', [])
        
        # Verify recommendations exist
        print(f"\n💡 Recommendations Count: {len(recommendations)}")
        has_recommendations = len(recommendations) > 0
        print_result(has_recommendations, f"Recommendations array has {len(recommendations)} items")
        
        if not has_recommendations:
            print_result(False, "No recommendations found")
            return False
        
        # Verify each recommendation structure
        print("\n📋 Verifying recommendation structure...")
        all_passed = True
        
        for i, rec in enumerate(recommendations, 1):
            print(f"\n   Recommendation {i}:")
            
            rec_checks = [
                ('priority' in rec, "priority field present"),
                ('module' in rec, "module field present"),
                ('action' in rec, "action field present"),
                ('potentialImpact' in rec, "potentialImpact field present"),
                (rec.get('priority') in ['high', 'medium', 'low'], "priority is valid (high/medium/low)"),
            ]
            
            for check, message in rec_checks:
                print_result(check, f"   {message}")
                if not check:
                    all_passed = False
            
            # Print recommendation details
            print(f"      Priority: {rec.get('priority', 'N/A')}")
            print(f"      Module: {rec.get('module', 'N/A')}")
            print(f"      Action: {rec.get('action', 'N/A')}")
            print(f"      Impact: {rec.get('potentialImpact', 'N/A')}")
        
        return all_passed
            
    except Exception as e:
        print_result(False, f"Recommendations test error: {str(e)}")
        return False

def test_roi_dashboard_trends():
    """Test 5: Trends Test - Verify trends object"""
    print_test_header("Test 5: Trends Object")
    
    try:
        response = requests.get(
            f"{API_URL}/roi-dashboard",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code != 200:
            print_result(False, f"Request failed with status {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        trends = data.get('trends', {})
        
        # Verify trends structure
        print("\n📈 Verifying trends structure...")
        trends_checks = [
            ('weeklyGrowth' in trends, "weeklyGrowth field present"),
            ('monthlyGrowth' in trends, "monthlyGrowth field present"),
            ('bestPerformer' in trends, "bestPerformer field present"),
            (isinstance(trends.get('weeklyGrowth'), (int, float)), "weeklyGrowth is numeric"),
            (isinstance(trends.get('monthlyGrowth'), (int, float)), "monthlyGrowth is numeric"),
            (isinstance(trends.get('bestPerformer'), str), "bestPerformer is string"),
        ]
        
        all_passed = True
        for check, message in trends_checks:
            print_result(check, message)
            if not check:
                all_passed = False
        
        # Print trends values
        print(f"\n📊 Trends Values:")
        print(f"   Weekly Growth: {trends.get('weeklyGrowth', 0)}%")
        print(f"   Monthly Growth: {trends.get('monthlyGrowth', 0)}%")
        print(f"   Best Performer: {trends.get('bestPerformer', 'N/A')}")
        
        return all_passed
            
    except Exception as e:
        print_result(False, f"Trends test error: {str(e)}")
        return False

def run_all_tests():
    """Run all ROI Dashboard API tests"""
    print("\n" + "="*80)
    print("VETBUDDY ROI DASHBOARD SISTEMA ANTI-SPRECO API TEST SUITE")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    print(f"Endpoint: /api/roi-dashboard")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    # Login first
    if not login_clinic():
        print("\n❌ CRITICAL: Clinic login failed. Cannot proceed with tests.")
        return
    
    # Run tests
    results = []
    
    results.append(("Authentication Test", test_roi_dashboard_authentication()))
    results.append(("Data Aggregation Test", test_roi_dashboard_data_aggregation()))
    results.append(("Module Breakdown Test", test_roi_dashboard_module_breakdown()))
    results.append(("Recommendations Test", test_roi_dashboard_recommendations()))
    results.append(("Trends Test", test_roi_dashboard_trends()))
    
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
        print("🎉 ALL TESTS PASSED! ROI Dashboard API is fully functional.")
    else:
        print(f"⚠️  {total - passed} test(s) failed. Review the output above for details.")

if __name__ == "__main__":
    run_all_tests()
