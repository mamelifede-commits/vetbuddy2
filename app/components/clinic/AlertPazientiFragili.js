'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle, Heart, Clock, Pill, Shield, Calendar, 
  Bell, CheckCircle, Phone, MessageCircle, TrendingUp, RefreshCw
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';
import api from '@/app/lib/api';

const PATIENT_CATEGORIES = [
  { id: 'senior', name: 'Senior (+7 anni)', icon: '👴', color: 'amber' },
  { id: 'cronici', name: 'Patologie Croniche', icon: '💊', color: 'orange' },
  { id: 'allergici', name: 'Allergici', icon: '🤧', color: 'red' },
  { id: 'terapia', name: 'In Terapia Continuativa', icon: '💉', color: 'purple' },
  { id: 'postop', name: 'Post-Operatori', icon: '🩹', color: 'blue' },
  { id: 'critici', name: 'Documenti Critici', icon: '📋', color: 'pink' },
];

export default function AlertPazientiFragili({ user, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('patients');
  const [fragilePatients, setFragilePatients] = useState([]);
  const [categoryCount, setCategoryCount] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [highUrgencyCount, setHighUrgencyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFragilePatients();
  }, []);

  const loadFragilePatients = async () => {
    setLoading(true);
    try {
      const data = await api.get('fragile-patients');
      setFragilePatients(data.patients || []);
      setCategoryCount(data.categoryCount || {});
      setTotalCount(data.totalCount || 0);
      setHighUrgencyCount(data.highUrgencyCount || 0);
    } catch (error) {
      console.error('Error loading fragile patients:', error);
      // Fallback to mock data if API fails
      setFragilePatients(getMockPatients());
      setTotalCount(6);
      setCategoryCount({ senior: 3, cronici: 4, allergici: 2, terapia: 2, postop: 1, critici: 1 });
      setHighUrgencyCount(3);
    } finally {
      setLoading(false);
    }
  };

  const getMockPatients = () => [
    { id: 1, name: 'Max', species: 'Cane', breed: 'Labrador', age: 11, owner: 'Maria Rossi', categories: ['senior', 'cronici'], conditions: ['Insufficienza renale cronica', 'Artrite'], medications: ['Benazepril 5mg', 'Meloxicam 1.5mg'], lastVisit: '2024-01-15', nextVisit: '2024-02-15', alerts: ['Controllo creatinina urgente', 'Promemoria farmaci'], urgency: 'high' },
    { id: 2, name: 'Luna', species: 'Gatto', breed: 'Persiano', age: 14, owner: 'Luca Bianchi', categories: ['senior', 'allergici'], conditions: ['Allergia alimentare', 'Ipertiroidismo'], medications: ['Dieta ipoallergenica', 'Metimazolo'], lastVisit: '2024-01-20', nextVisit: '2024-03-20', alerts: ['Dosaggio ormoni da ricontrollare'], urgency: 'medium' },
    { id: 3, name: 'Rocky', species: 'Cane', breed: 'Bulldog', age: 5, owner: 'Anna Verdi', categories: ['postop', 'terapia'], conditions: ['Post-chirurgia legamento crociato'], medications: ['Antibiotico', 'Antidolorifico'], lastVisit: '2024-02-01', nextVisit: '2024-02-14', alerts: ['Rimozione punti tra 3 giorni', 'Monitorare deambulazione'], urgency: 'high' },
    { id: 4, name: 'Milo', species: 'Cane', breed: 'Beagle', age: 9, owner: 'Carlo Neri', categories: ['senior', 'cronici'], conditions: ['Diabete mellito', 'Cataratta'], medications: ['Insulina 2UI bid'], lastVisit: '2024-01-10', nextVisit: '2024-02-10', alerts: ['Curva glicemica scaduta', 'Controllo oculistico annuale'], urgency: 'high' },
    { id: 5, name: 'Birba', species: 'Gatto', breed: 'Europeo', age: 16, owner: 'Sara Colombo', categories: ['senior', 'critici'], conditions: ['Insufficienza renale stadio 3', 'Cardiopatia'], medications: ['ACE inibitore', 'Dieta renale'], lastVisit: '2024-01-25', nextVisit: '2024-02-25', alerts: ['Esami ematochimici critici', 'ECG consigliato'], urgency: 'critical' },
    { id: 6, name: 'Thor', species: 'Cane', breed: 'Pastore Tedesco', age: 8, owner: 'Marco Ferrari', categories: ['allergici', 'cronici'], conditions: ['Dermatite atopica cronica'], medications: ['Apoquel', 'Shampoo medicato'], lastVisit: '2024-02-05', nextVisit: '2024-03-05', alerts: ['Patch test allergie da programmare'], urgency: 'low' },
  ];

  const filteredPatients = selectedCategory === 'all' 
    ? fragilePatients 
    : fragilePatients.filter(p => p.categories.includes(selectedCategory));

  const automatedActions = [
    { id: 1, type: 'promemoria', description: 'Promemoria automatico controllo 7 giorni prima', enabled: true, patients: totalCount },
    { id: 2, type: 'task', description: 'Task automatico per staff: "Preparare referti precedenti"', enabled: true, patients: totalCount },
    { id: 3, type: 'whatsapp', description: 'Messaggio WhatsApp personalizzato 24h prima', enabled: true, patients: Math.floor(totalCount * 0.7) },
    { id: 4, type: 'alert', description: 'Alert in agenda con badge rosso "PAZIENTE FRAGILE"', enabled: true, patients: totalCount },
    { id: 5, type: 'followup', description: 'Follow-up automatico 3 giorni post-visita', enabled: false, patients: 0 },
  ];

  const patientsWithNextVisit = fragilePatients.filter(p => p.nextVisit).length;
  const patientsWithAlerts = fragilePatients.filter(p => p.alerts && p.alerts.length > 0).length;

  const stats = [
    { label: 'Pazienti Fragili Totali', value: totalCount, icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50' },
    { label: 'Con Controllo Imminente', value: patientsWithNextVisit, icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Alert Attivi Oggi', value: patientsWithAlerts, icon: Bell, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Alta/Critica Urgenza', value: highUrgencyCount, icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
  ];

  // Update PATIENT_CATEGORIES with real counts
  const categoriesWithCounts = PATIENT_CATEGORIES.map(cat => ({
    ...cat,
    count: categoryCount[cat.id] || 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Caricamento pazienti fragili...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BackToDashboard onNavigate={onNavigate} />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alert Pazienti Fragili & Cronici</h1>
              <p className="text-gray-600">Monitoraggio continuo e attenzione particolare per i pazienti che richiedono cure speciali</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className={`h-12 w-12 ${stat.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="patients">Pazienti ({filteredPatients.length})</TabsTrigger>
            <TabsTrigger value="automations">Automazioni</TabsTrigger>
            <TabsTrigger value="stats">Statistiche</TabsTrigger>
          </TabsList>

          {/* Pazienti Tab */}
          <TabsContent value="patients" className="space-y-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'bg-purple-600' : ''}
              >
                Tutti ({fragilePatients.length})
              </Button>
              {categoriesWithCounts.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id ? `bg-${cat.color}-600` : ''}
                >
                  {cat.icon} {cat.name} ({cat.count})
                </Button>
              ))}
            </div>

            {/* Patient Cards */}
            <div className="space-y-4">
              {filteredPatients.map(patient => (
                <Card key={patient.id} className={`border-2 ${
                  patient.urgency === 'critical' ? 'border-red-400 bg-red-50' :
                  patient.urgency === 'high' ? 'border-orange-400 bg-orange-50' :
                  patient.urgency === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                  'border-gray-200'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-bold text-gray-900">{patient.name}</h3>
                          <Badge variant={
                            patient.urgency === 'critical' ? 'destructive' :
                            patient.urgency === 'high' ? 'default' : 'secondary'
                          }>
                            {patient.urgency === 'critical' ? '🚨 CRITICO' :
                             patient.urgency === 'high' ? '⚠️ URGENTE' :
                             patient.urgency === 'medium' ? '⚡ ATTENZIONE' : '✅ STABILE'}
                          </Badge>
                          {patient.categories.map(cat => {
                            const catInfo = PATIENT_CATEGORIES.find(c => c.id === cat);
                            return catInfo ? (
                              <Badge key={cat} variant="outline" className={`bg-${catInfo.color}-100 text-${catInfo.color}-700 border-${catInfo.color}-300`}>
                                {catInfo.icon} {catInfo.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-600">Specie & Razza</p>
                            <p className="font-semibold text-gray-900">{patient.species} - {patient.breed}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Età</p>
                            <p className="font-semibold text-gray-900">{patient.age} anni</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Proprietario</p>
                            <p className="font-semibold text-gray-900">{patient.owner}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Prossimo Controllo</p>
                            <p className="font-semibold text-purple-600">{new Date(patient.nextVisit).toLocaleDateString('it-IT')}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div>
                            <p className="text-xs text-gray-600 font-semibold mb-1">Condizioni:</p>
                            <div className="flex flex-wrap gap-2">
                              {patient.conditions.map((cond, idx) => (
                                <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700">
                                  {cond}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-semibold mb-1">Terapie in Corso:</p>
                            <div className="flex flex-wrap gap-2">
                              {patient.medications.map((med, idx) => (
                                <Badge key={idx} variant="outline" className="bg-green-50 text-green-700">
                                  💊 {med}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-yellow-800 mb-2">🔔 Alert Attivi:</p>
                          <ul className="space-y-1">
                            {patient.alerts.map((alert, idx) => (
                              <li key={idx} className="text-sm text-yellow-900 flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>{alert}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        <Button size="sm" variant="outline" className="whitespace-nowrap">
                          <Calendar className="h-4 w-4 mr-2" />
                          Agenda Visita
                        </Button>
                        <Button size="sm" variant="outline" className="whitespace-nowrap">
                          <Phone className="h-4 w-4 mr-2" />
                          Chiama Proprietario
                        </Button>
                        <Button size="sm" variant="outline" className="whitespace-nowrap">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Invia Messaggio
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Automazioni Tab */}
          <TabsContent value="automations" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="h-5 h-5 text-purple-600" />
                  Azioni Automatiche per Pazienti Fragili
                </h3>
                <div className="space-y-4">
                  {automatedActions.map(action => (
                    <div key={action.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{action.description}</p>
                        <p className="text-xs text-gray-600 mt-1">Attivo su {action.patients} pazienti</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={action.enabled ? 'default' : 'secondary'} className={action.enabled ? 'bg-green-600' : ''}>
                          {action.enabled ? '✅ Attivo' : '⏸️ Disattivato'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          {action.enabled ? 'Disattiva' : 'Attiva'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Statistiche Continuità di Cura
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Controlli Eseguiti (ultimi 30gg)</p>
                    <p className="text-4xl font-bold text-gray-900">47</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Controlli Mancati</p>
                    <p className="text-4xl font-bold text-red-600">3</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tasso Aderenza Terapie</p>
                    <p className="text-4xl font-bold text-green-600">91%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pazienti con Piano Salute</p>
                    <p className="text-4xl font-bold text-purple-600">34</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
