#!/usr/bin/env python3

import requests
import json

BASE_URL = "https://paw-prints-landing.preview.emergentagent.com/api"

def make_request(method, endpoint, json_data=None):
    """Debug version of make request"""
    url = f"{BASE_URL}/{endpoint}"
    print(f"Making {method} request to: {url}")
    print(f"Data: {json_data}")
    
    try:
        if method.upper() == 'POST':
            headers = {'Content-Type': 'application/json'}
            response = requests.post(url, headers=headers, json=json_data, timeout=30)
        else:
            response = requests.get(url, timeout=30)
        
        print(f"Response status: {response.status_code}")
        print(f"Response object: {response}")
        print(f"Response is None: {response is None}")
        print(f"Response text: {response.text}")
        
        return response
    except Exception as e:
        print(f"Exception: {e}")
        print(f"Exception type: {type(e)}")
        import traceback
        traceback.print_exc()
        return None

# Test the problematic request
print("=" * 50)
print("Testing payment API missing appointmentId")
print("=" * 50)

response = make_request('POST', 'payments/appointment', {'originUrl': 'test'})

if response:
    print("Response received successfully")
    if response.status_code == 400:
        print("Correct status code 400")
        try:
            data = response.json()
            print(f"JSON data: {data}")
            print("TEST WOULD PASS")
        except Exception as e:
            print(f"JSON parsing error: {e}")
    else:
        print(f"Unexpected status: {response.status_code}")
else:
    print("ERROR: Response is None!")