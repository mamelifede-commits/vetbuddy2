'use client';

import { useState } from 'react';
import { Building2, PawPrint, Check } from 'lucide-react';

function EcosystemToggle() {
  const [activeTab, setActiveTab] = useState('cliniche');
  
  const tabs = {
    cliniche: {
      icon: Building2,
      title: 'Per le Cliniche',
      subtitle: 'Pilot Milano 2025',
      color: 'coral',
      features: [
        'Dashboard "cosa fare oggi" in 10 secondi',
        'Team Inbox con assegnazione ticket',
        'Documenti → email automatica al cliente',
        'Posizione su mappa con indicazioni stradali',
        'Report finanziari e analytics',
        '90 giorni gratuiti nel Pilot (estendibili a 6 mesi)'
      ]
    },
    proprietari: {
      icon: PawPrint,
      title: 'Per i Proprietari',
      subtitle: '100% Gratis, per sempre',
      color: 'blue',
      features: [
        'Trova cliniche vicine con distanza in km',
        'Prenota visite e video-consulti in 2 tap',
        'Ricevi referti e prescrizioni via email',
        'Cartella clinica digitale per ogni animale',
        'Storico spese veterinarie annuali',
        '🎁 Premi Fedeltà dalla tua clinica',
        'Invita la tua clinica su vetbuddy'
      ]
    }
  };

  const current = tabs[activeTab];
  const Icon = current.icon;
  const isCoral = current.color === 'coral';

  return (
    <div className="relative">
      {/* Toggle Button */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-full inline-flex">
          <button
            onClick={() => setActiveTab('cliniche')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              activeTab === 'cliniche' 
                ? 'bg-white shadow-lg text-coral-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="h-5 w-5" />
            Cliniche
          </button>
          <button
            onClick={() => setActiveTab('proprietari')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              activeTab === 'proprietari' 
                ? 'bg-white shadow-lg text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <PawPrint className="h-5 w-5" />
            Proprietari
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div className={`relative overflow-hidden rounded-3xl p-8 md:p-10 transition-all duration-500 ${
        isCoral 
          ? 'bg-gradient-to-br from-coral-50 via-coral-100/50 to-white border border-coral-200/50' 
          : 'bg-gradient-to-br from-blue-50 via-blue-100/50 to-white border border-blue-200/50'
      }`}>
        {/* Decorative blob */}
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-30 ${isCoral ? 'bg-coral-300' : 'bg-blue-300'}`}></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg ${
              isCoral ? 'bg-gradient-to-br from-coral-400 to-coral-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
            }`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-2xl text-gray-900">{current.title}</h3>
              <p className={`text-sm font-medium ${isCoral ? 'text-coral-600' : 'text-blue-600'}`}>{current.subtitle}</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {current.features.map((item, i) => (
              <div 
                key={i} 
                className={`flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                  isCoral ? 'border-coral-100' : 'border-blue-100'
                }`}
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCoral ? 'bg-coral-100' : 'bg-blue-100'
                }`}>
                  <Check className={`h-4 w-4 ${isCoral ? 'text-coral-600' : 'text-blue-600'}`} />
                </div>
                <span className="text-gray-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EcosystemToggle;
