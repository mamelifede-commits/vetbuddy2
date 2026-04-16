'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, Loader2, Pill, Plus,
  Search, Send, Trash2, AlertCircle, PawPrint, Stethoscope, ClipboardList, Shield, Info
} from 'lucide-react';
import api from '@/app/lib/api';
import { REVComplianceBanner } from './ClinicREVSettings';

const ROUTES = [
  { value: 'orale', label: 'Orale' },
  { value: 'parenterale_im', label: 'Parenterale (IM)' },
  { value: 'parenterale_sc', label: 'Parenterale (SC)' },
  { value: 'parenterale_iv', label: 'Parenterale (IV)' },
  { value: 'topica', label: 'Topica' },
  { value: 'oftalmica', label: 'Oftalmica' },
  { value: 'auricolare', label: 'Auricolare' },
  { value: 'rettale', label: 'Rettale' },
  { value: 'inalatoria', label: 'Inalatoria' },
  { value: 'transdermica', label: 'Transdermica' },
];

const UNITS = [
  'compresse', 'capsule', 'ml', 'mg', 'g', 'fiale', 'bustine',
  'gocce', 'pipette', 'confezioni', 'siringhe', 'flaconi'
];

function PrescriptionWizard({ user, pets = [], owners = [], revConfig, onCreated, onCancel }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [petSearch, setPetSearch] = useState('');

  const [form, setForm] = useState({
    petId: '', petName: '', ownerId: '', ownerName: '',
    veterinarianUserId: user?.id || '', veterinarianName: user?.name || user?.clinicName || '',
    prescriptionType: 'standard',
    diagnosisNote: '', dosageInstructions: '', treatmentDuration: '',
    items: []
  });

  const [newItem, setNewItem] = useState({
    productName: '', productCode: '', aicCode: '',
    quantity: 1, unit: 'compresse', posology: '',
    routeOfAdministration: 'orale', notes: ''
  });

  // Step 1: Select patient
  const filteredPets = pets.filter(p => {
    if (!petSearch) return true;
    const q = petSearch.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.species?.toLowerCase().includes(q) || p.breed?.toLowerCase().includes(q);
  });

  const selectPet = (pet) => {
    const owner = owners.find(o => o.id === pet.ownerId);
    setForm(f => ({
      ...f,
      petId: pet.id,
      petName: pet.name,
      ownerId: pet.ownerId || '',
      ownerName: owner?.name || pet.ownerName || ''
    }));
  };

  // Step 2: Add drugs
  const addItem = () => {
    if (!newItem.productName.trim()) return;
    setForm(f => ({ ...f, items: [...f.items, { ...newItem, id: Date.now().toString() }] }));
    setNewItem({ productName: '', productCode: '', aicCode: '', quantity: 1, unit: 'compresse', posology: '', routeOfAdministration: 'orale', notes: '' });
  };

  const removeItem = (idx) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  // Step 4: Save
  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await api.post('prescriptions', form);
      onCreated(result);
    } catch (err) {
      setError(err.message || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!form.petId;
    if (step === 2) return form.items.length > 0;
    if (step === 3) return !!form.diagnosisNote.trim();
    return true;
  };

  const steps = [
    { num: 1, label: 'Paziente', icon: PawPrint },
    { num: 2, label: 'Farmaci', icon: Pill },
    { num: 3, label: 'Diagnosi', icon: Stethoscope },
    { num: 4, label: 'Riepilogo', icon: ClipboardList }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}><ArrowLeft className="h-4 w-4 mr-1" />Indietro</Button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Prepara Prescrizione Elettronica</h2>
            <p className="text-sm text-gray-500">Step {step} di 4</p>
          </div>
        </div>
      </div>

      {/* Compliance info */}
      <REVComplianceBanner variant="compact" />

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                isActive ? 'bg-emerald-600 text-white' :
                isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-gray-300 mx-1" />}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {/* STEP 1: Paziente */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><PawPrint className="h-5 w-5 text-emerald-600" />Seleziona Paziente</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Cerca per nome, specie, razza..." className="pl-10"
                  value={petSearch} onChange={(e) => setPetSearch(e.target.value)} />
              </div>

              {form.petId && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-emerald-800">✅ Selezionato: {form.petName}</p>
                    <p className="text-sm text-emerald-600">Proprietario: {form.ownerName}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setForm(f => ({ ...f, petId: '', petName: '', ownerId: '', ownerName: '' }))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {filteredPets.map(pet => {
                  const owner = owners.find(o => o.id === pet.ownerId);
                  return (
                    <div key={pet.id} onClick={() => selectPet(pet)}
                      className={`p-3 border rounded-lg cursor-pointer transition hover:border-emerald-400 hover:bg-emerald-50 ${
                        form.petId === pet.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">🐾 {pet.name}</p>
                          <p className="text-xs text-gray-500">{pet.species} {pet.breed ? `— ${pet.breed}` : ''} {pet.microchip ? `| Chip: ${pet.microchip}` : ''}</p>
                        </div>
                        <span className="text-xs text-gray-400">{owner?.name || pet.ownerName || ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Farmaci */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Pill className="h-5 w-5 text-emerald-600" />Aggiungi Farmaci</h3>

              {/* Current items */}
              {form.items.length > 0 && (
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-emerald-800">💊 {item.productName}</p>
                        <p className="text-xs text-emerald-600">{item.quantity} {item.unit} — {item.posology} — Via: {item.routeOfAdministration}</p>
                        {item.aicCode && <p className="text-xs text-gray-400">AIC: {item.aicCode}</p>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new item form */}
              <div className="p-4 bg-gray-50 border rounded-lg space-y-3">
                <p className="text-sm font-medium text-gray-600">Nuovo farmaco:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Nome Farmaco *</Label>
                    <Input placeholder="Es. Amoxicillina 250mg" value={newItem.productName}
                      onChange={e => setNewItem(n => ({ ...n, productName: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Codice AIC (opzionale)</Label>
                    <Input placeholder="Es. 012345678" value={newItem.aicCode}
                      onChange={e => setNewItem(n => ({ ...n, aicCode: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Quantità *</Label>
                      <Input type="number" min="1" value={newItem.quantity}
                        onChange={e => setNewItem(n => ({ ...n, quantity: parseInt(e.target.value) || 1 }))} />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Unità</Label>
                      <select className="w-full h-10 px-3 border rounded-md text-sm bg-white"
                        value={newItem.unit} onChange={e => setNewItem(n => ({ ...n, unit: e.target.value }))}>
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Via di somministrazione</Label>
                    <select className="w-full h-10 px-3 border rounded-md text-sm bg-white"
                      value={newItem.routeOfAdministration} onChange={e => setNewItem(n => ({ ...n, routeOfAdministration: e.target.value }))}>
                      {ROUTES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Posologia *</Label>
                  <Input placeholder="Es. 1 compressa ogni 12 ore per 7 giorni" value={newItem.posology}
                    onChange={e => setNewItem(n => ({ ...n, posology: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Note (opzionale)</Label>
                  <Input placeholder="Es. Somministrare a stomaco pieno" value={newItem.notes}
                    onChange={e => setNewItem(n => ({ ...n, notes: e.target.value }))} />
                </div>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={addItem}
                  disabled={!newItem.productName.trim() || !newItem.posology.trim()}>
                  <Plus className="h-4 w-4 mr-1" />Aggiungi Farmaco
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Diagnosi e Posologia */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Stethoscope className="h-5 w-5 text-emerald-600" />Diagnosi e Istruzioni</h3>
              <div>
                <Label>Diagnosi / Note Cliniche *</Label>
                <Textarea className="mt-1" rows={3} placeholder="Descrivi la diagnosi e il motivo della prescrizione..."
                  value={form.diagnosisNote} onChange={e => setForm(f => ({ ...f, diagnosisNote: e.target.value }))} />
              </div>
              <div>
                <Label>Istruzioni Generali di Dosaggio</Label>
                <Textarea className="mt-1" rows={2} placeholder="Istruzioni aggiuntive sulla somministrazione..."
                  value={form.dosageInstructions} onChange={e => setForm(f => ({ ...f, dosageInstructions: e.target.value }))} />
              </div>
              <div>
                <Label>Durata del Trattamento</Label>
                <Input className="mt-1" placeholder="Es. 7 giorni, 2 settimane, fino a guarigione..."
                  value={form.treatmentDuration} onChange={e => setForm(f => ({ ...f, treatmentDuration: e.target.value }))} />
              </div>
              <div>
                <Label>Tipo Prescrizione</Label>
                <select className="w-full h-10 px-3 border rounded-md text-sm bg-white mt-1"
                  value={form.prescriptionType} onChange={e => setForm(f => ({ ...f, prescriptionType: e.target.value }))}>
                  <option value="standard">Standard</option>
                  <option value="urgent">Urgente</option>
                  <option value="renewal">Rinnovo</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: Riepilogo */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-emerald-600" />Riepilogo Prescrizione</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">🐾 Paziente</h4>
                  <p className="font-medium">{form.petName}</p>
                  <p className="text-sm text-gray-500">Proprietario: {form.ownerName}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">👨‍⚕️ Veterinario</h4>
                  <p className="font-medium">{form.veterinarianName}</p>
                  <p className="text-sm text-gray-500">Tipo: {form.prescriptionType}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">🩺 Diagnosi</h4>
                <p className="text-sm">{form.diagnosisNote}</p>
                {form.dosageInstructions && <p className="text-sm text-gray-500 mt-1">Istruzioni: {form.dosageInstructions}</p>}
                {form.treatmentDuration && <p className="text-sm text-gray-500">Durata: {form.treatmentDuration}</p>}
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h4 className="text-sm font-semibold text-emerald-700 mb-2">💊 Farmaci ({form.items.length})</h4>
                {form.items.map((item, idx) => (
                  <div key={idx} className="py-2 border-b border-emerald-100 last:border-0">
                    <p className="font-medium text-emerald-800">{item.productName}</p>
                    <p className="text-xs text-emerald-600">{item.quantity} {item.unit} — {item.posology} — Via: {item.routeOfAdministration}</p>
                  </div>
                ))}
              </div>

              {revConfig?.manualMode && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800">Modalità guidata/manuale</p>
                      <p className="text-sm text-amber-600">La prescrizione verrà salvata come bozza. Dovrai emettere la ricetta sul portale Vetinfo e registrare manualmente il numero ricetta e il PIN.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nota compliance riepilogo */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-2">
                <Info className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500">Solo il medico veterinario può completare l&apos;emissione ufficiale della REV. VetBuddy ti guida nel processo e ti fornisce la struttura pronta.</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 inline mr-1" />{error}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : onCancel()}>
          <ArrowLeft className="h-4 w-4 mr-1" />{step > 1 ? 'Indietro' : 'Annulla'}
        </Button>
        <div className="flex gap-2">
          {step < 4 ? (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Avanti<ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvataggio...</> : <><ClipboardList className="h-4 w-4 mr-2" />Salva Bozza Prescrizione</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrescriptionWizard;
