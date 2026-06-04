#!/usr/bin/env python3
"""
VetBuddy Passport AI Assistant Backend API Testing Script
Tests all AI endpoints as specified in review request
"""

import requests
import json
import sys
import time

BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test counters
tests_passed = 0
tests_failed = 0

def print_test(name, passed, details=""):
    global tests_passed, tests_failed
    if passed:
        tests_passed += 1
        print(f"✅ {name}")
        if details:
            print(f"   {details}")
    else:
        tests_failed += 1
        print(f"❌ {name}")
        if details:
            print(f"   {details}")

def test_get_ai_tools():
    """Test 1: GET /api/ai - Should return list of available tools"""
    print(f"\n📋 Test 1: GET /api/ai - List Available Tools")
    try:
        response = requests.get(
            f"{BASE_URL}/ai",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "tools" in data and isinstance(data["tools"], list):
                tools = [tool["id"] for tool in data["tools"]]
                
                # Check for 5 new passport tools
                passport_tools = [
                    "summarize_lab_report",
                    "extract_dates",
                    "generate_pet_sitter_instructions",
                    "generate_travel_checklist",
                    "passport_suggest_missing"
                ]
                
                missing_tools = [t for t in passport_tools if t not in tools]
                
                if not missing_tools:
                    print_test("GET /api/ai - List Tools", True, 
                              f"Found all 5 passport tools. Total tools: {len(tools)}")
                    print(f"   Available tools: {', '.join(tools)}")
                    return True
                else:
                    print_test("GET /api/ai - List Tools", False, 
                              f"Missing passport tools: {missing_tools}")
                    return False
            else:
                print_test("GET /api/ai - List Tools", False, 
                          "Missing 'tools' array in response")
                return False
        else:
            print_test("GET /api/ai - List Tools", False, 
                      f"Status {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        print_test("GET /api/ai - List Tools", False, f"Exception: {str(e)}")
        return False

def test_summarize_lab_report():
    """Test 2: POST /api/ai with summarize_lab_report tool"""
    print(f"\n🔬 Test 2: POST /api/ai - Summarize Lab Report")
    try:
        response = requests.post(
            f"{BASE_URL}/ai",
            json={
                "tool": "summarize_lab_report",
                "input": "Emocromo completo: Globuli rossi: 6.8 x10^12/L (rif. 5.5-8.5), Emoglobina: 14.2 g/dL (rif. 12-18), Globuli bianchi: 18.5 x10^9/L (rif. 5.5-16.9) ↑, Piastrine: 280 x10^9/L (rif. 175-500)",
                "context": {
                    "nome": "Max",
                    "specie": "Cane"
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") == True and data.get("tool") == "summarize_lab_report":
                result = data.get("result", "")
                if result and len(result) > 50:
                    # Check for disclaimer
                    has_disclaimer = "⚕️ Disclaimer" in result
                    if has_disclaimer:
                        print_test("POST /api/ai - Summarize Lab Report", True, 
                                  f"AI response received ({len(result)} chars) with medical disclaimer")
                        print(f"   Response preview: {result[:150]}...")
                        return True
                    else:
                        print_test("POST /api/ai - Summarize Lab Report", False, 
                                  "Response missing medical disclaimer")
                        return False
                else:
                    print_test("POST /api/ai - Summarize Lab Report", False, 
                              "Response too short or empty")
                    return False
            else:
                print_test("POST /api/ai - Summarize Lab Report", False, 
                          f"Invalid response structure: {data}")
                return False
        else:
            print_test("POST /api/ai - Summarize Lab Report", False, 
                      f"Status {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        print_test("POST /api/ai - Summarize Lab Report", False, f"Exception: {str(e)}")
        return False

def test_extract_dates():
    """Test 3: POST /api/ai with extract_dates tool"""
    print(f"\n📅 Test 3: POST /api/ai - Extract Dates")
    try:
        response = requests.post(
            f"{BASE_URL}/ai",
            json={
                "tool": "extract_dates",
                "input": "Vaccino antirabbica effettuato il 15/03/2025, richiamo previsto il 15/03/2026. Assicurazione scade il 30/06/2026."
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") == True and data.get("tool") == "extract_dates":
                result = data.get("result", "")
                if result and len(result) > 50:
                    # Check for disclaimer
                    has_disclaimer = "⚕️ Disclaimer" in result
                    if has_disclaimer:
                        print_test("POST /api/ai - Extract Dates", True, 
                                  f"AI response received ({len(result)} chars) with medical disclaimer")
                        print(f"   Response preview: {result[:150]}...")
                        return True
                    else:
                        print_test("POST /api/ai - Extract Dates", False, 
                                  "Response missing medical disclaimer")
                        return False
                else:
                    print_test("POST /api/ai - Extract Dates", False, 
                              "Response too short or empty")
                    return False
            else:
                print_test("POST /api/ai - Extract Dates", False, 
                          f"Invalid response structure: {data}")
                return False
        else:
            print_test("POST /api/ai - Extract Dates", False, 
                      f"Status {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        print_test("POST /api/ai - Extract Dates", False, f"Exception: {str(e)}")
        return False

def test_generate_pet_sitter_instructions():
    """Test 4: POST /api/ai with generate_pet_sitter_instructions tool"""
    print(f"\n🐕 Test 4: POST /api/ai - Generate Pet Sitter Instructions")
    try:
        response = requests.post(
            f"{BASE_URL}/ai",
            json={
                "tool": "generate_pet_sitter_instructions",
                "input": "Genera istruzioni per il pet sitter di Max.",
                "context": {
                    "nome": "Max",
                    "specie": "Cane",
                    "razza": "Golden Retriever",
                    "allergie": "Pollo, Grano",
                    "farmaci": "Nessuno",
                    "dieta": "Non indicata"
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") == True and data.get("tool") == "generate_pet_sitter_instructions":
                result = data.get("result", "")
                if result and len(result) > 100:
                    # Check for disclaimer
                    has_disclaimer = "⚕️ Disclaimer" in result
                    if has_disclaimer:
                        print_test("POST /api/ai - Generate Pet Sitter Instructions", True, 
                                  f"AI response received ({len(result)} chars) with medical disclaimer")
                        print(f"   Response preview: {result[:150]}...")
                        return True
                    else:
                        print_test("POST /api/ai - Generate Pet Sitter Instructions", False, 
                                  "Response missing medical disclaimer")
                        return False
                else:
                    print_test("POST /api/ai - Generate Pet Sitter Instructions", False, 
                              "Response too short or empty")
                    return False
            else:
                print_test("POST /api/ai - Generate Pet Sitter Instructions", False, 
                          f"Invalid response structure: {data}")
                return False
        else:
            print_test("POST /api/ai - Generate Pet Sitter Instructions", False, 
                      f"Status {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        print_test("POST /api/ai - Generate Pet Sitter Instructions", False, f"Exception: {str(e)}")
        return False

def test_generate_travel_checklist():
    """Test 5: POST /api/ai with generate_travel_checklist tool"""
    print(f"\n✈️ Test 5: POST /api/ai - Generate Travel Checklist")
    try:
        response = requests.post(
            f"{BASE_URL}/ai",
            json={
                "tool": "generate_travel_checklist",
                "input": "Viaggio in auto a Barcellona (Spagna) dal 15 al 25 agosto.",
                "context": {
                    "nome": "Max",
                    "vaccini": "Antirabbica - 15/03/2025 (prossimo: 15/03/2026)"
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") == True and data.get("tool") == "generate_travel_checklist":
                result = data.get("result", "")
                if result and len(result) > 100:
                    # Check for disclaimer
                    has_disclaimer = "⚕️ Disclaimer" in result
                    if has_disclaimer:
                        print_test("POST /api/ai - Generate Travel Checklist", True, 
                                  f"AI response received ({len(result)} chars) with medical disclaimer")
                        print(f"   Response preview: {result[:150]}...")
                        return True
                    else:
                        print_test("POST /api/ai - Generate Travel Checklist", False, 
                                  "Response missing medical disclaimer")
                        return False
                else:
                    print_test("POST /api/ai - Generate Travel Checklist", False, 
                              "Response too short or empty")
                    return False
            else:
                print_test("POST /api/ai - Generate Travel Checklist", False, 
                          f"Invalid response structure: {data}")
                return False
        else:
            print_test("POST /api/ai - Generate Travel Checklist", False, 
                      f"Status {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        print_test("POST /api/ai - Generate Travel Checklist", False, f"Exception: {str(e)}")
        return False

def test_passport_suggest_missing():
    """Test 6: POST /api/ai with passport_suggest_missing tool"""
    print(f"\n📊 Test 6: POST /api/ai - Passport Suggest Missing")
    try:
        response = requests.post(
            f"{BASE_URL}/ai",
            json={
                "tool": "passport_suggest_missing",
                "input": "Analizza il Passport di Max e suggerisci cosa manca.",
                "context": {
                    "nome": "Max",
                    "specie": "Cane",
                    "razza": "Golden Retriever",
                    "completamentoPassport": "83%",
                    "datiMancanti": "photo, documents",
                    "qrAttivo": "Sì",
                    "lostPetMode": "No"
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") == True and data.get("tool") == "passport_suggest_missing":
                result = data.get("result", "")
                if result and len(result) > 100:
                    # Check for disclaimer
                    has_disclaimer = "⚕️ Disclaimer" in result
                    if has_disclaimer:
                        print_test("POST /api/ai - Passport Suggest Missing", True, 
                                  f"AI response received ({len(result)} chars) with medical disclaimer")
                        print(f"   Response preview: {result[:150]}...")
                        return True
                    else:
                        print_test("POST /api/ai - Passport Suggest Missing", False, 
                                  "Response missing medical disclaimer")
                        return False
                else:
                    print_test("POST /api/ai - Passport Suggest Missing", False, 
                              "Response too short or empty")
                    return False
            else:
                print_test("POST /api/ai - Passport Suggest Missing", False, 
                          f"Invalid response structure: {data}")
                return False
        else:
            print_test("POST /api/ai - Passport Suggest Missing", False, 
                      f"Status {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        print_test("POST /api/ai - Passport Suggest Missing", False, f"Exception: {str(e)}")
        return False

def test_non_passport_tool_no_disclaimer():
    """Test 7-8: Verify non-passport tools do NOT contain disclaimer"""
    print(f"\n🔍 Test 7-8: Verify Non-Passport Tools (No Disclaimer)")
    
    # Test summarize_visit (non-passport tool)
    print(f"\n   Testing summarize_visit (should NOT have disclaimer)...")
    try:
        response = requests.post(
            f"{BASE_URL}/ai",
            json={
                "tool": "summarize_visit",
                "input": "Visita di controllo per Max. Cane in buona salute, peso 25kg. Nessuna anomalia rilevata."
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            result = data.get("result", "")
            has_disclaimer = "⚕️ Disclaimer" in result
            
            if not has_disclaimer:
                print_test("Non-Passport Tool (summarize_visit) - No Disclaimer", True, 
                          f"Correctly does NOT contain disclaimer ({len(result)} chars)")
            else:
                print_test("Non-Passport Tool (summarize_visit) - No Disclaimer", False, 
                          "Incorrectly contains disclaimer")
                return False
        else:
            print_test("Non-Passport Tool (summarize_visit) - No Disclaimer", False, 
                      f"Status {response.status_code}")
            return False
    except Exception as e:
        print_test("Non-Passport Tool (summarize_visit) - No Disclaimer", False, f"Exception: {str(e)}")
        return False
    
    # Test draft_message (non-passport tool)
    print(f"\n   Testing draft_message (should NOT have disclaimer)...")
    try:
        response = requests.post(
            f"{BASE_URL}/ai",
            json={
                "tool": "draft_message",
                "input": "Scrivi un messaggio per confermare l'appuntamento di domani alle 10:00 per Max."
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            result = data.get("result", "")
            has_disclaimer = "⚕️ Disclaimer" in result
            
            if not has_disclaimer:
                print_test("Non-Passport Tool (draft_message) - No Disclaimer", True, 
                          f"Correctly does NOT contain disclaimer ({len(result)} chars)")
                return True
            else:
                print_test("Non-Passport Tool (draft_message) - No Disclaimer", False, 
                          "Incorrectly contains disclaimer")
                return False
        else:
            print_test("Non-Passport Tool (draft_message) - No Disclaimer", False, 
                      f"Status {response.status_code}")
            return False
    except Exception as e:
        print_test("Non-Passport Tool (draft_message) - No Disclaimer", False, f"Exception: {str(e)}")
        return False

def test_invalid_tool():
    """Test 9: POST /api/ai with invalid tool"""
    print(f"\n❌ Test 9: POST /api/ai - Invalid Tool (Error Handling)")
    try:
        response = requests.post(
            f"{BASE_URL}/ai",
            json={
                "tool": "invalid_tool",
                "input": "test"
            },
            timeout=10
        )
        
        if response.status_code == 400:
            data = response.json()
            if "error" in data:
                print_test("POST /api/ai - Invalid Tool Error", True, 
                          f"Correctly returns 400 with error: {data['error']}")
                return True
            else:
                print_test("POST /api/ai - Invalid Tool Error", False, 
                          "Status 400 but missing error message")
                return False
        else:
            print_test("POST /api/ai - Invalid Tool Error", False, 
                      f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print_test("POST /api/ai - Invalid Tool Error", False, f"Exception: {str(e)}")
        return False

def test_missing_input():
    """Test 10: POST /api/ai with missing input"""
    print(f"\n❌ Test 10: POST /api/ai - Missing Input (Error Handling)")
    try:
        response = requests.post(
            f"{BASE_URL}/ai",
            json={
                "tool": "summarize_lab_report"
                # Missing "input" field
            },
            timeout=10
        )
        
        if response.status_code == 400:
            data = response.json()
            if "error" in data:
                print_test("POST /api/ai - Missing Input Error", True, 
                          f"Correctly returns 400 with error: {data['error']}")
                return True
            else:
                print_test("POST /api/ai - Missing Input Error", False, 
                          "Status 400 but missing error message")
                return False
        else:
            print_test("POST /api/ai - Missing Input Error", False, 
                      f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print_test("POST /api/ai - Missing Input Error", False, f"Exception: {str(e)}")
        return False

def main():
    print("=" * 80)
    print("VetBuddy Passport AI Assistant Backend API Testing")
    print("Base URL:", BASE_URL)
    print("=" * 80)
    
    # Test 1: GET /api/ai - List tools
    test_get_ai_tools()
    
    # Test 2: POST /api/ai - summarize_lab_report
    test_summarize_lab_report()
    time.sleep(1)  # Small delay between AI calls
    
    # Test 3: POST /api/ai - extract_dates
    test_extract_dates()
    time.sleep(1)
    
    # Test 4: POST /api/ai - generate_pet_sitter_instructions
    test_generate_pet_sitter_instructions()
    time.sleep(1)
    
    # Test 5: POST /api/ai - generate_travel_checklist
    test_generate_travel_checklist()
    time.sleep(1)
    
    # Test 6: POST /api/ai - passport_suggest_missing
    test_passport_suggest_missing()
    time.sleep(1)
    
    # Test 7-8: Verify non-passport tools do NOT have disclaimer
    test_non_passport_tool_no_disclaimer()
    time.sleep(1)
    
    # Test 9: Invalid tool error handling
    test_invalid_tool()
    
    # Test 10: Missing input error handling
    test_missing_input()
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"✅ Passed: {tests_passed}")
    print(f"❌ Failed: {tests_failed}")
    print(f"📊 Total: {tests_passed + tests_failed}")
    if tests_passed + tests_failed > 0:
        print(f"📈 Success Rate: {(tests_passed / (tests_passed + tests_failed) * 100):.1f}%")
    print("=" * 80)
    
    if tests_failed > 0:
        print("\n⚠️ Some tests failed. Review the output above for details.")
        sys.exit(1)
    else:
        print("\n🎉 All tests passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()
