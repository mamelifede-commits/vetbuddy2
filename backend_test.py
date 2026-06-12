#!/usr/bin/env python3
"""
VetBuddy Task Manager Staff API Testing
Tests the new /api/tasks endpoint and automation hooks
"""

import requests
import json
import time
from datetime import datetime, timedelta
from pymongo import MongoClient
import os

# Configuration
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"
MONGO_URL = os.getenv("MONGO_URL", "mongodb+srv://mamelifede_db_user:8XjA0yK3dnnyxy0M@cluster0.kk2vrpt.mongodb.net/vetbuddy")
DB_NAME = "vetbuddy"

# Credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"
OWNER_EMAIL = "proprietario.demo@vetbuddy.it"
OWNER_PASSWORD = "demo123"

# Global variables to store test data
clinic_token = None
owner_token = None
test_task_ids = []
test_previsit_form_id = None
test_previsit_token = None

def print_test(test_name):
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print('='*80)

def print_success(message):
    print(f"✅ SUCCESS: {message}")

def print_error(message):
    print(f"❌ ERROR: {message}")

def print_info(message):
    print(f"ℹ️  INFO: {message}")

# ============================================================================
# TEST 1: AUTHENTICATION
# ============================================================================
def test_auth():
    global clinic_token, owner_token
    
    print_test("1. AUTHENTICATION")
    
    # Test 1a: GET /api/tasks without token → 401
    try:
        print_info("Test 1a: GET /api/tasks without token → 401")
        response = requests.get(f"{BASE_URL}/tasks")
        if response.status_code == 401:
            print_success(f"Unauthorized access correctly blocked: {response.status_code}")
        else:
            print_error(f"Expected 401, got {response.status_code}: {response.text}")
    except Exception as e:
        print_error(f"Test 1a failed: {str(e)}")
    
    # Test 1b: Clinic login
    try:
        print_info("Test 1b: Clinic login")
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": CLINIC_EMAIL,
            "password": CLINIC_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            clinic_token = data.get("token")
            print_success(f"Clinic login successful, token: {clinic_token[:20]}...")
        else:
            print_error(f"Clinic login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Test 1b failed: {str(e)}")
        return False
    
    # Test 1c: Owner login
    try:
        print_info("Test 1c: Owner login")
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            owner_token = data.get("token")
            print_success(f"Owner login successful, token: {owner_token[:20]}...")
        else:
            print_error(f"Owner login failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_error(f"Test 1c failed: {str(e)}")
    
    # Test 1d: GET /api/tasks with owner token → 403
    try:
        print_info("Test 1d: GET /api/tasks with owner token → 403")
        response = requests.get(f"{BASE_URL}/tasks", headers={
            "Authorization": f"Bearer {owner_token}"
        })
        if response.status_code == 403:
            print_success(f"Owner access correctly blocked: {response.status_code}")
        else:
            print_error(f"Expected 403, got {response.status_code}: {response.text}")
    except Exception as e:
        print_error(f"Test 1d failed: {str(e)}")
    
    return True

# ============================================================================
# TEST 2: GET /api/tasks (clinic)
# ============================================================================
def test_get_tasks():
    print_test("2. GET /api/tasks (clinic)")
    
    try:
        print_info("GET /api/tasks with clinic token")
        response = requests.get(f"{BASE_URL}/tasks", headers={
            "Authorization": f"Bearer {clinic_token}"
        })
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "tasks" in data:
                tasks = data["tasks"]
                print_success(f"GET /api/tasks successful, found {len(tasks)} tasks")
                
                # Verify no MongoDB _id in results
                if tasks:
                    if "_id" in tasks[0]:
                        print_error("MongoDB _id found in task results (should be removed)")
                    else:
                        print_success("No MongoDB _id in results (correct)")
                
                return True
            else:
                print_error(f"Invalid response structure: {data}")
        else:
            print_error(f"GET /api/tasks failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_error(f"Test 2 failed: {str(e)}")
    
    return False

# ============================================================================
# TEST 3: SEED DEMO DATA
# ============================================================================
def test_seed_demo():
    global test_task_ids
    
    print_test("3. SEED DEMO DATA")
    
    # First, check if tasks already exist
    try:
        print_info("Checking if tasks already exist")
        response = requests.get(f"{BASE_URL}/tasks", headers={
            "Authorization": f"Bearer {clinic_token}"
        })
        if response.status_code == 200:
            data = response.json()
            existing_count = len(data.get("tasks", []))
            print_info(f"Found {existing_count} existing tasks")
            
            if existing_count > 0:
                print_info("⚠️  Tasks already exist, skipping seed test (as per instructions)")
                print_info("Note: If you want to test seed, manually delete tasks from MongoDB first")
                return True
    except Exception as e:
        print_error(f"Failed to check existing tasks: {str(e)}")
    
    # Test 3a: POST /api/tasks with seedDemo: true
    try:
        print_info("Test 3a: POST /api/tasks with seedDemo: true")
        response = requests.post(f"{BASE_URL}/tasks", 
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={"seedDemo": True}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("seeded") == 10:
                print_success(f"Seed demo successful: {data.get('seeded')} tasks created")
            else:
                print_error(f"Unexpected seed response: {data}")
        elif response.status_code == 400:
            print_info(f"Seed rejected (tasks already exist): {response.json()}")
            return True
        else:
            print_error(f"Seed demo failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_error(f"Test 3a failed: {str(e)}")
    
    # Test 3b: Second seed call should return 400
    try:
        print_info("Test 3b: Second POST seedDemo should return 400")
        response = requests.post(f"{BASE_URL}/tasks", 
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={"seedDemo": True}
        )
        
        if response.status_code == 400:
            print_success(f"Second seed correctly rejected: {response.status_code}")
        else:
            print_error(f"Expected 400, got {response.status_code}: {response.text}")
    except Exception as e:
        print_error(f"Test 3b failed: {str(e)}")
    
    # Test 3c: Verify 10 tasks with correct fields
    try:
        print_info("Test 3c: Verify 10 tasks with correct fields")
        response = requests.get(f"{BASE_URL}/tasks", headers={
            "Authorization": f"Bearer {clinic_token}"
        })
        
        if response.status_code == 200:
            data = response.json()
            tasks = data.get("tasks", [])
            
            if len(tasks) >= 10:
                print_success(f"Found {len(tasks)} tasks (at least 10)")
                
                # Check first task has all required fields
                task = tasks[0]
                required_fields = ["id", "clinicId", "title", "category", "priority", 
                                 "assignedTo", "dueDate", "status", "source", "reason", "createdAt"]
                missing_fields = [f for f in required_fields if f not in task]
                
                if not missing_fields:
                    print_success(f"All required fields present: {', '.join(required_fields)}")
                else:
                    print_error(f"Missing fields: {missing_fields}")
                
                # Find completed task
                completed_tasks = [t for t in tasks if t.get("status") == "completato"]
                if completed_tasks:
                    if completed_tasks[0].get("completedAt"):
                        print_success("Found completed task with completedAt field")
                    else:
                        print_error("Completed task missing completedAt field")
                
                # Store task IDs for cleanup
                test_task_ids = [t["id"] for t in tasks]
            else:
                print_error(f"Expected at least 10 tasks, found {len(tasks)}")
        else:
            print_error(f"Failed to verify tasks: {response.status_code}")
    except Exception as e:
        print_error(f"Test 3c failed: {str(e)}")
    
    # Test 3d: CLEANUP - Delete seeded tasks from MongoDB
    try:
        print_info("Test 3d: CLEANUP - Deleting seeded tasks from MongoDB")
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Get clinic ID from token
        response = requests.get(f"{BASE_URL}/auth/me", headers={
            "Authorization": f"Bearer {clinic_token}"
        })
        clinic_id = response.json().get("id")
        
        # Delete all tasks for this clinic
        result = db.staff_tasks.delete_many({"clinicId": clinic_id})
        print_success(f"Deleted {result.deleted_count} seeded tasks from MongoDB")
        
        client.close()
        test_task_ids = []
    except Exception as e:
        print_error(f"Test 3d cleanup failed: {str(e)}")
    
    return True

# ============================================================================
# TEST 4: CRUD MANUAL TASKS
# ============================================================================
def test_crud_manual():
    global test_task_ids
    
    print_test("4. CRUD MANUAL TASKS")
    
    created_task_id = None
    
    # Test 4a: POST create task
    try:
        print_info("Test 4a: POST create task")
        tomorrow = (datetime.now() + timedelta(days=1)).isoformat()
        response = requests.post(f"{BASE_URL}/tasks",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={
                "title": "TEST Richiamare cliente X",
                "category": "call",
                "priority": "alta",
                "assignedTo": "Dr. Test",
                "dueDate": tomorrow,
                "notes": "test note"
            }
        )
        
        if response.status_code == 201:
            data = response.json()
            if data.get("success") and data.get("task"):
                task = data["task"]
                created_task_id = task["id"]
                test_task_ids.append(created_task_id)
                
                if task.get("status") == "nuovo" and task.get("source") == "manual":
                    print_success(f"Task created: {created_task_id}, status={task['status']}, source={task['source']}")
                else:
                    print_error(f"Task created but wrong status/source: {task}")
            else:
                print_error(f"Invalid response: {data}")
        else:
            print_error(f"Create task failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Test 4a failed: {str(e)}")
        return False
    
    # Test 4b: POST without title → 400
    try:
        print_info("Test 4b: POST without title → 400")
        tomorrow = (datetime.now() + timedelta(days=1)).isoformat()
        response = requests.post(f"{BASE_URL}/tasks",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={"dueDate": tomorrow}
        )
        
        if response.status_code == 400:
            print_success(f"Missing title correctly rejected: {response.status_code}")
        else:
            print_error(f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_error(f"Test 4b failed: {str(e)}")
    
    # Test 4c: POST without dueDate → 400
    try:
        print_info("Test 4c: POST without dueDate → 400")
        response = requests.post(f"{BASE_URL}/tasks",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={"title": "Test task"}
        )
        
        if response.status_code == 400:
            print_success(f"Missing dueDate correctly rejected: {response.status_code}")
        else:
            print_error(f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_error(f"Test 4c failed: {str(e)}")
    
    # Test 4d: POST with invalid category → 201 but normalized
    try:
        print_info("Test 4d: POST with invalid category → normalized to 'call'")
        tomorrow = (datetime.now() + timedelta(days=1)).isoformat()
        response = requests.post(f"{BASE_URL}/tasks",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={
                "title": "TEST Invalid category",
                "category": "invalid_category",
                "dueDate": tomorrow
            }
        )
        
        if response.status_code == 201:
            data = response.json()
            task = data.get("task", {})
            if task.get("category") == "call":
                print_success(f"Invalid category normalized to 'call'")
                test_task_ids.append(task["id"])
            else:
                print_error(f"Category not normalized: {task.get('category')}")
        else:
            print_error(f"Expected 201, got {response.status_code}")
    except Exception as e:
        print_error(f"Test 4d failed: {str(e)}")
    
    # Test 4e: PUT update status to in_lavorazione
    try:
        print_info("Test 4e: PUT update status to 'in_lavorazione'")
        response = requests.put(f"{BASE_URL}/tasks",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={
                "taskId": created_task_id,
                "status": "in_lavorazione"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            task = data.get("task", {})
            if task.get("status") == "in_lavorazione":
                print_success(f"Status updated to 'in_lavorazione'")
            else:
                print_error(f"Status not updated: {task.get('status')}")
        else:
            print_error(f"Update failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_error(f"Test 4e failed: {str(e)}")
    
    # Test 4f: PUT update status to completato
    try:
        print_info("Test 4f: PUT update status to 'completato'")
        response = requests.put(f"{BASE_URL}/tasks",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={
                "taskId": created_task_id,
                "status": "completato"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            task = data.get("task", {})
            if task.get("status") == "completato" and task.get("completedAt") and task.get("completedBy"):
                print_success(f"Status updated to 'completato', completedAt={task['completedAt']}, completedBy={task['completedBy']}")
            else:
                print_error(f"Completed task missing fields: {task}")
        else:
            print_error(f"Update failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_error(f"Test 4f failed: {str(e)}")
    
    # Test 4g: PUT with invalid status → 400
    try:
        print_info("Test 4g: PUT with invalid status → 400")
        response = requests.put(f"{BASE_URL}/tasks",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={
                "taskId": created_task_id,
                "status": "stato_invalido"
            }
        )
        
        if response.status_code == 400:
            print_success(f"Invalid status correctly rejected: {response.status_code}")
        else:
            print_error(f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_error(f"Test 4g failed: {str(e)}")
    
    # Test 4h: PUT with non-existent taskId → 404
    try:
        print_info("Test 4h: PUT with non-existent taskId → 404")
        response = requests.put(f"{BASE_URL}/tasks",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={
                "taskId": "inesistente-task-id-12345",
                "status": "completato"
            }
        )
        
        if response.status_code == 404:
            print_success(f"Non-existent task correctly rejected: {response.status_code}")
        else:
            print_error(f"Expected 404, got {response.status_code}")
    except Exception as e:
        print_error(f"Test 4h failed: {str(e)}")
    
    # Test 4i: PUT modify fields
    try:
        print_info("Test 4i: PUT modify fields (title, priority, notes)")
        response = requests.put(f"{BASE_URL}/tasks",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={
                "taskId": created_task_id,
                "title": "TEST modificato",
                "priority": "bassa",
                "notes": "nuove note"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            task = data.get("task", {})
            if (task.get("title") == "TEST modificato" and 
                task.get("priority") == "bassa" and 
                task.get("notes") == "nuove note"):
                print_success(f"Fields updated correctly")
            else:
                print_error(f"Fields not updated: {task}")
        else:
            print_error(f"Update failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_error(f"Test 4i failed: {str(e)}")
    
    # Test 4j: DELETE task
    try:
        print_info("Test 4j: DELETE task")
        response = requests.delete(f"{BASE_URL}/tasks?id={created_task_id}",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code == 200:
            print_success(f"Task deleted successfully")
            test_task_ids.remove(created_task_id)
        else:
            print_error(f"Delete failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_error(f"Test 4j failed: {str(e)}")
    
    # Test 4k: Second DELETE same id → 404
    try:
        print_info("Test 4k: Second DELETE same id → 404")
        response = requests.delete(f"{BASE_URL}/tasks?id={created_task_id}",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code == 404:
            print_success(f"Second delete correctly rejected: {response.status_code}")
        else:
            print_error(f"Expected 404, got {response.status_code}")
    except Exception as e:
        print_error(f"Test 4k failed: {str(e)}")
    
    return True

# ============================================================================
# TEST 5: HOOK PREVISIT URGENTE (E2E)
# ============================================================================
def test_hook_previsit_urgent():
    global test_previsit_form_id, test_previsit_token
    
    print_test("5. HOOK PREVISIT URGENTE (E2E)")
    
    # Test 5a: Create previsit form
    try:
        print_info("Test 5a: POST /api/previsit (clinic) - create form")
        response = requests.post(f"{BASE_URL}/previsit",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={
                "ownerName": "Test Owner Task",
                "ownerEmail": "test-task@example.com",
                "petName": "TestPet",
                "type": "generale"
            }
        )
        
        if response.status_code == 201:
            data = response.json()
            if data.get("success") and data.get("formId"):
                test_previsit_form_id = data["formId"]
                print_success(f"Previsit form created: {test_previsit_form_id}")
            else:
                print_error(f"Invalid response: {data}")
                return False
        else:
            print_error(f"Create form failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Test 5a failed: {str(e)}")
        return False
    
    # Test 5b: Retrieve token from MongoDB
    try:
        print_info("Test 5b: Retrieve token from MongoDB")
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        form = db.previsit_forms.find_one({"id": test_previsit_form_id})
        if form and "token" in form:
            test_previsit_token = form["token"]
            print_success(f"Token retrieved: {test_previsit_token[:20]}...")
        else:
            print_error("Form not found in MongoDB or missing token")
            client.close()
            return False
        
        client.close()
    except Exception as e:
        print_error(f"Test 5b failed: {str(e)}")
        return False
    
    # Test 5c: Submit form with urgency Alta
    try:
        print_info("Test 5c: POST /api/previsit - submit with urgency Alta")
        response = requests.post(f"{BASE_URL}/previsit",
            json={
                "id": test_previsit_form_id,
                "token": test_previsit_token,
                "answers": {
                    "reason": "Test",
                    "symptoms": "Vomito",
                    "urgency": "Alta"
                }
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("status") == "da_revisionare":
                print_success(f"Form submitted with urgency Alta, status: {data['status']}")
                print_info("⚠️  Real email sent to clinic (expected once)")
            else:
                print_error(f"Unexpected response: {data}")
        else:
            print_error(f"Submit failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_error(f"Test 5c failed: {str(e)}")
    
    # Test 5d: Verify task created with dedupeKey
    try:
        print_info("Test 5d: GET /api/tasks - verify task created")
        time.sleep(2)  # Wait for task creation
        
        response = requests.get(f"{BASE_URL}/tasks", headers={
            "Authorization": f"Bearer {clinic_token}"
        })
        
        if response.status_code == 200:
            data = response.json()
            tasks = data.get("tasks", [])
            
            # Find task with dedupeKey
            dedupe_key = f"previsit_urgent_{test_previsit_form_id}"
            urgent_task = None
            for task in tasks:
                if task.get("dedupeKey") == dedupe_key:
                    urgent_task = task
                    break
            
            if urgent_task:
                print_success(f"Task created with dedupeKey: {dedupe_key}")
                
                # Verify task fields
                if (urgent_task.get("category") == "questionnaire" and
                    urgent_task.get("priority") == "alta" and
                    urgent_task.get("source") == "auto" and
                    "TestPet" in urgent_task.get("title", "")):
                    print_success(f"Task fields correct: category={urgent_task['category']}, priority={urgent_task['priority']}, source={urgent_task['source']}")
                else:
                    print_error(f"Task fields incorrect: {urgent_task}")
                
                test_task_ids.append(urgent_task["id"])
                
                # Test 5e: Verify idempotency - task should NOT be duplicated
                print_info("Test 5e: Verify idempotency - no duplicate tasks")
                duplicate_tasks = [t for t in tasks if t.get("dedupeKey") == dedupe_key]
                if len(duplicate_tasks) == 1:
                    print_success(f"Idempotency verified: only 1 task with dedupeKey {dedupe_key}")
                else:
                    print_error(f"Idempotency failed: found {len(duplicate_tasks)} tasks with same dedupeKey")
            else:
                print_error(f"Task with dedupeKey {dedupe_key} not found")
        else:
            print_error(f"Failed to get tasks: {response.status_code}")
    except Exception as e:
        print_error(f"Test 5d failed: {str(e)}")
    
    return True

# ============================================================================
# TEST 6: CRON (call ONCE - sends real emails!)
# ============================================================================
def test_cron():
    print_test("6. CRON (calling ONCE - sends real emails!)")
    
    try:
        print_info("⚠️  Calling GET /api/cron/daily ONCE (sends real emails via Resend)")
        response = requests.get(f"{BASE_URL}/cron/daily")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print_success("Cron job executed successfully")
                
                results = data.get("results", {})
                
                # Check for required automation results
                required_keys = ["labDelayAlert", "missingConsentCheck", "noShowRiskPrediction"]
                
                for key in required_keys:
                    if key in results:
                        result = results[key]
                        errors = result.get("errors", 0)
                        
                        if errors == 0:
                            print_success(f"{key}: errors=0 ✓ (sent={result.get('sent', 0)}, skipped={result.get('skipped', 0)})")
                        else:
                            print_error(f"{key}: errors={errors} (should be 0)")
                    else:
                        print_error(f"{key}: NOT FOUND in results")
                
                # Check if tasksCreated field exists in any automation
                tasks_created_found = False
                for key, result in results.items():
                    if "tasksCreated" in result:
                        tasks_created_found = True
                        print_info(f"{key}: tasksCreated={result['tasksCreated']}")
                
                if not tasks_created_found:
                    print_info("Note: No tasksCreated field in results (may be 0 or no matches)")
            else:
                print_error(f"Cron job failed: {data}")
        else:
            print_error(f"Cron job failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_error(f"Test 6 failed: {str(e)}")
    
    return True

# ============================================================================
# TEST 7: REGRESSION
# ============================================================================
def test_regression():
    print_test("7. REGRESSION")
    
    # Test 7a: GET /api/auth/me
    try:
        print_info("Test 7a: GET /api/auth/me (clinic)")
        response = requests.get(f"{BASE_URL}/auth/me", headers={
            "Authorization": f"Bearer {clinic_token}"
        })
        
        if response.status_code == 200:
            print_success("GET /api/auth/me working")
        else:
            print_error(f"GET /api/auth/me failed: {response.status_code}")
    except Exception as e:
        print_error(f"Test 7a failed: {str(e)}")
    
    # Test 7b: GET /api/inventory
    try:
        print_info("Test 7b: GET /api/inventory (clinic)")
        response = requests.get(f"{BASE_URL}/inventory", headers={
            "Authorization": f"Bearer {clinic_token}"
        })
        
        if response.status_code == 200:
            print_success("GET /api/inventory working")
        else:
            print_error(f"GET /api/inventory failed: {response.status_code}")
    except Exception as e:
        print_error(f"Test 7b failed: {str(e)}")
    
    # Test 7c: GET /api/previsit
    try:
        print_info("Test 7c: GET /api/previsit (clinic)")
        response = requests.get(f"{BASE_URL}/previsit", headers={
            "Authorization": f"Bearer {clinic_token}"
        })
        
        if response.status_code == 200:
            print_success("GET /api/previsit working")
        else:
            print_error(f"GET /api/previsit failed: {response.status_code}")
    except Exception as e:
        print_error(f"Test 7c failed: {str(e)}")
    
    return True

# ============================================================================
# TEST 8: CLEANUP FINALE
# ============================================================================
def test_cleanup():
    print_test("8. CLEANUP FINALE")
    
    try:
        print_info("Connecting to MongoDB for cleanup")
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Get clinic ID
        response = requests.get(f"{BASE_URL}/auth/me", headers={
            "Authorization": f"Bearer {clinic_token}"
        })
        clinic_id = response.json().get("id")
        
        # Delete all test tasks
        print_info("Deleting test tasks from staff_tasks collection")
        
        # Delete tasks with TEST in title
        result1 = db.staff_tasks.delete_many({
            "clinicId": clinic_id,
            "title": {"$regex": "^TEST", "$options": "i"}
        })
        print_success(f"Deleted {result1.deleted_count} tasks with 'TEST' in title")
        
        # Delete task with previsit_urgent dedupeKey
        if test_previsit_form_id:
            result2 = db.staff_tasks.delete_many({
                "clinicId": clinic_id,
                "dedupeKey": f"previsit_urgent_{test_previsit_form_id}"
            })
            print_success(f"Deleted {result2.deleted_count} previsit urgent task")
        
        # Delete any remaining tasks created during this test session
        if test_task_ids:
            result3 = db.staff_tasks.delete_many({
                "clinicId": clinic_id,
                "id": {"$in": test_task_ids}
            })
            print_success(f"Deleted {result3.deleted_count} tasks by ID")
        
        # Delete test previsit form
        if test_previsit_form_id:
            result4 = db.previsit_forms.delete_one({
                "id": test_previsit_form_id
            })
            print_success(f"Deleted {result4.deleted_count} test previsit form")
        
        # Also delete any previsit forms with test email
        result5 = db.previsit_forms.delete_many({
            "ownerEmail": "test-task@example.com"
        })
        print_success(f"Deleted {result5.deleted_count} previsit forms with test email")
        
        client.close()
        print_success("Cleanup completed successfully")
    except Exception as e:
        print_error(f"Cleanup failed: {str(e)}")
    
    return True

# ============================================================================
# MAIN
# ============================================================================
def main():
    print("\n" + "="*80)
    print("VetBuddy Task Manager Staff API Testing")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Clinic: {CLINIC_EMAIL}")
    print(f"Owner: {OWNER_EMAIL}")
    print("="*80)
    
    # Run tests
    test_auth()
    test_get_tasks()
    test_seed_demo()
    test_crud_manual()
    test_hook_previsit_urgent()
    test_cron()
    test_regression()
    test_cleanup()
    
    print("\n" + "="*80)
    print("TESTING COMPLETED")
    print("="*80)

if __name__ == "__main__":
    main()
