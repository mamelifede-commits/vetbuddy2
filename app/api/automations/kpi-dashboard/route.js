import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

// Forza rendering dinamico per evitare errori build Vercel
export const dynamic = 'force-dynamic';

// Dashboard KPI con alert automatici
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId richiesto' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split('T')[0];
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const monthAgoStr = monthAgo.toISOString().split('T')[0];

    // KPI Appuntamenti
    const weeklyAppointments = await db.collection('appointments').find({
      clinicId,
      date: { $gte: weekAgoStr, $lte: todayStr }
    }).toArray();

    const appointmentStats = {
      total: weeklyAppointments.length,
      completed: weeklyAppointments.filter(a => a.status === 'completed').length,
      noShow: weeklyAppointments.filter(a => a.status === 'no-show').length,
      cancelled: weeklyAppointments.filter(a => a.status === 'cancelled').length,
      pending: weeklyAppointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length
    };

    const noShowRate = appointmentStats.total > 0 
      ? Math.round((appointmentStats.noShow / appointmentStats.total) * 100) 
      : 0;

    const completionRate = appointmentStats.total > 0
      ? Math.round((appointmentStats.completed / appointmentStats.total) * 100)
      : 0;

    // KPI Messaggi
    const unreadMessages = await db.collection('messages').countDocuments({
      clinicId,
      read: false,
      direction: 'incoming'
    });

    const urgentMessages = await db.collection('messages').countDocuments({
      clinicId,
      isUrgent: true,
      status: { $ne: 'resolved' }
    });

    // KPI Clienti
    const newClientsThisMonth = await db.collection('clinic_clients').countDocuments({
      clinicId,
      addedAt: { $gte: monthAgo }
    });

    const totalClients = await db.collection('clinic_clients').countDocuments({ clinicId });

    // KPI Lista d'attesa
    const waitlistCount = await db.collection('waitlist').countDocuments({
      clinicId,
      status: 'waiting'
    });

    // KPI Documenti
    const pendingDocuments = await db.collection('appointments').countDocuments({
      clinicId,
      status: 'completed',
      hasDocuments: { $ne: true },
      date: { $gte: weekAgoStr }
    });

    // Genera Alert
    const alerts = [];

    if (noShowRate > 20) {
      alerts.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Tasso No-Show Alto',
        message: `Il ${noShowRate}% degli appuntamenti questa settimana sono stati no-show. Considera di inviare più promemoria.`,
        metric: `${noShowRate}%`,
        action: 'Attiva promemoria SMS'
      });
    }

    if (unreadMessages > 10) {
      alerts.push({
        type: 'info',
        icon: '📬',
        title: 'Messaggi da Leggere',
        message: `Hai ${unreadMessages} messaggi non letti. Rispondi per mantenere i clienti soddisfatti!`,
        metric: unreadMessages,
        action: 'Vai ai Messaggi'
      });
    }

    if (urgentMessages > 0) {
      alerts.push({
        type: 'urgent',
        icon: '🚨',
        title: 'Messaggi Urgenti',
        message: `Ci sono ${urgentMessages} messaggi urgenti che richiedono attenzione immediata.`,
        metric: urgentMessages,
        action: 'Gestisci Urgenze'
      });
    }

    if (waitlistCount > 5) {
      alerts.push({
        type: 'info',
        icon: '📋',
        title: 'Lista d\'Attesa Lunga',
        message: `${waitlistCount} persone in lista d'attesa. Valuta di aprire slot aggiuntivi.`,
        metric: waitlistCount,
        action: 'Gestisci Lista'
      });
    }

    if (pendingDocuments > 3) {
      alerts.push({
        type: 'warning',
        icon: '📄',
        title: 'Documenti da Caricare',
        message: `${pendingDocuments} visite senza documenti allegati. Ricordati di caricarli!`,
        metric: pendingDocuments,
        action: 'Carica Documenti'
      });
    }

    // Calcola score salute clinica (0-100)
    let healthScore = 100;
    if (noShowRate > 20) healthScore -= 20;
    if (noShowRate > 30) healthScore -= 10;
    if (unreadMessages > 10) healthScore -= 10;
    if (urgentMessages > 0) healthScore -= 15;
    if (pendingDocuments > 5) healthScore -= 10;
    healthScore = Math.max(0, healthScore);

    return NextResponse.json({
      kpis: {
        appointments: {
          ...appointmentStats,
          noShowRate,
          completionRate
        },
        messages: {
          unread: unreadMessages,
          urgent: urgentMessages
        },
        clients: {
          total: totalClients,
          newThisMonth: newClientsThisMonth
        },
        waitlist: waitlistCount,
        pendingDocuments
      },
      alerts,
      healthScore,
      healthStatus: healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : healthScore >= 40 ? 'needs_attention' : 'critical',
      period: {
        start: weekAgoStr,
        end: todayStr
      }
    });

  } catch (error) {
    console.error('KPI Dashboard error:', error);
    return NextResponse.json({ error: 'Errore' }, { status: 500 });
  }
}
