'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Mail, Heart, FlaskConical, Building2, LogIn, UserPlus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

const TYPE_LABELS = {
  owner_to_clinic: { from: 'Proprietario', to: 'Clinica', icon: Building2, color: 'coral', message: 'Un proprietario vuole collegare il Passport del suo animale alla tua clinica.' },
  clinic_to_owner: { from: 'Clinica', to: 'Proprietario', icon: Heart, color: 'emerald', message: 'Una clinica veterinaria ti invita su VetBuddy per gestire al meglio la salute del tuo animale.' },
  clinic_to_lab: { from: 'Clinica', to: 'Laboratorio', icon: FlaskConical, color: 'blue', message: 'Una clinica veterinaria vuole inviarti richieste digitali e ricevere referti tramite VetBuddy.' },
  lab_to_clinic: { from: 'Laboratorio', to: 'Clinica', icon: FlaskConical, color: 'purple', message: 'Un laboratorio partner ti invita su VetBuddy per gestire richieste e referti in modo digitale.' }
};

export default function ConnectAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [user, setUser] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!token) return;
    // Load invite
    fetch(`/api/connect/invite/${token}`)
      .then(async r => {
        const d = await r.json();
        if (r.status === 410) { setExpired(true); return; }
        if (d.error) { setError(d.error); return; }
        setInvite(d);
      })
      .catch(() => setError('Errore di connessione'))
      .finally(() => setLoading(false));

    // Check user logged in
    try {
      const userData = localStorage.getItem('vetbuddy_user');
      if (userData) setUser(JSON.parse(userData));
    } catch {}
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const stored = localStorage.getItem('vetbuddy_token');
      const r = await fetch('/api/connect/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(stored ? { Authorization: `Bearer ${stored}` } : {})
        },
        body: JSON.stringify({ token })
      });
      const d = await r.json();
      if (d.success) {
        setAccepted(true);
        setTimeout(() => router.push('/'), 2500);
      } else {
        setError(d.error || 'Errore durante l\'accettazione');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-orange-50 to-amber-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-coral-500" />
    </div>
  );

  if (expired) return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Invito scaduto</h2>
          <p className="text-gray-600 mb-6">Questo invito è scaduto. Chiedi a chi ti ha invitato di inviare un nuovo invito.</p>
          <Button onClick={() => router.push('/')} className="bg-coral-500 hover:bg-coral-600">Vai a VetBuddy</Button>
        </CardContent>
      </Card>
    </div>
  );

  if (error || !invite) return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Invito non trovato</h2>
          <p className="text-gray-600 mb-6">{error || 'Il link che stai cercando non esiste o è stato rimosso.'}</p>
          <Button onClick={() => router.push('/')} className="bg-coral-500 hover:bg-coral-600">Vai a VetBuddy</Button>
        </CardContent>
      </Card>
    </div>
  );

  if (accepted) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invito accettato! 🎉</h2>
          <p className="text-gray-600 mb-6">Ora sei collegato a <strong>{invite.fromName}</strong> nella rete VetBuddy.</p>
          <Loader2 className="h-5 w-5 animate-spin text-coral-500 mx-auto" />
          <p className="text-xs text-gray-500 mt-2">Reindirizzamento in corso...</p>
        </CardContent>
      </Card>
    </div>
  );

  const typeInfo = TYPE_LABELS[invite.type] || {};
  const Icon = typeInfo.icon || Mail;
  const expectedRole = invite.type === 'owner_to_clinic' || invite.type === 'lab_to_clinic' ? 'clinic'
                     : invite.type === 'clinic_to_owner' ? 'owner'
                     : invite.type === 'clinic_to_lab' ? 'lab' : 'clinic';
  const roleLabel = expectedRole === 'clinic' ? 'clinica' : expectedRole === 'lab' ? 'laboratorio' : 'proprietario';
  const userRoleMatches = user && (user.role === expectedRole || (expectedRole === 'clinic' && user.role === 'staff'));
  const userEmailMatches = user && user.email?.toLowerCase() === invite.toEmail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-orange-50 to-amber-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
            <Heart className="h-5 w-5 text-coral-500" />
            <span className="font-bold text-gray-800">VetBuddy</span>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className={`h-16 w-16 bg-${typeInfo.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`h-8 w-8 text-${typeInfo.color}-600`} />
              </div>
              <Badge className={`mb-3 bg-${typeInfo.color}-100 text-${typeInfo.color}-700`}>
                Invito {typeInfo.from} → {typeInfo.to}
              </Badge>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {invite.fromName} ti invita su VetBuddy
              </h1>
              <p className="text-gray-600">
                {typeInfo.message}
              </p>
            </div>

            {/* Personal message */}
            {invite.message && (
              <div className="bg-coral-50 border-l-4 border-coral-400 p-4 rounded-r-lg mb-6">
                <p className="text-sm text-gray-700 italic">&ldquo;{invite.message}&rdquo;</p>
              </div>
            )}

            {/* Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Da:</span>
                <span className="font-medium text-gray-800">{invite.fromName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Email destinatario:</span>
                <span className="font-medium text-gray-800">{invite.toEmail}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Ricevuto:</span>
                <span className="font-medium text-gray-800">{new Date(invite.createdAt).toLocaleDateString('it-IT')}</span>
              </div>
              {invite.status === 'accepted' && (
                <div className="pt-2 border-t">
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />Già accettato
                  </Badge>
                </div>
              )}
            </div>

            {/* Action */}
            {invite.status === 'accepted' ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Questo invito è già stato accettato.</p>
                <Button onClick={() => router.push('/')} className="bg-coral-500 hover:bg-coral-600">Vai alla Dashboard</Button>
              </div>
            ) : user ? (
              userRoleMatches ? (
                userEmailMatches ? (
                  <Button onClick={handleAccept} disabled={accepting} className="w-full bg-coral-500 hover:bg-coral-600 text-white py-6 text-base">
                    {accepting ? (
                      <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Accettazione in corso...</>
                    ) : (
                      <><CheckCircle className="h-5 w-5 mr-2" />Accetta invito</>
                    )}
                  </Button>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-amber-800 mb-2">
                      ⚠️ Sei loggato con <strong>{user.email}</strong> ma l&apos;invito è per <strong>{invite.toEmail}</strong>.
                    </p>
                    <p className="text-sm text-amber-700">Accedi con l&apos;email corretta per accettare.</p>
                  </div>
                )
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-amber-800 mb-3">
                    ⚠️ Hai un account <strong>{user.role}</strong> ma questo invito è per un account <strong>{roleLabel}</strong>.
                  </p>
                  <Button variant="outline" onClick={() => {
                    localStorage.removeItem('vetbuddy_token');
                    localStorage.removeItem('vetbuddy_user');
                    router.push(`/login?redirect=/connect/accept/${token}&role=${expectedRole}&email=${invite.toEmail}`);
                  }}>
                    Esci e registrati come {roleLabel}
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-center text-gray-600 mb-4">
                  Per accettare devi avere un account <strong>{roleLabel}</strong> su VetBuddy.
                </p>
                <Button
                  onClick={() => router.push(`/login?redirect=/connect/accept/${token}&role=${expectedRole}&email=${invite.toEmail}&mode=register`)}
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white py-6 text-base"
                >
                  <UserPlus className="h-5 w-5 mr-2" />Crea account {roleLabel} (gratis)
                </Button>
                <Button
                  onClick={() => router.push(`/login?redirect=/connect/accept/${token}&email=${invite.toEmail}`)}
                  variant="outline"
                  className="w-full py-6 text-base"
                >
                  <LogIn className="h-5 w-5 mr-2" />Ho già un account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          VetBuddy Connect — Cliniche, proprietari e laboratori. Tutti collegati.
        </p>
      </div>
    </div>
  );
}
