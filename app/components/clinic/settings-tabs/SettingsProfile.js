'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, MessageCircle, X } from 'lucide-react';
import api from '@/app/lib/api';

export default function SettingsProfile({ user }) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    clinicName: user.clinicName || '', vatNumber: user.vatNumber || '',
    phone: user.phone || '', whatsappNumber: user.whatsappNumber || '',
    website: user.website || '', description: user.description || '',
    openingTime: user.openingTime || '09:00', closingTime: user.closingTime || '18:00',
    cancellationPolicyText: user.cancellationPolicyText || 'Ti preghiamo di avvisarci almeno 24 ore prima in caso di disdetta.'
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await api.put('clinic/profile', profileForm); alert('✅ Profilo clinica aggiornato!'); setEditingProfile(false); window.location.reload(); }
    catch (e) { alert('❌ Errore: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Profilo clinica</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setEditingProfile(!editingProfile)}>
          {editingProfile ? <X className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
          {editingProfile ? 'Annulla' : 'Modifica'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {editingProfile ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nome clinica *</Label><Input value={profileForm.clinicName} onChange={(e) => setProfileForm({...profileForm, clinicName: e.target.value})} required /></div>
              <div><Label>P.IVA</Label><Input value={profileForm.vatNumber} onChange={(e) => setProfileForm({...profileForm, vatNumber: e.target.value})} placeholder="IT12345678901" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Telefono</Label><Input value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} placeholder="+39 02 1234567" /></div>
              <div><Label className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-green-500" />WhatsApp Business</Label><Input value={profileForm.whatsappNumber} onChange={(e) => setProfileForm({...profileForm, whatsappNumber: e.target.value})} placeholder="+39 333 1234567" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Sito web</Label><Input value={profileForm.website} onChange={(e) => setProfileForm({...profileForm, website: e.target.value})} placeholder="www.clinicaveterinaria.it" /></div>
            </div>
            <div><Label>Descrizione clinica</Label><Textarea value={profileForm.description} onChange={(e) => setProfileForm({...profileForm, description: e.target.value})} placeholder="Descrivi i servizi e le specializzazioni..." rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Orario apertura</Label><Input type="time" value={profileForm.openingTime} onChange={(e) => setProfileForm({...profileForm, openingTime: e.target.value})} /></div>
              <div><Label>Orario chiusura</Label><Input type="time" value={profileForm.closingTime} onChange={(e) => setProfileForm({...profileForm, closingTime: e.target.value})} /></div>
            </div>
            <div><Label>Policy di cancellazione</Label><Textarea value={profileForm.cancellationPolicyText} onChange={(e) => setProfileForm({...profileForm, cancellationPolicyText: e.target.value})} rows={2} /><p className="text-xs text-gray-500 mt-1">Questo messaggio apparirà nelle email di promemoria</p></div>
            <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setEditingProfile(false)} className="flex-1">Annulla</Button><Button type="submit" disabled={saving} className="flex-1 bg-blue-500 hover:bg-blue-600">{saving ? 'Salvataggio...' : 'Salva modifiche'}</Button></div>
          </form>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-gray-500">Nome clinica</Label><p className="font-medium">{user.clinicName || '-'}</p></div>
              <div><Label className="text-gray-500">P.IVA</Label><p className="font-medium">{user.vatNumber || '-'}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-gray-500">Email</Label><p className="font-medium">{user.email || '-'}</p></div>
              <div><Label className="text-gray-500">Telefono</Label><p className="font-medium">{user.phone || '-'}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-gray-500 flex items-center gap-1"><MessageCircle className="h-3 w-3 text-green-500" />WhatsApp Business</Label><p className="font-medium">{user.whatsappNumber || <span className="text-amber-600 text-sm">Non configurato</span>}</p></div>
              <div><Label className="text-gray-500">Sito web</Label><p className="font-medium">{user.website || '-'}</p></div>
            </div>
            {user.description && <div><Label className="text-gray-500">Descrizione</Label><p className="text-sm text-gray-600">{user.description}</p></div>}
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-gray-500">Orario apertura</Label><p className="font-medium">{user.openingTime || '09:00'}</p></div>
              <div><Label className="text-gray-500">Orario chiusura</Label><p className="font-medium">{user.closingTime || '18:00'}</p></div>
            </div>
            {user.cancellationPolicyText && <div><Label className="text-gray-500">Policy di cancellazione</Label><p className="text-sm text-gray-600 bg-amber-50 p-2 rounded border border-amber-200">{user.cancellationPolicyText}</p></div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
