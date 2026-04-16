'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, PawPrint, MapPin, Calendar, FileText, MessageCircle, Bell, Gift, Smartphone, ChevronRight, CheckCircle, Heart, Pill, CreditCard } from 'lucide-react';

export default function OwnerTutorialInline({ onClose }) {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    { icon: Smartphone, title: 'Registrazione e primo accesso', color: 'bg-blue-500', content: ['Vai su vetbuddy.it e clicca \u201CRegistrati\u201D', 'Seleziona \u201CProprietario di Animali\u201D', 'Inserisci email e crea una password sicura', 'Completa il profilo: nome, cognome, telefono', 'La registrazione \u00E8 gratuita per i proprietari'], tip: 'VetBuddy \u00E8 gratuito per i proprietari. Nessun costo nascosto.' },
    { icon: PawPrint, title: 'Aggiungere i tuoi animali', color: 'bg-green-500', content: ['Dalla dashboard clicca su \u201CI Miei Animali\u201D', 'Premi \u201C+\u201D per aggiungere un nuovo animale', 'Inserisci: nome, specie, razza, data di nascita', 'Aggiungi peso, numero microchip e foto se disponibili', 'Indica eventuali allergie o condizioni particolari', 'VetBuddy supporta cani, gatti, conigli, cavalli, uccelli, rettili e altri'], tip: 'Un profilo completo aiuta il veterinario a offrire cure migliori.' },
    { icon: MapPin, title: 'Prenotare con il link diretto', color: 'bg-indigo-500', content: ['Se la tua clinica ti ha inviato un link, aprilo nel browser', 'Vedrai il profilo della clinica con servizi e disponibilit\u00E0', 'Compila il modulo: nome, telefono, animale, data preferita', 'La richiesta arriva alla clinica, che ti contatter\u00E0 per confermare', 'Non serve un account VetBuddy per inviare una richiesta tramite link'], tip: 'Il link diretto permette di inviare una richiesta rapida. La clinica conferma poi data e orario.' },
    { icon: Calendar, title: 'Gestire gli appuntamenti', color: 'bg-amber-500', content: ['Clicca su \u201CAgenda\u201D nella dashboard', 'Vedi tutti gli appuntamenti confermati e in attesa', 'Ricevi promemoria automatici prima della visita', 'Lo stato dell\u2019appuntamento si aggiorna in tempo reale'], tip: 'Controlla regolarmente la sezione Agenda per eventuali aggiornamenti.' },
    { icon: FileText, title: 'Documenti e referti', color: 'bg-red-500', content: ['Accedi a \u201CI Miei Documenti\u201D dalla dashboard', 'Trovi prescrizioni, referti, certificati e altri documenti', 'Scarica singoli documenti in PDF o tutti insieme in formato ZIP', 'I documenti sono disponibili quando la clinica li pubblica'], tip: 'Trovi tutti i documenti in un unico posto, accessibili in qualsiasi momento.' },
    { icon: Heart, title: 'Referti di laboratorio', color: 'bg-purple-500', content: ['Apri il profilo del tuo animale e vai alla tab \u201CReferti\u201D', 'I referti di laboratorio sono visibili solo dopo la revisione del veterinario', 'Il veterinario pu\u00F2 aggiungere note cliniche per aiutarti a comprendere i risultati', 'Ricevi una notifica quando un nuovo referto \u00E8 disponibile', 'Puoi scaricare il referto PDF per i tuoi archivi'], tip: 'Il veterinario rivede ogni referto prima di renderlo visibile. Questo garantisce che le informazioni siano accompagnate da un commento clinico.' },
    { icon: Pill, title: 'Prescrizioni elettroniche (REV)', color: 'bg-emerald-500', content: ['Quando il veterinario pubblica una prescrizione, ricevi una notifica email', 'Apri il profilo del tuo animale e vai alla tab \u201CPrescrizioni\u201D', 'Consulta i dettagli: farmaci, posologia, durata del trattamento', 'Trovi il numero ricetta e PIN utili per il ritiro in farmacia', 'Le prescrizioni sono visibili solo quando il veterinario decide di pubblicarle'], tip: 'Le informazioni sulle prescrizioni sono rese disponibili dal veterinario secondo il flusso previsto dal sistema nazionale.' },
    { icon: CreditCard, title: 'Pagamenti e fatture', color: 'bg-slate-500', content: ['I pagamenti per visite e servizi avvengono direttamente con la clinica', 'La clinica gestisce i propri metodi di pagamento (contanti, carta, bonifico)', 'VetBuddy non \u00E8 un intermediario di pagamento per i servizi veterinari', 'Eventuali documenti di cortesia (proforma) possono essere consultati nella sezione Fatture'], tip: 'Per qualsiasi chiarimento sui pagamenti, fai riferimento direttamente alla tua clinica.' },
    { icon: MessageCircle, title: 'Messaggistica', color: 'bg-cyan-500', content: ['Vai su \u201CMessaggi\u201D per comunicare con la clinica', 'Scrivi messaggi e ricevi risposte dal team veterinario', 'Puoi allegare foto o documenti ai messaggi', 'Ricevi notifiche per ogni nuovo messaggio ricevuto'], tip: 'La messaggistica \u00E8 utile per domande rapide senza dover telefonare.' },
    { icon: Gift, title: 'Programma fedelt\u00E0', color: 'bg-pink-500', content: ['Accumula punti con le prenotazioni completate', 'Visualizza il tuo saldo punti nella dashboard', 'I punti possono essere convertiti in vantaggi presso la clinica', 'Consulta i dettagli del programma nella sezione dedicata'], tip: 'Il programma fedelt\u00E0 \u00E8 gestito dalla clinica. Verifica con il tuo veterinario le condizioni attive.' },
  ];

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/tutorials/download?type=owner');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'VetBuddy_Guida_Proprietari.pdf';
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
