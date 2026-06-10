'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, Bell, Calendar, FileText, MessageCircle, QrCode } from 'lucide-react';

export default function AppMobile({ user }) {
  const features = [
    { icon: Calendar, title: 'Prenotazioni Rapide', desc: 'Prenota visite in 30 secondi' },
    { icon: Bell, title: 'Push Notifications', desc: 'Promemoria e aggiornamenti real-time' },
    { icon: FileText, title: 'Documenti & Referti', desc: 'Tutti i documenti sempre disponibili' },
    { icon: MessageCircle, title: 'Chat con Clinica', desc: 'Messaggistica diretta con veterinario' },
    { icon: QrCode, title: 'VetBuddy Passport', desc: 'QR emergenza sempre accessibile' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-purple-600" />
            App Mobile Nativa
          </h2>
          <p className="text-sm text-gray-500">iOS & Android per proprietari e veterinari</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* App Proprietari */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">VetBuddy per Proprietari</h3>
              <Badge className="bg-purple-600 text-white">iOS & Android</Badge>
            </div>
            <div className="space-y-2 mb-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 text-purple-600" />
                    <span className="text-gray-700">{f.title}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-black text-white"><Download className="h-4 w-4 mr-1" />App Store</Button>
              <Button className="flex-1 bg-green-600 text-white"><Download className="h-4 w-4 mr-1" />Google Play</Button>
            </div>
          </CardContent>
        </Card>

        {/* App Veterinari */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">👨‍⚕️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">VetBuddy Pro per Veterinari</h3>
              <Badge className="bg-blue-600 text-white">iOS & Android</Badge>
            </div>
            <div className="space-y-2 mb-4">
              {[
                { icon: FileText, text: 'Accesso cartelle cliniche' },
                { icon: Calendar, text: 'Agenda visite domiciliari' },
                { icon: Bell, text: 'Alert emergenze guardia' },
                { icon: MessageCircle, text: 'Chat con team' },
                { icon: QrCode, text: 'Scan documenti offline' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">{f.text}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-black text-white"><Download className="h-4 w-4 mr-1" />App Store</Button>
              <Button className="flex-1 bg-green-600 text-white"><Download className="h-4 w-4 mr-1" />Google Play</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <p className="text-sm text-purple-800"><strong>ℹ️ App Nativa:</strong> Push notifications, modalità offline, fotocamera integrata, geolocalizzazione. Esperienza utente superiore al web.</p>
        </CardContent>
      </Card>
    </div>
  );
}
