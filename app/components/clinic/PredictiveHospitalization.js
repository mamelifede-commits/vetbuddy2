'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Clock, Phone } from 'lucide-react';

export default function PredictiveHospitalization() {
  const [predictions] = useState([
    { pet: 'Luna', owner: 'Rossi Maria', risk: 85, reason: 'Insufficienza renale cronica + valori creatinina in aumento', action: 'Richiama per esami urgenti', hours: 24 },
    { pet: 'Max', owner: 'Bianchi Paolo', risk: 72, reason: 'Diabete scompensato + poliuria/polidipsia', action: 'Aggiusta terapia insulinica', hours: 48 },
    { pet: 'Mia', owner: 'Verdi Anna', risk: 45, reason: 'Obesità + affanno da sforzo', action: 'Piano dimagrimento urgente', hours: 72 },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">Predictive Hospitalization AI</h2>
          <Badge className="bg-red-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">L'AI analizza cartelle cliniche ed esami recenti per prevedere quali pazienti rischiano ospedalizzazione nelle prossime 48-72h. Intervento preemptivo salva vite e riduce emergenze costose.</p>
      </div>

      <Card className="border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-600" />
            Pazienti ad Alto Rischio (prossime 72h)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {predictions.map((p, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border-l-4" style={{ borderLeftColor: p.risk > 70 ? '#dc2626' : '#f59e0b' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{p.pet} • {p.owner}</h3>
                  <p className="text-sm text-gray-600 mt-1">{p.reason}</p>
                </div>
                <Badge className={p.risk > 70 ? 'bg-red-600' : 'bg-amber-600'}>Rischio {p.risk}%</Badge>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">Finestra intervento: {p.hours}h</span>
                <Button size="sm" className="ml-auto bg-red-600 hover:bg-red-700">
                  <Phone className="h-3 w-3 mr-1" />{p.action}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-600">87%</div>
            <div className="text-xs text-gray-600">Accuratezza predizioni</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">-65%</div>
            <div className="text-xs text-gray-600">Emergenze evitate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">€4.2k</div>
            <div className="text-xs text-gray-600">Risparmio medio/anno</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
