'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Plus, MapPin, Calendar } from 'lucide-react';

export default function PetAdoption({ user }) {
  const pets = [
    { name: 'Fido', type: 'Cane', breed: 'Meticcio', age: '2 anni', shelter: 'Canile Milano', status: 'available' },
    { name: 'Micia', type: 'Gatto', breed: 'Europeo', age: '6 mesi', shelter: 'Gattile Roma', status: 'available' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-600" />
            Pet Adoption Platform
          </h2>
          <p className="text-sm text-gray-500">Integrazione canili/gattili per adozioni responsabili</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {pets.map((p, i) => (
          <Card key={i} className="hover:shadow-lg transition">
            <CardContent className="p-6">
              <div className="h-40 bg-pink-100 rounded-lg mb-4 flex items-center justify-center text-6xl">{p.type === 'Cane' ? '🐶' : '🐱'}</div>
              <div className="flex items-center gap-2 mb-2"><h4 className="font-bold text-lg">{p.name}</h4><Badge className="bg-green-100 text-green-700">Disponibile</Badge></div>
              <p className="text-sm text-gray-600 mb-3">{p.breed} - {p.age}</p>
              <p className="text-xs text-gray-500 mb-4"><MapPin className="h-3 w-3 inline mr-1" />{p.shelter}</p>
              <Button className="w-full bg-pink-600"><Heart className="h-4 w-4 mr-2" />Richiedi Adozione</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-pink-50 border-pink-200">
        <CardContent className="p-4">
          <p className="text-sm text-pink-800"><strong>❤️ Social Responsibility:</strong> Prima visita gratis per adozioni. Follow-up automatico. Acquisizione nuovi clienti + etica.</p>
        </CardContent>
      </Card>
    </div>
  );
}
