import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioSmsNumber = process.env.TWILIO_SMS_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER;

// Create Twilio client only if credentials exist
let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export async function POST(request) {
  try {
    const { to, message } = await request.json();

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

    // Format phone number for SMS
    let formattedNumber = to.replace(/\s/g, '').replace(/-/g, '');
    if (!formattedNumber.startsWith('+')) {
      // Assume Italian number if no country code
      if (formattedNumber.startsWith('3')) {
        formattedNumber = '+39' + formattedNumber;
      } else {
        formattedNumber = '+' + formattedNumber;
      }
    }

    // Send SMS message
    const result = await client.messages.create({
      from: twilioSmsNumber,
      to: formattedNumber,
      body: message
    });

    console.log('📱 SMS sent:', result.sid, 'to:', formattedNumber);

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      status: result.status,
      to: formattedNumber
    });

  } catch (error) {
    console.error('SMS send error:', error);
    
    // Handle specific Twilio errors
    if (error.code === 21608) {
      return NextResponse.json({
        success: false,
        error: 'Numero non verificato. In trial mode puoi inviare solo a numeri verificati.',
        twilioError: error.message
      }, { status: 400 });
    }
    
    if (error.code === 21211) {
      return NextResponse.json({
        success: false,
        error: 'Numero di telefono non valido',
        twilioError: error.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error.message,
      configured: false
    }, { status: 500 });
  }
}
