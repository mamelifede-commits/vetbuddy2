'use client';

import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Activity, AlertTriangle, ArrowLeft, BarChart3, Building2, Calendar, Cat, Check, CheckCircle, 
  ChevronRight, ClipboardList, Clock, CreditCard, Dog, Edit3, 
  Eye, FileCheck, FileText, FlaskConical, Hash, LayoutDashboard, 
  Link2, LogOut, MapPin, Menu, Package, PawPrint, Phone, 
  RefreshCw, Search, ShieldAlert, ShieldCheck, 
  Star, Trash2, User, Users, X, Zap
} from 'lucide-react';
import api from '@/app/lib/api';
import { NewBrandLogo } from '@/app/components/shared/utils';

// ============ HELPER COMPONENTS (module-level) ============

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs font-medium text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-right">{value || <span className="text-gray-300">N/D</span>}</span>
    </div>
  );
}

function LabStatusBadge({ status }) {
  const map = {
    'active': { label: 'Attivo', cls: 'bg-green-100 text-green-700 border-green-200' },
    'pending_approval': { label: 'In Attesa', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    'suspended': { label: 'Sospeso', cls: 'bg-red-100 text-red-700 border-red-200' },
    'rejected': { label: 'Rifiutato', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  };
  const info = map[status] || { label: status || 'N/D', cls: 'bg-gray-100 text-gray-600' };
  return <Badge variant="outline" className={`${info.cls} text-xs font-medium`}>{info.label}</Badge>;
}

function RequestStatusBadge({ status }) {
  const map = {
    'pending': { label: 'In Attesa', c: 'bg-yellow-100 text-yellow-700' },
    'received': { label: 'Ricevuto', c: 'bg-blue-100 text-blue-700' },
    'sample_waiting': { label: 'Campione Atteso', c: 'bg-orange-100 text-orange-700' },
    'sample_received': { label: 'Campione Ricevuto', c: 'bg-cyan-100 text-cyan-700' },
    'in_progress': { label: 'In Analisi', c: 'bg-indigo-100 text-indigo-700' },
    'report_ready': { label: 'Referto Pronto', c: 'bg-purple-100 text-purple-700' },
    'completed': { label: 'Completato', c: 'bg-green-100 text-green-700' },
    'cancelled': { label: 'Annullato', c: 'bg-red-100 text-red-700' },
  };
  const info = map[status] || { label: status, c: 'bg-gray-100 text-gray-700' };
  return <Badge className={`${info.c} text-xs`}>{info.label}</Badge>;
}

function StatCard({ icon: Icon, label, value, color = 'text-purple-500', bgColor = 'bg-purple-50', onClick, subtitle }) {
  return (
    <Card className={`${onClick ? 'cursor-pointer hover:shadow-lg' : ''} transition-all duration-200 border-0 shadow-sm`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className={`${bgColor} rounded-xl p-3`}><Icon className={`h-5 w-5 ${color}`} /></div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ MAIN COMPONENT ============

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, clinics: 0, owners: 0, pets: 0, appointments: 0, documents: 0, labs: 0 });
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [labRequestsData, setLabRequestsData] = useState({ requests: [], stats: { total: 0, pending: 0, reportReady: 0, completed: 0 } });
  const [labStats, setLabStats] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lab management state
  const [labSubTab, setLabSubTab] = useState('overview');
  const [selectedLabDetail, setSelectedLabDetail] = useState(null);
  const [labDetailLoading, setLabDetailLoading] = useState(false);
  const [labSearchQuery, setLabSearchQuery] = useState('');
  const [labStatusFilter, setLabStatusFilter] = useState('all');
  const [labSortBy, setLabSortBy] = useState('createdAt');

  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalData, setStatusModalData] = useState({ labId: '', labName: '', action: '', reason: '' });
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingModalData, setBillingModalData] = useState({ labId: '', labName: '', extendDays: 30, maxRequests: 50, resetCount: false });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadAllData(); }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [usersData, appointmentsData, petsData, documentsData, labsData, labReqData, labStatsData] = await Promise.all([
        api.get('admin/users'),
        api.get('admin/appointments'),
        api.get('admin/pets'),
        api.get('admin/documents'),
        api.get('admin/labs').catch(() => []),
        api.get('admin/lab-requests').catch(() => ({ requests: [], stats: { total: 0, pending: 0, reportReady: 0, completed: 0 } })),
        api.get('admin/lab-stats').catch(() => null)
      ]);
      setUsers(usersData || []);
      setAppointments(appointmentsData || []);
      setPets(petsData || []);
      setDocuments(documentsData || []);
      setLabs(labsData || []);
      setLabRequestsData(labReqData || { requests: [], stats: {} });
      setLabStats(labStatsData);
      const clinics = (usersData || []).filter(u => u.role === 'clinic');
      const owners = (usersData || []).filter(u => u.role === 'owner');
      const labUsers = (usersData || []).filter(u => u.role === 'lab');
      setStats({ users: (usersData || []).length, clinics: clinics.length, owners: owners.length, pets: (petsData || []).length, appointments: (appointmentsData || []).length, documents: (documentsData || []).length, labs: labUsers.length });
    } catch (error) { console.error('Error loading admin data:', error); }
    setLoading(false);
  }

  async function handleDeleteUser(userId) {
    if (!confirm('Sei sicuro di voler eliminare questo utente e tutti i dati associati?')) return;
    try { await api.delete(`admin/users/${userId}`); loadAllData(); } catch (error) { alert('Errore eliminazione: ' + error.message); }
  }

  async function loadLabDetail(labId) {
    setLabDetailLoading(true);
    try {
      const detail = await api.get(`admin/labs/${labId}/details`);
      setSelectedLabDetail(detail);
    } catch (error) { console.error('Error loading lab details:', error); alert('Errore nel caricamento dettagli laboratorio'); }
    setLabDetailLoading(false);
  }

  async function handleUpdateLabStatus() {
    setActionLoading(true);
    try {
      await api.post(`admin/labs/${statusModalData.labId}/status`, { status: statusModalData.action, reason: statusModalData.reason });
      setShowStatusModal(false);
      setStatusModalData({ labId: '', labName: '', action: '', reason: '' });
      await loadAllData();
      if (selectedLabDetail?.lab?.id === statusModalData.labId) await loadLabDetail(statusModalData.labId);
    } catch (error) { alert('Errore aggiornamento stato: ' + error.message); }
    setActionLoading(false);
  }

  async function handleUpdateBilling() {
    setActionLoading(true);
    try {
      await api.post(`admin/labs/${billingModalData.labId}/billing`, {
        extendTrialDays: billingModalData.extendDays > 0 ? billingModalData.extendDays : undefined,
        maxFreeRequests: billingModalData.maxRequests,
        resetRequestsCount: billingModalData.resetCount
      });
      setShowBillingModal(false);
      setBillingModalData({ labId: '', labName: '', extendDays: 30, maxRequests: 50, resetCount: false });
      await loadAllData();
      if (selectedLabDetail?.lab?.id === billingModalData.labId) await loadLabDetail(billingModalData.labId);
    } catch (error) { alert('Errore aggiornamento billing: ' + error.message); }
    setActionLoading(false);
  }

  const filteredLabs = useMemo(() => {
    let result = [...labs];
    if (labStatusFilter !== 'all') {
      result = result.filter(l => {
        if (labStatusFilter === 'active') return l.status === 'active' || l.isApproved === true;
        if (labStatusFilter === 'pending') return l.status === 'pending_approval';
        if (labStatusFilter === 'suspended') return l.status === 'suspended';
        if (labStatusFilter === 'rejected') return l.status === 'rejected';
        return true;
      });
    }
    if (labSearchQuery.trim()) {
      const q = labSearchQuery.toLowerCase();
      result = result.filter(l => (l.labName || l.name || '').toLowerCase().includes(q) || (l.email || '').toLowerCase().includes(q) || (l.city || '').toLowerCase().includes(q) || (l.vatNumber || '').toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      if (labSortBy === 'name') return (a.labName || a.name || '').localeCompare(b.labName || b.name || '');
      if (labSortBy === 'requests') return (b.stats?.totalRequests || 0) - (a.stats?.totalRequests || 0);
      if (labSortBy === 'connections') return (b.stats?.totalConnections || 0) - (a.stats?.totalConnections || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    return result;
  }, [labs, labStatusFilter, labSearchQuery, labSortBy]);

  const pendingLabs = useMemo(() => labs.filter(l => l.status === 'pending_approval'), [labs]);

  // ========= Helper to open modals =========
  function openStatusModal(labId, labName, action) {
    setStatusModalData({ labId, labName, action, reason: '' });
    setShowStatusModal(true);
  }
  function openBillingModal(labId, labName, maxReq) {
    setBillingModalData({ labId, labName, extendDays: 30, maxRequests: maxReq || 50, resetCount: false });
    setShowBillingModal(true);
  }

  // ========= SIDEBAR NAV ITEM =========
  function NavItem({ icon: Icon, label, value, badge }) {
    return (
      <button onClick={() => { setActiveTab(value); setMobileMenuOpen(false); }} 
        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${activeTab === value ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
        <div className="flex items-center gap-3"><Icon className="h-5 w-5" />{label}</div>
        {badge > 0 && <Badge className="bg-purple-500 text-white text-xs">{badge}</Badge>}
      </button>
    );
  }

  // ============ LAB DETAIL VIEW (shown as a separate full-screen page) ============
  if (selectedLabDetail) {
    const { lab: detailLab, connections, priceList, stats: labDetailStats, recentRequests, integration, billing } = selectedLabDetail;
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedLabDetail(null)}><ArrowLeft className="h-4 w-4 mr-1" /> Torna</Button>
              <div className="h-6 w-px bg-gray-200" />
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                {(detailLab?.labName || detailLab?.name || '?')[0].toUpperCase()}
              </div>
              <div><h1 className="font-bold text-lg">{detailLab?.labName || detailLab?.name}</h1><p className="text-xs text-gray-500">{detailLab?.email}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <LabStatusBadge status={detailLab?.status} />
              {detailLab?.status === 'pending_approval' && (
                <>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openStatusModal(detailLab.id, detailLab.labName || detailLab.name, 'active')}><Check className="h-4 w-4 mr-1" /> Approva</Button>
                  <Button size="sm" variant="destructive" onClick={() => openStatusModal(detailLab.id, detailLab.labName || detailLab.name, 'rejected')}><X className="h-4 w-4 mr-1" /> Rifiuta</Button>
                </>
              )}
              {detailLab?.status === 'active' && (
                <Button size="sm" variant="outline" className="text-amber-600 border-amber-300 hover:bg-amber-50" onClick={() => openStatusModal(detailLab.id, detailLab.labName || detailLab.name, 'suspended')}><ShieldAlert className="h-4 w-4 mr-1" /> Sospendi</Button>
              )}
              {detailLab?.status === 'suspended' && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openStatusModal(detailLab.id, detailLab.labName || detailLab.name, 'active')}><ShieldCheck className="h-4 w-4 mr-1" /> Riattiva</Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard icon={Package} label="Richieste" value={labDetailStats?.totalRequests || 0} color="text-blue-500" bgColor="bg-blue-50" />
            <StatCard icon={Clock} label="In Corso" value={labDetailStats?.pendingRequests || 0} color="text-amber-500" bgColor="bg-amber-50" />
            <StatCard icon={CheckCircle} label="Completate" value={labDetailStats?.completedRequests || 0} color="text-green-500" bgColor="bg-green-50" />
            <StatCard icon={FileCheck} label="Referti" value={labDetailStats?.totalReports || 0} color="text-purple-500" bgColor="bg-purple-50" />
            <StatCard icon={Link2} label="Connessioni" value={connections?.length || 0} color="text-indigo-500" bgColor="bg-indigo-50" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Profile + Billing + Integration */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-violet-500" /> Profilo</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow label="Nome" value={detailLab?.labName || detailLab?.name} />
                  <InfoRow label="Email" value={detailLab?.email} />
                  <InfoRow label="Telefono" value={detailLab?.phone} />
                  <InfoRow label="Referente" value={detailLab?.contactPerson} />
                  <InfoRow label="P.IVA" value={detailLab?.vatNumber} />
                  <InfoRow label="Indirizzo" value={detailLab?.address} />
                  <InfoRow label="Città" value={detailLab?.city} />
                  <InfoRow label="Provincia" value={detailLab?.province} />
                  <InfoRow label="Ritiro Campioni" value={detailLab?.pickupAvailable ? `Sì - ${detailLab?.pickupDays || ''} ${detailLab?.pickupHours || ''}` : 'No'} />
                  <InfoRow label="Tempi Referto" value={detailLab?.averageReportTime} />
                  <InfoRow label="Registrato" value={detailLab?.createdAt ? new Date(detailLab.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/D'} />
                  {detailLab?.specializations?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Specializzazioni</p>
                      <div className="flex flex-wrap gap-1">{detailLab.specializations.map((s, i) => <Badge key={i} variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">{s}</Badge>)}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Billing */}
              <Card className={billing?.trialExpired || billing?.requestsExhausted ? 'border-red-200 bg-red-50/30' : billing?.daysRemaining <= 30 || billing?.requestsRemaining <= 10 ? 'border-amber-200 bg-amber-50/30' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4 text-green-500" /> Billing</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => openBillingModal(detailLab.id, detailLab.labName || detailLab.name, billing?.maxFreeRequests)}><Edit3 className="h-3 w-3 mr-1" /> Modifica</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Piano</span><Badge className="bg-violet-100 text-violet-700">{billing?.plan === 'partner_free' ? 'Partner Free' : billing?.plan || 'N/D'}</Badge></div>
                  <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Trial attivo fino al</span><span className="text-sm font-medium">{billing?.freeUntil ? new Date(billing.freeUntil).toLocaleDateString('it-IT') : 'N/D'}</span></div>
                  <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Giorni rimanenti</span><span className={`text-sm font-bold ${billing?.daysRemaining <= 30 ? 'text-amber-600' : 'text-green-600'}`}>{billing?.trialExpired ? <span className="text-red-600">Scaduto</span> : `${billing?.daysRemaining || 0}g`}</span></div>
                  <div>
                    <div className="flex items-center justify-between mb-1"><span className="text-sm text-gray-500">Richieste utilizzate</span><span className="text-sm font-medium">{billing?.requestsCount || 0} / {billing?.maxFreeRequests || 50}</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${(billing?.requestsCount || 0) / (billing?.maxFreeRequests || 50) > 0.8 ? 'bg-red-500' : (billing?.requestsCount || 0) / (billing?.maxFreeRequests || 50) > 0.5 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, ((billing?.requestsCount || 0) / (billing?.maxFreeRequests || 50)) * 100)}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-amber-500" /> Integrazione</CardTitle></CardHeader>
                <CardContent>
                  {integration ? (
                    <div className="space-y-2">
                      <InfoRow label="Tipo" value={integration.integrationType || 'Manuale'} />
                      <InfoRow label="Auto-Sync" value={integration.autoSync ? 'Attivo' : 'Disattivo'} />
                      {integration.apiEndpoint && <InfoRow label="Endpoint" value={integration.apiEndpoint} />}
                    </div>
                  ) : <p className="text-sm text-gray-400 text-center py-4">Nessuna integrazione configurata</p>}
                </CardContent>
              </Card>
            </div>

            {/* Right: Connections + Price List + Requests */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Link2 className="h-4 w-4 text-indigo-500" /> Cliniche Collegate ({connections?.length || 0})</CardTitle></CardHeader>
                <CardContent>
                  {connections?.length > 0 ? (
                    <div className="space-y-2">
                      {connections.map(conn => (
                        <div key={conn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div><p className="font-medium text-sm">{conn.clinicName}</p><p className="text-xs text-gray-500">{conn.clinicEmail} {conn.clinicCity ? `• ${conn.clinicCity}` : ''}</p></div>
                          <Badge className={conn.status === 'active' ? 'bg-green-100 text-green-700' : conn.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}>{conn.status === 'active' ? 'Attivo' : conn.status === 'pending' ? 'In Attesa' : conn.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-400 text-center py-4">Nessuna clinica collegata</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-green-500" /> Listino Prezzi ({priceList?.length || 0})</CardTitle></CardHeader>
                <CardContent>
                  {priceList?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr><th className="text-left p-2 font-medium">Esame</th><th className="text-left p-2 font-medium">Tipo</th><th className="text-right p-2 font-medium">Prezzo</th><th className="text-left p-2 font-medium">Tempi</th></tr></thead>
                        <tbody>
                          {priceList.map(item => (
                            <tr key={item.id} className="border-t">
                              <td className="p-2 font-medium">{item.title || item.examType}</td>
                              <td className="p-2 text-gray-500">{item.examType}</td>
                              <td className="p-2 text-right">{item.priceOnRequest ? <Badge variant="outline" className="text-xs">Su richiesta</Badge> : <span className="font-medium">€{item.priceFrom}{item.priceTo ? `-${item.priceTo}` : ''}</span>}</td>
                              <td className="p-2 text-gray-500">{item.averageDeliveryTime || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className="text-sm text-gray-400 text-center py-4">Nessun listino caricato</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4 text-blue-500" /> Ultime Richieste</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {recentRequests?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr><th className="text-left p-3 font-medium">Codice</th><th className="text-left p-3 font-medium">Esame</th><th className="text-left p-3 font-medium">Paziente</th><th className="text-left p-3 font-medium">Clinica</th><th className="text-left p-3 font-medium">Stato</th><th className="text-left p-3 font-medium">Data</th></tr></thead>
                        <tbody>
                          {recentRequests.map(req => (
                            <tr key={req.id} className="border-t hover:bg-gray-50">
                              <td className="p-3"><code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{req.sampleCode || '-'}</code></td>
                              <td className="p-3 font-medium">{req.examName || req.examType || '-'}</td>
                              <td className="p-3">{req.petName || '-'}</td>
                              <td className="p-3">{req.clinicName || '-'}</td>
                              <td className="p-3"><RequestStatusBadge status={req.status} /></td>
                              <td className="p-3 text-gray-500">{req.createdAt ? new Date(req.createdAt).toLocaleDateString('it-IT') : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className="text-sm text-gray-400 text-center py-6">Nessuna richiesta</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Modals */}
        <StatusModal show={showStatusModal} onClose={() => setShowStatusModal(false)} data={statusModalData} setData={setStatusModalData} onConfirm={handleUpdateLabStatus} loading={actionLoading} />
        <BillingModal show={showBillingModal} onClose={() => setShowBillingModal(false)} data={billingModalData} setData={setBillingModalData} onConfirm={handleUpdateBilling} loading={actionLoading} />
        {labDetailLoading && <LoadingOverlay />}
      </div>
    );
  }

  // ============ MAIN DASHBOARD RETURN ============
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <NewBrandLogo size="xs" showText={false} />
          <div><h1 className="font-bold text-sm"><span className="text-gray-900">vet</span><span className="text-purple-600">buddy</span> <span className="text-purple-400">Admin</span></h1><p className="text-xs text-gray-500">Pannello di controllo</p></div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-gray-100 rounded-lg">{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
      </div>
      {mobileMenuOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-[55]" onClick={() => setMobileMenuOpen(false)} />
          <div className="md:hidden fixed left-0 right-0 top-[57px] bottom-0 bg-white z-[60] p-4 overflow-y-auto shadow-xl">
            <Badge className="mb-4 bg-purple-100 text-purple-700">👑 Amministratore</Badge>
            <nav className="space-y-1">
              <NavItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
              <NavItem icon={Users} label="Utenti" value="users" badge={stats.users} />
              <NavItem icon={Building2} label="Cliniche" value="clinics" badge={stats.clinics} />
              <NavItem icon={User} label="Proprietari" value="owners" badge={stats.owners} />
              <NavItem icon={Calendar} label="Appuntamenti" value="appointments" badge={stats.appointments} />
              <NavItem icon={PawPrint} label="Animali" value="pets" badge={stats.pets} />
              <NavItem icon={FileText} label="Documenti" value="documents" badge={stats.documents} />
              <NavItem icon={FlaskConical} label="Laboratori" value="labs" badge={pendingLabs.length || stats.labs} />
            </nav>
            <Button variant="ghost" onClick={onLogout} className="mt-6 text-gray-600 w-full justify-start"><LogOut className="h-4 w-4 mr-2" />Esci</Button>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r p-4 flex-col flex-shrink-0 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-4">
          <NewBrandLogo size="sm" showText={false} />
          <div><h1 className="font-bold"><span className="text-gray-900">vet</span><span className="text-purple-600">buddy</span></h1><p className="text-xs text-gray-500">Pannello Admin</p></div>
        </div>
        <Badge className="mb-6 bg-purple-100 text-purple-700 justify-center">👑 Amministratore</Badge>
        <nav className="space-y-1 flex-1 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
          <NavItem icon={Users} label="Tutti gli Utenti" value="users" badge={stats.users} />
          <NavItem icon={Building2} label="Cliniche" value="clinics" badge={stats.clinics} />
          <NavItem icon={User} label="Proprietari" value="owners" badge={stats.owners} />
          <NavItem icon={Calendar} label="Appuntamenti" value="appointments" badge={stats.appointments} />
          <NavItem icon={PawPrint} label="Animali" value="pets" badge={stats.pets} />
          <NavItem icon={FileText} label="Documenti" value="documents" badge={stats.documents} />
          <NavItem icon={FlaskConical} label="Laboratori" value="labs" badge={pendingLabs.length > 0 ? pendingLabs.length : stats.labs} />
        </nav>
        <Button variant="ghost" onClick={onLogout} className="mt-auto text-gray-600"><LogOut className="h-4 w-4 mr-2" />Esci</Button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="text-center"><RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-500" /><p className="mt-2 text-gray-500">Caricamento dati...</p></div></div>
        ) : (
          <>
            {/* ===== DASHBOARD TAB ===== */}
            {activeTab === 'dashboard' && (
              <div>
                <h1 className="text-2xl font-bold mb-6">📊 Dashboard Amministratore</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
                  <StatCard icon={Users} label="Utenti" value={stats.users} onClick={() => setActiveTab('users')} />
                  <StatCard icon={Building2} label="Cliniche" value={stats.clinics} color="text-blue-500" bgColor="bg-blue-50" onClick={() => setActiveTab('clinics')} />
                  <StatCard icon={User} label="Proprietari" value={stats.owners} color="text-green-500" bgColor="bg-green-50" onClick={() => setActiveTab('owners')} />
                  <StatCard icon={PawPrint} label="Animali" value={stats.pets} color="text-orange-500" bgColor="bg-orange-50" onClick={() => setActiveTab('pets')} />
                  <StatCard icon={Calendar} label="Appuntamenti" value={stats.appointments} color="text-rose-500" bgColor="bg-rose-50" onClick={() => setActiveTab('appointments')} />
                  <StatCard icon={FileText} label="Documenti" value={stats.documents} color="text-indigo-500" bgColor="bg-indigo-50" onClick={() => setActiveTab('documents')} />
                  <StatCard icon={FlaskConical} label="Laboratori" value={stats.labs} color="text-violet-500" bgColor="bg-violet-50" onClick={() => setActiveTab('labs')} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle className="text-lg">🏥 Ultime Cliniche</CardTitle></CardHeader>
                    <CardContent>{users.filter(u => u.role === 'clinic').slice(0, 5).map(c => (<div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0"><div><p className="font-medium">{c.clinicName || c.name}</p><p className="text-xs text-gray-500">{c.email}</p></div><Badge variant="outline">{c.city || 'N/A'}</Badge></div>))}</CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-lg">📅 Ultimi Appuntamenti</CardTitle></CardHeader>
                    <CardContent>{appointments.slice(0, 5).map(a => (<div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0"><div><p className="font-medium">{a.petName || 'N/A'}</p><p className="text-xs text-gray-500">{a.service}</p></div><Badge className={a.status === 'confermato' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{a.date}</Badge></div>))}</CardContent>
                  </Card>
                </div>
                {pendingLabs.length > 0 && (
                  <Card className="mt-6 border-amber-200 bg-amber-50/50 cursor-pointer hover:shadow-md" onClick={() => { setActiveTab('labs'); setLabSubTab('pending'); }}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="bg-amber-100 rounded-xl p-3"><AlertTriangle className="h-6 w-6 text-amber-600" /></div>
                      <div><p className="font-bold text-amber-800">⚠️ {pendingLabs.length} laboratori in attesa di approvazione</p><p className="text-sm text-amber-600">Clicca per revisionare</p></div>
                      <ChevronRight className="h-5 w-5 text-amber-400 ml-auto" />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ===== USERS TAB ===== */}
            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">👥 Tutti gli Utenti</h1><Badge variant="outline">{users.length} totali</Badge></div>
                <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="text-left p-4 font-medium">Nome</th><th className="text-left p-4 font-medium">Email</th><th className="text-left p-4 font-medium">Ruolo</th><th className="text-left p-4 font-medium">Data</th><th className="text-left p-4 font-medium">Azioni</th></tr></thead>
                <tbody>{users.map(u => (<tr key={u.id} className="border-t"><td className="p-4">{u.name || u.clinicName || u.labName || '-'}</td><td className="p-4 text-gray-600">{u.email}</td><td className="p-4"><Badge className={u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'clinic' ? 'bg-blue-100 text-blue-700' : u.role === 'lab' ? 'bg-violet-100 text-violet-700' : 'bg-green-100 text-green-700'}>{u.role}</Badge></td><td className="p-4 text-gray-500 text-sm">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('it-IT') : '-'}</td><td className="p-4">{u.role !== 'admin' && <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteUser(u.id)}><Trash2 className="h-4 w-4" /></Button>}</td></tr>))}</tbody></table></div></CardContent></Card>
              </div>
            )}

            {/* ===== CLINICS TAB ===== */}
            {activeTab === 'clinics' && (
              <div>
                <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">🏥 Cliniche</h1><Badge variant="outline">{stats.clinics} registrate</Badge></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.filter(u => u.role === 'clinic').map(c => (<Card key={c.id}><CardContent className="p-4"><div className="flex items-start justify-between"><div><h3 className="font-bold">{c.clinicName || c.name}</h3><p className="text-sm text-gray-500">{c.email}</p><p className="text-sm text-gray-500 mt-1"><MapPin className="h-3 w-3 inline mr-1" />{c.city || 'N/A'}</p>{c.phone && <p className="text-sm text-gray-500"><Phone className="h-3 w-3 inline mr-1" />{c.phone}</p>}</div><Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteUser(c.id)}><Trash2 className="h-4 w-4" /></Button></div></CardContent></Card>))}
                </div>
              </div>
            )}

            {/* ===== OWNERS TAB ===== */}
            {activeTab === 'owners' && (
              <div>
                <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">👤 Proprietari</h1><Badge variant="outline">{stats.owners} registrati</Badge></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.filter(u => u.role === 'owner').map(o => (<Card key={o.id}><CardContent className="p-4"><div className="flex items-start justify-between"><div><h3 className="font-bold">{o.name}</h3><p className="text-sm text-gray-500">{o.email}</p>{o.phone && <p className="text-sm text-gray-500"><Phone className="h-3 w-3 inline mr-1" />{o.phone}</p>}{o.city && <p className="text-sm text-gray-500"><MapPin className="h-3 w-3 inline mr-1" />{o.city}</p>}</div><Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteUser(o.id)}><Trash2 className="h-4 w-4" /></Button></div></CardContent></Card>))}
                </div>
              </div>
            )}

            {/* ===== APPOINTMENTS TAB ===== */}
            {activeTab === 'appointments' && (
              <div>
                <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">📅 Appuntamenti</h1><Badge variant="outline">{appointments.length} totali</Badge></div>
                <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="text-left p-4 font-medium">Data</th><th className="text-left p-4 font-medium">Ora</th><th className="text-left p-4 font-medium">Animale</th><th className="text-left p-4 font-medium">Servizio</th><th className="text-left p-4 font-medium">Stato</th></tr></thead>
                <tbody>{appointments.map(a => (<tr key={a.id} className="border-t"><td className="p-4">{a.date}</td><td className="p-4">{a.time}</td><td className="p-4">{a.petName || '-'}</td><td className="p-4">{a.service}</td><td className="p-4"><Badge className={a.status === 'confermato' ? 'bg-green-100 text-green-700' : a.status === 'completato' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}>{a.status}</Badge></td></tr>))}</tbody></table></div></CardContent></Card>
              </div>
            )}

            {/* ===== PETS TAB ===== */}
            {activeTab === 'pets' && (
              <div>
                <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">🐾 Animali</h1><Badge variant="outline">{pets.length} registrati</Badge></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pets.map(p => (<Card key={p.id}><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">{p.species === 'Cane' ? <Dog className="h-6 w-6 text-orange-600" /> : <Cat className="h-6 w-6 text-orange-600" />}</div><div><h3 className="font-bold">{p.name}</h3><p className="text-sm text-gray-500">{p.species} • {p.breed || 'N/A'}</p>{p.microchip && <p className="text-xs text-gray-400">Chip: {p.microchip}</p>}</div></div></CardContent></Card>))}
                </div>
              </div>
            )}

            {/* ===== DOCUMENTS TAB ===== */}
            {activeTab === 'documents' && (
              <div>
                <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">📄 Documenti</h1><Badge variant="outline">{documents.length} caricati</Badge></div>
                <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="text-left p-4 font-medium">Nome</th><th className="text-left p-4 font-medium">Tipo</th><th className="text-left p-4 font-medium">Animale</th><th className="text-left p-4 font-medium">Stato</th><th className="text-left p-4 font-medium">Data</th></tr></thead>
                <tbody>{documents.map(d => (<tr key={d.id} className="border-t"><td className="p-4 font-medium">{d.name}</td><td className="p-4">{d.type || '-'}</td><td className="p-4">{d.petName || '-'}</td><td className="p-4"><Badge variant="outline">{d.status}</Badge></td><td className="p-4 text-sm text-gray-500">{d.createdAt ? new Date(d.createdAt).toLocaleDateString('it-IT') : '-'}</td></tr>))}</tbody></table></div></CardContent></Card>
              </div>
            )}

            {/* ===== ADVANCED LABS TAB ===== */}
            {activeTab === 'labs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div><h1 className="text-2xl font-bold flex items-center gap-2">🧪 Gestione Laboratori Partner</h1><p className="text-sm text-gray-500 mt-1">{labs.length} laboratori registrati</p></div>
                  <Button variant="outline" size="sm" onClick={loadAllData}><RefreshCw className="h-4 w-4 mr-1" /> Aggiorna</Button>
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-1 mb-6 bg-white p-1 rounded-xl border overflow-x-auto">
                  {[
                    { id: 'overview', label: 'Panoramica', icon: BarChart3 },
                    { id: 'pending', label: `In Attesa (${pendingLabs.length})`, icon: Clock },
                    { id: 'all', label: 'Tutti i Lab', icon: FlaskConical },
                    { id: 'requests', label: 'Richieste', icon: ClipboardList },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setLabSubTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${labSubTab === tab.id ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <tab.icon className="h-4 w-4" />{tab.label}
                    </button>
                  ))}
                </div>

                {/* Overview */}
                {labSubTab === 'overview' && <LabsOverviewSection labStats={labStats} setLabSubTab={setLabSubTab} loadLabDetail={loadLabDetail} />}

                {/* Pending Approvals */}
                {labSubTab === 'pending' && (
                  <div className="space-y-4">
                    <div><h2 className="text-lg font-bold flex items-center gap-2"><Clock className="h-5 w-5 text-amber-500" /> In Attesa di Approvazione</h2><p className="text-sm text-gray-500">{pendingLabs.length} da revisionare</p></div>
                    {pendingLabs.length === 0 ? (
                      <Card><CardContent className="py-12 text-center"><CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-3" /><p className="text-gray-500 font-medium">Nessuna approvazione in sospeso</p></CardContent></Card>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {pendingLabs.map(lab => (
                          <Card key={lab.id} className="border-amber-200 hover:shadow-lg transition-shadow">
                            <CardContent className="p-5">
                              <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">{(lab.labName || lab.name || '?')[0].toUpperCase()}</div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-lg">{lab.labName || lab.name}</h3>
                                  <p className="text-sm text-gray-500">{lab.email}</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {lab.city && <Badge variant="outline" className="text-xs"><MapPin className="h-3 w-3 mr-1" />{lab.city}</Badge>}
                                    {lab.phone && <Badge variant="outline" className="text-xs"><Phone className="h-3 w-3 mr-1" />{lab.phone}</Badge>}
                                    {lab.vatNumber && <Badge variant="outline" className="text-xs"><Hash className="h-3 w-3 mr-1" />{lab.vatNumber}</Badge>}
                                  </div>
                                  {lab.specializations?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{lab.specializations.map((s, i) => <Badge key={i} className="text-xs bg-violet-50 text-violet-700 border-violet-200">{s}</Badge>)}</div>}
                                  <p className="text-xs text-gray-400 mt-2">Registrato il {lab.createdAt ? new Date(lab.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/D'}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4 pt-4 border-t">
                                <Button size="sm" variant="outline" className="flex-1" onClick={() => loadLabDetail(lab.id)}><Eye className="h-4 w-4 mr-1" /> Dettagli</Button>
                                <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => openStatusModal(lab.id, lab.labName || lab.name, 'active')}><Check className="h-4 w-4 mr-1" /> Approva</Button>
                                <Button size="sm" variant="destructive" className="flex-1" onClick={() => openStatusModal(lab.id, lab.labName || lab.name, 'rejected')}><X className="h-4 w-4 mr-1" /> Rifiuta</Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* All Labs */}
                {labSubTab === 'all' && (
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" className="w-full border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Cerca per nome, email, città, P.IVA..." value={labSearchQuery} onChange={e => setLabSearchQuery(e.target.value)} />
                      </div>
                      <div className="flex gap-2">
                        <select className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" value={labStatusFilter} onChange={e => setLabStatusFilter(e.target.value)}>
                          <option value="all">Tutti gli stati</option><option value="active">Attivi</option><option value="pending">In Attesa</option><option value="suspended">Sospesi</option><option value="rejected">Rifiutati</option>
                        </select>
                        <select className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" value={labSortBy} onChange={e => setLabSortBy(e.target.value)}>
                          <option value="createdAt">Data registrazione</option><option value="name">Nome</option><option value="requests">N° richieste</option><option value="connections">N° connessioni</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{filteredLabs.length} laboratori trovati</p>
                    <Card><CardContent className="p-0"><div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b"><tr>
                          <th className="text-left p-4 font-medium text-sm">Laboratorio</th>
                          <th className="text-left p-4 font-medium text-sm hidden md:table-cell">Città</th>
                          <th className="text-left p-4 font-medium text-sm">Stato</th>
                          <th className="text-center p-4 font-medium text-sm hidden lg:table-cell">Richieste</th>
                          <th className="text-center p-4 font-medium text-sm hidden lg:table-cell">Cliniche</th>
                          <th className="text-left p-4 font-medium text-sm hidden lg:table-cell">Billing</th>
                          <th className="text-left p-4 font-medium text-sm hidden md:table-cell">Registrato</th>
                          <th className="text-right p-4 font-medium text-sm">Azioni</th>
                        </tr></thead>
                        <tbody>
                          {filteredLabs.map(lab => (
                            <tr key={lab.id} className="border-t hover:bg-gray-50 transition-colors">
                              <td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">{(lab.labName || lab.name || '?')[0].toUpperCase()}</div><div><p className="font-medium">{lab.labName || lab.name}</p><p className="text-xs text-gray-500">{lab.email}</p></div></div></td>
                              <td className="p-4 text-sm text-gray-600 hidden md:table-cell">{lab.city || '-'}</td>
                              <td className="p-4"><LabStatusBadge status={lab.status} /></td>
                              <td className="p-4 text-center hidden lg:table-cell"><span className="font-bold">{lab.stats?.totalRequests || 0}</span><span className="text-xs text-gray-500 ml-1">({lab.stats?.completedRequests || 0} ✓)</span></td>
                              <td className="p-4 text-center hidden lg:table-cell">{lab.stats?.totalConnections || 0}</td>
                              <td className="p-4 hidden lg:table-cell">{lab.billing && <div className="flex items-center gap-1">{lab.billing.trialExpired ? <Badge className="bg-red-100 text-red-700 text-xs">Scaduto</Badge> : lab.billing.daysRemaining <= 30 ? <Badge className="bg-amber-100 text-amber-700 text-xs">{lab.billing.daysRemaining}g</Badge> : <Badge className="bg-green-100 text-green-700 text-xs">{lab.billing.daysRemaining}g</Badge>}<span className="text-xs text-gray-400">{lab.billing.requestsCount}/{lab.billing.maxFreeRequests}</span></div>}</td>
                              <td className="p-4 text-sm text-gray-500 hidden md:table-cell">{lab.createdAt ? new Date(lab.createdAt).toLocaleDateString('it-IT') : '-'}</td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => loadLabDetail(lab.id)} title="Dettagli"><Eye className="h-4 w-4" /></Button>
                                  {lab.status === 'pending_approval' && <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50" onClick={() => openStatusModal(lab.id, lab.labName || lab.name, 'active')} title="Approva"><Check className="h-4 w-4" /></Button>}
                                  {lab.status === 'active' && <Button variant="ghost" size="sm" className="text-amber-600 hover:bg-amber-50" onClick={() => openStatusModal(lab.id, lab.labName || lab.name, 'suspended')} title="Sospendi"><ShieldAlert className="h-4 w-4" /></Button>}
                                  {lab.status === 'suspended' && <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50" onClick={() => openStatusModal(lab.id, lab.labName || lab.name, 'active')} title="Riattiva"><ShieldCheck className="h-4 w-4" /></Button>}
                                  <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50" onClick={() => openBillingModal(lab.id, lab.labName || lab.name, lab.billing?.maxFreeRequests)} title="Billing"><CreditCard className="h-4 w-4" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {filteredLabs.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-gray-500"><FlaskConical className="h-8 w-8 mx-auto text-gray-300 mb-2" /><p>Nessun laboratorio trovato</p></td></tr>}
                        </tbody>
                      </table>
                    </div></CardContent></Card>
                  </div>
                )}

                {/* Lab Requests */}
                {labSubTab === 'requests' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard icon={Package} label="Totali" value={labRequestsData.stats?.total || 0} color="text-blue-500" bgColor="bg-blue-50" />
                      <StatCard icon={Clock} label="In Corso" value={labRequestsData.stats?.pending || 0} color="text-amber-500" bgColor="bg-amber-50" />
                      <StatCard icon={FileCheck} label="Referti Pronti" value={labRequestsData.stats?.reportReady || 0} color="text-purple-500" bgColor="bg-purple-50" />
                      <StatCard icon={CheckCircle} label="Completate" value={labRequestsData.stats?.completed || 0} color="text-green-500" bgColor="bg-green-50" />
                    </div>
                    <Card><CardHeader className="pb-3"><CardTitle className="text-base">Tutte le Richieste di Analisi</CardTitle></CardHeader>
                    <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="text-left p-3 font-medium text-sm">Codice</th><th className="text-left p-3 font-medium text-sm">Esame</th><th className="text-left p-3 font-medium text-sm">Paziente</th><th className="text-left p-3 font-medium text-sm">Laboratorio</th><th className="text-left p-3 font-medium text-sm">Priorità</th><th className="text-left p-3 font-medium text-sm">Stato</th><th className="text-left p-3 font-medium text-sm">Data</th></tr></thead>
                    <tbody>
                      {(labRequestsData.requests || []).map(req => (
                        <tr key={req.id} className="border-t hover:bg-gray-50">
                          <td className="p-3"><code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{req.sampleCode || '-'}</code></td>
                          <td className="p-3 text-sm font-medium">{req.examName || req.examType || '-'}</td>
                          <td className="p-3 text-sm">{req.petName || '-'}</td>
                          <td className="p-3 text-sm">{req.labName || '-'}</td>
                          <td className="p-3 text-sm">{req.priority === 'urgent' ? <Badge className="bg-red-100 text-red-700 text-xs">Urgente</Badge> : req.priority === 'low' ? <Badge className="bg-gray-100 text-gray-600 text-xs">Bassa</Badge> : <Badge className="bg-blue-100 text-blue-700 text-xs">Normale</Badge>}</td>
                          <td className="p-3"><RequestStatusBadge status={req.status} /></td>
                          <td className="p-3 text-sm text-gray-500">{req.createdAt ? new Date(req.createdAt).toLocaleDateString('it-IT') : '-'}</td>
                        </tr>
                      ))}
                      {(labRequestsData.requests || []).length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500">Nessuna richiesta trovata</td></tr>}
                    </tbody></table></div></CardContent></Card>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <StatusModal show={showStatusModal} onClose={() => setShowStatusModal(false)} data={statusModalData} setData={setStatusModalData} onConfirm={handleUpdateLabStatus} loading={actionLoading} />
      <BillingModal show={showBillingModal} onClose={() => setShowBillingModal(false)} data={billingModalData} setData={setBillingModalData} onConfirm={handleUpdateBilling} loading={actionLoading} />
      {labDetailLoading && <LoadingOverlay />}
    </div>
  );
}

// ============ EXTRACTED SUB-COMPONENTS (module-level, no hoisting issues) ============

function StatusModal({ show, onClose, data, setData, onConfirm, loading }) {
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {data.action === 'active' && <><ShieldCheck className="h-5 w-5 text-green-500" /> Approva Laboratorio</>}
            {data.action === 'suspended' && <><ShieldAlert className="h-5 w-5 text-amber-500" /> Sospendi Laboratorio</>}
            {data.action === 'rejected' && <><X className="h-5 w-5 text-red-500" /> Rifiuta Laboratorio</>}
          </DialogTitle>
          <DialogDescription>
            {data.action === 'active' && `Confermi di voler approvare "${data.labName}"?`}
            {data.action === 'suspended' && `Confermi di voler sospendere "${data.labName}"?`}
            {data.action === 'rejected' && `Confermi di voler rifiutare "${data.labName}"?`}
          </DialogDescription>
        </DialogHeader>
        {(data.action === 'suspended' || data.action === 'rejected') && (
          <div className="py-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo {data.action === 'rejected' ? '(obbligatorio)' : '(opzionale)'}</label>
            <textarea className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" rows={3} placeholder="Inserisci il motivo..." value={data.reason} onChange={e => setData(prev => ({ ...prev, reason: e.target.value }))} />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button disabled={loading || (data.action === 'rejected' && !data.reason?.trim())} className={data.action === 'active' ? 'bg-green-600 hover:bg-green-700' : data.action === 'suspended' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'} onClick={onConfirm}>
            {loading && <RefreshCw className="h-4 w-4 animate-spin mr-1" />}
            {data.action === 'active' ? 'Approva' : data.action === 'suspended' ? 'Sospendi' : 'Rifiuta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BillingModal({ show, onClose, data, setData, onConfirm, loading }) {
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-green-500" /> Gestione Billing</DialogTitle>
          <DialogDescription>Modifica impostazioni billing per &quot;{data.labName}&quot;</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estendi Trial (giorni)</label>
            <input type="number" className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={data.extendDays} onChange={e => setData(prev => ({ ...prev, extendDays: parseInt(e.target.value) || 0 }))} min="0" max="365" />
            <p className="text-xs text-gray-400 mt-1">0 = nessuna estensione</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Limite Richieste Gratuite</label>
            <input type="number" className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={data.maxRequests} onChange={e => setData(prev => ({ ...prev, maxRequests: parseInt(e.target.value) || 0 }))} min="0" max="10000" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" id="resetCount" className="h-4 w-4 rounded border-gray-300 text-purple-600" checked={data.resetCount} onChange={e => setData(prev => ({ ...prev, resetCount: e.target.checked }))} />
            <label htmlFor="resetCount" className="text-sm"><span className="font-medium">Azzera conteggio richieste</span><p className="text-xs text-gray-500">Reimposta il conteggio a 0</p></label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={onConfirm} disabled={loading} className="bg-purple-600 hover:bg-purple-700">{loading ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />} Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LabsOverviewSection({ labStats: ls, setLabSubTab, loadLabDetail }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard icon={FlaskConical} label="Totale Lab" value={ls?.labs?.total || 0} color="text-violet-500" bgColor="bg-violet-50" />
        <StatCard icon={ShieldCheck} label="Attivi" value={ls?.labs?.active || 0} color="text-green-500" bgColor="bg-green-50" />
        <StatCard icon={Clock} label="In Attesa" value={ls?.labs?.pending || 0} color="text-amber-500" bgColor="bg-amber-50" onClick={ls?.labs?.pending > 0 ? () => setLabSubTab('pending') : undefined} />
        <StatCard icon={Package} label="Richieste" value={ls?.requests?.total || 0} color="text-blue-500" bgColor="bg-blue-50" />
        <StatCard icon={CheckCircle} label="Completate" value={ls?.requests?.completed || 0} color="text-green-500" bgColor="bg-green-50" />
        <StatCard icon={Link2} label="Connessioni" value={ls?.connections?.active || 0} color="text-indigo-500" bgColor="bg-indigo-50" />
      </div>

      {(ls?.labs?.pending > 0 || ls?.billing?.trialExpiringSoon > 0 || ls?.billing?.requestsNearLimit > 0) && (
        <div className="grid md:grid-cols-3 gap-4">
          {ls?.labs?.pending > 0 && (
            <Card className="border-amber-200 bg-amber-50/50 cursor-pointer hover:shadow-md" onClick={() => setLabSubTab('pending')}>
              <CardContent className="p-4 flex items-center gap-3"><div className="bg-amber-100 rounded-lg p-2"><AlertTriangle className="h-5 w-5 text-amber-600" /></div><div><p className="font-medium text-amber-800">{ls.labs.pending} lab in attesa</p><p className="text-xs text-amber-600">Clicca per gestire</p></div></CardContent>
            </Card>
          )}
          {ls?.billing?.trialExpiringSoon > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4 flex items-center gap-3"><div className="bg-orange-100 rounded-lg p-2"><Clock className="h-5 w-5 text-orange-600" /></div><div><p className="font-medium text-orange-800">{ls.billing.trialExpiringSoon} trial in scadenza</p><p className="text-xs text-orange-600">&lt;30 giorni</p></div></CardContent>
            </Card>
          )}
          {ls?.billing?.requestsNearLimit > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-4 flex items-center gap-3"><div className="bg-red-100 rounded-lg p-2"><Activity className="h-5 w-5 text-red-600" /></div><div><p className="font-medium text-red-800">{ls.billing.requestsNearLimit} quasi al limite</p><p className="text-xs text-red-600">&lt;10 richieste</p></div></CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> Top Laboratori</CardTitle></CardHeader>
          <CardContent>
            {ls?.topLabs?.length > 0 ? (
              <div className="space-y-3">
                {ls.topLabs.map((lab, idx) => (
                  <div key={lab.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => loadLabDetail(lab.id)}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">{idx + 1}</div>
                    <div className="flex-1"><p className="font-medium text-sm">{lab.labName}</p><p className="text-xs text-gray-500">{lab.city || 'N/D'} • {lab.connections} cliniche</p></div>
                    <div className="text-right"><p className="font-bold text-sm">{lab.totalRequests}</p><p className="text-xs text-gray-500">{lab.completedRequests} completate</p></div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400 text-center py-4">Nessun dato</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-500" /> Richieste per Tipo</CardTitle></CardHeader>
          <CardContent>
            {ls?.requestsByExamType?.length > 0 ? (
              <div className="space-y-2">
                {ls.requestsByExamType.map(item => {
                  const max = ls.requestsByExamType[0]?.count || 1;
                  return (
                    <div key={item.examType} className="flex items-center gap-3">
                      <span className="text-sm w-28 truncate">{item.examType}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-400 to-violet-500 h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${Math.max(20, (item.count / max) * 100)}%` }}>
                          <span className="text-xs text-white font-medium">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-gray-400 text-center py-4">Nessun dato</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard icon={FileText} label="Referti Totali" value={ls?.reports?.total || 0} color="text-purple-500" bgColor="bg-purple-50" />
        <StatCard icon={Eye} label="Inviati al Proprietario" value={ls?.reports?.visibleToOwner || 0} color="text-green-500" bgColor="bg-green-50" />
        <StatCard icon={FileCheck} label="In Revisione" value={ls?.reports?.pendingReview || 0} color="text-amber-500" bgColor="bg-amber-50" />
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-2xl"><RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-500" /><p className="mt-2 text-sm text-gray-500">Caricamento...</p></div>
    </div>
  );
}
