'use client';
// ConnectStatusCard - Componente riusabile per Dashboard Ecosistema + Punteggio Completamento
// Mostra KPI rete + checklist completamento + invito rapido
// Usato in: ClinicControlRoom (dashboard clinica), OwnerDashboardLayout, LabDashboard

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users, Send, CheckCircle, Clock, Circle, ChevronRight, Award, Heart, Building2, FlaskConical, Sparkles, Trophy
} from 'lucide-react';
import api from '@/app/lib/api';

const LEVEL_CONFIG = {
  excellent: { label: 'Eccellente', color: 'emerald', icon: Trophy, message: 'Hai una rete forte! Continua così.' },
  good: { label: 'Buono', color: 'blue', icon: Award, message: 'Ottimo progresso! Completa gli ultimi passi.' },
  progress: { label: 'In Crescita', color: 'amber', icon: Sparkles, message: 'Stai costruendo la tua rete. Completa la checklist.' },
  starter: { label: 'Inizia ora', color: 'coral', icon: Heart, message: 'Costruisci la tua rete VetBuddy.' }
};

export default function ConnectStatusCard({ user, onNavigate, compact = false }) {
  const [stats, setStats] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        api.get('connect/stats').catch(() => null),
        api.get('connect/completion-score').catch(() => null)
      ]);
      setStats(s);
      setCompletion(c);
    } catch (e) {
      console.error('ConnectStatusCard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!completion && !stats) return null;

  const lvl = completion?.level ? LEVEL_CONFIG[completion.level] : LEVEL_CONFIG.starter;
  const LevelIcon = lvl.icon;
  const role = user?.role === 'staff' ? 'clinic' : user?.role;

  return (
    <Card className={`border-2 border-${lvl.color}-200 bg-gradient-to-br from-${lvl.color}-50 via-white to-${lvl.color}-50`}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 bg-${lvl.color}-100 rounded-xl flex items-center justify-center`}>
              <LevelIcon className={`h-5 w-5 text-${lvl.color}-600`} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-coral-500" />
                VetBuddy Connect
                <Badge className={`bg-${lvl.color}-100 text-${lvl.color}-700 text-xs`}>{lvl.label}</Badge>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{lvl.message}</p>
            </div>
          </div>
          {onNavigate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate(role === 'lab' ? 'connect' : 'vetbuddy-connect')}
              className="text-xs"
            >
              Apri rete <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>

        {/* Completion Score */}
        {completion && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Completamento rete</span>
              <span className={`text-lg font-bold text-${lvl.color}-600`}>{completion.score}%</span>
            </div>
            <Progress value={completion.score} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">{completion.completed} / {completion.total} passi completati</p>
          </div>
        )}

        {/* KPI Stats (network) */}
        {stats && !compact && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
              <Send className="h-4 w-4 text-coral-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{stats.sentTotal || 0}</p>
              <p className="text-xs text-gray-500">Inviti</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
              <CheckCircle className="h-4 w-4 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{stats.sentAccepted || 0}</p>
              <p className="text-xs text-gray-500">Accettati</p>
            </div>
            {role === 'clinic' && (
              <>
                <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                  <Heart className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{stats.ownersConnected || 0}</p>
                  <p className="text-xs text-gray-500">Proprietari</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                  <FlaskConical className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{stats.labsConnected || 0}</p>
                  <p className="text-xs text-gray-500">Laboratori</p>
                </div>
              </>
            )}
            {role === 'owner' && (
              <>
                <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                  <Building2 className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{stats.clinicsLinked || 0}</p>
                  <p className="text-xs text-gray-500">Cliniche</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                  <Heart className="h-4 w-4 text-coral-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{stats.petsOwned || 0}</p>
                  <p className="text-xs text-gray-500">Animali</p>
                </div>
              </>
            )}
            {role === 'lab' && (
              <>
                <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                  <Building2 className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{stats.clinicsConnected || 0}</p>
                  <p className="text-xs text-gray-500">Cliniche attive</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                  <Clock className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{stats.sentPending || 0}</p>
                  <p className="text-xs text-gray-500">In attesa</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Checklist (top 3-4 incompleti) */}
        {completion?.checklist && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Azioni consigliate</p>
            {completion.checklist
              .filter(c => !c.done && !c.optional)
              .slice(0, compact ? 2 : 4)
              .map(item => (
                <button
                  key={item.key}
                  onClick={() => onNavigate && onNavigate(item.action)}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-100 hover:border-coral-300 hover:bg-coral-50 transition-colors group"
                >
                  <Circle className="h-4 w-4 text-gray-300 group-hover:text-coral-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{item.label}</span>
                  {item.current !== undefined && item.target && (
                    <Badge variant="outline" className="text-xs">{item.current}/{item.target}</Badge>
                  )}
                  <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-coral-500" />
                </button>
              ))}
            {completion.checklist.filter(c => !c.done && !c.optional).length === 0 && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm py-2">
                <CheckCircle className="h-4 w-4" />
                Hai completato tutti i passi consigliati!
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
