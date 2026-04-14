'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, Mail, PawPrint, Stethoscope, FlaskConical, Truck, Clock, MapPin } from 'lucide-react';
import VetBuddyLogo from '@/app/components/common/VetBuddyLogo';
import api from '@/app/lib/api';

const LAB_SPECIALIZATIONS = [
  'Ematologia', 'Biochimica', 'Microbiologia', 'Parassitologia',
  'Citologia', 'Istologia', 'Genetica', 'Allergologia',
  'Tossicologia', 'Endocrinologia', 'Immunologia', 'Virologia'
];

function AuthForm({ mode, setMode, onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [formData, setFormData] = useState({ 
    email: '', password: '', name: '', role: 'owner', clinicName: '', phone: '', city: '', vatNumber: '', website: '',
    staffCount: '', services: [],
    address: '', postalCode: '', pilotMotivation: '',
    // Lab fields
    labName: '', province: '', contactPerson: '', description: '',
    specializations: [], pickupAvailable: false, pickupDays: '', pickupHours: '',
    averageReportTime: ''
  });
  const [pilotRequestSent, setPilotRequestSent] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [labRegistrationComplete, setLabRegistrationComplete] = useState(false);
  const [serviceCatalog, setServiceCatalog] = useState({});

  // Handle mode from parent: register-lab
  useEffect(() => {
    if (mode === 'register-lab') {
      setFormData(prev => ({ ...prev, role: 'lab' }));
      setMode('register');
    }
  }, [mode]);

  useEffect(() => {
    if (formData.role === 'clinic' && Object.keys(serviceCatalog).length === 0) {
      loadServiceCatalog();
    }
  }, [formData.role]);

  const loadServiceCatalog = async () => {
    try {
      const catalog = await api.get('services');
      setServiceCatalog(catalog);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const toggleService = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId) 
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const toggleSpecialization = (spec) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec) 
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const data = await api.post('auth/login', formData);
        api.setToken(data.token);
        onLogin(data.user);
      } else if (formData.role === 'lab') {
        // Lab registration
        const labData = {
          email: formData.email,
          password: formData.password,
          labName: formData.labName,
          vatNumber: formData.vatNumber,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          contactPerson: formData.contactPerson || formData.name,
          description: formData.description,
          specializations: formData.specializations,
          pickupAvailable: formData.pickupAvailable,
          pickupDays: formData.pickupDays,
          pickupHours: formData.pickupHours,
          averageReportTime: formData.averageReportTime
        };
        // Check for invitation token in URL
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const invToken = urlParams.get('invite');
          if (invToken) labData.invitationToken = invToken;
        }
        await api.post('labs/register', labData);
        setLabRegistrationComplete(true);
      } else if (formData.role === 'clinic') {
        await api.post('pilot-applications', formData);
        setPilotRequestSent(true);
      } else {
        await api.post('auth/register', formData);
        setRegistrationComplete(true);
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await api.post('auth/forgot-password', { email: forgotEmail });
      setSuccess(data.message);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  // Schermata conferma Pilot
  if (pilotRequestSent) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Candidatura inviata! 🎉</h3>
        <p className="text-gray-600 mb-4">Grazie per il tuo interesse in vetbuddy!</p>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4 text-left">
          <p className="text-sm text-green-700 mb-2"><strong>📧 Ti abbiamo inviato una email di conferma.</strong></p>
          <p className="text-sm text-green-700"><strong>⏱️ Prossimi passi:</strong></p>
          <ul className="text-sm text-green-700 list-disc ml-4 mt-1">
            <li>Esamineremo la tua candidatura</li>
            <li>Ti contatteremo entro <strong>48 ore lavorative</strong></li>
            <li>Se approvato, riceverai le credenziali di accesso</li>
          </ul>
        </div>
        <Button onClick={() => { setPilotRequestSent(false); setMode('login'); }} variant="outline" className="w-full">Chiudi</Button>
      </div>
    );
  }

  // Schermata conferma registrazione Lab
  if (labRegistrationComplete) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <FlaskConical className="h-8 w-8 text-purple-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Registrazione completata! 🧪</h3>
        <p className="text-gray-600 mb-4">Il tuo laboratorio è stato registrato su VetBuddy.</p>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-4 text-left">
          <p className="text-sm text-purple-700 mb-2"><strong>📋 Cosa succede ora:</strong></p>
          <ul className="text-sm text-purple-700 list-disc ml-4 mt-1 space-y-1">
            <li>Il nostro team <strong>verificherà la registrazione</strong></li>
            <li>Riceverai una email di conferma approvazione</li>
            <li>Una volta approvato, potrai accedere alla <strong>Dashboard Laboratorio</strong></li>
            <li>Il tuo profilo sarà visibile nel <strong>Marketplace</strong> per le cliniche</li>
          </ul>
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <p className="text-sm text-green-700">🎁 <strong>Piano Lab Partner:</strong> 6 mesi gratis (o 50 richieste). Dopo: €29/mese.</p>
        </div>
        <Button onClick={() => { setLabRegistrationComplete(false); setMode('login'); }} variant="outline" className="w-full">Torna al Login</Button>
      </div>
    );
  }

  // Schermata conferma registrazione
  if (registrationComplete) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Quasi fatto! 📧</h3>
        <p className="text-gray-600 mb-4">Abbiamo inviato un'email di verifica a <strong>{formData.email}</strong></p>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4 text-left">
          <p className="text-sm text-blue-700 mb-2"><strong>📋 Completa la verifica:</strong></p>
          <ol className="text-sm text-blue-700 list-decimal ml-4 mt-1 space-y-1">
            <li>Apri l'email che ti abbiamo inviato</li>
            <li>Clicca sul pulsante <strong>"Verifica Email"</strong></li>
            <li>Il tuo account sarà subito attivo!</li>
          </ol>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
          <p className="text-sm text-amber-700"><strong>💡 Non trovi l'email?</strong> Controlla nella cartella spam o promozioni.</p>
        </div>
        <Button onClick={() => { setRegistrationComplete(false); setMode('login'); }} variant="outline" className="w-full">Ho verificato, accedi</Button>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4"><VetBuddyLogo size={50} showText={true} /></div>
          <DialogTitle className="text-2xl text-gray-700">Password dimenticata?</DialogTitle>
          <DialogDescription>Inserisci la tua email per ricevere un link di reset</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
          <div><Label>Email</Label><Input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required placeholder="La tua email" /></div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={loading}>
            {loading ? 'Invio...' : 'Invia link di reset'}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>Torna al login</Button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <DialogHeader className="text-center">
        <div className="flex justify-center mb-4"><VetBuddyLogo size={50} showText={true} /></div>
        <DialogDescription>{mode === 'login' ? 'Accedi al tuo account' : 'Crea un nuovo account'}</DialogDescription>
      </DialogHeader>
      <Tabs value={mode} onValueChange={setMode} className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Accedi</TabsTrigger>
          <TabsTrigger value="register">Registrati</TabsTrigger>
        </TabsList>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <Label>Sono un...</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner"><div className="flex items-center gap-2"><PawPrint className="h-4 w-4" />Proprietario di animale</div></SelectItem>
                    <SelectItem value="clinic"><div className="flex items-center gap-2"><Stethoscope className="h-4 w-4" />Veterinario (Clinica)</div></SelectItem>
                    <SelectItem value="lab"><div className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-purple-500" />Laboratorio di Analisi</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.role === 'clinic' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 mb-2"><strong>🏥 Per Cliniche e Liberi Professionisti:</strong></p>
                  <p className="text-xs text-amber-700">vetbuddy è perfetto sia per le cliniche veterinarie che per i <strong>veterinari liberi professionisti</strong>.</p>
                  <p className="text-xs text-amber-600 mt-1">Compila il form e ti contatteremo per l'attivazione (Accesso Pilot).</p>
                </div>
              )}
              
              {formData.role === 'owner' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700"><strong>Nota:</strong> vetbuddy è in fase Pilot. Alcune cliniche potrebbero non essere ancora affiliate.</p>
                </div>
              )}

              {formData.role === 'lab' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-purple-700 mb-1"><strong>🧪 Laboratorio di Analisi Veterinarie</strong></p>
                  <p className="text-xs text-purple-600">Registrati gratuitamente. Il tuo profilo sarà visibile nel marketplace dopo l'approvazione.</p>
                  <p className="text-xs text-purple-600 mt-1">🎁 <strong>6 mesi gratis</strong> (o 50 richieste) con il Piano Lab Partner.</p>
                </div>
              )}
              
              {/* Owner fields */}
              {formData.role === 'owner' && (
                <>
                  <div><Label>Nome completo *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Mario Rossi" /></div>
                  <div><Label>Telefono *</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required placeholder="+39 02 1234567" /></div>
                </>
              )}

              {/* Clinic fields */}
              {formData.role === 'clinic' && (
                <>
                  <div><Label>Nome responsabile *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Dr. Mario Rossi" /></div>
                  <div><Label>Nome Clinica *</Label><Input value={formData.clinicName} onChange={(e) => setFormData({...formData, clinicName: e.target.value})} required placeholder="Clinica Veterinaria Roma" /></div>
                  <div><Label>Indirizzo *</Label><Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required placeholder="Via Roma 123" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Città *</Label><Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required placeholder="Milano" /></div>
                    <div><Label>CAP *</Label><Input value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} required placeholder="20100" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Telefono *</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required placeholder="+39 02 1234567" /></div>
                    <div><Label>N° Staff</Label>
                      <Select value={formData.staffCount} onValueChange={(v) => setFormData({...formData, staffCount: v})}>
                        <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Solo io</SelectItem>
                          <SelectItem value="2-5">2-5 persone</SelectItem>
                          <SelectItem value="6-10">6-10 persone</SelectItem>
                          <SelectItem value="10+">Più di 10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Partita IVA *</Label><Input value={formData.vatNumber} onChange={(e) => setFormData({...formData, vatNumber: e.target.value})} required placeholder="IT01234567890" /></div>
                  <div><Label>Sito web</Label><Input value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="https://..." /></div>
                  <div>
                    <Label>Perché vuoi unirti al Pilot? *</Label>
                    <textarea value={formData.pilotMotivation || ''} onChange={(e) => setFormData({...formData, pilotMotivation: e.target.value})} required placeholder="Raccontaci perché sei interessato..." className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral-500" />
                  </div>
                  <div className="border-t pt-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Label className="text-base font-semibold">Servizi offerti</Label>
                        <p className="text-xs text-gray-500">Seleziona i servizi che offri (opzionale)</p>
                      </div>
                      <Badge variant="outline" className="bg-coral-50 text-coral-700">{formData.services.length} selezionati</Badge>
                    </div>
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                      {Object.entries(serviceCatalog).map(([catId, category]) => (
                        category?.services && (
                        <div key={catId} className="mb-3 last:mb-0">
                          <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">{category.name}</p>
                          <div className="grid grid-cols-2 gap-1">
                            {category.services.map((service) => (
                              <label key={service.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm transition ${formData.services.includes(service.id) ? 'bg-coral-100 text-coral-800' : 'hover:bg-white'}`}>
                                <input type="checkbox" checked={formData.services.includes(service.id)} onChange={() => toggleService(service.id)} className="h-4 w-4 text-coral-500 rounded" />
                                <span className="truncate">{service.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        )
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* LAB fields */}
              {formData.role === 'lab' && (
                <>
                  <div><Label>Nome Laboratorio *</Label><Input value={formData.labName} onChange={(e) => setFormData({...formData, labName: e.target.value})} required placeholder="Laboratorio Analisi Veterinarie Milano" /></div>
                  <div><Label>Referente *</Label><Input value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} required placeholder="Dr. Marco Bianchi" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Città *</Label><Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required placeholder="Milano" /></div>
                    <div><Label>Provincia</Label><Input value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value})} placeholder="MI" maxLength={2} /></div>
                  </div>
                  <div><Label>Indirizzo</Label><Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Via della Scienza 42" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Telefono *</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required placeholder="+39 02 1234567" /></div>
                    <div><Label>P.IVA</Label><Input value={formData.vatNumber} onChange={(e) => setFormData({...formData, vatNumber: e.target.value})} placeholder="IT01234567890" /></div>
                  </div>
                  <div>
                    <Label>Descrizione del laboratorio</Label>
                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Descrivici il tuo laboratorio, i servizi offerti e le tecnologie utilizzate..." className="w-full min-h-[70px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  
                  {/* Specializations */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Specializzazioni</Label>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">{formData.specializations.length} selezionate</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                      {LAB_SPECIALIZATIONS.map((spec) => (
                        <label key={spec} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs transition ${formData.specializations.includes(spec) ? 'bg-purple-100 text-purple-800 font-medium' : 'hover:bg-white text-gray-600'}`}>
                          <input type="checkbox" checked={formData.specializations.includes(spec)} onChange={() => toggleSpecialization(spec)} className="h-3.5 w-3.5 text-purple-500 rounded" />
                          <span>{spec}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Pickup & Times */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" />Tempi medi refertazione</Label>
                      <Select value={formData.averageReportTime || 'none'} onValueChange={(v) => setFormData({...formData, averageReportTime: v === 'none' ? '' : v})}>
                        <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" disabled>Seleziona...</SelectItem>
                          <SelectItem value="24h">24 ore</SelectItem>
                          <SelectItem value="24-48h">24-48 ore</SelectItem>
                          <SelectItem value="48-72h">48-72 ore</SelectItem>
                          <SelectItem value="3-5 gg">3-5 giorni</SelectItem>
                          <SelectItem value="5-7 gg">5-7 giorni</SelectItem>
                          <SelectItem value="7-14 gg">7-14 giorni</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2 pb-1">
                      <div className="flex items-center gap-2">
                        <Switch checked={formData.pickupAvailable} onCheckedChange={(v) => setFormData({...formData, pickupAvailable: v})} />
                        <Label className="text-xs flex items-center gap-1"><Truck className="h-3.5 w-3.5" />Ritiro campioni</Label>
                      </div>
                    </div>
                  </div>

                  {formData.pickupAvailable && (
                    <div className="grid grid-cols-2 gap-3 bg-green-50 p-3 rounded-lg border border-green-200">
                      <div><Label className="text-xs">Giorni ritiro</Label><Input value={formData.pickupDays} onChange={(e) => setFormData({...formData, pickupDays: e.target.value})} placeholder="Lun-Ven" className="text-sm" /></div>
                      <div><Label className="text-xs">Orari ritiro</Label><Input value={formData.pickupHours} onChange={(e) => setFormData({...formData, pickupHours: e.target.value})} placeholder="08:00-12:00" className="text-sm" /></div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          <div><Label>Email *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="email@esempio.it" /></div>
          <div><Label>Password *</Label><Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required placeholder="Minimo 8 caratteri" /></div>
          {mode === 'login' && (
            <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-coral-500 hover:underline">Password dimenticata?</button>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className={`w-full ${formData.role === 'lab' && mode === 'register' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-coral-500 hover:bg-coral-600'}`} disabled={loading}>
            {loading ? 'Caricamento...' : (
              mode === 'login' ? 'Accedi' : 
              formData.role === 'clinic' ? 'Candidati al Pilot' : 
              formData.role === 'lab' ? 'Registra Laboratorio' :
              'Registrati gratis'
            )}
          </Button>
          {mode === 'register' && (
            <p className="text-xs text-gray-500 text-center">
              {formData.role === 'clinic' ? 'Ti contatteremo per attivazione e onboarding.' : 
               formData.role === 'lab' ? 'Registrazione gratuita. Approvazione entro 48h.' :
               'Gratis per sempre per i proprietari di animali.'}
            </p>
          )}
        </form>
      </Tabs>
    </div>
  );
}

export default AuthForm;
