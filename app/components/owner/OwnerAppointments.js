'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Building2, Calendar, Cat, Check, ChevronRight, CreditCard, Dog, FileText, Info, MapPin, PawPrint, Phone, Plus, RefreshCw, Search, Star, Stethoscope, Upload, Video, X } from 'lucide-react';
import api from '@/app/lib/api';

function OwnerAppointments({ appointments, pets }) {
  const [showBooking, setShowBooking] = useState(false);
  const [formData, setFormData] = useState({ petId: '', serviceId: '', date: '', time: '', notes: '', clinicId: '' });
  const [clinics, setClinics] = useState([]);
  const [clinicServices, setClinicServices] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [videoConsultoConfirmed, setVideoConsultoConfirmed] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Nuovi stati per la ricerca per servizio
  const [searchMode, setSearchMode] = useState('clinic'); // 'clinic' o 'service'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const [filteredClinics, setFilteredClinics] = useState([]);
  
  // Stato per visualizzare dettagli appuntamento
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Stato per il pagamento
  const [paymentLoading, setPaymentLoading] = useState(null);
  
  // Effetto per leggere il servizio pre-selezionato dalle email
  useEffect(() => {
    if (showBooking) {
      const savedService = sessionStorage.getItem('vetbuddy_book_service');
      if (savedService) {
        // Trova la categoria corrispondente al servizio
        const category = SERVICE_CATEGORIES.find(c => 
          c.keywords.some(k => savedService.toLowerCase().includes(k.toLowerCase())) ||
          c.id === savedService
        );
        if (category) {
          setSearchMode('service');
          setSelectedCategory(category.id);
        }
        sessionStorage.removeItem('vetbuddy_book_service');
      }
    }
  }, [showBooking]);
  
  // Funzione per iniziare il pagamento
  const handlePayment = async (appointment) => {
    setPaymentLoading(appointment.id);
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await api.post('payments/appointment', {
        appointmentId: appointment.id,
        originUrl: baseUrl
      });
      
      if (response.url) {
        // Redirect a Stripe Checkout
        window.location.href = response.url;
      } else {
        alert('❌ Errore: URL di pagamento non disponibile');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Errore durante l\'avvio del pagamento: ' + (error.message || 'Riprova più tardi'));
    } finally {
      setPaymentLoading(null);
    }
  };
  
  // Carica le cliniche disponibili quando si apre il dialog
  useEffect(() => {
    if (showBooking && clinics.length === 0) {
      loadClinics();
    }
  }, [showBooking]);
  
  // Carica i servizi quando si seleziona una clinica
  useEffect(() => {
    if (formData.clinicId) {
      loadClinicServices(formData.clinicId);
    } else {
      setClinicServices([]);
    }
  }, [formData.clinicId]);
  
  // Filtra cliniche quando si seleziona una categoria servizio
  useEffect(() => {
    if (selectedCategory && clinics.length > 0) {
      const category = SERVICE_CATEGORIES.find(c => c.id === selectedCategory);
      if (category) {
        const filtered = clinics.filter(clinic => {
          // Controlla se la clinica offre servizi in questa categoria
          if (!clinic.services || clinic.services.length === 0) {
            // Se non ha servizi configurati, mostra comunque per servizi base
            return ['visita_generale', 'video_consulto'].includes(selectedCategory);
          }
          // Cerca match nei servizi della clinica
          return clinic.services.some(service => {
            const serviceName = (service.name || service.id || '').toLowerCase();
            return category.keywords.some(keyword => serviceName.includes(keyword.toLowerCase()));
          });
        });
        setFilteredClinics(filtered);
      }
    } else {
      setFilteredClinics([]);
    }
  }, [selectedCategory, clinics]);
  
  const loadClinics = async () => {
    setLoadingClinics(true);
    try {
      const res = await api.get('clinics/search?city=Milano&maxDistance=50');
      setClinics(res.clinics || res || []);
    } catch (error) {
      console.error('Error loading clinics:', error);
    } finally {
      setLoadingClinics(false);
    }
  };
  
  const loadClinicServices = async (clinicId) => {
    setLoadingServices(true);
    setFormData(prev => ({...prev, serviceId: ''})); // Reset service selection
    try {
      const clinic = clinics.find(c => c.id === clinicId);
      // Usa i servizi della clinica se disponibili
      if (clinic?.services && clinic.services.length > 0) {
        const formattedServices = clinic.services.map((s, idx) => ({
          id: idx + 1,
          name: s.name || s.id?.replace(/_/g, ' ') || 'Servizio',
          duration: s.duration || 30,
          price: s.price || 0,
          type: s.type || (s.id?.includes('video') ? 'online' : 'in_sede')
        }));
        // Se siamo in modalità servizio, filtra solo i servizi della categoria selezionata
        if (searchMode === 'service' && selectedCategory) {
          const category = SERVICE_CATEGORIES.find(c => c.id === selectedCategory);
          if (category) {
            const filteredServices = formattedServices.filter(service => 
              category.keywords.some(keyword => service.name.toLowerCase().includes(keyword.toLowerCase()))
            );
            setClinicServices(filteredServices.length > 0 ? filteredServices : formattedServices);
          } else {
            setClinicServices(formattedServices);
          }
        } else {
          setClinicServices(formattedServices);
        }
      } else {
        // Fallback servizi base se la clinica non ha servizi configurati
        setClinicServices([
          { id: 1, name: 'Visita generale', duration: 30, price: 50, type: 'in_sede' },
          { id: 2, name: 'Video-consulto', duration: 20, price: 35, type: 'online' },
        ]);
      }
    } catch (error) {
      console.error('Error loading clinic services:', error);
      setClinicServices([]);
    } finally {
      setLoadingServices(false);
    }
  };
  
  // Funzione per selezionare clinica dalla modalità servizio
  const selectClinicFromService = (clinic) => {
    setFormData({...formData, clinicId: clinic.id});
  };
  
  // Reset quando si cambia modalità
  const handleModeChange = (mode) => {
    setSearchMode(mode);
    setSelectedCategory(null);
    setServiceSearch('');
    setFilteredClinics([]);
    setFormData({ petId: formData.petId, serviceId: '', date: '', time: '', notes: '', clinicId: '' });
    setClinicServices([]);
  };
  
  // Filtra categorie per ricerca
  const filteredCategories = SERVICE_CATEGORIES.filter(cat =>
    serviceSearch === '' || 
    cat.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    cat.keywords.some(k => k.toLowerCase().includes(serviceSearch.toLowerCase()))
  );
  
  const selectedService = clinicServices.find(s => s.id === parseInt(formData.serviceId));
  const selectedClinic = clinics.find(c => c.id === formData.clinicId);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const service = clinicServices.find(s => s.id === parseInt(formData.serviceId));
    const pet = pets.find(p => p.id === formData.petId);
    try {
      await api.post('appointments', {
        petName: pet?.name || 'Animale',
        ownerName: 'Proprietario',
        clinicId: formData.clinicId,
        clinicName: selectedClinic?.clinicName || selectedClinic?.name || 'Clinica',
        date: formData.date,
        time: formData.time,
        type: service?.type === 'online' ? 'videoconsulto' : 'visita',
        reason: service?.name || 'Visita',
        price: service?.price || 0,
        notes: formData.notes
      });
      setShowBooking(false);
      setFormData({ petId: '', serviceId: '', date: '', time: '', notes: '', clinicId: '' });
    } catch (error) { alert(error.message); }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">I miei appuntamenti</h2>
          <p className="text-gray-500 text-sm">Visite e consulti prenotati</p>
        </div>
        <Dialog open={showBooking} onOpenChange={(open) => { setShowBooking(open); if (!open) { handleModeChange('clinic'); setVideoConsultoConfirmed(false); setUploadedFiles([]); } }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />Prenota visita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Prenota una visita</DialogTitle>
              <DialogDescription>Scegli come vuoi cercare: per clinica o per tipo di servizio</DialogDescription>
            </DialogHeader>
            
            {/* Toggle Modalità Ricerca */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
              <button
                onClick={() => handleModeChange('clinic')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${searchMode === 'clinic' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <Building2 className="h-4 w-4 inline mr-2" />
                Cerca per Clinica
              </button>
              <button
                onClick={() => handleModeChange('service')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${searchMode === 'service' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <Search className="h-4 w-4 inline mr-2" />
                Cerca per Servizio
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pet Selection - sempre visibile */}
              <div>
                <Label>Per quale animale?</Label>
                <Select value={formData.petId} onValueChange={(v) => setFormData({...formData, petId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona animale" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map(pet => (
                      <SelectItem key={pet.id} value={pet.id}>
                        <div className="flex items-center gap-2">
                          {pet.species === 'dog' ? <Dog className="h-4 w-4" /> : pet.species === 'cat' ? <Cat className="h-4 w-4" /> : <PawPrint className="h-4 w-4" />}
                          {pet.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* ========== MODALITÀ CLINICA ========== */}
              {searchMode === 'clinic' && (
                <>
                  {/* Clinic Selection */}
                  <div>
                    <Label>Presso quale clinica?</Label>
                    <Select value={formData.clinicId} onValueChange={(v) => setFormData({...formData, clinicId: v, serviceId: ''})}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingClinics ? "Caricamento..." : "Seleziona clinica"} />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map(clinic => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-coral-500" />
                              <span>{clinic.clinicName || clinic.name}</span>
                              {clinic.avgRating && <span className="text-xs text-amber-600">★ {clinic.avgRating.toFixed(1)}</span>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Service Selection */}
                  {formData.clinicId && (
                    <div>
                      <Label>Tipo di visita</Label>
                      {loadingServices ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Caricamento servizi...</p>
                        </div>
                      ) : clinicServices.length === 0 ? (
                        <p className="text-sm text-gray-500 py-2">Nessun servizio disponibile per questa clinica</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto">
                          {clinicServices.map(service => (
                            <div 
                              key={service.id}
                              onClick={() => setFormData({...formData, serviceId: service.id.toString()})}
                              className={`p-3 border rounded-lg cursor-pointer transition ${formData.serviceId === service.id.toString() ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${service.type === 'online' ? 'bg-blue-100' : 'bg-coral-100'}`}>
                                    {service.type === 'online' ? <Video className="h-4 w-4 text-blue-600" /> : <Stethoscope className="h-4 w-4 text-coral-600" />}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{service.name}</p>
                                    <p className="text-xs text-gray-500">{service.duration} min • {service.type === 'online' ? 'Online' : 'In sede'}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-blue-600">€{service.price}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {/* ========== MODALITÀ SERVIZIO ========== */}
              {searchMode === 'service' && (
                <>
                  {/* Step 1: Cerca servizio */}
                  {!selectedCategory && (
                    <div>
                      <Label>Che servizio cerchi?</Label>
                      <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Es. vaccinazione, toelettatura, visita..."
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 max-h-64 overflow-y-auto">
                        {filteredCategories.map(category => (
                          <div
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className="p-3 border rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition flex items-center gap-3"
                          >
                            <span className="text-2xl">{category.icon}</span>
                            <span className="font-medium text-sm">{category.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Mostra cliniche che offrono il servizio */}
                  {selectedCategory && !formData.clinicId && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Cliniche che offrono: <span className="text-blue-600">{SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name}</span></Label>
                        <button type="button" onClick={() => setSelectedCategory(null)} className="text-sm text-gray-500 hover:text-blue-600">← Cambia servizio</button>
                      </div>
                      
                      {loadingClinics ? (
                        <div className="text-center py-6">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Cercando cliniche...</p>
                        </div>
                      ) : filteredClinics.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">Nessuna clinica trovata per questo servizio nella tua zona</p>
                          <button type="button" onClick={() => setSelectedCategory(null)} className="text-blue-500 text-sm mt-2 hover:underline">Prova un altro servizio</button>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {filteredClinics.map(clinic => (
                            <div
                              key={clinic.id}
                              onClick={() => selectClinicFromService(clinic)}
                              className="p-4 border rounded-lg cursor-pointer hover:border-blue-400 hover:shadow-md transition bg-white"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900">{clinic.clinicName || clinic.name}</h4>
                                    {clinic.avgRating && (
                                      <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                        <Star className="h-3 w-3 fill-current" />
                                        {clinic.avgRating.toFixed(1)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{clinic.address}, {clinic.city}</span>
                                  </div>
                                  {clinic.phone && (
                                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{clinic.phone}</span>
                                    </div>
                                  )}
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Step 3: Dopo aver scelto la clinica, mostra i servizi specifici */}
                  {selectedCategory && formData.clinicId && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Clinica selezionata</Label>
                        <button type="button" onClick={() => setFormData({...formData, clinicId: '', serviceId: ''})} className="text-sm text-gray-500 hover:text-blue-600">← Cambia clinica</button>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">{selectedClinic?.clinicName || selectedClinic?.name}</span>
                        </div>
                      </div>
                      
                      <Label>Seleziona il servizio specifico</Label>
                      {loadingServices ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto">
                          {clinicServices.map(service => (
                            <div 
                              key={service.id}
                              onClick={() => setFormData({...formData, serviceId: service.id.toString()})}
                              className={`p-3 border rounded-lg cursor-pointer transition ${formData.serviceId === service.id.toString() ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${service.type === 'online' ? 'bg-blue-100' : 'bg-coral-100'}`}>
                                    {service.type === 'online' ? <Video className="h-4 w-4 text-blue-600" /> : <Stethoscope className="h-4 w-4 text-coral-600" />}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{service.name}</p>
                                    <p className="text-xs text-gray-500">{service.duration} min</p>
                                  </div>
                                </div>
                                <p className="font-semibold text-blue-600">€{service.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {/* Date/Time - mostra solo quando servizio è selezionato */}
              {formData.serviceId && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data</Label>
                    <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <Label>Ora</Label>
                    <Input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required />
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {formData.serviceId && (
                <div>
                  <Label>Motivo del consulto *</Label>
                  <Textarea 
                    value={formData.notes} 
                    onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                    placeholder={selectedService?.type === 'online' 
                      ? "Descrivi il motivo del video consulto, sintomi osservati, domande per il veterinario..."
                      : "Descrivi brevemente il motivo della visita..."}
                    rows={3}
                  />
                </div>
              )}

              {/* Upload Documenti per tutti i tipi di appuntamento */}
              {formData.clinicId && formData.serviceId && (
                <div className="space-y-3">
                  <div>
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documenti allegati (opzionale)
                    </Label>
                    <p className="text-xs text-gray-500 mb-2">
                      {selectedService?.type === 'online' 
                        ? 'Carica referti, analisi, foto o video per aiutare il veterinario a prepararsi.'
                        : 'Carica referti precedenti, analisi del sangue, radiografie o altri documenti utili per la visita.'}
                    </p>
                  </div>
                  
                  {/* File List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            {file.type?.includes('image') ? (
                              <ImageIcon className="h-4 w-4 text-green-600" />
                            ) : file.type?.includes('video') ? (
                              <Video className="h-4 w-4 text-green-600" />
                            ) : (
                              <FileText className="h-4 w-4 text-green-600" />
                            )}
                            <span className="text-sm font-medium text-green-800">{file.name}</span>
                            <span className="text-xs text-green-600">({(file.size / 1024).toFixed(0)} KB)</span>
                          </div>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          // Check file size (max 10MB)
                          const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
                          if (validFiles.length < files.length) {
                            alert('Alcuni file superano il limite di 10MB e sono stati esclusi');
                          }
                          setUploadedFiles(prev => [...prev, ...validFiles]);
                          e.target.value = '';
                        }}
                      />
                      <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Carica file (PDF, immagini, video)</span>
                      </div>
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    Formati supportati: PDF, JPG, PNG, MP4, MOV • Max 10MB per file
                  </p>
                </div>
              )}
              
              {/* Summary */}
              {selectedService && selectedClinic && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Riepilogo</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clinica:</span>
                      <span className="font-medium">{selectedClinic.clinicName || selectedClinic.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servizio:</span>
                      <span className="font-medium">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durata:</span>
                      <span>{selectedService.duration} minuti</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-1">
                      <span className="text-gray-600">Costo:</span>
                      <span className="font-semibold text-blue-600">€{selectedService.price}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Consulto Disclaimer */}
              {selectedService?.type === 'online' && (
                <div className="space-y-3">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Video className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-indigo-800 mb-1">Cos'è il Video Consulto?</h4>
                        <p className="text-sm text-indigo-700">
                          È una consulenza a distanza con il veterinario per triage, dubbi, follow-up e interpretazione di referti. 
                          <strong> Non sostituisce una visita clinica in presenza</strong> quando è necessario un esame fisico.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <input 
                      type="checkbox" 
                      checked={videoConsultoConfirmed} 
                      onChange={(e) => setVideoConsultoConfirmed(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      Ho capito che il video consulto è una consulenza e potrebbe essere richiesta una visita in clinica.
                    </span>
                  </label>
                </div>
              )}
              
              {/* Emergency Message */}
              <div className="text-center text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg p-2">
                <span className="text-amber-600">⚠️</span> Per emergenze contatta subito la clinica o il pronto soccorso veterinario.
              </div>
              
              {/* Missing fields indicator */}
              {(!formData.petId || !formData.serviceId || !formData.date || !formData.time || !formData.clinicId || (selectedService?.type === 'online' && !videoConsultoConfirmed)) && (
                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                  <span className="font-medium">Completa tutti i campi:</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {!formData.petId && <li>Seleziona un animale</li>}
                    {!formData.clinicId && <li>Seleziona una clinica</li>}
                    {!formData.serviceId && <li>Seleziona un servizio</li>}
                    {!formData.date && <li>Inserisci la data</li>}
                    {!formData.time && <li>Inserisci l'orario</li>}
                    {selectedService?.type === 'online' && !videoConsultoConfirmed && <li>Conferma di aver compreso le condizioni del video consulto</li>}
                  </ul>
                </div>
              )}
              
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={!formData.petId || !formData.serviceId || !formData.date || !formData.time || !formData.clinicId || (selectedService?.type === 'online' && !videoConsultoConfirmed)}>
                Prenota appuntamento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {appointments.length === 0 ? (
        <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-4">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Pilot Milano</span>
            </div>
            <Calendar className="h-16 w-16 mx-auto mb-4 text-blue-300" />
            <h3 className="font-bold text-xl text-gray-800 mb-2">Nessun appuntamento ancora</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Siamo in fase pilot a Milano. Per prenotare una visita, trova prima una clinica nella sezione "Trova clinica" o invita il tuo veterinario di fiducia!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => setShowBooking(true)}>
                <Plus className="h-4 w-4 mr-2" />Prenota una visita
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <Card key={appt.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAppointment(appt)}>
              <CardContent className="p-3 sm:p-4">
                {/* Mobile: stack layout, Desktop: side by side */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left section: Pet info */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${appt.type === 'videoconsulto' ? 'bg-blue-100' : 'bg-coral-100'}`}>
                      {appt.type === 'videoconsulto' ? <Video className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" /> : <PawPrint className="h-5 w-5 sm:h-6 sm:w-6 text-coral-600" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{appt.petName}</p>
                      <p className="text-sm text-gray-500 truncate">{appt.reason || 'Visita'}</p>
                      {/* Badge stato pagamento */}
                      {appt.paymentStatus === 'paid' ? (
                        <Badge className="bg-green-100 text-green-700 text-xs mt-1">✓ Pagato</Badge>
                      ) : appt.price && appt.price > 0 && appt.status !== 'cancelled' && appt.status !== 'completed' && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs mt-1">€{appt.price} da pagare</Badge>
                      )}
                    </div>
                    {/* Date on mobile - inline */}
                    <div className="sm:hidden text-right flex-shrink-0">
                      <p className="font-medium text-sm">{appt.date}</p>
                      <p className="text-xs text-gray-500">{appt.time}</p>
                    </div>
                  </div>
                  
                  {/* Right section: Date (desktop) + Actions */}
                  <div className="flex flex-col sm:items-end gap-2">
                    {/* Date on desktop */}
                    <div className="hidden sm:block text-right">
                      <p className="font-medium">{appt.date}</p>
                      <p className="text-sm text-gray-500">{appt.time}</p>
                    </div>
                    {/* Action buttons - full width on mobile */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      {/* Pulsante Paga se non pagato */}
                      {appt.paymentStatus !== 'paid' && appt.price && appt.price > 0 && appt.status !== 'cancelled' && appt.status !== 'completed' && (
                        <Button 
                          size="sm" 
                          className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto justify-center" 
                          onClick={(e) => { e.stopPropagation(); handlePayment(appt); }}
                          disabled={paymentLoading === appt.id}
                        >
                          {paymentLoading === appt.id ? (
                            <><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Caricamento...</>
                          ) : (
                            <><CreditCard className="h-3 w-3 mr-1" />Paga €{appt.price}</>
                          )}
                        </Button>
                      )}
                      {appt.type === 'videoconsulto' && appt.videoLink && (
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto justify-center" onClick={(e) => { e.stopPropagation(); window.open(appt.videoLink, '_blank'); }}>
                          <Video className="h-3 w-3 mr-1" />Video Consulto
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Modal Dettagli Appuntamento */}
      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Dettagli Appuntamento
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              {/* Info Paziente */}
              <div className="flex items-center gap-3 p-3 bg-coral-50 rounded-lg">
                <div className="h-10 w-10 bg-coral-100 rounded-full flex items-center justify-center">
                  <PawPrint className="h-5 w-5 text-coral-600" />
                </div>
                <div>
                  <p className="font-semibold">{selectedAppointment.petName}</p>
                  <p className="text-sm text-gray-500">{selectedAppointment.petSpecies || 'Animale'}</p>
                </div>
              </div>
              
              {/* Info Appuntamento */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Data e Ora</p>
                    <p className="font-medium">{selectedAppointment.date} alle {selectedAppointment.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Motivo Visita</p>
                    <p className="font-medium">{selectedAppointment.reason || 'Visita di controllo'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-coral-500" />
                  <div>
                    <p className="text-sm text-gray-500">Clinica</p>
                    <p className="font-medium">{selectedAppointment.clinicName || 'Clinica Veterinaria'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertCircle className={`h-5 w-5 ${selectedAppointment.status === 'confirmed' ? 'text-green-500' : selectedAppointment.status === 'pending' ? 'text-amber-500' : 'text-gray-500'}`} />
                  <div>
                    <p className="text-sm text-gray-500">Stato</p>
                    <p className={`font-medium ${selectedAppointment.status === 'confirmed' ? 'text-green-600' : selectedAppointment.status === 'pending' ? 'text-amber-600' : 'text-gray-600'}`}>
                      {selectedAppointment.status === 'confirmed' ? '✓ Confermato' : selectedAppointment.status === 'pending' ? '⏳ In attesa' : selectedAppointment.status === 'completed' ? '✓ Completato' : selectedAppointment.status}
                    </p>
                  </div>
                </div>
                
                {/* Stato Pagamento */}
                {selectedAppointment.price && selectedAppointment.price > 0 && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${selectedAppointment.paymentStatus === 'paid' ? 'bg-green-50' : 'bg-amber-50'}`}>
                    <CreditCard className={`h-5 w-5 ${selectedAppointment.paymentStatus === 'paid' ? 'text-green-500' : 'text-amber-500'}`} />
                    <div>
                      <p className="text-sm text-gray-500">Pagamento</p>
                      <p className={`font-medium ${selectedAppointment.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                        {selectedAppointment.paymentStatus === 'paid' ? '✓ Pagato' : `€${selectedAppointment.price} da pagare`}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedAppointment.notes && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-gray-500 mb-1">Note</p>
                    <p className="text-sm text-gray-700">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
              
              {/* Azioni */}
              <div className="flex gap-2 pt-4 border-t">
                {/* Pulsante Paga se non pagato */}
                {selectedAppointment.paymentStatus !== 'paid' && selectedAppointment.price && selectedAppointment.price > 0 && selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                  <Button 
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600" 
                    onClick={() => handlePayment(selectedAppointment)}
                    disabled={paymentLoading === selectedAppointment.id}
                  >
                    {paymentLoading === selectedAppointment.id ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Caricamento...</>
                    ) : (
                      <><CreditCard className="h-4 w-4 mr-2" />Paga €{selectedAppointment.price}</>
                    )}
                  </Button>
                )}
                {selectedAppointment.type === 'videoconsulto' && selectedAppointment.videoLink && (
                  <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={() => window.open(selectedAppointment.videoLink, '_blank')}>
                    <Video className="h-4 w-4 mr-2" />Entra nel Video Consulto
                  </Button>
                )}
                <Button variant="outline" className="flex-1" onClick={() => setSelectedAppointment(null)}>
                  Chiudi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== OWNER TUTORIAL INLINE ====================

export default OwnerAppointments;
