'use client';
import React, { useState } from 'react';
import { Utensils, Sparkles, Heart, TrendingUp, AlertCircle, Calendar, ShoppingCart } from 'lucide-react';

export default function PetNutritionAIChef() {
  const [selectedPet, setSelectedPet] = useState('max');

  const pets = [
    { id: 'max', name: 'Max', type: 'Cane', breed: 'Labrador', age: 5, weight: 32, activity: 'Alta', conditions: ['Allergia pollo', 'Sovrappeso'] },
    { id: 'luna', name: 'Luna', type: 'Gatto', breed: 'Persiano', age: 3, weight: 4.5, activity: 'Media', conditions: ['Insufficienza renale lieve'] }
  ];

  const currentPet = pets.find(p => p.id === selectedPet);

  const mealPlan = [
    { day: 'Lunedì', meals: [
      { time: 'Colazione (8:00)', recipe: 'Mix Salmone & Riso Integrale', calories: 420, protein: 28, notes: 'Anti-infiammatorio naturale' },
      { time: 'Cena (19:00)', recipe: 'Tacchino con Patate Dolci & Verdure', calories: 480, protein: 32, notes: 'Alto contenuto proteico' }
    ]},
    { day: 'Martedì', meals: [
      { time: 'Colazione (8:00)', recipe: 'Manzo Magro con Quinoa', calories: 445, protein: 30, notes: 'Perfetto per energia' },
      { time: 'Cena (19:00)', recipe: 'Pesce Bianco con Zucchine', calories: 390, protein: 26, notes: 'Leggero e digeribile' }
    ]}
  ];

  const nutritionGoals = [
    { metric: 'Peso Target', current: '32kg', target: '28kg', progress: 40, status: 'on-track' },
    { metric: 'Calorie Giornaliere', current: '900kcal', target: '850kcal', progress: 75, status: 'needs-attention' },
    { metric: 'Proteine', current: '28%', target: '30%', progress: 93, status: 'excellent' },
    { metric: 'Idratazione', current: '1.2L', target: '1.5L', progress: 80, status: 'on-track' }
  ];

  const aiRecommendations = [
    { type: 'recipe', title: 'Nuova Ricetta Consigliata', description: 'Prova "Agnello con Lenticchie" - perfetto per la sua allergia e aiuta la perdita di peso. +12% proteine, -8% grassi.', priority: 'high' },
    { type: 'supplement', title: 'Supplemento Omega-3', description: 'Aggiungi olio di salmone (1 cucchiaino/giorno) per migliorare pelo e ridurre infiammazioni articolari.', priority: 'medium' },
    { type: 'alert', title: 'Attenzione Porzioni Sera', description: 'Le porzioni serali sono state troppo abbondanti negli ultimi 3 giorni. Riduci di 15% per raggiungere il target.', priority: 'high' }
  ];

  const shoppingList = [
    { item: 'Salmone fresco', quantity: '1.5kg', price: '€18.90', needed: 'Tra 2 giorni' },
    { item: 'Riso integrale biologico', quantity: '2kg', price: '€5.40', needed: 'Tra 5 giorni' },
    { item: 'Patate dolci', quantity: '1kg', price: '€3.20', needed: 'Tra 3 giorni' },
    { item: 'Olio di salmone', quantity: '250ml', price: '€12.50', needed: 'Urgente' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Utensils className="w-7 h-7 text-purple-600" />
            Pet Nutrition AI Chef
          </h2>
          <p className="text-gray-600 mt-1">Piano nutrizionale personalizzato e ricette AI per ogni pet</p>
        </div>
        <select
          value={selectedPet}
          onChange={(e) => setSelectedPet(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {pets.map(pet => (
            <option key={pet.id} value={pet.id}>{pet.name} ({pet.type})</option>
          ))}
        </select>
      </div>

      {/* Pet Profile Card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-purple-900 mb-3">{currentPet?.name} - Profilo Nutrizionale</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-purple-700">Razza</p>
                <p className="text-lg font-bold text-purple-900">{currentPet?.breed}</p>
              </div>
              <div>
                <p className="text-xs text-purple-700">Età</p>
                <p className="text-lg font-bold text-purple-900">{currentPet?.age} anni</p>
              </div>
              <div>
                <p className="text-xs text-purple-700">Peso</p>
                <p className="text-lg font-bold text-purple-900">{currentPet?.weight}kg</p>
              </div>
              <div>
                <p className="text-xs text-purple-700">Attività</p>
                <p className="text-lg font-bold text-purple-900">{currentPet?.activity}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-purple-700 mb-2">Condizioni Speciali:</p>
              <div className="flex gap-2">
                {currentPet?.conditions.map((condition, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-bold">
                    ⚠ {condition}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Genera Nuovo Piano
          </button>
        </div>
      </div>

      {/* Nutrition Goals */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Obiettivi Nutrizionali
        </h3>
        <div className="space-y-4">
          {nutritionGoals.map((goal, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{goal.metric}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Attuale: <span className="font-bold">{goal.current}</span></span>
                  <span className="text-sm text-gray-600">Target: <span className="font-bold text-purple-600">{goal.target}</span></span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    goal.status === 'excellent' ? 'bg-green-100 text-green-700' :
                    goal.status === 'on-track' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {goal.progress}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    goal.status === 'excellent' ? 'bg-green-600' :
                    goal.status === 'on-track' ? 'bg-blue-600' :
                    'bg-yellow-600'
                  }`}
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Meal Plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Piano Pasti Settimanale AI
        </h3>
        <div className="space-y-4">
          {mealPlan.map((day, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-3">{day.day}</h4>
              <div className="space-y-3">
                {day.meals.map((meal, mIdx) => (
                  <div key={mIdx} className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Utensils className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-gray-700">{meal.time}</span>
                        </div>
                        <h5 className="font-bold text-gray-900 mb-2">{meal.recipe}</h5>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{meal.calories} kcal</span>
                          <span>•</span>
                          <span>{meal.protein}g proteine</span>
                          <span>•</span>
                          <span className="text-purple-600 font-medium">💡 {meal.notes}</span>
                        </div>
                      </div>
                      <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                        Vedi Ricetta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Raccomandazioni AI Personalizzate
        </h3>
        <div className="space-y-3">
          {aiRecommendations.map((rec, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${
              rec.priority === 'high' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{rec.title}</h4>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                </div>
                <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium whitespace-nowrap">
                  Applica
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shopping List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-purple-600" />
          Lista Spesa Automatica
        </h3>
        <div className="space-y-2">
          {shoppingList.map((item, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition">
              <div className="flex items-center gap-4">
                <input type="checkbox" className="w-5 h-5" />
                <div>
                  <h4 className="font-bold text-gray-900">{item.item}</h4>
                  <p className="text-sm text-gray-600">{item.quantity} • {item.price}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                item.needed === 'Urgente' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {item.needed}
              </span>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
          Ordina Tutto Automaticamente
        </button>
      </div>
    </div>
  );
}