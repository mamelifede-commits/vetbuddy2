import { NextResponse } from 'next/server';
import twilio from 'twilio';
import clientPromise from '@/lib/db';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

// WhatsApp notification templates
const TEMPLATES = {
  appointment_reminder: (data) => `
🐾 *Promemoria Appuntamento VetBuddy*

Ciao ${data.ownerName}! 👋

Ti ricordiamo che hai un appuntamento:
📅 *Data:* ${data.date}
⏰ *Ora:* ${data.time}
🏥 *Clinica:* ${data.clinicName}
🐕 *Paziente:* ${data.petName}
📋 *Tipo:* ${data.serviceType}

Per qualsiasi modifica, accedi all'app VetBuddy.

A presto! 🐾
  `.trim(),

  appointment_confirmation: (data) => `
✅ *Appuntamento Confermato - VetBuddy*

Ciao ${data.ownerName}! 👋

Il tuo appuntamento è stato confermato:
📅 *Data:* ${data.date}
⏰ *Ora:* ${data.time}
🏥 *Clinica:* ${data.clinicName}
🐕 *Paziente:* ${data.petName}

Ti aspettiamo! 🐾
  `.trim(),

  appointment_cancelled: (data) => `
❌ *Appuntamento Cancellato - VetBuddy*

Ciao ${data.ownerName},

L'appuntamento del ${data.date} alle ${data.time} per ${data.petName} è stato cancellato.

Per prenotare un nuovo appuntamento, accedi all'app VetBuddy.

A presto! 🐾
  `.trim(),

  document_ready: (data) => `
📄 *Nuovo Documento Disponibile - VetBuddy*

Ciao ${data.ownerName}! 👋

Un nuovo documento è disponibile per ${data.petName}:
📋 *Tipo:* ${data.documentType}
📅 *Data:* ${data.date}

Accedi all'app VetBuddy per visualizzarlo e scaricarlo.

🐾 Il team VetBuddy
  `.trim(),

  payment_received: (data) => `
💳 *Pagamento Ricevuto - VetBuddy*

Ciao ${data.ownerName}! 👋

Confermiamo la ricezione del pagamento:
💰 *Importo:* €${data.amount}
📅 *Data:* ${data.date}
🐕 *Paziente:* ${data.petName}

La fattura PROFORMA è disponibile nell'app.

Grazie! 🐾
  `.trim(),

  welcome: (data) => `
🎉 *Benvenuto in VetBuddy!*

Ciao ${data.ownerName}! 👋

La tua registrazione è completa. Ora puoi:
✅ Prenotare visite online
✅ Ricevere documenti digitali
✅ Chattare con la clinica
✅ Gestire i profili dei tuoi animali

Inizia subito! 🐾
  `.trim()
};

export async function POST(request) {
  try {
    const { template, data, to, customMessage } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Numero di telefono obbligatorio' },
        { status: 400 }
      );
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Twilio non configurato' },
        { status: 500 }
      );
    }

    // Generate message from template or use custom message
    let message;
    if (customMessage) {
      message = customMessage;
    } else if (template && TEMPLATES[template]) {
      message = TEMPLATES[template](data || {});
    } else {
      return NextResponse.json(
        { error: 'Template non valido o messaggio mancante' },
        { status: 400 }
      );
    }

    // Format phone number
    let formattedNumber = to.replace(/\s/g, '').replace(/-/g, '');
    if (!formattedNumber.startsWith('+')) {
      if (formattedNumber.startsWith('3')) {
        formattedNumber = '+39' + formattedNumber;
      } else {
        formattedNumber = '+' + formattedNumber;
      }
    }

    // Send WhatsApp message
    const result = await client.messages.create({
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to: `whatsapp:${formattedNumber}`,
      body: message
    });

    // Log notification to database
    const mongoClient = await clientPromise;
    const db = mongoClient.db("vetbuddy");
    await db.collection('whatsapp_logs').insertOne({
      id: require('crypto').randomUUID(),
      to: formattedNumber,
      template: template || 'custom',
      messageSid: result.sid,
      status: result.status,
      sentAt: new Date(),
      data: data || {}
    });

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      status: result.status,
      template: template || 'custom'
    });

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return NextResponse.json(
      { error: 'Errore invio notifica: ' + error.message },
      { status: 500 }
    );
  }
}

// GET available templates
export async function GET() {
  return NextResponse.json({
    templates: Object.keys(TEMPLATES),
    descriptions: {
      appointment_reminder: 'Promemoria appuntamento',
      appointment_confirmation: 'Conferma appuntamento',
      appointment_cancelled: 'Cancellazione appuntamento',
      document_ready: 'Documento disponibile',
      payment_received: 'Pagamento ricevuto',
      welcome: 'Benvenuto'
    }
  });
}
