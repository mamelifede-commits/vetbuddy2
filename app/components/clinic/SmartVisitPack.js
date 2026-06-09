'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ClipboardCheck, QrCode, Activity, Home, CheckCircle, Clock, 
  ArrowRight, User, Calendar, AlertCircle, RefreshCw, PlayCircle
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

export default function SmartVisitPack({ user, onNavigate }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = () => {
    // Demo data: visite oggi con stati del flusso
    const demoVisits = [
      {
        id: 'v1',
        petName: 'Luna',
        ownerName: 'Maria Rossi',
        time: '09:00',
        service: 'Visita controllo',
        checkIn: { completed: true, timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
        questionnaire: { completed: true, timestamp: new Date(Date.now() - 1.5 * 3600000).toISOString(), urgency: 'routine' },
        visit: { status: 'in_progress', startedAt: new Date(Date.now() - 0.5 * 3600000).toISOString(), vet: 'Dr. Rossi' },
        discharge: { completed: false },
        currentPhase: 'visit'
      },
      {
        id: 'v2',
        petName: 'Rex',
        ownerName: 'Paolo Bianchi',
        time: '10:00',
        service: 'Vaccinazione',
        checkIn: { completed: true, timestamp: new Date(Date.now() - 1 * 3600000).toISOString() },
        questionnaire: { completed: true, timestamp: new Date(Date.now() - 0.8 * 3600000).toISOString(), urgency: 'routine' },
        visit: { status: 'completed', startedAt: new Date(Date.now() - 0.5 * 3600000).toISOString(), completedAt: new Date(Date.now() - 0.2 * 3600000).toISOString(), vet: 'Dr. Bianchi' },
        discharge: { completed: false },
        currentPhase: 'discharge'
      },
      {
        id: 'v3',
        petName: 'Micio',
        ownerName: 'Anna Verdi',
        time: '11:00',
        service: 'Visita dermatologica',
        checkIn: { completed: true, timestamp: new Date(Date.now() - 0.5 * 3600000).toISOString() },
        questionnaire: { completed: true, timestamp: new Date(Date.now() - 0.3 * 3600000).toISOString(), urgency: 'moderate' },
        visit: { status: 'waiting', vet: 'Dr. Verdi' },
        discharge: { completed: false },
        currentPhase: 'questionnaire'
      },
      {
        id: 'v4',
        petName: 'Buddy',
        ownerName: 'Marco Neri',
        time: '11:30',
        service: 'Urgenza - zoppicamento',
        checkIn: { completed: true, timestamp: new Date(Date.now() - 0.2 * 3600000).toISOString() },
        questionnaire: { completed: true, timestamp: new Date(Date.now() - 0.1 * 3600000).toISOString(), urgency: 'high' },
        visit: { status: 'waiting', vet: 'Dr. Rossi' },
        discharge: { completed: false },
        currentPhase: 'questionnaire'
      },
      {
        id: 'v5',
        petName: 'Birba',
        ownerName: 'Sara Colombo',
        time: '14:00',
        service: 'Chirurgia sterilizzazione',
        checkIn: { completed: false },
        questionnaire: { completed: false },
        visit: { status: 'scheduled', vet: 'Dr. Bianchi' },
        discharge: { completed: false },
        currentPhase: 'checkin'
      },
      {
        id: 'v6',
        petName: 'Oscar',
        ownerName: 'Giulia Romano',
        time: '08:30',
        service: 'Visita post-operatoria',
        checkIn: { completed: true, timestamp: new Date(Date.now() - 3 * 3600000).toISOString() },
        questionnaire: { completed: true, timestamp: new Date(Date.now() - 2.8 * 3600000).toISOString(), urgency: 'routine' },
        visit: { status: 'completed', startedAt: new Date(Date.now() - 2.5 * 3600000).toISOString(), completedAt: new Date(Date.now() - 2 * 3600000).toISOString(), vet: 'Dr. Rossi' },
        discharge: { completed: true, timestamp: new Date(Date.now() - 1.8 * 3600000).toISOString(), followUp: '24h' },
        currentPhase: 'completed'
      },
    ];
    setVisits(demoVisits);
    setLoading(false);
  };

  const getPhaseIcon = (phase) => {
    const map = {
      checkin: QrCode,
      questionnaire: ClipboardCheck,
      visit: Activity,
      discharge: Home,
      completed: CheckCircle
    };
    return map[phase] || Clock;
  };

  const getPhaseLabel = (phase) => {
    const map = {
      checkin: 'Check-in',
      questionnaire: 'Questionario',
      visit: 'In Visita',
      discharge: 'Dimissioni',
      completed: 'Completato'
    };
    return map[phase] || phase;
  };

  const getUrgencyBadge = (urgency) => {
    const map = {
      high: { label: 'Alta Priorità', cls: 'bg-red-100 text-red-700' },
      moderate: { label: 'Media', cls: 'bg-amber-100 text-amber-700' },
      routine: { label: 'Routine', cls: 'bg-green-100 text-green-700' },
    };
    return map[urgency] || map.routine;
  };

  const stats = {
    total: visits.length,
    checkin: visits.filter(v => v.currentPhase === 'checkin').length,
    questionnaire: visits.filter(v => v.currentPhase === 'questionnaire').length,
    inVisit: visits.filter(v => v.currentPhase === 'visit').length,
    discharge: visits.filter(v => v.currentPhase === 'discharge').length,
    completed: visits.filter(v => v.currentPhase === 'completed').length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
    </div>
  );

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}

      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <PlayCircle className="h-6 w-6 text-purple-500" /> Smart Visit Pack
        </h2>
        <p className="text-gray-500 text-sm">
          Flusso visita unificato: Check-in → Questionario → Visita → Dimissioni
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3 text-center">
            <Calendar className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-xs text-blue-600">Oggi</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-3 text-center">
            <QrCode className="h-5 w-5 text-cyan-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-cyan-700">{stats.checkin}</p>
            <p className="text-xs text-cyan-600">Check-in</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-3 text-center">
            <ClipboardCheck className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-amber-700">{stats.questionnaire}</p>
            <p className="text-xs text-amber-600">Quest.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-3 text-center">
            <Activity className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-purple-700">{stats.inVisit}</p>
            <p className="text-xs text-purple-600">In Visita</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-3 text-center">
            <Home className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-orange-700">{stats.discharge}</p>
            <p className="text-xs text-orange-600">Dimis.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-3 text-center">
            <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-700">{stats.completed}</p>
            <p className="text-xs text-green-600">Compl.</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList className="mb-4">
          <TabsTrigger value="timeline">Timeline Visite ({visits.length})</TabsTrigger>
          <TabsTrigger value="active">Attive ({visits.filter(v => v.currentPhase !== 'completed').length})</TabsTrigger>
          <TabsTrigger value="completed">Completate ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <div className="space-y-4">
            {visits.map(visit => {
              const PhaseIcon = getPhaseIcon(visit.currentPhase);
              const urgencyInfo = visit.questionnaire.urgency ? getUrgencyBadge(visit.questionnaire.urgency) : null;
              return (
                <Card key={visit.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                          <PhaseIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="h-full w-0.5 bg-purple-200 mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{visit.petName} • {visit.ownerName}</h4>
                          <Badge className="bg-blue-100 text-blue-700">{visit.time}</Badge>
                          <Badge className="bg-purple-100 text-purple-700">{getPhaseLabel(visit.currentPhase)}</Badge>
                          {urgencyInfo && <Badge className={urgencyInfo.cls}>{urgencyInfo.label}</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{visit.service}</p>

                        {/* Timeline visiva */}
                        <div className="flex items-center gap-2 mb-3">
                          {/* Check-in */}
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${visit.checkIn.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {visit.checkIn.completed ? <CheckCircle className="h-3 w-3" /> : <QrCode className="h-3 w-3" />}
                            <span>Check-in</span>
                          </div>
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                          
                          {/* Questionario */}
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${visit.questionnaire.completed ? 'bg-green-100 text-green-700' : visit.currentPhase === 'questionnaire' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                            {visit.questionnaire.completed ? <CheckCircle className="h-3 w-3" /> : <ClipboardCheck className="h-3 w-3" />}
                            <span>Questionario</span>
                          </div>
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                          
                          {/* Visita */}
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${visit.visit.status === 'completed' ? 'bg-green-100 text-green-700' : visit.visit.status === 'in_progress' ? 'bg-purple-100 text-purple-700' : visit.currentPhase === 'visit' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                            {visit.visit.status === 'completed' ? <CheckCircle className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                            <span>Visita</span>
                          </div>
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                          
                          {/* Dimissioni */}
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${visit.discharge.completed ? 'bg-green-100 text-green-700' : visit.currentPhase === 'discharge' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                            {visit.discharge.completed ? <CheckCircle className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                            <span>Dimissioni</span>
                          </div>
                        </div>

                        {/* Info aggiuntive */}
                        {visit.visit.vet && (
                          <p className="text-xs text-gray-500 mb-2">
                            <User className="h-3 w-3 inline mr-1" />
                            Veterinario: {visit.visit.vet}
                          </p>
                        )}

                        {/* Azioni rapide */}
                        <div className="flex gap-2">
                          {visit.currentPhase === 'checkin' && (
                            <Button size="sm" className="bg-cyan-500 text-white">
                              <QrCode className="h-3 w-3 mr-1" /> Effettua Check-in
                            </Button>
                          )}
                          {visit.currentPhase === 'questionnaire' && (
                            <Button size="sm" className="bg-amber-500 text-white">
                              <ClipboardCheck className="h-3 w-3 mr-1" /> Verifica Questionario
                            </Button>
                          )}
                          {visit.currentPhase === 'visit' && visit.visit.status === 'waiting' && (
                            <Button size="sm" className="bg-purple-500 text-white">
                              <Activity className="h-3 w-3 mr-1" /> Inizia Visita
                            </Button>
                          )}
                          {visit.currentPhase === 'discharge' && (
                            <Button size="sm" className="bg-orange-500 text-white">
                              <Home className="h-3 w-3 mr-1" /> Crea Dimissioni
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Dettagli
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="grid md:grid-cols-2 gap-4">
            {visits.filter(v => v.currentPhase !== 'completed').map(visit => {
              const PhaseIcon = getPhaseIcon(visit.currentPhase);
              return (
                <Card key={visit.id} className="border-purple-300 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <PhaseIcon className="h-6 w-6 text-purple-600" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{visit.petName}</h4>
                        <p className="text-xs text-gray-500">{visit.ownerName} • {visit.time}</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700">{getPhaseLabel(visit.currentPhase)}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{visit.service}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-3">
            {visits.filter(v => v.currentPhase === 'completed').map(visit => (
              <Card key={visit.id} className="border-green-200 bg-green-50/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-sm">{visit.petName} • {visit.ownerName}</h4>
                        <p className="text-xs text-gray-500">{visit.time} • {visit.service}</p>
                      </div>
                    </div>
                    {visit.discharge.followUp && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        Follow-up {visit.discharge.followUp}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Info box */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          <PlayCircle className="h-4 w-4 inline mr-1" />
          <strong>Smart Visit Pack:</strong> Visualizza tutte le visite di oggi in un unico flusso. 
          Ogni visita passa attraverso 4 fasi: Check-in Digitale → Questionario Pre-Visita → Flowboard Visita → Dimissioni & Follow-up.
        </p>
      </div>
    </div>
  );
}
