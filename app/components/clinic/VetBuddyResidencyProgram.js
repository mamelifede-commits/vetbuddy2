'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users, Star, TrendingUp, MessageCircle } from 'lucide-react';

export default function VetBuddyResidencyProgram() {
  const mentors = [
    { name: 'Dr. Giulia Marchetti', specialty: 'Chirurgia Oncologica', rating: 4.9, residents: 8, price: '€250/mese' },
    { name: 'Dr. Marco Santini', specialty: 'Cardiologia', rating: 4.8, residents: 12, price: '€220/mese' },
    { name: 'Dr. Anna Colombo', specialty: 'Dermatologia', rating: 5.0, residents: 5, price: '€280/mese' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-6 w-6 text-indigo-500" />
          <h2 className="text-2xl font-bold text-gray-900">VetBuddy Residency Program</h2>
          <Badge className="bg-indigo-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">Mentorship 1-to-1 con veterinari senior. €200/mese vs €20-40k residenze tradizionali. Revisione casi settimanali. Certificazione FNOVI riconosciuta. Democratizza formazione specialistica.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">Mentor Disponibili</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mentors.map((m, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{m.name}</h3>
                    <p className="text-sm text-indigo-600">{m.specialty}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500 text-sm mb-1">
                      <Star className="h-4 w-4 fill-current" />
                      {m.rating}
                    </div>
                    <div className="text-xs text-gray-500">{m.residents} resident</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-indigo-600">{m.price}</span>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Candidati</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">Come Funziona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { icon: Users, title: 'Matching Mentor-Resident', desc: 'Algoritmo abbina mentor e resident per specialità/obiettivi' },
                { icon: MessageCircle, title: 'Sessioni Settimanali', desc: 'Video-call 1h/settimana + revisione casi clinici anonimizzati' },
                { icon: GraduationCap, title: 'Certificazione FNOVI', desc: 'Al termine 12 mesi: Certificato "VetBuddy Certified Resident"' },
                { icon: TrendingUp, title: 'Revenue Share', desc: '70% mentor, 20% VetBuddy, 10% borsa studio' },
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="bg-indigo-100 rounded-full p-2 h-fit">
                    <step.icon className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{step.title}</h4>
                    <p className="text-xs text-gray-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border-l-4 border-indigo-500">
              <h4 className="font-bold text-sm text-indigo-900 mb-1">💰 Confronto Costi</h4>
              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Residenza tradizionale:</span>
                  <span className="font-bold text-red-600">€20-40k/anno</span>
                </div>
                <div className="flex justify-between">
                  <span>VetBuddy Residency:</span>
                  <span className="font-bold text-green-600">€2.4k/anno</span>
                </div>
                <div className="border-t pt-1 mt-1">
                  <span className="font-bold text-indigo-600">Risparmio: €17-37k/anno</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Mentor attivi', value: '340' },
          { label: 'Resident iscritti', value: '1.2k' },
          { label: 'Certificati rilasciati', value: '487' },
          { label: 'Rating medio', value: '4.9/5' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{s.value}</div>
              <div className="text-xs text-gray-600">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
