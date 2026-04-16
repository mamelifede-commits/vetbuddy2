'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Pill, Calendar, CheckCircle, Clock, Copy, AlertCircle } from 'lucide-react';
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

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-8">
        <Pill className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Nessuna prescrizione disponibile</p>
      </div>
    );
  }

  return (
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
  );
}

export default OwnerPrescriptions;
