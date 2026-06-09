'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  CheckSquare, Clock, AlertCircle, Plus, User, Calendar, Flag,
  Phone, FileText, Send, Eye, RefreshCw, Filter, CheckCircle, X
} from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

const TASK_CATEGORIES = [
  { id: 'call', label: 'Richiamare cliente', icon: <Phone className="h-4 w-4" />, color: 'blue' },
  { id: 'document', label: 'Controllare referto', icon: <FileText className="h-4 w-4" />, color: 'purple' },
  { id: 'send', label: 'Inviare documento', icon: <Send className="h-4 w-4" />, color: 'green' },
  { id: 'estimate', label: 'Inviare preventivo', icon: <FileText className="h-4 w-4" />, color: 'amber' },
  { id: 'passport', label: 'Sollecitare Passport', icon: <Eye className="h-4 w-4" />, color: 'cyan' },
  { id: 'review', label: 'Recuperare cliente insoddisfatto', icon: <AlertCircle className="h-4 w-4" />, color: 'red' },
  { id: 'confirm', label: 'Confermare appuntamento', icon: <Calendar className="h-4 w-4" />, color: 'indigo' },
  { id: 'questionnaire', label: 'Verificare questionario', icon: <CheckSquare className="h-4 w-4" />, color: 'teal' },
];

export default function TaskManagerStaff({ user, onNavigate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    // Demo data con task automatici + manuali
    const demo = [
      // Task automatici generati da VetBuddy
      { id: '1', title: 'Richiamare Maria Rossi per Luna', category: 'call', priority: 'alta', assignedTo: 'Dr. Rossi', dueDate: new Date(Date.now() + 2 * 3600000).toISOString(), status: 'nuovo', source: 'auto', reason: 'Questionario pre-visita non compilato', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
      { id: '2', title: 'Controllare referto Rex - analisi sangue', category: 'document', priority: 'media', assignedTo: 'Dr. Bianchi', dueDate: new Date(Date.now() + 4 * 3600000).toISOString(), status: 'in_lavorazione', source: 'auto', reason: 'Referto lab ricevuto da laboratorio', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: '3', title: 'Inviare preventivo sterilizzazione a Marco Ferrara', category: 'estimate', priority: 'media', assignedTo: 'Receptionist', dueDate: new Date(Date.now() + 1 * 86400000).toISOString(), status: 'nuovo', source: 'manual', createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
      { id: '4', title: 'Sollecitare completamento Passport Birba', category: 'passport', priority: 'bassa', assignedTo: 'Receptionist', dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), status: 'nuovo', source: 'auto', reason: 'Passport creato ma incompleto da 7 giorni', createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
      { id: '5', title: 'Recuperare cliente insoddisfatto: Carlo Neri', category: 'review', priority: 'alta', assignedTo: 'Dr. Verdi', dueDate: new Date(Date.now() + 1 * 3600000).toISOString(), status: 'nuovo', source: 'auto', reason: 'Recensione negativa ricevuta', createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
      { id: '6', title: 'Confermare appuntamento Oscar domani mattina', category: 'confirm', priority: 'media', assignedTo: 'Receptionist', dueDate: new Date(Date.now() + 6 * 3600000).toISOString(), status: 'nuovo', source: 'auto', reason: 'Appuntamento non confermato a 24h', createdAt: new Date(Date.now() - 12 * 3600000).toISOString() },
      { id: '7', title: 'Verificare questionario urgenza Buddy', category: 'questionnaire', priority: 'alta', assignedTo: 'Dr. Rossi', dueDate: new Date(Date.now() + 30 * 60000).toISOString(), status: 'nuovo', source: 'auto', reason: 'Questionario compilato con urgenza ALTA', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
      { id: '8', title: 'Inviare certificato vaccinazione a Sara Colombo', category: 'send', priority: 'media', assignedTo: 'Receptionist', dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), status: 'completato', source: 'manual', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), completedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
      { id: '9', title: 'Richiamare Paolo Ricci per follow-up post-chirurgia', category: 'call', priority: 'media', assignedTo: 'Dr. Bianchi', dueDate: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'scaduto', source: 'auto', reason: 'Follow-up 48h post-operatorio', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
      { id: '10', title: 'Inviare preventivo pulizia dentale a Giulia Romano', category: 'estimate', priority: 'bassa', assignedTo: 'Receptionist', dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), status: 'nuovo', source: 'manual', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    ];
    setTasks(demo);
    setLoading(false);
  };

  const getPriorityBadge = (priority) => {
    const map = {
      alta: { label: 'Alta', cls: 'bg-red-500 text-white', icon: <Flag className="h-3 w-3" /> },
      media: { label: 'Media', cls: 'bg-amber-500 text-white', icon: <Flag className="h-3 w-3" /> },
      bassa: { label: 'Bassa', cls: 'bg-green-500 text-white', icon: <Flag className="h-3 w-3" /> },
    };
    const p = map[priority] || map.media;
    return <Badge className={p.cls}>{p.icon} {p.label}</Badge>;
  };

  const getStatusBadge = (status) => {
    const map = {
      nuovo: { label: 'Nuovo', cls: 'bg-blue-100 text-blue-700' },
      in_lavorazione: { label: 'In lavorazione', cls: 'bg-purple-100 text-purple-700' },
      completato: { label: 'Completato', cls: 'bg-green-100 text-green-700' },
      scaduto: { label: 'Scaduto', cls: 'bg-red-100 text-red-700' },
    };
    const s = map[status] || map.nuovo;
    return <Badge className={s.cls}>{s.label}</Badge>;
  };

  const filtered = tasks.filter(t => {
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterStaff !== 'all' && t.assignedTo !== filterStaff) return false;
    return true;
  });

  const stats = {
    today: tasks.filter(t => {
      const due = new Date(t.dueDate);
      const today = new Date();
      return due.toDateString() === today.toDateString();
    }).length,
    overdue: tasks.filter(t => t.status === 'scaduto' || (new Date(t.dueDate) < new Date() && t.status !== 'completato')).length,
    high: tasks.filter(t => t.priority === 'alta' && t.status !== 'completato').length,
    auto: tasks.filter(t => t.source === 'auto').length,
  };

  const staffMembers = ['all', ...new Set(tasks.map(t => t.assignedTo))];

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="h-8 w-8 animate-spin text-blue-500" /></div>;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-blue-500" /> Task Manager Staff
        </h2>
        <p className="text-gray-500 text-sm">Gestisci attività operative dello staff con task manuali e automatici</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{stats.today}</p>
            <p className="text-xs text-blue-600">Task di oggi</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
            <p className="text-xs text-red-600">Scaduti</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <Flag className="h-6 w-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-700">{stats.high}</p>
            <p className="text-xs text-amber-600">Priorità alta</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <RefreshCw className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-700">{stats.auto}</p>
            <p className="text-xs text-purple-600">Generati auto</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuovo Task
        </Button>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="border rounded px-3 py-1 text-sm"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">Tutte le priorità</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="bassa">Bassa</option>
          </select>
          <select
            className="border rounded px-3 py-1 text-sm"
            value={filterStaff}
            onChange={(e) => setFilterStaff(e.target.value)}
          >
            {staffMembers.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'Tutto lo staff' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Attivi ({tasks.filter(t => t.status !== 'completato').length})</TabsTrigger>
          <TabsTrigger value="today">Oggi ({stats.today})</TabsTrigger>
          <TabsTrigger value="overdue">Scaduti ({stats.overdue})</TabsTrigger>
          <TabsTrigger value="completed">Completati ({tasks.filter(t => t.status === 'completato').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-3">
            {filtered.filter(t => t.status !== 'completato').map((task) => {
              const cat = TASK_CATEGORIES.find(c => c.id === task.category);
              const isOverdue = new Date(task.dueDate) < new Date();
              return (
                <Card key={task.id} className={`hover:shadow-md transition ${
                  task.priority === 'alta' ? 'border-red-300 bg-red-50/30' : 
                  isOverdue ? 'border-amber-300 bg-amber-50/30' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 bg-${cat?.color}-100 rounded-full flex items-center justify-center shrink-0`}>
                        {cat?.icon || <CheckSquare className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{task.title}</h4>
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.status)}
                          {task.source === 'auto' && <Badge className="bg-purple-100 text-purple-700 text-xs"><RefreshCw className="h-3 w-3 mr-1" />Auto</Badge>}
                        </div>
                        {task.reason && <p className="text-sm text-gray-600 mb-2">🤖 Motivo: {task.reason}</p>}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assignedTo}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Scadenza: {new Date(task.dueDate).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {isOverdue && <span className="text-red-600 font-semibold">⚠️ SCADUTO</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => alert('Task completato! (Demo)')}>
                          <CheckCircle className="h-3 w-3 mr-1" />Completa
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />Dettagli
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="today">
          <div className="space-y-3">
            {filtered.filter(t => {
              const due = new Date(t.dueDate);
              const today = new Date();
              return due.toDateString() === today.toDateString();
            }).map((task) => {
              const cat = TASK_CATEGORIES.find(c => c.id === task.category);
              return (
                <Card key={task.id} className="border-blue-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 bg-${cat?.color}-100 rounded-full flex items-center justify-center`}>
                          {cat?.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{task.title}</h4>
                          <p className="text-xs text-gray-500">{task.assignedTo} - Scadenza: {new Date(task.dueDate).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                          Completa
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="overdue">
          <div className="space-y-3">
            {filtered.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completato').map((task) => {
              const cat = TASK_CATEGORIES.find(c => c.id === task.category);
              return (
                <Card key={task.id} className="border-red-300 bg-red-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                        <div>
                          <h4 className="font-semibold text-sm">{task.title}</h4>
                          <p className="text-xs text-red-600">Scaduto: {new Date(task.dueDate).toLocaleDateString('it-IT')}</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                        Gestisci Ora
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.filter(t => t.status === 'completato').map((task) => {
              const cat = TASK_CATEGORIES.find(c => c.id === task.category);
              return (
                <Card key={task.id} className="border-green-200 bg-green-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{task.title}</h4>
                        <p className="text-xs text-green-600">✓ Completato il {new Date(task.completedAt).toLocaleDateString('it-IT')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Task Modal */}
      {showNew && (
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Task Manuale</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {TASK_CATEGORIES.map(cat => (
                    <Button key={cat.id} variant="outline" size="sm" className="justify-start">
                      {cat.icon} <span className="ml-2">{cat.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Titolo task *</label>
                <Input placeholder="Es: Richiamare Mario Rossi" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Assegna a *</label>
                  <select className="w-full border rounded px-3 py-2">
                    {staffMembers.filter(s => s !== 'all').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priorità *</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="bassa">Bassa</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Scadenza *</label>
                <Input type="datetime-local" />
              </div>
              <div>
                <label className="text-sm font-medium">Note</label>
                <Textarea placeholder="Aggiungi note o istruzioni..." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNew(false)}>Annulla</Button>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => { alert('Task creato! (Demo)'); setShowNew(false); }}>
                <Plus className="h-4 w-4 mr-1" />Crea Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          <RefreshCw className="h-4 w-4 inline mr-1" />
          <strong>Task Automatici:</strong> VetBuddy crea automaticamente task quando: questionario non compilato, referto lab ricevuto, Passport incompleto da 7+ giorni, recensione negativa, appuntamento non confermato a 24h, follow-up post-operatorio.
        </p>
      </div>
    </div>
  );
}
