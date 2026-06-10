'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, AlertTriangle, TrendingDown, Search } from 'lucide-react';

export default function InventarioCompleto({ user }) {
  const categories = [
    { name: 'Farmaci', count: 234, value: 12450, lowStock: 12 },
    { name: 'Vaccini', count: 45, value: 3200, lowStock: 3 },
    { name: 'Materiale Chirurgico', count: 89, value: 8900, lowStock: 5 },
    { name: 'Attrezzature', count: 34, value: 45600, lowStock: 0 },
  ];

  const lowStockItems = [
    { name: 'Amoxicillina 500mg', qty: 12, min: 50, expiry: '2025-08-15' },
    { name: 'Vaccino Rabbia', qty: 3, min: 10, expiry: '2025-12-20' },
    { name: 'Guanti Sterili M', qty: 8, min: 100, expiry: '2026-01-10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="h-6 w-6 text-orange-600" />
            Inventario Farmaci Completo
          </h2>
          <p className="text-sm text-gray-500">Gestione completa farmaci, materiali e attrezzature</p>
        </div>
        <Button className="bg-orange-600"><Plus className="h-4 w-4 mr-2" />Nuovo Articolo</Button>
      </div>

      {/* Stats per Categoria */}
      <div className="grid grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <Card key={i} className="hover:shadow-md transition cursor-pointer">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Package className="h-6 w-6 text-orange-600" />
                {cat.lowStock > 0 && <Badge className="bg-red-100 text-red-700 text-xs">{cat.lowStock} bassi</Badge>}
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{cat.name}</h4>
              <p className="text-2xl font-bold text-gray-900">{cat.count}</p>
              <p className="text-xs text-gray-500">Valore: €{cat.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Scorte Basse */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Alert Scorte Basse ({lowStockItems.length})</h3>
          </div>
          <div className="space-y-2">
            {lowStockItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-600">Giacenza: {item.qty} (Min: {item.min}) - Scadenza: {new Date(item.expiry).toLocaleDateString('it-IT')}</p>
                </div>
                <Button size="sm" variant="outline">Ordina</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-4">
          <p className="text-sm text-orange-800"><strong>ℹ️ Funzionalità:</strong> Costo medio ponderato, alert scadenze 30/60gg, ricette automatiche da inventario, report valore magazzino, movimenti tracciati.</p>
        </CardContent>
      </Card>
    </div>
  );
}
