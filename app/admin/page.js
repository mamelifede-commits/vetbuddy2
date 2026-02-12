'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Building2, Mail, Phone, MapPin, FileText, RefreshCw, Eye, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const api = {
  baseUrl: '/api',
  async get(endpoint) {
    const res = await fetch(`${this.baseUrl}/${endpoint}`);
    if (!res.ok) throw new Error((await res.json()).error || 'Errore');
    return res.json();
  },
  async put(endpoint, data) {
    const res = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Errore');
    return res.json();
  }
};

export default function AdminPage() {
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

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await api.get(`pilot-applications?status=${filter}`);
      setApplications(data.applications);
      setCounts(data.counts);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app) => {
    if (!confirm(`Approvare ${app.clinicName}? Verrà creato un account e inviate le credenziali.`)) return;
    setActionLoading(true);
    try {
      await api.put('pilot-applications', { applicationId: app.id, status: 'approved' });
      alert('✅ Clinica approvata! Email con credenziali inviata.');
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
            <Button onClick={loadApplications} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
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
                            onClick={() => handleApprove(app)}
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
