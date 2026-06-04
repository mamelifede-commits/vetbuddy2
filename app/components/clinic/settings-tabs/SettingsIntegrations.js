'use client';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Bell, Calendar, CalendarCheck, CalendarX, CheckCircle, CreditCard, ExternalLink, FileText, MapPin, MessageCircle, RefreshCw, Search, Users } from 'lucide-react';
import api from '@/app/lib/api';

export default function SettingsIntegrations({ user }) {
  const [googleCalendarStatus, setGoogleCalendarStatus] = useState({ connected: false, loading: true });
  const [stripeSettings, setStripeSettings] = useState({ stripePublishableKey: '', stripeSecretKey: '', stripeConfigured: false });
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [stripeForm, setStripeForm] = useState({ publishableKey: '', secretKey: '' });
  const [saving, setSaving] = useState(false);
  const [staffColors, setStaffColors] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [locationForm, setLocationForm] = useState({ address: user.address || '', city: user.city || '', latitude: user.latitude || null, longitude: user.longitude || null });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  useEffect(() => {
    loadStripeSettings(); loadGoogleCalendarStatus(); loadStaffColors(); loadStaff();
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_success')) { alert('✅ Google Calendar connesso con successo!'); window.history.replaceState({}, '', window.location.pathname); loadGoogleCalendarStatus(); }
    if (params.get('google_error')) { alert('❌ Errore connessione Google Calendar: ' + params.get('google_error')); window.history.replaceState({}, '', window.location.pathname); }
  }, []);

  const loadGoogleCalendarStatus = async () => { try { const status = await api.get('google-calendar/status'); setGoogleCalendarStatus({ ...status, loading: false }); } catch (e) { setGoogleCalendarStatus({ connected: false, loading: false }); } };
  const loadStaffColors = async () => { try { setStaffColors(await api.get('staff-colors')); } catch (e) {} };
  const loadStaff = async () => { try { setStaffList(await api.get('staff')); } catch (e) {} };
  const connectGoogleCalendar = async () => { try { const { authUrl } = await api.get(`auth/google?clinicId=${user.id}`); window.location.href = authUrl; } catch (e) { alert('Errore: ' + e.message); } };
  const disconnectGoogleCalendar = async () => { if (!confirm('Sei sicuro di voler disconnettere Google Calendar?')) return; try { await api.post('google-calendar/disconnect', {}); setGoogleCalendarStatus({ connected: false, loading: false }); alert('Google Calendar disconnesso'); } catch (e) { alert('Errore: ' + e.message); } };
  const updateStaffColor = async (staffId, colorId) => { try { await api.post('staff/calendar-color', { staffId, colorId }); loadStaff(); } catch (e) { alert('Errore: ' + e.message); } };
  const loadStripeSettings = async () => { try { setStripeSettings(await api.get('clinic/stripe-settings')); } catch (e) {} };
  const saveStripeSettings = async () => { setSaving(true); try { await api.post('clinic/stripe-settings', { stripePublishableKey: stripeForm.publishableKey, stripeSecretKey: stripeForm.secretKey }); setShowStripeForm(false); loadStripeSettings(); alert('Configurazione Stripe salvata!'); } catch (e) { alert(e.message); } finally { setSaving(false); } };
  const detectLocation = () => { setDetectingLocation(true); if (navigator.geolocation) { navigator.geolocation.getCurrentPosition((p) => { setLocationForm(prev => ({ ...prev, latitude: p.coords.latitude, longitude: p.coords.longitude })); setDetectingLocation(false); }, () => { alert('Impossibile ottenere la posizione.'); setDetectingLocation(false); }, { enableHighAccuracy: true, timeout: 10000 }); } else { alert('Geolocalizzazione non supportata'); setDetectingLocation(false); } };
  const geocodeAddress = async () => { if (!locationForm.address || !locationForm.city) { alert('Inserisci indirizzo e città'); return; } setDetectingLocation(true); try { const data = await api.get(`geocode?address=${encodeURIComponent(`${locationForm.address}, ${locationForm.city}, Italia`)}`); if (data.success) { setLocationForm(prev => ({ ...prev, latitude: data.latitude, longitude: data.longitude })); alert('Coordinate trovate!'); } else { alert('Indirizzo non trovato.'); } } catch (e) { alert('Errore geocodifica.'); } finally { setDetectingLocation(false); } };
  const saveLocation = async () => { setSavingLocation(true); try { await api.put('clinic/profile', locationForm); alert('Posizione salvata!'); } catch (e) { alert(e.message); } finally { setSavingLocation(false); } };

  return (
    <div className="space-y-6">
      {/* Stripe */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5 text-coral-500" />Pagamenti clienti (Stripe)</CardTitle><CardDescription>Configura il tuo Stripe per ricevere pagamenti dai clienti</CardDescription></CardHeader>
        <CardContent>
          {stripeSettings.stripeConfigured ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg"><div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-600" /><div><p className="font-medium text-green-800">Stripe configurato</p><p className="text-sm text-green-600">Chiave: {stripeSettings.stripeSecretKey}</p></div></div><Button variant="outline" size="sm" onClick={() => setShowStripeForm(true)}>Modifica</Button></div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div><p className="font-medium">Non configurato</p><p className="text-sm text-gray-500">Configura per ricevere pagamenti online</p></div><Button className="bg-coral-500 hover:bg-coral-600" onClick={() => setShowStripeForm(true)}>Configura Stripe</Button></div>
          )}
          {showStripeForm && (
            <div className="mt-4 p-4 border rounded-lg space-y-4">
              <div><Label>Publishable Key (pk_...)</Label><Input value={stripeForm.publishableKey} onChange={(e) => setStripeForm({...stripeForm, publishableKey: e.target.value})} placeholder="Inserisci la tua Publishable Key Stripe" /></div>
              <div><Label>Secret Key (sk_...)</Label><Input type="password" value={stripeForm.secretKey} onChange={(e) => setStripeForm({...stripeForm, secretKey: e.target.value})} placeholder="Inserisci la tua Secret Key Stripe" /></div>
              <div className="flex gap-2"><Button onClick={saveStripeSettings} disabled={saving} className="bg-coral-500 hover:bg-coral-600">{saving ? 'Salvataggio...' : 'Salva'}</Button><Button variant="outline" onClick={() => setShowStripeForm(false)}>Annulla</Button></div>
              <p className="text-xs text-gray-500">Trova le tue chiavi su <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="text-coral-500 hover:underline">dashboard.stripe.com/apikeys</a></p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Calendar */}
      <Card className="border-green-200">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-green-600" />Google Calendar{googleCalendarStatus.connected && <Badge className="bg-green-100 text-green-700 ml-2">Connesso</Badge>}</CardTitle><CardDescription>Sincronizza appuntamenti in tempo reale</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {googleCalendarStatus.loading ? (
            <div className="flex items-center justify-center p-8"><RefreshCw className="h-6 w-6 animate-spin text-gray-400" /></div>
          ) : googleCalendarStatus.connected ? (
            <>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between"><div className="flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-600" /><div><p className="font-medium text-green-800">Calendario connesso</p><p className="text-sm text-green-600">{googleCalendarStatus.calendarName || 'Calendario principale'}</p></div></div><Button variant="outline" size="sm" onClick={disconnectGoogleCalendar} className="text-red-600 border-red-300 hover:bg-red-50">Disconnetti</Button></div>
                {googleCalendarStatus.lastSync && <p className="text-xs text-green-600 mt-2">Ultima sincronizzazione: {new Date(googleCalendarStatus.lastSync).toLocaleString('it-IT')}</p>}
              </div>
              <div className="mt-4"><h4 className="font-medium mb-3 flex items-center gap-2"><Users className="h-4 w-4" />Colori staff per il calendario</h4><p className="text-sm text-gray-500 mb-3">Assegna un colore a ogni collaboratore.</p>
                <div className="space-y-2">{staffList.length === 0 ? <p className="text-sm text-gray-400 italic">Nessuno staff aggiunto.</p> : staffList.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: staffColors.find(c => c.id === parseInt(staff.calendarColorId))?.hex || '#6B7280' }}>{staff.name?.charAt(0)?.toUpperCase() || 'S'}</div><div><p className="font-medium text-sm">{staff.name}</p><p className="text-xs text-gray-500">{staff.role}</p></div></div>
                    <Select value={staff.calendarColorId?.toString() || '1'} onValueChange={(v) => updateStaffColor(staff.id, v)}><SelectTrigger className="w-36"><SelectValue placeholder="Colore" /></SelectTrigger><SelectContent>{staffColors.map((color) => (<SelectItem key={color.id} value={color.id.toString()}><div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full" style={{ backgroundColor: color.hex }} />{color.name}</div></SelectItem>))}</SelectContent></Select>
                  </div>
                ))}</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4"><p className="text-sm text-blue-700"><strong>Come funziona:</strong> Quando crei un appuntamento su vetbuddy, viene automaticamente aggiunto al tuo Google Calendar.</p></div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div><p className="font-medium">Non connesso</p><p className="text-sm text-gray-500">Connetti per sincronizzare gli appuntamenti</p></div><Button className="bg-green-600 hover:bg-green-700" onClick={connectGoogleCalendar}><ExternalLink className="h-4 w-4 mr-2" />Connetti Google Calendar</Button></div>
              <div className="grid md:grid-cols-3 gap-3"><div className="p-3 bg-gray-50 rounded-lg text-center"><CalendarCheck className="h-6 w-6 text-gray-400 mx-auto mb-2" /><p className="text-sm font-medium">Sync automatico</p></div><div className="p-3 bg-gray-50 rounded-lg text-center"><AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" /><p className="text-sm font-medium">No doppioni</p></div><div className="p-3 bg-gray-50 rounded-lg text-center"><Users className="h-6 w-6 text-gray-400 mx-auto mb-2" /><p className="text-sm font-medium">Colori staff</p></div></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card className="border-green-200">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageCircle className="h-5 w-5 text-green-500" />Notifiche WhatsApp<Badge className="bg-green-100 text-green-700 ml-2">Attivo</Badge></CardTitle><CardDescription>Invia promemoria appuntamenti e notifiche ai clienti via WhatsApp</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg"><div className="flex items-center gap-3 mb-3"><CheckCircle className="h-6 w-6 text-green-600" /><div><p className="font-medium text-green-800">WhatsApp Business configurato</p><p className="text-sm text-green-600">Numero: +39 388 744 1417</p></div></div></div>
          <div className="space-y-3"><h4 className="font-medium">Notifiche automatiche disponibili:</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3"><div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center"><Calendar className="h-4 w-4 text-blue-600" /></div><div><p className="text-sm font-medium">Promemoria appuntamento</p><p className="text-xs text-gray-500">24h e 2h prima della visita</p></div></div>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3"><div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle className="h-4 w-4 text-green-600" /></div><div><p className="text-sm font-medium">Conferma prenotazione</p><p className="text-xs text-gray-500">Automatica alla prenotazione</p></div></div>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3"><div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center"><FileText className="h-4 w-4 text-purple-600" /></div><div><p className="text-sm font-medium">Documento pronto</p><p className="text-xs text-gray-500">Quando carichi referti/prescrizioni</p></div></div>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3"><div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center"><CreditCard className="h-4 w-4 text-amber-600" /></div><div><p className="text-sm font-medium">Pagamento ricevuto</p><p className="text-xs text-gray-500">Conferma pagamenti online</p></div></div>
            </div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg"><div className="flex items-start gap-2"><Bell className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" /><div className="text-sm"><p className="font-medium text-blue-800">Come funziona</p><p className="text-blue-600">I clienti devono avere un numero WhatsApp registrato nel loro profilo.</p></div></div></div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="border-blue-200">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-blue-500" />Posizione clinica</CardTitle><CardDescription>Imposta la posizione per essere trovato dai clienti</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Indirizzo</Label><Input value={locationForm.address} onChange={(e) => setLocationForm({...locationForm, address: e.target.value})} placeholder="Via Roma 1" /></div>
            <div><Label>Città</Label><Input value={locationForm.city} onChange={(e) => setLocationForm({...locationForm, city: e.target.value})} placeholder="Milano" /></div>
          </div>
          {locationForm.latitude && locationForm.longitude ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2"><CheckCircle className="h-5 w-5 text-green-600" /><span className="font-medium text-green-800">Coordinate impostate</span></div>
              <p className="text-sm text-green-700">Lat: {locationForm.latitude.toFixed(6)}, Lng: {locationForm.longitude.toFixed(6)}</p>
              <div className="mt-3"><iframe width="100%" height="150" style={{ border: 0, borderRadius: '8px' }} loading="lazy" src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${locationForm.latitude},${locationForm.longitude}&zoom=15`} /></div>
            </div>
          ) : (<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg"><div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-amber-600" /><span className="text-sm text-amber-700">Nessuna posizione impostata.</span></div></div>)}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={detectLocation} disabled={detectingLocation}>{detectingLocation ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}Usa posizione attuale</Button>
            <Button variant="outline" onClick={geocodeAddress} disabled={detectingLocation || (!locationForm.address && !locationForm.city)}>{detectingLocation ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}Cerca da indirizzo</Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={saveLocation} disabled={savingLocation || !locationForm.latitude}>{savingLocation ? 'Salvataggio...' : 'Salva posizione'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
