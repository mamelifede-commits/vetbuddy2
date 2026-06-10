'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Play, Award } from 'lucide-react';

export default function VetBuddyAcademy({ user }) {
  const courses = [
    { title: 'Chirurgia VR: Ovarioisterectomia', type: 'VR Simulator', ecm: 8, students: 234, rating: 4.9 },
    { title: 'Caso Clinico Interattivo: Emergenze Cardiache', type: 'Interactive', ecm: 4, students: 456, rating: 4.8 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-purple-600" />
          VetBuddy Academy - Serious Games
        </h2>
        <p className="text-sm text-gray-500">Formazione VR e gamification con crediti ECM</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {courses.map((c, i) => (
          <Card key={i} className="hover:shadow-lg transition">
            <CardContent className="p-6">
              <div className="h-40 bg-purple-100 rounded-lg mb-4 flex items-center justify-center">
                <Gamepad2 className="h-16 w-16 text-purple-600" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-bold text-gray-900">{c.title}</h4>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{c.type}</Badge>
                <Badge className="bg-teal-100 text-teal-700"><Award className="h-3 w-3 mr-1" />{c.ecm} ECM</Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>👥 {c.students} studenti</span>
                <span>⭐ {c.rating}</span>
              </div>
              <Button className="w-full bg-purple-600"><Play className="h-4 w-4 mr-2" />Inizia Corso</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <p className="text-sm text-purple-800"><strong>🎮 VR Training:</strong> Simulatori chirurgici, casi interattivi. Crediti ECM giocando. Formazione engaging vs corsi noiosi.</p>
        </CardContent>
      </Card>
    </div>
  );
}
