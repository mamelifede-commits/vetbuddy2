'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin, Clock, Package } from 'lucide-react';

export default function VetBuddyPharmacy({ user }) {
  const pharmacies = [
    { name: 'Farmacia Veterinaria Milano Centro', distance: '1.2km', delivery: '30 min', orders: 234, rating: 4.9 },
    { name: 'Farmacia Pet Roma Nord', distance: '2.8km', delivery: '45 min', orders: 189, rating: 4.8 },
  ];

  const orders = [
    { id: 1, pharmacy: 'Farmacia Vet Milano', status: 'in_transit', eta: '15 min', items: 3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Store className="h-6 w-6 text-green-600" />
          VetBuddy Pharmacy Network
        </h2>
        <p className="text-sm text-gray-500">Consegna farmaci a casa in 2h - Amazon Prime veterinario</p>
      </div>

      {/* Active Orders */}
      {orders.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Ordini in Consegna</h3>
            {orders.map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{o.pharmacy}</p>
                    <p className="text-sm text-gray-600">{o.items} articoli</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-700 mb-1">In transito</Badge>
                  <p className="text-xs text-gray-500">🕒 ETA: {o.eta}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Partner Pharmacies */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Farmacie Partner</h3>
        <div className="grid gap-3">
          {pharmacies.map((p, i) => (
            <Card key={i} className="hover:shadow-lg transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center"><Store className="h-5 w-5 text-green-600" /></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{p.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{p.distance}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{p.delivery}</span>
                        <span>⭐ {p.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-green-600">Ordina</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <p className="text-sm text-green-800"><strong>🚚 Amazon Prime Vet:</strong> Revenue share 10% VetBuddy + 10% clinica. Nessuno ha logistics farmaci veterinari.</p>
        </CardContent>
      </Card>
    </div>
  );
}
