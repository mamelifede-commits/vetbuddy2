'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, AlertCircle, Eye } from 'lucide-react';

export default function PetOverviewTab({ pet, nextAppointment, lastDocument, onManageAppointment, onOpenDocument }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" />Prossimo appuntamento</CardTitle>
        </CardHeader>
        <CardContent>
          {nextAppointment ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{nextAppointment.reason || 'Visita'}</p>
                <p className="text-sm text-gray-500">{new Date(nextAppointment.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })} alle {nextAppointment.time}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => onManageAppointment(nextAppointment)}>Gestisci</Button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nessun appuntamento programmato</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" />Ultimo documento</CardTitle>
        </CardHeader>
        <CardContent>
          {lastDocument ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{lastDocument.name}</p>
                <p className="text-sm text-gray-500">{new Date(lastDocument.createdAt).toLocaleDateString()}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => onOpenDocument(lastDocument)}><Eye className="h-4 w-4 mr-1" />Apri</Button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nessun documento</p>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-500" />Note importanti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-800">Allergie</p>
              <p className="text-sm text-red-600 mt-1">{Array.isArray(pet.allergies) ? pet.allergies.join(', ') : (pet.allergies || 'Nessuna nota')}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-800">Farmaci in corso</p>
              <p className="text-sm text-purple-600 mt-1">
                {Array.isArray(pet.medications) 
                  ? pet.medications.map(m => typeof m === 'object' ? m.name : m).join(', ')
                  : (pet.medications || 'Nessuno')}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Note comportamentali</p>
              <p className="text-sm text-blue-600 mt-1">{pet.notes || 'Nessuna nota'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
