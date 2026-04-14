'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Euro, FileText, LayoutDashboard, LogOut, Plus, Receipt, TrendingUp, Upload, User, Wallet } from 'lucide-react';
import api from '@/app/lib/api';
import InvoiceUploadForm from '@/app/components/shared/InvoiceUploadForm';
import { NewBrandLogo } from '@/app/components/shared/utils';

function StaffDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [owners, setOwners] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(user.mustChangePassword || false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => { loadData(); }, []);
  
  const loadData = async () => {
    try {
      const [docs, appts, ownersList] = await Promise.all([
        api.get('documents'),
        api.get('appointments'),
        api.get('owners')
      ]);
      setDocuments(docs);
      setAppointments(appts);
      setOwners(ownersList);
    } catch (error) { console.error('Error:', error); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Le password non coincidono');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('La password deve avere almeno 6 caratteri');
      return;
    }
    setChangingPassword(true);
    try {
      await api.post('auth/change-password', { newPassword: passwordForm.newPassword });
      setShowChangePassword(false);
      alert('Password cambiata con successo!');
    } catch (error) { alert(error.message); } finally { setChangingPassword(false); }
  };

  const handleExportInvoices = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/export/invoices`, {
        headers: { 'Authorization': `Bearer ${api.getToken()}` }
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fatture.csv';
      a.click();
    } catch (error) { alert('Errore export: ' + error.message); }
  };

  // Calculate financial stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyAppts = appointments.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlyRevenue = monthlyAppts.reduce((sum, a) => sum + (a.price || 0), 0);
  const invoicesDocs = documents.filter(d => d.type === 'fattura');
  const invoicesTotal = invoicesDocs.reduce((sum, d) => sum + (d.amount || 0), 0);

  const NavItem = ({ icon: Icon, label, value }) => (
    <button 
      onClick={() => setActiveTab(value)} 
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === value ? 'bg-amber-100 text-amber-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      <Icon className="h-5 w-5" />{label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Modal cambio password obbligatorio */}
      <Dialog open={showChangePassword} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Cambia la tua password</DialogTitle>
            <DialogDescription>Per sicurezza, devi impostare una nuova password al primo accesso.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
            <div>
              <Label>Nuova password *</Label>
              <Input 
                type="password" 
                value={passwordForm.newPassword} 
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                required 
                placeholder="Min. 6 caratteri"
              />
            </div>
            <div>
              <Label>Conferma password *</Label>
              <Input 
                type="password" 
                value={passwordForm.confirmPassword} 
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                required 
                placeholder="Ripeti la password"
              />
            </div>
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={changingPassword}>
              {changingPassword ? 'Salvataggio...' : 'Imposta nuova password'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <NewBrandLogo size="sm" showText={false} />
          <div>
            <h1 className="font-bold"><span className="text-gray-900">vet</span><span className="text-coral-500">buddy</span></h1>
            <p className="text-xs text-gray-500 truncate max-w-[140px]">{user.clinicName}</p>
          </div>
        </div>
        <Badge className="mb-6 justify-center bg-amber-100 text-amber-700">
          <Receipt className="h-3 w-3 mr-1" />Staff Amministrativo
        </Badge>
        
        <nav className="space-y-1 flex-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
          <NavItem icon={Receipt} label="Fatture" value="invoices" />
          <NavItem icon={TrendingUp} label="Flussi di cassa" value="cashflow" />
          <NavItem icon={FileText} label="Documenti" value="documents" />
          <NavItem icon={User} label="Clienti" value="clients" />
        </nav>
        
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-400 mb-2">Loggato come:</p>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <Button variant="ghost" onClick={onLogout} className="mt-4 text-gray-600">
          <LogOut className="h-4 w-4 mr-2" />Esci
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Dashboard Amministrativa</h2>
              <p className="text-gray-500">Gestisci fatture e monitora i flussi finanziari</p>
            </div>
            
            {/* KPI Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Fatture emesse</p>
                      <p className="text-2xl font-bold text-amber-600">{invoicesDocs.length}</p>
                      <p className="text-xs text-gray-400">questo mese</p>
                    </div>
                    <Receipt className="h-8 w-8 text-amber-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Totale fatturato</p>
                      <p className="text-2xl font-bold text-green-600">€{invoicesTotal}</p>
                      <p className="text-xs text-gray-400">da fatture</p>
                    </div>
                    <Euro className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Visite questo mese</p>
                      <p className="text-2xl font-bold text-blue-600">{monthlyAppts.length}</p>
                      <p className="text-xs text-gray-400">appuntamenti</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Incassi visite</p>
                      <p className="text-2xl font-bold text-coral-600">€{monthlyRevenue}</p>
                      <p className="text-xs text-gray-400">questo mese</p>
                    </div>
                    <Wallet className="h-8 w-8 text-coral-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-amber-500" />Azioni rapide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start bg-amber-500 hover:bg-amber-600" onClick={() => setActiveTab('invoices')}>
                    <Plus className="h-4 w-4 mr-2" />Carica nuova fattura
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('cashflow')}>
                    <TrendingUp className="h-4 w-4 mr-2" />Vedi flussi di cassa
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('clients')}>
                    <User className="h-4 w-4 mr-2" />Lista clienti
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />Ultime fatture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {invoicesDocs.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nessuna fattura caricata</p>
                  ) : (
                    <div className="space-y-2">
                      {invoicesDocs.slice(0, 3).map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-amber-500" />
                            <span className="text-sm">{doc.name}</span>
                          </div>
                          <span className="text-sm font-medium">€{doc.amount || 0}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Fatture</h2>
                <p className="text-gray-500">Gestisci le fatture per i clienti</p>
              </div>
              <Dialog open={showUpload} onOpenChange={setShowUpload}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    <Plus className="h-4 w-4 mr-2" />Carica fattura
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <InvoiceUploadForm owners={owners} onSuccess={() => { setShowUpload(false); loadData(); }} />
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardContent className="p-0">
                {invoicesDocs.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">Nessuna fattura</p>
                    <p className="text-sm mt-2">Carica la prima fattura per i tuoi clienti</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Documento</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Cliente</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Importo</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Data</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Stato</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicesDocs.map((doc, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-amber-500" />
                              <span className="font-medium">{doc.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600">{doc.ownerEmail || doc.petName || '-'}</td>
                          <td className="p-4 font-medium">€{doc.amount || 0}</td>
                          <td className="p-4 text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            {doc.emailSent ? (
                              <Badge className="bg-green-100 text-green-700">Inviata</Badge>
                            ) : (
                              <Badge variant="outline">Bozza</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'cashflow' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Flussi di cassa</h2>
              <p className="text-gray-500">Monitora entrate e uscite della clinica</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-green-600 mb-2">Entrate questo mese</p>
                  <p className="text-4xl font-bold text-green-700">€{monthlyRevenue + invoicesTotal}</p>
                  <p className="text-xs text-green-500 mt-2">Visite + Fatture</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-blue-600 mb-2">Da visite</p>
                  <p className="text-4xl font-bold text-blue-700">€{monthlyRevenue}</p>
                  <p className="text-xs text-blue-500 mt-2">{monthlyAppts.length} appuntamenti</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-amber-600 mb-2">Da fatture</p>
                  <p className="text-4xl font-bold text-amber-700">€{invoicesTotal}</p>
                  <p className="text-xs text-amber-500 mt-2">{invoicesDocs.length} fatture</p>
                </CardContent>
              </Card>
            </div>

            {/* Transaction List */}
            <Card>
              <CardHeader>
                <CardTitle>Movimenti recenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...appointments.slice(0, 5).map(a => ({ ...a, _type: 'visit' })), ...invoicesDocs.slice(0, 5).map(d => ({ ...d, _type: 'invoice' }))]
                    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                    .slice(0, 10)
                    .map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item._type === 'invoice' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                            {item._type === 'invoice' ? <Receipt className="h-5 w-5 text-amber-600" /> : <Calendar className="h-5 w-5 text-blue-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{item._type === 'invoice' ? item.name : (item.petName || 'Visita')}</p>
                            <p className="text-sm text-gray-500">{item._type === 'invoice' ? 'Fattura' : item.reason || 'Appuntamento'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">+€{item.amount || item.price || 0}</p>
                          <p className="text-xs text-gray-400">{new Date(item.createdAt || item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Documenti</h2>
              <p className="text-gray-500">Tutti i documenti della clinica</p>
            </div>
            <Card>
              <CardContent className="p-0">
                {documents.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun documento</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <FileText className={`h-5 w-5 ${doc.type === 'fattura' ? 'text-amber-500' : 'text-blue-500'}`} />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500">{doc.petName} • {doc.type}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{doc.emailSent ? 'Inviato' : 'Bozza'}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Clienti</h2>
              <p className="text-gray-500">Lista proprietari registrati</p>
            </div>
            <Card>
              <CardContent className="p-0">
                {owners.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun cliente</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {owners.map((owner, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{owner.name}</p>
                            <p className="text-sm text-gray-500">{owner.email}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">{owner.phone || '-'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

// Invoice Upload Form for Admin Staff

export default StaffDashboard;
