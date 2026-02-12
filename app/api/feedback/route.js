import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// POST - Submit feedback from clinic
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { type, subject, message, rating } = body;

    if (!message || !type) {
      return NextResponse.json({ 
        error: 'Tipo e messaggio sono obbligatori' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Get user details
    const userDoc = await db.collection('users').findOne({ id: user.id });
    const clinicName = userDoc?.clinicName || userDoc?.name || 'Clinica';
    const userEmail = userDoc?.email || user.email;
    const userName = userDoc?.name || 'Utente';

    // Create feedback entry
    const feedback = {
      id: uuidv4(),
      userId: user.id,
      clinicName,
      userName,
      userEmail,
      type, // 'bug', 'suggestion', 'praise', 'other'
      subject: subject || null,
      message,
      rating: rating || null, // 1-5 stars optional
      status: 'new', // new, read, resolved
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('feedback').insertOne(feedback);

    // Send notification email to admin
    const typeLabels = {
      bug: '🐛 Bug Report',
      suggestion: '💡 Suggerimento',
      praise: '⭐ Complimento',
      other: '📝 Altro'
    };

    const typeColors = {
      bug: '#EF4444',
      suggestion: '#F59E0B',
      praise: '#10B981',
      other: '#3B82F6'
    };

    // Email to admin
    try {
      await sendEmail({
        to: 'info@vetbuddy.it',
        subject: `${typeLabels[type] || '📝 Feedback'} da ${clinicName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">📬 Nuovo Feedback</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Clinica:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${clinicName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${userEmail}">${userEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Tipo:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${typeLabels[type] || type}</td>
                  </tr>
                  ${subject ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Oggetto:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${subject}</td>
                  </tr>
                  ` : ''}
                  ${rating ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Valutazione:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${'⭐'.repeat(rating)}${'☆'.repeat(5-rating)}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid ${typeColors[type] || '#667eea'};">
                <h3 style="margin-top: 0; color: #333;">Messaggio:</h3>
                <p style="color: #666; white-space: pre-wrap; margin-bottom: 0;">${message}</p>
              </div>
              
              <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
                Ricevuto il ${new Date().toLocaleDateString('it-IT', { 
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                })}
              </p>
            </div>
            <div style="padding: 15px; background: #333; border-radius: 0 0 10px 10px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">VetBuddy Feedback System</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send feedback notification:', emailError);
    }

    // Send thank you email to user
    try {
      await sendEmail({
        to: userEmail,
        subject: `Grazie per il tuo feedback! 💚 - VetBuddy`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Grazie! 🎉</h1>
              <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Abbiamo ricevuto il tuo feedback</p>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <p style="font-size: 16px; color: #333;">Ciao ${userName},</p>
              
              <p style="color: #666;">Grazie per aver dedicato del tempo a inviarci il tuo ${typeLabels[type]?.toLowerCase() || 'feedback'}. 
              Il tuo contributo è fondamentale per migliorare VetBuddy!</p>
              
              <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${typeColors[type] || '#10B981'};">
                <p style="color: #999; font-size: 12px; margin: 0 0 8px 0;">IL TUO MESSAGGIO:</p>
                <p style="color: #333; margin: 0; white-space: pre-wrap;">${message.length > 200 ? message.substring(0, 200) + '...' : message}</p>
              </div>
              
              <div style="background: #E0F2FE; padding: 15px; border-radius: 10px; margin-top: 20px;">
                <p style="margin: 0; color: #0369A1; font-size: 14px;">
                  <strong>📬 Cosa succede ora?</strong><br/>
                  Il nostro team leggerà il tuo feedback entro 24-48 ore. 
                  ${type === 'bug' ? 'Se necessario, ti contatteremo per maggiori dettagli.' : 
                    type === 'suggestion' ? 'Valuteremo la tua idea per le prossime versioni!' :
                    'Ci fa sempre piacere ricevere feedback positivi!'}
                </p>
              </div>
              
              <p style="color: #666; margin-top: 20px;">Per qualsiasi altra cosa, siamo sempre disponibili!</p>
              
              <p style="color: #333; margin-top: 20px;">
                A presto 🐾<br/>
                <strong>Il team VetBuddy</strong>
              </p>
            </div>
            <div style="padding: 20px; background: #333; border-radius: 0 0 10px 10px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                VetBuddy - La piattaforma veterinaria<br/>
                <a href="mailto:info@vetbuddy.it" style="color: #10B981;">info@vetbuddy.it</a>
              </p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send thank you email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback inviato con successo! Grazie per il tuo contributo.',
      feedbackId: feedback.id
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Get all feedback (admin only)
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Get user email to check admin
    const userDoc = await db.collection('users').findOne({ id: user.id });
    if (userDoc?.email !== 'info@vetbuddy.it' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query = status && status !== 'all' ? { status } : {};
    const feedback = await db.collection('feedback')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      feedback,
      counts: {
        total: await db.collection('feedback').countDocuments(),
        new: await db.collection('feedback').countDocuments({ status: 'new' }),
        read: await db.collection('feedback').countDocuments({ status: 'read' }),
        resolved: await db.collection('feedback').countDocuments({ status: 'resolved' })
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
