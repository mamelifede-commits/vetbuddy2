#!/usr/bin/env python3
"""
VetBuddy Enhanced Team Inbox API Testing
Tests: Login, Get Messages, Create Message, Assign, Change Status, Change Priority, Reply
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

def test_enhanced_inbox_api():
    """Test Enhanced Team Inbox API endpoints"""
    print("=" * 80)
    print("ENHANCED TEAM INBOX API TESTING")
    print("=" * 80)
    
    token = None
    message_id = None
    
    # Test 1: Login
    try:
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
            else:
                print_test_result("Login Authentication", False, "No token in response")
                return
        else:
            print_test_result(
                "Login Authentication",
                False,
                f"Status {login_response.status_code}: {login_response.text}"
            )
            return
    except Exception as e:
        print_test_result("Login Authentication", False, f"Exception: {str(e)}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 2: Get Messages
    try:
        print("\n[TEST 2] GET /api/messages - List Messages")
        messages_response = requests.get(
            f"{BASE_URL}/messages",
            headers=headers,
            timeout=10
        )
        
        if messages_response.status_code == 200:
            messages = messages_response.json()
            message_count = len(messages) if isinstance(messages, list) else 0
            
            print_test_result(
                "Get Messages",
                True,
                f"Retrieved {message_count} messages"
            )
            
            # Use first message if available, otherwise create one
            if message_count > 0:
                message_id = messages[0].get('id')
                print(f"  Using existing message ID: {message_id}")
                print(f"  Message subject: {messages[0].get('subject', 'N/A')}")
                print(f"  Current status: {messages[0].get('status', 'N/A')}")
                print(f"  Current priority: {messages[0].get('priority', 'N/A')}")
            else:
                print("  No existing messages found. Will create a test message.")
        else:
            print_test_result(
                "Get Messages",
                False,
                f"Status {messages_response.status_code}: {messages_response.text}"
            )
    except Exception as e:
        print_test_result("Get Messages", False, f"Exception: {str(e)}")
    
    # Test 3: Create Test Message (if needed)
    if not message_id:
        try:
            print("\n[TEST 3] POST /api/messages - Create Test Message")
            create_response = requests.post(
                f"{BASE_URL}/messages",
                headers=headers,
                json={
                    "receiverId": "test",
                    "content": "Test inbox message for Enhanced Team Inbox API testing",
                    "subject": "Test ticket priorità alta",
                    "from": "owner"
                },
                timeout=10
            )
            
            if create_response.status_code == 200:
                created_message = create_response.json()
                message_id = created_message.get('id')
                
                print_test_result(
                    "Create Test Message",
                    True,
                    f"Created message ID: {message_id}, Subject: {created_message.get('subject')}"
                )
            else:
                print_test_result(
                    "Create Test Message",
                    False,
                    f"Status {create_response.status_code}: {create_response.text}"
                )
                return
        except Exception as e:
            print_test_result("Create Test Message", False, f"Exception: {str(e)}")
            return
    else:
        print("\n[TEST 3] POST /api/messages - Create Test Message")
        print("  ⏭️  SKIPPED: Using existing message for testing")
    
    if not message_id:
        print("\n❌ CRITICAL: No message ID available for testing. Aborting.")
        return
    
    # Test 4: Assign Message
    try:
        print(f"\n[TEST 4] PUT /api/messages/{message_id}/assign - Assign Message")
        assign_response = requests.put(
            f"{BASE_URL}/messages/{message_id}/assign",
            headers=headers,
            json={"assignedTo": "Dr. Rossi"},
            timeout=10
        )
        
        if assign_response.status_code == 200:
            assigned_message = assign_response.json()
            assigned_to = assigned_message.get('assignedTo')
            status = assigned_message.get('status')
            
            if assigned_to == "Dr. Rossi" and status == "in_lavorazione":
                print_test_result(
                    "Assign Message",
                    True,
                    f"Assigned to: {assigned_to}, Status changed to: {status}"
                )
            else:
                print_test_result(
                    "Assign Message",
                    False,
                    f"Expected assignedTo='Dr. Rossi' and status='in_lavorazione', got assignedTo='{assigned_to}', status='{status}'"
                )
        else:
            print_test_result(
                "Assign Message",
                False,
                f"Status {assign_response.status_code}: {assign_response.text}"
            )
    except Exception as e:
        print_test_result("Assign Message", False, f"Exception: {str(e)}")
    
    # Test 5: Change Status to "risolto"
    try:
        print(f"\n[TEST 5] PUT /api/messages/{message_id}/status - Change Status to 'risolto'")
        status_response = requests.put(
            f"{BASE_URL}/messages/{message_id}/status",
            headers=headers,
            json={"status": "risolto"},
            timeout=10
        )
        
        if status_response.status_code == 200:
            updated_message = status_response.json()
            new_status = updated_message.get('status')
            resolved_at = updated_message.get('resolvedAt')
            
            if new_status == "risolto":
                print_test_result(
                    "Change Status to 'risolto'",
                    True,
                    f"Status changed to: {new_status}, resolvedAt: {resolved_at}"
                )
            else:
                print_test_result(
                    "Change Status to 'risolto'",
                    False,
                    f"Expected status='risolto', got status='{new_status}'"
                )
        else:
            print_test_result(
                "Change Status to 'risolto'",
                False,
                f"Status {status_response.status_code}: {status_response.text}"
            )
    except Exception as e:
        print_test_result("Change Status to 'risolto'", False, f"Exception: {str(e)}")
    
    # Test 6: Change Priority to "alta"
    try:
        print(f"\n[TEST 6] PUT /api/messages/{message_id}/priority - Change Priority to 'alta'")
        priority_response = requests.put(
            f"{BASE_URL}/messages/{message_id}/priority",
            headers=headers,
            json={"priority": "alta"},
            timeout=10
        )
        
        if priority_response.status_code == 200:
            updated_message = priority_response.json()
            new_priority = updated_message.get('priority')
            
            if new_priority == "alta":
                print_test_result(
                    "Change Priority to 'alta'",
                    True,
                    f"Priority changed to: {new_priority}"
                )
            else:
                print_test_result(
                    "Change Priority to 'alta'",
                    False,
                    f"Expected priority='alta', got priority='{new_priority}'"
                )
        else:
            print_test_result(
                "Change Priority to 'alta'",
                False,
                f"Status {priority_response.status_code}: {priority_response.text}"
            )
    except Exception as e:
        print_test_result("Change Priority to 'alta'", False, f"Exception: {str(e)}")
    
    # Test 7: Reply to Message
    try:
        print(f"\n[TEST 7] POST /api/messages/reply - Reply to Message")
        reply_response = requests.post(
            f"{BASE_URL}/messages/reply",
            headers=headers,
            json={
                "originalMessageId": message_id,
                "content": "Grazie per la segnalazione, provvediamo subito!"
            },
            timeout=10
        )
        
        if reply_response.status_code == 200:
            reply_data = reply_response.json()
            success = reply_data.get('success')
            reply_message = reply_data.get('reply', {})
            reply_id = reply_message.get('id')
            reply_content = reply_message.get('content')
            
            if success and reply_id:
                print_test_result(
                    "Reply to Message",
                    True,
                    f"Reply created with ID: {reply_id}, Content: {reply_content[:50]}..."
                )
            else:
                print_test_result(
                    "Reply to Message",
                    False,
                    f"Expected success=true and reply ID, got success={success}, reply_id={reply_id}"
                )
        else:
            print_test_result(
                "Reply to Message",
                False,
                f"Status {reply_response.status_code}: {reply_response.text}"
            )
    except Exception as e:
        print_test_result("Reply to Message", False, f"Exception: {str(e)}")
    
    # Test 8: Verify Reply in Messages List
    try:
        print("\n[TEST 8] GET /api/messages - Verify Reply in Messages List")
        verify_response = requests.get(
            f"{BASE_URL}/messages",
            headers=headers,
            timeout=10
        )
        
        if verify_response.status_code == 200:
            all_messages = verify_response.json()
            reply_messages = [m for m in all_messages if m.get('type') == 'reply' and m.get('replyTo') == message_id]
            
            if len(reply_messages) > 0:
                latest_reply = reply_messages[0]
                print_test_result(
                    "Verify Reply in Messages List",
                    True,
                    f"Found {len(reply_messages)} reply message(s). Latest reply content: {latest_reply.get('content', '')[:50]}..."
                )
            else:
                print_test_result(
                    "Verify Reply in Messages List",
                    False,
                    f"No reply messages found for original message ID {message_id}"
                )
        else:
            print_test_result(
                "Verify Reply in Messages List",
                False,
                f"Status {verify_response.status_code}: {verify_response.text}"
            )
    except Exception as e:
        print_test_result("Verify Reply in Messages List", False, f"Exception: {str(e)}")
    
    # Test 9: Reset Status to "nuovo"
    try:
        print(f"\n[TEST 9] PUT /api/messages/{message_id}/status - Reset Status to 'nuovo'")
        reset_response = requests.put(
            f"{BASE_URL}/messages/{message_id}/status",
            headers=headers,
            json={"status": "nuovo"},
            timeout=10
        )
        
        if reset_response.status_code == 200:
            reset_message = reset_response.json()
            reset_status = reset_message.get('status')
            
            if reset_status == "nuovo":
                print_test_result(
                    "Reset Status to 'nuovo'",
                    True,
                    f"Status successfully reverted to: {reset_status}"
                )
            else:
                print_test_result(
                    "Reset Status to 'nuovo'",
                    False,
                    f"Expected status='nuovo', got status='{reset_status}'"
                )
        else:
            print_test_result(
                "Reset Status to 'nuovo'",
                False,
                f"Status {reset_response.status_code}: {reset_response.text}"
            )
    except Exception as e:
        print_test_result("Reset Status to 'nuovo'", False, f"Exception: {str(e)}")
    
    print("\n" + "=" * 80)
    print("ENHANCED TEAM INBOX API TESTING COMPLETED")
    print("=" * 80)

if __name__ == "__main__":
    test_enhanced_inbox_api()
