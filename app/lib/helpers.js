// Helper utilities for VetBuddy
import { Dog, Cat, PawPrint } from 'lucide-react';

// Helper function for pet species info
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

// Color maps for pet species
export const colorMap = {
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

export const iconColorMap = {
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

// Service category labels
export const serviceCategoryLabels = {
  visite: '🩺 Visite',
  vaccinazioni: '💉 Vaccinazioni',
  esami: '🔬 Esami e Diagnostica',
  chirurgia: '⚕️ Chirurgia',
  dentale: '🦷 Cure Dentali',
  grooming: '✂️ Toelettatura',
  altri: '📋 Altri Servizi'
};

// Format date helper
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Format time helper
export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format currency helper
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0);
};

// Calculate age from birthdate
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Status badge colors
export const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800'
};

// Status labels in Italian
export const statusLabels = {
  pending: 'In attesa',
  confirmed: 'Confermato',
  completed: 'Completato',
  cancelled: 'Annullato',
  no_show: 'Non presentato'
};
