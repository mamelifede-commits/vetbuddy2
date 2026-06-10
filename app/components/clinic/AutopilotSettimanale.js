'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap, Users, CalendarX, Bell, FileText, Star, Heart, TrendingUp,
  CheckCircle, Clock, Euro, ArrowRight, Send, Calendar, MessageCircle
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

export default function AutopilotSettimanale({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('questa-settimana');

  // Azioni consigliate questa settimana
  const weeklyActions = [
    {
      id: 1,
      type: 'dormienti',
      priority: 'high',
      icon: Users,
      title: 'Ricontatta 14 clienti dormienti',
      description: '14 clienti non visitano da oltre 6 mesi. Ultimo valore medio: €167/cliente.',
      estimatedValue: '€2.340',
      estimatedRecovery: '40-50%',
      clients: 14,
      channel: 'WhatsApp + Email',
      messageReady: true,
      linkedModule: 'Predictive Client Churn',
      action: 'Avvia Campagna Riattivazione',
      details: [
        '8 clienti inattivi da 6-9 mesi',
        '6 clienti inattivi da 9-12 mesi',
        'Valore medio storico: €167/cliente',
        'Tasso conversione stimato: 45%'
      ]
    },
    {
      id: 2,
      type: 'vaccini',
      priority: 'high',
      icon: Bell,
      title: 'Recupera 12 richiami vaccinali scaduti',
      description: 'Vaccini scaduti da oltre 30 giorni. I proprietari potrebbero aver dimenticato.',
      estimatedValue: '€780',
      estimatedRecovery: '60-70%',
      clients: 12,
      channel: 'WhatsApp',
      messageReady: true,
      linkedModule: 'Automazioni Richiami',
      action: 'Invia Promemoria Vaccini',
      details: [
        '7 vaccini polivalenti',
        '3 vaccini antirabbici',
        '2 vaccini gatti (trivalente)',
        'Prezzo medio: €65/vaccino'
      ]
    },
    {
      id: 3,
      type: 'noshow',
      priority: 'critical',
      icon: CalendarX,
      title: 'Previeni 3 no-show a rischio oggi',
      description: 'Appuntamenti non confermati con storico no-show del proprietario.',
      estimatedValue: '€420',
      estimatedRecovery: '70-80%',
      clients: 3,
      channel: 'SMS + WhatsApp',
      messageReady: true,
      linkedModule: 'No-Show Recovery',
      action: 'Invia Conferme Urgenti',
      details: [
        '1 chirurgia ore 10:00 (€180)',
        '1 visita specialistica ore 14:00 (€120)',
        '1 visita generale ore 16:30 (€120)',
        'Tutti e 3 hanno storico no-show'
      ]
    },
    {
      id: 4,
      type: 'preventivi',
      priority: 'medium',
      icon: FileText,
      title: 'Follow-up su 5 preventivi in sospeso',
      description: 'Preventivi inviati ma non ancora accettati. Valore totale €1.150.',
      estimatedValue: '€1.150',
      estimatedRecovery: '35-45%',
      clients: 5,
      channel: 'Telefono + WhatsApp',
      messageReady: false,
      linkedModule: 'Preventivi Digitali',
      action: 'Contatta Proprietari',
      details: [
        'Chirurgia ortopedica: €480 (15 giorni fa)',
        'Pulizia dentale: €280 (8 giorni fa)',
        'Sterilizzazione: €180 (12 giorni fa)',
        'Ecografia: €120 (5 giorni fa)',
        'Radiografia: €90 (20 giorni fa)'
      ]
    },
    {
      id: 5,
      type: 'fragili',
      priority: 'medium',
      icon: Heart,
      title: 'Follow-up 8 pazienti fragili senza controllo',
      description: 'Pazienti cronici o senior che necessitano controllo periodico.',
      estimatedValue: '€960',
      estimatedRecovery: '80-90%',
      clients: 8,
      channel: 'Telefono',
      messageReady: true,
      linkedModule: 'Alert Pazienti Fragili',
      action: 'Programma Controlli',
      details: [
        '3 pazienti con insufficienza renale',
        '2 pazienti diabetici',
        '2 pazienti senior (>10 anni)',
        '1 paziente post-operatorio'
      ]
    },
    {
      id: 6,
      type: 'recensioni',
      priority: 'low',
      icon: Star,
      title: 'Richiedi recensioni a 18 clienti soddisfatti',
      description: 'Clienti con visite recenti positive. Momento ideale per chiedere recensione.',
      estimatedValue: 'Reputazione',
      estimatedRecovery: '40-50%',
      clients: 18,
      channel: 'Email',
      messageReady: true,
      linkedModule: 'Recensioni Automatiche',
      action: 'Invia Richieste Recensioni',
      details: [
        '18 clienti con visita nelle ultime 2 settimane',
        'Nessuna recensione lasciata in passato',
        'Tutti con esito positivo della visita',
        'Tasso risposta stimato: 45%'
      ]
    },
  ];

  const completedActions = [
    { date: '2024-02-05', action: 'Campagna riattivazione dormienti', results: '6/12 clienti prenotati', value: '€890' },
    { date: '2024-02-03', action: 'Promemoria vaccini urgenti', results: '8/10 vaccini prenotati', value: '€520' },
    { date: '2024-01-29', action: 'Follow-up preventivi', results: '2/4 preventivi accettati', value: '€660' },
  ];

  const stats = [
    { label: 'Azioni Consigliate', value: weeklyActions.length, icon: Zap, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Valore Recuperabile', value: '€5.650+', icon: Euro, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Clienti da Contattare', value: 60, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Azioni Critiche', value: 1, icon: Bell, color: 'text-red-600', bgColor: 'bg-red-50' },
  ];

  const getPriorityBadge = (priority) => {
    if (priority === 'critical') return <Badge className="bg-red-600 text-white">🔴 Critico</Badge>;
    if (priority === 'high') return <Badge className="bg-orange-600 text-white">⚠️ Alta</Badge>;
    if (priority === 'medium') return <Badge className="bg-yellow-600 text-white">🟡 Media</Badge>;
    return <Badge className="bg-gray-600 text-white">⚪ Bassa</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BackToDashboard onNavigate={onNavigate} />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Autopilot Settimanale</h1>
              <p className="text-gray-600">Le azioni prioritarie che VetBuddy consiglia di fare questa settimana per recuperare valore</p>
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
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="questa-settimana">Questa Settimana ({weeklyActions.length})</TabsTrigger>
            <TabsTrigger value="completate">Azioni Completate</TabsTrigger>
          </TabsList>

          {/* Questa Settimana */}
          <TabsContent value="questa-settimana" className="space-y-4">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-xl p-6 mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">💡 Questa settimana VetBuddy consiglia di:</h3>
              <p className="text-gray-700 text-sm">
                Avviare <strong>{weeklyActions.length} azioni prioritarie</strong> per recuperare <strong>€5.650+ di valore</strong> che la clinica sta perdendo. 
                Ogni azione è pronta con messaggi, destinatari e canali ottimizzati.
              </p>
            </div>

            {weeklyActions.map((action, idx) => (
              <Card key={action.id} className={`border-2 ${
                action.priority === 'critical' ? 'border-red-400 bg-red-50' :
                action.priority === 'high' ? 'border-orange-400 bg-orange-50' :
                action.priority === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                'border-gray-200'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`h-14 w-14 ${
                        action.priority === 'critical' ? 'bg-red-200' :
                        action.priority === 'high' ? 'bg-orange-200' :
                        action.priority === 'medium' ? 'bg-yellow-200' :
                        'bg-gray-200'
                      } rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <action.icon className="h-7 w-7 text-gray-900" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{action.title}</h3>
                          {getPriorityBadge(action.priority)}
                          {action.messageReady && (
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              ✅ Messaggio pronto
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3">{action.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-600">Valore Stimato</p>
                            <p className="text-lg font-bold text-green-600">{action.estimatedValue}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Recovery Stimato</p>
                            <p className="text-lg font-bold text-purple-600">{action.estimatedRecovery}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Clienti Target</p>
                            <p className="text-lg font-bold text-blue-600">{action.clients}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Canale</p>
                            <p className="text-sm font-bold text-gray-900">{action.channel}</p>
                          </div>
                        </div>

                        <div className="bg-white/80 rounded-lg p-3 mb-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Dettagli:</p>
                          <ul className="space-y-1">
                            {action.details.map((detail, dIdx) => (
                              <li key={dIdx} className="text-xs text-gray-600 flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <ArrowRight className="h-3 w-3" />
                          <span>Collegato a: <strong>{action.linkedModule}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap">
                        <Send className="h-4 w-4 mr-2" />
                        {action.action}
                      </Button>
                      <Button variant="outline" size="sm" className="whitespace-nowrap">
                        Vedi Modulo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Completate */}
          <TabsContent value="completate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Azioni Completate Recentemente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedActions.map((completed, idx) => (
                    <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-green-600 text-white">✅ Completata</Badge>
                            <span className="text-xs text-gray-600">{completed.date}</span>
                          </div>
                          <h4 className="font-bold text-gray-900 mb-1">{completed.action}</h4>
                          <p className="text-sm text-gray-700">
                            <strong>Risultati:</strong> {completed.results}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-gray-600">Valore Recuperato</p>
                          <p className="text-2xl font-bold text-green-600">{completed.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
