'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Inbox, MessageCircle, Plus, Send } from 'lucide-react';
import api from '@/app/lib/api';
import { getPetSpeciesInfo } from '@/app/components/shared/utils';

function OwnerMessages({ messages, clinics = [], pets = [], onRefresh }) {
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState({ clinicId: '', subject: '', content: '', petId: '' });
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState(messages); // Local state for immediate updates

  // Sync local messages with props
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Group messages by conversation (clinicId + subject)
  const conversations = localMessages.reduce((acc, msg) => {
    const key = `${msg.clinicId}-${msg.subject}`;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        clinicId: msg.clinicId,
        clinicName: msg.clinicName || 'Clinica',
        subject: msg.subject,
        messages: [],
        lastMessage: msg,
        unread: 0
      };
    }
    acc[key].messages.push(msg);
    if (!msg.read && msg.from === 'clinic') acc[key].unread++;
    if (new Date(msg.createdAt) > new Date(acc[key].lastMessage.createdAt)) {
      acc[key].lastMessage = msg;
    }
    return acc;
  }, {});

  const conversationList = Object.values(conversations).sort((a, b) => 
    new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
  );

  const sendNewMessage = async () => {
    if (!newMessage.clinicId || !newMessage.subject || !newMessage.content) {
      alert('Compila tutti i campi obbligatori');
      return;
    }
    setSending(true);
    try {
      const clinic = clinics.find(c => c.id === newMessage.clinicId);
      const pet = newMessage.petId ? pets.find(p => p.id === newMessage.petId) : null;
      const newMsg = await api.post('messages', {
        clinicId: newMessage.clinicId,
        clinicName: clinic?.clinicName || clinic?.name || 'Clinica',
        subject: newMessage.subject,
        content: newMessage.content,
        from: 'owner',
        type: 'message',
        petId: pet?.id || null,
        petName: pet?.name || null
      });
      // Immediately add new message to local state for instant UI update
      if (newMsg) {
        setLocalMessages(prev => [...prev, {
          ...newMsg,
          clinicName: clinic?.clinicName || clinic?.name || 'Clinica',
          subject: newMessage.subject,
          content: newMessage.content,
          from: 'owner',
          createdAt: new Date().toISOString()
        }]);
      }
      setShowNewMessage(false);
      setNewMessage({ clinicId: '', subject: '', content: '', petId: '' });
      onRefresh?.();
    } catch (error) {
      alert('Errore nell\'invio del messaggio');
    } finally {
      setSending(false);
    }
  };

  const sendReply = async () => {
    if (!replyContent.trim() || !selectedConversation) return;
    setSending(true);
    try {
      const newMsg = await api.post('messages', {
        clinicId: selectedConversation.clinicId,
        clinicName: selectedConversation.clinicName,
        subject: selectedConversation.subject,
        content: replyContent,
        from: 'owner',
        type: 'reply',
        conversationId: selectedConversation.id
      });
      // Immediately add reply to local state for instant UI update
      if (newMsg) {
        setLocalMessages(prev => [...prev, {
          ...newMsg,
          clinicId: selectedConversation.clinicId,
          clinicName: selectedConversation.clinicName,
          subject: selectedConversation.subject,
          content: replyContent,
          from: 'owner',
          createdAt: new Date().toISOString()
        }]);
        // Also update selected conversation messages for immediate display
        setSelectedConversation(prev => ({
          ...prev,
          messages: [...prev.messages, {
            ...newMsg,
            content: replyContent,
            from: 'owner',
            createdAt: new Date().toISOString()
          }]
        }));
      }
      setReplyContent('');
      onRefresh?.();
    } catch (error) {
      alert('Errore nell\'invio della risposta');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Messaggi</h2>
          <p className="text-gray-500 text-sm">Comunicazioni con le cliniche</p>
        </div>
        <Button onClick={() => setShowNewMessage(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="h-4 w-4 mr-2" />Nuovo Messaggio
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Lista Conversazioni */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Conversazioni
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {conversationList.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Nessuna conversazione</p>
                  <p className="text-xs mt-1">Inizia scrivendo alla tua clinica!</p>
                </div>
              ) : (
                conversationList.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${
                      selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{conv.clinicName}</p>
                          {conv.unread > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">{conv.unread}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">{conv.subject}</p>
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {conv.lastMessage.content.substring(0, 50)}...
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Dettaglio Conversazione */}
        <Card className="md:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedConversation.subject}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {selectedConversation.clinicName}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[350px]">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {selectedConversation.messages
                      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                      .map(msg => (
                        <div key={msg.id} className={`flex ${msg.from === 'owner' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            msg.from === 'owner' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.from === 'owner' ? 'text-blue-100' : 'text-gray-400'}`}>
                              {new Date(msg.createdAt).toLocaleString('it-IT', { 
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <Input
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Scrivi un messaggio..."
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                    />
                    <Button onClick={sendReply} disabled={sending || !replyContent.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="h-[400px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Seleziona una conversazione</p>
                <p className="text-sm mt-1">oppure iniziane una nuova</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Dialog Nuovo Messaggio */}
      <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Messaggio</DialogTitle>
            <DialogDescription>Invia un messaggio alla tua clinica</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Clinica *</Label>
              <Select value={newMessage.clinicId} onValueChange={(v) => setNewMessage({...newMessage, clinicId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona clinica" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map(clinic => (
                    <SelectItem key={clinic.id} value={clinic.id}>{clinic.clinicName || clinic.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Animale di riferimento (opzionale)</Label>
              <Select value={newMessage.petId || 'none'} onValueChange={(v) => setNewMessage({...newMessage, petId: v === 'none' ? '' : v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona animale (opzionale)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessun animale specifico</SelectItem>
                  {pets.map(pet => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {getPetSpeciesInfo(pet.species).emoji} {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Oggetto *</Label>
              <Input 
                value={newMessage.subject}
                onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                placeholder="Es: Domanda sul mio animale"
              />
            </div>
            <div>
              <Label>Messaggio *</Label>
              <textarea 
                className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
                value={newMessage.content}
                onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                placeholder="Scrivi il tuo messaggio..."
              />
            </div>
            <Button onClick={sendNewMessage} disabled={sending} className="w-full">
              {sending ? 'Invio...' : 'Invia Messaggio'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


export default OwnerMessages;
