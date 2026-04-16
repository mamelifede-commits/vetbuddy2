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
- Homepage con sezioni: Funzionalità, Automazioni, Fatturazione, **Ricette Elettroniche REV**, Premi, Lab Marketplace, Prezzi
- Prezzi: Starter Clinica (Free), Pro Clinica (€49/mo, 90gg gratis), Lab Partner (€29/mo, 6 mesi gratis), Enterprise (Custom)
- Brochure con Lab Marketplace, REV e prezzi aggiornati — PDF scaricabile a `/brochure-vetbuddy.pdf`
- Tutorial: Clinica, Proprietario, Laboratorio

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

## Tech Stack
- Next.js 14, Tailwind CSS, Shadcn UI, MongoDB
- Components extracted to `/app/app/components/` with `next/dynamic`
