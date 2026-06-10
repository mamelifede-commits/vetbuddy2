'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Siren, Plus, AlertTriangle, CheckCircle, Phone } from 'lucide-react';

export default function EmergencyNetwork({ user }) {
  const network = [
    { name: 'Clinica Vet Milano Nord', specialty: 'Chirurgia', distance: '3.2km', credits: 12, available: true },
    { name: 'Clinica Vet Sud', specialty: 'Cardiologia', distance: '5.8km', credits: 8, available: true },
    { name: 'Emergency Vet 24h', specialty: 'Terapia intensiva', distance: '2.1km', credits: 15, available: false },
  ];

  const myCredits = 10;
  const requestsSent = 3;
  const requestsReceived = 7;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Siren className="h-6 w-6 text-red-600" />
            Emergency Network 24/7
          </h2>
          <p className="text-sm text-gray-500">Rete di mutuo supporto emergenze tra cliniche</p>
        </div>
        <Button className="bg-red-600"><AlertTriangle className="h-4 w-4 mr-2" />SOS Emergenza</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50"><CardContent className="p-4"><div className="text-2xl font-bold text-red-600">{myCredits}</div><p className="text-xs text-gray-500">I Miei Crediti</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{requestsSent}</div><p className="text-xs text-gray-500">Richieste Inviate</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{requestsReceived}</div><p className="text-xs text-gray-500">Aiuti Forniti</p></CardContent></Card>
      </div>

      {/* Rete Cliniche */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Cliniche Partner nella Rete (Milano)</h3>
        <div className="grid gap-3">
          {network.map((c, i) => (
            <Card key={i} className="hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center"><Siren className="h-5 w-5 text-red-600" /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{c.name}</h4>
                        <Badge className={c.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                          {c.available ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                          {c.available ? 'Disponibile' : 'Occupata'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>🎯 {c.specialty}</span>
                        <span>•</span>
                        <span>📍 {c.distance}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold">{c.credits} crediti</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" disabled={!c.available}><Phone className="h-4 w-4 mr-1" />Contatta</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Come Funziona */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-red-900 mb-2">🤝 Come Funziona il Network</h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• <strong>SOS:</strong> Clinica con emergenza fuori competenza lancia alert alla rete</li>
            <li>• <strong>Risposta:</strong> Altre cliniche rispondono disponibilità in tempo reale</li>
            <li>• <strong>Crediti:</strong> Chi aiuta accumula crediti, chi chiede aiuto li usa (equilibrio automatico)</li>
            <li>• <strong>Tracking:</strong> Trasferimento paziente tracciato, follow-up automatico</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
