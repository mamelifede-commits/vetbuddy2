import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Create Twilio client only if credentials exist
let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export async function POST(request) {
  try {
    const { to, message, type = 'text' } = await request.json();

    // Validation
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Parametri mancanti: to e message sono obbligatori' },
        { status: 400 }
      );
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Twilio non configurato. Verifica le credenziali.' },
        { status: 500 }
      );
    }

    // Format phone number for WhatsApp
    let formattedNumber = to.replace(/\s/g, '').replace(/-/g, '');
    if (!formattedNumber.startsWith('+')) {
      // Assume Italian number if no country code
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

    console.log('WhatsApp message sent:', result.sid);

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      status: result.status,
      to: formattedNumber
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    
    // Handle specific Twilio errors
    if (error.code === 21608) {
      return NextResponse.json(
        { error: 'Il numero non è registrato su WhatsApp o non ha accettato i messaggi dal tuo account business.' },
        { status: 400 }
      );
    }
    
    if (error.code === 21211) {
      return NextResponse.json(
        { error: 'Numero di telefono non valido.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Errore invio messaggio: ' + error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check WhatsApp status
export async function GET() {
  try {
    if (!client) {
      return NextResponse.json({
        configured: false,
        error: 'Twilio non configurato'
      });
    }

    // Check account status
    const account = await client.api.accounts(accountSid).fetch();

    return NextResponse.json({
      configured: true,
      status: account.status,
      whatsappNumber: twilioWhatsAppNumber,
      accountName: account.friendlyName
    });

  } catch (error) {
    console.error('Error checking WhatsApp status:', error);
    return NextResponse.json({
      configured: false,
      error: error.message
    });
  }
}
