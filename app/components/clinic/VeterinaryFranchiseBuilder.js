'use client';
import React, { useState } from 'react';
import { Building2, TrendingUp, Users, DollarSign, MapPin, Award, Target, BarChart3 } from 'lucide-react';

export default function VeterinaryFranchiseBuilder() {
  const [activeTab, setActiveTab] = useState('overview');

  const franchiseLocations = [
    { id: 1, name: 'VetBuddy Milano Centro', status: 'operational', revenue: 45000, profitMargin: 28, clients: 890, openDate: 'Gen 2023', rating: 4.8, manager: 'Dr. Santini' },
    { id: 2, name: 'VetBuddy Roma EUR', status: 'operational', revenue: 38000, profitMargin: 25, clients: 720, openDate: 'Mar 2023', rating: 4.6, manager: 'Dr.ssa Bianchi' },
    { id: 3, name: 'VetBuddy Torino Nord', status: 'opening', revenue: 0, profitMargin: 0, clients: 0, openDate: 'Mar 2024', rating: 0, manager: 'Dr. Verde' },
    { id: 4, name: 'VetBuddy Napoli Vomero', status: 'planning', revenue: 0, profitMargin: 0, clients: 0, openDate: 'Giu 2024', rating: 0, manager: 'TBD' }
  ];

  const expansionOpportunities = [
    { city: 'Firenze - Zona Rifredi', score: 94, population: 380000, vetDensity: 'Bassa', avgIncome: 'Alto', competition: 'Media', estimatedROI: '22 mesi', investmentNeeded: '€180.000' },
    { city: 'Bologna - Centro Storico', score: 89, population: 390000, vetDensity: 'Media', avgIncome: 'Alto', competition: 'Alta', estimatedROI: '26 mesi', investmentNeeded: '€210.000' },
    { city: 'Verona - Borgo Trento', score: 86, population: 260000, vetDensity: 'Bassa', avgIncome: 'Medio-Alto', competition: 'Bassa', estimatedROI: '20 mesi', investmentNeeded: '€165.000' }
  ];

  const franchiseKPIs = [
    { metric: 'Revenue Totale Rete', value: '€83.000', trend: '+18%', period: 'Mensile', color: 'purple' },
    { metric: 'Numero Cliniche Attive', value: '2', trend: '+1', period: 'In apertura', color: 'blue' },
    { metric: 'Clienti Totali Rete', value: '1.610', trend: '+12%', period: 'Ultimo mese', color: 'green' },
    { metric: 'Margine Medio Rete', value: '26.5%', trend: '+2.3%', period: 'Vs Q precedente', color: 'orange' }
  ];

  const standardizedServices = [
    { category: 'Core Services', services: ['Visite Generali', 'Vaccinazioni', 'Chirurgia Base', 'Pronto Soccorso'], compliance: 100 },
    { category: 'Premium Services', services: ['Fisioterapia', 'Diagnostica Avanzata', 'Oncologia', 'Cardiologia'], compliance: 85 },
    { category: 'Digital Tools', services: ['Prenotazione Online', 'Cartella Clinica Digitale', 'Telemedicina', 'App Mobile'], compliance: 95 },
    { category: 'Marketing & Brand', services: ['Sito Web Standard', 'Social Media Kit', 'Materiale Promozionale', 'SEO Locale'], compliance: 92 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-purple-600" />
            Veterinary Franchise Builder
          </h2>
          <p className="text-gray-600 mt-1">Sistema completo per creare e gestire la tua rete di cliniche veterinarie</p>
        </div>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Nuova Sede
        </button>
      </div>

      {/* Network KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {franchiseKPIs.map((kpi, idx) => (
          <div key={idx} className={`bg-gradient-to-br from-${kpi.color}-50 to-${kpi.color}-100 p-6 rounded-xl border border-${kpi.color}-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-${kpi.color}-600 text-sm font-medium`}>{kpi.metric}</p>
                <p className={`text-3xl font-bold text-${kpi.color}-900 mt-1`}>{kpi.value}</p>
                <p className={`text-xs text-${kpi.color}-700 mt-1 flex items-center gap-1`}>
                  <TrendingUp className="w-3 h-3" />
                  {kpi.trend} {kpi.period}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Panoramica Rete
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'locations' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Sedi Attive
          </button>
          <button
            onClick={() => setActiveTab('expansion')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'expansion' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Opportunità Espansione
          </button>
          <button
            onClick={() => setActiveTab('standards')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'standards' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Standard di Rete
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Map Placeholder */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Mappa Rete Italiana
            </h3>
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <p className="text-xl font-bold text-gray-900">Mappa Interattiva Sedi</p>
                <p className="text-sm text-gray-600 mt-2">2 sedi operative, 1 in apertura, 1 in pianificazione</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Performance Top Location
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sede</span>
                  <span className="font-bold text-gray-900">Milano Centro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue Mensile</span>
                  <span className="font-bold text-green-600">€45.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Margine</span>
                  <span className="font-bold text-green-600">28%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Obiettivi 2024
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nuove Sedi</span>
                  <span className="font-bold text-gray-900">+3 (33% fatto)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue Target</span>
                  <span className="font-bold text-gray-900">€500K (17% fatto)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Clienti Rete</span>
                  <span className="font-bold text-gray-900">5.000 (32% fatto)</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Crescita MoM
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-bold text-green-600">+18%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Clienti</span>
                  <span className="font-bold text-green-600">+12%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Margine Medio</span>
                  <span className="font-bold text-green-600">+2.3%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          {franchiseLocations.map(location => (
            <div key={location.id} className={`bg-white rounded-xl border-2 p-6 ${
              location.status === 'operational' ? 'border-green-300' :
              location.status === 'opening' ? 'border-blue-300' :
              'border-gray-300'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{location.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      location.status === 'operational' ? 'bg-green-100 text-green-700' :
                      location.status === 'opening' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {location.status === 'operational' ? '✓ Operativa' : location.status === 'opening' ? '🔧 In Apertura' : '📋 Pianificazione'}
                    </span>
                  </div>
                  {location.status === 'operational' && (
                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Revenue Mensile</p>
                        <p className="text-xl font-bold text-green-600">€{location.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Margine</p>
                        <p className="text-xl font-bold text-gray-900">{location.profitMargin}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Clienti Attivi</p>
                        <p className="text-xl font-bold text-gray-900">{location.clients}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Rating</p>
                        <p className="text-xl font-bold text-yellow-600">{location.rating}★</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Manager</p>
                        <p className="text-sm font-bold text-gray-900">{location.manager}</p>
                      </div>
                    </div>
                  )}
                  {location.status !== 'operational' && (
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-600">Apertura Prevista</p>
                        <p className="text-lg font-bold text-gray-900">{location.openDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Manager Designato</p>
                        <p className="text-lg font-bold text-gray-900">{location.manager}</p>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-3">Aperto: {location.openDate}</p>
                </div>
                <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                  Gestisci Sede
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expansion Tab */}
      {activeTab === 'expansion' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              AI Insights per Espansione
            </h3>
            <p className="text-sm text-gray-700">L'AI ha analizzato 150+ città italiane considerando 12 fattori (densità popolazione, reddito, competizione, densità veterinaria, domanda servizi premium). Ecco le top 3 opportunità.</p>
          </div>

          {expansionOpportunities.map((opportunity, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{opportunity.city}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      opportunity.score >= 90 ? 'bg-green-100 text-green-700' :
                      opportunity.score >= 80 ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      Score AI: {opportunity.score}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Popolazione</p>
                      <p className="text-lg font-bold text-gray-900">{opportunity.population.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Densità Veterinaria</p>
                      <p className="text-lg font-bold text-gray-900">{opportunity.vetDensity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Reddito Medio</p>
                      <p className="text-lg font-bold text-gray-900">{opportunity.avgIncome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Competizione</p>
                      <p className="text-lg font-bold text-gray-900">{opportunity.competition}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600">Investimento Necessario</p>
                      <p className="text-xl font-bold text-purple-600">{opportunity.investmentNeeded}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">ROI Stimato</p>
                      <p className="text-xl font-bold text-green-600">{opportunity.estimatedROI}</p>
                    </div>
                  </div>
                </div>
                <button className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium whitespace-nowrap">
                  Avvia Business Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standards Tab */}
      {activeTab === 'standards' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Standard di Servizio e Compliance Rete</h3>
          <div className="space-y-4">
            {standardizedServices.map((standard, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{standard.category}</h4>
                    <p className="text-sm text-gray-600">{standard.services.join(', ')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    standard.compliance === 100 ? 'bg-green-100 text-green-700' :
                    standard.compliance >= 90 ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {standard.compliance}% Compliance
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      standard.compliance === 100 ? 'bg-green-600' :
                      standard.compliance >= 90 ? 'bg-blue-600' :
                      'bg-yellow-600'
                    }`}
                    style={{ width: `${standard.compliance}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}