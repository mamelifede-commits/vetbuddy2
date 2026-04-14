'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Clock, Euro, Gift, Heart, Plus, RefreshCw, Search, Sparkles, Star, User, UserPlus, X } from 'lucide-react';
import api from '@/app/lib/api';

function ClinicRewardsManagement({ user, owners = [] }) {
  const [activeTab, setActiveTab] = useState('types');
  const [rewardTypes, setRewardTypes] = useState([]);
  const [assignedRewards, setAssignedRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTypeDialog, setShowNewTypeDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newType, setNewType] = useState({
    name: '',
    description: '',
    rewardType: 'discount_percent',
    value: 10,
    icon: 'Gift'
  });
  
  const [assignForm, setAssignForm] = useState({
    ownerId: '',
    rewardTypeId: '',
    reason: '',
    expiresAt: ''
  });

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const [types, assigned] = await Promise.all([
        api.get('rewards/types'),
        api.get('rewards/assigned')
      ]);
      setRewardTypes(types || []);
      setAssignedRewards(assigned || []);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateType = async () => {
    if (!newType.name) {
      alert('Inserisci un nome per il premio');
      return;
    }
    try {
      await api.post('rewards/types', newType);
      setShowNewTypeDialog(false);
      setNewType({ name: '', description: '', rewardType: 'discount_percent', value: 10, icon: 'Gift' });
      loadRewards();
      alert('✅ Tipo premio creato con successo!');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  const handleAssignReward = async () => {
    if (!assignForm.ownerId || !assignForm.rewardTypeId) {
      alert('Seleziona proprietario e tipo premio');
      return;
    }
    try {
      await api.post('rewards/assign', assignForm);
      setShowAssignDialog(false);
      setAssignForm({ ownerId: '', rewardTypeId: '', reason: '', expiresAt: '' });
      setSelectedOwner(null);
      loadRewards();
      alert('✅ Premio assegnato! Il proprietario riceverà una notifica email.');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  const handleMarkUsed = async (rewardId) => {
    if (!confirm('Confermi che il proprietario ha utilizzato questo premio?')) return;
    try {
      await api.post('rewards/use', { rewardId });
      loadRewards();
      alert('✅ Premio segnato come utilizzato');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  const filteredOwners = owners.filter(o => 
    o.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rewardTypeOptions = [
    { value: 'discount_percent', label: 'Sconto %', icon: '🏷️' },
    { value: 'discount_fixed', label: 'Sconto €', icon: '💶' },
    { value: 'free_service', label: 'Servizio Gratis', icon: '🎁' },
    { value: 'free_product', label: 'Prodotto Gratis', icon: '🛍️' },
    { value: 'gift', label: 'Regalo/Bonus', icon: '🎀' }
  ];

  const iconOptions = ['Gift', 'Euro', 'Heart', 'Star', 'Sparkles'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-coral-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="h-7 w-7 text-amber-500" />
            Premi Fedeltà
          </h1>
          <p className="text-gray-500 mt-1">Gestisci e assegna premi ai tuoi clienti</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewTypeDialog(true)} className="bg-amber-500 hover:bg-amber-600">
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Tipo Premio
          </Button>
          <Button onClick={() => setShowAssignDialog(true)} variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
            <UserPlus className="h-4 w-4 mr-2" />
            Assegna Premio
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'types' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('types')}
            className={activeTab === 'types' ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Tipi di Premio ({rewardTypes.length})
          </Button>
          <Button 
            variant={activeTab === 'assigned' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('assigned')}
            className={activeTab === 'assigned' ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Premi Assegnati ({assignedRewards.length})
          </Button>
        </div>
        
        {/* Search by Code */}
        {activeTab === 'assigned' && (
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca per codice premio (es. ABC123)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                className="pl-10 font-mono uppercase tracking-wider"
              />
            </div>
          </div>
        )}
      </div>

      {/* Types Tab */}
      {activeTab === 'types' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewardTypes.length === 0 ? (
            <Card className="col-span-full text-center py-12 bg-gray-50">
              <CardContent>
                <Gift className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nessun tipo di premio</h3>
                <p className="text-gray-500 mb-4">Crea il tuo primo tipo di premio fedeltà</p>
                <Button onClick={() => setShowNewTypeDialog(true)} className="bg-amber-500 hover:bg-amber-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Crea Tipo Premio
                </Button>
              </CardContent>
            </Card>
          ) : (
            rewardTypes.map((type) => (
              <Card key={type.id} className="border-amber-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white">
                      <Gift className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{type.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {rewardTypeOptions.find(r => r.value === type.rewardType)?.label || type.rewardType}
                        {type.value ? ` - ${type.rewardType.includes('percent') ? `${type.value}%` : `€${type.value}`}` : ''}
                      </Badge>
                      {type.description && (
                        <p className="text-sm text-gray-500 mt-2">{type.description}</p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4 border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => {
                      setAssignForm({ ...assignForm, rewardTypeId: type.id });
                      setShowAssignDialog(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assegna a Cliente
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Assigned Tab */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          {assignedRewards.length === 0 ? (
            <Card className="text-center py-12 bg-gray-50">
              <CardContent>
                <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nessun premio assegnato</h3>
                <p className="text-gray-500">Assegna il tuo primo premio a un cliente</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {searchQuery && assignedRewards.filter(r => 
                r.redeemCode?.includes(searchQuery) || 
                r.ownerName?.toUpperCase().includes(searchQuery)
              ).length === 0 ? (
                <Card className="text-center py-12 bg-amber-50 border-amber-200">
                  <CardContent>
                    <Search className="h-12 w-12 mx-auto text-amber-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Nessun premio trovato</h3>
                    <p className="text-gray-500">Codice "<strong className="font-mono">{searchQuery}</strong>" non trovato</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {searchQuery && (
                    <p className="text-sm text-gray-500">
                      Risultati per "<span className="font-mono font-bold">{searchQuery}</span>"
                    </p>
                  )}
                  {assignedRewards
                    .filter(r => !searchQuery || r.redeemCode?.includes(searchQuery) || r.ownerName?.toUpperCase().includes(searchQuery))
                    .map((reward) => {
                      const isPending = reward.status === 'pending';
                      const isUsed = reward.status === 'used';
                      const isAvailable = reward.status === 'available';
                      
                      return (
                        <Card key={reward.id} className={`
                          ${isUsed ? 'opacity-60 bg-gray-50' : ''}
                          ${isPending ? 'border-2 border-amber-400 bg-amber-50 shadow-md' : ''}
                          ${searchQuery && reward.redeemCode?.includes(searchQuery) ? 'ring-2 ring-green-500' : ''}
                        `}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  isPending 
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white animate-pulse'
                                    : isAvailable 
                                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' 
                                      : 'bg-gray-300 text-gray-500'
                                }`}>
                                  {isUsed ? <CheckCircle className="h-5 w-5" /> : isPending ? <Clock className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium">{reward.ownerName}</span>
                                    <Badge variant={isAvailable ? 'default' : 'secondary'} className={`
                                      ${isAvailable ? 'bg-green-500' : ''}
                                      ${isPending ? 'bg-amber-500 text-white animate-pulse' : ''}
                                    `}>
                                      {isAvailable ? 'Disponibile' : isPending ? '⏳ DA CONFERMARE' : 'Utilizzato'}
                                    </Badge>
                                    {reward.redeemCode && (
                                      <Badge variant="outline" className={`font-mono tracking-wider ${searchQuery && reward.redeemCode?.includes(searchQuery) ? 'bg-green-100 border-green-500 text-green-700' : ''}`}>
                                        {reward.redeemCode}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">{reward.rewardName} - {reward.reason}</p>
                                  <p className="text-xs text-gray-400">
                                    Assegnato il {new Date(reward.createdAt).toLocaleDateString('it-IT')}
                                    {reward.redeemedAt && ` • Riscattato il ${new Date(reward.redeemedAt).toLocaleDateString('it-IT')}`}
                                    {reward.usedAt && ` • Confermato il ${new Date(reward.usedAt).toLocaleDateString('it-IT')}`}
                                  </p>
                                </div>
                              </div>
                              {(isAvailable || isPending) && (
                                <Button 
                                  variant={isPending ? 'default' : 'outline'}
                                  size="sm" 
                                  onClick={() => handleMarkUsed(reward.id)}
                                  className={isPending 
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'text-green-600 border-green-300 hover:bg-green-50'
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  {isPending ? 'Conferma Utilizzo' : 'Segna Usato'}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Create Type Dialog */}
      <Dialog open={showNewTypeDialog} onOpenChange={setShowNewTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-500" />
              Crea Nuovo Tipo Premio
            </DialogTitle>
            <DialogDescription>
              Definisci un nuovo tipo di premio che potrai assegnare ai clienti
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome Premio *</Label>
              <Input 
                value={newType.name}
                onChange={(e) => setNewType({...newType, name: e.target.value})}
                placeholder="Es: Sconto Fedeltà, Visita Omaggio..."
              />
            </div>
            
            <div>
              <Label>Tipo</Label>
              <Select value={newType.rewardType} onValueChange={(v) => setNewType({...newType, rewardType: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rewardTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(newType.rewardType === 'discount_percent' || newType.rewardType === 'discount_fixed') && (
              <div>
                <Label>Valore {newType.rewardType === 'discount_percent' ? '(%)' : '(€)'}</Label>
                <Input 
                  type="number"
                  value={newType.value}
                  onChange={(e) => setNewType({...newType, value: parseInt(e.target.value) || 0})}
                  placeholder={newType.rewardType === 'discount_percent' ? "10" : "20"}
                />
              </div>
            )}
            
            <div>
              <Label>Descrizione (opzionale)</Label>
              <Textarea 
                value={newType.description}
                onChange={(e) => setNewType({...newType, description: e.target.value})}
                placeholder="Descrivi il premio..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTypeDialog(false)}>Annulla</Button>
            <Button onClick={handleCreateType} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="h-4 w-4 mr-2" />
              Crea Premio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-amber-500" />
              Assegna Premio a Cliente
            </DialogTitle>
            <DialogDescription>
              Seleziona un cliente e un tipo di premio da assegnare
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Search Owner */}
            <div>
              <Label>Cerca Cliente *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nome o email..."
                />
              </div>
              {searchQuery && filteredOwners.length > 0 && (
                <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                  {filteredOwners.slice(0, 5).map((owner) => (
                    <button
                      key={owner.id}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                        assignForm.ownerId === owner.id ? 'bg-amber-50 border-l-4 border-amber-500' : ''
                      }`}
                      onClick={() => {
                        setAssignForm({...assignForm, ownerId: owner.id});
                        setSelectedOwner(owner);
                        setSearchQuery('');
                      }}
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">{owner.name}</p>
                        <p className="text-xs text-gray-500">{owner.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedOwner && (
                <div className="mt-2 p-2 bg-amber-50 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">{selectedOwner.name}</span>
                  <button 
                    className="ml-auto text-gray-400 hover:text-gray-600"
                    onClick={() => { setSelectedOwner(null); setAssignForm({...assignForm, ownerId: ''}); }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Select Reward Type */}
            <div>
              <Label>Tipo Premio *</Label>
              <Select value={assignForm.rewardTypeId} onValueChange={(v) => setAssignForm({...assignForm, rewardTypeId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un premio..." />
                </SelectTrigger>
                <SelectContent>
                  {rewardTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      🎁 {type.name} {type.value ? `(${type.rewardType.includes('percent') ? `${type.value}%` : `€${type.value}`})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {rewardTypes.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Nessun tipo premio disponibile. <button onClick={() => { setShowAssignDialog(false); setShowNewTypeDialog(true); }} className="underline">Creane uno</button>
                </p>
              )}
            </div>
            
            <div>
              <Label>Motivo (opzionale)</Label>
              <Input 
                value={assignForm.reason}
                onChange={(e) => setAssignForm({...assignForm, reason: e.target.value})}
                placeholder="Es: Cliente fedele, Compleanno pet..."
              />
            </div>
            
            <div>
              <Label>Data scadenza (opzionale)</Label>
              <Input 
                type="date"
                value={assignForm.expiresAt}
                onChange={(e) => setAssignForm({...assignForm, expiresAt: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAssignDialog(false); setSelectedOwner(null); setSearchQuery(''); }}>Annulla</Button>
            <Button onClick={handleAssignReward} className="bg-amber-500 hover:bg-amber-600" disabled={!assignForm.ownerId || !assignForm.rewardTypeId}>
              <Gift className="h-4 w-4 mr-2" />
              Assegna Premio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



export default ClinicRewardsManagement;
