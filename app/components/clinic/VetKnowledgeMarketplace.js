'use client';
import React, { useState } from 'react';
import { Users, BookOpen, MessageCircle, Award, TrendingUp, Star, Search, Filter } from 'lucide-react';

export default function VetKnowledgeMarketplace() {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');

  const knowledgeItems = [
    { id: 1, type: 'case', title: 'Caso Clinico: Linfoma Multicentrico in Golden Retriever 8 anni', author: 'Dr. Marco Santini', specialty: 'Oncologia', rating: 4.9, reviews: 127, price: 'Gratuito', downloads: 1240, date: '5 Feb 2024' },
    { id: 2, type: 'protocol', title: 'Protocollo Chirurgico Avanzato: Ricostruzione Legamento Crociato', author: 'Dr.ssa Laura Bianchi', specialty: 'Chirurgia Ortopedica', rating: 5.0, reviews: 89, price: '€49', downloads: 456, date: '12 Feb 2024' },
    { id: 3, type: 'webinar', title: 'Webinar: Dermatologia Felina - Approccio Diagnostico Completo', author: 'Dr. Giuseppe Verde', specialty: 'Dermatologia', rating: 4.8, reviews: 234, price: '€89', downloads: 892, date: '18 Feb 2024' },
    { id: 4, type: 'research', title: 'Studio: Efficacia Nuovi Protocolli Anestesiologici in Pazienti Geriatrici', author: 'Dr.ssa Maria Rossi', specialty: 'Anestesiologia', rating: 4.7, reviews: 56, price: 'Gratuito', downloads: 678, date: '3 Feb 2024' }
  ];

  const myContributions = [
    { id: 1, title: 'Protocollo Pre-Operatorio Innovativo', type: 'protocol', views: 2340, downloads: 456, revenue: 890, rating: 4.8 },
    { id: 2, title: 'Caso Clinico: Torsione Gastrica Complessa', type: 'case', views: 1890, downloads: 234, revenue: 0, rating: 4.9 }
  ];

  const topContributors = [
    { name: 'Dr. Marco Santini', specialty: 'Oncologia', contributions: 47, rating: 4.9, followers: 1234 },
    { name: 'Dr.ssa Laura Bianchi', specialty: 'Chirurgia', contributions: 38, rating: 5.0, followers: 987 },
    { name: 'Dr. Giuseppe Verde', specialty: 'Dermatologia', contributions: 52, rating: 4.8, followers: 1456 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600" />
            Vet-to-Vet Knowledge Marketplace
          </h2>
          <p className="text-gray-600 mt-1">Condividi e acquista conoscenza veterinaria specializzata</p>
        </div>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Pubblica Contenuto
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">I Miei Guadagni</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">€890</p>
              <p className="text-xs text-purple-700 mt-1">Questo mese</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Mie Pubblicazioni</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">12</p>
              <p className="text-xs text-blue-700 mt-1">4.8★ rating medio</p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Contenuti Acquistati</p>
              <p className="text-3xl font-bold text-green-900 mt-1">28</p>
              <p className="text-xs text-green-700 mt-1">Nella mia library</p>
            </div>
            <Award className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Network</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">234</p>
              <p className="text-xs text-orange-700 mt-1">Colleghi connessi</p>
            </div>
            <Users className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'browse' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Esplora Marketplace
          </button>
          <button
            onClick={() => setActiveTab('my-content')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'my-content' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            I Miei Contenuti
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'library' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            La Mia Library
          </button>
        </div>
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <>
          {/* Search & Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cerca casi clinici, protocolli, webinar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtri
              </button>
            </div>
          </div>

          {/* Knowledge Items */}
          <div className="space-y-4">
            {knowledgeItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.type === 'case' ? 'bg-blue-100 text-blue-700' :
                        item.type === 'protocol' ? 'bg-purple-100 text-purple-700' :
                        item.type === 'webinar' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {item.type === 'case' ? 'Caso Clinico' : item.type === 'protocol' ? 'Protocollo' : item.type === 'webinar' ? 'Webinar' : 'Ricerca'}
                      </span>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="font-medium">{item.author}</span>
                      <span>•</span>
                      <span>{item.specialty}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{item.rating}</span>
                        <span className="text-gray-500">({item.reviews} recensioni)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📥 {item.downloads} download</span>
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <div className="text-2xl font-bold text-purple-600 mb-3">{item.price}</div>
                    <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
                      {item.price === 'Gratuito' ? 'Scarica' : 'Acquista'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* My Content Tab */}
      {activeTab === 'my-content' && (
        <div className="space-y-4">
          {myContributions.map(content => (
            <div key={content.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{content.title}</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Visualizzazioni</p>
                      <p className="text-xl font-bold text-gray-900">{content.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Download</p>
                      <p className="text-xl font-bold text-gray-900">{content.downloads}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Guadagni</p>
                      <p className="text-xl font-bold text-green-600">€{content.revenue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Rating</p>
                      <p className="text-xl font-bold text-yellow-600">{content.rating}★</p>
                    </div>
                  </div>
                </div>
                <button className="ml-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  Modifica
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Contributors */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Top Contributors del Mese
        </h3>
        <div className="space-y-3">
          {topContributors.map((contributor, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center font-bold text-purple-700">
                  #{idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{contributor.name}</h4>
                  <p className="text-sm text-gray-600">{contributor.specialty} • {contributor.contributions} contributi</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-600">Rating</p>
                  <p className="text-lg font-bold text-yellow-600">{contributor.rating}★</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Followers</p>
                  <p className="text-lg font-bold text-gray-900">{contributor.followers}</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                  Segui
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}