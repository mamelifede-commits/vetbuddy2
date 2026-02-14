import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// Force dynamic rendering (required for request.headers access)
export const dynamic = 'force-dynamic';

// GET owner profile
export async function GET(request) {
  try {
    const userData = getUserFromRequest(request);
    
    if (!userData || !userData.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }
    
    const userId = userData.id;

    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    const user = await db.collection('users').findOne({ id: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      whatsappEnabled: user.whatsappEnabled !== false,
      emailNotificationsEnabled: user.emailNotificationsEnabled !== false,
      reminderDaysBefore: user.reminderDaysBefore || 1
    });

  } catch (error) {
    console.error('Error fetching owner profile:', error);
    return NextResponse.json({ error: 'Errore nel recupero del profilo' }, { status: 500 });
  }
}

// PUT update owner profile
export async function PUT(request) {
  try {
    const userData = getUserFromRequest(request);
    
    if (!userData || !userData.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }
    
    const userId = userData.id;

    const data = await request.json();
    
    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    // Update user profile
    const updateData = {
      updatedAt: new Date()
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.whatsappEnabled !== undefined) updateData.whatsappEnabled = data.whatsappEnabled;
    if (data.emailNotificationsEnabled !== undefined) updateData.emailNotificationsEnabled = data.emailNotificationsEnabled;
    if (data.reminderDaysBefore !== undefined) updateData.reminderDaysBefore = data.reminderDaysBefore;

    const result = await db.collection('users').updateOne(
      { id: userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profilo aggiornato con successo' 
    });

  } catch (error) {
    console.error('Error updating owner profile:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento del profilo' }, { status: 500 });
  }
}
