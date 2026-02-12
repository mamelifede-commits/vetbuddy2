import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

// Forza rendering dinamico per evitare errori build Vercel
export const dynamic = 'force-dynamic';

// Suggerisce slot in base allo storico degli appuntamenti
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const date = searchParams.get('date');

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId richiesto' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Orari standard della clinica
    const defaultSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    // Trova gli appuntamenti già prenotati per questa data
    const bookedAppointments = await db.collection('appointments').find({
      clinicId,
      date: date || new Date().toISOString().split('T')[0],
      status: { $nin: ['cancelled', 'no-show'] }
    }).toArray();

    const bookedTimes = bookedAppointments.map(a => a.time);

    // Analizza lo storico per trovare gli orari più popolari
    const historicalAppointments = await db.collection('appointments').aggregate([
      { $match: { clinicId, status: 'completed' } },
      { $group: { _id: '$time', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const popularTimes = historicalAppointments.map(h => h._id);

    // Calcola slot disponibili
    const availableSlots = defaultSlots.filter(slot => !bookedTimes.includes(slot));

    // Ordina per popolarità (slot popolari prima)
    const suggestedSlots = availableSlots.sort((a, b) => {
      const aPopularity = popularTimes.indexOf(a);
      const bPopularity = popularTimes.indexOf(b);
      // Se non trovato nello storico, metti in fondo
      const aScore = aPopularity === -1 ? 999 : aPopularity;
      const bScore = bPopularity === -1 ? 999 : bPopularity;
      return aScore - bScore;
    });

    // Aggiungi informazioni sulla "best time"
    const slotsWithInfo = suggestedSlots.map((slot, index) => {
      const isPopular = popularTimes.slice(0, 5).includes(slot);
      const hour = parseInt(slot.split(':')[0]);
      const period = hour < 12 ? 'mattina' : 'pomeriggio';
      
      return {
        time: slot,
        period,
        isPopular,
        isSuggested: index < 3,
        label: isPopular ? '⭐ Orario popolare' : null
      };
    });

    // Statistiche
    const totalSlots = defaultSlots.length;
    const occupancyRate = Math.round((bookedTimes.length / totalSlots) * 100);

    return NextResponse.json({
      date: date || new Date().toISOString().split('T')[0],
      availableSlots: slotsWithInfo,
      bookedSlots: bookedTimes,
      stats: {
        total: totalSlots,
        booked: bookedTimes.length,
        available: availableSlots.length,
        occupancyRate
      },
      suggestion: slotsWithInfo.length > 0 
        ? `Ti suggeriamo ${slotsWithInfo[0].time} (${slotsWithInfo[0].period})${slotsWithInfo[0].isPopular ? ' - orario molto richiesto!' : ''}`
        : 'Nessuno slot disponibile per questa data'
    });

  } catch (error) {
    console.error('Suggest slots error:', error);
    return NextResponse.json({ error: 'Errore' }, { status: 500 });
  }
}
