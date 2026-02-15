import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { sendEmail } from '@/lib/email';

// Genera e invia report settimanale alla clinica
export async function POST(request) {
  try {
    const { clinicId } = await request.json();

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId richiesto' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Trova la clinica
    const clinic = await db.collection('users').findOne({ id: clinicId, role: 'clinic' });
    if (!clinic?.email) {
      return NextResponse.json({ error: 'Clinica non trovata o email mancante' }, { status: 404 });
    }

    // Calcola date per la settimana
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    
    const todayStr = today.toISOString().split('T')[0];
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    // Statistiche appuntamenti
    const appointments = await db.collection('appointments').find({
      clinicId,
      date: { $gte: weekAgoStr, $lte: todayStr }
    }).toArray();

    const stats = {
      total: appointments.length,
      completed: appointments.filter(a => a.status === 'completed').length,
      noShow: appointments.filter(a => a.status === 'no-show').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      pending: appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length
    };

    // Messaggi ricevuti
    const messages = await db.collection('messages').countDocuments({
      clinicId,
      createdAt: { $gte: weekAgo }
    });

    // Nuovi clienti
    const newClients = await db.collection('clinic_clients').countDocuments({
      clinicId,
      addedAt: { $gte: weekAgo }
    });

    // Documenti inviati
    const documents = await db.collection('documents').countDocuments({
      clinicId,
      createdAt: { $gte: weekAgo }
    });

    const noShowRate = stats.total > 0 ? Math.round((stats.noShow / stats.total) * 100) : 0;

    // Invia email report
    await sendEmail({
      to: clinic.email,
      subject: `📊 Report Settimanale - ${clinic.clinicName || clinic.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">📊 Report Settimanale</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0;">${weekAgoStr} - ${todayStr}</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Ciao ${clinic.clinicName || clinic.name}!</h2>
            <p style="color: #666;">Ecco il riepilogo della tua settimana su vetbuddy:</p>
            
            <h3 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📅 Appuntamenti</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <tr>
                <td style="padding: 10px; background: white; border-radius: 5px;">
                  <strong style="font-size: 24px; color: #333;">${stats.total}</strong><br>
                  <span style="color: #666; font-size: 12px;">Totali</span>
                </td>
                <td style="padding: 10px; background: white; border-radius: 5px;">
                  <strong style="font-size: 24px; color: #4CAF50;">${stats.completed}</strong><br>
                  <span style="color: #666; font-size: 12px;">Completati</span>
                </td>
                <td style="padding: 10px; background: white; border-radius: 5px;">
                  <strong style="font-size: 24px; color: #f44336;">${stats.noShow}</strong><br>
                  <span style="color: #666; font-size: 12px;">No-show</span>
                </td>
              </tr>
            </table>
            
            ${noShowRate > 20 ? `
              <div style="background: #FFEBEE; padding: 15px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #f44336;">
                <p style="color: #c62828; margin: 0;">⚠️ <strong>Attenzione:</strong> Il tasso di no-show è al ${noShowRate}%. Considera di inviare promemoria più frequenti o richiedere conferma.</p>
              </div>
            ` : ''}
            
            <h3 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📈 Altre Metriche</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="background: white; padding: 15px; border-radius: 10px; text-align: center;">
                <strong style="font-size: 24px; color: #2196F3;">${messages}</strong><br>
                <span style="color: #666; font-size: 12px;">Messaggi</span>
              </div>
              <div style="background: white; padding: 15px; border-radius: 10px; text-align: center;">
                <strong style="font-size: 24px; color: #9C27B0;">${newClients}</strong><br>
                <span style="color: #666; font-size: 12px;">Nuovi Clienti</span>
              </div>
              <div style="background: white; padding: 15px; border-radius: 10px; text-align: center;">
                <strong style="font-size: 24px; color: #FF9800;">${documents}</strong><br>
                <span style="color: #666; font-size: 12px;">Documenti Inviati</span>
              </div>
              <div style="background: white; padding: 15px; border-radius: 10px; text-align: center;">
                <strong style="font-size: 24px; color: ${noShowRate > 20 ? '#f44336' : '#4CAF50'};">${noShowRate}%</strong><br>
                <span style="color: #666; font-size: 12px;">Tasso No-show</span>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://vetbuddy.it/dashboard" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">Vai alla Dashboard</a>
            </div>
          </div>
          <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - Report automatico settimanale</p>
          </div>
        </div>
      `
    });

    // Salva il report nel database
    await db.collection('weekly_reports').insertOne({
      clinicId,
      weekStart: weekAgoStr,
      weekEnd: todayStr,
      stats,
      messages,
      newClients,
      documents,
      sentAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Report settimanale inviato',
      stats
    });

  } catch (error) {
    console.error('Error sending report:', error);
    return NextResponse.json(
      { error: 'Errore nell\'invio del report' },
      { status: 500 }
    );
  }
}
