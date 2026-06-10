'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Star, TrendingUp, Users } from 'lucide-react';

export default function VeterinaryTalentMarketplace() {
  const [candidates] = useState([
    { name: 'Dr.ssa Elena Ricci', specialty: 'Chirurgia Generale', exp: 8, location: 'Milano', match: 95, salary: '€45-55k' },
    { name: 'Dr. Marco Santini', specialty: 'Medicina Interna', exp: 5, location: 'Monza', match: 88, salary: '€38-45k' },
    { name: 'Dr.ssa Giulia Moretti', specialty: 'Dermatologia', exp: 3, location: 'Bergamo', match: 82, salary: '€35-42k' },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900">Veterinary Talent Marketplace</h2>
          <Badge className="bg-blue-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">LinkedIn per veterinari con skill verification. Match score AI, portfolio casi, processo hiring tracciato. Risolve problema #1 settore (60% cliniche cerca personale da 6+ mesi). Risparmio €5-10k headhunter.</p>
      </div>

      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg">La Tua Offerta di Lavoro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Veterinario Generale - Full Time</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>Milano, Italia</span>
                  <span>•</span>
                  <span>€40-50k/anno</span>
                </div>
              </div>
              <Badge className="bg-blue-600">Attiva</Badge>
            </div>
            <div className="text-sm text-gray-700 mb-3">
              Cerchiamo veterinario con 3-5 anni esperienza per clinica moderna zona Navigli. Chirurgia generale, medicina interna. Team giovane, strumentazione completa.
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">Chirurgia</Badge>
              <Badge variant="outline">Medicina Interna</Badge>
              <Badge variant="outline">Full-time</Badge>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">47 visualizzazioni • 12 candidature</span>
            <Button size="sm" variant="outline">Modifica Offerta</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Candidati Top Match
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {candidates.map((c, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{c.name}</h3>
                  <p className="text-sm text-gray-600">{c.specialty} • {c.exp} anni esperienza</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {c.location} • {c.salary}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600 font-bold text-lg mb-1">
                    <Star className="h-5 w-5 fill-current" />
                    {c.match}%
                  </div>
                  <Badge className="bg-green-600">Top Match</Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline">Vedi Portfolio</Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Invita a Colloquio</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Briefcase className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">€0</div>
            <div className="text-xs text-gray-600">Costo headhunter</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">1.2k</div>
            <div className="text-xs text-gray-600">Vet certificati</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">14 gg</div>
            <div className="text-xs text-gray-600">Tempo medio hiring</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-amber-500 mx-auto mb-2 fill-current" />
            <div className="text-2xl font-bold text-gray-900">4.8</div>
            <div className="text-xs text-gray-600">Rating medio vet</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
