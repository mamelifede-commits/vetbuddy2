'use client';
// VetBuddyConnect - Modulo unificato inviti ecosistema
// Usabile da: clinica (invita proprietari, lab), proprietario (invita clinica), lab (invita cliniche)

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Users, Send, RefreshCw, CheckCircle, Clock, XCircle, Mail, Copy,
  Link2, QrCode, FlaskConical, Building2, Heart, Loader2, Plus, Upload,
  ChevronRight, AlertCircle, Trash2, RotateCw
} from 'lucide-react';
import api from '@/app/lib/api';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

const TYPE_CONFIG = {
  owner_to_clinic: {
    label: 'Invita la tua clinica',
    icon: Building2,
    color: 'coral',
    description: 'Collega la clinica del tuo veterinario di fiducia alla tua rete VetBuddy.',
    fields: ['name', 'email', 'phone', 'city', 'message']
  },
  clinic_to_owner: {
    label: 'Invita proprietari',
    icon: Heart,
    color: 'emerald',
    description: 'Invita i tuoi clienti a unirsi a VetBuddy per ricevere promemoria, documenti e prenotare online.',
    fields: ['name', 'email', 'phone', 'message']
  },
  clinic_to_lab: {
    label: 'Invita un laboratorio',
    icon: FlaskConical,
    color: 'blue',
    description: 'Invita un laboratorio a unirsi a VetBuddy per inviare richieste digitali e ricevere referti.',
    fields: ['name', 'email', 'phone', 'city', 'examType', 'message']
  },
  lab_to_clinic: {
    label: 'Invita cliniche',
    icon: Building2,
    color: 'purple',
    description: 'Invita le cliniche tue clienti a unirsi a VetBuddy per ricevere richieste e referti digitali.',
    fields: ['name', 'email', 'phone', 'city', 'message']
  }
};

const STATUS_BADGES = {
  sent: { label: 'Inviato', color: 'bg-amber-100 text-amber-700', icon: Clock },
  opened: { label: 'Aperto', color: 'bg-blue-100 text-blue-700', icon: Mail },
  accepted: { label: 'Accettato', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  revoked: { label: 'Revocato', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  expired: { label: 'Scaduto', color: 'bg-red-100 text-red-700', icon: XCircle }
};

function getAllowedTypesForRole(role) {
  if (role === 'owner') return ['owner_to_clinic'];
  if (role === 'clinic' || role === 'staff') return ['clinic_to_owner', 'clinic_to_lab'];
  if (role === 'lab') return ['lab_to_clinic'];
  return [];
}

function VetBuddyConnect({ user, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [credits, setCredits] = useState(null);
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [activeType, setActiveType] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', city: '', examType: '', message: '' });
  const [bulkText, setBulkText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const role = user?.role === 'staff' ? 'clinic' : user?.role;
  const allowedTypes = getAllowedTypesForRole(role);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, invsRes, creditsRes] = await Promise.all([
        api.get('connect/stats').catch(() => ({})),
        api.get('connect/invitations').catch(() => ({ sent: [], received: [] })),
        api.get('connect/referral-credits').catch(() => null)
      ]);
      setStats(statsRes || {});
      setSent(invsRes.sent || []);
      setReceived(invsRes.received || []);
      setCredits(creditsRes);
    } catch (e) {
      console.error('Connect load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const openInviteDialog = (type) => {
    setActiveType(type);
    setFormData({ name: '', email: '', phone: '', city: '', examType: '', message: '' });
    setShowInviteDialog(true);
  };

  const handleInviteSubmit = async () => {
    if (!formData.email) {
      alert('Email destinatario obbligatoria');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        type: activeType,
        toEmail: formData.email,
        toName: formData.name,
        toPhone: formData.phone,
        toCity: formData.city,
        examType: formData.examType,
        message: formData.message
      };
      const res = await api.post('connect/invite', payload);
      if (res.success) {
        setShowInviteDialog(false);
        await loadData();
        alert('✅ Invito inviato con successo!');
      } else {
        alert(res.error || 'Errore durante l\'invio');
      }
    } catch (e) {
      alert(e.message || 'Errore durante l\'invio');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    // Parse CSV-like text: name,email,phone (one per line)
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    const recipients = lines.map(line => {
      const parts = line.split(/[,;\t]/).map(s => s.trim());
      // Detect email
      const email = parts.find(p => /@/.test(p));
      const name = parts.find(p => p && p !== email && !/^\+?\d/.test(p)) || '';
      const phone = parts.find(p => /^\+?\d/.test(p)) || '';
      return { email, name, phone };
    }).filter(r => r.email);

    if (recipients.length === 0) {
      alert('Inserisci almeno un\'email valida');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('connect/bulk-invite', {
        type: activeType,
        recipients,
        message: formData.message
      });
      if (res.success) {
        setShowBulkDialog(false);
        setBulkText('');
        await loadData();
        const r = res.results;
        alert(`✅ Inviti elaborati: ${r.sent} inviati, ${r.skipped} saltati, ${r.failed} falliti`);
      } else {
        alert(res.error || 'Errore durante l\'invio massivo');
      }
    } catch (e) {
      alert(e.message || 'Errore durante l\'invio');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (invitationId) => {
    if (!confirm('Revocare questo invito?')) return;
    try {
      await api.post('connect/revoke', { invitationId });
      await loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleResend = async (invitationId) => {
    try {
      const res = await api.post('connect/resend', { invitationId });
      if (res.success) {
        alert('✅ Invito reinviato');
        await loadData();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCopyLink = (type) => {
    // For clinic→owner: copia link generico di registrazione con tracking
    const link = `${baseUrl}/?invitedBy=${user?.id || ''}&role=${type === 'clinic_to_owner' ? 'owner' : type === 'clinic_to_lab' ? 'lab' : 'clinic'}`;
    navigator.clipboard.writeText(link);
    alert('🔗 Link copiato negli appunti!');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-8 w-8 animate-spin text-coral-500" />
    </div>
  );

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}

      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-coral-500" />
          VetBuddy Connect
        </h2>
        <p className="text-gray-500 text-sm">
          La rete che collega cliniche, proprietari e laboratori. Invita, condividi, costruisci il tuo ecosistema.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-coral-50 to-orange-50 border-coral-200">
          <CardContent className="p-4 text-center">
            <Send className="h-6 w-6 text-coral-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-coral-700">{stats?.sentTotal || 0}</p>
            <p className="text-xs text-coral-600">Inviti inviati</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-700">{stats?.sentPending || 0}</p>
            <p className="text-xs text-amber-600">In attesa</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700">{stats?.sentAccepted || 0}</p>
            <p className="text-xs text-green-600">Accettati</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Heart className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-700">{stats?.conversionRate || 0}%</p>
            <p className="text-xs text-purple-600">Tasso conversione</p>
          </CardContent>
        </Card>
      </div>

      {/* Crediti Referral - mostrato solo se ne ha */}
      {credits && credits.totals && (credits.totals.pending.count + credits.totals.available.count > 0) && (
        <Card className="bg-gradient-to-r from-amber-50 via-yellow-50 to-emerald-50 border-2 border-amber-300 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">💰</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Crediti Referral accumulati</h4>
                  <p className="text-xs text-gray-600">Sblocca crediti invitando altri attori nella rete</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {credits.totals.pending.count > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-amber-600 font-medium">In attesa</p>
                    <p className="text-lg font-bold text-amber-700">€{credits.totals.pending.amount}</p>
                    <p className="text-xs text-gray-500">{credits.totals.pending.count} crediti</p>
                  </div>
                )}
                {credits.totals.available.count > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-emerald-600 font-medium">Disponibili</p>
                    <p className="text-lg font-bold text-emerald-700">€{credits.totals.available.amount}</p>
                    <p className="text-xs text-gray-500">{credits.totals.available.count} crediti</p>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              💡 I crediti diventano disponibili dopo il primo pagamento del referred. Applicabili automaticamente sul prossimo billing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Invite Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {allowedTypes.map(type => {
          const cfg = TYPE_CONFIG[type];
          const Icon = cfg.icon;
          return (
            <Card key={type} className={`border-2 border-${cfg.color}-200 hover:border-${cfg.color}-400 hover:shadow-md transition-all`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`h-10 w-10 bg-${cfg.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 text-${cfg.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{cfg.label}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-snug">{cfg.description}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => openInviteDialog(type)}
                    className={`bg-${cfg.color}-500 hover:bg-${cfg.color}-600 text-white w-full`}
                  >
                    <Send className="h-3 w-3 mr-1" />Invita
                  </Button>
                  {(type === 'clinic_to_owner' || type === 'lab_to_clinic') && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => { setActiveType(type); setBulkText(''); setFormData({ ...formData, message: '' }); setShowBulkDialog(true); }} className="w-full">
                        <Upload className="h-3 w-3 mr-1" />Invio massivo
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleCopyLink(type)} className="w-full text-xs">
                        <Copy className="h-3 w-3 mr-1" />Copia link condivisione
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Invitations List */}
      <Tabs defaultValue="sent">
        <TabsList className="mb-4">
          <TabsTrigger value="sent">
            <Send className="h-4 w-4 mr-1" />Inviati <Badge variant="outline" className="ml-1 text-xs">{sent.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="received">
            <Mail className="h-4 w-4 mr-1" />Ricevuti <Badge variant="outline" className="ml-1 text-xs">{received.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* SENT */}
        <TabsContent value="sent">
          {sent.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Send className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Nessun invito inviato. Inizia ora a costruire la tua rete!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {sent.map(inv => {
                const typeCfg = TYPE_CONFIG[inv.type] || {};
                const statusCfg = STATUS_BADGES[inv.status] || STATUS_BADGES.sent;
                const StatusIcon = statusCfg.icon;
                const TypeIcon = typeCfg.icon || Mail;
                return (
                  <Card key={inv.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`h-9 w-9 bg-${typeCfg.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                            <TypeIcon className={`h-4 w-4 text-${typeCfg.color}-600`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{inv.toName || inv.toEmail}</p>
                            <p className="text-xs text-gray-500 truncate">{inv.toEmail}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Inviato il {new Date(inv.createdAt).toLocaleDateString('it-IT')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={statusCfg.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusCfg.label}
                          </Badge>
                          {inv.status !== 'accepted' && inv.status !== 'revoked' && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => handleResend(inv.id)} title="Reinvia">
                                <RotateCw className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleRevoke(inv.id)} title="Revoca" className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* RECEIVED */}
        <TabsContent value="received">
          {received.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Nessun invito ricevuto.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {received.map(inv => {
                const typeCfg = TYPE_CONFIG[inv.type] || {};
                const statusCfg = STATUS_BADGES[inv.status] || STATUS_BADGES.sent;
                const StatusIcon = statusCfg.icon;
                const TypeIcon = typeCfg.icon || Mail;
                return (
                  <Card key={inv.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`h-9 w-9 bg-${typeCfg.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                            <TypeIcon className={`h-4 w-4 text-${typeCfg.color}-600`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{inv.fromName}</p>
                            <p className="text-xs text-gray-500 truncate">{inv.fromEmail}</p>
                            {inv.message && <p className="text-xs text-gray-600 italic mt-1 line-clamp-1">&ldquo;{inv.message}&rdquo;</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={statusCfg.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusCfg.label}
                          </Badge>
                          {inv.status !== 'accepted' && inv.status !== 'revoked' && (
                            <Button
                              size="sm"
                              onClick={() => window.location.href = `/connect/accept/${inv.token}`}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />Accetta
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Invite Dialog (singolo) */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeType && (() => { const Icon = TYPE_CONFIG[activeType]?.icon || Send; return <Icon className="h-5 w-5" />; })()}
              {activeType && TYPE_CONFIG[activeType]?.label}
            </DialogTitle>
            <DialogDescription>{activeType && TYPE_CONFIG[activeType]?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome {activeType === 'clinic_to_owner' ? 'proprietario' : activeType === 'owner_to_clinic' ? 'clinica' : 'destinatario'}</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Es: Clinica Veterinaria Milano" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@esempio.it" required />
            </div>
            {activeType && TYPE_CONFIG[activeType]?.fields?.includes('phone') && (
              <div>
                <Label>Telefono <span className="text-xs text-emerald-600">(WhatsApp + email automatici)</span></Label>
                <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+39 ..." />
                <p className="text-xs text-gray-500 mt-1">💬 Se inserisci il telefono, il destinatario riceverà anche un messaggio WhatsApp via Twilio.</p>
              </div>
            )}
            {activeType && TYPE_CONFIG[activeType]?.fields?.includes('city') && (
              <div>
                <Label>Città</Label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Milano" />
              </div>
            )}
            {activeType === 'clinic_to_lab' && (
              <div>
                <Label>Tipo esame richiesto (opzionale)</Label>
                <Input value={formData.examType} onChange={(e) => setFormData({ ...formData, examType: e.target.value })} placeholder="Es: Esami sangue, biopsia..." />
              </div>
            )}
            <div>
              <Label>Messaggio personale (opzionale)</Label>
              <Textarea rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Aggiungi un messaggio..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Annulla</Button>
            <Button onClick={handleInviteSubmit} disabled={submitting} className="bg-coral-500 hover:bg-coral-600 text-white">
              {submitting ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Invio...</> : <><Send className="h-4 w-4 mr-1" />Invia invito</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Invio massivo {activeType && TYPE_CONFIG[activeType]?.label.toLowerCase()}
            </DialogTitle>
            <DialogDescription>
              Incolla una lista di email (una per riga). Puoi aggiungere nome e telefono separati da virgola.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Lista destinatari (uno per riga)</Label>
              <Textarea
                rows={10}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Mario Rossi, mario@esempio.it, +39 333 1234567\nGiulia Bianchi, giulia@esempio.it\nemail3@esempio.it`}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Formato: <code>nome, email, telefono</code> (solo email è obbligatoria)</p>
            </div>
            <div>
              <Label>Messaggio personale (opzionale)</Label>
              <Textarea rows={2} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Verrà inviato a tutti i destinatari..." />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Massimo 200 destinatari per invio. Inviti duplicati verranno saltati automaticamente.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>Annulla</Button>
            <Button onClick={handleBulkSubmit} disabled={submitting} className="bg-coral-500 hover:bg-coral-600 text-white">
              {submitting ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Invio...</> : <><Send className="h-4 w-4 mr-1" />Invia tutti</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VetBuddyConnect;
