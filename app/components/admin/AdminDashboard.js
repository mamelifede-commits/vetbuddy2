'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Calendar, Cat, CheckCircle, ClipboardList, Clock, Dog, Eye, FileCheck, FileText, FlaskConical, LayoutDashboard, LogOut, MapPin, Menu, Package, PawPrint, Phone, RefreshCw, Save, Trash2, User, Users, X } from 'lucide-react';
import api from '@/app/lib/api';
import { NewBrandLogo } from '@/app/components/shared/utils';

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, clinics: 0, owners: 0, pets: 0, appointments: 0, documents: 0, labs: 0 });
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [labRequestsData, setLabRequestsData] = useState({ requests: [], stats: { total: 0, pending: 0, reportReady: 0, completed: 0 } });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedLab, setSelectedLab] = useState(null);
  const [showLabDetailModal, setShowLabDetailModal] = useState(false);

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [usersData, appointmentsData, petsData, documentsData, labsData, labReqData] = await Promise.all([
        api.get('admin/users'),
        api.get('admin/appointments'),
        api.get('admin/pets'),
        api.get('admin/documents'),
        api.get('admin/labs').catch(() => []),
        api.get('admin/lab-requests').catch(() => ({ requests: [], stats: { total: 0, pending: 0, reportReady: 0, completed: 0 } }))
      ]);
      setUsers(usersData || []);
      setAppointments(appointmentsData || []);
      setPets(petsData || []);
      setDocuments(documentsData || []);
      setLabs(labsData || []);
      setLabRequestsData(labReqData || { requests: [], stats: {} });
      
      const clinics = (usersData || []).filter(u => u.role === 'clinic');
      const owners = (usersData || []).filter(u => u.role === 'owner');
      const labUsers = (usersData || []).filter(u => u.role === 'lab');
      setStats({
        users: (usersData || []).length,
        clinics: clinics.length,
        owners: owners.length,
        pets: (petsData || []).length,
        appointments: (appointmentsData || []).length,
        documents: (documentsData || []).length,
        labs: labUsers.length
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;
    try {
      await api.delete(`admin/users/${userId}`);
      loadAllData();
    } catch (error) {
      alert('Errore eliminazione: ' + error.message);
    }
  };

  const NavItem = ({ icon: Icon, label, value, badge }) => (
    <button onClick={() => { setActiveTab(value); setMobileMenuOpen(false); }} 
      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${activeTab === value ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
      <div className="flex items-center gap-3"><Icon className="h-5 w-5" />{label}</div>
      {badge > 0 && <Badge className="bg-purple-500 text-white text-xs">{badge}</Badge>}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <NewBrandLogo size="xs" showText={false} />
          <div>
            <h1 className="font-bold text-sm"><span className="text-gray-900">vet</span><span className="text-purple-600">buddy</span> <span className="text-purple-400">Admin</span></h1>
            <p className="text-xs text-gray-500">Pannello di controllo</p>
          </div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Dark backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-[55]" 
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className="md:hidden fixed left-0 right-0 top-[57px] bottom-0 bg-white z-[60] p-4 overflow-y-auto shadow-xl animate-in slide-in-from-top duration-200">
            <Badge className="mb-4 bg-purple-100 text-purple-700">👑 Amministratore</Badge>
            <nav className="space-y-1">
              <NavItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
              <NavItem icon={Users} label="Utenti" value="users" badge={stats.users} />
              <NavItem icon={Building2} label="Cliniche" value="clinics" badge={stats.clinics} />
              <NavItem icon={User} label="Proprietari" value="owners" badge={stats.owners} />
              <NavItem icon={Calendar} label="Appuntamenti" value="appointments" badge={stats.appointments} />
              <NavItem icon={PawPrint} label="Animali" value="pets" badge={stats.pets} />
              <NavItem icon={FileText} label="Documenti" value="documents" badge={stats.documents} />
              <NavItem icon={FlaskConical} label="Laboratori" value="labs" badge={stats.labs} />
            </nav>
            <Button variant="ghost" onClick={onLogout} className="mt-6 text-gray-600 w-full justify-start"><LogOut className="h-4 w-4 mr-2" />Esci</Button>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r p-4 flex-col flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <NewBrandLogo size="sm" showText={false} />
          <div>
            <h1 className="font-bold"><span className="text-gray-900">vet</span><span className="text-purple-600">buddy</span></h1>
            <p className="text-xs text-gray-500">Pannello Admin</p>
          </div>
        </div>
        <Badge className="mb-6 bg-purple-100 text-purple-700 justify-center">👑 Amministratore</Badge>
        
        <nav className="space-y-1 flex-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
          <NavItem icon={Users} label="Tutti gli Utenti" value="users" badge={stats.users} />
          <NavItem icon={Building2} label="Cliniche" value="clinics" badge={stats.clinics} />
          <NavItem icon={User} label="Proprietari" value="owners" badge={stats.owners} />
          <NavItem icon={Calendar} label="Appuntamenti" value="appointments" badge={stats.appointments} />
          <NavItem icon={PawPrint} label="Animali" value="pets" badge={stats.pets} />
          <NavItem icon={FileText} label="Documenti" value="documents" badge={stats.documents} />
          <NavItem icon={FlaskConical} label="Laboratori" value="labs" badge={stats.labs} />
        </nav>
        
        <Button variant="ghost" onClick={onLogout} className="mt-auto text-gray-600"><LogOut className="h-4 w-4 mr-2" />Esci</Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-500" />
              <p className="mt-2 text-gray-500">Caricamento dati...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div>
                <h1 className="text-2xl font-bold mb-6">📊 Dashboard Amministratore</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('users')}>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                      <p className="text-2xl font-bold">{stats.users}</p>
                      <p className="text-xs text-gray-500">Utenti totali</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('clinics')}>
                    <CardContent className="p-4 text-center">
                      <Building2 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                      <p className="text-2xl font-bold">{stats.clinics}</p>
                      <p className="text-xs text-gray-500">Cliniche</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('owners')}>
                    <CardContent className="p-4 text-center">
                      <User className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <p className="text-2xl font-bold">{stats.owners}</p>
                      <p className="text-xs text-gray-500">Proprietari</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('pets')}>
                    <CardContent className="p-4 text-center">
                      <PawPrint className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                      <p className="text-2xl font-bold">{stats.pets}</p>
                      <p className="text-xs text-gray-500">Animali</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('appointments')}>
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-8 w-8 mx-auto text-coral-500 mb-2" />
                      <p className="text-2xl font-bold">{stats.appointments}</p>
                      <p className="text-xs text-gray-500">Appuntamenti</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('documents')}>
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto text-indigo-500 mb-2" />
                      <p className="text-2xl font-bold">{stats.documents}</p>
                      <p className="text-xs text-gray-500">Documenti</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('labs')}>
                    <CardContent className="p-4 text-center">
                      <FlaskConical className="h-8 w-8 mx-auto text-violet-500 mb-2" />
                      <p className="text-2xl font-bold">{stats.labs}</p>
                      <p className="text-xs text-gray-500">Laboratori</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">🏥 Ultime Cliniche Registrate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {users.filter(u => u.role === 'clinic').slice(0, 5).map(clinic => (
                        <div key={clinic.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium">{clinic.clinicName || clinic.name}</p>
                            <p className="text-xs text-gray-500">{clinic.email}</p>
                          </div>
                          <Badge variant="outline">{clinic.city || 'N/A'}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">📅 Ultimi Appuntamenti</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {appointments.slice(0, 5).map(apt => (
                        <div key={apt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium">{apt.petName || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{apt.service}</p>
                          </div>
                          <Badge className={apt.status === 'confermato' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {apt.date}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">👥 Tutti gli Utenti</h1>
                  <Badge variant="outline">{users.length} totali</Badge>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-medium">Nome</th>
                            <th className="text-left p-4 font-medium">Email</th>
                            <th className="text-left p-4 font-medium">Ruolo</th>
                            <th className="text-left p-4 font-medium">Data</th>
                            <th className="text-left p-4 font-medium">Azioni</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u.id} className="border-t">
                              <td className="p-4">{u.name || u.clinicName || '-'}</td>
                              <td className="p-4 text-gray-600">{u.email}</td>
                              <td className="p-4">
                                <Badge className={
                                  u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                  u.role === 'clinic' ? 'bg-blue-100 text-blue-700' :
                                  'bg-green-100 text-green-700'
                                }>{u.role}</Badge>
                              </td>
                              <td className="p-4 text-gray-500 text-sm">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('it-IT') : '-'}</td>
                              <td className="p-4">
                                {u.role !== 'admin' && (
                                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteUser(u.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'clinics' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">🏥 Cliniche</h1>
                  <Badge variant="outline">{stats.clinics} registrate</Badge>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.filter(u => u.role === 'clinic').map(clinic => (
                    <Card key={clinic.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold">{clinic.clinicName || clinic.name}</h3>
                            <p className="text-sm text-gray-500">{clinic.email}</p>
                            <p className="text-sm text-gray-500 mt-1"><MapPin className="h-3 w-3 inline mr-1" />{clinic.city || 'N/A'}</p>
                            {clinic.phone && <p className="text-sm text-gray-500"><Phone className="h-3 w-3 inline mr-1" />{clinic.phone}</p>}
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteUser(clinic.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'owners' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">👤 Proprietari</h1>
                  <Badge variant="outline">{stats.owners} registrati</Badge>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.filter(u => u.role === 'owner').map(owner => (
                    <Card key={owner.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold">{owner.name}</h3>
                            <p className="text-sm text-gray-500">{owner.email}</p>
                            {owner.phone && <p className="text-sm text-gray-500"><Phone className="h-3 w-3 inline mr-1" />{owner.phone}</p>}
                            {owner.city && <p className="text-sm text-gray-500"><MapPin className="h-3 w-3 inline mr-1" />{owner.city}</p>}
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteUser(owner.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">📅 Tutti gli Appuntamenti</h1>
                  <Badge variant="outline">{appointments.length} totali</Badge>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-medium">Data</th>
                            <th className="text-left p-4 font-medium">Ora</th>
                            <th className="text-left p-4 font-medium">Animale</th>
                            <th className="text-left p-4 font-medium">Servizio</th>
                            <th className="text-left p-4 font-medium">Stato</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map(apt => (
                            <tr key={apt.id} className="border-t">
                              <td className="p-4">{apt.date}</td>
                              <td className="p-4">{apt.time}</td>
                              <td className="p-4">{apt.petName || '-'}</td>
                              <td className="p-4">{apt.service}</td>
                              <td className="p-4">
                                <Badge className={
                                  apt.status === 'confermato' ? 'bg-green-100 text-green-700' :
                                  apt.status === 'completato' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }>{apt.status}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'pets' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">🐾 Tutti gli Animali</h1>
                  <Badge variant="outline">{pets.length} registrati</Badge>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pets.map(pet => (
                    <Card key={pet.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                            {pet.species === 'Cane' ? <Dog className="h-6 w-6 text-orange-600" /> : <Cat className="h-6 w-6 text-orange-600" />}
                          </div>
                          <div>
                            <h3 className="font-bold">{pet.name}</h3>
                            <p className="text-sm text-gray-500">{pet.species} • {pet.breed || 'N/A'}</p>
                            {pet.microchip && <p className="text-xs text-gray-400">Chip: {pet.microchip}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">📄 Tutti i Documenti</h1>
                  <Badge variant="outline">{documents.length} caricati</Badge>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-medium">Nome</th>
                            <th className="text-left p-4 font-medium">Tipo</th>
                            <th className="text-left p-4 font-medium">Animale</th>
                            <th className="text-left p-4 font-medium">Stato</th>
                            <th className="text-left p-4 font-medium">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documents.map(doc => (
                            <tr key={doc.id} className="border-t">
                              <td className="p-4 font-medium">{doc.name}</td>
                              <td className="p-4">{doc.type || '-'}</td>
                              <td className="p-4">{doc.petName || '-'}</td>
                              <td className="p-4">
                                <Badge variant="outline">{doc.status}</Badge>
                              </td>
                              <td className="p-4 text-sm text-gray-500">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('it-IT') : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Admin Labs Management Tab */}
            {activeTab === 'labs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">🧪 Gestione Laboratori Partner</h1>
                  <Badge variant="outline">{labs.length} laboratori</Badge>
                </div>

                {/* Lab Request Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Package className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                      <p className="text-2xl font-bold">{labRequestsData.stats?.total || 0}</p>
                      <p className="text-xs text-gray-500">Richieste Totali</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="h-6 w-6 mx-auto text-amber-500 mb-1" />
                      <p className="text-2xl font-bold">{labRequestsData.stats?.pending || 0}</p>
                      <p className="text-xs text-gray-500">In Corso</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileCheck className="h-6 w-6 mx-auto text-orange-500 mb-1" />
                      <p className="text-2xl font-bold">{labRequestsData.stats?.reportReady || 0}</p>
                      <p className="text-xs text-gray-500">Referti Pronti</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-1" />
                      <p className="text-2xl font-bold">{labRequestsData.stats?.completed || 0}</p>
                      <p className="text-xs text-gray-500">Completate</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Labs List */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FlaskConical className="h-5 w-5 text-violet-500" />
                      Laboratori Registrati
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {labs.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FlaskConical className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p>Nessun laboratorio registrato</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {labs.map(lab => (
                          <div key={lab.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                {(lab.labName || lab.name || '?')[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{lab.labName || lab.name}</p>
                                <p className="text-sm text-gray-500">{lab.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {lab.city && <Badge variant="outline" className="text-xs"><MapPin className="h-3 w-3 mr-1" />{lab.city}</Badge>}
                                  {lab.phone && <Badge variant="outline" className="text-xs"><Phone className="h-3 w-3 mr-1" />{lab.phone}</Badge>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right mr-4">
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-gray-500"><strong className="text-gray-900">{lab.stats?.totalRequests || 0}</strong> richieste</span>
                                  <span className="text-gray-500"><strong className="text-amber-600">{lab.stats?.pendingRequests || 0}</strong> in corso</span>
                                  <span className="text-gray-500"><strong className="text-green-600">{lab.stats?.completedRequests || 0}</strong> completate</span>
                                </div>
                              </div>
                              <Badge className={lab.approved !== false ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                                {lab.approved !== false ? '✅ Approvato' : '⏳ In attesa'}
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => { setSelectedLab(lab); setShowLabDetailModal(true); }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Dettagli
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Lab Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-blue-500" />
                      Ultime Richieste di Analisi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-medium text-sm">Codice</th>
                            <th className="text-left p-4 font-medium text-sm">Esame</th>
                            <th className="text-left p-4 font-medium text-sm">Paziente</th>
                            <th className="text-left p-4 font-medium text-sm">Laboratorio</th>
                            <th className="text-left p-4 font-medium text-sm">Stato</th>
                            <th className="text-left p-4 font-medium text-sm">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(labRequestsData.requests || []).slice(0, 20).map(req => {
                            const statusMap = {
                              'pending': { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-700' },
                              'received': { label: 'Ricevuto', color: 'bg-blue-100 text-blue-700' },
                              'sample_waiting': { label: 'Campione Atteso', color: 'bg-orange-100 text-orange-700' },
                              'sample_received': { label: 'Campione Ricevuto', color: 'bg-cyan-100 text-cyan-700' },
                              'in_progress': { label: 'In Analisi', color: 'bg-indigo-100 text-indigo-700' },
                              'report_ready': { label: 'Referto Pronto', color: 'bg-purple-100 text-purple-700' },
                              'completed': { label: 'Completato', color: 'bg-green-100 text-green-700' },
                              'cancelled': { label: 'Annullato', color: 'bg-red-100 text-red-700' },
                            };
                            const statusInfo = statusMap[req.status] || { label: req.status, color: 'bg-gray-100 text-gray-700' };
                            return (
                              <tr key={req.id} className="border-t hover:bg-gray-50">
                                <td className="p-4"><code className="text-xs bg-gray-100 px-2 py-1 rounded">{req.sampleCode || '-'}</code></td>
                                <td className="p-4 text-sm font-medium">{req.examName || req.examType || '-'}</td>
                                <td className="p-4 text-sm">{req.petName || '-'}</td>
                                <td className="p-4 text-sm">{req.labName || '-'}</td>
                                <td className="p-4"><Badge className={`${statusInfo.color} text-xs`}>{statusInfo.label}</Badge></td>
                                <td className="p-4 text-sm text-gray-500">{req.createdAt ? new Date(req.createdAt).toLocaleDateString('it-IT') : '-'}</td>
                              </tr>
                            );
                          })}
                          {(labRequestsData.requests || []).length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nessuna richiesta di analisi trovata</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Lab Detail Modal */}
                <Dialog open={showLabDetailModal} onOpenChange={setShowLabDetailModal}>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-violet-500" />
                        Dettaglio Laboratorio
                      </DialogTitle>
                    </DialogHeader>
                    {selectedLab && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                            {(selectedLab.labName || selectedLab.name || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{selectedLab.labName || selectedLab.name}</h3>
                            <p className="text-sm text-gray-500">{selectedLab.email}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Telefono</p>
                            <p className="font-medium">{selectedLab.phone || 'N/A'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Città</p>
                            <p className="font-medium">{selectedLab.city || 'N/A'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Indirizzo</p>
                            <p className="font-medium">{selectedLab.address || 'N/A'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Registrato il</p>
                            <p className="font-medium">{selectedLab.createdAt ? new Date(selectedLab.createdAt).toLocaleDateString('it-IT') : 'N/A'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Card>
                            <CardContent className="p-3 text-center">
                              <p className="text-2xl font-bold text-blue-600">{selectedLab.stats?.totalRequests || 0}</p>
                              <p className="text-xs text-gray-500">Richieste Totali</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-3 text-center">
                              <p className="text-2xl font-bold text-green-600">{selectedLab.stats?.completedRequests || 0}</p>
                              <p className="text-xs text-gray-500">Completate</p>
                            </CardContent>
                          </Card>
                        </div>

                        {selectedLab.specializations && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Specializzazioni</p>
                            <div className="flex flex-wrap gap-1">
                              {(selectedLab.specializations || []).map((s, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowLabDetailModal(false)}>Chiudi</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}


export default AdminDashboard;
