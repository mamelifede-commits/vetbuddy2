'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Play, Award, TrendingUp } from 'lucide-react';

export default function VeterinaryPodcastPlatform() {
  const episodes = [
    { title: 'Gestione Displasia Anca: Caso Clinico', speaker: 'Dr.ssa Marchetti', duration: '28 min', ecm: 1, listeners: 847 },
    { title: 'Nuove Frontiere Oncologia Veterinaria', speaker: 'Prof. Santini', duration: '42 min', ecm: 2, listeners: 1240 },
    { title: 'Dermatite Atopica: Protocollo Aggiornato', speaker: 'Dr. Colombo', duration: '22 min', ecm: 1, listeners: 623 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Mic className="h-6 w-6 text-indigo-500" />
          <h2 className="text-2xl font-bold text-gray-900">Veterinary Podcast & Webinar Platform</h2>
          <Badge className="bg-indigo-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">Netflix educazione veterinaria. Podcast/webinar 20-30 min accreditati ECM. Vet esperti registrano episodi. Revenue share 70% creator, 30% VetBuddy. Formazione enjoyable + ECM risolti. Versione "pet owner friendly".</p>
      </div>

      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg">Episodi Più Ascoltati</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {episodes.map((ep, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border flex items-center gap-4">
              <div className="bg-indigo-100 rounded-full p-3">
                <Play className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm">{ep.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{ep.speaker} • {ep.duration}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-green-600 text-xs">{ep.ecm} Crediti ECM</Badge>
                  <span className="text-xs text-gray-500">{ep.listeners} ascolti</span>
                </div>
              </div>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Play className="h-3 w-3 mr-1" />
                Ascolta
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-sm">Per Veterinari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Award className="h-4 w-4 text-green-600" />
              <span>50 crediti ECM/anno tracciati automaticamente</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Play className="h-4 w-4 text-green-600" />
              <span>Formazione enjoyable durante tragitto casa-lavoro</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Mic className="h-4 w-4 text-green-600" />
              <span>Diventa creator e guadagna (70% revenue share)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="text-sm">Per Proprietari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Play className="h-4 w-4 text-purple-600" />
              <span>Versione "Pet Owner Friendly" ogni episodio</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Award className="h-4 w-4 text-purple-600" />
              <span>Educazione salute animale accessibile e chiara</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Mic className="h-4 w-4 text-purple-600" />
              <span>Proprietari più informati = compliance migliore</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Mic className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">340</div>
            <div className="text-xs text-gray-600">Episodi disponibili</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">420</div>
            <div className="text-xs text-gray-600">Crediti ECM totali</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">12k</div>
            <div className="text-xs text-gray-600">Vet iscritti</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Play className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">28 min</div>
            <div className="text-xs text-gray-600">Durata media</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
