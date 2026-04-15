'use client';

import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Beaker, Cat, Check, CheckCircle, ChevronRight, Dog, Download, Edit, FileText, Image, Info, Loader2, Mail, PawPrint, Phone, Plus, RefreshCw, Save, Search, Send, Trash2, Upload, X } from 'lucide-react';
import api from '@/app/lib/api';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

function ClinicPatients({ pets, onRefresh, onNavigate, owners = [], onOpenOwner, initialPet, onClearInitialPet }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [petDetails, setPetDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formData, setFormData] = useState({ name: '', species: 'dog', breed: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  
  // Lab exam states
  const [showLabDialog, setShowLabDialog] = useState(false);
  const [labExams, setLabExams] = useState([]);
  const [selectedLabExams, setSelectedLabExams] = useState([]);
  const [labRequests, setLabRequests] = useState([]);
  const [labClinicalNotes, setLabClinicalNotes] = useState('');
  const [labLoading, setLabLoading] = useState(false);
  const [labCategory, setLabCategory] = useState('all');
  
  // Import states
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importStep, setImportStep] = useState(1); // 1: choose, 2: upload data, 3: upload docs, 4: results
  const [importFile, setImportFile] = useState(null);
  const [importDocs, setImportDocs] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  
  // Apri automaticamente il pet se viene passato da un altro componente
  useEffect(() => {
    if (initialPet) {
      openPetDetails(initialPet);
      if (onClearInitialPet) onClearInitialPet();
    }
  }, [initialPet]);
  
  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('pets', formData); setShowDialog(false); onRefresh(); } catch (error) { alert(error.message); } };
  
  const openPetDetails = async (pet) => {
    setSelectedPet(pet);
    setShowDetailDialog(true);
    setLoadingDetails(true);
    try {
      const details = await api.get(`pets/${pet.id}`);
      setPetDetails(details);
    } catch (error) {
      console.error('Error loading pet details:', error);
      setPetDetails(pet);
    } finally {
      setLoadingDetails(false);
    }
  };
  
  const getOwnerName = (ownerId) => {
    const owner = owners.find(o => o.id === ownerId);
    return owner?.name || 'Non assegnato';
  };
  
  const getOwnerDetails = (ownerId) => {
    return owners.find(o => o.id === ownerId) || null;
  };
  
  const handleEditPet = () => {
    setEditFormData({
      name: petDetails?.name || '',
      species: petDetails?.species || 'dog',
      breed: petDetails?.breed || '',
      weight: petDetails?.weight || '',
      microchip: petDetails?.microchip || ''
    });
    setShowEditDialog(true);
  };
  
  const handleSaveEdit = async () => {
    try {
      await api.put(`pets/${selectedPet.id}`, editFormData);
      alert('✅ Animale aggiornato!');
      setShowEditDialog(false);
      openPetDetails(selectedPet);
      onRefresh();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };
  
  const handleDeletePet = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedPet?.name}? Questa azione non può essere annullata.`)) return;
    try {
      await api.delete(`pets/${selectedPet.id}`);
      alert('✅ Animale eliminato!');
      setShowDetailDialog(false);
      onRefresh();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };
  
  // Lab exam functions
  const openLabDialog = async () => {
    setShowLabDialog(true);
    setLabLoading(true);
    try {
      // Load exam catalog
      const examData = await api.get('lab/exams');
      setLabExams(examData.exams || []);
      // Load existing requests for this pet
      const requestData = await api.get(`lab/requests?patientId=${selectedPet?.id}`);
      setLabRequests(requestData.requests || []);
    } catch (error) {
      console.error('Error loading lab data:', error);
    } finally {
      setLabLoading(false);
    }
  };
  
  const toggleExamSelection = (exam) => {
    setSelectedLabExams(prev => {
      const exists = prev.find(e => e.id === exam.id);
      if (exists) {
        return prev.filter(e => e.id !== exam.id);
      } else {
        return [...prev, exam];
      }
    });
  };
  
  const submitLabRequest = async (sendNow = false) => {
    if (selectedLabExams.length === 0) {
      alert('Seleziona almeno un esame');
      return;
    }
    try {
      setLabLoading(true);
      const owner = getOwnerDetails(petDetails?.ownerId);
      await api.post('lab/requests', {
        patientId: selectedPet?.id,
        patientName: selectedPet?.name,
        patientSpecies: selectedPet?.species,
        patientBreed: selectedPet?.breed,
        ownerId: petDetails?.ownerId,
        ownerName: owner?.name,
        ownerPhone: owner?.phone,
        ownerEmail: owner?.email,
        exams: selectedLabExams,
        clinicalNotes: labClinicalNotes,
        sendNow
      });
      alert(sendNow ? '✅ Richiesta inviata al laboratorio!' : '✅ Richiesta salvata come bozza!');
      setSelectedLabExams([]);
      setLabClinicalNotes('');
      // Reload requests
      const requestData = await api.get(`lab/requests?patientId=${selectedPet?.id}`);
      setLabRequests(requestData.requests || []);
    } catch (error) {
      alert('Errore: ' + error.message);
    } finally {
      setLabLoading(false);
    }
  };
  
  const getLabStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Bozza', className: 'bg-gray-100 text-gray-700' },
      sent: { label: 'Inviata', className: 'bg-blue-100 text-blue-700' },
      in_progress: { label: 'In lavorazione', className: 'bg-yellow-100 text-yellow-700' },
      results_received: { label: 'Referti ricevuti', className: 'bg-purple-100 text-purple-700' },
      validated: { label: 'Validati', className: 'bg-green-100 text-green-700' },
      shared: { label: 'Condivisi', className: 'bg-emerald-100 text-emerald-700' },
      cancelled: { label: 'Annullata', className: 'bg-red-100 text-red-700' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };
  
  // Import functions
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
    }
  };
  
  const handleDocsChange = (e) => {
    const files = Array.from(e.target.files);
    setImportDocs(prev => [...prev, ...files]);
  };
  
  const removeDoc = (index) => {
    setImportDocs(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleImportData = async () => {
    if (!importFile) return;
    
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('type', 'data');
      
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api.getToken()}`
        },
        body: formData
      });
      
      const result = await response.json();
      setImportResults(result);
      
      if (result.success) {
        setImportStep(3); // Go to documents step
        onRefresh();
      }
    } catch (error) {
      setImportResults({ success: false, error: error.message });
    } finally {
      setImporting(false);
    }
  };
  
  const handleImportDocs = async () => {
    if (importDocs.length === 0) {
      setImportStep(4);
      return;
    }
    
    setImporting(true);
    try {
      const formData = new FormData();
      importDocs.forEach(file => formData.append('files', file));
      formData.append('type', 'documents');
      
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api.getToken()}`
        },
        body: formData
      });
      
      const result = await response.json();
      setImportResults(prev => ({
        ...prev,
        imported: {
          ...prev?.imported,
          documents: result.imported?.documents || 0
        },
        warnings: [...(prev?.warnings || []), ...(result.warnings || [])],
        errors: [...(prev?.errors || []), ...(result.errors || [])]
      }));
      
      setImportStep(4);
      onRefresh();
    } catch (error) {
      setImportResults(prev => ({
        ...prev,
        errors: [...(prev?.errors || []), error.message]
      }));
    } finally {
      setImporting(false);
    }
  };
  
  const downloadTemplate = () => {
    const csvContent = `nome,specie,razza,data_nascita,microchip,sesso,peso,colore,sterilizzato,allergie,farmaci,note,proprietario,email,telefono,indirizzo,vaccino,data_vaccino,scadenza_vaccino
Luna,cane,Labrador,15/03/2020,380260000123456,femmina,25,biondo,si,Allergia al pollo,,Cane molto socievole,Mario Rossi,mario.rossi@email.it,+39 333 1234567,Via Roma 123 Milano,Polivalente,01/01/2024,01/01/2025
Max,gatto,Europeo,20/06/2019,380260000789012,maschio,5,tigrato,no,,,Gatto indoor,Anna Bianchi,anna.bianchi@email.it,+39 338 9876543,Via Verdi 45 Roma,Trivalente,15/03/2024,15/03/2025
Milo,cane,Golden Retriever,10/08/2021,,maschio,28,dorato,si,,Apoquel 16mg,Dermatite atopica in cura,Luca Verdi,luca.verdi@email.it,+39 340 5551234,Via Dante 78 Torino,Rabbia,20/06/2024,20/06/2025`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_import_pazienti.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const resetImport = () => {
    setImportStep(1);
    setImportFile(null);
    setImportDocs([]);
    setImportResults(null);
    setShowImportDialog(false);
  };
  
  // Filtra i pazienti per la ricerca
  const filteredPets = pets.filter(pet => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const ownerName = getOwnerName(pet.ownerId).toLowerCase();
    return (
      pet.name?.toLowerCase().includes(query) ||
      pet.breed?.toLowerCase().includes(query) ||
      pet.microchip?.toLowerCase().includes(query) ||
      ownerName.includes(query)
    );
  });
  
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years < 1) return `${months + (months < 0 ? 12 : 0)} mesi`;
    return `${years} ann${years === 1 ? 'o' : 'i'}`;
  };
  
  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Pazienti</h2>
          <p className="text-gray-500 text-sm">Animali registrati - clicca per vedere i dettagli</p>
        </div>
        <div className="flex gap-2">
          {/* Import Button */}
          <Button variant="outline" onClick={() => setShowImportDialog(true)} className="border-blue-300 text-blue-600 hover:bg-blue-50">
            <Upload className="h-4 w-4 mr-2" />Import Dati
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Nuovo</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuovo paziente</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
                <div><Label>Specie</Label><Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dog">🐕 Cane</SelectItem><SelectItem value="cat">🐱 Gatto</SelectItem><SelectItem value="horse">🐴 Cavallo</SelectItem><SelectItem value="bird">🦜 Uccello</SelectItem><SelectItem value="rabbit">🐰 Coniglio</SelectItem><SelectItem value="hamster">🐹 Criceto</SelectItem><SelectItem value="fish">🐠 Pesce</SelectItem><SelectItem value="reptile">🦎 Rettile</SelectItem><SelectItem value="other">🐾 Altro</SelectItem></SelectContent></Select></div>
                <div><Label>Razza</Label><Input value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} /></div>
                <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={(open) => !open && resetImport()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              Import Pazienti Esistenti
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between">
              <span>Carica i tuoi pazienti esistenti da file CSV/Excel</span>
              <a href="/guida-import" target="_blank" className="text-blue-500 hover:underline text-sm flex items-center gap-1">
                📖 Guida completa
              </a>
            </DialogDescription>
          </DialogHeader>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  importStep >= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step === 4 && importStep === 4 ? '✓' : step}
                </div>
                {step < 4 && <div className={`w-8 h-1 ${importStep > step ? 'bg-blue-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 text-xs text-gray-500 -mt-2 mb-4">
            <span>Inizia</span>
            <span>Dati</span>
            <span>Documenti</span>
            <span>Fatto</span>
          </div>
          
          {/* Step 1: Choose */}
          {importStep === 1 && (
            <div className="space-y-4">
              {/* Quick Start - Super chiaro */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-xl text-white">
                <h3 className="font-bold text-lg mb-3">⚡ Import Rapido in 3 Passi</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-2xl mb-1">1️⃣</div>
                    <p className="text-sm font-medium">Scarica il template</p>
                    <p className="text-xs opacity-80">File Excel/CSV pronto</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-2xl mb-1">2️⃣</div>
                    <p className="text-sm font-medium">Compila i dati</p>
                    <p className="text-xs opacity-80">Copia dal tuo gestionale</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-2xl mb-1">3️⃣</div>
                    <p className="text-sm font-medium">Carica il file</p>
                    <p className="text-xs opacity-80">Import automatico!</p>
                  </div>
                </div>
              </div>
              
              {/* Main Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={downloadTemplate} className="h-28 flex-col border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50">
                  <Download className="h-8 w-8 mb-2 text-blue-500" />
                  <span className="font-semibold">Scarica Template</span>
                  <span className="text-xs text-gray-500">File CSV con esempi</span>
                </Button>
                <Button className="h-28 flex-col bg-green-500 hover:bg-green-600" onClick={() => setImportStep(2)}>
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="font-semibold">Ho già il file</span>
                  <span className="text-xs opacity-80">Vai all'upload →</span>
                </Button>
              </div>
              
              {/* Cosa viene importato */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" /> Cosa viene importato automaticamente:
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🐾</span>
                    <span><strong>Animali:</strong> nome, specie, razza, peso, microchip</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <span><strong>Proprietari:</strong> nome, email, telefono</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💉</span>
                    <span><strong>Vaccini:</strong> nome, data, scadenza</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <span><strong>Info cliniche:</strong> allergie, farmaci, note</span>
                  </div>
                </div>
              </div>
              
              {/* Detailed instructions - Accordion */}
              <Accordion type="single" collapsible className="border rounded-lg">
                <AccordionItem value="columns" className="border-0">
                  <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
                    <span className="flex items-center gap-2"><Info className="h-4 w-4" /> 📖 Guida completa alle colonne del template</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 text-sm">
                      <div className="bg-coral-50 p-3 rounded-lg">
                        <p className="font-semibold text-coral-700 mb-2">⚠️ Campi obbligatori (solo 2!):</p>
                        <ul className="space-y-1 text-coral-600">
                          <li>• <strong>nome</strong> - Nome dell'animale (es. "Luna")</li>
                          <li>• <strong>specie</strong> - Scrivi: cane, gatto, uccello, coniglio, criceto, altro</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Campi opzionali animale:</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                          <p>• <strong>razza</strong> - es. "Labrador"</p>
                          <p>• <strong>data_nascita</strong> - formato: 15/03/2020</p>
                          <p>• <strong>microchip</strong> - es. "380260000123456"</p>
                          <p>• <strong>sesso</strong> - scrivi: maschio o femmina</p>
                          <p>• <strong>peso</strong> - solo numero, es. "25"</p>
                          <p>• <strong>colore</strong> - es. "biondo"</p>
                          <p>• <strong>sterilizzato</strong> - scrivi: si o no</p>
                          <p>• <strong>allergie</strong> - testo libero</p>
                          <p>• <strong>farmaci</strong> - farmaci in corso</p>
                          <p>• <strong>note</strong> - note aggiuntive</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Campi opzionali proprietario:</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                          <p>• <strong>proprietario</strong> - es. "Mario Rossi"</p>
                          <p>• <strong>email</strong> - email del proprietario</p>
                          <p>• <strong>telefono</strong> - es. "+39 333 1234567"</p>
                          <p>• <strong>indirizzo</strong> - indirizzo completo</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Campi opzionali vaccino:</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                          <p>• <strong>vaccino</strong> - es. "Polivalente"</p>
                          <p>• <strong>data_vaccino</strong> - formato: 01/01/2024</p>
                          <p>• <strong>scadenza_vaccino</strong> - formato: 01/01/2025</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg mt-3">
                        <p className="text-blue-700"><strong>💡 Tip:</strong> Se un proprietario ha più animali, aggiungi una riga per ogni animale con lo stesso email del proprietario.</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="gestionale" className="border-0 border-t">
                  <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
                    <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> 🔄 Come esportare dal tuo gestionale</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3 text-sm text-gray-600">
                      <p><strong>1.</strong> Nel tuo gestionale attuale, cerca la funzione "Esporta" o "Export"</p>
                      <p><strong>2.</strong> Seleziona formato CSV o Excel</p>
                      <p><strong>3.</strong> Apri il file esportato con Excel o Google Sheets</p>
                      <p><strong>4.</strong> Rinomina le colonne secondo il nostro template</p>
                      <p><strong>5.</strong> Salva come CSV e caricalo qui</p>
                      <div className="bg-amber-50 p-3 rounded-lg mt-3">
                        <p className="text-amber-700"><strong>⏱️ Tempo stimato:</strong> 5-10 minuti per preparare il file, poi l'import è istantaneo!</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-sm">
                <p className="text-green-800"><strong>🔒 Privacy e GDPR:</strong> I dati vengono importati in modo sicuro e criptato. Solo la tua clinica avrà accesso. Conforme alle normative europee sulla protezione dei dati.</p>
              </div>
            </div>
          )}
          
          {/* Step 2: Upload Data */}
          {importStep === 2 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file" className="cursor-pointer">
                  {importFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="h-10 w-10 text-green-500" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{importFile.name}</p>
                        <p className="text-sm text-gray-500">{(importFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); setImportFile(null); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 font-medium">Trascina qui il file CSV o clicca per selezionare</p>
                      <p className="text-sm text-gray-400 mt-1">Formati supportati: CSV, Excel (.xlsx, .xls)</p>
                    </>
                  )}
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setImportStep(1)} className="flex-1">
                  ← Indietro
                </Button>
                <Button 
                  onClick={handleImportData} 
                  disabled={!importFile || importing}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  {importing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importazione...</>
                  ) : (
                    <>Importa Dati →</>
                  )}
                </Button>
              </div>
              
              {importResults && importResults.error && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-red-700 text-sm">
                  <strong>Errore:</strong> {importResults.error}
                </div>
              )}
            </div>
          )}
          
          {/* Step 3: Upload Documents */}
          {importStep === 3 && (
            <div className="space-y-4">
              {importResults && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" /> Dati importati con successo!
                  </h3>
                  <div className="mt-2 text-sm text-green-700 grid grid-cols-3 gap-2">
                    <span>👤 {importResults.imported?.owners || 0} proprietari</span>
                    <span>🐾 {importResults.imported?.pets || 0} animali</span>
                    <span>💉 {importResults.imported?.vaccines || 0} vaccini</span>
                  </div>
                  {importResults.warnings?.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-amber-600 cursor-pointer text-sm">⚠️ {importResults.warnings.length} avvisi</summary>
                      <ul className="text-xs text-amber-600 mt-1 max-h-20 overflow-auto">
                        {importResults.warnings.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </details>
                  )}
                </div>
              )}
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleDocsChange}
                  className="hidden"
                  id="import-docs"
                />
                <label htmlFor="import-docs" className="cursor-pointer">
                  <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 font-medium">Carica documenti (opzionale)</p>
                  <p className="text-sm text-gray-400">PDF, JPG, PNG - Nomina i file con il nome del paziente per associazione automatica</p>
                </label>
              </div>
              
              {importDocs.length > 0 && (
                <div className="max-h-40 overflow-auto space-y-2">
                  {importDocs.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        {doc.type.includes('pdf') ? <FileText className="h-4 w-4 text-red-500" /> : <Image className="h-4 w-4 text-blue-500" />}
                        <span className="text-sm truncate max-w-xs">{doc.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeDoc(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setImportStep(4)} className="flex-1">
                  Salta questo step
                </Button>
                <Button 
                  onClick={handleImportDocs} 
                  disabled={importing}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  {importing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Caricamento...</>
                  ) : (
                    <>Carica {importDocs.length} documenti →</>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 4: Results */}
          {importStep === 4 && (
            <div className="space-y-4 text-center">
              <div className="py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Import Completato!</h3>
                <p className="text-gray-500 mt-2">I tuoi pazienti sono stati importati con successo.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{importResults?.imported?.owners || 0}</p>
                    <p className="text-xs text-gray-500">Proprietari</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-coral-500">{importResults?.imported?.pets || 0}</p>
                    <p className="text-xs text-gray-500">Animali</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{importResults?.imported?.vaccines || 0}</p>
                    <p className="text-xs text-gray-500">Vaccini</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{importResults?.imported?.documents || 0}</p>
                    <p className="text-xs text-gray-500">Documenti</p>
                  </div>
                </div>
              </div>
              
              {(importResults?.warnings?.length > 0 || importResults?.errors?.length > 0) && (
                <div className="bg-amber-50 p-3 rounded-lg text-left text-sm">
                  {importResults.errors?.length > 0 && (
                    <p className="text-red-600 mb-1">❌ {importResults.errors.length} errori</p>
                  )}
                  {importResults.warnings?.length > 0 && (
                    <p className="text-amber-600">⚠️ {importResults.warnings.length} avvisi - alcuni dati potrebbero richiedere revisione</p>
                  )}
                </div>
              )}
              
              <Button onClick={resetImport} className="w-full bg-coral-500 hover:bg-coral-600">
                Chiudi e vedi i pazienti
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Barra di ricerca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Cerca per nome animale, razza, microchip o proprietario..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            {filteredPets.length} risultat{filteredPets.length === 1 ? 'o' : 'i'} per "{searchQuery}"
          </p>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPets.length === 0 ? (
          <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>{searchQuery ? 'Nessun risultato trovato' : 'Nessun paziente'}</p></CardContent></Card>
        ) : filteredPets.map((pet) => (
          <Card key={pet.id} className="cursor-pointer hover:shadow-lg hover:border-coral-300 transition-all group" onClick={() => openPetDetails(pet)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center group-hover:bg-coral-200 transition-colors">
                  {pet.species === 'dog' ? <Dog className="h-6 w-6 text-coral-600" /> : pet.species === 'cat' ? <Cat className="h-6 w-6 text-coral-600" /> : <PawPrint className="h-6 w-6 text-coral-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{pet.name}</p>
                  <p className="text-sm text-gray-500">{pet.breed || (pet.species === 'dog' ? 'Cane' : pet.species === 'cat' ? 'Gatto' : 'Altro')}</p>
                  {pet.ownerId && <p className="text-xs text-gray-400 mt-1">👤 {getOwnerName(pet.ownerId)}</p>}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-coral-500 transition-colors" />
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {pet.sterilized && <Badge variant="outline" className="text-xs text-green-600 border-green-300">Sterilizzato</Badge>}
                {pet.microchip && <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">Microchip</Badge>}
                {pet.allergies && <Badge variant="outline" className="text-xs text-red-600 border-red-300">Allergie</Badge>}
                {pet.insurance && <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">Assicurato</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Detail Modal */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 bg-coral-100 rounded-full flex items-center justify-center">
                {selectedPet?.species === 'dog' ? <Dog className="h-5 w-5 text-coral-600" /> : selectedPet?.species === 'cat' ? <Cat className="h-5 w-5 text-coral-600" /> : <PawPrint className="h-5 w-5 text-coral-600" />}
              </div>
              {selectedPet?.name || 'Dettagli Paziente'}
            </DialogTitle>
            <DialogDescription>{selectedPet?.breed || 'Scheda clinica completa'}</DialogDescription>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-coral-500" /></div>
          ) : petDetails ? (
            <div className="space-y-6 mt-4">
              {/* Info Base */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Specie</p>
                  <p className="font-medium">{petDetails.species === 'dog' ? 'Cane' : petDetails.species === 'cat' ? 'Gatto' : 'Altro'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Razza</p>
                  <p className="font-medium">{petDetails.breed || 'Non specificata'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Età</p>
                  <p className="font-medium">{calculateAge(petDetails.birthDate) || 'Non specificata'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Peso</p>
                  <p className="font-medium">{petDetails.weight ? `${petDetails.weight} kg` : 'Non registrato'}</p>
                </div>
              </div>
              
              {/* Proprietario - Con email e telefono, cliccabile */}
              {petDetails.ownerId && (() => {
                const owner = getOwnerDetails(petDetails.ownerId);
                return (
                  <div 
                    className="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => {
                      if (owner && onOpenOwner) {
                        setShowDetailDialog(false);
                        onOpenOwner(owner);
                      }
                    }}
                  >
                    <p className="text-sm text-blue-600 font-medium mb-2">👤 Proprietario</p>
                    <p className="font-medium text-lg">{owner?.name || 'Non assegnato'}</p>
                    {owner?.email && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{owner.email}</span>
                      </div>
                    )}
                    {owner?.phone && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{owner.phone}</span>
                      </div>
                    )}
                    {owner && onOpenOwner && (
                      <p className="text-xs text-blue-500 mt-2">Clicca per vedere la scheda cliente →</p>
                    )}
                  </div>
                );
              })()}
              
              {/* Microchip */}
              {petDetails.microchip && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Microchip</p>
                  <p className="font-mono font-medium">{petDetails.microchip}</p>
                </div>
              )}
              
              {/* Assicurazione */}
              {petDetails.insurance && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium mb-2">🛡️ Assicurazione</p>
                  <p className="font-medium">{petDetails.insuranceCompany || 'Compagnia non specificata'}</p>
                  {petDetails.insurancePolicy && <p className="text-sm text-gray-500">Polizza: {petDetails.insurancePolicy}</p>}
                </div>
              )}
              
              {/* Condizioni Mediche */}
              {(petDetails.chronicDiseases || petDetails.currentConditions || petDetails.allergies) && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600 font-medium mb-2">⚠️ Condizioni Mediche</p>
                  {petDetails.chronicDiseases && <p className="text-sm mb-2"><strong>Patologie croniche:</strong> {petDetails.chronicDiseases}</p>}
                  {petDetails.currentConditions && <p className="text-sm mb-2"><strong>Condizioni attuali:</strong> {petDetails.currentConditions}</p>}
                  {petDetails.allergies && <p className="text-sm"><strong>Allergie:</strong> {petDetails.allergies}</p>}
                </div>
              )}
              
              {/* Farmaci */}
              {petDetails.medications && (
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-600 font-medium mb-2">💊 Farmaci in corso</p>
                  {Array.isArray(petDetails.medications) ? (
                    <div className="space-y-1">
                      {petDetails.medications.map((med, i) => (
                        <p key={i} className="text-sm">{typeof med === 'object' ? `${med.name} - ${med.dosage} (${med.frequency})` : med}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm">{petDetails.medications}</p>
                  )}
                </div>
              )}
              
              {/* Storico Pesi */}
              {petDetails.weightHistory && petDetails.weightHistory.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-2">📊 Storico Pesi</p>
                  <div className="space-y-1">
                    {petDetails.weightHistory.slice(-5).reverse().map((w, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{new Date(w.date).toLocaleDateString('it-IT')}</span>
                        <span className="font-medium">{w.weight} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Appuntamenti recenti */}
              {petDetails.appointments && petDetails.appointments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">📅 Ultimi appuntamenti</p>
                  <div className="space-y-2">
                    {petDetails.appointments.slice(0, 5).map((apt, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{apt.type || apt.reason || 'Visita'}</p>
                          <p className="text-xs text-gray-500">{new Date(apt.date).toLocaleDateString('it-IT')}</p>
                        </div>
                        <Badge variant={apt.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                          {apt.status === 'completed' ? 'Completato' : apt.status === 'cancelled' ? 'Annullato' : 'Programmato'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Note */}
              {petDetails.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">📝 Note comportamentali</p>
                  <p className="text-sm">{petDetails.notes}</p>
                </div>
              )}
              
              {/* Esami Laboratorio */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-medium flex items-center gap-2">🔬 Esami di Laboratorio</p>
                  <Button size="sm" onClick={openLabDialog} className="bg-purple-500 hover:bg-purple-600">
                    <Plus className="h-4 w-4 mr-1" />
                    Richiedi Esami
                  </Button>
                </div>
                {labRequests.length > 0 ? (
                  <div className="space-y-2">
                    {labRequests.slice(0, 3).map((req, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{req.exams?.map(e => e.name).join(', ').substring(0, 50)}...</p>
                          <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString('it-IT')} • {req.practiceCode}</p>
                        </div>
                        {getLabStatusBadge(req.status)}
                      </div>
                    ))}
                    {labRequests.length > 3 && (
                      <Button variant="link" size="sm" onClick={openLabDialog} className="text-purple-600">
                        Vedi tutti ({labRequests.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Nessuna richiesta esami</p>
                )}
              </div>
              
              {/* Azioni - Modifica e Elimina */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={handleEditPet}>
                  <Edit className="h-4 w-4 mr-2" />Modifica
                </Button>
                <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleDeletePet}>
                  <Trash2 className="h-4 w-4 mr-2" />Elimina
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      
      {/* Dialog Modifica Animale */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica {selectedPet?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome</Label>
              <Input value={editFormData.name || ''} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
            </div>
            <div>
              <Label>Specie</Label>
              <Select value={editFormData.species || 'dog'} onValueChange={(v) => setEditFormData({...editFormData, species: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">🐕 Cane</SelectItem>
                  <SelectItem value="cat">🐱 Gatto</SelectItem>
                  <SelectItem value="horse">🐴 Cavallo</SelectItem>
                  <SelectItem value="bird">🦜 Uccello</SelectItem>
                  <SelectItem value="rabbit">🐰 Coniglio</SelectItem>
                  <SelectItem value="other">🐾 Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Razza</Label>
              <Input value={editFormData.breed || ''} onChange={(e) => setEditFormData({...editFormData, breed: e.target.value})} />
            </div>
            <div>
              <Label>Peso (kg)</Label>
              <Input type="number" step="0.1" value={editFormData.weight || ''} onChange={(e) => setEditFormData({...editFormData, weight: e.target.value})} />
            </div>
            <div>
              <Label>Microchip</Label>
              <Input value={editFormData.microchip || ''} onChange={(e) => setEditFormData({...editFormData, microchip: e.target.value})} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">Annulla</Button>
              <Button onClick={handleSaveEdit} className="flex-1 bg-coral-500 hover:bg-coral-600">Salva</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Richiedi Esami Lab */}
      <Dialog open={showLabDialog} onOpenChange={setShowLabDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Beaker className="h-4 w-4 text-purple-600" />
              </div>
              Richiedi Esami per {selectedPet?.name}
            </DialogTitle>
            <DialogDescription>Seleziona gli esami da richiedere al laboratorio</DialogDescription>
          </DialogHeader>
          
          {labLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {/* Filtro Categoria */}
              <div className="flex gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  variant={labCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setLabCategory('all')}
                >
                  Tutti
                </Button>
                {['routine', 'endocrino', 'infettivologia', 'microbiologia', 'citologia', 'istologia', 'cardiologia', 'altro'].map(cat => (
                  <Button 
                    key={cat}
                    size="sm" 
                    variant={labCategory === cat ? 'default' : 'outline'}
                    onClick={() => setLabCategory(cat)}
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              
              {/* Lista Esami */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto border rounded-lg p-3">
                {labExams
                  .filter(exam => labCategory === 'all' || exam.category === labCategory)
                  .map(exam => (
                    <div
                      key={exam.id}
                      onClick={() => toggleExamSelection(exam)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        selectedLabExams.find(e => e.id === exam.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                          selectedLabExams.find(e => e.id === exam.id)
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedLabExams.find(e => e.id === exam.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{exam.name}</p>
                          <p className="text-xs text-gray-500">{exam.description}</p>
                          <div className="flex gap-3 mt-1 text-xs text-gray-400">
                            <span>⏱ {exam.turnaroundHours}h</span>
                            <span>€{exam.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Esami Selezionati */}
              {selectedLabExams.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="font-medium text-purple-700 mb-2">Esami selezionati ({selectedLabExams.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLabExams.map(exam => (
                      <Badge 
                        key={exam.id} 
                        className="bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200"
                        onClick={() => toggleExamSelection(exam)}
                      >
                        {exam.name} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-purple-600 mt-2">
                    Totale: €{selectedLabExams.reduce((sum, e) => sum + (e.price || 0), 0)} • 
                    Tempo max: {Math.max(...selectedLabExams.map(e => e.turnaroundHours || 72))}h
                  </p>
                </div>
              )}
              
              {/* Note Cliniche */}
              <div>
                <Label>Note cliniche per il laboratorio</Label>
                <Textarea 
                  placeholder="Anamnesi, sospetto diagnostico, informazioni rilevanti..."
                  value={labClinicalNotes}
                  onChange={(e) => setLabClinicalNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              {/* Storico Richieste */}
              {labRequests.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Storico richieste ({labRequests.length})</p>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {labRequests.map((req, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{req.practiceCode}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(req.createdAt).toLocaleDateString('it-IT')} • 
                            {req.exams?.length} esami
                          </p>
                        </div>
                        {getLabStatusBadge(req.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Azioni */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowLabDialog(false)} className="flex-1">
                  Annulla
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => submitLabRequest(false)} 
                  disabled={selectedLabExams.length === 0 || labLoading}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salva Bozza
                </Button>
                <Button 
                  onClick={() => submitLabRequest(true)} 
                  disabled={selectedLabExams.length === 0 || labLoading}
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Invia al Lab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


export default ClinicPatients;
