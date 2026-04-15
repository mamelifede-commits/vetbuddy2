// modules/payments.js - Stripe payments and subscriptions
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Stripe from 'stripe';
import { stripe, SUBSCRIPTION_PLANS, corsHeaders } from './constants';

export async function handlePaymentsGet(path, request) {
  if (path === 'stripe/plans') {
    return NextResponse.json(SUBSCRIPTION_PLANS, { headers: corsHeaders });
  }

  if (path === 'stripe/subscription-status') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const transactions = await getCollection('payment_transactions');
    const latestSub = await transactions.findOne({ userId: user.id, type: 'subscription', paymentStatus: { $in: ['paid', 'trialing'] } }, { sort: { createdAt: -1 } });
    const users = await getCollection('users');
    const userData = await users.findOne({ id: user.id });
    return NextResponse.json({
      hasSubscription: !!latestSub || !!userData?.subscriptionPlan,
      plan: userData?.subscriptionPlan || latestSub?.planId || null,
      status: userData?.subscriptionStatus || latestSub?.paymentStatus || 'none',
      trialEnd: userData?.trialEnd || null,
      currentPeriodEnd: userData?.subscriptionPeriodEnd || null
    }, { headers: corsHeaders });
  }

  if (path.startsWith('stripe/checkout/status/')) {
    const sessionId = path.split('/')[3];
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const transactions = await getCollection('payment_transactions');
      await transactions.updateOne({ sessionId }, { $set: { status: session.status, paymentStatus: session.payment_status, updatedAt: new Date().toISOString() } });
      return NextResponse.json({ status: session.status, paymentStatus: session.payment_status, amountTotal: session.amount_total, currency: session.currency, metadata: session.metadata }, { headers: corsHeaders });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders });
    }
  }

  if (path === 'clinic/stripe-settings') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const users = await getCollection('users');
    const clinic = await users.findOne({ id: user.id });
    return NextResponse.json({ stripePublishableKey: clinic?.stripePublishableKey || '', stripeSecretKey: clinic?.stripeSecretKey ? '••••••••' + clinic.stripeSecretKey.slice(-4) : '', stripeConfigured: !!clinic?.stripeSecretKey }, { headers: corsHeaders });
  }

  return null;
}

export async function handlePaymentsPost(path, request, body) {
  // Subscription checkout
  if (path === 'stripe/checkout/subscription') {
    const user = getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'lab')) return NextResponse.json({ error: 'Solo cliniche e laboratori possono sottoscrivere abbonamenti' }, { status: 401, headers: corsHeaders });
    const { planId, originUrl } = body;
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan || plan.price === 0) return NextResponse.json({ error: 'Piano non valido o gratuito' }, { status: 400, headers: corsHeaders });
    if (user.role === 'lab' && planId !== 'lab_partner') return NextResponse.json({ error: 'Piano non valido per laboratori' }, { status: 400, headers: corsHeaders });
    if (user.role === 'clinic' && planId === 'lab_partner') return NextResponse.json({ error: 'Piano non valido per cliniche' }, { status: 400, headers: corsHeaders });
    try {
      const baseUrl = originUrl || process.env.NEXT_PUBLIC_BASE_URL;
      const successUrl = `${baseUrl}?subscription=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}?subscription=cancelled`;
      const trialDays = plan.trialDays || (planId === 'pro' ? 90 : planId === 'lab_partner' ? 180 : 0);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price_data: { currency: 'eur', product_data: { name: `VetBuddy ${plan.name}`, description: `Abbonamento mensile — ${plan.description}` }, unit_amount: Math.round(plan.price * 100), recurring: { interval: 'month' } }, quantity: 1 }],
        mode: 'subscription', ...(trialDays > 0 ? { subscription_data: { trial_period_days: trialDays } } : {}),
        success_url: successUrl, cancel_url: cancelUrl, customer_email: user.email,
        metadata: { userId: user.id, userRole: user.role, planId, type: 'subscription' }
      });
      const transactions = await getCollection('payment_transactions');
      const txDoc = { id: uuidv4(), sessionId: session.id, userId: user.id, email: user.email, userRole: user.role, type: 'subscription', planId, amount: plan.price, currency: 'eur', status: 'pending', paymentStatus: 'unpaid', trialDays, createdAt: new Date().toISOString() };
      await transactions.insertOne(txDoc);
      return NextResponse.json({ url: session.url, sessionId: session.id }, { headers: corsHeaders });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }

  // Visit payment checkout (owner pays clinic)
  if (path === 'stripe/checkout/visit') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { appointmentId, clinicId, originUrl } = body;
    const users = await getCollection('users');
    const clinic = await users.findOne({ id: clinicId, role: 'clinic' });
    if (!clinic?.stripeSecretKey) return NextResponse.json({ error: 'La clinica non ha configurato i pagamenti online' }, { status: 400, headers: corsHeaders });
    const appointments = await getCollection('appointments');
    const appointment = await appointments.findOne({ id: appointmentId });
    if (!appointment || !appointment.price) return NextResponse.json({ error: 'Appuntamento non trovato o senza prezzo' }, { status: 400, headers: corsHeaders });
    try {
      const clinicStripe = new Stripe(clinic.stripeSecretKey);
      const successUrl = `${originUrl}/owner/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${originUrl}/owner/dashboard?payment=cancelled`;
      const session = await clinicStripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price_data: { currency: 'eur', product_data: { name: appointment.reason || 'Visita veterinaria', description: `${appointment.petName} - ${appointment.date} ${appointment.time}` }, unit_amount: Math.round(appointment.price * 100) }, quantity: 1 }],
        mode: 'payment', success_url: successUrl, cancel_url: cancelUrl, customer_email: user.email,
        metadata: { appointmentId, clinicId, ownerId: user.id, type: 'visit' }
      });
      const transactions = await getCollection('payment_transactions');
      await transactions.insertOne({ id: uuidv4(), sessionId: session.id, appointmentId, clinicId, ownerId: user.id, email: user.email, type: 'visit', amount: appointment.price, currency: 'eur', status: 'pending', paymentStatus: 'unpaid', createdAt: new Date().toISOString() });
      await appointments.updateOne({ id: appointmentId }, { $set: { paymentSessionId: session.id, paymentStatus: 'pending' } });
      return NextResponse.json({ url: session.url, sessionId: session.id }, { headers: corsHeaders });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }

  // Save clinic Stripe settings
  if (path === 'clinic/stripe-settings') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { stripePublishableKey, stripeSecretKey } = body;
    const users = await getCollection('users');
    await users.updateOne({ id: user.id }, { $set: { stripePublishableKey, stripeSecretKey, updatedAt: new Date().toISOString() } });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }

  // Stripe Customer Portal (manage subscription, billing, cancel)
  if (path === 'stripe/portal') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const users = await getCollection('users');
    const userData = await users.findOne({ id: user.id });
    if (!userData?.stripeCustomerId) {
      return NextResponse.json({ error: 'Nessun abbonamento Stripe trovato. Sottoscrivi un piano prima.' }, { status: 400, headers: corsHeaders });
    }
    try {
      const { originUrl } = body;
      const baseUrl = originUrl || process.env.NEXT_PUBLIC_BASE_URL;
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: userData.stripeCustomerId,
        return_url: baseUrl,
      });
      return NextResponse.json({ url: portalSession.url }, { headers: corsHeaders });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }

  // Stripe Webhook
  if (path === 'webhook/stripe') {
    try {
      const rawBody = await request.text();
      const event = JSON.parse(rawBody);
      const transactions = await getCollection('payment_transactions');
      const users = await getCollection('users');
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          await transactions.updateOne({ sessionId: session.id }, { $set: { status: 'complete', paymentStatus: session.payment_status, updatedAt: new Date().toISOString() } });
          if (session.metadata?.type === 'subscription') {
            await users.updateOne({ id: session.metadata.userId }, { $set: { subscriptionPlan: session.metadata.planId, subscriptionStatus: 'active', stripeCustomerId: session.customer, stripeSubscriptionId: session.subscription, subscriptionUpdatedAt: new Date().toISOString() } });
          }
          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          const u = await users.findOne({ stripeCustomerId: subscription.customer });
          if (u) await users.updateOne({ id: u.id }, { $set: { subscriptionStatus: subscription.status, subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(), trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null, subscriptionUpdatedAt: new Date().toISOString() } });
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const u = await users.findOne({ stripeCustomerId: subscription.customer });
          if (u) await users.updateOne({ id: u.id }, { $set: { subscriptionStatus: 'cancelled', subscriptionPlan: null, subscriptionUpdatedAt: new Date().toISOString() } });
          break;
        }
      }
      return NextResponse.json({ received: true }, { headers: corsHeaders });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders });
    }
  }

  return null;
}
