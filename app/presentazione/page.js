'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, ChevronRight, Check, X, Star, Clock, TrendingUp, 
  Users, Calendar, MessageSquare, FileText, Shield, Zap, Heart,
  Phone, Mail, MapPin, Award, Target, Sparkles, ArrowRight,
  Video, Bell, CreditCard, BarChart3, Printer, PawPrint,
  Smartphone, Globe, Lock, Headphones, Gift, Percent
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

// Animated Counter Component
const AnimatedCounter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return <span>{count}{suffix}</span>;
};

export default function PresentazionePage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const handlePrint = () => {
    window.print();
  };

  const features = [
    {
      icon: Calendar,
      title: "Agenda Intelligente",
      description: "Calendario settimanale con drag & drop, colori per veterinario, 10+ tipi di visita",
      benefits: ["Multi-veterinario", "Drag & drop", "Promemoria automatici"],
      color: "blue"
    },
    {
      icon: Bell,
      title: "Automazioni AI",
      description: "44+ automazioni attive: richiami vaccini, follow-up, auguri compleanno pet",
      benefits: ["-80% telefonate", "+40% ritorno clienti", "24/7 automatico"],
      color: "green"
    },
    {
      icon: MessageSquare,
      title: "Team Inbox",
      description: "Tutti i messaggi in un unico posto. Ticket system e quick replies",
      benefits: ["Nessun messaggio perso", "Risposte rapide", "Storico completo"],
      color: "purple"
    },
    {
      icon: Video,
      title: "Video Consulto",
      description: "Consulenze online HD con un click. Link automatico al cliente",
      benefits: ["Nessun software esterno", "1-click per iniziare", "Qualità HD"],
      color: "red"
    },
    {
      icon: FileText,
      title: "Documenti Cloud",
      description: "Referti, prescrizioni, fatture. Upload drag & drop, firma digitale",
      benefits: ["Firma digitale", "Invio 1-click", "Zero carta"],
      color: "amber"
    },
    {
      icon: Gift,
      title: "Premi Fedeltà",
      description: "Fidelizza i clienti con sconti e premi personalizzati",
      benefits: ["Clienti più fedeli", "Passaparola", "Differenziazione"],
      color: "pink"
    },
    {
      icon: CreditCard,
      title: "Fatturazione Flessibile",
      description: "Crea fatture ed esportale per il tuo software di contabilità preferito",
      benefits: ["Export CSV/PDF", "IVA automatica", "Compatibile con tutti"],
      color: "emerald"
    },
    {
      icon: Smartphone,
      title: "WhatsApp Business",
      description: "I clienti ti contattano direttamente via WhatsApp dall'app",
      benefits: ["Comunicazione diretta", "Risposte rapide", "Più engagement"],
      color: "green"
    }
  ];

  const competitors = [
    { name: "VetBuddy", price: "€0*", agenda: true, automazioni: "44+", video: true, inbox: true, premi: true, import: true, mobile: true, support: "24/7" },
    { name: "Gestionale A", price: "€150/mese", agenda: true, automazioni: "5-10", video: false, inbox: false, premi: false, import: false, mobile: "Parziale", support: "Email" },
    { name: "Gestionale B", price: "€200/mese", agenda: true, automazioni: "10-15", video: false, inbox: true, premi: false, import: true, mobile: true, support: "Telefono" },
    { name: "Gestionale C", price: "€100/mese", agenda: true, automazioni: "0", video: false, inbox: false, premi: false, import: false, mobile: false, support: "Email" },
  ];

  const testimonials = [
    {
      name: "Dr.ssa Maria Colombo",
      clinic: "Clinica Veterinaria Milano Nord",
      text: "Da quando usiamo VetBuddy, le telefonate per promemoria sono calate dell'80%. I clienti adorano ricevere gli auguri per il compleanno del loro pet!",
      rating: 5
    },
    {
      name: "Dr. Luca Ferretti",
      clinic: "Ambulatorio Veterinario Monza",
      text: "L'import dei pazienti dal vecchio gestionale è stato semplicissimo. In 10 minuti avevamo tutti i dati migrati. Incredibile!",
      rating: 5
    },
    {
      name: "Dr.ssa Giulia Rossi",
      clinic: "Pet Care Center",
      text: "Il video consulto ci ha aperto un nuovo canale di servizio. I clienti lo adorano, soprattutto per controlli post-operatori rapidi.",
      rating: 5
    }
  ];

  const stats = [
    { value: 80, suffix: "%", label: "Riduzione telefonate", icon: Phone },
    { value: 40, suffix: "%", label: "Aumento ritorno clienti", icon: TrendingUp },
    { value: 3, suffix: "h", label: "Risparmio al giorno", icon: Clock },
    { value: 95, suffix: "%", label: "Clienti soddisfatti", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <VetBuddyLogo size={32} />
            <span className="font-bold text-xl text-gray-900">VetBuddy</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Salva PDF
            </Button>
            <Link href="/tutorial">
              <Button variant="outline">
                🎓 Tutorial
              </Button>
            </Link>
            <Link href="/">
              <Button className="bg-coral-500 hover:bg-coral-600">
                Prova Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-coral-500 via-coral-600 to-red-600 text-white py-20 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center">
            <Badge className="bg-white/20 text-white border-0 mb-6 text-sm px-4 py-2">
              🏆 Il Gestionale Veterinario del Futuro
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Meno Burocrazia.<br/>
              <span className="text-yellow-300">Più Cura.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10">
              VetBuddy automatizza il 90% delle attività amministrative, 
              così puoi concentrarti su ciò che ami: curare gli animali.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link href="/">
                <Button size="lg" className="bg-white text-coral-600 hover:bg-gray-100 text-lg px-8 py-6">
                  Inizia Gratis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/tutorial">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                  🎓 Guarda il Tutorial
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-yellow-300" />
                  <p className="text-4xl font-bold text-yellow-300">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-white/80 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              😫 Riconosci questi problemi?
            </h2>
            <p className="text-gray-600 text-lg">Ogni giorno migliaia di veterinari affrontano queste sfide</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: "📞", title: "Telefonate infinite", desc: "Ore al telefono per promemoria vaccini, conferme appuntamenti, follow-up..." },
              { emoji: "📋", title: "Carta ovunque", desc: "Referti stampati, cartelle cliniche cartacee, archivi che traboccano..." },
              { emoji: "😤", title: "Clienti che non tornano", desc: "Nessun sistema di fidelizzazione, dimenticano gli appuntamenti, vanno altrove..." }
            ].map((item, i) => (
              <Card key={i} className="border-2 border-red-100 bg-red-50/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <span className="text-5xl mb-4 block">{item.emoji}</span>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-6 py-3 rounded-full text-lg font-semibold">
              <Sparkles className="h-6 w-6" />
              VetBuddy risolve tutto questo automaticamente
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 mb-4">✨ Funzionalità Complete</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tutto ciò di cui hai bisogno, in un'unica piattaforma
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Niente più software separati. VetBuddy integra agenda, comunicazioni, documenti, pagamenti e molto altro.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Feature Tabs */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all ${
                    activeFeature === i 
                      ? 'bg-gradient-to-r from-coral-500 to-red-500 text-white shadow-xl scale-[1.02]' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${activeFeature === i ? 'bg-white/20' : 'bg-white shadow'}`}>
                      <feature.icon className={`h-6 w-6 ${activeFeature === i ? 'text-white' : 'text-coral-500'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-1 ${activeFeature === i ? 'text-white' : 'text-gray-900'}`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm ${activeFeature === i ? 'text-white/80' : 'text-gray-600'}`}>
                        {feature.description}
                      </p>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${activeFeature === i ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Feature Detail */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white sticky top-24">
              <div className="mb-6">
                <Badge className="bg-coral-500 text-white border-0 mb-4">
                  {features[activeFeature].title}
                </Badge>
                <h3 className="text-3xl font-bold mb-4">{features[activeFeature].title}</h3>
                <p className="text-gray-300 text-lg">{features[activeFeature].description}</p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-400 uppercase tracking-wider">Vantaggi chiave:</p>
                {features[activeFeature].benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-gradient-to-r from-coral-500/20 to-red-500/20 rounded-xl border border-coral-500/30">
                <p className="text-coral-300 font-medium">💡 Incluso in tutti i piani</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 bg-gray-50" id="confronto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-purple-100 text-purple-700 mb-4">📊 Confronto Completo</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              VetBuddy vs Altri Gestionali
            </h2>
            <p className="text-gray-600 text-lg">
              Confronto trasparente con i principali gestionali veterinari sul mercato
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-coral-500 to-red-500 text-white">
                  <th className="p-4 text-left font-bold">Funzionalità</th>
                  {competitors.map((c, i) => (
                    <th key={i} className={`p-4 text-center font-bold ${i === 0 ? 'bg-white/20' : ''}`}>
                      {c.name}
                      {i === 0 && <span className="block text-xs mt-1">⭐ Consigliato</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">💰 Prezzo</td>
                  {competitors.map((c, i) => (
                    <td key={i} className={`p-4 text-center ${i === 0 ? 'bg-green-50 font-bold text-green-600' : ''}`}>
                      {c.price}
                      {i === 0 && <span className="block text-xs">*Pilot gratuito</span>}
                    </td>
                  ))}
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium">📅 Agenda Multi-veterinario</td>
                  {competitors.map((c, i) => (
                    <td key={i} className={`p-4 text-center ${i === 0 ? 'bg-green-50' : ''}`}>
                      {c.agenda ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">🤖 Automazioni Email/SMS</td>
                  {competitors.map((c, i) => (
                    <td key={i} className={`p-4 text-center ${i === 0 ? 'bg-green-50 font-bold text-green-600' : ''}`}>
                      {c.automazioni}
                    </td>
                  ))}
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium">📹 Video Consulto</td>
                  {competitors.map((c, i) => (
                    <td key={i} className={`p-4 text-center ${i === 0 ? 'bg-green-50' : ''}`}>
                      {c.video ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">💬 Team Inbox</td>
                  {competitors.map((c, i) => (
                    <td key={i} className={`p-4 text-center ${i === 0 ? 'bg-green-50' : ''}`}>
                      {c.inbox ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}
                    </td>
                  ))}
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium">🎁 Sistema Premi Fedeltà</td>
                  {competitors.map((c, i) => (
                    <td key={i} className={`p-4 text-center ${i === 0 ? 'bg-green-50' : ''}`}>
                      {c.premi ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">📤 Import Pazienti</td>
                  {competitors.map((c, i) => (
                    <td key={i} className={`p-4 text-center ${i === 0 ? 'bg-green-50' : ''}`}>
                      {c.import ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}
                    </td>
                  ))}
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium">📱 App Mobile</td>
                  {competitors.map((c, i) => (
                    <td key={i} className={`p-4 text-center ${i === 0 ? 'bg-green-50' : ''}`}>
                      {c.mobile === true ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : 
                       c.mobile === false ? <X className="h-5 w-5 text-red-400 mx-auto" /> :
                       <span className="text-amber-500 text-sm">{c.mobile}</span>}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium">🎧 Supporto</td>
                  {competitors.map((c, i) => (
                    <td key={i} className={`p-4 text-center ${i === 0 ? 'bg-green-50 font-bold text-green-600' : ''}`}>
                      {c.support}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">* Dati aggiornati a Febbraio 2026. I prezzi dei competitor sono indicativi.</p>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-white/20 text-white border-0 mb-6">💰 Calcola il Risparmio</Badge>
          <h2 className="text-4xl font-bold mb-6">
            Quanto puoi risparmiare con VetBuddy?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <Clock className="h-10 w-10 mx-auto mb-4 text-yellow-300" />
              <p className="text-4xl font-bold text-yellow-300">3+ ore</p>
              <p className="text-white/80">Risparmiate al giorno</p>
              <p className="text-sm text-white/60 mt-2">Grazie alle automazioni</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <Phone className="h-10 w-10 mx-auto mb-4 text-green-300" />
              <p className="text-4xl font-bold text-green-300">-80%</p>
              <p className="text-white/80">Telefonate in meno</p>
              <p className="text-sm text-white/60 mt-2">Promemoria automatici</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <TrendingUp className="h-10 w-10 mx-auto mb-4 text-coral-300" />
              <p className="text-4xl font-bold text-coral-300">+40%</p>
              <p className="text-white/80">Clienti che tornano</p>
              <p className="text-sm text-white/60 mt-2">Grazie a premi e follow-up</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="text-lg mb-4">Con una media di <strong>50 pazienti/settimana</strong>:</p>
            <div className="text-5xl font-bold text-yellow-300 mb-2">
              ~€500-800/mese
            </div>
            <p className="text-white/80">di valore in tempo risparmiato e clienti fidelizzati</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-amber-100 text-amber-700 mb-4">⭐ Testimonianze</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cosa dicono le cliniche
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-white hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{t.text}"</p>
                  <div className="border-t pt-4">
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.clinic}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-green-100 text-green-700 mb-4">💎 Piani e Prezzi</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Inizia gratis, scala quando vuoi
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter */}
            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-500 mb-4">Per iniziare</p>
                <p className="text-4xl font-bold text-gray-900 mb-6">
                  €0<span className="text-lg font-normal text-gray-500">/mese</span>
                </p>
                <ul className="space-y-3 mb-6">
                  {["Agenda base", "5 automazioni", "Documenti cloud", "1 veterinario"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <Check className="h-5 w-5 text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">Inizia Gratis</Button>
              </CardContent>
            </Card>
            
            {/* Professional - Highlighted */}
            <Card className="border-2 border-coral-500 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-coral-500 text-white">⭐ Più Popolare</Badge>
              </div>
              <CardContent className="p-6 pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-500 mb-4">Per cliniche in crescita</p>
                <p className="text-4xl font-bold text-coral-500 mb-6">
                  €0<span className="text-lg font-normal text-gray-500">/mese*</span>
                </p>
                <ul className="space-y-3 mb-6">
                  {["Tutto di Starter +", "44+ automazioni", "Video consulto", "Team Inbox", "Premi fedeltà", "Multi-veterinario", "Report avanzati"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <Check className="h-5 w-5 text-coral-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-coral-500 hover:bg-coral-600">
                  Richiedi Accesso Pilot
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">*Gratis durante il Pilot Milano</p>
              </CardContent>
            </Card>
            
            {/* Enterprise */}
            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-500 mb-4">Per grandi strutture</p>
                <p className="text-4xl font-bold text-gray-900 mb-6">
                  Custom
                </p>
                <ul className="space-y-3 mb-6">
                  {["Tutto di Professional +", "API personalizzate", "Integrazioni custom", "Account manager", "SLA garantito", "Formazione on-site"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <Check className="h-5 w-5 text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">Contattaci</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-coral-500 to-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <VetBuddyLogo size={80} white={true} />
          <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-6">
            Pronto a trasformare la tua clinica?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Unisciti alle cliniche che hanno già scelto VetBuddy. 
            Inizia gratuitamente, senza carta di credito.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/">
              <Button size="lg" className="bg-white text-coral-600 hover:bg-gray-100 text-lg px-8 py-6">
                Inizia Gratis Ora <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/tutorial">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                🎓 Vedi il Tutorial
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/80">
            <span className="flex items-center gap-2"><Check className="h-5 w-5" /> Nessuna carta richiesta</span>
            <span className="flex items-center gap-2"><Check className="h-5 w-5" /> Setup in 5 minuti</span>
            <span className="flex items-center gap-2"><Check className="h-5 w-5" /> Supporto 24/7</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 print:hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <VetBuddyLogo size={32} white={true} />
              <span className="font-bold text-xl">VetBuddy</span>
            </div>
            <div className="flex gap-6 text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/tutorial" className="hover:text-white">Tutorial</Link>
              <Link href="/guida-import" className="hover:text-white">Guida Import</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>© 2026 VetBuddy. La piattaforma per cliniche veterinarie e proprietari di animali.</p>
          </div>
        </div>
      </footer>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { font-size: 11px; }
          section { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
