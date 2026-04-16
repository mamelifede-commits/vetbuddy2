'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Info, Loader2, Save, Settings } from 'lucide-react';
import api from '@/app/lib/api';

export default function LabStripeConfig() {
  const [stripeSettings, setStripeSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ stripePublishableKey: '', stripeSecretKey: '' });

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const data = await api.get('lab/stripe-settings');
      setStripeSettings(data);
    } catch (err) {
      console.error('Error loading stripe settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.stripePublishableKey || !formData.stripeSecretKey) {
      alert('Inserisci entrambe le chiavi Stripe');
      return;
    }
    setSaving(true);
    try {
      await api.post('lab/stripe-settings', formData);
      await loadSettings();
      setShowForm(false);
      setFormData({ stripePublishableKey: '', stripeSecretKey: '' });
    } catch (err) {
      alert('Errore nel salvataggio: ' + (err.message || 'Riprova'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 className="h-4 w-4 animate-spin" />Caricamento...</div>;

  return (
    <div className="space-y-3">
      {stripeSettings?.stripeConfigured ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-green-800">Stripe configurato</p>
              <p className="text-xs text-green-600">Chiave: {stripeSettings.stripeSecretKey}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            <Settings className="h-4 w-4 mr-1" />Modifica
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-500" />
            <div>
              <p className="font-medium text-amber-800">Stripe non configurato</p>
              <p className="text-xs text-amber-600">Configura per ricevere pagamenti dalle cliniche</p>
            </div>
          </div>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setShowForm(true)}>
            Configura Stripe
          </Button>
        </div>
      )}

      {showForm && (
        <div className="p-4 bg-gray-50 border rounded-lg space-y-3">
          <div>
            <Label className="text-sm">Publishable Key</Label>
            <Input placeholder="pk_live_..." value={formData.stripePublishableKey} onChange={(e) => setFormData(f => ({...f, stripePublishableKey: e.target.value}))} className="mt-1" />
          </div>
          <div>
            <Label className="text-sm">Secret Key</Label>
            <Input type="password" placeholder="sk_live_..." value={formData.stripeSecretKey} onChange={(e) => setFormData(f => ({...f, stripeSecretKey: e.target.value}))} className="mt-1" />
          </div>
          <p className="text-xs text-gray-400">Trovi le chiavi nella <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline">Dashboard Stripe \u2192 API Keys</a></p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Annulla</Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Salvataggio...</> : <><Save className="h-4 w-4 mr-1" />Salva</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
