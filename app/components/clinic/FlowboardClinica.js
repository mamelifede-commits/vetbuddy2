'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock, User, PawPrint, AlertCircle, CheckCircle, Activity,
  Stethoscope, Scissors, FileX, Home, ArrowRight, Filter, RefreshCw
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

const COLUMNS = [
  { id: 'arriving', title: 'In Arrivo', icon: <Clock className="h-4 w-4" />, color: 'blue' },
  { id: 'checkin', title: 'Check-in', icon: <CheckCircle className="h-4 w-4" />, color: 'green' },
  { id: 'waiting', title: 'Sala d\'Attesa', icon: <User className="h-4 w-4" />, color: 'purple' },
  { id: 'visit', title: 'In Visita', icon: <Stethoscope className="h-4 w-4" />, color: 'indigo' },
  { id: 'exam', title: 'In Esame', icon: <Activity className="h-4 w-4" />, color: 'cyan' },
  { id: 'surgery', title: 'In Chirurgia', icon: <Scissors className="h-4 w-4" />, color: 'red' },
  { id: 'discharge', title: 'Dimissione', icon: <Home className="h-4 w-4" />, color: 'amber' },
  { id: 'completed', title: 'Completato', icon: <CheckCircle className="h-4 w-4" />, color: 'green' },
];

export default function FlowboardClinica({ user, onNavigate }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVet, setSelectedVet] = useState('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    // Demo data
    const demo = [
      { id: '1', petName: 'Luna', ownerName: 'Maria Rossi', service: 'Visita generale', time: '09:00', vet: 'Dr. Rossi', status: 'arriving', priority: 'normal', hasConsent: true, hasQuestionnaire: true, delay: 0 },
      { id: '2', petName: 'Rex', ownerName: 'Luca Bianchi', service: 'Vaccino', time: '09:30', vet: 'Dr. Bianchi', status: 'checkin', priority: 'normal', hasConsent: true, hasQuestionnaire: false, delay: 0 },
      { id: '3', petName: 'Micio', ownerName: 'Anna Verdi', service: 'Controllo dermatologico', time: '10:00', vet: 'Dr. Rossi', status: 'waiting', priority: 'normal', hasConsent: true, hasQuestionnaire: true, delay: 5 },
      { id: '4', petName: 'Buddy', ownerName: 'Carlo Neri', service: 'Emergenza', time: '10:15', vet: 'Dr. Verdi', status: 'visit', priority: 'high', hasConsent: false, hasQuestionnaire: false, delay: 0 },
      { id: '5', petName: 'Nala', ownerName: 'Sara Colombo', service: 'Analisi sangue', time: '10:30', vet: 'Dr. Bianchi', status: 'exam', priority: 'normal', hasConsent: true, hasQuestionnaire: true, delay: 0 },
      { id: '6', petName: 'Thor', ownerName: 'Marco Ferrara', service: 'Sterilizzazione', time: '11:00', vet: 'Dr. Rossi', status: 'surgery', priority: 'normal', hasConsent: true, hasQuestionnaire: true, delay: 0 },
      { id: '7', petName: 'Birba', ownerName: 'Paolo Ricci', service: 'Pulizia dentale', time: '11:30', vet: 'Dr. Verdi', status: 'discharge', priority: 'normal', hasConsent: true, hasQuestionnaire: true, delay: 0 },
      { id: '8', petName: 'Oscar', ownerName: 'Elena Conti', service: 'Visita ortopedica', time: '12:00', vet: 'Dr. Bianchi', status: 'completed', priority: 'normal', hasConsent: true, hasQuestionnaire: true, delay: 0 },
      { id: '9', petName: 'Rocky', ownerName: 'Davide Moretti', service: 'Controllo post-operatorio', time: '14:00', vet: 'Dr. Rossi', status: 'waiting', priority: 'normal', hasConsent: true, hasQuestionnaire: true, delay: 15 },
      { id: '10', petName: 'Lilly', ownerName: 'Federica Gallo', service: 'Vaccino', time: '14:30', vet: 'Dr. Verdi', status: 'arriving', priority: 'normal', hasConsent: true, hasQuestionnaire: true, delay: 0 },
    ];
    setAppointments(demo);
    setLoading(false);
  };

  const vets = ['all', ...new Set(appointments.map(a => a.vet))];

  const filteredAppointments = selectedVet === 'all' 
    ? appointments 
    : appointments.filter(a => a.vet === selectedVet);

  const getColumnAppointments = (columnId) => {
    return filteredAppointments.filter(a => a.status === columnId);
  };

  const totalToday = filteredAppointments.length;
  const inProgress = filteredAppointments.filter(a => !['arriving', 'completed'].includes(a.status)).length;
  const completed = filteredAppointments.filter(a => a.status === 'completed').length;
  const alerts = filteredAppointments.filter(a => a.priority === 'high' || !a.hasConsent || !a.hasQuestionnaire || a.delay > 10).length;

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="h-8 w-8 animate-spin text-blue-500" /></div>;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-500" /> Flowboard Clinica
        </h2>
        <p className="text-gray-500 text-sm">Vista operativa in tempo reale degli appuntamenti del giorno</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{totalToday}</p>
            <p className="text-xs text-blue-600">Appuntamenti oggi</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-700">{inProgress}</p>
            <p className="text-xs text-purple-600">In corso</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{completed}</p>
            <p className="text-xs text-green-600">Completati</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{alerts}</p>
            <p className="text-xs text-red-600">Alert</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 items-center">
        <Filter className="h-5 w-5 text-gray-400" />
        <span className="text-sm font-medium">Veterinario:</span>
        {vets.map((vet) => (
          <Button
            key={vet}
            size="sm"
            variant={selectedVet === vet ? 'default' : 'outline'}
            onClick={() => setSelectedVet(vet)}
            className={selectedVet === vet ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}
          >
            {vet === 'all' ? 'Tutti' : vet}
          </Button>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {COLUMNS.map((column) => {
          const appts = getColumnAppointments(column.id);
          return (
            <div key={column.id} className="min-h-[200px]">
              <div className={`bg-${column.color}-100 border-${column.color}-300 border-2 rounded-t-lg p-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  {column.icon}
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                </div>
                <Badge className={`bg-${column.color}-500 text-white`}>{appts.length}</Badge>
              </div>
              <div className="space-y-2 p-2 bg-gray-50 rounded-b-lg min-h-[150px]">
                {appts.map((appt) => (
                  <Card
                    key={appt.id}
                    className={`cursor-pointer hover:shadow-lg transition ${
                      appt.priority === 'high' ? 'border-red-400 bg-red-50' : ''
                    } ${appt.delay > 10 ? 'border-amber-400' : ''}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-gray-600">{appt.time}</span>
                        {appt.priority === 'high' && (
                          <Badge className="bg-red-500 text-white text-[10px]">Urgente</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <PawPrint className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-sm">{appt.petName}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{appt.ownerName}</p>
                      <p className="text-xs text-gray-500 mb-2">{appt.service}</p>
                      <div className="flex items-center gap-1 mb-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-[10px] text-gray-500">{appt.vet}</span>
                      </div>
                      <div className="flex gap-1">
                        {!appt.hasConsent && (
                          <Badge className="bg-red-100 text-red-700 text-[10px]">
                            <FileX className="h-3 w-3 mr-1" />No consenso
                          </Badge>
                        )}
                        {!appt.hasQuestionnaire && (
                          <Badge className="bg-amber-100 text-amber-700 text-[10px]">
                            <AlertCircle className="h-3 w-3 mr-1" />No quest.
                          </Badge>
                        )}
                        {appt.delay > 10 && (
                          <Badge className="bg-amber-500 text-white text-[10px]">
                            <Clock className="h-3 w-3 mr-1" />+{appt.delay}min
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px]">
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <Activity className="h-4 w-4 inline mr-1" />
          <strong>Tip:</strong> Trascina le card tra le colonne per aggiornare lo stato in tempo reale. Clicca sulla card per vedere dettagli completi.
        </p>
      </div>
    </div>
  );
}
