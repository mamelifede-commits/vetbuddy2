'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';

export default function RemotePatientMonitoring({ user }) {
  const devices = [
    { pet: 'Luna', device: 'Glucometro IoT', type: 'Diabete', lastReading: '145 mg/dL', status: 'normal', trend: 'stable' },
    { pet: 'Max', device: 'Bilancia Smart', type: 'Obesità', lastReading: '14.2 kg', status: 'warning', trend: 'up' },
    { pet: 'Milo', device: 'Termometro IoT', type: 'Febbre', lastReading: '39.2°C', status: 'alert', trend: 'up' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="h-6 w-6 text-teal-600" />
          Remote Patient Monitoring (RPM)
        </h2>
        <p className="text-sm text-gray-500">IoT medicale: glucometri, termometri, bilance smart</p>
      </div>

      <div className="grid gap-3">
        {devices.map((d, i) => (
          <Card key={i} className={`hover:shadow-md transition ${d.status === 'alert' ? 'border-red-200 bg-red-50' : d.status === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${d.status === 'alert' ? 'bg-red-100' : d.status === 'warning' ? 'bg-yellow-100' : 'bg-teal-100'}`}>
                    <Activity className={`h-5 w-5 ${d.status === 'alert' ? 'text-red-600' : d.status === 'warning' ? 'text-yellow-600' : 'text-teal-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{d.pet} - {d.device}</h4>
                      <Badge className={d.status === 'alert' ? 'bg-red-100 text-red-700' : d.status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                        {d.status === 'alert' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {d.status === 'alert' ? 'Alert' : d.status === 'warning' ? 'Attenzione' : 'Normale'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{d.type}</p>
                    <div className="flex items-center gap-3 text-sm mt-1">
                      <span className="font-semibold text-gray-900">{d.lastReading}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />Trend: {d.trend}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="p-4">
          <p className="text-sm text-teal-800"><strong>🌡️ RPM Veterinario:</strong> Chronic disease management rivoluzionario. Diabete, obesità, febbre monitorati 24/7. Mercato vergine.</p>
        </CardContent>
      </Card>
    </div>
  );
}
