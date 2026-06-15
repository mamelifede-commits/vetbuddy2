'use client';
// Public Lab Profile Page - /laboratorio/[slug]
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, MapPin, Phone, Mail, Globe, Clock, Truck, CheckCircle, Loader2, Heart, ArrowLeft, Euro } from 'lucide-react';

export default function PublicLabProfilePage() {
  const params = useParams();
  const slug = params?.slug;
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/laboratorio/${slug}`)
      .then(async r => {
        if (r.status === 404) { setNotFound(true); return; }
        const d = await r.json();
        setLab(d);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );

  if (notFound || !lab) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Laboratorio non trovato</h2>
          <p className="text-gray-600 mb-6">Il laboratorio cercato non è presente nella rete VetBuddy o non è pubblico.</p>
          <Button onClick={() => window.location.href = '/directory'} className="bg-blue-500 hover:bg-blue-600 text-white">
            <ArrowLeft className="h-4 w-4 mr-1" /> Torna alla Directory
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Raggruppa prezzi per categoria
  const groupedPrices = lab.priceList.reduce((acc, p) => {
    const cat = p.category || 'Generale';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80">
            <Heart className="h-6 w-6 text-coral-500" />
            <span className="font-bold text-lg text-gray-800">VetBuddy</span>
          </a>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/directory'}>
            <ArrowLeft className="h-4 w-4 mr-1" />Directory
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero card */}
        <Card className="shadow-md mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                {lab.photo ? (
                  <img src={lab.photo} alt={lab.name} className="h-20 w-20 rounded-2xl object-cover" />
                ) : (
                  <FlaskConical className="h-10 w-10 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />Verificato
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">Laboratorio Partner</Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{lab.name}</h1>
                {lab.city && (
                  <p className="text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />{lab.city}
                  </p>
                )}
                {lab.description && <p className="text-gray-700 mt-3 leading-relaxed">{lab.description}</p>}
              </div>
            </div>

            {/* Contact info grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100">
              {lab.address && (
                <div className="text-xs">
                  <p className="text-gray-400 mb-0.5">Indirizzo</p>
                  <p className="text-gray-700 font-medium">{lab.address}</p>
                </div>
              )}
              {lab.phone && (
                <div className="text-xs">
                  <p className="text-gray-400 mb-0.5">Telefono</p>
                  <p className="text-gray-700 font-medium flex items-center gap-1"><Phone className="h-3 w-3" />{lab.phone}</p>
                </div>
              )}
              {lab.email && (
                <div className="text-xs">
                  <p className="text-gray-400 mb-0.5">Email</p>
                  <p className="text-gray-700 font-medium flex items-center gap-1"><Mail className="h-3 w-3" />{lab.email}</p>
                </div>
              )}
              {lab.website && (
                <div className="text-xs">
                  <p className="text-gray-400 mb-0.5">Sito web</p>
                  <a href={lab.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium flex items-center gap-1">
                    <Globe className="h-3 w-3" />{lab.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="info">
          <TabsList className="mb-6">
            <TabsTrigger value="info"><FlaskConical className="h-4 w-4 mr-1" />Informazioni</TabsTrigger>
            {lab.priceList.length > 0 && (
              <TabsTrigger value="prices"><Euro className="h-4 w-4 mr-1" />Listino ({lab.priceList.length})</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="info">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Specializzazioni */}
              {lab.specializations.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">🔬 Specializzazioni</h3>
                    <div className="flex flex-wrap gap-2">
                      {lab.specializations.map((s, i) => (
                        <Badge key={i} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tempi medi */}
              {lab.averageReportTime && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" />Tempi medi referti</h3>
                    <p className="text-gray-700">{lab.averageReportTime}</p>
                  </CardContent>
                </Card>
              )}

              {/* Ritiro campioni */}
              {lab.pickupAvailable && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-500" />Ritiro campioni</h3>
                    <p className="text-emerald-600 font-medium">Disponibile</p>
                    {lab.pickupDays.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">Giorni: {lab.pickupDays.join(', ')}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* CTA */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">🏥 Sei una clinica?</h3>
                  <p className="text-sm text-gray-600 mb-3">Collegati a {lab.name} via VetBuddy per inviare richieste digitali.</p>
                  <Button onClick={() => window.location.href = '/login?mode=register&role=clinic'} className="bg-blue-500 hover:bg-blue-600 text-white w-full">
                    Iscrivi la tua clinica
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {lab.priceList.length > 0 && (
            <TabsContent value="prices">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-4 italic">Prezzi indicativi. Le cliniche partner riceveranno preventivi personalizzati.</p>
                  {Object.entries(groupedPrices).map(([cat, items]) => (
                    <div key={cat} className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2 text-sm">{cat}</h4>
                      <div className="space-y-1">
                        {items.map(p => (
                          <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 truncate">{p.examName}</p>
                              {p.turnaroundDays && <p className="text-xs text-gray-500">Refertazione: {p.turnaroundDays} giorni</p>}
                            </div>
                            <Badge variant="outline" className="text-sm">€ {p.price}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Questo laboratorio è parte della rete <strong>VetBuddy Connect</strong></p>
          <p className="mt-1">🌐 Tre attori, un solo ecosistema. <a href="/directory" className="text-blue-600 hover:underline">Esplora la Directory</a></p>
        </div>
      </main>
    </div>
  );
}
