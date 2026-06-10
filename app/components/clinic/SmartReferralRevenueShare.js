'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Euro, BarChart3 } from 'lucide-react';

export default function SmartReferralRevenueShare() {
  const [referrals] = useState([
    { type: 'Specialista', patient: 'Max', service: 'Cardiologo', fee: 350, share: 70, status: 'Completato' },
    { type: 'Laboratorio', patient: 'Luna', service: 'Esami genetica', fee: 280, share: 42, status: 'Completato' },
    { type: 'Fisioterapia', patient: 'Rocky', service: 'Post-LCA rehab', fee: 720, share: 144, status: 'In corso' },
  ]);

  const totalEarned = referrals.filter(r => r.status === 'Completato').reduce((sum, r) => sum + r.share, 0);
  const totalPending = referrals.filter(r => r.status === 'In corso').reduce((sum, r) => sum + r.share, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-6 w-6 text-emerald-500" />
          <h2 className="text-2xl font-bold text-gray-900">Smart Referral Revenue Share</h2>
          <Badge className="bg-emerald-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">Guadagna 15-20% su ogni referral (specialista, lab, fisioterapia). Win-win-win: specialista ha clienti, tu guadagni, proprietario ha servizio. Nuovo revenue stream passivo €1-3k/mese.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Euro className="h-8 w-8 text-emerald-600" />
              <div>
                <div className="text-3xl font-black text-emerald-700">€{totalEarned}</div>
                <div className="text-xs text-gray-600">Guadagnato questo mese</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-amber-600" />
              <div>
                <div className="text-3xl font-black text-amber-700">€{totalPending}</div>
                <div className="text-xs text-gray-600">In attesa completamento</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-3xl font-black text-blue-700">{referrals.length}</div>
                <div className="text-xs text-gray-600">Referral attivi</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-lg">Storico Referral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {referrals.map((r, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{r.type}</Badge>
                  <span className="font-bold text-gray-900">{r.patient}</span>
                </div>
                <p className="text-sm text-gray-600">{r.service} • €{r.fee}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">+€{r.share}</div>
                <Badge className={r.status === 'Completato' ? 'bg-green-600' : 'bg-amber-600'}>{r.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">€1.8k</div>
            <div className="text-xs text-gray-600">Revenue passivo medio/mese</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">20%</div>
            <div className="text-xs text-gray-600">Share medio su referral</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
