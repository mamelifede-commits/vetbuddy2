'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText, Euro, Clock, CheckCircle, XCircle, AlertCircle, Send,
  Eye, Calendar, TrendingUp, Users, Download, RefreshCw
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';
import api from '@/app/lib/api';

export default function PreventiviDigitali({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('aperti');
  const [preventivi, setPreventivi] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreventivi();
  }, []);

  const loadPreventivi = async () => {
    setLoading(true);
    try {
      const data = await api.get('estimates');
      setPreventivi(data.estimates || []);
      setAnalytics(data.analytics || null);
    } catch (error) {
      console.error('Error loading preventivi:', error);
      // Fallback to mock data
      setPreventivi(getMockPreventivi());
      setAnalytics(getMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getMockPreventivi = () => [
    {
      id: 1,
      numero: 'PREV-2024-045',
      data: '2024-02-01',
      cliente: 'Maria Rossi',
      pet: 'Max (Labrador, 8 anni)',
      servizio: 'Chirurgia ortopedica - Ricostruzione legamento crociato',
      importo: 480,
      validita: '2024-02-15',
      stato: 'inviato',
      dataInvio: '2024-02-01',
      dataVisualizzazione: '2024-02-02',
      giorniDaInvio: 9,
      note: 'Include anestesia, degenza 24h, farmaci post-operatori'
    },
    {
      id: 2,
      numero: 'PREV-2024-044',
      data: '2024-02-03',
      cliente: 'Luca Bianchi',
      pet: 'Luna (Gatto Persiano, 6 anni)',
      servizio: 'Pulizia dentale completa con ablazione tartaro',
      importo: 280,
      validita: '2024-02-17',
      stato: 'visualizzato',
      dataInvio: '2024-02-03',
      dataVisualizzazione: '2024-02-04',
      giorniDaInvio: 7,
      note: 'Anestesia generale, antibiotico, controllo post 7gg'
    },
    {
      id: 3,
      numero: 'PREV-2024-043',
      data: '2024-01-25',
      cliente: 'Anna Verdi',
      pet: 'Rocky (Bulldog, 4 anni)',
      servizio: 'Sterilizzazione',
      importo: 180,
      validita: '2024-02-10',
      stato: 'inviato',
      dataInvio: '2024-01-25',
      dataVisualizzazione: null,
      giorniDaInvio: 16,
      note: 'Include visita pre-operatoria e controllo post-operatorio'
    },
    {
      id: 4,
      numero: 'PREV-2024-042',
      data: '2024-02-06',
      cliente: 'Marco Ferrari',
      pet: 'Milo (Beagle, 7 anni)',
      servizio: 'Ecografia addominale completa',
      importo: 120,
      validita: '2024-02-20',
      stato: 'visualizzato',
      dataInvio: '2024-02-06',
      dataVisualizzazione: '2024-02-06',
      giorniDaInvio: 4,
      note: 'Preparazione: digiuno 12h'
    },
    {
      id: 5,
      numero: 'PREV-2024-041',
      data: '2024-01-20',
      cliente: 'Sara Neri',
      pet: 'Birba (Gatto, 3 anni)',
      servizio: 'Radiografia torace',
      importo: 90,
      validita: '2024-02-05',
      stato: 'scaduto',
      dataInvio: '2024-01-20',
      dataVisualizzazione: '2024-01-21',
      giorniDaInvio: 21,
      note: 'Per sospetta patologia respiratoria'
    },
  ];

  const getMockAnalytics = () => ({
    totalEstimates: 9,
    statusCount: { draft: 0, sent: 4, accepted: 2, declined: 1, expired: 1 },
    totalValue: 2290,
    acceptedValue: 670,
    pendingValue: 1070,
    conversionRate: 67,
    averageValue: 254,
    estimatesNeedingFollowUp: 2
  });

  const preventiviAccettati = preventivi.filter(p => p.status === 'accepted');
  const preventiviRifiutati = preventivi.filter(p => p.status === 'declined');
  const preventiviAperti = preventivi.filter(p => p.status === 'sent' || p.status === 'draft');

  const stats = analytics ? [
    { label: 'Preventivi Aperti', value: analytics.statusCount.sent + analytics.statusCount.draft, icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Valore Totale Aperti', value: `€${analytics.pendingValue.toLocaleString()}`, icon: Euro, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Da Follow-up Urgente', value: analytics.estimatesNeedingFollowUp, icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Tasso Accettazione', value: `${analytics.conversionRate}%`, icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ] : [];

  const getStatoBadge = (stato) => {
    if (stato === 'sent' || stato === 'inviato') return <Badge className="bg-blue-600 text-white">📤 Inviato</Badge>;
    if (stato === 'visualizzato') return <Badge className="bg-yellow-600 text-white">👁️ Visualizzato</Badge>;
    if (stato === 'accepted' || stato === 'accettato') return <Badge className="bg-green-600 text-white">✅ Accettato</Badge>;
    if (stato === 'declined' || stato === 'rifiutato') return <Badge className="bg-red-600 text-white">❌ Rifiutato</Badge>;
    if (stato === 'expired' || stato === 'scaduto') return <Badge className="bg-gray-600 text-white">⏰ Scaduto</Badge>;
    return <Badge variant="outline">📄 Draft</Badge>;
  };

  const getUrgenzaBadge = (giorni) => {
    if (!giorni) return null;
    if (giorni > 14) return <Badge className="bg-red-100 text-red-700">🔴 Urgente ({giorni}gg)</Badge>;
    if (giorni > 7) return <Badge className="bg-yellow-100 text-yellow-700">🟡 Follow-up ({giorni}gg)</Badge>;
    return <Badge className="bg-green-100 text-green-700">🟢 Recente ({giorni}gg)</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Caricamento preventivi...</p>
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
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Preventivi Digitali</h1>
              <p className="text-gray-600">Gestione preventivi con accettazione digitale e tracciabilità completa</p>
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="aperti">Aperti ({preventivi.filter(p => ['inviato', 'visualizzato'].includes(p.stato)).length})</TabsTrigger>
            <TabsTrigger value="accettati">Accettati ({preventiviAccettati.length})</TabsTrigger>
            <TabsTrigger value="rifiutati">Rifiutati ({preventiviRifiutati.length})</TabsTrigger>
            <TabsTrigger value="scaduti">Scaduti ({preventivi.filter(p => p.stato === 'scaduto').length})</TabsTrigger>
          </TabsList>

          {/* Preventivi Aperti */}
          <TabsContent value="aperti" className="space-y-4">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-xl p-6 mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">💡 Preventivi in attesa di risposta</h3>
              <p className="text-gray-700 text-sm">
                <strong>4 preventivi</strong> per un valore totale di <strong>€1.070</strong> in attesa di accettazione. 
                <strong className="text-orange-700"> 2 richiedono follow-up urgente</strong> (&gt;14 giorni da invio).
              </p>
            </div>

            {preventiviAperti.map((prev) => (
              <Card key={prev.id} className="border-2 border-blue-200 hover:shadow-lg transition">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {prev.id?.substring(0, 8).toUpperCase() || prev.numero}
                        </h3>
                        {getStatoBadge(prev.status || prev.stato)}
                        {getUrgenzaBadge(prev.daysSinceSent || prev.giorniDaInvio)}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Cliente: <strong>{prev.ownerName || prev.cliente}</strong> • Pet: <strong>{prev.petName || prev.pet}</strong>
                      </p>
                      <p className="text-lg font-semibold text-gray-900 mb-2">{prev.title || prev.servizio}</p>

                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Importo</p>
                          <p className="text-xl font-bold text-green-600">€{prev.totalAmount || prev.importo}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Data Invio</p>
                          <p className="text-sm font-bold text-gray-900">
                            {prev.sentAt ? new Date(prev.sentAt).toLocaleDateString('it-IT') : 
                             prev.dataInvio ? new Date(prev.dataInvio).toLocaleDateString('it-IT') : 'Non inviato'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Visualizzato</p>
                          <p className="text-sm font-bold text-gray-900">
                            {prev.viewedAt ? new Date(prev.viewedAt).toLocaleDateString('it-IT') : 
                             prev.dataVisualizzazione ? new Date(prev.dataVisualizzazione).toLocaleDateString('it-IT') : '❌ No'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Scadenza</p>
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(prev.validUntil || prev.validita).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>

                      {(prev.notes || prev.note) && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Note:</p>
                          <p className="text-xs text-gray-600">{prev.notes || prev.note}</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      {(prev.needsFollowUp || (prev.daysSinceSent && prev.daysSinceSent > 14)) && (
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap">
                          <Send className="h-4 w-4 mr-2" />
                          Follow-up
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="whitespace-nowrap">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" className="whitespace-nowrap">
                        Dettagli
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Preventivi Accettati */}
          <TabsContent value="accettati" className="space-y-4">
            {preventiviAccettati.map((prev) => (
              <Card key={prev.id} className="border-2 border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{prev.numero}</h3>
                        <Badge className="bg-green-600 text-white">✅ Accettato</Badge>
                        <Badge className={prev.statoEsecuzione === 'completato' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}>
                          {prev.statoEsecuzione === 'completato' ? '✓ Completato' : '🔄 In corso'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>{prev.cliente}</strong> • {prev.servizio} • <strong>€{prev.importo}</strong>
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Accettato il {new Date(prev.dataAccettazione).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Vedi Dettagli</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Preventivi Rifiutati */}
          <TabsContent value="rifiutati" className="space-y-4">
            {preventiviRifiutati.map((prev) => (
              <Card key={prev.id} className="border-2 border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{prev.numero}</h3>
                        <Badge className="bg-red-600 text-white">❌ Rifiutato</Badge>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>{prev.cliente}</strong> • {prev.servizio} • <strong>€{prev.importo}</strong>
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Rifiutato il {new Date(prev.dataRifiuto).toLocaleDateString('it-IT')}
                      </p>
                      {prev.motivazione && (
                        <p className="text-xs text-red-700 mt-2 font-medium">
                          Motivo: {prev.motivazione}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">Invia Nuovo Preventivo</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Preventivi Scaduti */}
          <TabsContent value="scaduti" className="space-y-4">
            {preventivi.filter(p => p.stato === 'scaduto').map((prev) => (
              <Card key={prev.id} className="border-2 border-gray-300 bg-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{prev.numero}</h3>
                        <Badge className="bg-gray-600 text-white">⏰ Scaduto</Badge>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>{prev.cliente}</strong> • {prev.servizio} • <strong>€{prev.importo}</strong>
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Scaduto il {new Date(prev.validita).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Riattiva Preventivo</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
