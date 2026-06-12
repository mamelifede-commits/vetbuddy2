'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Package, AlertTriangle, TrendingDown, Calendar, Plus, Minus, 
  RefreshCw, Search, Filter, Download, BarChart3, Clock, CheckCircle, XCircle
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';
import api from '@/app/lib/api';

export default function StockVaccini({ user, onNavigate }) {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [showMovement, setShowMovement] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [movementType, setMovementType] = useState('in');
  const [movementForm, setMovementForm] = useState({ quantity: 1, reason: '', notes: '' });
  const [newItem, setNewItem] = useState({ name: '', category: 'vaccino', quantity: 0, minThreshold: 5, unitPrice: 0, supplier: '', lot: '', expiryDate: '', location: '' });
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      setLoading(true);
      const response = await api.get('inventory');
      setItems(response.items || []);
      setMovements(response.movements || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setItems([]);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const seedDemoData = async () => {
    try {
      setSaving(true);
      await api.post('inventory', { seedDemo: true });
      await loadStock();
    } catch (error) {
      alert('❌ Errore nel caricamento dei dati di esempio');
    } finally {
      setSaving(false);
    }
  };

  const createItem = async () => {
    if (!newItem.name || !newItem.expiryDate) {
      alert('⚠️ Nome e data di scadenza sono obbligatori');
      return;
    }
    try {
      setSaving(true);
      await api.post('inventory', newItem);
      setShowNewItem(false);
      setNewItem({ name: '', category: 'vaccino', quantity: 0, minThreshold: 5, unitPrice: 0, supplier: '', lot: '', expiryDate: '', location: '' });
      await loadStock();
    } catch (error) {
      alert('❌ Errore nella creazione dell\'articolo');
    } finally {
      setSaving(false);
    }
  };

  const openMovement = (item, type) => {
    setSelectedItem(item);
    setMovementType(type);
    setMovementForm({ quantity: 1, reason: type === 'in' ? 'Rifornimento' : '', notes: '' });
    setShowMovement(true);
  };

  const saveMovement = async () => {
    if (!movementForm.quantity || Number(movementForm.quantity) <= 0) {
      alert('⚠️ Inserisci una quantità valida');
      return;
    }
    try {
      setSaving(true);
      await api.put('inventory', {
        itemId: selectedItem.id,
        type: movementType,
        quantity: Number(movementForm.quantity),
        reason: movementForm.reason,
        notes: movementForm.notes
      });
      setShowMovement(false);
      await loadStock();
    } catch (error) {
      alert('❌ Errore nel salvataggio del movimento');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const header = 'Nome;Categoria;Quantità;Soglia Minima;Prezzo Unitario;Fornitore;Lotto;Scadenza;Posizione\n';
    const rows = items.map(i => [
      i.name, i.category, i.quantity, i.minThreshold, i.unitPrice,
      i.supplier || '', i.lot || '',
      i.expiryDate ? new Date(i.expiryDate).toLocaleDateString('it-IT') : '',
      i.location || ''
    ].join(';')).join('\n');
    const blob = new Blob(['\ufeff' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryBadge = (category) => {
    const map = {
      vaccino: { label: 'Vaccino', cls: 'bg-purple-100 text-purple-700' },
      farmaco: { label: 'Farmaco', cls: 'bg-blue-100 text-blue-700' },
      materiale: { label: 'Materiale', cls: 'bg-gray-100 text-gray-700' },
      diagnostico: { label: 'Diagnostico', cls: 'bg-cyan-100 text-cyan-700' },
    };
    const conf = map[category] || map.materiale;
    return <Badge className={conf.cls}>{conf.label}</Badge>;
  };

  const getStockStatus = (item) => {
    if (item.quantity === 0) return { label: 'Esaurito', cls: 'bg-red-100 text-red-700 border-red-300', icon: XCircle };
    if (item.quantity < item.minThreshold) return { label: 'Scorta Bassa', cls: 'bg-amber-100 text-amber-700 border-amber-300', icon: AlertTriangle };
    return { label: 'Disponibile', cls: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle };
  };

  const getExpiryWarning = (expiryDate) => {
    const daysUntilExpiry = Math.floor((new Date(expiryDate) - new Date()) / 86400000);
    if (daysUntilExpiry < 0) return { label: 'SCADUTO', cls: 'text-red-600 font-bold', urgent: true };
    if (daysUntilExpiry <= 30) return { label: `Scade tra ${daysUntilExpiry} giorni`, cls: 'text-red-600 font-semibold', urgent: true };
    if (daysUntilExpiry <= 60) return { label: `Scade tra ${daysUntilExpiry} giorni`, cls: 'text-amber-600', urgent: false };
    return { label: `Scade tra ${daysUntilExpiry} giorni`, cls: 'text-green-600', urgent: false };
  };

  const filteredItems = items.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: items.length,
    lowStock: items.filter(i => i.quantity < i.minThreshold && i.quantity > 0).length,
    outOfStock: items.filter(i => i.quantity === 0).length,
    expiringSoon: items.filter(i => {
      const days = Math.floor((new Date(i.expiryDate) - new Date()) / 86400000);
      return days <= 60 && days >= 0;
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
          <Package className="h-6 w-6 text-purple-500" /> Stock Leggero Vaccini
        </h2>
        <p className="text-gray-500 text-sm">
          Inventario semplificato per vaccini e materiali critici
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Package className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-xs text-blue-600">Articoli Totali</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-6 w-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-700">{stats.lowStock}</p>
            <p className="text-xs text-amber-600">Scorte Basse</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <XCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-700">{stats.outOfStock}</p>
            <p className="text-xs text-red-600">Esauriti</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-700">{stats.expiringSoon}</p>
            <p className="text-xs text-purple-600">In Scadenza (60gg)</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => setShowNewItem(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuovo Articolo
        </Button>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-1" /> Esporta CSV
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cerca articolo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <select
            className="border rounded px-3 py-2 text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Tutte le categorie</option>
            <option value="vaccino">Vaccini</option>
            <option value="farmaco">Farmaci</option>
            <option value="materiale">Materiali</option>
            <option value="diagnostico">Diagnostici</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stock">
        <TabsList className="mb-4">
          <TabsTrigger value="stock">Inventario ({filteredItems.length})</TabsTrigger>
          <TabsTrigger value="movements">Movimenti ({movements.length})</TabsTrigger>
          <TabsTrigger value="alerts">Alert ({stats.lowStock + stats.expiringSoon})</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <div className="space-y-3">
            {filteredItems.length === 0 && (
              <Card className="border-dashed border-2">
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-700 mb-1">
                    {items.length === 0 ? 'Inventario vuoto' : 'Nessun articolo trovato'}
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    {items.length === 0
                      ? 'Aggiungi i tuoi vaccini e materiali critici: riceverai alert automatici per scorte basse e scadenze.'
                      : 'Prova a modificare i filtri di ricerca.'}
                  </p>
                  {items.length === 0 && (
                    <div className="flex gap-3 justify-center">
                      <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => setShowNewItem(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Aggiungi Primo Articolo
                      </Button>
                      <Button variant="outline" onClick={seedDemoData} disabled={saving}>
                        {saving ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                        Carica Dati di Esempio
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {filteredItems.map(item => {
              const status = getStockStatus(item);
              const expiry = getExpiryWarning(item.expiryDate);
              return (
                <Card key={item.id} className={`hover:shadow-md transition-shadow ${status.cls.includes('red') ? 'border-red-300' : status.cls.includes('amber') ? 'border-amber-300' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 ${status.cls} rounded-full flex items-center justify-center shrink-0`}>
                        <status.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{item.name}</h4>
                          {getCategoryBadge(item.category)}
                          <Badge className={status.cls}>{status.label}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-600 mb-2">
                          <div>
                            <span className="text-gray-500">Quantità:</span> <span className="font-semibold">{item.quantity}</span> {item.quantity < item.minThreshold && <span className="text-amber-600">/ min {item.minThreshold}</span>}
                          </div>
                          <div>
                            <span className="text-gray-500">Fornitore:</span> {item.supplier}
                          </div>
                          <div>
                            <span className="text-gray-500">Lotto:</span> {item.lot}
                          </div>
                          <div className={expiry.cls}>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {expiry.label}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          📍 {item.location} • Ultimo rifornimento: {new Date(item.lastRestocked).toLocaleDateString('it-IT')}
                        </div>
                        {expiry.urgent && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            ⚠️ <strong>Azione richiesta:</strong> {expiry.label === 'SCADUTO' ? 'Smaltire immediatamente' : 'Riordinare o utilizzare prioritariamente'}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-green-600" onClick={() => openMovement(item, 'in')}>
                            <Plus className="h-3 w-3 mr-1" /> Carico
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => openMovement(item, 'out')}>
                            <Minus className="h-3 w-3 mr-1" /> Scarico
                          </Button>
                          <Button size="sm" variant="outline" className="text-gray-500" onClick={() => openMovement(item, 'expired')}>
                            <XCircle className="h-3 w-3 mr-1" /> Smaltisci
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="movements">
          <div className="space-y-2">
            {movements.slice(0, 20).map(mov => (
              <Card key={mov.id} className="hover:bg-gray-50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        mov.type === 'in' ? 'bg-green-100' : mov.type === 'expired' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {mov.type === 'in' ? <Plus className="h-4 w-4 text-green-600" /> : 
                         mov.type === 'expired' ? <XCircle className="h-4 w-4 text-red-600" /> :
                         <Minus className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{mov.itemName}</p>
                        <p className="text-xs text-gray-500">{mov.reason} • {mov.performedBy}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${mov.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                        {mov.type === 'in' ? '+' : '-'}{mov.quantity}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(mov.date).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                  {mov.notes && <p className="text-xs text-gray-600 mt-2 ml-11">{mov.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-3">
            {/* Scorte basse */}
            {items.filter(i => i.quantity < i.minThreshold && i.quantity > 0).map(item => (
              <Card key={item.id} className="border-amber-300 bg-amber-50/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900">{item.name}</h4>
                      <p className="text-sm text-amber-700">
                        Scorta bassa: {item.quantity} unità (minimo: {item.minThreshold})
                      </p>
                    </div>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => openMovement(item, 'in')}>
                      Riordina
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {/* In scadenza */}
            {items.filter(i => {
              const days = Math.floor((new Date(i.expiryDate) - new Date()) / 86400000);
              return days <= 60 && days >= 0;
            }).map(item => {
              const days = Math.floor((new Date(item.expiryDate) - new Date()) / 86400000);
              return (
                <Card key={item.id} className="border-purple-300 bg-purple-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-6 w-6 text-purple-600" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-900">{item.name}</h4>
                        <p className="text-sm text-purple-700">
                          Scade tra {days} giorni ({new Date(item.expiryDate).toLocaleDateString('it-IT')})
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openMovement(item, 'out')}>
                        Usa Prima
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Info box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <Package className="h-4 w-4 inline mr-1" />
          <strong>Stock Leggero:</strong> Questo modulo traccia solo vaccini e materiali critici, NON è un gestionale di magazzino completo. 
          Per un inventario completo, considera un software dedicato.
        </p>
      </div>

      {/* Modal Nuovo Articolo */}
      {showNewItem && (
        <Dialog open={showNewItem} onOpenChange={setShowNewItem}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Articolo Stock</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="text-sm font-medium">Nome articolo *</label>
                <Input placeholder="Es. Vaccino Polivalente Cane" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <select className="w-full border rounded px-3 py-2" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})}>
                  <option value="vaccino">Vaccino</option>
                  <option value="farmaco">Farmaco</option>
                  <option value="materiale">Materiale</option>
                  <option value="diagnostico">Diagnostico</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Quantità iniziale</label>
                  <Input type="number" min="0" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Soglia minima</label>
                  <Input type="number" min="0" value={newItem.minThreshold} onChange={(e) => setNewItem({...newItem, minThreshold: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Prezzo unitario (€)</label>
                  <Input type="number" min="0" step="0.01" value={newItem.unitPrice} onChange={(e) => setNewItem({...newItem, unitPrice: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Data scadenza *</label>
                  <Input type="date" value={newItem.expiryDate} onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Fornitore</label>
                <Input placeholder="Es. MSD Animal Health" value={newItem.supplier} onChange={(e) => setNewItem({...newItem, supplier: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Lotto</label>
                  <Input placeholder="Es. LOT2025A" value={newItem.lot} onChange={(e) => setNewItem({...newItem, lot: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Posizione</label>
                  <Input placeholder="Es. Frigo A - Ripiano 2" value={newItem.location} onChange={(e) => setNewItem({...newItem, location: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewItem(false)}>Annulla</Button>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={createItem} disabled={saving}>
                {saving ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />} Crea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Movimento */}
      {showMovement && selectedItem && (
        <Dialog open={showMovement} onOpenChange={setShowMovement}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {movementType === 'in' ? '➕ Carico' : movementType === 'expired' ? '🗑️ Smaltimento' : '➖ Scarico'}: {selectedItem.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Quantità attuale: <strong>{selectedItem.quantity}</strong>
                {movementType !== 'in' && selectedItem.quantity === 0 && <span className="text-red-600 ml-2">⚠️ Articolo esaurito</span>}
              </p>
              <div>
                <label className="text-sm font-medium">Quantità *</label>
                <Input type="number" min="1" value={movementForm.quantity} onChange={(e) => setMovementForm({...movementForm, quantity: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Motivo</label>
                <Input placeholder={movementType === 'in' ? 'Es. Rifornimento ordine fornitore' : movementType === 'expired' ? 'Es. Lotto scaduto' : 'Es. Vaccinazione paziente'} value={movementForm.reason} onChange={(e) => setMovementForm({...movementForm, reason: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Note</label>
                <Input placeholder="Note opzionali..." value={movementForm.notes} onChange={(e) => setMovementForm({...movementForm, notes: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMovement(false)}>Annulla</Button>
              <Button
                className={movementType === 'in' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}
                onClick={saveMovement}
                disabled={saving}
              >
                {saving ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />} Conferma
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
