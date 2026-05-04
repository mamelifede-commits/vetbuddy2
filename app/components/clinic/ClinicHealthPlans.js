'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, Plus, Check, CheckCircle, Trash2, Edit, PawPrint, 
  Calendar, Users, Loader2, ClipboardList, Syringe, Stethoscope, 
  Shield, Activity, Clock, ChevronRight, AlertCircle, BarChart3
} from 'lucide-react';
import api from '@/app/lib/api';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

// Predefined plan templates
const PLAN_TEMPLATES = [
  {
    name: 'Piano Cucciolo',
    description: 'Programma completo per cuccioli 0-12 mesi: vaccinazioni, sverminazioni e visite di controllo.',
    targetGroup: 'cucciolo',
    durationMonths: 12,
    services: [
      { name: 'Prima visita cucciolo', type: 'visita', monthOffset: 0, description: 'Visita generale + piano vaccinale' },
      { name: 'Vaccino polivalente (1° dose)', type: 'vaccino', monthOffset: 1, description: 'Cimurro, Parvovirosi, Epatite' },
      { name: 'Sverminazione', type: 'trattamento', monthOffset: 1, description: 'Trattamento antiparassitario intestinale' },
      { name: 'Vaccino polivalente (2° dose)', type: 'vaccino', monthOffset: 2, description: 'Richiamo vaccinale' },
      { name: 'Vaccino antirabbica', type: 'vaccino', monthOffset: 3, description: 'Obbligatorio per viaggi' },
      { name: 'Visita di controllo 6 mesi', type: 'visita', monthOffset: 6, description: 'Controllo peso, sviluppo, dentizione' },
      { name: 'Sterilizzazione (consigliata)', type: 'chirurgia', monthOffset: 7, description: 'Valutazione e pianificazione' },
      { name: 'Visita annuale + richiamo', type: 'visita', monthOffset: 12, description: 'Bilancio salute primo anno' },
    ]
  },
  {
    name: 'Piano Senior',
    description: 'Monitoraggio avanzato per animali over 7 anni: esami sangue, ecografia e visite semestrali.',
    targetGroup: 'senior',
    durationMonths: 12,
    services: [
      { name: 'Check-up completo', type: 'visita', monthOffset: 0, description: 'Visita approfondita + peso + cuore' },
      { name: 'Esami sangue completi', type: 'esame', monthOffset: 0, description: 'Emocromo, biochimico, tiroide' },
      { name: 'Ecografia addominale', type: 'esame', monthOffset: 1, description: 'Screening organi interni' },
      { name: 'Controllo semestrale', type: 'visita', monthOffset: 6, description: 'Visita + peso + mobilità' },
      { name: 'Esami sangue controllo', type: 'esame', monthOffset: 6, description: 'Monitoraggio valori' },
      { name: 'Pulizia dentale', type: 'trattamento', monthOffset: 8, description: 'Igiene orale sotto sedazione' },
      { name: 'Visita annuale completa', type: 'visita', monthOffset: 12, description: 'Bilancio annuale' },
    ]
  },
  {
    name: 'Piano Prevenzione Annuale',
    description: 'Pacchetto prevenzione base per animali adulti: visita, vaccino e antiparassitario.',
    targetGroup: 'adulto',
    durationMonths: 12,
    services: [
      { name: 'Visita annuale', type: 'visita', monthOffset: 0, description: 'Controllo generale + peso' },
      { name: 'Vaccino richiamo annuale', type: 'vaccino', monthOffset: 0, description: 'Polivalente' },
      { name: 'Esame feci', type: 'esame', monthOffset: 1, description: 'Parassitologia' },
      { name: 'Antiparassitario', type: 'trattamento', monthOffset: 3, description: 'Trattamento stagionale' },
      { name: 'Antiparassitario', type: 'trattamento', monthOffset: 6, description: 'Trattamento stagionale' },
      { name: 'Controllo semestrale', type: 'visita', monthOffset: 6, description: 'Visita rapida' },
    ]
  }
];

const SERVICE_TYPES = [
  { value: 'visita', label: 'Visita', icon: Stethoscope, color: 'text-blue-500 bg-blue-50' },
  { value: 'vaccino', label: 'Vaccino', icon: Syringe, color: 'text-purple-500 bg-purple-50' },
  { value: 'esame', label: 'Esame', icon: Activity, color: 'text-green-500 bg-green-50' },
  { value: 'trattamento', label: 'Trattamento', icon: Shield, color: 'text-amber-500 bg-amber-50' },
  { value: 'chirurgia', label: 'Chirurgia', icon: Heart, color: 'text-red-500 bg-red-50' },
];

const TARGET_GROUPS = [
  { value: 'cucciolo', label: '🐾 Cucciolo (0-12 mesi)' },
  { value: 'adulto', label: '🐕 Adulto (1-7 anni)' },
  { value: 'senior', label: '👴 Senior (7+ anni)' },
  { value: 'tutti', label: '📋 Tutti' },
];

function ClinicHealthPlans({ user, pets = [], owners = [], onNavigate }) {
  const [plans, setPlans] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview'); // overview, plans, assignments
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  // Form states
  const [planForm, setPlanForm] = useState({
    name: '', description: '', targetGroup: 'tutti', durationMonths: 12, services: [], price: ''
  });
  const [assignForm, setAssignForm] = useState({ planId: '', petId: '', notes: '' });
  const [saving, setSaving] = useState(false);
  
  // New service form
  const [newService, setNewService] = useState({ name: '', type: 'visita', monthOffset: 0, description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, assignRes, statsRes] = await Promise.all([
        api.get('health-plans'),
        api.get('health-plans/assignments'),
        api.get('health-plans/stats')
      ]);
      if (plansRes.success) setPlans(plansRes.plans || []);
      if (assignRes.success) setAssignments(assignRes.assignments || []);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      console.error('Error loading health plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!planForm.name || planForm.services.length === 0) {
      alert('Inserisci nome e almeno un servizio');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...planForm,
        price: planForm.price ? parseFloat(planForm.price) : 0,
        durationMonths: parseInt(planForm.durationMonths)
      };
      
      if (editingPlan) {
        await api.put(`health-plans/${editingPlan.id}`, payload);
      } else {
        await api.post('health-plans', payload);
      }
      
      setShowCreateDialog(false);
      setPlanForm({ name: '', description: '', targetGroup: 'tutti', durationMonths: 12, services: [], price: '' });
      setEditingPlan(null);
      loadData();
    } catch (err) {
      alert('Errore nel salvataggio: ' + (err.message || 'Riprova'));
    } finally {
      setSaving(false);
    }
  };

  const handleAssignPlan = async () => {
    if (!assignForm.planId || !assignForm.petId) {
      alert('Seleziona piano e paziente');
      return;
    }
    setSaving(true);
    try {
      const pet = pets.find(p => p.id === assignForm.petId);
      await api.post('health-plans/assign', {
        ...assignForm,
        ownerId: pet?.ownerId || '',
        startDate: new Date().toISOString()
      });
      setShowAssignDialog(false);
      setAssignForm({ planId: '', petId: '', notes: '' });
      loadData();
    } catch (err) {
      alert('Errore nell\'assegnazione: ' + (err.message || 'Riprova'));
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteService = async (assignmentId, serviceIndex) => {
    try {
      await api.post('health-plans/complete-service', { assignmentId, serviceIndex });
      loadData();
    } catch (err) {
      alert('Errore: ' + (err.message || 'Riprova'));
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm('Disattivare questo piano? Le assegnazioni attive resteranno valide.')) return;
    try {
      await api.delete(`health-plans/${planId}`);
      loadData();
    } catch (err) {
      alert('Errore: ' + (err.message || 'Riprova'));
    }
  };

  const handleUseTemplate = (template) => {
    setPlanForm({
      name: template.name,
      description: template.description,
      targetGroup: template.targetGroup,
      durationMonths: template.durationMonths,
      services: template.services,
      price: ''
    });
    setShowCreateDialog(true);
  };

  const addServiceToForm = () => {
    if (!newService.name) return;
    setPlanForm(prev => ({
      ...prev,
      services: [...prev.services, { ...newService, monthOffset: parseInt(newService.monthOffset) || 0 }]
    }));
    setNewService({ name: '', type: 'visita', monthOffset: 0, description: '' });
  };

  const removeServiceFromForm = (idx) => {
    setPlanForm(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== idx)
    }));
  };

  const getServiceTypeInfo = (type) => SERVICE_TYPES.find(t => t.value === type) || SERVICE_TYPES[0];
  const getPetName = (petId) => pets.find(p => p.id === petId)?.name || 'Pet sconosciuto';
  const getOwnerName = (ownerId) => owners.find(o => o.id === ownerId)?.name || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-coral-500" />
        <span className="ml-3 text-gray-500">Caricamento Piani Salute...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-coral-500" /> Piani Salute
          </h2>
          <p className="text-gray-500 text-sm">Crea e gestisci programmi di prevenzione per i tuoi pazienti</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAssignDialog(true)} disabled={plans.length === 0}>
            <PawPrint className="h-4 w-4 mr-1" /> Assegna Piano
          </Button>
          <Button size="sm" className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setEditingPlan(null); setPlanForm({ name: '', description: '', targetGroup: 'tutti', durationMonths: 12, services: [], price: '' }); setShowCreateDialog(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Nuovo Piano
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-coral-100">
            <CardContent className="p-4 text-center">
              <ClipboardList className="h-6 w-6 text-coral-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalPlans}</p>
              <p className="text-xs text-gray-500">Piani attivi</p>
            </CardContent>
          </Card>
          <Card className="border-blue-100">
            <CardContent className="p-4 text-center">
              <PawPrint className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
              <p className="text-xs text-gray-500">Pazienti iscritti</p>
            </CardContent>
          </Card>
          <Card className="border-green-100">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.completedAssignments}</p>
              <p className="text-xs text-gray-500">Piani completati</p>
            </CardContent>
          </Card>
          <Card className="border-amber-100">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingServices}</p>
              <p className="text-xs text-gray-500">Servizi prossimi 30gg</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { id: 'overview', label: 'Panoramica', icon: BarChart3 },
          { id: 'plans', label: 'Piani', icon: ClipboardList },
          { id: 'assignments', label: 'Assegnazioni', icon: PawPrint },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${activeSection === tab.id ? 'bg-coral-100 text-coral-700' : 'text-gray-500 hover:bg-gray-100'}`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW SECTION */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Quick Templates */}
          {plans.length === 0 && (
            <Card className="border-dashed border-2 border-coral-200 bg-coral-50/30">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-coral-500" /> Inizia con un template
                </h3>
                <p className="text-sm text-gray-500 mb-4">Usa uno dei nostri piani predefiniti come punto di partenza. Potrai personalizzarli in seguito.</p>
                <div className="grid md:grid-cols-3 gap-3">
                  {PLAN_TEMPLATES.map((template, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition cursor-pointer" onClick={() => handleUseTemplate(template)}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-coral-100 text-coral-700 text-xs">{TARGET_GROUPS.find(g => g.value === template.targetGroup)?.label || template.targetGroup}</Badge>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{template.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" /> {template.durationMonths} mesi • {template.services.length} servizi
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active assignments with progress */}
          {assignments.filter(a => a.status === 'active').length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" /> Piani in corso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignments.filter(a => a.status === 'active').slice(0, 5).map(assignment => {
                  const plan = plans.find(p => p.id === assignment.planId);
                  const totalServices = plan?.services?.length || 0;
                  const completedCount = assignment.completedServices?.length || 0;
                  const progress = totalServices > 0 ? Math.round((completedCount / totalServices) * 100) : 0;
                  
                  return (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer" onClick={() => { setSelectedAssignment(assignment); setShowCompleteDialog(true); }}>
                      <div className="flex items-center gap-3">
                        <PawPrint className="h-5 w-5 text-coral-400" />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{getPetName(assignment.petId)}</p>
                          <p className="text-xs text-gray-500">{assignment.planName || plan?.name || 'Piano'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-coral-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">{completedCount}/{totalServices}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {plans.length > 0 && assignments.length === 0 && (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-700 mb-1">Nessun piano assegnato</h3>
                <p className="text-sm text-gray-500 mb-4">Hai {plans.length} piani creati. Assegnane uno a un paziente per iniziare il tracking.</p>
                <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => setShowAssignDialog(true)}>
                  <PawPrint className="h-4 w-4 mr-1" /> Assegna Piano
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* PLANS SECTION */}
      {activeSection === 'plans' && (
        <div className="space-y-4">
          {plans.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-700 mb-1">Nessun piano creato</h3>
                <p className="text-sm text-gray-500 mb-4">Crea il tuo primo piano salute o usa un template.</p>
                <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Crea Piano
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {plans.map(plan => {
                const assignedCount = assignments.filter(a => a.planId === plan.id && a.status === 'active').length;
                return (
                  <Card key={plan.id} className="hover:shadow-md transition">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{plan.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingPlan(plan); setPlanForm({ name: plan.name, description: plan.description, targetGroup: plan.targetGroup, durationMonths: plan.durationMonths, services: plan.services, price: plan.price?.toString() || '' }); setShowCreateDialog(true); }} className="p-1.5 text-gray-400 hover:text-blue-500 transition">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeletePlan(plan.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">{TARGET_GROUPS.find(g => g.value === plan.targetGroup)?.label || plan.targetGroup}</Badge>
                        <Badge variant="outline" className="text-xs"><Calendar className="h-3 w-3 mr-1" />{plan.durationMonths} mesi</Badge>
                        {plan.price > 0 && <Badge variant="outline" className="text-xs text-green-600">€{plan.price}</Badge>}
                      </div>

                      <div className="space-y-1.5">
                        {plan.services.slice(0, 4).map((service, idx) => {
                          const typeInfo = getServiceTypeInfo(service.type);
                          return (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <div className={`p-1 rounded ${typeInfo.color}`}>
                                <typeInfo.icon className="h-3 w-3" />
                              </div>
                              <span className="text-gray-700">{service.name}</span>
                              <span className="text-gray-400 ml-auto">mese {service.monthOffset}</span>
                            </div>
                          );
                        })}
                        {plan.services.length > 4 && (
                          <p className="text-xs text-gray-400 pl-7">+ altri {plan.services.length - 4} servizi</p>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-xs text-gray-500"><Users className="h-3 w-3 inline mr-1" />{assignedCount} pazienti iscritti</span>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => { setAssignForm({ planId: plan.id, petId: '', notes: '' }); setShowAssignDialog(true); }}>
                          Assegna
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ASSIGNMENTS SECTION */}
      {activeSection === 'assignments' && (
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-700 mb-1">Nessuna assegnazione</h3>
                <p className="text-sm text-gray-500">Assegna un piano a un paziente per iniziare.</p>
              </CardContent>
            </Card>
          ) : (
            assignments.map(assignment => {
              const plan = plans.find(p => p.id === assignment.planId);
              const totalServices = plan?.services?.length || 0;
              const completedCount = assignment.completedServices?.length || 0;
              const progress = totalServices > 0 ? Math.round((completedCount / totalServices) * 100) : 0;

              return (
                <Card key={assignment.id} className={`hover:shadow-md transition ${assignment.status === 'completed' ? 'border-green-200 bg-green-50/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <PawPrint className="h-5 w-5 text-coral-400" />
                        <div>
                          <p className="font-bold text-gray-900">{getPetName(assignment.petId)}</p>
                          <p className="text-xs text-gray-500">{assignment.planName || plan?.name} • Iniziato: {new Date(assignment.startDate).toLocaleDateString('it-IT')}</p>
                        </div>
                      </div>
                      <Badge className={assignment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                        {assignment.status === 'completed' ? '✓ Completato' : 'In corso'}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full transition-all ${assignment.status === 'completed' ? 'bg-green-500' : 'bg-coral-500'}`} style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{progress}%</span>
                    </div>

                    {/* Services list */}
                    {plan && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {plan.services.map((service, idx) => {
                          const isCompleted = (assignment.completedServices || []).some(cs => cs.serviceIndex === idx);
                          const typeInfo = getServiceTypeInfo(service.type);
                          return (
                            <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${isCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}>
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <button onClick={() => handleCompleteService(assignment.id, idx)} className="p-0.5 rounded border border-gray-300 hover:border-coral-400 hover:bg-coral-50 transition flex-shrink-0">
                                  <Check className="h-3 w-3 text-gray-400" />
                                </button>
                              )}
                              <span className={`${isCompleted ? 'text-green-700 line-through' : 'text-gray-700'}`}>{service.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* CREATE/EDIT PLAN DIALOG */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Modifica Piano' : 'Crea Nuovo Piano Salute'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome piano *</Label>
                <Input value={planForm.name} onChange={e => setPlanForm(f => ({...f, name: e.target.value}))} placeholder="Es. Piano Cucciolo" className="mt-1" />
              </div>
              <div>
                <Label>Gruppo target</Label>
                <Select value={planForm.targetGroup} onValueChange={v => setPlanForm(f => ({...f, targetGroup: v}))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TARGET_GROUPS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descrizione</Label>
              <Textarea value={planForm.description} onChange={e => setPlanForm(f => ({...f, description: e.target.value}))} placeholder="Descrivi il piano..." rows={2} className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Durata (mesi)</Label>
                <Input type="number" value={planForm.durationMonths} onChange={e => setPlanForm(f => ({...f, durationMonths: e.target.value}))} className="mt-1" />
              </div>
              <div>
                <Label>Prezzo (€, opzionale)</Label>
                <Input type="number" value={planForm.price} onChange={e => setPlanForm(f => ({...f, price: e.target.value}))} placeholder="0" className="mt-1" />
              </div>
            </div>

            {/* Services */}
            <div>
              <Label className="flex items-center justify-between">
                <span>Servizi inclusi ({planForm.services.length})</span>
              </Label>
              
              {planForm.services.length > 0 && (
                <div className="space-y-2 mt-2 mb-3 max-h-48 overflow-y-auto">
                  {planForm.services.map((service, idx) => {
                    const typeInfo = getServiceTypeInfo(service.type);
                    return (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className={`p-1 rounded ${typeInfo.color}`}>
                          <typeInfo.icon className="h-3 w-3" />
                        </div>
                        <span className="text-sm text-gray-700 flex-1">{service.name}</span>
                        <span className="text-xs text-gray-400">mese {service.monthOffset}</span>
                        <button onClick={() => removeServiceFromForm(idx)} className="p-1 text-red-400 hover:text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add service form */}
              <div className="bg-gray-50 rounded-lg p-3 mt-2">
                <p className="text-xs font-medium text-gray-600 mb-2">Aggiungi servizio:</p>
                <div className="grid grid-cols-4 gap-2">
                  <Input value={newService.name} onChange={e => setNewService(s => ({...s, name: e.target.value}))} placeholder="Nome servizio" className="col-span-2 text-sm" />
                  <Select value={newService.type} onValueChange={v => setNewService(s => ({...s, type: v}))}>
                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Input type="number" value={newService.monthOffset} onChange={e => setNewService(s => ({...s, monthOffset: e.target.value}))} placeholder="Mese" className="text-sm w-16" />
                    <Button size="sm" variant="outline" onClick={addServiceToForm} disabled={!newService.name}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Annulla</Button>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={handleCreatePlan} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                {editingPlan ? 'Salva Modifiche' : 'Crea Piano'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ASSIGN PLAN DIALOG */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assegna Piano Salute</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Piano *</Label>
              <Select value={assignForm.planId} onValueChange={v => setAssignForm(f => ({...f, planId: v}))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seleziona piano" /></SelectTrigger>
                <SelectContent>
                  {plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.durationMonths} mesi)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Paziente *</Label>
              <Select value={assignForm.petId} onValueChange={v => setAssignForm(f => ({...f, petId: v}))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seleziona paziente" /></SelectTrigger>
                <SelectContent>
                  {pets.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.species === 'dog' ? '🐕' : p.species === 'cat' ? '🐈' : '🐾'} {p.breed || ''})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Note (opzionale)</Label>
              <Textarea value={assignForm.notes} onChange={e => setAssignForm(f => ({...f, notes: e.target.value}))} placeholder="Note aggiuntive..." rows={2} className="mt-1" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Annulla</Button>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={handleAssignPlan} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Assegna Piano
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* COMPLETE SERVICE DIALOG (assignment detail) */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dettaglio Piano — {selectedAssignment && getPetName(selectedAssignment.petId)}</DialogTitle>
          </DialogHeader>
          
          {selectedAssignment && (() => {
            const plan = plans.find(p => p.id === selectedAssignment.planId);
            if (!plan) return <p className="text-gray-500">Piano non trovato</p>;
            
            return (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-sm">{plan.name}</p>
                  <p className="text-xs text-gray-500">Inizio: {new Date(selectedAssignment.startDate).toLocaleDateString('it-IT')}</p>
                </div>
                
                {plan.services.map((service, idx) => {
                  const isCompleted = (selectedAssignment.completedServices || []).some(cs => cs.serviceIndex === idx);
                  const typeInfo = getServiceTypeInfo(service.type);
                  const startDate = new Date(selectedAssignment.startDate);
                  const serviceDate = new Date(startDate.getTime() + (service.monthOffset || 0) * 30 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <button onClick={() => { handleCompleteService(selectedAssignment.id, idx); setSelectedAssignment(prev => ({...prev, completedServices: [...(prev.completedServices||[]), {serviceIndex: idx}]})); }} className="h-5 w-5 rounded border-2 border-gray-300 hover:border-coral-400 flex items-center justify-center transition flex-shrink-0">
                          <Check className="h-3 w-3 text-transparent hover:text-coral-400" />
                        </button>
                      )}
                      <div className={`p-1.5 rounded ${typeInfo.color}`}>
                        <typeInfo.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isCompleted ? 'text-green-700 line-through' : 'text-gray-900'}`}>{service.name}</p>
                        <p className="text-xs text-gray-500">{service.description}</p>
                      </div>
                      <span className="text-xs text-gray-400">{serviceDate.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' })}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClinicHealthPlans;
