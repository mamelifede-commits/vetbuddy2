'use client';
// MorningBriefingWidget - Riepilogo operativo giornaliero per la clinica
// Mostrato in ClinicControlRoom come "centro operativo quotidiano"

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sun, Calendar, AlertCircle, FileSignature, FlaskConical, Mail, Clock, UserX,
  CheckSquare, MessageCircle, ChevronRight, RefreshCw, Sparkles
} from 'lucide-react';
import api from '@/app/lib/api';

const ALERT_COLORS = {
  none: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  warn: 'bg-amber-50 border-amber-200 text-amber-700',
  alert: 'bg-red-50 border-red-200 text-red-700'
};

function getAlertLevel(count, thresholds = [3, 1]) {
  if (count >= thresholds[0]) return 'alert';
  if (count >= thresholds[1]) return 'warn';
  return 'none';
}

export default function MorningBriefingWidget({ onNavigate }) {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { loadBriefing(); }, []);

  const loadBriefing = async () => {
    setLoading(true);
    try {
      const data = await api.get('clinic/morning-briefing');
      setBriefing(data);
    } catch (e) {
      console.error('[MorningBriefing] Load error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!briefing) return null;

  const s = briefing.summary;
  const today = new Date(briefing.date).toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  // Total criticità
  const totalAlerts = s.unconfirmedToday + s.consentsMissing + s.staleLabReports + s.expiredInvites + s.urgentTasks;

  return (
    <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 shadow-sm">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-sm">
              <Sun className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2 capitalize">
                Briefing Mattutino
                {totalAlerts > 0 ? (
                  <Badge className="bg-red-100 text-red-700 text-xs">{totalAlerts} da gestire</Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">✓ Tutto sotto controllo</Badge>
                )}
              </h3>
              <p className="text-xs text-gray-500 capitalize">{today}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={loadBriefing} title="Aggiorna">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {/* Appuntamenti oggi */}
          <button
            onClick={() => onNavigate && onNavigate('appointments')}
            className="bg-white rounded-lg p-3 border border-gray-100 hover:border-amber-300 hover:shadow-md transition-all text-left"
          >
            <Calendar className="h-4 w-4 text-blue-500 mb-1" />
            <p className="text-xl font-bold text-gray-900">{s.appointmentsToday}</p>
            <p className="text-xs text-gray-500">Appuntamenti oggi</p>
          </button>

          {/* Non confermati */}
          <button
            onClick={() => onNavigate && onNavigate('appointments')}
            className={`rounded-lg p-3 border hover:shadow-md transition-all text-left ${ALERT_COLORS[getAlertLevel(s.unconfirmedToday)]}`}
          >
            <AlertCircle className="h-4 w-4 mb-1" />
            <p className="text-xl font-bold">{s.unconfirmedToday}</p>
            <p className="text-xs opacity-80">Non confermati</p>
          </button>

          {/* Consensi mancanti */}
          <button
            onClick={() => onNavigate && onNavigate('consents')}
            className={`rounded-lg p-3 border hover:shadow-md transition-all text-left ${ALERT_COLORS[getAlertLevel(s.consentsMissing, [1, 1])]}`}
          >
            <FileSignature className="h-4 w-4 mb-1" />
            <p className="text-xl font-bold">{s.consentsMissing}</p>
            <p className="text-xs opacity-80">Consensi mancanti</p>
          </button>

          {/* Referti fermi */}
          <button
            onClick={() => onNavigate && onNavigate('labmarketplace')}
            className={`rounded-lg p-3 border hover:shadow-md transition-all text-left ${ALERT_COLORS[getAlertLevel(s.staleLabReports, [2, 1])]}`}
          >
            <FlaskConical className="h-4 w-4 mb-1" />
            <p className="text-xl font-bold">{s.staleLabReports}</p>
            <p className="text-xs opacity-80">Referti fermi (3+gg)</p>
          </button>

          {/* Inviti pendenti */}
          <button
            onClick={() => onNavigate && onNavigate('vetbuddy-connect')}
            className="bg-white rounded-lg p-3 border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all text-left"
          >
            <Mail className="h-4 w-4 text-purple-500 mb-1" />
            <p className="text-xl font-bold text-gray-900">{s.pendingInvites}</p>
            <p className="text-xs text-gray-500">Inviti pendenti</p>
          </button>

          {/* Pre-visite incomplete */}
          <button
            onClick={() => onNavigate && onNavigate('previsit')}
            className={`rounded-lg p-3 border hover:shadow-md transition-all text-left ${ALERT_COLORS[getAlertLevel(s.previsitIncomplete)]}`}
          >
            <Clock className="h-4 w-4 mb-1" />
            <p className="text-xl font-bold">{s.previsitIncomplete}</p>
            <p className="text-xs opacity-80">Pre-visite incomplete</p>
          </button>

          {/* Clienti dormienti */}
          <button
            onClick={() => onNavigate && onNavigate('campaigns')}
            className="bg-white rounded-lg p-3 border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all text-left"
          >
            <UserX className="h-4 w-4 text-indigo-500 mb-1" />
            <p className="text-xl font-bold text-gray-900">{s.dormantClients}</p>
            <p className="text-xs text-gray-500">Dormienti (30+gg)</p>
          </button>

          {/* Messaggi non letti */}
          <button
            onClick={() => onNavigate && onNavigate('whatsapp-business')}
            className={`rounded-lg p-3 border hover:shadow-md transition-all text-left ${ALERT_COLORS[getAlertLevel(s.unreadMessages)]}`}
          >
            <MessageCircle className="h-4 w-4 mb-1" />
            <p className="text-xl font-bold">{s.unreadMessages}</p>
            <p className="text-xs opacity-80">Messaggi non letti</p>
          </button>
        </div>

        {/* Toggle dettagli */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs text-gray-600"
        >
          {expanded ? 'Nascondi dettagli' : '🔍 Mostra dettagli operativi'}
          <ChevronRight className={`h-3 w-3 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </Button>

        {expanded && briefing.details && (
          <div className="mt-3 space-y-3 border-t border-amber-200 pt-3">
            {/* Appuntamenti di oggi */}
            {briefing.details.todayAppointments && briefing.details.todayAppointments.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">📅 Appuntamenti oggi</p>
                <div className="space-y-1">
                  {briefing.details.todayAppointments.map(a => (
                    <div key={a.id} className="flex items-center gap-2 bg-white rounded p-2 text-xs">
                      <Calendar className="h-3 w-3 text-blue-500 flex-shrink-0" />
                      <span className="font-medium flex-shrink-0">{a.time ? new Date(a.time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                      <span className="text-gray-600 truncate flex-1">{a.petName} ({a.ownerName})</span>
                      <Badge variant="outline" className="text-xs">{a.serviceType || a.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consensi mancanti */}
            {briefing.details.consentsMissing && briefing.details.consentsMissing.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wide">⚠️ Consensi da firmare</p>
                <div className="space-y-1">
                  {briefing.details.consentsMissing.map(a => (
                    <div key={a.id} className="flex items-center gap-2 bg-red-50 rounded p-2 text-xs">
                      <FileSignature className="h-3 w-3 text-red-500 flex-shrink-0" />
                      <span className="truncate flex-1">{a.petName} ({a.ownerName}) — {a.service || 'Procedura'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inviti pendenti */}
            {briefing.details.pendingInvites && briefing.details.pendingInvites.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">📧 Inviti VetBuddy Connect pendenti</p>
                <div className="space-y-1">
                  {briefing.details.pendingInvites.map(inv => (
                    <div key={inv.id} className="flex items-center gap-2 bg-purple-50 rounded p-2 text-xs">
                      <Mail className="h-3 w-3 text-purple-500 flex-shrink-0" />
                      <span className="truncate flex-1">{inv.toName || inv.toEmail}</span>
                      <Badge variant="outline" className="text-xs">{inv.type.replace('_', '→')}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Referti fermi */}
            {briefing.details.staleLab && briefing.details.staleLab.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-orange-700 mb-2 uppercase tracking-wide">🔬 Referti fermi da +3 giorni</p>
                <div className="space-y-1">
                  {briefing.details.staleLab.map(r => (
                    <div key={r.id} className="flex items-center gap-2 bg-orange-50 rounded p-2 text-xs">
                      <FlaskConical className="h-3 w-3 text-orange-500 flex-shrink-0" />
                      <span className="truncate flex-1">{r.petName} — {r.examType}</span>
                      <span className="text-orange-600 flex-shrink-0">
                        {Math.round((Date.now() - new Date(r.createdAt).getTime()) / (24 * 60 * 60 * 1000))} gg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
