'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle, CheckCircle, Clock, Edit, Eye, FileText, Filter, Loader2,
  Pill, Plus, RefreshCw, Search, Send, Trash2, X, XCircle, ClipboardCheck,
  AlertTriangle, Calendar
} from 'lucide-react';
import api from '@/app/lib/api';
import PrescriptionWizard from './PrescriptionWizard';
import PrescriptionDetail from './PrescriptionDetail';

const STATUS_CONFIG = {
  DRAFT: { label: 'Bozza', icon: Edit, color: 'bg-gray-100 text-gray-700 border-gray-300' },
  READY_TO_SEND: { label: 'Pronta', icon: Send, color: 'bg-blue-100 text-blue-700 border-blue-300' },
  SENDING: { label: 'Invio...', icon: Loader2, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  EMITTED: { label: 'Emessa', icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-300' },
  REGISTERED_MANUALLY: { label: 'Registrata', icon: ClipboardCheck, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  ERROR: { label: 'Errore', icon: XCircle, color: 'bg-red-100 text-red-700 border-red-300' },
  CANCELLED: { label: 'Annullata', icon: X, color: 'bg-gray-100 text-gray-400 border-gray-200' }
};

function ClinicPrescriptions({ user, pets = [], owners = [] }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ drafts: 0, emittedToday: 0, errors: 0, total: 0 });
  const [showWizard, setShowWizard] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [revConfig, setRevConfig] = useState({ manualMode: true });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prescData, statsData, configData] = await Promise.all([
        api.get('prescriptions'),
        api.get('prescriptions/stats'),
        api.get('rev/config')
      ]);
      setPrescriptions(Array.isArray(prescData) ? prescData : []);
      setStats(statsData || { drafts: 0, emittedToday: 0, errors: 0, total: 0 });
      setRevConfig(configData || { manualMode: true });
    } catch (err) {
      console.error('Error loading prescriptions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePrescriptionCreated = (newPrescription) => {
    setShowWizard(false);
    loadData();
    setSelectedPrescription(newPrescription);
  };

  const handlePrescriptionUpdated = () => {
    loadData();
    if (selectedPrescription) {
      api.get(`prescriptions/${selectedPrescription.id}`).then(p => setSelectedPrescription(p)).catch(() => {});
    }
  };

  const filtered = prescriptions.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (p.petName?.toLowerCase().includes(q) || p.ownerName?.toLowerCase().includes(q) ||
              p.diagnosisNote?.toLowerCase().includes(q) || p.externalPrescriptionNumber?.toLowerCase().includes(q));
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
        <Icon className={`h-3 w-3 ${status === 'SENDING' ? 'animate-spin' : ''}`} />
        {cfg.label}
      </span>
    );
  };

  if (showWizard) {
    return <PrescriptionWizard user={user} pets={pets} owners={owners} revConfig={revConfig}
      onCreated={handlePrescriptionCreated} onCancel={() => setShowWizard(false)} />;
  }

  if (selectedPrescription) {
    return <PrescriptionDetail prescription={selectedPrescription} user={user} revConfig={revConfig}
      onBack={() => { setSelectedPrescription(null); loadData(); }} onUpdated={handlePrescriptionUpdated} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Pill className="h-6 w-6 text-emerald-600" />
            Prescrizioni Elettroniche (REV)
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {revConfig.manualMode ? '📋 Modalità ponte attiva — Registra le ricette emesse sul portale Vetinfo' : '🔗 Integrazione API Vetinfo attiva'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1" />Aggiorna
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowWizard(true)}>
            <Plus className="h-4 w-4 mr-2" />Nuova Prescrizione
          </Button>
        </div>
      </div>

      {/* Stats Widget */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500 uppercase">Bozze</p><p className="text-2xl font-bold text-gray-700">{stats.drafts}</p></div>
              <Edit className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500 uppercase">Emesse oggi</p><p className="text-2xl font-bold text-green-600">{stats.emittedToday}</p></div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500 uppercase">In errore</p><p className="text-2xl font-bold text-red-600">{stats.errors}</p></div>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500 uppercase">Totale</p><p className="text-2xl font-bold text-indigo-600">{stats.total}</p></div>
              <FileText className="h-8 w-8 text-indigo-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Cerca per paziente, proprietario, diagnosi..." className="pl-10"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { value: 'all', label: 'Tutte' },
            { value: 'DRAFT', label: 'Bozze' },
            { value: 'EMITTED', label: 'Emesse' },
            { value: 'REGISTERED_MANUALLY', label: 'Registrate' },
            { value: 'ERROR', label: 'Errori' }
          ].map(f => (
            <Button key={f.value} variant={filter === f.value ? 'default' : 'outline'} size="sm"
              className={filter === f.value ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => setFilter(f.value)}>
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Prescriptions List */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />Caricamento prescrizioni...
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400">
              {prescriptions.length === 0 ? 'Nessuna prescrizione' : 'Nessun risultato'}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {prescriptions.length === 0 ? 'Crea la tua prima prescrizione elettronica veterinaria' : 'Prova a modificare i filtri di ricerca'}
            </p>
            {prescriptions.length === 0 && (
              <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowWizard(true)}>
                <Plus className="h-4 w-4 mr-2" />Nuova Prescrizione
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <Card key={p.id} className="hover:shadow-md transition cursor-pointer group"
              onClick={() => setSelectedPrescription(p)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      p.status === 'EMITTED' || p.status === 'REGISTERED_MANUALLY' ? 'bg-green-100' :
                      p.status === 'ERROR' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <Pill className={`h-5 w-5 ${
                        p.status === 'EMITTED' || p.status === 'REGISTERED_MANUALLY' ? 'text-green-600' :
                        p.status === 'ERROR' ? 'text-red-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">
                          🐾 {p.petName || 'Paziente'} — {p.ownerName || 'Proprietario'}
                        </p>
                        {getStatusBadge(p.status)}
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {p.diagnosisNote || 'Nessuna diagnosi specificata'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span><Calendar className="h-3 w-3 inline mr-1" />{new Date(p.createdAt).toLocaleDateString('it-IT')}</span>
                        <span>👨‍⚕️ {p.veterinarianName || 'Veterinario'}</span>
                        {p.externalPrescriptionNumber && <span>📋 N° {p.externalPrescriptionNumber}</span>}
                        {(p.items?.length || 0) > 0 && <span>💊 {p.items.length} farmac{p.items.length === 1 ? 'o' : 'i'}</span>}
                      </div>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 transition flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Manual Mode Banner */}
      {revConfig.manualMode && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800">Modalità Ponte Attiva</h4>
              <p className="text-sm text-amber-600 mt-1">
                L&apos;integrazione automatica con il portale Vetinfo non è ancora attiva. Le prescrizioni vengono preparate su VetBuddy 
                e devono essere emesse manualmente sul <a href="https://www.vetinfo.it" target="_blank" rel="noopener noreferrer" className="underline font-medium">portale ufficiale Vetinfo</a>. 
                Dopo l&apos;emissione, registra il numero ricetta e PIN su VetBuddy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClinicPrescriptions;
