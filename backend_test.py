#!/usr/bin/env python3
"""
VetBuddy Inventory API and Automation Testing
Tests the new Inventory API and lowStockAlert/expiryStockAlert automations
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://clinic-report-review.preview.emergentagent.com/api"

# Test credentials
CLINIC_EMAIL = "demo@vetbuddy.it"
CLINIC_PASSWORD = "VetBuddy2025!Secure"
OWNER_EMAIL = "proprietario.demo@vetbuddy.it"
OWNER_PASSWORD = "demo123"

# Global variables
clinic_token = None
owner_token = None
created_item_id = None

def print_test_header(test_name):
    """Print a formatted test header"""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(success, message):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")

def test_1_auth_no_token():
    """Test 1: GET /api/inventory WITHOUT token → 401"""
    print_test_header("1. AUTH CHECK - No Token")
    try:
        response = requests.get(f"{BASE_URL}/inventory")
        if response.status_code == 401:
            print_result(True, f"Correctly returned 401 without token")
            return True
        else:
            print_result(False, f"Expected 401, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_2_auth_owner_token():
    """Test 2: GET /api/inventory with OWNER token → 403"""
    print_test_header("2. AUTH CHECK - Owner Token (should be 403)")
    global owner_token
    try:
        # First login as owner
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}
        )
        if login_response.status_code != 200:
            print_result(False, f"Owner login failed: {login_response.status_code} - {login_response.text}")
            return False
        
        owner_data = login_response.json()
        owner_token = owner_data.get("token")
        print(f"Owner login successful, token: {owner_token[:20]}...")
        
        # Try to access inventory with owner token
        response = requests.get(
            f"{BASE_URL}/inventory",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        if response.status_code == 403:
            print_result(True, f"Correctly returned 403 for owner role")
            return True
        else:
            print_result(False, f"Expected 403, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_3_clinic_login_and_get():
    """Test 3: Clinic login → token, GET /api/inventory → 200 with arrays"""
    print_test_header("3. CLINIC LOGIN and GET Inventory")
    global clinic_token
    try:
        # Login as clinic
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": CLINIC_EMAIL, "password": CLINIC_PASSWORD}
        )
        if login_response.status_code != 200:
            print_result(False, f"Clinic login failed: {login_response.status_code} - {login_response.text}")
            return False
        
        clinic_data = login_response.json()
        clinic_token = clinic_data.get("token")
        print(f"Clinic login successful, token: {clinic_token[:20]}...")
        
        # GET inventory
        response = requests.get(
            f"{BASE_URL}/inventory",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        if response.status_code != 200:
            print_result(False, f"GET inventory failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        if not data.get("success"):
            print_result(False, f"Response success is not true: {data}")
            return False
        
        if "items" not in data or "movements" not in data:
            print_result(False, f"Missing items or movements arrays: {data}")
            return False
        
        if not isinstance(data["items"], list) or not isinstance(data["movements"], list):
            print_result(False, f"items or movements are not arrays: {data}")
            return False
        
        print(f"Items count: {len(data['items'])}, Movements count: {len(data['movements'])}")
        print_result(True, f"GET /api/inventory returned 200 with success:true, items array ({len(data['items'])} items), movements array ({len(data['movements'])} movements)")
        return True
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_4_seed_demo_data():
    """Test 4: SEED - POST {"seedDemo": true} → 200 with seeded: 8 (or 400 if already exists)"""
    print_test_header("4. SEED Demo Data")
    try:
        # First check if items already exist
        get_response = requests.get(
            f"{BASE_URL}/inventory",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        existing_items = get_response.json().get("items", [])
        print(f"Current items count: {len(existing_items)}")
        
        # Try to seed
        response = requests.post(
            f"{BASE_URL}/inventory",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json={"seedDemo": True}
        )
        
        if len(existing_items) > 0:
            # Should return 400 if items already exist
            if response.status_code == 400:
                print_result(True, f"Correctly returned 400 when inventory not empty: {response.json().get('error')}")
                return True
            else:
                print_result(False, f"Expected 400 for non-empty inventory, got {response.status_code}: {response.text}")
                return False
        else:
            # Should return 200 with seeded count
            if response.status_code != 200:
                print_result(False, f"Seed failed: {response.status_code} - {response.text}")
                return False
            
            data = response.json()
            if not data.get("success") or data.get("seeded") != 8:
                print_result(False, f"Expected seeded: 8, got: {data}")
                return False
            
            # Verify items were created
            get_response = requests.get(
                f"{BASE_URL}/inventory",
                headers={"Authorization": f"Bearer {clinic_token}"}
            )
            new_items = get_response.json().get("items", [])
            print(f"After seeding, items count: {len(new_items)}")
            
            print_result(True, f"Successfully seeded 8 demo items")
            return True
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_5_create_item():
    """Test 5: CREATE - POST new item with low stock and expiring date"""
    print_test_header("5. CREATE New Item (Low Stock + Expiring)")
    global created_item_id
    try:
        new_item = {
            "name": "Test Vaccino Cron",
            "category": "vaccino",
            "quantity": 2,
            "minThreshold": 10,
            "unitPrice": 15,
            "supplier": "Test Lab",
            "lot": "TESTLOT",
            "expiryDate": "2026-07-20",
            "location": "Frigo Test"
        }
        
        response = requests.post(
            f"{BASE_URL}/inventory",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json=new_item
        )
        
        if response.status_code != 201:
            print_result(False, f"Create item failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        if not data.get("success") or "item" not in data:
            print_result(False, f"Invalid response: {data}")
            return False
        
        item = data["item"]
        created_item_id = item.get("id")
        
        # Verify all fields
        checks = [
            (item.get("name") == "Test Vaccino Cron", "name"),
            (item.get("category") == "vaccino", "category"),
            (item.get("quantity") == 2, "quantity"),
            (item.get("minThreshold") == 10, "minThreshold"),
            (item.get("unitPrice") == 15, "unitPrice"),
            (item.get("supplier") == "Test Lab", "supplier"),
            (item.get("lot") == "TESTLOT", "lot"),
            (created_item_id is not None, "id")
        ]
        
        all_passed = all(check[0] for check in checks)
        failed_fields = [check[1] for check in checks if not check[0]]
        
        if all_passed:
            print(f"Created item ID: {created_item_id}")
            print(f"Item details: quantity={item.get('quantity')} < minThreshold={item.get('minThreshold')} (LOW STOCK)")
            print(f"Expiry date: {item.get('expiryDate')} (within 60 days - EXPIRING)")
            print_result(True, f"Successfully created item with low stock and expiring date")
            return True
        else:
            print_result(False, f"Field validation failed for: {failed_fields}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_6_movement_out():
    """Test 6: MOVEMENT OUT - PUT with type 'out'"""
    print_test_header("6. MOVEMENT OUT")
    try:
        if not created_item_id:
            print_result(False, "No item ID from previous test")
            return False
        
        movement = {
            "itemId": created_item_id,
            "type": "out",
            "quantity": 1,
            "reason": "Test uso"
        }
        
        response = requests.put(
            f"{BASE_URL}/inventory",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json=movement
        )
        
        if response.status_code != 200:
            print_result(False, f"Movement OUT failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        if not data.get("success"):
            print_result(False, f"Response success is not true: {data}")
            return False
        
        new_quantity = data.get("newQuantity")
        if new_quantity != 1:
            print_result(False, f"Expected newQuantity: 1, got: {new_quantity}")
            return False
        
        # Verify movement appears in movements list
        get_response = requests.get(
            f"{BASE_URL}/inventory",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        movements = get_response.json().get("movements", [])
        out_movement = next((m for m in movements if m.get("itemId") == created_item_id and m.get("type") == "out"), None)
        
        if not out_movement:
            print_result(False, "Movement not found in movements list")
            return False
        
        print(f"New quantity: {new_quantity}, Movement type: {out_movement.get('type')}, Reason: {out_movement.get('reason')}")
        print_result(True, f"Movement OUT successful, quantity updated from 2 to 1")
        return True
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_7_movement_in():
    """Test 7: MOVEMENT IN - PUT with type 'in'"""
    print_test_header("7. MOVEMENT IN")
    try:
        if not created_item_id:
            print_result(False, "No item ID from previous test")
            return False
        
        movement = {
            "itemId": created_item_id,
            "type": "in",
            "quantity": 5,
            "reason": "Test rifornimento"
        }
        
        response = requests.put(
            f"{BASE_URL}/inventory",
            headers={"Authorization": f"Bearer {clinic_token}"},
            json=movement
        )
        
        if response.status_code != 200:
            print_result(False, f"Movement IN failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        if not data.get("success"):
            print_result(False, f"Response success is not true: {data}")
            return False
        
        new_quantity = data.get("newQuantity")
        if new_quantity != 6:
            print_result(False, f"Expected newQuantity: 6, got: {new_quantity}")
            return False
        
        # Verify movement appears in movements list
        get_response = requests.get(
            f"{BASE_URL}/inventory",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        movements = get_response.json().get("movements", [])
        in_movement = next((m for m in movements if m.get("itemId") == created_item_id and m.get("type") == "in" and m.get("quantity") == 5), None)
        
        if not in_movement:
            print_result(False, "Movement not found in movements list")
            return False
        
        print(f"New quantity: {new_quantity}, Movement type: {in_movement.get('type')}, Reason: {in_movement.get('reason')}")
        print_result(True, f"Movement IN successful, quantity updated from 1 to 6")
        return True
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_8_cron_automations():
    """Test 8: CRON - GET /api/cron/daily ONCE → check lowStockAlert and expiryStockAlert"""
    print_test_header("8. CRON AUTOMATIONS (CALLED ONCE - SENDS REAL EMAILS)")
    try:
        print("⚠️  WARNING: This test calls the cron endpoint which sends REAL emails via Resend")
        print("⚠️  Calling ONLY ONCE as instructed in review request")
        
        response = requests.get(f"{BASE_URL}/cron/daily")
        
        if response.status_code != 200:
            print_result(False, f"Cron call failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        if not data.get("success"):
            print_result(False, f"Response success is not true: {data}")
            return False
        
        results = data.get("results", {})
        
        # Check for lowStockAlert key
        if "lowStockAlert" not in results:
            print_result(False, f"lowStockAlert key not found in results: {list(results.keys())}")
            return False
        
        # Check for expiryStockAlert key
        if "expiryStockAlert" not in results:
            print_result(False, f"expiryStockAlert key not found in results: {list(results.keys())}")
            return False
        
        low_stock = results["lowStockAlert"]
        expiry_stock = results["expiryStockAlert"]
        
        print(f"\nlowStockAlert results:")
        print(f"  - sent: {low_stock.get('sent', 0)}")
        print(f"  - errors: {low_stock.get('errors', 0)}")
        print(f"  - skipped: {low_stock.get('skipped', 0)}")
        
        print(f"\nexpiryStockAlert results:")
        print(f"  - sent: {expiry_stock.get('sent', 0)}")
        print(f"  - errors: {expiry_stock.get('errors', 0)}")
        print(f"  - skipped: {expiry_stock.get('skipped', 0)}")
        
        # Verify no errors
        if low_stock.get("errors", 0) != 0:
            print_result(False, f"lowStockAlert has errors: {low_stock.get('errors')}")
            return False
        
        if expiry_stock.get("errors", 0) != 0:
            print_result(False, f"expiryStockAlert has errors: {expiry_stock.get('errors')}")
            return False
        
        # Check if emails were sent (should be >= 1 based on seeded data)
        low_stock_sent = low_stock.get("sent", 0)
        expiry_stock_sent = expiry_stock.get("sent", 0)
        
        print(f"\n📧 Email Summary:")
        print(f"  - lowStockAlert emails sent: {low_stock_sent} (expected >= 1 from seeded 'Vaccino Leucemia Felina' with qty 4 < threshold 5)")
        print(f"  - expiryStockAlert emails sent: {expiry_stock_sent} (expected >= 1 from items expiring within 60 days)")
        
        # Note: Other automations may be skipped due to daily idempotency flags
        other_automations = [k for k in results.keys() if k not in ["lowStockAlert", "expiryStockAlert"]]
        if other_automations:
            print(f"\nℹ️  Other automations present: {', '.join(other_automations)}")
            print(f"   (Some may be skipped due to daily idempotency flags from earlier runs today)")
        
        print_result(True, f"Cron executed successfully with lowStockAlert and expiryStockAlert keys present, errors=0 for both")
        return True
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_9_delete_item():
    """Test 9: DELETE - DELETE item → 200, DELETE again → 404"""
    print_test_header("9. DELETE Item")
    try:
        if not created_item_id:
            print_result(False, "No item ID from previous test")
            return False
        
        # First delete
        response = requests.delete(
            f"{BASE_URL}/inventory?id={created_item_id}",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code != 200:
            print_result(False, f"First DELETE failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        if not data.get("success"):
            print_result(False, f"Response success is not true: {data}")
            return False
        
        print(f"First DELETE successful for item {created_item_id}")
        
        # Verify item is gone
        get_response = requests.get(
            f"{BASE_URL}/inventory",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        items = get_response.json().get("items", [])
        item_exists = any(item.get("id") == created_item_id for item in items)
        
        if item_exists:
            print_result(False, "Item still exists after DELETE")
            return False
        
        print(f"Verified item is gone from inventory list")
        
        # Second delete (should return 404)
        response2 = requests.delete(
            f"{BASE_URL}/inventory?id={created_item_id}",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response2.status_code != 404:
            print_result(False, f"Second DELETE should return 404, got {response2.status_code}: {response2.text}")
            return False
        
        print(f"Second DELETE correctly returned 404")
        print_result(True, f"DELETE operations working correctly: first DELETE → 200, second DELETE → 404")
        return True
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_10_regression_auth_me():
    """Test 10: Regression - GET /api/auth/me (clinic)"""
    print_test_header("10. REGRESSION - Auth Me")
    try:
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {clinic_token}"}
        )
        
        if response.status_code != 200:
            print_result(False, f"GET /api/auth/me failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        if not data.get("id") or not data.get("email"):
            print_result(False, f"Invalid user data: {data}")
            return False
        
        print(f"User: {data.get('email')}, Role: {data.get('role')}")
        print_result(True, f"GET /api/auth/me working correctly")
        return True
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("VETBUDDY INVENTORY API AND AUTOMATION TESTING")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Clinic: {CLINIC_EMAIL}")
    print(f"Owner: {OWNER_EMAIL}")
    print(f"Test Time: {datetime.now().isoformat()}")
    
    tests = [
        ("1. Auth Check - No Token", test_1_auth_no_token),
        ("2. Auth Check - Owner Token (403)", test_2_auth_owner_token),
        ("3. Clinic Login and GET Inventory", test_3_clinic_login_and_get),
        ("4. Seed Demo Data", test_4_seed_demo_data),
        ("5. Create Item (Low Stock + Expiring)", test_5_create_item),
        ("6. Movement OUT", test_6_movement_out),
        ("7. Movement IN", test_7_movement_in),
        ("8. Cron Automations (ONCE)", test_8_cron_automations),
        ("9. Delete Item", test_9_delete_item),
        ("10. Regression - Auth Me", test_10_regression_auth_me),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ CRITICAL ERROR in {test_name}: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\n{'='*80}")
    print(f"TOTAL: {passed}/{total} tests passed ({passed*100//total}%)")
    print(f"{'='*80}\n")
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
