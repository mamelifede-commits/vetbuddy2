'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, ArrowRight, Sparkles, FileText } from 'lucide-react';

export default function CrossSpeciesLearningAI() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-6 w-6 text-cyan-500" />
          <h2 className="text-2xl font-bold text-gray-900">Cross-Species Learning AI</h2>
          <Badge className="bg-cyan-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">AI trained su TUTTE le specie (cane, gatto, cavallo, rettili, uccelli). Transfer learning: "Questa dermatite nel gatto è simile a caso canino risolto con X". Risolvi casi impossibili fuori comfort zone.</p>
      </div>

      <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Caso Clinico in Analisi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-cyan-100 rounded-full p-2">
                <Sparkles className="h-5 w-5 text-cyan-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Dermatite cronica felina resistente a terapia</h3>
                <p className="text-sm text-gray-600">Gatto europeo, 7 anni. Lesioni pruriginose dorso. Falliti: cortisone, antibiotici, dieta ipoallergenica.</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-lg p-4 border-l-4 border-cyan-500">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-cyan-600" />
                <span className="font-bold text-sm text-cyan-900">AI Cross-Species Insight</span>
              </div>
              <p className="text-sm text-gray-700 mb-3">Ho trovato 47 casi simili in database multi-specie:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <ArrowRight className="h-3 w-3 text-purple-600" />
                  <span><strong>23 casi canini</strong> risolti con ciclosporina 5mg/kg + shampoo clorexidina</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <ArrowRight className="h-3 w-3 text-purple-600" />
                  <span><strong>12 casi felini</strong> stessa presentazione → allergene ambientale (acari stoccaggio)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <ArrowRight className="h-3 w-3 text-purple-600" />
                  <span><strong>8 casi cavalli</strong> con lesioni analoghe → dermatofitosi atipica (coltura 21gg)</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                <FileText className="h-3 w-3 mr-1" />
                Vedi letteratura cross-species
              </Button>
              <Button size="sm" variant="outline">Suggerisci terapia</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Specie database', value: '47', icon: '🐕🐈🐴🦎🦜' },
          { label: 'Casi clinici', value: '2.4M', icon: '📊' },
          { label: 'Successo terapie', value: '+65%', icon: '✅' },
          { label: 'Casi risolti', value: '890', icon: '🎯' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-600">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
