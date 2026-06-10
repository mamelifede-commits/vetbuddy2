'use client';
import React, { useState } from 'react';
import { Scissors, Calendar, Clock, Users, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function SmartSurgeryScheduling() {
  const [selectedWeek, setSelectedWeek] = useState('current');

  const surgeries = [
    { id: 1, time: '09:00', duration: 90, type: 'Sterilizzazione', pet: 'Luna (Gatto)', complexity: 'low', vet: 'Dr. Santini', room: 'Sala 1', status: 'confirmed', aiOptimized: true },
    { id: 2, time: '11:00', duration: 150, type: 'Ricostruzione Legamento', pet: 'Max (Labrador)', complexity: 'high', vet: 'Dr.ssa Bianchi', room: 'Sala 2', status: 'confirmed', aiOptimized: true },
    { id: 3, time: '14:00', duration: 120, type: 'Rimozione Massa Addominale', pet: 'Rocky (Bulldog)', complexity: 'medium', vet: 'Dr. Santini', room: 'Sala 1', status: 'in-progress', aiOptimized: false },
    { id: 4, time: '16:30', duration: 60, type: 'Estrazione Dentale', pet: 'Milo (Beagle)', complexity: 'low', vet: 'Dr. Verde', room: 'Sala 3', status: 'scheduled', aiOptimized: true }
  ];

  const aiSuggestions = [
    { type: 'optimization', title: 'Ottimizza Buffer Tra Chirurgie', description: 'Sposta chirurgia delle 16:30 alle 17:00. Aggiungi 30min buffer dopo chirurgia complessa delle 14:00.', impact: 'high', benefit: 'Riduce rischio ritardi del 40%' },
    { type: 'efficiency', title: 'Accorpa Prep Time', description: 'Sterilizzazioni di Lunedì e Martedì possono condividere prep. Risparmio: 25min.', impact: 'medium', benefit: '+1 slot disponibile' },
    { type: 'resource', title: 'Assegna Sala Alternativa', description: 'Sala 2 ha attrezzatura avanzata sottoutilizzata. Riassegna chirurgia complessa delle 11:00.', impact: 'high', benefit: 'Migliora outcome del 15%' },
    { type: 'risk', title: 'Conflitto Anestesista', description: 'Dr. Rossi (anestesista) ha 2 chirurgie sovrapposte Giovedì 10:00. Riprogramma una.', impact: 'critical', benefit: 'Evita cancellazione' }
  ];

  const resourceUtilization = [
    { resource: 'Sala Operatoria 1', utilization: 87, hoursUsed: 6.5, hoursAvailable: 8, nextAvailable: '17:30' },
    { resource: 'Sala Operatoria 2', utilization: 65, hoursUsed: 5.2, hoursAvailable: 8, nextAvailable: '15:00' },
    { resource: 'Sala Operatoria 3', utilization: 45, hoursUsed: 3.6, hoursAvailable: 8, nextAvailable: 'Disponibile' },
    { resource: 'Anestesista Team', utilization: 92, hoursUsed: 7.4, hoursAvailable: 8, nextAvailable: '18:00' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Scissors className="w-7 h-7 text-purple-600" />
            Smart Surgery Scheduling AI
          </h2>
          <p className="text-gray-600 mt-1">Pianificazione intelligente e ottimizzazione delle chirurgie</p>
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Nuova Chirurgia
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Chirurgie Oggi</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">7</p>
              <p className="text-xs text-purple-700 mt-1">4 completate</p>
            </div>
            <Scissors className="w-12 h-12 text-purple-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Utilizzo Sale</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">66%</p>
              <p className="text-xs text-blue-700 mt-1">+12% con AI</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">On-Time Rate</p>
              <p className="text-3xl font-bold text-green-900 mt-1">94%</p>
              <p className="text-xs text-green-700 mt-1">+18% vs manuale</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Avg Duration</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">105min</p>
              <p className="text-xs text-orange-700 mt-1">-12min vs previsto</p>
            </div>
            <Clock className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* AI Optimization Suggestions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Ottimizzazioni AI Consigliate
        </h3>
        <div className="space-y-3">
          {aiSuggestions.map((suggestion, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${
              suggestion.impact === 'critical' ? 'bg-red-50 border-red-500' :
              suggestion.impact === 'high' ? 'bg-orange-50 border-orange-500' :
              'bg-yellow-50 border-yellow-500'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{suggestion.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      suggestion.impact === 'critical' ? 'bg-red-200 text-red-800' :
                      suggestion.impact === 'high' ? 'bg-orange-200 text-orange-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {suggestion.impact.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>
                  <p className="text-xs text-purple-600 font-medium">🎯 Beneficio: {suggestion.benefit}</p>
                </div>
                <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium whitespace-nowrap">
                  Applica
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Surgery Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Calendario Chirurgie Oggi
        </h3>
        <div className="space-y-3">
          {surgeries.map(surgery => (
            <div key={surgery.id} className={`p-5 rounded-lg border-2 ${
              surgery.status === 'in-progress' ? 'bg-blue-50 border-blue-300' :
              surgery.status === 'confirmed' ? 'bg-green-50 border-green-300' :
              'bg-gray-50 border-gray-300'
            } ${
              surgery.aiOptimized ? 'shadow-md' : ''
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{surgery.time}</p>
                    <p className="text-xs text-gray-600">{surgery.duration}min</p>
                  </div>
                  <div className="h-12 w-px bg-gray-300"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-900">{surgery.type}</h4>
                      {surgery.aiOptimized && (
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-bold">
                          AI Ottimizzato
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        surgery.complexity === 'high' ? 'bg-red-100 text-red-700' :
                        surgery.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {surgery.complexity === 'high' ? 'Alta Complessità' : surgery.complexity === 'medium' ? 'Media' : 'Bassa'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-600">Paziente</p>
                        <p className="font-medium text-gray-900">{surgery.pet}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Chirurgo</p>
                        <p className="font-medium text-gray-900">{surgery.vet}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Sala</p>
                        <p className="font-medium text-gray-900">{surgery.room}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                  surgery.status === 'in-progress' ? 'bg-blue-200 text-blue-800' :
                  surgery.status === 'confirmed' ? 'bg-green-200 text-green-800' :
                  'bg-gray-200 text-gray-800'
                }`}>
                  {surgery.status === 'in-progress' ? '⏳ In Corso' : surgery.status === 'confirmed' ? '✓ Confermata' : '📅 Programmata'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Utilizzo Risorse
        </h3>
        <div className="space-y-4">
          {resourceUtilization.map((resource, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">{resource.resource}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">{resource.hoursUsed}h / {resource.hoursAvailable}h usate</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    resource.utilization >= 80 ? 'bg-green-100 text-green-700' :
                    resource.utilization >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {resource.utilization}%
                  </span>
                  <span className="text-xs text-gray-600">Prossimo slot: <span className="font-bold">{resource.nextAvailable}</span></span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    resource.utilization >= 80 ? 'bg-green-600' :
                    resource.utilization >= 50 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${resource.utilization}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}