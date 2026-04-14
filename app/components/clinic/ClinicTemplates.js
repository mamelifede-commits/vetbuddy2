'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Calendar, ClipboardList, Edit, Eye, FileText, Info, Mail, MessageCircle, PawPrint, Plus, Trash2, User, Zap } from 'lucide-react';

function ClinicTemplates({ owners = [], pets = [], staff = [], appointments = [], user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('tutti');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showUseDialog, setShowUseDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [useFormData, setUseFormData] = useState({ ownerId: '', petId: '', appointmentId: '', customData: {} });
  
  const [templates, setTemplates] = useState([
    { 
      id: 1, 
      name: 'Conferma Appuntamento', 
      type: 'messaggio', 
      content: 'Gentile {{nome_cliente}}, confermiamo il suo appuntamento per {{nome_pet}} il {{data}} alle {{ora}} presso {{nome_clinica}}.',
      icon: 'message'
    },
    { 
      id: 2, 
      name: 'Reminder 24h', 
      type: 'reminder', 
      content: 'Promemoria: domani {{data}} alle {{ora}} ha un appuntamento per {{nome_pet}}. Per disdire, risponda a questo messaggio.',
      icon: 'bell'
    },
    { 
      id: 3, 
      name: 'Reminder 1h', 
      type: 'reminder', 
      content: 'Tra 1 ora: appuntamento per {{nome_pet}} alle {{ora}}. Vi aspettiamo!',
      icon: 'bell'
    },
    { 
      id: 4, 
      name: 'Prescrizione Pronta', 
      type: 'messaggio', 
      content: 'Gentile {{nome_cliente}}, la prescrizione per {{nome_pet}} è pronta. Può ritirarla in clinica o richiederla via email.',
      icon: 'message'
    },
    { 
      id: 5, 
      name: 'Follow-up Post Visita', 
      type: 'email', 
      content: 'Gentile {{nome_cliente}},\n\nGrazie per aver scelto {{nome_clinica}} per la cura di {{nome_pet}}.\n\nDi seguito il riepilogo della visita del {{data}}:\n{{riepilogo_visita}}\n\nPer qualsiasi domanda, non esiti a contattarci.\n\nCordiali saluti,\n{{nome_clinica}}',
      icon: 'email'
    },
    { 
      id: 6, 
      name: 'Referto Pronto', 
      type: 'messaggio', 
      content: 'Gentile {{nome_cliente}}, il referto di {{nome_pet}} relativo a {{servizio}} del {{data}} è pronto. Può visualizzarlo nella sezione Documenti dell\'app o richiederlo via email a {{email_clinica}}. Per qualsiasi chiarimento, il Dr. {{nome_medico}} è a disposizione.',
      icon: 'document'
    },
    { 
      id: 7, 
      name: 'Promemoria Vaccinazione', 
      type: 'reminder', 
      content: 'Gentile {{nome_cliente}}, è il momento di vaccinare {{nome_pet}}! 💉\n\nIl richiamo del vaccino è previsto per {{data}}.\n\nPrenota subito il tuo appuntamento presso {{nome_clinica}} chiamando o rispondendo a questo messaggio.\n\nLa vaccinazione è importante per proteggere {{nome_pet}} da malattie pericolose. Non rimandare!',
      icon: 'bell'
    },
  ]);

  const [newTemplate, setNewTemplate] = useState({ name: '', type: 'messaggio', content: '' });

  const availableVars = [
    { key: '{{nome_cliente}}', desc: 'Nome del proprietario' },
    { key: '{{nome_pet}}', desc: 'Nome dell\'animale' },
    { key: '{{data}}', desc: 'Data appuntamento' },
    { key: '{{ora}}', desc: 'Ora appuntamento' },
    { key: '{{nome_clinica}}', desc: 'Nome della clinica' },
    { key: '{{nome_medico}}', desc: 'Nome del veterinario' },
    { key: '{{servizio}}', desc: 'Tipo di servizio' },
    { key: '{{email_clinica}}', desc: 'Email clinica' },
    { key: '{{riepilogo_visita}}', desc: 'Note/riepilogo' },
    { key: '{{importo}}', desc: 'Importo da pagare' },
  ];

  const typeConfig = {
    messaggio: { label: 'Messaggio', color: 'bg-blue-50 text-blue-600', iconBg: 'bg-blue-100', iconColor: 'text-blue-500' },
    email: { label: 'Email', color: 'bg-green-50 text-green-600', iconBg: 'bg-green-100', iconColor: 'text-green-500' },
    reminder: { label: 'Reminder', color: 'bg-amber-50 text-amber-600', iconBg: 'bg-amber-100', iconColor: 'text-amber-500' },
  };

  const getIcon = (iconType, className) => {
    switch(iconType) {
      case 'message': return <MessageCircle className={className} />;
      case 'bell': return <Bell className={className} />;
      case 'email': return <Mail className={className} />;
      case 'document': return <FileText className={className} />;
      default: return <MessageCircle className={className} />;
    }
  };

  // Get clinic name from user
  const clinicName = user?.clinicName || 'La tua Clinica Veterinaria';
  const clinicEmail = user?.email || '';

  // Generate message with real data
  const generateMessage = (template, data) => {
    let message = template.content;
    
    // Get selected owner
    const owner = owners.find(o => o.id === data.ownerId);
    // Get selected pet
    const pet = pets.find(p => p.id === data.petId);
    // Get selected appointment
    const appointment = appointments.find(a => a.id === data.appointmentId);
    // Get staff/vet
    const vet = staff.find(s => s.id === (appointment?.staffId || data.customData?.staffId));

    // Replace variables
    message = message.replace(/\{\{nome_cliente\}\}/g, owner?.name || data.customData?.nome_cliente || '[Nome Cliente]');
    message = message.replace(/\{\{nome_pet\}\}/g, pet?.name || appointment?.petName || data.customData?.nome_pet || '[Nome Animale]');
    message = message.replace(/\{\{data\}\}/g, appointment?.date ? new Date(appointment.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) : data.customData?.data || '[Data]');
    message = message.replace(/\{\{ora\}\}/g, appointment?.time || data.customData?.ora || '[Ora]');
    message = message.replace(/\{\{nome_clinica\}\}/g, clinicName);
    message = message.replace(/\{\{email_clinica\}\}/g, clinicEmail || '[email@clinica.it]');
    message = message.replace(/\{\{nome_medico\}\}/g, vet?.name || data.customData?.nome_medico || '[Nome Medico]');
    message = message.replace(/\{\{servizio\}\}/g, appointment?.type || appointment?.reason || data.customData?.servizio || '[Servizio]');
    message = message.replace(/\{\{riepilogo_visita\}\}/g, data.customData?.riepilogo_visita || '[Inserire riepilogo]');
    message = message.replace(/\{\{importo\}\}/g, data.customData?.importo ? `€${data.customData.importo}` : '[Importo]');

    return message;
  };

  // Open use template dialog
  const openUseDialog = (template) => {
    setSelectedTemplate(template);
    setUseFormData({ ownerId: '', petId: '', appointmentId: '', customData: {} });
    setGeneratedMessage('');
    setShowUseDialog(true);
  };

  // Update generated message when form changes
  const updateGeneratedMessage = (newFormData) => {
    setUseFormData(newFormData);
    if (selectedTemplate) {
      const msg = generateMessage(selectedTemplate, newFormData);
      setGeneratedMessage(msg);
    }
  };

  // Get owner's pets
  const ownerPets = useFormData.ownerId 
    ? pets.filter(p => p.ownerId === useFormData.ownerId)
    : pets;

  // Get appointments for selected owner/pet
  const relevantAppointments = appointments.filter(a => {
    if (useFormData.petId) {
      const pet = pets.find(p => p.id === useFormData.petId);
      return a.petName === pet?.name;
    }
    if (useFormData.ownerId) {
      const owner = owners.find(o => o.id === useFormData.ownerId);
      return a.ownerName === owner?.name || a.ownerEmail === owner?.email;
    }
    return true;
  });

  const filteredTemplates = activeTab === 'tutti' 
    ? templates 
    : templates.filter(t => t.type === activeTab.replace('messaggi', 'messaggio'));

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    alert('✅ Messaggio copiato negli appunti!');
  };

  const sendViaWhatsApp = (message, phone) => {
    const encodedMsg = encodeURIComponent(message);
    const url = phone ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;
    window.open(url, '_blank');
  };

  const sendViaEmail = (message, email, subject) => {
    const encodedMsg = encodeURIComponent(message);
    const encodedSubject = encodeURIComponent(subject || 'Messaggio da ' + clinicName);
    window.open(`mailto:${email || ''}?subject=${encodedSubject}&body=${encodedMsg}`, '_blank');
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      alert('Compila tutti i campi');
      return;
    }
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...newTemplate } : t));
    } else {
      setTemplates([...templates, { ...newTemplate, id: Date.now(), icon: newTemplate.type === 'email' ? 'email' : newTemplate.type === 'reminder' ? 'bell' : 'message' }]);
    }
    setShowNewDialog(false);
    setEditingTemplate(null);
    setNewTemplate({ name: '', type: 'messaggio', content: '' });
  };

  const openEditDialog = (template) => {
    setEditingTemplate(template);
    setNewTemplate({ name: template.name, type: template.type, content: template.content });
    setShowNewDialog(true);
  };

  const deleteTemplate = (id) => {
    if (confirm('Eliminare questo template?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const insertVariable = (variable) => {
    setNewTemplate({ ...newTemplate, content: newTemplate.content + variable });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Template Messaggi</h2>
          <p className="text-gray-500 text-sm">Gestisci i template per messaggi, email e reminder</p>
        </div>
        <Button className="bg-coral-500 hover:bg-coral-600" onClick={() => { setEditingTemplate(null); setNewTemplate({ name: '', type: 'messaggio', content: '' }); setShowNewDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nuovo Template
        </Button>
      </div>

      {/* How to use - Instructions */}
      <Card className="bg-gradient-to-r from-coral-50 to-orange-50 border-coral-200">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-coral-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-coral-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Template Automatici</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 bg-coral-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-gray-700">Clicca "Usa"</p>
                    <p className="text-gray-500">Seleziona il template da utilizzare</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 bg-coral-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-gray-700">Seleziona cliente</p>
                    <p className="text-gray-500">I dati vengono inseriti automaticamente!</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 bg-coral-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-gray-700">Invia subito</p>
                    <p className="text-gray-500">Via WhatsApp, Email o copia il testo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-6 border-b">
        {['tutti', 'messaggi', 'email', 'reminder'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition border-b-2 ${
              activeTab === tab 
                ? 'text-coral-600 border-coral-500' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => {
          const config = typeConfig[template.type];
          return (
            <Card key={template.id} className="hover:shadow-md transition">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.iconBg}`}>
                    {getIcon(template.icon, `h-5 w-5 ${config.iconColor}`)}
                  </div>
                  <Badge className={config.color}>
                    {config.label}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{template.content}</p>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <Button 
                    size="sm" 
                    className="bg-coral-500 hover:bg-coral-600 text-white"
                    onClick={() => openUseDialog(template)}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Usa
                  </Button>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditDialog(template)}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral-600 transition"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteTemplate(template.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Variables Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-5">
          <h4 className="font-semibold text-blue-800 mb-2">Variabili disponibili</h4>
          <p className="text-sm text-blue-600 mb-3">Queste variabili vengono sostituite automaticamente con i dati reali del cliente.</p>
          <div className="flex flex-wrap gap-2">
            {availableVars.map(v => (
              <Badge key={v.key} variant="outline" className="bg-white text-blue-700 border-blue-300 font-mono text-xs" title={v.desc}>
                {v.key}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* USE TEMPLATE DIALOG */}
      <Dialog open={showUseDialog} onOpenChange={setShowUseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-coral-500" />
              Usa Template: {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>Seleziona il cliente e i dati verranno inseriti automaticamente</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Client Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Proprietario</Label>
                <Select 
                  value={useFormData.ownerId} 
                  onValueChange={(v) => updateGeneratedMessage({ ...useFormData, ownerId: v, petId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona proprietario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {owners.map(owner => (
                      <SelectItem key={owner.id} value={owner.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {owner.name} {owner.email && `(${owner.email})`}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Animale</Label>
                <Select 
                  value={useFormData.petId} 
                  onValueChange={(v) => updateGeneratedMessage({ ...useFormData, petId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona animale..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ownerPets.map(pet => (
                      <SelectItem key={pet.id} value={pet.id}>
                        <div className="flex items-center gap-2">
                          <PawPrint className="h-4 w-4 text-gray-400" />
                          {pet.name} ({pet.species || pet.type})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Appointment Selection (optional) */}
            {relevantAppointments.length > 0 && (
              <div>
                <Label>Appuntamento (opzionale)</Label>
                <Select 
                  value={useFormData.appointmentId} 
                  onValueChange={(v) => updateGeneratedMessage({ ...useFormData, appointmentId: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona appuntamento..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessun appuntamento specifico</SelectItem>
                    {relevantAppointments.slice(0, 10).map(appt => (
                      <SelectItem key={appt.id} value={appt.id}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {appt.date} {appt.time} - {appt.petName} ({appt.type || appt.reason || 'Visita'})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom fields for missing data */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2 font-medium">Dati aggiuntivi (opzionali)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Veterinario</Label>
                  <Select 
                    value={useFormData.customData?.staffId || ''} 
                    onValueChange={(v) => updateGeneratedMessage({ ...useFormData, customData: { ...useFormData.customData, staffId: v } })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.filter(s => s.role === 'vet' || s.role === 'veterinario').map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Servizio</Label>
                  <Input 
                    className="h-9"
                    placeholder="Es: Vaccino, Visita..."
                    value={useFormData.customData?.servizio || ''}
                    onChange={(e) => updateGeneratedMessage({ ...useFormData, customData: { ...useFormData.customData, servizio: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Data</Label>
                  <Input 
                    type="date"
                    className="h-9"
                    value={useFormData.customData?.data || ''}
                    onChange={(e) => updateGeneratedMessage({ ...useFormData, customData: { ...useFormData.customData, data: new Date(e.target.value).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Ora</Label>
                  <Input 
                    type="time"
                    className="h-9"
                    value={useFormData.customData?.ora || ''}
                    onChange={(e) => updateGeneratedMessage({ ...useFormData, customData: { ...useFormData.customData, ora: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            {/* Generated Message Preview */}
            <div>
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Anteprima messaggio
              </Label>
              <div className="mt-2 p-4 bg-white border-2 border-coral-200 rounded-lg min-h-[120px]">
                {generatedMessage ? (
                  <p className="text-gray-800 whitespace-pre-wrap">{generatedMessage}</p>
                ) : (
                  <p className="text-gray-400 italic">Seleziona un cliente per vedere l'anteprima del messaggio...</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => copyToClipboard(generatedMessage)}
                disabled={!generatedMessage}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Copia testo
              </Button>
              <Button 
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={() => {
                  const owner = owners.find(o => o.id === useFormData.ownerId);
                  sendViaWhatsApp(generatedMessage, owner?.phone);
                }}
                disabled={!generatedMessage}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button 
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                onClick={() => {
                  const owner = owners.find(o => o.id === useFormData.ownerId);
                  sendViaEmail(generatedMessage, owner?.email, selectedTemplate?.name);
                }}
                disabled={!generatedMessage}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New/Edit Template Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Modifica Template' : 'Nuovo Template'}</DialogTitle>
            <DialogDescription>Crea un template per messaggi automatici</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome template</Label>
              <Input 
                value={newTemplate.name} 
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})} 
                placeholder="Es: Conferma appuntamento"
              />
            </div>
            
            <div>
              <Label>Tipo</Label>
              <div className="flex gap-2 mt-2">
                {Object.entries(typeConfig).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setNewTemplate({...newTemplate, type: key})}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition ${
                      newTemplate.type === key 
                        ? 'border-coral-500 bg-coral-50 text-coral-700' 
                        : 'border-gray-200 text-gray-600 hover:border-coral-300'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Contenuto</Label>
              <Textarea 
                value={newTemplate.content} 
                onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})} 
                rows={4}
                placeholder="Scrivi il messaggio... Usa le variabili come {{nome_cliente}}"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {availableVars.slice(0, 6).map(v => (
                  <button 
                    key={v.key} 
                    type="button"
                    onClick={() => insertVariable(v.key)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-coral-100 text-gray-600 hover:text-coral-600 rounded transition"
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowNewDialog(false)}>
                Annulla
              </Button>
              <Button className="flex-1 bg-coral-500 hover:bg-coral-600" onClick={handleSaveTemplate}>
                {editingTemplate ? 'Salva modifiche' : 'Crea template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== CLINIC REPORTS ====================

export default ClinicTemplates;
