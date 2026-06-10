'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Plus, Clock, CheckCircle, Calendar } from 'lucide-react';

export default function TelemediciaFNOVI({ user }) {
  const consultations = [
    { id: 1, owner: 'Mario Rossi', pet: 'Luna', type: 'Follow-up post-op', date: '2025-06-15', time: '10:00', status: 'scheduled' },
    { id: 2, owner: 'Anna Verdi', pet: 'Max', type: 'Controllo terapia', date: '2025-06-15', time: '14:30', status: 'completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Video className="h-6 w-6 text-blue-600" />
            Telemedicina Conforme FNOVI
          </h2>
          <p className="text-sm text-gray-500">Video-consulti per follow-up (conforme normativa italiana)</p>
        </div>
        <Button className="bg-blue-600"><Plus className="h-4 w-4 mr-2" />Nuovo Video-Consulto</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{consultations.length}</div><p className="text-xs text-gray-500">Consulti Oggi</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">{consultations.filter(c => c.status === 'scheduled').length}</div><p className="text-xs text-gray-500">Programmati</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{consultations.filter(c => c.status === 'completed').length}</div><p className="text-xs text-gray-500">Completati</p></CardContent></Card>
      </div>

      <div className="grid gap-3">
        {consultations.map(c => (
          <Card key={c.id} className="hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center"><Video className="h-5 w-5 text-blue-600" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{c.owner} - {c.pet}</h4>
                      <Badge className={c.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                        {c.status === 'completed' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {c.status === 'completed' ? 'Completato' : 'Programmato'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{c.type}</p>
                    <p className="text-xs text-gray-500"><Calendar className="h-3 w-3 inline mr-1" />{new Date(c.date).toLocaleDateString('it-IT')} - {c.time}</p>
                  </div>
                </div>
                <Button size="sm" className="bg-blue-600"><Video className="h-4 w-4 mr-1" />Avvia</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <p className="text-sm text-amber-800"><strong>⚠️ Conformità FNOVI:</strong> Video-consulti solo per follow-up su pazienti già visitati. NON per prime visite o emergenze. Sempre con registrazione e consenso informato.</p>
        </CardContent>
      </Card>
    </div>
  );
}
