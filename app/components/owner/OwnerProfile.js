'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Check, Info, Mail, MessageCircle, Save, User } from 'lucide-react';
import api from '@/app/lib/api';

function OwnerProfile({ user, onRefresh }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsappEnabled: true,
    emailNotificationsEnabled: true,
    reminderDaysBefore: 1
  });
  const [testingWhatsapp, setTestingWhatsapp] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('owner/profile');
      if (response) {
        setProfileData({
          name: response.name || user.name || '',
          email: response.email || user.email || '',
          phone: response.phone || '',
          whatsappEnabled: response.whatsappEnabled !== false,
          emailNotificationsEnabled: response.emailNotificationsEnabled !== false,
          reminderDaysBefore: response.reminderDaysBefore || 1
        });
      }
    } catch (error) {
      // Use user data as fallback
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        whatsappEnabled: true,
        emailNotificationsEnabled: true,
        reminderDaysBefore: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      await api.put('owner/profile', profileData);
      alert('✅ Profilo salvato con successo!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('❌ Errore nel salvare il profilo');
    } finally {
      setSaving(false);
    }
  };

  const testWhatsapp = async () => {
    if (!profileData.phone) {
      alert('⚠️ Inserisci prima il tuo numero di telefono');
      return;
    }
    
    try {
      setTestingWhatsapp(true);
      const response = await api.post('whatsapp/notify', {
        template: 'welcome',
        to: profileData.phone,
        data: { ownerName: profileData.name || 'Utente' }
      });
      
      if (response.success) {
        alert('✅ Messaggio di test inviato! Controlla WhatsApp.\n\n⚠️ Nota: Per ricevere messaggi dalla Sandbox Twilio, devi prima inviare "join older-dug" al numero +1 415 523 8886 su WhatsApp.');
      } else {
        alert('❌ Errore: ' + (response.error || 'Impossibile inviare il messaggio'));
      }
    } catch (error) {
      console.error('Error testing WhatsApp:', error);
      alert('❌ Errore nel test WhatsApp: ' + (error.message || 'Errore sconosciuto'));
    } finally {
      setTestingWhatsapp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profilo e Notifiche</h1>
        <p className="text-gray-500">Gestisci i tuoi dati e le preferenze di notifica</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-coral-500" />
            I tuoi dati
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome completo</Label>
            <Input 
              id="name"
              value={profileData.name} 
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              placeholder="Mario Rossi"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={profileData.email} 
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              placeholder="mario@example.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Numero di telefono (per WhatsApp)</Label>
            <Input 
              id="phone"
              type="tel"
              value={profileData.phone} 
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              placeholder="+39 333 1234567"
            />
            <p className="text-xs text-gray-500 mt-1">Inserisci il numero con prefisso internazionale (+39 per Italia)</p>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Notifiche WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Attiva notifiche WhatsApp</p>
              <p className="text-sm text-gray-500">Ricevi promemoria appuntamenti e aggiornamenti su WhatsApp</p>
            </div>
            <Switch 
              checked={profileData.whatsappEnabled}
              onCheckedChange={(checked) => setProfileData({...profileData, whatsappEnabled: checked})}
            />
          </div>
          
          {profileData.whatsappEnabled && (
            <>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">📱 Come funziona</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Riceverai promemoria prima degli appuntamenti</li>
                  <li>• Notifiche quando documenti sono disponibili</li>
                  <li>• Conferme di pagamento</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">⚠️ Attivazione Sandbox (solo per test)</h4>
                <p className="text-sm text-amber-700 mb-2">
                  Per ricevere messaggi dalla modalità test, devi prima:
                </p>
                <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Apri WhatsApp sul telefono</li>
                  <li>Invia un messaggio al numero <strong>+1 415 523 8886</strong></li>
                  <li>Scrivi: <code className="bg-amber-100 px-1 rounded">join older-dug</code></li>
                </ol>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={testWhatsapp}
                disabled={testingWhatsapp || !profileData.phone}
              >
                {testingWhatsapp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Invio in corso...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Invia messaggio di test
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Notifiche Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Attiva notifiche Email</p>
              <p className="text-sm text-gray-500">Ricevi promemoria e aggiornamenti via email</p>
            </div>
            <Switch 
              checked={profileData.emailNotificationsEnabled}
              onCheckedChange={(checked) => setProfileData({...profileData, emailNotificationsEnabled: checked})}
            />
          </div>
          
          {profileData.emailNotificationsEnabled && (
            <div>
              <Label>Promemoria appuntamenti</Label>
              <Select 
                value={String(profileData.reminderDaysBefore)}
                onValueChange={(value) => setProfileData({...profileData, reminderDaysBefore: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 giorno prima</SelectItem>
                  <SelectItem value="2">2 giorni prima</SelectItem>
                  <SelectItem value="3">3 giorni prima</SelectItem>
                  <SelectItem value="7">1 settimana prima</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        className="w-full bg-coral-500 hover:bg-coral-600"
        onClick={saveProfile}
        disabled={saving}
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Salvataggio...
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            Salva modifiche
          </>
        )}
      </Button>
    </div>
  );
}


// ==================== OWNER DASHBOARD ====================

export default OwnerProfile;
