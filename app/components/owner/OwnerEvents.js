'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertCircle, Bell, Building2, CalendarDays, ChevronRight, Droplet, ExternalLink, Filter, Gift, Globe, Heart, Image, Info, Loader2, MapPin, PawPrint, PlusCircle, RefreshCw, Search, Sparkles, Star, Stethoscope, Zap } from 'lucide-react';

function OwnerEvents({ user, onNavigate }) {
  // VERSIONE 2.0 - Fix bottoni cliccabili - 2026-02-14 01:10
  const [events, setEvents] = useState([]);
  const [userPets, setUserPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState(null);
  const [showPersonalized, setShowPersonalized] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Mappa specie animali a categorie eventi
  const speciestoCategory = {
    'dog': 'cani',
    'cat': 'gatti',
    'horse': 'cavalli',
    'rabbit': 'conigli',
    'bird': 'uccelli',
    'reptile': 'rettili',
    'fish': 'pesci',
    'hamster': 'roditori',
    'ferret': 'furetti',
    'other': 'altro'
  };

  // Carica animali dell'utente
  const loadUserPets = async () => {
    try {
      const res = await fetch('/api/pets', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('vetbuddy_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserPets(data.pets || []);
      }
    } catch (err) {
      console.error('Error loading pets:', err);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      } else {
        setError('Impossibile caricare gli eventi');
      }
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadUserPets();
  }, []);

  // Ottieni categorie basate sugli animali dell'utente
  const getUserPetCategories = () => {
    const categories = new Set();
    userPets.forEach(pet => {
      const category = speciestoCategory[pet.species] || 'altro';
      categories.add(category);
    });
    return Array.from(categories);
  };

  // Eventi personalizzati per l'utente basati sui suoi animali
  const getPersonalizedEvents = () => {
    const petCategories = getUserPetCategories();
    if (petCategories.length === 0) return [];
    
    return events.filter(event => 
      petCategories.includes(event.category) || 
      event.category === 'generale' || 
      event.category === 'veterinaria' ||
      event.category === 'promo'
    ).sort((a, b) => {
      // Prioritizza eventi delle categorie degli animali dell'utente
      const aInPetCat = petCategories.includes(a.category);
      const bInPetCat = petCategories.includes(b.category);
      if (aInPetCat && !bInPetCat) return -1;
      if (!aInPetCat && bInPetCat) return 1;
      // Poi per data
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'veterinaria': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🏥' };
      case 'cani': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: '🐕' };
      case 'gatti': return { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🐱' };
      case 'cavalli': return { bg: 'bg-brown-100', text: 'text-yellow-800', icon: '🐴' };
      case 'conigli': return { bg: 'bg-pink-100', text: 'text-pink-700', icon: '🐰' };
      case 'uccelli': return { bg: 'bg-sky-100', text: 'text-sky-700', icon: '🐦' };
      case 'rettili': return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '🦎' };
      case 'pesci': return { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: '🐠' };
      case 'roditori': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🐹' };
      case 'furetti': return { bg: 'bg-rose-100', text: 'text-rose-700', icon: '🦡' };
      case 'altro': return { bg: 'bg-slate-100', text: 'text-slate-700', icon: '🐾' };
      case 'generale': return { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '🐾' };
      case 'promo': return { bg: 'bg-green-100', text: 'text-green-700', icon: '🎁' };
      case 'eventi': return { bg: 'bg-coral-100', text: 'text-coral-700', icon: '🎉' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '📰' };
    }
  };

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'veterinaria': return 'Salute & Benessere';
      case 'cani': return 'Per Cani';
      case 'gatti': return 'Per Gatti';
      case 'cavalli': return 'Per Cavalli';
      case 'conigli': return 'Per Conigli';
      case 'uccelli': return 'Per Uccelli';
      case 'rettili': return 'Per Rettili';
      case 'pesci': return 'Per Pesci';
      case 'roditori': return 'Per Roditori';
      case 'furetti': return 'Per Furetti';
      case 'altro': return 'Altri Animali';
      case 'generale': return 'Tutti gli Animali';
      case 'promo': return 'Promozioni';
      case 'eventi': return 'Eventi Locali';
      default: return 'News';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Autocomplete suggestions based on event titles and descriptions
  const getSearchSuggestions = () => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    const suggestions = new Set();
    
    events.forEach(event => {
      // Suggest matching titles
      if (event.title && event.title.toLowerCase().includes(query)) {
        suggestions.add(event.title);
      }
      // Suggest matching locations
      if (event.location && event.location.toLowerCase().includes(query)) {
        suggestions.add(event.location);
      }
      // Suggest matching organizers
      if (event.organizer && event.organizer.toLowerCase().includes(query)) {
        suggestions.add(event.organizer);
      }
    });
    
    // Also add category suggestions
    const categoryNames = ['Salute', 'Cani', 'Gatti', 'Cavalli', 'Conigli', 'Uccelli', 'Rettili', 'Pesci', 'Roditori', 'Promo', 'Eventi'];
    categoryNames.forEach(cat => {
      if (cat.toLowerCase().includes(query)) {
        suggestions.add(cat);
      }
    });
    
    return Array.from(suggestions).slice(0, 6);
  };

  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchSuggestions = getSearchSuggestions();

  const filteredEvents = (activeCategory === 'all' 
    ? events 
    : events.filter(e => e.category === activeCategory)
  ).filter(e => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (e.title && e.title.toLowerCase().includes(query)) ||
      (e.description && e.description.toLowerCase().includes(query)) ||
      (e.category && e.category.toLowerCase().includes(query))
    );
  });

  const personalizedEvents = getPersonalizedEvents();
  const petCategories = getUserPetCategories();

  const categories = [
    { id: 'all', label: 'Tutti', icon: CalendarDays },
    { id: 'veterinaria', label: 'Salute', icon: Stethoscope },
    { id: 'cani', label: 'Cani', icon: PawPrint },
    { id: 'gatti', label: 'Gatti', icon: PawPrint },
    { id: 'cavalli', label: 'Cavalli', icon: Heart },
    { id: 'conigli', label: 'Conigli', icon: Heart },
    { id: 'uccelli', label: 'Uccelli', icon: Sparkles },
    { id: 'rettili', label: 'Rettili', icon: Zap },
    { id: 'pesci', label: 'Pesci', icon: Droplet },
    { id: 'roditori', label: 'Roditori', icon: Star },
    { id: 'altro', label: 'Altro', icon: PlusCircle },
    { id: 'promo', label: 'Promo', icon: Gift },
    { id: 'eventi', label: 'Eventi', icon: MapPin },
  ];

  // Helper per ottenere emoji animale
  const getPetEmoji = (species) => {
    const emojiMap = {
      'dog': '🐕', 'cat': '🐱', 'horse': '🐴', 'rabbit': '🐰',
      'bird': '🦜', 'reptile': '🦎', 'fish': '🐠', 'hamster': '🐹',
      'ferret': '🦡', 'other': '🐾'
    };
    return emojiMap[species] || '🐾';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="h-7 w-7 text-coral-500" />
              Eventi & News
            </h1>
            <p className="text-gray-500 mt-1">Scopri eventi, notizie e promozioni per te e il tuo animale</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Aggiornamento auto
            </Badge>
            <Button variant="ghost" size="sm" onClick={loadEvents} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        {/* Search Bar with Autocomplete */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            placeholder="Cerca eventi, promozioni, notizie..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10"
          />
          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              {searchSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="w-full px-4 py-2 text-left hover:bg-coral-50 flex items-center gap-2 text-sm border-b border-gray-100 last:border-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchQuery(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  <Search className="h-3 w-3 text-gray-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sezione Eventi Personalizzati per i tuoi animali */}
      {userPets.length > 0 && personalizedEvents.length > 0 && (
        <div className="mb-8">
          <div 
            className="bg-gradient-to-r from-coral-500 via-orange-500 to-amber-500 rounded-2xl p-5 mb-4 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setShowPersonalized(!showPersonalized)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">📌 Eventi per te e i tuoi animali</h2>
                  <p className="text-white/80 text-sm">
                    {personalizedEvents.length} eventi consigliati per {' '}
                    {userPets.map(p => getPetEmoji(p.species)).join(' ')}
                  </p>
                </div>
              </div>
              <ChevronRight className={`h-6 w-6 text-white transition-transform ${showPersonalized ? 'rotate-90' : ''}`} />
            </div>
            
            {/* Mini cards degli animali dell'utente */}
            <div className="flex flex-wrap gap-2 mt-4">
              {userPets.slice(0, 5).map(pet => (
                <div key={pet.id} className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                  <span>{getPetEmoji(pet.species)}</span>
                  <span className="text-white text-sm font-medium">{pet.name}</span>
                </div>
              ))}
              {userPets.length > 5 && (
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <span className="text-white text-sm">+{userPets.length - 5} altri</span>
                </div>
              )}
            </div>
          </div>

          {/* Eventi personalizzati espansi */}
          {showPersonalized && (
            <div className="grid gap-4 md:grid-cols-2 mb-6 animate-in slide-in-from-top duration-300">
              {personalizedEvents.slice(0, 4).map(event => {
                const catStyle = getCategoryColor(event.category);
                const isForUserPet = petCategories.includes(event.category);
                return (
                  <Card key={event.id} className={`overflow-hidden hover:shadow-lg transition-all duration-200 group ${isForUserPet ? 'ring-2 ring-coral-300 ring-offset-2' : ''}`}>
                    <CardContent className="p-0">
                      <div className={`${catStyle.bg} p-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{catStyle.icon}</span>
                          <Badge className={`${catStyle.bg} ${catStyle.text} border-0 text-xs`}>
                            {getCategoryLabel(event.category)}
                          </Badge>
                        </div>
                        {isForUserPet && (
                          <Badge className="bg-coral-500 text-white text-xs">
                            <Heart className="h-3 w-3 mr-1" /> Per te
                          </Badge>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-coral-600 transition-colors">
                          {event.title}
                        </h3>
                        {event.eventDate && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(event.eventDate)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Info se l'utente non ha animali */}
      {userPets.length === 0 && !loading && (
        <button 
          onClick={() => onNavigate && onNavigate('pets')}
          className="w-full mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all cursor-pointer text-left"
        >
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <PawPrint className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-800">Aggiungi i tuoi animali!</p>
              <p className="text-sm text-blue-600 mt-1">
                Registra i tuoi animali per ricevere eventi e consigli personalizzati per cani, gatti, cavalli, conigli e molto altro.
              </p>
              <p className="text-sm text-blue-700 mt-2 font-medium flex items-center gap-1">
                Clicca qui per aggiungere un animale →
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-coral-500 text-white shadow-md'
                : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-coral-500 mb-4" />
          <p className="text-gray-500">Caricamento eventi...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="p-6 text-center border-red-200 bg-red-50">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-3" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadEvents} variant="outline" className="border-red-300 text-red-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Riprova
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredEvents.length === 0 && (
        <Card className="p-12 text-center">
          <CalendarDays className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun evento disponibile</h3>
          <p className="text-gray-500">Non ci sono eventi in questa categoria al momento. Torna presto!</p>
        </Card>
      )}

      {/* Events Grid */}
      {!loading && !error && filteredEvents.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredEvents.map(event => {
            const catStyle = getCategoryColor(event.category);
            const eventLink = event.link || '#';
            const detailText = `📅 ${event.title}\n\n${event.description || 'Nessuna descrizione disponibile.'}\n\n📍 Luogo: ${event.location || 'Non specificato'}\n📆 Data: ${event.eventDate ? new Date(event.eventDate).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Non specificata'}`;
            
            return (
              <div 
                key={event.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-200 group bg-white rounded-lg border border-gray-200"
              >
                {/* Event Image/Icon Header */}
                <div className={`${catStyle.bg} p-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{catStyle.icon}</span>
                    <Badge className={`${catStyle.bg} ${catStyle.text} border-0`}>
                      {getCategoryLabel(event.category)}
                    </Badge>
                  </div>
                  {event.isFeatured && (
                    <Badge className="bg-amber-500 text-white">
                      <Star className="h-3 w-3 mr-1" /> In evidenza
                    </Badge>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-coral-600 transition-colors">
                    {event.title}
                  </h3>
                  
                  {event.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                    {event.eventDate && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(event.eventDate)}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </span>
                    )}
                  </div>
                  
                  {/* Source and Action Button */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      {event.source === 'vetbuddy' ? (
                        <>
                          <PawPrint className="h-3 w-3 text-coral-400" />
                          vetbuddy
                        </>
                      ) : event.source === 'rss' ? (
                        <>
                          <Globe className="h-3 w-3" />
                          {event.sourceLabel || 'News Esterna'}
                        </>
                      ) : (
                        <>
                          <Building2 className="h-3 w-3" />
                          {event.organizer || 'Organizzatore'}
                        </>
                      )}
                    </span>
                    
                    <a 
                      href={`/eventi/${event.id}`}
                      className="bg-coral-500 hover:bg-coral-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors no-underline"
                    >
                      Vedi dettagli
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      {!loading && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Ricevi aggiornamenti</p>
              <p className="text-sm text-blue-600 mt-1">
                Presto potrai attivare le notifiche per ricevere aggiornamenti su eventi e promozioni nella tua zona!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Invita la tua Clinica

export default OwnerEvents;
