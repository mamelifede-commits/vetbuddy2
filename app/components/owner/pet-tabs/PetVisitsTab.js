'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Stethoscope, ChevronRight } from 'lucide-react';

export default function PetVisitsTab({ appointments, onManageAppointment }) {
  return (
    <Card>
      <CardHeader><CardTitle>Storico visite</CardTitle></CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nessuna visita registrata</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onManageAppointment(appt)}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${new Date(appt.date) >= new Date() ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {appt.type === 'videoconsulto' ? <Video className="h-5 w-5 text-blue-600" /> : <Stethoscope className="h-5 w-5 text-gray-600" />}
                  </div>
                  <div>
                    <p className="font-medium">{appt.reason || 'Visita'}</p>
                    <p className="text-sm text-gray-500">{new Date(appt.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} - {appt.time}</p>
                    {appt.clinicName && <p className="text-xs text-gray-400">{appt.clinicName}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={new Date(appt.date) >= new Date() ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}>
                    {new Date(appt.date) >= new Date() ? 'Programmato' : 'Completato'}
                  </Badge>
                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
