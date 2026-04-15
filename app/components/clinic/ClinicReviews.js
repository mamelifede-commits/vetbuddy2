'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Star, User } from 'lucide-react';
import api from '@/app/lib/api';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

function ClinicReviews({ onNavigate }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('clinic/reviews');
      const reviewsData = res.reviews || res || [];
      setReviews(reviewsData);
      
      // Calcola statistiche
      if (reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, r) => sum + (r.overallRating || 0), 0);
        const avg = totalRating / reviewsData.length;
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach(r => {
          const rating = Math.round(r.overallRating || 0);
          if (distribution[rating] !== undefined) distribution[rating]++;
        });
        setStats({ avg, total: reviewsData.length, distribution });
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Recensioni</h2>
          <p className="text-gray-500 text-sm">Cosa dicono i tuoi clienti</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-coral-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-500 mt-4">Caricamento recensioni...</p>
        </div>
      ) : (
        <>
          {/* Stats Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Rating medio */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-coral-500">{stats.avg.toFixed(1)}</div>
                  <div className="flex justify-center gap-1 my-2">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-5 w-5 ${s <= Math.round(stats.avg) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-500">{stats.total} recensioni totali</p>
                </div>
                
                {/* Distribuzione */}
                <div className="col-span-2 space-y-2">
                  {[5,4,3,2,1].map(rating => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="w-8 text-sm">{rating} ⭐</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full transition-all"
                          style={{ width: `${stats.total > 0 ? (stats.distribution[rating] / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm text-gray-500">{stats.distribution[rating]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista recensioni */}
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nessuna recensione ancora</p>
                <p className="text-sm mt-2">Quando i tuoi clienti lasceranno una recensione, appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-coral-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-coral-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{review.ownerName || 'Cliente vetbuddy'}</p>
                          <p className="text-sm text-gray-500">{review.petName && `Proprietario di ${review.petName}`}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`h-4 w-4 ${s <= review.overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString('it-IT')}</p>
                      </div>
                    </div>
                    
                    {review.comment && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 italic">"{review.comment}"</p>
                      </div>
                    )}
                    
                    <div className="flex gap-6 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Puntualità: {review.punctuality}/5</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Competenza: {review.competence}/5</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Prezzo: {review.price}/5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ==================== FEEDBACK SECTION ====================

export default ClinicReviews;
