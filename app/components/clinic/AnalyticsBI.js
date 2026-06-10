'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, PieChart, Calendar, Download } from 'lucide-react';

export default function AnalyticsBI({ user }) {
  const kpis = [
    { label: 'Fatturato', value: '€45.2K', change: '+12%', trend: 'up' },
    { label: 'Visite', value: '234', change: '+8%', trend: 'up' },
    { label: 'Ticket Medio', value: '€193', change: '+3%', trend: 'up' },
    { label: 'No-Show Rate', value: '4.2%', change: '-2%', trend: 'down' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-cyan-600" />
            Analytics & BI Avanzati
          </h2>
          <p className="text-sm text-gray-500">Dashboard personalizzabili e report su misura</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export Report</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="hover:shadow-md transition">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
              <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
              <div className={`text-xs font-semibold ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.change} vs mese scorso
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dashboard Widgets */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-cyan-600" />
              <h3 className="font-semibold text-gray-900">Fatturato per Servizio</h3>
            </div>
            <div className="h-48 bg-white rounded-lg flex items-center justify-center text-gray-400">
              [Grafico Interattivo]</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Distribuzione Clienti</h3>
            </div>
            <div className="h-48 bg-white rounded-lg flex items-center justify-center text-gray-400">[Grafico a Torta]</div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'Dashboard Drag & Drop', desc: 'Personalizza layout e widget' },
          { title: 'Report Custom', desc: 'Crea report su misura in Excel/PDF' },
          { title: 'Benchmark Anonimo', desc: 'Confronta vs altre cliniche italiane' },
          { title: 'Previsioni AI', desc: 'Forecast fatturato con machine learning' },
          { title: 'Alert Automatici', desc: 'Notifiche per anomalie e trend negativi' },
          { title: 'Export Automatico', desc: 'Report mensili inviati via email' },
        ].map((f, i) => (
          <Card key={i} className="hover:shadow-md transition">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">{f.title}</h4>
              <p className="text-xs text-gray-600">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-cyan-50 border-cyan-200">
        <CardContent className="p-4">
          <p className="text-sm text-cyan-800"><strong>ℹ️ Business Intelligence:</strong> Trasforma VetBuddy in "HubSpot Analytics per veterinari". Decision-making data-driven.</p>
        </CardContent>
      </Card>
    </div>
  );
}
