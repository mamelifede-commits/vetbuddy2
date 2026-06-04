'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import dynamic from 'next/dynamic';
import BackToDashboard from '@/app/components/shared/BackToDashboard';
import SubscriptionPlans from '@/app/components/shared/SubscriptionPlans';

// Dynamic imports for settings sub-components (prevents OOM)
const SettingsIntegrations = dynamic(() => import('./settings-tabs/SettingsIntegrations'), { ssr: false });
const SettingsAvailability = dynamic(() => import('./settings-tabs/SettingsAvailability'), { ssr: false });
const SettingsProfile = dynamic(() => import('./settings-tabs/SettingsProfile'), { ssr: false });

function ClinicSettings({ user, onNavigate }) {
  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Impostazioni</h2>
        <p className="text-gray-500 text-sm">Configura la tua clinica</p>
      </div>
      
      <div className="space-y-6 max-w-2xl">
        {/* Abbonamento vetbuddy - Pilot */}
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />Abbonamento vetbuddy
              <Badge className="bg-amber-500 text-white">Pilot Milano</Badge>
            </CardTitle>
            <CardDescription>Accesso su invito — 90 giorni gratuiti per cliniche selezionate (estendibili a 6 mesi)</CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionPlans user={user} />
          </CardContent>
        </Card>

        {/* Integrations: Stripe, Google Calendar, WhatsApp, Location */}
        <SettingsIntegrations user={user} />

        {/* Payment Methods, Cancellation Policy, Availability Hours */}
        <SettingsAvailability user={user} />

        {/* Clinic Profile */}
        <SettingsProfile user={user} />
      </div>
    </div>
  );
}

export default ClinicSettings;
