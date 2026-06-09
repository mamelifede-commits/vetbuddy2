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

export default function StockVaccini({ user, onNavigate }) {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewItem, setShowNewItem] = useState(false);
  const [showMovement, setShowMovement] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = () => {
    // Demo data: stock vaccini e materiali critici
    const demoItems = [
      { id: '1', name: 'Vaccino Polivalente Cane', category: 'vaccino', quantity: 15, minThreshold: 10, unitPrice: 25, supplier: 'MSD Animal Health', lot: 'LOT2024A', expiryDate: new Date(Date.now() + 180 * 86400000).toISOString(), location: 'Frigo A - Ripiano 2', lastRestocked: new Date(Date.now() - 30 * 86400000).toISOString() },
      { id: '2', name: 'Vaccino Antirabbica', category: 'vaccino', quantity: 8, minThreshold: 5, unitPrice: 18, supplier: 'Boehringer Ingelheim', lot: 'LOT2024B', expiryDate: new Date(Date.now() + 90 * 86400000).toISOString(), location: 'Frigo A - Ripiano 1', lastRestocked: new Date(Date.now() - 45 * 86400000).toISOString() },
      { id: '3', name: 'Vaccino Trivalente Gatto', category: 'vaccino', quantity: 12, minThreshold: 8, unitPrice: 22, supplier: 'Zoetis', lot: 'LOT2024C', expiryDate: new Date(Date.now() + 150 * 86400000).toISOString(), location: 'Frigo B - Ripiano 1', lastRestocked: new Date(Date.now() - 20 * 86400000).toISOString() },
      { id: '4', name: 'Vaccino Leucemia Felina', category: 'vaccino', quantity: 4, minThreshold: 5, unitPrice: 28, supplier: 'Boehringer Ingelheim', lot: 'LOT2024D', expiryDate: new Date(Date.now() + 60 * 86400000).toISOString(), location: 'Frigo B - Ripiano 2', lastRestocked: new Date(Date.now() - 60 * 86400000).toISOString() },
      { id: '5', name: 'Siringhe 1ml Sterili', category: 'materiale', quantity: 250, minThreshold: 100, unitPrice: 0.3, supplier: 'BD Medical', lot: 'SYR2024', expiryDate: new Date(Date.now() + 365 * 86400000).toISOString(), location: 'Armadio C - Cassetto 3', lastRestocked: new Date(Date.now() - 15 * 86400000).toISOString() },
      { id: '6', name: 'Aghi 23G', category: 'materiale', quantity: 180, minThreshold: 150, unitPrice: 0.15, supplier: 'Terumo', lot: 'NDL2024', expiryDate: new Date(Date.now() + 400 * 86400000).toISOString(), location: 'Armadio C - Cassetto 2', lastRestocked: new Date(Date.now() - 25 * 86400000).toISOString() },
      { id: '7', name: 'Antiparassitario Spot-On Cane', category: 'farmaco', quantity: 35, minThreshold: 20, unitPrice: 12, supplier: 'Elanco', lot: 'SPOT2024', expiryDate: new Date(Date.now() + 240 * 86400000).toISOString(), location: 'Armadio A - Ripiano 4', lastRestocked: new Date(Date.now() - 10 * 86400000).toISOString() },
      { id: '8', name: 'Antiparassitario Collare Gatto', category: 'farmaco', quantity: 18, minThreshold: 15, unitPrice: 15, supplier: 'Bayer', lot: 'COL2024', expiryDate: new Date(Date.now() + 200 * 86400000).toISOString(), location: 'Armadio A - Ripiano 3', lastRestocked: new Date(Date.now() - 35 * 86400000).toISOString() },
      { id: '9', name: 'Test FeLV/FIV', category: 'diagnostico', quantity: 6, minThreshold: 10, unitPrice: 35, supplier: 'IDEXX', lot: 'TEST2024', expiryDate: new Date(Date.now() + 120 * 86400000).toISOString(), location: 'Frigo C - Cassetto Test', lastRestocked: new Date(Date.now() - 50 * 86400000).toISOString() },
      { id: '10', name: 'Vaccino Bordetella', category: 'vaccino', quantity: 7, minThreshold: 5, unitPrice: 20, supplier: 'Zoetis', lot: 'LOT2024E', expiryDate: new Date(Date.now() + 45 * 86400000).toISOString(), location: 'Frigo A - Ripiano 3', lastRestocked: new Date(Date.now() - 70 * 86400000).toISOString() },
    ];

    const demoMovements = [
      { id: '1', itemId: '1', itemName: 'Vaccino Polivalente Cane', type: 'out', quantity: 2, date: new Date(Date.now() - 1 * 86400000).toISOString(), reason: 'Vaccinazione Luna (cane)', performedBy: 'Dr. Rossi', notes: 'Vaccino annuale' },
      { id: '2', itemId: '3', itemName: 'Vaccino Trivalente Gatto', type: 'out', quantity: 1, date: new Date(Date.now() - 2 * 86400000).toISOString(), reason: 'Vaccinazione Micio (gatto)', performedBy: 'Dr. Bianchi', notes: 'Primo vaccino cucciolo' },
      { id: '3', itemId: '5', itemName: 'Siringhe 1ml Sterili', type: 'in', quantity: 500, date: new Date(Date.now() - 15 * 86400000).toISOString(), reason: 'Rifornimento', performedBy: 'Receptionist', notes: 'Ordine fornitore BD Medical' },
      { id: '4', itemId: '7', itemName: 'Antiparassitario Spot-On Cane', type: 'out', quantity: 5, date: new Date(Date.now() - 3 * 86400000).toISOString(), reason: 'Vendita diretta', performedBy: 'Receptionist', notes: 'Vendita a proprietari' },
      { id: '5', itemId: '2', itemName: 'Vaccino Antirabbica', type: 'out', quantity: 1, date: new Date(Date.now() - 5 * 86400000).toISOString(), reason: 'Vaccinazione Rex (cane)', performedBy: 'Dr. Rossi', notes: 'Certificato per viaggio' },
      { id: '6', itemId: '9', itemName: 'Test FeLV/FIV', type: 'out', quantity: 1, date: new Date(Date.now() - 7 * 86400000).toISOString(), reason: 'Test diagnostico', performedBy: 'Dr. Verdi', notes: 'Test su gatto randagio' },
      { id: '7', itemId: '1', itemName: 'Vaccino Polivalente Cane', type: 'in', quantity: 20, date: new Date(Date.now() - 30 * 86400000).toISOString(), reason: 'Rifornimento', performedBy: 'Receptionist', notes: 'Ordine MSD' },
      { id: '8', itemId: '4', itemName: 'Vaccino Leucemia Felina', type: 'expired', quantity: 2, date: new Date(Date.now() - 10 * 86400000).toISOString(), reason: 'Scadenza', performedBy: 'Dr. Bianchi', notes: 'Lotto scaduto smaltito' },
    ];

    setItems(demoItems);
    setMovements(demoMovements);
    setLoading(false);
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
        <Button variant="outline" onClick={() => alert('Generazione report Excel... (Demo)')}>
          <Download className="h-4 w-4 mr-1" /> Esporta Excel
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
                          <Button size="sm" variant="outline" className="text-green-600" onClick={() => { setSelectedItem(item); setShowMovement(true); }}>
                            <Plus className="h-3 w-3 mr-1" /> Carico
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => { setSelectedItem(item); setShowMovement(true); }}>
                            <Minus className="h-3 w-3 mr-1" /> Scarico
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
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
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
                      <Button size="sm" variant="outline">
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

      {/* Modals placeholders */}
      {showNewItem && (
        <Dialog open={showNewItem} onOpenChange={setShowNewItem}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Articolo Stock</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nome articolo..." />
              <select className="w-full border rounded px-3 py-2">
                <option value="vaccino">Vaccino</option>
                <option value="farmaco">Farmaco</option>
                <option value="materiale">Materiale</option>
                <option value="diagnostico">Diagnostico</option>
              </select>
              <Input type="number" placeholder="Quantità iniziale..." />
              <Input type="number" placeholder="Soglia minima..." />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewItem(false)}>Annulla</Button>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => { alert('Articolo creato! (Demo)'); setShowNewItem(false); }}>
                Crea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
