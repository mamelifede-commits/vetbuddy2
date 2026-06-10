'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function CreditiECM({ user }) {
  const [credits, setCredits] = useState([
    { id: 1, year: '2025', earned: 32, required: 50, status: 'in_progress' },
    { id: 2, year: '2024', earned: 54, required: 50, status: 'completed' },
  ]);

  const courses = [
    { id: 1, title: 'Medicina d\'urgenza veterinaria', credits: 8, provider: 'FNOVI', date: '2025-07-15' },
    { id: 2, title: 'Dermatologia felina avanzata', credits: 6, provider: 'SCIVAC', date: '2025-08-20' },
  ];

  const getYearStatusBadge = (year) => {
    if (year.status === 'completed') return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Completato</Badge>;
    if (year.earned >= year.required * 0.8) return <Badge className="bg-blue-100 text-blue-700"><Clock className="h-3 w-3 mr-1" />In Corso</Badge>;
    return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="h-3 w-3 mr-1" />In Ritardo</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-teal-600" />
            Tracking Crediti ECM
          </h2>
          <p className="text-sm text-gray-500">Monitoraggio formazione obbligatoria continua</p>
        </div>
        <Button className="bg-teal-600"><Plus className="h-4 w-4 mr-2" />Registra Corso</Button>
      </div>

      {/* Crediti Annuali */}
      <div className="grid grid-cols-2 gap-4">
        {credits.map(year => (
          <Card key={year.id} className="hover:shadow-md transition">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Anno {year.year}</h3>
                {getYearStatusBadge(year)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Crediti Acquisiti</span>
                  <span className="font-semibold text-gray-900">{year.earned} / {year.required}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{width: `${(year.earned / year.required) * 100}%`}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Corsi Disponibili */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Corsi Accreditati Prossimi</h3>
        <div className="grid gap-3">
          {courses.map(course => (
            <Card key={course.id} className="hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{course.provider}</span>
                        <span>•</span>
                        <span>{new Date(course.date).toLocaleDateString('it-IT')}</span>
                        <span>•</span>
                        <Badge className="bg-teal-100 text-teal-700">{course.credits} Crediti</Badge>
                      </div>
                    </div>
                  </div>
                  <Button size="sm">Iscriviti</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="p-4">
          <p className="text-sm text-teal-800"><strong>ℹ️ Obbligo Formazione:</strong> I veterinari devono acquisire 50 crediti ECM ogni anno. VetBuddy traccia automaticamente i crediti e invia alert 60 giorni prima della scadenza.</p>
        </CardContent>
      </Card>
    </div>
  );
}
