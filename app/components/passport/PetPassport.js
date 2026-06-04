'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Shield, QrCode, FileText, Syringe, Plane, Share2, AlertTriangle, Heart,
  Clock, Plus, Download, Copy, Phone, Mail, MapPin, Eye, EyeOff, Trash2,
  CheckCircle, XCircle, Calendar, PawPrint, RefreshCw, ExternalLink, Send,
  Edit, ChevronRight, Globe, Lock, Loader2, X
} from 'lucide-react';

const api = {
  get: async (url, token) => {
    const res = await fetch(`/api/${url}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  post: async (url, data, token) => {
    const res = await fetch(`/api/${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
    return res.json();
  },
  put: async (url, data, token) => {
    const res = await fetch(`/api/${url}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
    return res.json();
  },
  del: async (url, token) => {
    const res = await fetch(`/api/${url}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function PetPassport({ pet, token, userRole }) {
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('panoramica');
  const [showModal, setShowModal] = useState(null);
  const [modalData, setModalData] = useState({});
  const [saving, setSaving] = useState(false);

  const loadPassport = useCallback(async () => {
    if (!pet?.id || !token) return;
    setLoading(true);
    try {
      const data = await api.get(`passport/${pet.id}`, token);
      setPassportData(data);
    } catch (e) { console.error('Errore caricamento passport:', e); }
    setLoading(false);
  }, [pet?.id, token]);

  useEffect(() => { loadPassport(); }, [loadPassport]);

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-coral-500 mr-2" />
      <span className="text-gray-500">Caricamento Passport...</span>
    </div>
  );

  if (!passportData) return (
    <Card><CardContent className="p-6 text-center text-gray-500">
      Impossibile caricare il Passport. Riprova più tardi.
    </CardContent></Card>
  );

  const { completion, passport, emergencyContacts, vaccinations, documents, travelPacks, sharingLinks, insurance, recentScans } = passportData;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // ============================================================
  // MODAL HANDLER
  // ============================================================
  const handleSave = async () => {
    setSaving(true);
    try {
      if (showModal === 'emergencyContact') {
        await api.post('passport/emergency-contacts', { petId: pet.id, ...modalData }, token);
      } else if (showModal === 'vaccination') {
        await api.post('passport/vaccinations', { petId: pet.id, ...modalData }, token);
      } else if (showModal === 'travelPack') {
        await api.post('passport/travel-packs', { petId: pet.id, ...modalData }, token);
      } else if (showModal === 'sharing') {
        await api.post('passport/sharing', { petId: pet.id, ...modalData }, token);
      } else if (showModal === 'insurance') {
        await api.post('passport/insurance', { petId: pet.id, ...modalData }, token);
      } else if (showModal === 'lostPet') {
        await api.put(`passport/${pet.id}`, { lostPetMode: true, ...modalData }, token);
      }
      setShowModal(null);
      setModalData({});
      await loadPassport();
    } catch (e) { console.error('Errore salvataggio:', e); }
    setSaving(false);
  };

  const generateQR = async () => {
    setSaving(true);
    const res = await api.post('passport/qr/generate', { petId: pet.id }, token);
    if (res.qrPageUrl) {
      await loadPassport();
    }
    setSaving(false);
  };

  const toggleLostPetMode = async () => {
    if (passport?.lostPetMode) {
      await api.put(`passport/${pet.id}`, { lostPetMode: false }, token);
      await loadPassport();
    } else {
      setShowModal('lostPet');
      setModalData({ lostPetZone: '', lostPetMessage: '', lostPetReward: '' });
    }
  };

  const revokeShare = async (shareId) => {
    await api.put(`passport/sharing/${shareId}/revoke`, {}, token);
    await loadPassport();
  };

  const deleteItem = async (type, id) => {
    await api.del(`passport/${type}/${id}`, token);
    await loadPassport();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="space-y-4">
      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="panoramica">📋 Panoramica</TabsTrigger>
          <TabsTrigger value="emergenza">🆘 Emergenza QR</TabsTrigger>
          <TabsTrigger value="vaccini">💉 Vaccini</TabsTrigger>
          <TabsTrigger value="viaggi">✈️ Viaggi</TabsTrigger>
          <TabsTrigger value="condivisioni">🔗 Condivisioni</TabsTrigger>
          <TabsTrigger value="assicurazione">🛡️ Assicurazione</TabsTrigger>
          <TabsTrigger value="timeline">📅 Timeline</TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* PANORAMICA */}
        {/* ============================================================ */}
        <TabsContent value="panoramica">
          <div className="space-y-4">
            {/* Completion Score */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Stato Passport</h3>
                    <p className="text-sm text-gray-500">Completamento: {completion?.score || 0}%</p>
                  </div>
                  <Badge className={
                    completion?.status === 'completo' ? 'bg-green-100 text-green-700' :
                    completion?.status === 'quasi_completo' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }>
                    {completion?.status === 'completo' ? '✅ Completo' :
                     completion?.status === 'quasi_completo' ? '⚠️ Quasi completo' :
                     '❌ Incompleto'}
                  </Badge>
                </div>
                <Progress value={completion?.score || 0} className="h-2" />
                {completion?.missing?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {completion.missing.map(m => (
                      <Badge key={m} variant="outline" className="text-xs text-gray-500">
                        {m === 'photo' ? '📷 Foto' : m === 'microchip' ? '🏷️ Microchip' :
                         m === 'emergencyContacts' ? '📞 Contatti emergenza' : m === 'qrEnabled' ? '📱 QR' :
                         m === 'vaccinations' ? '💉 Vaccini' : m === 'documents' ? '📄 Documenti' :
                         m === 'allergies' ? '⚠️ Allergie' : m}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('emergenza')}>
                <CardContent className="p-3 text-center">
                  <QrCode className={`h-6 w-6 mx-auto mb-1 ${passport?.publicQrEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                  <p className="text-xs font-medium">{passport?.publicQrEnabled ? 'QR Attivo' : 'QR Non attivo'}</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('vaccini')}>
                <CardContent className="p-3 text-center">
                  <Syringe className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs font-medium">{vaccinations?.length || 0} Vaccini</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('condivisioni')}>
                <CardContent className="p-3 text-center">
                  <Share2 className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs font-medium">{sharingLinks?.filter(s => s.status === 'active').length || 0} Condivisioni</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('viaggi')}>
                <CardContent className="p-3 text-center">
                  <Plane className="h-6 w-6 mx-auto mb-1 text-sky-500" />
                  <p className="text-xs font-medium">{travelPacks?.length || 0} Viaggi</p>
                </CardContent>
              </Card>
            </div>

            {/* CTA Rapide */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Azioni rapide</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-2">
                  {!passport?.publicQrEnabled && (
                    <Button size="sm" variant="outline" onClick={generateQR} disabled={saving}>
                      <QrCode className="h-4 w-4 mr-1" /> Genera QR
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { setShowModal('vaccination'); setModalData({}); }}>
                    <Syringe className="h-4 w-4 mr-1" /> Aggiungi vaccino
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setShowModal('emergencyContact'); setModalData({}); }}>
                    <Phone className="h-4 w-4 mr-1" /> Contatto emergenza
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setShowModal('travelPack'); setModalData({}); }}>
                    <Plane className="h-4 w-4 mr-1" /> Travel Pack
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setShowModal('sharing'); setModalData({}); }}>
                    <Share2 className="h-4 w-4 mr-1" /> Condividi
                  </Button>
                  <Button size="sm" variant={passport?.lostPetMode ? "destructive" : "outline"} onClick={toggleLostPetMode}>
                    <AlertTriangle className="h-4 w-4 mr-1" /> {passport?.lostPetMode ? 'Disattiva Lost Mode' : 'Lost Pet Mode'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lost Pet Mode Alert */}
            {passport?.lostPetMode && (
              <Card className="border-red-300 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                    <AlertTriangle className="h-5 w-5" /> ANIMALE SMARRITO
                  </div>
                  <p className="text-sm text-red-600">Zona: {passport.lostPetZone || 'Non specificata'}</p>
                  {passport.lostPetMessage && <p className="text-sm text-red-600 mt-1">{passport.lostPetMessage}</p>}
                  <Button size="sm" variant="outline" className="mt-2 border-red-300 text-red-600" onClick={toggleLostPetMode}>
                    Segna come ritrovato
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Emergency Contacts */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Contatti emergenza</CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => { setShowModal('emergencyContact'); setModalData({}); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {emergencyContacts?.length > 0 ? (
                  <div className="space-y-2">
                    {emergencyContacts.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{c.name} <span className="text-xs text-gray-500">({c.relationship})</span></p>
                          <p className="text-xs text-gray-500">{c.phone} {c.email && `• ${c.email}`}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {c.visibleOnQr && <Badge className="bg-green-100 text-green-700 text-xs">QR</Badge>}
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400" onClick={() => deleteItem('emergency-contacts', c.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Nessun contatto di emergenza. Aggiungine almeno uno per rendere il Passport più utile.</p>
                )}
              </CardContent>
            </Card>

            {/* Dati Essenziali Animale */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Dati essenziali</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Microchip</p>
                    <p className="font-medium">{pet?.microchip || <span className="text-amber-500 italic">Mancante</span>}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Peso</p>
                    <p className="font-medium">{pet?.weight ? `${pet.weight} kg` : <span className="text-amber-500 italic">Non indicato</span>}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Data di nascita</p>
                    <p className="font-medium">{pet?.birthDate ? new Date(pet.birthDate).toLocaleDateString('it-IT') : <span className="text-amber-500 italic">Non indicata</span>}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Allergie</p>
                    <p className="font-medium">{pet?.allergies?.length > 0 ? pet.allergies.join(', ') : <span className="text-gray-400">Nessuna segnalata</span>}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Farmaci ricorrenti</p>
                    <p className="font-medium">{pet?.medications?.length > 0 ? pet.medications.join(', ') : <span className="text-gray-400">Nessuno</span>}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Patologie croniche</p>
                    <p className="font-medium">{pet?.chronicConditions?.length > 0 ? pet.chronicConditions.join(', ') : <span className="text-gray-400">Nessuna</span>}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Alimentazione</p>
                    <p className="font-medium">{pet?.diet || <span className="text-gray-400">Non indicata</span>}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Note comportamentali</p>
                    <p className="font-medium">{pet?.behavioralNotes || <span className="text-gray-400">Nessuna</span>}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Segni particolari</p>
                    <p className="font-medium">{pet?.distinguishingMarks || <span className="text-gray-400">Nessuno</span>}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer Medico */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-800 leading-relaxed">
              <strong>⚕️ Nota importante:</strong> VetBuddy Passport aiuta a organizzare informazioni, documenti e promemoria dell&apos;animale. Non sostituisce diagnosi, prescrizioni o valutazioni del medico veterinario. Per qualsiasi questione medica, consulta sempre il tuo veterinario.
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* EMERGENZA QR */}
        {/* ============================================================ */}
        <TabsContent value="emergenza">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-coral-500" /> QR Emergenza
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {passport?.publicQrEnabled && passport?.publicQrUrl ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="w-48 h-48 mx-auto bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
                        <div className="text-center">
                          <QrCode className="h-16 w-16 text-gray-400 mx-auto" />
                          <p className="text-xs text-gray-400 mt-1">QR Code</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 break-all">{baseUrl}/passport/{passport.publicQrUrl}</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(`${baseUrl}/passport/${passport.publicQrUrl}`)}>
                          <Copy className="h-4 w-4 mr-1" /> Copia link
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(`${baseUrl}/passport/${passport.publicQrUrl}`, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-1" /> Anteprima
                        </Button>
                        <Button size="sm" variant="outline" onClick={generateQR}>
                          <RefreshCw className="h-4 w-4 mr-1" /> Rigenera
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 italic flex items-start gap-1">
                      <Lock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      Sei tu a scegliere cosa mostrare. I dati sensibili restano nascosti di default.
                    </div>

                    {/* Visibility Settings */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Informazioni visibili nel QR</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(passport.publicVisibilitySettings || {}).map(([key, val]) => {
                          const labels = {
                            showPhoto: 'Foto', showName: 'Nome', showSpecies: 'Specie', showBreed: 'Razza',
                            showMicrochip: 'Microchip', showAllergies: 'Allergie', showMedications: 'Farmaci',
                            showChronicConditions: 'Patologie', showEmergencyContacts: 'Contatti', showClinic: 'Clinica',
                            showCity: 'Città', showBehavioralNotes: 'Note comportamentali',
                          };
                          return (
                            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer p-1.5 rounded hover:bg-gray-50">
                              <input type="checkbox" checked={val} className="rounded"
                                onChange={async (e) => {
                                  const newSettings = { ...passport.publicVisibilitySettings, [key]: e.target.checked };
                                  await api.put(`passport/${pet.id}`, { publicVisibilitySettings: newSettings }, token);
                                  await loadPassport();
                                }}
                              />
                              {labels[key] || key}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recent Scans */}
                    {recentScans?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Ultime scansioni</h4>
                        <div className="space-y-1">
                          {recentScans.slice(0, 5).map(s => (
                            <div key={s.id} className="flex items-center justify-between text-xs text-gray-500 p-1.5 bg-gray-50 rounded">
                              <span>{new Date(s.scannedAt).toLocaleString('it-IT')}</span>
                              <Badge variant="outline" className="text-xs">
                                {s.actionTaken === 'report_found' ? '🐾 Segnalazione' : '👁️ Visualizzazione'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-1">Genera un QR emergenza per rendere disponibili solo le informazioni essenziali in caso di smarrimento o urgenza.</p>
                    <Button className="mt-3 bg-coral-500 hover:bg-coral-600 text-white" onClick={generateQR} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <QrCode className="h-4 w-4 mr-1" />}
                      Genera QR Emergenza
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* VACCINI E TRATTAMENTI */}
        {/* ============================================================ */}
        <TabsContent value="vaccini">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Vaccini e Trattamenti</h3>
              <Button size="sm" onClick={() => { setShowModal('vaccination'); setModalData({ type: 'vaccino' }); }}>
                <Plus className="h-4 w-4 mr-1" /> Aggiungi
              </Button>
            </div>
            {vaccinations?.length > 0 ? vaccinations.map(v => (
              <Card key={v.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        v.status === 'in_regola' ? 'bg-green-100' : v.status === 'in_scadenza' ? 'bg-amber-100' : 'bg-red-100'
                      }`}>
                        <Syringe className={`h-4 w-4 ${
                          v.status === 'in_regola' ? 'text-green-600' : v.status === 'in_scadenza' ? 'text-amber-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{v.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(v.date).toLocaleDateString('it-IT')}
                          {v.nextDueDate && ` • Prossimo: ${new Date(v.nextDueDate).toLocaleDateString('it-IT')}`}
                        </p>
                        {v.veterinarian && <p className="text-xs text-gray-400">{v.veterinarian}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        v.status === 'in_regola' ? 'bg-green-100 text-green-700' :
                        v.status === 'in_scadenza' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {v.status === 'in_regola' ? 'In regola' : v.status === 'in_scadenza' ? 'In scadenza' : 'Scaduto'}
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400" onClick={() => deleteItem('vaccinations', v.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card><CardContent className="p-6 text-center text-gray-400 text-sm italic">
                Nessun vaccino registrato. Aggiungi i vaccini per tenere traccia delle scadenze e dei richiami.
              </CardContent></Card>
            )}
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* VIAGGI / TRAVEL PACK */}
        {/* ============================================================ */}
        <TabsContent value="viaggi">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Travel Pack</h3>
              <Button size="sm" onClick={() => { setShowModal('travelPack'); setModalData({}); }}>
                <Plus className="h-4 w-4 mr-1" /> Nuovo viaggio
              </Button>
            </div>
            {travelPacks?.length > 0 ? travelPacks.map(tp => (
              <Card key={tp.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm flex items-center gap-1">
                        <Plane className="h-4 w-4 text-sky-500" /> {tp.destination}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tp.startDate && new Date(tp.startDate).toLocaleDateString('it-IT')}
                        {tp.endDate && ` — ${new Date(tp.endDate).toLocaleDateString('it-IT')}`}
                        {tp.transportType && ` • ${tp.transportType}`}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400" onClick={() => deleteItem('travel-packs', tp.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {tp.checklist && (
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {Object.entries(tp.checklist).map(([key, done]) => {
                        const labels = {
                          vacciniVerificati: 'Vaccini verificati', microchipVerificato: 'Microchip verificato',
                          documentiCaricati: 'Documenti caricati', contattoEmergenzaAggiunto: 'Contatto emergenza',
                          alimentazioneAggiunta: 'Alimentazione', farmaciAggiunti: 'Farmaci',
                          accessoTemporaneoCondiviso: 'Accesso condiviso',
                        };
                        return (
                          <label key={key} className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <input type="checkbox" checked={done} className="rounded"
                              onChange={async () => {
                                const newChecklist = { ...tp.checklist, [key]: !done };
                                await api.put(`passport/travel-packs/${tp.id}`, { checklist: newChecklist }, token);
                                await loadPassport();
                              }}
                            />
                            <span className={done ? 'text-green-600' : 'text-gray-500'}>{labels[key] || key}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )) : (
              <Card><CardContent className="p-6 text-center text-gray-400 text-sm italic">
                Prepara documenti, vaccini, alimentazione e istruzioni utili prima di un viaggio o soggiorno in pensione.
              </CardContent></Card>
            )}
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* CONDIVISIONI */}
        {/* ============================================================ */}
        <TabsContent value="condivisioni">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Condivisioni temporanee</h3>
              <Button size="sm" onClick={() => { setShowModal('sharing'); setModalData({ recipientRole: 'pet_sitter' }); }}>
                <Plus className="h-4 w-4 mr-1" /> Nuova condivisione
              </Button>
            </div>
            {sharingLinks?.length > 0 ? sharingLinks.map(s => (
              <Card key={s.id} className={s.status !== 'active' ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{s.recipientName}</p>
                      <p className="text-xs text-gray-500">
                        {s.recipientRole} • Scade: {new Date(s.expiresAt).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        s.status === 'active' ? 'bg-green-100 text-green-700' :
                        s.status === 'revoked' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {s.status === 'active' ? 'Attiva' : s.status === 'revoked' ? 'Revocata' : 'Scaduta'}
                      </Badge>
                      {s.status === 'active' && (
                        <>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => copyToClipboard(`${baseUrl}/passport/shared/${s.accessToken}`)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400" onClick={() => revokeShare(s.id)}>
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card><CardContent className="p-6 text-center text-gray-400 text-sm italic">
                Condividi il Passport con pet sitter, familiari o pensioni per un periodo limitato e con permessi personalizzati.
              </CardContent></Card>
            )}
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* ASSICURAZIONE */}
        {/* ============================================================ */}
        <TabsContent value="assicurazione">
          <div className="space-y-4">
            {insurance ? (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-blue-500" /> Assicurazione pet</h3>
                    <Button size="sm" variant="outline" onClick={() => { setShowModal('insurance'); setModalData(insurance); }}>
                      <Edit className="h-3 w-3 mr-1" /> Modifica
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Compagnia:</span> <span className="font-medium">{insurance.providerName}</span></div>
                    <div><span className="text-gray-500">Polizza:</span> <span className="font-medium">{insurance.policyNumber || 'N/D'}</span></div>
                    <div><span className="text-gray-500">Inizio:</span> <span className="font-medium">{insurance.startDate ? new Date(insurance.startDate).toLocaleDateString('it-IT') : 'N/D'}</span></div>
                    <div><span className="text-gray-500">Scadenza:</span> <span className="font-medium">{insurance.endDate ? new Date(insurance.endDate).toLocaleDateString('it-IT') : 'N/D'}</span></div>
                  </div>
                  {insurance.coverageNotes && <p className="text-sm text-gray-600 mt-2">{insurance.coverageNotes}</p>}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-3">Nessuna assicurazione registrata.</p>
                  <Button size="sm" variant="outline" onClick={() => { setShowModal('insurance'); setModalData({}); }}>
                    <Plus className="h-4 w-4 mr-1" /> Aggiungi assicurazione
                  </Button>
                </CardContent>
              </Card>
            )}
            <Card className="border-dashed border-gray-300">
              <CardContent className="p-4 text-center text-gray-400 text-sm italic">
                🔜 Confronto assicurazioni — prossimamente
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* TIMELINE */}
        {/* ============================================================ */}
        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">Timeline salute</h3>
              {(() => {
                const events = [];
                vaccinations?.forEach(v => events.push({ date: v.date, type: 'vaccino', icon: '💉', text: `Vaccino: ${v.name}`, status: v.status }));
                documents?.forEach(d => events.push({ date: d.createdAt, type: 'documento', icon: '📄', text: `Documento: ${d.name || d.fileName || 'Senza nome'}` }));
                travelPacks?.forEach(t => events.push({ date: t.createdAt, type: 'viaggio', icon: '✈️', text: `Viaggio: ${t.destination}` }));
                sharingLinks?.forEach(s => events.push({ date: s.createdAt, type: 'condivisione', icon: '🔗', text: `Condivisione con ${s.recipientName}` }));
                recentScans?.forEach(s => events.push({ date: s.scannedAt, type: 'scansione', icon: '📱', text: s.actionTaken === 'report_found' ? 'Segnalazione ritrovamento' : 'Scansione QR' }));
                if (passport?.lostPetDate) events.push({ date: passport.lostPetDate, type: 'lost', icon: '🆘', text: 'Lost Pet Mode attivato' });
                events.sort((a, b) => new Date(b.date) - new Date(a.date));

                return events.length > 0 ? (
                  <div className="space-y-3">
                    {events.slice(0, 30).map((e, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="text-lg">{e.icon}</div>
                        <div className="flex-1">
                          <p className="text-gray-700">{e.text}</p>
                          <p className="text-xs text-gray-400">{new Date(e.date).toLocaleString('it-IT')}</p>
                        </div>
                        {e.status && (
                          <Badge variant="outline" className="text-xs">{e.status}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic text-center py-4">Nessun evento registrato.</p>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============================================================ */}
      {/* MODALS */}
      {/* ============================================================ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {showModal === 'emergencyContact' && '📞 Aggiungi contatto emergenza'}
                {showModal === 'vaccination' && '💉 Aggiungi vaccino/trattamento'}
                {showModal === 'travelPack' && '✈️ Nuovo Travel Pack'}
                {showModal === 'sharing' && '🔗 Nuova condivisione'}
                {showModal === 'insurance' && '🛡️ Assicurazione'}
                {showModal === 'lostPet' && '🆘 Lost Pet Mode'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(null)}><X className="h-4 w-4" /></Button>
            </div>

            <div className="space-y-3">
              {showModal === 'emergencyContact' && <>
                <Input placeholder="Nome *" value={modalData.name || ''} onChange={e => setModalData({...modalData, name: e.target.value})} />
                <Input placeholder="Relazione (es. Proprietario, Familiare)" value={modalData.relationship || ''} onChange={e => setModalData({...modalData, relationship: e.target.value})} />
                <Input placeholder="Telefono *" value={modalData.phone || ''} onChange={e => setModalData({...modalData, phone: e.target.value})} />
                <Input placeholder="Email" value={modalData.email || ''} onChange={e => setModalData({...modalData, email: e.target.value})} />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={modalData.visibleOnQr !== false} onChange={e => setModalData({...modalData, visibleOnQr: e.target.checked})} /> Visibile nel QR emergenza</label>
              </>}

              {showModal === 'vaccination' && <>
                <Input placeholder="Nome vaccino/trattamento *" value={modalData.name || ''} onChange={e => setModalData({...modalData, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-gray-500">Data *</label><Input type="date" value={modalData.date || ''} onChange={e => setModalData({...modalData, date: e.target.value})} /></div>
                  <div><label className="text-xs text-gray-500">Prossima scadenza</label><Input type="date" value={modalData.nextDueDate || ''} onChange={e => setModalData({...modalData, nextDueDate: e.target.value})} /></div>
                </div>
                <Input placeholder="Veterinario" value={modalData.veterinarian || ''} onChange={e => setModalData({...modalData, veterinarian: e.target.value})} />
                <Input placeholder="Lotto" value={modalData.batchNumber || ''} onChange={e => setModalData({...modalData, batchNumber: e.target.value})} />
                <select className="w-full border rounded-md p-2 text-sm" value={modalData.type || 'vaccino'} onChange={e => setModalData({...modalData, type: e.target.value})}>
                  <option value="vaccino">Vaccino</option>
                  <option value="antiparassitario">Antiparassitario</option>
                  <option value="trattamento">Trattamento</option>
                  <option value="visita_annuale">Visita annuale</option>
                  <option value="pulizia_dentale">Pulizia dentale</option>
                  <option value="prescrizione">Rinnovo prescrizione</option>
                </select>
              </>}

              {showModal === 'travelPack' && <>
                <Input placeholder="Destinazione *" value={modalData.destination || ''} onChange={e => setModalData({...modalData, destination: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-gray-500">Data partenza</label><Input type="date" value={modalData.startDate || ''} onChange={e => setModalData({...modalData, startDate: e.target.value})} /></div>
                  <div><label className="text-xs text-gray-500">Data ritorno</label><Input type="date" value={modalData.endDate || ''} onChange={e => setModalData({...modalData, endDate: e.target.value})} /></div>
                </div>
                <select className="w-full border rounded-md p-2 text-sm" value={modalData.transportType || ''} onChange={e => setModalData({...modalData, transportType: e.target.value})}>
                  <option value="">Mezzo di trasporto</option>
                  <option value="auto">Auto</option>
                  <option value="aereo">Aereo</option>
                  <option value="treno">Treno</option>
                  <option value="nave">Nave</option>
                  <option value="altro">Altro</option>
                </select>
                <Input placeholder="Struttura/Pensione" value={modalData.accommodation || ''} onChange={e => setModalData({...modalData, accommodation: e.target.value})} />
              </>}

              {showModal === 'sharing' && <>
                <Input placeholder="Nome destinatario *" value={modalData.recipientName || ''} onChange={e => setModalData({...modalData, recipientName: e.target.value})} />
                <Input placeholder="Email (opzionale)" value={modalData.recipientEmail || ''} onChange={e => setModalData({...modalData, recipientEmail: e.target.value})} />
                <select className="w-full border rounded-md p-2 text-sm" value={modalData.recipientRole || 'pet_sitter'} onChange={e => setModalData({...modalData, recipientRole: e.target.value})}>
                  <option value="pet_sitter">Pet sitter</option>
                  <option value="familiare">Familiare</option>
                  <option value="dog_walker">Dog walker</option>
                  <option value="pensione">Pensione</option>
                  <option value="toelettatore">Toelettatore</option>
                  <option value="trainer">Trainer</option>
                  <option value="altro">Altro</option>
                </select>
                <div><label className="text-xs text-gray-500">Scadenza condivisione</label><Input type="date" value={modalData.expiresAt?.split('T')[0] || ''} onChange={e => setModalData({...modalData, expiresAt: e.target.value + 'T23:59:59Z'})} /></div>
              </>}

              {showModal === 'insurance' && <>
                <Input placeholder="Compagnia assicurativa *" value={modalData.providerName || ''} onChange={e => setModalData({...modalData, providerName: e.target.value})} />
                <Input placeholder="Numero polizza" value={modalData.policyNumber || ''} onChange={e => setModalData({...modalData, policyNumber: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-gray-500">Inizio</label><Input type="date" value={modalData.startDate || ''} onChange={e => setModalData({...modalData, startDate: e.target.value})} /></div>
                  <div><label className="text-xs text-gray-500">Scadenza</label><Input type="date" value={modalData.endDate || ''} onChange={e => setModalData({...modalData, endDate: e.target.value})} /></div>
                </div>
                <Input placeholder="Note copertura" value={modalData.coverageNotes || ''} onChange={e => setModalData({...modalData, coverageNotes: e.target.value})} />
              </>}

              {showModal === 'lostPet' && <>
                <p className="text-sm text-red-600 font-medium">Attiva la modalità "Animale smarrito". La pagina QR mostrerà lo stato di smarrimento.</p>
                <Input placeholder="Zona smarrimento" value={modalData.lostPetZone || ''} onChange={e => setModalData({...modalData, lostPetZone: e.target.value})} />
                <Input placeholder="Messaggio pubblico" value={modalData.lostPetMessage || ''} onChange={e => setModalData({...modalData, lostPetMessage: e.target.value})} />
                <Input placeholder="Ricompensa (opzionale)" value={modalData.lostPetReward || ''} onChange={e => setModalData({...modalData, lostPetReward: e.target.value})} />
              </>}

              <Button className="w-full bg-coral-500 hover:bg-coral-600 text-white" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {showModal === 'lostPet' ? 'Attiva Lost Pet Mode' : 'Salva'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
