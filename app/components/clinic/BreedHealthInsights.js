'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dna, TrendingUp, AlertTriangle } from 'lucide-react';

export default function BreedHealthInsights({ user }) {
  const insights = [
    { breed: 'Labrador Retriever', age: 5, risks: [{condition: 'Displasia anca', probability: 65, prevention: 'Controllo radiografico annuale'}, {condition: 'Obesità', probability: 45, prevention: 'Piano alimentare controllato'}] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Dna className="h-6 w-6 text-purple-600" />
          Breed-Specific Health Insights AI
        </h2>
        <p className="text-sm text-gray-500">Predizioni rischi salute per razza con AI</p>
      </div>

      {insights.map((insight, i) => (
        <Card key={i} className="border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Dna className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-bold text-lg">{insight.breed}</h3>
                <p className="text-sm text-gray-600">{insight.age} anni</p>
              </div>
            </div>
            <div className="space-y-3">
              {insight.risks.map((risk, j) => (
                <div key={j} className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-purple-600" />
                      {risk.condition}
                    </h4>
                    <Badge className="bg-purple-100 text-purple-700">{risk.probability}% rischio</Badge>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: `${risk.probability}%`}}></div>
                  </div>
                  <p className="text-xs text-purple-700">✓ Prevenzione: {risk.prevention}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <p className="text-sm text-purple-800"><strong>🧬 Precision Medicine:</strong> AI predice rischi per razza. Prevenzione proattiva personalizzata. Basato su big data razza-patologie.</p>
        </CardContent>
      </Card>
    </div>
  );
}
