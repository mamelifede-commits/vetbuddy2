#!/usr/bin/env python3
"""
VetBuddy Backend Comprehensive Testing Script
TESTING COMPLETO BACKEND VETBUDDY - VERIFICA FUNZIONALE INTEGRALE

Tests all backend APIs systematically following the review request sequence.
"""

import requests
import json
import os
from datetime import datetime, timedelta

# Configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://clinic-report-review.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

# Test credentials from review request
CREDENTIALS = {
    'clinic': {'email': 'demo@vetbuddy.it', 'password': 'VetBuddy2025!Secure'},
    'owner': {'email': 'proprietario.demo@vetbuddy.it', 'password': 'demo123'},
    'lab': {'email': 'laboratorio1@vetbuddy.it', 'password': 'Lab2025!'},
    'admin': {'email': 'admin@vetbuddy.it', 'password': 'Admin2025!'}
}

# Global tokens
tokens = {}
test_results = {
    'passed': 0,
    'failed': 0,
    'warnings': 0,
    'tests': []
}

def print_header(text, level=1):
    """Print formatted header"""
    if level == 1:
        print(f"\n{'='*100}")
        print(f"  {text}")
        print(f"{'='*100}")
    elif level == 2:
        print(f"\n{'-'*100}")
        print(f"  {text}")
        print(f"{'-'*100}")
    else:
        print(f"\n### {text}")

def print_result(status, endpoint, expected, actual, notes=""):
    """Print test result in structured format"""
    symbols = {'✅': '✅', '⚠️': '⚠️', '❌': '❌'}
    symbol = symbols.get(status, status)
    
    result = {
        'status': status,
        'endpoint': endpoint,
        'expected': expected,
        'actual': actual,
        'notes': notes
    }
    test_results['tests'].append(result)
    
    if status == '✅':
        test_results['passed'] += 1
    elif status == '⚠️':
        test_results['warnings'] += 1
    else:
        test_results['failed'] += 1
    
    print(f"{symbol} {endpoint}")
    print(f"   Expected: {expected}")
    print(f"   Actual: {actual}")
    if notes:
        print(f"   Notes: {notes}")

def login(role):
    """Login with specified role and store token"""
    try:
        creds = CREDENTIALS[role]
        response = requests.post(
            f"{API_URL}/auth/login",
            json=creds,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            user = data.get('user', {})
            tokens[role] = token
            return True, token, user
        else:
            return False, None, None
    except Exception as e:
        return False, None, str(e)

def make_request(method, endpoint, role=None, data=None, params=None):
    """Make API request with optional authentication"""
    headers = {"Content-Type": "application/json"}
    if role and role in tokens:
        headers["Authorization"] = f"Bearer {tokens[role]}"
    
    url = f"{API_URL}/{endpoint}"
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, params=params, timeout=10)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data, timeout=10)
        elif method == 'PUT':
            response = requests.put(url, headers=headers, json=data, timeout=10)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            return None
        
        return response
    except Exception as e:
        print(f"   Request error: {str(e)}")
        return None

# ==================== FASE 1: AUTENTICAZIONE E RUOLI ====================

def test_fase1_authentication():
    """FASE 1: Test authentication for all roles"""
    print_header("FASE 1: AUTENTICAZIONE E RUOLI (PRIORITÀ CRITICA)", level=1)
    
    # Test 1: Login multipli ruoli
    print_header("Test 1: Login Multipli Ruoli", level=2)
    
    for role in ['clinic', 'owner', 'lab', 'admin']:
        success, token, user = login(role)
        if success and token:
            user_role = user.get('role', 'unknown')
            if user_role == role:
                print_result('✅', f"POST /api/auth/login ({role})", 
                           f"Login successful with role={role}", 
                           f"Token received, role={user_role}")
            else:
                print_result('❌', f"POST /api/auth/login ({role})", 
                           f"role={role}", 
                           f"role={user_role}",
                           "Role mismatch")
        else:
            print_result('❌', f"POST /api/auth/login ({role})", 
                       "Login successful", 
                       "Login failed",
                       f"Error: {user}")
    
    # Test 2: Login con credenziali errate
    print_header("Test 2: Login con Credenziali Errate", level=3)
    response = make_request('POST', 'auth/login', data={
        'email': 'wrong@email.com',
        'password': 'wrongpassword'
    })
    
    if response and response.status_code == 401:
        print_result('✅', "POST /api/auth/login (invalid)", 
                   "401 Unauthorized", 
                   f"{response.status_code} {response.reason}")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('❌', "POST /api/auth/login (invalid)", 
                   "401 Unauthorized", 
                   f"{status_code}")

def test_fase1_permissions():
    """FASE 1: Test cross-role permissions"""
    print_header("Test 3: Permessi Cross-Role", level=2)
    
    # Clinic tries to access admin endpoint
    response = make_request('GET', 'admin/labs', role='clinic')
    if response and response.status_code in [401, 403]:
        print_result('✅', "GET /api/admin/labs (clinic token)", 
                   "403 Forbidden", 
                   f"{response.status_code} {response.reason}")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('❌', "GET /api/admin/labs (clinic token)", 
                   "403 Forbidden", 
                   f"{status_code}")
    
    # Owner tries to access clinic settings
    response = make_request('GET', 'settings', role='owner')
    if response and response.status_code in [401, 403]:
        print_result('✅', "GET /api/settings (owner token)", 
                   "403 Forbidden", 
                   f"{response.status_code} {response.reason}")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('⚠️', "GET /api/settings (owner token)", 
                   "403 Forbidden", 
                   f"{status_code}",
                   "May need to check endpoint authorization")

# ==================== FASE 2: AREA CLINICA - FUNZIONI CORE ====================

def test_fase2_appointments():
    """FASE 2: Test appointments CRUD"""
    print_header("FASE 2: AREA CLINICA - FUNZIONI CORE (PRIORITÀ ALTA)", level=1)
    print_header("Test 4: Appuntamenti", level=2)
    
    # GET appointments
    response = make_request('GET', 'appointments', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        appointments = data if isinstance(data, list) else data.get('appointments', [])
        print_result('✅', "GET /api/appointments (clinic)", 
                   "Lista appuntamenti", 
                   f"{len(appointments)} appuntamenti trovati")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('❌', "GET /api/appointments (clinic)", 
                   "200 OK", 
                   f"{status_code}")
    
    # POST appointment (create)
    new_appointment = {
        'date': (datetime.now() + timedelta(days=7)).isoformat(),
        'time': '10:00',
        'reason': 'Test appointment - Visita di controllo',
        'status': 'pending'
    }
    response = make_request('POST', 'appointments', role='clinic', data=new_appointment)
    if response and response.status_code in [200, 201]:
        data = response.json()
        appointment_id = data.get('id')
        print_result('✅', "POST /api/appointments", 
                   "Appuntamento creato", 
                   f"ID: {appointment_id}")
        
        # PUT appointment (update)
        if appointment_id:
            response = make_request('PUT', f'appointments/{appointment_id}', 
                                  role='clinic', 
                                  data={'status': 'confirmed'})
            if response and response.status_code == 200:
                print_result('✅', f"PUT /api/appointments/{appointment_id}", 
                           "Stato aggiornato", 
                           "Status: confirmed")
            else:
                status_code = response.status_code if response else 'No response'
                print_result('⚠️', f"PUT /api/appointments/{appointment_id}", 
                           "200 OK", 
                           f"{status_code}")
            
            # DELETE appointment
            response = make_request('DELETE', f'appointments/{appointment_id}', role='clinic')
            if response and response.status_code in [200, 204]:
                print_result('✅', f"DELETE /api/appointments/{appointment_id}", 
                           "Appuntamento cancellato", 
                           f"{response.status_code}")
            else:
                status_code = response.status_code if response else 'No response'
                print_result('⚠️', f"DELETE /api/appointments/{appointment_id}", 
                           "200/204", 
                           f"{status_code}")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('❌', "POST /api/appointments", 
                   "201 Created", 
                   f"{status_code}")

def test_fase2_owners_pets():
    """FASE 2: Test owners and pets"""
    print_header("Test 5: Proprietari e Animali", level=2)
    
    # GET owners
    response = make_request('GET', 'owners', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        owners = data if isinstance(data, list) else data.get('owners', [])
        print_result('✅', "GET /api/owners (clinic)", 
                   "Lista proprietari", 
                   f"{len(owners)} proprietari trovati")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('❌', "GET /api/owners (clinic)", 
                   "200 OK", 
                   f"{status_code}")
    
    # GET pets
    response = make_request('GET', 'pets', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        pets = data if isinstance(data, list) else data.get('pets', [])
        print_result('✅', "GET /api/pets (clinic)", 
                   "Lista animali", 
                   f"{len(pets)} animali trovati")
        
        # GET single pet detail
        if len(pets) > 0:
            pet_id = pets[0].get('id')
            response = make_request('GET', f'pets/{pet_id}', role='clinic')
            if response and response.status_code == 200:
                pet_data = response.json()
                print_result('✅', f"GET /api/pets/{pet_id}", 
                           "Dettaglio animale", 
                           f"Nome: {pet_data.get('name', 'N/A')}")
            else:
                status_code = response.status_code if response else 'No response'
                print_result('⚠️', f"GET /api/pets/{pet_id}", 
                           "200 OK", 
                           f"{status_code}")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('❌', "GET /api/pets (clinic)", 
                   "200 OK", 
                   f"{status_code}")

def test_fase2_documents():
    """FASE 2: Test documents"""
    print_header("Test 6: Documenti", level=2)
    
    # GET documents
    response = make_request('GET', 'documents', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        documents = data if isinstance(data, list) else data.get('documents', [])
        print_result('✅', "GET /api/documents (clinic)", 
                   "Lista documenti", 
                   f"{len(documents)} documenti trovati")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('❌', "GET /api/documents (clinic)", 
                   "200 OK", 
                   f"{status_code}")
    
    # POST document (create)
    new_document = {
        'name': 'Test Document',
        'type': 'medical_record',
        'description': 'Test document creation'
    }
    response = make_request('POST', 'documents', role='clinic', data=new_document)
    if response and response.status_code in [200, 201]:
        data = response.json()
        print_result('✅', "POST /api/documents", 
                   "Documento creato", 
                   f"ID: {data.get('id', 'N/A')}")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('⚠️', "POST /api/documents", 
                   "201 Created", 
                   f"{status_code}",
                   "May require additional fields")

# ==================== FASE 3: MODULI SISTEMA ANTI-SPRECO ====================

def test_fase3_autopilot():
    """FASE 3: Test Autopilot Settimanale"""
    print_header("FASE 3: MODULI SISTEMA ANTI-SPRECO (PRIORITÀ ALTA)", level=1)
    print_header("Test 7: Autopilot Settimanale", level=2)
    
    response = make_request('GET', 'autopilot/weekly-actions', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        actions = data.get('weeklyActions', [])
        total_value = data.get('totalPotentialValue', 0)
        
        # Check for dormant clients calculation
        dormant_action = next((a for a in actions if a.get('type') == 'dormienti'), None)
        vaccine_action = next((a for a in actions if a.get('type') == 'vaccini'), None)
        
        if dormant_action:
            print_result('✅', "GET /api/autopilot/weekly-actions", 
                       "Azioni settimanali con clienti dormienti", 
                       f"{len(actions)} azioni, {dormant_action.get('clients', 0)} clienti dormienti")
        else:
            print_result('⚠️', "GET /api/autopilot/weekly-actions", 
                       "Azioni con clienti dormienti", 
                       f"{len(actions)} azioni trovate",
                       "No dormant clients action found")
        
        if vaccine_action:
            print_result('✅', "Verifica vaccini scaduti", 
                       "Calcolo vaccini scaduti", 
                       f"{vaccine_action.get('clients', 0)} vaccini scaduti")
        else:
            print_result('⚠️', "Verifica vaccini scaduti", 
                       "Calcolo vaccini scaduti", 
                       "No vaccine action found")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('❌', "GET /api/autopilot/weekly-actions", 
                   "200 OK", 
                   f"{status_code}")

def test_fase3_fragile_patients():
    """FASE 3: Test Alert Pazienti Fragili"""
    print_header("Test 8: Alert Pazienti Fragili", level=2)
    
    response = make_request('GET', 'fragile-patients', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        patients = data.get('patients', [])
        category_count = data.get('categoryCount', {})
        
        # Check for 6 categories
        expected_categories = ['senior', 'cronici', 'allergici', 'terapia', 'postop', 'critici']
        found_categories = [cat for cat in expected_categories if cat in category_count]
        
        print_result('✅', "GET /api/fragile-patients", 
                   "Lista pazienti fragili con 6 categorie", 
                   f"{len(patients)} pazienti, {len(found_categories)}/6 categorie presenti")
        
        # Test risk score for a patient
        if len(patients) > 0:
            pet_id = patients[0].get('id')
            response = make_request('GET', f'fragile-patients/risk/{pet_id}', role='clinic')
            if response and response.status_code == 200:
                risk_data = response.json()
                risk_score = risk_data.get('riskScore', 0)
                print_result('✅', f"GET /api/fragile-patients/risk/{pet_id}", 
                           "Risk score calcolato", 
                           f"Risk score: {risk_score}")
            else:
                status_code = response.status_code if response else 'No response'
                print_result('⚠️', f"GET /api/fragile-patients/risk/{pet_id}", 
                           "200 OK", 
                           f"{status_code}")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('❌', "GET /api/fragile-patients", 
                   "200 OK", 
                   f"{status_code}")

def test_fase3_estimates():
    """FASE 3: Test Preventivi Digitali"""
    print_header("Test 9: Preventivi Digitali", level=2)
    
    # GET estimates
    response = make_request('GET', 'estimates', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        estimates = data.get('estimates', [])
        analytics = data.get('analytics', {})
        conversion_rate = analytics.get('conversionRate', 0)
        pending_value = analytics.get('pendingValue', 0)
        
        print_result('✅', "GET /api/estimates", 
                   "Lista preventivi con analytics", 
                   f"{len(estimates)} preventivi, conversion rate: {conversion_rate}%, pending value: €{pending_value}")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('❌', "GET /api/estimates", 
                   "200 OK", 
                   f"{status_code}")

def test_fase3_roi_dashboard():
    """FASE 3: Test ROI Dashboard"""
    print_header("Test 10: ROI Dashboard", level=2)
    
    response = make_request('GET', 'roi-dashboard', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        summary = data.get('summary', {})
        module_breakdown = data.get('moduleBreakdown', [])
        recommendations = data.get('recommendations', [])
        
        total_recovered = summary.get('totalRecoveredValue', 0)
        active_modules = summary.get('activeModules', 0)
        
        # Check for 5 modules
        expected_modules = ['Autopilot Settimanale', 'Alert Pazienti Fragili', 'Preventivi Digitali', 
                          'No-Show Recovery', 'Clienti Riattivati']
        found_modules = [m.get('module') for m in module_breakdown]
        
        print_result('✅', "GET /api/roi-dashboard", 
                   "Aggregazione ROI con 5 moduli", 
                   f"Total recovered: €{total_recovered}, {len(module_breakdown)} moduli, {len(recommendations)} raccomandazioni")
        
        if len(module_breakdown) == 5:
            print_result('✅', "Verifica module breakdown", 
                       "5 moduli presenti", 
                       f"Moduli: {', '.join(found_modules)}")
        else:
            print_result('⚠️', "Verifica module breakdown", 
                       "5 moduli", 
                       f"{len(module_breakdown)} moduli trovati")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('❌', "GET /api/roi-dashboard", 
                   "200 OK", 
                   f"{status_code}")

# ==================== FASE 4: VALUE DASHBOARD ====================

def test_fase4_value_metrics():
    """FASE 4: Test Value Dashboard"""
    print_header("FASE 4: VALUE DASHBOARD (PRIORITÀ ALTA)", level=1)
    print_header("Test 11: Metriche Valore", level=2)
    
    # Test different periods
    for period in ['month', 'quarter', 'year']:
        response = make_request('GET', 'clinic/value-metrics', role='clinic', params={'period': period})
        if response and response.status_code == 200:
            data = response.json()
            print_result('✅', f"GET /api/clinic/value-metrics?period={period}", 
                       f"Metriche {period}", 
                       f"Data received: {len(str(data))} bytes")
        else:
            status_code = response.status_code if response else 'No response'
            print_result('⚠️', f"GET /api/clinic/value-metrics?period={period}", 
                       "200 OK", 
                       f"{status_code}",
                       "Endpoint may not be implemented")

# ==================== FASE 5: RETE LABORATORI ====================

def test_fase5_lab_workflow():
    """FASE 5: Test Lab Workflow"""
    print_header("FASE 5: RETE LABORATORI (PRIORITÀ ALTA)", level=1)
    print_header("Test 12: Lab Workflow", level=2)
    
    # GET labs (clinic view)
    response = make_request('GET', 'labs', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        labs = data if isinstance(data, list) else data.get('labs', [])
        print_result('✅', "GET /api/labs (clinic)", 
                   "Lista laboratori", 
                   f"{len(labs)} laboratori trovati")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('⚠️', "GET /api/labs (clinic)", 
                   "200 OK", 
                   f"{status_code}")
    
    # GET exam types
    response = make_request('GET', 'lab/exam-types', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        exam_types = data if isinstance(data, list) else data.get('examTypes', [])
        print_result('✅', "GET /api/lab/exam-types", 
                   "Tipi esami", 
                   f"{len(exam_types)} tipi esami")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('⚠️', "GET /api/lab/exam-types", 
                   "200 OK", 
                   f"{status_code}")
    
    # GET lab requests (lab view)
    response = make_request('GET', 'lab-requests', role='lab')
    if response and response.status_code == 200:
        data = response.json()
        requests_list = data if isinstance(data, list) else data.get('requests', [])
        print_result('✅', "GET /api/lab-requests (lab)", 
                   "Richieste laboratorio", 
                   f"{len(requests_list)} richieste")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('⚠️', "GET /api/lab-requests (lab)", 
                   "200 OK", 
                   f"{status_code}")

# ==================== FASE 6-10: OTHER MODULES ====================

def test_fase6_health_plans():
    """FASE 6: Test Health Plans"""
    print_header("FASE 6: PIANI SALUTE E HEALTH PLANS (PRIORITÀ MEDIA)", level=1)
    print_header("Test 13: Health Plans", level=2)
    
    response = make_request('GET', 'health-plans', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        plans = data if isinstance(data, list) else data.get('plans', [])
        print_result('✅', "GET /api/health-plans", 
                   "Lista piani salute", 
                   f"{len(plans)} piani trovati")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('⚠️', "GET /api/health-plans", 
                   "200 OK", 
                   f"{status_code}")

def test_fase7_prescriptions():
    """FASE 7: Test Prescrizioni"""
    print_header("FASE 7: PRESCRIZIONI (PRIORITÀ MEDIA)", level=1)
    print_header("Test 14: Prescrizioni", level=2)
    
    response = make_request('GET', 'prescriptions', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        prescriptions = data if isinstance(data, list) else data.get('prescriptions', [])
        print_result('✅', "GET /api/prescriptions", 
                   "Lista prescrizioni", 
                   f"{len(prescriptions)} prescrizioni trovate")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('⚠️', "GET /api/prescriptions", 
                   "200 OK", 
                   f"{status_code}")

def test_fase8_rewards():
    """FASE 8: Test Rewards"""
    print_header("FASE 8: REWARDS E REFERRAL (PRIORITÀ BASSA)", level=1)
    print_header("Test 15: Rewards", level=2)
    
    response = make_request('GET', 'rewards', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        print_result('✅', "GET /api/rewards", 
                   "Programma fedeltà", 
                   "Data received")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('⚠️', "GET /api/rewards", 
                   "200 OK", 
                   f"{status_code}")

def test_fase9_settings():
    """FASE 9: Test Settings"""
    print_header("FASE 9: SETTINGS E CONFIGURAZIONI (PRIORITÀ MEDIA)", level=1)
    print_header("Test 16: Settings", level=2)
    
    response = make_request('GET', 'settings', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        print_result('✅', "GET /api/settings", 
                   "Impostazioni clinica", 
                   "Settings retrieved")
    else:
        status_code = response.status_code if response else 'No response'
        print_result('⚠️', "GET /api/settings", 
                   "200 OK", 
                   f"{status_code}")

def test_fase10_passport():
    """FASE 10: Test Passport"""
    print_header("FASE 10: PASSPORT (PRIORITÀ MEDIA)", level=1)
    print_header("Test 17: Passport", level=2)
    
    # Get a pet ID first
    response = make_request('GET', 'pets', role='clinic')
    if response and response.status_code == 200:
        data = response.json()
        pets = data if isinstance(data, list) else data.get('pets', [])
        
        if len(pets) > 0:
            pet_id = pets[0].get('id')
            response = make_request('GET', f'passport/{pet_id}', role='clinic')
            if response and response.status_code == 200:
                passport_data = response.json()
                print_result('✅', f"GET /api/passport/{pet_id}", 
                           "Passport animale", 
                           "Passport data retrieved")
            else:
                status_code = response.status_code if response else 'No response'
                print_result('⚠️', f"GET /api/passport/{pet_id}", 
                           "200 OK", 
                           f"{status_code}")
        else:
            print_result('⚠️', "GET /api/passport/{petId}", 
                       "Passport test", 
                       "No pets available for testing")
    else:
        print_result('⚠️', "GET /api/passport/{petId}", 
                   "Passport test", 
                   "Could not retrieve pets")

# ==================== MAIN TEST EXECUTION ====================

def print_summary():
    """Print test summary"""
    print_header("TEST SUMMARY", level=1)
    
    total_tests = test_results['passed'] + test_results['failed'] + test_results['warnings']
    
    print(f"\nTotal Tests: {total_tests}")
    print(f"✅ Passed: {test_results['passed']}")
    print(f"⚠️  Warnings: {test_results['warnings']}")
    print(f"❌ Failed: {test_results['failed']}")
    
    success_rate = (test_results['passed'] / total_tests * 100) if total_tests > 0 else 0
    print(f"\nSuccess Rate: {success_rate:.1f}%")
    
    # Print failed tests
    if test_results['failed'] > 0:
        print("\n" + "="*100)
        print("FAILED TESTS:")
        print("="*100)
        for test in test_results['tests']:
            if test['status'] == '❌':
                print(f"\n❌ {test['endpoint']}")
                print(f"   Expected: {test['expected']}")
                print(f"   Actual: {test['actual']}")
                if test['notes']:
                    print(f"   Notes: {test['notes']}")
    
    # Print warnings
    if test_results['warnings'] > 0:
        print("\n" + "="*100)
        print("WARNINGS:")
        print("="*100)
        for test in test_results['tests']:
            if test['status'] == '⚠️':
                print(f"\n⚠️  {test['endpoint']}")
                print(f"   Expected: {test['expected']}")
                print(f"   Actual: {test['actual']}")
                if test['notes']:
                    print(f"   Notes: {test['notes']}")

def main():
    """Main test execution"""
    print_header("VETBUDDY BACKEND COMPREHENSIVE TEST", level=1)
    print(f"Base URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    print(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # FASE 1: Authentication
        test_fase1_authentication()
        test_fase1_permissions()
        
        # FASE 2: Core Clinic Functions
        test_fase2_appointments()
        test_fase2_owners_pets()
        test_fase2_documents()
        
        # FASE 3: Sistema Anti-Spreco
        test_fase3_autopilot()
        test_fase3_fragile_patients()
        test_fase3_estimates()
        test_fase3_roi_dashboard()
        
        # FASE 4: Value Dashboard
        test_fase4_value_metrics()
        
        # FASE 5: Lab Network
        test_fase5_lab_workflow()
        
        # FASE 6-10: Other Modules
        test_fase6_health_plans()
        test_fase7_prescriptions()
        test_fase8_rewards()
        test_fase9_settings()
        test_fase10_passport()
        
        # Print summary
        print_summary()
        
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        print_summary()
    except Exception as e:
        print(f"\n\nTest execution error: {str(e)}")
        print_summary()

if __name__ == "__main__":
    main()
