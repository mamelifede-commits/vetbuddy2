'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  PawPrint, Heart, Shield, Star, CheckCircle, Calendar, Users, Zap, Mail, Loader2
} from 'lucide-react';
import api from '@/app/lib/api';

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

export default ComingSoonLanding;
