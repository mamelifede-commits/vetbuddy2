'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Droplet, Edit, FileText, Heart, PawPrint, Plus, Shield, Trash2, Upload, Weight } from 'lucide-react';
import api from '@/app/lib/api';
import { PetAvatar } from '@/app/components/shared/utils';

function OwnerPets({ pets, onRefresh, onOpenProfile }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', species: 'dog', breed: '', birthDate: '', weight: '', weightDate: new Date().toISOString().split('T')[0],
    microchip: '', sterilized: false, allergies: '', medications: '', notes: '',
    // Nuovi campi
    insurance: false, insuranceCompany: '', insurancePolicy: '',
    medicalHistory: '', currentConditions: '', chronicDiseases: '',
    weightHistory: [], // Array di { weight, date }
    diet: '', // Tipo di alimentazione
    dietNotes: '' // Note sull'alimentazione
  });

  // Listen for add pet event from welcome screen (new registration)
  useEffect(() => {
    const handleOpenAddPet = () => {
      setEditingPet(null);
      setFormData({ 
        name: '', species: 'dog', breed: '', birthDate: '', weight: '', weightDate: new Date().toISOString().split('T')[0],
        microchip: '', sterilized: false, allergies: '', medications: '', notes: '',
        insurance: false, insuranceCompany: '', insurancePolicy: '',
        medicalHistory: '', currentConditions: '', chronicDiseases: '',
        weightHistory: [], diet: '', dietNotes: ''
      });
      setShowDialog(true);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('vetbuddy_open_add_pet', handleOpenAddPet);
      return () => window.removeEventListener('vetbuddy_open_add_pet', handleOpenAddPet);
    }
  }, []);
  
  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    try {
      // Se c'è un peso, aggiungilo alla history
      const dataToSubmit = { ...formData };
      delete dataToSubmit.photoFile; // Non inviare il file direttamente
      
      if (formData.weight && formData.weightDate) {
        dataToSubmit.weightHistory = [
          ...(formData.weightHistory || []),
          { weight: parseFloat(formData.weight), date: formData.weightDate, addedAt: new Date().toISOString() }
        ];
      }
      
      let savedPet;
      if (editingPet) {
        savedPet = await api.put(`pets/${editingPet.id}`, dataToSubmit);
      } else {
        savedPet = await api.post('pets', dataToSubmit);
      }
      
      // Upload foto se presente (dopo aver salvato il pet per avere l'ID)
      if (formData.photoFile && savedPet?.id) {
        const photoFormData = new FormData();
        photoFormData.append('photo', formData.photoFile);
        photoFormData.append('petId', savedPet.id);
        
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/pets/photo`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${api.getToken()}` },
            body: photoFormData
          });
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
        }
      }
      
      setShowDialog(false);
      setEditingPet(null);
      resetForm();
      onRefresh(); 
    } catch (error) { alert(error.message); } 
  };

  const resetForm = () => {
    setFormData({ 
      name: '', species: 'dog', breed: '', birthDate: '', weight: '', weightDate: new Date().toISOString().split('T')[0],
      microchip: '', sterilized: false, allergies: '', medications: '', notes: '',
      insurance: false, insuranceCompany: '', insurancePolicy: '',
      medicalHistory: '', currentConditions: '', chronicDiseases: '',
      weightHistory: [],
      diet: '', dietNotes: '',
      photoUrl: null, photoFile: null
    });
  };

  const handleEdit = (pet, e) => {
    e?.stopPropagation();
    setEditingPet(pet);
    setFormData({
      name: pet.name || '',
      species: pet.species || 'dog',
      breed: pet.breed || '',
      birthDate: pet.birthDate || '',
      weight: pet.weight || '',
      weightDate: new Date().toISOString().split('T')[0],
      microchip: pet.microchip || '',
      sterilized: pet.sterilized || false,
      allergies: pet.allergies || '',
      medications: pet.medications || '',
      notes: pet.notes || '',
      insurance: pet.insurance || false,
      insuranceCompany: pet.insuranceCompany || '',
      insurancePolicy: pet.insurancePolicy || '',
      medicalHistory: pet.medicalHistory || '',
      currentConditions: pet.currentConditions || '',
      chronicDiseases: pet.chronicDiseases || '',
      weightHistory: pet.weightHistory || [],
      diet: pet.diet || '',
      dietNotes: pet.dietNotes || ''
    });
    setShowDialog(true);
  };

  const handleDelete = async (petId, e) => {
    e?.stopPropagation();
    if (!confirm('Sei sicuro di voler eliminare questo animale?')) return;
    try {
      await api.delete(`pets/${petId}`);
      onRefresh();
    } catch (error) {
      alert(error.message);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years < 1) return `${months + (months < 0 ? 12 : 0)} mesi`;
    return `${years} ann${years === 1 ? 'o' : 'i'}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">I miei animali</h2>
          <p className="text-gray-500 text-sm">Gestisci i profili e la cartella clinica dei tuoi amici</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingPet(null); resetForm(); } }}>
          <DialogTrigger asChild><Button className="bg-blue-500 hover:bg-blue-600"><Plus className="h-4 w-4 mr-2" />Aggiungi animale</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPet ? 'Modifica animale' : 'Nuovo animale'}</DialogTitle>
              <DialogDescription>{editingPet ? 'Modifica i dati del tuo animale' : 'Inserisci i dati del tuo animale'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Sezione Foto */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Camera className="h-4 w-4" /> Foto</h4>
                <div className="flex items-center gap-6">
                  <PetAvatar pet={{ ...formData, photoUrl: formData.photoUrl }} size="lg" />
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      id="pet-photo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 20 * 1024 * 1024) {
                          alert('File troppo grande. Massimo 20MB.');
                          return;
                        }
                        // Preview immediately
                        const reader = new FileReader();
                        reader.onload = () => setFormData({...formData, photoUrl: reader.result, photoFile: file });
                        reader.readAsDataURL(file);
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('pet-photo-upload').click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      {formData.photoUrl ? 'Cambia foto' : 'Carica foto'}
                    </Button>
                    {formData.photoUrl && (
                      <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => setFormData({...formData, photoUrl: null, photoFile: null })}>
                        <Trash2 className="h-4 w-4 mr-1" /> Rimuovi
                      </Button>
                    )}
                    <p className="text-xs text-gray-500">JPG, PNG, WebP o GIF. Max 20MB.</p>
                    {!formData.photoUrl && (
                      <p className="text-xs text-gray-400">Se non carichi una foto, verrà mostrata l'icona della specie</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sezione Dati Base */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><PawPrint className="h-4 w-4" /> Dati Generali</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Nome *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
                  <div><Label>Specie</Label><Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dog">🐕 Cane</SelectItem><SelectItem value="cat">🐱 Gatto</SelectItem><SelectItem value="horse">🐴 Cavallo</SelectItem><SelectItem value="bird">🦜 Uccello</SelectItem><SelectItem value="rabbit">🐰 Coniglio</SelectItem><SelectItem value="hamster">🐹 Criceto</SelectItem><SelectItem value="fish">🐠 Pesce</SelectItem><SelectItem value="reptile">🦎 Rettile</SelectItem><SelectItem value="other">🐾 Altro</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Razza</Label><Input value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} placeholder="Es. Labrador" /></div>
                  <div><Label>Data di nascita</Label><Input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} /></div>
                </div>
                <div><Label>Microchip</Label><Input value={formData.microchip} onChange={(e) => setFormData({...formData, microchip: e.target.value})} placeholder="Numero microchip" /></div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Switch checked={formData.sterilized} onCheckedChange={(v) => setFormData({...formData, sterilized: v})} />
                  <Label>Sterilizzato/a</Label>
                </div>
              </div>

              {/* Sezione Peso con Data */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Weight className="h-4 w-4" /> Peso Corporeo</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Peso attuale (kg)</Label><Input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} placeholder="Es. 12.5" /></div>
                  <div><Label>Data pesatura</Label><Input type="date" value={formData.weightDate} onChange={(e) => setFormData({...formData, weightDate: e.target.value})} /></div>
                </div>
                {/* Storico Pesi */}
                {formData.weightHistory && formData.weightHistory.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-700 mb-2">📊 Storico Pesi</p>
                    <div className="space-y-1">
                      {formData.weightHistory.slice(-5).reverse().map((w, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-600">{new Date(w.date).toLocaleDateString('it-IT')}</span>
                          <span className="font-medium">{w.weight} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sezione Assicurazione */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Shield className="h-4 w-4" /> Assicurazione</h4>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Switch checked={formData.insurance} onCheckedChange={(v) => setFormData({...formData, insurance: v})} />
                  <Label>L'animale ha un'assicurazione sanitaria</Label>
                </div>
                {formData.insurance && (
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Compagnia assicurativa</Label><Input value={formData.insuranceCompany} onChange={(e) => setFormData({...formData, insuranceCompany: e.target.value})} placeholder="Es. Sara Assicurazioni" /></div>
                    <div><Label>Numero polizza</Label><Input value={formData.insurancePolicy} onChange={(e) => setFormData({...formData, insurancePolicy: e.target.value})} placeholder="Es. POL-123456" /></div>
                  </div>
                )}
              </div>

              {/* Sezione Storia Medica */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Heart className="h-4 w-4" /> Storia Medica (utile per il veterinario)</h4>
                <div><Label>Patologie croniche / Condizioni note</Label><Textarea value={formData.chronicDiseases} onChange={(e) => setFormData({...formData, chronicDiseases: e.target.value})} placeholder="Es. Diabete, problemi cardiaci, displasia, epilessia..." rows={2} /></div>
                <div><Label>Condizioni attuali</Label><Textarea value={formData.currentConditions} onChange={(e) => setFormData({...formData, currentConditions: e.target.value})} placeholder="Es. In cura per dermatite, zoppica dalla zampa destra..." rows={2} /></div>
                <div><Label>Allergie note</Label><Input value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} placeholder="Es. Pollo, antibiotici, punture di insetti..." /></div>
                <div><Label>Farmaci attuali</Label><Textarea value={formData.medications} onChange={(e) => setFormData({...formData, medications: e.target.value})} placeholder="Es. Apoquel 16mg 1x/giorno, insulina 2x/giorno..." rows={2} /></div>
                <div><Label>Storia medica generale</Label><Textarea value={formData.medicalHistory} onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})} placeholder="Es. Intervento chirurgico nel 2023 per rimozione corpo estraneo, vaccinazioni regolari..." rows={3} /></div>
              </div>

              {/* Sezione Alimentazione */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Droplet className="h-4 w-4" /> Alimentazione</h4>
                <div>
                  <Label>Tipo di alimentazione</Label>
                  <Select value={formData.diet || 'non_specificato'} onValueChange={(v) => setFormData({...formData, diet: v === 'non_specificato' ? '' : v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo alimentazione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="non_specificato">Non specificato</SelectItem>
                      <SelectItem value="crocchette">🥣 Crocchette (secco)</SelectItem>
                      <SelectItem value="umido">🥫 Umido (scatolette)</SelectItem>
                      <SelectItem value="misto">🍽️ Misto (secco + umido)</SelectItem>
                      <SelectItem value="barf">🥩 BARF (carne cruda)</SelectItem>
                      <SelectItem value="casalinga">🍳 Dieta casalinga</SelectItem>
                      <SelectItem value="veterinaria">💊 Dieta veterinaria/terapeutica</SelectItem>
                      <SelectItem value="altro">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Note alimentazione</Label>
                  <Textarea value={formData.dietNotes} onChange={(e) => setFormData({...formData, dietNotes: e.target.value})} placeholder="Es. Marca crocchette, frequenza pasti, intolleranze alimentari..." rows={2} />
                </div>
              </div>

              {/* Sezione Note */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4" /> Note Comportamentali</h4>
                <div><Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Es. Timoroso dal veterinario, aggressivo con altri cani, ama i biscotti..." rows={2} /></div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowDialog(false); setEditingPet(null); resetForm(); }}>Annulla</Button>
                <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600">{editingPet ? 'Salva modifiche' : 'Aggiungi animale'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center text-gray-500">
              <PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Nessun animale registrato</p>
              <p className="text-sm mt-2">Aggiungi il tuo primo animale per iniziare</p>
            </CardContent>
          </Card>
        ) : pets.map((pet) => (
          <Card key={pet.id} className="hover:shadow-md transition-shadow group cursor-pointer" onClick={() => onOpenProfile?.(pet.id)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <PetAvatar pet={pet} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg">{pet.name}</p>
                  <p className="text-sm text-gray-500">{pet.breed || (pet.species === 'dog' ? 'Cane' : pet.species === 'cat' ? 'Gatto' : 'Animale')}</p>
                  {pet.birthDate && <p className="text-xs text-gray-400 mt-1">{calculateAge(pet.birthDate)}</p>}
                  {pet.weight && <p className="text-xs text-gray-400">{pet.weight} kg</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pet.sterilized && <Badge variant="outline" className="text-xs text-green-600 border-green-300">Sterilizzato</Badge>}
                    {pet.microchip && <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">Microchip</Badge>}
                    {pet.allergies && <Badge variant="outline" className="text-xs text-red-600 border-red-300">Allergie</Badge>}
                    {pet.insurance && <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">Assicurato</Badge>}
                    {(pet.chronicDiseases || pet.currentConditions) && <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">Patologie</Badge>}
                  </div>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => handleEdit(pet, e)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => handleDelete(pet.id, e)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==================== PET PROFILE (Cartella Clinica) ====================

export default OwnerPets;
