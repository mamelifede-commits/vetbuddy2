'use client';
// ClinicBookingLink - Direct Booking Link Management

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Link2, Copy, Check, QrCode, ExternalLink, Share2, 
  Globe, Eye, Loader2, RefreshCw, Smartphone, Edit, Save,
  CheckCircle, AlertCircle, MousePointerClick, TrendingUp
} from 'lucide-react';
import api from '@/app/lib/api';

function ClinicBookingLink({ user, onNavigate }) {
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookingLink();
  }, []);

  const loadBookingLink = async () => {
    setLoading(true);
    try {
      const data = await api.get('clinic/booking-link');
      setBookingData(data);
      setNewSlug(data.slug || '');
    } catch (err) {
      console.error('Errore caricamento link:', err);
    }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    if (!bookingData?.bookingUrl) return;
    try {
      await navigator.clipboard.writeText(bookingData.bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = bookingData.bookingUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const updateSlug = async () => {
    if (!newSlug || newSlug.trim().length < 3) {
      setError('Il link deve essere almeno 3 caratteri');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await api.post('clinic/booking-link', { slug: newSlug });
      if (result.success) {
        setBookingData(prev => ({ ...prev, slug: result.slug, bookingUrl: result.bookingUrl }));
        setEditing(false);
      }
    } catch (err) {
      setError(err.message || 'Errore aggiornamento link');
    }
    setSaving(false);
  };

  const generateQR = async () => {
    setQrLoading(true);
    try {
      const result = await api.post('clinic/qr-code', {});
      if (result.success) {
        setQrCode(result.qrCodeDataUrl);
      }
    } catch (err) {
      console.error('Errore generazione QR:', err);
    }
    setQrLoading(false);
  };

  const shareLink = async () => {
    if (!bookingData?.bookingUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Prenota da ${bookingData.clinicName}`,
          text: `Prenota il tuo appuntamento veterinario online presso ${bookingData.clinicName}`,
          url: bookingData.bookingUrl
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.download = `qr-prenotazione-${bookingData?.slug || 'clinica'}.png`;
    link.href = qrCode;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Link2 className="h-7 w-7 text-violet-600" />
            Link di Prenotazione
          </h2>
          <p className="text-gray-500 mt-1">Condividi il tuo link per ricevere prenotazioni online senza login</p>
        </div>
        <Button variant="outline" onClick={loadBookingLink} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" /> Aggiorna
        </Button>
      </div>

      {/* Main booking URL card */}
      <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-700">
            <Globe className="h-5 w-5" />
            Il tuo link di prenotazione
          </CardTitle>
          <CardDescription>
            I clienti possono prenotare direttamente senza creare un account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL display */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-lg border-2 border-violet-300 px-4 py-3 font-mono text-sm text-violet-700 truncate">
              {bookingData?.bookingUrl || 'Caricamento...'}
            </div>
            <Button 
              onClick={copyToClipboard}
              className={copied ? 'bg-green-500 hover:bg-green-600' : 'bg-violet-600 hover:bg-violet-700'}
            >
              {copied ? <><Check className="h-4 w-4 mr-2" /> Copiato!</> : <><Copy className="h-4 w-4 mr-2" /> Copia</>}
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={shareLink} className="flex items-center gap-2">
              <Share2 className="h-4 w-4" /> Condividi
            </Button>
            <Button variant="outline" onClick={() => window.open(bookingData?.bookingUrl, '_blank')} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" /> Anteprima
            </Button>
            <Button variant="outline" onClick={generateQR} disabled={qrLoading} className="flex items-center gap-2">
              {qrLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
              Genera QR Code
            </Button>
            <Button variant="outline" onClick={() => setEditing(!editing)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" /> Personalizza URL
            </Button>
          </div>

          {/* Edit slug */}
          {editing && (
            <div className="bg-white rounded-lg p-4 border space-y-3">
              <Label className="text-sm font-medium">Personalizza il tuo link</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">{bookingData?.bookingUrl?.replace(bookingData?.slug, '')}</span>
                <Input 
                  value={newSlug}
                  onChange={(e) => { setNewSlug(e.target.value); setError(''); }}
                  placeholder="nome-clinica"
                  className="flex-1"
                />
                <Button onClick={updateSlug} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  Salva
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {error}
                </p>
              )}
            </div>
          )}

          {/* QR Code display */}
          {qrCode && (
            <div className="bg-white rounded-lg p-6 border text-center space-y-4">
              <h3 className="font-semibold text-gray-700">QR Code per la prenotazione</h3>
              <img src={qrCode} alt="QR Code Prenotazione" className="mx-auto w-48 h-48" />
              <p className="text-sm text-gray-500">Stampalo e posizionalo in reception o nel materiale promozionale</p>
              <Button variant="outline" onClick={downloadQR}>
                Scarica QR Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Smartphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Senza Registrazione</h3>
                <p className="text-sm text-blue-600 mt-1">
                  Il proprietario inserisce solo nome, telefono e dati dell'animale. Nessun login richiesto.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <MousePointerClick className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Richiesta Automatica</h3>
                <p className="text-sm text-green-600 mt-1">
                  Ogni prenotazione arriva come richiesta nell'agenda. Tu confermi con un click.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">Traccia le Metriche</h3>
                <p className="text-sm text-amber-600 mt-1">
                  Visualizza quante visite al profilo, prenotazioni e conversioni generi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Come usare il link di prenotazione</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">📱</span>
              <div>
                <h4 className="font-medium text-gray-900">WhatsApp & Social</h4>
                <p className="text-sm text-gray-600">Condividi il link nei messaggi ai clienti, su Facebook o Instagram</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🏥</span>
              <div>
                <h4 className="font-medium text-gray-900">Reception</h4>
                <p className="text-sm text-gray-600">Stampa il QR Code e mettilo in sala d'attesa o al bancone</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">📧</span>
              <div>
                <h4 className="font-medium text-gray-900">Email & Newsletter</h4>
                <p className="text-sm text-gray-600">Inserisci il link nelle email di promemoria e newsletter</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🌐</span>
              <div>
                <h4 className="font-medium text-gray-900">Sito Web</h4>
                <p className="text-sm text-gray-600">Aggiungi un pulsante "Prenota Online" sul tuo sito che rimanda al link</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile completeness check */}
      {bookingData && !bookingData.profileComplete && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800">Completa il profilo per risultati migliori</h3>
                <p className="text-sm text-amber-600 mt-1">
                  Aggiungi indirizzo, telefono e città nelle <button onClick={() => onNavigate?.('settings')} className="underline font-medium">Impostazioni</button> per rendere la tua pagina di prenotazione più completa e professionale.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ClinicBookingLink;
