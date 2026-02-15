'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Google Maps iframe only - no SDK needed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Auth components (refactored)
import { AuthForm, ResetPasswordScreen, VerificationScreen } from '@/app/components/auth';
// Landing page components (refactored)
import { EcosystemToggle, FeatureCarousel, HomepageMapSection } from '@/app/components/landing';
// Common components (refactored)
import { VetBuddyLogo, AccessDenied, RoleBadge, ChatWidget, WelcomeScreen } from '@/app/components/common';
import api from '@/app/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
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
  Euro, Wallet, Camera, Edit, Trash2, Info, StarHalf, Image as ImageIcon, Scissors,
  BarChart3, Gift, Lock, Sparkles, UserPlus, PlusCircle, Loader2, Image,
  FolderArchive, BookOpen, GraduationCap, Newspaper, Link2, CalendarRange, Droplet, Archive,
  Smartphone, Navigation, Share2, Copy, Beaker, Save, CalendarX
} from 'lucide-react';

// Helper function for pet species info
const getPetSpeciesInfo = (species) => {
  const speciesMap = {
    dog: { emoji: '🐕', name: 'Cane', icon: Dog, color: 'blue' },
    cat: { emoji: '🐱', name: 'Gatto', icon: Cat, color: 'purple' },
    horse: { emoji: '🐴', name: 'Cavallo', icon: PawPrint, color: 'amber' },
    bird: { emoji: '🦜', name: 'Uccello', icon: PawPrint, color: 'green' },
    rabbit: { emoji: '🐰', name: 'Coniglio', icon: PawPrint, color: 'pink' },
    hamster: { emoji: '🐹', name: 'Criceto', icon: PawPrint, color: 'orange' },
    fish: { emoji: '🐠', name: 'Pesce', icon: PawPrint, color: 'cyan' },
    reptile: { emoji: '🦎', name: 'Rettile', icon: PawPrint, color: 'emerald' },
    other: { emoji: '🐾', name: 'Altro', icon: PawPrint, color: 'gray' }
  };
  return speciesMap[species] || speciesMap.other;
};

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


// Pet Avatar Component - Shows photo or species icon
const PetAvatar = ({ pet, size = 'md', onClick, className = '' }) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };
  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  const emojiSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl'
  };
  
  const speciesInfo = getPetSpeciesInfo(pet?.species);
  const colorMap = {
    blue: 'from-blue-100 to-blue-200',
    purple: 'from-purple-100 to-purple-200',
    amber: 'from-amber-100 to-amber-200',
    green: 'from-green-100 to-green-200',
    pink: 'from-pink-100 to-pink-200',
    orange: 'from-orange-100 to-orange-200',
    cyan: 'from-cyan-100 to-cyan-200',
    emerald: 'from-emerald-100 to-emerald-200',
    gray: 'from-gray-100 to-gray-200'
  };
  const iconColorMap = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    green: 'text-green-600',
    pink: 'text-pink-600',
    orange: 'text-orange-600',
    cyan: 'text-cyan-600',
    emerald: 'text-emerald-600',
    gray: 'text-gray-600'
  };
  
  if (pet?.photoUrl) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
      >
        <img 
          src={pet.photoUrl} 
          alt={pet.name || 'Pet'} 
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div 
          className={`w-full h-full bg-gradient-to-br ${colorMap[speciesInfo.color]} items-center justify-center hidden`}
        >
          <span className={emojiSizes[size]}>{speciesInfo.emoji}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`${sizeClasses[size]} bg-gradient-to-br ${colorMap[speciesInfo.color]} rounded-full flex items-center justify-center flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <span className={emojiSizes[size]}>{speciesInfo.emoji}</span>
    </div>
  );
};

// ==================== LANDING PAGE ====================
// ==================== COMING SOON LANDING ====================
function ComingSoonLanding({ onLogin }) {
  const [showTeamLogin, setShowTeamLogin] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Clean Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-coral-50 via-white to-sky-50"></div>
      
      {/* Soft decorative glow behind content */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-coral-200/20 rounded-full blur-3xl"></div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="text-center">
          {/* Logo Style 4 */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 bg-coral-400/20 rounded-full blur-3xl"></div>
            </div>
            <div className="relative flex items-center justify-center gap-5">
              <div className="p-4 bg-gradient-to-br from-coral-500 to-rose-500 rounded-2xl shadow-xl shadow-coral-500/30">
                <PawPrint className="h-12 w-12 text-white" />
              </div>
              <div>
                <span className="font-bold text-5xl md:text-6xl text-gray-900">vet</span>
                <span className="font-light text-5xl md:text-6xl text-coral-500">buddy</span>
              </div>
            </div>
          </div>
          
          {/* Coming Soon */}
          <div className="relative mt-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-coral-500 via-rose-500 to-cyan-500 bg-clip-text text-transparent">
              Coming Soon
            </h1>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="w-16 h-1 bg-gradient-to-r from-transparent via-coral-400 to-coral-500 rounded-full"></span>
              <span className="w-2.5 h-2.5 bg-coral-500 rounded-full"></span>
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full"></span>
              <span className="w-16 h-1 bg-gradient-to-l from-transparent via-cyan-400 to-cyan-500 rounded-full"></span>
            </div>
          </div>
        </div>
      </main>

      {/* Animated Golden Retriever - Rising slowly from bottom */}
      <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <img
          src="/animals/golden-retriever-user.png"
          alt="Golden Retriever"
          onLoad={() => setImageLoaded(true)}
          className={`h-[12vh] md:h-[16vh] w-auto object-contain transition-all ease-out ${
            imageLoaded 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-[150%] opacity-0'
          }`}
          style={{
            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))',
            maxHeight: '18vh',
            transitionDuration: '3500ms'
          }}
        />
      </div>

      {/* Footer */}
      <footer className="relative z-30 py-6 px-4 bg-white/60 backdrop-blur-sm border-t border-white/50">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2025 vetbuddy</p>
          <button 
            onClick={() => setShowTeamLogin(true)}
            className="text-xs text-gray-400 hover:text-coral-500 transition-colors"
          >
            Accesso Team
          </button>
        </div>
      </footer>

      {/* Team Login Dialog */}
      <Dialog open={showTeamLogin} onOpenChange={setShowTeamLogin}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🔐 Accesso Team</DialogTitle>
            <DialogDescription>Area riservata al team di sviluppo</DialogDescription>
          </DialogHeader>
          <AuthForm mode={authMode} setMode={setAuthMode} onLogin={(user) => { setShowTeamLogin(false); onLogin(user); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== FULL LANDING PAGE ====================

function FullLandingPage({ onLogin }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const scrollToSection = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); };

  // Auto-open login if there's a pending email action
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAction = sessionStorage.getItem('vetbuddy_email_action');
      if (savedAction) {
        try {
          const actionData = JSON.parse(savedAction);
          setPendingAction(actionData);
          // Auto-open login dialog
          setAuthMode('login');
          setShowAuth(true);
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  // Get action message for display
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

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Under Construction */}
      <div className="bg-amber-500 text-white text-center py-2.5 px-4 text-sm font-medium">
        <span>⚠️ <strong>Sito in costruzione</strong> - Ci stiamo preparando al lancio. Se ti registri, ti avviseremo quando saremo pronti!</span>
      </div>
      {/* Pilot Banner - Milano */}
      <div className="bg-gradient-to-r from-coral-500 to-orange-500 text-white text-center py-2.5 px-4 text-sm">
        <span className="font-semibold">🏙️ Pilot Milano</span> — Accesso su invito per cliniche selezionate. <button onClick={() => scrollToSection('pilot')} className="underline font-semibold ml-1">Candidati →</button>
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
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md text-amber-800 px-4 py-2 rounded-full mb-6 border border-amber-200/50 shadow-lg animate-fade-in-up">
            <MapPin className="h-4 w-4" />
            <span className="font-semibold">Pilot Milano — Accesso su invito</span>
          </div>
          
          {/* Headline principale */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight animate-fade-in-up animate-delay-100">
            <span className="text-coral-500">Cliniche veterinarie</span> e <span className="text-blue-500">proprietari di pet</span> in un'unica piattaforma
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
            Gestisci appuntamenti, documenti e comunicazione in un'unica piattaforma. Zero carta, zero caos.
          </p>
          
          {/* CTA Buttons - Glassmorphism */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-coral-200/50 hover:bg-white/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group animate-fade-in-left animate-delay-300" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <div className="h-14 w-14 bg-gradient-to-br from-coral-400 to-coral-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition shadow-lg">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Per Cliniche Veterinarie</h3>
              <p className="text-sm text-gray-600 mb-3">Dashboard completa, inbox team, documenti, reportistica.</p>
              <p className="text-xs text-amber-600 font-semibold mb-3">🎫 Pilot: 90 giorni gratuiti su invito</p>
              <Button className="w-full bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white shadow-lg">
                Richiedi Invito →
              </Button>
            </div>
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-blue-200/50 hover:bg-white/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group animate-fade-in-right animate-delay-300" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition shadow-lg">
                <PawPrint className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Per Proprietari di Animali</h3>
              <p className="text-sm text-gray-600 mb-3">Prenota visite, ricevi documenti, invita la tua clinica.</p>
              <p className="text-xs text-blue-600 font-semibold mb-3">🆓 Gratis per sempre • Invita la tua clinica</p>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
                Esplora la Demo →
              </Button>
            </div>
          </div>
          
          {/* Freelancer callout */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 max-w-2xl mx-auto mb-6 animate-fade-in-up animate-delay-400 cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-900 text-sm">Sei un veterinario freelance?</p>
                <p className="text-xs text-gray-600">Registrati come clinica e inizia con il <span className="font-bold text-purple-600">Piano Starter gratuito</span>. Ideale per gestire i tuoi clienti in autonomia!</p>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white flex-shrink-0">
                Richiedi Invito →
              </Button>
            </div>
          </div>
          
          {/* Trust indicators */}
          <p className="text-sm text-gray-400">Pilot attivo a Milano e provincia • Accesso prioritario per cliniche selezionate</p>
        </div>
      </section>

      {/* COSA CI RENDE UNICI - Sezione unificata e compatta */}
      <section id="funzionalita" className="py-16 px-4 bg-gradient-to-br from-gray-50 via-white to-coral-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-4">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Tutto in una piattaforma</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Non il solito gestionale veterinario
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Funzionalità pensate per risparmiare tempo e lavorare meglio. Cliniche e proprietari connessi.
            </p>
          </div>

          {/* Feature Grid - 7 features chiave */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Agenda */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <CalendarDays className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Agenda Intelligente</h3>
              <p className="text-gray-600 text-sm mb-4">Calendario settimanale con colori per veterinario. Drag & drop appuntamenti, 10+ tipi di visita.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Multi-veterinario</Badge>
                <Badge variant="outline" className="text-xs">Drag & drop</Badge>
              </div>
            </div>

            {/* Automazioni */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all group relative">
              <div className="absolute -top-3 right-4 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                44+ attive
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Automazioni AI</h3>
              <p className="text-gray-600 text-sm mb-4">Promemoria, richiami vaccini, follow-up, auguri compleanno pet. Tutto automatico, 24/7.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">-80% telefonate</Badge>
                <Badge variant="outline" className="text-xs">+40% ritorno</Badge>
              </div>
            </div>

            {/* Team Inbox */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-14 w-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <Inbox className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Team Inbox</h3>
              <p className="text-gray-600 text-sm mb-4">Tutti i messaggi in un unico posto. Assegna ticket, segui le conversazioni, rispondi velocemente.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Ticket system</Badge>
                <Badge variant="outline" className="text-xs">Quick replies</Badge>
              </div>
            </div>

            {/* Video Consulto */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all group relative">
              <div className="absolute -top-3 right-4 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                Novità
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <Video className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Video Consulto</h3>
              <p className="text-gray-600 text-sm mb-4">Consulenze online con un click. Link automatico al cliente, nessun software esterno.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">1-click</Badge>
                <Badge variant="outline" className="text-xs">HD Quality</Badge>
              </div>
            </div>

            {/* Documenti */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-14 w-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Documenti Cloud</h3>
              <p className="text-gray-600 text-sm mb-4">Referti, prescrizioni, fatture. Upload drag & drop, firma digitale, invio 1-click ai clienti.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Firma digitale</Badge>
                <Badge variant="outline" className="text-xs">Invio email</Badge>
              </div>
            </div>

            {/* Template */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-coral-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-14 w-14 bg-gradient-to-br from-coral-400 to-coral-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <ClipboardList className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Template Smart</h3>
              <p className="text-gray-600 text-sm mb-4">Messaggi pre-compilati con variabili automatiche. Nome cliente, pet, data, orario... tutto al suo posto.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">WhatsApp</Badge>
                <Badge variant="outline" className="text-xs">Email</Badge>
              </div>
            </div>

            {/* Report */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-cyan-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-14 w-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Report & Analytics</h3>
              <p className="text-gray-600 text-sm mb-4">Fatturato, appuntamenti, no-show, clienti top. Export CSV, grafici interattivi, trend mensili.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Export CSV</Badge>
                <Badge variant="outline" className="text-xs">Dashboard</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TROVA CLINICA - Google Maps Interattiva */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 via-white to-coral-50/30 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Per i proprietari</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Trova la clinica <span className="text-blue-500">più vicina</span>
              </h2>
              <p className="text-gray-600 mb-6">
                I tuoi clienti possono trovarti facilmente sulla mappa. Vedono distanza in tempo reale, orari e servizi disponibili.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Geolocalizzazione GPS automatica</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Calcolo distanza in tempo reale</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-coral-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 text-coral-600" />
                  </div>
                  <span className="text-gray-700">Servizi e specializzazioni visibili</span>
                </li>
              </ul>
              <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
                Trova clinica vicino a te →
              </Button>
            </div>
            
            {/* Google Maps Interattiva */}
            <HomepageMapSection />
          </div>
        </div>
      </section>

      {/* Come Funziona - Semplificato */}
      <section className="py-12 px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden relative" id="come-funziona">
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-green-300/20 rounded-full blur-2xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-6">
            <p className="text-coral-500 font-semibold mb-2">PERCHÉ VETBUDDY</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Le feature che ci distinguono</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Strumenti progettati per semplificare il lavoro quotidiano della clinica e migliorare l'esperienza dei tuoi clienti.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            {/* Feature 1 - Team Inbox */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-purple-200/50 hover:bg-white/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg animate-float" style={{animationDelay: '0s'}}>
                  <Inbox className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Team Inbox con assegnazione ticket</h3>
                  <p className="text-gray-600 mb-3">Una inbox condivisa per tutto lo staff. Assegna richieste, evita doppioni, traccia chi risponde. Niente messaggi persi.</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50/50">Anti-doppioni</Badge>
                    <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50/50">Assegnazione staff</Badge>
                    <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50/50">Storico completo</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature 2 - Documenti automatici */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-200/50 hover:bg-white/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg animate-float" style={{animationDelay: '0.5s'}}>
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Documenti: upload e invio automatico</h3>
                  <p className="text-gray-600 mb-3">Carica PDF (referti, prescrizioni, fatture) e inviali automaticamente via email al proprietario. Tutto tracciato.</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50/50">Upload PDF</Badge>
                    <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50/50">Email automatica</Badge>
                    <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50/50">Archivio clinico</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature 3 - Prenotazioni + Video */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-blue-200/50 hover:bg-white/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg animate-float" style={{animationDelay: '1s'}}>
                  <CalendarCheck className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Prenotazioni + Video + Google Calendar</h3>
                  <p className="text-gray-600 mb-3">Agenda sincronizzata, video-consulti integrati, reminder automatici via email/SMS. I clienti prenotano 24/7.</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50/50">Sync Google Calendar</Badge>
                    <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50/50">Video-consulti</Badge>
                    <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50/50">Reminder auto</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature 4 - Reportistica */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-200/50 hover:bg-white/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg animate-float" style={{animationDelay: '1.5s'}}>
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Reportistica clinica completa</h3>
                  <p className="text-gray-600 mb-3">Dashboard con metriche chiave: clienti attivi, fatturato, tempi di risposta, no-show. Prendi decisioni basate sui dati.</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50/50">Analytics</Badge>
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50/50">Report no-show</Badge>
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50/50">Trend fatturato</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Altre Funzionalità - Carousel */}
      <section className="py-6 px-4 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">E molto altro...</h2>
          </div>
          
          {/* Carousel Container */}
          <FeatureCarousel />
        </div>
      </section>


      {/* Potenzialità / Vision */}
      <section className="py-12 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
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
        </div>
      </section>

      {/* 🤖 SEZIONE AUTOMAZIONI */}
      <section id="automazioni" className="py-16 px-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-4">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Zero stress, tutto automatico</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Riduci il <span className="text-purple-600">carico di lavoro</span> del 70%
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Basta telefonate, promemoria manuali e clienti che dimenticano gli appuntamenti. 
              <strong> VetBuddy lavora mentre tu curi gli animali.</strong>
            </p>
          </div>

          {/* Hero stats - impatto sul lavoro */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white rounded-xl p-4 text-center shadow-md border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-1">-80%</div>
              <p className="text-sm text-gray-600">Telefonate per promemoria</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">-60%</div>
              <p className="text-sm text-gray-600">No-show e appuntamenti persi</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md border border-amber-100">
              <div className="text-3xl font-bold text-amber-600 mb-1">+40%</div>
              <p className="text-sm text-gray-600">Clienti che tornano</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-1">2h/giorno</div>
              <p className="text-sm text-gray-600">Risparmiate in media</p>
            </div>
          </div>

          {/* Striscia 44+ automazioni - SOPRA le card */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">🎯 44+ automazioni disponibili</h3>
                <p className="text-purple-200">Antiparassitari, refill farmaci, lista d'attesa, richiesta recensioni, alert stagionali e molto altro...</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="text-center bg-white/10 rounded-lg px-6 py-3">
                  <p className="text-3xl font-bold">24/7</p>
                  <p className="text-purple-200 text-sm">Sempre attive</p>
                </div>
                <p className="text-xs text-purple-300">Attiva solo quelle che ti servono</p>
              </div>
            </div>
          </div>

          {/* Automazioni che riducono il carico */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Promemoria automatici */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200 hover:shadow-xl transition-shadow relative">
              <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                🔥 Più richiesta
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mt-2">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">📱 Promemoria Automatici</h3>
              <p className="text-gray-600 text-sm mb-3">Mai più telefonate per ricordare gli appuntamenti. Email e SMS partono da soli 24h prima.</p>
              <div className="bg-green-50 rounded-lg p-3 text-sm">
                <span className="text-green-700 font-medium">💡 Risparmio:</span>
                <span className="text-green-600"> 15+ chiamate/giorno</span>
              </div>
            </div>

            {/* Richiamo vaccini */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-shadow relative">
              <div className="absolute -top-3 left-4 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                💰 Più fatturato
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mt-2">
                <Syringe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">💉 Richiamo Vaccini</h3>
              <p className="text-gray-600 text-sm mb-3">I clienti ricevono il promemoria 30 giorni prima della scadenza. Tu non devi ricordarti nulla.</p>
              <div className="bg-blue-50 rounded-lg p-3 text-sm">
                <span className="text-blue-700 font-medium">💡 Risultato:</span>
                <span className="text-blue-600"> +35% richiami rispettati</span>
              </div>
            </div>

            {/* Conferme prenotazione */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">✅ Conferme Istantanee</h3>
              <p className="text-gray-600 text-sm mb-3">Appena il cliente prenota, riceve subito la conferma con tutti i dettagli. Zero lavoro per te.</p>
              <div className="bg-purple-50 rounded-lg p-3 text-sm">
                <span className="text-purple-700 font-medium">💡 Automatico:</span>
                <span className="text-purple-600"> 100% delle prenotazioni</span>
              </div>
            </div>

            {/* Follow-up post visita */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-coral-100 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-coral-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">💝 Follow-up Post Visita</h3>
              <p className="text-gray-600 text-sm mb-3">48h dopo la visita, il cliente riceve un messaggio per sapere come sta il pet. Cura e attenzione automatiche.</p>
              <div className="bg-coral-50 rounded-lg p-3 text-sm">
                <span className="text-coral-700 font-medium">💡 Effetto:</span>
                <span className="text-coral-600"> Clienti più fedeli</span>
              </div>
            </div>

            {/* No-show detection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">🚫 Anti No-Show</h3>
              <p className="text-gray-600 text-sm mb-3">Identifica automaticamente chi non si presenta e tiene traccia per gestire i recidivi.</p>
              <div className="bg-red-50 rounded-lg p-3 text-sm">
                <span className="text-red-700 font-medium">💡 Recupero:</span>
                <span className="text-red-600"> Slot persi ridotti del 60%</span>
              </div>
            </div>

            {/* Compleanno Pet */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">🎂 Auguri Automatici</h3>
              <p className="text-gray-600 text-sm mb-3">Email di auguri per il compleanno del pet con eventuale sconto. I clienti adorano questo tocco personale!</p>
              <div className="bg-amber-50 rounded-lg p-3 text-sm">
                <span className="text-amber-700 font-medium">💡 Engagement:</span>
                <span className="text-amber-600"> +25% prenotazioni</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Import Dati Section */}
      <section id="import" className="py-16 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4 font-semibold">
              MIGRAZIONE FACILE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Importa i tuoi Pazienti Esistenti</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Passa a VetBuddy senza perdere nulla. Importa in pochi click i dati dal tuo gestionale attuale.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Features */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Import da CSV/Excel</h3>
                  <p className="text-gray-600 text-sm">Esporta dal tuo gestionale e carica su VetBuddy. Supportiamo tutti i formati comuni.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Proprietari + Animali + Vaccini</h3>
                  <p className="text-gray-600 text-sm">Importa tutto in un colpo solo: anagrafica, dati sanitari, storico vaccinazioni.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Upload className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Documenti con Abbinamento Auto</h3>
                  <p className="text-gray-600 text-sm">Carica referti ed esami. VetBuddy li associa automaticamente ai pazienti giusti.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">100% Sicuro e Conforme GDPR</h3>
                  <p className="text-gray-600 text-sm">I dati sono criptati e trattati secondo le normative europee sulla privacy.</p>
                </div>
              </div>
            </div>
            
            {/* Right: Visual Demo */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Import Wizard</h4>
                    <p className="text-xs text-gray-500">4 semplici passaggi</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">1</div>
                    <span className="text-sm text-green-800">Scarica template CSV</span>
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">2</div>
                    <span className="text-sm text-green-800">Compila con i tuoi dati</span>
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">3</div>
                    <span className="text-sm text-blue-800">Carica il file</span>
                    <Loader2 className="h-4 w-4 text-blue-500 ml-auto animate-spin" />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">4</div>
                    <span className="text-sm text-gray-500">Aggiungi documenti (opzionale)</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t text-center">
                  <p className="text-sm text-gray-500 mb-3">Esempio risultato import:</p>
                  <div className="flex justify-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">127</p>
                      <p className="text-xs text-gray-500">Pazienti</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">89</p>
                      <p className="text-xs text-gray-500">Proprietari</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">234</p>
                      <p className="text-xs text-gray-500">Vaccini</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm mb-4">Supportiamo import da:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="bg-white px-4 py-2 rounded-full shadow border text-gray-700 font-medium">📄 CSV</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border text-gray-700 font-medium">📊 Excel (.xlsx)</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border text-gray-700 font-medium">📑 PDF (documenti)</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border text-gray-700 font-medium">🖼️ Immagini (JPG, PNG)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sistema Fatturazione Section */}
      <section id="fatturazione" className="py-16 px-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4 font-semibold">
              FATTURAZIONE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fatturazione <span className="text-green-600">Flessibile</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Crea fatture direttamente in VetBuddy ed esportale nel formato che preferisci. 
              <strong> Integra con il tuo software di fatturazione</strong> o usa il nostro sistema.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Opzione 1: Export per software esterni */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                  <Download className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Esporta per il Tuo Software</h3>
                  <p className="text-sm text-green-600">Usa il tuo sistema preferito</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Crea le fatture in VetBuddy ed esportale in CSV, JSON o PDF. 
                Importale nel tuo software di fatturazione elettronica per l'invio al Sistema di Interscambio (SdI).
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700"><strong>Export CSV</strong> - Compatibile con Excel e gestionali</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700"><strong>Export PDF</strong> - Fattura professionale stampabile</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700"><strong>Export JSON</strong> - Per integrazione API</span>
                </li>
              </ul>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  💡 <strong>Software compatibili:</strong> Fatture in Cloud, TeamSystem, Aruba, 
                  Zucchetti, Buffetti, e qualsiasi software che accetta import CSV/Excel.
                </p>
              </div>
            </div>

            {/* Opzione 2: Funzionalità integrate */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-emerald-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                  <Receipt className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Sistema Integrato VetBuddy</h3>
                  <p className="text-sm text-emerald-600">Tutto in un unico posto</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Gestisci tutto direttamente in VetBuddy: listino prezzi, creazione fatture, 
                tracciamento pagamenti e statistiche finanziarie.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700"><strong>Listino Prezzi</strong> - Crea e gestisci le tue tariffe</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700"><strong>Fatture Rapide</strong> - Seleziona cliente e prestazioni</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700"><strong>Dashboard Finanziaria</strong> - Fatturato, pagati, in attesa</span>
                </li>
              </ul>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  📊 <strong>Calcolo automatico:</strong> IVA 22%, marca da bollo per importi {'>'} €77.47, 
                  numerazione progressiva.
                </p>
              </div>
            </div>
          </div>

          {/* Come funziona il flusso */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
              📋 Come Funziona: Da VetBuddy al Tuo Software
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Crea Fattura</p>
                <p className="text-xs text-gray-500">Seleziona cliente e prestazioni in VetBuddy</p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Esporta CSV/PDF</p>
                <p className="text-xs text-gray-500">Un click per scaricare i dati</p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Importa nel Tuo SW</p>
                <p className="text-xs text-gray-500">Fatture in Cloud, TeamSystem, etc.</p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-600 font-bold">4</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Invio al SdI</p>
                <p className="text-xs text-gray-500">Il tuo software invia all'Agenzia Entrate</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 text-center">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>Nota importante:</strong> Le fatture VetBuddy sono <strong>pre-fatture/proforma</strong>. 
                Per essere valide fiscalmente devono essere inviate al SdI tramite un software certificato.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <p className="text-gray-600 mb-4">Formati di export disponibili:</p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <span className="bg-white px-4 py-2 rounded-full shadow border border-green-200 text-green-700 font-medium">📄 CSV (Excel)</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border border-blue-200 text-blue-700 font-medium">📑 PDF</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border border-purple-200 text-purple-700 font-medium">💾 JSON (API)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Premi Fedeltà Section */}
      <section id="premi" className="py-16 px-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-4 font-semibold">
              NOVITÀ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Premi Fedeltà</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Le cliniche possono premiare i clienti più fedeli. Sconti, servizi gratuiti e regali speciali direttamente dalla tua clinica di fiducia.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: For Pet Owners */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-amber-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <PawPrint className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Per i Proprietari</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Ricevi <strong>premi fedeltà</strong> dalla tua clinica</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Sconti %, servizi gratis, prodotti omaggio</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Notifica email quando ricevi un premio</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Sezione dedicata "I Miei Premi" nella dashboard</span>
                </li>
              </ul>
              <p className="mt-6 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                💡 <strong>100% gratuito</strong> per i proprietari. È la clinica che decide quando premiarti!
              </p>
            </div>
            
            {/* Right: For Clinics */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-coral-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Per le Cliniche</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="h-4 w-4 text-coral-600" />
                  </div>
                  <span className="text-gray-700">Crea <strong>tipi di premio</strong> personalizzati</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="h-4 w-4 text-coral-600" />
                  </div>
                  <span className="text-gray-700">Assegna premi ai clienti più fedeli</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="h-4 w-4 text-coral-600" />
                  </div>
                  <span className="text-gray-700">Email automatica di notifica al cliente</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="h-4 w-4 text-coral-600" />
                  </div>
                  <span className="text-gray-700">Traccia premi assegnati e utilizzati</span>
                </li>
              </ul>
              <p className="mt-6 text-sm text-gray-500 bg-coral-50 p-3 rounded-lg">
                🎯 <strong>Fidelizza i clienti</strong> e aumenta il ritorno. I premi creano legame!
              </p>
            </div>
          </div>
          
          {/* Example Rewards */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-6">Esempi di premi che puoi creare:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-white px-4 py-2 rounded-full shadow border border-amber-200 text-amber-700 font-medium">🏷️ -10% prossima visita</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border border-green-200 text-green-700 font-medium">🎁 Visita gratuita</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border border-blue-200 text-blue-700 font-medium">💊 Antiparassitario omaggio</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border border-purple-200 text-purple-700 font-medium">✂️ Toelettatura gratis</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border border-pink-200 text-pink-700 font-medium">🎂 Regalo compleanno pet</span>
            </div>
          </div>
        </div>
      </section>

      {/* Come Funziona */}
      <section id="come-funziona" className="py-12 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-coral-500 font-semibold mb-2">COME FUNZIONA</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Due app, un ecosistema</h2>
          </div>
          
          {/* Toggle Tabs Component */}
          <EcosystemToggle />
        </div>
      </section>

      {/* Beta Test Section */}
      <section id="pilot" className="py-12 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-4">
              <Zap className="h-4 w-4" />
              <span className="font-semibold">Beta Test 2025</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Accedi al Pilot VetBuddy</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Stiamo testando l'app con cliniche veterinarie selezionate a Milano. <strong>Candidati per 90 giorni gratuiti (estendibili a 6 mesi) e aiutaci a costruire il futuro.</strong></p>
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

          {/* Pricing Cards - Pilot Coherence */}
          <p className="text-center text-sm text-gray-600 mb-10">Piani disponibili solo tramite Pilot (su invito). Prezzi IVA esclusa.</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-4">
            {/* Starter - Piano base con automazioni essenziali */}
            <Card className="border-2 border-green-200 hover:border-green-300 transition-colors relative flex flex-col">
              {/* Badge Freelance */}
              <div className="absolute -top-3 left-4 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap">👨‍⚕️ IDEALE PER FREELANCE</div>
              <CardHeader className="pt-6 pb-4">
                <CardTitle className="flex items-center gap-2">Starter <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">GRATUITO</span></CardTitle>
                <CardDescription>Per iniziare con le automazioni essenziali</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-green-600">Gratis</span>
                  <p className="text-xs text-gray-500 mt-1">per sempre – su invito Pilot Milano</p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-0">
                <p className="text-xs font-medium text-gray-700 mb-3">Include:</p>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>1 sede, 1 utente</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span className="underline decoration-purple-300 decoration-2">Fino a 50 pazienti</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Agenda base</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Posizione su mappa</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span><strong>5 Automazioni base</strong></span></li>
                  <li className="flex items-center gap-2 text-gray-400"><X className="h-4 w-4 text-gray-300 flex-shrink-0" /> <span>Team Inbox</span></li>
                  <li className="flex items-center gap-2 text-gray-400"><X className="h-4 w-4 text-gray-300 flex-shrink-0" /> <span>Report avanzati</span></li>
                </ul>
                <div className="mt-auto pt-4 border-t">
                  <Button className="w-full bg-green-500 hover:bg-green-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Richiedi Invito →</Button>
                  <p className="text-xs text-gray-500 mt-3 text-center">Nessuna carta richiesta</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Pilot - Piano principale (Pro) */}
            <Card className="border-2 border-coral-500 relative shadow-lg scale-105 flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap">⭐ PILOT MILANO</div>
              <CardHeader className="pt-6 pb-4">
                <CardTitle className="text-coral-500">Pro</CardTitle>
                <CardDescription>Per cliniche che vogliono crescere</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-coral-500">€0</span>
                  <span className="text-lg text-gray-400 line-through ml-2">€129/mese</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-0">
                <p className="text-xs font-medium text-gray-700 mb-3">Include tutto di Starter più:</p>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Fino a 5 utenti staff</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Pazienti illimitati</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span><strong>20 Automazioni</strong></span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Team Inbox + ticket</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Documenti + invio email</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Google Calendar sync</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Report settimanali</span></li>
                </ul>
                <div className="mt-auto pt-4 border-t">
                  <Button className="w-full bg-coral-500 hover:bg-coral-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
                    Richiedi Invito →
                  </Button>
                  <p className="text-xs text-gray-500 mt-3 text-center">Dopo il Pilot: €129/mese + IVA</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Custom - Piano enterprise */}
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-white to-purple-50 flex flex-col">
              <CardHeader className="pt-6 pb-4">
                <CardTitle className="text-purple-700">Custom</CardTitle>
                <CardDescription>Per cliniche che vogliono il massimo</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-purple-600">Su misura</span>
                  <p className="text-xs text-purple-500 mt-1">Contattaci per un preventivo</p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-0">
                <p className="text-xs font-medium text-gray-700 mb-3">Include tutto di Pro più:</p>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span>Utenti illimitati</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span>Multi-sede</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span><strong>44+ Automazioni complete</strong></span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span>WhatsApp Business</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span>API dedicata</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span>SLA garantito 99.9%</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span>Onboarding dedicato</span></li>
                </ul>
                <div className="mt-auto pt-4 border-t">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => scrollToSection('contatti')}>Richiedi Invito →</Button>
                  <p className="text-xs text-gray-500 mt-3 text-center">Prezzi IVA esclusa</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-xs text-gray-500 mt-8 mb-4">Non è una prova libera: stiamo selezionando un numero limitato di cliniche.</p>
        </div>
      </section>

      {/* Contact Form for Enterprise */}
      <section id="contatti" className="py-12 px-4 bg-white">
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
      <section id="faq" className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-gray-900 mb-4">Domande frequenti</h2></div>
          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: 'Cos\'è il Pilot e come funziona l\'invito?', a: 'VetBuddy è in fase Pilot a Milano. L\'accesso è su invito per garantire qualità e supporto dedicato. Candidati compilando il form e ti contatteremo per l\'attivazione.' },
              { q: 'Quanto dura il Pilot gratuito?', a: '90 giorni iniziali gratuiti per tutte le cliniche selezionate nel Pilot Milano. Estendibile fino a 6 mesi per le cliniche più attive che completano l\'onboarding e forniscono feedback. Al termine, potrai scegliere il piano più adatto alle tue esigenze (a partire da €129/mese + IVA).' },
              { q: 'Quanto costa per i proprietari?', a: 'VetBuddy è e sarà sempre gratuito per i proprietari di animali. Nessun costo nascosto, mai.' },
              { q: 'Come funziona la fatturazione?', a: 'Gli abbonamenti vengono fatturati da VetBuddy. Prezzi IVA esclusa. Riceverai report e riconciliazione mensile. Puoi disdire in qualsiasi momento.' },
              { q: 'Cosa include il piano Pro?', a: 'Team inbox con assegnazione ticket, documenti con invio automatico via email, sync Google Calendar, video-consulti, reminder automatici, pagamenti integrati, reportistica completa e supporto prioritario.' },
              { q: 'Come funziona l\'invio documenti?', a: 'Carichi un PDF (referto, prescrizione, fattura), selezioni cliente e animale, e il documento viene inviato automaticamente via email. Il cliente lo ritrova anche nell\'app.' },
              { q: 'I documenti sono sicuri?', a: 'Sì. I documenti sono crittografati, accessibili solo dalla clinica e dal proprietario autorizzato. Rispettiamo GDPR e normative privacy.' },
              { q: 'Posso esplorare l\'app prima di candidarmi?', a: 'Sì! Registrati come proprietario per esplorare la demo. Vedrai le funzionalità ma nota: le cliniche nell\'app demo non sono ancora affiliate realmente.' },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-lg px-6 border">
                <AccordionTrigger className="text-left font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA - Invita la tua clinica */}
      <section className="py-10 px-4 bg-gradient-to-r from-coral-500 to-orange-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Pilot Milano</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Non trovi la tua clinica?</h2>
          <p className="text-coral-100 mb-8 text-lg">Siamo in fase pilot a Milano. Invita il tuo veterinario a unirsi a VetBuddy!</p>
          <Button size="lg" className="bg-white text-coral-500 hover:bg-coral-50 h-14 px-8 text-lg" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
            <Mail className="h-5 w-5 mr-2" />Invita la tua clinica
          </Button>
        </div>
      </section>

      {/* Footer - Semplificato */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <NewBrandLogo size="xs" className="text-white [&>div:last-child>span]:text-white" />
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span>🏙️ Pilot Milano</span>
              <span>•</span>
              <span>🇮🇹 Made in Italy</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-white">Privacy</a>
              <a href="/termini" className="hover:text-white">Termini</a>
              <a href="/cookie-policy" className="hover:text-white">Cookie</a>
              <a href="mailto:info@vetbuddy.it" className="hover:text-white">info@vetbuddy.it</a>
            </div>
          </div>
          <p className="text-center text-gray-500 text-xs mt-4">© 2026 VetBuddy. Tutti i diritti riservati.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          {pendingAction && (
            <div className="bg-coral-50 border border-coral-200 rounded-lg p-3 mb-4">
              <p className="text-coral-700 text-sm font-medium">{getActionMessage()}</p>
            </div>
          )}
          <AuthForm mode={authMode} setMode={setAuthMode} onLogin={(user) => { setShowAuth(false); onLogin(user); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== LANDING PAGE WRAPPER (Switch) ====================
// Set NEXT_PUBLIC_COMING_SOON=true in .env to show Coming Soon page
// Set NEXT_PUBLIC_COMING_SOON=false (or remove) to show Full Landing Page
function LandingPage({ onLogin }) {
  const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === 'true';
  
  if (isComingSoon) {
    return <ComingSoonLanding onLogin={onLogin} />;
  }
  return (
    <>
      <FullLandingPage onLogin={onLogin} />
      <ChatWidget />
    </>
  );
}

function ClinicDashboard({ user, onLogout, emailAction, onClearEmailAction }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [staff, setStaff] = useState([]);
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [rewards, setRewards] = useState([]); // Premi assegnati
  const [setupProgress, setSetupProgress] = useState({ payments: false, video: false, team: false, automations: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Stati per aprire pet/owner da altre sezioni
  const [selectedPetFromOwner, setSelectedPetFromOwner] = useState(null);
  const [selectedOwnerFromPet, setSelectedOwnerFromPet] = useState(null);
  
  // Funzioni callback per navigazione tra pet e owner
  const handleOpenPetFromOwner = (pet) => {
    setSelectedPetFromOwner(pet);
    setActiveTab('patients');
  };
  
  const handleOpenOwnerFromPet = (owner) => {
    setSelectedOwnerFromPet(owner);
    setActiveTab('owners');
  };
  
  // Handle email action parameters for clinic
  useEffect(() => {
    if (emailAction && emailAction.action) {
      switch (emailAction.action) {
        case 'message':
          setActiveTab('messages');
          break;
        default:
          break;
      }
      if (onClearEmailAction) onClearEmailAction();
    }
  }, [emailAction, onClearEmailAction]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [appts, docs, msgs, staffList, petsList, ownersList, rewardsList] = await Promise.all([
        api.get('appointments'), api.get('documents'), api.get('messages'),
        api.get('staff'), api.get('pets'), api.get('owners'),
        api.get('rewards/assigned').catch(() => [])
      ]);
      setAppointments(appts); setDocuments(docs); setMessages(msgs);
      setStaff(staffList); setPets(petsList); setOwners(ownersList);
      setRewards(rewardsList || []);
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
    <button onClick={() => { setActiveTab(value); setMobileMenuOpen(false); }} 
      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${activeTab === value ? 'bg-coral-100 text-coral-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
      <div className="flex items-center gap-3"><Icon className="h-5 w-5" />{label}</div>
      {badge > 0 && <Badge className="bg-coral-500 text-white text-xs">{badge}</Badge>}
    </button>
  );

  const unreadMessages = messages.filter(m => !m.read).length;
  const completedSteps = Object.values(setupProgress).filter(Boolean).length;
  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <NewBrandLogo size="xs" showText={false} />
          <div>
            <h1 className="font-bold text-sm"><span className="text-gray-900">vet</span><span className="text-coral-500">buddy</span></h1>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.clinicName || 'Clinica'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-500 hover:text-red-600">
            <LogOut className="h-4 w-4" />
          </Button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Dark backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-[55]" 
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className="md:hidden fixed left-0 right-0 top-[57px] bottom-0 bg-white z-[60] p-4 overflow-y-auto shadow-xl animate-in slide-in-from-top duration-200">
            <div className="mb-2"><RoleBadge role="clinic" /></div>
            <Badge variant="outline" className="mb-4 justify-center text-amber-600 border-amber-300 bg-amber-50 w-full"><AlertCircle className="h-3 w-3 mr-1" /> Modalità Pilot</Badge>
            <nav className="space-y-1">
              <NavItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
              <NavItem icon={Calendar} label="Agenda" value="agenda" />
              <NavItem icon={Inbox} label="Team Inbox" value="inbox" badge={unreadMessages} />
              <NavItem icon={FileText} label="Documenti" value="documents" />
              <NavItem icon={FolderArchive} label="Archivio Clinica" value="archive" />
              <NavItem icon={CalendarDays} label="Eventi" value="events" />
              <NavItem icon={Stethoscope} label="Servizi" value="services" />
              <NavItem icon={PawPrint} label="Pazienti" value="patients" />
              <NavItem icon={User} label="Proprietari" value="owners" />
              <NavItem icon={Users} label="Staff" value="staff" />
              <NavItem icon={Receipt} label="Fatturazione" value="invoicing" />
              <NavItem icon={TrendingUp} label="Report" value="reports" />
              <NavItem icon={Star} label="Recensioni" value="reviews" />
              <NavItem icon={Gift} label="Premi Fedeltà" value="rewards" />
              <NavItem icon={ClipboardList} label="Template" value="templates" />
              <NavItem icon={Zap} label="Automazioni" value="automations" />
              <div className="border-t my-2"></div>
              <NavItem icon={MessageCircle} label="Feedback" value="feedback" />
              <NavItem icon={Settings} label="Impostazioni" value="settings" />
              <NavItem icon={BookOpen} label="Tutorial" value="tutorial" />
            </nav>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r p-4 flex-col flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <NewBrandLogo size="sm" showText={false} />
            <div>
              <h1 className="font-bold"><span className="text-gray-900">vet</span><span className="text-coral-500">buddy</span></h1>
              <p className="text-xs text-gray-500 truncate max-w-[100px]">{user.clinicName || 'Clinica'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-500 hover:text-red-600 hover:bg-red-50" title="Esci">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="mb-2"><RoleBadge role="clinic" /></div>
        <Badge variant="outline" className="mb-6 justify-center text-amber-600 border-amber-300 bg-amber-50"><AlertCircle className="h-3 w-3 mr-1" /> Modalità Pilot</Badge>
        
        <nav className="space-y-1 flex-1 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
          <NavItem icon={Calendar} label="Agenda" value="agenda" />
          <NavItem icon={Inbox} label="Team Inbox" value="inbox" badge={unreadMessages} />
          <NavItem icon={FileText} label="Documenti" value="documents" />
          <NavItem icon={FolderArchive} label="Archivio Clinica" value="archive" />
          <NavItem icon={CalendarDays} label="Eventi" value="events" />
          <NavItem icon={Stethoscope} label="Servizi" value="services" />
          <NavItem icon={Video} label="Video Consulto" value="videoconsult" />
          <NavItem icon={PawPrint} label="Pazienti" value="patients" />
          <NavItem icon={User} label="Proprietari" value="owners" />
          <NavItem icon={Users} label="Staff" value="staff" />
          <NavItem icon={Receipt} label="Fatturazione" value="invoicing" />
          <NavItem icon={TrendingUp} label="Report" value="reports" />
          <NavItem icon={Star} label="Recensioni" value="reviews" />
          <NavItem icon={Gift} label="Premi Fedeltà" value="rewards" />
          <NavItem icon={ClipboardList} label="Template" value="templates" />
          <NavItem icon={Zap} label="Automazioni" value="automations" />
          <div className="border-t my-2"></div>
          <NavItem icon={MessageCircle} label="Feedback" value="feedback" />
          <NavItem icon={Settings} label="Impostazioni" value="settings" />
          <NavItem icon={BookOpen} label="Tutorial" value="tutorial" />
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {activeTab === 'dashboard' && <ClinicControlRoom appointments={appointments} documents={documents} messages={messages} owners={owners} pets={pets} rewards={rewards} setupProgress={setupProgress} onRefresh={loadData} onNavigate={setActiveTab} onOpenPet={handleOpenPetFromOwner} />}
        {activeTab === 'agenda' && <ClinicAgenda appointments={appointments} staff={staff} owners={owners} pets={pets} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'inbox' && <ClinicInbox messages={messages} owners={owners} pets={pets} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'documents' && <ClinicDocuments documents={documents} owners={owners} pets={pets} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'services' && <ClinicServices onNavigate={setActiveTab} user={user} />}
        {activeTab === 'videoconsult' && <ClinicVideoConsult user={user} onNavigate={setActiveTab} />}
        {activeTab === 'patients' && <ClinicPatients pets={pets} owners={owners} onRefresh={loadData} onNavigate={setActiveTab} onOpenOwner={handleOpenOwnerFromPet} initialPet={selectedPetFromOwner} onClearInitialPet={() => setSelectedPetFromOwner(null)} />}
        {activeTab === 'owners' && <ClinicOwners owners={owners} pets={pets} onRefresh={loadData} onNavigate={setActiveTab} onOpenPet={handleOpenPetFromOwner} initialOwner={selectedOwnerFromPet} onClearInitialOwner={() => setSelectedOwnerFromPet(null)} />}
        {activeTab === 'staff' && <ClinicStaff staff={staff} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'reports' && <ClinicReports appointments={appointments} documents={documents} messages={messages} owners={owners} pets={pets} onNavigate={setActiveTab} onOpenOwner={handleOpenOwnerFromPet} onOpenPet={handleOpenPetFromOwner} />}
        {activeTab === 'reviews' && <ClinicReviews onNavigate={setActiveTab} />}
        {activeTab === 'rewards' && <ClinicRewardsManagement user={user} owners={owners} />}
        {activeTab === 'invoicing' && <ClinicInvoicing user={user} owners={owners} pets={pets} />}
        {activeTab === 'templates' && <ClinicTemplates owners={owners} pets={pets} staff={staff} appointments={appointments} user={user} onNavigate={setActiveTab} />}
        {activeTab === 'automations' && <ClinicAutomations user={user} onNavigate={setActiveTab} />}
        {activeTab === 'archive' && <ClinicArchive user={user} />}
        {activeTab === 'events' && <ClinicEvents user={user} />}
        {activeTab === 'settings' && <ClinicSettings user={user} onNavigate={setActiveTab} />}
        {activeTab === 'feedback' && <ClinicFeedbackPage user={user} />}
        {activeTab === 'tutorial' && <ClinicTutorialInline />}
      </main>
    </div>
  );
}

// ==================== CONTROL ROOM DASHBOARD ====================
function ClinicControlRoom({ appointments, documents, messages, owners, pets, rewards, setupProgress, onRefresh, onNavigate, onOpenPet }) {
  const [selectedPetPopup, setSelectedPetPopup] = useState(null);
  
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const videoAppts = todayAppts.filter(a => a.type === 'videoconsulto');
  const unreadMessages = messages.filter(m => !m.read).length;
  const newFromClients = documents.filter(d => d.fromClient).length + messages.filter(m => !m.read && m.fromClient).length;
  
  // Premi attivi (disponibili o pending)
  const activeRewards = rewards?.filter(r => r.status === 'available' || r.status === 'pending') || [];
  const pendingRewards = rewards?.filter(r => r.status === 'pending') || [];
  
  const completedSteps = Object.values(setupProgress).filter(Boolean).length;
  const progressPercent = (completedSteps / 4) * 100;

  // Helper per trovare un pet dall'appuntamento
  const getPetFromAppointment = (appt) => {
    return pets?.find(p => p.id === appt.petId) || null;
  };
  
  // Helper per trovare un owner
  const getOwnerFromPet = (pet) => {
    return owners?.find(o => o.id === pet?.ownerId) || null;
  };

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

      {/* Tutorial Box per Cliniche */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <PlayCircle className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">📚 Tutorial per Cliniche</h3>
            <p className="text-sm text-gray-600 mb-2">
              Scopri tutte le funzionalità di vetbuddy per gestire al meglio la tua clinica.
            </p>
            <button onClick={() => onNavigate('tutorial')} className="inline-flex items-center gap-1 text-purple-600 font-medium text-sm hover:underline">
              <PlayCircle className="h-4 w-4" /> Guarda il tutorial
            </button>
          </div>
        </div>
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
              <SetupStep icon={Video} label="Video consulto" desc="Attiva e configura prezzi" done={setupProgress.video} onClick={() => onNavigate('services')} />
              <SetupStep icon={Users} label="Team" desc="Aggiungi staff" done={setupProgress.team} onClick={() => onNavigate('staff')} />
              <SetupStep icon={Bell} label="Automazioni" desc="Promemoria auto" done={setupProgress.automations} onClick={() => onNavigate('automations')} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard icon={Calendar} label="Appuntamenti oggi" value={todayAppts.length} color="coral" onClick={() => onNavigate('agenda')} />
        <KPICard icon={Video} label="Video visite oggi" value={videoAppts.length} color="blue" highlight={videoAppts[0]?.time} onClick={() => onNavigate('agenda')} />
        <KPICard icon={MessageCircle} label="Messaggi in attesa" value={unreadMessages} color="amber" onClick={() => onNavigate('inbox')} />
        <KPICard icon={FileText} label="Nuovi da clienti" value={newFromClients} color="green" onClick={() => onNavigate('documents')} />
        <KPICard 
          icon={Gift} 
          label="Premi attivi" 
          value={activeRewards.length} 
          color="yellow" 
          highlight={pendingRewards.length > 0 ? `${pendingRewards.length} da confermare` : null}
          onClick={() => onNavigate('rewards')} 
        />
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
                  {todayAppts.slice(0, 5).map((appt, i) => {
                    const pet = getPetFromAppointment(appt);
                    return (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          const pet = getPetFromAppointment(appt);
                          if (pet) {
                            setSelectedPetPopup(pet);
                          }
                        }}
                      >
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
                          {appt.type === 'videoconsulto' && appt.videoLink && (
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white h-8" onClick={(e) => { e.stopPropagation(); window.open(appt.videoLink, '_blank'); }}>
                              <PlayCircle className="h-3 w-3 mr-1" />Avvia
                            </Button>
                          )}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
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
                  <span className="text-sm font-medium">Prossimo video consulto</span>
                </div>
                <p className="font-semibold">{videoAppts[0].petName}</p>
                <p className="text-sm text-gray-600">{videoAppts[0].ownerName}</p>
                <p className="text-sm text-blue-600 font-medium mt-1">Ore {videoAppts[0].time}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedPetPopup(getPetFromAppointment(videoAppts[0]))}>Prepara</Button>
                  <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={() => videoAppts[0].videoLink && window.open(videoAppts[0].videoLink, '_blank')}>
                    <PlayCircle className="h-3 w-3 mr-1" />Avvia
                  </Button>
                </div>
                {videoAppts[0].videoLink && (
                  <p className="text-xs text-blue-500 mt-2 truncate">Link: {videoAppts[0].videoLink}</p>
                )}
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
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-green-200 cursor-pointer hover:shadow-md transition" onClick={() => onNavigate('reports')}>
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

      {/* Dialog Dettaglio Animale - Dashboard */}
      <Dialog open={!!selectedPetPopup} onOpenChange={() => setSelectedPetPopup(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center">
                <PawPrint className="h-6 w-6 text-coral-600" />
              </div>
              <div>
                <p className="text-xl">{selectedPetPopup?.name}</p>
                <p className="text-sm text-gray-500 font-normal">{selectedPetPopup?.breed || selectedPetPopup?.species}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedPetPopup && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Specie</p>
                  <p className="font-medium">{selectedPetPopup.species === 'dog' ? '🐕 Cane' : selectedPetPopup.species === 'cat' ? '🐱 Gatto' : selectedPetPopup.species || 'Altro'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Razza</p>
                  <p className="font-medium">{selectedPetPopup.breed || 'N/D'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Età</p>
                  <p className="font-medium">{selectedPetPopup.birthDate ? `${Math.floor((new Date() - new Date(selectedPetPopup.birthDate)) / (365.25 * 24 * 60 * 60 * 1000))} anni` : 'N/D'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Peso</p>
                  <p className="font-medium">{selectedPetPopup.weight ? `${selectedPetPopup.weight} kg` : 'N/D'}</p>
                </div>
              </div>
              
              {/* Owner Info */}
              {(() => {
                const owner = getOwnerFromPet(selectedPetPopup);
                return owner && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-blue-600 font-medium mb-2">👤 Proprietario</p>
                    <p className="font-medium">{owner.name}</p>
                    {owner.email && <p className="text-sm text-gray-600 flex items-center gap-2 mt-1"><Mail className="h-3 w-3" />{owner.email}</p>}
                    {owner.phone && <p className="text-sm text-gray-600 flex items-center gap-2 mt-1"><Phone className="h-3 w-3" />{owner.phone}</p>}
                  </div>
                );
              })()}

              {selectedPetPopup.microchip && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Microchip</p>
                  <p className="font-mono font-medium">{selectedPetPopup.microchip}</p>
                </div>
              )}
              
              {(selectedPetPopup.allergies || selectedPetPopup.chronicDiseases) && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-600 font-medium">⚠️ Condizioni Mediche</p>
                  {selectedPetPopup.allergies && <p className="text-sm mt-1"><strong>Allergie:</strong> {selectedPetPopup.allergies}</p>}
                  {selectedPetPopup.chronicDiseases && <p className="text-sm mt-1"><strong>Patologie:</strong> {selectedPetPopup.chronicDiseases}</p>}
                </div>
              )}
              
              {selectedPetPopup.medications && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-amber-600 font-medium">💊 Farmaci in corso</p>
                  <p className="text-sm mt-1">{selectedPetPopup.medications}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setSelectedPetPopup(null); onOpenPet && onOpenPet(selectedPetPopup); }}>
                  Apri scheda completa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
    petId: '', petName: '', ownerId: '', ownerName: '', ownerEmail: '', date: '', time: '', 
    reason: '', type: 'visita', staffId: '', duration: 30, notes: '',
    showOwnerSuggestions: false, showPetSuggestions: false
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
    { value: 'videoconsulto', label: 'Video consulto', icon: Video, color: 'bg-teal-100 text-teal-700 border-teal-200' },
    { value: 'altro', label: 'Altro', icon: Calendar, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  ];

  const getTypeConfig = (type) => appointmentTypes.find(t => t.value === type) || appointmentTypes[appointmentTypes.length - 1];

  // Reset form
  const resetForm = () => {
    setFormData({ petId: '', petName: '', ownerId: '', ownerName: '', ownerEmail: '', date: '', time: '', reason: '', type: 'visita', staffId: '', duration: 30, notes: '', showOwnerSuggestions: false, showPetSuggestions: false });
    setEditingAppt(null);
  };

  // Open edit dialog
  const openEditDialog = (appt) => {
    setEditingAppt(appt);
    setFormData({
      petId: appt.petId || '',
      petName: appt.petName || '',
      ownerId: appt.ownerId || '',
      ownerName: appt.ownerName || '',
      ownerEmail: appt.ownerEmail || '',
      date: appt.date || '',
      time: appt.time || '',
      reason: appt.reason || '',
      type: appt.type || 'visita',
      staffId: appt.staffId || '',
      duration: appt.duration || 30,
      notes: appt.notes || '',
      showOwnerSuggestions: false,
      showPetSuggestions: false
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
    
    // Use share dialog directly (navigator.share doesn't work in iframes)
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
                
                {/* Owner Selection with Autocomplete */}
                <div className="relative">
                  <Label>Proprietario *</Label>
                  <div className="relative">
                    <Input 
                      value={formData.ownerName} 
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({...formData, ownerName: value, ownerId: '', ownerEmail: '', petId: '', petName: ''});
                      }}
                      onFocus={() => setFormData({...formData, showOwnerSuggestions: true})}
                      onBlur={() => setTimeout(() => setFormData(prev => ({...prev, showOwnerSuggestions: false})), 200)}
                      placeholder="Digita nome proprietario..." 
                      className="pr-10"
                      required 
                    />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {/* Suggestions dropdown */}
                  {formData.showOwnerSuggestions && formData.ownerName && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto">
                      {owners?.filter(o => 
                        o.role === 'owner' && 
                        (o.name?.toLowerCase().includes(formData.ownerName.toLowerCase()) ||
                         o.email?.toLowerCase().includes(formData.ownerName.toLowerCase()))
                      ).length > 0 ? (
                        <>
                          <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                            Proprietari registrati
                          </div>
                          {owners?.filter(o => 
                            o.role === 'owner' && 
                            (o.name?.toLowerCase().includes(formData.ownerName.toLowerCase()) ||
                             o.email?.toLowerCase().includes(formData.ownerName.toLowerCase()))
                          ).map(owner => (
                            <button
                              key={owner.id}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-coral-50 flex items-center gap-2 border-b last:border-b-0"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setFormData({
                                  ...formData, 
                                  ownerId: owner.id, 
                                  ownerName: owner.name, 
                                  ownerEmail: owner.email || '',
                                  petId: '',
                                  petName: '',
                                  showOwnerSuggestions: false
                                });
                              }}
                            >
                              <User className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="font-medium">{owner.name}</p>
                                <p className="text-xs text-gray-500">{owner.email}</p>
                              </div>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          <UserPlus className="h-4 w-4 inline mr-2" />
                          Nuovo proprietario: "{formData.ownerName}"
                        </div>
                      )}
                    </div>
                  )}
                  {/* Show email field for new owners */}
                  {formData.ownerName && !formData.ownerId && (
                    <div className="mt-2">
                      <Label className="text-xs text-gray-500">Email nuovo proprietario</Label>
                      <Input 
                        type="email" 
                        value={formData.ownerEmail} 
                        onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} 
                        placeholder="email@esempio.it (opzionale)" 
                        className="mt-1"
                      />
                    </div>
                  )}
                  {/* Show selected owner badge */}
                  {formData.ownerId && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <User className="h-3 w-3 mr-1" />
                        Proprietario registrato
                      </Badge>
                      <span className="text-xs text-gray-500">{formData.ownerEmail}</span>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, ownerId: '', ownerName: '', ownerEmail: '', petId: '', petName: ''})}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Cambia
                      </button>
                    </div>
                  )}
                </div>

                {/* Pet Selection with Autocomplete */}
                <div className="relative">
                  <Label>Animale *</Label>
                  <div className="relative">
                    <Input 
                      value={formData.petName} 
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({...formData, petName: value, petId: ''});
                      }}
                      onFocus={() => setFormData({...formData, showPetSuggestions: true})}
                      onBlur={() => setTimeout(() => setFormData(prev => ({...prev, showPetSuggestions: false})), 200)}
                      placeholder="Digita nome animale..." 
                      className="pr-10"
                      required 
                    />
                    <PawPrint className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {/* Pet suggestions dropdown */}
                  {formData.showPetSuggestions && formData.petName && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto">
                      {(() => {
                        // If owner is selected, show only their pets
                        const availablePets = formData.ownerId 
                          ? pets?.filter(p => p.ownerId === formData.ownerId && p.name?.toLowerCase().includes(formData.petName.toLowerCase()))
                          : pets?.filter(p => p.name?.toLowerCase().includes(formData.petName.toLowerCase()));
                        
                        if (availablePets?.length > 0) {
                          return (
                            <>
                              <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                                {formData.ownerId ? 'Pet di questo proprietario' : 'Pet registrati'}
                              </div>
                              {availablePets.map(pet => {
                                const petOwner = owners?.find(o => o.id === pet.ownerId);
                                return (
                                  <button
                                    key={pet.id}
                                    type="button"
                                    className="w-full px-3 py-2 text-left hover:bg-coral-50 flex items-center gap-2 border-b last:border-b-0"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      // If selecting a pet, also set the owner if not already set
                                      if (!formData.ownerId && petOwner) {
                                        setFormData({
                                          ...formData, 
                                          petId: pet.id, 
                                          petName: pet.name,
                                          ownerId: petOwner.id,
                                          ownerName: petOwner.name,
                                          ownerEmail: petOwner.email || '',
                                          showPetSuggestions: false
                                        });
                                      } else {
                                        setFormData({
                                          ...formData, 
                                          petId: pet.id, 
                                          petName: pet.name,
                                          showPetSuggestions: false
                                        });
                                      }
                                    }}
                                  >
                                    <PawPrint className="h-4 w-4 text-coral-500" />
                                    <div>
                                      <p className="font-medium">{pet.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {pet.species} {pet.breed && `• ${pet.breed}`}
                                        {!formData.ownerId && petOwner && ` • ${petOwner.name}`}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </>
                          );
                        } else {
                          return (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              <PlusCircle className="h-4 w-4 inline mr-2" />
                              Nuovo animale: "{formData.petName}"
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                  {/* Show selected pet badge */}
                  {formData.petId && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="bg-coral-50 text-coral-700 border-coral-200">
                        <PawPrint className="h-3 w-3 mr-1" />
                        Pet registrato
                      </Badge>
                      {(() => {
                        const pet = pets?.find(p => p.id === formData.petId);
                        return pet && <span className="text-xs text-gray-500">{pet.species} - {pet.breed}</span>;
                      })()}
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, petId: '', petName: ''})}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Cambia
                      </button>
                    </div>
                  )}
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
  const [formData, setFormData] = useState({ type: 'prescrizione', ownerId: '', ownerEmail: '', petId: '', petName: '', title: '', file: null, fileName: '', fileType: '', notes: '', sendEmail: true, amount: '' });
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

  // Filter pets by selected owner
  const ownerPets = formData.ownerId ? pets.filter(p => p.ownerId === formData.ownerId) : pets;

  const handleOwnerSelect = (ownerId) => {
    const owner = owners.find(o => o.id === ownerId);
    setFormData({ 
      ...formData, 
      ownerId, 
      ownerEmail: owner?.email || '',
      petId: '', 
      petName: '' 
    });
  };

  const handlePetSelect = (petId) => {
    const pet = pets.find(p => p.id === petId);
    setFormData({ ...formData, petId, petName: pet?.name || '' });
  };

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
    if (formData.sendEmail && !formData.ownerEmail) { alert('Inserisci l\'email del proprietario per inviare il documento'); return; }
    setUploading(true);
    try { 
      await api.post('documents', { 
        name: formData.title, 
        type: formData.type, 
        content: formData.file, 
        fileName: formData.fileName,
        fileType: formData.fileType,
        petId: formData.petId,
        petName: formData.petName, 
        ownerId: formData.ownerId,
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
    <><DialogHeader><DialogTitle>Carica documento</DialogTitle><DialogDescription>Seleziona proprietario e animale, poi carica il file. Verrà inviato via email con il PDF allegato.</DialogDescription></DialogHeader>
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
      
      {/* Owner & Pet Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Proprietario *</Label>
          {owners.length > 0 ? (
            <Select value={formData.ownerId} onValueChange={handleOwnerSelect}>
              <SelectTrigger><SelectValue placeholder="Seleziona proprietario" /></SelectTrigger>
              <SelectContent>
                {owners.map(owner => (
                  <SelectItem key={owner.id} value={owner.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      {owner.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input placeholder="Email proprietario" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} required />
          )}
        </div>
        <div>
          <Label>Animale</Label>
          {ownerPets.length > 0 ? (
            <Select value={formData.petId} onValueChange={handlePetSelect}>
              <SelectTrigger><SelectValue placeholder="Seleziona animale" /></SelectTrigger>
              <SelectContent>
                {ownerPets.map(pet => (
                  <SelectItem key={pet.id} value={pet.id}>
                    <div className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4 text-gray-500" />
                      {pet.name} ({pet.species || 'Animale'})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input placeholder="Nome animale" value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} />
          )}
        </div>
      </div>
      
      {/* Email (editable, pre-filled from owner selection) */}
      {formData.ownerId && (
        <div>
          <Label>Email destinatario</Label>
          <Input type="email" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} placeholder="email@esempio.com" />
          <p className="text-xs text-gray-500 mt-1">Pre-compilata dal profilo. Puoi modificarla se necessario.</p>
        </div>
      )}
      
      <div><Label>Titolo documento</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder={formData.type === 'fattura' ? 'Es: Fattura visita 12/02' : 'Es: Prescrizione antibiotico'} /></div>
      
      {formData.type === 'fattura' && (
        <div><Label>Importo (€) IVA esclusa</Label><Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" /></div>
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
      
      <div className={`flex items-center justify-between p-4 rounded-lg ${formData.sendEmail ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
        <div>
          <p className="font-medium text-sm flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invia via email automaticamente
          </p>
          <p className="text-xs text-gray-500">Il proprietario riceverà il file PDF come allegato</p>
        </div>
        <Switch checked={formData.sendEmail} onCheckedChange={(v) => setFormData({...formData, sendEmail: v})} />
      </div>
      
      {formData.sendEmail && formData.ownerEmail && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Anteprima:</strong> Email a <span className="font-mono">{formData.ownerEmail}</span>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Subject: "{docTypeOptions.find(o => o.value === formData.type)?.label || 'Documento'} per {formData.petName || 'il tuo animale'} – La tua clinica"
          </p>
        </div>
      )}
      
      <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={uploading}>
        {uploading ? 'Caricamento...' : (formData.sendEmail ? '📧 Carica e invia email con allegato' : 'Carica documento')}
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
    try {
      if (doc.content && doc.content.startsWith('data:')) {
        // Data URL - scarica direttamente
        const link = document.createElement('a');
        link.href = doc.content;
        link.download = doc.fileName || `${doc.name}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
      } else if (doc.id) {
        // Usa l'API di download per documenti salvati nel DB
        const downloadUrl = `/api/documents/download?id=${doc.id}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = doc.fileName || `${doc.name}.pdf`;
        link.target = '_blank'; // Apri in nuovo tab per evitare perdita navigazione
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
      } else {
        alert('Contenuto del documento non disponibile');
      }
    } catch (error) {
      console.error('Errore download documento:', error);
      alert('Errore durante il download. Riprova.');
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => {
            try {
              const response = await fetch(`/api/documents/download-all?clinicId=${user?.id || user?.clinicId}&role=clinic`);
              if (!response.ok) throw new Error('Nessun documento da scaricare');
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url;
              a.download = `VetBuddy_Documenti_${new Date().toISOString().split('T')[0]}.zip`;
              document.body.appendChild(a); a.click();
              window.URL.revokeObjectURL(url); a.remove();
            } catch (e) { alert(e.message || 'Errore download'); }
          }}><Download className="h-4 w-4 mr-2" />Scarica tutto</Button>
          <Button className="bg-coral-500 hover:bg-coral-600" onClick={() => setShowUpload(true)}><Upload className="h-4 w-4 mr-2" />Carica documento</Button>
        </div>
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
                  <Badge className={docTypes[selectedDoc.type]?.color || 'bg-gray-100 text-gray-700'}>
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
function ClinicPatients({ pets, onRefresh, onNavigate, owners = [], onOpenOwner, initialPet, onClearInitialPet }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [petDetails, setPetDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formData, setFormData] = useState({ name: '', species: 'dog', breed: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  
  // Lab exam states
  const [showLabDialog, setShowLabDialog] = useState(false);
  const [labExams, setLabExams] = useState([]);
  const [selectedLabExams, setSelectedLabExams] = useState([]);
  const [labRequests, setLabRequests] = useState([]);
  const [labClinicalNotes, setLabClinicalNotes] = useState('');
  const [labLoading, setLabLoading] = useState(false);
  const [labCategory, setLabCategory] = useState('all');
  
  // Import states
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importStep, setImportStep] = useState(1); // 1: choose, 2: upload data, 3: upload docs, 4: results
  const [importFile, setImportFile] = useState(null);
  const [importDocs, setImportDocs] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  
  // Apri automaticamente il pet se viene passato da un altro componente
  useEffect(() => {
    if (initialPet) {
      openPetDetails(initialPet);
      if (onClearInitialPet) onClearInitialPet();
    }
  }, [initialPet]);
  
  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('pets', formData); setShowDialog(false); onRefresh(); } catch (error) { alert(error.message); } };
  
  const openPetDetails = async (pet) => {
    setSelectedPet(pet);
    setShowDetailDialog(true);
    setLoadingDetails(true);
    try {
      const details = await api.get(`pets/${pet.id}`);
      setPetDetails(details);
    } catch (error) {
      console.error('Error loading pet details:', error);
      setPetDetails(pet);
    } finally {
      setLoadingDetails(false);
    }
  };
  
  const getOwnerName = (ownerId) => {
    const owner = owners.find(o => o.id === ownerId);
    return owner?.name || 'Non assegnato';
  };
  
  const getOwnerDetails = (ownerId) => {
    return owners.find(o => o.id === ownerId) || null;
  };
  
  const handleEditPet = () => {
    setEditFormData({
      name: petDetails?.name || '',
      species: petDetails?.species || 'dog',
      breed: petDetails?.breed || '',
      weight: petDetails?.weight || '',
      microchip: petDetails?.microchip || ''
    });
    setShowEditDialog(true);
  };
  
  const handleSaveEdit = async () => {
    try {
      await api.put(`pets/${selectedPet.id}`, editFormData);
      alert('✅ Animale aggiornato!');
      setShowEditDialog(false);
      openPetDetails(selectedPet);
      onRefresh();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };
  
  const handleDeletePet = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedPet?.name}? Questa azione non può essere annullata.`)) return;
    try {
      await api.delete(`pets/${selectedPet.id}`);
      alert('✅ Animale eliminato!');
      setShowDetailDialog(false);
      onRefresh();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };
  
  // Lab exam functions
  const openLabDialog = async () => {
    setShowLabDialog(true);
    setLabLoading(true);
    try {
      // Load exam catalog
      const examData = await api.get('lab/exams');
      setLabExams(examData.exams || []);
      // Load existing requests for this pet
      const requestData = await api.get(`lab/requests?patientId=${selectedPet?.id}`);
      setLabRequests(requestData.requests || []);
    } catch (error) {
      console.error('Error loading lab data:', error);
    } finally {
      setLabLoading(false);
    }
  };
  
  const toggleExamSelection = (exam) => {
    setSelectedLabExams(prev => {
      const exists = prev.find(e => e.id === exam.id);
      if (exists) {
        return prev.filter(e => e.id !== exam.id);
      } else {
        return [...prev, exam];
      }
    });
  };
  
  const submitLabRequest = async (sendNow = false) => {
    if (selectedLabExams.length === 0) {
      alert('Seleziona almeno un esame');
      return;
    }
    try {
      setLabLoading(true);
      const owner = getOwnerDetails(petDetails?.ownerId);
      await api.post('lab/requests', {
        patientId: selectedPet?.id,
        patientName: selectedPet?.name,
        patientSpecies: selectedPet?.species,
        patientBreed: selectedPet?.breed,
        ownerId: petDetails?.ownerId,
        ownerName: owner?.name,
        ownerPhone: owner?.phone,
        ownerEmail: owner?.email,
        exams: selectedLabExams,
        clinicalNotes: labClinicalNotes,
        sendNow
      });
      alert(sendNow ? '✅ Richiesta inviata al laboratorio!' : '✅ Richiesta salvata come bozza!');
      setSelectedLabExams([]);
      setLabClinicalNotes('');
      // Reload requests
      const requestData = await api.get(`lab/requests?patientId=${selectedPet?.id}`);
      setLabRequests(requestData.requests || []);
    } catch (error) {
      alert('Errore: ' + error.message);
    } finally {
      setLabLoading(false);
    }
  };
  
  const getLabStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Bozza', className: 'bg-gray-100 text-gray-700' },
      sent: { label: 'Inviata', className: 'bg-blue-100 text-blue-700' },
      in_progress: { label: 'In lavorazione', className: 'bg-yellow-100 text-yellow-700' },
      results_received: { label: 'Referti ricevuti', className: 'bg-purple-100 text-purple-700' },
      validated: { label: 'Validati', className: 'bg-green-100 text-green-700' },
      shared: { label: 'Condivisi', className: 'bg-emerald-100 text-emerald-700' },
      cancelled: { label: 'Annullata', className: 'bg-red-100 text-red-700' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };
  
  // Import functions
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
    }
  };
  
  const handleDocsChange = (e) => {
    const files = Array.from(e.target.files);
    setImportDocs(prev => [...prev, ...files]);
  };
  
  const removeDoc = (index) => {
    setImportDocs(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleImportData = async () => {
    if (!importFile) return;
    
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('type', 'data');
      
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api.getToken()}`
        },
        body: formData
      });
      
      const result = await response.json();
      setImportResults(result);
      
      if (result.success) {
        setImportStep(3); // Go to documents step
        onRefresh();
      }
    } catch (error) {
      setImportResults({ success: false, error: error.message });
    } finally {
      setImporting(false);
    }
  };
  
  const handleImportDocs = async () => {
    if (importDocs.length === 0) {
      setImportStep(4);
      return;
    }
    
    setImporting(true);
    try {
      const formData = new FormData();
      importDocs.forEach(file => formData.append('files', file));
      formData.append('type', 'documents');
      
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api.getToken()}`
        },
        body: formData
      });
      
      const result = await response.json();
      setImportResults(prev => ({
        ...prev,
        imported: {
          ...prev?.imported,
          documents: result.imported?.documents || 0
        },
        warnings: [...(prev?.warnings || []), ...(result.warnings || [])],
        errors: [...(prev?.errors || []), ...(result.errors || [])]
      }));
      
      setImportStep(4);
      onRefresh();
    } catch (error) {
      setImportResults(prev => ({
        ...prev,
        errors: [...(prev?.errors || []), error.message]
      }));
    } finally {
      setImporting(false);
    }
  };
  
  const downloadTemplate = () => {
    const csvContent = `nome,specie,razza,data_nascita,microchip,sesso,peso,colore,sterilizzato,allergie,farmaci,note,proprietario,email,telefono,indirizzo,vaccino,data_vaccino,scadenza_vaccino
Luna,cane,Labrador,15/03/2020,380260000123456,femmina,25,biondo,si,Allergia al pollo,,Cane molto socievole,Mario Rossi,mario.rossi@email.it,+39 333 1234567,Via Roma 123 Milano,Polivalente,01/01/2024,01/01/2025
Max,gatto,Europeo,20/06/2019,380260000789012,maschio,5,tigrato,no,,,Gatto indoor,Anna Bianchi,anna.bianchi@email.it,+39 338 9876543,Via Verdi 45 Roma,Trivalente,15/03/2024,15/03/2025
Milo,cane,Golden Retriever,10/08/2021,,maschio,28,dorato,si,,Apoquel 16mg,Dermatite atopica in cura,Luca Verdi,luca.verdi@email.it,+39 340 5551234,Via Dante 78 Torino,Rabbia,20/06/2024,20/06/2025`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_import_pazienti.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const resetImport = () => {
    setImportStep(1);
    setImportFile(null);
    setImportDocs([]);
    setImportResults(null);
    setShowImportDialog(false);
  };
  
  // Filtra i pazienti per la ricerca
  const filteredPets = pets.filter(pet => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const ownerName = getOwnerName(pet.ownerId).toLowerCase();
    return (
      pet.name?.toLowerCase().includes(query) ||
      pet.breed?.toLowerCase().includes(query) ||
      pet.microchip?.toLowerCase().includes(query) ||
      ownerName.includes(query)
    );
  });
  
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
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Pazienti</h2>
          <p className="text-gray-500 text-sm">Animali registrati - clicca per vedere i dettagli</p>
        </div>
        <div className="flex gap-2">
          {/* Import Button */}
          <Button variant="outline" onClick={() => setShowImportDialog(true)} className="border-blue-300 text-blue-600 hover:bg-blue-50">
            <Upload className="h-4 w-4 mr-2" />Import Dati
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Nuovo</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuovo paziente</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
                <div><Label>Specie</Label><Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dog">🐕 Cane</SelectItem><SelectItem value="cat">🐱 Gatto</SelectItem><SelectItem value="horse">🐴 Cavallo</SelectItem><SelectItem value="bird">🦜 Uccello</SelectItem><SelectItem value="rabbit">🐰 Coniglio</SelectItem><SelectItem value="hamster">🐹 Criceto</SelectItem><SelectItem value="fish">🐠 Pesce</SelectItem><SelectItem value="reptile">🦎 Rettile</SelectItem><SelectItem value="other">🐾 Altro</SelectItem></SelectContent></Select></div>
                <div><Label>Razza</Label><Input value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} /></div>
                <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={(open) => !open && resetImport()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              Import Pazienti Esistenti
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between">
              <span>Carica i tuoi pazienti esistenti da file CSV/Excel</span>
              <a href="/guida-import" target="_blank" className="text-blue-500 hover:underline text-sm flex items-center gap-1">
                📖 Guida completa
              </a>
            </DialogDescription>
          </DialogHeader>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  importStep >= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step === 4 && importStep === 4 ? '✓' : step}
                </div>
                {step < 4 && <div className={`w-8 h-1 ${importStep > step ? 'bg-blue-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 text-xs text-gray-500 -mt-2 mb-4">
            <span>Inizia</span>
            <span>Dati</span>
            <span>Documenti</span>
            <span>Fatto</span>
          </div>
          
          {/* Step 1: Choose */}
          {importStep === 1 && (
            <div className="space-y-4">
              {/* Quick Start - Super chiaro */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-xl text-white">
                <h3 className="font-bold text-lg mb-3">⚡ Import Rapido in 3 Passi</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-2xl mb-1">1️⃣</div>
                    <p className="text-sm font-medium">Scarica il template</p>
                    <p className="text-xs opacity-80">File Excel/CSV pronto</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-2xl mb-1">2️⃣</div>
                    <p className="text-sm font-medium">Compila i dati</p>
                    <p className="text-xs opacity-80">Copia dal tuo gestionale</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-2xl mb-1">3️⃣</div>
                    <p className="text-sm font-medium">Carica il file</p>
                    <p className="text-xs opacity-80">Import automatico!</p>
                  </div>
                </div>
              </div>
              
              {/* Main Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={downloadTemplate} className="h-28 flex-col border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50">
                  <Download className="h-8 w-8 mb-2 text-blue-500" />
                  <span className="font-semibold">Scarica Template</span>
                  <span className="text-xs text-gray-500">File CSV con esempi</span>
                </Button>
                <Button className="h-28 flex-col bg-green-500 hover:bg-green-600" onClick={() => setImportStep(2)}>
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="font-semibold">Ho già il file</span>
                  <span className="text-xs opacity-80">Vai all'upload →</span>
                </Button>
              </div>
              
              {/* Cosa viene importato */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" /> Cosa viene importato automaticamente:
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🐾</span>
                    <span><strong>Animali:</strong> nome, specie, razza, peso, microchip</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <span><strong>Proprietari:</strong> nome, email, telefono</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💉</span>
                    <span><strong>Vaccini:</strong> nome, data, scadenza</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <span><strong>Info cliniche:</strong> allergie, farmaci, note</span>
                  </div>
                </div>
              </div>
              
              {/* Detailed instructions - Accordion */}
              <Accordion type="single" collapsible className="border rounded-lg">
                <AccordionItem value="columns" className="border-0">
                  <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
                    <span className="flex items-center gap-2"><Info className="h-4 w-4" /> 📖 Guida completa alle colonne del template</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 text-sm">
                      <div className="bg-coral-50 p-3 rounded-lg">
                        <p className="font-semibold text-coral-700 mb-2">⚠️ Campi obbligatori (solo 2!):</p>
                        <ul className="space-y-1 text-coral-600">
                          <li>• <strong>nome</strong> - Nome dell'animale (es. "Luna")</li>
                          <li>• <strong>specie</strong> - Scrivi: cane, gatto, uccello, coniglio, criceto, altro</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Campi opzionali animale:</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                          <p>• <strong>razza</strong> - es. "Labrador"</p>
                          <p>• <strong>data_nascita</strong> - formato: 15/03/2020</p>
                          <p>• <strong>microchip</strong> - es. "380260000123456"</p>
                          <p>• <strong>sesso</strong> - scrivi: maschio o femmina</p>
                          <p>• <strong>peso</strong> - solo numero, es. "25"</p>
                          <p>• <strong>colore</strong> - es. "biondo"</p>
                          <p>• <strong>sterilizzato</strong> - scrivi: si o no</p>
                          <p>• <strong>allergie</strong> - testo libero</p>
                          <p>• <strong>farmaci</strong> - farmaci in corso</p>
                          <p>• <strong>note</strong> - note aggiuntive</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Campi opzionali proprietario:</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                          <p>• <strong>proprietario</strong> - es. "Mario Rossi"</p>
                          <p>• <strong>email</strong> - email del proprietario</p>
                          <p>• <strong>telefono</strong> - es. "+39 333 1234567"</p>
                          <p>• <strong>indirizzo</strong> - indirizzo completo</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Campi opzionali vaccino:</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                          <p>• <strong>vaccino</strong> - es. "Polivalente"</p>
                          <p>• <strong>data_vaccino</strong> - formato: 01/01/2024</p>
                          <p>• <strong>scadenza_vaccino</strong> - formato: 01/01/2025</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg mt-3">
                        <p className="text-blue-700"><strong>💡 Tip:</strong> Se un proprietario ha più animali, aggiungi una riga per ogni animale con lo stesso email del proprietario.</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="gestionale" className="border-0 border-t">
                  <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
                    <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> 🔄 Come esportare dal tuo gestionale</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3 text-sm text-gray-600">
                      <p><strong>1.</strong> Nel tuo gestionale attuale, cerca la funzione "Esporta" o "Export"</p>
                      <p><strong>2.</strong> Seleziona formato CSV o Excel</p>
                      <p><strong>3.</strong> Apri il file esportato con Excel o Google Sheets</p>
                      <p><strong>4.</strong> Rinomina le colonne secondo il nostro template</p>
                      <p><strong>5.</strong> Salva come CSV e caricalo qui</p>
                      <div className="bg-amber-50 p-3 rounded-lg mt-3">
                        <p className="text-amber-700"><strong>⏱️ Tempo stimato:</strong> 5-10 minuti per preparare il file, poi l'import è istantaneo!</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-sm">
                <p className="text-green-800"><strong>🔒 Privacy e GDPR:</strong> I dati vengono importati in modo sicuro e criptato. Solo la tua clinica avrà accesso. Conforme alle normative europee sulla protezione dei dati.</p>
              </div>
            </div>
          )}
          
          {/* Step 2: Upload Data */}
          {importStep === 2 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file" className="cursor-pointer">
                  {importFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="h-10 w-10 text-green-500" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{importFile.name}</p>
                        <p className="text-sm text-gray-500">{(importFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); setImportFile(null); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 font-medium">Trascina qui il file CSV o clicca per selezionare</p>
                      <p className="text-sm text-gray-400 mt-1">Formati supportati: CSV, Excel (.xlsx, .xls)</p>
                    </>
                  )}
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setImportStep(1)} className="flex-1">
                  ← Indietro
                </Button>
                <Button 
                  onClick={handleImportData} 
                  disabled={!importFile || importing}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  {importing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importazione...</>
                  ) : (
                    <>Importa Dati →</>
                  )}
                </Button>
              </div>
              
              {importResults && importResults.error && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-red-700 text-sm">
                  <strong>Errore:</strong> {importResults.error}
                </div>
              )}
            </div>
          )}
          
          {/* Step 3: Upload Documents */}
          {importStep === 3 && (
            <div className="space-y-4">
              {importResults && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" /> Dati importati con successo!
                  </h3>
                  <div className="mt-2 text-sm text-green-700 grid grid-cols-3 gap-2">
                    <span>👤 {importResults.imported?.owners || 0} proprietari</span>
                    <span>🐾 {importResults.imported?.pets || 0} animali</span>
                    <span>💉 {importResults.imported?.vaccines || 0} vaccini</span>
                  </div>
                  {importResults.warnings?.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-amber-600 cursor-pointer text-sm">⚠️ {importResults.warnings.length} avvisi</summary>
                      <ul className="text-xs text-amber-600 mt-1 max-h-20 overflow-auto">
                        {importResults.warnings.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </details>
                  )}
                </div>
              )}
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleDocsChange}
                  className="hidden"
                  id="import-docs"
                />
                <label htmlFor="import-docs" className="cursor-pointer">
                  <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 font-medium">Carica documenti (opzionale)</p>
                  <p className="text-sm text-gray-400">PDF, JPG, PNG - Nomina i file con il nome del paziente per associazione automatica</p>
                </label>
              </div>
              
              {importDocs.length > 0 && (
                <div className="max-h-40 overflow-auto space-y-2">
                  {importDocs.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        {doc.type.includes('pdf') ? <FileText className="h-4 w-4 text-red-500" /> : <Image className="h-4 w-4 text-blue-500" />}
                        <span className="text-sm truncate max-w-xs">{doc.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeDoc(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setImportStep(4)} className="flex-1">
                  Salta questo step
                </Button>
                <Button 
                  onClick={handleImportDocs} 
                  disabled={importing}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  {importing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Caricamento...</>
                  ) : (
                    <>Carica {importDocs.length} documenti →</>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 4: Results */}
          {importStep === 4 && (
            <div className="space-y-4 text-center">
              <div className="py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Import Completato!</h3>
                <p className="text-gray-500 mt-2">I tuoi pazienti sono stati importati con successo.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{importResults?.imported?.owners || 0}</p>
                    <p className="text-xs text-gray-500">Proprietari</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-coral-500">{importResults?.imported?.pets || 0}</p>
                    <p className="text-xs text-gray-500">Animali</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{importResults?.imported?.vaccines || 0}</p>
                    <p className="text-xs text-gray-500">Vaccini</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{importResults?.imported?.documents || 0}</p>
                    <p className="text-xs text-gray-500">Documenti</p>
                  </div>
                </div>
              </div>
              
              {(importResults?.warnings?.length > 0 || importResults?.errors?.length > 0) && (
                <div className="bg-amber-50 p-3 rounded-lg text-left text-sm">
                  {importResults.errors?.length > 0 && (
                    <p className="text-red-600 mb-1">❌ {importResults.errors.length} errori</p>
                  )}
                  {importResults.warnings?.length > 0 && (
                    <p className="text-amber-600">⚠️ {importResults.warnings.length} avvisi - alcuni dati potrebbero richiedere revisione</p>
                  )}
                </div>
              )}
              
              <Button onClick={resetImport} className="w-full bg-coral-500 hover:bg-coral-600">
                Chiudi e vedi i pazienti
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Barra di ricerca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Cerca per nome animale, razza, microchip o proprietario..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            {filteredPets.length} risultat{filteredPets.length === 1 ? 'o' : 'i'} per "{searchQuery}"
          </p>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPets.length === 0 ? (
          <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>{searchQuery ? 'Nessun risultato trovato' : 'Nessun paziente'}</p></CardContent></Card>
        ) : filteredPets.map((pet) => (
          <Card key={pet.id} className="cursor-pointer hover:shadow-lg hover:border-coral-300 transition-all group" onClick={() => openPetDetails(pet)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center group-hover:bg-coral-200 transition-colors">
                  {pet.species === 'dog' ? <Dog className="h-6 w-6 text-coral-600" /> : pet.species === 'cat' ? <Cat className="h-6 w-6 text-coral-600" /> : <PawPrint className="h-6 w-6 text-coral-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{pet.name}</p>
                  <p className="text-sm text-gray-500">{pet.breed || (pet.species === 'dog' ? 'Cane' : pet.species === 'cat' ? 'Gatto' : 'Altro')}</p>
                  {pet.ownerId && <p className="text-xs text-gray-400 mt-1">👤 {getOwnerName(pet.ownerId)}</p>}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-coral-500 transition-colors" />
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {pet.sterilized && <Badge variant="outline" className="text-xs text-green-600 border-green-300">Sterilizzato</Badge>}
                {pet.microchip && <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">Microchip</Badge>}
                {pet.allergies && <Badge variant="outline" className="text-xs text-red-600 border-red-300">Allergie</Badge>}
                {pet.insurance && <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">Assicurato</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Detail Modal */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 bg-coral-100 rounded-full flex items-center justify-center">
                {selectedPet?.species === 'dog' ? <Dog className="h-5 w-5 text-coral-600" /> : selectedPet?.species === 'cat' ? <Cat className="h-5 w-5 text-coral-600" /> : <PawPrint className="h-5 w-5 text-coral-600" />}
              </div>
              {selectedPet?.name || 'Dettagli Paziente'}
            </DialogTitle>
            <DialogDescription>{selectedPet?.breed || 'Scheda clinica completa'}</DialogDescription>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-coral-500" /></div>
          ) : petDetails ? (
            <div className="space-y-6 mt-4">
              {/* Info Base */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Specie</p>
                  <p className="font-medium">{petDetails.species === 'dog' ? 'Cane' : petDetails.species === 'cat' ? 'Gatto' : 'Altro'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Razza</p>
                  <p className="font-medium">{petDetails.breed || 'Non specificata'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Età</p>
                  <p className="font-medium">{calculateAge(petDetails.birthDate) || 'Non specificata'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Peso</p>
                  <p className="font-medium">{petDetails.weight ? `${petDetails.weight} kg` : 'Non registrato'}</p>
                </div>
              </div>
              
              {/* Proprietario - Con email e telefono, cliccabile */}
              {petDetails.ownerId && (() => {
                const owner = getOwnerDetails(petDetails.ownerId);
                return (
                  <div 
                    className="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => {
                      if (owner && onOpenOwner) {
                        setShowDetailDialog(false);
                        onOpenOwner(owner);
                      }
                    }}
                  >
                    <p className="text-sm text-blue-600 font-medium mb-2">👤 Proprietario</p>
                    <p className="font-medium text-lg">{owner?.name || 'Non assegnato'}</p>
                    {owner?.email && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{owner.email}</span>
                      </div>
                    )}
                    {owner?.phone && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{owner.phone}</span>
                      </div>
                    )}
                    {owner && onOpenOwner && (
                      <p className="text-xs text-blue-500 mt-2">Clicca per vedere la scheda cliente →</p>
                    )}
                  </div>
                );
              })()}
              
              {/* Microchip */}
              {petDetails.microchip && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Microchip</p>
                  <p className="font-mono font-medium">{petDetails.microchip}</p>
                </div>
              )}
              
              {/* Assicurazione */}
              {petDetails.insurance && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium mb-2">🛡️ Assicurazione</p>
                  <p className="font-medium">{petDetails.insuranceCompany || 'Compagnia non specificata'}</p>
                  {petDetails.insurancePolicy && <p className="text-sm text-gray-500">Polizza: {petDetails.insurancePolicy}</p>}
                </div>
              )}
              
              {/* Condizioni Mediche */}
              {(petDetails.chronicDiseases || petDetails.currentConditions || petDetails.allergies) && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600 font-medium mb-2">⚠️ Condizioni Mediche</p>
                  {petDetails.chronicDiseases && <p className="text-sm mb-2"><strong>Patologie croniche:</strong> {petDetails.chronicDiseases}</p>}
                  {petDetails.currentConditions && <p className="text-sm mb-2"><strong>Condizioni attuali:</strong> {petDetails.currentConditions}</p>}
                  {petDetails.allergies && <p className="text-sm"><strong>Allergie:</strong> {petDetails.allergies}</p>}
                </div>
              )}
              
              {/* Farmaci */}
              {petDetails.medications && (
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-600 font-medium mb-2">💊 Farmaci in corso</p>
                  {Array.isArray(petDetails.medications) ? (
                    <div className="space-y-1">
                      {petDetails.medications.map((med, i) => (
                        <p key={i} className="text-sm">{typeof med === 'object' ? `${med.name} - ${med.dosage} (${med.frequency})` : med}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm">{petDetails.medications}</p>
                  )}
                </div>
              )}
              
              {/* Storico Pesi */}
              {petDetails.weightHistory && petDetails.weightHistory.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-2">📊 Storico Pesi</p>
                  <div className="space-y-1">
                    {petDetails.weightHistory.slice(-5).reverse().map((w, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{new Date(w.date).toLocaleDateString('it-IT')}</span>
                        <span className="font-medium">{w.weight} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Appuntamenti recenti */}
              {petDetails.appointments && petDetails.appointments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">📅 Ultimi appuntamenti</p>
                  <div className="space-y-2">
                    {petDetails.appointments.slice(0, 5).map((apt, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{apt.type || apt.reason || 'Visita'}</p>
                          <p className="text-xs text-gray-500">{new Date(apt.date).toLocaleDateString('it-IT')}</p>
                        </div>
                        <Badge variant={apt.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                          {apt.status === 'completed' ? 'Completato' : apt.status === 'cancelled' ? 'Annullato' : 'Programmato'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Note */}
              {petDetails.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">📝 Note comportamentali</p>
                  <p className="text-sm">{petDetails.notes}</p>
                </div>
              )}
              
              {/* Esami Laboratorio */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-medium flex items-center gap-2">🔬 Esami di Laboratorio</p>
                  <Button size="sm" onClick={openLabDialog} className="bg-purple-500 hover:bg-purple-600">
                    <Plus className="h-4 w-4 mr-1" />
                    Richiedi Esami
                  </Button>
                </div>
                {labRequests.length > 0 ? (
                  <div className="space-y-2">
                    {labRequests.slice(0, 3).map((req, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{req.exams?.map(e => e.name).join(', ').substring(0, 50)}...</p>
                          <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString('it-IT')} • {req.practiceCode}</p>
                        </div>
                        {getLabStatusBadge(req.status)}
                      </div>
                    ))}
                    {labRequests.length > 3 && (
                      <Button variant="link" size="sm" onClick={openLabDialog} className="text-purple-600">
                        Vedi tutti ({labRequests.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Nessuna richiesta esami</p>
                )}
              </div>
              
              {/* Azioni - Modifica e Elimina */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={handleEditPet}>
                  <Edit className="h-4 w-4 mr-2" />Modifica
                </Button>
                <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleDeletePet}>
                  <Trash2 className="h-4 w-4 mr-2" />Elimina
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      
      {/* Dialog Modifica Animale */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica {selectedPet?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome</Label>
              <Input value={editFormData.name || ''} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
            </div>
            <div>
              <Label>Specie</Label>
              <Select value={editFormData.species || 'dog'} onValueChange={(v) => setEditFormData({...editFormData, species: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">🐕 Cane</SelectItem>
                  <SelectItem value="cat">🐱 Gatto</SelectItem>
                  <SelectItem value="horse">🐴 Cavallo</SelectItem>
                  <SelectItem value="bird">🦜 Uccello</SelectItem>
                  <SelectItem value="rabbit">🐰 Coniglio</SelectItem>
                  <SelectItem value="other">🐾 Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Razza</Label>
              <Input value={editFormData.breed || ''} onChange={(e) => setEditFormData({...editFormData, breed: e.target.value})} />
            </div>
            <div>
              <Label>Peso (kg)</Label>
              <Input type="number" step="0.1" value={editFormData.weight || ''} onChange={(e) => setEditFormData({...editFormData, weight: e.target.value})} />
            </div>
            <div>
              <Label>Microchip</Label>
              <Input value={editFormData.microchip || ''} onChange={(e) => setEditFormData({...editFormData, microchip: e.target.value})} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">Annulla</Button>
              <Button onClick={handleSaveEdit} className="flex-1 bg-coral-500 hover:bg-coral-600">Salva</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Richiedi Esami Lab */}
      <Dialog open={showLabDialog} onOpenChange={setShowLabDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Beaker className="h-4 w-4 text-purple-600" />
              </div>
              Richiedi Esami per {selectedPet?.name}
            </DialogTitle>
            <DialogDescription>Seleziona gli esami da richiedere al laboratorio</DialogDescription>
          </DialogHeader>
          
          {labLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {/* Filtro Categoria */}
              <div className="flex gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  variant={labCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setLabCategory('all')}
                >
                  Tutti
                </Button>
                {['routine', 'endocrino', 'infettivologia', 'microbiologia', 'citologia', 'istologia', 'cardiologia', 'altro'].map(cat => (
                  <Button 
                    key={cat}
                    size="sm" 
                    variant={labCategory === cat ? 'default' : 'outline'}
                    onClick={() => setLabCategory(cat)}
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              
              {/* Lista Esami */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto border rounded-lg p-3">
                {labExams
                  .filter(exam => labCategory === 'all' || exam.category === labCategory)
                  .map(exam => (
                    <div
                      key={exam.id}
                      onClick={() => toggleExamSelection(exam)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        selectedLabExams.find(e => e.id === exam.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                          selectedLabExams.find(e => e.id === exam.id)
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedLabExams.find(e => e.id === exam.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{exam.name}</p>
                          <p className="text-xs text-gray-500">{exam.description}</p>
                          <div className="flex gap-3 mt-1 text-xs text-gray-400">
                            <span>⏱ {exam.turnaroundHours}h</span>
                            <span>€{exam.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Esami Selezionati */}
              {selectedLabExams.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="font-medium text-purple-700 mb-2">Esami selezionati ({selectedLabExams.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLabExams.map(exam => (
                      <Badge 
                        key={exam.id} 
                        className="bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200"
                        onClick={() => toggleExamSelection(exam)}
                      >
                        {exam.name} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-purple-600 mt-2">
                    Totale: €{selectedLabExams.reduce((sum, e) => sum + (e.price || 0), 0)} • 
                    Tempo max: {Math.max(...selectedLabExams.map(e => e.turnaroundHours || 72))}h
                  </p>
                </div>
              )}
              
              {/* Note Cliniche */}
              <div>
                <Label>Note cliniche per il laboratorio</Label>
                <Textarea 
                  placeholder="Anamnesi, sospetto diagnostico, informazioni rilevanti..."
                  value={labClinicalNotes}
                  onChange={(e) => setLabClinicalNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              {/* Storico Richieste */}
              {labRequests.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Storico richieste ({labRequests.length})</p>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {labRequests.map((req, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{req.practiceCode}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(req.createdAt).toLocaleDateString('it-IT')} • 
                            {req.exams?.length} esami
                          </p>
                        </div>
                        {getLabStatusBadge(req.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Azioni */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowLabDialog(false)} className="flex-1">
                  Annulla
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => submitLabRequest(false)} 
                  disabled={selectedLabExams.length === 0 || labLoading}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salva Bozza
                </Button>
                <Button 
                  onClick={() => submitLabRequest(true)} 
                  disabled={selectedLabExams.length === 0 || labLoading}
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Invia al Lab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClinicOwners({ owners, onRefresh, onNavigate, pets = [], onOpenPet, initialOwner, onClearInitialOwner }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Apri automaticamente il proprietario se viene passato da un altro componente
  useEffect(() => {
    if (initialOwner) {
      openOwnerDetails(initialOwner);
      if (onClearInitialOwner) onClearInitialOwner();
    }
  }, [initialOwner]);
  
  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('owners', formData); setShowDialog(false); onRefresh(); } catch (error) { alert(error.message); } };
  
  const openOwnerDetails = (owner) => {
    setSelectedOwner(owner);
    setShowDetailDialog(true);
  };
  
  const getOwnerPets = (ownerId) => {
    return pets.filter(p => p.ownerId === ownerId);
  };
  
  // Filtra i proprietari per la ricerca
  const filteredOwners = owners.filter(owner => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const ownerPets = getOwnerPets(owner.id);
    const petNames = ownerPets.map(p => p.name?.toLowerCase() || '').join(' ');
    return (
      owner.name?.toLowerCase().includes(query) ||
      owner.email?.toLowerCase().includes(query) ||
      owner.phone?.toLowerCase().includes(query) ||
      petNames.includes(query)
    );
  });
  
  const handlePetClick = (pet) => {
    if (onOpenPet) {
      setShowDetailDialog(false);
      onOpenPet(pet);
    }
  };
  
  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Proprietari</h2>
          <p className="text-gray-500 text-sm">Clienti della clinica - clicca per vedere i dettagli</p>
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
      
      {/* Barra di ricerca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Cerca per nome, email, telefono o animale..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            {filteredOwners.length} risultat{filteredOwners.length === 1 ? 'o' : 'i'} per "{searchQuery}"
          </p>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOwners.length === 0 ? (
          <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><User className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>{searchQuery ? 'Nessun risultato trovato' : 'Nessun proprietario'}</p></CardContent></Card>
        ) : filteredOwners.map((owner) => {
          const ownerPets = getOwnerPets(owner.id);
          return (
            <Card key={owner.id} className="cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group" onClick={() => openOwnerDetails(owner)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{owner.name}</p>
                    <p className="text-sm text-gray-500">{owner.email}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
                {owner.phone && <p className="text-sm text-gray-500 mt-3 flex items-center gap-2"><Phone className="h-4 w-4" />{owner.phone}</p>}
                {ownerPets.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {ownerPets.slice(0, 3).map(pet => (
                      <Badge key={pet.id} variant="outline" className="text-xs">
                        {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'} {pet.name}
                      </Badge>
                    ))}
                    {ownerPets.length > 3 && <Badge variant="outline" className="text-xs">+{ownerPets.length - 3}</Badge>}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Detail Modal */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              {selectedOwner?.name || 'Dettagli Proprietario'}
            </DialogTitle>
            <DialogDescription>Scheda cliente</DialogDescription>
          </DialogHeader>
          
          {selectedOwner && (
            <div className="space-y-4 mt-4">
              {/* Contatti */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{selectedOwner.email}</p>
                  </div>
                </div>
                {selectedOwner.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Telefono</p>
                      <p className="font-medium">{selectedOwner.phone}</p>
                    </div>
                  </div>
                )}
                {selectedOwner.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Indirizzo</p>
                      <p className="font-medium">{selectedOwner.address}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Animali del proprietario - Cliccabili */}
              {(() => {
                const ownerPets = getOwnerPets(selectedOwner.id);
                if (ownerPets.length === 0) return null;
                return (
                  <div>
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <PawPrint className="h-4 w-4" /> Animali ({ownerPets.length})
                    </p>
                    <div className="space-y-2">
                      {ownerPets.map(pet => (
                        <div 
                          key={pet.id} 
                          className="flex items-center gap-3 p-3 bg-coral-50 rounded-lg cursor-pointer hover:bg-coral-100 transition-colors"
                          onClick={() => handlePetClick(pet)}
                        >
                          <div className="h-10 w-10 bg-coral-100 rounded-full flex items-center justify-center">
                            {pet.species === 'dog' ? <Dog className="h-5 w-5 text-coral-600" /> : pet.species === 'cat' ? <Cat className="h-5 w-5 text-coral-600" /> : <PawPrint className="h-5 w-5 text-coral-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{pet.name}</p>
                            <p className="text-xs text-gray-500">{pet.breed || (pet.species === 'dog' ? 'Cane' : pet.species === 'cat' ? 'Gatto' : 'Altro')}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              
              {/* Data registrazione */}
              {selectedOwner.createdAt && (
                <p className="text-xs text-gray-400 text-center pt-2 border-t">
                  Cliente dal {new Date(selectedOwner.createdAt).toLocaleDateString('it-IT')}
                </p>
              )}
              
              {/* Quick Actions */}
              <div className="flex gap-2 pt-2 flex-wrap">
                <Button variant="outline" className="flex-1 min-w-[100px]" onClick={() => window.location.href = `mailto:${selectedOwner.email}`}>
                  <Mail className="h-4 w-4 mr-2" /> Email
                </Button>
                {selectedOwner.phone && (
                  <>
                    <Button variant="outline" className="flex-1 min-w-[100px]" onClick={() => window.location.href = `tel:${selectedOwner.phone}`}>
                      <Phone className="h-4 w-4 mr-2" /> Chiama
                    </Button>
                    <Button variant="outline" className="flex-1 min-w-[100px] text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => window.open(`https://wa.me/${selectedOwner.phone.replace(/\s+/g, '').replace(/^\+/, '')}`, '_blank')}>
                      <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
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

// Clinic Services - Servizi offerti con prezzi e servizi custom
function ClinicServices({ onNavigate, user }) {
  const [serviceCatalog, setServiceCatalog] = useState({});
  // selectedServices now stores objects: { id, price } or for custom: { id, name, description, price, isCustom: true }
  const [selectedServices, setSelectedServices] = useState([]);
  const [customServices, setCustomServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', description: '', price: '' });
  const [editingPrice, setEditingPrice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadServiceCatalog();
    // Parse user services - could be array of IDs (old format) or array of objects (new format)
    if (user?.services) {
      if (Array.isArray(user.services)) {
        // Check if old format (array of strings) or new format (array of objects)
        if (user.services.length > 0 && typeof user.services[0] === 'string') {
          // Convert old format to new
          setSelectedServices(user.services.map(id => ({ id, price: null })));
        } else {
          setSelectedServices(user.services.filter(s => !s.isCustom));
          setCustomServices(user.services.filter(s => s.isCustom) || []);
        }
      }
    }
    if (user?.customServices) {
      setCustomServices(user.customServices);
    }
  }, []);

  const loadServiceCatalog = async () => {
    try {
      const response = await api.get('services');
      // L'API restituisce { services, categories, grouped }
      // Usiamo 'grouped' che ha il formato corretto per il catalogo
      if (response.grouped) {
        setServiceCatalog(response.grouped);
      } else if (response.categories) {
        // Fallback: costruisci il catalogo dalle categorie
        const catalog = {};
        for (const cat of response.categories) {
          catalog[cat.id] = {
            ...cat,
            services: (response.services || []).filter(s => s.category === cat.id)
          };
        }
        setServiceCatalog(catalog);
      } else {
        setServiceCatalog(response);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const isServiceSelected = (serviceId) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  const getServicePrice = (serviceId) => {
    const service = selectedServices.find(s => s.id === serviceId);
    return service?.price || '';
  };

  const toggleService = (serviceId) => {
    if (isServiceSelected(serviceId)) {
      setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
    } else {
      setSelectedServices(prev => [...prev, { id: serviceId, price: null }]);
    }
  };

  const updateServicePrice = (serviceId, price) => {
    setSelectedServices(prev => prev.map(s => 
      s.id === serviceId ? { ...s, price: price ? parseFloat(price) : null } : s
    ));
  };

  const addCustomService = () => {
    if (!customForm.name.trim()) {
      alert('Inserisci il nome del servizio');
      return;
    }
    const newService = {
      id: 'custom_' + Date.now(),
      name: customForm.name,
      description: customForm.description,
      price: customForm.price ? parseFloat(customForm.price) : null,
      isCustom: true
    };
    setCustomServices(prev => [...prev, newService]);
    setCustomForm({ name: '', description: '', price: '' });
    setShowAddCustom(false);
  };

  const removeCustomService = (serviceId) => {
    setCustomServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const updateCustomServicePrice = (serviceId, price) => {
    setCustomServices(prev => prev.map(s => 
      s.id === serviceId ? { ...s, price: price ? parseFloat(price) : null } : s
    ));
  };

  const saveServices = async () => {
    setSaving(true);
    try {
      await api.put('clinic/services', { 
        services: selectedServices,
        customServices: customServices 
      });
      alert('✅ Servizi e prezzi salvati con successo!');
    } catch (error) {
      alert('❌ Errore nel salvataggio: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const selectAll = (categoryId) => {
    const category = serviceCatalog[categoryId];
    if (!category || !category.services) return;
    const categoryServiceIds = category.services.map(s => s.id);
    const allSelected = categoryServiceIds.every(id => isServiceSelected(id));
    if (allSelected) {
      setSelectedServices(prev => prev.filter(s => !categoryServiceIds.includes(s.id)));
    } else {
      const newServices = categoryServiceIds
        .filter(id => !isServiceSelected(id))
        .map(id => ({ id, price: null }));
      setSelectedServices(prev => [...prev, ...newServices]);
    }
  };

  const getCategoryIcon = (iconName) => {
    const icons = { Stethoscope, UserCog: Settings, Scissors, Search, Plus };
    return icons[iconName] || Stethoscope;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><div className="text-center"><Stethoscope className="h-8 w-8 text-coral-500 mx-auto mb-2 animate-pulse" /><p className="text-gray-500">Caricamento servizi...</p></div></div>;
  }

  const allCatalogServices = Object.entries(serviceCatalog).flatMap(([catId, cat]) => 
    (cat?.services || []).map(s => ({ ...s, categoryId: catId, categoryName: cat?.name || catId }))
  );

  const baseFilteredServices = activeCategory === 'all' 
    ? allCatalogServices 
    : activeCategory === 'custom'
    ? []
    : serviceCatalog[activeCategory]?.services.map(s => ({ ...s, categoryId: activeCategory, categoryName: serviceCatalog[activeCategory].name })) || [];

  // Apply search filter
  const filteredServices = searchQuery.trim() 
    ? baseFilteredServices.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : baseFilteredServices;

  const totalActiveServices = selectedServices.length + customServices.length;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🏥 Servizi e Listino Prezzi</h2>
          <p className="text-gray-500 text-sm">Seleziona i servizi che offri e imposta i prezzi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddCustom(true)}>
            <Plus className="h-4 w-4 mr-2" />Nuovo Servizio
          </Button>
          <Button onClick={saveServices} disabled={saving} className="bg-coral-500 hover:bg-coral-600">
            {saving ? <><Clock className="h-4 w-4 mr-2 animate-spin" />Salvataggio...</> : <><Check className="h-4 w-4 mr-2" />Salva tutto</>}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-coral-50 to-white border-coral-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-coral-500">{totalActiveServices}</p>
            <p className="text-sm text-gray-500">Servizi attivi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{selectedServices.filter(s => s.price).length}</p>
            <p className="text-sm text-gray-500">Con prezzo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{customServices.length}</p>
            <p className="text-sm text-gray-500">Servizi custom</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">{selectedServices.filter(s => !s.price).length}</p>
            <p className="text-sm text-gray-500">Senza prezzo</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cerca servizi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant={activeCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory('all')} className={activeCategory === 'all' ? 'bg-coral-500' : ''}>
          Catalogo ({allCatalogServices.length})
        </Button>
        {Object.entries(serviceCatalog).map(([catId, cat]) => {
          if (!cat?.services) return null;
          const Icon = getCategoryIcon(cat.icon);
          const selectedCount = cat.services.filter(s => isServiceSelected(s.id)).length;
          return (
            <Button key={catId} variant={activeCategory === catId ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory(catId)} className={activeCategory === catId ? 'bg-coral-500' : ''}>
              <Icon className="h-4 w-4 mr-1" />{cat.name} ({selectedCount}/{cat.services.length})
            </Button>
          );
        })}
        <Button variant={activeCategory === 'custom' ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory('custom')} className={activeCategory === 'custom' ? 'bg-purple-500' : ''}>
          <Star className="h-4 w-4 mr-1" />I miei servizi ({customServices.length})
        </Button>
      </div>

      {/* Custom Services Section */}
      {activeCategory === 'custom' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Servizi personalizzati</h3>
            <Button size="sm" onClick={() => setShowAddCustom(true)} className="bg-purple-500 hover:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />Aggiungi
            </Button>
          </div>
          {customServices.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Non hai ancora creato servizi personalizzati</p>
                <Button variant="outline" onClick={() => setShowAddCustom(true)}>
                  <Plus className="h-4 w-4 mr-2" />Crea il tuo primo servizio
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customServices.map((service) => (
                <Card key={service.id} className="border-purple-200 bg-purple-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Badge className="bg-purple-500 text-white mb-2">Personalizzato</Badge>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.description && <p className="text-sm text-gray-500 mt-1">{service.description}</p>}
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeCustomService(service.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Euro className="h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="Prezzo €" 
                        value={service.price || ''} 
                        onChange={(e) => updateCustomServicePrice(service.id, e.target.value)}
                        className="h-8 w-24"
                      />
                      <span className="text-sm text-gray-500">€</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Select All for category */}
      {activeCategory !== 'all' && activeCategory !== 'custom' && serviceCatalog[activeCategory]?.services && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Seleziona tutti i servizi di questa categoria</span>
          <Button variant="outline" size="sm" onClick={() => selectAll(activeCategory)}>
            {serviceCatalog[activeCategory]?.services?.every(s => isServiceSelected(s.id)) ? 'Deseleziona tutti' : 'Seleziona tutti'}
          </Button>
        </div>
      )}

      {/* Services Grid */}
      {activeCategory !== 'custom' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const isSelected = isServiceSelected(service.id);
            const price = getServicePrice(service.id);
            return (
              <Card key={service.id} className={`transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-coral-500 bg-coral-50' : 'hover:border-gray-300'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => toggleService(service.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{service.categoryName}</Badge>
                      </div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                    </div>
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 cursor-pointer ${isSelected ? 'bg-coral-500 border-coral-500' : 'border-gray-300'}`} onClick={() => toggleService(service.id)}>
                      {isSelected && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-coral-200">
                      <Euro className="h-4 w-4 text-coral-400" />
                      <Input 
                        type="number" 
                        placeholder="Prezzo" 
                        value={price} 
                        onChange={(e) => updateServicePrice(service.id, e.target.value)}
                        className="h-8 w-24 border-coral-200 focus:border-coral-400"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm text-gray-500">€</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredServices.length === 0 && activeCategory !== 'custom' && (
        <div className="text-center py-12">
          <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nessun servizio in questa categoria</p>
        </div>
      )}

      {/* Add Custom Service Dialog */}
      <Dialog open={showAddCustom} onOpenChange={setShowAddCustom}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Servizio Personalizzato</DialogTitle>
            <DialogDescription>Crea un servizio che non è presente nel catalogo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome servizio *</Label>
              <Input 
                value={customForm.name} 
                onChange={(e) => setCustomForm({...customForm, name: e.target.value})}
                placeholder="Es: Consulto nutrizionale"
              />
            </div>
            <div>
              <Label>Descrizione</Label>
              <Textarea 
                value={customForm.description} 
                onChange={(e) => setCustomForm({...customForm, description: e.target.value})}
                placeholder="Descrivi brevemente il servizio..."
                rows={2}
              />
            </div>
            <div>
              <Label>Prezzo (€)</Label>
              <Input 
                type="number"
                value={customForm.price} 
                onChange={(e) => setCustomForm({...customForm, price: e.target.value})}
                placeholder="50"
              />
            </div>
            <Button onClick={addCustomService} className="w-full bg-purple-500 hover:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />Aggiungi servizio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== VIDEO CONSULT CONFIGURATION ====================
function ClinicVideoConsult({ user, onNavigate }) {
  const [settings, setSettings] = useState({
    enabled: true,
    price: 35,
    duration: 20,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timeSlots: [
      { start: '09:00', end: '12:00' },
      { start: '14:00', end: '18:00' }
    ],
    maxPerDay: 5,
    reminderEmail24h: true,
    reminderEmail1h: true,
    autoConfirm: true
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const dayLabels = {
    monday: 'Lunedì',
    tuesday: 'Martedì',
    wednesday: 'Mercoledì',
    thursday: 'Giovedì',
    friday: 'Venerdì',
    saturday: 'Sabato',
    sunday: 'Domenica'
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('clinic/video-consult-settings');
      if (response) {
        setSettings(prev => ({ ...prev, ...response }));
      }
    } catch (error) {
      console.error('Error loading video consult settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.post('clinic/video-consult-settings', settings);
      alert('Impostazioni Video Consulto salvate!');
    } catch (error) {
      alert('Errore nel salvare le impostazioni');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setSettings(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const addTimeSlot = () => {
    setSettings(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { start: '09:00', end: '13:00' }]
    }));
  };

  const removeTimeSlot = (index) => {
    setSettings(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Video className="h-7 w-7 text-blue-500" />
              Video Consulto
            </h2>
            <p className="text-gray-500 text-sm">Configura disponibilità, prezzi e promemoria</p>
          </div>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {saving ? 'Salvataggio...' : '✓ Salva Impostazioni'}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Colonna Sinistra - Configurazione Base */}
        <div className="space-y-6">
          {/* Abilitazione e Prezzi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                Configurazione Base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Video Consulto Attivo</p>
                  <p className="text-sm text-gray-500">I clienti possono prenotare video consulti</p>
                </div>
                <button 
                  onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative w-14 h-7 rounded-full transition-colors ${settings.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.enabled ? 'translate-x-7' : ''}`} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prezzo (€)</Label>
                  <Input 
                    type="number" 
                    value={settings.price} 
                    onChange={(e) => setSettings(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
                <div>
                  <Label>Durata (minuti)</Label>
                  <Input 
                    type="number" 
                    value={settings.duration} 
                    onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) || 20 }))}
                    min="10"
                    step="5"
                  />
                </div>
              </div>

              <div>
                <Label>Max consulti per giorno</Label>
                <Input 
                  type="number" 
                  value={settings.maxPerDay} 
                  onChange={(e) => setSettings(prev => ({ ...prev, maxPerDay: parseInt(e.target.value) || 5 }))}
                  min="1"
                  max="20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Promemoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                Promemoria Automatici
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Reminder 24h prima</p>
                  <p className="text-xs text-gray-500">Email al cliente con link video</p>
                </div>
                <button 
                  onClick={() => setSettings(prev => ({ ...prev, reminderEmail24h: !prev.reminderEmail24h }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.reminderEmail24h ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.reminderEmail24h ? 'translate-x-6' : ''}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Reminder 1h prima</p>
                  <p className="text-xs text-gray-500">Email di promemoria last-minute</p>
                </div>
                <button 
                  onClick={() => setSettings(prev => ({ ...prev, reminderEmail1h: !prev.reminderEmail1h }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.reminderEmail1h ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.reminderEmail1h ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Conferma Automatica</p>
                  <p className="text-xs text-gray-500">Conferma prenotazioni automaticamente</p>
                </div>
                <button 
                  onClick={() => setSettings(prev => ({ ...prev, autoConfirm: !prev.autoConfirm }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.autoConfirm ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.autoConfirm ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonna Destra - Disponibilità */}
        <div className="space-y-6">
          {/* Giorni Disponibili */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Giorni Disponibili
              </CardTitle>
              <CardDescription>Seleziona i giorni in cui offri video consulti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(dayLabels).map(([day, label]) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`p-3 rounded-lg border text-sm font-medium transition ${
                      settings.availableDays.includes(day)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fasce Orarie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Fasce Orarie
              </CardTitle>
              <CardDescription>Definisci gli orari disponibili per i video consulti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings.timeSlots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <Input 
                      type="time" 
                      value={slot.start} 
                      onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                      className="w-28"
                    />
                    <span className="text-gray-400">→</span>
                    <Input 
                      type="time" 
                      value={slot.end} 
                      onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                      className="w-28"
                    />
                  </div>
                  {settings.timeSlots.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={addTimeSlot}
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Fascia Oraria
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-800 mb-2">📋 Riepilogo Configurazione</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>• <strong>Prezzo:</strong> €{settings.price} / {settings.duration} min</p>
                <p>• <strong>Giorni:</strong> {settings.availableDays.map(d => dayLabels[d].substring(0, 3)).join(', ') || 'Nessuno'}</p>
                <p>• <strong>Orari:</strong> {settings.timeSlots.map(s => `${s.start}-${s.end}`).join(', ')}</p>
                <p>• <strong>Max/giorno:</strong> {settings.maxPerDay} consulti</p>
                <p>• <strong>Reminder:</strong> {[settings.reminderEmail24h && '24h', settings.reminderEmail1h && '1h'].filter(Boolean).join(', ') || 'Disattivati'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ==================== CLINIC REWARDS MANAGEMENT ====================
function ClinicRewardsManagement({ user, owners = [] }) {
  const [activeTab, setActiveTab] = useState('types');
  const [rewardTypes, setRewardTypes] = useState([]);
  const [assignedRewards, setAssignedRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTypeDialog, setShowNewTypeDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newType, setNewType] = useState({
    name: '',
    description: '',
    rewardType: 'discount_percent',
    value: 10,
    icon: 'Gift'
  });
  
  const [assignForm, setAssignForm] = useState({
    ownerId: '',
    rewardTypeId: '',
    reason: '',
    expiresAt: ''
  });

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const [types, assigned] = await Promise.all([
        api.get('rewards/types'),
        api.get('rewards/assigned')
      ]);
      setRewardTypes(types || []);
      setAssignedRewards(assigned || []);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateType = async () => {
    if (!newType.name) {
      alert('Inserisci un nome per il premio');
      return;
    }
    try {
      await api.post('rewards/types', newType);
      setShowNewTypeDialog(false);
      setNewType({ name: '', description: '', rewardType: 'discount_percent', value: 10, icon: 'Gift' });
      loadRewards();
      alert('✅ Tipo premio creato con successo!');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  const handleAssignReward = async () => {
    if (!assignForm.ownerId || !assignForm.rewardTypeId) {
      alert('Seleziona proprietario e tipo premio');
      return;
    }
    try {
      await api.post('rewards/assign', assignForm);
      setShowAssignDialog(false);
      setAssignForm({ ownerId: '', rewardTypeId: '', reason: '', expiresAt: '' });
      setSelectedOwner(null);
      loadRewards();
      alert('✅ Premio assegnato! Il proprietario riceverà una notifica email.');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  const handleMarkUsed = async (rewardId) => {
    if (!confirm('Confermi che il proprietario ha utilizzato questo premio?')) return;
    try {
      await api.post('rewards/use', { rewardId });
      loadRewards();
      alert('✅ Premio segnato come utilizzato');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  const filteredOwners = owners.filter(o => 
    o.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rewardTypeOptions = [
    { value: 'discount_percent', label: 'Sconto %', icon: '🏷️' },
    { value: 'discount_fixed', label: 'Sconto €', icon: '💶' },
    { value: 'free_service', label: 'Servizio Gratis', icon: '🎁' },
    { value: 'free_product', label: 'Prodotto Gratis', icon: '🛍️' },
    { value: 'gift', label: 'Regalo/Bonus', icon: '🎀' }
  ];

  const iconOptions = ['Gift', 'Euro', 'Heart', 'Star', 'Sparkles'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-coral-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="h-7 w-7 text-amber-500" />
            Premi Fedeltà
          </h1>
          <p className="text-gray-500 mt-1">Gestisci e assegna premi ai tuoi clienti</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewTypeDialog(true)} className="bg-amber-500 hover:bg-amber-600">
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Tipo Premio
          </Button>
          <Button onClick={() => setShowAssignDialog(true)} variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
            <UserPlus className="h-4 w-4 mr-2" />
            Assegna Premio
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'types' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('types')}
            className={activeTab === 'types' ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Tipi di Premio ({rewardTypes.length})
          </Button>
          <Button 
            variant={activeTab === 'assigned' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('assigned')}
            className={activeTab === 'assigned' ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Premi Assegnati ({assignedRewards.length})
          </Button>
        </div>
        
        {/* Search by Code */}
        {activeTab === 'assigned' && (
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca per codice premio (es. ABC123)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                className="pl-10 font-mono uppercase tracking-wider"
              />
            </div>
          </div>
        )}
      </div>

      {/* Types Tab */}
      {activeTab === 'types' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewardTypes.length === 0 ? (
            <Card className="col-span-full text-center py-12 bg-gray-50">
              <CardContent>
                <Gift className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nessun tipo di premio</h3>
                <p className="text-gray-500 mb-4">Crea il tuo primo tipo di premio fedeltà</p>
                <Button onClick={() => setShowNewTypeDialog(true)} className="bg-amber-500 hover:bg-amber-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Crea Tipo Premio
                </Button>
              </CardContent>
            </Card>
          ) : (
            rewardTypes.map((type) => (
              <Card key={type.id} className="border-amber-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white">
                      <Gift className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{type.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {rewardTypeOptions.find(r => r.value === type.rewardType)?.label || type.rewardType}
                        {type.value ? ` - ${type.rewardType.includes('percent') ? `${type.value}%` : `€${type.value}`}` : ''}
                      </Badge>
                      {type.description && (
                        <p className="text-sm text-gray-500 mt-2">{type.description}</p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4 border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => {
                      setAssignForm({ ...assignForm, rewardTypeId: type.id });
                      setShowAssignDialog(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assegna a Cliente
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Assigned Tab */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          {assignedRewards.length === 0 ? (
            <Card className="text-center py-12 bg-gray-50">
              <CardContent>
                <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nessun premio assegnato</h3>
                <p className="text-gray-500">Assegna il tuo primo premio a un cliente</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {searchQuery && assignedRewards.filter(r => 
                r.redeemCode?.includes(searchQuery) || 
                r.ownerName?.toUpperCase().includes(searchQuery)
              ).length === 0 ? (
                <Card className="text-center py-12 bg-amber-50 border-amber-200">
                  <CardContent>
                    <Search className="h-12 w-12 mx-auto text-amber-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Nessun premio trovato</h3>
                    <p className="text-gray-500">Codice "<strong className="font-mono">{searchQuery}</strong>" non trovato</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {searchQuery && (
                    <p className="text-sm text-gray-500">
                      Risultati per "<span className="font-mono font-bold">{searchQuery}</span>"
                    </p>
                  )}
                  {assignedRewards
                    .filter(r => !searchQuery || r.redeemCode?.includes(searchQuery) || r.ownerName?.toUpperCase().includes(searchQuery))
                    .map((reward) => {
                      const isPending = reward.status === 'pending';
                      const isUsed = reward.status === 'used';
                      const isAvailable = reward.status === 'available';
                      
                      return (
                        <Card key={reward.id} className={`
                          ${isUsed ? 'opacity-60 bg-gray-50' : ''}
                          ${isPending ? 'border-2 border-amber-400 bg-amber-50 shadow-md' : ''}
                          ${searchQuery && reward.redeemCode?.includes(searchQuery) ? 'ring-2 ring-green-500' : ''}
                        `}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  isPending 
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white animate-pulse'
                                    : isAvailable 
                                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' 
                                      : 'bg-gray-300 text-gray-500'
                                }`}>
                                  {isUsed ? <CheckCircle className="h-5 w-5" /> : isPending ? <Clock className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium">{reward.ownerName}</span>
                                    <Badge variant={isAvailable ? 'default' : 'secondary'} className={`
                                      ${isAvailable ? 'bg-green-500' : ''}
                                      ${isPending ? 'bg-amber-500 text-white animate-pulse' : ''}
                                    `}>
                                      {isAvailable ? 'Disponibile' : isPending ? '⏳ DA CONFERMARE' : 'Utilizzato'}
                                    </Badge>
                                    {reward.redeemCode && (
                                      <Badge variant="outline" className={`font-mono tracking-wider ${searchQuery && reward.redeemCode?.includes(searchQuery) ? 'bg-green-100 border-green-500 text-green-700' : ''}`}>
                                        {reward.redeemCode}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">{reward.rewardName} - {reward.reason}</p>
                                  <p className="text-xs text-gray-400">
                                    Assegnato il {new Date(reward.createdAt).toLocaleDateString('it-IT')}
                                    {reward.redeemedAt && ` • Riscattato il ${new Date(reward.redeemedAt).toLocaleDateString('it-IT')}`}
                                    {reward.usedAt && ` • Confermato il ${new Date(reward.usedAt).toLocaleDateString('it-IT')}`}
                                  </p>
                                </div>
                              </div>
                              {(isAvailable || isPending) && (
                                <Button 
                                  variant={isPending ? 'default' : 'outline'}
                                  size="sm" 
                                  onClick={() => handleMarkUsed(reward.id)}
                                  className={isPending 
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'text-green-600 border-green-300 hover:bg-green-50'
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  {isPending ? 'Conferma Utilizzo' : 'Segna Usato'}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Create Type Dialog */}
      <Dialog open={showNewTypeDialog} onOpenChange={setShowNewTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-500" />
              Crea Nuovo Tipo Premio
            </DialogTitle>
            <DialogDescription>
              Definisci un nuovo tipo di premio che potrai assegnare ai clienti
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome Premio *</Label>
              <Input 
                value={newType.name}
                onChange={(e) => setNewType({...newType, name: e.target.value})}
                placeholder="Es: Sconto Fedeltà, Visita Omaggio..."
              />
            </div>
            
            <div>
              <Label>Tipo</Label>
              <Select value={newType.rewardType} onValueChange={(v) => setNewType({...newType, rewardType: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rewardTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(newType.rewardType === 'discount_percent' || newType.rewardType === 'discount_fixed') && (
              <div>
                <Label>Valore {newType.rewardType === 'discount_percent' ? '(%)' : '(€)'}</Label>
                <Input 
                  type="number"
                  value={newType.value}
                  onChange={(e) => setNewType({...newType, value: parseInt(e.target.value) || 0})}
                  placeholder={newType.rewardType === 'discount_percent' ? "10" : "20"}
                />
              </div>
            )}
            
            <div>
              <Label>Descrizione (opzionale)</Label>
              <Textarea 
                value={newType.description}
                onChange={(e) => setNewType({...newType, description: e.target.value})}
                placeholder="Descrivi il premio..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTypeDialog(false)}>Annulla</Button>
            <Button onClick={handleCreateType} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="h-4 w-4 mr-2" />
              Crea Premio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-amber-500" />
              Assegna Premio a Cliente
            </DialogTitle>
            <DialogDescription>
              Seleziona un cliente e un tipo di premio da assegnare
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Search Owner */}
            <div>
              <Label>Cerca Cliente *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nome o email..."
                />
              </div>
              {searchQuery && filteredOwners.length > 0 && (
                <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                  {filteredOwners.slice(0, 5).map((owner) => (
                    <button
                      key={owner.id}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                        assignForm.ownerId === owner.id ? 'bg-amber-50 border-l-4 border-amber-500' : ''
                      }`}
                      onClick={() => {
                        setAssignForm({...assignForm, ownerId: owner.id});
                        setSelectedOwner(owner);
                        setSearchQuery('');
                      }}
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">{owner.name}</p>
                        <p className="text-xs text-gray-500">{owner.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedOwner && (
                <div className="mt-2 p-2 bg-amber-50 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">{selectedOwner.name}</span>
                  <button 
                    className="ml-auto text-gray-400 hover:text-gray-600"
                    onClick={() => { setSelectedOwner(null); setAssignForm({...assignForm, ownerId: ''}); }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Select Reward Type */}
            <div>
              <Label>Tipo Premio *</Label>
              <Select value={assignForm.rewardTypeId} onValueChange={(v) => setAssignForm({...assignForm, rewardTypeId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un premio..." />
                </SelectTrigger>
                <SelectContent>
                  {rewardTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      🎁 {type.name} {type.value ? `(${type.rewardType.includes('percent') ? `${type.value}%` : `€${type.value}`})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {rewardTypes.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Nessun tipo premio disponibile. <button onClick={() => { setShowAssignDialog(false); setShowNewTypeDialog(true); }} className="underline">Creane uno</button>
                </p>
              )}
            </div>
            
            <div>
              <Label>Motivo (opzionale)</Label>
              <Input 
                value={assignForm.reason}
                onChange={(e) => setAssignForm({...assignForm, reason: e.target.value})}
                placeholder="Es: Cliente fedele, Compleanno pet..."
              />
            </div>
            
            <div>
              <Label>Data scadenza (opzionale)</Label>
              <Input 
                type="date"
                value={assignForm.expiresAt}
                onChange={(e) => setAssignForm({...assignForm, expiresAt: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAssignDialog(false); setSelectedOwner(null); setSearchQuery(''); }}>Annulla</Button>
            <Button onClick={handleAssignReward} className="bg-amber-500 hover:bg-amber-600" disabled={!assignForm.ownerId || !assignForm.rewardTypeId}>
              <Gift className="h-4 w-4 mr-2" />
              Assegna Premio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
function ClinicReports({ appointments, documents, messages, owners, pets, onNavigate, onOpenOwner, onOpenPet }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOwnerDetail, setSelectedOwnerDetail] = useState(null);
  const [selectedPetDetail, setSelectedPetDetail] = useState(null);
  const [selectedDocDetail, setSelectedDocDetail] = useState(null);
  
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

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'coral', trend, onClick }) => (
    <Card className={`${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200' : ''}`} onClick={onClick}>
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
        {onClick && (
          <div className="flex items-center justify-end mt-2 text-xs text-gray-400">
            <span>Clicca per dettagli</span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const [activeReportTab, setActiveReportTab] = useState('overview');

  return (
    <div className="space-y-6">
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Report & Analytics</h2>
          <p className="text-gray-500 text-sm">Monitora le performance della tua clinica</p>
        </div>
        <Button variant="outline" onClick={() => exportCSV(appointments, 'appuntamenti')}>
          <Download className="h-4 w-4 mr-2" />Export CSV
        </Button>
      </div>

      <Tabs value={activeReportTab} onValueChange={setActiveReportTab}>
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
            <StatCard title="Nuovi clienti" value={monthlyOwners.length} subtitle="questo mese" icon={User} color="blue" onClick={() => setActiveReportTab('clients')} />
            <StatCard title="Appuntamenti" value={monthlyAppts.length} subtitle="questo mese" icon={Calendar} color="coral" 
              trend={lastMonthAppts.length > 0 ? Math.round(((monthlyAppts.length - lastMonthAppts.length) / lastMonthAppts.length) * 100) : 0} onClick={() => setActiveReportTab('appointments')} />
            <StatCard title="Documenti inviati" value={monthlyDocs.length} subtitle="questo mese" icon={FileText} color="green" onClick={() => setActiveReportTab('documents')} />
            <StatCard title="Incassi tracciati" value={`€${monthlyRevenue}`} subtitle="questo mese" icon={Euro} color="emerald"
              trend={lastMonthRevenue > 0 ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0} onClick={() => setActiveReportTab('payments')} />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setActiveReportTab('appointments')}>
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
            
            <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setActiveReportTab('documents')}>
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
          <button onClick={() => setActiveReportTab('overview')} className="flex items-center gap-2 text-gray-500 hover:text-coral-600 transition mb-4 group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Torna alla Panoramica</span>
          </button>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <StatCard title="Nuovi clienti" value={monthlyOwners.length} subtitle="questo mese" icon={User} color="blue" onClick={() => onNavigate('owners')} />
            <StatCard title="Clienti attivi" value={(owners || []).length} subtitle="totale" icon={Users} color="green" onClick={() => onNavigate('owners')} />
            <StatCard title="Tasso ritorno" value="--%" subtitle="da calcolare" icon={RefreshCw} color="amber" onClick={() => onNavigate('owners')} />
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
                  {(owners || []).slice(0, 10).map((owner, i) => {
                    const ownerPets = (pets || []).filter(p => p.ownerId === owner.id);
                    return (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedOwnerDetail(owner)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{owner.name}</p>
                            <p className="text-sm text-gray-500">{owner.email}</p>
                            {ownerPets.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {ownerPets.map(pet => (
                                  <Badge key={pet.id} variant="outline" className="text-xs bg-coral-50 text-coral-700 border-coral-200">
                                    {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'} {pet.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-400">{owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : '-'}</p>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPOINTMENTS */}
        <TabsContent value="appointments" className="mt-6">
          <button onClick={() => setActiveReportTab('overview')} className="flex items-center gap-2 text-gray-500 hover:text-coral-600 transition mb-4 group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Torna alla Panoramica</span>
          </button>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Totale" value={monthlyAppts.length} subtitle="questo mese" icon={Calendar} color="coral" onClick={() => onNavigate('agenda')} />
            <StatCard title="In presenza" value={inPersonAppts.length} icon={Stethoscope} color="coral" onClick={() => onNavigate('agenda')} />
            <StatCard title="Video consulto" value={videoAppts.length} icon={Video} color="blue" onClick={() => onNavigate('agenda')} />
            <StatCard title="No-show" value="0" subtitle="cancellazioni" icon={X} color="red" onClick={() => onNavigate('agenda')} />
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
                  {appointments.slice(0, 20).map((appt, i) => {
                    const pet = (pets || []).find(p => p.id === appt.petId || p.name === appt.petName);
                    const owner = (owners || []).find(o => o.id === appt.ownerId || o.name === appt.ownerName);
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-coral-50 cursor-pointer transition-colors"
                        onClick={() => {
                          if (pet) {
                            setSelectedPetDetail(pet);
                          } else if (owner) {
                            setSelectedOwnerDetail(owner);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${appt.type === 'videoconsulto' ? 'bg-blue-100' : 'bg-coral-100'}`}>
                            {appt.type === 'videoconsulto' ? <Video className="h-5 w-5 text-blue-600" /> : <PawPrint className="h-5 w-5 text-coral-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{appt.petName}</p>
                            <p className="text-sm text-gray-500">{appt.ownerName} • {appt.reason || appt.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-medium">{appt.date}</p>
                            <p className="text-xs text-gray-500">{appt.time}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INBOX */}
        <TabsContent value="inbox" className="mt-6">
          <button onClick={() => setActiveReportTab('overview')} className="flex items-center gap-2 text-gray-500 hover:text-coral-600 transition mb-4 group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Torna alla Panoramica</span>
          </button>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <StatCard title="Ticket aperti" value={openTickets} icon={Inbox} color="amber" onClick={() => onNavigate('inbox')} />
            <StatCard title="Ticket chiusi" value={closedTickets} subtitle="questo mese" icon={CheckCircle} color="green" onClick={() => onNavigate('inbox')} />
            <StatCard title="Tempo medio risposta" value="--" subtitle="da calcolare" icon={Clock} color="blue" onClick={() => onNavigate('inbox')} />
          </div>
        </TabsContent>

        {/* DOCUMENTS */}
        <TabsContent value="documents" className="mt-6">
          <button onClick={() => setActiveReportTab('overview')} className="flex items-center gap-2 text-gray-500 hover:text-coral-600 transition mb-4 group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Torna alla Panoramica</span>
          </button>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Documenti inviati" value={docsSent} icon={Send} color="coral" onClick={() => onNavigate('documents')} />
            <StatCard title="Scaricati" value={docsDownloaded} icon={Download} color="green" onClick={() => onNavigate('documents')} />
            <StatCard title="Tasso apertura" value={`${openRate}%`} icon={Eye} color="blue" onClick={() => onNavigate('documents')} />
            <StatCard title="Tempo medio invio" value="--" subtitle="post-visita" icon={Clock} color="amber" onClick={() => onNavigate('documents')} />
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
                  {documents.slice(0, 20).map((doc, i) => {
                    return (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-coral-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedDocDetail(doc)}
                      >
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
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENTS */}
        <TabsContent value="payments" className="mt-6">
          <button onClick={() => setActiveReportTab('overview')} className="flex items-center gap-2 text-gray-500 hover:text-coral-600 transition mb-4 group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Torna alla Panoramica</span>
          </button>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <StatCard title="Incassi questo mese" value={`€${monthlyRevenue}`} icon={Euro} color="emerald" onClick={() => onNavigate('settings')} />
            <StatCard title="Transazioni" value={monthlyAppts.filter(a => a.price > 0).length} icon={Receipt} color="blue" onClick={() => onNavigate('settings')} />
            <StatCard title="Ticket medio" value={monthlyAppts.length > 0 ? `€${Math.round(monthlyRevenue / monthlyAppts.length)}` : '€0'} icon={CreditCard} color="coral" onClick={() => onNavigate('settings')} />
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

      {/* Dialog Dettaglio Cliente */}
      <Dialog open={!!selectedOwnerDetail} onOpenChange={() => setSelectedOwnerDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              {selectedOwnerDetail?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedOwnerDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-sm">{selectedOwnerDetail.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Telefono</p>
                  <p className="font-medium text-sm">{selectedOwnerDetail.phone || 'N/D'}</p>
                </div>
              </div>
              {selectedOwnerDetail.address && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Indirizzo</p>
                  <p className="font-medium text-sm">{selectedOwnerDetail.address}</p>
                </div>
              )}
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600">Animali</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(pets || []).filter(p => p.ownerId === selectedOwnerDetail.id).map(pet => (
                    <Badge key={pet.id} className="bg-blue-100 text-blue-700">{pet.name}</Badge>
                  ))}
                  {(pets || []).filter(p => p.ownerId === selectedOwnerDetail.id).length === 0 && (
                    <span className="text-sm text-gray-500">Nessun animale</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" className="flex-1 min-w-[90px]" onClick={() => window.location.href = `mailto:${selectedOwnerDetail.email}`}>
                  <Mail className="h-4 w-4 mr-2" />Email
                </Button>
                {selectedOwnerDetail.phone && (
                  <>
                    <Button variant="outline" className="flex-1 min-w-[90px]" onClick={() => window.location.href = `tel:${selectedOwnerDetail.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />Chiama
                    </Button>
                    <Button variant="outline" className="flex-1 min-w-[90px] text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => window.open(`https://wa.me/${selectedOwnerDetail.phone.replace(/\s+/g, '').replace(/^\+/, '')}`, '_blank')}>
                      <MessageCircle className="h-4 w-4 mr-2" />WhatsApp
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Dettaglio Animale */}
      <Dialog open={!!selectedPetDetail} onOpenChange={() => setSelectedPetDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 bg-coral-100 rounded-full flex items-center justify-center">
                <PawPrint className="h-5 w-5 text-coral-600" />
              </div>
              {selectedPetDetail?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPetDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Specie</p>
                  <p className="font-medium text-sm">{selectedPetDetail.species === 'dog' ? '🐕 Cane' : selectedPetDetail.species === 'cat' ? '🐱 Gatto' : selectedPetDetail.species}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Razza</p>
                  <p className="font-medium text-sm">{selectedPetDetail.breed || 'N/D'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Età</p>
                  <p className="font-medium text-sm">{selectedPetDetail.birthDate ? `${Math.floor((new Date() - new Date(selectedPetDetail.birthDate)) / (365.25 * 24 * 60 * 60 * 1000))} anni` : 'N/D'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Peso</p>
                  <p className="font-medium text-sm">{selectedPetDetail.weight ? `${selectedPetDetail.weight} kg` : 'N/D'}</p>
                </div>
              </div>
              {selectedPetDetail.microchip && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Microchip</p>
                  <p className="font-medium text-sm">{selectedPetDetail.microchip}</p>
                </div>
              )}
              {(selectedPetDetail.allergies || selectedPetDetail.medications) && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-600">⚠️ Condizioni Mediche</p>
                  {selectedPetDetail.allergies && <p className="text-sm mt-1"><strong>Allergie:</strong> {selectedPetDetail.allergies}</p>}
                  {selectedPetDetail.medications && <p className="text-sm mt-1"><strong>Farmaci:</strong> {selectedPetDetail.medications}</p>}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Dettaglio Documento */}
      <Dialog open={!!selectedDocDetail} onOpenChange={() => setSelectedDocDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 bg-coral-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-coral-600" />
              </div>
              {selectedDocDetail?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedDocDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="font-medium text-sm">{selectedDocDetail.type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Animale</p>
                  <p className="font-medium text-sm">{selectedDocDetail.petName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Proprietario</p>
                  <p className="font-medium text-sm">{selectedDocDetail.ownerName || 'N/D'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Data</p>
                  <p className="font-medium text-sm">{selectedDocDetail.createdAt ? new Date(selectedDocDetail.createdAt).toLocaleDateString('it-IT') : 'N/D'}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Stato</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedDocDetail.emailSent ? (
                    <Badge className="bg-green-100 text-green-700">✓ Inviato via email</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700">Bozza</Badge>
                  )}
                  {selectedDocDetail.downloaded && <Badge className="bg-blue-100 text-blue-700">Scaricato</Badge>}
                </div>
              </div>
              {selectedDocDetail.content && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Contenuto</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedDocDetail.content}</p>
                </div>
              )}
              <div className="flex gap-2">
                {(selectedDocDetail.url || selectedDocDetail.fileUrl) && (
                  <Button className="flex-1 bg-coral-500 hover:bg-coral-600" onClick={() => window.open(selectedDocDetail.url || selectedDocDetail.fileUrl, '_blank')}>
                    <Download className="h-4 w-4 mr-2" />Scarica
                  </Button>
                )}
                <Button variant="outline" className="flex-1" onClick={() => { setSelectedDocDetail(null); onNavigate('documents'); }}>
                  <FileText className="h-4 w-4 mr-2" />Vai a Documenti
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ==================== SUBSCRIPTION PLANS ====================
function SubscriptionPlans({ user }) {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(user?.subscriptionPlan || 'pilot');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Controlla se c'è un session_id nell'URL (ritorno da Stripe)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const paymentStatus = urlParams.get('payment');
    
    if (sessionId && paymentStatus === 'success') {
      pollPaymentStatus(sessionId);
    }
  }, []);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    if (attempts >= maxAttempts) return;

    try {
      const res = await api.get(`payments/status/${sessionId}`);
      if (res.paymentStatus === 'paid') {
        setPaymentSuccess(true);
        setCurrentPlan(res.metadata?.planId || 'pro');
        // Rimuovi i parametri dall'URL
        window.history.replaceState({}, '', window.location.pathname);
      } else if (res.status !== 'expired') {
        setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    }
  };

  const handleSubscribe = async (planId) => {
    if (planId === 'starter' || planId === 'pilot') return; // Piani gratuiti
    
    setLoading(true);
    try {
      const originUrl = window.location.origin;
      const res = await api.post('payments/checkout', {
        planId,
        clinicId: user?.id,
        originUrl
      });
      
      if (res.url) {
        window.location.href = res.url; // Redirect a Stripe Checkout
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Errore durante la creazione del pagamento');
    } finally {
      setLoading(false);
    }
  };

  const isPilotActive = currentPlan === 'pilot' || currentPlan === 'pro';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 text-center mb-6">Piani disponibili solo tramite Pilot (su invito). Prezzi IVA esclusa.</p>
      
      {paymentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-medium text-green-800">Pagamento completato!</p>
            <p className="text-sm text-green-600">Il tuo abbonamento è ora attivo.</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Starter */}
        <div className="border rounded-lg p-4 bg-white relative">
          <div className="absolute -top-2.5 left-3 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">👨‍⚕️ Per Freelance</div>
          <h3 className="font-semibold mt-2">Starter</h3>
          <p className="text-xs text-gray-500 mb-2">Per veterinari freelance e cliniche in fase di valutazione</p>
          <div className="mb-2">
            <span className="text-2xl font-bold text-gray-400">Gratis</span>
            <p className="text-xs text-gray-500">solo su invito – Pilot Milano</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">Prezzi IVA esclusa</p>
          <p className="text-xs font-medium text-gray-700 mb-2">Include:</p>
          <ul className="text-sm text-gray-600 space-y-1 mb-3">
            <li>• 1 sede, 1 utente</li>
            <li>• Fino a 30 richieste/mese</li>
            <li>• Posizione su mappa</li>
          </ul>
          <Button 
            variant="outline" 
            className="w-full mb-2" 
            disabled={currentPlan === 'starter'}
          >
            {currentPlan === 'starter' ? 'Piano attuale' : 'Richiedi invito'}
          </Button>
          <p className="text-xs text-gray-500 text-center">Accesso disponibile solo per cliniche ammesse al Pilot Milano.</p>
        </div>
        
        {/* Pro - Pilot */}
        <div className={`border-2 rounded-lg p-4 bg-white relative ${isPilotActive ? 'border-amber-500' : 'border-coral-500'}`}>
          <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 whitespace-nowrap">PILOT MILANO (su invito)</Badge>
          <h3 className="font-semibold mt-2">Pro</h3>
          <p className="text-xs text-gray-500 mb-2">Tutto incluso per la tua clinica</p>
          <div className="mb-1">
            {isPilotActive ? (
              <>
                <span className="text-2xl font-bold text-coral-500">€0</span>
                <span className="text-sm text-gray-500 ml-1">(Pilot)</span>
                <span className="text-lg text-gray-400 line-through ml-2">€129/mese</span>
                <span className="text-xs text-gray-400 ml-1">+IVA</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-coral-500">€129/mese</span>
                <span className="text-xs text-gray-400 ml-1">+IVA</span>
              </>
            )}
          </div>
          {isPilotActive && (
            <>
              <p className="text-xs text-amber-600 font-semibold">90 giorni gratuiti per cliniche selezionate nel Pilot</p>
              <p className="text-xs text-gray-500 italic mb-2">(Estendibile fino a 6 mesi per cliniche attive che completano onboarding e feedback.)</p>
            </>
          )}
          <p className="text-xs text-gray-400 mb-3">Prezzi IVA esclusa</p>
          <p className="text-xs font-medium text-gray-700 mb-2">Include:</p>
          <ul className="text-sm text-gray-600 space-y-1 mb-3">
            <li>• Fino a 10 staff</li>
            <li>• Team Inbox + ticket</li>
            <li>• Documenti + invio email automatico (PDF allegato)</li>
            <li>• Google Calendar sync</li>
            <li>• Report e analytics</li>
          </ul>
          {isPilotActive ? (
            <Button className="w-full bg-amber-500 hover:bg-amber-600" disabled>
              ✓ Attivo nel Pilot
            </Button>
          ) : (
            <Button 
              className="w-full bg-coral-500 hover:bg-coral-600" 
              onClick={() => handleSubscribe('pro')}
              disabled={loading}
            >
              {loading ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Caricamento...</> : <>Candidati al Pilot →</>}
            </Button>
          )}
        </div>
        
        {/* Enterprise */}
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-semibold">Enterprise</h3>
          <p className="text-xs text-gray-500 mb-2">Per gruppi e catene veterinarie</p>
          <div className="mb-2">
            <span className="text-2xl font-bold text-coral-500">Custom</span>
            <span className="text-xs text-gray-400 ml-1">+IVA</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Prezzi IVA esclusa</p>
          <p className="text-xs font-medium text-gray-700 mb-2">Include:</p>
          <ul className="text-sm text-gray-600 space-y-1 mb-3">
            <li>• Multi-sede illimitate</li>
            <li>• API dedicata</li>
            <li>• SLA garantito</li>
            <li>• Onboarding dedicato</li>
          </ul>
          <Button 
            className="w-full bg-gray-800 hover:bg-gray-900 mb-2" 
            onClick={() => window.location.href = 'mailto:info@vetbuddy.it?subject=Richiesta%20Enterprise'}
          >
            Contattaci
          </Button>
          <Badge variant="outline" className="w-full justify-center text-amber-700 border-amber-300 bg-amber-50">Solo con Pilot (su invito)</Badge>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Non è una prova libera: stiamo selezionando un numero limitato di cliniche.
      </p>
    </div>
  );
}

// ==================== CLINIC REVIEWS SECTION ====================
function ClinicReviews({ onNavigate }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('clinic/reviews');
      const reviewsData = res.reviews || res || [];
      setReviews(reviewsData);
      
      // Calcola statistiche
      if (reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, r) => sum + (r.overallRating || 0), 0);
        const avg = totalRating / reviewsData.length;
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach(r => {
          const rating = Math.round(r.overallRating || 0);
          if (distribution[rating] !== undefined) distribution[rating]++;
        });
        setStats({ avg, total: reviewsData.length, distribution });
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Recensioni</h2>
          <p className="text-gray-500 text-sm">Cosa dicono i tuoi clienti</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-coral-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-500 mt-4">Caricamento recensioni...</p>
        </div>
      ) : (
        <>
          {/* Stats Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Rating medio */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-coral-500">{stats.avg.toFixed(1)}</div>
                  <div className="flex justify-center gap-1 my-2">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-5 w-5 ${s <= Math.round(stats.avg) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-500">{stats.total} recensioni totali</p>
                </div>
                
                {/* Distribuzione */}
                <div className="col-span-2 space-y-2">
                  {[5,4,3,2,1].map(rating => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="w-8 text-sm">{rating} ⭐</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full transition-all"
                          style={{ width: `${stats.total > 0 ? (stats.distribution[rating] / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm text-gray-500">{stats.distribution[rating]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista recensioni */}
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nessuna recensione ancora</p>
                <p className="text-sm mt-2">Quando i tuoi clienti lasceranno una recensione, appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-coral-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{review.ownerName || 'Cliente VetBuddy'}</p>
                          <p className="text-sm text-gray-500">{review.petName && `Proprietario di ${review.petName}`}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`h-4 w-4 ${s <= review.overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString('it-IT')}</p>
                      </div>
                    </div>
                    
                    {review.comment && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 italic">"{review.comment}"</p>
                      </div>
                    )}
                    
                    <div className="flex gap-6 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Puntualità: {review.punctuality}/5</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Competenza: {review.competence}/5</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Prezzo: {review.price}/5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ==================== FEEDBACK SECTION ====================
function FeedbackSection({ user }) {
  const [showForm, setShowForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'suggestion',
    subject: '',
    message: '',
    rating: 0
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const feedbackTypes = [
    { id: 'bug', label: '🐛 Segnala un bug', desc: 'Qualcosa non funziona come dovrebbe' },
    { id: 'suggestion', label: '💡 Suggerimento', desc: 'Hai un\'idea per migliorare VetBuddy' },
    { id: 'praise', label: '⭐ Complimento', desc: 'Dicci cosa ti piace!' },
    { id: 'other', label: '📝 Altro', desc: 'Qualsiasi altro feedback' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.message.trim()) {
      alert('Scrivi un messaggio per inviare il feedback');
      return;
    }
    
    setSending(true);
    try {
      const response = await api.post('feedback', feedbackForm);
      if (response.success) {
        setSent(true);
        setFeedbackForm({ type: 'suggestion', subject: '', message: '', rating: 0 });
        setTimeout(() => {
          setSent(false);
          setShowForm(false);
        }, 3000);
      }
    } catch (error) {
      alert('Errore: ' + (error.message || 'Impossibile inviare il feedback'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-teal-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-teal-500" />
          Feedback
        </CardTitle>
        <CardDescription>Aiutaci a migliorare VetBuddy con il tuo feedback</CardDescription>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Il tuo feedback è prezioso! Segnalaci bug, suggerisci nuove funzionalità o semplicemente dicci cosa ne pensi.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {feedbackTypes.map(type => (
                <Button
                  key={type.id}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-1 hover:border-teal-400 hover:bg-teal-50"
                  onClick={() => { setFeedbackForm(f => ({ ...f, type: type.id })); setShowForm(true); }}
                >
                  <span className="text-lg">{type.label.split(' ')[0]}</span>
                  <span className="text-xs text-gray-500">{type.label.split(' ').slice(1).join(' ')}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Grazie per il feedback!</h3>
            <p className="text-gray-600">Il tuo messaggio è stato inviato al team VetBuddy.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">{feedbackTypes.find(t => t.id === feedbackForm.type)?.label}</span>
            </div>

            {/* Rating opzionale */}
            {feedbackForm.type === 'praise' && (
              <div>
                <Label className="mb-2 block">Quanto sei soddisfatto? (opzionale)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackForm(f => ({ ...f, rating: star }))}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      {star <= feedbackForm.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Oggetto (opzionale)</Label>
              <Input
                value={feedbackForm.subject}
                onChange={(e) => setFeedbackForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="Di cosa si tratta?"
              />
            </div>

            <div>
              <Label>Messaggio *</Label>
              <Textarea
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm(f => ({ ...f, message: e.target.value }))}
                placeholder={
                  feedbackForm.type === 'bug' ? 'Descrivi il problema che hai riscontrato...' :
                  feedbackForm.type === 'suggestion' ? 'Descrivi la tua idea...' :
                  feedbackForm.type === 'praise' ? 'Cosa ti piace di VetBuddy?' :
                  'Scrivi il tuo messaggio...'
                }
                rows={5}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Annulla
              </Button>
              <Button 
                type="submit" 
                disabled={sending || !feedbackForm.message.trim()} 
                className="flex-1 bg-teal-500 hover:bg-teal-600"
              >
                {sending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Invio...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Invia Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}


// ==================== CLINIC INVOICING ====================
function ClinicInvoicing({ user, owners = [], pets = [] }) {
  const [activeTab, setActiveTab] = useState('invoices'); // invoices, services, settings
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showNewService, setShowNewService] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New invoice form
  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCF: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    notes: '',
    petId: '',
    petName: ''
  });
  
  // New service form
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: 'visita',
    price: '',
    duration: ''
  });

  const serviceCategories = [
    { id: 'visita', name: 'Visite', icon: Stethoscope },
    { id: 'vaccino', name: 'Vaccinazioni', icon: Syringe },
    { id: 'chirurgia', name: 'Chirurgia', icon: Scissors },
    { id: 'diagnostica', name: 'Diagnostica', icon: Search },
    { id: 'laboratorio', name: 'Laboratorio', icon: Activity },
    { id: 'altro', name: 'Altro', icon: MoreHorizontal }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoiceData, serviceData] = await Promise.all([
        api.get('invoices'),
        api.get('services')
      ]);
      setInvoices(invoiceData?.invoices || []);
      setStats(invoiceData?.stats || {});
      setServices(serviceData?.services || []);
    } catch (error) {
      console.error('Error loading invoicing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (isDraft = false) => {
    if (!invoiceForm.customerName || invoiceForm.items.filter(i => i.description).length === 0) {
      alert('Inserisci il nome cliente e almeno una prestazione');
      return;
    }
    
    try {
      await api.post('invoices', { ...invoiceForm, isDraft });
      setShowNewInvoice(false);
      setInvoiceForm({
        customerId: '', customerName: '', customerEmail: '', customerPhone: '',
        customerAddress: '', customerCF: '', items: [{ description: '', quantity: 1, unitPrice: 0 }],
        notes: '', petId: '', petName: ''
      });
      loadData();
      alert(isDraft ? 'Bozza salvata!' : 'Fattura creata!');
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const handleCreateService = async () => {
    if (!serviceForm.name || !serviceForm.price) {
      alert('Nome e prezzo sono obbligatori');
      return;
    }
    try {
      await api.post('services', serviceForm);
      setShowNewService(false);
      setServiceForm({ name: '', description: '', category: 'visita', price: '', duration: '' });
      loadData();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    try {
      await api.put('invoices', { id: invoiceId, status: 'paid' });
      loadData();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const handleExport = async (format) => {
    try {
      window.open(`/api/invoices/export?format=${format}`, '_blank');
    } catch (error) {
      alert('Errore export: ' + error.message);
    }
  };

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const updateInvoiceItem = (index, field, value) => {
    const newItems = [...invoiceForm.items];
    newItems[index][field] = field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value;
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const removeInvoiceItem = (index) => {
    if (invoiceForm.items.length > 1) {
      setInvoiceForm({
        ...invoiceForm,
        items: invoiceForm.items.filter((_, i) => i !== index)
      });
    }
  };

  const selectService = (service) => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items.filter(i => i.description), { description: service.name, quantity: 1, unitPrice: service.price }]
    });
  };

  const selectOwner = (owner) => {
    setInvoiceForm({
      ...invoiceForm,
      customerId: owner.id,
      customerName: owner.name,
      customerEmail: owner.email,
      customerPhone: owner.phone,
      customerAddress: owner.address || '',
      customerCF: owner.cf || ''
    });
  };

  const calculateTotal = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vat = subtotal * 0.22;
    const bollo = subtotal > 77.47 ? 2 : 0;
    return { subtotal, vat, bollo, total: subtotal + vat + bollo };
  };

  const filteredInvoices = invoices.filter(inv => 
    !searchQuery || 
    inv.invoiceNumber?.includes(searchQuery) ||
    inv.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-coral-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="h-7 w-7 text-green-600" />
            Fatturazione
          </h1>
          <p className="text-gray-500">Gestisci fatture, listino prezzi ed export</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={async () => {
            try {
              const response = await fetch(`/api/invoices/download-all?clinicId=${user.id}&role=clinic`);
              if (!response.ok) throw new Error('Download fallito');
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `VetBuddy_Fatture_${new Date().toISOString().split('T')[0]}.zip`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              a.remove();
            } catch (error) {
              alert('Errore durante il download: ' + error.message);
            }
          }}>
            <Archive className="h-4 w-4 mr-2" />
            Scarica Tutto
          </Button>
          <Button onClick={() => setShowNewInvoice(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuova Fattura
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Totale Fatture</p>
            <p className="text-2xl font-bold">{stats.total || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-700">In Attesa</p>
            <p className="text-2xl font-bold text-amber-700">{(stats.sent || 0) + (stats.draft || 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm text-green-700">Pagate</p>
            <p className="text-2xl font-bold text-green-700">{stats.paid || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700">Fatturato Totale</p>
            <p className="text-2xl font-bold text-blue-700">€{(stats.totalAmount || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button variant={activeTab === 'invoices' ? 'default' : 'ghost'} onClick={() => setActiveTab('invoices')}>
          <Receipt className="h-4 w-4 mr-2" />
          Fatture
        </Button>
        <Button variant={activeTab === 'services' ? 'default' : 'ghost'} onClick={() => setActiveTab('services')}>
          <Stethoscope className="h-4 w-4 mr-2" />
          Listino Prezzi
        </Button>
        <Button variant={activeTab === 'settings' ? 'default' : 'ghost'} onClick={() => setActiveTab('settings')}>
          <Settings className="h-4 w-4 mr-2" />
          Impostazioni
        </Button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca fattura..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">Nessuna fattura</h3>
                <p className="text-gray-500">Crea la tua prima fattura</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredInvoices.map((inv) => (
                <Card key={inv.id} className={`hover:shadow-md transition ${inv.status === 'draft' ? 'border-dashed' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          inv.status === 'paid' ? 'bg-green-100 text-green-600' :
                          inv.status === 'issued' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {inv.status === 'paid' ? <CheckCircle className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{inv.invoiceNumber || 'BOZZA'}</span>
                            <Badge variant={inv.status === 'paid' ? 'default' : 'outline'} className={
                              inv.status === 'paid' ? 'bg-green-500' :
                              inv.status === 'issued' ? 'bg-blue-500 text-white' :
                              'bg-gray-200'
                            }>
                              {inv.status === 'paid' ? 'Pagata' : inv.status === 'issued' ? 'Emessa' : 'Bozza'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{inv.customerName}</p>
                          <p className="text-xs text-gray-400">
                            {inv.issueDate || 'Non emessa'} {inv.petName && `• 🐾 ${inv.petName}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">€{inv.totals?.total?.toFixed(2)}</p>
                          {inv.dueDate && inv.status !== 'paid' && (
                            <p className="text-xs text-gray-500">Scade: {inv.dueDate}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => window.open(`/api/invoices/export?format=html&id=${inv.id}`, '_blank')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {inv.status !== 'paid' && (
                            <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleMarkPaid(inv.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowNewService(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Prestazione
            </Button>
          </div>

          {services.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Stethoscope className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">Listino vuoto</h3>
                <p className="text-gray-500">Aggiungi le tue prestazioni con i prezzi</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const cat = serviceCategories.find(c => c.id === service.category);
                const Icon = cat?.icon || Stethoscope;
                return (
                  <Card key={service.id} className="hover:shadow-md transition">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-coral-100 flex items-center justify-center text-coral-600">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-gray-500">{service.description || cat?.name}</p>
                            {service.duration && (
                              <p className="text-xs text-gray-400 mt-1">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {service.duration} min
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-xl font-bold text-green-600">€{service.price?.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          {/* Export e Download */}
          <Card className="border-green-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Download className="h-5 w-5 text-green-600" />
                Esporta le Tue Fatture
              </h3>
              <p className="text-gray-600 mb-4">
                Scarica tutte le fatture in un formato compatibile con il tuo software di contabilità.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" className="flex-col h-auto py-4" onClick={() => handleExport('csv')}>
                  <FileText className="h-6 w-6 mb-2 text-green-600" />
                  <span className="font-semibold">CSV</span>
                  <span className="text-xs text-gray-500">Per Excel</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-4" onClick={() => handleExport('html')}>
                  <Receipt className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="font-semibold">PDF/HTML</span>
                  <span className="text-xs text-gray-500">Stampabile</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-4" onClick={() => handleExport('json')}>
                  <Download className="h-6 w-6 mb-2 text-purple-600" />
                  <span className="font-semibold">JSON</span>
                  <span className="text-xs text-gray-500">Per API</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guida Integrazione Software Esterni */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Guida: Integra con il Tuo Software di Fatturazione
              </h3>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="fattureincloud">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">FiC</div>
                      Come importare in Fatture in Cloud
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-gray-600 pl-10">
                      <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Esporta da VetBuddy</strong> — Clicca "Export CSV" qui sopra</li>
                        <li><strong>Accedi a Fatture in Cloud</strong> — Vai su fattureincloud.it</li>
                        <li><strong>Vai su Documenti → Importa</strong> — Seleziona "Importa da file CSV"</li>
                        <li><strong>Carica il file</strong> — Seleziona il CSV scaricato</li>
                        <li><strong>Mappa i campi</strong> — Associa le colonne (Cliente, Importo, ecc.)</li>
                        <li><strong>Conferma e Invia</strong> — Fatture in Cloud invierà al SdI</li>
                      </ol>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-700 text-xs">
                          💡 <strong>Suggerimento:</strong> Salva la mappatura dei campi per velocizzare le importazioni future.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="aruba">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">A</div>
                      Come importare in Aruba
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-gray-600 pl-10">
                      <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Esporta da VetBuddy</strong> — Scarica il file CSV</li>
                        <li><strong>Accedi ad Aruba Fatturazione</strong> — fattura.aruba.it</li>
                        <li><strong>Crea nuova fattura manualmente</strong> — Aruba non supporta import CSV diretto</li>
                        <li><strong>Copia i dati dal CSV</strong> — Usa Excel per visualizzare i dati</li>
                        <li><strong>Inserisci cliente e prestazioni</strong> — Compila i campi in Aruba</li>
                        <li><strong>Invia al SdI</strong> — Aruba gestisce l'invio</li>
                      </ol>
                      <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                        <p className="text-orange-700 text-xs">
                          ⚠️ <strong>Nota:</strong> Aruba richiede inserimento manuale. Per volumi alti, considera Fatture in Cloud o TeamSystem.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="teamsystem">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">TS</div>
                      Come importare in TeamSystem
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-gray-600 pl-10">
                      <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Esporta da VetBuddy</strong> — Scarica il file CSV o JSON</li>
                        <li><strong>Accedi a TeamSystem</strong> — Usa il modulo Fatturazione Elettronica</li>
                        <li><strong>Vai su Importazioni</strong> — Sezione "Import documenti"</li>
                        <li><strong>Seleziona formato CSV</strong> — Configura il tracciato di import</li>
                        <li><strong>Carica e verifica</strong> — TeamSystem mostra anteprima</li>
                        <li><strong>Conferma l'invio</strong> — Le fatture vengono inviate al SdI</li>
                      </ol>
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-green-700 text-xs">
                          💡 <strong>Suggerimento:</strong> TeamSystem supporta anche import JSON per automazioni avanzate.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="excel">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">XL</div>
                      Come usare con Excel / il tuo commercialista
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-gray-600 pl-10">
                      <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Esporta da VetBuddy</strong> — Scarica il file CSV</li>
                        <li><strong>Apri in Excel</strong> — Il CSV è già formattato</li>
                        <li><strong>Invia al commercialista</strong> — Allega il file Excel</li>
                        <li><strong>Il commercialista emette le fatture</strong> — Usando i dati forniti</li>
                      </ol>
                      <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                        <p className="text-emerald-700 text-xs">
                          📧 <strong>Ideale per:</strong> Chi ha un commercialista che gestisce la fatturazione elettronica.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Spiegazione VetBuddy vs Software */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                VetBuddy e la Fatturazione Elettronica
              </h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">📋 Cosa fa VetBuddy</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Gestisce il <strong>listino prezzi</strong> delle prestazioni</li>
                    <li>Crea <strong>pre-fatture</strong> con dati cliente e prestazioni</li>
                    <li>Calcola automaticamente <strong>IVA e marca da bollo</strong></li>
                    <li>Esporta in <strong>CSV, PDF e JSON</strong> per il tuo software</li>
                    <li>Tiene traccia di <strong>pagamenti e statistiche</strong></li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Cosa fa il tuo Software di Fatturazione</h4>
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    <li>Genera il <strong>file XML</strong> conforme alle norme</li>
                    <li>Appone la <strong>firma digitale</strong></li>
                    <li>Invia al <strong>Sistema di Interscambio (SdI)</strong></li>
                    <li>Riceve le <strong>notifiche di consegna</strong></li>
                    <li>Gestisce la <strong>conservazione sostitutiva</strong> a norma</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2">⚠️ Perché due sistemi?</h4>
                  <p className="text-amber-700">
                    La fatturazione elettronica in Italia richiede certificazioni specifiche e integrazione con l'Agenzia delle Entrate. 
                    VetBuddy si occupa della <strong>gestione veterinaria</strong> e prepara i dati; 
                    il software di fatturazione (Fatture in Cloud, TeamSystem, Aruba, ecc.) si occupa della <strong>parte fiscale</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dati Fiscali */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Dati Fiscali Clinica</h3>
              <p className="text-sm text-gray-500 mb-4">
                Questi dati appariranno sulle fatture esportate.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Partita IVA</Label>
                  <Input placeholder="IT12345678901" defaultValue={user?.piva || ''} />
                </div>
                <div>
                  <Label>Codice SDI</Label>
                  <Input placeholder="XXXXXXX" defaultValue={user?.sdi || ''} />
                </div>
                <div className="md:col-span-2">
                  <Label>Indirizzo Sede Legale</Label>
                  <Input placeholder="Via Roma 123, 20100 Milano" defaultValue={user?.address || ''} />
                </div>
                <div>
                  <Label>PEC</Label>
                  <Input placeholder="clinica@pec.it" defaultValue={user?.pec || ''} />
                </div>
                <div>
                  <Label>Telefono</Label>
                  <Input placeholder="+39 02 1234567" defaultValue={user?.phone || ''} />
                </div>
              </div>
              <Button className="mt-4 bg-green-600 hover:bg-green-700">Salva Dati Fiscali</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Invoice Dialog */}
      <Dialog open={showNewInvoice} onOpenChange={setShowNewInvoice}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Nuova Fattura</DialogTitle>
          <DialogDescription>Crea una nuova fattura o bozza</DialogDescription>
          
          <div className="space-y-6 mt-4">
            {/* Customer Selection */}
            <div>
              <Label className="text-sm font-semibold">Cliente</Label>
              <div className="grid gap-2 mt-2">
                {invoiceForm.customerId ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{invoiceForm.customerName}</p>
                      <p className="text-sm text-gray-500">{invoiceForm.customerEmail}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setInvoiceForm({ ...invoiceForm, customerId: '', customerName: '', customerEmail: '', customerPhone: '', customerAddress: '', customerCF: '' })}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
                      {owners.slice(0, 10).map((owner) => (
                        <Badge key={owner.id} variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => selectOwner(owner)}>
                          {owner.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <Input placeholder="Nome cliente *" value={invoiceForm.customerName} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })} />
                      <Input placeholder="Codice Fiscale" value={invoiceForm.customerCF} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerCF: e.target.value })} />
                      <Input placeholder="Email" value={invoiceForm.customerEmail} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })} />
                      <Input placeholder="Telefono" value={invoiceForm.customerPhone} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerPhone: e.target.value })} />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick add from services */}
            {services.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Aggiungi dal Listino</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {services.slice(0, 8).map((service) => (
                    <Badge key={service.id} variant="outline" className="cursor-pointer hover:bg-coral-50 hover:border-coral-300" onClick={() => selectService(service)}>
                      {service.name} - €{service.price}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Invoice Items */}
            <div>
              <Label className="text-sm font-semibold">Prestazioni</Label>
              <div className="space-y-2 mt-2">
                {invoiceForm.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input className="flex-1" placeholder="Descrizione *" value={item.description} onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)} />
                    <Input className="w-20" type="number" min="1" placeholder="Qtà" value={item.quantity} onChange={(e) => updateInvoiceItem(index, 'quantity', e.target.value)} />
                    <Input className="w-28" type="number" step="0.01" placeholder="€ Prezzo" value={item.unitPrice || ''} onChange={(e) => updateInvoiceItem(index, 'unitPrice', e.target.value)} />
                    <Button variant="ghost" size="sm" onClick={() => removeInvoiceItem(index)} disabled={invoiceForm.items.length === 1}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addInvoiceItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Aggiungi Riga
                </Button>
              </div>
            </div>

            {/* Totals Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Imponibile:</span>
                  <span>€ {calculateTotal().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (22%):</span>
                  <span>€ {calculateTotal().vat.toFixed(2)}</span>
                </div>
                {calculateTotal().bollo > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Marca da bollo:</span>
                    <span>€ {calculateTotal().bollo.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>TOTALE:</span>
                  <span>€ {calculateTotal().total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Note</Label>
              <Textarea placeholder="Note aggiuntive..." value={invoiceForm.notes} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleCreateInvoice(true)}>
                Salva come Bozza
              </Button>
              <Button onClick={() => handleCreateInvoice(false)} className="bg-green-600 hover:bg-green-700">
                <Receipt className="h-4 w-4 mr-2" />
                Emetti Fattura
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Service Dialog */}
      <Dialog open={showNewService} onOpenChange={setShowNewService}>
        <DialogContent>
          <DialogTitle>Nuova Prestazione</DialogTitle>
          <DialogDescription>Aggiungi una prestazione al listino</DialogDescription>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome Prestazione *</Label>
              <Input placeholder="es. Visita di controllo" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Categoria</Label>
              <select className="w-full p-2 border rounded-md" value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}>
                {serviceCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prezzo (€) *</Label>
                <Input type="number" step="0.01" placeholder="50.00" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} />
              </div>
              <div>
                <Label>Durata (min)</Label>
                <Input type="number" placeholder="30" value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Descrizione</Label>
              <Textarea placeholder="Descrizione opzionale..." value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewService(false)}>Annulla</Button>
              <Button onClick={handleCreateService}>Salva</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ==================== CLINIC ARCHIVE ====================
function ClinicArchive({ user }) {
  const [archiveFiles, setArchiveFiles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', category: 'protocolli', description: '' });

  const categories = [
    { id: 'all', label: 'Tutti', icon: FolderArchive, color: 'gray' },
    { id: 'protocolli', label: 'Protocolli Clinici', icon: ClipboardList, color: 'blue', desc: 'Procedure, linee guida, SOP' },
    { id: 'casi_studio', label: 'Casi Studio', icon: BookOpen, color: 'purple', desc: 'Case history interessanti' },
    { id: 'template', label: 'Template', icon: FileText, color: 'green', desc: 'Moduli consenso, contratti' },
    { id: 'formazione', label: 'Formazione', icon: GraduationCap, color: 'amber', desc: 'Materiale didattico staff' },
    { id: 'schede_tecniche', label: 'Schede Tecniche', icon: Stethoscope, color: 'red', desc: 'Farmaci, attrezzature' },
    { id: 'amministrazione', label: 'Amministrazione', icon: Receipt, color: 'indigo', desc: 'Certificazioni, GDPR, assicurazioni' },
  ];

  useEffect(() => {
    loadArchive();
  }, []);

  const loadArchive = async () => {
    try {
      const token = localStorage.getItem('vetbuddy_token');
      const res = await fetch('/api/clinic/archive', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setArchiveFiles(data.files || []);
      }
    } catch (err) {
      console.error('Error loading archive:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('archive-file-input');
    if (!fileInput?.files?.length) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('vetbuddy_token');
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      formData.append('name', uploadForm.name || fileInput.files[0].name);
      formData.append('category', uploadForm.category);
      formData.append('description', uploadForm.description);

      const res = await fetch('/api/clinic/archive', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setShowUploadModal(false);
        setUploadForm({ name: '', category: 'protocolli', description: '' });
        loadArchive();
      }
    } catch (err) {
      console.error('Error uploading:', err);
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = activeCategory === 'all' 
    ? archiveFiles 
    : archiveFiles.filter(f => f.category === activeCategory);

  const getCategoryInfo = (catId) => categories.find(c => c.id === catId) || categories[0];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderArchive className="h-7 w-7 text-blue-500" />
            Archivio Clinica
          </h1>
          <p className="text-gray-500">Documenti, protocolli e materiale della clinica</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="bg-blue-500 hover:bg-blue-600">
          <Upload className="h-4 w-4 mr-2" /> Carica Documento
        </Button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {categories.map(cat => {
          const count = cat.id === 'all' ? archiveFiles.length : archiveFiles.filter(f => f.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-4 rounded-xl text-left transition-all ${
                activeCategory === cat.id 
                  ? `bg-${cat.color}-100 border-2 border-${cat.color}-500` 
                  : 'bg-white border-2 border-transparent hover:border-gray-200'
              }`}
            >
              <cat.icon className={`h-6 w-6 mb-2 text-${cat.color}-500`} />
              <p className="font-medium text-sm text-gray-900">{cat.label}</p>
              <p className="text-xs text-gray-500">{count} file</p>
            </button>
          );
        })}
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderArchive className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun documento</h3>
          <p className="text-gray-500 mb-4">
            {activeCategory === 'all' 
              ? "L'archivio è vuoto. Carica il primo documento!"
              : `Nessun documento nella categoria "${getCategoryInfo(activeCategory).label}"`}
          </p>
          <Button onClick={() => setShowUploadModal(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" /> Carica Documento
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file, i) => {
            const cat = getCategoryInfo(file.category);
            return (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg bg-${cat.color}-100`}>
                      <cat.icon className={`h-6 w-6 text-${cat.color}-500`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                      <p className="text-xs text-gray-500">{cat.label}</p>
                      {file.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{file.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">
                          {new Date(file.createdAt).toLocaleDateString('it-IT')}
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-7">
                          <Eye className="h-3 w-3 mr-1" /> Apri
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7">
                          <Download className="h-3 w-3 mr-1" /> Scarica
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              Carica Documento nell'Archivio
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label>File *</Label>
              <Input type="file" id="archive-file-input" required />
            </div>
            <div>
              <Label>Nome documento</Label>
              <Input 
                value={uploadForm.name} 
                onChange={e => setUploadForm({...uploadForm, name: e.target.value})}
                placeholder="Lascia vuoto per usare nome file"
              />
            </div>
            <div>
              <Label>Categoria *</Label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={uploadForm.category}
                onChange={e => setUploadForm({...uploadForm, category: e.target.value})}
              >
                {categories.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label} - {cat.desc}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Descrizione</Label>
              <textarea 
                className="w-full p-2 border rounded-lg"
                rows={3}
                value={uploadForm.description}
                onChange={e => setUploadForm({...uploadForm, description: e.target.value})}
                placeholder="Descrizione opzionale del documento..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={uploading} className="bg-blue-500 hover:bg-blue-600">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Carica
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== CLINIC EVENTS ====================
function ClinicEvents({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [savingEvent, setSavingEvent] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedEventForShare, setSelectedEventForShare] = useState(null);
  const [copied, setCopied] = useState(false);

  // Carica eventi dall'API
  const loadEvents = async () => {
    try {
      const token = localStorage.getItem('vetbuddy_token');
      const res = await fetch('/api/clinic/events', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Salva/rimuovi evento dai preferiti
  const toggleSaveEvent = async (eventId, currentlySaved) => {
    setSavingEvent(eventId);
    try {
      const token = localStorage.getItem('vetbuddy_token');
      const res = await fetch('/api/clinic/events', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: currentlySaved ? 'unsave' : 'save',
          eventId
        })
      });
      if (res.ok) {
        // Aggiorna lo stato locale
        setEvents(prev => prev.map(e => 
          e.id === eventId ? { ...e, saved: !currentlySaved } : e
        ));
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    } finally {
      setSavingEvent(null);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getTypeColor = (type) => {
    switch(type) {
      case 'congresso': return 'purple';
      case 'corso': return 'blue';
      case 'webinar': return 'green';
      case 'workshop': return 'amber';
      default: return 'gray';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'congresso': return 'Congresso';
      case 'corso': return 'Corso';
      case 'webinar': return 'Webinar';
      case 'workshop': return 'Workshop';
      default: return type;
    }
  };

  const filteredEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const today = new Date();
    if (activeFilter === 'upcoming') return eventDate >= today;
    if (activeFilter === 'past') return eventDate < today;
    if (activeFilter === 'ecm') return e.ecm;
    if (activeFilter === 'online') return e.location.toLowerCase().includes('online');
    if (activeFilter === 'saved') return e.saved;
    if (activeFilter === 'featured') return e.featured;
    return true;
  });

  const savedCount = events.filter(e => e.saved).length;

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options = { day: 'numeric', month: 'short' };
    if (start === end) {
      return startDate.toLocaleDateString('it-IT', { ...options, year: 'numeric' });
    }
    return `${startDate.toLocaleDateString('it-IT', options)} - ${endDate.toLocaleDateString('it-IT', { ...options, year: 'numeric' })}`;
  };

  // Funzione per aprire il modal di condivisione
  const openShareModal = (event) => {
    setSelectedEventForShare(event);
    setShareModalOpen(true);
    setCopied(false);
  };

  // Funzione per condividere l'evento
  const shareEvent = (platform) => {
    if (!selectedEventForShare) return;
    
    // Usa il link alla pagina VetBuddy per l'anteprima
    const eventUrl = `${window.location.origin}/eventi-clinica/${selectedEventForShare.id}`;
    const eventTitle = selectedEventForShare.title;
    const eventDate = formatDateRange(selectedEventForShare.date, selectedEventForShare.endDate);
    const eventLocation = selectedEventForShare.location;
    const eventDescription = selectedEventForShare.description || '';
    
    // Messaggio completo con descrizione per WhatsApp
    const whatsappText = `${eventTitle}\n📅 ${eventDate}\n📍 ${eventLocation}\n\n${eventDescription}\n\n${eventUrl}`;
    
    // Messaggio per altri canali
    const shareText = `${eventTitle}\n📅 ${eventDate}\n📍 ${eventLocation}\n\n${eventDescription}`;
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(eventTitle)}&body=${encodeURIComponent(shareText + '\n\n' + eventUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(eventUrl).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        return; // Non chiudere il modal per mostrare feedback
      default:
        break;
    }
    
    setShareModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-purple-500" />
            Eventi & Convegni
          </h1>
          <p className="text-gray-500">Corsi, congressi e formazione continua per veterinari</p>
        </div>
        <Badge className="bg-purple-100 text-purple-700">
          <Bell className="h-3 w-3 mr-1" /> Aggiornamento automatico
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'upcoming', label: 'Prossimi', icon: CalendarRange },
          { id: 'saved', label: `Salvati (${savedCount})`, icon: Heart },
          { id: 'featured', label: 'In Evidenza', icon: Star },
          { id: 'ecm', label: 'Con ECM', icon: GraduationCap },
          { id: 'online', label: 'Online', icon: Globe },
          { id: 'all', label: 'Tutti', icon: CalendarDays },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter.id
                ? 'bg-purple-500 text-white'
                : 'bg-white border hover:bg-gray-50 text-gray-700'
            }`}
          >
            <filter.icon className="h-4 w-4" />
            {filter.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500 mb-4" />
          <p className="text-gray-500">Caricamento eventi...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarDays className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun evento trovato</h3>
          <p className="text-gray-500">Prova a cambiare i filtri di ricerca</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Date Box */}
                  <div className={`w-32 bg-${getTypeColor(event.type)}-500 text-white p-4 flex flex-col items-center justify-center`}>
                    <span className="text-4xl mb-2">{event.image}</span>
                    <span className="text-xs opacity-80 uppercase">{getTypeLabel(event.type)}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Building2 className="h-4 w-4" /> {event.organizer}
                        </p>
                      </div>
                      {event.ecm && (
                        <Badge className="bg-green-100 text-green-700">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {event.ecmCredits} ECM
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDateRange(event.date, event.endDate)}
                      </span>
                      {event.location && !event.location.toLowerCase().includes('online') ? (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                        >
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {event.topics.map((topic, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant={event.saved ? "default" : "outline"}
                        className={event.saved ? "bg-red-500 hover:bg-red-600" : ""}
                        onClick={() => toggleSaveEvent(event.id, event.saved)}
                        disabled={savingEvent === event.id}
                      >
                        {savingEvent === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart className={`h-4 w-4 mr-1 ${event.saved ? 'fill-current' : ''}`} />
                        )}
                        {event.saved ? 'Salvato' : 'Salva'}
                      </Button>
                      <a href={`/eventi-clinica/${event.id}`}>
                        <Button size="sm" className={`bg-${getTypeColor(event.type)}-500 hover:bg-${getTypeColor(event.type)}-600`}>
                          <ExternalLink className="h-4 w-4 mr-1" /> Dettagli
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && selectedEventForShare && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShareModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Condividi Evento</h3>
              <button 
                onClick={() => setShareModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-purple-50 rounded-xl">
              <p className="font-semibold text-purple-900">{selectedEventForShare.title}</p>
              <p className="text-sm text-purple-700 mt-1">
                📅 {formatDateRange(selectedEventForShare.date, selectedEventForShare.endDate)}
              </p>
              <p className="text-sm text-purple-700">
                📍 {selectedEventForShare.location}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => shareEvent('whatsapp')}
                className="flex items-center justify-center gap-2 p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
              
              <button 
                onClick={() => shareEvent('telegram')}
                className="flex items-center justify-center gap-2 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </button>
              
              <button 
                onClick={() => shareEvent('facebook')}
                className="flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              
              <button 
                onClick={() => shareEvent('email')}
                className="flex items-center justify-center gap-2 p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                <Mail className="h-6 w-6" />
                Email
              </button>
            </div>
            
            <div className="mt-4">
              <button 
                onClick={() => shareEvent('copy')}
                className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl transition-colors ${
                  copied 
                    ? 'bg-green-100 text-green-700 border-2 border-green-500' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    Link copiato!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    Copia link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <Card className="mt-8 bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900">Come funziona?</h4>
              <p className="text-sm text-purple-700 mt-1">
                VetBuddy raccoglie automaticamente eventi e convegni veterinari da fonti come SCIVAC, FNOVI, AIVPA e altre 
                associazioni veterinarie italiane. Gli eventi vengono aggiornati settimanalmente.
              </p>
              <p className="text-sm text-purple-600 mt-2">
                💡 <strong>Suggerimento:</strong> Usa il pulsante ❤️ per salvare gli eventi che ti interessano e ritrovarli facilmente nel filtro "Salvati".
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// ==================== CLINIC FEEDBACK PAGE ====================
function ClinicFeedbackPage({ user }) {
  const [feedbackForm, setFeedbackForm] = useState({
    type: null,
    subject: '',
    message: '',
    rating: 0
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const feedbackTypes = [
    { id: 'bug', label: '🐛 Segnala un bug', desc: 'Qualcosa non funziona come dovrebbe', color: 'from-red-50 to-red-100 border-red-200 hover:border-red-400' },
    { id: 'suggestion', label: '💡 Suggerimento', desc: 'Hai un\'idea per migliorare VetBuddy', color: 'from-amber-50 to-amber-100 border-amber-200 hover:border-amber-400' },
    { id: 'praise', label: '⭐ Complimento', desc: 'Dicci cosa ti piace!', color: 'from-green-50 to-green-100 border-green-200 hover:border-green-400' },
    { id: 'other', label: '📝 Altro', desc: 'Qualsiasi altro feedback', color: 'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.message.trim() || !feedbackForm.type) {
      alert('Seleziona un tipo e scrivi un messaggio');
      return;
    }
    
    setSending(true);
    try {
      const response = await api.post('feedback', feedbackForm);
      if (response.success) {
        setSent(true);
        setFeedbackForm({ type: null, subject: '', message: '', rating: 0 });
      }
    } catch (error) {
      alert('Errore: ' + (error.message || 'Impossibile inviare il feedback'));
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setSent(false);
    setFeedbackForm({ type: null, subject: '', message: '', rating: 0 });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="h-7 w-7 text-teal-500" />
          Feedback
        </h1>
        <p className="text-gray-500 mt-1">Aiutaci a migliorare VetBuddy con il tuo feedback</p>
      </div>

      {sent ? (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Grazie per il feedback! 🎉</h2>
            <p className="text-gray-600 mb-2">Il tuo messaggio è stato inviato al team VetBuddy.</p>
            <p className="text-gray-500 text-sm mb-6">Ti abbiamo inviato un'email di conferma.</p>
            <Button onClick={resetForm} className="bg-teal-500 hover:bg-teal-600">
              <Send className="h-4 w-4 mr-2" />
              Invia altro feedback
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Tipo di feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Che tipo di feedback vuoi inviarci?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {feedbackTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFeedbackForm(f => ({ ...f, type: type.id }))}
                    className={`p-4 rounded-xl border-2 transition-all text-left bg-gradient-to-br ${type.color} ${
                      feedbackForm.type === type.id ? 'ring-2 ring-teal-500 ring-offset-2' : ''
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.label.split(' ')[0]}</div>
                    <div className="font-semibold text-gray-800">{type.label.split(' ').slice(1).join(' ')}</div>
                    <div className="text-sm text-gray-600 mt-1">{type.desc}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form messaggio */}
          {feedbackForm.type && (
            <Card className="border-teal-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {feedbackTypes.find(t => t.id === feedbackForm.type)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Rating per complimenti */}
                  {feedbackForm.type === 'praise' && (
                    <div>
                      <Label className="mb-2 block">Quanto sei soddisfatto di VetBuddy?</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackForm(f => ({ ...f, rating: star }))}
                            className="text-3xl hover:scale-110 transition-transform"
                          >
                            {star <= feedbackForm.rating ? '⭐' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Oggetto (opzionale)</Label>
                    <Input
                      value={feedbackForm.subject}
                      onChange={(e) => setFeedbackForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder="Di cosa si tratta?"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Messaggio *</Label>
                    <Textarea
                      value={feedbackForm.message}
                      onChange={(e) => setFeedbackForm(f => ({ ...f, message: e.target.value }))}
                      placeholder={
                        feedbackForm.type === 'bug' ? 'Descrivi il problema che hai riscontrato, includendo i passaggi per riprodurlo se possibile...' :
                        feedbackForm.type === 'suggestion' ? 'Descrivi la tua idea per migliorare VetBuddy...' :
                        feedbackForm.type === 'praise' ? 'Cosa ti piace di VetBuddy? Cosa funziona particolarmente bene?' :
                        'Scrivi il tuo messaggio...'
                      }
                      rows={6}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setFeedbackForm(f => ({ ...f, type: null }))}
                      className="flex-1"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Indietro
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={sending || !feedbackForm.message.trim()} 
                      className="flex-1 bg-teal-500 hover:bg-teal-600"
                    >
                      {sending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Invio in corso...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Invia Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Info box */}
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Il tuo feedback conta!</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ogni segnalazione ci aiuta a migliorare VetBuddy. Leggiamo tutto e rispondiamo sempre. 
                    Per domande urgenti, scrivi a <a href="mailto:info@vetbuddy.it" className="text-teal-600 hover:underline">info@vetbuddy.it</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


// ==================== AUTOMAZIONI ====================
function ClinicAutomations({ user, onNavigate }) {
  const [automationSettings, setAutomationSettings] = useState({});
  const [automationLoading, setAutomationLoading] = useState(true);
  const [automationSaving, setAutomationSaving] = useState(null);
  const [clinicPlan, setClinicPlan] = useState('starter');
  const [allowedAutomations, setAllowedAutomations] = useState([]);
  const [planAutomationsCount, setPlanAutomationsCount] = useState(0);

  useEffect(() => {
    loadAutomationSettings();
  }, []);

  const loadAutomationSettings = async () => {
    try {
      const response = await api.get('automations/settings');
      if (response.success) {
        setAutomationSettings(response.settings || {});
        setClinicPlan(response.plan || 'starter');
        setAllowedAutomations(response.allowedAutomations || []);
        setPlanAutomationsCount(response.automationsCount || 0);
      }
    } catch (error) {
      console.error('Error loading automation settings:', error);
    } finally {
      setAutomationLoading(false);
    }
  };

  const isAutomationAllowed = (key) => {
    if (clinicPlan === 'custom') return true;
    if (allowedAutomations === 'all') return true;
    return allowedAutomations.includes(key);
  };

  const toggleAutomation = async (key) => {
    if (!isAutomationAllowed(key)) {
      alert(`⚠️ Questa automazione non è inclusa nel piano ${clinicPlan.toUpperCase()}.\n\nEffettua l'upgrade al piano PRO o CUSTOM per sbloccarla.`);
      return;
    }

    const newValue = !automationSettings[key];
    setAutomationSaving(key);
    setAutomationSettings(prev => ({ ...prev, [key]: newValue }));
    
    try {
      const response = await api.post('automations/settings', { key, enabled: newValue });
      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error saving automation setting:', error);
      setAutomationSettings(prev => ({ ...prev, [key]: !newValue }));
      alert(error.message || 'Errore nel salvataggio. Riprova.');
    } finally {
      setAutomationSaving(null);
    }
  };

  // Count active automations (only allowed ones)
  const activeAutomationsCount = Object.entries(automationSettings)
    .filter(([key, value]) => value && isAutomationAllowed(key))
    .length;
  const totalAutomations = Object.keys(automationSettings).length;

  // Plan badge color
  const getPlanBadgeColor = () => {
    switch(clinicPlan) {
      case 'custom': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'pro': return 'bg-coral-100 text-coral-700 border-coral-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Helper component for automation item
  const AutomationItem = ({ settingKey, icon, title, description, gradient, forceDisabled = false }) => {
    const allowed = isAutomationAllowed(settingKey);
    const isDisabled = forceDisabled || !allowed;
    
    return (
      <div className={`flex items-center justify-between p-3 ${gradient} rounded-lg ${isDisabled ? 'opacity-50' : ''} relative`}>
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <p className="text-sm font-medium flex items-center gap-1">
              {title}
              {!allowed && <Lock className="h-3 w-3 text-gray-400" />}
            </p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!allowed && (
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">
              {clinicPlan === 'starter' ? 'Pro+' : 'Custom'}
            </Badge>
          )}
          <Switch 
            checked={allowed ? automationSettings[settingKey] : false}
            onCheckedChange={() => toggleAutomation(settingKey)}
            disabled={isDisabled || automationSaving === settingKey}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-500" /> Automazioni
          </h2>
          <p className="text-gray-500 text-sm">Configura le automazioni per la tua clinica</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`text-sm px-3 py-1 ${getPlanBadgeColor()}`}>
            Piano: {clinicPlan === 'pro' ? 'Pro' : clinicPlan === 'custom' ? 'Custom' : 'Starter'}
          </Badge>
          <Badge className={`text-lg px-4 py-2 ${activeAutomationsCount >= planAutomationsCount - 2 ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
            {automationLoading ? '...' : `${activeAutomationsCount}/${planAutomationsCount} Attive`}
          </Badge>
        </div>
      </div>

      {automationLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-3 text-gray-500">Caricamento automazioni...</span>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Plan Info Banner */}
          {clinicPlan === 'starter' && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-green-800 font-semibold">Piano Starter - 5 Automazioni Incluse</p>
                  <p className="text-green-700 text-sm mt-1">
                    Il tuo piano include <strong>5 automazioni essenziali</strong>: Promemoria appuntamenti, Conferma prenotazione, Benvenuto nuovo pet, Compleanno pet, Conferma automatica.
                    <br/>Per sbloccare tutte le 21+ automazioni avanzate, effettua l'upgrade al piano <strong>Pro</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Promemoria</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Conferma</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Benvenuto Pet</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Compleanno</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Conferma Auto</span>
                  </div>
                  <Button size="sm" className="mt-3 bg-coral-500 hover:bg-coral-600">
                    <Zap className="h-4 w-4 mr-2" /> Upgrade a Pro - Sblocca Altre 16 Automazioni
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {clinicPlan === 'pro' && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
              <p className="text-purple-700 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span><strong>Piano Pro:</strong> Hai accesso a {planAutomationsCount} automazioni. Le automazioni bloccate 🔒 richiedono il piano Custom.</span>
              </p>
            </div>
          )}
          
          {clinicPlan === 'custom' && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
              <p className="text-purple-700 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span><strong>Piano Custom:</strong> Tutte le {planAutomationsCount} automazioni vengono eseguite ogni giorno alle 8:00. Attiva solo quelle che ti servono!</span>
              </p>
            </div>
          )}

          {/* Email Automatiche */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" /> Email Automatiche
              </CardTitle>
              <CardDescription>Comunicazioni automatiche ai clienti</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="appointmentReminders" icon={<Bell className="h-4 w-4 text-blue-500" />} title="Promemoria Appuntamenti" description="24h prima" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="bookingConfirmation" icon={<CheckCircle className="h-4 w-4 text-green-500" />} title="Conferma Prenotazione" description="Immediata" gradient="bg-gradient-to-r from-green-50 to-green-100" />
              <AutomationItem settingKey="vaccineRecalls" icon={<Syringe className="h-4 w-4 text-purple-500" />} title="Richiami Vaccini" description="14 giorni prima" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
              <AutomationItem settingKey="postVisitFollowup" icon={<Heart className="h-4 w-4 text-red-500" />} title="Follow-up Post Visita" description="24h dopo" gradient="bg-gradient-to-r from-red-50 to-red-100" />
            </CardContent>
          </Card>

          {/* Gestione Smart */}
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" /> Gestione Smart
              </CardTitle>
              <CardDescription>Automazioni per ottimizzare il flusso di lavoro</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="noShowDetection" icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} title="Rilevamento No-Show" description="Notifica automatica" gradient="bg-gradient-to-r from-amber-50 to-amber-100" />
              <AutomationItem settingKey="waitlistNotification" icon={<Timer className="h-4 w-4 text-blue-500" />} title="Notifica Lista d'Attesa" description="Slot disponibili" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="suggestedSlots" icon={<Calendar className="h-4 w-4 text-green-500" />} title="Slot Suggeriti" description="AI-powered" gradient="bg-gradient-to-r from-green-50 to-green-100" />
              <AutomationItem settingKey="documentReminders" icon={<FileText className="h-4 w-4 text-purple-500" />} title="Promemoria Documenti" description="Scadenze imminenti" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
            </CardContent>
          </Card>

          {/* Messaggi & Report */}
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" /> Messaggi & Report
              </CardTitle>
              <CardDescription>Comunicazioni e reportistica automatica</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="autoTicketAssignment" icon={<Ticket className="h-4 w-4 text-blue-500" />} title="Assegnazione Ticket Auto" description="Smistamento intelligente" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="aiQuickReplies" icon={<Zap className="h-4 w-4 text-purple-500" />} title="Risposte Rapide AI" description="Suggerimenti intelligenti" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
              <AutomationItem settingKey="urgencyNotifications" icon={<AlertCircle className="h-4 w-4 text-red-500" />} title="Notifiche Urgenze" description="Priorità alta" gradient="bg-gradient-to-r from-red-50 to-red-100" />
              <AutomationItem settingKey="weeklyReport" icon={<TrendingUp className="h-4 w-4 text-green-500" />} title="Report Settimanale" description="Ogni lunedì" gradient="bg-gradient-to-r from-green-50 to-green-100" />
            </CardContent>
          </Card>

          {/* Engagement & Fidelizzazione */}
          <Card className="border-pink-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" /> Engagement & Fidelizzazione
              </CardTitle>
              <CardDescription>Mantieni i clienti coinvolti</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="petBirthday" icon={<Gift className="h-4 w-4 text-pink-500" />} title="Compleanno Pet" description="Auguri automatici" gradient="bg-gradient-to-r from-pink-50 to-pink-100" />
              <AutomationItem settingKey="reviewRequest" icon={<Star className="h-4 w-4 text-amber-500" />} title="Richiesta Recensione" description="Post visita positiva" gradient="bg-gradient-to-r from-amber-50 to-amber-100" />
              <AutomationItem settingKey="inactiveClientReactivation" icon={<RefreshCw className="h-4 w-4 text-blue-500" />} title="Riattivazione Clienti" description="Dopo 6 mesi inattività" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="loyaltyProgram" icon={<Star className="h-4 w-4 text-purple-500" />} title="Programma Fedeltà" description="Punti e premi" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
              <AutomationItem settingKey="referralProgram" icon={<Users className="h-4 w-4 text-green-500" />} title="Programma Referral" description="Invita un amico" gradient="bg-gradient-to-r from-green-50 to-green-100" />
            </CardContent>
          </Card>

          {/* Salute & Prevenzione */}
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" /> Salute & Prevenzione
              </CardTitle>
              <CardDescription>Reminder per la salute degli animali</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="antiparasiticReminder" icon={<Shield className="h-4 w-4 text-green-500" />} title="Antiparassitari" description="Richiamo mensile" gradient="bg-gradient-to-r from-green-50 to-green-100" />
              <AutomationItem settingKey="annualCheckup" icon={<Stethoscope className="h-4 w-4 text-blue-500" />} title="Check-up Annuale" description="Promemoria annuale" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="medicationRefill" icon={<Syringe className="h-4 w-4 text-purple-500" />} title="Refill Farmaci" description="Scorte in esaurimento" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
              <AutomationItem settingKey="weightAlert" icon={<Weight className="h-4 w-4 text-amber-500" />} title="Allarme Peso" description="Variazioni significative" gradient="bg-gradient-to-r from-amber-50 to-amber-100" />
              <AutomationItem settingKey="dentalHygiene" icon={<span className="text-lg">🦷</span>} title="Igiene Dentale" description="Richiamo semestrale" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="sterilizationReminder" icon={<span className="text-lg">✂️</span>} title="Sterilizzazione" description="Età consigliata" gradient="bg-gradient-to-r from-pink-50 to-pink-100" />
              <AutomationItem settingKey="seniorPetCare" icon={<span className="text-lg">👴</span>} title="Cura Pet Senior" description="Controlli frequenti" gradient="bg-gradient-to-r from-amber-50 to-amber-100" />
            </CardContent>
          </Card>

          {/* Operatività Clinica */}
          <Card className="border-cyan-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cyan-500" /> Operatività Clinica
              </CardTitle>
              <CardDescription>Automazioni per la gestione quotidiana</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="appointmentConfirmation" icon={<CheckCircle className="h-4 w-4 text-green-500" />} title="Conferma Appuntamento" description="1h prima" gradient="bg-gradient-to-r from-green-50 to-green-100" />
              <AutomationItem settingKey="labResultsReady" icon={<FileCheck className="h-4 w-4 text-blue-500" />} title="Referti Pronti" description="Notifica immediata" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="paymentReminder" icon={<Euro className="h-4 w-4 text-amber-500" />} title="Promemoria Pagamento" description="Fatture scadute" gradient="bg-gradient-to-r from-amber-50 to-amber-100" />
              <AutomationItem settingKey="postSurgeryFollowup" icon={<Scissors className="h-4 w-4 text-red-500" />} title="Follow-up Chirurgia" description="Controllo post-op" gradient="bg-gradient-to-r from-red-50 to-red-100" />
              <AutomationItem settingKey="dailySummary" icon={<BarChart3 className="h-4 w-4 text-purple-500" />} title="Riepilogo Giornaliero" description="Ogni sera" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
              <AutomationItem settingKey="lowStockAlert" icon={<AlertTriangle className="h-4 w-4 text-red-500" />} title="Scorte Basse" description="Allarme magazzino" gradient="bg-gradient-to-r from-red-50 to-red-100" />
            </CardContent>
          </Card>

          {/* Stagionali */}
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">🌡️</span> Stagionali
              </CardTitle>
              <CardDescription>Alert basati sulla stagione</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="summerHeatAlert" icon={<span className="text-lg">☀️</span>} title="Allarme Caldo" description="Estate" gradient="bg-gradient-to-r from-orange-50 to-orange-100" />
              <AutomationItem settingKey="tickSeasonAlert" icon={<span className="text-lg">🕷️</span>} title="Stagione Zecche" description="Primavera/Estate" gradient="bg-gradient-to-r from-green-50 to-green-100" />
              <AutomationItem settingKey="newYearFireworksAlert" icon={<span className="text-lg">🎆</span>} title="Capodanno Fuochi" description="Fine anno" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
              <AutomationItem settingKey="holidayClosures" icon={<Calendar className="h-4 w-4 text-red-500" />} title="Chiusure Festive" description="Notifica clienti" gradient="bg-gradient-to-r from-red-50 to-red-100" />
            </CardContent>
          </Card>

          {/* Ciclo di Vita & Onboarding */}
          <Card className="border-teal-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-teal-500" /> Ciclo di Vita Pet
              </CardTitle>
              <CardDescription>Accompagna il pet in ogni fase</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="welcomeNewPet" icon={<span className="text-lg">🎉</span>} title="Benvenuto Nuovo Pet" description="Prima registrazione" gradient="bg-gradient-to-r from-green-50 to-green-100" />
              <AutomationItem settingKey="microchipCheck" icon={<span className="text-lg">📍</span>} title="Verifica Microchip" description="Controllo annuale" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
            </CardContent>
          </Card>

          {/* Situazioni Delicate */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-gray-500" /> Situazioni Delicate
              </CardTitle>
              <CardDescription>Comunicazioni con sensibilità</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="petCondolences" icon={<span className="text-lg">🕯️</span>} title="Condoglianze" description="In caso di lutto" gradient="bg-gradient-to-r from-gray-50 to-gray-100" />
              <AutomationItem settingKey="griefFollowup" icon={<Heart className="h-4 w-4 text-gray-500" />} title="Follow-up Lutto" description="Dopo 1 mese" gradient="bg-gradient-to-r from-gray-50 to-gray-100" />
            </CardContent>
          </Card>

          {/* Multi-Canale (Coming Soon) */}
          <Card className="border-gray-300 opacity-70">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">📱</span> Multi-Canale
                <Badge className="bg-amber-100 text-amber-700 text-xs">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>Comunicazioni su più piattaforme</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="whatsappReminders" icon={<span className="text-lg">💬</span>} title="WhatsApp Business" description="Richiede integrazione" gradient="bg-gradient-to-r from-green-50 to-green-100" disabled={true} />
              <AutomationItem settingKey="smsEmergency" icon={<span className="text-lg">📲</span>} title="SMS Emergenza" description="Richiede crediti SMS" gradient="bg-gradient-to-r from-blue-50 to-blue-100" disabled={true} />
            </CardContent>
          </Card>

          {/* Staff */}
          <Card className="border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" /> Per lo Staff
              </CardTitle>
              <CardDescription>Automazioni interne per il team</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="staffBirthday" icon={<Gift className="h-4 w-4 text-pink-500" />} title="Compleanno Staff" description="Auguri automatici" gradient="bg-gradient-to-r from-pink-50 to-pink-100" />
            </CardContent>
          </Card>
        </div>
      )}
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
  
  // Availability settings state
  const [availabilitySettings, setAvailabilitySettings] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  
  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    clinicName: user.clinicName || '',
    vatNumber: user.vatNumber || '',
    phone: user.phone || '',
    whatsappNumber: user.whatsappNumber || '',
    website: user.website || '',
    description: user.description || '',
    openingTime: user.openingTime || '09:00',
    closingTime: user.closingTime || '18:00',
    cancellationPolicyText: user.cancellationPolicyText || 'Ti preghiamo di avvisarci almeno 24 ore prima in caso di disdetta.'
  });
  
  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({
    paymentMethods: { cash: true, cardInClinic: true, bankTransfer: false, online: false },
    cancellationPolicy: 'free_24h'
  });
  const [paymentSettingsSaving, setPaymentSettingsSaving] = useState(false);

  useEffect(() => { 
    loadStripeSettings(); 
    loadGoogleCalendarStatus();
    loadStaffColors();
    loadStaff();
    loadPaymentSettings();
    loadAvailabilitySettings();
    
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

  // Load availability settings
  const loadAvailabilitySettings = async () => {
    setLoadingAvailability(true);
    try {
      const response = await api.get('clinic/availability');
      setAvailabilitySettings(response);
    } catch (error) {
      console.error('Error loading availability settings:', error);
      // Set defaults if not configured - using new blocks format
      setAvailabilitySettings({
        weeklySchedule: {
          monday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          tuesday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          wednesday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          thursday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          friday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          saturday: { enabled: false, blocks: [] },
          sunday: { enabled: false, blocks: [] }
        },
        slotDuration: 30,
        dateOverrides: {},
        blockedDates: [],
        blockedSlots: [],
        acceptOnlineBooking: true,
        requireConfirmation: true
      });
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Save availability settings
  const saveAvailabilitySettings = async () => {
    setSavingAvailability(true);
    try {
      await api.put('clinic/availability', availabilitySettings);
      alert('✅ Orari di disponibilità salvati!');
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('❌ Errore nel salvataggio degli orari');
    } finally {
      setSavingAvailability(false);
    }
  };

  // Update day enabled/disabled
  const updateDayEnabled = (day, enabled) => {
    setAvailabilitySettings(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          enabled,
          blocks: enabled && (!prev.weeklySchedule[day]?.blocks || prev.weeklySchedule[day].blocks.length === 0)
            ? [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }]
            : prev.weeklySchedule[day]?.blocks || []
        }
      }
    }));
  };

  // Update a specific time block
  const updateTimeBlock = (day, blockIndex, field, value) => {
    setAvailabilitySettings(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          blocks: prev.weeklySchedule[day].blocks.map((block, i) => 
            i === blockIndex ? { ...block, [field]: value } : block
          )
        }
      }
    }));
  };

  // Add a new time block to a day
  const addTimeBlock = (day) => {
    setAvailabilitySettings(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          blocks: [...(prev.weeklySchedule[day]?.blocks || []), { start: '09:00', end: '12:00' }]
        }
      }
    }));
  };

  // Remove a time block from a day
  const removeTimeBlock = (day, blockIndex) => {
    setAvailabilitySettings(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          blocks: prev.weeklySchedule[day].blocks.filter((_, i) => i !== blockIndex)
        }
      }
    }));
  };

  // Add a blocked date
  const addBlockedDate = () => {
    const date = prompt('Inserisci la data da bloccare (YYYY-MM-DD):');
    if (!date) return;
    const reason = prompt('Motivo (opzionale):') || 'Chiuso';
    setAvailabilitySettings(prev => ({
      ...prev,
      blockedDates: [...(prev.blockedDates || []), { date, reason }]
    }));
  };

  // Remove a blocked date
  const removeBlockedDate = (index) => {
    setAvailabilitySettings(prev => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((_, i) => i !== index)
    }));
  };

  // Load payment settings
  const loadPaymentSettings = async () => {
    try {
      const response = await api.get(`clinic/payment-settings?clinicId=${user.id}`);
      if (response.success && response.settings) {
        setPaymentSettings(response.settings);
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
    }
  };

  // Update payment method
  const updatePaymentMethod = async (method, enabled) => {
    setPaymentSettingsSaving(true);
    const newMethods = { ...paymentSettings.paymentMethods, [method]: enabled };
    setPaymentSettings(prev => ({ ...prev, paymentMethods: newMethods }));
    
    try {
      await api.put('clinic/payment-settings', { paymentMethods: newMethods });
    } catch (error) {
      console.error('Error saving payment method:', error);
    } finally {
      setPaymentSettingsSaving(false);
    }
  };

  // Update cancellation policy
  const updateCancellationPolicy = async (policyId) => {
    setPaymentSettingsSaving(true);
    setPaymentSettings(prev => ({ ...prev, cancellationPolicy: policyId }));
    
    try {
      await api.put('clinic/payment-settings', { cancellationPolicy: policyId });
    } catch (error) {
      console.error('Error saving cancellation policy:', error);
    } finally {
      setPaymentSettingsSaving(false);
    }
  };

  // Handle clinic profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('clinic/profile', profileForm);
      // Update user object in parent (would need to refresh or update context)
      alert('✅ Profilo clinica aggiornato con successo!');
      setEditingProfile(false);
      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error updating clinic profile:', error);
      alert('❌ Errore durante l\'aggiornamento del profilo');
    } finally {
      setSaving(false);
    }
  };

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
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Impostazioni</h2>
        <p className="text-gray-500 text-sm">Configura la tua clinica</p>
      </div>
      
      <div className="space-y-6 max-w-2xl">
        {/* Abbonamento VetBuddy - Pilot */}
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />Abbonamento VetBuddy
              <Badge className="bg-amber-500 text-white">Pilot Milano</Badge>
            </CardTitle>
            <CardDescription>Accesso su invito — 90 giorni gratuiti per cliniche selezionate (estendibili a 6 mesi)</CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionPlans user={user} />
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
                    placeholder="Inserisci la tua Publishable Key Stripe"
                  />
                </div>
                <div>
                  <Label>Secret Key (sk_...)</Label>
                  <Input 
                    type="password"
                    value={stripeForm.secretKey} 
                    onChange={(e) => setStripeForm({...stripeForm, secretKey: e.target.value})}
                    placeholder="Inserisci la tua Secret Key Stripe"
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

        {/* WhatsApp Business Notifications */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />Notifiche WhatsApp
              <Badge className="bg-green-100 text-green-700 ml-2">Attivo</Badge>
            </CardTitle>
            <CardDescription>Invia promemoria appuntamenti e notifiche ai clienti via WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">WhatsApp Business configurato</p>
                  <p className="text-sm text-green-600">Numero: +39 388 744 1417</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Notifiche automatiche disponibili:</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Promemoria appuntamento</p>
                    <p className="text-xs text-gray-500">24h e 2h prima della visita</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Conferma prenotazione</p>
                    <p className="text-xs text-gray-500">Automatica alla prenotazione</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Documento pronto</p>
                    <p className="text-xs text-gray-500">Quando carichi referti/prescrizioni</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pagamento ricevuto</p>
                    <p className="text-xs text-gray-500">Conferma pagamenti online</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Bell className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Come funziona</p>
                  <p className="text-blue-600">I clienti devono avere un numero WhatsApp registrato nel loro profilo. Le notifiche verranno inviate automaticamente in base alle tue automazioni.</p>
                </div>
              </div>
            </div>
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


        {/* 💳 METODI DI PAGAMENTO */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              Metodi di Pagamento & Cancellazione
            </CardTitle>
            <CardDescription>Configura come i clienti possono pagare e le policy di cancellazione</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Metodi di pagamento */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Metodi di pagamento accettati</h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={paymentSettings?.paymentMethods?.cash !== false}
                    onChange={(e) => updatePaymentMethod('cash', e.target.checked)}
                    className="h-4 w-4 text-green-500 rounded"
                  />
                  <span className="text-lg">💵</span>
                  <span>Contanti</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={paymentSettings?.paymentMethods?.cardInClinic !== false}
                    onChange={(e) => updatePaymentMethod('cardInClinic', e.target.checked)}
                    className="h-4 w-4 text-green-500 rounded"
                  />
                  <span className="text-lg">💳</span>
                  <span>Carta in clinica</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={paymentSettings?.paymentMethods?.bankTransfer === true}
                    onChange={(e) => updatePaymentMethod('bankTransfer', e.target.checked)}
                    className="h-4 w-4 text-green-500 rounded"
                  />
                  <span className="text-lg">🏦</span>
                  <span>Bonifico</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={paymentSettings?.paymentMethods?.online === true}
                    onChange={(e) => updatePaymentMethod('online', e.target.checked)}
                    className="h-4 w-4 text-green-500 rounded"
                  />
                  <span className="text-lg">🌐</span>
                  <span>Online (Stripe)</span>
                </label>
              </div>
            </div>

            {/* Policy cancellazione */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Policy di cancellazione</h4>
              <div className="space-y-2">
                {[
                  { id: 'free_24h', label: 'Cancellazione gratuita fino a 24h prima' },
                  { id: 'free_48h', label: 'Cancellazione gratuita fino a 48h prima' },
                  { id: 'penalty_30_24h', label: 'Penale 30% se cancelli meno di 24h prima' },
                  { id: 'penalty_50_24h', label: 'Penale 50% se cancelli meno di 24h prima' },
                  { id: 'penalty_100_24h', label: 'Nessun rimborso se cancelli meno di 24h prima' },
                  { id: 'no_refund', label: 'Nessun rimborso per cancellazioni' }
                ].map(policy => (
                  <label key={policy.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${paymentSettings?.cancellationPolicy === policy.id ? 'border-green-500 bg-green-50' : ''}`}>
                    <input 
                      type="radio" 
                      name="cancellationPolicy"
                      checked={paymentSettings?.cancellationPolicy === policy.id}
                      onChange={() => updateCancellationPolicy(policy.id)}
                      className="h-4 w-4 text-green-500"
                    />
                    <span className="text-sm">{policy.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {paymentSettingsSaving && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Salvataggio...
              </p>
            )}
          </CardContent>
        </Card>

        {/* 🕐 ORARI DI DISPONIBILITÀ */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Orari di Disponibilità
            </CardTitle>
            <CardDescription>Configura le fasce orarie in cui i clienti possono prenotare. Puoi aggiungere più blocchi per ogni giorno.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAvailability ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Durata slot */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Durata slot appuntamento</p>
                    <p className="text-sm text-gray-500">Quanto dura mediamente una visita</p>
                  </div>
                  <Select 
                    value={String(availabilitySettings?.slotDuration || 30)} 
                    onValueChange={(v) => setAvailabilitySettings(prev => ({...prev, slotDuration: parseInt(v)}))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="20">20 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Orari settimanali con blocchi flessibili */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    📅 Orari settimanali
                    <span className="text-xs font-normal text-gray-500">(aggiungi più fasce orarie per ogni giorno)</span>
                  </h4>
                  {availabilitySettings?.weeklySchedule && [
                    { key: 'monday', label: 'Lunedì', short: 'LUN' },
                    { key: 'tuesday', label: 'Martedì', short: 'MAR' },
                    { key: 'wednesday', label: 'Mercoledì', short: 'MER' },
                    { key: 'thursday', label: 'Giovedì', short: 'GIO' },
                    { key: 'friday', label: 'Venerdì', short: 'VEN' },
                    { key: 'saturday', label: 'Sabato', short: 'SAB' },
                    { key: 'sunday', label: 'Domenica', short: 'DOM' }
                  ].map(day => {
                    const dayConfig = availabilitySettings.weeklySchedule[day.key] || { enabled: false, blocks: [] };
                    return (
                      <div key={day.key} className={`p-3 border rounded-lg transition-colors ${dayConfig.enabled ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={dayConfig.enabled || false}
                              onChange={(e) => updateDayEnabled(day.key, e.target.checked)}
                              className="h-4 w-4 text-blue-500 rounded"
                            />
                            <span className={`font-medium w-24 ${dayConfig.enabled ? 'text-gray-800' : 'text-gray-400'}`}>
                              {day.label}
                            </span>
                          </div>
                          {dayConfig.enabled && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => addTimeBlock(day.key)}
                              className="text-xs h-7"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Aggiungi fascia
                            </Button>
                          )}
                        </div>
                        
                        {dayConfig.enabled && (
                          <div className="space-y-2 ml-7">
                            {(dayConfig.blocks || []).length === 0 ? (
                              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                ⚠️ Nessuna fascia oraria. Aggiungi almeno una fascia.
                              </p>
                            ) : (
                              dayConfig.blocks.map((block, blockIndex) => (
                                <div key={blockIndex} className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                                  <span className="text-xs text-gray-500 w-16">Fascia {blockIndex + 1}:</span>
                                  <Input
                                    type="time"
                                    value={block.start || '09:00'}
                                    onChange={(e) => updateTimeBlock(day.key, blockIndex, 'start', e.target.value)}
                                    className="w-28 h-8 text-sm"
                                  />
                                  <span className="text-gray-400">→</span>
                                  <Input
                                    type="time"
                                    value={block.end || '13:00'}
                                    onChange={(e) => updateTimeBlock(day.key, blockIndex, 'end', e.target.value)}
                                    className="w-28 h-8 text-sm"
                                  />
                                  {dayConfig.blocks.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeTimeBlock(day.key, blockIndex)}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Date bloccate */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      🚫 Chiusure straordinarie
                      <span className="text-xs font-normal text-gray-500">(ferie, festività, ecc.)</span>
                    </h4>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addBlockedDate}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Aggiungi chiusura
                    </Button>
                  </div>
                  
                  {(availabilitySettings?.blockedDates || []).length === 0 ? (
                    <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                      Nessuna chiusura straordinaria programmata
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availabilitySettings.blockedDates.map((blocked, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CalendarX className="h-4 w-4 text-red-500" />
                            <span className="font-medium text-red-700">
                              {blocked.date ? new Date(blocked.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Data non valida'}
                            </span>
                            {blocked.reason && <span className="text-sm text-red-600">- {blocked.reason}</span>}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBlockedDate(index)}
                            className="h-7 w-7 p-0 text-red-500 hover:bg-red-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Opzioni aggiuntive */}
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">⚙️ Opzioni prenotazione</h4>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availabilitySettings?.acceptOnlineBooking !== false}
                      onChange={(e) => setAvailabilitySettings(prev => ({...prev, acceptOnlineBooking: e.target.checked}))}
                      className="h-4 w-4 text-blue-500 rounded"
                    />
                    <div>
                      <span className="font-medium">Accetta prenotazioni online</span>
                      <p className="text-sm text-gray-500">I clienti possono richiedere appuntamenti tramite l'app</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availabilitySettings?.requireConfirmation !== false}
                      onChange={(e) => setAvailabilitySettings(prev => ({...prev, requireConfirmation: e.target.checked}))}
                      className="h-4 w-4 text-blue-500 rounded"
                    />
                    <div>
                      <span className="font-medium">Richiedi conferma manuale</span>
                      <p className="text-sm text-gray-500">Gli appuntamenti devono essere confermati dalla clinica</p>
                    </div>
                  </label>
                </div>

                {/* Pulsante salva */}
                <Button 
                  onClick={saveAvailabilitySettings} 
                  disabled={savingAvailability}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {savingAvailability ? (
                    <><RefreshCw className="h-4 w-4 animate-spin mr-2" />Salvataggio...</>
                  ) : (
                    <><Check className="h-4 w-4 mr-2" />Salva orari di disponibilità</>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profilo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Profilo clinica</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setEditingProfile(!editingProfile)}>
              {editingProfile ? <X className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
              {editingProfile ? 'Annulla' : 'Modifica'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingProfile ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Nome clinica *</Label><Input value={profileForm.clinicName} onChange={(e) => setProfileForm({...profileForm, clinicName: e.target.value})} required /></div>
                  <div><Label>P.IVA</Label><Input value={profileForm.vatNumber} onChange={(e) => setProfileForm({...profileForm, vatNumber: e.target.value})} placeholder="IT12345678901" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Telefono</Label><Input value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} placeholder="+39 02 1234567" /></div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      WhatsApp Business
                    </Label>
                    <Input 
                      value={profileForm.whatsappNumber} 
                      onChange={(e) => setProfileForm({...profileForm, whatsappNumber: e.target.value})} 
                      placeholder="+39 333 1234567" 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Inserisci il numero con prefisso internazionale (es. +39 333...).
                      <a href="#" onClick={(e) => { e.preventDefault(); alert('📱 Come configurare WhatsApp Business:\n\n1. Scarica WhatsApp Business dal Play Store o App Store\n2. Registrati con il numero della clinica\n3. Configura il profilo: nome, descrizione, orari, indirizzo\n4. Inserisci lo stesso numero qui su VetBuddy\n\n✅ I clienti potranno contattarti direttamente dall\'app!\n\n💡 Consiglio: Usa i messaggi automatici per rispondere quando sei occupato.'); }} className="text-blue-500 hover:underline ml-1">
                        Come configurare?
                      </a>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Sito web</Label><Input value={profileForm.website} onChange={(e) => setProfileForm({...profileForm, website: e.target.value})} placeholder="www.clinicaveterinaria.it" /></div>
                </div>
                <div><Label>Descrizione clinica</Label><Textarea value={profileForm.description} onChange={(e) => setProfileForm({...profileForm, description: e.target.value})} placeholder="Descrivi i servizi e le specializzazioni della tua clinica..." rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Orario apertura</Label><Input type="time" value={profileForm.openingTime} onChange={(e) => setProfileForm({...profileForm, openingTime: e.target.value})} /></div>
                  <div><Label>Orario chiusura</Label><Input type="time" value={profileForm.closingTime} onChange={(e) => setProfileForm({...profileForm, closingTime: e.target.value})} /></div>
                </div>
                <div>
                  <Label>Policy di cancellazione (testo personalizzato)</Label>
                  <Textarea 
                    value={profileForm.cancellationPolicyText} 
                    onChange={(e) => setProfileForm({...profileForm, cancellationPolicyText: e.target.value})} 
                    placeholder="Es: Ti preghiamo di avvisarci almeno 24 ore prima in caso di disdetta. La mancata comunicazione comporterà un addebito di €30." 
                    rows={2} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Questo messaggio apparirà nelle email di promemoria e nella conferma di cancellazione</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingProfile(false)} className="flex-1">Annulla</Button>
                  <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600">Salva modifiche</Button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-500">Nome clinica</Label><p className="font-medium">{user.clinicName || '-'}</p></div>
                  <div><Label className="text-gray-500">P.IVA</Label><p className="font-medium">{user.vatNumber || '-'}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-500">Email</Label><p className="font-medium">{user.email || '-'}</p></div>
                  <div><Label className="text-gray-500">Telefono</Label><p className="font-medium">{user.phone || '-'}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500 flex items-center gap-1">
                      <MessageCircle className="h-3 w-3 text-green-500" />
                      WhatsApp Business
                    </Label>
                    <p className="font-medium">{user.whatsappNumber || <span className="text-amber-600 text-sm">Non configurato</span>}</p>
                  </div>
                  <div><Label className="text-gray-500">Sito web</Label><p className="font-medium">{user.website || '-'}</p></div>
                </div>
                {user.description && <div><Label className="text-gray-500">Descrizione</Label><p className="text-sm text-gray-600">{user.description}</p></div>}
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-500">Orario apertura</Label><p className="font-medium">{user.openingTime || '09:00'}</p></div>
                  <div><Label className="text-gray-500">Orario chiusura</Label><p className="font-medium">{user.closingTime || '18:00'}</p></div>
                </div>
                {user.cancellationPolicyText && (
                  <div>
                    <Label className="text-gray-500">Policy di cancellazione</Label>
                    <p className="text-sm text-gray-600 bg-amber-50 p-2 rounded border border-amber-200">{user.cancellationPolicyText}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== CLINIC TUTORIAL INLINE ====================
function ClinicTutorialInline() {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  
  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await fetch('/api/tutorials/download?type=clinic');
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'VetBuddy_Tutorial_Cliniche.pdf';
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); a.remove();
    } catch (error) {
      alert('Errore durante il download. Riprova più tardi.');
    } finally { setDownloadingPDF(false); }
  };
  
  const sections = [
    { icon: Building2, title: 'Configurazione Iniziale', color: 'bg-coral-500', content: ['Registrati come clinica su vetbuddy.it', 'Completa il profilo: nome clinica, indirizzo, P.IVA, orari', 'Aggiungi logo e foto della struttura', 'Configura i servizi offerti e i relativi prezzi'], tip: 'Il Piano Starter è perfetto per veterinari freelance.' },
    { icon: Calendar, title: 'Gestione Appuntamenti', color: 'bg-blue-500', content: ['Visualizza il calendario dalla dashboard', 'Vedi appuntamenti in vista giornaliera, settimanale o mensile', 'Gestisci richieste: accetta, rifiuta o riprogramma', 'Imposta promemoria automatici'], tip: 'Usa i codici colore per distinguere tipi di appuntamento.' },
    { icon: FileText, title: 'Documenti e Prescrizioni', color: 'bg-amber-500', content: ['Crea prescrizioni, referti, certificati', 'Carica PDF esistenti o genera da template', 'Invia automaticamente via email al proprietario', 'Il documento sarà disponibile nell\'app del cliente'], tip: 'I documenti inviati digitalmente riducono le telefonate!' },
    { icon: Receipt, title: 'Fatturazione PROFORMA', color: 'bg-indigo-500', content: ['Crea fattura PROFORMA selezionando il cliente', 'Aggiungi servizi prestati con prezzi e quantità', 'Genera PDF ed esporta in CSV per il commercialista'], tip: 'Le fatture PROFORMA sono documenti non fiscali.' },
    { icon: CreditCard, title: 'Pagamenti Online', color: 'bg-emerald-500', content: ['I proprietari possono pagare online prima della visita', 'Pagamento sicuro tramite Stripe', 'Nessuna commissione VetBuddy sulle transazioni'], tip: 'Il pagamento anticipato riduce i no-show del 60%.' },
    { icon: MessageCircle, title: 'Notifiche WhatsApp', color: 'bg-green-500', content: ['Configura WhatsApp Business nelle Impostazioni', 'I clienti ricevono promemoria automatici su WhatsApp', 'Notifiche per: appuntamenti, documenti, pagamenti', 'Il cliente può attivare/disattivare dal suo profilo'], tip: 'WhatsApp ha un tasso di apertura del 98%!' },
    { icon: Zap, title: 'Automazioni (Piano Premium)', color: 'bg-orange-500', content: ['Promemoria automatici 24h prima dell\'appuntamento', 'Follow-up post visita con istruzioni', 'Notifiche WhatsApp e Email automatiche'], tip: 'Le automazioni fanno risparmiare 2 ore al giorno!' },
    { icon: BarChart3, title: 'Analytics e Report', color: 'bg-violet-500', content: ['Dashboard con KPI principali in tempo reale', 'Numero visite, fatturato, nuovi clienti', 'Report esportabili in CSV'], tip: 'Usa i dati per ottimizzare l\'offerta.' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tutorial Clinica</h2>
          <p className="text-gray-500 text-sm">Guida completa per sfruttare al massimo VetBuddy</p>
        </div>
        <Button onClick={handleDownloadPDF} disabled={downloadingPDF} className="bg-coral-500 hover:bg-coral-600">
          <Download className="h-4 w-4 mr-2" />
          {downloadingPDF ? 'Download...' : 'Scarica PDF'}
        </Button>
      </div>
      
      <div className="bg-gradient-to-r from-coral-500 to-orange-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap className="h-5 w-5" /> Quick Start - Operativi in 15 minuti</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {['1. Registrati come clinica', '2. Configura servizi e orari', '3. Importa i pazienti', '4. Inizia a ricevere prenotazioni'].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/20 rounded-xl p-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-white text-coral-600 flex items-center justify-center font-bold">{i+1}</div>
              <span>{item.substring(3)}</span>
            </div>
          ))}
        </div>
      </div>
      
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
              <div className="bg-coral-50 border-l-4 border-coral-500 p-3 rounded-r-lg">
                <p className="text-xs text-coral-700"><strong>💡</strong> {section.tip}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


// ==================== OWNER PROFILE & NOTIFICATIONS ====================
function OwnerProfile({ user, onRefresh }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsappEnabled: true,
    emailNotificationsEnabled: true,
    reminderDaysBefore: 1
  });
  const [testingWhatsapp, setTestingWhatsapp] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('owner/profile');
      if (response) {
        setProfileData({
          name: response.name || user.name || '',
          email: response.email || user.email || '',
          phone: response.phone || '',
          whatsappEnabled: response.whatsappEnabled !== false,
          emailNotificationsEnabled: response.emailNotificationsEnabled !== false,
          reminderDaysBefore: response.reminderDaysBefore || 1
        });
      }
    } catch (error) {
      // Use user data as fallback
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        whatsappEnabled: true,
        emailNotificationsEnabled: true,
        reminderDaysBefore: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      await api.put('owner/profile', profileData);
      alert('✅ Profilo salvato con successo!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('❌ Errore nel salvare il profilo');
    } finally {
      setSaving(false);
    }
  };

  const testWhatsapp = async () => {
    if (!profileData.phone) {
      alert('⚠️ Inserisci prima il tuo numero di telefono');
      return;
    }
    
    try {
      setTestingWhatsapp(true);
      const response = await api.post('whatsapp/notify', {
        template: 'welcome',
        to: profileData.phone,
        data: { ownerName: profileData.name || 'Utente' }
      });
      
      if (response.success) {
        alert('✅ Messaggio di test inviato! Controlla WhatsApp.\n\n⚠️ Nota: Per ricevere messaggi dalla Sandbox Twilio, devi prima inviare "join older-dug" al numero +1 415 523 8886 su WhatsApp.');
      } else {
        alert('❌ Errore: ' + (response.error || 'Impossibile inviare il messaggio'));
      }
    } catch (error) {
      console.error('Error testing WhatsApp:', error);
      alert('❌ Errore nel test WhatsApp: ' + (error.message || 'Errore sconosciuto'));
    } finally {
      setTestingWhatsapp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profilo e Notifiche</h1>
        <p className="text-gray-500">Gestisci i tuoi dati e le preferenze di notifica</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-coral-500" />
            I tuoi dati
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome completo</Label>
            <Input 
              id="name"
              value={profileData.name} 
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              placeholder="Mario Rossi"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={profileData.email} 
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              placeholder="mario@example.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Numero di telefono (per WhatsApp)</Label>
            <Input 
              id="phone"
              type="tel"
              value={profileData.phone} 
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              placeholder="+39 333 1234567"
            />
            <p className="text-xs text-gray-500 mt-1">Inserisci il numero con prefisso internazionale (+39 per Italia)</p>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Notifiche WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Attiva notifiche WhatsApp</p>
              <p className="text-sm text-gray-500">Ricevi promemoria appuntamenti e aggiornamenti su WhatsApp</p>
            </div>
            <Switch 
              checked={profileData.whatsappEnabled}
              onCheckedChange={(checked) => setProfileData({...profileData, whatsappEnabled: checked})}
            />
          </div>
          
          {profileData.whatsappEnabled && (
            <>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">📱 Come funziona</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Riceverai promemoria prima degli appuntamenti</li>
                  <li>• Notifiche quando documenti sono disponibili</li>
                  <li>• Conferme di pagamento</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">⚠️ Attivazione Sandbox (solo per test)</h4>
                <p className="text-sm text-amber-700 mb-2">
                  Per ricevere messaggi dalla modalità test, devi prima:
                </p>
                <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Apri WhatsApp sul telefono</li>
                  <li>Invia un messaggio al numero <strong>+1 415 523 8886</strong></li>
                  <li>Scrivi: <code className="bg-amber-100 px-1 rounded">join older-dug</code></li>
                </ol>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={testWhatsapp}
                disabled={testingWhatsapp || !profileData.phone}
              >
                {testingWhatsapp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Invio in corso...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Invia messaggio di test
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Notifiche Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Attiva notifiche Email</p>
              <p className="text-sm text-gray-500">Ricevi promemoria e aggiornamenti via email</p>
            </div>
            <Switch 
              checked={profileData.emailNotificationsEnabled}
              onCheckedChange={(checked) => setProfileData({...profileData, emailNotificationsEnabled: checked})}
            />
          </div>
          
          {profileData.emailNotificationsEnabled && (
            <div>
              <Label>Promemoria appuntamenti</Label>
              <Select 
                value={String(profileData.reminderDaysBefore)}
                onValueChange={(value) => setProfileData({...profileData, reminderDaysBefore: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 giorno prima</SelectItem>
                  <SelectItem value="2">2 giorni prima</SelectItem>
                  <SelectItem value="3">3 giorni prima</SelectItem>
                  <SelectItem value="7">1 settimana prima</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        className="w-full bg-coral-500 hover:bg-coral-600"
        onClick={saveProfile}
        disabled={saving}
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Salvataggio...
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            Salva modifiche
          </>
        )}
      </Button>
    </div>
  );
}


// ==================== OWNER DASHBOARD ====================
function OwnerDashboard({ user, onLogout, emailAction, onClearEmailAction }) {
  // Leggi parametro tab dall'URL per navigazione diretta
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['appointments', 'documents', 'invoices', 'messages', 'pets', 'rewards', 'reviews', 'events', 'findClinic', 'inviteClinic', 'tutorial', 'profile'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'appointments';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [pets, setPets] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [rewards, setRewards] = useState([]); // Premi del proprietario
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelAppointmentId, setCancelAppointmentId] = useState(null);
  const [cancelAppointmentDetails, setCancelAppointmentDetails] = useState(null);
  const [showBookingFromEmail, setShowBookingFromEmail] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => { loadData(); }, []);
  
  // Check if user should see add pet dialog (new registration with no pets)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const showAddPet = sessionStorage.getItem('vetbuddy_show_add_pet');
      if (showAddPet === 'true') {
        sessionStorage.removeItem('vetbuddy_show_add_pet');
        setActiveTab('pets');
        // Set a flag to open the add pet dialog once the component mounts
        setTimeout(() => {
          const addPetEvent = new CustomEvent('vetbuddy_open_add_pet');
          window.dispatchEvent(addPetEvent);
        }, 500);
      }
    }
  }, []);
  
  // Handle email action parameters
  useEffect(() => {
    if (emailAction && emailAction.action) {
      switch (emailAction.action) {
        case 'cancel':
          // Show cancellation dialog with appointment details
          if (emailAction.appointmentId) {
            setCancelAppointmentId(emailAction.appointmentId);
            // Find the appointment to show details
            const apt = appointments.find(a => a.id === emailAction.appointmentId);
            if (apt) {
              setCancelAppointmentDetails(apt);
            }
            setShowCancelDialog(true);
          }
          break;
        case 'book':
          // Show booking dialog/tab - with optional pre-selected service
          setActiveTab('appointments');
          setShowBookingFromEmail(true);
          if (emailAction.serviceType) {
            // Store service type to pre-select in booking form
            sessionStorage.setItem('vetbuddy_book_service', emailAction.serviceType);
          }
          break;
        case 'message':
        case 'messages':
          // Go to messages tab - optionally create new message
          setActiveTab('messages');
          if (emailAction.newMessage && emailAction.clinicId) {
            // Trigger new message to specific clinic
            sessionStorage.setItem('vetbuddy_new_message_clinic', emailAction.clinicId);
          }
          break;
        case 'review':
        case 'reviews':
          // Go to reviews tab
          setActiveTab('reviews');
          break;
        case 'profile':
        case 'pets':
          // Go to pets/profile section
          setActiveTab('pets');
          break;
        case 'pay':
          // Go to payment - find the specific appointment and start payment
          setActiveTab('appointments');
          if (emailAction.appointmentId) {
            // Find the appointment
            const aptToPay = appointments.find(a => a.id === emailAction.appointmentId);
            if (aptToPay && aptToPay.paymentStatus !== 'paid') {
              // Avvia il pagamento Stripe automaticamente
              const startPayment = async () => {
                try {
                  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                  const response = await api.post('payments/appointment', {
                    appointmentId: aptToPay.id,
                    originUrl: baseUrl
                  });
                  if (response.url) {
                    window.location.href = response.url;
                  }
                } catch (error) {
                  console.error('Auto payment error:', error);
                  // Fallback: mostra l'appuntamento
                  setSelectedAppointment(aptToPay);
                }
              };
              startPayment();
            } else if (aptToPay) {
              setSelectedAppointment(aptToPay);
            }
          }
          break;
        case 'documents':
          // Go to documents section
          setActiveTab('documents');
          if (emailAction.docId) {
            // Store doc ID to highlight/open specific document
            sessionStorage.setItem('vetbuddy_open_doc', emailAction.docId);
          }
          break;
        case 'payment':
          // Legacy - go to documents (where invoices are)
          setActiveTab('documents');
          break;
        case 'appointments':
          // Go to appointments
          setActiveTab('appointments');
          break;
        case 'rewards':
          // Go to rewards section
          setActiveTab('rewards');
          if (emailAction.rewardId && emailAction.use) {
            // Store reward ID to show usage dialog
            sessionStorage.setItem('vetbuddy_use_reward', emailAction.rewardId);
          }
          break;
        default:
          break;
      }
      // Clear the action after handling
      if (onClearEmailAction) onClearEmailAction();
    }
  }, [emailAction, onClearEmailAction, appointments]);
  
  const loadData = async () => { try { const [appts, docs, msgs, petsList, clinicsList, rewardsList] = await Promise.all([api.get('appointments'), api.get('documents'), api.get('messages'), api.get('pets'), api.get('clinics/search?city=Milano&maxDistance=100'), api.get('rewards/my-rewards').catch(() => [])]); setAppointments(appts); setDocuments(docs); setMessages(msgs); setPets(petsList); setClinics(clinicsList || []); setRewards(rewardsList || []); } catch (error) { console.error('Error:', error); } };
  
  // Cancel appointment handler
  const handleCancelAppointment = async () => {
    if (!cancelAppointmentId) return;
    try {
      await api.put(`appointments/${cancelAppointmentId}`, { status: 'cancelled', cancellationReason });
      alert('✅ Appuntamento cancellato con successo');
      setShowCancelDialog(false);
      setCancelAppointmentId(null);
      setCancelAppointmentDetails(null);
      setCancellationReason('');
      loadData(); // Refresh data
    } catch (error) {
      alert('❌ Errore nella cancellazione: ' + error.message);
    }
  };

  const NavItem = ({ icon: Icon, label, value, badge }) => <button onClick={() => { setActiveTab(value); setSelectedPetId(null); setMobileMenuOpen(false); }} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${activeTab === value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><div className="flex items-center gap-3"><Icon className="h-5 w-5" />{label}</div>{badge > 0 && <Badge className="bg-blue-500 text-white text-xs">{badge}</Badge>}</button>;

  const handleOpenPetProfile = (petId) => {
    setSelectedPetId(petId);
    setActiveTab('petProfile');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <NewBrandLogo size="xs" showText={false} />
          <div>
            <h1 className="font-bold text-sm"><span className="text-gray-900">vet</span><span className="text-coral-500">buddy</span></h1>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-500 hover:text-red-600">
            <LogOut className="h-4 w-4" />
          </Button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Dark backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-[55]" 
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className="md:hidden fixed left-0 right-0 top-[57px] bottom-0 bg-white z-[60] p-4 overflow-y-auto shadow-xl animate-in slide-in-from-top duration-200">
            <div className="mb-4"><RoleBadge role="owner" /></div>
            <Badge variant="outline" className="mb-6 justify-center text-amber-600 border-amber-300 bg-amber-50 w-full"><AlertCircle className="h-3 w-3 mr-1" /> Modalità Pilot</Badge>
            <nav className="space-y-1">
              <NavItem icon={Calendar} label="Appuntamenti" value="appointments" />
              <NavItem icon={FileText} label="Documenti" value="documents" badge={documents.filter(d => d.type !== 'invoice' && d.category !== 'fattura').length || null} />
              <NavItem icon={Receipt} label="Le mie Fatture" value="invoices" badge={documents.filter(d => d.type === 'invoice' || d.category === 'fattura').length || null} />
              <NavItem icon={MessageCircle} label="Messaggi" value="messages" />
              <NavItem icon={PawPrint} label="I miei animali" value="pets" />
              <NavItem icon={Gift} label="I miei premi" value="rewards" badge={rewards.filter(r => r.status === 'available').length} />
              <NavItem icon={Star} label="Le mie recensioni" value="reviews" />
              <NavItem icon={CalendarDays} label="Eventi & News" value="events" />
              <div className="border-t my-3"></div>
              <NavItem icon={Search} label="Trova clinica" value="findClinic" />
              <NavItem icon={Mail} label="Invita la tua clinica" value="inviteClinic" />
              <NavItem icon={BookOpen} label="Tutorial" value="tutorial" />
              <NavItem icon={Settings} label="Profilo e Notifiche" value="profile" />
            </nav>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r p-4 flex-col flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <NewBrandLogo size="sm" showText={false} />
            <div>
              <h1 className="font-bold"><span className="text-gray-900">vet</span><span className="text-coral-500">buddy</span></h1>
              <p className="text-xs text-gray-500 truncate max-w-[100px]">{user.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-500 hover:text-red-600 hover:bg-red-50" title="Esci">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="mb-2"><RoleBadge role="owner" /></div>
        <Badge variant="outline" className="mb-6 justify-center text-amber-600 border-amber-300 bg-amber-50"><AlertCircle className="h-3 w-3 mr-1" /> Modalità Pilot</Badge>
        <nav className="space-y-1 flex-1 overflow-y-auto">
          <NavItem icon={Calendar} label="Appuntamenti" value="appointments" />
          <NavItem icon={FileText} label="Documenti" value="documents" badge={documents.filter(d => d.type !== 'invoice' && d.category !== 'fattura').length || null} />
          <NavItem icon={Receipt} label="Le mie Fatture" value="invoices" badge={documents.filter(d => d.type === 'invoice' || d.category === 'fattura').length || null} />
          <NavItem icon={MessageCircle} label="Messaggi" value="messages" />
          <NavItem icon={PawPrint} label="I miei animali" value="pets" />
          <NavItem icon={Gift} label="I miei premi" value="rewards" badge={rewards.filter(r => r.status === 'available').length} />
          <NavItem icon={Star} label="Le mie recensioni" value="reviews" />
          <NavItem icon={CalendarDays} label="Eventi & News" value="events" />
          <div className="border-t my-3"></div>
          <NavItem icon={Search} label="Trova clinica" value="findClinic" />
          <NavItem icon={Mail} label="Invita la tua clinica" value="inviteClinic" />
          <NavItem icon={BookOpen} label="Tutorial" value="tutorial" />
          <NavItem icon={Settings} label="Profilo e Notifiche" value="profile" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Banner Pilot Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-amber-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Benvenuto nel Pilot Milano! 🏙️</h3>
              <p className="text-sm text-gray-600">
                Stai esplorando VetBuddy in modalità demo. Le cliniche del pilot verranno attivate a breve a Milano. 
                Nel frattempo, <button onClick={() => setActiveTab('inviteClinic')} className="text-coral-600 font-medium underline">invita la tua clinica</button> per accelerare l'attivazione!
              </p>
            </div>
          </div>
        </div>

        {activeTab === 'appointments' && <OwnerAppointments appointments={appointments} pets={pets} />}
        {activeTab === 'documents' && <OwnerDocuments documents={documents.filter(d => d.type !== 'invoice' && d.category !== 'fattura')} pets={pets} onRefresh={loadData} user={user} />}
        {activeTab === 'invoices' && <OwnerInvoices invoices={documents.filter(d => d.type === 'invoice' || d.category === 'fattura')} pets={pets} onRefresh={loadData} />}
        {activeTab === 'messages' && <OwnerMessages messages={messages} clinics={clinics} pets={pets} onRefresh={loadData} />}
        {activeTab === 'pets' && <OwnerPets pets={pets} onRefresh={loadData} onOpenProfile={handleOpenPetProfile} />}
        {activeTab === 'rewards' && <OwnerRewardsSection user={user} />}
        {activeTab === 'reviews' && <OwnerReviews user={user} />}
        {activeTab === 'events' && <OwnerEvents user={user} onNavigate={setActiveTab} />}
        {activeTab === 'petProfile' && selectedPetId && <PetProfile petId={selectedPetId} onBack={() => setActiveTab('pets')} onNavigate={setActiveTab} appointments={appointments} documents={documents} />}
        {activeTab === 'findClinic' && <FindClinic user={user} />}
        {activeTab === 'inviteClinic' && <InviteClinic user={user} />}
        {activeTab === 'tutorial' && <OwnerTutorialInline />}
        {activeTab === 'profile' && <OwnerProfile user={user} onRefresh={loadData} />}
      </main>
      
      {/* Dialog Cancellazione Appuntamento - Migliorata con dettagli */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Cancella Appuntamento
            </DialogTitle>
            <DialogDescription>
              Stai per cancellare il seguente appuntamento:
            </DialogDescription>
          </DialogHeader>
          
          {/* Appointment Details */}
          {cancelAppointmentDetails && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 my-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{cancelAppointmentDetails.date}</span>
                  <span className="text-gray-500">alle</span>
                  <span className="font-medium">{cancelAppointmentDetails.time}</span>
                </div>
                {cancelAppointmentDetails.petName && (
                  <div className="flex items-center gap-2">
                    <PawPrint className="h-4 w-4 text-coral-500" />
                    <span>Paziente: <strong>{cancelAppointmentDetails.petName}</strong></span>
                  </div>
                )}
                {cancelAppointmentDetails.reason && (
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-blue-500" />
                    <span>Motivo: {cancelAppointmentDetails.reason}</span>
                  </div>
                )}
                {cancelAppointmentDetails.clinicName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span>Clinica: {cancelAppointmentDetails.clinicName}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Cancellation Policy */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Politica di Cancellazione
            </p>
            <p className="text-amber-700 text-sm">
              {cancelAppointmentDetails?.cancellationPolicy || 
               'Ti preghiamo di avvisarci almeno 24 ore prima in caso di disdetta. La mancata comunicazione potrebbe comportare un addebito secondo la politica della clinica.'}
            </p>
          </div>
          
          {/* Reason input */}
          <div className="mt-2">
            <Label htmlFor="cancel-reason" className="text-sm text-gray-600">Motivo della cancellazione (opzionale)</Label>
            <Textarea 
              id="cancel-reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Es: Impegno improvviso, altro appuntamento..."
              rows={2}
              className="mt-1"
            />
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => { setShowCancelDialog(false); setCancellationReason(''); }}>
              Mantieni Appuntamento
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Conferma Cancellazione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== OWNER REWARDS SECTION ====================
function OwnerRewardsSection({ user }) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const data = await api.get('rewards/my-rewards');
      setRewards(data || []);
    } catch (error) {
      console.error('Error loading rewards:', error);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId) => {
    if (!confirm('Vuoi riscattare questo premio? La clinica riceverà una notifica e potrai usarlo alla prossima visita.')) return;
    
    setRedeeming(rewardId);
    try {
      await api.post('rewards/redeem', { rewardId });
      alert('🎉 Premio riscattato! La clinica è stata notificata. Mostra il codice alla tua prossima visita.');
      loadRewards(); // Reload to update status
    } catch (error) {
      alert('Errore: ' + (error.message || 'Impossibile riscattare il premio'));
    } finally {
      setRedeeming(null);
    }
  };

  const getRewardIcon = (iconName) => {
    const icons = {
      Gift: <Gift className="h-8 w-8" />,
      Euro: <Euro className="h-8 w-8" />,
      Scissors: <Scissors className="h-8 w-8" />,
      Heart: <Heart className="h-8 w-8" />,
      Star: <Star className="h-8 w-8" />,
      Sparkles: <Sparkles className="h-8 w-8" />
    };
    return icons[iconName] || <Gift className="h-8 w-8" />;
  };

  const getRewardValue = (reward) => {
    switch (reward.rewardType) {
      case 'discount_percent': return `-${reward.rewardValue}%`;
      case 'discount_fixed': return `-€${reward.rewardValue}`;
      case 'free_service': return 'Servizio Gratis';
      case 'free_product': return 'Prodotto Gratis';
      case 'gift': return 'Regalo';
      default: return 'Premio';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-700">Disponibile</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700">In attesa conferma</Badge>;
      case 'used':
        return <Badge className="bg-gray-100 text-gray-600">Utilizzato</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-700">Scaduto</Badge>;
      default:
        return null;
    }
  };

  const availableRewards = rewards.filter(r => r.status === 'available');
  const pendingRewards = rewards.filter(r => r.status === 'pending');
  const usedRewards = rewards.filter(r => r.status === 'used' || r.status === 'expired');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-coral-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="h-7 w-7 text-amber-500" />
            I Miei Premi
          </h1>
          <p className="text-gray-500 mt-1">Premi fedeltà dalle tue cliniche</p>
        </div>
        <div className="flex gap-2">
          {availableRewards.length > 0 && (
            <Badge className="bg-green-100 text-green-700 text-lg px-4 py-2">
              {availableRewards.length} disponibili
            </Badge>
          )}
          {pendingRewards.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 text-lg px-4 py-2">
              {pendingRewards.length} in attesa
            </Badge>
          )}
        </div>
      </div>

      {/* Pending Rewards (Already redeemed, waiting for clinic confirmation) */}
      {pendingRewards.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-amber-700 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Premi Riscattati - In Attesa Conferma
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingRewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg animate-pulse">
                      {getRewardIcon(reward.rewardIcon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{reward.rewardName}</h3>
                      <p className="text-2xl font-bold text-green-600 my-1">{getRewardValue(reward)}</p>
                      {getStatusBadge(reward.status)}
                    </div>
                  </div>
                  
                  {/* Codice Premio */}
                  {reward.redeemCode && (
                    <div className="mt-4 p-3 bg-gray-900 rounded-lg text-center">
                      <p className="text-amber-400 text-xs uppercase tracking-wider mb-1">Codice Premio</p>
                      <p className="text-white font-mono text-2xl font-bold tracking-widest">{reward.redeemCode}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <p className="text-sm text-amber-700 text-center">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Mostra questo codice in clinica per completare il riscatto
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Rewards */}
      {availableRewards.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Premi Disponibili
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableRewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-lg">
                      {getRewardIcon(reward.rewardIcon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{reward.rewardName}</h3>
                      <p className="text-2xl font-bold text-green-600 my-1">{getRewardValue(reward)}</p>
                      {reward.rewardDescription && (
                        <p className="text-sm text-gray-600">{reward.rewardDescription}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Codice Premio */}
                  {reward.redeemCode && (
                    <div className="mt-4 p-3 bg-gray-900 rounded-lg text-center">
                      <p className="text-amber-400 text-xs uppercase tracking-wider mb-1">Il tuo codice</p>
                      <p className="text-white font-mono text-2xl font-bold tracking-widest">{reward.redeemCode}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Da: <strong>{reward.clinicName}</strong></span>
                      {reward.expiresAt && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Scade: {new Date(reward.expiresAt).toLocaleDateString('it-IT')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Motivo: {reward.reason}</p>
                  </div>

                  {/* Redeem Button */}
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold"
                    onClick={() => handleRedeemReward(reward.id)}
                    disabled={redeeming === reward.id}
                  >
                    {redeeming === reward.id ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Riscattando...</>
                    ) : (
                      <><Gift className="h-4 w-4 mr-2" /> Riscatta Online</>
                    )}
                  </Button>

                  {/* Contact clinic */}
                  <div className="mt-3 flex gap-2">
                    {reward.clinicWhatsapp && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
                        onClick={() => window.open(`https://wa.me/${reward.clinicWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Ciao! Vorrei utilizzare il mio premio "${reward.rewardName}" - Codice: ${reward.redeemCode}`)}`, '_blank')}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                    {reward.clinicEmail && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                        onClick={() => window.location.href = `mailto:${reward.clinicEmail}?subject=${encodeURIComponent(`Riscatto Premio: ${reward.rewardName}`)}&body=${encodeURIComponent(`Buongiorno,\n\nVorrei riscattare il mio premio "${reward.rewardName}".\n\nCodice premio: ${reward.redeemCode}\n\nGrazie!`)}`}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Messaggio
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : pendingRewards.length === 0 && (
        <Card className="text-center py-12 bg-gray-50">
          <CardContent>
            <div className="h-20 w-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Gift className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nessun premio disponibile</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Non hai ancora ricevuto premi dalle tue cliniche. Continua a prenderti cura dei tuoi animali e potresti ricevere premi fedeltà!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Used Rewards History */}
      {usedRewards.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-gray-500 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Premi Utilizzati
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {usedRewards.map((reward) => (
              <Card key={reward.id} className="opacity-60 bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 line-through">{reward.rewardName}</h3>
                      <p className="text-sm text-gray-500">
                        Usato il {new Date(reward.usedAt).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== OWNER REVIEWS ====================
function OwnerReviews({ user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await api.get('reviews/my-reviews');
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="mt-2 text-gray-500">Caricamento recensioni...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Le mie recensioni</h2>
          <p className="text-gray-500">Recensioni che hai lasciato alle cliniche</p>
        </div>
        <Button variant="outline" onClick={loadReviews}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Aggiorna
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Star className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna recensione</h3>
            <p className="text-gray-500 mb-4">Non hai ancora lasciato recensioni alle cliniche.</p>
            <p className="text-sm text-gray-400">Dopo una visita, potrai lasciare una recensione dalla sezione "Trova clinica".</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-coral-100 to-coral-200 rounded-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-coral-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.clinicName || 'Clinica'}</h4>
                      <p className="text-sm text-gray-500">{review.clinicAddress || ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderStars(review.overallRating || review.rating)}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                {review.comment && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-3">
                    <p className="text-gray-700 italic">"{review.comment}"</p>
                  </div>
                )}
                
                {/* Dettagli aggiuntivi recensione */}
                {(review.punctuality || review.competence || review.price) && (
                  <div className="mt-3 grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                    {review.punctuality && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Puntualità</p>
                        {renderStars(review.punctuality)}
                      </div>
                    )}
                    {review.competence && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Competenza</p>
                        {renderStars(review.competence)}
                      </div>
                    )}
                    {review.price && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Prezzo</p>
                        {renderStars(review.price)}
                      </div>
                    )}
                  </div>
                )}
                
                {review.petName && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <PawPrint className="h-4 w-4" />
                    <span>Visita per: {review.petName}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente Eventi & News per Proprietari
function OwnerEvents({ user, onNavigate }) {
  // VERSIONE 2.0 - Fix bottoni cliccabili - 2026-02-14 01:10
  const [events, setEvents] = useState([]);
  const [userPets, setUserPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState(null);
  const [showPersonalized, setShowPersonalized] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Mappa specie animali a categorie eventi
  const speciestoCategory = {
    'dog': 'cani',
    'cat': 'gatti',
    'horse': 'cavalli',
    'rabbit': 'conigli',
    'bird': 'uccelli',
    'reptile': 'rettili',
    'fish': 'pesci',
    'hamster': 'roditori',
    'ferret': 'furetti',
    'other': 'altro'
  };

  // Carica animali dell'utente
  const loadUserPets = async () => {
    try {
      const res = await fetch('/api/pets', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('vetbuddy_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserPets(data.pets || []);
      }
    } catch (err) {
      console.error('Error loading pets:', err);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      } else {
        setError('Impossibile caricare gli eventi');
      }
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadUserPets();
  }, []);

  // Ottieni categorie basate sugli animali dell'utente
  const getUserPetCategories = () => {
    const categories = new Set();
    userPets.forEach(pet => {
      const category = speciestoCategory[pet.species] || 'altro';
      categories.add(category);
    });
    return Array.from(categories);
  };

  // Eventi personalizzati per l'utente basati sui suoi animali
  const getPersonalizedEvents = () => {
    const petCategories = getUserPetCategories();
    if (petCategories.length === 0) return [];
    
    return events.filter(event => 
      petCategories.includes(event.category) || 
      event.category === 'generale' || 
      event.category === 'veterinaria' ||
      event.category === 'promo'
    ).sort((a, b) => {
      // Prioritizza eventi delle categorie degli animali dell'utente
      const aInPetCat = petCategories.includes(a.category);
      const bInPetCat = petCategories.includes(b.category);
      if (aInPetCat && !bInPetCat) return -1;
      if (!aInPetCat && bInPetCat) return 1;
      // Poi per data
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'veterinaria': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🏥' };
      case 'cani': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: '🐕' };
      case 'gatti': return { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🐱' };
      case 'cavalli': return { bg: 'bg-brown-100', text: 'text-yellow-800', icon: '🐴' };
      case 'conigli': return { bg: 'bg-pink-100', text: 'text-pink-700', icon: '🐰' };
      case 'uccelli': return { bg: 'bg-sky-100', text: 'text-sky-700', icon: '🐦' };
      case 'rettili': return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '🦎' };
      case 'pesci': return { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: '🐠' };
      case 'roditori': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🐹' };
      case 'furetti': return { bg: 'bg-rose-100', text: 'text-rose-700', icon: '🦡' };
      case 'altro': return { bg: 'bg-slate-100', text: 'text-slate-700', icon: '🐾' };
      case 'generale': return { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '🐾' };
      case 'promo': return { bg: 'bg-green-100', text: 'text-green-700', icon: '🎁' };
      case 'eventi': return { bg: 'bg-coral-100', text: 'text-coral-700', icon: '🎉' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '📰' };
    }
  };

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'veterinaria': return 'Salute & Benessere';
      case 'cani': return 'Per Cani';
      case 'gatti': return 'Per Gatti';
      case 'cavalli': return 'Per Cavalli';
      case 'conigli': return 'Per Conigli';
      case 'uccelli': return 'Per Uccelli';
      case 'rettili': return 'Per Rettili';
      case 'pesci': return 'Per Pesci';
      case 'roditori': return 'Per Roditori';
      case 'furetti': return 'Per Furetti';
      case 'altro': return 'Altri Animali';
      case 'generale': return 'Tutti gli Animali';
      case 'promo': return 'Promozioni';
      case 'eventi': return 'Eventi Locali';
      default: return 'News';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Autocomplete suggestions based on event titles and descriptions
  const getSearchSuggestions = () => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    const suggestions = new Set();
    
    events.forEach(event => {
      // Suggest matching titles
      if (event.title && event.title.toLowerCase().includes(query)) {
        suggestions.add(event.title);
      }
      // Suggest matching locations
      if (event.location && event.location.toLowerCase().includes(query)) {
        suggestions.add(event.location);
      }
      // Suggest matching organizers
      if (event.organizer && event.organizer.toLowerCase().includes(query)) {
        suggestions.add(event.organizer);
      }
    });
    
    // Also add category suggestions
    const categoryNames = ['Salute', 'Cani', 'Gatti', 'Cavalli', 'Conigli', 'Uccelli', 'Rettili', 'Pesci', 'Roditori', 'Promo', 'Eventi'];
    categoryNames.forEach(cat => {
      if (cat.toLowerCase().includes(query)) {
        suggestions.add(cat);
      }
    });
    
    return Array.from(suggestions).slice(0, 6);
  };

  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchSuggestions = getSearchSuggestions();

  const filteredEvents = (activeCategory === 'all' 
    ? events 
    : events.filter(e => e.category === activeCategory)
  ).filter(e => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (e.title && e.title.toLowerCase().includes(query)) ||
      (e.description && e.description.toLowerCase().includes(query)) ||
      (e.category && e.category.toLowerCase().includes(query))
    );
  });

  const personalizedEvents = getPersonalizedEvents();
  const petCategories = getUserPetCategories();

  const categories = [
    { id: 'all', label: 'Tutti', icon: CalendarDays },
    { id: 'veterinaria', label: 'Salute', icon: Stethoscope },
    { id: 'cani', label: 'Cani', icon: PawPrint },
    { id: 'gatti', label: 'Gatti', icon: PawPrint },
    { id: 'cavalli', label: 'Cavalli', icon: Heart },
    { id: 'conigli', label: 'Conigli', icon: Heart },
    { id: 'uccelli', label: 'Uccelli', icon: Sparkles },
    { id: 'rettili', label: 'Rettili', icon: Zap },
    { id: 'pesci', label: 'Pesci', icon: Droplet },
    { id: 'roditori', label: 'Roditori', icon: Star },
    { id: 'altro', label: 'Altro', icon: PlusCircle },
    { id: 'promo', label: 'Promo', icon: Gift },
    { id: 'eventi', label: 'Eventi', icon: MapPin },
  ];

  // Helper per ottenere emoji animale
  const getPetEmoji = (species) => {
    const emojiMap = {
      'dog': '🐕', 'cat': '🐱', 'horse': '🐴', 'rabbit': '🐰',
      'bird': '🦜', 'reptile': '🦎', 'fish': '🐠', 'hamster': '🐹',
      'ferret': '🦡', 'other': '🐾'
    };
    return emojiMap[species] || '🐾';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="h-7 w-7 text-coral-500" />
              Eventi & News
            </h1>
            <p className="text-gray-500 mt-1">Scopri eventi, notizie e promozioni per te e il tuo animale</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Aggiornamento auto
            </Badge>
            <Button variant="ghost" size="sm" onClick={loadEvents} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        {/* Search Bar with Autocomplete */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            placeholder="Cerca eventi, promozioni, notizie..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10"
          />
          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              {searchSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="w-full px-4 py-2 text-left hover:bg-coral-50 flex items-center gap-2 text-sm border-b border-gray-100 last:border-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchQuery(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  <Search className="h-3 w-3 text-gray-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sezione Eventi Personalizzati per i tuoi animali */}
      {userPets.length > 0 && personalizedEvents.length > 0 && (
        <div className="mb-8">
          <div 
            className="bg-gradient-to-r from-coral-500 via-orange-500 to-amber-500 rounded-2xl p-5 mb-4 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setShowPersonalized(!showPersonalized)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">📌 Eventi per te e i tuoi animali</h2>
                  <p className="text-white/80 text-sm">
                    {personalizedEvents.length} eventi consigliati per {' '}
                    {userPets.map(p => getPetEmoji(p.species)).join(' ')}
                  </p>
                </div>
              </div>
              <ChevronRight className={`h-6 w-6 text-white transition-transform ${showPersonalized ? 'rotate-90' : ''}`} />
            </div>
            
            {/* Mini cards degli animali dell'utente */}
            <div className="flex flex-wrap gap-2 mt-4">
              {userPets.slice(0, 5).map(pet => (
                <div key={pet.id} className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                  <span>{getPetEmoji(pet.species)}</span>
                  <span className="text-white text-sm font-medium">{pet.name}</span>
                </div>
              ))}
              {userPets.length > 5 && (
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <span className="text-white text-sm">+{userPets.length - 5} altri</span>
                </div>
              )}
            </div>
          </div>

          {/* Eventi personalizzati espansi */}
          {showPersonalized && (
            <div className="grid gap-4 md:grid-cols-2 mb-6 animate-in slide-in-from-top duration-300">
              {personalizedEvents.slice(0, 4).map(event => {
                const catStyle = getCategoryColor(event.category);
                const isForUserPet = petCategories.includes(event.category);
                return (
                  <Card key={event.id} className={`overflow-hidden hover:shadow-lg transition-all duration-200 group ${isForUserPet ? 'ring-2 ring-coral-300 ring-offset-2' : ''}`}>
                    <CardContent className="p-0">
                      <div className={`${catStyle.bg} p-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{catStyle.icon}</span>
                          <Badge className={`${catStyle.bg} ${catStyle.text} border-0 text-xs`}>
                            {getCategoryLabel(event.category)}
                          </Badge>
                        </div>
                        {isForUserPet && (
                          <Badge className="bg-coral-500 text-white text-xs">
                            <Heart className="h-3 w-3 mr-1" /> Per te
                          </Badge>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-coral-600 transition-colors">
                          {event.title}
                        </h3>
                        {event.eventDate && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(event.eventDate)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Info se l'utente non ha animali */}
      {userPets.length === 0 && !loading && (
        <button 
          onClick={() => onNavigate && onNavigate('pets')}
          className="w-full mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all cursor-pointer text-left"
        >
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <PawPrint className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-800">Aggiungi i tuoi animali!</p>
              <p className="text-sm text-blue-600 mt-1">
                Registra i tuoi animali per ricevere eventi e consigli personalizzati per cani, gatti, cavalli, conigli e molto altro.
              </p>
              <p className="text-sm text-blue-700 mt-2 font-medium flex items-center gap-1">
                Clicca qui per aggiungere un animale →
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-coral-500 text-white shadow-md'
                : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-coral-500 mb-4" />
          <p className="text-gray-500">Caricamento eventi...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="p-6 text-center border-red-200 bg-red-50">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-3" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadEvents} variant="outline" className="border-red-300 text-red-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Riprova
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredEvents.length === 0 && (
        <Card className="p-12 text-center">
          <CalendarDays className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun evento disponibile</h3>
          <p className="text-gray-500">Non ci sono eventi in questa categoria al momento. Torna presto!</p>
        </Card>
      )}

      {/* Events Grid */}
      {!loading && !error && filteredEvents.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredEvents.map(event => {
            const catStyle = getCategoryColor(event.category);
            const eventLink = event.link || '#';
            const detailText = `📅 ${event.title}\n\n${event.description || 'Nessuna descrizione disponibile.'}\n\n📍 Luogo: ${event.location || 'Non specificato'}\n📆 Data: ${event.eventDate ? new Date(event.eventDate).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Non specificata'}`;
            
            return (
              <div 
                key={event.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-200 group bg-white rounded-lg border border-gray-200"
              >
                {/* Event Image/Icon Header */}
                <div className={`${catStyle.bg} p-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{catStyle.icon}</span>
                    <Badge className={`${catStyle.bg} ${catStyle.text} border-0`}>
                      {getCategoryLabel(event.category)}
                    </Badge>
                  </div>
                  {event.isFeatured && (
                    <Badge className="bg-amber-500 text-white">
                      <Star className="h-3 w-3 mr-1" /> In evidenza
                    </Badge>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-coral-600 transition-colors">
                    {event.title}
                  </h3>
                  
                  {event.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                    {event.eventDate && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(event.eventDate)}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </span>
                    )}
                  </div>
                  
                  {/* Source and Action Button */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      {event.source === 'vetbuddy' ? (
                        <>
                          <PawPrint className="h-3 w-3 text-coral-400" />
                          VetBuddy
                        </>
                      ) : event.source === 'rss' ? (
                        <>
                          <Globe className="h-3 w-3" />
                          {event.sourceLabel || 'News Esterna'}
                        </>
                      ) : (
                        <>
                          <Building2 className="h-3 w-3" />
                          {event.organizer || 'Organizzatore'}
                        </>
                      )}
                    </span>
                    
                    <a 
                      href={`/eventi/${event.id}`}
                      className="bg-coral-500 hover:bg-coral-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors no-underline"
                    >
                      Vedi dettagli
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      {!loading && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Ricevi aggiornamenti</p>
              <p className="text-sm text-blue-600 mt-1">
                Presto potrai attivare le notifiche per ricevere aggiornamenti su eventi e promozioni nella tua zona!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Invita la tua Clinica
function InviteClinic({ user }) {
  const [email, setEmail] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !clinicName) {
      alert('Inserisci email e nome della clinica');
      return;
    }
    setSending(true);
    setError('');
    
    try {
      const response = await api.post('invite-clinic', {
        clinicName,
        clinicEmail: email,
        message,
        inviterName: user?.name || 'Un proprietario',
        inviterEmail: user?.email || ''
      });
      
      if (response.success) {
        setSent(true);
      } else {
        setError(response.message || 'Errore durante l\'invio');
      }
    } catch (err) {
      setError(err.message || 'Errore durante l\'invio dell\'invito');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-12 text-center">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invito inviato! 🎉</h2>
            <p className="text-gray-600 mb-6">
              Abbiamo inviato un invito a <strong>{clinicName}</strong>.
              <br/>Ti avviseremo quando si registreranno su VetBuddy!
            </p>
            <Button onClick={() => { setSent(false); setEmail(''); setClinicName(''); setMessage(''); }}>
              Invita un'altra clinica
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-4">
          <MapPin className="h-4 w-4" />
          <span className="font-medium">Pilot Milano</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Invita la tua clinica di fiducia</h2>
        <p className="text-gray-600">
          Non trovi il tuo veterinario su VetBuddy? Invitalo a unirsi al pilot!
          <br/>È completamente gratuito per le cliniche durante la fase beta.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome della clinica *</Label>
              <Input 
                value={clinicName} 
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Es: Clinica Veterinaria Milano"
                required
              />
            </div>
            <div>
              <Label>Email della clinica *</Label>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@clinica.it"
                required
              />
            </div>
            <div>
              <Label>Messaggio personale (opzionale)</Label>
              <Textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ciao! Sono un tuo cliente e vorrei prenotare le visite online..."
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={sending}>
              {sending ? <><Clock className="h-4 w-4 mr-2 animate-spin" />Invio in corso...</> : <><Mail className="h-4 w-4 mr-2" />Invia invito</>}
            </Button>
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 p-6 bg-blue-50 rounded-xl">
        <h3 className="font-semibold text-blue-800 mb-3">Perché invitare la tua clinica?</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-blue-500" />Prenota visite online 24/7 senza telefonare</li>
          <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-blue-500" />Ricevi promemoria automatici per vaccini e appuntamenti</li>
          <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-blue-500" />Accedi alla cartella clinica del tuo animale</li>
          <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-blue-500" />Ricevi documenti e referti direttamente nell'app</li>
        </ul>
      </div>
    </div>
  );
}

// Categorie servizi predefinite
const SERVICE_CATEGORIES = [
  { id: 'visita_generale', name: 'Visita generale', icon: '🩺', keywords: ['visita', 'controllo', 'check-up', 'generale'] },
  { id: 'vaccinazioni', name: 'Vaccinazioni', icon: '💉', keywords: ['vaccino', 'vaccinazione', 'richiamo', 'antirabbia', 'trivalente'] },
  { id: 'esami_diagnostica', name: 'Esami e diagnostica', icon: '🔬', keywords: ['esame', 'analisi', 'sangue', 'ecografia', 'radiografia', 'diagnostica'] },
  { id: 'chirurgia', name: 'Chirurgia', icon: '🏥', keywords: ['chirurgia', 'operazione', 'sterilizzazione', 'castrazione', 'intervento'] },
  { id: 'odontoiatria', name: 'Odontoiatria', icon: '🦷', keywords: ['denti', 'dentale', 'pulizia denti', 'odontoiatria', 'estrazione'] },
  { id: 'toelettatura', name: 'Toelettatura', icon: '✂️', keywords: ['toelettatura', 'bagno', 'tosatura', 'grooming', 'pelo'] },
  { id: 'dermatologia', name: 'Dermatologia', icon: '🐾', keywords: ['pelle', 'dermatologia', 'allergia', 'prurito', 'cute'] },
  { id: 'farmacia', name: 'Farmacia veterinaria', icon: '💊', keywords: ['farmaco', 'medicina', 'farmacia', 'ricetta'] },
  { id: 'emergenza', name: 'Pronto soccorso', icon: '🚨', keywords: ['emergenza', 'urgenza', 'pronto soccorso', 'h24'] },
  { id: 'certificati', name: 'Certificati e documenti', icon: '📋', keywords: ['certificato', 'passaporto', 'documento', 'microchip'] },
  { id: 'video_consulto', name: 'Video-consulto', icon: '📹', keywords: ['video', 'online', 'teleconsulto', 'remoto'] },
  { id: 'altro', name: 'Altro', icon: '📌', keywords: ['altro', 'vari'] },
];

function OwnerAppointments({ appointments, pets }) {
  const [showBooking, setShowBooking] = useState(false);
  const [formData, setFormData] = useState({ petId: '', serviceId: '', date: '', time: '', notes: '', clinicId: '' });
  const [clinics, setClinics] = useState([]);
  const [clinicServices, setClinicServices] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [videoConsultoConfirmed, setVideoConsultoConfirmed] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Nuovi stati per la ricerca per servizio
  const [searchMode, setSearchMode] = useState('clinic'); // 'clinic' o 'service'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const [filteredClinics, setFilteredClinics] = useState([]);
  
  // Stato per visualizzare dettagli appuntamento
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Stato per il pagamento
  const [paymentLoading, setPaymentLoading] = useState(null);
  
  // Effetto per leggere il servizio pre-selezionato dalle email
  useEffect(() => {
    if (showBooking) {
      const savedService = sessionStorage.getItem('vetbuddy_book_service');
      if (savedService) {
        // Trova la categoria corrispondente al servizio
        const category = SERVICE_CATEGORIES.find(c => 
          c.keywords.some(k => savedService.toLowerCase().includes(k.toLowerCase())) ||
          c.id === savedService
        );
        if (category) {
          setSearchMode('service');
          setSelectedCategory(category.id);
        }
        sessionStorage.removeItem('vetbuddy_book_service');
      }
    }
  }, [showBooking]);
  
  // Funzione per iniziare il pagamento
  const handlePayment = async (appointment) => {
    setPaymentLoading(appointment.id);
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await api.post('payments/appointment', {
        appointmentId: appointment.id,
        originUrl: baseUrl
      });
      
      if (response.url) {
        // Redirect a Stripe Checkout
        window.location.href = response.url;
      } else {
        alert('❌ Errore: URL di pagamento non disponibile');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Errore durante l\'avvio del pagamento: ' + (error.message || 'Riprova più tardi'));
    } finally {
      setPaymentLoading(null);
    }
  };
  
  // Carica le cliniche disponibili quando si apre il dialog
  useEffect(() => {
    if (showBooking && clinics.length === 0) {
      loadClinics();
    }
  }, [showBooking]);
  
  // Carica i servizi quando si seleziona una clinica
  useEffect(() => {
    if (formData.clinicId) {
      loadClinicServices(formData.clinicId);
    } else {
      setClinicServices([]);
    }
  }, [formData.clinicId]);
  
  // Filtra cliniche quando si seleziona una categoria servizio
  useEffect(() => {
    if (selectedCategory && clinics.length > 0) {
      const category = SERVICE_CATEGORIES.find(c => c.id === selectedCategory);
      if (category) {
        const filtered = clinics.filter(clinic => {
          // Controlla se la clinica offre servizi in questa categoria
          if (!clinic.services || clinic.services.length === 0) {
            // Se non ha servizi configurati, mostra comunque per servizi base
            return ['visita_generale', 'video_consulto'].includes(selectedCategory);
          }
          // Cerca match nei servizi della clinica
          return clinic.services.some(service => {
            const serviceName = (service.name || service.id || '').toLowerCase();
            return category.keywords.some(keyword => serviceName.includes(keyword.toLowerCase()));
          });
        });
        setFilteredClinics(filtered);
      }
    } else {
      setFilteredClinics([]);
    }
  }, [selectedCategory, clinics]);
  
  const loadClinics = async () => {
    setLoadingClinics(true);
    try {
      const res = await api.get('clinics/search?city=Milano&maxDistance=50');
      setClinics(res.clinics || res || []);
    } catch (error) {
      console.error('Error loading clinics:', error);
    } finally {
      setLoadingClinics(false);
    }
  };
  
  const loadClinicServices = async (clinicId) => {
    setLoadingServices(true);
    setFormData(prev => ({...prev, serviceId: ''})); // Reset service selection
    try {
      const clinic = clinics.find(c => c.id === clinicId);
      // Usa i servizi della clinica se disponibili
      if (clinic?.services && clinic.services.length > 0) {
        const formattedServices = clinic.services.map((s, idx) => ({
          id: idx + 1,
          name: s.name || s.id?.replace(/_/g, ' ') || 'Servizio',
          duration: s.duration || 30,
          price: s.price || 0,
          type: s.type || (s.id?.includes('video') ? 'online' : 'in_sede')
        }));
        // Se siamo in modalità servizio, filtra solo i servizi della categoria selezionata
        if (searchMode === 'service' && selectedCategory) {
          const category = SERVICE_CATEGORIES.find(c => c.id === selectedCategory);
          if (category) {
            const filteredServices = formattedServices.filter(service => 
              category.keywords.some(keyword => service.name.toLowerCase().includes(keyword.toLowerCase()))
            );
            setClinicServices(filteredServices.length > 0 ? filteredServices : formattedServices);
          } else {
            setClinicServices(formattedServices);
          }
        } else {
          setClinicServices(formattedServices);
        }
      } else {
        // Fallback servizi base se la clinica non ha servizi configurati
        setClinicServices([
          { id: 1, name: 'Visita generale', duration: 30, price: 50, type: 'in_sede' },
          { id: 2, name: 'Video-consulto', duration: 20, price: 35, type: 'online' },
        ]);
      }
    } catch (error) {
      console.error('Error loading clinic services:', error);
      setClinicServices([]);
    } finally {
      setLoadingServices(false);
    }
  };
  
  // Funzione per selezionare clinica dalla modalità servizio
  const selectClinicFromService = (clinic) => {
    setFormData({...formData, clinicId: clinic.id});
  };
  
  // Reset quando si cambia modalità
  const handleModeChange = (mode) => {
    setSearchMode(mode);
    setSelectedCategory(null);
    setServiceSearch('');
    setFilteredClinics([]);
    setFormData({ petId: formData.petId, serviceId: '', date: '', time: '', notes: '', clinicId: '' });
    setClinicServices([]);
  };
  
  // Filtra categorie per ricerca
  const filteredCategories = SERVICE_CATEGORIES.filter(cat =>
    serviceSearch === '' || 
    cat.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    cat.keywords.some(k => k.toLowerCase().includes(serviceSearch.toLowerCase()))
  );
  
  const selectedService = clinicServices.find(s => s.id === parseInt(formData.serviceId));
  const selectedClinic = clinics.find(c => c.id === formData.clinicId);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const service = clinicServices.find(s => s.id === parseInt(formData.serviceId));
    const pet = pets.find(p => p.id === formData.petId);
    try {
      await api.post('appointments', {
        petName: pet?.name || 'Animale',
        ownerName: 'Proprietario',
        clinicId: formData.clinicId,
        clinicName: selectedClinic?.clinicName || selectedClinic?.name || 'Clinica',
        date: formData.date,
        time: formData.time,
        type: service?.type === 'online' ? 'videoconsulto' : 'visita',
        reason: service?.name || 'Visita',
        price: service?.price || 0,
        notes: formData.notes
      });
      setShowBooking(false);
      setFormData({ petId: '', serviceId: '', date: '', time: '', notes: '', clinicId: '' });
    } catch (error) { alert(error.message); }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">I miei appuntamenti</h2>
          <p className="text-gray-500 text-sm">Visite e consulti prenotati</p>
        </div>
        <Dialog open={showBooking} onOpenChange={(open) => { setShowBooking(open); if (!open) { handleModeChange('clinic'); setVideoConsultoConfirmed(false); setUploadedFiles([]); } }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />Prenota visita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Prenota una visita</DialogTitle>
              <DialogDescription>Scegli come vuoi cercare: per clinica o per tipo di servizio</DialogDescription>
            </DialogHeader>
            
            {/* Toggle Modalità Ricerca */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
              <button
                onClick={() => handleModeChange('clinic')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${searchMode === 'clinic' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <Building2 className="h-4 w-4 inline mr-2" />
                Cerca per Clinica
              </button>
              <button
                onClick={() => handleModeChange('service')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${searchMode === 'service' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <Search className="h-4 w-4 inline mr-2" />
                Cerca per Servizio
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pet Selection - sempre visibile */}
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
              
              {/* ========== MODALITÀ CLINICA ========== */}
              {searchMode === 'clinic' && (
                <>
                  {/* Clinic Selection */}
                  <div>
                    <Label>Presso quale clinica?</Label>
                    <Select value={formData.clinicId} onValueChange={(v) => setFormData({...formData, clinicId: v, serviceId: ''})}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingClinics ? "Caricamento..." : "Seleziona clinica"} />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map(clinic => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-coral-500" />
                              <span>{clinic.clinicName || clinic.name}</span>
                              {clinic.avgRating && <span className="text-xs text-amber-600">★ {clinic.avgRating.toFixed(1)}</span>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Service Selection */}
                  {formData.clinicId && (
                    <div>
                      <Label>Tipo di visita</Label>
                      {loadingServices ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Caricamento servizi...</p>
                        </div>
                      ) : clinicServices.length === 0 ? (
                        <p className="text-sm text-gray-500 py-2">Nessun servizio disponibile per questa clinica</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto">
                          {clinicServices.map(service => (
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
                      )}
                    </div>
                  )}
                </>
              )}
              
              {/* ========== MODALITÀ SERVIZIO ========== */}
              {searchMode === 'service' && (
                <>
                  {/* Step 1: Cerca servizio */}
                  {!selectedCategory && (
                    <div>
                      <Label>Che servizio cerchi?</Label>
                      <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Es. vaccinazione, toelettatura, visita..."
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 max-h-64 overflow-y-auto">
                        {filteredCategories.map(category => (
                          <div
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className="p-3 border rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition flex items-center gap-3"
                          >
                            <span className="text-2xl">{category.icon}</span>
                            <span className="font-medium text-sm">{category.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Mostra cliniche che offrono il servizio */}
                  {selectedCategory && !formData.clinicId && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Cliniche che offrono: <span className="text-blue-600">{SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name}</span></Label>
                        <button type="button" onClick={() => setSelectedCategory(null)} className="text-sm text-gray-500 hover:text-blue-600">← Cambia servizio</button>
                      </div>
                      
                      {loadingClinics ? (
                        <div className="text-center py-6">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Cercando cliniche...</p>
                        </div>
                      ) : filteredClinics.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">Nessuna clinica trovata per questo servizio nella tua zona</p>
                          <button type="button" onClick={() => setSelectedCategory(null)} className="text-blue-500 text-sm mt-2 hover:underline">Prova un altro servizio</button>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {filteredClinics.map(clinic => (
                            <div
                              key={clinic.id}
                              onClick={() => selectClinicFromService(clinic)}
                              className="p-4 border rounded-lg cursor-pointer hover:border-blue-400 hover:shadow-md transition bg-white"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900">{clinic.clinicName || clinic.name}</h4>
                                    {clinic.avgRating && (
                                      <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                        <Star className="h-3 w-3 fill-current" />
                                        {clinic.avgRating.toFixed(1)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{clinic.address}, {clinic.city}</span>
                                  </div>
                                  {clinic.phone && (
                                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{clinic.phone}</span>
                                    </div>
                                  )}
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Step 3: Dopo aver scelto la clinica, mostra i servizi specifici */}
                  {selectedCategory && formData.clinicId && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Clinica selezionata</Label>
                        <button type="button" onClick={() => setFormData({...formData, clinicId: '', serviceId: ''})} className="text-sm text-gray-500 hover:text-blue-600">← Cambia clinica</button>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">{selectedClinic?.clinicName || selectedClinic?.name}</span>
                        </div>
                      </div>
                      
                      <Label>Seleziona il servizio specifico</Label>
                      {loadingServices ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto">
                          {clinicServices.map(service => (
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
                                    <p className="text-xs text-gray-500">{service.duration} min</p>
                                  </div>
                                </div>
                                <p className="font-semibold text-blue-600">€{service.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {/* Date/Time - mostra solo quando servizio è selezionato */}
              {formData.serviceId && (
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
              )}
              
              {/* Notes */}
              {formData.serviceId && (
                <div>
                  <Label>Motivo del consulto *</Label>
                  <Textarea 
                    value={formData.notes} 
                    onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                    placeholder={selectedService?.type === 'online' 
                      ? "Descrivi il motivo del video consulto, sintomi osservati, domande per il veterinario..."
                      : "Descrivi brevemente il motivo della visita..."}
                    rows={3}
                  />
                </div>
              )}

              {/* Upload Documenti per tutti i tipi di appuntamento */}
              {formData.clinicId && formData.serviceId && (
                <div className="space-y-3">
                  <div>
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documenti allegati (opzionale)
                    </Label>
                    <p className="text-xs text-gray-500 mb-2">
                      {selectedService?.type === 'online' 
                        ? 'Carica referti, analisi, foto o video per aiutare il veterinario a prepararsi.'
                        : 'Carica referti precedenti, analisi del sangue, radiografie o altri documenti utili per la visita.'}
                    </p>
                  </div>
                  
                  {/* File List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            {file.type?.includes('image') ? (
                              <ImageIcon className="h-4 w-4 text-green-600" />
                            ) : file.type?.includes('video') ? (
                              <Video className="h-4 w-4 text-green-600" />
                            ) : (
                              <FileText className="h-4 w-4 text-green-600" />
                            )}
                            <span className="text-sm font-medium text-green-800">{file.name}</span>
                            <span className="text-xs text-green-600">({(file.size / 1024).toFixed(0)} KB)</span>
                          </div>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          // Check file size (max 10MB)
                          const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
                          if (validFiles.length < files.length) {
                            alert('Alcuni file superano il limite di 10MB e sono stati esclusi');
                          }
                          setUploadedFiles(prev => [...prev, ...validFiles]);
                          e.target.value = '';
                        }}
                      />
                      <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Carica file (PDF, immagini, video)</span>
                      </div>
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    Formati supportati: PDF, JPG, PNG, MP4, MOV • Max 10MB per file
                  </p>
                </div>
              )}
              
              {/* Summary */}
              {selectedService && selectedClinic && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Riepilogo</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clinica:</span>
                      <span className="font-medium">{selectedClinic.clinicName || selectedClinic.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servizio:</span>
                      <span className="font-medium">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durata:</span>
                      <span>{selectedService.duration} minuti</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-1">
                      <span className="text-gray-600">Costo:</span>
                      <span className="font-semibold text-blue-600">€{selectedService.price}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Consulto Disclaimer */}
              {selectedService?.type === 'online' && (
                <div className="space-y-3">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Video className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-indigo-800 mb-1">Cos'è il Video Consulto?</h4>
                        <p className="text-sm text-indigo-700">
                          È una consulenza a distanza con il veterinario per triage, dubbi, follow-up e interpretazione di referti. 
                          <strong> Non sostituisce una visita clinica in presenza</strong> quando è necessario un esame fisico.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <input 
                      type="checkbox" 
                      checked={videoConsultoConfirmed} 
                      onChange={(e) => setVideoConsultoConfirmed(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      Ho capito che il video consulto è una consulenza e potrebbe essere richiesta una visita in clinica.
                    </span>
                  </label>
                </div>
              )}
              
              {/* Emergency Message */}
              <div className="text-center text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg p-2">
                <span className="text-amber-600">⚠️</span> Per emergenze contatta subito la clinica o il pronto soccorso veterinario.
              </div>
              
              {/* Missing fields indicator */}
              {(!formData.petId || !formData.serviceId || !formData.date || !formData.time || !formData.clinicId || (selectedService?.type === 'online' && !videoConsultoConfirmed)) && (
                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                  <span className="font-medium">Completa tutti i campi:</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {!formData.petId && <li>Seleziona un animale</li>}
                    {!formData.clinicId && <li>Seleziona una clinica</li>}
                    {!formData.serviceId && <li>Seleziona un servizio</li>}
                    {!formData.date && <li>Inserisci la data</li>}
                    {!formData.time && <li>Inserisci l'orario</li>}
                    {selectedService?.type === 'online' && !videoConsultoConfirmed && <li>Conferma di aver compreso le condizioni del video consulto</li>}
                  </ul>
                </div>
              )}
              
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={!formData.petId || !formData.serviceId || !formData.date || !formData.time || !formData.clinicId || (selectedService?.type === 'online' && !videoConsultoConfirmed)}>
                Prenota appuntamento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {appointments.length === 0 ? (
        <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-4">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Pilot Milano</span>
            </div>
            <Calendar className="h-16 w-16 mx-auto mb-4 text-blue-300" />
            <h3 className="font-bold text-xl text-gray-800 mb-2">Nessun appuntamento ancora</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Siamo in fase pilot a Milano. Per prenotare una visita, trova prima una clinica nella sezione "Trova clinica" o invita il tuo veterinario di fiducia!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => setShowBooking(true)}>
                <Plus className="h-4 w-4 mr-2" />Prenota una visita
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <Card key={appt.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAppointment(appt)}>
              <CardContent className="p-3 sm:p-4">
                {/* Mobile: stack layout, Desktop: side by side */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left section: Pet info */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${appt.type === 'videoconsulto' ? 'bg-blue-100' : 'bg-coral-100'}`}>
                      {appt.type === 'videoconsulto' ? <Video className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" /> : <PawPrint className="h-5 w-5 sm:h-6 sm:w-6 text-coral-600" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{appt.petName}</p>
                      <p className="text-sm text-gray-500 truncate">{appt.reason || 'Visita'}</p>
                      {/* Badge stato pagamento */}
                      {appt.paymentStatus === 'paid' ? (
                        <Badge className="bg-green-100 text-green-700 text-xs mt-1">✓ Pagato</Badge>
                      ) : appt.price && appt.price > 0 && appt.status !== 'cancelled' && appt.status !== 'completed' && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs mt-1">€{appt.price} da pagare</Badge>
                      )}
                    </div>
                    {/* Date on mobile - inline */}
                    <div className="sm:hidden text-right flex-shrink-0">
                      <p className="font-medium text-sm">{appt.date}</p>
                      <p className="text-xs text-gray-500">{appt.time}</p>
                    </div>
                  </div>
                  
                  {/* Right section: Date (desktop) + Actions */}
                  <div className="flex flex-col sm:items-end gap-2">
                    {/* Date on desktop */}
                    <div className="hidden sm:block text-right">
                      <p className="font-medium">{appt.date}</p>
                      <p className="text-sm text-gray-500">{appt.time}</p>
                    </div>
                    {/* Action buttons - full width on mobile */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      {/* Pulsante Paga se non pagato */}
                      {appt.paymentStatus !== 'paid' && appt.price && appt.price > 0 && appt.status !== 'cancelled' && appt.status !== 'completed' && (
                        <Button 
                          size="sm" 
                          className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto justify-center" 
                          onClick={(e) => { e.stopPropagation(); handlePayment(appt); }}
                          disabled={paymentLoading === appt.id}
                        >
                          {paymentLoading === appt.id ? (
                            <><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Caricamento...</>
                          ) : (
                            <><CreditCard className="h-3 w-3 mr-1" />Paga €{appt.price}</>
                          )}
                        </Button>
                      )}
                      {appt.type === 'videoconsulto' && appt.videoLink && (
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto justify-center" onClick={(e) => { e.stopPropagation(); window.open(appt.videoLink, '_blank'); }}>
                          <Video className="h-3 w-3 mr-1" />Video Consulto
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Modal Dettagli Appuntamento */}
      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Dettagli Appuntamento
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              {/* Info Paziente */}
              <div className="flex items-center gap-3 p-3 bg-coral-50 rounded-lg">
                <div className="h-10 w-10 bg-coral-100 rounded-full flex items-center justify-center">
                  <PawPrint className="h-5 w-5 text-coral-600" />
                </div>
                <div>
                  <p className="font-semibold">{selectedAppointment.petName}</p>
                  <p className="text-sm text-gray-500">{selectedAppointment.petSpecies || 'Animale'}</p>
                </div>
              </div>
              
              {/* Info Appuntamento */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Data e Ora</p>
                    <p className="font-medium">{selectedAppointment.date} alle {selectedAppointment.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Motivo Visita</p>
                    <p className="font-medium">{selectedAppointment.reason || 'Visita di controllo'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-coral-500" />
                  <div>
                    <p className="text-sm text-gray-500">Clinica</p>
                    <p className="font-medium">{selectedAppointment.clinicName || 'Clinica Veterinaria'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertCircle className={`h-5 w-5 ${selectedAppointment.status === 'confirmed' ? 'text-green-500' : selectedAppointment.status === 'pending' ? 'text-amber-500' : 'text-gray-500'}`} />
                  <div>
                    <p className="text-sm text-gray-500">Stato</p>
                    <p className={`font-medium ${selectedAppointment.status === 'confirmed' ? 'text-green-600' : selectedAppointment.status === 'pending' ? 'text-amber-600' : 'text-gray-600'}`}>
                      {selectedAppointment.status === 'confirmed' ? '✓ Confermato' : selectedAppointment.status === 'pending' ? '⏳ In attesa' : selectedAppointment.status === 'completed' ? '✓ Completato' : selectedAppointment.status}
                    </p>
                  </div>
                </div>
                
                {/* Stato Pagamento */}
                {selectedAppointment.price && selectedAppointment.price > 0 && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${selectedAppointment.paymentStatus === 'paid' ? 'bg-green-50' : 'bg-amber-50'}`}>
                    <CreditCard className={`h-5 w-5 ${selectedAppointment.paymentStatus === 'paid' ? 'text-green-500' : 'text-amber-500'}`} />
                    <div>
                      <p className="text-sm text-gray-500">Pagamento</p>
                      <p className={`font-medium ${selectedAppointment.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                        {selectedAppointment.paymentStatus === 'paid' ? '✓ Pagato' : `€${selectedAppointment.price} da pagare`}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedAppointment.notes && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-gray-500 mb-1">Note</p>
                    <p className="text-sm text-gray-700">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
              
              {/* Azioni */}
              <div className="flex gap-2 pt-4 border-t">
                {/* Pulsante Paga se non pagato */}
                {selectedAppointment.paymentStatus !== 'paid' && selectedAppointment.price && selectedAppointment.price > 0 && selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                  <Button 
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600" 
                    onClick={() => handlePayment(selectedAppointment)}
                    disabled={paymentLoading === selectedAppointment.id}
                  >
                    {paymentLoading === selectedAppointment.id ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Caricamento...</>
                    ) : (
                      <><CreditCard className="h-4 w-4 mr-2" />Paga €{selectedAppointment.price}</>
                    )}
                  </Button>
                )}
                {selectedAppointment.type === 'videoconsulto' && selectedAppointment.videoLink && (
                  <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={() => window.open(selectedAppointment.videoLink, '_blank')}>
                    <Video className="h-4 w-4 mr-2" />Entra nel Video Consulto
                  </Button>
                )}
                <Button variant="outline" className="flex-1" onClick={() => setSelectedAppointment(null)}>
                  Chiudi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== OWNER TUTORIAL INLINE ====================
function OwnerTutorialInline() {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  
  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await fetch('/api/tutorials/download?type=owner');
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'VetBuddy_Tutorial_Proprietari.pdf';
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); a.remove();
    } catch (error) {
      alert('Errore durante il download. Riprova più tardi.');
    } finally { setDownloadingPDF(false); }
  };
  
  const sections = [
    { icon: PawPrint, title: 'Aggiungere i Tuoi Animali', color: 'bg-pink-500', content: ['Dalla dashboard, clicca "I Miei Animali"', 'Inserisci nome, specie, razza, data di nascita', 'Aggiungi peso, microchip e una foto', 'Specie supportate: cani, gatti, conigli, uccelli, rettili, pesci, cavalli e altri!'], tip: 'Puoi aggiungere animali di qualsiasi specie!' },
    { icon: MapPin, title: 'Trovare una Clinica', color: 'bg-green-500', content: ['Vai alla sezione "Trova Clinica"', 'Usa la mappa interattiva per vedere le cliniche vicine', 'Filtra per città o servizi offerti', 'Salva le cliniche preferite per un accesso rapido'], tip: 'La mappa mostra cliniche in tutta Italia.' },
    { icon: Calendar, title: 'Prenotare un Appuntamento', color: 'bg-purple-500', content: ['Clicca "Prenota Visita" dalla dashboard', 'Seleziona la clinica e il servizio', 'Scegli data e orario disponibili', 'Conferma e ricevi email di riepilogo'], tip: 'Riceverai promemoria automatici prima della visita.' },
    { icon: FileText, title: 'Gestire i Documenti', color: 'bg-amber-500', content: ['Visualizza prescrizioni, referti, fatture', 'Scarica i documenti in PDF', 'I documenti arrivano automaticamente dalla clinica'], tip: 'Tutti i documenti sono sempre disponibili!' },
    { icon: MessageCircle, title: 'Notifiche WhatsApp', color: 'bg-green-600', content: ['Vai su "Profilo e Notifiche" nel menu', 'Inserisci il tuo numero di telefono con prefisso (+39)', 'Attiva le notifiche WhatsApp', 'Ricevi promemoria appuntamenti e documenti su WhatsApp'], tip: 'Attiva WhatsApp per non perdere mai un appuntamento!' },
    { icon: Bell, title: 'Notifiche e Promemoria', color: 'bg-red-500', content: ['Ricevi notifiche per appuntamenti in arrivo', 'Promemoria per vaccini e controlli periodici', 'Scegli tra Email, WhatsApp o entrambi', 'Personalizza quando ricevere i promemoria'], tip: 'Non dimenticare mai un vaccino!' },
    { icon: Gift, title: 'Programma Fedeltà', color: 'bg-yellow-500', content: ['Accumula punti con ogni prenotazione completata', 'Invita amici e guadagna punti extra', '100 punti = €5 di sconto sulla prossima visita'], tip: 'Ogni visita ti premia!' },
    { icon: Smartphone, title: 'Installare l\'App', color: 'bg-teal-500', content: ['VetBuddy è una PWA installabile', 'Su iPhone: Safari → Condividi → Aggiungi a Home', 'Su Android: Chrome → Menu → Installa app'], tip: 'L\'app funziona anche offline!' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tutorial Proprietari</h2>
          <p className="text-gray-500 text-sm">Guida per gestire la salute dei tuoi animali</p>
        </div>
        <Button onClick={handleDownloadPDF} disabled={downloadingPDF} className="bg-blue-500 hover:bg-blue-600">
          <Download className="h-4 w-4 mr-2" />
          {downloadingPDF ? 'Download...' : 'Scarica PDF'}
        </Button>
      </div>
      
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle className="h-5 w-5" /> Quick Start - Inizia in 5 minuti</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {['1. Registrati gratis', '2. Aggiungi i tuoi animali', '3. Trova una clinica', '4. Prenota la prima visita'].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/20 rounded-xl p-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold">{i+1}</div>
              <span>{item.substring(3)}</span>
            </div>
          ))}
        </div>
      </div>
      
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
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                <p className="text-xs text-blue-700"><strong>💡</strong> {section.tip}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Heart className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="font-bold text-gray-800 mb-2">VetBuddy è gratuito per i proprietari!</h3>
        <p className="text-sm text-gray-600">Nessun costo nascosto. Prenota visite, ricevi documenti, gestisci la salute dei tuoi animali senza spendere nulla.</p>
      </div>
    </div>
  );
}

function OwnerDocuments({ documents, pets, onRefresh, user }) {
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => {
            try {
              const response = await fetch(`/api/documents/download-all?userId=${user?.id}&role=owner`);
              if (!response.ok) throw new Error('Nessun documento da scaricare');
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url;
              a.download = `VetBuddy_I_Miei_Documenti_${new Date().toISOString().split('T')[0]}.zip`;
              document.body.appendChild(a); a.click();
              window.URL.revokeObjectURL(url); a.remove();
            } catch (e) { alert(e.message || 'Errore download'); }
          }}><Download className="h-4 w-4 mr-2" />Scarica tutto</Button>
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
      </div>
      
      <Tabs defaultValue="dalla-clinica">
        <TabsList>
          <TabsTrigger value="dalla-clinica">Dalla clinica</TabsTrigger>
          <TabsTrigger value="caricati-da-me">Caricati da me</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dalla-clinica" className="mt-4">
          {documents.filter(d => !d.fromClient && d.type !== 'invoice' && d.category !== 'fattura').length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Nessun documento dalla clinica</p>
                <p className="text-sm mt-2">I referti e le prescrizioni appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {documents.filter(d => !d.fromClient && d.type !== 'invoice' && d.category !== 'fattura').map((doc) => {
                const handleDownload = () => {
                  // Always use API download which generates PDF
                  if (doc.id) {
                    window.open(`/api/documents/download?id=${doc.id}`, '_blank');
                  } else if (doc.content) {
                    // Check if content is base64 PDF
                    const isBase64PDF = doc.content.startsWith('data:') || doc.content.startsWith('JVBERi');
                    
                    if (isBase64PDF) {
                      const link = document.createElement('a');
                      if (doc.content.startsWith('data:')) {
                        link.href = doc.content;
                      } else {
                        link.href = `data:application/pdf;base64,${doc.content}`;
                      }
                      link.download = doc.fileName || doc.name || 'documento.pdf';
                      document.body.appendChild(link);
                      link.click();
                      setTimeout(() => document.body.removeChild(link), 100);
                    } else {
                      alert('Usa il pulsante Scarica per ottenere il PDF');
                    }
                  } else if (doc.fileUrl) {
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

// Componente separato per le fatture del proprietario
function OwnerInvoices({ invoices = [], pets, onRefresh }) {
  const [downloading, setDownloading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleDownloadInvoice = (doc) => {
    if (doc.content) {
      const link = document.createElement('a');
      if (doc.content.startsWith('data:')) {
        link.href = doc.content;
      } else {
        link.href = `data:application/pdf;base64,${doc.content}`;
      }
      link.download = doc.fileName || doc.name || `Fattura_${doc.invoiceNumber || 'documento'}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
    } else if (doc.id) {
      window.open(`/api/documents/download?id=${doc.id}`, '_blank');
    }
  };

  const handleDownloadAll = async () => {
    if (invoices.length === 0) return;
    setDownloading(true);
    try {
      // Download each invoice individually
      for (const invoice of invoices) {
        handleDownloadInvoice(invoice);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
      }
    } catch (error) {
      alert('Errore nel download');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) return;
    setExporting(true);
    try {
      // Create CSV content
      const headers = ['Numero Fattura', 'Data', 'Importo (€)', 'Animale', 'Clinica', 'Descrizione'];
      const rows = invoices.map(inv => [
        inv.invoiceNumber || inv.name || '',
        new Date(inv.issuedAt || inv.createdAt).toLocaleDateString('it-IT'),
        inv.amount ? inv.amount.toFixed(2) : '',
        inv.petName || '',
        inv.clinicName || '',
        inv.description || ''
      ]);
      
      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
      ].join('\n');
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Fatture_VetBuddy_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      alert('Errore nell\'esportazione');
    } finally {
      setExporting(false);
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Le mie fatture</h2>
          <p className="text-gray-500 text-sm">Fatture dei pagamenti effettuati online</p>
          {invoices.length > 0 && (
            <p className="text-emerald-600 font-semibold mt-1">
              Totale: €{totalAmount.toFixed(2)} ({invoices.length} fattur{invoices.length === 1 ? 'a' : 'e'})
            </p>
          )}
        </div>
        {invoices.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={exporting}
            >
              {exporting ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <FileText className="h-4 w-4 mr-1" />}
              Esporta CSV
            </Button>
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={handleDownloadAll}
              disabled={downloading}
            >
              {downloading ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
              Scarica Tutto
            </Button>
          </div>
        )}
      </div>
      
      {invoices.length === 0 ? (
        <Card className="p-8 text-center">
          <Receipt className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">Nessuna fattura</p>
          <p className="text-sm text-gray-400">Le fatture dei pagamenti online appariranno qui</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const pet = pets?.find(p => p.name === invoice.petName || p.id === invoice.petId);
            return (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow border-emerald-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Fattura {invoice.invoiceNumber || invoice.name}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{new Date(invoice.issuedAt || invoice.createdAt).toLocaleDateString('it-IT')}</span>
                          {invoice.amount && (
                            <span className="font-semibold text-emerald-600">€{invoice.amount.toFixed(2)}</span>
                          )}
                          {invoice.petName && (
                            <span className="flex items-center gap-1">
                              <PawPrint className="h-3 w-3" />
                              {invoice.petName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OwnerMessages({ messages, clinics = [], pets = [], onRefresh }) {
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState({ clinicId: '', subject: '', content: '', petId: '' });
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState(messages); // Local state for immediate updates

  // Sync local messages with props
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Group messages by conversation (clinicId + subject)
  const conversations = localMessages.reduce((acc, msg) => {
    const key = `${msg.clinicId}-${msg.subject}`;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        clinicId: msg.clinicId,
        clinicName: msg.clinicName || 'Clinica',
        subject: msg.subject,
        messages: [],
        lastMessage: msg,
        unread: 0
      };
    }
    acc[key].messages.push(msg);
    if (!msg.read && msg.from === 'clinic') acc[key].unread++;
    if (new Date(msg.createdAt) > new Date(acc[key].lastMessage.createdAt)) {
      acc[key].lastMessage = msg;
    }
    return acc;
  }, {});

  const conversationList = Object.values(conversations).sort((a, b) => 
    new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
  );

  const sendNewMessage = async () => {
    if (!newMessage.clinicId || !newMessage.subject || !newMessage.content) {
      alert('Compila tutti i campi obbligatori');
      return;
    }
    setSending(true);
    try {
      const clinic = clinics.find(c => c.id === newMessage.clinicId);
      const pet = newMessage.petId ? pets.find(p => p.id === newMessage.petId) : null;
      const newMsg = await api.post('messages', {
        clinicId: newMessage.clinicId,
        clinicName: clinic?.clinicName || clinic?.name || 'Clinica',
        subject: newMessage.subject,
        content: newMessage.content,
        from: 'owner',
        type: 'message',
        petId: pet?.id || null,
        petName: pet?.name || null
      });
      // Immediately add new message to local state for instant UI update
      if (newMsg) {
        setLocalMessages(prev => [...prev, {
          ...newMsg,
          clinicName: clinic?.clinicName || clinic?.name || 'Clinica',
          subject: newMessage.subject,
          content: newMessage.content,
          from: 'owner',
          createdAt: new Date().toISOString()
        }]);
      }
      setShowNewMessage(false);
      setNewMessage({ clinicId: '', subject: '', content: '', petId: '' });
      onRefresh?.();
    } catch (error) {
      alert('Errore nell\'invio del messaggio');
    } finally {
      setSending(false);
    }
  };

  const sendReply = async () => {
    if (!replyContent.trim() || !selectedConversation) return;
    setSending(true);
    try {
      const newMsg = await api.post('messages', {
        clinicId: selectedConversation.clinicId,
        clinicName: selectedConversation.clinicName,
        subject: selectedConversation.subject,
        content: replyContent,
        from: 'owner',
        type: 'reply',
        conversationId: selectedConversation.id
      });
      // Immediately add reply to local state for instant UI update
      if (newMsg) {
        setLocalMessages(prev => [...prev, {
          ...newMsg,
          clinicId: selectedConversation.clinicId,
          clinicName: selectedConversation.clinicName,
          subject: selectedConversation.subject,
          content: replyContent,
          from: 'owner',
          createdAt: new Date().toISOString()
        }]);
        // Also update selected conversation messages for immediate display
        setSelectedConversation(prev => ({
          ...prev,
          messages: [...prev.messages, {
            ...newMsg,
            content: replyContent,
            from: 'owner',
            createdAt: new Date().toISOString()
          }]
        }));
      }
      setReplyContent('');
      onRefresh?.();
    } catch (error) {
      alert('Errore nell\'invio della risposta');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Messaggi</h2>
          <p className="text-gray-500 text-sm">Comunicazioni con le cliniche</p>
        </div>
        <Button onClick={() => setShowNewMessage(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="h-4 w-4 mr-2" />Nuovo Messaggio
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Lista Conversazioni */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Conversazioni
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {conversationList.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Nessuna conversazione</p>
                  <p className="text-xs mt-1">Inizia scrivendo alla tua clinica!</p>
                </div>
              ) : (
                conversationList.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${
                      selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{conv.clinicName}</p>
                          {conv.unread > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">{conv.unread}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">{conv.subject}</p>
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {conv.lastMessage.content.substring(0, 50)}...
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Dettaglio Conversazione */}
        <Card className="md:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedConversation.subject}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {selectedConversation.clinicName}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[350px]">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {selectedConversation.messages
                      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                      .map(msg => (
                        <div key={msg.id} className={`flex ${msg.from === 'owner' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            msg.from === 'owner' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.from === 'owner' ? 'text-blue-100' : 'text-gray-400'}`}>
                              {new Date(msg.createdAt).toLocaleString('it-IT', { 
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <Input
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Scrivi un messaggio..."
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                    />
                    <Button onClick={sendReply} disabled={sending || !replyContent.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="h-[400px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Seleziona una conversazione</p>
                <p className="text-sm mt-1">oppure iniziane una nuova</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Dialog Nuovo Messaggio */}
      <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Messaggio</DialogTitle>
            <DialogDescription>Invia un messaggio alla tua clinica</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Clinica *</Label>
              <Select value={newMessage.clinicId} onValueChange={(v) => setNewMessage({...newMessage, clinicId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona clinica" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map(clinic => (
                    <SelectItem key={clinic.id} value={clinic.id}>{clinic.clinicName || clinic.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Animale di riferimento (opzionale)</Label>
              <Select value={newMessage.petId || 'none'} onValueChange={(v) => setNewMessage({...newMessage, petId: v === 'none' ? '' : v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona animale (opzionale)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessun animale specifico</SelectItem>
                  {pets.map(pet => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {getPetSpeciesInfo(pet.species).emoji} {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Oggetto *</Label>
              <Input 
                value={newMessage.subject}
                onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                placeholder="Es: Domanda sul mio animale"
              />
            </div>
            <div>
              <Label>Messaggio *</Label>
              <textarea 
                className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
                value={newMessage.content}
                onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                placeholder="Scrivi il tuo messaggio..."
              />
            </div>
            <Button onClick={sendNewMessage} disabled={sending} className="w-full">
              {sending ? 'Invio...' : 'Invia Messaggio'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OwnerPets({ pets, onRefresh, onOpenProfile }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', species: 'dog', breed: '', birthDate: '', weight: '', weightDate: new Date().toISOString().split('T')[0],
    microchip: '', sterilized: false, allergies: '', medications: '', notes: '',
    // Nuovi campi
    insurance: false, insuranceCompany: '', insurancePolicy: '',
    medicalHistory: '', currentConditions: '', chronicDiseases: '',
    weightHistory: [], // Array di { weight, date }
    diet: '', // Tipo di alimentazione
    dietNotes: '' // Note sull'alimentazione
  });

  // Listen for add pet event from welcome screen (new registration)
  useEffect(() => {
    const handleOpenAddPet = () => {
      setEditingPet(null);
      setFormData({ 
        name: '', species: 'dog', breed: '', birthDate: '', weight: '', weightDate: new Date().toISOString().split('T')[0],
        microchip: '', sterilized: false, allergies: '', medications: '', notes: '',
        insurance: false, insuranceCompany: '', insurancePolicy: '',
        medicalHistory: '', currentConditions: '', chronicDiseases: '',
        weightHistory: [], diet: '', dietNotes: ''
      });
      setShowDialog(true);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('vetbuddy_open_add_pet', handleOpenAddPet);
      return () => window.removeEventListener('vetbuddy_open_add_pet', handleOpenAddPet);
    }
  }, []);
  
  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    try {
      // Se c'è un peso, aggiungilo alla history
      const dataToSubmit = { ...formData };
      delete dataToSubmit.photoFile; // Non inviare il file direttamente
      
      if (formData.weight && formData.weightDate) {
        dataToSubmit.weightHistory = [
          ...(formData.weightHistory || []),
          { weight: parseFloat(formData.weight), date: formData.weightDate, addedAt: new Date().toISOString() }
        ];
      }
      
      let savedPet;
      if (editingPet) {
        savedPet = await api.put(`pets/${editingPet.id}`, dataToSubmit);
      } else {
        savedPet = await api.post('pets', dataToSubmit);
      }
      
      // Upload foto se presente (dopo aver salvato il pet per avere l'ID)
      if (formData.photoFile && savedPet?.id) {
        const photoFormData = new FormData();
        photoFormData.append('photo', formData.photoFile);
        photoFormData.append('petId', savedPet.id);
        
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/pets/photo`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${api.getToken()}` },
            body: photoFormData
          });
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
        }
      }
      
      setShowDialog(false);
      setEditingPet(null);
      resetForm();
      onRefresh(); 
    } catch (error) { alert(error.message); } 
  };

  const resetForm = () => {
    setFormData({ 
      name: '', species: 'dog', breed: '', birthDate: '', weight: '', weightDate: new Date().toISOString().split('T')[0],
      microchip: '', sterilized: false, allergies: '', medications: '', notes: '',
      insurance: false, insuranceCompany: '', insurancePolicy: '',
      medicalHistory: '', currentConditions: '', chronicDiseases: '',
      weightHistory: [],
      diet: '', dietNotes: '',
      photoUrl: null, photoFile: null
    });
  };

  const handleEdit = (pet, e) => {
    e?.stopPropagation();
    setEditingPet(pet);
    setFormData({
      name: pet.name || '',
      species: pet.species || 'dog',
      breed: pet.breed || '',
      birthDate: pet.birthDate || '',
      weight: pet.weight || '',
      weightDate: new Date().toISOString().split('T')[0],
      microchip: pet.microchip || '',
      sterilized: pet.sterilized || false,
      allergies: pet.allergies || '',
      medications: pet.medications || '',
      notes: pet.notes || '',
      insurance: pet.insurance || false,
      insuranceCompany: pet.insuranceCompany || '',
      insurancePolicy: pet.insurancePolicy || '',
      medicalHistory: pet.medicalHistory || '',
      currentConditions: pet.currentConditions || '',
      chronicDiseases: pet.chronicDiseases || '',
      weightHistory: pet.weightHistory || [],
      diet: pet.diet || '',
      dietNotes: pet.dietNotes || ''
    });
    setShowDialog(true);
  };

  const handleDelete = async (petId, e) => {
    e?.stopPropagation();
    if (!confirm('Sei sicuro di voler eliminare questo animale?')) return;
    try {
      await api.delete(`pets/${petId}`);
      onRefresh();
    } catch (error) {
      alert(error.message);
    }
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
        <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingPet(null); resetForm(); } }}>
          <DialogTrigger asChild><Button className="bg-blue-500 hover:bg-blue-600"><Plus className="h-4 w-4 mr-2" />Aggiungi animale</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPet ? 'Modifica animale' : 'Nuovo animale'}</DialogTitle>
              <DialogDescription>{editingPet ? 'Modifica i dati del tuo animale' : 'Inserisci i dati del tuo animale'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Sezione Foto */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Camera className="h-4 w-4" /> Foto</h4>
                <div className="flex items-center gap-6">
                  <PetAvatar pet={{ ...formData, photoUrl: formData.photoUrl }} size="lg" />
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      id="pet-photo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 20 * 1024 * 1024) {
                          alert('File troppo grande. Massimo 20MB.');
                          return;
                        }
                        // Preview immediately
                        const reader = new FileReader();
                        reader.onload = () => setFormData({...formData, photoUrl: reader.result, photoFile: file });
                        reader.readAsDataURL(file);
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('pet-photo-upload').click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      {formData.photoUrl ? 'Cambia foto' : 'Carica foto'}
                    </Button>
                    {formData.photoUrl && (
                      <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => setFormData({...formData, photoUrl: null, photoFile: null })}>
                        <Trash2 className="h-4 w-4 mr-1" /> Rimuovi
                      </Button>
                    )}
                    <p className="text-xs text-gray-500">JPG, PNG, WebP o GIF. Max 20MB.</p>
                    {!formData.photoUrl && (
                      <p className="text-xs text-gray-400">Se non carichi una foto, verrà mostrata l'icona della specie</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sezione Dati Base */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><PawPrint className="h-4 w-4" /> Dati Generali</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Nome *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
                  <div><Label>Specie</Label><Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dog">🐕 Cane</SelectItem><SelectItem value="cat">🐱 Gatto</SelectItem><SelectItem value="horse">🐴 Cavallo</SelectItem><SelectItem value="bird">🦜 Uccello</SelectItem><SelectItem value="rabbit">🐰 Coniglio</SelectItem><SelectItem value="hamster">🐹 Criceto</SelectItem><SelectItem value="fish">🐠 Pesce</SelectItem><SelectItem value="reptile">🦎 Rettile</SelectItem><SelectItem value="other">🐾 Altro</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Razza</Label><Input value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} placeholder="Es. Labrador" /></div>
                  <div><Label>Data di nascita</Label><Input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} /></div>
                </div>
                <div><Label>Microchip</Label><Input value={formData.microchip} onChange={(e) => setFormData({...formData, microchip: e.target.value})} placeholder="Numero microchip" /></div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Switch checked={formData.sterilized} onCheckedChange={(v) => setFormData({...formData, sterilized: v})} />
                  <Label>Sterilizzato/a</Label>
                </div>
              </div>

              {/* Sezione Peso con Data */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Weight className="h-4 w-4" /> Peso Corporeo</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Peso attuale (kg)</Label><Input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} placeholder="Es. 12.5" /></div>
                  <div><Label>Data pesatura</Label><Input type="date" value={formData.weightDate} onChange={(e) => setFormData({...formData, weightDate: e.target.value})} /></div>
                </div>
                {/* Storico Pesi */}
                {formData.weightHistory && formData.weightHistory.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-700 mb-2">📊 Storico Pesi</p>
                    <div className="space-y-1">
                      {formData.weightHistory.slice(-5).reverse().map((w, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-600">{new Date(w.date).toLocaleDateString('it-IT')}</span>
                          <span className="font-medium">{w.weight} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sezione Assicurazione */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Shield className="h-4 w-4" /> Assicurazione</h4>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Switch checked={formData.insurance} onCheckedChange={(v) => setFormData({...formData, insurance: v})} />
                  <Label>L'animale ha un'assicurazione sanitaria</Label>
                </div>
                {formData.insurance && (
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Compagnia assicurativa</Label><Input value={formData.insuranceCompany} onChange={(e) => setFormData({...formData, insuranceCompany: e.target.value})} placeholder="Es. Sara Assicurazioni" /></div>
                    <div><Label>Numero polizza</Label><Input value={formData.insurancePolicy} onChange={(e) => setFormData({...formData, insurancePolicy: e.target.value})} placeholder="Es. POL-123456" /></div>
                  </div>
                )}
              </div>

              {/* Sezione Storia Medica */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Heart className="h-4 w-4" /> Storia Medica (utile per il veterinario)</h4>
                <div><Label>Patologie croniche / Condizioni note</Label><Textarea value={formData.chronicDiseases} onChange={(e) => setFormData({...formData, chronicDiseases: e.target.value})} placeholder="Es. Diabete, problemi cardiaci, displasia, epilessia..." rows={2} /></div>
                <div><Label>Condizioni attuali</Label><Textarea value={formData.currentConditions} onChange={(e) => setFormData({...formData, currentConditions: e.target.value})} placeholder="Es. In cura per dermatite, zoppica dalla zampa destra..." rows={2} /></div>
                <div><Label>Allergie note</Label><Input value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} placeholder="Es. Pollo, antibiotici, punture di insetti..." /></div>
                <div><Label>Farmaci attuali</Label><Textarea value={formData.medications} onChange={(e) => setFormData({...formData, medications: e.target.value})} placeholder="Es. Apoquel 16mg 1x/giorno, insulina 2x/giorno..." rows={2} /></div>
                <div><Label>Storia medica generale</Label><Textarea value={formData.medicalHistory} onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})} placeholder="Es. Intervento chirurgico nel 2023 per rimozione corpo estraneo, vaccinazioni regolari..." rows={3} /></div>
              </div>

              {/* Sezione Alimentazione */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Droplet className="h-4 w-4" /> Alimentazione</h4>
                <div>
                  <Label>Tipo di alimentazione</Label>
                  <Select value={formData.diet || 'non_specificato'} onValueChange={(v) => setFormData({...formData, diet: v === 'non_specificato' ? '' : v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo alimentazione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="non_specificato">Non specificato</SelectItem>
                      <SelectItem value="crocchette">🥣 Crocchette (secco)</SelectItem>
                      <SelectItem value="umido">🥫 Umido (scatolette)</SelectItem>
                      <SelectItem value="misto">🍽️ Misto (secco + umido)</SelectItem>
                      <SelectItem value="barf">🥩 BARF (carne cruda)</SelectItem>
                      <SelectItem value="casalinga">🍳 Dieta casalinga</SelectItem>
                      <SelectItem value="veterinaria">💊 Dieta veterinaria/terapeutica</SelectItem>
                      <SelectItem value="altro">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Note alimentazione</Label>
                  <Textarea value={formData.dietNotes} onChange={(e) => setFormData({...formData, dietNotes: e.target.value})} placeholder="Es. Marca crocchette, frequenza pasti, intolleranze alimentari..." rows={2} />
                </div>
              </div>

              {/* Sezione Note */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4" /> Note Comportamentali</h4>
                <div><Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Es. Timoroso dal veterinario, aggressivo con altri cani, ama i biscotti..." rows={2} /></div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowDialog(false); setEditingPet(null); resetForm(); }}>Annulla</Button>
                <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600">{editingPet ? 'Salva modifiche' : 'Aggiungi animale'}</Button>
              </div>
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
          <Card key={pet.id} className="hover:shadow-md transition-shadow group cursor-pointer" onClick={() => onOpenProfile?.(pet.id)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <PetAvatar pet={pet} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg">{pet.name}</p>
                  <p className="text-sm text-gray-500">{pet.breed || (pet.species === 'dog' ? 'Cane' : pet.species === 'cat' ? 'Gatto' : 'Animale')}</p>
                  {pet.birthDate && <p className="text-xs text-gray-400 mt-1">{calculateAge(pet.birthDate)}</p>}
                  {pet.weight && <p className="text-xs text-gray-400">{pet.weight} kg</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pet.sterilized && <Badge variant="outline" className="text-xs text-green-600 border-green-300">Sterilizzato</Badge>}
                    {pet.microchip && <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">Microchip</Badge>}
                    {pet.allergies && <Badge variant="outline" className="text-xs text-red-600 border-red-300">Allergie</Badge>}
                    {pet.insurance && <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">Assicurato</Badge>}
                    {(pet.chronicDiseases || pet.currentConditions) && <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">Patologie</Badge>}
                  </div>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => handleEdit(pet, e)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => handleDelete(pet.id, e)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==================== PET PROFILE (Cartella Clinica) ====================
function PetProfile({ petId, onBack, onNavigate, appointments, documents }) {
  const [pet, setPet] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  
  // Handler per aprire documento
  const handleOpenDocument = (doc) => {
    if (doc.url || doc.fileUrl) {
      window.open(doc.url || doc.fileUrl, '_blank');
    } else if (doc.content) {
      // Se abbiamo il contenuto base64, aprilo in una nuova finestra
      const base64Content = doc.content.startsWith('data:') ? doc.content : `data:application/pdf;base64,${doc.content}`;
      window.open(base64Content, '_blank');
    } else {
      setSelectedDocument(doc);
      setShowDocumentViewer(true);
    }
  };
  
  // Handler per scaricare documento
  const handleDownloadDocument = async (doc) => {
    try {
      const url = doc.url || doc.fileUrl;
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.fileName || doc.name || 'documento';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (doc.content) {
        // Scarica da contenuto base64
        const base64Content = doc.content.startsWith('data:') ? doc.content : `data:application/pdf;base64,${doc.content}`;
        const link = document.createElement('a');
        link.href = base64Content;
        link.download = doc.fileName || doc.name || 'documento.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Documento non disponibile per il download. Il file potrebbe non essere stato ancora caricato.');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Errore durante il download del documento');
    }
  };
  
  // Handler per gestire appuntamento
  const handleManageAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  useEffect(() => {
    loadPetData();
  }, [petId]);

  const loadPetData = async () => {
    try {
      const data = await api.get(`pets/${petId}`);
      setPet(data);
      setEditForm({
        name: data.name || '',
        species: data.species || 'dog',
        breed: data.breed || '',
        birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
        weight: data.weight || '',
        weightDate: new Date().toISOString().split('T')[0],
        microchip: data.microchip || '',
        sterilized: data.sterilized || false,
        allergies: data.allergies || '',
        medications: data.medications || '',
        notes: data.notes || '',
        // Campi aggiuntivi
        insurance: data.insurance || false,
        insuranceCompany: data.insuranceCompany || '',
        insurancePolicy: data.insurancePolicy || '',
        medicalHistory: data.medicalHistory || '',
        currentConditions: data.currentConditions || '',
        chronicDiseases: data.chronicDiseases || '',
        weightHistory: data.weightHistory || [],
        diet: data.diet || '',
        dietNotes: data.dietNotes || ''
      });
    } catch (error) {
      console.error('Error loading pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      // Prepara i dati includendo la weight history se c'è un nuovo peso
      const dataToSubmit = { ...editForm };
      if (editForm.weight && editForm.weightDate) {
        dataToSubmit.weightHistory = [
          ...(editForm.weightHistory || []),
          { weight: parseFloat(editForm.weight), date: editForm.weightDate, addedAt: new Date().toISOString() }
        ];
      }
      await api.put(`pets/${petId}`, dataToSubmit);
      await loadPetData();
      setShowEditDialog(false);
      alert('✅ Dati aggiornati con successo!');
    } catch (error) {
      alert('Errore: ' + error.message);
    } finally {
      setSaving(false);
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
                <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => setShowBookingDialog(true)}><Calendar className="h-4 w-4 mr-2" />Prenota visita</Button>
                <Button variant="outline" onClick={() => setShowUploadDialog(true)}><Upload className="h-4 w-4 mr-2" />Carica documento</Button>
                <Button variant="outline" onClick={() => setShowEditDialog(true)}><Edit className="h-4 w-4 mr-2" />Modifica dati</Button>
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
                    <Button size="sm" variant="outline" onClick={() => handleManageAppointment(nextAppointment)}>Gestisci</Button>
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
                    <Button size="sm" variant="outline" onClick={() => handleOpenDocument(lastDocument)}><Eye className="h-4 w-4 mr-1" />Apri</Button>
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
                    <p className="text-sm text-red-600 mt-1">{Array.isArray(pet.allergies) ? pet.allergies.join(', ') : (pet.allergies || 'Nessuna nota')}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">Farmaci in corso</p>
                    <p className="text-sm text-purple-600 mt-1">
                      {Array.isArray(pet.medications) 
                        ? pet.medications.map(m => typeof m === 'object' ? m.name : m).join(', ')
                        : (pet.medications || 'Nessuno')}
                    </p>
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
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleManageAppointment(appt)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${new Date(appt.date) >= new Date() ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {appt.type === 'videoconsulto' ? <Video className="h-5 w-5 text-blue-600" /> : <Stethoscope className="h-5 w-5 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{appt.reason || 'Visita'}</p>
                          <p className="text-sm text-gray-500">{new Date(appt.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} - {appt.time}</p>
                          {appt.clinicName && <p className="text-xs text-gray-400">{appt.clinicName}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={new Date(appt.date) >= new Date() ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}>
                          {new Date(appt.date) >= new Date() ? 'Programmato' : 'Completato'}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                      </div>
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
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleOpenDocument(doc)}><Eye className="h-4 w-4 mr-1" />Apri</Button>
                          <Button size="sm" variant="outline" onClick={() => handleDownloadDocument(doc)}><Download className="h-4 w-4 mr-1" />Scarica</Button>
                        </div>
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
                        <div className="flex gap-2 items-center">
                          <Badge variant="outline" className="text-green-600">Inviato</Badge>
                          <Button size="sm" variant="outline" onClick={() => handleOpenDocument(doc)}><Eye className="h-4 w-4 mr-1" />Apri</Button>
                        </div>
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
                    <p className="text-purple-800">
                      {Array.isArray(pet.medications) 
                        ? pet.medications.map(m => typeof m === 'object' ? `${m.name} - ${m.dosage}` : m).join(', ')
                        : pet.medications}
                    </p>
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // Export CSV delle spese
                      const invoices = petDocuments.filter(d => d.type === 'fattura' || d.type === 'invoice');
                      if (invoices.length === 0) {
                        alert('Nessuna fattura disponibile per l\'export');
                        return;
                      }
                      const csv = ['Data,Descrizione,Importo,Clinica'];
                      invoices.forEach(inv => {
                        csv.push(`${new Date(inv.createdAt).toLocaleDateString('it-IT')},${inv.name || 'Fattura'},€${inv.amount || 0},${inv.clinicName || 'N/A'}`);
                      });
                      const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `spese_${pet.name}_${new Date().toISOString().split('T')[0]}.csv`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Esporta spese (CSV)
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Dati aggiuntivi */}
            <Card className="md:col-span-2">
              <CardHeader><CardTitle>Informazioni complete</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 border-b pb-1">Dati Generali</h4>
                    <div><Label className="text-gray-500 text-xs">Specie</Label><p className="font-medium">{pet.species === 'dog' ? '🐕 Cane' : pet.species === 'cat' ? '🐱 Gatto' : pet.species || 'N/D'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Razza</Label><p className="font-medium">{pet.breed || 'N/D'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Data nascita</Label><p className="font-medium">{pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('it-IT') : 'N/D'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Sterilizzato</Label><p className="font-medium">{pet.sterilized ? '✅ Sì' : '❌ No'}</p></div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 border-b pb-1">Salute</h4>
                    <div><Label className="text-gray-500 text-xs">Allergie</Label><p className="font-medium">{pet.allergies || 'Nessuna nota'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Patologie croniche</Label><p className="font-medium">{pet.chronicDiseases || 'Nessuna nota'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Condizioni attuali</Label><p className="font-medium">{pet.currentConditions || 'Nessuna nota'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Farmaci</Label><p className="font-medium">{Array.isArray(pet.medications) ? pet.medications.map(m => typeof m === 'object' ? m.name : m).join(', ') : (pet.medications || 'Nessuno')}</p></div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 border-b pb-1">Altro</h4>
                    <div><Label className="text-gray-500 text-xs">Alimentazione</Label><p className="font-medium">{pet.diet ? {'crocchette': '🥣 Crocchette', 'umido': '🥫 Umido', 'misto': '🍽️ Misto', 'barf': '🥩 BARF', 'casalinga': '🍳 Casalinga', 'veterinaria': '💊 Veterinaria'}[pet.diet] || pet.diet : 'N/D'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Note alimentazione</Label><p className="font-medium">{pet.dietNotes || 'Nessuna nota'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Assicurazione</Label><p className="font-medium">{pet.insurance ? `✅ ${pet.insuranceCompany || 'Assicurato'}` : '❌ Non assicurato'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Note comportamentali</Label><p className="font-medium">{pet.notes || 'Nessuna nota'}</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog Modifica Pet - Form Completo */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica dati di {pet.name}</DialogTitle>
            <DialogDescription>Aggiorna le informazioni del tuo animale</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Dati Generali */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2"><PawPrint className="h-4 w-4" /> Dati Generali</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome *</Label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div>
                  <Label>Specie</Label>
                  <Select value={editForm.species} onValueChange={(v) => setEditForm({...editForm, species: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">🐕 Cane</SelectItem>
                      <SelectItem value="cat">🐱 Gatto</SelectItem>
                      <SelectItem value="horse">🐴 Cavallo</SelectItem>
                      <SelectItem value="bird">🦜 Uccello</SelectItem>
                      <SelectItem value="rabbit">🐰 Coniglio</SelectItem>
                      <SelectItem value="hamster">🐹 Criceto</SelectItem>
                      <SelectItem value="fish">🐠 Pesce</SelectItem>
                      <SelectItem value="reptile">🦎 Rettile</SelectItem>
                      <SelectItem value="other">🐾 Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Razza</Label>
                  <Input value={editForm.breed} onChange={(e) => setEditForm({...editForm, breed: e.target.value})} placeholder="Es. Golden Retriever" />
                </div>
                <div>
                  <Label>Data di nascita</Label>
                  <Input type="date" value={editForm.birthDate} onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Microchip</Label>
                <Input value={editForm.microchip} onChange={(e) => setEditForm({...editForm, microchip: e.target.value})} placeholder="Numero microchip" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Switch checked={editForm.sterilized} onCheckedChange={(v) => setEditForm({...editForm, sterilized: v})} />
                <Label>Sterilizzato/a</Label>
              </div>
            </div>

            {/* Peso */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Weight className="h-4 w-4" /> Peso Corporeo</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Peso attuale (kg)</Label>
                  <Input type="number" step="0.1" value={editForm.weight} onChange={(e) => setEditForm({...editForm, weight: e.target.value})} placeholder="Es. 12.5" />
                </div>
                <div>
                  <Label>Data pesatura</Label>
                  <Input type="date" value={editForm.weightDate} onChange={(e) => setEditForm({...editForm, weightDate: e.target.value})} />
                </div>
              </div>
              {editForm.weightHistory && editForm.weightHistory.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-700 mb-2">📊 Storico Pesi</p>
                  <div className="space-y-1">
                    {editForm.weightHistory.slice(-5).reverse().map((w, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{new Date(w.date).toLocaleDateString('it-IT')}</span>
                        <span className="font-medium">{w.weight} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Assicurazione */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Shield className="h-4 w-4" /> Assicurazione</h4>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Switch checked={editForm.insurance} onCheckedChange={(v) => setEditForm({...editForm, insurance: v})} />
                <Label>L'animale ha un'assicurazione sanitaria</Label>
              </div>
              {editForm.insurance && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Compagnia assicurativa</Label>
                    <Input value={editForm.insuranceCompany} onChange={(e) => setEditForm({...editForm, insuranceCompany: e.target.value})} placeholder="Es. Sara Assicurazioni" />
                  </div>
                  <div>
                    <Label>Numero polizza</Label>
                    <Input value={editForm.insurancePolicy} onChange={(e) => setEditForm({...editForm, insurancePolicy: e.target.value})} placeholder="Es. POL-123456" />
                  </div>
                </div>
              )}
            </div>

            {/* Storia Medica */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Heart className="h-4 w-4" /> Storia Medica</h4>
              <div>
                <Label>Patologie croniche / Condizioni note</Label>
                <Textarea value={editForm.chronicDiseases} onChange={(e) => setEditForm({...editForm, chronicDiseases: e.target.value})} placeholder="Es. Diabete, problemi cardiaci..." rows={2} />
              </div>
              <div>
                <Label>Condizioni attuali</Label>
                <Textarea value={editForm.currentConditions} onChange={(e) => setEditForm({...editForm, currentConditions: e.target.value})} placeholder="Es. In cura per dermatite..." rows={2} />
              </div>
              <div>
                <Label>Allergie note</Label>
                <Input value={editForm.allergies} onChange={(e) => setEditForm({...editForm, allergies: e.target.value})} placeholder="Es. Pollo, polline..." />
              </div>
              <div>
                <Label>Farmaci attuali</Label>
                <Textarea value={editForm.medications} onChange={(e) => setEditForm({...editForm, medications: e.target.value})} placeholder="Es. Apoquel 16mg 1x/giorno..." rows={2} />
              </div>
              <div>
                <Label>Storia medica generale</Label>
                <Textarea value={editForm.medicalHistory} onChange={(e) => setEditForm({...editForm, medicalHistory: e.target.value})} placeholder="Es. Intervento chirurgico nel 2023..." rows={2} />
              </div>
            </div>

            {/* Alimentazione */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Droplet className="h-4 w-4" /> Alimentazione</h4>
              <div>
                <Label>Tipo di alimentazione</Label>
                <Select value={editForm.diet || 'non_specificato'} onValueChange={(v) => setEditForm({...editForm, diet: v === 'non_specificato' ? '' : v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo alimentazione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non_specificato">Non specificato</SelectItem>
                    <SelectItem value="crocchette">🥣 Crocchette (secco)</SelectItem>
                    <SelectItem value="umido">🥫 Umido (scatolette)</SelectItem>
                    <SelectItem value="misto">🍽️ Misto (secco + umido)</SelectItem>
                    <SelectItem value="barf">🥩 BARF (carne cruda)</SelectItem>
                    <SelectItem value="casalinga">🍳 Dieta casalinga</SelectItem>
                    <SelectItem value="veterinaria">💊 Dieta veterinaria/terapeutica</SelectItem>
                    <SelectItem value="altro">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Note alimentazione</Label>
                <Textarea value={editForm.dietNotes} onChange={(e) => setEditForm({...editForm, dietNotes: e.target.value})} placeholder="Es. Marca crocchette, frequenza pasti..." rows={2} />
              </div>
            </div>

            {/* Note */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4" /> Note Comportamentali</h4>
              <div>
                <Textarea value={editForm.notes} onChange={(e) => setEditForm({...editForm, notes: e.target.value})} placeholder="Es. Timoroso dal veterinario..." rows={2} />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annulla</Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleSaveEdit} disabled={saving}>
              {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              {saving ? 'Salvataggio...' : 'Salva modifiche'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Prenotazione (semplificato) */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prenota visita per {pet.name}</DialogTitle>
            <DialogDescription>Vai alla sezione Appuntamenti per prenotare una nuova visita</DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <Calendar className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Per prenotare una visita, usa la sezione "I miei appuntamenti" nel menu laterale.</p>
            <Button onClick={() => { setShowBookingDialog(false); if (onNavigate) onNavigate('appointments'); else onBack(); }} className="bg-blue-500 hover:bg-blue-600">
              Vai agli Appuntamenti
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Upload Documento (semplificato) */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carica documento per {pet.name}</DialogTitle>
            <DialogDescription>Vai alla sezione Documenti per caricare un nuovo file</DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <Upload className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Per caricare documenti, usa la sezione "Documenti" nel menu laterale.</p>
            <Button onClick={() => { setShowUploadDialog(false); if (onNavigate) onNavigate('documents'); else onBack(); }} className="bg-green-500 hover:bg-green-600">
              Vai ai Documenti
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Dettagli Appuntamento */}
      <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Dettagli Appuntamento
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 mt-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-semibold text-lg text-blue-800">{selectedAppointment.reason || 'Visita'}</p>
                <p className="text-blue-600 mt-1">
                  {new Date(selectedAppointment.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-blue-600">Ore {selectedAppointment.time}</p>
              </div>
              
              <div className="space-y-2">
                {selectedAppointment.clinicName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Clinica:</span>
                    <span className="font-medium">{selectedAppointment.clinicName}</span>
                  </div>
                )}
                {selectedAppointment.type && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo:</span>
                    <span className="font-medium">{selectedAppointment.type === 'videoconsulto' ? 'Videoconsulto' : 'In sede'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Stato:</span>
                  <Badge className={new Date(selectedAppointment.date) >= new Date() ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                    {new Date(selectedAppointment.date) >= new Date() ? 'Programmato' : 'Completato'}
                  </Badge>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-1">Note:</p>
                  <p className="text-gray-700">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAppointmentDetails(false)}>
                  Chiudi
                </Button>
                {new Date(selectedAppointment.date) >= new Date() && (
                  <Button variant="destructive" className="flex-1" onClick={() => {
                    if (confirm('Sei sicuro di voler cancellare questo appuntamento?')) {
                      // TODO: API call to cancel appointment
                      alert('Funzionalità di cancellazione in arrivo');
                    }
                  }}>
                    Cancella appuntamento
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog Visualizzatore Documento */}
      <Dialog open={showDocumentViewer} onOpenChange={setShowDocumentViewer}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              {selectedDocument?.name || 'Documento'}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nome:</span>
                  <span className="font-medium">{selectedDocument.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data:</span>
                  <span className="font-medium">{new Date(selectedDocument.createdAt).toLocaleDateString('it-IT')}</span>
                </div>
                {selectedDocument.type && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo:</span>
                    <span className="font-medium">{selectedDocument.type}</span>
                  </div>
                )}
                {selectedDocument.fromClient !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fonte:</span>
                    <Badge variant="outline" className={selectedDocument.fromClient ? 'text-green-600' : 'text-blue-600'}>
                      {selectedDocument.fromClient ? 'Caricato da te' : 'Dalla clinica'}
                    </Badge>
                  </div>
                )}
              </div>
              
              {selectedDocument.description && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-1">Descrizione:</p>
                  <p className="text-gray-700">{selectedDocument.description}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowDocumentViewer(false)}>
                  Chiudi
                </Button>
                <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={() => handleDownloadDocument(selectedDocument)}>
                  <Download className="h-4 w-4 mr-2" />
                  Scarica
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== FIND CLINIC (Ricerca Cliniche con Google Maps) ====================
function FindClinic({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchService, setSearchService] = useState('');
  const [serviceCatalog, setServiceCatalog] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinicReviews, setClinicReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ overallRating: 5, punctuality: 5, competence: 5, price: 5, comment: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [maxDistance, setMaxDistance] = useState(50); // km
  const [mapCenter, setMapCenter] = useState({ lat: 45.4642, lng: 9.1900 }); // Milan default for Pilot
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  
  // Autocomplete states
  const [showClinicSuggestions, setShowClinicSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [allClinics, setAllClinics] = useState([]); // All clinics for autocomplete
  
  // Appointment request form
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({ date: '', time: '', service: '', notes: '', petId: '' });
  const [userPets, setUserPets] = useState([]);
  const [submittingAppointment, setSubmittingAppointment] = useState(false);
  
  // Dynamic slots state
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [clinicAvailability, setClinicAvailability] = useState(null);
  
  // File upload state for appointments
  const [appointmentFiles, setAppointmentFiles] = useState([]);

  // Load all clinics for autocomplete suggestions
  useEffect(() => {
    const loadAllClinics = async () => {
      try {
        const results = await api.get('clinics/search?');
        setAllClinics(results || []);
      } catch (error) {
        console.error('Error loading clinics:', error);
      }
    };
    loadAllClinics();
  }, []);

  // Get clinic name suggestions
  const getClinicSuggestions = () => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    const suggestions = new Set();
    allClinics.forEach(clinic => {
      if (clinic.clinicName && clinic.clinicName.toLowerCase().includes(query)) {
        suggestions.add(clinic.clinicName);
      }
      if (clinic.name && clinic.name.toLowerCase().includes(query)) {
        suggestions.add(clinic.name);
      }
    });
    return Array.from(suggestions).slice(0, 5);
  };

  // Get city suggestions
  const getCitySuggestions = () => {
    if (!searchCity || searchCity.length < 2) return [];
    const query = searchCity.toLowerCase();
    const suggestions = new Set();
    allClinics.forEach(clinic => {
      if (clinic.city && clinic.city.toLowerCase().includes(query)) {
        suggestions.add(clinic.city);
      }
    });
    // Add common Italian cities
    const commonCities = ['Milano', 'Roma', 'Napoli', 'Torino', 'Bologna', 'Firenze', 'Bari', 'Palermo', 'Genova', 'Padova', 'Verona', 'Brescia', 'Monza', 'Bergamo', 'Como'];
    commonCities.forEach(city => {
      if (city.toLowerCase().includes(query)) {
        suggestions.add(city);
      }
    });
    return Array.from(suggestions).slice(0, 5);
  };

  // Get service suggestions
  const getServiceSuggestions = () => {
    if (!searchService || searchService.length < 2) return [];
    const query = searchService.toLowerCase();
    const suggestions = [];
    serviceCatalog.forEach(service => {
      if (service.name && service.name.toLowerCase().includes(query)) {
        suggestions.push({ id: service.id, name: service.name });
      }
    });
    return suggestions.slice(0, 5);
  };

  const clinicSuggestions = getClinicSuggestions();
  const citySuggestions = getCitySuggestions();
  const serviceSuggestions = getServiceSuggestions();
  
  // Load user's pets for appointment form
  useEffect(() => {
    const loadUserPets = async () => {
      try {
        const pets = await api.get('pets');
        setUserPets(pets || []);
      } catch (error) {
        console.error('Error loading pets:', error);
      }
    };
    loadUserPets();
  }, []);
  
  // Load available slots when date changes
  const loadAvailableSlots = async (date) => {
    if (!selectedClinic?.id || !date) {
      setAvailableSlots([]);
      return;
    }
    
    setLoadingSlots(true);
    try {
      const response = await api.get(`clinics/${selectedClinic.id}/slots?date=${date}&serviceId=${appointmentForm.service || ''}`);
      setAvailableSlots(response.slots || []);
      setClinicAvailability(response);
    } catch (error) {
      console.error('Error loading slots:', error);
      // Fallback to generic time slots if API fails
      setAvailableSlots([
        { time: '09:00', available: true },
        { time: '09:30', available: true },
        { time: '10:00', available: true },
        { time: '10:30', available: true },
        { time: '11:00', available: true },
        { time: '11:30', available: true },
        { time: '14:00', available: true },
        { time: '14:30', available: true },
        { time: '15:00', available: true },
        { time: '15:30', available: true },
        { time: '16:00', available: true },
        { time: '16:30', available: true },
        { time: '17:00', available: true },
        { time: '17:30', available: true }
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };
  
  // Reload slots when date or clinic changes
  useEffect(() => {
    if (appointmentForm.date && selectedClinic?.id) {
      loadAvailableSlots(appointmentForm.date);
    }
  }, [appointmentForm.date, selectedClinic?.id]);
  
  const handleRequestAppointment = async () => {
    if (!appointmentForm.date || !appointmentForm.service) {
      alert('Seleziona data e servizio');
      return;
    }
    if (!appointmentForm.time) {
      alert('Seleziona un orario');
      return;
    }
    setSubmittingAppointment(true);
    try {
      await api.post('appointments/request', {
        clinicId: selectedClinic.id,
        clinicName: selectedClinic.clinicName,
        date: appointmentForm.date,
        time: appointmentForm.time,
        service: appointmentForm.service,
        notes: appointmentForm.notes,
        petId: appointmentForm.petId || null
      });
      alert('Richiesta inviata! La clinica ti contatterà per confermare.');
      setShowAppointmentForm(false);
      setAppointmentForm({ date: '', time: '', service: '', notes: '', petId: '' });
      setAvailableSlots([]);
      setSelectedClinic(null);
    } catch (error) {
      alert('Errore nell\'invio della richiesta');
    } finally {
      setSubmittingAppointment(false);
    }
  };

  // Load reviews when clinic is selected
  const loadClinicReviews = async (clinicId) => {
    setLoadingReviews(true);
    try {
      const res = await api.get(`clinics/${clinicId}/reviews`);
      setClinicReviews(res.reviews || res || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setClinicReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // When clinic is selected, load its reviews
  useEffect(() => {
    if (selectedClinic?.id) {
      loadClinicReviews(selectedClinic.id);
    } else {
      setClinicReviews([]);
    }
  }, [selectedClinic?.id]);

  // Load service catalog
  useEffect(() => {
    loadServiceCatalog();
  }, []);

  const loadServiceCatalog = async () => {
    try {
      const flat = await api.get('services/flat');
      setServiceCatalog(flat);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

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
      if (searchService && searchService !== 'all') params.append('service', searchService);
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
      loadClinicReviews(selectedClinic.id); // Reload reviews
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

  // Google Maps Component - Simple and Robust
  const GoogleMapsSection = () => {
    const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      return (
        <div className="h-[500px] bg-gradient-to-br from-blue-50 to-coral-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
          <MapPin className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Google Maps API key non configurata</p>
          <p className="text-sm text-gray-400 mt-2">Contatta l'amministratore per abilitare la mappa</p>
        </div>
      );
    }

    // Build clinic markers for embed
    const clinicsWithCoords = clinics.filter(c => c.latitude && c.longitude);
    
    return (
      <div className="relative">
        {/* Map Legend */}
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 shadow-sm"></div>
            <span className="text-gray-700">Cliniche VetBuddy</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm"></div>
              <span className="text-gray-700">La tua posizione</span>
            </div>
          )}
        </div>

        {/* Stats overlay */}
        <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-coral-600">{clinicsWithCoords.length}</div>
              <div className="text-xs text-gray-500">su mappa</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{clinics.length}</div>
              <div className="text-xs text-gray-500">totali</div>
            </div>
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden border shadow-lg">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '250px' }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/search?key=${GOOGLE_MAPS_API_KEY}&q=clinica+veterinaria${searchCity ? `+${encodeURIComponent(searchCity)}` : '+Milano'}&center=${mapCenter.lat},${mapCenter.lng}&zoom=13`}
          />
        </div>

        {/* Bottom instruction */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-4 py-2 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <PawPrint className="h-4 w-4 text-coral-500" />
            Clicca su una clinica nella mappa per i dettagli
          </span>
        </div>
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
            {/* Nome clinica con autocomplete */}
            <div className="flex-1 min-w-[200px] relative">
              <Label className="sr-only">Nome clinica</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input 
                  placeholder="Nome clinica o veterinario..." 
                  value={searchQuery} 
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowClinicSuggestions(true);
                  }}
                  onFocus={() => setShowClinicSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowClinicSuggestions(false), 200)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && searchClinics()}
                />
              </div>
              {/* Autocomplete suggestions for clinic name */}
              {showClinicSuggestions && clinicSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  {clinicSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-2 text-sm border-b border-gray-100 last:border-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(suggestion);
                        setShowClinicSuggestions(false);
                      }}
                    >
                      <Building2 className="h-3 w-3 text-gray-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Città con autocomplete */}
            <div className="w-48 relative">
              <Label className="sr-only">Città</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input 
                  placeholder="Città..." 
                  value={searchCity} 
                  onChange={(e) => {
                    setSearchCity(e.target.value);
                    setShowCitySuggestions(true);
                  }}
                  onFocus={() => setShowCitySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && searchClinics()}
                />
              </div>
              {/* Autocomplete suggestions for city */}
              {showCitySuggestions && citySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  {citySuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-2 text-sm border-b border-gray-100 last:border-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchCity(suggestion);
                        setShowCitySuggestions(false);
                      }}
                    >
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Servizi con autocomplete (input con dropdown) */}
            <div className="w-56 relative">
              <Label className="sr-only">Servizio</Label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input 
                  placeholder="Cerca servizio..." 
                  value={searchService} 
                  onChange={(e) => {
                    setSearchService(e.target.value);
                    setShowServiceSuggestions(true);
                  }}
                  onFocus={() => setShowServiceSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowServiceSuggestions(false), 200)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && searchClinics()}
                />
              </div>
              {/* Autocomplete suggestions for services */}
              {showServiceSuggestions && (searchService.length >= 2 ? serviceSuggestions : serviceCatalog.slice(0, 6)).length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                  {searchService.length < 2 && (
                    <div className="px-4 py-2 text-xs text-gray-500 border-b">Servizi popolari:</div>
                  )}
                  {(searchService.length >= 2 ? serviceSuggestions : serviceCatalog.slice(0, 6)).map((service, idx) => (
                    <button
                      key={service.id || idx}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-2 text-sm border-b border-gray-100 last:border-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchService(service.name || service);
                        setShowServiceSuggestions(false);
                      }}
                    >
                      <Stethoscope className="h-3 w-3 text-gray-400" />
                      <span>{service.name || service}</span>
                    </button>
                  ))}
                </div>
              )}
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
          {searchService && searchService !== 'all' && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="bg-coral-50 text-coral-700 border-coral-200">
                <Stethoscope className="h-3 w-3 mr-1" />
                {serviceCatalog.find(s => s.id === searchService)?.name || searchService}
                <button onClick={() => setSearchService('all')} className="ml-2 hover:text-coral-900">×</button>
              </Badge>
            </div>
          )}
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
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(clinic.avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{clinic.avgRating ? clinic.avgRating.toFixed(1) : '-'}</span>
                      <span className="text-xs text-gray-400">({clinic.reviewCount || 0})</span>
                    </div>
                    {clinic.googleRating && (
                      <div className="flex items-center gap-1 bg-gray-50 rounded px-1.5 py-0.5">
                        <svg className="h-3 w-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        <span className="text-xs font-medium">{clinic.googleRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : clinics.length === 0 ? (
        <Card className="border-dashed border-2 border-coral-200 bg-coral-50/50">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-4">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Pilot Milano</span>
            </div>
            <Building2 className="h-16 w-16 mx-auto mb-4 text-coral-300" />
            <h3 className="font-bold text-xl text-gray-800 mb-2">Nessuna clinica trovata nella tua zona</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Siamo in fase pilot e stiamo attivando le prime cliniche a Milano e provincia. 
              <br/>La tua clinica preferita non è ancora su VetBuddy?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-coral-500 hover:bg-coral-600" onClick={() => setSearchCity('Milano')}>
                <MapPin className="h-4 w-4 mr-2" />Cerca a Milano
              </Button>
              <Button variant="outline" className="border-coral-300 text-coral-700 hover:bg-coral-50">
                <Mail className="h-4 w-4 mr-2" />Invita la tua clinica
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Invitando la tua clinica ci aiuti a crescere e potresti ricevere vantaggi esclusivi!
            </p>
          </CardContent>
        </Card>
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
                  <div className="text-right space-y-1">
                    {/* Google Rating */}
                    {clinic.googleRating && (
                      <div className="flex items-center gap-1 justify-end bg-white border rounded-lg px-2 py-1">
                        <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        <span className="font-bold text-gray-800">{clinic.googleRating.toFixed(1)}</span>
                      </div>
                    )}
                    {/* VetBuddy Rating */}
                    <div className="flex items-center gap-1 justify-end">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${s <= Math.round(clinic.avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="font-bold text-gray-800">{clinic.avgRating ? clinic.avgRating.toFixed(1) : '-'}</span>
                      <span className="text-xs text-gray-500">({clinic.reviewCount || 0} recensioni)</span>
                    </div>
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
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // Show clinic location on map
                      if (clinic.latitude && clinic.longitude) {
                        window.open(`https://www.google.com/maps?q=${clinic.latitude},${clinic.longitude}`, '_blank');
                      } else if (clinic.address || clinic.city) {
                        const address = encodeURIComponent(`${clinic.clinicName || ''} ${clinic.address || ''} ${clinic.city || ''} Italia`.trim());
                        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                      }
                    }}
                    title="Vedi su Google Maps"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Clinic Detail Dialog */}
      <Dialog open={selectedClinic && !showReviewForm} onOpenChange={() => setSelectedClinic(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedClinic?.clinicName}</DialogTitle>
            <DialogDescription>{selectedClinic?.name}</DialogDescription>
          </DialogHeader>
          {selectedClinic && (
            <div className="space-y-4 mt-4">
              {/* Rating Summary */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{selectedClinic.avgRating ? selectedClinic.avgRating.toFixed(1) : 'N/D'}</div>
                  <div className="flex justify-center mt-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.round(selectedClinic.avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{selectedClinic.reviewCount || 0} recensioni VetBuddy</p>
                </div>
                {selectedClinic.googleRating && (
                  <div className="text-center border-l pl-4">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      <span className="font-bold text-xl">{selectedClinic.googleRating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-500">Google Reviews</p>
                  </div>
                )}
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

              {/* Payment & Cancellation Policy */}
              {(selectedClinic.paymentSettings?.methods?.length > 0 || selectedClinic.paymentSettings?.cancellationPolicy) && (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-500" />
                    Informazioni utili
                  </h4>
                  
                  {/* Payment Methods */}
                  {selectedClinic.paymentSettings?.methods?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">METODI DI PAGAMENTO ACCETTATI</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedClinic.paymentSettings.methods.includes('cash') && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            💵 Contanti
                          </Badge>
                        )}
                        {selectedClinic.paymentSettings.methods.includes('card') && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            💳 Carta
                          </Badge>
                        )}
                        {selectedClinic.paymentSettings.methods.includes('transfer') && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            🏦 Bonifico
                          </Badge>
                        )}
                        {selectedClinic.paymentSettings.methods.includes('online') && (
                          <Badge variant="outline" className="bg-coral-50 text-coral-700 border-coral-200">
                            🌐 Online
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Cancellation Policy */}
                  {selectedClinic.paymentSettings?.cancellationPolicy && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">POLICY DI CANCELLAZIONE</p>
                      <p className="text-sm text-gray-700">
                        {selectedClinic.paymentSettings.cancellationPolicy === 'free_24h' && '✅ Cancellazione gratuita fino a 24h prima'}
                        {selectedClinic.paymentSettings.cancellationPolicy === 'free_48h' && '✅ Cancellazione gratuita fino a 48h prima'}
                        {selectedClinic.paymentSettings.cancellationPolicy === 'penalty_30' && '⚠️ Penale 30% se cancelli meno di 24h prima'}
                        {selectedClinic.paymentSettings.cancellationPolicy === 'penalty_50' && '⚠️ Penale 50% se cancelli meno di 24h prima'}
                        {selectedClinic.paymentSettings.cancellationPolicy === 'no_refund_24h' && '❌ Nessun rimborso se cancelli meno di 24h prima'}
                        {selectedClinic.paymentSettings.cancellationPolicy === 'no_refund' && '❌ Nessun rimborso per cancellazioni'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Servizi e Prezzi della Clinica */}
              {(selectedClinic.services?.length > 0 || selectedClinic.customServices?.length > 0) && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-green-500" />
                    Servizi e Listino Prezzi
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {/* Standard Services */}
                    {selectedClinic.services?.filter(s => s.price).map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-green-100 last:border-0">
                        <span className="text-sm text-gray-700 capitalize">{service.id?.replace(/_/g, ' ') || service.name}</span>
                        <Badge className="bg-green-100 text-green-700 font-semibold">€{parseFloat(service.price).toFixed(2)}</Badge>
                      </div>
                    ))}
                    {/* Custom Services */}
                    {selectedClinic.customServices?.map((service, idx) => (
                      <div key={`custom-${idx}`} className="flex items-center justify-between py-2 border-b border-green-100 last:border-0">
                        <div>
                          <span className="text-sm text-gray-700">{service.name}</span>
                          {service.description && <p className="text-xs text-gray-500">{service.description}</p>}
                        </div>
                        <Badge className="bg-green-100 text-green-700 font-semibold">€{parseFloat(service.price).toFixed(2)}</Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 italic">* Prezzi indicativi, possono variare in base alla visita</p>
                </div>
              )}

              {/* Recensioni dei clienti */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Recensioni dei clienti
                </h4>
                {loadingReviews ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-500 border-t-transparent mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Caricamento recensioni...</p>
                  </div>
                ) : clinicReviews.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {clinicReviews.map((review, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 shadow-sm border border-yellow-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{review.ownerName || 'Cliente VetBuddy'}</p>
                              <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('it-IT')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`h-3 w-3 ${s <= review.overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>Puntualità: {review.punctuality}/5</span>
                          <span>Competenza: {review.competence}/5</span>
                          <span>Prezzo: {review.price}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Star className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nessuna recensione ancora</p>
                    <p className="text-xs text-gray-400">Sii il primo a lasciare una recensione!</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  className="w-full bg-coral-500 hover:bg-coral-600" 
                  size="lg"
                  onClick={() => setShowAppointmentForm(true)}
                >
                  <Calendar className="h-5 w-5 mr-2" />Richiedi appuntamento
                </Button>
                <div className="flex gap-3">
                  <Button className="flex-1" variant="outline" onClick={() => setShowReviewForm(true)}>
                    <Star className="h-4 w-4 mr-2" />Recensisci
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
                {selectedClinic.phone && (
                  <Button variant="ghost" className="text-blue-600" onClick={() => window.location.href = `tel:${selectedClinic.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />Chiama {selectedClinic.phone}
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

      {/* Dialog Richiesta Appuntamento */}
      <Dialog open={showAppointmentForm} onOpenChange={(open) => {
        setShowAppointmentForm(open);
        if (!open) {
          setAvailableSlots([]);
          setClinicAvailability(null);
          setAppointmentFiles([]);
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Richiedi Appuntamento</DialogTitle>
            <DialogDescription>
              Richiedi un appuntamento presso {selectedClinic?.clinicName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Data preferita *</Label>
              <Input 
                type="date" 
                value={appointmentForm.date}
                onChange={(e) => {
                  setAppointmentForm({...appointmentForm, date: e.target.value, time: ''});
                }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            {/* Dynamic Time Slots */}
            <div>
              <Label>Orario disponibile *</Label>
              {!appointmentForm.date ? (
                <p className="text-sm text-gray-500 mt-2 p-3 bg-gray-50 rounded-lg">
                  Seleziona prima una data per vedere gli orari disponibili
                </p>
              ) : loadingSlots ? (
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2 text-blue-500" />
                  <span className="text-sm text-gray-500">Caricamento orari...</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-700">
                    Nessun orario disponibile per questa data. Prova un'altra data.
                  </p>
                </div>
              ) : (
                <div className="mt-2">
                  {clinicAvailability?.workingHours && (
                    <p className="text-xs text-gray-500 mb-2">
                      Orario clinica: {clinicAvailability.workingHours.start} - {clinicAvailability.workingHours.end}
                      {clinicAvailability.workingHours.breakStart && ` (pausa ${clinicAvailability.workingHours.breakStart}-${clinicAvailability.workingHours.breakEnd})`}
                    </p>
                  )}
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setAppointmentForm({...appointmentForm, time: slot.time})}
                        className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                          appointmentForm.time === slot.time
                            ? 'bg-blue-500 text-white border-blue-500'
                            : slot.available
                              ? 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                  {clinicAvailability && (
                    <p className="text-xs text-gray-400 mt-2">
                      {clinicAvailability.availableCount} di {clinicAvailability.totalSlots} slot disponibili
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <Label>Servizio richiesto *</Label>
              <Select value={appointmentForm.service} onValueChange={(v) => setAppointmentForm({...appointmentForm, service: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona servizio" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {serviceCatalog.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {userPets.length > 0 && (
              <div>
                <Label>Per quale animale?</Label>
                <Select value={appointmentForm.petId || 'none'} onValueChange={(v) => setAppointmentForm({...appointmentForm, petId: v === 'none' ? '' : v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona animale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Non specificato</SelectItem>
                    {userPets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {getPetSpeciesInfo(pet.species).emoji} {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Note aggiuntive</Label>
              <textarea
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                placeholder="Descrivi brevemente il motivo della visita..."
              />
            </div>
            
            {/* Upload Documenti */}
            <div className="space-y-3">
              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documenti allegati (opzionale)
                </Label>
                <p className="text-xs text-gray-500 mb-2">
                  Carica referti precedenti, analisi del sangue, radiografie o altri documenti utili.
                </p>
              </div>
              
              {/* File List */}
              {appointmentFiles.length > 0 && (
                <div className="space-y-2">
                  {appointmentFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        {file.type?.includes('image') ? (
                          <ImageIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-green-600" />
                        )}
                        <span className="text-sm font-medium text-green-800 truncate max-w-32">{file.name}</span>
                        <span className="text-xs text-green-600">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => setAppointmentFiles(files => files.filter((_, i) => i !== index))}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload Button */}
              <label className="block">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
                    if (validFiles.length < files.length) {
                      alert('Alcuni file superano il limite di 10MB e sono stati esclusi');
                    }
                    setAppointmentFiles(prev => [...prev, ...validFiles]);
                    e.target.value = '';
                  }}
                />
                <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                  <Upload className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Carica file (PDF, JPG, PNG)</span>
                </div>
              </label>
              <p className="text-xs text-gray-400">Max 10MB per file</p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowAppointmentForm(false)}
              >
                Annulla
              </Button>
              <Button 
                className="flex-1 bg-coral-500 hover:bg-coral-600"
                onClick={handleRequestAppointment}
                disabled={submittingAppointment || !appointmentForm.date || !appointmentForm.time || !appointmentForm.service}
              >
                {submittingAppointment ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Invio...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" />Invia Richiesta</>
                )}
              </Button>
            </div>
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
          <NewBrandLogo size="sm" showText={false} />
          <div>
            <h1 className="font-bold"><span className="text-gray-900">vet</span><span className="text-coral-500">buddy</span></h1>
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

// ==================== ADMIN DASHBOARD ====================
function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, clinics: 0, owners: 0, pets: 0, appointments: 0, documents: 0 });
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [usersData, appointmentsData, petsData, documentsData] = await Promise.all([
        api.get('admin/users'),
        api.get('admin/appointments'),
        api.get('admin/pets'),
        api.get('admin/documents')
      ]);
      setUsers(usersData || []);
      setAppointments(appointmentsData || []);
      setPets(petsData || []);
      setDocuments(documentsData || []);
      
      const clinics = (usersData || []).filter(u => u.role === 'clinic');
      const owners = (usersData || []).filter(u => u.role === 'owner');
      setStats({
        users: (usersData || []).length,
        clinics: clinics.length,
        owners: owners.length,
        pets: (petsData || []).length,
        appointments: (appointmentsData || []).length,
        documents: (documentsData || []).length
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;
    try {
      await api.delete(`admin/users/${userId}`);
      loadAllData();
    } catch (error) {
      alert('Errore eliminazione: ' + error.message);
    }
  };

  const NavItem = ({ icon: Icon, label, value, badge }) => (
    <button onClick={() => { setActiveTab(value); setMobileMenuOpen(false); }} 
      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${activeTab === value ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
      <div className="flex items-center gap-3"><Icon className="h-5 w-5" />{label}</div>
      {badge > 0 && <Badge className="bg-purple-500 text-white text-xs">{badge}</Badge>}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <NewBrandLogo size="xs" showText={false} />
          <div>
            <h1 className="font-bold text-sm"><span className="text-gray-900">vet</span><span className="text-purple-600">buddy</span> <span className="text-purple-400">Admin</span></h1>
            <p className="text-xs text-gray-500">Pannello di controllo</p>
          </div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Dark backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-[55]" 
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className="md:hidden fixed left-0 right-0 top-[57px] bottom-0 bg-white z-[60] p-4 overflow-y-auto shadow-xl animate-in slide-in-from-top duration-200">
            <Badge className="mb-4 bg-purple-100 text-purple-700">👑 Amministratore</Badge>
            <nav className="space-y-1">
              <NavItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
              <NavItem icon={Users} label="Utenti" value="users" badge={stats.users} />
              <NavItem icon={Building2} label="Cliniche" value="clinics" badge={stats.clinics} />
              <NavItem icon={User} label="Proprietari" value="owners" badge={stats.owners} />
              <NavItem icon={Calendar} label="Appuntamenti" value="appointments" badge={stats.appointments} />
              <NavItem icon={PawPrint} label="Animali" value="pets" badge={stats.pets} />
              <NavItem icon={FileText} label="Documenti" value="documents" badge={stats.documents} />
            </nav>
            <Button variant="ghost" onClick={onLogout} className="mt-6 text-gray-600 w-full justify-start"><LogOut className="h-4 w-4 mr-2" />Esci</Button>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r p-4 flex-col flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <NewBrandLogo size="sm" showText={false} />
          <div>
            <h1 className="font-bold"><span className="text-gray-900">vet</span><span className="text-purple-600">buddy</span></h1>
            <p className="text-xs text-gray-500">Pannello Admin</p>
          </div>
        </div>
        <Badge className="mb-6 bg-purple-100 text-purple-700 justify-center">👑 Amministratore</Badge>
        
        <nav className="space-y-1 flex-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
          <NavItem icon={Users} label="Tutti gli Utenti" value="users" badge={stats.users} />
          <NavItem icon={Building2} label="Cliniche" value="clinics" badge={stats.clinics} />
          <NavItem icon={User} label="Proprietari" value="owners" badge={stats.owners} />
          <NavItem icon={Calendar} label="Appuntamenti" value="appointments" badge={stats.appointments} />
          <NavItem icon={PawPrint} label="Animali" value="pets" badge={stats.pets} />
          <NavItem icon={FileText} label="Documenti" value="documents" badge={stats.documents} />
        </nav>
        
        <Button variant="ghost" onClick={onLogout} className="mt-auto text-gray-600"><LogOut className="h-4 w-4 mr-2" />Esci</Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-500" />
              <p className="mt-2 text-gray-500">Caricamento dati...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div>
                <h1 className="text-2xl font-bold mb-6">📊 Dashboard Amministratore</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('users')}>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                      <p className="text-2xl font-bold">{stats.users}</p>
                      <p className="text-xs text-gray-500">Utenti totali</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('clinics')}>
                    <CardContent className="p-4 text-center">
                      <Building2 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                      <p className="text-2xl font-bold">{stats.clinics}</p>
                      <p className="text-xs text-gray-500">Cliniche</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('owners')}>
                    <CardContent className="p-4 text-center">
                      <User className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <p className="text-2xl font-bold">{stats.owners}</p>
                      <p className="text-xs text-gray-500">Proprietari</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('pets')}>
                    <CardContent className="p-4 text-center">
                      <PawPrint className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                      <p className="text-2xl font-bold">{stats.pets}</p>
                      <p className="text-xs text-gray-500">Animali</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('appointments')}>
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-8 w-8 mx-auto text-coral-500 mb-2" />
                      <p className="text-2xl font-bold">{stats.appointments}</p>
                      <p className="text-xs text-gray-500">Appuntamenti</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('documents')}>
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto text-indigo-500 mb-2" />
                      <p className="text-2xl font-bold">{stats.documents}</p>
                      <p className="text-xs text-gray-500">Documenti</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">🏥 Ultime Cliniche Registrate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {users.filter(u => u.role === 'clinic').slice(0, 5).map(clinic => (
                        <div key={clinic.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium">{clinic.clinicName || clinic.name}</p>
                            <p className="text-xs text-gray-500">{clinic.email}</p>
                          </div>
                          <Badge variant="outline">{clinic.city || 'N/A'}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">📅 Ultimi Appuntamenti</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {appointments.slice(0, 5).map(apt => (
                        <div key={apt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium">{apt.petName || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{apt.service}</p>
                          </div>
                          <Badge className={apt.status === 'confermato' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {apt.date}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">👥 Tutti gli Utenti</h1>
                  <Badge variant="outline">{users.length} totali</Badge>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-medium">Nome</th>
                            <th className="text-left p-4 font-medium">Email</th>
                            <th className="text-left p-4 font-medium">Ruolo</th>
                            <th className="text-left p-4 font-medium">Data</th>
                            <th className="text-left p-4 font-medium">Azioni</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u.id} className="border-t">
                              <td className="p-4">{u.name || u.clinicName || '-'}</td>
                              <td className="p-4 text-gray-600">{u.email}</td>
                              <td className="p-4">
                                <Badge className={
                                  u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                  u.role === 'clinic' ? 'bg-blue-100 text-blue-700' :
                                  'bg-green-100 text-green-700'
                                }>{u.role}</Badge>
                              </td>
                              <td className="p-4 text-gray-500 text-sm">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('it-IT') : '-'}</td>
                              <td className="p-4">
                                {u.role !== 'admin' && (
                                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteUser(u.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'clinics' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">🏥 Cliniche</h1>
                  <Badge variant="outline">{stats.clinics} registrate</Badge>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.filter(u => u.role === 'clinic').map(clinic => (
                    <Card key={clinic.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold">{clinic.clinicName || clinic.name}</h3>
                            <p className="text-sm text-gray-500">{clinic.email}</p>
                            <p className="text-sm text-gray-500 mt-1"><MapPin className="h-3 w-3 inline mr-1" />{clinic.city || 'N/A'}</p>
                            {clinic.phone && <p className="text-sm text-gray-500"><Phone className="h-3 w-3 inline mr-1" />{clinic.phone}</p>}
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteUser(clinic.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'owners' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">👤 Proprietari</h1>
                  <Badge variant="outline">{stats.owners} registrati</Badge>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.filter(u => u.role === 'owner').map(owner => (
                    <Card key={owner.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold">{owner.name}</h3>
                            <p className="text-sm text-gray-500">{owner.email}</p>
                            {owner.phone && <p className="text-sm text-gray-500"><Phone className="h-3 w-3 inline mr-1" />{owner.phone}</p>}
                            {owner.city && <p className="text-sm text-gray-500"><MapPin className="h-3 w-3 inline mr-1" />{owner.city}</p>}
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteUser(owner.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">📅 Tutti gli Appuntamenti</h1>
                  <Badge variant="outline">{appointments.length} totali</Badge>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-medium">Data</th>
                            <th className="text-left p-4 font-medium">Ora</th>
                            <th className="text-left p-4 font-medium">Animale</th>
                            <th className="text-left p-4 font-medium">Servizio</th>
                            <th className="text-left p-4 font-medium">Stato</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map(apt => (
                            <tr key={apt.id} className="border-t">
                              <td className="p-4">{apt.date}</td>
                              <td className="p-4">{apt.time}</td>
                              <td className="p-4">{apt.petName || '-'}</td>
                              <td className="p-4">{apt.service}</td>
                              <td className="p-4">
                                <Badge className={
                                  apt.status === 'confermato' ? 'bg-green-100 text-green-700' :
                                  apt.status === 'completato' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }>{apt.status}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'pets' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">🐾 Tutti gli Animali</h1>
                  <Badge variant="outline">{pets.length} registrati</Badge>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pets.map(pet => (
                    <Card key={pet.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                            {pet.species === 'Cane' ? <Dog className="h-6 w-6 text-orange-600" /> : <Cat className="h-6 w-6 text-orange-600" />}
                          </div>
                          <div>
                            <h3 className="font-bold">{pet.name}</h3>
                            <p className="text-sm text-gray-500">{pet.species} • {pet.breed || 'N/A'}</p>
                            {pet.microchip && <p className="text-xs text-gray-400">Chip: {pet.microchip}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">📄 Tutti i Documenti</h1>
                  <Badge variant="outline">{documents.length} caricati</Badge>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-medium">Nome</th>
                            <th className="text-left p-4 font-medium">Tipo</th>
                            <th className="text-left p-4 font-medium">Animale</th>
                            <th className="text-left p-4 font-medium">Stato</th>
                            <th className="text-left p-4 font-medium">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documents.map(doc => (
                            <tr key={doc.id} className="border-t">
                              <td className="p-4 font-medium">{doc.name}</td>
                              <td className="p-4">{doc.type || '-'}</td>
                              <td className="p-4">{doc.petName || '-'}</td>
                              <td className="p-4">
                                <Badge variant="outline">{doc.status}</Badge>
                              </td>
                              <td className="p-4 text-sm text-gray-500">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('it-IT') : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [googleOAuthResult, setGoogleOAuthResult] = useState(null);
  const [emailAction, setEmailAction] = useState(null);
  const [verificationState, setVerificationState] = useState(null); // For email/phone verification flow
  const [resetPasswordToken, setResetPasswordToken] = useState(null); // For password reset flow

  // Save email action params to sessionStorage for after login
  useEffect(() => { 
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      // Password reset handling
      const resetToken = params.get('reset');
      if (resetToken) {
        setResetPasswordToken(resetToken);
        window.history.replaceState({}, '', window.location.pathname);
      }
      
      // Email verification handling
      const verifyEmailToken = params.get('verify_email');
      if (verifyEmailToken) {
        handleEmailVerification(verifyEmailToken);
        window.history.replaceState({}, '', window.location.pathname);
      }
      
      // Google OAuth handling
      if (params.get('google_success')) {
        setGoogleOAuthResult({ success: true, message: 'Google Calendar connesso con successo!' });
        window.history.replaceState({}, '', window.location.pathname);
      } else if (params.get('google_error')) {
        setGoogleOAuthResult({ success: false, message: 'Errore: ' + params.get('google_error') });
        window.history.replaceState({}, '', window.location.pathname);
      }
      
      // Email action handling - SAVE to sessionStorage for after login
      const action = params.get('action');
      if (action) {
        const emailActionData = {
          action: action,
          appointmentId: params.get('appointmentId'),
          clinicId: params.get('clinicId'),
          petId: params.get('petId'),
          reason: params.get('reason'),
          // New parameters for enhanced email actions
          serviceType: params.get('serviceType'),
          amount: params.get('amount'),
          docId: params.get('docId'),
          rewardId: params.get('rewardId'),
          use: params.get('use') === 'true',
          newMessage: params.get('newMessage') === 'true'
        };
        // Save to sessionStorage so it persists after login
        sessionStorage.setItem('vetbuddy_email_action', JSON.stringify(emailActionData));
        // Clear URL immediately
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    checkAuth(); 
  }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (token) { 
      try { 
        const userData = await api.get('auth/me'); 
        setUser(userData);
        // After successful auth, check for pending email action
        loadPendingEmailAction();
      } catch (error) { 
        localStorage.removeItem('vetbuddy_token'); 
        api.token = null; 
      } 
    }
    setLoading(false);
  };

  // Load pending email action from sessionStorage (after login)
  const loadPendingEmailAction = () => {
    if (typeof window !== 'undefined') {
      const savedAction = sessionStorage.getItem('vetbuddy_email_action');
      if (savedAction) {
        try {
          const actionData = JSON.parse(savedAction);
          setEmailAction(actionData);
          // Clear from sessionStorage after loading
          sessionStorage.removeItem('vetbuddy_email_action');
        } catch (e) {
          sessionStorage.removeItem('vetbuddy_email_action');
        }
      }
    }
  };

  const handleLogin = (userData) => { 
    setUser(userData); 
    // Load pending email action after login
    loadPendingEmailAction();
    if (!localStorage.getItem('vetbuddy_welcomed_' + userData.id)) { 
      setShowWelcome(true); 
    } 
  };

  // Handle email verification from URL
  const handleEmailVerification = async (token) => {
    setVerificationState({ status: 'verifying', message: 'Verifica email in corso...' });
    try {
      const result = await api.post('auth/verify-email', { token });
      if (result.success) {
        if (result.alreadyVerified) {
          setVerificationState({ 
            status: 'already_verified', 
            message: 'Email già verificata! Puoi accedere al tuo account.'
          });
        } else {
          setVerificationState({ 
            status: 'email_verified', 
            message: result.message,
            requiresPhoneVerification: result.requiresPhoneVerification,
            userId: result.userId
          });
        }
      }
    } catch (error) {
      setVerificationState({ 
        status: 'error', 
        message: error.message || 'Errore durante la verifica'
      });
    }
  };

  const handleWelcomeContinue = async () => { 
    localStorage.setItem('vetbuddy_welcomed_' + user.id, 'true'); 
    setShowWelcome(false);
    // For owners: check if they have pets, if not redirect to pets tab to add first pet
    if (user.role === 'owner') {
      try {
        const pets = await api.get('pets');
        if (!pets || pets.length === 0) {
          // Set flag to show add pet dialog when entering dashboard
          sessionStorage.setItem('vetbuddy_show_add_pet', 'true');
        }
      } catch (error) {
        console.error('Error checking pets:', error);
      }
    }
  };
  const handleLogout = () => { localStorage.removeItem('vetbuddy_token'); api.token = null; setUser(null); setShowWelcome(false); sessionStorage.removeItem('vetbuddy_email_action'); };

  // Show Google OAuth result toast
  useEffect(() => {
    if (googleOAuthResult) {
      alert(googleOAuthResult.success ? '✅ ' + googleOAuthResult.message : '❌ ' + googleOAuthResult.message);
      setGoogleOAuthResult(null);
    }
  }, [googleOAuthResult]);

  const clearEmailAction = () => {
    setEmailAction(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-coral-50"><div className="text-center"><NewBrandLogo size="lg" /><p className="mt-4 text-coral-700">Caricamento...</p></div></div>;
  
  // Show password reset screen if token present
  if (resetPasswordToken) {
    return <ResetPasswordScreen token={resetPasswordToken} onComplete={() => setResetPasswordToken(null)} />;
  }
  
  // Show verification screen if needed
  if (verificationState) {
    return <VerificationScreen state={verificationState} onComplete={() => setVerificationState(null)} />;
  }
  
  // Render main content with ChatWidget
  const renderContent = () => {
    if (!user) return <LandingPage onLogin={handleLogin} />;
    if (user.role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} />;
    if (showWelcome) return <WelcomeScreen user={user} onContinue={handleWelcomeContinue} />;
    if (user.role === 'clinic') return <ClinicDashboard user={user} onLogout={handleLogout} googleOAuthResult={googleOAuthResult} emailAction={emailAction} onClearEmailAction={clearEmailAction} />;
    if (user.role === 'staff') return <StaffDashboard user={user} onLogout={handleLogout} />;
    return <OwnerDashboard user={user} onLogout={handleLogout} emailAction={emailAction} onClearEmailAction={clearEmailAction} />;
  };
  
  return (
    <>
      {renderContent()}
      {user && <ChatWidget />}
    </>
  );
}
// Mobile responsive update Wed Feb 11 18:07:23 UTC 2026
// Admin panel deploy Wed Feb 11 19:34:40 UTC 2026
// Deploy trigger: Fri Feb 13 13:39:04 UTC 2026
