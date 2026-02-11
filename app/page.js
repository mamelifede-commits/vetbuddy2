'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar, FileText, Users, Inbox, LogOut, Plus, Send, Dog, Cat, Clock, Mail, User, 
  Building2, Phone, PawPrint, Search, Zap, Shield, Heart, MessageCircle, Bell, 
  CheckCircle, ChevronRight, Menu, X, CalendarDays, ClipboardList, Settings,
  Star, Check, Upload, Paperclip, AlertCircle, RefreshCw, Eye, Download,
  UserCheck, Ticket, Filter, MoreHorizontal, ExternalLink, Video, CalendarCheck
} from 'lucide-react';

// Logo Component
const VetBuddyLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="62" rx="18" ry="16" fill="#FF6B6B"/>
    <ellipse cx="28" cy="38" rx="10" ry="12" fill="#FF6B6B"/>
    <ellipse cx="50" cy="28" rx="10" ry="12" fill="#FF6B6B"/>
    <ellipse cx="72" cy="38" rx="10" ry="12" fill="#FF6B6B"/>
  </svg>
);

// API Helper
const api = {
  baseUrl: '/api',
  token: null,
  
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') localStorage.setItem('vetbuddy_token', token);
  },
  
  getToken() {
    if (!this.token && typeof window !== 'undefined') this.token = localStorage.getItem('vetbuddy_token');
    return this.token;
  },
  
  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${this.baseUrl}/${endpoint}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Errore nella richiesta');
    return data;
  },
  
  get: (endpoint) => api.request(endpoint),
  post: (endpoint, body) => api.request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => api.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => api.request(endpoint, { method: 'DELETE' })
};

// ==================== LANDING PAGE ====================
function LandingPage({ onLogin }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Pilot Banner */}
      <div className="bg-coral-500 text-white text-center py-2 px-4 text-sm">
        <span className="font-medium">🚀 Pilot in corso</span> — Stiamo aprendo le prime cliniche. <button onClick={() => scrollToSection('prezzi')} className="underline font-medium">Richiedi accesso</button>
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <VetBuddyLogo size={32} />
              <span className="font-bold text-xl text-gray-900">VetBuddy</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('differenziatori')} className="text-gray-600 hover:text-coral-500 transition">Perché VetBuddy</button>
              <button onClick={() => scrollToSection('come-funziona')} className="text-gray-600 hover:text-coral-500 transition">Come funziona</button>
              <button onClick={() => scrollToSection('prezzi')} className="text-gray-600 hover:text-coral-500 transition">Prezzi</button>
              <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-coral-500 transition">FAQ</button>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>Accedi</Button>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Registrati</Button>
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-4 px-4">
            <nav className="flex flex-col gap-4">
              <button onClick={() => scrollToSection('differenziatori')} className="text-gray-600 text-left">Perché VetBuddy</button>
              <button onClick={() => scrollToSection('come-funziona')} className="text-gray-600 text-left">Come funziona</button>
              <button onClick={() => scrollToSection('prezzi')} className="text-gray-600 text-left">Prezzi</button>
              <button onClick={() => scrollToSection('faq')} className="text-gray-600 text-left">FAQ</button>
              <hr />
              <Button variant="ghost" className="justify-start" onClick={() => { setAuthMode('login'); setShowAuth(true); setMobileMenuOpen(false); }}>Accedi</Button>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); setMobileMenuOpen(false); }}>Registrati</Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section - Chiarezza immediata */}
      <section className="pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-coral-100 text-coral-700 mb-6">
            <Zap className="h-3 w-3 mr-1" /> Pilot su invito
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            L'app che collega<br />
            <span className="text-coral-500">cliniche veterinarie e proprietari</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Prenotazioni, messaggi, video-consulti e documenti clinici in un unico posto.
          </p>
          <p className="text-lg text-coral-600 font-medium mb-10">
            Meno caos, più tempo per i pazienti.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-coral-500 hover:bg-coral-600 text-white px-8" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <Building2 className="h-5 w-5 mr-2" /> Sono una clinica
            </Button>
            <Button size="lg" variant="outline" className="px-8" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <PawPrint className="h-5 w-5 mr-2" /> Sono un proprietario
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Clock, title: 'Online 24/7', desc: 'Prenotazioni sempre aperte' },
              { icon: Zap, title: '2 minuti', desc: 'Per prenotare una visita' },
              { icon: Shield, title: 'Verificato', desc: 'Cliniche con P.IVA' },
              { icon: Heart, title: 'Gratis', desc: 'Per sempre per i proprietari' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border text-center">
                <item.icon className="h-5 w-5 text-coral-500 mx-auto mb-2" />
                <div className="font-semibold text-coral-500">{item.title}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Differenziatori Chiave */}
      <section id="differenziatori" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-coral-500 font-semibold mb-2">PERCHÉ VETBUDDY</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">3 superpoteri per la tua clinica</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Funzioni pensate per risolvere i problemi veri delle cliniche veterinarie.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Team Inbox */}
            <Card className="border-2 border-coral-200 bg-white">
              <CardHeader>
                <div className="h-14 w-14 bg-coral-100 rounded-2xl flex items-center justify-center mb-4">
                  <Inbox className="h-7 w-7 text-coral-500" />
                </div>
                <CardTitle className="text-xl">Team Inbox</CardTitle>
                <CardDescription>Anti-doppioni, assegnazione ticket, priorità</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Un ticket alla volta: quando un operatore prende in carico, gli altri vedono il blocco. Niente più risposte duplicate.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Filtri per tipo e stato</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Assegnazione a operatore</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Follow-up automatici</li>
                </ul>
              </CardContent>
            </Card>

            {/* Documenti Automatici */}
            <Card className="border-2 border-coral-500 bg-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral-500 text-white text-xs px-3 py-1 rounded-full">
                Più richiesto
              </div>
              <CardHeader>
                <div className="h-14 w-14 bg-coral-100 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="h-7 w-7 text-coral-500" />
                </div>
                <CardTitle className="text-xl">Documenti con invio automatico</CardTitle>
                <CardDescription>Prescrizioni e referti via email + archivio</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Carichi il PDF → il cliente lo riceve via email come allegato → lo ritrova in app. Zero telefonate.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Upload PDF con 1 click</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Email automatica con allegato</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Archivio per animale</li>
                </ul>
              </CardContent>
            </Card>

            {/* Google Calendar */}
            <Card className="border-2 border-coral-200 bg-white">
              <CardHeader>
                <div className="h-14 w-14 bg-coral-100 rounded-2xl flex items-center justify-center mb-4">
                  <CalendarCheck className="h-7 w-7 text-coral-500" />
                </div>
                <CardTitle className="text-xl">Google Calendar Sync</CardTitle>
                <CardDescription>Sincronizzazione in tempo reale</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Prenotazioni sincronizzate su Google Calendar in tempo reale. Eviti doppie prenotazioni.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Sync bidirezionale</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Multi-calendario</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Setup in 2 minuti</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Come Funziona */}
      <section id="come-funziona" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-coral-500 font-semibold mb-2">COME FUNZIONA</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Due esperienze, un'unica piattaforma</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Per Proprietari */}
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <PawPrint className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Per i Proprietari</h3>
                  <p className="text-sm text-gray-600">Sempre gratis</p>
                </div>
              </div>
              <ul className="space-y-4">
                {[
                  'Prenota visite e video-consulti',
                  'Ricevi referti e prescrizioni via email',
                  'Chatta con la clinica',
                  'Storico completo per ogni animale',
                  'Promemoria vaccini e controlli'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Per Cliniche */}
            <div className="bg-coral-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-coral-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Per le Cliniche</h3>
                  <p className="text-sm text-gray-600">Pilot su invito</p>
                </div>
              </div>
              <ul className="space-y-4">
                {[
                  'Agenda multi-medico con filtri',
                  'Team Inbox con assegnazione ticket',
                  'Carica documenti → invio email automatico',
                  'Gestione staff con ruoli e permessi',
                  'Sync con Google Calendar'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-coral-600 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Prezzi - Pilot */}
      <section id="prezzi" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-coral-100 text-coral-700 mb-4">Pilot su invito</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Piani per cliniche</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              <strong>Sempre gratis per i proprietari di animali.</strong><br />
              Piani cliniche disponibili solo con accesso al Pilot.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Starter */}
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Per iniziare a ricevere richieste</CardDescription>
                <div className="text-3xl font-bold text-coral-500 mt-4">Gratis</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 1 sede, 1 utente</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 30 richieste/mese</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Supporto email</li>
                </ul>
                <Button className="w-full bg-coral-500 hover:bg-coral-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
                  Richiedi accesso Pilot
                </Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-2 border-coral-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral-500 text-white text-xs px-3 py-1 rounded-full">Consigliato</div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Per automatizzare la clinica</CardDescription>
                <div className="text-3xl font-bold text-coral-500 mt-4">€129<span className="text-sm font-normal text-gray-500">/mese</span></div>
                <p className="text-xs text-gray-400">+ IVA</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Fino a 10 staff</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Documenti con email auto</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Google Calendar sync</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Team Inbox completa</li>
                </ul>
                <Button className="w-full bg-coral-500 hover:bg-coral-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
                  Richiedi accesso Pilot
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Per gruppi e catene</CardDescription>
                <div className="text-3xl font-bold text-coral-500 mt-4">Custom</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Multi-sede illimitate</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> API dedicata</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Account manager</li>
                </ul>
                <Button variant="outline" className="w-full">Contattaci</Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-gray-500">
            Prezzi IVA esclusa. Piani disponibili solo per cliniche ammesse al Pilot.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Domande frequenti</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: 'Cos\'è il Pilot?', a: 'VetBuddy è in fase Pilot: stiamo testando la piattaforma con un numero limitato di cliniche per perfezionare il prodotto. Le cliniche visibili nell\'app demo non sono ancora affiliate.' },
              { q: 'Quanto costa per i proprietari?', a: 'VetBuddy è e sarà sempre gratuito per i proprietari di animali. Pagano solo le cliniche, con piani trasparenti.' },
              { q: 'Come funziona l\'invio documenti?', a: 'La clinica carica un PDF (prescrizione, referto, ecc.), seleziona proprietario e animale, e con un click il documento viene inviato via email come allegato e salvato nell\'app.' },
              { q: 'Posso sincronizzare con Google Calendar?', a: 'Sì! Con il piano Pro puoi connettere Google Calendar e sincronizzare gli appuntamenti in tempo reale.' },
              { q: 'Come richiedo l\'accesso al Pilot?', a: 'Clicca su "Richiedi accesso Pilot", compila il form con i dati della clinica. Ti ricontatteremo entro 48h.' },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-lg px-6 border">
                <AccordionTrigger className="text-left font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="py-20 px-4 bg-coral-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto a semplificare la tua clinica?</h2>
          <p className="text-coral-100 mb-8">Richiedi l'accesso al Pilot e scopri come VetBuddy può aiutarti.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-coral-500 hover:bg-coral-50" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              Richiedi accesso Pilot
            </Button>
            <Button size="lg" variant="outline" className="border-white text-coral-500 bg-white hover:bg-coral-50" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              Esplora la demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <VetBuddyLogo size={32} />
            <span className="font-bold text-xl">VetBuddy</span>
          </div>
          <p className="text-gray-400 text-sm">© 2025 VetBuddy. Tutti i diritti riservati. GDPR Compliant.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md">
          <AuthForm mode={authMode} setMode={setAuthMode} onLogin={(user) => { setShowAuth(false); onLogin(user); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Auth Form
function AuthForm({ mode, setMode, onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'owner', clinicName: '', phone: '', city: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? 'auth/login' : 'auth/register';
      const data = await api.post(endpoint, formData);
      api.setToken(data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DialogHeader className="text-center">
        <div className="flex justify-center mb-4"><VetBuddyLogo size={50} /></div>
        <DialogTitle className="text-2xl text-coral-500">VetBuddy</DialogTitle>
        <DialogDescription>{mode === 'login' ? 'Accedi al tuo account' : 'Crea un nuovo account'}</DialogDescription>
      </DialogHeader>

      <Tabs value={mode} onValueChange={setMode} className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Accedi</TabsTrigger>
          <TabsTrigger value="register">Registrati</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <Label>Sono un...</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner"><div className="flex items-center gap-2"><PawPrint className="h-4 w-4" />Proprietario di animale</div></SelectItem>
                    <SelectItem value="clinic"><div className="flex items-center gap-2"><Building2 className="h-4 w-4" />Veterinario / Clinica</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>{formData.role === 'clinic' ? 'Nome responsabile' : 'Nome completo'}</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              
              {formData.role === 'clinic' && (
                <>
                  <div>
                    <Label>Nome Clinica</Label>
                    <Input value={formData.clinicName} onChange={(e) => setFormData({...formData, clinicName: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Città</Label>
                    <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="Es: Milano" />
                  </div>
                </>
              )}
              
              <div>
                <Label>Telefono</Label>
                <Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </>
          )}
          
          <div>
            <Label>Email</Label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          
          <div>
            <Label>Password</Label>
            <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={loading}>
            {loading ? 'Caricamento...' : (mode === 'login' ? 'Accedi' : (formData.role === 'clinic' ? 'Richiedi accesso Pilot' : 'Registrati gratis'))}
          </Button>
          
          {mode === 'register' && (
            <p className="text-xs text-gray-500 text-center">
              {formData.role === 'clinic' 
                ? 'VetBuddy è in fase Pilot. Ti ricontatteremo per l\'attivazione.' 
                : 'Gratis per sempre per i proprietari.'}
            </p>
          )}
        </form>
      </Tabs>
    </div>
  );
}

// ==================== WELCOME SCREEN (POST-REGISTRATION) ====================
function WelcomeScreen({ user, onContinue }) {
  const isClinic = user.role === 'clinic';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-coral-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4"><VetBuddyLogo size={60} /></div>
          <CardTitle className="text-2xl">Benvenuto in VetBuddy!</CardTitle>
          <CardDescription className="text-base mt-2">
            {isClinic 
              ? 'Stai entrando nel portale per cliniche veterinarie' 
              : 'Stai entrando nell\'app per proprietari di animali'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cosa puoi fare */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Cosa puoi fare:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {isClinic ? (
                <>
                  <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-coral-500" /> Gestisci agenda e appuntamenti</li>
                  <li className="flex items-center gap-2"><Inbox className="h-4 w-4 text-coral-500" /> Team Inbox con ticket e assegnazioni</li>
                  <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-coral-500" /> Carica documenti e inviali via email</li>
                  <li className="flex items-center gap-2"><Users className="h-4 w-4 text-coral-500" /> Gestisci staff e permessi</li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" /> Prenota visite e video-consulti</li>
                  <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-blue-500" /> Chatta con la clinica</li>
                  <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /> Ricevi referti e prescrizioni</li>
                  <li className="flex items-center gap-2"><PawPrint className="h-4 w-4 text-blue-500" /> Gestisci i profili dei tuoi animali</li>
                </>
              )}
            </ul>
          </div>

          {/* Avviso Pilot */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Versione Pilot / Demo</h4>
                <p className="text-sm text-amber-700 mt-1">
                  {isClinic 
                    ? 'VetBuddy è in fase Pilot su invito. Alcune sezioni sono demo. I piani completi saranno disponibili dopo l\'approvazione.' 
                    : 'VetBuddy è in fase Pilot: le cliniche visibili sono esempi/demo e non sono ancora affiliate. Puoi esplorare tutte le funzioni.'}
                </p>
              </div>
            </div>
          </div>

          <Button className="w-full bg-coral-500 hover:bg-coral-600" size="lg" onClick={onContinue}>
            {isClinic ? 'Entra nella dashboard' : 'Esplora l\'app'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== CLINIC DASHBOARD ====================
function ClinicDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('agenda');
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [staff, setStaff] = useState([]);
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [appts, docs, msgs, staffList, petsList, ownersList] = await Promise.all([
        api.get('appointments'), api.get('documents'), api.get('messages'),
        api.get('staff'), api.get('pets'), api.get('owners'),
      ]);
      setAppointments(appts); setDocuments(docs); setMessages(msgs);
      setStaff(staffList); setPets(petsList); setOwners(ownersList);
    } catch (error) { console.error('Error:', error); }
  };

  const NavItem = ({ icon: Icon, label, value, badge }) => (
    <button onClick={() => setActiveTab(value)} 
      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${activeTab === value ? 'bg-coral-100 text-coral-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
      <div className="flex items-center gap-3"><Icon className="h-5 w-5" />{label}</div>
      {badge > 0 && <Badge className="bg-coral-500 text-white text-xs">{badge}</Badge>}
    </button>
  );

  const unreadMessages = messages.filter(m => !m.read).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <VetBuddyLogo size={36} />
          <div>
            <h1 className="font-bold text-coral-500">VetBuddy</h1>
            <p className="text-xs text-gray-500 truncate max-w-[140px]">{user.clinicName || 'Clinica'}</p>
          </div>
        </div>
        
        {/* Pilot Badge */}
        <Badge variant="outline" className="mb-6 justify-center text-amber-600 border-amber-300 bg-amber-50">
          <AlertCircle className="h-3 w-3 mr-1" /> Modalità Pilot
        </Badge>
        
        <nav className="space-y-1 flex-1">
          <NavItem icon={Calendar} label="Agenda" value="agenda" />
          <NavItem icon={Inbox} label="Team Inbox" value="inbox" badge={unreadMessages} />
          <NavItem icon={FileText} label="Documenti" value="documents" />
          <NavItem icon={PawPrint} label="Pazienti" value="patients" />
          <NavItem icon={User} label="Proprietari" value="owners" />
          <NavItem icon={Users} label="Staff" value="staff" />
          <NavItem icon={Settings} label="Impostazioni" value="settings" />
        </nav>
        
        <Button variant="ghost" onClick={onLogout} className="mt-auto text-gray-600">
          <LogOut className="h-4 w-4 mr-2" />Esci
        </Button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'agenda' && <ClinicAgenda appointments={appointments} owners={owners} pets={pets} onRefresh={loadData} />}
        {activeTab === 'inbox' && <ClinicInbox messages={messages} documents={documents} owners={owners} pets={pets} onRefresh={loadData} />}
        {activeTab === 'documents' && <ClinicDocuments documents={documents} owners={owners} pets={pets} onRefresh={loadData} />}
        {activeTab === 'patients' && <ClinicPatients pets={pets} owners={owners} onRefresh={loadData} />}
        {activeTab === 'owners' && <ClinicOwners owners={owners} onRefresh={loadData} />}
        {activeTab === 'staff' && <ClinicStaff staff={staff} onRefresh={loadData} />}
        {activeTab === 'settings' && <ClinicSettings user={user} />}
      </main>
    </div>
  );
}

// Clinic Agenda
function ClinicAgenda({ appointments, owners, pets, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ petName: '', ownerName: '', date: '', time: '', reason: '', type: 'visita' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('appointments', formData); setShowDialog(false); onRefresh(); } 
    catch (error) { alert(error.message); }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const upcomingAppts = appointments.filter(a => a.date > today).slice(0, 10);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
          <p className="text-gray-500 text-sm">Gestisci appuntamenti e visite</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Nuovo Appuntamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo Appuntamento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visita">Visita</SelectItem>
                    <SelectItem value="vaccino">Vaccino</SelectItem>
                    <SelectItem value="controllo">Controllo</SelectItem>
                    <SelectItem value="videoconsulto">Video-consulto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Animale</Label><Input value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} required /></div>
                <div><Label>Proprietario</Label><Input value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Data</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required /></div>
                <div><Label>Ora</Label><Input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required /></div>
              </div>
              <div><Label>Motivo</Label><Input value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} /></div>
              <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Crea</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-8 w-8 bg-coral-100 rounded-lg flex items-center justify-center"><Clock className="h-4 w-4 text-coral-600" /></div>
              Oggi <Badge variant="outline" className="ml-2">{todayAppts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppts.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">Nessun appuntamento oggi</p>
            ) : (
              <div className="space-y-3">
                {todayAppts.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between p-3 bg-coral-50 rounded-lg border border-coral-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        {appt.type === 'videoconsulto' ? <Video className="h-5 w-5 text-coral-600" /> : <PawPrint className="h-5 w-5 text-coral-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{appt.petName}</p>
                        <p className="text-xs text-gray-500">{appt.ownerName} • {appt.reason || appt.type}</p>
                      </div>
                    </div>
                    <Badge className="bg-coral-500">{appt.time}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center"><CalendarDays className="h-4 w-4 text-gray-600" /></div>
              Prossimi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppts.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">Nessun appuntamento programmato</p>
            ) : (
              <div className="space-y-2">
                {upcomingAppts.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <PawPrint className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">{appt.petName}</p>
                        <p className="text-xs text-gray-500">{appt.ownerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{appt.date}</p>
                      <p className="text-xs text-gray-500">{appt.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Clinic Team Inbox
function ClinicInbox({ messages, documents, owners, pets, onRefresh }) {
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showDocUpload, setShowDocUpload] = useState(false);

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread') return !m.read;
    if (filter === 'assigned') return m.assignedTo;
    return true;
  });

  const handleTakeCharge = async (msg) => {
    try {
      await api.put(`messages/${msg.id}`, { assignedTo: 'current_user', status: 'in_progress' });
      onRefresh();
    } catch (error) { alert(error.message); }
  };

  const handleResolve = async (msg) => {
    try {
      await api.put(`messages/${msg.id}`, { status: 'resolved', read: true });
      onRefresh();
      setSelectedMsg(null);
    } catch (error) { alert(error.message); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Team Inbox</h2>
          <p className="text-gray-500 text-sm">Gestisci messaggi e richieste</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="unread">Non letti</SelectItem>
              <SelectItem value="assigned">Assegnati</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lista Ticket */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">TICKET ({filteredMessages.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {filteredMessages.length === 0 ? (
                <div className="p-6 text-center text-gray-500"><Inbox className="h-8 w-8 mx-auto mb-2 text-gray-300" /><p className="text-sm">Nessun messaggio</p></div>
              ) : filteredMessages.map((msg) => (
                <div key={msg.id} onClick={() => setSelectedMsg(msg)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedMsg?.id === msg.id ? 'bg-coral-50 border-l-4 border-l-coral-500' : ''} ${!msg.read ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm truncate ${!msg.read ? 'text-blue-700' : ''}`}>{msg.subject || 'Nuovo messaggio'}</p>
                        {msg.assignedTo && <Badge variant="outline" className="text-xs">Assegnato</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">{msg.content}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{new Date(msg.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Dettaglio Ticket */}
        <Card className="lg:col-span-2">
          {selectedMsg ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedMsg.subject || 'Messaggio'}</CardTitle>
                    <CardDescription className="mt-1">Da: Proprietario • Animale: N/A</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {!selectedMsg.assignedTo && (
                      <Button size="sm" onClick={() => handleTakeCharge(selectedMsg)}>
                        <UserCheck className="h-4 w-4 mr-1" />Prendi in carico
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleResolve(selectedMsg)}>
                      <CheckCircle className="h-4 w-4 mr-1" />Risolvi
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Riepilogo */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-gray-500">Stato:</span> <Badge variant="outline">{selectedMsg.status || 'Aperto'}</Badge></div>
                    <div><span className="text-gray-500">Creato:</span> {new Date(selectedMsg.createdAt).toLocaleString()}</div>
                    <div><span className="text-gray-500">Assegnato:</span> {selectedMsg.assignedTo || '—'}</div>
                  </div>
                </div>

                {/* Contenuto */}
                <div className="prose prose-sm max-w-none mb-6">
                  <p>{selectedMsg.content}</p>
                </div>

                {/* Pannello Documenti */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm flex items-center gap-2"><Paperclip className="h-4 w-4" />Documenti collegati</h4>
                    <Button size="sm" variant="outline" onClick={() => setShowDocUpload(true)}>
                      <Upload className="h-4 w-4 mr-1" />Carica
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">Nessun documento collegato a questo ticket.</p>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[500px] text-gray-500">
              <div className="text-center">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Seleziona un ticket per vedere i dettagli</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Upload Document Dialog */}
      <Dialog open={showDocUpload} onOpenChange={setShowDocUpload}>
        <DialogContent>
          <DocumentUploadForm owners={owners} pets={pets} onSuccess={() => { setShowDocUpload(false); onRefresh(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Document Upload Form (riusabile)
function DocumentUploadForm({ owners, pets, onSuccess, preselectedOwner, preselectedPet }) {
  const [formData, setFormData] = useState({
    type: 'prescrizione',
    ownerId: preselectedOwner || '',
    ownerEmail: '',
    petId: preselectedPet || '',
    petName: '',
    title: '',
    file: null,
    fileName: '',
    notes: '',
    sendEmail: true
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({
          ...formData, 
          file: reader.result, 
          fileName: file.name,
          title: formData.title || file.name.replace('.pdf', '')
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Per favore seleziona un file PDF');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) { alert('Seleziona un file PDF'); return; }
    
    setUploading(true);
    try {
      await api.post('documents', {
        name: formData.title,
        type: formData.type,
        content: formData.file,
        fileName: formData.fileName,
        petName: formData.petName,
        petId: formData.petId,
        ownerId: formData.ownerId,
        ownerEmail: formData.ownerEmail,
        notes: formData.notes,
        sendEmail: formData.sendEmail
      });
      onSuccess?.();
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const docTypes = [
    { value: 'prescrizione', label: 'Prescrizione' },
    { value: 'referto', label: 'Referto' },
    { value: 'istruzioni', label: 'Istruzioni' },
    { value: 'altro', label: 'Altro' }
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle>Carica documento</DialogTitle>
        <DialogDescription>Il documento verrà salvato e opzionalmente inviato via email con PDF allegato.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <Label>Tipo documento</Label>
          <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {docTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Proprietario</Label>
            <Input placeholder="Nome proprietario" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} />
          </div>
          <div>
            <Label>Animale</Label>
            <Input placeholder="Nome animale" value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} />
          </div>
        </div>

        <div>
          <Label>Titolo documento</Label>
          <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Es: Prescrizione antibiotico" />
        </div>

        <div>
          <Label>File PDF</Label>
          <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-coral-400 transition"
          >
            {formData.fileName ? (
              <div className="flex items-center justify-center gap-2 text-coral-600">
                <FileText className="h-5 w-5" />
                <span className="font-medium">{formData.fileName}</span>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Clicca per selezionare un PDF</p>
              </>
            )}
          </div>
        </div>

        <div>
          <Label>Note interne (solo clinica)</Label>
          <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} />
        </div>

        <div className="flex items-center justify-between p-4 bg-coral-50 rounded-lg">
          <div>
            <p className="font-medium text-sm">Invia via email automaticamente</p>
            <p className="text-xs text-gray-500">Il proprietario riceverà il PDF come allegato</p>
          </div>
          <Switch checked={formData.sendEmail} onCheckedChange={(v) => setFormData({...formData, sendEmail: v})} />
        </div>

        <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={uploading}>
          {uploading ? 'Caricamento...' : (formData.sendEmail ? 'Carica e invia email' : 'Carica documento')}
        </Button>
      </form>
    </>
  );
}

// Clinic Documents
function ClinicDocuments({ documents, owners, pets, onRefresh }) {
  const [showUpload, setShowUpload] = useState(false);

  const docTypes = {
    prescrizione: { label: 'Prescrizione', color: 'bg-purple-100 text-purple-700' },
    referto: { label: 'Referto', color: 'bg-blue-100 text-blue-700' },
    istruzioni: { label: 'Istruzioni', color: 'bg-green-100 text-green-700' },
    vaccination: { label: 'Vaccinazione', color: 'bg-yellow-100 text-yellow-700' },
    medical_record: { label: 'Cartella', color: 'bg-gray-100 text-gray-700' },
    altro: { label: 'Altro', color: 'bg-gray-100 text-gray-700' }
  };

  const handleResendEmail = async (doc) => {
    try {
      await api.post('documents/send-email', { documentId: doc.id, recipientEmail: doc.ownerEmail });
      alert('Email reinviata!');
      onRefresh();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Documenti</h2>
          <p className="text-gray-500 text-sm">Carica PDF e inviali automaticamente via email</p>
        </div>
        <Button className="bg-coral-500 hover:bg-coral-600" onClick={() => setShowUpload(true)}>
          <Upload className="h-4 w-4 mr-2" />Carica documento
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-coral-50 border border-coral-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-coral-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-coral-800">Come funziona</h4>
            <p className="text-sm text-coral-700">
              Carica un PDF → il proprietario lo riceve via email come allegato → lo ritrova in app nella sezione Documenti.
            </p>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Nessun documento</p>
            <p className="text-sm mt-1">Carica il primo documento per iniziare</p>
          </CardContent></Card>
        ) : documents.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-coral-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-coral-600" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-gray-500">{doc.petName || 'N/A'} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={docTypes[doc.type]?.color || docTypes.altro.color}>
                    {docTypes[doc.type]?.label || 'Altro'}
                  </Badge>
                  {/* Email Status */}
                  {doc.emailSent ? (
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      <Mail className="h-3 w-3 mr-1" />Inviata
                    </Badge>
                  ) : doc.emailError ? (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-red-600 border-red-300">
                        <AlertCircle className="h-3 w-3 mr-1" />Errore
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => handleResendEmail(doc)}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">Non inviata</Badge>
                  )}
                  <Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-lg">
          <DocumentUploadForm owners={owners} pets={pets} onSuccess={() => { setShowUpload(false); onRefresh(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Clinic Patients
function ClinicPatients({ pets, owners, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', species: 'dog', breed: '', ownerName: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('pets', formData); setShowDialog(false); onRefresh(); } 
    catch (error) { alert(error.message); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pazienti</h2>
          <p className="text-gray-500 text-sm">Animali registrati nella clinica</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Nuovo paziente</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo paziente</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
              <div><Label>Specie</Label>
                <Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Cane</SelectItem>
                    <SelectItem value="cat">Gatto</SelectItem>
                    <SelectItem value="other">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Razza</Label><Input value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} /></div>
              <div><Label>Proprietario</Label><Input value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} /></div>
              <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.length === 0 ? (
          <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun paziente</p></CardContent></Card>
        ) : pets.map((pet) => (
          <Card key={pet.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center">
                  {pet.species === 'dog' ? <Dog className="h-6 w-6 text-coral-600" /> : pet.species === 'cat' ? <Cat className="h-6 w-6 text-coral-600" /> : <PawPrint className="h-6 w-6 text-coral-600" />}
                </div>
                <div><p className="font-medium">{pet.name}</p><p className="text-sm text-gray-500">{pet.breed || pet.species}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Clinic Owners
function ClinicOwners({ owners, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('owners', formData); setShowDialog(false); onRefresh(); } 
    catch (error) { alert(error.message); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Proprietari</h2>
          <p className="text-gray-500 text-sm">Clienti della clinica</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Aggiungi</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo proprietario</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
              <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
              <div><Label>Telefono</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
              <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {owners.length === 0 ? (
          <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><User className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun proprietario</p></CardContent></Card>
        ) : owners.map((owner) => (
          <Card key={owner.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-blue-600" /></div>
                <div><p className="font-medium">{owner.name}</p><p className="text-sm text-gray-500">{owner.email}</p></div>
              </div>
              {owner.phone && <p className="text-sm text-gray-500 mt-3 flex items-center gap-2"><Phone className="h-4 w-4" />{owner.phone}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Clinic Staff
function ClinicStaff({ staff, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'vet', email: '', phone: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('staff', formData); setShowDialog(false); onRefresh(); } 
    catch (error) { alert(error.message); }
  };

  const roleLabels = { vet: 'Veterinario', assistant: 'Assistente', receptionist: 'Receptionist' };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Staff</h2>
          <p className="text-gray-500 text-sm">Gestisci il team della clinica</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Aggiungi</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo membro</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
              <div><Label>Ruolo</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vet">Veterinario</SelectItem>
                    <SelectItem value="assistant">Assistente</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
              <div><Label>Telefono</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
              <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.length === 0 ? (
          <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><Users className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun membro</p></CardContent></Card>
        ) : staff.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-coral-600" /></div>
                <div><p className="font-medium">{member.name}</p><Badge variant="outline">{roleLabels[member.role]}</Badge></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Clinic Settings
function ClinicSettings({ user }) {
  const [googleConnected, setGoogleConnected] = useState(false);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Impostazioni</h2>
        <p className="text-gray-500 text-sm">Configura la tua clinica</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Google Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-coral-500" />
              Google Calendar
            </CardTitle>
            <CardDescription>Sincronizza appuntamenti in tempo reale</CardDescription>
          </CardHeader>
          <CardContent>
            {googleConnected ? (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Connesso</p>
                    <p className="text-sm text-green-600">Calendario principale sincronizzato</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Disconnetti</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Non connesso</p>
                  <p className="text-sm text-gray-500">Connetti per evitare doppie prenotazioni</p>
                </div>
                <Button className="bg-coral-500 hover:bg-coral-600" onClick={() => setGoogleConnected(true)}>
                  <ExternalLink className="h-4 w-4 mr-2" />Connetti
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profilo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profilo clinica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Nome clinica</Label><Input value={user.clinicName || ''} disabled /></div>
            <div><Label>Email</Label><Input value={user.email || ''} disabled /></div>
            <div><Label>Telefono</Label><Input value={user.phone || ''} disabled /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== OWNER DASHBOARD ====================
function OwnerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [pets, setPets] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [appts, docs, msgs, petsList] = await Promise.all([
        api.get('appointments'), api.get('documents'), api.get('messages'), api.get('pets')
      ]);
      setAppointments(appts); setDocuments(docs); setMessages(msgs); setPets(petsList);
    } catch (error) { console.error('Error:', error); }
  };

  const NavItem = ({ icon: Icon, label, value, badge }) => (
    <button onClick={() => setActiveTab(value)} 
      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${activeTab === value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
      <div className="flex items-center gap-3"><Icon className="h-5 w-5" />{label}</div>
      {badge > 0 && <Badge className="bg-blue-500 text-white text-xs">{badge}</Badge>}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <VetBuddyLogo size={36} />
          <div>
            <h1 className="font-bold text-coral-500">VetBuddy</h1>
            <p className="text-xs text-gray-500 truncate max-w-[140px]">{user.name}</p>
          </div>
        </div>
        
        <Badge variant="outline" className="mb-6 justify-center text-amber-600 border-amber-300 bg-amber-50">
          <AlertCircle className="h-3 w-3 mr-1" /> Demo / Pilot
        </Badge>
        
        <nav className="space-y-1 flex-1">
          <NavItem icon={Calendar} label="Appuntamenti" value="appointments" />
          <NavItem icon={FileText} label="Documenti" value="documents" badge={documents.length} />
          <NavItem icon={MessageCircle} label="Messaggi" value="messages" />
          <NavItem icon={PawPrint} label="I miei animali" value="pets" />
        </nav>
        
        <Button variant="ghost" onClick={onLogout} className="mt-auto text-gray-600">
          <LogOut className="h-4 w-4 mr-2" />Esci
        </Button>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'appointments' && <OwnerAppointments appointments={appointments} />}
        {activeTab === 'documents' && <OwnerDocuments documents={documents} />}
        {activeTab === 'messages' && <OwnerMessages messages={messages} />}
        {activeTab === 'pets' && <OwnerPets pets={pets} onRefresh={loadData} />}
      </main>
    </div>
  );
}

function OwnerAppointments({ appointments }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">I miei appuntamenti</h2>
      <p className="text-gray-500 text-sm mb-6">Visite e consulti prenotati</p>
      
      {appointments.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">Nessun appuntamento</p>
          <p className="text-sm mt-1">Prenota una visita dalla clinica</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <Card key={appt.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    {appt.type === 'videoconsulto' ? <Video className="h-6 w-6 text-blue-600" /> : <PawPrint className="h-6 w-6 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-medium">{appt.petName}</p>
                    <p className="text-sm text-gray-500">{appt.reason || 'Visita'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{appt.date}</p>
                  <p className="text-sm text-gray-500">{appt.time}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OwnerDocuments({ documents }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">I miei documenti</h2>
      <p className="text-gray-500 text-sm mb-6">Referti, prescrizioni e istruzioni dalla clinica</p>
      
      {documents.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">Nessun documento</p>
          <p className="text-sm mt-1">I documenti dalla clinica appariranno qui</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-gray-500">{doc.petName} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Scarica</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OwnerMessages({ messages }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Messaggi</h2>
      <p className="text-gray-500 text-sm mb-6">Comunicazioni con la clinica</p>
      
      <Card>
        <CardContent className="p-0">
          {messages.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Nessun messaggio</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              {messages.map((msg) => (
                <div key={msg.id} className="p-4 border-b">
                  <p className="font-medium">{msg.subject}</p>
                  <p className="text-sm text-gray-500 mt-1">{msg.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(msg.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OwnerPets({ pets, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', species: 'dog', breed: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('pets', formData); setShowDialog(false); onRefresh(); } 
    catch (error) { alert(error.message); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">I miei animali</h2>
          <p className="text-gray-500 text-sm">Gestisci i profili dei tuoi amici</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button className="bg-blue-500 hover:bg-blue-600"><Plus className="h-4 w-4 mr-2" />Aggiungi</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo animale</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
              <div><Label>Specie</Label>
                <Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Cane</SelectItem>
                    <SelectItem value="cat">Gatto</SelectItem>
                    <SelectItem value="other">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Razza</Label><Input value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} /></div>
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">Aggiungi</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.length === 0 ? (
          <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500">
            <PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Nessun animale</p>
            <p className="text-sm mt-1">Aggiungi il tuo primo amico a quattro zampe</p>
          </CardContent></Card>
        ) : pets.map((pet) => (
          <Card key={pet.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center">
                  {pet.species === 'dog' ? <Dog className="h-7 w-7 text-blue-600" /> : pet.species === 'cat' ? <Cat className="h-7 w-7 text-blue-600" /> : <PawPrint className="h-7 w-7 text-blue-600" />}
                </div>
                <div><p className="font-medium text-lg">{pet.name}</p><p className="text-sm text-gray-500">{pet.breed || pet.species}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (token) {
      try { 
        const userData = await api.get('auth/me'); 
        setUser(userData); 
      } catch (error) { 
        localStorage.removeItem('vetbuddy_token'); 
        api.token = null; 
      }
    }
    setLoading(false);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    // Show welcome screen for new users
    if (!localStorage.getItem('vetbuddy_welcomed_' + userData.id)) {
      setShowWelcome(true);
    }
  };

  const handleWelcomeContinue = () => {
    localStorage.setItem('vetbuddy_welcomed_' + user.id, 'true');
    setShowWelcome(false);
  };

  const handleLogout = () => { 
    localStorage.removeItem('vetbuddy_token'); 
    api.token = null; 
    setUser(null); 
    setShowWelcome(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coral-50">
        <div className="text-center"><VetBuddyLogo size={60} /><p className="mt-4 text-coral-700">Caricamento...</p></div>
      </div>
    );
  }

  if (!user) return <LandingPage onLogin={handleLogin} />;
  if (showWelcome) return <WelcomeScreen user={user} onContinue={handleWelcomeContinue} />;
  if (user.role === 'clinic') return <ClinicDashboard user={user} onLogout={handleLogout} />;
  return <OwnerDashboard user={user} onLogout={handleLogout} />;
}
