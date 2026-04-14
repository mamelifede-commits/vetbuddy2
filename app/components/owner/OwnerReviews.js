'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, PawPrint, RefreshCw, Star } from 'lucide-react';
import api from '@/app/lib/api';

function OwnerReviews({ user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await api.get('reviews/my-reviews');
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="mt-2 text-gray-500">Caricamento recensioni...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Le mie recensioni</h2>
          <p className="text-gray-500">Recensioni che hai lasciato alle cliniche</p>
        </div>
        <Button variant="outline" onClick={loadReviews}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Aggiorna
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Star className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna recensione</h3>
            <p className="text-gray-500 mb-4">Non hai ancora lasciato recensioni alle cliniche.</p>
            <p className="text-sm text-gray-400">Dopo una visita, potrai lasciare una recensione dalla sezione "Trova clinica".</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-coral-100 to-coral-200 rounded-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-coral-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.clinicName || 'Clinica'}</h4>
                      <p className="text-sm text-gray-500">{review.clinicAddress || ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderStars(review.overallRating || review.rating)}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                {review.comment && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-3">
                    <p className="text-gray-700 italic">"{review.comment}"</p>
                  </div>
                )}
                
                {/* Dettagli aggiuntivi recensione */}
                {(review.punctuality || review.competence || review.price) && (
                  <div className="mt-3 grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                    {review.punctuality && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Puntualità</p>
                        {renderStars(review.punctuality)}
                      </div>
                    )}
                    {review.competence && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Competenza</p>
                        {renderStars(review.competence)}
                      </div>
                    )}
                    {review.price && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Prezzo</p>
                        {renderStars(review.price)}
                      </div>
                    )}
                  </div>
                )}
                
                {review.petName && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <PawPrint className="h-4 w-4" />
                    <span>Visita per: {review.petName}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente Eventi & News per Proprietari

export default OwnerReviews;
