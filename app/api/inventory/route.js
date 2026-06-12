import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = ['vaccino', 'farmaco', 'materiale', 'diagnostico'];

// Demo seed items (used only on explicit request when inventory is empty)
function buildDemoItems(clinicId) {
  const now = Date.now();
  const day = 86400000;
  const base = [
    { name: 'Vaccino Polivalente Cane', category: 'vaccino', quantity: 15, minThreshold: 10, unitPrice: 25, supplier: 'MSD Animal Health', lot: 'LOT2025A', expiryDays: 180, location: 'Frigo A - Ripiano 2' },
    { name: 'Vaccino Antirabbica', category: 'vaccino', quantity: 8, minThreshold: 5, unitPrice: 18, supplier: 'Boehringer Ingelheim', lot: 'LOT2025B', expiryDays: 90, location: 'Frigo A - Ripiano 1' },
    { name: 'Vaccino Trivalente Gatto', category: 'vaccino', quantity: 12, minThreshold: 8, unitPrice: 22, supplier: 'Zoetis', lot: 'LOT2025C', expiryDays: 150, location: 'Frigo B - Ripiano 1' },
    { name: 'Vaccino Leucemia Felina', category: 'vaccino', quantity: 4, minThreshold: 5, unitPrice: 28, supplier: 'Boehringer Ingelheim', lot: 'LOT2025D', expiryDays: 45, location: 'Frigo B - Ripiano 2' },
    { name: 'Siringhe 1ml Sterili', category: 'materiale', quantity: 250, minThreshold: 100, unitPrice: 0.3, supplier: 'BD Medical', lot: 'SYR2025', expiryDays: 365, location: 'Armadio C - Cassetto 3' },
    { name: 'Antiparassitario Spot-On Cane', category: 'farmaco', quantity: 35, minThreshold: 20, unitPrice: 12, supplier: 'Elanco', lot: 'SPOT2025', expiryDays: 240, location: 'Armadio A - Ripiano 4' },
    { name: 'Test FeLV/FIV', category: 'diagnostico', quantity: 6, minThreshold: 10, unitPrice: 35, supplier: 'IDEXX', lot: 'TEST2025', expiryDays: 120, location: 'Frigo C - Cassetto Test' },
    { name: 'Vaccino Bordetella', category: 'vaccino', quantity: 7, minThreshold: 5, unitPrice: 20, supplier: 'Zoetis', lot: 'LOT2025E', expiryDays: 40, location: 'Frigo A - Ripiano 3' },
  ];
  return base.map(b => ({
    id: uuidv4(),
    clinicId,
    name: b.name,
    category: b.category,
    quantity: b.quantity,
    minThreshold: b.minThreshold,
    unitPrice: b.unitPrice,
    supplier: b.supplier,
    lot: b.lot,
    expiryDate: new Date(now + b.expiryDays * day).toISOString(),
    location: b.location,
    lastRestocked: new Date(now - 20 * day).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
}

function requireClinic(request) {
  const user = getUserFromRequest(request);
  if (!user) return { error: NextResponse.json({ error: 'Non autorizzato' }, { status: 401 }) };
  if (user.role !== 'clinic' && user.role !== 'staff') {
    return { error: NextResponse.json({ error: 'Solo le cliniche possono gestire il magazzino' }, { status: 403 }) };
  }
  // Staff operates on the clinic's inventory
  const clinicId = user.role === 'staff' ? (user.clinicId || user.id) : user.id;
  return { user, clinicId };
}

// GET - List inventory items + recent movements
export async function GET(request) {
  try {
    const auth = requireClinic(request);
    if (auth.error) return auth.error;

    const inventory = await getCollection('inventory');
    const movementsCol = await getCollection('inventory_movements');

    const items = await inventory.find({ clinicId: auth.clinicId }).sort({ name: 1 }).toArray();
    const movements = await movementsCol.find({ clinicId: auth.clinicId }).sort({ date: -1 }).limit(50).toArray();

    return NextResponse.json({
      success: true,
      items: items.map(({ _id, ...rest }) => rest),
      movements: movements.map(({ _id, ...rest }) => rest)
    });
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new item OR seed demo data ({ seedDemo: true })
export async function POST(request) {
  try {
    const auth = requireClinic(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const inventory = await getCollection('inventory');

    // Seed demo data (only if inventory is empty for this clinic)
    if (body.seedDemo === true) {
      const existing = await inventory.countDocuments({ clinicId: auth.clinicId });
      if (existing > 0) {
        return NextResponse.json({ error: 'L\'inventario non è vuoto: impossibile caricare i dati di esempio' }, { status: 400 });
      }
      const demoItems = buildDemoItems(auth.clinicId);
      await inventory.insertMany(demoItems);
      return NextResponse.json({ success: true, seeded: demoItems.length });
    }

    // Create new item
    const { name, category, quantity, minThreshold, unitPrice, supplier, lot, expiryDate, location } = body;
    if (!name || !expiryDate) {
      return NextResponse.json({ error: 'Nome e data di scadenza sono obbligatori' }, { status: 400 });
    }

    const item = {
      id: uuidv4(),
      clinicId: auth.clinicId,
      name: String(name).trim(),
      category: VALID_CATEGORIES.includes(category) ? category : 'materiale',
      quantity: Math.max(0, parseInt(quantity) || 0),
      minThreshold: Math.max(0, parseInt(minThreshold) || 0),
      unitPrice: Math.max(0, parseFloat(unitPrice) || 0),
      supplier: supplier || '',
      lot: lot || '',
      expiryDate: new Date(expiryDate).toISOString(),
      location: location || '',
      lastRestocked: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await inventory.insertOne(item);

    // Initial load movement
    if (item.quantity > 0) {
      const movementsCol = await getCollection('inventory_movements');
      await movementsCol.insertOne({
        id: uuidv4(),
        clinicId: auth.clinicId,
        itemId: item.id,
        itemName: item.name,
        type: 'in',
        quantity: item.quantity,
        reason: 'Carico iniziale',
        performedBy: auth.user.name || auth.user.clinicName || 'Clinica',
        notes: '',
        date: new Date().toISOString()
      });
    }

    const { _id, ...cleanItem } = item;
    return NextResponse.json({ success: true, item: cleanItem }, { status: 201 });
  } catch (error) {
    console.error('Inventory POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Register a stock movement (in / out / expired) or update item fields
export async function PUT(request) {
  try {
    const auth = requireClinic(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { itemId, type, quantity, reason, notes } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'ID articolo obbligatorio' }, { status: 400 });
    }

    const inventory = await getCollection('inventory');
    const item = await inventory.findOne({ id: itemId, clinicId: auth.clinicId });
    if (!item) {
      return NextResponse.json({ error: 'Articolo non trovato' }, { status: 404 });
    }

    // Movement
    if (type && ['in', 'out', 'expired'].includes(type)) {
      const qty = Math.max(1, parseInt(quantity) || 1);
      const newQuantity = type === 'in' ? item.quantity + qty : Math.max(0, item.quantity - qty);

      const updateFields = { quantity: newQuantity, updatedAt: new Date().toISOString() };
      if (type === 'in') {
        updateFields.lastRestocked = new Date().toISOString();
        updateFields.lowStockAlertSent = false; // reset alert on restock
      }
      await inventory.updateOne({ id: itemId }, { $set: updateFields });

      const movementsCol = await getCollection('inventory_movements');
      const movement = {
        id: uuidv4(),
        clinicId: auth.clinicId,
        itemId,
        itemName: item.name,
        type,
        quantity: qty,
        reason: reason || (type === 'in' ? 'Rifornimento' : type === 'expired' ? 'Scadenza' : 'Utilizzo'),
        performedBy: auth.user.name || auth.user.clinicName || 'Clinica',
        notes: notes || '',
        date: new Date().toISOString()
      };
      await movementsCol.insertOne(movement);

      const { _id, ...cleanMovement } = movement;
      return NextResponse.json({ success: true, newQuantity, movement: cleanMovement });
    }

    // Field updates (edit item)
    const editable = ['name', 'category', 'minThreshold', 'unitPrice', 'supplier', 'lot', 'expiryDate', 'location'];
    const updateData = { updatedAt: new Date().toISOString() };
    for (const key of editable) {
      if (body[key] !== undefined) updateData[key] = key === 'expiryDate' ? new Date(body[key]).toISOString() : body[key];
    }
    if (body.expiryDate !== undefined) updateData.expiryAlertSent = false; // reset expiry alert on date change
    await inventory.updateOne({ id: itemId }, { $set: updateData });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Inventory PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove an item (?id=...)
export async function DELETE(request) {
  try {
    const auth = requireClinic(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID articolo obbligatorio' }, { status: 400 });
    }

    const inventory = await getCollection('inventory');
    const result = await inventory.deleteOne({ id, clinicId: auth.clinicId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Articolo non trovato' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Inventory DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
