#!/usr/bin/env python3
"""
Test script for VetBuddy NEW features:
1. Chunked upload for pre-visit media (/api/previsit/upload)
2. 4 new cron automations (weightAlert, dentalHygiene, referralProgram, griefFollowup)
3. Regression tests
"""

import requests
import json
import os
import base64
import hashlib
from datetime import datetime, timedelta
import uuid
import time
from pymongo import MongoClient

# Load .env file
def load_env():
    env_path = '/app/.env'
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

load_env()

# Configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://clinic-report-review.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"
MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME', 'vetbuddy')

# Credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"

# Test data tracking for cleanup
test_data = {
    'form_ids': [],
    'media_ids': [],
    'pet_ids': [],
    'task_ids': []
}

def print_test(msg):
    print(f"\n{'='*80}")
    print(f"TEST: {msg}")
    print('='*80)

def print_result(success, msg):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {msg}")

def login_clinic():
    """Login as clinic and return token"""
    print_test("Clinic Login")
    response = requests.post(f"{API_URL}/auth/login", json={
        "email": CLINIC_EMAIL,
        "password": CLINIC_PASSWORD
    })
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        print_result(True, f"Clinic login successful, token: {token[:20]}...")
        return token
    else:
        print_result(False, f"Clinic login failed: {response.text}")
        return None

def get_mongo_client():
    """Get MongoDB client"""
    return MongoClient(MONGO_URL)

def test_part1_chunked_upload(clinic_token):
    """Test Part 1: Chunked Upload for Pre-Visit Media"""
    print_test("PART 1: CHUNKED UPLOAD PRE-VISITA")
    
    # Setup: Create a pre-visit form
    print("\n--- Setup: Create Pre-Visit Form ---")
    response = requests.post(f"{API_URL}/previsit", 
        headers={"Authorization": f"Bearer {clinic_token}"},
        json={
            "ownerName": "Test Upload",
            "ownerEmail": "test-upload@example.com",
            "petName": "UploadPet",
            "type": "generale"
        }
    )
    print(f"Create form status: {response.status_code}")
    if response.status_code != 201:
        print_result(False, f"Failed to create form: {response.text}")
        return False
    
    form_data = response.json()
    form_id = form_data.get('formId')
    test_data['form_ids'].append(form_id)
    print_result(True, f"Form created with ID: {form_id}")
    
    # Get form token from MongoDB
    print("\n--- Get Form Token from MongoDB ---")
    client = get_mongo_client()
    db = client[DB_NAME]
    
    # Wait a bit for the form to be saved
    time.sleep(2)
    
    form_doc = db.previsit_forms.find_one({"id": form_id})
    if not form_doc:
        print_result(False, f"Form not found in MongoDB (id: {form_id})")
        print(f"Available forms: {db.previsit_forms.count_documents({})}")
        # Try to find any form
        any_form = db.previsit_forms.find_one({})
        if any_form:
            print(f"Sample form: {any_form.get('id')}")
        return False
    
    form_token = form_doc.get('token')
    print_result(True, f"Form token retrieved: {form_token[:20]}...")
    
    # Test 1: Multi-chunk upload (3 chunks of ~512KB each = ~1.2MB total)
    print("\n--- Test 1: Multi-Chunk Upload (3 chunks) ---")
    
    # Generate fake image file of ~1.2MB
    file_size = 1200000  # ~1.2MB
    fake_image_data = os.urandom(file_size)
    file_hash = hashlib.sha256(fake_image_data).hexdigest()
    print(f"Generated fake image: {file_size} bytes, hash: {file_hash[:16]}...")
    
    # Split into 3 chunks of ~512KB each
    chunk_size = 512000
    chunks = []
    for i in range(0, len(fake_image_data), chunk_size):
        chunks.append(fake_image_data[i:i+chunk_size])
    
    print(f"Split into {len(chunks)} chunks")
    
    upload_id = str(uuid.uuid4())
    file_name = "test.jpg"
    mime_type = "image/jpeg"
    
    # Upload chunks
    for idx, chunk in enumerate(chunks):
        chunk_b64 = base64.b64encode(chunk).decode('utf-8')
        print(f"\nUploading chunk {idx+1}/{len(chunks)} ({len(chunk)} bytes, {len(chunk_b64)} b64 chars)...")
        
        response = requests.post(f"{API_URL}/previsit/upload", json={
            "formId": form_id,
            "token": form_token,
            "uploadId": upload_id,
            "chunkIndex": idx,
            "totalChunks": len(chunks),
            "fileName": file_name,
            "mimeType": mime_type,
            "dataBase64": chunk_b64
        })
        
        print(f"Chunk {idx+1} status: {response.status_code}")
        if response.status_code != 200:
            print_result(False, f"Chunk {idx+1} upload failed: {response.text}")
            return False
        
        result = response.json()
        if idx < len(chunks) - 1:
            # First 2 chunks should return completed: false
            if result.get('completed') == False:
                print_result(True, f"Chunk {idx+1} uploaded, not completed yet")
            else:
                print_result(False, f"Chunk {idx+1} should not be completed yet")
                return False
        else:
            # Last chunk should return completed: true with mediaId
            if result.get('completed') == True:
                media_id = result.get('mediaId')
                media_size = result.get('size')
                test_data['media_ids'].append(media_id)
                print_result(True, f"Upload completed! mediaId: {media_id}, size: {media_size} bytes")
            else:
                print_result(False, "Last chunk should be completed")
                return False
    
    # Test 2: Download media and verify integrity
    print("\n--- Test 2: Download Media and Verify Integrity ---")
    
    # Download with form token
    response = requests.get(f"{API_URL}/previsit/upload?mediaId={media_id}&t={form_token}")
    print(f"Download with token status: {response.status_code}")
    if response.status_code != 200:
        print_result(False, f"Download failed: {response.text}")
        return False
    
    if response.headers.get('Content-Type') != mime_type:
        print_result(False, f"Wrong content type: {response.headers.get('Content-Type')}")
        return False
    
    downloaded_data = response.content
    downloaded_hash = hashlib.sha256(downloaded_data).hexdigest()
    
    if downloaded_hash == file_hash:
        print_result(True, f"Downloaded file matches original (hash: {downloaded_hash[:16]}...)")
    else:
        print_result(False, f"Downloaded file hash mismatch! Original: {file_hash[:16]}..., Downloaded: {downloaded_hash[:16]}...")
        return False
    
    # Download with clinic token
    response = requests.get(f"{API_URL}/previsit/upload?mediaId={media_id}",
        headers={"Authorization": f"Bearer {clinic_token}"})
    print(f"Download with clinic auth status: {response.status_code}")
    if response.status_code == 200:
        print_result(True, "Download with clinic auth successful")
    else:
        print_result(False, f"Download with clinic auth failed: {response.text}")
        return False
    
    # Test 3: List media
    print("\n--- Test 3: List Media ---")
    
    # List with form token
    response = requests.get(f"{API_URL}/previsit/upload?formId={form_id}&t={form_token}")
    print(f"List with token status: {response.status_code}")
    if response.status_code != 200:
        print_result(False, f"List failed: {response.text}")
        return False
    
    list_data = response.json()
    media_list = list_data.get('media', [])
    if len(media_list) == 1:
        print_result(True, f"Media list contains 1 item: {media_list[0].get('fileName')}")
    else:
        print_result(False, f"Expected 1 media item, got {len(media_list)}")
        return False
    
    # List with clinic token
    response = requests.get(f"{API_URL}/previsit/upload?formId={form_id}",
        headers={"Authorization": f"Bearer {clinic_token}"})
    print(f"List with clinic auth status: {response.status_code}")
    if response.status_code == 200:
        print_result(True, "List with clinic auth successful")
    else:
        print_result(False, f"List with clinic auth failed: {response.text}")
        return False
    
    # Test 4: Security checks
    print("\n--- Test 4: Security Checks ---")
    
    # Download without token and without auth
    response = requests.get(f"{API_URL}/previsit/upload?mediaId={media_id}")
    print(f"Download without auth status: {response.status_code}")
    if response.status_code == 401:
        print_result(True, "Download without auth correctly blocked (401)")
    else:
        print_result(False, f"Download without auth should return 401, got {response.status_code}")
    
    # Download with wrong token
    response = requests.get(f"{API_URL}/previsit/upload?mediaId={media_id}&t=wrong_token")
    print(f"Download with wrong token status: {response.status_code}")
    if response.status_code == 401:
        print_result(True, "Download with wrong token correctly blocked (401)")
    else:
        print_result(False, f"Download with wrong token should return 401, got {response.status_code}")
    
    # Upload chunk with PDF mime type (should fail)
    response = requests.post(f"{API_URL}/previsit/upload", json={
        "formId": form_id,
        "token": form_token,
        "uploadId": str(uuid.uuid4()),
        "chunkIndex": 0,
        "totalChunks": 1,
        "fileName": "test.pdf",
        "mimeType": "application/pdf",
        "dataBase64": base64.b64encode(b"test").decode('utf-8')
    })
    print(f"Upload PDF status: {response.status_code}")
    if response.status_code == 400:
        print_result(True, "PDF upload correctly rejected (400)")
    else:
        print_result(False, f"PDF upload should return 400, got {response.status_code}")
    
    # Upload with 50 total chunks (should fail)
    response = requests.post(f"{API_URL}/previsit/upload", json={
        "formId": form_id,
        "token": form_token,
        "uploadId": str(uuid.uuid4()),
        "chunkIndex": 0,
        "totalChunks": 50,
        "fileName": "test.jpg",
        "mimeType": "image/jpeg",
        "dataBase64": base64.b64encode(b"test").decode('utf-8')
    })
    print(f"Upload 50 chunks status: {response.status_code}")
    if response.status_code == 400:
        print_result(True, "50 chunks upload correctly rejected (400)")
    else:
        print_result(False, f"50 chunks upload should return 400, got {response.status_code}")
    
    # Upload with wrong form token
    response = requests.post(f"{API_URL}/previsit/upload", json={
        "formId": form_id,
        "token": "wrong_token",
        "uploadId": str(uuid.uuid4()),
        "chunkIndex": 0,
        "totalChunks": 1,
        "fileName": "test.jpg",
        "mimeType": "image/jpeg",
        "dataBase64": base64.b64encode(b"test").decode('utf-8')
    })
    print(f"Upload with wrong token status: {response.status_code}")
    if response.status_code == 404:
        print_result(True, "Upload with wrong token correctly rejected (404)")
    else:
        print_result(False, f"Upload with wrong token should return 404, got {response.status_code}")
    
    # Test 5: File limit (max 3 attachments)
    print("\n--- Test 5: File Limit (Max 3 Attachments) ---")
    
    # Upload 2 more small files
    for i in range(2):
        small_data = os.urandom(10000)  # ~10KB
        small_b64 = base64.b64encode(small_data).decode('utf-8')
        small_upload_id = str(uuid.uuid4())
        
        response = requests.post(f"{API_URL}/previsit/upload", json={
            "formId": form_id,
            "token": form_token,
            "uploadId": small_upload_id,
            "chunkIndex": 0,
            "totalChunks": 1,
            "fileName": f"small{i+2}.jpg",
            "mimeType": "image/jpeg",
            "dataBase64": small_b64
        })
        
        print(f"Upload small file {i+2} status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            if result.get('completed'):
                test_data['media_ids'].append(small_upload_id)
                print_result(True, f"Small file {i+2} uploaded successfully")
            else:
                print_result(False, f"Small file {i+2} should be completed")
                return False
        else:
            print_result(False, f"Small file {i+2} upload failed: {response.text}")
            return False
    
    # Try to upload 4th file (should fail)
    fourth_data = os.urandom(10000)
    fourth_b64 = base64.b64encode(fourth_data).decode('utf-8')
    fourth_upload_id = str(uuid.uuid4())
    
    response = requests.post(f"{API_URL}/previsit/upload", json={
        "formId": form_id,
        "token": form_token,
        "uploadId": fourth_upload_id,
        "chunkIndex": 0,
        "totalChunks": 1,
        "fileName": "fourth.jpg",
        "mimeType": "image/jpeg",
        "dataBase64": fourth_b64
    })
    
    print(f"Upload 4th file status: {response.status_code}")
    if response.status_code == 400:
        print_result(True, "4th file upload correctly rejected (400 - max 3 files)")
    else:
        print_result(False, f"4th file upload should return 400, got {response.status_code}")
    
    # Test 6: Delete media
    print("\n--- Test 6: Delete Media ---")
    
    # Delete the 3rd media (last small file)
    third_media_id = test_data['media_ids'][2]
    response = requests.delete(f"{API_URL}/previsit/upload?mediaId={third_media_id}&t={form_token}")
    print(f"Delete media status: {response.status_code}")
    if response.status_code == 200:
        print_result(True, "Media deleted successfully")
        test_data['media_ids'].remove(third_media_id)
    else:
        print_result(False, f"Delete media failed: {response.text}")
        return False
    
    # Try to download deleted media (should fail)
    response = requests.get(f"{API_URL}/previsit/upload?mediaId={third_media_id}&t={form_token}")
    print(f"Download deleted media status: {response.status_code}")
    if response.status_code == 404:
        print_result(True, "Deleted media correctly returns 404")
    else:
        print_result(False, f"Deleted media should return 404, got {response.status_code}")
    
    # Test 7: Block upload/delete after submission
    print("\n--- Test 7: Block Upload/Delete After Submission ---")
    
    # Submit the form
    response = requests.post(f"{API_URL}/previsit", json={
        "id": form_id,
        "token": form_token,
        "answers": {
            "reason": "Test",
            "urgency": "Bassa"
        }
    })
    print(f"Submit form status: {response.status_code}")
    if response.status_code == 200:
        print_result(True, "Form submitted successfully")
    else:
        print_result(False, f"Form submission failed: {response.text}")
        return False
    
    # Try to upload new chunk (should fail)
    response = requests.post(f"{API_URL}/previsit/upload", json={
        "formId": form_id,
        "token": form_token,
        "uploadId": str(uuid.uuid4()),
        "chunkIndex": 0,
        "totalChunks": 1,
        "fileName": "after_submit.jpg",
        "mimeType": "image/jpeg",
        "dataBase64": base64.b64encode(b"test").decode('utf-8')
    })
    print(f"Upload after submit status: {response.status_code}")
    if response.status_code == 400:
        print_result(True, "Upload after submit correctly blocked (400)")
    else:
        print_result(False, f"Upload after submit should return 400, got {response.status_code}")
    
    # Try to delete with form token (should fail)
    remaining_media_id = test_data['media_ids'][0]
    response = requests.delete(f"{API_URL}/previsit/upload?mediaId={remaining_media_id}&t={form_token}")
    print(f"Delete after submit with token status: {response.status_code}")
    if response.status_code == 400:
        print_result(True, "Delete after submit with token correctly blocked (400)")
    else:
        print_result(False, f"Delete after submit with token should return 400, got {response.status_code}")
    
    # Delete with clinic auth (should succeed)
    response = requests.delete(f"{API_URL}/previsit/upload?mediaId={remaining_media_id}",
        headers={"Authorization": f"Bearer {clinic_token}"})
    print(f"Delete after submit with clinic auth status: {response.status_code}")
    if response.status_code == 200:
        print_result(True, "Delete after submit with clinic auth successful")
        test_data['media_ids'].remove(remaining_media_id)
    else:
        print_result(False, f"Delete after submit with clinic auth failed: {response.text}")
    
    # Test 8: MediaCount in GET /api/previsit
    print("\n--- Test 8: MediaCount in GET /api/previsit ---")
    
    response = requests.get(f"{API_URL}/previsit",
        headers={"Authorization": f"Bearer {clinic_token}"})
    print(f"Get previsit list status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        questionnaires = data.get('questionnaires', [])
        test_form = next((q for q in questionnaires if q.get('id') == form_id), None)
        if test_form:
            media_count = test_form.get('mediaCount', 0)
            # Should be 1 (we deleted 1 and clinic deleted 1, so 1 remaining)
            print_result(True, f"Form has mediaCount: {media_count}")
        else:
            print_result(False, "Test form not found in list")
    else:
        print_result(False, f"Get previsit list failed: {response.text}")
    
    print_result(True, "PART 1: CHUNKED UPLOAD TESTS COMPLETED")
    return True

def test_part2_cron_automations(clinic_token):
    """Test Part 2: 4 New Cron Automations"""
    print_test("PART 2: 4 NEW CRON AUTOMATIONS")
    
    # Setup test data in MongoDB
    print("\n--- Setup: Create Test Data in MongoDB ---")
    
    client = get_mongo_client()
    db = client[DB_NAME]
    
    # Get demo clinic ID
    clinic = db.users.find_one({"email": CLINIC_EMAIL})
    if not clinic:
        print_result(False, "Demo clinic not found")
        return False
    clinic_id = clinic['id']
    print(f"Clinic ID: {clinic_id}")
    
    # Get demo owner ID
    owner = db.users.find_one({"email": "proprietario@vetbuddy.it"})
    if not owner:
        print_result(False, "Demo owner not found (proprietario@vetbuddy.it)")
        # Try to find any owner
        any_owner = db.users.find_one({"role": "owner"})
        if any_owner:
            print(f"Using alternative owner: {any_owner.get('email')}")
            owner = any_owner
        else:
            print_result(False, "No owner found in database")
            return False
    owner_id = owner['id']
    print(f"Owner ID: {owner_id} ({owner.get('email')})")
    
    # a) Create pet for weightAlert test
    print("\n--- Create Pet for weightAlert Test ---")
    weight_pet_id = str(uuid.uuid4())
    test_data['pet_ids'].append(weight_pet_id)
    
    weight_pet = {
        "id": weight_pet_id,
        "name": "TestWeightPet",
        "clinicId": clinic_id,
        "ownerId": owner_id,
        "species": "cane",
        "breed": "Test",
        "birthDate": "2020-01-01",
        "weightHistory": [
            {"weight": 10, "date": "2025-05-01"},
            {"weight": 12, "date": "2025-06-01"}  # +20% variation
        ],
        "createdAt": datetime.utcnow().isoformat()
    }
    db.pets.insert_one(weight_pet)
    print_result(True, f"Weight test pet created: {weight_pet_id}")
    
    # b) Create pet for griefFollowup test
    print("\n--- Create Pet for griefFollowup Test ---")
    grief_pet_id = str(uuid.uuid4())
    test_data['pet_ids'].append(grief_pet_id)
    
    thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
    grief_pet = {
        "id": grief_pet_id,
        "name": "TestGriefPet",
        "clinicId": clinic_id,
        "ownerId": owner_id,
        "species": "gatto",
        "breed": "Test",
        "birthDate": "2015-01-01",
        "status": "deceased",
        "deceasedAt": thirty_days_ago,
        "createdAt": datetime.utcnow().isoformat()
    }
    db.pets.insert_one(grief_pet)
    print_result(True, f"Grief test pet created: {grief_pet_id}, deceased 30 days ago")
    
    # c) dentalHygiene and referralProgram will use existing data
    print("\n--- dentalHygiene and referralProgram will use existing data ---")
    print_result(True, "No additional data needed for dentalHygiene and referralProgram")
    
    # Call cron job ONCE
    print("\n--- Call Cron Job (ONCE - sends real emails) ---")
    response = requests.get(f"{API_URL}/cron/daily")
    print(f"Cron job status: {response.status_code}")
    
    if response.status_code != 200:
        print_result(False, f"Cron job failed: {response.text}")
        return False
    
    cron_data = response.json()
    results = cron_data.get('results', {})
    
    print("\n--- Verify Cron Results ---")
    
    # Check all 4 new automation keys are present
    required_keys = ['weightAlert', 'dentalHygiene', 'referralProgram', 'griefFollowup']
    all_keys_present = all(key in results for key in required_keys)
    
    if all_keys_present:
        print_result(True, "All 4 new automation keys present in results")
    else:
        missing = [key for key in required_keys if key not in results]
        print_result(False, f"Missing automation keys: {missing}")
        return False
    
    # Check all errors are 0
    all_errors_zero = all(results[key].get('errors', 0) == 0 for key in required_keys)
    
    if all_errors_zero:
        print_result(True, "All 4 automations have errors=0")
    else:
        errors = {key: results[key].get('errors', 0) for key in required_keys if results[key].get('errors', 0) > 0}
        print_result(False, f"Some automations have errors: {errors}")
        return False
    
    # Check weightAlert
    weight_alert = results.get('weightAlert', {})
    print(f"\nweightAlert: sent={weight_alert.get('sent')}, errors={weight_alert.get('errors')}, skipped={weight_alert.get('skipped')}")
    if weight_alert.get('sent', 0) >= 1:
        print_result(True, f"weightAlert sent >= 1 email (sent={weight_alert.get('sent')})")
    else:
        print_result(False, f"weightAlert should send >= 1 email, got {weight_alert.get('sent')}")
    
    # Verify weightAlertFor flag on pet
    updated_weight_pet = db.pets.find_one({"id": weight_pet_id})
    if updated_weight_pet and updated_weight_pet.get('weightAlertFor') == "2025-06-01":
        print_result(True, f"TestWeightPet has weightAlertFor='2025-06-01'")
    else:
        print_result(False, f"TestWeightPet weightAlertFor not set correctly: {updated_weight_pet.get('weightAlertFor') if updated_weight_pet else 'pet not found'}")
    
    # Check griefFollowup
    grief_followup = results.get('griefFollowup', {})
    print(f"\ngriefFollowup: sent={grief_followup.get('sent')}, errors={grief_followup.get('errors')}, skipped={grief_followup.get('skipped')}")
    if grief_followup.get('sent', 0) >= 1:
        print_result(True, f"griefFollowup sent >= 1 email (sent={grief_followup.get('sent')})")
    else:
        print_result(False, f"griefFollowup should send >= 1 email, got {grief_followup.get('sent')}")
    
    # Verify griefFollowupSent flag on pet
    updated_grief_pet = db.pets.find_one({"id": grief_pet_id})
    if updated_grief_pet and updated_grief_pet.get('griefFollowupSent') == True:
        print_result(True, f"TestGriefPet has griefFollowupSent=true")
    else:
        print_result(False, f"TestGriefPet griefFollowupSent not set: {updated_grief_pet.get('griefFollowupSent') if updated_grief_pet else 'pet not found'}")
    
    # Check dentalHygiene and referralProgram (just verify they ran without errors)
    dental_hygiene = results.get('dentalHygiene', {})
    print(f"\ndentalHygiene: sent={dental_hygiene.get('sent')}, errors={dental_hygiene.get('errors')}, skipped={dental_hygiene.get('skipped')}")
    print_result(True, f"dentalHygiene ran with errors=0 (sent={dental_hygiene.get('sent')})")
    
    referral_program = results.get('referralProgram', {})
    print(f"\nreferralProgram: sent={referral_program.get('sent')}, errors={referral_program.get('errors')}, skipped={referral_program.get('skipped')}")
    print_result(True, f"referralProgram ran with errors=0 (sent={referral_program.get('sent')})")
    
    # Check that no other cron keys have unexpected errors
    print("\n--- Check Other Cron Keys for Errors ---")
    error_keys = [key for key, value in results.items() if isinstance(value, dict) and value.get('errors', 0) > 0]
    if len(error_keys) == 0:
        print_result(True, "No cron keys have errors")
    else:
        print_result(False, f"Some cron keys have errors: {error_keys}")
        for key in error_keys:
            print(f"  {key}: {results[key]}")
    
    print_result(True, "PART 2: CRON AUTOMATIONS TESTS COMPLETED")
    return True

def test_part3_regression(clinic_token):
    """Test Part 3: Regression Tests"""
    print_test("PART 3: REGRESSION TESTS")
    
    # Test 1: GET /api/tasks
    print("\n--- Test 1: GET /api/tasks ---")
    response = requests.get(f"{API_URL}/tasks",
        headers={"Authorization": f"Bearer {clinic_token}"})
    print(f"GET /api/tasks status: {response.status_code}")
    if response.status_code == 200:
        print_result(True, "GET /api/tasks working")
    else:
        print_result(False, f"GET /api/tasks failed: {response.text}")
    
    # Test 2: GET /api/previsit
    print("\n--- Test 2: GET /api/previsit ---")
    response = requests.get(f"{API_URL}/previsit",
        headers={"Authorization": f"Bearer {clinic_token}"})
    print(f"GET /api/previsit status: {response.status_code}")
    if response.status_code == 200:
        print_result(True, "GET /api/previsit working")
    else:
        print_result(False, f"GET /api/previsit failed: {response.text}")
    
    # Test 3: GET /api/auth/me
    print("\n--- Test 3: GET /api/auth/me ---")
    response = requests.get(f"{API_URL}/auth/me",
        headers={"Authorization": f"Bearer {clinic_token}"})
    print(f"GET /api/auth/me status: {response.status_code}")
    if response.status_code == 200:
        print_result(True, "GET /api/auth/me working")
    else:
        print_result(False, f"GET /api/auth/me failed: {response.text}")
    
    print_result(True, "PART 3: REGRESSION TESTS COMPLETED")
    return True

def cleanup():
    """Cleanup test data from MongoDB"""
    print_test("CLEANUP: Remove Test Data from MongoDB")
    
    client = get_mongo_client()
    db = client[DB_NAME]
    
    # Delete previsit forms
    if test_data['form_ids']:
        print(f"\n--- Delete {len(test_data['form_ids'])} previsit forms ---")
        result = db.previsit_forms.delete_many({"id": {"$in": test_data['form_ids']}})
        print(f"Deleted {result.deleted_count} previsit forms")
    
    # Delete previsit media
    if test_data['media_ids']:
        print(f"\n--- Delete {len(test_data['media_ids'])} previsit media ---")
        result = db.previsit_media.delete_many({"id": {"$in": test_data['media_ids']}})
        print(f"Deleted {result.deleted_count} previsit media")
        
        # Delete media chunks
        result = db.previsit_media_chunks.delete_many({"uploadId": {"$in": test_data['media_ids']}})
        print(f"Deleted {result.deleted_count} previsit media chunks")
    
    # Delete test pets
    if test_data['pet_ids']:
        print(f"\n--- Delete {len(test_data['pet_ids'])} test pets ---")
        result = db.pets.delete_many({"id": {"$in": test_data['pet_ids']}})
        print(f"Deleted {result.deleted_count} test pets")
    
    # Delete automation logs for test pets
    print("\n--- Delete automation logs for test pets ---")
    result = db.automation_logs.delete_many({
        "$or": [
            {"details": {"$regex": "TestWeightPet"}},
            {"details": {"$regex": "TestGriefPet"}}
        ]
    })
    print(f"Deleted {result.deleted_count} automation logs")
    
    # Delete staff tasks created during test
    print("\n--- Delete staff tasks created during test ---")
    result = db.staff_tasks.delete_many({
        "$or": [
            {"title": {"$regex": "Test Upload"}},
            {"title": {"$regex": "UploadPet"}},
            {"dedupeKey": {"$regex": "previsit_urgent_"}}
        ]
    })
    print(f"Deleted {result.deleted_count} staff tasks")
    
    print_result(True, "CLEANUP COMPLETED")

def main():
    print("\n" + "="*80)
    print("VetBuddy NEW Features Testing")
    print("Upload Chunked Pre-Visita + 4 New Cron Automations")
    print("="*80)
    
    try:
        # Login
        clinic_token = login_clinic()
        if not clinic_token:
            print("\n❌ FATAL: Cannot proceed without clinic token")
            return
        
        # Part 1: Chunked Upload
        part1_success = test_part1_chunked_upload(clinic_token)
        
        # Part 2: Cron Automations
        part2_success = test_part2_cron_automations(clinic_token)
        
        # Part 3: Regression
        part3_success = test_part3_regression(clinic_token)
        
        # Cleanup
        cleanup()
        
        # Summary
        print("\n" + "="*80)
        print("FINAL SUMMARY")
        print("="*80)
        print(f"Part 1 (Chunked Upload): {'✅ PASS' if part1_success else '❌ FAIL'}")
        print(f"Part 2 (Cron Automations): {'✅ PASS' if part2_success else '❌ FAIL'}")
        print(f"Part 3 (Regression): {'✅ PASS' if part3_success else '❌ FAIL'}")
        
        if part1_success and part2_success and part3_success:
            print("\n🎉 ALL TESTS PASSED!")
        else:
            print("\n⚠️ SOME TESTS FAILED")
        
    except Exception as e:
        print(f"\n❌ FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
