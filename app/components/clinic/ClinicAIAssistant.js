'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BackToDashboard from '@/app/components/shared/BackToDashboard';
import {
  Brain, Sparkles, FileText, MessageCircle, Languages, Reply,
  Loader2, Copy, Check, RotateCcw, Wand2, ClipboardList
} from 'lucide-react';

const AI_TOOLS = [
  {
    id: 'summarize_visit',
    name: 'Riassumi Visita',
    description: 'Genera un riassunto strutturato dalle note della visita',
    icon: FileText,
    color: 'text-blue-500 bg-blue-50 border-blue-200',
    placeholder: 'Incolla qui le note della visita...\n\nEsempio:\nPaziente: Luna, femmina sterilizzata, 5 anni. Peso 28kg. Visita per vomito intermittente da 3 giorni. T 38.5, FC 90, FR 22. Addome trattabile, lieve dolore alla palpazione epigastrica. Prescritta ecografia addominale e esami sangue completi. Terapia: Cerenia 1mg/kg SID per 3gg, dieta blanda.',
    examples: ['Note di una visita di routine', 'Appunti di una visita d\'emergenza', 'Note post-operatorie']
  },
  {
    id: 'draft_message',
    name: 'Scrivi Messaggio',
    description: 'Genera un messaggio professionale per il proprietario',
    icon: MessageCircle,
    color: 'text-green-500 bg-green-50 border-green-200',
    placeholder: 'Descrivi il messaggio da inviare...\n\nEsempio:\nScrivi un messaggio per il proprietario di Luna per comunicare che i risultati degli esami del sangue sono pronti e sono nella norma, ma consigliamo un controllo tra 3 mesi.',
    examples: ['Risultati esami pronti', 'Promemoria vaccino', 'Follow-up post chirurgia']
  },
  {
    id: 'translate_notes',
    name: 'Traduci Note Cliniche',
    description: 'Trasforma note tecniche in linguaggio semplice per il proprietario',
    icon: Languages,
    color: 'text-purple-500 bg-purple-50 border-purple-200',
    placeholder: 'Incolla le note cliniche tecniche...\n\nEsempio:\nEco addome: parenchima epatico omogeneo, margini regolari. Colecisti normodistesa. Milza nella norma. Reni: corticale conservata bilateralmente, rapporto C/M nella norma. Vescica moderatamente distesa, pareti regolari. No versamento libero. Linfonodi mesenterici nella norma.',
    examples: ['Referto ecografia', 'Esiti esami del sangue', 'Note chirurgiche']
  },
  {
    id: 'smart_reply',
    name: 'Risposta Intelligente',
    description: 'Genera una risposta a un messaggio del proprietario',
    icon: Reply,
    color: 'text-amber-500 bg-amber-50 border-amber-200',
    placeholder: 'Incolla il messaggio del proprietario...\n\nEsempio:\nBuongiorno dottore, Luna ha vomitato di nuovo stamattina e non vuole mangiare. Sono preoccupato, cosa mi consiglia? Devo portarla subito?',
    examples: ['Richiesta urgente', 'Domanda su farmaci', 'Richiesta appuntamento']
  }
];

function ClinicAIAssistant({ user, onNavigate }) {
  const [selectedTool, setSelectedTool] = useState(AI_TOOLS[0]);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: selectedTool.id,
          input: input.trim()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data.result);
        setHistory(prev => [{
          tool: selectedTool.name,
          input: input.substring(0, 80) + (input.length > 80 ? '...' : ''),
          result: data.result.substring(0, 100) + '...',
          timestamp: new Date().toLocaleString('it-IT')
        }, ...prev.slice(0, 9)]);
      } else {
        setResult(`Errore: ${data.error || 'Risposta non valida'}`);
      }
    } catch (err) {
      setResult(`Errore di connessione: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  const handleUseExample = (example) => {
    setInput(example);
  };

  return (
    <div className="space-y-6">
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" /> AI Assistant
          </h2>
          <p className="text-gray-500 text-sm">Strumenti AI per velocizzare il tuo lavoro quotidiano</p>
        </div>
        <Badge className="bg-purple-100 text-purple-700 text-xs">
          <Sparkles className="h-3 w-3 mr-1" /> Powered by AI
        </Badge>
      </div>

      {/* Tool selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {AI_TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => { setSelectedTool(tool); setResult(''); }}
            className={`p-4 rounded-xl border-2 text-left transition hover:shadow-md ${
              selectedTool.id === tool.id 
                ? `${tool.color} ring-2 ring-offset-1` 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <tool.icon className={`h-6 w-6 mb-2 ${selectedTool.id === tool.id ? '' : 'text-gray-400'}`} />
            <p className="font-bold text-sm text-gray-900">{tool.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
          </button>
        ))}
      </div>

      {/* Main workspace */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <selectedTool.icon className="h-4 w-4" /> {selectedTool.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedTool.placeholder}
              rows={10}
              className="resize-none text-sm"
            />
            
            {/* Quick examples */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-400">Esempi:</span>
              {selectedTool.examples.map((ex, i) => (
                <button key={i} onClick={() => handleUseExample(ex)} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition">
                  {ex}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={handleClear} className="text-xs">
                <RotateCcw className="h-3 w-3 mr-1" /> Pulisci
              </Button>
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700 text-white" 
                onClick={handleGenerate}
                disabled={loading || !input.trim()}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Wand2 className="h-4 w-4 mr-1" />}
                {loading ? 'Generazione...' : 'Genera'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-500" /> Risultato</span>
              {result && (
                <Button size="sm" variant="outline" className="text-xs" onClick={handleCopy}>
                  {copied ? <><Check className="h-3 w-3 mr-1 text-green-500" /> Copiato!</> : <><Copy className="h-3 w-3 mr-1" /> Copia</>}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">L'AI sta elaborando...</p>
                </div>
              </div>
            ) : result ? (
              <div className="bg-gray-50 rounded-lg p-4 min-h-[240px]">
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{result}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center py-16 text-center">
                <div>
                  <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Inserisci il testo e clicca "Genera"</p>
                  <p className="text-xs text-gray-400 mt-1">Il risultato apparirà qui</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-gray-400" /> Cronologia sessione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{item.tool}</Badge>
                    <span className="text-gray-600 truncate max-w-xs">{item.input}</span>
                  </div>
                  <span className="text-gray-400 flex-shrink-0">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ClinicAIAssistant;
