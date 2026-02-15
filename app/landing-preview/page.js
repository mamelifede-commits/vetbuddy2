'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AuthForm } from '@/app/components/auth';
import { 
  Building2, Phone, PawPrint, Menu, X, MapPin
} from 'lucide-react';

// New Brand Logo Component - Style 4 (Minimal with coral box)
const NewBrandLogo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    xs: { box: 'p-1.5 rounded-lg', icon: 'h-4 w-4', text: 'text-lg', gap: 'gap-1.5' },
    sm: { box: 'p-2 rounded-xl', icon: 'h-5 w-5', text: 'text-xl', gap: 'gap-2' },
    md: { box: 'p-3 rounded-2xl', icon: 'h-7 w-7', text: 'text-2xl', gap: 'gap-3' },
    lg: { box: 'p-4 rounded-2xl', icon: 'h-9 w-9', text: 'text-3xl', gap: 'gap-3' },
    xl: { box: 'p-5 rounded-3xl', icon: 'h-12 w-12', text: 'text-4xl', gap: 'gap-4' },
  };
  const s = sizes[size] || sizes.md;
  
  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <div className={`bg-gradient-to-br from-coral-500 to-rose-500 ${s.box} shadow-lg shadow-coral-500/30`}>
        <PawPrint className={`${s.icon} text-white`} />
      </div>
      {showText && (
        <div className={`font-bold ${s.text}`}>
          <span className="text-gray-900">vet</span>
          <span className="text-coral-500">buddy</span>
        </div>
      )}
    </div>
  );
};

export default function LandingPreviewPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const scrollToSection = (id) => { 
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); 
    setMobileMenuOpen(false); 
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Banner */}
      <div className="bg-purple-600 text-white text-center py-2.5 px-4 text-sm font-medium">
        <span>🔍 <strong>ANTEPRIMA LANDING PAGE</strong> - Questa è la versione completa della landing page nascosta</span>
      </div>
      
      {/* Banner Under Construction */}
      <div className="bg-amber-500 text-white text-center py-2.5 px-4 text-sm font-medium">
        <span>⚠️ <strong>Sito in costruzione</strong> - Ci stiamo preparando al lancio. Se ti registri, ti avviseremo quando saremo pronti!</span>
      </div>
      
      {/* Pilot Banner - Milano */}
      <div className="bg-gradient-to-r from-coral-500 to-orange-500 text-white text-center py-2.5 px-4 text-sm">
        <span className="font-semibold">🏙️ Pilot Milano</span> — Accesso su invito per cliniche selezionate.
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NewBrandLogo size="sm" />
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('funzionalita')} className="text-gray-600 hover:text-coral-500 transition">Funzionalità</button>
              <button onClick={() => scrollToSection('automazioni')} className="text-gray-600 hover:text-coral-500 transition">Automazioni</button>
              <button onClick={() => scrollToSection('fatturazione')} className="text-gray-600 hover:text-coral-500 transition">Fatturazione</button>
              <button onClick={() => scrollToSection('premi')} className="text-gray-600 hover:text-coral-500 transition">Premi</button>
              <button onClick={() => scrollToSection('pilot')} className="text-gray-600 hover:text-coral-500 transition">Prezzi</button>
              <a href="/presentazione" className="text-gray-600 hover:text-coral-500 transition">Brochure</a>
            </nav>
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>Accedi</Button>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Registrati</Button>
            </div>
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-4 px-4 shadow-lg">
            <nav className="flex flex-col gap-3">
              <button onClick={() => { scrollToSection('funzionalita'); setMobileMenuOpen(false); }} className="text-gray-600 text-left py-2 hover:text-coral-500 transition">Funzionalità</button>
              <button onClick={() => { scrollToSection('automazioni'); setMobileMenuOpen(false); }} className="text-gray-600 text-left py-2 hover:text-coral-500 transition">Automazioni</button>
              <button onClick={() => { scrollToSection('fatturazione'); setMobileMenuOpen(false); }} className="text-gray-600 text-left py-2 hover:text-coral-500 transition">Fatturazione</button>
              <button onClick={() => { scrollToSection('premi'); setMobileMenuOpen(false); }} className="text-gray-600 text-left py-2 hover:text-coral-500 transition">Premi</button>
              <button onClick={() => { scrollToSection('pilot'); setMobileMenuOpen(false); }} className="text-gray-600 text-left py-2 hover:text-coral-500 transition">Prezzi</button>
              <a href="/presentazione" className="text-gray-600 text-left py-2 hover:text-coral-500 transition block">Brochure</a>
              <hr className="my-2" />
              <Button variant="ghost" className="justify-start" onClick={() => { setAuthMode('login'); setShowAuth(true); setMobileMenuOpen(false); }}>Accedi</Button>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); setMobileMenuOpen(false); }}>Registrati</Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero - Messaggio chiaro per cliniche e proprietari */}
      <section className="pt-12 pb-12 px-4 bg-gradient-to-br from-white via-coral-50/30 to-blue-50/30 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-coral-300/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge Pilot */}
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md text-amber-800 px-4 py-2 rounded-full mb-6 border border-amber-200/50 shadow-lg">
            <MapPin className="h-4 w-4" />
            <span className="font-semibold">Pilot Milano — Accesso su invito</span>
          </div>
          
          {/* Headline principale */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            <span className="text-coral-500">Cliniche veterinarie</span> e <span className="text-blue-500">proprietari di pet</span> in un'unica piattaforma
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Gestisci appuntamenti, documenti e comunicazione in un'unica piattaforma. Zero carta, zero caos.
          </p>
          
          {/* CTA Buttons - Glassmorphism */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-coral-200/50 hover:bg-white/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <div className="h-14 w-14 bg-gradient-to-br from-coral-400 to-coral-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition shadow-lg">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Sono una Clinica</h3>
              <p className="text-sm text-gray-600 mb-3">Gestisci la tua clinica in modo efficiente</p>
              <span className="text-coral-500 text-sm font-semibold">Registrati ora →</span>
            </div>
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-blue-200/50 hover:bg-white/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition shadow-lg">
                <PawPrint className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Ho un Pet</h3>
              <p className="text-sm text-gray-600 mb-3">Tutti i documenti del tuo amico a 4 zampe</p>
              <span className="text-blue-500 text-sm font-semibold">Registrati ora →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funzionalita" className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Funzionalità principali</h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">Tutto quello che ti serve per gestire la tua clinica o i tuoi pet in un unico posto</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-6 w-6 text-coral-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Gestione Clinica</h3>
              <p className="text-gray-600 text-sm">Appuntamenti, pazienti, fatturazione e comunicazione in un'unica dashboard</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <PawPrint className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Profilo Pet</h3>
              <p className="text-gray-600 text-sm">Cartella clinica digitale, vaccinazioni, documenti e promemoria automatici</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Comunicazione</h3>
              <p className="text-gray-600 text-sm">Messaggi, notifiche email e WhatsApp per rimanere sempre connessi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <NewBrandLogo size="md" className="[&_span]:text-white" />
            <p className="text-gray-400 text-sm">© 2025 vetbuddy. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? '🔐 Accedi' : '📝 Registrati'}</DialogTitle>
            <DialogDescription>
              {authMode === 'login' ? 'Accedi al tuo account' : 'Crea un nuovo account'}
            </DialogDescription>
          </DialogHeader>
          <AuthForm mode={authMode} setMode={setAuthMode} onLogin={() => setShowAuth(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
