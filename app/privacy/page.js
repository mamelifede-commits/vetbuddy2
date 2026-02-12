import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - VetBuddy',
  description: 'Informativa sulla privacy di VetBuddy. Come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali.',
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Ultimo aggiornamento: Febbraio 2025</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Titolare del Trattamento</h2>
            <p className="text-gray-600 mb-4">
              Il Titolare del trattamento dei dati personali è VetBuddy (di seguito "Titolare"), 
              con sede in Italia. Per qualsiasi informazione relativa al trattamento dei dati personali, 
              è possibile contattarci all'indirizzo email: <a href="mailto:privacy@vetbuddy.it" className="text-coral-500">privacy@vetbuddy.it</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Dati Raccolti</h2>
            <p className="text-gray-600 mb-4">VetBuddy raccoglie le seguenti categorie di dati personali:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Dati di registrazione:</strong> nome, cognome, indirizzo email, numero di telefono, indirizzo della clinica (per utenti clinica)</li>
              <li><strong>Dati degli animali:</strong> nome, specie, razza, data di nascita, informazioni mediche</li>
              <li><strong>Dati di utilizzo:</strong> log di accesso, preferenze, interazioni con la piattaforma</li>
              <li><strong>Dati di pagamento:</strong> gestiti tramite Stripe, non memorizziamo dati delle carte di credito</li>
              <li><strong>Documenti caricati:</strong> referti, prescrizioni e altri documenti veterinari</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Finalità del Trattamento</h2>
            <p className="text-gray-600 mb-4">I dati personali sono trattati per le seguenti finalità:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Erogazione dei servizi della piattaforma VetBuddy</li>
              <li>Gestione degli appuntamenti tra cliniche e proprietari</li>
              <li>Invio di comunicazioni relative al servizio (conferme, promemoria)</li>
              <li>Gestione dei pagamenti e fatturazione</li>
              <li>Miglioramento dei servizi e analisi statistiche anonime</li>
              <li>Adempimento di obblighi legali e fiscali</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Base Giuridica</h2>
            <p className="text-gray-600 mb-4">Il trattamento dei dati personali si basa su:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Esecuzione del contratto:</strong> per l'erogazione dei servizi richiesti</li>
              <li><strong>Consenso:</strong> per l'invio di comunicazioni di marketing (se fornito)</li>
              <li><strong>Obbligo legale:</strong> per adempiere a obblighi di legge</li>
              <li><strong>Legittimo interesse:</strong> per migliorare i servizi e prevenire frodi</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Condivisione dei Dati</h2>
            <p className="text-gray-600 mb-4">I dati possono essere condivisi con:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Cliniche veterinarie:</strong> per la gestione degli appuntamenti e delle cure (solo i dati necessari)</li>
              <li><strong>Fornitori di servizi:</strong> hosting (Vercel), database (MongoDB Atlas), pagamenti (Stripe), email (Resend)</li>
              <li><strong>Autorità competenti:</strong> quando richiesto dalla legge</li>
            </ul>
            <p className="text-gray-600 mt-4">Non vendiamo né affittiamo i tuoi dati personali a terzi.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Conservazione dei Dati</h2>
            <p className="text-gray-600 mb-4">
              I dati personali sono conservati per il tempo necessario alle finalità per cui sono stati raccolti:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Dati dell'account: fino alla cancellazione dell'account + 30 giorni</li>
              <li>Dati di fatturazione: 10 anni (obbligo fiscale)</li>
              <li>Documenti veterinari: secondo le indicazioni della clinica e la normativa vigente</li>
              <li>Log di sistema: 12 mesi</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Diritti dell'Interessato</h2>
            <p className="text-gray-600 mb-4">Ai sensi del GDPR (Regolamento UE 2016/679), hai diritto di:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Accesso:</strong> ottenere conferma del trattamento e copia dei dati</li>
              <li><strong>Rettifica:</strong> correggere dati inesatti o incompleti</li>
              <li><strong>Cancellazione:</strong> richiedere la cancellazione dei dati ("diritto all'oblio")</li>
              <li><strong>Limitazione:</strong> limitare il trattamento in determinati casi</li>
              <li><strong>Portabilità:</strong> ricevere i dati in formato strutturato</li>
              <li><strong>Opposizione:</strong> opporti al trattamento per motivi legittimi</li>
              <li><strong>Revoca del consenso:</strong> revocare il consenso in qualsiasi momento</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Per esercitare questi diritti, contattaci a: <a href="mailto:privacy@vetbuddy.it" className="text-coral-500">privacy@vetbuddy.it</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Sicurezza</h2>
            <p className="text-gray-600 mb-4">
              Adottiamo misure di sicurezza tecniche e organizzative per proteggere i dati personali:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Crittografia SSL/TLS per tutte le comunicazioni</li>
              <li>Accesso ai dati limitato al personale autorizzato</li>
              <li>Backup regolari e crittografati</li>
              <li>Monitoraggio continuo della sicurezza</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Cookie</h2>
            <p className="text-gray-600 mb-4">
              VetBuddy utilizza cookie tecnici necessari per il funzionamento della piattaforma. 
              Non utilizziamo cookie di profilazione o di terze parti per finalità pubblicitarie.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Modifiche alla Privacy Policy</h2>
            <p className="text-gray-600 mb-4">
              Ci riserviamo il diritto di modificare questa Privacy Policy. Le modifiche saranno 
              pubblicate su questa pagina con indicazione della data di aggiornamento. 
              Ti invitiamo a consultare periodicamente questa pagina.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contatti e Reclami</h2>
            <p className="text-gray-600 mb-4">
              Per qualsiasi domanda sulla presente Privacy Policy o sul trattamento dei tuoi dati:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Email: <a href="mailto:privacy@vetbuddy.it" className="text-coral-500">privacy@vetbuddy.it</a></li>
            </ul>
            <p className="text-gray-600 mt-4">
              Hai inoltre il diritto di presentare un reclamo all'Autorità Garante per la Protezione 
              dei Dati Personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener" className="text-coral-500">www.garanteprivacy.it</a>).
            </p>
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
