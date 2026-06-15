'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Shield, QrCode, Syringe, AlertTriangle, PawPrint, ArrowRight,
  Share2, Plane, Heart, Loader2, ChevronRight, AlertCircle
} from 'lucide-react';
import api from '@/app/lib/api';

export default function OwnerPassportCards({ pets, onOpenProfile }) {
  const [passportData, setPassportData] = useState({});
  const [loading, setLoading] = useState(true);

  const loadPassports = useCallback(async () => {
    if (!pets || pets.length === 0) {
      setLoading(false);
      return;
    }
    try {
      const results = {};
      // Load passport data for each pet (max 5 to avoid overloading)
      const petsToLoad = pets.slice(0, 5);
      await Promise.all(
        petsToLoad.map(async (pet) => {
          try {
            const data = await api.get(`passport/${pet.id}`);
            results[pet.id] = data;
          } catch (e) {
            // Passport not yet created - that's ok
            results[pet.id] = null;
          }
        })
      );
      setPassportData(results);
    } catch (e) {
      console.error('Errore caricamento passports:', e);
    }
    setLoading(false);
  }, [pets]);

  useEffect(() => { loadPassports(); }, [loadPassports]);

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-800">VetBuddy Passport</h3>
        </div>
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-4 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            <span className="text-sm text-gray-500">Caricamento Passport...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pets || pets.length === 0) return null;

  // Calculate alerts across all pets
  const allAlerts = [];
  const petCards = [];

  pets.slice(0, 5).forEach(pet => {
    const passport = passportData[pet.id];
    const completionScore = passport?.completionScore || 0;
    const hasQr = passport?.qrToken ? true : false;
    const isLost = passport?.lostPetMode || false;
    const vaccinations = passport?.vaccinations || [];
    const sharingLinks = passport?.sharingLinks?.filter(l => l.status === 'active') || [];
    
    // Check expiring vaccines
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringVaccines = vaccinations.filter(v => {
      if (!v.nextDueDate) return false;
      const dueDate = new Date(v.nextDueDate);
      return dueDate <= thirtyDaysFromNow && dueDate >= now;
    });
    const expiredVaccines = vaccinations.filter(v => {
      if (!v.nextDueDate) return false;
      return new Date(v.nextDueDate) < now;
    });

    if (expiredVaccines.length > 0) {
      allAlerts.push({ pet: pet.name, type: 'expired', count: expiredVaccines.length });
    }
    if (expiringVaccines.length > 0) {
      allAlerts.push({ pet: pet.name, type: 'expiring', count: expiringVaccines.length });
    }
    if (completionScore < 50) {
      allAlerts.push({ pet: pet.name, type: 'incomplete', score: completionScore });
    }

    petCards.push({
      pet,
      completionScore,
      hasQr,
      isLost,
      vaccineCount: vaccinations.length,
      expiringVaccines: expiringVaccines.length,
      expiredVaccines: expiredVaccines.length,
      activeShares: sharingLinks.length,
      hasEmergencyContacts: (passport?.emergencyContacts?.length || 0) > 0
    });
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Shield className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">VetBuddy Passport</h3>
            <p className="text-xs text-gray-500">Passaporto sanitario digitale dei tuoi animali</p>
          </div>
        </div>
        {allAlerts.length > 0 && (
          <Badge className="bg-amber-100 text-amber-700">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {allAlerts.length} avvis{allAlerts.length === 1 ? 'o' : 'i'}
          </Badge>
        )}
      </div>

      {/* Alerts Banner */}
      {allAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
          <div className="space-y-1">
            {allAlerts.slice(0, 3).map((alert, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {alert.type === 'expired' && (
                  <>
                    <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                    <span className="text-red-700"><strong>{alert.pet}</strong>: {alert.count} vaccin{alert.count === 1 ? 'o' : 'i'} scadut{alert.count === 1 ? 'o' : 'i'}</span>
                  </>
                )}
                {alert.type === 'expiring' && (
                  <>
                    <Syringe className="h-3 w-3 text-amber-500 flex-shrink-0" />
                    <span className="text-amber-700"><strong>{alert.pet}</strong>: {alert.count} vaccin{alert.count === 1 ? 'o' : 'i'} in scadenza</span>
                  </>
                )}
                {alert.type === 'incomplete' && (
                  <>
                    <Shield className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                    <span className="text-indigo-700"><strong>{alert.pet}</strong>: Passport al {alert.score}% — completa il profilo</span>
                  </>
                )}
              </div>
            ))}
            {allAlerts.length > 3 && (
              <p className="text-xs text-amber-600">...e altri {allAlerts.length - 3} avvisi</p>
            )}
          </div>
        </div>
      )}

      {/* Pet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {petCards.map(({ pet, completionScore, hasQr, isLost, vaccineCount, expiringVaccines, expiredVaccines, activeShares, hasEmergencyContacts }) => (
          <Card 
            key={pet.id} 
            className={`hover:shadow-md transition cursor-pointer ${isLost ? 'border-red-300 bg-red-50/30' : 'border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30'}`}
            onClick={() => onOpenProfile && onOpenProfile(pet.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm">
                    {pet.species === 'cane' || pet.species === 'dog' ? '🐕' : 
                     pet.species === 'gatto' || pet.species === 'cat' ? '🐱' :
                     pet.species === 'coniglio' ? '🐰' :
                     pet.species === 'cavallo' ? '🐴' : '🐾'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{pet.name}</p>
                    <p className="text-[10px] text-gray-500">{pet.breed || pet.species}</p>
                  </div>
                </div>
                {isLost && (
                  <Badge className="bg-red-100 text-red-700 text-[10px]">
                    🔴 Smarrito
                  </Badge>
                )}
              </div>

              {/* Completion Progress */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-gray-500">Completezza Passport</span>
                  <span className="text-[10px] font-semibold text-indigo-600">{completionScore}%</span>
                </div>
                <Progress value={completionScore} className="h-1.5" />
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-1.5">
                {hasQr && (
                  <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                    <QrCode className="h-2.5 w-2.5 mr-0.5" /> QR attivo
                  </Badge>
                )}
                {!hasQr && (
                  <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-500">
                    <QrCode className="h-2.5 w-2.5 mr-0.5" /> Genera QR
                  </Badge>
                )}
                {vaccineCount > 0 && (
                  <Badge variant="outline" className={`text-[10px] ${expiredVaccines > 0 ? 'bg-red-50 text-red-600 border-red-200' : expiringVaccines > 0 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                    <Syringe className="h-2.5 w-2.5 mr-0.5" /> 
                    {vaccineCount} vaccin{vaccineCount === 1 ? 'o' : 'i'}
                    {expiredVaccines > 0 && ` (${expiredVaccines} scad.)`}
                  </Badge>
                )}
                {activeShares > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-600 border-purple-200">
                    <Share2 className="h-2.5 w-2.5 mr-0.5" /> {activeShares} condivisioni
                  </Badge>
                )}
                {hasEmergencyContacts && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">
                    <Heart className="h-2.5 w-2.5 mr-0.5" /> Contatti SOS
                  </Badge>
                )}
              </div>

              {/* CTA - Apri + Condividi */}
              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                <button
                  onClick={() => onOpenProfile && onOpenProfile(pet.id)}
                  className="flex-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-1 py-1"
                >
                  Apri <ChevronRight className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenProfile && onOpenProfile(pet.id, 'share'); }}
                  className="flex-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium flex items-center justify-center gap-1 py-1 rounded transition-colors"
                  title="Condividi Passport con pet sitter o familiari"
                >
                  <Share2 className="h-3 w-3" /> Condividi
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
