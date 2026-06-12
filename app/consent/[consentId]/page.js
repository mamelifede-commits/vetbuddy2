'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function ConsentSignPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const consentId = params.consentId;
  const token = searchParams.get('t');

  const [consent, setConsent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signed, setSigned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [signedName, setSignedName] = useState('');

  useEffect(() => {
    if (!consentId || !token) { setError('Link non valido'); setLoading(false); return; }
    fetch(`/api/consents?id=${consentId}&t=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else {
          setConsent(d.consent);
          if (d.consent.status === 'firmato') setSigned(true);
        }
        setLoading(false);
      })
      .catch(() => { setError('Errore di caricamento'); setLoading(false); });
  }, [consentId, token]);

  const sign = async () => {
    if (!accepted) { alert('Devi confermare di aver letto e accettato il documento'); return; }
    if (!signedName || signedName.trim().length < 3) { alert('Inserisci nome e cognome'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: consentId, token, sign: true, signedName: signedName.trim() })
      });
      const d = await res.json();
      if (d.success) setSigned(true);
      else alert(d.error || 'Errore durante la firma');
    } catch (e) {
      alert('Errore di rete, riprova');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">Caricamento...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="bg-white p-8 rounded-2xl shadow text-center max-w-md"><p className="text-4xl mb-3">\u{1F615}</p><p className="text-gray-700 font-semibold">{error}</p></div></div>;

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <p className="text-5xl mb-4">\u2705</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Documento Firmato</h1>
          <p className="text-gray-600">{consent?.title} {consent?.petName ? `per ${consent.petName}` : ''} \u00e8 stato firmato e archiviato. {consent?.clinicName || 'La clinica'} ha ricevuto conferma.</p>
          {consent?.signedName && <p className="text-sm text-gray-400 mt-3">Firmato da {consent.signedName}{consent.signedAt ? ` il ${new Date(consent.signedAt).toLocaleString('it-IT')}` : ''}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
            <h1 className="text-xl font-bold">\u270D\uFE0F {consent?.title}</h1>
            <p className="text-blue-100 mt-1">{consent?.clinicName} {consent?.petName ? `\u2022 ${consent.petName}` : ''}</p>
          </div>
          <div className="p-6 space-y-4">
            {consent?.detail && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-800">Oggetto: {consent.detail}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
              {consent?.text}
            </div>
            {consent?.notes && (
              <div className="text-sm text-gray-500"><strong>Note della clinica:</strong> {consent.notes}</div>
            )}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 h-5 w-5" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
              <span className="text-sm text-gray-700">Dichiaro di aver letto e compreso il documento e di accettarne il contenuto.</span>
            </label>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome e cognome (firma) *</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Es. Mario Rossi" value={signedName} onChange={e => setSignedName(e.target.value)} />
            </div>
            <p className="text-xs text-gray-400">Firmando confermi la tua identit\u00e0 e accetti il documento (firma elettronica semplice con data e ora). Per qualsiasi dubbio contatta prima la clinica.</p>
            <button onClick={sign} disabled={saving} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Firma in corso...' : '\u270D\uFE0F Firma il Documento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
