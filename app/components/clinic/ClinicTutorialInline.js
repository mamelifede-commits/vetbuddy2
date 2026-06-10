'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Building2, Calendar, FileText, Receipt, CreditCard, MessageCircle, Zap, BarChart3, ChevronRight, Link, FlaskConical, Pill, Shield, Heart, Brain, Inbox } from 'lucide-react';

export default function ClinicTutorialInline({ onClose }) {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    { icon: Building2, title: 'Configurazione iniziale', color: 'bg-blue-500', content: ['Registrati come clinica su vetbuddy.it', 'Completa il profilo: nome clinica, indirizzo, P.IVA, orari di apertura', 'Carica il logo e le foto della struttura', 'Configura i servizi offerti con prezzi e durata stimata', 'Pilot Milano: Piano Growth gratuito per 90 giorni', 'Piani: Starter \u20AC29/mese, Growth \u20AC69/mese, Pro \u20AC99/mese (IVA esclusa)'], tip: 'Un profilo completo e professionale aiuta i clienti a scegliere la tua clinica.' },
    { icon: Link, title: 'Link di prenotazione diretto', color: 'bg-indigo-500', content: ['Vai su \u201CLink Prenotazione\u201D nel menu laterale', 'Trovi il link personalizzato della tua clinica', 'Condividilo su WhatsApp, social, email o sito web', 'Puoi generare un QR Code da stampare in reception', 'I clienti inviano una richiesta rapida senza registrarsi', 'Le richieste arrivano nella tua agenda e le confermi tu'], tip: 'Il link permette ai clienti di inviare una richiesta rapida. La clinica conferma poi data, orario e disponibilit\u00E0.' },
    { icon: Calendar, title: 'Gestione appuntamenti', color: 'bg-green-500', content: ['Visualizza il calendario dalla dashboard principale', 'Gestisci le viste: giornaliera, settimanale o mensile', 'Clicca su uno slot vuoto per creare un appuntamento', 'Gestisci le richieste in arrivo: accetta, rifiuta o riprogramma', 'Aggiungi note interne per ogni appuntamento'], tip: 'Usa i codici colore per distinguere i tipi di appuntamento e servizio.' },
    { icon: FileText, title: 'Gestione clienti e pazienti', color: 'bg-teal-500', content: ['Accedi a \u201CPazienti\u201D per consultare l\u2019elenco clienti', 'Visualizza la scheda completa di ogni animale', 'Consulta lo storico visite, trattamenti e documenti', 'Importa clienti da file CSV per migrare da altri gestionali'], tip: 'La funzione import CSV consente di migrare dati da altri sistemi in modo semplice.' },
    { icon: FileText, title: 'Documenti e PDF', color: 'bg-amber-500', content: ['Vai a \u201CDocumenti\u201D dalla dashboard', 'Crea documenti: prescrizioni, referti, certificati, vaccinazioni', 'Carica PDF esistenti o genera da template', 'Il documento viene inviato automaticamente via email'], tip: 'I documenti digitali riducono richieste ripetitive e telefonate non necessarie.' },
    { icon: FlaskConical, title: 'Lab Marketplace', color: 'bg-purple-500', content: ['Sfoglia i laboratori partner nel marketplace', 'Crea una richiesta di analisi selezionando paziente ed esame', 'Segui lo stato della richiesta in tempo reale', 'Ricevi il referto, aggiungi note cliniche e pubblica al proprietario'], tip: 'I referti restano riservati fino alla tua revisione.' },
    { icon: Pill, title: 'Ricette Elettroniche (REV)', color: 'bg-emerald-500', content: ['Prepara la bozza con il wizard guidato', 'Completa l\u2019emissione sul portale nazionale (Vetinfo)', 'Registra numero ricetta e PIN in VetBuddy', 'Pubblica al proprietario quando opportuno', 'Audit trail completo di ogni passaggio'], tip: 'VetBuddy prepara e archivia il flusso. L\u2019emissione ufficiale \u00E8 responsabilit\u00E0 del veterinario.' },
    { icon: Heart, title: 'Piani Salute', color: 'bg-rose-500', content: ['Crea programmi di prevenzione strutturati (Cucciolo, Senior, Prevenzione)', 'Personalizza servizi inclusi: visite, vaccini, esami, trattamenti', 'Assegna un piano a un paziente e monitora il progresso', 'Segna i servizi completati con un click', 'Dashboard con statistiche: piani attivi, servizi prossimi 30gg'], tip: 'I piani salute fidelizzano i clienti e generano appuntamenti ricorrenti.' },
    { icon: Inbox, title: 'Team Inbox avanzata', color: 'bg-sky-500', content: ['Gestisci messaggi come ticket: Nuovo, In lavorazione, Risolto', 'Assegna ticket ai membri del team', 'Imposta priorit\u00E0: Bassa, Media, Alta', 'Rispondi usando template rapidi predefiniti', 'Filtra per stato, priorit\u00E0 o messaggi non letti'], tip: 'La Team Inbox aiuta a non perdere nessun messaggio e a coordinare il team.' },
    { icon: Brain, title: 'AI Assistant', color: 'bg-violet-500', content: ['Riassumi Visita: riassunto strutturato dalle note cliniche', 'Scrivi Messaggio: comunicazioni professionali per i proprietari', 'Traduci Note Cliniche: da termini tecnici a linguaggio semplice', 'Risposta Intelligente: risposte ai messaggi dei clienti', 'Copia il risultato con un click'], tip: 'L\u2019AI \u00E8 un assistente: il risultato va sempre rivisto dal medico veterinario.' },
    { icon: Zap, title: 'Automazioni configurabili', color: 'bg-yellow-500', content: ['Follow-up post visita personalizzabili (timing e messaggio)', 'Reminder per vaccini e controlli periodici', 'Configura timing, canale (email/app) e template per ogni automazione', 'Cronologia esecuzioni: vedi quando ogni automazione si \u00E8 attivata'], tip: 'Le automazioni riducono il tempo dedicato alle attivit\u00E0 ripetitive.' },
    { icon: BarChart3, title: 'Dashboard Valore Generato', color: 'bg-cyan-500', content: ['Tempo risparmiato grazie alle automazioni', 'Telefonate evitate e appuntamenti generati', 'Stima del fatturato generato dalla piattaforma', 'Dati aggiornati in tempo reale'], tip: 'La Dashboard Valore ti aiuta a capire il ritorno sull\u2019investimento.' },
    { icon: MessageCircle, title: 'Task Manager Staff', color: 'bg-slate-600', content: ['Visualizza task operativi automatici: follow-up, preventivi, referti lab, passport', 'Crea task manuali per richiami clienti o attivit\u00E0 interne', 'Assegna priorit\u00E0: Alta, Media, Bassa', 'Filtra per priorit\u00E0, staff assegnato o scadenza', 'Segna task come completati'], tip: 'I task automatici aiutano a non dimenticare nessuna attivit\u00E0 operativa importante.' },
    { icon: MessageCircle, title: 'Campagne Clienti', color: 'bg-orange-600', content: ['5 campagne pronte: dentale, vaccini, sterilizzazione, antiparassitari, senior', 'VetBuddy identifica automaticamente i clienti target', 'Anteprima messaggi prima dell\u2019invio', 'Invio Email o WhatsApp con un click', 'Tracking risultati: aperture, click, conversioni'], tip: 'Le campagne mirate aumentano le prenotazioni per servizi specifici.' },
    { icon: MessageCircle, title: 'Mini CRM Proprietari', color: 'bg-cyan-600', content: ['Etichette automatiche: Attivo, Alto Rischio, Promoter, VIP, Inattivo', 'Relationship score (0-100) per ogni cliente', 'Lifetime value (\u20AC) e numero visite totali', 'Filtra clienti per etichetta o score', 'Dashboard CRM insights nella scheda cliente'], tip: 'Il Mini CRM aiuta a identificare i clienti migliori e prevenire abbandoni.' },
    { icon: MessageCircle, title: 'Dimissioni & Follow-up', color: 'bg-green-600', content: ['Crea pacchetto dimissioni dopo visite/chirurgie', 'Inserisci istruzioni dettagliate e terapie', 'Programma follow-up automatici 24h o 48h', 'Template chiamata con domande chiave', 'Genera PDF dimissione per il proprietario'], tip: 'Follow-up strutturati migliorano la soddisfazione clienti e riducono emergenze.' },
    { icon: MessageCircle, title: 'Stock Leggero Vaccini', color: 'bg-purple-600', content: ['Inventario solo vaccini e materiali critici', 'Alert automatici: scorte basse, scadenze 30/60gg', 'Movimenti carico/scarico con storico', 'Tracking lotti, fornitori e ubicazione fisica', 'Export Excel per report'], tip: 'Non \u00E8 un gestionale completo: traccia solo vaccini e materiali essenziali.' },
    { icon: MessageCircle, title: 'Preventivi Online', color: 'bg-blue-600', content: ['Crea preventivo digitale per procedure', 'Invia link sicuro al proprietario', 'Proprietario approva online con firma digitale', 'Tracking stati: Pending, Approved, Rejected', 'Converti preventivo approvato in fattura'], tip: 'Preventivi online accelerano il processo decisionale e riducono telefonate.' },
    { icon: MessageCircle, title: 'Smart Visit Pack', color: 'bg-indigo-500', content: ['Timeline unificata: Check-in \u2192 Questionario \u2192 Visita \u2192 Dimissioni', 'Visualizza tutte le visite di oggi con stati real-time', 'Dashboard con contatori per ogni fase', 'Azioni rapide per ogni fase della visita', 'Tabs: Timeline, Attive, Completate'], tip: 'Smart Visit Pack semplifica la gestione del flusso visite giornaliero.' },
    { icon: CreditCard, title: 'Abbonamento', color: 'bg-slate-500', content: ['Starter: \u20AC29/mese (1 utente, fino a 30 prenotazioni/mese)', 'Growth: \u20AC69/mese (fino a 5 utenti, tutti i moduli) \u2014 Consigliato', 'Pro: \u20AC99/mese (fino a 15 utenti, AI, piani salute, automazioni avanzate)', 'Pilot Milano: Growth gratuito 90 giorni', 'Pagamento sicuro con Stripe, annulla quando vuoi'], tip: 'Prezzi IVA esclusa. VetBuddy non \u00E8 un gestionale: \u00E8 un copilota operativo.' },
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
          <p className="text-sm text-gray-500">Il copilota operativo che riduce le telefonate e aumenta le prenotazioni.</p>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`${s.color} p-2 rounded-lg text-white`}><Icon className="h-4 w-4" /></div>
                    <span className="font-medium text-sm text-gray-800">{s.title}</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-gray-400 transition ${isOpen ? 'rotate-90' : ''}`} />
                </div>
                {isOpen && (
                  <div className="mt-3 pl-12 space-y-1">
                    {s.content.map((c, i) => (
                      <p key={i} className="text-xs text-gray-600 flex items-start gap-1.5"><span className="text-coral-400 mt-0.5">•</span>{c}</p>
                    ))}
                    {s.tip && <Badge variant="outline" className="mt-2 text-xs text-amber-700 bg-amber-50 border-amber-200">💡 {s.tip}</Badge>}
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
