'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MessageSquare, FileText, Zap, Heart,
  Phone, Clock, Video, Bell, CreditCard, BarChart3, PawPrint,
  Smartphone, Gift, Check, Star, Users, MapPin, Shield, Sparkles,
  ChevronRight, Mail, ArrowRight, Building2, Inbox, Send,
  TrendingUp, CalendarCheck, Upload, Download, Stethoscope,
  Bot, Syringe, Activity, Award, Target, Rocket, Globe
} from 'lucide-react';
import Link from 'next/link';

// vetbuddy Logo - New Brand Style 4 (Minimal with coral box)
const VetBuddyLogo = ({ size = 40, white = false, showText = false }) => {
  const boxSize = size;
  const iconSize = Math.round(size * 0.55);
  const padding = Math.round(size * 0.2);
  const borderRadius = Math.round(size * 0.35);
  const textSize = size >= 50 ? 'text-2xl' : size >= 35 ? 'text-xl' : 'text-lg';
  
  return (
    <div className={`flex items-center gap-2`}>
      <div 
        className={`${white ? 'bg-white/20' : 'bg-gradient-to-br from-coral-500 to-rose-500'} flex items-center justify-center shadow-lg ${!white ? 'shadow-coral-500/30' : ''}`}
        style={{
          width: boxSize,
          height: boxSize,
          padding: padding,
          borderRadius: borderRadius
        }}
      >
        <PawPrint 
          className={white ? 'text-white' : 'text-white'} 
          style={{ width: iconSize, height: iconSize }}
        />
      </div>
      {showText && (
        <div className={`font-bold ${textSize}`}>
          <span className={white ? 'text-white' : 'text-gray-900'}>vet</span>
          <span className={white ? 'text-white/80' : 'text-coral-500'}>buddy</span>
        </div>
      )}
    </div>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, value]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, color = 'coral', items = [], badge = null }) => {
  const colorMap = {
    coral: 'from-coral-400 to-coral-600 shadow-coral-200',
    blue: 'from-blue-400 to-blue-600 shadow-blue-200',
    purple: 'from-purple-400 to-purple-600 shadow-purple-200',
    green: 'from-green-400 to-green-600 shadow-green-200',
    amber: 'from-amber-400 to-amber-600 shadow-amber-200',
    indigo: 'from-indigo-400 to-indigo-600 shadow-indigo-200',
  };

  return (
    <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/50">
      {badge && (
        <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-lg">
          {badge}
        </div>
      )}
      <div className={`h-16 w-16 bg-gradient-to-br ${colorMap[color]} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-coral-50 text-coral-700 text-xs px-3 py-1.5 rounded-full font-medium">
              <Check className="h-3 w-3" /> {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Automation Item Component
const AutomationItem = ({ icon: Icon, title, description, delay = 0 }) => (
  <div 
    className="flex items-start gap-4 p-5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/50"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

export default function PresentazionePage() {
  return (
    <div className="min-h-screen">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen bg-gradient-to-br from-coral-500 via-coral-400 to-orange-400 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-coral-300/10 rounded-full blur-3xl"></div>
          {/* Floating shapes */}
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/20 rounded-2xl rotate-12 animate-float"></div>
          <div className="absolute bottom-32 left-20 w-12 h-12 bg-white/15 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-white/10 rounded-lg rotate-45 animate-float" style={{animationDelay: '0.5s'}}></div>
        </div>

        {/* Header */}
        <header className="relative z-50 py-6 px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <VetBuddyLogo size={36} white showText={true} />
            </Link>
            <Link 
              href="/" 
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-2.5 rounded-full font-semibold hover:bg-white/30 transition-all"
            >
              Accedi alla Piattaforma
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full mb-8 border border-white/30">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Il Gestionale Veterinario del Futuro</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Automatizza la tua clinica.<br/>
            <span className="text-white/90">Cura più animali.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
            vetbuddy elimina la burocrazia quotidiana con <strong>44+ automazioni intelligenti</strong>. 
            Agenda, documenti, comunicazioni e pagamenti in un'unica piattaforma.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {[
              { value: 90, suffix: '%', label: 'Burocrazia Eliminata' },
              { value: 44, suffix: '+', label: 'Automazioni Attive' },
              { value: 2, suffix: 'h', label: 'Risparmio al Giorno' },
              { value: 100, suffix: '%', label: 'Gratuito per Proprietari' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <div className="text-4xl md:text-5xl font-black text-white mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white/80 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="animate-bounce">
            <div className="w-8 h-12 border-2 border-white/50 rounded-full mx-auto flex justify-center">
              <div className="w-2 h-3 bg-white/80 rounded-full mt-2 animate-pulse"></div>
            </div>
            <p className="text-white/60 text-sm mt-2">Scorri per scoprire di più</p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ==================== CHI SIAMO ==================== */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-6 font-medium">
            <Target className="h-4 w-4" />
            La Nostra Missione
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Meno burocrazia, più tempo per <span className="text-coral-500">curare</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            vetbuddy nasce per risolvere un problema reale: i veterinari passano troppo tempo 
            in attività amministrative. La nostra piattaforma automatizza tutto ciò che può essere 
            automatizzato, permettendoti di concentrarti su ciò che ami fare: <strong>curare gli animali</strong>.
          </p>
        </div>
      </section>

      {/* ==================== COME FUNZIONA ==================== */}
      <section className="py-20 px-6 bg-gradient-to-br from-coral-50 via-orange-50 to-amber-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-6 font-medium">
              <Rocket className="h-4 w-4" />
              Inizia in 15 Minuti
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Come <span className="text-coral-500">Funziona</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Dalla registrazione all'operatività completa in pochi semplici passi
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-24 left-[12%] right-[12%] h-1 bg-gradient-to-r from-coral-300 via-orange-300 to-amber-300 rounded-full"></div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { num: '01', icon: Users, title: 'Registrati', desc: 'Crea il tuo account in 2 minuti. Nessuna carta di credito richiesta.' },
                { num: '02', icon: Building2, title: 'Configura', desc: 'Aggiungi i tuoi servizi, prezzi, orari e personalizza il profilo clinica.' },
                { num: '03', icon: Upload, title: 'Importa', desc: 'Carica i tuoi pazienti esistenti da CSV o aggiungili manualmente.' },
                { num: '04', icon: Rocket, title: 'Parti!', desc: 'Ricevi prenotazioni e gestisci tutto dalla dashboard unificata.' },
              ].map((step, i) => (
                <div key={i} className="relative text-center group">
                  <div className="relative z-10 w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform border-4 border-coral-100">
                    <step.icon className="h-10 w-10 text-coral-500" />
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-coral-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {step.num}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FUNZIONALITÀ PRINCIPALI ==================== */}
      <section className="py-20 px-6 bg-gradient-to-br from-coral-500 via-coral-400 to-orange-400 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-300/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full mb-6 font-medium backdrop-blur-sm">
              <Zap className="h-4 w-4" />
              Funzionalità Complete
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Tutto ciò di cui hai bisogno
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Una piattaforma completa per gestire ogni aspetto della tua clinica veterinaria
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Calendar}
              title="Agenda Intelligente"
              description="Calendario con vista giornaliera, settimanale e mensile. Drag & drop, colori per veterinario, promemoria automatici."
              color="blue"
              items={['Multi-veterinario', 'Drag & drop', 'Sync Google']}
            />
            <FeatureCard 
              icon={Inbox}
              title="Team Inbox"
              description="Tutti i messaggi dei clienti in un unico posto. Sistema ticket, assegnazione staff, quick replies e storico completo."
              color="purple"
              items={['Ticket system', 'Anti-doppioni', 'Template']}
              badge="⭐ Più richiesto"
            />
            <FeatureCard 
              icon={FileText}
              title="Documenti Cloud"
              description="Carica referti, prescrizioni e fatture. Invio automatico via email. Firma digitale integrata. Zero carta."
              color="green"
              items={['Upload drag&drop', 'Invio 1-click', 'Firma digitale']}
            />
            <FeatureCard 
              icon={Video}
              title="Video Consulto HD"
              description="Consulenze online professionali. Un click per iniziare. Nessun software da installare per il cliente."
              color="indigo"
              items={['Qualità HD', '1-click start', 'Recording']}
            />
            <FeatureCard 
              icon={CreditCard}
              title="Fatturazione Pro"
              description="Crea preventivi e fatture PROFORMA in secondi. Export CSV per il commercialista. Pagamenti Stripe."
              color="amber"
              items={['Preventivi', 'Fatture', 'Export CSV']}
            />
            <FeatureCard 
              icon={BarChart3}
              title="Analytics & Report"
              description="Dashboard con KPI in tempo reale. Monitora visite, fatturato, no-show, nuovi clienti e trend mensili."
              color="coral"
              items={['KPI dashboard', 'Report no-show', 'Trend']}
            />
          </div>
        </div>
      </section>

      {/* ==================== 44+ AUTOMAZIONI ==================== */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full mb-6 font-medium backdrop-blur-sm border border-white/20">
              <Bot className="h-4 w-4" />
              Intelligenza Artificiale
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">44+ Automazioni</span> che lavorano per te
            </h2>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto">
              Mentre ti occupi dei pazienti, vetbuddy gestisce automaticamente comunicazioni, promemoria e follow-up
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <AutomationItem 
              icon={Bell}
              title="Promemoria Appuntamenti"
              description="SMS/Email/WhatsApp 24h e 1h prima dell'appuntamento. Riduzione no-show fino al 70%."
              delay={0}
            />
            <AutomationItem 
              icon={Syringe}
              title="Richiami Vaccini"
              description="Notifiche automatiche quando un vaccino sta per scadere. Mai più richiami dimenticati."
              delay={100}
            />
            <AutomationItem 
              icon={Heart}
              title="Auguri Compleanno Pet"
              description="Email personalizzata con sconto per il compleanno dell'animale. +40% retention."
              delay={200}
            />
            <AutomationItem 
              icon={Activity}
              title="Follow-up Post Visita"
              description="Messaggio automatico 48h dopo la visita per verificare lo stato del paziente."
              delay={300}
            />
            <AutomationItem 
              icon={Star}
              title="Richiesta Recensioni"
              description="Invito automatico a lasciare una recensione dopo ogni visita completata."
              delay={400}
            />
            <AutomationItem 
              icon={Gift}
              title="Premi Fedeltà"
              description="Sistema punti automatico: i clienti accumulano punti ad ogni visita e li convertono in sconti."
              delay={500}
            />
            <AutomationItem 
              icon={Mail}
              title="Invio Documenti"
              description="Referti e prescrizioni inviati automaticamente via email al proprietario."
              delay={600}
            />
            <AutomationItem 
              icon={TrendingUp}
              title="Report Settimanali"
              description="Riepilogo automatico ogni lunedì: appuntamenti, fatturato, nuovi clienti."
              delay={700}
            />
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm text-white px-8 py-4 rounded-2xl border border-white/20">
              <div className="text-4xl font-black">-80%</div>
              <div className="text-left">
                <div className="font-bold">Telefonate ridotte</div>
                <div className="text-purple-200 text-sm">grazie alle automazioni</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DUE ECOSISTEMI ==================== */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-6 font-medium">
              <Globe className="h-4 w-4" />
              Un Ecosistema Completo
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Due mondi, <span className="text-coral-500">una piattaforma</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              vetbuddy connette cliniche veterinarie e proprietari di animali in un'unica esperienza fluida
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Per Cliniche */}
            <div className="relative bg-gradient-to-br from-coral-500 to-orange-500 rounded-3xl p-8 text-white overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Per le Cliniche Veterinarie</h3>
                <p className="text-white/90 mb-6">Tutto ciò che serve per gestire la tua clinica in modo efficiente e moderno.</p>
                <ul className="space-y-3">
                  {[
                    'Dashboard "cosa fare oggi" in 10 secondi',
                    'Team Inbox con assegnazione ticket',
                    'Documenti → email automatica al cliente',
                    'Posizione su mappa con indicazioni',
                    'Report finanziari e analytics completi',
                    '44+ automazioni attive 24/7'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-white/95">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="font-bold text-lg">Pilot Milano 2025</p>
                  <p className="text-white/80 text-sm">90 giorni gratuiti per cliniche selezionate</p>
                </div>
              </div>
            </div>

            {/* Per Proprietari */}
            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <PawPrint className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Per i Proprietari di Animali</h3>
                <p className="text-white/90 mb-6">La salute del tuo animale sempre sotto controllo, gratuitamente.</p>
                <ul className="space-y-3">
                  {[
                    'Registra tutti i tuoi animali con foto',
                    'Prenota visite in pochi click, 24/7',
                    'Ricevi referti e prescrizioni via email',
                    'Promemoria vaccini automatici',
                    'Trova cliniche sulla mappa vicino a te',
                    'Accumula punti fedeltà ad ogni visita'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-white/95">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="font-bold text-lg">100% Gratuito</p>
                  <p className="text-white/80 text-sm">Per sempre, nessun costo nascosto</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ANIMALI SUPPORTATI ==================== */}
      <section className="py-16 px-6 bg-gradient-to-br from-coral-50 to-orange-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Per <span className="text-coral-500">tutti</span> gli animali
            </h2>
            <p className="text-gray-600">vetbuddy supporta qualsiasi tipo di paziente</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { emoji: '🐕', name: 'Cani', color: 'from-amber-400 to-orange-500' },
              { emoji: '🐱', name: 'Gatti', color: 'from-purple-400 to-pink-500' },
              { emoji: '🐴', name: 'Cavalli', color: 'from-amber-500 to-amber-700' },
              { emoji: '🐰', name: 'Conigli', color: 'from-pink-400 to-rose-500' },
              { emoji: '🦜', name: 'Uccelli', color: 'from-green-400 to-emerald-500' },
              { emoji: '🦎', name: 'Rettili', color: 'from-teal-400 to-cyan-500' },
            ].map((animal, i) => (
              <div key={i} className={`bg-gradient-to-br ${animal.color} rounded-2xl p-5 text-center text-white shadow-lg hover:scale-105 transition-transform`}>
                <div className="text-4xl mb-2">{animal.emoji}</div>
                <div className="font-semibold text-sm">{animal.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PREZZI ==================== */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-6 font-medium">
              <Award className="h-4 w-4" />
              Prezzi Trasparenti
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Scegli il piano <span className="text-coral-500">giusto</span> per te
            </h2>
            <p className="text-gray-600 text-lg">
              Inizia gratis, scala quando vuoi. Nessun vincolo contrattuale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-gray-50 rounded-3xl p-8 border-2 border-gray-100 hover:border-coral-200 transition-all hover:shadow-xl">
              <div className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wider">Starter</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-black text-gray-900">€0</span>
                <span className="text-gray-400">/mese</span>
              </div>
              <p className="text-gray-500 mb-8">Perfetto per iniziare</p>
              <div className="space-y-4 mb-8">
                {['Fino a 50 pazienti', 'Agenda base', 'Posizione su mappa', '5 Automazioni', 'Supporto email'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/" className="block text-center py-4 px-6 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition">
                Inizia gratis
              </Link>
            </div>

            {/* Professional */}
            <div className="bg-gradient-to-br from-coral-500 to-orange-500 rounded-3xl p-8 text-white relative scale-105 shadow-2xl">
              <div className="absolute -top-4 right-6 bg-white text-coral-600 text-xs px-4 py-1.5 rounded-full font-bold shadow-lg">
                🔥 Consigliato
              </div>
              <div className="text-white/80 text-sm font-semibold mb-2 uppercase tracking-wider">Professional</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-black">€129</span>
                <span className="text-white/70">/mese + IVA</span>
              </div>
              <p className="text-white/80 mb-8">Per cliniche in crescita</p>
              <div className="space-y-4 mb-8">
                {['Pazienti illimitati', '20 Automazioni', 'Team Inbox + ticket', 'Documenti + invio email', 'Google Calendar sync', 'Video Consulto', 'Report settimanali'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/95">
                    <div className="h-5 w-5 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/" className="block text-center py-4 px-6 bg-white text-coral-600 rounded-xl font-bold hover:bg-white/90 transition shadow-lg">
                Richiedi invito
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-gray-50 rounded-3xl p-8 border-2 border-gray-100 hover:border-coral-200 transition-all hover:shadow-xl">
              <div className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wider">Enterprise</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-black text-gray-900">Custom</span>
              </div>
              <p className="text-gray-500 mb-8">Per grandi strutture</p>
              <div className="space-y-4 mb-8">
                {['Multi-sede', '44+ Automazioni', 'WhatsApp Business', 'API dedicata', 'SLA 99.9%', 'Account manager'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              <a href="mailto:info@vetbuddy.it" className="block text-center py-4 px-6 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition">
                Contattaci
              </a>
            </div>
          </div>

          <p className="text-center text-gray-400 text-sm mt-10">
            Piano Pilot disponibile su invito per cliniche selezionate a Milano
          </p>
        </div>
      </section>

      {/* ==================== CTA FINALE ==================== */}
      <section className="py-24 px-6 bg-gradient-to-br from-coral-500 via-coral-400 to-orange-400 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex justify-center">
            <VetBuddyLogo size={70} white showText={true} />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-8 mb-6">
            Pronto a rivoluzionare<br/>la tua clinica?
          </h2>
          <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto">
            Unisciti alle cliniche che hanno già scelto vetbuddy. 
            Inizia il tuo percorso verso una gestione più efficiente oggi stesso.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 bg-white text-coral-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/90 transition-all shadow-2xl hover:shadow-xl hover:-translate-y-1"
          >
            Inizia Gratuitamente
            <ArrowRight className="h-6 w-6" />
          </Link>
          <p className="text-white/70 text-sm mt-6">
            Nessuna carta di credito richiesta • Setup in 15 minuti
          </p>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="py-12 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <VetBuddyLogo size={28} white showText={true} />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400 text-sm">
              <a href="mailto:info@vetbuddy.it" className="hover:text-white transition">info@vetbuddy.it</a>
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/termini" className="hover:text-white transition">Termini</Link>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 vetbuddy. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>

      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(12deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
