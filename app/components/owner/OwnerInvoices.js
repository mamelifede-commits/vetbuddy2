'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText, PawPrint, Receipt, RefreshCw } from 'lucide-react';

function OwnerInvoices({ invoices = [], pets, onRefresh }) {
  const [downloading, setDownloading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleDownloadInvoice = (doc) => {
    if (doc.content) {
      const link = document.createElement('a');
      if (doc.content.startsWith('data:')) {
        link.href = doc.content;
      } else {
        link.href = `data:application/pdf;base64,${doc.content}`;
      }
      link.download = doc.fileName || doc.name || `Fattura_${doc.invoiceNumber || 'documento'}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
    } else if (doc.id) {
      window.open(`/api/documents/download?id=${doc.id}`, '_blank');
    }
  };

  const handleDownloadAll = async () => {
    if (invoices.length === 0) return;
    setDownloading(true);
    try {
      // Download each invoice individually
      for (const invoice of invoices) {
        handleDownloadInvoice(invoice);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
      }
    } catch (error) {
      alert('Errore nel download');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) return;
    setExporting(true);
    try {
      // Create CSV content
      const headers = ['Numero Fattura', 'Data', 'Importo (€)', 'Animale', 'Clinica', 'Descrizione'];
      const rows = invoices.map(inv => [
        inv.invoiceNumber || inv.name || '',
        new Date(inv.issuedAt || inv.createdAt).toLocaleDateString('it-IT'),
        inv.amount ? inv.amount.toFixed(2) : '',
        inv.petName || '',
        inv.clinicName || '',
        inv.description || ''
      ]);
      
      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
      ].join('\n');
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Fatture_vetbuddy_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      alert('Errore nell\'esportazione');
    } finally {
      setExporting(false);
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Le mie fatture</h2>
          <p className="text-gray-500 text-sm">Fatture dei pagamenti effettuati online</p>
          {invoices.length > 0 && (
            <p className="text-emerald-600 font-semibold mt-1">
              Totale: €{totalAmount.toFixed(2)} ({invoices.length} fattur{invoices.length === 1 ? 'a' : 'e'})
            </p>
          )}
        </div>
        {invoices.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={exporting}
            >
              {exporting ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <FileText className="h-4 w-4 mr-1" />}
              Esporta CSV
            </Button>
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={handleDownloadAll}
              disabled={downloading}
            >
              {downloading ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
              Scarica Tutto
            </Button>
          </div>
        )}
      </div>
      
      {invoices.length === 0 ? (
        <Card className="p-8 text-center">
          <Receipt className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">Nessuna fattura</p>
          <p className="text-sm text-gray-400">Le fatture dei pagamenti online appariranno qui</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const pet = pets?.find(p => p.name === invoice.petName || p.id === invoice.petId);
            return (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow border-emerald-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Fattura {invoice.invoiceNumber || invoice.name}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{new Date(invoice.issuedAt || invoice.createdAt).toLocaleDateString('it-IT')}</span>
                          {invoice.amount && (
                            <span className="font-semibold text-emerald-600">€{invoice.amount.toFixed(2)}</span>
                          )}
                          {invoice.petName && (
                            <span className="flex items-center gap-1">
                              <PawPrint className="h-3 w-3" />
                              {invoice.petName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


export default OwnerInvoices;
