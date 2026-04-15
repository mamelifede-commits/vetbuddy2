'use client';
// ClinicLabMarketplace - Lab Marketplace for Clinics

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Building2, Clock, Euro, Filter, FlaskConical, Link2, Loader2, Mail, MapPin,
  Package, PawPrint, Phone, Plus, Search, Send, Star, Truck, CheckCircle, XCircle,
  ChevronRight, RefreshCw, AlertCircle, Info, Globe, UserPlus, ExternalLink
} from 'lucide-react';
import api from '@/app/lib/api';

function ClinicLabMarketplace({ user }) {
  const [labs, setLabs] = useState([]);
  const [connections, setConnections] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPickup, setFilterPickup] = useState(false);
  const [filterCity, setFilterCity] = useState('');
  const [filterExamType, setFilterExamType] = useState('');
  const [selectedLab, setSelectedLab] = useState(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [activeView, setActiveView] = useState('marketplace'); // marketplace, connections, invitations

  const EXAM_TYPES = [
    'sangue', 'urine', 'feci', 'biopsia', 'citologia',
    'istologia', 'genetico', 'allergologia', 'microbiologia', 'parassitologia'
  ];

  const EXAM_LABELS = {
    sangue: '🩸 Sangue', urine: '🧪 Urine', feci: '💩 Feci', biopsia: '🔬 Biopsia',
    citologia: '🔬 Citologia', istologia: '🧫 Istologia', genetico: '🧬 Genetico',
    allergologia: '🤧 Allergologia', microbiologia: '🦠 Microbiologia', parassitologia: '🪱 Parassitologia'
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [labsData, connsData, invData] = await Promise.all([
        api.get('labs/marketplace'),
        api.get('clinic/connected-labs'),
        api.get('clinic/lab-invitations')
      ]);
      setLabs(labsData || []);
      setConnections(connsData || []);
      setInvitations(invData || []);
    } catch (error) {
      console.error('Error loading marketplace:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLabs = useMemo(() => {
    return labs.filter(lab => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = (lab.labName || '').toLowerCase().includes(q) ||
          (lab.city || '').toLowerCase().includes(q) ||
          (lab.description || '').toLowerCase().includes(q) ||
          (lab.specializations || []).some(s => s.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (filterPickup && !lab.pickupAvailable) return false;
      if (filterCity && (lab.city || '').toLowerCase() !== filterCity.toLowerCase()) return false;
      if (filterExamType && !(lab.priceList || []).some(p => p.examType === filterExamType)) return false;
      return true;
    });
  }, [labs, searchQuery, filterPickup, filterCity, filterExamType]);

  const cities = useMemo(() => {
    const c = new Set(labs.map(l => l.city).filter(Boolean));
    return Array.from(c).sort();
  }, [labs]);

  const requestConnection = async (labId) => {
    setConnecting(true);
    try {
      await api.post('clinic/lab-connection', { labId });
      alert('✅ Richiesta di collegamento inviata!');
      await loadData();
    } catch (error) {
      alert('❌ ' + (error.message || 'Errore'));
    } finally {
      setConnecting(false);
    }
  };

  const inviteLab = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await api.post('clinic/invite-lab', { email: inviteEmail, message: inviteMessage });
      alert('✅ Invito inviato a ' + inviteEmail);
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteMessage('');
      await loadData();
    } catch (error) {
      alert('❌ ' + (error.message || 'Errore'));
    } finally {
      setInviting(false);
    }
  };

  const activeConns = connections.filter(c => c.status === 'active');
  const pendingConns = connections.filter(c => c.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-3 text-gray-500">Caricamento marketplace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-purple-600" />
            Marketplace Laboratori
          </h2>
          <p className="text-gray-500 text-sm mt-1">Trova e connetti laboratori di analisi partner</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />Invita Lab
          </Button>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />Aggiorna
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { id: 'marketplace', label: 'Marketplace', icon: Globe, count: labs.length },
          { id: 'connections', label: 'Collegati', icon: Link2, count: activeConns.length },
          { id: 'invitations', label: 'Inviti', icon: Mail, count: invitations.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm transition ${
              activeView === tab.id
                ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count > 0 && (
              <Badge className={`text-xs ${activeView === tab.id ? 'bg-purple-500' : 'bg-gray-300 text-gray-700'}`}>
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* MARKETPLACE VIEW */}
      {activeView === 'marketplace' && (
        <>
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca laboratorio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCity || 'all'} onValueChange={(v) => setFilterCity(v === 'all' ? '' : v)}>
              <SelectTrigger><MapPin className="h-4 w-4 mr-2 text-gray-400" /><SelectValue placeholder="Città" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le città</SelectItem>
                {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterExamType || 'all'} onValueChange={(v) => setFilterExamType(v === 'all' ? '' : v)}>
              <SelectTrigger><FlaskConical className="h-4 w-4 mr-2 text-gray-400" /><SelectValue placeholder="Tipo esame" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli esami</SelectItem>
                {EXAM_TYPES.map(t => <SelectItem key={t} value={t}>{EXAM_LABELS[t] || t}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border">
              <Switch checked={filterPickup} onCheckedChange={setFilterPickup} />
              <label className="text-sm text-gray-600 flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" /> Solo ritiro campioni
              </label>
            </div>
          </div>

          {/* Stylized Map */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-50 rounded-2xl shadow-lg border border-purple-200 overflow-hidden relative h-[280px]">
              <div className="absolute inset-0 opacity-30">
                <svg viewBox="0 0 400 300" className="w-full h-full">
                  <path d="M0 150 Q 100 130, 200 150 T 400 130" stroke="#94a3b8" strokeWidth="3" fill="none" opacity="0.5"/>
                  <path d="M0 80 Q 100 100, 200 80 T 400 100" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.4"/>
                  <path d="M0 220 Q 100 200, 200 220 T 400 200" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.4"/>
                  <path d="M100 0 Q 120 75, 100 150 T 120 300" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.4"/>
                  <path d="M200 0 Q 180 75, 200 150 T 180 300" stroke="#94a3b8" strokeWidth="3" fill="none" opacity="0.5"/>
                  <path d="M300 0 Q 320 75, 300 150 T 320 300" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.4"/>
                  <rect x="50" y="50" width="60" height="40" rx="4" fill="#e2e8f0" opacity="0.6"/>
                  <rect x="150" y="80" width="50" height="50" rx="4" fill="#e2e8f0" opacity="0.6"/>
                  <rect x="280" y="40" width="70" height="45" rx="4" fill="#e2e8f0" opacity="0.6"/>
                  <rect x="40" y="150" width="45" height="60" rx="4" fill="#e2e8f0" opacity="0.6"/>
                  <rect x="250" y="140" width="55" height="40" rx="4" fill="#e2e8f0" opacity="0.6"/>
                  <rect x="80" y="210" width="60" height="45" rx="4" fill="#e2e8f0" opacity="0.6"/>
                  <rect x="290" y="200" width="55" height="40" rx="4" fill="#e2e8f0" opacity="0.6"/>
                </svg>
              </div>
              
              {/* Lab pins */}
              {filteredLabs.slice(0, 6).map((lab, i) => {
                const positions = [
                  { top: '20%', left: '25%' }, { top: '35%', left: '55%' },
                  { top: '55%', left: '20%' }, { top: '65%', left: '65%' },
                  { top: '25%', left: '75%' }, { top: '50%', left: '42%' }
                ];
                const pos = positions[i] || positions[0];
                const colors = ['purple', 'indigo', 'violet', 'blue', 'fuchsia', 'purple'];
                const color = colors[i % colors.length];
                return (
                  <div
                    key={lab.id}
                    className="absolute transform -translate-x-1/2 cursor-pointer transition-transform hover:scale-125 z-10"
                    style={{ top: pos.top, left: pos.left }}
                    onClick={() => setSelectedLab(lab)}
                  >
                    <div className={`bg-${color}-500 text-white p-2 rounded-full shadow-lg`}>
                      <FlaskConical className="h-4 w-4" />
                    </div>
                    <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-${color}-500 mx-auto -mt-0.5`}></div>
                    <div className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-full shadow text-xs font-medium text-gray-700 mt-1 whitespace-nowrap">
                      {lab.labName?.substring(0, 15) || 'Lab'}
                    </div>
                  </div>
                );
              })}
              
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md">
                <p className="text-sm font-semibold text-gray-700">🧪 {filteredLabs.length} laboratori disponibili</p>
              </div>
              
              <div className="absolute bottom-3 right-3 flex flex-col gap-1">
                <div className="bg-white/90 backdrop-blur w-7 h-7 rounded-md shadow flex items-center justify-center text-gray-500 font-bold text-sm">+</div>
                <div className="bg-white/90 backdrop-blur w-7 h-7 rounded-md shadow flex items-center justify-center text-gray-500 font-bold text-sm">−</div>
              </div>
            </div>
          </div>

          {/* Labs List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLabs.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-12 text-center text-gray-500">
                  <FlaskConical className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Nessun laboratorio trovato</p>
                  <p className="text-sm mt-2">Prova a modificare i filtri o invita un laboratorio</p>
                </CardContent>
              </Card>
            ) : filteredLabs.map(lab => (
              <Card key={lab.id} className="hover:shadow-lg transition-all cursor-pointer border-purple-100 hover:border-purple-300 group" onClick={() => setSelectedLab(lab)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                        <FlaskConical className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition">{lab.labName}</h3>
                        {lab.city && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{lab.city}{lab.province ? ` (${lab.province})` : ''}</p>}
                      </div>
                    </div>
                    {lab.connectionStatus === 'active' && (
                      <Badge className="bg-green-100 text-green-700 text-xs">Collegato</Badge>
                    )}
                    {lab.connectionStatus === 'pending' && (
                      <Badge className="bg-yellow-100 text-yellow-700 text-xs">In Attesa</Badge>
                    )}
                  </div>

                  {lab.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lab.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(lab.specializations || []).slice(0, 3).map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-purple-600 border-purple-200">{s}</Badge>
                    ))}
                    {(lab.specializations || []).length > 3 && (
                      <Badge variant="outline" className="text-xs">+{lab.specializations.length - 3}</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                    <div className="flex items-center gap-3">
                      {lab.pickupAvailable && (
                        <span className="flex items-center gap-1 text-green-600"><Truck className="h-3 w-3" />Ritiro</span>
                      )}
                      {lab.averageReportTime && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lab.averageReportTime}</span>
                      )}
                    </div>
                    {(lab.priceList || []).length > 0 && (
                      <span className="flex items-center gap-1 text-purple-600"><Euro className="h-3 w-3" />Listino</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* CONNECTIONS VIEW */}
      {activeView === 'connections' && (
        <div className="space-y-4">
          {activeConns.length === 0 && pendingConns.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Link2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Nessun collegamento attivo</p>
                <p className="text-sm mt-2">Cerca un laboratorio nel marketplace e richiedi un collegamento</p>
                <Button className="mt-4 bg-purple-500 hover:bg-purple-600" onClick={() => setActiveView('marketplace')}>
                  Vai al Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {pendingConns.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" /> In attesa ({pendingConns.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingConns.map(conn => (
                      <Card key={conn.id} className="border-yellow-200 bg-yellow-50/50">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                              <FlaskConical className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <p className="font-medium">{conn.lab?.labName || 'Laboratorio'}</p>
                              <p className="text-xs text-gray-500">{conn.lab?.city || ''} • In attesa di accettazione</p>
                            </div>
                          </div>
                          <Badge className="bg-yellow-200 text-yellow-800">In Attesa</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {activeConns.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" /> Collegati ({activeConns.length})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {activeConns.map(conn => (
                      <Card key={conn.id} className="border-green-200 hover:shadow-md transition">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                              <FlaskConical className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{conn.lab?.labName || 'Laboratorio'}</p>
                              <p className="text-xs text-gray-500">{conn.lab?.city || ''}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            {conn.lab?.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{conn.lab.phone}</span>}
                            {conn.lab?.pickupAvailable && <span className="flex items-center gap-1 text-green-600"><Truck className="h-3 w-3" />Ritiro disponibile</span>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* INVITATIONS VIEW */}
      {activeView === 'invitations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Inviti inviati</h3>
            <Button onClick={() => setShowInviteDialog(true)} className="bg-purple-500 hover:bg-purple-600">
              <UserPlus className="h-4 w-4 mr-2" />Nuovo Invito
            </Button>
          </div>
          {invitations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Mail className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Nessun invito inviato</p>
                <p className="text-xs mt-1">Invita un laboratorio a registrarsi su VetBuddy</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {invitations.map(inv => (
                <Card key={inv.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-purple-100 rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{inv.email}</p>
                        <p className="text-xs text-gray-500">Inviato il {new Date(inv.createdAt).toLocaleDateString('it-IT')}</p>
                      </div>
                    </div>
                    <Badge className={inv.status === 'accepted' ? 'bg-green-100 text-green-700' : inv.status === 'expired' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'}>
                      {inv.status === 'accepted' ? 'Accettato' : inv.status === 'expired' ? 'Scaduto' : 'In attesa'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lab Profile Dialog */}
      <Dialog open={!!selectedLab} onOpenChange={() => setSelectedLab(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedLab && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <FlaskConical className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl">{selectedLab.labName}</p>
                    {selectedLab.city && <p className="text-sm text-gray-500 font-normal">{selectedLab.city}{selectedLab.province ? ` (${selectedLab.province})` : ''}</p>}
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {selectedLab.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedLab.description}</p>
                )}

                {/* Info */}
                <div className="grid grid-cols-2 gap-3">
                  {selectedLab.address && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" />Indirizzo</p>
                      <p className="font-medium text-sm">{selectedLab.address}</p>
                    </div>
                  )}
                  {selectedLab.phone && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" />Telefono</p>
                      <p className="font-medium text-sm">{selectedLab.phone}</p>
                    </div>
                  )}
                  {selectedLab.averageReportTime && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 flex items-center gap-1"><Clock className="h-3 w-3" />Tempi medi</p>
                      <p className="font-medium text-sm">{selectedLab.averageReportTime}</p>
                    </div>
                  )}
                  {selectedLab.pickupAvailable && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 flex items-center gap-1"><Truck className="h-3 w-3" />Ritiro campioni</p>
                      <p className="font-medium text-sm">Disponibile</p>
                      {selectedLab.pickupDays && <p className="text-xs text-gray-500">{selectedLab.pickupDays}</p>}
                    </div>
                  )}
                </div>

                {/* Specializations */}
                {(selectedLab.specializations || []).length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Specializzazioni</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLab.specializations.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-purple-600 border-purple-200">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price List */}
                {(selectedLab.priceList || []).length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1"><Euro className="h-4 w-4 text-purple-500" />Listino Prezzi Indicativo <span className="text-xs font-normal text-gray-400 ml-1">(IVA esclusa)</span></p>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-purple-50">
                          <tr>
                            <th className="text-left px-3 py-2 text-purple-700 font-medium">Esame</th>
                            <th className="text-right px-3 py-2 text-purple-700 font-medium">Prezzo</th>
                            <th className="text-right px-3 py-2 text-purple-700 font-medium">Tempi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedLab.priceList.map((p, i) => (
                            <tr key={i} className="border-t">
                              <td className="px-3 py-2">
                                <p className="font-medium">{EXAM_LABELS[p.examType] || p.examType}</p>
                                {p.title && p.title !== p.examType && <p className="text-xs text-gray-500">{p.title}</p>}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {p.priceOnRequest ? (
                                  <span className="text-gray-500 text-xs">Su richiesta</span>
                                ) : (
                                  <span className="font-semibold text-green-700">
                                    €{p.priceFrom}{p.priceTo ? ` - €${p.priceTo}` : ''}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-500 text-xs">{p.averageDeliveryTime || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 italic">* Prezzi indicativi, IVA esclusa (22%). Il prezzo finale può variare.</p>
                  </div>
                )}

                {/* Connection Action */}
                <div className="pt-2 border-t">
                  {selectedLab.connectionStatus === 'active' ? (
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                      <p className="text-sm font-medium text-green-700">Già collegato</p>
                      <p className="text-xs text-green-600">Puoi creare richieste di analisi per questo laboratorio</p>
                    </div>
                  ) : selectedLab.connectionStatus === 'pending' ? (
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <Clock className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                      <p className="text-sm font-medium text-yellow-700">Richiesta in attesa</p>
                      <p className="text-xs text-yellow-600">Il laboratorio deve accettare il collegamento</p>
                    </div>
                  ) : (
                    <Button className="w-full bg-purple-500 hover:bg-purple-600" onClick={() => requestConnection(selectedLab.id)} disabled={connecting}>
                      {connecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                      Richiedi Collegamento
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Lab Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-500" />
              Invita un Laboratorio
            </DialogTitle>
            <DialogDescription>
              Invia un invito email a un laboratorio per registrarsi su VetBuddy
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Email del laboratorio *</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="info@laboratorio.it"
              />
            </div>
            <div>
              <Label>Messaggio personalizzato (opzionale)</Label>
              <Textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Ciao, vorremmo collaborare con voi su VetBuddy..."
                rows={3}
              />
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700">
              <Info className="h-4 w-4 inline mr-1" />
              Il laboratorio riceverà un'email con un link per registrarsi gratuitamente su VetBuddy. Una volta registrato, sarà automaticamente collegato alla tua clinica.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Annulla</Button>
            <Button className="bg-purple-500 hover:bg-purple-600" onClick={inviteLab} disabled={!inviteEmail || inviting}>
              {inviting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Invia Invito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClinicLabMarketplace;
