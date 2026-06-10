'use client';
import React, { useState } from 'react';
import { AlertCircle, Activity, Clock, TrendingUp, Users, Zap, CheckCircle } from 'lucide-react';

export default function EmergencyTriageAI() {
  const [activeTab, setActiveTab] = useState('queue');

  const emergencyQueue = [
    { id: 1, pet: 'Rocky (Bulldog)', owner: 'Marco Ferrari', symptoms: 'Difficoltà respiratoria acuta, cianosi', arrivalTime: '5min fa', triagePriority: 1, severity: 'critical', aiConfidence: 98, estimatedWait: 'Immediato', vitals: { hr: 180, rr: 45, temp: 39.8 } },
    { id: 2, pet: 'Luna (Gatto)', owner: 'Sara Neri', symptoms: 'Trauma addominale, possibile emorragia interna', arrivalTime: '12min fa', triagePriority: 1, severity: 'critical', aiConfidence: 95, estimatedWait: 'Dopo Rocky', vitals: { hr: 220, rr: 38, temp: 37.2 } },
    { id: 3, pet: 'Max (Labrador)', owner: 'Giovanni Bianchi', symptoms: 'Zoppia severa arto posteriore, dolore', arrivalTime: '25min fa', triagePriority: 2, severity: 'high', aiConfidence: 92, estimatedWait: '15-20min', vitals: { hr: 110, rr: 28, temp: 38.5 } },
    { id: 4, pet: 'Milo (Beagle)', owner: 'Laura Verdi', symptoms: 'Vomito ripetuto, letargia', arrivalTime: '40min fa', triagePriority: 3, severity: 'medium', aiConfidence: 89, estimatedWait: '30-45min', vitals: { hr: 95, rr: 24, temp: 38.9 } }
  ];

  const triageProtocols = [
    { code: 'P1-RED', name: 'Critico - Immediato', criteria: 'Arresto cardio-respiratorio, shock grave, trauma cranico severo', responseTime: '<2min', color: 'red' },
    { code: 'P2-ORANGE', name: 'Urgente - Prioritario', criteria: 'Emorragia moderata, fratture esposte, difficoltà respiratoria', responseTime: '<15min', color: 'orange' },
    { code: 'P3-YELLOW', name: 'Semi-Urgente', criteria: 'Fratture semplici, vomito/diarrea, dolore moderato', responseTime: '<60min', color: 'yellow' },
    { code: 'P4-GREEN', name: 'Non Urgente', criteria: 'Problemi minori, visite di controllo', responseTime: '<120min', color: 'green' }
  ];

  const aiInsights = [
    { type: 'prediction', title: 'Probabile Picco Emergenze', description: 'AI prevede +40% emergenze nelle prossime 2 ore (18:00-20:00). Suggerimento: richiama veterinario reperibile.', priority: 'high' },
    { type: 'resource', title: 'Sala Emergenza Occupata', description: 'Tempo medio occupazione sala: 45min. Prepara Sala 2 come backup per emergenze critiche.', priority: 'medium' },
    { type: 'diagnosis', title: 'Pattern Rilevato', description: '3 casi di gastroenterite nelle ultime 24h nella stessa zona. Possibile focolaio. Attiva protocollo epidemiologico.', priority: 'high' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-7 h-7 text-red-600" />
            Emergency Triage AI
          </h2>
          <p className="text-gray-600 mt-1">Sistema di triage automatico e prioritizzazione intelligente delle emergenze</p>
        </div>
        <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2 animate-pulse">
          <AlertCircle className="w-5 h-5" />
          Nuova Emergenza
        </button>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Emergenze Critiche</p>
              <p className="text-3xl font-bold text-red-900 mt-1">2</p>
              <p className="text-xs text-red-700 mt-1">In attesa P1</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Coda Totale</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">7</p>
              <p className="text-xs text-orange-700 mt-1">Pazienti in attesa</p>
            </div>
            <Users className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Tempo Medio Attesa</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">18min</p>
              <p className="text-xs text-blue-700 mt-1">-35% con AI attivo</p>
            </div>
            <Clock className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Precisione AI</p>
              <p className="text-3xl font-bold text-green-900 mt-1">96.8%</p>
              <p className="text-xs text-green-700 mt-1">Accuracy triage</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'queue' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Coda Emergenze ({emergencyQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('protocols')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'protocols' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Protocolli Triage
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'insights' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            AI Insights
          </button>
        </div>
      </div>

      {/* Emergency Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-3">
          {emergencyQueue.map(emergency => (
            <div key={emergency.id} className={`p-5 rounded-xl border-2 ${
              emergency.severity === 'critical' ? 'bg-red-50 border-red-400 shadow-lg' :
              emergency.severity === 'high' ? 'bg-orange-50 border-orange-400' :
              'bg-yellow-50 border-yellow-400'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      emergency.triagePriority === 1 ? 'bg-red-600 text-white animate-pulse' :
                      emergency.triagePriority === 2 ? 'bg-orange-600 text-white' :
                      'bg-yellow-600 text-white'
                    }`}>
                      P{emergency.triagePriority} - {emergency.severity === 'critical' ? 'CRITICO' : emergency.severity === 'high' ? 'URGENTE' : 'SEMI-URGENTE'}
                    </span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {emergency.arrivalTime}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                      AI {emergency.aiConfidence}%
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{emergency.pet}</h3>
                  <p className="text-sm text-gray-700 mb-3"><span className="font-medium">Proprietario:</span> {emergency.owner}</p>
                  <p className="text-sm text-gray-900 mb-3"><span className="font-bold">Sintomi:</span> {emergency.symptoms}</p>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Frequenza Cardiaca</p>
                      <p className={`text-lg font-bold ${
                        emergency.vitals.hr > 160 ? 'text-red-600' : emergency.vitals.hr > 120 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {emergency.vitals.hr} bpm
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Freq. Respiratoria</p>
                      <p className={`text-lg font-bold ${
                        emergency.vitals.rr > 40 ? 'text-red-600' : emergency.vitals.rr > 30 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {emergency.vitals.rr} /min
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Temperatura</p>
                      <p className={`text-lg font-bold ${
                        emergency.vitals.temp > 39.5 ? 'text-red-600' : emergency.vitals.temp < 37.5 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {emergency.vitals.temp}°C
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Attesa Stimata</p>
                      <p className="text-lg font-bold text-gray-900">{emergency.estimatedWait}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium whitespace-nowrap">
                    Prendi in Carico
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium whitespace-nowrap">
                    AI Diagnostico
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium whitespace-nowrap">
                    Dettagli
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Triage Protocols */}
      {activeTab === 'protocols' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Protocolli di Triage Automatico</h3>
          <div className="space-y-4">
            {triageProtocols.map((protocol, idx) => (
              <div key={idx} className={`p-5 rounded-lg border-2 border-${protocol.color}-300 bg-${protocol.color}-50`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{protocol.code}</h4>
                    <p className="text-lg font-semibold text-gray-700">{protocol.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold bg-${protocol.color}-200 text-${protocol.color}-800`}>
                    Risposta {protocol.responseTime}
                  </span>
                </div>
                <p className="text-sm text-gray-700"><span className="font-bold">Criteri:</span> {protocol.criteria}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {activeTab === 'insights' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            AI Insights & Previsioni
          </h3>
          <div className="space-y-3">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                insight.priority === 'high' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">{insight.title}</h4>
                    <p className="text-sm text-gray-700">{insight.description}</p>
                  </div>
                  <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium whitespace-nowrap">
                    Azione
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}