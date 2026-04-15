'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { FlaskConical, MapPin, Truck, Clock, Star, Euro } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const mapContainerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '16px',
};

const defaultCenter = { lat: 43.0, lng: 12.5 }; // Center of Italy

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', stylers: [{ color: '#c9d6ff' }] },
    { featureType: 'landscape', stylers: [{ color: '#f0f4ff' }] },
  ],
};

export default function LabMapView({ labs, clinicLocation, onSelectLab }) {
  const [selectedPin, setSelectedPin] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    // Fit bounds to show all labs
    if (labs.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      labs.forEach(lab => {
        const lat = parseFloat(lab.latitude || lab.lat);
        const lng = parseFloat(lab.longitude || lab.lng);
        if (lat && lng) bounds.extend({ lat, lng });
      });
      if (clinicLocation?.lat && clinicLocation?.lng) {
        bounds.extend(clinicLocation);
      }
      map.fitBounds(bounds, { padding: 50 });
    }
  }, [labs, clinicLocation]);

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 text-sm">Errore caricamento mappa</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl h-[320px] flex items-center justify-center border border-purple-200">
        <div className="flex items-center gap-2 text-purple-500">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Caricamento mappa...</span>
        </div>
      </div>
    );
  }

  const validLabs = labs.filter(lab => {
    const lat = parseFloat(lab.latitude || lab.lat);
    const lng = parseFloat(lab.longitude || lab.lng);
    return !isNaN(lat) && !isNaN(lng);
  });

  const center = validLabs.length > 0
    ? {
        lat: validLabs.reduce((sum, l) => sum + parseFloat(l.latitude || l.lat), 0) / validLabs.length,
        lng: validLabs.reduce((sum, l) => sum + parseFloat(l.longitude || l.lng), 0) / validLabs.length,
      }
    : clinicLocation || defaultCenter;

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-purple-200">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={6}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {/* Clinic marker */}
        {clinicLocation?.lat && clinicLocation?.lng && (
          <MarkerF
            position={clinicLocation}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52" width="32" height="42">
                  <path d="M20 0C9 0 0 9 0 20c0 15 20 32 20 32s20-17 20-32C40 9 31 0 20 0z" fill="#EF4444"/>
                  <circle cx="20" cy="18" r="8" fill="white"/>
                  <text x="20" y="22" text-anchor="middle" font-size="12" fill="#EF4444">+</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 42),
            }}
            title="La tua clinica"
          />
        )}

        {/* Lab markers */}
        {validLabs.map((lab) => {
          const lat = parseFloat(lab.latitude || lab.lat);
          const lng = parseFloat(lab.longitude || lab.lng);
          const isConnected = lab.connectionStatus === 'active';
          const isPending = lab.connectionStatus === 'pending';
          const pinColor = isConnected ? '#10B981' : isPending ? '#F59E0B' : '#7C3AED';
          
          return (
            <MarkerF
              key={lab.id}
              position={{ lat, lng }}
              onClick={() => setSelectedPin(lab)}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52" width="36" height="48">
                    <path d="M20 0C9 0 0 9 0 20c0 15 20 32 20 32s20-17 20-32C40 9 31 0 20 0z" fill="${pinColor}"/>
                    <circle cx="20" cy="18" r="10" fill="white"/>
                    <text x="20" y="22" text-anchor="middle" font-size="14" fill="${pinColor}">⚗</text>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(36, 48),
              }}
              title={lab.labName}
            />
          );
        })}

        {/* Info Window */}
        {selectedPin && (
          <InfoWindowF
            position={{
              lat: parseFloat(selectedPin.latitude || selectedPin.lat),
              lng: parseFloat(selectedPin.longitude || selectedPin.lng),
            }}
            onCloseClick={() => setSelectedPin(null)}
          >
            <div className="p-1 min-w-[220px] max-w-[280px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-sm">⚗️</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{selectedPin.labName}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span>📍</span> {selectedPin.city}
                  </p>
                </div>
              </div>
              
              {selectedPin.specializations?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedPin.specializations.slice(0, 3).map(s => (
                    <span key={s} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-medium">{s}</span>
                  ))}
                  {selectedPin.specializations.length > 3 && (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">+{selectedPin.specializations.length - 3}</span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 text-[11px] text-gray-600 mb-2">
                {selectedPin.pickupAvailable && (
                  <span className="flex items-center gap-0.5">🚚 Ritiro</span>
                )}
                {selectedPin.averageReportTime && (
                  <span className="flex items-center gap-0.5">⏱️ {selectedPin.averageReportTime}</span>
                )}
                {selectedPin.priceList?.length > 0 && (
                  <span className="flex items-center gap-0.5">💶 {selectedPin.priceList.length} esami</span>
                )}
              </div>

              <button
                onClick={() => { onSelectLab(selectedPin); setSelectedPin(null); }}
                className="w-full text-center bg-purple-600 text-white text-xs font-medium py-1.5 px-3 rounded-md hover:bg-purple-700 transition"
              >
                Vedi Dettagli
              </button>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Disponibile</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Collegato</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> In attesa</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> La tua clinica</span>
      </div>
    </div>
  );
}
