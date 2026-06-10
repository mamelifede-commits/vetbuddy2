'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, BarChart3, Award, TrendingUp } from 'lucide-react';

export default function VetBuddyCarbonOffset() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900">VetBuddy Carbon Offset</h2>
          <Badge className="bg-green-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">Calcolo impronta carbonio clinica automatico. Certificazione "Carbon Neutral Vet Clinic" con badge. Compensazione €30-50/mese. Gen Z/Millennial scelgono business sostenibili. Differenziatore marketing enorme.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg">La Tua Impronta Carbonio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-5xl font-black text-green-700 mb-2">12.4</div>
              <div className="text-sm text-gray-600">Tonnellate CO₂/anno</div>
            </div>
            <div className="space-y-2">
              {[
                { source: 'Energia elettrica', co2: 5.2, pct: 42 },
                { source: 'Rifiuti speciali', co2: 3.1, pct: 25 },
                { source: 'Riscaldamento/AC', co2: 2.8, pct: 23 },
                { source: 'Viaggi visite domiciliari', co2: 1.3, pct: 10 },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded p-3 border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.source}</span>
                    <span className="text-sm font-bold text-green-700">{item.co2}t</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${item.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Certificazione Carbon Neutral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-6 border-2 border-green-500 text-center">
              <Award className="h-16 w-16 text-green-600 mx-auto mb-3" />
              <h3 className="font-black text-xl text-gray-900 mb-2">CARBON NEUTRAL</h3>
              <p className="text-sm text-gray-600 mb-3">Clinica Veterinaria Certificata</p>
              <Badge className="bg-green-600">Certificato #VB-2025-0847</Badge>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-sm text-gray-900 mb-2">Compensazione Attiva</h4>
              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Costo mensile:</span>
                  <span className="font-bold">€45</span>
                </div>
                <div className="flex justify-between">
                  <span>CO₂ compensata:</span>
                  <span className="font-bold">12.4 tonnellate/anno</span>
                </div>
                <div className="flex justify-between">
                  <span>Equivalente:</span>
                  <span className="font-bold">620 alberi piantati</span>
                </div>
              </div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">Attiva Certificazione</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Leaf className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">620</div>
            <div className="text-xs text-gray-600">Alberi equivalenti</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">+18%</div>
            <div className="text-xs text-gray-600">Preferenza Gen Z</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">Prima</div>
            <div className="text-xs text-gray-600">Vet Carbon Neutral</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">€45</div>
            <div className="text-xs text-gray-600">Costo mensile</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
