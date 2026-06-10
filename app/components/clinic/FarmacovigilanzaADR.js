'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Plus, Send, Clock, CheckCircle } from 'lucide-react';
import api from '@/app/lib/api';

export default function FarmacovigilanzaADR({ user }) {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const severityLevels = [
    { value: 'lieve', label: 'Lieve', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'moderata', label: 'Moderata', color: 'bg-orange-100 text-orange-700' },
    { value: 'grave', label: 'Grave', color: 'bg-red-100 text-red-700' },
  ];

  const [newReport, setNewReport] = useState({
    petId: '',
    drugName: '',
    drugBatch: '',
    reactionType: '',
    severity: '',
    description: '',
  });

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('adr-reports');
      setReports(response.data || []);
    } catch (error) {
      console.error('Error loading ADR reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    try {
      await api.post('adr-reports', {
        ...newReport,
        clinicId: user.clinicId,
        reportedBy: user.id,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      });
      setShowModal(false);
      setNewReport({ petId: '', drugName: '', drugBatch: '', reactionType: '', severity: '', description: '' });
      loadReports();
    } catch (error) {
      console.error('Error submitting ADR:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            Farmacovigilanza - ADR
          </h2>
          <p className="text-sm text-gray-500">Segnalazione Reazioni Avverse Farmaci al Ministero Salute</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />Segnala ADR
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{reports.length}</div><p className="text-xs text-gray-500">Segnalazioni Totali</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-yellow-600">{reports.filter(r => r.status === 'pending').length}</div><p className="text-xs text-gray-500">In Attesa</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{reports.filter(r => r.status === 'confirmed').length}</div><p className="text-xs text-gray-500">Confermate</p></CardContent></Card>
      </div>

      <div className="grid gap-3">
        {loading ? <div className="text-center py-12 text-gray-500">Caricamento...</div> : reports.length === 0 ? (
          <Card><CardContent className="p-12 text-center"><AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Nessuna segnalazione ADR</p></CardContent></Card>
        ) : reports.map(report => (
          <Card key={report.id}><CardContent className="p-4"><div className="flex justify-between"><div className="flex gap-3 flex-1"><div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center"><AlertCircle className="h-5 w-5 text-orange-600" /></div><div><h4 className="font-semibold">{report.drugName}</h4><p className="text-sm text-gray-600">Gravità: {report.severity}</p></div></div><Badge className="bg-blue-100 text-blue-700"><Send className="h-3 w-3 mr-1" />Inviata</Badge></div></CardContent></Card>
        ))}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Segnala Reazione Avversa Farmaco</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800">⚠️ Obbligo legale segnalazione ADR gravi entro 15 giorni al Ministero Salute</div>
            <div><Label>Nome Farmaco</Label><Input value={newReport.drugName} onChange={(e) => setNewReport({...newReport, drugName: e.target.value})} /></div>
            <div><Label>Lotto</Label><Input value={newReport.drugBatch} onChange={(e) => setNewReport({...newReport, drugBatch: e.target.value})} /></div>
            <div><Label>Gravità</Label><Select value={newReport.severity} onValueChange={(v) => setNewReport({...newReport, severity: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{severityLevels.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Descrizione Reazione</Label><Textarea value={newReport.description} onChange={(e) => setNewReport({...newReport, description: e.target.value})} rows={3} /></div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowModal(false)}>Annulla</Button><Button onClick={handleSubmitReport} className="bg-orange-600">Invia Segnalazione</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
