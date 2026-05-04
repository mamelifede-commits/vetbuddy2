'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import BackToDashboard from '@/app/components/shared/BackToDashboard';
import {
  Inbox, Filter, UserCheck, CheckCircle, Ticket, AlertCircle,
  Clock, Send, Reply, Tag, ChevronDown, Loader2, FileText,
  ArrowUpCircle, ArrowRightCircle, ArrowDownCircle, MessageCircle
} from 'lucide-react';
import api from '@/app/lib/api';

const STATUS_CONFIG = {
  nuovo: { label: 'Nuovo', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  in_lavorazione: { label: 'In lavorazione', color: 'bg-amber-100 text-amber-700', icon: Clock },
  risolto: { label: 'Risolto', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

const PRIORITY_CONFIG = {
  alta: { label: 'Alta', color: 'bg-red-100 text-red-700', icon: ArrowUpCircle },
  media: { label: 'Media', color: 'bg-amber-100 text-amber-700', icon: ArrowRightCircle },
  bassa: { label: 'Bassa', color: 'bg-gray-100 text-gray-600', icon: ArrowDownCircle },
};

// Predefined reply templates for quick responses
const REPLY_TEMPLATES = [
  { id: 1, name: 'Conferma ricezione', text: 'Gentile cliente, confermiamo la ricezione del suo messaggio. La ricontatteremo al più presto.' },
  { id: 2, name: 'Appuntamento confermato', text: 'Il suo appuntamento è confermato. La aspettiamo in clinica. Per qualsiasi necessità non esiti a contattarci.' },
  { id: 3, name: 'Richiesta info', text: 'La ringraziamo per il messaggio. Per poterla assistere al meglio, potrebbe fornirci maggiori dettagli?' },
  { id: 4, name: 'Risultati pronti', text: 'Le comunichiamo che i risultati degli esami sono pronti. Può consultarli nella sezione Documenti dell\'app oppure passare in clinica.' },
  { id: 5, name: 'Chiusura ticket', text: 'Il suo ticket è stato risolto. Se ha altre domande non esiti a scriverci. Buona giornata!' },
];

function ClinicInbox({ messages = [], owners = [], pets = [], staff = [], onRefresh, onNavigate, user }) {
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState(messages);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const filteredMessages = localMessages.filter(m => {
    if (filter === 'unread' && m.read) return false;
    if (filter === 'assigned' && !m.assignedTo) return false;
    if (statusFilter !== 'all') {
      const msgStatus = (m.status && STATUS_CONFIG[m.status]) ? m.status : 'nuovo';
      if (msgStatus !== statusFilter) return false;
    }
    if (priorityFilter !== 'all' && (m.priority || 'media') !== priorityFilter) return false;
    return true;
  });

  const handleAssign = async (msg) => {
    try {
      const result = await api.put(`messages/${msg.id}/assign`, { assignedTo: user?.name || user?.clinicName || 'Staff' });
      setLocalMessages(prev => prev.map(m => m.id === msg.id ? { ...m, assignedTo: result.assignedTo || user?.name, status: 'in_lavorazione' } : m));
      setSelectedMsg(prev => prev?.id === msg.id ? { ...prev, assignedTo: result.assignedTo || user?.name, status: 'in_lavorazione' } : prev);
    } catch (err) {
      console.error('Assign error:', err);
    }
  };

  const handleChangeStatus = async (msg, newStatus) => {
    try {
      await api.put(`messages/${msg.id}/status`, { status: newStatus });
      setLocalMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: newStatus } : m));
      setSelectedMsg(prev => prev?.id === msg.id ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      console.error('Status error:', err);
    }
  };

  const handleChangePriority = async (msg, newPriority) => {
    try {
      await api.put(`messages/${msg.id}/priority`, { priority: newPriority });
      setLocalMessages(prev => prev.map(m => m.id === msg.id ? { ...m, priority: newPriority } : m));
      setSelectedMsg(prev => prev?.id === msg.id ? { ...prev, priority: newPriority } : prev);
    } catch (err) {
      console.error('Priority error:', err);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedMsg) return;
    setSending(true);
    try {
      await api.post('messages/reply', {
        originalMessageId: selectedMsg.id,
        content: replyText,
        receiverId: selectedMsg.senderId
      });
      setReplyText('');
      setShowReplyDialog(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Reply error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleUseTemplate = (template) => {
    setReplyText(template.text);
  };

  const handleSelectMsg = async (msg) => {
    setSelectedMsg(msg);
    // Mark as read if unread
    if (!msg.read) {
      try {
        await api.put(`messages/${msg.id}`, { read: true });
        setLocalMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
      } catch (err) {
        // silent
      }
    }
  };

  const getOwnerName = (msg) => {
    if (msg.senderName) return msg.senderName;
    const owner = owners.find(o => o.id === msg.senderId);
    return owner?.name || 'Proprietario';
  };

  const getPetInfo = (msg) => {
    if (msg.petName) return msg.petName;
    if (msg.petId) {
      const pet = pets.find(p => p.id === msg.petId);
      return pet?.name || '';
    }
    return '';
  };

  const statusCounts = {
    nuovo: localMessages.filter(m => !m.status || m.status === 'nuovo' || !STATUS_CONFIG[m.status]).length,
    in_lavorazione: localMessages.filter(m => m.status === 'in_lavorazione').length,
    risolto: localMessages.filter(m => m.status === 'risolto').length,
  };

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Inbox className="h-6 w-6 text-coral-500" /> Team Inbox
          </h2>
          <p className="text-gray-500 text-sm">Gestisci messaggi, ticket e richieste dei proprietari</p>
        </div>
      </div>

      {/* Status summary pills */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => { setStatusFilter('all'); setFilter('all'); }} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${statusFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Tutti ({localMessages.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
          <button key={key} onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 ${statusFilter === key ? conf.color + ' ring-2 ring-offset-1' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <conf.icon className="h-3 w-3" /> {conf.label} ({statusCounts[key]})
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 mb-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[130px] text-xs h-8">
            <Filter className="h-3 w-3 mr-1" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="unread">Non letti</SelectItem>
            <SelectItem value="assigned">Assegnati</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[130px] text-xs h-8">
            <Tag className="h-3 w-3 mr-1" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte priorità</SelectItem>
            <SelectItem value="alta">🔴 Alta</SelectItem>
            <SelectItem value="media">🟡 Media</SelectItem>
            <SelectItem value="bassa">⚪ Bassa</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-400 ml-auto">{filteredMessages.length} ticket</span>
      </div>

      {/* Main layout */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Ticket list */}
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <ScrollArea className="h-[550px]">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Inbox className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">Nessun messaggio</p>
                  <p className="text-xs text-gray-400 mt-1">Prova a modificare i filtri</p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const status = msg.status || 'nuovo';
                  const priority = msg.priority || 'media';
                  const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG['nuovo'];
                  const priorityConf = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG['media'];
                  
                  return (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectMsg(msg)}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${
                        selectedMsg?.id === msg.id ? 'bg-coral-50 border-l-4 border-l-coral-500' : ''
                      } ${!msg.read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {!msg.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>}
                            <p className={`font-medium text-sm truncate ${!msg.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {msg.subject || 'Nuovo messaggio'}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{getOwnerName(msg)}{getPetInfo(msg) ? ` • ${getPetInfo(msg)}` : ''}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{msg.content?.substring(0, 50)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</span>
                          <div className="flex items-center gap-1">
                            {priority === 'alta' && <ArrowUpCircle className="h-3 w-3 text-red-500" />}
                            <Badge className={`text-xs px-1.5 py-0 ${statusConf.color}`}>{statusConf.label}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message detail */}
        <Card className="lg:col-span-2">
          {selectedMsg ? (
            <>
              <CardHeader className="border-b pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedMsg.subject || 'Messaggio'}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      Da: <span className="font-medium text-gray-700">{getOwnerName(selectedMsg)}</span>
                      {getPetInfo(selectedMsg) && <Badge variant="outline" className="text-xs">🐾 {getPetInfo(selectedMsg)}</Badge>}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {(!selectedMsg.assignedTo) && (
                      <Button size="sm" variant="outline" onClick={() => handleAssign(selectedMsg)} className="text-xs">
                        <UserCheck className="h-3.5 w-3.5 mr-1" />Prendi in carico
                      </Button>
                    )}
                    <Button size="sm" className="bg-coral-500 hover:bg-coral-600 text-white text-xs" onClick={() => setShowReplyDialog(true)}>
                      <Reply className="h-3.5 w-3.5 mr-1" />Rispondi
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {/* Meta info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 block mb-1">Stato</span>
                      <Select value={STATUS_CONFIG[selectedMsg.status] ? selectedMsg.status : 'nuovo'} onValueChange={(v) => handleChangeStatus(selectedMsg, v)}>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nuovo">🔵 Nuovo</SelectItem>
                          <SelectItem value="in_lavorazione">🟡 In lavorazione</SelectItem>
                          <SelectItem value="risolto">🟢 Risolto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Priorità</span>
                      <Select value={selectedMsg.priority || 'media'} onValueChange={(v) => handleChangePriority(selectedMsg, v)}>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">🔴 Alta</SelectItem>
                          <SelectItem value="media">🟡 Media</SelectItem>
                          <SelectItem value="bassa">⚪ Bassa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Assegnato</span>
                      <p className="font-medium text-gray-700">{selectedMsg.assignedTo || '—'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Ricevuto</span>
                      <p className="font-medium text-gray-700">{new Date(selectedMsg.createdAt).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>

                {/* Message content */}
                <div className="prose prose-sm max-w-none bg-white rounded-lg border p-4 mb-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedMsg.content}</p>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  {(selectedMsg.status || 'nuovo') !== 'risolto' && (
                    <Button size="sm" variant="outline" className="text-xs text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleChangeStatus(selectedMsg, 'risolto')}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />Segna come risolto
                    </Button>
                  )}
                  {(selectedMsg.status || 'nuovo') === 'risolto' && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handleChangeStatus(selectedMsg, 'nuovo')}>
                      Riapri ticket
                    </Button>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[550px] text-gray-500">
              <div className="text-center">
                <Ticket className="h-14 w-14 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Seleziona un ticket</p>
                <p className="text-xs text-gray-400 mt-1">Clicca su un messaggio per vederne i dettagli</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Reply className="h-5 w-5 text-coral-500" />
              Rispondi a: {selectedMsg?.subject || 'Messaggio'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Template quick select */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Template rapidi:</p>
              <div className="flex flex-wrap gap-1.5">
                {REPLY_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => handleUseTemplate(t)} className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-coral-100 hover:text-coral-700 text-xs text-gray-600 transition">
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply text */}
            <div>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Scrivi la tua risposta..."
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReplyDialog(false)}>Annulla</Button>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={handleReply} disabled={!replyText.trim() || sending}>
                {sending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                Invia Risposta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClinicInbox;
