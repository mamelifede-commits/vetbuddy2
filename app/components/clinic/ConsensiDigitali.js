'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  FileText, CheckCircle, Clock, Send, Eye, Download, Plus, Search,
  AlertCircle, PenTool, Mail, MessageCircle, User, PawPrint, Calendar, X
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

const CONSENT_TEMPLATES = [
  { id: 'chirurgia', name: 'Consenso Chirurgico', icon: '🏥', required: ['petName', 'procedure', 'risks', 'ownerName'] },
  { id: 'anestesia', name: 'Consenso Anestesia', icon: '💉', required: ['petName', 'anesthesiaType', 'complications', 'ownerName'] },
  { id: 'trattamento', name: 'Consenso Trattamento', icon: '💊', required: ['petName', 'treatment', 'duration', 'ownerName'] },
  { id: 'privacy', name: 'Privacy GDPR', icon: '🔒', required: ['ownerName', 'email'] },
  { id: 'pubblicazione', name: 'Autorizzazione Pubblicazione', icon: '📸', required: ['ownerName', 'petName', 'purpose'] },
  { id: 'passport', name: 'Condivisione Passport', icon: '🐾', required: ['ownerName', 'petName', 'sharedWith'] },
  { id: 'preventivo', name: 'Approvazione Preventivo', icon: '💰', required: ['ownerName', 'services', 'total'] },
];

export default function ConsensiDigitali({ user, onNavigate }) {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewConsent, setShowNewConsent] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    try {
      setLoading(true);
      const response = await import('@/app/lib/api').then(({ default: api }) => api.get('consents'));
      setConsents(response.consents || []);
    } catch (error) {
      console.error('Error loading consents:', error);
      setConsents([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      inviato: { label: 'Inviato', cls: 'bg-blue-100 text-blue-700', icon: <Send className="h-3 w-3" /> },
      visto: { label: 'Visto', cls: 'bg-purple-100 text-purple-700', icon: <Eye className="h-3 w-3" /> },
      firmato: { label: 'Firmato', cls: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" /> },
      scaduto: { label: 'Scaduto', cls: 'bg-red-100 text-red-700', icon: <AlertCircle className="h-3 w-3" /> },
    };
    const s = map[status] || map.inviato;
    return <Badge className={s.cls}>{s.icon} {s.label}</Badge>;
  };

  const createConsent = async () => {
    if (!formData.ownerName || !formData.ownerEmail) {
      alert('⚠️ Nome ed email del proprietario sono obbligatori');
      return;
    }
    try {
      setSaving(true);
      const api = (await import('@/app/lib/api')).default;
      await api.post('consents', {
        type: selectedTemplate?.id,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        petName: formData.petName || null,
        detail: formData.detail || '',
        notes: formData.notes || '',
        total: formData.total || null
      });
      setShowNewConsent(false);
      setSelectedTemplate(null);
      setFormData({});
      await loadConsents();
    } catch (error) {
      alert('❌ Errore nell\'invio del consenso');
    } finally {
      setSaving(false);
    }
  };

  const filteredConsents = consents.filter(c => 
    !searchQuery || 
    c.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.petName && c.petName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    totale: consents.length,
    firmati: consents.filter(c => c.status === 'firmato').length,
    pending: consents.filter(c => c.status === 'inviato' || c.status === 'visto').length,
    scaduti: consents.filter(c => c.status === 'scaduto').length,
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Clock className="h-8 w-8 animate-spin text-blue-500" /></div>;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <PenTool className="h-6 w-6 text-blue-500" /> Consensi Digitali e Firme
        </h2>
        <p className="text-gray-500 text-sm">Gestisci consensi, autorizzazioni e firme digitali</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{stats.totale}</p>
            <p className="text-xs text-blue-600">Totale consensi</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700">{stats.firmati}</p>
            <p className="text-xs text-green-600">Firmati</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
            <p className="text-xs text-amber-600">In attesa</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-700">{stats.scaduti}</p>
            <p className="text-xs text-red-600">Scaduti</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setShowNewConsent(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuovo Consenso
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

      {/* Consents List */}
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tutti ({consents.length})</TabsTrigger>
          <TabsTrigger value="pending">In attesa ({stats.pending})</TabsTrigger>
          <TabsTrigger value="signed">Firmati ({stats.firmati})</TabsTrigger>
          <TabsTrigger value="expired">Scaduti ({stats.scaduti})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-3">
            {filteredConsents.map((consent) => {
              const template = CONSENT_TEMPLATES.find(t => t.id === consent.type);
              return (
                <Card key={consent.id} className={`hover:shadow-md transition ${consent.status === 'scaduto' ? 'border-red-300 bg-red-50/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{template?.icon || '📄'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{template?.name || consent.type}</h4>
                          {getStatusBadge(consent.status)}
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{consent.ownerName}</span>
                          </div>
                          {consent.petName && (
                            <div className="flex items-center gap-2">
                              <PawPrint className="h-4 w-4 text-gray-400" />
                              <span>{consent.petName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Inviato: {new Date(consent.sentAt).toLocaleDateString('it-IT')}</span>
                          </div>
                          {consent.signedAt && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>Firmato: {new Date(consent.signedAt).toLocaleDateString('it-IT')}</span>
                            </div>
                          )}
                        </div>
                        {consent.procedure && <p className="text-xs text-gray-500 mt-1">Procedura: {consent.procedure}</p>}
                        {consent.treatment && <p className="text-xs text-gray-500 mt-1">Trattamento: {consent.treatment}</p>}
                        {consent.services && <p className="text-xs text-gray-500 mt-1">Servizi: {consent.services}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"><Eye className="h-3 w-3 mr-1" />Visualizza</Button>
                        <Button size="sm" variant="outline"><Download className="h-3 w-3 mr-1" />PDF</Button>
                        {consent.status !== 'firmato' && (
                          <Button size="sm" variant="outline"><Send className="h-3 w-3 mr-1" />Reinvia</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-3">
            {filteredConsents.filter(c => c.status === 'inviato' || c.status === 'visto').map((consent) => {
              const template = CONSENT_TEMPLATES.find(t => t.id === consent.type);
              return (
                <Card key={consent.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{template?.icon}</div>
                        <div>
                          <h4 className="font-semibold">{template?.name}</h4>
                          <p className="text-sm text-gray-600">{consent.ownerName} {consent.petName && `- ${consent.petName}`}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(consent.status)}
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                          <Send className="h-3 w-3 mr-1" />Sollecita
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="signed">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredConsents.filter(c => c.status === 'firmato').map((consent) => {
              const template = CONSENT_TEMPLATES.find(t => t.id === consent.type);
              return (
                <Card key={consent.id} className="border-green-200 bg-green-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">{template?.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{template?.name}</h4>
                        <p className="text-xs text-gray-600">{consent.ownerName}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-xs text-green-600">Firmato il {new Date(consent.signedAt).toLocaleDateString('it-IT')}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1"><Eye className="h-3 w-3 mr-1" />Visualizza</Button>
                      <Button size="sm" variant="outline" className="flex-1"><Download className="h-3 w-3 mr-1" />Scarica</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="expired">
          <div className="space-y-3">
            {filteredConsents.filter(c => c.status === 'scaduto').map((consent) => {
              const template = CONSENT_TEMPLATES.find(t => t.id === consent.type);
              return (
                <Card key={consent.id} className="border-red-300 bg-red-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                        <div>
                          <h4 className="font-semibold">{template?.name}</h4>
                          <p className="text-sm text-gray-600">{consent.ownerName} - {consent.petName}</p>
                          <p className="text-xs text-red-600">Scaduto da {Math.floor((Date.now() - new Date(consent.sentAt).getTime()) / 86400000)} giorni</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                        <Send className="h-3 w-3 mr-1" />Reinvia Nuovo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Consent Modal */}
      {showNewConsent && (
        <Dialog open={showNewConsent} onOpenChange={setShowNewConsent}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nuovo Consenso Digitale</DialogTitle>
            </DialogHeader>
            {!selectedTemplate ? (
              <div className="grid md:grid-cols-3 gap-4 py-4">
                {CONSENT_TEMPLATES.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md hover:border-blue-400 transition" onClick={() => setSelectedTemplate(template)}>
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-2">{template.icon}</div>
                      <h4 className="font-semibold text-sm">{template.name}</h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-3xl">{selectedTemplate.icon}</div>
                  <div>
                    <h4 className="font-semibold">{selectedTemplate.name}</h4>
                    <p className="text-xs text-gray-600">Compila i campi richiesti</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Proprietario *</label>
                    <Input placeholder="Nome proprietario" value={formData.ownerName || ''} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email proprietario *</label>
                    <Input type="email" placeholder="email@esempio.it" value={formData.ownerEmail || ''} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} />
                  </div>
                  {selectedTemplate.required.includes('petName') && (
                    <div>
                      <label className="text-sm font-medium">Animale *</label>
                      <Input placeholder="Nome animale" value={formData.petName || ''} onChange={(e) => setFormData({...formData, petName: e.target.value})} />
                    </div>
                  )}
                  {selectedTemplate.required.includes('procedure') && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Procedura *</label>
                      <Input placeholder="Es: Sterilizzazione" value={formData.detail || ''} onChange={(e) => setFormData({...formData, detail: e.target.value})} />
                    </div>
                  )}
                  {selectedTemplate.required.includes('anesthesiaType') && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Tipo anestesia *</label>
                      <Input placeholder="Es: Generale" value={formData.detail || ''} onChange={(e) => setFormData({...formData, detail: e.target.value})} />
                    </div>
                  )}
                  {selectedTemplate.required.includes('treatment') && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Trattamento *</label>
                      <Input placeholder="Es: Terapia antibiotica" value={formData.detail || ''} onChange={(e) => setFormData({...formData, detail: e.target.value})} />
                    </div>
                  )}
                  {selectedTemplate.required.includes('services') && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Servizi *</label>
                      <Input placeholder="Es: Pulizia dentale + Detartrasi" value={formData.detail || ''} onChange={(e) => setFormData({...formData, detail: e.target.value})} />
                    </div>
                  )}
                  {selectedTemplate.required.includes('purpose') && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Finalità *</label>
                      <Input placeholder="Es: Social media clinica" value={formData.detail || ''} onChange={(e) => setFormData({...formData, detail: e.target.value})} />
                    </div>
                  )}
                  {selectedTemplate.required.includes('sharedWith') && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Condiviso con *</label>
                      <Input placeholder="Es: Pet sitter, familiare" value={formData.detail || ''} onChange={(e) => setFormData({...formData, detail: e.target.value})} />
                    </div>
                  )}
                  {selectedTemplate.required.includes('total') && (
                    <div>
                      <label className="text-sm font-medium">Totale (€)</label>
                      <Input placeholder="Es: 280" value={formData.total || ''} onChange={(e) => setFormData({...formData, total: e.target.value})} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Note aggiuntive</label>
                  <Textarea placeholder="Aggiungi note o istruzioni specifiche..." rows={3} value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600"><strong>Invio:</strong> Il proprietario riceverà una email con link per visualizzare e firmare digitalmente il consenso da smartphone (firma elettronica semplice con nome, data e ora).</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowNewConsent(false); setSelectedTemplate(null); }}>
                Annulla
              </Button>
              {selectedTemplate && (
                <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={createConsent} disabled={saving}>
                  <Send className="h-4 w-4 mr-1" />{saving ? 'Invio...' : 'Invia Consenso'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
