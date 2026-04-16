'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/app/components/common';
import NewBrandLogo from '@/app/components/shared/NewBrandLogo';
import { getPetSpeciesInfo } from '@/app/components/shared/utils';
import api from '@/app/lib/api';
import {
  Calendar, FileText, PawPrint, Gift, Star, MessageCircle, Users, User, Inbox,
  Settings, Zap, Menu, X, LogOut, AlertCircle, Video, Receipt, BarChart3,
  Link2, ClipboardList, Stethoscope, FlaskConical, Globe, BookOpen,
  LayoutDashboard, TrendingUp, CalendarDays, FolderArchive, Pill, Shield
} from 'lucide-react';

// ==================== DYNAMIC IMPORTS ====================
// Admin & Auth
const AdminDashboard = dynamic(() => import('@/app/components/admin/AdminDashboard'), { ssr: false });
const LabDashboard = dynamic(() => import('@/app/components/lab/LabDashboard'), { ssr: false });
const StaffDashboard = dynamic(() => import('@/app/components/staff/StaffDashboard'), { ssr: false });
const WelcomeScreen = dynamic(() => import('@/app/components/onboarding/WelcomeScreen'), { ssr: false });
const ChatWidget = dynamic(() => import('@/app/components/chat/ChatWidget'), { ssr: false });
import { AuthForm, ResetPasswordScreen, VerificationScreen } from '@/app/components/auth';

// Landing
const ComingSoonLanding = dynamic(() => import('@/app/components/landing/ComingSoonLanding'), { ssr: false });
const FullLandingPage = dynamic(() => import('@/app/components/landing/FullLandingPage'), { ssr: false });

// Clinic sub-components
const ClinicControlRoom = dynamic(() => import('@/app/components/clinic/ClinicControlRoom'), { ssr: false });
const ClinicAgenda = dynamic(() => import('@/app/components/clinic/ClinicAgenda'), { ssr: false });
const ClinicInbox = dynamic(() => import('@/app/components/clinic/ClinicInbox'), { ssr: false });
const ClinicDocuments = dynamic(() => import('@/app/components/clinic/ClinicDocuments'), { ssr: false });
const ClinicServices = dynamic(() => import('@/app/components/clinic/ClinicServices'), { ssr: false });
const ClinicVideoConsult = dynamic(() => import('@/app/components/clinic/ClinicVideoConsult'), { ssr: false });
const ClinicPatients = dynamic(() => import('@/app/components/clinic/ClinicPatients'), { ssr: false });
const ClinicOwners = dynamic(() => import('@/app/components/clinic/ClinicOwners'), { ssr: false });
const ClinicStaff = dynamic(() => import('@/app/components/clinic/ClinicStaff'), { ssr: false });
const ClinicReports = dynamic(() => import('@/app/components/clinic/ClinicReports'), { ssr: false });
const ClinicReviews = dynamic(() => import('@/app/components/clinic/ClinicReviews'), { ssr: false });
const ClinicRewardsManagement = dynamic(() => import('@/app/components/clinic/ClinicRewardsManagement'), { ssr: false });
const ClinicLabAnalysis = dynamic(() => import('@/app/components/clinic/ClinicLabAnalysis'), { ssr: false });
const ClinicLabMarketplace = dynamic(() => import('@/app/components/clinic/ClinicLabMarketplace'), { ssr: false });
const ClinicInvoicing = dynamic(() => import('@/app/components/clinic/ClinicInvoicing'), { ssr: false });
const ClinicMetrics = dynamic(() => import('@/app/components/clinic/ClinicMetrics'), { ssr: false });
const ClinicBookingLink = dynamic(() => import('@/app/components/clinic/ClinicBookingLink'), { ssr: false });
const ClinicTemplates = dynamic(() => import('@/app/components/clinic/ClinicTemplates'), { ssr: false });
const ClinicAutomations = dynamic(() => import('@/app/components/clinic/ClinicAutomations'), { ssr: false });
const ClinicArchive = dynamic(() => import('@/app/components/clinic/ClinicArchive'), { ssr: false });
const ClinicEvents = dynamic(() => import('@/app/components/clinic/ClinicEvents'), { ssr: false });
const ClinicSettings = dynamic(() => import('@/app/components/clinic/ClinicSettings'), { ssr: false });
const ClinicFeedbackPage = dynamic(() => import('@/app/components/clinic/ClinicFeedbackPage'), { ssr: false });
const ClinicTutorialInline = dynamic(() => import('@/app/components/clinic/ClinicTutorialInline'), { ssr: false });
const ClinicLabInvoices = dynamic(() => import('@/app/components/clinic/ClinicLabInvoices'), { ssr: false });
const ClinicPrescriptions = dynamic(() => import('@/app/components/clinic/ClinicPrescriptions'), { ssr: false });
const ClinicREVSettings = dynamic(() => import('@/app/components/clinic/ClinicREVSettings'), { ssr: false });

// Owner Dashboard
const OwnerDashboard = dynamic(() => import('@/app/components/owner/OwnerDashboardLayout'), { ssr: false });

// ==================== PET AVATAR COMPONENT ====================
const PetAvatar = ({ pet, size = 'md', onClick, className = '' }) => {
  const sizeClasses = { sm: 'h-10 w-10', md: 'h-16 w-16', lg: 'h-24 w-24', xl: 'h-32 w-32' };
  const emojiSizes = { sm: 'text-xl', md: 'text-3xl', lg: 'text-5xl', xl: 'text-6xl' };
  const speciesInfo = getPetSpeciesInfo(pet?.species);
  const colorMap = {
    blue: 'from-blue-100 to-blue-200', purple: 'from-purple-100 to-purple-200',
    amber: 'from-amber-100 to-amber-200', green: 'from-green-100 to-green-200',
    pink: 'from-pink-100 to-pink-200', orange: 'from-orange-100 to-orange-200',
    cyan: 'from-cyan-100 to-cyan-200', emerald: 'from-emerald-100 to-emerald-200',
    gray: 'from-gray-100 to-gray-200'
  };
  
  if (pet?.photoUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>
        <img src={pet.photoUrl} alt={pet.name || 'Pet'} className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <div className={`w-full h-full bg-gradient-to-br ${colorMap[speciesInfo.color]} items-center justify-center hidden`}>
          <span className={emojiSizes[size]}>{speciesInfo.emoji}</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br ${colorMap[speciesInfo.color]} rounded-full flex items-center justify-center flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>
      <span className={emojiSizes[size]}>{speciesInfo.emoji}</span>
    </div>
  );
};

// ==================== LANDING PAGE ROUTER ====================
function LandingPage({ onLogin }) {
  const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === 'true';
  if (isComingSoon) return <ComingSoonLanding onLogin={onLogin} />;
  return (
    <>
      <FullLandingPage onLogin={onLogin} />
      <ChatWidget />
    </>
  );
}

// ==================== CLINIC DASHBOARD SHELL ====================
function ClinicDashboard({ user, onLogout, emailAction, onClearEmailAction }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [staff, setStaff] = useState([]);
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [labReportsReady, setLabReportsReady] = useState(0);
  const [setupProgress, setSetupProgress] = useState({ payments: false, video: false, team: false, automations: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPetFromOwner, setSelectedPetFromOwner] = useState(null);
  const [selectedOwnerFromPet, setSelectedOwnerFromPet] = useState(null);
  
  const handleOpenPetFromOwner = (pet) => { setSelectedPetFromOwner(pet); setActiveTab('patients'); };
  const handleOpenOwnerFromPet = (owner) => { setSelectedOwnerFromPet(owner); setActiveTab('owners'); };
  
  useEffect(() => {
    if (emailAction && emailAction.action) {
      if (emailAction.action === 'message') setActiveTab('messages');
      if (onClearEmailAction) onClearEmailAction();
    }
  }, [emailAction, onClearEmailAction]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [appts, docs, msgs, staffList, petsList, ownersList, rewardsList] = await Promise.all([
        api.get('appointments'), api.get('documents'), api.get('messages'),
        api.get('staff'), api.get('pets'), api.get('owners'),
        api.get('rewards/assigned').catch(() => [])
      ]);
      setAppointments(appts); setDocuments(docs); setMessages(msgs);
      setStaff(staffList); setPets(petsList); setOwners(ownersList);
      setRewards(rewardsList || []);
      
      const labReqs = await api.get('lab-requests').catch(() => []);
      setLabReportsReady(Array.isArray(labReqs) ? labReqs.filter(r => r.status === 'report_ready').length : 0);
      
      setSetupProgress({
        payments: false,
        video: appts.some(a => a.type === 'videoconsulto'),
        team: staffList.length > 0,
        automations: false
      });
    } catch (error) { console.error('LoadData Error:', error); }
  };

  const NavItem = ({ icon: Icon, label, value, badge }) => (
    <button onClick={() => { setActiveTab(value); setMobileMenuOpen(false); }} 
      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${activeTab === value ? 'bg-coral-100 text-coral-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
      <div className="flex items-center gap-3"><Icon className="h-5 w-5" />{label}</div>
      {badge > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">{badge}</span>}
    </button>
  );

  const unreadMessages = messages.filter(m => !m.read).length;
  const pendingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'requested').length;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', value: 'dashboard' },
    { icon: Calendar, label: 'Agenda', value: 'agenda', badge: pendingAppointments },
    { icon: Inbox, label: 'Team Inbox', value: 'inbox', badge: unreadMessages },
    { icon: FileText, label: 'Documenti', value: 'documents' },
    { icon: FolderArchive, label: 'Archivio Clinica', value: 'archive' },
    { icon: CalendarDays, label: 'Eventi', value: 'events' },
    { icon: Stethoscope, label: 'Servizi', value: 'services' },
    { icon: Video, label: 'Video Consulto', value: 'videoconsult' },
    { icon: PawPrint, label: 'Pazienti', value: 'patients' },
    { icon: FlaskConical, label: 'Analisi Lab', value: 'labanalysis', badge: labReportsReady },
    { icon: Pill, label: 'Prescrizioni REV', value: 'prescriptions' },
    { icon: Shield, label: 'Impostazioni REV', value: 'rev-settings' },
    { icon: Globe, label: 'Marketplace Lab', value: 'labmarketplace' },
    { icon: User, label: 'Proprietari', value: 'owners' },
    { icon: Users, label: 'Staff', value: 'staff' },
    { icon: Receipt, label: 'Fatturazione', value: 'invoicing' },
    { icon: TrendingUp, label: 'Report', value: 'reports' },
    { icon: BarChart3, label: 'Metriche', value: 'metrics' },
    { icon: Link2, label: 'Link Prenotazione', value: 'bookinglink' },
    { icon: Star, label: 'Recensioni', value: 'reviews' },
    { icon: Gift, label: 'Premi Fedeltà', value: 'rewards' },
    { icon: ClipboardList, label: 'Template', value: 'templates' },
    { icon: Receipt, label: 'Fatture Lab', value: 'labinvoices' },
    { icon: Zap, label: 'Automazioni', value: 'automations' },
    'divider',
    { icon: MessageCircle, label: 'Feedback', value: 'feedback' },
    { icon: Settings, label: 'Impostazioni', value: 'settings' },
    { icon: BookOpen, label: 'Tutorial', value: 'tutorial' },
  ];

  const renderNav = () => navItems.map((item, i) => 
    item === 'divider' ? <div key={i} className="border-t my-2" /> : <NavItem key={item.value} {...item} />
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <NewBrandLogo size="xs" showText={false} />
          <div>
            <h1 className="font-bold text-sm"><span className="text-gray-900">vet</span><span className="text-coral-500">buddy</span></h1>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.clinicName || 'Clinica'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-500 hover:text-red-600"><LogOut className="h-4 w-4" /></Button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-[55]" onClick={() => setMobileMenuOpen(false)} />
          <div className="md:hidden fixed left-0 right-0 top-[57px] bottom-0 bg-white z-[60] p-4 overflow-y-auto shadow-xl animate-in slide-in-from-top duration-200">
            <div className="mb-2"><RoleBadge role="clinic" /></div>
            <Badge variant="outline" className="mb-4 justify-center text-amber-600 border-amber-300 bg-amber-50 w-full"><AlertCircle className="h-3 w-3 mr-1" /> Modalità Pilot</Badge>
            <nav className="space-y-1">{renderNav()}</nav>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r p-4 flex-col flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <NewBrandLogo size="sm" showText={false} />
            <div>
              <h1 className="font-bold"><span className="text-gray-900">vet</span><span className="text-coral-500">buddy</span></h1>
              <p className="text-xs text-gray-500 truncate max-w-[100px]">{user.clinicName || 'Clinica'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-500 hover:text-red-600 hover:bg-red-50" title="Esci"><LogOut className="h-4 w-4" /></Button>
        </div>
        <div className="mb-2"><RoleBadge role="clinic" /></div>
        <Badge variant="outline" className="mb-6 justify-center text-amber-600 border-amber-300 bg-amber-50"><AlertCircle className="h-3 w-3 mr-1" /> Modalità Pilot</Badge>
        <nav className="space-y-1 flex-1 overflow-y-auto">{renderNav()}</nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {activeTab === 'dashboard' && <ClinicControlRoom appointments={appointments} documents={documents} messages={messages} owners={owners} pets={pets} rewards={rewards} setupProgress={setupProgress} onRefresh={loadData} onNavigate={setActiveTab} onOpenPet={handleOpenPetFromOwner} />}
        {activeTab === 'agenda' && <ClinicAgenda appointments={appointments} staff={staff} owners={owners} pets={pets} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'inbox' && <ClinicInbox messages={messages} owners={owners} pets={pets} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'documents' && <ClinicDocuments documents={documents} owners={owners} pets={pets} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'services' && <ClinicServices onNavigate={setActiveTab} user={user} />}
        {activeTab === 'videoconsult' && <ClinicVideoConsult user={user} onNavigate={setActiveTab} />}
        {activeTab === 'patients' && <ClinicPatients pets={pets} owners={owners} onRefresh={loadData} onNavigate={setActiveTab} onOpenOwner={handleOpenOwnerFromPet} initialPet={selectedPetFromOwner} onClearInitialPet={() => setSelectedPetFromOwner(null)} />}
        {activeTab === 'owners' && <ClinicOwners owners={owners} pets={pets} onRefresh={loadData} onNavigate={setActiveTab} onOpenPet={handleOpenPetFromOwner} initialOwner={selectedOwnerFromPet} onClearInitialOwner={() => setSelectedOwnerFromPet(null)} />}
        {activeTab === 'staff' && <ClinicStaff staff={staff} onRefresh={loadData} onNavigate={setActiveTab} />}
        {activeTab === 'reports' && <ClinicReports appointments={appointments} documents={documents} messages={messages} owners={owners} pets={pets} onNavigate={setActiveTab} onOpenOwner={handleOpenOwnerFromPet} onOpenPet={handleOpenPetFromOwner} />}
        {activeTab === 'reviews' && <ClinicReviews onNavigate={setActiveTab} />}
        {activeTab === 'rewards' && <ClinicRewardsManagement user={user} owners={owners} />}
        {activeTab === 'labanalysis' && <ClinicLabAnalysis user={user} pets={pets} owners={owners} />}
        {activeTab === 'labmarketplace' && <ClinicLabMarketplace user={user} />}
        {activeTab === 'invoicing' && <ClinicInvoicing user={user} owners={owners} pets={pets} />}
        {activeTab === 'metrics' && <ClinicMetrics user={user} onNavigate={setActiveTab} />}
        {activeTab === 'bookinglink' && <ClinicBookingLink user={user} onNavigate={setActiveTab} />}
        {activeTab === 'templates' && <ClinicTemplates owners={owners} pets={pets} staff={staff} appointments={appointments} user={user} onNavigate={setActiveTab} />}
        {activeTab === 'automations' && <ClinicAutomations user={user} onNavigate={setActiveTab} />}
        {activeTab === 'archive' && <ClinicArchive user={user} />}
        {activeTab === 'events' && <ClinicEvents user={user} />}
        {activeTab === 'settings' && <ClinicSettings user={user} onNavigate={setActiveTab} />}
        {activeTab === 'feedback' && <ClinicFeedbackPage user={user} />}
        {activeTab === 'tutorial' && <ClinicTutorialInline />}
        {activeTab === 'labinvoices' && <ClinicLabInvoices />}
        {activeTab === 'prescriptions' && <ClinicPrescriptions user={user} pets={pets} owners={owners} />}
        {activeTab === 'rev-settings' && <ClinicREVSettings user={user} onNavigate={setActiveTab} />}
      </main>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [googleOAuthResult, setGoogleOAuthResult] = useState(null);
  const [emailAction, setEmailAction] = useState(null);
  const [verificationState, setVerificationState] = useState(null);
  const [resetPasswordToken, setResetPasswordToken] = useState(null);

  useEffect(() => { 
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      const resetToken = params.get('reset');
      if (resetToken) { setResetPasswordToken(resetToken); window.history.replaceState({}, '', window.location.pathname); }
      
      const verifyEmailToken = params.get('verify_email');
      if (verifyEmailToken) { handleEmailVerification(verifyEmailToken); window.history.replaceState({}, '', window.location.pathname); }
      
      if (params.get('google_success')) { setGoogleOAuthResult({ success: true, message: 'Google Calendar connesso con successo!' }); window.history.replaceState({}, '', window.location.pathname); }
      else if (params.get('google_error')) { setGoogleOAuthResult({ success: false, message: 'Errore: ' + params.get('google_error') }); window.history.replaceState({}, '', window.location.pathname); }
      
      const action = params.get('action');
      if (action) {
        const emailActionData = {
          action, appointmentId: params.get('appointmentId'), clinicId: params.get('clinicId'),
          petId: params.get('petId'), reason: params.get('reason'), serviceType: params.get('serviceType'),
          amount: params.get('amount'), docId: params.get('docId'), rewardId: params.get('rewardId'),
          use: params.get('use') === 'true', newMessage: params.get('newMessage') === 'true'
        };
        sessionStorage.setItem('vetbuddy_email_action', JSON.stringify(emailActionData));
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    checkAuth(); 
  }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (token) { 
      try { 
        const userData = await api.get('auth/me'); 
        setUser(userData);
        loadPendingEmailAction();
      } catch (error) { localStorage.removeItem('vetbuddy_token'); api.token = null; } 
    }
    setLoading(false);
  };

  const loadPendingEmailAction = () => {
    if (typeof window !== 'undefined') {
      const savedAction = sessionStorage.getItem('vetbuddy_email_action');
      if (savedAction) {
        try { setEmailAction(JSON.parse(savedAction)); sessionStorage.removeItem('vetbuddy_email_action'); }
        catch (e) { sessionStorage.removeItem('vetbuddy_email_action'); }
      }
    }
  };

  const handleLogin = (userData) => { 
    setUser(userData); 
    loadPendingEmailAction();
    if (!localStorage.getItem('vetbuddy_welcomed_' + userData.id)) setShowWelcome(true); 
  };

  const handleEmailVerification = async (token) => {
    setVerificationState({ status: 'verifying', message: 'Verifica email in corso...' });
    try {
      const result = await api.post('auth/verify-email', { token });
      if (result.success) {
        setVerificationState(result.alreadyVerified 
          ? { status: 'already_verified', message: 'Email già verificata! Puoi accedere al tuo account.' }
          : { status: 'email_verified', message: result.message, requiresPhoneVerification: result.requiresPhoneVerification, userId: result.userId });
      }
    } catch (error) {
      setVerificationState({ status: 'error', message: error.message || 'Errore durante la verifica' });
    }
  };

  const handleWelcomeContinue = async () => { 
    localStorage.setItem('vetbuddy_welcomed_' + user.id, 'true'); 
    setShowWelcome(false);
    if (user.role === 'owner') {
      try { const pets = await api.get('pets'); if (!pets || pets.length === 0) sessionStorage.setItem('vetbuddy_show_add_pet', 'true'); }
      catch (error) { console.error('Error checking pets:', error); }
    }
  };

  const handleLogout = () => { localStorage.removeItem('vetbuddy_token'); api.token = null; setUser(null); setShowWelcome(false); sessionStorage.removeItem('vetbuddy_email_action'); };
  const clearEmailAction = () => { setEmailAction(null); if (typeof window !== 'undefined') window.history.replaceState({}, '', window.location.pathname); };

  useEffect(() => {
    if (googleOAuthResult) {
      alert(googleOAuthResult.success ? '✅ ' + googleOAuthResult.message : '❌ ' + googleOAuthResult.message);
      setGoogleOAuthResult(null);
    }
  }, [googleOAuthResult]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-coral-50"><div className="text-center"><NewBrandLogo size="lg" /><p className="mt-4 text-coral-700">Caricamento...</p></div></div>;
  if (resetPasswordToken) return <ResetPasswordScreen token={resetPasswordToken} onComplete={() => setResetPasswordToken(null)} />;
  if (verificationState) return <VerificationScreen state={verificationState} onComplete={() => setVerificationState(null)} />;
  
  const renderContent = () => {
    if (!user) return <LandingPage onLogin={handleLogin} />;
    if (user.role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} />;
    if (user.role === 'lab') return <LabDashboard user={user} onLogout={handleLogout} />;
    if (showWelcome) return <WelcomeScreen user={user} onContinue={handleWelcomeContinue} />;
    if (user.role === 'clinic') return <ClinicDashboard user={user} onLogout={handleLogout} googleOAuthResult={googleOAuthResult} emailAction={emailAction} onClearEmailAction={clearEmailAction} />;
    if (user.role === 'staff') return <StaffDashboard user={user} onLogout={handleLogout} />;
    return <OwnerDashboard user={user} onLogout={handleLogout} emailAction={emailAction} onClearEmailAction={clearEmailAction} />;
  };
  
  return (
    <>
      {renderContent()}
      {user && <ChatWidget />}
    </>
  );
}
