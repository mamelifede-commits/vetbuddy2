'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  ChevronLeft, Dog, Cat, PawPrint, Calendar, Upload, Edit,
  AlertTriangle, QrCode, Eye, Download, FileText, RefreshCw,
  AlertCircle, Loader2, Pill
} from 'lucide-react';

// Dynamic imports for tab sub-components (reduces per-chunk size, prevents OOM)
const PetPassport = dynamic(() => import('@/app/components/passport/PetPassport'), { ssr: false });
const OwnerPrescriptions = dynamic(() => import('./OwnerPrescriptions'), { ssr: false });
const PetOverviewTab = dynamic(() => import('./pet-tabs/PetOverviewTab'), { ssr: false });
const PetVisitsTab = dynamic(() => import('./pet-tabs/PetVisitsTab'), { ssr: false });
const PetDocumentsTab = dynamic(() => import('./pet-tabs/PetDocumentsTab'), { ssr: false });
const PetVaccinesTab = dynamic(() => import('./pet-tabs/PetVaccinesTab'), { ssr: false });
const PetLabReportsTab = dynamic(() => import('./pet-tabs/PetLabReportsTab'), { ssr: false });
const PetDataTab = dynamic(() => import('./pet-tabs/PetDataTab'), { ssr: false });
const PetEditDialog = dynamic(() => import('./pet-tabs/PetEditDialog'), { ssr: false });

const api = {
  get: async (url) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vetbuddy_token') : null;
    const res = await fetch(`/api/${url}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  put: async (url, data) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vetbuddy_token') : null;
    const res = await fetch(`/api/${url}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

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

  const handleOpenDocument = (doc) => {
    if (doc.content && doc.mimeType === 'application/pdf') {
      const pdfWindow = window.open('');
      const base64Content = doc.content.startsWith('data:') ? doc.content : `data:application/pdf;base64,${doc.content}`;
      pdfWindow.document.write(`<iframe width='100%' height='100%' src='${base64Content}'></iframe>`);
    } else {
      setSelectedDocument(doc);
      setShowDocumentViewer(true);
    }
  };

  const handleDownloadDocument = async (doc) => {
    if (doc.content && doc.mimeType === 'application/pdf') {
      const link = document.createElement('a');
      link.href = doc.content.startsWith('data:') ? doc.content : `data:application/pdf;base64,${doc.content}`;
      link.download = doc.name || 'documento.pdf';
      link.click();
    } else if (doc.content) {
      const base64Content = doc.content.startsWith('data:') ? doc.content : `data:application/pdf;base64,${doc.content}`;
      const link = document.createElement('a');
      link.href = base64Content;
      link.download = doc.name || 'documento';
      link.click();
    }
  };

  const handleManageAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const loadPetData = async () => {
    try {
      const data = await api.get(`pets/${petId}`);
      setPet(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadPetData(); }, [petId]);

  const handleSaveEdit = async (editForm) => {
    try {
      await api.put(`pets/${petId}`, editForm);
      await loadPetData();
    } catch (e) { console.error(e); }
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
          <TabsTrigger value="prescriptions">💊 Prescrizioni</TabsTrigger>
          <TabsTrigger value="vaccines">Vaccini & Terapie</TabsTrigger>
          <TabsTrigger value="passport" className="flex items-center gap-1"><QrCode className="h-3 w-3" /> Passport</TabsTrigger>
          <TabsTrigger value="data">Dati & Spese</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PetOverviewTab pet={pet} nextAppointment={nextAppointment} lastDocument={lastDocument} onManageAppointment={handleManageAppointment} onOpenDocument={handleOpenDocument} />
        </TabsContent>

        <TabsContent value="visits">
          <PetVisitsTab appointments={petAppointments} onManageAppointment={handleManageAppointment} />
        </TabsContent>

        <TabsContent value="documents">
          <PetDocumentsTab documents={petDocuments} onOpenDocument={handleOpenDocument} onDownloadDocument={handleDownloadDocument} />
        </TabsContent>

        <TabsContent value="vaccines">
          <PetVaccinesTab pet={pet} />
        </TabsContent>

        <TabsContent value="labReports">
          <PetLabReportsTab petId={petId} petName={pet?.name} />
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardContent className="pt-6">
              <OwnerPrescriptions petId={pet?.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passport">
          <PetPassport pet={pet} token={typeof window !== 'undefined' ? localStorage.getItem('vetbuddy_token') : null} userRole="owner" />
        </TabsContent>

        <TabsContent value="data">
          <PetDataTab pet={pet} documents={petDocuments} />
        </TabsContent>
      </Tabs>
      
      {/* Edit Dialog */}
      {showEditDialog && (
        <PetEditDialog open={showEditDialog} onOpenChange={setShowEditDialog} pet={pet} onSave={handleSaveEdit} />
      )}
      
      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prenota visita per {pet.name}</DialogTitle>
            <DialogDescription>Vai alla sezione Appuntamenti per prenotare una nuova visita</DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <Calendar className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Per prenotare una visita, usa la sezione &quot;I miei appuntamenti&quot; nel menu laterale.</p>
            <Button onClick={() => { setShowBookingDialog(false); if (onNavigate) onNavigate('appointments'); else onBack(); }} className="bg-blue-500 hover:bg-blue-600">
              Vai agli Appuntamenti
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carica documento per {pet.name}</DialogTitle>
            <DialogDescription>Vai alla sezione Documenti per caricare un nuovo file</DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <Upload className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Per caricare documenti, usa la sezione &quot;Documenti&quot; nel menu laterale.</p>
            <Button onClick={() => { setShowUploadDialog(false); if (onNavigate) onNavigate('documents'); else onBack(); }} className="bg-green-500 hover:bg-green-600">
              Vai ai Documenti
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Appointment Details Dialog */}
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Document Viewer Dialog */}
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
              </div>
              
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

export default PetProfile;
