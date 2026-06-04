'use client';
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain, Sparkles, FileText, Calendar, UserCheck, Plane, 
  ClipboardCheck, Loader2, Copy, Check, Wand2, AlertTriangle,
  ChevronDown, ChevronUp
} from 'lucide-react';

const PASSPORT_AI_TOOLS = [
  {
    id: 'summarize_lab_report',
    name: 'Riassumi Referto',
    shortName: 'Referto',
    description: 'Riassumi un referto di laboratorio in linguaggio semplice',
    icon: FileText,
    color: 'text-blue-500 bg-blue-50 border-blue-200',
    placeholder: 'Incolla qui il testo del referto di laboratorio...\n\nEsempio:\nEmocromo completo:\nGlobuli rossi: 6.8 x10^12/L (rif. 5.5-8.5)\nEmoglobina: 14.2 g/dL (rif. 12-18)\nGlobuli bianchi: 18.5 x10^9/L (rif. 5.5-16.9) ↑\nPiastrine: 280 x10^9/L (rif. 175-500)\nALT: 95 U/L (rif. 10-125)\nCreatinina: 1.8 mg/dL (rif. 0.5-1.8)',
    needsInput: true,
  },
  {
    id: 'extract_dates',
    name: 'Estrai Date',
    shortName: 'Date',
    description: 'Estrai scadenze e date importanti da documenti',
    icon: Calendar,
    color: 'text-amber-500 bg-amber-50 border-amber-200',
    placeholder: 'Incolla qui il testo di un documento, referto o nota clinica...\n\nEsempio:\nVaccino antirabbica effettuato il 15/03/2025, richiamo previsto il 15/03/2026.\nAssicurazione pet scade il 30/06/2026.\nProssimo controllo ecografico tra 3 mesi.',
    needsInput: true,
  },
  {
    id: 'generate_pet_sitter_instructions',
    name: 'Istruzioni Pet Sitter',
    shortName: 'Pet Sitter',
    description: 'Genera istruzioni dettagliate per chi si prende cura del tuo animale',
    icon: UserCheck,
    color: 'text-green-500 bg-green-50 border-green-200',
    placeholder: 'Aggiungi eventuali informazioni extra...\n\nEsempio:\nIl pet sitter verrà dal 1 al 7 agosto.\nMax ha paura dei temporali.\nLa passeggiata serale deve essere almeno 30 minuti.',
    needsInput: false,
    autoContext: true,
  },
  {
    id: 'generate_travel_checklist',
    name: 'Checklist Viaggio',
    shortName: 'Viaggio',
    description: 'Genera una checklist completa per viaggiare con il tuo animale',
    icon: Plane,
    color: 'text-sky-500 bg-sky-50 border-sky-200',
    placeholder: 'Descrivi il viaggio...\n\nEsempio:\nViaggio in auto a Barcellona (Spagna) dal 15 al 25 agosto.\nAlloggio in hotel pet-friendly.',
    needsInput: true,
    autoContext: true,
  },
  {
    id: 'passport_suggest_missing',
    name: 'Analisi Passport',
    shortName: 'Analisi',
    description: 'Analizza il Passport e suggerisci cosa migliorare',
    icon: ClipboardCheck,
    color: 'text-purple-500 bg-purple-50 border-purple-200',
    placeholder: '',
    needsInput: false,
    autoContext: true,
  },
];

export default function PassportAIAssistant({ pet, passportData, token }) {
  const [selectedTool, setSelectedTool] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showContext, setShowContext] = useState(false);

  // Build context from passport data
  const buildPetContext = useCallback(() => {
    if (!pet || !passportData) return {};
    const { emergencyContacts, vaccinations, insurance, travelPacks, completion, passport } = passportData;
    return {
      nome: pet.name || '',
      specie: pet.species || '',
      razza: pet.breed || '',
      eta: pet.birthDate ? `Nato il ${new Date(pet.birthDate).toLocaleDateString('it-IT')}` : 'Non indicata',
      peso: pet.weight ? `${pet.weight} kg` : 'Non indicato',
      microchip: pet.microchip || 'Non registrato',
      allergie: pet.allergies?.length > 0 ? pet.allergies.join(', ') : 'Nessuna segnalata',
      farmaci: pet.medications?.length > 0 ? pet.medications.join(', ') : 'Nessuno',
      patologieCroniche: pet.chronicConditions?.length > 0 ? pet.chronicConditions.join(', ') : 'Nessuna',
      dieta: pet.diet || 'Non indicata',
      noteComportamentali: pet.behavioralNotes || 'Nessuna',
      segniParticolari: pet.distinguishingMarks || 'Nessuno',
      contattiEmergenza: emergencyContacts?.map(c => `${c.name} (${c.relationship}): ${c.phone}`).join('; ') || 'Nessuno',
      vaccini: vaccinations?.map(v => `${v.name} - ${new Date(v.date).toLocaleDateString('it-IT')}${v.nextDueDate ? ` (prossimo: ${new Date(v.nextDueDate).toLocaleDateString('it-IT')})` : ''} [${v.status}]`).join('; ') || 'Nessuno',
      assicurazione: insurance ? `${insurance.providerName} - Polizza: ${insurance.policyNumber || 'N/D'} - Scade: ${insurance.endDate ? new Date(insurance.endDate).toLocaleDateString('it-IT') : 'N/D'}` : 'Non registrata',
      viaggiProgrammati: travelPacks?.map(t => `${t.destination} (${t.startDate ? new Date(t.startDate).toLocaleDateString('it-IT') : '?'} - ${t.endDate ? new Date(t.endDate).toLocaleDateString('it-IT') : '?'})`).join('; ') || 'Nessuno',
      completamentoPassport: `${completion?.score || 0}% — ${completion?.status || 'incompleto'}`,
      datiMancanti: completion?.missing?.join(', ') || 'Nessuno',
      qrAttivo: passport?.publicQrEnabled ? 'Sì' : 'No',
      lostPetMode: passport?.lostPetMode ? 'ATTIVO' : 'No',
    };
  }, [pet, passportData]);

  const handleGenerate = async (tool) => {
    const activeTool = tool || selectedTool;
    if (!activeTool) return;
    
    setLoading(true);
    setResult('');
    setSelectedTool(activeTool);

    try {
      const context = activeTool.autoContext ? buildPetContext() : {};
      
      let userMessage = '';
      if (activeTool.needsInput && input.trim()) {
        userMessage = input.trim();
      } else if (!activeTool.needsInput) {
        // Auto-generate input from context for non-input tools
        if (activeTool.id === 'generate_pet_sitter_instructions') {
          userMessage = `Genera istruzioni complete per il pet sitter di ${pet?.name || 'questo animale'}. ${input.trim() ? 'Note aggiuntive: ' + input.trim() : ''}`;
        } else if (activeTool.id === 'passport_suggest_missing') {
          userMessage = `Analizza il Passport di ${pet?.name || 'questo animale'} e suggerisci cosa manca o andrebbe migliorato.`;
        } else {
          userMessage = input.trim() || `Analizza i dati di ${pet?.name || 'questo animale'}.`;
        }
      } else {
        setResult('Inserisci del testo per procedere.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: activeTool.id,
          input: userMessage,
          context: Object.keys(context).length > 0 ? context : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      } else {
        setResult(`❌ Errore: ${data.error || 'Risposta non valida'}`);
      }
    } catch (err) {
      setResult(`❌ Errore di connessione: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const petContext = buildPetContext();

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900">Assistente Intelligente</h3>
            </div>
            <Badge className="bg-purple-100 text-purple-700 text-xs">
              <Sparkles className="h-3 w-3 mr-1" /> AI Passport
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            L&apos;AI analizza i dati del Passport di <strong>{pet?.name || 'il tuo animale'}</strong> per generare riassunti, istruzioni e suggerimenti personalizzati.
          </p>
        </CardContent>
      </Card>

      {/* Tool Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {PASSPORT_AI_TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => {
              setSelectedTool(tool);
              setResult('');
              setInput('');
            }}
            className={`p-3 rounded-xl border-2 text-left transition hover:shadow-md ${
              selectedTool?.id === tool.id
                ? `${tool.color} ring-2 ring-offset-1`
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <tool.icon className={`h-5 w-5 mb-1.5 ${selectedTool?.id === tool.id ? '' : 'text-gray-400'}`} />
            <p className="font-bold text-xs text-gray-900 leading-tight">{tool.shortName}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight hidden sm:block">{tool.description}</p>
          </button>
        ))}
      </div>

      {/* Selected Tool Workspace */}
      {selectedTool && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <selectedTool.icon className="h-4 w-4" /> {selectedTool.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Context Preview Toggle */}
            {selectedTool.autoContext && (
              <div className="bg-gray-50 rounded-lg p-3">
                <button
                  onClick={() => setShowContext(!showContext)}
                  className="flex items-center justify-between w-full text-xs text-gray-600"
                >
                  <span className="flex items-center gap-1">
                    <ClipboardCheck className="h-3 w-3" />
                    Contesto Passport di {pet?.name} (dati inviati all&apos;AI)
                  </span>
                  {showContext ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                {showContext && (
                  <div className="mt-2 space-y-1 text-[11px] text-gray-500 max-h-40 overflow-y-auto">
                    {Object.entries(petContext).map(([key, val]) => (
                      <div key={key} className="flex gap-1">
                        <span className="font-medium text-gray-700 min-w-[110px]">{key}:</span>
                        <span className="truncate">{val || '—'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Input Area */}
            {(selectedTool.needsInput || selectedTool.autoContext) && (
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedTool.placeholder}
                rows={selectedTool.needsInput ? 6 : 3}
                className="resize-none text-sm"
              />
            )}

            {/* Generate Button */}
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => handleGenerate(selectedTool)}
              disabled={loading || (selectedTool.needsInput && !input.trim() && !selectedTool.autoContext)}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generazione in corso...</>
              ) : (
                <><Wand2 className="h-4 w-4 mr-2" /> Genera con AI</>
              )}
            </Button>

            {/* Result */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">L&apos;Assistente sta elaborando...</p>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-purple-500" /> Risultato
                  </span>
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={handleCopy}>
                    {copied ? <><Check className="h-3 w-3 mr-1 text-green-500" /> Copiato!</> : <><Copy className="h-3 w-3 mr-1" /> Copia</>}
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{result}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions (when no tool selected) */}
      {!selectedTool && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">⚡ Azioni rapide</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => {
                  const tool = PASSPORT_AI_TOOLS.find(t => t.id === 'passport_suggest_missing');
                  setSelectedTool(tool);
                  handleGenerate(tool);
                }}
              >
                <ClipboardCheck className="h-4 w-4 mr-2 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium text-xs">Analizza il mio Passport</p>
                  <p className="text-[10px] text-gray-400">Scopri cosa manca e come migliorarlo</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => {
                  const tool = PASSPORT_AI_TOOLS.find(t => t.id === 'generate_pet_sitter_instructions');
                  setSelectedTool(tool);
                  handleGenerate(tool);
                }}
              >
                <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                <div className="text-left">
                  <p className="font-medium text-xs">Genera istruzioni pet sitter</p>
                  <p className="text-[10px] text-gray-400">Crea un foglio istruzioni completo</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical Disclaimer */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-800 leading-relaxed">
        <strong>⚕️ Nota importante:</strong> Le risposte generate dall&apos;Assistente Intelligente hanno scopo puramente organizzativo e informativo. Non sostituiscono in alcun modo il parere, la diagnosi o la prescrizione del medico veterinario.
      </div>
    </div>
  );
}
