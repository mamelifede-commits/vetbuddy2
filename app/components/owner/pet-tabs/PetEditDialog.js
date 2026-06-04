'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PawPrint, Weight, Shield, Heart, Droplet, FileText, Check, RefreshCw } from 'lucide-react';

export default function PetEditDialog({ open, onOpenChange, pet, onSave }) {
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: pet?.name || '', species: pet?.species || 'dog', breed: pet?.breed || '',
    birthDate: pet?.birthDate ? pet.birthDate.split('T')[0] : '',
    microchip: pet?.microchip || '', sterilized: pet?.sterilized || false,
    weight: pet?.weight || '', weightDate: pet?.weightDate ? pet.weightDate.split('T')[0] : '',
    weightHistory: pet?.weightHistory || [],
    insurance: pet?.insurance || false, insuranceCompany: pet?.insuranceCompany || '',
    insurancePolicy: pet?.insurancePolicy || '',
    chronicDiseases: pet?.chronicDiseases || '', currentConditions: pet?.currentConditions || '',
    allergies: Array.isArray(pet?.allergies) ? pet.allergies.join(', ') : (pet?.allergies || ''),
    medications: Array.isArray(pet?.medications) ? pet.medications.map(m => typeof m === 'object' ? m.name : m).join(', ') : (pet?.medications || ''),
    medicalHistory: pet?.medicalHistory || '',
    diet: pet?.diet || '', dietNotes: pet?.dietNotes || '', notes: pet?.notes || '',
  });

  const handleSave = async () => {
    setSaving(true);
    await onSave(editForm);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica dati di {pet?.name}</DialogTitle>
          <DialogDescription>Aggiorna le informazioni del tuo animale</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {/* Dati Generali */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2"><PawPrint className="h-4 w-4" /> Dati Generali</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nome *</Label><Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} /></div>
              <div>
                <Label>Specie</Label>
                <Select value={editForm.species} onValueChange={(v) => setEditForm({...editForm, species: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">🐕 Cane</SelectItem>
                    <SelectItem value="cat">🐱 Gatto</SelectItem>
                    <SelectItem value="horse">🐴 Cavallo</SelectItem>
                    <SelectItem value="bird">🦜 Uccello</SelectItem>
                    <SelectItem value="rabbit">🐰 Coniglio</SelectItem>
                    <SelectItem value="hamster">🐹 Criceto</SelectItem>
                    <SelectItem value="fish">🐠 Pesce</SelectItem>
                    <SelectItem value="reptile">🦎 Rettile</SelectItem>
                    <SelectItem value="other">🐾 Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Razza</Label><Input value={editForm.breed} onChange={(e) => setEditForm({...editForm, breed: e.target.value})} placeholder="Es. Golden Retriever" /></div>
              <div><Label>Data di nascita</Label><Input type="date" value={editForm.birthDate} onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})} /></div>
            </div>
            <div><Label>Microchip</Label><Input value={editForm.microchip} onChange={(e) => setEditForm({...editForm, microchip: e.target.value})} placeholder="Numero microchip" /></div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Switch checked={editForm.sterilized} onCheckedChange={(v) => setEditForm({...editForm, sterilized: v})} />
              <Label>Sterilizzato/a</Label>
            </div>
          </div>

          {/* Peso */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Weight className="h-4 w-4" /> Peso Corporeo</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Peso attuale (kg)</Label><Input type="number" step="0.1" value={editForm.weight} onChange={(e) => setEditForm({...editForm, weight: e.target.value})} placeholder="Es. 12.5" /></div>
              <div><Label>Data pesatura</Label><Input type="date" value={editForm.weightDate} onChange={(e) => setEditForm({...editForm, weightDate: e.target.value})} /></div>
            </div>
            {editForm.weightHistory && editForm.weightHistory.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-700 mb-2">📊 Storico Pesi</p>
                <div className="space-y-1">
                  {editForm.weightHistory.slice(-5).reverse().map((w, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{new Date(w.date).toLocaleDateString('it-IT')}</span>
                      <span className="font-medium">{w.weight} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Assicurazione */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Shield className="h-4 w-4" /> Assicurazione</h4>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Switch checked={editForm.insurance} onCheckedChange={(v) => setEditForm({...editForm, insurance: v})} />
              <Label>L&apos;animale ha un&apos;assicurazione sanitaria</Label>
            </div>
            {editForm.insurance && (
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Compagnia assicurativa</Label><Input value={editForm.insuranceCompany} onChange={(e) => setEditForm({...editForm, insuranceCompany: e.target.value})} placeholder="Es. Sara Assicurazioni" /></div>
                <div><Label>Numero polizza</Label><Input value={editForm.insurancePolicy} onChange={(e) => setEditForm({...editForm, insurancePolicy: e.target.value})} placeholder="Es. POL-123456" /></div>
              </div>
            )}
          </div>

          {/* Storia Medica */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Heart className="h-4 w-4" /> Storia Medica</h4>
            <div><Label>Patologie croniche</Label><Textarea value={editForm.chronicDiseases} onChange={(e) => setEditForm({...editForm, chronicDiseases: e.target.value})} placeholder="Es. Diabete, problemi cardiaci..." rows={2} /></div>
            <div><Label>Condizioni attuali</Label><Textarea value={editForm.currentConditions} onChange={(e) => setEditForm({...editForm, currentConditions: e.target.value})} placeholder="Es. In cura per dermatite..." rows={2} /></div>
            <div><Label>Allergie note</Label><Input value={editForm.allergies} onChange={(e) => setEditForm({...editForm, allergies: e.target.value})} placeholder="Es. Pollo, polline..." /></div>
            <div><Label>Farmaci attuali</Label><Textarea value={editForm.medications} onChange={(e) => setEditForm({...editForm, medications: e.target.value})} placeholder="Es. Apoquel 16mg 1x/giorno..." rows={2} /></div>
            <div><Label>Storia medica generale</Label><Textarea value={editForm.medicalHistory} onChange={(e) => setEditForm({...editForm, medicalHistory: e.target.value})} placeholder="Es. Intervento chirurgico nel 2023..." rows={2} /></div>
          </div>

          {/* Alimentazione */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Droplet className="h-4 w-4" /> Alimentazione</h4>
            <div>
              <Label>Tipo di alimentazione</Label>
              <Select value={editForm.diet || 'non_specificato'} onValueChange={(v) => setEditForm({...editForm, diet: v === 'non_specificato' ? '' : v})}>
                <SelectTrigger><SelectValue placeholder="Seleziona tipo alimentazione" /></SelectTrigger>
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
            <div><Label>Note alimentazione</Label><Textarea value={editForm.dietNotes} onChange={(e) => setEditForm({...editForm, dietNotes: e.target.value})} placeholder="Es. Marca crocchette, frequenza pasti..." rows={2} /></div>
          </div>

          {/* Note */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4" /> Note Comportamentali</h4>
            <div><Textarea value={editForm.notes} onChange={(e) => setEditForm({...editForm, notes: e.target.value})} placeholder="Es. Timoroso dal veterinario..." rows={2} /></div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleSave} disabled={saving}>
            {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
