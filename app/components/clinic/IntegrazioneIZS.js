'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Plus, Clock, CheckCircle } from 'lucide-react';

export default function IntegrazioneIZS({ user }) {
  const izsRegions = [
    { id: 'lombardia', name: 'IZS Lombardia Emilia-Romagna', city: 'Brescia' },
    { id: 'lazio', name: 'IZS Lazio e Toscana', city: 'Roma' },
    { id: 'piemonte', name: 'IZS Piemonte Liguria Valle d\'Aosta', city: 'Torino' },
    { id: 'veneto', name: 'IZS Venezie', city: 'Padova' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-purple-600" />
            Integrazione Laboratori IZS
          </h2>
          <p className="text-sm text-gray-500">Istituti Zooprofilattici Sperimentali - Esami obbligatori</p>
        </div>
        <Button className="bg-purple-600"><Plus className="h-4 w-4 mr-2" />Nuova Richiesta IZS</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {izsRegions.map(izs => (
          <Card key={izs.id} className="hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center"><FlaskConical className="h-5 w-5 text-purple-600" /></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{izs.name}</h4>
                  <p className="text-xs text-gray-500 mb-2">{izs.city}</p>
                  <Badge className="bg-green-100 text-green-700">Integrato</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <p className="text-sm text-purple-800"><strong>ℹ️ Esami Obbligatori:</strong> Rabbia, Brucellosi, Tubercolosi, Leishmaniosi. Richieste e referti gestiti automaticamente via integrazione digitale.</p>
        </CardContent>
      </Card>
    </div>
  );
}
