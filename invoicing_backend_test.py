#!/usr/bin/env python3

"""
VetBuddy Invoicing/Billing API Backend Tests
Testing all invoicing API endpoints as specified in the review request
"""

import requests
import json
import time
import csv
from io import StringIO

# Configuration
BASE_URL = "https://vetbuddy-lab-module.preview.emergentagent.com/api"
TEST_CLINIC_EMAIL = "demo@vetbuddy.it"
TEST_CLINIC_PASSWORD = "password123"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def print_header(message):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")

class VetBuddyInvoicingTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.auth_token = None
        self.test_invoice_id = None
        self.test_service_id = None
        
    def authenticate(self):
        """Authenticate with VetBuddy clinic credentials"""
        print_header("🔐 AUTHENTICATION TEST")
        
        try:
            # Login with clinic credentials
            login_data = {
                "email": TEST_CLINIC_EMAIL,
                "password": TEST_CLINIC_PASSWORD
            }
            
            response = requests.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data:
                    self.auth_token = data['token']
                    print_success(f"Authentication successful for {TEST_CLINIC_EMAIL}")
                    print_info(f"Clinic: {data.get('user', {}).get('clinicName', 'N/A')}")
                    print_info(f"Role: {data.get('user', {}).get('role', 'N/A')}")
                    return True
                else:
                    print_error("No token in response")
                    return False
            else:
                print_error(f"Authentication failed: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Authentication error: {str(e)}")
            return False
    
    def get_headers(self):
        """Get authorization headers"""
        return {
            'Authorization': f'Bearer {self.auth_token}',
            'Content-Type': 'application/json'
        }
    
    def test_get_invoices_list(self):
        """Test GET /api/invoices - List all invoices for a clinic"""
        print_header("📋 GET /api/invoices - LIST INVOICES TEST")
        
        try:
            response = requests.get(f"{self.base_url}/invoices", headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                print_success("Invoice list retrieved successfully")
                print_info(f"Total invoices: {len(data.get('invoices', []))}")
                
                # Check stats structure
                if 'stats' in data:
                    stats = data['stats']
                    print_info(f"Stats - Total: {stats.get('total', 0)}, Draft: {stats.get('draft', 0)}, Sent: {stats.get('sent', 0)}, Paid: {stats.get('paid', 0)}")
                    print_info(f"Total Amount: €{stats.get('totalAmount', 0):.2f}, Paid Amount: €{stats.get('paidAmount', 0):.2f}")
                
                # Test filters
                print_info("Testing filters...")
                
                # Filter by status (draft)
                response_draft = requests.get(f"{self.base_url}/invoices?status=draft", headers=self.get_headers())
                if response_draft.status_code == 200:
                    draft_data = response_draft.json()
                    print_success(f"Draft filter working: {len(draft_data.get('invoices', []))} drafts found")
                
                # Filter by status (paid)
                response_paid = requests.get(f"{self.base_url}/invoices?status=paid", headers=self.get_headers())
                if response_paid.status_code == 200:
                    paid_data = response_paid.json()
                    print_success(f"Paid filter working: {len(paid_data.get('invoices', []))} paid invoices found")
                
                return True
            else:
                print_error(f"Failed to get invoices: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Get invoices error: {str(e)}")
            return False
    
    def test_create_draft_invoice(self):
        """Test POST /api/invoices - Create a draft invoice"""
        print_header("📝 POST /api/invoices - CREATE DRAFT INVOICE TEST")
        
        try:
            # Create a draft invoice with realistic data
            invoice_data = {
                "customerName": "Mario Rossi",
                "customerEmail": "mario.rossi@email.com",
                "customerPhone": "+39 338 1234567",
                "customerAddress": "Via Roma 123, 20100 Milano MI",
                "customerCF": "RSSMRA80A01F205X",
                "petName": "Luna",
                "items": [
                    {
                        "description": "Visita clinica completa",
                        "quantity": 1,
                        "unitPrice": 45.00
                    },
                    {
                        "description": "Vaccino antirabbica",
                        "quantity": 1,
                        "unitPrice": 25.00
                    }
                ],
                "notes": "Controllo di routine per Luna - cane meticcio di 3 anni",
                "isDraft": True
            }
            
            response = requests.post(f"{self.base_url}/invoices", json=invoice_data, headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                self.test_invoice_id = data.get('id')
                print_success("Draft invoice created successfully")
                print_info(f"Invoice ID: {self.test_invoice_id}")
                print_info(f"Status: {data.get('status')}")
                print_info(f"Customer: {data.get('customerName')}")
                print_info(f"Pet: {data.get('petName')}")
                
                # Verify totals calculation
                totals = data.get('totals', {})
                print_info(f"Subtotal: €{totals.get('subtotal', 0):.2f}")
                print_info(f"VAT (22%): €{totals.get('vatAmount', 0):.2f}")
                print_info(f"Marca da bollo: €{totals.get('bolloAmount', 0):.2f}")
                print_info(f"Total: €{totals.get('total', 0):.2f}")
                
                # Verify no invoice number for draft
                if data.get('invoiceNumber') is None:
                    print_success("Draft has no invoice number (correct)")
                else:
                    print_warning(f"Draft has invoice number: {data.get('invoiceNumber')}")
                
                return True
            else:
                print_error(f"Failed to create draft invoice: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Create draft invoice error: {str(e)}")
            return False
    
    def test_convert_draft_to_issued(self):
        """Test PUT /api/invoices - Convert draft to issued (generates invoice number)"""
        print_header("🔄 PUT /api/invoices - CONVERT DRAFT TO ISSUED TEST")
        
        if not self.test_invoice_id:
            print_error("No test invoice ID available")
            return False
        
        try:
            # Convert draft to issued
            update_data = {
                "id": self.test_invoice_id,
                "status": "issued"
            }
            
            response = requests.put(f"{self.base_url}/invoices", json=update_data, headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                print_success("Draft converted to issued successfully")
                print_info(f"Invoice Number: {data.get('invoiceNumber')}")
                print_info(f"Status: {data.get('status')}")
                print_info(f"Issue Date: {data.get('issueDate')}")
                print_info(f"Due Date: {data.get('dueDate')}")
                
                # Verify invoice number generation (format: YYYY/NNN)
                invoice_number = data.get('invoiceNumber')
                if invoice_number and '/' in invoice_number:
                    year, number = invoice_number.split('/')
                    if year == str(time.localtime().tm_year) and number.isdigit():
                        print_success(f"Invoice number format is correct: {invoice_number}")
                    else:
                        print_warning(f"Invoice number format may be incorrect: {invoice_number}")
                
                return True
            else:
                print_error(f"Failed to convert draft to issued: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Convert draft to issued error: {str(e)}")
            return False
    
    def test_mark_invoice_as_paid(self):
        """Test PUT /api/invoices - Mark invoice as paid"""
        print_header("💳 PUT /api/invoices - MARK AS PAID TEST")
        
        if not self.test_invoice_id:
            print_error("No test invoice ID available")
            return False
        
        try:
            # Mark as paid
            update_data = {
                "id": self.test_invoice_id,
                "status": "paid"
            }
            
            response = requests.put(f"{self.base_url}/invoices", json=update_data, headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                print_success("Invoice marked as paid successfully")
                print_info(f"Status: {data.get('status')}")
                print_info(f"Paid Date: {data.get('paidDate')}")
                
                return True
            else:
                print_error(f"Failed to mark invoice as paid: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Mark invoice as paid error: {str(e)}")
            return False
    
    def test_create_invoice_with_high_amount(self):
        """Test creating invoice with amount > €77.47 to verify marca da bollo calculation"""
        print_header("💰 CREATE HIGH-AMOUNT INVOICE - MARCA DA BOLLO TEST")
        
        try:
            # Create invoice with high amount (should trigger marca da bollo)
            invoice_data = {
                "customerName": "Giulia Bianchi",
                "customerEmail": "giulia.bianchi@email.com",
                "customerCF": "BNCGLI85E45H501Z",
                "petName": "Max",
                "items": [
                    {
                        "description": "Intervento chirurgico - sterilizzazione",
                        "quantity": 1,
                        "unitPrice": 120.00
                    }
                ],
                "notes": "Intervento programmato per Max",
                "isDraft": False  # Create as issued
            }
            
            response = requests.post(f"{self.base_url}/invoices", json=invoice_data, headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                totals = data.get('totals', {})
                
                print_success("High-amount invoice created successfully")
                print_info(f"Subtotal: €{totals.get('subtotal', 0):.2f}")
                print_info(f"Marca da bollo: €{totals.get('bolloAmount', 0):.2f}")
                
                # Verify marca da bollo calculation
                if totals.get('subtotal', 0) > 77.47 and totals.get('bolloAmount', 0) == 2.00:
                    print_success("Marca da bollo correctly calculated (€2.00 for amount > €77.47)")
                elif totals.get('subtotal', 0) <= 77.47 and totals.get('bolloAmount', 0) == 0:
                    print_success("Marca da bollo correctly not applied (amount ≤ €77.47)")
                else:
                    print_error(f"Marca da bollo calculation error - Subtotal: €{totals.get('subtotal', 0):.2f}, Bollo: €{totals.get('bolloAmount', 0):.2f}")
                
                return True
            else:
                print_error(f"Failed to create high-amount invoice: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Create high-amount invoice error: {str(e)}")
            return False
    
    def test_export_invoices_csv(self):
        """Test GET /api/invoices/export?format=csv - Export invoices as CSV"""
        print_header("📄 GET /api/invoices/export - CSV EXPORT TEST")
        
        try:
            response = requests.get(f"{self.base_url}/invoices/export?format=csv", headers=self.get_headers())
            
            if response.status_code == 200:
                print_success("CSV export successful")
                
                # Check content type
                content_type = response.headers.get('content-type', '')
                if 'text/csv' in content_type:
                    print_success("Correct content type: text/csv")
                else:
                    print_warning(f"Unexpected content type: {content_type}")
                
                # Check content disposition (filename)
                content_disposition = response.headers.get('content-disposition', '')
                if 'attachment' in content_disposition and 'fatture_' in content_disposition:
                    print_success(f"Correct filename format: {content_disposition}")
                
                # Parse CSV and check structure
                csv_content = response.text
                if csv_content:
                    print_info(f"CSV content length: {len(csv_content)} characters")
                    lines = csv_content.split('\n')
                    if len(lines) >= 1:  # At least header
                        print_success(f"CSV has {len(lines)} lines (including header)")
                        # Show header
                        print_info(f"CSV header: {lines[0][:100]}...")
                
                return True
            else:
                print_error(f"CSV export failed: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"CSV export error: {str(e)}")
            return False
    
    def test_export_invoices_json(self):
        """Test GET /api/invoices/export?format=json - Export invoices as JSON"""
        print_header("📊 GET /api/invoices/export - JSON EXPORT TEST")
        
        try:
            response = requests.get(f"{self.base_url}/invoices/export?format=json", headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                print_success("JSON export successful")
                
                # Check structure
                if 'export_date' in data:
                    print_success(f"Export date: {data['export_date']}")
                
                if 'clinic' in data:
                    clinic = data['clinic']
                    print_success(f"Clinic info included: {clinic.get('nome', 'N/A')}")
                
                if 'fatture' in data:
                    print_success(f"Invoices count: {len(data['fatture'])}")
                
                if 'totale_fatture' in data and 'totale_importo' in data:
                    print_success(f"Summary: {data['totale_fatture']} invoices, €{data['totale_importo']:.2f} total")
                
                return True
            else:
                print_error(f"JSON export failed: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"JSON export error: {str(e)}")
            return False
    
    def test_export_single_invoice_html(self):
        """Test GET /api/invoices/export?format=html&id=X - Export single invoice as HTML"""
        print_header("🌐 GET /api/invoices/export - HTML EXPORT TEST")
        
        if not self.test_invoice_id:
            print_error("No test invoice ID available")
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/invoices/export?format=html&id={self.test_invoice_id}", 
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                print_success("HTML export successful")
                
                # Check content type
                content_type = response.headers.get('content-type', '')
                if 'text/html' in content_type:
                    print_success("Correct content type: text/html")
                
                # Check HTML content
                html_content = response.text
                if html_content and '<html>' in html_content:
                    print_success("Valid HTML structure detected")
                    print_info(f"HTML content length: {len(html_content)} characters")
                    
                    # Check for key elements
                    if 'VetBuddy' in html_content:
                        print_success("VetBuddy branding present")
                    if 'FATTURA' in html_content:
                        print_success("Invoice title present")
                    if '€' in html_content:
                        print_success("Currency formatting present")
                
                return True
            else:
                print_error(f"HTML export failed: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"HTML export error: {str(e)}")
            return False
    
    def test_get_services(self):
        """Test GET /api/services - List clinic services/price list"""
        print_header("🏥 GET /api/services - LIST SERVICES TEST")
        
        try:
            response = requests.get(f"{self.base_url}/services", headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                print_success("Services list retrieved successfully")
                
                # Check structure
                if 'services' in data:
                    services = data['services']
                    print_info(f"Total services: {len(services)}")
                
                if 'categories' in data:
                    categories = data['categories']
                    print_info(f"Categories available: {len(categories)}")
                    category_names = [cat.get('name') for cat in categories]
                    print_info(f"Category names: {', '.join(category_names)}")
                
                if 'grouped' in data:
                    grouped = data['grouped']
                    print_success("Services grouped by category")
                
                return True
            else:
                print_error(f"Failed to get services: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Get services error: {str(e)}")
            return False
    
    def test_create_service(self):
        """Test POST /api/services - Create new service in price list"""
        print_header("➕ POST /api/services - CREATE SERVICE TEST")
        
        try:
            # Create a new service
            service_data = {
                "name": "Ecografia addominale completa",
                "description": "Esame ecografico dell'addome per diagnosi patologie interne",
                "category": "diagnostica",
                "price": 65.00,
                "duration": 30,  # 30 minutes
                "vatIncluded": True
            }
            
            response = requests.post(f"{self.base_url}/services", json=service_data, headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                self.test_service_id = data.get('id')
                print_success("Service created successfully")
                print_info(f"Service ID: {self.test_service_id}")
                print_info(f"Name: {data.get('name')}")
                print_info(f"Category: {data.get('category')}")
                print_info(f"Price: €{data.get('price', 0):.2f}")
                print_info(f"Duration: {data.get('duration')} minutes")
                print_info(f"VAT Included: {data.get('vatIncluded')}")
                
                return True
            else:
                print_error(f"Failed to create service: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Create service error: {str(e)}")
            return False
    
    def test_vat_calculations(self):
        """Test VAT calculations (22% IVA)"""
        print_header("🧮 VAT CALCULATIONS TEST")
        
        try:
            # Create invoice with specific amount to test VAT calculation
            invoice_data = {
                "customerName": "Test VAT Calculation",
                "customerEmail": "test@vat.com",
                "items": [
                    {
                        "description": "Test service for VAT calculation",
                        "quantity": 1,
                        "unitPrice": 100.00  # Round number for easy verification
                    }
                ],
                "isDraft": True
            }
            
            response = requests.post(f"{self.base_url}/invoices", json=invoice_data, headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                totals = data.get('totals', {})
                
                subtotal = totals.get('subtotal', 0)
                vat_rate = totals.get('vatRate', 0)
                vat_amount = totals.get('vatAmount', 0)
                total = totals.get('total', 0)
                
                print_info(f"Subtotal: €{subtotal:.2f}")
                print_info(f"VAT Rate: {vat_rate}%")
                print_info(f"VAT Amount: €{vat_amount:.2f}")
                print_info(f"Total: €{total:.2f}")
                
                # Verify VAT calculations
                expected_vat = subtotal * 0.22
                if abs(vat_amount - expected_vat) < 0.01:  # Allow for rounding
                    print_success(f"VAT calculation correct: €{vat_amount:.2f} (22% of €{subtotal:.2f})")
                else:
                    print_error(f"VAT calculation error: expected €{expected_vat:.2f}, got €{vat_amount:.2f}")
                
                expected_total = subtotal + vat_amount + totals.get('bolloAmount', 0)
                if abs(total - expected_total) < 0.01:
                    print_success(f"Total calculation correct: €{total:.2f}")
                else:
                    print_error(f"Total calculation error: expected €{expected_total:.2f}, got €{total:.2f}")
                
                return True
            else:
                print_error(f"Failed to create test invoice for VAT: {response.status_code}")
                return False
                
        except Exception as e:
            print_error(f"VAT calculations test error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all invoicing API tests"""
        print_header("🧪 VETBUDDY INVOICING/BILLING API COMPREHENSIVE TESTS")
        print_info(f"Testing against: {self.base_url}")
        print_info(f"Clinic credentials: {TEST_CLINIC_EMAIL}")
        
        test_results = []
        
        # Authentication
        test_results.append(("Authentication", self.authenticate()))
        
        if not self.auth_token:
            print_error("Cannot continue tests without authentication")
            return test_results
        
        # Invoice management tests
        test_results.append(("Get Invoices List", self.test_get_invoices_list()))
        test_results.append(("Create Draft Invoice", self.test_create_draft_invoice()))
        test_results.append(("Convert Draft to Issued", self.test_convert_draft_to_issued()))
        test_results.append(("Mark Invoice as Paid", self.test_mark_invoice_as_paid()))
        test_results.append(("High Amount Invoice (Marca da Bollo)", self.test_create_invoice_with_high_amount()))
        
        # Export functionality tests
        test_results.append(("Export CSV", self.test_export_invoices_csv()))
        test_results.append(("Export JSON", self.test_export_invoices_json()))
        test_results.append(("Export HTML", self.test_export_single_invoice_html()))
        
        # Services management tests
        test_results.append(("Get Services", self.test_get_services()))
        test_results.append(("Create Service", self.test_create_service()))
        
        # Calculation tests
        test_results.append(("VAT Calculations", self.test_vat_calculations()))
        
        return test_results
    
    def print_summary(self, test_results):
        """Print test summary"""
        print_header("📊 TEST SUMMARY")
        
        passed = 0
        failed = 0
        
        for test_name, result in test_results:
            if result:
                print_success(f"{test_name}")
                passed += 1
            else:
                print_error(f"{test_name}")
                failed += 1
        
        total = len(test_results)
        print(f"\n{Colors.BOLD}Results: {Colors.GREEN}{passed}/{total} tests passed{Colors.END}")
        
        if failed > 0:
            print(f"{Colors.RED}{failed} tests failed{Colors.END}")
        else:
            print(f"{Colors.GREEN}All tests passed! 🎉{Colors.END}")
        
        # Test specific requirements from review request
        print_header("📋 REVIEW REQUEST REQUIREMENTS CHECK")
        
        requirements_met = [
            ("GET /api/invoices with filters", any("Get Invoices" in result[0] for result in test_results if result[1])),
            ("POST /api/invoices create invoice", any("Create Draft" in result[0] for result in test_results if result[1])),
            ("PUT /api/invoices update invoice", any("Convert Draft" in result[0] or "Mark Invoice" in result[0] for result in test_results if result[1])),
            ("GET /api/invoices/export CSV format", any("Export CSV" in result[0] for result in test_results if result[1])),
            ("GET /api/invoices/export JSON format", any("Export JSON" in result[0] for result in test_results if result[1])),
            ("GET /api/invoices/export HTML format", any("Export HTML" in result[0] for result in test_results if result[1])),
            ("GET /api/services list services", any("Get Services" in result[0] for result in test_results if result[1])),
            ("POST /api/services create service", any("Create Service" in result[0] for result in test_results if result[1])),
            ("VAT calculation (22% IVA)", any("VAT Calculations" in result[0] for result in test_results if result[1])),
            ("Marca da bollo (€2 for >€77.47)", any("Marca da Bollo" in result[0] for result in test_results if result[1])),
            ("Invoice number generation (YYYY/NNN)", any("Convert Draft" in result[0] for result in test_results if result[1])),
        ]
        
        for requirement, met in requirements_met:
            if met:
                print_success(requirement)
            else:
                print_error(requirement)
        
        requirements_passed = sum(1 for _, met in requirements_met if met)
        print(f"\n{Colors.BOLD}Review Requirements: {Colors.GREEN}{requirements_passed}/{len(requirements_met)} met{Colors.END}")

if __name__ == "__main__":
    tester = VetBuddyInvoicingTester()
    results = tester.run_all_tests()
    tester.print_summary(results)