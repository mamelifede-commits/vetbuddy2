'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Microscope, Upload, FileText, Clock, Euro } from 'lucide-react';

export default function VetBuddyAutopsyAI() {
  const [uploadedCase, setUploadedCase] = useState(null);

  const handleUpload = () => {
    setUploadedCase({
      petName: 'Luna',
      species: 'Cane',
      breed: 'Labrador',
      age: 8,
      findings: [
        'Massa tumorale fegato lobo destro (8cm)',
        'Versamento addominale ematico (500ml)',
        'Metastasi polmonari multiple',
      ],
      aiDiagnosis: 'Emangiosarcoma epatico con metastasi polmonari',
      confidence: 92,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Microscope className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900">VetBuddy Autopsy AI</h2>
          <Badge className="bg-purple-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">AI analizza foto/video necroscopia e identifica lesioni. Report preliminare in 5 minuti. Collega con patologo on-demand se serve conferma. Risparmio 60% costi (€150 vs €800), risultati 10x più veloci.</p>
      </div>

      {!uploadedCase ? (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg">Nuovo Caso Necroscopico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">Carica foto/video necroscopia (max 20 file)</p>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Carica Materiale
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-700">Specie</label>
                <select className="w-full border rounded px-3 py-2 mt-1">
                  <option>Cane</option>
                  <option>Gatto</option>
                  <option>Altro</option>
                </select>
              </div>
              <div>
                <label className="font-medium text-gray-700">Età</label>
                <input type="number" className="w-full border rounded px-3 py-2 mt-1" placeholder="Anni" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Report Preliminare AI - {uploadedCase.petName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Diagnosi AI</h3>
                <Badge className="bg-green-600">Confidenza {uploadedCase.confidence}%</Badge>
              </div>
              <p className="text-lg font-bold text-green-700 mb-3">{uploadedCase.aiDiagnosis}</p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Reperti Identificati:</p>
                {uploadedCase.findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-600">•</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Scarica Report PDF
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Richiedi Conferma Patologo (€150)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">5 min</div>
            <div className="text-xs text-gray-600">vs 2-3 settimane</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Euro className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">€150</div>
            <div className="text-xs text-gray-600">vs €800 tradizionale</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">92%</div>
            <div className="text-xs text-gray-600">Accuratezza AI</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">50k+</div>
            <div className="text-xs text-gray-600">Database casi</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
