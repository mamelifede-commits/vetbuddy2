'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CalendarX, Clock, AlertTriangle, CheckCircle, Users, TrendingUp,
  RefreshCw, Send, UserCheck, UserX, Bell, ListOrdered, ArrowRight,
  Euro, Phone, BarChart3, Timer, ShieldCheck, ShieldAlert, Shield
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

const RISK_BADGE = { affidabile: { label: '✅ Affidabile', cls: 'bg-green-100 text-green-700' }, attenzione: { label: '⚠️ Attenzione', cls: 'bg-amber-100 text-amber-700' }, alto_rischio: { label: '🔴 Alto rischio', cls: 'bg-red-100 text-red-700' } };

export default function NoShowRecovery({ user, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/app/lib/api').then(({ default: api }) => {
      api.get('business-modules?module=noshow')
        .then(d => { setData(d); setLoading(false); })
        .catch(() => {
          fetch('/api/business-modules?module=noshow').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
        });
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="h-8 w-8 animate-spin text-coral-500" /></div>;
  if (!data) return null;

  const { unconfirmed, noshowHistory, waitlist, recoveredSlots, ownerLabels } = data;
  const totalLost = noshowHistory.reduce((a, n) => a + (n.lostRevenue || 0), 0);
  const totalRecovered = recoveredSlots.reduce((a, s) => a + (s.recoveredValue || 0), 0);
  const highRiskCount = unconfirmed.filter(u => u.risk === 'alto' || u.confirmStatus === 'no_response').length;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><CalendarX className="h-6 w-6 text-coral-500" /> No-Show Recovery</h2>
        <p className="text-gray-500 text-sm">Riduci appuntamenti saltati, recupera slot e misura il valore economico</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"><CardContent className="p-4 text-center"><AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-1" /><p className="text-2xl font-bold text-amber-700">{unconfirmed.length}</p><p className="text-xs text-amber-600">Non confermati</p></CardContent></Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"><CardContent className="p-4 text-center"><UserX className="h-6 w-6 text-red-500 mx-auto mb-1" /><p className="text-2xl font-bold text-red-700">{noshowHistory.length}</p><p className="text-xs text-red-600">No-show registrati</p></CardContent></Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"><CardContent className="p-4 text-center"><CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" /><p className="text-2xl font-bold text-green-700">{recoveredSlots.length}</p><p className="text-xs text-green-600">Slot recuperati</p></CardContent></Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"><CardContent className="p-4 text-center"><Euro className="h-6 w-6 text-blue-500 mx-auto mb-1" /><p className="text-2xl font-bold text-blue-700">€{totalRecovered}</p><p className="text-xs text-blue-600">Valore recuperato</p></CardContent></Card>
      </div>

      <Tabs defaultValue="unconfirmed">
        <TabsList className="mb-4">
          <TabsTrigger value="unconfirmed"><AlertTriangle className="h-4 w-4 mr-1" /> Non confermati <Badge className="bg-amber-500 text-white text-xs ml-1">{unconfirmed.length}</Badge></TabsTrigger>
          <TabsTrigger value="waitlist"><ListOrdered className="h-4 w-4 mr-1" /> Lista d&apos;attesa <Badge variant="outline" className="text-xs ml-1">{waitlist.length}</Badge></TabsTrigger>
          <TabsTrigger value="history"><CalendarX className="h-4 w-4 mr-1" /> Storico No-Show</TabsTrigger>
          <TabsTrigger value="recovered"><CheckCircle className="h-4 w-4 mr-1" /> Slot Recuperati</TabsTrigger>
          <TabsTrigger value="report"><BarChart3 className="h-4 w-4 mr-1" /> Report</TabsTrigger>
        </TabsList>

        {/* UNCONFIRMED */}
        <TabsContent value="unconfirmed">
          {highRiskCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-red-500" />
              <div><p className="font-semibold text-red-800">⚠️ {highRiskCount} appuntament{highRiskCount > 1 ? 'i' : 'o'} ad alto rischio</p><p className="text-sm text-red-600">Questi clienti hanno storico no-show o non rispondono ai promemoria</p></div>
            </div>
          )}
          <div className="space-y-3">
            {unconfirmed.map((appt, i) => {
              const label = ownerLabels[appt.ownerName] || 'affidabile';
              const rb = RISK_BADGE[label] || RISK_BADGE.affidabile;
              return (
                <Card key={i} className={`${appt.risk === 'alto' || appt.confirmStatus === 'no_response' ? 'border-red-300 bg-red-50/30' : appt.risk === 'medio' ? 'border-amber-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${appt.risk === 'alto' ? 'bg-red-100' : appt.risk === 'medio' ? 'bg-amber-100' : 'bg-green-100'}`}>
                          {appt.risk === 'alto' ? <ShieldAlert className="h-5 w-5 text-red-500" /> : appt.risk === 'medio' ? <Shield className="h-5 w-5 text-amber-500" /> : <ShieldCheck className="h-5 w-5 text-green-500" />}
                        </div>
                        <div>
                          <p className="font-semibold">{appt.ownerName} <Badge variant="outline" className="text-xs ml-1">{appt.petName}</Badge></p>
                          <p className="text-sm text-gray-500">{new Date(appt.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })} alle {appt.time} — {appt.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={rb.cls}>{rb.label}</Badge>
                        <Badge variant="outline" className="text-xs"><Bell className="h-3 w-3 mr-1" />{appt.remindersSent} promemoria</Badge>
                        {appt.confirmStatus === 'no_response' && <Badge className="bg-red-500 text-white text-xs">Nessuna risposta</Badge>}
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white"><Send className="h-3 w-3 mr-1" /> Invia promemoria</Button>
                        <Button size="sm" variant="outline"><ArrowRight className="h-3 w-3 mr-1" /> Proponi slot</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* WAITLIST */}
        <TabsContent value="waitlist">
          <div className="space-y-3">
            {waitlist.map((w, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${w.priority === 'alta' ? 'bg-red-100' : w.priority === 'media' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                      <Users className={`h-5 w-5 ${w.priority === 'alta' ? 'text-red-500' : w.priority === 'media' ? 'text-amber-500' : 'text-blue-500'}`} />
                    </div>
                    <div>
                      <p className="font-semibold">{w.ownerName} <Badge variant="outline" className="text-xs ml-1">{w.petName}</Badge></p>
                      <p className="text-sm text-gray-500">{w.reason} — Richiesta: {w.requestedDate}</p>
                      <p className="text-xs text-gray-400">Aggiunto: {new Date(w.addedAt).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={w.priority === 'alta' ? 'text-red-600' : w.priority === 'media' ? 'text-amber-600' : 'text-blue-600'}>Priorità: {w.priority}</Badge>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white"><Phone className="h-3 w-3 mr-1" /> Proponi slot</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* HISTORY */}
        <TabsContent value="history">
          <Card>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr><th className="text-left p-3">Cliente</th><th className="text-left p-3">Animale</th><th className="text-left p-3">Data</th><th className="text-left p-3">Motivo</th><th className="text-left p-3">Etichetta</th><th className="text-right p-3">€ Perso</th></tr></thead>
                  <tbody>
                    {noshowHistory.map((ns, i) => {
                      const label = ownerLabels[ns.ownerName] || 'affidabile';
                      const rb = RISK_BADGE[label] || RISK_BADGE.affidabile;
                      return (
                        <tr key={i} className="border-t"><td className="p-3 font-medium">{ns.ownerName}</td><td className="p-3">{ns.petName}</td><td className="p-3 text-gray-500">{new Date(ns.date).toLocaleDateString('it-IT')}</td><td className="p-3">{ns.reason}</td><td className="p-3"><Badge className={rb.cls}>{rb.label}</Badge></td><td className="p-3 text-right font-semibold text-red-600">€{ns.lostRevenue}</td></tr>
                      );
                    })}
                    <tr className="border-t-2 bg-red-50"><td colSpan={5} className="p-3 font-bold text-red-700">Totale perso</td><td className="p-3 text-right font-bold text-red-700">€{totalLost}</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RECOVERED */}
        <TabsContent value="recovered">
          <Card>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr><th className="text-left p-3">Slot originale</th><th className="text-left p-3">Recuperato da</th><th className="text-left p-3">Data</th><th className="text-left p-3">Motivo</th><th className="text-right p-3">€ Recuperato</th></tr></thead>
                  <tbody>
                    {recoveredSlots.map((s, i) => (
                      <tr key={i} className="border-t"><td className="p-3 text-gray-400 line-through">{s.originalOwner}</td><td className="p-3 font-medium text-green-700">{s.newOwner}</td><td className="p-3 text-gray-500">{new Date(s.date).toLocaleDateString('it-IT')} {s.time}</td><td className="p-3">{s.reason}</td><td className="p-3 text-right font-semibold text-green-600">€{s.recoveredValue}</td></tr>
                    ))}
                    <tr className="border-t-2 bg-green-50"><td colSpan={4} className="p-3 font-bold text-green-700">Totale recuperato</td><td className="p-3 text-right font-bold text-green-700">€{totalRecovered}</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORT */}
        <TabsContent value="report">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200"><CardHeader><CardTitle className="text-base text-red-700">📊 No-Show Report</CardTitle></CardHeader><CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-sm">Appuntamenti non confermati</span><span className="font-bold">{unconfirmed.length}</span></div>
              <div className="flex justify-between"><span className="text-sm">No-show registrati (30gg)</span><span className="font-bold text-red-600">{noshowHistory.length}</span></div>
              <div className="flex justify-between"><span className="text-sm">Revenue persa</span><span className="font-bold text-red-600">€{totalLost}</span></div>
              <div className="flex justify-between"><span className="text-sm">Clienti alto rischio</span><span className="font-bold text-red-600">{Object.values(ownerLabels).filter(l => l === 'alto_rischio').length}</span></div>
            </CardContent></Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"><CardHeader><CardTitle className="text-base text-green-700">✅ Recovery Report</CardTitle></CardHeader><CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-sm">Slot recuperati</span><span className="font-bold text-green-700">{recoveredSlots.length}</span></div>
              <div className="flex justify-between"><span className="text-sm">Revenue recuperata</span><span className="font-bold text-green-700">€{totalRecovered}</span></div>
              <div className="flex justify-between"><span className="text-sm">In lista d&apos;attesa</span><span className="font-bold">{waitlist.length}</span></div>
              <div className="flex justify-between"><span className="text-sm">Tempo risparmiato (stima)</span><span className="font-bold text-blue-600">~{Math.round(recoveredSlots.length * 8)} min</span></div>
            </CardContent></Card>
            <Card className="md:col-span-2"><CardContent className="p-4"><p className="text-xs text-gray-500 italic">💡 Caparra gestita esternamente dalla clinica. VetBuddy traccia solo conferme, cancellazioni e no-show per aiutare nella gestione degli appuntamenti.</p></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
