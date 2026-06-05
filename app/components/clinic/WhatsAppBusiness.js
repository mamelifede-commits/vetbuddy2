'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  MessageCircle, Send, CheckCheck, Check, Clock, AlertTriangle, Search,
  Filter, Eye, Edit, Zap, Phone, User, PawPrint, RefreshCw, ArrowRight,
  Inbox, FileText, Syringe, Heart, Bot, Crown, ExternalLink, Copy, X
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

const CATEGORY_MAP = {
  richiesta_appuntamento: { label: 'Appuntamento', icon: '📅', color: 'bg-blue-100 text-blue-700' },
  richiesta_documento: { label: 'Documento', icon: '📄', color: 'bg-indigo-100 text-indigo-700' },
  richiesta_referto: { label: 'Referto', icon: '🧪', color: 'bg-purple-100 text-purple-700' },
  vaccino_richiamo: { label: 'Vaccino', icon: '💉', color: 'bg-green-100 text-green-700' },
  followup_post_visita: { label: 'Follow-up', icon: '💛', color: 'bg-amber-100 text-amber-700' },
  richiesta_farmaco: { label: 'Farmaco', icon: '💊', color: 'bg-pink-100 text-pink-700' },
  informazione_generica: { label: 'Info', icon: 'ℹ️', color: 'bg-gray-100 text-gray-700' },
  possibile_urgenza: { label: 'Urgenza', icon: '🚨', color: 'bg-red-100 text-red-700' },
};

const STATUS_ICONS = { scheduled: <Clock className="h-3 w-3" />, sent: <Check className="h-3 w-3" />, delivered: <CheckCheck className="h-3 w-3" />, read: <CheckCheck className="h-3 w-3 text-blue-500" />, error: <X className="h-3 w-3 text-red-500" /> };

export default function WhatsAppBusiness({ user, onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showTemplate, setShowTemplate] = useState(null);
  const [editTemplate, setEditTemplate] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [messageLog, setMessageLog] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [msgRes, tplRes] = await Promise.all([
          fetch('/api/business-modules?module=whatsapp-messages').then(r => r.json()),
          fetch('/api/business-modules?module=whatsapp-templates').then(r => r.json()),
        ]);
        setMessages(msgRes.messages || []);
        setTemplates(tplRes.templates || []);
        // Generate demo log
        const log = (msgRes.messages || []).slice(0, 12).map((m, i) => ({
          to: m.from, template: ['confirm_appt','remind_24h','followup','vaccine_recall'][i % 4],
          status: ['read','delivered','sent','read','delivered','read','error','read','delivered','sent','read','sent'][i],
          sentAt: new Date(Date.now() - (i * 4 + 1) * 3600000).toISOString(),
        }));
        setMessageLog(log);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = messages.filter(m => {
    if (filter === 'unread' && m.status !== 'unread') return false;
    if (filter !== 'all' && filter !== 'unread' && m.category !== filter) return false;
    if (searchQ && !m.from.toLowerCase().includes(searchQ.toLowerCase()) && !m.text.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="h-8 w-8 animate-spin text-green-500" /></div>;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-green-500" /> WhatsApp Business
            <Badge className="bg-amber-500 text-white ml-2"><Crown className="h-3 w-3 mr-1" />Premium</Badge>
          </h2>
          <p className="text-gray-500 text-sm">Gestisci comunicazioni, template e automazioni WhatsApp</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={connectionStatus === 'connected' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
            {connectionStatus === 'connected' ? '✅ Connesso' : '⏳ In configurazione'}
          </Badge>
          <Button variant="outline" size="sm" className="text-green-600 border-green-300">
            <Phone className="h-4 w-4 mr-1" /> +39 388 744 1417
          </Button>
        </div>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList className="mb-4">
          <TabsTrigger value="inbox" className="flex items-center gap-1"><Inbox className="h-4 w-4" /> Inbox {unreadCount > 0 && <Badge className="bg-red-500 text-white text-xs ml-1">{unreadCount}</Badge>}</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="h-4 w-4 mr-1" /> Template</TabsTrigger>
          <TabsTrigger value="log"><Clock className="h-4 w-4 mr-1" /> Log Messaggi</TabsTrigger>
        </TabsList>

        {/* INBOX */}
        <TabsContent value="inbox">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-9" placeholder="Cerca conversazione..." value={searchQ} onChange={e => setSearchQ(e.target.value)} /></div>
            <select className="border rounded-lg px-3 py-2 text-sm bg-white" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">Tutte ({messages.length})</option>
              <option value="unread">Da leggere ({unreadCount})</option>
              {Object.entries(CATEGORY_MAP).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            {filtered.map((msg, i) => {
              const cat = CATEGORY_MAP[msg.category] || CATEGORY_MAP.informazione_generica;
              return (
                <Card key={i} className={`cursor-pointer hover:shadow-md transition ${msg.status === 'unread' ? 'border-green-300 bg-green-50/30' : ''}`} onClick={() => setSelectedMsg(msg)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{msg.from}</span>
                          <Badge variant="outline" className="text-xs"><PawPrint className="h-3 w-3 mr-1" />{msg.petName}</Badge>
                          <Badge className={`text-xs ${cat.color}`}>{cat.icon} {cat.label}</Badge>
                          {msg.priority === 'alta' && <Badge className="bg-red-500 text-white text-xs">⚡ Alta</Badge>}
                          {msg.status === 'unread' && <div className="h-2 w-2 bg-green-500 rounded-full" />}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{msg.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300 shrink-0 mt-3" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-30" /><p>Nessun messaggio trovato</p></div>}
          </div>
        </TabsContent>

        {/* TEMPLATES */}
        <TabsContent value="templates">
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map((tpl, i) => (
              <Card key={i} className={tpl.active ? 'border-green-200' : 'border-gray-200 opacity-60'}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{tpl.name}</h4>
                    <Badge variant="outline" className={tpl.active ? 'text-green-600' : 'text-gray-400'}>{tpl.active ? '✅ Attivo' : '⏸️ Disattivato'}</Badge>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 mb-3 border-l-4 border-green-500">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{tpl.text}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setShowTemplate(tpl); setEditTemplate(tpl.text); }}><Eye className="h-3 w-3 mr-1" /> Anteprima</Button>
                    <Button size="sm" variant="outline"><Edit className="h-3 w-3 mr-1" /> Modifica</Button>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white"><Send className="h-3 w-3 mr-1" /> Invia test</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* LOG */}
        <TabsContent value="log">
          <Card>
            <CardHeader><CardTitle className="text-base">Log messaggi inviati</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr><th className="text-left p-3">Destinatario</th><th className="text-left p-3">Template</th><th className="text-left p-3">Stato</th><th className="text-left p-3">Data invio</th></tr></thead>
                  <tbody>
                    {messageLog.map((log, i) => {
                      const tpl = templates.find(t => t.id === log.template);
                      return (
                        <tr key={i} className="border-t hover:bg-gray-50">
                          <td className="p-3 font-medium">{log.to}</td>
                          <td className="p-3">{tpl?.name || log.template}</td>
                          <td className="p-3">
                            <Badge variant="outline" className={`text-xs ${log.status === 'read' ? 'text-blue-600' : log.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                              {STATUS_ICONS[log.status]} <span className="ml-1">{log.status === 'read' ? 'Letto' : log.status === 'delivered' ? 'Consegnato' : log.status === 'sent' ? 'Inviato' : log.status === 'scheduled' ? 'Programmato' : 'Errore'}</span>
                            </Badge>
                          </td>
                          <td className="p-3 text-gray-500">{new Date(log.sentAt).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message Detail Dialog */}
      {selectedMsg && (
        <Dialog open={!!selectedMsg} onOpenChange={() => setSelectedMsg(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-green-500" />{selectedMsg.from}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2"><Badge variant="outline"><PawPrint className="h-3 w-3 mr-1" />{selectedMsg.petName}</Badge><Badge className={CATEGORY_MAP[selectedMsg.category]?.color}>{CATEGORY_MAP[selectedMsg.category]?.label}</Badge>{selectedMsg.priority === 'alta' && <Badge className="bg-red-500 text-white">⚡ Priorità alta</Badge>}</div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200"><p className="text-sm">{selectedMsg.text}</p><p className="text-xs text-gray-400 mt-2">{new Date(selectedMsg.timestamp).toLocaleString('it-IT')}</p></div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2"><Bot className="h-4 w-4 text-blue-500" /><span className="font-medium text-sm text-blue-700">Risposta suggerita (Reception AI)</span></div>
                <p className="text-sm text-gray-700">Buongiorno {selectedMsg.from.split(' ')[0]}! Grazie per averci contattato riguardo a {selectedMsg.petName}. {selectedMsg.category === 'richiesta_appuntamento' ? 'Verifico subito la disponibilità e le propongo gli slot liberi.' : selectedMsg.category === 'possibile_urgenza' ? 'La invito a portare subito ' + selectedMsg.petName + ' in clinica per una valutazione urgente.' : 'Le rispondo al più presto con le informazioni richieste.'}</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-500 hover:bg-green-600"><Send className="h-4 w-4 mr-1" /> Invia risposta</Button>
                <Button variant="outline" className="flex-1"><Edit className="h-4 w-4 mr-1" /> Modifica</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Template Preview Dialog */}
      {showTemplate && (
        <Dialog open={!!showTemplate} onOpenChange={() => setShowTemplate(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Anteprima: {showTemplate.name}</DialogTitle></DialogHeader>
            <div className="bg-[#e5ddd5] rounded-xl p-4">
              <div className="bg-white rounded-lg p-3 shadow-sm max-w-[80%] ml-auto">
                <p className="text-sm">{editTemplate.replace(/\{\{nome\}\}/g, 'Maria').replace(/\{\{animale\}\}/g, 'Luna').replace(/\{\{data\}\}/g, '15 giugno').replace(/\{\{ora\}\}/g, '10:00').replace(/\{\{clinica\}\}/g, user?.clinicName || 'VetBuddy Clinic').replace(/\{\{link\}\}/g, '🔗 vetbuddy.it/r/abc')}</p>
                <p className="text-xs text-gray-400 text-right mt-1">10:30 ✓✓</p>
              </div>
            </div>
            <Textarea value={editTemplate} onChange={e => setEditTemplate(e.target.value)} rows={4} className="mt-3" />
            <DialogFooter><Button variant="outline" onClick={() => setShowTemplate(null)}>Chiudi</Button><Button className="bg-green-500 hover:bg-green-600"><Send className="h-4 w-4 mr-1" /> Invia test</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
