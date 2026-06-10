'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, TrendingUp, Clock } from 'lucide-react';

export default function GestioneHR({ user }) {
  const staff = [
    { name: 'Dr. Rossi', role: 'Veterinario', presence: 'presente', hours: 8, leaves: 3 },
    { name: 'Dr.ssa Bianchi', role: 'Veterinario', presence: 'presente', hours: 6, leaves: 1 },
    { name: 'Sara M.', role: 'ASA', presence: 'assente', hours: 0, leaves: 5 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="h-6 w-6 text-slate-600" />
            Gestione HR/Personale
          </h2>
          <p className="text-sm text-gray-500">Presenze, ferie, buste paga, formazione staff</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{staff.length}</div><p className="text-xs text-gray-500">Dipendenti</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{staff.filter(s => s.presence === 'presente').length}</div><p className="text-xs text-gray-500">Presenti Oggi</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{staff.reduce((sum, s) => sum + s.hours, 0)}h</div><p className="text-xs text-gray-500">Ore Lavorate</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{staff.reduce((sum, s) => sum + s.leaves, 0)}</div><p className="text-xs text-gray-500">Ferie Residue</p></CardContent></Card>
      </div>

      <div className="grid gap-3">
        {staff.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center"><Users className="h-5 w-5 text-slate-600" /></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1"><h4 className="font-semibold">{s.name}</h4><Badge className={s.presence === 'presente' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{s.presence}</Badge></div>
                    <p className="text-sm text-gray-600">{s.role} - {s.hours}h oggi - {s.leaves} gg ferie</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Dettagli</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-50 border-slate-200"><CardContent className="p-4"><p className="text-sm text-slate-800"><strong>ℹ️ HR Completo:</strong> Badge presenze, richieste ferie/permessi, buste paga, piani formazione, valutazioni performance.</p></CardContent></Card>
    </div>
  );
}
