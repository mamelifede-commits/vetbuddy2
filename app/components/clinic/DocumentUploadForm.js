'use client';

import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Mail, User, PawPrint, ClipboardList, Upload, Filter, FileCheck, Receipt } from 'lucide-react';
import api from '@/app/lib/api';

function DocumentUploadForm({ owners, pets, onSuccess }) {
  const [formData, setFormData] = useState({ type: 'prescrizione', ownerId: '', ownerEmail: '', petId: '', petName: '', title: '', file: null, fileName: '', fileType: '', notes: '', sendEmail: true, amount: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const docTypeOptions = [
    { value: 'prescrizione', label: 'Prescrizione medica', icon: FileText, color: 'text-purple-600' },
    { value: 'referto', label: 'Referto / Esami', icon: FileCheck, color: 'text-blue-600' },
    { value: 'fattura', label: 'Fattura', icon: Receipt, color: 'text-emerald-600' },
    { value: 'istruzioni', label: 'Istruzioni post-visita', icon: ClipboardList, color: 'text-green-600' },
    { value: 'foto', label: 'Foto / Immagine', icon: ImageIcon, color: 'text-pink-600' },
    { value: 'altro', label: 'Altro documento', icon: FileText, color: 'text-gray-600' },
  ];

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const allowedExtensions = '.pdf,.jpg,.jpeg,.png';

  // Filter pets by selected owner
  const ownerPets = formData.ownerId ? pets.filter(p => p.ownerId === formData.ownerId) : pets;

  const handleOwnerSelect = (ownerId) => {
    const owner = owners.find(o => o.id === ownerId);
    setFormData({ 
      ...formData, 
      ownerId, 
      ownerEmail: owner?.email || '',
      petId: '', 
      petName: '' 
    });
  };

  const handlePetSelect = (petId) => {
    const pet = pets.find(p => p.id === petId);
    setFormData({ ...formData, petId, petName: pet?.name || '' });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && allowedTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = () => { 
        const ext = file.name.split('.').pop().toLowerCase();
        setFormData({ 
          ...formData, 
          file: reader.result, 
          fileName: file.name, 
          fileType: file.type,
          title: formData.title || file.name.replace(/\.(pdf|jpg|jpeg|png)$/i, '') 
        }); 
      };
      reader.readAsDataURL(file);
    } else { 
      alert('Per favore seleziona un file PDF, JPG o PNG'); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) { alert('Seleziona un file (PDF, JPG o PNG)'); return; }
    if (formData.sendEmail && !formData.ownerEmail) { alert('Inserisci l\'email del proprietario per inviare il documento'); return; }
    setUploading(true);
    try { 
      await api.post('documents', { 
        name: formData.title, 
        type: formData.type, 
        content: formData.file, 
        fileName: formData.fileName,
        fileType: formData.fileType,
        petId: formData.petId,
        petName: formData.petName, 
        ownerId: formData.ownerId,
        ownerEmail: formData.ownerEmail, 
        notes: formData.notes, 
        sendEmail: formData.sendEmail,
        amount: formData.type === 'fattura' ? parseFloat(formData.amount) || 0 : null,
        status: 'bozza'
      }); 
      onSuccess?.(); 
    } catch (error) { alert(error.message); } finally { setUploading(false); }
  };

  const isImage = formData.fileType?.startsWith('image/');

  return (
    <><DialogHeader><DialogTitle>Carica documento</DialogTitle><DialogDescription>Seleziona proprietario e animale, poi carica il file. Verrà inviato via email con il PDF allegato.</DialogDescription></DialogHeader>
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <Label>Tipo documento</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {docTypeOptions.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData({...formData, type: opt.value})}
                className={`flex items-center gap-2 p-3 rounded-lg border text-left transition ${formData.type === opt.value ? 'border-coral-500 bg-coral-50' : 'border-gray-200 hover:border-coral-300'}`}
              >
                <Icon className={`h-4 w-4 ${opt.color}`} />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Owner & Pet Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Proprietario *</Label>
          {owners.length > 0 ? (
            <Select value={formData.ownerId} onValueChange={handleOwnerSelect}>
              <SelectTrigger><SelectValue placeholder="Seleziona proprietario" /></SelectTrigger>
              <SelectContent>
                {owners.map(owner => (
                  <SelectItem key={owner.id} value={owner.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      {owner.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input placeholder="Email proprietario" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} required />
          )}
        </div>
        <div>
          <Label>Animale</Label>
          {ownerPets.length > 0 ? (
            <Select value={formData.petId} onValueChange={handlePetSelect}>
              <SelectTrigger><SelectValue placeholder="Seleziona animale" /></SelectTrigger>
              <SelectContent>
                {ownerPets.map(pet => (
                  <SelectItem key={pet.id} value={pet.id}>
                    <div className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4 text-gray-500" />
                      {pet.name} ({pet.species || 'Animale'})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input placeholder="Nome animale" value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} />
          )}
        </div>
      </div>
      
      {/* Email (editable, pre-filled from owner selection) */}
      {formData.ownerId && (
        <div>
          <Label>Email destinatario</Label>
          <Input type="email" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} placeholder="email@esempio.com" />
          <p className="text-xs text-gray-500 mt-1">Pre-compilata dal profilo. Puoi modificarla se necessario.</p>
        </div>
      )}
      
      <div><Label>Titolo documento</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder={formData.type === 'fattura' ? 'Es: Fattura visita 12/02' : 'Es: Prescrizione antibiotico'} /></div>
      
      {formData.type === 'fattura' && (
        <div><Label>Importo (€) IVA esclusa</Label><Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" /></div>
      )}
      
      <div>
        <Label>File (PDF, JPG, PNG)</Label>
        <input type="file" accept={allowedExtensions} ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-coral-400 transition">
          {formData.fileName ? (
            <div className="space-y-2">
              {isImage && formData.file ? (
                <img src={formData.file} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
              ) : (
                <FileText className="h-8 w-8 mx-auto text-coral-600" />
              )}
              <div className="flex items-center justify-center gap-2 text-coral-600">
                <span className="font-medium">{formData.fileName}</span>
                <Badge variant="outline" className="text-xs">{isImage ? 'Immagine' : 'PDF'}</Badge>
              </div>
            </div>
          ) : (
            <><Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-500">Clicca per selezionare un file</p><p className="text-xs text-gray-400 mt-1">PDF, JPG o PNG</p></>
          )}
        </div>
      </div>
      
      <div><Label>Note interne (solo clinica)</Label><Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} /></div>
      
      <div className={`flex items-center justify-between p-4 rounded-lg ${formData.sendEmail ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
        <div>
          <p className="font-medium text-sm flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invia via email automaticamente
          </p>
          <p className="text-xs text-gray-500">Il proprietario riceverà il file PDF come allegato</p>
        </div>
        <Switch checked={formData.sendEmail} onCheckedChange={(v) => setFormData({...formData, sendEmail: v})} />
      </div>
      
      {formData.sendEmail && formData.ownerEmail && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Anteprima:</strong> Email a <span className="font-mono">{formData.ownerEmail}</span>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Subject: "{docTypeOptions.find(o => o.value === formData.type)?.label || 'Documento'} per {formData.petName || 'il tuo animale'} – La tua clinica"
          </p>
        </div>
      )}
      
      <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={uploading}>
        {uploading ? 'Caricamento...' : (formData.sendEmail ? '📧 Carica e invia email con allegato' : 'Carica documento')}
      </Button>
    </form></>
  );
}

// Clinic Documents

export default DocumentUploadForm;
