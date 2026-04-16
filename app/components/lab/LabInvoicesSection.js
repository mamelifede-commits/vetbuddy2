'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Loader2, Receipt, RefreshCw } from 'lucide-react';
import api from '@/app/lib/api';

export default function LabInvoicesSection() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInvoices(); }, []);

  const loadInvoices = async () => {
    try {
      const data = await api.get('lab/invoices');
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-12 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" />Caricamento fatture...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Receipt className="h-6 w-6 text-green-600" />Fatture Proforma</h2>
          <p className="text-gray-500 text-sm">Fatture emesse automaticamente dopo i pagamenti ricevuti</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadInvoices}><RefreshCw className="h-4 w-4 mr-1" />Aggiorna</Button>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400">Nessuna fattura</h3>
            <p className="text-sm text-gray-400 mt-1">Le fatture proforma verranno generate automaticamente dopo ogni pagamento ricevuto dalle cliniche.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <Card key={inv.id} className="hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{inv.invoiceNumber}</p>
                      <p className="text-sm text-gray-500">{inv.clinicName} \u2014 {inv.examType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">\u20ac{inv.totals?.total?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{inv.issueDate || new Date(inv.date).toLocaleDateString('it-IT')}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                  {inv.petName && <span>\ud83d\udc3e {inv.petName}</span>}
                  <span>IVA: \u20ac{inv.totals?.vatAmount?.toFixed(2)}</span>
                  {inv.totals?.bolloAmount > 0 && <span>Bollo: \u20ac{inv.totals.bolloAmount.toFixed(2)}</span>}
                  <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Pagato</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
