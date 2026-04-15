'use client';

import { ChevronLeft } from 'lucide-react';

export default function BackToDashboard({ onNavigate }) {
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
