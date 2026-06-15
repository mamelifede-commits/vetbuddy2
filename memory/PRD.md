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

## Stock Vaccini collegato al DB reale (giugno 2025 - round 3)
- Nuova API `/app/app/api/inventory/route.js`: GET (items+movimenti), POST (crea articolo / {seedDemo:true} se vuoto), PUT (movimento in/out/expired o modifica campi), DELETE (?id=)
- Collections: `inventory` {id, clinicId, name, category, quantity, minThreshold, unitPrice, supplier, lot, expiryDate(ISO), location, lastRestocked, lowStockAlertSent, expiryAlertSent}, `inventory_movements` {id, clinicId, itemId, itemName, type, quantity, reason, performedBy, notes, date}
- `StockVaccini.js` NON è più mocked: caricamento da API, form nuovo articolo controllato, dialog movimenti (carico/scarico/smaltisci), stato vuoto con "Carica Dati di Esempio", export CSV reale
- Implementata automazione `lowStockAlert` (prima solo dichiarata, MAI implementata) in advanced.js: quantity < minThreshold → email clinica; flag resettato al carico (PUT type:in)
- `expiryStockAlert` ora pienamente operativa su dati reali
- Auth: 401 senza token, 403 per ruolo owner; staff usa clinicId della clinica
- Testato: backend 10/10 OK (cron lowStockAlert.sent=1, expiryStockAlert.sent=1, 0 errori), UI verificata con screenshot (8 item seed visibili, badge Scorta Bassa corretti)

## Audit Automazioni + Batch 1 (giugno 2025 - round 4)
AUDIT completo eseguito su 15 automazioni richieste dall'utente (tabella consegnata in chat).
Batch 1 implementato e testato (6/6 test backend OK):
1. LOG CENTRALIZZATO: `logAutomation(db, clinicId, type, title, details)` in cron-helpers.js → scrive su `automation_logs` (clinicId+executedAt, letto da GET /api/automations/log "Cronologia"). Chiamato in work-management (4 punti), advanced (briefing/calo/scadenze/scorte/digest), engagement (dormienti), waitlist-notify
2. SLOT LIBERO: `/app/lib/waitlist-notify.js` → notifyWaitlistForSlot chiamata da appointments.js PUT (status→cancelled/cancellato/annullato/rescheduled, solo date future) e DELETE. Rispetta toggle waitlistNotification. Max 5 notifiche, marca notified:true
3. PREVENTIVI: auto-expire (sent + validUntil<now → expired + report clinica valore recuperabile) + reminder cliente 3gg prima scadenza (flag expiryReminderSent) — in work-management.js sezioni 27a/27b, stessa chiave estimateFollowup
4. DORMIENTI 6/9/12 MESI: engagement.js sezione 9 riscritta — segmenti con messaggi differenziati, flags reactivation6/9/12Sent (legacy reactivationSent = 6m), 1° del mese
5. DIGEST FRAGILI: advanced.js sez. 38, lunedì, chiave NUOVA fragilePatientsDigest (57 chiavi clinica), usa getFragilePatients (ora EXPORTED da fragile-patients.js), top 10 urgency high/riskScore>=50 senza nextVisit
6. NO-SHOW RECOVERY UI REALE: business-modules?module=noshow → getRealNoShowData(clinicId) per cliniche autenticate (unconfirmed/noshowHistory/waitlist/recoveredSlots/ownerLabels), demo fallback senza auth. NoShowRecovery.js usa api client (token)
7. PASSPORT SCHEDULATO: advanced.js sez. 39, mercoledì, self-fetch POST a /api/automations/passport-completion-reminder (threshold 60%), flag globale giornaliero
NOTA: testing agent ha spostato logAutomation fuori da wrapEmail (errore di inserimento mio) — fix già applicato.
BATCH RIMANENTI: Batch 2 (Pre-visita intelligente + Consensi digitali: moduli UI mock da rendere reali), Batch 3 (referto fermo, recensione smart, post-operatorio postSurgeryFollowup MAI implementata, medicationRefill), Batch 4 (onboarding cliente nuovo, piano cucciolo). Chiavi dichiarate senza implementazione: weightAlert, dentalHygiene, referralProgram, griefFollowup.

## Batch 2-3-4 Completati (giugno 2025 - round 5)
BATCH 2 — Moduli mock resi reali:
- Pre-Visita: lib/previsit.js (createAndSendPrevisitForm, toggle previsitForm), API /api/previsit (GET pubblico id+t/lista clinica, POST submit pubblico/invio manuale, PUT revisione), collection previsit_forms, pagina pubblica /previsit/[formId]?t=token, hook automatico su ENTRAMBI i punti insertOne in appointments.js. Urgenza 'Alta' → status da_revisionare + email clinica + log. QuestionariPreVisita.js → API reale con invio manuale (ownerName/ownerEmail/petName/data/tipo).
- Consensi: API /api/consents (POST clinica crea+invia con token; GET pubblico marca 'visto'; POST sign con signedName → 'firmato' + notifica clinica; auto-scadenza 30gg su GET lista), collection consents, pagina pubblica /consent/[consentId]?t=token (firma elettronica semplice: checkbox + nome). ConsensiDigitali.js → API reale, form controllato per 7 tipi (chirurgia/anestesia/trattamento/privacy/pubblicazione/passport/preventivo).
BATCH 3 — care-followup.js (cron): postSurgeryFollowup sequenza 24h/3/7gg (keyword chirurgiche su appuntamenti completed, flags postOp1/3/7Sent), medicationRefill (prescrizioni 25-35gg, flag refillReminderSent), referto fermo (lab_requests completed +48h → alert clinica, flag stuckReportAlertSent, counter labDelayAlert.stuckReports), missingConsentCheck (chirurgici entro 2gg senza consenso firmato → reminder owner se pending + alert clinica, flag consentCheckDone). Recensione smart in engagement.js: skip se problematic/cooldown90gg(lastReviewRequestAt)/no-show 30gg/ticket aperto/fattura unpaid 30gg+ (reviewSkippedReason salvato).
BATCH 4 — in care-followup.js: onboarding step2 Passport (owner createdAt 5-7gg, flag onboardingPassportSent) e step3 Prenota (10-14gg senza appuntamenti, flag onboardingBookSent) sotto chiave welcomeNewPet; puppyProgram (pet birthDate <12 mesi, flag puppyPlanSent su pet, una tantum).
WIRING: 60 chiavi clinica nelle settings (nuove: previsitForm, missingConsentCheck, puppyProgram), card UI "📋 Pre-Visita, Consensi & Percorsi" (3 toggle, postSurgeryFollowup già presente in card Operatività - evitato doppione).
BUG FIX: escape unicode \u{...} nelle pagine pubbliche JSX → sostituiti con emoji reali (crash compilazione Next). Testing agent ha pulito .next cache.
TEST: 19/19 backend OK (E2E previsit, E2E consensi, hook prenotazione→modulo+log, cron 0 errori, auth 401, regressioni OK).

## Task Manager Staff reale (giugno 2025 - round 6)
- NUOVA collection `staff_tasks` + API /api/tasks (route dedicata /app/app/api/tasks/route.js): GET lista clinica (auth clinic/staff), POST crea manuale (title+dueDate obbligatori, category/priority normalizzate) o seedDemo (10 task, solo se vuoto), PUT cambio stato (nuovo/in_lavorazione/completato + completedAt/completedBy) e modifica campi, DELETE ?id=.
- NUOVO helper /app/lib/tasks.js: createAutoTask() idempotente via dedupeKey (param db opzionale per i cron).
- 4 HOOK AUTOMAZIONI che creano task reali per lo staff: 1) previsit/route.js urgenza ALTA → category questionnaire, dedupeKey previsit_urgent_<formId>; 2) care-followup.js referto fermo → category document, dedupeKey stuckreport_<labReqId>; 3) care-followup.js consenso mancante → category send priority alta, dedupeKey consent_missing_<aptId> (creato anche senza email clinica); 4) work-management.js rischio no-show → category confirm priority alta, dedupeKey noshowrisk_<aptId>. Counter results.<chiave>.tasksCreated nel cron.
- FRONTEND TaskManagerStaff.js: convertito da mock a api.get/post/put/delete('tasks'). Empty state con seed demo, modal Nuovo Task controllato (categoria toggle, datalist staff da /api/staff best-effort), dialog Dettagli (Completa/In lavorazione/Elimina), badge 'scaduto' derivato da dueDate, banner errori. Box info aggiornato con i 4 trigger reali.
- TEST: 36/36 backend OK (auth 401/403, CRUD completo, seed idempotente, hook previsit E2E con dedupe verificato, cron errors=0, regressioni OK, cleanup DB eseguito).
- RIMANENTI dopo questo round: upload foto/video questionario pre-visita, automazioni minori (petWeightAlert, dentalHygiene, referralProgram, griefFollowup), refactoring page.js monolitico + login page dedicata.

## Upload foto/video pre-visita + automazioni minori + contenuti aggiornati (giugno 2025 - round 7)
- NUOVO /api/previsit/upload: upload chunked (chunk base64 512KB, max 40 chunk/20MB, max 3 file/form, solo image/video) su collections previsit_media + previsit_media_chunks. GET download assemblato/lista (accesso token form ?t= o auth clinica), DELETE (owner solo pre-invio, clinica sempre). GET /api/previsit lista clinica include mediaCount.
- Pagina pubblica /previsit/[formId]: sezione "Foto o video (opzionale)" con progress bar per chunk, lista allegati, rimozione. QuestionariPreVisita.js: dialog Dettagli con risposte complete, allegati apribili via blob fetch autenticato, pulsante "Segna come Revisionato" (i 2 bottoni prima senza onClick ora funzionano), badge allegati.
- NUOVO cron minor-care.js (4 automazioni): weightAlert (variazione >=10% ultime 2 weightHistory, flag weightAlertFor), dentalHygiene (pet >=3 anni senza dentale 12 mesi, flag dentalReminderSentAt, cap 30/run), referralProgram (>=2 visite completate + cliente 60gg, flag referralInviteSent una tantum), griefFollowup (deceased 28-60gg, flag griefFollowupSent, >60gg marca senza inviare). Tutte le 64 chiavi settings ora hanno implementazione reale.
- TEST: backend PASS completo (upload multi-chunk integro byte-per-byte, sicurezza 401, limiti 400, blocco post-invio, cron errors=0 con weightAlert/griefFollowup verificati E2E, cleanup ok).
- CONTENUTI AGGIORNATI: homepage FullLandingPage (aree 2-3, FAQ task manager reale, nuova FAQ questionari foto/video), tutorial PDF tutorial-content.js (clinic: automazioni reali + sezioni Task Manager e Questionari/Consensi + FAQ + checklist; owner: sezioni pre-visita foto/video e consensi; lab: sollecito referto 48h), tutorial inline (Clinic/Owner/LabTutorialInline stessi contenuti), brochure /presentazione (40->60 automazioni, aree, card task manager/consensi, pagina automazioni con voci reali, automazioni avanzate).
- RIMANENTI: (completati nel round 8)

## Fix test storici + refactoring login/page.js (giugno 2025 - round 8)
- FIX alias mancanti (i 2 test storici falliti del run 30/33): GET /api/rewards (clinic: {types, assigned}; owner: {rewards}; 401 no auth) e GET /api/settings (clinic: profilo + automationSettings 51 chiavi; 401 no auth/owner). Implementati in modules/rewards.js e modules/settings.js.
- FIX CRITICO AuthForm.js: DialogHeader/DialogTitle/DialogDescription usati SENZA import (ReferenceError runtime) -> sostituiti con elementi nativi. Era la causa radice del login modal che bloccava i test Playwright.
- NUOVA pagina /app/app/login/page.js: riusa AuthForm, se gia' loggato redirect a /, dopo login window.location.href='/'. Pulsanti "Accedi" della landing (desktop+mobile) puntano a /login. Il modal della landing resta per i CTA di registrazione (verificato funzionante).
- REFACTORING page.js: 484 -> 158 righe. ClinicDashboard estratto in /app/app/components/clinic/ClinicDashboardLayout.js (dynamic imports moduli clinici inclusi). Rimosso PetAvatar morto e import inutilizzati.
- TEST: 25/25 backend PASS (alias + regressione completa rewards/settings/services + smoke generale + / e /login 200). E2E Playwright VERIFICATO: landing -> Accedi -> /login -> submit -> dashboard clinica carica. IL BLOCCO STORICO DEI TEST UI E' RISOLTO.
- NOTA: il testing agent frontend ora puo' usare la pagina /login (niente piu' workaround localStorage).

## Test UI frontend completo (giugno 2025 - round 8b) - PRIMO RUN COMPLETO IN ASSOLUTO
- Eseguito il primo test UI sistematico (prima impossibile per il bug del login modal): 22/32 Playwright + 4 verifiche manuali screenshot = TUTTI i moduli verificati funzionanti.
- Login flow /login: OK per tutti e 3 i ruoli (clinica, proprietario, lab) + logout.
- Moduli recenti: Task Manager, Questionari Pre-Visita, Stock Vaccini, Consensi Digitali, Automazioni → 5/5 OK.
- Navigazione clinica: 18/18 moduli caricano senza errori JS ne' pagine bianche (i 4 "timeout" Playwright erano scrolling della sidebar, verificati OK via screenshot: Autopilot, Analisi Lab, Premi Fedelta', Impostazioni REV).
- Owner dashboard ("I miei animali") e Lab dashboard: OK.
- NESSUN BUG CRITICO TROVATO. Zero errori console, zero pagine bianche.
- BACKLOG residuo noto: variabile NEXT_PUBLIC_COMING_SOON=true da rimuovere manualmente dall'ambiente Vercel di produzione (www.vetbuddy.it mostra Coming Soon).


## 🆕 Riposizionamento Ecosistema (Giugno 2026)

### Nuovo Posizionamento
VetBuddy non è solo una piattaforma per cliniche veterinarie: è **l'ecosistema operativo che collega cliniche, proprietari e laboratori**, riducendo telefonate, documenti dispersi, referti manuali, no-show e clienti persi.

**Formula sintetica:** "Tre attori, un solo ecosistema"
**Formula commerciale:** "VetBuddy non sostituisce il gestionale della clinica. Lo potenzia con uno strato operativo intelligente."

### VetBuddy Connect (NUOVO MODULO)
Modulo unificato per gli inviti reciproci tra cliniche, proprietari e laboratori.

**Endpoints:**
- `POST /api/connect/invite` — Universale con type (owner_to_clinic, clinic_to_owner, clinic_to_lab, lab_to_clinic)
- `POST /api/connect/bulk-invite` — Invio massivo (max 200 destinatari)
- `GET /api/connect/invitations` — Lista sent+received per utente
- `GET /api/connect/invite/:token` — Verifica invito (pubblico)
- `POST /api/connect/accept` — Accettazione invito
- `POST /api/connect/revoke` — Revoca invito mittente
- `POST /api/connect/resend` — Re-send + estende scadenza 7gg
- `POST /api/connect/claim` — Rivendica profilo provvisorio
- `GET /api/connect/stats` — KPI rete per dashboard
- `GET /api/connect/completion-score` — Punteggio completamento ecosistema (per ruolo)

**Collection MongoDB:**
- `invitations` — Tracking inviti (token, type, status, expiresAt)
- `provisional_profiles` — Profili provvisori (SOLO INTERNI, public:false)
- `clinic_lab_connections` — Connessioni clinic↔lab attive

**UI:**
- `VetBuddyConnect.js` — Dashboard inviti unificata (riusabile in 3 ruoli)
- `ConnectStatusCard.js` — Card KPI + punteggio + checklist (entry dashboard)
- `/connect/accept/[token]/page.js` — Pagina pubblica accettazione

### Prezzi Piani (AGGIORNATI)
- **Starter €29/mese** — 14gg trial — Freelance e micro-cliniche
- **Growth €69/mese** — 14gg trial — Consigliato per cliniche piccole/medie (NUOVO PIANO)
- **Pro €99/mese** — 90gg Pilot — Cliniche strutturate con automazioni avanzate
- **Laboratorio Partner €39/mese** — 180gg Pilot — Laboratori partner
- **Enterprise** — Gruppi multi-sede

**Proprietari**: Gratis per sempre.

### Logica Prova Gratuita
- Cliniche: Prova gratuita 14gg self-service (Starter/Growth) + Pilot 90gg strutturato (Pro)
- Laboratori: Pilot gratuito 6 mesi
- Proprietari: Sempre gratis

### Onboarding Wizard (NUOVO)
WelcomeScreen.js rifatto con step-per-ruolo:
- **Clinica** (7 step): profilo, servizi, QR, inviti, lab, automazioni, valore
- **Proprietario** (7 step): profilo, animale, Passport, invita clinica, prenota, promemoria, pet sitter
- **Laboratorio** (7 step): profilo, listino, ritiro, inviti cliniche, richieste, referti, monitoraggio

### Homepage Aggiornata
- Hero: "Più prenotazioni. Meno telefonate. Tutto il tuo ecosistema veterinario collegato."
- 4 CTA: Prova gratis / Pilot 90gg / Invita la tua clinica / Diventa lab partner
- Sezione "Tre attori, un solo ecosistema" con 3 card colorate
- Visualizzazione "Chi invita chi" (4 direzioni)
- FAQ compattata: 8 top + toggle "Mostra tutte le 30+ domande"

### Brochure A4 Aggiornata (/presentazione)
- "Tre attori, un solo ecosistema" (sostituisce "Due ecosistemi")
- 3 card colorate (Cliniche/Proprietari/Laboratori) con prezzi
- Sezione "VetBuddy Connect - Chi invita chi" con 4 direzioni
- Titolo prezzi: "Prova gratis. Poi scegli il piano più adatto."
- CSS @media print fix con padding 12mm + h1/h2/h3 sizing per A4

### Privacy & Permessi
- ✅ Proprietario vede solo i propri animali
- ✅ Clinica vede solo propri clienti
- ✅ Lab vede solo proprie richieste
- ✅ Profili provvisori: SOLO INTERNI (public:false) → no privacy/SEO risks
- ✅ Token invito JWT monouso scadenza 7gg
- ✅ Revoca invito disponibile

