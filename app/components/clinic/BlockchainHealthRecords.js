'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Shield, CheckCircle } from 'lucide-react';

export default function BlockchainHealthRecords({ user }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Lock className="h-6 w-6 text-blue-600" />
          Blockchain Health Records
        </h2>
        <p className="text-sm text-gray-500">Cartelle cliniche immutabili e portabili</p>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h3 className="font-bold text-xl text-gray-900 mb-4">Cartelle Protette da Blockchain</h3>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div>
              <CheckCircle className="h-5 w-5 text-blue-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900 mb-1">Immutabilità</p>
              <p className="text-xs text-gray-600">Dati non modificabili crittograficamente</p>
            </div>
            <div>
              <Shield className="h-5 w-5 text-blue-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900 mb-1">Controllo Accessi</p>
              <p className="text-xs text-gray-600">Proprietario gestisce permessi</p>
            </div>
            <div>
              <Lock className="h-5 w-5 text-blue-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900 mb-1">Portabilità</p>
              <p className="text-xs text-gray-600">Totale tra cliniche diverse</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800"><strong>🔗 Future-Proof:</strong> Tecnologia blockchain garantisce sicurezza massima e portabilità. Marketing tech appeal.</p>
        </CardContent>
      </Card>
    </div>
  );
}
