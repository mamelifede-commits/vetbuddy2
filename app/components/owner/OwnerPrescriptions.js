'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Pill, Calendar, CheckCircle, Clock, Copy, AlertCircle, Plus } from 'lucide-react';
import api from '@/app/lib/api';

const STATUS_LABELS = {
  DRAFT: 'In preparazione',
  EMITTED: 'Emessa',
  REGISTERED_MANUALLY: 'Registrata',
  ERROR: 'In lavorazione',
  CANCELLED: 'Annullata'
};

function OwnerPrescriptions({ petId }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    medication: '',
    reason: 'rinnovo',
    notes: ''
  });

  useEffect(() => {
    if (petId) loadPrescriptions();
  }, [petId]);

  const loadPrescriptions = async () => {
    try {
      const data = await api.get(`pets/${petId}/prescriptions`);
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPrescription = async () => {
    try {
      await api.post('prescription-requests', {
        petId,
        ...requestForm,
        status: 'pending',
        requestedAt: new Date().toISOString()
      });
      setShowRequestModal(false);
      setRequestForm({ medication: '', reason: 'rinnovo', notes: '' });
      alert('Richiesta inviata! La clinica ti contatterà a breve.');
    } catch (error) {
      console.error('Error requesting prescription:', error);
      alert('Errore durante l\'invio della richiesta');
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />Caricamento prescrizioni...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bottone Richiedi Ricetta */}
      <div className="flex justify-end">
        <Button onClick={() => setShowRequestModal(true)} className="bg-emerald-600">
          <Plus className="h-4 w-4 mr-2" />Richiedi Ricetta
        </Button>
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center py-8">
          <Pill className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Nessuna prescrizione disponibile</p>
          <p className="text-gray-400 text-xs mt-2">Clicca "Richiedi Ricetta" per chiedere una nuova prescrizione</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map(p => (
            <Card key={p.id} className="hover:shadow-md transition cursor-pointer"
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      p.status === 'EMITTED' || p.status === 'REGISTERED_MANUALLY' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Pill className={`h-5 w-5 ${
                        p.status === 'EMITTED' || p.status === 'REGISTERED_MANUALLY' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">
                          {(p.items || []).map(i => i.productName).join(', ') || 'Prescrizione'}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.status === 'EMITTED' || p.status === 'REGISTERED_MANUALLY' 
                            ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {STATUS_LABELS[p.status] || p.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {p.issueDate ? new Date(p.issueDate).toLocaleDateString('it-IT') : new Date(p.createdAt).toLocaleDateString('it-IT')}
                        {p.veterinarianName && <> — 👨‍⚕️ {p.veterinarianName}</>}
                      </p>
                    </div>
                  </div>
                  {p.externalPrescriptionNumber && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">N° Ricetta</p>
                      <p className="font-mono font-semibold text-emerald-700">{p.externalPrescriptionNumber}</p>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {expanded === p.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {p.diagnosisNote && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Diagnosi</p>
                        <p className="text-sm mt-1">{p.diagnosisNote}</p>
                      </div>
                    )}

                    {(p.items || []).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Farmaci prescritti</p>
                        {p.items.map((item, idx) => (
                          <div key={idx} className="p-2 bg-emerald-50 rounded-lg mb-1.5 text-sm">
                            <p className="font-medium text-emerald-800">💊 {item.productName}</p>
                            <p className="text-xs text-emerald-600">{item.quantity} {item.unit} — {item.posology}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {p.dosageInstructions && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Istruzioni</p>
                        <p className="text-sm mt-1">{p.dosageInstructions}</p>
                      </div>
                    )}

                    {p.treatmentDuration && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Durata trattamento</p>
                        <p className="text-sm mt-1">{p.treatmentDuration}</p>
                      </div>
                    )}

                    {(p.externalPrescriptionNumber || p.externalPin) && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="text-xs font-semibold text-green-700 uppercase mb-2">Dati Ricetta</h4>
                        {p.externalPrescriptionNumber && (
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-green-600">N° Ricetta:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-bold text-green-800">{p.externalPrescriptionNumber}</span>
                              <button onClick={(e) => { e.stopPropagation(); copyText(p.externalPrescriptionNumber); }}
                                className="text-green-400 hover:text-green-600"><Copy className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                        )}
                        {p.externalPin && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600">PIN:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-bold text-green-800">{p.externalPin}</span>
                              <button onClick={(e) => { e.stopPropagation(); copyText(p.externalPin); }}
                                className="text-green-400 hover:text-green-600"><Copy className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Richiesta Ricetta */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Richiedi Ricetta Veterinaria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Farmaco/Prodotto</Label>
              <Input
                value={requestForm.medication}
                onChange={(e) => setRequestForm({...requestForm, medication: e.target.value})}
                placeholder="Es: Antibiotico, Antiparassitario..."
              />
            </div>
            <div>
              <Label>Motivo</Label>
              <select
                value={requestForm.reason}
                onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="rinnovo">Rinnovo ricetta esistente</option>
                <option value="nuovo">Nuova prescrizione</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <Label>Note aggiuntive</Label>
              <Textarea
                value={requestForm.notes}
                onChange={(e) => setRequestForm({...requestForm, notes: e.target.value})}
                placeholder="Eventuali informazioni utili..."
                rows={3}
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              ℹ️ La clinica riceverà la tua richiesta e ti contatterà per valutare se è possibile emettere la ricetta.
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRequestModal(false)}>Annulla</Button>
              <Button onClick={handleRequestPrescription} disabled={!requestForm.medication}>
                Invia Richiesta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OwnerPrescriptions;
