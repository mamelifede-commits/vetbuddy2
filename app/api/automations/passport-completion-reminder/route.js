import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { sendEmail } from '@/lib/email';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';

// Invia promemoria ai proprietari con Passport incompleti
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { minCompletionThreshold = 60, dryRun = false } = body;

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    const now = new Date();

    // Trova tutti i pet con proprietario
    const pets = await db.collection('pets').find({ ownerId: { $exists: true, $ne: null } }).toArray();

    let emailsSent = 0;
    let errors = 0;
    const details = [];

    for (const pet of pets) {
      try {
        // Calcola completamento passport
        const emergencyContacts = await db.collection('pet_emergency_contacts').find({ petId: pet.id }).toArray();
        const vaccinations = await db.collection('vaccinations').find({ petId: pet.id }).toArray();
        const travelPacks = await db.collection('pet_travel_packs').find({ petId: pet.id }).toArray();

        let score = 0;
        let maxScore = 0;

        // Dati base
        maxScore += 4;
        if (pet.name) score++;
        if (pet.species) score++;
        if (pet.breed) score++;
        if (pet.microchip) score++;

        // Contatto emergenza
        maxScore += 1;
        if (emergencyContacts.length > 0) score++;

        // Almeno 1 vaccino
        maxScore += 1;
        if (vaccinations.length > 0) score++;

        // Allergie/farmaci compilati
        maxScore += 2;
        if (pet.allergies && pet.allergies.length > 0) score++;
        if (pet.medications && pet.medications.length > 0) score++;

        // QR generato
        maxScore += 1;
        const passport = await db.collection('pet_passports').findOne({ petId: pet.id });
        if (passport?.qrToken) score++;

        // Assicurazione
        maxScore += 1;
        const insurance = await db.collection('pet_insurance').findOne({ petId: pet.id });
        if (insurance) score++;

        const completionPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

        // Skip se il passport è già sopra la soglia
        if (completionPercent >= minCompletionThreshold) continue;

        // Skip se reminder già inviato recentemente (7 giorni)
        if (pet.passportReminderSent && new Date(pet.passportReminderSent) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) continue;

        const owner = await db.collection('users').findOne({ id: pet.ownerId });
        if (!owner || !owner.email) continue;

        // Genera suggerimenti personalizzati
        const suggestions = [];
        if (!pet.microchip) suggestions.push('📋 Aggiungi il numero di microchip');
        if (emergencyContacts.length === 0) suggestions.push('📞 Inserisci un contatto di emergenza');
        if (vaccinations.length === 0) suggestions.push('💉 Registra i vaccini del tuo animale');
        if (!pet.allergies || pet.allergies.length === 0) suggestions.push('⚠️ Segnala eventuali allergie');
        if (!passport?.qrToken) suggestions.push('📱 Genera il QR emergenza');
        if (!insurance) suggestions.push('🛡️ Aggiungi la polizza assicurativa');

        const suggestionsHtml = suggestions.slice(0, 4).map(s =>
          `<li style="padding:8px 12px;background:#f0f0ff;border-radius:6px;margin:4px 0;color:#4338ca;font-size:13px;">${s}</li>`
        ).join('');

        const subject = `🛡️ ${pet.name}: il Passport è al ${completionPercent}% — completalo in pochi minuti!`;

        const html = `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="padding:24px 16px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:32px 24px;text-align:center;">
        <div style="font-size:36px;">🛡️</div>
        <h1 style="color:#fff;font-size:22px;margin:12px 0 4px;font-weight:700;">VetBuddy Passport</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Completa il Passport di ${pet.name}</p>
      </div>
      <div style="padding:28px 24px;">
        <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 16px;">
          Ciao <strong>${owner.name || 'Proprietario'}</strong>,<br>
          il Passport di <strong>${pet.name}</strong> è al <strong style="color:#6366f1;">${completionPercent}%</strong>. 
          Completandolo, avrai sempre a portata di mano tutti i dati sanitari del tuo animale, un QR per le emergenze e la possibilità di condividerlo con pet sitter e familiari.
        </p>

        <!-- Progress Bar -->
        <div style="background:#f3f4f6;border-radius:50px;height:12px;margin:16px 0;overflow:hidden;">
          <div style="background:linear-gradient(90deg,#6366f1,#a855f7);width:${completionPercent}%;height:100%;border-radius:50px;"></div>
        </div>
        <p style="text-align:center;color:#6366f1;font-weight:700;font-size:18px;margin:4px 0 20px;">${completionPercent}% completato</p>

        <p style="color:#4b5563;font-size:14px;font-weight:600;margin:0 0 8px;">Ecco cosa puoi fare:</p>
        <ul style="list-style:none;padding:0;margin:0 0 20px;">
          ${suggestionsHtml}
        </ul>

        <div style="text-align:center;margin:24px 0;">
          <a href="${BASE_URL}?tab=pets" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
            Completa il Passport di ${pet.name}
          </a>
        </div>

        <p style="color:#9ca3af;font-size:13px;text-align:center;margin:16px 0 0;">
          Bastano pochi minuti per avere un passaporto sanitario completo! 🐾
        </p>
      </div>
      <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #f3f4f6;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">© ${new Date().getFullYear()} VetBuddy — Passaporto sanitario digitale</p>
      </div>
    </div>
  </div>
</body>
</html>`;

        if (!dryRun) {
          const result = await sendEmail({ to: owner.email, subject, html });
          if (result.success) {
            emailsSent++;
            await db.collection('pets').updateOne(
              { id: pet.id },
              { $set: { passportReminderSent: now.toISOString() } }
            );
          } else {
            errors++;
          }
        } else {
          emailsSent++;
        }

        details.push({
          petId: pet.id,
          petName: pet.name,
          ownerEmail: owner.email,
          completionPercent,
          suggestionsCount: suggestions.length,
          sent: !dryRun
        });

      } catch (e) {
        console.error(`Errore passport completion reminder per pet ${pet.id}:`, e);
        errors++;
      }
    }

    // Log automazione
    await db.collection('automation_logs').insertOne({
      type: 'passport_completion_reminder',
      timestamp: now.toISOString(),
      emailsSent,
      errors,
      dryRun,
      totalPetsChecked: pets.length,
      threshold: minCompletionThreshold
    });

    return NextResponse.json({
      success: true,
      reminders: emailsSent,
      errors,
      dryRun,
      details
    });

  } catch (error) {
    console.error('Passport completion reminder error:', error);
    return NextResponse.json({ error: 'Errore automazione completamento passport' }, { status: 500 });
  }
}
