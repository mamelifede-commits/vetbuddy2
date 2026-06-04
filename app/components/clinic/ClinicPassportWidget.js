'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  QrCode, Shield, Syringe, AlertTriangle, PawPrint, ChevronRight,
  ArrowRight, Users, FileWarning, Loader2, RefreshCw
} from 'lucide-react';

export default function ClinicPassportWidget({ token, onNavigate, onOpenPet }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/passport/clinic/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Errore caricamento passport dashboard:', e);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-4 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
          <span className="text-sm text-gray-500">Caricamento Passport...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { stats, lists } = data;
  const hasAlerts = (lists?.vaccinesExpiring?.length || 0) > 0 ||
                    (lists?.petsWithoutMicrochip?.length || 0) > 0 ||
                    (lists?.petsWithoutEmergencyContact?.length || 0) > 0;

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-md transition">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            VetBuddy Passport
          </span>
          {hasAlerts && (
            <Badge className="bg-amber-100 text-amber-700 text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" /> Attenzione
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-indigo-600">{stats?.passportActive || 0}</p>
            <p className="text-[10px] text-gray-500">Passport attivi</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-purple-600">{stats?.qrGenerated || 0}</p>
            <p className="text-[10px] text-gray-500">QR generati</p>
          </div>
        </div>

        {/* Alerts */}
        {lists?.vaccinesExpiring?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Syringe className="h-3 w-3 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">
                {lists.vaccinesExpiring.length} vaccin{lists.vaccinesExpiring.length === 1 ? 'o' : 'i'} in scadenza
              </span>
            </div>
            <div className="space-y-1">
              {lists.vaccinesExpiring.slice(0, 3).map((v, i) => (
                <p key={i} className="text-[10px] text-amber-600 truncate">
                  {v.name} — scade {new Date(v.nextDueDate).toLocaleDateString('it-IT')}
                </p>
              ))}
            </div>
          </div>
        )}

        {lists?.petsWithoutMicrochip?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <div className="flex items-center gap-1.5">
              <FileWarning className="h-3 w-3 text-red-500" />
              <span className="text-xs font-semibold text-red-600">
                {lists.petsWithoutMicrochip.length} pazienti senza microchip
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {lists.petsWithoutMicrochip.slice(0, 4).map((p, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-[10px] cursor-pointer hover:bg-red-100"
                  onClick={() => onOpenPet && onOpenPet(p)}
                >
                  {p.name}
                </Badge>
              ))}
              {lists.petsWithoutMicrochip.length > 4 && (
                <Badge variant="outline" className="text-[10px]">
                  +{lists.petsWithoutMicrochip.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {(stats?.passportIncomplete || 0) > 0 && (
          <div className="flex items-center justify-between bg-white/60 rounded-lg p-2">
            <div className="flex items-center gap-1.5">
              <PawPrint className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                <strong>{stats.passportIncomplete}</strong> passport incompleti
              </span>
            </div>
            <Badge variant="outline" className="text-[10px]">
              su {stats.totalPets || 0} pazienti
            </Badge>
          </div>
        )}

        {(stats?.activeShares || 0) > 0 && (
          <div className="flex items-center justify-between bg-white/60 rounded-lg p-2">
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-gray-600">
                <strong>{stats.activeShares}</strong> condivisioni attive
              </span>
            </div>
          </div>
        )}

        {/* CTA */}
        <Button 
          variant="ghost" 
          className="w-full text-indigo-600 hover:bg-indigo-100" 
          size="sm" 
          onClick={() => onNavigate && onNavigate('patients')}
        >
          Gestisci Passport <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
