# VetBuddy - Product Requirements Document

## Core Platform
VetBuddy è un gestionale veterinario completo per cliniche, proprietari di animali e laboratori di analisi.

## Roles
- **Clinic** (`clinic`): Gestisce pazienti, appuntamenti, comunicazioni, documenti, fatturazione
- **Owner** (`owner`): Visualizza profilo animale, appuntamenti, referti
- **Lab** (`lab`): Gestisce richieste analisi, carica referti PDF, listino prezzi, connessioni cliniche
- **Admin** (`admin`): Gestisce lab, cliniche, approvazioni, integrazioni

## Modules

### 1. Clinic Dashboard
- Agenda, Team Inbox, Documenti, Archivio Clinica, Eventi, Servizi, Video Consulto
- Pazienti, Proprietari, Staff, Fatturazione, Automazioni
- **Analisi Lab**: Crea richieste analisi, ricevi referti, revisiona e pubblica al proprietario
- **Marketplace Lab**: Cerca lab partner, filtra per città/esame/ritiro/prezzo, visualizza profili, richiedi collegamento, invita lab

### 2. Lab Dashboard
- Richieste analisi con flusso di stato (pending → completed)
- Caricamento referti PDF
- Gestione cliniche collegate (accetta/rifiuta richieste)
- Listino prezzi indicativo (CRUD con tipo esame, prezzo, tempi)
- Profilo laboratorio

### 3. Owner Dashboard
- Profilo animale con referti lab nella tab "Referti"
- Prenotazioni, chat, documenti, premi fedeltà

### 4. Admin Dashboard
- Approvazione laboratori, statistiche, configurazione webhook

### 5. Ricette Elettroniche Veterinarie (REV)
- **Modalità Ponte** (attiva): Wizard bozza → emetti su Vetinfo → registra N°/PIN → pubblica al proprietario
- **Integrazione API Diretta** (prossimamente): Emissione automatica tramite API Vetinfo
- Ruoli: Veterinario (CRUD + emissione), Staff (lettura), Proprietario (solo pubblicate)
- Audit trail completo, notifiche email al proprietario con dettagli farmaci
- Dashboard statistiche: bozze, emesse oggi, errori, totale
- Endpoint: `/api/prescriptions`, `/api/prescriptions/:id/register-manual`, `/api/prescriptions/:id/publish`

### 6. Landing Page
- Homepage con sezioni: Funzionalità, Automazioni, Fatturazione, **Ricette Elettroniche REV**, Premi, Lab Marketplace, **VetBuddy Passport**, Prezzi
- Prezzi: Starter Clinica (Free), Pro Clinica (€49/mo, 90gg gratis), Lab Partner (€29/mo, 6 mesi gratis), Enterprise (Custom)
- Brochure con Lab Marketplace, REV, **VetBuddy Passport** e prezzi aggiornati — PDF scaricabile a `/brochure-vetbuddy.pdf`
- Tutorial: Clinica (con sezione Passport), Proprietario (con sezione Passport), Laboratorio

### 7. VetBuddy Passport
- **Passaporto sanitario digitale** per ogni animale
- **QR Emergenza**: codice stampabile con dati essenziali, visibilità configurabile
- **Lost Pet Mode**: avviso pubblico con zona smarrimento, segnalazione ritrovamento via email
- **Condivisione temporanea**: link con scadenza per pet sitter, familiari, pensioni
- **Travel Pack**: checklist documenti viaggio, vaccini verificati, istruzioni
- **Timeline**: storico vaccini, trattamenti, documenti, scansioni QR
- **Assicurazione**: registrazione polizza, scadenze, note copertura
- **Clinic Dashboard Widget**: passport incompleti, vaccini in scadenza, pazienti senza microchip
- API: `/api/passport/:petId`, `/api/passport/qr/generate`, `/api/passport/sharing`, `/api/passport/clinic/dashboard`
- Pagina pubblica QR: `/passport/[token]/page.js`

## Key API Endpoints
- `GET/POST /api/labs/marketplace` - Lab marketplace
- `GET /api/clinic/connected-labs` - Cliniche collegate
- `POST /api/clinic/lab-connection` - Richiesta collegamento
- `POST /api/clinic/invite-lab` - Invita laboratorio
- `GET /api/lab/connections` - Connessioni lab
- `POST /api/lab/connection-response` - Accetta/rifiuta
- `GET/POST /api/lab/price-list` - Listino prezzi
- `GET /api/lab/my-price-list` - Listino proprio
- `GET /api/labs/:id/profile` - Profilo pubblico
- `GET /api/labs/:id/price-list` - Listino pubblico

## DB Collections
- `users` (all roles), `lab_requests`, `lab_reports`, `lab_price_list`
- `clinic_lab_connections`, `lab_invitations`
- `prescriptions`, `prescription_items`, `prescription_audit_events`, `prescription_external_logs`
- `payment_transactions` (Stripe)
- `pet_passports`, `pet_emergency_contacts`, `pet_sharing_links`, `pet_travel_packs`, `pet_insurance`, `pet_qr_scan_logs`, `vaccinations`

## Tech Stack
- Next.js 14, Tailwind CSS, Shadcn UI, MongoDB
- Components extracted to `/app/app/components/` with `next/dynamic`

## Automazioni Intelligenti: Lavoro & Finanza (giugno 2025)
6 nuove automazioni aggiunte (totale 50 chiavi in automationSettings):
- `noShowRiskPrediction` — analizza storico no-show del cliente; appuntamenti di domani a rischio ricevono promemoria extra + alert riepilogativo alla clinica
- `smartAgendaFiller` — se occupazione agenda <50% nei prossimi 3gg, invita (max 5/clinica) i clienti con vaccini scaduti/in scadenza entro 14gg
- `noShowRecovery` — invito automatico a riprenotare dopo no-show (entro 7gg)
- `estimateFollowup` — sollecito preventivi status 'sent' dopo 4gg (email cliente, fallback alert clinica)
- `paymentEscalation` — 2° sollecito fatture unpaid a 14gg + avviso finale a 30gg + report crediti alla clinica
- `labDelayAlert` — lab_requests non completate da +72h → alert a laboratorio e clinica
File: `/app/app/api/cron/daily/automations/work-management.js` (collegato a GET /api/cron/daily)
Settings: aggiunte a DEFAULT_SETTINGS + PRO_AUTOMATIONS in `/app/app/api/automations/settings/route.js` e a cron-helpers.js
UI: nuova card "🧠 Intelligenti: Lavoro & Finanza" in `/app/app/components/clinic/ClinicAutomations.js`
Testato: backend 100% OK (cron 0 errori, settings GET/PUT/POST OK), UI verificata con screenshot.

## Automazioni Avanzate: Anti-Spreco & Proattività (giugno 2025 - round 2)
7 ulteriori automazioni (totale 56 chiavi clinica + 1 lab-side):
- `morningBriefing` — email mattutina alla clinica: agenda del giorno, appuntamenti a rischio, preventivi/fatture pendenti, vaccini in scadenza 7gg (idempotente via collection `automation_daily_flags`)
- `bookingDropAlert` — lunedì: se settimana chiusa < 70% della media 4 settimane (min 3/sett) → alert con suggerimenti
- `expiryStockAlert` — collection `inventory` {clinicId,name,quantity,unitPrice,expiryDate,lot}: prodotti in scadenza 60gg → email anti-spreco. NOTA: modulo UI Stock Vaccini è ancora MOCKED (dati demo, non scrive su `inventory`)
- `healthPlanRenewal` — health_plan_assignments active: scadenza = startDate + plan.durationMonths; reminder 30gg prima
- `ownerBirthday` — users.birthDate (campo nuovo: input "Data di nascita" in OwnerProfile.js, salvato via PUT /api/owner/profile — route dedicata app/api/owner/profile/route.js + catch-all settings.js)
- `therapyReminder` — prescriptions EMITTED/REGISTERED_MANUALLY visibleToOwner, 2gg dopo issueDate, items da prescription_items
- `labMonthlyReport` — 1° del mese, per ogni user role lab: volumi, completate, tempo medio risposta, top 3 cliniche
File: `/app/app/api/cron/daily/automations/advanced.js` (collegato a /api/cron/daily)
UI: nuova card "♻️ Anti-Spreco & Proattività" in ClinicAutomations.js
Testato: backend 6/6 OK (cron 0 errori), UI verificata con screenshot.
