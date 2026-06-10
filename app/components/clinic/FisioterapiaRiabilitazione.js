'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Calendar, TrendingUp, Video, FileText, Building2, MapPin, Star, Send } from 'lucide-react';

export default function FisioterapiaRiabilitazione() {
  const [patients] = useState([
    { name: 'Rocky', owner: 'Esposito', issue: 'Post-chirurgia LCA', sessions: 8, progress: 65, nextSession: '2025-06-12', type: 'inhouse' },
    { name: 'Luna', owner: 'Ferrari', issue: 'Displasia anche', sessions: 12, progress: 82, nextSession: '2025-06-15', type: 'inhouse' },
  ]);

  const [referredPatients] = useState([
    { name: 'Max', owner: 'Bianchi', issue: 'Lesione neurologica', center: 'VetRehab Milano', sessions: 4, progress: 35, status: 'In corso' },
    { name: 'Mia', owner: 'Verdi', issue: 'Artrosi grave', center: 'FisioVet Center', sessions: 10, progress: 78, status: 'Quasi completato' },
  ]);

  const [rehabCenters] = useState([
    { name: 'VetRehab Milano', distance: '8 km', rating: 4.9, reviews: 127, price: '€60/sessione', equipment: ['Idroterapia', 'TENS', 'Laser'], patients: 450 },
    { name: 'FisioVet Center', distance: '12 km', rating: 4.7, reviews: 89, price: '€55/sessione', equipment: ['Idroterapia', 'Ultrasuoni'], patients: 280 },
    { name: 'Rehab&Wellness Vet', distance: '15 km', rating: 4.8, reviews: 156, price: '€65/sessione', equipment: ['Idroterapia', 'TENS', 'Laser', 'Criocamera'], patients: 520 },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-6 w-6 text-teal-500" />
          <h2 className="text-2xl font-bold text-gray-900">Fisioterapia & Riabilitazione</h2>
          <Badge className="bg-teal-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">Due modalità: <strong>In-House</strong> (gestisci internamente con video-esercizi e tracking) oppure <strong>Network</strong> (invia a centri specializzati con marketplace integrato). Recupero +40% più veloce.</p>
      </div>

      <Tabs defaultValue="inhouse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inhouse">Fisioterapia In-House</TabsTrigger>
          <TabsTrigger value="network">Network Centri</TabsTrigger>
          <TabsTrigger value="referred">Pazienti Inviati</TabsTrigger>
        </TabsList>

        <TabsContent value="inhouse" className="space-y-4 mt-4">
          <Card className="border-teal-200 bg-teal-50/30">
            <CardHeader>
              <CardTitle className="text-lg">Pazienti in Riabilitazione In-House</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patients.map((p, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{p.name} • {p.owner}</h3>
                      <p className="text-sm text-gray-600">{p.issue}</p>
                    </div>
                    <Badge className="bg-teal-600">Sessione {p.sessions}</Badge>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progresso riabilitazione</span>
                      <span className="font-bold">{p.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-400 to-green-500" style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                    <Calendar className="h-3 w-3" />
                    <span>Prossima sessione: {p.nextSession}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Video className="h-3 w-3 mr-1" />
                      Video esercizi
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="h-3 w-3 mr-1" />
                      Piano riabilitativo
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-teal-200">
              <CardHeader>
                <CardTitle className="text-sm">Protocolli Disponibili</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { title: 'Post-chirurgia Ortopedica', sessions: '12-16 settimane' },
                  { title: 'Displasia Anca/Gomito', sessions: '8-12 settimane' },
                  { title: 'Artrosi Cronica', sessions: 'Mantenimento continuo' },
                  { title: 'Recupero Obesità', sessions: '6-10 settimane' },
                ].map((protocol, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-900">{protocol.title}</span>
                    <span className="text-gray-600">{protocol.sessions}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
              <CardHeader>
                <CardTitle className="text-sm">Tecniche Integrate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                {['🏊 Idroterapia & Underwater Treadmill', '⚡ Elettrostimolazione (TENS/NMES)', '🔴 Laserterapia LLLT', '🔵 Ultrasuoni terapeutici', '💆 Massoterapia & stretching'].map((technique, i) => (
                  <div key={i} className="text-gray-700">{technique}</div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4 mt-4">
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Marketplace Centri Fisioterapia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rehabCenters.map((center, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{center.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{center.distance}</span>
                        <Star className="h-3 w-3 text-amber-500 fill-current" />
                        <span className="text-xs text-gray-900 font-medium">{center.rating}</span>
                        <span className="text-xs text-gray-500">({center.reviews} recensioni)</span>
                      </div>
                    </div>
                    <Badge className="bg-purple-600 text-white">{center.patients}+ pazienti</Badge>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-1">Attrezzature:</p>
                    <div className="flex flex-wrap gap-1">
                      {center.equipment.map((eq, j) => (
                        <Badge key={j} variant="outline" className="text-xs">{eq}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-purple-600">{center.price}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Vedi Profilo</Button>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Send className="h-3 w-3 mr-1" />
                        Invia Paziente
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referred" className="space-y-4 mt-4">
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-lg">Pazienti Inviati a Centri Partner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {referredPatients.map((p, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{p.name} • {p.owner}</h3>
                      <p className="text-sm text-gray-600">{p.issue}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">{p.center}</span>
                      </div>
                    </div>
                    <Badge className={p.progress > 70 ? 'bg-green-600' : 'bg-blue-600'}>{p.status}</Badge>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Sessioni completate: {p.sessions}</span>
                      <span className="font-bold">{p.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Vedi Progressi</Button>
                    <Button size="sm" variant="outline">Messaggio Centro</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">23</div>
                <div className="text-xs text-gray-600">Pazienti inviati (6 mesi)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">87%</div>
                <div className="text-xs text-gray-600">Completion rate</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Recupero più veloce', value: '+40%', color: 'text-green-600' },
          { icon: Activity, label: 'Piani attivi', value: '47', color: 'text-teal-600' },
          { icon: Building2, label: 'Centri partner', value: '12', color: 'text-purple-600' },
          { icon: FileText, label: 'Compliance', value: '91%', color: 'text-blue-600' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <s.icon className={`h-6 w-6 ${s.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-600">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

      <Card className="border-teal-200 bg-teal-50/30">
        <CardHeader>
          <CardTitle className="text-lg">Pazienti in Riabilitazione</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patients.map((p, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{p.name} • {p.owner}</h3>
                  <p className="text-sm text-gray-600">{p.issue}</p>
                </div>
                <Badge className="bg-teal-600">Sessione {p.sessions}</Badge>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progresso riabilitazione</span>
                  <span className="font-bold">{p.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-green-500" style={{ width: `${p.progress}%` }}></div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                <Calendar className="h-3 w-3" />
                <span>Prossima sessione: {p.nextSession}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Video className="h-3 w-3 mr-1" />
                  Video esercizi
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="h-3 w-3 mr-1" />
                  Piano riabilitativo
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg">Protocolli Disponibili</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { title: 'Post-chirurgia Ortopedica', sessions: '12-16 settimane' },
              { title: 'Displasia Anca/Gomito', sessions: '8-12 settimane' },
              { title: 'Artrosi Cronica', sessions: 'Mantenimento continuo' },
              { title: 'Recupero Obesità', sessions: '6-10 settimane' },
              { title: 'Lesioni Neurologiche', sessions: '16-24 settimane' },
            ].map((protocol, i) => (
              <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                <span className="font-medium text-gray-900">{protocol.title}</span>
                <span className="text-xs text-gray-600">{protocol.sessions}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-lg">Tecniche Integrate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              '🏊 Idroterapia & Underwater Treadmill',
              '⚡ Elettrostimolazione (TENS/NMES)',
              '🔴 Laserterapia LLLT',
              '🔵 Ultrasuoni terapeutici',
              '💆 Massoterapia & stretching passivo',
              '🎯 Esercizi propriocettivi',
              '🏋️ Kinesiologia attiva',
            ].map((technique, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-700">
                <span>{technique}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Recupero più veloce', value: '+40%', color: 'text-green-600' },
          { icon: Activity, label: 'Piani attivi', value: '47', color: 'text-teal-600' },
          { icon: Calendar, label: 'Sessioni/mese', value: '156', color: 'text-blue-600' },
          { icon: FileText, label: 'Compliance', value: '91%', color: 'text-purple-600' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <s.icon className={`h-6 w-6 ${s.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-600">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
