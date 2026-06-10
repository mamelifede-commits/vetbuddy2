'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Globe } from 'lucide-react';

export default function VoiceAssistant({ user }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Mic className="h-6 w-6 text-purple-600" />
          Voice Assistant Multilingua
        </h2>
        <p className="text-sm text-gray-500">Alexa & Google Assistant per prenotazioni vocali</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🗣️</div>
            <h3 className="font-bold text-lg mb-2">Amazon Alexa</h3>
            <p className="text-sm text-gray-600 mb-4">"Alexa, prenota visita per Luna da VetBuddy"</p>
            <Button className="bg-blue-600 w-full">Attiva Skill</Button>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🎙️</div>
            <h3 className="font-bold text-lg mb-2">Google Assistant</h3>
            <p className="text-sm text-gray-600 mb-4">"Ok Google, prenota appuntamento VetBuddy"</p>
            <Button className="bg-red-600 w-full">Attiva Action</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Globe className="h-5 w-5 text-purple-600" /><h4 className="font-semibold">Multilingua</h4></div>
          <p className="text-sm text-purple-800">Supporto IT, EN, ES, FR. Ideale per turisti e clienti anziani.</p>
        </CardContent>
      </Card>
    </div>
  );
}
