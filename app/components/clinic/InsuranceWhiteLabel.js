'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Plus, TrendingUp, Users } from 'lucide-react';

export default function InsuranceWhiteLabel({ user }) {
  const plans = [
    { name: 'VetBuddy Basic', price: 19.90, coverage: 1500, features: ['Visite', 'Esami base', 'Vaccini'] },
    { name: 'VetBuddy Plus', price: 39.90, coverage: 3000, features: ['Basic +', 'Chirurgie', 'Degenza'] },
    { name: 'VetBuddy Premium', price: 59.90, coverage: 5000, features: ['Plus +', 'Specialistiche', 'Fisioterapia'] },
  ];

  const stats = {
    policies: 45,
    revenue: 1795,
    claims: 12,
    satisfaction: 98,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            VetBuddy Pet Insurance (White-Label)
          </h2>
          <p className="text-sm text-gray-500">Vendi assicurazioni pet con tuo brand, revenue share automatico</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50"><CardContent className="p-4"><Users className="h-6 w-6 text-emerald-600 mb-2" /><div className="text-2xl font-bold">{stats.policies}</div><p className="text-xs text-gray-500">Polizze Attive</p></CardContent></Card>
        <Card><CardContent className="p-4"><TrendingUp className="h-6 w-6 text-emerald-600 mb-2" /><div className="text-2xl font-bold">€{stats.revenue.toLocaleString()}</div><p className="text-xs text-gray-500">Revenue Mese</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{stats.claims}</div><p className="text-xs text-gray-500">Claims Processati</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-emerald-600">{stats.satisfaction}%</div><p className="text-xs text-gray-500">Soddisfazione</p></CardContent></Card>
      </div>

      {/* Piani Assicurativi */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Piani Assicurativi VetBuddy-Branded</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <Card key={i} className="hover:shadow-lg transition cursor-pointer">
              <CardContent className="p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-2">{plan.name}</h4>
                <div className="text-3xl font-black text-emerald-600 mb-1">€{plan.price}<span className="text-sm text-gray-500">/mese</span></div>
                <p className="text-sm text-gray-600 mb-4">Copertura fino a €{plan.coverage}</p>
                <div className="space-y-1 mb-4">
                  {plan.features.map((f, j) => <div key={j} className="text-xs text-gray-700 flex items-center gap-1"><span className="text-emerald-500">✓</span>{f}</div>)}
                </div>
                <Button size="sm" className="w-full bg-emerald-600">Vendi Piano</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Business Model */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-emerald-900 mb-2">💰 Revenue Share Model</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div><p className="text-emerald-700 font-semibold">Clinica: 20%</p><p className="text-xs text-emerald-600">Del premio mensile</p></div>
            <div><p className="text-emerald-700 font-semibold">VetBuddy: 10%</p><p className="text-xs text-emerald-600">Piattaforma + tech</p></div>
            <div><p className="text-emerald-700 font-semibold">Assicuratore: 70%</p><p className="text-xs text-emerald-600">Rischio + gestione claims</p></div>
          </div>
          <p className="text-xs text-emerald-700 mt-3">Backend assicurativo: UnipolSai. Claims automatici già integrati in VetBuddy.</p>
        </CardContent>
      </Card>
    </div>
  );
}
