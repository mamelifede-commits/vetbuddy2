import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Default service categories
const defaultCategories = [
  { id: 'visita', name: 'Visite', icon: 'Stethoscope' },
  { id: 'vaccino', name: 'Vaccinazioni', icon: 'Syringe' },
  { id: 'chirurgia', name: 'Chirurgia', icon: 'Scissors' },
  { id: 'diagnostica', name: 'Diagnostica', icon: 'Search' },
  { id: 'laboratorio', name: 'Laboratorio', icon: 'FlaskConical' },
  { id: 'dentale', name: 'Cure Dentali', icon: 'Smile' },
  { id: 'toelettatura', name: 'Toelettatura', icon: 'Sparkles' },
  { id: 'altro', name: 'Altro', icon: 'MoreHorizontal' }
];

// GET - Get price list
export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const clinicId = user.role === 'clinic' ? user.id : user.clinicId;
    const services = await getCollection('services');
    
    const serviceList = await services
      .find({ clinicId })
      .sort({ category: 1, name: 1 })
      .toArray();
    
    // Group by category
    const groupedServices = {};
    for (const cat of defaultCategories) {
      groupedServices[cat.id] = {
        ...cat,
        services: serviceList.filter(s => s.category === cat.id)
      };
    }
    
    return NextResponse.json({
      services: serviceList,
      categories: defaultCategories,
      grouped: groupedServices
    }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('GET services error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// POST - Create new service
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const body = await request.json();
    const { name, description, category, price, duration, vatIncluded } = body;
    
    if (!name || !price) {
      return NextResponse.json({ 
        error: 'Nome e prezzo sono obbligatori' 
      }, { status: 400, headers: corsHeaders });
    }
    
    const clinicId = user.role === 'clinic' ? user.id : user.clinicId;
    const services = await getCollection('services');
    
    const newService = {
      id: uuidv4(),
      clinicId,
      name,
      description: description || '',
      category: category || 'altro',
      price: parseFloat(price),
      vatIncluded: vatIncluded !== false, // Default true (price includes VAT)
      duration: duration || null, // Duration in minutes
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await services.insertOne(newService);
    
    return NextResponse.json(newService, { headers: corsHeaders });
    
  } catch (error) {
    console.error('POST service error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// PUT - Update service
export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID servizio obbligatorio' }, { status: 400, headers: corsHeaders });
    }
    
    const clinicId = user.role === 'clinic' ? user.id : user.clinicId;
    const services = await getCollection('services');
    
    const service = await services.findOne({ id, clinicId });
    if (!service) {
      return NextResponse.json({ error: 'Servizio non trovato' }, { status: 404, headers: corsHeaders });
    }
    
    updates.updatedAt = new Date().toISOString();
    
    await services.updateOne({ id }, { $set: updates });
    
    const updatedService = await services.findOne({ id });
    return NextResponse.json(updatedService, { headers: corsHeaders });
    
  } catch (error) {
    console.error('PUT service error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// DELETE - Delete service
export async function DELETE(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID servizio obbligatorio' }, { status: 400, headers: corsHeaders });
    }
    
    const clinicId = user.role === 'clinic' ? user.id : user.clinicId;
    const services = await getCollection('services');
    
    await services.deleteOne({ id, clinicId });
    
    return NextResponse.json({ success: true }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('DELETE service error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
