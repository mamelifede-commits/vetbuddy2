'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, MapPin, Clock, Users, ExternalLink, Share2, PawPrint, Building2, Globe, Star } from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      tutti: { bg: 'bg-coral-100', text: 'text-coral-700', icon: '🐾' }
    };
    return styles[category] || styles.tutti;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Data non specificata';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Condivisione annullata');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiato negli appunti!');
    }
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
            onClick={() => router.back()}
            className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ← Torna indietro
          </button>
        </div>
      </div>
    );
  }

  const catStyle = getCategoryStyle(event.category);

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
              <div className="flex items-center gap-2 mb-2">
                <span className={`${catStyle.bg} ${catStyle.text} px-3 py-1 rounded-full text-sm font-medium border`}>
                  {event.category || 'Evento'}
                </span>
                {event.isFeatured && (
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" /> In evidenza
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          {/* Info Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b">
            {event.eventDate && (
              <div className="flex items-center gap-3">
                <div className="bg-coral-100 p-3 rounded-lg">
                  <CalendarDays className="h-6 w-6 text-coral-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-medium text-gray-900">{formatDate(event.eventDate)}</p>
                </div>
              </div>
            )}
            
            {event.location && (
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Luogo</p>
                  <p className="font-medium text-gray-900">{event.location}</p>
                </div>
              </div>
            )}
            
            {event.organizer && (
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Organizzatore</p>
                  <p className="font-medium text-gray-900">{event.organizer}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Descrizione</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {event.description || 'Nessuna descrizione disponibile per questo evento.'}
            </p>
          </div>

          {/* Source */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            {event.source === 'vetbuddy' ? (
              <>
                <PawPrint className="h-4 w-4 text-coral-400" />
                <span>Pubblicato da VetBuddy</span>
              </>
            ) : event.source === 'rss' ? (
              <>
                <Globe className="h-4 w-4" />
                <span>Fonte: {event.sourceLabel || 'News Esterna'}</span>
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                <span>Organizzato da {event.organizer || 'Partner VetBuddy'}</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {event.link && (
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                Vai al sito ufficiale
                <ExternalLink className="h-5 w-5" />
              </a>
            )}
            
            <button
              onClick={handleShare}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Share2 className="h-5 w-5" />
              Condividi
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button 
            onClick={() => router.push('/')}
            className="text-coral-600 hover:text-coral-700 font-medium"
          >
            ← Torna alla Home
          </button>
        </div>
      </div>
    </div>
  );
}
