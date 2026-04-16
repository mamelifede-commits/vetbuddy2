'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, PawPrint, MapPin, Calendar, FileText, MessageCircle, Bell, Gift, Smartphone, ChevronRight, CheckCircle, Heart, Pill, CreditCard } from 'lucide-react';

export default function OwnerTutorialInline({ onClose }) {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    { icon: Smartphone, title: 'Registrazione e primo accesso', color: 'bg-blue-500', content: ['Vai su vetbuddy.it e clicca "Registrati"', 'Seleziona "Proprietario di Animali"', 'Inserisci email e crea una password sicura', 'Completa il profilo: nome, cognome, telefono', 'La registrazione e completamente gratuita e lo restera sempre'], tip: 'VetBuddy e gratuito per i proprietari. Nessun costo nascosto, mai.' },
    { icon: PawPrint, title: 'Aggiungere i tuoi animali', color: 'bg-green-500', content: ['Dalla dashboard clicca "I Miei Animali"', 'Premi "+" per aggiungere un nuovo animale', 'Inserisci: nome, specie, razza, data di nascita', 'Aggiungi peso, microchip e foto se disponibili', 'Indica allergie o condizioni particolari'], tip: 'Un profilo completo aiuta il veterinario a offrire cure migliori.' },
    { icon: MapPin, title: 'Prenotare con il link diretto', color: 'bg-indigo-500', content: ['Se la clinica ti ha inviato un link, aprilo nel browser', 'Compila il modulo: nome, telefono, animale, data preferita', 'La richiesta arriva alla clinica che ti contattera per confermare', 'Non serve un account VetBuddy per inviare una richiesta tramite link'], tip: 'Il link permette di inviare una richiesta rapida. La clinica conferma poi data e orario.' },
    { icon: Calendar, title: 'Gestire gli appuntamenti', color: 'bg-amber-500', content: ['Clicca su "Agenda" nella dashboard', 'Vedi appuntamenti confermati e in attesa', 'Ricevi promemoria automatici prima della visita', 'Lo stato si aggiorna in tempo reale'], tip: 'Controlla regolarmente la sezione Agenda per eventuali aggiornamenti.' },
    { icon: FileText, title: 'Documenti e referti', color: 'bg-red-500', content: ['Accedi a "I Miei Documenti" dalla dashboard', 'Trovi prescrizioni, referti, certificati e altri documenti', 'Scarica singoli PDF o tutti in formato ZIP', 'I documenti sono disponibili quando la clinica li pubblica'], tip: 'Trovi tutti i documenti in un unico posto, accessibili in qualsiasi momento.' },
    { icon: Heart, title: 'Referti di laboratorio', color: 'bg-purple-500', content: ['Nel profilo animale vai alla tab "Referti"', 'I referti lab sono visibili solo dopo la revisione del veterinario', 'Il veterinario puo aggiungere note cliniche', 'Ricevi una notifica quando un nuovo referto e disponibile'], tip: 'Il veterinario rivede ogni referto prima di renderlo visibile, garantendo un commento clinico.' },
    { icon: Pill, title: 'Prescrizioni elettroniche (REV)', color: 'bg-emerald-500', content: ['Quando il veterinario pubblica una prescrizione, ricevi una email', 'Nel profilo animale vai alla tab "Prescrizioni"', 'Consulta farmaci, posologia e durata del trattamento', 'Trovi N. ricetta e PIN per il ritiro in farmacia', 'Le prescrizioni sono visibili solo quando il veterinario le pubblica'], tip: 'Le informazioni sulle prescrizioni sono rese disponibili dal veterinario secondo il flusso previsto dal sistema nazionale.' },
    { icon: CreditCard, title: 'Pagamenti e fatture', color: 'bg-slate-500', content: ['I pagamenti per visite e servizi avvengono direttamente con la clinica', 'La clinica gestisce i propri metodi di pagamento', 'VetBuddy non e un intermediario di pagamento per i servizi veterinari', 'Eventuali documenti proforma sono consultabili nella sezione Fatture'], tip: 'Per chiarimenti sui pagamenti, fai riferimento direttamente alla tua clinica.' },
    { icon: MessageCircle, title: 'Messaggistica', color: 'bg-cyan-500', content: ['Vai su "Messaggi" per comunicare con la clinica', 'Scrivi messaggi e ricevi risposte dal team veterinario', 'Puoi allegare foto o documenti', 'Ricevi notifiche per nuovi messaggi'], tip: 'La messaggistica e utile per domande rapide senza dover telefonare.' },
    { icon: Gift, title: 'Programma fedelta', color: 'bg-pink-500', content: ['Accumula punti con le prenotazioni completate', 'Visualizza il saldo punti nella dashboard', 'I punti possono essere convertiti in vantaggi presso la clinica'], tip: 'Il programma fedelta e gestito dalla clinica. Verifica le condizioni attive con il tuo veterinario.' },
  ];

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/tutorials/download?type=owner');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vetbuddy_Tutorial_Proprietari.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Guida per Proprietari di Animali</h2>
          <p className="text-sm text-gray-500">Tutto quello che serve per gestire la salute dei tuoi animali, in un unico posto.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}><Download className="h-4 w-4 mr-1" />Scarica PDF</Button>
          {onClose && <Button variant="ghost" size="sm" onClick={onClose}>Chiudi</Button>}
        </div>
      </div>

      <div className="grid gap-3">
        {sections.map((s, idx) => {
          const Icon = s.icon;
          const isOpen = activeSection === idx;
          return (
            <Card key={idx} className={`cursor-pointer transition ${isOpen ? 'ring-2 ring-coral-200' : ''}`} onClick={() => setActiveSection(isOpen ? null : idx)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center`}><Icon className="h-4 w-4 text-white" /></div>
                  <h3 className="font-semibold text-gray-800 flex-1">{s.title}</h3>
                  <ChevronRight className={`h-4 w-4 text-gray-400 transition ${isOpen ? 'rotate-90' : ''}`} />
                </div>
                {isOpen && (
                  <div className="mt-3 ml-11 space-y-2">
                    {s.content.map((c, i) => (<p key={i} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-coral-400 mt-0.5">-</span>{c}</p>))}
                    {s.tip && <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded text-xs text-amber-700"><strong>Nota:</strong> {s.tip}</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
