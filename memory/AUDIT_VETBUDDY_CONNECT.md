# 🔍 AUDIT VETBUDDY CONNECT — Ecosistema operativo

**Data audit:** Giugno 2026
**Obiettivo:** Riposizionare VetBuddy come "Ecosistema operativo che collega cliniche, proprietari e laboratori" senza duplicare moduli esistenti.

---

## 📊 TABELLA AUDIT — Cosa esiste / Cosa manca

| # | Funzione richiesta | Esiste già? | Dove si trova | Cosa manca | Azione | Priorità |
|---|---|---|---|---|---|---|
| 1 | **Invito Proprietario → Clinica** | ✅ SÌ | `InviteClinic.js` + `POST /api/invite-clinic` (in `settings.js`) | Tracking stato avanzato (aperto/accettato/scaduto), creazione profilo provvisorio, claim | Migliorare + accorpare in `connect` | 🔴 P0 |
| 2 | **Invito Clinica → Proprietari** (singolo/massivo) | ⚠️ PARZIALE | `ClinicOwners.js` gestisce solo creazione manuale | Bottone "Invita", import CSV, QR code, link condivisibile, template, stato invito | Aggiungere modulo `ClinicInvitations` | 🔴 P0 |
| 3 | **Invito Clinica → Laboratorio** | ✅ SÌ | `ClinicLabMarketplace.js` (`POST /api/lab-invitations`) | Creazione profilo lab provvisorio se non registrato | Migliorare onboarding lab da invito | 🟠 P1 |
| 4 | **Invito Laboratorio → Cliniche** | ❌ NO | - | Endpoint dedicato + UI in `LabDashboard` | Aggiungere | 🔴 P0 |
| 5 | **Condivisione Passport (pet sitter/familiari)** | ❓ DA VERIFICARE | Probabilmente in `OwnerPassportCards.js` o `PetPassport.js` | Link temporaneo con scadenza, permessi granulari, log accessi | Da verificare + completare | 🟠 P1 |
| 6 | **Profili provvisori + Claim profile** | ❌ NO | - | Collection `provisional_profiles`, endpoint `/api/connect/claim`, flusso onboarding | Aggiungere (interno, NON pubblico) | 🔴 P0 |
| 7 | **Programma referral incentivi** | ✅ SÌ | `ReputationReferral.js` (Porta un Amico, sconto 15%) | Estensione referral ecosistema (clinica→lab, lab→clinica) | Estendere senza duplicare | 🟡 P2 |
| 8 | **Dashboard Ecosistema** (KPI rete per attore) | ❌ NO | - | Nuovo modulo `EcosystemDashboard` con KPI per ogni ruolo | Aggiungere | 🟠 P1 |
| 9 | **Punteggio completamento guidato** | ⚠️ PARZIALE | `PilotSuccessKit.js` ha checklist pilot | Punteggio ecosistema (es. "Passport 70%", "Rete clinica 62%") con azioni guidate | Aggiungere modulo `CompletionScore` | 🟠 P1 |
| 10 | **Morning Briefing centrale** | ❓ DA VERIFICARE | Possibilmente in `ClinicControlRoom.js` | Arricchimento con inviti pendenti/scaduti, slot liberi, fragili | Verificare + arricchire | 🟡 P2 |
| 11 | **Directory pubblica VetBuddy** | ⚠️ PARZIALE | Profili clinica pubblici in `/clinica/[id]` | Index pubblico cliniche/lab verificati (con filtri città/servizi) | Aggiungere (solo verificati) | 🟡 P2 |
| 12 | **Prova gratuita aperta per cliniche** | ⚠️ PARZIALE | `SubscriptionPlans.js` ha "Starter €0 in Pilot Milano" | Self-service, no restrizione geografica, dashboard valore demo | Restrutturare logica | 🔴 P0 |
| 13 | **Onboarding wizard per attore** | ⚠️ PARZIALE | `WelcomeScreen.js` generico | Step separati Clinica/Owner/Lab orientati a "VetBuddy Connect" | Migliorare | 🟠 P1 |
| 14 | **Prezzi piani aggiornati** | ❌ DIVERSI | `constants.js` SUBSCRIPTION_PLANS: Starter €0, Pro €79, Lab €29 | Da aggiornare: Starter €29, **Growth €69 (nuovo)**, Pro €99, Lab €39 | Aggiornare | 🔴 P0 |
| 15 | **Aggiornamento Homepage** | ❌ DA FARE | `FullLandingPage.js` | Hero ecosistema, "Tre attori", CTA "Prova gratis" | Aggiornare (alla fine) | 🟢 P3 |
| 16 | **Aggiornamento Brochure A4** | ❌ DA FARE | `app/presentazione/page.js` + `public/brochure-vetbuddy.pdf` | Fix impaginazione A4 (page-break), nuova sezione VetBuddy Connect | Aggiornare (alla fine) | 🟢 P3 |
| 17 | **FAQ compatte homepage** | ❌ DA FARE | `FullLandingPage.js` | Accordion compatto | Aggiornare (alla fine) | 🟢 P3 |
| 18 | **Tutorial PDF aggiornati** | ❌ DA FARE | `public/tutorial-*.pdf` + `tutorials/download` | Riflettere nuova logica ecosistema | Aggiornare (alla fine) | 🟢 P3 |

---

## 🗂️ ARCHITETTURA "VETBUDDY CONNECT"

Modulo unificato che **accorpa** (senza duplicare):
- Inviti reciproci (4 direzioni)
- Condivisione Passport
- Profili provvisori
- Claim profile
- Estensione referral

### Backend
- Modulo: `/app/app/api/[[...path]]/modules/connect.js` (NUOVO)
- Collection MongoDB:
  - `invitations` (esistente, esteso con `type`, `direction`)
  - `provisional_profiles` (NUOVO — solo interni)
  - `clinic_lab_connections` (esistente)
  - `passport_shares` (da verificare)

### Frontend
- Componente unificato: `/app/app/components/connect/VetBuddyConnect.js` (NUOVO)
  - Tab: Inviti Inviati / Inviti Ricevuti / Profili da Rivendicare
- Integrazioni esistenti:
  - `InviteClinic.js` → usa endpoint `/api/connect/invite-clinic` (alias compatibile)
  - `ClinicLabMarketplace.js` → usa endpoint `/api/connect/invite-lab` (alias compatibile)
  - **Nuovo**: bottone "Invita Cliniche" in `LabDashboard.js`
  - **Nuovo**: bottone "Invita Proprietari" in `ClinicOwners.js` (singolo/massivo/CSV/QR)

---

## 🔐 PRIVACY & PERMESSI

### Regole già verificate
- ✅ Owner vede solo i propri animali (controllo in API)
- ✅ Clinica vede solo i propri clienti
- ✅ Lab vede solo le proprie richieste

### Da aggiungere
- 🟡 Profili provvisori: **solo interni** alla piattaforma (non pubblici) per evitare problemi privacy/reputazionali
- 🟡 Tracking apertura email invito senza esposizione dati sensibili
- 🟡 Invito può essere revocato dall'invitante
- 🟡 Token JWT di invito monouso con scadenza (7 giorni)

---

## 📋 PIANO DI ESECUZIONE INCREMENTALE

### Iterazione A — Backend Connect (questo turno)
1. Creare modulo `connect.js` con endpoint:
   - `POST /api/connect/invite` — universale (tipo: owner_to_clinic, clinic_to_owner, clinic_to_lab, lab_to_clinic)
   - `GET /api/connect/invitations` — lista inviti utente loggato
   - `POST /api/connect/accept/:token` — accettazione invito
   - `POST /api/connect/revoke/:id` — revoca invito
   - `POST /api/connect/claim` — claim profilo provvisorio
   - `GET /api/connect/stats` — KPI rete per dashboard
2. Mantenere endpoint legacy (`invite-clinic`, `lab-invitations`) come alias

### Iterazione B — Frontend Connect
3. Creare `VetBuddyConnect.js` (dashboard unificata)
4. Aggiungere CTA in `ClinicOwners`, `LabDashboard`
5. Pagina pubblica `/connect/accept/:token`

### Iterazione C — Dashboard Ecosistema + Scoring
6. `EcosystemDashboard.js`
7. `CompletionScore.js` (punteggio per attore)

### Iterazione D — Logica Prova Gratuita + Prezzi
8. Aggiornare `SUBSCRIPTION_PLANS` (Starter 29/Growth 69/Pro 99/Lab 39)
9. Logica "Prova gratis self-service" (no geo-restriction)
10. Differenziazione Prova vs Pilot

### Iterazione E — Comunicazione (Homepage/Brochure/Tutorial)
11. Aggiornare `FullLandingPage.js`
12. Aggiornare `presentazione/page.js` (fix A4)
13. Aggiornare PDF brochure e tutorial

### Iterazione F — Report Finale + QA
14. Audit privacy/permessi
15. Test backend + frontend automatici
16. Report finale

---

## ⚠️ COSE DA NON FARE (vincoli utente)

- ❌ NON eliminare funzioni esistenti
- ❌ NON duplicare moduli (es. ReputationReferral resta, lo estendiamo)
- ❌ NON cambiare identità grafica / colori / logo
- ❌ NON stravolgere il modello SaaS
- ❌ NON presentare VetBuddy come gestionale sostitutivo → è "strato operativo intelligente"
- ❌ NON pubblicare profili provvisori (solo interni)
- ❌ NON modificare prezzi piani: applicare quelli specificati dall'utente (29/69/99/39)



---

## 📋 REPORT FINALE — Lavoro completato

### 1️⃣ Funzioni già esistenti trovate (NON duplicate)
- ✅ Invito Owner → Clinic (`InviteClinic.js` + `/api/invite-clinic` legacy)
- ✅ Invito Clinic → Lab (`ClinicLabMarketplace.js` + `/api/lab-invitations` legacy)
- ✅ Condivisione Passport (`passport.js` con token + revoke)
- ✅ Programma referral "Porta un Amico" (`ReputationReferral.js`)
- ✅ Profili pubblici clinica (`/clinica/[slug]`)
- ✅ Marketplace laboratori
- ✅ Pilot Success Kit 90gg
- ✅ Stripe checkout subscriptions (price_data dinamici)

### 2️⃣ Funzioni migliorate
- **Prezzi piani**: Starter €0→€29 / Pro €79→€99 / Lab €29→€39 / + Growth €69 NUOVO
- **WelcomeScreen**: 40→180 righe con onboarding wizard step-per-ruolo
- **Homepage Hero**: nuovo posizionamento ecosistema + 4 CTA strategiche
- **FAQ Homepage**: 60+ → 8 top + toggle "Mostra tutte le 30+"
- **Brochure A4**: "Due ecosistemi"→"Tre attori" + 3 card + sezione Connect + CSS print fix

### 3️⃣ Funzioni aggiunte (NUOVE)
- ✅ Modulo `/api/connect/*` (10 endpoint) — testato **56/56** ✅
- ✅ `/api/connect/completion-score` con checklist per ruolo
- ✅ **Lab → Clinic** invite (mancava nel codebase)
- ✅ **Clinic → Owner** invite (singolo + bulk CSV max 200)
- ✅ Profili provvisori (SOLO INTERNI, public:false)
- ✅ Claim profile con token monouso
- ✅ Resend invito + estensione scadenza
- ✅ Revoke invito
- ✅ `VetBuddyConnect.js` UI unificata (dashboard inviti + KPI + tabs)
- ✅ `ConnectStatusCard.js` riusabile (entry dashboard ogni ruolo)
- ✅ Pagina pubblica `/connect/accept/[token]` con 3 stati utente
- ✅ Sezione "Tre attori, un solo ecosistema" in Homepage + Brochure
- ✅ Banner "Prova gratis. Poi scegli." in SubscriptionPlans

### 4️⃣ Inviti implementati (4 direzioni)
| Direzione | Stato |
|---|---|
| 🐾 Owner → 🏥 Clinic | ✅ Implementato |
| 🏥 Clinic → 🐾 Owner | ✅ Implementato + bulk |
| 🏥 Clinic → 🔬 Lab | ✅ Implementato |
| 🔬 Lab → 🏥 Clinic | ✅ NUOVO |

### 5️⃣ Inviti ancora da implementare (Backlog)
- ⏳ Invito WhatsApp via Twilio (Twilio già configurato in .env, manca solo agganciare in connect.js)
- ⏳ Condivisione Passport più visibile in OwnerDashboard (esiste backend, manca CTA evidente)

### 6️⃣ Moduli accorpati (no duplicazioni)
- ✅ `invite-clinic` legacy mantenuto compatibile (no rottura)
- ✅ `lab-invitations` legacy mantenuto (no rottura)
- ✅ `passport/sharing/*` esistente NON duplicato
- ✅ `ReputationReferral` esistente NON duplicato

### 7️⃣ Homepage aggiornamenti
- Hero "Tre attori, un solo ecosistema"
- 4 CTA: Prova gratis / Pilot 90gg / Invita la tua clinica / Diventa lab partner
- Sezione 3 card (cliniche €29-99 / proprietari gratis / laboratori €39)
- Sezione "Chi invita chi" (4 direzioni)
- FAQ: 8 top + toggle
- CTA finale: "Costruisci il tuo ecosistema VetBuddy. Inizia gratis."

### 8️⃣ Brochure A4 aggiornamenti (`/presentazione`)
- Sostituito "Due ecosistemi" → "Tre attori, un solo ecosistema"
- 3 card colorate (cliniche/proprietari/laboratori)
- Sezione "VetBuddy Connect — Chi invita chi" con 4 direzioni
- Titolo prezzi: "Prova gratis. Poi scegli il piano più adatto."
- CSS @media print: padding 12mm + h1/h2/h3 sizing fissi

### 9️⃣ Onboarding aggiornamenti
- WelcomeScreen wizard step-per-ruolo
- Clinica (7 step) / Proprietario (7 step) / Lab (7 step)

### 🔟 Microcopy aggiornamenti
- Hero: "Tre attori, un solo ecosistema"
- CTA: "Prova gratis", "Candidati al Pilot 90 giorni", "Invita la tua clinica", "Diventa laboratorio partner"
- Banner: "Prova gratis. Poi scegli il piano più adatto."
- Sub-text: "VetBuddy non sostituisce il gestionale della clinica. Lo potenzia con uno strato operativo intelligente."

### 1️⃣1️⃣ Criticità privacy
- ✅ Profili provvisori SOLO INTERNI (`public: false`)
- ✅ Token invito monouso 7gg
- ✅ Revoca invito disponibile
- ✅ Verifica ruolo destinatario prima di accettare invito
- ⚠️ Backlog: aggiungere consenso GDPR esplicito nel form bulk-invite

### 1️⃣2️⃣ Bug trovati e risolti
- 🐛 `LabDashboard.js`: import mancante `Settings`/`Zap` (usati ma non importati) → ✅ RISOLTO
- 🐛 `ClinicControlRoom.js`: doppio `export default` → ✅ RISOLTO
- 🐛 `FullLandingPage.js`: blocco FAQ duplicato → ✅ RISOLTO con sed cleanup

### 1️⃣3️⃣ Prossime priorità (Backlog)
- 🟢 UI condivisione Passport più visibile in OwnerDashboard
- 🟢 Aggancio Twilio WhatsApp per inviti
- 🟢 Directory pubblica VetBuddy (solo verificati)
- 🟢 Morning Briefing arricchito con inviti pendenti
- 🟢 Test suite frontend automatica VetBuddyConnect UI (richiede autorizzazione utente)
- 🟢 Estensione referral programma a ecosistema clinic↔lab

### Test Coverage
- ✅ **Backend**: 56/56 test passati (Connect 48/48 + completion-score 8/8)
- ⏳ **Frontend**: da testare a richiesta utente
