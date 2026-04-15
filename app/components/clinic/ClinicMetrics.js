'use client';
// ClinicMetrics - Analytics & Metrics Dashboard

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Calendar, Euro, Eye,
  MousePointerClick, Phone, Loader2, RefreshCw, ArrowRight, Clock,
  CheckCircle, XCircle, AlertTriangle, FlaskConical, Activity
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import api from '@/app/lib/api';

const CHART_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

function StatCard({ title, value, delta, deltaLabel, icon: Icon, color, prefix = '', suffix = '' }) {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const colorMap = {
    violet: 'from-violet-500 to-purple-600',
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-emerald-500 to-green-600',
    amber: 'from-amber-500 to-orange-600',
    red: 'from-red-500 to-rose-600',
    pink: 'from-pink-500 to-rose-600'
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div className={`bg-gradient-to-br ${colorMap[color] || colorMap.violet} p-4 flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {prefix}{typeof value === 'number' ? value.toLocaleString('it-IT') : value}{suffix}
            </p>
            {delta !== undefined && delta !== null && (
              <div className="flex items-center gap-1 mt-1">
                {isPositive && <TrendingUp className="h-3 w-3 text-green-500" />}
                {isNegative && <TrendingDown className="h-3 w-3 text-red-500" />}
                {!isPositive && !isNegative && <Activity className="h-3 w-3 text-gray-400" />}
                <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
                  {isPositive ? '+' : ''}{delta} {deltaLabel || 'vs mese scorso'}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ClinicMetrics({ user, onNavigate }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.get('clinic/metrics');
      setMetrics(data);
    } catch (err) {
      console.error('Errore caricamento metriche:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-16">
        <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600">Errore caricamento metriche</h3>
        <Button onClick={loadMetrics} className="mt-4">Riprova</Button>
      </div>
    );
  }

  // Prepare appointment status data for pie chart
  const appointmentStatusData = [
    { name: 'Completati', value: metrics.thisMonth.completedAppointments || 0, color: '#10B981' },
    { name: 'Cancellati', value: metrics.thisMonth.cancelledAppointments || 0, color: '#EF4444' },
    { name: 'No Show', value: metrics.thisMonth.noShowAppointments || 0, color: '#F59E0B' },
    { name: 'Programmati', value: Math.max(0, (metrics.thisMonth.appointments || 0) - (metrics.thisMonth.completedAppointments || 0) - (metrics.thisMonth.cancelledAppointments || 0) - (metrics.thisMonth.noShowAppointments || 0)), color: '#3B82F6' }
  ].filter(d => d.value > 0);

  // Booking funnel data
  const funnelData = [
    { name: 'Visite Profilo', value: metrics.thisMonth.profileViews || 0 },
    { name: 'Prenotazioni Iniziate', value: metrics.thisMonth.bookingStarted || 0 },
    { name: 'Prenotazioni Completate', value: metrics.thisMonth.bookingCompleted || 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-violet-600" />
            Dashboard Metriche
          </h2>
          <p className="text-gray-500 mt-1">Panoramica delle performance della tua clinica</p>
        </div>
        <Button variant="outline" onClick={loadMetrics} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" /> Aggiorna
        </Button>
      </div>

      {/* Summary message */}
      {metrics.message && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4">
          <p className="text-violet-700 font-medium">💡 {metrics.message}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title="Fatturato Mensile"
          value={metrics.thisMonth.fatturato || 0}
          delta={metrics.comparison.fatturatoDelta}
          icon={Euro}
          color="green"
          prefix="€"
        />
        <StatCard
          title="Appuntamenti"
          value={metrics.thisMonth.appointments || 0}
          delta={null}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Nuovi Pazienti"
          value={metrics.thisMonth.newPatients || 0}
          delta={metrics.comparison.patientsDelta}
          icon={Users}
          color="violet"
        />
        <StatCard
          title="Visite Profilo"
          value={metrics.thisMonth.profileViews || 0}
          delta={metrics.comparison.profileViewsDelta}
          icon={Eye}
          color="amber"
        />
        <StatCard
          title="Prenotazioni Online"
          value={metrics.thisMonth.bookingCompleted || 0}
          delta={metrics.comparison.bookingsDelta}
          icon={MousePointerClick}
          color="pink"
        />
        <StatCard
          title="Tasso Conversione"
          value={metrics.thisMonth.conversionRate || 0}
          delta={null}
          icon={TrendingUp}
          color="blue"
          suffix="%"
        />
        <StatCard
          title="Analisi Lab"
          value={metrics.thisMonth.labRequests || 0}
          delta={metrics.comparison.labRequestsDelta}
          icon={FlaskConical}
          color="violet"
        />
        <StatCard
          title="Telefonate Risparmiate"
          value={metrics.thisMonth.phoneCallsSaved || 0}
          delta={null}
          icon={Phone}
          color="green"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Euro className="h-5 w-5 text-green-600" />
              Andamento Fatturato
            </CardTitle>
            <CardDescription>Ultimi 6 mesi</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.monthlyRevenue && metrics.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={metrics.monthlyRevenue}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${v}`} />
                  <Tooltip 
                    formatter={(value) => [`€${value.toLocaleString('it-IT')}`, 'Fatturato']}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400">
                <p>Nessun dato fatturato disponibile</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Stato Appuntamenti (Mese)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentStatusData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {appointmentStatusData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-gray-600 flex-1">{entry.name}</span>
                      <span className="text-sm font-semibold text-gray-900">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-gray-400">
                <p>Nessun appuntamento questo mese</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MousePointerClick className="h-5 w-5 text-violet-600" />
              Prenotazioni Settimanali
            </CardTitle>
            <CardDescription>Ultime 4 settimane</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.weeklyData && metrics.weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={metrics.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="bookings" name="Prenotazioni" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="views" name="Visite" fill="#E9D5FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400">
                <p>Nessun dato disponibile</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Funnel Prenotazioni
            </CardTitle>
            <CardDescription>Dal profilo alla prenotazione</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((step, index) => {
                const maxVal = Math.max(...funnelData.map(f => f.value), 1);
                const widthPct = Math.max((step.value / maxVal) * 100, 5);
                const colors = ['bg-violet-500', 'bg-blue-500', 'bg-green-500'];
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{step.name}</span>
                      <span className="font-semibold text-gray-900">{step.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-6">
                      <div 
                        className={`${colors[index]} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                        style={{ width: `${widthPct}%` }}
                      >
                        {step.value > 0 && <span className="text-xs text-white font-medium">{step.value}</span>}
                      </div>
                    </div>
                    {index < funnelData.length - 1 && (
                      <div className="text-center">
                        <ArrowRight className="h-4 w-4 text-gray-300 mx-auto rotate-90" />
                      </div>
                    )}
                  </div>
                );
              })}
              {metrics.thisMonth.conversionRate > 0 && (
                <div className="text-center pt-2 border-t">
                  <Badge className="bg-green-100 text-green-700 text-sm">
                    Tasso di conversione: {metrics.thisMonth.conversionRate}%
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Totals */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50">
        <CardHeader>
          <CardTitle className="text-lg">📊 Totali da Sempre</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-2xl font-bold text-violet-600">{metrics.totals.profileViews || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Visite Profilo</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-2xl font-bold text-blue-600">{metrics.totals.bookingsCompleted || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Prenotazioni Online</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-2xl font-bold text-green-600">{metrics.totals.appointments || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Appuntamenti</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-2xl font-bold text-amber-600">{metrics.totals.patients || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Pazienti Totali</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-2xl font-bold text-emerald-600">€{(metrics.totals.fatturato || 0).toLocaleString('it-IT')}</p>
              <p className="text-xs text-gray-500 mt-1">Fatturato Totale</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      {metrics.recentBookings && metrics.recentBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Ultimi Appuntamenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.recentBookings.slice(0, 8).map((booking) => {
                const statusColors = {
                  scheduled: 'bg-blue-100 text-blue-700',
                  pending: 'bg-yellow-100 text-yellow-700',
                  completato: 'bg-green-100 text-green-700',
                  cancellato: 'bg-red-100 text-red-700',
                  annullato: 'bg-red-100 text-red-700',
                  no_show: 'bg-amber-100 text-amber-700'
                };
                const statusLabels = {
                  scheduled: 'Programmato',
                  pending: 'In Attesa',
                  completato: 'Completato',
                  cancellato: 'Cancellato',
                  annullato: 'Annullato',
                  no_show: 'No Show'
                };
                return (
                  <div key={booking.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{booking.petName || '—'}</span>
                        {booking.ownerName && <span className="text-sm text-gray-500">({booking.ownerName})</span>}
                      </div>
                      <p className="text-sm text-gray-500">{booking.service || booking.reason || 'Visita'}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-700">
                        {booking.date ? new Date(booking.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : '—'}
                      </p>
                      <p className="text-gray-500">{booking.time || ''}</p>
                    </div>
                    {booking.price > 0 && (
                      <span className="text-sm font-semibold text-green-600">€{booking.price}</span>
                    )}
                    <Badge className={statusColors[booking.status] || 'bg-gray-100 text-gray-700'}>
                      {statusLabels[booking.status] || booking.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ClinicMetrics;
