'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, MapPin, Clock, ExternalLink, Share2, Building2, Globe, Star, Navigation, Copy, Check, Calendar, Mail, GraduationCap } from 'lucide-react';

export default function ClinicEventDetailPage() {
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
        console.log('Fetching event with ID:', params.id);
        const response = await fetch(`/api/clinic/events/${params.id}`);
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error('Evento non trovato');
        }
        const data = await response.json();
        console.log('Event data:', data);
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    } else {
      setLoading(false);
      setError('ID evento non specificato');
    }
  }, [params.id]);

  const getTypeStyle = (type) => {
    const styles = {
      congresso: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🏛️', label: 'Congresso' },
      corso: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📚', label: 'Corso' },
      webinar: { bg: 'bg-green-100', text: 'text-green-700', icon: '💻', label: 'Webinar' },
      workshop: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🔧', label: 'Workshop' },
    };
    return styles[type] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: '📅', label: 'Evento' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('it-IT', options);
  };

  const formatDateRange = (start, end) => {
    if (!start) return '';
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : startDate;
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    if (start === end || !end) {
      return startDate.toLocaleDateString('it-IT', { weekday: 'long', ...options });
    }
    return `${startDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('it-IT', options)}`;
  };

  // Share functions
  const handleShare = async (method) => {
    const shareUrl = window.location.href;
    const eventDate = formatDateRange(event.date, event.endDate);
    const eventLocation = event.location || 'Luogo da definire';
    const eventDescription = event.description || '';
    
    // Messaggio completo con descrizione
    const shareTextWhatsApp = `${event.title}\n📅 ${eventDate}\n📍 ${eventLocation}\n\n${eventDescription}\n\n${shareUrl}`;
    
    // Messaggio per altri canali
    const shareText = `${event.title}\n📅 ${eventDate}\n📍 ${eventLocation}\n\n${eventDescription}`;
    
    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareTextWhatsApp)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_blank');
        break;
      case 'copy':
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  // Add to calendar
  const addToCalendar = () => {
    const startDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : new Date(event.date);
    endDate.setDate(endDate.getDate() + 1);
    
    const formatDateForCalendar = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 8);
    };
    
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
    
    window.open(calendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Caricamento evento...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-6xl mb-4">😿</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Evento non trovato</h2>
          <p className="text-gray-500 mb-4">{error || 'L\'evento richiesto non esiste'}</p>
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:underline flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" /> Torna indietro
          </button>
        </div>
      </div>
    );
  }

  const typeStyle = getTypeStyle(event.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Torna agli Eventi
          </button>
          
          <div className="flex items-start gap-4">
            <div className="text-4xl">{typeStyle.icon}</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                  {typeStyle.label}
                </span>
                {event.featured && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-400 text-yellow-900 flex items-center gap-1">
                    <Star className="h-3 w-3" /> In evidenza
                  </span>
                )}
                {event.ecm && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-400 text-green-900 flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" /> ECM {event.ecmCredits && `(${event.ecmCredits} crediti)`}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{event.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Data */}
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <CalendarDays className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">📅 Data</p>
                <p className="font-semibold text-gray-900">{formatDateRange(event.date, event.endDate)}</p>
                <button
                  onClick={addToCalendar}
                  className="text-red-500 text-sm hover:underline mt-2 flex items-center gap-1"
                >
                  <Calendar className="h-3 w-3" /> Aggiungi al calendario
                </button>
              </div>
            </div>

            {/* Luogo */}
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <MapPin className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">📍 Luogo</p>
                <p className="font-semibold text-gray-900">{event.location || 'Online'}</p>
                {event.location && !event.location.toLowerCase().includes('online') && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm hover:underline mt-2 flex items-center gap-1"
                  >
                    <Navigation className="h-3 w-3" /> Apri in Google Maps
                  </a>
                )}
              </div>
            </div>

            {/* Organizzatore */}
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Building2 className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">🏢 Organizzatore</p>
                <p className="font-semibold text-gray-900">{event.organizer || 'Non specificato'}</p>
                {event.organizer && (
                  <p className="text-gray-500 text-sm">Fonte: {event.organizer}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Topics */}
        {event.topics && event.topics.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🏷️ Argomenti</h2>
            <div className="flex flex-wrap gap-2">
              {event.topics.map((topic, index) => (
                <span key={index} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📝 Descrizione</h2>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {event.description || 'Nessuna descrizione disponibile.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-red-400 hover:bg-red-500 text-white rounded-xl font-medium transition-colors"
            >
              <Globe className="h-5 w-5" /> Sito Ufficiale <ExternalLink className="h-4 w-4" />
            </a>
          )}
          
          {event.location && !event.location.toLowerCase().includes('online') && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              <Navigation className="h-5 w-5" /> Indicazioni
            </a>
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <Share2 className="h-5 w-5" /> Condividi
            </button>
            
            {/* Share Menu */}
            {showShareMenu && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowShareMenu(false)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-lg font-bold mb-4">Condividi evento</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 rounded-xl flex items-center gap-3 transition-colors"
                    >
                      <div className="bg-green-100 p-2 rounded-lg">
                        <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <span className="font-medium">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleShare('telegram')}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl flex items-center gap-3 transition-colors"
                    >
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                      </div>
                      <span className="font-medium">Telegram</span>
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl flex items-center gap-3 transition-colors"
                    >
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <span className="font-medium">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('email')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl flex items-center gap-3 transition-colors"
                    >
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="font-medium">Email</span>
                    </button>
                    <hr className="my-3" />
                    <button
                      onClick={() => handleShare('copy')}
                      className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${
                        copied ? 'bg-green-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${copied ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-600" />}
                      </div>
                      <span className="font-medium">{copied ? 'Copiato!' : 'Copia link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.back()}
            className="text-red-500 hover:underline flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" /> Torna alla lista Eventi
          </button>
        </div>
      </div>
    </div>
  );
}
