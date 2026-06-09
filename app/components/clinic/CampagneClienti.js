'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Megaphone, Users, Send, Eye, Calendar, CheckCircle, TrendingUp,
  Plus, Mail, MessageCircle, Bell, Target, Sparkles, RefreshCw
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

const CAMPAIGN_TEMPLATES = [
  { id: 'dental', name: 'Mese Prevenzione Dentale', icon: '🦷', target: 'Tutti i proprietari', message: 'A Marzo pulizia dentale scontata del 20%!' },
  { id: 'vaccine', name: 'Richiami Vaccinali', icon: '💉', target: 'Pet con vaccino in scadenza', message: 'È ora del richiamo vaccinale per {petName}' },
  { id: 'senior', name: 'Controllo Senior', icon: '👴', target: 'Pet senior (7+ anni)', message: 'Check-up senior: monitora la salute di {petName}' },
  { id: 'parasite', name: 'Antiparassitario Stagionale', icon: '🦟', target: 'Tutti i proprietari', message: 'Primavera: proteggi {petName} da pulci e zecche' },
  { id: 'puppy', name: 'Check-up Cuccioli', icon: '🐶', target: 'Cuccioli (<1 anno)', message: 'Il primo anno è fondamentale: prenota il check-up' },
  { id: 'inactive', name: 'Recupero Clienti Inattivi', icon: '🔄', target: 'Inattivi da 6+ mesi', message: 'Ci manchi! Torna a trovarci con uno sconto del 15%' },
  { id: 'sterilization', name: 'Campagna Sterilizzazione', icon: '🏥', target: 'Pet non sterilizzati', message: 'Sterilizzazione: salute e prevenzione per {petName}' },
  { id: 'healthplan', name: 'Promozione Piani Salute', icon: '❤️', target: 'Clienti senza piano', message: 'Piano Salute: copertura annuale a prezzo fisso' },
];

export default function CampagneClienti({ user, onNavigate }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    const demo = [
      { id: '1', template: 'dental', name: 'Marzo - Mese del Sorriso', status: 'inviata', sentAt: new Date(Date.now() - 5 * 86400000).toISOString(), completedAt: new Date(Date.now() - 5 * 86400000).toISOString(), targetCount: 234, sentCount: 234, openedCount: 187, bookingsGenerated: 23, channel: 'email' },
      { id: '2', template: 'vaccine', name: 'Richiami Aprile 2025', status: 'programmata', scheduledAt: new Date(Date.now() + 7 * 86400000).toISOString(), targetCount: 156, channel: 'whatsapp' },
      { id: '3', template: 'inactive', name: 'Recupero Clienti Q1', status: 'inviata', sentAt: new Date(Date.now() - 15 * 86400000).toISOString(), completedAt: new Date(Date.now() - 15 * 86400000).toISOString(), targetCount: 89, sentCount: 89, openedCount: 45, bookingsGenerated: 12, clientsReactivated: 12, channel: 'email' },
      { id: '4', template: 'senior', name: 'Check-up Senior Spring', status: 'inviata', sentAt: new Date(Date.now() - 10 * 86400000).toISOString(), completedAt: new Date(Date.now() - 10 * 86400000).toISOString(), targetCount: 67, sentCount: 67, openedCount: 54, bookingsGenerated: 18, channel: 'email' },
      { id: '5', template: 'puppy', name: 'Benvenuto Cuccioli 2025', status: 'bozza', targetCount: 45, channel: 'whatsapp' },
      { id: '6', template: 'parasite', name: 'Antiparassitari Primavera', status: 'programmata', scheduledAt: new Date(Date.now() + 3 * 86400000).toISOString(), targetCount: 298, channel: 'email' },
      { id: '7', template: 'sterilization', name: 'Sterilizzazione Responsabile', status: 'inviata', sentAt: new Date(Date.now() - 30 * 86400000).toISOString(), completedAt: new Date(Date.now() - 30 * 86400000).toISOString(), targetCount: 123, sentCount: 123, openedCount: 98, bookingsGenerated: 15, channel: 'owner_area' },
      { id: '8', template: 'healthplan', name: 'Piani Salute 2025', status: 'completata', sentAt: new Date(Date.now() - 60 * 86400000).toISOString(), completedAt: new Date(Date.now() - 60 * 86400000).toISOString(), targetCount: 456, sentCount: 456, openedCount: 312, bookingsGenerated: 34, channel: 'email' },
    ];
    setCampaigns(demo);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const map = {
      bozza: { label: 'Bozza', cls: 'bg-gray-100 text-gray-700' },
      programmata: { label: 'Programmata', cls: 'bg-blue-100 text-blue-700' },
      inviata: { label: 'Inviata', cls: 'bg-green-100 text-green-700' },
      completata: { label: 'Completata', cls: 'bg-purple-100 text-purple-700' },
    };
    return <Badge className={map[status]?.cls || map.bozza.cls}>{map[status]?.label || status}</Badge>;
  };

  const getChannelIcon = (channel) => {
    const map = {
      email: <Mail className="h-4 w-4" />,
      whatsapp: <MessageCircle className="h-4 w-4" />,
      owner_area: <Bell className="h-4 w-4" />,
    };
    return map[channel] || <Mail className="h-4 w-4" />;
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'inviata' || c.status === 'programmata').length,
    bookings: campaigns.reduce((sum, c) => sum + (c.bookingsGenerated || 0), 0),
    reactivated: campaigns.reduce((sum, c) => sum + (c.clientsReactivated || 0), 0),
  };

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="h-8 w-8 animate-spin text-purple-500" /></div>;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-purple-500" /> Campagne Clienti
        </h2>
        <p className="text-gray-500 text-sm">Invia campagne mirate automatiche per riattivare clienti e generare prenotazioni</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Megaphone className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-700">{stats.total}</p>
            <p className="text-xs text-purple-600">Campagne totali</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Send className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{stats.active}</p>
            <p className="text-xs text-blue-600">Attive</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700">{stats.bookings}</p>
            <p className="text-xs text-green-600">Prenotazioni generate</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-orange-700">{stats.reactivated}</p>
            <p className="text-xs text-orange-600">Clienti riattivati</p>
          </CardContent>
        </Card>
      </div>

      <Button className="bg-purple-500 hover:bg-purple-600 text-white mb-6" onClick={() => setShowNew(true)}>
        <Plus className="h-4 w-4 mr-1" /> Nuova Campagna
      </Button>

      <div className="space-y-3">
        {campaigns.map((campaign) => {
          const template = CAMPAIGN_TEMPLATES.find(t => t.id === campaign.template);
          return (
            <Card key={campaign.id} className="hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{template?.icon || '📢'}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{campaign.name}</h4>
                      {getStatusBadge(campaign.status)}
                      <Badge variant="outline" className="text-xs">{getChannelIcon(campaign.channel)} {campaign.channel}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template?.name} • Target: {campaign.targetCount} clienti</p>
                    {campaign.status === 'inviata' || campaign.status === 'completata' ? (
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Inviati</p>
                          <p className="font-bold">{campaign.sentCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Aperti</p>
                          <p className="font-bold text-blue-600">{campaign.openedCount} ({Math.round((campaign.openedCount/campaign.sentCount)*100)}%)</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Prenotazioni</p>
                          <p className="font-bold text-green-600">{campaign.bookingsGenerated}</p>
                        </div>
                        {campaign.clientsReactivated > 0 && (
                          <div>
                            <p className="text-xs text-gray-500">Riattivati</p>
                            <p className="font-bold text-orange-600">{campaign.clientsReactivated}</p>
                          </div>
                        )}
                      </div>
                    ) : campaign.status === 'programmata' ? (
                      <p className="text-sm text-blue-600">📅 Invio programmato: {new Date(campaign.scheduledAt).toLocaleDateString('it-IT')}</p>
                    ) : (
                      <p className="text-sm text-gray-500">In bozza - Non ancora programmata</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Eye className="h-3 w-3 mr-1" />Vedi</Button>
                    {campaign.status === 'bozza' && (
                      <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
                        <Send className="h-3 w-3 mr-1" />Programma
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showNew && (
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nuova Campagna Clienti</DialogTitle>
            </DialogHeader>
            {!selectedTemplate ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">Seleziona una campagna predefinita:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {CAMPAIGN_TEMPLATES.map((t) => (
                    <Card key={t.id} className="cursor-pointer hover:shadow-md hover:border-purple-400 transition" onClick={() => setSelectedTemplate(t)}>
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2">{t.icon}</div>
                        <h4 className="font-semibold text-sm mb-1">{t.name}</h4>
                        <p className="text-xs text-gray-500">{t.target}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="text-4xl">{selectedTemplate.icon}</div>
                  <div>
                    <h4 className="font-semibold">{selectedTemplate.name}</h4>
                    <p className="text-xs text-gray-600">Target: {selectedTemplate.target}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Nome campagna</label>
                  <Input placeholder="Es: Marzo 2025 - Prevenzione Dentale" />
                </div>
                <div>
                  <label className="text-sm font-medium">Messaggio</label>
                  <Textarea placeholder={selectedTemplate.message} rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Canale</label>
                    <select className="w-full border rounded px-3 py-2">
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="owner_area">Notifica Area Proprietario</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data invio</label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Target className="h-4 w-4 inline mr-1" />
                    <strong>Target stimato:</strong> {selectedTemplate.target === 'Tutti i proprietari' ? '456' : selectedTemplate.target.includes('Inattivi') ? '89' : '127'} clienti
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowNew(false); setSelectedTemplate(null); }}>Annulla</Button>
              {selectedTemplate && (
                <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => { alert('Campagna programmata! (Demo)'); setShowNew(false); setSelectedTemplate(null); }}>
                  <Send className="h-4 w-4 mr-1" />Programma Invio
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
