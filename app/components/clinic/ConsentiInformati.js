'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Search, Filter, Download, Check, Clock, AlertCircle, Edit, FileSignature } from 'lucide-react';
import api from '@/app/lib/api';

export default function ConsentiInformati({ user }) {
  const [consents, setConsents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [signature, setSignature] = useState('');

  const consentTemplates = [
    { id: 'chirurgia', name: 'Consenso Chirurgico', desc: 'Per interventi chirurgici in anestesia generale' },
    { id: 'anestesia', name: 'Consenso Anestesia', desc: 'Informativa rischi anestesiologici' },
    { id: 'eutanasia', name: 'Consenso Eutanasia', desc: 'Richiesta eutanasia compassionevole' },
    { id: 'radiografie', name: 'Consenso Radiografie', desc: 'Esami radiografici e diagnostici' },
    { id: 'trattamenti', name: 'Consenso Trattamenti', desc: 'Trattamenti medici e terapie' },
    { id: 'ricovero', name: 'Consenso Ricovero', desc: 'Degenza e ricovero ospedaliero' },
    { id: 'privacy', name: 'Consenso Privacy GDPR', desc: 'Trattamento dati personali' },
  ];

  const [newConsent, setNewConsent] = useState({
    petId: '',
    ownerId: '',
    templateType: '',
    description: '',
    notes: '',
  });

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    try {
      setLoading(true);
      const response = await api.get('consents');
      setConsents(response.data || []);
    } catch (error) {
      console.error('Error loading consents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConsent = async () => {
    try {
      await api.post('consents', {
        ...newConsent,
        clinicId: user.clinicId,
        createdBy: user.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setShowCreateModal(false);
      setNewConsent({ petId: '', ownerId: '', templateType: '', description: '', notes: '' });
      loadConsents();
    } catch (error) {
      console.error('Error creating consent:', error);
    }
  };

  const handleSignConsent = async () => {
    try {
      await api.put(`consents/${selectedConsent.id}`, {
        status: 'signed',
        signature,
        signedAt: new Date().toISOString(),
      });
      setShowSignModal(false);
      setSignature('');
      setSelectedConsent(null);
      loadConsents();
    } catch (error) {
      console.error('Error signing consent:', error);
    }
  };

  const filteredConsents = consents.filter(c => {
    const matchesSearch = c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.templateType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'In Attesa' },
      signed: { color: 'bg-green-100 text-green-700', icon: Check, label: 'Firmato' },
      expired: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Scaduto' },
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    return <Badge className={variant.color}><Icon className="h-3 w-3 mr-1" />{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileSignature className="h-6 w-6 text-blue-600" />
            Consensi Informati Digitali
          </h2>
          <p className="text-sm text-gray-500">Gestisci consensi con firma digitale conforme GDPR</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600">
          <Plus className="h-4 w-4 mr-2" />Nuovo Consenso
        </Button>
      </div>

      {/* Filtri */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cerca per animale, proprietario o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="pending">In Attesa</SelectItem>
            <SelectItem value="signed">Firmati</SelectItem>
            <SelectItem value="expired">Scaduti</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{consents.length}</div>
            <p className="text-xs text-gray-500">Consensi Totali</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{consents.filter(c => c.status === 'pending').length}</div>
            <p className="text-xs text-gray-500">In Attesa Firma</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{consents.filter(c => c.status === 'signed').length}</div>
            <p className="text-xs text-gray-500">Firmati</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{consentTemplates.length}</div>
            <p className="text-xs text-gray-500">Template Disponibili</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista Consensi */}
      <div className="grid gap-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Caricamento...</div>
        ) : filteredConsents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nessun consenso trovato</p>
            </CardContent>
          </Card>
        ) : (
          filteredConsents.map(consent => (
            <Card key={consent.id} className="hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileSignature className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{consent.description}</h4>
                        {getStatusBadge(consent.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{consent.templateType}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Creato: {new Date(consent.createdAt).toLocaleDateString('it-IT')}</span>
                        {consent.signedAt && <span>Firmato: {new Date(consent.signedAt).toLocaleDateString('it-IT')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {consent.status === 'pending' && (
                      <Button size="sm" onClick={() => { setSelectedConsent(consent); setShowSignModal(true); }}>
                        <FileSignature className="h-4 w-4 mr-1" />Firma
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Creazione Consenso */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuovo Consenso Informato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo di Consenso</Label>
              <Select value={newConsent.templateType} onValueChange={(v) => setNewConsent({...newConsent, templateType: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona template..." />
                </SelectTrigger>
                <SelectContent>
                  {consentTemplates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrizione</Label>
              <Input
                value={newConsent.description}
                onChange={(e) => setNewConsent({...newConsent, description: e.target.value})}
                placeholder="Es: Consenso chirurgia sterilizzazione"
              />
            </div>
            <div>
              <Label>Note Aggiuntive</Label>
              <Textarea
                value={newConsent.notes}
                onChange={(e) => setNewConsent({...newConsent, notes: e.target.value})}
                placeholder="Note specifiche per questo consenso..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Annulla</Button>
              <Button onClick={handleCreateConsent}>Crea Consenso</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Firma */}
      <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Firma Digitale Consenso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Il proprietario deve firmare digitalmente il consenso</p>
            <div>
              <Label>Firma (Nome e Cognome)</Label>
              <Input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Mario Rossi"
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              ⚠️ La firma digitale ha valore legale. Assicurarsi che il proprietario sia presente.
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSignModal(false)}>Annulla</Button>
              <Button onClick={handleSignConsent} disabled={!signature}>Conferma Firma</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
