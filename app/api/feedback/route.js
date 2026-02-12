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

    // Create feedback entry
    const feedback = {
      id: uuidv4(),
      userId: user.id,
      clinicName,
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
              
              <div style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
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
      // Don't fail the request if email fails
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
