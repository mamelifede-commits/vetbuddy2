'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Building2, Calendar, FileText, Receipt, CreditCard, MessageCircle, Zap, BarChart3, ChevronRight } from 'lucide-react';

function ClinicTutorialInline() {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  
  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await fetch('/api/tutorials/download?type=clinic');
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'vetbuddy_Tutorial_Cliniche.pdf';
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); a.remove();
    } catch (error) {
      alert('Errore durante il download. Riprova più tardi.');
    } finally { setDownloadingPDF(false); }
  };
  
  const sections = [
    { icon: Building2, title: 'Configurazione Iniziale', color: 'bg-coral-500', content: ['Registrati come clinica su vetbuddy.it', 'Completa il profilo: nome clinica, indirizzo, P.IVA, orari', 'Aggiungi logo e foto della struttura', 'Configura i servizi offerti e i relativi prezzi'], tip: 'Il Piano Starter è perfetto per veterinari freelance.' },
    { icon: Calendar, title: 'Gestione Appuntamenti', color: 'bg-blue-500', content: ['Visualizza il calendario dalla dashboard', 'Vedi appuntamenti in vista giornaliera, settimanale o mensile', 'Gestisci richieste: accetta, rifiuta o riprogramma', 'Imposta promemoria automatici'], tip: 'Usa i codici colore per distinguere tipi di appuntamento.' },
    { icon: FileText, title: 'Documenti e Prescrizioni', color: 'bg-amber-500', content: ['Crea prescrizioni, referti, certificati', 'Carica PDF esistenti o genera da template', 'Invia automaticamente via email al proprietario', 'Il documento sarà disponibile nell\'app del cliente'], tip: 'I documenti inviati digitalmente riducono le telefonate!' },
    { icon: Receipt, title: 'Fatturazione PROFORMA', color: 'bg-indigo-500', content: ['Crea fattura PROFORMA selezionando il cliente', 'Aggiungi servizi prestati con prezzi e quantità', 'Genera PDF ed esporta in CSV per il commercialista'], tip: 'Le fatture PROFORMA sono documenti non fiscali.' },
    { icon: CreditCard, title: 'Pagamenti Online', color: 'bg-emerald-500', content: ['I proprietari possono pagare online prima della visita', 'Pagamento sicuro tramite Stripe', 'Nessuna commissione vetbuddy sulle transazioni'], tip: 'Il pagamento anticipato riduce i no-show del 60%.' },
    { icon: MessageCircle, title: 'Notifiche WhatsApp', color: 'bg-green-500', content: ['Configura WhatsApp Business nelle Impostazioni', 'I clienti ricevono promemoria automatici su WhatsApp', 'Notifiche per: appuntamenti, documenti, pagamenti', 'Il cliente può attivare/disattivare dal suo profilo'], tip: 'WhatsApp ha un tasso di apertura del 98%!' },
    { icon: Zap, title: 'Automazioni (Piano Premium)', color: 'bg-orange-500', content: ['Promemoria automatici 24h prima dell\'appuntamento', 'Follow-up post visita con istruzioni', 'Notifiche WhatsApp e Email automatiche'], tip: 'Le automazioni fanno risparmiare 2 ore al giorno!' },
    { icon: BarChart3, title: 'Analytics e Report', color: 'bg-violet-500', content: ['Dashboard con KPI principali in tempo reale', 'Numero visite, fatturato, nuovi clienti', 'Report esportabili in CSV'], tip: 'Usa i dati per ottimizzare l\'offerta.' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tutorial Clinica</h2>
          <p className="text-gray-500 text-sm">Guida completa per sfruttare al massimo vetbuddy</p>
        </div>
        <Button onClick={handleDownloadPDF} disabled={downloadingPDF} className="bg-coral-500 hover:bg-coral-600">
          <Download className="h-4 w-4 mr-2" />
          {downloadingPDF ? 'Download...' : 'Scarica PDF'}
        </Button>
      </div>
      
      <div className="bg-gradient-to-r from-coral-500 to-orange-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap className="h-5 w-5" /> Quick Start - Operativi in 15 minuti</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {['1. Registrati come clinica', '2. Configura servizi e orari', '3. Importa i pazienti', '4. Inizia a ricevere prenotazioni'].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/20 rounded-xl p-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-white text-coral-600 flex items-center justify-center font-bold">{i+1}</div>
              <span>{item.substring(3)}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {sections.map((section, i) => (
          <Card key={i} className="hover:shadow-lg transition">
            <CardHeader className={`${section.color} text-white rounded-t-lg py-3`}>
              <CardTitle className="flex items-center gap-2 text-lg">
                <section.icon className="h-5 w-5" /> {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-2 mb-3 text-sm">
                {section.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-coral-50 border-l-4 border-coral-500 p-3 rounded-r-lg">
                <p className="text-xs text-coral-700"><strong>💡</strong> {section.tip}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ClinicTutorialInline;
