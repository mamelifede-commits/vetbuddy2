'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Plus, Download, Globe } from 'lucide-react';

export default function CertificatiViaggio({ user }) {
  const destinations = [
    { id: 'ue', name: 'Unione Europea', flag: '🇪🇺', docs: ['Passaporto EU', 'Rabbia'] },
    { id: 'uk', name: 'Regno Unito', flag: '🇬🇧', docs: ['Passaporto EU', 'Rabbia', 'Tapeworm'] },
    { id: 'usa', name: 'Stati Uniti', flag: '🇺🇸', docs: ['Certificato Sanitario', 'Rabbia'] },
    { id: 'extra_ue', name: 'Extra UE', flag: '🌍', docs: ['Certificato Export', 'Vaccinazioni multiple'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Plane className="h-6 w-6 text-blue-600" />
            Certificati Sanitari Viaggio
          </h2>
          <p className="text-sm text-gray-500">Certificati ufficiali per viaggi UE ed Extra-UE</p>
        </div>
        <Button className="bg-blue-600"><Plus className="h-4 w-4 mr-2" />Nuovo Certificato</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {destinations.map(dest => (
          <Card key={dest.id} className="hover:shadow-md transition cursor-pointer">
            <CardContent className="p-6">
              <div className="text-4xl mb-3">{dest.flag}</div>
              <h3 className="font-bold text-lg mb-2">{dest.name}</h3>
              <div className="space-y-1 mb-3">
                {dest.docs.map((doc, i) => <div key={i} className="text-xs text-gray-600 flex items-center gap-1"><span className="text-green-500">✓</span>{doc}</div>)}
              </div>
              <Button size="sm" variant="outline" className="w-full"><Globe className="h-4 w-4 mr-1" />Genera Certificato</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800"><strong>ℹ️ Wizard Automatico:</strong> Seleziona destinazione e VetBuddy genera automaticamente i certificati conformi con checklist documenti richiesti.</p>
        </CardContent>
      </Card>
    </div>
  );
}
