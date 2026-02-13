'use client';

import React, { useState } from 'react';
import { Download, ArrowLeft, Building2, Calendar, FileText, Users, CreditCard, BarChart3, Settings, MessageSquare, Bell, Shield, Zap, Package, ClipboardList, PieChart, Send, ChevronRight, HelpCircle, Smartphone, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TutorialCliniche() {
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await fetch('/api/tutorials/download?type=clinic');
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'VetBuddy_Tutorial_Cliniche.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Download error:', error);
      alert('Errore durante il download. Riprova più tardi.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const sections = [
    {
      icon: Building2,
      title: 'Configurazione Iniziale',
      color: 'bg-coral-500',
      content: [
        '1. Registrati come clinica su vetbuddy.it',
        '2. Completa il profilo: nome clinica, indirizzo, P.IVA, orari',
        '3. Aggiungi logo e foto della struttura',
        '4. Configura i servizi offerti e i relativi prezzi',
        '5. Imposta la posizione sulla mappa (indirizzo o coordinate)',
        '6. Attiva il piano desiderato (Starter gratuito o Premium)'
      ],
      tip: 'Il Piano Starter è perfetto per veterinari freelance. Il Premium sblocca tutte le automazioni.'
    },
    {
      icon: Package,
      title: 'Gestione Servizi',
      color: 'bg-purple-500',
      content: [
        '1. Vai a "Impostazioni" → "Servizi"',
        '2. Aggiungi ogni servizio: nome, descrizione, prezzo, durata',
        '3. Categorizza i servizi (visite, vaccini, chirurgia, diagnostica...)',
        '4. Imposta prezzi diversi per specie animale se necessario',
        '5. Attiva/disattiva servizi stagionalmente',
        '6. I servizi saranno visibili ai proprietari durante la prenotazione'
      ],
      tip: 'Servizi ben descritti e con prezzi chiari aumentano le prenotazioni del 40%!'
    },
    {
      icon: Calendar,
      title: 'Gestione Appuntamenti',
      color: 'bg-blue-500',
      content: [
        '1. Visualizza il calendario dalla dashboard principale',
        '2. Vedi appuntamenti in vista giornaliera, settimanale o mensile',
        '3. Clicca su uno slot per creare manualmente un appuntamento',
        '4. Gestisci richieste: accetta, rifiuta o riprogramma',
        '5. Aggiungi note interne per ogni appuntamento',
        '6. Imposta promemoria automatici via email/WhatsApp'
      ],
      tip: 'Usa i codici colore per distinguere tipi di appuntamento a colpo d\'occhio.'
    },
    {
      icon: Users,
      title: 'Gestione Clienti e Pazienti',
      color: 'bg-green-500',
      content: [
        '1. Accedi a "Pazienti" per vedere tutti i clienti',
        '2. Visualizza la scheda completa di ogni animale',
        '3. Consulta lo storico visite e trattamenti',
        '4. Aggiungi note e allergie importanti',
        '5. Importa clienti esistenti da CSV (template disponibile)',
        '6. Esporta i dati per backup o analisi'
      ],
      tip: 'La funzione import CSV permette di migrare da altri gestionali in pochi minuti.'
    },
    {
      icon: FileText,
      title: 'Documenti e Prescrizioni',
      color: 'bg-amber-500',
      content: [
        '1. Vai a "Documenti" dalla dashboard',
        '2. Crea nuovi documenti: prescrizioni, referti, certificati',
        '3. Carica PDF esistenti o genera da template',
        '4. Associa il documento al paziente e proprietario',
        '5. Invia automaticamente via email al proprietario',
        '6. Il documento sarà disponibile anche nell\'app del cliente'
      ],
      tip: 'I documenti inviati digitalmente riducono le chiamate "ho perso la prescrizione" del 90%!'
    },
    {
      icon: Receipt,
      title: 'Fatturazione PROFORMA',
      color: 'bg-indigo-500',
      content: [
        '1. Vai a "Fatturazione" nella dashboard',
        '2. Crea nuova fattura PROFORMA selezionando il cliente',
        '3. Aggiungi servizi prestati con prezzi e quantità',
        '4. Applica IVA e eventuali sconti',
        '5. Genera PDF con tutti i dati fiscali',
        '6. Invia via email o salva per stampa',
        '7. Esporta in CSV per il commercialista'
      ],
      tip: 'Le fatture PROFORMA sono documenti non fiscali. Per la fatturazione elettronica usa il tuo gestionale fiscale.'
    },
    {
      icon: CreditCard,
      title: 'Pagamenti Online',
      color: 'bg-emerald-500',
      content: [
        '1. I proprietari possono pagare online prima della visita',
        '2. Pagamento sicuro tramite Stripe (carte, Apple Pay, Google Pay)',
        '3. Ricevi notifica immediata del pagamento',
        '4. Lo stato "pagato" è visibile nella scheda appuntamento',
        '5. Report mensile dei pagamenti ricevuti',
        '6. Nessuna commissione VetBuddy sulle transazioni'
      ],
      tip: 'Il pagamento anticipato riduce i no-show del 60% e migliora il cash flow.'
    },
    {
      icon: Zap,
      title: 'Automazioni (Piano Premium)',
      color: 'bg-orange-500',
      content: [
        '1. Promemoria automatici 24h prima dell\'appuntamento',
        '2. Follow-up post visita con istruzioni personalizzate',
        '3. Reminder per vaccini e controlli periodici',
        '4. Notifiche WhatsApp (richiede configurazione Twilio)',
        '5. Auto-assegnazione slot in base alla disponibilità',
        '6. Reportistica settimanale automatica'
      ],
      tip: 'Le automazioni fanno risparmiare in media 2 ore al giorno di lavoro amministrativo!'
    },
    {
      icon: MessageSquare,
      title: 'Notifiche WhatsApp',
      color: 'bg-green-600',
      content: [
        '1. Vai a "Impostazioni" → "Notifiche WhatsApp"',
        '2. Inserisci le credenziali Twilio (Account SID, Auth Token)',
        '3. Configura il numero WhatsApp Business',
        '4. Personalizza i template dei messaggi',
        '5. Attiva/disattiva tipi di notifica',
        '6. I clienti riceveranno promemoria direttamente su WhatsApp'
      ],
      tip: 'WhatsApp ha un tasso di apertura del 98% vs 20% delle email!'
    },
    {
      icon: BarChart3,
      title: 'Analytics e Report',
      color: 'bg-violet-500',
      content: [
        '1. Dashboard con KPI principali in tempo reale',
        '2. Numero visite, fatturato, nuovi clienti',
        '3. Confronto con periodi precedenti',
        '4. Report esportabili in CSV',
        '5. Analisi per tipo di servizio e specie animale',
        '6. Trend mensili e stagionali'
      ],
      tip: 'Usa i dati per identificare i servizi più richiesti e ottimizzare l\'offerta.'
    },
    {
      icon: Shield,
      title: 'Sicurezza e Privacy',
      color: 'bg-slate-600',
      content: [
        '1. Tutti i dati sono crittografati in transito e a riposo',
        '2. Backup automatici giornalieri',
        '3. Conforme al GDPR per la protezione dei dati',
        '4. Log di accesso e modifiche',
        '5. Possibilità di esportare/cancellare dati su richiesta',
        '6. Autenticazione sicura con opzione 2FA'
      ],
      tip: 'VetBuddy non condivide mai i dati dei tuoi clienti con terze parti.'
    },
    {
      icon: Smartphone,
      title: 'App Mobile',
      color: 'bg-teal-500',
      content: [
        '1. VetBuddy è una PWA (Progressive Web App)',
        '2. Installabile su qualsiasi dispositivo',
        '3. Funziona anche con connessione limitata',
        '4. Notifiche push come app nativa',
        '5. Interfaccia ottimizzata per tablet (uso in ambulatorio)',
        '6. Nessun download da App Store necessario'
      ],
      tip: 'Usa un tablet in ambulatorio per accesso rapido alle schede pazienti!'
    }
  ];

  const faqs = [
    { q: 'Quanto costa VetBuddy per le cliniche?', a: 'Piano Starter: gratuito per sempre. Piano Premium: €49/mese con tutte le automazioni. Pilot Milano: 90 giorni gratis Premium.' },
    { q: 'Posso importare i dati dal mio gestionale attuale?', a: 'Sì! Supportiamo import da CSV. Contattaci per assistenza nella migrazione.' },
    { q: 'VetBuddy sostituisce il mio software di fatturazione?', a: 'No, VetBuddy genera PROFORMA. Per la fatturazione elettronica usa il tuo gestionale fiscale.' },
    { q: 'Come funziona il pagamento dei clienti?', a: 'I clienti pagano via Stripe. I fondi vanno direttamente sul tuo conto. Nessuna commissione VetBuddy.' },
    { q: 'Posso avere più utenti per la clinica?', a: 'Sì, nel Piano Premium puoi aggiungere collaboratori con ruoli diversi.' },
    { q: 'I dati dei miei pazienti sono al sicuro?', a: 'Assolutamente. Crittografia, backup automatici e conformità GDPR garantiti.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-coral-600 transition">
            <ArrowLeft className="h-5 w-5" />
            <span>Torna alla Home</span>
          </Link>
          <Button 
            onClick={handleDownloadPDF} 
            disabled={downloadingPDF}
            className="bg-gradient-to-r from-coral-500 to-orange-600 hover:from-coral-600 hover:to-orange-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloadingPDF ? 'Download in corso...' : 'Scarica PDF'}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-6">
            <Building2 className="h-5 w-5" />
            <span className="font-semibold">Guida per Cliniche</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tutorial <span className="text-coral-500">VetBuddy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            La guida completa per sfruttare al massimo il gestionale VetBuddy nella tua clinica veterinaria.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-coral-500 to-orange-600 rounded-2xl p-6 md:p-8 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Quick Start - Operativi in 15 minuti
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: '1', text: 'Registrati come clinica' },
                { step: '2', text: 'Configura servizi e orari' },
                { step: '3', text: 'Importa i pazienti' },
                { step: '4', text: 'Inizia a ricevere prenotazioni' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/20 rounded-xl p-4">
                  <div className="h-10 w-10 rounded-full bg-white text-coral-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {item.step}
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className={`${section.color} p-4 flex items-center gap-3`}>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{section.title}</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-4">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-coral-50 border-l-4 border-coral-500 p-4 rounded-r-lg">
                  <p className="text-sm text-coral-700">
                    <strong>💡 Suggerimento:</strong> {section.tip}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8 flex items-center justify-center gap-2">
            <HelpCircle className="h-8 w-8 text-coral-500" />
            Domande Frequenti
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-coral-500 to-orange-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Pronto a digitalizzare la tua clinica?</h2>
            <p className="text-coral-100 mb-6">Registrati ora e inizia il periodo di prova gratuito del Piano Premium.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="bg-white text-coral-600 hover:bg-coral-50 w-full sm:w-auto">
                  Vai alla Home
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/20 w-full sm:w-auto"
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Scarica questa guida
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-gray-500 text-sm">
        <p>© 2026 VetBuddy - Gestionale Veterinario | Tutti i diritti riservati</p>
      </footer>
    </div>
  );
}
