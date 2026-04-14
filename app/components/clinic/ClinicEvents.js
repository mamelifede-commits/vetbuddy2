'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Building2, CalendarDays, CalendarRange, Check, Copy, ExternalLink, Globe, GraduationCap, Heart, Info, Loader2, Mail, MapPin, Star, X } from 'lucide-react';

function ClinicEvents({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [savingEvent, setSavingEvent] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedEventForShare, setSelectedEventForShare] = useState(null);
  const [copied, setCopied] = useState(false);

  // Carica eventi dall'API
  const loadEvents = async () => {
    try {
      const token = localStorage.getItem('vetbuddy_token');
      const res = await fetch('/api/clinic/events', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Salva/rimuovi evento dai preferiti
  const toggleSaveEvent = async (eventId, currentlySaved) => {
    setSavingEvent(eventId);
    try {
      const token = localStorage.getItem('vetbuddy_token');
      const res = await fetch('/api/clinic/events', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: currentlySaved ? 'unsave' : 'save',
          eventId
        })
      });
      if (res.ok) {
        // Aggiorna lo stato locale
        setEvents(prev => prev.map(e => 
          e.id === eventId ? { ...e, saved: !currentlySaved } : e
        ));
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    } finally {
      setSavingEvent(null);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getTypeColor = (type) => {
    switch(type) {
      case 'congresso': return 'purple';
      case 'corso': return 'blue';
      case 'webinar': return 'green';
      case 'workshop': return 'amber';
      default: return 'gray';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'congresso': return 'Congresso';
      case 'corso': return 'Corso';
      case 'webinar': return 'Webinar';
      case 'workshop': return 'Workshop';
      default: return type;
    }
  };

  const filteredEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const today = new Date();
    if (activeFilter === 'upcoming') return eventDate >= today;
    if (activeFilter === 'past') return eventDate < today;
    if (activeFilter === 'ecm') return e.ecm;
    if (activeFilter === 'online') return e.location.toLowerCase().includes('online');
    if (activeFilter === 'saved') return e.saved;
    if (activeFilter === 'featured') return e.featured;
    return true;
  });

  const savedCount = events.filter(e => e.saved).length;

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options = { day: 'numeric', month: 'short' };
    if (start === end) {
      return startDate.toLocaleDateString('it-IT', { ...options, year: 'numeric' });
    }
    return `${startDate.toLocaleDateString('it-IT', options)} - ${endDate.toLocaleDateString('it-IT', { ...options, year: 'numeric' })}`;
  };

  // Funzione per aprire il modal di condivisione
  const openShareModal = (event) => {
    setSelectedEventForShare(event);
    setShareModalOpen(true);
    setCopied(false);
  };

  // Funzione per condividere l'evento
  const shareEvent = (platform) => {
    if (!selectedEventForShare) return;
    
    // Usa il link alla pagina vetbuddy per l'anteprima
    const eventUrl = `${window.location.origin}/eventi-clinica/${selectedEventForShare.id}`;
    const eventTitle = selectedEventForShare.title;
    const eventDate = formatDateRange(selectedEventForShare.date, selectedEventForShare.endDate);
    const eventLocation = selectedEventForShare.location;
    const eventDescription = selectedEventForShare.description || '';
    
    // Messaggio completo con descrizione per WhatsApp
    const whatsappText = `${eventTitle}\n📅 ${eventDate}\n📍 ${eventLocation}\n\n${eventDescription}\n\n${eventUrl}`;
    
    // Messaggio per altri canali
    const shareText = `${eventTitle}\n📅 ${eventDate}\n📍 ${eventLocation}\n\n${eventDescription}`;
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(eventTitle)}&body=${encodeURIComponent(shareText + '\n\n' + eventUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(eventUrl).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        return; // Non chiudere il modal per mostrare feedback
      default:
        break;
    }
    
    setShareModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-purple-500" />
            Eventi & Convegni
          </h1>
          <p className="text-gray-500">Corsi, congressi e formazione continua per veterinari</p>
        </div>
        <Badge className="bg-purple-100 text-purple-700">
          <Bell className="h-3 w-3 mr-1" /> Aggiornamento automatico
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'upcoming', label: 'Prossimi', icon: CalendarRange },
          { id: 'saved', label: `Salvati (${savedCount})`, icon: Heart },
          { id: 'featured', label: 'In Evidenza', icon: Star },
          { id: 'ecm', label: 'Con ECM', icon: GraduationCap },
          { id: 'online', label: 'Online', icon: Globe },
          { id: 'all', label: 'Tutti', icon: CalendarDays },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter.id
                ? 'bg-purple-500 text-white'
                : 'bg-white border hover:bg-gray-50 text-gray-700'
            }`}
          >
            <filter.icon className="h-4 w-4" />
            {filter.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500 mb-4" />
          <p className="text-gray-500">Caricamento eventi...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarDays className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun evento trovato</h3>
          <p className="text-gray-500">Prova a cambiare i filtri di ricerca</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Date Box */}
                  <div className={`w-32 bg-${getTypeColor(event.type)}-500 text-white p-4 flex flex-col items-center justify-center`}>
                    <span className="text-4xl mb-2">{event.image}</span>
                    <span className="text-xs opacity-80 uppercase">{getTypeLabel(event.type)}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Building2 className="h-4 w-4" /> {event.organizer}
                        </p>
                      </div>
                      {event.ecm && (
                        <Badge className="bg-green-100 text-green-700">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {event.ecmCredits} ECM
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDateRange(event.date, event.endDate)}
                      </span>
                      {event.location && !event.location.toLowerCase().includes('online') ? (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                        >
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {event.topics.map((topic, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant={event.saved ? "default" : "outline"}
                        className={event.saved ? "bg-red-500 hover:bg-red-600" : ""}
                        onClick={() => toggleSaveEvent(event.id, event.saved)}
                        disabled={savingEvent === event.id}
                      >
                        {savingEvent === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart className={`h-4 w-4 mr-1 ${event.saved ? 'fill-current' : ''}`} />
                        )}
                        {event.saved ? 'Salvato' : 'Salva'}
                      </Button>
                      <a href={`/eventi-clinica/${event.id}`}>
                        <Button size="sm" className={`bg-${getTypeColor(event.type)}-500 hover:bg-${getTypeColor(event.type)}-600`}>
                          <ExternalLink className="h-4 w-4 mr-1" /> Dettagli
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && selectedEventForShare && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShareModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Condividi Evento</h3>
              <button 
                onClick={() => setShareModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-purple-50 rounded-xl">
              <p className="font-semibold text-purple-900">{selectedEventForShare.title}</p>
              <p className="text-sm text-purple-700 mt-1">
                📅 {formatDateRange(selectedEventForShare.date, selectedEventForShare.endDate)}
              </p>
              <p className="text-sm text-purple-700">
                📍 {selectedEventForShare.location}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => shareEvent('whatsapp')}
                className="flex items-center justify-center gap-2 p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
              
              <button 
                onClick={() => shareEvent('telegram')}
                className="flex items-center justify-center gap-2 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </button>
              
              <button 
                onClick={() => shareEvent('facebook')}
                className="flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              
              <button 
                onClick={() => shareEvent('email')}
                className="flex items-center justify-center gap-2 p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                <Mail className="h-6 w-6" />
                Email
              </button>
            </div>
            
            <div className="mt-4">
              <button 
                onClick={() => shareEvent('copy')}
                className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl transition-colors ${
                  copied 
                    ? 'bg-green-100 text-green-700 border-2 border-green-500' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    Link copiato!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    Copia link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <Card className="mt-8 bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900">Come funziona?</h4>
              <p className="text-sm text-purple-700 mt-1">
                vetbuddy raccoglie automaticamente eventi e convegni veterinari da fonti come SCIVAC, FNOVI, AIVPA e altre 
                associazioni veterinarie italiane. Gli eventi vengono aggiornati settimanalmente.
              </p>
              <p className="text-sm text-purple-600 mt-2">
                💡 <strong>Suggerimento:</strong> Usa il pulsante ❤️ per salvare gli eventi che ti interessano e ritrovarli facilmente nel filtro "Salvati".
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// ==================== CLINIC FEEDBACK PAGE ====================

export default ClinicEvents;
