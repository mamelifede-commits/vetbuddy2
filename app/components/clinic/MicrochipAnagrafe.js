'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  QrCode, CheckCircle, Clock, AlertTriangle, Send, Download, RefreshCw,
  Search, User, PawPrint, MapPin, Calendar, FileText, Info, Shield
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

export default function MicrochipAnagrafe({ user, onNavigate, pets = [], owners = [] }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = () => {
    // Demo data: iscrizioni anagrafe canina
    const demoRegistrations = [
      {
        id: 'reg1',
        petName: 'Luna',
        petSpecies: 'Cane',
        petBreed: 'Golden Retriever',
        microchipNumber: '380260123456789',
        ownerName: 'Maria Rossi',
        ownerAddress: 'Via Roma 10, 20100 Milano (MI)',
        ownerPhone: '+39 340 1234567',
        ownerEmail: 'maria.rossi@email.it',
        registrationDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        anagrafeRegione: 'Lombardia',
        status: 'completed',
        numeroProtocollo: 'ANA-MI-2024-001234',
        submittedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        approvedDate: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 'reg2',
        petName: 'Rex',
        petSpecies: 'Cane',
        petBreed: 'Labrador',
        microchipNumber: '380260987654321',
        ownerName: 'Paolo Bianchi',
        ownerAddress: 'Via Garibaldi 25, 20121 Milano (MI)',
        ownerPhone: '+39 345 9876543',
        ownerEmail: 'paolo.bianchi@email.it',
        registrationDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        anagrafeRegione: 'Lombardia',
        status: 'pending',
        numeroProtocollo: 'ANA-MI-2024-001235',
        submittedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'reg3',
        petName: 'Micio',
        petSpecies: 'Gatto',
        petBreed: 'Europeo',
        microchipNumber: '380260555444333',
        ownerName: 'Anna Verdi',
        ownerAddress: 'Corso Buenos Aires 50, 20131 Milano (MI)',
        ownerPhone: '+39 338 1122334',
        ownerEmail: 'anna.verdi@email.it',
        registrationDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        anagrafeRegione: 'Lombardia',
        status: 'completed',
        numeroProtocollo: 'ANA-MI-2024-001230',
        submittedDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        approvedDate: new Date(Date.now() - 9 * 86400000).toISOString(),
      },
      {
        id: 'reg4',
        petName: 'Buddy',
        petSpecies: 'Cane',
        petBreed: 'Pastore Tedesco',
        microchipNumber: '380260777888999',
        ownerName: 'Marco Neri',
        ownerAddress: 'Via Dante 15, 20100 Milano (MI)',
        ownerPhone: '+39 349 5556667',
        ownerEmail: 'marco.neri@email.it',
        registrationDate: new Date(Date.now() - 1 * 86400000).toISOString(),
        anagrafeRegione: 'Lombardia',
        status: 'draft',
        numeroProtocollo: null,
        submittedDate: null,
      },
      {
        id: 'reg5',
        petName: 'Birba',
        petSpecies: 'Cane',
        petBreed: 'Barboncino',
        microchipNumber: '380260111222333',
        ownerName: 'Sara Colombo',
        ownerAddress: 'Viale Monza 100, 20125 Milano (MI)',
        ownerPhone: '+39 347 3334445',
        ownerEmail: 'sara.colombo@email.it',
        registrationDate: new Date(Date.now() - 15 * 86400000).toISOString(),
        anagrafeRegione: 'Lombardia',
        status: 'rejected',
        numeroProtocollo: 'ANA-MI-2024-001225',
        submittedDate: new Date(Date.now() - 15 * 86400000).toISOString(),
        rejectedDate: new Date(Date.now() - 14 * 86400000).toISOString(),
        rejectionReason: 'Microchip non valido o già registrato',
      },
    ];
    setRegistrations(demoRegistrations);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const map = {
      draft: { label: 'Bozza', cls: 'bg-gray-100 text-gray-700', icon: FileText },
      pending: { label: 'In attesa', cls: 'bg-blue-100 text-blue-700', icon: Clock },
      completed: { label: 'Completata', cls: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { label: 'Rifiutata', cls: 'bg-red-100 text-red-700', icon: AlertTriangle },
    };
    const conf = map[status] || map.draft;
    return (
      <Badge className={conf.cls}>
        <conf.icon className="h-3 w-3 mr-1" /> {conf.label}
      </Badge>
    );
  };

  const filteredRegistrations = registrations.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.petName.toLowerCase().includes(q) ||
      r.ownerName.toLowerCase().includes(q) ||
      r.microchipNumber.includes(q) ||
      (r.numeroProtocollo && r.numeroProtocollo.toLowerCase().includes(q))
    );
  });

  const stats = {
    total: registrations.length,
    draft: registrations.filter(r => r.status === 'draft').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    completed: registrations.filter(r => r.status === 'completed').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}

      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="h-6 w-6 text-blue-500" /> Microchip & Anagrafe Canina
        </h2>
        <p className="text-gray-500 text-sm">
          Gestione iscrizioni anagrafe regionale e tracking microchip
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <QrCode className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-xs text-blue-600">Registrazioni</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 text-gray-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-700">{stats.draft}</p>
            <p className="text-xs text-gray-600">Bozze</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-cyan-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-cyan-700">{stats.pending}</p>
            <p className="text-xs text-cyan-600">In attesa</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
            <p className="text-xs text-green-600">Completate</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            <p className="text-xs text-red-600">Rifiutate</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setShowNewModal(true)}>
          <QrCode className="h-4 w-4 mr-1" /> Nuova Iscrizione Anagrafe
        </Button>
        <Button variant="outline" onClick={() => alert('Verifica Microchip su Database Nazionale\n\n(Integrazione con banca dati ministeriale)')}>
          <Shield className="h-4 w-4 mr-1" /> Verifica Microchip
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cerca per nome, microchip, protocollo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-96"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tutte ({stats.total})</TabsTrigger>
          <TabsTrigger value="draft">Bozze ({stats.draft})</TabsTrigger>
          <TabsTrigger value="pending">In attesa ({stats.pending})</TabsTrigger>
          <TabsTrigger value="completed">Completate ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-3">
            {filteredRegistrations.map(reg => (
              <Card key={reg.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <QrCode className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{reg.petName}</h4>
                        {getStatusBadge(reg.status)}
                        <Badge variant="outline" className="text-xs">{reg.petSpecies} - {reg.petBreed}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
                        <p><QrCode className="h-3 w-3 inline mr-1" /><strong>Microchip:</strong> {reg.microchipNumber}</p>
                        <p><User className="h-3 w-3 inline mr-1" /><strong>Proprietario:</strong> {reg.ownerName}</p>
                        <p><MapPin className="h-3 w-3 inline mr-1" /><strong>Indirizzo:</strong> {reg.ownerAddress}</p>
                        <p><Calendar className="h-3 w-3 inline mr-1" /><strong>Applicazione:</strong> {new Date(reg.registrationDate).toLocaleDateString('it-IT')}</p>
                      </div>
                      {reg.numeroProtocollo && (
                        <div className="bg-blue-50 rounded p-2 mb-2">
                          <p className="text-xs text-blue-700">
                            <strong>Protocollo Anagrafe {reg.anagrafeRegione}:</strong> {reg.numeroProtocollo}
                          </p>
                        </div>
                      )}
                      {reg.status === 'pending' && (
                        <p className="text-xs text-blue-600 mb-2">
                          ⏳ Inviata il {new Date(reg.submittedDate).toLocaleDateString('it-IT')} - In attesa conferma anagrafe regionale
                        </p>
                      )}
                      {reg.status === 'completed' && (
                        <p className="text-xs text-green-600 mb-2">
                          ✓ Approvata il {new Date(reg.approvedDate).toLocaleDateString('it-IT')}
                        </p>
                      )}
                      {reg.status === 'rejected' && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 mb-2">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          <strong>Rifiutata:</strong> {reg.rejectionReason}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {reg.status === 'draft' && (
                          <Button size="sm" className="bg-blue-500 text-white" onClick={() => alert('Invia a Anagrafe Regionale\n\nCompila form completo e invia via email/portale')}>
                            <Send className="h-3 w-3 mr-1" /> Invia Anagrafe
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => alert('Download PDF Certificato Microchip\n\nCertificato applicazione microchip per proprietario')}>
                          <Download className="h-3 w-3 mr-1" /> PDF Certificato
                        </Button>
                        {reg.status === 'completed' && (
                          <Button size="sm" variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" /> Verifica Iscrizione
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="draft">
          <div className="space-y-3">
            {filteredRegistrations.filter(r => r.status === 'draft').map(reg => (
              <div key={reg.id} className="text-sm">{reg.petName} - {reg.microchipNumber}</div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-3">
            {filteredRegistrations.filter(r => r.status === 'pending').map(reg => (
              <div key={reg.id} className="text-sm">{reg.petName} - {reg.numeroProtocollo}</div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredRegistrations.filter(r => r.status === 'completed').map(reg => (
              <Card key={reg.id} className="border-green-200 bg-green-50/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{reg.petName}</h4>
                      <p className="text-xs text-gray-600">{reg.microchipNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 mb-2">
          <Info className="h-4 w-4 inline mr-1" />
          <strong>Microchip & Anagrafe Canina Italiana:</strong>
        </p>
        <ul className="text-xs text-blue-700 space-y-1 ml-5 list-disc">
          <li><strong>Obbligatorio per legge</strong> per tutti i cani in Italia (multa €25-€258)</li>
          <li>Microchip ISO 11784/11785 (15 cifre) applicato da veterinario abilitato</li>
          <li>Iscrizione anagrafe regionale entro 15 giorni dall'applicazione</li>
          <li>Certificato rilasciato al proprietario con numero microchip</li>
          <li>Cambio proprietà, smarrimento, decesso: pratica obbligatoria su anagrafe</li>
          <li><strong>DEMO:</strong> Invio automatizzato (in produzione: integrazione portale regionale o email)</li>
        </ul>
      </div>

      {/* New Modal (placeholder) */}
      {showNewModal && (
        <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuova Iscrizione Anagrafe Canina</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Paziente *</label>
                  <Input placeholder="Seleziona pet..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Numero Microchip *</label>
                  <Input placeholder="380260123456789 (15 cifre)" maxLength={15} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data Applicazione *</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium">Anagrafe Regionale *</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option value="lombardia">Lombardia</option>
                    <option value="piemonte">Piemonte</option>
                    <option value="veneto">Veneto</option>
                    <option value="lazio">Lazio</option>
                    <option value="emilia">Emilia-Romagna</option>
                  </select>
                </div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                <strong>Dati proprietario:</strong> Verranno pre-compilati automaticamente dalla scheda del pet selezionato
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewModal(false)}>Annulla</Button>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => { alert('Iscrizione creata! (Demo)\n\nProtocollo: ANA-MI-2024-001240'); setShowNewModal(false); }}>
                <QrCode className="h-4 w-4 mr-1" /> Crea Iscrizione
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
