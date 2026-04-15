'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Building2, Calendar, FileText, Receipt, CreditCard, MessageCircle, Zap, BarChart3, ChevronRight, Link, FlaskConical } from 'lucide-react';

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
    { icon: Building2, title: 'Configurazione Iniziale', color: 'bg-violet-500', content: ['Registrati come clinica su vetbuddy.it', 'Completa il profilo: nome clinica, indirizzo, P.IVA, orari', 'Aggiungi logo e foto della struttura', 'Configura i servizi offerti e i relativi prezzi', 'Scegli il piano: Starter €29/mese o Pro €59/mese'], tip: '30 giorni di prova gratuita su tutti i piani!' },
    { icon: Link, title: 'Link di Prenotazione', color: 'bg-coral-500', content: ['Vai su "Link Prenotazione" nel menu', 'Copia e condividi il tuo link personalizzato', 'Genera un QR Code da stampare in reception', 'I clienti prenotano SENZA registrarsi!', 'Le prenotazioni arrivano nella tua agenda'], tip: 'Condividi su WhatsApp ai clienti per fidelizzarli!' },
    { icon: Calendar, title: 'Gestione Appuntamenti', color: 'bg-blue-500', content: ['Visualizza il calendario dalla dashboard', 'Vedi appuntamenti in vista giornaliera, settimanale o mensile', 'Gestisci richieste: accetta, rifiuta o riprogramma', 'Le prenotazioni dal link diretto hanno fonte "booking_link"'], tip: 'Usa i codici colore per distinguere tipi di appuntamento.' },
    { icon: FlaskConical, title: 'Lab Marketplace', color: 'bg-purple-500', content: ['Sfoglia i laboratori partner disponibili', 'Crea richieste di analisi per i tuoi pazienti', 'Segui lo stato in tempo reale', 'Rivedi i referti e invia al proprietario'], tip: 'I referti sono nascosti al proprietario fino alla tua approvazione.' },
    { icon: BarChart3, title: 'Dashboard Metriche', color: 'bg-emerald-500', content: ['KPI: fatturato, appuntamenti, pazienti, visite al profilo', 'Grafico andamento fatturato 6 mesi', 'Funnel conversione prenotazioni', 'Analisi lab richieste e completate'], tip: 'Usa le metriche per capire quali canali portano più prenotazioni!' },
    { icon: FileText, title: 'Documenti e Fatturazione', color: 'bg-amber-500', content: ['Crea prescrizioni, referti, certificati', 'Fatturazione proforma con IVA e marca da bollo', 'Genera PDF ed esporta in CSV per il commercialista'], tip: 'I documenti digitali riducono le telefonate!' },
    { icon: CreditCard, title: 'Abbonamento e Pagamenti', color: 'bg-indigo-500', content: ['Starter: €29/mese - Pro: €59/mese (IVA esclusa)', '30 giorni di prova gratuita', 'Pagamento sicuro con Stripe', 'I pagamenti clienti vanno direttamente a te'], tip: 'Annulla in qualsiasi momento senza vincoli.' },
    { icon: Zap, title: 'Automazioni (Piano Pro)', color: 'bg-orange-500', content: ['Promemoria automatici 24h prima dell\'appuntamento', 'Follow-up post visita con istruzioni', 'Metriche avanzate e lab marketplace', 'Video-consulti e supporto prioritario'], tip: 'Le automazioni fanno risparmiare 2 ore al giorno!' }
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
          {['1. Registrati come clinica', '2. Configura servizi e orari', '3. Attiva il link prenotazione', '4. Inizia a ricevere prenotazioni'].map((item, i) => (
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
