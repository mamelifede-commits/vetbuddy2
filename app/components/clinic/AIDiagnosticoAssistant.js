'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Plus, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

export default function AIDiagnosticoAssistant({ user }) {
  const [symptoms, setSymptoms] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyzeSy

mptoms = async () => {
    setLoading(true);
    // Simulazione AI - in produzione chiamerebbe API GPT/Claude
    setTimeout(() => {
      setSuggestions([
        { diagnosis: 'Gastroenterite Acuta', probability: 85, exams: ['Emocromo', 'Ecografia addominale'], urgency: 'alta' },
        { diagnosis: 'Pancreatite', probability: 65, exams: ['cPL', 'Ecografia'], urgency: 'alta' },
        { diagnosis: 'Corpo Estraneo Intestinale', probability: 45, exams: ['Radiografia addominale', 'Ecografia'], urgency: 'media' },
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Diagnostico Assistant
          </h2>
          <p className="text-sm text-gray-500">Co-pilota veterinario: diagnosi differenziali AI-powered</p>
        </div>
      </div>

      {/* Input Sintomi */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />Inserisci Sintomi Osservati
          </h3>
          <Input
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Es: vomito, letargia, anoressia, disidratazione..."
            className="mb-3"
          />
          <Button onClick={analyzeSy

mptoms} disabled={!symptoms || loading} className="bg-purple-600 w-full">
            {loading ? 'Analisi in corso...' : 'Analizza con AI'}
          </Button>
        </CardContent>
      </Card>

      {/* Suggerimenti AI */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">Diagnosi Differenziali Suggerite (da più probabile)</h3>
          {suggestions.map((s, i) => (
            <Card key={i} className="hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-900">{i + 1}. {s.diagnosis}</h4>
                      <Badge className={s.urgency === 'alta' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                        {s.urgency === 'alta' ? <AlertCircle className="h-3 w-3 mr-1" /> : null}
                        Urgenza {s.urgency}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: `${s.probability}%`}}></div>
                      </div>
                      <span className="text-sm font-semibold text-purple-600">{s.probability}%</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Esami consigliati:</p>
                      <div className="flex gap-2 flex-wrap">
                        {s.exams.map((exam, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />{exam}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <p className="text-sm text-purple-800"><strong>⚠️ Disclaimer:</strong> L'AI è un supporto decisionale, NON sostituisce il giudizio clinico del veterinario. Sempre verificare con esami diagnostici.</p>
        </CardContent>
      </Card>
    </div>
  );
}
