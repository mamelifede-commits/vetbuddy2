'use client';

import { useState, useEffect } from 'react';
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
import { 
  Calendar, FileText, Users, Inbox, LogOut, Plus, Send, Dog, Cat, Clock, Mail, User, 
  Building2, Phone, PawPrint, Search, Zap, Shield, Heart, MessageCircle, Bell, 
  CheckCircle, ChevronRight, Menu, X, CalendarDays, ClipboardList, Settings,
  Star, Check
} from 'lucide-react';

// Logo Component - Zampetta geometrica coral
const VetBuddyLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Paw pad - main */}
    <ellipse cx="50" cy="62" rx="18" ry="16" fill="#FF6B6B"/>
    {/* Toe pads */}
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('vetbuddy_token', token);
    }
  },
  
  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('vetbuddy_token');
    }
    return this.token;
  },
  
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Errore nella richiesta');
    }
    return data;
  },
  
  get(endpoint) {
    return this.request(endpoint);
  },
  
  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },
  
  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },
  
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <VetBuddyLogo size={32} />
              <span className="font-bold text-xl text-gray-900">VetBuddy</span>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('vantaggi')} className="text-gray-600 hover:text-coral-500 transition">Vantaggi</button>
              <button onClick={() => scrollToSection('come-funziona')} className="text-gray-600 hover:text-coral-500 transition">Come funziona</button>
              <button onClick={() => scrollToSection('veterinari')} className="text-gray-600 hover:text-coral-500 transition">Per Veterinari</button>
              <button onClick={() => scrollToSection('prezzi')} className="text-gray-600 hover:text-coral-500 transition">Prezzi</button>
              <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-coral-500 transition">FAQ</button>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>
                Accedi
              </Button>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
                Registrati gratis
              </Button>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-4 px-4">
            <nav className="flex flex-col gap-4">
              <button onClick={() => scrollToSection('vantaggi')} className="text-gray-600 text-left">Vantaggi</button>
              <button onClick={() => scrollToSection('come-funziona')} className="text-gray-600 text-left">Come funziona</button>
              <button onClick={() => scrollToSection('veterinari')} className="text-gray-600 text-left">Per Veterinari</button>
              <button onClick={() => scrollToSection('prezzi')} className="text-gray-600 text-left">Prezzi</button>
              <button onClick={() => scrollToSection('faq')} className="text-gray-600 text-left">FAQ</button>
              <hr />
              <Button variant="ghost" className="justify-start" onClick={() => { setAuthMode('login'); setShowAuth(true); setMobileMenuOpen(false); }}>Accedi</Button>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); setMobileMenuOpen(false); }}>Registrati gratis</Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            Piano gratuito disponibile per le cliniche!
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Il veterinario giusto,
            <br />
            <span className="text-coral-500">a portata di click.</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Prenota visite veterinarie in 2 minuti. Gestisci appuntamenti, chat e documenti in un'unica app.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-2 mb-12">
            <div className="flex items-center gap-2 p-3 border-b">
              <Search className="h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cerca cliniche nella tua città..." 
                className="flex-1 outline-none text-gray-600"
              />
            </div>
            <Button 
              className="w-full mt-2 bg-coral-500 hover:bg-coral-600 text-white py-6 text-lg"
              onClick={() => { setAuthMode('register'); setShowAuth(true); }}
            >
              Inizia a cercare
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <Clock className="h-6 w-6 text-coral-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-coral-500">Online</div>
              <div className="text-sm text-gray-500">Prenotazioni h24, 7/7</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <Zap className="h-6 w-6 text-coral-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-coral-500">2 min</div>
              <div className="text-sm text-gray-500">Per prenotare una visita</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <Shield className="h-6 w-6 text-coral-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-coral-500">Verificato</div>
              <div className="text-sm text-gray-500">Cliniche con partita IVA</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <Heart className="h-6 w-6 text-coral-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-coral-500">Gratis</div>
              <div className="text-sm text-gray-500">Per i proprietari</div>
            </div>
          </div>
        </div>
      </section>

      {/* Vantaggi Section */}
      <section id="vantaggi" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-coral-500 font-semibold mb-2">VANTAGGI</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perché scegliere VetBuddy?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tutto quello che ti serve per prenderti cura del tuo amico a quattro zampe, in un'unica app.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: 'Zero attese al telefono', desc: 'Prenota online quando vuoi' },
              { icon: FileText, title: 'Documenti sempre con te', desc: 'Referti, prescrizioni e storico visite' },
              { icon: MessageCircle, title: 'Chat con la clinica', desc: 'Comunica facilmente, invia foto' },
              { icon: Bell, title: 'Promemoria automatici', desc: 'Notifiche push ed email incluse' },
              { icon: Heart, title: 'Profilo animali', desc: 'Terapie, vaccini e note sempre aggiornate' },
              { icon: Shield, title: 'Cliniche registrate', desc: 'Professionisti con partita IVA verificata' },
            ].map((item, i) => (
              <Card key={i} className="bg-white border-0 shadow-sm hover:shadow-md transition">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-coral-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              className="bg-coral-500 hover:bg-coral-600 text-white px-8"
              onClick={() => { setAuthMode('register'); setShowAuth(true); }}
            >
              Registrati gratis
            </Button>
            <p className="text-sm text-gray-500 mt-3">Gratuito per sempre per i proprietari</p>
          </div>
        </div>
      </section>

      {/* Come Funziona Section */}
      <section id="come-funziona" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-coral-500 font-semibold mb-2">COME FUNZIONA</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Prenota in 3 semplici passi</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Cerca', desc: 'Trova cliniche nella tua zona' },
              { num: '2', title: 'Prenota', desc: 'Scegli data e ora in pochi click' },
              { num: '3', title: 'Conferma', desc: 'Ricevi conferma via email o push' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="h-16 w-16 bg-coral-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Per Veterinari Section */}
      <section id="veterinari" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-coral-500 font-semibold mb-2">PER VETERINARI E CLINICHE</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">La dashboard che hai sempre desiderato</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Gestisci appuntamenti, staff, messaggi e prescrizioni da un'unica piattaforma potente e intuitiva.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: CalendarDays, title: 'Agenda Multi-Medico', desc: 'Vista timeline per tutti i dottori, stati appuntamento, filtri avanzati' },
              { icon: Inbox, title: 'Inbox Intelligente', desc: 'Ticket per messaggi, prescrizioni, follow-up con SLA e anti-duplicato' },
              { icon: Users, title: 'Gestione Staff', desc: 'Ruoli, permessi, colori calendario per ogni membro del team' },
              { icon: Zap, title: 'Azioni Rapide', desc: 'Conferma, sposta, annulla con 1 click. Template messaggi pronti' },
              { icon: ClipboardList, title: 'Dashboard Completa', desc: 'Statistiche real-time, carico medici, avvisi SLA' },
              { icon: FileText, title: 'Prescrizioni Digitali', desc: 'Workflow completo: revisione, approvazione, documento' },
            ].map((item, i) => (
              <Card key={i} className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-coral-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 bg-coral-500 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Inizia gratis, cresci con noi</h3>
            <p className="text-coral-100 mb-6">
              Il piano Starter è gratuito per sempre. Nessuna carta di credito richiesta.
            </p>
            <Button 
              className="bg-white text-coral-500 hover:bg-coral-50"
              onClick={() => { setAuthMode('register'); setShowAuth(true); }}
            >
              Registra la tua clinica
            </Button>
          </div>
        </div>
      </section>

      {/* Prezzi Section */}
      <section id="prezzi" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-coral-500 font-semibold mb-2">PREZZI TRASPARENTI</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Scegli il piano adatto alla tua clinica</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Inizia gratis, scala quando cresci. <strong>Sempre gratis per i proprietari di animali.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Starter */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Per iniziare</CardDescription>
                <div className="text-3xl font-bold text-coral-500 mt-4">Gratis</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 1 sede, 1 utente</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 30 richieste/mese</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Supporto email</li>
                </ul>
                <Button className="w-full mt-6 bg-coral-500 hover:bg-coral-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
                  Inizia gratis
                </Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-2 border-coral-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral-500 text-white text-xs px-3 py-1 rounded-full">
                Più scelto
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Per automatizzare</CardDescription>
                <div className="text-3xl font-bold text-coral-500 mt-4">€129<span className="text-sm font-normal text-gray-500">/mese</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Fino a 10 staff</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Calendario live</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Reminder automatici</li>
                </ul>
                <Button className="w-full mt-6 bg-coral-500 hover:bg-coral-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
                  Richiedi pilot gratuito
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plus */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Pro Plus</CardTitle>
                <CardDescription>Alto volume</CardDescription>
                <div className="text-3xl font-bold text-coral-500 mt-4">€179<span className="text-sm font-normal text-gray-500">/mese</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Tutto in Pro +</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> SMS/WhatsApp inclusi</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Report avanzati</li>
                </ul>
                <Button className="w-full mt-6 bg-coral-500 hover:bg-coral-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
                  Richiedi pilot gratuito
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Gruppi e catene</CardDescription>
                <div className="text-3xl font-bold text-coral-500 mt-4">da €399<span className="text-sm font-normal text-gray-500">/mese</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Multi-sede illimitate</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> API dedicata</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Account manager</li>
                </ul>
                <Button variant="outline" className="w-full mt-6">
                  Contatta il sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-coral-500 font-semibold mb-2">DOMANDE FREQUENTI</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Hai dubbi?</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: 'Come funziona la prenotazione?', a: 'Cerca una clinica nella tua zona, scegli data e ora disponibili, e conferma la prenotazione. Riceverai una notifica di conferma via email.' },
              { q: 'Posso cancellare un appuntamento?', a: 'Sì, puoi cancellare o modificare un appuntamento fino a 24 ore prima dalla tua dashboard.' },
              { q: 'I miei dati sono al sicuro?', a: 'Assolutamente. Utilizziamo crittografia end-to-end e siamo GDPR compliant. I tuoi dati non verranno mai condivisi con terze parti.' },
              { q: 'Quanto costa usare VetBuddy?', a: 'Per i proprietari di animali è completamente gratuito. Per le cliniche offriamo un piano Starter gratuito e piani a pagamento con funzionalità avanzate.' },
              { q: 'Come faccio a registrare la mia clinica?', a: 'Clicca su "Registrati gratis", seleziona "Clinica Veterinaria" e compila i dati richiesti. Verificheremo la partita IVA e attiverai il profilo in 24h.' },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-lg px-6">
                <AccordionTrigger className="text-left font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Pronto a digitalizzare la tua clinica?
          </h2>
          <p className="text-gray-600 mb-8">
            Unisciti alle cliniche veterinarie che stanno semplificando la gestione degli appuntamenti.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-6 text-lg"
              onClick={() => { setAuthMode('register'); setShowAuth(true); }}
            >
              Registra la tua clinica
            </Button>
            <Button 
              variant="outline" 
              className="px-8 py-6 text-lg"
              onClick={() => { setAuthMode('register'); setShowAuth(true); }}
            >
              Sei un proprietario?
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <VetBuddyLogo size={32} />
            <span className="font-bold text-xl">VetBuddy</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 VetBuddy. Tutti i diritti riservati. | GDPR Compliant | Privacy Policy
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md">
          <AuthForm 
            mode={authMode} 
            setMode={setAuthMode} 
            onLogin={(user) => { setShowAuth(false); onLogin(user); }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Auth Form Component
function AuthForm({ mode, setMode, onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'clinic',
    clinicName: '',
    phone: '',
  });

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
        <div className="flex justify-center mb-4">
          <VetBuddyLogo size={50} />
        </div>
        <DialogTitle className="text-2xl text-coral-500">VetBuddy</DialogTitle>
        <DialogDescription>
          {mode === 'login' ? 'Accedi al tuo account' : 'Crea un nuovo account'}
        </DialogDescription>
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
                <Label>Tipo account</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinic">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Clinica Veterinaria
                      </div>
                    </SelectItem>
                    <SelectItem value="owner">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Proprietario Animale
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Nome {formData.role === 'clinic' ? 'Responsabile' : 'Completo'}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              {formData.role === 'clinic' && (
                <div>
                  <Label>Nome Clinica</Label>
                  <Input
                    value={formData.clinicName}
                    onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                    required
                  />
                </div>
              )}
              
              <div>
                <Label>Telefono</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </>
          )}
          
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={loading}>
            {loading ? 'Caricamento...' : (mode === 'login' ? 'Accedi' : 'Registrati')}
          </Button>
        </form>
      </Tabs>
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appts, docs, msgs, staffList, petsList, ownersList] = await Promise.all([
        api.get('appointments'),
        api.get('documents'),
        api.get('messages'),
        api.get('staff'),
        api.get('pets'),
        api.get('owners'),
      ]);
      setAppointments(appts);
      setDocuments(docs);
      setMessages(msgs);
      setStaff(staffList);
      setPets(petsList);
      setOwners(ownersList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const NavItem = ({ icon: Icon, label, value }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
        activeTab === value 
          ? 'bg-coral-100 text-coral-700 font-medium' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <VetBuddyLogo size={40} />
          <div>
            <h1 className="font-bold text-coral-500">VetBuddy</h1>
            <p className="text-xs text-gray-500">{user.clinicName || 'Clinica'}</p>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavItem icon={Calendar} label="Agenda" value="agenda" />
          <NavItem icon={Inbox} label="Inbox" value="inbox" />
          <NavItem icon={FileText} label="Documenti" value="documents" />
          <NavItem icon={Users} label="Staff" value="staff" />
          <NavItem icon={PawPrint} label="Pazienti" value="patients" />
          <NavItem icon={User} label="Proprietari" value="owners" />
        </nav>
        
        <Button variant="ghost" onClick={onLogout} className="mt-auto text-gray-600">
          <LogOut className="h-4 w-4 mr-2" />
          Esci
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === 'agenda' && <AgendaSection appointments={appointments} onRefresh={loadData} />}
        {activeTab === 'inbox' && <InboxSection messages={messages} onRefresh={loadData} />}
        {activeTab === 'documents' && <DocumentsSection documents={documents} onRefresh={loadData} />}
        {activeTab === 'staff' && <StaffSection staff={staff} onRefresh={loadData} />}
        {activeTab === 'patients' && <PatientsSection pets={pets} onRefresh={loadData} />}
        {activeTab === 'owners' && <OwnersSection owners={owners} onRefresh={loadData} />}
      </main>
    </div>
  );
}

// Agenda Section
function AgendaSection({ appointments, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ petName: '', ownerName: '', date: '', time: '', reason: '', notes: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('appointments', formData);
      setShowDialog(false);
      setFormData({ petName: '', ownerName: '', date: '', time: '', reason: '', notes: '' });
      onRefresh();
    } catch (error) { alert(error.message); }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const upcomingAppts = appointments.filter(a => a.date > today);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Nuovo Appuntamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo Appuntamento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nome Animale</Label><Input value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} required /></div>
                <div><Label>Nome Proprietario</Label><Input value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Data</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required /></div>
                <div><Label>Ora</Label><Input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required /></div>
              </div>
              <div><Label>Motivo</Label><Input value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} required /></div>
              <div><Label>Note</Label><Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>
              <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Crea Appuntamento</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-coral-500" />Oggi ({todayAppts.length})</CardTitle></CardHeader>
          <CardContent>
            {todayAppts.length === 0 ? <p className="text-gray-500">Nessun appuntamento per oggi</p> : (
              <div className="space-y-3">
                {todayAppts.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between p-3 bg-coral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-coral-100 rounded-full flex items-center justify-center"><PawPrint className="h-5 w-5 text-coral-600" /></div>
                      <div><p className="font-medium">{appt.petName}</p><p className="text-sm text-gray-500">{appt.ownerName} - {appt.reason}</p></div>
                    </div>
                    <Badge variant="outline" className="text-coral-700 border-coral-300">{appt.time}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Prossimi Appuntamenti</CardTitle></CardHeader>
          <CardContent>
            {upcomingAppts.length === 0 ? <p className="text-gray-500">Nessun appuntamento futuro</p> : (
              <div className="space-y-3">
                {upcomingAppts.slice(0, 5).map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center"><PawPrint className="h-5 w-5 text-gray-600" /></div>
                      <div><p className="font-medium">{appt.petName}</p><p className="text-sm text-gray-500">{appt.ownerName} - {appt.reason}</p></div>
                    </div>
                    <div className="text-right"><p className="font-medium text-sm">{appt.date}</p><p className="text-sm text-gray-500">{appt.time}</p></div>
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

// Inbox Section
function InboxSection({ messages, onRefresh }) {
  const unreadCount = messages.filter(m => !m.read).length;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Inbox {unreadCount > 0 && <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>}</h2>
      </div>
      <Card>
        <CardContent className="p-0">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500"><Inbox className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun messaggio</p></div>
          ) : (
            <ScrollArea className="h-[500px]">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!msg.read ? 'bg-blue-50' : ''}`}
                  onClick={async () => { if (!msg.read) { await api.put(`messages/${msg.id}`, { read: true }); onRefresh(); } }}>
                  <div className="flex justify-between items-start">
                    <div><p className={`font-medium ${!msg.read ? 'text-blue-700' : ''}`}>{msg.subject}</p><p className="text-sm text-gray-500 mt-1 line-clamp-2">{msg.content}</p></div>
                    <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Documents Section
function DocumentsSection({ documents, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [emailTo, setEmailTo] = useState('');
  const [formData, setFormData] = useState({ name: '', type: 'medical_record', content: '', petName: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('documents', formData); setShowDialog(false); setFormData({ name: '', type: 'medical_record', content: '', petName: '' }); onRefresh(); } 
    catch (error) { alert(error.message); }
  };

  const handleSendEmail = async () => {
    if (!selectedDoc || !emailTo) return;
    try {
      const result = await api.post('documents/send-email', { documentId: selectedDoc.id, recipientEmail: emailTo });
      alert(result.mock ? 'Email simulata (MOCK)' : 'Email inviata!');
      setShowEmailDialog(false); setEmailTo(''); setSelectedDoc(null);
    } catch (error) { alert(error.message); }
  };

  const docTypes = { vaccination: { label: 'Vaccinazione', color: 'bg-green-100 text-green-700' }, medical_record: { label: 'Cartella Clinica', color: 'bg-blue-100 text-blue-700' }, prescription: { label: 'Prescrizione', color: 'bg-purple-100 text-purple-700' }, other: { label: 'Altro', color: 'bg-gray-100 text-gray-700' } };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Documenti</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Nuovo Documento</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo Documento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
              <div><Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccination">Vaccinazione</SelectItem>
                    <SelectItem value="medical_record">Cartella Clinica</SelectItem>
                    <SelectItem value="prescription">Prescrizione</SelectItem>
                    <SelectItem value="other">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Nome Animale</Label><Input value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} /></div>
              <div><Label>Contenuto</Label><Textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={4} /></div>
              <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Salva</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invia via Email</DialogTitle><DialogDescription>Documento: {selectedDoc?.name}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Email destinatario</Label><Input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="email@esempio.com" /></div>
            <Button onClick={handleSendEmail} className="w-full bg-coral-500 hover:bg-coral-600"><Send className="h-4 w-4 mr-2" />Invia</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {documents.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-gray-500"><FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun documento</p></CardContent></Card>
        ) : documents.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-coral-100 rounded-lg flex items-center justify-center"><FileText className="h-5 w-5 text-coral-600" /></div>
                  <div><p className="font-medium">{doc.name}</p><p className="text-sm text-gray-500">{doc.petName || 'N/A'}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={docTypes[doc.type]?.color || docTypes.other.color}>{docTypes[doc.type]?.label || 'Altro'}</Badge>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedDoc(doc); setShowEmailDialog(true); }}><Mail className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Staff Section
function StaffSection({ staff, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'vet', email: '', phone: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('staff', formData); setShowDialog(false); setFormData({ name: '', role: 'vet', email: '', phone: '' }); onRefresh(); }
    catch (error) { alert(error.message); }
  };

  const roleLabels = { vet: 'Veterinario', assistant: 'Assistente', receptionist: 'Receptionist' };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Staff</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Aggiungi</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo Membro</DialogTitle></DialogHeader>
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
          <Card className="col-span-full"><CardContent className="p-8 text-center text-gray-500"><Users className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun membro</p></CardContent></Card>
        ) : staff.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-coral-600" /></div>
                <div><p className="font-medium">{member.name}</p><Badge variant="outline">{roleLabels[member.role] || member.role}</Badge></div>
              </div>
              {member.email && <p className="text-sm text-gray-500 mt-3 flex items-center gap-2"><Mail className="h-4 w-4" />{member.email}</p>}
              {member.phone && <p className="text-sm text-gray-500 mt-1 flex items-center gap-2"><Phone className="h-4 w-4" />{member.phone}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Patients Section
function PatientsSection({ pets, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', species: 'dog', breed: '', birthDate: '', weight: '', notes: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('pets', formData); setShowDialog(false); setFormData({ name: '', species: 'dog', breed: '', birthDate: '', weight: '', notes: '' }); onRefresh(); }
    catch (error) { alert(error.message); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pazienti</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Nuovo Paziente</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo Paziente</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Specie</Label>
                  <Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Cane</SelectItem>
                      <SelectItem value="cat">Gatto</SelectItem>
                      <SelectItem value="bird">Uccello</SelectItem>
                      <SelectItem value="rabbit">Coniglio</SelectItem>
                      <SelectItem value="other">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Razza</Label><Input value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Data Nascita</Label><Input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} /></div>
                <div><Label>Peso (kg)</Label><Input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} /></div>
              </div>
              <div><Label>Note</Label><Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>
              <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.length === 0 ? (
          <Card className="col-span-full"><CardContent className="p-8 text-center text-gray-500"><PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun paziente</p></CardContent></Card>
        ) : pets.map((pet) => (
          <Card key={pet.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center">
                  {pet.species === 'dog' ? <Dog className="h-6 w-6 text-coral-600" /> : pet.species === 'cat' ? <Cat className="h-6 w-6 text-coral-600" /> : <PawPrint className="h-6 w-6 text-coral-600" />}
                </div>
                <div><p className="font-medium">{pet.name}</p><p className="text-sm text-gray-500">{pet.breed || pet.species}</p></div>
              </div>
              {pet.weight && <p className="text-sm text-gray-500 mt-3">Peso: {pet.weight} kg</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Owners Section
function OwnersSection({ owners, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('owners', formData); setShowDialog(false); setFormData({ name: '', email: '', phone: '' }); onRefresh(); }
    catch (error) { alert(error.message); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Proprietari</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Aggiungi</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo Proprietario</DialogTitle></DialogHeader>
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
          <Card className="col-span-full"><CardContent className="p-8 text-center text-gray-500"><User className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun proprietario</p></CardContent></Card>
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

// ==================== OWNER DASHBOARD ====================
function OwnerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [pets, setPets] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [appts, docs, msgs, petsList] = await Promise.all([api.get('appointments'), api.get('documents'), api.get('messages'), api.get('pets')]);
      setAppointments(appts); setDocuments(docs); setMessages(msgs); setPets(petsList);
    } catch (error) { console.error('Error:', error); }
  };

  const NavItem = ({ icon: Icon, label, value }) => (
    <button onClick={() => setActiveTab(value)} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === value ? 'bg-coral-100 text-coral-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
      <Icon className="h-5 w-5" />{label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <VetBuddyLogo size={40} />
          <div><h1 className="font-bold text-coral-500">VetBuddy</h1><p className="text-xs text-gray-500">{user.name}</p></div>
        </div>
        <nav className="space-y-2 flex-1">
          <NavItem icon={Calendar} label="Appuntamenti" value="appointments" />
          <NavItem icon={FileText} label="Documenti" value="documents" />
          <NavItem icon={Inbox} label="Messaggi" value="messages" />
          <NavItem icon={PawPrint} label="I miei Animali" value="pets" />
        </nav>
        <Button variant="ghost" onClick={onLogout} className="mt-auto text-gray-600"><LogOut className="h-4 w-4 mr-2" />Esci</Button>
      </aside>

      <main className="flex-1 p-8">
        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">I miei Appuntamenti</h2>
            <div className="space-y-4">
              {appointments.length === 0 ? <Card><CardContent className="p-8 text-center text-gray-500"><Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun appuntamento</p></CardContent></Card> : appointments.map((appt) => (
                <Card key={appt.id}><CardContent className="p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="h-10 w-10 bg-coral-100 rounded-full flex items-center justify-center"><PawPrint className="h-5 w-5 text-coral-600" /></div><div><p className="font-medium">{appt.petName}</p><p className="text-sm text-gray-500">{appt.reason}</p></div></div><div className="text-right"><p className="font-medium">{appt.date}</p><p className="text-sm text-gray-500">{appt.time}</p></div></div></CardContent></Card>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'documents' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">I miei Documenti</h2>
            <div className="space-y-4">
              {documents.length === 0 ? <Card><CardContent className="p-8 text-center text-gray-500"><FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun documento</p></CardContent></Card> : documents.map((doc) => (
                <Card key={doc.id}><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 bg-coral-100 rounded-lg flex items-center justify-center"><FileText className="h-5 w-5 text-coral-600" /></div><div><p className="font-medium">{doc.name}</p><p className="text-sm text-gray-500">{doc.petName || 'N/A'}</p></div></div></CardContent></Card>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'messages' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Messaggi</h2>
            <Card><CardContent className="p-0">{messages.length === 0 ? <div className="p-8 text-center text-gray-500"><Inbox className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun messaggio</p></div> : <ScrollArea className="h-[400px]">{messages.map((msg) => <div key={msg.id} className="p-4 border-b"><p className="font-medium">{msg.subject}</p><p className="text-sm text-gray-500 mt-1">{msg.content}</p><p className="text-xs text-gray-400 mt-2">{new Date(msg.createdAt).toLocaleDateString()}</p></div>)}</ScrollArea>}</CardContent></Card>
          </div>
        )}
        {activeTab === 'pets' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">I miei Animali</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.length === 0 ? <Card className="col-span-full"><CardContent className="p-8 text-center text-gray-500"><PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun animale</p></CardContent></Card> : pets.map((pet) => (
                <Card key={pet.id}><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center">{pet.species === 'dog' ? <Dog className="h-6 w-6 text-coral-600" /> : pet.species === 'cat' ? <Cat className="h-6 w-6 text-coral-600" /> : <PawPrint className="h-6 w-6 text-coral-600" />}</div><div><p className="font-medium">{pet.name}</p><p className="text-sm text-gray-500">{pet.breed || pet.species}</p></div></div></CardContent></Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (token) {
      try { const userData = await api.get('auth/me'); setUser(userData); } 
      catch (error) { localStorage.removeItem('vetbuddy_token'); api.token = null; }
    }
    setLoading(false);
  };

  const handleLogout = () => { localStorage.removeItem('vetbuddy_token'); api.token = null; setUser(null); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coral-50">
        <div className="text-center"><VetBuddyLogo size={60} /><p className="mt-4 text-coral-700">Caricamento...</p></div>
      </div>
    );
  }

  if (!user) return <LandingPage onLogin={setUser} />;
  if (user.role === 'clinic') return <ClinicDashboard user={user} onLogout={handleLogout} />;
  return <OwnerDashboard user={user} onLogout={handleLogout} />;
}
