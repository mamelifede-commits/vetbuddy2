import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { corsHeaders } from './modules/constants';

// Import all module handlers
import { handleAuthGet, handleAuthPost } from './modules/auth';
import { handleLabGet, handleLabPost } from './modules/lab';
import { handleAdminGet, handleAdminPost, handleAdminDelete } from './modules/admin';
import { handleClinicGet, handleClinicPost } from './modules/clinic';
import { handleAppointmentsGet, handleAppointmentsPost, handleAppointmentsPut, handleAppointmentsDelete } from './modules/appointments';
import { handleDataGet, handleDataPost, handleDataPut, handleDataDelete } from './modules/data';
import { handleRewardsGet, handleRewardsPost } from './modules/rewards';
import { handlePaymentsGet, handlePaymentsPost } from './modules/payments';
import { handleSettingsGet, handleSettingsPost, handleSettingsPut } from './modules/settings';

// CORS preflight handler
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ==================== GET ====================
export async function GET(request, { params }) {
  const path = params?.path?.join('/') || '';
  try {
    // Health check
    if (path === 'health') {
      return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() }, { headers: corsHeaders });
    }

    // Delegate to modules in order
    const handlers = [
      handleAuthGet,
      handleAppointmentsGet,
      handleDataGet,
      handlePaymentsGet,
      handleSettingsGet,
      handleRewardsGet,
      handleClinicGet,
      handleLabGet,
      handleAdminGet,
    ];

    for (const handler of handlers) {
      const result = await handler(path, request);
      if (result) return result;
    }

    return NextResponse.json({ error: 'Route non trovata' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// ==================== POST ====================
export async function POST(request, { params }) {
  const path = params?.path?.join('/') || '';
  try {
    // Webhook routes don't parse JSON body
    if (path === 'webhook/stripe') {
      const result = await handlePaymentsPost(path, request, {});
      if (result) return result;
    }

    const body = await request.json().catch(() => ({}));

    const handlers = [
      handleSettingsPost,    // waitlist, invite-clinic, automations, video-consult, reviews
      handleAuthPost,        // login, register, reset password
      handleAppointmentsPost, // appointments, google calendar
      handleDataPost,        // documents, messages, staff, pets, owners, vaccinations
      handlePaymentsPost,    // stripe checkout, stripe settings
      handleRewardsPost,     // rewards types, assign, redeem, use
      handleClinicPost,      // clinic-specific routes
      handleLabPost,         // lab routes
      handleAdminPost,       // admin routes
    ];

    for (const handler of handlers) {
      const result = await handler(path, request, body);
      if (result) return result;
    }

    return NextResponse.json({ error: 'Route non trovata' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// ==================== PUT ====================
export async function PUT(request, { params }) {
  const path = params?.path?.join('/') || '';
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    const body = await request.json();

    // Delegate to modules
    const handlers = [
      handleAppointmentsPut,
      handleDataPut,
      handleSettingsPut,
    ];

    for (const handler of handlers) {
      const result = await handler(path, request, user, body);
      if (result) return result;
    }

    // Lab PUT handler has different signature
    const { handleLabPut } = await import('./modules/lab');
    if (handleLabPut) {
      const labResult = await handleLabPut(path, request, body);
      if (labResult) return labResult;
    }

    return NextResponse.json({ error: 'Route non trovata' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// ==================== DELETE ====================
export async function DELETE(request, { params }) {
  const path = params?.path?.join('/') || '';
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }

    // Delegate to modules
    const adminResult = await handleAdminDelete(path, request);
    if (adminResult) return adminResult;

    const appointmentResult = await handleAppointmentsDelete(path, request, user);
    if (appointmentResult) return appointmentResult;

    const dataResult = await handleDataDelete(path, request, user);
    if (dataResult) return dataResult;

    return NextResponse.json({ error: 'Route non trovata' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
