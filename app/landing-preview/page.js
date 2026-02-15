'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from '@/app/components/auth';
import { EcosystemToggle, FeatureCarousel, HomepageMapSection } from '@/app/components/landing';
import { VetBuddyLogo } from '@/app/components/common';
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

// ==================== FULL LANDING PAGE ====================

export default function FullLandingPage() {
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
      {/* Preview Banner */}
      <div className="bg-purple-600 text-white text-center py-2 px-4 text-sm font-medium">
        <span>🔍 <strong>ANTEPRIMA</strong> - Landing page completa (nascosta al pubblico)</span>
      </div>
      
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

      {/* Trova Clinica Section */}
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
              <strong> vetbuddy lavora mentre tu curi gli animali.</strong>
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

          {/* Striscia 44+ automazioni */}
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

          {/* Automazioni cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Follow-up post visita */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">💬 Follow-up Post Visita</h3>
              <p className="text-gray-600 text-sm mb-3">24h dopo la visita, il cliente riceve un messaggio per verificare come sta il pet.</p>
              <div className="bg-amber-50 rounded-lg p-3 text-sm">
                <span className="text-amber-700 font-medium">💡 Effetto:</span>
                <span className="text-amber-600"> Clienti più soddisfatti</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FATTURAZIONE PROFORMA */}
      <section id="fatturazione" className="py-16 px-4 bg-gradient-to-br from-amber-50 via-white to-orange-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-4">
              <Receipt className="h-4 w-4" />
              <span className="font-medium">Fatturazione semplificata</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fatture <span className="text-amber-600">proforma</span> in un click
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Genera fatture proforma professionali in pochi secondi. Export per il commercialista, pagamenti online integrati.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">PDF Professionale</h3>
              <p className="text-gray-600 text-sm">Genera PDF con logo clinica, dati fiscali, dettaglio prestazioni.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Pagamento Online</h3>
              <p className="text-gray-600 text-sm">Stripe integrato. Il cliente paga prima della visita, tu riduci i no-show.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Export Fiscale</h3>
              <p className="text-gray-600 text-sm">Export CSV/JSON per il commercialista. Tutto pronto per la fatturazione elettronica.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PREMI E FIDELIZZAZIONE */}
      <section id="premi" className="py-16 px-4 bg-gradient-to-br from-pink-50 via-white to-purple-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full mb-4">
              <Gift className="h-4 w-4" />
              <span className="font-medium">Fidelizzazione clienti</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Premi e <span className="text-pink-600">punti fedeltà</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              I proprietari accumulano punti con ogni visita. Tu crei premi personalizzati per farli tornare.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="h-4 w-4 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Punti automatici</h4>
                    <p className="text-sm text-gray-600">I clienti accumulano punti ad ogni visita completata</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Gift className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Premi personalizzabili</h4>
                    <p className="text-sm text-gray-600">Crea sconti, gadget o servizi gratuiti come premio</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Clienti fedeli</h4>
                    <p className="text-sm text-gray-600">+40% di ritorno grazie al programma fedeltà</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-pink-200">
              <div className="text-center mb-4">
                <div className="h-16 w-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-900">Esempio Premio</h3>
              </div>
              <div className="bg-pink-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-1">🎁 Visita di controllo gratuita</p>
                <p className="text-sm text-gray-600 mb-2">Raggiungi 500 punti e ottieni una visita gratis!</p>
                <div className="flex items-center gap-2">
                  <Progress value={75} className="flex-1" />
                  <span className="text-sm font-medium text-pink-600">375/500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PILOT */}
      <section id="pilot" className="py-16 px-4 bg-gradient-to-br from-coral-50 via-white to-amber-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-4">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Pilot Milano</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Prezzi <span className="text-coral-500">trasparenti</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nessun costo nascosto. Piano Starter gratuito per sempre. Premium con 90 giorni gratis durante il pilot.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
              <div className="text-center mb-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Starter</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">€0</div>
                <p className="text-sm text-gray-500">Gratis per sempre</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Dashboard base</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Agenda appuntamenti</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Messaggistica clienti</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <X className="h-4 w-4" />
                  <span>Automazioni avanzate</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Inizia Gratis</Button>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-coral-500 to-orange-500 rounded-2xl p-6 shadow-xl text-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 text-xs px-3 py-1 rounded-full font-bold">
                🎁 90 GIORNI GRATIS
              </div>
              <div className="text-center mb-6 mt-2">
                <h3 className="font-bold text-xl mb-2">Premium</h3>
                <div className="text-4xl font-bold mb-1">€49<span className="text-lg font-normal">/mese</span></div>
                <p className="text-sm text-coral-100">Poi €49/mese • Disdici quando vuoi</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4" />
                  <span>Tutto di Starter</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4" />
                  <span>44+ automazioni</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4" />
                  <span>Video consulti</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4" />
                  <span>Report avanzati</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4" />
                  <span>Supporto prioritario</span>
                </li>
              </ul>
              <Button className="w-full bg-white text-coral-600 hover:bg-coral-50">Richiedi Invito →</Button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
              <div className="text-center mb-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">Custom</div>
                <p className="text-sm text-gray-500">Per gruppi e catene</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Multi-sede</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>API personalizzate</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Account manager dedicato</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Formazione team</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Contattaci</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <NewBrandLogo size="md" className="mb-4 [&_span]:text-white" />
              <p className="text-gray-400 text-sm">Il gestionale veterinario che connette cliniche e proprietari.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Prodotto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#funzionalita" className="hover:text-white transition">Funzionalità</a></li>
                <li><a href="#automazioni" className="hover:text-white transition">Automazioni</a></li>
                <li><a href="#pilot" className="hover:text-white transition">Prezzi</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Risorse</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/tutorial/cliniche" className="hover:text-white transition">Tutorial Cliniche</a></li>
                <li><a href="/tutorial/proprietari" className="hover:text-white transition">Tutorial Proprietari</a></li>
                <li><a href="/presentazione" className="hover:text-white transition">Brochure</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legale</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/termini" className="hover:text-white transition">Termini di Servizio</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© 2025 vetbuddy. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? '🔐 Accedi' : '📝 Registrati'}</DialogTitle>
            <DialogDescription>
              {pendingAction ? getActionMessage() : (authMode === 'login' ? 'Accedi al tuo account' : 'Crea un nuovo account')}
            </DialogDescription>
          </DialogHeader>
          <AuthForm mode={authMode} setMode={setAuthMode} onLogin={() => setShowAuth(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
