'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoleBadge } from '@/app/components/common';
import NewBrandLogo from '@/app/components/shared/NewBrandLogo';
import api from '@/app/lib/api';
import {
  Calendar, CalendarDays, FileText, PawPrint, Gift, Star, MessageCircle, Newspaper, GraduationCap,
  MapPin, UserPlus, Menu, X, Receipt, Settings, CreditCard, LogOut, Bell, Inbox,
  AlertCircle, AlertTriangle, BookOpen, Search, Stethoscope, Mail
} from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Dynamic imports for owner sub-components
const OwnerAppointments = dynamic(() => import('@/app/components/owner/OwnerAppointments'), { ssr: false });
const OwnerDocuments = dynamic(() => import('@/app/components/owner/OwnerDocuments'), { ssr: false });
const OwnerMessages = dynamic(() => import('@/app/components/owner/OwnerMessages'), { ssr: false });
const OwnerReviews = dynamic(() => import('@/app/components/owner/OwnerReviews'), { ssr: false });
const OwnerRewardsSection = dynamic(() => import('@/app/components/owner/OwnerRewardsSection'), { ssr: false });
const OwnerTutorialInline = dynamic(() => import('@/app/components/owner/OwnerTutorialInline'), { ssr: false });
const PetProfile = dynamic(() => import('@/app/components/owner/PetProfile'), { ssr: false });
const FindClinic = dynamic(() => import('@/app/components/owner/FindClinic'), { ssr: false });
const InviteClinic = dynamic(() => import('@/app/components/owner/InviteClinic'), { ssr: false });
const SubscriptionPlans = dynamic(() => import('@/app/components/shared/SubscriptionPlans'), { ssr: false });

function OwnerDashboard({ user, onLogout, emailAction, onClearEmailAction }) {
  // Leggi parametro tab dall'URL per navigazione diretta
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['appointments', 'documents', 'invoices', 'messages', 'pets', 'rewards', 'reviews', 'events', 'findClinic', 'inviteClinic', 'tutorial', 'profile'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'appointments';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [pets, setPets] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [rewards, setRewards] = useState([]); // Premi del proprietario
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelAppointmentId, setCancelAppointmentId] = useState(null);
  const [cancelAppointmentDetails, setCancelAppointmentDetails] = useState(null);
  const [showBookingFromEmail, setShowBookingFromEmail] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => { loadData(); }, []);
  
  // Check if user should see add pet dialog (new registration with no pets)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const showAddPet = sessionStorage.getItem('vetbuddy_show_add_pet');
      if (showAddPet === 'true') {
        sessionStorage.removeItem('vetbuddy_show_add_pet');
        setActiveTab('pets');
        // Set a flag to open the add pet dialog once the component mounts
        setTimeout(() => {
          const addPetEvent = new CustomEvent('vetbuddy_open_add_pet');
          window.dispatchEvent(addPetEvent);
        }, 500);
      }
    }
  }, []);
  
  // Handle email action parameters
  useEffect(() => {
    if (emailAction && emailAction.action) {
      switch (emailAction.action) {
        case 'cancel':
          // Show cancellation dialog with appointment details
          if (emailAction.appointmentId) {
            setCancelAppointmentId(emailAction.appointmentId);
            // Find the appointment to show details
            const apt = appointments.find(a => a.id === emailAction.appointmentId);
            if (apt) {
              setCancelAppointmentDetails(apt);
            }
            setShowCancelDialog(true);
          }
          break;
        case 'book':
          // Show booking dialog/tab - with optional pre-selected service
          setActiveTab('appointments');
          setShowBookingFromEmail(true);
          if (emailAction.serviceType) {
            // Store service type to pre-select in booking form
            sessionStorage.setItem('vetbuddy_book_service', emailAction.serviceType);
          }
          break;
        case 'message':
        case 'messages':
          // Go to messages tab - optionally create new message
          setActiveTab('messages');
          if (emailAction.newMessage && emailAction.clinicId) {
            // Trigger new message to specific clinic
            sessionStorage.setItem('vetbuddy_new_message_clinic', emailAction.clinicId);
          }
          break;
        case 'review':
        case 'reviews':
          // Go to reviews tab
          setActiveTab('reviews');
          break;
        case 'profile':
        case 'pets':
          // Go to pets/profile section
          setActiveTab('pets');
          break;
        case 'pay':
          // Go to payment - find the specific appointment and start payment
          setActiveTab('appointments');
          if (emailAction.appointmentId) {
            // Find the appointment
            const aptToPay = appointments.find(a => a.id === emailAction.appointmentId);
            if (aptToPay && aptToPay.paymentStatus !== 'paid') {
              // Avvia il pagamento Stripe automaticamente
              const startPayment = async () => {
                try {
                  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                  const response = await api.post('payments/appointment', {
                    appointmentId: aptToPay.id,
                    originUrl: baseUrl
                  });
                  if (response.url) {
                    window.location.href = response.url;
                  }
                } catch (error) {
                  console.error('Auto payment error:', error);
                  // Fallback: mostra l'appuntamento
                  setSelectedAppointment(aptToPay);
                }
              };
              startPayment();
            } else if (aptToPay) {
              setSelectedAppointment(aptToPay);
            }
          }
          break;
        case 'documents':
          // Go to documents section
          setActiveTab('documents');
          if (emailAction.docId) {
            // Store doc ID to highlight/open specific document
            sessionStorage.setItem('vetbuddy_open_doc', emailAction.docId);
          }
          break;
        case 'payment':
          // Legacy - go to documents (where invoices are)
          setActiveTab('documents');
          break;
        case 'appointments':
          // Go to appointments
          setActiveTab('appointments');
          break;
        case 'rewards':
          // Go to rewards section
          setActiveTab('rewards');
          if (emailAction.rewardId && emailAction.use) {
            // Store reward ID to show usage dialog
            sessionStorage.setItem('vetbuddy_use_reward', emailAction.rewardId);
          }
          break;
        default:
          break;
      }
      // Clear the action after handling
      if (onClearEmailAction) onClearEmailAction();
    }
  }, [emailAction, onClearEmailAction, appointments]);
  
  const loadData = async () => { try { const [appts, docs, msgs, petsList, clinicsList, rewardsList] = await Promise.all([api.get('appointments'), api.get('documents'), api.get('messages'), api.get('pets'), api.get('clinics/search?city=Milano&maxDistance=100'), api.get('rewards/my-rewards').catch(() => [])]); setAppointments(appts); setDocuments(docs); setMessages(msgs); setPets(petsList); setClinics(clinicsList || []); setRewards(rewardsList || []); } catch (error) { console.error('Error:', error); } };
  
  // Cancel appointment handler
  const handleCancelAppointment = async () => {
    if (!cancelAppointmentId) return;
    try {
      await api.put(`appointments/${cancelAppointmentId}`, { status: 'cancelled', cancellationReason });
      alert('✅ Appuntamento cancellato con successo');
      setShowCancelDialog(false);
      setCancelAppointmentId(null);
      setCancelAppointmentDetails(null);
      setCancellationReason('');
      loadData(); // Refresh data
    } catch (error) {
      alert('❌ Errore nella cancellazione: ' + error.message);
    }
  };

  const NavItem = ({ icon: Icon, label, value, badge }) => <button onClick={() => { setActiveTab(value); setSelectedPetId(null); setMobileMenuOpen(false); }} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${activeTab === value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><div className="flex items-center gap-3"><Icon className="h-5 w-5" />{label}</div>{badge > 0 && <Badge className="bg-blue-500 text-white text-xs">{badge}</Badge>}</button>;

  // Calculate notifications
  const upcomingAppointments = appointments.filter(a => a.status === 'confirmed' && new Date(a.date) > new Date()).length;
  const unreadMessages = messages.filter(m => !m.read && m.senderId !== user.id).length;

  const handleOpenPetProfile = (petId) => {
    setSelectedPetId(petId);
    setActiveTab('petProfile');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <NewBrandLogo size="xs" showText={false} />
          <div>
            <h1 className="font-bold text-sm"><span className="text-gray-900">vet</span><span className="text-coral-500">buddy</span></h1>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-500 hover:text-red-600">
            <LogOut className="h-4 w-4" />
          </Button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Dark backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-[55]" 
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className="md:hidden fixed left-0 right-0 top-[57px] bottom-0 bg-white z-[60] p-4 overflow-y-auto shadow-xl animate-in slide-in-from-top duration-200">
            <div className="mb-4"><RoleBadge role="owner" /></div>
            <Badge variant="outline" className="mb-6 justify-center text-amber-600 border-amber-300 bg-amber-50 w-full"><AlertCircle className="h-3 w-3 mr-1" /> Modalità Pilot</Badge>
            <nav className="space-y-1">
              <NavItem icon={Calendar} label="Appuntamenti" value="appointments" badge={upcomingAppointments} />
              <NavItem icon={FileText} label="Documenti" value="documents" badge={documents.filter(d => d.type !== 'invoice' && d.category !== 'fattura').length || null} />
              <NavItem icon={Receipt} label="Le mie Fatture" value="invoices" badge={documents.filter(d => d.type === 'invoice' || d.category === 'fattura').length || null} />
              <NavItem icon={MessageCircle} label="Messaggi" value="messages" badge={unreadMessages} />
              <NavItem icon={PawPrint} label="I miei animali" value="pets" />
              <NavItem icon={Gift} label="I miei premi" value="rewards" badge={rewards.filter(r => r.status === 'available').length} />
              <NavItem icon={Star} label="Le mie recensioni" value="reviews" />
              <NavItem icon={CalendarDays} label="Eventi & News" value="events" />
              <div className="border-t my-3"></div>
              <NavItem icon={Search} label="Trova clinica" value="findClinic" />
              <NavItem icon={Mail} label="Invita la tua clinica" value="inviteClinic" />
              <NavItem icon={BookOpen} label="Tutorial" value="tutorial" />
              <NavItem icon={Settings} label="Profilo e Notifiche" value="profile" />
            </nav>
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
              <p className="text-xs text-gray-500 truncate max-w-[100px]">{user.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-500 hover:text-red-600 hover:bg-red-50" title="Esci">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="mb-2"><RoleBadge role="owner" /></div>
        <Badge variant="outline" className="mb-6 justify-center text-amber-600 border-amber-300 bg-amber-50"><AlertCircle className="h-3 w-3 mr-1" /> Modalità Pilot</Badge>
        <nav className="space-y-1 flex-1 overflow-y-auto">
          <NavItem icon={Calendar} label="Appuntamenti" value="appointments" badge={upcomingAppointments} />
          <NavItem icon={FileText} label="Documenti" value="documents" badge={documents.filter(d => d.type !== 'invoice' && d.category !== 'fattura').length || null} />
          <NavItem icon={Receipt} label="Le mie Fatture" value="invoices" badge={documents.filter(d => d.type === 'invoice' || d.category === 'fattura').length || null} />
          <NavItem icon={MessageCircle} label="Messaggi" value="messages" badge={unreadMessages} />
          <NavItem icon={PawPrint} label="I miei animali" value="pets" />
          <NavItem icon={Gift} label="I miei premi" value="rewards" badge={rewards.filter(r => r.status === 'available').length} />
          <NavItem icon={Star} label="Le mie recensioni" value="reviews" />
          <NavItem icon={CalendarDays} label="Eventi & News" value="events" />
          <div className="border-t my-3"></div>
          <NavItem icon={Search} label="Trova clinica" value="findClinic" />
          <NavItem icon={Mail} label="Invita la tua clinica" value="inviteClinic" />
          <NavItem icon={BookOpen} label="Tutorial" value="tutorial" />
          <NavItem icon={Settings} label="Profilo e Notifiche" value="profile" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Banner Pilot Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-amber-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Benvenuto nel Pilot Milano! 🏙️</h3>
              <p className="text-sm text-gray-600">
                La tua clinica è già su VetBuddy! Prenota visite, ricevi documenti e referti direttamente dalla tua dashboard.
              </p>
            </div>
          </div>
        </div>

        {activeTab === 'appointments' && <OwnerAppointments appointments={appointments} pets={pets} />}
        {activeTab === 'documents' && <OwnerDocuments documents={documents.filter(d => d.type !== 'invoice' && d.category !== 'fattura')} pets={pets} onRefresh={loadData} user={user} />}
        {activeTab === 'invoices' && <OwnerInvoices invoices={documents.filter(d => d.type === 'invoice' || d.category === 'fattura')} pets={pets} onRefresh={loadData} />}
        {activeTab === 'messages' && <OwnerMessages messages={messages} clinics={clinics} pets={pets} onRefresh={loadData} />}
        {activeTab === 'pets' && <OwnerPets pets={pets} onRefresh={loadData} onOpenProfile={handleOpenPetProfile} />}
        {activeTab === 'rewards' && <OwnerRewardsSection user={user} />}
        {activeTab === 'reviews' && <OwnerReviews user={user} />}
        {activeTab === 'events' && <OwnerEvents user={user} onNavigate={setActiveTab} />}
        {activeTab === 'petProfile' && selectedPetId && <PetProfile petId={selectedPetId} onBack={() => setActiveTab('pets')} onNavigate={setActiveTab} appointments={appointments} documents={documents} />}
        {activeTab === 'findClinic' && <FindClinic user={user} />}
        {activeTab === 'inviteClinic' && <InviteClinic user={user} />}
        {activeTab === 'tutorial' && <OwnerTutorialInline />}
        {activeTab === 'profile' && <OwnerProfile user={user} onRefresh={loadData} />}
      </main>
      
      {/* Dialog Cancellazione Appuntamento - Migliorata con dettagli */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Cancella Appuntamento
            </DialogTitle>
            <DialogDescription>
              Stai per cancellare il seguente appuntamento:
            </DialogDescription>
          </DialogHeader>
          
          {/* Appointment Details */}
          {cancelAppointmentDetails && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 my-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{cancelAppointmentDetails.date}</span>
                  <span className="text-gray-500">alle</span>
                  <span className="font-medium">{cancelAppointmentDetails.time}</span>
                </div>
                {cancelAppointmentDetails.petName && (
                  <div className="flex items-center gap-2">
                    <PawPrint className="h-4 w-4 text-coral-500" />
                    <span>Paziente: <strong>{cancelAppointmentDetails.petName}</strong></span>
                  </div>
                )}
                {cancelAppointmentDetails.reason && (
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-blue-500" />
                    <span>Motivo: {cancelAppointmentDetails.reason}</span>
                  </div>
                )}
                {cancelAppointmentDetails.clinicName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span>Clinica: {cancelAppointmentDetails.clinicName}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Cancellation Policy */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Politica di Cancellazione
            </p>
            <p className="text-amber-700 text-sm">
              {cancelAppointmentDetails?.cancellationPolicy || 
               'Ti preghiamo di avvisarci almeno 24 ore prima in caso di disdetta. La mancata comunicazione potrebbe comportare un addebito secondo la politica della clinica.'}
            </p>
          </div>
          
          {/* Reason input */}
          <div className="mt-2">
            <Label htmlFor="cancel-reason" className="text-sm text-gray-600">Motivo della cancellazione (opzionale)</Label>
            <Textarea 
              id="cancel-reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Es: Impegno improvviso, altro appuntamento..."
              rows={2}
              className="mt-1"
            />
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => { setShowCancelDialog(false); setCancellationReason(''); }}>
              Mantieni Appuntamento
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Conferma Cancellazione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OwnerDashboard;
