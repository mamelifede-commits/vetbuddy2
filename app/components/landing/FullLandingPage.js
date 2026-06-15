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
  ArrowRight, PhoneOff, CalendarCheck, Repeat, Brain, Sparkles, Target, Timer, Video, Link2,
  Bot, CalendarX, Rocket, Database, QrCode, Syringe, Plane, Share2, AlertTriangle, AlertCircle, CheckSquare, Home, GraduationCap,
  Scissors, Calculator, Package, CreditCard, Smartphone, ShoppingCart, Apple, Watch, Siren, ShieldCheck, Briefcase, Mic, Wrench,
  Microscope, Leaf, DollarSign, Camera
} from 'lucide-react';

function FullLandingPage({ onLogin }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pilotForm, setPilotForm] = useState({ clinicName: '', city: '', email: '', phone: '', message: '' });
  const [pilotSubmitting, setPilotSubmitting] = useState(false);
  const [pilotSubmitted, setPilotSubmitted] = useState(false);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const scrollToSection = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); };

  useEffect(() => {
    // Check if user has token - if yes, don't show modal or landing
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('vetbuddy_token');
      if (token) {
        // User is logged in, close any modals and let page.js handle the redirect
        setShowAuth(false);
        return;
      }
      
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
      {/* Progetto pilota Banner */}
      <div className="bg-gradient-to-r from-coral-500 to-orange-500 text-white text-center py-2.5 px-4 text-sm">
        <span className="font-semibold">🏙️ Progetto pilota Milano</span> — 90 giorni per misurare il valore generato da VetBuddy nella tua clinica. <button onClick={() => scrollToSection('pilot')} className="underline font-semibold ml-1">Candidati →</button>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <NewBrandLogo size="md" />
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => scrollToSection('soluzione')} className="text-gray-600 hover:text-coral-500 transition">Soluzione</button>
            <button onClick={() => scrollToSection('moduli')} className="text-gray-600 hover:text-coral-500 transition">Moduli</button>
            <button onClick={() => scrollToSection('lab-network')} className="text-purple-600 hover:text-purple-700 font-medium transition">🧪 Rete laboratori</button>
            <button onClick={() => scrollToSection('prezzi')} className="text-gray-600 hover:text-coral-500 transition">Prezzi</button>
            <button onClick={() => scrollToSection('pilot')} className="text-gray-600 hover:text-coral-500 transition">Progetto pilota</button>
            <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-coral-500 transition">FAQ</button>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { window.location.href = '/login'; }}>Accedi</Button>
            <Button size="sm" className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Prova Gratis</Button>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-4 px-4 shadow-lg">
            <div className="flex flex-col gap-2">
              <button onClick={() => { scrollToSection('soluzione'); }} className="text-gray-600 text-left py-2 hover:text-coral-500">Soluzione</button>
              <button onClick={() => { scrollToSection('moduli'); }} className="text-gray-600 text-left py-2 hover:text-coral-500">Moduli</button>
              <button onClick={() => { scrollToSection('lab-network'); }} className="text-purple-600 text-left py-2 font-medium">🧪 Rete laboratori</button>
              <button onClick={() => { scrollToSection('prezzi'); }} className="text-gray-600 text-left py-2 hover:text-coral-500">Prezzi</button>
              <button onClick={() => { scrollToSection('pilot'); }} className="text-gray-600 text-left py-2 hover:text-coral-500">Progetto pilota</button>
              <a href="/presentazione" className="text-gray-600 text-left py-2 hover:text-coral-500 block">Brochure</a>
              <div className="flex gap-2 pt-2 border-t mt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { window.location.href = '/login'; }}>Accedi</Button>
                <Button size="sm" className="flex-1 bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); setMobileMenuOpen(false); }}>Prova Gratis</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ============================================================ */}
      {/* HERO — Nuovo posizionamento Ecosistema */}
      {/* ============================================================ */}
      <section className="pt-16 pb-16 px-4 bg-gradient-to-br from-white via-coral-50/30 to-blue-50/30 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge className="bg-coral-100 text-coral-700 mb-6 text-sm px-4 py-1.5">🌐 Tre attori, un solo ecosistema</Badge>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Più prenotazioni. Meno telefonate.<br className="hidden md:block" />
            <span className="text-coral-500">Tutto il tuo ecosistema veterinario collegato.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            VetBuddy collega <strong>cliniche, proprietari e laboratori</strong> in un&apos;unica piattaforma operativa: prenotazioni, promemoria, WhatsApp, referti, Passport, richiami, no-show, follow-up e valore misurabile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 flex-wrap">
            <Button size="lg" className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-6 text-base" onClick={() => window.location.href = '/login?mode=register&role=clinic'}>
              Prova gratis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-6 py-6 text-base border-coral-300 text-coral-700 hover:bg-coral-50" onClick={() => scrollToSection('pilot')}>
              Candidati al Pilot 90 giorni
            </Button>
            <Button variant="outline" size="lg" className="px-6 py-6 text-base" onClick={() => window.location.href = '/login?mode=register&role=owner'}>
              Invita la tua clinica
            </Button>
            <Button variant="outline" size="lg" className="px-6 py-6 text-base" onClick={() => window.location.href = '/login?mode=register&role=lab'}>
              Diventa laboratorio partner
            </Button>
          </div>
          <p className="text-sm text-gray-500 mb-12 italic">
            VetBuddy non sostituisce il gestionale della clinica. Lo potenzia con uno strato operativo intelligente.
          </p>

          {/* Risultati chiave — numeri impatto */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: PhoneOff, value: 'Fino a -70%', label: 'Telefonate (obiettivo pilot)', color: 'text-red-500' },
              { icon: CalendarCheck, value: 'Fino a +40%', label: 'Prenotazioni online (obiettivo pilot)', color: 'text-green-500' },
              { icon: Timer, value: 'Fino a 15h', label: 'Risparmiate/mese (obiettivo pilot)', color: 'text-blue-500' },
              { icon: Repeat, value: 'Fino a +25%', label: 'Clienti che tornano (obiettivo pilot)', color: 'text-purple-500' },
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
      {/* TRE ATTORI - UN SOLO ECOSISTEMA */}
      {/* ============================================================ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">🌐 Una sola rete</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tre attori, un solo ecosistema</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Cliniche, proprietari e laboratori in un&apos;unica rete operativa. Tutti collegati. Meno caos, più valore.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-coral-50 to-orange-50 border-2 border-coral-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-coral-500 rounded-xl flex items-center justify-center mb-4">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Cliniche</h3>
              <p className="text-sm text-gray-600 mb-4">Riduci telefonate, automatizza promemoria, recupera no-show, invia referti e fai tornare i clienti.</p>
              <ul className="text-sm space-y-2 mb-4">
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-coral-500 mt-0.5 flex-shrink-0" /><span>Prenotazioni online + QR reception</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-coral-500 mt-0.5 flex-shrink-0" /><span>Automazioni + WhatsApp + referti</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-coral-500 mt-0.5 flex-shrink-0" /><span>Lab Marketplace + Cruscotto valore</span></li>
              </ul>
              <Badge className="bg-coral-500 text-white">Prova gratis 14gg → da €29/mese</Badge>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Proprietari</h3>
              <p className="text-sm text-gray-600 mb-4">Prenota online, gestisci il Passport del tuo animale, ricevi documenti autorizzati e promemoria.</p>
              <ul className="text-sm space-y-2 mb-4">
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" /><span>Passport sanitario + QR emergenza</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" /><span>Prenotazioni e documenti unificati</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" /><span>Condivisione con pet sitter / familiari</span></li>
              </ul>
              <Badge className="bg-emerald-500 text-white">Gratis per sempre</Badge>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                <FlaskConical className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Laboratori</h3>
              <p className="text-sm text-gray-600 mb-4">Ricevi richieste dalle cliniche, aggiorna gli stati e carica referti PDF in modo ordinato.</p>
              <ul className="text-sm space-y-2 mb-4">
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" /><span>Marketplace + listini indicativi</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" /><span>Richieste e referti digitali</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" /><span>Invito cliniche partner</span></li>
              </ul>
              <Badge className="bg-blue-500 text-white">Pilot 6 mesi gratis → poi €39/mese</Badge>
            </div>
          </div>

          {/* Chi invita chi */}
          <div className="mt-12 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl p-6 border border-purple-200">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">🔗 Chi invita chi — VetBuddy Connect</h3>
              <p className="text-sm text-gray-600">Una rete che cresce con te. Ogni attore può portare un altro nella piattaforma.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="font-semibold text-purple-700 mb-1">🐾 → 🏥</p>
                <p className="text-gray-600 text-xs">Proprietari invitano cliniche</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="font-semibold text-purple-700 mb-1">🏥 → 🐾</p>
                <p className="text-gray-600 text-xs">Cliniche invitano proprietari</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="font-semibold text-purple-700 mb-1">🏥 → 🔬</p>
                <p className="text-gray-600 text-xs">Cliniche invitano laboratori</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="font-semibold text-purple-700 mb-1">🔬 → 🏥</p>
                <p className="text-gray-600 text-xs">Laboratori invitano cliniche</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* NON CAMBI GESTIONALE */}
      {/* ============================================================ */}
      <section className="py-12 px-4 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-y border-purple-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-purple-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Non cambi gestionale. Aggiungi uno strato operativo intelligente.</h2>
          </div>
          <p className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto">
            <strong>VetBuddy lavora accanto agli strumenti già usati dalla clinica.</strong> Non obbliga a migrare tutto, non sostituisce i flussi principali, ma <strong>automatizza prenotazioni, comunicazioni, promemoria, referti, richiami e follow-up.</strong>
          </p>
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
            {[
              { icon: CheckCircle, text: 'Nessuna migrazione forzata', color: 'text-green-600' },
              { icon: Zap, text: 'Si integra con i tuoi flussi', color: 'text-blue-600' },
              { icon: TrendingUp, text: 'Risultati misurabili in 90 giorni', color: 'text-purple-600' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/80 backdrop-blur p-4 rounded-lg border border-gray-200 shadow-sm">
                <item.icon className={`h-6 w-6 ${item.color} flex-shrink-0`} />
                <p className="text-sm font-semibold text-gray-900 text-left">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* COSA RISOLVE OGNI GIORNO */}
      {/* ============================================================ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-coral-100 text-coral-700 mb-4">💡 Cosa risolve VetBuddy</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cosa risolve ogni giorno nella tua clinica</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Problemi quotidiani che VetBuddy automatizza e risolve per te.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: 'Troppe telefonate ripetitive', desc: 'La segreteria passa ore al telefono per conferme, disdette e info.', solution: '→ Prenotazioni online + Agenda digitale + Link booking' },
              { icon: MessageCircle, title: 'WhatsApp dispersi tra più telefoni', desc: 'Messaggi sparsi, richieste su canali diversi, nessuna priorità.', solution: '→ WhatsApp Business + Inbox condivisa + AI Reception' },
              { icon: Calendar, title: 'Appuntamenti non confermati', desc: 'I clienti dimenticano, non confermano, arrivano in ritardo.', solution: '→ Promemoria automatici (24h prima, 1h prima) + SMS/Email/WhatsApp' },
              { icon: CalendarX, title: 'No-show difficili da recuperare', desc: 'Gli slot vuoti costano fatturato. Nessun sistema per recuperarli.', solution: '→ No-Show Recovery automatico + Lista d\'attesa intelligente' },
              { icon: FileText, title: 'Referti e documenti inviati manualmente', desc: 'Ogni referto va inviato a mano. Tempo perso e ritardi.', solution: '→ Invio automatico PDF + Referti digitali + Area proprietario' },
              { icon: Repeat, title: 'Clienti che non tornano per vaccini e richiami', desc: 'Senza ricontatti, i clienti si dimenticano dei controlli.', solution: '→ Richiami automatici vaccini + Antiparassitari + Check-up annuali' },
              { icon: Users, title: 'Staff sovraccarico da attività amministrative', desc: 'Troppo tempo perso in attività ripetitive invece di curare i pazienti.', solution: '→ Automazioni avanzate + Task Manager + Reception AI' },
              { icon: BarChart3, title: 'Nessun dato sul tempo risparmiato e valore generato', desc: 'La clinica non sa quante telefonate evita o quanto fatturato recupera.', solution: '→ Cruscotto Valore + Metriche ROI + Report mensili automatici' },
            ].map((p, i) => (
              <Card key={i} className="border-coral-100 hover:shadow-lg transition group">
                <CardContent className="p-6">
                  <div className="h-10 w-10 bg-coral-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-coral-100 transition"><p.icon className="h-5 w-5 text-coral-500" /></div>
                  <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{p.desc}</p>
                  <p className="text-xs font-semibold text-coral-600 bg-coral-50 px-3 py-2 rounded-lg">{p.solution}</p>
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
                { icon: Phone, text: 'WhatsApp Business integrato', desc: 'Gestisci tutti i messaggi WhatsApp in un\'unica inbox con template e stati di lettura.' },
                { icon: Bot, text: 'Reception AI per messaggi', desc: 'L\'AI classifica messaggi, suggerisce risposte e assegna priorità automaticamente.' },
                { icon: Bell, text: 'Promemoria e ricontatti automatici', desc: 'Niente più telefonate per ricordare appuntamenti, vaccini e controlli.' },
                { icon: CalendarX, text: 'No-Show Recovery attivo', desc: 'Lista d\'attesa, recupero slot, etichette rischio cliente. Ogni no-show diventa un\'opportunità.' },
                { icon: Star, text: 'Recensioni e Referral automatici', desc: 'Richieste recensioni post-visita e codici "Porta un Amico" per crescita organica.' },
                { icon: MessageCircle, text: 'Comunicazione centralizzata', desc: 'Un\'unica casella messaggi per richieste e notifiche. Ordine al posto del caos.' },
                { icon: FileText, text: 'Documenti e referti digitali', desc: 'Referti, certificati e prescrizioni inviati automaticamente al proprietario.' },
                { icon: FlaskConical, text: 'Rete laboratori integrata', desc: 'Richiedi analisi, ricevi referti, rivedi e condividi con il proprietario. Tutto in un flusso ordinato.' },
                { icon: Rocket, text: 'Pilot Success Kit 90 giorni', desc: 'Checklist onboarding, report automatici e risorse stampabili per garantire il successo.' },
                { icon: Database, text: 'Import/Export dati CSV', desc: 'Importa proprietari, animali, appuntamenti. Esporta tutto quando serve. Zero lock-in.' },
                { icon: TrendingUp, text: 'Cruscotto valore + ROI', desc: 'Ogni mese vedi tempo risparmiato, visite generate, no-show recuperati e ROI calcolato.' },
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
                  { label: 'Telefonate evitate (obiettivo)', value: 'Fino a 200/mese', icon: PhoneOff, color: 'text-red-500' },
                  { label: 'Ore risparmiate (obiettivo)', value: 'Fino a 28h/mese', icon: Timer, color: 'text-blue-500' },
                  { label: 'Prenotazioni online (obiettivo)', value: 'Fino a 87/mese', icon: CalendarCheck, color: 'text-green-500' },
                  { label: 'No-show recuperati (obiettivo)', value: 'Fino a 12/mese', icon: Shield, color: 'text-purple-500' },
                  { label: 'WhatsApp gestiti (obiettivo)', value: 'Fino a 267/mese', icon: Phone, color: 'text-green-600' },
                  { label: 'Recensioni ricevute (obiettivo)', value: 'Fino a 23/mese', icon: Star, color: 'text-amber-500' },
                  { label: 'Referral convertiti (obiettivo)', value: 'Fino a 8/mese', icon: Users, color: 'text-pink-600' },
                  { label: 'Clienti riattivati (obiettivo)', value: 'Fino a 20/mese', icon: Repeat, color: 'text-orange-500' },
                  { label: 'ROI stimato (obiettivo)', value: 'Fino a 340%', icon: TrendingUp, color: 'text-emerald-600' },
                  { label: 'Valore stimato generato (obiettivo)', value: 'Fino a €4.350/mese', icon: Euro, color: 'text-emerald-700' },
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
              <p className="text-xs text-gray-400 mt-4 text-center italic">*Obiettivi del progetto pilota. L'impatto viene misurato durante i 90 giorni.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4 MACRO-AREE */}
      {/* ============================================================ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-purple-100 text-purple-700 mb-4">🎯 Organizzazione</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">4 Macro-Aree. Un ecosistema completo.</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">VetBuddy organizza tutte le funzioni in 4 aree chiare per rendere il prodotto ricco ma non caotico.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* AREA 1 */}
            <Card className="border-2 border-blue-200 hover:shadow-xl transition">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Area 1 — Reception Intelligente</h3>
                    <p className="text-sm text-blue-600 font-semibold">Riduci il carico della reception</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    'Prenotazioni online', 'Agenda digitale', 'Google Calendar Sync', 
                    'Link prenotazione + QR code', 'WhatsApp Business', 'Inbox condivisa',
                    'AI Reception', 'Risposte suggerite', 'Priorità messaggi',
                    'Assegnazione staff', 'Task Manager'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AREA 2 */}
            <Card className="border-2 border-green-200 hover:shadow-xl transition">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Repeat className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Area 2 — Automazioni & Ritorni</h3>
                    <p className="text-sm text-green-600 font-semibold">Fai tornare i clienti al momento giusto</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    'Promemoria visite', 'Promemoria vaccini', 'Richiami annuali',
                    'Antiparassitari', 'Pulizia dentale', 'No-Show Recovery',
                    'Rischio no-show predittivo', 'Lista d\'attesa', 'Recensioni automatiche',
                    'Referral', 'Campagne clienti', 'Clienti dormienti',
                    'Alert variazione peso', 'Supporto lutto', 'Piani salute',
                    'Programma fedeltà'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AREA 3 */}
            <Card className="border-2 border-purple-200 hover:shadow-xl transition">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Area 3 — Gestione Clinica & Staff</h3>
                    <p className="text-sm text-purple-600 font-semibold">Organizza documenti e valore economico</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    'Schede animale', 'Storico visite', 'Referti PDF',
                    'Ricetta elettronica supporto', 'Laboratori', 'Task manager staff',
                    'Task automatici da automazioni', 'Import/export dati', 'Riepiloghi economici',
                    'Cruscotto valore', 'Listino servizi', 'Ricevute operative',
                    'Consensi digitali con firma', 'Preventivi digitali',
                    'Anamnesi pre-visita con foto/video', 'Magazzino & stock vaccini'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AREA 4 */}
            <Card className="border-2 border-orange-200 hover:shadow-xl transition">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Area 4 — Area Proprietario & Passport</h3>
                    <p className="text-sm text-orange-600 font-semibold">Esperienza digitale moderna per il proprietario</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    'Profilo animale', 'Documenti autorizzati', 'Passport digitale',
                    'QR emergenza', 'Modalità smarrimento', 'Condivisione temporanea',
                    'Travel Pack', 'Assicurazione', 'Promemoria personali',
                    'Programma fedeltà', 'Storico visite', 'Documenti'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MODULI PRINCIPALI */}
      {/* ============================================================ */}
      <section id="moduli" className="py-16 px-4 bg-gradient-to-br from-gray-50 via-white to-coral-50/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Moduli in Evidenza</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">I moduli più potenti e richiesti per trasformare la tua clinica veterinaria. <strong>Questi sono solo alcuni dei 103 moduli disponibili.</strong></p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Calendar, title: 'Agenda Smart', desc: 'Prenotazioni online 24/7, sincronizzazione Google Calendar, conferme automatiche WhatsApp, recovery no-show AI.', color: 'bg-coral-500', tag: 'Base' },
              { icon: MessageCircle, title: 'WhatsApp Business', desc: 'Inbox unificata messaggi clienti. Template pre-impostati. Stati lettura. Automazioni intelligenti per prenotazioni e promemoria.', color: 'bg-green-600', tag: 'Base' },
              { icon: Receipt, title: 'Fatturazione Elettronica XML', desc: 'Genera fatture XML conformi. Invio automatico SDI. Archiviazione 10 anni. Integrazione Agenzia Entrate. Zero errori fiscali.', color: 'bg-red-600', tag: 'Mercato IT' },
              { icon: Database, title: 'REV Registro Europeo', desc: 'Iscrizione automatica animali REV. Passaporto EU digitale. Notifiche viaggi esteri. Export certificati conformi normativa EU.', color: 'bg-blue-700', tag: 'Mercato IT' },
              { icon: Building2, title: 'Multi-Sede & Gestione Catene', desc: 'Dashboard consolidata catene veterinarie. Trasferimento pazienti, inventario condiviso, KPI comparativi sedi.', color: 'bg-indigo-700', tag: 'Enterprise' },
              { icon: Brain, title: 'VetBuddy Brain', desc: 'Super-Assistente AI multimodale. Analizza testo, immagini, dati clinici. Suggerisce diagnosi, terapie, esami. Accesso letteratura scientifica mondiale.', color: 'bg-violet-900', tag: 'Genius' },
              { icon: TrendingUp, title: 'Smart Referral Revenue Share', desc: 'Guadagna 15-20% su ogni referral (specialista, lab, fisioterapia). Win-win-win. Nuovo revenue stream passivo €1-3k/mese.', color: 'bg-emerald-800', tag: 'Genius' },
              { icon: Heart, title: 'Mental Wellness Hub for Vets', desc: 'Piattaforma benessere psicologico veterinari. Burnout altissimo (30% depressione). Supporto anonimo, terapia online, community. Retention staff +40%.', color: 'bg-pink-800', tag: 'Genius' },
              { icon: Briefcase, title: 'Veterinary Talent Marketplace', desc: 'LinkedIn vet con skill verification. Match score AI, portfolio casi, hiring tracciato. Risolve problema #1 settore. Risparmio €5-10k headhunter.', color: 'bg-blue-800', tag: 'Genius' },
              { icon: Heart, title: 'Pet Loss Grief Support', desc: 'Protocollo empatico post-eutanasia. Email, grief counselor, memorial digitale, albero memoria. Retention +25%, lifetime value protetto.', color: 'bg-rose-800', tag: 'Genius' },
              { icon: DollarSign, title: 'Dynamic Appointment Pricing', desc: 'Prezzi dinamici domanda (Uber-style). Slot bassi: -30%. Alta domanda: +10%. AI ottimizza revenue. +15-20% revenue, agenda piena.', color: 'bg-amber-800', tag: 'Genius' },
              { icon: Activity, title: 'Fisioterapia & Riabilitazione', desc: 'Due modalità: In-House (video-esercizi, tracking) + Network (marketplace centri specializzati). Protocolli guidati. Recupero +40% più veloce.', color: 'bg-teal-800', tag: 'Genius' },
            ].map((m, i) => (
              <Card key={i} className={`${m.color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <CardContent className="p-6">
                  {m.tag && <div className="absolute top-2 right-2"><Badge className="bg-white/20 text-white text-[10px]">{m.tag}</Badge></div>}
                  <m.icon className="h-8 w-8 mb-3 opacity-90" />
                  <h3 className="font-bold text-white mb-1.5 text-sm">{m.title}</h3>
                  <p className="text-xs text-white/90 leading-relaxed">{m.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <a href="/moduli" className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <span>Esplora tutti i 103 Moduli</span>
              <ChevronRight className="h-5 w-5" />
            </a>
            <p className="text-sm text-gray-500 mt-4">Scopri Base, Mercato IT, Enterprise, Innovation e tutti i moduli Genius</p>
          </div>
        </div>
      </section>
      <section id="lab-network" className="py-16 px-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-purple-100 text-purple-700 mb-4">🧪 Rete laboratori VetBuddy</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Il laboratorio carica. La clinica valida. Il proprietario riceve.</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Un flusso ordinato e professionale per gestire le analisi di laboratorio senza telefonate, email o fogli volanti.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-coral-500" /> Per la Clinica</h3>
              <div className="space-y-3">
                {[
                  'Invia richieste di esame dalla scheda animale',
                  'Seleziona il laboratorio in base a distanza, prezzo indicativo e tempi medi',
                  'Riceve notifiche sullo stato della richiesta',
                  'Rivede il referto prima di renderlo visibile al proprietario',
                  'Conserva lo storico richieste e referti',
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2"><Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" /><span className="text-sm text-gray-700">{f}</span></div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><FlaskConical className="h-5 w-5 text-purple-500" /> Per il Laboratorio</h3>
              <div className="space-y-3">
                {[
                  'Riceve richieste dalla clinica',
                  'Aggiorna lo stato della lavorazione',
                  'Carica referti PDF',
                  'Inserisce listino indicativo',
                  'Indica tempi medi',
                  'Segnala disponibilità ritiro campioni',
                  'Gestisce lo storico delle richieste',
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">L'area proprietario: il canale digitale con cui la clinica segue il cliente anche dopo la visita.</h2>
              <p className="text-gray-600 mb-6">Il proprietario riceve promemoria, referti e ricontatti senza intasare la segreteria. Tutto automatico, tutto ordinato.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Prenotazione online in pochi click',
                  'Profilo animale completo',
                  'Documenti e referti autorizzati dalla clinica',
                  'Promemoria visite e vaccini',
                  'Comunicazioni dalla clinica',
                  'Programma fedeltà configurabile',
                  'Storico visite e documenti',
                  'Accesso tramite area riservata',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle className="h-4 w-4 text-pink-500 flex-shrink-0" />{f}</div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-6 italic">L'area proprietario serve soprattutto a far tornare il cliente in clinica.</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 text-center">
              <PawPrint className="h-16 w-16 text-coral-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% Gratuita per il proprietario</h3>
              <p className="text-gray-600 text-sm mb-4">Per sempre, nessun costo nascosto. Il proprietario accede gratis e riceve tutto dalla clinica.</p>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Registrati gratis <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* VETBUDDY PASSPORT */}
      {/* ============================================================ */}
      <section className="py-16 px-4 bg-gradient-to-br from-amber-50 via-orange-50/30 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-amber-100 text-amber-700 mb-4">🐾 Nuovo</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Il passaporto digitale della salute dell'animale</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Con VetBuddy Passport, ogni proprietario ha documenti, vaccini, referti, allergie, farmaci, contatti di emergenza e QR personale sempre a portata di mano.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: QrCode, title: 'QR emergenza', desc: 'Un codice QR personale con contatti e informazioni essenziali in caso di smarrimento o urgenza.' },
              { icon: Syringe, title: 'Vaccini e richiami', desc: 'Tutti i vaccini registrati, con stato, scadenze e promemoria automatici per i richiami.' },
              { icon: FileText, title: 'Documenti e referti', desc: 'Referti, certificati, prescrizioni e documenti sempre consultabili e condivisibili.' },
              { icon: Plane, title: 'Travel Pack', desc: 'Checklist viaggio, documenti richiesti, alimentazione, farmaci e contatti utili per ogni trasferta.' },
              { icon: Share2, title: 'Condivisione pet sitter', desc: 'Condivisione temporanea con pet sitter, familiari o pensioni, con permessi e scadenza.' },
              { icon: AlertTriangle, title: 'Lost Pet Mode', desc: 'In caso di smarrimento, il QR mostra lo stato e un pulsante per segnalare il ritrovamento.' },
            ].map((f, i) => (
              <Card key={i} className="hover:shadow-md transition">
                <CardContent className="p-4">
                  <f.icon className="h-6 w-6 text-amber-500 mb-2" />
                  <h3 className="font-semibold text-sm text-gray-900">{f.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-coral-200 bg-coral-50/50">
              <CardContent className="p-5">
                <h3 className="font-bold text-sm text-coral-700 mb-2">Per la clinica</h3>
                <p className="text-sm text-gray-600">Meno richieste manuali, più clienti autonomi e più ritorni grazie a promemoria, richiami e Passport sempre aggiornato.</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-5">
                <h3 className="font-bold text-sm text-amber-700 mb-2">Per il proprietario</h3>
                <p className="text-sm text-gray-600">Tutto ciò che serve per la salute e la sicurezza del tuo animale, sempre a portata di mano.</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8" onClick={() => scrollToSection('pilot')}>
              Attiva Passport nella tua clinica
            </Button>
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
          <div className="text-center mb-8">
            <Badge className="bg-coral-100 text-coral-700 mb-4">💰 Prezzi</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Scegli il piano adatto alla tua clinica</h2>
            <p className="text-gray-600 mb-2">Scegli il piano in base alla dimensione della clinica e al livello di automazione che vuoi attivare.</p>
            <p className="text-sm text-gray-500">Tutti i prezzi sono IVA esclusa. Abbonamento mensile. Nessun vincolo annuale obbligatorio. Puoi annullare prima del rinnovo successivo.</p>
          </div>

          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-coral-50 to-purple-50 border border-coral-200 rounded-xl p-6 mb-8 text-center">
            <p className="text-gray-800 font-medium">
              💡 <strong>Se VetBuddy recupera anche pochi appuntamenti al mese o riduce ore di lavoro ripetitivo, il costo del piano può essere ampiamente compensato dal valore generato.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
            {/* STARTER */}
            <Card className="border-gray-200 hover:shadow-lg transition flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">Starter</h3>
                <p className="text-xs text-gray-500 mb-2">Per iniziare</p>
                <p className="text-xs text-blue-600 font-medium mb-3">Veterinari freelance e professionisti singoli</p>
                <div className="mb-4"><span className="text-3xl font-bold text-gray-900">€29</span><span className="text-gray-500 text-sm">/mese + IVA</span></div>
                <p className="text-xs text-gray-600 mb-4 italic">Per iniziare a ricevere prenotazioni online e ridurre le telefonate di base.</p>
                <div className="space-y-2 text-sm flex-1">
                  {['1 sede', '1 utente', 'Profilo pubblico', 'Link prenotazione', 'Agenda base', 'Promemoria base', 'Passport base', 'Fino a 30 prenotazioni/mese'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /><span className="text-gray-700">{f}</span></div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Inizia con Starter</Button>
              </CardContent>
            </Card>

            {/* CRESCITA */}
            <Card className="border-coral-300 ring-2 ring-coral-200 hover:shadow-lg transition relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-coral-500 text-white px-3">⭐ Consigliato</Badge></div>
              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-coral-600 text-lg mb-1">Crescita</h3>
                <p className="text-xs text-gray-500 mb-2">Piano consigliato</p>
                <p className="text-xs text-coral-600 font-medium mb-3">Per cliniche piccole e medie</p>
                <div className="mb-4"><span className="text-3xl font-bold text-coral-600">€69</span><span className="text-gray-500 text-sm">/mese + IVA</span></div>
                <p className="text-xs text-gray-600 mb-4 italic">Il piano consigliato per ridurre telefonate, automatizzare promemoria e seguire meglio i clienti.</p>
                <div className="space-y-2 text-sm flex-1">
                  {['Fino a 5 utenti', 'Prenotazioni illimitate', 'Agenda digitale', 'Promemoria automatici', 'Documenti e PDF', 'Passport completo', 'QR emergenza', 'Area proprietario', 'Casella messaggi', 'Cruscotto valore', 'Richieste laboratorio', 'WhatsApp Business', 'Reception AI base', 'No-Show Recovery', 'Import/Export CSV', '🎁 Progetto pilota 90gg gratis'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-coral-500 flex-shrink-0" /><span className="text-gray-700">{f}</span></div>
                  ))}
                </div>
                <Button className="w-full mt-6 bg-coral-500 hover:bg-coral-600 text-white" onClick={() => scrollToSection('pilot')}>Candidati al Pilota 90gg</Button>
              </CardContent>
            </Card>

            {/* PRO */}
            <Card className="border-purple-200 hover:shadow-lg transition flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-purple-700 text-lg mb-1">Pro</h3>
                <p className="text-xs text-gray-500 mb-2">Per crescita avanzata</p>
                <p className="text-xs text-purple-600 font-medium mb-3">Cliniche strutturate con team più grandi</p>
                <div className="mb-4"><span className="text-3xl font-bold text-purple-700">€99</span><span className="text-gray-500 text-sm">/mese + IVA</span></div>
                <p className="text-xs text-gray-600 mb-4 italic">Per cliniche che vogliono automazioni avanzate, piani salute, laboratori e assistente intelligente.</p>
                <div className="space-y-2 text-sm flex-1">
                  {['✅ Tutto il piano Crescita', 'Fino a 15 utenti', 'Automazioni avanzate', 'Piani salute', 'Programma fedeltà', 'Rete laboratori completa', 'Passport + QR brandizzato', 'Riepiloghi avanzati', 'Rendiconti mensili', 'Assistente intelligente', 'Campagne clienti avanzate', 'Task manager staff', 'No-Show Recovery avanzato', 'Clienti dormienti', 'Alert pazienti critici'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2"><Check className={`h-4 w-4 ${i === 0 ? 'text-purple-600' : 'text-green-500'} flex-shrink-0`} /><span className={`text-gray-700 ${i === 0 ? 'font-semibold' : ''}`}>{f}</span></div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6 border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Richiedi Demo Pro</Button>
              </CardContent>
            </Card>

            {/* LABORATORIO PARTNER */}
            <Card className="border-indigo-200 hover:shadow-lg transition flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-indigo-700 text-lg mb-1">Laboratorio Partner</h3>
                <p className="text-xs text-gray-500 mb-2">Per laboratori analisi</p>
                <p className="text-xs text-indigo-600 font-medium mb-3">Ricevi richieste dalle cliniche</p>
                <div className="mb-4"><span className="text-3xl font-bold text-indigo-700">€39</span><span className="text-gray-500 text-sm">/mese + IVA</span></div>
                <p className="text-xs text-indigo-600 mb-3 font-bold">🎁 Gratis per 6 mesi</p>
                <p className="text-xs text-gray-600 mb-4 italic">Per ricevere richieste dalle cliniche, gestire referti e aumentare la visibilità nella rete VetBuddy.</p>
                <div className="space-y-2 text-sm flex-1">
                  {['Pannello gestione richieste', 'Profilo vetrina laboratori', 'Listino prezzi indicativo', 'Gestione richieste', 'Caricamento referti PDF', 'Notifiche automatiche', 'Disponibilità ritiro', 'Storico richieste'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-500 flex-shrink-0" /><span className="text-gray-700">{f}</span></div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6 border-indigo-300 text-indigo-700 hover:bg-indigo-50" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Diventa Partner</Button>
              </CardContent>
            </Card>

            {/* ENTERPRISE */}
            <Card className="border-gray-300 bg-gradient-to-br from-gray-900 to-gray-800 hover:shadow-lg transition flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-white text-lg mb-1">Enterprise</h3>
                <p className="text-xs text-gray-400 mb-2">Su misura</p>
                <p className="text-xs text-gray-300 font-medium mb-3">Per gruppi multi-sede e network</p>
                <div className="mb-4"><span className="text-3xl font-bold text-white">Custom</span></div>
                <div className="space-y-2 text-sm flex-1">
                  {['Sedi illimitate', 'Utenti illimitati', 'Account manager dedicato', 'Onboarding personalizzato', 'API e integrazioni', 'SLA garantito', 'Reportistica centralizzata'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-coral-400" /><span className="text-gray-300">{f}</span></div>
                  ))}
                </div>
                <Button className="w-full mt-6 bg-white text-gray-900 hover:bg-gray-100 font-semibold" onClick={() => scrollToSection('contatti')}>Contattaci</Button>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6 italic">Non devi cambiare gestionale per iniziare: VetBuddy lavora accanto ai tuoi strumenti attuali. Puoi iniziare senza migrare tutti i dati o cambiare i flussi principali della clinica.</p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PROGETTO PILOTA MILANO */}
      {/* ============================================================ */}
      <section id="pilot" className="py-16 px-4 bg-gradient-to-br from-coral-50 via-orange-50/30 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-coral-100 text-coral-700 mb-4">🏙️ Progetto pilota Milano</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Progetto pilota Milano: 90 giorni per misurare il valore generato da VetBuddy nella tua clinica.</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Piano Crescita gratuito per 90 giorni. Nessun vincolo. Alla fine del progetto pilota ricevi un riepilogo con prenotazioni generate, telefonate evitate, promemoria inviati, tempo risparmiato e clienti riattivati.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900">Cosa include il Progetto pilota:</h3>
              {[
                { icon: CheckCircle, text: 'Onboarding e configurazione iniziale inclusi' },
                { icon: CheckCircle, text: 'Configurazione servizi, orari e link prenotazione' },
                { icon: CheckCircle, text: 'Import clienti e pazienti da CSV' },
                { icon: CheckCircle, text: 'Supporto avvio dedicato' },
                { icon: CheckCircle, text: 'Cruscotto del valore attivo dal primo mese' },
                { icon: CheckCircle, text: 'Riepilogo a fine progetto pilota con risultati misurabili' },
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
                    <h3 className="font-bold text-lg text-gray-900 text-center">Candidati al Progetto pilota</h3>
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
                      Candidati al Progetto pilota Milano
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
      {/* FAQ — compattata: 8 top + toggle "mostra tutte" */}
      {/* ============================================================ */}
      <section id="faq" className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-coral-100 text-coral-700 mb-3">❓ FAQ</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Domande frequenti</h2>
            <p className="text-gray-600 text-sm">Le risposte più richieste su VetBuddy. Espandi per vedere tutte.</p>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              // TOP 8 FAQ — Ecosistema, Prezzi, Prova gratis, Sicurezza, ROI
              { q: 'Come funziona VetBuddy come ecosistema?', a: 'VetBuddy collega tre attori in una sola rete operativa: cliniche, proprietari e laboratori. Le cliniche invitano proprietari e laboratori, i proprietari invitano la loro clinica, i laboratori invitano cliniche partner. Tutti collegati. Meno caos, più valore.' },
              { q: 'Quanto costa per i proprietari di animali?', a: 'Zero. L\'area proprietario è completamente gratuita per il proprietario dell\'animale. Nessun costo nascosto, mai.' },
              { q: 'Posso provare VetBuddy gratis come clinica?', a: 'Sì. Hai 14 giorni di prova gratuita sui piani Starter e Growth. Se vuoi misurare il valore in modo strutturato, puoi candidarti al Pilot 90 giorni con onboarding guidato, checklist e report ROI finale.' },
              { q: 'Quali sono i piani e i prezzi?', a: 'Starter €29/mese (freelance e micro-cliniche), Growth €69/mese (cliniche piccole/medie, consigliato), Pro €99/mese (cliniche strutturate con automazioni avanzate), Laboratorio Partner €39/mese (pilot 6 mesi gratis). Tutti +IVA. Mensile, senza vincolo annuale.' },
              { q: 'Devo cambiare il mio gestionale?', a: 'No. VetBuddy non sostituisce il gestionale della clinica. Lo potenzia con uno strato operativo intelligente: prenotazioni online, WhatsApp, promemoria, referti, richiami, no-show, follow-up, Passport e cruscotto valore.' },
              { q: 'Come funziona il Pilot 90 giorni?', a: 'Pilot 90 giorni per misurare il valore reale generato dalla clinica. Include onboarding guidato con Pilot Success Kit, checklist 30/60/90 giorni, configurazione personalizzata, supporto dedicato. Alla fine ricevi un report completo con prenotazioni generate, telefonate evitate, no-show recuperati, ROI calcolato.' },
              { q: 'I dati sono al sicuro? Compliance GDPR?', a: 'Sì. VetBuddy è conforme al GDPR: il proprietario vede solo i suoi animali, la clinica solo i suoi clienti, il laboratorio solo le sue richieste. Le condivisioni Passport sono temporanee e revocabili. I dati sensibili non sono mai pubblici.' },
              { q: 'Come funziona VetBuddy Connect?', a: 'È il modulo unificato per gli inviti reciproci tra cliniche, proprietari e laboratori. Ogni attore può invitare un altro: il proprietario invita la clinica, la clinica invita proprietari e laboratori, il laboratorio invita le cliniche partner. Con tracking stato, profili provvisori e claim profile per chi non è ancora registrato.' },
              ...(!showAllFaqs ? [] : [
              { q: 'Come funziona WhatsApp Business su VetBuddy?', a: 'VetBuddy integra WhatsApp Business per gestire tutti i messaggi dei clienti in un\'unica inbox. Puoi usare template pre-impostati, vedere stati di lettura e classificare messaggi. L\'integrazione è simulata per demo, pronta per connessione API reale.' },
              { q: 'Cos\'è la Reception AI e cosa fa?', a: 'La Reception AI classifica automaticamente i messaggi WhatsApp per categoria (urgenza, appuntamento, richiesta referto, ecc.), assegna priorità e suggerisce risposte. Include un DISCLAIMER MEDICO chiaro: l\'AI non sostituisce la diagnosi veterinaria. Ogni decisione clinica resta del veterinario.' },
              { q: 'Come funziona il No-Show Recovery?', a: 'Il modulo traccia appuntamenti non confermati, assegna etichette rischio cliente (affidabile/attenzione/alto rischio), gestisce una lista d\'attesa e recupera slot cancellati. Ogni no-show diventa un\'opportunità per riempire l\'agenda e recuperare fatturato.' },
              { q: 'Cosa sono le Recensioni e i Referral?', a: 'VetBuddy invia automaticamente richieste di recensioni via WhatsApp o email 24h dopo ogni visita. Il programma "Porta un Amico" genera codici referral unici per ogni cliente: chi porta un amico riceve uno sconto, così come il nuovo cliente. Crescita organica automatizzata.' },
              { q: 'Cos\'è il Pilot Success Kit?', a: 'È il programma di onboarding strutturato a 90 giorni con checklist guidata (30/60/90 giorni), report automatici ai milestone, risorse stampabili (QR code, flyer) e tracking KPI completo. Garantisce il successo dell\'adozione della piattaforma nella tua clinica.' },
              { q: 'Posso importare ed esportare i miei dati?', a: 'Sì! VetBuddy include Import/Export CSV per proprietari, animali e appuntamenti. Importi con validazione automatica (ti avvisa di errori riga per riga) ed esporti quando vuoi. Zero lock-in: i tuoi dati restano sempre accessibili.' },
              { q: 'Come viene calcolato il ROI?', a: 'Il cruscotto valore calcola automaticamente: ore risparmiate × costo staff, prenotazioni online × valore medio visita, no-show recuperati × valore slot, WhatsApp gestiti, recensioni ricevute, referral convertiti. Il ROI è: (Valore generato - Costo piattaforma) / Costo piattaforma × 100.' },
              { q: 'VetBuddy emette la Ricetta Elettronica Veterinaria?', a: 'No. VetBuddy supporta la preparazione, la gestione e l\'archiviazione del flusso prescrittivo. L\'emissione ufficiale resta in capo al medico veterinario abilitato, che opera con le proprie credenziali e responsabilità professionale.' },
              { q: 'I pagamenti dei clienti passano da VetBuddy?', a: 'No. I pagamenti delle visite restano gestiti dalla clinica. VetBuddy incassa esclusivamente l\'abbonamento della piattaforma.' },
              { q: 'Posso annullare in qualsiasi momento?', a: 'Sì. L\'abbonamento è mensile, senza vincolo annuale obbligatorio. Puoi annullare prima del rinnovo successivo.' },
              { q: 'Come funziona la Rete laboratori?', a: 'La clinica richiede un\'analisi dalla scheda del paziente, il laboratorio la riceve, la processa e carica il referto. Il veterinario lo rivede, aggiunge note cliniche e decide quando renderlo visibile al proprietario.' },
              { q: 'I dati e i referti sono visibili automaticamente al proprietario?', a: 'No. La clinica mantiene il controllo sui documenti e decide quali informazioni rendere visibili al proprietario tramite area riservata.' },
              { q: 'Cos\'è il VetBuddy Passport?', a: 'È il passaporto sanitario digitale dell\'animale. Raccoglie vaccini, allergie, farmaci, contatti di emergenza e genera un QR stampabile per situazioni di emergenza o smarrimento. Il proprietario lo gestisce in autonomia, la clinica mantiene visibilità sui dati sanitari. Include Travel Pack e condivisione temporanea con pet sitter.' },
              { q: 'Il QR del Passport mostra dati sensibili?', a: 'No. Il proprietario decide cosa rendere visibile. I dati sensibili sono nascosti di default.' },
              { q: 'Lost Pet Mode pubblica il mio indirizzo?', a: 'No. Non mostra l\'indirizzo completo salvo scelta esplicita del proprietario. È consigliato mostrare solo città o zona.' },
              { q: 'Serve una formazione tecnica per usarlo?', a: 'No. VetBuddy è progettato per essere intuitivo. Il Pilot Success Kit include onboarding guidato a 90 giorni con checklist e supporto dedicato sempre disponibile via email e chat.' },
              { q: 'Cos\'è il Task Manager Staff?', a: 'Il Task Manager traccia tutti i task operativi della clinica: richiami clienti, controlli referti, preventivi da inviare, follow-up post-visita. Include task generati automaticamente dalle automazioni VetBuddy e task manuali creati dallo staff. Tutto con priorità, scadenze e assegnazioni.' },
              { q: 'Come funzionano le Campagne Clienti?', a: 'Campagne mirate pronte all\'uso: igiene dentale (pet 3+ anni), richiami vaccini (scadenza 30gg), sterilizzazione (cuccioli 6-12 mesi), antiparassitari stagionali, check-up senior (7+ anni). VetBuddy identifica automaticamente i clienti target e invia messaggi personalizzati via Email o WhatsApp.' },
              { q: 'Cos\'è il Mini CRM Proprietari?', a: 'Estende la gestione proprietari con etichette cliente (Attivo, Alto Rischio, Promoter, VIP, Inattivo), relationship score (0-100), lifetime value (€), filtri segmentazione avanzati. Aiuta a identificare i clienti migliori e quelli a rischio abbandono.' },
              { q: 'Come funzionano i Questionari Pre-Visita con foto e video?', a: 'Quando viene prenotata una visita, il proprietario riceve via email un link al modulo pre-visita: motivo, sintomi, farmaci, alimentazione e urgenza percepita. Può anche allegare fino a 3 foto o video direttamente dallo smartphone. Se l\'urgenza è alta la clinica riceve un alert immediato e un task automatico.' },
              { q: 'Come funziona la Fatturazione Elettronica XML?', a: 'VetBuddy genera fatture in formato XML conformi al Sistema di Interscambio (SdI). Include validazione automatica dei dati prima dell\'invio, tracciamento stati (Emessa, Inviata, Accettata, Rifiutata) e archivio digitale completo. Gli adempimenti fiscali restano in capo alla clinica.' },
              { q: 'Cosa sono i Consensi Informati Digitali?', a: 'Template consensi (chirurgia, anestesia, eutanasia, trattamenti) con firma digitale/grafometrica del proprietario. Archiviazione legale 10 anni conforme GDPR. Elimina la carta, velocizza accettazioni.' },
              { q: 'Come gestisco Microchip e Anagrafe Canina?', a: 'Registri il microchip direttamente in VetBuddy, generi certificati di iscrizione conformi alle normative regionali e prepari i dati per l\'invio alle anagrafi. Include validazione automatica dei codici microchip (15 cifre).' },
              { q: 'Cos\'è il Network Specialisti?', a: 'Un sistema di referral tracking tra clinica e specialisti. Invii pazienti a specialisti partner, segui lo stato del referral, ricevi aggiornamenti automatici e visualizzi dashboard di reciprocità.' },
              { q: 'Come funzionano i Piani Benessere?', a: 'Sono abbonamenti mensili o annuali che includono un pacchetto di servizi (visite, vaccini, esami). Esempio: Piano Cucciolo €39/mese include 3 visite, 2 vaccini, esami base. Monitori l\'utilizzo servizi, gestisci rinnovi automatici e generi fatturato ricorrente prevedibile.' },
              { q: 'Cos\'è la Telemedicina Conforme FNOVI?', a: 'Video-consulti HD per follow-up su pazienti già visitati (NON prime visite - conforme FNOVI). Registrazione automatica, prescrizioni digitali post-consulto. Standard post-COVID.' },
              { q: 'Come funzionano i Preventivi Online?', a: 'Crei un preventivo digitale per una procedura. VetBuddy genera un link sicuro che invii al proprietario. Il proprietario approva online con firma digitale. Una volta approvato, converti automaticamente il preventivo in fattura.' },
              { q: 'Cos\'è lo Smart Visit Pack?', a: 'Un flusso visita unificato che combina Check-in Digitale → Questionario Pre-Visita → Flowboard Clinica → Dimissioni in un\'unica timeline. Vedi tutte le visite di oggi con stato real-time.' },
              { q: 'Come funzionano Dimissioni & Follow-up?', a: 'Dopo ogni visita o chirurgia, crei un pacchetto dimissioni con istruzioni, terapie e farmaci. VetBuddy programma automaticamente follow-up telefonici 24h/48h dopo, con template di domande chiave.' },
              { q: 'Cos\'è lo Stock Leggero Vaccini?', a: 'Un inventario semplificato SOLO per vaccini e materiali critici. Traccia quantità, lotti, fornitori, scadenze. Alert automatici per scorte sotto soglia o vaccini in scadenza 30/60 giorni.' },
              { q: 'Come funziona l\'integrazione con le Assicurazioni Pet?', a: 'Integrazione diretta con UnipolSai, Allianz, Generali, AXA. Invio automatico documenti e fatture, tracking stato rimborso per il cliente. La clinica diventa partner convenzionato.' },
              { q: 'VetBuddy Passport sostituisce la cartella clinica?', a: 'No. VetBuddy Passport organizza le informazioni essenziali dell\'animale per proprietario, clinica, emergenze e condivisioni. La cartella clinica resta gestita dalla clinica.' }
              ])
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-lg border px-4">
                <AccordionTrigger className="text-left font-semibold text-gray-900 py-4">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {/* Toggle Mostra tutte / meno */}
          <div className="text-center mt-6">
            <Button variant="outline" onClick={() => setShowAllFaqs(!showAllFaqs)} className="border-coral-300 text-coral-700 hover:bg-coral-50">
              {showAllFaqs ? 'Mostra meno' : '📚 Mostra tutte le 30+ domande'}
              <ChevronRight className={`ml-2 h-4 w-4 transition-transform ${showAllFaqs ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </div>
      </section>


      {/* ============================================================ */}
      {/* CTA FINALE */}
      {/* ============================================================ */}
      <section className="py-12 px-4 bg-gradient-to-r from-coral-500 to-orange-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Costruisci il tuo ecosistema VetBuddy. Inizia gratis.</h2>
          <p className="text-white/90 mb-6">
            Cliniche, proprietari e laboratori. Tutti collegati. <strong>Provala gratis. Poi scegli il piano più adatto.</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Button size="lg" className="bg-white text-coral-600 hover:bg-gray-100 px-6" onClick={() => window.location.href = '/login?mode=register&role=clinic'}>Prova gratis (Clinica)</Button>
            <Button size="lg" className="bg-white/15 backdrop-blur border-2 border-white text-white hover:bg-white/25 px-6" onClick={() => scrollToSection('pilot')}>Candidati al Pilot 90gg</Button>
            <Button size="lg" className="bg-white/15 backdrop-blur border-2 border-white text-white hover:bg-white/25 px-6" onClick={() => window.location.href = '/login?mode=register&role=owner'}>Invita la tua clinica</Button>
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
                <button onClick={() => scrollToSection('lab-network')} className="block hover:text-white transition">Rete laboratori</button>
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
            onLogin={(user) => {
              setShowAuth(false);
              setPendingAction(null);
              onLogin(user);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FullLandingPage;
