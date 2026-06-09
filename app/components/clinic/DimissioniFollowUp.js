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
  CheckCircle, Clock, FileText, Send, Calendar, Phone, AlertCircle, 
  Heart, Pill, Home, Info, Download, Eye, Plus, RefreshCw, User
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

export default function DimissioniFollowUp({ user, onNavigate, pets = [], owners = [] }) {
  const [discharges, setDischarges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedDischarge, setSelectedDischarge] = useState(null);

  useEffect(() => {
    loadDischarges();
  }, []);

  const loadDischarges = () => {
    // Demo data: dimissioni post-visita con follow-up
    const demoData = [
      {
        id: '1',
        petId: 'pet1',
        petName: 'Luna',
        ownerName: 'Maria Rossi',
        visitType: 'Chirurgia - Sterilizzazione',
        dischargeDate: new Date(Date.now() - 1 * 86400000).toISOString(),
        instructions: 'Riposo assoluto per 7 giorni. Antibiotico 2 volte al giorno. Controllo sutura tra 10 giorni.',
        medications: ['Antibiotico (Amoxicillina 500mg)', 'Antidolorifico (Rimadyl)'],
        followUpScheduled: new Date(Date.now() + 1 * 86400000).toISOString(),
        followUpType: '24h',
        status: 'pending_followup',
        notes: 'Tutto ok, pet reattivo. Proprietaria informata su segnali di allarme.',
      },
      {
        id: '2',
        petId: 'pet2',
        petName: 'Rex',
        ownerName: 'Paolo Bianchi',
        visitType: 'Visita - Analisi sangue',
        dischargeDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        instructions: 'Dieta leggera per 3 giorni. Monitorare appetito. Risultati analisi disponibili tra 48h.',
        medications: ['Gastroprotettore'],
        followUpScheduled: new Date(Date.now() + 1 * 86400000).toISOString(),
        followUpType: '48h',
        status: 'completed',
        followUpCompleted: new Date(Date.now() - 0.5 * 86400000).toISOString(),
        notes: 'Follow-up completato. Proprietario conferma che Rex sta bene.',
      },
      {
        id: '3',
        petId: 'pet3',
        petName: 'Micio',
        ownerName: 'Laura Verdi',
        visitType: 'Urgenza - Intossicazione alimentare',
        dischargeDate: new Date(Date.now() - 3 * 86400000).toISOString(),
        instructions: 'Idratazione forzata. Dieta blanda (pollo + riso). Monitorare vomito/diarrea. Tornare se peggiora.',
        medications: ['Antiemetico', 'Probiotico'],
        followUpScheduled: new Date(Date.now() - 2 * 86400000).toISOString(),
        followUpType: '24h',
        status: 'completed',
        followUpCompleted: new Date(Date.now() - 2 * 86400000).toISOString(),
        notes: 'Follow-up OK, sintomi risolti.',
      },
      {
        id: '4',
        petId: 'pet4',
        petName: 'Birba',
        ownerName: 'Marco Neri',
        visitType: 'Visita - Vaccinazione',
        dischargeDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        instructions: 'Nessuna restrizione. Prossimo richiamo vaccino tra 1 anno.',
        medications: [],
        followUpScheduled: new Date(Date.now() - 4 * 86400000).toISOString(),
        followUpType: '24h',
        status: 'completed',
        followUpCompleted: new Date(Date.now() - 4 * 86400000).toISOString(),
        notes: 'Nessuna reazione avversa al vaccino.',
      },
      {
        id: '5',
        petId: 'pet5',
        petName: 'Buddy',
        ownerName: 'Sara Colombo',
        visitType: 'Chirurgia - Estrazione dentale',
        dischargeDate: new Date(Date.now() - 0.5 * 86400000).toISOString(),
        instructions: 'Cibo morbido per 5 giorni. Antibiotico + antidolorifico come prescritto. Controllo tra 7 giorni.',
        medications: ['Antibiotico', 'Antidolorifico', 'Collutorio'],
        followUpScheduled: new Date(Date.now() + 0.5 * 86400000).toISOString(),
        followUpType: '24h',
        status: 'pending_followup',
        notes: 'Chirurgia riuscita. Pet ancora leggermente sedato alla dimissione.',
      },
    ];
    setDischarges(demoData);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending_followup: { label: 'Follow-up Programmato', cls: 'bg-amber-100 text-amber-700', icon: Clock },
      completed: { label: 'Completato', cls: 'bg-green-100 text-green-700', icon: CheckCircle },
      overdue: { label: 'Scaduto', cls: 'bg-red-100 text-red-700', icon: AlertCircle },
    };
    const conf = statusMap[status] || statusMap.pending_followup;
    return (
      <Badge className={conf.cls}>
        <conf.icon className="h-3 w-3 mr-1" /> {conf.label}
      </Badge>
    );
  };

  const getFollowUpTypeBadge = (type) => {
    const map = {
      '24h': { label: '24h Post-Visita', cls: 'bg-blue-100 text-blue-700' },
      '48h': { label: '48h Post-Visita', cls: 'bg-purple-100 text-purple-700' },
      '7d': { label: '7 Giorni', cls: 'bg-cyan-100 text-cyan-700' },
    };
    return <Badge variant="outline" className={map[type]?.cls || 'bg-gray-100'}>{map[type]?.label || type}</Badge>;
  };

  const stats = {
    total: discharges.length,
    pending: discharges.filter(d => d.status === 'pending_followup').length,
    completed: discharges.filter(d => d.status === 'completed').length,
    today: discharges.filter(d => {
      const fdate = new Date(d.followUpScheduled);
      return fdate.toDateString() === new Date().toDateString() && d.status === 'pending_followup';
    }).length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
    </div>
  );

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}

      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Home className="h-6 w-6 text-purple-500" /> Dimissioni & Follow-up
        </h2>
        <p className="text-gray-500 text-sm">
          Gestisci le dimissioni post-visita e i follow-up automatici 24h/48h
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-xs text-blue-600">Dimissioni Totali</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
            <p className="text-xs text-amber-600">Follow-up Attivi</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-700">{stats.today}</p>
            <p className="text-xs text-purple-600">Follow-up Oggi</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
            <p className="text-xs text-green-600">Completati</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => setShowNewModal(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuova Dimissione
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Follow-up Attivi ({stats.pending})</TabsTrigger>
          <TabsTrigger value="today">Oggi ({stats.today})</TabsTrigger>
          <TabsTrigger value="completed">Completati ({stats.completed})</TabsTrigger>
          <TabsTrigger value="all">Tutti ({stats.total})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-3">
            {discharges.filter(d => d.status === 'pending_followup').map(discharge => (
              <Card key={discharge.id} className="border-purple-300 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                      <Heart className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{discharge.petName} - {discharge.visitType}</h4>
                        {getStatusBadge(discharge.status)}
                        {getFollowUpTypeBadge(discharge.followUpType)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <User className="h-3 w-3 inline mr-1" />
                        Proprietario: {discharge.ownerName}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span>
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Dimesso: {new Date(discharge.dischargeDate).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-purple-600 font-semibold">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Follow-up: {new Date(discharge.followUpScheduled).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-sm text-gray-700 mb-2">
                          <FileText className="h-3 w-3 inline mr-1" />
                          <strong>Istruzioni:</strong> {discharge.instructions}
                        </p>
                        {discharge.medications.length > 0 && (
                          <p className="text-sm text-gray-700">
                            <Pill className="h-3 w-3 inline mr-1" />
                            <strong>Terapia:</strong> {discharge.medications.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                          <Phone className="h-3 w-3 mr-1" /> Effettua Follow-up
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" /> Dettagli
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" /> PDF Dimissione
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="today">
          <div className="space-y-3">
            {discharges.filter(d => {
              const fdate = new Date(d.followUpScheduled);
              return fdate.toDateString() === new Date().toDateString() && d.status === 'pending_followup';
            }).map(discharge => (
              <Card key={discharge.id} className="border-amber-300 bg-amber-50/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{discharge.petName} - {discharge.ownerName}</h4>
                      <p className="text-sm text-gray-600">{discharge.visitType}</p>
                      <p className="text-xs text-amber-600 mt-1">
                        <Clock className="h-3 w-3 inline" /> Follow-up previsto: {new Date(discharge.followUpScheduled).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Phone className="h-3 w-3 mr-1" /> Chiama Ora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid md:grid-cols-2 gap-4">
            {discharges.filter(d => d.status === 'completed').map(discharge => (
              <Card key={discharge.id} className="border-green-200 bg-green-50/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{discharge.petName}</h4>
                      <p className="text-xs text-gray-600">{discharge.ownerName}</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mb-1">
                    ✓ Follow-up completato: {new Date(discharge.followUpCompleted).toLocaleDateString('it-IT')}
                  </p>
                  <p className="text-xs text-gray-500">{discharge.notes}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-3">
            {discharges.map(discharge => (
              <Card key={discharge.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{discharge.petName} - {discharge.ownerName}</h4>
                        {getStatusBadge(discharge.status)}
                      </div>
                      <p className="text-sm text-gray-600">{discharge.visitType}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Dimesso: {new Date(discharge.dischargeDate).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" /> Dettagli
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            <strong>Follow-up Automatici:</strong> VetBuddy programma automaticamente i follow-up 24h o 48h dopo ogni dimissione. 
            Il sistema invia promemoria allo staff e genera un template di chiamata con le domande chiave da porre al proprietario.
          </span>
        </p>
      </div>

      {/* New Discharge Modal (placeholder) */}
      {showNewModal && (
        <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuova Dimissione Post-Visita</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Paziente *</label>
                  <Input placeholder="Seleziona pet..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo Visita *</label>
                  <Input placeholder="Es: Chirurgia, Visita, Urgenza..." />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Istruzioni Dimissione *</label>
                <Textarea placeholder="Istruzioni dettagliate per il proprietario..." rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Terapia/Farmaci</label>
                <Textarea placeholder="Antibiotici, antidolorifici, altri farmaci..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo Follow-up *</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option value="24h">24h Post-Visita</option>
                    <option value="48h">48h Post-Visita</option>
                    <option value="7d">7 Giorni</option>
                    <option value="custom">Personalizzato</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Data Follow-up</label>
                  <Input type="datetime-local" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Note Interne</label>
                <Textarea placeholder="Note per il veterinario durante il follow-up..." rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewModal(false)}>Annulla</Button>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => { alert('Dimissione creata! (Demo)'); setShowNewModal(false); }}>
                <Plus className="h-4 w-4 mr-1" />Crea Dimissione
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
