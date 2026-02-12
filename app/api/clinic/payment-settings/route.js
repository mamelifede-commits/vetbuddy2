import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// Predefined cancellation policy options
export const CANCELLATION_POLICIES = [
  { id: 'free_24h', label: 'Cancellazione gratuita fino a 24h prima', penalty: 0 },
  { id: 'free_48h', label: 'Cancellazione gratuita fino a 48h prima', penalty: 0 },
  { id: 'penalty_30_24h', label: 'Penale 30% se cancelli meno di 24h prima', penalty: 30 },
  { id: 'penalty_50_24h', label: 'Penale 50% se cancelli meno di 24h prima', penalty: 50 },
  { id: 'penalty_100_24h', label: 'Nessun rimborso se cancelli meno di 24h prima', penalty: 100 },
  { id: 'no_refund', label: 'Nessun rimborso per cancellazioni', penalty: 100 }
];

// Default payment settings
const DEFAULT_PAYMENT_SETTINGS = {
  paymentMethods: {
    online: false,      // Pagamento online (Stripe)
    cardInClinic: true, // Carta di credito in clinica
    bankTransfer: false, // Bonifico bancario
    cash: true          // Contanti
  },
  cancellationPolicy: 'free_24h',
  customCancellationNote: '',
  bankDetails: {
    iban: '',
    bankName: '',
    accountHolder: ''
  },
  requireDeposit: false,
  depositAmount: 0,
  depositPercentage: 0
};

// GET - Get payment settings for a clinic
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId richiesto' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    const clinic = await db.collection('users').findOne({ id: clinicId, role: 'clinic' });
    if (!clinic) {
      return NextResponse.json({ error: 'Clinica non trovata' }, { status: 404 });
    }

    // Return existing settings or defaults
    const settings = clinic.paymentSettings || DEFAULT_PAYMENT_SETTINGS;
    
    // Get the policy details
    const policyDetails = CANCELLATION_POLICIES.find(p => p.id === settings.cancellationPolicy) || CANCELLATION_POLICIES[0];

    return NextResponse.json({
      success: true,
      settings: {
        ...DEFAULT_PAYMENT_SETTINGS,
        ...settings
      },
      policyDetails,
      availablePolicies: CANCELLATION_POLICIES
    });

  } catch (error) {
    console.error('Error getting payment settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update payment settings (authenticated clinic only)
export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (user.role !== 'clinic') {
      return NextResponse.json({ error: 'Solo le cliniche possono modificare queste impostazioni' }, { status: 403 });
    }

    const body = await request.json();
    const { paymentMethods, cancellationPolicy, customCancellationNote, bankDetails, requireDeposit, depositAmount, depositPercentage } = body;

    // Validate cancellation policy
    if (cancellationPolicy && !CANCELLATION_POLICIES.find(p => p.id === cancellationPolicy)) {
      return NextResponse.json({ error: 'Policy di cancellazione non valida' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    const updateData = {
      'paymentSettings.updatedAt': new Date()
    };

    if (paymentMethods) {
      updateData['paymentSettings.paymentMethods'] = {
        online: Boolean(paymentMethods.online),
        cardInClinic: Boolean(paymentMethods.cardInClinic),
        bankTransfer: Boolean(paymentMethods.bankTransfer),
        cash: Boolean(paymentMethods.cash)
      };
    }

    if (cancellationPolicy) {
      updateData['paymentSettings.cancellationPolicy'] = cancellationPolicy;
    }

    if (customCancellationNote !== undefined) {
      updateData['paymentSettings.customCancellationNote'] = customCancellationNote;
    }

    if (bankDetails) {
      updateData['paymentSettings.bankDetails'] = {
        iban: bankDetails.iban || '',
        bankName: bankDetails.bankName || '',
        accountHolder: bankDetails.accountHolder || ''
      };
    }

    if (requireDeposit !== undefined) {
      updateData['paymentSettings.requireDeposit'] = Boolean(requireDeposit);
    }

    if (depositAmount !== undefined) {
      updateData['paymentSettings.depositAmount'] = Number(depositAmount) || 0;
    }

    if (depositPercentage !== undefined) {
      updateData['paymentSettings.depositPercentage'] = Number(depositPercentage) || 0;
    }

    await db.collection('users').updateOne(
      { id: user.id },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: 'Impostazioni pagamento salvate'
    });

  } catch (error) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
