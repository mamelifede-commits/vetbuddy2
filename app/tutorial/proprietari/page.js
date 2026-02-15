'use client';

import React, { useState, useEffect } from 'react';
import { Download, ArrowLeft, PawPrint, Calendar, FileText, MessageSquare, Heart, Bell, Shield, Star, MapPin, Phone, Clock, CheckCircle, ChevronRight, HelpCircle, Smartphone, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TutorialProprietari() {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check user role on mount
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        // Try to get user from sessionStorage
        const storedUser = sessionStorage.getItem('vetbuddy_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          // Only owners can access this tutorial
          if (userData.role === 'owner') {
            setIsAuthorized(true);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthorization();
  }, []);

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await fetch('/api/tutorials/download?type=owner');
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vetbuddy_Tutorial_Proprietari.pdf';
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifica accesso...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Riservato</h1>
          <p className="text-gray-600 mb-6">
            Questo tutorial è riservato ai <strong>proprietari di animali</strong> registrati su vetbuddy.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 text-left">
                {user ? 
                  `Sei loggato come "${user.role === 'clinic' ? 'Clinica' : user.role}". Questo tutorial è solo per proprietari.` :
                  'Effettua il login come proprietario per accedere a questo contenuto.'
                }
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                Vai alla Home e Accedi
              </Button>
            </Link>
            {user?.role === 'clinic' && (
              <Link href="/tutorial/cliniche">
                <Button variant="outline" className="w-full">
                  Vai al Tutorial Cliniche
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    {
      icon: PawPrint,
      title: 'Registrazione e Primo Accesso',
      color: 'bg-blue-500',
      content: [
        '1. Vai su vetbuddy.it e clicca "Registrati"',
        '2. Seleziona "Proprietario di Animali"',
        '3. Inserisci email e crea una password sicura',
        '4. Conferma l\'email cliccando sul link ricevuto',
        '5. Completa il profilo con i tuoi dati (nome, telefono, codice fiscale)'
      ],
      tip: 'Puoi anche registrarti rapidamente con Google!'
    },
    {
      icon: Heart,
      title: 'Aggiungere i Tuoi Animali',
      color: 'bg-pink-500',
      content: [
        '1. Dalla dashboard, clicca "I Miei Animali"',
        '2. Premi il pulsante "+" o "Aggiungi Animale"',
        '3. Inserisci: nome, specie (cane, gatto, coniglio, uccello, rettile, pesce, cavallo, altro)',
        '4. Aggiungi razza, data di nascita, peso, microchip',
        '5. Carica una foto del tuo amico a 4 zampe',
        '6. Indica allergie o condizioni particolari'
      ],
      tip: 'Puoi aggiungere animali di qualsiasi specie: cani, gatti, conigli, uccelli, rettili, pesci, cavalli e altri!'
    },
    {
      icon: MapPin,
      title: 'Trovare una Clinica',
      color: 'bg-green-500',
      content: [
        '1. Vai alla sezione "Trova Clinica"',
        '2. Usa la mappa interattiva per vedere le cliniche vicine',
        '3. Filtra per città o servizi offerti',
        '4. Clicca su una clinica per vedere orari, servizi e recensioni',
        '5. Salva le cliniche preferite per un accesso rapido'
      ],
      tip: 'La mappa mostra cliniche in tutta Italia, concentrate nel pilot di Milano.'
    },
    {
      icon: Calendar,
      title: 'Prenotare un Appuntamento',
      color: 'bg-purple-500',
      content: [
        '1. Clicca "Prenota Visita" dalla dashboard',
        '2. Seleziona la clinica desiderata',
        '3. Scegli il tipo di servizio (visita generale, vaccini, chirurgia...)',
        '4. Seleziona l\'animale per cui prenotare',
        '5. Scegli data e orario tra quelli disponibili',
        '6. Aggiungi note per il veterinario (sintomi, urgenze)',
        '7. Conferma la prenotazione'
      ],
      tip: 'Riceverai conferma via email e potrai gestire l\'appuntamento dalla dashboard.'
    },
    {
      icon: FileText,
      title: 'Gestire i Documenti',
      color: 'bg-amber-500',
      content: [
        '1. Accedi a "I Miei Documenti" dalla dashboard',
        '2. Visualizza prescrizioni, referti, fatture ricevute',
        '3. Scarica i documenti in formato PDF',
        '4. Organizza per animale o per data',
        '5. I documenti della clinica arrivano automaticamente qui'
      ],
      tip: 'Tutti i documenti sono sempre disponibili, anche offline dopo il primo caricamento.'
    },
    {
      icon: Bell,
      title: 'Notifiche e Promemoria',
      color: 'bg-red-500',
      content: [
        '1. Ricevi notifiche per appuntamenti in arrivo',
        '2. Promemoria per vaccini e controlli periodici',
        '3. Avvisi quando ricevi nuovi documenti',
        '4. Notifiche via email, app e WhatsApp (se attivato)',
        '5. Personalizza le preferenze di notifica nelle Impostazioni'
      ],
      tip: 'Attiva le notifiche WhatsApp per non perdere mai un promemoria!'
    },
    {
      icon: MessageSquare,
      title: 'Assistente Virtuale',
      color: 'bg-indigo-500',
      content: [
        '1. Clicca sull\'icona chat in basso a destra',
        '2. Chiedi informazioni sui servizi vetbuddy',
        '3. Ottieni risposte su come usare l\'app',
        '4. L\'assistente può aiutarti a prenotare',
        '5. Disponibile 24/7 per le tue domande'
      ],
      tip: 'L\'assistente AI è pensato per guidarti nell\'uso della piattaforma, non sostituisce il veterinario!'
    },
    {
      icon: Star,
      title: 'Programma Fedeltà',
      color: 'bg-yellow-500',
      content: [
        '1. Accumula punti con ogni prenotazione completata',
        '2. Ricevi punti bonus per recensioni e referral',
        '3. Riscatta i punti per sconti sulle visite',
        '4. Visualizza il tuo saldo punti nella dashboard',
        '5. Invita amici e guadagna punti extra'
      ],
      tip: 'Ogni 100 punti = €5 di sconto sulla prossima visita!'
    },
    {
      icon: Smartphone,
      title: 'Installare l\'App',
      color: 'bg-teal-500',
      content: [
        '1. vetbuddy funziona come app installabile (PWA)',
        '2. Su iPhone: Safari → Condividi → Aggiungi a Home',
        '3. Su Android: Chrome → Menu → Installa app',
        '4. L\'app funziona anche offline per consultare documenti',
        '5. Ricevi notifiche push come un\'app nativa'
      ],
      tip: 'L\'app non occupa spazio come le app tradizionali ed è sempre aggiornata!'
    }
  ];

  const faqs = [
    { q: 'Quanto costa usare vetbuddy?', a: 'vetbuddy è completamente gratuito per i proprietari di animali. Nessun costo nascosto!' },
    { q: 'Posso usare vetbuddy con qualsiasi clinica?', a: 'Puoi prenotare solo presso le cliniche registrate su vetbuddy. Invita la tua clinica di fiducia!' },
    { q: 'I miei dati sono al sicuro?', a: 'Assolutamente sì! Utilizziamo crittografia avanzata e rispettiamo il GDPR.' },
    { q: 'Posso gestire più animali?', a: 'Sì, puoi aggiungere tutti gli animali che desideri al tuo profilo.' },
    { q: 'Come annullo un appuntamento?', a: 'Dalla dashboard, vai su "I Miei Appuntamenti", seleziona l\'appuntamento e clicca "Annulla".' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
            <ArrowLeft className="h-5 w-5" />
            <span>Torna alla Dashboard</span>
          </Link>
          <Button 
            onClick={handleDownloadPDF} 
            disabled={downloadingPDF}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloadingPDF ? 'Download in corso...' : 'Scarica PDF'}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <PawPrint className="h-5 w-5" />
            <span className="font-semibold">Guida per Proprietari</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tutorial <span className="text-blue-500">vetbuddy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tutto quello che devi sapere per gestire la salute dei tuoi amici a 4 zampe (e non solo!) in modo semplice e organizzato.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 md:p-8 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Quick Start - Inizia in 5 minuti
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: '1', text: 'Registrati gratis' },
                { step: '2', text: 'Aggiungi i tuoi animali' },
                { step: '3', text: 'Trova una clinica' },
                { step: '4', text: 'Prenota la prima visita' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/20 rounded-xl p-4">
                  <div className="h-10 w-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
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
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-sm text-blue-700">
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
            <HelpCircle className="h-8 w-8 text-blue-500" />
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
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Hai altre domande?</h2>
            <p className="text-blue-100 mb-6">Usa l'assistente virtuale nella dashboard oppure contatta il supporto.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
                  Torna alla Dashboard
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
        <p>© 2026 vetbuddy - Gestionale Veterinario | Tutti i diritti riservati</p>
      </footer>
    </div>
  );
}
