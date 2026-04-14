'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, AlertTriangle, Calendar, Cat, Check, ChevronLeft, ChevronRight, ClipboardList, Dog, Download, Droplet, Edit, Euro, Eye, FileCheck, FileText, FlaskConical, Heart, Loader2, PawPrint, RefreshCw, Shield, Stethoscope, Syringe, Upload, Video, Weight } from 'lucide-react';
import api from '@/app/lib/api';

function PetProfile({ petId, onBack, onNavigate, appointments, documents }) {
  const [pet, setPet] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [labReports, setLabReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  
  // Handler per aprire documento
  const handleOpenDocument = (doc) => {
    if (doc.url || doc.fileUrl) {
      window.open(doc.url || doc.fileUrl, '_blank');
    } else if (doc.content) {
      // Se abbiamo il contenuto base64, aprilo in una nuova finestra
      const base64Content = doc.content.startsWith('data:') ? doc.content : `data:application/pdf;base64,${doc.content}`;
      window.open(base64Content, '_blank');
    } else {
      setSelectedDocument(doc);
      setShowDocumentViewer(true);
    }
  };
  
  // Handler per scaricare documento
  const handleDownloadDocument = async (doc) => {
    try {
      const url = doc.url || doc.fileUrl;
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.fileName || doc.name || 'documento';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (doc.content) {
        // Scarica da contenuto base64
        const base64Content = doc.content.startsWith('data:') ? doc.content : `data:application/pdf;base64,${doc.content}`;
        const link = document.createElement('a');
        link.href = base64Content;
        link.download = doc.fileName || doc.name || 'documento.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Documento non disponibile per il download. Il file potrebbe non essere stato ancora caricato.');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Errore durante il download del documento');
    }
  };
  
  // Handler per gestire appuntamento
  const handleManageAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  useEffect(() => {
    loadPetData();
  }, [petId]);

  // Load lab reports when tab changes to labReports
  useEffect(() => {
    if (activeTab === 'labReports' && petId) {
      loadLabReports();
    }
  }, [activeTab, petId]);

  const loadLabReports = async () => {
    setLoadingReports(true);
    try {
      const reports = await api.get(`pets/${petId}/lab-reports`);
      setLabReports(reports || []);
    } catch (error) {
      console.error('Error loading lab reports:', error);
      setLabReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const downloadLabReport = (report) => {
    if (report.fileContent) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${report.fileContent}`;
      link.download = report.fileName || 'referto.pdf';
      link.click();
    }
  };

  const loadPetData = async () => {
    try {
      const data = await api.get(`pets/${petId}`);
      setPet(data);
      setEditForm({
        name: data.name || '',
        species: data.species || 'dog',
        breed: data.breed || '',
        birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
        weight: data.weight || '',
        weightDate: new Date().toISOString().split('T')[0],
        microchip: data.microchip || '',
        sterilized: data.sterilized || false,
        allergies: data.allergies || '',
        medications: data.medications || '',
        notes: data.notes || '',
        // Campi aggiuntivi
        insurance: data.insurance || false,
        insuranceCompany: data.insuranceCompany || '',
        insurancePolicy: data.insurancePolicy || '',
        medicalHistory: data.medicalHistory || '',
        currentConditions: data.currentConditions || '',
        chronicDiseases: data.chronicDiseases || '',
        weightHistory: data.weightHistory || [],
        diet: data.diet || '',
        dietNotes: data.dietNotes || ''
      });
    } catch (error) {
      console.error('Error loading pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      // Prepara i dati includendo la weight history se c'è un nuovo peso
      const dataToSubmit = { ...editForm };
      if (editForm.weight && editForm.weightDate) {
        dataToSubmit.weightHistory = [
          ...(editForm.weightHistory || []),
          { weight: parseFloat(editForm.weight), date: editForm.weightDate, addedAt: new Date().toISOString() }
        ];
      }
      await api.put(`pets/${petId}`, dataToSubmit);
      await loadPetData();
      setShowEditDialog(false);
      alert('✅ Dati aggiornati con successo!');
    } catch (error) {
      alert('Errore: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/D';
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years < 1) return `${months + (months < 0 ? 12 : 0)} mesi`;
    return `${years} ann${years === 1 ? 'o' : 'i'}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-center"><RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto" /><p className="mt-2 text-gray-500">Caricamento...</p></div></div>;
  }

  if (!pet) {
    return <div className="text-center py-12"><AlertCircle className="h-12 w-12 text-gray-300 mx-auto" /><p className="mt-2 text-gray-500">Animale non trovato</p></div>;
  }

  const petAppointments = appointments?.filter(a => a.petId === petId || a.petName === pet.name) || [];
  const petDocuments = documents?.filter(d => d.petId === petId || d.petName === pet.name) || [];
  const nextAppointment = petAppointments.find(a => new Date(a.date) >= new Date());
  const lastDocument = petDocuments[0];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />Torna ai miei animali
        </Button>
        
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-md">
                {pet.species === 'dog' ? <Dog className="h-12 w-12 text-blue-600" /> : pet.species === 'cat' ? <Cat className="h-12 w-12 text-blue-600" /> : <PawPrint className="h-12 w-12 text-blue-600" />}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800">{pet.name}</h1>
                <p className="text-gray-600">{pet.breed || (pet.species === 'dog' ? 'Cane' : pet.species === 'cat' ? 'Gatto' : 'Animale')} • {calculateAge(pet.birthDate)}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {pet.sterilized && <Badge className="bg-green-100 text-green-700 border-green-300">✓ Sterilizzato</Badge>}
                  {pet.microchip && <Badge className="bg-blue-100 text-blue-700 border-blue-300">Microchip: {pet.microchip}</Badge>}
                  {pet.allergies && <Badge className="bg-red-100 text-red-700 border-red-300"><AlertTriangle className="h-3 w-3 mr-1" />Allergie</Badge>}
                  {pet.medications && <Badge className="bg-purple-100 text-purple-700 border-purple-300">In terapia</Badge>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => setShowBookingDialog(true)}><Calendar className="h-4 w-4 mr-2" />Prenota visita</Button>
                <Button variant="outline" onClick={() => setShowUploadDialog(true)}><Upload className="h-4 w-4 mr-2" />Carica documento</Button>
                <Button variant="outline" onClick={() => setShowEditDialog(true)}><Edit className="h-4 w-4 mr-2" />Modifica dati</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="visits">Visite</TabsTrigger>
          <TabsTrigger value="documents">Documenti</TabsTrigger>
          <TabsTrigger value="labReports">🧪 Referti</TabsTrigger>
          <TabsTrigger value="vaccines">Vaccini & Terapie</TabsTrigger>
          <TabsTrigger value="data">Dati & Spese</TabsTrigger>
        </TabsList>

        {/* Panoramica */}
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Prossimo appuntamento */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" />Prossimo appuntamento</CardTitle>
              </CardHeader>
              <CardContent>
                {nextAppointment ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{nextAppointment.reason || 'Visita'}</p>
                      <p className="text-sm text-gray-500">{new Date(nextAppointment.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })} alle {nextAppointment.time}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleManageAppointment(nextAppointment)}>Gestisci</Button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nessun appuntamento programmato</p>
                )}
              </CardContent>
            </Card>

            {/* Ultimo documento */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" />Ultimo documento</CardTitle>
              </CardHeader>
              <CardContent>
                {lastDocument ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{lastDocument.name}</p>
                      <p className="text-sm text-gray-500">{new Date(lastDocument.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleOpenDocument(lastDocument)}><Eye className="h-4 w-4 mr-1" />Apri</Button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nessun documento</p>
                )}
              </CardContent>
            </Card>

            {/* Note importanti */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-500" />Note importanti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Allergie</p>
                    <p className="text-sm text-red-600 mt-1">{Array.isArray(pet.allergies) ? pet.allergies.join(', ') : (pet.allergies || 'Nessuna nota')}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">Farmaci in corso</p>
                    <p className="text-sm text-purple-600 mt-1">
                      {Array.isArray(pet.medications) 
                        ? pet.medications.map(m => typeof m === 'object' ? m.name : m).join(', ')
                        : (pet.medications || 'Nessuno')}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Note comportamentali</p>
                    <p className="text-sm text-blue-600 mt-1">{pet.notes || 'Nessuna nota'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Visite */}
        <TabsContent value="visits">
          <Card>
            <CardHeader><CardTitle>Storico visite</CardTitle></CardHeader>
            <CardContent>
              {petAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nessuna visita registrata</p>
              ) : (
                <div className="space-y-3">
                  {petAppointments.map((appt, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleManageAppointment(appt)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${new Date(appt.date) >= new Date() ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {appt.type === 'videoconsulto' ? <Video className="h-5 w-5 text-blue-600" /> : <Stethoscope className="h-5 w-5 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{appt.reason || 'Visita'}</p>
                          <p className="text-sm text-gray-500">{new Date(appt.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} - {appt.time}</p>
                          {appt.clinicName && <p className="text-xs text-gray-400">{appt.clinicName}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={new Date(appt.date) >= new Date() ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}>
                          {new Date(appt.date) >= new Date() ? 'Programmato' : 'Completato'}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documenti */}
        <TabsContent value="documents">
          <Tabs defaultValue="clinic">
            <TabsList className="mb-4">
              <TabsTrigger value="clinic">Dalla clinica</TabsTrigger>
              <TabsTrigger value="mine">Caricati da me</TabsTrigger>
            </TabsList>
            <TabsContent value="clinic">
              {petDocuments.filter(d => !d.fromClient).length === 0 ? (
                <Card><CardContent className="p-8 text-center text-gray-500">Nessun documento dalla clinica</CardContent></Card>
              ) : (
                <div className="space-y-2">
                  {petDocuments.filter(d => !d.fromClient).map((doc, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleOpenDocument(doc)}><Eye className="h-4 w-4 mr-1" />Apri</Button>
                          <Button size="sm" variant="outline" onClick={() => handleDownloadDocument(doc)}><Download className="h-4 w-4 mr-1" />Scarica</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="mine">
              {petDocuments.filter(d => d.fromClient).length === 0 ? (
                <Card><CardContent className="p-8 text-center text-gray-500">Nessun documento caricato</CardContent></Card>
              ) : (
                <div className="space-y-2">
                  {petDocuments.filter(d => d.fromClient).map((doc, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge variant="outline" className="text-green-600">Inviato</Badge>
                          <Button size="sm" variant="outline" onClick={() => handleOpenDocument(doc)}><Eye className="h-4 w-4 mr-1" />Apri</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Vaccini & Terapie */}
        <TabsContent value="vaccines">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Syringe className="h-5 w-5 text-blue-500" />Vaccini</CardTitle></CardHeader>
              <CardContent>
                {(pet.vaccinations || []).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nessun vaccino registrato</p>
                ) : (
                  <div className="space-y-3">
                    {pet.vaccinations.map((vax, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex justify-between">
                          <p className="font-medium">{vax.name}</p>
                          <Badge variant={new Date(vax.nextDue) < new Date() ? 'destructive' : 'outline'}>
                            {new Date(vax.nextDue) < new Date() ? 'Scaduto' : 'Valido'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">Fatto: {new Date(vax.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">Prossimo: {new Date(vax.nextDue).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-purple-500" />Terapie in corso</CardTitle></CardHeader>
              <CardContent>
                {pet.medications ? (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-purple-800">
                      {Array.isArray(pet.medications) 
                        ? pet.medications.map(m => typeof m === 'object' ? `${m.name} - ${m.dosage}` : m).join(', ')
                        : pet.medications}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Nessuna terapia in corso</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Referti Lab */}
        <TabsContent value="labReports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-indigo-500" />
                Referti Analisi di Laboratorio
              </CardTitle>
              <p className="text-sm text-gray-500">Risultati delle analisi di laboratorio per {pet?.name}</p>
            </CardHeader>
            <CardContent>
              {loadingReports ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
                  <p className="text-sm text-gray-500 mt-2">Caricamento referti...</p>
                </div>
              ) : labReports.length === 0 ? (
                <div className="py-12 text-center">
                  <FlaskConical className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">Nessun referto disponibile</h3>
                  <p className="text-sm text-gray-500 mt-2">I referti delle analisi di laboratorio appariranno qui quando saranno disponibili.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {labReports.map(report => (
                    <div key={report.id} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileCheck className="h-5 w-5 text-indigo-600" />
                            <h4 className="font-semibold text-gray-900">{report.examName || report.examType || 'Referto'}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{report.fileName}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>📅 {new Date(report.uploadedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            <span>🏥 {report.uploadedByName || 'Laboratorio'}</span>
                          </div>
                          {report.clinicNotes && (
                            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <p className="text-xs font-medium text-amber-700 mb-1">📝 Note del veterinario:</p>
                              <p className="text-sm text-gray-700">{report.clinicNotes}</p>
                            </div>
                          )}
                          {report.reportNotes && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-100">
                              <p className="text-xs font-medium text-indigo-700 mb-1">Note dal laboratorio:</p>
                              <p className="text-sm text-gray-700">{report.reportNotes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            size="sm" 
                            className="bg-indigo-500 hover:bg-indigo-600"
                            onClick={() => downloadLabReport(report)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Scarica PDF
                          </Button>
                          {report.fileContent && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const pdfWindow = window.open('');
                                pdfWindow.document.write(`<iframe width='100%' height='100%' src='data:application/pdf;base64,${report.fileContent}'></iframe>`);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Visualizza
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dati & Spese */}
        <TabsContent value="data">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Dati anagrafici</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-500">Microchip</Label><p className="font-medium">{pet.microchip || 'Non registrato'}</p></div>
                  <div><Label className="text-gray-500">Peso</Label><p className="font-medium">{pet.weight ? `${pet.weight} kg` : 'N/D'}</p></div>
                  <div><Label className="text-gray-500">Data nascita</Label><p className="font-medium">{pet.birthDate ? new Date(pet.birthDate).toLocaleDateString() : 'N/D'}</p></div>
                  <div><Label className="text-gray-500">Sterilizzato</Label><p className="font-medium">{pet.sterilized ? 'Sì' : 'No'}</p></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader><CardTitle className="flex items-center gap-2"><Euro className="h-5 w-5 text-green-600" />Spese veterinarie</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">€{pet.spending?.currentYear || 0}</p>
                    <p className="text-sm text-gray-500">Speso quest'anno</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg text-center">
                    <p className="text-xl font-semibold text-gray-700">€{pet.spending?.total || 0}</p>
                    <p className="text-sm text-gray-500">Totale storico</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // Export CSV delle spese
                      const invoices = petDocuments.filter(d => d.type === 'fattura' || d.type === 'invoice');
                      if (invoices.length === 0) {
                        alert('Nessuna fattura disponibile per l\'export');
                        return;
                      }
                      const csv = ['Data,Descrizione,Importo,Clinica'];
                      invoices.forEach(inv => {
                        csv.push(`${new Date(inv.createdAt).toLocaleDateString('it-IT')},${inv.name || 'Fattura'},€${inv.amount || 0},${inv.clinicName || 'N/A'}`);
                      });
                      const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `spese_${pet.name}_${new Date().toISOString().split('T')[0]}.csv`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Esporta spese (CSV)
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Dati aggiuntivi */}
            <Card className="md:col-span-2">
              <CardHeader><CardTitle>Informazioni complete</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 border-b pb-1">Dati Generali</h4>
                    <div><Label className="text-gray-500 text-xs">Specie</Label><p className="font-medium">{pet.species === 'dog' ? '🐕 Cane' : pet.species === 'cat' ? '🐱 Gatto' : pet.species || 'N/D'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Razza</Label><p className="font-medium">{pet.breed || 'N/D'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Data nascita</Label><p className="font-medium">{pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('it-IT') : 'N/D'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Sterilizzato</Label><p className="font-medium">{pet.sterilized ? '✅ Sì' : '❌ No'}</p></div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 border-b pb-1">Salute</h4>
                    <div><Label className="text-gray-500 text-xs">Allergie</Label><p className="font-medium">{pet.allergies || 'Nessuna nota'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Patologie croniche</Label><p className="font-medium">{pet.chronicDiseases || 'Nessuna nota'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Condizioni attuali</Label><p className="font-medium">{pet.currentConditions || 'Nessuna nota'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Farmaci</Label><p className="font-medium">{Array.isArray(pet.medications) ? pet.medications.map(m => typeof m === 'object' ? m.name : m).join(', ') : (pet.medications || 'Nessuno')}</p></div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 border-b pb-1">Altro</h4>
                    <div><Label className="text-gray-500 text-xs">Alimentazione</Label><p className="font-medium">{pet.diet ? {'crocchette': '🥣 Crocchette', 'umido': '🥫 Umido', 'misto': '🍽️ Misto', 'barf': '🥩 BARF', 'casalinga': '🍳 Casalinga', 'veterinaria': '💊 Veterinaria'}[pet.diet] || pet.diet : 'N/D'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Note alimentazione</Label><p className="font-medium">{pet.dietNotes || 'Nessuna nota'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Assicurazione</Label><p className="font-medium">{pet.insurance ? `✅ ${pet.insuranceCompany || 'Assicurato'}` : '❌ Non assicurato'}</p></div>
                    <div><Label className="text-gray-500 text-xs">Note comportamentali</Label><p className="font-medium">{pet.notes || 'Nessuna nota'}</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog Modifica Pet - Form Completo */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica dati di {pet.name}</DialogTitle>
            <DialogDescription>Aggiorna le informazioni del tuo animale</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Dati Generali */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2"><PawPrint className="h-4 w-4" /> Dati Generali</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome *</Label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div>
                  <Label>Specie</Label>
                  <Select value={editForm.species} onValueChange={(v) => setEditForm({...editForm, species: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">🐕 Cane</SelectItem>
                      <SelectItem value="cat">🐱 Gatto</SelectItem>
                      <SelectItem value="horse">🐴 Cavallo</SelectItem>
                      <SelectItem value="bird">🦜 Uccello</SelectItem>
                      <SelectItem value="rabbit">🐰 Coniglio</SelectItem>
                      <SelectItem value="hamster">🐹 Criceto</SelectItem>
                      <SelectItem value="fish">🐠 Pesce</SelectItem>
                      <SelectItem value="reptile">🦎 Rettile</SelectItem>
                      <SelectItem value="other">🐾 Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Razza</Label>
                  <Input value={editForm.breed} onChange={(e) => setEditForm({...editForm, breed: e.target.value})} placeholder="Es. Golden Retriever" />
                </div>
                <div>
                  <Label>Data di nascita</Label>
                  <Input type="date" value={editForm.birthDate} onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Microchip</Label>
                <Input value={editForm.microchip} onChange={(e) => setEditForm({...editForm, microchip: e.target.value})} placeholder="Numero microchip" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Switch checked={editForm.sterilized} onCheckedChange={(v) => setEditForm({...editForm, sterilized: v})} />
                <Label>Sterilizzato/a</Label>
              </div>
            </div>

            {/* Peso */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Weight className="h-4 w-4" /> Peso Corporeo</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Peso attuale (kg)</Label>
                  <Input type="number" step="0.1" value={editForm.weight} onChange={(e) => setEditForm({...editForm, weight: e.target.value})} placeholder="Es. 12.5" />
                </div>
                <div>
                  <Label>Data pesatura</Label>
                  <Input type="date" value={editForm.weightDate} onChange={(e) => setEditForm({...editForm, weightDate: e.target.value})} />
                </div>
              </div>
              {editForm.weightHistory && editForm.weightHistory.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-700 mb-2">📊 Storico Pesi</p>
                  <div className="space-y-1">
                    {editForm.weightHistory.slice(-5).reverse().map((w, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{new Date(w.date).toLocaleDateString('it-IT')}</span>
                        <span className="font-medium">{w.weight} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Assicurazione */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Shield className="h-4 w-4" /> Assicurazione</h4>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Switch checked={editForm.insurance} onCheckedChange={(v) => setEditForm({...editForm, insurance: v})} />
                <Label>L'animale ha un'assicurazione sanitaria</Label>
              </div>
              {editForm.insurance && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Compagnia assicurativa</Label>
                    <Input value={editForm.insuranceCompany} onChange={(e) => setEditForm({...editForm, insuranceCompany: e.target.value})} placeholder="Es. Sara Assicurazioni" />
                  </div>
                  <div>
                    <Label>Numero polizza</Label>
                    <Input value={editForm.insurancePolicy} onChange={(e) => setEditForm({...editForm, insurancePolicy: e.target.value})} placeholder="Es. POL-123456" />
                  </div>
                </div>
              )}
            </div>

            {/* Storia Medica */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Heart className="h-4 w-4" /> Storia Medica</h4>
              <div>
                <Label>Patologie croniche / Condizioni note</Label>
                <Textarea value={editForm.chronicDiseases} onChange={(e) => setEditForm({...editForm, chronicDiseases: e.target.value})} placeholder="Es. Diabete, problemi cardiaci..." rows={2} />
              </div>
              <div>
                <Label>Condizioni attuali</Label>
                <Textarea value={editForm.currentConditions} onChange={(e) => setEditForm({...editForm, currentConditions: e.target.value})} placeholder="Es. In cura per dermatite..." rows={2} />
              </div>
              <div>
                <Label>Allergie note</Label>
                <Input value={editForm.allergies} onChange={(e) => setEditForm({...editForm, allergies: e.target.value})} placeholder="Es. Pollo, polline..." />
              </div>
              <div>
                <Label>Farmaci attuali</Label>
                <Textarea value={editForm.medications} onChange={(e) => setEditForm({...editForm, medications: e.target.value})} placeholder="Es. Apoquel 16mg 1x/giorno..." rows={2} />
              </div>
              <div>
                <Label>Storia medica generale</Label>
                <Textarea value={editForm.medicalHistory} onChange={(e) => setEditForm({...editForm, medicalHistory: e.target.value})} placeholder="Es. Intervento chirurgico nel 2023..." rows={2} />
              </div>
            </div>

            {/* Alimentazione */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Droplet className="h-4 w-4" /> Alimentazione</h4>
              <div>
                <Label>Tipo di alimentazione</Label>
                <Select value={editForm.diet || 'non_specificato'} onValueChange={(v) => setEditForm({...editForm, diet: v === 'non_specificato' ? '' : v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo alimentazione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non_specificato">Non specificato</SelectItem>
                    <SelectItem value="crocchette">🥣 Crocchette (secco)</SelectItem>
                    <SelectItem value="umido">🥫 Umido (scatolette)</SelectItem>
                    <SelectItem value="misto">🍽️ Misto (secco + umido)</SelectItem>
                    <SelectItem value="barf">🥩 BARF (carne cruda)</SelectItem>
                    <SelectItem value="casalinga">🍳 Dieta casalinga</SelectItem>
                    <SelectItem value="veterinaria">💊 Dieta veterinaria/terapeutica</SelectItem>
                    <SelectItem value="altro">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Note alimentazione</Label>
                <Textarea value={editForm.dietNotes} onChange={(e) => setEditForm({...editForm, dietNotes: e.target.value})} placeholder="Es. Marca crocchette, frequenza pasti..." rows={2} />
              </div>
            </div>

            {/* Note */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4" /> Note Comportamentali</h4>
              <div>
                <Textarea value={editForm.notes} onChange={(e) => setEditForm({...editForm, notes: e.target.value})} placeholder="Es. Timoroso dal veterinario..." rows={2} />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annulla</Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleSaveEdit} disabled={saving}>
              {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              {saving ? 'Salvataggio...' : 'Salva modifiche'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Prenotazione (semplificato) */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prenota visita per {pet.name}</DialogTitle>
            <DialogDescription>Vai alla sezione Appuntamenti per prenotare una nuova visita</DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <Calendar className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Per prenotare una visita, usa la sezione "I miei appuntamenti" nel menu laterale.</p>
            <Button onClick={() => { setShowBookingDialog(false); if (onNavigate) onNavigate('appointments'); else onBack(); }} className="bg-blue-500 hover:bg-blue-600">
              Vai agli Appuntamenti
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Upload Documento (semplificato) */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carica documento per {pet.name}</DialogTitle>
            <DialogDescription>Vai alla sezione Documenti per caricare un nuovo file</DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <Upload className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Per caricare documenti, usa la sezione "Documenti" nel menu laterale.</p>
            <Button onClick={() => { setShowUploadDialog(false); if (onNavigate) onNavigate('documents'); else onBack(); }} className="bg-green-500 hover:bg-green-600">
              Vai ai Documenti
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Dettagli Appuntamento */}
      <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Dettagli Appuntamento
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 mt-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-semibold text-lg text-blue-800">{selectedAppointment.reason || 'Visita'}</p>
                <p className="text-blue-600 mt-1">
                  {new Date(selectedAppointment.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-blue-600">Ore {selectedAppointment.time}</p>
              </div>
              
              <div className="space-y-2">
                {selectedAppointment.clinicName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Clinica:</span>
                    <span className="font-medium">{selectedAppointment.clinicName}</span>
                  </div>
                )}
                {selectedAppointment.type && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo:</span>
                    <span className="font-medium">{selectedAppointment.type === 'videoconsulto' ? 'Videoconsulto' : 'In sede'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Stato:</span>
                  <Badge className={new Date(selectedAppointment.date) >= new Date() ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                    {new Date(selectedAppointment.date) >= new Date() ? 'Programmato' : 'Completato'}
                  </Badge>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-1">Note:</p>
                  <p className="text-gray-700">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAppointmentDetails(false)}>
                  Chiudi
                </Button>
                {new Date(selectedAppointment.date) >= new Date() && (
                  <Button variant="destructive" className="flex-1" onClick={() => {
                    if (confirm('Sei sicuro di voler cancellare questo appuntamento?')) {
                      // TODO: API call to cancel appointment
                      alert('Funzionalità di cancellazione in arrivo');
                    }
                  }}>
                    Cancella appuntamento
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog Visualizzatore Documento */}
      <Dialog open={showDocumentViewer} onOpenChange={setShowDocumentViewer}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              {selectedDocument?.name || 'Documento'}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nome:</span>
                  <span className="font-medium">{selectedDocument.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data:</span>
                  <span className="font-medium">{new Date(selectedDocument.createdAt).toLocaleDateString('it-IT')}</span>
                </div>
                {selectedDocument.type && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo:</span>
                    <span className="font-medium">{selectedDocument.type}</span>
                  </div>
                )}
                {selectedDocument.fromClient !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fonte:</span>
                    <Badge variant="outline" className={selectedDocument.fromClient ? 'text-green-600' : 'text-blue-600'}>
                      {selectedDocument.fromClient ? 'Caricato da te' : 'Dalla clinica'}
                    </Badge>
                  </div>
                )}
              </div>
              
              {selectedDocument.description && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-1">Descrizione:</p>
                  <p className="text-gray-700">{selectedDocument.description}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowDocumentViewer(false)}>
                  Chiudi
                </Button>
                <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={() => handleDownloadDocument(selectedDocument)}>
                  <Download className="h-4 w-4 mr-2" />
                  Scarica
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== FIND CLINIC (Ricerca Cliniche con Google Maps) ====================

export default PetProfile;
