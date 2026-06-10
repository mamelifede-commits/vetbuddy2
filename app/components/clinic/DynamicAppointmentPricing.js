'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, Calendar } from 'lucide-react';

export default function DynamicAppointmentPricing() {
  const [slots] = useState([
    { day: 'Lunedì', time: '09:00', demand: 'bassa', price: 35, discount: 30, available: 8 },
    { day: 'Lunedì', time: '14:00', demand: 'bassa', price: 35, discount: 25, available: 6 },
    { day: 'Mercoledì', time: '11:00', demand: 'media', price: 45, discount: 10, available: 4 },
    { day: 'Venerdì', time: '17:00', demand: 'alta', price: 50, discount: 0, available: 2 },
    { day: 'Sabato', time: '10:00', demand: 'altissima', price: 55, discount: 0, available: 1 },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-6 w-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">Dynamic Appointment Pricing</h2>
          <Badge className="bg-amber-600 text-white">Genius</Badge>
        </div>
        <p className="text-gray-600">Prezzi dinamici basati su domanda (come Uber surge pricing). Slot poco richiesti: sconto 20-30%. Alta domanda: prezzo standard +10%. AI ottimizza revenue + saturazione agenda. +15-20% revenue, agenda sempre piena.</p>
      </div>

      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="text-lg">Slot Disponibili Questa Settimana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {slots.map((slot, i) => {
            const demandColors = {
              bassa: 'bg-green-100 border-green-300 text-green-700',
              media: 'bg-amber-100 border-amber-300 text-amber-700',
              alta: 'bg-orange-100 border-orange-300 text-orange-700',
              altissima: 'bg-red-100 border-red-300 text-red-700',
            };
            return (
              <div key={i} className={`rounded-lg p-4 border-2 ${demandColors[slot.demand]}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-lg">{slot.day} {slot.time}</div>
                    <Badge variant="outline" className="mt-1">Domanda {slot.demand}</Badge>
                  </div>
                  <div className="text-right">
                    {slot.discount > 0 ? (
                      <div>
                        <div className="text-sm text-gray-500 line-through">€{slot.price + (slot.price * slot.discount / 100)}</div>
                        <div className="text-3xl font-black text-green-600">€{slot.price}</div>
                        <Badge className="bg-green-600 text-xs">-{slot.discount}% OFF</Badge>
                      </div>
                    ) : (
                      <div className="text-3xl font-black">€{slot.price}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{slot.available} slot disponibili</span>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">Prenota</Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-sm">Vantaggi Proprietari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600">✔️</span>
              <span>Risparmia fino al 30% prenotando slot meno richiesti</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600">✔️</span>
              <span>Flessibilità: scegli tra sconto o orario preferito</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600">✔️</span>
              <span>Priority check-in su slot scontati</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-sm">Vantaggi Clinica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-blue-600">✔️</span>
              <span>Agenda sempre piena (anche lunedì mattina)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-blue-600">✔️</span>
              <span>Revenue +15-20% tramite ottimizzazione AI</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-blue-600">✔️</span>
              <span>Zero slot vuoti sprecati</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">+18%</div>
            <div className="text-xs text-gray-600">Revenue incremento</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">95%</div>
            <div className="text-xs text-gray-600">Saturazione agenda</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">€35-55</div>
            <div className="text-xs text-gray-600">Range dinamico</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">30%</div>
            <div className="text-xs text-gray-600">Max sconto OFF</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
