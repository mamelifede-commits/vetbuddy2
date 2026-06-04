'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlaskConical, FileCheck, Download, Eye, Loader2 } from 'lucide-react';

export default function PetLabReportsTab({ petId, petName }) {
  const [labReports, setLabReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('vetbuddy_token');
        const res = await fetch(`/api/pets/${petId}/lab-reports`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setLabReports(Array.isArray(data) ? data : data.reports || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [petId]);

  const downloadReport = (report) => {
    if (report.fileContent) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${report.fileContent}`;
      link.download = report.fileName || 'referto.pdf';
      link.click();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-indigo-500" />
          Referti Analisi di Laboratorio
        </CardTitle>
        <p className="text-sm text-gray-500">Risultati delle analisi di laboratorio per {petName}</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
            <p className="text-sm text-gray-500 mt-2">Caricamento referti...</p>
          </div>
        ) : labReports.length === 0 ? (
          <div className="py-12 text-center">
            <FlaskConical className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">Nessun referto disponibile</h3>
            <p className="text-sm text-gray-500 mt-2">I referti delle analisi di laboratorio appariranno qui quando saranno disponibili.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {labReports.map(report => (
              <div key={report.id} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileCheck className="h-5 w-5 text-indigo-600" />
                      <h4 className="font-semibold text-gray-900">{report.examName || report.examType || 'Referto'}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{report.fileName}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>📅 {new Date(report.uploadedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span>🏥 {report.uploadedByName || 'Laboratorio'}</span>
                    </div>
                    {report.clinicNotes && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs font-medium text-amber-700 mb-1">📝 Note del veterinario:</p>
                        <p className="text-sm text-gray-700">{report.clinicNotes}</p>
                      </div>
                    )}
                    {report.reportNotes && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-100">
                        <p className="text-xs font-medium text-indigo-700 mb-1">Note dal laboratorio:</p>
                        <p className="text-sm text-gray-700">{report.reportNotes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600" onClick={() => downloadReport(report)}>
                      <Download className="h-4 w-4 mr-1" /> Scarica PDF
                    </Button>
                    {report.fileContent && (
                      <Button size="sm" variant="outline" onClick={() => {
                        const pdfWindow = window.open('');
                        pdfWindow.document.write(`<iframe width='100%' height='100%' src='data:application/pdf;base64,${report.fileContent}'></iframe>`);
                      }}>
                        <Eye className="h-4 w-4 mr-1" /> Visualizza
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
