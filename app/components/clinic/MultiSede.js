'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, TrendingUp, Users, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

export default function MultiSede({ user }) {
  const [locations, setLocations] = useState([
    { id: 1, name: 'Clinica Milano Centro', city: 'Milano', staff: 8, patients: 234, revenue: 45200, status: 'active' },
    { id: 2, name: 'Clinica Milano Sud', city: 'Milano', staff: 5, patients: 156, revenue: 28900, status: 'active' },
    { id: 3, name: 'Clinica Monza', city: 'Monza', staff: 4, patients: 98, revenue: 19800, status: 'active' },
  ]);

  const totalStats = {
    locations: locations.length,
    staff: locations.reduce((sum, l) => sum + l.staff, 0),
    patients: locations.reduce((sum, l) => sum + l.patients, 0),
    revenue: locations.reduce((sum, l) => sum + l.revenue, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Multi-Sede & Gestione Catene
          </h2>
          <p className="text-sm text-gray-500">Dashboard consolidato per catene veterinarie multi-sede</p>
        </div>
        <Button className="bg-blue-600"><Plus className="h-4 w-4 mr-2" />Aggiungi Sede</Button>
      </div>

      {/* Stats Consolidato */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <Building2 className="h-8 w-8 text-blue-600 mb-2" />
            <div className="text-3xl font-bold text-blue-900">{totalStats.locations}</div>
            <p className="text-sm text-blue-700">Sedi Totali</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Users className="h-8 w-8 text-purple-600 mb-2" />
            <div className="text-3xl font-bold text-gray-900">{totalStats.staff}</div>
            <p className="text-sm text-gray-500">Staff Totale</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Users className="h-8 w-8 text-green-600 mb-2" />
            <div className="text-3xl font-bold text-gray-900">{totalStats.patients}</div>
            <p className="text-sm text-gray-500">Pazienti Attivi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <TrendingUp className="h-8 w-8 text-emerald-600 mb-2" />
            <div className="text-3xl font-bold text-gray-900">€{totalStats.revenue.toLocaleString()}</div>
            <p className="text-sm text-gray-500">Fatturato Mese</p>
          </CardContent>
        </Card>
      </div>

      {/* Elenco Sedi */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Sedi della Catena</h3>
        <div className="grid gap-3">
          {locations.map(location => (
            <Card key={location.id} className="hover:shadow-lg transition cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{location.name}</h4>
                        <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Attiva</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{location.city}</span>
                        <span>{location.staff} staff</span>
                        <span>{location.patients} pazienti</span>
                        <span className="font-semibold text-emerald-600">€{location.revenue.toLocaleString()}/mese</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline"><ArrowRight className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800"><strong>ℹ️ Funzionalità Multi-Sede:</strong> Trasferimento pazienti tra sedi, inventario condiviso, KPI comparativi, gestione staff centralizzata. Ideale per catene veterinarie.</p>
        </CardContent>
      </Card>
    </div>
  );
}
