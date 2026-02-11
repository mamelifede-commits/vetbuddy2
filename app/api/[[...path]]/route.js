import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { hashPassword, comparePassword, generateToken, getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Subscription Plans (prices in EUR)
const SUBSCRIPTION_PLANS = {
  starter: { name: 'Starter', price: 0.00, description: 'Per iniziare' },
  pro: { name: 'Pro', price: 129.00, description: 'Per automatizzare' },
  enterprise: { name: 'Enterprise', price: 299.00, description: 'Per gruppi e catene' }
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Route handler
export async function GET(request, { params }) {
  const path = params?.path?.join('/') || '';
  
  try {
    // Health check
    if (path === 'health') {
      return NextResponse.json({ status: 'ok', app: 'VetBuddy API' }, { headers: corsHeaders });
    }

    // Get current user
    if (path === 'auth/me') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const userData = await users.findOne({ id: user.id }, { projection: { password: 0 } });
      return NextResponse.json(userData, { headers: corsHeaders });
    }

    // Get appointments for clinic
    if (path === 'appointments') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const appointments = await getCollection('appointments');
      const query = user.role === 'clinic' ? { clinicId: user.id } : { ownerId: user.id };
      const list = await appointments.find(query).sort({ date: 1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get documents
    if (path === 'documents') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const documents = await getCollection('documents');
      const query = user.role === 'clinic' ? { clinicId: user.id } : { ownerId: user.id };
      const list = await documents.find(query).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get messages/inbox
    if (path === 'messages') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const messages = await getCollection('messages');
      const list = await messages.find({
        $or: [{ senderId: user.id }, { receiverId: user.id }]
      }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get staff (clinic only)
    if (path === 'staff') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const staff = await getCollection('staff');
      const list = await staff.find({ clinicId: user.id }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get pets (owner only)
    if (path === 'pets') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const pets = await getCollection('pets');
      const query = user.role === 'owner' ? { ownerId: user.id } : { clinicId: user.id };
      const list = await pets.find(query).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get subscription plans
    if (path === 'stripe/plans') {
      return NextResponse.json(SUBSCRIPTION_PLANS, { headers: corsHeaders });
    }

    // Get checkout session status
    if (path.startsWith('stripe/checkout/status/')) {
      const sessionId = path.split('/')[3];
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        // Update payment transaction status
        const transactions = await getCollection('payment_transactions');
        await transactions.updateOne(
          { sessionId },
          { $set: { status: session.status, paymentStatus: session.payment_status, updatedAt: new Date().toISOString() } }
        );
        
        return NextResponse.json({
          status: session.status,
          paymentStatus: session.payment_status,
          amountTotal: session.amount_total,
          currency: session.currency,
          metadata: session.metadata
        }, { headers: corsHeaders });
      } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders });
      }
    }

    // Get clinic Stripe settings
    if (path === 'clinic/stripe-settings') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: user.id });
      return NextResponse.json({ 
        stripePublishableKey: clinic?.stripePublishableKey || '',
        stripeSecretKey: clinic?.stripeSecretKey ? '••••••••' + clinic.stripeSecretKey.slice(-4) : '',
        stripeConfigured: !!clinic?.stripeSecretKey
      }, { headers: corsHeaders });
    }

    // Get owners (for clinic)
    if (path === 'owners') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const list = await users.find({ role: 'owner', clinicId: user.id }, { projection: { password: 0 } }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Search clinics (public)
    if (path === 'clinics/search') {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q') || '';
      const city = searchParams.get('city') || '';
      const service = searchParams.get('service') || '';
      
      const users = await getCollection('users');
      const filter = { role: 'clinic' };
      
      if (query) {
        filter.$or = [
          { clinicName: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } }
        ];
      }
      if (city) {
        filter.city = { $regex: city, $options: 'i' };
      }
      
      const clinics = await users.find(filter, { projection: { password: 0, resetToken: 0, resetExpiry: 0 } }).toArray();
      
      // Get reviews for each clinic
      const reviews = await getCollection('reviews');
      const clinicsWithReviews = await Promise.all(clinics.map(async (clinic) => {
        const clinicReviews = await reviews.find({ clinicId: clinic.id }).toArray();
        const avgRating = clinicReviews.length > 0 
          ? clinicReviews.reduce((sum, r) => sum + r.overallRating, 0) / clinicReviews.length 
          : 0;
        return { ...clinic, reviewCount: clinicReviews.length, avgRating: Math.round(avgRating * 10) / 10 };
      }));
      
      return NextResponse.json(clinicsWithReviews, { headers: corsHeaders });
    }

    // Get clinic reviews
    if (path.startsWith('clinics/') && path.endsWith('/reviews')) {
      const clinicId = path.split('/')[1];
      const reviews = await getCollection('reviews');
      const list = await reviews.find({ clinicId }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get single clinic (public)
    if (path.startsWith('clinics/') && !path.includes('/reviews')) {
      const clinicId = path.split('/')[1];
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: clinicId, role: 'clinic' }, { projection: { password: 0 } });
      if (!clinic) {
        return NextResponse.json({ error: 'Clinica non trovata' }, { status: 404, headers: corsHeaders });
      }
      
      const reviews = await getCollection('reviews');
      const clinicReviews = await reviews.find({ clinicId }).toArray();
      const avgRating = clinicReviews.length > 0 
        ? clinicReviews.reduce((sum, r) => sum + r.overallRating, 0) / clinicReviews.length 
        : 0;
      
      return NextResponse.json({ 
        ...clinic, 
        reviewCount: clinicReviews.length, 
        avgRating: Math.round(avgRating * 10) / 10 
      }, { headers: corsHeaders });
    }

    // Get pet with full details
    if (path.startsWith('pets/') && path.split('/').length === 2) {
      const petId = path.split('/')[1];
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const pets = await getCollection('pets');
      const pet = await pets.findOne({ id: petId });
      if (!pet) {
        return NextResponse.json({ error: 'Animale non trovato' }, { status: 404, headers: corsHeaders });
      }
      
      // Get related data
      const [appointments, documents, vaccinations] = await Promise.all([
        getCollection('appointments').then(c => c.find({ petId }).sort({ date: -1 }).toArray()),
        getCollection('documents').then(c => c.find({ petId }).sort({ createdAt: -1 }).toArray()),
        getCollection('vaccinations').then(c => c.find({ petId }).sort({ date: -1 }).toArray())
      ]);
      
      // Calculate total spending
      const totalSpent = appointments.reduce((sum, a) => sum + (a.price || 0), 0);
      const currentYear = new Date().getFullYear();
      const yearSpent = appointments
        .filter(a => new Date(a.date).getFullYear() === currentYear)
        .reduce((sum, a) => sum + (a.price || 0), 0);
      
      return NextResponse.json({ 
        ...pet, 
        appointments, 
        documents, 
        vaccinations,
        spending: { total: totalSpent, currentYear: yearSpent }
      }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Route non trovata' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request, { params }) {
  const path = params?.path?.join('/') || '';
  
  try {
    const body = await request.json().catch(() => ({}));

    // Register
    if (path === 'auth/register') {
      const { email, password, name, role, clinicName, phone, address, city, vatNumber, website } = body;
      if (!email || !password || !name || !role) {
        return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400, headers: corsHeaders });
      }
      
      const users = await getCollection('users');
      const existing = await users.findOne({ email });
      if (existing) {
        return NextResponse.json({ error: 'Email già registrata' }, { status: 400, headers: corsHeaders });
      }

      const user = {
        id: uuidv4(),
        email,
        password: hashPassword(password),
        name,
        role, // 'clinic' or 'owner'
        clinicName: role === 'clinic' ? clinicName : null,
        phone: phone || '',
        address: address || '',
        city: city || '',
        vatNumber: role === 'clinic' ? (vatNumber || '') : null,
        website: role === 'clinic' ? (website || '') : null,
        createdAt: new Date().toISOString()
      };

      await users.insertOne(user);
      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      const { password: _, ...userWithoutPassword } = user;
      
      return NextResponse.json({ user: userWithoutPassword, token }, { headers: corsHeaders });
    }

    // Password Reset Request
    if (path === 'auth/forgot-password') {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ error: 'Email richiesta' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      const user = await users.findOne({ email });
      
      if (!user) {
        // Don't reveal if user exists or not for security
        return NextResponse.json({ success: true, message: 'Se l\'email esiste, riceverai un link per reimpostare la password.' }, { headers: corsHeaders });
      }

      // Generate reset token
      const resetToken = uuidv4();
      const resetExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour
      
      await users.updateOne({ email }, { $set: { resetToken, resetExpiry } });

      // Send email
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}?reset=${resetToken}`;
      await sendEmail({
        to: email,
        subject: 'VetBuddy - Reimposta la tua password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B6B;">🐾 VetBuddy</h2>
            <p>Hai richiesto di reimpostare la tua password.</p>
            <p>Clicca il link qui sotto per creare una nuova password:</p>
            <a href="${resetLink}" style="display: inline-block; background: #FF6B6B; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">Reimposta Password</a>
            <p style="color: #666; font-size: 14px;">Il link scadrà tra 1 ora.</p>
            <p style="color: #666; font-size: 14px;">Se non hai richiesto questo reset, ignora questa email.</p>
          </div>
        `
      });

      return NextResponse.json({ success: true, message: 'Se l\'email esiste, riceverai un link per reimpostare la password.' }, { headers: corsHeaders });
    }

    // Password Reset Confirm
    if (path === 'auth/reset-password') {
      const { token, newPassword } = body;
      if (!token || !newPassword) {
        return NextResponse.json({ error: 'Token e nuova password richiesti' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      const user = await users.findOne({ resetToken: token });
      
      if (!user || new Date(user.resetExpiry) < new Date()) {
        return NextResponse.json({ error: 'Token non valido o scaduto' }, { status: 400, headers: corsHeaders });
      }

      await users.updateOne(
        { resetToken: token },
        { $set: { password: hashPassword(newPassword) }, $unset: { resetToken: '', resetExpiry: '' } }
      );

      return NextResponse.json({ success: true, message: 'Password aggiornata con successo' }, { headers: corsHeaders });
    }

    // Login
    if (path === 'auth/login') {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: 'Email e password richiesti' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      const user = await users.findOne({ email });
      if (!user || !comparePassword(password, user.password)) {
        return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401, headers: corsHeaders });
      }

      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      const { password: _, ...userWithoutPassword } = user;
      
      return NextResponse.json({ user: userWithoutPassword, token }, { headers: corsHeaders });
    }

    // Create appointment
    if (path === 'appointments') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { petId, petName, ownerName, ownerId, date, time, reason, notes } = body;
      const appointments = await getCollection('appointments');
      
      const appointment = {
        id: uuidv4(),
        clinicId: user.role === 'clinic' ? user.id : body.clinicId,
        ownerId: user.role === 'owner' ? user.id : ownerId,
        petId,
        petName,
        ownerName,
        date,
        time,
        reason,
        notes: notes || '',
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };

      await appointments.insertOne(appointment);
      return NextResponse.json(appointment, { headers: corsHeaders });
    }

    // Upload document
    if (path === 'documents') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { name, type, content, petId, petName, ownerId } = body;
      const documents = await getCollection('documents');
      
      const document = {
        id: uuidv4(),
        name,
        type, // 'vaccination', 'medical_record', 'prescription', 'other'
        content, // base64 content or text
        petId,
        petName,
        clinicId: user.role === 'clinic' ? user.id : body.clinicId,
        ownerId: user.role === 'owner' ? user.id : ownerId,
        createdBy: user.id,
        createdAt: new Date().toISOString()
      };

      await documents.insertOne(document);
      return NextResponse.json(document, { headers: corsHeaders });
    }

    // Send message
    if (path === 'messages') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { receiverId, content, subject } = body;
      const messages = await getCollection('messages');
      
      const message = {
        id: uuidv4(),
        senderId: user.id,
        receiverId,
        subject: subject || 'Nuovo messaggio',
        content,
        read: false,
        createdAt: new Date().toISOString()
      };

      await messages.insertOne(message);
      return NextResponse.json(message, { headers: corsHeaders });
    }

    // Add staff member
    if (path === 'staff') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { name, role, email, phone } = body;
      const staff = await getCollection('staff');
      
      const member = {
        id: uuidv4(),
        clinicId: user.id,
        name,
        role, // 'vet', 'assistant', 'receptionist'
        email,
        phone,
        createdAt: new Date().toISOString()
      };

      await staff.insertOne(member);
      return NextResponse.json(member, { headers: corsHeaders });
    }

    // Add pet
    if (path === 'pets') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { name, species, breed, birthDate, weight, notes, ownerId, microchip, sterilized, allergies, medications } = body;
      const pets = await getCollection('pets');
      
      const pet = {
        id: uuidv4(),
        name,
        species,
        breed,
        birthDate,
        weight,
        microchip: microchip || '',
        sterilized: sterilized || false,
        allergies: allergies || '',
        medications: medications || '',
        notes: notes || '',
        ownerId: user.role === 'owner' ? user.id : ownerId,
        clinicId: user.role === 'clinic' ? user.id : body.clinicId,
        createdAt: new Date().toISOString()
      };

      await pets.insertOne(pet);
      return NextResponse.json(pet, { headers: corsHeaders });
    }

    // Send document via email
    if (path === 'documents/send-email') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { documentId, recipientEmail } = body;
      const documents = await getCollection('documents');
      const doc = await documents.findOne({ id: documentId });
      
      if (!doc) {
        return NextResponse.json({ error: 'Documento non trovato' }, { status: 404, headers: corsHeaders });
      }

      const result = await sendEmail({
        to: recipientEmail,
        subject: `VetBuddy - Documento: ${doc.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">🐾 VetBuddy</h2>
            <p>Hai ricevuto un nuovo documento dalla clinica veterinaria.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px;">${doc.name}</h3>
              <p style="margin: 0; color: #666;">Tipo: ${doc.type}</p>
              <p style="margin: 10px 0 0; color: #666;">Animale: ${doc.petName || 'N/A'}</p>
            </div>
            <p style="color: #666; font-size: 14px;">Documento inviato tramite VetBuddy - La piattaforma per la gestione delle cliniche veterinarie.</p>
          </div>
        `
      });

      return NextResponse.json(result, { headers: corsHeaders });
    }

    // Create Stripe checkout session for subscription
    if (path === 'stripe/checkout/subscription') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Solo le cliniche possono sottoscrivere abbonamenti' }, { status: 401, headers: corsHeaders });
      }

      const { planId, originUrl } = body;
      const plan = SUBSCRIPTION_PLANS[planId];
      
      if (!plan || plan.price === 0) {
        return NextResponse.json({ error: 'Piano non valido o gratuito' }, { status: 400, headers: corsHeaders });
      }

      try {
        const successUrl = `${originUrl}/clinic/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${originUrl}/clinic/dashboard?subscription=cancelled`;

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'eur',
              product_data: {
                name: `VetBuddy ${plan.name}`,
                description: `Abbonamento mensile ${plan.name}`,
              },
              unit_amount: Math.round(plan.price * 100), // Convert to cents
              recurring: { interval: 'month' },
            },
            quantity: 1,
          }],
          mode: 'subscription',
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: user.email,
          metadata: {
            userId: user.id,
            planId: planId,
            type: 'subscription'
          }
        });

        // Save transaction
        const transactions = await getCollection('payment_transactions');
        await transactions.insertOne({
          id: uuidv4(),
          sessionId: session.id,
          userId: user.id,
          email: user.email,
          type: 'subscription',
          planId: planId,
          amount: plan.price,
          currency: 'eur',
          status: 'pending',
          paymentStatus: 'unpaid',
          createdAt: new Date().toISOString()
        });

        return NextResponse.json({ url: session.url, sessionId: session.id }, { headers: corsHeaders });
      } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
    }

    // Save clinic Stripe settings
    if (path === 'clinic/stripe-settings') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { stripePublishableKey, stripeSecretKey } = body;
      const users = await getCollection('users');
      
      await users.updateOne(
        { id: user.id },
        { $set: { stripePublishableKey, stripeSecretKey, updatedAt: new Date().toISOString() } }
      );

      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Create payment session for visit (owner pays clinic)
    if (path === 'stripe/checkout/visit') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { appointmentId, clinicId, originUrl } = body;
      
      // Get clinic's Stripe keys
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: clinicId, role: 'clinic' });
      
      if (!clinic?.stripeSecretKey) {
        return NextResponse.json({ error: 'La clinica non ha configurato i pagamenti online' }, { status: 400, headers: corsHeaders });
      }

      // Get appointment details
      const appointments = await getCollection('appointments');
      const appointment = await appointments.findOne({ id: appointmentId });
      
      if (!appointment || !appointment.price) {
        return NextResponse.json({ error: 'Appuntamento non trovato o senza prezzo' }, { status: 400, headers: corsHeaders });
      }

      try {
        // Use clinic's Stripe account
        const clinicStripe = new Stripe(clinic.stripeSecretKey);
        
        const successUrl = `${originUrl}/owner/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${originUrl}/owner/dashboard?payment=cancelled`;

        const session = await clinicStripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'eur',
              product_data: {
                name: appointment.reason || 'Visita veterinaria',
                description: `${appointment.petName} - ${appointment.date} ${appointment.time}`,
              },
              unit_amount: Math.round(appointment.price * 100),
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: user.email,
          metadata: {
            appointmentId: appointmentId,
            clinicId: clinicId,
            ownerId: user.id,
            type: 'visit'
          }
        });

        // Save transaction
        const transactions = await getCollection('payment_transactions');
        await transactions.insertOne({
          id: uuidv4(),
          sessionId: session.id,
          appointmentId: appointmentId,
          clinicId: clinicId,
          ownerId: user.id,
          email: user.email,
          type: 'visit',
          amount: appointment.price,
          currency: 'eur',
          status: 'pending',
          paymentStatus: 'unpaid',
          createdAt: new Date().toISOString()
        });

        // Update appointment with payment session
        await appointments.updateOne(
          { id: appointmentId },
          { $set: { paymentSessionId: session.id, paymentStatus: 'pending' } }
        );

        return NextResponse.json({ url: session.url, sessionId: session.id }, { headers: corsHeaders });
      } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
    }

    // Register owner to clinic
    if (path === 'owners') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { email, name, phone } = body;
      const users = await getCollection('users');
      
      // Check if owner exists
      let owner = await users.findOne({ email });
      
      if (owner) {
        // Link existing owner to clinic
        await users.updateOne({ email }, { $set: { clinicId: user.id } });
        owner = await users.findOne({ email }, { projection: { password: 0 } });
      } else {
        // Create new owner with temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        owner = {
          id: uuidv4(),
          email,
          password: hashPassword(tempPassword),
          name,
          role: 'owner',
          phone: phone || '',
          clinicId: user.id,
          createdAt: new Date().toISOString()
        };
        await users.insertOne(owner);
        delete owner.password;
      }

      return NextResponse.json(owner, { headers: corsHeaders });
    }

    // Submit clinic review
    if (path === 'reviews') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Solo i proprietari possono lasciare recensioni' }, { status: 401, headers: corsHeaders });
      }

      const { clinicId, overallRating, punctuality, competence, price, comment } = body;
      if (!clinicId || !overallRating) {
        return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400, headers: corsHeaders });
      }

      const reviews = await getCollection('reviews');
      
      // Check if user already reviewed this clinic
      const existing = await reviews.findOne({ clinicId, ownerId: user.id });
      if (existing) {
        return NextResponse.json({ error: 'Hai già recensito questa clinica' }, { status: 400, headers: corsHeaders });
      }

      const review = {
        id: uuidv4(),
        clinicId,
        ownerId: user.id,
        ownerName: user.name || 'Utente',
        overallRating: Math.min(5, Math.max(1, overallRating)),
        punctuality: punctuality ? Math.min(5, Math.max(1, punctuality)) : null,
        competence: competence ? Math.min(5, Math.max(1, competence)) : null,
        price: price ? Math.min(5, Math.max(1, price)) : null,
        comment: comment || '',
        createdAt: new Date().toISOString()
      };

      await reviews.insertOne(review);
      return NextResponse.json(review, { headers: corsHeaders });
    }

    // Add vaccination
    if (path === 'vaccinations') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { petId, name, date, nextDue, notes } = body;
      const vaccinations = await getCollection('vaccinations');
      
      const vaccination = {
        id: uuidv4(),
        petId,
        name,
        date,
        nextDue,
        notes: notes || '',
        createdBy: user.id,
        createdAt: new Date().toISOString()
      };

      await vaccinations.insertOne(vaccination);
      return NextResponse.json(vaccination, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Route non trovata' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request, { params }) {
  const path = params?.path?.join('/') || '';
  
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }

    const body = await request.json();

    // Update appointment
    if (path.startsWith('appointments/')) {
      const id = path.split('/')[1];
      const appointments = await getCollection('appointments');
      await appointments.updateOne({ id }, { $set: { ...body, updatedAt: new Date().toISOString() } });
      const updated = await appointments.findOne({ id });
      return NextResponse.json(updated, { headers: corsHeaders });
    }

    // Mark message as read
    if (path.startsWith('messages/')) {
      const id = path.split('/')[1];
      const messages = await getCollection('messages');
      await messages.updateOne({ id }, { $set: { read: true } });
      const updated = await messages.findOne({ id });
      return NextResponse.json(updated, { headers: corsHeaders });
    }

    // Update pet
    if (path.startsWith('pets/')) {
      const id = path.split('/')[1];
      const pets = await getCollection('pets');
      await pets.updateOne({ id }, { $set: { ...body, updatedAt: new Date().toISOString() } });
      const updated = await pets.findOne({ id });
      return NextResponse.json(updated, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Route non trovata' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request, { params }) {
  const path = params?.path?.join('/') || '';
  
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }

    // Delete appointment
    if (path.startsWith('appointments/')) {
      const id = path.split('/')[1];
      const appointments = await getCollection('appointments');
      await appointments.deleteOne({ id });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Delete document
    if (path.startsWith('documents/')) {
      const id = path.split('/')[1];
      const documents = await getCollection('documents');
      await documents.deleteOne({ id });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Delete staff member
    if (path.startsWith('staff/')) {
      const id = path.split('/')[1];
      const staff = await getCollection('staff');
      await staff.deleteOne({ id });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Delete pet
    if (path.startsWith('pets/')) {
      const id = path.split('/')[1];
      const pets = await getCollection('pets');
      await pets.deleteOne({ id });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Route non trovata' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
