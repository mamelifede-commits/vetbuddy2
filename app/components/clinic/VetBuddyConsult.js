'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Plus, Clock } from 'lucide-react';

export default function VetBuddyConsult({ user }) {
  const specialists = [
    { name: 'Dr. Marco Bianchi', specialty: 'Cardiologia', cases: 234, rating: 4.9, price: 80, response: '12h' },
    { name: 'Dr.ssa Laura Rossi', specialty: 'Oncologia', cases: 189, rating: 5.0, price: 100, response: '24h' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-blue-600" />
            VetBuddy Consult - Second Opinion
          </h2>
          <p className="text-sm text-gray-500">Consulti specialistici asincroni da remoto</p>
        </div>
        <Button className="bg-blue-600"><Plus className="h-4 w-4 mr-2" />Richiedi Consulto</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {specialists.map((s, i) => (
          <Card key={i} className="hover:shadow-lg transition">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">👨‍⚕️</div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 mb-1">{s.name}</h4>
                  <Badge variant="outline" className="mb-2">{s.specialty}</Badge>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>⭐ {s.rating}</span>
                    <span>•</span>
                    <span>{s.cases} casi</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">€{s.price}</p>
                  <p className="text-xs text-gray-500">per consulto</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1"><Clock className="h-4 w-4" />{s.response}</p>
                  <p className="text-xs text-gray-500">risposta</p>
                </div>
              </div>
              <Button className="w-full bg-blue-600">Richiedi Consulto</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800"><strong>🤝 Democratizza Specialisti:</strong> Generalista → invia caso → specialista risponde 24h. €50-100/consulto. Cardiologi, oncologi, neurologi certificati.</p>
        </CardContent>
      </Card>
    </div>
  );
}
