'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Syringe, ClipboardList } from 'lucide-react';

export default function PetVaccinesTab({ pet }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Syringe className="h-5 w-5 text-blue-500" />Vaccini</CardTitle></CardHeader>
        <CardContent>
          {(pet.vaccinations || []).length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nessun vaccino registrato</p>
          ) : (
            <div className="space-y-3">
              {pet.vaccinations.map((vax, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <div className="flex justify-between">
                    <p className="font-medium">{vax.name}</p>
                    <Badge variant={new Date(vax.nextDue) < new Date() ? 'destructive' : 'outline'}>
                      {new Date(vax.nextDue) < new Date() ? 'Scaduto' : 'Valido'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">Fatto: {new Date(vax.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">Prossimo: {new Date(vax.nextDue).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-purple-500" />Terapie in corso</CardTitle></CardHeader>
        <CardContent>
          {pet.medications ? (
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-purple-800">
                {Array.isArray(pet.medications) 
                  ? pet.medications.map(m => typeof m === 'object' ? `${m.name} - ${m.dosage}` : m).join(', ')
                  : pet.medications}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nessuna terapia in corso</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
