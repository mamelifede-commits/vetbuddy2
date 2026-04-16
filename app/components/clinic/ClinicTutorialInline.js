'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Building2, Calendar, FileText, Receipt, CreditCard, MessageCircle, Zap, BarChart3, ChevronRight, Link, FlaskConical, Pill, Shield, CheckSquare, Sparkles } from 'lucide-react';
import api from '@/app/lib/api';

export default function ClinicTutorialInline({ onClose }) {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    { icon: Building2, title: 'Configurazione iniziale', color: 'bg-blue-500', content: ['Registrati come clinica su vetbuddy.it', 'Completa il profilo: nome clinica, indirizzo, P.IVA, orari di apertura', 'Carica il logo e le foto della struttura', 'Configura i servizi offerti con prezzi e durata stimata', 'Pilot Milano: Piano Pro Clinica gratuito per 90 giorni', 'Dopo il periodo gratuito: \u20AC79/mese + IVA (\u20AC49/mese per early adopter)'], tip: 'Un profilo completo e professionale aiuta i clienti a scegliere la tua clinica.' },
    { icon: Link, title: 'Link di prenotazione diretto', color: 'bg-indigo-500', content: ['Vai su \u201CLink Prenotazione\u201D nel menu laterale', 'Trovi il link personalizzato della tua clinica', 'Condividilo su WhatsApp, social, email o sito web', 'Puoi generare un QR Code da stampare in reception', 'I clienti possono inviare una richiesta rapida senza registrarsi', 'Le richieste arrivano nella tua agenda e le confermi tu'], tip: 'Il link permette ai clienti di inviare una richiesta rapida. La clinica conferma poi data, orario e disponibilit\u00E0.' },
    { icon: Calendar, title: 'Gestione appuntamenti', color: 'bg-green-500', content: ['Visualizza il calendario dalla dashboard principale', 'Gestisci le viste: giornaliera, settimanale o mensile', 'Clicca su uno slot vuoto per creare un appuntamento', 'Gestisci le richieste in arrivo: accetta, rifiuta o riprogramma', 'Aggiungi note interne per ogni appuntamento', 'Le prenotazioni dal link diretto sono contrassegnate come tali'], tip: 'Usa i codici colore per distinguere i tipi di appuntamento e servizio.' },
    { icon: FileText, title: 'Gestione clienti e pazienti', color: 'bg-teal-500', content: ['Accedi a \u201CPazienti\u201D per consultare l\u2019elenco clienti', 'Visualizza la scheda completa di ogni animale', 'Consulta lo storico visite, trattamenti e documenti', 'Importa clienti da file CSV per migrare da altri gestionali', 'Esporta i dati per backup o per esigenze amministrative'], tip: 'La funzione import CSV consente di migrare dati da altri sistemi in modo semplice.' },
    { icon: FileText, title: 'Documenti e PDF', color: 'bg-amber-500', content: ['Vai a \u201CDocumenti\u201D dalla dashboard', 'Crea documenti: prescrizioni, referti, certificati, vaccinazioni', 'Carica PDF esistenti o genera da template', 'Associa il documento al paziente e al proprietario', 'Il documento viene inviato automaticamente via email'], tip: 'I documenti digitali aiutano a ridurre richieste ripetitive e telefonate non necessarie.' },
    { icon: FlaskConical, title: 'Lab Marketplace \u2014 Analisi di laboratorio', color: 'bg-purple-500', content: ['Vai su \u201CAnalisi Lab\u201D nel menu laterale', 'Sfoglia i laboratori partner disponibili nel marketplace', 'Crea una richiesta di analisi selezionando paziente ed esame', 'Segui lo stato della richiesta in tempo reale', 'Ricevi il referto quando il laboratorio lo carica', 'Rivedi il referto, aggiungi note cliniche e decidi quando renderlo visibile al proprietario'], tip: 'I referti di laboratorio restano riservati fino a quando non li rivedi e li approvi. Il proprietario vede solo ci\u00F2 che tu decidi di pubblicare.' },
    { icon: Pill, title: 'Ricette Elettroniche Veterinarie (REV)', color: 'bg-emerald-500', content: ['Vai su \u201CPrescrizioni REV\u201D nel menu laterale', 'Prepara la bozza con il wizard guidato: paziente, farmaci, posologia, diagnosi', 'Completa l\u2019emissione ufficiale sul portale del sistema nazionale (es. Vetinfo)', 'Registra il numero ricetta e PIN in VetBuddy', 'Pubblica al proprietario quando opportuno: riceve email e consulta nel profilo', 'Dashboard statistiche: bozze, emesse, errori, totale', 'Audit trail completo di ogni passaggio', 'Configura il modulo da \u201CImpostazioni REV\u201D'], tip: 'L\u2019emissione ufficiale della REV richiede l\u2019abilitazione del medico veterinario al sistema nazionale. VetBuddy prepara, organizza e archivia il flusso, ma non sostituisce il sistema pubblico di emissione.' },
    { icon: Receipt, title: 'Fatturazione proforma', color: 'bg-orange-500', content: ['Vai a \u201CFatturazione\u201D nella dashboard', 'Crea una nuova fattura proforma selezionando il cliente', 'Aggiungi servizi prestati con prezzi e quantit\u00E0', 'Genera il documento PDF con tutti i dati', 'Esporta i dati per backup o per esigenze amministrative'], tip: 'Le fatture proforma sono documenti di cortesia e non hanno valore fiscale. La fattura fiscale va emessa secondo le normative vigenti.' },
    { icon: BarChart3, title: 'Dashboard metriche', color: 'bg-cyan-500', content: ['Vai su \u201CMetriche\u201D nel menu laterale', 'Visualizza i dati principali: appuntamenti, pazienti, documenti', 'Consulta l\u2019andamento nel tempo', 'Analizza le prenotazioni per canale di provenienza', 'Monitora le richieste lab e lo stato di completamento'], tip: 'Le metriche aiutano a comprendere il valore generato dalla piattaforma e a identificare aree di miglioramento.' },
    { icon: CreditCard, title: 'Abbonamento e pagamenti', color: 'bg-slate-500', content: ['Starter Clinica: \u20AC0/mese (funzionalit\u00E0 base, 1 utente)', 'Pro Clinica: \u20AC79/mese + IVA (\u20AC49/mese per early adopter)', 'Pilot Milano: Piano Pro gratuito per 90 giorni', 'Pagamento sicuro con carta tramite Stripe', 'I pagamenti dei clienti alla clinica non passano da VetBuddy', 'VetBuddy incassa esclusivamente l\u2019abbonamento della piattaforma'], tip: 'Tutti i prezzi indicati sono IVA esclusa. Puoi annullare l\u2019abbonamento in qualsiasi momento.' },
    { icon: Zap, title: 'Automazioni (Piano Pro)', color: 'bg-yellow-500', content: ['Promemoria automatici prima dell\u2019appuntamento via email', 'Follow-up post visita con istruzioni personalizzabili', 'Reminder per vaccini e controlli periodici', 'Report settimanale automatico con riepilogo attivit\u00E0', 'Notifiche per nuove richieste dal Lab Marketplace'], tip: 'Le automazioni aiutano la clinica a risparmiare tempo nelle attivit\u00E0 ripetitive e a mantenere una comunicazione costante con i clienti.' },
  ];

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/tutorials/download?type=clinic');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'VetBuddy_Guida_Cliniche.pdf';
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
          <h2 className="text-xl font-bold text-gray-800">Guida per Cliniche Veterinarie</h2>
          <p className="text-sm text-gray-500">La piattaforma digitale che semplifica la gestione quotidiana della clinica.</p>
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
