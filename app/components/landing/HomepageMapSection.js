'use client';

import { PawPrint, User, MapPin } from 'lucide-react';

function HomepageMapSection() {
  // Mappa stilizzata illustrativa per la landing page
  // Non usa Google Maps per non far sembrare che ci siano cliniche già iscritte
  
  return (
    <div className="relative">
      {/* Mappa stilizzata con gradiente */}
      <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 rounded-2xl shadow-2xl border border-blue-200 overflow-hidden relative h-[400px]">
        {/* Sfondo mappa stilizzato */}
        <div className="absolute inset-0 opacity-30">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {/* Strade stilizzate */}
            <path d="M0 200 Q 100 180, 200 200 T 400 180" stroke="#94a3b8" strokeWidth="3" fill="none" opacity="0.5"/>
            <path d="M0 100 Q 100 120, 200 100 T 400 120" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.4"/>
            <path d="M0 300 Q 100 280, 200 300 T 400 280" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.4"/>
            <path d="M100 0 Q 120 100, 100 200 T 120 400" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.4"/>
            <path d="M200 0 Q 180 100, 200 200 T 180 400" stroke="#94a3b8" strokeWidth="3" fill="none" opacity="0.5"/>
            <path d="M300 0 Q 320 100, 300 200 T 320 400" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.4"/>
            {/* Blocchi stilizzati */}
            <rect x="50" y="50" width="60" height="40" rx="4" fill="#e2e8f0" opacity="0.6"/>
            <rect x="150" y="80" width="50" height="50" rx="4" fill="#e2e8f0" opacity="0.6"/>
            <rect x="280" y="40" width="70" height="45" rx="4" fill="#e2e8f0" opacity="0.6"/>
            <rect x="40" y="150" width="45" height="60" rx="4" fill="#e2e8f0" opacity="0.6"/>
            <rect x="250" y="140" width="55" height="40" rx="4" fill="#e2e8f0" opacity="0.6"/>
            <rect x="320" y="180" width="50" height="50" rx="4" fill="#e2e8f0" opacity="0.6"/>
            <rect x="80" y="250" width="60" height="45" rx="4" fill="#e2e8f0" opacity="0.6"/>
            <rect x="180" y="280" width="45" height="55" rx="4" fill="#e2e8f0" opacity="0.6"/>
            <rect x="290" y="260" width="55" height="40" rx="4" fill="#e2e8f0" opacity="0.6"/>
            <rect x="30" y="320" width="50" height="50" rx="4" fill="#e2e8f0" opacity="0.6"/>
            <rect x="320" y="320" width="60" height="45" rx="4" fill="#e2e8f0" opacity="0.6"/>
          </svg>
        </div>
        
        {/* Pin stilizzati delle cliniche */}
        <div className="absolute inset-0">
          {/* Pin 1 */}
          <div className="absolute top-[25%] left-[30%] transform -translate-x-1/2 animate-bounce" style={{animationDelay: '0s', animationDuration: '2s'}}>
            <div className="bg-coral-500 text-white p-2 rounded-full shadow-lg">
              <PawPrint className="h-5 w-5" />
            </div>
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-coral-500 mx-auto -mt-1"></div>
          </div>
          
          {/* Pin 2 */}
          <div className="absolute top-[45%] left-[60%] transform -translate-x-1/2 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '2.5s'}}>
            <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg">
              <PawPrint className="h-5 w-5" />
            </div>
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-blue-500 mx-auto -mt-1"></div>
          </div>
          
          {/* Pin 3 */}
          <div className="absolute top-[60%] left-[25%] transform -translate-x-1/2 animate-bounce" style={{animationDelay: '1s', animationDuration: '2.2s'}}>
            <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
              <PawPrint className="h-5 w-5" />
            </div>
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-green-500 mx-auto -mt-1"></div>
          </div>
          
          {/* Pin 4 - utente */}
          <div className="absolute top-[40%] left-[45%] transform -translate-x-1/2">
            <div className="relative">
              <div className="bg-amber-500 text-white p-3 rounded-full shadow-xl animate-pulse">
                <User className="h-6 w-6" />
              </div>
              <div className="absolute -inset-3 bg-amber-400 rounded-full opacity-30 animate-ping"></div>
            </div>
          </div>
          
          {/* Pin 5 */}
          <div className="absolute top-[70%] left-[70%] transform -translate-x-1/2 animate-bounce" style={{animationDelay: '1.5s', animationDuration: '2.3s'}}>
            <div className="bg-purple-500 text-white p-2 rounded-full shadow-lg">
              <PawPrint className="h-5 w-5" />
            </div>
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-purple-500 mx-auto -mt-1"></div>
          </div>
        </div>
        
        {/* Label Milano */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md">
          <p className="text-sm font-semibold text-gray-700">📍 Milano e provincia</p>
        </div>
        
        {/* Zoom controls stilizzati */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          <div className="bg-white/90 backdrop-blur w-8 h-8 rounded-md shadow flex items-center justify-center text-gray-500 font-bold">+</div>
          <div className="bg-white/90 backdrop-blur w-8 h-8 rounded-md shadow flex items-center justify-center text-gray-500 font-bold">−</div>
        </div>
      </div>
      
      {/* Floating clinic card */}
      <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-4 border w-64 z-20 hover:shadow-2xl transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-green-100 p-2 rounded-full">
            <MapPin className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">La tua clinica qui</p>
            <p className="text-xs text-green-600">● Visibile ai clienti</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>⭐ Raccogli recensioni</span>
          <span>📍 Geo-localizzata</span>
        </div>
      </div>
    </div>
  );
}

export default HomepageMapSection;
