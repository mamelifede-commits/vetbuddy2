'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, TreePine, Image, Calendar } from 'lucide-react';

export default function PetLossGriefSupport() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-6 w-6 text-rose-500" />
          <h2 className="text-2xl font-bold text-gray-900">Pet Loss Grief Support</h2>
          <Badge className="bg-rose-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">Protocollo empatico post-eutanasia. Email automatiche, grief counselor video-call, memorial digitale, albero in memoria. Retention emotiva, proprietario torna per prossimo animale. Lifetime value protetto.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-lg">Protocollo Automatico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {[
                { day: 'Giorno dopo', msg: 'Email empatica + condoglianze personalizzate' },
                { day: '1 settimana', msg: 'Video messaggio veterinario + supporto' },
                { day: '2 settimane', msg: 'Offerta grief counselor gratuita' },
                { day: '1 mese', msg: 'Link memorial digitale completo' },
                { day: '6 mesi', msg: 'Check-in: come stai? Ricordi felici' },
                { day: '12 mesi', msg: 'Pronti per nuovo compagno? Consiglio razze' },
              ].map((step, i) => (
                <div key={i} className="bg-white rounded p-3 border-l-4 border-rose-400">
                  <div className="font-bold text-sm text-rose-700">{step.day}</div>
                  <div className="text-xs text-gray-700 mt-1">{step.msg}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TreePine className="h-5 w-5 text-green-600" />
              Memorial Digitale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gray-200 rounded-lg h-20 w-20 flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Max</h3>
                  <p className="text-xs text-gray-600">2015 - 2025 • Golden Retriever</p>
                  <Badge className="mt-1 bg-green-600 text-xs">Albero Piantato 🌳</Badge>
                </div>
              </div>
              <p className="text-xs text-gray-700 italic mb-3">"Il miglior amico che abbia mai avuto. Sempre felice, sempre pronto per un'avventura. Ti porteremo sempre nel cuore."</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  42 messaggi
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <Image className="h-3 w-3 mr-1" />
                  Galleria (28)
                </Button>
              </div>
            </div>
            <div className="bg-green-100 rounded-lg p-3 text-center">
              <TreePine className="h-8 w-8 text-green-700 mx-auto mb-2" />
              <p className="text-xs text-green-800 font-medium">Albero piantato in Amazzonia</p>
              <p className="text-xs text-green-600">In memoria di Max • ID: #AMZ-2892</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-6 w-6 text-rose-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">+25%</div>
            <div className="text-xs text-gray-600">Retention post-eutanasia</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">8-12m</div>
            <div className="text-xs text-gray-600">Alert nuovo animale</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TreePine className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">340</div>
            <div className="text-xs text-gray-600">Alberi piantati</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">94%</div>
            <div className="text-xs text-gray-600">Soddisfazione</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
