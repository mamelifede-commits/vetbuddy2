'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scissors, Plus, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

export default function GestioneChirurgie({ user }) {
  const [surgeries, setSurgeries] = useState([
    { id: 1, pet: 'Luna', type: 'Sterilizzazione', date: '2025-06-15', time: '09:00', status: 'scheduled', vet: 'Dr. Rossi' },
    { id: 2, pet: 'Max', type: 'Pulizia dentale', date: '2025-06-15', time: '11:00', status: 'in_progress', vet: 'Dr.ssa Bianchi' },
    { id: 3, pet: 'Milo', type: 'Rimozione masse', date: '2025-06-15', time: '14:00', status: 'completed', vet: 'Dr. Rossi' },
  ]);

  const getStatusBadge = (status) => {
    const variants = {
      scheduled: { color: 'bg-blue-100 text-blue-700', icon: Calendar, label: 'Programmata' },
      in_progress: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'In Corso' },
      completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completata' },
    };
    const variant = variants[status];
    const Icon = variant.icon;
    return <Badge className={variant.color}><Icon className="h-3 w-3 mr-1" />{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Scissors className="h-6 w-6 text-red-600" />
            Gestione Sala Operatoria
          </h2>
          <p className="text-sm text-gray-500">Calendario chirurgie, pre-op, post-op, strumentario</p>
        </div>
        <Button className="bg-red-600"><Plus className="h-4 w-4 mr-2" />Nuova Chirurgia</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">{surgeries.filter(s => s.status === 'scheduled').length}</div><p className="text-xs text-gray-500">Programmate Oggi</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-yellow-600">{surgeries.filter(s => s.status === 'in_progress').length}</div><p className="text-xs text-gray-500">In Corso</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{surgeries.filter(s => s.status === 'completed').length}</div><p className="text-xs text-gray-500">Completate</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-gray-900">4.2h</div><p className="text-xs text-gray-500">Tempo Medio</p></CardContent></Card>
      </div>

      {/* Lista Chirurgie */}
      <div className="grid gap-3">
        {surgeries.map(surgery => (
          <Card key={surgery.id} className="hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Scissors className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{surgery.pet} - {surgery.type}</h4>
                      {getStatusBadge(surgery.status)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>{new Date(surgery.date).toLocaleDateString('it-IT')}</span>
                      <span>{surgery.time}</span>
                      <span>{surgery.vet}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">Dettagli</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <p className="text-sm text-red-800"><strong>ℹ️ Funzionalità:</strong> Checklist pre-operatoria (anestesia, consenso), tracking strumentario sterile, post-op automatico, report chirurgico strutturato.</p>
        </CardContent>
      </Card>
    </div>
  );
}
