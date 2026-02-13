import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Parse CSV content
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }
  
  return rows;
}

// Map CSV headers to our schema (flexible mapping)
function mapRowToPatient(row) {
  // Try to find owner data
  const owner = {
    name: row['proprietario'] || row['owner'] || row['nome_proprietario'] || row['owner_name'] || 
          `${row['nome_proprietario'] || row['owner_first_name'] || ''} ${row['cognome_proprietario'] || row['owner_last_name'] || ''}`.trim(),
    email: row['email'] || row['email_proprietario'] || row['owner_email'] || '',
    phone: row['telefono'] || row['phone'] || row['telefono_proprietario'] || row['owner_phone'] || '',
    address: row['indirizzo'] || row['address'] || row['indirizzo_proprietario'] || ''
  };
  
  // Parse sterilized field (si/no, true/false, 1/0)
  const sterilizedValue = (row['sterilizzato'] || row['sterilized'] || row['castrato'] || '').toLowerCase();
  const isSterilized = ['si', 'sì', 'yes', 'true', '1', 'vero'].includes(sterilizedValue);
  
  // Try to find pet data
  const pet = {
    name: row['nome'] || row['nome_animale'] || row['pet_name'] || row['name'] || '',
    species: mapSpecies(row['specie'] || row['species'] || row['tipo'] || 'dog'),
    breed: row['razza'] || row['breed'] || '',
    birthDate: parseDate(row['data_nascita'] || row['birth_date'] || row['nascita'] || ''),
    microchip: row['microchip'] || row['chip'] || '',
    sex: mapSex(row['sesso'] || row['sex'] || row['genere'] || ''),
    weight: parseFloat(row['peso'] || row['weight'] || '') || null,
    color: row['colore'] || row['color'] || row['mantello'] || '',
    sterilized: isSterilized,
    allergies: row['allergie'] || row['allergies'] || row['allergia'] || '',
    medications: row['farmaci'] || row['medications'] || row['terapia'] || '',
    notes: row['note'] || row['notes'] || ''
  };
  
  // Try to find vaccination data
  const vaccines = [];
  if (row['vaccino'] || row['vaccine'] || row['vaccini']) {
    vaccines.push({
      name: row['vaccino'] || row['vaccine'] || row['vaccini'],
      date: parseDate(row['data_vaccino'] || row['vaccine_date'] || row['data_vaccinazione'] || ''),
      expiryDate: parseDate(row['scadenza_vaccino'] || row['vaccine_expiry'] || row['scadenza'] || '')
    });
  }
  
  return { owner, pet, vaccines };
}

// Map species names (Italian/English)
function mapSpecies(species) {
  const speciesMap = {
    'cane': 'dog', 'dog': 'dog', 'canino': 'dog',
    'gatto': 'cat', 'cat': 'cat', 'felino': 'cat',
    'uccello': 'bird', 'bird': 'bird', 'volatile': 'bird',
    'coniglio': 'rabbit', 'rabbit': 'rabbit',
    'criceto': 'hamster', 'hamster': 'hamster',
    'pesce': 'fish', 'fish': 'fish',
    'rettile': 'reptile', 'reptile': 'reptile', 'tartaruga': 'reptile',
    'cavallo': 'horse', 'horse': 'horse', 'equino': 'horse'
  };
  return speciesMap[species?.toLowerCase()] || 'other';
}

// Map sex
function mapSex(sex) {
  const sexMap = {
    'm': 'male', 'maschio': 'male', 'male': 'male',
    'f': 'female', 'femmina': 'female', 'female': 'female'
  };
  return sexMap[sex?.toLowerCase()] || '';
}

// Parse date (multiple formats)
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Try common formats
  const formats = [
    /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
    /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) { // DD/MM/YYYY
        return `${match[3]}-${match[2]}-${match[1]}`;
      } else if (format === formats[1]) { // YYYY-MM-DD
        return dateStr;
      } else if (format === formats[2]) { // DD-MM-YYYY
        return `${match[3]}-${match[2]}-${match[1]}`;
      }
    }
  }
  
  return null;
}

// GET - Get import template info
export async function GET(request) {
  const templateInfo = {
    success: true,
    message: 'Template per import pazienti',
    requiredColumns: ['nome', 'specie'],
    optionalColumns: [
      'razza', 'data_nascita', 'microchip', 'sesso', 'peso', 'colore', 
      'sterilizzato', 'allergie', 'farmaci', 'note',
      'proprietario', 'email', 'telefono', 'indirizzo',
      'vaccino', 'data_vaccino', 'scadenza_vaccino'
    ],
    speciesValues: ['cane', 'gatto', 'uccello', 'coniglio', 'criceto', 'pesce', 'rettile', 'altro'],
    sexValues: ['maschio', 'femmina'],
    sterilizedValues: ['si', 'no'],
    exampleRow: {
      nome: 'Luna',
      specie: 'cane',
      razza: 'Labrador',
      data_nascita: '15/03/2020',
      microchip: '380260000123456',
      sesso: 'femmina',
      peso: '25',
      colore: 'biondo',
      sterilizzato: 'si',
      allergie: 'Allergia al pollo',
      farmaci: '',
      note: 'Cane molto socievole',
      proprietario: 'Mario Rossi',
      email: 'mario.rossi@email.it',
      telefono: '+39 333 1234567',
      indirizzo: 'Via Roma 123, Milano',
      vaccino: 'Polivalente',
      data_vaccino: '01/01/2024',
      scadenza_vaccino: '01/01/2025'
    },
    supportedFormats: ['CSV', 'Excel (.xlsx)'],
    documentFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
    notes: {
      sterilizzato: 'Usa "si" o "no"',
      data_nascita: 'Formato: GG/MM/AAAA o AAAA-MM-GG',
      documenti: 'Nomina i documenti con il nome del paziente per abbinamento automatico (es. Luna_referto.pdf)'
    }
  };
  
  return NextResponse.json(templateInfo, { headers: corsHeaders });
}

// POST - Import patients data
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const formData = await request.formData();
    const file = formData.get('file');
    const importType = formData.get('type') || 'data'; // 'data' or 'documents'
    
    if (!file) {
      return NextResponse.json({ error: 'Nessun file caricato' }, { status: 400, headers: corsHeaders });
    }
    
    const clinicId = user.clinicId || user.id;
    const results = {
      success: true,
      imported: { owners: 0, pets: 0, vaccines: 0, documents: 0 },
      errors: [],
      warnings: []
    };
    
    // Handle data import (CSV)
    if (importType === 'data') {
      const content = await file.text();
      const rows = parseCSV(content);
      
      if (rows.length === 0) {
        return NextResponse.json({ error: 'File vuoto o formato non valido' }, { status: 400, headers: corsHeaders });
      }
      
      const users = await getCollection('users');
      const pets = await getCollection('pets');
      const vaccines = await getCollection('vaccines');
      
      // Track created owners to avoid duplicates
      const ownerMap = new Map();
      
      for (let i = 0; i < rows.length; i++) {
        try {
          const { owner, pet, vaccines: petVaccines } = mapRowToPatient(rows[i]);
          
          // Skip if no pet name
          if (!pet.name) {
            results.warnings.push(`Riga ${i + 2}: Nome animale mancante, saltata`);
            continue;
          }
          
          let ownerId = null;
          
          // Create or find owner if email provided
          if (owner.email) {
            const ownerKey = owner.email.toLowerCase();
            
            if (ownerMap.has(ownerKey)) {
              ownerId = ownerMap.get(ownerKey);
            } else {
              // Check if owner already exists
              const existingOwner = await users.findOne({ email: owner.email.toLowerCase() });
              
              if (existingOwner) {
                ownerId = existingOwner.id;
                ownerMap.set(ownerKey, ownerId);
              } else if (owner.name) {
                // Create new owner
                const newOwner = {
                  id: uuidv4(),
                  email: owner.email.toLowerCase(),
                  name: owner.name,
                  phone: owner.phone,
                  address: owner.address,
                  role: 'owner',
                  password: '', // Will need to set password on first login
                  createdAt: new Date().toISOString(),
                  importedBy: clinicId,
                  needsPasswordReset: true
                };
                await users.insertOne(newOwner);
                ownerId = newOwner.id;
                ownerMap.set(ownerKey, ownerId);
                results.imported.owners++;
              }
            }
          }
          
          // Create pet
          const newPet = {
            id: uuidv4(),
            name: pet.name,
            species: pet.species,
            breed: pet.breed || '',
            birthDate: pet.birthDate,
            microchip: pet.microchip || '',
            sex: pet.sex || '',
            weight: pet.weight,
            color: pet.color || '',
            sterilized: pet.sterilized || false,
            allergies: pet.allergies || '',
            medications: pet.medications || '',
            notes: pet.notes || '',
            ownerId: ownerId,
            clinicId: clinicId,
            clinics: [clinicId], // Pet can belong to multiple clinics
            createdAt: new Date().toISOString(),
            importedAt: new Date().toISOString()
          };
          
          // Check for duplicate by microchip
          if (pet.microchip) {
            const existingPet = await pets.findOne({ microchip: pet.microchip });
            if (existingPet) {
              // Add this clinic to existing pet's clinics
              if (!existingPet.clinics?.includes(clinicId)) {
                await pets.updateOne(
                  { id: existingPet.id },
                  { $addToSet: { clinics: clinicId } }
                );
              }
              results.warnings.push(`Riga ${i + 2}: ${pet.name} (microchip ${pet.microchip}) già esistente, aggiunta clinica`);
              continue;
            }
          }
          
          await pets.insertOne(newPet);
          results.imported.pets++;
          
          // Import vaccines
          for (const vaccine of petVaccines) {
            if (vaccine.name) {
              const newVaccine = {
                id: uuidv4(),
                petId: newPet.id,
                name: vaccine.name,
                date: vaccine.date,
                expiryDate: vaccine.expiryDate,
                clinicId: clinicId,
                createdAt: new Date().toISOString()
              };
              await vaccines.insertOne(newVaccine);
              results.imported.vaccines++;
            }
          }
          
        } catch (rowError) {
          results.errors.push(`Riga ${i + 2}: ${rowError.message}`);
        }
      }
      
    } else if (importType === 'documents') {
      // Handle document upload
      const files = formData.getAll('files');
      const petId = formData.get('petId'); // Optional: associate with specific pet
      
      const documents = await getCollection('documents');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', clinicId);
      
      // Create upload directory if it doesn't exist
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {
        // Directory might already exist
      }
      
      for (const docFile of files) {
        try {
          const bytes = await docFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const filename = `${Date.now()}_${docFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filepath = path.join(uploadDir, filename);
          
          await writeFile(filepath, buffer);
          
          // Try to match document to pet by filename
          let matchedPetId = petId;
          if (!matchedPetId) {
            // Try to extract pet name from filename
            const nameMatch = docFile.name.match(/^([^_]+)/);
            if (nameMatch) {
              const petsCollection = await getCollection('pets');
              const matchedPet = await petsCollection.findOne({
                clinics: clinicId,
                name: { $regex: new RegExp(nameMatch[1], 'i') }
              });
              if (matchedPet) {
                matchedPetId = matchedPet.id;
              }
            }
          }
          
          const newDoc = {
            id: uuidv4(),
            name: docFile.name,
            type: docFile.type.includes('pdf') ? 'report' : 'image',
            filename: filename,
            filepath: `/uploads/${clinicId}/${filename}`,
            petId: matchedPetId,
            clinicId: clinicId,
            status: 'active',
            createdAt: new Date().toISOString(),
            importedAt: new Date().toISOString()
          };
          
          await documents.insertOne(newDoc);
          results.imported.documents++;
          
          if (!matchedPetId) {
            results.warnings.push(`${docFile.name}: Documento caricato ma non associato a nessun paziente`);
          }
          
        } catch (docError) {
          results.errors.push(`${docFile.name}: ${docError.message}`);
        }
      }
    }
    
    return NextResponse.json(results, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
