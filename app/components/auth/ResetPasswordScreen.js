'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Lock, Loader2 } from 'lucide-react';
import VetBuddyLogo from '@/app/components/common/VetBuddyLogo';
import api from '@/app/lib/api';

function ResetPasswordScreen({ token, onComplete }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await api.post('auth/reset-password', { token, newPassword });
      if (result.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Errore durante il reset della password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-coral-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4"><VetBuddyLogo size={60} /></div>
          
          {success ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-xl text-green-600">Password aggiornata! 🎉</CardTitle>
              <CardDescription>La tua password è stata reimpostata con successo.</CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-coral-100 rounded-full flex items-center justify-center">
                  <Lock className="h-8 w-8 text-coral-500" />
                </div>
              </div>
              <CardTitle className="text-xl text-coral-500">Reimposta Password</CardTitle>
              <CardDescription>Inserisci la tua nuova password</CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent>
          {success ? (
            <Button onClick={onComplete} className="w-full bg-coral-500 hover:bg-coral-600">
              Vai al Login
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nuova Password</Label>
                <Input 
                  type="password"
                  placeholder="Minimo 8 caratteri"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label>Conferma Password</Label>
                <Input 
                  type="password"
                  placeholder="Ripeti la password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              
              <Button 
                type="submit"
                className="w-full bg-coral-500 hover:bg-coral-600"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? 'Aggiornamento...' : 'Reimposta Password'}
              </Button>
              
              <div className="text-center">
                <button 
                  type="button"
                  onClick={onComplete}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Torna alla Home
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPasswordScreen;
