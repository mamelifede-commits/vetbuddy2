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
    { icon: Building2, title: 'Configurazione iniziale', color: 'bg-blue-500', content: ['Completa il profilo: nome clinica, indirizzo, P.IVA, orari', 'Carica logo e foto della struttura', 'Configura i servizi offerti con prezzi e durata stimata', 'Pilot Milano: Pro Clinica gratuito per 90 giorni', 'Dopo il periodo gratuito: EUR 79/mese + IVA (EUR 49/mese early adopter)'], tip: 'Un profilo completo e professionale aiuta i clienti a scegliere la tua clinica.' },
    { icon: Link, title: 'Link di prenotazione diretto', color: 'bg-indigo-500', content: ['Trova il tuo link personalizzato nel menu "Link Prenotazione"', 'Condividilo su WhatsApp, social, email o sito web', 'Genera un QR Code da stampare in reception', 'I clienti inviano una richiesta rapida senza registrarsi', 'Le richieste arrivano in agenda e le confermi tu'], tip: 'Il link permette ai clienti di inviare una richiesta rapida. La clinica conferma poi data e orario.' },
    { icon: Calendar, title: 'Gestione appuntamenti', color: 'bg-green-500', content: ['Calendario giornaliero, settimanale o mensile', 'Gestisci richieste: accetta, rifiuta o riprogramma', 'Aggiungi note interne per ogni appuntamento', 'Le prenotazioni dal link diretto sono contrassegnate come tali'], tip: 'Usa i codici colore per distinguere i tipi di appuntamento.' },
    { icon: FileText, title: 'Documenti e PDF', color: 'bg-amber-500', content: ['Crea prescrizioni, referti, certificati, vaccinazioni', 'Carica PDF esistenti o genera da template', 'Associa il documento a paziente e proprietario', 'Il documento viene inviato automaticamente via email'], tip: 'I documenti digitali aiutano a ridurre richieste ripetitive e telefonate non necessarie.' },
    { icon: FlaskConical, title: 'Lab Marketplace', color: 'bg-purple-500', content: ['Sfoglia i laboratori partner nel marketplace', 'Crea richieste di analisi per i tuoi pazienti', 'Segui lo stato della richiesta in tempo reale', 'Rivedi il referto, aggiungi note cliniche e decidi quando pubblicarlo al proprietario'], tip: 'I referti lab restano riservati fino alla tua revisione. Il proprietario vede solo cio che tu decidi di pubblicare.' },
    { icon: Pill, title: 'Ricette Elettroniche REV', color: 'bg-emerald-500', content: ['Prepara la bozza con il wizard guidato: paziente, farmaci, posologia, diagnosi', 'Completa l\'emissione ufficiale sul sistema nazionale (es. Vetinfo)', 'Registra N. ricetta e PIN in VetBuddy', 'Pubblica al proprietario quando opportuno', 'Dashboard statistiche e audit trail completo'], tip: 'L\'emissione ufficiale della REV richiede l\'abilitazione del veterinario al sistema nazionale. VetBuddy prepara, organizza e archivia il flusso.' },
    { icon: Receipt, title: 'Fatturazione proforma', color: 'bg-orange-500', content: ['Crea fatture proforma selezionando il cliente', 'Aggiungi servizi con prezzi e quantita', 'Genera PDF professionale', 'Esporta per il commercialista'], tip: 'Le fatture proforma sono documenti di cortesia e non hanno valore fiscale.' },
    { icon: BarChart3, title: 'Dashboard metriche', color: 'bg-cyan-500', content: ['Dati principali: appuntamenti, pazienti, documenti', 'Andamento nel tempo e analisi per canale', 'Richieste lab e stato completamento'], tip: 'Le metriche aiutano a comprendere il valore generato dalla piattaforma.' },
    { icon: CreditCard, title: 'Abbonamento e pagamenti', color: 'bg-slate-500', content: ['Starter Clinica: EUR 0/mese. Pro: EUR 79/mese (EUR 49 early adopter)', 'Pagamento sicuro con carta tramite Stripe', 'I pagamenti dei clienti alla clinica non passano da VetBuddy', 'VetBuddy incassa esclusivamente l\'abbonamento'], tip: 'Tutti i prezzi sono IVA esclusa. Annulla in qualsiasi momento.' },
    { icon: Zap, title: 'Automazioni (Piano Pro)', color: 'bg-yellow-500', content: ['Promemoria automatici prima degli appuntamenti', 'Follow-up post visita personalizzabili', 'Reminder per vaccini e controlli periodici', 'Report settimanale e notifiche lab'], tip: 'Le automazioni aiutano la clinica a risparmiare tempo nelle attivita ripetitive.' },
  ];

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/tutorials/download?type=clinic');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vetbuddy_Tutorial_Cliniche.pdf';
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
          <p className="text-sm text-gray-500">La piattaforma che semplifica la gestione quotidiana della clinica.</p>
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
