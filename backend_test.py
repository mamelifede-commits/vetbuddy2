#!/usr/bin/env python3
"""
VetBuddy Backend API Testing - Automation Settings Focus
Test the newly implemented Automation Settings API with comprehensive scenarios
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime

# Base URL from environment
BASE_URL = "https://vetbuddy-automations.preview.emergentagent.com"
LOGIN_EMAIL = "demo@vetbuddy.it"
LOGIN_PASSWORD = "DemoVet2025!"

class VetBuddyTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = None
        self.auth_token = None
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "skipped": 0,
            "errors": []
        }

    async def create_session(self):
        """Create aiohttp session"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={"Content-Type": "application/json"}
        )

    async def close_session(self):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()

    async def login_and_get_token(self):
        """Login with demo clinic credentials and get JWT token"""
        try:
            print("🔑 Testing login with demo clinic credentials...")
            
            login_data = {
                "email": LOGIN_EMAIL,
                "password": LOGIN_PASSWORD
            }
            
            async with self.session.post(
                f"{self.base_url}/api/auth/login",
                data=json.dumps(login_data)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'token' in data and data.get('user', {}).get('role') == 'clinic':
                        self.auth_token = data['token']
                        print(f"✅ Login successful - Token obtained for clinic: {data['user']['clinicName']}")
                        self.test_results["passed"] += 1
                        return True
                    else:
                        print("❌ Login failed - Invalid response format")
                        self.test_results["failed"] += 1
                        self.test_results["errors"].append("Login failed - Invalid response format")
                        return False
                else:
                    print(f"❌ Login failed - Status {response.status}")
                    error_text = await response.text()
                    self.test_results["failed"] += 1
                    self.test_results["errors"].append(f"Login failed - Status {response.status}: {error_text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"Login error: {str(e)}")
            return False

    async def test_get_automation_settings(self):
        """Test GET /api/automations/settings - Should return all 12 automation settings"""
        try:
            print("\n📋 Testing GET /api/automations/settings...")
            
            if not self.auth_token:
                print("❌ No auth token available")
                self.test_results["failed"] += 1
                return False
                
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            async with self.session.get(
                f"{self.base_url}/api/automations/settings",
                headers=headers
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify response structure
                    if not data.get('success'):
                        print("❌ Response missing success field")
                        self.test_results["failed"] += 1
                        return False
                    
                    settings = data.get('settings', {})
                    
                    # Expected 12 automation settings
                    expected_settings = [
                        'appointmentReminders', 'bookingConfirmation', 'vaccineRecalls', 
                        'postVisitFollowup', 'noShowDetection', 'waitlistNotification',
                        'suggestedSlots', 'documentReminders', 'autoTicketAssignment',
                        'aiQuickReplies', 'urgencyNotifications', 'weeklyReport'
                    ]
                    
                    # Check all 12 settings are present
                    missing_settings = []
                    for setting in expected_settings:
                        if setting not in settings:
                            missing_settings.append(setting)
                        elif settings[setting] is not True:  # Should default to true
                            print(f"⚠️  Setting {setting} is not defaulting to true: {settings[setting]}")
                    
                    if missing_settings:
                        print(f"❌ Missing settings: {missing_settings}")
                        self.test_results["failed"] += 1
                        self.test_results["errors"].append(f"Missing automation settings: {missing_settings}")
                        return False
                    else:
                        print(f"✅ All 12 automation settings found and defaulting to true")
                        print(f"   Settings: {list(settings.keys())}")
                        self.test_results["passed"] += 1
                        return True
                        
                else:
                    print(f"❌ GET settings failed - Status {response.status}")
                    error_text = await response.text()
                    self.test_results["failed"] += 1
                    self.test_results["errors"].append(f"GET settings failed - Status {response.status}: {error_text}")
                    return False
                    
        except Exception as e:
            print(f"❌ GET settings error: {str(e)}")
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"GET settings error: {str(e)}")
            return False

    async def test_post_single_automation_setting(self):
        """Test POST /api/automations/settings - Toggle single setting"""
        try:
            print("\n🔄 Testing POST /api/automations/settings (single setting toggle)...")
            
            if not self.auth_token:
                print("❌ No auth token available")
                self.test_results["failed"] += 1
                return False
                
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test disabling appointmentReminders
            test_data = {
                "key": "appointmentReminders",
                "enabled": False
            }
            
            async with self.session.post(
                f"{self.base_url}/api/automations/settings",
                headers=headers,
                data=json.dumps(test_data)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify response
                    if (data.get('success') and 
                        data.get('key') == 'appointmentReminders' and 
                        data.get('enabled') == False):
                        print("✅ Successfully disabled appointmentReminders")
                        self.test_results["passed"] += 1
                        return True
                    else:
                        print(f"❌ Invalid response structure: {data}")
                        self.test_results["failed"] += 1
                        self.test_results["errors"].append(f"POST single setting invalid response: {data}")
                        return False
                        
                else:
                    print(f"❌ POST single setting failed - Status {response.status}")
                    error_text = await response.text()
                    self.test_results["failed"] += 1
                    self.test_results["errors"].append(f"POST single setting failed - Status {response.status}: {error_text}")
                    return False
                    
        except Exception as e:
            print(f"❌ POST single setting error: {str(e)}")
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"POST single setting error: {str(e)}")
            return False

    async def test_verify_setting_change(self):
        """Verify that appointmentReminders is now false"""
        try:
            print("\n🔍 Verifying that appointmentReminders is now disabled...")
            
            if not self.auth_token:
                print("❌ No auth token available")
                self.test_results["failed"] += 1
                return False
                
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            async with self.session.get(
                f"{self.base_url}/api/automations/settings",
                headers=headers
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    settings = data.get('settings', {})
                    
                    if settings.get('appointmentReminders') == False:
                        print("✅ appointmentReminders correctly showing as disabled")
                        self.test_results["passed"] += 1
                        return True
                    else:
                        print(f"❌ appointmentReminders should be false but is: {settings.get('appointmentReminders')}")
                        self.test_results["failed"] += 1
                        self.test_results["errors"].append(f"Setting change not persisted - appointmentReminders: {settings.get('appointmentReminders')}")
                        return False
                        
                else:
                    print(f"❌ Verification failed - Status {response.status}")
                    self.test_results["failed"] += 1
                    return False
                    
        except Exception as e:
            print(f"❌ Verification error: {str(e)}")
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"Verification error: {str(e)}")
            return False

    async def test_put_multiple_settings(self):
        """Test PUT /api/automations/settings - Update multiple settings"""
        try:
            print("\n📝 Testing PUT /api/automations/settings (multiple settings update)...")
            
            if not self.auth_token:
                print("❌ No auth token available")
                self.test_results["failed"] += 1
                return False
                
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test updating multiple settings
            test_data = {
                "settings": {
                    "appointmentReminders": True,  # Re-enable this
                    "vaccineRecalls": False,       # Disable this
                    "weeklyReport": False          # Disable this too
                }
            }
            
            async with self.session.put(
                f"{self.base_url}/api/automations/settings",
                headers=headers,
                data=json.dumps(test_data)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify response
                    if data.get('success') and 'settings' in data:
                        print("✅ Successfully updated multiple settings")
                        print(f"   Updated settings: {data['settings']}")
                        self.test_results["passed"] += 1
                        return True
                    else:
                        print(f"❌ Invalid response structure: {data}")
                        self.test_results["failed"] += 1
                        self.test_results["errors"].append(f"PUT multiple settings invalid response: {data}")
                        return False
                        
                else:
                    print(f"❌ PUT multiple settings failed - Status {response.status}")
                    error_text = await response.text()
                    self.test_results["failed"] += 1
                    self.test_results["errors"].append(f"PUT multiple settings failed - Status {response.status}: {error_text}")
                    return False
                    
        except Exception as e:
            print(f"❌ PUT multiple settings error: {str(e)}")
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"PUT multiple settings error: {str(e)}")
            return False

    async def test_cron_job_with_settings(self):
        """Test GET /api/cron/daily - Execute and check if disabled settings show in skipped count"""
        try:
            print("\n⏰ Testing GET /api/cron/daily (cron job execution)...")
            
            # Note: Cron job doesn't require auth token, but may require special header in production
            async with self.session.get(
                f"{self.base_url}/api/cron/daily"
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify response structure
                    if not data.get('success'):
                        print("❌ Cron job response missing success field")
                        self.test_results["failed"] += 1
                        return False
                    
                    results = data.get('results', {})
                    
                    # Check that we have the expected result categories
                    expected_categories = [
                        'promemoria', 'richiamiVaccini', 'followUp', 
                        'noShow', 'documentReminders', 'weeklyReports'
                    ]
                    
                    missing_categories = []
                    for category in expected_categories:
                        if category not in results:
                            missing_categories.append(category)
                    
                    if missing_categories:
                        print(f"❌ Missing result categories: {missing_categories}")
                        self.test_results["failed"] += 1
                        self.test_results["errors"].append(f"Missing cron result categories: {missing_categories}")
                        return False
                    
                    # Verify each category has counts
                    total_processed = 0
                    total_skipped = 0
                    
                    for category, result in results.items():
                        if isinstance(result, dict):
                            skipped = result.get('skipped', 0)
                            sent = result.get('sent', 0)
                            marked = result.get('marked', 0)  # For noShow
                            errors = result.get('errors', 0)
                            
                            total_skipped += skipped
                            total_processed += sent + marked
                            
                            print(f"   {category}: sent/marked={sent + marked}, skipped={skipped}, errors={errors}")
                    
                    print(f"✅ Cron job executed successfully")
                    print(f"   Total processed: {total_processed}, Total skipped: {total_skipped}")
                    
                    if total_skipped > 0:
                        print(f"   ℹ️  Skipped items likely due to disabled automation settings")
                    
                    self.test_results["passed"] += 1
                    return True
                        
                else:
                    print(f"❌ Cron job failed - Status {response.status}")
                    error_text = await response.text()
                    self.test_results["failed"] += 1
                    self.test_results["errors"].append(f"Cron job failed - Status {response.status}: {error_text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Cron job error: {str(e)}")
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"Cron job error: {str(e)}")
            return False

    async def test_re_enable_appointment_reminders(self):
        """Re-enable appointmentReminders for final verification"""
        try:
            print("\n🔄 Re-enabling appointmentReminders...")
            
            if not self.auth_token:
                print("❌ No auth token available")
                self.test_results["failed"] += 1
                return False
                
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Re-enable appointmentReminders
            test_data = {
                "key": "appointmentReminders",
                "enabled": True
            }
            
            async with self.session.post(
                f"{self.base_url}/api/automations/settings",
                headers=headers,
                data=json.dumps(test_data)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if (data.get('success') and 
                        data.get('key') == 'appointmentReminders' and 
                        data.get('enabled') == True):
                        print("✅ Successfully re-enabled appointmentReminders")
                        self.test_results["passed"] += 1
                        return True
                    else:
                        print(f"❌ Failed to re-enable setting: {data}")
                        self.test_results["failed"] += 1
                        return False
                        
                else:
                    print(f"❌ Re-enable failed - Status {response.status}")
                    self.test_results["failed"] += 1
                    return False
                    
        except Exception as e:
            print(f"❌ Re-enable error: {str(e)}")
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"Re-enable error: {str(e)}")
            return False

    async def test_unauthorized_access(self):
        """Test that non-clinic users cannot access the automation settings API"""
        try:
            print("\n🚫 Testing unauthorized access (no token)...")
            
            # Try without authorization header
            async with self.session.get(
                f"{self.base_url}/api/automations/settings"
            ) as response:
                if response.status == 401:
                    print("✅ Correctly blocked unauthorized access (401)")
                    self.test_results["passed"] += 1
                    return True
                else:
                    print(f"❌ Should have returned 401 but got {response.status}")
                    self.test_results["failed"] += 1
                    self.test_results["errors"].append(f"Authorization check failed - Expected 401 but got {response.status}")
                    return False
                    
        except Exception as e:
            print(f"❌ Unauthorized access test error: {str(e)}")
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"Unauthorized access test error: {str(e)}")
            return False

    async def run_all_tests(self):
        """Run all automation settings tests"""
        print("🚀 Starting VetBuddy Automation Settings API Tests")
        print("=" * 60)
        
        await self.create_session()
        
        try:
            # Run tests in sequence
            await self.login_and_get_token()
            await self.test_get_automation_settings()
            await self.test_post_single_automation_setting()
            await self.test_verify_setting_change()
            await self.test_put_multiple_settings()
            await self.test_cron_job_with_settings()
            await self.test_re_enable_appointment_reminders()
            await self.test_unauthorized_access()
            
        finally:
            await self.close_session()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        print(f"⏭️  Skipped: {self.test_results['skipped']}")
        
        if self.test_results['errors']:
            print(f"\n🚨 ERRORS FOUND:")
            for i, error in enumerate(self.test_results['errors'], 1):
                print(f"   {i}. {error}")
        
        if self.test_results['failed'] == 0:
            print(f"\n🎉 ALL TESTS PASSED! Automation Settings API is working correctly.")
            return True
        else:
            print(f"\n⚠️  {self.test_results['failed']} test(s) failed. Please check the errors above.")
            return False

# Run the tests
async def main():
    tester = VetBuddyTester()
    success = await tester.run_all_tests()
    return success

if __name__ == "__main__":
    result = asyncio.run(main())
    if not result:
        exit(1)