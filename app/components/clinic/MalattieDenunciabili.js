'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Plus, Send, FileText, Clock, CheckCircle } from 'lucide-react';
import api from '@/app/lib/api';

export default function MalattieDenunciabili({ user }) {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const notifiableDiseases = [
    { id: 'rabbia', name: 'Rabbia', authority: 'ASL + Ministero', urgency: 'Immediata' },
    { id: 'tubercolosi', name: 'Tubercolosi', authority: 'ASL + Ministero', urgency: '48h' },
    { id: 'brucellosi', name: 'Brucellosi', authority: 'ASL + IZS', urgency: '48h' },
    { id: 'leishmaniosi', name: 'Leishmaniosi', authority: 'ASL', urgency: '7gg' },
    { id: 'west_nile', name: 'West Nile Virus', authority: 'ASL + Ministero', urgency: 'Immediata' },
    { id: 'influenza_aviaria', name: 'Influenza Aviaria', authority: 'ASL + Ministero', urgency: 'Immediata' },
  ];

  const [newReport, setNewReport] = useState({
    diseaseType: '',
    petId: '',
    symptoms: '',
    diagnosisDate: '',
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('disease-reports');
      setReports(response.data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    try {
      await api.post('disease-reports', {
        ...newReport,
        clinicId: user.clinicId,
        reportedBy: user.id,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      });
      setShowModal(false);
      setNewReport({ diseaseType: '', petId: '', symptoms: '', diagnosisDate: '' });
      loadReports();
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      submitted: { color: 'bg-blue-100 text-blue-700', icon: Send, label: 'Inviata' },
      confirmed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Confermata ASL' },
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'In Attesa' },
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    return <Badge className={variant.color}><Icon className="h-3 w-3 mr-1" />{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            Malattie Denunciabili
          </h2>
          <p className="text-sm text-gray-500">Segnalazioni obbligatorie ASL e Ministero Salute</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-red-600">
          <Plus className="h-4 w-4 mr-2" />Nuova Denuncia
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
            <p className="text-xs text-gray-500">Denunce Totali</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{reports.filter(r => r.status === 'pending').length}</div>
            <p className="text-xs text-gray-500">In Attesa</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{reports.filter(r => r.status === 'confirmed').length}</div>
            <p className="text-xs text-gray-500">Confermate</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista Denunce */}
      <div className="grid gap-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Caricamento...</div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nessuna denuncia registrata</p>
            </CardContent>
          </Card>
        ) : (
          reports.map(report => (
            <Card key={report.id} className="hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{report.diseaseType}</h4>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Diagnosi: {new Date(report.diagnosisDate).toLocaleDateString('it-IT')}</p>
                      <div className="text-xs text-gray-500">
                        Inviata: {new Date(report.submittedAt).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-1" />Modulo ASL
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Nuova Denuncia */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuova Denuncia Malattia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800">
              ⚠️ Alcune malattie richiedono denuncia IMMEDIATA. Verifica la tempistica obbligatoria.
            </div>
            <div>
              <Label>Malattia Denunciabile</Label>
              <Select value={newReport.diseaseType} onValueChange={(v) => setNewReport({...newReport, diseaseType: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona malattia..." />
                </SelectTrigger>
                <SelectContent>
                  {notifiableDiseases.map(d => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name} - {d.urgency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Diagnosi</Label>
              <Input
                type="date"
                value={newReport.diagnosisDate}
                onChange={(e) => setNewReport({...newReport, diagnosisDate: e.target.value})}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>Annulla</Button>
              <Button onClick={handleSubmitReport} className="bg-red-600">Invia Denuncia</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
