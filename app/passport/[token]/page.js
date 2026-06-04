'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Phone, Mail, MapPin, AlertTriangle, Heart, Shield, PawPrint, Loader2, Send, CheckCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

function formatField(val) {
  if (!val) return '';
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(item => typeof item === 'object' ? (item.name || JSON.stringify(item)) : item).join(', ');
      return val;
    } catch { return val; }
  }
  if (Array.isArray(val)) return val.map(item => typeof item === 'object' ? (item.name || JSON.stringify(item)) : item).join(', ');
  if (typeof val === 'object') return val.name || JSON.stringify(val);
  return String(val);
}

export default function PublicPassportPage() {
  const params = useParams();
  const token = params.token;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState({ finderName: '', finderPhone: '', finderMessage: '' });
  const [reportSent, setReportSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/passport/public/${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(() => setError('Errore di connessione'))
      .finally(() => setLoading(false));
  }, [token]);

  const sendReport = async () => {
    setSending(true);
    try {
      await fetch('/api/passport/lost-pet/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: data.petId, ...reportData }),
      });
      setReportSent(true);
    } catch (e) { console.error(e); }
    setSending(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-coral-500" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-sm w-full">
        <CardContent className="p-6 text-center">
          <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">{error}</p>
        </CardContent>
      </Card>
    </div>
  );

  const pd = data?.publicData || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-coral-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral-500 to-orange-500 text-white text-center py-4 px-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <PawPrint className="h-5 w-5" />
          <span className="font-bold text-lg">VetBuddy Passport</span>
        </div>
        <p className="text-sm opacity-90">Passaporto digitale della salute dell'animale</p>
      </div>

      <div className="max-w-sm mx-auto p-4 space-y-4">
        {/* Lost Pet Alert */}
        {pd.isLostPetMode && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h2 className="text-lg font-bold text-red-700 mb-1">⚠️ ANIMALE SMARRITO</h2>
              <p className="text-sm text-red-600 mb-2">Se hai trovato questo animale, contatta il proprietario!</p>
              {pd.lostPetZone && <p className="text-sm text-red-500">Zona: {pd.lostPetZone}</p>}
              {pd.lostPetMessage && <p className="text-sm text-red-500 mt-1">{pd.lostPetMessage}</p>}
              {pd.lostPetReward && <Badge className="bg-amber-100 text-amber-700 mt-2">💰 Ricompensa: {pd.lostPetReward}</Badge>}
            </CardContent>
          </Card>
        )}

        {/* Pet Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0">
                {pd.photo ? (
                  <img src={pd.photo} alt={pd.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <PawPrint className="h-8 w-8 text-coral-400" />
                )}
              </div>
              <div>
                {pd.name && <h2 className="text-xl font-bold text-gray-900">{pd.name}</h2>}
                <div className="flex flex-wrap gap-1 mt-1">
                  {pd.species && <Badge variant="outline" className="text-xs">{pd.species}</Badge>}
                  {pd.breed && <Badge variant="outline" className="text-xs">{pd.breed}</Badge>}
                </div>
              </div>
            </div>

            {!pd.isLostPetMode && (
              <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg text-center">
                🐾 Se mi hai trovato, contatta il proprietario
              </p>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        {pd.emergencyContacts?.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-1">
                <Phone className="h-4 w-4 text-coral-500" /> Contatti
              </h3>
              <div className="space-y-3">
                {pd.emergencyContacts.map((c, i) => (
                  <div key={i} className="space-y-1">
                    <p className="font-medium text-sm">{c.name} <span className="text-xs text-gray-500">({c.relationship})</span></p>
                    <div className="flex gap-2">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex-1">
                          <Button size="sm" className="w-full bg-green-500 hover:bg-green-600 text-white">
                            <Phone className="h-4 w-4 mr-1" /> Chiama
                          </Button>
                        </a>
                      )}
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <Mail className="h-4 w-4 mr-1" /> Email
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clinic */}
        {pd.clinicName && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                <Heart className="h-4 w-4 text-coral-500" /> Clinica di riferimento
              </h3>
              <p className="text-sm font-medium">{pd.clinicName}</p>
              {pd.clinicPhone && (
                <a href={`tel:${pd.clinicPhone}`}>
                  <Button size="sm" variant="outline" className="mt-2 w-full">
                    <Phone className="h-4 w-4 mr-1" /> Chiama clinica
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Medical Info */}
        {(pd.allergies || pd.medications || pd.chronicConditions) && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-1">
                <Shield className="h-4 w-4 text-red-500" /> Informazioni mediche
              </h3>
              <div className="space-y-2 text-sm">
                {pd.allergies && <div><span className="text-gray-500">Allergie:</span> <span className="font-medium text-red-600">{formatField(pd.allergies)}</span></div>}
                {pd.medications && <div><span className="text-gray-500">Farmaci:</span> <span className="font-medium">{formatField(pd.medications)}</span></div>}
                {pd.chronicConditions && <div><span className="text-gray-500">Patologie:</span> <span className="font-medium">{formatField(pd.chronicConditions)}</span></div>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        {(pd.microchip || pd.city) && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                {pd.microchip && <div><span className="text-gray-500">Microchip:</span> <span className="font-medium">{pd.microchip}</span></div>}
                {pd.city && <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-gray-400" /> <span className="text-gray-600">{pd.city}</span></div>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Found / Lost Pet */}
        {pd.isLostPetMode && !reportSent && (
          <Card className="border-green-300">
            <CardContent className="p-4">
              {!showReport ? (
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={() => setShowReport(true)}>
                  🐾 Ho trovato questo animale
                </Button>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Segnala ritrovamento</h3>
                  <Input placeholder="Il tuo nome" value={reportData.finderName} onChange={e => setReportData({...reportData, finderName: e.target.value})} />
                  <Input placeholder="Il tuo telefono" value={reportData.finderPhone} onChange={e => setReportData({...reportData, finderPhone: e.target.value})} />
                  <Input placeholder="Messaggio (opzionale)" value={reportData.finderMessage} onChange={e => setReportData({...reportData, finderMessage: e.target.value})} />
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={sendReport} disabled={sending}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                    Invia segnalazione
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {reportSent && (
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-green-700 font-medium">Segnalazione inviata! Il proprietario è stato avvisato.</p>
            </CardContent>
          </Card>
        )}

        {/* Privacy Disclaimer */}
        <p className="text-xs text-gray-400 text-center px-4 pb-6">
          🔒 Le informazioni mostrate sono selezionate dal proprietario. La cartella clinica completa non è mai pubblica.
          <br />VetBuddy Passport — vetbuddy.it
        </p>
      </div>
    </div>
  );
}
