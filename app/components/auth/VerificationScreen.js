'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2, Smartphone } from 'lucide-react';
import VetBuddyLogo from '@/app/components/common/VetBuddyLogo';
import api from '@/app/lib/api';

function VerificationScreen({ state, onComplete }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Inserisci un codice a 6 cifre');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await api.post('auth/verify-phone', { userId: state.userId, otp });
      if (result.success) {
        alert('✅ Account verificato con successo! Ora puoi accedere.');
        onComplete();
      }
    } catch (err) {
      setError(err.message || 'Codice non valido');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      await api.post('auth/resend-otp', { userId: state.userId });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'Errore invio OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-coral-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4"><VetBuddyLogo size={60} /></div>
          
          {state.status === 'verifying' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 text-coral-500 animate-spin" />
              </div>
              <CardTitle className="text-xl">Verifica in corso...</CardTitle>
              <CardDescription>{state.message}</CardDescription>
            </>
          )}
          
          {state.status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <CardTitle className="text-xl text-red-600">Errore di verifica</CardTitle>
              <CardDescription className="text-red-500">{state.message}</CardDescription>
            </>
          )}
          
          {state.status === 'already_verified' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-xl text-green-600">Già verificato!</CardTitle>
              <CardDescription>{state.message}</CardDescription>
            </>
          )}
          
          {state.status === 'email_verified' && !state.requiresPhoneVerification && (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-xl text-green-600">Email verificata! 🎉</CardTitle>
              <CardDescription>{state.message}</CardDescription>
            </>
          )}
          
          {state.status === 'email_verified' && state.requiresPhoneVerification && (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-xl">Email verificata! ✅</CardTitle>
              <CardDescription className="text-base">Ora verifica il tuo numero di telefono</CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent>
          {(state.status === 'error' || state.status === 'already_verified' || (state.status === 'email_verified' && !state.requiresPhoneVerification)) && (
            <Button onClick={onComplete} className="w-full bg-coral-500 hover:bg-coral-600">
              Torna alla Home
            </Button>
          )}
          
          {state.status === 'email_verified' && state.requiresPhoneVerification && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Codice OTP inviato via SMS</p>
                    <p className="text-xs text-blue-600 mt-1">Controlla gli SMS e inserisci il codice a 6 cifre</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Codice OTP</Label>
                <Input 
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>
              
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              {resendSuccess && <p className="text-green-500 text-sm text-center">✅ Nuovo codice inviato!</p>}
              
              <Button 
                onClick={handleVerifyOTP} 
                className="w-full bg-coral-500 hover:bg-coral-600"
                disabled={loading || otp.length !== 6}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? 'Verifica in corso...' : 'Verifica Telefono'}
              </Button>
              
              <div className="text-center">
                <button 
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="text-sm text-coral-500 hover:underline disabled:opacity-50"
                >
                  {resendLoading ? 'Invio in corso...' : 'Non hai ricevuto il codice? Invia di nuovo'}
                </button>
              </div>
              
              <div className="text-center pt-2">
                <button onClick={onComplete} className="text-xs text-gray-400 hover:underline">
                  Verifica più tardi
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default VerificationScreen;
