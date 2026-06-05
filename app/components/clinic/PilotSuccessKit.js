'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Rocket, CheckCircle, Clock, TrendingUp, Download, FileText, Calendar,
  Target, Award, BarChart3, RefreshCw, Printer, QrCode, Users, MessageCircle
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

export default function PilotSuccessKit({ user, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/business-modules?module=pilot').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="h-8 w-8 animate-spin text-blue-500" /></div>;
  if (!data) return null;

  const { checklist, reports, qrAssets } = data;
  const completedTasks = checklist.filter(c => c.completed).length;
  const progressPercent = Math.round((completedTasks / checklist.length) * 100);

  const getDayRange = () => {
    const start = new Date(data.pilotStartDate);
    const now = new Date();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return '30';
    if (diffDays < 60) return '60';
    return '90';
  };

  const currentDay = getDayRange();

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Rocket className="h-6 w-6 text-blue-500" /> Pilot Success Kit
        </h2>
        <p className="text-gray-500 text-sm">Onboarding 90 giorni, checklist, report e risorse per il successo della tua clinica</p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Programma Pilot 90 Giorni
              </h3>
              <p className="text-sm text-gray-600">Sei al giorno <strong>{currentDay}</strong> del tuo percorso</p>
            </div>
            <Badge className="bg-blue-500 text-white text-lg px-4 py-2">{completedTasks}/{checklist.length} completati</Badge>
          </div>
          <Progress value={progressPercent} className="h-3 mb-2" />
          <p className="text-sm text-gray-600 text-right">{progressPercent}% completato</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="checklist">
        <TabsList className="mb-4">
          <TabsTrigger value="checklist"><CheckCircle className="h-4 w-4 mr-1" /> Checklist Onboarding</TabsTrigger>
          <TabsTrigger value="reports"><BarChart3 className="h-4 w-4 mr-1" /> Report Automatici</TabsTrigger>
          <TabsTrigger value="resources"><QrCode className="h-4 w-4 mr-1" /> Risorse Stampabili</TabsTrigger>
        </TabsList>

        {/* CHECKLIST */}
        <TabsContent value="checklist">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {['30', '60', '90'].map(day => {
              const tasks = checklist.filter(c => c.milestone === `day${day}`);
              const completed = tasks.filter(c => c.completed).length;
              const isCurrent = currentDay === day;
              return (
                <Card key={day} className={`${isCurrent ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'}`}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Giorni 0-{day}
                      {isCurrent && <Badge className="bg-blue-500 text-white text-xs">In corso</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{completed}/{tasks.length} task completati</p>
                    <Progress value={(completed / tasks.length) * 100} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-3">
            {checklist.map((task, i) => (
              <Card key={i} className={task.completed ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${task.completed ? 'bg-green-500' : 'bg-gray-200'}`}>
                      {task.completed ? <CheckCircle className="h-5 w-5 text-white" /> : <Clock className="h-5 w-5 text-gray-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{task.title}</h4>
                        <Badge variant="outline" className="text-xs">{task.milestone === 'day30' ? '0-30gg' : task.milestone === 'day60' ? '31-60gg' : '61-90gg'}</Badge>
                        {task.completed && <Badge className="bg-green-500 text-white text-xs">✓ Fatto</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                    {!task.completed && (
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                        Completa
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports">
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <BarChart3 className="h-4 w-4 inline mr-1" />
              I report vengono generati automaticamente ai giorni 30, 60 e 90 del programma pilot. Riceverai una notifica via email.
            </p>
          </div>

          <div className="space-y-3">
            {reports.map((report, i) => (
              <Card key={i} className={report.status === 'ready' ? 'border-green-300' : 'border-gray-200'}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${report.status === 'ready' ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {report.status === 'ready' ? <CheckCircle className="h-6 w-6 text-green-600" /> : <Clock className="h-6 w-6 text-gray-500" />}
                      </div>
                      <div>
                        <h4 className="font-semibold">{report.title}</h4>
                        <p className="text-sm text-gray-500">{report.description}</p>
                        {report.status === 'ready' && <p className="text-xs text-green-600 mt-1">Generato il {new Date(report.generatedAt).toLocaleDateString('it-IT')}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.status === 'ready' ? (
                        <>
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                            <Download className="h-3 w-3 mr-1" /> Scarica PDF
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-3 w-3 mr-1" /> Condividi
                          </Button>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          <Clock className="h-3 w-3 mr-1" /> In attesa
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                KPI Tracciati nei Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Appuntamenti online vs telefono</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Tempo risparmiato (chiamate + agenda)</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Adozione Passport da parte dei proprietari</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />No-show recuperati</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Messaggi WhatsApp gestiti</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Recensioni ricevute</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Referral convertiti</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />ROI stimato</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RESOURCES */}
        <TabsContent value="resources">
          <div className="grid md:grid-cols-2 gap-4">
            {qrAssets.map((asset, i) => (
              <Card key={i} className="hover:shadow-md transition">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {asset.type === 'qr' ? <QrCode className="h-5 w-5 text-blue-500" /> : <FileText className="h-5 w-5 text-purple-500" />}
                    {asset.name}
                  </CardTitle>
                  <CardDescription>{asset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 rounded-lg p-4 mb-3 flex items-center justify-center">
                    {asset.type === 'qr' ? (
                      <div className="h-32 w-32 bg-white rounded border-2 border-gray-300 flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-gray-400" />
                      </div>
                    ) : (
                      <div className="h-32 w-full bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                      <Download className="h-3 w-3 mr-1" /> Scarica {asset.format}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Printer className="h-3 w-3 mr-1" /> Stampa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 bg-amber-50 border-amber-300">
            <CardContent className="p-4">
              <p className="text-sm text-amber-800">
                <Users className="h-4 w-4 inline mr-1" />
                <strong>Tip:</strong> Posiziona i QR code in sala d&apos;attesa e alla reception. I clienti potranno scansionarli per scaricare l&apos;app e registrarsi autonomamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
