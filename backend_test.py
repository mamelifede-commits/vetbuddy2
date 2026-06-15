#!/usr/bin/env python3
"""
VetBuddy Connect - Twilio WhatsApp Integration Testing
Test rapido dell'integrazione Twilio WhatsApp nel modulo /api/connect/*
"""

import requests
import json
import time
from pymongo import MongoClient
import os

# Configuration
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "vetbuddy")

if not MONGO_URL:
    print("ERROR: MONGO_URL environment variable not set")
    exit(1)

# Credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"
LAB_EMAIL = "laboratorio1@vetbuddy.it"
LAB_PASSWORD = "Lab2025!"
OWNER_EMAIL = "proprietario.demo@vetbuddy.it"
OWNER_PASSWORD = "demo123"

# Test data tracking
test_invitation_ids = []
test_provisional_profile_ids = []

def get_mongo_db():
    """Get MongoDB database connection"""
    client = MongoClient(MONGO_URL)
    return client[DB_NAME]

def login(email, password):
    """Login and return JWT token"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("token")
        else:
            print(f"❌ Login failed for {email}: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login exception for {email}: {str(e)}")
        return None

def test_1_invite_with_phone():
    """TEST 1 - INVITE CON TELEFONO (WhatsApp + Email)"""
    print("\n" + "="*80)
    print("TEST 1 - INVITE CON TELEFONO (WhatsApp + Email)")
    print("="*80)
    
    # 1.1) POST /api/connect/invite come clinic con telefono
    print("\n1.1) POST /api/connect/invite come clinic con telefono...")
    clinic_token = login(CLINIC_EMAIL, CLINIC_PASSWORD)
    if not clinic_token:
        print("❌ TEST 1.1 FAILED: Cannot login as clinic")
        return False
    
    try:
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={
                "type": "clinic_to_owner",
                "toEmail": "test_wa@example.com",
                "toName": "Test WA",
                "toPhone": "+39 333 1234567",
                "message": "Test WA"
            },
            timeout=15
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code != 200:
            print(f"❌ TEST 1.1 FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if not data.get("success"):
            print(f"❌ TEST 1.1 FAILED: success=false")
            return False
        
        invitation_id = data.get("invitation", {}).get("id")
        if invitation_id:
            test_invitation_ids.append(invitation_id)
        
        print("✅ TEST 1.1 PASSED: Invite created successfully")
        
        # 1.2) Verifica nel DB
        print("\n1.2) Verifica nel DB (collection invitations)...")
        db = get_mongo_db()
        invitations = db["invitations"]
        
        invite = invitations.find_one({"id": invitation_id})
        if not invite:
            print(f"❌ TEST 1.2 FAILED: Invitation {invitation_id} not found in DB")
            return False
        
        print(f"Invitation found in DB:")
        print(f"  - emailSent: {invite.get('emailSent')}")
        print(f"  - whatsappSent: {invite.get('whatsappSent')}")
        print(f"  - whatsappError: {invite.get('whatsappError')}")
        
        # Verifica emailSent = true
        if not invite.get("emailSent"):
            print(f"❌ TEST 1.2 FAILED: emailSent is not true")
            return False
        
        # Verifica whatsappSent esiste (può essere true o false con whatsappError)
        if "whatsappSent" not in invite:
            print(f"❌ TEST 1.2 FAILED: whatsappSent field missing")
            return False
        
        # Se whatsappSent è false, deve esserci whatsappError
        if not invite.get("whatsappSent") and not invite.get("whatsappError"):
            print(f"⚠️  WARNING: whatsappSent=false but no whatsappError (unexpected)")
        
        # Entrambi i casi sono OK per il test (sandbox Twilio può fallire)
        if invite.get("whatsappSent"):
            print("✅ WhatsApp sent successfully (Twilio accepted)")
        else:
            print(f"✅ WhatsApp failed gracefully: {invite.get('whatsappError', 'Unknown error')}")
        
        print("✅ TEST 1.2 PASSED: Invitation in DB with emailSent=true and whatsappSent field present")
        
        return True
        
    except Exception as e:
        print(f"❌ TEST 1.1 EXCEPTION: {str(e)}")
        return False

def test_2_invite_without_phone():
    """TEST 1.2 - INVITE SENZA TELEFONO (Email only)"""
    print("\n" + "="*80)
    print("TEST 1.2 - INVITE SENZA TELEFONO (Email only)")
    print("="*80)
    
    clinic_token = login(CLINIC_EMAIL, CLINIC_PASSWORD)
    if not clinic_token:
        print("❌ TEST 1.2 FAILED: Cannot login as clinic")
        return False
    
    try:
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={
                "type": "clinic_to_owner",
                "toEmail": "test_no_wa@example.com",
                "toName": "Test No WA"
            },
            timeout=15
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code != 200:
            print(f"❌ TEST 1.2 FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if not data.get("success"):
            print(f"❌ TEST 1.2 FAILED: success=false")
            return False
        
        invitation_id = data.get("invitation", {}).get("id")
        if invitation_id:
            test_invitation_ids.append(invitation_id)
        
        # Verifica nel DB
        print("\nVerifica nel DB...")
        db = get_mongo_db()
        invitations = db["invitations"]
        
        invite = invitations.find_one({"id": invitation_id})
        if not invite:
            print(f"❌ TEST 1.2 FAILED: Invitation not found in DB")
            return False
        
        print(f"Invitation found in DB:")
        print(f"  - emailSent: {invite.get('emailSent')}")
        print(f"  - whatsappSent: {invite.get('whatsappSent')}")
        
        # Verifica emailSent = true
        if not invite.get("emailSent"):
            print(f"❌ TEST 1.2 FAILED: emailSent is not true")
            return False
        
        # Verifica whatsappSent NON esiste o è null/undefined
        if invite.get("whatsappSent") is not None:
            print(f"❌ TEST 1.2 FAILED: whatsappSent should not exist when phone is missing, but got: {invite.get('whatsappSent')}")
            return False
        
        print("✅ TEST 1.2 PASSED: Email sent, WhatsApp NOT called (no phone provided)")
        return True
        
    except Exception as e:
        print(f"❌ TEST 1.2 EXCEPTION: {str(e)}")
        return False

def test_3_bulk_invite_mix():
    """TEST 2 - BULK INVITE CON MIX TELEFONI"""
    print("\n" + "="*80)
    print("TEST 2 - BULK INVITE CON MIX TELEFONI")
    print("="*80)
    
    clinic_token = login(CLINIC_EMAIL, CLINIC_PASSWORD)
    if not clinic_token:
        print("❌ TEST 2 FAILED: Cannot login as clinic")
        return False
    
    try:
        response = requests.post(
            f"{BASE_URL}/connect/bulk-invite",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={
                "type": "clinic_to_owner",
                "recipients": [
                    {"name": "A", "email": "bulk_wa1@example.com", "phone": "+39 333 1111111"},
                    {"name": "B", "email": "bulk_no_wa@example.com"}
                ],
                "message": "Bulk WA test"
            },
            timeout=20
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code != 200:
            print(f"❌ TEST 2 FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if not data.get("success"):
            print(f"❌ TEST 2 FAILED: success=false")
            return False
        
        results = data.get("results", {})
        print(f"Results: sent={results.get('sent')}, skipped={results.get('skipped')}, failed={results.get('failed')}")
        
        if results.get("sent") != 2:
            print(f"❌ TEST 2 FAILED: Expected sent=2, got {results.get('sent')}")
            return False
        
        print("✅ TEST 2 PASSED: Bulk invite sent 2 invitations (1 with phone, 1 without)")
        return True
        
    except Exception as e:
        print(f"❌ TEST 2 EXCEPTION: {str(e)}")
        return False

def test_4_resend():
    """TEST 3 - RESEND"""
    print("\n" + "="*80)
    print("TEST 3 - RESEND")
    print("="*80)
    
    # First create an invite with phone
    clinic_token = login(CLINIC_EMAIL, CLINIC_PASSWORD)
    if not clinic_token:
        print("❌ TEST 3 FAILED: Cannot login as clinic")
        return False
    
    try:
        # Create invite
        print("\n3.1) Creating invite with phone...")
        response = requests.post(
            f"{BASE_URL}/connect/invite",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={
                "type": "clinic_to_owner",
                "toEmail": "test_resend_wa@example.com",
                "toName": "Test Resend WA",
                "toPhone": "+39 333 9999999",
                "message": "Test resend"
            },
            timeout=15
        )
        
        if response.status_code != 200:
            print(f"❌ TEST 3 FAILED: Cannot create invite: {response.status_code}")
            return False
        
        data = response.json()
        invitation_id = data.get("invitation", {}).get("id")
        if not invitation_id:
            print(f"❌ TEST 3 FAILED: No invitation ID returned")
            return False
        
        test_invitation_ids.append(invitation_id)
        print(f"✅ Invite created: {invitation_id}")
        
        # Wait a bit
        time.sleep(2)
        
        # Resend
        print("\n3.2) Resending invite...")
        response = requests.post(
            f"{BASE_URL}/connect/resend",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={"invitationId": invitation_id},
            timeout=15
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code != 200:
            print(f"❌ TEST 3 FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if not data.get("success"):
            print(f"❌ TEST 3 FAILED: success=false")
            return False
        
        # Verify in DB that lastResentAt was updated
        db = get_mongo_db()
        invitations = db["invitations"]
        invite = invitations.find_one({"id": invitation_id})
        
        if not invite:
            print(f"❌ TEST 3 FAILED: Invitation not found in DB after resend")
            return False
        
        if not invite.get("lastResentAt"):
            print(f"❌ TEST 3 FAILED: lastResentAt not updated in DB")
            return False
        
        if invite.get("status") != "sent":
            print(f"❌ TEST 3 FAILED: Expected status='sent' in DB, got {invite.get('status')}")
            return False
        
        print(f"✅ Resend verified in DB: lastResentAt={invite.get('lastResentAt')}, status={invite.get('status')}")
        print("✅ TEST 3 PASSED: Resend successful with lastResentAt updated")
        return True
        
    except Exception as e:
        print(f"❌ TEST 3 EXCEPTION: {str(e)}")
        return False

def test_5_regression():
    """TEST 4 - REGRESSION COMPLETO"""
    print("\n" + "="*80)
    print("TEST 4 - REGRESSION COMPLETO")
    print("="*80)
    
    clinic_token = login(CLINIC_EMAIL, CLINIC_PASSWORD)
    if not clinic_token:
        print("❌ TEST 4 FAILED: Cannot login as clinic")
        return False
    
    tests_passed = 0
    tests_total = 4
    
    try:
        # 4.1) GET /api/connect/completion-score
        print("\n4.1) GET /api/connect/completion-score...")
        response = requests.get(
            f"{BASE_URL}/connect/completion-score",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Score: {data.get('score')}, Completed: {data.get('completed')}/{data.get('total')}")
            print("✅ TEST 4.1 PASSED")
            tests_passed += 1
        else:
            print(f"❌ TEST 4.1 FAILED: {response.status_code}")
        
        # 4.2) GET /api/connect/stats
        print("\n4.2) GET /api/connect/stats...")
        response = requests.get(
            f"{BASE_URL}/connect/stats",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Stats: sentTotal={data.get('sentTotal')}, sentAccepted={data.get('sentAccepted')}")
            print("✅ TEST 4.2 PASSED")
            tests_passed += 1
        else:
            print(f"❌ TEST 4.2 FAILED: {response.status_code}")
        
        # 4.3) GET /api/connect/invitations
        print("\n4.3) GET /api/connect/invitations...")
        response = requests.get(
            f"{BASE_URL}/connect/invitations",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Invitations: sent={len(data.get('sent', []))}, received={len(data.get('received', []))}")
            print("✅ TEST 4.3 PASSED")
            tests_passed += 1
        else:
            print(f"❌ TEST 4.3 FAILED: {response.status_code}")
        
        # 4.4) GET /api/auth/me
        print("\n4.4) GET /api/auth/me...")
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {clinic_token}"},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"User: {data.get('email')}, Role: {data.get('role')}")
            print("✅ TEST 4.4 PASSED")
            tests_passed += 1
        else:
            print(f"❌ TEST 4.4 FAILED: {response.status_code}")
        
        print(f"\n✅ TEST 4 REGRESSION: {tests_passed}/{tests_total} tests passed")
        return tests_passed == tests_total
        
    except Exception as e:
        print(f"❌ TEST 4 EXCEPTION: {str(e)}")
        return False

def cleanup():
    """CLEANUP - Remove test data"""
    print("\n" + "="*80)
    print("CLEANUP - Removing test data")
    print("="*80)
    
    try:
        db = get_mongo_db()
        
        # Remove test invitations
        print("\nRemoving test invitations...")
        invitations = db["invitations"]
        
        # Remove by email patterns
        result = invitations.delete_many({
            "toEmail": {
                "$in": [
                    "test_wa@example.com",
                    "test_no_wa@example.com",
                    "bulk_wa1@example.com",
                    "bulk_no_wa@example.com",
                    "test_resend_wa@example.com"
                ]
            }
        })
        print(f"✅ Removed {result.deleted_count} test invitations")
        
        # Remove test provisional profiles
        print("\nRemoving test provisional profiles...")
        provisional = db["provisional_profiles"]
        result = provisional.delete_many({
            "email": {
                "$in": [
                    "test_wa@example.com",
                    "test_no_wa@example.com",
                    "bulk_wa1@example.com",
                    "bulk_no_wa@example.com",
                    "test_resend_wa@example.com"
                ]
            }
        })
        print(f"✅ Removed {result.deleted_count} test provisional profiles")
        
        print("\n✅ CLEANUP COMPLETED")
        return True
        
    except Exception as e:
        print(f"❌ CLEANUP EXCEPTION: {str(e)}")
        return False

def main():
    """Main test runner"""
    print("\n" + "="*80)
    print("VETBUDDY CONNECT - TWILIO WHATSAPP INTEGRATION TESTING")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"MongoDB: {MONGO_URL}")
    print(f"Database: {DB_NAME}")
    
    results = {
        "TEST 1.1 - Invite with phone": False,
        "TEST 1.2 - Invite without phone": False,
        "TEST 2 - Bulk invite mix": False,
        "TEST 3 - Resend": False,
        "TEST 4 - Regression": False,
        "CLEANUP": False
    }
    
    # Run tests
    results["TEST 1.1 - Invite with phone"] = test_1_invite_with_phone()
    results["TEST 1.2 - Invite without phone"] = test_2_invite_without_phone()
    results["TEST 2 - Bulk invite mix"] = test_3_bulk_invite_mix()
    results["TEST 3 - Resend"] = test_4_resend()
    results["TEST 4 - Regression"] = test_5_regression()
    results["CLEANUP"] = cleanup()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    print(f"\n{'='*80}")
    print(f"TOTAL: {passed}/{total} tests passed ({passed*100//total}%)")
    print(f"{'='*80}\n")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
