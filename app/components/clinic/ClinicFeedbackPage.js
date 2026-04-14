'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, ChevronLeft, Heart, Info, MessageCircle, RefreshCw, Send } from 'lucide-react';
import api from '@/app/lib/api';

function ClinicFeedbackPage({ user }) {
  const [feedbackForm, setFeedbackForm] = useState({
    type: null,
    subject: '',
    message: '',
    rating: 0
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const feedbackTypes = [
    { id: 'bug', label: '🐛 Segnala un bug', desc: 'Qualcosa non funziona come dovrebbe', color: 'from-red-50 to-red-100 border-red-200 hover:border-red-400' },
    { id: 'suggestion', label: '💡 Suggerimento', desc: 'Hai un\'idea per migliorare vetbuddy', color: 'from-amber-50 to-amber-100 border-amber-200 hover:border-amber-400' },
    { id: 'praise', label: '⭐ Complimento', desc: 'Dicci cosa ti piace!', color: 'from-green-50 to-green-100 border-green-200 hover:border-green-400' },
    { id: 'other', label: '📝 Altro', desc: 'Qualsiasi altro feedback', color: 'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.message.trim() || !feedbackForm.type) {
      alert('Seleziona un tipo e scrivi un messaggio');
      return;
    }
    
    setSending(true);
    try {
      const response = await api.post('feedback', feedbackForm);
      if (response.success) {
        setSent(true);
        setFeedbackForm({ type: null, subject: '', message: '', rating: 0 });
      }
    } catch (error) {
      alert('Errore: ' + (error.message || 'Impossibile inviare il feedback'));
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setSent(false);
    setFeedbackForm({ type: null, subject: '', message: '', rating: 0 });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="h-7 w-7 text-teal-500" />
          Feedback
        </h1>
        <p className="text-gray-500 mt-1">Aiutaci a migliorare vetbuddy con il tuo feedback</p>
      </div>

      {sent ? (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Grazie per il feedback! 🎉</h2>
            <p className="text-gray-600 mb-2">Il tuo messaggio è stato inviato al team vetbuddy.</p>
            <p className="text-gray-500 text-sm mb-6">Ti abbiamo inviato un'email di conferma.</p>
            <Button onClick={resetForm} className="bg-teal-500 hover:bg-teal-600">
              <Send className="h-4 w-4 mr-2" />
              Invia altro feedback
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Tipo di feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Che tipo di feedback vuoi inviarci?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {feedbackTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFeedbackForm(f => ({ ...f, type: type.id }))}
                    className={`p-4 rounded-xl border-2 transition-all text-left bg-gradient-to-br ${type.color} ${
                      feedbackForm.type === type.id ? 'ring-2 ring-teal-500 ring-offset-2' : ''
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.label.split(' ')[0]}</div>
                    <div className="font-semibold text-gray-800">{type.label.split(' ').slice(1).join(' ')}</div>
                    <div className="text-sm text-gray-600 mt-1">{type.desc}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form messaggio */}
          {feedbackForm.type && (
            <Card className="border-teal-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {feedbackTypes.find(t => t.id === feedbackForm.type)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Rating per complimenti */}
                  {feedbackForm.type === 'praise' && (
                    <div>
                      <Label className="mb-2 block">Quanto sei soddisfatto di vetbuddy?</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackForm(f => ({ ...f, rating: star }))}
                            className="text-3xl hover:scale-110 transition-transform"
                          >
                            {star <= feedbackForm.rating ? '⭐' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Oggetto (opzionale)</Label>
                    <Input
                      value={feedbackForm.subject}
                      onChange={(e) => setFeedbackForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder="Di cosa si tratta?"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Messaggio *</Label>
                    <Textarea
                      value={feedbackForm.message}
                      onChange={(e) => setFeedbackForm(f => ({ ...f, message: e.target.value }))}
                      placeholder={
                        feedbackForm.type === 'bug' ? 'Descrivi il problema che hai riscontrato, includendo i passaggi per riprodurlo se possibile...' :
                        feedbackForm.type === 'suggestion' ? 'Descrivi la tua idea per migliorare vetbuddy...' :
                        feedbackForm.type === 'praise' ? 'Cosa ti piace di vetbuddy? Cosa funziona particolarmente bene?' :
                        'Scrivi il tuo messaggio...'
                      }
                      rows={6}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setFeedbackForm(f => ({ ...f, type: null }))}
                      className="flex-1"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Indietro
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={sending || !feedbackForm.message.trim()} 
                      className="flex-1 bg-teal-500 hover:bg-teal-600"
                    >
                      {sending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Invio in corso...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Invia Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Info box */}
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Il tuo feedback conta!</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ogni segnalazione ci aiuta a migliorare vetbuddy. Leggiamo tutto e rispondiamo sempre. 
                    Per domande urgenti, scrivi a <a href="mailto:info@vetbuddy.it" className="text-teal-600 hover:underline">info@vetbuddy.it</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


// ==================== AUTOMAZIONI ====================

export default ClinicFeedbackPage;
