'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

const FIELDS = [
  { key: 'reason', label: 'Motivo della visita *', type: 'text', placeholder: 'Es. controllo, vaccino, zoppia...' },
  { key: 'symptoms', label: 'Sintomi principali', type: 'textarea', placeholder: 'Descrivi cosa hai notato (se nulla, scrivi "nessuno")' },
  { key: 'symptomsSince', label: 'Da quando sono presenti?', type: 'text', placeholder: 'Es. 3 giorni, 2 settimane...' },
  { key: 'medications', label: 'Farmaci già assunti', type: 'text', placeholder: 'Nome farmaci e dosaggio, se presenti' },
  { key: 'conditions', label: 'Patologie note', type: 'text', placeholder: 'Es. allergie cutanee, problemi renali...' },
  { key: 'allergies', label: 'Allergie', type: 'text', placeholder: 'Allergie note a farmaci o alimenti' },
  { key: 'diet', label: 'Alimentazione', type: 'text', placeholder: 'Cosa mangia abitualmente' },
  { key: 'behavior', label: 'Comportamento recente', type: 'text', placeholder: 'Es. apatico, vivace, mangia meno...' },
];

export default function PrevisitFormPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const formId = params.formId;
  const token = searchParams.get('t');

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState({ reason: '', symptoms: '', symptomsSince: '', medications: '', conditions: '', allergies: '', diet: '', behavior: '', urgency: 'Bassa', notes: '' });

  useEffect(() => {
    if (!formId || !token) { setError('Link non valido'); setLoading(false); return; }
    fetch(`/api/previsit?id=${formId}&t=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); }
        else {
          setForm(d.form);
          if (d.form.status === 'compilato' || d.form.status === 'da_revisionare') setSubmitted(true);
          if (d.form.reason) setAnswers(a => ({ ...a, reason: d.form.reason }));
        }
        setLoading(false);
      })
      .catch(() => { setError('Errore di caricamento'); setLoading(false); });
  }, [formId, token]);

  const submit = async () => {
    if (!answers.reason) { alert('Indica il motivo della visita'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/previsit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: formId, token, answers })
      });
      const d = await res.json();
      if (d.success) setSubmitted(true);
      else alert(d.error || 'Errore durante l\'invio');
    } catch (e) {
      alert('Errore di rete, riprova');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">Caricamento...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="bg-white p-8 rounded-2xl shadow text-center max-w-md"><p className="text-4xl mb-3">😕</p><p className="text-gray-700 font-semibold">{error}</p></div></div>;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <p className="text-5xl mb-4">✅</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Grazie!</h1>
          <p className="text-gray-600">Il modulo pre-visita {form?.petName ? `di ${form.petName}` : ''} è stato inviato a {form?.clinicName || 'alla clinica'}. Il veterinario arriverà preparato alla visita!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
            <h1 className="text-2xl font-bold">📋 Modulo Pre-Visita</h1>
            <p className="text-purple-100 mt-1">{form?.petName ? `Per ${form.petName}` : ''} {form?.appointmentDate ? `• Appuntamento del ${form.appointmentDate}` : ''} • {form?.clinicName || ''}</p>
          </div>
          <div className="p-6 space-y-4">
            {FIELDS.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" rows={3} placeholder={f.placeholder} value={answers[f.key]} onChange={e => setAnswers({ ...answers, [f.key]: e.target.value })} />
                ) : (
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" placeholder={f.placeholder} value={answers[f.key]} onChange={e => setAnswers({ ...answers, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quanto ti sembra urgente? *</label>
              <div className="flex gap-2">
                {['Bassa', 'Media', 'Alta'].map(u => (
                  <button key={u} type="button" onClick={() => setAnswers({ ...answers, urgency: u })} className={`flex-1 py-2 rounded-lg border font-medium transition ${answers.urgency === u ? (u === 'Alta' ? 'bg-red-500 text-white border-red-500' : u === 'Media' ? 'bg-amber-500 text-white border-amber-500' : 'bg-green-500 text-white border-green-500') : 'bg-white text-gray-600 border-gray-300'}`}>{u}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Note libere</label>
              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" rows={3} placeholder="Qualsiasi altra informazione utile..." value={answers.notes} onChange={e => setAnswers({ ...answers, notes: e.target.value })} />
            </div>
            <p className="text-xs text-gray-400">Le informazioni raccolte servono solo a preparare la visita e non costituiscono diagnosi. In caso di emergenza contatta direttamente la clinica.</p>
            <button onClick={submit} disabled={saving} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Invio in corso...' : '✉️ Invia alla Clinica'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
