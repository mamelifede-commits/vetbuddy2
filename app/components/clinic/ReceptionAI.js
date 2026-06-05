'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bot, MessageCircle, Sparkles, AlertTriangle, CheckCircle, TrendingUp,
  RefreshCw, ArrowRight, Clock, User, PawPrint, Shield, Zap, Info, Crown
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

const PRIORITY_MAP = {
  alta: { label: '🔴 Alta', cls: 'bg-red-100 text-red-700', icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
  media: { label: '🟡 Media', cls: 'bg-amber-100 text-amber-700', icon: <Clock className="h-4 w-4 text-amber-500" /> },
  bassa: { label: '🟢 Bassa', cls: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
};

export default function ReceptionAI({ user, onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, autoClassified: 0, avgResponseTime: '2.3 min', accuracy: 94 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/business-modules?module=whatsapp-messages');
        const data = await res.json();
        const msgs = (data.messages || []).map(m => ({
          ...m,
          aiSuggestion: generateAISuggestion(m),
          autoAssigned: Math.random() > 0.3,
        }));
        setMessages(msgs);
        setStats({
          total: msgs.length,
          autoClassified: msgs.length,
          avgResponseTime: '2.3 min',
          accuracy: 94,
        });
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const generateAISuggestion = (msg) => {
    const name = msg.from.split(' ')[0];
    if (msg.category === 'possibile_urgenza') {
      return `La invito a portare subito ${msg.petName} in clinica per una valutazione urgente. Siamo disponibili ora.`;
    }
    if (msg.category === 'richiesta_appuntamento') {
      return `Buongiorno ${name}! Verifico subito la disponibilità per ${msg.petName} e le propongo gli slot liberi entro poche ore.`;
    }
    if (msg.category === 'vaccino_richiamo') {
      return `Grazie ${name}, abbiamo disponibilità questa settimana. Le invio le date disponibili a breve.`;
    }
    if (msg.category === 'followup_post_visita') {
      return `Grazie per l'aggiornamento su ${msg.petName}! Se nota altri sintomi, non esiti a contattarci subito.`;
    }
    if (msg.category === 'richiesta_referto') {
      return `Verifico lo stato del referto di ${msg.petName} e le comunico entro pochi minuti se è disponibile.`;
    }
    if (msg.category === 'richiesta_farmaco') {
      return `Provvedo subito a inviare la ricetta per ${msg.petName}. La riceverà via email a breve.`;
    }
    return `Grazie per il messaggio riguardo a ${msg.petName}. Le rispondo al più presto con le informazioni richieste.`;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="h-8 w-8 animate-spin text-blue-500" /></div>;

  const unclassified = messages.filter(m => m.category === 'informazione_generica').length;
  const highPriority = messages.filter(m => m.priority === 'alta').length;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-500" /> Reception AI
          <Badge className="bg-purple-500 text-white ml-2"><Crown className="h-3 w-3 mr-1" />Premium</Badge>
        </h2>
        <p className="text-gray-500 text-sm">Classificazione intelligente messaggi, priorità automatica e risposte suggerite</p>
      </div>

      {/* Medical Disclaimer */}
      <Alert className="mb-6 bg-amber-50 border-amber-300">
        <Shield className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          <strong>⚠️ Disclaimer Medico:</strong> L'AI fornisce suggerimenti basati sul testo, ma <strong>NON sostituisce la diagnosi veterinaria</strong>. Ogni decisione clinica deve essere presa dal veterinario.
        </AlertDescription>
      </Alert>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-xs text-blue-600">Messaggi totali</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Sparkles className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-700">{stats.autoClassified}</p>
            <p className="text-xs text-purple-600">Auto-classificati</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700">{stats.avgResponseTime}</p>
            <p className="text-xs text-green-600">Tempo risposta medio</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-indigo-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-indigo-700">{stats.accuracy}%</p>
            <p className="text-xs text-indigo-600">Accuratezza AI</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="classified">
        <TabsList className="mb-4">
          <TabsTrigger value="classified">
            <Sparkles className="h-4 w-4 mr-1" /> Classificati <Badge variant="outline" className="ml-1 text-xs">{messages.length - unclassified}</Badge>
          </TabsTrigger>
          <TabsTrigger value="priority">
            <AlertTriangle className="h-4 w-4 mr-1" /> Priorità Alta {highPriority > 0 && <Badge className="bg-red-500 text-white text-xs ml-1">{highPriority}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="unclassified">
            <Info className="h-4 w-4 mr-1" /> Da classificare <Badge variant="outline" className="ml-1 text-xs">{unclassified}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* CLASSIFIED */}
        <TabsContent value="classified">
          <div className="space-y-3">
            {messages.filter(m => m.category !== 'informazione_generica').map((msg, i) => {
              const priority = PRIORITY_MAP[msg.priority] || PRIORITY_MAP.media;
              return (
                <Card key={i} className={`hover:shadow-md transition ${msg.priority === 'alta' ? 'border-red-300 bg-red-50/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <Bot className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{msg.from}</span>
                          <Badge variant="outline" className="text-xs"><PawPrint className="h-3 w-3 mr-1" />{msg.petName}</Badge>
                          <Badge className={priority.cls}>{priority.label}</Badge>
                          {msg.autoAssigned && <Badge className="bg-purple-100 text-purple-700 text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto-assign</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{msg.text}</p>
                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3 mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-700">Risposta suggerita dall'AI</span>
                          </div>
                          <p className="text-sm text-gray-700">{msg.aiSuggestion}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                            <MessageCircle className="h-3 w-3 mr-1" /> Usa suggerimento
                          </Button>
                          <Button size="sm" variant="outline">Modifica</Button>
                          <Button size="sm" variant="outline">Assegna a staff</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* PRIORITY */}
        <TabsContent value="priority">
          <div className="space-y-3">
            {messages.filter(m => m.priority === 'alta').map((msg, i) => {
              const priority = PRIORITY_MAP[msg.priority];
              return (
                <Card key={i} className="border-red-300 bg-red-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{msg.from}</span>
                          <Badge variant="outline" className="text-xs"><PawPrint className="h-3 w-3 mr-1" />{msg.petName}</Badge>
                          <Badge className={priority.cls}>{priority.label}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{msg.text}</p>
                        <div className="bg-red-100 border-l-4 border-red-500 rounded-lg p-3 mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="h-4 w-4 text-red-600" />
                            <span className="text-xs font-semibold text-red-700">⚠️ Risposta urgente suggerita</span>
                          </div>
                          <p className="text-sm text-gray-700">{msg.aiSuggestion}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                            <MessageCircle className="h-3 w-3 mr-1" /> Rispondi subito
                          </Button>
                          <Button size="sm" variant="outline">Assegna veterinario</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* UNCLASSIFIED */}
        <TabsContent value="unclassified">
          <div className="space-y-3">
            {messages.filter(m => m.category === 'informazione_generica').length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Tutti i messaggi sono stati classificati! 🎉</p>
              </div>
            ) : (
              messages.filter(m => m.category === 'informazione_generica').map((msg, i) => (
                <Card key={i} className="border-gray-300">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <Info className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{msg.from}</span>
                          <Badge variant="outline" className="text-xs"><PawPrint className="h-3 w-3 mr-1" />{msg.petName}</Badge>
                          <Badge className="bg-gray-100 text-gray-600 text-xs">Da classificare</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{msg.text}</p>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                            <Sparkles className="h-3 w-3 mr-1" /> Riclassifica con AI
                          </Button>
                          <Button size="sm" variant="outline">Classifica manualmente</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
