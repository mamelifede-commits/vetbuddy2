'use client';
import React, { useState } from 'react';
import { Calendar, Clock, Zap, Users, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';

export default function SmartAppointmentOrchestration() {
  const [selectedDate, setSelectedDate] = useState('2024-02-15');

  const aiSuggestions = [
    { type: 'optimization', title: 'Riorganizza Slot Mattina', description: 'Sposta 2 visite di controllo dalle 11:00 alle 9:30. Libera 45min per emergenza potenziale.', impact: 'high', savings: '45min' },
    { type: 'efficiency', title: 'Accorpa Visite Stesso Cliente', description: 'Maria Rossi ha 2 pet con appuntamenti separati. Accorpali e risparmia 20min.', impact: 'medium', savings: '20min' },
    { type: 'revenue', title: 'Upsell Opportunity', description: 'Cliente delle 14:00 ha pet anziano. Suggerisci check-up completo (+€80).', impact: 'high', savings: '+€80' },
    { type: 'risk', title: 'Conflitto Rilevato', description: 'Chirurgia delle 15:00 potrebbe sovrapporsi con visita complessa 16:00. Aggiungi buffer.', impact: 'critical', savings: 'Evita ritardi' }
  ];

  const todaySchedule = [
    { time: '09:00', duration: 30, type: 'Visita Generale', client: 'Giovanni Bianchi', pet: 'Max (Labrador)', status: 'confirmed', aiOptimized: true },
    { time: '09:30', duration: 20, type: 'Vaccino', client: 'Laura Verdi', pet: 'Luna (Gatto)', status: 'confirmed', aiOptimized: true },
    { time: '10:00', duration: 45, type: 'Chirurgia Minore', client: 'Marco Ferrari', pet: 'Rocky (Bulldog)', status: 'in-progress', aiOptimized: false },
    { time: '11:00', duration: 30, type: 'Controllo Post-Op', client: 'Sara Neri', pet: 'Milo (Beagle)', status: 'waiting', aiOptimized: true },
    { time: '11:30', duration: 15, type: 'Consulenza Telefonica', client: 'AI Suggested', pet: 'N/A', status: 'suggested', aiOptimized: true }
  ];

  const efficiencyMetrics = [
    { label: 'Utilizzo Agenda', value: '87%', trend: '+5%', color: 'green' },
    { label: 'Tempo Medio Attesa', value: '8min', trend: '-3min', color: 'green' },
    { label: 'No-Show Rate', value: '3.2%', trend: '-1.8%', color: 'green' },
    { label: 'Revenue per Ora', value: '€145', trend: '+€23', color: 'purple' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-7 h-7 text-purple-600" />
            Smart Appointment Orchestration AI
          </h2>
          <p className="text-gray-600 mt-1">Orchestrazione intelligente degli appuntamenti in tempo reale</p>
        </div>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Applica Tutte le Ottimizzazioni
        </button>
      </div>

      {/* Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {efficiencyMetrics.map((metric, idx) => (
          <div key={idx} className={`bg-gradient-to-br from-${metric.color}-50 to-${metric.color}-100 p-6 rounded-xl border border-${metric.color}-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-${metric.color}-600 text-sm font-medium`}>{metric.label}</p>
                <p className={`text-3xl font-bold text-${metric.color}-900 mt-1`}>{metric.value}</p>
                <p className={`text-xs text-${metric.color}-700 mt-1 flex items-center gap-1`}>
                  <TrendingUp className="w-3 h-3" />
                  {metric.trend} vs ieri
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Suggestions Priority */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Ottimizzazioni AI Consigliate - Oggi
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
                  <p className="text-xs text-gray-600">Impatto: <span className="font-bold text-purple-600">{suggestion.savings}</span></p>
                </div>
                <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium whitespace-nowrap">
                  Applica
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Agenda di Oggi - AI Ottimizzata
        </h3>
        <div className="space-y-2">
          {todaySchedule.map((appointment, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-2 ${
              appointment.status === 'confirmed' ? 'bg-green-50 border-green-200' :
              appointment.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
              appointment.status === 'waiting' ? 'bg-yellow-50 border-yellow-200' :
              'bg-purple-50 border-purple-200'
            } ${
              appointment.aiOptimized ? 'shadow-md' : ''
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{appointment.time}</p>
                    <p className="text-xs text-gray-600">{appointment.duration}min</p>
                  </div>
                  <div className="h-12 w-px bg-gray-300"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">{appointment.type}</h4>
                      {appointment.aiOptimized && (
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          AI Ottimizzato
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{appointment.client} • {appointment.pet}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    appointment.status === 'confirmed' ? 'bg-green-200 text-green-800' :
                    appointment.status === 'in-progress' ? 'bg-blue-200 text-blue-800' :
                    appointment.status === 'waiting' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-purple-200 text-purple-800'
                  }`}>
                    {appointment.status === 'confirmed' ? '✓ Confermato' :
                     appointment.status === 'in-progress' ? '⏳ In Corso' :
                     appointment.status === 'waiting' ? '⏱ In Attesa' :
                     '💡 AI Suggerito'}
                  </span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Ottimizzazioni Applicate Oggi
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-800">Tempo risparmiato</span>
              <span className="font-bold text-purple-900">1h 25min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-800">Revenue aggiuntivo</span>
              <span className="font-bold text-purple-900">+€240</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-800">No-show evitati</span>
              <span className="font-bold text-purple-900">3</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Previsioni Prossime Ore
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Probabilità emergenza</span>
              <span className="font-bold text-blue-900">23%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Slot disponibili</span>
              <span className="font-bold text-blue-900">7</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Carico previsto</span>
              <span className="font-bold text-blue-900">Alto (18:00-19:00)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}