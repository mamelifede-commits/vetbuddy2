'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Building2, Mail, Phone, MapPin, FileText, RefreshCw, Eye, ChevronLeft, Lock, LogIn, FlaskConical, Users, PawPrint, Calendar, CreditCard, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

// Admin email - solo questo può accedere
const ADMIN_EMAIL = 'admin@vetbuddy.it';

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
  
  // Admin tabs & new sections state
  const [activeAdminTab, setActiveAdminTab] = useState('candidature');
  const [platformStats, setPlatformStats] = useState(null);
  const [labStats, setLabStats] = useState(null);
  const [labs, setLabs] = useState([]);
  const [stripeTransactions, setStripeTransactions] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showLabBillingDialog, setShowLabBillingDialog] = useState(false);
  const [selectedLabForBilling, setSelectedLabForBilling] = useState(null);
  const [billingForm, setBillingForm] = useState({ extendTrialDays: 30, maxFreeRequests: 50, resetRequestsCount: false });
  const [billingLoading, setBillingLoading] = useState(false);

  // Handle lab billing update
  const handleLabBilling = async () => {
    if (!selectedLabForBilling) return;
    setBillingLoading(true);
    try {
      await api.post(`admin/labs/${selectedLabForBilling.id}/billing`, billingForm);
      alert('✅ Impostazioni billing aggiornate con successo!');
      setShowLabBillingDialog(false);
      setSelectedLabForBilling(null);
      loadLabData();
    } catch (error) {
      alert('Errore: ' + error.message);
    } finally {
      setBillingLoading(false);
    }
  };

  const openLabBilling = (lab) => {
    setSelectedLabForBilling(lab);
    setBillingForm({
      extendTrialDays: 30,
      maxFreeRequests: lab.billing?.maxFreeRequests || 50,
      resetRequestsCount: false
    });
    setShowLabBillingDialog(true);
  };

  const openApproveDialog = (app) => {
    setAppToApprove(app);
    setSelectedPlan('pro'); // Default
    setShowApproveDialog(true);
  };

  // Load platform stats
  const loadPlatformStats = async () => {
    setStatsLoading(true);
    try {
      const data = await api.get('admin/stats');
      setPlatformStats(data);
    } catch (e) { console.error('Stats error:', e); }
    setStatsLoading(false);
  };

  // Load lab stats & list
  const loadLabData = async () => {
    setStatsLoading(true);
    try {
      const [labList, stats] = await Promise.all([
        api.get('admin/labs'),
        api.get('admin/lab-stats')
      ]);
      setLabs(labList || []);
      setLabStats(stats);
    } catch (e) { console.error('Lab data error:', e); }
    setStatsLoading(false);
  };

  // Load Stripe/payment data
  const loadStripeData = async () => {
    setStatsLoading(true);
    try {
      const users = await api.get('admin/users');
      const subsUsers = (users || []).filter(u => u.subscriptionPlan || u.stripeCustomerId);
      setStripeTransactions(subsUsers);
    } catch (e) { console.error('Stripe error:', e); }
    setStatsLoading(false);
  };

  // Load data when tab changes
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeAdminTab === 'piattaforma') loadPlatformStats();
    if (activeAdminTab === 'laboratori') loadLabData();
    if (activeAdminTab === 'stripe') loadStripeData();
  }, [activeAdminTab, isAuthenticated]);

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
      loadApplications(filter);
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
      loadApplications(filter);
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                <ChevronLeft className="h-5 w-5" />
                Home
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin VetBuddy</h1>
                <p className="text-sm text-gray-500">Pannello di gestione piattaforma</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-500">
                Esci
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeAdminTab} onValueChange={setActiveAdminTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-xl mb-6">
            <TabsTrigger value="candidature" className="flex items-center gap-1.5"><Building2 className="h-4 w-4" />Candidature</TabsTrigger>
            <TabsTrigger value="laboratori" className="flex items-center gap-1.5"><FlaskConical className="h-4 w-4" />Laboratori</TabsTrigger>
            <TabsTrigger value="piattaforma" className="flex items-center gap-1.5"><BarChart3 className="h-4 w-4" />Piattaforma</TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-1.5"><CreditCard className="h-4 w-4" />Stripe</TabsTrigger>
          </TabsList>

          {/* ========== TAB: CANDIDATURE (existing) ========== */}
          <TabsContent value="candidature">
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
      </TabsContent>

          {/* ========== TAB: LABORATORI ========== */}
          <TabsContent value="laboratori">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Lab Overview Stats */}
                {labStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <FlaskConical className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                        <p className="text-3xl font-bold text-gray-900">{labStats.labs?.total || 0}</p>
                        <p className="text-sm text-gray-500">Laboratori Totali</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                        <p className="text-3xl font-bold text-green-600">{labStats.labs?.active || 0}</p>
                        <p className="text-sm text-gray-500">Attivi</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <FileText className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                        <p className="text-3xl font-bold text-blue-600">{labStats.requests?.total || 0}</p>
                        <p className="text-sm text-gray-500">Richieste Totali</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                        <p className="text-3xl font-bold text-emerald-600">{labStats.reports?.total || 0}</p>
                        <p className="text-sm text-gray-500">Referti Totali</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Billing Alerts */}
                {labStats && (labStats.billing?.trialExpiringSoon > 0 || labStats.billing?.requestsNearLimit > 0) && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <h3 className="font-semibold text-amber-800">Avvisi Billing</h3>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-700">In prova:</span>
                          <Badge className="bg-amber-100 text-amber-700">{labStats.billing?.inTrial || 0}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-700">Trial in scadenza (30gg):</span>
                          <Badge className="bg-orange-100 text-orange-700">{labStats.billing?.trialExpiringSoon || 0}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-700">Richieste in esaurimento:</span>
                          <Badge className="bg-red-100 text-red-700">{labStats.billing?.requestsNearLimit || 0}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Requests & Connections Summary */}
                {labStats && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Stato Richieste</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">In corso</span><Badge className="bg-amber-100 text-amber-700">{labStats.requests?.pending || 0}</Badge></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Referto pronto</span><Badge className="bg-blue-100 text-blue-700">{labStats.requests?.reportReady || 0}</Badge></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Completate</span><Badge className="bg-green-100 text-green-700">{labStats.requests?.completed || 0}</Badge></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Annullate</span><Badge className="bg-gray-100 text-gray-600">{labStats.requests?.cancelled || 0}</Badge></div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Connessioni Clinica-Lab</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Attive</span><Badge className="bg-green-100 text-green-700">{labStats.connections?.active || 0}</Badge></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">In attesa</span><Badge className="bg-amber-100 text-amber-700">{labStats.connections?.pending || 0}</Badge></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Referti pubblicati</span><Badge className="bg-emerald-100 text-emerald-700">{labStats.reports?.visibleToOwner || 0}</Badge></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">In attesa revisione</span><Badge className="bg-orange-100 text-orange-700">{labStats.reports?.pendingReview || 0}</Badge></div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Top Labs */}
                {labStats?.topLabs?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Top Laboratori per Richieste</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {labStats.topLabs.map((tl, idx) => (
                          <div key={tl.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-purple-500">#{idx + 1}</span>
                              <div>
                                <p className="font-medium text-sm">{tl.labName}</p>
                                <p className="text-xs text-gray-500">{tl.city} · {tl.connections} connessioni</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{tl.totalRequests} richieste</p>
                              <p className="text-xs text-green-600">{tl.completedRequests} completate</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Labs List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">Elenco Laboratori</h3>
                    <Button variant="outline" size="sm" onClick={loadLabData}>
                      <RefreshCw className="h-4 w-4 mr-1" /> Aggiorna
                    </Button>
                  </div>
                  {labs.length === 0 ? (
                    <Card><CardContent className="p-8 text-center text-gray-500"><FlaskConical className="h-10 w-10 mx-auto mb-3 text-gray-300" /><p>Nessun laboratorio registrato</p></CardContent></Card>
                  ) : (
                    <div className="space-y-3">
                      {labs.map((lab) => (
                        <Card key={lab.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-bold">{lab.labName || lab.name}</h4>
                                  {lab.isApproved ? (
                                    <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1"/>Approvato</Badge>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-700"><Clock className="h-3 w-3 mr-1"/>In attesa</Badge>
                                  )}
                                  <Badge className="bg-purple-100 text-purple-700">{lab.billing?.plan || 'partner_free'}</Badge>
                                </div>
                                <div className="grid md:grid-cols-3 gap-1 text-sm text-gray-600 mb-2">
                                  <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-gray-400"/>{lab.email}</span>
                                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-gray-400"/>{lab.city || 'N/D'}</span>
                                  <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-gray-400"/>{lab.phone || 'N/D'}</span>
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                  <span>Richieste: <strong>{lab.stats?.totalRequests || 0}</strong></span>
                                  <span>Completate: <strong className="text-green-600">{lab.stats?.completedRequests || 0}</strong></span>
                                  <span>Referti: <strong className="text-blue-600">{lab.stats?.totalReports || 0}</strong></span>
                                  <span>Connessioni: <strong>{lab.stats?.totalConnections || 0}</strong></span>
                                </div>
                                {/* Billing info */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {lab.billing?.trialExpired ? (
                                    <Badge className="bg-red-100 text-red-700 text-xs">Trial scaduto</Badge>
                                  ) : lab.billing?.daysRemaining > 0 ? (
                                    <Badge className="bg-blue-100 text-blue-700 text-xs">{lab.billing.daysRemaining}gg rimanenti</Badge>
                                  ) : null}
                                  <Badge className="bg-gray-100 text-gray-600 text-xs">{lab.billing?.requestsRemaining ?? 0}/{lab.billing?.maxFreeRequests ?? 50} richieste rimaste</Badge>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => openLabBilling(lab)}>
                                <CreditCard className="h-4 w-4 mr-1" /> Billing
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Requests by Exam Type */}
                {labStats?.requestsByExamType?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Richieste per Tipo Esame</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-2">
                        {labStats.requestsByExamType.map((item) => (
                          <div key={item.examType} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm capitalize">{item.examType?.replace(/_/g, ' ') || 'N/D'}</span>
                            <Badge className="bg-purple-100 text-purple-700">{item.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* ========== TAB: PIATTAFORMA ========== */}
          <TabsContent value="piattaforma">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-coral-500" />
              </div>
            ) : platformStats ? (
              <div className="space-y-6">
                {/* Main Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                      <p className="text-3xl font-bold text-gray-900">{platformStats.counts?.totalUsers || 0}</p>
                      <p className="text-xs text-gray-500">Utenti Totali</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Building2 className="h-6 w-6 text-coral-500 mx-auto mb-1" />
                      <p className="text-3xl font-bold text-coral-600">{platformStats.counts?.clinics || 0}</p>
                      <p className="text-xs text-gray-500">Cliniche</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-6 w-6 text-green-500 mx-auto mb-1" />
                      <p className="text-3xl font-bold text-green-600">{platformStats.counts?.owners || 0}</p>
                      <p className="text-xs text-gray-500">Proprietari</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <PawPrint className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                      <p className="text-3xl font-bold text-purple-600">{platformStats.counts?.pets || 0}</p>
                      <p className="text-xs text-gray-500">Pazienti</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                      <p className="text-3xl font-bold text-amber-600">{platformStats.counts?.appointments || 0}</p>
                      <p className="text-xs text-gray-500">Appuntamenti</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileText className="h-6 w-6 text-indigo-500 mx-auto mb-1" />
                      <p className="text-3xl font-bold text-indigo-600">{platformStats.counts?.documents || 0}</p>
                      <p className="text-xs text-gray-500">Documenti</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Registrazioni Recenti (7gg)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-green-600 mb-2">{platformStats.recentRegistrations || 0}</p>
                      <p className="text-sm text-gray-500">nuovi utenti negli ultimi 7 giorni</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-amber-500" />
                        Appuntamenti per Stato
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(platformStats.appointmentsByStatus || []).length > 0 ? (
                        <div className="space-y-2">
                          {platformStats.appointmentsByStatus.map((s) => (
                            <div key={s._id} className="flex justify-between items-center text-sm">
                              <span className="capitalize text-gray-600">{s._id || 'N/D'}</span>
                              <Badge className="bg-gray-100 text-gray-700">{s.count}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Nessun dato disponibile</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Users */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Ultimi Utenti Registrati</CardTitle>
                      <Button variant="outline" size="sm" onClick={loadPlatformStats}><RefreshCw className="h-4 w-4 mr-1" /> Aggiorna</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(platformStats.recentUsers || []).length > 0 ? (
                      <div className="space-y-2">
                        {platformStats.recentUsers.map((u) => (
                          <div key={u.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${u.role === 'clinic' ? 'bg-coral-500' : u.role === 'owner' ? 'bg-green-500' : u.role === 'lab' ? 'bg-purple-500' : 'bg-gray-500'}`}>
                                {(u.name || u.clinicName || u.labName || '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{u.name || u.clinicName || u.labName || 'N/D'}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={`text-xs ${u.role === 'clinic' ? 'bg-coral-100 text-coral-700' : u.role === 'owner' ? 'bg-green-100 text-green-700' : u.role === 'lab' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</Badge>
                              <p className="text-xs text-gray-400 mt-1">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('it-IT') : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4">Nessun utente registrato</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card><CardContent className="p-12 text-center text-gray-500"><BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Nessun dato piattaforma disponibile</p></CardContent></Card>
            )}
          </TabsContent>

          {/* ========== TAB: STRIPE ========== */}
          <TabsContent value="stripe">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-green-500" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stripe Connection Status */}
                <Card className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Stripe Integration</h3>
                          <p className="text-sm text-gray-500">Gestione abbonamenti e pagamenti</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-700">Connesso (Live Mode)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-gray-900">{stripeTransactions.length}</p>
                      <p className="text-sm text-gray-500">Utenti con Abbonamento</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-coral-600">{stripeTransactions.filter(u => u.subscriptionPlan === 'pro').length}</p>
                      <p className="text-sm text-gray-500">Piano Pro</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-gray-600">{stripeTransactions.filter(u => u.subscriptionPlan === 'starter').length}</p>
                      <p className="text-sm text-gray-500">Piano Starter</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-purple-600">{stripeTransactions.filter(u => u.subscriptionPlan === 'lab_partner').length}</p>
                      <p className="text-sm text-gray-500">Lab Partner</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Pricing Reference */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Piani Tariffari Attivi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg border bg-gray-50">
                        <p className="font-semibold text-gray-700">Starter Clinica</p>
                        <p className="text-2xl font-bold text-gray-900">Gratis</p>
                        <p className="text-xs text-gray-500">1 utente, 50 pazienti</p>
                      </div>
                      <div className="p-3 rounded-lg border-2 border-coral-300 bg-coral-50">
                        <p className="font-semibold text-coral-700">Pro Clinica</p>
                        <p className="text-2xl font-bold text-coral-600">€79<span className="text-sm font-normal">/mese</span></p>
                        <p className="text-xs text-gray-500">90gg trial gratuito</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-purple-50">
                        <p className="font-semibold text-purple-700">Lab Partner</p>
                        <p className="text-2xl font-bold text-purple-600">€29<span className="text-sm font-normal">/mese</span></p>
                        <p className="text-xs text-gray-500">180gg trial gratuito</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-indigo-50">
                        <p className="font-semibold text-indigo-700">Enterprise</p>
                        <p className="text-2xl font-bold text-indigo-600">Custom</p>
                        <p className="text-xs text-gray-500">Contattaci</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Subscribers List */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Utenti con Abbonamento/Stripe</CardTitle>
                      <Button variant="outline" size="sm" onClick={loadStripeData}><RefreshCw className="h-4 w-4 mr-1" /> Aggiorna</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {stripeTransactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                        <p>Nessun abbonato trovato</p>
                        <p className="text-xs text-gray-400 mt-1">Gli utenti appariranno qui dopo il checkout Stripe</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {stripeTransactions.map((u) => (
                          <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${u.role === 'clinic' ? 'bg-coral-500' : u.role === 'lab' ? 'bg-purple-500' : 'bg-gray-500'}`}>
                                {(u.name || u.clinicName || u.labName || '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{u.name || u.clinicName || u.labName || 'N/D'}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <Badge className={`text-xs ${u.subscriptionPlan === 'pro' ? 'bg-coral-100 text-coral-700' : u.subscriptionPlan === 'lab_partner' ? 'bg-purple-100 text-purple-700' : u.subscriptionPlan === 'starter' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {u.subscriptionPlan || 'N/D'}
                                </Badge>
                                <p className="text-xs text-gray-400 mt-1">
                                  {u.subscriptionStatus === 'active' ? '✅ Attivo' : u.subscriptionStatus === 'trialing' ? '⏳ In prova' : u.subscriptionStatus === 'canceled' ? '❌ Cancellato' : u.subscriptionStatus || 'Nessuno'}
                                </p>
                              </div>
                              {u.stripeCustomerId && (
                                <Badge className="bg-indigo-100 text-indigo-700 text-xs font-mono">{u.stripeCustomerId.substring(0, 14)}...</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stripe Config Info */}
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Configurazione Stripe</h4>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Modalità:</span>{' '}
                        <Badge className="bg-green-100 text-green-700">Live Mode ✅</Badge>
                      </div>
                      <div>
                        <span className="text-gray-500">Checkout endpoint:</span>{' '}
                        <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">/api/payments/checkout</code>
                      </div>
                      <div>
                        <span className="text-gray-500">Webhook:</span>{' '}
                        <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">/api/webhook/stripe</code>
                      </div>
                      <div>
                        <span className="text-gray-500">Valuta:</span>{' '}
                        <span className="font-medium">EUR (€)</span>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                      <strong>✅ Produzione attiva:</strong> Le chiavi Live sono configurate. I pagamenti reali sono abilitati. Webhook con verifica firma attivo.
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>

      {/* ===== DIALOGS (fuori dal Tabs) ===== */}

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

      {/* Reject Dialog */}
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

      {/* Lab Billing Dialog */}
      <Dialog open={showLabBillingDialog} onOpenChange={setShowLabBillingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-500" />
              Gestione Billing - {selectedLabForBilling?.labName || selectedLabForBilling?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedLabForBilling && (
            <div className="space-y-4">
              {/* Current billing status */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Stato Attuale</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Piano:</span> <strong>{selectedLabForBilling.billing?.plan || 'partner_free'}</strong></div>
                  <div><span className="text-gray-500">Giorni rimasti:</span> <strong>{selectedLabForBilling.billing?.daysRemaining || 0}</strong></div>
                  <div><span className="text-gray-500">Richieste usate:</span> <strong>{selectedLabForBilling.billing?.requestsCount || 0}</strong></div>
                  <div><span className="text-gray-500">Limite:</span> <strong>{selectedLabForBilling.billing?.maxFreeRequests || 50}</strong></div>
                </div>
              </div>
              
              {/* Extend trial */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Estendi Trial (giorni)</label>
                <Input
                  type="number"
                  min="0"
                  value={billingForm.extendTrialDays}
                  onChange={(e) => setBillingForm(f => ({...f, extendTrialDays: parseInt(e.target.value) || 0}))}
                />
              </div>
              
              {/* Max free requests */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Limite Richieste Gratuite</label>
                <Input
                  type="number"
                  min="0"
                  value={billingForm.maxFreeRequests}
                  onChange={(e) => setBillingForm(f => ({...f, maxFreeRequests: parseInt(e.target.value) || 0}))}
                />
              </div>
              
              {/* Reset counter */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={billingForm.resetRequestsCount}
                  onChange={(e) => setBillingForm(f => ({...f, resetRequestsCount: e.target.checked}))}
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm text-gray-700">Azzera contatore richieste</span>
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLabBillingDialog(false)}>Annulla</Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleLabBilling} disabled={billingLoading}>
              {billingLoading ? <><RefreshCw className="h-4 w-4 animate-spin mr-2"/>Salvataggio...</> : 'Salva Modifiche'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
