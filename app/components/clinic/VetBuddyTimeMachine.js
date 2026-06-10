'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight, TrendingUp, Image } from 'lucide-react';

export default function VetBuddyTimeMachine() {
  const [simulation, setSimulation] = useState(null);

  const runSimulation = () => {
    setSimulation({
      pet: 'Max',
      age: 3,
      weight: 18,
      issue: 'Obesità',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900">VetBuddy Time Machine</h2>
          <Badge className="bg-blue-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">Carica foto animale oggi. AI simula invecchiamento a 5-10 anni CON/SENZA intervento (dieta, terapia). Mostra visivamente conseguenze obesità/patologie. Compliance terapie +80%. Effetto WOW pazzesco.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Carica Foto Paziente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">Carica foto attuale del paziente</p>
              <Button variant="outline">Seleziona file</Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Scenario da simulare</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm">
                <option>Obesità non trattata (10 anni)</option>
                <option>Diabete senza controllo (5 anni)</option>
                <option>Malattia parodontale avanzata (7 anni)</option>
                <option>Artrosi senza gestione (8 anni)</option>
              </select>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={runSimulation}>
              <Clock className="h-4 w-4 mr-2" />
              Genera simulazione
            </Button>
          </CardContent>
        </Card>

        {simulation && (
          <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="text-lg">Risultato Simulazione: {simulation.pet}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                  <div className="text-xs text-red-600 font-bold mb-2">SENZA INTERVENTO</div>
                  <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center mb-2">
                    <span className="text-xs text-gray-500">Simulazione AI</span>
                  </div>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>• Peso: 28kg (+55%)</li>
                    <li>• Diabete mellito</li>
                    <li>• Artrosi grave</li>
                    <li>• Aspettativa vita: -4 anni</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <div className="text-xs text-green-600 font-bold mb-2">CON INTERVENTO</div>
                  <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center mb-2">
                    <span className="text-xs text-gray-500">Simulazione AI</span>
                  </div>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Peso: 14kg (ideale)</li>
                    <li>• Parametri normali</li>
                    <li>• Mobilità ottima</li>
                    <li>• Aspettativa vita: normale</li>
                  </ul>
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Condividi con proprietario
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">+80%</div>
            <div className="text-xs text-gray-600">Compliance terapie</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">92%</div>
            <div className="text-xs text-gray-600">Proprietari impressed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">Virale</div>
            <div className="text-xs text-gray-600">Passaparola social</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
