'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Building2, CreditCard, List, ClipboardList, Upload, BarChart3, ChevronRight, Receipt, Shield } from 'lucide-react';

export default function LabTutorialInline({ onClose }) {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    { icon: Building2, title: 'Configurazione iniziale', color: 'bg-blue-500', content: ['Registrati come laboratorio su vetbuddy.it', 'Completa il profilo: nome, indirizzo, P.IVA, telefono', 'Aggiungi descrizione, specializzazioni e area geografica', 'Indica se offri il ritiro campioni a domicilio', 'Il tuo profilo sara visibile nel marketplace delle cliniche'], tip: 'Un profilo completo e dettagliato migliora la visibilita verso le cliniche partner.' },
    { icon: Shield, title: 'Collegamento pagamenti', color: 'bg-indigo-500', content: ['VetBuddy utilizza Stripe per i pagamenti tra cliniche e laboratori', 'Segui la procedura guidata da "Profilo" -> "Pagamenti"', 'Autorizza VetBuddy tramite collegamento sicuro', 'Non e necessario condividere manualmente chiavi o credenziali', 'I pagamenti arrivano direttamente sul tuo conto Stripe'], tip: 'Il collegamento avviene tramite procedura guidata e sicura. Non devi mai condividere chiavi segrete.' },
    { icon: List, title: 'Listino prezzi', color: 'bg-green-500', content: ['Vai su "Listino Prezzi" nel menu laterale', 'Crea categorie (es. Ematologia, Biochimica, Microbiologia)', 'Per ogni esame indica: nome, codice, prezzo e tempi di consegna', 'Il listino e visibile alle cliniche nel marketplace', 'Aggiorna prezzi e tempi in qualsiasi momento'], tip: 'Un listino chiaro e aggiornato facilita la scelta delle cliniche e aumenta le richieste.' },
    { icon: ClipboardList, title: 'Gestione richieste', color: 'bg-amber-500', content: ['Le richieste dalle cliniche arrivano nella dashboard', 'Per ogni richiesta vedi: paziente, esame, clinica richiedente', 'Aggiorna lo stato: Ricevuta -> In lavorazione -> Completata', 'Puoi inviare un preventivo personalizzato', 'La clinica accetta il preventivo e procede al pagamento'], tip: 'Aggiornare lo stato in tempo reale aiuta a mantenere una comunicazione chiara con la clinica.' },
    { icon: Upload, title: 'Caricamento referti', color: 'bg-purple-500', content: ['Quando l\'analisi e completata, carica il referto PDF', 'Puoi aggiungere note tecniche a corredo', 'La clinica riceve notifica e il veterinario rivede il referto', 'Solo dopo la revisione del veterinario il referto puo essere visibile al proprietario', 'Tutti i referti restano archiviati nel sistema'], tip: 'La condivisione al proprietario e gestita dalla clinica. Il veterinario aggiunge note cliniche prima della pubblicazione.' },
    { icon: Receipt, title: 'Fatturazione', color: 'bg-orange-500', content: ['Il pagamento arriva sul tuo conto Stripe quando la clinica paga', 'Una fattura proforma viene generata automaticamente', 'Le fatture proforma sono documenti di cortesia, non fiscali', 'La fattura fiscale va emessa dal laboratorio', 'Consulta e scarica le fatture dalla sezione "Fatture"'], tip: 'Ricorda di emettere fattura fiscale autonomamente per ogni transazione.' },
    { icon: BarChart3, title: 'Dashboard e metriche', color: 'bg-cyan-500', content: ['Panoramica delle attivita del laboratorio', 'Richieste ricevute, in lavorazione e completate', 'Andamento nel tempo', 'Cliniche partner attive', 'Tempi medi di consegna'], tip: 'Le metriche aiutano a monitorare le performance e identificare opportunita di miglioramento.' },
    { icon: CreditCard, title: 'Abbonamento', color: 'bg-slate-500', content: ['Lab Partner: EUR 29/mese + IVA', 'Gratuito per i primi 6 mesi o 50 richieste', 'Include: marketplace, gestione richieste, fatturazione, dashboard', 'Annulla in qualsiasi momento senza vincoli'], tip: 'Tutti i prezzi indicati sono IVA esclusa.' },
  ];

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/tutorials/download?type=lab');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vetbuddy_Tutorial_Laboratori.pdf';
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
          <h2 className="text-xl font-bold text-gray-800">Guida per Laboratori di Analisi</h2>
          <p className="text-sm text-gray-500">Il marketplace che connette il tuo laboratorio alle cliniche veterinarie partner.</p>
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
            <Card key={idx} className={`cursor-pointer transition ${isOpen ? 'ring-2 ring-purple-200' : ''}`} onClick={() => setActiveSection(isOpen ? null : idx)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center`}><Icon className="h-4 w-4 text-white" /></div>
                  <h3 className="font-semibold text-gray-800 flex-1">{s.title}</h3>
                  <ChevronRight className={`h-4 w-4 text-gray-400 transition ${isOpen ? 'rotate-90' : ''}`} />
                </div>
                {isOpen && (
                  <div className="mt-3 ml-11 space-y-2">
                    {s.content.map((c, i) => (<p key={i} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-purple-400 mt-0.5">-</span>{c}</p>))}
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
