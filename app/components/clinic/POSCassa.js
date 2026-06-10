'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, TrendingUp, Check, Link2 } from 'lucide-react';

export default function POSCassa({ user }) {
  const providers = [
    { id: 'nexi', name: 'Nexi', logo: '💳', status: 'connected' },
    { id: 'sumup', name: 'SumUp', logo: '💳', status: 'available' },
    { id: 'stripe', name: 'Stripe Terminal', logo: '💳', status: 'available' },
  ];

  const todayStats = {
    cash: 245.50,
    card: 890.00,
    total: 1135.50,
    transactions: 12,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-indigo-600" />
            POS/Cassa Integrata
          </h2>
          <p className="text-sm text-gray-500">Pagamenti, scontrini, chiusura cassa automatica</p>
        </div>
        <Button className="bg-indigo-600">Chiudi Cassa</Button>
      </div>

      {/* Stats Giornaliere */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <p className="text-xs text-green-700 mb-1">Contanti</p>
            <div className="text-2xl font-bold text-green-900">€{todayStats.cash.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <p className="text-xs text-blue-700 mb-1">Carte</p>
            <div className="text-2xl font-bold text-blue-900">€{todayStats.card.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <p className="text-xs text-purple-700 mb-1">Totale Oggi</p>
            <div className="text-2xl font-bold text-purple-900">€{todayStats.total.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Transazioni</p>
            <div className="text-2xl font-bold text-gray-900">{todayStats.transactions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Provider POS */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Provider POS Integrati</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {providers.map(provider => (
            <Card key={provider.id} className="hover:shadow-md transition">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">{provider.logo}</div>
                <h4 className="font-bold text-gray-900 mb-2">{provider.name}</h4>
                {provider.status === 'connected' ? (
                  <Badge className="bg-green-100 text-green-700"><Check className="h-3 w-3 mr-1" />Connesso</Badge>
                ) : (
                  <Button size="sm" variant="outline"><Link2 className="h-4 w-4 mr-1" />Connetti</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="p-4">
          <p className="text-sm text-indigo-800"><strong>ℹ️ Workflow Completo:</strong> Visita → Pagamento (cash/card) → Scontrino/Fattura automatica → Riconciliazione contabile. Zero errori.</p>
        </CardContent>
      </Card>
    </div>
  );
}
