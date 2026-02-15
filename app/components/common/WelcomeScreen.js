'use client';

import { LayoutDashboard, Inbox, FileText, Video, Calendar, MessageCircle, PawPrint, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import vetbuddyLogo from './vetbuddyLogo';

function WelcomeScreen({ user, onContinue }) {
  const isClinic = user.role === 'clinic';
  return (
    <div className="min-h-screen bg-gradient-to-b from-coral-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4"><vetbuddyLogo size={60} showText={true} /></div>
          <CardTitle className="text-2xl text-gray-700">Benvenuto in vetbuddy!</CardTitle>
          <CardDescription className="text-base mt-2">{isClinic ? 'Stai entrando nel portale per cliniche veterinarie' : "Stai entrando nell'app per proprietari di animali"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Cosa puoi fare:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {isClinic ? (
                <><li className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4 text-coral-500" /> Dashboard operativa: "cosa fare oggi"</li>
                <li className="flex items-center gap-2"><Inbox className="h-4 w-4 text-coral-500" /> Team Inbox con ticket e assegnazioni</li>
                <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-coral-500" /> Carica documenti e inviali via email</li>
                <li className="flex items-center gap-2"><Video className="h-4 w-4 text-coral-500" /> Video-consulti e pagamenti</li></>
              ) : (
                <><li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" /> Prenota visite e video-consulti</li>
                <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-blue-500" /> Chatta con la clinica</li>
                <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /> Ricevi referti e prescrizioni</li>
                <li className="flex items-center gap-2"><PawPrint className="h-4 w-4 text-blue-500" /> Gestisci i profili dei tuoi animali</li></>
              )}
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Versione Pilot / Demo</h4>
                <p className="text-sm text-amber-700 mt-1">{isClinic ? 'vetbuddy è in fase Pilot su invito. Alcune sezioni sono demo.' : 'vetbuddy è in fase Pilot: le cliniche visibili sono esempi/demo.'}</p>
              </div>
            </div>
          </div>
          <Button className="w-full bg-coral-500 hover:bg-coral-600" size="lg" onClick={onContinue}>{isClinic ? 'Entra nella dashboard' : "Esplora l'app"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default WelcomeScreen;
