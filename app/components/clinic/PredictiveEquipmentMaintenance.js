'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export default function PredictiveEquipmentMaintenance() {
  const equipment = [
    { name: 'Ecografo Mindray Z6', status: 'critical', prediction: 'Guasto previsto tra 5 giorni', health: 15, action: 'Ordina pezzo ricambio' },
    { name: 'Autoclave Tuttnauer 3850', status: 'warning', prediction: 'Usura valvola, controllo 14gg', health: 58, action: 'Pianifica ispezione' },
    { name: 'Apparecchio RX Eickemeyer', status: 'good', prediction: 'Funzionamento ottimale', health: 92, action: null },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900">Predictive Equipment Maintenance AI</h2>
          <Badge className="bg-orange-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">Sensori IoT su attrezzature critiche. AI analizza pattern utilizzo + età → predice guasti 7-14 giorni prima (85% accuratezza). Zero downtime operatorio. Risparmio €5-15k/anno.</p>
      </div>

      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader>
          <CardTitle className="text-lg">Stato Attrezzature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {equipment.map((eq, i) => (
            <div key={i} className={`bg-white rounded-lg p-4 border-l-4 ${
              eq.status === 'critical' ? 'border-red-500' :
              eq.status === 'warning' ? 'border-amber-500' :
              'border-green-500'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{eq.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{eq.prediction}</p>
                </div>
                <Badge className={`${
                  eq.status === 'critical' ? 'bg-red-600' :
                  eq.status === 'warning' ? 'bg-amber-600' :
                  'bg-green-600'
                }`}>
                  Health: {eq.health}%
                </Badge>
              </div>
              <div className="mb-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${
                    eq.status === 'critical' ? 'bg-red-500' :
                    eq.status === 'warning' ? 'bg-amber-500' :
                    'bg-green-500'
                  }`} style={{ width: `${eq.health}%` }}></div>
                </div>
              </div>
              {eq.action && (
                <Button size="sm" className={`${
                  eq.status === 'critical' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-amber-600 hover:bg-amber-700'
                }`}>
                  {eq.action}
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: AlertTriangle, label: 'Guasti previsti', value: '3', color: 'text-red-600' },
          { icon: CheckCircle, label: 'Downtime evitato', value: '100%', color: 'text-green-600' },
          { icon: TrendingUp, label: 'Risparmio/anno', value: '€12k', color: 'text-blue-600' },
          { icon: Wrench, label: 'Accuratezza', value: '85%', color: 'text-orange-600' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <s.icon className={`h-6 w-6 ${s.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-600">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
