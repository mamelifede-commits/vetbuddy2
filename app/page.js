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
  Euro, Wallet, Camera, Edit, Trash2, Info, StarHalf, Image as ImageIcon
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

// ==================== ACCESSO NON AUTORIZZATO ====================
function AccessDenied({ userRole, requiredRole, onGoBack }) {
  const roleLabels = {
    clinic: 'Clinica',
    owner: 'Proprietario',
    staff: 'Staff'
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-xl text-gray-900">Accesso non autorizzato</CardTitle>
          <CardDescription>
            Questa sezione è riservata agli account <strong>{roleLabels[requiredRole]}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              Il tuo account è registrato come: <Badge variant="outline" className="ml-1">{roleLabels[userRole]}</Badge>
            </p>
          </div>
          <Button onClick={onGoBack} className="w-full bg-coral-500 hover:bg-coral-600">
            {userRole === 'owner' ? (
              <><PawPrint className="h-4 w-4 mr-2" />Vai all'area Proprietario</>
            ) : (
              <><Building2 className="h-4 w-4 mr-2" />Vai all'area Clinica</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== ROLE BADGE COMPONENT ====================
function RoleBadge({ role }) {
  const config = {
    clinic: { label: 'Account: Clinica', icon: Building2, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    owner: { label: 'Account: Proprietario', icon: PawPrint, color: 'bg-green-100 text-green-700 border-green-200' },
    staff: { label: 'Account: Staff', icon: Users, color: 'bg-purple-100 text-purple-700 border-purple-200' }
  };
  const { label, icon: Icon, color } = config[role] || config.owner;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}

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
      {/* Pilot Banner - Milano */}
      <div className="bg-gradient-to-r from-coral-500 to-orange-500 text-white text-center py-3 px-4 text-sm">
        <span className="font-semibold">🧪 Beta Test</span> — Stiamo testando l'app con cliniche selezionate. <button onClick={() => scrollToSection('pilot')} className="underline font-semibold ml-1">Provalo gratis →</button>
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2"><VetBuddyLogo size={32} /><span className="font-bold text-xl text-gray-900">VetBuddy</span></div>
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('funzionalita')} className="text-gray-600 hover:text-coral-500 transition">Funzionalità</button>
              <button onClick={() => scrollToSection('come-funziona')} className="text-gray-600 hover:text-coral-500 transition">Come funziona</button>
              <button onClick={() => scrollToSection('pilot')} className="text-gray-600 hover:text-coral-500 transition">Pilot Milano</button>
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
              <button onClick={() => scrollToSection('funzionalita')} className="text-gray-600 text-left">Funzionalità</button>
              <button onClick={() => scrollToSection('pilot')} className="text-gray-600 text-left">Pilot Milano</button>
              <hr />
              <Button variant="ghost" className="justify-start" onClick={() => { setAuthMode('login'); setShowAuth(true); setMobileMenuOpen(false); }}>Accedi</Button>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); setMobileMenuOpen(false); }}>Registrati</Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero - Milano Focus */}
      <section className="pt-16 pb-20 px-4 bg-gradient-to-b from-white to-coral-50/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <Zap className="h-4 w-4" />
            <span className="font-medium">Beta Test attivo</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            La piattaforma veterinaria<br /><span className="text-coral-500">che i tuoi clienti ameranno</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Prenotazioni online, cartelle cliniche digitali, pagamenti e comunicazione automatizzata.
          </p>
          <p className="text-lg text-coral-600 font-semibold mb-10">
            Tutto in un'unica piattaforma. Zero carta, zero caos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-coral-500 hover:bg-coral-600 text-white px-8 h-14 text-lg" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <Building2 className="h-5 w-5 mr-2" /> Candidati al Pilot
            </Button>
            <Button size="lg" variant="outline" className="px-8 h-14 text-lg" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <PawPrint className="h-5 w-5 mr-2" /> Trova una clinica
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Zap, title: 'Beta', desc: 'Fase di test attiva' },
              { icon: Building2, title: 'Gratis', desc: 'Per le cliniche in beta' },
              { icon: Heart, title: 'Gratis', desc: 'Per sempre per i pet owner' },
              { icon: MessageCircle, title: 'Feedback', desc: 'Costruisci con noi il prodotto' }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border text-center">
                <item.icon className="h-5 w-5 text-coral-500 mx-auto mb-2" />
                <div className="font-bold text-coral-500 text-lg">{item.title}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funzionalità Chiave */}
      <section id="funzionalita" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-coral-500 font-semibold mb-2">FUNZIONALITÀ PRINCIPALI</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tutto quello che serve alla tua clinica</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Una piattaforma completa per gestire la clinica, comunicare con i clienti e far crescere il business.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 - Geolocalizzazione */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Trova clinica vicina</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">I clienti trovano la tua clinica su mappa con distanza in tempo reale e indicazioni stradali.</p>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Geolocalizzazione GPS</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Calcolo distanza automatico</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Integrazione Google Maps</li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 - Prenotazioni */}
            <Card className="border-2 border-coral-200 bg-gradient-to-br from-coral-50 to-white hover:shadow-lg transition">
              <CardHeader>
                <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-coral-600" />
                </div>
                <CardTitle className="text-lg">Prenotazioni online 24/7</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">I clienti prenotano quando vogliono, tu ricevi tutto organizzato in agenda.</p>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Visite, vaccini, video-consulti</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Promemoria automatici</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Sync Google Calendar</li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 - Documenti */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition relative">
              <div className="absolute -top-2 right-4 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">Più richiesto</div>
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Documenti digitali</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">Carica referti, prescrizioni e fatture. Il cliente li riceve via email e li ritrova in app.</p>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Upload PDF con 1 click</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Email automatica</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Archivio per animale</li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 4 - Cartella clinica */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition">
              <CardHeader>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <PawPrint className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Cartella clinica digitale</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">Ogni animale ha il suo profilo completo con storico visite, vaccini, allergie e terapie.</p>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Profilo animale completo</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Storico visite e vaccini</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Tracciamento spese</li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 5 - Pagamenti */}
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-lg transition">
              <CardHeader>
                <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">Pagamenti integrati</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">Ricevi pagamenti online con Stripe. Il cliente paga, tu incassi direttamente.</p>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Stripe integrato</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Pagamento visite online</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Report finanziari</li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 6 - Team Inbox */}
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-lg transition">
              <CardHeader>
                <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                  <Inbox className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="text-lg">Team Inbox</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">Un'unica inbox per tutto il team. Niente più messaggi persi o risposte duplicate.</p>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Assegnazione ticket</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Anti-doppioni</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Template risposte</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Potenzialità / Vision */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-coral-400 font-semibold mb-2">LA NOSTRA VISIONE</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Il futuro della veterinaria è digitale</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">VetBuddy non è solo un gestionale. È una piattaforma che connette cliniche e proprietari, semplifica la comunicazione e migliora la cura degli animali.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="h-16 w-16 bg-coral-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-coral-400" />
              </div>
              <h3 className="font-bold text-xl mb-2">+30% Efficienza</h3>
              <p className="text-gray-400 text-sm">Meno tempo al telefono, più tempo con i pazienti. Automatizza le attività ripetitive.</p>
            </div>
            <div className="text-center p-6">
              <div className="h-16 w-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-bold text-xl mb-2">Clienti più fedeli</h3>
              <p className="text-gray-400 text-sm">Comunicazione moderna, documenti sempre disponibili, prenotazioni facili = clienti soddisfatti.</p>
            </div>
            <div className="text-center p-6">
              <div className="h-16 w-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-bold text-xl mb-2">Dati per crescere</h3>
              <p className="text-gray-400 text-sm">Dashboard con KPI, report finanziari e analytics per prendere decisioni informate.</p>
            </div>
          </div>

          <div className="mt-12 p-8 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">🚀 Roadmap 2025</h3>
                <p className="text-gray-400 text-sm">Stiamo lavorando su: AI per triage automatico, integrazione con laboratori di analisi, telemedicina avanzata, e app mobile nativa.</p>
              </div>
              <Button className="bg-coral-500 hover:bg-coral-600 whitespace-nowrap" onClick={() => scrollToSection('pilot')}>
                Entra nel Pilot
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Come Funziona */}
      <section id="come-funziona" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-coral-500 font-semibold mb-2">COME FUNZIONA</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Due app, un ecosistema</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center"><PawPrint className="h-6 w-6 text-blue-600" /></div>
                <div><h3 className="font-bold text-lg">Per i Proprietari</h3><p className="text-sm text-gray-600">100% Gratis, per sempre</p></div>
              </div>
              <ul className="space-y-4">
                {[
                  'Trova cliniche vicine con distanza in km',
                  'Prenota visite e video-consulti in 2 tap',
                  'Ricevi referti e prescrizioni via email',
                  'Cartella clinica digitale per ogni animale',
                  'Storico spese veterinarie annuali'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" /><span className="text-gray-700">{item}</span></li>
                ))}
              </ul>
            </div>
            <div className="bg-coral-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center"><Building2 className="h-6 w-6 text-coral-600" /></div>
                <div><h3 className="font-bold text-lg">Per le Cliniche</h3><p className="text-sm text-gray-600">Pilot Milano 2025</p></div>
              </div>
              <ul className="space-y-4">
                {[
                  'Dashboard "cosa fare oggi" in 10 secondi',
                  'Team Inbox con assegnazione ticket',
                  'Documenti → email automatica al cliente',
                  'Posizione su mappa con indicazioni stradali',
                  'Report finanziari e analytics'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-coral-600 mt-0.5" /><span className="text-gray-700">{item}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Test Section */}
      <section id="pilot" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-4">
              <Zap className="h-4 w-4" />
              <span className="font-semibold">Beta Test 2025</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Prova VetBuddy gratis</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Stiamo testando l'app con cliniche veterinarie selezionate. <strong>Provalo gratis e aiutaci a migliorare con il tuo feedback.</strong></p>
          </div>

          {/* Beta Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 border-2 border-coral-200 text-center">
              <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-coral-500" />
              </div>
              <h3 className="font-bold mb-2">Accesso gratuito</h3>
              <p className="text-gray-600 text-sm">Tutte le funzionalità Pro gratis durante la fase beta</p>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-coral-200 text-center">
              <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-coral-500" />
              </div>
              <h3 className="font-bold mb-2">Supporto diretto</h3>
              <p className="text-gray-600 text-sm">Canale dedicato per assistenza e suggerimenti</p>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-coral-200 text-center">
              <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-coral-500" />
              </div>
              <h3 className="font-bold mb-2">Costruisci con noi</h3>
              <p className="text-gray-600 text-sm">Il tuo feedback diventa nuove funzionalità</p>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Per provare</CardDescription>
                <div className="text-3xl font-bold text-gray-400 mt-4">Gratis</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 1 sede, 1 utente</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 30 richieste/mese</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Posizione su mappa</li>
                </ul>
                <Button variant="outline" className="w-full" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Inizia gratis</Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-coral-500 relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral-500 text-white text-xs px-3 py-1 rounded-full">Beta Test</div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Tutto incluso</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-coral-500">€0</span>
                  <span className="text-lg text-gray-400 line-through ml-2">€129/mese</span>
                </div>
                <p className="text-xs text-coral-600 font-medium">Gratis durante la fase beta</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Fino a 10 staff</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Documenti + email auto</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Google Calendar sync</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Pagamenti Stripe</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Report e analytics</li>
                </ul>
                <Button className="w-full bg-coral-500 hover:bg-coral-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
                  Prova gratis
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Gruppi e catene</CardDescription>
                <div className="text-3xl font-bold text-coral-500 mt-4">Custom</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Multi-sede illimitate</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> API dedicata</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> SLA garantito</li>
                </ul>
                <Button variant="outline" className="w-full" onClick={() => scrollToSection('contatti')}>Contattaci</Button>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-sm text-gray-500">Piano Pro gratuito durante la fase beta. Prezzi futuri IVA esclusa.</p>
        </div>
      </section>

      {/* Contact Form for Enterprise */}
      <section id="contatti" className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contattaci</h2>
            <p className="text-gray-600">Hai una catena di cliniche o domande specifiche? Scrivici!</p>
          </div>
          <Card>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Grazie! Ti ricontatteremo presto a info@vetbuddy.it'); }}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-name">Nome e Cognome</Label>
                    <Input id="contact-name" placeholder="Mario Rossi" required />
                  </div>
                  <div>
                    <Label htmlFor="contact-clinic">Nome Clinica</Label>
                    <Input id="contact-clinic" placeholder="Clinica Veterinaria Roma" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" placeholder="mario@clinica.it" required />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Telefono (opzionale)</Label>
                  <Input id="contact-phone" type="tel" placeholder="+39 02 1234567" />
                </div>
                <div>
                  <Label htmlFor="contact-message">Messaggio</Label>
                  <Textarea id="contact-message" placeholder="Descrivi le tue esigenze o domande..." rows={4} required />
                </div>
                <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">
                  <Send className="h-4 w-4 mr-2" />Invia messaggio
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-gray-900 mb-4">Domande frequenti</h2></div>
          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: 'Cos\'è il Pilot?', a: 'VetBuddy è in fase Pilot: stiamo testando con un numero limitato di cliniche. Le cliniche visibili nell\'app demo non sono ancora affiliate.' },
              { q: 'Quanto costa per i proprietari?', a: 'VetBuddy è e sarà sempre gratuito per i proprietari di animali. Nessun costo nascosto.' },
              { q: 'Come funziona la geolocalizzazione?', a: 'I clienti possono cercare cliniche vicine sulla mappa, vedere la distanza in km e ottenere indicazioni stradali con un tap.' },
              { q: 'Cosa include il piano Pro nel Pilot?', a: 'Per i 6 mesi del Pilot Milano: team inbox, documenti automatici, Google Calendar sync, pagamenti Stripe, report finanziari e supporto dedicato.' },
              { q: 'Come funziona l\'invio documenti?', a: 'La clinica carica un PDF (referto, prescrizione, fattura), seleziona il cliente e l\'animale, e il documento viene inviato via email come allegato. Il cliente lo ritrova anche nell\'app.' },
              { q: 'Posso provare prima di candidarmi?', a: 'Sì! Puoi registrarti come proprietario e esplorare l\'app. Per le cliniche, il piano Starter è sempre gratuito. Il piano Pro è gratuito per chi entra nel Pilot Milano.' },
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
      <section className="py-20 px-4 bg-gradient-to-r from-coral-500 to-orange-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <Zap className="h-4 w-4" />
            <span className="font-medium">Beta Test Attivo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">La tua clinica merita di più</h2>
          <p className="text-coral-100 mb-8 text-lg">Meno burocrazia, più tempo per curare. Prova VetBuddy gratis e dacci il tuo feedback.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-coral-500 hover:bg-coral-50 h-14 px-8 text-lg" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <Building2 className="h-5 w-5 mr-2" />Prova gratis
            </Button>
            <Button size="lg" className="bg-white text-coral-500 hover:bg-coral-50 h-14 px-8 text-lg" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <PawPrint className="h-5 w-5 mr-2" />Sono un proprietario
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-2"><VetBuddyLogo size={32} /><span className="font-bold text-xl">VetBuddy</span></div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>🧪 Beta Test attivo</span>
              <span>•</span>
              <span>🇮🇹 Made in Italy</span>
              <span>•</span>
              <a href="https://www.vetbuddy.it" className="hover:text-white">www.vetbuddy.it</a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© 2025 VetBuddy. Tutti i diritti riservati.</p>
            <div className="flex gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Termini di Servizio</a>
              <a href="#" className="hover:text-white">GDPR</a>
              <a href="mailto:info@vetbuddy.it" className="hover:text-white">info@vetbuddy.it</a>
            </div>
          </div>
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
  const [formData, setFormData] = useState({ 
    email: '', password: '', name: '', role: 'owner', clinicName: '', phone: '', city: '', vatNumber: '', website: '',
    staffCount: '' // Per cliniche
  });
  const [pilotRequestSent, setPilotRequestSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? 'auth/login' : 'auth/register';
      const data = await api.post(endpoint, formData);
      api.setToken(data.token);
      
      // Per cliniche, mostra messaggio di conferma Pilot
      if (mode === 'register' && formData.role === 'clinic') {
        setPilotRequestSent(true);
      } else {
        onLogin(data.user);
      }
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

  // Schermata conferma Pilot per cliniche
  if (pilotRequestSent) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Richiesta inviata!</h3>
        <p className="text-gray-600 mb-4">
          Grazie per il tuo interesse in VetBuddy. Ti contatteremo presto per l'attivazione e l'onboarding personalizzato.
        </p>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
          <p className="text-sm text-amber-700">
            <strong>Nota:</strong> VetBuddy è attualmente disponibile solo tramite Pilot su invito. 
            Stiamo selezionando un numero limitato di cliniche per garantire un supporto dedicato.
          </p>
        </div>
        <Button onClick={() => { setPilotRequestSent(false); setMode('login'); }} className="w-full bg-coral-500 hover:bg-coral-600">
          Vai al login
        </Button>
      </div>
    );
  }

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
              
              {/* Messaggio Pilot per cliniche */}
              {formData.role === 'clinic' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    <strong>Accesso Pilot:</strong> VetBuddy è disponibile solo su invito. Compila il form e ti contatteremo per l'attivazione.
                  </p>
                </div>
              )}
              
              {/* Messaggio per proprietari */}
              {formData.role === 'owner' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Nota:</strong> VetBuddy è in fase Pilot. Alcune cliniche potrebbero non essere ancora affiliate. Puoi comunque creare il profilo dei tuoi animali.
                  </p>
                </div>
              )}
              
              <div><Label>{formData.role === 'clinic' ? 'Nome responsabile' : 'Nome completo'}</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder={formData.role === 'clinic' ? 'Dr. Mario Rossi' : 'Mario Rossi'} /></div>
              
              {formData.role === 'clinic' && (
                <>
                  <div><Label>Nome Clinica *</Label><Input value={formData.clinicName} onChange={(e) => setFormData({...formData, clinicName: e.target.value})} required placeholder="Clinica Veterinaria Roma" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Città *</Label><Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required placeholder="Milano" /></div>
                    <div><Label>N° Staff</Label>
                      <Select value={formData.staffCount} onValueChange={(v) => setFormData({...formData, staffCount: v})}>
                        <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Solo io</SelectItem>
                          <SelectItem value="2-5">2-5 persone</SelectItem>
                          <SelectItem value="6-10">6-10 persone</SelectItem>
                          <SelectItem value="10+">Più di 10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Partita IVA</Label><Input value={formData.vatNumber} onChange={(e) => setFormData({...formData, vatNumber: e.target.value})} placeholder="IT01234567890" /></div>
                  <div><Label>Sito web</Label><Input value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="https://..." /></div>
                </>
              )}
              <div><Label>Telefono</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+39 02 1234567" /></div>
            </>
          )}
          <div><Label>Email *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="email@esempio.it" /></div>
          <div><Label>Password *</Label><Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required placeholder="Minimo 8 caratteri" /></div>
          {mode === 'login' && (
            <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-coral-500 hover:underline">
              Password dimenticata?
            </button>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={loading}>
            {loading ? 'Caricamento...' : (mode === 'login' ? 'Accedi' : (formData.role === 'clinic' ? 'Candidati al Pilot' : 'Registrati gratis'))}
          </Button>
          {mode === 'register' && (
            <p className="text-xs text-gray-500 text-center">
              {formData.role === 'clinic' 
                ? 'Ti contatteremo per attivazione e onboarding.' 
                : 'Gratis per sempre per i proprietari di animali.'}
            </p>
          )}
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
        <div className="mb-2"><RoleBadge role="clinic" /></div>
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
          <NavItem icon={TrendingUp} label="Report" value="reports" />
          <NavItem icon={ClipboardList} label="Template" value="templates" />
          <NavItem icon={Settings} label="Impostazioni" value="settings" />
        </nav>
        
        <Button variant="ghost" onClick={onLogout} className="mt-auto text-gray-600"><LogOut className="h-4 w-4 mr-2" />Esci</Button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'dashboard' && <ClinicControlRoom appointments={appointments} documents={documents} messages={messages} owners={owners} setupProgress={setupProgress} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'agenda' && <ClinicAgenda appointments={appointments} staff={staff} owners={owners} pets={pets} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'inbox' && <ClinicInbox messages={messages} owners={owners} pets={pets} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'documents' && <ClinicDocuments documents={documents} owners={owners} pets={pets} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'services' && <ClinicServices onNavigate={setActiveTab} />}
        {activeTab === 'patients' && <ClinicPatients pets={pets} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'owners' && <ClinicOwners owners={owners} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'staff' && <ClinicStaff staff={staff} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'reports' && <ClinicReports appointments={appointments} documents={documents} messages={messages} owners={owners} onNavigate={setActiveTab} />}
        {activeTab === 'templates' && <ClinicTemplates owners={owners} pets={pets} staff={staff} appointments={appointments} user={user} onNavigate={setActiveTab} />}
        {activeTab === 'settings' && <ClinicSettings user={user} onNavigate={setActiveTab} />}
      </main>
    </div>
  );
}

// ==================== CONTROL ROOM DASHBOARD ====================
function ClinicControlRoom({ appointments, documents, messages, owners, setupProgress, onRefresh, onNavigate }) {
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

  // Monthly stats for mini report widget
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyAppts = appointments.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const newClientsThisMonth = owners?.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length || 0;
  const monthlyRevenue = monthlyAppts.reduce((sum, a) => sum + (a.price || 0), 0);

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
              <SetupStep icon={CreditCard} label="Pagamenti" desc="Collega Stripe" done={setupProgress.payments} onClick={() => onNavigate('settings')} />
              <SetupStep icon={Video} label="Video visita" desc="Configura orari" done={setupProgress.video} onClick={() => onNavigate('services')} />
              <SetupStep icon={Users} label="Team" desc="Aggiungi staff" done={setupProgress.team} onClick={() => onNavigate('staff')} />
              <SetupStep icon={Bell} label="Automazioni" desc="Promemoria auto" done={setupProgress.automations} onClick={() => onNavigate('templates')} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Calendar} label="Appuntamenti oggi" value={todayAppts.length} color="coral" onClick={() => onNavigate('agenda')} />
        <KPICard icon={Video} label="Video visite oggi" value={videoAppts.length} color="blue" highlight={videoAppts[0]?.time} onClick={() => onNavigate('agenda')} />
        <KPICard icon={MessageCircle} label="Messaggi in attesa" value={unreadMessages} color="amber" onClick={() => onNavigate('inbox')} />
        <KPICard icon={FileText} label="Nuovi da clienti" value={newFromClients} color="green" onClick={() => onNavigate('documents')} />
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
              onClick={() => onNavigate('documents')}
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
              onClick={() => onNavigate('agenda')}
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
              onClick={() => onNavigate('documents')}
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
          <Card className="cursor-pointer hover:shadow-md transition" onClick={() => onNavigate('inbox')}>
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
          <Card className="cursor-pointer hover:shadow-md transition" onClick={() => onNavigate('documents')}>
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

          {/* Monthly Summary Widget */}
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                <TrendingUp className="h-4 w-4" />Questo mese
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nuovi clienti</span>
                  <span className="font-semibold text-green-700">{newClientsThisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Appuntamenti</span>
                  <span className="font-semibold text-green-700">{monthlyAppts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Incassi tracciati</span>
                  <span className="font-semibold text-green-700">€{monthlyRevenue}</span>
                </div>
              </div>
              <Button variant="ghost" className="w-full mt-3 text-green-600" size="sm">
                Apri Report <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Back to Dashboard Button Component
function BackToDashboard({ onNavigate }) {
  return (
    <button 
      onClick={() => onNavigate('dashboard')}
      className="flex items-center gap-2 text-gray-500 hover:text-coral-600 transition mb-4 group"
    >
      <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm font-medium">Torna alla Dashboard</span>
    </button>
  );
}

// Setup Step Component
function SetupStep({ icon: Icon, label, desc, done, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg border transition w-full ${done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-coral-300 hover:bg-coral-50 cursor-pointer'}`}
    >
      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${done ? 'bg-green-100' : 'bg-coral-100'}`}>
        {done ? <Check className="h-4 w-4 text-green-600" /> : <Icon className="h-4 w-4 text-coral-500" />}
      </div>
      <div className="text-left flex-1">
        <p className={`text-sm font-medium ${done ? 'text-green-700' : ''}`}>{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      {!done && <ChevronRight className="h-4 w-4 text-gray-400" />}
    </button>
  );
}

// KPI Card Component
function KPICard({ icon: Icon, label, value, color, highlight, onClick }) {
  const colors = {
    coral: 'bg-coral-100 text-coral-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
  };
  return (
    <Card className={onClick ? 'cursor-pointer hover:shadow-md transition' : ''} onClick={onClick}>
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
function WorkflowCard({ step, title, icon: Icon, color, items, nextVideo, onClick }) {
  const colors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', badge: 'bg-blue-500' },
    coral: { bg: 'bg-coral-50', border: 'border-coral-200', icon: 'bg-coral-100 text-coral-600', badge: 'bg-coral-500' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-100 text-green-600', badge: 'bg-green-500' },
  };
  const c = colors[color];

  return (
    <Card className={`${c.bg} ${c.border} ${onClick ? 'cursor-pointer hover:shadow-md transition' : ''}`} onClick={onClick}>
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
function ClinicAgenda({ appointments, staff, owners, pets, onRefresh, onNavigate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shareDialog, setShareDialog] = useState(null);
  const [formData, setFormData] = useState({ 
    petName: '', ownerName: '', ownerEmail: '', date: '', time: '', 
    reason: '', type: 'visita', staffId: '', duration: 30, notes: '' 
  });

  // Appointment types with colors
  const appointmentTypes = [
    { value: 'visita', label: 'Visita generale', icon: Stethoscope, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'vaccino', label: 'Vaccino', icon: Syringe, color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'chirurgia', label: 'Chirurgia / Operazione', icon: Heart, color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'emergenza', label: 'Emergenza', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { value: 'controllo', label: 'Controllo / Follow-up', icon: CheckCircle, color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'sterilizzazione', label: 'Sterilizzazione', icon: Shield, color: 'bg-pink-100 text-pink-700 border-pink-200' },
    { value: 'dentale', label: 'Pulizia dentale', icon: Star, color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    { value: 'esami', label: 'Esami / Analisi', icon: FileText, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { value: 'videoconsulto', label: 'Video-consulto', icon: Video, color: 'bg-teal-100 text-teal-700 border-teal-200' },
    { value: 'altro', label: 'Altro', icon: Calendar, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  ];

  const getTypeConfig = (type) => appointmentTypes.find(t => t.value === type) || appointmentTypes[appointmentTypes.length - 1];

  // Reset form
  const resetForm = () => {
    setFormData({ petName: '', ownerName: '', ownerEmail: '', date: '', time: '', reason: '', type: 'visita', staffId: '', duration: 30, notes: '' });
    setEditingAppt(null);
  };

  // Open edit dialog
  const openEditDialog = (appt) => {
    setEditingAppt(appt);
    setFormData({
      petName: appt.petName || '',
      ownerName: appt.ownerName || '',
      ownerEmail: appt.ownerEmail || '',
      date: appt.date || '',
      time: appt.time || '',
      reason: appt.reason || '',
      type: appt.type || 'visita',
      staffId: appt.staffId || '',
      duration: appt.duration || 30,
      notes: appt.notes || ''
    });
    setShowDialog(true);
  };

  // Create or update appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { 
      if (editingAppt) {
        await api.put(`appointments/${editingAppt.id}`, formData);
      } else {
        await api.post('appointments', formData); 
      }
      setShowDialog(false); 
      resetForm();
      onRefresh(); 
    } catch (error) { alert(error.message); }
  };

  // Delete appointment
  const handleDelete = async (apptId) => {
    if (!confirm('Sei sicuro di voler eliminare questo appuntamento?')) return;
    try {
      await api.delete(`appointments/${apptId}`);
      onRefresh();
    } catch (error) { alert(error.message); }
  };

  // Share appointment
  const handleShare = async (appt) => {
    const shareUrl = `${window.location.origin}?appointment=${appt.id}`;
    const shareText = `📅 Appuntamento VetBuddy\n\n🐾 ${appt.petName}\n📆 ${appt.date} ore ${appt.time}\n🏥 ${appt.type}\n\nDettagli: ${shareUrl}`;
    
    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Appuntamento VetBuddy', text: shareText, url: shareUrl });
        return;
      } catch (e) { /* fallback to dialog */ }
    }
    setShareDialog({ appt, url: shareUrl, text: shareText });
  };

  // Send appointment via email
  const handleSendEmail = async (appt) => {
    if (!appt.ownerEmail) {
      alert('Email proprietario non specificata');
      return;
    }
    try {
      await api.post('appointments/send-email', { appointmentId: appt.id, recipientEmail: appt.ownerEmail });
      alert('✅ Email inviata con successo!');
    } catch (error) { alert(error.message); }
  };

  // Calendar helpers
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const upcomingAppts = appointments.filter(a => a.date > today).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  // Get week days
  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8:00 - 19:00

  const getApptsByDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(a => a.date === dateStr);
  };

  const navigateWeek = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (delta * 7));
    setCurrentDate(newDate);
  };

  const getStaffName = (staffId) => {
    const s = staff?.find(s => s.id === staffId);
    return s ? s.name : null;
  };

  const getStaffColor = (staffId) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
    const index = staff?.findIndex(s => s.id === staffId) || 0;
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
          <p className="text-gray-500 text-sm">Gestisci gli appuntamenti della clinica</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-sm rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-coral-600' : 'text-gray-600'}`}>
              <ListTodo className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 text-sm rounded-md transition ${viewMode === 'week' ? 'bg-white shadow text-coral-600' : 'text-gray-600'}`}>
              <CalendarDays className="h-4 w-4" />
            </button>
          </div>
          
          {/* New Appointment Button */}
          <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-coral-500 hover:bg-coral-600">
                <Plus className="h-4 w-4 mr-2" />Nuovo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAppt ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}</DialogTitle>
                <DialogDescription>Compila i dettagli dell'appuntamento</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Appointment Type */}
                <div>
                  <Label className="mb-2 block">Tipo di appuntamento</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {appointmentTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({...formData, type: type.value})}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition ${formData.type === type.value ? 'border-coral-500 bg-coral-50' : 'border-gray-200 hover:border-coral-300'}`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Patient & Owner */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Animale *</Label>
                    <Input value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} placeholder="Nome animale" required />
                  </div>
                  <div>
                    <Label>Proprietario *</Label>
                    <Input value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} placeholder="Nome proprietario" required />
                  </div>
                </div>
                
                <div>
                  <Label>Email proprietario</Label>
                  <Input type="email" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} placeholder="email@esempio.it" />
                </div>
                
                {/* Date & Time */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Data *</Label>
                    <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Ora *</Label>
                    <Input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Durata</Label>
                    <Select value={formData.duration.toString()} onValueChange={(v) => setFormData({...formData, duration: parseInt(v)})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">1 ora</SelectItem>
                        <SelectItem value="90">1h 30min</SelectItem>
                        <SelectItem value="120">2 ore</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Staff Assignment */}
                <div>
                  <Label>Assegnato a (veterinario/staff)</Label>
                  <Select value={formData.staffId || 'none'} onValueChange={(v) => setFormData({...formData, staffId: v === 'none' ? '' : v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona chi prende l'appuntamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Non assegnato</SelectItem>
                      {staff?.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${getStaffColor(s.id)}`} />
                            {s.name} ({s.role === 'vet' ? 'Veterinario' : s.role})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {staff?.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">💡 Aggiungi membri dello staff in "Staff" per assegnarli agli appuntamenti</p>
                  )}
                </div>
                
                {/* Reason & Notes */}
                <div>
                  <Label>Motivo/Descrizione</Label>
                  <Input value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} placeholder="Es: Controllo post-operatorio" />
                </div>
                
                <div>
                  <Label>Note interne</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} placeholder="Note visibili solo alla clinica..." />
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {editingAppt && (
                    <Button type="button" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { handleDelete(editingAppt.id); setShowDialog(false); }}>
                      <Trash2 className="h-4 w-4 mr-1" />Elimina
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 bg-coral-500 hover:bg-coral-600">
                    {editingAppt ? 'Salva modifiche' : 'Crea appuntamento'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Week Navigation (only for week view) */}
      {viewMode === 'week' && (
        <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />Settimana precedente
          </Button>
          <div className="text-center">
            <p className="font-semibold">
              {weekDays[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <Button variant="link" size="sm" className="text-coral-600" onClick={() => setCurrentDate(new Date())}>
              Oggi
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(1)}>
            Settimana successiva<ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Week Calendar View */}
      {viewMode === 'week' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-8 border-b bg-gray-50">
                  <div className="p-3 text-sm font-medium text-gray-500 border-r">Ora</div>
                  {weekDays.map((day, i) => {
                    const isToday = day.toISOString().split('T')[0] === today;
                    const dayAppts = getApptsByDate(day);
                    return (
                      <div key={i} className={`p-3 text-center border-r last:border-r-0 ${isToday ? 'bg-coral-50' : ''}`}>
                        <p className="text-xs text-gray-500">{dayNames[i]}</p>
                        <p className={`font-semibold ${isToday ? 'text-coral-600' : 'text-gray-900'}`}>
                          {day.getDate()}
                        </p>
                        {dayAppts.length > 0 && (
                          <Badge variant="secondary" className="text-xs mt-1">{dayAppts.length}</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Time slots */}
                {hours.map(hour => (
                  <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
                    <div className="p-2 text-sm text-gray-500 border-r bg-gray-50">
                      {hour}:00
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const dateStr = day.toISOString().split('T')[0];
                      const hourAppts = appointments.filter(a => {
                        if (a.date !== dateStr) return false;
                        const apptHour = parseInt(a.time?.split(':')[0]);
                        return apptHour === hour;
                      });
                      const isToday = dateStr === today;
                      
                      return (
                        <div key={dayIndex} className={`p-1 border-r last:border-r-0 min-h-[60px] ${isToday ? 'bg-coral-50/30' : ''}`}>
                          {hourAppts.map((appt, i) => {
                            const typeConfig = getTypeConfig(appt.type);
                            const staffName = getStaffName(appt.staffId);
                            return (
                              <div
                                key={i}
                                onClick={() => openEditDialog(appt)}
                                className={`p-1.5 rounded text-xs cursor-pointer mb-1 border ${typeConfig.color} hover:opacity-80 transition`}
                              >
                                <div className="flex items-center gap-1">
                                  {appt.staffId && <div className={`h-2 w-2 rounded-full ${getStaffColor(appt.staffId)}`} />}
                                  <span className="font-medium truncate">{appt.time}</span>
                                </div>
                                <p className="font-medium truncate">{appt.petName}</p>
                                {staffName && <p className="text-[10px] opacity-70 truncate">{staffName}</p>}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4 text-coral-600" />
                Oggi <Badge variant="outline">{todayAppts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppts.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">Nessun appuntamento oggi</p>
              ) : (
                <div className="space-y-2">
                  {todayAppts.map((appt, i) => {
                    const typeConfig = getTypeConfig(appt.type);
                    const TypeIcon = typeConfig.icon;
                    const staffName = getStaffName(appt.staffId);
                    return (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${typeConfig.color}`}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{appt.petName}</p>
                            <p className="text-xs opacity-70">{appt.ownerName} • {typeConfig.label}</p>
                            {staffName && (
                              <p className="text-xs mt-0.5 flex items-center gap-1">
                                <div className={`h-2 w-2 rounded-full ${getStaffColor(appt.staffId)}`} />
                                {staffName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/80 text-gray-700">{appt.time}</Badge>
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(appt)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleShare(appt)}>
                            <Send className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Prossimi</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppts.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">Nessun appuntamento programmato</p>
              ) : (
                <div className="space-y-2">
                  {upcomingAppts.slice(0, 10).map((appt, i) => {
                    const typeConfig = getTypeConfig(appt.type);
                    const TypeIcon = typeConfig.icon;
                    const staffName = getStaffName(appt.staffId);
                    return (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${typeConfig.color}`}>
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{appt.petName}</p>
                            <p className="text-xs text-gray-500">{appt.ownerName}</p>
                            {staffName && (
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <div className={`h-2 w-2 rounded-full ${getStaffColor(appt.staffId)}`} />
                                {staffName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-medium">{new Date(appt.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}</p>
                            <p className="text-xs text-gray-500">{appt.time}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditDialog(appt)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleShare(appt)}>
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={!!shareDialog} onOpenChange={() => setShareDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Condividi appuntamento</DialogTitle>
            <DialogDescription>Invia i dettagli dell'appuntamento al proprietario</DialogDescription>
          </DialogHeader>
          {shareDialog && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{shareDialog.appt.petName}</p>
                <p className="text-sm text-gray-600">{shareDialog.appt.date} ore {shareDialog.appt.time}</p>
                <p className="text-sm text-gray-600">{getTypeConfig(shareDialog.appt.type).label}</p>
              </div>
              
              <div className="grid gap-3">
                <Button onClick={() => { navigator.clipboard.writeText(shareDialog.text); alert('Copiato!'); }} variant="outline" className="justify-start">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Copia testo
                </Button>
                {shareDialog.appt.ownerEmail && (
                  <Button onClick={() => { handleSendEmail(shareDialog.appt); setShareDialog(null); }} className="bg-coral-500 hover:bg-coral-600 justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Invia via email a {shareDialog.appt.ownerEmail}
                  </Button>
                )}
                <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareDialog.text)}`, '_blank')} variant="outline" className="justify-start bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Invia via WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Clinic Inbox
function ClinicInbox({ messages, owners, pets, onRefresh, onNavigate }) {
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [filter, setFilter] = useState('all');
  const filteredMessages = messages.filter(m => { if (filter === 'unread') return !m.read; if (filter === 'assigned') return m.assignedTo; return true; });

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
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
  const [formData, setFormData] = useState({ type: 'prescrizione', ownerEmail: '', petName: '', title: '', file: null, fileName: '', fileType: '', notes: '', sendEmail: true, amount: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const docTypeOptions = [
    { value: 'prescrizione', label: 'Prescrizione medica', icon: FileText, color: 'text-purple-600' },
    { value: 'referto', label: 'Referto / Esami', icon: FileCheck, color: 'text-blue-600' },
    { value: 'fattura', label: 'Fattura', icon: Receipt, color: 'text-emerald-600' },
    { value: 'istruzioni', label: 'Istruzioni post-visita', icon: ClipboardList, color: 'text-green-600' },
    { value: 'foto', label: 'Foto / Immagine', icon: ImageIcon, color: 'text-pink-600' },
    { value: 'altro', label: 'Altro documento', icon: FileText, color: 'text-gray-600' },
  ];

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const allowedExtensions = '.pdf,.jpg,.jpeg,.png';

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && allowedTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = () => { 
        const ext = file.name.split('.').pop().toLowerCase();
        setFormData({ 
          ...formData, 
          file: reader.result, 
          fileName: file.name, 
          fileType: file.type,
          title: formData.title || file.name.replace(/\.(pdf|jpg|jpeg|png)$/i, '') 
        }); 
      };
      reader.readAsDataURL(file);
    } else { 
      alert('Per favore seleziona un file PDF, JPG o PNG'); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) { alert('Seleziona un file (PDF, JPG o PNG)'); return; }
    setUploading(true);
    try { 
      await api.post('documents', { 
        name: formData.title, 
        type: formData.type, 
        content: formData.file, 
        fileName: formData.fileName,
        fileType: formData.fileType,
        petName: formData.petName, 
        ownerEmail: formData.ownerEmail, 
        notes: formData.notes, 
        sendEmail: formData.sendEmail,
        amount: formData.type === 'fattura' ? parseFloat(formData.amount) || 0 : null,
        status: 'bozza'
      }); 
      onSuccess?.(); 
    } catch (error) { alert(error.message); } finally { setUploading(false); }
  };

  const isImage = formData.fileType?.startsWith('image/');

  return (
    <><DialogHeader><DialogTitle>Carica documento</DialogTitle><DialogDescription>Il documento verrà salvato e opzionalmente inviato via email.</DialogDescription></DialogHeader>
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <Label>Tipo documento</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {docTypeOptions.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData({...formData, type: opt.value})}
                className={`flex items-center gap-2 p-3 rounded-lg border text-left transition ${formData.type === opt.value ? 'border-coral-500 bg-coral-50' : 'border-gray-200 hover:border-coral-300'}`}
              >
                <Icon className={`h-4 w-4 ${opt.color}`} />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Proprietario</Label><Input placeholder="Nome o email" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} required /></div>
        <div><Label>Animale</Label><Input placeholder="Nome animale" value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} /></div>
      </div>
      
      <div><Label>Titolo documento</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder={formData.type === 'fattura' ? 'Es: Fattura visita 12/02' : 'Es: Prescrizione antibiotico'} /></div>
      
      {formData.type === 'fattura' && (
        <div><Label>Importo (€)</Label><Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" /></div>
      )}
      
      <div>
        <Label>File (PDF, JPG, PNG)</Label>
        <input type="file" accept={allowedExtensions} ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-coral-400 transition">
          {formData.fileName ? (
            <div className="space-y-2">
              {isImage && formData.file ? (
                <img src={formData.file} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
              ) : (
                <FileText className="h-8 w-8 mx-auto text-coral-600" />
              )}
              <div className="flex items-center justify-center gap-2 text-coral-600">
                <span className="font-medium">{formData.fileName}</span>
                <Badge variant="outline" className="text-xs">{isImage ? 'Immagine' : 'PDF'}</Badge>
              </div>
            </div>
          ) : (
            <><Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-500">Clicca per selezionare un file</p><p className="text-xs text-gray-400 mt-1">PDF, JPG o PNG</p></>
          )}
        </div>
      </div>
      
      <div><Label>Note interne (solo clinica)</Label><Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} /></div>
      
      <div className="flex items-center justify-between p-4 bg-coral-50 rounded-lg">
        <div>
          <p className="font-medium text-sm">Invia via email automaticamente</p>
          <p className="text-xs text-gray-500">Il proprietario riceverà il file come allegato</p>
        </div>
        <Switch checked={formData.sendEmail} onCheckedChange={(v) => setFormData({...formData, sendEmail: v})} />
      </div>
      
      <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={uploading}>
        {uploading ? 'Caricamento...' : (formData.sendEmail ? 'Carica e invia email' : 'Carica documento')}
      </Button>
    </form></>
  );
}

// Clinic Documents
function ClinicDocuments({ documents, owners, pets, onRefresh, onNavigate }) {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [selectedClientDoc, setSelectedClientDoc] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filters, setFilters] = useState({ type: 'all', status: 'all', search: '' });
  
  const docTypes = { 
    prescrizione: { label: 'Prescrizione', color: 'bg-purple-100 text-purple-700', icon: FileText }, 
    referto: { label: 'Referto', color: 'bg-blue-100 text-blue-700', icon: ClipboardList }, 
    fattura: { label: 'Fattura', color: 'bg-emerald-100 text-emerald-700', icon: Receipt },
    istruzioni: { label: 'Istruzioni', color: 'bg-green-100 text-green-700', icon: FileText }, 
    altro: { label: 'Altro', color: 'bg-gray-100 text-gray-700', icon: FileText }, 
    foto: { label: 'Foto', color: 'bg-pink-100 text-pink-700', icon: Eye }, 
    video: { label: 'Video', color: 'bg-indigo-100 text-indigo-700', icon: PlayCircle }, 
    esame: { label: 'Esame', color: 'bg-cyan-100 text-cyan-700', icon: FileText } 
  };
  
  const statusConfig = {
    bozza: { label: 'Bozza', color: 'bg-slate-200 text-slate-700' },
    inviato: { label: 'Inviato', color: 'bg-green-100 text-green-700' },
    visualizzato: { label: 'Visualizzato', color: 'bg-blue-100 text-blue-700' },
    scaricato: { label: 'Scaricato', color: 'bg-purple-100 text-purple-700' }
  };

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    if (filters.type !== 'all' && doc.type !== filters.type) return false;
    if (filters.status !== 'all' && doc.status !== filters.status) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!doc.name?.toLowerCase().includes(search) && 
          !doc.petName?.toLowerCase().includes(search) &&
          !doc.ownerEmail?.toLowerCase().includes(search)) return false;
    }
    return true;
  });

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
  
  const resendEmail = async (doc) => {
    if (!doc.ownerEmail) {
      alert('Email proprietario non disponibile');
      return;
    }
    try {
      await api.post('documents/send-email', { documentId: doc.id, recipientEmail: doc.ownerEmail });
      alert('✅ Email reinviata con successo!');
      onRefresh();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const downloadDoc = (doc) => {
    if (doc.content) {
      const link = document.createElement('a');
      link.href = doc.content;
      link.download = doc.fileName || `${doc.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Contenuto del documento non disponibile');
    }
  };

  const deleteDoc = async (docId) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) return;
    try {
      await api.delete(`documents/${docId}`);
      onRefresh();
      setSelectedDoc(null);
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const unreadCount = clientDocs.filter(d => !d.read).length;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-2xl font-bold text-gray-800">Documenti</h2><p className="text-gray-500 text-sm">Carica PDF e inviali automaticamente via email</p></div>
        <Button className="bg-coral-500 hover:bg-coral-600" onClick={() => setShowUpload(true)}><Upload className="h-4 w-4 mr-2" />Carica documento</Button>
      </div>
      <div className="bg-coral-50 border border-coral-200 rounded-lg p-4 mb-6"><div className="flex items-start gap-3"><FileText className="h-5 w-5 text-coral-600 mt-0.5" /><div><h4 className="font-medium text-coral-800">Come funziona</h4><p className="text-sm text-coral-700">Carichi il PDF → il proprietario lo riceve via email come allegato → lo ritrova in app nella sezione Documenti.</p></div></div></div>
      
      <Tabs defaultValue="dalla-clinica">
        <TabsList>
          <TabsTrigger value="dalla-clinica">Dalla clinica ({filteredDocs.length})</TabsTrigger>
          <TabsTrigger value="dai-clienti" className="relative">
            Caricati dai clienti
            {unreadCount > 0 && <Badge className="ml-2 bg-coral-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">{unreadCount}</Badge>}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dalla-clinica" className="mt-4">
          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Cerca per nome, animale, email..." 
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filters.type} onValueChange={(v) => setFilters({...filters, type: v})}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i tipi</SelectItem>
                    <SelectItem value="prescrizione">Prescrizione</SelectItem>
                    <SelectItem value="referto">Referto</SelectItem>
                    <SelectItem value="fattura">Fattura</SelectItem>
                    <SelectItem value="altro">Altro</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Stato" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli stati</SelectItem>
                    <SelectItem value="bozza">Bozza</SelectItem>
                    <SelectItem value="inviato">Inviato</SelectItem>
                    <SelectItem value="visualizzato">Visualizzato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filteredDocs.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-gray-500"><FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p className="font-medium">Nessun documento</p><p className="text-sm mt-2">{filters.search || filters.type !== 'all' || filters.status !== 'all' ? 'Prova a modificare i filtri' : 'Carica il tuo primo documento'}</p></CardContent></Card>
            ) : filteredDocs.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${docTypes[doc.type]?.color?.split(' ')[0] || 'bg-gray-100'}`}>
                        <FileText className={`h-6 w-6 ${docTypes[doc.type]?.color?.split(' ')[1] || 'text-gray-600'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{doc.name}</p>
                          {doc.content && <Badge variant="outline" className="text-xs">PDF</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">
                          {doc.petName || 'N/A'} • {doc.ownerEmail || 'Email N/A'} • {new Date(doc.createdAt).toLocaleDateString('it-IT')}
                        </p>
                        {doc.amount && <p className="text-xs text-gray-500 mt-0.5">Importo: €{doc.amount.toFixed(2)}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Badge className={docTypes[doc.type]?.color || docTypes.altro.color}>
                        {docTypes[doc.type]?.label || 'Altro'}
                      </Badge>
                      <Badge className={statusConfig[doc.status]?.color || statusConfig.bozza.color}>
                        {statusConfig[doc.status]?.label || 'Bozza'}
                      </Badge>
                      {doc.status !== 'bozza' && doc.lastSentAt && (
                        <span className="text-xs text-gray-400">
                          Inviato {new Date(doc.lastSentAt).toLocaleDateString('it-IT')}
                        </span>
                      )}
                      <div className="flex gap-1 ml-2">
                        {doc.ownerEmail && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); resendEmail(doc); }} title="Invia/Reinvia email">
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        {doc.content && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); downloadDoc(doc); }} title="Scarica PDF">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }} title="Anteprima">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {doc.notes && (
                    <div className="mt-3 p-2 bg-amber-50 rounded text-sm text-amber-700">
                      <strong>Note:</strong> {doc.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
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
      
      {/* Document Detail Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${docTypes[selectedDoc?.type]?.color?.split(' ')[0] || 'bg-gray-100'}`}>
                <FileText className={`h-5 w-5 ${docTypes[selectedDoc?.type]?.color?.split(' ')[1] || 'text-gray-600'}`} />
              </div>
              {selectedDoc?.name}
            </DialogTitle>
            <DialogDescription>Dettagli documento</DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Tipo</p>
                  <Badge className={docTypes[selectedDoc.type]?.color || 'bg-gray-100'}>
                    {docTypes[selectedDoc.type]?.label || 'Altro'}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Stato</p>
                  <Badge className={statusConfig[selectedDoc.status || 'bozza']?.color || 'bg-gray-100 text-gray-600'}>
                    {statusConfig[selectedDoc.status || 'bozza']?.label || 'Bozza'}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Animale</p>
                  <p className="font-medium">{selectedDoc.petName || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Proprietario</p>
                  <p className="font-medium">{selectedDoc.ownerEmail || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Creato il</p>
                  <p className="font-medium">{new Date(selectedDoc.createdAt).toLocaleString('it-IT')}</p>
                </div>
                {selectedDoc.lastSentAt && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Ultimo invio</p>
                    <p className="font-medium">{new Date(selectedDoc.lastSentAt).toLocaleString('it-IT')}</p>
                  </div>
                )}
              </div>
              
              {selectedDoc.notes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-600 mb-1">Note</p>
                  <p className="text-sm text-amber-800">{selectedDoc.notes}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                {selectedDoc.content && (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => { setPreviewDoc(selectedDoc); setSelectedDoc(null); }}>
                      <Eye className="h-4 w-4 mr-2" />Anteprima
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => downloadDoc(selectedDoc)}>
                      <Download className="h-4 w-4 mr-2" />Scarica
                    </Button>
                  </>
                )}
                {selectedDoc.ownerEmail && (
                  <Button className="flex-1 bg-coral-500 hover:bg-coral-600" onClick={() => { resendEmail(selectedDoc); setSelectedDoc(null); }}>
                    <Mail className="h-4 w-4 mr-2" />Invia Email
                  </Button>
                )}
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => deleteDoc(selectedDoc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Anteprima: {previewDoc?.name}</DialogTitle>
          </DialogHeader>
          {previewDoc?.content ? (
            <div className="flex-1 h-full min-h-[500px]">
              <iframe 
                src={previewDoc.content} 
                className="w-full h-full rounded-lg border"
                title="Anteprima documento"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Anteprima non disponibile</p>
                <p className="text-sm mt-1">Il documento non ha un contenuto visualizzabile</p>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            {previewDoc?.content && (
              <Button variant="outline" onClick={() => downloadDoc(previewDoc)}>
                <Download className="h-4 w-4 mr-2" />Scarica PDF
              </Button>
            )}
            <Button variant="outline" onClick={() => setPreviewDoc(null)}>Chiudi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple components for other sections
function ClinicPatients({ pets, onRefresh, onNavigate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', species: 'dog', breed: '' });
  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('pets', formData); setShowDialog(false); onRefresh(); } catch (error) { alert(error.message); } };
  return <div>{onNavigate && <BackToDashboard onNavigate={onNavigate} />}<div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold">Pazienti</h2><p className="text-gray-500 text-sm">Animali registrati</p></div><Dialog open={showDialog} onOpenChange={setShowDialog}><DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Nuovo</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nuovo paziente</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div><div><Label>Specie</Label><Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dog">Cane</SelectItem><SelectItem value="cat">Gatto</SelectItem><SelectItem value="other">Altro</SelectItem></SelectContent></Select></div><div><Label>Razza</Label><Input value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} /></div><Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi</Button></form></DialogContent></Dialog></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{pets.length === 0 ? <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun paziente</p></CardContent></Card> : pets.map((pet) => <Card key={pet.id}><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center">{pet.species === 'dog' ? <Dog className="h-6 w-6 text-coral-600" /> : pet.species === 'cat' ? <Cat className="h-6 w-6 text-coral-600" /> : <PawPrint className="h-6 w-6 text-coral-600" />}</div><div><p className="font-medium">{pet.name}</p><p className="text-sm text-gray-500">{pet.breed || pet.species}</p></div></div></CardContent></Card>)}</div></div>;
}

function ClinicOwners({ owners, onRefresh, onNavigate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('owners', formData); setShowDialog(false); onRefresh(); } catch (error) { alert(error.message); } };
  return <div>{onNavigate && <BackToDashboard onNavigate={onNavigate} />}<div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold">Proprietari</h2><p className="text-gray-500 text-sm">Clienti della clinica</p></div><Dialog open={showDialog} onOpenChange={setShowDialog}><DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Aggiungi</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nuovo proprietario</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div><div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div><div><Label>Telefono</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div><Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi</Button></form></DialogContent></Dialog></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{owners.length === 0 ? <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><User className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun proprietario</p></CardContent></Card> : owners.map((owner) => <Card key={owner.id}><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-blue-600" /></div><div><p className="font-medium">{owner.name}</p><p className="text-sm text-gray-500">{owner.email}</p></div></div>{owner.phone && <p className="text-sm text-gray-500 mt-3 flex items-center gap-2"><Phone className="h-4 w-4" />{owner.phone}</p>}</CardContent></Card>)}</div></div>;
}

function ClinicStaff({ staff, onRefresh, onNavigate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'vet', email: '', phone: '', canLogin: false, password: '' });
  
  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    try { 
      await api.post('staff', formData); 
      setShowDialog(false); 
      setFormData({ name: '', role: 'vet', email: '', phone: '', canLogin: false, password: '' });
      onRefresh(); 
    } catch (error) { alert(error.message); } 
  };

  const roleLabels = { 
    vet: { label: 'Veterinario', color: 'bg-blue-100 text-blue-700', icon: Stethoscope },
    assistant: { label: 'Assistente', color: 'bg-green-100 text-green-700', icon: User },
    receptionist: { label: 'Receptionist', color: 'bg-purple-100 text-purple-700', icon: Phone },
    admin: { label: 'Amministrativo', color: 'bg-amber-100 text-amber-700', icon: Receipt }
  };

  const rolePermissions = {
    vet: ['visite', 'documenti', 'pazienti', 'messaggi'],
    assistant: ['visite', 'pazienti', 'messaggi'],
    receptionist: ['agenda', 'messaggi', 'proprietari'],
    admin: ['documenti', 'fatture', 'report', 'pagamenti']
  };

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Staff</h2>
          <p className="text-gray-500 text-sm">Gestisci il team della clinica</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Aggiungi membro</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuovo membro staff</DialogTitle>
              <DialogDescription>Aggiungi un membro al team della clinica</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label>Nome completo *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Dr. Mario Rossi" />
              </div>
              
              <div>
                <Label>Ruolo *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vet">
                      <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-blue-600" />Veterinario</div>
                    </SelectItem>
                    <SelectItem value="assistant">
                      <div className="flex items-center gap-2"><User className="h-4 w-4 text-green-600" />Assistente</div>
                    </SelectItem>
                    <SelectItem value="receptionist">
                      <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-purple-600" />Receptionist</div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2"><Receipt className="h-4 w-4 text-amber-600" />Amministrativo</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'admin' && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800 font-medium">Ruolo Amministrativo</p>
                  <p className="text-xs text-amber-600 mt-1">Può caricare fatture, vedere i flussi di denaro e accedere ai report finanziari.</p>
                </div>
              )}
              
              <div>
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="email@clinica.it" />
              </div>
              
              <div>
                <Label>Telefono</Label>
                <Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Opzionale" />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Abilita accesso al portale</p>
                    <p className="text-xs text-gray-500">Il membro potrà accedere con le sue credenziali</p>
                  </div>
                  <Switch checked={formData.canLogin} onCheckedChange={(v) => setFormData({...formData, canLogin: v})} />
                </div>
                
                {formData.canLogin && (
                  <div className="mt-3">
                    <Label>Password temporanea *</Label>
                    <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required placeholder="Min. 6 caratteri" />
                    <p className="text-xs text-gray-500 mt-1">Il membro potrà cambiarla al primo accesso</p>
                  </div>
                )}
              </div>
              
              <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi al team</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Nessun membro nel team</p>
              <p className="text-sm mt-2">Aggiungi veterinari, assistenti e personale amministrativo</p>
            </CardContent>
          </Card>
        ) : staff.map((member) => {
          const roleInfo = roleLabels[member.role] || roleLabels.assistant;
          const RoleIcon = roleInfo.icon;
          return (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${roleInfo.color.split(' ')[0]}`}>
                      <RoleIcon className={`h-6 w-6 ${roleInfo.color.split(' ')[1]}`} />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                    </div>
                  </div>
                  {member.canLogin && (
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />Accesso attivo
                    </Badge>
                  )}
                </div>
                {member.email && (
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />{member.email}
                  </p>
                )}
                {member.role === 'admin' && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Receipt className="h-3 w-3" />Accesso a: Fatture, Report, Pagamenti
                    </p>
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

// Clinic Services - Servizi offerti
function ClinicServices({ onNavigate }) {
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
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
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

function ClinicTemplates({ owners = [], pets = [], staff = [], appointments = [], user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('tutti');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showUseDialog, setShowUseDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [useFormData, setUseFormData] = useState({ ownerId: '', petId: '', appointmentId: '', customData: {} });
  
  const [templates, setTemplates] = useState([
    { 
      id: 1, 
      name: 'Conferma Appuntamento', 
      type: 'messaggio', 
      content: 'Gentile {{nome_cliente}}, confermiamo il suo appuntamento per {{nome_pet}} il {{data}} alle {{ora}} presso {{nome_clinica}}.',
      icon: 'message'
    },
    { 
      id: 2, 
      name: 'Reminder 24h', 
      type: 'reminder', 
      content: 'Promemoria: domani {{data}} alle {{ora}} ha un appuntamento per {{nome_pet}}. Per disdire, risponda a questo messaggio.',
      icon: 'bell'
    },
    { 
      id: 3, 
      name: 'Reminder 1h', 
      type: 'reminder', 
      content: 'Tra 1 ora: appuntamento per {{nome_pet}} alle {{ora}}. Vi aspettiamo!',
      icon: 'bell'
    },
    { 
      id: 4, 
      name: 'Prescrizione Pronta', 
      type: 'messaggio', 
      content: 'Gentile {{nome_cliente}}, la prescrizione per {{nome_pet}} è pronta. Può ritirarla in clinica o richiederla via email.',
      icon: 'message'
    },
    { 
      id: 5, 
      name: 'Follow-up Post Visita', 
      type: 'email', 
      content: 'Gentile {{nome_cliente}},\n\nGrazie per aver scelto {{nome_clinica}} per la cura di {{nome_pet}}.\n\nDi seguito il riepilogo della visita del {{data}}:\n{{riepilogo_visita}}\n\nPer qualsiasi domanda, non esiti a contattarci.\n\nCordiali saluti,\n{{nome_clinica}}',
      icon: 'email'
    },
    { 
      id: 6, 
      name: 'Referto Pronto', 
      type: 'messaggio', 
      content: 'Gentile {{nome_cliente}}, il referto di {{nome_pet}} relativo a {{servizio}} del {{data}} è pronto. Può visualizzarlo nella sezione Documenti dell\'app o richiederlo via email a {{email_clinica}}. Per qualsiasi chiarimento, il Dr. {{nome_medico}} è a disposizione.',
      icon: 'document'
    },
    { 
      id: 7, 
      name: 'Promemoria Vaccinazione', 
      type: 'reminder', 
      content: 'Gentile {{nome_cliente}}, è il momento di vaccinare {{nome_pet}}! 💉\n\nIl richiamo del vaccino è previsto per {{data}}.\n\nPrenota subito il tuo appuntamento presso {{nome_clinica}} chiamando o rispondendo a questo messaggio.\n\nLa vaccinazione è importante per proteggere {{nome_pet}} da malattie pericolose. Non rimandare!',
      icon: 'bell'
    },
  ]);

  const [newTemplate, setNewTemplate] = useState({ name: '', type: 'messaggio', content: '' });

  const availableVars = [
    { key: '{{nome_cliente}}', desc: 'Nome del proprietario' },
    { key: '{{nome_pet}}', desc: 'Nome dell\'animale' },
    { key: '{{data}}', desc: 'Data appuntamento' },
    { key: '{{ora}}', desc: 'Ora appuntamento' },
    { key: '{{nome_clinica}}', desc: 'Nome della clinica' },
    { key: '{{nome_medico}}', desc: 'Nome del veterinario' },
    { key: '{{servizio}}', desc: 'Tipo di servizio' },
    { key: '{{email_clinica}}', desc: 'Email clinica' },
    { key: '{{riepilogo_visita}}', desc: 'Note/riepilogo' },
    { key: '{{importo}}', desc: 'Importo da pagare' },
  ];

  const typeConfig = {
    messaggio: { label: 'Messaggio', color: 'bg-blue-50 text-blue-600', iconBg: 'bg-blue-100', iconColor: 'text-blue-500' },
    email: { label: 'Email', color: 'bg-green-50 text-green-600', iconBg: 'bg-green-100', iconColor: 'text-green-500' },
    reminder: { label: 'Reminder', color: 'bg-amber-50 text-amber-600', iconBg: 'bg-amber-100', iconColor: 'text-amber-500' },
  };

  const getIcon = (iconType, className) => {
    switch(iconType) {
      case 'message': return <MessageCircle className={className} />;
      case 'bell': return <Bell className={className} />;
      case 'email': return <Mail className={className} />;
      case 'document': return <FileText className={className} />;
      default: return <MessageCircle className={className} />;
    }
  };

  // Get clinic name from user
  const clinicName = user?.clinicName || 'La tua Clinica Veterinaria';
  const clinicEmail = user?.email || '';

  // Generate message with real data
  const generateMessage = (template, data) => {
    let message = template.content;
    
    // Get selected owner
    const owner = owners.find(o => o.id === data.ownerId);
    // Get selected pet
    const pet = pets.find(p => p.id === data.petId);
    // Get selected appointment
    const appointment = appointments.find(a => a.id === data.appointmentId);
    // Get staff/vet
    const vet = staff.find(s => s.id === (appointment?.staffId || data.customData?.staffId));

    // Replace variables
    message = message.replace(/\{\{nome_cliente\}\}/g, owner?.name || data.customData?.nome_cliente || '[Nome Cliente]');
    message = message.replace(/\{\{nome_pet\}\}/g, pet?.name || appointment?.petName || data.customData?.nome_pet || '[Nome Animale]');
    message = message.replace(/\{\{data\}\}/g, appointment?.date ? new Date(appointment.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) : data.customData?.data || '[Data]');
    message = message.replace(/\{\{ora\}\}/g, appointment?.time || data.customData?.ora || '[Ora]');
    message = message.replace(/\{\{nome_clinica\}\}/g, clinicName);
    message = message.replace(/\{\{email_clinica\}\}/g, clinicEmail || '[email@clinica.it]');
    message = message.replace(/\{\{nome_medico\}\}/g, vet?.name || data.customData?.nome_medico || '[Nome Medico]');
    message = message.replace(/\{\{servizio\}\}/g, appointment?.type || appointment?.reason || data.customData?.servizio || '[Servizio]');
    message = message.replace(/\{\{riepilogo_visita\}\}/g, data.customData?.riepilogo_visita || '[Inserire riepilogo]');
    message = message.replace(/\{\{importo\}\}/g, data.customData?.importo ? `€${data.customData.importo}` : '[Importo]');

    return message;
  };

  // Open use template dialog
  const openUseDialog = (template) => {
    setSelectedTemplate(template);
    setUseFormData({ ownerId: '', petId: '', appointmentId: '', customData: {} });
    setGeneratedMessage('');
    setShowUseDialog(true);
  };

  // Update generated message when form changes
  const updateGeneratedMessage = (newFormData) => {
    setUseFormData(newFormData);
    if (selectedTemplate) {
      const msg = generateMessage(selectedTemplate, newFormData);
      setGeneratedMessage(msg);
    }
  };

  // Get owner's pets
  const ownerPets = useFormData.ownerId 
    ? pets.filter(p => p.ownerId === useFormData.ownerId)
    : pets;

  // Get appointments for selected owner/pet
  const relevantAppointments = appointments.filter(a => {
    if (useFormData.petId) {
      const pet = pets.find(p => p.id === useFormData.petId);
      return a.petName === pet?.name;
    }
    if (useFormData.ownerId) {
      const owner = owners.find(o => o.id === useFormData.ownerId);
      return a.ownerName === owner?.name || a.ownerEmail === owner?.email;
    }
    return true;
  });

  const filteredTemplates = activeTab === 'tutti' 
    ? templates 
    : templates.filter(t => t.type === activeTab.replace('messaggi', 'messaggio'));

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    alert('✅ Messaggio copiato negli appunti!');
  };

  const sendViaWhatsApp = (message, phone) => {
    const encodedMsg = encodeURIComponent(message);
    const url = phone ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;
    window.open(url, '_blank');
  };

  const sendViaEmail = (message, email, subject) => {
    const encodedMsg = encodeURIComponent(message);
    const encodedSubject = encodeURIComponent(subject || 'Messaggio da ' + clinicName);
    window.open(`mailto:${email || ''}?subject=${encodedSubject}&body=${encodedMsg}`, '_blank');
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      alert('Compila tutti i campi');
      return;
    }
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...newTemplate } : t));
    } else {
      setTemplates([...templates, { ...newTemplate, id: Date.now(), icon: newTemplate.type === 'email' ? 'email' : newTemplate.type === 'reminder' ? 'bell' : 'message' }]);
    }
    setShowNewDialog(false);
    setEditingTemplate(null);
    setNewTemplate({ name: '', type: 'messaggio', content: '' });
  };

  const openEditDialog = (template) => {
    setEditingTemplate(template);
    setNewTemplate({ name: template.name, type: template.type, content: template.content });
    setShowNewDialog(true);
  };

  const deleteTemplate = (id) => {
    if (confirm('Eliminare questo template?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const insertVariable = (variable) => {
    setNewTemplate({ ...newTemplate, content: newTemplate.content + variable });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Template Messaggi</h2>
          <p className="text-gray-500 text-sm">Gestisci i template per messaggi, email e reminder</p>
        </div>
        <Button className="bg-coral-500 hover:bg-coral-600" onClick={() => { setEditingTemplate(null); setNewTemplate({ name: '', type: 'messaggio', content: '' }); setShowNewDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nuovo Template
        </Button>
      </div>

      {/* How to use - Instructions */}
      <Card className="bg-gradient-to-r from-coral-50 to-orange-50 border-coral-200">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-coral-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-coral-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Template Automatici</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 bg-coral-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-gray-700">Clicca "Usa"</p>
                    <p className="text-gray-500">Seleziona il template da utilizzare</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 bg-coral-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-gray-700">Seleziona cliente</p>
                    <p className="text-gray-500">I dati vengono inseriti automaticamente!</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 bg-coral-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-gray-700">Invia subito</p>
                    <p className="text-gray-500">Via WhatsApp, Email o copia il testo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-6 border-b">
        {['tutti', 'messaggi', 'email', 'reminder'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition border-b-2 ${
              activeTab === tab 
                ? 'text-coral-600 border-coral-500' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => {
          const config = typeConfig[template.type];
          return (
            <Card key={template.id} className="hover:shadow-md transition">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.iconBg}`}>
                    {getIcon(template.icon, `h-5 w-5 ${config.iconColor}`)}
                  </div>
                  <Badge className={config.color}>
                    {config.label}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{template.content}</p>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <Button 
                    size="sm" 
                    className="bg-coral-500 hover:bg-coral-600 text-white"
                    onClick={() => openUseDialog(template)}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Usa
                  </Button>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditDialog(template)}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral-600 transition"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteTemplate(template.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Variables Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-5">
          <h4 className="font-semibold text-blue-800 mb-2">Variabili disponibili</h4>
          <p className="text-sm text-blue-600 mb-3">Queste variabili vengono sostituite automaticamente con i dati reali del cliente.</p>
          <div className="flex flex-wrap gap-2">
            {availableVars.map(v => (
              <Badge key={v.key} variant="outline" className="bg-white text-blue-700 border-blue-300 font-mono text-xs" title={v.desc}>
                {v.key}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* USE TEMPLATE DIALOG */}
      <Dialog open={showUseDialog} onOpenChange={setShowUseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-coral-500" />
              Usa Template: {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>Seleziona il cliente e i dati verranno inseriti automaticamente</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Client Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Proprietario</Label>
                <Select 
                  value={useFormData.ownerId} 
                  onValueChange={(v) => updateGeneratedMessage({ ...useFormData, ownerId: v, petId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona proprietario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {owners.map(owner => (
                      <SelectItem key={owner.id} value={owner.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {owner.name} {owner.email && `(${owner.email})`}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Animale</Label>
                <Select 
                  value={useFormData.petId} 
                  onValueChange={(v) => updateGeneratedMessage({ ...useFormData, petId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona animale..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ownerPets.map(pet => (
                      <SelectItem key={pet.id} value={pet.id}>
                        <div className="flex items-center gap-2">
                          <PawPrint className="h-4 w-4 text-gray-400" />
                          {pet.name} ({pet.species || pet.type})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Appointment Selection (optional) */}
            {relevantAppointments.length > 0 && (
              <div>
                <Label>Appuntamento (opzionale)</Label>
                <Select 
                  value={useFormData.appointmentId} 
                  onValueChange={(v) => updateGeneratedMessage({ ...useFormData, appointmentId: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona appuntamento..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessun appuntamento specifico</SelectItem>
                    {relevantAppointments.slice(0, 10).map(appt => (
                      <SelectItem key={appt.id} value={appt.id}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {appt.date} {appt.time} - {appt.petName} ({appt.type || appt.reason || 'Visita'})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom fields for missing data */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2 font-medium">Dati aggiuntivi (opzionali)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Veterinario</Label>
                  <Select 
                    value={useFormData.customData?.staffId || ''} 
                    onValueChange={(v) => updateGeneratedMessage({ ...useFormData, customData: { ...useFormData.customData, staffId: v } })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.filter(s => s.role === 'vet' || s.role === 'veterinario').map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Servizio</Label>
                  <Input 
                    className="h-9"
                    placeholder="Es: Vaccino, Visita..."
                    value={useFormData.customData?.servizio || ''}
                    onChange={(e) => updateGeneratedMessage({ ...useFormData, customData: { ...useFormData.customData, servizio: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Data</Label>
                  <Input 
                    type="date"
                    className="h-9"
                    value={useFormData.customData?.data || ''}
                    onChange={(e) => updateGeneratedMessage({ ...useFormData, customData: { ...useFormData.customData, data: new Date(e.target.value).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Ora</Label>
                  <Input 
                    type="time"
                    className="h-9"
                    value={useFormData.customData?.ora || ''}
                    onChange={(e) => updateGeneratedMessage({ ...useFormData, customData: { ...useFormData.customData, ora: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            {/* Generated Message Preview */}
            <div>
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Anteprima messaggio
              </Label>
              <div className="mt-2 p-4 bg-white border-2 border-coral-200 rounded-lg min-h-[120px]">
                {generatedMessage ? (
                  <p className="text-gray-800 whitespace-pre-wrap">{generatedMessage}</p>
                ) : (
                  <p className="text-gray-400 italic">Seleziona un cliente per vedere l'anteprima del messaggio...</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => copyToClipboard(generatedMessage)}
                disabled={!generatedMessage}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Copia testo
              </Button>
              <Button 
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={() => {
                  const owner = owners.find(o => o.id === useFormData.ownerId);
                  sendViaWhatsApp(generatedMessage, owner?.phone);
                }}
                disabled={!generatedMessage}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button 
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                onClick={() => {
                  const owner = owners.find(o => o.id === useFormData.ownerId);
                  sendViaEmail(generatedMessage, owner?.email, selectedTemplate?.name);
                }}
                disabled={!generatedMessage}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New/Edit Template Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Modifica Template' : 'Nuovo Template'}</DialogTitle>
            <DialogDescription>Crea un template per messaggi automatici</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome template</Label>
              <Input 
                value={newTemplate.name} 
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})} 
                placeholder="Es: Conferma appuntamento"
              />
            </div>
            
            <div>
              <Label>Tipo</Label>
              <div className="flex gap-2 mt-2">
                {Object.entries(typeConfig).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setNewTemplate({...newTemplate, type: key})}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition ${
                      newTemplate.type === key 
                        ? 'border-coral-500 bg-coral-50 text-coral-700' 
                        : 'border-gray-200 text-gray-600 hover:border-coral-300'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Contenuto</Label>
              <Textarea 
                value={newTemplate.content} 
                onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})} 
                rows={4}
                placeholder="Scrivi il messaggio... Usa le variabili come {{nome_cliente}}"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {availableVars.slice(0, 6).map(v => (
                  <button 
                    key={v.key} 
                    type="button"
                    onClick={() => insertVariable(v.key)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-coral-100 text-gray-600 hover:text-coral-600 rounded transition"
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowNewDialog(false)}>
                Annulla
              </Button>
              <Button className="flex-1 bg-coral-500 hover:bg-coral-600" onClick={handleSaveTemplate}>
                {editingTemplate ? 'Salva modifiche' : 'Crea template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== CLINIC REPORTS ====================
function ClinicReports({ appointments, documents, messages, owners, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate statistics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  // Filter by date helper
  const filterByMonth = (items, dateField, month, year) => 
    items.filter(item => {
      const d = new Date(item[dateField]);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  
  // Current month stats
  const monthlyAppts = filterByMonth(appointments, 'date', currentMonth, currentYear);
  const lastMonthAppts = filterByMonth(appointments, 'date', lastMonth, lastMonthYear);
  const monthlyDocs = filterByMonth(documents, 'createdAt', currentMonth, currentYear);
  const monthlyOwners = filterByMonth(owners || [], 'createdAt', currentMonth, currentYear);
  
  // Video vs In-person
  const videoAppts = monthlyAppts.filter(a => a.type === 'videoconsulto');
  const inPersonAppts = monthlyAppts.filter(a => a.type !== 'videoconsulto');
  
  // Revenue
  const monthlyRevenue = monthlyAppts.reduce((sum, a) => sum + (a.price || 0), 0);
  const lastMonthRevenue = lastMonthAppts.reduce((sum, a) => sum + (a.price || 0), 0);
  
  // Documents stats
  const docsSent = documents.filter(d => d.emailSent).length;
  const docsDownloaded = documents.filter(d => d.downloaded).length;
  const openRate = docsSent > 0 ? Math.round((docsDownloaded / docsSent) * 100) : 0;
  
  // Messages stats
  const closedTickets = messages.filter(m => m.status === 'closed').length;
  const openTickets = messages.filter(m => m.status !== 'closed').length;
  
  // Export CSV function
  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) { alert('Nessun dato da esportare'); return; }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).map(v => `"${v || ''}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'coral', trend }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold" style={{color: color === 'coral' ? '#FF6B6B' : color === 'blue' ? '#3B82F6' : color === 'green' ? '#22C55E' : color === 'emerald' ? '#10B981' : color === 'amber' ? '#F59E0B' : '#EF4444'}}>{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{backgroundColor: color === 'coral' ? '#FEE2E2' : color === 'blue' ? '#DBEAFE' : color === 'green' ? '#DCFCE7' : color === 'emerald' ? '#D1FAE5' : color === 'amber' ? '#FEF3C7' : '#FEE2E2'}}>
            <Icon className="h-5 w-5" style={{color: color === 'coral' ? '#FF6B6B' : color === 'blue' ? '#3B82F6' : color === 'green' ? '#22C55E' : color === 'emerald' ? '#10B981' : color === 'amber' ? '#F59E0B' : '#EF4444'}} />
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}% vs mese scorso
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Report & Analytics</h2>
          <p className="text-gray-500 text-sm">Monitora le performance della tua clinica</p>
        </div>
        <Button variant="outline" onClick={() => exportCSV(appointments, 'appuntamenti')}>
          <Download className="h-4 w-4 mr-2" />Export CSV
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="clients">Clienti</TabsTrigger>
          <TabsTrigger value="appointments">Appuntamenti</TabsTrigger>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="documents">Documenti</TabsTrigger>
          <TabsTrigger value="payments">Pagamenti</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Nuovi clienti" value={monthlyOwners.length} subtitle="questo mese" icon={User} color="blue" />
            <StatCard title="Appuntamenti" value={monthlyAppts.length} subtitle="questo mese" icon={Calendar} color="coral" 
              trend={lastMonthAppts.length > 0 ? Math.round(((monthlyAppts.length - lastMonthAppts.length) / lastMonthAppts.length) * 100) : 0} />
            <StatCard title="Documenti inviati" value={monthlyDocs.length} subtitle="questo mese" icon={FileText} color="green" />
            <StatCard title="Incassi tracciati" value={`€${monthlyRevenue}`} subtitle="questo mese" icon={Euro} color="emerald"
              trend={lastMonthRevenue > 0 ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0} />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuzione appuntamenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-coral-500"></div>
                      <span className="text-sm">In presenza</span>
                    </div>
                    <span className="font-medium">{inPersonAppts.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Video consulto</span>
                    </div>
                    <span className="font-medium">{videoAppts.length}</span>
                  </div>
                  <Progress value={monthlyAppts.length > 0 ? (inPersonAppts.length / monthlyAppts.length) * 100 : 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Documenti - Tasso apertura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-green-600">{openRate}%</p>
                  <p className="text-sm text-gray-500 mt-1">dei documenti inviati sono stati scaricati</p>
                  <div className="flex justify-center gap-8 mt-4 text-sm">
                    <div><span className="font-medium text-gray-800">{docsSent}</span> <span className="text-gray-500">inviati</span></div>
                    <div><span className="font-medium text-gray-800">{docsDownloaded}</span> <span className="text-gray-500">scaricati</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CLIENTS */}
        <TabsContent value="clients" className="mt-6">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <StatCard title="Nuovi clienti" value={monthlyOwners.length} subtitle="questo mese" icon={User} color="blue" />
            <StatCard title="Clienti attivi" value={(owners || []).length} subtitle="totale" icon={Users} color="green" />
            <StatCard title="Tasso ritorno" value="--%" subtitle="da calcolare" icon={RefreshCw} color="amber" />
          </div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista clienti</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportCSV(owners || [], 'clienti')}>
                  <Download className="h-4 w-4 mr-1" />Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(owners || []).length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nessun cliente registrato</p>
              ) : (
                <div className="space-y-2">
                  {(owners || []).slice(0, 10).map((owner, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{owner.name}</p>
                          <p className="text-sm text-gray-500">{owner.email}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : '-'}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPOINTMENTS */}
        <TabsContent value="appointments" className="mt-6">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Totale" value={monthlyAppts.length} subtitle="questo mese" icon={Calendar} color="coral" />
            <StatCard title="In presenza" value={inPersonAppts.length} icon={Stethoscope} color="coral" />
            <StatCard title="Video consulto" value={videoAppts.length} icon={Video} color="blue" />
            <StatCard title="No-show" value="0" subtitle="cancellazioni" icon={X} color="red" />
          </div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Storico appuntamenti</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportCSV(appointments, 'appuntamenti')}>
                  <Download className="h-4 w-4 mr-1" />Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nessun appuntamento</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {appointments.slice(0, 20).map((appt, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${appt.type === 'videoconsulto' ? 'bg-blue-100' : 'bg-coral-100'}`}>
                          {appt.type === 'videoconsulto' ? <Video className="h-5 w-5 text-blue-600" /> : <PawPrint className="h-5 w-5 text-coral-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{appt.petName}</p>
                          <p className="text-sm text-gray-500">{appt.ownerName} • {appt.reason || appt.type}</p>
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
        </TabsContent>

        {/* INBOX */}
        <TabsContent value="inbox" className="mt-6">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <StatCard title="Ticket aperti" value={openTickets} icon={Inbox} color="amber" />
            <StatCard title="Ticket chiusi" value={closedTickets} subtitle="questo mese" icon={CheckCircle} color="green" />
            <StatCard title="Tempo medio risposta" value="--" subtitle="da calcolare" icon={Clock} color="blue" />
          </div>
        </TabsContent>

        {/* DOCUMENTS */}
        <TabsContent value="documents" className="mt-6">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Documenti inviati" value={docsSent} icon={Send} color="coral" />
            <StatCard title="Scaricati" value={docsDownloaded} icon={Download} color="green" />
            <StatCard title="Tasso apertura" value={`${openRate}%`} icon={Eye} color="blue" />
            <StatCard title="Tempo medio invio" value="--" subtitle="post-visita" icon={Clock} color="amber" />
          </div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Storico documenti</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportCSV(documents, 'documenti')}>
                  <Download className="h-4 w-4 mr-1" />Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nessun documento</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {documents.slice(0, 20).map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-coral-500" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.petName} • {doc.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.emailSent ? (
                          <Badge variant="outline" className="text-green-600 border-green-300">Inviato</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">Bozza</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENTS */}
        <TabsContent value="payments" className="mt-6">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <StatCard title="Incassi questo mese" value={`€${monthlyRevenue}`} icon={Euro} color="emerald" />
            <StatCard title="Transazioni" value={monthlyAppts.filter(a => a.price > 0).length} icon={Receipt} color="blue" />
            <StatCard title="Ticket medio" value={monthlyAppts.length > 0 ? `€${Math.round(monthlyRevenue / monthlyAppts.length)}` : '€0'} icon={CreditCard} color="coral" />
          </div>
          
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800">Collega Stripe per tracciare i pagamenti</h3>
                  <p className="text-sm text-amber-700 mt-1">Attualmente mostri solo gli incassi tracciati in piattaforma. Collega Stripe per abilitare pagamenti video-consulti e avere report completi.</p>
                  <Button className="mt-3 bg-amber-600 hover:bg-amber-700">Connetti Stripe</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ClinicSettings({ user, onNavigate }) {
  const [googleCalendarStatus, setGoogleCalendarStatus] = useState({ connected: false, loading: true });
  const [stripeSettings, setStripeSettings] = useState({ stripePublishableKey: '', stripeSecretKey: '', stripeConfigured: false });
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [stripeForm, setStripeForm] = useState({ publishableKey: '', secretKey: '' });
  const [saving, setSaving] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [locationForm, setLocationForm] = useState({ 
    address: user.address || '', 
    city: user.city || '', 
    latitude: user.latitude || null, 
    longitude: user.longitude || null 
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [staffColors, setStaffColors] = useState([]);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => { 
    loadStripeSettings(); 
    loadGoogleCalendarStatus();
    loadStaffColors();
    loadStaff();
    
    // Check for Google OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_success')) {
      alert('✅ Google Calendar connesso con successo!');
      window.history.replaceState({}, '', window.location.pathname);
      loadGoogleCalendarStatus();
    }
    if (params.get('google_error')) {
      alert('❌ Errore connessione Google Calendar: ' + params.get('google_error'));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadGoogleCalendarStatus = async () => {
    try {
      const status = await api.get('google-calendar/status');
      setGoogleCalendarStatus({ ...status, loading: false });
    } catch (error) { 
      console.error('Error loading Google Calendar status:', error);
      setGoogleCalendarStatus({ connected: false, loading: false });
    }
  };

  const loadStaffColors = async () => {
    try {
      const colors = await api.get('staff-colors');
      setStaffColors(colors);
    } catch (error) { console.error('Error loading staff colors:', error); }
  };

  const loadStaff = async () => {
    try {
      const staff = await api.get('staff');
      setStaffList(staff);
    } catch (error) { console.error('Error loading staff:', error); }
  };

  const connectGoogleCalendar = async () => {
    try {
      const { authUrl } = await api.get(`auth/google?clinicId=${user.id}`);
      window.location.href = authUrl;
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const disconnectGoogleCalendar = async () => {
    if (!confirm('Sei sicuro di voler disconnettere Google Calendar?')) return;
    try {
      await api.post('google-calendar/disconnect', {});
      setGoogleCalendarStatus({ connected: false, loading: false });
      alert('Google Calendar disconnesso');
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const updateStaffColor = async (staffId, colorId) => {
    try {
      await api.post('staff/calendar-color', { staffId, colorId });
      loadStaff();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const loadStripeSettings = async () => {
    try {
      const settings = await api.get('clinic/stripe-settings');
      setStripeSettings(settings);
    } catch (error) { console.error('Error loading Stripe settings:', error); }
  };

  const saveStripeSettings = async () => {
    setSaving(true);
    try {
      await api.post('clinic/stripe-settings', {
        stripePublishableKey: stripeForm.publishableKey,
        stripeSecretKey: stripeForm.secretKey
      });
      setShowStripeForm(false);
      loadStripeSettings();
      alert('Configurazione Stripe salvata!');
    } catch (error) { alert(error.message); } finally { setSaving(false); }
  };

  const handleSubscribe = async (planId) => {
    setSubscriptionLoading(true);
    try {
      const { url } = await api.post('stripe/checkout/subscription', {
        planId,
        originUrl: window.location.origin
      });
      window.location.href = url;
    } catch (error) { alert(error.message); setSubscriptionLoading(false); }
  };

  // Detect current location
  const detectLocation = () => {
    setDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationForm(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setDetectingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Impossibile ottenere la posizione. Assicurati di aver abilitato la geolocalizzazione.');
          setDetectingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert('Geolocalizzazione non supportata dal browser');
      setDetectingLocation(false);
    }
  };

  // Geocode address using backend API (secure)
  const geocodeAddress = async () => {
    if (!locationForm.address || !locationForm.city) {
      alert('Inserisci indirizzo e città');
      return;
    }
    setDetectingLocation(true);
    try {
      const address = `${locationForm.address}, ${locationForm.city}, Italia`;
      const data = await api.get(`geocode?address=${encodeURIComponent(address)}`);
      
      if (data.success) {
        setLocationForm(prev => ({
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude
        }));
        alert('Coordinate trovate con successo!');
      } else {
        alert('Indirizzo non trovato. Prova con un indirizzo più preciso o usa "Usa posizione attuale".');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Errore durante la geocodifica. Riprova.');
    } finally {
      setDetectingLocation(false);
    }
  };

  // Save location
  const saveLocation = async () => {
    setSavingLocation(true);
    try {
      await api.put('clinic/profile', locationForm);
      alert('Posizione salvata con successo! I clienti potranno ora vedere la distanza dalla tua clinica.');
    } catch (error) { alert(error.message); } finally { setSavingLocation(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Impostazioni</h2>
        <p className="text-gray-500 text-sm">Configura la tua clinica</p>
      </div>
      
      <div className="space-y-6 max-w-2xl">
        {/* Abbonamento VetBuddy */}
        <Card className="border-coral-200 bg-gradient-to-r from-coral-50 to-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-coral-500" />Abbonamento VetBuddy
            </CardTitle>
            <CardDescription>Scegli il piano più adatto alla tua clinica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Starter */}
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-semibold">Starter</h3>
                <p className="text-2xl font-bold text-coral-500 mt-2">Gratis</p>
                <p className="text-xs text-gray-500">per iniziare</p>
                <ul className="text-sm text-gray-600 mt-3 space-y-1">
                  <li>• 1 sede, 1 utente</li>
                  <li>• 30 richieste/mese</li>
                </ul>
                <Button variant="outline" className="w-full mt-4" disabled>Piano attuale</Button>
              </div>
              
              {/* Pro */}
              <div className="border-2 border-coral-500 rounded-lg p-4 bg-white relative">
                <Badge className="absolute -top-2 right-2 bg-coral-500">Consigliato</Badge>
                <h3 className="font-semibold">Pro</h3>
                <p className="text-2xl font-bold text-coral-500 mt-2">€129<span className="text-sm font-normal text-gray-500">/mese</span></p>
                <p className="text-xs text-gray-500">+ IVA</p>
                <ul className="text-sm text-gray-600 mt-3 space-y-1">
                  <li>• Fino a 10 staff</li>
                  <li>• Documenti + email auto</li>
                  <li>• Google Calendar sync</li>
                </ul>
                <Button className="w-full mt-4 bg-coral-500 hover:bg-coral-600" onClick={() => handleSubscribe('pro')} disabled={subscriptionLoading}>
                  {subscriptionLoading ? 'Caricamento...' : 'Abbonati'}
                </Button>
              </div>
              
              {/* Enterprise */}
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-semibold">Enterprise</h3>
                <p className="text-2xl font-bold text-coral-500 mt-2">Custom</p>
                <p className="text-xs text-gray-500">gruppi e catene</p>
                <ul className="text-sm text-gray-600 mt-3 space-y-1">
                  <li>• Multi-sede illimitate</li>
                  <li>• API dedicata</li>
                </ul>
                <Button variant="outline" className="w-full mt-4">Contattaci</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stripe per pagamenti clienti */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-coral-500" />Pagamenti clienti (Stripe)
            </CardTitle>
            <CardDescription>Configura il tuo Stripe per ricevere pagamenti dai clienti</CardDescription>
          </CardHeader>
          <CardContent>
            {stripeSettings.stripeConfigured ? (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Stripe configurato</p>
                    <p className="text-sm text-green-600">Chiave: {stripeSettings.stripeSecretKey}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowStripeForm(true)}>Modifica</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Non configurato</p>
                  <p className="text-sm text-gray-500">Configura per ricevere pagamenti online</p>
                </div>
                <Button className="bg-coral-500 hover:bg-coral-600" onClick={() => setShowStripeForm(true)}>
                  Configura Stripe
                </Button>
              </div>
            )}
            
            {showStripeForm && (
              <div className="mt-4 p-4 border rounded-lg space-y-4">
                <div>
                  <Label>Publishable Key (pk_...)</Label>
                  <Input 
                    value={stripeForm.publishableKey} 
                    onChange={(e) => setStripeForm({...stripeForm, publishableKey: e.target.value})}
                    placeholder="pk_test_... o pk_live_..."
                  />
                </div>
                <div>
                  <Label>Secret Key (sk_...)</Label>
                  <Input 
                    type="password"
                    value={stripeForm.secretKey} 
                    onChange={(e) => setStripeForm({...stripeForm, secretKey: e.target.value})}
                    placeholder="sk_test_... o sk_live_..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveStripeSettings} disabled={saving} className="bg-coral-500 hover:bg-coral-600">
                    {saving ? 'Salvataggio...' : 'Salva'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowStripeForm(false)}>Annulla</Button>
                </div>
                <p className="text-xs text-gray-500">
                  Trova le tue chiavi su <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="text-coral-500 hover:underline">dashboard.stripe.com/apikeys</a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Calendar */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-green-600" />Google Calendar
              {googleCalendarStatus.connected && (
                <Badge className="bg-green-100 text-green-700 ml-2">Connesso</Badge>
              )}
            </CardTitle>
            <CardDescription>Sincronizza appuntamenti in tempo reale - niente doppi inserimenti</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {googleCalendarStatus.loading ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : googleCalendarStatus.connected ? (
              <>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Calendario connesso</p>
                        <p className="text-sm text-green-600">{googleCalendarStatus.calendarName || 'Calendario principale'}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={disconnectGoogleCalendar} className="text-red-600 border-red-300 hover:bg-red-50">
                      Disconnetti
                    </Button>
                  </div>
                  {googleCalendarStatus.lastSync && (
                    <p className="text-xs text-green-600 mt-2">
                      Ultima sincronizzazione: {new Date(googleCalendarStatus.lastSync).toLocaleString('it-IT')}
                    </p>
                  )}
                </div>

                {/* Staff Colors */}
                <div className="mt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />Colori staff per il calendario
                  </h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Assegna un colore a ogni collaboratore per distinguere gli appuntamenti su Google Calendar.
                  </p>
                  <div className="space-y-2">
                    {staffList.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">Nessuno staff aggiunto. Vai alla sezione Staff per aggiungere collaboratori.</p>
                    ) : staffList.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: staffColors.find(c => c.id === parseInt(staff.calendarColorId))?.hex || '#6B7280' }}
                          >
                            {staff.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{staff.name}</p>
                            <p className="text-xs text-gray-500">{staff.role}</p>
                          </div>
                        </div>
                        <Select 
                          value={staff.calendarColorId?.toString() || '1'} 
                          onValueChange={(v) => updateStaffColor(staff.id, v)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Colore" />
                          </SelectTrigger>
                          <SelectContent>
                            {staffColors.map((color) => (
                              <SelectItem key={color.id} value={color.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color.hex }} />
                                  {color.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                  <p className="text-sm text-blue-700">
                    <strong>Come funziona:</strong> Quando crei un appuntamento su VetBuddy, viene automaticamente aggiunto al tuo Google Calendar con il colore dello staff assegnato.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Non connesso</p>
                    <p className="text-sm text-gray-500">Connetti per sincronizzare gli appuntamenti</p>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={connectGoogleCalendar}>
                    <ExternalLink className="h-4 w-4 mr-2" />Connetti Google Calendar
                  </Button>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <CalendarCheck className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">Sync automatico</p>
                    <p className="text-xs text-gray-500">Appuntamenti su Google</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">No doppioni</p>
                    <p className="text-xs text-gray-500">Slot occupati bloccati</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <Users className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">Colori staff</p>
                    <p className="text-xs text-gray-500">Un colore per ogni collaboratore</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posizione su Google Maps */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />Posizione clinica
            </CardTitle>
            <CardDescription>Imposta la posizione per essere trovato dai clienti</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Indirizzo</Label>
                <Input 
                  value={locationForm.address} 
                  onChange={(e) => setLocationForm({...locationForm, address: e.target.value})}
                  placeholder="Via Roma 1"
                />
              </div>
              <div>
                <Label>Città</Label>
                <Input 
                  value={locationForm.city} 
                  onChange={(e) => setLocationForm({...locationForm, city: e.target.value})}
                  placeholder="Milano"
                />
              </div>
            </div>
            
            {locationForm.latitude && locationForm.longitude ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Coordinate impostate</span>
                </div>
                <p className="text-sm text-green-700">
                  Lat: {locationForm.latitude.toFixed(6)}, Lng: {locationForm.longitude.toFixed(6)}
                </p>
                <div className="mt-3">
                  <iframe
                    width="100%"
                    height="150"
                    style={{ border: 0, borderRadius: '8px' }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${locationForm.latitude},${locationForm.longitude}&zoom=15`}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="text-sm text-amber-700">Nessuna posizione impostata. I clienti non potranno vedere la distanza dalla tua clinica.</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={detectLocation} 
                disabled={detectingLocation}
              >
                {detectingLocation ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
                Usa posizione attuale
              </Button>
              <Button 
                variant="outline" 
                onClick={geocodeAddress} 
                disabled={detectingLocation || (!locationForm.address && !locationForm.city)}
              >
                {detectingLocation ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Cerca da indirizzo
              </Button>
              <Button 
                className="bg-blue-500 hover:bg-blue-600"
                onClick={saveLocation} 
                disabled={savingLocation || !locationForm.latitude}
              >
                {savingLocation ? 'Salvataggio...' : 'Salva posizione'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              La posizione permette ai clienti di vedere quanto dista la tua clinica e ottenere indicazioni stradali.
            </p>
          </CardContent>
        </Card>

        {/* Profilo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profilo clinica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nome clinica</Label><Input value={user.clinicName || ''} disabled /></div>
              <div><Label>P.IVA</Label><Input value={user.vatNumber || ''} disabled /></div>
            </div>
            <div><Label>Email</Label><Input value={user.email || ''} disabled /></div>
            <div><Label>Sito web</Label><Input value={user.website || ''} disabled /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
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
        <div className="mb-2"><RoleBadge role="owner" /></div>
        <Badge variant="outline" className="mb-6 justify-center text-amber-600 border-amber-300 bg-amber-50"><AlertCircle className="h-3 w-3 mr-1" /> Modalità Pilot</Badge>
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
              {documents.filter(d => !d.fromClient).map((doc) => {
                const handleDownload = () => {
                  if (doc.content) {
                    // If we have base64 content, create a download link
                    const link = document.createElement('a');
                    link.href = doc.content;
                    link.download = doc.fileName || doc.name || 'documento';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else if (doc.fileUrl) {
                    // If we have a URL, open it
                    window.open(doc.fileUrl, '_blank');
                  } else {
                    alert('File non disponibile per il download');
                  }
                };
                return (
                <Card key={doc.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        doc.type === 'referto' ? 'bg-blue-100' : 
                        doc.type === 'prescrizione' ? 'bg-green-100' : 
                        doc.type === 'fattura' ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        <FileText className={`h-6 w-6 ${
                          doc.type === 'referto' ? 'text-blue-600' : 
                          doc.type === 'prescrizione' ? 'text-green-600' : 
                          doc.type === 'fattura' ? 'text-yellow-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{doc.name}</p>
                          <Badge variant="outline" className={`text-xs ${
                            doc.type === 'referto' ? 'border-blue-300 text-blue-600' : 
                            doc.type === 'prescrizione' ? 'border-green-300 text-green-600' : 
                            doc.type === 'fattura' ? 'border-yellow-300 text-yellow-600' : 'border-gray-300 text-gray-600'
                          }`}>
                            {doc.type || 'documento'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{doc.petName} • {new Date(doc.createdAt).toLocaleDateString('it-IT')}</p>
                        {doc.amount && <p className="text-xs text-gray-400 mt-1">Importo: €{doc.amount.toFixed(2)}</p>}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-1" />Scarica
                    </Button>
                  </CardContent>
                </Card>
              )})}
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

function OwnerPets({ pets, onRefresh, onOpenProfile }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', species: 'dog', breed: '', birthDate: '', weight: '', 
    microchip: '', sterilized: false, allergies: '', medications: '', notes: '' 
  });
  
  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    try { 
      await api.post('pets', formData); 
      setShowDialog(false); 
      setFormData({ name: '', species: 'dog', breed: '', birthDate: '', weight: '', microchip: '', sterilized: false, allergies: '', medications: '', notes: '' });
      onRefresh(); 
    } catch (error) { alert(error.message); } 
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years < 1) return `${months + (months < 0 ? 12 : 0)} mesi`;
    return `${years} ann${years === 1 ? 'o' : 'i'}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">I miei animali</h2>
          <p className="text-gray-500 text-sm">Gestisci i profili e la cartella clinica dei tuoi amici</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button className="bg-blue-500 hover:bg-blue-600"><Plus className="h-4 w-4 mr-2" />Aggiungi animale</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nuovo animale</DialogTitle><DialogDescription>Inserisci i dati del tuo animale</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nome *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
                <div><Label>Specie</Label><Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dog">Cane</SelectItem><SelectItem value="cat">Gatto</SelectItem><SelectItem value="bird">Uccello</SelectItem><SelectItem value="rabbit">Coniglio</SelectItem><SelectItem value="other">Altro</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Razza</Label><Input value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} placeholder="Es. Labrador" /></div>
                <div><Label>Data di nascita</Label><Input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Peso (kg)</Label><Input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} placeholder="Es. 12.5" /></div>
                <div><Label>Microchip</Label><Input value={formData.microchip} onChange={(e) => setFormData({...formData, microchip: e.target.value})} placeholder="Numero microchip" /></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Switch checked={formData.sterilized} onCheckedChange={(v) => setFormData({...formData, sterilized: v})} />
                <Label>Sterilizzato/a</Label>
              </div>
              <div><Label>Allergie note</Label><Input value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} placeholder="Es. Pollo, antibiotici..." /></div>
              <div><Label>Farmaci in corso</Label><Input value={formData.medications} onChange={(e) => setFormData({...formData, medications: e.target.value})} placeholder="Es. Antistaminico 1x/giorno" /></div>
              <div><Label>Note comportamentali</Label><Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Es. Timoroso, aggressivo con altri cani..." rows={2} /></div>
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">Aggiungi animale</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center text-gray-500">
              <PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Nessun animale registrato</p>
              <p className="text-sm mt-2">Aggiungi il tuo primo animale per iniziare</p>
            </CardContent>
          </Card>
        ) : pets.map((pet) => (
          <Card key={pet.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onOpenProfile?.(pet.id)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {pet.species === 'dog' ? <Dog className="h-8 w-8 text-blue-600" /> : pet.species === 'cat' ? <Cat className="h-8 w-8 text-blue-600" /> : <PawPrint className="h-8 w-8 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg">{pet.name}</p>
                  <p className="text-sm text-gray-500">{pet.breed || (pet.species === 'dog' ? 'Cane' : pet.species === 'cat' ? 'Gatto' : 'Animale')}</p>
                  {pet.birthDate && <p className="text-xs text-gray-400 mt-1">{calculateAge(pet.birthDate)}</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pet.sterilized && <Badge variant="outline" className="text-xs text-green-600 border-green-300">Sterilizzato</Badge>}
                    {pet.microchip && <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">Microchip</Badge>}
                    {pet.allergies && <Badge variant="outline" className="text-xs text-red-600 border-red-300">Allergie</Badge>}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==================== PET PROFILE (Cartella Clinica) ====================
function PetProfile({ petId, onBack, appointments, documents }) {
  const [pet, setPet] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPetData();
  }, [petId]);

  const loadPetData = async () => {
    try {
      const data = await api.get(`pets/${petId}`);
      setPet(data);
    } catch (error) {
      console.error('Error loading pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/D';
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years < 1) return `${months + (months < 0 ? 12 : 0)} mesi`;
    return `${years} ann${years === 1 ? 'o' : 'i'}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-center"><RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto" /><p className="mt-2 text-gray-500">Caricamento...</p></div></div>;
  }

  if (!pet) {
    return <div className="text-center py-12"><AlertCircle className="h-12 w-12 text-gray-300 mx-auto" /><p className="mt-2 text-gray-500">Animale non trovato</p></div>;
  }

  const petAppointments = appointments?.filter(a => a.petId === petId || a.petName === pet.name) || [];
  const petDocuments = documents?.filter(d => d.petId === petId || d.petName === pet.name) || [];
  const nextAppointment = petAppointments.find(a => new Date(a.date) >= new Date());
  const lastDocument = petDocuments[0];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />Torna ai miei animali
        </Button>
        
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-md">
                {pet.species === 'dog' ? <Dog className="h-12 w-12 text-blue-600" /> : pet.species === 'cat' ? <Cat className="h-12 w-12 text-blue-600" /> : <PawPrint className="h-12 w-12 text-blue-600" />}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800">{pet.name}</h1>
                <p className="text-gray-600">{pet.breed || (pet.species === 'dog' ? 'Cane' : pet.species === 'cat' ? 'Gatto' : 'Animale')} • {calculateAge(pet.birthDate)}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {pet.sterilized && <Badge className="bg-green-100 text-green-700 border-green-300">✓ Sterilizzato</Badge>}
                  {pet.microchip && <Badge className="bg-blue-100 text-blue-700 border-blue-300">Microchip: {pet.microchip}</Badge>}
                  {pet.allergies && <Badge className="bg-red-100 text-red-700 border-red-300"><AlertTriangle className="h-3 w-3 mr-1" />Allergie</Badge>}
                  {pet.medications && <Badge className="bg-purple-100 text-purple-700 border-purple-300">In terapia</Badge>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="bg-blue-500 hover:bg-blue-600"><Calendar className="h-4 w-4 mr-2" />Prenota visita</Button>
                <Button variant="outline"><Upload className="h-4 w-4 mr-2" />Carica documento</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="visits">Visite</TabsTrigger>
          <TabsTrigger value="documents">Documenti</TabsTrigger>
          <TabsTrigger value="vaccines">Vaccini & Terapie</TabsTrigger>
          <TabsTrigger value="data">Dati & Spese</TabsTrigger>
        </TabsList>

        {/* Panoramica */}
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Prossimo appuntamento */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" />Prossimo appuntamento</CardTitle>
              </CardHeader>
              <CardContent>
                {nextAppointment ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{nextAppointment.reason || 'Visita'}</p>
                      <p className="text-sm text-gray-500">{new Date(nextAppointment.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })} alle {nextAppointment.time}</p>
                    </div>
                    <Button size="sm" variant="outline">Gestisci</Button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nessun appuntamento programmato</p>
                )}
              </CardContent>
            </Card>

            {/* Ultimo documento */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" />Ultimo documento</CardTitle>
              </CardHeader>
              <CardContent>
                {lastDocument ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{lastDocument.name}</p>
                      <p className="text-sm text-gray-500">{new Date(lastDocument.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" />Apri</Button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nessun documento</p>
                )}
              </CardContent>
            </Card>

            {/* Note importanti */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-500" />Note importanti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Allergie</p>
                    <p className="text-sm text-red-600 mt-1">{pet.allergies || 'Nessuna nota'}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">Farmaci in corso</p>
                    <p className="text-sm text-purple-600 mt-1">{pet.medications || 'Nessuno'}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Note comportamentali</p>
                    <p className="text-sm text-blue-600 mt-1">{pet.notes || 'Nessuna nota'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Visite */}
        <TabsContent value="visits">
          <Card>
            <CardHeader><CardTitle>Storico visite</CardTitle></CardHeader>
            <CardContent>
              {petAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nessuna visita registrata</p>
              ) : (
                <div className="space-y-3">
                  {petAppointments.map((appt, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${new Date(appt.date) >= new Date() ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {appt.type === 'videoconsulto' ? <Video className="h-5 w-5 text-blue-600" /> : <Stethoscope className="h-5 w-5 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{appt.reason || 'Visita'}</p>
                          <p className="text-sm text-gray-500">{new Date(appt.date).toLocaleDateString()} - {appt.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{new Date(appt.date) >= new Date() ? 'Programmato' : 'Completato'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documenti */}
        <TabsContent value="documents">
          <Tabs defaultValue="clinic">
            <TabsList className="mb-4">
              <TabsTrigger value="clinic">Dalla clinica</TabsTrigger>
              <TabsTrigger value="mine">Caricati da me</TabsTrigger>
            </TabsList>
            <TabsContent value="clinic">
              {petDocuments.filter(d => !d.fromClient).length === 0 ? (
                <Card><CardContent className="p-8 text-center text-gray-500">Nessun documento dalla clinica</CardContent></Card>
              ) : (
                <div className="space-y-2">
                  {petDocuments.filter(d => !d.fromClient).map((doc, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" />Scarica</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="mine">
              {petDocuments.filter(d => d.fromClient).length === 0 ? (
                <Card><CardContent className="p-8 text-center text-gray-500">Nessun documento caricato</CardContent></Card>
              ) : (
                <div className="space-y-2">
                  {petDocuments.filter(d => d.fromClient).map((doc, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600">Inviato</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Vaccini & Terapie */}
        <TabsContent value="vaccines">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Syringe className="h-5 w-5 text-blue-500" />Vaccini</CardTitle></CardHeader>
              <CardContent>
                {(pet.vaccinations || []).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nessun vaccino registrato</p>
                ) : (
                  <div className="space-y-3">
                    {pet.vaccinations.map((vax, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex justify-between">
                          <p className="font-medium">{vax.name}</p>
                          <Badge variant={new Date(vax.nextDue) < new Date() ? 'destructive' : 'outline'}>
                            {new Date(vax.nextDue) < new Date() ? 'Scaduto' : 'Valido'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">Fatto: {new Date(vax.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">Prossimo: {new Date(vax.nextDue).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-purple-500" />Terapie in corso</CardTitle></CardHeader>
              <CardContent>
                {pet.medications ? (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-purple-800">{pet.medications}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Nessuna terapia in corso</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dati & Spese */}
        <TabsContent value="data">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Dati anagrafici</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-500">Microchip</Label><p className="font-medium">{pet.microchip || 'Non registrato'}</p></div>
                  <div><Label className="text-gray-500">Peso</Label><p className="font-medium">{pet.weight ? `${pet.weight} kg` : 'N/D'}</p></div>
                  <div><Label className="text-gray-500">Data nascita</Label><p className="font-medium">{pet.birthDate ? new Date(pet.birthDate).toLocaleDateString() : 'N/D'}</p></div>
                  <div><Label className="text-gray-500">Sterilizzato</Label><p className="font-medium">{pet.sterilized ? 'Sì' : 'No'}</p></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader><CardTitle className="flex items-center gap-2"><Euro className="h-5 w-5 text-green-600" />Spese veterinarie</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">€{pet.spending?.currentYear || 0}</p>
                    <p className="text-sm text-gray-500">Speso quest'anno</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg text-center">
                    <p className="text-xl font-semibold text-gray-700">€{pet.spending?.total || 0}</p>
                    <p className="text-sm text-gray-500">Totale storico</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ==================== FIND CLINIC (Ricerca Cliniche con Google Maps) ====================
function FindClinic({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ overallRating: 5, punctuality: 5, competence: 5, price: 5, comment: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [maxDistance, setMaxDistance] = useState(50); // km
  const [mapCenter, setMapCenter] = useState({ lat: 41.9028, lng: 12.4964 }); // Rome default
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);

  // Get user's location
  const getUserLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setMapCenter(loc);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Impossibile ottenere la posizione. Assicurati di aver abilitato la geolocalizzazione.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError('Geolocalizzazione non supportata dal browser');
    }
  };

  const searchClinics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (searchCity) params.append('city', searchCity);
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
        params.append('maxDistance', maxDistance.toString());
      }
      const results = await api.get(`clinics/search?${params.toString()}`);
      setClinics(results);
      
      // Update map center based on results
      if (results.length > 0 && results[0].latitude && results[0].longitude) {
        setMapCenter({ lat: results[0].latitude, lng: results[0].longitude });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    getUserLocation();
    searchClinics(); 
  }, []);

  useEffect(() => {
    if (userLocation) {
      searchClinics();
    }
  }, [userLocation, maxDistance]);

  const submitReview = async () => {
    try {
      await api.post('reviews', { ...reviewForm, clinicId: selectedClinic.id });
      alert('Recensione inviata con successo!');
      setShowReviewForm(false);
      setReviewForm({ overallRating: 5, punctuality: 5, competence: 5, price: 5, comment: '' });
      searchClinics();
    } catch (error) {
      alert(error.message);
    }
  };

  const StarRating = ({ value, onChange, readonly }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={readonly} onClick={() => onChange?.(star)} className={`${readonly ? '' : 'hover:scale-110'} transition`}>
          <Star className={`h-5 w-5 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return null;
    if (distance < 1) return `${Math.round(distance * 1000)} m`;
    return `${distance.toFixed(1)} km`;
  };

  // Google Maps Component
  const GoogleMapsSection = () => {
    const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      return (
        <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Google Maps API key non configurata</p>
        </div>
      );
    }

    return (
      <div className="h-[500px] rounded-lg overflow-hidden border">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/search?key=${GOOGLE_MAPS_API_KEY}&q=clinica+veterinaria${searchCity ? `+${encodeURIComponent(searchCity)}` : '+Italia'}&center=${mapCenter.lat},${mapCenter.lng}&zoom=12`}
        />
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Trova una clinica</h2>
        <p className="text-gray-500 text-sm">Cerca cliniche veterinarie nella tua zona</p>
      </div>

      {/* Location Status */}
      {userLocation && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">Posizione rilevata - Le cliniche saranno ordinate per distanza</span>
        </div>
      )}
      {locationError && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-700">{locationError}</span>
          </div>
          <Button size="sm" variant="outline" onClick={getUserLocation}>
            <RefreshCw className="h-3 w-3 mr-1" />Riprova
          </Button>
        </div>
      )}

      {/* Search Form */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label className="sr-only">Nome clinica</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Nome clinica o veterinario..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && searchClinics()}
                />
              </div>
            </div>
            <div className="w-48">
              <Label className="sr-only">Città</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Città..." 
                  value={searchCity} 
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && searchClinics()}
                />
              </div>
            </div>
            {userLocation && (
              <div className="w-40">
                <Label className="sr-only">Distanza massima</Label>
                <Select value={maxDistance.toString()} onValueChange={(v) => setMaxDistance(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Distanza" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Entro 5 km</SelectItem>
                    <SelectItem value="10">Entro 10 km</SelectItem>
                    <SelectItem value="25">Entro 25 km</SelectItem>
                    <SelectItem value="50">Entro 50 km</SelectItem>
                    <SelectItem value="100">Entro 100 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={searchClinics} className="bg-blue-500 hover:bg-blue-600">
              <Search className="h-4 w-4 mr-2" />Cerca
            </Button>
            {!userLocation && (
              <Button variant="outline" onClick={getUserLocation}>
                <MapPin className="h-4 w-4 mr-2" />Usa la mia posizione
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          {clinics.length} clinic{clinics.length !== 1 ? 'he' : 'a'} trovat{clinics.length !== 1 ? 'e' : 'a'}
        </p>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <ClipboardList className="h-4 w-4 mr-1" />Lista
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
          >
            <MapPin className="h-4 w-4 mr-1" />Mappa
          </Button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto" /></div>
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <GoogleMapsSection />
          {/* Clinic list below map */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinics.map((clinic) => (
              <Card key={clinic.id} className={`hover:shadow-md transition-shadow cursor-pointer ${selectedClinic?.id === clinic.id ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setSelectedClinic(clinic)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{clinic.clinicName}</h3>
                    {clinic.distance !== null && (
                      <Badge variant="outline" className="text-blue-600">
                        <MapPin className="h-3 w-3 mr-1" />{formatDistance(clinic.distance)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{clinic.city}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{clinic.avgRating || 'N/D'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : clinics.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-gray-500"><Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p className="font-medium">Nessuna clinica trovata</p><p className="text-sm mt-2">Prova con altri criteri di ricerca</p></CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {clinics.map((clinic) => (
            <Card key={clinic.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{clinic.clinicName}</h3>
                    <p className="text-sm text-gray-500">{clinic.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{clinic.avgRating || 'N/D'}</span>
                    </div>
                    <p className="text-xs text-gray-500">{clinic.reviewCount} recensioni</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{clinic.city || 'Località non specificata'}</span>
                    </div>
                    {clinic.distance !== null && (
                      <Badge className="bg-blue-100 text-blue-700">
                        {formatDistance(clinic.distance)}
                      </Badge>
                    )}
                  </div>
                  {clinic.address && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span>{clinic.address}</span>
                    </div>
                  )}
                  {clinic.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{clinic.phone}</div>}
                  {clinic.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-gray-400" /><a href={clinic.website} target="_blank" className="text-blue-500 hover:underline truncate max-w-[200px]">{clinic.website}</a></div>}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={() => setSelectedClinic(clinic)}>
                    Dettagli
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedClinic(clinic); setShowReviewForm(true); }}>
                    <Star className="h-4 w-4 mr-1" />Recensisci
                  </Button>
                  {clinic.latitude && clinic.longitude && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`, '_blank')}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Clinic Detail Dialog */}
      <Dialog open={selectedClinic && !showReviewForm} onOpenChange={() => setSelectedClinic(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedClinic?.clinicName}</DialogTitle>
            <DialogDescription>{selectedClinic?.name}</DialogDescription>
          </DialogHeader>
          {selectedClinic && (
            <div className="space-y-4 mt-4">
              {/* Rating Summary */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{selectedClinic.avgRating || 'N/D'}</div>
                  <div className="flex justify-center mt-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.round(selectedClinic.avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{selectedClinic.reviewCount} recensioni</p>
                </div>
                {selectedClinic.distance !== null && (
                  <div className="flex-1 text-right">
                    <Badge className="bg-blue-100 text-blue-700 text-lg px-3 py-1">
                      <MapPin className="h-4 w-4 mr-1 inline" />
                      {formatDistance(selectedClinic.distance)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">dalla tua posizione</p>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                {selectedClinic.address && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Indirizzo</p>
                      <p className="text-sm text-gray-600">{selectedClinic.address}, {selectedClinic.city}</p>
                    </div>
                  </div>
                )}
                {selectedClinic.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Telefono</p>
                      <a href={`tel:${selectedClinic.phone}`} className="text-sm text-blue-500">{selectedClinic.phone}</a>
                    </div>
                  </div>
                )}
                {selectedClinic.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Sito web</p>
                      <a href={selectedClinic.website} target="_blank" className="text-sm text-blue-500 hover:underline">{selectedClinic.website}</a>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={() => setShowReviewForm(true)}>
                  <Star className="h-4 w-4 mr-2" />Scrivi una recensione
                </Button>
                {selectedClinic.latitude && selectedClinic.longitude && (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedClinic.latitude},${selectedClinic.longitude}`, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />Indicazioni
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Recensisci {selectedClinic?.clinicName}</DialogTitle>
            <DialogDescription>Condividi la tua esperienza</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="mb-2 block">Valutazione generale</Label>
              <StarRating value={reviewForm.overallRating} onChange={(v) => setReviewForm({...reviewForm, overallRating: v})} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Puntualità</Label>
                <StarRating value={reviewForm.punctuality} onChange={(v) => setReviewForm({...reviewForm, punctuality: v})} />
              </div>
              <div>
                <Label className="text-sm text-gray-500">Competenza</Label>
                <StarRating value={reviewForm.competence} onChange={(v) => setReviewForm({...reviewForm, competence: v})} />
              </div>
              <div>
                <Label className="text-sm text-gray-500">Prezzo</Label>
                <StarRating value={reviewForm.price} onChange={(v) => setReviewForm({...reviewForm, price: v})} />
              </div>
            </div>
            <div>
              <Label>Il tuo commento</Label>
              <Textarea 
                value={reviewForm.comment} 
                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                placeholder="Racconta la tua esperienza..."
                rows={4}
              />
            </div>
            <Button onClick={submitReview} className="w-full bg-blue-500 hover:bg-blue-600">
              Invia recensione
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== STAFF DASHBOARD (Amministrativo) ====================
function StaffDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [owners, setOwners] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(user.mustChangePassword || false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => { loadData(); }, []);
  
  const loadData = async () => {
    try {
      const [docs, appts, ownersList] = await Promise.all([
        api.get('documents'),
        api.get('appointments'),
        api.get('owners')
      ]);
      setDocuments(docs);
      setAppointments(appts);
      setOwners(ownersList);
    } catch (error) { console.error('Error:', error); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Le password non coincidono');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('La password deve avere almeno 6 caratteri');
      return;
    }
    setChangingPassword(true);
    try {
      await api.post('auth/change-password', { newPassword: passwordForm.newPassword });
      setShowChangePassword(false);
      alert('Password cambiata con successo!');
    } catch (error) { alert(error.message); } finally { setChangingPassword(false); }
  };

  const handleExportInvoices = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/export/invoices`, {
        headers: { 'Authorization': `Bearer ${api.getToken()}` }
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fatture.csv';
      a.click();
    } catch (error) { alert('Errore export: ' + error.message); }
  };

  // Calculate financial stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyAppts = appointments.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlyRevenue = monthlyAppts.reduce((sum, a) => sum + (a.price || 0), 0);
  const invoicesDocs = documents.filter(d => d.type === 'fattura');
  const invoicesTotal = invoicesDocs.reduce((sum, d) => sum + (d.amount || 0), 0);

  const NavItem = ({ icon: Icon, label, value }) => (
    <button 
      onClick={() => setActiveTab(value)} 
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === value ? 'bg-amber-100 text-amber-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      <Icon className="h-5 w-5" />{label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Modal cambio password obbligatorio */}
      <Dialog open={showChangePassword} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Cambia la tua password</DialogTitle>
            <DialogDescription>Per sicurezza, devi impostare una nuova password al primo accesso.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
            <div>
              <Label>Nuova password *</Label>
              <Input 
                type="password" 
                value={passwordForm.newPassword} 
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                required 
                placeholder="Min. 6 caratteri"
              />
            </div>
            <div>
              <Label>Conferma password *</Label>
              <Input 
                type="password" 
                value={passwordForm.confirmPassword} 
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                required 
                placeholder="Ripeti la password"
              />
            </div>
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={changingPassword}>
              {changingPassword ? 'Salvataggio...' : 'Imposta nuova password'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <VetBuddyLogo size={36} />
          <div>
            <h1 className="font-bold text-coral-500">VetBuddy</h1>
            <p className="text-xs text-gray-500 truncate max-w-[140px]">{user.clinicName}</p>
          </div>
        </div>
        <Badge className="mb-6 justify-center bg-amber-100 text-amber-700">
          <Receipt className="h-3 w-3 mr-1" />Staff Amministrativo
        </Badge>
        
        <nav className="space-y-1 flex-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
          <NavItem icon={Receipt} label="Fatture" value="invoices" />
          <NavItem icon={TrendingUp} label="Flussi di cassa" value="cashflow" />
          <NavItem icon={FileText} label="Documenti" value="documents" />
          <NavItem icon={User} label="Clienti" value="clients" />
        </nav>
        
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-400 mb-2">Loggato come:</p>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <Button variant="ghost" onClick={onLogout} className="mt-4 text-gray-600">
          <LogOut className="h-4 w-4 mr-2" />Esci
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Dashboard Amministrativa</h2>
              <p className="text-gray-500">Gestisci fatture e monitora i flussi finanziari</p>
            </div>
            
            {/* KPI Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Fatture emesse</p>
                      <p className="text-2xl font-bold text-amber-600">{invoicesDocs.length}</p>
                      <p className="text-xs text-gray-400">questo mese</p>
                    </div>
                    <Receipt className="h-8 w-8 text-amber-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Totale fatturato</p>
                      <p className="text-2xl font-bold text-green-600">€{invoicesTotal}</p>
                      <p className="text-xs text-gray-400">da fatture</p>
                    </div>
                    <Euro className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Visite questo mese</p>
                      <p className="text-2xl font-bold text-blue-600">{monthlyAppts.length}</p>
                      <p className="text-xs text-gray-400">appuntamenti</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Incassi visite</p>
                      <p className="text-2xl font-bold text-coral-600">€{monthlyRevenue}</p>
                      <p className="text-xs text-gray-400">questo mese</p>
                    </div>
                    <Wallet className="h-8 w-8 text-coral-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-amber-500" />Azioni rapide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start bg-amber-500 hover:bg-amber-600" onClick={() => setActiveTab('invoices')}>
                    <Plus className="h-4 w-4 mr-2" />Carica nuova fattura
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('cashflow')}>
                    <TrendingUp className="h-4 w-4 mr-2" />Vedi flussi di cassa
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('clients')}>
                    <User className="h-4 w-4 mr-2" />Lista clienti
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />Ultime fatture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {invoicesDocs.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nessuna fattura caricata</p>
                  ) : (
                    <div className="space-y-2">
                      {invoicesDocs.slice(0, 3).map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-amber-500" />
                            <span className="text-sm">{doc.name}</span>
                          </div>
                          <span className="text-sm font-medium">€{doc.amount || 0}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Fatture</h2>
                <p className="text-gray-500">Gestisci le fatture per i clienti</p>
              </div>
              <Dialog open={showUpload} onOpenChange={setShowUpload}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    <Plus className="h-4 w-4 mr-2" />Carica fattura
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <InvoiceUploadForm owners={owners} onSuccess={() => { setShowUpload(false); loadData(); }} />
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardContent className="p-0">
                {invoicesDocs.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">Nessuna fattura</p>
                    <p className="text-sm mt-2">Carica la prima fattura per i tuoi clienti</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Documento</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Cliente</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Importo</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Data</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Stato</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicesDocs.map((doc, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-amber-500" />
                              <span className="font-medium">{doc.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600">{doc.ownerEmail || doc.petName || '-'}</td>
                          <td className="p-4 font-medium">€{doc.amount || 0}</td>
                          <td className="p-4 text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            {doc.emailSent ? (
                              <Badge className="bg-green-100 text-green-700">Inviata</Badge>
                            ) : (
                              <Badge variant="outline">Bozza</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'cashflow' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Flussi di cassa</h2>
              <p className="text-gray-500">Monitora entrate e uscite della clinica</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-green-600 mb-2">Entrate questo mese</p>
                  <p className="text-4xl font-bold text-green-700">€{monthlyRevenue + invoicesTotal}</p>
                  <p className="text-xs text-green-500 mt-2">Visite + Fatture</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-blue-600 mb-2">Da visite</p>
                  <p className="text-4xl font-bold text-blue-700">€{monthlyRevenue}</p>
                  <p className="text-xs text-blue-500 mt-2">{monthlyAppts.length} appuntamenti</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-amber-600 mb-2">Da fatture</p>
                  <p className="text-4xl font-bold text-amber-700">€{invoicesTotal}</p>
                  <p className="text-xs text-amber-500 mt-2">{invoicesDocs.length} fatture</p>
                </CardContent>
              </Card>
            </div>

            {/* Transaction List */}
            <Card>
              <CardHeader>
                <CardTitle>Movimenti recenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...appointments.slice(0, 5).map(a => ({ ...a, _type: 'visit' })), ...invoicesDocs.slice(0, 5).map(d => ({ ...d, _type: 'invoice' }))]
                    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                    .slice(0, 10)
                    .map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item._type === 'invoice' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                            {item._type === 'invoice' ? <Receipt className="h-5 w-5 text-amber-600" /> : <Calendar className="h-5 w-5 text-blue-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{item._type === 'invoice' ? item.name : (item.petName || 'Visita')}</p>
                            <p className="text-sm text-gray-500">{item._type === 'invoice' ? 'Fattura' : item.reason || 'Appuntamento'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">+€{item.amount || item.price || 0}</p>
                          <p className="text-xs text-gray-400">{new Date(item.createdAt || item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Documenti</h2>
              <p className="text-gray-500">Tutti i documenti della clinica</p>
            </div>
            <Card>
              <CardContent className="p-0">
                {documents.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun documento</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <FileText className={`h-5 w-5 ${doc.type === 'fattura' ? 'text-amber-500' : 'text-blue-500'}`} />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500">{doc.petName} • {doc.type}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{doc.emailSent ? 'Inviato' : 'Bozza'}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Clienti</h2>
              <p className="text-gray-500">Lista proprietari registrati</p>
            </div>
            <Card>
              <CardContent className="p-0">
                {owners.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun cliente</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {owners.map((owner, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{owner.name}</p>
                            <p className="text-sm text-gray-500">{owner.email}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">{owner.phone || '-'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

// Invoice Upload Form for Admin Staff
function InvoiceUploadForm({ owners, onSuccess }) {
  const [formData, setFormData] = useState({ ownerEmail: '', title: '', amount: '', file: null, fileName: '', sendEmail: true });
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
    try {
      await api.post('documents', {
        name: formData.title,
        type: 'fattura',
        content: formData.file,
        fileName: formData.fileName,
        ownerEmail: formData.ownerEmail,
        amount: parseFloat(formData.amount) || 0,
        sendEmail: formData.sendEmail
      });
      onSuccess?.();
    } catch (error) { alert(error.message); } finally { setUploading(false); }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Carica fattura</DialogTitle>
        <DialogDescription>Carica un PDF e invialo al cliente</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <Label>Cliente (email) *</Label>
          <Input 
            value={formData.ownerEmail} 
            onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} 
            required 
            placeholder="email@cliente.com"
            list="owners-list"
          />
          <datalist id="owners-list">
            {owners.map((o, i) => <option key={i} value={o.email}>{o.name}</option>)}
          </datalist>
        </div>
        
        <div>
          <Label>Titolo fattura *</Label>
          <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="Es: Fattura visita 12/02" />
        </div>
        
        <div>
          <Label>Importo (€) *</Label>
          <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required placeholder="0.00" />
        </div>
        
        <div>
          <Label>File PDF *</Label>
          <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-amber-400 transition">
            {formData.fileName ? (
              <div className="flex items-center justify-center gap-2 text-amber-600"><Receipt className="h-5 w-5" /><span className="font-medium">{formData.fileName}</span></div>
            ) : (
              <><Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-500">Clicca per selezionare il PDF della fattura</p></>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
          <div>
            <p className="font-medium text-sm">Invia via email al cliente</p>
            <p className="text-xs text-gray-500">Il cliente riceverà il PDF come allegato</p>
          </div>
          <Switch checked={formData.sendEmail} onCheckedChange={(v) => setFormData({...formData, sendEmail: v})} />
        </div>
        
        <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={uploading}>
          {uploading ? 'Caricamento...' : 'Carica fattura'}
        </Button>
      </form>
    </>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [googleOAuthResult, setGoogleOAuthResult] = useState(null);

  useEffect(() => { 
    checkAuth(); 
    // Check for Google OAuth callback params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('google_success')) {
        setGoogleOAuthResult({ success: true, message: 'Google Calendar connesso con successo!' });
        window.history.replaceState({}, '', window.location.pathname);
      } else if (params.get('google_error')) {
        setGoogleOAuthResult({ success: false, message: 'Errore: ' + params.get('google_error') });
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (token) { try { const userData = await api.get('auth/me'); setUser(userData); } catch (error) { localStorage.removeItem('vetbuddy_token'); api.token = null; } }
    setLoading(false);
  };

  const handleLogin = (userData) => { setUser(userData); if (!localStorage.getItem('vetbuddy_welcomed_' + userData.id)) { setShowWelcome(true); } };
  const handleWelcomeContinue = () => { localStorage.setItem('vetbuddy_welcomed_' + user.id, 'true'); setShowWelcome(false); };
  const handleLogout = () => { localStorage.removeItem('vetbuddy_token'); api.token = null; setUser(null); setShowWelcome(false); };

  // Show Google OAuth result toast
  useEffect(() => {
    if (googleOAuthResult) {
      alert(googleOAuthResult.success ? '✅ ' + googleOAuthResult.message : '❌ ' + googleOAuthResult.message);
      setGoogleOAuthResult(null);
    }
  }, [googleOAuthResult]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-coral-50"><div className="text-center"><VetBuddyLogo size={60} /><p className="mt-4 text-coral-700">Caricamento...</p></div></div>;
  if (!user) return <LandingPage onLogin={handleLogin} />;
  if (showWelcome) return <WelcomeScreen user={user} onContinue={handleWelcomeContinue} />;
  if (user.role === 'clinic') return <ClinicDashboard user={user} onLogout={handleLogout} googleOAuthResult={googleOAuthResult} />;
  if (user.role === 'staff') return <StaffDashboard user={user} onLogout={handleLogout} />;
  return <OwnerDashboard user={user} onLogout={handleLogout} />;
}
