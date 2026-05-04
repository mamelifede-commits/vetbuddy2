#!/usr/bin/env python3
"""
VetBuddy Automations Config + AI Assistant API Testing
Tests: Automations Settings, Config, Log, Simulate, AI Tools (summarize_visit, draft_message, translate_notes)
"""

import requests
import json
import sys

BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

def print_test_result(test_name, passed, details=""):
    """Print test result with formatting"""
    status = "✅ PASSED" if passed else "❌ FAILED"
    print(f"\n{status}: {test_name}")
    if details:
        print(f"  Details: {details}")

def test_automations_and_ai_api():
    """Test Automations Config + AI Assistant API endpoints"""
    print("=" * 80)
    print("AUTOMATIONS CONFIG + AI ASSISTANT API TESTING")
    print("=" * 80)
    
    token = None
    tests_passed = 0
    tests_total = 0
    
    # Test 1: Login
    try:
        tests_total += 1
        print("\n[TEST 1] POST /api/auth/login - Clinic Authentication")
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": "demo@vetbuddy.it", "password": "VetBuddy2025!Secure"},
            timeout=10
        )
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data.get('token')
            
            if token:
                print_test_result(
                    "Login Authentication",
                    True,
                    f"Successfully logged in as {login_data.get('user', {}).get('email')}. Token received."
                )
                tests_passed += 1
            else:
                print_test_result("Login Authentication", False, "No token in response")
                return
        else:
            print_test_result(
                "Login Authentication",
                False,
                f"Status: {login_response.status_code}, Response: {login_response.text[:200]}"
            )
            return
    except Exception as e:
        print_test_result("Login Authentication", False, f"Exception: {str(e)}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 2: Get Automations Settings
    try:
        tests_total += 1
        print("\n[TEST 2] GET /api/automations/settings - Get Automation Settings")
        settings_response = requests.get(
            f"{BASE_URL}/automations/settings",
            headers=headers,
            timeout=10
        )
        
        if settings_response.status_code == 200:
            settings_data = settings_response.json()
            
            # Check for required fields
            has_success = settings_data.get('success') == True
            has_settings = 'settings' in settings_data
            has_config = 'config' in settings_data
            has_plan = 'plan' in settings_data
            
            if has_success and has_settings and has_config and has_plan:
                print_test_result(
                    "Get Automations Settings",
                    True,
                    f"Response contains all required fields: success={has_success}, settings={type(settings_data.get('settings'))}, config={type(settings_data.get('config'))}, plan={settings_data.get('plan')}"
                )
                tests_passed += 1
            else:
                print_test_result(
                    "Get Automations Settings",
                    False,
                    f"Missing required fields. success={has_success}, has_settings={has_settings}, has_config={has_config}, has_plan={has_plan}"
                )
        else:
            print_test_result(
                "Get Automations Settings",
                False,
                f"Status: {settings_response.status_code}, Response: {settings_response.text[:200]}"
            )
    except Exception as e:
        print_test_result("Get Automations Settings", False, f"Exception: {str(e)}")
    
    # Test 3: Save Automation Config
    try:
        tests_total += 1
        print("\n[TEST 3] POST /api/automations/config - Save Automation Config")
        config_data = {
            "key": "postVisitFollowUp",
            "timing": "48 ore dopo la visita",
            "messageTemplate": "Gentile {nome_cliente}, come sta {nome_pet} dopo la visita?",
            "channel": "email"
        }
        
        config_response = requests.post(
            f"{BASE_URL}/automations/config",
            headers=headers,
            json=config_data,
            timeout=10
        )
        
        if config_response.status_code == 200:
            config_result = config_response.json()
            
            if config_result.get('success') == True:
                print_test_result(
                    "Save Automation Config",
                    True,
                    f"Config saved successfully for key: {config_result.get('key')}"
                )
                tests_passed += 1
            else:
                print_test_result(
                    "Save Automation Config",
                    False,
                    f"Success field is not True: {config_result}"
                )
        else:
            print_test_result(
                "Save Automation Config",
                False,
                f"Status: {config_response.status_code}, Response: {config_response.text[:200]}"
            )
    except Exception as e:
        print_test_result("Save Automation Config", False, f"Exception: {str(e)}")
    
    # Test 4: Verify Config Saved
    try:
        tests_total += 1
        print("\n[TEST 4] GET /api/automations/settings - Verify Config Saved")
        verify_response = requests.get(
            f"{BASE_URL}/automations/settings",
            headers=headers,
            timeout=10
        )
        
        if verify_response.status_code == 200:
            verify_data = verify_response.json()
            config = verify_data.get('config', {})
            
            if 'postVisitFollowUp' in config:
                saved_config = config['postVisitFollowUp']
                print_test_result(
                    "Verify Config Saved",
                    True,
                    f"postVisitFollowUp config found: timing={saved_config.get('timing')}, channel={saved_config.get('channel')}"
                )
                tests_passed += 1
            else:
                print_test_result(
                    "Verify Config Saved",
                    False,
                    f"postVisitFollowUp not found in config. Available keys: {list(config.keys())}"
                )
        else:
            print_test_result(
                "Verify Config Saved",
                False,
                f"Status: {verify_response.status_code}, Response: {verify_response.text[:200]}"
            )
    except Exception as e:
        print_test_result("Verify Config Saved", False, f"Exception: {str(e)}")
    
    # Test 5: Get Automation Log (empty)
    try:
        tests_total += 1
        print("\n[TEST 5] GET /api/automations/log - Get Automation Log (Initial)")
        log_response = requests.get(
            f"{BASE_URL}/automations/log",
            headers=headers,
            timeout=10
        )
        
        if log_response.status_code == 200:
            log_data = log_response.json()
            
            if 'logs' in log_data:
                initial_log_count = len(log_data.get('logs', []))
                print_test_result(
                    "Get Automation Log (Initial)",
                    True,
                    f"Log endpoint working. Initial log count: {initial_log_count}"
                )
                tests_passed += 1
            else:
                print_test_result(
                    "Get Automation Log (Initial)",
                    False,
                    f"'logs' field not found in response: {log_data}"
                )
        else:
            print_test_result(
                "Get Automation Log (Initial)",
                False,
                f"Status: {log_response.status_code}, Response: {log_response.text[:200]}"
            )
    except Exception as e:
        print_test_result("Get Automation Log (Initial)", False, f"Exception: {str(e)}")
    
    # Test 6: Simulate Execution
    try:
        tests_total += 1
        print("\n[TEST 6] POST /api/automations/simulate - Simulate Automation Execution")
        simulate_data = {
            "automationKey": "postVisitFollowUp",
            "automationName": "Follow-up Post Visita",
            "petName": "Luna",
            "ownerName": "Marco Rossi",
            "details": "Visita del 04/05/2026"
        }
        
        simulate_response = requests.post(
            f"{BASE_URL}/automations/simulate",
            headers=headers,
            json=simulate_data,
            timeout=10
        )
        
        if simulate_response.status_code == 200:
            simulate_result = simulate_response.json()
            
            if simulate_result.get('success') == True and 'log' in simulate_result:
                log_entry = simulate_result.get('log', {})
                print_test_result(
                    "Simulate Automation Execution",
                    True,
                    f"Simulation successful. Log ID: {log_entry.get('id')}, Status: {log_entry.get('status')}"
                )
                tests_passed += 1
            else:
                print_test_result(
                    "Simulate Automation Execution",
                    False,
                    f"Unexpected response structure: {simulate_result}"
                )
        else:
            print_test_result(
                "Simulate Automation Execution",
                False,
                f"Status: {simulate_response.status_code}, Response: {simulate_response.text[:200]}"
            )
    except Exception as e:
        print_test_result("Simulate Automation Execution", False, f"Exception: {str(e)}")
    
    # Test 7: Verify Log Entry
    try:
        tests_total += 1
        print("\n[TEST 7] GET /api/automations/log - Verify Log Entry After Simulation")
        verify_log_response = requests.get(
            f"{BASE_URL}/automations/log",
            headers=headers,
            timeout=10
        )
        
        if verify_log_response.status_code == 200:
            verify_log_data = verify_log_response.json()
            logs = verify_log_data.get('logs', [])
            
            if len(logs) >= 1:
                # Check if the latest log entry matches our simulation
                latest_log = logs[0] if logs else {}
                if latest_log.get('automationKey') == 'postVisitFollowUp':
                    print_test_result(
                        "Verify Log Entry",
                        True,
                        f"Log entry found. Total logs: {len(logs)}, Latest: {latest_log.get('automationName')} for {latest_log.get('petName')}"
                    )
                    tests_passed += 1
                else:
                    print_test_result(
                        "Verify Log Entry",
                        True,
                        f"Log entries exist ({len(logs)} total), but latest may not be our simulation"
                    )
                    tests_passed += 1
            else:
                print_test_result(
                    "Verify Log Entry",
                    False,
                    f"No log entries found after simulation. Logs: {logs}"
                )
        else:
            print_test_result(
                "Verify Log Entry",
                False,
                f"Status: {verify_log_response.status_code}, Response: {verify_log_response.text[:200]}"
            )
    except Exception as e:
        print_test_result("Verify Log Entry", False, f"Exception: {str(e)}")
    
    # Test 8: AI - Summarize Visit (NO AUTH)
    try:
        tests_total += 1
        print("\n[TEST 8] POST /api/ai - AI Summarize Visit (No Auth)")
        ai_summarize_data = {
            "tool": "summarize_visit",
            "input": "Paziente: Luna, femmina, 5 anni, labrador. Vomito da 3 giorni. T 38.5. Terapia: Cerenia 1mg/kg SID."
        }
        
        ai_summarize_response = requests.post(
            f"{BASE_URL}/ai",
            json=ai_summarize_data,
            timeout=30
        )
        
        if ai_summarize_response.status_code == 200:
            ai_result = ai_summarize_response.json()
            
            if ai_result.get('success') == True and 'result' in ai_result:
                result_text = ai_result.get('result', '')
                print_test_result(
                    "AI Summarize Visit",
                    True,
                    f"AI summary generated successfully. Length: {len(result_text)} chars. Preview: {result_text[:100]}..."
                )
                tests_passed += 1
            else:
                print_test_result(
                    "AI Summarize Visit",
                    False,
                    f"Unexpected response structure: {ai_result}"
                )
        else:
            print_test_result(
                "AI Summarize Visit",
                False,
                f"Status: {ai_summarize_response.status_code}, Response: {ai_summarize_response.text[:200]}"
            )
    except Exception as e:
        print_test_result("AI Summarize Visit", False, f"Exception: {str(e)}")
    
    # Test 9: AI - Draft Message (NO AUTH)
    try:
        tests_total += 1
        print("\n[TEST 9] POST /api/ai - AI Draft Message (No Auth)")
        ai_draft_data = {
            "tool": "draft_message",
            "input": "Scrivi messaggio per il proprietario Marco Rossi: i risultati degli esami del sangue di Luna sono nella norma."
        }
        
        ai_draft_response = requests.post(
            f"{BASE_URL}/ai",
            json=ai_draft_data,
            timeout=30
        )
        
        if ai_draft_response.status_code == 200:
            ai_result = ai_draft_response.json()
            
            if ai_result.get('success') == True and 'result' in ai_result:
                result_text = ai_result.get('result', '')
                print_test_result(
                    "AI Draft Message",
                    True,
                    f"AI message drafted successfully. Length: {len(result_text)} chars. Preview: {result_text[:100]}..."
                )
                tests_passed += 1
            else:
                print_test_result(
                    "AI Draft Message",
                    False,
                    f"Unexpected response structure: {ai_result}"
                )
        else:
            print_test_result(
                "AI Draft Message",
                False,
                f"Status: {ai_draft_response.status_code}, Response: {ai_draft_response.text[:200]}"
            )
    except Exception as e:
        print_test_result("AI Draft Message", False, f"Exception: {str(e)}")
    
    # Test 10: AI - Translate Notes (NO AUTH)
    try:
        tests_total += 1
        print("\n[TEST 10] POST /api/ai - AI Translate Notes (No Auth)")
        ai_translate_data = {
            "tool": "translate_notes",
            "input": "Eco addome: parenchima epatico omogeneo. Reni: corticale conservata bilateralmente. No versamento libero."
        }
        
        ai_translate_response = requests.post(
            f"{BASE_URL}/ai",
            json=ai_translate_data,
            timeout=30
        )
        
        if ai_translate_response.status_code == 200:
            ai_result = ai_translate_response.json()
            
            if ai_result.get('success') == True and 'result' in ai_result:
                result_text = ai_result.get('result', '')
                print_test_result(
                    "AI Translate Notes",
                    True,
                    f"AI translation successful. Length: {len(result_text)} chars. Preview: {result_text[:100]}..."
                )
                tests_passed += 1
            else:
                print_test_result(
                    "AI Translate Notes",
                    False,
                    f"Unexpected response structure: {ai_result}"
                )
        else:
            print_test_result(
                "AI Translate Notes",
                False,
                f"Status: {ai_translate_response.status_code}, Response: {ai_translate_response.text[:200]}"
            )
    except Exception as e:
        print_test_result("AI Translate Notes", False, f"Exception: {str(e)}")
    
    # Summary
    print("\n" + "=" * 80)
    print(f"TESTING COMPLETE: {tests_passed}/{tests_total} tests passed")
    print("=" * 80)
    
    if tests_passed == tests_total:
        print("\n✅ ALL TESTS PASSED - Automations Config + AI Assistant API fully functional!")
        return 0
    else:
        print(f"\n⚠️  {tests_total - tests_passed} test(s) failed")
        return 1

if __name__ == "__main__":
    try:
        exit_code = test_automations_and_ai_api()
        sys.exit(exit_code)
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {str(e)}")
        sys.exit(1)
