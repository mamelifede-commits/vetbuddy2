'use client';
// ClinicLabAnalysis v2.0 - Send to Owner workflow - 2026-04-14T17:25

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Download, Eye, FileCheck, FlaskConical, Info, Loader2, MousePointerClick, Paperclip, PawPrint, Plus, RefreshCw, Send, Upload, X } from 'lucide-react';
import api from '@/app/lib/api';

function ClinicLabAnalysis({ user, pets, owners }) {
  const [labRequests, setLabRequests] = useState([]);
  const [labs, setLabs] = useState([]);
  const [examTypes, setExamTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showSendToOwnerModal, setShowSendToOwnerModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [clinicNotesForOwner, setClinicNotesForOwner] = useState('');
  const [sending, setSending] = useState(false);
  const [newRequest, setNewRequest] = useState({
    petId: '', labId: '', examCategory: '', examType: '', examName: '',
    clinicalNotes: '', internalNotes: '', priority: 'normal', attachments: []
  });
  const [attachmentUploading, setAttachmentUploading] = useState(false);

  const LAB_STATUSES = [
    { id: 'pending', name: 'In Attesa', color: 'yellow' },
    { id: 'received', name: 'Ricevuta', color: 'blue' },
    { id: 'sample_waiting', name: 'Campione in Attesa', color: 'orange' },
    { id: 'sample_received', name: 'Campione Ricevuto', color: 'indigo' },
    { id: 'in_progress', name: 'In Analisi', color: 'purple' },
    { id: 'report_ready', name: 'Da Revisionare', color: 'amber' },
    { id: 'completed', name: 'Inviato al Proprietario', color: 'emerald' },
    { id: 'cancelled', name: 'Annullata', color: 'red' }
  ];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requests, connectedData, labsList, types] = await Promise.all([
        api.get('lab-requests'),
        api.get('clinic/connected-labs').catch(() => []),
        api.get('labs'),
        api.get('lab/exam-types')
      ]);
      setLabRequests(requests || []);
      // Prioritize connected labs, then show all
      const connectedLabIds = (connectedData || []).filter(c => c.status === 'active').map(c => c.labId);
      const allLabs = labsList || [];
      const sorted = [
        ...allLabs.filter(l => connectedLabIds.includes(l.id)),
        ...allLabs.filter(l => !connectedLabIds.includes(l.id))
      ];
      setLabs(sorted);
      setExamTypes(types || {});
    } catch (error) {
      console.error('Error loading lab data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async () => {
    if (!newRequest.petId || !newRequest.labId || !newRequest.examType) {
      alert('Seleziona pet, laboratorio e tipo esame');
      return;
    }
    try {
      await api.post('lab-requests', newRequest);
      setShowNewRequest(false);
      setNewRequest({ petId: '', labId: '', examCategory: '', examType: '', examName: '', clinicalNotes: '', internalNotes: '', priority: 'normal', attachments: [] });
      await loadData();
      alert('Richiesta analisi inviata!');
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const handleAttachment = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setAttachmentUploading(true);
    try {
      const newAttachments = [];
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          alert(`Il file "${file.name}" supera il limite di 5MB`);
          continue;
        }
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        newAttachments.push({
          name: file.name,
          type: file.type,
          size: file.size,
          url: base64
        });
      }
      setNewRequest(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newAttachments]
      }));
    } catch (error) {
      console.error('Attachment error:', error);
    }
    setAttachmentUploading(false);
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setNewRequest(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const sendReportToOwner = async () => {
    if (!selectedReport) return;
    setSending(true);
    try {
      await api.post('lab-reports/send-to-owner', {
        reportId: selectedReport.id,
        clinicNotes: clinicNotesForOwner,
        notifyOwner: true
      });
      setShowSendToOwnerModal(false);
      setSelectedReport(null);
      setClinicNotesForOwner('');
      await loadData();
      // Refresh selected request
      if (selectedRequest) {
        const updated = await api.get(`lab-requests/${selectedRequest.id}`);
        setSelectedRequest(updated);
      }
      alert('✅ Referto inviato al proprietario!');
    } catch (error) {
      alert('Errore: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const openSendToOwnerModal = (report) => {
    setSelectedReport(report);
    setClinicNotesForOwner('');
    setShowSendToOwnerModal(true);
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

  const viewRequestDetail = async (requestId) => {
    try {
      const detail = await api.get(`lab-requests/${requestId}`);
      setSelectedRequest(detail);
    } catch (error) {
      console.error('Error loading request detail:', error);
    }
  };

  const downloadReport = (report) => {
    if (report.fileContent) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${report.fileContent}`;
      link.download = report.fileName || 'referto.pdf';
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FlaskConical className="h-7 w-7 text-indigo-500" />
            Analisi di Laboratorio
          </h1>
          <p className="text-gray-500 mt-1">Gestisci le richieste di analisi ai laboratori partner</p>
        </div>
        <Button onClick={() => setShowNewRequest(true)} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Nuova Richiesta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-100">
          <p className="text-2xl font-bold text-gray-900">{labRequests.filter(r => r.status === 'pending').length}</p>
          <p className="text-sm text-gray-500">In Attesa</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
          <p className="text-2xl font-bold text-gray-900">{labRequests.filter(r => ['in_progress', 'sample_received'].includes(r.status)).length}</p>
          <p className="text-sm text-gray-500">In Corso</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
          <p className="text-2xl font-bold text-gray-900">{labRequests.filter(r => r.status === 'report_ready').length}</p>
          <p className="text-sm text-gray-500">Referti Pronti</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{labRequests.length}</p>
          <p className="text-sm text-gray-500">Totale</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Richieste Analisi</h2>
            <Button variant="ghost" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4" /></Button>
          </div>
          
          {loading ? (
            <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" /></div>
          ) : labRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FlaskConical className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nessuna richiesta di analisi</p>
              <p className="text-sm mt-2">Clicca "Nuova Richiesta" per iniziare</p>
            </div>
          ) : (
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {labRequests.map(req => (
                <div 
                  key={req.id}
                  onClick={() => viewRequestDetail(req.id)}
                  className={`p-4 hover:bg-indigo-50/50 cursor-pointer transition-colors ${selectedRequest?.id === req.id ? 'bg-indigo-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{req.examName || req.examType}</span>
                        {req.priority === 'urgent' && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">URGENTE</span>}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <PawPrint className="h-3.5 w-3.5" />
                        {req.petName} • {req.labName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(req.createdAt).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Request Detail */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {selectedRequest ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                <h3 className="font-semibold text-gray-900">{selectedRequest.examName || selectedRequest.examType}</h3>
                <p className="text-sm text-gray-600">{selectedRequest.pet?.name} ({selectedRequest.pet?.species})</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Stato</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-xs text-gray-500">Laboratorio</label>
                    <p className="font-medium">{selectedRequest.lab?.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Codice Campione</label>
                    <p className="font-mono font-medium">{selectedRequest.sampleCode}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Proprietario</label>
                    <p className="font-medium">{selectedRequest.owner?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Data</label>
                    <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleDateString('it-IT')}</p>
                  </div>
                </div>
                
                {selectedRequest.clinicalNotes && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Note Cliniche</label>
                    <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRequest.clinicalNotes}</p>
                  </div>
                )}

                {/* Attachments */}
                {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Allegati</label>
                    <div className="space-y-1.5">
                      {selectedRequest.attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                          <Paperclip className="h-4 w-4 text-indigo-500 shrink-0" />
                          {att.type?.startsWith('image/') ? (
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline truncate">{att.name}</a>
                          ) : (
                            <a href={att.url} download={att.name} className="text-sm text-indigo-600 hover:underline truncate">{att.name}</a>
                          )}
                          <span className="text-xs text-gray-400 shrink-0">({(att.size / 1024).toFixed(0)}KB)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status History */}
                {selectedRequest.statusHistory && selectedRequest.statusHistory.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Cronologia</label>
                    <div className="space-y-2">
                      {selectedRequest.statusHistory.slice().reverse().map((entry, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5"></div>
                          <div>
                            <p className="font-medium">{LAB_STATUSES.find(s => s.id === entry.status)?.name || entry.status}</p>
                            <p className="text-gray-400">{new Date(entry.updatedAt).toLocaleString('it-IT')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Reports */}
                {selectedRequest.reports && selectedRequest.reports.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Referti</label>
                    <div className="space-y-2">
                      {selectedRequest.reports.map(report => (
                        <div key={report.id} className={`p-3 rounded-lg ${report.visibleToOwner ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <FileCheck className={`h-5 w-5 ${report.visibleToOwner ? 'text-green-600' : 'text-amber-600'}`} />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{report.fileName}</p>
                                <p className="text-xs text-gray-500">{new Date(report.uploadedAt).toLocaleString('it-IT')}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => downloadReport(report)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                          {report.reportNotes && (
                            <p className="text-xs text-gray-600 bg-white/50 p-2 rounded mb-2">📋 Lab: {report.reportNotes}</p>
                          )}
                          {report.visibleToOwner ? (
                            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-100 rounded-md px-2 py-1">
                              <Eye className="h-3 w-3" />
                              <span>Inviato al proprietario {report.sentToOwnerAt ? `il ${new Date(report.sentToOwnerAt).toLocaleDateString('it-IT')}` : ''}</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                              onClick={(e) => { e.stopPropagation(); openSendToOwnerModal(report); }}
                            >
                              <Send className="h-3.5 w-3.5 mr-2" />
                              Revisiona e Invia al Proprietario
                            </Button>
                          )}
                          {report.visibleToOwner && report.clinicNotes && (
                            <p className="text-xs text-gray-600 mt-1 bg-white/50 p-2 rounded">📝 Note cliniche: {report.clinicNotes}</p>
                          )}
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

      {/* New Request Dialog */}
      <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-indigo-500" />
              Nuova Richiesta Analisi
            </DialogTitle>
            <DialogDescription>
              Invia una richiesta di analisi a un laboratorio partner
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Pet Selection */}
            <div>
              <Label>Paziente *</Label>
              <Select value={newRequest.petId} onValueChange={(v) => setNewRequest({...newRequest, petId: v})}>
                <SelectTrigger><SelectValue placeholder="Seleziona paziente" /></SelectTrigger>
                <SelectContent>
                  {pets.map(pet => (
                    <SelectItem key={pet.id} value={pet.id}>
                      <span className="flex items-center gap-2">
                        <PawPrint className="h-4 w-4" />
                        {pet.name} ({pet.species})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lab Selection */}
            <div>
              <Label>Laboratorio *</Label>
              <Select value={newRequest.labId} onValueChange={(v) => setNewRequest({...newRequest, labId: v})}>
                <SelectTrigger><SelectValue placeholder="Seleziona laboratorio" /></SelectTrigger>
                <SelectContent>
                  {labs.map(lab => (
                    <SelectItem key={lab.id} value={lab.id}>
                      <span className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4" />
                        {lab.labName || lab.name} - {lab.city}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exam Category */}
            <div>
              <Label>Categoria Esame *</Label>
              <Select value={newRequest.examCategory} onValueChange={(v) => setNewRequest({...newRequest, examCategory: v, examType: '', examName: ''})}>
                <SelectTrigger><SelectValue placeholder="Seleziona categoria" /></SelectTrigger>
                <SelectContent>
                  {Object.values(examTypes).map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exam Type */}
            {newRequest.examCategory && examTypes[newRequest.examCategory] && (
              <div>
                <Label>Tipo Esame *</Label>
                <Select value={newRequest.examType} onValueChange={(v) => {
                  const exam = examTypes[newRequest.examCategory].exams.find(e => e.id === v);
                  setNewRequest({...newRequest, examType: v, examName: exam?.name || v});
                }}>
                  <SelectTrigger><SelectValue placeholder="Seleziona esame" /></SelectTrigger>
                  <SelectContent>
                    {examTypes[newRequest.examCategory].exams.map(exam => (
                      <SelectItem key={exam.id} value={exam.id}>
                        <div>
                          <p className="font-medium">{exam.name}</p>
                          <p className="text-xs text-gray-500">{exam.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Priority */}
            <div>
              <Label>Priorità</Label>
              <Select value={newRequest.priority} onValueChange={(v) => setNewRequest({...newRequest, priority: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Bassa</SelectItem>
                  <SelectItem value="normal">🟡 Normale</SelectItem>
                  <SelectItem value="urgent">🔴 Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clinical Notes */}
            <div>
              <Label>Note Cliniche</Label>
              <Textarea 
                value={newRequest.clinicalNotes}
                onChange={(e) => setNewRequest({...newRequest, clinicalNotes: e.target.value})}
                placeholder="Sintomi, sospetti diagnostici, storia clinica..."
                rows={3}
              />
            </div>

            {/* Internal Notes */}
            <div>
              <Label>Note Interne (visibili solo al laboratorio)</Label>
              <Textarea 
                value={newRequest.internalNotes}
                onChange={(e) => setNewRequest({...newRequest, internalNotes: e.target.value})}
                placeholder="Note riservate per il laboratorio..."
                rows={2}
              />
            </div>

            {/* Attachments */}
            <div>
              <Label className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Allegati (opzionale)
              </Label>
              <div className="mt-1">
                <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                  <Upload className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {attachmentUploading ? 'Caricamento...' : 'Aggiungi foto, PDF o documenti (max 5MB)'}
                  </span>
                  <input type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleAttachment} disabled={attachmentUploading} />
                </label>
              </div>
              {newRequest.attachments && newRequest.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {newRequest.attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 bg-indigo-50 rounded-lg text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span className="truncate font-medium text-gray-700">{att.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">({(att.size / 1024).toFixed(0)}KB)</span>
                      </div>
                      <button onClick={() => removeAttachment(idx)} className="text-red-400 hover:text-red-600 ml-2 shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRequest(false)}>Annulla</Button>
            <Button 
              onClick={createRequest}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              <Send className="h-4 w-4 mr-2" />
              Invia Richiesta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send to Owner Modal */}
      <Dialog open={showSendToOwnerModal} onOpenChange={setShowSendToOwnerModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-amber-500" />
              Revisiona e Invia al Proprietario
            </DialogTitle>
            <DialogDescription>
              Rivedi il referto e aggiungi le tue note cliniche prima di inviarlo al proprietario.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              {/* Report Info */}
              <div className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-sm">{selectedReport.fileName}</span>
                </div>
                <p className="text-xs text-gray-500">Caricato: {new Date(selectedReport.uploadedAt).toLocaleString('it-IT')}</p>
                {selectedReport.reportNotes && (
                  <div className="mt-2 p-2 bg-white rounded border-l-2 border-indigo-300">
                    <p className="text-xs text-gray-500 font-medium">Note del laboratorio:</p>
                    <p className="text-sm text-gray-700">{selectedReport.reportNotes}</p>
                  </div>
                )}
              </div>

              {/* Download button */}
              <Button variant="outline" className="w-full" onClick={() => downloadReport(selectedReport)}>
                <Download className="h-4 w-4 mr-2" />
                Scarica e Visualizza il Referto PDF
              </Button>

              {/* Clinic Notes */}
              <div>
                <Label className="text-sm font-medium">Note Cliniche per il Proprietario</Label>
                <p className="text-xs text-gray-500 mb-2">Aggiungi la tua interpretazione del referto, consigli e prossimi passi per il proprietario.</p>
                <Textarea 
                  value={clinicNotesForOwner}
                  onChange={(e) => setClinicNotesForOwner(e.target.value)}
                  placeholder="Es: I valori ematici sono nella norma. Il referto conferma che Luna è in buona salute. Consiglio un controllo tra 6 mesi..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Attenzione</p>
                  <p className="text-xs mt-1">Una volta inviato, il proprietario potrà visualizzare e scaricare il referto dal proprio profilo. Verrà anche notificato via email.</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowSendToOwnerModal(false); setSelectedReport(null); setClinicNotesForOwner(''); }}>
              Annulla
            </Button>
            <Button 
              onClick={sendReportToOwner}
              disabled={sending}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Invio in corso...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Invia al Proprietario
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


export default ClinicLabAnalysis;
