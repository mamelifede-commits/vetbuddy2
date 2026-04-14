'use client';

import { Dog, Cat, PawPrint } from 'lucide-react';

export const getPetSpeciesInfo = (species) => {
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

export const NewBrandLogo = ({ size = 'md', showText = true, className = '' }) => {
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

export const PetAvatar = ({ pet, size = 'md', onClick, className = '' }) => {
  const sizeClasses = { sm: 'h-10 w-10', md: 'h-16 w-16', lg: 'h-24 w-24', xl: 'h-32 w-32' };
  const emojiSizes = { sm: 'text-xl', md: 'text-3xl', lg: 'text-5xl', xl: 'text-6xl' };
  
  const speciesInfo = getPetSpeciesInfo(pet?.species);
  const colorMap = {
    blue: 'from-blue-100 to-blue-200', purple: 'from-purple-100 to-purple-200',
    amber: 'from-amber-100 to-amber-200', green: 'from-green-100 to-green-200',
    pink: 'from-pink-100 to-pink-200', orange: 'from-orange-100 to-orange-200',
    cyan: 'from-cyan-100 to-cyan-200', emerald: 'from-emerald-100 to-emerald-200',
    gray: 'from-gray-100 to-gray-200'
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
        <div className={`w-full h-full bg-gradient-to-br ${colorMap[speciesInfo.color]} items-center justify-center hidden`}>
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

export const calculateAge = (birthDate) => {
  if (!birthDate) return 'N/D';
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (years === 0) return `${months < 0 ? 12 + months : months} mesi`;
  if (months < 0) return `${years - 1} anni e ${12 + months} mesi`;
  return `${years} ann${years === 1 ? 'o' : 'i'}`;
};
