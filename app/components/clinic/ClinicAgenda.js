'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Calendar, CalendarDays, CheckCircle, ChevronLeft, ChevronRight, ClipboardList, Clock, Edit, FileText, Heart, Inbox, ListTodo, Mail, MessageCircle, Navigation, PawPrint, Plus, PlusCircle, Send, Shield, Star, Stethoscope, Syringe, Trash2, User, UserPlus, Video } from 'lucide-react';
import api from '@/app/lib/api';

function ClinicAgenda({ appointments, staff, owners, pets, onRefresh, onNavigate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shareDialog, setShareDialog] = useState(null);
  const [formData, setFormData] = useState({ 
    petId: '', petName: '', ownerId: '', ownerName: '', ownerEmail: '', date: '', time: '', 
    reason: '', type: 'visita', staffId: '', duration: 30, notes: '',
    showOwnerSuggestions: false, showPetSuggestions: false
  });

  // Appointment types with colors
  const appointmentTypes = [
    { value: 'visita', label: 'Visita generale', icon: Stethoscope, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'vaccino', label: 'Vaccino', icon: Syringe, color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'chirurgia', label: 'Chirurgia / Operazione', icon: Heart, color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'emergenza', label: 'Emergenza', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { value: 'controllo', label: 'Controllo / Follow-up', icon: CheckCircle, color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'sterilizzazione', label: 'Sterilizzazione', icon: Shield, color: 'bg-pink-100 text-pink-700 border-pink-200' },
    { value: 'dentale', label: 'Pulizia dentale', icon: Star, color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    { value: 'esami', label: 'Esami / Analisi', icon: FileText, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { value: 'videoconsulto', label: 'Video consulto', icon: Video, color: 'bg-teal-100 text-teal-700 border-teal-200' },
    { value: 'altro', label: 'Altro', icon: Calendar, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  ];

  const getTypeConfig = (type) => appointmentTypes.find(t => t.value === type) || appointmentTypes[appointmentTypes.length - 1];

  // Reset form
  const resetForm = () => {
    setFormData({ petId: '', petName: '', ownerId: '', ownerName: '', ownerEmail: '', date: '', time: '', reason: '', type: 'visita', staffId: '', duration: 30, notes: '', showOwnerSuggestions: false, showPetSuggestions: false });
    setEditingAppt(null);
  };

  // Open edit dialog
  const openEditDialog = (appt) => {
    setEditingAppt(appt);
    setFormData({
      petId: appt.petId || '',
      petName: appt.petName || '',
      ownerId: appt.ownerId || '',
      ownerName: appt.ownerName || '',
      ownerEmail: appt.ownerEmail || '',
      date: appt.date || '',
      time: appt.time || '',
      reason: appt.reason || '',
      type: appt.type || 'visita',
      staffId: appt.staffId || '',
      duration: appt.duration || 30,
      notes: appt.notes || '',
      showOwnerSuggestions: false,
      showPetSuggestions: false
    });
    setShowDialog(true);
  };

  // Create or update appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { 
      if (editingAppt) {
        await api.put(`appointments/${editingAppt.id}`, formData);
      } else {
        await api.post('appointments', formData); 
      }
      setShowDialog(false); 
      resetForm();
      onRefresh(); 
    } catch (error) { alert(error.message); }
  };

  // Delete appointment
  const handleDelete = async (apptId) => {
    if (!confirm('Sei sicuro di voler eliminare questo appuntamento?')) return;
    try {
      await api.delete(`appointments/${apptId}`);
      onRefresh();
    } catch (error) { alert(error.message); }
  };

  // Share appointment
  const handleShare = async (appt) => {
    const shareUrl = `${window.location.origin}?appointment=${appt.id}`;
    const shareText = `📅 Appuntamento vetbuddy\n\n🐾 ${appt.petName}\n📆 ${appt.date} ore ${appt.time}\n🏥 ${appt.type}\n\nDettagli: ${shareUrl}`;
    
    // Use share dialog directly (navigator.share doesn't work in iframes)
    setShareDialog({ appt, url: shareUrl, text: shareText });
  };

  // Send appointment via email
  const handleSendEmail = async (appt) => {
    if (!appt.ownerEmail) {
      alert('Email proprietario non specificata');
      return;
    }
    try {
      await api.post('appointments/send-email', { appointmentId: appt.id, recipientEmail: appt.ownerEmail });
      alert('✅ Email inviata con successo!');
    } catch (error) { alert(error.message); }
  };

  // Calendar helpers
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const upcomingAppts = appointments.filter(a => a.date > today).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  // Get week days
  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8:00 - 19:00

  const getApptsByDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(a => a.date === dateStr);
  };

  const navigateWeek = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (delta * 7));
    setCurrentDate(newDate);
  };

  const getStaffName = (staffId) => {
    const s = staff?.find(s => s.id === staffId);
    return s ? s.name : null;
  };

  const getStaffColor = (staffId) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
    const index = staff?.findIndex(s => s.id === staffId) || 0;
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
          <p className="text-gray-500 text-sm">Gestisci gli appuntamenti della clinica</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-sm rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-coral-600' : 'text-gray-600'}`}>
              <ListTodo className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 text-sm rounded-md transition ${viewMode === 'week' ? 'bg-white shadow text-coral-600' : 'text-gray-600'}`}>
              <CalendarDays className="h-4 w-4" />
            </button>
          </div>
          
          {/* New Appointment Button */}
          <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-coral-500 hover:bg-coral-600">
                <Plus className="h-4 w-4 mr-2" />Nuovo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAppt ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}</DialogTitle>
                <DialogDescription>Compila i dettagli dell'appuntamento</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Appointment Type */}
                <div>
                  <Label className="mb-2 block">Tipo di appuntamento</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {appointmentTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({...formData, type: type.value})}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition ${formData.type === type.value ? 'border-coral-500 bg-coral-50' : 'border-gray-200 hover:border-coral-300'}`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Owner Selection with Autocomplete */}
                <div className="relative">
                  <Label>Proprietario *</Label>
                  <div className="relative">
                    <Input 
                      value={formData.ownerName} 
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({...formData, ownerName: value, ownerId: '', ownerEmail: '', petId: '', petName: ''});
                      }}
                      onFocus={() => setFormData({...formData, showOwnerSuggestions: true})}
                      onBlur={() => setTimeout(() => setFormData(prev => ({...prev, showOwnerSuggestions: false})), 200)}
                      placeholder="Digita nome proprietario..." 
                      className="pr-10"
                      required 
                    />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {/* Suggestions dropdown */}
                  {formData.showOwnerSuggestions && formData.ownerName && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto">
                      {owners?.filter(o => 
                        o.role === 'owner' && 
                        (o.name?.toLowerCase().includes(formData.ownerName.toLowerCase()) ||
                         o.email?.toLowerCase().includes(formData.ownerName.toLowerCase()))
                      ).length > 0 ? (
                        <>
                          <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                            Proprietari registrati
                          </div>
                          {owners?.filter(o => 
                            o.role === 'owner' && 
                            (o.name?.toLowerCase().includes(formData.ownerName.toLowerCase()) ||
                             o.email?.toLowerCase().includes(formData.ownerName.toLowerCase()))
                          ).map(owner => (
                            <button
                              key={owner.id}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-coral-50 flex items-center gap-2 border-b last:border-b-0"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setFormData({
                                  ...formData, 
                                  ownerId: owner.id, 
                                  ownerName: owner.name, 
                                  ownerEmail: owner.email || '',
                                  petId: '',
                                  petName: '',
                                  showOwnerSuggestions: false
                                });
                              }}
                            >
                              <User className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="font-medium">{owner.name}</p>
                                <p className="text-xs text-gray-500">{owner.email}</p>
                              </div>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          <UserPlus className="h-4 w-4 inline mr-2" />
                          Nuovo proprietario: "{formData.ownerName}"
                        </div>
                      )}
                    </div>
                  )}
                  {/* Show email field for new owners */}
                  {formData.ownerName && !formData.ownerId && (
                    <div className="mt-2">
                      <Label className="text-xs text-gray-500">Email nuovo proprietario</Label>
                      <Input 
                        type="email" 
                        value={formData.ownerEmail} 
                        onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} 
                        placeholder="email@esempio.it (opzionale)" 
                        className="mt-1"
                      />
                    </div>
                  )}
                  {/* Show selected owner badge */}
                  {formData.ownerId && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <User className="h-3 w-3 mr-1" />
                        Proprietario registrato
                      </Badge>
                      <span className="text-xs text-gray-500">{formData.ownerEmail}</span>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, ownerId: '', ownerName: '', ownerEmail: '', petId: '', petName: ''})}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Cambia
                      </button>
                    </div>
                  )}
                </div>

                {/* Pet Selection with Autocomplete */}
                <div className="relative">
                  <Label>Animale *</Label>
                  <div className="relative">
                    <Input 
                      value={formData.petName} 
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({...formData, petName: value, petId: ''});
                      }}
                      onFocus={() => setFormData({...formData, showPetSuggestions: true})}
                      onBlur={() => setTimeout(() => setFormData(prev => ({...prev, showPetSuggestions: false})), 200)}
                      placeholder="Digita nome animale..." 
                      className="pr-10"
                      required 
                    />
                    <PawPrint className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {/* Pet suggestions dropdown */}
                  {formData.showPetSuggestions && formData.petName && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto">
                      {(() => {
                        // If owner is selected, show only their pets
                        const availablePets = formData.ownerId 
                          ? pets?.filter(p => p.ownerId === formData.ownerId && p.name?.toLowerCase().includes(formData.petName.toLowerCase()))
                          : pets?.filter(p => p.name?.toLowerCase().includes(formData.petName.toLowerCase()));
                        
                        if (availablePets?.length > 0) {
                          return (
                            <>
                              <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                                {formData.ownerId ? 'Pet di questo proprietario' : 'Pet registrati'}
                              </div>
                              {availablePets.map(pet => {
                                const petOwner = owners?.find(o => o.id === pet.ownerId);
                                return (
                                  <button
                                    key={pet.id}
                                    type="button"
                                    className="w-full px-3 py-2 text-left hover:bg-coral-50 flex items-center gap-2 border-b last:border-b-0"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      // If selecting a pet, also set the owner if not already set
                                      if (!formData.ownerId && petOwner) {
                                        setFormData({
                                          ...formData, 
                                          petId: pet.id, 
                                          petName: pet.name,
                                          ownerId: petOwner.id,
                                          ownerName: petOwner.name,
                                          ownerEmail: petOwner.email || '',
                                          showPetSuggestions: false
                                        });
                                      } else {
                                        setFormData({
                                          ...formData, 
                                          petId: pet.id, 
                                          petName: pet.name,
                                          showPetSuggestions: false
                                        });
                                      }
                                    }}
                                  >
                                    <PawPrint className="h-4 w-4 text-coral-500" />
                                    <div>
                                      <p className="font-medium">{pet.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {pet.species} {pet.breed && `• ${pet.breed}`}
                                        {!formData.ownerId && petOwner && ` • ${petOwner.name}`}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </>
                          );
                        } else {
                          return (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              <PlusCircle className="h-4 w-4 inline mr-2" />
                              Nuovo animale: "{formData.petName}"
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                  {/* Show selected pet badge */}
                  {formData.petId && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="bg-coral-50 text-coral-700 border-coral-200">
                        <PawPrint className="h-3 w-3 mr-1" />
                        Pet registrato
                      </Badge>
                      {(() => {
                        const pet = pets?.find(p => p.id === formData.petId);
                        return pet && <span className="text-xs text-gray-500">{pet.species} - {pet.breed}</span>;
                      })()}
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, petId: '', petName: ''})}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Cambia
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Date & Time */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Data *</Label>
                    <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Ora *</Label>
                    <Input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Durata</Label>
                    <Select value={formData.duration.toString()} onValueChange={(v) => setFormData({...formData, duration: parseInt(v)})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">1 ora</SelectItem>
                        <SelectItem value="90">1h 30min</SelectItem>
                        <SelectItem value="120">2 ore</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Staff Assignment */}
                <div>
                  <Label>Assegnato a (veterinario/staff)</Label>
                  <Select value={formData.staffId || 'none'} onValueChange={(v) => setFormData({...formData, staffId: v === 'none' ? '' : v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona chi prende l'appuntamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Non assegnato</SelectItem>
                      {staff?.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${getStaffColor(s.id)}`} />
                            {s.name} ({s.role === 'vet' ? 'Veterinario' : s.role})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {staff?.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">💡 Aggiungi membri dello staff in "Staff" per assegnarli agli appuntamenti</p>
                  )}
                </div>
                
                {/* Reason & Notes */}
                <div>
                  <Label>Motivo/Descrizione</Label>
                  <Input value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} placeholder="Es: Controllo post-operatorio" />
                </div>
                
                <div>
                  <Label>Note interne</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} placeholder="Note visibili solo alla clinica..." />
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {editingAppt && (
                    <Button type="button" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { handleDelete(editingAppt.id); setShowDialog(false); }}>
                      <Trash2 className="h-4 w-4 mr-1" />Elimina
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 bg-coral-500 hover:bg-coral-600">
                    {editingAppt ? 'Salva modifiche' : 'Crea appuntamento'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Week Navigation (only for week view) */}
      {viewMode === 'week' && (
        <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />Settimana precedente
          </Button>
          <div className="text-center">
            <p className="font-semibold">
              {weekDays[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <Button variant="link" size="sm" className="text-coral-600" onClick={() => setCurrentDate(new Date())}>
              Oggi
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(1)}>
            Settimana successiva<ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Week Calendar View */}
      {viewMode === 'week' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-8 border-b bg-gray-50">
                  <div className="p-3 text-sm font-medium text-gray-500 border-r">Ora</div>
                  {weekDays.map((day, i) => {
                    const isToday = day.toISOString().split('T')[0] === today;
                    const dayAppts = getApptsByDate(day);
                    return (
                      <div key={i} className={`p-3 text-center border-r last:border-r-0 ${isToday ? 'bg-coral-50' : ''}`}>
                        <p className="text-xs text-gray-500">{dayNames[i]}</p>
                        <p className={`font-semibold ${isToday ? 'text-coral-600' : 'text-gray-900'}`}>
                          {day.getDate()}
                        </p>
                        {dayAppts.length > 0 && (
                          <Badge variant="secondary" className="text-xs mt-1">{dayAppts.length}</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Time slots */}
                {hours.map(hour => (
                  <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
                    <div className="p-2 text-sm text-gray-500 border-r bg-gray-50">
                      {hour}:00
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const dateStr = day.toISOString().split('T')[0];
                      const hourAppts = appointments.filter(a => {
                        if (a.date !== dateStr) return false;
                        const apptHour = parseInt(a.time?.split(':')[0]);
                        return apptHour === hour;
                      });
                      const isToday = dateStr === today;
                      
                      return (
                        <div key={dayIndex} className={`p-1 border-r last:border-r-0 min-h-[60px] ${isToday ? 'bg-coral-50/30' : ''}`}>
                          {hourAppts.map((appt, i) => {
                            const typeConfig = getTypeConfig(appt.type);
                            const staffName = getStaffName(appt.staffId);
                            return (
                              <div
                                key={i}
                                onClick={() => openEditDialog(appt)}
                                className={`p-1.5 rounded text-xs cursor-pointer mb-1 border ${typeConfig.color} hover:opacity-80 transition`}
                              >
                                <div className="flex items-center gap-1">
                                  {appt.staffId && <div className={`h-2 w-2 rounded-full ${getStaffColor(appt.staffId)}`} />}
                                  <span className="font-medium truncate">{appt.time}</span>
                                </div>
                                <p className="font-medium truncate">{appt.petName}</p>
                                {staffName && <p className="text-[10px] opacity-70 truncate">{staffName}</p>}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4 text-coral-600" />
                Oggi <Badge variant="outline">{todayAppts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppts.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">Nessun appuntamento oggi</p>
              ) : (
                <div className="space-y-2">
                  {todayAppts.map((appt, i) => {
                    const typeConfig = getTypeConfig(appt.type);
                    const TypeIcon = typeConfig.icon;
                    const staffName = getStaffName(appt.staffId);
                    return (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${typeConfig.color}`}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{appt.petName}</p>
                            <p className="text-xs opacity-70">{appt.ownerName} • {typeConfig.label}</p>
                            {staffName && (
                              <p className="text-xs mt-0.5 flex items-center gap-1">
                                <div className={`h-2 w-2 rounded-full ${getStaffColor(appt.staffId)}`} />
                                {staffName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/80 text-gray-700">{appt.time}</Badge>
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(appt)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleShare(appt)}>
                            <Send className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Prossimi</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppts.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">Nessun appuntamento programmato</p>
              ) : (
                <div className="space-y-2">
                  {upcomingAppts.slice(0, 10).map((appt, i) => {
                    const typeConfig = getTypeConfig(appt.type);
                    const TypeIcon = typeConfig.icon;
                    const staffName = getStaffName(appt.staffId);
                    return (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${typeConfig.color}`}>
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{appt.petName}</p>
                            <p className="text-xs text-gray-500">{appt.ownerName}</p>
                            {staffName && (
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <div className={`h-2 w-2 rounded-full ${getStaffColor(appt.staffId)}`} />
                                {staffName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-medium">{new Date(appt.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}</p>
                            <p className="text-xs text-gray-500">{appt.time}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditDialog(appt)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleShare(appt)}>
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={!!shareDialog} onOpenChange={() => setShareDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Condividi appuntamento</DialogTitle>
            <DialogDescription>Invia i dettagli dell'appuntamento al proprietario</DialogDescription>
          </DialogHeader>
          {shareDialog && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{shareDialog.appt.petName}</p>
                <p className="text-sm text-gray-600">{shareDialog.appt.date} ore {shareDialog.appt.time}</p>
                <p className="text-sm text-gray-600">{getTypeConfig(shareDialog.appt.type).label}</p>
              </div>
              
              <div className="grid gap-3">
                <Button onClick={() => { navigator.clipboard.writeText(shareDialog.text); alert('Copiato!'); }} variant="outline" className="justify-start">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Copia testo
                </Button>
                {shareDialog.appt.ownerEmail && (
                  <Button onClick={() => { handleSendEmail(shareDialog.appt); setShareDialog(null); }} className="bg-coral-500 hover:bg-coral-600 justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Invia via email a {shareDialog.appt.ownerEmail}
                  </Button>
                )}
                <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareDialog.text)}`, '_blank')} variant="outline" className="justify-start bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Invia via WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Clinic Inbox

export default ClinicAgenda;
