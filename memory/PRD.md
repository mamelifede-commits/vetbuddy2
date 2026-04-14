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

### 5. Landing Page
- Homepage con sezione Marketplace Laboratori
- Prezzi: Starter Clinica (Free), Pro Clinica (€49/mo, 90gg gratis), Lab Partner (€29/mo, 6 mesi gratis), Enterprise (Custom)
- Brochure con Lab Marketplace e prezzi aggiornati
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

## Tech Stack
- Next.js 14, Tailwind CSS, Shadcn UI, MongoDB
- Components extracted to `/app/app/components/` with `next/dynamic`
