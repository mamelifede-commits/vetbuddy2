'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Clock, User, AlertCircle } from 'lucide-react';

export default function TurniGuardia({ user }) {
  const [shifts, setShifts] = useState([
    { id: 1, vet: 'Dr. Rossi', date: '2025-06-15', type: 'Notte', hours: '20:00-08:00', status: 'confirmed' },
    { id: 2, vet: 'Dr.ssa Bianchi', date: '2025-06-16', type: 'Giorno', hours: '08:00-20:00', status: 'confirmed' },
    { id: 3, vet: 'Da assegnare', date: '2025-06-17', type: 'Notte', hours: '20:00-08:00', status: 'pending' },
  ]);

  const getStatusBadge = (status) => {
    return status === 'confirmed' ? 
      <Badge className="bg-green-100 text-green-700">Confermato</Badge> : 
      <Badge className="bg-yellow-100 text-yellow-700">Da Assegnare</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="h-6 w-6 text-indigo-600" />
            Gestione Turni Guardia H24
          </h2>
          <p className="text-sm text-gray-500">Organizzazione turni pronto soccorso e reperibilità</p>
        </div>
        <Button className="bg-indigo-600"><Plus className="h-4 w-4 mr-2" />Nuovo Turno</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{shifts.length}</div><p className="text-xs text-gray-500">Turni Programmati</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-yellow-600">{shifts.filter(s => s.status === 'pending').length}</div><p className="text-xs text-gray-500">Da Assegnare</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{shifts.filter(s => s.status === 'confirmed').length}</div><p className="text-xs text-gray-500">Confermati</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-indigo-600">3</div><p className="text-xs text-gray-500">Veterinari Attivi</p></CardContent></Card>
      </div>

      <div className="grid gap-3">
        {shifts.map(shift => (
          <Card key={shift.id} className="hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    {shift.status === 'pending' ? <AlertCircle className="h-5 w-5 text-yellow-600" /> : <User className="h-5 w-5 text-indigo-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{shift.vet}</h4>
                      {getStatusBadge(shift.status)}
                    </div>
                    <p className="text-sm text-gray-600">{new Date(shift.date).toLocaleDateString('it-IT')} - {shift.type} ({shift.hours})</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Dettagli</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="p-4">
          <p className="text-sm text-indigo-800"><strong>ℹ️ Alert Emergenze:</strong> Notifiche push al veterinario di guardia. Handoff automatico tra turni con note di consegna.</p>
        </CardContent>
      </Card>
    </div>
  );
}
