'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Plus, CheckCircle, Users } from 'lucide-react';

export default function ClinicalTrials({ user }) {
  const trials = [
    { id: 1, title: 'Nuovo farmaco dermatite atopica', sponsor: 'Università Milano', patients: 20, compensation: 500, duration: '3 mesi', status: 'recruiting' },
    { id: 2, title: 'Studio obesità felina', sponsor: 'IAMS Research', patients: 50, compensation: 300, duration: '6 mesi', status: 'recruiting' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-teal-600" />
            Clinical Trials Platform
          </h2>
          <p className="text-sm text-gray-500">Ricerca clinica veterinaria: partecipa e guadagna</p>
        </div>
      </div>

      <div className="grid gap-4">
        {trials.map(t => (
          <Card key={t.id} className="hover:shadow-lg transition">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-lg">{t.title}</h4>
                    <Badge className="bg-teal-100 text-teal-700">Recruiting</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">🏛️ {t.sponsor}</p>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div><p className="text-xs text-gray-500">Pazienti richiesti</p><p className="font-semibold"><Users className="h-4 w-4 inline mr-1" />{t.patients}</p></div>
                    <div><p className="text-xs text-gray-500">Durata</p><p className="font-semibold">{t.duration}</p></div>
                    <div><p className="text-xs text-gray-500">Compenso clinica</p><p className="font-semibold text-teal-600">€{t.compensation}</p></div>
                  </div>
                </div>
                <Button className="bg-teal-600">Candidati</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="p-4">
          <p className="text-sm text-teal-800"><strong>🔬 Vantaggi:</strong> Compenso per clinica, farmaci gratis per paziente, contributo alla scienza veterinaria, dati raccolti automaticamente in VetBuddy.</p>
        </CardContent>
      </Card>
    </div>
  );
}
