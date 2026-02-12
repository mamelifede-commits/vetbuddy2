import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

// Categorie e parole chiave per auto-assegnazione
const CATEGORIES = {
  urgenza: {
    keywords: ['urgente', 'emergenza', 'grave', 'sangue', 'incidente', 'avvelenamento', 'non respira', 'collasso', 'convulsioni'],
    priority: 'high',
    color: '#f44336'
  },
  appuntamento: {
    keywords: ['appuntamento', 'prenotare', 'visita', 'disponibilità', 'orari', 'prenotazione'],
    priority: 'medium',
    color: '#2196F3'
  },
  vaccini: {
    keywords: ['vaccino', 'vaccini', 'vaccinazione', 'richiamo', 'antirabica'],
    priority: 'medium',
    color: '#9C27B0'
  },
  documenti: {
    keywords: ['documento', 'referto', 'certificato', 'prescrizione', 'ricetta', 'fattura'],
    priority: 'low',
    color: '#FF9800'
  },
  informazioni: {
    keywords: ['informazioni', 'domanda', 'chiedere', 'sapere', 'costo', 'prezzo', 'quanto costa'],
    priority: 'low',
    color: '#607D8B'
  }
};

export async function POST(request) {
  try {
    const { messageId, messageText, clinicId } = await request.json();

    if (!messageId || !messageText || !clinicId) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    const textLower = messageText.toLowerCase();
    
    // Determina categoria e priorità
    let assignedCategory = 'generale';
    let priority = 'normal';
    let color = '#9E9E9E';
    let isUrgent = false;

    for (const [category, config] of Object.entries(CATEGORIES)) {
      const hasKeyword = config.keywords.some(keyword => textLower.includes(keyword));
      if (hasKeyword) {
        assignedCategory = category;
        priority = config.priority;
        color = config.color;
        if (category === 'urgenza') {
          isUrgent = true;
        }
        break;
      }
    }

    // Trova lo staff disponibile per questa categoria
    const staffMembers = await db.collection('clinic_staff').find({
      clinicId,
      categories: assignedCategory,
      isActive: true
    }).toArray();

    let assignedTo = null;
    if (staffMembers.length > 0) {
      // Assegna al membro con meno ticket aperti
      const staffWithCounts = await Promise.all(
        staffMembers.map(async (staff) => {
          const openTickets = await db.collection('messages').countDocuments({
            clinicId,
            assignedTo: staff.id,
            status: { $in: ['open', 'pending'] }
          });
          return { ...staff, openTickets };
        })
      );
      
      staffWithCounts.sort((a, b) => a.openTickets - b.openTickets);
      assignedTo = staffWithCounts[0].id;
    }

    // Aggiorna il messaggio con categoria e assegnazione
    await db.collection('messages').updateOne(
      { id: messageId },
      {
        $set: {
          category: assignedCategory,
          priority,
          color,
          isUrgent,
          assignedTo,
          autoAssigned: true,
          autoAssignedAt: new Date()
        }
      }
    );

    // Se urgente, crea una notifica per la clinica
    if (isUrgent) {
      await db.collection('notifications').insertOne({
        clinicId,
        type: 'urgent_message',
        messageId,
        title: '🚨 Messaggio Urgente!',
        body: `Nuovo messaggio urgente: "${messageText.substring(0, 100)}..."`,
        read: false,
        createdAt: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      category: assignedCategory,
      priority,
      isUrgent,
      assignedTo
    });

  } catch (error) {
    console.error('Auto-assign error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'auto-assegnazione' },
      { status: 500 }
    );
  }
}
