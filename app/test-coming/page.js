'use client';

import { PawPrint } from 'lucide-react';

export default function TestComingSoon() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-coral-50 via-white to-cyan-50">
      {/* Zampine decorative sparse */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <PawPrint className="absolute top-[10%] left-[5%] h-16 w-16 text-coral-200/40 rotate-[-15deg]" />
        <PawPrint className="absolute top-[20%] right-[10%] h-12 w-12 text-cyan-200/40 rotate-[25deg]" />
        <PawPrint className="absolute top-[45%] left-[8%] h-10 w-10 text-rose-200/40 rotate-[10deg]" />
        <PawPrint className="absolute top-[60%] right-[5%] h-14 w-14 text-coral-200/40 rotate-[-20deg]" />
        <PawPrint className="absolute top-[75%] left-[15%] h-8 w-8 text-cyan-200/40 rotate-[35deg]" />
        <PawPrint className="absolute bottom-[15%] right-[12%] h-12 w-12 text-rose-200/40 rotate-[-10deg]" />
      </div>

      {/* Linea colorata in alto */}
      <div className="w-full h-1.5 bg-gradient-to-r from-coral-400 via-rose-400 to-cyan-400"></div>

      {/* CONTENUTO PRINCIPALE */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 relative z-10">
        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-4">
            <div className="p-5 bg-gradient-to-br from-coral-500 to-rose-500 rounded-3xl shadow-2xl shadow-coral-500/30">
              <PawPrint className="h-14 w-14 text-white" />
            </div>
            <div>
              <span className="font-bold text-5xl md:text-7xl text-gray-900">vet</span>
              <span className="font-light text-5xl md:text-7xl text-coral-500">buddy</span>
            </div>
          </div>
        </div>
        
        {/* Coming Soon */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-coral-500 via-rose-500 to-cyan-500 bg-clip-text text-transparent">
            Coming Soon
          </h1>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="w-20 h-1 bg-gradient-to-r from-transparent via-coral-400 to-coral-500 rounded-full"></span>
            <PawPrint className="h-5 w-5 text-coral-500" />
            <PawPrint className="h-5 w-5 text-rose-500" />
            <PawPrint className="h-5 w-5 text-cyan-500" />
            <span className="w-20 h-1 bg-gradient-to-l from-transparent via-cyan-400 to-cyan-500 rounded-full"></span>
          </div>
          <p className="mt-8 text-lg text-gray-500 max-w-md mx-auto">
            La piattaforma per cliniche veterinarie e proprietari di pet sta arrivando
          </p>
        </div>
      </div>
      
      {/* Linea colorata in basso */}
      <div className="w-full h-1.5 bg-gradient-to-r from-cyan-400 via-rose-400 to-coral-400"></div>

      {/* Footer */}
      <footer className="relative z-30 py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-400">© 2025 vetbuddy</p>
        </div>
      </footer>
    </div>
  );
}
