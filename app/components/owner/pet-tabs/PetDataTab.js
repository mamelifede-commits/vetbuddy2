'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Euro, Download, Shield } from 'lucide-react';

export default function PetDataTab({ pet, documents }) {
  const handleExportCSV = () => {
    const invoices = documents.filter(d => d.type === 'fattura' || d.type === 'invoice');
    if (invoices.length === 0) {
      alert("Nessuna fattura disponibile per l'export");
      return;
    }
    const csv = ['Data,Descrizione,Importo,Clinica'];
    invoices.forEach(inv => {
      csv.push(`${new Date(inv.createdAt).toLocaleDateString('it-IT')},${inv.name || 'Fattura'},€${inv.amount || 0},${inv.clinicName || 'N/A'}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spese_${pet.name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Dati anagrafici</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-gray-500">Microchip</Label><p className="font-medium">{pet.microchip || 'Non registrato'}</p></div>
            <div><Label className="text-gray-500">Peso</Label><p className="font-medium">{pet.weight ? `${pet.weight} kg` : 'N/D'}</p></div>
            <div><Label className="text-gray-500">Data nascita</Label><p className="font-medium">{pet.birthDate ? new Date(pet.birthDate).toLocaleDateString() : 'N/D'}</p></div>
            <div><Label className="text-gray-500">Sterilizzato</Label><p className="font-medium">{pet.sterilized ? 'Sì' : 'No'}</p></div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader><CardTitle className="flex items-center gap-2"><Euro className="h-5 w-5 text-green-600" />Spese veterinarie</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">€{pet.spending?.currentYear || 0}</p>
              <p className="text-sm text-gray-500">Speso quest&apos;anno</p>
            </div>
            <div className="p-4 bg-white rounded-lg text-center">
              <p className="text-xl font-semibold text-gray-700">€{pet.spending?.total || 0}</p>
              <p className="text-sm text-gray-500">Totale storico</p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" /> Esporta spese (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader><CardTitle>Informazioni complete</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 border-b pb-1">Dati Generali</h4>
              <div><Label className="text-gray-500 text-xs">Specie</Label><p className="font-medium">{pet.species === 'dog' ? '🐕 Cane' : pet.species === 'cat' ? '🐱 Gatto' : pet.species || 'N/D'}</p></div>
              <div><Label className="text-gray-500 text-xs">Razza</Label><p className="font-medium">{pet.breed || 'N/D'}</p></div>
              <div><Label className="text-gray-500 text-xs">Data nascita</Label><p className="font-medium">{pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('it-IT') : 'N/D'}</p></div>
              <div><Label className="text-gray-500 text-xs">Sterilizzato</Label><p className="font-medium">{pet.sterilized ? '✅ Sì' : '❌ No'}</p></div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 border-b pb-1">Salute</h4>
              <div><Label className="text-gray-500 text-xs">Allergie</Label><p className="font-medium">{pet.allergies || 'Nessuna nota'}</p></div>
              <div><Label className="text-gray-500 text-xs">Patologie croniche</Label><p className="font-medium">{pet.chronicDiseases || 'Nessuna nota'}</p></div>
              <div><Label className="text-gray-500 text-xs">Condizioni attuali</Label><p className="font-medium">{pet.currentConditions || 'Nessuna nota'}</p></div>
              <div><Label className="text-gray-500 text-xs">Farmaci</Label><p className="font-medium">{Array.isArray(pet.medications) ? pet.medications.map(m => typeof m === 'object' ? m.name : m).join(', ') : (pet.medications || 'Nessuno')}</p></div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 border-b pb-1">Altro</h4>
              <div><Label className="text-gray-500 text-xs">Alimentazione</Label><p className="font-medium">{pet.diet ? {'crocchette': '🥣 Crocchette', 'umido': '🥫 Umido', 'misto': '🍽️ Misto', 'barf': '🥩 BARF', 'casalinga': '🍳 Casalinga', 'veterinaria': '💊 Veterinaria'}[pet.diet] || pet.diet : 'N/D'}</p></div>
              <div><Label className="text-gray-500 text-xs">Note alimentazione</Label><p className="font-medium">{pet.dietNotes || 'Nessuna nota'}</p></div>
              <div><Label className="text-gray-500 text-xs">Assicurazione</Label><p className="font-medium">{pet.insurance ? `✅ ${pet.insuranceCompany || 'Assicurato'}` : '❌ Non assicurato'}</p></div>
              <div><Label className="text-gray-500 text-xs">Note comportamentali</Label><p className="font-medium">{pet.notes || 'Nessuna nota'}</p></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
