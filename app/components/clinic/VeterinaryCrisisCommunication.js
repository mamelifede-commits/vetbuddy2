'use client';
import React, { useState } from 'react';
import { AlertTriangle, MessageCircle, Users, Clock, CheckCircle, Send, Bell } from 'lucide-react';

export default function VeterinaryCrisisCommunication() {
  const [activeTab, setActiveTab] = useState('active');

  const activeCrises = [
    { id: 1, type: 'epidemic', title: 'Focolaio Parvovirus - Zona Nord', severity: 'high', affectedClients: 23, messagesSent: 67, timeStarted: '2h fa', status: 'active', clientsReached: 95 },
    { id: 2, type: 'recall', title: 'Richiamo Lotto Cibo Contaminato', severity: 'critical', affectedClients: 89, messagesSent: 267, timeStarted: '45min fa', status: 'active', clientsReached: 78 }
  ];

  const pastCrises = [
    { id: 3, type: 'weather', title: 'Allerta Neve - Chiusura Clinica', severity: 'medium', affectedClients: 156, messagesSent: 312, timeStarted: '3 giorni fa', status: 'resolved', clientsReached: 100 },
    { id: 4, type: 'epidemic', title: 'Influenza Aviaria - Allerta Preventiva', severity: 'high', affectedClients: 45, messagesSent: 135, timeStarted: '1 settimana fa', status: 'resolved', clientsReached: 98 }
  ];

  const templates = [
    { id: 1, name: 'Focolaio Malattia Infettiva', category: 'Epidemic', usage: 12 },
    { id: 2, name: 'Richiamo Prodotto', category: 'Product Recall', usage: 8 },
    { id: 3, name: 'Chiusura Emergenza', category: 'Operations', usage: 15 },
    { id: 4, name: 'Allerta Meteo', category: 'Weather', usage: 23 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-red-600" />
            Veterinary Crisis Communication AI
          </h2>
          <p className="text-gray-600 mt-1">Gestione comunicazioni di crisi automatizzate e intelligenti</p>
        </div>
        <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Nuova Allerta Crisi
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Crisi Attive</p>
              <p className="text-3xl font-bold text-red-900 mt-1">2</p>
              <p className="text-xs text-red-700 mt-1">Gestione in corso</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Clienti da Contattare</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">112</p>
              <p className="text-xs text-orange-700 mt-1">22% non ancora raggiunti</p>
            </div>
            <Users className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Messaggi Inviati</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">334</p>
              <p className="text-xs text-blue-700 mt-1">Ultima ora</p>
            </div>
            <Send className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Tasso di Risposta</p>
              <p className="text-3xl font-bold text-green-900 mt-1">87%</p>
              <p className="text-xs text-green-700 mt-1">Tempo medio: 12min</p>
            </div>
            <MessageCircle className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'active' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Crisi Attive ({activeCrises.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'templates' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Template Messaggi
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'history' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Storico Crisi
          </button>
        </div>
      </div>

      {/* Active Crises */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeCrises.map(crisis => (
            <div key={crisis.id} className={`bg-white rounded-xl border-2 p-6 ${
              crisis.severity === 'critical' ? 'border-red-500 bg-red-50' :
              crisis.severity === 'high' ? 'border-orange-500 bg-orange-50' :
              'border-yellow-500 bg-yellow-50'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      crisis.severity === 'critical' ? 'bg-red-200 text-red-800' :
                      crisis.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      ⚠ {crisis.severity === 'critical' ? 'CRITICO' : crisis.severity === 'high' ? 'ALTO' : 'MEDIO'}
                    </span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {crisis.timeStarted}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{crisis.title}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Clienti Coinvolti</p>
                      <p className="text-2xl font-bold text-gray-900">{crisis.affectedClients}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Messaggi Inviati</p>
                      <p className="text-2xl font-bold text-gray-900">{crisis.messagesSent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Clienti Raggiunti</p>
                      <p className="text-2xl font-bold text-green-600">{crisis.clientsReached}%</p>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap">
                    Invia Aggiornamento
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium whitespace-nowrap">
                    Vedi Dettagli
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium whitespace-nowrap">
                    Risolvi Crisi
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Progresso Comunicazioni</span>
                  <span className="text-xs font-bold text-gray-900">{crisis.clientsReached}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      crisis.clientsReached >= 90 ? 'bg-green-600' :
                      crisis.clientsReached >= 70 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${crisis.clientsReached}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Template Messaggi Predefiniti</h3>
          <div className="space-y-3">
            {templates.map(template => (
              <div key={template.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600">Categoria: {template.category} • Usato {template.usage} volte</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                  Usa Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {pastCrises.map(crisis => (
            <div key={crisis.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-xs text-gray-600">{crisis.timeStarted}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{crisis.title}</h3>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>{crisis.affectedClients} clienti coinvolti</span>
                    <span>•</span>
                    <span>{crisis.messagesSent} messaggi inviati</span>
                    <span>•</span>
                    <span className="text-green-600 font-bold">{crisis.clientsReached}% raggiunti</span>
                  </div>
                </div>
                <button className="ml-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                  Vedi Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}