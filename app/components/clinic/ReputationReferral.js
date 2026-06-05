'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Star, Users, TrendingUp, Send, RefreshCw, CheckCircle, Clock,
  ExternalLink, Copy, Gift, Share2, UserPlus, Heart, Award, MessageCircle, Mail
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

export default function ReputationReferral({ user, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetch('/api/business-modules?module=reviews-referrals').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const copyReferralCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="h-8 w-8 animate-spin text-amber-500" /></div>;
  if (!data) return null;

  const { reviews, referrals, googlePlaceholder } = data;
  const avgRating = reviews.requests.filter(r => r.status === 'completed').reduce((a, r) => a + (r.rating || 0), 0) / reviews.requests.filter(r => r.status === 'completed').length || 0;
  const completedReviews = reviews.requests.filter(r => r.status === 'completed').length;
  const pendingReviews = reviews.requests.filter(r => r.status === 'sent').length;
  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter(r => r.status === 'converted').length;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-500" /> Crescita e Recensioni
        </h2>
        <p className="text-gray-500 text-sm">Gestisci recensioni post-visita e programma referral &quot;Porta un amico&quot;</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-700">{avgRating.toFixed(1)} ⭐</p>
            <p className="text-xs text-amber-600">Rating medio</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700">{completedReviews}</p>
            <p className="text-xs text-green-600">Recensioni ricevute</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{totalReferrals}</p>
            <p className="text-xs text-blue-600">Referral totali</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-700">{completedReferrals}</p>
            <p className="text-xs text-purple-600">Referral convertiti</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reviews">
        <TabsList className="mb-4">
          <TabsTrigger value="reviews"><Star className="h-4 w-4 mr-1" /> Recensioni <Badge variant="outline" className="ml-1 text-xs">{completedReviews}</Badge></TabsTrigger>
          <TabsTrigger value="referrals"><Gift className="h-4 w-4 mr-1" /> Porta un Amico <Badge variant="outline" className="ml-1 text-xs">{totalReferrals}</Badge></TabsTrigger>
          <TabsTrigger value="google"><ExternalLink className="h-4 w-4 mr-1" /> Google Reviews</TabsTrigger>
        </TabsList>

        {/* REVIEWS */}
        <TabsContent value="reviews">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Richieste inviate automaticamente dopo ogni visita</p>
            </div>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <Send className="h-4 w-4 mr-1" /> Invia richiesta manuale
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {reviews.requests.map((req, i) => (
              <Card key={i} className={req.status === 'completed' ? 'border-green-200 bg-green-50/30' : req.status === 'sent' ? 'border-amber-200' : 'border-gray-200'}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{req.ownerName}</p>
                      <p className="text-xs text-gray-500">{req.petName}</p>
                    </div>
                    {req.status === 'completed' ? (
                      <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Completata</Badge>
                    ) : req.status === 'sent' ? (
                      <Badge className="bg-amber-500 text-white"><Clock className="h-3 w-3 mr-1" />In attesa</Badge>
                    ) : (
                      <Badge variant="outline">Non inviata</Badge>
                    )}
                  </div>
                  {req.status === 'completed' && (
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className={`h-4 w-4 ${idx < req.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mb-2">Inviata: {new Date(req.sentAt).toLocaleDateString('it-IT')}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {req.channel === 'whatsapp' ? <MessageCircle className="h-3 w-3 mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
                      {req.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pendingReviews > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <Clock className="h-4 w-4 inline mr-1" />
                Hai <strong>{pendingReviews} richieste in attesa</strong> di risposta. Le recensioni vengono inviate automaticamente 24h dopo la visita.
              </p>
            </div>
          )}
        </TabsContent>

        {/* REFERRALS */}
        <TabsContent value="referrals">
          <div className="mb-4">
            <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2"><Gift className="h-5 w-5 text-purple-600" />Programma &quot;Porta un Amico&quot;</h3>
                    <p className="text-sm text-gray-700 mt-1">Ogni cliente riceve un codice unico. Quando porta un amico, entrambi ricevono uno sconto del 15% sulla prossima visita.</p>
                  </div>
                  <Button onClick={() => setShowReferralModal(true)} className="bg-purple-500 hover:bg-purple-600 text-white">
                    <Share2 className="h-4 w-4 mr-1" /> Invia codici
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {referrals.map((ref, i) => (
              <Card key={i} className={ref.status === 'converted' ? 'border-green-300 bg-green-50/30' : ref.status === 'used' ? 'border-blue-200' : 'border-gray-200'}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${ref.status === 'converted' ? 'bg-green-100' : ref.status === 'used' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {ref.status === 'converted' ? <Award className="h-5 w-5 text-green-600" /> : ref.status === 'used' ? <UserPlus className="h-5 w-5 text-blue-600" /> : <Share2 className="h-5 w-5 text-gray-600" />}
                      </div>
                      <div>
                        <p className="font-semibold">{ref.ownerName}</p>
                        <p className="text-xs text-gray-500">Codice: <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-purple-600">{ref.code}</code></p>
                        {ref.referredName && <p className="text-xs text-green-600 mt-1"><UserPlus className="h-3 w-3 inline mr-1" />Ha portato: <strong>{ref.referredName}</strong></p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ref.status === 'converted' ? (
                        <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Convertito</Badge>
                      ) : ref.status === 'used' ? (
                        <Badge className="bg-blue-500 text-white">Usato</Badge>
                      ) : (
                        <Badge variant="outline">Attivo</Badge>
                      )}
                      <Button size="sm" variant="outline" onClick={() => copyReferralCode(ref.code)}>
                        {copiedCode ? <CheckCircle className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                        {copiedCode ? 'Copiato!' : 'Copia'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <Heart className="h-4 w-4 inline mr-1" />
              I codici referral vengono inviati automaticamente dopo la prima visita completata. Puoi inviarli manualmente in qualsiasi momento.
            </p>
          </div>
        </TabsContent>

        {/* GOOGLE REVIEWS */}
        <TabsContent value="google">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-blue-500" />
                Google Reviews Integration
              </CardTitle>
              <CardDescription>Collega il tuo profilo Google My Business per raccogliere recensioni</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="mb-4">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">🚀 Funzionalità in arrivo</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Presto potrai inviare link diretti per le recensioni Google ai tuoi clienti via WhatsApp o email, e monitorare tutte le recensioni direttamente da VetBuddy.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 italic">Segnaposto: Link recensione Google</p>
                  <Input readOnly value={googlePlaceholder} className="mt-2 text-center font-mono text-sm" />
                </div>
                <Button variant="outline" disabled>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Configura integrazione (Disponibile a breve)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Referral Send Modal */}
      {showReferralModal && (
        <Dialog open={showReferralModal} onOpenChange={setShowReferralModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-purple-500" />
                Invia Codici Referral
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Seleziona i clienti a cui vuoi inviare il codice referral &quot;Porta un Amico&quot;.</p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800 mb-2"><strong>Messaggio che verrà inviato:</strong></p>
                <p className="text-sm text-gray-700 italic">&quot;Ciao! 🎁 Ti piace VetBuddy? Porta un amico e riceverete entrambi il 15% di sconto sulla prossima visita! Il tuo codice personale è: <strong>[CODICE]</strong>&quot;</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReferralModal(false)}>Annulla</Button>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                <Send className="h-4 w-4 mr-1" /> Invia a tutti i clienti attivi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
