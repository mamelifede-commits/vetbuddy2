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
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, FileText, Users, Inbox, LogOut, Plus, Send, Dog, Cat, Clock, Mail, User, 
  Building2, Phone, PawPrint, Search, Zap, Shield, Heart, MessageCircle, Bell, 
  CheckCircle, ChevronRight, Menu, X, CalendarDays, ClipboardList, Settings,
  Star, Check, Upload, Paperclip, AlertCircle, RefreshCw, Eye, Download,
  UserCheck, Ticket, Filter, MoreHorizontal, ExternalLink, Video, CalendarCheck,
  CreditCard, PlayCircle, ArrowRight, FileCheck, Stethoscope, SendHorizontal,
  LayoutDashboard, ListTodo, CircleDot, Timer, TrendingUp, Activity,
  MapPin, Globe, Receipt, Syringe, Weight, AlertTriangle, ChevronLeft,
  Euro, Wallet, Camera, Edit, Trash2, Info, StarHalf
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
  setToken(token) { this.token = token; if (typeof window !== 'undefined') localStorage.setItem('vetbuddy_token', token); },
  getToken() { if (!this.token && typeof window !== 'undefined') this.token = localStorage.getItem('vetbuddy_token'); return this.token; },
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
  const scrollToSection = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); };

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
            <div className="flex items-center gap-2"><VetBuddyLogo size={32} /><span className="font-bold text-xl text-gray-900">VetBuddy</span></div>
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
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-4 px-4">
            <nav className="flex flex-col gap-4">
              <button onClick={() => scrollToSection('differenziatori')} className="text-gray-600 text-left">Perché VetBuddy</button>
              <button onClick={() => scrollToSection('prezzi')} className="text-gray-600 text-left">Prezzi</button>
              <hr />
              <Button variant="ghost" className="justify-start" onClick={() => { setAuthMode('login'); setShowAuth(true); setMobileMenuOpen(false); }}>Accedi</Button>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); setMobileMenuOpen(false); }}>Registrati</Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-coral-100 text-coral-700 mb-6"><Zap className="h-3 w-3 mr-1" /> Pilot su invito</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            L'app che collega<br /><span className="text-coral-500">cliniche veterinarie e proprietari</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">Prenotazioni, messaggi, video-consulti e documenti clinici in un unico posto.</p>
          <p className="text-lg text-coral-600 font-medium mb-10">Meno caos, più tempo per i pazienti.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-coral-500 hover:bg-coral-600 text-white px-8" onClick={() => { setAuthMode('register'); setShowAuth(true); }}><Building2 className="h-5 w-5 mr-2" /> Sono una clinica</Button>
            <Button size="lg" variant="outline" className="px-8" onClick={() => { setAuthMode('register'); setShowAuth(true); }}><PawPrint className="h-5 w-5 mr-2" /> Sono un proprietario</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[{ icon: Clock, title: 'Online 24/7', desc: 'Prenotazioni sempre aperte' },{ icon: Zap, title: '2 minuti', desc: 'Per prenotare una visita' },{ icon: Shield, title: 'Verificato', desc: 'Cliniche con P.IVA' },{ icon: Heart, title: 'Gratis', desc: 'Per sempre per i proprietari' }].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border text-center">
                <item.icon className="h-5 w-5 text-coral-500 mx-auto mb-2" />
                <div className="font-semibold text-coral-500">{item.title}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Differenziatori */}
      <section id="differenziatori" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-coral-500 font-semibold mb-2">PERCHÉ VETBUDDY</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">3 superpoteri per la tua clinica</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-coral-200 bg-white">
              <CardHeader>
                <div className="h-14 w-14 bg-coral-100 rounded-2xl flex items-center justify-center mb-4"><Inbox className="h-7 w-7 text-coral-500" /></div>
                <CardTitle className="text-xl">Team Inbox</CardTitle>
                <CardDescription>Anti-doppioni, assegnazione ticket</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Un ticket alla volta: quando un operatore prende in carico, gli altri vedono il blocco.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Filtri per tipo e stato</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Assegnazione a operatore</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Template risposte rapide</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2 border-coral-500 bg-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral-500 text-white text-xs px-3 py-1 rounded-full">Più richiesto</div>
              <CardHeader>
                <div className="h-14 w-14 bg-coral-100 rounded-2xl flex items-center justify-center mb-4"><FileText className="h-7 w-7 text-coral-500" /></div>
                <CardTitle className="text-xl">Documenti automatici</CardTitle>
                <CardDescription>PDF via email + archivio in app</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Carichi il PDF → il cliente lo riceve via email come allegato → lo ritrova in app.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Upload PDF con 1 click</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Email automatica con allegato</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Archivio per animale</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2 border-coral-200 bg-white">
              <CardHeader>
                <div className="h-14 w-14 bg-coral-100 rounded-2xl flex items-center justify-center mb-4"><CalendarCheck className="h-7 w-7 text-coral-500" /></div>
                <CardTitle className="text-xl">Google Calendar Sync</CardTitle>
                <CardDescription>Sincronizzazione in tempo reale</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Prenotazioni sincronizzate su Google Calendar in tempo reale.</p>
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
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center"><PawPrint className="h-6 w-6 text-blue-600" /></div>
                <div><h3 className="font-bold text-lg">Per i Proprietari</h3><p className="text-sm text-gray-600">Sempre gratis</p></div>
              </div>
              <ul className="space-y-4">
                {['Prenota visite e video-consulti','Ricevi referti e prescrizioni via email','Chatta con la clinica','Storico completo per ogni animale'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" /><span className="text-gray-700">{item}</span></li>
                ))}
              </ul>
            </div>
            <div className="bg-coral-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center"><Building2 className="h-6 w-6 text-coral-600" /></div>
                <div><h3 className="font-bold text-lg">Per le Cliniche</h3><p className="text-sm text-gray-600">Pilot su invito</p></div>
              </div>
              <ul className="space-y-4">
                {['Dashboard operativa: cosa fare oggi in 10 sec','Team Inbox con assegnazione ticket','Carica documenti → invio email automatico','Flusso: Prepara → Visita → Concludi'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-coral-600 mt-0.5" /><span className="text-gray-700">{item}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Prezzi */}
      <section id="prezzi" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-coral-100 text-coral-700 mb-4">Pilot su invito</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Piani per cliniche</h2>
            <p className="text-gray-600 max-w-xl mx-auto"><strong>Sempre gratis per i proprietari di animali.</strong><br />Piani cliniche disponibili solo con accesso al Pilot.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Per iniziare</CardDescription>
                <div className="text-3xl font-bold text-coral-500 mt-4">Gratis</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 1 sede, 1 utente</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 30 richieste/mese</li>
                </ul>
                <Button className="w-full bg-coral-500 hover:bg-coral-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Richiedi accesso Pilot</Button>
              </CardContent>
            </Card>
            <Card className="border-2 border-coral-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral-500 text-white text-xs px-3 py-1 rounded-full">Consigliato</div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Per automatizzare</CardDescription>
                <div className="text-3xl font-bold text-coral-500 mt-4">€129<span className="text-sm font-normal text-gray-500">/mese</span></div>
                <p className="text-xs text-gray-400">+ IVA</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Fino a 10 staff</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Documenti + email auto</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Google Calendar sync</li>
                </ul>
                <Button className="w-full bg-coral-500 hover:bg-coral-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Richiedi accesso Pilot</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Gruppi e catene</CardDescription>
                <div className="text-3xl font-bold text-coral-500 mt-4">Custom</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Multi-sede illimitate</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> API dedicata</li>
                </ul>
                <Button variant="outline" className="w-full">Contattaci</Button>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-sm text-gray-500">Prezzi IVA esclusa. Piani disponibili solo per cliniche ammesse al Pilot.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-gray-900 mb-4">Domande frequenti</h2></div>
          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: 'Cos\'è il Pilot?', a: 'VetBuddy è in fase Pilot: stiamo testando con un numero limitato di cliniche. Le cliniche visibili nell\'app demo non sono ancora affiliate.' },
              { q: 'Quanto costa per i proprietari?', a: 'VetBuddy è e sarà sempre gratuito per i proprietari di animali.' },
              { q: 'Come funziona l\'invio documenti?', a: 'La clinica carica un PDF, seleziona proprietario e animale, e il documento viene inviato via email come allegato.' },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-lg px-6 border">
                <AccordionTrigger className="text-left font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-coral-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto a semplificare la tua clinica?</h2>
          <p className="text-coral-100 mb-8">Richiedi l'accesso al Pilot e scopri come VetBuddy può aiutarti.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-coral-500 hover:bg-coral-50" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Richiedi accesso Pilot</Button>
            <Button size="lg" variant="outline" className="border-white text-coral-500 bg-white hover:bg-coral-50" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Esplora la demo</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2"><VetBuddyLogo size={32} /><span className="font-bold text-xl">VetBuddy</span></div>
          <p className="text-gray-400 text-sm">© 2025 VetBuddy. Tutti i diritti riservati. GDPR Compliant.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md"><AuthForm mode={authMode} setMode={setAuthMode} onLogin={(user) => { setShowAuth(false); onLogin(user); }} /></DialogContent>
      </Dialog>
    </div>
  );
}

// Auth Form
function AuthForm({ mode, setMode, onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'owner', clinicName: '', phone: '', city: '', vatNumber: '', website: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? 'auth/login' : 'auth/register';
      const data = await api.post(endpoint, formData);
      api.setToken(data.token);
      onLogin(data.user);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await api.post('auth/forgot-password', { email: forgotEmail });
      setSuccess(data.message);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  if (showForgotPassword) {
    return (
      <div>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4"><VetBuddyLogo size={50} /></div>
          <DialogTitle className="text-2xl text-coral-500">Password dimenticata?</DialogTitle>
          <DialogDescription>Inserisci la tua email per ricevere un link di reset</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
          <div><Label>Email</Label><Input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required placeholder="La tua email" /></div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={loading}>
            {loading ? 'Invio...' : 'Invia link di reset'}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
            Torna al login
          </Button>
        </form>
      </div>
    );
  }

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
              <div><Label>{formData.role === 'clinic' ? 'Nome responsabile' : 'Nome completo'}</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
              {formData.role === 'clinic' && (
                <>
                  <div><Label>Nome Clinica</Label><Input value={formData.clinicName} onChange={(e) => setFormData({...formData, clinicName: e.target.value})} required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Città</Label><Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="Es. Roma" /></div>
                    <div><Label>Partita IVA</Label><Input value={formData.vatNumber} onChange={(e) => setFormData({...formData, vatNumber: e.target.value})} placeholder="IT01234567890" /></div>
                  </div>
                  <div><Label>Sito web</Label><Input value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="https://..." /></div>
                </>
              )}
              <div><Label>Telefono</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
            </>
          )}
          <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
          <div><Label>Password</Label><Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required /></div>
          {mode === 'login' && (
            <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-coral-500 hover:underline">
              Password dimenticata?
            </button>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={loading}>
            {loading ? 'Caricamento...' : (mode === 'login' ? 'Accedi' : (formData.role === 'clinic' ? 'Richiedi accesso Pilot' : 'Registrati gratis'))}
          </Button>
          {mode === 'register' && <p className="text-xs text-gray-500 text-center">{formData.role === 'clinic' ? 'VetBuddy è in fase Pilot. Ti ricontatteremo.' : 'Gratis per sempre per i proprietari.'}</p>}
        </form>
      </Tabs>
    </div>
  );
}

// Welcome Screen
function WelcomeScreen({ user, onContinue }) {
  const isClinic = user.role === 'clinic';
  return (
    <div className="min-h-screen bg-gradient-to-b from-coral-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4"><VetBuddyLogo size={60} /></div>
          <CardTitle className="text-2xl">Benvenuto in VetBuddy!</CardTitle>
          <CardDescription className="text-base mt-2">{isClinic ? 'Stai entrando nel portale per cliniche veterinarie' : 'Stai entrando nell\'app per proprietari di animali'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Cosa puoi fare:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {isClinic ? (
                <><li className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4 text-coral-500" /> Dashboard operativa: "cosa fare oggi"</li>
                <li className="flex items-center gap-2"><Inbox className="h-4 w-4 text-coral-500" /> Team Inbox con ticket e assegnazioni</li>
                <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-coral-500" /> Carica documenti e inviali via email</li>
                <li className="flex items-center gap-2"><Video className="h-4 w-4 text-coral-500" /> Video-consulti e pagamenti</li></>
              ) : (
                <><li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" /> Prenota visite e video-consulti</li>
                <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-blue-500" /> Chatta con la clinica</li>
                <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /> Ricevi referti e prescrizioni</li>
                <li className="flex items-center gap-2"><PawPrint className="h-4 w-4 text-blue-500" /> Gestisci i profili dei tuoi animali</li></>
              )}
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Versione Pilot / Demo</h4>
                <p className="text-sm text-amber-700 mt-1">{isClinic ? 'VetBuddy è in fase Pilot su invito. Alcune sezioni sono demo.' : 'VetBuddy è in fase Pilot: le cliniche visibili sono esempi/demo.'}</p>
              </div>
            </div>
          </div>
          <Button className="w-full bg-coral-500 hover:bg-coral-600" size="lg" onClick={onContinue}>{isClinic ? 'Entra nella dashboard' : 'Esplora l\'app'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== CLINIC DASHBOARD - CONTROL ROOM ====================
function ClinicDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [staff, setStaff] = useState([]);
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [setupProgress, setSetupProgress] = useState({ payments: false, video: false, team: false, automations: false });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [appts, docs, msgs, staffList, petsList, ownersList] = await Promise.all([
        api.get('appointments'), api.get('documents'), api.get('messages'),
        api.get('staff'), api.get('pets'), api.get('owners'),
      ]);
      setAppointments(appts); setDocuments(docs); setMessages(msgs);
      setStaff(staffList); setPets(petsList); setOwners(ownersList);
      // Calculate setup progress
      setSetupProgress({
        payments: false, // Stripe not connected
        video: appts.some(a => a.type === 'videoconsulto'),
        team: staffList.length > 0,
        automations: false
      });
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
  const completedSteps = Object.values(setupProgress).filter(Boolean).length;
  const totalSteps = 4;

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
        <Badge variant="outline" className="mb-6 justify-center text-amber-600 border-amber-300 bg-amber-50"><AlertCircle className="h-3 w-3 mr-1" /> Modalità Pilot</Badge>
        
        <nav className="space-y-1 flex-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
          <NavItem icon={Calendar} label="Agenda" value="agenda" />
          <NavItem icon={Inbox} label="Team Inbox" value="inbox" badge={unreadMessages} />
          <NavItem icon={FileText} label="Documenti" value="documents" />
          <NavItem icon={Stethoscope} label="Servizi" value="services" />
          <NavItem icon={PawPrint} label="Pazienti" value="patients" />
          <NavItem icon={User} label="Proprietari" value="owners" />
          <NavItem icon={Users} label="Staff" value="staff" />
          <NavItem icon={ClipboardList} label="Template" value="templates" />
          <NavItem icon={Settings} label="Impostazioni" value="settings" />
        </nav>
        
        <Button variant="ghost" onClick={onLogout} className="mt-auto text-gray-600"><LogOut className="h-4 w-4 mr-2" />Esci</Button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'dashboard' && <ClinicControlRoom appointments={appointments} documents={documents} messages={messages} setupProgress={setupProgress} onRefresh={loadData} />}
        {activeTab === 'agenda' && <ClinicAgenda appointments={appointments} onRefresh={loadData} />}
        {activeTab === 'inbox' && <ClinicInbox messages={messages} owners={owners} pets={pets} onRefresh={loadData} />}
        {activeTab === 'documents' && <ClinicDocuments documents={documents} owners={owners} pets={pets} onRefresh={loadData} />}
        {activeTab === 'services' && <ClinicServices />}
        {activeTab === 'patients' && <ClinicPatients pets={pets} onRefresh={loadData} />}
        {activeTab === 'owners' && <ClinicOwners owners={owners} onRefresh={loadData} />}
        {activeTab === 'staff' && <ClinicStaff staff={staff} onRefresh={loadData} />}
        {activeTab === 'templates' && <ClinicTemplates />}
        {activeTab === 'settings' && <ClinicSettings user={user} />}
      </main>
    </div>
  );
}

// ==================== CONTROL ROOM DASHBOARD ====================
function ClinicControlRoom({ appointments, documents, messages, setupProgress, onRefresh }) {
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const videoAppts = todayAppts.filter(a => a.type === 'videoconsulto');
  const unreadMessages = messages.filter(m => !m.read).length;
  const newFromClients = documents.filter(d => d.fromClient).length + messages.filter(m => !m.read && m.fromClient).length;
  
  const completedSteps = Object.values(setupProgress).filter(Boolean).length;
  const progressPercent = (completedSteps / 4) * 100;

  // Workflow data
  const docsToReview = documents.filter(d => d.status === 'to_review').length || 2;
  const followUps = messages.filter(m => m.type === 'follow_up' && !m.read).length || 1;
  const docsToSend = documents.filter(d => !d.emailSent).length || 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buongiorno! 👋</h1>
        <p className="text-gray-500">Ecco cosa devi fare oggi</p>
      </div>

      {/* Setup Bar - Onboarding */}
      {completedSteps < 4 && (
        <Card className="bg-gradient-to-r from-coral-50 to-orange-50 border-coral-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-coral-500" />
                <span className="font-medium">Completa la configurazione</span>
              </div>
              <span className="text-sm text-gray-500">{completedSteps}/4 completati</span>
            </div>
            <Progress value={progressPercent} className="h-2 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SetupStep icon={CreditCard} label="Pagamenti" desc="Collega Stripe" done={setupProgress.payments} />
              <SetupStep icon={Video} label="Video visita" desc="Configura orari" done={setupProgress.video} />
              <SetupStep icon={Users} label="Team" desc="Aggiungi staff" done={setupProgress.team} />
              <SetupStep icon={Bell} label="Automazioni" desc="Promemoria auto" done={setupProgress.automations} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Calendar} label="Appuntamenti oggi" value={todayAppts.length} color="coral" />
        <KPICard icon={Video} label="Video visite oggi" value={videoAppts.length} color="blue" highlight={videoAppts[0]?.time} />
        <KPICard icon={MessageCircle} label="Messaggi in attesa" value={unreadMessages} color="amber" />
        <KPICard icon={FileText} label="Nuovi da clienti" value={newFromClients} color="green" />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Workflow 3 Steps */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-coral-500" />
            Flusso di lavoro
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Step 1: Prepara */}
            <WorkflowCard 
              step="1" 
              title="Prepara" 
              icon={FileCheck}
              color="blue"
              items={[
                { label: 'Documenti pre-visita', count: docsToReview, action: 'Consulta' }
              ]}
            />
            
            {/* Step 2: Visita */}
            <WorkflowCard 
              step="2" 
              title="Visita" 
              icon={Stethoscope}
              color="coral"
              items={[
                { label: 'Video-visite oggi', count: videoAppts.length, action: 'Avvia', highlight: true }
              ]}
              nextVideo={videoAppts[0]}
            />
            
            {/* Step 3: Concludi */}
            <WorkflowCard 
              step="3" 
              title="Concludi" 
              icon={SendHorizontal}
              color="green"
              items={[
                { label: 'Follow-up da fare', count: followUps },
                { label: 'Documenti da inviare', count: docsToSend, action: 'Invia' }
              ]}
            />
          </div>

          {/* Today's Schedule */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-coral-500" />
                Agenda di oggi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppts.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">Nessun appuntamento oggi</p>
              ) : (
                <div className="space-y-2">
                  {todayAppts.slice(0, 5).map((appt, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${appt.type === 'videoconsulto' ? 'bg-blue-100' : 'bg-coral-100'}`}>
                          {appt.type === 'videoconsulto' ? <Video className="h-5 w-5 text-blue-600" /> : <PawPrint className="h-5 w-5 text-coral-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{appt.petName}</p>
                          <p className="text-xs text-gray-500">{appt.ownerName} • {appt.reason || appt.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{appt.time}</Badge>
                        {appt.type === 'videoconsulto' && (
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white h-8">
                            <PlayCircle className="h-3 w-3 mr-1" />Avvia
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Quick Actions */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-coral-500" />
            Azioni rapide
          </h2>

          {/* Next Video Visit */}
          {videoAppts.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Video className="h-4 w-4" />
                  <span className="text-sm font-medium">Prossima video visita</span>
                </div>
                <p className="font-semibold">{videoAppts[0].petName}</p>
                <p className="text-sm text-gray-600">{videoAppts[0].ownerName}</p>
                <p className="text-sm text-blue-600 font-medium mt-1">Ore {videoAppts[0].time}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1">Prepara</Button>
                  <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600">Avvia</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mini Inbox */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2"><Inbox className="h-4 w-4" />Inbox</span>
                {unreadMessages > 0 && <Badge className="bg-coral-500">{unreadMessages}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {unreadMessages === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">Nessun messaggio</p>
              ) : (
                <div className="space-y-2">
                  {messages.filter(m => !m.read).slice(0, 3).map((msg, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium truncate">{msg.subject || 'Nuovo messaggio'}</p>
                      <p className="text-xs text-gray-500 truncate">{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="ghost" className="w-full mt-2 text-coral-500" size="sm">Vai all'Inbox <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </CardContent>
          </Card>

          {/* Mini Documents */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" />Documenti</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-blue-50 rounded">
                  <p className="text-lg font-bold text-blue-600">{docsToReview}</p>
                  <p className="text-xs text-gray-500">Da consultare</p>
                </div>
                <div className="p-2 bg-coral-50 rounded">
                  <p className="text-lg font-bold text-coral-600">{docsToSend}</p>
                  <p className="text-xs text-gray-500">Da inviare</p>
                </div>
              </div>
              <Button variant="ghost" className="w-full mt-2 text-coral-500" size="sm">Gestisci <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Setup Step Component
function SetupStep({ icon: Icon, label, desc, done }) {
  return (
    <button className={`flex items-center gap-3 p-3 rounded-lg border transition ${done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-coral-300'}`}>
      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${done ? 'bg-green-100' : 'bg-coral-100'}`}>
        {done ? <Check className="h-4 w-4 text-green-600" /> : <Icon className="h-4 w-4 text-coral-500" />}
      </div>
      <div className="text-left">
        <p className={`text-sm font-medium ${done ? 'text-green-700' : ''}`}>{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </button>
  );
}

// KPI Card Component
function KPICard({ icon: Icon, label, value, color, highlight }) {
  const colors = {
    coral: 'bg-coral-100 text-coral-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
  };
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
            {highlight && <p className="text-xs text-coral-500 font-medium">Prossima: {highlight}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Workflow Card Component
function WorkflowCard({ step, title, icon: Icon, color, items, nextVideo }) {
  const colors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', badge: 'bg-blue-500' },
    coral: { bg: 'bg-coral-50', border: 'border-coral-200', icon: 'bg-coral-100 text-coral-600', badge: 'bg-coral-500' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-100 text-green-600', badge: 'bg-green-500' },
  };
  const c = colors[color];

  return (
    <Card className={`${c.bg} ${c.border}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`h-6 w-6 rounded-full ${c.icon} flex items-center justify-center text-xs font-bold`}>{step}</div>
          <span className="font-medium">{title}</span>
          <Icon className={`h-4 w-4 ml-auto ${c.icon.split(' ')[1]}`} />
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.label}</span>
              <div className="flex items-center gap-2">
                <Badge className={`${item.highlight ? c.badge : 'bg-gray-200 text-gray-700'} text-xs`}>{item.count}</Badge>
                {item.action && <Button size="sm" variant="ghost" className="h-6 text-xs">{item.action}</Button>}
              </div>
            </div>
          ))}
        </div>
        {nextVideo && (
          <div className="mt-3 pt-3 border-t border-current/10">
            <p className="text-xs text-gray-500">Prossima: <strong>{nextVideo.petName}</strong> ore {nextVideo.time}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Clinic Agenda
function ClinicAgenda({ appointments, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ petName: '', ownerName: '', date: '', time: '', reason: '', type: 'visita' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('appointments', formData); setShowDialog(false); onRefresh(); } catch (error) { alert(error.message); }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const upcomingAppts = appointments.filter(a => a.date > today).slice(0, 10);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-2xl font-bold text-gray-800">Agenda</h2><p className="text-gray-500 text-sm">Gestisci appuntamenti</p></div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Nuovo</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo Appuntamento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Tipo</Label><Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="visita">Visita</SelectItem><SelectItem value="vaccino">Vaccino</SelectItem><SelectItem value="videoconsulto">Video-consulto</SelectItem></SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Animale</Label><Input value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} required /></div><div><Label>Proprietario</Label><Input value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} required /></div></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Data</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required /></div><div><Label>Ora</Label><Input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required /></div></div>
              <div><Label>Motivo</Label><Input value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} /></div>
              <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Crea</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card><CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Clock className="h-4 w-4 text-coral-600" />Oggi <Badge variant="outline">{todayAppts.length}</Badge></CardTitle></CardHeader><CardContent>{todayAppts.length === 0 ? <p className="text-gray-500 text-sm py-4 text-center">Nessun appuntamento</p> : <div className="space-y-2">{todayAppts.map((appt, i) => <div key={i} className="flex items-center justify-between p-3 bg-coral-50 rounded-lg"><div className="flex items-center gap-3"><div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">{appt.type === 'videoconsulto' ? <Video className="h-5 w-5 text-blue-600" /> : <PawPrint className="h-5 w-5 text-coral-600" />}</div><div><p className="font-medium text-sm">{appt.petName}</p><p className="text-xs text-gray-500">{appt.ownerName}</p></div></div><Badge className="bg-coral-500">{appt.time}</Badge></div>)}</div>}</CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-lg">Prossimi</CardTitle></CardHeader><CardContent>{upcomingAppts.length === 0 ? <p className="text-gray-500 text-sm py-4 text-center">Nessuno</p> : <div className="space-y-2">{upcomingAppts.map((appt, i) => <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"><div className="flex items-center gap-3"><PawPrint className="h-4 w-4 text-gray-400" /><div><p className="font-medium text-sm">{appt.petName}</p><p className="text-xs text-gray-500">{appt.ownerName}</p></div></div><div className="text-right"><p className="text-sm font-medium">{appt.date}</p><p className="text-xs text-gray-500">{appt.time}</p></div></div>)}</div>}</CardContent></Card>
      </div>
    </div>
  );
}

// Clinic Inbox
function ClinicInbox({ messages, owners, pets, onRefresh }) {
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [filter, setFilter] = useState('all');
  const filteredMessages = messages.filter(m => { if (filter === 'unread') return !m.read; if (filter === 'assigned') return m.assignedTo; return true; });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-2xl font-bold text-gray-800">Team Inbox</h2><p className="text-gray-500 text-sm">Gestisci messaggi e richieste</p></div>
        <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tutti</SelectItem><SelectItem value="unread">Non letti</SelectItem><SelectItem value="assigned">Assegnati</SelectItem></SelectContent></Select>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1"><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-500">TICKET ({filteredMessages.length})</CardTitle></CardHeader><CardContent className="p-0"><ScrollArea className="h-[500px]">{filteredMessages.length === 0 ? <div className="p-6 text-center text-gray-500"><Inbox className="h-8 w-8 mx-auto mb-2 text-gray-300" /><p className="text-sm">Nessun messaggio</p></div> : filteredMessages.map((msg) => <div key={msg.id} onClick={() => setSelectedMsg(msg)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedMsg?.id === msg.id ? 'bg-coral-50 border-l-4 border-l-coral-500' : ''} ${!msg.read ? 'bg-blue-50' : ''}`}><div className="flex items-start justify-between"><div className="flex-1 min-w-0"><p className={`font-medium text-sm truncate ${!msg.read ? 'text-blue-700' : ''}`}>{msg.subject || 'Nuovo messaggio'}</p><p className="text-xs text-gray-500 truncate mt-1">{msg.content}</p></div></div><p className="text-xs text-gray-400 mt-2">{new Date(msg.createdAt).toLocaleDateString()}</p></div>)}</ScrollArea></CardContent></Card>
        <Card className="lg:col-span-2">{selectedMsg ? <><CardHeader className="border-b"><div className="flex items-start justify-between"><div><CardTitle className="text-lg">{selectedMsg.subject || 'Messaggio'}</CardTitle><CardDescription className="mt-1">Da: Proprietario</CardDescription></div><div className="flex items-center gap-2"><Button size="sm"><UserCheck className="h-4 w-4 mr-1" />Prendi in carico</Button><Button size="sm" variant="outline"><CheckCircle className="h-4 w-4 mr-1" />Risolvi</Button></div></div></CardHeader><CardContent className="p-6"><div className="bg-gray-50 rounded-lg p-4 mb-6"><div className="grid grid-cols-3 gap-4 text-sm"><div><span className="text-gray-500">Stato:</span> <Badge variant="outline">{selectedMsg.status || 'Aperto'}</Badge></div><div><span className="text-gray-500">Creato:</span> {new Date(selectedMsg.createdAt).toLocaleString()}</div><div><span className="text-gray-500">Assegnato:</span> {selectedMsg.assignedTo || '—'}</div></div></div><div className="prose prose-sm max-w-none"><p>{selectedMsg.content}</p></div></CardContent></> : <CardContent className="flex items-center justify-center h-[500px] text-gray-500"><div className="text-center"><Ticket className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Seleziona un ticket</p></div></CardContent>}</Card>
      </div>
    </div>
  );
}

// Document Upload Form
function DocumentUploadForm({ owners, pets, onSuccess }) {
  const [formData, setFormData] = useState({ type: 'prescrizione', ownerEmail: '', petName: '', title: '', file: null, fileName: '', notes: '', sendEmail: true });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => { setFormData({ ...formData, file: reader.result, fileName: file.name, title: formData.title || file.name.replace('.pdf', '') }); };
      reader.readAsDataURL(file);
    } else { alert('Per favore seleziona un file PDF'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) { alert('Seleziona un file PDF'); return; }
    setUploading(true);
    try { await api.post('documents', { name: formData.title, type: formData.type, content: formData.file, fileName: formData.fileName, petName: formData.petName, ownerEmail: formData.ownerEmail, notes: formData.notes, sendEmail: formData.sendEmail }); onSuccess?.(); } catch (error) { alert(error.message); } finally { setUploading(false); }
  };

  return (
    <><DialogHeader><DialogTitle>Carica documento</DialogTitle><DialogDescription>Il documento verrà salvato e opzionalmente inviato via email con PDF allegato.</DialogDescription></DialogHeader>
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div><Label>Tipo documento</Label><Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="prescrizione">Prescrizione</SelectItem><SelectItem value="referto">Referto</SelectItem><SelectItem value="istruzioni">Istruzioni</SelectItem><SelectItem value="altro">Altro</SelectItem></SelectContent></Select></div>
      <div className="grid grid-cols-2 gap-4"><div><Label>Proprietario</Label><Input placeholder="Nome o email" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} /></div><div><Label>Animale</Label><Input placeholder="Nome animale" value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} /></div></div>
      <div><Label>Titolo documento</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Es: Prescrizione antibiotico" /></div>
      <div><Label>File PDF</Label><input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileSelect} className="hidden" /><div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-coral-400 transition">{formData.fileName ? <div className="flex items-center justify-center gap-2 text-coral-600"><FileText className="h-5 w-5" /><span className="font-medium">{formData.fileName}</span></div> : <><Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-500">Clicca per selezionare un PDF</p></>}</div></div>
      <div><Label>Note interne (solo clinica)</Label><Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} /></div>
      <div className="flex items-center justify-between p-4 bg-coral-50 rounded-lg"><div><p className="font-medium text-sm">Invia via email automaticamente</p><p className="text-xs text-gray-500">Il proprietario riceverà il PDF come allegato</p></div><Switch checked={formData.sendEmail} onCheckedChange={(v) => setFormData({...formData, sendEmail: v})} /></div>
      <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={uploading}>{uploading ? 'Caricamento...' : (formData.sendEmail ? 'Carica e invia email' : 'Carica documento')}</Button>
    </form></>
  );
}

// Clinic Documents
function ClinicDocuments({ documents, owners, pets, onRefresh }) {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedClientDoc, setSelectedClientDoc] = useState(null);
  const [replyText, setReplyText] = useState('');
  const docTypes = { prescrizione: { label: 'Prescrizione', color: 'bg-purple-100 text-purple-700' }, referto: { label: 'Referto', color: 'bg-blue-100 text-blue-700' }, istruzioni: { label: 'Istruzioni', color: 'bg-green-100 text-green-700' }, altro: { label: 'Altro', color: 'bg-gray-100 text-gray-700' }, foto: { label: 'Foto', color: 'bg-pink-100 text-pink-700' }, video: { label: 'Video', color: 'bg-indigo-100 text-indigo-700' }, esame: { label: 'Esame', color: 'bg-cyan-100 text-cyan-700' } };

  // Mock data for client-uploaded documents
  const [clientDocs, setClientDocs] = useState([
    { id: 'cd1', name: 'Foto_zampa_Luna.jpg', type: 'foto', petName: 'Luna', ownerName: 'Marco Rossi', ownerEmail: 'marco@email.com', createdAt: new Date().toISOString(), read: false, notes: 'La zampa sembra gonfia da ieri sera, vorrei un parere', preview: true },
    { id: 'cd2', name: 'Esame_sangue_Milo.pdf', type: 'esame', petName: 'Milo', ownerName: 'Anna Bianchi', ownerEmail: 'anna@email.com', createdAt: new Date(Date.now() - 86400000).toISOString(), read: true, notes: 'Allego esami fatti in altro laboratorio', preview: false },
    { id: 'cd3', name: 'Video_tosse_Rocky.mp4', type: 'video', petName: 'Rocky', ownerName: 'Giulia Verdi', ownerEmail: 'giulia@email.com', createdAt: new Date(Date.now() - 172800000).toISOString(), read: false, notes: 'Il cane tossisce così da 3 giorni', preview: true },
  ]);

  const markAsRead = (docId) => {
    setClientDocs(clientDocs.map(d => d.id === docId ? { ...d, read: true } : d));
  };

  const handleReply = (doc) => {
    alert(`Risposta inviata a ${doc.ownerEmail}: "${replyText}"`);
    setReplyText('');
    setSelectedClientDoc(null);
    markAsRead(doc.id);
  };

  const unreadCount = clientDocs.filter(d => !d.read).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-2xl font-bold text-gray-800">Documenti</h2><p className="text-gray-500 text-sm">Carica PDF e inviali automaticamente via email</p></div>
        <Button className="bg-coral-500 hover:bg-coral-600" onClick={() => setShowUpload(true)}><Upload className="h-4 w-4 mr-2" />Carica documento</Button>
      </div>
      <div className="bg-coral-50 border border-coral-200 rounded-lg p-4 mb-6"><div className="flex items-start gap-3"><FileText className="h-5 w-5 text-coral-600 mt-0.5" /><div><h4 className="font-medium text-coral-800">Come funziona</h4><p className="text-sm text-coral-700">Carichi il PDF → il proprietario lo riceve via email come allegato → lo ritrova in app nella sezione Documenti.</p></div></div></div>
      
      <Tabs defaultValue="dalla-clinica">
        <TabsList>
          <TabsTrigger value="dalla-clinica">Dalla clinica</TabsTrigger>
          <TabsTrigger value="dai-clienti" className="relative">
            Caricati dai clienti
            {unreadCount > 0 && <Badge className="ml-2 bg-coral-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">{unreadCount}</Badge>}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dalla-clinica" className="mt-4">
          <div className="space-y-3">
            {documents.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-gray-500"><FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p className="font-medium">Nessun documento</p></CardContent></Card>
            ) : documents.map((doc) => (
              <Card key={doc.id}><CardContent className="p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="h-12 w-12 bg-coral-100 rounded-lg flex items-center justify-center"><FileText className="h-6 w-6 text-coral-600" /></div><div><p className="font-medium">{doc.name}</p><p className="text-sm text-gray-500">{doc.petName || 'N/A'} • {new Date(doc.createdAt).toLocaleDateString()}</p></div></div><div className="flex items-center gap-3"><Badge className={docTypes[doc.type]?.color || docTypes.altro.color}>{docTypes[doc.type]?.label || 'Altro'}</Badge>{doc.emailSent ? <Badge variant="outline" className="text-green-600 border-green-300"><Mail className="h-3 w-3 mr-1" />Inviata</Badge> : <Badge variant="outline" className="text-gray-500">Non inviata</Badge>}<Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button></div></div></CardContent></Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="dai-clienti" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Document List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    DOCUMENTI RICEVUTI ({clientDocs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {clientDocs.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Nessun documento dai clienti</p>
                      </div>
                    ) : clientDocs.map((doc) => (
                      <div 
                        key={doc.id} 
                        onClick={() => { setSelectedClientDoc(doc); markAsRead(doc.id); }}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedClientDoc?.id === doc.id ? 'bg-coral-50 border-l-4 border-l-coral-500' : ''} ${!doc.read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${doc.type === 'foto' ? 'bg-pink-100' : doc.type === 'video' ? 'bg-indigo-100' : 'bg-cyan-100'}`}>
                            {doc.type === 'foto' ? <Eye className="h-5 w-5 text-pink-600" /> : doc.type === 'video' ? <PlayCircle className="h-5 w-5 text-indigo-600" /> : <FileText className="h-5 w-5 text-cyan-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-medium text-sm truncate ${!doc.read ? 'text-blue-700' : ''}`}>{doc.petName}</p>
                              {!doc.read && <CircleDot className="h-3 w-3 text-blue-500" />}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{doc.ownerName}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(doc.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Document Detail */}
            <Card className="lg:col-span-2">
              {selectedClientDoc ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {selectedClientDoc.name}
                          <Badge className={docTypes[selectedClientDoc.type]?.color || docTypes.altro.color}>
                            {docTypes[selectedClientDoc.type]?.label || 'Altro'}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Da: {selectedClientDoc.ownerName} ({selectedClientDoc.ownerEmail})
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />Scarica
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />Anteprima
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Document Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Animale:</span>
                          <p className="font-medium">{selectedClientDoc.petName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Tipo:</span>
                          <p className="font-medium">{docTypes[selectedClientDoc.type]?.label || 'Altro'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Data:</span>
                          <p className="font-medium">{new Date(selectedClientDoc.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Stato:</span>
                          <Badge variant="outline" className={selectedClientDoc.read ? 'text-green-600 border-green-300' : 'text-blue-600 border-blue-300'}>
                            {selectedClientDoc.read ? 'Letto' : 'Non letto'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Preview Area */}
                    {selectedClientDoc.preview && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">ANTEPRIMA</h4>
                        <div className="border rounded-lg p-8 bg-gray-100 flex items-center justify-center">
                          {selectedClientDoc.type === 'foto' ? (
                            <div className="text-center">
                              <div className="h-32 w-32 bg-gray-300 rounded-lg mx-auto flex items-center justify-center">
                                <Eye className="h-12 w-12 text-gray-500" />
                              </div>
                              <p className="text-sm text-gray-500 mt-2">Clicca "Anteprima" per visualizzare</p>
                            </div>
                          ) : selectedClientDoc.type === 'video' ? (
                            <div className="text-center">
                              <div className="h-32 w-48 bg-gray-800 rounded-lg mx-auto flex items-center justify-center">
                                <PlayCircle className="h-12 w-12 text-white" />
                              </div>
                              <p className="text-sm text-gray-500 mt-2">Clicca per riprodurre il video</p>
                            </div>
                          ) : (
                            <FileText className="h-16 w-16 text-gray-400" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Client Notes */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">NOTE DEL PROPRIETARIO</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-700">{selectedClientDoc.notes}</p>
                      </div>
                    </div>

                    {/* Reply Section */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">RISPONDI</h4>
                      <div className="space-y-3">
                        <Textarea 
                          placeholder="Scrivi una risposta al proprietario..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">La risposta verrà inviata via email a {selectedClientDoc.ownerEmail}</p>
                          <Button 
                            className="bg-coral-500 hover:bg-coral-600"
                            disabled={!replyText.trim()}
                            onClick={() => handleReply(selectedClientDoc)}
                          >
                            <Send className="h-4 w-4 mr-2" />Invia risposta
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-[500px] text-gray-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">Seleziona un documento</p>
                    <p className="text-sm mt-1">Clicca su un documento per vedere i dettagli</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showUpload} onOpenChange={setShowUpload}><DialogContent className="max-w-lg"><DocumentUploadForm owners={owners} pets={pets} onSuccess={() => { setShowUpload(false); onRefresh(); }} /></DialogContent></Dialog>
    </div>
  );
}

// Simple components for other sections
function ClinicPatients({ pets, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', species: 'dog', breed: '' });
  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('pets', formData); setShowDialog(false); onRefresh(); } catch (error) { alert(error.message); } };
  return <div><div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold">Pazienti</h2><p className="text-gray-500 text-sm">Animali registrati</p></div><Dialog open={showDialog} onOpenChange={setShowDialog}><DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Nuovo</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nuovo paziente</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div><div><Label>Specie</Label><Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dog">Cane</SelectItem><SelectItem value="cat">Gatto</SelectItem><SelectItem value="other">Altro</SelectItem></SelectContent></Select></div><div><Label>Razza</Label><Input value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} /></div><Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi</Button></form></DialogContent></Dialog></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{pets.length === 0 ? <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun paziente</p></CardContent></Card> : pets.map((pet) => <Card key={pet.id}><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center">{pet.species === 'dog' ? <Dog className="h-6 w-6 text-coral-600" /> : pet.species === 'cat' ? <Cat className="h-6 w-6 text-coral-600" /> : <PawPrint className="h-6 w-6 text-coral-600" />}</div><div><p className="font-medium">{pet.name}</p><p className="text-sm text-gray-500">{pet.breed || pet.species}</p></div></div></CardContent></Card>)}</div></div>;
}

function ClinicOwners({ owners, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('owners', formData); setShowDialog(false); onRefresh(); } catch (error) { alert(error.message); } };
  return <div><div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold">Proprietari</h2><p className="text-gray-500 text-sm">Clienti della clinica</p></div><Dialog open={showDialog} onOpenChange={setShowDialog}><DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Aggiungi</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nuovo proprietario</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div><div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div><div><Label>Telefono</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div><Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi</Button></form></DialogContent></Dialog></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{owners.length === 0 ? <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><User className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun proprietario</p></CardContent></Card> : owners.map((owner) => <Card key={owner.id}><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-blue-600" /></div><div><p className="font-medium">{owner.name}</p><p className="text-sm text-gray-500">{owner.email}</p></div></div>{owner.phone && <p className="text-sm text-gray-500 mt-3 flex items-center gap-2"><Phone className="h-4 w-4" />{owner.phone}</p>}</CardContent></Card>)}</div></div>;
}

function ClinicStaff({ staff, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'vet', email: '', phone: '' });
  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('staff', formData); setShowDialog(false); onRefresh(); } catch (error) { alert(error.message); } };
  const roleLabels = { vet: 'Veterinario', assistant: 'Assistente', receptionist: 'Receptionist' };
  return <div><div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold">Staff</h2><p className="text-gray-500 text-sm">Gestisci il team</p></div><Dialog open={showDialog} onOpenChange={setShowDialog}><DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Aggiungi</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nuovo membro</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div><div><Label>Ruolo</Label><Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="vet">Veterinario</SelectItem><SelectItem value="assistant">Assistente</SelectItem><SelectItem value="receptionist">Receptionist</SelectItem></SelectContent></Select></div><div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div><Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi</Button></form></DialogContent></Dialog></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{staff.length === 0 ? <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><Users className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun membro</p></CardContent></Card> : staff.map((member) => <Card key={member.id}><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-coral-600" /></div><div><p className="font-medium">{member.name}</p><Badge variant="outline">{roleLabels[member.role]}</Badge></div></div></CardContent></Card>)}</div></div>;
}

// Clinic Services - Servizi offerti
function ClinicServices() {
  const [showDialog, setShowDialog] = useState(false);
  const [services, setServices] = useState([
    { id: 1, name: 'Visita generale', description: 'Check-up completo dello stato di salute', duration: 30, price: 50, active: true, type: 'in_sede' },
    { id: 2, name: 'Video-consulto', description: 'Consulenza veterinaria online', duration: 20, price: 35, active: true, type: 'online' },
    { id: 3, name: 'Vaccinazione', description: 'Somministrazione vaccini e richiami', duration: 15, price: 40, active: true, type: 'in_sede' },
    { id: 4, name: 'Controllo post-operatorio', description: 'Visita di controllo dopo intervento chirurgico', duration: 20, price: 30, active: true, type: 'in_sede' },
    { id: 5, name: 'Esami del sangue', description: 'Prelievo e analisi ematiche', duration: 20, price: 60, active: true, type: 'in_sede' },
    { id: 6, name: 'Ecografia', description: 'Esame ecografico addominale o cardiaco', duration: 30, price: 80, active: true, type: 'in_sede' },
    { id: 7, name: 'Pulizia dentale', description: 'Detartrasi e igiene orale', duration: 45, price: 120, active: false, type: 'in_sede' },
    { id: 8, name: 'Consulto specialistico', description: 'Video-consulto con specialista', duration: 30, price: 60, active: true, type: 'online' },
  ]);
  const [formData, setFormData] = useState({ name: '', description: '', duration: 30, price: 0, type: 'in_sede' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setServices([...services, { ...formData, id: Date.now(), active: true }]);
    setShowDialog(false);
    setFormData({ name: '', description: '', duration: 30, price: 0, type: 'in_sede' });
  };

  const toggleService = (id) => {
    setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const inSedeServices = services.filter(s => s.type === 'in_sede');
  const onlineServices = services.filter(s => s.type === 'online');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Servizi offerti</h2>
          <p className="text-gray-500 text-sm">Configura i servizi che offri ai clienti</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Nuovo servizio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo servizio</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome servizio</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Es: Visita dermatologica" required />
              </div>
              <div>
                <Label>Descrizione</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} />
              </div>
              <div>
                <Label>Tipologia</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_sede">In sede</SelectItem>
                    <SelectItem value="online">Online (Video-consulto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Durata (minuti)</Label>
                  <Input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})} />
                </div>
                <div>
                  <Label>Prezzo (€)</Label>
                  <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})} />
                </div>
              </div>
              <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi servizio</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-coral-500">{services.filter(s => s.active).length}</p>
            <p className="text-sm text-gray-500">Servizi attivi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{onlineServices.filter(s => s.active).length}</p>
            <p className="text-sm text-gray-500">Video-consulti</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{inSedeServices.filter(s => s.active).length}</p>
            <p className="text-sm text-gray-500">In sede</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tutti">
        <TabsList>
          <TabsTrigger value="tutti">Tutti ({services.length})</TabsTrigger>
          <TabsTrigger value="in_sede">In sede ({inSedeServices.length})</TabsTrigger>
          <TabsTrigger value="online">Online ({onlineServices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tutti" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} onToggle={toggleService} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in_sede" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {inSedeServices.map((service) => (
              <ServiceCard key={service.id} service={service} onToggle={toggleService} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="online" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {onlineServices.map((service) => (
              <ServiceCard key={service.id} service={service} onToggle={toggleService} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ServiceCard({ service, onToggle }) {
  return (
    <Card className={!service.active ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${service.type === 'online' ? 'bg-blue-100' : 'bg-coral-100'}`}>
              {service.type === 'online' ? <Video className="h-5 w-5 text-blue-600" /> : <Stethoscope className="h-5 w-5 text-coral-600" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{service.name}</p>
                <Badge variant="outline" className={service.type === 'online' ? 'text-blue-600 border-blue-300' : 'text-coral-600 border-coral-300'}>
                  {service.type === 'online' ? 'Online' : 'In sede'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">{service.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{service.duration} min</span>
                <span className="font-medium text-coral-600">€{service.price}</span>
              </div>
            </div>
          </div>
          <Switch checked={service.active} onCheckedChange={() => onToggle(service.id)} />
        </div>
      </CardContent>
    </Card>
  );
}

function ClinicTemplates() {
  const templates = [
    { id: 1, name: 'Conferma appuntamento', type: 'email', vars: ['nome_cliente', 'nome_pet', 'data', 'ora'] },
    { id: 2, name: 'Reminder 24h', type: 'reminder', vars: ['nome_pet', 'data', 'ora', 'nome_clinica'] },
    { id: 3, name: 'Follow-up post visita', type: 'email', vars: ['nome_cliente', 'nome_pet', 'nome_medico'] },
    { id: 4, name: 'Prescrizione pronta', type: 'email', vars: ['nome_cliente', 'nome_pet'] },
  ];
  return <div><div className="mb-6"><h2 className="text-2xl font-bold">Template</h2><p className="text-gray-500 text-sm">Messaggi, email e reminder automatici</p></div><Tabs defaultValue="tutti"><TabsList><TabsTrigger value="tutti">Tutti</TabsTrigger><TabsTrigger value="email">Email</TabsTrigger><TabsTrigger value="reminder">Reminder</TabsTrigger></TabsList><TabsContent value="tutti" className="mt-4"><div className="space-y-3">{templates.map((t) => <Card key={t.id}><CardContent className="p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="h-10 w-10 bg-coral-100 rounded-lg flex items-center justify-center">{t.type === 'email' ? <Mail className="h-5 w-5 text-coral-600" /> : <Bell className="h-5 w-5 text-coral-600" />}</div><div><p className="font-medium">{t.name}</p><p className="text-sm text-gray-500">Variabili: {t.vars.map(v => `{{${v}}}`).join(', ')}</p></div></div><Button variant="outline" size="sm">Modifica</Button></div></CardContent></Card>)}</div></TabsContent></Tabs></div>;
}

function ClinicSettings({ user }) {
  const [googleConnected, setGoogleConnected] = useState(false);
  return <div><div className="mb-6"><h2 className="text-2xl font-bold">Impostazioni</h2><p className="text-gray-500 text-sm">Configura la tua clinica</p></div><div className="space-y-6 max-w-2xl"><Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5 text-coral-500" />Pagamenti (Stripe)</CardTitle><CardDescription>Collega Stripe per video-consulti a pagamento</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div><p className="font-medium">Non connesso</p><p className="text-sm text-gray-500">Connetti per abilitare incassi prestazioni</p></div><Button className="bg-coral-500 hover:bg-coral-600">Connetti Stripe</Button></div></CardContent></Card><Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-coral-500" />Google Calendar</CardTitle><CardDescription>Sincronizza appuntamenti in tempo reale</CardDescription></CardHeader><CardContent>{googleConnected ? <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg"><div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-600" /><div><p className="font-medium text-green-800">Connesso</p><p className="text-sm text-green-600">Calendario sincronizzato</p></div></div><Button variant="outline" size="sm">Disconnetti</Button></div> : <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div><p className="font-medium">Non connesso</p><p className="text-sm text-gray-500">Connetti per evitare doppie prenotazioni</p></div><Button className="bg-coral-500 hover:bg-coral-600" onClick={() => setGoogleConnected(true)}><ExternalLink className="h-4 w-4 mr-2" />Connetti</Button></div>}</CardContent></Card><Card><CardHeader><CardTitle className="text-lg">Profilo clinica</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>Nome clinica</Label><Input value={user.clinicName || ''} disabled /></div><div><Label>Email</Label><Input value={user.email || ''} disabled /></div></CardContent></Card></div></div>;
}

// ==================== OWNER DASHBOARD ====================
function OwnerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [pets, setPets] = useState([]);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const [appts, docs, msgs, petsList] = await Promise.all([api.get('appointments'), api.get('documents'), api.get('messages'), api.get('pets')]); setAppointments(appts); setDocuments(docs); setMessages(msgs); setPets(petsList); } catch (error) { console.error('Error:', error); } };

  const NavItem = ({ icon: Icon, label, value, badge }) => <button onClick={() => { setActiveTab(value); setSelectedPetId(null); }} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${activeTab === value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><div className="flex items-center gap-3"><Icon className="h-5 w-5" />{label}</div>{badge > 0 && <Badge className="bg-blue-500 text-white text-xs">{badge}</Badge>}</button>;

  const handleOpenPetProfile = (petId) => {
    setSelectedPetId(petId);
    setActiveTab('petProfile');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-2"><VetBuddyLogo size={36} /><div><h1 className="font-bold text-coral-500">VetBuddy</h1><p className="text-xs text-gray-500 truncate max-w-[140px]">{user.name}</p></div></div>
        <Badge variant="outline" className="mb-6 justify-center text-amber-600 border-amber-300 bg-amber-50"><AlertCircle className="h-3 w-3 mr-1" /> Demo / Pilot</Badge>
        <nav className="space-y-1 flex-1">
          <NavItem icon={Calendar} label="Appuntamenti" value="appointments" />
          <NavItem icon={FileText} label="Documenti" value="documents" badge={documents.length} />
          <NavItem icon={MessageCircle} label="Messaggi" value="messages" />
          <NavItem icon={PawPrint} label="I miei animali" value="pets" />
          <div className="border-t my-3"></div>
          <NavItem icon={Search} label="Trova clinica" value="findClinic" />
        </nav>
        <Button variant="ghost" onClick={onLogout} className="mt-auto text-gray-600"><LogOut className="h-4 w-4 mr-2" />Esci</Button>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'appointments' && <OwnerAppointments appointments={appointments} pets={pets} />}
        {activeTab === 'documents' && <OwnerDocuments documents={documents} pets={pets} onRefresh={loadData} />}
        {activeTab === 'messages' && <OwnerMessages messages={messages} />}
        {activeTab === 'pets' && <OwnerPets pets={pets} onRefresh={loadData} onOpenProfile={handleOpenPetProfile} />}
        {activeTab === 'petProfile' && selectedPetId && <PetProfile petId={selectedPetId} onBack={() => setActiveTab('pets')} appointments={appointments} documents={documents} />}
        {activeTab === 'findClinic' && <FindClinic user={user} />}
      </main>
    </div>
  );
}

function OwnerAppointments({ appointments, pets }) {
  const [showBooking, setShowBooking] = useState(false);
  const [formData, setFormData] = useState({ petId: '', serviceId: '', date: '', time: '', notes: '' });
  
  // Available services from clinic
  const availableServices = [
    { id: 1, name: 'Visita generale', duration: 30, price: 50, type: 'in_sede' },
    { id: 2, name: 'Video-consulto', duration: 20, price: 35, type: 'online' },
    { id: 3, name: 'Vaccinazione', duration: 15, price: 40, type: 'in_sede' },
    { id: 4, name: 'Controllo post-operatorio', duration: 20, price: 30, type: 'in_sede' },
    { id: 5, name: 'Esami del sangue', duration: 20, price: 60, type: 'in_sede' },
    { id: 6, name: 'Ecografia', duration: 30, price: 80, type: 'in_sede' },
    { id: 8, name: 'Consulto specialistico', duration: 30, price: 60, type: 'online' },
  ];
  
  const selectedService = availableServices.find(s => s.id === parseInt(formData.serviceId));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const service = availableServices.find(s => s.id === parseInt(formData.serviceId));
    const pet = pets.find(p => p.id === formData.petId);
    try {
      await api.post('appointments', {
        petName: pet?.name || 'Animale',
        ownerName: 'Proprietario',
        date: formData.date,
        time: formData.time,
        type: service?.type === 'online' ? 'videoconsulto' : 'visita',
        reason: service?.name || 'Visita',
        notes: formData.notes
      });
      setShowBooking(false);
      setFormData({ petId: '', serviceId: '', date: '', time: '', notes: '' });
    } catch (error) { alert(error.message); }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">I miei appuntamenti</h2>
          <p className="text-gray-500 text-sm">Visite e consulti prenotati</p>
        </div>
        <Dialog open={showBooking} onOpenChange={setShowBooking}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />Prenota visita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Prenota una visita</DialogTitle>
              <DialogDescription>Scegli il servizio e l'orario preferito</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Pet Selection */}
              <div>
                <Label>Per quale animale?</Label>
                <Select value={formData.petId} onValueChange={(v) => setFormData({...formData, petId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona animale" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map(pet => (
                      <SelectItem key={pet.id} value={pet.id}>
                        <div className="flex items-center gap-2">
                          {pet.species === 'dog' ? <Dog className="h-4 w-4" /> : pet.species === 'cat' ? <Cat className="h-4 w-4" /> : <PawPrint className="h-4 w-4" />}
                          {pet.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Service Selection */}
              <div>
                <Label>Tipo di visita</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {availableServices.map(service => (
                    <div 
                      key={service.id}
                      onClick={() => setFormData({...formData, serviceId: service.id.toString()})}
                      className={`p-3 border rounded-lg cursor-pointer transition ${formData.serviceId === service.id.toString() ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${service.type === 'online' ? 'bg-blue-100' : 'bg-coral-100'}`}>
                            {service.type === 'online' ? <Video className="h-4 w-4 text-blue-600" /> : <Stethoscope className="h-4 w-4 text-coral-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{service.name}</p>
                            <p className="text-xs text-gray-500">{service.duration} min • {service.type === 'online' ? 'Online' : 'In sede'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">€{service.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Date/Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <Label>Ora</Label>
                  <Input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required />
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <Label>Note per il veterinario (opzionale)</Label>
                <Textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                  placeholder="Descrivi brevemente il motivo della visita..."
                  rows={2}
                />
              </div>
              
              {/* Summary */}
              {selectedService && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Riepilogo</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servizio:</span>
                      <span className="font-medium">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durata:</span>
                      <span>{selectedService.duration} minuti</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Costo:</span>
                      <span className="font-semibold text-blue-600">€{selectedService.price}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={!formData.petId || !formData.serviceId || !formData.date || !formData.time}>
                Prenota appuntamento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {appointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Nessun appuntamento</p>
            <p className="text-sm mt-2">Prenota la tua prima visita!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <Card key={appt.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${appt.type === 'videoconsulto' ? 'bg-blue-100' : 'bg-coral-100'}`}>
                    {appt.type === 'videoconsulto' ? <Video className="h-6 w-6 text-blue-600" /> : <PawPrint className="h-6 w-6 text-coral-600" />}
                  </div>
                  <div>
                    <p className="font-medium">{appt.petName}</p>
                    <p className="text-sm text-gray-500">{appt.reason || 'Visita'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{appt.date}</p>
                  <p className="text-sm text-gray-500">{appt.time}</p>
                  {appt.type === 'videoconsulto' && (
                    <Button size="sm" className="mt-2 bg-blue-500 hover:bg-blue-600">
                      <Video className="h-3 w-3 mr-1" />Entra
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OwnerDocuments({ documents, pets, onRefresh }) {
  const [showUpload, setShowUpload] = useState(false);
  const [formData, setFormData] = useState({ petId: '', type: 'foto', notes: '', file: null, fileName: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const docTypes = { 
    foto: { label: 'Foto', color: 'bg-pink-100 text-pink-700', icon: Eye }, 
    video: { label: 'Video', color: 'bg-indigo-100 text-indigo-700', icon: PlayCircle }, 
    esame: { label: 'Esame/Referto', color: 'bg-cyan-100 text-cyan-700', icon: FileText },
    altro: { label: 'Altro', color: 'bg-gray-100 text-gray-700', icon: FileText }
  };
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => { 
        setFormData({ ...formData, file: reader.result, fileName: file.name }); 
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) { alert('Seleziona un file'); return; }
    setUploading(true);
    try {
      const pet = pets.find(p => p.id === formData.petId);
      await api.post('documents', { 
        name: formData.fileName, 
        type: formData.type, 
        content: formData.file, 
        fileName: formData.fileName, 
        petName: pet?.name || 'Animale',
        notes: formData.notes,
        fromClient: true
      });
      setShowUpload(false);
      setFormData({ petId: '', type: 'foto', notes: '', file: null, fileName: '' });
      onRefresh?.();
    } catch (error) { alert(error.message); } finally { setUploading(false); }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">I miei documenti</h2>
          <p className="text-gray-500 text-sm">Referti, prescrizioni e file condivisi</p>
        </div>
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Upload className="h-4 w-4 mr-2" />Carica per la clinica
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Carica documento per la clinica</DialogTitle>
              <DialogDescription>Condividi foto, video o esami con il veterinario</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label>Per quale animale?</Label>
                <Select value={formData.petId} onValueChange={(v) => setFormData({...formData, petId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona animale" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map(pet => (
                      <SelectItem key={pet.id} value={pet.id}>
                        <div className="flex items-center gap-2">
                          {pet.species === 'dog' ? <Dog className="h-4 w-4" /> : pet.species === 'cat' ? <Cat className="h-4 w-4" /> : <PawPrint className="h-4 w-4" />}
                          {pet.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Tipo di documento</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {Object.entries(docTypes).map(([key, { label, color, icon: Icon }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({...formData, type: key})}
                      className={`p-3 rounded-lg border text-center transition ${formData.type === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                      <Icon className={`h-5 w-5 mx-auto mb-1 ${formData.type === key ? 'text-blue-600' : 'text-gray-500'}`} />
                      <p className="text-xs font-medium">{label}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>File</Label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  accept={formData.type === 'foto' ? 'image/*' : formData.type === 'video' ? 'video/*' : '.pdf,.jpg,.jpeg,.png'}
                />
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
                >
                  {formData.fileName ? (
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">{formData.fileName}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Clicca per selezionare un file</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formData.type === 'foto' ? 'JPG, PNG' : formData.type === 'video' ? 'MP4, MOV' : 'PDF, JPG, PNG'}
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <Label>Note per il veterinario</Label>
                <Textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                  placeholder="Descrivi cosa vuoi mostrare al veterinario..."
                  rows={3}
                />
              </div>
              
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={uploading || !formData.petId || !formData.file}>
                {uploading ? 'Caricamento...' : 'Invia alla clinica'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="dalla-clinica">
        <TabsList>
          <TabsTrigger value="dalla-clinica">Dalla clinica</TabsTrigger>
          <TabsTrigger value="caricati-da-me">Caricati da me</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dalla-clinica" className="mt-4">
          {documents.filter(d => !d.fromClient).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Nessun documento dalla clinica</p>
                <p className="text-sm mt-2">I referti e le prescrizioni appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {documents.filter(d => !d.fromClient).map((doc) => (
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
        </TabsContent>
        
        <TabsContent value="caricati-da-me" className="mt-4">
          {documents.filter(d => d.fromClient).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Nessun documento caricato</p>
                <p className="text-sm mt-2">I file che carichi per la clinica appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {documents.filter(d => d.fromClient).map((doc) => {
                const DocIcon = docTypes[doc.type]?.icon || FileText;
                return (
                <Card key={doc.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${docTypes[doc.type]?.color || docTypes.altro.color}`}>
                        <DocIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.petName} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                        {doc.notes && <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{doc.notes}</p>}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />Inviato
                    </Badge>
                  </CardContent>
                </Card>
              )})}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OwnerMessages({ messages }) {
  return <div><h2 className="text-2xl font-bold text-gray-800 mb-2">Messaggi</h2><p className="text-gray-500 text-sm mb-6">Comunicazioni con la clinica</p><Card><CardContent className="p-0">{messages.length === 0 ? <div className="p-12 text-center text-gray-500"><MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p className="font-medium">Nessun messaggio</p></div> : <ScrollArea className="h-[400px]">{messages.map((msg) => <div key={msg.id} className="p-4 border-b"><p className="font-medium">{msg.subject}</p><p className="text-sm text-gray-500 mt-1">{msg.content}</p><p className="text-xs text-gray-400 mt-2">{new Date(msg.createdAt).toLocaleDateString()}</p></div>)}</ScrollArea>}</CardContent></Card></div>;
}

function OwnerPets({ pets, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', species: 'dog', breed: '' });
  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('pets', formData); setShowDialog(false); onRefresh(); } catch (error) { alert(error.message); } };
  return <div><div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold text-gray-800">I miei animali</h2><p className="text-gray-500 text-sm">Gestisci i profili dei tuoi amici</p></div><Dialog open={showDialog} onOpenChange={setShowDialog}><DialogTrigger asChild><Button className="bg-blue-500 hover:bg-blue-600"><Plus className="h-4 w-4 mr-2" />Aggiungi</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nuovo animale</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div><div><Label>Specie</Label><Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dog">Cane</SelectItem><SelectItem value="cat">Gatto</SelectItem><SelectItem value="other">Altro</SelectItem></SelectContent></Select></div><div><Label>Razza</Label><Input value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} /></div><Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">Aggiungi</Button></form></DialogContent></Dialog></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{pets.length === 0 ? <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p className="font-medium">Nessun animale</p></CardContent></Card> : pets.map((pet) => <Card key={pet.id}><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center">{pet.species === 'dog' ? <Dog className="h-7 w-7 text-blue-600" /> : pet.species === 'cat' ? <Cat className="h-7 w-7 text-blue-600" /> : <PawPrint className="h-7 w-7 text-blue-600" />}</div><div><p className="font-medium text-lg">{pet.name}</p><p className="text-sm text-gray-500">{pet.breed || pet.species}</p></div></div></CardContent></Card>)}</div></div>;
}

// ==================== MAIN APP ====================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (token) { try { const userData = await api.get('auth/me'); setUser(userData); } catch (error) { localStorage.removeItem('vetbuddy_token'); api.token = null; } }
    setLoading(false);
  };

  const handleLogin = (userData) => { setUser(userData); if (!localStorage.getItem('vetbuddy_welcomed_' + userData.id)) { setShowWelcome(true); } };
  const handleWelcomeContinue = () => { localStorage.setItem('vetbuddy_welcomed_' + user.id, 'true'); setShowWelcome(false); };
  const handleLogout = () => { localStorage.removeItem('vetbuddy_token'); api.token = null; setUser(null); setShowWelcome(false); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-coral-50"><div className="text-center"><VetBuddyLogo size={60} /><p className="mt-4 text-coral-700">Caricamento...</p></div></div>;
  if (!user) return <LandingPage onLogin={handleLogin} />;
  if (showWelcome) return <WelcomeScreen user={user} onContinue={handleWelcomeContinue} />;
  if (user.role === 'clinic') return <ClinicDashboard user={user} onLogout={handleLogout} />;
  return <OwnerDashboard user={user} onLogout={handleLogout} />;
}
