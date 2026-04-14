'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, CheckCircle2, Clock, Eye, FileCheck, FileText, FlaskConical, Info, Loader2, LogOut, Menu, MousePointerClick, Package, PawPrint, RefreshCw, Settings, Upload, XCircle } from 'lucide-react';
import api from '@/app/lib/api';

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

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.get('lab-requests');
      setLabRequests(data || []);
      
      // Calculate stats
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

  const handleFileUpload = async (e) => {
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
      
      // Refresh selected request
      const updated = await api.get(`lab-requests/${selectedRequest.id}`);
      setSelectedRequest(updated);
      
      alert('Referto caricato con successo!');
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = LAB_STATUSES.find(s => s.id === status) || { name: status, color: 'gray' };
    const colorMap = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      emerald: 'bg-emerald-100 text-emerald-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[statusInfo.color]}`}>{statusInfo.name}</span>;
  };

  const filteredRequests = filterStatus === 'all' 
    ? labRequests 
    : labRequests.filter(r => r.status === filterStatus);

  const menuItems = [
    { id: 'requests', label: 'Richieste', icon: FileText },
    { id: 'completed', label: 'Completate', icon: CheckCircle },
    { id: 'settings', label: 'Impostazioni', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-indigo-50">
              <Menu className="h-6 w-6 text-indigo-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl relative">
                <FlaskConical className="h-6 w-6 text-white" />
                {stats.pending > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {stats.pending}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{user.labName || 'Laboratorio'}</h1>
                <p className="text-xs text-indigo-600">Dashboard Laboratorio</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadRequests} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600">
              <RefreshCw className="h-5 w-5" />
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="h-5 w-5 text-yellow-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500">In Attesa</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Loader2 className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                <p className="text-xs text-gray-500">In Corso</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-xs text-gray-500">Completate</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg"><FileText className="h-5 w-5 text-indigo-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Totale</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-indigo-500" />
                Richieste Analisi
              </h2>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
              >
                <option value="all">Tutte</option>
                {LAB_STATUSES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            {loading ? (
              <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" /></div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FlaskConical className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nessuna richiesta trovata</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredRequests.map(req => (
                  <div 
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`p-4 hover:bg-indigo-50/50 cursor-pointer transition-colors ${selectedRequest?.id === req.id ? 'bg-indigo-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 truncate">{req.examName || req.examType}</span>
                          {req.priority === 'urgent' && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">URGENTE</span>}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <PawPrint className="h-3.5 w-3.5" />
                          {req.petName} • {req.clinicName}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Codice: {req.sampleCode} • {new Date(req.createdAt).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(req.status)}
                      </div>
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
                  {/* Status */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Stato</label>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  
                  {/* Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <label className="text-xs text-gray-500">Clinica</label>
                      <p className="font-medium">{selectedRequest.clinicName}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Codice Campione</label>
                      <p className="font-mono font-medium">{selectedRequest.sampleCode}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Priorità</label>
                      <p className="font-medium capitalize">{selectedRequest.priority === 'urgent' ? '🔴 Urgente' : selectedRequest.priority === 'low' ? '🟢 Bassa' : '🟡 Normale'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Data Richiesta</label>
                      <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                  
                  {/* Clinical Notes */}
                  {selectedRequest.clinicalNotes && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Note Cliniche</label>
                      <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRequest.clinicalNotes}</p>
                    </div>
                  )}
                  
                  {/* Status Update */}
                  <div className="border-t pt-4">
                    <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Aggiorna Stato</label>
                    <div className="grid grid-cols-2 gap-2">
                      {LAB_STATUSES.filter(s => !['pending', 'cancelled'].includes(s.id)).map(status => (
                        <button
                          key={status.id}
                          onClick={() => updateStatus(selectedRequest.id, status.id)}
                          disabled={selectedRequest.status === status.id}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            selectedRequest.status === status.id 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                          }`}
                        >
                          {status.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Upload Report Button */}
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Carica Referto PDF
                  </button>
                  
                  {/* Reports List */}
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
                <div>
                  <MousePointerClick className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Seleziona una richiesta per vedere i dettagli</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Report Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-indigo-500" />
              Carica Referto
            </DialogTitle>
            <DialogDescription>
              Carica il referto PDF per {selectedRequest?.petName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="w-full p-3 border border-dashed border-gray-300 rounded-lg text-sm"
              />
              {uploadFile && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  {uploadFile.name}
                </p>
              )}
            </div>
            
            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note (opzionale)</label>
              <textarea
                value={uploadData.reportNotes}
                onChange={(e) => setUploadData({...uploadData, reportNotes: e.target.value})}
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                placeholder="Note tecniche o commenti..."
              />
            </div>
            
            {/* Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadData.visibleToOwner}
                  onChange={(e) => setUploadData({...uploadData, visibleToOwner: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">Visibile al proprietario</p>
                  <p className="text-xs text-gray-500">Il proprietario potrà vedere questo referto</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadData.notifyOwner}
                  onChange={(e) => setUploadData({...uploadData, notifyOwner: e.target.checked})}
                  disabled={!uploadData.visibleToOwner}
                  className="w-4 h-4 text-indigo-600 rounded disabled:opacity-50"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">Notifica proprietario</p>
                  <p className="text-xs text-gray-500">Invia email al proprietario</p>
                </div>
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>Annulla</Button>
            <Button 
              onClick={submitReport} 
              disabled={!uploadFile}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              <Upload className="h-4 w-4 mr-2" />
              Carica Referto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== ADMIN DASHBOARD ====================

export default LabDashboard;
