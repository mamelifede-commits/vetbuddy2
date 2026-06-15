'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, FlaskConical, MapPin, Phone, Search, Loader2, CheckCircle, Clock, Truck, Calendar, Heart, ExternalLink } from 'lucide-react';

export default function DirectoryPage() {
  const [activeTab, setActiveTab] = useState('clinics');
  const [city, setCity] = useState('');
  const [service, setService] = useState('');
  const [examType, setExamType] = useState('');
  const [clinics, setClinics] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [loadingLabs, setLoadingLabs] = useState(true);

  useEffect(() => { loadClinics(); }, []);
  useEffect(() => { loadLabs(); }, []);

  const loadClinics = async (filters = {}) => {
    setLoadingClinics(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.service) params.append('service', filters.service);
      const res = await fetch(`/api/directory/clinics?${params.toString()}`);
      const data = await res.json();
      setClinics(data.clinics || []);
    } catch { setClinics([]); }
    finally { setLoadingClinics(false); }
  };

  const loadLabs = async (filters = {}) => {
    setLoadingLabs(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.examType) params.append('examType', filters.examType);
      const res = await fetch(`/api/directory/labs?${params.toString()}`);
      const data = await res.json();
      setLabs(data.labs || []);
    } catch { setLabs([]); }
    finally { setLoadingLabs(false); }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (activeTab === 'clinics') loadClinics({ city, service });
    else loadLabs({ city, examType });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80">
            <Heart className="h-6 w-6 text-coral-500" />
            <span className="font-bold text-lg text-gray-800">VetBuddy</span>
          </a>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-100 text-emerald-700 hidden sm:flex">🌐 Directory pubblica</Badge>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/login'}>Accedi</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <Badge className="bg-coral-100 text-coral-700 mb-3">🌐 Tre attori, un solo ecosistema</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Directory VetBuddy</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Cliniche veterinarie e laboratori partner della rete VetBuddy. Solo profili <strong>verificati</strong>.</p>
        </div>

        {/* Search bar */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input placeholder="Città (es: Milano)" value={city} onChange={(e) => setCity(e.target.value)} className="text-sm" />
              </div>
              {activeTab === 'clinics' && (
                <div className="flex-1">
                  <Input placeholder="Servizio (es: vaccini, chirurgia)" value={service} onChange={(e) => setService(e.target.value)} className="text-sm" />
                </div>
              )}
              {activeTab === 'labs' && (
                <div className="flex-1">
                  <Input placeholder="Tipo esame (es: sangue, biopsia)" value={examType} onChange={(e) => setExamType(e.target.value)} className="text-sm" />
                </div>
              )}
              <Button type="submit" className="bg-coral-500 hover:bg-coral-600 text-white">
                <Search className="h-4 w-4 mr-1" />Cerca
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full sm:w-fit">
            <TabsTrigger value="clinics" className="flex-1 sm:flex-none">
              <Building2 className="h-4 w-4 mr-1" />Cliniche <Badge variant="outline" className="ml-2 text-xs">{clinics.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="labs" className="flex-1 sm:flex-none">
              <FlaskConical className="h-4 w-4 mr-1" />Laboratori <Badge variant="outline" className="ml-2 text-xs">{labs.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* CLINICHE */}
          <TabsContent value="clinics">
            {loadingClinics ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-coral-500" />
              </div>
            ) : clinics.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nessuna clinica trovata con questi criteri.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clinics.map(c => (
                  <Card key={c.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-coral-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          {c.photo ? (
                            <img src={c.photo} alt={c.name} className="h-12 w-12 rounded-xl object-cover" />
                          ) : (
                            <Building2 className="h-6 w-6 text-coral-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 mb-0.5">
                            <span className="truncate">{c.name}</span>
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          </h3>
                          {c.city && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{c.city}
                            </p>
                          )}
                        </div>
                      </div>
                      {c.address && <p className="text-xs text-gray-600 mb-2 line-clamp-1">{c.address}</p>}
                      {c.phone && (
                        <p className="text-xs text-gray-700 flex items-center gap-1 mb-2">
                          <Phone className="h-3 w-3 text-gray-400" />{c.phone}
                        </p>
                      )}
                      {c.services && c.services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {c.services.slice(0, 4).map((s, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{s.name || s}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        {c.hasOnlineBooking && (
                          <Button
                            size="sm"
                            className="flex-1 bg-coral-500 hover:bg-coral-600 text-white"
                            onClick={() => window.location.href = `/clinica/${c.slug}`}
                          >
                            <Calendar className="h-3 w-3 mr-1" />Prenota
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.location.href = `/clinica/${c.slug}`}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />Profilo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* LABORATORI */}
          <TabsContent value="labs">
            {loadingLabs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : labs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <FlaskConical className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nessun laboratorio trovato con questi criteri.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {labs.map(l => (
                  <Card key={l.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          {l.photo ? (
                            <img src={l.photo} alt={l.name} className="h-12 w-12 rounded-xl object-cover" />
                          ) : (
                            <FlaskConical className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 mb-0.5">
                            <span className="truncate">{l.name}</span>
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          </h3>
                          {l.city && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{l.city}
                            </p>
                          )}
                        </div>
                      </div>
                      {l.address && <p className="text-xs text-gray-600 mb-2 line-clamp-1">{l.address}</p>}
                      {l.phone && (
                        <p className="text-xs text-gray-700 flex items-center gap-1 mb-2">
                          <Phone className="h-3 w-3 text-gray-400" />{l.phone}
                        </p>
                      )}
                      <div className="space-y-1 mb-3">
                        {l.examTypesCount > 0 && (
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <FlaskConical className="h-3 w-3 text-blue-400" />{l.examTypesCount} esami in listino
                          </p>
                        )}
                        {l.averageReportTime && (
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-400" />Tempo medio referto: {l.averageReportTime}
                          </p>
                        )}
                        {l.pickupAvailable && (
                          <p className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                            <Truck className="h-3 w-3" />Ritiro campioni disponibile
                          </p>
                        )}
                      </div>
                      {l.specializations && l.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {l.specializations.slice(0, 4).map((s, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 text-center">
                          Disponibile su VetBuddy. Le cliniche partner possono contattarlo via piattaforma.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Non trovi la tua clinica o laboratorio?</h3>
          <p className="text-gray-600 text-sm mb-4">Invitali a unirsi alla rete VetBuddy. È gratis per provare.</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => window.location.href = '/login?mode=register&role=owner'} className="bg-coral-500 hover:bg-coral-600 text-white">
              Invita la tua clinica
            </Button>
            <Button onClick={() => window.location.href = '/login?mode=register&role=clinic'} variant="outline">
              Sono una clinica → Iscriviti
            </Button>
            <Button onClick={() => window.location.href = '/login?mode=register&role=lab'} variant="outline">
              Sono un laboratorio → Iscriviti
            </Button>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-6 bg-gray-900 text-gray-400 text-center text-xs">
        © 2026 VetBuddy — Tre attori, un solo ecosistema.
      </footer>
    </div>
  );
}
