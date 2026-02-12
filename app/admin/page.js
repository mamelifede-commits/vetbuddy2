'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Building2, Mail, Phone, MapPin, FileText, RefreshCw, Eye, ChevronLeft, Lock, LogIn } from 'lucide-react';
import Link from 'next/link';

// Admin email - solo questo può accedere
const ADMIN_EMAIL = 'info@vetbuddy.it';

const api = {
  baseUrl: '/api',
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vetbuddy_token');
    }
    return null;
  },
  async get(endpoint) {
    const token = this.getToken();
    const res = await fetch(`${this.baseUrl}/${endpoint}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Errore');
    return res.json();
  },
  async put(endpoint, data) {
    const token = this.getToken();
    const res = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Errore');
    return res.json();
  },
  async post(endpoint, data) {
    const res = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Errore');
    return res.json();
  }
};

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Applications state
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [appToReject, setAppToReject] = useState(null);

  // Check if user is authenticated as admin on mount
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadApplications(filter);
    }
  }, [filter, isAuthenticated]);

  const checkAuth = async () => {
    setAuthChecking(true);
    const token = localStorage.getItem('vetbuddy_token');
    if (!token) {
      setAuthChecking(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const user = await res.json();
        if (user.email === ADMIN_EMAIL) {
          setIsAuthenticated(true);
        } else {
          setLoginError('Accesso riservato solo a ' + ADMIN_EMAIL);
          localStorage.removeItem('vetbuddy_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
    setAuthChecking(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    // Check if email is admin email
    if (loginEmail !== ADMIN_EMAIL) {
      setLoginError('⛔ Accesso riservato solo a ' + ADMIN_EMAIL);
      setLoginLoading(false);
      return;
    }

    try {
      const data = await api.post('auth/login', { email: loginEmail, password: loginPassword });
      localStorage.setItem('vetbuddy_token', data.token);
      setIsAuthenticated(true);
    } catch (error) {
      setLoginError(error.message || 'Credenziali non valide');
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('vetbuddy_token');
    setIsAuthenticated(false);
  };

  const loadApplications = async (currentFilter) => {
    setLoading(true);
    try {
      const filterToUse = currentFilter || filter;
      const data = await api.get(`pilot-applications?status=${filterToUse}`);
      setApplications(data.applications || []);
      setCounts(data.counts || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // State for approve dialog with plan selection
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [appToApprove, setAppToApprove] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const openApproveDialog = (app) => {
    setAppToApprove(app);
    setSelectedPlan('pro'); // Default
    setShowApproveDialog(true);
  };

  const handleApprove = async () => {
    if (!appToApprove) return;
    setActionLoading(true);
    try {
      await api.put('pilot-applications', { 
        applicationId: appToApprove.id, 
        status: 'approved',
        plan: selectedPlan 
      });
      alert(`✅ Clinica approvata con piano ${selectedPlan.toUpperCase()}! Email con credenziali inviata.`);
      setShowApproveDialog(false);
      setAppToApprove(null);
      loadApplications();
    } catch (error) {
      alert('Errore: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!appToReject) return;
    setActionLoading(true);
    try {
      await api.put('pilot-applications', { 
        applicationId: appToReject.id, 
        status: 'rejected',
        notes: rejectNotes 
      });
      alert('Candidatura rifiutata.');
      setShowRejectDialog(false);
      setRejectNotes('');
      setAppToReject(null);
      loadApplications();
    } catch (error) {
      alert('Errore: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (app) => {
    setAppToReject(app);
    setShowRejectDialog(true);
  };

  const StatusBadge = ({ status }) => {
    const config = {
      pending: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'In attesa' },
      approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Approvata' },
      rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rifiutata' }
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <Badge className={`${c.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {c.label}
      </Badge>
    );
  };

  // Show loading while checking auth
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-coral-500 mx-auto mb-4" />
          <p className="text-gray-500">Verifica accesso...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-coral-500" />
            </div>
            <CardTitle className="text-2xl">🏥 Admin VetBuddy</CardTitle>
            <CardDescription>Accesso riservato agli amministratori</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {loginError}
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@vetbuddy.it"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-coral-500 hover:bg-coral-600"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                {loginLoading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-coral-500">
                ← Torna alla home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                <ChevronLeft className="h-5 w-5" />
                Home
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🏥 Admin - Candidature Pilot</h1>
                <p className="text-sm text-gray-500">Gestisci le richieste di adesione al Pilot</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadApplications} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Aggiorna
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-500">
                Esci
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className={`cursor-pointer ${filter === 'all' ? 'ring-2 ring-coral-500' : ''}`} onClick={() => setFilter('all')}>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{counts.total}</p>
              <p className="text-sm text-gray-500">Totali</p>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer ${filter === 'pending' ? 'ring-2 ring-amber-500' : ''}`} onClick={() => setFilter('pending')}>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{counts.pending}</p>
              <p className="text-sm text-gray-500">In Attesa</p>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer ${filter === 'approved' ? 'ring-2 ring-green-500' : ''}`} onClick={() => setFilter('approved')}>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{counts.approved}</p>
              <p className="text-sm text-gray-500">Approvate</p>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer ${filter === 'rejected' ? 'ring-2 ring-red-500' : ''}`} onClick={() => setFilter('rejected')}>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{counts.rejected}</p>
              <p className="text-sm text-gray-500">Rifiutate</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-coral-500" />
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nessuna candidatura {filter !== 'all' ? `con stato "${filter}"` : ''}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{app.clinicName}</h3>
                        <StatusBadge status={app.status} />
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${app.email}`} className="text-blue-600 hover:underline">{app.email}</a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${app.phone}`}>{app.phone}</a>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {app.city}
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-400 mt-2">
                        Ricevuta: {new Date(app.createdAt).toLocaleDateString('it-IT', { 
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => { setSelectedApp(app); setShowDetails(true); }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Dettagli
                      </Button>
                      
                      {app.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => openApproveDialog(app)}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approva
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => openRejectDialog(app)}
                            disabled={actionLoading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rifiuta
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedApp?.clinicName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Responsabile</label>
                  <p className="font-medium">{selectedApp.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p><a href={`mailto:${selectedApp.email}`} className="text-blue-600 hover:underline">{selectedApp.email}</a></p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefono</label>
                  <p>{selectedApp.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">P.IVA</label>
                  <p>{selectedApp.vatNumber}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Indirizzo</label>
                  <p>{selectedApp.address}, {selectedApp.postalCode} {selectedApp.city}</p>
                </div>
                {selectedApp.website && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Sito web</label>
                    <p><a href={selectedApp.website} target="_blank" className="text-blue-600 hover:underline">{selectedApp.website}</a></p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Staff</label>
                  <p>{selectedApp.staffCount || 'Non specificato'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Servizi</label>
                  <p>{selectedApp.services?.length > 0 ? selectedApp.services.length + ' servizi' : 'Non specificati'}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-2">Motivazione</label>
                <p className="whitespace-pre-wrap">{selectedApp.pilotMotivation}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <div>
                  <StatusBadge status={selectedApp.status} />
                </div>
                <p>Candidatura del {new Date(selectedApp.createdAt).toLocaleDateString('it-IT')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      {/* Approve Dialog con selezione piano */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ Approva Candidatura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Stai approvando la candidatura di <strong>{appToApprove?.clinicName}</strong>.
            </p>
            
            <div>
              <label className="text-sm font-medium mb-3 block">Seleziona il piano da assegnare:</label>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedPlan === 'starter' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="plan" 
                    value="starter"
                    checked={selectedPlan === 'starter'}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700">Starter</div>
                    <div className="text-xs text-gray-500">1 utente, 50 pazienti, NO automazioni</div>
                  </div>
                  <Badge className="bg-gray-100 text-gray-600">Gratis</Badge>
                </label>
                
                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedPlan === 'pro' ? 'border-coral-500 bg-coral-50' : 'border-gray-200 hover:border-coral-300'}`}>
                  <input 
                    type="radio" 
                    name="plan" 
                    value="pro"
                    checked={selectedPlan === 'pro'}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-coral-600">Pro (Pilot Milano)</div>
                    <div className="text-xs text-gray-500">5 utenti, pazienti illimitati, 20 automazioni, 90 giorni gratuiti</div>
                  </div>
                  <Badge className="bg-coral-100 text-coral-600">⭐ Consigliato</Badge>
                </label>
                
                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedPlan === 'custom' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                  <input 
                    type="radio" 
                    name="plan" 
                    value="custom"
                    checked={selectedPlan === 'custom'}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-purple-600">Custom</div>
                    <div className="text-xs text-gray-500">Utenti illimitati, multi-sede, 44+ automazioni, WhatsApp</div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-600">Enterprise</Badge>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
              <strong>Nota:</strong> Verrà creato un account per la clinica e inviate le credenziali via email.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Annulla</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={actionLoading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {actionLoading ? 'Elaborazione...' : `Approva con piano ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rifiuta Candidatura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Stai rifiutando la candidatura di <strong>{appToReject?.clinicName}</strong>.
            </p>
            <div>
              <label className="text-sm font-medium">Note (opzionale)</label>
              <Textarea 
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Motivo del rifiuto (verrà incluso nell'email)"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Annulla</Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading}>
              {actionLoading ? 'Elaborazione...' : 'Conferma Rifiuto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
