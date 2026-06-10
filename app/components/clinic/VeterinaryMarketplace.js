'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, Star, MapPin, Calendar } from 'lucide-react';

export default function VeterinaryMarketplace({ user }) {
  const freelancers = [
    { name: 'Dr. Marco Bianchi', specialty: 'Chirurgia', rating: 4.9, reviews: 23, location: 'Milano', rate: 80, available: true },
    { name: 'Dr.ssa Laura Rossi', specialty: 'Dermatologia', rating: 4.8, reviews: 18, location: 'Roma', rate: 70, available: true },
    { name: 'Dr. Giuseppe Verdi', specialty: 'Generalista', rating: 5.0, reviews: 31, location: 'Torino', rate: 60, available: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-indigo-600" />
            Veterinary Marketplace
          </h2>
          <p className="text-sm text-gray-500">Trova veterinari sostituti e freelance certificati</p>
        </div>
        <Button className="bg-indigo-600"><Plus className="h-4 w-4 mr-2" />Pubblica Offerta</Button>
      </div>

      {/* Veterinari Disponibili */}
      <div className="grid gap-3">
        {freelancers.map((v, i) => (
          <Card key={i} className="hover:shadow-lg transition">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">👨‍⚕️</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg">{v.name}</h4>
                      {v.available && <Badge className="bg-green-100 text-green-700">Disponibile</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">🎯 {v.specialty}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />{v.rating} ({v.reviews} recensioni)</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{v.location}</span>
                    </div>
                    <p className="text-xl font-bold text-indigo-600">€{v.rate}<span className="text-sm text-gray-500">/ora</span></p>
                  </div>
                </div>
                <Button size="sm" className="bg-indigo-600" disabled={!v.available}><Calendar className="h-4 w-4 mr-1" />Prenota</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="p-4">
          <p className="text-sm text-indigo-800"><strong>👥 Marketplace:</strong> Tutti i veterinari sono certificati FNOVI, assicurati e con background check. Pagamento e contratto gestiti da VetBuddy.</p>
        </CardContent>
      </Card>
    </div>
  );
}
