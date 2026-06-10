'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, TrendingUp, Euro } from 'lucide-react';

export default function VeterinaryInvoiceFinancing() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-6 w-6 text-teal-500" />
          <h2 className="text-2xl font-bold text-gray-900">Veterinary Invoice Financing</h2>
          <Badge className="bg-teal-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">Buy Now Pay Later veterinario (Klarna/Scalapay). Proprietario paga in 3-12 rate, clinica riceve subito fattura completa. Approvazione istantanea 95%. Zero rischio clinica. +30-40% acceptance rate chirurgie/cure costose. Zero animali rifiutati per soldi.</p>
      </div>

      <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-lg">Simulazione Rateizzazione</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Importo intervento:</span>
              <span className="text-2xl font-bold text-gray-900">€1.500</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { rate: '3 rate', monthly: 500, interest: 0 },
                { rate: '6 rate', monthly: 250, interest: 2 },
                { rate: '12 rate', monthly: 125, interest: 5 },
              ].map((plan, i) => (
                <div key={i} className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-3 border-2 border-teal-200 text-center">
                  <div className="font-bold text-teal-700 text-sm mb-1">{plan.rate}</div>
                  <div className="text-2xl font-black text-teal-900 mb-1">€{plan.monthly}</div>
                  <div className="text-xs text-gray-600">al mese</div>
                  {plan.interest === 0 && <Badge className="mt-2 bg-green-600 text-xs">0% interesse</Badge>}
                  {plan.interest > 0 && <div className="text-xs text-gray-500 mt-1">{plan.interest}% TAN</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-100 rounded-lg p-4 border border-green-300">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 text-sm mb-1">Approvazione Istantanea</h3>
                <p className="text-xs text-green-800">95% dei proprietari vengono approvati in meno di 60 secondi. Zero burocrazia. La clinica riceve l'importo completo immediatamente.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-sm">Vantaggi Clinica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Euro className="h-4 w-4 text-green-600" />
              <span>Pagamento immediato fattura completa</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Zero rischio insolvenza (gestito da partner)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>+30-40% acceptance rate chirurgie costose</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Zero animali rifiutati per motivi economici</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-sm">Vantaggi Proprietario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span>Paga in comode rate senza carta di credito</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span>Approvazione immediata online (60 sec)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Euro className="h-4 w-4 text-blue-600" />
              <span>3 rate senza interessi sempre disponibili</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span>Salva il tuo animale oggi, paga domani</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-teal-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">+35%</div>
            <div className="text-xs text-gray-600">Acceptance chirurgie</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">95%</div>
            <div className="text-xs text-gray-600">Tasso approvazione</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Euro className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">0%</div>
            <div className="text-xs text-gray-600">Rischio clinica</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">60 sec</div>
            <div className="text-xs text-gray-600">Approvazione</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
