'use client';

import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Activity, Archive, BookOpen, CheckCircle, Clock, Download, Eye, FileText, Info, MoreHorizontal, Plus, Receipt, RefreshCw, Scissors, Search, Settings, Stethoscope, Syringe, X, Send } from 'lucide-react';
import api from '@/app/lib/api';

function ClinicInvoicing({ user, owners = [], pets = [] }) {
  const [activeTab, setActiveTab] = useState('invoices'); // invoices, estimates, electronic, services, settings
  const [invoices, setInvoices] = useState([]);
  const [estimates, setEstimates] = useState([]); // Preventivi
  const [electronicInvoices, setElectronicInvoices] = useState([]); // Fatture Elettroniche
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showNewService, setShowNewService] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFEModal, setShowFEModal] = useState(false); // Modal Fattura Elettronica
  const [selectedInvoiceForFE, setSelectedInvoiceForFE] = useState(null);
  
  // New invoice form
  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCF: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    notes: '',
    petId: '',
    petName: ''
  });
  
  // New service form
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: 'visita',
    price: '',
    duration: ''
  });

  const serviceCategories = [
    { id: 'visita', name: 'Visite', icon: Stethoscope },
    { id: 'vaccino', name: 'Vaccinazioni', icon: Syringe },
    { id: 'chirurgia', name: 'Chirurgia', icon: Scissors },
    { id: 'diagnostica', name: 'Diagnostica', icon: Search },
    { id: 'laboratorio', name: 'Laboratorio', icon: Activity },
    { id: 'altro', name: 'Altro', icon: MoreHorizontal }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoiceData, serviceData] = await Promise.all([
        api.get('invoices'),
        api.get('services')
      ]);
      setInvoices(invoiceData?.invoices || []);
      setStats(invoiceData?.stats || {});
      setServices(serviceData?.services || []);
      
      // Demo data preventivi
      const demoEstimates = [
        { id: 'est1', number: 'PREV-2024-001', customerName: 'Maria Rossi', petName: 'Luna', total: 450, status: 'pending', items: [{ description: 'Sterilizzazione cagna', quantity: 1, unitPrice: 350 }, { description: 'Controllo post-operatorio', quantity: 1, unitPrice: 100 }], createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), validUntil: new Date(Date.now() + 25 * 86400000).toISOString(), approvalLink: 'https://vetbuddy.it/approve/est1' },
        { id: 'est2', number: 'PREV-2024-002', customerName: 'Paolo Bianchi', petName: 'Rex', total: 280, status: 'approved', items: [{ description: 'Pulizia dentale', quantity: 1, unitPrice: 250 }, { description: 'Anestesia', quantity: 1, unitPrice: 30 }], createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), validUntil: new Date(Date.now() + 20 * 86400000).toISOString(), approvedAt: new Date(Date.now() - 3 * 86400000).toISOString(), approvalLink: 'https://vetbuddy.it/approve/est2' },
        { id: 'est3', number: 'PREV-2024-003', customerName: 'Anna Verdi', petName: 'Micio', total: 650, status: 'pending', items: [{ description: 'Chirurgia rimozione calcoli', quantity: 1, unitPrice: 550 }, { description: 'Ricovero 2 giorni', quantity: 2, unitPrice: 50 }], createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), validUntil: new Date(Date.now() + 28 * 86400000).toISOString(), approvalLink: 'https://vetbuddy.it/approve/est3' },
        { id: 'est4', number: 'PREV-2024-004', customerName: 'Marco Neri', petName: 'Buddy', total: 120, status: 'rejected', items: [{ description: 'Visita ortopedica', quantity: 1, unitPrice: 80 }, { description: 'Radiografia zampa', quantity: 1, unitPrice: 40 }], createdAt: new Date(Date.now() - 15 * 86400000).toISOString(), validUntil: new Date(Date.now() + 15 * 86400000).toISOString(), rejectedAt: new Date(Date.now() - 13 * 86400000).toISOString(), approvalLink: 'https://vetbuddy.it/approve/est4' },
        { id: 'est5', number: 'PREV-2024-005', customerName: 'Sara Colombo', petName: 'Birba', total: 890, status: 'converted', items: [{ description: 'Intervento frattura femore', quantity: 1, unitPrice: 800 }, { description: 'Materiali chirurgici', quantity: 1, unitPrice: 90 }], createdAt: new Date(Date.now() - 20 * 86400000).toISOString(), validUntil: new Date(Date.now() - 10 * 86400000).toISOString(), approvedAt: new Date(Date.now() - 18 * 86400000).toISOString(), convertedToInvoice: 'FATT-2024-089', approvalLink: 'https://vetbuddy.it/approve/est5' },
      ];
      setEstimates(demoEstimates);
      
      // Demo data fatture elettroniche
      const demoElectronicInvoices = [
        { id: 'fe1', invoiceNumber: 'FATT-2024-089', customerName: 'Sara Colombo', fiscalData: { type: 'B2C', codiceFiscale: 'CLMSRA85M45F205X', pec: null, sdi: '0000000' }, amount: 890, status: 'sent', sentDate: new Date(Date.now() - 3 * 86400000).toISOString(), xmlGenerated: true, sdiStatus: 'accepted', sdiAcceptedDate: new Date(Date.now() - 2.5 * 86400000).toISOString() },
        { id: 'fe2', invoiceNumber: 'FATT-2024-088', customerName: 'Allevamento Rossi SRL', fiscalData: { type: 'B2B', piva: '12345678901', pec: 'allevamento@pec.it', sdi: null }, amount: 1250, status: 'sent', sentDate: new Date(Date.now() - 5 * 86400000).toISOString(), xmlGenerated: true, sdiStatus: 'accepted', sdiAcceptedDate: new Date(Date.now() - 4 * 86400000).toISOString() },
        { id: 'fe3', invoiceNumber: 'FATT-2024-087', customerName: 'Marco Neri', fiscalData: { type: 'B2C', codiceFiscale: 'NREMRC80R15L219K', pec: null, sdi: '0000000' }, amount: 120, status: 'draft', sentDate: null, xmlGenerated: false },
        { id: 'fe4', invoiceNumber: 'FATT-2024-086', customerName: 'Veterinaria Nord SPA', fiscalData: { type: 'B2B', piva: '09876543210', pec: 'amministrazione@vetnord.pec.it', sdi: 'ABCDEFG' }, amount: 2100, status: 'sent', sentDate: new Date(Date.now() - 8 * 86400000).toISOString(), xmlGenerated: true, sdiStatus: 'rejected', sdiRejectedDate: new Date(Date.now() - 7 * 86400000).toISOString(), sdiRejectedReason: 'Codice SDI errato' },
        { id: 'fe5', invoiceNumber: 'FATT-2024-085', customerName: 'Anna Verdi', fiscalData: { type: 'B2C', codiceFiscale: 'VRDNNA75D50H501Z', pec: 'anna.verdi@pec.it', sdi: null }, amount: 650, status: 'sent', sentDate: new Date(Date.now() - 10 * 86400000).toISOString(), xmlGenerated: true, sdiStatus: 'pending' },
      ];
      setElectronicInvoices(demoElectronicInvoices);
    } catch (error) {
      console.error('Error loading invoicing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (isDraft = false) => {
    if (!invoiceForm.customerName || invoiceForm.items.filter(i => i.description).length === 0) {
      alert('Inserisci il nome cliente e almeno una prestazione');
      return;
    }
    
    try {
      await api.post('invoices', { ...invoiceForm, isDraft });
      setShowNewInvoice(false);
      setInvoiceForm({
        customerId: '', customerName: '', customerEmail: '', customerPhone: '',
        customerAddress: '', customerCF: '', items: [{ description: '', quantity: 1, unitPrice: 0 }],
        notes: '', petId: '', petName: ''
      });
      loadData();
      alert(isDraft ? 'Bozza salvata!' : 'Fattura creata!');
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const handleCreateService = async () => {
    if (!serviceForm.name || !serviceForm.price) {
      alert('Nome e prezzo sono obbligatori');
      return;
    }
    try {
      await api.post('services', serviceForm);
      setShowNewService(false);
      setServiceForm({ name: '', description: '', category: 'visita', price: '', duration: '' });
      loadData();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    try {
      await api.put('invoices', { id: invoiceId, status: 'paid' });
      loadData();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const handleExport = async (format) => {
    try {
      window.open(`/api/invoices/export?format=${format}`, '_blank');
    } catch (error) {
      alert('Errore export: ' + error.message);
    }
  };

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const updateInvoiceItem = (index, field, value) => {
    const newItems = [...invoiceForm.items];
    newItems[index][field] = field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value;
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const removeInvoiceItem = (index) => {
    if (invoiceForm.items.length > 1) {
      setInvoiceForm({
        ...invoiceForm,
        items: invoiceForm.items.filter((_, i) => i !== index)
      });
    }
  };

  const selectService = (service) => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items.filter(i => i.description), { description: service.name, quantity: 1, unitPrice: service.price }]
    });
  };

  const selectOwner = (owner) => {
    setInvoiceForm({
      ...invoiceForm,
      customerId: owner.id,
      customerName: owner.name,
      customerEmail: owner.email,
      customerPhone: owner.phone,
      customerAddress: owner.address || '',
      customerCF: owner.cf || ''
    });
  };

  const calculateTotal = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vat = subtotal * 0.22;
    const bollo = subtotal > 77.47 ? 2 : 0;
    return { subtotal, vat, bollo, total: subtotal + vat + bollo };
  };

  const filteredInvoices = invoices.filter(inv => 
    !searchQuery || 
    inv.invoiceNumber?.includes(searchQuery) ||
    inv.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-coral-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="h-7 w-7 text-green-600" />
            Fatturazione
          </h1>
          <p className="text-gray-500">Gestisci fatture, listino prezzi ed export</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={async () => {
            try {
              const response = await fetch(`/api/invoices/download-all?clinicId=${user.id}&role=clinic`);
              if (!response.ok) throw new Error('Download fallito');
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `vetbuddy_Fatture_${new Date().toISOString().split('T')[0]}.zip`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              a.remove();
            } catch (error) {
              alert('Errore durante il download: ' + error.message);
            }
          }}>
            <Archive className="h-4 w-4 mr-2" />
            Scarica Tutto
          </Button>
          <Button onClick={() => setShowNewInvoice(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuova Fattura
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Totale Fatture</p>
            <p className="text-2xl font-bold">{stats.total || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-700">In Attesa</p>
            <p className="text-2xl font-bold text-amber-700">{(stats.sent || 0) + (stats.draft || 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm text-green-700">Pagate</p>
            <p className="text-2xl font-bold text-green-700">{stats.paid || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700">Fatturato Totale</p>
            <p className="text-2xl font-bold text-blue-700">€{(stats.totalAmount || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2 overflow-x-auto">
        <Button variant={activeTab === 'invoices' ? 'default' : 'ghost'} onClick={() => setActiveTab('invoices')}>
          <Receipt className="h-4 w-4 mr-2" />
          Fatture
        </Button>
        <Button variant={activeTab === 'electronic' ? 'default' : 'ghost'} onClick={() => setActiveTab('electronic')}>
          <FileText className="h-4 w-4 mr-2" />
          Fatture Elettroniche
          {electronicInvoices.filter(e => e.status === 'draft').length > 0 && (
            <Badge className="ml-2 bg-amber-500">{electronicInvoices.filter(e => e.status === 'draft').length}</Badge>
          )}
        </Button>
        <Button variant={activeTab === 'estimates' ? 'default' : 'ghost'} onClick={() => setActiveTab('estimates')}>
          <FileText className="h-4 w-4 mr-2" />
          Preventivi {estimates.filter(e => e.status === 'pending').length > 0 && <Badge className="ml-2 bg-amber-500">{estimates.filter(e => e.status === 'pending').length}</Badge>}
        </Button>
        <Button variant={activeTab === 'services' ? 'default' : 'ghost'} onClick={() => setActiveTab('services')}>
          <Stethoscope className="h-4 w-4 mr-2" />
          Listino Prezzi
        </Button>
        <Button variant={activeTab === 'settings' ? 'default' : 'ghost'} onClick={() => setActiveTab('settings')}>
          <Settings className="h-4 w-4 mr-2" />
          Impostazioni
        </Button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca fattura..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">Nessuna fattura</h3>
                <p className="text-gray-500">Crea la tua prima fattura</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredInvoices.map((inv) => (
                <Card key={inv.id} className={`hover:shadow-md transition ${inv.status === 'draft' ? 'border-dashed' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          inv.status === 'paid' ? 'bg-green-100 text-green-600' :
                          inv.status === 'issued' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {inv.status === 'paid' ? <CheckCircle className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{inv.invoiceNumber || 'BOZZA'}</span>
                            <Badge variant={inv.status === 'paid' ? 'default' : 'outline'} className={
                              inv.status === 'paid' ? 'bg-green-500' :
                              inv.status === 'issued' ? 'bg-blue-500 text-white' :
                              'bg-gray-200'
                            }>
                              {inv.status === 'paid' ? 'Pagata' : inv.status === 'issued' ? 'Emessa' : 'Bozza'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{inv.customerName}</p>
                          <p className="text-xs text-gray-400">
                            {inv.issueDate || 'Non emessa'} {inv.petName && `• 🐾 ${inv.petName}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">€{inv.totals?.total?.toFixed(2)}</p>
                          {inv.dueDate && inv.status !== 'paid' && (
                            <p className="text-xs text-gray-500">Scade: {inv.dueDate}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => window.open(`/api/invoices/export?format=html&id=${inv.id}`, '_blank')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {inv.status !== 'paid' && (
                            <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleMarkPaid(inv.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Estimates Tab */}
      {activeTab === 'estimates' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Preventivi Approvabili Online</h3>
            <Button className="bg-purple-500 hover:bg-purple-600" onClick={() => alert('Crea nuovo preventivo (usa form fattura)')}>
              <Plus className="h-4 w-4 mr-2" /> Nuovo Preventivo
            </Button>
          </div>
          
          {/* Stats preventivi */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-blue-700">{estimates.filter(e => e.status === 'pending').length}</p>
                <p className="text-xs text-blue-600">In attesa</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-green-700">{estimates.filter(e => e.status === 'approved').length}</p>
                <p className="text-xs text-green-600">Approvati</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-red-700">{estimates.filter(e => e.status === 'rejected').length}</p>
                <p className="text-xs text-red-600">Rifiutati</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-purple-700">{estimates.filter(e => e.status === 'converted').length}</p>
                <p className="text-xs text-purple-600">Fatturati</p>
              </CardContent>
            </Card>
          </div>

          {/* Lista preventivi */}
          <div className="space-y-3">
            {estimates.map(est => {
              const statusMap = {
                pending: { label: 'In attesa approvazione', cls: 'bg-amber-100 text-amber-700', icon: Clock },
                approved: { label: 'Approvato', cls: 'bg-green-100 text-green-700', icon: CheckCircle },
                rejected: { label: 'Rifiutato', cls: 'bg-red-100 text-red-700', icon: X },
                converted: { label: 'Convertito in fattura', cls: 'bg-purple-100 text-purple-700', icon: Receipt },
              };
              const status = statusMap[est.status];
              return (
                <Card key={est.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{est.number}</h4>
                          <Badge className={status.cls}>
                            <status.icon className="h-3 w-3 mr-1" /> {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{est.customerName} • {est.petName}</p>
                        <p className="text-xs text-gray-500">Creato: {new Date(est.createdAt).toLocaleDateString('it-IT')} • Valido fino: {new Date(est.validUntil).toLocaleDateString('it-IT')}</p>
                        <div className="mt-2">
                          {est.items.map((item, i) => (
                            <p key={i} className="text-xs text-gray-600">• {item.description} - €{item.unitPrice}</p>
                          ))}
                        </div>
                        {est.status === 'pending' && (
                          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                            <strong>Link approvazione:</strong> <a href={est.approvalLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{est.approvalLink}</a>
                          </div>
                        )}
                        {est.status === 'approved' && (
                          <p className="text-xs text-green-600 mt-2">✓ Approvato il {new Date(est.approvedAt).toLocaleDateString('it-IT')}</p>
                        )}
                        {est.status === 'converted' && (
                          <p className="text-xs text-purple-600 mt-2">✓ Convertito in {est.convertedToInvoice}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800">€{est.total}</p>
                        <div className="flex gap-2 mt-2">
                          {est.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => alert('Invia promemoria via email (Demo)')}>
                                <Send className="h-3 w-3" />
                              </Button>
                              <Button size="sm" className="bg-green-500 text-white" onClick={() => alert('Approva manualmente (Demo)')}>
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {est.status === 'approved' && (
                            <Button size="sm" className="bg-purple-500 text-white" onClick={() => alert('Converti in Fattura (Demo)')}>
                              <Receipt className="h-3 w-3 mr-1" /> Fattura
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => alert('Download PDF preventivo (Demo)')}>
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <Info className="h-4 w-4 inline mr-1" />
              <strong>Preventivi Online:</strong> Il proprietario riceve un link sicuro per approvare o rifiutare il preventivo con firma digitale. 
              Dopo approvazione, puoi convertirlo automaticamente in fattura.
            </p>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowNewService(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Prestazione
            </Button>
          </div>

          {services.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Stethoscope className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">Listino vuoto</h3>
                <p className="text-gray-500">Aggiungi le tue prestazioni con i prezzi</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const cat = serviceCategories.find(c => c.id === service.category);
                const Icon = cat?.icon || Stethoscope;
                return (
                  <Card key={service.id} className="hover:shadow-md transition">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-coral-100 flex items-center justify-center text-coral-600">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-gray-500">{service.description || cat?.name}</p>
                            {service.duration && (
                              <p className="text-xs text-gray-400 mt-1">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {service.duration} min
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-xl font-bold text-green-600">€{service.price?.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          {/* Export e Download */}
          <Card className="border-green-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Download className="h-5 w-5 text-green-600" />
                Esporta le Tue Fatture
              </h3>
              <p className="text-gray-600 mb-4">
                Scarica tutte le fatture in un formato compatibile con il tuo software di contabilità.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" className="flex-col h-auto py-4" onClick={() => handleExport('csv')}>
                  <FileText className="h-6 w-6 mb-2 text-green-600" />
                  <span className="font-semibold">CSV</span>
                  <span className="text-xs text-gray-500">Per Excel</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-4" onClick={() => handleExport('html')}>
                  <Receipt className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="font-semibold">PDF/HTML</span>
                  <span className="text-xs text-gray-500">Stampabile</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-4" onClick={() => handleExport('json')}>
                  <Download className="h-6 w-6 mb-2 text-purple-600" />
                  <span className="font-semibold">JSON</span>
                  <span className="text-xs text-gray-500">Per API</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guida Integrazione Software Esterni */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Guida: Integra con il Tuo Software di Fatturazione
              </h3>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="fattureincloud">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">FiC</div>
                      Come importare in Fatture in Cloud
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-gray-600 pl-10">
                      <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Esporta da vetbuddy</strong> — Clicca "Export CSV" qui sopra</li>
                        <li><strong>Accedi a Fatture in Cloud</strong> — Vai su fattureincloud.it</li>
                        <li><strong>Vai su Documenti → Importa</strong> — Seleziona "Importa da file CSV"</li>
                        <li><strong>Carica il file</strong> — Seleziona il CSV scaricato</li>
                        <li><strong>Mappa i campi</strong> — Associa le colonne (Cliente, Importo, ecc.)</li>
                        <li><strong>Conferma e Invia</strong> — Fatture in Cloud invierà al SdI</li>
                      </ol>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-700 text-xs">
                          💡 <strong>Suggerimento:</strong> Salva la mappatura dei campi per velocizzare le importazioni future.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="aruba">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">A</div>
                      Come importare in Aruba
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-gray-600 pl-10">
                      <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Esporta da vetbuddy</strong> — Scarica il file CSV</li>
                        <li><strong>Accedi ad Aruba Fatturazione</strong> — fattura.aruba.it</li>
                        <li><strong>Crea nuova fattura manualmente</strong> — Aruba non supporta import CSV diretto</li>
                        <li><strong>Copia i dati dal CSV</strong> — Usa Excel per visualizzare i dati</li>
                        <li><strong>Inserisci cliente e prestazioni</strong> — Compila i campi in Aruba</li>
                        <li><strong>Invia al SdI</strong> — Aruba gestisce l'invio</li>
                      </ol>
                      <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                        <p className="text-orange-700 text-xs">
                          ⚠️ <strong>Nota:</strong> Aruba richiede inserimento manuale. Per volumi alti, considera Fatture in Cloud o TeamSystem.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="teamsystem">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">TS</div>
                      Come importare in TeamSystem
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-gray-600 pl-10">
                      <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Esporta da vetbuddy</strong> — Scarica il file CSV o JSON</li>
                        <li><strong>Accedi a TeamSystem</strong> — Usa il modulo Fatturazione Elettronica</li>
                        <li><strong>Vai su Importazioni</strong> — Sezione "Import documenti"</li>
                        <li><strong>Seleziona formato CSV</strong> — Configura il tracciato di import</li>
                        <li><strong>Carica e verifica</strong> — TeamSystem mostra anteprima</li>
                        <li><strong>Conferma l'invio</strong> — Le fatture vengono inviate al SdI</li>
                      </ol>
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-green-700 text-xs">
                          💡 <strong>Suggerimento:</strong> TeamSystem supporta anche import JSON per automazioni avanzate.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="excel">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">XL</div>
                      Come usare con Excel / il tuo commercialista
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-gray-600 pl-10">
                      <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Esporta da vetbuddy</strong> — Scarica il file CSV</li>
                        <li><strong>Apri in Excel</strong> — Il CSV è già formattato</li>
                        <li><strong>Invia al commercialista</strong> — Allega il file Excel</li>
                        <li><strong>Il commercialista emette le fatture</strong> — Usando i dati forniti</li>
                      </ol>
                      <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                        <p className="text-emerald-700 text-xs">
                          📧 <strong>Ideale per:</strong> Chi ha un commercialista che gestisce la fatturazione elettronica.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Spiegazione vetbuddy vs Software */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                vetbuddy e la Fatturazione Elettronica
              </h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">📋 Cosa fa vetbuddy</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Gestisce il <strong>listino prezzi</strong> delle prestazioni</li>
                    <li>Crea <strong>pre-fatture</strong> con dati cliente e prestazioni</li>
                    <li>Calcola automaticamente <strong>IVA e marca da bollo</strong></li>
                    <li>Esporta in <strong>CSV, PDF e JSON</strong> per il tuo software</li>
                    <li>Tiene traccia di <strong>pagamenti e statistiche</strong></li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Cosa fa il tuo Software di Fatturazione</h4>
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    <li>Genera il <strong>file XML</strong> conforme alle norme</li>
                    <li>Appone la <strong>firma digitale</strong></li>
                    <li>Invia al <strong>Sistema di Interscambio (SdI)</strong></li>
                    <li>Riceve le <strong>notifiche di consegna</strong></li>
                    <li>Gestisce la <strong>conservazione sostitutiva</strong> a norma</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2">⚠️ Perché due sistemi?</h4>
                  <p className="text-amber-700">
                    La fatturazione elettronica in Italia richiede certificazioni specifiche e integrazione con l'Agenzia delle Entrate. 
                    vetbuddy si occupa della <strong>gestione veterinaria</strong> e prepara i dati; 
                    il software di fatturazione (Fatture in Cloud, TeamSystem, Aruba, ecc.) si occupa della <strong>parte fiscale</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dati Fiscali */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Dati Fiscali Clinica</h3>
              <p className="text-sm text-gray-500 mb-4">
                Questi dati appariranno sulle fatture esportate.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Partita IVA</Label>
                  <Input placeholder="IT12345678901" defaultValue={user?.piva || ''} />
                </div>
                <div>
                  <Label>Codice SDI</Label>
                  <Input placeholder="XXXXXXX" defaultValue={user?.sdi || ''} />
                </div>
                <div className="md:col-span-2">
                  <Label>Indirizzo Sede Legale</Label>
                  <Input placeholder="Via Roma 123, 20100 Milano" defaultValue={user?.address || ''} />
                </div>
                <div>
                  <Label>PEC</Label>
                  <Input placeholder="clinica@pec.it" defaultValue={user?.pec || ''} />
                </div>
                <div>
                  <Label>Telefono</Label>
                  <Input placeholder="+39 02 1234567" defaultValue={user?.phone || ''} />
                </div>
              </div>
              <Button className="mt-4 bg-green-600 hover:bg-green-700">Salva Dati Fiscali</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Invoice Dialog */}
      <Dialog open={showNewInvoice} onOpenChange={setShowNewInvoice}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Nuova Fattura</DialogTitle>
          <DialogDescription>Crea una nuova fattura o bozza</DialogDescription>
          
          <div className="space-y-6 mt-4">
            {/* Customer Selection */}
            <div>
              <Label className="text-sm font-semibold">Cliente</Label>
              <div className="grid gap-2 mt-2">
                {invoiceForm.customerId ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{invoiceForm.customerName}</p>
                      <p className="text-sm text-gray-500">{invoiceForm.customerEmail}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setInvoiceForm({ ...invoiceForm, customerId: '', customerName: '', customerEmail: '', customerPhone: '', customerAddress: '', customerCF: '' })}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
                      {owners.slice(0, 10).map((owner) => (
                        <Badge key={owner.id} variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => selectOwner(owner)}>
                          {owner.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <Input placeholder="Nome cliente *" value={invoiceForm.customerName} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })} />
                      <Input placeholder="Codice Fiscale" value={invoiceForm.customerCF} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerCF: e.target.value })} />
                      <Input placeholder="Email" value={invoiceForm.customerEmail} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })} />
                      <Input placeholder="Telefono" value={invoiceForm.customerPhone} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerPhone: e.target.value })} />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick add from services */}
            {services.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Aggiungi dal Listino</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {services.slice(0, 8).map((service) => (
                    <Badge key={service.id} variant="outline" className="cursor-pointer hover:bg-coral-50 hover:border-coral-300" onClick={() => selectService(service)}>
                      {service.name} - €{service.price}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Invoice Items */}
            <div>
              <Label className="text-sm font-semibold">Prestazioni</Label>
              <div className="space-y-2 mt-2">
                {invoiceForm.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input className="flex-1" placeholder="Descrizione *" value={item.description} onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)} />
                    <Input className="w-20" type="number" min="1" placeholder="Qtà" value={item.quantity} onChange={(e) => updateInvoiceItem(index, 'quantity', e.target.value)} />
                    <Input className="w-28" type="number" step="0.01" placeholder="€ Prezzo" value={item.unitPrice || ''} onChange={(e) => updateInvoiceItem(index, 'unitPrice', e.target.value)} />
                    <Button variant="ghost" size="sm" onClick={() => removeInvoiceItem(index)} disabled={invoiceForm.items.length === 1}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addInvoiceItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Aggiungi Riga
                </Button>
              </div>
            </div>

            {/* Totals Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Imponibile:</span>
                  <span>€ {calculateTotal().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (22%):</span>
                  <span>€ {calculateTotal().vat.toFixed(2)}</span>
                </div>
                {calculateTotal().bollo > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Marca da bollo:</span>
                    <span>€ {calculateTotal().bollo.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>TOTALE:</span>
                  <span>€ {calculateTotal().total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Note</Label>
              <Textarea placeholder="Note aggiuntive..." value={invoiceForm.notes} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleCreateInvoice(true)}>
                Salva come Bozza
              </Button>
              <Button onClick={() => handleCreateInvoice(false)} className="bg-green-600 hover:bg-green-700">
                <Receipt className="h-4 w-4 mr-2" />
                Emetti Fattura
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Service Dialog */}
      <Dialog open={showNewService} onOpenChange={setShowNewService}>
        <DialogContent>
          <DialogTitle>Nuova Prestazione</DialogTitle>
          <DialogDescription>Aggiungi una prestazione al listino</DialogDescription>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome Prestazione *</Label>
              <Input placeholder="es. Visita di controllo" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Categoria</Label>
              <select className="w-full p-2 border rounded-md" value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}>
                {serviceCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prezzo (€) *</Label>
                <Input type="number" step="0.01" placeholder="50.00" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} />
              </div>
              <div>
                <Label>Durata (min)</Label>
                <Input type="number" placeholder="30" value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Descrizione</Label>
              <Textarea placeholder="Descrizione opzionale..." value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewService(false)}>Annulla</Button>
              <Button onClick={handleCreateService}>Salva</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ==================== CLINIC ARCHIVE ====================

export default ClinicInvoicing;
