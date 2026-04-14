'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Bell, Calendar, CalendarCheck, CalendarX, Check, CheckCircle, Clock, CreditCard, Edit, ExternalLink, FileText, MapPin, MessageCircle, Plus, RefreshCw, Save, Search, Star, Trash2, Users, X } from 'lucide-react';
import api from '@/app/lib/api';
import SubscriptionPlans from '@/app/components/shared/SubscriptionPlans';

function ClinicSettings({ user, onNavigate }) {
  const [googleCalendarStatus, setGoogleCalendarStatus] = useState({ connected: false, loading: true });
  const [stripeSettings, setStripeSettings] = useState({ stripePublishableKey: '', stripeSecretKey: '', stripeConfigured: false });
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [stripeForm, setStripeForm] = useState({ publishableKey: '', secretKey: '' });
  const [saving, setSaving] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [locationForm, setLocationForm] = useState({ 
    address: user.address || '', 
    city: user.city || '', 
    latitude: user.latitude || null, 
    longitude: user.longitude || null 
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [staffColors, setStaffColors] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  // Availability settings state
  const [availabilitySettings, setAvailabilitySettings] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  
  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    clinicName: user.clinicName || '',
    vatNumber: user.vatNumber || '',
    phone: user.phone || '',
    whatsappNumber: user.whatsappNumber || '',
    website: user.website || '',
    description: user.description || '',
    openingTime: user.openingTime || '09:00',
    closingTime: user.closingTime || '18:00',
    cancellationPolicyText: user.cancellationPolicyText || 'Ti preghiamo di avvisarci almeno 24 ore prima in caso di disdetta.'
  });
  
  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({
    paymentMethods: { cash: true, cardInClinic: true, bankTransfer: false, online: false },
    cancellationPolicy: 'free_24h'
  });
  const [paymentSettingsSaving, setPaymentSettingsSaving] = useState(false);

  useEffect(() => { 
    loadStripeSettings(); 
    loadGoogleCalendarStatus();
    loadStaffColors();
    loadStaff();
    loadPaymentSettings();
    loadAvailabilitySettings();
    
    // Check for Google OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_success')) {
      alert('✅ Google Calendar connesso con successo!');
      window.history.replaceState({}, '', window.location.pathname);
      loadGoogleCalendarStatus();
    }
    if (params.get('google_error')) {
      alert('❌ Errore connessione Google Calendar: ' + params.get('google_error'));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Load availability settings
  const loadAvailabilitySettings = async () => {
    setLoadingAvailability(true);
    try {
      const response = await api.get('clinic/availability');
      setAvailabilitySettings(response);
    } catch (error) {
      console.error('Error loading availability settings:', error);
      // Set defaults if not configured - using new blocks format
      setAvailabilitySettings({
        weeklySchedule: {
          monday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          tuesday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          wednesday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          thursday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          friday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          saturday: { enabled: false, blocks: [] },
          sunday: { enabled: false, blocks: [] }
        },
        slotDuration: 30,
        dateOverrides: {},
        blockedDates: [],
        blockedSlots: [],
        acceptOnlineBooking: true,
        requireConfirmation: true
      });
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Save availability settings
  const saveAvailabilitySettings = async () => {
    setSavingAvailability(true);
    try {
      await api.put('clinic/availability', availabilitySettings);
      alert('✅ Orari di disponibilità salvati!');
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('❌ Errore nel salvataggio degli orari');
    } finally {
      setSavingAvailability(false);
    }
  };

  // Update day enabled/disabled
  const updateDayEnabled = (day, enabled) => {
    setAvailabilitySettings(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          enabled,
          blocks: enabled && (!prev.weeklySchedule[day]?.blocks || prev.weeklySchedule[day].blocks.length === 0)
            ? [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }]
            : prev.weeklySchedule[day]?.blocks || []
        }
      }
    }));
  };

  // Update a specific time block
  const updateTimeBlock = (day, blockIndex, field, value) => {
    setAvailabilitySettings(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          blocks: prev.weeklySchedule[day].blocks.map((block, i) => 
            i === blockIndex ? { ...block, [field]: value } : block
          )
        }
      }
    }));
  };

  // Add a new time block to a day
  const addTimeBlock = (day) => {
    setAvailabilitySettings(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          blocks: [...(prev.weeklySchedule[day]?.blocks || []), { start: '09:00', end: '12:00' }]
        }
      }
    }));
  };

  // Remove a time block from a day
  const removeTimeBlock = (day, blockIndex) => {
    setAvailabilitySettings(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          blocks: prev.weeklySchedule[day].blocks.filter((_, i) => i !== blockIndex)
        }
      }
    }));
  };

  // Add a blocked date
  const addBlockedDate = () => {
    const date = prompt('Inserisci la data da bloccare (YYYY-MM-DD):');
    if (!date) return;
    const reason = prompt('Motivo (opzionale):') || 'Chiuso';
    setAvailabilitySettings(prev => ({
      ...prev,
      blockedDates: [...(prev.blockedDates || []), { date, reason }]
    }));
  };

  // Remove a blocked date
  const removeBlockedDate = (index) => {
    setAvailabilitySettings(prev => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((_, i) => i !== index)
    }));
  };

  // Load payment settings
  const loadPaymentSettings = async () => {
    try {
      const response = await api.get(`clinic/payment-settings?clinicId=${user.id}`);
      if (response.success && response.settings) {
        setPaymentSettings(response.settings);
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
    }
  };

  // Update payment method
  const updatePaymentMethod = async (method, enabled) => {
    setPaymentSettingsSaving(true);
    const newMethods = { ...paymentSettings.paymentMethods, [method]: enabled };
    setPaymentSettings(prev => ({ ...prev, paymentMethods: newMethods }));
    
    try {
      await api.put('clinic/payment-settings', { paymentMethods: newMethods });
    } catch (error) {
      console.error('Error saving payment method:', error);
    } finally {
      setPaymentSettingsSaving(false);
    }
  };

  // Update cancellation policy
  const updateCancellationPolicy = async (policyId) => {
    setPaymentSettingsSaving(true);
    setPaymentSettings(prev => ({ ...prev, cancellationPolicy: policyId }));
    
    try {
      await api.put('clinic/payment-settings', { cancellationPolicy: policyId });
    } catch (error) {
      console.error('Error saving cancellation policy:', error);
    } finally {
      setPaymentSettingsSaving(false);
    }
  };

  // Handle clinic profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('clinic/profile', profileForm);
      // Update user object in parent (would need to refresh or update context)
      alert('✅ Profilo clinica aggiornato con successo!');
      setEditingProfile(false);
      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error updating clinic profile:', error);
      alert('❌ Errore durante l\'aggiornamento del profilo');
    } finally {
      setSaving(false);
    }
  };

  const loadGoogleCalendarStatus = async () => {
    try {
      const status = await api.get('google-calendar/status');
      setGoogleCalendarStatus({ ...status, loading: false });
    } catch (error) { 
      console.error('Error loading Google Calendar status:', error);
      setGoogleCalendarStatus({ connected: false, loading: false });
    }
  };

  const loadStaffColors = async () => {
    try {
      const colors = await api.get('staff-colors');
      setStaffColors(colors);
    } catch (error) { console.error('Error loading staff colors:', error); }
  };

  const loadStaff = async () => {
    try {
      const staff = await api.get('staff');
      setStaffList(staff);
    } catch (error) { console.error('Error loading staff:', error); }
  };

  const connectGoogleCalendar = async () => {
    try {
      const { authUrl } = await api.get(`auth/google?clinicId=${user.id}`);
      window.location.href = authUrl;
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const disconnectGoogleCalendar = async () => {
    if (!confirm('Sei sicuro di voler disconnettere Google Calendar?')) return;
    try {
      await api.post('google-calendar/disconnect', {});
      setGoogleCalendarStatus({ connected: false, loading: false });
      alert('Google Calendar disconnesso');
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const updateStaffColor = async (staffId, colorId) => {
    try {
      await api.post('staff/calendar-color', { staffId, colorId });
      loadStaff();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const loadStripeSettings = async () => {
    try {
      const settings = await api.get('clinic/stripe-settings');
      setStripeSettings(settings);
    } catch (error) { console.error('Error loading Stripe settings:', error); }
  };

  const saveStripeSettings = async () => {
    setSaving(true);
    try {
      await api.post('clinic/stripe-settings', {
        stripePublishableKey: stripeForm.publishableKey,
        stripeSecretKey: stripeForm.secretKey
      });
      setShowStripeForm(false);
      loadStripeSettings();
      alert('Configurazione Stripe salvata!');
    } catch (error) { alert(error.message); } finally { setSaving(false); }
  };

  const handleSubscribe = async (planId) => {
    setSubscriptionLoading(true);
    try {
      const { url } = await api.post('stripe/checkout/subscription', {
        planId,
        originUrl: window.location.origin
      });
      window.location.href = url;
    } catch (error) { alert(error.message); setSubscriptionLoading(false); }
  };

  // Detect current location
  const detectLocation = () => {
    setDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationForm(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setDetectingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Impossibile ottenere la posizione. Assicurati di aver abilitato la geolocalizzazione.');
          setDetectingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert('Geolocalizzazione non supportata dal browser');
      setDetectingLocation(false);
    }
  };

  // Geocode address using backend API (secure)
  const geocodeAddress = async () => {
    if (!locationForm.address || !locationForm.city) {
      alert('Inserisci indirizzo e città');
      return;
    }
    setDetectingLocation(true);
    try {
      const address = `${locationForm.address}, ${locationForm.city}, Italia`;
      const data = await api.get(`geocode?address=${encodeURIComponent(address)}`);
      
      if (data.success) {
        setLocationForm(prev => ({
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude
        }));
        alert('Coordinate trovate con successo!');
      } else {
        alert('Indirizzo non trovato. Prova con un indirizzo più preciso o usa "Usa posizione attuale".');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Errore durante la geocodifica. Riprova.');
    } finally {
      setDetectingLocation(false);
    }
  };

  // Save location
  const saveLocation = async () => {
    setSavingLocation(true);
    try {
      await api.put('clinic/profile', locationForm);
      alert('Posizione salvata con successo! I clienti potranno ora vedere la distanza dalla tua clinica.');
    } catch (error) { alert(error.message); } finally { setSavingLocation(false); }
  };

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Impostazioni</h2>
        <p className="text-gray-500 text-sm">Configura la tua clinica</p>
      </div>
      
      <div className="space-y-6 max-w-2xl">
        {/* Abbonamento vetbuddy - Pilot */}
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />Abbonamento vetbuddy
              <Badge className="bg-amber-500 text-white">Pilot Milano</Badge>
            </CardTitle>
            <CardDescription>Accesso su invito — 90 giorni gratuiti per cliniche selezionate (estendibili a 6 mesi)</CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionPlans user={user} />
          </CardContent>
        </Card>

        {/* Stripe per pagamenti clienti */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-coral-500" />Pagamenti clienti (Stripe)
            </CardTitle>
            <CardDescription>Configura il tuo Stripe per ricevere pagamenti dai clienti</CardDescription>
          </CardHeader>
          <CardContent>
            {stripeSettings.stripeConfigured ? (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Stripe configurato</p>
                    <p className="text-sm text-green-600">Chiave: {stripeSettings.stripeSecretKey}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowStripeForm(true)}>Modifica</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Non configurato</p>
                  <p className="text-sm text-gray-500">Configura per ricevere pagamenti online</p>
                </div>
                <Button className="bg-coral-500 hover:bg-coral-600" onClick={() => setShowStripeForm(true)}>
                  Configura Stripe
                </Button>
              </div>
            )}
            
            {showStripeForm && (
              <div className="mt-4 p-4 border rounded-lg space-y-4">
                <div>
                  <Label>Publishable Key (pk_...)</Label>
                  <Input 
                    value={stripeForm.publishableKey} 
                    onChange={(e) => setStripeForm({...stripeForm, publishableKey: e.target.value})}
                    placeholder="Inserisci la tua Publishable Key Stripe"
                  />
                </div>
                <div>
                  <Label>Secret Key (sk_...)</Label>
                  <Input 
                    type="password"
                    value={stripeForm.secretKey} 
                    onChange={(e) => setStripeForm({...stripeForm, secretKey: e.target.value})}
                    placeholder="Inserisci la tua Secret Key Stripe"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveStripeSettings} disabled={saving} className="bg-coral-500 hover:bg-coral-600">
                    {saving ? 'Salvataggio...' : 'Salva'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowStripeForm(false)}>Annulla</Button>
                </div>
                <p className="text-xs text-gray-500">
                  Trova le tue chiavi su <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="text-coral-500 hover:underline">dashboard.stripe.com/apikeys</a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Calendar */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-green-600" />Google Calendar
              {googleCalendarStatus.connected && (
                <Badge className="bg-green-100 text-green-700 ml-2">Connesso</Badge>
              )}
            </CardTitle>
            <CardDescription>Sincronizza appuntamenti in tempo reale - niente doppi inserimenti</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {googleCalendarStatus.loading ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : googleCalendarStatus.connected ? (
              <>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Calendario connesso</p>
                        <p className="text-sm text-green-600">{googleCalendarStatus.calendarName || 'Calendario principale'}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={disconnectGoogleCalendar} className="text-red-600 border-red-300 hover:bg-red-50">
                      Disconnetti
                    </Button>
                  </div>
                  {googleCalendarStatus.lastSync && (
                    <p className="text-xs text-green-600 mt-2">
                      Ultima sincronizzazione: {new Date(googleCalendarStatus.lastSync).toLocaleString('it-IT')}
                    </p>
                  )}
                </div>

                {/* Staff Colors */}
                <div className="mt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />Colori staff per il calendario
                  </h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Assegna un colore a ogni collaboratore per distinguere gli appuntamenti su Google Calendar.
                  </p>
                  <div className="space-y-2">
                    {staffList.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">Nessuno staff aggiunto. Vai alla sezione Staff per aggiungere collaboratori.</p>
                    ) : staffList.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: staffColors.find(c => c.id === parseInt(staff.calendarColorId))?.hex || '#6B7280' }}
                          >
                            {staff.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{staff.name}</p>
                            <p className="text-xs text-gray-500">{staff.role}</p>
                          </div>
                        </div>
                        <Select 
                          value={staff.calendarColorId?.toString() || '1'} 
                          onValueChange={(v) => updateStaffColor(staff.id, v)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Colore" />
                          </SelectTrigger>
                          <SelectContent>
                            {staffColors.map((color) => (
                              <SelectItem key={color.id} value={color.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color.hex }} />
                                  {color.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                  <p className="text-sm text-blue-700">
                    <strong>Come funziona:</strong> Quando crei un appuntamento su vetbuddy, viene automaticamente aggiunto al tuo Google Calendar con il colore dello staff assegnato.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Non connesso</p>
                    <p className="text-sm text-gray-500">Connetti per sincronizzare gli appuntamenti</p>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={connectGoogleCalendar}>
                    <ExternalLink className="h-4 w-4 mr-2" />Connetti Google Calendar
                  </Button>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <CalendarCheck className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">Sync automatico</p>
                    <p className="text-xs text-gray-500">Appuntamenti su Google</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">No doppioni</p>
                    <p className="text-xs text-gray-500">Slot occupati bloccati</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <Users className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">Colori staff</p>
                    <p className="text-xs text-gray-500">Un colore per ogni collaboratore</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Business Notifications */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />Notifiche WhatsApp
              <Badge className="bg-green-100 text-green-700 ml-2">Attivo</Badge>
            </CardTitle>
            <CardDescription>Invia promemoria appuntamenti e notifiche ai clienti via WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">WhatsApp Business configurato</p>
                  <p className="text-sm text-green-600">Numero: +39 388 744 1417</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Notifiche automatiche disponibili:</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Promemoria appuntamento</p>
                    <p className="text-xs text-gray-500">24h e 2h prima della visita</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Conferma prenotazione</p>
                    <p className="text-xs text-gray-500">Automatica alla prenotazione</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Documento pronto</p>
                    <p className="text-xs text-gray-500">Quando carichi referti/prescrizioni</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pagamento ricevuto</p>
                    <p className="text-xs text-gray-500">Conferma pagamenti online</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Bell className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Come funziona</p>
                  <p className="text-blue-600">I clienti devono avere un numero WhatsApp registrato nel loro profilo. Le notifiche verranno inviate automaticamente in base alle tue automazioni.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posizione su Google Maps */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />Posizione clinica
            </CardTitle>
            <CardDescription>Imposta la posizione per essere trovato dai clienti</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Indirizzo</Label>
                <Input 
                  value={locationForm.address} 
                  onChange={(e) => setLocationForm({...locationForm, address: e.target.value})}
                  placeholder="Via Roma 1"
                />
              </div>
              <div>
                <Label>Città</Label>
                <Input 
                  value={locationForm.city} 
                  onChange={(e) => setLocationForm({...locationForm, city: e.target.value})}
                  placeholder="Milano"
                />
              </div>
            </div>
            
            {locationForm.latitude && locationForm.longitude ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Coordinate impostate</span>
                </div>
                <p className="text-sm text-green-700">
                  Lat: {locationForm.latitude.toFixed(6)}, Lng: {locationForm.longitude.toFixed(6)}
                </p>
                <div className="mt-3">
                  <iframe
                    width="100%"
                    height="150"
                    style={{ border: 0, borderRadius: '8px' }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${locationForm.latitude},${locationForm.longitude}&zoom=15`}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="text-sm text-amber-700">Nessuna posizione impostata. I clienti non potranno vedere la distanza dalla tua clinica.</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={detectLocation} 
                disabled={detectingLocation}
              >
                {detectingLocation ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
                Usa posizione attuale
              </Button>
              <Button 
                variant="outline" 
                onClick={geocodeAddress} 
                disabled={detectingLocation || (!locationForm.address && !locationForm.city)}
              >
                {detectingLocation ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Cerca da indirizzo
              </Button>
              <Button 
                className="bg-blue-500 hover:bg-blue-600"
                onClick={saveLocation} 
                disabled={savingLocation || !locationForm.latitude}
              >
                {savingLocation ? 'Salvataggio...' : 'Salva posizione'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              La posizione permette ai clienti di vedere quanto dista la tua clinica e ottenere indicazioni stradali.
            </p>
          </CardContent>
        </Card>


        {/* 💳 METODI DI PAGAMENTO */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              Metodi di Pagamento & Cancellazione
            </CardTitle>
            <CardDescription>Configura come i clienti possono pagare e le policy di cancellazione</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Metodi di pagamento */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Metodi di pagamento accettati</h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={paymentSettings?.paymentMethods?.cash !== false}
                    onChange={(e) => updatePaymentMethod('cash', e.target.checked)}
                    className="h-4 w-4 text-green-500 rounded"
                  />
                  <span className="text-lg">💵</span>
                  <span>Contanti</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={paymentSettings?.paymentMethods?.cardInClinic !== false}
                    onChange={(e) => updatePaymentMethod('cardInClinic', e.target.checked)}
                    className="h-4 w-4 text-green-500 rounded"
                  />
                  <span className="text-lg">💳</span>
                  <span>Carta in clinica</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={paymentSettings?.paymentMethods?.bankTransfer === true}
                    onChange={(e) => updatePaymentMethod('bankTransfer', e.target.checked)}
                    className="h-4 w-4 text-green-500 rounded"
                  />
                  <span className="text-lg">🏦</span>
                  <span>Bonifico</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={paymentSettings?.paymentMethods?.online === true}
                    onChange={(e) => updatePaymentMethod('online', e.target.checked)}
                    className="h-4 w-4 text-green-500 rounded"
                  />
                  <span className="text-lg">🌐</span>
                  <span>Online (Stripe)</span>
                </label>
              </div>
            </div>

            {/* Policy cancellazione */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Policy di cancellazione</h4>
              <div className="space-y-2">
                {[
                  { id: 'free_24h', label: 'Cancellazione gratuita fino a 24h prima' },
                  { id: 'free_48h', label: 'Cancellazione gratuita fino a 48h prima' },
                  { id: 'penalty_30_24h', label: 'Penale 30% se cancelli meno di 24h prima' },
                  { id: 'penalty_50_24h', label: 'Penale 50% se cancelli meno di 24h prima' },
                  { id: 'penalty_100_24h', label: 'Nessun rimborso se cancelli meno di 24h prima' },
                  { id: 'no_refund', label: 'Nessun rimborso per cancellazioni' }
                ].map(policy => (
                  <label key={policy.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${paymentSettings?.cancellationPolicy === policy.id ? 'border-green-500 bg-green-50' : ''}`}>
                    <input 
                      type="radio" 
                      name="cancellationPolicy"
                      checked={paymentSettings?.cancellationPolicy === policy.id}
                      onChange={() => updateCancellationPolicy(policy.id)}
                      className="h-4 w-4 text-green-500"
                    />
                    <span className="text-sm">{policy.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {paymentSettingsSaving && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Salvataggio...
              </p>
            )}
          </CardContent>
        </Card>

        {/* 🕐 ORARI DI DISPONIBILITÀ */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Orari di Disponibilità
            </CardTitle>
            <CardDescription>Configura le fasce orarie in cui i clienti possono prenotare. Puoi aggiungere più blocchi per ogni giorno.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAvailability ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Durata slot */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Durata slot appuntamento</p>
                    <p className="text-sm text-gray-500">Quanto dura mediamente una visita</p>
                  </div>
                  <Select 
                    value={String(availabilitySettings?.slotDuration || 30)} 
                    onValueChange={(v) => setAvailabilitySettings(prev => ({...prev, slotDuration: parseInt(v)}))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="20">20 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Orari settimanali con blocchi flessibili */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    📅 Orari settimanali
                    <span className="text-xs font-normal text-gray-500">(aggiungi più fasce orarie per ogni giorno)</span>
                  </h4>
                  {availabilitySettings?.weeklySchedule && [
                    { key: 'monday', label: 'Lunedì', short: 'LUN' },
                    { key: 'tuesday', label: 'Martedì', short: 'MAR' },
                    { key: 'wednesday', label: 'Mercoledì', short: 'MER' },
                    { key: 'thursday', label: 'Giovedì', short: 'GIO' },
                    { key: 'friday', label: 'Venerdì', short: 'VEN' },
                    { key: 'saturday', label: 'Sabato', short: 'SAB' },
                    { key: 'sunday', label: 'Domenica', short: 'DOM' }
                  ].map(day => {
                    const dayConfig = availabilitySettings.weeklySchedule[day.key] || { enabled: false, blocks: [] };
                    return (
                      <div key={day.key} className={`p-3 border rounded-lg transition-colors ${dayConfig.enabled ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={dayConfig.enabled || false}
                              onChange={(e) => updateDayEnabled(day.key, e.target.checked)}
                              className="h-4 w-4 text-blue-500 rounded"
                            />
                            <span className={`font-medium w-24 ${dayConfig.enabled ? 'text-gray-800' : 'text-gray-400'}`}>
                              {day.label}
                            </span>
                          </div>
                          {dayConfig.enabled && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => addTimeBlock(day.key)}
                              className="text-xs h-7"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Aggiungi fascia
                            </Button>
                          )}
                        </div>
                        
                        {dayConfig.enabled && (
                          <div className="space-y-2 ml-7">
                            {(dayConfig.blocks || []).length === 0 ? (
                              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                ⚠️ Nessuna fascia oraria. Aggiungi almeno una fascia.
                              </p>
                            ) : (
                              dayConfig.blocks.map((block, blockIndex) => (
                                <div key={blockIndex} className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                                  <span className="text-xs text-gray-500 w-16">Fascia {blockIndex + 1}:</span>
                                  <Input
                                    type="time"
                                    value={block.start || '09:00'}
                                    onChange={(e) => updateTimeBlock(day.key, blockIndex, 'start', e.target.value)}
                                    className="w-28 h-8 text-sm"
                                  />
                                  <span className="text-gray-400">→</span>
                                  <Input
                                    type="time"
                                    value={block.end || '13:00'}
                                    onChange={(e) => updateTimeBlock(day.key, blockIndex, 'end', e.target.value)}
                                    className="w-28 h-8 text-sm"
                                  />
                                  {dayConfig.blocks.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeTimeBlock(day.key, blockIndex)}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Date bloccate */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      🚫 Chiusure straordinarie
                      <span className="text-xs font-normal text-gray-500">(ferie, festività, ecc.)</span>
                    </h4>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addBlockedDate}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Aggiungi chiusura
                    </Button>
                  </div>
                  
                  {(availabilitySettings?.blockedDates || []).length === 0 ? (
                    <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                      Nessuna chiusura straordinaria programmata
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availabilitySettings.blockedDates.map((blocked, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CalendarX className="h-4 w-4 text-red-500" />
                            <span className="font-medium text-red-700">
                              {blocked.date ? new Date(blocked.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Data non valida'}
                            </span>
                            {blocked.reason && <span className="text-sm text-red-600">- {blocked.reason}</span>}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBlockedDate(index)}
                            className="h-7 w-7 p-0 text-red-500 hover:bg-red-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Opzioni aggiuntive */}
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">⚙️ Opzioni prenotazione</h4>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availabilitySettings?.acceptOnlineBooking !== false}
                      onChange={(e) => setAvailabilitySettings(prev => ({...prev, acceptOnlineBooking: e.target.checked}))}
                      className="h-4 w-4 text-blue-500 rounded"
                    />
                    <div>
                      <span className="font-medium">Accetta prenotazioni online</span>
                      <p className="text-sm text-gray-500">I clienti possono richiedere appuntamenti tramite l'app</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availabilitySettings?.requireConfirmation !== false}
                      onChange={(e) => setAvailabilitySettings(prev => ({...prev, requireConfirmation: e.target.checked}))}
                      className="h-4 w-4 text-blue-500 rounded"
                    />
                    <div>
                      <span className="font-medium">Richiedi conferma manuale</span>
                      <p className="text-sm text-gray-500">Gli appuntamenti devono essere confermati dalla clinica</p>
                    </div>
                  </label>
                </div>

                {/* Pulsante salva */}
                <Button 
                  onClick={saveAvailabilitySettings} 
                  disabled={savingAvailability}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {savingAvailability ? (
                    <><RefreshCw className="h-4 w-4 animate-spin mr-2" />Salvataggio...</>
                  ) : (
                    <><Check className="h-4 w-4 mr-2" />Salva orari di disponibilità</>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profilo */}
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
                  <div>
                    <Label className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      WhatsApp Business
                    </Label>
                    <Input 
                      value={profileForm.whatsappNumber} 
                      onChange={(e) => setProfileForm({...profileForm, whatsappNumber: e.target.value})} 
                      placeholder="+39 333 1234567" 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Inserisci il numero con prefisso internazionale (es. +39 333...).
                      <a href="#" onClick={(e) => { e.preventDefault(); alert('📱 Come configurare WhatsApp Business:\n\n1. Scarica WhatsApp Business dal Play Store o App Store\n2. Registrati con il numero della clinica\n3. Configura il profilo: nome, descrizione, orari, indirizzo\n4. Inserisci lo stesso numero qui su vetbuddy\n\n✅ I clienti potranno contattarti direttamente dall\'app!\n\n💡 Consiglio: Usa i messaggi automatici per rispondere quando sei occupato.'); }} className="text-blue-500 hover:underline ml-1">
                        Come configurare?
                      </a>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Sito web</Label><Input value={profileForm.website} onChange={(e) => setProfileForm({...profileForm, website: e.target.value})} placeholder="www.clinicaveterinaria.it" /></div>
                </div>
                <div><Label>Descrizione clinica</Label><Textarea value={profileForm.description} onChange={(e) => setProfileForm({...profileForm, description: e.target.value})} placeholder="Descrivi i servizi e le specializzazioni della tua clinica..." rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Orario apertura</Label><Input type="time" value={profileForm.openingTime} onChange={(e) => setProfileForm({...profileForm, openingTime: e.target.value})} /></div>
                  <div><Label>Orario chiusura</Label><Input type="time" value={profileForm.closingTime} onChange={(e) => setProfileForm({...profileForm, closingTime: e.target.value})} /></div>
                </div>
                <div>
                  <Label>Policy di cancellazione (testo personalizzato)</Label>
                  <Textarea 
                    value={profileForm.cancellationPolicyText} 
                    onChange={(e) => setProfileForm({...profileForm, cancellationPolicyText: e.target.value})} 
                    placeholder="Es: Ti preghiamo di avvisarci almeno 24 ore prima in caso di disdetta. La mancata comunicazione comporterà un addebito di €30." 
                    rows={2} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Questo messaggio apparirà nelle email di promemoria e nella conferma di cancellazione</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingProfile(false)} className="flex-1">Annulla</Button>
                  <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600">Salva modifiche</Button>
                </div>
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
                  <div>
                    <Label className="text-gray-500 flex items-center gap-1">
                      <MessageCircle className="h-3 w-3 text-green-500" />
                      WhatsApp Business
                    </Label>
                    <p className="font-medium">{user.whatsappNumber || <span className="text-amber-600 text-sm">Non configurato</span>}</p>
                  </div>
                  <div><Label className="text-gray-500">Sito web</Label><p className="font-medium">{user.website || '-'}</p></div>
                </div>
                {user.description && <div><Label className="text-gray-500">Descrizione</Label><p className="text-sm text-gray-600">{user.description}</p></div>}
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-500">Orario apertura</Label><p className="font-medium">{user.openingTime || '09:00'}</p></div>
                  <div><Label className="text-gray-500">Orario chiusura</Label><p className="font-medium">{user.closingTime || '18:00'}</p></div>
                </div>
                {user.cancellationPolicyText && (
                  <div>
                    <Label className="text-gray-500">Policy di cancellazione</Label>
                    <p className="text-sm text-gray-600 bg-amber-50 p-2 rounded border border-amber-200">{user.cancellationPolicyText}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== CLINIC TUTORIAL INLINE ====================

export default ClinicSettings;
