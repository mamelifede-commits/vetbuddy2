'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ClipboardList, CheckCircle, Clock, Send, Eye, AlertTriangle, Plus, Search,
  PawPrint, User, Calendar, FileText, Edit3, Image, Video, Shield, Info
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';
import api from '@/app/lib/api';

const QUESTIONNAIRE_TYPES = [
  { id: 'generale', name: 'Visita Generale', icon: '🏥', color: 'blue' },
  { id: 'vaccino', name: 'Vaccino', icon: '💉', color: 'green' },
  { id: 'dermatologia', name: 'Dermatologia', icon: '🔬', color: 'purple' },
  { id: 'postoperatorio', name: 'Controllo Post-Operatorio', icon: '🩹', color: 'orange' },
  { id: 'gastrointestinale', name: 'Problema Gastrointestinale', icon: '🍽️', color: 'red' },
  { id: 'comportamento', name: 'Comportamento', icon: '🐕', color: 'indigo' },
  { id: 'senior', name: 'Senior Check-up', icon: '👴', color: 'amber' },
];

export default function QuestionariPreVisita({ user, onNavigate }) {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newForm, setNewForm] = useState({ ownerName: '', ownerEmail: '', petName: '', appointmentDate: '' });
  const [detailQ, setDetailQ] = useState(null);
  const [detailMedia, setDetailMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const loadQuestionnaires = async () => {
    try {
      setLoading(true);
      const response = await api.get('previsit');
      setQuestionnaires(response.questionnaires || []);
    } catch (error) {
      console.error('Error loading questionnaires:', error);
      setQuestionnaires([]);
    } finally {
      setLoading(false);
    }
  };

  const sendQuestionnaire = async () => {
    if (!newForm.ownerName || !newForm.ownerEmail) {
      alert('⚠️ Nome ed email del proprietario sono obbligatori');
      return;
    }
    try {
      setSaving(true);
      await api.post('previsit', {
        ownerName: newForm.ownerName,
        ownerEmail: newForm.ownerEmail,
        petName: newForm.petName,
        appointmentDate: newForm.appointmentDate || null,
        type: selectedType?.id || 'generale'
      });
      setShowNew(false);
      setNewForm({ ownerName: '', ownerEmail: '', petName: '', appointmentDate: '' });
      setSelectedType(null);
      await loadQuestionnaires();
    } catch (error) {
      alert('❌ Errore nell\'invio del questionario');
    } finally {
      setSaving(false);
    }
  };

  const markReviewed = async (q) => {
    try {
      await api.put('previsit', { id: q.id, status: 'compilato' });
      setDetailQ(null);
      await loadQuestionnaires();
    } catch (error) {
      alert('❌ Errore nell\'aggiornamento');
    }
  };

  const openDetail = async (q) => {
    setDetailQ(q);
    setDetailMedia([]);
    if (q.mediaCount > 0) {
      try {
        setMediaLoading(true);
        const res = await api.get(`previsit/upload?formId=${q.id}`);
        setDetailMedia(res.media || []);
      } catch (e) {
        setDetailMedia([]);
      } finally {
        setMediaLoading(false);
      }
    }
  };

  const openMedia = async (m) => {
    try {
      const token = localStorage.getItem('vetbuddy_token');
      const res = await fetch(`/api/previsit/upload?mediaId=${m.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Errore nell\'apertura dell\'allegato');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      alert(e.message);
    }
  };

  const formatSize = (bytes) => bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.ceil((bytes || 0) / 1024)} KB`;

  const getStatusBadge = (status) => {
    const map = {
      non_inviato: { label: 'Non inviato', cls: 'bg-gray-100 text-gray-700', icon: <Clock className="h-3 w-3" /> },
      inviato: { label: 'Inviato', cls: 'bg-blue-100 text-blue-700', icon: <Send className="h-3 w-3" /> },
      compilato: { label: 'Compilato', cls: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" /> },
      da_revisionare: { label: 'Da revisionare', cls: 'bg-amber-100 text-amber-700', icon: <Eye className="h-3 w-3" /> },
    };
    const s = map[status] || map.non_inviato;
    return <Badge className={s.cls}>{s.icon} {s.label}</Badge>;
  };

  const filtered = questionnaires.filter(q => 
    !searchQuery || 
    q.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.petName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totale: questionnaires.length,
    compilati: questionnaires.filter(q => q.status === 'compilato').length,
    pending: questionnaires.filter(q => q.status === 'inviato').length,
    review: questionnaires.filter(q => q.status === 'da_revisionare').length,
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Clock className="h-8 w-8 animate-spin text-blue-500" /></div>;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-purple-500" /> Questionari Pre-Visita
        </h2>
        <p className="text-gray-500 text-sm">Raccogli informazioni prima dell'appuntamento per preparare meglio la visita</p>
      </div>

      {/* Disclaimer */}
      <Alert className="mb-6 bg-amber-50 border-amber-300">
        <Shield className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          <strong>Disclaimer:</strong> Il questionario non fornisce diagnosi. Serve solo a raccogliere informazioni utili prima della visita.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <ClipboardList className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-700">{stats.totale}</p>
            <p className="text-xs text-purple-600">Totale questionari</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700">{stats.compilati}</p>
            <p className="text-xs text-green-600">Compilati</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Send className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{stats.pending}</p>
            <p className="text-xs text-blue-600">In attesa</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-700">{stats.review}</p>
            <p className="text-xs text-amber-600">Da revisionare</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-1" /> Invia Questionario
        </Button>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cerca per proprietario o animale..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Questionnaires List */}
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tutti ({questionnaires.length})</TabsTrigger>
          <TabsTrigger value="review">Da revisionare ({stats.review})</TabsTrigger>
          <TabsTrigger value="pending">In attesa ({stats.pending})</TabsTrigger>
          <TabsTrigger value="completed">Compilati ({stats.compilati})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-3">
            {filtered.map((q) => {
              const type = QUESTIONNAIRE_TYPES.find(t => t.id === q.type);
              return (
                <Card key={q.id} className={`hover:shadow-md transition ${q.status === 'da_revisionare' ? 'border-amber-300 bg-amber-50/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{type?.icon || '📋'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{type?.name}</h4>
                          {getStatusBadge(q.status)}
                          {q.urgency === 'Alta' && <Badge className="bg-red-500 text-white"><AlertTriangle className="h-3 w-3 mr-1" />Urgente</Badge>}
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{q.ownerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PawPrint className="h-4 w-4 text-gray-400" />
                            <span>{q.petName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Appuntamento: {new Date(q.appointmentDate).toLocaleDateString('it-IT')}</span>
                          </div>
                          {q.completedAt && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>Compilato: {new Date(q.completedAt).toLocaleDateString('it-IT')}</span>
                            </div>
                          )}
                        </div>
                        {q.reason && <p className="text-sm text-gray-700 mb-1"><strong>Motivo:</strong> {q.reason}</p>}
                        {q.symptoms && <p className="text-sm text-gray-600 mb-1"><strong>Sintomi:</strong> {q.symptoms}</p>}
                        {q.duration && <p className="text-xs text-gray-500">Durata: {q.duration}</p>}
                      </div>
                      <div className="flex gap-2">
                        {q.status === 'compilato' || q.status === 'da_revisionare' ? (
                          <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
                            <Eye className="h-3 w-3 mr-1" />Visualizza Risposte
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Send className="h-3 w-3 mr-1" />Reinvia
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="review">
          <div className="space-y-3">
            {filtered.filter(q => q.status === 'da_revisionare').map((q) => {
              const type = QUESTIONNAIRE_TYPES.find(t => t.id === q.type);
              return (
                <Card key={q.id} className="border-amber-300 bg-amber-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                          <Eye className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{type?.name}</h4>
                          <p className="text-sm text-gray-600">{q.ownerName} - {q.petName}</p>
                          <p className="text-xs text-gray-500">Compilato {Math.floor((Date.now() - new Date(q.completedAt).getTime()) / 3600000)}h fa</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {q.urgency === 'Alta' && <Badge className="bg-red-500 text-white">Urgente</Badge>}
                        {q.mediaCount > 0 && <Badge className="bg-purple-100 text-purple-700">📎 {q.mediaCount}</Badge>}
                        <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => openDetail(q)}>
                          <Eye className="h-4 w-4 mr-1" />Rivedi Prima della Visita
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.filter(q => q.status === 'inviato').map((q) => {
              const type = QUESTIONNAIRE_TYPES.find(t => t.id === q.type);
              return (
                <Card key={q.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">{type?.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{type?.name}</h4>
                        <p className="text-xs text-gray-600">{q.ownerName} - {q.petName}</p>
                      </div>
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Inviato {Math.floor((Date.now() - new Date(q.sentAt).getTime()) / 3600000)}h fa</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Send className="h-3 w-3 mr-1" />Sollecita Compilazione
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.filter(q => q.status === 'compilato').map((q) => {
              const type = QUESTIONNAIRE_TYPES.find(t => t.id === q.type);
              return (
                <Card key={q.id} className="border-green-200 bg-green-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">{type?.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{type?.name}</h4>
                        <p className="text-xs text-gray-600">{q.ownerName} - {q.petName}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-xs text-green-600 mb-2">✓ Compilato il {new Date(q.completedAt).toLocaleDateString('it-IT')} {q.mediaCount > 0 ? `• 📎 ${q.mediaCount} allegati` : ''}</p>
                    <Button size="sm" className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={() => openDetail(q)}>
                      <Eye className="h-3 w-3 mr-1" />Visualizza Dettagli
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      {detailQ && (
        <Dialog open={!!detailQ} onOpenChange={(o) => !o && setDetailQ(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-purple-500" />
                Questionario: {detailQ.petName || 'paziente'} ({detailQ.ownerName})
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(detailQ.status)}
                {detailQ.urgency && (
                  <Badge className={detailQ.urgency === 'Alta' ? 'bg-red-500 text-white' : detailQ.urgency === 'Media' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}>
                    Urgenza percepita: {detailQ.urgency}
                  </Badge>
                )}
                {detailQ.appointmentDate && <Badge variant="outline">📅 {detailQ.appointmentDate}</Badge>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4">
                {[
                  ['Motivo della visita', detailQ.reason],
                  ['Sintomi', detailQ.symptoms],
                  ['Da quando', detailQ.duration],
                  ['Farmaci assunti', detailQ.medications],
                  ['Patologie note', detailQ.conditions],
                  ['Allergie', detailQ.allergies],
                  ['Alimentazione', detailQ.diet],
                  ['Comportamento', detailQ.behavior],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-medium text-gray-800">{value || '—'}</p>
                  </div>
                ))}
              </div>
              {detailQ.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-500 mb-1">Note del proprietario</p>
                  <p className="text-blue-900 whitespace-pre-wrap">{detailQ.notes}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-2">📎 Allegati ({detailQ.mediaCount || 0})</p>
                {mediaLoading ? (
                  <p className="text-gray-400 text-sm">Caricamento allegati...</p>
                ) : detailMedia.length > 0 ? (
                  <div className="space-y-2">
                    {detailMedia.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => openMedia(m)}
                        className="w-full flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 hover:bg-purple-100 transition text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {m.mimeType?.startsWith('video/') ? <Video className="h-4 w-4 text-purple-500 shrink-0" /> : <Image className="h-4 w-4 text-purple-500 shrink-0" />}
                          <span className="truncate text-gray-700">{m.fileName}</span>
                          <span className="text-xs text-gray-400 shrink-0">{formatSize(m.size)}</span>
                        </div>
                        <Eye className="h-4 w-4 text-purple-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Nessun allegato</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailQ(null)}>Chiudi</Button>
              {detailQ.status === 'da_revisionare' && (
                <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => markReviewed(detailQ)}>
                  <CheckCircle className="h-4 w-4 mr-1" />Segna come Revisionato
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Questionnaire Modal */}
      {showNew && (
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Invia Questionario Pre-Visita</DialogTitle>
            </DialogHeader>
            {!selectedType ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">Seleziona il tipo di questionario da inviare al proprietario:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {QUESTIONNAIRE_TYPES.map((type) => (
                    <Card key={type.id} className="cursor-pointer hover:shadow-md hover:border-purple-400 transition" onClick={() => setSelectedType(type)}>
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2">{type.icon}</div>
                        <h4 className="font-semibold text-sm">{type.name}</h4>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="text-3xl">{selectedType.icon}</div>
                  <div>
                    <h4 className="font-semibold">{selectedType.name}</h4>
                    <p className="text-xs text-gray-600">Verrà inviato al proprietario prima dell'appuntamento</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Proprietario *</label>
                    <Input placeholder="Nome del proprietario" value={newForm.ownerName} onChange={(e) => setNewForm({...newForm, ownerName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email proprietario *</label>
                    <Input type="email" placeholder="email@esempio.it" value={newForm.ownerEmail} onChange={(e) => setNewForm({...newForm, ownerEmail: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Animale</label>
                    <Input placeholder="Nome dell'animale" value={newForm.petName} onChange={(e) => setNewForm({...newForm, petName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data Appuntamento</label>
                    <Input type="date" value={newForm.appointmentDate} onChange={(e) => setNewForm({...newForm, appointmentDate: e.target.value})} />
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-700">
                    <Info className="h-4 w-4 inline mr-1" />
                    Il proprietario riceverà subito un'email con il link per compilare il questionario da smartphone. I nuovi appuntamenti ricevono il modulo automaticamente.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowNew(false); setSelectedType(null); }}>
                Annulla
              </Button>
              {selectedType && (
                <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={sendQuestionnaire} disabled={saving}>
                  <Send className="h-4 w-4 mr-1" />{saving ? 'Invio...' : 'Invia Ora'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
