'use client';
import React, { useState } from 'react';
import { TrendingDown, AlertTriangle, Users, Target, Zap, MessageCircle, DollarSign } from 'lucide-react';

export default function PredictiveClientChurn() {
  const [timeRange, setTimeRange] = useState('30');

  const churnRiskClients = [
    { id: 1, name: 'Marco Ferrari', pets: 1, lastVisit: '89 giorni fa', churnProbability: 87, ltvAtRisk: 3450, predictedChurnDate: '10 giorni', recommendedAction: 'Email + Sconto 15%', sentiment: 'negative' },
    { id: 2, name: 'Sara Neri', pets: 2, lastVisit: '65 giorni fa', churnProbability: 72, ltvAtRisk: 2890, predictedChurnDate: '18 giorni', recommendedAction: 'Chiamata personale', sentiment: 'neutral' },
    { id: 3, name: 'Giuseppe Mancini', pets: 1, lastVisit: '110 giorni fa', churnProbability: 94, ltvAtRisk: 4120, predictedChurnDate: '3 giorni', recommendedAction: 'Intervento urgente', sentiment: 'very-negative' },
    { id: 4, name: 'Francesca Ricci', pets: 3, lastVisit: '45 giorni fa', churnProbability: 58, ltvAtRisk: 5670, predictedChurnDate: '25 giorni', recommendedAction: 'Offerta pacchetto family', sentiment: 'neutral' }
  ];

  const churnFactors = [
    { factor: 'Frequenza Visite Diminuita', impact: 'high', percentage: 45, description: 'Clienti che passano da mensile a >60 giorni' },
    { factor: 'Feedback Negativo', impact: 'critical', percentage: 23, description: 'Recensioni <3 stelle o reclami recenti' },
    { factor: 'Competitor Vicini', impact: 'medium', percentage: 18, description: 'Nuova clinica aperta nel raggio 2km' },
    { factor: 'Prezzo Percepito Alto', impact: 'high', percentage: 31, description: 'Clienti che rifiutano procedure consigliate' }
  ];

  const retentionCampaigns = [
    { id: 1, name: 'Win-back VIP Clients', target: 'Clienti ad alto valore (>80% churn)', clients: 12, estimatedROI: '+€18.500', status: 'active', successRate: 67 },
    { id: 2, name: 'Re-engagement Medio Rischio', target: 'Clienti 50-70% churn', clients: 34, estimatedROI: '+€12.300', status: 'draft', successRate: 0 },
    { id: 3, name: 'Loyalty Booster', target: 'Clienti fedeli a rischio', clients: 23, estimatedROI: '+€8.900', status: 'scheduled', successRate: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingDown className="w-7 h-7 text-red-600" />
            Predictive Client Churn AI
          </h2>
          <p className="text-gray-600 mt-1">Previsione e prevenzione automatica dell'abbandono clienti</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="7">Prossimi 7 giorni</option>
          <option value="30">Prossimi 30 giorni</option>
          <option value="90">Prossimi 90 giorni</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Clienti Alto Rischio</p>
              <p className="text-3xl font-bold text-red-900 mt-1">47</p>
              <p className="text-xs text-red-700 mt-1">>70% probabilità churn</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Revenue a Rischio</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">€67K</p>
              <p className="text-xs text-orange-700 mt-1">LTV potenziale perso</p>
            </div>
            <DollarSign className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Clienti Recuperati</p>
              <p className="text-3xl font-bold text-green-900 mt-1">23</p>
              <p className="text-xs text-green-700 mt-1">Questo mese (+€18.5K)</p>
            </div>
            <Target className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Retention Rate</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">82.3%</p>
              <p className="text-xs text-purple-700 mt-1">+4.2% con AI attivo</p>
            </div>
            <Users className="w-12 h-12 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* High Risk Clients */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Clienti ad Alto Rischio Churn - Azione Immediata
        </h3>
        <div className="space-y-3">
          {churnRiskClients.map(client => (
            <div key={client.id} className={`p-5 rounded-lg border-2 ${
              client.churnProbability >= 80 ? 'bg-red-50 border-red-300' :
              client.churnProbability >= 60 ? 'bg-orange-50 border-orange-300' :
              'bg-yellow-50 border-yellow-300'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="font-bold text-gray-900 text-lg">{client.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      client.churnProbability >= 80 ? 'bg-red-200 text-red-800' :
                      client.churnProbability >= 60 ? 'bg-orange-200 text-orange-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {client.churnProbability}% Rischio Churn
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.sentiment === 'very-negative' ? 'bg-red-100 text-red-700' :
                      client.sentiment === 'negative' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      Sentiment: {client.sentiment === 'very-negative' ? 'Molto Negativo' : client.sentiment === 'negative' ? 'Negativo' : 'Neutro'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Pet Registrati</p>
                      <p className="text-lg font-bold text-gray-900">{client.pets}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Ultima Visita</p>
                      <p className="text-lg font-bold text-gray-900">{client.lastVisit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">LTV a Rischio</p>
                      <p className="text-lg font-bold text-red-600">€{client.ltvAtRisk.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Churn Previsto</p>
                      <p className="text-lg font-bold text-gray-900">{client.predictedChurnDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">AI Action</p>
                      <p className="text-sm font-bold text-purple-600">{client.recommendedAction}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium whitespace-nowrap">
                    Avvia Campagna
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium whitespace-nowrap">
                    Dettagli
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Churn Factors Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Analisi Fattori di Churn
        </h3>
        <div className="space-y-4">
          {churnFactors.map((factor, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    factor.impact === 'critical' ? 'bg-red-100 text-red-700' :
                    factor.impact === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {factor.impact.toUpperCase()}
                  </span>
                  <span className="font-bold text-gray-900">{factor.factor}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{factor.percentage}% dei casi</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    factor.impact === 'critical' ? 'bg-red-600' :
                    factor.impact === 'high' ? 'bg-orange-600' :
                    'bg-yellow-600'
                  }`}
                  style={{ width: `${factor.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retention Campaigns */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-600" />
          Campagne Retention Attive
        </h3>
        <div className="space-y-3">
          {retentionCampaigns.map(campaign => (
            <div key={campaign.id} className="p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900 text-lg">{campaign.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                      campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign.status === 'active' ? '✓ Attiva' : campaign.status === 'scheduled' ? '📅 Programmata' : '📋 Bozza'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{campaign.target}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Clienti Target</p>
                      <p className="text-xl font-bold text-gray-900">{campaign.clients}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">ROI Stimato</p>
                      <p className="text-xl font-bold text-green-600">{campaign.estimatedROI}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Success Rate</p>
                      <p className="text-xl font-bold text-purple-600">{campaign.successRate > 0 ? `${campaign.successRate}%` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                  {campaign.status === 'draft' ? 'Attiva' : 'Gestisci'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}