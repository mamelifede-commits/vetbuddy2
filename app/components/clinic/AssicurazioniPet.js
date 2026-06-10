'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Plus, Send, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import api from '@/app/lib/api';

export default function AssicurazioniPet({ user }) {
  const [claims, setClaims] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const insuranceProviders = [
    { id: 'unipolsai', name: 'UnipolSai Pet', logo: '🏢', status: 'active' },
    { id: 'allianz', name: 'Allianz Care Pet', logo: '🏢', status: 'active' },
    { id: 'generali', name: 'Generali Salute Pet', logo: '🏢', status: 'active' },
    { id: 'axa', name: 'AXA Pet Insurance', logo: '🏢', status: 'active' },
  ];

  const [newClaim, setNewClaim] = useState({
    petId: '',
    insuranceProvider: '',
    policyNumber: '',
    claimAmount: '',
    description: '',
  });

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const response = await api.get('insurance-claims');
      setClaims(response.data || []);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClaim = async () => {
    try {
      await api.post('insurance-claims', {
        ...newClaim,
        clinicId: user.clinicId,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      });
      setShowModal(false);
      setNewClaim({ petId: '', insuranceProvider: '', policyNumber: '', claimAmount: '', description: '' });
      loadClaims();
    } catch (error) {
      console.error('Error submitting claim:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      submitted: { color: 'bg-blue-100 text-blue-700', icon: Send, label: 'Inviato' },
      processing: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'In Elaborazione' },
      approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Approvato' },
      rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rifiutato' },
    };
    const variant = variants[status] || variants.submitted;
    const Icon = variant.icon;
    return <Badge className={variant.color}><Icon className="h-3 w-3 mr-1" />{variant.label}</Badge>;
  };

  const filteredClaims = claims.filter(c => 
    c.insuranceProvider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Integrazione Assicurazioni Pet
          </h2>
          <p className="text-sm text-gray-500">Invio automatico documenti e tracking rimborsi</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-green-600">
          <Plus className="h-4 w-4 mr-2" />Nuova Richiesta Rimborso
        </Button>
      </div>

      {/* Partner Assicurativi */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Partner Assicurativi Integrati</h3>
        <div className="grid grid-cols-4 gap-3">
          {insuranceProviders.map(provider => (
            <Card key={provider.id} className="hover:shadow-md transition">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{provider.logo}</div>
                <p className="text-sm font-semibold text-gray-900">{provider.name}</p>
                <Badge className="bg-green-100 text-green-700 text-xs mt-2">Attivo</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{claims.length}</div>
            <p className="text-xs text-gray-500">Richieste Totali</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{claims.filter(c => c.status === 'processing').length}</div>
            <p className="text-xs text-gray-500">In Elaborazione</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{claims.filter(c => c.status === 'approved').length}</div>
            <p className="text-xs text-gray-500">Approvati</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">€{claims.filter(c => c.status === 'approved').reduce((sum, c) => sum + (parseFloat(c.claimAmount) || 0), 0).toFixed(2)}</div>
            <p className="text-xs text-gray-500">Totale Approvato</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cerca per assicurazione o polizza..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista Richieste */}
      <div className="grid gap-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Caricamento...</div>
        ) : filteredClaims.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nessuna richiesta rimborso</p>
            </CardContent>
          </Card>
        ) : (
          filteredClaims.map(claim => (
            <Card key={claim.id} className="hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{claim.insuranceProvider}</h4>
                        {getStatusBadge(claim.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Polizza: {claim.policyNumber} - Importo: €{claim.claimAmount}</p>
                      <div className="text-xs text-gray-500">
                        Inviato: {new Date(claim.submittedAt).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Dettagli</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova Richiesta Rimborso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
              ℹ️ I documenti verranno inviati automaticamente all'assicurazione
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>Annulla</Button>
              <Button onClick={handleSubmitClaim} className="bg-green-600">Invia Richiesta</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
