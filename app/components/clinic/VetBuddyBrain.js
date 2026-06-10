'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, TrendingUp, Users, Award, MessageSquare, Search } from 'lucide-react';

export default function VetBuddyBrain({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const stats = {
    cases: 12453,
    contributors: 3421,
    questions: 8934,
    answers: 15672,
  };

  const topCases = [
    { title: 'Pancreatite acuta cane - Protocollo terapeutico', author: 'Dr. Rossi', views: 2341, likes: 234, specialty: 'Medicina Interna' },
    { title: 'Dermatite atopica gatto - Caso clinico risolto', author: 'Dr.ssa Bianchi', views: 1823, likes: 189, specialty: 'Dermatologia' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            VetBuddy Brain - Knowledge Base AI
          </h2>
          <p className="text-sm text-gray-500">Wikipedia + Stack Overflow per veterinari</p>
        </div>
        <Button className="bg-indigo-600"><Plus className="h-4 w-4 mr-2" />Condividi Caso</Button>
      </div>

      {/* Search AI */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Search className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">AI Semantic Search</h3>
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Es: gatto con vomito e letargia da 3 giorni..."
            className="mb-2"
          />
          <p className="text-xs text-indigo-700">L'AI trova casi clinici simili e soluzioni verificate dalla community</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><BookOpen className="h-6 w-6 text-indigo-600 mb-2" /><div className="text-2xl font-bold">{stats.cases.toLocaleString()}</div><p className="text-xs text-gray-500">Casi Clinici</p></CardContent></Card>
        <Card><CardContent className="p-4"><Users className="h-6 w-6 text-purple-600 mb-2" /><div className="text-2xl font-bold">{stats.contributors.toLocaleString()}</div><p className="text-xs text-gray-500">Veterinari</p></CardContent></Card>
        <Card><CardContent className="p-4"><MessageSquare className="h-6 w-6 text-blue-600 mb-2" /><div className="text-2xl font-bold">{stats.questions.toLocaleString()}</div><p className="text-xs text-gray-500">Domande</p></CardContent></Card>
        <Card><CardContent className="p-4"><Award className="h-6 w-6 text-yellow-600 mb-2" /><div className="text-2xl font-bold">{stats.answers.toLocaleString()}</div><p className="text-xs text-gray-500">Risposte</p></CardContent></Card>
      </div>

      {/* Top Cases */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Casi Clinici Più Visualizzati</h3>
        <div className="grid gap-3">
          {topCases.map((c, i) => (
            <Card key={i} className="hover:shadow-lg transition cursor-pointer">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{c.title}</h4>
                      <Badge variant="outline">{c.specialty}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">👨‍⚕️ {c.author}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>👁️ {c.views.toLocaleString()} visualizzazioni</span>
                      <span>❤️ {c.likes} likes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="p-4">
          <p className="text-sm text-indigo-800"><strong>🧠 Network Effect:</strong> LinkedIn per veterinari. Gamification: badge, reputation, leaderboard. Community = moat difendibile.</p>
        </CardContent>
      </Card>
    </div>
  );
}
