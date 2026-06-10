'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertCircle, CheckCircle, Syringe } from 'lucide-react';

export default function PetBehaviorProfiling() {
  const [patients] = useState([
    { name: 'Rocky', owner: 'Esposito Marco', anxiety: 85, aggression: 72, protocol: 'Sedazione leggera + feromoni', badge: 'Alto rischio', color: 'red' },
    { name: 'Luna', owner: 'Ferrari Sara', anxiety: 45, aggression: 20, protocol: 'Low Stress Handling', badge: 'Ansia moderata', color: 'amber' },
    { name: 'Milo', owner: 'Romano Giulia', anxiety: 10, aggression: 5, protocol: 'Gestione standard', badge: 'Collaborativo', color: 'green' },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900">Pet Behavior AI Profiling</h2>
          <Badge className="bg-purple-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">AI analizza storico visite + questionario proprietario → predice ansia/aggressività. Protocollo gestione personalizzato. Sicurezza staff +60%, meno sedazioni inutili, clienti soddisfatti.</p>
      </div>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader>
          <CardTitle className="text-lg">Pazienti in Visita Oggi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patients.map((p, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border-l-4" style={{ borderLeftColor: p.color === 'red' ? '#dc2626' : p.color === 'amber' ? '#f59e0b' : '#10b981' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{p.name} • {p.owner}</h3>
                  <Badge className={`mt-1 ${
                    p.color === 'red' ? 'bg-red-100 text-red-700' :
                    p.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>{p.badge}</Badge>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Score Ansia</div>
                  <div className="text-2xl font-bold" style={{ color: p.color === 'red' ? '#dc2626' : p.color === 'amber' ? '#f59e0b' : '#10b981' }}>{p.anxiety}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <span className="text-gray-500">Aggressività:</span>
                  <div className="h-2 bg-gray-200 rounded-full mt-1">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${p.aggression}%` }}></div>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Ansia:</span>
                  <div className="h-2 bg-gray-200 rounded-full mt-1">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${p.anxiety}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="flex items-center gap-2">
                  <Syringe className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-gray-900">Protocollo: {p.protocol}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: AlertCircle, label: 'Morsi evitati', value: '12/mese', color: 'text-red-600' },
          { icon: Syringe, label: 'Sedazioni ridotte', value: '-45%', color: 'text-blue-600' },
          { icon: CheckCircle, label: 'Soddisfazione clienti', value: '94%', color: 'text-green-600' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <s.icon className={`h-6 w-6 ${s.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-600">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
