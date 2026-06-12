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
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (uploads.length >= 3) { alert('Massimo 3 allegati per modulo'); return; }
    if (file.size > 20 * 1024 * 1024) { alert('File troppo grande: massimo 20MB'); return; }
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) { alert('Sono ammessi solo foto e video'); return; }

    const CHUNK = 512 * 1024;
    const totalChunks = Math.ceil(file.size / CHUNK) || 1;
    const uploadId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    setUploading(true);
    setUploadProgress(0);
    try {
      for (let i = 0; i < totalChunks; i++) {
        const slice = file.slice(i * CHUNK, (i + 1) * CHUNK);
        const dataBase64 = await blobToBase64(slice);
        const res = await fetch('/api/previsit/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formId, token, uploadId, chunkIndex: i, totalChunks, fileName: file.name, mimeType: file.type, dataBase64 })
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Errore durante il caricamento');
        setUploadProgress(Math.round(((i + 1) / totalChunks) * 100));
      }
      setUploads(prev => [...prev, { id: uploadId, name: file.name, size: file.size, type: file.type }]);
    } catch (err) {
      alert(err.message || 'Errore durante il caricamento, riprova');
    } finally {
      setUploading(false);
    }
  };

  const removeUpload = async (mediaId) => {
    try {
      await fetch(`/api/previsit/upload?mediaId=${mediaId}&t=${token}`, { method: 'DELETE' });
      setUploads(prev => prev.filter(u => u.id !== mediaId));
    } catch (e) { /* best effort */ }
  };

  const formatSize = (bytes) => bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;

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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">📷 Foto o video (opzionale)</label>
              <p className="text-xs text-gray-500 mb-2">Una foto della zona interessata o un breve video del comportamento aiuta molto il veterinario. Max 3 file da 20MB.</p>
              {uploads.length > 0 && (
                <div className="space-y-2 mb-3">
                  {uploads.map(u => (
                    <div key={u.id} className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span>{u.type.startsWith('video/') ? '🎬' : '🖼️'}</span>
                        <span className="text-sm text-gray-700 truncate">{u.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">{formatSize(u.size)}</span>
                      </div>
                      <button type="button" onClick={() => removeUpload(u.id)} className="text-red-500 hover:text-red-700 text-sm font-bold px-2" title="Rimuovi">✕</button>
                    </div>
                  ))}
                </div>
              )}
              {uploading ? (
                <div className="border border-purple-300 rounded-lg p-3 bg-purple-50">
                  <p className="text-sm text-purple-700 mb-2">Caricamento in corso... {uploadProgress}%</p>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : uploads.length < 3 ? (
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-purple-300 rounded-lg p-4 cursor-pointer hover:bg-purple-50 transition text-purple-600 font-medium text-sm">
                  📎 Aggiungi foto o video
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
                </label>
              ) : (
                <p className="text-xs text-gray-400">Hai raggiunto il limite di 3 allegati.</p>
              )}
            </div>
            <p className="text-xs text-gray-400">Le informazioni raccolte servono solo a preparare la visita e non costituiscono diagnosi. In caso di emergenza contatta direttamente la clinica.</p>
            <button onClick={submit} disabled={saving || uploading} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Invio in corso...' : '✉️ Invia alla Clinica'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
