'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Edit, Euro, FlaskConical, Loader2, MapPin, Save, Settings, Truck } from 'lucide-react';
import api from '@/app/lib/api';
import dynamic from 'next/dynamic';
import LabStripeConfig from './LabStripeConfig';
const SubscriptionPlans = dynamic(() => import('@/app/components/shared/SubscriptionPlans'), { ssr: false });

const SPECIALIZATION_OPTIONS = [
  'Ematologia', 'Biochimica clinica', 'Endocrinologia', 'Microbiologia',
  'Parassitologia', 'Citologia', 'Istologia', 'Genetica', 'Allergologia',
  'Tossicologia', 'Immunologia', 'Virologia', 'Analisi urine', 'Dermatologia'
];

export default function LabProfileEditor({ user, billing }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    labName: user.labName || user.name || '',
    description: user.description || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    province: user.province || '',
    contactPerson: user.contactPerson || '',
    vatNumber: user.vatNumber || '',
    specializations: user.specializations || [],
    pickupAvailable: user.pickupAvailable || false,
    pickupDays: user.pickupDays || '',
    pickupHours: user.pickupHours || '',
    averageReportTime: user.averageReportTime || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('lab/profile', form);
      alert('\u2705 Profilo aggiornato con successo!');
      setEditing(false);
    } catch (err) {
      alert('Errore: ' + err.message);
    }
    setSaving(false);
  };

  const toggleSpecialization = (spec) => {
    setForm(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-500" />Profilo Laboratorio
        </h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)} variant="outline"><Edit className="h-4 w-4 mr-2" />Modifica</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>Annulla</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salva
            </Button>
          </div>
        )}
      </div>

      <Card className="border-green-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Euro className="h-5 w-5 text-green-600" />Pagamenti Clienti (Stripe)</h3>
          <p className="text-sm text-gray-500 mb-4">Configura il tuo account Stripe per ricevere pagamenti diretti dalle cliniche per le analisi.</p>
          <LabStripeConfig />
        </CardContent>
      </Card>

      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Euro className="h-5 w-5 text-indigo-500" />Abbonamento VetBuddy</h3>
          <SubscriptionPlans user={user} />
        </CardContent>
      </Card>

      {billing && (
        <Card>
          <CardContent className="p-4">
            <div className={`rounded-lg p-4 border ${billing.billingActive ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <h4 className="font-semibold text-sm mb-2">{billing.billingActive ? '\u26a0\ufe0f Trial scaduto' : '\u2705 Trial attivo'}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><p className="text-xs text-gray-500">Giorni rimanenti</p><p className="font-bold text-lg">{billing.daysRemaining}</p></div>
                <div><p className="text-xs text-gray-500">Richieste</p><p className="font-bold text-lg">{billing.requestsCount}/{billing.maxFreeRequests}</p></div>
                <div><p className="text-xs text-gray-500">Scadenza trial</p><p className="font-medium">{billing.freeUntil ? new Date(billing.freeUntil).toLocaleDateString('it-IT') : '-'}</p></div>
                <div><p className="text-xs text-gray-500">Dopo il trial</p><p className="font-medium">\u20ac29/mese + IVA</p></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 space-y-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Building2 className="h-5 w-5 text-indigo-400" />Informazioni Generali</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600">Nome Laboratorio</Label>
              {editing ? <Input value={form.labName} onChange={(e) => setForm(f => ({...f, labName: e.target.value}))} className="mt-1" /> : <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5">{form.labName || '-'}</p>}
            </div>
            <div>
              <Label className="text-sm text-gray-600">P.IVA</Label>
              {editing ? <Input value={form.vatNumber} onChange={(e) => setForm(f => ({...f, vatNumber: e.target.value}))} className="mt-1" /> : <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5">{form.vatNumber || '-'}</p>}
            </div>
            <div>
              <Label className="text-sm text-gray-600">Email</Label>
              <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5 text-gray-500">{user.email} <span className="text-xs">(non modificabile)</span></p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Telefono</Label>
              {editing ? <Input value={form.phone} onChange={(e) => setForm(f => ({...f, phone: e.target.value}))} className="mt-1" /> : <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5">{form.phone || '-'}</p>}
            </div>
            <div>
              <Label className="text-sm text-gray-600">Referente</Label>
              {editing ? <Input value={form.contactPerson} onChange={(e) => setForm(f => ({...f, contactPerson: e.target.value}))} className="mt-1" /> : <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5">{form.contactPerson || '-'}</p>}
            </div>
            <div>
              <Label className="text-sm text-gray-600">Stato</Label>
              <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5">{user.status === 'active' ? '\u2705 Attivo' : user.isApproved ? '\u2705 Approvato' : '\u23f3 In attesa approvazione'}</p>
            </div>
          </div>
          <div>
            <Label className="text-sm text-gray-600">Descrizione</Label>
            {editing ? <Textarea value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} rows={3} className="mt-1" placeholder="Descrivi il tuo laboratorio, i tuoi punti di forza..." /> : <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5 whitespace-pre-wrap">{form.description || 'Nessuna descrizione inserita'}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><MapPin className="h-5 w-5 text-indigo-400" />Indirizzo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label className="text-sm text-gray-600">Indirizzo</Label>
              {editing ? <Input value={form.address} onChange={(e) => setForm(f => ({...f, address: e.target.value}))} className="mt-1" /> : <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5">{form.address || '-'}</p>}
            </div>
            <div>
              <Label className="text-sm text-gray-600">Citt\u00e0</Label>
              {editing ? <Input value={form.city} onChange={(e) => setForm(f => ({...f, city: e.target.value}))} className="mt-1" /> : <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5">{form.city || '-'}</p>}
            </div>
            <div>
              <Label className="text-sm text-gray-600">Provincia</Label>
              {editing ? <Input value={form.province} onChange={(e) => setForm(f => ({...f, province: e.target.value}))} className="mt-1" placeholder="MI" /> : <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5">{form.province || '-'}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><FlaskConical className="h-5 w-5 text-indigo-400" />Specializzazioni</h3>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATION_OPTIONS.map(spec => (
                <button key={spec} onClick={() => toggleSpecialization(spec)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${form.specializations.includes(spec) ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {form.specializations.includes(spec) ? '\u2713 ' : ''}{spec}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {form.specializations.length > 0 ? form.specializations.map(spec => (
                <Badge key={spec} className="bg-indigo-100 text-indigo-700">{spec}</Badge>
              )) : <p className="text-sm text-gray-400">Nessuna specializzazione inserita</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Truck className="h-5 w-5 text-indigo-400" />Ritiro Campioni e Tempi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600">Servizio ritiro campioni</Label>
              {editing ? (
                <div className="mt-2 flex items-center gap-3">
                  <button onClick={() => setForm(f => ({...f, pickupAvailable: !f.pickupAvailable}))} className={`relative w-12 h-6 rounded-full transition-colors ${form.pickupAvailable ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.pickupAvailable ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-sm font-medium">{form.pickupAvailable ? 'Disponibile' : 'Non disponibile'}</span>
                </div>
              ) : <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5">{form.pickupAvailable ? '\u2705 Disponibile' : '\u274c Non disponibile'}</p>}
            </div>
            <div>
              <Label className="text-sm text-gray-600">Tempi medi refertazione</Label>
              {editing ? <Input value={form.averageReportTime} onChange={(e) => setForm(f => ({...f, averageReportTime: e.target.value}))} className="mt-1" placeholder="es. 24-48 ore" /> : <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5">{form.averageReportTime || '-'}</p>}
            </div>
            {form.pickupAvailable && (
              <>
                <div>
                  <Label className="text-sm text-gray-600">Giorni ritiro</Label>
                  {editing ? <Input value={form.pickupDays} onChange={(e) => setForm(f => ({...f, pickupDays: e.target.value}))} className="mt-1" placeholder="es. Lun-Ven" /> : <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5">{form.pickupDays || '-'}</p>}
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Orari ritiro</Label>
                  {editing ? <Input value={form.pickupHours} onChange={(e) => setForm(f => ({...f, pickupHours: e.target.value}))} className="mt-1" placeholder="es. 09:00-12:00" /> : <p className="mt-1 font-medium bg-gray-50 rounded-lg p-2.5">{form.pickupHours || '-'}</p>}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
