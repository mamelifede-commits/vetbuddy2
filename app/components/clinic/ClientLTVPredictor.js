'use client';
import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, Target, Calendar, Zap, Award, AlertCircle } from 'lucide-react';

export default function ClientLTVPredictor() {
  const [selectedSegment, setSelectedSegment] = useState('all');

  const clientSegments = [
    { name: 'VIP Champions', clients: 47, avgLTV: 4850, predicted12m: 6200, growth: '+28%', color: 'purple', confidence: 94 },
    { name: 'High Value', clients: 123, avgLTV: 2340, predicted12m: 2890, growth: '+23%', color: 'blue', confidence: 91 },
    { name: 'Growing Potential', clients: 289, avgLTV: 980, predicted12m: 1450, growth: '+48%', color: 'green', confidence: 87 },
    { name: 'At Risk', clients: 56, avgLTV: 1240, predicted12m: 620, growth: '-50%', color: 'red', confidence: 89 }
  ];

  const topClients = [
    { id: 1, name: 'Maria Rossi', pets: 3, currentLTV: 5240, predicted24m: 9800, churnRisk: 5, nextVisit: '12 Feb', recommendedAction: 'Proponi pacchetto premium' },
    { id: 2, name: 'Giovanni Bianchi', pets: 2, currentLTV: 4890, predicted24m: 8500, churnRisk: 8, nextVisit: '18 Feb', recommendedAction: 'Offri wellness check gratuito' },
    { id: 3, name: 'Laura Verdi', pets: 4, currentLTV: 6120, predicted24m: 11200, churnRisk: 3, nextVisit: '5 Mar', recommendedAction: 'Upsell chirurgia preventiva' },
    { id: 4, name: 'Marco Ferrari', pets: 1, currentLTV: 3450, predicted24m: 5600, churnRisk: 12, nextVisit: '22 Feb', recommendedAction: 'Email personalizzata + sconto' }
  ];

  const aiRecommendations = [
    { type: 'retention', title: 'Campagna Retention VIP', description: 'Invia email personalizzata ai 47 clienti VIP con offerta esclusiva pacchetto annuale. ROI stimato: +€18.500', priority: 'high', impact: 'high' },
    { type: 'upsell', title: 'Upsell Chirurgia Preventiva', description: '89 clienti con pet anziani potrebbero beneficiare di check-up chirurgici. Converti il 30% = +€12.300', priority: 'high', impact: 'medium' },
    { type: 'winback', title: 'Win-back Clienti Dormienti', description: '34 clienti non visitano da >6 mesi. Campagna win-back con sconto 20%. Expected recovery: €4.200', priority: 'medium', impact: 'medium' },
    { type: 'loyalty', title: 'Programma Fedeltà Automatico', description: 'Attiva punti fedeltà per clienti Growing Potential. Aumenta retention del 35% e LTV medio di €340', priority: 'medium', impact: 'high' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-purple-600" />
            Client LTV Predictor AI
          </h2>
          <p className="text-gray-600 mt-1">Previsione intelligente del valore lifetime dei clienti</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">LTV Medio Attuale</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">€2.145</p>
              <p className="text-xs text-purple-700 mt-1">Per cliente attivo</p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">LTV Previsto 12m</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">€2.890</p>
              <p className="text-xs text-blue-700 mt-1">+34.7% crescita prevista</p>
            </div>
            <Target className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Potenziale Totale</p>
              <p className="text-3xl font-bold text-green-900 mt-1">€1.48M</p>
              <p className="text-xs text-green-700 mt-1">Prossimi 24 mesi</p>
            </div>
            <Award className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Clienti a Rischio</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">56</p>
              <p className="text-xs text-orange-700 mt-1">Intervento urgente</p>
            </div>
            <AlertCircle className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Client Segments */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Segmentazione Clienti AI
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientSegments.map((segment, idx) => (
            <div key={idx} className={`p-5 rounded-xl border-2 border-${segment.color}-200 bg-${segment.color}-50 hover:shadow-lg transition`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{segment.name}</h4>
                  <p className="text-sm text-gray-600">{segment.clients} clienti in questo segmento</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${segment.color}-200 text-${segment.color}-800`}>
                  AI {segment.confidence}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">LTV Medio Attuale</p>
                  <p className="text-2xl font-bold text-gray-900">€{segment.avgLTV.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Previsione 12m</p>
                  <p className="text-2xl font-bold text-gray-900">€{segment.predicted12m.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Crescita Prevista</span>
                  <span className={`text-lg font-bold ${
                    segment.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {segment.growth}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Clients Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Top Clienti - Analisi Dettagliata
        </h3>
        <div className="space-y-3">
          {topClients.map(client => (
            <div key={client.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="font-bold text-gray-900">{client.name}</h4>
                    <span className="text-xs text-gray-600">{client.pets} pet registrati</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.churnRisk < 10 ? 'bg-green-100 text-green-700' :
                      client.churnRisk < 20 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Churn Risk: {client.churnRisk}%
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">LTV Attuale</p>
                      <p className="text-lg font-bold text-gray-900">€{client.currentLTV.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Previsione 24m</p>
                      <p className="text-lg font-bold text-purple-600">€{client.predicted24m.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Prossima Visita</p>
                      <p className="text-lg font-bold text-gray-900">{client.nextVisit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">AI Action</p>
                      <p className="text-sm font-medium text-purple-600">{client.recommendedAction}</p>
                    </div>
                  </div>
                </div>
                <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                  Esegui Azione
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Raccomandazioni AI per Massimizzare LTV
        </h3>
        <div className="space-y-3">
          {aiRecommendations.map((rec, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${
              rec.priority === 'high' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-900">{rec.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.impact === 'high' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      Impact: {rec.impact.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                </div>
                <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium whitespace-nowrap">
                  Attiva Campagna
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}