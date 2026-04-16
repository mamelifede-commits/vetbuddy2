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
import { EcosystemToggle, FeatureCarousel, HomepageMapSection } from '@/app/components/landing';
import NewBrandLogo from '@/app/components/shared/NewBrandLogo';
import api from '@/app/lib/api';
import {
  Calendar, CalendarCheck, CalendarDays, FileText, FileCheck, Users, Send, Building2, Phone, PawPrint, Zap, Shield, Heart, MessageCircle, Bell,
  CheckCircle, ChevronRight, Menu, X, ClipboardList, Settings, Inbox, Search, TrendingUp, Upload, Download,
  Star, Check, AlertCircle, Video, Euro, Receipt, Syringe, Activity,
  MapPin, Globe, Stethoscope, Mail, Clock, User, Gift, Link2, Info,
  Loader2, Ticket, MousePointerClick, FlaskConical
} from 'lucide-react';

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
              <button onClick={() => scrollToSection('ricette-elettroniche')} className="text-emerald-600 hover:text-emerald-700 font-medium transition">💊 REV</button>
              <button onClick={() => scrollToSection('premi')} className="text-gray-600 hover:text-coral-500 transition">Premi</button>
              <button onClick={() => scrollToSection('pilot')} className="text-gray-600 hover:text-coral-500 transition">Prezzi</button>
              <button onClick={() => scrollToSection('lab-marketplace')} className="text-purple-600 hover:text-purple-700 font-medium transition">🧪 Lab</button>
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
              <button onClick={() => { scrollToSection('ricette-elettroniche'); setMobileMenuOpen(false); }} className="text-emerald-600 text-left py-2 hover:text-emerald-700 font-medium transition">💊 Ricette REV</button>
              <button onClick={() => { scrollToSection('premi'); setMobileMenuOpen(false); }} className="text-gray-600 text-left py-2 hover:text-coral-500 transition">Premi</button>
              <button onClick={() => { scrollToSection('pilot'); setMobileMenuOpen(false); }} className="text-gray-600 text-left py-2 hover:text-coral-500 transition">Prezzi</button>
              <button onClick={() => { scrollToSection('lab-marketplace'); setMobileMenuOpen(false); }} className="text-purple-600 text-left py-2 hover:text-purple-700 font-medium transition">🧪 Laboratori</button>
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
            <span className="text-coral-500">Cliniche veterinarie</span> e <span className="text-blue-500">proprietari di pet</span> in un&apos;unica piattaforma
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
            Gestisci appuntamenti, documenti e comunicazione tra cliniche, proprietari e <span className="text-purple-600 font-medium">laboratori di analisi</span>. Zero carta, zero caos.
          </p>
          
          {/* CTA Buttons - Glassmorphism */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-coral-200/50 hover:bg-white/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group animate-fade-in-left animate-delay-300 flex flex-col" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <div className="h-14 w-14 bg-gradient-to-br from-coral-400 to-coral-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition shadow-lg">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Per Cliniche Veterinarie</h3>
              <p className="text-sm text-gray-600 mb-3 flex-1">Dashboard completa, inbox team, documenti, reportistica.</p>
              <p className="text-xs text-amber-600 font-semibold mb-3">🎫 Pro Clinica: €0 per 90 giorni — poi €79/mese + IVA</p>
              <Button className="w-full bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white shadow-lg mt-auto">
                Richiedi Invito →
              </Button>
            </div>
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-violet-200/50 hover:bg-white/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group animate-fade-in-up animate-delay-300 flex flex-col" onClick={() => { setAuthMode('register-lab'); setShowAuth(true); }}>
              <div className="h-14 w-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition shadow-lg">
                <FlaskConical className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Per Laboratori di Analisi</h3>
              <p className="text-sm text-gray-600 mb-3 flex-1">Ricevi richieste, gestisci referti, connettiti con le cliniche.</p>
              <p className="text-xs text-violet-600 font-semibold mb-3">🧪 Gratis per 6 mesi — poi €29/mese + IVA</p>
              <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg mt-auto">
                Registra il tuo Lab →
              </Button>
            </div>
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-blue-200/50 hover:bg-white/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group animate-fade-in-right animate-delay-300 flex flex-col" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition shadow-lg">
                <PawPrint className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Per Proprietari di Animali</h3>
              <p className="text-sm text-gray-600 mb-3 flex-1">Prenota visite, ricevi documenti, invita la tua clinica.</p>
              <p className="text-xs text-blue-600 font-semibold mb-3">🆓 Gratis per sempre • Invita la tua clinica</p>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg mt-auto">
                Iscriviti Gratis →
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
                <p className="text-xs text-gray-600">Registrati come clinica e inizia con il <span className="font-bold text-purple-600">Piano Starter €0/mese</span>. Ideale per gestire i tuoi clienti in autonomia!</p>
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

      {/* MARKETPLACE LABORATORI - NEW */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50/30 overflow-hidden" id="lab-marketplace">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-4">
              <FlaskConical className="h-4 w-4" />
              <span className="font-medium">Novità</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Marketplace <span className="text-purple-500">Laboratori di Analisi</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connetti la tua clinica con i migliori laboratori di analisi veterinarie. Confronta prezzi, tempi di refertazione e servizi offerti.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Illustrazione Marketplace */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-50 rounded-2xl shadow-lg border border-purple-200 p-8 relative overflow-hidden">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <FlaskConical className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-sm">VetLab Milano</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Ematologia • Biochimica</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600 font-medium">da €25</span>
                      <span className="text-xs text-blue-600">24-48h</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <FlaskConical className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-sm">BioVet Roma</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Citologia • Istologia</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600 font-medium">da €45</span>
                      <span className="text-xs text-blue-600">48-72h</span>
                    </div>
                  </div>
                  <div className="col-span-2 bg-white/80 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="h-8 w-8 bg-purple-400 rounded-full border-2 border-white flex items-center justify-center"><FlaskConical className="h-3 w-3 text-white" /></div>
                        <div className="h-8 w-8 bg-indigo-400 rounded-full border-2 border-white flex items-center justify-center"><FlaskConical className="h-3 w-3 text-white" /></div>
                        <div className="h-8 w-8 bg-violet-400 rounded-full border-2 border-white flex items-center justify-center"><FlaskConical className="h-3 w-3 text-white" /></div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Lab partner in crescita</p>
                        <p className="text-xs text-gray-500">Trova il laboratorio ideale per la tua clinica</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Search className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Cerca e Confronta</h4>
                    <p className="text-sm text-gray-600">Filtra per tipo di esame, città, tempi di refertazione, servizio di ritiro campioni e prezzi indicativi.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Link2 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Collegamento Diretto</h4>
                    <p className="text-sm text-gray-600">Richiedi un collegamento al laboratorio. Una volta accettato, invia richieste di analisi direttamente dalla dashboard.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Referti Digitali con Revisione</h4>
                    <p className="text-sm text-gray-600">I referti arrivano in piattaforma. Li revisioni, aggiungi note cliniche e li invii al proprietario con un click.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Euro className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Prezzi Trasparenti</h4>
                    <p className="text-sm text-gray-600">Ogni laboratorio pubblica il suo listino prezzi indicativo. Confronta e scegli il partner ideale per la tua clinica.</p>
                  </div>
                </li>
              </ul>

              <div className="flex gap-3">
                <Button className="bg-purple-500 hover:bg-purple-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
                  Esplora il Marketplace →
                </Button>
                <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50" onClick={() => { setAuthMode('register-lab'); setShowAuth(true); }}>
                  Registra il tuo Lab
                </Button>
              </div>
            </div>
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
            <p className="text-gray-400 max-w-2xl mx-auto">vetbuddy non è solo un gestionale. È una piattaforma che connette cliniche e proprietari, semplifica la comunicazione e migliora la cura degli animali.</p>
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
              Passa a vetbuddy senza perdere nulla. Importa in pochi click i dati dal tuo gestionale attuale.
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
                  <p className="text-gray-600 text-sm">Esporta dal tuo gestionale e carica su vetbuddy. Supportiamo tutti i formati comuni.</p>
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
                  <p className="text-gray-600 text-sm">Carica referti ed esami. vetbuddy li associa automaticamente ai pazienti giusti.</p>
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
              Crea fatture direttamente in vetbuddy ed esportale nel formato che preferisci. 
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
                Crea le fatture in vetbuddy ed esportale in CSV, JSON o PDF. 
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
                  <h3 className="text-xl font-bold text-gray-900">Sistema Integrato vetbuddy</h3>
                  <p className="text-sm text-emerald-600">Tutto in un unico posto</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Gestisci tutto direttamente in vetbuddy: listino prezzi, creazione fatture, 
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
              📋 Come Funziona: Da vetbuddy al Tuo Software
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Crea Fattura</p>
                <p className="text-xs text-gray-500">Seleziona cliente e prestazioni in vetbuddy</p>
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
                ⚠️ <strong>Nota importante:</strong> Le fatture vetbuddy sono <strong>pre-fatture/proforma</strong>. 
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

      {/* ====== SEZIONE RICETTE ELETTRONICHE VETERINARIE (REV) ====== */}
      <section id="ricette-elettroniche" className="py-16 px-4 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/30 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-4 font-semibold text-sm">
              💊 NUOVA FUNZIONALITÀ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ricette Elettroniche Veterinarie
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Gestisci l&apos;intero ciclo della prescrizione veterinaria direttamente da VetBuddy. 
              Dalla creazione alla pubblicazione al proprietario, con integrazione al sistema nazionale <strong>Vetinfo</strong>.
            </p>
          </div>

          {/* Due modalità: Bridge e API */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Modalità Bridge/Manuale */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">ATTIVO</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Modalità Ponte</h3>
                  <p className="text-xs text-gray-500">Subito operativa, zero configurazione</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Crea la prescrizione su VetBuddy, emettila sul portale ufficiale Vetinfo, e registra il numero ricetta e PIN nel sistema. 
                Il proprietario riceve tutto automaticamente.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  'Wizard guidato per creare la bozza di prescrizione',
                  'Checklist per l\'emissione sul portale Vetinfo',
                  'Registrazione N° Ricetta e PIN dal portale',
                  'Pubblicazione automatica al proprietario',
                  'Notifica email al proprietario con dettagli farmaci',
                  'Audit trail completo di ogni passaggio',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Integrazione API Vetinfo */}
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-6 shadow-sm relative overflow-hidden opacity-90">
              <div className="absolute top-0 right-0 bg-gray-400 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">PROSSIMAMENTE</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Integrazione API Diretta</h3>
                  <p className="text-xs text-gray-500">Emissione automatica senza uscire da VetBuddy</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Quando le credenziali ufficiali saranno configurate, VetBuddy emetterà la ricetta direttamente tramite 
                le API del Sistema Nazionale Vetinfo. Tutto in un unico click.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  'Emissione diretta dalla dashboard VetBuddy',
                  'Recupero automatico N° ricetta e PIN',
                  'Validazione dati in tempo reale',
                  'Gestione errori e retry automatico',
                  'Log completo delle comunicazioni API',
                  'Conformità normativa garantita',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-400">
                    <Clock className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Flusso REV: 4 Step */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Come funziona in 4 passaggi</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { num: '01', icon: '📝', title: 'Crea la bozza', desc: 'Wizard guidato: seleziona paziente, proprietario, farmaci, posologia e diagnosi.' },
                { num: '02', icon: '🌐', title: 'Emetti su Vetinfo', desc: 'Segui la checklist per emettere la ricetta sul portale ufficiale Vetinfo.' },
                { num: '03', icon: '📋', title: 'Registra in VetBuddy', desc: 'Inserisci il numero ricetta e PIN ricevuti. Lo stato si aggiorna automaticamente.' },
                { num: '04', icon: '📧', title: 'Pubblica al proprietario', desc: 'Con un click il proprietario riceve email + vede la prescrizione nel profilo pet.' },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <div className="text-xs font-bold text-emerald-600 mb-1">STEP {step.num}</div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{step.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chi vede cosa */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="h-5 w-5 text-emerald-600" />
                <h4 className="font-bold text-emerald-800">Veterinario</h4>
              </div>
              <ul className="text-sm text-gray-700 space-y-1.5">
                {['Crea, modifica e emette prescrizioni', 'Dashboard con statistiche giornaliere', 'Registra manualmente N° e PIN', 'Pubblica al proprietario con note cliniche', 'Audit trail di ogni azione'].map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{f}</li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-blue-600" />
                <h4 className="font-bold text-blue-800">Staff Clinica</h4>
              </div>
              <ul className="text-sm text-gray-700 space-y-1.5">
                {['Visualizza elenco prescrizioni', 'Filtra per stato e paziente', 'Stampa dettagli prescrizione', 'Accesso in sola lettura all\'audit trail'].map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />{f}</li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-amber-600" />
                <h4 className="font-bold text-amber-800">Proprietario</h4>
              </div>
              <ul className="text-sm text-gray-700 space-y-1.5">
                {['Vede solo le prescrizioni pubblicate', 'Dettagli farmaci, posologia e durata', 'Numero ricetta e PIN per la farmacia', 'Tutto nel profilo del pet', 'Notifica email automatica'].map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />{f}</li>
                ))}
              </ul>
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

      {/* Abbonamento VetBuddy */}
      <section id="pilot" className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-4 font-semibold text-sm">
              <MapPin className="h-4 w-4" />
              Pilot Milano
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Abbonamento VetBuddy</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Accesso su invito per cliniche selezionate e onboarding gratuito per i primi laboratori partner.</p>
            <p className="text-xs text-gray-400 mt-3">Prezzi IVA esclusa.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 items-start">
            {/* 1. Starter Clinica */}
            <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-md relative flex flex-col">
              <CardHeader className="pt-6 pb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Starter Clinica</p>
                <div className="mt-1">
                  <span className="text-3xl font-black text-gray-800">€0</span><span className="text-sm text-gray-400">/mese</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Per veterinari freelance e micro-cliniche in fase di valutazione.</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-0">
                <ul className="space-y-2 text-xs mb-5">
                  {['1 sede', '1 utente', 'Fino a 30 richieste/mese', 'Profilo pubblico', 'Link diretto di prenotazione', 'Agenda base'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> <span className="text-gray-700">{f}</span></li>
                  ))}
                </ul>
                <div className="mt-auto pt-3 border-t">
                  <Button className="w-full bg-gray-700 hover:bg-gray-800 text-sm" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Richiedi invito</Button>
                  <p className="text-xs text-gray-400 mt-2 text-center">Disponibile solo per cliniche ammesse al Pilot Milano.</p>
                </div>
              </CardContent>
            </Card>
            
            {/* 2. Pro Clinica — EVIDENZIATO */}
            <Card className="border-2 border-coral-500 relative shadow-2xl flex flex-col ring-2 ring-coral-200 bg-gradient-to-b from-white to-coral-50/30">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-coral-500 to-orange-500 text-white text-xs px-4 py-1.5 rounded-full font-bold whitespace-nowrap shadow-lg">Consigliato</div>
              <CardHeader className="pt-7 pb-3">
                <p className="text-xs font-semibold text-coral-500 uppercase tracking-wider mb-1">Pro Clinica</p>
                <div className="mt-1">
                  <span className="text-3xl font-black text-gray-900">€0</span><span className="text-sm text-gray-500 ml-1">per 90 giorni</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Poi <span className="font-bold text-gray-800">€79/mese</span> + IVA</p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                  <p className="text-xs font-semibold text-amber-700">Early adopter Pilot Milano: <span className="text-amber-900">€49/mese + IVA</span> per le prime cliniche selezionate.</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">Il piano principale per cliniche veterinarie che vogliono digitalizzare prenotazioni, agenda, documenti e rapporto con i clienti.</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-0">
                <ul className="space-y-2 text-xs mb-4">
                  {['Fino a 10 staff', 'Prenotazioni online', 'Agenda digitale', 'Reminder email automatici', 'Documenti e PDF via email', 'Ricette Elettroniche REV', 'Google Calendar sync', 'Report e analytics', 'Link prenotazione + QR code', 'Dashboard valore generato', 'Modulo richieste lab analisi', 'Accesso marketplace laboratori', 'Confronto lab per distanza e prezzi'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-coral-500 flex-shrink-0" /> <span className="text-gray-700">{f}</span></li>
                  ))}
                </ul>
                <div className="bg-coral-50 border border-coral-200 rounded-lg px-3 py-2.5 mb-4">
                  <p className="text-xs text-coral-700 font-medium leading-relaxed">Questo mese VetBuddy ti mostra quante prenotazioni ha generato e quante telefonate ti ha evitato.</p>
                </div>
                <div className="mt-auto pt-3 border-t">
                  <Button className="w-full bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 text-sm font-bold shadow-lg" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Richiedi accesso Pilot</Button>
                  <p className="text-xs text-gray-400 mt-2 text-center leading-relaxed">90 giorni gratuiti per cliniche selezionate. Estendibile fino a 6 mesi per cliniche attive.</p>
                </div>
              </CardContent>
            </Card>

            {/* 3. Laboratorio Partner */}
            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all hover:shadow-md relative flex flex-col bg-gradient-to-b from-white to-blue-50/30">
              <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap">Per Laboratori</div>
              <CardHeader className="pt-6 pb-3">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Laboratorio Partner</p>
                <div className="mt-1">
                  <span className="text-3xl font-black text-gray-800">€0</span><span className="text-sm text-gray-500 ml-1">per 6 mesi</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Poi <span className="font-bold text-gray-800">€29/mese</span> + IVA</p>
                <p className="text-xs text-gray-500 mt-2">Per laboratori di analisi veterinaria che vogliono ricevere richieste dalle cliniche e caricare referti su VetBuddy.</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-0">
                <ul className="space-y-2 text-xs mb-4">
                  {['Dashboard laboratorio', 'Profilo nel marketplace', 'Listino prezzi indicativo', 'Tempi medi di refertazione', 'Servizio ritiro campioni', 'Ricezione richieste da cliniche', 'Gestione stati richiesta', 'Upload referti PDF', 'Storico richieste e referti', 'Notifiche email'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" /> <span className="text-gray-700">{f}</span></li>
                  ))}
                </ul>
                <div className="mt-auto pt-3 border-t space-y-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm" onClick={() => { setAuthMode('register-lab'); setShowAuth(true); }}>Registrati gratis</Button>
                  <p className="text-xs text-gray-400 text-center leading-relaxed">Gratis per 6 mesi o fino a 50 richieste gestite. Poi €29/mese + IVA.</p>
                </div>
              </CardContent>
            </Card>
            
            {/* 4. Enterprise */}
            <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-md flex flex-col">
              <CardHeader className="pt-6 pb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Enterprise</p>
                <div className="mt-1">
                  <span className="text-3xl font-black text-gray-800">Custom</span><span className="text-sm text-gray-400 ml-1">+ IVA</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Per gruppi veterinari, cliniche multi-sede e network di laboratori.</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-0">
                <ul className="space-y-2 text-xs mb-5">
                  {['Multi-sede illimitate', 'Laboratori multipli', 'API dedicata', 'SLA garantito', 'Onboarding dedicato', 'Reportistica avanzata', 'Gestione centralizzata', 'Integrazioni personalizzate'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" /> <span className="text-gray-700">{f}</span></li>
                  ))}
                </ul>
                <div className="mt-auto pt-3 border-t">
                  <Button className="w-full bg-gray-700 hover:bg-gray-800 text-sm" onClick={() => scrollToSection('contatti')}>Contattaci</Button>
                  <p className="text-xs text-gray-400 mt-2 text-center">Soluzione su misura per gruppi e network veterinari.</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-sm text-gray-500 mt-8 max-w-xl mx-auto">Non è una prova libera: stiamo selezionando cliniche e laboratori partner per validare VetBuddy nel Pilot Milano.</p>
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
              { q: 'Il piano Pro Clinica è davvero gratis per 90 giorni?', a: 'Sì, per le cliniche selezionate nel Pilot Milano.' },
              { q: 'Cosa succede dopo i 90 giorni?', a: 'Il piano passa a €79/mese + IVA, con tariffa early adopter di €49/mese + IVA per le prime cliniche selezionate.' },
              { q: 'I laboratori possono iscriversi anche senza invito?', a: 'Sì, possono registrarsi gratuitamente come Laboratorio Partner e attendere approvazione.' },
              { q: 'I prezzi includono IVA?', a: 'No, tutti i prezzi indicati sono IVA esclusa.' },
              { q: 'Cos\'è il Pilot e come funziona l\'invito?', a: 'vetbuddy è in fase Pilot a Milano. L\'accesso è su invito per garantire qualità e supporto dedicato. Candidati compilando il form e ti contatteremo per l\'attivazione.' },
              { q: 'Quanto costa per i proprietari?', a: 'vetbuddy è e sarà sempre gratuito per i proprietari di animali. Nessun costo nascosto, mai.' },
              { q: 'Come funziona l\'invio documenti?', a: 'Carichi un PDF (referto, prescrizione, fattura), selezioni cliente e animale, e il documento viene inviato automaticamente via email. Il cliente lo ritrova anche nell\'app.' },
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
          <p className="text-coral-100 mb-8 text-lg">Siamo in fase pilot a Milano. Invita il tuo veterinario a unirsi a vetbuddy!</p>
          <Button size="lg" className="bg-white text-coral-500 hover:bg-coral-50 h-14 px-8 text-lg" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
            <Mail className="h-5 w-5 mr-2" />Invita la tua clinica
          </Button>
        </div>
      </section>

      {/* Footer */}
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
          <p className="text-center text-gray-500 text-xs mt-4">© 2026 vetbuddy. Tutti i diritti riservati.</p>
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

export default FullLandingPage;
