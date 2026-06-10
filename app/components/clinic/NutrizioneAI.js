'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Apple, Plus, TrendingDown, AlertTriangle } from 'lucide-react';

export default function NutrizioneAI({ user }) {
  const plans = [
    { pet: 'Luna', weight: 12.5, targetWeight: 11.0, status: 'overweight', progress: 65 },
    { pet: 'Max', weight: 8.0, targetWeight: 8.0, status: 'optimal', progress: 100 },
    { pet: 'Milo', weight: 4.2, targetWeight: 5.0, status: 'underweight', progress: 30 },
  ];

  const getStatusBadge = (status) => {
    if (status === 'optimal') return <Badge className="bg-green-100 text-green-700">Ottimale</Badge>;
    if (status === 'overweight') return <Badge className="bg-orange-100 text-orange-700">Sovrappeso</Badge>;
    return <Badge className="bg-red-100 text-red-700">Sottopeso</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Apple className="h-6 w-6 text-green-600" />
            Nutrizione Personalizzata AI
          </h2>
          <p className="text-sm text-gray-500">Piani alimentari custom, tracking peso, alert obesità</p>
        </div>
        <Button className="bg-green-600"><Plus className="h-4 w-4 mr-2" />Nuovo Piano</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{plans.length}</div><p className="text-xs text-gray-500">Piani Attivi</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{plans.filter(p => p.status === 'optimal').length}</div><p className="text-xs text-gray-500">Peso Ottimale</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-orange-600">{plans.filter(p => p.status === 'overweight').length}</div><p className="text-xs text-gray-500">Sovrappeso</p></CardContent></Card>
      </div>

      <div className="grid gap-3">
        {plans.map((plan, i) => (
          <Card key={i} className="hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center"><Apple className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1"><h4 className="font-semibold">{plan.pet}</h4>{getStatusBadge(plan.status)}</div>
                    <p className="text-sm text-gray-600">Peso: {plan.weight}kg → Target: {plan.targetWeight}kg</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Modifica Piano</Button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{width: `${plan.progress}%`}}></div></div>
              <p className="text-xs text-gray-500 mt-1">Progresso: {plan.progress}%</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-green-50 border-green-200"><CardContent className="p-4"><p className="text-sm text-green-800"><strong>ℹ️ Prevenzione AI:</strong> Algoritmo suggerisce piano alimentare custom basato su razza, età, patologie. Previene obesità e riduce visite emergenza.</p></CardContent></Card>
    </div>
  );
}
