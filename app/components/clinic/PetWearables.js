'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Watch, Plus, TrendingUp, Activity, Heart, MapPin } from 'lucide-react';

export default function PetWearables({ user }) {
  const devices = [
    { pet: 'Luna', device: 'FitBark', type: 'Activity Tracker', status: 'connected', battery: 75, lastSync: '2 min fa' },
    { pet: 'Max', device: 'Whistle GPS', type: 'GPS + Activity', status: 'connected', battery: 40, lastSync: '5 min fa' },
  ];

  const todayData = {
    steps: 8234,
    active: 145,
    sleep: 14.2,
    calories: 420,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Watch className="h-6 w-6 text-cyan-600" />
            Pet Wearables & IoT
          </h2>
          <p className="text-sm text-gray-500">Integrazione collari smart, fitness tracker, GPS</p>
        </div>
        <Button className="bg-cyan-600"><Plus className="h-4 w-4 mr-2" />Connetti Device</Button>
      </div>

      {/* Dati Oggi */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50"><CardContent className="p-4"><Activity className="h-6 w-6 text-cyan-600 mb-2" /><div className="text-2xl font-bold">{todayData.steps}</div><p className="text-xs text-gray-500">Passi</p></CardContent></Card>
        <Card className="bg-gradient-to-br from-orange-50 to-red-50"><CardContent className="p-4"><TrendingUp className="h-6 w-6 text-orange-600 mb-2" /><div className="text-2xl font-bold">{todayData.active} min</div><p className="text-xs text-gray-500">Attività</p></CardContent></Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50"><CardContent className="p-4"><Heart className="h-6 w-6 text-purple-600 mb-2" /><div className="text-2xl font-bold">{todayData.sleep}h</div><p className="text-xs text-gray-500">Sonno</p></CardContent></Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50"><CardContent className="p-4"><Activity className="h-6 w-6 text-green-600 mb-2" /><div className="text-2xl font-bold">{todayData.calories}</div><p className="text-xs text-gray-500">Calorie</p></CardContent></Card>
      </div>

      {/* Devices Connessi */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Dispositivi Connessi</h3>
        <div className="grid gap-3">
          {devices.map((d, i) => (
            <Card key={i} className="hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 bg-cyan-100 rounded-lg flex items-center justify-center"><Watch className="h-5 w-5 text-cyan-600" /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{d.pet} - {d.device}</h4>
                        <Badge className="bg-green-100 text-green-700">Connesso</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{d.type}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>Batteria: {d.battery}%</span>
                        <span>•</span>
                        <span>Sync: {d.lastSync}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Dettagli</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Provider Supportati */}
      <Card className="bg-cyan-50 border-cyan-200">
        <CardContent className="p-4">
          <p className="text-sm text-cyan-800 mb-2"><strong>🔗 Provider Supportati:</strong></p>
          <div className="flex gap-2 flex-wrap">
            {['FitBark', 'Whistle', 'Tractive', 'Fi Collar', 'Petpace'].map(p => <Badge key={p} variant="outline">{p}</Badge>)}
          </div>
          <p className="text-xs text-cyan-700 mt-2">Dati 24/7 automaticamente in cartella clinica. Alert anomalie comportamentali.</p>
        </CardContent>
      </Card>
    </div>
  );
}
