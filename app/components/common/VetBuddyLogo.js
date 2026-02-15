'use client';

import { PawPrint } from 'lucide-react';

// vetbuddy Logo Component - Style 4 (Minimal with coral box)
// This is the official brand logo - do not modify
const VetBuddyLogo = ({ size = 40, showText = false, className = '' }) => {
  // Calculate proportions based on size
  const boxSize = size;
  const iconSize = Math.round(size * 0.55);
  const padding = Math.round(size * 0.2);
  const borderRadius = Math.round(size * 0.35);
  
  // Text sizes based on logo size
  const textSize = size >= 50 ? 'text-2xl' : size >= 35 ? 'text-xl' : 'text-lg';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="bg-gradient-to-br from-coral-500 to-rose-500 flex items-center justify-center shadow-lg shadow-coral-500/30"
        style={{
          width: boxSize,
          height: boxSize,
          padding: padding,
          borderRadius: borderRadius
        }}
      >
        <PawPrint 
          className="text-white" 
          style={{ width: iconSize, height: iconSize }}
        />
      </div>
      {showText && (
        <div className={`font-bold ${textSize}`}>
          <span className="text-gray-900">vet</span>
          <span className="text-coral-500">buddy</span>
        </div>
      )}
    </div>
  );
};

export default VetBuddyLogo;
