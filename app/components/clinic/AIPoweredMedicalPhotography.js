'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, CheckCircle, AlertTriangle, Zap } from 'lucide-react';

export default function AIPoweredMedicalPhotography() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Camera className="h-6 w-6 text-cyan-500" />
          <h2 className="text-2xl font-bold text-gray-900">AI-Powered Medical Photography</h2>
          <Badge className="bg-cyan-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">AI valuta qualità foto PRIMA di salvarle. Suggerisce miglioramenti real-time: "Avvicina 10cm", "Ruota 45°". Auto-enhance: correzione colore, contrasto, nitidezza. Template guidati per patologie. Annotazione automatica con frecce/cerchi su lesioni. Zero foto da rifare.</p>
      </div>

      <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Valutazione Qualità Real-Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center mb-3">
              <Camera className="h-16 w-16 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Nitidezza:</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '85%' }}></div>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Illuminazione:</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: '60%' }}></div>
                  </div>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Inquadratura:</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '92%' }}></div>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-amber-100 rounded p-3 mt-3 border-l-4 border-amber-500">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <strong>Suggerimento AI:</strong> Usa il flash per migliorare illuminazione. Evita ombre sulla lesione.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-sm">Template Guidati</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {[
              { condition: 'Dermatite', photos: '4 foto standard: overview + close-up lesione + bordo + controlaterale' },
              { condition: 'Lesione oculare', photos: '6 foto: anteriore, laterale dx/sx, pupilla dilatata, test Schirmer' },
              { condition: 'Zoppia', photos: '8 foto: 4 arti in stazione, palpazione, cammino frontale/laterale' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded p-2 border">
                <div className="font-bold text-gray-900">{t.condition}</div>
                <div className="text-gray-600">{t.photos}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="text-sm">Auto-Enhance Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Zap className="h-4 w-4 text-purple-600" />
              <span>Correzione automatica colore e contrasto</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Zap className="h-4 w-4 text-purple-600" />
              <span>Aumento nitidezza selettivo su lesioni</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Zap className="h-4 w-4 text-purple-600" />
              <span>Annotazione automatica con frecce/cerchi</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Zap className="h-4 w-4 text-purple-600" />
              <span>Watermark "Medical Use Only" automatico</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">0%</div>
            <div className="text-xs text-gray-600">Foto da rifare</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Camera className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">92%</div>
            <div className="text-xs text-gray-600">Qualità garantita</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">2 sec</div>
            <div className="text-xs text-gray-600">Analisi AI</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">-85%</div>
            <div className="text-xs text-gray-600">Tempo sprecato</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
