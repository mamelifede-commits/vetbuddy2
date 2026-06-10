'use client';
import React, { useState } from 'react';
import { Package, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, Truck, BarChart3, Calendar, Bell } from 'lucide-react';

export default function SupplyChainIntelligence() {
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [timeRange, setTimeRange] = useState('30');

  const suppliers = [
    { id: 1, name: 'MediVet Italia', status: 'optimal', deliveryScore: 98, costTrend: 'down', avgDelivery: '24h', reliability: 99 },
    { id: 2, name: 'PharmaPet Europe', status: 'warning', deliveryScore: 85, costTrend: 'up', avgDelivery: '48h', reliability: 92 },
    { id: 3, name: 'Surgical Supplies Pro', status: 'optimal', deliveryScore: 96, costTrend: 'stable', avgDelivery: '36h', reliability: 97 },
    { id: 4, name: 'VetLab Distributors', status: 'critical', deliveryScore: 72, costTrend: 'up', avgDelivery: '72h', reliability: 78 }
  ];

  const inventoryAlerts = [
    { item: 'Antibiotico Amoxicillina 500mg', currentStock: 12, minStock: 20, daysLeft: 3, urgency: 'high', suggestedOrder: 50 },
    { item: 'Vaccino Rabbia', currentStock: 8, minStock: 15, daysLeft: 7, urgency: 'medium', suggestedOrder: 30 },
    { item: 'Fiale Analgesico', currentStock: 45, minStock: 40, daysLeft: 14, urgency: 'low', suggestedOrder: 0 }
  ];

  const aiInsights = [
    { type: 'cost_saving', message: 'Cambiando fornitore per "Guanti Sterili" potresti risparmiare €340/mese (-23%)', action: 'Confronta prezzi', priority: 'high' },
    { type: 'demand_forecast', message: 'Previsto aumento del 35% nella richiesta di vaccini antiparassitari nei prossimi 30 giorni', action: 'Aumenta scorte', priority: 'medium' },
    { type: 'efficiency', message: 'Accorpando 3 ordini settimanali in 1 ordine bisettimanale risparmi €120 in costi di spedizione', action: 'Ottimizza ordini', priority: 'medium' },
    { type: 'risk', message: 'VetLab Distributors ha avuto 4 ritardi negli ultimi 30 giorni. Considera fornitori alternativi.', action: 'Valuta alternative', priority: 'high' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-purple-600" />
            Supply Chain Intelligence AI
          </h2>
          <p className="text-gray-600 mt-1">Gestione intelligente della catena di approvvigionamento veterinaria</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7">Ultimi 7 giorni</option>
            <option value="30">Ultimi 30 giorni</option>
            <option value="90">Ultimi 90 giorni</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Risparmio Potenziale</p>
              <p className="text-3xl font-bold text-green-900 mt-1">€2.340</p>
              <p className="text-xs text-green-700 mt-1">+12% vs mese scorso</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Affidabilità Fornitori</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">91.5%</p>
              <p className="text-xs text-blue-700 mt-1">Media consegne puntuali</p>
            </div>
            <Truck className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Articoli Sotto Scorta</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">7</p>
              <p className="text-xs text-orange-700 mt-1">3 urgenti da ordinare</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Ordini Automatici</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">23</p>
              <p className="text-xs text-purple-700 mt-1">Questo mese</p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* AI Insights Priority */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Insights AI Prioritari
        </h3>
        <div className="space-y-3">
          {aiInsights.map((insight, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${
              insight.priority === 'high' ? 'bg-red-50 border-red-500' :
              insight.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
              'bg-green-50 border-green-500'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{insight.message}</p>
                  <p className="text-xs text-gray-600 mt-1">AI Recommendation • {insight.type.replace('_', ' ').toUpperCase()}</p>
                </div>
                <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium whitespace-nowrap">
                  {insight.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-purple-600" />
          Performance Fornitori
        </h3>
        <div className="space-y-3">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      supplier.status === 'optimal' ? 'bg-green-100 text-green-700' :
                      supplier.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {supplier.status === 'optimal' ? '✓ Ottimale' : supplier.status === 'warning' ? '⚠ Attenzione' : '⚠ Critico'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-600">Delivery Score</p>
                      <p className="text-lg font-bold text-gray-900">{supplier.deliveryScore}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Affidabilità</p>
                      <p className="text-lg font-bold text-gray-900">{supplier.reliability}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Consegna Media</p>
                      <p className="text-lg font-bold text-gray-900">{supplier.avgDelivery}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Trend Costi</p>
                      <p className={`text-lg font-bold ${
                        supplier.costTrend === 'down' ? 'text-green-600' :
                        supplier.costTrend === 'up' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {supplier.costTrend === 'down' ? '↓ -5%' : supplier.costTrend === 'up' ? '↑ +8%' : '→ 0%'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-600" />
          Alert Inventario & Riordini Automatici
        </h3>
        <div className="space-y-3">
          {inventoryAlerts.map((alert, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{alert.item}</h4>
                  <div className="flex items-center gap-6 mt-2">
                    <div>
                      <p className="text-xs text-gray-600">Scorta Attuale</p>
                      <p className={`text-sm font-bold ${
                        alert.urgency === 'high' ? 'text-red-600' :
                        alert.urgency === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>{alert.currentStock} unità</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Scorta Minima</p>
                      <p className="text-sm font-bold text-gray-900">{alert.minStock} unità</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Giorni Rimanenti</p>
                      <p className="text-sm font-bold text-gray-900">{alert.daysLeft} giorni</p>
                    </div>
                    {alert.suggestedOrder > 0 && (
                      <div>
                        <p className="text-xs text-gray-600">Ordine Suggerito</p>
                        <p className="text-sm font-bold text-purple-600">{alert.suggestedOrder} unità</p>
                      </div>
                    )}
                  </div>
                </div>
                {alert.suggestedOrder > 0 && (
                  <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                    Ordina Automaticamente
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}