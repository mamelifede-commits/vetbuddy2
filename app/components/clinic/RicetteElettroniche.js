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
  Pill, Plus, FileText, CheckCircle, Clock, AlertTriangle, Download,
  Search, RefreshCw, User, PawPrint, Calendar, Info, Shield
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

export default function RicetteElettroniche({ user, onNavigate, pets = [], owners = [] }) {
  const [ricette, setRicette] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRicette();
  }, []);

  const loadRicette = () => {
    // Demo data: ricette elettroniche veterinarie
    const demoRicette = [
      {
        id: 'ric1',
        numeroRNR: 'RNV240001234567', // Numero Ricetta Nazionale Veterinaria
        veterinario: 'Dr. Mario Rossi',
        numeroRNV: 'IT001234', // Numero Reg. Naz. Veterinari (DEMO)
        petName: 'Luna',
        ownerName: 'Maria Rossi',
        farmaco: 'Amoxicillina 500mg',
        dosaggio: '1 compressa ogni 12 ore per 7 giorni',
        quantita: '14 compresse',
        tipo: 'antibiotico',
        dataEmissione: new Date(Date.now() - 2 * 86400000).toISOString(),
        dataScadenza: new Date(Date.now() + 28 * 86400000).toISOString(),
        status: 'emessa',
        farmaciaRitirata: null,
        dataRitiro: null,
      },
      {
        id: 'ric2',
        numeroRNR: 'RNV240001234566',
        veterinario: 'Dr. Anna Bianchi',
        numeroRNV: 'IT005678',
        petName: 'Rex',
        ownerName: 'Paolo Bianchi',
        farmaco: 'Rimadyl 50mg (Carprofene)',
        dosaggio: '1 compressa al giorno durante i pasti',
        quantita: '30 compresse',
        tipo: 'antinfiammatorio',
        dataEmissione: new Date(Date.now() - 5 * 86400000).toISOString(),
        dataScadenza: new Date(Date.now() + 25 * 86400000).toISOString(),
        status: 'ritirata',
        farmaciaRitirata: 'Farmacia San Marco',
        dataRitiro: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 'ric3',
        numeroRNR: 'RNV240001234565',
        veterinario: 'Dr. Mario Rossi',
        numeroRNV: 'IT001234',
        petName: 'Micio',
        ownerName: 'Anna Verdi',
        farmaco: 'Frontline Combo Gatto',
        dosaggio: 'Applicare 1 pipetta sulla cute ogni 30 giorni',
        quantita: '3 pipette',
        tipo: 'antiparassitario',
        dataEmissione: new Date(Date.now() - 10 * 86400000).toISOString(),
        dataScadenza: new Date(Date.now() + 20 * 86400000).toISOString(),
        status: 'ritirata',
        farmaciaRitirata: 'Farmacia Centrale',
        dataRitiro: new Date(Date.now() - 9 * 86400000).toISOString(),
      },
      {
        id: 'ric4',
        numeroRNR: 'RNV240001234564',
        veterinario: 'Dr. Anna Bianchi',
        numeroRNV: 'IT005678',
        petName: 'Buddy',
        ownerName: 'Marco Neri',
        farmaco: 'Fenobarbitale 100mg',
        dosaggio: '½ compressa ogni 12 ore',
        quantita: '60 compresse',
        tipo: 'stupefacente', // Registro stupefacenti
        dataEmissione: new Date(Date.now() - 15 * 86400000).toISOString(),
        dataScadenza: new Date(Date.now() + 15 * 86400000).toISOString(),
        status: 'emessa',
        farmaciaRitirata: null,
        dataRitiro: null,
        registroStupefacenti: true,
      },
      {
        id: 'ric5',
        numeroRNR: 'RNV240001234563',
        veterinario: 'Dr. Mario Rossi',
        numeroRNV: 'IT001234',
        petName: 'Birba',
        ownerName: 'Sara Colombo',
        farmaco: 'Metronidazolo 250mg',
        dosaggio: '1 compressa ogni 8 ore per 5 giorni',
        quantita: '15 compresse',
        tipo: 'antibiotico',
        dataEmissione: new Date(Date.now() - 20 * 86400000).toISOString(),
        dataScadenza: new Date(Date.now() + 10 * 86400000).toISOString(),
        status: 'scaduta',
        farmaciaRitirata: null,
        dataRitiro: null,
      },
    ];
    setRicette(demoRicette);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const map = {
      emessa: { label: 'Emessa', cls: 'bg-blue-100 text-blue-700', icon: FileText },
      ritirata: { label: 'Ritirata', cls: 'bg-green-100 text-green-700', icon: CheckCircle },
      scaduta: { label: 'Scaduta', cls: 'bg-red-100 text-red-700', icon: AlertTriangle },
    };
    const conf = map[status] || map.emessa;
    return (
      <Badge className={conf.cls}>
        <conf.icon className="h-3 w-3 mr-1" /> {conf.label}
      </Badge>
    );
  };

  const getTipoBadge = (tipo) => {
    const map = {
      antibiotico: { label: 'Antibiotico', cls: 'bg-purple-100 text-purple-700' },
      antinfiammatorio: { label: 'Antinfiammatorio', cls: 'bg-orange-100 text-orange-700' },
      antiparassitario: { label: 'Antiparassitario', cls: 'bg-green-100 text-green-700' },
      stupefacente: { label: '⚠️ Stupefacente', cls: 'bg-red-100 text-red-700' },
    };
    return map[tipo] || { label: tipo, cls: 'bg-gray-100 text-gray-700' };
  };

  const filteredRicette = ricette.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.numeroRNR.toLowerCase().includes(q) ||
      r.petName.toLowerCase().includes(q) ||
      r.ownerName.toLowerCase().includes(q) ||
      r.farmaco.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: ricette.length,
    emesse: ricette.filter(r => r.status === 'emessa').length,
    ritirate: ricette.filter(r => r.status === 'ritirata').length,
    scadute: ricette.filter(r => r.status === 'scaduta').length,
    stupefacenti: ricette.filter(r => r.registroStupefacenti).length,
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
          <Pill className="h-6 w-6 text-purple-500" /> Ricette Elettroniche Veterinarie
        </h2>
        <p className="text-gray-500 text-sm">
          Sistema Nazionale Ricetta Veterinaria Elettronica (RNV)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-xs text-blue-600">Ricette Totali</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-cyan-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-cyan-700">{stats.emesse}</p>
            <p className="text-xs text-cyan-600">Emesse</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700">{stats.ritirate}</p>
            <p className="text-xs text-green-600">Ritirate</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-700">{stats.scadute}</p>
            <p className="text-xs text-red-600">Scadute</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-700">{stats.stupefacenti}</p>
            <p className="text-xs text-amber-600">Stupefacenti</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => setShowNewModal(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuova Ricetta Elettronica
        </Button>
        <Button variant="outline" onClick={() => alert('Registro Stupefacenti (Demo)\n\nCarico/Scarico automatico da ricette elettroniche')}>
          <Shield className="h-4 w-4 mr-1" /> Registro Stupefacenti
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cerca ricetta, paziente, farmaco..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tutte ({stats.total})</TabsTrigger>
          <TabsTrigger value="emesse">Emesse ({stats.emesse})</TabsTrigger>
          <TabsTrigger value="ritirate">Ritirate ({stats.ritirate})</TabsTrigger>
          <TabsTrigger value="stupefacenti">Stupefacenti ({stats.stupefacenti})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-3">
            {filteredRicette.map(ric => {
              const tipoBadge = getTipoBadge(ric.tipo);
              return (
                <Card key={ric.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                        <Pill className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{ric.numeroRNR}</h4>
                          {getStatusBadge(ric.status)}
                          <Badge className={tipoBadge.cls}>{tipoBadge.label}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>{ric.farmaco}</strong> • {ric.quantita}
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                          <p><User className="h-3 w-3 inline mr-1" /><strong>Proprietario:</strong> {ric.ownerName}</p>
                          <p><PawPrint className="h-3 w-3 inline mr-1" /><strong>Paziente:</strong> {ric.petName}</p>
                          <p><User className="h-3 w-3 inline mr-1" /><strong>Veterinario:</strong> {ric.veterinario} (RNV: {ric.numeroRNV})</p>
                          <p><Calendar className="h-3 w-3 inline mr-1" /><strong>Emessa:</strong> {new Date(ric.dataEmissione).toLocaleDateString('it-IT')}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2 mb-2">
                          <p className="text-xs text-gray-700"><strong>Dosaggio:</strong> {ric.dosaggio}</p>
                        </div>
                        {ric.farmaciaRitirata && (
                          <p className="text-xs text-green-600">
                            ✓ Ritirata presso {ric.farmaciaRitirata} il {new Date(ric.dataRitiro).toLocaleDateString('it-IT')}
                          </p>
                        )}
                        {ric.registroStupefacenti && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            <Shield className="h-3 w-3 inline mr-1" />
                            <strong>Registro Stupefacenti:</strong> Carico/scarico automatico registrato
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => alert('Download PDF Ricetta\n\nRicetta firmata digitalmente pronta per stampa')}>
                            <Download className="h-3 w-3 mr-1" /> PDF Ricetta
                          </Button>
                          {ric.status === 'emessa' && (
                            <Button size="sm" className="bg-green-500 text-white" onClick={() => alert('Segna come ritirata')}>
                              <CheckCircle className="h-3 w-3 mr-1" /> Segna Ritirata
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="emesse">
          <div className="space-y-3">
            {filteredRicette.filter(r => r.status === 'emessa').map(ric => (
              <div key={ric.id} className="text-sm">{ric.numeroRNR} - {ric.petName}</div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ritirate">
          <div className="space-y-3">
            {filteredRicette.filter(r => r.status === 'ritirata').map(ric => (
              <div key={ric.id} className="text-sm">{ric.numeroRNR} - {ric.farmaciaRitirata}</div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stupefacenti">
          <div className="space-y-3">
            {filteredRicette.filter(r => r.registroStupefacenti).map(ric => (
              <div key={ric.id} className="text-sm">{ric.numeroRNR} - {ric.farmaco}</div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800 mb-2">
          <Info className="h-4 w-4 inline mr-1" />
          <strong>Ricetta Veterinaria Elettronica (RNV):</strong>
        </p>
        <ul className="text-xs text-purple-700 space-y-1 ml-5 list-disc">
          <li><strong>Obbligatoria</strong> per farmaci con obbligo di ricetta veterinaria</li>
          <li>Numerazione univoca RNV assegnata dal Sistema Nazionale</li>
          <li>Validità 30 giorni dalla data emissione</li>
          <li>Invio automatico a farmacia tramite sistema ministeriale</li>
          <li><strong>Stupefacenti:</strong> Registro carico/scarico automatico integrato</li>
          <li><strong>DEMO:</strong> Numero RNV veterinario simulato (in produzione: richiedere numero reale all'Ordine Veterinari)</li>
        </ul>
      </div>

      {/* New Modal (placeholder) */}
      {showNewModal && (
        <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuova Ricetta Elettronica Veterinaria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Paziente *</label>
                  <Input placeholder="Seleziona pet..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Veterinario *</label>
                  <Input placeholder="Dr. Mario Rossi (RNV: IT001234)" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Farmaco *</label>
                <Input placeholder="Nome commerciale farmaco..." />
              </div>
              <div>
                <label className="text-sm font-medium">Dosaggio e Modalità d'Uso *</label>
                <Textarea placeholder="1 compressa ogni 12 ore per 7 giorni durante i pasti" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Quantità *</label>
                  <Input placeholder="14 compresse" />
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo Farmaco *</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option value="antibiotico">Antibiotico</option>
                    <option value="antinfiammatorio">Antinfiammatorio</option>
                    <option value="antiparassitario">Antiparassitario</option>
                    <option value="stupefacente">⚠️ Stupefacente</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewModal(false)}>Annulla</Button>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => { alert('Ricetta generata! (Demo)\n\nNumero RNV: RNV240001234568'); setShowNewModal(false); }}>
                <FileText className="h-4 w-4 mr-1" /> Genera Ricetta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
