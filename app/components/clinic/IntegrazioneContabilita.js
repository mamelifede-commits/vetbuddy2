'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, CheckCircle, TrendingUp, FileText, Link2 } from 'lucide-react';

export default function IntegrazioneContabilita({ user }) {
  const providers = [
    { id: 'fatture_cloud', name: 'Fatture in Cloud', logo: '📊', status: 'connected', syncLast: '5 min fa' },
    { id: 'teamsystem', name: 'TeamSystem', logo: '🏢', status: 'available', syncLast: null },
    { id: 'aruba', name: 'Aruba Fatturazione', logo: '☁️', status: 'available', syncLast: null },
  ];

  const stats = [
    { label: 'Fatture Sincronizzate', value: '156', change: '+12' },
    { label: 'Movimenti Bancari', value: '89', change: '+5' },
    { label: 'Prima Nota Automatica', value: '100%', change: '' },
    { label: 'Risparmio Tempo', value: '8h/mese', change: '' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-green-600" />
            Integrazione Contabilità
          </h2>
          <p className="text-sm text-gray-500">Sync automatico con software commercialista</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              {stat.change && <Badge className="mt-1 bg-green-100 text-green-700 text-xs">{stat.change}</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provider Integrati */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Software Contabilità Supportati</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {providers.map(provider => (
            <Card key={provider.id} className="hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">{provider.logo}</div>
                  <h4 className="font-bold text-gray-900 mb-2">{provider.name}</h4>
                  {provider.status === 'connected' ? (
                    <>
                      <Badge className="bg-green-100 text-green-700 mb-2"><CheckCircle className="h-3 w-3 mr-1" />Connesso</Badge>
                      <p className="text-xs text-gray-500">Ultimo sync: {provider.syncLast}</p>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full"><Link2 className="h-4 w-4 mr-1" />Connetti</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Funzionalità */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-green-600" />Sync Automatico</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Fatture XML → commercialista</li>
              <li>• Import movimenti bancari</li>
              <li>• Prima nota automatica</li>
              <li>• Riconciliazione automatica</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-600" />Dashboard Fiscale</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Situazione IVA real-time</li>
              <li>• Scadenze fiscali alert</li>
              <li>• Report per commercialista</li>
              <li>• Export Excel/PDF</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <p className="text-sm text-green-800"><strong>ℹ️ Risparmio Tempo:</strong> 5-10 ore/mese risparmiate al commercialista. Dati sempre sincronizzati, zero errori di trascrizione.</p>
        </CardContent>
      </Card>
    </div>
  );
}
