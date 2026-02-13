'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, ChevronRight, Check, Star, Clock, TrendingUp, 
  Users, Calendar, MessageSquare, FileText, Shield, Zap, Heart,
  Phone, Mail, MapPin, Award, Target, Sparkles, ArrowRight,
  Video, Bell, CreditCard, BarChart3, PawPrint, Play, Pause,
  Smartphone, Globe, Lock, Headphones, Gift, MousePointer, ChevronDown,
  Stethoscope, Syringe, Clipboard, Receipt, Send, UserPlus, Search
} from 'lucide-react';
import Link from 'next/link';

// VetBuddy Logo
const VetBuddyLogo = ({ size = 40, white = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="62" rx="18" ry="16" fill={white ? "#ffffff" : "#FF6B6B"}/>
    <ellipse cx="28" cy="38" rx="10" ry="12" fill={white ? "#ffffff" : "#FF6B6B"}/>
    <ellipse cx="50" cy="28" rx="10" ry="12" fill={white ? "#ffffff" : "#FF6B6B"}/>
    <ellipse cx="72" cy="38" rx="10" ry="12" fill={white ? "#ffffff" : "#FF6B6B"}/>
  </svg>
);

// Animated Counter
const AnimatedCounter = ({ end, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, end]);
  
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

// Floating Gradient Blob
const GradientBlob = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-30 animate-pulse ${className}`} />
);

// Feature Screenshot Card
const FeatureScreenshot = ({ title, description, icon: Icon, gradient, features, isReversed }) => (
  <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-16 items-center py-16`}>
    <div className="flex-1 space-y-6">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${gradient} text-white text-sm font-medium`}>
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">{description}</h3>
      <ul className="space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-gray-600">
            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            {f}
          </li>
        ))}
      </ul>
    </div>
    <div className="flex-1 relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-3xl transform rotate-3 scale-95 opacity-20`} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-gray-400 ml-2">vetbuddy.it</span>
        </div>
        <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-[280px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className={`h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="h-10 w-10 text-white" />
            </div>
            <p className="text-gray-500 font-medium">{title}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Timeline Step
const TimelineStep = ({ number, title, description, isLast }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-coral-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
        {number}
      </div>
      {!isLast && <div className="w-0.5 h-full bg-gradient-to-b from-coral-300 to-transparent mt-2" />}
    </div>
    <div className="pb-12">
      <h4 className="font-bold text-lg text-gray-900">{title}</h4>
      <p className="text-gray-600 mt-1">{description}</p>
    </div>
  </div>
);

// Pricing Card
const PricingCard = ({ name, price, period, features, cta, highlighted, badge }) => (
  <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${highlighted ? 'border-2 border-coral-500 shadow-xl shadow-coral-500/20' : 'border border-gray-200 hover:shadow-xl'}`}>
    {badge && (
      <div className="absolute top-0 right-0">
        <div className="bg-gradient-to-r from-coral-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
          {badge}
        </div>
      </div>
    )}
    <CardContent className="p-8">
      <h3 className="text-xl font-bold text-gray-900">{name}</h3>
      <div className="mt-4 mb-6">
        <span className="text-4xl font-bold text-gray-900">{price}</span>
        {period && <span className="text-gray-500 ml-1">{period}</span>}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-600">{f}</span>
          </li>
        ))}
      </ul>
      <Button className={`w-full ${highlighted ? 'bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600' : 'bg-gray-900 hover:bg-gray-800'}`}>
        {cta}
      </Button>
    </CardContent>
  </Card>
);

export default function PresentazionePage() {
  const [activeTab, setActiveTab] = useState(0);
  
  const handlePrint = () => window.print();

  const stats = [
    { value: 90, suffix: '%', label: 'Burocrazia Eliminata' },
    { value: 2, suffix: 'h', label: 'Risparmio al Giorno' },
    { value: 44, suffix: '+', label: 'Automazioni Attive' },
    { value: 100, suffix: '%', label: 'Clienti Soddisfatti' },
  ];

  const clinicFeatures = [
    { icon: Calendar, title: 'Agenda Intelligente', gradient: 'from-blue-500 to-cyan-500', description: 'Gestisci tutti gli appuntamenti in un click', features: ['Vista giornaliera, settimanale, mensile', 'Drag & drop per spostare appuntamenti', 'Colori per tipo visita e veterinario', 'Promemoria automatici via email/SMS'] },
    { icon: Bell, title: '44+ Automazioni', gradient: 'from-orange-500 to-amber-500', description: 'Lavora meno, ottieni di più', features: ['Richiami vaccini automatici', 'Follow-up post visita', 'Auguri compleanno pet', 'Notifiche WhatsApp (Twilio)'] },
    { icon: FileText, title: 'Documenti Cloud', gradient: 'from-green-500 to-emerald-500', description: 'Zero carta, massima efficienza', features: ['Upload drag & drop', 'Firma digitale integrata', 'Invio automatico via email', 'Archiviazione sicura illimitata'] },
    { icon: MessageSquare, title: 'Team Inbox', gradient: 'from-purple-500 to-violet-500', description: 'Tutti i messaggi in un posto', features: ['Sistema ticket integrato', 'Quick replies predefinite', 'Assegnazione a veterinari', 'Storico conversazioni completo'] },
    { icon: Video, title: 'Video Consulto HD', gradient: 'from-red-500 to-pink-500', description: 'Consulenze online professionali', features: ['Qualità HD senza lag', 'Link automatico al cliente', 'Nessun software da installare', 'Registrazione opzionale'] },
    { icon: Receipt, title: 'Fatturazione PROFORMA', gradient: 'from-indigo-500 to-blue-500', description: 'Preventivi e fatture in secondi', features: ['Template personalizzabili', 'IVA calcolata automaticamente', 'Export CSV per commercialista', 'Storico fatture completo'] },
  ];

  const ownerFeatures = [
    { icon: PawPrint, title: 'Profilo Animale Completo', desc: 'Registra tutti i tuoi animali con foto, peso, allergie, microchip. Supporta cani, gatti, conigli, uccelli, rettili, cavalli e altro.' },
    { icon: Calendar, title: 'Prenotazione Facile', desc: 'Prenota visite in pochi click. Scegli clinica, servizio, data e orario. Conferma immediata via email.' },
    { icon: FileText, title: 'Documenti Sempre Disponibili', desc: 'Accedi a referti, prescrizioni e fatture ovunque. Scarica PDF, consultali anche offline.' },
    { icon: Bell, title: 'Promemoria Smart', desc: 'Non dimenticare mai un vaccino o un controllo. Notifiche automatiche per appuntamenti e scadenze.' },
    { icon: MapPin, title: 'Trova la Clinica Perfetta', desc: 'Mappa interattiva con tutte le cliniche registrate. Filtra per città, servizi e valutazioni.' },
    { icon: Gift, title: 'Guadagna Punti', desc: 'Accumula punti con ogni visita. 100 punti = €5 di sconto. Invita amici per bonus extra.' },
  ];

  const timeline = [
    { title: 'Registrati in 2 minuti', desc: 'Crea il tuo account clinica e completa il profilo con i dati della struttura.' },
    { title: 'Configura i servizi', desc: 'Aggiungi i servizi offerti, i prezzi e gli orari di apertura.' },
    { title: 'Importa i pazienti', desc: 'Carica la lista pazienti da CSV o aggiungili manualmente.' },
    { title: 'Inizia a ricevere prenotazioni', desc: 'I clienti possono prenotare online. Tu gestisci tutto dalla dashboard.' },
  ];

  const pricing = [
    { name: 'Starter', price: '€0', period: '/mese', features: ['Fino a 50 pazienti', 'Agenda base', 'Posizione su mappa', '5 Automazioni base', 'Supporto email'], cta: 'Inizia Gratis', highlighted: false },
    { name: 'Professional', price: '€129', period: '/mese + IVA', badge: 'Più Popolare', features: ['Pazienti illimitati', '20 Automazioni', 'Team Inbox + ticket', 'Documenti + invio email', 'Google Calendar sync', 'Report settimanali', 'Video Consulto'], cta: 'Richiedi Invito', highlighted: true },
    { name: 'Enterprise', price: 'Custom', period: '', features: ['Multi-sede', '44+ Automazioni complete', 'WhatsApp Business', 'API dedicata', 'SLA garantito 99.9%', 'Onboarding dedicato', 'Account manager'], cta: 'Contattaci', highlighted: false },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <VetBuddyLogo size={32} />
            <span className="font-bold text-xl text-gray-900">VetBuddy</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#funzionalita" className="text-gray-600 hover:text-gray-900 transition">Funzionalità</a>
            <a href="#come-funziona" className="text-gray-600 hover:text-gray-900 transition">Come Funziona</a>
            <a href="#prezzi" className="text-gray-600 hover:text-gray-900 transition">Prezzi</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Download className="h-4 w-4 mr-2" />Salva PDF
            </Button>
            <Link href="/">
              <Button size="sm" className="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600">
                Prova Gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Gradient */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <GradientBlob className="bg-coral-400 w-96 h-96 -top-48 -right-48" />
        <GradientBlob className="bg-orange-400 w-72 h-72 top-1/2 -left-36" />
        <GradientBlob className="bg-amber-300 w-64 h-64 bottom-0 right-1/4" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-gradient-to-r from-coral-500 to-orange-500 text-white px-4 py-1 text-sm mb-6">
              🚀 Il Gestionale Veterinario del Futuro
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Meno Burocrazia.
              <span className="bg-gradient-to-r from-coral-500 to-orange-500 bg-clip-text text-transparent"> Più Cura.</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              VetBuddy automatizza il 90% delle attività amministrative, così puoi concentrarti su ciò che ami: <strong>curare gli animali</strong>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/">
                <Button size="lg" className="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 text-lg px-8 py-6 rounded-xl shadow-lg shadow-coral-500/30 group">
                  Inizia Gratis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition" />
                </Button>
              </Link>
              <a href="#come-funziona">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-2">
                  <Play className="mr-2 h-5 w-5" />
                  Scopri Come Funziona
                </Button>
              </a>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 text-center group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-coral-500 to-orange-500 bg-clip-text text-transparent">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-gray-600 mt-2 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features for Clinics */}
      <section id="funzionalita" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-coral-100 text-coral-700 mb-4">🏥 Per Cliniche Veterinarie</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Tutto ciò di cui hai bisogno
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Una piattaforma completa per gestire la tua clinica in modo moderno ed efficiente
            </p>
          </div>

          {clinicFeatures.map((feature, i) => (
            <FeatureScreenshot
              key={i}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              gradient={feature.gradient}
              features={feature.features}
              isReversed={i % 2 === 1}
            />
          ))}
        </div>
      </section>

      {/* For Pet Owners */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 mb-4">🐾 Per Proprietari di Animali</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              100% Gratuito per Te
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gestisci la salute dei tuoi animali senza spendere un centesimo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownerFeatures.map((feature, i) => (
              <Card key={i} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur border-white/50">
                <CardContent className="p-6">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg shadow-green-500/30">
              <Check className="h-6 w-6" />
              Nessun costo nascosto - Gratis per sempre
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Timeline */}
      <section id="come-funziona" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-amber-100 text-amber-700 mb-4">⚡ Quick Start</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Operativi in 15 Minuti
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Inizia subito senza complicazioni. Nessuna installazione richiesta.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {timeline.map((step, i) => (
              <TimelineStep
                key={i}
                number={i + 1}
                title={step.title}
                description={step.desc}
                isLast={i === timeline.length - 1}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 text-lg px-8 py-6 rounded-xl shadow-lg">
                Inizia Ora - È Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="prezzi" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 mb-4">💰 Prezzi Trasparenti</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Scegli il Piano Giusto
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Inizia gratis e scala quando vuoi. Nessun vincolo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, i) => (
              <PricingCard key={i} {...plan} />
            ))}
          </div>

          <p className="text-center text-gray-500 mt-8 text-sm">
            * Piano Pilot disponibile su invito per cliniche selezionate nella zona di Milano
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-coral-500 via-orange-500 to-amber-500 relative overflow-hidden">
        <GradientBlob className="bg-white/20 w-96 h-96 -top-48 -right-48" />
        <GradientBlob className="bg-white/10 w-72 h-72 bottom-0 -left-36" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Pronto a Trasformare la Tua Clinica?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Unisciti alle cliniche che hanno già scelto VetBuddy per semplificare il lavoro quotidiano
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="bg-white text-coral-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl font-bold shadow-xl">
                Inizia Gratis Oggi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="mailto:info@vetbuddy.it">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl">
                <Mail className="mr-2 h-5 w-5" />
                Parla con Noi
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <VetBuddyLogo size={32} white />
              <span className="font-bold text-xl text-white">VetBuddy</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="mailto:info@vetbuddy.it" className="hover:text-white transition">info@vetbuddy.it</a>
              <span>•</span>
              <span>© 2025 VetBuddy. Tutti i diritti riservati.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          nav, button, .no-print { display: none !important; }
          section { page-break-inside: avoid; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
