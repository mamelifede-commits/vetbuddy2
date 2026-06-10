'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, Mail, MessageCircle, TrendingUp } from 'lucide-react';

export default function MarketingAutomation({ user }) {
  const funnels = [
    { name: 'Lead → Prima Visita', steps: 5, active: true, conversion: '34%' },
    { name: 'Cliente → Fidelizzato', steps: 8, active: true, conversion: '67%' },
    { name: 'Inattivo → Riattivato', steps: 4, active: true, conversion: '28%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-600" />
            Marketing Automation Avanzato
          </h2>
          <p className="text-sm text-gray-500">Funnel multi-step, email sequences, lead scoring</p>
        </div>
        <Button className="bg-yellow-600"><Plus className="h-4 w-4 mr-2" />Nuovo Funnel</Button>
      </div>

      {/* Funnel Attivi */}
      <div className="grid gap-4">
        {funnels.map((funnel, i) => (
          <Card key={i} className="hover:shadow-md transition">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{funnel.name}</h4>
                      <Badge className="bg-green-100 text-green-700">Attivo</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{funnel.steps} step</span>
                      <span className="font-semibold text-emerald-600">Conversion: {funnel.conversion}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">Modifica</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Email Sequences</h3>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Email automatiche multi-step</li>
              <li>• Trigger comportamentali</li>
              <li>• Template personalizzabili</li>
              <li>• A/B testing automatico</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Lead Scoring</h3>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Score 0-100 per ogni lead</li>
              <li>• Prioritizzazione automatica</li>
              <li>• Segmentazione avanzata</li>
              <li>• Predizione conversione AI</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800"><strong>ℹ️ HubSpot-like:</strong> Funnel completi, lead nurturing, conversion optimization. Marketing professionale per cliniche veterinarie.</p>
        </CardContent>
      </Card>
    </div>
  );
}
