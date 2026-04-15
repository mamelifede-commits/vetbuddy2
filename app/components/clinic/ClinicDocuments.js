'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CircleDot, ClipboardList, Download, Eye, FileText, Filter, Info, Mail, PlayCircle, Receipt, Search, Send, Trash2, Upload, Video } from 'lucide-react';
import api from '@/app/lib/api';
import DocumentUploadForm from '@/app/components/clinic/DocumentUploadForm';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

function ClinicDocuments({ documents, owners, pets, onRefresh, onNavigate }) {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [selectedClientDoc, setSelectedClientDoc] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filters, setFilters] = useState({ type: 'all', status: 'all', search: '' });
  
  const docTypes = { 
    prescrizione: { label: 'Prescrizione', color: 'bg-purple-100 text-purple-700', icon: FileText }, 
    referto: { label: 'Referto', color: 'bg-blue-100 text-blue-700', icon: ClipboardList }, 
    fattura: { label: 'Fattura', color: 'bg-emerald-100 text-emerald-700', icon: Receipt },
    istruzioni: { label: 'Istruzioni', color: 'bg-green-100 text-green-700', icon: FileText }, 
    altro: { label: 'Altro', color: 'bg-gray-100 text-gray-700', icon: FileText }, 
    foto: { label: 'Foto', color: 'bg-pink-100 text-pink-700', icon: Eye }, 
    video: { label: 'Video', color: 'bg-indigo-100 text-indigo-700', icon: PlayCircle }, 
    esame: { label: 'Esame', color: 'bg-cyan-100 text-cyan-700', icon: FileText } 
  };
  
  const statusConfig = {
    bozza: { label: 'Bozza', color: 'bg-slate-200 text-slate-700' },
    inviato: { label: 'Inviato', color: 'bg-green-100 text-green-700' },
    visualizzato: { label: 'Visualizzato', color: 'bg-blue-100 text-blue-700' },
    scaricato: { label: 'Scaricato', color: 'bg-purple-100 text-purple-700' }
  };

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    if (filters.type !== 'all' && doc.type !== filters.type) return false;
    if (filters.status !== 'all' && doc.status !== filters.status) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!doc.name?.toLowerCase().includes(search) && 
          !doc.petName?.toLowerCase().includes(search) &&
          !doc.ownerEmail?.toLowerCase().includes(search)) return false;
    }
    return true;
  });

  // Mock data for client-uploaded documents
  const [clientDocs, setClientDocs] = useState([
    { id: 'cd1', name: 'Foto_zampa_Luna.jpg', type: 'foto', petName: 'Luna', ownerName: 'Marco Rossi', ownerEmail: 'marco@email.com', createdAt: new Date().toISOString(), read: false, notes: 'La zampa sembra gonfia da ieri sera, vorrei un parere', preview: true },
    { id: 'cd2', name: 'Esame_sangue_Milo.pdf', type: 'esame', petName: 'Milo', ownerName: 'Anna Bianchi', ownerEmail: 'anna@email.com', createdAt: new Date(Date.now() - 86400000).toISOString(), read: true, notes: 'Allego esami fatti in altro laboratorio', preview: false },
    { id: 'cd3', name: 'Video_tosse_Rocky.mp4', type: 'video', petName: 'Rocky', ownerName: 'Giulia Verdi', ownerEmail: 'giulia@email.com', createdAt: new Date(Date.now() - 172800000).toISOString(), read: false, notes: 'Il cane tossisce così da 3 giorni', preview: true },
  ]);

  const markAsRead = (docId) => {
    setClientDocs(clientDocs.map(d => d.id === docId ? { ...d, read: true } : d));
  };

  const handleReply = (doc) => {
    alert(`Risposta inviata a ${doc.ownerEmail}: "${replyText}"`);
    setReplyText('');
    setSelectedClientDoc(null);
    markAsRead(doc.id);
  };
  
  const resendEmail = async (doc) => {
    if (!doc.ownerEmail) {
      alert('Email proprietario non disponibile');
      return;
    }
    try {
      await api.post('documents/send-email', { documentId: doc.id, recipientEmail: doc.ownerEmail });
      alert('✅ Email reinviata con successo!');
      onRefresh();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const downloadDoc = (doc) => {
    try {
      if (doc.content && doc.content.startsWith('data:')) {
        // Data URL - scarica direttamente
        const link = document.createElement('a');
        link.href = doc.content;
        link.download = doc.fileName || `${doc.name}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
      } else if (doc.id) {
        // Usa l'API di download per documenti salvati nel DB
        const downloadUrl = `/api/documents/download?id=${doc.id}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = doc.fileName || `${doc.name}.pdf`;
        link.target = '_blank'; // Apri in nuovo tab per evitare perdita navigazione
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
      } else {
        alert('Contenuto del documento non disponibile');
      }
    } catch (error) {
      console.error('Errore download documento:', error);
      alert('Errore durante il download. Riprova.');
    }
  };

  const deleteDoc = async (docId) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) return;
    try {
      await api.delete(`documents/${docId}`);
      onRefresh();
      setSelectedDoc(null);
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const unreadCount = clientDocs.filter(d => !d.read).length;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-2xl font-bold text-gray-800">Documenti</h2><p className="text-gray-500 text-sm">Carica PDF e inviali automaticamente via email</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => {
            try {
              const response = await fetch(`/api/documents/download-all?clinicId=${user?.id || user?.clinicId}&role=clinic`);
              if (!response.ok) throw new Error('Nessun documento da scaricare');
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url;
              a.download = `vetbuddy_Documenti_${new Date().toISOString().split('T')[0]}.zip`;
              document.body.appendChild(a); a.click();
              window.URL.revokeObjectURL(url); a.remove();
            } catch (e) { alert(e.message || 'Errore download'); }
          }}><Download className="h-4 w-4 mr-2" />Scarica tutto</Button>
          <Button className="bg-coral-500 hover:bg-coral-600" onClick={() => setShowUpload(true)}><Upload className="h-4 w-4 mr-2" />Carica documento</Button>
        </div>
      </div>
      <div className="bg-coral-50 border border-coral-200 rounded-lg p-4 mb-6"><div className="flex items-start gap-3"><FileText className="h-5 w-5 text-coral-600 mt-0.5" /><div><h4 className="font-medium text-coral-800">Come funziona</h4><p className="text-sm text-coral-700">Carichi il PDF → il proprietario lo riceve via email come allegato → lo ritrova in app nella sezione Documenti.</p></div></div></div>
      
      <Tabs defaultValue="dalla-clinica">
        <TabsList>
          <TabsTrigger value="dalla-clinica">Dalla clinica ({filteredDocs.length})</TabsTrigger>
          <TabsTrigger value="dai-clienti" className="relative">
            Caricati dai clienti
            {unreadCount > 0 && <Badge className="ml-2 bg-coral-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">{unreadCount}</Badge>}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dalla-clinica" className="mt-4">
          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Cerca per nome, animale, email..." 
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filters.type} onValueChange={(v) => setFilters({...filters, type: v})}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i tipi</SelectItem>
                    <SelectItem value="prescrizione">Prescrizione</SelectItem>
                    <SelectItem value="referto">Referto</SelectItem>
                    <SelectItem value="fattura">Fattura</SelectItem>
                    <SelectItem value="altro">Altro</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Stato" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli stati</SelectItem>
                    <SelectItem value="bozza">Bozza</SelectItem>
                    <SelectItem value="inviato">Inviato</SelectItem>
                    <SelectItem value="visualizzato">Visualizzato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filteredDocs.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-gray-500"><FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p className="font-medium">Nessun documento</p><p className="text-sm mt-2">{filters.search || filters.type !== 'all' || filters.status !== 'all' ? 'Prova a modificare i filtri' : 'Carica il tuo primo documento'}</p></CardContent></Card>
            ) : filteredDocs.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${docTypes[doc.type]?.color?.split(' ')[0] || 'bg-gray-100'}`}>
                        <FileText className={`h-6 w-6 ${docTypes[doc.type]?.color?.split(' ')[1] || 'text-gray-600'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{doc.name}</p>
                          {doc.content && <Badge variant="outline" className="text-xs">PDF</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">
                          {doc.petName || 'N/A'} • {doc.ownerEmail || 'Email N/A'} • {new Date(doc.createdAt).toLocaleDateString('it-IT')}
                        </p>
                        {doc.amount && <p className="text-xs text-gray-500 mt-0.5">Importo: €{doc.amount.toFixed(2)}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Badge className={docTypes[doc.type]?.color || docTypes.altro.color}>
                        {docTypes[doc.type]?.label || 'Altro'}
                      </Badge>
                      <Badge className={statusConfig[doc.status]?.color || statusConfig.bozza.color}>
                        {statusConfig[doc.status]?.label || 'Bozza'}
                      </Badge>
                      {doc.status !== 'bozza' && doc.lastSentAt && (
                        <span className="text-xs text-gray-400">
                          Inviato {new Date(doc.lastSentAt).toLocaleDateString('it-IT')}
                        </span>
                      )}
                      <div className="flex gap-1 ml-2">
                        {doc.ownerEmail && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); resendEmail(doc); }} title="Invia/Reinvia email">
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        {doc.content && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); downloadDoc(doc); }} title="Scarica PDF">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }} title="Anteprima">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {doc.notes && (
                    <div className="mt-3 p-2 bg-amber-50 rounded text-sm text-amber-700">
                      <strong>Note:</strong> {doc.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="dai-clienti" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Document List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    DOCUMENTI RICEVUTI ({clientDocs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {clientDocs.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Nessun documento dai clienti</p>
                      </div>
                    ) : clientDocs.map((doc) => (
                      <div 
                        key={doc.id} 
                        onClick={() => { setSelectedClientDoc(doc); markAsRead(doc.id); }}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedClientDoc?.id === doc.id ? 'bg-coral-50 border-l-4 border-l-coral-500' : ''} ${!doc.read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${doc.type === 'foto' ? 'bg-pink-100' : doc.type === 'video' ? 'bg-indigo-100' : 'bg-cyan-100'}`}>
                            {doc.type === 'foto' ? <Eye className="h-5 w-5 text-pink-600" /> : doc.type === 'video' ? <PlayCircle className="h-5 w-5 text-indigo-600" /> : <FileText className="h-5 w-5 text-cyan-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-medium text-sm truncate ${!doc.read ? 'text-blue-700' : ''}`}>{doc.petName}</p>
                              {!doc.read && <CircleDot className="h-3 w-3 text-blue-500" />}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{doc.ownerName}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(doc.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Document Detail */}
            <Card className="lg:col-span-2">
              {selectedClientDoc ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {selectedClientDoc.name}
                          <Badge className={docTypes[selectedClientDoc.type]?.color || docTypes.altro.color}>
                            {docTypes[selectedClientDoc.type]?.label || 'Altro'}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Da: {selectedClientDoc.ownerName} ({selectedClientDoc.ownerEmail})
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />Scarica
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />Anteprima
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Document Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Animale:</span>
                          <p className="font-medium">{selectedClientDoc.petName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Tipo:</span>
                          <p className="font-medium">{docTypes[selectedClientDoc.type]?.label || 'Altro'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Data:</span>
                          <p className="font-medium">{new Date(selectedClientDoc.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Stato:</span>
                          <Badge variant="outline" className={selectedClientDoc.read ? 'text-green-600 border-green-300' : 'text-blue-600 border-blue-300'}>
                            {selectedClientDoc.read ? 'Letto' : 'Non letto'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Preview Area */}
                    {selectedClientDoc.preview && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">ANTEPRIMA</h4>
                        <div className="border rounded-lg p-8 bg-gray-100 flex items-center justify-center">
                          {selectedClientDoc.type === 'foto' ? (
                            <div className="text-center">
                              <div className="h-32 w-32 bg-gray-300 rounded-lg mx-auto flex items-center justify-center">
                                <Eye className="h-12 w-12 text-gray-500" />
                              </div>
                              <p className="text-sm text-gray-500 mt-2">Clicca "Anteprima" per visualizzare</p>
                            </div>
                          ) : selectedClientDoc.type === 'video' ? (
                            <div className="text-center">
                              <div className="h-32 w-48 bg-gray-800 rounded-lg mx-auto flex items-center justify-center">
                                <PlayCircle className="h-12 w-12 text-white" />
                              </div>
                              <p className="text-sm text-gray-500 mt-2">Clicca per riprodurre il video</p>
                            </div>
                          ) : (
                            <FileText className="h-16 w-16 text-gray-400" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Client Notes */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">NOTE DEL PROPRIETARIO</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-700">{selectedClientDoc.notes}</p>
                      </div>
                    </div>

                    {/* Reply Section */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">RISPONDI</h4>
                      <div className="space-y-3">
                        <Textarea 
                          placeholder="Scrivi una risposta al proprietario..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">La risposta verrà inviata via email a {selectedClientDoc.ownerEmail}</p>
                          <Button 
                            className="bg-coral-500 hover:bg-coral-600"
                            disabled={!replyText.trim()}
                            onClick={() => handleReply(selectedClientDoc)}
                          >
                            <Send className="h-4 w-4 mr-2" />Invia risposta
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-[500px] text-gray-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">Seleziona un documento</p>
                    <p className="text-sm mt-1">Clicca su un documento per vedere i dettagli</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showUpload} onOpenChange={setShowUpload}><DialogContent className="max-w-lg"><DocumentUploadForm owners={owners} pets={pets} onSuccess={() => { setShowUpload(false); onRefresh(); }} /></DialogContent></Dialog>
      
      {/* Document Detail Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${docTypes[selectedDoc?.type]?.color?.split(' ')[0] || 'bg-gray-100'}`}>
                <FileText className={`h-5 w-5 ${docTypes[selectedDoc?.type]?.color?.split(' ')[1] || 'text-gray-600'}`} />
              </div>
              {selectedDoc?.name}
            </DialogTitle>
            <DialogDescription>Dettagli documento</DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Tipo</p>
                  <Badge className={docTypes[selectedDoc.type]?.color || 'bg-gray-100 text-gray-700'}>
                    {docTypes[selectedDoc.type]?.label || 'Altro'}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Stato</p>
                  <Badge className={statusConfig[selectedDoc.status || 'bozza']?.color || 'bg-gray-100 text-gray-600'}>
                    {statusConfig[selectedDoc.status || 'bozza']?.label || 'Bozza'}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Animale</p>
                  <p className="font-medium">{selectedDoc.petName || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Proprietario</p>
                  <p className="font-medium">{selectedDoc.ownerEmail || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Creato il</p>
                  <p className="font-medium">{new Date(selectedDoc.createdAt).toLocaleString('it-IT')}</p>
                </div>
                {selectedDoc.lastSentAt && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Ultimo invio</p>
                    <p className="font-medium">{new Date(selectedDoc.lastSentAt).toLocaleString('it-IT')}</p>
                  </div>
                )}
              </div>
              
              {selectedDoc.notes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-600 mb-1">Note</p>
                  <p className="text-sm text-amber-800">{selectedDoc.notes}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                {selectedDoc.content && (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => { setPreviewDoc(selectedDoc); setSelectedDoc(null); }}>
                      <Eye className="h-4 w-4 mr-2" />Anteprima
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => downloadDoc(selectedDoc)}>
                      <Download className="h-4 w-4 mr-2" />Scarica
                    </Button>
                  </>
                )}
                {selectedDoc.ownerEmail && (
                  <Button className="flex-1 bg-coral-500 hover:bg-coral-600" onClick={() => { resendEmail(selectedDoc); setSelectedDoc(null); }}>
                    <Mail className="h-4 w-4 mr-2" />Invia Email
                  </Button>
                )}
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => deleteDoc(selectedDoc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Anteprima: {previewDoc?.name}</DialogTitle>
          </DialogHeader>
          {previewDoc?.content ? (
            <div className="flex-1 h-full min-h-[500px]">
              <iframe 
                src={previewDoc.content} 
                className="w-full h-full rounded-lg border"
                title="Anteprima documento"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Anteprima non disponibile</p>
                <p className="text-sm mt-1">Il documento non ha un contenuto visualizzabile</p>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            {previewDoc?.content && (
              <Button variant="outline" onClick={() => downloadDoc(previewDoc)}>
                <Download className="h-4 w-4 mr-2" />Scarica PDF
              </Button>
            )}
            <Button variant="outline" onClick={() => setPreviewDoc(null)}>Chiudi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple components for other sections

export default ClinicDocuments;
