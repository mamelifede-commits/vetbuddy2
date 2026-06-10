'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, TrendingUp } from 'lucide-react';

export default function EcommercePet({ user }) {
  const products = [
    { name: 'Cibo Secco Premium', price: 45.90, stock: 34, sold: 12 },
    { name: 'Antiparassitario', price: 28.50, stock: 56, sold: 8 },
    { name: 'Giochi & Accessori', price: 15.90, stock: 89, sold: 5 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-pink-600" />
            E-commerce Prodotti Pet
          </h2>
          <p className="text-sm text-gray-500">Vendita online cibo, antiparassitari, accessori</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{products.length}</div><p className="text-xs text-gray-500">Prodotti in Catalogo</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-pink-600">{products.reduce((sum, p) => sum + p.sold, 0)}</div><p className="text-xs text-gray-500">Vendite Mese</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">€{products.reduce((sum, p) => sum + (p.price * p.sold), 0).toFixed(2)}</div><p className="text-xs text-gray-500">Revenue E-commerce</p></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {products.map((p, i) => (
          <Card key={i} className="hover:shadow-md transition">
            <CardContent className="p-6 text-center">
              <div className="h-24 bg-pink-50 rounded-lg mb-3 flex items-center justify-center"><Package className="h-12 w-12 text-pink-600" /></div>
              <h4 className="font-semibold text-gray-900 mb-2">{p.name}</h4>
              <p className="text-2xl font-bold text-pink-600 mb-2">€{p.price}</p>
              <p className="text-xs text-gray-500 mb-3">{p.stock} in magazzino - {p.sold} venduti</p>
              <Button size="sm" className="w-full bg-pink-600">Gestisci</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-pink-50 border-pink-200"><CardContent className="p-4"><p className="text-sm text-pink-800"><strong>ℹ️ Revenue Addizionale:</strong> 10-15% fatturato extra. Integrazione e-commerce, spedizioni automatiche, marketing prodotti.</p></CardContent></Card>
    </div>
  );
}
