#!/usr/bin/env python3
"""
VetBuddy Connect Module + Updated Pricing Plans - Comprehensive Backend Testing
Test del NUOVO modulo backend "VetBuddy Connect" + aggiornamento prezzi piani
"""

import requests
import json
import time
from datetime import datetime
from pymongo import MongoClient
import os

# Configuration
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"
MONGO_URL = os.getenv("MONGO_URL", "mongodb+srv://mamelifede_db_user:8XjA0yK3dnnyxy0M@cluster0.kk2vrpt.mongodb.net/vetbuddy")
DB_NAME = "vetbuddy"

# Test credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"
LAB_EMAIL = "laboratorio1@vetbuddy.it"
LAB_PASSWORD = "Lab2025!"
OWNER_EMAIL = "proprietario.demo@vetbuddy.it"
OWNER_PASSWORD = "demo123"

# Global tokens
clinic_token = None
lab_token = None
owner_token = None

# Test data storage
test_invitation_id = None
test_invitation_token = None
test_invitation_id_2 = None

def print_test_header(test_name):
    """Print formatted test header"""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(success, message):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")

def login(email, password, role_name):
    """Login and return JWT token"""
    print_test_header(f"Login {role_name}")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            print_result(True, f"{role_name} login successful, token received")
            return token
        else:
            print_result(False, f"{role_name} login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print_result(False, f"{role_name} login error: {str(e)}")
        return None

def get_mongo_client():
    """Get MongoDB client"""
    return MongoClient(MONGO_URL)

# ==================== TEST 1: PREZZI PIANI AGGIORNATI ====================
def test_1_pricing_plans():
    """TEST 1 - PREZZI PIANI AGGIORNATI"""
    print_test_header("TEST 1 - Prezzi Piani Aggiornati")
    
    try:
        response = requests.get(f"{BASE_URL}/stripe/plans")
        
        if response.status_code != 200:
            print_result(False, f"GET /stripe/plans failed: {response.status_code}")
            return False
        
        plans = response.json()
        
        # Verify starter plan
        if 'starter' not in plans:
            print_result(False, "Starter plan not found")
            return False
        if plans['starter']['price'] != 29:
            print_result(False, f"Starter price wrong: {plans['starter']['price']} (expected 29)")
            return False
        if plans['starter']['trialDays'] != 14:
            print_result(False, f"Starter trialDays wrong: {plans['starter']['trialDays']} (expected 14)")
            return False
        print_result(True, f"Starter plan: price={plans['starter']['price']}, trialDays={plans['starter']['trialDays']}")
        
        # Verify growth plan (NEW)
        if 'growth' not in plans:
            print_result(False, "Growth plan not found (NEW PLAN)")
            return False
        if plans['growth']['price'] != 69:
            print_result(False, f"Growth price wrong: {plans['growth']['price']} (expected 69)")
            return False
        if plans['growth']['trialDays'] != 14:
            print_result(False, f"Growth trialDays wrong: {plans['growth']['trialDays']} (expected 14)")
            return False
        print_result(True, f"Growth plan (NEW): price={plans['growth']['price']}, trialDays={plans['growth']['trialDays']}")
        
        # Verify pro plan
        if 'pro' not in plans:
            print_result(False, "Pro plan not found")
            return False
        if plans['pro']['price'] != 99:
            print_result(False, f"Pro price wrong: {plans['pro']['price']} (expected 99)")
            return False
        if plans['pro']['trialDays'] != 90:
            print_result(False, f"Pro trialDays wrong: {plans['pro']['trialDays']} (expected 90)")
            return False
        print_result(True, f"Pro plan: price={plans['pro']['price']}, trialDays={plans['pro']['trialDays']}")
        
        # Verify lab_partner plan
        if 'lab_partner' not in plans:
            print_result(False, "Lab_partner plan not found")
            return False
        if plans['lab_partner']['price'] != 39:
            print_result(False, f"Lab_partner price wrong: {plans['lab_partner']['price']} (expected 39)")
            return False
        if plans['lab_partner']['trialDays'] != 180:
            print_result(False, f"Lab_partner trialDays wrong: {plans['lab_partner']['trialDays']} (expected 180)")
            return False
        print_result(True, f"Lab_partner plan: price={plans['lab_partner']['price']}, trialDays={plans['lab_partner']['trialDays']}")
        
        # Verify enterprise plan
        if 'enterprise' not in plans:
            print_result(False, "Enterprise plan not found")
            return False
        if plans['enterprise']['price'] != 0:
            print_result(False, f"Enterprise price wrong: {plans['enterprise']['price']} (expected 0)")
            return False
        print_result(True, f"Enterprise plan: price={plans['enterprise']['price']}")
        
        print_result(True, "All pricing plans verified successfully")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

# ==================== TEST 2: INVITI CONNECT (singolo) ====================
def test_2_connect_invites():
    """TEST 2 - INVITI CONNECT (singolo)"""
    global test_invitation_id, test_invitation_token, test_invitation_id_2
    
    # 2.1 - CLINIC → OWNER
    print_test_header("TEST 2.1 - POST /connect/invite (CLINIC → OWNER)")
    try:
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            json={
                "type": "clinic_to_owner",
                "toEmail": "test_owner_invite@example.com",
                "toName": "Test Owner",
                "message": "Vieni su VetBuddy!"
            },
            headers={"Authorization": f"Bearer {clinic_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('invitation'):
                inv = data['invitation']
                test_invitation_id = inv.get('id')
                print_result(True, f"Invitation created: id={test_invitation_id}, type={inv.get('type')}, status={inv.get('status')}")
                
                # Get token from MongoDB
                client = get_mongo_client()
                db = client[DB_NAME]
                invitation_doc = db.invitations.find_one({"id": test_invitation_id})
                if invitation_doc:
                    test_invitation_token = invitation_doc.get('token')
                    print_result(True, f"Token retrieved from DB: {test_invitation_token[:20]}...")
                client.close()
            else:
                print_result(False, f"Invalid response structure: {data}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 2.2 - CLINIC → LAB
    print_test_header("TEST 2.2 - POST /connect/invite (CLINIC → LAB)")
    try:
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            json={
                "type": "clinic_to_lab",
                "toEmail": "test_lab_invite@example.com",
                "toName": "Test Lab",
                "examType": "sangue"
            },
            headers={"Authorization": f"Bearer {clinic_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                test_invitation_id_2 = data['invitation'].get('id')
                print_result(True, f"Clinic→Lab invitation created: id={test_invitation_id_2}")
            else:
                print_result(False, f"Invalid response: {data}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 2.3 - LAB → CLINIC
    print_test_header("TEST 2.3 - POST /connect/invite (LAB → CLINIC)")
    try:
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            json={
                "type": "lab_to_clinic",
                "toEmail": "test_clinic_invite@example.com",
                "toName": "Test Clinica"
            },
            headers={"Authorization": f"Bearer {lab_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_result(True, f"Lab→Clinic invitation created")
            else:
                print_result(False, f"Invalid response: {data}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 2.4 - OWNER → CLINIC
    print_test_header("TEST 2.4 - POST /connect/invite (OWNER → CLINIC)")
    try:
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            json={
                "type": "owner_to_clinic",
                "toEmail": "test_clinic_from_owner@example.com",
                "toName": "Clinica X"
            },
            headers={"Authorization": f"Bearer {owner_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_result(True, f"Owner→Clinic invitation created")
            else:
                print_result(False, f"Invalid response: {data}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 2.5 - NEGATIVE: direzione errata
    print_test_header("TEST 2.5 - NEGATIVE: direzione errata (OWNER con clinic_to_owner)")
    try:
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            json={
                "type": "clinic_to_owner",
                "toEmail": "test@example.com",
                "toName": "Test"
            },
            headers={"Authorization": f"Bearer {owner_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 403:
            print_result(True, f"Correctly rejected with 403: {response.json().get('error')}")
        else:
            print_result(False, f"Expected 403, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 2.6 - NEGATIVE: duplicato
    print_test_header("TEST 2.6 - NEGATIVE: duplicato (same owner_to_clinic)")
    try:
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            json={
                "type": "owner_to_clinic",
                "toEmail": "test_clinic_from_owner@example.com",
                "toName": "Clinica X"
            },
            headers={"Authorization": f"Bearer {owner_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 400:
            error_msg = response.json().get('error', '')
            if 'già inviato' in error_msg.lower():
                print_result(True, f"Correctly rejected duplicate: {error_msg}")
            else:
                print_result(False, f"Wrong error message: {error_msg}")
        else:
            print_result(False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 2.7 - NEGATIVE: email mancante
    print_test_header("TEST 2.7 - NEGATIVE: email mancante")
    try:
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            json={
                "type": "clinic_to_owner",
                "toName": "Test"
            },
            headers={"Authorization": f"Bearer {clinic_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 400:
            error_msg = response.json().get('error', '')
            if 'email' in error_msg.lower():
                print_result(True, f"Correctly rejected: {error_msg}")
            else:
                print_result(False, f"Wrong error message: {error_msg}")
        else:
            print_result(False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 2.8 - NEGATIVE: tipo invalido
    print_test_header("TEST 2.8 - NEGATIVE: tipo invalido")
    try:
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            json={
                "type": "invalid_type",
                "toEmail": "test@example.com",
                "toName": "Test"
            },
            headers={"Authorization": f"Bearer {clinic_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 400:
            error_msg = response.json().get('error', '')
            if 'tipo' in error_msg.lower() or 'type' in error_msg.lower():
                print_result(True, f"Correctly rejected: {error_msg}")
            else:
                print_result(False, f"Wrong error message: {error_msg}")
        else:
            print_result(False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 2.9 - NEGATIVE: no auth
    print_test_header("TEST 2.9 - NEGATIVE: no auth")
    try:
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            json={
                "type": "clinic_to_owner",
                "toEmail": "test@example.com",
                "toName": "Test"
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 401:
            print_result(True, f"Correctly rejected with 401")
        else:
            print_result(False, f"Expected 401, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

# ==================== TEST 3: BULK INVITE ====================
def test_3_bulk_invite():
    """TEST 3 - BULK INVITE"""
    
    # 3.1 - Bulk invite CLINIC → OWNERS
    print_test_header("TEST 3.1 - POST /connect/bulk-invite (CLINIC → OWNERS)")
    try:
        response = requests.post(
            f"{BASE_URL}/connect/bulk-invite",
            json={
                "type": "clinic_to_owner",
                "recipients": [
                    {"name": "Bulk Owner A", "email": "bulk1@test.com", "phone": "+39111"},
                    {"name": "Bulk Owner B", "email": "bulk2@test.com"},
                    {"email": "bulk3@test.com"}
                ],
                "message": "Test bulk invite"
            },
            headers={"Authorization": f"Bearer {clinic_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'results' in data:
                results = data['results']
                total = results.get('sent', 0) + results.get('failed', 0) + results.get('skipped', 0)
                print_result(True, f"Bulk invite completed: sent={results.get('sent')}, failed={results.get('failed')}, skipped={results.get('skipped')}, total={total}")
            else:
                print_result(False, f"Invalid response: {data}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 3.2 - NEGATIVE: troppi destinatari
    print_test_header("TEST 3.2 - NEGATIVE: troppi destinatari (201)")
    try:
        recipients = [{"email": f"test{i}@example.com"} for i in range(201)]
        response = requests.post(
            f"{BASE_URL}/connect/bulk-invite",
            json={
                "type": "clinic_to_owner",
                "recipients": recipients
            },
            headers={"Authorization": f"Bearer {clinic_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 400:
            error_msg = response.json().get('error', '')
            if '200' in error_msg:
                print_result(True, f"Correctly rejected: {error_msg}")
            else:
                print_result(False, f"Wrong error message: {error_msg}")
        else:
            print_result(False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 3.3 - NEGATIVE: lista vuota
    print_test_header("TEST 3.3 - NEGATIVE: lista vuota")
    try:
        response = requests.post(
            f"{BASE_URL}/connect/bulk-invite",
            json={
                "type": "clinic_to_owner",
                "recipients": []
            },
            headers={"Authorization": f"Bearer {clinic_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 400:
            error_msg = response.json().get('error', '')
            if 'destinatari' in error_msg.lower() or 'recipients' in error_msg.lower():
                print_result(True, f"Correctly rejected: {error_msg}")
            else:
                print_result(False, f"Wrong error message: {error_msg}")
        else:
            print_result(False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 3.4 - NEGATIVE: non-clinic/lab (owner trying bulk)
    print_test_header("TEST 3.4 - NEGATIVE: owner trying bulk-invite")
    try:
        response = requests.post(
            f"{BASE_URL}/connect/bulk-invite",
            json={
                "type": "owner_to_clinic",
                "recipients": [{"email": "test@example.com"}]
            },
            headers={"Authorization": f"Bearer {owner_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 403:
            error_msg = response.json().get('error', '')
            if 'cliniche' in error_msg.lower() or 'laboratori' in error_msg.lower():
                print_result(True, f"Correctly rejected: {error_msg}")
            else:
                print_result(False, f"Wrong error message: {error_msg}")
        else:
            print_result(False, f"Expected 403, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

# ==================== TEST 4: LISTA INVITI ====================
def test_4_invitations_list():
    """TEST 4 - LISTA INVITI"""
    
    # 4.1 - GET invitations as clinic
    print_test_header("TEST 4.1 - GET /connect/invitations (clinic)")
    try:
        response = requests.get(
            f"{BASE_URL}/connect/invitations",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'sent' in data and 'received' in data:
                sent_count = len(data['sent'])
                received_count = len(data['received'])
                print_result(True, f"Invitations list retrieved: sent={sent_count}, received={received_count}")
                if sent_count >= 4:
                    print_result(True, f"Clinic has sent at least 4 invitations (found {sent_count})")
                else:
                    print_result(False, f"Expected at least 4 sent invitations, found {sent_count}")
            else:
                print_result(False, f"Invalid response structure: {data}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 4.2 - GET invitations as owner
    print_test_header("TEST 4.2 - GET /connect/invitations (owner)")
    try:
        response = requests.get(
            f"{BASE_URL}/connect/invitations",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'sent' in data and 'received' in data:
                sent_count = len(data['sent'])
                print_result(True, f"Owner invitations: sent={sent_count}, received={len(data['received'])}")
                if sent_count >= 1:
                    print_result(True, f"Owner has sent at least 1 invitation")
                else:
                    print_result(False, f"Expected at least 1 sent invitation from owner")
            else:
                print_result(False, f"Invalid response structure: {data}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 4.3 - NEGATIVE: no auth
    print_test_header("TEST 4.3 - NEGATIVE: GET /connect/invitations without auth")
    try:
        response = requests.get(f"{BASE_URL}/connect/invitations")
        
        if response.status_code == 401:
            print_result(True, f"Correctly rejected with 401")
        else:
            print_result(False, f"Expected 401, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

# ==================== TEST 5: VERIFICA INVITO PUBBLICO ====================
def test_5_verify_invite():
    """TEST 5 - VERIFICA INVITO PUBBLICO"""
    global test_invitation_token
    
    # 5.1 - GET invite by token (public)
    print_test_header("TEST 5.1 - GET /connect/invite/:token (public)")
    try:
        if not test_invitation_token:
            print_result(False, "No invitation token available from previous tests")
            return
        
        response = requests.get(f"{BASE_URL}/connect/invite/{test_invitation_token}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['id', 'type', 'fromName', 'toEmail', 'status', 'createdAt']
            missing = [f for f in required_fields if f not in data]
            if not missing:
                print_result(True, f"Invitation retrieved: id={data.get('id')}, type={data.get('type')}, status={data.get('status')}")
                
                # Verify status changed to 'opened' in DB
                time.sleep(1)
                client = get_mongo_client()
                db = client[DB_NAME]
                invitation_doc = db.invitations.find_one({"token": test_invitation_token})
                if invitation_doc and invitation_doc.get('status') == 'opened':
                    print_result(True, f"Status correctly changed to 'opened' in DB")
                else:
                    print_result(False, f"Status not changed to 'opened' (current: {invitation_doc.get('status') if invitation_doc else 'NOT FOUND'})")
                client.close()
            else:
                print_result(False, f"Missing fields: {missing}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 5.2 - NEGATIVE: invalid token
    print_test_header("TEST 5.2 - NEGATIVE: GET /connect/invite/INVALID_TOKEN")
    try:
        response = requests.get(f"{BASE_URL}/connect/invite/INVALID_TOKEN_12345")
        
        if response.status_code == 404:
            error_msg = response.json().get('error', '')
            if 'non trovato' in error_msg.lower():
                print_result(True, f"Correctly rejected: {error_msg}")
            else:
                print_result(False, f"Wrong error message: {error_msg}")
        else:
            print_result(False, f"Expected 404, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

# ==================== TEST 6: ACCEPT, REVOKE, RESEND ====================
def test_6_invite_actions():
    """TEST 6 - ACCEPT, REVOKE, RESEND"""
    global test_invitation_id, test_invitation_id_2
    
    # 6.1 - Revoke invitation
    print_test_header("TEST 6.1 - POST /connect/revoke")
    try:
        if not test_invitation_id:
            print_result(False, "No invitation ID available")
            return
        
        response = requests.post(
            f"{BASE_URL}/connect/revoke",
            json={"invitationId": test_invitation_id},
            headers={"Authorization": f"Bearer {clinic_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_result(True, f"Invitation revoked successfully")
                
                # Verify in DB
                client = get_mongo_client()
                db = client[DB_NAME]
                invitation_doc = db.invitations.find_one({"id": test_invitation_id})
                if invitation_doc and invitation_doc.get('status') == 'revoked':
                    print_result(True, f"Status correctly set to 'revoked' in DB")
                else:
                    print_result(False, f"Status not 'revoked' in DB")
                client.close()
            else:
                print_result(False, f"Invalid response: {data}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 6.2 - Resend invitation
    print_test_header("TEST 6.2 - POST /connect/resend")
    try:
        if not test_invitation_id_2:
            print_result(False, "No invitation ID 2 available")
            return
        
        response = requests.post(
            f"{BASE_URL}/connect/resend",
            json={"invitationId": test_invitation_id_2},
            headers={"Authorization": f"Bearer {clinic_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_result(True, f"Invitation resent successfully")
                
                # Verify resendCount in DB
                client = get_mongo_client()
                db = client[DB_NAME]
                invitation_doc = db.invitations.find_one({"id": test_invitation_id_2})
                if invitation_doc:
                    resend_count = invitation_doc.get('resendCount', 0)
                    if resend_count > 0:
                        print_result(True, f"resendCount incremented to {resend_count}")
                    else:
                        print_result(False, f"resendCount not incremented (current: {resend_count})")
                client.close()
            else:
                print_result(False, f"Invalid response: {data}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 6.3 - NEGATIVE: resend revoked invitation
    print_test_header("TEST 6.3 - NEGATIVE: resend revoked invitation")
    try:
        if not test_invitation_id:
            print_result(False, "No revoked invitation ID available")
            return
        
        response = requests.post(
            f"{BASE_URL}/connect/resend",
            json={"invitationId": test_invitation_id},
            headers={"Authorization": f"Bearer {clinic_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 400:
            error_msg = response.json().get('error', '')
            if 'impossibile' in error_msg.lower() or 'chiuso' in error_msg.lower():
                print_result(True, f"Correctly rejected: {error_msg}")
            else:
                print_result(False, f"Wrong error message: {error_msg}")
        else:
            print_result(False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

# ==================== TEST 7: STATS ====================
def test_7_stats():
    """TEST 7 - STATS"""
    
    # 7.1 - Stats as clinic
    print_test_header("TEST 7.1 - GET /connect/stats (clinic)")
    try:
        response = requests.get(
            f"{BASE_URL}/connect/stats",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['sentTotal', 'sentAccepted', 'sentPending', 'conversionRate', 
                             'ownersConnected', 'petsLinked', 'labsConnected']
            missing = [f for f in required_fields if f not in data]
            if not missing:
                print_result(True, f"Clinic stats: sentTotal={data.get('sentTotal')}, ownersConnected={data.get('ownersConnected')}, petsLinked={data.get('petsLinked')}, labsConnected={data.get('labsConnected')}")
            else:
                print_result(False, f"Missing fields: {missing}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 7.2 - Stats as owner
    print_test_header("TEST 7.2 - GET /connect/stats (owner)")
    try:
        response = requests.get(
            f"{BASE_URL}/connect/stats",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['sentTotal', 'petsOwned', 'clinicsLinked']
            missing = [f for f in required_fields if f not in data]
            if not missing:
                print_result(True, f"Owner stats: sentTotal={data.get('sentTotal')}, petsOwned={data.get('petsOwned')}, clinicsLinked={data.get('clinicsLinked')}")
            else:
                print_result(False, f"Missing fields: {missing}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 7.3 - Stats as lab
    print_test_header("TEST 7.3 - GET /connect/stats (lab)")
    try:
        response = requests.get(
            f"{BASE_URL}/connect/stats",
            headers={"Authorization": f"Bearer {lab_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['sentTotal', 'clinicsConnected']
            missing = [f for f in required_fields if f not in data]
            if not missing:
                print_result(True, f"Lab stats: sentTotal={data.get('sentTotal')}, clinicsConnected={data.get('clinicsConnected')}")
            else:
                print_result(False, f"Missing fields: {missing}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

# ==================== TEST 8: PROVISIONAL PROFILES ====================
def test_8_provisional_profiles():
    """TEST 8 - PROVISIONAL PROFILES"""
    print_test_header("TEST 8 - Verify provisional profiles in DB")
    
    try:
        client = get_mongo_client()
        db = client[DB_NAME]
        
        # Check for test emails
        test_emails = [
            "test_owner_invite@example.com",
            "test_lab_invite@example.com",
            "test_clinic_invite@example.com",
            "test_clinic_from_owner@example.com"
        ]
        
        found_count = 0
        for email in test_emails:
            profile = db.provisional_profiles.find_one({"email": email.lower()})
            if profile:
                found_count += 1
                is_public = profile.get('public', True)
                if is_public == False:
                    print_result(True, f"Provisional profile for {email}: public={is_public} (correct)")
                else:
                    print_result(False, f"Provisional profile for {email}: public={is_public} (should be False)")
        
        if found_count > 0:
            print_result(True, f"Found {found_count} provisional profiles for test emails")
        else:
            print_result(False, f"No provisional profiles found for test emails")
        
        client.close()
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

# ==================== TEST 9: REGRESSION ====================
def test_9_regression():
    """TEST 9 - REGRESSION (endpoint esistenti)"""
    
    # 9.1 - GET /auth/me as clinic
    print_test_header("TEST 9.1 - GET /auth/me (clinic)")
    try:
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('role') == 'clinic':
                print_result(True, f"Auth/me working: role={data.get('role')}")
            else:
                print_result(False, f"Wrong role: {data.get('role')}")
        else:
            print_result(False, f"Failed: {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 9.2 - GET /appointments as clinic
    print_test_header("TEST 9.2 - GET /appointments (clinic)")
    try:
        response = requests.get(
            f"{BASE_URL}/appointments",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code == 200:
            print_result(True, f"Appointments endpoint working")
        else:
            print_result(False, f"Failed: {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 9.3 - GET /tasks as clinic
    print_test_header("TEST 9.3 - GET /tasks (clinic)")
    try:
        response = requests.get(
            f"{BASE_URL}/tasks",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code == 200:
            print_result(True, f"Tasks endpoint working")
        else:
            print_result(False, f"Failed: {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 9.4 - GET /previsit as clinic
    print_test_header("TEST 9.4 - GET /previsit (clinic)")
    try:
        response = requests.get(
            f"{BASE_URL}/previsit",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code == 200:
            print_result(True, f"Previsit endpoint working")
        else:
            print_result(False, f"Failed: {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # 9.5 - POST /invite-clinic (legacy endpoint)
    print_test_header("TEST 9.5 - POST /invite-clinic (legacy endpoint)")
    try:
        response = requests.post(
            f"{BASE_URL}/invite-clinic",
            json={
                "clinicName": "Legacy Test Clinic",
                "clinicEmail": "legacy_invite@test.com",
                "personalMessage": "Test legacy endpoint"
            },
            headers={"Authorization": f"Bearer {owner_token}", "Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_result(True, f"Legacy invite-clinic endpoint still working")
            else:
                print_result(False, f"Invalid response: {data}")
        else:
            print_result(False, f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

# ==================== CLEANUP ====================
def cleanup():
    """CLEANUP - Remove test data"""
    print_test_header("CLEANUP - Removing test data")
    
    try:
        client = get_mongo_client()
        db = client[DB_NAME]
        
        # Remove test invitations
        result1 = db.invitations.delete_many({
            "$or": [
                {"toEmail": {"$regex": "test", "$options": "i"}},
                {"toEmail": {"$regex": "@example.com", "$options": "i"}},
                {"toEmail": {"$regex": "@test.com", "$options": "i"}},
                {"toEmail": {"$regex": "bulk", "$options": "i"}},
                {"toEmail": {"$regex": "legacy_invite", "$options": "i"}}
            ]
        })
        print_result(True, f"Removed {result1.deleted_count} test invitations")
        
        # Remove test provisional profiles
        result2 = db.provisional_profiles.delete_many({
            "$or": [
                {"email": {"$regex": "test", "$options": "i"}},
                {"email": {"$regex": "@example.com", "$options": "i"}},
                {"email": {"$regex": "@test.com", "$options": "i"}},
                {"email": {"$regex": "bulk", "$options": "i"}},
                {"email": {"$regex": "legacy_invite", "$options": "i"}}
            ]
        })
        print_result(True, f"Removed {result2.deleted_count} test provisional profiles")
        
        # Remove test clinic_lab_connections (if any created during tests)
        result3 = db.clinic_lab_connections.delete_many({
            "source": "connect_invite",
            "createdAt": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()}
        })
        print_result(True, f"Removed {result3.deleted_count} test clinic_lab_connections")
        
        client.close()
        
        print_result(True, f"Cleanup completed: {result1.deleted_count + result2.deleted_count + result3.deleted_count} total records removed")
        
    except Exception as e:
        print_result(False, f"Cleanup exception: {str(e)}")

# ==================== MAIN ====================
def main():
    global clinic_token, lab_token, owner_token
    
    print("\n" + "="*80)
    print("VETBUDDY CONNECT MODULE + UPDATED PRICING PLANS - COMPREHENSIVE TESTING")
    print("="*80)
    
    # Login all users
    clinic_token = login(CLINIC_EMAIL, CLINIC_PASSWORD, "Clinic")
    lab_token = login(LAB_EMAIL, LAB_PASSWORD, "Lab")
    owner_token = login(OWNER_EMAIL, OWNER_PASSWORD, "Owner")
    
    if not clinic_token or not lab_token or not owner_token:
        print("\n❌ CRITICAL: Failed to login all users. Aborting tests.")
        return
    
    # Run all tests
    test_1_pricing_plans()
    test_2_connect_invites()
    test_3_bulk_invite()
    test_4_invitations_list()
    test_5_verify_invite()
    test_6_invite_actions()
    test_7_stats()
    test_8_provisional_profiles()
    test_9_regression()
    
    # Cleanup
    cleanup()
    
    print("\n" + "="*80)
    print("ALL TESTS COMPLETED")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()
