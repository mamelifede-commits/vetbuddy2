'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MessageSquare, FileText, Zap, Heart,
  Phone, Clock, Video, Bell, CreditCard, BarChart3, PawPrint,
  Smartphone, Gift, Check, Star, Users, MapPin, Shield, Sparkles,
  ChevronRight, Mail, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

// VetBuddy Logo
const VetBuddyLogo = ({ size = 40, white = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="62" rx="18" ry="16" fill={white ? "#ffffff" : "#FF6B6B"}/>
    <ellipse cx="28" cy="38" rx="10" ry="12" fill={white ? "#ffffff" : "#FF6B6B"}/>
    <ellipse cx="50" cy="28" rx="10" ry="12" fill={white ? "#ffffff" : "#FF6B6B"/>
    <ellipse cx="72" cy="38" rx="10" ry="12" fill={white ? "#ffffff" : "#FF6B6B"}/>
  </svg>
);

// Animated Number
const AnimatedNumber = ({ value, suffix = '' }) => {
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

  return <span ref={ref}>{count}{suffix}</span>;
};

export default function PresentazionePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <VetBuddyLogo size={28} />
            <span className="font-semibold text-gray-900">VetBuddy</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#cliniche" className="hover:text-coral-500 transition">Per Cliniche</a>
            <a href="#proprietari" className="hover:text-coral-500 transition">Per Proprietari</a>
            <a href="#prezzi" className="hover:text-coral-500 transition">Prezzi</a>
            <Link href="/" className="text-coral-500 font-medium hover:text-coral-600 transition">
              Accedi →
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero - Minimal & Bold */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-sm text-coral-600 bg-coral-50 px-4 py-2 rounded-full mb-8">
            <Sparkles className="h-4 w-4" />
            <span>Il gestionale veterinario più amato d'Italia</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Meno burocrazia,<br/>
            <span className="text-coral-500">più tempo per curare</span>
          </h1>
          
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            VetBuddy automatizza le attività amministrative della tua clinica veterinaria. 
            Agenda, documenti, pagamenti e comunicazioni in un'unica piattaforma.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-gradient-to-r from-coral-500 via-orange-500 to-amber-500">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2"><AnimatedNumber value={90} suffix="%" /></div>
              <div className="text-white/80 text-sm">Burocrazia eliminata</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2"><AnimatedNumber value={44} suffix="+" /></div>
              <div className="text-white/80 text-sm">Automazioni attive</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2"><AnimatedNumber value={2} suffix="h" /></div>
              <div className="text-white/80 text-sm">Risparmio al giorno</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2"><AnimatedNumber value={100} suffix="%" /></div>
              <div className="text-white/80 text-sm">Gratuito per proprietari</div>
            </div>
          </div>
        </div>
      </section>

      {/* Per Cliniche */}
      <section id="cliniche" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-coral-500 font-medium text-sm tracking-wider uppercase">Per Cliniche Veterinarie</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Tutto ciò di cui hai bisogno
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Una piattaforma completa per gestire la tua clinica in modo moderno, efficiente e senza stress.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, title: 'Agenda Intelligente', desc: 'Vista giornaliera, settimanale e mensile. Drag & drop, colori per veterinario, promemoria automatici.' },
              { icon: Bell, title: '44+ Automazioni', desc: 'Richiami vaccini, follow-up post visita, auguri compleanno pet, notifiche WhatsApp. Tutto automatico.' },
              { icon: MessageSquare, title: 'Team Inbox', desc: 'Tutti i messaggi dei clienti in un unico posto. Sistema ticket, quick replies, storico completo.' },
              { icon: FileText, title: 'Documenti Cloud', desc: 'Carica referti e prescrizioni. Invio automatico via email. Firma digitale integrata. Zero carta.' },
              { icon: Video, title: 'Video Consulto HD', desc: 'Consulenze online professionali. Un click per iniziare. Nessun software da installare.' },
              { icon: CreditCard, title: 'Fatturazione', desc: 'Crea preventivi e fatture PROFORMA in secondi. Export CSV per il commercialista.' },
              { icon: BarChart3, title: 'Analytics', desc: 'Dashboard con KPI in tempo reale. Monitora visite, fatturato, nuovi clienti.' },
              { icon: Gift, title: 'Premi Fedeltà', desc: 'Fidelizza i clienti con un sistema di punti automatico. Aumenta il passaparola.' },
              { icon: Users, title: 'Multi-veterinario', desc: 'Gestisci più professionisti. Assegna appuntamenti, monitora carichi di lavoro.' },
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-gray-100 hover:border-coral-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-coral-100 to-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-coral-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Come Funziona - Visual Timeline */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-coral-500 font-medium text-sm tracking-wider uppercase">Come Funziona</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4">
              Operativi in 15 minuti
            </h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-coral-200 via-orange-200 to-amber-200 -translate-y-1/2" />
            
            <div className="grid md:grid-cols-4 gap-8 relative">
              {[
                { num: '01', title: 'Registrati', desc: 'Crea il tuo account in 2 minuti. Nessuna carta di credito.' },
                { num: '02', title: 'Configura', desc: 'Aggiungi servizi, prezzi e orari di apertura.' },
                { num: '03', title: 'Importa', desc: 'Carica i pazienti esistenti da CSV o aggiungili manualmente.' },
                { num: '04', title: 'Inizia', desc: 'Ricevi prenotazioni e gestisci tutto dalla dashboard.' },
              ].map((step, i) => (
                <div key={i} className="text-center relative">
                  <div className="w-16 h-16 bg-white rounded-full border-4 border-coral-200 flex items-center justify-center mx-auto mb-4 relative z-10">
                    <span className="text-coral-500 font-bold text-lg">{step.num}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Per Proprietari */}
      <section id="proprietari" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-blue-500 font-medium text-sm tracking-wider uppercase">Per Proprietari di Animali</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
                Gratuito.<br/>Per sempre.
              </h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                Gestisci la salute dei tuoi animali senza spendere un centesimo. 
                Prenota visite, ricevi documenti, non dimenticare mai un vaccino.
              </p>
              
              <div className="space-y-4">
                {[
                  'Registra tutti i tuoi animali con foto e dati sanitari',
                  'Prenota visite in pochi click, conferma immediata',
                  'Ricevi referti e prescrizioni direttamente nell\'app',
                  'Promemoria automatici per vaccini e controlli',
                  'Trova cliniche sulla mappa, leggi le recensioni',
                  'Accumula punti fedeltà con ogni visita',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: PawPrint, label: 'Cani', color: 'from-amber-400 to-orange-400' },
                { icon: Heart, label: 'Gatti', color: 'from-purple-400 to-pink-400' },
                { icon: Sparkles, label: 'Conigli', color: 'from-pink-400 to-rose-400' },
                { icon: Star, label: 'Uccelli', color: 'from-sky-400 to-blue-400' },
                { icon: Shield, label: 'Rettili', color: 'from-emerald-400 to-green-400' },
                { icon: Zap, label: 'E molti altri...', color: 'from-gray-400 to-slate-400' },
              ].map((animal, i) => (
                <div key={i} className={`p-6 rounded-2xl bg-gradient-to-br ${animal.color} text-white`}>
                  <animal.icon className="h-8 w-8 mb-3 opacity-90" />
                  <span className="font-medium">{animal.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prezzi */}
      <section id="prezzi" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-coral-500 font-medium text-sm tracking-wider uppercase">Prezzi Trasparenti</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Scegli il piano giusto per te
            </h2>
            <p className="text-gray-500 text-lg">
              Inizia gratis, scala quando vuoi. Nessun vincolo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="text-gray-500 text-sm font-medium mb-2">Starter</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">€0</span>
                <span className="text-gray-400">/mese</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">Perfetto per iniziare</p>
              <div className="space-y-3 mb-8">
                {['Fino a 50 pazienti', 'Agenda base', 'Posizione su mappa', '5 Automazioni', 'Supporto email'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500" />
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/" className="block text-center py-3 px-6 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">
                Inizia gratis
              </Link>
            </div>

            {/* Professional - Highlighted */}
            <div className="bg-gradient-to-br from-coral-500 to-orange-500 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/20 text-xs font-medium px-3 py-1 rounded-full">
                Consigliato
              </div>
              <div className="text-white/80 text-sm font-medium mb-2">Professional</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">€129</span>
                <span className="text-white/60">/mese + IVA</span>
              </div>
              <p className="text-white/80 text-sm mb-6">Per cliniche in crescita</p>
              <div className="space-y-3 mb-8">
                {['Pazienti illimitati', '20 Automazioni', 'Team Inbox + ticket', 'Documenti + invio email', 'Google Calendar sync', 'Video Consulto', 'Report settimanali'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/90">
                    <Check className="h-4 w-4" />
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/" className="block text-center py-3 px-6 bg-white text-coral-600 rounded-xl font-medium hover:bg-white/90 transition">
                Richiedi invito
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="text-gray-500 text-sm font-medium mb-2">Enterprise</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">Custom</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">Per grandi strutture</p>
              <div className="space-y-3 mb-8">
                {['Multi-sede', '44+ Automazioni', 'WhatsApp Business', 'API dedicata', 'SLA garantito 99.9%', 'Account manager'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500" />
                    {f}
                  </div>
                ))}
              </div>
              <a href="mailto:info@vetbuddy.it" className="block text-center py-3 px-6 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">
                Contattaci
              </a>
            </div>
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            Piano Pilot disponibile su invito per cliniche selezionate a Milano
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-coral-500 font-medium text-sm tracking-wider uppercase">Dicono di Noi</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4">
              Amato dai veterinari
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Dr.ssa Maria Colombo', clinic: 'Clinica Veterinaria Milano Nord', text: 'Le telefonate per promemoria sono calate dell\'80%. I clienti adorano ricevere gli auguri per il compleanno del loro pet.' },
              { name: 'Dr. Luca Ferretti', clinic: 'Ambulatorio Veterinario Monza', text: 'L\'import dei pazienti dal vecchio gestionale è stato semplicissimo. In 10 minuti avevamo tutti i dati migrati.' },
              { name: 'Dr.ssa Giulia Rossi', clinic: 'Pet Care Center', text: 'Il video consulto ci ha aperto un nuovo canale di servizio. I clienti lo adorano per i controlli post-operatori.' },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-gray-50">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{t.text}"</p>
                <div>
                  <div className="font-medium text-gray-900">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.clinic}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <VetBuddyLogo size={60} white />
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-8 mb-6">
            Pronto a semplificare<br/>la tua clinica?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Unisciti alle cliniche che hanno già scelto VetBuddy. Inizia gratis oggi.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-coral-500 to-orange-500 text-white px-8 py-4 rounded-xl font-medium text-lg hover:opacity-90 transition">
            Inizia gratuitamente
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <VetBuddyLogo size={20} white />
            <span>VetBuddy</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="mailto:info@vetbuddy.it" className="hover:text-white transition">info@vetbuddy.it</a>
            <span>© 2025 VetBuddy. Tutti i diritti riservati.</span>
          </div>
        </div>
      </footer>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          header { display: none !important; }
          section { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
