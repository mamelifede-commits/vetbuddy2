'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Google Maps iframe only - no SDK needed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Auth components (refactored)
import { AuthForm, ResetPasswordScreen, VerificationScreen } from '@/app/components/auth';
// Landing page components (refactored)
import { EcosystemToggle, FeatureCarousel, HomepageMapSection } from '@/app/components/landing';
// Common components (refactored)
import { VetBuddyLogo, AccessDenied, RoleBadge, ChatWidget, WelcomeScreen } from '@/app/components/common';
import api from '@/app/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, FileText, Users, Inbox, LogOut, Plus, Send, Dog, Cat, Clock, Mail, User, 
  Building2, Phone, PawPrint, Search, Zap, Shield, Heart, MessageCircle, Bell, 
  CheckCircle, ChevronRight, Menu, X, CalendarDays, ClipboardList, Settings,
  Star, Check, Upload, Paperclip, AlertCircle, RefreshCw, Eye, Download,
  UserCheck, Ticket, Filter, MoreHorizontal, ExternalLink, Video, CalendarCheck,
  CreditCard, PlayCircle, ArrowRight, FileCheck, Stethoscope, SendHorizontal,
  LayoutDashboard, ListTodo, CircleDot, Timer, TrendingUp, Activity,
  MapPin, Globe, Receipt, Syringe, Weight, AlertTriangle, ChevronLeft,
  Euro, Wallet, Camera, Edit, Trash2, Info, StarHalf, Image as ImageIcon, Scissors,
  BarChart3, Gift, Lock, Sparkles, UserPlus, PlusCircle, Loader2, Image,
  FolderArchive, BookOpen, GraduationCap, Newspaper, Link2, CalendarRange, Droplet, Archive,
  Smartphone, Navigation, Share2, Copy, Beaker, Save, CalendarX,
  FlaskConical, Package, XCircle, CheckCircle2, MousePointerClick
} from 'lucide-react';

// === Extracted Components (Dynamic Imports for Memory Optimization) ===
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/app/components/admin/AdminDashboard'), { ssr: false, loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-coral-500 border-t-transparent rounded-full" /></div> });
const ClinicAgenda = dynamic(() => import('@/app/components/clinic/ClinicAgenda'), { ssr: false });
const ClinicArchive = dynamic(() => import('@/app/components/clinic/ClinicArchive'), { ssr: false });
const ClinicAutomations = dynamic(() => import('@/app/components/clinic/ClinicAutomations'), { ssr: false });
const ClinicDocuments = dynamic(() => import('@/app/components/clinic/ClinicDocuments'), { ssr: false });
const ClinicEvents = dynamic(() => import('@/app/components/clinic/ClinicEvents'), { ssr: false });
const ClinicFeedbackPage = dynamic(() => import('@/app/components/clinic/ClinicFeedbackPage'), { ssr: false });
const ClinicInvoicing = dynamic(() => import('@/app/components/clinic/ClinicInvoicing'), { ssr: false });
const ClinicLabAnalysis = dynamic(() => import('@/app/components/clinic/ClinicLabAnalysis'), { ssr: false });
const ClinicLabMarketplace = dynamic(() => import('@/app/components/clinic/ClinicLabMarketplace'), { ssr: false });
const ClinicTutorialInline = dynamic(() => import('@/app/components/clinic/ClinicTutorialInline'), { ssr: false });
const ClinicPatients = dynamic(() => import('@/app/components/clinic/ClinicPatients'), { ssr: false });
const ClinicReports = dynamic(() => import('@/app/components/clinic/ClinicReports'), { ssr: false });
const ClinicReviews = dynamic(() => import('@/app/components/clinic/ClinicReviews'), { ssr: false });
const ClinicRewardsManagement = dynamic(() => import('@/app/components/clinic/ClinicRewardsManagement'), { ssr: false });
const ClinicServices = dynamic(() => import('@/app/components/clinic/ClinicServices'), { ssr: false });
const ClinicSettings = dynamic(() => import('@/app/components/clinic/ClinicSettings'), { ssr: false });
const ClinicTemplates = dynamic(() => import('@/app/components/clinic/ClinicTemplates'), { ssr: false });
const ClinicVideoConsult = dynamic(() => import('@/app/components/clinic/ClinicVideoConsult'), { ssr: false });
const DocumentUploadForm = dynamic(() => import('@/app/components/clinic/DocumentUploadForm'), { ssr: false });
const FindClinic = dynamic(() => import('@/app/components/owner/FindClinic'), { ssr: false });
const InviteClinic = dynamic(() => import('@/app/components/owner/InviteClinic'), { ssr: false });
const InvoiceUploadForm = dynamic(() => import('@/app/components/shared/InvoiceUploadForm'), { ssr: false });
const OwnerTutorialInline = dynamic(() => import('@/app/components/owner/OwnerTutorialInline'), { ssr: false });
const LabDashboard = dynamic(() => import('@/app/components/lab/LabDashboard'), { ssr: false, loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-coral-500 border-t-transparent rounded-full" /></div> });
const OwnerAppointments = dynamic(() => import('@/app/components/owner/OwnerAppointments'), { ssr: false });
const OwnerDocuments = dynamic(() => import('@/app/components/owner/OwnerDocuments'), { ssr: false });
const OwnerEvents = dynamic(() => import('@/app/components/owner/OwnerEvents'), { ssr: false });
const OwnerInvoices = dynamic(() => import('@/app/components/owner/OwnerInvoices'), { ssr: false });
const OwnerMessages = dynamic(() => import('@/app/components/owner/OwnerMessages'), { ssr: false });
const OwnerPets = dynamic(() => import('@/app/components/owner/OwnerPets'), { ssr: false });
const OwnerProfile = dynamic(() => import('@/app/components/owner/OwnerProfile'), { ssr: false });
const OwnerReviews = dynamic(() => import('@/app/components/owner/OwnerReviews'), { ssr: false });
const OwnerRewardsSection = dynamic(() => import('@/app/components/owner/OwnerRewardsSection'), { ssr: false });
const PetProfile = dynamic(() => import('@/app/components/owner/PetProfile'), { ssr: false });
const StaffDashboard = dynamic(() => import('@/app/components/staff/StaffDashboard'), { ssr: false, loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-coral-500 border-t-transparent rounded-full" /></div> });
const SubscriptionPlans = dynamic(() => import('@/app/components/shared/SubscriptionPlans'), { ssr: false });


// Helper function for pet species info
const getPetSpeciesInfo = (species) => {
  const speciesMap = {
    dog: { emoji: '🐕', name: 'Cane', icon: Dog, color: 'blue' },
    cat: { emoji: '🐱', name: 'Gatto', icon: Cat, color: 'purple' },
    horse: { emoji: '🐴', name: 'Cavallo', icon: PawPrint, color: 'amber' },
    bird: { emoji: '🦜', name: 'Uccello', icon: PawPrint, color: 'green' },
    rabbit: { emoji: '🐰', name: 'Coniglio', icon: PawPrint, color: 'pink' },
    hamster: { emoji: '🐹', name: 'Criceto', icon: PawPrint, color: 'orange' },
    fish: { emoji: '🐠', name: 'Pesce', icon: PawPrint, color: 'cyan' },
    reptile: { emoji: '🦎', name: 'Rettile', icon: PawPrint, color: 'emerald' },
    other: { emoji: '🐾', name: 'Altro', icon: PawPrint, color: 'gray' }
  };
  return speciesMap[species] || speciesMap.other;
};

// New Brand Logo Component - Style 4 (Minimal with coral box)
const NewBrandLogo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    xs: { box: 'p-1.5 rounded-lg', icon: 'h-4 w-4', text: 'text-lg', gap: 'gap-1.5' },
    sm: { box: 'p-2 rounded-xl', icon: 'h-5 w-5', text: 'text-xl', gap: 'gap-2' },
    md: { box: 'p-3 rounded-2xl', icon: 'h-7 w-7', text: 'text-2xl', gap: 'gap-3' },
    lg: { box: 'p-4 rounded-2xl', icon: 'h-9 w-9', text: 'text-3xl', gap: 'gap-3' },
    xl: { box: 'p-5 rounded-3xl', icon: 'h-12 w-12', text: 'text-4xl', gap: 'gap-4' },
  };
  const s = sizes[size] || sizes.md;
  
  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <div className={`bg-gradient-to-br from-coral-500 to-rose-500 ${s.box} shadow-lg shadow-coral-500/30`}>
        <PawPrint className={`${s.icon} text-white`} />
      </div>
      {showText && (
        <div className={`font-bold ${s.text}`}>
          <span className="text-gray-900">vet</span>
          <span className="text-coral-500">buddy</span>
        </div>
      )}
    </div>
  );
};


// Pet Avatar Component - Shows photo or species icon
const PetAvatar = ({ pet, size = 'md', onClick, className = '' }) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };
  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  const emojiSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl'
  };
  
  const speciesInfo = getPetSpeciesInfo(pet?.species);
  const colorMap = {
    blue: 'from-blue-100 to-blue-200',
    purple: 'from-purple-100 to-purple-200',
    amber: 'from-amber-100 to-amber-200',
    green: 'from-green-100 to-green-200',
    pink: 'from-pink-100 to-pink-200',
    orange: 'from-orange-100 to-orange-200',
    cyan: 'from-cyan-100 to-cyan-200',
    emerald: 'from-emerald-100 to-emerald-200',
    gray: 'from-gray-100 to-gray-200'
  };
  const iconColorMap = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    green: 'text-green-600',
    pink: 'text-pink-600',
    orange: 'text-orange-600',
    cyan: 'text-cyan-600',
    emerald: 'text-emerald-600',
    gray: 'text-gray-600'
  };
  
  if (pet?.photoUrl) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
      >
        <img 
          src={pet.photoUrl} 
          alt={pet.name || 'Pet'} 
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div 
          className={`w-full h-full bg-gradient-to-br ${colorMap[speciesInfo.color]} items-center justify-center hidden`}
        >
          <span className={emojiSizes[size]}>{speciesInfo.emoji}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`${sizeClasses[size]} bg-gradient-to-br ${colorMap[speciesInfo.color]} rounded-full flex items-center justify-center flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <span className={emojiSizes[size]}>{speciesInfo.emoji}</span>
    </div>
  );
};

// ==================== LANDING PAGE ====================
// ==================== COMING SOON LANDING ====================
function ComingSoonLanding({ onLogin }) {
  const [showTeamLogin, setShowTeamLogin] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* SFONDO VIBRANTE CORAL → VIOLA */}
      <div className="absolute inset-0 bg-gradient-to-br from-coral-400 via-rose-500 to-purple-600"></div>
      
      {/* Cerchi decorativi sfumati */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Zampine bianche decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <PawPrint className="absolute top-[8%] left-[5%] h-16 w-16 text-white/20 rotate-[-15deg]" />
        <PawPrint className="absolute top-[15%] right-[8%] h-12 w-12 text-white/15 rotate-[25deg]" />
        <PawPrint className="absolute top-[40%] left-[3%] h-12 w-12 text-white/20 rotate-[10deg]" />
        <PawPrint className="absolute top-[55%] right-[4%] h-14 w-14 text-white/15 rotate-[-20deg]" />
        <PawPrint className="absolute top-[70%] left-[10%] h-10 w-10 text-white/20 rotate-[35deg]" />
        <PawPrint className="absolute bottom-[20%] right-[10%] h-12 w-12 text-white/15 rotate-[-10deg]" />
        <PawPrint className="absolute bottom-[10%] left-[40%] h-8 w-8 text-white/15 rotate-[-25deg]" />
      </div>

      {/* CONTENUTO PRINCIPALE */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 relative z-10">
        {/* Logo con effetto vetro */}
        <div className="mb-10 bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-4">
            <div className="p-5 bg-white rounded-3xl shadow-xl">
              <PawPrint className="h-14 w-14 text-coral-500" />
            </div>
            <div>
              <span className="font-bold text-5xl md:text-7xl text-gray-900">vet</span>
              <span className="font-bold text-5xl md:text-7xl text-white">buddy</span>
            </div>
          </div>
        </div>
        
        {/* Coming Soon */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-white drop-shadow-lg">
            Coming Soon
          </h1>
          <div className="mt-8 flex items-center justify-center gap-4">
            <PawPrint className="h-6 w-6 text-white/60" />
            <PawPrint className="h-8 w-8 text-white/80" />
            <PawPrint className="h-6 w-6 text-white/60" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-30 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">© 2025 vetbuddy</p>
          <button 
            onClick={() => setShowTeamLogin(true)}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Accesso Team
          </button>
        </div>
      </footer>

      {/* Team Login Dialog */}
      <Dialog open={showTeamLogin} onOpenChange={setShowTeamLogin}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🔐 Accesso Team</DialogTitle>
            <DialogDescription>Area riservata al team di sviluppo</DialogDescription>
          </DialogHeader>
          <AuthForm mode={authMode} setMode={setAuthMode} onLogin={(user) => { setShowTeamLogin(false); onLogin(user); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== FULL LANDING PAGE ====================

function FullLandingPage({ onLogin }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const scrollToSection = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); };

  // Auto-open login if there's a pending email action
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAction = sessionStorage.getItem('vetbuddy_email_action');
      if (savedAction) {
        try {
          const actionData = JSON.parse(savedAction);
          setPendingAction(actionData);
          // Auto-open login dialog
          setAuthMode('login');
          setShowAuth(true);
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  // Get action message for display
  const getActionMessage = () => {
    if (!pendingAction) return null;
    switch (pendingAction.action) {
      case 'cancel': return '❌ Per disdire l\'appuntamento, effettua prima il login';
      case 'book': return '📅 Per prenotare un appuntamento, effettua prima il login';
      case 'message': return '💬 Per inviare un messaggio, effettua prima il login';
      case 'review': return '⭐ Per lasciare una recensione, effettua prima il login';
      default: return '🔐 Effettua il login per continuare';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Under Construction */}
      <div className="bg-amber-500 text-white text-center py-2.5 px-4 text-sm font-medium">
        <span>⚠️ <strong>Sito in costruzione</strong> - Ci stiamo preparando al lancio. Se ti registri, ti avviseremo quando saremo pronti!</span>
      </div>
      {/* Pilot Banner - Milano */}
      <div className="bg-gradient-to-r from-coral-500 to-orange-500 text-white text-center py-2.5 px-4 text-sm">
        <span className="font-semibold">🏙️ Pilot Milano</span> — Accesso su invito per cliniche selezionate. <button onClick={() => scrollToSection('pilot')} className="underline font-semibold ml-1">Candidati →</button>
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
                        <NewBrandLogo size="sm" />
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('funzionalita')} className="text-gray-600 hover:text-coral-500 transition">Funzionalità</button>
              <button onClick={() => scrollToSection('automazioni')} className="text-gray-600 hover:text-coral-500 transition">Automazioni</button>
              <button onClick={() => scrollToSection('fatturazione')} className="text-gray-600 hover:text-coral-500 transition">Fatturazione</button>
              <button onClick={() => scrollToSection('premi')} className="text-gray-600 hover:text-coral-500 transition">Premi</button>
              <button onClick={() => scrollToSection('pilot')} className="text-gray-600 hover:text-coral-500 transition">Prezzi</button>
              <a href="/presentazione" className="text-gray-600 hover:text-coral-500 transition">Brochure</a>
            </nav>
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>Accedi</Button>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Registrati</Button>
            </div>
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-4 px-4 shadow-lg">
            <nav className="flex flex-col gap-3">
              <button onClick={() => { scrollToSection('funzionalita'); setMobileMenuOpen(false); }} className="text-gray-600 text-left py-2 hover:text-coral-500 transition">Funzionalità</button>
              <button onClick={() => { scrollToSection('automazioni'); setMobileMenuOpen(false); }} className="text-gray-600 text-left py-2 hover:text-coral-500 transition">Automazioni</button>
              <button onClick={() => { scrollToSection('fatturazione'); setMobileMenuOpen(false); }} className="text-gray-600 text-left py-2 hover:text-coral-500 transition">Fatturazione</button>
              <button onClick={() => { scrollToSection('premi'); setMobileMenuOpen(false); }} className="text-gray-600 text-left py-2 hover:text-coral-500 transition">Premi</button>
              <button onClick={() => { scrollToSection('pilot'); setMobileMenuOpen(false); }} className="text-gray-600 text-left py-2 hover:text-coral-500 transition">Prezzi</button>
              <a href="/presentazione" className="text-gray-600 text-left py-2 hover:text-coral-500 transition block">Brochure</a>
              <hr className="my-2" />
              <Button variant="ghost" className="justify-start" onClick={() => { setAuthMode('login'); setShowAuth(true); setMobileMenuOpen(false); }}>Accedi</Button>
              <Button className="bg-coral-500 hover:bg-coral-600 text-white" onClick={() => { setAuthMode('register'); setShowAuth(true); setMobileMenuOpen(false); }}>Registrati</Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero - Messaggio chiaro per cliniche e proprietari */}
      <section className="pt-12 pb-12 px-4 bg-gradient-to-br from-white via-coral-50/30 to-blue-50/30 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-coral-300/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge Pilot */}
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md text-amber-800 px-4 py-2 rounded-full mb-6 border border-amber-200/50 shadow-lg animate-fade-in-up">
            <MapPin className="h-4 w-4" />
            <span className="font-semibold">Pilot Milano — Accesso su invito</span>
          </div>
          
          {/* Headline principale */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight animate-fade-in-up animate-delay-100">
            <span className="text-coral-500">Cliniche veterinarie</span> e <span className="text-blue-500">proprietari di pet</span> in un'unica piattaforma
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
            Gestisci appuntamenti, documenti e comunicazione in un'unica piattaforma. Zero carta, zero caos.
          </p>
          
          {/* CTA Buttons - Glassmorphism */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-coral-200/50 hover:bg-white/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group animate-fade-in-left animate-delay-300" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <div className="h-14 w-14 bg-gradient-to-br from-coral-400 to-coral-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition shadow-lg">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Per Cliniche Veterinarie</h3>
              <p className="text-sm text-gray-600 mb-3">Dashboard completa, inbox team, documenti, reportistica.</p>
              <p className="text-xs text-amber-600 font-semibold mb-3">🎫 Pilot: 90 giorni gratuiti su invito</p>
              <Button className="w-full bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white shadow-lg">
                Richiedi Invito →
              </Button>
            </div>
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-blue-200/50 hover:bg-white/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group animate-fade-in-right animate-delay-300" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
              <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition shadow-lg">
                <PawPrint className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Per Proprietari di Animali</h3>
              <p className="text-sm text-gray-600 mb-3">Prenota visite, ricevi documenti, invita la tua clinica.</p>
              <p className="text-xs text-blue-600 font-semibold mb-3">🆓 Gratis per sempre • Invita la tua clinica</p>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
                Esplora la Demo →
              </Button>
            </div>
          </div>
          
          {/* Freelancer callout */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 max-w-2xl mx-auto mb-6 animate-fade-in-up animate-delay-400 cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-900 text-sm">Sei un veterinario freelance?</p>
                <p className="text-xs text-gray-600">Registrati come clinica e inizia con il <span className="font-bold text-purple-600">Piano Starter gratuito</span>. Ideale per gestire i tuoi clienti in autonomia!</p>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white flex-shrink-0">
                Richiedi Invito →
              </Button>
            </div>
          </div>
          
          {/* Trust indicators */}
          <p className="text-sm text-gray-400">Pilot attivo a Milano e provincia • Accesso prioritario per cliniche selezionate</p>
        </div>
      </section>

      {/* COSA CI RENDE UNICI - Sezione unificata e compatta */}
      <section id="funzionalita" className="py-16 px-4 bg-gradient-to-br from-gray-50 via-white to-coral-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-4">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Tutto in una piattaforma</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Non il solito gestionale veterinario
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Funzionalità pensate per risparmiare tempo e lavorare meglio. Cliniche e proprietari connessi.
            </p>
          </div>

          {/* Feature Grid - 7 features chiave */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Agenda */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <CalendarDays className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Agenda Intelligente</h3>
              <p className="text-gray-600 text-sm mb-4">Calendario settimanale con colori per veterinario. Drag & drop appuntamenti, 10+ tipi di visita.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Multi-veterinario</Badge>
                <Badge variant="outline" className="text-xs">Drag & drop</Badge>
              </div>
            </div>

            {/* Automazioni */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all group relative">
              <div className="absolute -top-3 right-4 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                44+ attive
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Automazioni AI</h3>
              <p className="text-gray-600 text-sm mb-4">Promemoria, richiami vaccini, follow-up, auguri compleanno pet. Tutto automatico, 24/7.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">-80% telefonate</Badge>
                <Badge variant="outline" className="text-xs">+40% ritorno</Badge>
              </div>
            </div>

            {/* Team Inbox */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-14 w-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <Inbox className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Team Inbox</h3>
              <p className="text-gray-600 text-sm mb-4">Tutti i messaggi in un unico posto. Assegna ticket, segui le conversazioni, rispondi velocemente.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Ticket system</Badge>
                <Badge variant="outline" className="text-xs">Quick replies</Badge>
              </div>
            </div>

            {/* Video Consulto */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all group relative">
              <div className="absolute -top-3 right-4 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                Novità
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <Video className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Video Consulto</h3>
              <p className="text-gray-600 text-sm mb-4">Consulenze online con un click. Link automatico al cliente, nessun software esterno.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">1-click</Badge>
                <Badge variant="outline" className="text-xs">HD Quality</Badge>
              </div>
            </div>

            {/* Documenti */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-14 w-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Documenti Cloud</h3>
              <p className="text-gray-600 text-sm mb-4">Referti, prescrizioni, fatture. Upload drag & drop, firma digitale, invio 1-click ai clienti.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Firma digitale</Badge>
                <Badge variant="outline" className="text-xs">Invio email</Badge>
              </div>
            </div>

            {/* Template */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-coral-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-14 w-14 bg-gradient-to-br from-coral-400 to-coral-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <ClipboardList className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Template Smart</h3>
              <p className="text-gray-600 text-sm mb-4">Messaggi pre-compilati con variabili automatiche. Nome cliente, pet, data, orario... tutto al suo posto.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">WhatsApp</Badge>
                <Badge variant="outline" className="text-xs">Email</Badge>
              </div>
            </div>

            {/* Report */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-cyan-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-14 w-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Report & Analytics</h3>
              <p className="text-gray-600 text-sm mb-4">Fatturato, appuntamenti, no-show, clienti top. Export CSV, grafici interattivi, trend mensili.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Export CSV</Badge>
                <Badge variant="outline" className="text-xs">Dashboard</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TROVA CLINICA - Google Maps Interattiva */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 via-white to-coral-50/30 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Per i proprietari</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Trova la clinica <span className="text-blue-500">più vicina</span>
              </h2>
              <p className="text-gray-600 mb-6">
                I tuoi clienti possono trovarti facilmente sulla mappa. Vedono distanza in tempo reale, orari e servizi disponibili.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Geolocalizzazione GPS automatica</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Calcolo distanza in tempo reale</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-coral-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 text-coral-600" />
                  </div>
                  <span className="text-gray-700">Servizi e specializzazioni visibili</span>
                </li>
              </ul>
              <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
                Trova clinica vicino a te →
              </Button>
            </div>
            
            {/* Google Maps Interattiva */}
            <HomepageMapSection />
          </div>
        </div>
      </section>

      {/* Come Funziona - Semplificato */}
      <section className="py-12 px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden relative" id="come-funziona">
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-green-300/20 rounded-full blur-2xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-6">
            <p className="text-coral-500 font-semibold mb-2">PERCHÉ VETBUDDY</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Le feature che ci distinguono</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Strumenti progettati per semplificare il lavoro quotidiano della clinica e migliorare l'esperienza dei tuoi clienti.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            {/* Feature 1 - Team Inbox */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-purple-200/50 hover:bg-white/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg animate-float" style={{animationDelay: '0s'}}>
                  <Inbox className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Team Inbox con assegnazione ticket</h3>
                  <p className="text-gray-600 mb-3">Una inbox condivisa per tutto lo staff. Assegna richieste, evita doppioni, traccia chi risponde. Niente messaggi persi.</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50/50">Anti-doppioni</Badge>
                    <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50/50">Assegnazione staff</Badge>
                    <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50/50">Storico completo</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature 2 - Documenti automatici */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-200/50 hover:bg-white/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg animate-float" style={{animationDelay: '0.5s'}}>
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Documenti: upload e invio automatico</h3>
                  <p className="text-gray-600 mb-3">Carica PDF (referti, prescrizioni, fatture) e inviali automaticamente via email al proprietario. Tutto tracciato.</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50/50">Upload PDF</Badge>
                    <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50/50">Email automatica</Badge>
                    <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50/50">Archivio clinico</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature 3 - Prenotazioni + Video */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-blue-200/50 hover:bg-white/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg animate-float" style={{animationDelay: '1s'}}>
                  <CalendarCheck className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Prenotazioni + Video + Google Calendar</h3>
                  <p className="text-gray-600 mb-3">Agenda sincronizzata, video-consulti integrati, reminder automatici via email/SMS. I clienti prenotano 24/7.</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50/50">Sync Google Calendar</Badge>
                    <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50/50">Video-consulti</Badge>
                    <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50/50">Reminder auto</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature 4 - Reportistica */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-200/50 hover:bg-white/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg animate-float" style={{animationDelay: '1.5s'}}>
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Reportistica clinica completa</h3>
                  <p className="text-gray-600 mb-3">Dashboard con metriche chiave: clienti attivi, fatturato, tempi di risposta, no-show. Prendi decisioni basate sui dati.</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50/50">Analytics</Badge>
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50/50">Report no-show</Badge>
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50/50">Trend fatturato</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Altre Funzionalità - Carousel */}
      <section className="py-6 px-4 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">E molto altro...</h2>
          </div>
          
          {/* Carousel Container */}
          <FeatureCarousel />
        </div>
      </section>


      {/* Potenzialità / Vision */}
      <section className="py-12 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-coral-400 font-semibold mb-2">LA NOSTRA VISIONE</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Il futuro della veterinaria è digitale</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">vetbuddy non è solo un gestionale. È una piattaforma che connette cliniche e proprietari, semplifica la comunicazione e migliora la cura degli animali.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="h-16 w-16 bg-coral-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-coral-400" />
              </div>
              <h3 className="font-bold text-xl mb-2">+30% Efficienza</h3>
              <p className="text-gray-400 text-sm">Meno tempo al telefono, più tempo con i pazienti. Automatizza le attività ripetitive.</p>
            </div>
            <div className="text-center p-6">
              <div className="h-16 w-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-bold text-xl mb-2">Clienti più fedeli</h3>
              <p className="text-gray-400 text-sm">Comunicazione moderna, documenti sempre disponibili, prenotazioni facili = clienti soddisfatti.</p>
            </div>
            <div className="text-center p-6">
              <div className="h-16 w-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-bold text-xl mb-2">Dati per crescere</h3>
              <p className="text-gray-400 text-sm">Dashboard con KPI, report finanziari e analytics per prendere decisioni informate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🤖 SEZIONE AUTOMAZIONI */}
      <section id="automazioni" className="py-16 px-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-4">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Zero stress, tutto automatico</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Riduci il <span className="text-purple-600">carico di lavoro</span> del 70%
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Basta telefonate, promemoria manuali e clienti che dimenticano gli appuntamenti. 
              <strong> vetbuddy lavora mentre tu curi gli animali.</strong>
            </p>
          </div>

          {/* Hero stats - impatto sul lavoro */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white rounded-xl p-4 text-center shadow-md border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-1">-80%</div>
              <p className="text-sm text-gray-600">Telefonate per promemoria</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">-60%</div>
              <p className="text-sm text-gray-600">No-show e appuntamenti persi</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md border border-amber-100">
              <div className="text-3xl font-bold text-amber-600 mb-1">+40%</div>
              <p className="text-sm text-gray-600">Clienti che tornano</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-1">2h/giorno</div>
              <p className="text-sm text-gray-600">Risparmiate in media</p>
            </div>
          </div>

          {/* Striscia 44+ automazioni - SOPRA le card */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">🎯 44+ automazioni disponibili</h3>
                <p className="text-purple-200">Antiparassitari, refill farmaci, lista d'attesa, richiesta recensioni, alert stagionali e molto altro...</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="text-center bg-white/10 rounded-lg px-6 py-3">
                  <p className="text-3xl font-bold">24/7</p>
                  <p className="text-purple-200 text-sm">Sempre attive</p>
                </div>
                <p className="text-xs text-purple-300">Attiva solo quelle che ti servono</p>
              </div>
            </div>
          </div>

          {/* Automazioni che riducono il carico */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Promemoria automatici */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200 hover:shadow-xl transition-shadow relative">
              <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                🔥 Più richiesta
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mt-2">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">📱 Promemoria Automatici</h3>
              <p className="text-gray-600 text-sm mb-3">Mai più telefonate per ricordare gli appuntamenti. Email e SMS partono da soli 24h prima.</p>
              <div className="bg-green-50 rounded-lg p-3 text-sm">
                <span className="text-green-700 font-medium">💡 Risparmio:</span>
                <span className="text-green-600"> 15+ chiamate/giorno</span>
              </div>
            </div>

            {/* Richiamo vaccini */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-shadow relative">
              <div className="absolute -top-3 left-4 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                💰 Più fatturato
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mt-2">
                <Syringe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">💉 Richiamo Vaccini</h3>
              <p className="text-gray-600 text-sm mb-3">I clienti ricevono il promemoria 30 giorni prima della scadenza. Tu non devi ricordarti nulla.</p>
              <div className="bg-blue-50 rounded-lg p-3 text-sm">
                <span className="text-blue-700 font-medium">💡 Risultato:</span>
                <span className="text-blue-600"> +35% richiami rispettati</span>
              </div>
            </div>

            {/* Conferme prenotazione */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">✅ Conferme Istantanee</h3>
              <p className="text-gray-600 text-sm mb-3">Appena il cliente prenota, riceve subito la conferma con tutti i dettagli. Zero lavoro per te.</p>
              <div className="bg-purple-50 rounded-lg p-3 text-sm">
                <span className="text-purple-700 font-medium">💡 Automatico:</span>
                <span className="text-purple-600"> 100% delle prenotazioni</span>
              </div>
            </div>

            {/* Follow-up post visita */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-coral-100 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-coral-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">💝 Follow-up Post Visita</h3>
              <p className="text-gray-600 text-sm mb-3">48h dopo la visita, il cliente riceve un messaggio per sapere come sta il pet. Cura e attenzione automatiche.</p>
              <div className="bg-coral-50 rounded-lg p-3 text-sm">
                <span className="text-coral-700 font-medium">💡 Effetto:</span>
                <span className="text-coral-600"> Clienti più fedeli</span>
              </div>
            </div>

            {/* No-show detection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">🚫 Anti No-Show</h3>
              <p className="text-gray-600 text-sm mb-3">Identifica automaticamente chi non si presenta e tiene traccia per gestire i recidivi.</p>
              <div className="bg-red-50 rounded-lg p-3 text-sm">
                <span className="text-red-700 font-medium">💡 Recupero:</span>
                <span className="text-red-600"> Slot persi ridotti del 60%</span>
              </div>
            </div>

            {/* Compleanno Pet */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">🎂 Auguri Automatici</h3>
              <p className="text-gray-600 text-sm mb-3">Email di auguri per il compleanno del pet con eventuale sconto. I clienti adorano questo tocco personale!</p>
              <div className="bg-amber-50 rounded-lg p-3 text-sm">
                <span className="text-amber-700 font-medium">💡 Engagement:</span>
                <span className="text-amber-600"> +25% prenotazioni</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Import Dati Section */}
      <section id="import" className="py-16 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4 font-semibold">
              MIGRAZIONE FACILE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Importa i tuoi Pazienti Esistenti</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Passa a vetbuddy senza perdere nulla. Importa in pochi click i dati dal tuo gestionale attuale.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Features */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Import da CSV/Excel</h3>
                  <p className="text-gray-600 text-sm">Esporta dal tuo gestionale e carica su vetbuddy. Supportiamo tutti i formati comuni.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Proprietari + Animali + Vaccini</h3>
                  <p className="text-gray-600 text-sm">Importa tutto in un colpo solo: anagrafica, dati sanitari, storico vaccinazioni.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Upload className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Documenti con Abbinamento Auto</h3>
                  <p className="text-gray-600 text-sm">Carica referti ed esami. vetbuddy li associa automaticamente ai pazienti giusti.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">100% Sicuro e Conforme GDPR</h3>
                  <p className="text-gray-600 text-sm">I dati sono criptati e trattati secondo le normative europee sulla privacy.</p>
                </div>
              </div>
            </div>
            
            {/* Right: Visual Demo */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Import Wizard</h4>
                    <p className="text-xs text-gray-500">4 semplici passaggi</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">1</div>
                    <span className="text-sm text-green-800">Scarica template CSV</span>
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">2</div>
                    <span className="text-sm text-green-800">Compila con i tuoi dati</span>
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">3</div>
                    <span className="text-sm text-blue-800">Carica il file</span>
                    <Loader2 className="h-4 w-4 text-blue-500 ml-auto animate-spin" />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">4</div>
                    <span className="text-sm text-gray-500">Aggiungi documenti (opzionale)</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t text-center">
                  <p className="text-sm text-gray-500 mb-3">Esempio risultato import:</p>
                  <div className="flex justify-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">127</p>
                      <p className="text-xs text-gray-500">Pazienti</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">89</p>
                      <p className="text-xs text-gray-500">Proprietari</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">234</p>
                      <p className="text-xs text-gray-500">Vaccini</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm mb-4">Supportiamo import da:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="bg-white px-4 py-2 rounded-full shadow border text-gray-700 font-medium">📄 CSV</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border text-gray-700 font-medium">📊 Excel (.xlsx)</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border text-gray-700 font-medium">📑 PDF (documenti)</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border text-gray-700 font-medium">🖼️ Immagini (JPG, PNG)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sistema Fatturazione Section */}
      <section id="fatturazione" className="py-16 px-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4 font-semibold">
              FATTURAZIONE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fatturazione <span className="text-green-600">Flessibile</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Crea fatture direttamente in vetbuddy ed esportale nel formato che preferisci. 
              <strong> Integra con il tuo software di fatturazione</strong> o usa il nostro sistema.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Opzione 1: Export per software esterni */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                  <Download className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Esporta per il Tuo Software</h3>
                  <p className="text-sm text-green-600">Usa il tuo sistema preferito</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Crea le fatture in vetbuddy ed esportale in CSV, JSON o PDF. 
                Importale nel tuo software di fatturazione elettronica per l'invio al Sistema di Interscambio (SdI).
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700"><strong>Export CSV</strong> - Compatibile con Excel e gestionali</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700"><strong>Export PDF</strong> - Fattura professionale stampabile</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700"><strong>Export JSON</strong> - Per integrazione API</span>
                </li>
              </ul>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  💡 <strong>Software compatibili:</strong> Fatture in Cloud, TeamSystem, Aruba, 
                  Zucchetti, Buffetti, e qualsiasi software che accetta import CSV/Excel.
                </p>
              </div>
            </div>

            {/* Opzione 2: Funzionalità integrate */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-emerald-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                  <Receipt className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Sistema Integrato vetbuddy</h3>
                  <p className="text-sm text-emerald-600">Tutto in un unico posto</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Gestisci tutto direttamente in vetbuddy: listino prezzi, creazione fatture, 
                tracciamento pagamenti e statistiche finanziarie.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700"><strong>Listino Prezzi</strong> - Crea e gestisci le tue tariffe</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700"><strong>Fatture Rapide</strong> - Seleziona cliente e prestazioni</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700"><strong>Dashboard Finanziaria</strong> - Fatturato, pagati, in attesa</span>
                </li>
              </ul>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  📊 <strong>Calcolo automatico:</strong> IVA 22%, marca da bollo per importi {'>'} €77.47, 
                  numerazione progressiva.
                </p>
              </div>
            </div>
          </div>

          {/* Come funziona il flusso */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
              📋 Come Funziona: Da vetbuddy al Tuo Software
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Crea Fattura</p>
                <p className="text-xs text-gray-500">Seleziona cliente e prestazioni in vetbuddy</p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Esporta CSV/PDF</p>
                <p className="text-xs text-gray-500">Un click per scaricare i dati</p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Importa nel Tuo SW</p>
                <p className="text-xs text-gray-500">Fatture in Cloud, TeamSystem, etc.</p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-600 font-bold">4</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Invio al SdI</p>
                <p className="text-xs text-gray-500">Il tuo software invia all'Agenzia Entrate</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 text-center">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>Nota importante:</strong> Le fatture vetbuddy sono <strong>pre-fatture/proforma</strong>. 
                Per essere valide fiscalmente devono essere inviate al SdI tramite un software certificato.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <p className="text-gray-600 mb-4">Formati di export disponibili:</p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <span className="bg-white px-4 py-2 rounded-full shadow border border-green-200 text-green-700 font-medium">📄 CSV (Excel)</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border border-blue-200 text-blue-700 font-medium">📑 PDF</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border border-purple-200 text-purple-700 font-medium">💾 JSON (API)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Premi Fedeltà Section */}
      <section id="premi" className="py-16 px-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-4 font-semibold">
              NOVITÀ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Premi Fedeltà</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Le cliniche possono premiare i clienti più fedeli. Sconti, servizi gratuiti e regali speciali direttamente dalla tua clinica di fiducia.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: For Pet Owners */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-amber-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <PawPrint className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Per i Proprietari</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Ricevi <strong>premi fedeltà</strong> dalla tua clinica</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Sconti %, servizi gratis, prodotti omaggio</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Notifica email quando ricevi un premio</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Sezione dedicata "I Miei Premi" nella dashboard</span>
                </li>
              </ul>
              <p className="mt-6 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                💡 <strong>100% gratuito</strong> per i proprietari. È la clinica che decide quando premiarti!
              </p>
            </div>
            
            {/* Right: For Clinics */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-coral-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Per le Cliniche</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="h-4 w-4 text-coral-600" />
                  </div>
                  <span className="text-gray-700">Crea <strong>tipi di premio</strong> personalizzati</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="h-4 w-4 text-coral-600" />
                  </div>
                  <span className="text-gray-700">Assegna premi ai clienti più fedeli</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="h-4 w-4 text-coral-600" />
                  </div>
                  <span className="text-gray-700">Email automatica di notifica al cliente</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="h-4 w-4 text-coral-600" />
                  </div>
                  <span className="text-gray-700">Traccia premi assegnati e utilizzati</span>
                </li>
              </ul>
              <p className="mt-6 text-sm text-gray-500 bg-coral-50 p-3 rounded-lg">
                🎯 <strong>Fidelizza i clienti</strong> e aumenta il ritorno. I premi creano legame!
              </p>
            </div>
          </div>
          
          {/* Example Rewards */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-6">Esempi di premi che puoi creare:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-white px-4 py-2 rounded-full shadow border border-amber-200 text-amber-700 font-medium">🏷️ -10% prossima visita</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border border-green-200 text-green-700 font-medium">🎁 Visita gratuita</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border border-blue-200 text-blue-700 font-medium">💊 Antiparassitario omaggio</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border border-purple-200 text-purple-700 font-medium">✂️ Toelettatura gratis</span>
              <span className="bg-white px-4 py-2 rounded-full shadow border border-pink-200 text-pink-700 font-medium">🎂 Regalo compleanno pet</span>
            </div>
          </div>
        </div>
      </section>

      {/* Come Funziona */}
      <section id="come-funziona" className="py-12 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-coral-500 font-semibold mb-2">COME FUNZIONA</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Due app, un ecosistema</h2>
          </div>
          
          {/* Toggle Tabs Component */}
          <EcosystemToggle />
        </div>
      </section>

      {/* Beta Test Section */}
      <section id="pilot" className="py-12 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full mb-4">
              <Zap className="h-4 w-4" />
              <span className="font-semibold">Beta Test 2025</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Accedi al Pilot vetbuddy</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Stiamo testando l'app con cliniche veterinarie selezionate a Milano. <strong>Candidati per 90 giorni gratuiti (estendibili a 6 mesi) e aiutaci a costruire il futuro.</strong></p>
          </div>

          {/* Beta Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 border-2 border-coral-200 text-center">
              <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-coral-500" />
              </div>
              <h3 className="font-bold mb-2">Accesso gratuito</h3>
              <p className="text-gray-600 text-sm">Tutte le funzionalità Pro gratis durante la fase beta</p>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-coral-200 text-center">
              <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-coral-500" />
              </div>
              <h3 className="font-bold mb-2">Supporto diretto</h3>
              <p className="text-gray-600 text-sm">Canale dedicato per assistenza e suggerimenti</p>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-coral-200 text-center">
              <div className="h-12 w-12 bg-coral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-coral-500" />
              </div>
              <h3 className="font-bold mb-2">Costruisci con noi</h3>
              <p className="text-gray-600 text-sm">Il tuo feedback diventa nuove funzionalità</p>
            </div>
          </div>

          {/* Pricing Cards - Pilot Coherence */}
          <p className="text-center text-sm text-gray-600 mb-10">Piani disponibili solo tramite Pilot (su invito). Prezzi IVA esclusa.</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-4">
            {/* Starter - Piano base con automazioni essenziali */}
            <Card className="border-2 border-green-200 hover:border-green-300 transition-colors relative flex flex-col">
              {/* Badge Freelance */}
              <div className="absolute -top-3 left-4 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap">👨‍⚕️ IDEALE PER FREELANCE</div>
              <CardHeader className="pt-6 pb-4">
                <CardTitle className="flex items-center gap-2">Starter <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">GRATUITO</span></CardTitle>
                <CardDescription>Per iniziare con le automazioni essenziali</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-green-600">Gratis</span>
                  <p className="text-xs text-gray-500 mt-1">per sempre – su invito Pilot Milano</p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-0">
                <p className="text-xs font-medium text-gray-700 mb-3">Include:</p>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>1 sede, 1 utente</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span className="underline decoration-purple-300 decoration-2">Fino a 50 pazienti</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Agenda base</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Posizione su mappa</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span><strong>5 Automazioni base</strong></span></li>
                  <li className="flex items-center gap-2 text-gray-400"><X className="h-4 w-4 text-gray-300 flex-shrink-0" /> <span>Team Inbox</span></li>
                  <li className="flex items-center gap-2 text-gray-400"><X className="h-4 w-4 text-gray-300 flex-shrink-0" /> <span>Report avanzati</span></li>
                </ul>
                <div className="mt-auto pt-4 border-t">
                  <Button className="w-full bg-green-500 hover:bg-green-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Richiedi Invito →</Button>
                  <p className="text-xs text-gray-500 mt-3 text-center">Nessuna carta richiesta</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Pilot - Piano principale (Pro) */}
            <Card className="border-2 border-coral-500 relative shadow-lg scale-105 flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap">⭐ PILOT MILANO</div>
              <CardHeader className="pt-6 pb-4">
                <CardTitle className="text-coral-500">Pro</CardTitle>
                <CardDescription>Per cliniche che vogliono crescere</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-coral-500">€0</span>
                  <span className="text-lg text-gray-400 line-through ml-2">€129/mese</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-0">
                <p className="text-xs font-medium text-gray-700 mb-3">Include tutto di Starter più:</p>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Fino a 5 utenti staff</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Pazienti illimitati</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span><strong>20 Automazioni</strong></span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Team Inbox + ticket</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Documenti + invio email</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Google Calendar sync</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> <span>Report settimanali</span></li>
                </ul>
                <div className="mt-auto pt-4 border-t">
                  <Button className="w-full bg-coral-500 hover:bg-coral-600" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
                    Richiedi Invito →
                  </Button>
                  <p className="text-xs text-gray-500 mt-3 text-center">Dopo il Pilot: €129/mese + IVA</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Custom - Piano enterprise */}
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-white to-purple-50 flex flex-col">
              <CardHeader className="pt-6 pb-4">
                <CardTitle className="text-purple-700">Custom</CardTitle>
                <CardDescription>Per cliniche che vogliono il massimo</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-purple-600">Su misura</span>
                  <p className="text-xs text-purple-500 mt-1">Contattaci per un preventivo</p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-0">
                <p className="text-xs font-medium text-gray-700 mb-3">Include tutto di Pro più:</p>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span>Utenti illimitati</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span>Multi-sede</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span><strong>44+ Automazioni complete</strong></span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span>WhatsApp Business</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span>API dedicata</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span>SLA garantito 99.9%</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500 flex-shrink-0" /> <span>Onboarding dedicato</span></li>
                </ul>
                <div className="mt-auto pt-4 border-t">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => scrollToSection('contatti')}>Richiedi Invito →</Button>
                  <p className="text-xs text-gray-500 mt-3 text-center">Prezzi IVA esclusa</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-xs text-gray-500 mt-8 mb-4">Non è una prova libera: stiamo selezionando un numero limitato di cliniche.</p>
        </div>
      </section>

      {/* Contact Form for Enterprise */}
      <section id="contatti" className="py-12 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contattaci</h2>
            <p className="text-gray-600">Hai una catena di cliniche o domande specifiche? Scrivici!</p>
          </div>
          <Card>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Grazie! Ti ricontatteremo presto a info@vetbuddy.it'); }}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-name">Nome e Cognome</Label>
                    <Input id="contact-name" placeholder="Mario Rossi" required />
                  </div>
                  <div>
                    <Label htmlFor="contact-clinic">Nome Clinica</Label>
                    <Input id="contact-clinic" placeholder="Clinica Veterinaria Roma" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" placeholder="mario@clinica.it" required />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Telefono (opzionale)</Label>
                  <Input id="contact-phone" type="tel" placeholder="+39 02 1234567" />
                </div>
                <div>
                  <Label htmlFor="contact-message">Messaggio</Label>
                  <Textarea id="contact-message" placeholder="Descrivi le tue esigenze o domande..." rows={4} required />
                </div>
                <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">
                  <Send className="h-4 w-4 mr-2" />Invia messaggio
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-gray-900 mb-4">Domande frequenti</h2></div>
          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: 'Cos\'è il Pilot e come funziona l\'invito?', a: 'vetbuddy è in fase Pilot a Milano. L\'accesso è su invito per garantire qualità e supporto dedicato. Candidati compilando il form e ti contatteremo per l\'attivazione.' },
              { q: 'Quanto dura il Pilot gratuito?', a: '90 giorni iniziali gratuiti per tutte le cliniche selezionate nel Pilot Milano. Estendibile fino a 6 mesi per le cliniche più attive che completano l\'onboarding e forniscono feedback. Al termine, potrai scegliere il piano più adatto alle tue esigenze (a partire da €129/mese + IVA).' },
              { q: 'Quanto costa per i proprietari?', a: 'vetbuddy è e sarà sempre gratuito per i proprietari di animali. Nessun costo nascosto, mai.' },
              { q: 'Come funziona la fatturazione?', a: 'Gli abbonamenti vengono fatturati da vetbuddy. Prezzi IVA esclusa. Riceverai report e riconciliazione mensile. Puoi disdire in qualsiasi momento.' },
              { q: 'Cosa include il piano Pro?', a: 'Team inbox con assegnazione ticket, documenti con invio automatico via email, sync Google Calendar, video-consulti, reminder automatici, pagamenti integrati, reportistica completa e supporto prioritario.' },
              { q: 'Come funziona l\'invio documenti?', a: 'Carichi un PDF (referto, prescrizione, fattura), selezioni cliente e animale, e il documento viene inviato automaticamente via email. Il cliente lo ritrova anche nell\'app.' },
              { q: 'I documenti sono sicuri?', a: 'Sì. I documenti sono crittografati, accessibili solo dalla clinica e dal proprietario autorizzato. Rispettiamo GDPR e normative privacy.' },
              { q: 'Posso esplorare l\'app prima di candidarmi?', a: 'Sì! Registrati come proprietario per esplorare la demo. Vedrai le funzionalità ma nota: le cliniche nell\'app demo non sono ancora affiliate realmente.' },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-lg px-6 border">
                <AccordionTrigger className="text-left font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA - Invita la tua clinica */}
      <section className="py-10 px-4 bg-gradient-to-r from-coral-500 to-orange-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Pilot Milano</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Non trovi la tua clinica?</h2>
          <p className="text-coral-100 mb-8 text-lg">Siamo in fase pilot a Milano. Invita il tuo veterinario a unirsi a vetbuddy!</p>
          <Button size="lg" className="bg-white text-coral-500 hover:bg-coral-50 h-14 px-8 text-lg" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
            <Mail className="h-5 w-5 mr-2" />Invita la tua clinica
          </Button>
        </div>
      </section>

      {/* Footer - Semplificato */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <NewBrandLogo size="xs" className="text-white [&>div:last-child>span]:text-white" />
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span>🏙️ Pilot Milano</span>
              <span>•</span>
              <span>🇮🇹 Made in Italy</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-white">Privacy</a>
              <a href="/termini" className="hover:text-white">Termini</a>
              <a href="/cookie-policy" className="hover:text-white">Cookie</a>
              <a href="mailto:info@vetbuddy.it" className="hover:text-white">info@vetbuddy.it</a>
            </div>
          </div>
          <p className="text-center text-gray-500 text-xs mt-4">© 2026 vetbuddy. Tutti i diritti riservati.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          {pendingAction && (
            <div className="bg-coral-50 border border-coral-200 rounded-lg p-3 mb-4">
              <p className="text-coral-700 text-sm font-medium">{getActionMessage()}</p>
            </div>
          )}
          <AuthForm mode={authMode} setMode={setAuthMode} onLogin={(user) => { setShowAuth(false); onLogin(user); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== LANDING PAGE WRAPPER (Switch) ====================
// Set NEXT_PUBLIC_COMING_SOON=true in .env to show Coming Soon page
// Set NEXT_PUBLIC_COMING_SOON=false (or remove) to show Full Landing Page
function LandingPage({ onLogin }) {
  const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === 'true';
  
  if (isComingSoon) {
    return <ComingSoonLanding onLogin={onLogin} />;
  }
  return (
    <>
      <FullLandingPage onLogin={onLogin} />
      <ChatWidget />
    </>
  );
}

// ==================== CLINIC LAB ANALYSIS ====================
function ClinicDashboard({ user, onLogout, emailAction, onClearEmailAction }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [staff, setStaff] = useState([]);
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [rewards, setRewards] = useState([]); // Premi assegnati
  const [labReportsReady, setLabReportsReady] = useState(0); // Notifica referti pronti
  const [setupProgress, setSetupProgress] = useState({ payments: false, video: false, team: false, automations: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Stati per aprire pet/owner da altre sezioni
  const [selectedPetFromOwner, setSelectedPetFromOwner] = useState(null);
  const [selectedOwnerFromPet, setSelectedOwnerFromPet] = useState(null);
  
  // Funzioni callback per navigazione tra pet e owner
  const handleOpenPetFromOwner = (pet) => {
    setSelectedPetFromOwner(pet);
    setActiveTab('patients');
  };
  
  const handleOpenOwnerFromPet = (owner) => {
    setSelectedOwnerFromPet(owner);
    setActiveTab('owners');
  };
  
  // Handle email action parameters for clinic
  useEffect(() => {
    if (emailAction && emailAction.action) {
      switch (emailAction.action) {
        case 'message':
          setActiveTab('messages');
          break;
        default:
          break;
      }
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
      
      // Load lab reports count separately - MUST succeed for badge
      const labReqs = await api.get('lab-requests').catch(err => {
        console.error('Failed to load lab requests:', err);
        return [];
      });
      const reportsReady = Array.isArray(labReqs) ? labReqs.filter(r => r.status === 'report_ready').length : 0;
      console.log('Lab reports ready count:', reportsReady, 'from', labReqs?.length || 0, 'requests');
      setLabReportsReady(reportsReady);
      
      // Calculate setup progress
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
      {badge > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">{badge}</span>
      )}
    </button>
  );

  const unreadMessages = messages.filter(m => !m.read).length;
  const pendingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'requested').length;
  const newReviews = 0; // TODO: track read status for reviews
  const completedSteps = Object.values(setupProgress).filter(Boolean).length;
  const totalSteps = 4;

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
            <div className="mb-2"><RoleBadge role="clinic" /></div>
            <Badge variant="outline" className="mb-4 justify-center text-amber-600 border-amber-300 bg-amber-50 w-full"><AlertCircle className="h-3 w-3 mr-1" /> Modalità Pilot</Badge>
            <nav className="space-y-1">
              <NavItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
              <NavItem icon={Calendar} label="Agenda" value="agenda" badge={pendingAppointments} />
              <NavItem icon={Inbox} label="Team Inbox" value="inbox" badge={unreadMessages} />
              <NavItem icon={FileText} label="Documenti" value="documents" />
              <NavItem icon={FolderArchive} label="Archivio Clinica" value="archive" />
              <NavItem icon={CalendarDays} label="Eventi" value="events" />
              <NavItem icon={Stethoscope} label="Servizi" value="services" />
              <NavItem icon={PawPrint} label="Pazienti" value="patients" />
              <NavItem icon={FlaskConical} label="Analisi Lab" value="labanalysis" badge={labReportsReady} />
              <NavItem icon={Globe} label="Marketplace Lab" value="labmarketplace" />
              <NavItem icon={User} label="Proprietari" value="owners" />
              <NavItem icon={Users} label="Staff" value="staff" />
              <NavItem icon={Receipt} label="Fatturazione" value="invoicing" />
              <NavItem icon={TrendingUp} label="Report" value="reports" />
              <NavItem icon={Star} label="Recensioni" value="reviews" />
              <NavItem icon={Gift} label="Premi Fedeltà" value="rewards" />
              <NavItem icon={ClipboardList} label="Template" value="templates" />
              <NavItem icon={Zap} label="Automazioni" value="automations" />
              <div className="border-t my-2"></div>
              <NavItem icon={MessageCircle} label="Feedback" value="feedback" />
              <NavItem icon={Settings} label="Impostazioni" value="settings" />
              <NavItem icon={BookOpen} label="Tutorial" value="tutorial" />
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
              <p className="text-xs text-gray-500 truncate max-w-[100px]">{user.clinicName || 'Clinica'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-500 hover:text-red-600 hover:bg-red-50" title="Esci">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="mb-2"><RoleBadge role="clinic" /></div>
        <Badge variant="outline" className="mb-6 justify-center text-amber-600 border-amber-300 bg-amber-50"><AlertCircle className="h-3 w-3 mr-1" /> Modalità Pilot</Badge>
        
        <nav className="space-y-1 flex-1 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
          <NavItem icon={Calendar} label="Agenda" value="agenda" badge={pendingAppointments} />
          <NavItem icon={Inbox} label="Team Inbox" value="inbox" badge={unreadMessages} />
          <NavItem icon={FileText} label="Documenti" value="documents" />
          <NavItem icon={FolderArchive} label="Archivio Clinica" value="archive" />
          <NavItem icon={CalendarDays} label="Eventi" value="events" />
          <NavItem icon={Stethoscope} label="Servizi" value="services" />
          <NavItem icon={Video} label="Video Consulto" value="videoconsult" />
          <NavItem icon={PawPrint} label="Pazienti" value="patients" />
          <NavItem icon={FlaskConical} label="Analisi Lab" value="labanalysis" badge={labReportsReady} />
          <NavItem icon={Globe} label="Marketplace Lab" value="labmarketplace" />
          <NavItem icon={User} label="Proprietari" value="owners" />
          <NavItem icon={Users} label="Staff" value="staff" />
          <NavItem icon={Receipt} label="Fatturazione" value="invoicing" />
          <NavItem icon={TrendingUp} label="Report" value="reports" />
          <NavItem icon={Star} label="Recensioni" value="reviews" />
          <NavItem icon={Gift} label="Premi Fedeltà" value="rewards" />
          <NavItem icon={ClipboardList} label="Template" value="templates" />
          <NavItem icon={Zap} label="Automazioni" value="automations" />
          <div className="border-t my-2"></div>
          <NavItem icon={MessageCircle} label="Feedback" value="feedback" />
          <NavItem icon={Settings} label="Impostazioni" value="settings" />
          <NavItem icon={BookOpen} label="Tutorial" value="tutorial" />
        </nav>
      </aside>

      {/* Main */}
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
        {activeTab === 'templates' && <ClinicTemplates owners={owners} pets={pets} staff={staff} appointments={appointments} user={user} onNavigate={setActiveTab} />}
        {activeTab === 'automations' && <ClinicAutomations user={user} onNavigate={setActiveTab} />}
        {activeTab === 'archive' && <ClinicArchive user={user} />}
        {activeTab === 'events' && <ClinicEvents user={user} />}
        {activeTab === 'settings' && <ClinicSettings user={user} onNavigate={setActiveTab} />}
        {activeTab === 'feedback' && <ClinicFeedbackPage user={user} />}
        {activeTab === 'tutorial' && <ClinicTutorialInline />}
      </main>
    </div>
  );
}

// ==================== CONTROL ROOM DASHBOARD ====================
function ClinicControlRoom({ appointments, documents, messages, owners, pets, rewards, setupProgress, onRefresh, onNavigate, onOpenPet }) {
  const [selectedPetPopup, setSelectedPetPopup] = useState(null);
  
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const videoAppts = todayAppts.filter(a => a.type === 'videoconsulto');
  const unreadMessages = messages.filter(m => !m.read).length;
  const newFromClients = documents.filter(d => d.fromClient).length + messages.filter(m => !m.read && m.fromClient).length;
  
  // Premi attivi (disponibili o pending)
  const activeRewards = rewards?.filter(r => r.status === 'available' || r.status === 'pending') || [];
  const pendingRewards = rewards?.filter(r => r.status === 'pending') || [];
  
  const completedSteps = Object.values(setupProgress).filter(Boolean).length;
  const progressPercent = (completedSteps / 4) * 100;

  // Helper per trovare un pet dall'appuntamento
  const getPetFromAppointment = (appt) => {
    return pets?.find(p => p.id === appt.petId) || null;
  };
  
  // Helper per trovare un owner
  const getOwnerFromPet = (pet) => {
    return owners?.find(o => o.id === pet?.ownerId) || null;
  };

  // Workflow data
  const docsToReview = documents.filter(d => d.status === 'to_review').length || 2;
  const followUps = messages.filter(m => m.type === 'follow_up' && !m.read).length || 1;
  const docsToSend = documents.filter(d => !d.emailSent).length || 3;

  // Monthly stats for mini report widget
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyAppts = appointments.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const newClientsThisMonth = owners?.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length || 0;
  const monthlyRevenue = monthlyAppts.reduce((sum, a) => sum + (a.price || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buongiorno! 👋</h1>
        <p className="text-gray-500">Ecco cosa devi fare oggi</p>
      </div>

      {/* Tutorial Box per Cliniche */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <PlayCircle className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">📚 Tutorial per Cliniche</h3>
            <p className="text-sm text-gray-600 mb-2">
              Scopri tutte le funzionalità di vetbuddy per gestire al meglio la tua clinica.
            </p>
            <button onClick={() => onNavigate('tutorial')} className="inline-flex items-center gap-1 text-purple-600 font-medium text-sm hover:underline">
              <PlayCircle className="h-4 w-4" /> Guarda il tutorial
            </button>
          </div>
        </div>
      </div>

      {/* Setup Bar - Onboarding */}
      {completedSteps < 4 && (
        <Card className="bg-gradient-to-r from-coral-50 to-orange-50 border-coral-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-coral-500" />
                <span className="font-medium">Completa la configurazione</span>
              </div>
              <span className="text-sm text-gray-500">{completedSteps}/4 completati</span>
            </div>
            <Progress value={progressPercent} className="h-2 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SetupStep icon={CreditCard} label="Pagamenti" desc="Collega Stripe" done={setupProgress.payments} onClick={() => onNavigate('settings')} />
              <SetupStep icon={Video} label="Video consulto" desc="Attiva e configura prezzi" done={setupProgress.video} onClick={() => onNavigate('services')} />
              <SetupStep icon={Users} label="Team" desc="Aggiungi staff" done={setupProgress.team} onClick={() => onNavigate('staff')} />
              <SetupStep icon={Bell} label="Automazioni" desc="Promemoria auto" done={setupProgress.automations} onClick={() => onNavigate('automations')} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard icon={Calendar} label="Appuntamenti oggi" value={todayAppts.length} color="coral" onClick={() => onNavigate('agenda')} />
        <KPICard icon={Video} label="Video visite oggi" value={videoAppts.length} color="blue" highlight={videoAppts[0]?.time} onClick={() => onNavigate('agenda')} />
        <KPICard icon={MessageCircle} label="Messaggi in attesa" value={unreadMessages} color="amber" onClick={() => onNavigate('inbox')} />
        <KPICard icon={FileText} label="Nuovi da clienti" value={newFromClients} color="green" onClick={() => onNavigate('documents')} />
        <KPICard 
          icon={Gift} 
          label="Premi attivi" 
          value={activeRewards.length} 
          color="yellow" 
          highlight={pendingRewards.length > 0 ? `${pendingRewards.length} da confermare` : null}
          onClick={() => onNavigate('rewards')} 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Workflow 3 Steps */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-coral-500" />
            Flusso di lavoro
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Step 1: Prepara */}
            <WorkflowCard 
              step="1" 
              title="Prepara" 
              icon={FileCheck}
              color="blue"
              items={[
                { label: 'Documenti pre-visita', count: docsToReview, action: 'Consulta' }
              ]}
              onClick={() => onNavigate('documents')}
            />
            
            {/* Step 2: Visita */}
            <WorkflowCard 
              step="2" 
              title="Visita" 
              icon={Stethoscope}
              color="coral"
              items={[
                { label: 'Video-visite oggi', count: videoAppts.length, action: 'Avvia', highlight: true }
              ]}
              nextVideo={videoAppts[0]}
              onClick={() => onNavigate('agenda')}
            />
            
            {/* Step 3: Concludi */}
            <WorkflowCard 
              step="3" 
              title="Concludi" 
              icon={SendHorizontal}
              color="green"
              items={[
                { label: 'Follow-up da fare', count: followUps },
                { label: 'Documenti da inviare', count: docsToSend, action: 'Invia' }
              ]}
              onClick={() => onNavigate('documents')}
            />
          </div>

          {/* Today's Schedule */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-coral-500" />
                Agenda di oggi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppts.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">Nessun appuntamento oggi</p>
              ) : (
                <div className="space-y-2">
                  {todayAppts.slice(0, 5).map((appt, i) => {
                    const pet = getPetFromAppointment(appt);
                    return (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          const pet = getPetFromAppointment(appt);
                          if (pet) {
                            setSelectedPetPopup(pet);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${appt.type === 'videoconsulto' ? 'bg-blue-100' : 'bg-coral-100'}`}>
                            {appt.type === 'videoconsulto' ? <Video className="h-5 w-5 text-blue-600" /> : <PawPrint className="h-5 w-5 text-coral-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{appt.petName}</p>
                            <p className="text-xs text-gray-500">{appt.ownerName} • {appt.reason || appt.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{appt.time}</Badge>
                          {appt.type === 'videoconsulto' && appt.videoLink && (
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white h-8" onClick={(e) => { e.stopPropagation(); window.open(appt.videoLink, '_blank'); }}>
                              <PlayCircle className="h-3 w-3 mr-1" />Avvia
                            </Button>
                          )}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Quick Actions */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-coral-500" />
            Azioni rapide
          </h2>

          {/* Next Video Visit */}
          {videoAppts.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Video className="h-4 w-4" />
                  <span className="text-sm font-medium">Prossimo video consulto</span>
                </div>
                <p className="font-semibold">{videoAppts[0].petName}</p>
                <p className="text-sm text-gray-600">{videoAppts[0].ownerName}</p>
                <p className="text-sm text-blue-600 font-medium mt-1">Ore {videoAppts[0].time}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedPetPopup(getPetFromAppointment(videoAppts[0]))}>Prepara</Button>
                  <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={() => videoAppts[0].videoLink && window.open(videoAppts[0].videoLink, '_blank')}>
                    <PlayCircle className="h-3 w-3 mr-1" />Avvia
                  </Button>
                </div>
                {videoAppts[0].videoLink && (
                  <p className="text-xs text-blue-500 mt-2 truncate">Link: {videoAppts[0].videoLink}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Mini Inbox */}
          <Card className="cursor-pointer hover:shadow-md transition" onClick={() => onNavigate('inbox')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2"><Inbox className="h-4 w-4" />Inbox</span>
                {unreadMessages > 0 && <Badge className="bg-coral-500">{unreadMessages}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {unreadMessages === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">Nessun messaggio</p>
              ) : (
                <div className="space-y-2">
                  {messages.filter(m => !m.read).slice(0, 3).map((msg, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium truncate">{msg.subject || 'Nuovo messaggio'}</p>
                      <p className="text-xs text-gray-500 truncate">{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="ghost" className="w-full mt-2 text-coral-500" size="sm">Vai all'Inbox <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </CardContent>
          </Card>

          {/* Mini Documents */}
          <Card className="cursor-pointer hover:shadow-md transition" onClick={() => onNavigate('documents')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" />Documenti</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-blue-50 rounded">
                  <p className="text-lg font-bold text-blue-600">{docsToReview}</p>
                  <p className="text-xs text-gray-500">Da consultare</p>
                </div>
                <div className="p-2 bg-coral-50 rounded">
                  <p className="text-lg font-bold text-coral-600">{docsToSend}</p>
                  <p className="text-xs text-gray-500">Da inviare</p>
                </div>
              </div>
              <Button variant="ghost" className="w-full mt-2 text-coral-500" size="sm">Gestisci <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </CardContent>
          </Card>

          {/* Monthly Summary Widget */}
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-green-200 cursor-pointer hover:shadow-md transition" onClick={() => onNavigate('reports')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                <TrendingUp className="h-4 w-4" />Questo mese
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nuovi clienti</span>
                  <span className="font-semibold text-green-700">{newClientsThisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Appuntamenti</span>
                  <span className="font-semibold text-green-700">{monthlyAppts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Incassi tracciati</span>
                  <span className="font-semibold text-green-700">€{monthlyRevenue}</span>
                </div>
              </div>
              <Button variant="ghost" className="w-full mt-3 text-green-600" size="sm">
                Apri Report <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Dettaglio Animale - Dashboard */}
      <Dialog open={!!selectedPetPopup} onOpenChange={() => setSelectedPetPopup(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center">
                <PawPrint className="h-6 w-6 text-coral-600" />
              </div>
              <div>
                <p className="text-xl">{selectedPetPopup?.name}</p>
                <p className="text-sm text-gray-500 font-normal">{selectedPetPopup?.breed || selectedPetPopup?.species}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedPetPopup && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Specie</p>
                  <p className="font-medium">{selectedPetPopup.species === 'dog' ? '🐕 Cane' : selectedPetPopup.species === 'cat' ? '🐱 Gatto' : selectedPetPopup.species || 'Altro'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Razza</p>
                  <p className="font-medium">{selectedPetPopup.breed || 'N/D'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Età</p>
                  <p className="font-medium">{selectedPetPopup.birthDate ? `${Math.floor((new Date() - new Date(selectedPetPopup.birthDate)) / (365.25 * 24 * 60 * 60 * 1000))} anni` : 'N/D'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Peso</p>
                  <p className="font-medium">{selectedPetPopup.weight ? `${selectedPetPopup.weight} kg` : 'N/D'}</p>
                </div>
              </div>
              
              {/* Owner Info */}
              {(() => {
                const owner = getOwnerFromPet(selectedPetPopup);
                return owner && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-blue-600 font-medium mb-2">👤 Proprietario</p>
                    <p className="font-medium">{owner.name}</p>
                    {owner.email && <p className="text-sm text-gray-600 flex items-center gap-2 mt-1"><Mail className="h-3 w-3" />{owner.email}</p>}
                    {owner.phone && <p className="text-sm text-gray-600 flex items-center gap-2 mt-1"><Phone className="h-3 w-3" />{owner.phone}</p>}
                  </div>
                );
              })()}

              {selectedPetPopup.microchip && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Microchip</p>
                  <p className="font-mono font-medium">{selectedPetPopup.microchip}</p>
                </div>
              )}
              
              {(selectedPetPopup.allergies || selectedPetPopup.chronicDiseases) && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-600 font-medium">⚠️ Condizioni Mediche</p>
                  {selectedPetPopup.allergies && <p className="text-sm mt-1"><strong>Allergie:</strong> {selectedPetPopup.allergies}</p>}
                  {selectedPetPopup.chronicDiseases && <p className="text-sm mt-1"><strong>Patologie:</strong> {selectedPetPopup.chronicDiseases}</p>}
                </div>
              )}
              
              {selectedPetPopup.medications && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-amber-600 font-medium">💊 Farmaci in corso</p>
                  <p className="text-sm mt-1">{selectedPetPopup.medications}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setSelectedPetPopup(null); onOpenPet && onOpenPet(selectedPetPopup); }}>
                  Apri scheda completa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Back to Dashboard Button Component
function BackToDashboard({ onNavigate }) {
  return (
    <button 
      onClick={() => onNavigate('dashboard')}
      className="flex items-center gap-2 text-gray-500 hover:text-coral-600 transition mb-4 group"
    >
      <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm font-medium">Torna alla Dashboard</span>
    </button>
  );
}

// Setup Step Component
function SetupStep({ icon: Icon, label, desc, done, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg border transition w-full ${done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-coral-300 hover:bg-coral-50 cursor-pointer'}`}
    >
      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${done ? 'bg-green-100' : 'bg-coral-100'}`}>
        {done ? <Check className="h-4 w-4 text-green-600" /> : <Icon className="h-4 w-4 text-coral-500" />}
      </div>
      <div className="text-left flex-1">
        <p className={`text-sm font-medium ${done ? 'text-green-700' : ''}`}>{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      {!done && <ChevronRight className="h-4 w-4 text-gray-400" />}
    </button>
  );
}

// KPI Card Component
function KPICard({ icon: Icon, label, value, color, highlight, onClick }) {
  const colors = {
    coral: 'bg-coral-100 text-coral-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
  };
  return (
    <Card className={onClick ? 'cursor-pointer hover:shadow-md transition' : ''} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
            {highlight && <p className="text-xs text-coral-500 font-medium">Prossima: {highlight}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Workflow Card Component
function WorkflowCard({ step, title, icon: Icon, color, items, nextVideo, onClick }) {
  const colors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', badge: 'bg-blue-500' },
    coral: { bg: 'bg-coral-50', border: 'border-coral-200', icon: 'bg-coral-100 text-coral-600', badge: 'bg-coral-500' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-100 text-green-600', badge: 'bg-green-500' },
  };
  const c = colors[color];

  return (
    <Card className={`${c.bg} ${c.border} ${onClick ? 'cursor-pointer hover:shadow-md transition' : ''}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`h-6 w-6 rounded-full ${c.icon} flex items-center justify-center text-xs font-bold`}>{step}</div>
          <span className="font-medium">{title}</span>
          <Icon className={`h-4 w-4 ml-auto ${c.icon.split(' ')[1]}`} />
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.label}</span>
              <div className="flex items-center gap-2">
                <Badge className={`${item.highlight ? c.badge : 'bg-gray-200 text-gray-700'} text-xs`}>{item.count}</Badge>
                {item.action && <Button size="sm" variant="ghost" className="h-6 text-xs">{item.action}</Button>}
              </div>
            </div>
          ))}
        </div>
        {nextVideo && (
          <div className="mt-3 pt-3 border-t border-current/10">
            <p className="text-xs text-gray-500">Prossima: <strong>{nextVideo.petName}</strong> ore {nextVideo.time}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Clinic Agenda
function ClinicInbox({ messages, owners, pets, onRefresh, onNavigate }) {
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [filter, setFilter] = useState('all');
  const filteredMessages = messages.filter(m => { if (filter === 'unread') return !m.read; if (filter === 'assigned') return m.assignedTo; return true; });

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-2xl font-bold text-gray-800">Team Inbox</h2><p className="text-gray-500 text-sm">Gestisci messaggi e richieste</p></div>
        <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tutti</SelectItem><SelectItem value="unread">Non letti</SelectItem><SelectItem value="assigned">Assegnati</SelectItem></SelectContent></Select>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1"><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-500">TICKET ({filteredMessages.length})</CardTitle></CardHeader><CardContent className="p-0"><ScrollArea className="h-[500px]">{filteredMessages.length === 0 ? <div className="p-6 text-center text-gray-500"><Inbox className="h-8 w-8 mx-auto mb-2 text-gray-300" /><p className="text-sm">Nessun messaggio</p></div> : filteredMessages.map((msg) => <div key={msg.id} onClick={() => setSelectedMsg(msg)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedMsg?.id === msg.id ? 'bg-coral-50 border-l-4 border-l-coral-500' : ''} ${!msg.read ? 'bg-blue-50' : ''}`}><div className="flex items-start justify-between"><div className="flex-1 min-w-0"><p className={`font-medium text-sm truncate ${!msg.read ? 'text-blue-700' : ''}`}>{msg.subject || 'Nuovo messaggio'}</p><p className="text-xs text-gray-500 truncate mt-1">{msg.content}</p></div></div><p className="text-xs text-gray-400 mt-2">{new Date(msg.createdAt).toLocaleDateString()}</p></div>)}</ScrollArea></CardContent></Card>
        <Card className="lg:col-span-2">{selectedMsg ? <><CardHeader className="border-b"><div className="flex items-start justify-between"><div><CardTitle className="text-lg">{selectedMsg.subject || 'Messaggio'}</CardTitle><CardDescription className="mt-1">Da: Proprietario</CardDescription></div><div className="flex items-center gap-2"><Button size="sm"><UserCheck className="h-4 w-4 mr-1" />Prendi in carico</Button><Button size="sm" variant="outline"><CheckCircle className="h-4 w-4 mr-1" />Risolvi</Button></div></div></CardHeader><CardContent className="p-6"><div className="bg-gray-50 rounded-lg p-4 mb-6"><div className="grid grid-cols-3 gap-4 text-sm"><div><span className="text-gray-500">Stato:</span> <Badge variant="outline">{selectedMsg.status || 'Aperto'}</Badge></div><div><span className="text-gray-500">Creato:</span> {new Date(selectedMsg.createdAt).toLocaleString()}</div><div><span className="text-gray-500">Assegnato:</span> {selectedMsg.assignedTo || '—'}</div></div></div><div className="prose prose-sm max-w-none"><p>{selectedMsg.content}</p></div></CardContent></> : <CardContent className="flex items-center justify-center h-[500px] text-gray-500"><div className="text-center"><Ticket className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Seleziona un ticket</p></div></CardContent>}</Card>
      </div>
    </div>
  );
}

// Document Upload Form
function ClinicOwners({ owners, onRefresh, onNavigate, pets = [], onOpenPet, initialOwner, onClearInitialOwner }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Apri automaticamente il proprietario se viene passato da un altro componente
  useEffect(() => {
    if (initialOwner) {
      openOwnerDetails(initialOwner);
      if (onClearInitialOwner) onClearInitialOwner();
    }
  }, [initialOwner]);
  
  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('owners', formData); setShowDialog(false); onRefresh(); } catch (error) { alert(error.message); } };
  
  const openOwnerDetails = (owner) => {
    setSelectedOwner(owner);
    setShowDetailDialog(true);
  };
  
  const getOwnerPets = (ownerId) => {
    return pets.filter(p => p.ownerId === ownerId);
  };
  
  // Filtra i proprietari per la ricerca
  const filteredOwners = owners.filter(owner => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const ownerPets = getOwnerPets(owner.id);
    const petNames = ownerPets.map(p => p.name?.toLowerCase() || '').join(' ');
    return (
      owner.name?.toLowerCase().includes(query) ||
      owner.email?.toLowerCase().includes(query) ||
      owner.phone?.toLowerCase().includes(query) ||
      petNames.includes(query)
    );
  });
  
  const handlePetClick = (pet) => {
    if (onOpenPet) {
      setShowDetailDialog(false);
      onOpenPet(pet);
    }
  };
  
  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Proprietari</h2>
          <p className="text-gray-500 text-sm">Clienti della clinica - clicca per vedere i dettagli</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Aggiungi</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo proprietario</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
              <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
              <div><Label>Telefono</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
              <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Barra di ricerca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Cerca per nome, email, telefono o animale..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            {filteredOwners.length} risultat{filteredOwners.length === 1 ? 'o' : 'i'} per "{searchQuery}"
          </p>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOwners.length === 0 ? (
          <Card className="col-span-full"><CardContent className="p-12 text-center text-gray-500"><User className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>{searchQuery ? 'Nessun risultato trovato' : 'Nessun proprietario'}</p></CardContent></Card>
        ) : filteredOwners.map((owner) => {
          const ownerPets = getOwnerPets(owner.id);
          return (
            <Card key={owner.id} className="cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group" onClick={() => openOwnerDetails(owner)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{owner.name}</p>
                    <p className="text-sm text-gray-500">{owner.email}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
                {owner.phone && <p className="text-sm text-gray-500 mt-3 flex items-center gap-2"><Phone className="h-4 w-4" />{owner.phone}</p>}
                {ownerPets.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {ownerPets.slice(0, 3).map(pet => (
                      <Badge key={pet.id} variant="outline" className="text-xs">
                        {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'} {pet.name}
                      </Badge>
                    ))}
                    {ownerPets.length > 3 && <Badge variant="outline" className="text-xs">+{ownerPets.length - 3}</Badge>}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Detail Modal */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              {selectedOwner?.name || 'Dettagli Proprietario'}
            </DialogTitle>
            <DialogDescription>Scheda cliente</DialogDescription>
          </DialogHeader>
          
          {selectedOwner && (
            <div className="space-y-4 mt-4">
              {/* Contatti */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{selectedOwner.email}</p>
                  </div>
                </div>
                {selectedOwner.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Telefono</p>
                      <p className="font-medium">{selectedOwner.phone}</p>
                    </div>
                  </div>
                )}
                {selectedOwner.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Indirizzo</p>
                      <p className="font-medium">{selectedOwner.address}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Animali del proprietario - Cliccabili */}
              {(() => {
                const ownerPets = getOwnerPets(selectedOwner.id);
                if (ownerPets.length === 0) return null;
                return (
                  <div>
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <PawPrint className="h-4 w-4" /> Animali ({ownerPets.length})
                    </p>
                    <div className="space-y-2">
                      {ownerPets.map(pet => (
                        <div 
                          key={pet.id} 
                          className="flex items-center gap-3 p-3 bg-coral-50 rounded-lg cursor-pointer hover:bg-coral-100 transition-colors"
                          onClick={() => handlePetClick(pet)}
                        >
                          <div className="h-10 w-10 bg-coral-100 rounded-full flex items-center justify-center">
                            {pet.species === 'dog' ? <Dog className="h-5 w-5 text-coral-600" /> : pet.species === 'cat' ? <Cat className="h-5 w-5 text-coral-600" /> : <PawPrint className="h-5 w-5 text-coral-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{pet.name}</p>
                            <p className="text-xs text-gray-500">{pet.breed || (pet.species === 'dog' ? 'Cane' : pet.species === 'cat' ? 'Gatto' : 'Altro')}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              
              {/* Data registrazione */}
              {selectedOwner.createdAt && (
                <p className="text-xs text-gray-400 text-center pt-2 border-t">
                  Cliente dal {new Date(selectedOwner.createdAt).toLocaleDateString('it-IT')}
                </p>
              )}
              
              {/* Quick Actions */}
              <div className="flex gap-2 pt-2 flex-wrap">
                <Button variant="outline" className="flex-1 min-w-[100px]" onClick={() => window.location.href = `mailto:${selectedOwner.email}`}>
                  <Mail className="h-4 w-4 mr-2" /> Email
                </Button>
                {selectedOwner.phone && (
                  <>
                    <Button variant="outline" className="flex-1 min-w-[100px]" onClick={() => window.location.href = `tel:${selectedOwner.phone}`}>
                      <Phone className="h-4 w-4 mr-2" /> Chiama
                    </Button>
                    <Button variant="outline" className="flex-1 min-w-[100px] text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => window.open(`https://wa.me/${selectedOwner.phone.replace(/\s+/g, '').replace(/^\+/, '')}`, '_blank')}>
                      <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClinicStaff({ staff, onRefresh, onNavigate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'vet', email: '', phone: '', canLogin: false, password: '' });
  
  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    try { 
      await api.post('staff', formData); 
      setShowDialog(false); 
      setFormData({ name: '', role: 'vet', email: '', phone: '', canLogin: false, password: '' });
      onRefresh(); 
    } catch (error) { alert(error.message); } 
  };

  const roleLabels = { 
    vet: { label: 'Veterinario', color: 'bg-blue-100 text-blue-700', icon: Stethoscope },
    assistant: { label: 'Assistente', color: 'bg-green-100 text-green-700', icon: User },
    receptionist: { label: 'Receptionist', color: 'bg-purple-100 text-purple-700', icon: Phone },
    admin: { label: 'Amministrativo', color: 'bg-amber-100 text-amber-700', icon: Receipt }
  };

  const rolePermissions = {
    vet: ['visite', 'documenti', 'pazienti', 'messaggi'],
    assistant: ['visite', 'pazienti', 'messaggi'],
    receptionist: ['agenda', 'messaggi', 'proprietari'],
    admin: ['documenti', 'fatture', 'report', 'pagamenti']
  };

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Staff</h2>
          <p className="text-gray-500 text-sm">Gestisci il team della clinica</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-coral-500 hover:bg-coral-600"><Plus className="h-4 w-4 mr-2" />Aggiungi membro</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuovo membro staff</DialogTitle>
              <DialogDescription>Aggiungi un membro al team della clinica</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label>Nome completo *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Dr. Mario Rossi" />
              </div>
              
              <div>
                <Label>Ruolo *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vet">
                      <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-blue-600" />Veterinario</div>
                    </SelectItem>
                    <SelectItem value="assistant">
                      <div className="flex items-center gap-2"><User className="h-4 w-4 text-green-600" />Assistente</div>
                    </SelectItem>
                    <SelectItem value="receptionist">
                      <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-purple-600" />Receptionist</div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2"><Receipt className="h-4 w-4 text-amber-600" />Amministrativo</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'admin' && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800 font-medium">Ruolo Amministrativo</p>
                  <p className="text-xs text-amber-600 mt-1">Può caricare fatture, vedere i flussi di denaro e accedere ai report finanziari.</p>
                </div>
              )}
              
              <div>
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="email@clinica.it" />
              </div>
              
              <div>
                <Label>Telefono</Label>
                <Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Opzionale" />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Abilita accesso al portale</p>
                    <p className="text-xs text-gray-500">Il membro potrà accedere con le sue credenziali</p>
                  </div>
                  <Switch checked={formData.canLogin} onCheckedChange={(v) => setFormData({...formData, canLogin: v})} />
                </div>
                
                {formData.canLogin && (
                  <div className="mt-3">
                    <Label>Password temporanea *</Label>
                    <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required placeholder="Min. 6 caratteri" />
                    <p className="text-xs text-gray-500 mt-1">Il membro potrà cambiarla al primo accesso</p>
                  </div>
                )}
              </div>
              
              <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600">Aggiungi al team</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Nessun membro nel team</p>
              <p className="text-sm mt-2">Aggiungi veterinari, assistenti e personale amministrativo</p>
            </CardContent>
          </Card>
        ) : staff.map((member) => {
          const roleInfo = roleLabels[member.role] || roleLabels.assistant;
          const RoleIcon = roleInfo.icon;
          return (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${roleInfo.color.split(' ')[0]}`}>
                      <RoleIcon className={`h-6 w-6 ${roleInfo.color.split(' ')[1]}`} />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                    </div>
                  </div>
                  {member.canLogin && (
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />Accesso attivo
                    </Badge>
                  )}
                </div>
                {member.email && (
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />{member.email}
                  </p>
                )}
                {member.role === 'admin' && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Receipt className="h-3 w-3" />Accesso a: Fatture, Report, Pagamenti
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

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
                Stai esplorando vetbuddy in modalità demo. Le cliniche del pilot verranno attivate a breve a Milano. 
                Nel frattempo, <button onClick={() => setActiveTab('inviteClinic')} className="text-coral-600 font-medium underline">invita la tua clinica</button> per accelerare l'attivazione!
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

// ==================== MAIN APP ====================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [googleOAuthResult, setGoogleOAuthResult] = useState(null);
  const [emailAction, setEmailAction] = useState(null);
  const [verificationState, setVerificationState] = useState(null); // For email/phone verification flow
  const [resetPasswordToken, setResetPasswordToken] = useState(null); // For password reset flow

  // Save email action params to sessionStorage for after login
  useEffect(() => { 
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      // Password reset handling
      const resetToken = params.get('reset');
      if (resetToken) {
        setResetPasswordToken(resetToken);
        window.history.replaceState({}, '', window.location.pathname);
      }
      
      // Email verification handling
      const verifyEmailToken = params.get('verify_email');
      if (verifyEmailToken) {
        handleEmailVerification(verifyEmailToken);
        window.history.replaceState({}, '', window.location.pathname);
      }
      
      // Google OAuth handling
      if (params.get('google_success')) {
        setGoogleOAuthResult({ success: true, message: 'Google Calendar connesso con successo!' });
        window.history.replaceState({}, '', window.location.pathname);
      } else if (params.get('google_error')) {
        setGoogleOAuthResult({ success: false, message: 'Errore: ' + params.get('google_error') });
        window.history.replaceState({}, '', window.location.pathname);
      }
      
      // Email action handling - SAVE to sessionStorage for after login
      const action = params.get('action');
      if (action) {
        const emailActionData = {
          action: action,
          appointmentId: params.get('appointmentId'),
          clinicId: params.get('clinicId'),
          petId: params.get('petId'),
          reason: params.get('reason'),
          // New parameters for enhanced email actions
          serviceType: params.get('serviceType'),
          amount: params.get('amount'),
          docId: params.get('docId'),
          rewardId: params.get('rewardId'),
          use: params.get('use') === 'true',
          newMessage: params.get('newMessage') === 'true'
        };
        // Save to sessionStorage so it persists after login
        sessionStorage.setItem('vetbuddy_email_action', JSON.stringify(emailActionData));
        // Clear URL immediately
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
        // After successful auth, check for pending email action
        loadPendingEmailAction();
      } catch (error) { 
        localStorage.removeItem('vetbuddy_token'); 
        api.token = null; 
      } 
    }
    setLoading(false);
  };

  // Load pending email action from sessionStorage (after login)
  const loadPendingEmailAction = () => {
    if (typeof window !== 'undefined') {
      const savedAction = sessionStorage.getItem('vetbuddy_email_action');
      if (savedAction) {
        try {
          const actionData = JSON.parse(savedAction);
          setEmailAction(actionData);
          // Clear from sessionStorage after loading
          sessionStorage.removeItem('vetbuddy_email_action');
        } catch (e) {
          sessionStorage.removeItem('vetbuddy_email_action');
        }
      }
    }
  };

  const handleLogin = (userData) => { 
    setUser(userData); 
    // Load pending email action after login
    loadPendingEmailAction();
    if (!localStorage.getItem('vetbuddy_welcomed_' + userData.id)) { 
      setShowWelcome(true); 
    } 
  };

  // Handle email verification from URL
  const handleEmailVerification = async (token) => {
    setVerificationState({ status: 'verifying', message: 'Verifica email in corso...' });
    try {
      const result = await api.post('auth/verify-email', { token });
      if (result.success) {
        if (result.alreadyVerified) {
          setVerificationState({ 
            status: 'already_verified', 
            message: 'Email già verificata! Puoi accedere al tuo account.'
          });
        } else {
          setVerificationState({ 
            status: 'email_verified', 
            message: result.message,
            requiresPhoneVerification: result.requiresPhoneVerification,
            userId: result.userId
          });
        }
      }
    } catch (error) {
      setVerificationState({ 
        status: 'error', 
        message: error.message || 'Errore durante la verifica'
      });
    }
  };

  const handleWelcomeContinue = async () => { 
    localStorage.setItem('vetbuddy_welcomed_' + user.id, 'true'); 
    setShowWelcome(false);
    // For owners: check if they have pets, if not redirect to pets tab to add first pet
    if (user.role === 'owner') {
      try {
        const pets = await api.get('pets');
        if (!pets || pets.length === 0) {
          // Set flag to show add pet dialog when entering dashboard
          sessionStorage.setItem('vetbuddy_show_add_pet', 'true');
        }
      } catch (error) {
        console.error('Error checking pets:', error);
      }
    }
  };
  const handleLogout = () => { localStorage.removeItem('vetbuddy_token'); api.token = null; setUser(null); setShowWelcome(false); sessionStorage.removeItem('vetbuddy_email_action'); };

  // Show Google OAuth result toast
  useEffect(() => {
    if (googleOAuthResult) {
      alert(googleOAuthResult.success ? '✅ ' + googleOAuthResult.message : '❌ ' + googleOAuthResult.message);
      setGoogleOAuthResult(null);
    }
  }, [googleOAuthResult]);

  const clearEmailAction = () => {
    setEmailAction(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-coral-50"><div className="text-center"><NewBrandLogo size="lg" /><p className="mt-4 text-coral-700">Caricamento...</p></div></div>;
  
  // Show password reset screen if token present
  if (resetPasswordToken) {
    return <ResetPasswordScreen token={resetPasswordToken} onComplete={() => setResetPasswordToken(null)} />;
  }
  
  // Show verification screen if needed
  if (verificationState) {
    return <VerificationScreen state={verificationState} onComplete={() => setVerificationState(null)} />;
  }
  
  // Render main content with ChatWidget
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
// Mobile responsive update Wed Feb 11 18:07:23 UTC 2026
// Admin panel deploy Wed Feb 11 19:34:40 UTC 2026
// Deploy trigger: Fri Feb 13 13:39:04 UTC 2026
// Force rebuild: 1771196815

// FORCE REBUILD - This comment forces a complete recompilation
// Timestamp: 1708042400
// Version: v2-no-dog-with-paws
