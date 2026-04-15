'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Building2, CreditCard, FlaskConical, FileText, Settings, Euro, ChevronRight, Zap, Package, Users, Shield, Globe } from 'lucide-react';

function LabTutorialInline() {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  
  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await fetch('/api/tutorials/download?type=lab');
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'vetbuddy_Tutorial_Laboratori.pdf';
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); a.remove();
    } catch (error) {
      alert('Errore durante il download. Riprova più tardi.');
    } finally { setDownloadingPDF(false); }
  };
  
  const sections = [
    { 
      icon: Building2, 
      title: 'Configurazione Iniziale', 
      color: 'bg-indigo-500', 
      content: [
        'Registrati come laboratorio su vetbuddy.it',
        'Completa il profilo: nome lab, indirizzo, P.IVA, telefono',
        'Aggiungi descrizione, specializzazioni e area geografica',
        'Indica se offri il ritiro campioni a domicilio',
        'Il tuo profilo apparirà nel Marketplace delle cliniche'
      ], 
      tip: 'Un profilo completo attira più cliniche!' 
    },
    { 
      icon: CreditCard, 
      title: '⭐ Configurare Stripe (Pagamenti)', 
      color: 'bg-green-600', 
      content: [
        '1. Crea un account Stripe su stripe.com (gratuito)',
        '2. Vai su dashboard.stripe.com/apikeys',
        '3. Copia la "Publishable key" (inizia con pk_live_...)',
        '4. Copia la "Secret key" (inizia con sk_live_...)',
        '5. Su VetBuddy: Profilo → Pagamenti Clienti → "Configura Stripe"',
        '6. Incolla le chiavi e salva',
        'Fatto! Le cliniche potranno pagarti direttamente online'
      ], 
      tip: 'Stripe addebita solo il 1.4% + €0.25 per transazione. Nessun costo fisso mensile!' 
    },
    { 
      icon: FlaskConical, 
      title: 'Gestione Richieste', 
      color: 'bg-purple-500', 
      content: [
        'Ricevi richieste dalle cliniche nella sezione "Richieste"',
        'Ogni richiesta include: tipo esame, paziente, note cliniche, allegati',
        'Aggiorna lo stato: Ricevuta → In Lavorazione → Pronta',
        'Aggiungi note tecniche ad ogni cambio di stato',
        'Lo storico stati è visibile a te e alla clinica'
      ], 
      tip: 'Aggiorna lo stato regolarmente per mantenere la clinica informata.' 
    },
    { 
      icon: Euro, 
      title: 'Preventivi e Pagamenti', 
      color: 'bg-amber-500', 
      content: [
        'Quando accetti una richiesta, invia un preventivo con prezzo e tempi',
        'La clinica vede il preventivo e può pagare con "Paga Preventivo"',
        'Il pagamento arriva direttamente sul tuo account Stripe',
        'Dopo il pagamento, VetBuddy genera una fattura proforma automatica',
        'Le fatture proforma sono visibili nella sezione "Fatture"',
        'La fattura fiscale la emetti tu con il tuo gestionale'
      ], 
      tip: 'La fattura proforma è un documento di cortesia. Per la fattura fiscale usa il tuo software di fatturazione.' 
    },
    { 
      icon: FileText, 
      title: 'Upload Referti', 
      color: 'bg-blue-500', 
      content: [
        'Quando l\'analisi è pronta, carica il PDF del referto',
        'Aggiungi note tecniche per la clinica',
        'Il referto arriva alla clinica ma NON al proprietario',
        'La clinica rivede il referto e lo invia al proprietario',
        'Puoi caricare più referti per la stessa richiesta'
      ], 
      tip: 'I referti vengono sempre filtrati dalla clinica prima di raggiungere il proprietario.' 
    },
    { 
      icon: Package, 
      title: 'Listino Prezzi', 
      color: 'bg-teal-500', 
      content: [
        'Configura il tuo listino prezzi nella sezione "Listino Prezzi"',
        'Aggiungi categorie: Ematologia, Biochimica, Microbiologia, ecc.',
        'Specifica prezzo, tempo di consegna e tipo campione',
        'Il listino è visibile alle cliniche nel Marketplace',
        'Puoi aggiornare i prezzi in qualsiasi momento'
      ], 
      tip: 'Un listino completo e chiaro ti rende più competitivo nel Marketplace.' 
    },
    { 
      icon: Users, 
      title: 'Network Cliniche', 
      color: 'bg-coral-500', 
      content: [
        'Nella sezione "Cliniche" vedi tutte le cliniche collegate',
        'Monitora: richieste totali, ultima richiesta, fatturato',
        'Costruisci relazioni durature con le cliniche partner',
        'Più recensioni positive = più visibilità nel Marketplace'
      ], 
      tip: 'Rispondi rapidamente alle richieste: la velocità è il fattore #1 per le cliniche.' 
    },
    { 
      icon: Shield, 
      title: 'Abbonamento Lab Partner', 
      color: 'bg-violet-500', 
      content: [
        'Piano Lab Partner: €29/mese + IVA',
        'Gratis per 6 mesi o 50 richieste (Pilot Milano)',
        'Include: dashboard, marketplace, gestione richieste',
        'Upload referti, fatturazione proforma, notifiche email',
        'Gestisci abbonamento da Profilo → "Gestisci Abbonamento"'
      ], 
      tip: 'Annulla in qualsiasi momento senza vincoli dal portale Stripe.' 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tutorial Laboratorio</h2>
          <p className="text-gray-500 text-sm">Guida completa per ricevere richieste e pagamenti su vetbuddy</p>
        </div>
        <Button onClick={handleDownloadPDF} disabled={downloadingPDF} className="bg-indigo-500 hover:bg-indigo-600">
          <Download className="h-4 w-4 mr-2" />
          {downloadingPDF ? 'Download...' : 'Scarica PDF'}
        </Button>
      </div>
      
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap className="h-5 w-5" /> Quick Start — Operativi in 10 minuti</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            '1. Completa il profilo laboratorio',
            '2. Configura Stripe per i pagamenti',
            '3. Imposta il listino prezzi',
            '4. Inizia a ricevere richieste'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/20 rounded-xl p-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold">{i+1}</div>
              <span>{item.substring(3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe Configuration Highlight */}
      <Card className="border-2 border-green-300 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-500 text-white flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Come Configurare Stripe per Ricevere Pagamenti</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
                <div className="space-y-2">
                  <p className="font-semibold">Su Stripe:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Vai su <span className="font-mono bg-green-100 px-1 rounded">stripe.com</span> e crea account</li>
                    <li>Completa la verifica dell&apos;identità</li>
                    <li>Vai su <span className="font-mono bg-green-100 px-1 rounded">dashboard.stripe.com/apikeys</span></li>
                    <li>Copia &quot;Publishable key&quot; (<span className="font-mono text-xs">pk_live_...</span>)</li>
                    <li>Copia &quot;Secret key&quot; (<span className="font-mono text-xs">sk_live_...</span>)</li>
                  </ol>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Su VetBuddy:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Vai su <strong>Profilo</strong> nella tua dashboard</li>
                    <li>Trova la sezione <strong>&quot;Pagamenti Clienti (Stripe)&quot;</strong></li>
                    <li>Clicca <strong>&quot;Configura Stripe&quot;</strong></li>
                    <li>Incolla le due chiavi nei campi</li>
                    <li>Clicca <strong>&quot;Salva&quot;</strong> ✅</li>
                  </ol>
                </div>
              </div>
              <p className="mt-3 text-xs text-green-600 bg-green-100 p-2 rounded-lg">
                💡 Stripe addebita solo l&apos;1.4% + €0.25 per transazione UE. Nessun costo fisso mensile. I soldi arrivano sul tuo conto in 2-7 giorni lavorativi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-r-lg">
                <p className="text-xs text-indigo-700"><strong>💡</strong> {section.tip}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default LabTutorialInline;
