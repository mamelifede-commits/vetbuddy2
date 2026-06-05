'use client';
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload, Download, FileText, Users, PawPrint, Calendar, CheckCircle,
  AlertTriangle, X, FileSpreadsheet, Info, ArrowRight, Database
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

export default function ImportExport({ user, onNavigate }) {
  const [importType, setImportType] = useState('owners');
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setImportResult(null);
    } else {
      alert('Per favore seleziona un file CSV valido');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);

    // Simula validazione e import
    setTimeout(() => {
      const mockResult = {
        total: 145,
        success: 138,
        failed: 7,
        errors: [
          { row: 12, field: 'email', reason: 'Email duplicata: mario.rossi@example.com' },
          { row: 34, field: 'phone', reason: 'Formato telefono non valido: 123' },
          { row: 67, field: 'petName', reason: 'Nome animale mancante' },
          { row: 89, field: 'species', reason: 'Specie non riconosciuta: "gatto persiano" (usa "gatto")' },
          { row: 102, field: 'birthDate', reason: 'Data di nascita non valida: 32/13/2020' },
          { row: 118, field: 'ownerName', reason: 'Nome proprietario mancante' },
          { row: 134, field: 'email', reason: 'Email non valida: mario@example' },
        ],
      };
      setImportResult(mockResult);
      setImporting(false);
    }, 3000);
  };

  const handleExport = (type) => {
    alert(`Download CSV ${type} avviato! (Funzionalità demo)`);
  };

  const downloadTemplate = (type) => {
    alert(`Download template CSV per ${type} avviato! (Funzionalità demo)`);
  };

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6 text-green-500" /> Import / Export Dati
        </h2>
        <p className="text-gray-500 text-sm">Importa ed esporta dati di proprietari, animali e appuntamenti in formato CSV</p>
      </div>

      <Tabs defaultValue="import">
        <TabsList className="mb-4">
          <TabsTrigger value="import"><Upload className="h-4 w-4 mr-1" /> Importa Dati</TabsTrigger>
          <TabsTrigger value="export"><Download className="h-4 w-4 mr-1" /> Esporta Dati</TabsTrigger>
        </TabsList>

        {/* IMPORT */}
        <TabsContent value="import">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className={`cursor-pointer hover:shadow-md transition ${importType === 'owners' ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`} onClick={() => setImportType('owners')}>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-semibold mb-1">Proprietari</h4>
                <p className="text-xs text-gray-500">Nome, cognome, email, telefono, indirizzo</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:shadow-md transition ${importType === 'pets' ? 'border-green-400 bg-green-50' : 'border-gray-200'}`} onClick={() => setImportType('pets')}>
              <CardContent className="p-4 text-center">
                <PawPrint className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h4 className="font-semibold mb-1">Animali</h4>
                <p className="text-xs text-gray-500">Nome, specie, razza, data nascita, proprietario</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:shadow-md transition ${importType === 'appointments' ? 'border-purple-400 bg-purple-50' : 'border-gray-200'}`} onClick={() => setImportType('appointments')}>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h4 className="font-semibold mb-1">Appuntamenti</h4>
                <p className="text-xs text-gray-500">Data, ora, animale, motivo, stato</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Carica file CSV</CardTitle>
              <CardDescription>
                Seleziona un file CSV per <strong>{importType === 'owners' ? 'proprietari' : importType === 'pets' ? 'animali' : 'appuntamenti'}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 bg-blue-50 border-blue-300">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Prima di importare:</strong> Scarica il template CSV qui sotto e compila i campi richiesti. Il sistema validerà automaticamente i dati prima dell&apos;import.
                </AlertDescription>
              </Alert>

              <div className="mb-4">
                <Button variant="outline" size="sm" onClick={() => downloadTemplate(importType)}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  Scarica template CSV per {importType === 'owners' ? 'proprietari' : importType === 'pets' ? 'animali' : 'appuntamenti'}
                </Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:border-blue-400 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                {file ? (
                  <div>
                    <p className="font-semibold text-green-600 mb-1"><FileText className="h-4 w-4 inline mr-1" />{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold mb-1">Clicca per selezionare un file CSV</p>
                    <p className="text-sm text-gray-500">oppure trascina il file qui</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />

              {file && (
                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white" onClick={handleImport} disabled={importing}>
                    {importing ? (
                      <>
                        <ArrowRight className="h-4 w-4 mr-1 animate-pulse" />
                        Importazione in corso...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-1" />
                        Avvia importazione
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => { setFile(null); setImportResult(null); }}>
                    <X className="h-4 w-4 mr-1" />
                    Annulla
                  </Button>
                </div>
              )}

              {importing && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Validazione e importazione dati...</p>
                  <Progress value={65} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import Result */}
          {importResult && (
            <Card className={importResult.failed > 0 ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {importResult.failed > 0 ? <AlertTriangle className="h-5 w-5 text-amber-600" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
                  Importazione completata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{importResult.total}</p>
                    <p className="text-sm text-gray-600">Record totali</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
                    <p className="text-sm text-gray-600">Importati con successo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                    <p className="text-sm text-gray-600">Errori</p>
                  </div>
                </div>

                {importResult.failed > 0 && (
                  <div className="bg-white rounded-lg border border-amber-300 p-4">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Errori rilevati ({importResult.errors.length})
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {importResult.errors.map((err, i) => (
                        <div key={i} className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                          <p className="font-medium text-red-700">Riga {err.row} - Campo: <code className="bg-red-100 px-1 rounded">{err.field}</code></p>
                          <p className="text-red-600 text-xs mt-1">{err.reason}</p>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="mt-3">
                      <Download className="h-3 w-3 mr-1" />
                      Scarica log errori completo
                    </Button>
                  </div>
                )}

                {importResult.failed === 0 && (
                  <Alert className="bg-green-100 border-green-300">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">
                      ✅ Tutti i dati sono stati importati correttamente! Puoi visualizzarli nelle rispettive sezioni.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* EXPORT */}
        <TabsContent value="export">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Proprietari
                </CardTitle>
                <CardDescription>Esporta tutti i dati dei proprietari registrati</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Include: nome, cognome, email, telefono, indirizzo, data registrazione</p>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleExport('proprietari')}>
                  <Download className="h-4 w-4 mr-1" />
                  Esporta Proprietari
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PawPrint className="h-5 w-5 text-green-500" />
                  Animali
                </CardTitle>
                <CardDescription>Esporta tutti i dati degli animali registrati</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Include: nome, specie, razza, data nascita, microchip, proprietario</p>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={() => handleExport('animali')}>
                  <Download className="h-4 w-4 mr-1" />
                  Esporta Animali
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Appuntamenti
                </CardTitle>
                <CardDescription>Esporta storico appuntamenti</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Include: data, ora, animale, proprietario, motivo, stato, note</p>
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white" onClick={() => handleExport('appuntamenti')}>
                  <Download className="h-4 w-4 mr-1" />
                  Esporta Appuntamenti
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 bg-gray-50 border-gray-300">
            <CardContent className="p-4">
              <p className="text-sm text-gray-700">
                <Info className="h-4 w-4 inline mr-1" />
                <strong>Nota:</strong> I file CSV esportati seguono lo stesso formato dei template di import e possono essere aperti con Excel, Google Sheets o qualsiasi editor CSV.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
