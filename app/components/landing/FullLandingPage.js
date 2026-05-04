'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AuthForm } from '@/app/components/auth';
import NewBrandLogo from '@/app/components/shared/NewBrandLogo';
import api from '@/app/lib/api';
import {
  Calendar, FileText, Users, Send, Building2, Phone, PawPrint, Zap, Shield, Heart, MessageCircle, Bell,
  CheckCircle, ChevronRight, Menu, X, ClipboardList, TrendingUp,
  Star, Check, Euro, Receipt, Activity,
  MapPin, Stethoscope, Mail, Clock, Gift, Loader2, FlaskConical, BarChart3,
  ArrowRight, PhoneOff, CalendarCheck, Repeat, Brain, Sparkles, Target, Timer
} from 'lucide-react';

function FullLandingPage({ onLogin }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pilotForm, setPilotForm] = useState({ clinicName: '', city: '', email: '', phone: '', message: '' });
  const [pilotSubmitting, setPilotSubmitting] = useState(false);
  const [pilotSubmitted, setPilotSubmitted] = useState(false);
  const scrollToSection = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAction = sessionStorage.getItem('vetbuddy_email_action');
      if (savedAction) {
        try {
          const actionData = JSON.parse(savedAction);
          setPendingAction(actionData);
          setAuthMode('login');
          setShowAuth(true);
        } catch (e) { /* ignore */ }
      }
    }
  }, []);

  const getActionMessage = () => {
    if (!pendingAction) return null;
    switch (pendingAction.action) {
      case 'cancel': return '❌ Per disdire l\'appuntamento, effettua prima il login';
      case 'book': return '📅 Per prenotare un appuntamento, effettua prima il login';
      case 'message': return '💬 Per inviare un messaggio, effettua prima il login';
      case 'review': return '⭐ Per lasciare una recensione, effettua prima il login';
      default: return '🔐 Effettua il login per continuare';
    }
  };

  const handlePilotSubmit = async () => {
    if (!pilotForm.clinicName || !pilotForm.email) return;
    setPilotSubmitting(true);
    try {
      await api.post('pilot-applications', pilotForm);
      setPilotSubmitted(true);
    } catch (err) {
      alert('Errore nell\'invio. Riprova.');
    }
    setPilotSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Pilot Banner */}
      <div className="bg-gradient-to-r from-coral-500 to-orange-500 text-white text-center py-2.5 px-4 text-sm">
        <span className="font-semibold">🏙️ Pilot Milano</span> — 90 giorni per misurare il valore che VetBuddy genera per la tua clinica. <button onClick={() => scrollToSection('pilot')} className="underline font-semibold ml-1">Candidati →</button>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <NewBrandLogo size="md" />
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => scrollToSection('soluzione')} className="text-gray-600 hover:text-coral-500 transition">Soluzione</button>
            <button onClick={() => scrollToSection('moduli')} className="text-gray-600 hover:text-coral-500 transition">Moduli</button>
            <button onClick={() => scrollToSection('lab-network')} className="text-purple-600 hover:text-purple-700 font-medium transition">🧪 Lab Network</button>
            <button onClick={() => scrollToSection('prezzi')} className="text-gray-600 hover:text-coral-500 transition">Prezzi</button>
            <button onClick={() => scrollToSection('pilot')} className="text-gray-600 hover:text-coral-500 transition">Pilot</button>
            <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-coral-500 transition">FAQ</button>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>Accedi</Button>
            <Button size="sm" className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Prova Gratis</Button>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-4 px-4 shadow-lg">
            <div className="flex flex-col gap-2">
              <button onClick={() => { scrollToSection('soluzione'); }} className="text-gray-600 text-left py-2 hover:text-coral-500">Soluzione</button>
              <button onClick={() => { scrollToSection('moduli'); }} className="text-gray-600 text-left py-2 hover:text-coral-500">Moduli</button>
              <button onClick={() => { scrollToSection('lab-network'); }} className="text-purple-600 text-left py-2 font-medium">🧪 Lab Network</button>
              <button onClick={() => { scrollToSection('prezzi'); }} className="text-gray-600 text-left py-2 hover:text-coral-500">Prezzi</button>
              <button onClick={() => { scrollToSection('pilot'); }} className="text-gray-600 text-left py-2 hover:text-coral-500">Pilot</button>
              <a href="/presentazione" className="text-gray-600 text-left py-2 hover:text-coral-500 block">Brochure</a>
              <div className="flex gap-2 pt-2 border-t mt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setAuthMode('login'); setShowAuth(true); setMobileMenuOpen(false); }}>Accedi</Button>
                <Button size="sm" className="flex-1 bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); setMobileMenuOpen(false); }}>Prova Gratis</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ============================================================ */}
      {/* HERO — Nuovo posizionamento */}
      {/* ============================================================ */}
      <section className="pt-16 pb-16 px-4 bg-gradient-to-br from-white via-coral-50/30 to-blue-50/30 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge className="bg-coral-100 text-coral-700 mb-6 text-sm px-4 py-1.5">🚀 Il copilota operativo per cliniche veterinarie</Badge>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Più prenotazioni. Meno telefonate.<br className="hidden md:block" />
            <span className="text-coral-500">Clienti sempre seguiti.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
            VetBuddy automatizza prenotazioni, reminder, comunicazioni, referti e follow-up tra cliniche veterinarie, proprietari e laboratori.
          </p>
          <p className="text-base text-gray-500 mb-8 max-w-2xl mx-auto italic">
            Non sostituisce il tuo gestionale: lavora accanto alla clinica per ridurre il caos operativo e aumentare le visite ricorrenti.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Button size="lg" className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-6 text-lg" onClick={() => scrollToSection('pilot')}>
              Candidati al Pilot Milano <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg" onClick={() => scrollToSection('soluzione')}>
              Scopri come funziona
            </Button>
          </div>

          {/* Risultati chiave — numeri impatto */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: PhoneOff, value: '-70%', label: 'Telefonate', color: 'text-red-500' },
              { icon: CalendarCheck, value: '+40%', label: 'Prenotazioni online', color: 'text-green-500' },
              { icon: Timer, value: '15h', label: 'Risparmiate/mese', color: 'text-blue-500' },
              { icon: Repeat, value: '+25%', label: 'Clienti che tornano', color: 'text-purple-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/80 backdrop-blur rounded-xl p-4 border border-gray-100 shadow-sm">
                <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PROBLEMA */}
      {/* ============================================================ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-red-100 text-red-700 mb-4">⚠️ Il problema</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Le cliniche perdono tempo e clienti ogni giorno</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Suona familiare? Ecco cosa succede nella maggior parte delle cliniche veterinarie italiane.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: 'Telefonate continue', desc: 'La segreteria passa ore al telefono per conferme, disdette, richieste info e promemoria. Tempo sottratto alla cura dei pazienti.' },
              { icon: Calendar, title: 'Appuntamenti dimenticati', desc: 'I no-show costano alla clinica. Senza reminder automatici, i proprietari dimenticano le visite e i richiami.' },
              { icon: MessageCircle, title: 'WhatsApp e caos comunicativo', desc: 'Referti via WhatsApp, richieste su canali diversi, informazioni perse. Nessun ordine, nessuno storico.' },
              { icon: FlaskConical, title: 'Referti sparsi e laboratori disconnessi', desc: 'I risultati delle analisi arrivano per email, telefono o fax. Nessun flusso strutturato per gestirli e condividerli.' },
              { icon: Repeat, title: 'Clienti che non tornano', desc: 'Senza follow-up e richiami automatici, i clienti si dimenticano delle visite di controllo e dei vaccini.' },
              { icon: BarChart3, title: 'Nessuna visibilità sui risultati', desc: 'La clinica non sa quante prenotazioni genera, quanto tempo risparmia o quanto fatturato perde per disorganizzazione.' },
            ].map((p, i) => (
              <Card key={i} className="border-red-100 hover:shadow-md transition">
                <CardContent className="p-6">
                  <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center mb-4"><p.icon className="h-5 w-5 text-red-500" /></div>
                  <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-600">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SOLUZIONE */}
      {/* ============================================================ */}
      <section id="soluzione" className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-green-100 text-green-700 mb-4">✅ La soluzione</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">VetBuddy automatizza il lavoro operativo della clinica</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Una piattaforma che lavora per te mentre ti concentri sulla cura dei pazienti.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {[
                { icon: CalendarCheck, text: 'Prenotazioni online automatiche', desc: 'I proprietari prenotano dal link diretto. Tu confermi con un click.' },
                { icon: Bell, text: 'Reminder e follow-up automatici', desc: 'Niente più telefonate per ricordare appuntamenti, vaccini e controlli.' },
                { icon: MessageCircle, text: 'Comunicazione centralizzata', desc: 'Un\'unica inbox per messaggi, richieste e notifiche. Ordine al posto del caos.' },
                { icon: FileText, text: 'Documenti e referti digitali', desc: 'Referti, certificati e prescrizioni inviati automaticamente al proprietario.' },
                { icon: FlaskConical, text: 'Lab Network integrato', desc: 'Richiedi analisi, ricevi referti, rivedi e condividi. Tutto in un flusso ordinato.' },
                { icon: TrendingUp, text: 'Dashboard valore generato', desc: 'Ogni mese sai esattamente quanto tempo hai risparmiato e quante visite hai generato.' },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0"><s.icon className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{s.text}</h4>
                    <p className="text-sm text-gray-600">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-coral-50 to-blue-50 rounded-2xl p-8 border border-coral-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Il risultato per la tua clinica</h3>
              <div className="space-y-4">
                {[
                  { label: 'Telefonate evitate', value: '~120/mese', icon: PhoneOff, color: 'text-red-500' },
                  { label: 'Ore risparmiate dallo staff', value: '~15h/mese', icon: Timer, color: 'text-blue-500' },
                  { label: 'Prenotazioni generate online', value: '~45/mese', icon: CalendarCheck, color: 'text-green-500' },
                  { label: 'No-show ridotti', value: '~60%', icon: Shield, color: 'text-purple-500' },
                  { label: 'Clienti riattivati', value: '~20/mese', icon: Repeat, color: 'text-orange-500' },
                  { label: 'Fatturato stimato generato', value: '€2.800/mese', icon: Euro, color: 'text-emerald-600' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                    <div className="flex items-center gap-3">
                      <r.icon className={`h-5 w-5 ${r.color}`} />
                      <span className="text-sm text-gray-700">{r.label}</span>
                    </div>
                    <span className={`font-bold ${r.color}`}>{r.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center italic">*Stime basate su una clinica media con 3 veterinari</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MODULI PRINCIPALI */}
      {/* ============================================================ */}
      <section id="moduli" className="py-16 px-4 bg-gradient-to-br from-gray-50 via-white to-coral-50/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-coral-100 text-coral-700 mb-4">🛠️ I moduli</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tutto quello che serve, niente di superfluo</h2>
            <p className="text-gray-600">Ogni modulo è progettato per risolvere un problema concreto della clinica.</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[
              { icon: Calendar, title: 'Booking e Agenda', desc: 'Prenotazioni online, link diretto, calendario multi-vista, richieste da confermare.', color: 'bg-blue-500', tag: null },
              { icon: Bell, title: 'Reminder e Follow-up', desc: 'Promemoria automatici: 24h prima, 1h prima, post-visita, post-chirurgia, richiami vaccini.', color: 'bg-amber-500', tag: null },
              { icon: MessageCircle, title: 'Team Inbox', desc: 'Messaggi, richieste, notifiche lab, follow-up da gestire. Tutto in un posto.', color: 'bg-cyan-500', tag: null },
              { icon: FileText, title: 'Referti e Documenti', desc: 'Prescrizioni, certificati, referti PDF. Generazione, invio automatico e archivio.', color: 'bg-teal-500', tag: null },
              { icon: FlaskConical, title: 'Lab Network', desc: 'Richieste analisi, marketplace laboratori, upload referti, revisione e invio al proprietario.', color: 'bg-purple-500', tag: 'Vantaggio competitivo' },
              { icon: PawPrint, title: 'App Proprietario', desc: 'L\'app ufficiale della tua clinica: prenotazioni, reminder, referti, messaggi, follow-up.', color: 'bg-pink-500', tag: null },
              { icon: BarChart3, title: 'Dashboard Valore', desc: 'Prenotazioni generate, telefonate evitate, ore risparmiate, fatturato stimato.', color: 'bg-emerald-500', tag: 'Esclusivo' },
              { icon: Receipt, title: 'Fatturazione', desc: 'Fatture proforma, documenti di cortesia, export dati per il commercialista.', color: 'bg-orange-500', tag: null },
              { icon: Stethoscope, title: 'Assistente REV', desc: 'Preparazione bozze, archiviazione ricette, storico prescrizioni. L\'emissione ufficiale resta al veterinario.', color: 'bg-emerald-600', tag: null },
              { icon: Gift, title: 'Programma Fedeltà', desc: 'Punti, premi e incentivi per far tornare i clienti. Personalizzabile dalla clinica.', color: 'bg-yellow-500', tag: null },
              { icon: Users, title: 'Gestione Pazienti', desc: 'Schede animali complete, storico visite, documenti, import CSV da altri gestionali.', color: 'bg-slate-500', tag: null },
              { icon: Zap, title: 'Automazioni', desc: 'Reminder, follow-up, richiami, cliente inattivo, compleanno animale. Tutto automatico.', color: 'bg-violet-500', tag: 'Pro' },
            ].map((m, i) => (
              <Card key={i} className="hover:shadow-lg transition group relative overflow-hidden">
                {m.tag && <div className="absolute top-2 right-2"><Badge className="bg-coral-500 text-white text-[10px]">{m.tag}</Badge></div>}
                <CardContent className="p-5">
                  <div className={`h-10 w-10 ${m.color} rounded-lg flex items-center justify-center mb-3`}><m.icon className="h-5 w-5 text-white" /></div>
                  <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{m.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{m.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* LAB NETWORK */}
      {/* ============================================================ */}
      <section id="lab-network" className="py-16 px-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-purple-100 text-purple-700 mb-4">🧪 VetBuddy Lab Network</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Il laboratorio carica. La clinica valida. Il proprietario riceve.</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Un flusso ordinato e professionale per gestire le analisi di laboratorio senza telefonate, email o fogli volanti.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-coral-500" /> Per la Clinica</h3>
              <div className="space-y-3">
                {[
                  'Richiesta esame direttamente dalla scheda animale',
                  'Selezione laboratorio dal marketplace',
                  'Confronto per tempi medi e servizi',
                  'Stato richiesta in tempo reale',
                  'Revisione referto + note cliniche',
                  'Invio controllato al proprietario',
                  'Storico referti per ogni animale',
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2"><Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" /><span className="text-sm text-gray-700">{f}</span></div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><FlaskConical className="h-5 w-5 text-purple-500" /> Per il Laboratorio</h3>
              <div className="space-y-3">
                {[
                  'Dashboard dedicata per gestire richieste',
                  'Profilo pubblico nel marketplace',
                  'Listino prezzi indicativo',
                  'Disponibilità ritiro campioni',
                  'Upload referto PDF con note tecniche',
                  'Notifiche automatiche alla clinica',
                  'Integrazione API per software di laboratorio',
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2"><Check className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" /><span className="text-sm text-gray-700">{f}</span></div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 bg-white border border-purple-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Sicurezza e controllo</h4>
                <p className="text-sm text-gray-600">I referti di laboratorio restano riservati fino a quando il veterinario non li rivede, aggiunge le proprie note cliniche e decide di pubblicarli al proprietario. Nessun dato sensibile viene condiviso senza il controllo della clinica.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* APP PROPRIETARIO */}
      {/* ============================================================ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-pink-100 text-pink-700 mb-4">🐾 Per i proprietari</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">L'app ufficiale della tua clinica per seguire la salute del tuo animale.</h2>
              <p className="text-gray-600 mb-6">Il proprietario riceve reminder, referti e follow-up senza intasare la segreteria. Tutto automatico, tutto ordinato.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Prenotazione online',
                  'Reminder vaccini',
                  'Reminder antiparassitari',
                  'Storico documenti e referti',
                  'Profilo animale completo',
                  'Messaggi dalla clinica',
                  'Follow-up post visita',
                  'Prossima visita consigliata',
                  'Programma fedeltà',
                  'Notifiche richiami',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle className="h-4 w-4 text-pink-500 flex-shrink-0" />{f}</div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-6 italic">L'app proprietario serve soprattutto a far tornare il cliente in clinica.</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 text-center">
              <PawPrint className="h-16 w-16 text-coral-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gratuita per i proprietari</h3>
              <p className="text-gray-600 text-sm mb-4">Nessun costo nascosto. Il proprietario accede gratis e riceve tutto dalla clinica.</p>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Registrati gratis <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* REV — Assistente flusso */}
      {/* ============================================================ */}
      <section className="py-12 px-4 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 bg-white border border-emerald-200 rounded-xl p-6">
            <Stethoscope className="h-8 w-8 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">💊 Assistente al flusso REV</h3>
              <p className="text-sm text-gray-600 mb-4">VetBuddy aiuta la clinica a preparare, organizzare e archiviare il flusso relativo alla Ricetta Elettronica Veterinaria. L'emissione ufficiale resta in capo al medico veterinario abilitato, che opera con le proprie credenziali e responsabilità professionali.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'Preparazione bozza dal paziente',
                  'Riepilogo farmaci e posologia',
                  'Archiviazione n° ricetta e PIN',
                  'Collegamento cartella clinica',
                  'Storico prescrizioni',
                  'Invio info autorizzate al proprietario',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600"><Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />{f}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PRICING */}
      {/* ============================================================ */}
      <section id="prezzi" className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-coral-100 text-coral-700 mb-4">💰 Prezzi</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Scegli il piano adatto alla tua clinica</h2>
            <p className="text-gray-600">Tutti i prezzi sono IVA esclusa. Puoi annullare in qualsiasi momento.</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
            {/* STARTER */}
            <Card className="border-gray-200 hover:shadow-lg transition">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-1">Starter</h3>
                <p className="text-xs text-gray-500 mb-4">Per veterinari freelance e micro-cliniche</p>
                <div className="mb-4"><span className="text-3xl font-bold text-gray-900">€29</span><span className="text-gray-500 text-sm">/mese + IVA</span></div>
                <div className="space-y-2 text-sm">
                  {['1 sede', '1 utente', 'Profilo pubblico', 'Link prenotazione', 'Agenda base', 'Reminder base', 'Fino a 30 prenotazioni/mese'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /><span className="text-gray-700">{f}</span></div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Inizia ora</Button>
              </CardContent>
            </Card>

            {/* GROWTH */}
            <Card className="border-coral-300 ring-2 ring-coral-200 hover:shadow-lg transition relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-coral-500 text-white px-3">⭐ Consigliato</Badge></div>
              <CardContent className="p-6">
                <h3 className="font-bold text-coral-600 text-lg mb-1">Growth</h3>
                <p className="text-xs text-gray-500 mb-4">Per cliniche piccole e medie</p>
                <div className="mb-4"><span className="text-3xl font-bold text-coral-600">€69</span><span className="text-gray-500 text-sm">/mese + IVA</span></div>
                <div className="space-y-2 text-sm">
                  {['Fino a 5 utenti', 'Prenotazioni illimitate', 'Agenda digitale', 'Reminder automatici', 'Documenti e PDF', 'App proprietario', 'Inbox', 'Dashboard valore', 'Lab request base'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-coral-500" /><span className="text-gray-700">{f}</span></div>
                  ))}
                </div>
                <Button className="w-full mt-6 bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Scegli Growth</Button>
              </CardContent>
            </Card>

            {/* PRO */}
            <Card className="border-gray-200 hover:shadow-lg transition">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-1">Pro</h3>
                <p className="text-xs text-gray-500 mb-4">Per cliniche strutturate</p>
                <div className="mb-4"><span className="text-3xl font-bold text-gray-900">€99</span><span className="text-gray-500 text-sm">/mese + IVA</span></div>
                <div className="space-y-2 text-sm">
                  {['Tutto Growth più:', 'Fino a 15 utenti', 'Automazioni avanzate', 'Piani salute', 'Programma fedeltà', 'Lab Network completo', 'Analytics avanzati', 'Report mensili', 'AI assistente'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /><span className={`text-gray-700 ${i === 0 ? 'font-semibold' : ''}`}>{f}</span></div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Scegli Pro</Button>
              </CardContent>
            </Card>

            {/* LAB PARTNER */}
            <Card className="border-purple-200 hover:shadow-lg transition">
              <CardContent className="p-6">
                <h3 className="font-bold text-purple-700 text-lg mb-1">Lab Partner</h3>
                <p className="text-xs text-gray-500 mb-4">Per laboratori di analisi</p>
                <div className="mb-4"><span className="text-3xl font-bold text-purple-700">€39</span><span className="text-gray-500 text-sm">/mese + IVA</span></div>
                <p className="text-xs text-purple-600 mb-3 font-medium">Gratis per 6 mesi</p>
                <div className="space-y-2 text-sm">
                  {['Dashboard laboratorio', 'Profilo pubblico', 'Listino prezzi', 'Gestione richieste', 'Upload referti PDF', 'Notifiche email', 'Disponibilità ritiro'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500" /><span className="text-gray-700">{f}</span></div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6 border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Registra il Lab</Button>
              </CardContent>
            </Card>

            {/* ENTERPRISE */}
            <Card className="border-gray-300 bg-gradient-to-br from-gray-900 to-gray-800 hover:shadow-lg transition">
              <CardContent className="p-6">
                <h3 className="font-bold text-white text-lg mb-1">Enterprise</h3>
                <p className="text-xs text-gray-400 mb-4">Per gruppi multi-sede e network</p>
                <div className="mb-4"><span className="text-3xl font-bold text-white">Custom</span></div>
                <div className="space-y-2 text-sm">
                  {['Sedi illimitate', 'Utenti illimitati', 'Account manager dedicato', 'Onboarding personalizzato', 'API e integrazioni', 'SLA garantito', 'Fatturazione centralizzata'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-coral-400" /><span className="text-gray-300">{f}</span></div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6 border-gray-600 text-white hover:bg-gray-700" onClick={() => scrollToSection('contatti')}>Contattaci</Button>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6 italic">Non devi cambiare gestionale per iniziare: VetBuddy può lavorare accanto ai tuoi strumenti attuali.</p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PILOT MILANO */}
      {/* ============================================================ */}
      <section id="pilot" className="py-16 px-4 bg-gradient-to-br from-coral-50 via-orange-50/30 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-coral-100 text-coral-700 mb-4">🏙️ Pilot Milano</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">90 giorni per misurare quante telefonate, ore e prenotazioni VetBuddy genera per la tua clinica.</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Piano Growth gratuito per 90 giorni. Nessun vincolo. Se non ti convince, non paghi nulla.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900">Cosa include il Pilot:</h3>
              {[
                { icon: CheckCircle, text: 'Onboarding e configurazione iniziale inclusi' },
                { icon: CheckCircle, text: 'Configurazione servizi, orari e link prenotazione' },
                { icon: CheckCircle, text: 'Import clienti e pazienti da CSV' },
                { icon: CheckCircle, text: 'Supporto avvio dedicato' },
                { icon: CheckCircle, text: 'Dashboard valore attiva dal primo mese' },
                { icon: CheckCircle, text: 'Report a fine pilot con risultati misurabili' },
                { icon: CheckCircle, text: 'Estensione possibile se servono più dati' },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-3"><p.icon className="h-5 w-5 text-coral-500" /><span className="text-gray-700">{p.text}</span></div>
              ))}
            </div>
            <div>
              {pilotSubmitted ? (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">Candidatura inviata!</h3>
                    <p className="text-green-600">Ti contatteremo entro 48 ore per organizzare l'onboarding.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-coral-200">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-bold text-lg text-gray-900 text-center">Candidati al Pilot</h3>
                    <div>
                      <Label className="text-sm text-gray-600">Nome clinica *</Label>
                      <Input value={pilotForm.clinicName} onChange={(e) => setPilotForm(f => ({...f, clinicName: e.target.value}))} placeholder="Es. Clinica Veterinaria Brera" className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm text-gray-600">Città</Label>
                        <Input value={pilotForm.city} onChange={(e) => setPilotForm(f => ({...f, city: e.target.value}))} placeholder="Milano" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Telefono</Label>
                        <Input value={pilotForm.phone} onChange={(e) => setPilotForm(f => ({...f, phone: e.target.value}))} placeholder="+39..." className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Email *</Label>
                      <Input type="email" value={pilotForm.email} onChange={(e) => setPilotForm(f => ({...f, email: e.target.value}))} placeholder="info@clinica.it" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Note (opzionale)</Label>
                      <Textarea value={pilotForm.message} onChange={(e) => setPilotForm(f => ({...f, message: e.target.value}))} rows={2} placeholder="Quanti veterinari, pazienti attivi..." className="mt-1" />
                    </div>
                    <Button className="w-full bg-coral-500 hover:bg-coral-600 text-white py-5" onClick={handlePilotSubmit} disabled={pilotSubmitting}>
                      {pilotSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Candidati al Pilot Milano
                    </Button>
                    <p className="text-xs text-gray-400 text-center">Nessun costo, nessun vincolo. Rispondiamo entro 48h.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CONTATTI */}
      {/* ============================================================ */}
      <section id="contatti" className="py-12 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vuoi saperne di più?</h2>
          <p className="text-gray-600 mb-6">Prenota una demo personalizzata o scrivici per qualsiasi domanda.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => scrollToSection('pilot')}>
              <Calendar className="mr-2 h-5 w-5" /> Prenota una demo
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = 'mailto:info@vetbuddy.it'}>
              <Mail className="mr-2 h-5 w-5" /> info@vetbuddy.it
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FAQ */}
      {/* ============================================================ */}
      <section id="faq" className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Domande frequenti</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: 'VetBuddy sostituisce il mio gestionale?', a: 'No. VetBuddy non è un gestionale completo. È un copilota operativo che lavora accanto ai tuoi strumenti attuali per automatizzare prenotazioni, reminder, comunicazioni e follow-up. Puoi usarlo insieme al tuo gestionale senza problemi.' },
              { q: 'VetBuddy emette la Ricetta Elettronica Veterinaria?', a: 'No. VetBuddy aiuta a preparare, organizzare e archiviare il flusso della REV. L\'emissione ufficiale resta in capo al medico veterinario abilitato, che opera con le proprie credenziali sul sistema nazionale (es. Vetinfo).' },
              { q: 'I pagamenti dei clienti passano da VetBuddy?', a: 'No. VetBuddy non è un intermediario di pagamento per i servizi veterinari. I pagamenti delle visite avvengono direttamente tra clinica e proprietario. VetBuddy incassa esclusivamente l\'abbonamento della piattaforma.' },
              { q: 'Quanto costa per i proprietari di animali?', a: 'Zero. L\'app proprietario è completamente gratuita. Nessun costo nascosto, mai.' },
              { q: 'Cos\'è il Pilot Milano?', a: '90 giorni di Piano Growth gratuito per cliniche selezionate a Milano e provincia. Include onboarding, configurazione, import dati e supporto. A fine pilot ricevi un report con i risultati misurabili.' },
              { q: 'Posso annullare in qualsiasi momento?', a: 'Sì. Nessun vincolo contrattuale. Puoi annullare l\'abbonamento quando vuoi dalla sezione Impostazioni.' },
              { q: 'Come funziona il Lab Network?', a: 'La clinica richiede un\'analisi dalla scheda del paziente, il laboratorio la riceve, la processa e carica il referto. Il veterinario lo rivede, aggiunge note cliniche e decide quando renderlo visibile al proprietario.' },
              { q: 'Serve una formazione tecnica per usarlo?', a: 'No. VetBuddy è progettato per essere intuitivo. L\'onboarding è incluso e il supporto è sempre disponibile via email e chat.' },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-lg border px-4">
                <AccordionTrigger className="text-left font-semibold text-gray-900 py-4">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA FINALE */}
      {/* ============================================================ */}
      <section className="py-12 px-4 bg-gradient-to-r from-coral-500 to-orange-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Pronto a ridurre le telefonate e aumentare le prenotazioni?</h2>
          <p className="text-white/80 mb-6">Ogni mese sai esattamente quanto tempo hai risparmiato e quante visite sono state generate.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-white text-coral-600 hover:bg-gray-100 px-8" onClick={() => scrollToSection('pilot')}>Candidati al Pilot</Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Registrati gratis</Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div>
              <NewBrandLogo size="md" variant="light" />
              <p className="text-gray-400 text-sm mt-2">Il copilota operativo per cliniche veterinarie.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Piattaforma</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <button onClick={() => scrollToSection('moduli')} className="block hover:text-white transition">Moduli</button>
                <button onClick={() => scrollToSection('prezzi')} className="block hover:text-white transition">Prezzi</button>
                <button onClick={() => scrollToSection('lab-network')} className="block hover:text-white transition">Lab Network</button>
                <a href="/presentazione" className="block hover:text-white transition">Brochure</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Risorse</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="/tutorial" className="block hover:text-white transition">Guide e Tutorial</a>
                <button onClick={() => scrollToSection('faq')} className="block hover:text-white transition">FAQ</button>
                <button onClick={() => scrollToSection('contatti')} className="block hover:text-white transition">Contattaci</button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legale</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="/privacy" className="block hover:text-white transition">Privacy Policy</a>
                <a href="/termini" className="block hover:text-white transition">Termini di Servizio</a>
                <a href="/cookie-policy" className="block hover:text-white transition">Cookie Policy</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
            <p>© {new Date().getFullYear()} VetBuddy. Tutti i diritti riservati.</p>
            <p>Made with ❤️ in Milano</p>
          </div>
        </div>
      </footer>

      {/* AUTH DIALOG */}
      <Dialog open={showAuth} onOpenChange={(open) => { setShowAuth(open); if (!open) setPendingAction(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? 'Accedi a VetBuddy' : 'Registrati su VetBuddy'}</DialogTitle>
            <DialogDescription>
              {authMode === 'login' ? 'Inserisci le tue credenziali per accedere' : 'Crea il tuo account gratuito'}
            </DialogDescription>
          </DialogHeader>
          {pendingAction && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
              <p className="text-sm text-amber-800">{getActionMessage()}</p>
            </div>
          )}
          <AuthForm
            mode={authMode}
            setMode={setAuthMode}
            onLogin={(user) => { setShowAuth(false); setPendingAction(null); onLogin(user); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FullLandingPage;
