'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, MapPin, Clock, ExternalLink, Share2, PawPrint, Building2, Globe, Star, Navigation, Copy, Check, Calendar, MessageCircle } from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (!response.ok) {
          throw new Error('Evento non trovato');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const getCategoryStyle = (category) => {
    const styles = {
      salute: { bg: 'bg-green-100', text: 'text-green-700', icon: '🏥' },
      cani: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '🐕' },
      gatti: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🐱' },
      cavalli: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🐴' },
      conigli: { bg: 'bg-pink-100', text: 'text-pink-700', icon: '🐰' },
      uccelli: { bg: 'bg-sky-100', text: 'text-sky-700', icon: '🐦' },
      rettili: { bg: 'bg-lime-100', text: 'text-lime-700', icon: '🦎' },
      pesci: { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: '🐠' },
      roditori: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🐹' },
      furetti: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🦡' },
      esotici: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '🦜' },
      promo: { bg: 'bg-red-100', text: 'text-red-700', icon: '🎁' },
      eventi: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📅' },
      generale: { bg: 'bg-teal-100', text: 'text-teal-700', icon: '🐾' },
      altro: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '✨' },
      tutti: { bg: 'bg-coral-100', text: 'text-coral-700', icon: '🐾' }
    };
    return styles[category] || styles.tutti;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Data da definire';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    if (hours === 0 && minutes === 0) return null; // No specific time
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate Google Maps link
  const getGoogleMapsLink = (location) => {
    if (!location) return null;
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  };

  // Generate Google Calendar link
  const getGoogleCalendarLink = () => {
    if (!event) return null;
    const startDate = new Date(event.eventDate);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours
    
    const formatCalendarDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, 15) + 'Z';
    };
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}`,
      details: event.description || '',
      location: event.location || '',
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Share functions
  const handleShare = async (method) => {
    const shareUrl = window.location.href;
    const shareText = `${event.title}\n📅 ${formatDate(event.eventDate)}\n📍 ${event.location || 'Luogo da definire'}\n\n${event.description || ''}`;
    
    switch (method) {
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: event.title,
              text: shareText,
              url: shareUrl
            });
          } catch (err) {
            console.log('Condivisione annullata');
          }
        }
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento evento...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😿</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Evento non trovato</h1>
          <p className="text-gray-600 mb-6">{error || 'L\'evento richiesto non esiste o è stato rimosso.'}</p>
          <button 
            onClick={() => router.push('/?tab=events')}
            className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ← Torna agli Eventi
          </button>
        </div>
      </div>
    );
  }

  const catStyle = getCategoryStyle(event.category);
  const mapsLink = getGoogleMapsLink(event.location);
  const calendarLink = getGoogleCalendarLink();
  const eventTime = formatTime(event.eventDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${catStyle.bg} py-6`}>
        <div className="max-w-4xl mx-auto px-4">
          <button 
            onClick={() => router.push('/?tab=events')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Torna agli Eventi</span>
          </button>
          
          <div className="flex items-start gap-4">
            <span className="text-5xl">{catStyle.icon}</span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`${catStyle.bg} ${catStyle.text} px-3 py-1 rounded-full text-sm font-medium border`}>
                  {event.categoryLabel || event.category || 'Evento'}
                </span>
                {event.isFeatured && (
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" /> In evidenza
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{event.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
          
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-b">
            {/* Data */}
            <div className="p-5 border-b md:border-b-0 md:border-r">
              <div className="flex items-start gap-4">
                <div className="bg-coral-100 p-3 rounded-xl">
                  <CalendarDays className="h-6 w-6 text-coral-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium mb-1">📅 Data</p>
                  <p className="font-semibold text-gray-900">{formatDate(event.eventDate)}</p>
                  {eventTime && (
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Ore {eventTime}
                    </p>
                  )}
                  {calendarLink && (
                    <a
                      href={calendarLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-coral-600 hover:text-coral-700 mt-2 font-medium"
                    >
                      <Calendar className="h-4 w-4" />
                      Aggiungi al calendario
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Luogo */}
            <div className="p-5 border-b lg:border-b-0 lg:border-r">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium mb-1">📍 Luogo</p>
                  <p className="font-semibold text-gray-900">{event.location || 'Da definire'}</p>
                  {mapsLink && event.location && (
                    <a
                      href={mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2 font-medium"
                    >
                      <Navigation className="h-4 w-4" />
                      Apri in Google Maps
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Organizzatore */}
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium mb-1">🏢 Organizzatore</p>
                  <p className="font-semibold text-gray-900">{event.organizer || event.sourceLabel || 'VetBuddy'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Fonte: {event.sourceLabel || 'VetBuddy'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📝 Descrizione
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {event.description || 'Nessuna descrizione disponibile per questo evento.'}
            </p>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex flex-wrap gap-3">
              {/* Link al sito ufficiale */}
              {event.link && event.link.trim() !== '' && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Globe className="h-5 w-5" />
                  Sito Ufficiale
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              
              {/* Google Maps */}
              {mapsLink && event.location && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Navigation className="h-5 w-5" />
                  Indicazioni
                </a>
              )}
              
              {/* Share Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="bg-white hover:bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors border shadow-sm"
                >
                  <Share2 className="h-5 w-5" />
                  Condividi
                </button>
                
                {showShareMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border p-2 z-50 min-w-[200px]">
                    {navigator.share && (
                      <button
                        onClick={() => handleShare('native')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-3"
                      >
                        <Share2 className="h-5 w-5 text-gray-600" />
                        Condividi...
                      </button>
                    )}
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-3"
                    >
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleShare('telegram')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-3"
                    >
                      <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.144.121.101.154.237.169.333.015.095.034.312.019.481z"/>
                      </svg>
                      Telegram
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-3"
                    >
                      <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-3"
                    >
                      {copied ? (
                        <>
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-green-600">Link copiato!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-5 w-5 text-gray-600" />
                          Copia link
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button 
            onClick={() => router.push('/?tab=events')}
            className="text-coral-600 hover:text-coral-700 font-medium inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna alla lista Eventi
          </button>
        </div>
      </div>
      
      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
}
