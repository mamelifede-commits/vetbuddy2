'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, Clock, Mail, MapPin, Video } from 'lucide-react';
import api from '@/app/lib/api';

function InviteClinic({ user }) {
  const [email, setEmail] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !clinicName) {
      alert('Inserisci email e nome della clinica');
      return;
    }
    setSending(true);
    setError('');
    
    try {
      const response = await api.post('invite-clinic', {
        clinicName,
        clinicEmail: email,
        message,
        inviterName: user?.name || 'Un proprietario',
        inviterEmail: user?.email || ''
      });
      
      if (response.success) {
        setSent(true);
      } else {
        setError(response.message || 'Errore durante l\'invio');
      }
    } catch (err) {
      setError(err.message || 'Errore durante l\'invio dell\'invito');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-12 text-center">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invito inviato! 🎉</h2>
            <p className="text-gray-600 mb-6">
              Abbiamo inviato un invito a <strong>{clinicName}</strong>.
              <br/>Ti avviseremo quando si registreranno su vetbuddy!
            </p>
            <Button onClick={() => { setSent(false); setEmail(''); setClinicName(''); setMessage(''); }}>
              Invita un'altra clinica
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-4">
          <MapPin className="h-4 w-4" />
          <span className="font-medium">Pilot Milano</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Invita la tua clinica di fiducia</h2>
        <p className="text-gray-600">
          Non trovi il tuo veterinario su vetbuddy? Invitalo a unirsi al pilot!
          <br/>È completamente gratuito per le cliniche durante la fase beta.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome della clinica *</Label>
              <Input 
                value={clinicName} 
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Es: Clinica Veterinaria Milano"
                required
              />
            </div>
            <div>
              <Label>Email della clinica *</Label>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@clinica.it"
                required
              />
            </div>
            <div>
              <Label>Messaggio personale (opzionale)</Label>
              <Textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ciao! Sono un tuo cliente e vorrei prenotare le visite online..."
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={sending}>
              {sending ? <><Clock className="h-4 w-4 mr-2 animate-spin" />Invio in corso...</> : <><Mail className="h-4 w-4 mr-2" />Invia invito</>}
            </Button>
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 p-6 bg-blue-50 rounded-xl">
        <h3 className="font-semibold text-blue-800 mb-3">Perché invitare la tua clinica?</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-blue-500" />Prenota visite online 24/7 senza telefonare</li>
          <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-blue-500" />Ricevi promemoria automatici per vaccini e appuntamenti</li>
          <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-blue-500" />Accedi alla cartella clinica del tuo animale</li>
          <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-blue-500" />Ricevi documenti e referti direttamente nell'app</li>
        </ul>
      </div>
    </div>
  );
}

// Categorie servizi predefinite
const SERVICE_CATEGORIES = [
  { id: 'visita_generale', name: 'Visita generale', icon: '🩺', keywords: ['visita', 'controllo', 'check-up', 'generale'] },
  { id: 'vaccinazioni', name: 'Vaccinazioni', icon: '💉', keywords: ['vaccino', 'vaccinazione', 'richiamo', 'antirabbia', 'trivalente'] },
  { id: 'esami_diagnostica', name: 'Esami e diagnostica', icon: '🔬', keywords: ['esame', 'analisi', 'sangue', 'ecografia', 'radiografia', 'diagnostica'] },
  { id: 'chirurgia', name: 'Chirurgia', icon: '🏥', keywords: ['chirurgia', 'operazione', 'sterilizzazione', 'castrazione', 'intervento'] },
  { id: 'odontoiatria', name: 'Odontoiatria', icon: '🦷', keywords: ['denti', 'dentale', 'pulizia denti', 'odontoiatria', 'estrazione'] },
  { id: 'toelettatura', name: 'Toelettatura', icon: '✂️', keywords: ['toelettatura', 'bagno', 'tosatura', 'grooming', 'pelo'] },
  { id: 'dermatologia', name: 'Dermatologia', icon: '🐾', keywords: ['pelle', 'dermatologia', 'allergia', 'prurito', 'cute'] },
  { id: 'farmacia', name: 'Farmacia veterinaria', icon: '💊', keywords: ['farmaco', 'medicina', 'farmacia', 'ricetta'] },
  { id: 'emergenza', name: 'Pronto soccorso', icon: '🚨', keywords: ['emergenza', 'urgenza', 'pronto soccorso', 'h24'] },
  { id: 'certificati', name: 'Certificati e documenti', icon: '📋', keywords: ['certificato', 'passaporto', 'documento', 'microchip'] },
  { id: 'video_consulto', name: 'Video-consulto', icon: '📹', keywords: ['video', 'online', 'teleconsulto', 'remoto'] },
  { id: 'altro', name: 'Altro', icon: '📌', keywords: ['altro', 'vari'] },
];


export default InviteClinic;
