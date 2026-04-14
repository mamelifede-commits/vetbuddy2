'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, Euro, Gift, Heart, Mail, MessageCircle, RefreshCw, Scissors, Sparkles, Star } from 'lucide-react';
import api from '@/app/lib/api';

function OwnerRewardsSection({ user }) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const data = await api.get('rewards/my-rewards');
      setRewards(data || []);
    } catch (error) {
      console.error('Error loading rewards:', error);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId) => {
    if (!confirm('Vuoi riscattare questo premio? La clinica riceverà una notifica e potrai usarlo alla prossima visita.')) return;
    
    setRedeeming(rewardId);
    try {
      await api.post('rewards/redeem', { rewardId });
      alert('🎉 Premio riscattato! La clinica è stata notificata. Mostra il codice alla tua prossima visita.');
      loadRewards(); // Reload to update status
    } catch (error) {
      alert('Errore: ' + (error.message || 'Impossibile riscattare il premio'));
    } finally {
      setRedeeming(null);
    }
  };

  const getRewardIcon = (iconName) => {
    const icons = {
      Gift: <Gift className="h-8 w-8" />,
      Euro: <Euro className="h-8 w-8" />,
      Scissors: <Scissors className="h-8 w-8" />,
      Heart: <Heart className="h-8 w-8" />,
      Star: <Star className="h-8 w-8" />,
      Sparkles: <Sparkles className="h-8 w-8" />
    };
    return icons[iconName] || <Gift className="h-8 w-8" />;
  };

  const getRewardValue = (reward) => {
    switch (reward.rewardType) {
      case 'discount_percent': return `-${reward.rewardValue}%`;
      case 'discount_fixed': return `-€${reward.rewardValue}`;
      case 'free_service': return 'Servizio Gratis';
      case 'free_product': return 'Prodotto Gratis';
      case 'gift': return 'Regalo';
      default: return 'Premio';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-700">Disponibile</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700">In attesa conferma</Badge>;
      case 'used':
        return <Badge className="bg-gray-100 text-gray-600">Utilizzato</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-700">Scaduto</Badge>;
      default:
        return null;
    }
  };

  const availableRewards = rewards.filter(r => r.status === 'available');
  const pendingRewards = rewards.filter(r => r.status === 'pending');
  const usedRewards = rewards.filter(r => r.status === 'used' || r.status === 'expired');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-coral-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="h-7 w-7 text-amber-500" />
            I Miei Premi
          </h1>
          <p className="text-gray-500 mt-1">Premi fedeltà dalle tue cliniche</p>
        </div>
        <div className="flex gap-2">
          {availableRewards.length > 0 && (
            <Badge className="bg-green-100 text-green-700 text-lg px-4 py-2">
              {availableRewards.length} disponibili
            </Badge>
          )}
          {pendingRewards.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 text-lg px-4 py-2">
              {pendingRewards.length} in attesa
            </Badge>
          )}
        </div>
      </div>

      {/* Pending Rewards (Already redeemed, waiting for clinic confirmation) */}
      {pendingRewards.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-amber-700 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Premi Riscattati - In Attesa Conferma
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingRewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg animate-pulse">
                      {getRewardIcon(reward.rewardIcon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{reward.rewardName}</h3>
                      <p className="text-2xl font-bold text-green-600 my-1">{getRewardValue(reward)}</p>
                      {getStatusBadge(reward.status)}
                    </div>
                  </div>
                  
                  {/* Codice Premio */}
                  {reward.redeemCode && (
                    <div className="mt-4 p-3 bg-gray-900 rounded-lg text-center">
                      <p className="text-amber-400 text-xs uppercase tracking-wider mb-1">Codice Premio</p>
                      <p className="text-white font-mono text-2xl font-bold tracking-widest">{reward.redeemCode}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <p className="text-sm text-amber-700 text-center">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Mostra questo codice in clinica per completare il riscatto
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Rewards */}
      {availableRewards.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Premi Disponibili
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableRewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-lg">
                      {getRewardIcon(reward.rewardIcon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{reward.rewardName}</h3>
                      <p className="text-2xl font-bold text-green-600 my-1">{getRewardValue(reward)}</p>
                      {reward.rewardDescription && (
                        <p className="text-sm text-gray-600">{reward.rewardDescription}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Codice Premio */}
                  {reward.redeemCode && (
                    <div className="mt-4 p-3 bg-gray-900 rounded-lg text-center">
                      <p className="text-amber-400 text-xs uppercase tracking-wider mb-1">Il tuo codice</p>
                      <p className="text-white font-mono text-2xl font-bold tracking-widest">{reward.redeemCode}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Da: <strong>{reward.clinicName}</strong></span>
                      {reward.expiresAt && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Scade: {new Date(reward.expiresAt).toLocaleDateString('it-IT')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Motivo: {reward.reason}</p>
                  </div>

                  {/* Redeem Button */}
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold"
                    onClick={() => handleRedeemReward(reward.id)}
                    disabled={redeeming === reward.id}
                  >
                    {redeeming === reward.id ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Riscattando...</>
                    ) : (
                      <><Gift className="h-4 w-4 mr-2" /> Riscatta Online</>
                    )}
                  </Button>

                  {/* Contact clinic */}
                  <div className="mt-3 flex gap-2">
                    {reward.clinicWhatsapp && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
                        onClick={() => window.open(`https://wa.me/${reward.clinicWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Ciao! Vorrei utilizzare il mio premio "${reward.rewardName}" - Codice: ${reward.redeemCode}`)}`, '_blank')}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                    {reward.clinicEmail && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                        onClick={() => window.location.href = `mailto:${reward.clinicEmail}?subject=${encodeURIComponent(`Riscatto Premio: ${reward.rewardName}`)}&body=${encodeURIComponent(`Buongiorno,\n\nVorrei riscattare il mio premio "${reward.rewardName}".\n\nCodice premio: ${reward.redeemCode}\n\nGrazie!`)}`}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Messaggio
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : pendingRewards.length === 0 && (
        <Card className="text-center py-12 bg-gray-50">
          <CardContent>
            <div className="h-20 w-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Gift className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nessun premio disponibile</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Non hai ancora ricevuto premi dalle tue cliniche. Continua a prenderti cura dei tuoi animali e potresti ricevere premi fedeltà!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Used Rewards History */}
      {usedRewards.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-gray-500 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Premi Utilizzati
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {usedRewards.map((reward) => (
              <Card key={reward.id} className="opacity-60 bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 line-through">{reward.rewardName}</h3>
                      <p className="text-sm text-gray-500">
                        Usato il {new Date(reward.usedAt).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== OWNER REVIEWS ====================

export default OwnerRewardsSection;
