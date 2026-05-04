'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, PhoneOff, CalendarCheck, Clock, Bell, Users, Shield,
  Euro, FileText, FlaskConical, Repeat, BarChart3, Download, RefreshCw,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import api from '@/app/lib/api';

export default function ClinicValueDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // month, quarter, year

  useEffect(() => { loadMetrics(); }, [period]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.get(`clinic/value-metrics?period=${period}`);
      setMetrics(data);
    } catch (err) {
      // Use calculated estimates if API not available
      setMetrics(generateEstimates());
    } finally {
      setLoading(false);
    }
  };

  const generateEstimates = () => {
    // Generate estimates based on typical clinic data
    return {
      period: period,
      bookingsGenerated: { value: 0, label: 'Prenotazioni generate online' },
      callsAvoided: { value: 0, label: 'Telefonate evitate (stimate)' },
      hoursStaffSaved: { value: 0, label: 'Ore risparmiate dallo staff' },
      remindersSent: { value: 0, label: 'Reminder inviati' },
      appointmentsConfirmed: { value: 0, label: 'Appuntamenti confermati' },
      appointmentsCancelled: { value: 0, label: 'Appuntamenti cancellati/recuperati' },
      noShowAvoided: { value: 0, label: 'No-show stimati evitati' },
      clientsReactivated: { value: 0, label: 'Clienti riattivati' },
      vaccineRecalls: { value: 0, label: 'Richiami vaccinali prenotati' },
      estimatedRevenue: { value: 0, label: 'Fatturato stimato generato' },
      labRequestsManaged: { value: 0, label: 'Richieste laboratorio gestite' },
      documentsAutoSent: { value: 0, label: 'Documenti inviati automaticamente' },
    };
  };

  const periodLabels = { month: 'Questo mese', quarter: 'Ultimo trimestre', year: 'Ultimo anno' };

  // Calculate metrics from real platform data
  const getMetricCards = () => {
    if (!metrics) return [];
    return [
      { icon: CalendarCheck, label: 'Prenotazioni online generate', value: metrics.bookingsGenerated?.value || 0, suffix: '', color: 'text-green-600', bgColor: 'bg-green-50', trend: 'up' },
      { icon: PhoneOff, label: 'Telefonate evitate (stimate)', value: metrics.callsAvoided?.value || 0, suffix: '', color: 'text-red-500', bgColor: 'bg-red-50', trend: 'up', info: '~3 telefonate evitate per prenotazione online' },
      { icon: Clock, label: 'Ore risparmiate dallo staff', value: metrics.hoursStaffSaved?.value || 0, suffix: 'h', color: 'text-blue-600', bgColor: 'bg-blue-50', trend: 'up', info: '~5 min risparmiati per ogni reminder/prenotazione automatica' },
      { icon: Bell, label: 'Reminder inviati', value: metrics.remindersSent?.value || 0, suffix: '', color: 'text-amber-600', bgColor: 'bg-amber-50', trend: 'neutral' },
      { icon: CalendarCheck, label: 'Appuntamenti confermati', value: metrics.appointmentsConfirmed?.value || 0, suffix: '', color: 'text-teal-600', bgColor: 'bg-teal-50', trend: 'up' },
      { icon: Shield, label: 'No-show evitati (stimati)', value: metrics.noShowAvoided?.value || 0, suffix: '', color: 'text-purple-600', bgColor: 'bg-purple-50', trend: 'up', info: '~60% riduzione no-show con reminder automatici' },
      { icon: Repeat, label: 'Clienti riattivati', value: metrics.clientsReactivated?.value || 0, suffix: '', color: 'text-orange-600', bgColor: 'bg-orange-50', trend: 'up', info: 'Clienti inattivi da 6+ mesi che hanno prenotato' },
      { icon: Bell, label: 'Richiami vaccinali prenotati', value: metrics.vaccineRecalls?.value || 0, suffix: '', color: 'text-emerald-600', bgColor: 'bg-emerald-50', trend: 'up' },
      { icon: Euro, label: 'Fatturato stimato generato', value: metrics.estimatedRevenue?.value || 0, suffix: '€', prefix: '€', color: 'text-green-700', bgColor: 'bg-green-50', trend: 'up', info: 'Calcolato: prenotazioni × valore medio visita della clinica', highlight: true },
      { icon: FlaskConical, label: 'Richieste Lab gestite', value: metrics.labRequestsManaged?.value || 0, suffix: '', color: 'text-indigo-600', bgColor: 'bg-indigo-50', trend: 'neutral' },
      { icon: FileText, label: 'Documenti inviati automaticamente', value: metrics.documentsAutoSent?.value || 0, suffix: '', color: 'text-cyan-600', bgColor: 'bg-cyan-50', trend: 'neutral' },
      { icon: Users, label: 'Appuntamenti cancellati/recuperati', value: metrics.appointmentsCancelled?.value || 0, suffix: '', color: 'text-slate-600', bgColor: 'bg-slate-50', trend: 'neutral' },
    ];
  };

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" /> Valore Generato
          </h2>
          <p className="text-gray-500 text-sm mt-1">Quanto tempo, prenotazioni e fatturato VetBuddy genera per la tua clinica.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {['month', 'quarter', 'year'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${period === p ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {p === 'month' ? 'Mese' : p === 'quarter' ? 'Trimestre' : 'Anno'}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={loadMetrics}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-700">{metrics?.bookingsGenerated?.value || 0}</p>
              <p className="text-xs text-green-600 mt-1">Prenotazioni</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{metrics?.callsAvoided?.value || 0}</p>
              <p className="text-xs text-red-500 mt-1">Telefonate evitate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{metrics?.hoursStaffSaved?.value || 0}h</p>
              <p className="text-xs text-blue-600 mt-1">Ore risparmiate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-700">€{metrics?.estimatedRevenue?.value || 0}</p>
              <p className="text-xs text-emerald-600 mt-1">Fatturato stimato</p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-4 italic">{periodLabels[period]} • Le stime vengono aggiornate in tempo reale basandosi sull'attività della clinica</p>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getMetricCards().map((card, i) => (
          <Card key={i} className={`transition hover:shadow-md ${card.highlight ? 'ring-2 ring-green-200 border-green-300' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{card.label}</p>
                    <p className={`text-xl font-bold ${card.color}`}>
                      {card.prefix || ''}{card.value.toLocaleString('it-IT')}{card.suffix || ''}
                    </p>
                  </div>
                </div>
                <TrendIcon trend={card.trend} />
              </div>
              {card.info && <p className="text-[10px] text-gray-400 mt-2 ml-13">{card.info}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How metrics are calculated */}
      <Card className="border-dashed border-gray-300">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-400" /> Come calcoliamo queste metriche
          </h4>
          <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-500">
            <div><strong>Telefonate evitate:</strong> ~3 telefonate risparmiate per ogni prenotazione online + 1 per ogni reminder inviato</div>
            <div><strong>Ore risparmiate:</strong> ~5 min per prenotazione online + ~2 min per ogni reminder automatico</div>
            <div><strong>No-show evitati:</strong> Basato sulla riduzione media del 60% con reminder 24h prima</div>
            <div><strong>Fatturato stimato:</strong> Prenotazioni generate × valore medio visita + clienti riattivati × valore medio</div>
          </div>
        </CardContent>
      </Card>

      {/* Pilot note */}
      <div className="bg-coral-50 border border-coral-200 rounded-lg p-4 text-center">
        <p className="text-sm text-coral-700">
          <strong>📊 Report mensile:</strong> A fine mese ricevi un report dettagliato con tutti i dati di valore generato.
          Utile per giustificare l'investimento e misurare il ROI della piattaforma.
        </p>
      </div>
    </div>
  );
}
