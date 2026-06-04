'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarX, Check, Clock, CreditCard, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import api from '@/app/lib/api';

export default function SettingsAvailability({ user }) {
  const [availabilitySettings, setAvailabilitySettings] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({ paymentMethods: { cash: true, cardInClinic: true, bankTransfer: false, online: false }, cancellationPolicy: 'free_24h' });
  const [paymentSettingsSaving, setPaymentSettingsSaving] = useState(false);

  useEffect(() => { loadAvailabilitySettings(); loadPaymentSettings(); }, []);

  const loadAvailabilitySettings = async () => {
    setLoadingAvailability(true);
    try { setAvailabilitySettings(await api.get('clinic/availability')); } catch (e) {
      setAvailabilitySettings({ weeklySchedule: { monday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] }, tuesday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] }, wednesday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] }, thursday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] }, friday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] }, saturday: { enabled: false, blocks: [] }, sunday: { enabled: false, blocks: [] } }, slotDuration: 30, blockedDates: [], acceptOnlineBooking: true, requireConfirmation: true });
    } finally { setLoadingAvailability(false); }
  };

  const saveAvailabilitySettings = async () => { setSavingAvailability(true); try { await api.put('clinic/availability', availabilitySettings); alert('✅ Orari di disponibilità salvati!'); } catch (e) { alert('❌ Errore nel salvataggio'); } finally { setSavingAvailability(false); } };
  const updateDayEnabled = (day, enabled) => { setAvailabilitySettings(prev => ({ ...prev, weeklySchedule: { ...prev.weeklySchedule, [day]: { ...prev.weeklySchedule[day], enabled, blocks: enabled && (!prev.weeklySchedule[day]?.blocks || prev.weeklySchedule[day].blocks.length === 0) ? [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] : prev.weeklySchedule[day]?.blocks || [] } } })); };
  const updateTimeBlock = (day, blockIndex, field, value) => { setAvailabilitySettings(prev => ({ ...prev, weeklySchedule: { ...prev.weeklySchedule, [day]: { ...prev.weeklySchedule[day], blocks: prev.weeklySchedule[day].blocks.map((block, i) => i === blockIndex ? { ...block, [field]: value } : block) } } })); };
  const addTimeBlock = (day) => { setAvailabilitySettings(prev => ({ ...prev, weeklySchedule: { ...prev.weeklySchedule, [day]: { ...prev.weeklySchedule[day], blocks: [...(prev.weeklySchedule[day]?.blocks || []), { start: '09:00', end: '12:00' }] } } })); };
  const removeTimeBlock = (day, blockIndex) => { setAvailabilitySettings(prev => ({ ...prev, weeklySchedule: { ...prev.weeklySchedule, [day]: { ...prev.weeklySchedule[day], blocks: prev.weeklySchedule[day].blocks.filter((_, i) => i !== blockIndex) } } })); };
  const addBlockedDate = () => { const date = prompt('Inserisci la data da bloccare (YYYY-MM-DD):'); if (!date) return; const reason = prompt('Motivo (opzionale):') || 'Chiuso'; setAvailabilitySettings(prev => ({ ...prev, blockedDates: [...(prev.blockedDates || []), { date, reason }] })); };
  const removeBlockedDate = (index) => { setAvailabilitySettings(prev => ({ ...prev, blockedDates: prev.blockedDates.filter((_, i) => i !== index) })); };
  const loadPaymentSettings = async () => { try { const r = await api.get(`clinic/payment-settings?clinicId=${user.id}`); if (r.success && r.settings) setPaymentSettings(r.settings); } catch (e) {} };
  const updatePaymentMethod = async (method, enabled) => { setPaymentSettingsSaving(true); const newMethods = { ...paymentSettings.paymentMethods, [method]: enabled }; setPaymentSettings(prev => ({ ...prev, paymentMethods: newMethods })); try { await api.put('clinic/payment-settings', { paymentMethods: newMethods }); } catch (e) {} finally { setPaymentSettingsSaving(false); } };
  const updateCancellationPolicy = async (policyId) => { setPaymentSettingsSaving(true); setPaymentSettings(prev => ({ ...prev, cancellationPolicy: policyId })); try { await api.put('clinic/payment-settings', { cancellationPolicy: policyId }); } catch (e) {} finally { setPaymentSettingsSaving(false); } };

  const DAYS = [ { key: 'monday', label: 'Lunedì' }, { key: 'tuesday', label: 'Martedì' }, { key: 'wednesday', label: 'Mercoledì' }, { key: 'thursday', label: 'Giovedì' }, { key: 'friday', label: 'Venerdì' }, { key: 'saturday', label: 'Sabato' }, { key: 'sunday', label: 'Domenica' } ];

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <Card className="border-green-200">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5 text-green-500" />Metodi di Pagamento & Cancellazione</CardTitle><CardDescription>Configura come i clienti possono pagare e le policy di cancellazione</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Metodi di pagamento accettati</h4>
            <div className="grid grid-cols-2 gap-3">
              {[{ key: 'cash', label: 'Contanti', icon: '💵', def: true }, { key: 'cardInClinic', label: 'Carta in clinica', icon: '💳', def: true }, { key: 'bankTransfer', label: 'Bonifico', icon: '🏦', def: false }, { key: 'online', label: 'Online (Stripe)', icon: '🌐', def: false }].map(m => (
                <label key={m.key} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={m.def ? paymentSettings?.paymentMethods?.[m.key] !== false : paymentSettings?.paymentMethods?.[m.key] === true} onChange={(e) => updatePaymentMethod(m.key, e.target.checked)} className="h-4 w-4 text-green-500 rounded" />
                  <span className="text-lg">{m.icon}</span><span>{m.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Policy di cancellazione</h4>
            <div className="space-y-2">
              {[ { id: 'free_24h', label: 'Cancellazione gratuita fino a 24h prima' }, { id: 'free_48h', label: 'Cancellazione gratuita fino a 48h prima' }, { id: 'penalty_30_24h', label: 'Penale 30% se cancelli meno di 24h prima' }, { id: 'penalty_50_24h', label: 'Penale 50% se cancelli meno di 24h prima' }, { id: 'penalty_100_24h', label: 'Nessun rimborso se cancelli meno di 24h prima' }, { id: 'no_refund', label: 'Nessun rimborso per cancellazioni' } ].map(policy => (
                <label key={policy.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${paymentSettings?.cancellationPolicy === policy.id ? 'border-green-500 bg-green-50' : ''}`}>
                  <input type="radio" name="cancellationPolicy" checked={paymentSettings?.cancellationPolicy === policy.id} onChange={() => updateCancellationPolicy(policy.id)} className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{policy.label}</span>
                </label>
              ))}
            </div>
          </div>
          {paymentSettingsSaving && <p className="text-sm text-green-600 flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" />Salvataggio...</p>}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card className="border-blue-200">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-blue-500" />Orari di Disponibilità</CardTitle><CardDescription>Configura le fasce orarie in cui i clienti possono prenotare.</CardDescription></CardHeader>
        <CardContent>
          {loadingAvailability ? (
            <div className="flex items-center justify-center p-8"><RefreshCw className="h-6 w-6 animate-spin text-blue-500" /></div>
          ) : (
            <div className="space-y-4">
              {/* Slot duration */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div><p className="font-medium">Durata slot appuntamento</p><p className="text-sm text-gray-500">Quanto dura mediamente una visita</p></div>
                <Select value={String(availabilitySettings?.slotDuration || 30)} onValueChange={(v) => setAvailabilitySettings(prev => ({...prev, slotDuration: parseInt(v)}))}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>{['15','20','30','45','60'].map(v => <SelectItem key={v} value={v}>{v} min</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Weekly schedule */}
              <div className="space-y-3">
                <h4 className="font-medium">📅 Orari settimanali</h4>
                {availabilitySettings?.weeklySchedule && DAYS.map(day => {
                  const dayConfig = availabilitySettings.weeklySchedule[day.key] || { enabled: false, blocks: [] };
                  return (
                    <div key={day.key} className={`p-3 border rounded-lg ${dayConfig.enabled ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={dayConfig.enabled || false} onChange={(e) => updateDayEnabled(day.key, e.target.checked)} className="h-4 w-4 text-blue-500 rounded" />
                          <span className={`font-medium w-24 ${dayConfig.enabled ? 'text-gray-800' : 'text-gray-400'}`}>{day.label}</span>
                        </div>
                        {dayConfig.enabled && <Button type="button" variant="outline" size="sm" onClick={() => addTimeBlock(day.key)} className="text-xs h-7"><Plus className="h-3 w-3 mr-1" />Aggiungi fascia</Button>}
                      </div>
                      {dayConfig.enabled && (
                        <div className="space-y-2 ml-7">
                          {(dayConfig.blocks || []).length === 0 ? <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">⚠️ Nessuna fascia oraria.</p> : dayConfig.blocks.map((block, bi) => (
                            <div key={bi} className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                              <span className="text-xs text-gray-500 w-16">Fascia {bi + 1}:</span>
                              <Input type="time" value={block.start || '09:00'} onChange={(e) => updateTimeBlock(day.key, bi, 'start', e.target.value)} className="w-28 h-8 text-sm" />
                              <span className="text-gray-400">→</span>
                              <Input type="time" value={block.end || '13:00'} onChange={(e) => updateTimeBlock(day.key, bi, 'end', e.target.value)} className="w-28 h-8 text-sm" />
                              {dayConfig.blocks.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeTimeBlock(day.key, bi)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Blocked dates */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">🚫 Chiusure straordinarie</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addBlockedDate} className="text-xs"><Plus className="h-3 w-3 mr-1" />Aggiungi chiusura</Button>
                </div>
                {(availabilitySettings?.blockedDates || []).length === 0 ? <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">Nessuna chiusura straordinaria</p> : (
                  <div className="space-y-2">{availabilitySettings.blockedDates.map((blocked, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2"><CalendarX className="h-4 w-4 text-red-500" /><span className="font-medium text-red-700">{blocked.date ? new Date(blocked.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Data non valida'}</span>{blocked.reason && <span className="text-sm text-red-600">- {blocked.reason}</span>}</div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeBlockedDate(index)} className="h-7 w-7 p-0 text-red-500 hover:bg-red-100"><X className="h-4 w-4" /></Button>
                    </div>
                  ))}</div>
                )}
              </div>

              {/* Booking options */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">⚙️ Opzioni prenotazione</h4>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer"><input type="checkbox" checked={availabilitySettings?.acceptOnlineBooking !== false} onChange={(e) => setAvailabilitySettings(prev => ({...prev, acceptOnlineBooking: e.target.checked}))} className="h-4 w-4 text-blue-500 rounded" /><div><span className="font-medium">Accetta prenotazioni online</span><p className="text-sm text-gray-500">I clienti possono richiedere appuntamenti tramite l&apos;app</p></div></label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer"><input type="checkbox" checked={availabilitySettings?.requireConfirmation !== false} onChange={(e) => setAvailabilitySettings(prev => ({...prev, requireConfirmation: e.target.checked}))} className="h-4 w-4 text-blue-500 rounded" /><div><span className="font-medium">Richiedi conferma manuale</span><p className="text-sm text-gray-500">Gli appuntamenti devono essere confermati dalla clinica</p></div></label>
              </div>

              <Button onClick={saveAvailabilitySettings} disabled={savingAvailability} className="w-full bg-blue-500 hover:bg-blue-600">
                {savingAvailability ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" />Salvataggio...</> : <><Check className="h-4 w-4 mr-2" />Salva orari di disponibilità</>}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
