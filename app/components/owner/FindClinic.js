'use client';

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Building2, Calendar, ClipboardList, CreditCard, FileText, Globe, Info, Mail, MapPin, PawPrint, Phone, RefreshCw, Search, Send, Star, Stethoscope, Upload, User, X } from 'lucide-react';
import api from '@/app/lib/api';
import { getPetSpeciesInfo } from '@/app/components/shared/utils';

function FindClinic({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchService, setSearchService] = useState('');
  const [serviceCatalog, setServiceCatalog] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinicReviews, setClinicReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ overallRating: 5, punctuality: 5, competence: 5, price: 5, comment: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [maxDistance, setMaxDistance] = useState(50); // km
  const [mapCenter, setMapCenter] = useState({ lat: 45.4642, lng: 9.1900 }); // Milan default for Pilot
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  
  // Autocomplete states
  const [showClinicSuggestions, setShowClinicSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [allClinics, setAllClinics] = useState([]); // All clinics for autocomplete
  
  // Appointment request form
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({ date: '', time: '', service: '', notes: '', petId: '' });
  const [userPets, setUserPets] = useState([]);
  const [submittingAppointment, setSubmittingAppointment] = useState(false);
  
  // Dynamic slots state
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [clinicAvailability, setClinicAvailability] = useState(null);
  
  // File upload state for appointments
  const [appointmentFiles, setAppointmentFiles] = useState([]);

  // Load all clinics for autocomplete suggestions
  useEffect(() => {
    const loadAllClinics = async () => {
      try {
        const results = await api.get('clinics/search?');
        setAllClinics(results || []);
      } catch (error) {
        console.error('Error loading clinics:', error);
      }
    };
    loadAllClinics();
  }, []);

  // Get clinic name suggestions
  const getClinicSuggestions = () => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    const suggestions = new Set();
    allClinics.forEach(clinic => {
      if (clinic.clinicName && clinic.clinicName.toLowerCase().includes(query)) {
        suggestions.add(clinic.clinicName);
      }
      if (clinic.name && clinic.name.toLowerCase().includes(query)) {
        suggestions.add(clinic.name);
      }
    });
    return Array.from(suggestions).slice(0, 5);
  };

  // Get city suggestions
  const getCitySuggestions = () => {
    if (!searchCity || searchCity.length < 2) return [];
    const query = searchCity.toLowerCase();
    const suggestions = new Set();
    allClinics.forEach(clinic => {
      if (clinic.city && clinic.city.toLowerCase().includes(query)) {
        suggestions.add(clinic.city);
      }
    });
    // Add common Italian cities
    const commonCities = ['Milano', 'Roma', 'Napoli', 'Torino', 'Bologna', 'Firenze', 'Bari', 'Palermo', 'Genova', 'Padova', 'Verona', 'Brescia', 'Monza', 'Bergamo', 'Como'];
    commonCities.forEach(city => {
      if (city.toLowerCase().includes(query)) {
        suggestions.add(city);
      }
    });
    return Array.from(suggestions).slice(0, 5);
  };

  // Get service suggestions
  const getServiceSuggestions = () => {
    if (!searchService || searchService.length < 2) return [];
    const query = searchService.toLowerCase();
    const suggestions = [];
    serviceCatalog.forEach(service => {
      if (service.name && service.name.toLowerCase().includes(query)) {
        suggestions.push({ id: service.id, name: service.name });
      }
    });
    return suggestions.slice(0, 5);
  };

  const clinicSuggestions = getClinicSuggestions();
  const citySuggestions = getCitySuggestions();
  const serviceSuggestions = getServiceSuggestions();
  
  // Load user's pets for appointment form
  useEffect(() => {
    const loadUserPets = async () => {
      try {
        const pets = await api.get('pets');
        setUserPets(pets || []);
      } catch (error) {
        console.error('Error loading pets:', error);
      }
    };
    loadUserPets();
  }, []);
  
  // Load available slots when date changes
  const loadAvailableSlots = async (date) => {
    if (!selectedClinic?.id || !date) {
      setAvailableSlots([]);
      return;
    }
    
    setLoadingSlots(true);
    try {
      const response = await api.get(`clinics/${selectedClinic.id}/slots?date=${date}&serviceId=${appointmentForm.service || ''}`);
      setAvailableSlots(response.slots || []);
      setClinicAvailability(response);
    } catch (error) {
      console.error('Error loading slots:', error);
      // Fallback to generic time slots if API fails
      setAvailableSlots([
        { time: '09:00', available: true },
        { time: '09:30', available: true },
        { time: '10:00', available: true },
        { time: '10:30', available: true },
        { time: '11:00', available: true },
        { time: '11:30', available: true },
        { time: '14:00', available: true },
        { time: '14:30', available: true },
        { time: '15:00', available: true },
        { time: '15:30', available: true },
        { time: '16:00', available: true },
        { time: '16:30', available: true },
        { time: '17:00', available: true },
        { time: '17:30', available: true }
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };
  
  // Reload slots when date or clinic changes
  useEffect(() => {
    if (appointmentForm.date && selectedClinic?.id) {
      loadAvailableSlots(appointmentForm.date);
    }
  }, [appointmentForm.date, selectedClinic?.id]);
  
  const handleRequestAppointment = async () => {
    if (!appointmentForm.date || !appointmentForm.service) {
      alert('Seleziona data e servizio');
      return;
    }
    if (!appointmentForm.time) {
      alert('Seleziona un orario');
      return;
    }
    setSubmittingAppointment(true);
    try {
      await api.post('appointments/request', {
        clinicId: selectedClinic.id,
        clinicName: selectedClinic.clinicName,
        date: appointmentForm.date,
        time: appointmentForm.time,
        service: appointmentForm.service,
        notes: appointmentForm.notes,
        petId: appointmentForm.petId || null
      });
      alert('Richiesta inviata! La clinica ti contatterà per confermare.');
      setShowAppointmentForm(false);
      setAppointmentForm({ date: '', time: '', service: '', notes: '', petId: '' });
      setAvailableSlots([]);
      setSelectedClinic(null);
    } catch (error) {
      alert('Errore nell\'invio della richiesta');
    } finally {
      setSubmittingAppointment(false);
    }
  };

  // Load reviews when clinic is selected
  const loadClinicReviews = async (clinicId) => {
    setLoadingReviews(true);
    try {
      const res = await api.get(`clinics/${clinicId}/reviews`);
      setClinicReviews(res.reviews || res || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setClinicReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // When clinic is selected, load its reviews
  useEffect(() => {
    if (selectedClinic?.id) {
      loadClinicReviews(selectedClinic.id);
    } else {
      setClinicReviews([]);
    }
  }, [selectedClinic?.id]);

  // Load service catalog
  useEffect(() => {
    loadServiceCatalog();
  }, []);

  const loadServiceCatalog = async () => {
    try {
      const flat = await api.get('services/flat');
      setServiceCatalog(flat);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  // Get user's location
  const getUserLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setMapCenter(loc);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Impossibile ottenere la posizione. Assicurati di aver abilitato la geolocalizzazione.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError('Geolocalizzazione non supportata dal browser');
    }
  };

  const searchClinics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (searchCity) params.append('city', searchCity);
      if (searchService && searchService !== 'all') params.append('service', searchService);
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
        params.append('maxDistance', maxDistance.toString());
      }
      const results = await api.get(`clinics/search?${params.toString()}`);
      setClinics(results);
      
      // Update map center based on results
      if (results.length > 0 && results[0].latitude && results[0].longitude) {
        setMapCenter({ lat: results[0].latitude, lng: results[0].longitude });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    getUserLocation();
    searchClinics(); 
  }, []);

  useEffect(() => {
    if (userLocation) {
      searchClinics();
    }
  }, [userLocation, maxDistance]);

  const submitReview = async () => {
    try {
      await api.post('reviews', { ...reviewForm, clinicId: selectedClinic.id });
      alert('Recensione inviata con successo!');
      setShowReviewForm(false);
      setReviewForm({ overallRating: 5, punctuality: 5, competence: 5, price: 5, comment: '' });
      searchClinics();
      loadClinicReviews(selectedClinic.id); // Reload reviews
    } catch (error) {
      alert(error.message);
    }
  };

  const StarRating = ({ value, onChange, readonly }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={readonly} onClick={() => onChange?.(star)} className={`${readonly ? '' : 'hover:scale-110'} transition`}>
          <Star className={`h-5 w-5 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return null;
    if (distance < 1) return `${Math.round(distance * 1000)} m`;
    return `${distance.toFixed(1)} km`;
  };

  // Google Maps Component - Simple and Robust
  const GoogleMapsSection = () => {
    const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      return (
        <div className="h-[500px] bg-gradient-to-br from-blue-50 to-coral-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
          <MapPin className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Google Maps API key non configurata</p>
          <p className="text-sm text-gray-400 mt-2">Contatta l'amministratore per abilitare la mappa</p>
        </div>
      );
    }

    // Build clinic markers for embed
    const clinicsWithCoords = clinics.filter(c => c.latitude && c.longitude);
    
    return (
      <div className="relative">
        {/* Map Legend */}
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 shadow-sm"></div>
            <span className="text-gray-700">Cliniche vetbuddy</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm"></div>
              <span className="text-gray-700">La tua posizione</span>
            </div>
          )}
        </div>

        {/* Stats overlay */}
        <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-coral-600">{clinicsWithCoords.length}</div>
              <div className="text-xs text-gray-500">su mappa</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{clinics.length}</div>
              <div className="text-xs text-gray-500">totali</div>
            </div>
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden border shadow-lg">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '250px' }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/search?key=${GOOGLE_MAPS_API_KEY}&q=clinica+veterinaria${searchCity ? `+${encodeURIComponent(searchCity)}` : '+Milano'}&center=${mapCenter.lat},${mapCenter.lng}&zoom=13`}
          />
        </div>

        {/* Bottom instruction */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-4 py-2 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <PawPrint className="h-4 w-4 text-coral-500" />
            Clicca su una clinica nella mappa per i dettagli
          </span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Trova una clinica</h2>
        <p className="text-gray-500 text-sm">Cerca cliniche veterinarie nella tua zona</p>
      </div>

      {/* Location Status */}
      {userLocation && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">Posizione rilevata - Le cliniche saranno ordinate per distanza</span>
        </div>
      )}
      {locationError && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-700">{locationError}</span>
          </div>
          <Button size="sm" variant="outline" onClick={getUserLocation}>
            <RefreshCw className="h-3 w-3 mr-1" />Riprova
          </Button>
        </div>
      )}

      {/* Search Form */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {/* Nome clinica con autocomplete */}
            <div className="flex-1 min-w-[200px] relative">
              <Label className="sr-only">Nome clinica</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input 
                  placeholder="Nome clinica o veterinario..." 
                  value={searchQuery} 
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowClinicSuggestions(true);
                  }}
                  onFocus={() => setShowClinicSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowClinicSuggestions(false), 200)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && searchClinics()}
                />
              </div>
              {/* Autocomplete suggestions for clinic name */}
              {showClinicSuggestions && clinicSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  {clinicSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-2 text-sm border-b border-gray-100 last:border-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(suggestion);
                        setShowClinicSuggestions(false);
                      }}
                    >
                      <Building2 className="h-3 w-3 text-gray-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Città con autocomplete */}
            <div className="w-48 relative">
              <Label className="sr-only">Città</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input 
                  placeholder="Città..." 
                  value={searchCity} 
                  onChange={(e) => {
                    setSearchCity(e.target.value);
                    setShowCitySuggestions(true);
                  }}
                  onFocus={() => setShowCitySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && searchClinics()}
                />
              </div>
              {/* Autocomplete suggestions for city */}
              {showCitySuggestions && citySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  {citySuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-2 text-sm border-b border-gray-100 last:border-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchCity(suggestion);
                        setShowCitySuggestions(false);
                      }}
                    >
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Servizi con autocomplete (input con dropdown) */}
            <div className="w-56 relative">
              <Label className="sr-only">Servizio</Label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input 
                  placeholder="Cerca servizio..." 
                  value={searchService} 
                  onChange={(e) => {
                    setSearchService(e.target.value);
                    setShowServiceSuggestions(true);
                  }}
                  onFocus={() => setShowServiceSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowServiceSuggestions(false), 200)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && searchClinics()}
                />
              </div>
              {/* Autocomplete suggestions for services */}
              {showServiceSuggestions && (searchService.length >= 2 ? serviceSuggestions : serviceCatalog.slice(0, 6)).length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                  {searchService.length < 2 && (
                    <div className="px-4 py-2 text-xs text-gray-500 border-b">Servizi popolari:</div>
                  )}
                  {(searchService.length >= 2 ? serviceSuggestions : serviceCatalog.slice(0, 6)).map((service, idx) => (
                    <button
                      key={service.id || idx}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-2 text-sm border-b border-gray-100 last:border-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchService(service.name || service);
                        setShowServiceSuggestions(false);
                      }}
                    >
                      <Stethoscope className="h-3 w-3 text-gray-400" />
                      <span>{service.name || service}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {userLocation && (
              <div className="w-40">
                <Label className="sr-only">Distanza massima</Label>
                <Select value={maxDistance.toString()} onValueChange={(v) => setMaxDistance(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Distanza" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Entro 5 km</SelectItem>
                    <SelectItem value="10">Entro 10 km</SelectItem>
                    <SelectItem value="25">Entro 25 km</SelectItem>
                    <SelectItem value="50">Entro 50 km</SelectItem>
                    <SelectItem value="100">Entro 100 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={searchClinics} className="bg-blue-500 hover:bg-blue-600">
              <Search className="h-4 w-4 mr-2" />Cerca
            </Button>
            {!userLocation && (
              <Button variant="outline" onClick={getUserLocation}>
                <MapPin className="h-4 w-4 mr-2" />Usa la mia posizione
              </Button>
            )}
          </div>
          {searchService && searchService !== 'all' && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="bg-coral-50 text-coral-700 border-coral-200">
                <Stethoscope className="h-3 w-3 mr-1" />
                {serviceCatalog.find(s => s.id === searchService)?.name || searchService}
                <button onClick={() => setSearchService('all')} className="ml-2 hover:text-coral-900">×</button>
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          {clinics.length} clinic{clinics.length !== 1 ? 'he' : 'a'} trovat{clinics.length !== 1 ? 'e' : 'a'}
        </p>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <ClipboardList className="h-4 w-4 mr-1" />Lista
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
          >
            <MapPin className="h-4 w-4 mr-1" />Mappa
          </Button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto" /></div>
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <GoogleMapsSection />
          {/* Clinic list below map */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinics.map((clinic) => (
              <Card key={clinic.id} className={`hover:shadow-md transition-shadow cursor-pointer ${selectedClinic?.id === clinic.id ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setSelectedClinic(clinic)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{clinic.clinicName}</h3>
                    {clinic.distance !== null && (
                      <Badge variant="outline" className="text-blue-600">
                        <MapPin className="h-3 w-3 mr-1" />{formatDistance(clinic.distance)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{clinic.city}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(clinic.avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{clinic.avgRating ? clinic.avgRating.toFixed(1) : '-'}</span>
                      <span className="text-xs text-gray-400">({clinic.reviewCount || 0})</span>
                    </div>
                    {clinic.googleRating && (
                      <div className="flex items-center gap-1 bg-gray-50 rounded px-1.5 py-0.5">
                        <svg className="h-3 w-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        <span className="text-xs font-medium">{clinic.googleRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : clinics.length === 0 ? (
        <Card className="border-dashed border-2 border-coral-200 bg-coral-50/50">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-4">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Pilot Milano</span>
            </div>
            <Building2 className="h-16 w-16 mx-auto mb-4 text-coral-300" />
            <h3 className="font-bold text-xl text-gray-800 mb-2">Nessuna clinica trovata nella tua zona</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Siamo in fase pilot e stiamo attivando le prime cliniche a Milano e provincia. 
              <br/>La tua clinica preferita non è ancora su vetbuddy?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-coral-500 hover:bg-coral-600" onClick={() => setSearchCity('Milano')}>
                <MapPin className="h-4 w-4 mr-2" />Cerca a Milano
              </Button>
              <Button variant="outline" className="border-coral-300 text-coral-700 hover:bg-coral-50">
                <Mail className="h-4 w-4 mr-2" />Invita la tua clinica
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Invitando la tua clinica ci aiuti a crescere e potresti ricevere vantaggi esclusivi!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {clinics.map((clinic) => (
            <Card key={clinic.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{clinic.clinicName}</h3>
                    <p className="text-sm text-gray-500">{clinic.name}</p>
                  </div>
                  <div className="text-right space-y-1">
                    {/* Google Rating */}
                    {clinic.googleRating && (
                      <div className="flex items-center gap-1 justify-end bg-white border rounded-lg px-2 py-1">
                        <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        <span className="font-bold text-gray-800">{clinic.googleRating.toFixed(1)}</span>
                      </div>
                    )}
                    {/* vetbuddy Rating */}
                    <div className="flex items-center gap-1 justify-end">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${s <= Math.round(clinic.avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="font-bold text-gray-800">{clinic.avgRating ? clinic.avgRating.toFixed(1) : '-'}</span>
                      <span className="text-xs text-gray-500">({clinic.reviewCount || 0} recensioni)</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{clinic.city || 'Località non specificata'}</span>
                    </div>
                    {clinic.distance !== null && (
                      <Badge className="bg-blue-100 text-blue-700">
                        {formatDistance(clinic.distance)}
                      </Badge>
                    )}
                  </div>
                  {clinic.address && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span>{clinic.address}</span>
                    </div>
                  )}
                  {clinic.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{clinic.phone}</div>}
                  {clinic.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-gray-400" /><a href={clinic.website} target="_blank" className="text-blue-500 hover:underline truncate max-w-[200px]">{clinic.website}</a></div>}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={() => setSelectedClinic(clinic)}>
                    Dettagli
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedClinic(clinic); setShowReviewForm(true); }}>
                    <Star className="h-4 w-4 mr-1" />Recensisci
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // Show clinic location on map
                      if (clinic.latitude && clinic.longitude) {
                        window.open(`https://www.google.com/maps?q=${clinic.latitude},${clinic.longitude}`, '_blank');
                      } else if (clinic.address || clinic.city) {
                        const address = encodeURIComponent(`${clinic.clinicName || ''} ${clinic.address || ''} ${clinic.city || ''} Italia`.trim());
                        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                      }
                    }}
                    title="Vedi su Google Maps"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Clinic Detail Dialog */}
      <Dialog open={selectedClinic && !showReviewForm} onOpenChange={() => setSelectedClinic(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedClinic?.clinicName}</DialogTitle>
            <DialogDescription>{selectedClinic?.name}</DialogDescription>
          </DialogHeader>
          {selectedClinic && (
            <div className="space-y-4 mt-4">
              {/* Rating Summary */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{selectedClinic.avgRating ? selectedClinic.avgRating.toFixed(1) : 'N/D'}</div>
                  <div className="flex justify-center mt-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.round(selectedClinic.avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{selectedClinic.reviewCount || 0} recensioni vetbuddy</p>
                </div>
                {selectedClinic.googleRating && (
                  <div className="text-center border-l pl-4">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      <span className="font-bold text-xl">{selectedClinic.googleRating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-500">Google Reviews</p>
                  </div>
                )}
                {selectedClinic.distance !== null && (
                  <div className="flex-1 text-right">
                    <Badge className="bg-blue-100 text-blue-700 text-lg px-3 py-1">
                      <MapPin className="h-4 w-4 mr-1 inline" />
                      {formatDistance(selectedClinic.distance)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">dalla tua posizione</p>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                {selectedClinic.address && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Indirizzo</p>
                      <p className="text-sm text-gray-600">{selectedClinic.address}, {selectedClinic.city}</p>
                    </div>
                  </div>
                )}
                {selectedClinic.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Telefono</p>
                      <a href={`tel:${selectedClinic.phone}`} className="text-sm text-blue-500">{selectedClinic.phone}</a>
                    </div>
                  </div>
                )}
                {selectedClinic.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Sito web</p>
                      <a href={selectedClinic.website} target="_blank" className="text-sm text-blue-500 hover:underline">{selectedClinic.website}</a>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment & Cancellation Policy */}
              {(selectedClinic.paymentSettings?.methods?.length > 0 || selectedClinic.paymentSettings?.cancellationPolicy) && (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-500" />
                    Informazioni utili
                  </h4>
                  
                  {/* Payment Methods */}
                  {selectedClinic.paymentSettings?.methods?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">METODI DI PAGAMENTO ACCETTATI</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedClinic.paymentSettings.methods.includes('cash') && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            💵 Contanti
                          </Badge>
                        )}
                        {selectedClinic.paymentSettings.methods.includes('card') && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            💳 Carta
                          </Badge>
                        )}
                        {selectedClinic.paymentSettings.methods.includes('transfer') && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            🏦 Bonifico
                          </Badge>
                        )}
                        {selectedClinic.paymentSettings.methods.includes('online') && (
                          <Badge variant="outline" className="bg-coral-50 text-coral-700 border-coral-200">
                            🌐 Online
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Cancellation Policy */}
                  {selectedClinic.paymentSettings?.cancellationPolicy && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">POLICY DI CANCELLAZIONE</p>
                      <p className="text-sm text-gray-700">
                        {selectedClinic.paymentSettings.cancellationPolicy === 'free_24h' && '✅ Cancellazione gratuita fino a 24h prima'}
                        {selectedClinic.paymentSettings.cancellationPolicy === 'free_48h' && '✅ Cancellazione gratuita fino a 48h prima'}
                        {selectedClinic.paymentSettings.cancellationPolicy === 'penalty_30' && '⚠️ Penale 30% se cancelli meno di 24h prima'}
                        {selectedClinic.paymentSettings.cancellationPolicy === 'penalty_50' && '⚠️ Penale 50% se cancelli meno di 24h prima'}
                        {selectedClinic.paymentSettings.cancellationPolicy === 'no_refund_24h' && '❌ Nessun rimborso se cancelli meno di 24h prima'}
                        {selectedClinic.paymentSettings.cancellationPolicy === 'no_refund' && '❌ Nessun rimborso per cancellazioni'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Servizi e Prezzi della Clinica */}
              {(selectedClinic.services?.length > 0 || selectedClinic.customServices?.length > 0) && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-green-500" />
                    Servizi e Listino Prezzi
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {/* Standard Services */}
                    {selectedClinic.services?.filter(s => s.price).map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-green-100 last:border-0">
                        <span className="text-sm text-gray-700 capitalize">{service.id?.replace(/_/g, ' ') || service.name}</span>
                        <Badge className="bg-green-100 text-green-700 font-semibold">€{parseFloat(service.price).toFixed(2)}</Badge>
                      </div>
                    ))}
                    {/* Custom Services */}
                    {selectedClinic.customServices?.map((service, idx) => (
                      <div key={`custom-${idx}`} className="flex items-center justify-between py-2 border-b border-green-100 last:border-0">
                        <div>
                          <span className="text-sm text-gray-700">{service.name}</span>
                          {service.description && <p className="text-xs text-gray-500">{service.description}</p>}
                        </div>
                        <Badge className="bg-green-100 text-green-700 font-semibold">€{parseFloat(service.price).toFixed(2)}</Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 italic">* Prezzi indicativi, possono variare in base alla visita</p>
                </div>
              )}

              {/* Recensioni dei clienti */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Recensioni dei clienti
                </h4>
                {loadingReviews ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-500 border-t-transparent mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Caricamento recensioni...</p>
                  </div>
                ) : clinicReviews.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {clinicReviews.map((review, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 shadow-sm border border-yellow-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{review.ownerName || 'Cliente vetbuddy'}</p>
                              <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('it-IT')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`h-3 w-3 ${s <= review.overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>Puntualità: {review.punctuality}/5</span>
                          <span>Competenza: {review.competence}/5</span>
                          <span>Prezzo: {review.price}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Star className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nessuna recensione ancora</p>
                    <p className="text-xs text-gray-400">Sii il primo a lasciare una recensione!</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  className="w-full bg-coral-500 hover:bg-coral-600" 
                  size="lg"
                  onClick={() => setShowAppointmentForm(true)}
                >
                  <Calendar className="h-5 w-5 mr-2" />Richiedi appuntamento
                </Button>
                <div className="flex gap-3">
                  <Button className="flex-1" variant="outline" onClick={() => setShowReviewForm(true)}>
                    <Star className="h-4 w-4 mr-2" />Recensisci
                  </Button>
                  {selectedClinic.latitude && selectedClinic.longitude && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedClinic.latitude},${selectedClinic.longitude}`, '_blank')}
                    >
                      <MapPin className="h-4 w-4 mr-2" />Indicazioni
                    </Button>
                  )}
                </div>
                {selectedClinic.phone && (
                  <Button variant="ghost" className="text-blue-600" onClick={() => window.location.href = `tel:${selectedClinic.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />Chiama {selectedClinic.phone}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Recensisci {selectedClinic?.clinicName}</DialogTitle>
            <DialogDescription>Condividi la tua esperienza</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="mb-2 block">Valutazione generale</Label>
              <StarRating value={reviewForm.overallRating} onChange={(v) => setReviewForm({...reviewForm, overallRating: v})} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Puntualità</Label>
                <StarRating value={reviewForm.punctuality} onChange={(v) => setReviewForm({...reviewForm, punctuality: v})} />
              </div>
              <div>
                <Label className="text-sm text-gray-500">Competenza</Label>
                <StarRating value={reviewForm.competence} onChange={(v) => setReviewForm({...reviewForm, competence: v})} />
              </div>
              <div>
                <Label className="text-sm text-gray-500">Prezzo</Label>
                <StarRating value={reviewForm.price} onChange={(v) => setReviewForm({...reviewForm, price: v})} />
              </div>
            </div>
            <div>
              <Label>Il tuo commento</Label>
              <Textarea 
                value={reviewForm.comment} 
                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                placeholder="Racconta la tua esperienza..."
                rows={4}
              />
            </div>
            <Button onClick={submitReview} className="w-full bg-blue-500 hover:bg-blue-600">
              Invia recensione
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Richiesta Appuntamento */}
      <Dialog open={showAppointmentForm} onOpenChange={(open) => {
        setShowAppointmentForm(open);
        if (!open) {
          setAvailableSlots([]);
          setClinicAvailability(null);
          setAppointmentFiles([]);
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Richiedi Appuntamento</DialogTitle>
            <DialogDescription>
              Richiedi un appuntamento presso {selectedClinic?.clinicName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Data preferita *</Label>
              <Input 
                type="date" 
                value={appointmentForm.date}
                onChange={(e) => {
                  setAppointmentForm({...appointmentForm, date: e.target.value, time: ''});
                }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            {/* Dynamic Time Slots */}
            <div>
              <Label>Orario disponibile *</Label>
              {!appointmentForm.date ? (
                <p className="text-sm text-gray-500 mt-2 p-3 bg-gray-50 rounded-lg">
                  Seleziona prima una data per vedere gli orari disponibili
                </p>
              ) : loadingSlots ? (
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2 text-blue-500" />
                  <span className="text-sm text-gray-500">Caricamento orari...</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-700">
                    Nessun orario disponibile per questa data. Prova un'altra data.
                  </p>
                </div>
              ) : (
                <div className="mt-2">
                  {clinicAvailability?.workingHours && (
                    <p className="text-xs text-gray-500 mb-2">
                      Orario clinica: {clinicAvailability.workingHours.start} - {clinicAvailability.workingHours.end}
                      {clinicAvailability.workingHours.breakStart && ` (pausa ${clinicAvailability.workingHours.breakStart}-${clinicAvailability.workingHours.breakEnd})`}
                    </p>
                  )}
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setAppointmentForm({...appointmentForm, time: slot.time})}
                        className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                          appointmentForm.time === slot.time
                            ? 'bg-blue-500 text-white border-blue-500'
                            : slot.available
                              ? 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                  {clinicAvailability && (
                    <p className="text-xs text-gray-400 mt-2">
                      {clinicAvailability.availableCount} di {clinicAvailability.totalSlots} slot disponibili
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <Label>Servizio richiesto *</Label>
              <Select value={appointmentForm.service} onValueChange={(v) => setAppointmentForm({...appointmentForm, service: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona servizio" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {serviceCatalog.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {userPets.length > 0 && (
              <div>
                <Label>Per quale animale?</Label>
                <Select value={appointmentForm.petId || 'none'} onValueChange={(v) => setAppointmentForm({...appointmentForm, petId: v === 'none' ? '' : v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona animale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Non specificato</SelectItem>
                    {userPets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {getPetSpeciesInfo(pet.species).emoji} {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Note aggiuntive</Label>
              <textarea
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                placeholder="Descrivi brevemente il motivo della visita..."
              />
            </div>
            
            {/* Upload Documenti */}
            <div className="space-y-3">
              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documenti allegati (opzionale)
                </Label>
                <p className="text-xs text-gray-500 mb-2">
                  Carica referti precedenti, analisi del sangue, radiografie o altri documenti utili.
                </p>
              </div>
              
              {/* File List */}
              {appointmentFiles.length > 0 && (
                <div className="space-y-2">
                  {appointmentFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        {file.type?.includes('image') ? (
                          <ImageIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-green-600" />
                        )}
                        <span className="text-sm font-medium text-green-800 truncate max-w-32">{file.name}</span>
                        <span className="text-xs text-green-600">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => setAppointmentFiles(files => files.filter((_, i) => i !== index))}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload Button */}
              <label className="block">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
                    if (validFiles.length < files.length) {
                      alert('Alcuni file superano il limite di 10MB e sono stati esclusi');
                    }
                    setAppointmentFiles(prev => [...prev, ...validFiles]);
                    e.target.value = '';
                  }}
                />
                <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                  <Upload className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Carica file (PDF, JPG, PNG)</span>
                </div>
              </label>
              <p className="text-xs text-gray-400">Max 10MB per file</p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowAppointmentForm(false)}
              >
                Annulla
              </Button>
              <Button 
                className="flex-1 bg-coral-500 hover:bg-coral-600"
                onClick={handleRequestAppointment}
                disabled={submittingAppointment || !appointmentForm.date || !appointmentForm.time || !appointmentForm.service}
              >
                {submittingAppointment ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Invio...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" />Invia Richiesta</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== STAFF DASHBOARD (Amministrativo) ====================

export default FindClinic;
