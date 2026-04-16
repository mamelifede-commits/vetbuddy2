'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, CheckCircle, Code, Copy, Key, Loader2, RefreshCw, Shield, ToggleLeft, ToggleRight, Zap } from 'lucide-react';
import api from '@/app/lib/api';

export default function LabIntegrationTab() {
  const [integrationData, setIntegrationData] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [loadingIntegration, setLoadingIntegration] = useState(true);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => { loadIntegration(); }, []);

  const loadIntegration = async () => {
    setLoadingIntegration(true);
    try {
      const [data, logs] = await Promise.all([
        api.get('lab/integration'),
        api.get('lab/webhook-logs').catch(() => [])
      ]);
      setIntegrationData(data);
      setWebhookLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error('Error loading integration:', err);
    } finally {
      setLoadingIntegration(false);
    }
  };

  const handleGenerateApiKey = async () => {
    setGeneratingKey(true);
    try {
      const result = await api.post('lab/generate-api-key', {});
      setShowApiKey(result.apiKey);
      await loadIntegration();
    } catch (err) {
      alert('Errore: ' + err.message);
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleToggleIntegration = async () => {
    try {
      await api.post('lab/toggle-integration', {});
      await loadIntegration();
    } catch (err) {
      alert('Errore: ' + err.message);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Zap className="h-6 w-6 text-amber-500" />Integrazione API</h2>
          <p className="text-sm text-gray-500 mt-1">Connetti il tuo software di laboratorio a VetBuddy</p>
        </div>
        {integrationData?.configured && (
          <Button variant="outline" size="sm" onClick={handleToggleIntegration}>
            {integrationData.isActive ? <><ToggleRight className="h-4 w-4 mr-1 text-green-500" /> Attiva</> : <><ToggleLeft className="h-4 w-4 mr-1 text-gray-400" /> Disattivata</>}
          </Button>
        )}
      </div>

      {loadingIntegration ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Key className="h-5 w-5 text-violet-500" /> API Key</h3>
              {integrationData?.hasApiKey ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">API Key attuale</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1 break-all">{integrationData.apiKeyMasked}</code>
                    </div>
                    {integrationData.isActive ? <Badge className="mt-2 bg-green-100 text-green-700">\u2705 Integrazione attiva</Badge> : <Badge className="mt-2 bg-gray-100 text-gray-600">\u23f8 Integrazione disattivata</Badge>}
                  </div>
                  {showApiKey && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm font-bold text-amber-800 mb-2">\u26a0\ufe0f Copia la tua API Key ora! Non verr\u00e0 mostrata di nuovo.</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1 break-all text-green-700">{showApiKey}</code>
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(showApiKey, 'apiKey')}>
                          {copiedField === 'apiKey' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={handleGenerateApiKey} disabled={generatingKey} className="text-amber-600 border-amber-300 hover:bg-amber-50">
                    {generatingKey ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                    Rigenera API Key
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-1">Nessuna API Key configurata</p>
                  <p className="text-sm text-gray-400 mb-4">Genera una API Key per connettere il tuo software</p>
                  <Button onClick={handleGenerateApiKey} disabled={generatingKey} className="bg-violet-600 hover:bg-violet-700">
                    {generatingKey ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Key className="h-4 w-4 mr-1" />}
                    Genera API Key
                  </Button>
                  {showApiKey && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 text-left">
                      <p className="text-sm font-bold text-amber-800 mb-2">\u26a0\ufe0f Copia la tua API Key ora! Non verr\u00e0 mostrata di nuovo.</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1 break-all text-green-700">{showApiKey}</code>
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(showApiKey, 'apiKey')}>
                          {copiedField === 'apiKey' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Code className="h-5 w-5 text-blue-500" /> Documentazione API</h3>
              <p className="text-sm text-gray-600 mb-4">Usa questi endpoint per integrare il tuo software di laboratorio con VetBuddy.</p>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-100 text-green-700 font-mono text-xs">GET</Badge>
                    <code className="text-sm font-mono">/api/webhook/lab/<span className="text-violet-600">{'{'}<span className="italic">API_KEY</span>{'}'}</span>/pending-requests</code>
                  </div>
                  <p className="text-sm text-gray-600">Recupera tutte le richieste di analisi in attesa per il tuo laboratorio.</p>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-700 font-mono text-xs">POST</Badge>
                    <code className="text-sm font-mono">/api/webhook/lab/<span className="text-violet-600">{'{'}<span className="italic">API_KEY</span>{'}'}</span>/update-status</code>
                  </div>
                  <p className="text-sm text-gray-600">Aggiorna lo stato di una richiesta.</p>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-700 font-mono text-xs">POST</Badge>
                    <code className="text-sm font-mono">/api/webhook/lab/<span className="text-violet-600">{'{'}<span className="italic">API_KEY</span>{'}'}</span>/upload-report</code>
                  </div>
                  <p className="text-sm text-gray-600">Carica un referto PDF per una richiesta specifica.</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm text-indigo-800 flex items-center gap-1"><Shield className="h-4 w-4" /> <strong>Sicurezza:</strong> L'API Key identifica il tuo laboratorio. Non condividerla e ruotala periodicamente.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-green-500" /> Log Chiamate API</h3>
                <Button variant="outline" size="sm" onClick={loadIntegration}><RefreshCw className="h-4 w-4 mr-1" /> Aggiorna</Button>
              </div>
              {webhookLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium">Evento</th>
                        <th className="text-left p-3 font-medium">Metodo</th>
                        <th className="text-left p-3 font-medium">Stato</th>
                        <th className="text-left p-3 font-medium">Data/Ora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {webhookLogs.map(log => (
                        <tr key={log.id} className="border-t">
                          <td className="p-3">
                            <span className="font-medium">{log.eventType === 'fetch_pending_requests' ? '\ud83d\udce5 Fetch richieste' : log.eventType === 'update_status' ? '\ud83d\udd04 Aggiornamento stato' : log.eventType === 'upload_report' ? '\ud83d\udcc4 Upload referto' : log.eventType}</span>
                            {log.requestId && <p className="text-xs text-gray-400">ID: {log.requestId.slice(0, 8)}...</p>}
                          </td>
                          <td className="p-3"><Badge variant="outline" className="text-xs font-mono">{log.method}</Badge></td>
                          <td className="p-3">{log.success ? <Badge className="bg-green-100 text-green-700 text-xs">OK</Badge> : <Badge className="bg-red-100 text-red-700 text-xs">Errore</Badge>}</td>
                          <td className="p-3 text-gray-500">{log.processedAt ? new Date(log.processedAt).toLocaleString('it-IT') : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">Nessuna chiamata API registrata</p>
                  <p className="text-xs text-gray-400">Le chiamate appariranno qui dopo aver configurato l'integrazione</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
