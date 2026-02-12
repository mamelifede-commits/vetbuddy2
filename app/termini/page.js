import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Termini e Condizioni - VetBuddy',
  description: 'Termini e condizioni di utilizzo della piattaforma VetBuddy per cliniche veterinarie e proprietari di animali.',
};

export default function TerminiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-coral-500 transition">
            <ArrowLeft className="h-5 w-5" />
            <span>Torna alla home</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Termini e Condizioni</h1>
        <p className="text-gray-500 mb-8">Ultimo aggiornamento: Febbraio 2025</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Accettazione dei Termini</h2>
            <p className="text-gray-600 mb-4">
              Utilizzando la piattaforma VetBuddy ("Servizio"), accetti di essere vincolato dai presenti 
              Termini e Condizioni. Se non accetti questi termini, ti preghiamo di non utilizzare il Servizio.
            </p>
            <p className="text-gray-600">
              VetBuddy si riserva il diritto di modificare questi termini in qualsiasi momento. 
              Le modifiche saranno efficaci dalla pubblicazione sul sito.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Descrizione del Servizio</h2>
            <p className="text-gray-600 mb-4">
              VetBuddy è una piattaforma digitale che connette cliniche veterinarie e proprietari di animali, 
              offrendo funzionalità di:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Gestione appuntamenti e prenotazioni</li>
              <li>Comunicazione tra cliniche e clienti</li>
              <li>Archiviazione e condivisione di documenti veterinari</li>
              <li>Gestione della cartella clinica degli animali</li>
              <li>Pagamenti online (tramite Stripe)</li>
              <li>Reportistica e analytics per le cliniche</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Registrazione e Account</h2>
            <h3 className="text-lg font-medium text-gray-800 mb-2">3.1 Requisiti</h3>
            <p className="text-gray-600 mb-4">
              Per utilizzare VetBuddy devi avere almeno 18 anni e fornire informazioni accurate e complete 
              durante la registrazione.
            </p>
            <h3 className="text-lg font-medium text-gray-800 mb-2">3.2 Sicurezza dell'Account</h3>
            <p className="text-gray-600 mb-4">
              Sei responsabile della sicurezza del tuo account e della password. VetBuddy non sarà 
              responsabile per perdite derivanti dall'uso non autorizzato del tuo account.
            </p>
            <h3 className="text-lg font-medium text-gray-800 mb-2">3.3 Account Clinica</h3>
            <p className="text-gray-600">
              Le cliniche veterinarie devono essere regolarmente autorizzate all'esercizio della 
              professione veterinaria secondo la normativa italiana vigente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Programma Pilot Milano</h2>
            <p className="text-gray-600 mb-4">
              Il Programma Pilot è un'iniziativa a numero limitato riservata a cliniche selezionate 
              nell'area di Milano e provincia.
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>L'accesso al Pilot è su invito e a discrezione di VetBuddy</li>
              <li>Il periodo gratuito (90 giorni, estendibile a 6 mesi) è soggetto a partecipazione attiva</li>
              <li>VetBuddy si riserva il diritto di modificare o terminare il Pilot in qualsiasi momento</li>
              <li>Al termine del Pilot, si applicheranno le tariffe standard pubblicate</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Piani e Pagamenti</h2>
            <h3 className="text-lg font-medium text-gray-800 mb-2">5.1 Piani Disponibili</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li><strong>Starter:</strong> Piano gratuito con funzionalità limitate (solo Pilot)</li>
              <li><strong>Pro:</strong> €129/mese + IVA - Tutte le funzionalità</li>
              <li><strong>Enterprise:</strong> Prezzo personalizzato per gruppi e catene</li>
            </ul>
            <h3 className="text-lg font-medium text-gray-800 mb-2">5.2 Fatturazione</h3>
            <p className="text-gray-600 mb-4">
              I pagamenti sono gestiti tramite Stripe. Gli abbonamenti si rinnovano automaticamente 
              alla scadenza, salvo disdetta. Tutti i prezzi sono IVA esclusa (22%).
            </p>
            <h3 className="text-lg font-medium text-gray-800 mb-2">5.3 Rimborsi</h3>
            <p className="text-gray-600">
              Gli abbonamenti possono essere cancellati in qualsiasi momento. Non sono previsti 
              rimborsi per periodi parziali già fatturati.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Uso Accettabile</h2>
            <p className="text-gray-600 mb-4">Nell'utilizzare VetBuddy, accetti di NON:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Violare leggi o regolamenti applicabili</li>
              <li>Caricare contenuti illegali, diffamatori o offensivi</li>
              <li>Tentare di accedere a dati di altri utenti senza autorizzazione</li>
              <li>Utilizzare il servizio per spam o comunicazioni non richieste</li>
              <li>Interferire con il funzionamento della piattaforma</li>
              <li>Rivendere o sublicenziare l'accesso al servizio</li>
              <li>Utilizzare bot o sistemi automatizzati non autorizzati</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contenuti degli Utenti</h2>
            <h3 className="text-lg font-medium text-gray-800 mb-2">7.1 Proprietà</h3>
            <p className="text-gray-600 mb-4">
              Mantieni la proprietà dei contenuti che carichi su VetBuddy (documenti, immagini, dati). 
              Concedi a VetBuddy una licenza limitata per ospitare, mostrare e trasmettere tali contenuti 
              ai fini dell'erogazione del servizio.
            </p>
            <h3 className="text-lg font-medium text-gray-800 mb-2">7.2 Responsabilità</h3>
            <p className="text-gray-600">
              Sei responsabile dei contenuti che carichi e garantisci di avere i diritti necessari 
              per condividerli.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Proprietà Intellettuale</h2>
            <p className="text-gray-600 mb-4">
              VetBuddy e tutti i contenuti, funzionalità e design della piattaforma sono di proprietà 
              esclusiva di VetBuddy e sono protetti dalle leggi sulla proprietà intellettuale.
            </p>
            <p className="text-gray-600">
              Il marchio "VetBuddy", il logo e altri elementi distintivi non possono essere utilizzati 
              senza autorizzazione scritta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitazione di Responsabilità</h2>
            <p className="text-gray-600 mb-4">
              VetBuddy fornisce il servizio "così com'è" senza garanzie di alcun tipo. 
              Non garantiamo che il servizio sia sempre disponibile o privo di errori.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>VetBuddy non è responsabile per:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Decisioni mediche o veterinarie prese sulla base delle informazioni presenti nella piattaforma</li>
              <li>Perdita di dati dovuta a cause al di fuori del nostro controllo</li>
              <li>Danni indiretti, incidentali o consequenziali</li>
              <li>Interruzioni del servizio dovute a manutenzione o cause di forza maggiore</li>
            </ul>
            <p className="text-gray-600 mt-4">
              La responsabilità massima di VetBuddy è limitata all'importo pagato dall'utente 
              nei 12 mesi precedenti l'evento.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Indennizzo</h2>
            <p className="text-gray-600">
              Accetti di indennizzare e manlevare VetBuddy da qualsiasi reclamo, danno o spesa 
              derivante dalla tua violazione di questi termini o dall'uso improprio del servizio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Sospensione e Terminazione</h2>
            <p className="text-gray-600 mb-4">
              VetBuddy può sospendere o terminare il tuo account in caso di:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Violazione dei presenti termini</li>
              <li>Mancato pagamento</li>
              <li>Attività sospette o fraudolente</li>
              <li>Richiesta delle autorità competenti</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Puoi cancellare il tuo account in qualsiasi momento dalle impostazioni del profilo 
              o contattando il supporto.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Disposizioni Generali</h2>
            <h3 className="text-lg font-medium text-gray-800 mb-2">12.1 Legge Applicabile</h3>
            <p className="text-gray-600 mb-4">
              I presenti termini sono regolati dalla legge italiana. Per qualsiasi controversia 
              sarà competente il Foro di Milano.
            </p>
            <h3 className="text-lg font-medium text-gray-800 mb-2">12.2 Intero Accordo</h3>
            <p className="text-gray-600 mb-4">
              Questi termini, insieme alla Privacy Policy, costituiscono l'intero accordo 
              tra te e VetBuddy.
            </p>
            <h3 className="text-lg font-medium text-gray-800 mb-2">12.3 Separabilità</h3>
            <p className="text-gray-600">
              Se una disposizione di questi termini risultasse invalida, le restanti 
              disposizioni rimarranno in vigore.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contatti</h2>
            <p className="text-gray-600 mb-4">
              Per domande sui presenti Termini e Condizioni:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Email: <a href="mailto:info@vetbuddy.it" className="text-coral-500">info@vetbuddy.it</a></li>
              <li>Supporto: <a href="mailto:support@vetbuddy.it" className="text-coral-500">support@vetbuddy.it</a></li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2025 VetBuddy. Tutti i diritti riservati.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy" className="hover:text-coral-500">Privacy Policy</Link>
            <Link href="/termini" className="hover:text-coral-500">Termini e Condizioni</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
