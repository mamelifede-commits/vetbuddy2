'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2, CheckCircle, CheckCircle2, Clock, Copy, Euro, Eye, FileCheck, FileText, FlaskConical,
  Info, Key, Link2, Loader2, LogOut, Menu, MousePointerClick, Package, PawPrint, Phone, Plus,
  RefreshCw, Settings, Shield, Trash2, Truck, Upload, X, XCircle, MapPin, Edit, Save, Zap,
  Code, Activity, ToggleLeft, ToggleRight

} from 'lucide-react';
import api from '@/app/lib/api';
import dynamic from 'next/dynamic';
const SubscriptionPlans = dynamic(() => import('@/app/components/shared/SubscriptionPlans'), { ssr: false });

const EXAM_TYPES_LIST = [
  { id: 'sangue', label: '🩸 Sangue' },
  { id: 'urine', label: '🧪 Urine' },
  { id: 'feci', label: '💩 Feci' },
  { id: 'biopsia', label: '🔬 Biopsia' },
  { id: 'citologia', label: '🔬 Citologia' },
  { id: 'istologia', label: '🧫 Istologia' },
  { id: 'genetico', label: '🧬 Genetico' },
  { id: 'allergologia', label: '🤧 Allergologia' },
  { id: 'microbiologia', label: '🦠 Microbiologia' },
  { id: 'parassitologia', label: '🪱 Parassitologia' },
  { id: 'altro', label: '📋 Altro' }
];

function LabDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('requests');
  const [labRequests, setLabRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, total: 0 });
  const [filterStatus, setFilterStatus] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ reportNotes: '', visibleToOwner: true, notifyOwner: true });
  const [uploadFile, setUploadFile] = useState(null);
  // Connections
  const [connections, setConnections] = useState([]);
  const [loadingConns, setLoadingConns] = useState(false);
  // Price List
  const [priceList, setPriceList] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);
  const [newPriceItem, setNewPriceItem] = useState({ examType: '', title: '', priceFrom: '', priceTo: '', priceOnRequest: false, averageDeliveryTime: '' });
  // Billing
  const [billing, setBilling] = useState(null);
  // Integration API
  const [integrationData, setIntegrationData] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [loadingIntegration, setLoadingIntegration] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const LAB_STATUSES = [
    { id: 'pending', name: 'In Attesa', color: 'yellow', icon: Clock },
    { id: 'received', name: 'Ricevuta', color: 'blue', icon: CheckCircle },
    { id: 'sample_waiting', name: 'Campione in Attesa', color: 'orange', icon: Package },
    { id: 'sample_received', name: 'Campione Ricevuto', color: 'indigo', icon: Package },
    { id: 'in_progress', name: 'In Analisi', color: 'purple', icon: Loader2 },
    { id: 'report_ready', name: 'Referto Pronto', color: 'green', icon: FileCheck },
    { id: 'completed', name: 'Completata', color: 'emerald', icon: CheckCircle2 },
    { id: 'cancelled', name: 'Annullata', color: 'red', icon: XCircle }
  ];

  useEffect(() => { loadRequests(); loadBilling(); }, []);

  useEffect(() => {
    if (activeTab === 'connections') loadConnections();
    if (activeTab === 'prices') loadPriceList();
    if (activeTab === 'integration') loadIntegration();
  }, [activeTab]);

  const loadIntegration = async () => {
    setLoadingIntegration(true);
    try {
      const [data, logs] = await Promise.all([
        api.get('lab/integration'),
        api.get('lab/webhook-logs').catch(() => [])
      ]);
      setIntegrationData(data);
      setWebhookLogs(logs || []);
    } catch (e) { console.error('Error loading integration:', e); }
    setLoadingIntegration(false);
  };

  const handleGenerateApiKey = async () => {
    if (integrationData?.hasApiKey && !confirm('Attenzione: rigenerare la API Key invaliderà quella attuale. I sistemi esterni dovranno essere aggiornati. Procedere?')) return;
    setGeneratingKey(true);
    try {
      const result = await api.post('lab/generate-api-key', {});
      setShowApiKey(result.apiKey);
      await loadIntegration();
    } catch (e) { alert('Errore generazione API Key: ' + e.message); }
    setGeneratingKey(false);
  };

  const handleToggleIntegration = async () => {
    try {
      await api.post('lab/integration/toggle', {});
      await loadIntegration();
    } catch (e) { alert('Errore: ' + e.message); }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.get('lab-requests');
      setLabRequests(data || []);
      const pending = data.filter(r => r.status === 'pending' || r.status === 'received').length;
      const inProgress = data.filter(r => ['sample_waiting', 'sample_received', 'in_progress'].includes(r.status)).length;
      const completed = data.filter(r => ['report_ready', 'completed'].includes(r.status)).length;
      setStats({ pending, inProgress, completed, total: data.length });
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    setLoadingConns(true);
    try {
      const data = await api.get('lab/connections');
      setConnections(data || []);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoadingConns(false);
    }
  };

  const loadPriceList = async () => {
    setLoadingPrices(true);
    try {
      const data = await api.get('lab/my-price-list');
      setPriceList(data || []);
    } catch (error) {
      console.error('Error loading price list:', error);
    } finally {
      setLoadingPrices(false);
    }
  };

  const loadBilling = async () => {
    try {
      const data = await api.get('lab/billing');
      setBilling(data);
    } catch (error) {
      console.error('Error loading billing:', error);
    }
  };

  const respondToConnection = async (connectionId, action) => {
    try {
      await api.post('lab/connection-response', { connectionId, action });
      alert(action === 'accept' ? '✅ Collegamento accettato!' : '❌ Collegamento rifiutato');
      await loadConnections();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const addPriceItem = () => {
    if (!newPriceItem.examType) { alert('Seleziona un tipo esame'); return; }
    setPriceList([...priceList, {
      id: 'new_' + Date.now(),
      examType: newPriceItem.examType,
      title: newPriceItem.title || '',
      priceFrom: parseFloat(newPriceItem.priceFrom) || 0,
      priceTo: newPriceItem.priceTo ? parseFloat(newPriceItem.priceTo) : null,
      priceOnRequest: newPriceItem.priceOnRequest,
      averageDeliveryTime: newPriceItem.averageDeliveryTime || ''
    }]);
    setNewPriceItem({ examType: '', title: '', priceFrom: '', priceTo: '', priceOnRequest: false, averageDeliveryTime: '' });
  };

  const removePriceItem = (index) => {
    setPriceList(priceList.filter((_, i) => i !== index));
  };

  const savePriceList = async () => {
    setSavingPrices(true);
    try {
      await api.post('lab/price-list', {
        prices: priceList.map(p => ({
          examType: p.examType,
          title: p.title || '',
          description: p.description || '',
          priceFrom: p.priceFrom || 0,
          priceTo: p.priceTo || null,
          priceOnRequest: p.priceOnRequest || false,
          averageDeliveryTime: p.averageDeliveryTime || ''
        }))
      });
      alert('✅ Listino prezzi salvato!');
      await loadPriceList();
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    } finally {
      setSavingPrices(false);
    }
  };

  const updateStatus = async (requestId, newStatus, note = '') => {
    try {
      await api.post('lab-requests/update-status', { requestId, status: newStatus, note });
      await loadRequests();
      if (selectedRequest?.id === requestId) {
        const updated = await api.get(`lab-requests/${requestId}`);
        setSelectedRequest(updated);
      }
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadFile({ name: file.name, content: e.target.result.split(',')[1] });
    };
    reader.readAsDataURL(file);
  };

  const submitReport = async () => {
    if (!uploadFile || !selectedRequest) return;
    try {
      await api.post('lab-reports', {
        labRequestId: selectedRequest.id,
        fileName: uploadFile.name,
        fileContent: uploadFile.content,
        reportNotes: uploadData.reportNotes,
        visibleToOwner: uploadData.visibleToOwner,
        notifyOwner: uploadData.notifyOwner
      });
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadData({ reportNotes: '', visibleToOwner: true, notifyOwner: true });
      await loadRequests();
      const updated = await api.get(`lab-requests/${selectedRequest.id}`);
      setSelectedRequest(updated);
      alert('✅ Referto caricato con successo!');
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = LAB_STATUSES.find(s => s.id === status) || { name: status, color: 'gray' };
    const colorMap = {
      yellow: 'bg-yellow-100 text-yellow-800', blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800', indigo: 'bg-indigo-100 text-indigo-800',
      purple: 'bg-purple-100 text-purple-800', green: 'bg-green-100 text-green-800',
      emerald: 'bg-emerald-100 text-emerald-800', red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[statusInfo.color]}`}>{statusInfo.name}</span>;
  };

  const filteredRequests = filterStatus === 'all' ? labRequests : labRequests.filter(r => r.status === filterStatus);
  const pendingConns = connections.filter(c => c.status === 'pending');
  const activeConns = connections.filter(c => c.status === 'active');

  const menuItems = [
    { id: 'requests', label: 'Richieste', icon: FileText, badge: stats.pending },
    { id: 'connections', label: 'Cliniche', icon: Link2, badge: pendingConns.length },
    { id: 'prices', label: 'Listino Prezzi', icon: Euro },
    { id: 'integration', label: 'Integrazione API', icon: Zap },
    { id: 'settings', label: 'Profilo', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-indigo-50">
              <Menu className="h-6 w-6 text-indigo-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl relative">
                <FlaskConical className="h-6 w-6 text-white" />
                {(stats.pending + pendingConns.length) > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {stats.pending + pendingConns.length}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{user.labName || 'Laboratorio'}</h1>
                <p className="text-xs text-indigo-600">Dashboard Laboratorio</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 mr-4">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === item.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>
            <button onClick={loadRequests} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600">
              <RefreshCw className="h-5 w-5" />
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Esci</span>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t p-3 shadow-lg">
            <nav className="space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition ${
                    activeTab === item.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3"><item.icon className="h-5 w-5" />{item.label}</div>
                  {item.badge > 0 && <Badge className="bg-red-500 text-white">{item.badge}</Badge>}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Billing Banner */}
        {billing && (
          <div className={`mb-6 rounded-xl p-4 border ${
            billing.billingActive 
              ? 'bg-red-50 border-red-200' 
              : billing.daysRemaining <= 30 || billing.requestsRemaining <= 10
                ? 'bg-amber-50 border-amber-200'
                : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  billing.billingActive ? 'bg-red-100' : billing.daysRemaining <= 30 || billing.requestsRemaining <= 10 ? 'bg-amber-100' : 'bg-green-100'
                }`}>
                  <Euro className={`h-5 w-5 ${
                    billing.billingActive ? 'text-red-600' : billing.daysRemaining <= 30 || billing.requestsRemaining <= 10 ? 'text-amber-600' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Piano {billing.plan === 'partner_free' ? 'Lab Partner (Trial)' : 'Lab Partner'}
                  </p>
                  {billing.billingActive ? (
                    <p className="text-xs text-red-700">
                      ⚠️ Periodo di prova terminato. {billing.trialExpired ? 'I 6 mesi gratuiti sono scaduti.' : ''} {billing.requestsExhausted ? `Hai raggiunto le ${billing.maxFreeRequests} richieste gratuite.` : ''}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-600">
                      📅 {billing.daysRemaining} giorni rimanenti • 📊 {billing.requestsRemaining}/{billing.maxFreeRequests} richieste disponibili
                    </p>
                  )}
                </div>
              </div>
              {billing.billingActive ? (
                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-xs">
                  Passa a Lab Partner €29/mese →
                </Button>
              ) : (billing.daysRemaining <= 30 || billing.requestsRemaining <= 10) ? (
                <Badge className="bg-amber-200 text-amber-800 text-xs">Trial in scadenza</Badge>
              ) : null}
            </div>
          </div>
        )}
        {/* Onboarding Banner - Price List */}
        {priceList.length === 0 && !loadingPrices && activeTab !== 'prices' && (
          <div className="mb-6 rounded-xl p-4 border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('prices')}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-violet-100 shrink-0">
                <Euro className="h-5 w-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">📋 Completa il tuo profilo: aggiungi il listino prezzi!</p>
                <p className="text-xs text-gray-600">Per essere visibile alle cliniche nel marketplace, inserisci i tuoi esami con prezzi indicativi (IVA esclusa).</p>
              </div>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white shrink-0">Aggiungi Listino →</Button>
            </div>
          </div>
        )}
        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="h-5 w-5 text-yellow-600" /></div>
                  <div><p className="text-2xl font-bold text-gray-900">{stats.pending}</p><p className="text-xs text-gray-500">In Attesa</p></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg"><Loader2 className="h-5 w-5 text-purple-600" /></div>
                  <div><p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p><p className="text-xs text-gray-500">In Corso</p></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
                  <div><p className="text-2xl font-bold text-gray-900">{stats.completed}</p><p className="text-xs text-gray-500">Completate</p></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg"><FileText className="h-5 w-5 text-indigo-600" /></div>
                  <div><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-xs text-gray-500">Totale</p></div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-indigo-500" />Richieste Analisi
                  </h2>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                    <option value="all">Tutte</option>
                    {LAB_STATUSES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                {loading ? (
                  <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" /></div>
                ) : filteredRequests.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FlaskConical className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>Nessuna richiesta trovata</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                    {filteredRequests.map(req => (
                      <div key={req.id} onClick={() => setSelectedRequest(req)} className={`p-4 hover:bg-indigo-50/50 cursor-pointer transition-colors ${selectedRequest?.id === req.id ? 'bg-indigo-50' : ''}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 truncate">{req.examName || req.examType}</span>
                              {req.priority === 'urgent' && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">URGENTE</span>}
                            </div>
                            <p className="text-sm text-gray-500 flex items-center gap-2"><PawPrint className="h-3.5 w-3.5" />{req.petName} • {req.clinicName}</p>
                            <p className="text-xs text-gray-400 mt-1">Codice: {req.sampleCode} • {new Date(req.createdAt).toLocaleDateString('it-IT')}</p>
                          </div>
                          <div className="flex-shrink-0">{getStatusBadge(req.status)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Request Detail */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {selectedRequest ? (
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                      <h3 className="font-semibold text-gray-900">{selectedRequest.examName || selectedRequest.examType}</h3>
                      <p className="text-sm text-gray-600">{selectedRequest.petName} ({selectedRequest.petSpecies})</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div><label className="text-xs font-medium text-gray-500 uppercase">Stato</label><div className="mt-1">{getStatusBadge(selectedRequest.status)}</div></div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><label className="text-xs text-gray-500">Clinica</label><p className="font-medium">{selectedRequest.clinicName}</p></div>
                        <div><label className="text-xs text-gray-500">Codice Campione</label><p className="font-mono font-medium">{selectedRequest.sampleCode}</p></div>
                        <div><label className="text-xs text-gray-500">Priorità</label><p className="font-medium capitalize">{selectedRequest.priority === 'urgent' ? '🔴 Urgente' : selectedRequest.priority === 'low' ? '🟢 Bassa' : '🟡 Normale'}</p></div>
                        <div><label className="text-xs text-gray-500">Data Richiesta</label><p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleDateString('it-IT')}</p></div>
                      </div>
                      {selectedRequest.clinicalNotes && (
                        <div><label className="text-xs font-medium text-gray-500 uppercase">Note Cliniche</label><p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRequest.clinicalNotes}</p></div>
                      )}
                      <div className="border-t pt-4">
                        <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Aggiorna Stato</label>
                        <div className="grid grid-cols-2 gap-2">
                          {LAB_STATUSES.filter(s => !['pending', 'cancelled'].includes(s.id)).map(status => (
                            <button key={status.id} onClick={() => updateStatus(selectedRequest.id, status.id)} disabled={selectedRequest.status === status.id}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${selectedRequest.status === status.id ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}>
                              {status.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => setShowUploadModal(true)} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2">
                        <Upload className="h-4 w-4" />Carica Referto PDF
                      </button>
                      {selectedRequest.reports && selectedRequest.reports.length > 0 && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Referti Caricati</label>
                          <div className="space-y-2">
                            {selectedRequest.reports.map(report => (
                              <div key={report.id} className="p-3 bg-green-50 rounded-lg flex items-center gap-3">
                                <FileCheck className="h-5 w-5 text-green-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{report.fileName}</p>
                                  <p className="text-xs text-gray-500">{new Date(report.uploadedAt).toLocaleString('it-IT')}</p>
                                </div>
                                {report.visibleToOwner && <Eye className="h-4 w-4 text-green-500" title="Visibile al proprietario" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 text-center text-gray-500">
                    <div><MousePointerClick className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>Seleziona una richiesta</p></div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* CONNECTIONS TAB */}
        {activeTab === 'connections' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Link2 className="h-6 w-6 text-indigo-500" />Cliniche Collegate</h2>
                <p className="text-gray-500 text-sm">Gestisci i collegamenti con le cliniche veterinarie</p>
              </div>
              <Button variant="outline" onClick={loadConnections}><RefreshCw className="h-4 w-4 mr-2" />Aggiorna</Button>
            </div>

            {loadingConns ? (
              <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
            ) : (
              <>
                {/* Pending Connections */}
                {pendingConns.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />Richieste in attesa ({pendingConns.length})
                    </h3>
                    <div className="space-y-3">
                      {pendingConns.map(conn => (
                        <Card key={conn.id} className="border-yellow-200 bg-yellow-50/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                  <Building2 className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{conn.clinic?.clinicName || 'Clinica'}</p>
                                  <p className="text-sm text-gray-500">{conn.clinic?.city || ''} • {conn.clinic?.email || ''}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => respondToConnection(conn.id, 'accept')}>
                                  <CheckCircle className="h-4 w-4 mr-1" />Accetta
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => respondToConnection(conn.id, 'reject')}>
                                  <XCircle className="h-4 w-4 mr-1" />Rifiuta
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Connections */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />Cliniche attive ({activeConns.length})
                  </h3>
                  {activeConns.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center text-gray-500">
                        <Building2 className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">Nessuna clinica collegata</p>
                        <p className="text-xs mt-1">Le cliniche possono trovarti nel marketplace e richiedere un collegamento</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeConns.map(conn => (
                        <Card key={conn.id} className="border-green-200 hover:shadow-md transition">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">{conn.clinic?.clinicName || 'Clinica'}</p>
                                <p className="text-xs text-gray-500">{conn.clinic?.city || ''}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
                              {conn.clinic?.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{conn.clinic.phone}</span>}
                              {conn.clinic?.email && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{conn.clinic.email}</span>}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Collegato dal {new Date(conn.createdAt).toLocaleDateString('it-IT')}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* PRICE LIST TAB */}
        {activeTab === 'prices' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Euro className="h-6 w-6 text-green-500" />Listino Prezzi</h2>
                <p className="text-gray-500 text-sm">Gestisci i prezzi indicativi visibili alle cliniche nel marketplace</p>
              </div>
              <Button onClick={savePriceList} disabled={savingPrices} className="bg-green-500 hover:bg-green-600">
                {savingPrices ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salva Listino
              </Button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800 flex items-center gap-2"><Info className="h-4 w-4" /><strong>Nota:</strong> I prezzi sono indicativi e visibili alle cliniche nel marketplace. Il prezzo finale può variare. <strong>Tutti i prezzi si intendono IVA esclusa (22%).</strong></p>
            </div>

            {loadingPrices ? (
              <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-green-500" /></div>
            ) : (
              <>
                {/* Add New Price Item */}
                <Card className="border-dashed border-2 border-green-200">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2"><Plus className="h-4 w-4" />Aggiungi Esame</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                      <Select value={newPriceItem.examType || 'none'} onValueChange={(v) => setNewPriceItem({...newPriceItem, examType: v === 'none' ? '' : v})}>
                        <SelectTrigger className="lg:col-span-1"><SelectValue placeholder="Tipo esame" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" disabled>Tipo esame...</SelectItem>
                          {EXAM_TYPES_LIST.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Titolo (opzionale)" value={newPriceItem.title} onChange={(e) => setNewPriceItem({...newPriceItem, title: e.target.value})} className="lg:col-span-1" />
                      <Input type="number" placeholder="Da €" value={newPriceItem.priceFrom} onChange={(e) => setNewPriceItem({...newPriceItem, priceFrom: e.target.value})} className="lg:col-span-1" />
                      <Input type="number" placeholder="A € (opz.)" value={newPriceItem.priceTo} onChange={(e) => setNewPriceItem({...newPriceItem, priceTo: e.target.value})} className="lg:col-span-1" />
                      <Input placeholder="Tempi (es: 2-3 gg)" value={newPriceItem.averageDeliveryTime} onChange={(e) => setNewPriceItem({...newPriceItem, averageDeliveryTime: e.target.value})} className="lg:col-span-1" />
                      <Button onClick={addPriceItem} className="bg-green-500 hover:bg-green-600 lg:col-span-1"><Plus className="h-4 w-4 mr-1" />Aggiungi</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Price List */}
                {priceList.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                      <Euro className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Nessun esame nel listino</p>
                      <p className="text-xs mt-1">Aggiungi i tuoi esami con prezzi indicativi</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Esame</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Titolo</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Prezzo</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Tempi</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {priceList.map((item, index) => {
                          const examLabel = EXAM_TYPES_LIST.find(t => t.id === item.examType)?.label || item.examType;
                          return (
                            <tr key={item.id || index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-sm">{examLabel}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{item.title || '-'}</td>
                              <td className="px-4 py-3 text-right text-sm">
                                {item.priceOnRequest ? (
                                  <span className="text-gray-500 italic">Su richiesta</span>
                                ) : (
                                  <span className="font-semibold text-green-700">€{item.priceFrom}{item.priceTo ? ` - €${item.priceTo}` : ''}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right text-sm text-gray-500">{item.averageDeliveryTime || '-'}</td>
                              <td className="px-4 py-3">
                                <button onClick={() => removePriceItem(index)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* INTEGRATION TAB */}
        {activeTab === 'integration' && (
          <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Zap className="h-6 w-6 text-amber-500" />Integrazione API</h2>
                <p className="text-sm text-gray-500 mt-1">Connetti il tuo software di laboratorio a VetBuddy</p>
              </div>
              {integrationData?.configured && (
                <Button variant="outline" size="sm" onClick={handleToggleIntegration}>
                  {integrationData.isActive ? <><ToggleRight className="h-4 w-4 mr-1 text-green-500" /> Attiva</> : <><ToggleLeft className="h-4 w-4 mr-1 text-gray-400" /> Disattivata</>}
                </Button>
              )}
            </div>

            {loadingIntegration ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
            ) : (
              <>
                {/* API Key Section */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Key className="h-5 w-5 text-violet-500" /> API Key</h3>
                    
                    {integrationData?.hasApiKey ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-1">API Key attuale</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1 break-all">{integrationData.apiKeyMasked}</code>
                          </div>
                          {integrationData.isActive ? (
                            <Badge className="mt-2 bg-green-100 text-green-700">✅ Integrazione attiva</Badge>
                          ) : (
                            <Badge className="mt-2 bg-gray-100 text-gray-600">⏸ Integrazione disattivata</Badge>
                          )}
                        </div>

                        {/* Show newly generated key */}
                        {showApiKey && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-sm font-bold text-amber-800 mb-2">⚠️ Copia la tua API Key ora! Non verrà mostrata di nuovo.</p>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1 break-all text-green-700">{showApiKey}</code>
                              <Button size="sm" variant="outline" onClick={() => copyToClipboard(showApiKey, 'apiKey')}>
                                {copiedField === 'apiKey' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        )}

                        <Button variant="outline" size="sm" onClick={handleGenerateApiKey} disabled={generatingKey} className="text-amber-600 border-amber-300 hover:bg-amber-50">
                          {generatingKey ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                          Rigenera API Key
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Key className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 mb-1">Nessuna API Key configurata</p>
                        <p className="text-sm text-gray-400 mb-4">Genera una API Key per connettere il tuo software</p>
                        <Button onClick={handleGenerateApiKey} disabled={generatingKey} className="bg-violet-600 hover:bg-violet-700">
                          {generatingKey ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Key className="h-4 w-4 mr-1" />}
                          Genera API Key
                        </Button>

                        {showApiKey && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 text-left">
                            <p className="text-sm font-bold text-amber-800 mb-2">⚠️ Copia la tua API Key ora! Non verrà mostrata di nuovo.</p>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1 break-all text-green-700">{showApiKey}</code>
                              <Button size="sm" variant="outline" onClick={() => copyToClipboard(showApiKey, 'apiKey')}>
                                {copiedField === 'apiKey' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* API Documentation */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Code className="h-5 w-5 text-blue-500" /> Documentazione API</h3>
                    <p className="text-sm text-gray-600 mb-4">Usa questi endpoint per integrare il tuo software di laboratorio con VetBuddy.</p>
                    
                    <div className="space-y-4">
                      {/* Endpoint 1 */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-100 text-green-700 font-mono text-xs">GET</Badge>
                          <code className="text-sm font-mono">/api/webhook/lab/<span className="text-violet-600">{'{'}<span className="italic">API_KEY</span>{'}'}</span>/pending-requests</code>
                        </div>
                        <p className="text-sm text-gray-600">Recupera tutte le richieste di analisi in attesa per il tuo laboratorio.</p>
                        <p className="text-xs text-gray-400 mt-1">Risposta: {'{ labId, count, requests: [...] }'}</p>
                      </div>

                      {/* Endpoint 2 */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-700 font-mono text-xs">POST</Badge>
                          <code className="text-sm font-mono">/api/webhook/lab/<span className="text-violet-600">{'{'}<span className="italic">API_KEY</span>{'}'}</span>/update-status</code>
                        </div>
                        <p className="text-sm text-gray-600">Aggiorna lo stato di una richiesta (received, in_progress, report_ready, completed...).</p>
                        <p className="text-xs text-gray-400 mt-1">Body: {'{ "requestId": "...", "status": "in_progress", "notes": "..." }'}</p>
                      </div>

                      {/* Endpoint 3 */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-700 font-mono text-xs">POST</Badge>
                          <code className="text-sm font-mono">/api/webhook/lab/<span className="text-violet-600">{'{'}<span className="italic">API_KEY</span>{'}'}</span>/upload-report</code>
                        </div>
                        <p className="text-sm text-gray-600">Carica un referto PDF per una richiesta specifica.</p>
                        <p className="text-xs text-gray-400 mt-1">Body: {'{ "requestId": "...", "reportPdfBase64": "...", "fileName": "report.pdf", "notes": "..." }'}</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <p className="text-sm text-indigo-800 flex items-center gap-1"><Shield className="h-4 w-4" /> <strong>Sicurezza:</strong> L'API Key identifica il tuo laboratorio. Non condividerla e ruotala periodicamente.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Webhook Logs */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-green-500" /> Log Chiamate API</h3>
                      <Button variant="outline" size="sm" onClick={loadIntegration}><RefreshCw className="h-4 w-4 mr-1" /> Aggiorna</Button>
                    </div>
                    {webhookLogs.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left p-3 font-medium">Evento</th>
                              <th className="text-left p-3 font-medium">Metodo</th>
                              <th className="text-left p-3 font-medium">Stato</th>
                              <th className="text-left p-3 font-medium">Data/Ora</th>
                            </tr>
                          </thead>
                          <tbody>
                            {webhookLogs.map(log => (
                              <tr key={log.id} className="border-t">
                                <td className="p-3">
                                  <span className="font-medium">{
                                    log.eventType === 'fetch_pending_requests' ? '📥 Fetch richieste' :
                                    log.eventType === 'update_status' ? '🔄 Aggiornamento stato' :
                                    log.eventType === 'upload_report' ? '📄 Upload referto' :
                                    log.eventType
                                  }</span>
                                  {log.requestId && <p className="text-xs text-gray-400">ID: {log.requestId.slice(0, 8)}...</p>}
                                </td>
                                <td className="p-3"><Badge variant="outline" className="text-xs font-mono">{log.method}</Badge></td>
                                <td className="p-3">{log.success ? <Badge className="bg-green-100 text-green-700 text-xs">OK</Badge> : <Badge className="bg-red-100 text-red-700 text-xs">Errore</Badge>}</td>
                                <td className="p-3 text-gray-500">{log.processedAt ? new Date(log.processedAt).toLocaleString('it-IT') : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">Nessuna chiamata API registrata</p>
                        <p className="text-xs text-gray-400">Le chiamate appariranno qui dopo aver configurato l'integrazione</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Settings className="h-6 w-6 text-indigo-500" />Profilo Laboratorio</h2>
            
            {/* Abbonamento */}
            <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Euro className="h-5 w-5 text-indigo-500" />Abbonamento VetBuddy
                </h3>
                <SubscriptionPlans user={user} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Nome</p><p className="font-medium">{user.labName || user.name}</p></div>
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Email</p><p className="font-medium">{user.email}</p></div>
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Stato</p><p className="font-medium">{user.status === 'active' ? '✅ Attivo' : '⏳ In attesa'}</p></div>
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Piano</p><p className="font-medium">Lab Partner</p></div>
                </div>
                {billing && (
                  <div className={`rounded-lg p-4 border ${billing.billingActive ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <h4 className="font-semibold text-sm mb-2">{billing.billingActive ? '⚠️ Trial scaduto' : '✅ Trial attivo'}</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-xs text-gray-500">Giorni rimanenti</p><p className="font-bold text-lg">{billing.daysRemaining}</p></div>
                      <div><p className="text-xs text-gray-500">Richieste</p><p className="font-bold text-lg">{billing.requestsCount}/{billing.maxFreeRequests}</p></div>
                      <div><p className="text-xs text-gray-500">Scadenza trial</p><p className="font-medium">{billing.freeUntil ? new Date(billing.freeUntil).toLocaleDateString('it-IT') : '-'}</p></div>
                      <div><p className="text-xs text-gray-500">Dopo il trial</p><p className="font-medium">€39/mese</p></div>
                    </div>
                  </div>
                )}
                {user.city && <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Città</p><p className="font-medium">{user.city}</p></div>}
                {user.phone && <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Telefono</p><p className="font-medium">{user.phone}</p></div>}
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <p className="text-sm text-indigo-700"><Info className="h-4 w-4 inline mr-1" />Per modificare il profilo, contatta il supporto VetBuddy.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Upload Report Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-indigo-500" />Carica Referto</DialogTitle>
            <DialogDescription>Carica il referto PDF per {selectedRequest?.petName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File PDF</label>
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="w-full p-3 border border-dashed border-gray-300 rounded-lg text-sm" />
              {uploadFile && <p className="mt-2 text-sm text-green-600 flex items-center gap-2"><FileCheck className="h-4 w-4" />{uploadFile.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note (opzionale)</label>
              <textarea value={uploadData.reportNotes} onChange={(e) => setUploadData({...uploadData, reportNotes: e.target.value})} rows={3} className="w-full p-3 border border-gray-200 rounded-lg text-sm" placeholder="Note tecniche..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>Annulla</Button>
            <Button onClick={submitReport} disabled={!uploadFile} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              <Upload className="h-4 w-4 mr-2" />Carica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LabDashboard;
