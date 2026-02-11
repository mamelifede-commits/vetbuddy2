'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, FileText, Users, Inbox, Settings, LogOut, Plus, Send, Dog, Cat, Clock, Mail, User, Building2, Phone, PawPrint } from 'lucide-react';

// Logo Component - Zampetta geometrica coral
const VetBuddyLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="50" cy="50" r="45" fill="#FF6B6B" />
    {/* Paw pad - main */}
    <ellipse cx="50" cy="58" rx="16" ry="14" fill="white"/>
    {/* Toe pads */}
    <ellipse cx="32" cy="38" rx="8" ry="10" fill="white"/>
    <ellipse cx="50" cy="32" rx="8" ry="10" fill="white"/>
    <ellipse cx="68" cy="38" rx="8" ry="10" fill="white"/>
  </svg>
);

// API Helper
const api = {
  baseUrl: '/api',
  token: null,
  
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('vetbuddy_token', token);
    }
  },
  
  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('vetbuddy_token');
    }
    return this.token;
  },
  
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Errore nella richiesta');
    }
    return data;
  },
  
  get(endpoint) {
    return this.request(endpoint);
  },
  
  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },
  
  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },
  
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

// Login/Register Page
function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'clinic',
    clinicName: '',
    phone: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? 'auth/login' : 'auth/register';
      const data = await api.post(endpoint, formData);
      api.setToken(data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <VetBuddyLogo size={60} />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-700">VetBuddy</CardTitle>
          <CardDescription>Piattaforma gestione cliniche veterinarie</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Accedi</TabsTrigger>
              <TabsTrigger value="register">Registrati</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="role">Tipo account</Label>
                    <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinic">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Clinica Veterinaria
                          </div>
                        </SelectItem>
                        <SelectItem value="owner">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Proprietario Animale
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="name">Nome {formData.role === 'clinic' ? 'Responsabile' : 'Completo'}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  {formData.role === 'clinic' && (
                    <div>
                      <Label htmlFor="clinicName">Nome Clinica</Label>
                      <Input
                        id="clinicName"
                        value={formData.clinicName}
                        onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="phone">Telefono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Registrati')}
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Clinic Dashboard
function ClinicDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('agenda');
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [staff, setStaff] = useState([]);
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appts, docs, msgs, staffList, petsList, ownersList] = await Promise.all([
        api.get('appointments'),
        api.get('documents'),
        api.get('messages'),
        api.get('staff'),
        api.get('pets'),
        api.get('owners'),
      ]);
      setAppointments(appts);
      setDocuments(docs);
      setMessages(msgs);
      setStaff(staffList);
      setPets(petsList);
      setOwners(ownersList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const NavItem = ({ icon: Icon, label, value }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
        activeTab === value 
          ? 'bg-emerald-100 text-emerald-700 font-medium' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <VetBuddyLogo size={40} />
          <div>
            <h1 className="font-bold text-emerald-700">VetBuddy</h1>
            <p className="text-xs text-gray-500">{user.clinicName || 'Clinica'}</p>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavItem icon={Calendar} label="Agenda" value="agenda" />
          <NavItem icon={Inbox} label="Inbox" value="inbox" />
          <NavItem icon={FileText} label="Documenti" value="documents" />
          <NavItem icon={Users} label="Staff" value="staff" />
          <NavItem icon={PawPrint} label="Pazienti" value="patients" />
          <NavItem icon={User} label="Proprietari" value="owners" />
        </nav>
        
        <Button variant="ghost" onClick={onLogout} className="mt-auto text-gray-600">
          <LogOut className="h-4 w-4 mr-2" />
          Esci
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === 'agenda' && (
          <AgendaSection 
            appointments={appointments} 
            owners={owners}
            pets={pets}
            onRefresh={loadData} 
          />
        )}
        {activeTab === 'inbox' && (
          <InboxSection messages={messages} onRefresh={loadData} />
        )}
        {activeTab === 'documents' && (
          <DocumentsSection 
            documents={documents} 
            pets={pets}
            owners={owners}
            onRefresh={loadData} 
          />
        )}
        {activeTab === 'staff' && (
          <StaffSection staff={staff} onRefresh={loadData} />
        )}
        {activeTab === 'patients' && (
          <PatientsSection pets={pets} owners={owners} onRefresh={loadData} />
        )}
        {activeTab === 'owners' && (
          <OwnersSection owners={owners} onRefresh={loadData} />
        )}
      </main>
    </div>
  );
}

// Agenda Section
function AgendaSection({ appointments, owners, pets, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    petName: '',
    ownerName: '',
    date: '',
    time: '',
    reason: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('appointments', formData);
      setShowDialog(false);
      setFormData({ petName: '', ownerName: '', date: '', time: '', reason: '', notes: '' });
      onRefresh();
    } catch (error) {
      alert(error.message);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const upcomingAppts = appointments.filter(a => a.date > today);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Appuntamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Appuntamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome Animale</Label>
                  <Input
                    value={formData.petName}
                    onChange={(e) => setFormData({...formData, petName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Nome Proprietario</Label>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Ora</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Motivo</Label>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Es: Visita di controllo, Vaccinazione..."
                  required
                />
              </div>
              <div>
                <Label>Note</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Crea Appuntamento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              Oggi ({todayAppts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppts.length === 0 ? (
              <p className="text-gray-500">Nessun appuntamento per oggi</p>
            ) : (
              <div className="space-y-3">
                {todayAppts.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <PawPrint className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">{appt.petName}</p>
                        <p className="text-sm text-gray-500">{appt.ownerName} - {appt.reason}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                      {appt.time}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prossimi Appuntamenti</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppts.length === 0 ? (
              <p className="text-gray-500">Nessun appuntamento futuro</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppts.slice(0, 5).map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <PawPrint className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{appt.petName}</p>
                        <p className="text-sm text-gray-500">{appt.ownerName} - {appt.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{appt.date}</p>
                      <p className="text-sm text-gray-500">{appt.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Inbox Section
function InboxSection({ messages, onRefresh }) {
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Inbox 
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
          )}
        </h2>
      </div>

      <Card>
        <CardContent className="p-0">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nessun messaggio</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !msg.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={async () => {
                    if (!msg.read) {
                      await api.put(`messages/${msg.id}`, { read: true });
                      onRefresh();
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${!msg.read ? 'text-blue-700' : ''}`}>
                        {msg.subject}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{msg.content}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Documents Section
function DocumentsSection({ documents, pets, owners, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [emailTo, setEmailTo] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'medical_record',
    content: '',
    petName: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('documents', formData);
      setShowDialog(false);
      setFormData({ name: '', type: 'medical_record', content: '', petName: '' });
      onRefresh();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedDoc || !emailTo) return;
    try {
      const result = await api.post('documents/send-email', {
        documentId: selectedDoc.id,
        recipientEmail: emailTo
      });
      alert(result.mock ? 'Email simulata (modalità MOCK)' : 'Email inviata con successo!');
      setShowEmailDialog(false);
      setEmailTo('');
      setSelectedDoc(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const docTypes = {
    vaccination: { label: 'Vaccinazione', color: 'bg-green-100 text-green-700' },
    medical_record: { label: 'Cartella Clinica', color: 'bg-blue-100 text-blue-700' },
    prescription: { label: 'Prescrizione', color: 'bg-purple-100 text-purple-700' },
    other: { label: 'Altro', color: 'bg-gray-100 text-gray-700' },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Documenti</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Documento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome Documento</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccination">Vaccinazione</SelectItem>
                    <SelectItem value="medical_record">Cartella Clinica</SelectItem>
                    <SelectItem value="prescription">Prescrizione</SelectItem>
                    <SelectItem value="other">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nome Animale</Label>
                <Input
                  value={formData.petName}
                  onChange={(e) => setFormData({...formData, petName: e.target.value})}
                />
              </div>
              <div>
                <Label>Contenuto/Note</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Salva Documento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invia Documento via Email</DialogTitle>
            <DialogDescription>
              Documento: {selectedDoc?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email destinatario</Label>
              <Input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="email@esempio.com"
              />
            </div>
            <Button onClick={handleSendEmail} className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Send className="h-4 w-4 mr-2" />
              Invia Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {documents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nessun documento</p>
            </CardContent>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">{doc.petName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={docTypes[doc.type]?.color || docTypes.other.color}>
                      {docTypes[doc.type]?.label || 'Altro'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDoc(doc);
                        setShowEmailDialog(true);
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Staff Section
function StaffSection({ staff, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'vet',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('staff', formData);
      setShowDialog(false);
      setFormData({ name: '', role: 'vet', email: '', phone: '' });
      onRefresh();
    } catch (error) {
      alert(error.message);
    }
  };

  const roleLabels = {
    vet: 'Veterinario',
    assistant: 'Assistente',
    receptionist: 'Receptionist',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Staff</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Membro Staff</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome Completo</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Ruolo</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vet">Veterinario</SelectItem>
                    <SelectItem value="assistant">Assistente</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label>Telefono</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Aggiungi
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nessun membro dello staff</p>
            </CardContent>
          </Card>
        ) : (
          staff.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <Badge variant="outline">{roleLabels[member.role] || member.role}</Badge>
                  </div>
                </div>
                {member.email && (
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> {member.email}
                  </p>
                )}
                {member.phone && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {member.phone}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Patients Section
function PatientsSection({ pets, owners, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    birthDate: '',
    weight: '',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('pets', formData);
      setShowDialog(false);
      setFormData({ name: '', species: 'dog', breed: '', birthDate: '', weight: '', notes: '' });
      onRefresh();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pazienti</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Paziente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Paziente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Specie</Label>
                  <Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Cane</SelectItem>
                      <SelectItem value="cat">Gatto</SelectItem>
                      <SelectItem value="bird">Uccello</SelectItem>
                      <SelectItem value="rabbit">Coniglio</SelectItem>
                      <SelectItem value="other">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Razza</Label>
                  <Input
                    value={formData.breed}
                    onChange={(e) => setFormData({...formData, breed: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data di Nascita</Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Note</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Aggiungi Paziente
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-gray-500">
              <PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nessun paziente registrato</p>
            </CardContent>
          </Card>
        ) : (
          pets.map((pet) => (
            <Card key={pet.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    {pet.species === 'dog' ? (
                      <Dog className="h-6 w-6 text-emerald-600" />
                    ) : pet.species === 'cat' ? (
                      <Cat className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <PawPrint className="h-6 w-6 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{pet.name}</p>
                    <p className="text-sm text-gray-500">{pet.breed || pet.species}</p>
                  </div>
                </div>
                {pet.weight && (
                  <p className="text-sm text-gray-500 mt-3">Peso: {pet.weight} kg</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Owners Section
function OwnersSection({ owners, onRefresh }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('owners', formData);
      setShowDialog(false);
      setFormData({ name: '', email: '', phone: '' });
      onRefresh();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Proprietari</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Proprietario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Proprietario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome Completo</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Telefono</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Aggiungi
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {owners.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nessun proprietario registrato</p>
            </CardContent>
          </Card>
        ) : (
          owners.map((owner) => (
            <Card key={owner.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{owner.name}</p>
                    <p className="text-sm text-gray-500">{owner.email}</p>
                  </div>
                </div>
                {owner.phone && (
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {owner.phone}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Owner Dashboard (for pet owners)
function OwnerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appts, docs, msgs, petsList] = await Promise.all([
        api.get('appointments'),
        api.get('documents'),
        api.get('messages'),
        api.get('pets'),
      ]);
      setAppointments(appts);
      setDocuments(docs);
      setMessages(msgs);
      setPets(petsList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const NavItem = ({ icon: Icon, label, value }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
        activeTab === value 
          ? 'bg-emerald-100 text-emerald-700 font-medium' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <VetBuddyLogo size={40} />
          <div>
            <h1 className="font-bold text-emerald-700">VetBuddy</h1>
            <p className="text-xs text-gray-500">{user.name}</p>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavItem icon={Calendar} label="Appuntamenti" value="appointments" />
          <NavItem icon={FileText} label="Documenti" value="documents" />
          <NavItem icon={Inbox} label="Messaggi" value="messages" />
          <NavItem icon={PawPrint} label="I miei Animali" value="pets" />
        </nav>
        
        <Button variant="ghost" onClick={onLogout} className="mt-auto text-gray-600">
          <LogOut className="h-4 w-4 mr-2" />
          Esci
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">I miei Appuntamenti</h2>
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun appuntamento</p>
                  </CardContent>
                </Card>
              ) : (
                appointments.map((appt) => (
                  <Card key={appt.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <PawPrint className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">{appt.petName}</p>
                            <p className="text-sm text-gray-500">{appt.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{appt.date}</p>
                          <p className="text-sm text-gray-500">{appt.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">I miei Documenti</h2>
            <div className="space-y-4">
              {documents.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun documento</p>
                  </CardContent>
                </Card>
              ) : (
                documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.petName || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Messaggi</h2>
            <Card>
              <CardContent className="p-0">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun messaggio</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    {messages.map((msg) => (
                      <div key={msg.id} className="p-4 border-b">
                        <p className="font-medium">{msg.subject}</p>
                        <p className="text-sm text-gray-500 mt-1">{msg.content}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'pets' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">I miei Animali</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-gray-500">
                    <PawPrint className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun animale registrato</p>
                  </CardContent>
                </Card>
              ) : (
                pets.map((pet) => (
                  <Card key={pet.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          {pet.species === 'dog' ? (
                            <Dog className="h-6 w-6 text-emerald-600" />
                          ) : pet.species === 'cat' ? (
                            <Cat className="h-6 w-6 text-emerald-600" />
                          ) : (
                            <PawPrint className="h-6 w-6 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{pet.name}</p>
                          <p className="text-sm text-gray-500">{pet.breed || pet.species}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (token) {
      try {
        const userData = await api.get('auth/me');
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('vetbuddy_token');
        api.token = null;
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('vetbuddy_token');
    api.token = null;
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-center">
          <VetBuddyLogo size={60} />
          <p className="mt-4 text-emerald-700">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  if (user.role === 'clinic') {
    return <ClinicDashboard user={user} onLogout={handleLogout} />;
  }

  return <OwnerDashboard user={user} onLogout={handleLogout} />;
}
