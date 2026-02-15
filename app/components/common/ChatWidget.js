'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, SendHorizontal } from 'lucide-react';
import VetBuddyLogo from './VetBuddyLogo';

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Generate session ID on mount
  useEffect(() => {
    setSessionId('chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
  }, []);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Ciao! 👋 Sono vetbuddy AI, il tuo assistente virtuale. Posso aiutarti con informazioni su vetbuddy, guidarti nella piattaforma o rispondere a domande generali sulla cura dei tuoi animali. Come posso aiutarti oggi?'
      }]);
    }
  }, [isOpen, messages.length]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0 ? true : false),
          sessionId
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        if (data.sessionId) setSessionId(data.sessionId);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '❌ Mi dispiace, si è verificato un errore. Riprova tra qualche istante.' 
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Errore di connessione. Verifica la tua connessione internet e riprova.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const quickQuestions = [
    'Come prenoto una visita?',
    "Cos'è il programma premi?",
    'Come funziona la fatturazione?',
    'Quali sono i piani disponibili?'
  ];
  
  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-gray-600 hover:bg-gray-700 rotate-90' 
            : 'bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 animate-pulse hover:animate-none'
        }`}
        title={isOpen ? 'Chiudi chat' : 'Apri assistente'}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>
      
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-coral-500 to-coral-600 px-4 py-3 flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <VetBuddyLogo size={28} className="[&>div]:shadow-none [&>div]:bg-transparent" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">vetbuddy AI</h3>
              <p className="text-white/80 text-xs">Assistente virtuale</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-white/80 text-xs">Online</span>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80 min-h-[200px] bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user' 
                    ? 'bg-coral-500 text-white rounded-br-md' 
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-coral-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                      <span className="h-2 w-2 bg-coral-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="h-2 w-2 bg-coral-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
                    <span className="text-xs text-gray-500">Sto pensando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Quick Questions (show only if no user messages) */}
          {messages.filter(m => m.role === 'user').length === 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-500 mb-2">Domande frequenti:</p>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setInputValue(q); }}
                    className="text-xs bg-gray-100 hover:bg-coral-50 hover:text-coral-600 text-gray-600 px-2.5 py-1.5 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scrivi un messaggio..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-coral-300 focus:bg-white transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                  inputValue.trim() && !isLoading
                    ? 'bg-coral-500 hover:bg-coral-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2">
              Powered by AI • Non sostituisce il parere del veterinario
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWidget;
