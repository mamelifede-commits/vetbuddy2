'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Bell, TrendingUp } from 'lucide-react';

export default function SmartQueueManagement() {
  const [queue] = useState([
    { number: 'A12', pet: 'Max', owner: 'Rossi', type: 'Visita', waitTime: 5, status: 'Prossimo' },
    { number: 'A13', pet: 'Luna', owner: 'Bianchi', type: 'Vaccino', waitTime: 15, status: 'In attesa' },
    { number: 'A14', pet: 'Rocky', owner: 'Verdi', type: 'Controllo', waitTime: 25, status: 'In attesa' },
    { number: 'E01', pet: 'Mia', owner: 'Ferrari', type: 'Emergenza', waitTime: 0, status: 'Emergenza' },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-6 w-6 text-violet-500" />
          <h2 className="text-2xl font-bold text-gray-900">Smart Queue Management & Walk-in</h2>
          <Badge className="bg-violet-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">Sistema code virtuale come Poste Italiane. Check-in da app → numero coda + tempo attesa stimato. Proprietario aspetta in auto/bar. Notifica "Tra 5 min sei tu". AI predice ritardi. Dashboard TV sala d'attesa. Esperienza luxury, meno stress animali.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">Coda Attuale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {queue.map((q, i) => {
              const statusColors = {
                'Prossimo': 'bg-green-100 border-green-300',
                'In attesa': 'bg-blue-100 border-blue-300',
                'Emergenza': 'bg-red-100 border-red-300',
              };
              return (
                <div key={i} className={`rounded-lg p-3 border-2 ${statusColors[q.status]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-black text-gray-900">{q.number}</div>
                      <div>
                        <div className="font-bold text-sm">{q.pet} • {q.owner}</div>
                        <div className="text-xs text-gray-600">{q.type}</div>
                      </div>
                    </div>
                    <Badge className={q.status === 'Emergenza' ? 'bg-red-600' : q.status === 'Prossimo' ? 'bg-green-600' : 'bg-blue-600'}>
                      {q.status}
                    </Badge>
                  </div>
                  {q.waitTime > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>Tempo attesa stimato: {q.waitTime} minuti</span>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-lg">App Proprietario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-6 border-2 border-blue-300 text-center">
              <div className="text-6xl font-black text-blue-600 mb-3">A13</div>
              <div className="text-sm font-medium text-gray-700 mb-2">Il tuo numero</div>
              <Badge className="bg-blue-600 text-sm">Sei il prossimo!</Badge>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Tempo attesa: 5 minuti</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 mb-1">Notifica Automatica</h4>
                  <p className="text-xs text-gray-700">Riceverai un avviso push quando mancheranno 5 minuti al tuo turno. Puoi aspettare comodamente in auto o al bar!</p>
                </div>
              </div>
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700">Check-in Virtuale</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-violet-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">-70%</div>
            <div className="text-xs text-gray-600">Stress sala d'attesa</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">5 min</div>
            <div className="text-xs text-gray-600">Preavviso notifica</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">92%</div>
            <div className="text-xs text-gray-600">Soddisfazione clienti</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Bell className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">AI</div>
            <div className="text-xs text-gray-600">Predizione ritardi</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
