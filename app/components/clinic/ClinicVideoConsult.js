'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Calendar, ChevronLeft, Clock, Plus, Settings, Video, X } from 'lucide-react';
import api from '@/app/lib/api';

function ClinicVideoConsult({ user, onNavigate }) {
  const [settings, setSettings] = useState({
    enabled: true,
    price: 35,
    duration: 20,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timeSlots: [
      { start: '09:00', end: '12:00' },
      { start: '14:00', end: '18:00' }
    ],
    maxPerDay: 5,
    reminderEmail24h: true,
    reminderEmail1h: true,
    autoConfirm: true
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const dayLabels = {
    monday: 'Lunedì',
    tuesday: 'Martedì',
    wednesday: 'Mercoledì',
    thursday: 'Giovedì',
    friday: 'Venerdì',
    saturday: 'Sabato',
    sunday: 'Domenica'
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('clinic/video-consult-settings');
      if (response) {
        setSettings(prev => ({ ...prev, ...response }));
      }
    } catch (error) {
      console.error('Error loading video consult settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.post('clinic/video-consult-settings', settings);
      alert('Impostazioni Video Consulto salvate!');
    } catch (error) {
      alert('Errore nel salvare le impostazioni');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setSettings(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const addTimeSlot = () => {
    setSettings(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { start: '09:00', end: '13:00' }]
    }));
  };

  const removeTimeSlot = (index) => {
    setSettings(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Video className="h-7 w-7 text-blue-500" />
              Video Consulto
            </h2>
            <p className="text-gray-500 text-sm">Configura disponibilità, prezzi e promemoria</p>
          </div>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {saving ? 'Salvataggio...' : '✓ Salva Impostazioni'}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Colonna Sinistra - Configurazione Base */}
        <div className="space-y-6">
          {/* Abilitazione e Prezzi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                Configurazione Base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Video Consulto Attivo</p>
                  <p className="text-sm text-gray-500">I clienti possono prenotare video consulti</p>
                </div>
                <button 
                  onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative w-14 h-7 rounded-full transition-colors ${settings.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.enabled ? 'translate-x-7' : ''}`} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prezzo (€)</Label>
                  <Input 
                    type="number" 
                    value={settings.price} 
                    onChange={(e) => setSettings(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
                <div>
                  <Label>Durata (minuti)</Label>
                  <Input 
                    type="number" 
                    value={settings.duration} 
                    onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) || 20 }))}
                    min="10"
                    step="5"
                  />
                </div>
              </div>

              <div>
                <Label>Max consulti per giorno</Label>
                <Input 
                  type="number" 
                  value={settings.maxPerDay} 
                  onChange={(e) => setSettings(prev => ({ ...prev, maxPerDay: parseInt(e.target.value) || 5 }))}
                  min="1"
                  max="20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Promemoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                Promemoria Automatici
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Reminder 24h prima</p>
                  <p className="text-xs text-gray-500">Email al cliente con link video</p>
                </div>
                <button 
                  onClick={() => setSettings(prev => ({ ...prev, reminderEmail24h: !prev.reminderEmail24h }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.reminderEmail24h ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.reminderEmail24h ? 'translate-x-6' : ''}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Reminder 1h prima</p>
                  <p className="text-xs text-gray-500">Email di promemoria last-minute</p>
                </div>
                <button 
                  onClick={() => setSettings(prev => ({ ...prev, reminderEmail1h: !prev.reminderEmail1h }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.reminderEmail1h ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.reminderEmail1h ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Conferma Automatica</p>
                  <p className="text-xs text-gray-500">Conferma prenotazioni automaticamente</p>
                </div>
                <button 
                  onClick={() => setSettings(prev => ({ ...prev, autoConfirm: !prev.autoConfirm }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.autoConfirm ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.autoConfirm ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonna Destra - Disponibilità */}
        <div className="space-y-6">
          {/* Giorni Disponibili */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Giorni Disponibili
              </CardTitle>
              <CardDescription>Seleziona i giorni in cui offri video consulti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(dayLabels).map(([day, label]) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`p-3 rounded-lg border text-sm font-medium transition ${
                      settings.availableDays.includes(day)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fasce Orarie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Fasce Orarie
              </CardTitle>
              <CardDescription>Definisci gli orari disponibili per i video consulti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings.timeSlots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <Input 
                      type="time" 
                      value={slot.start} 
                      onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                      className="w-28"
                    />
                    <span className="text-gray-400">→</span>
                    <Input 
                      type="time" 
                      value={slot.end} 
                      onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                      className="w-28"
                    />
                  </div>
                  {settings.timeSlots.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={addTimeSlot}
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Fascia Oraria
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-800 mb-2">📋 Riepilogo Configurazione</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>• <strong>Prezzo:</strong> €{settings.price} / {settings.duration} min</p>
                <p>• <strong>Giorni:</strong> {settings.availableDays.map(d => dayLabels[d].substring(0, 3)).join(', ') || 'Nessuno'}</p>
                <p>• <strong>Orari:</strong> {settings.timeSlots.map(s => `${s.start}-${s.end}`).join(', ')}</p>
                <p>• <strong>Max/giorno:</strong> {settings.maxPerDay} consulti</p>
                <p>• <strong>Reminder:</strong> {[settings.reminderEmail24h && '24h', settings.reminderEmail1h && '1h'].filter(Boolean).join(', ') || 'Disattivati'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ==================== CLINIC REWARDS MANAGEMENT ====================

export default ClinicVideoConsult;
