'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import BackToDashboard from '@/app/components/shared/BackToDashboard';
import api from '@/app/lib/api';
import {
  User, Phone, Mail, PawPrint, Search, Plus, Eye, ChevronRight, UserPlus, Calendar
} from 'lucide-react';

function ClinicOwners({ owners, onRefresh, onNavigate, pets = [], onOpenPet, initialOwner, onClearInitialOwner }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
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
  
  const getOwnerPets = (ownerId) => {
    return pets.filter(p => p.ownerId === ownerId);
  };
  
  // Filtra i proprietari per la ricerca
  const filteredOwners = owners.filter(owner => {
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
            {filteredOwners.length} risultat{filteredOwners.length === 1 ? 'o' : 'i'} per "{searchQuery}"
          </p>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOwners.length === 0 ? (
          <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><User className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>{searchQuery ? 'Nessun risultato trovato' : 'Nessun proprietario'}</p></CardContent></Card>
        ) : filteredOwners.map((owner) => {
          const ownerPets = getOwnerPets(owner.id);
          return (
            <Card key={owner.id} className="cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group" onClick={() => openOwnerDetails(owner)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{owner.name}</p>
                    <p className="text-sm text-gray-500">{owner.email}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
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
              {selectedOwner?.name || 'Dettagli Proprietario'}
            </DialogTitle>
            <DialogDescription>Scheda cliente</DialogDescription>
          </DialogHeader>
          
          {selectedOwner && (
            <div className="space-y-4 mt-4">
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
