'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import NewBrandLogo from '@/app/components/shared/NewBrandLogo';
import api from '@/app/lib/api';

// ==================== DYNAMIC IMPORTS ====================
// Admin & Auth
const AdminDashboard = dynamic(() => import('@/app/components/admin/AdminDashboard'), { ssr: false });
const LabDashboard = dynamic(() => import('@/app/components/lab/LabDashboard'), { ssr: false });
const StaffDashboard = dynamic(() => import('@/app/components/staff/StaffDashboard'), { ssr: false });
const WelcomeScreen = dynamic(() => import('@/app/components/onboarding/WelcomeScreen'), { ssr: false });
const ChatWidget = dynamic(() => import('@/app/components/chat/ChatWidget'), { ssr: false });
import { ResetPasswordScreen, VerificationScreen } from '@/app/components/auth';

// Landing
const ComingSoonLanding = dynamic(() => import('@/app/components/landing/ComingSoonLanding'), { ssr: false });
const FullLandingPage = dynamic(() => import('@/app/components/landing/FullLandingPage'), { ssr: false });

// Dashboard shells (estratti in componenti dedicati)
const ClinicDashboardLayout = dynamic(() => import('@/app/components/clinic/ClinicDashboardLayout'), { ssr: false });
const OwnerDashboard = dynamic(() => import('@/app/components/owner/OwnerDashboardLayout'), { ssr: false });

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
    console.log('[page.js] handleLogin called with userData:', userData);
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
    if (user.role === 'clinic') return <ClinicDashboardLayout user={user} onLogout={handleLogout} googleOAuthResult={googleOAuthResult} emailAction={emailAction} onClearEmailAction={clearEmailAction} />;
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
