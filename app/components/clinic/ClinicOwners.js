'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import BackToDashboard from '@/app/components/shared/BackToDashboard';
import api from '@/app/lib/api';
import {
  User, Phone, Mail, PawPrint, Search, Plus, Eye, ChevronRight, UserPlus, Calendar,
  Dog, Cat, MapPin, MessageCircle, TrendingUp, AlertTriangle, Star, Award, Target, Euro
} from 'lucide-react';

// Mini CRM: Etichette e scoring clienti
const CLIENT_LABELS = {
  active: { label: 'Attivo', color: 'bg-green-100 text-green-700', icon: '✓' },
  highrisk: { label: 'Alto Rischio', color: 'bg-red-100 text-red-700', icon: '⚠️' },
  promoter: { label: 'Promoter', color: 'bg-purple-100 text-purple-700', icon: '⭐' },
  vip: { label: 'VIP', color: 'bg-amber-100 text-amber-700', icon: '👑' },
  inactive: { label: 'Inattivo', color: 'bg-gray-100 text-gray-600', icon: '○' },
};

// Funzione per calcolare il punteggio relazione (demo)
const calculateRelationshipScore = (owner) => {
  // Demo: score basato su visite recenti, pagamenti, recensioni
  const baseScore = 50;
  const visitBonus = Math.min((owner.totalVisits || 0) * 5, 30);
  const spendingBonus = Math.min((owner.lifetimeValue || 0) / 100, 20);
  return Math.min(baseScore + visitBonus + spendingBonus, 100);
};

function ClinicOwners({ owners, onRefresh, onNavigate, pets = [], onOpenPet, initialOwner, onClearInitialOwner }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [labelFilter, setLabelFilter] = useState('all');
  
  // Demo data: Aggiungi etichette e metriche CRM ai proprietari (memoized)
  const enrichedOwners = useMemo(() => {
    return owners.map((owner, index) => ({
      ...owner,
      label: owner.label || (['active', 'promoter', 'highrisk', 'vip', 'inactive'][index % 5]),
      totalVisits: owner.totalVisits || (index * 3 + 5),
      lifetimeValue: owner.lifetimeValue || (index * 300 + 500),
      lastVisit: owner.lastVisit || new Date(Date.now() - (index * 10 + 5) * 86400000).toISOString(),
    }));
  }, [owners]);
  
  // Apri automaticamente il proprietario se viene passato da un altro componente
  useEffect(() => {
    if (initialOwner) {
      openOwnerDetails(initialOwner);
      if (onClearInitialOwner) onClearInitialOwner();
    }
  }, [initialOwner]);
  
  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('owners', formData); setShowDialog(false); onRefresh(); } catch (error) { alert(error.message); } };
  
  const openOwnerDetails = (owner) => {
    setSelectedOwner(owner);
    setShowDetailDialog(true);
  };
  
  const getOwnerPets = useCallback((ownerId) => {
    return pets.filter(p => p.ownerId === ownerId);
  }, [pets]);
  
  // Filtra i proprietari per la ricerca E per etichetta
  const filteredOwners = enrichedOwners.filter(owner => {
    // Filtro etichetta
    if (labelFilter !== 'all' && owner.label !== labelFilter) return false;
    
    // Filtro ricerca
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const ownerPets = getOwnerPets(owner.id);
    const petNames = ownerPets.map(p => p.name?.toLowerCase() || '').join(' ');
    return (
      owner.name?.toLowerCase().includes(query) ||
      owner.email?.toLowerCase().includes(query) ||
      owner.phone?.toLowerCase().includes(query) ||
      petNames.includes(query)
    );
  });
  
  const handlePetClick = (pet) => {
    if (onOpenPet) {
      setShowDetailDialog(false);
      onOpenPet(pet);
    }
  };
  
  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Proprietari</h2>
          <p className="text-gray-500 text-sm">Clienti della clinica - clicca per vedere i dettagli</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Aggiungi</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo proprietario</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
              <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
              <div><Label>Telefono</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
              <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* ========== MINI CRM: Filtri Etichette (NUOVO - PHASE 2) ========== */}
      <Card className="mb-6 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Mini CRM - Segmentazione Clienti</h3>
              <Badge className="bg-purple-100 text-purple-700 text-xs">✨ Nuovo</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLabelFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                labelFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tutti ({enrichedOwners.length})
            </button>
            {Object.entries(CLIENT_LABELS).map(([key, conf]) => {
              const count = enrichedOwners.filter(o => o.label === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setLabelFilter(labelFilter === key ? 'all' : key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                    labelFilter === key ? conf.color + ' ring-2 ring-purple-400' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{conf.icon}</span> {conf.label} ({count})
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Barra di ricerca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Cerca per nome, email, telefono o animale..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            {filteredOwners.length} risultat{filteredOwners.length === 1 ? 'o' : 'i'} per &quot;{searchQuery}&quot;
          </p>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOwners.length === 0 ? (
          <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><User className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>{searchQuery ? 'Nessun risultato trovato' : 'Nessun proprietario'}</p></CardContent></Card>
        ) : filteredOwners.map((owner) => {
          const ownerPets = getOwnerPets(owner.id);
          const labelInfo = CLIENT_LABELS[owner.label] || CLIENT_LABELS.active;
          const relationshipScore = calculateRelationshipScore(owner);
          
          return (
            <Card key={owner.id} className="cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all group" onClick={() => openOwnerDetails(owner)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{owner.name}</p>
                      <Badge className={`${labelInfo.color} text-xs shrink-0`}>
                        {labelInfo.icon} {labelInfo.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{owner.email}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
                </div>
                
                {/* Mini CRM Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Score</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <div className={`h-2 w-2 rounded-full ${relationshipScore >= 70 ? 'bg-green-500' : relationshipScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                      <p className="text-lg font-bold text-gray-700">{relationshipScore}</p>
                    </div>
                  </div>
                  <div className="text-center border-l border-r">
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>Visite</span>
                    </div>
                    <p className="text-lg font-bold text-gray-700">{owner.totalVisits}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                      <Euro className="h-3 w-3" />
                      <span>Valore</span>
                    </div>
                    <p className="text-lg font-bold text-gray-700">€{owner.lifetimeValue}</p>
                  </div>
                </div>
                
                {owner.phone && <p className="text-sm text-gray-500 mt-3 flex items-center gap-2"><Phone className="h-4 w-4" />{owner.phone}</p>}
                {ownerPets.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {ownerPets.slice(0, 3).map(pet => (
                      <Badge key={pet.id} variant="outline" className="text-xs">
                        {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'} {pet.name}
                      </Badge>
                    ))}
                    {ownerPets.length > 3 && <Badge variant="outline" className="text-xs">+{ownerPets.length - 3}</Badge>}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Detail Modal */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{selectedOwner?.name || 'Dettagli Proprietario'}</span>
                  {selectedOwner && CLIENT_LABELS[selectedOwner.label] && (
                    <Badge className={`${CLIENT_LABELS[selectedOwner.label].color} text-xs`}>
                      {CLIENT_LABELS[selectedOwner.label].icon} {CLIENT_LABELS[selectedOwner.label].label}
                    </Badge>
                  )}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>Scheda cliente completa</DialogDescription>
          </DialogHeader>
          
          {selectedOwner && (
            <div className="space-y-4 mt-4">
              {/* Mini CRM Dashboard */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4 text-purple-600" />
                    <h4 className="font-semibold text-purple-900 text-sm">CRM Insights</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="h-3 w-3 text-purple-600" />
                        <p className="text-xs text-gray-600">Relazione</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-700">{calculateRelationshipScore(selectedOwner)}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className={`h-1.5 rounded-full ${calculateRelationshipScore(selectedOwner) >= 70 ? 'bg-green-500' : calculateRelationshipScore(selectedOwner) >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${calculateRelationshipScore(selectedOwner)}%` }}></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Calendar className="h-3 w-3 text-blue-600" />
                        <p className="text-xs text-gray-600">Visite Tot.</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{selectedOwner.totalVisits || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Ultima: {new Date(selectedOwner.lastVisit).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Euro className="h-3 w-3 text-green-600" />
                        <p className="text-xs text-gray-600">Lifetime</p>
                      </div>
                      <p className="text-2xl font-bold text-green-700">€{selectedOwner.lifetimeValue || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Medio: €{Math.round((selectedOwner.lifetimeValue || 0) / (selectedOwner.totalVisits || 1))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Contatti */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{selectedOwner.email}</p>
                  </div>
                </div>
                {selectedOwner.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Telefono</p>
                      <p className="font-medium">{selectedOwner.phone}</p>
                    </div>
                  </div>
                )}
                {selectedOwner.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Indirizzo</p>
                      <p className="font-medium">{selectedOwner.address}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Animali del proprietario - Cliccabili */}
              {(() => {
                const ownerPets = getOwnerPets(selectedOwner.id);
                if (ownerPets.length === 0) return null;
                return (
                  <div>
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <PawPrint className="h-4 w-4" /> Animali ({ownerPets.length})
                    </p>
                    <div className="space-y-2">
                      {ownerPets.map(pet => (
                        <div 
                          key={pet.id} 
                          className="flex items-center gap-3 p-3 bg-coral-50 rounded-lg cursor-pointer hover:bg-coral-100 transition-colors"
                          onClick={() => handlePetClick(pet)}
                        >
                          <div className="h-10 w-10 bg-coral-100 rounded-full flex items-center justify-center">
                            {pet.species === 'dog' ? <Dog className="h-5 w-5 text-coral-600" /> : pet.species === 'cat' ? <Cat className="h-5 w-5 text-coral-600" /> : <PawPrint className="h-5 w-5 text-coral-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{pet.name}</p>
                            <p className="text-xs text-gray-500">{pet.breed || (pet.species === 'dog' ? 'Cane' : pet.species === 'cat' ? 'Gatto' : 'Altro')}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              
              {/* Data registrazione */}
              {selectedOwner.createdAt && (
                <p className="text-xs text-gray-400 text-center pt-2 border-t">
                  Cliente dal {new Date(selectedOwner.createdAt).toLocaleDateString('it-IT')}
                </p>
              )}
              
              {/* Quick Actions */}
              <div className="flex gap-2 pt-2 flex-wrap">
                <Button variant="outline" className="flex-1 min-w-[100px]" onClick={() => window.location.href = `mailto:${selectedOwner.email}`}>
                  <Mail className="h-4 w-4 mr-2" /> Email
                </Button>
                {selectedOwner.phone && (
                  <>
                    <Button variant="outline" className="flex-1 min-w-[100px]" onClick={() => window.location.href = `tel:${selectedOwner.phone}`}>
                      <Phone className="h-4 w-4 mr-2" /> Chiama
                    </Button>
                    <Button variant="outline" className="flex-1 min-w-[100px] text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => window.open(`https://wa.me/${selectedOwner.phone.replace(/\s+/g, '').replace(/^\+/, '')}`, '_blank')}>
                      <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClinicOwners;
