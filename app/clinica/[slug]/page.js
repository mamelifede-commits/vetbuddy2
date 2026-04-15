'use client';
// Public Clinic Booking Page - /clinica/[slug]

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const PawIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>;
const LoaderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

export default function ClinicBookingPage() {
  const params = useParams();
  const slug = params?.slug;

  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState(1); // 1=info, 2=form, 3=success
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    petName: '',
    petSpecies: 'dog',
    service: '',
    date: '',
    time: 'mattina',
    notes: ''
  });

  useEffect(() => {
    if (slug) loadClinic();
  }, [slug]);

  const loadClinic = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clinica/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setClinic(data);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setNotFound(true);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ownerName || !form.ownerPhone || !form.petName || !form.date) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/clinica/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setStep(3);
      } else {
        const err = await res.json();
        alert(err.error || 'Errore nella prenotazione');
      }
    } catch (err) {
      alert('Errore di connessione. Riprova.');
    }
    setSubmitting(false);
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center">
        <div className="text-center">
          <LoaderIcon />
          <p className="mt-4 text-gray-500">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-10">
            <div className="text-6xl mb-4">🐾</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Clinica non trovata</h1>
            <p className="text-gray-500 mb-6">Il link potrebbe essere errato o la clinica non è più attiva.</p>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Vai alla Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-10">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckIcon />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Richiesta Inviata! ✅</h1>
            <p className="text-gray-600 mb-6">
              La tua richiesta di appuntamento è stata inviata a <strong>{clinic?.clinicName}</strong>. 
              Ti contatteranno al numero fornito per confermare data e orario.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-1 mb-6">
              <p><strong>Animale:</strong> {form.petName}</p>
              <p><strong>Data richiesta:</strong> {new Date(form.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <p><strong>Fascia:</strong> {form.time === 'mattina' ? '🌅 Mattina (9-12)' : form.time === 'pomeriggio' ? '☀️ Pomeriggio (14-18)' : form.time}</p>
              <p><strong>Servizio:</strong> {form.service || 'Visita generica'}</p>
            </div>
            <Button onClick={() => window.location.href = '/'} className="bg-violet-600 hover:bg-violet-700 w-full">
              🐾 Scopri vetbuddy
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-purple-50">
      {/* Header with clinic info */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-3 opacity-80">
            <PawIcon />
            <span className="text-sm font-medium">vetbuddy — Prenota Online</span>
          </div>
          <h1 className="text-3xl font-bold">{clinic?.clinicName}</h1>
          {clinic?.description && <p className="mt-2 text-violet-200">{clinic.description}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-violet-200">
            {clinic?.address && (
              <span className="flex items-center gap-1"><MapPinIcon /> {clinic.address}{clinic.city ? `, ${clinic.city}` : ''}</span>
            )}
            {clinic?.phone && (
              <a href={`tel:${clinic.phone}`} className="flex items-center gap-1 hover:text-white"><PhoneIcon /> {clinic.phone}</a>
            )}
            {clinic?.completedAppointments > 0 && (
              <Badge className="bg-white/20 text-white border-0">{clinic.completedAppointments}+ visite completate</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {step === 1 && (
          <div className="space-y-6">
            {/* Services */}
            {clinic?.services && clinic.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🏥 Servizi Disponibili</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {clinic.services.map((s, i) => (
                      <Badge key={i} variant="secondary" className="bg-violet-50 text-violet-700 border-violet-200 py-1.5 px-3">
                        {typeof s === 'object' ? s.name || s.id : s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Working hours */}
            {clinic?.workingHours && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><ClockIcon /> Orari</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(clinic.workingHours).map(([day, hours]) => {
                      const dayNames = { lun: 'Lunedì', mar: 'Martedì', mer: 'Mercoledì', gio: 'Giovedì', ven: 'Venerdì', sab: 'Sabato', dom: 'Domenica' };
                      return (
                        <div key={day} className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium text-gray-700">{dayNames[day] || day}</span>
                          <span className="text-gray-500">{hours || 'Chiuso'}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={() => setStep(2)} className="w-full bg-violet-600 hover:bg-violet-700 h-14 text-lg">
              <CalendarIcon /> <span className="ml-2">Prenota Appuntamento</span>
            </Button>
          </div>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon /> Prenota il tuo appuntamento
              </CardTitle>
              <p className="text-sm text-gray-500">Compila il modulo e la clinica ti contatterà per confermare</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Owner info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-gray-700">👤 I tuoi dati</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome e Cognome *</Label>
                      <Input 
                        value={form.ownerName} 
                        onChange={(e) => setForm({...form, ownerName: e.target.value})}
                        placeholder="Mario Rossi"
                        required
                      />
                    </div>
                    <div>
                      <Label>Telefono *</Label>
                      <Input 
                        value={form.ownerPhone}
                        onChange={(e) => setForm({...form, ownerPhone: e.target.value})}
                        placeholder="+39 333 1234567"
                        type="tel"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email (opzionale)</Label>
                    <Input 
                      value={form.ownerEmail}
                      onChange={(e) => setForm({...form, ownerEmail: e.target.value})}
                      placeholder="mario@email.com"
                      type="email"
                    />
                  </div>
                </div>

                {/* Pet info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-gray-700">🐾 Il tuo animale</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome Animale *</Label>
                      <Input 
                        value={form.petName}
                        onChange={(e) => setForm({...form, petName: e.target.value})}
                        placeholder="Fido"
                        required
                      />
                    </div>
                    <div>
                      <Label>Specie</Label>
                      <Select value={form.petSpecies} onValueChange={(v) => setForm({...form, petSpecies: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">🐕 Cane</SelectItem>
                          <SelectItem value="cat">🐱 Gatto</SelectItem>
                          <SelectItem value="bird">🦜 Uccello</SelectItem>
                          <SelectItem value="rabbit">🐰 Coniglio</SelectItem>
                          <SelectItem value="hamster">🐹 Criceto</SelectItem>
                          <SelectItem value="reptile">🦎 Rettile</SelectItem>
                          <SelectItem value="other">🐾 Altro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Appointment details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-gray-700">📅 Dettagli Appuntamento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Servizio</Label>
                      <Select value={form.service} onValueChange={(v) => setForm({...form, service: v})}>
                        <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Visita generica">Visita generica</SelectItem>
                          <SelectItem value="Vaccinazione">Vaccinazione</SelectItem>
                          <SelectItem value="Controllo">Controllo / Follow-up</SelectItem>
                          <SelectItem value="Dermatologia">Dermatologia</SelectItem>
                          <SelectItem value="Odontoiatria">Odontoiatria</SelectItem>
                          <SelectItem value="Chirurgia">Chirurgia</SelectItem>
                          <SelectItem value="Ecografia">Ecografia</SelectItem>
                          <SelectItem value="Analisi sangue">Analisi sangue</SelectItem>
                          <SelectItem value="Altro">Altro</SelectItem>
                          {clinic?.services?.filter(s => typeof s === 'string').map((s, i) => (
                            <SelectItem key={`cs-${i}`} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Data Preferita *</Label>
                      <Input 
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({...form, date: e.target.value})}
                        min={getMinDate()}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Fascia Oraria Preferita</Label>
                    <Select value={form.time} onValueChange={(v) => setForm({...form, time: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mattina">🌅 Mattina (9:00 - 12:00)</SelectItem>
                        <SelectItem value="pomeriggio">☀️ Pomeriggio (14:00 - 18:00)</SelectItem>
                        <SelectItem value="qualsiasi">🕐 Qualsiasi orario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Note aggiuntive</Label>
                    <Textarea 
                      value={form.notes}
                      onChange={(e) => setForm({...form, notes: e.target.value})}
                      placeholder="Descrivi brevemente il motivo della visita..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Indietro
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting || !form.ownerName || !form.ownerPhone || !form.petName || !form.date}
                    className="flex-[2] bg-violet-600 hover:bg-violet-700 h-12"
                  >
                    {submitting ? (
                      <><LoaderIcon /> <span className="ml-2">Invio in corso...</span></>
                    ) : (
                      '📅 Invia Richiesta Appuntamento'
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-gray-400">
                  Questa è una richiesta di appuntamento. La clinica ti contatterà per confermare data e orario definitivi.
                </p>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-sm text-gray-400">
        Powered by <a href="/" className="text-violet-500 hover:underline font-medium">vetbuddy</a> — La piattaforma veterinaria digitale
      </div>
    </div>
  );
}
