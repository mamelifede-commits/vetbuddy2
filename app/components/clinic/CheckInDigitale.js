'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle, Clock, User, PawPrint, Calendar, MapPin, QrCode,
  Bell, FileCheck, ClipboardList, AlertTriangle, Eye, RefreshCw
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

export default function CheckInDigitale({ user, onNavigate }) {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCheckins();
  }, []);

  const loadCheckins = () => {
    // Demo data
    const demo = [
      { id: '1', petName: 'Luna', ownerName: 'Maria Rossi', appointmentTime: new Date(Date.now() + 30 * 60000).toISOString(), service: 'Visita generale', checkinAt: null, status: 'pending', hasConsents: true, hasQuestionnaire: true, dataConfirmed: false },
      { id: '2', petName: 'Rex', ownerName: 'Luca Bianchi', appointmentTime: new Date(Date.now() - 10 * 60000).toISOString(), service: 'Vaccino', checkinAt: new Date(Date.now() - 15 * 60000).toISOString(), status: 'arrived', hasConsents: true, hasQuestionnaire: false, dataConfirmed: true },
      { id: '3', petName: 'Micio', ownerName: 'Anna Verdi', appointmentTime: new Date(Date.now() + 60 * 60000).toISOString(), service: 'Controllo', checkinAt: new Date(Date.now() - 5 * 60000).toISOString(), status: 'arrived', hasConsents: true, hasQuestionnaire: true, dataConfirmed: true },
      { id: '4', petName: 'Buddy', ownerName: 'Carlo Neri', appointmentTime: new Date(Date.now() + 90 * 60000).toISOString(), service: 'Emergenza', checkinAt: null, status: 'pending', hasConsents: false, hasQuestionnaire: false, dataConfirmed: false },
      { id: '5', petName: 'Nala', ownerName: 'Sara Colombo', appointmentTime: new Date(Date.now() + 120 * 60000).toISOString(), service: 'Analisi sangue', checkinAt: null, status: 'pending', hasConsents: true, hasQuestionnaire: true, dataConfirmed: false },
      { id: '6', petName: 'Thor', ownerName: 'Marco Ferrara', appointmentTime: new Date(Date.now() - 5 * 60000).toISOString(), service: 'Sterilizzazione', checkinAt: new Date(Date.now() - 8 * 60000).toISOString(), status: 'arrived', hasConsents: true, hasQuestionnaire: true, dataConfirmed: true },
      { id: '7', petName: 'Birba', ownerName: 'Paolo Ricci', appointmentTime: new Date(Date.now() + 150 * 60000).toISOString(), service: 'Pulizia dentale', checkinAt: null, status: 'pending', hasConsents: false, hasQuestionnaire: true, dataConfirmed: false },
      { id: '8', petName: 'Oscar', ownerName: 'Elena Conti', appointmentTime: new Date(Date.now() - 20 * 60000).toISOString(), service: 'Visita ortopedica', checkinAt: new Date(Date.now() - 25 * 60000).toISOString(), status: 'completed', hasConsents: true, hasQuestionnaire: true, dataConfirmed: true },
    ];
    setCheckins(demo);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: 'In attesa', cls: 'bg-gray-100 text-gray-700', icon: <Clock className="h-3 w-3" /> },
      arrived: { label: 'Arrivato', cls: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" /> },
      completed: { label: 'Completato', cls: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="h-3 w-3" /> },
    };
    const s = map[status] || map.pending;
    return <Badge className={s.cls}>{s.icon} {s.label}</Badge>;
  };

  const stats = {
    today: checkins.length,
    arrived: checkins.filter(c => c.status === 'arrived').length,
    pending: checkins.filter(c => c.status === 'pending').length,
    missingDocs: checkins.filter(c => !c.hasConsents || !c.hasQuestionnaire).length,
  };

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="h-8 w-8 animate-spin text-blue-500" /></div>;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="h-6 w-6 text-green-500" /> Check-in Digitale
        </h2>
        <p className="text-gray-500 text-sm">Gestisci gli arrivi e il check-in dei clienti</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{stats.today}</p>
            <p className="text-xs text-blue-600">Appuntamenti oggi</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700">{stats.arrived}</p>
            <p className="text-xs text-green-600">Arrivati</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-gray-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-700">{stats.pending}</p>
            <p className="text-xs text-gray-600">In attesa</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-700">{stats.missingDocs}</p>
            <p className="text-xs text-red-600">Documenti mancanti</p>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Instructions */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 bg-white rounded-lg border-2 border-green-300 flex items-center justify-center shrink-0">
              <QrCode className="h-12 w-12 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Come Funziona il Check-in Digitale
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600">1.</span>
                  <span>Il cliente scansiona il <strong>QR code</strong> posizionato in sala d'attesa o alla reception</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600">2.</span>
                  <span>Conferma i suoi dati personali e quelli dell'animale</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600">3.</span>
                  <span>Firma eventuali consensi mancanti e compila il questionario</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600">4.</span>
                  <span>Clicca "Sono arrivato" - <strong>Voi ricevete notifica immediata</strong></span>
                </li>
              </ul>
            </div>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <QrCode className="h-4 w-4 mr-1" />Scarica QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Checkins List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Appuntamenti di Oggi</h3>
        {checkins.map((checkin) => (
          <Card key={checkin.id} className={`hover:shadow-md transition ${
            checkin.status === 'arrived' ? 'border-green-300 bg-green-50/30' : 
            (!checkin.hasConsents || !checkin.hasQuestionnaire) ? 'border-red-300 bg-red-50/30' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                  checkin.status === 'arrived' ? 'bg-green-100' : 
                  checkin.status === 'completed' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {checkin.status === 'arrived' ? <CheckCircle className="h-6 w-6 text-green-600" /> : 
                   checkin.status === 'completed' ? <CheckCircle className="h-6 w-6 text-blue-600" /> : 
                   <Clock className="h-6 w-6 text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{checkin.petName}</h4>
                    {getStatusBadge(checkin.status)}
                    {checkin.checkinAt && (
                      <span className="text-xs text-green-600">
                        Check-in: {new Date(checkin.checkinAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{checkin.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Appuntamento: {new Date(checkin.appointmentTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{checkin.service}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {checkin.dataConfirmed ? (
                      <Badge className="bg-blue-100 text-blue-700">
                        <CheckCircle className="h-3 w-3 mr-1" />Dati confermati
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700">
                        <Clock className="h-3 w-3 mr-1" />Dati da confermare
                      </Badge>
                    )}
                    {checkin.hasConsents ? (
                      <Badge className="bg-green-100 text-green-700">
                        <FileCheck className="h-3 w-3 mr-1" />Consensi OK
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">
                        <AlertTriangle className="h-3 w-3 mr-1" />Consensi mancanti
                      </Badge>
                    )}
                    {checkin.hasQuestionnaire ? (
                      <Badge className="bg-green-100 text-green-700">
                        <ClipboardList className="h-3 w-3 mr-1" />Questionario OK
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">
                        <AlertTriangle className="h-3 w-3 mr-1" />Questionario mancante
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {checkin.status === 'arrived' && (
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      <Eye className="h-3 w-3 mr-1" />Vedi Dettagli
                    </Button>
                  )}
                  {checkin.status === 'pending' && (
                    <Button size="sm" variant="outline">
                      <Bell className="h-3 w-3 mr-1" />Invia Promemoria
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Missing Docs */}
      {stats.missingDocs > 0 && (
        <Alert className="mt-6 bg-red-50 border-red-300">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Attenzione:</strong> {stats.missingDocs} appuntamenti hanno documenti o consensi mancanti. 
            Il check-in digitale permette al cliente di completarli direttamente da smartphone prima della visita.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <QrCode className="h-4 w-4 inline mr-1" />
          <strong>Vantaggio:</strong> Con il check-in digitale riduci code alla reception, i clienti confermano i loro dati in autonomia 
          e tu ricevi una notifica immediata quando arrivano. Il tempo d'attesa stimato viene mostrato automaticamente al cliente.
        </p>
      </div>
    </div>
  );
}
