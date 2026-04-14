'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, Receipt } from 'lucide-react';
import api from '@/app/lib/api';

function InvoiceUploadForm({ owners, onSuccess }) {
  const [formData, setFormData] = useState({ ownerEmail: '', title: '', amount: '', file: null, fileName: '', sendEmail: true });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => { setFormData({ ...formData, file: reader.result, fileName: file.name, title: formData.title || file.name.replace('.pdf', '') }); };
      reader.readAsDataURL(file);
    } else { alert('Per favore seleziona un file PDF'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) { alert('Seleziona un file PDF'); return; }
    setUploading(true);
    try {
      await api.post('documents', {
        name: formData.title,
        type: 'fattura',
        content: formData.file,
        fileName: formData.fileName,
        ownerEmail: formData.ownerEmail,
        amount: parseFloat(formData.amount) || 0,
        sendEmail: formData.sendEmail
      });
      onSuccess?.();
    } catch (error) { alert(error.message); } finally { setUploading(false); }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Carica fattura</DialogTitle>
        <DialogDescription>Carica un PDF e invialo al cliente</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <Label>Cliente (email) *</Label>
          <Input 
            value={formData.ownerEmail} 
            onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} 
            required 
            placeholder="email@cliente.com"
            list="owners-list"
          />
          <datalist id="owners-list">
            {owners.map((o, i) => <option key={i} value={o.email}>{o.name}</option>)}
          </datalist>
        </div>
        
        <div>
          <Label>Titolo fattura *</Label>
          <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="Es: Fattura visita 12/02" />
        </div>
        
        <div>
          <Label>Importo (€) *</Label>
          <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required placeholder="0.00" />
        </div>
        
        <div>
          <Label>File PDF *</Label>
          <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-amber-400 transition">
            {formData.fileName ? (
              <div className="flex items-center justify-center gap-2 text-amber-600"><Receipt className="h-5 w-5" /><span className="font-medium">{formData.fileName}</span></div>
            ) : (
              <><Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-500">Clicca per selezionare il PDF della fattura</p></>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
          <div>
            <p className="font-medium text-sm">Invia via email al cliente</p>
            <p className="text-xs text-gray-500">Il cliente riceverà il PDF come allegato</p>
          </div>
          <Switch checked={formData.sendEmail} onCheckedChange={(v) => setFormData({...formData, sendEmail: v})} />
        </div>
        
        <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={uploading}>
          {uploading ? 'Caricamento...' : 'Carica fattura'}
        </Button>
      </form>
    </>
  );
}

// ==================== LAB DASHBOARD ====================

export default InvoiceUploadForm;
