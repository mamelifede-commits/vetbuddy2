'use client';

import { Building2, PawPrint, Users } from 'lucide-react';

function RoleBadge({ role }) {
  const config = {
    clinic: { label: 'Account: Clinica', icon: Building2, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    owner: { label: 'Account: Proprietario', icon: PawPrint, color: 'bg-green-100 text-green-700 border-green-200' },
    staff: { label: 'Account: Staff', icon: Users, color: 'bg-purple-100 text-purple-700 border-purple-200' }
  };
  const { label, icon: Icon, color } = config[role] || config.owner;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}

export default RoleBadge;
