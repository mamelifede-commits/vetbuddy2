'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, MessageCircle, TrendingDown, Shield } from 'lucide-react';

export default function MentalWellnessHub() {
  const [burnoutScore] = useState(42);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-6 w-6 text-pink-500" />
          <h2 className="text-2xl font-bold text-gray-900">Mental Wellness Hub for Vets</h2>
          <Badge className="bg-pink-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">Piattaforma benessere psicologico per veterinari. Burnout nel settore è altissimo (30% depressione). Supporto anonimo, terapia online, community peer-to-peer. Retention staff +40%.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">Il Tuo Burnout Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-black text-pink-600">{burnoutScore}</div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500" style={{ width: `${burnoutScore}%` }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Livello: <strong>Moderato</strong> • Test settimanale anonimo</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-pink-600 hover:bg-pink-700">Parla con uno psicologo specializzato</Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Community Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-sm">Anonimo_Vet_123</span>
              </div>
              <p className="text-xs text-gray-700">"Anche voi avete paura di sbagliare dopo un caso andato male?"</p>
              <div className="text-xs text-gray-500 mt-1">47 risposte • 2h fa</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-sm">VetAnonymous</span>
              </div>
              <p className="text-xs text-gray-700">"Come gestite clienti aggressivi?"</p>
              <div className="text-xs text-gray-500 mt-1">89 risposte • 5h fa</div>
            </div>
            <Button variant="outline" className="w-full">Unisciti alla community</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Shield, label: 'Anonimato garantito', color: 'text-green-600' },
          { icon: Heart, label: 'Terapia h24', color: 'text-pink-600' },
          { icon: TrendingDown, label: 'Burnout -40%', color: 'text-blue-600' },
          { icon: Users, label: 'Community 2400+ vet', color: 'text-purple-600' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <s.icon className={`h-6 w-6 ${s.color} mx-auto mb-2`} />
              <div className="text-xs text-gray-700 font-medium">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
