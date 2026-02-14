'use client';

import { useState, useEffect } from 'react';
import { MapPin, Calendar, FileText, PawPrint, CreditCard, Inbox, Check, ChevronLeft, ChevronRight } from 'lucide-react';

function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const features = [
    { icon: MapPin, title: 'Trova clinica vicina', description: 'I clienti trovano la tua clinica su mappa con distanza in tempo reale.', color: 'blue', items: ['Geolocalizzazione GPS', 'Calcolo distanza', 'Google Maps'] },
    { icon: Calendar, title: 'Prenotazioni 24/7', description: 'I clienti prenotano quando vogliono, tu ricevi tutto organizzato.', color: 'coral', items: ['Visite e vaccini', 'Promemoria auto', 'Sync Calendar'] },
    { icon: FileText, title: 'Documenti digitali', description: 'Carica PDF e inviali automaticamente via email.', color: 'purple', badge: 'Più richiesto', items: ['Upload 1 click', 'Email automatica', 'Archivio animale'] },
    { icon: PawPrint, title: 'Cartella clinica', description: 'Ogni animale ha il suo profilo completo con storico.', color: 'green', items: ['Profilo completo', 'Storico visite', 'Tracking spese'] },
    { icon: CreditCard, title: 'Pagamenti Stripe', description: 'Ricevi pagamenti online direttamente sul tuo conto.', color: 'emerald', items: ['Stripe integrato', 'Pagamento online', 'Report finanziari'] },
    { icon: Inbox, title: 'Team Inbox', description: "Un'unica inbox per tutto il team, niente messaggi persi.", color: 'amber', items: ['Ticket assegnabili', 'Anti-doppioni', 'Template risposte'] },
  ];
  
  const colorClasses = {
    blue: { bg: 'from-blue-400 to-blue-600', light: 'bg-blue-50', border: 'border-blue-200/50', text: 'text-blue-600' },
    coral: { bg: 'from-coral-400 to-coral-600', light: 'bg-coral-50', border: 'border-coral-200/50', text: 'text-coral-600' },
    purple: { bg: 'from-purple-400 to-purple-600', light: 'bg-purple-50', border: 'border-purple-200/50', text: 'text-purple-600' },
    green: { bg: 'from-green-400 to-green-600', light: 'bg-green-50', border: 'border-green-200/50', text: 'text-green-600' },
    emerald: { bg: 'from-emerald-400 to-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200/50', text: 'text-emerald-600' },
    amber: { bg: 'from-amber-400 to-amber-600', light: 'bg-amber-50', border: 'border-amber-200/50', text: 'text-amber-600' },
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, features.length]);

  const goTo = (index) => { setCurrentIndex(index); setIsAutoPlaying(false); };
  const prev = () => { setCurrentIndex((prev) => (prev - 1 + features.length) % features.length); setIsAutoPlaying(false); };
  const next = () => { setCurrentIndex((prev) => (prev + 1) % features.length); setIsAutoPlaying(false); };

  return (
    <div className="relative pt-4" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
      {/* Main Carousel */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color];
            return (
              <div key={idx} className="w-full flex-shrink-0 px-4">
                <div className={`bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border ${colors.border} relative mt-4`}>
                  {feature.badge && (
                    <div className="absolute -top-3 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
                      ⭐ {feature.badge}
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className={`h-24 w-24 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0`}>
                      <Icon className="h-12 w-12 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="font-bold text-2xl text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {feature.items.map((item, i) => (
                          <span key={i} className={`inline-flex items-center gap-1 ${colors.light} ${colors.text} text-sm px-3 py-1 rounded-full`}>
                            <Check className="h-3 w-3" /> {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition z-10">
        <ChevronLeft className="h-6 w-6 text-gray-700" />
      </button>
      <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition z-10">
        <ChevronRight className="h-6 w-6 text-gray-700" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {features.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-coral-500' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default FeatureCarousel;
