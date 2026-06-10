'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Plus, MapPin, Navigation } from 'lucide-react';

export default function VisiteDomiciliari({ user }) {
  const visits = [
    { pet: 'Luna', owner: 'Mario Rossi', address: 'Via Roma 45, Milano', time: '10:00', distance: '2.3km', status: 'scheduled' },
    { pet: 'Max', owner: 'Anna Verdi', address: 'Corso Italia 12, Milano', time: '11:30', distance: '1.8km', status: 'in_progress' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="h-6 w-6 text-amber-600" />
            Visite Domiciliari
          </h2>
          <p className="text-sm text-gray-500">Booking visite a casa, tragitto ottimizzato</p>
        </div>
        <Button className="bg-amber-600"><Plus className="h-4 w-4 mr-2" />Nuova Visita</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{visits.length}</div><p className="text-xs text-gray-500">Visite Oggi</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-amber-600">8.5km</div><p className="text-xs text-gray-500">Distanza Totale</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">€320</div><p className="text-xs text-gray-500">Revenue Previsto</p></CardContent></Card>
      </div>

      <div className="grid gap-3">
        {visits.map((v, i) => (
          <Card key={i} className="hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center"><Home className="h-5 w-5 text-amber-600" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><h4 className="font-semibold">{v.pet} - {v.owner}</h4><Badge className={v.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}>{v.status === 'in_progress' ? 'In corso' : 'Programmata'}</Badge></div>
                    <div className="flex items-center gap-3 text-sm text-gray-600"><span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{v.address}</span><span>{v.time}</span><span>{v.distance}</span></div>
                  </div>
                </div>
                <Button size="sm" variant="outline"><Navigation className="h-4 w-4 mr-1" />Naviga</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-amber-50 border-amber-200"><CardContent className="p-4"><p className="text-sm text-amber-800"><strong>ℹ️ Servizio Premium:</strong> Margini alti (€150-200/visita), ottimizzazione tragitto Google Maps, app mobile veterinario.</p></CardContent></Card>
    </div>
  );
}
