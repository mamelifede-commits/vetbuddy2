'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Languages } from 'lucide-react';

export default function VetBuddyGlobal({ user }) {
  const languages = ['Italiano', 'English', 'Español', 'Français', 'Deutsch', '中文', '日本語', '한국어'];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-600" />
          VetBuddy Global - Traduzioni AI
        </h2>
        <p className="text-sm text-gray-500">Cartelle e documenti tradotti in 50+ lingue</p>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <Globe className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h3 className="font-bold text-xl text-gray-900 mb-4">Traduzione Automatica Real-Time</h3>
          <p className="text-sm text-gray-600 mb-4">Cartelle cliniche, certificati viaggio, documenti tradotti istantaneamente</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {languages.map(lang => <Badge key={lang} variant="outline">{lang}</Badge>)}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <Languages className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Proprietari Stranieri</h4>
            <p className="text-sm text-gray-600">Tedesco in Italia → cartella tradotta automaticamente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Globe className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Certificati Export</h4>
            <p className="text-sm text-gray-600">Certificati viaggio tradotti in lingua destinazione</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800"><strong>🌍 Turismo Pet-Friendly:</strong> Italia = destinazione turistica enorme. Traduzioni automatiche = valore immediato. 50+ lingue supportate.</p>
        </CardContent>
      </Card>
    </div>
  );
}
