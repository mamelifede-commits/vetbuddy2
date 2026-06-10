'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, FileText, Phone, CheckCircle } from 'lucide-react';

export default function VeterinaryLitigationShield() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900">Veterinary Litigation Shield</h2>
          <Badge className="bg-blue-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">Assicurazione professionale integrata + AI che analizza cartelle cliniche per gap documentali rischiosi + supporto legale h24. Contenziosi costano €10-50k. Peace of mind totale.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Analisi Rischio Cartella Clinica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-white rounded-lg p-3 border-l-4 border-amber-500">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">Paziente: Luna (ID: #4521)</span>
                <Badge className="bg-amber-500">Rischio Medio</Badge>
              </div>
              <p className="text-xs text-gray-700 mb-2">⚠️ Consenso informato chirurgia non firmato</p>
              <Button size="sm" variant="outline" className="text-xs">Genera consenso ora</Button>
            </div>
            <div className="bg-white rounded-lg p-3 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">Paziente: Max (ID: #4398)</span>
                <Badge className="bg-red-600">Rischio Alto</Badge>
              </div>
              <p className="text-xs text-gray-700 mb-2">⚠️ Complicanza post-op NON documentata. Cliente insoddisfatto.</p>
              <Button size="sm" className="text-xs bg-red-600 hover:bg-red-700">Integra documentazione</Button>
            </div>
            <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">Paziente: Mia (ID: #4287)</span>
                <Badge className="bg-green-600">Rischio Basso</Badge>
              </div>
              <p className="text-xs text-gray-700">✅ Documentazione completa e conforme</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Copertura Assicurativa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {[
                { label: 'Massimale per sinistro', value: '€500.000' },
                { label: 'Franchigia', value: '€500' },
                { label: 'Premio annuale', value: '€650/anno' },
                { label: 'Sinistri coperti', value: 'Illimitati' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Supporto legale h24 incluso
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Mediazione automatica pre-causa
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Avvocati specializzati diritto veterinario
              </div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">Attiva copertura</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-bold text-sm text-gray-900">Supporto Legale h24</h3>
              <p className="text-xs text-gray-600">In caso di contenzioso, avvocato specializzato disponibile in 2 ore.</p>
            </div>
            <Button size="sm" variant="outline">Chiama ora: 800-VET-LEX</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
