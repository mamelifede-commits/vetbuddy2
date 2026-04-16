'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, CheckCircle, Clock, ClipboardCheck, Edit, Eye, FileText, History,
  Loader2, Pill, Send, Shield, Trash2, X, XCircle, AlertCircle, Calendar, User,
  ExternalLink, Copy, Info
} from 'lucide-react';
import api from '@/app/lib/api';
import { REVComplianceBanner } from './ClinicREVSettings';

const STATUS_CONFIG = {
  DRAFT: { label: 'Bozza', color: 'bg-gray-100 text-gray-700', icon: Edit },
  READY_TO_SEND: { label: 'Pronta per invio', color: 'bg-blue-100 text-blue-700', icon: Send },
  SENDING: { label: 'Invio in corso...', color: 'bg-yellow-100 text-yellow-700', icon: Loader2 },
  EMITTED: { label: 'Emessa', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  REGISTERED_MANUALLY: { label: 'Registrata manualmente', color: 'bg-indigo-100 text-indigo-700', icon: ClipboardCheck },
  ERROR: { label: 'Errore', color: 'bg-red-100 text-red-700', icon: XCircle },
  CANCELLED: { label: 'Annullata', color: 'bg-gray-100 text-gray-400', icon: X }
};

function PrescriptionDetail({ prescription: initialPrescription, user, revConfig, onBack, onUpdated }) {
  const [prescription, setPrescription] = useState(initialPrescription);
  const [auditEvents, setAuditEvents] = useState([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualForm, setManualForm] = useState({ prescriptionNumber: '', pin: '', issueDate: '', notes: '' });

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    try {
      const data = await api.get(`prescriptions/${prescription.id}`);
      setPrescription(data);
    } catch (err) {
      console.error('Error loading detail:', err);
    }
  };

  const loadAudit = async () => {
    try {
      const events = await api.get(`prescriptions/${prescription.id}/audit`);
      setAuditEvents(Array.isArray(events) ? events : []);
      setShowAudit(true);
    } catch (err) {
      console.error('Error loading audit:', err);
    }
  };

  const handleSubmitToREV = async () => {
    setLoading(true);
    try {
      const result = await api.post(`prescriptions/${prescription.id}/submit`, {});
      if (result.manualMode) {
        setShowManualForm(true);
      }
      await loadDetail();
      onUpdated?.();
    } catch (err) {
      alert(err.message || 'Errore durante l\'invio');
      await loadDetail();
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterManual = async () => {
    if (!manualForm.prescriptionNumber.trim()) {
      alert('Inserisci il numero ricetta');
      return;
    }
    setLoading(true);
    try {
      await api.post(`prescriptions/${prescription.id}/register-manual`, manualForm);
      setShowManualForm(false);
      await loadDetail();
      onUpdated?.();
    } catch (err) {
      alert(err.message || 'Errore nella registrazione');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Sei sicuro di voler annullare questa prescrizione?')) return;
    setLoading(true);
    try {
      await api.post(`prescriptions/${prescription.id}/cancel`, { reason: 'Annullata dal veterinario' });
      await loadDetail();
      onUpdated?.();
    } catch (err) {
      alert(err.message || 'Errore nell\'annullamento');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      await api.post(`prescriptions/${prescription.id}/publish`, {});
      await loadDetail();
      onUpdated?.();
    } catch (err) {
      alert(err.message || 'Errore nella pubblicazione');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questa bozza?')) return;
    try {
      await api.delete(`prescriptions/${prescription.id}`);
      onBack();
    } catch (err) {
      alert(err.message || 'Errore nell\'eliminazione');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copiato negli appunti!');
    });
  };

  const statusCfg = STATUS_CONFIG[prescription.status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = statusCfg.icon;
  const isDraft = prescription.status === 'DRAFT';
  const isError = prescription.status === 'ERROR';
  const isEmitted = prescription.status === 'EMITTED' || prescription.status === 'REGISTERED_MANUALLY';
  const items = prescription.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" />Indietro</Button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-600" />
              Prescrizione — {prescription.petName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                <StatusIcon className="h-3 w-3" />{statusCfg.label}
              </span>
              <span className="text-xs text-gray-400">ID: {prescription.id?.substring(0, 8)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadAudit}><History className="h-4 w-4 mr-1" />Cronologia</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="md:col-span-2 space-y-4">
          {/* Patient Info */}
          <Card>
            <CardHeader className="py-3 bg-gray-50"><CardTitle className="text-sm">🐾 Paziente</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Nome:</span> <strong>{prescription.petName}</strong></div>
                <div><span className="text-gray-500">Proprietario:</span> <strong>{prescription.ownerName}</strong></div>
                <div><span className="text-gray-500">Veterinario:</span> <strong>{prescription.veterinarianName}</strong></div>
                <div><span className="text-gray-500">Tipo:</span> <strong>{prescription.prescriptionType}</strong></div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnosis */}
          <Card>
            <CardHeader className="py-3 bg-gray-50"><CardTitle className="text-sm">🩺 Diagnosi e Istruzioni</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2 text-sm">
              <div><span className="text-gray-500">Diagnosi:</span><p className="mt-1">{prescription.diagnosisNote || '-'}</p></div>
              {prescription.dosageInstructions && <div><span className="text-gray-500">Istruzioni:</span><p className="mt-1">{prescription.dosageInstructions}</p></div>}
              {prescription.treatmentDuration && <div><span className="text-gray-500">Durata:</span> {prescription.treatmentDuration}</div>}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="py-3 bg-emerald-50"><CardTitle className="text-sm text-emerald-700">💊 Farmaci ({items.length})</CardTitle></CardHeader>
            <CardContent className="p-4">
              {items.length === 0 ? (
                <p className="text-gray-400 text-sm">Nessun farmaco aggiunto</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-800">{item.productName}</p>
                        {item.aicCode && <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">AIC: {item.aicCode}</span>}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs text-gray-600">
                        <div><span className="text-gray-400">Quantità:</span> {item.quantity} {item.unit}</div>
                        <div><span className="text-gray-400">Via:</span> {item.routeOfAdministration}</div>
                        <div className="col-span-2"><span className="text-gray-400">Posologia:</span> {item.posology}</div>
                      </div>
                      {item.notes && <p className="text-xs text-gray-400 mt-1">Note: {item.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Actions & Status */}
        <div className="space-y-4">
          {/* Prescription Number / PIN */}
          {isEmitted && (
            <Card className="border-green-300 bg-green-50">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold text-green-800 flex items-center gap-2"><CheckCircle className="h-5 w-5" />Ricetta Emessa</h4>
                <div>
                  <Label className="text-xs text-green-600">Numero Ricetta</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-bold text-green-800 font-mono">{prescription.externalPrescriptionNumber}</p>
                    <button onClick={() => copyToClipboard(prescription.externalPrescriptionNumber)} className="text-green-500 hover:text-green-700">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {prescription.externalPin && (
                  <div>
                    <Label className="text-xs text-green-600">PIN</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-lg font-bold text-green-800 font-mono">{prescription.externalPin}</p>
                      <button onClick={() => copyToClipboard(prescription.externalPin)} className="text-green-500 hover:text-green-700">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="text-xs text-green-600">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Emessa il {prescription.issueDate ? new Date(prescription.issueDate).toLocaleString('it-IT') : '-'}
                </div>
                {!prescription.visibleToOwner && (
                  <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handlePublish} disabled={loading}>
                    <Eye className="h-4 w-4 mr-1" />Rendi visibile al proprietario
                  </Button>
                )}
                {prescription.visibleToOwner && (
                  <p className="text-xs text-green-600 bg-green-100 p-2 rounded">✅ Visibile al proprietario</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error state */}
          {isError && (
            <Card className="border-red-300 bg-red-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-red-800 flex items-center gap-2"><XCircle className="h-5 w-5" />Errore Invio</h4>
                <p className="text-sm text-red-600 mt-2">{prescription.externalStatus || 'Errore sconosciuto'}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">⚡ Azioni</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2">
              {(isDraft || isError) && (
                <>
                  {!revConfig?.manualMode ? (
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmitToREV} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                      Conferma emissione
                    </Button>
                  ) : (
                    <>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setShowManualForm(true)}>
                        <ClipboardCheck className="h-4 w-4 mr-2" />Registra emissione manuale
                      </Button>
                      <a href="https://www.vetinfo.it" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full mt-1" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />Apri Portale Vetinfo
                        </Button>
                      </a>
                      <p className="text-xs text-amber-600 text-center mt-1 flex items-center justify-center gap-1">
                        <Info className="h-3 w-3" />Solo il medico veterinario può confermare l&apos;emissione ufficiale.
                      </p>
                    </>
                  )}
                </>
              )}

              {isDraft && (
                <Button variant="outline" className="w-full text-red-600 hover:bg-red-50" onClick={handleCancel} disabled={loading}>
                  <X className="h-4 w-4 mr-2" />Annulla Prescrizione
                </Button>
              )}

              {isDraft && (
                <Button variant="ghost" size="sm" className="w-full text-gray-400" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-1" />Elimina Bozza
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardContent className="p-4 text-xs text-gray-400 space-y-1">
              <p><strong>Creata da:</strong> {prescription.createdByName}</p>
              <p><strong>Data creazione:</strong> {new Date(prescription.createdAt).toLocaleString('it-IT')}</p>
              <p><strong>Ultimo aggiornamento:</strong> {new Date(prescription.updatedAt).toLocaleString('it-IT')}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manual Registration Modal */}
      {showManualForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-indigo-600" />Registrazione Manuale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Inserisci i dati della ricetta emessa sul portale Vetinfo. Prescrizione registrata manualmente dopo emissione nel sistema ufficiale.
              </p>
              <div className="p-2 bg-amber-50 border border-amber-100 rounded text-xs text-amber-700 flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>Questa azione è disponibile solo per il medico veterinario autorizzato.</span>
              </div>
              <div>
                <Label>Numero Ricetta *</Label>
                <Input className="mt-1" placeholder="Es. REV-2026-123456" value={manualForm.prescriptionNumber}
                  onChange={e => setManualForm(f => ({ ...f, prescriptionNumber: e.target.value }))} />
              </div>
              <div>
                <Label>PIN (opzionale)</Label>
                <Input className="mt-1" placeholder="Es. 1234" value={manualForm.pin}
                  onChange={e => setManualForm(f => ({ ...f, pin: e.target.value }))} />
              </div>
              <div>
                <Label>Data Emissione</Label>
                <Input type="date" className="mt-1" value={manualForm.issueDate}
                  onChange={e => setManualForm(f => ({ ...f, issueDate: e.target.value }))} />
              </div>
              <div>
                <Label>Note</Label>
                <Textarea className="mt-1" rows={2} placeholder="Note opzionali..." value={manualForm.notes}
                  onChange={e => setManualForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowManualForm(false)}>Annulla</Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleRegisterManual} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Registra
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit Trail Modal */}
      {showAudit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-gray-600" />Cronologia</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAudit(false)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent>
              {auditEvents.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Nessun evento registrato</p>
              ) : (
                <div className="space-y-3">
                  {auditEvents.map(event => (
                    <div key={event.id} className="flex gap-3 pb-3 border-b last:border-0">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{event.eventType}</p>
                        {event.note && <p className="text-xs text-gray-500">{event.note}</p>}
                        {event.oldStatus && event.newStatus && (
                          <p className="text-xs text-gray-400">{event.oldStatus} → {event.newStatus}</p>
                        )}
                        <p className="text-xs text-gray-300 mt-1">{new Date(event.createdAt).toLocaleString('it-IT')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PrescriptionDetail;
