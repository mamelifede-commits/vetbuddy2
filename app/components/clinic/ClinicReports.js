'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle, ChevronLeft, ChevronRight, Clock, CreditCard, Download, Euro, Eye, FileText, Filter, Inbox, Mail, MessageCircle, PawPrint, Phone, Receipt, RefreshCw, Send, Stethoscope, Ticket, TrendingUp, User, Users, Video, X } from 'lucide-react';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

function ClinicReports({ appointments, documents, messages, owners, pets, onNavigate, onOpenOwner, onOpenPet }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOwnerDetail, setSelectedOwnerDetail] = useState(null);
  const [selectedPetDetail, setSelectedPetDetail] = useState(null);
  const [selectedDocDetail, setSelectedDocDetail] = useState(null);
  
  // Calculate statistics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  // Filter by date helper
  const filterByMonth = (items, dateField, month, year) => 
    items.filter(item => {
      const d = new Date(item[dateField]);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  
  // Current month stats
  const monthlyAppts = filterByMonth(appointments, 'date', currentMonth, currentYear);
  const lastMonthAppts = filterByMonth(appointments, 'date', lastMonth, lastMonthYear);
  const monthlyDocs = filterByMonth(documents, 'createdAt', currentMonth, currentYear);
  const monthlyOwners = filterByMonth(owners || [], 'createdAt', currentMonth, currentYear);
  
  // Video vs In-person
  const videoAppts = monthlyAppts.filter(a => a.type === 'videoconsulto');
  const inPersonAppts = monthlyAppts.filter(a => a.type !== 'videoconsulto');
  
  // Revenue
  const monthlyRevenue = monthlyAppts.reduce((sum, a) => sum + (a.price || 0), 0);
  const lastMonthRevenue = lastMonthAppts.reduce((sum, a) => sum + (a.price || 0), 0);
  
  // Documents stats
  const docsSent = documents.filter(d => d.emailSent).length;
  const docsDownloaded = documents.filter(d => d.downloaded).length;
  const openRate = docsSent > 0 ? Math.round((docsDownloaded / docsSent) * 100) : 0;
  
  // Messages stats
  const closedTickets = messages.filter(m => m.status === 'closed').length;
  const openTickets = messages.filter(m => m.status !== 'closed').length;
  
  // Export CSV function
  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) { alert('Nessun dato da esportare'); return; }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).map(v => `"${v || ''}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'coral', trend, onClick }) => (
    <Card className={`${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200' : ''}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold" style={{color: color === 'coral' ? '#FF6B6B' : color === 'blue' ? '#3B82F6' : color === 'green' ? '#22C55E' : color === 'emerald' ? '#10B981' : color === 'amber' ? '#F59E0B' : '#EF4444'}}>{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{backgroundColor: color === 'coral' ? '#FEE2E2' : color === 'blue' ? '#DBEAFE' : color === 'green' ? '#DCFCE7' : color === 'emerald' ? '#D1FAE5' : color === 'amber' ? '#FEF3C7' : '#FEE2E2'}}>
            <Icon className="h-5 w-5" style={{color: color === 'coral' ? '#FF6B6B' : color === 'blue' ? '#3B82F6' : color === 'green' ? '#22C55E' : color === 'emerald' ? '#10B981' : color === 'amber' ? '#F59E0B' : '#EF4444'}} />
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}% vs mese scorso
          </div>
        )}
        {onClick && (
          <div className="flex items-center justify-end mt-2 text-xs text-gray-400">
            <span>Clicca per dettagli</span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const [activeReportTab, setActiveReportTab] = useState('overview');

  return (
    <div className="space-y-6">
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Report & Analytics</h2>
          <p className="text-gray-500 text-sm">Monitora le performance della tua clinica</p>
        </div>
        <Button variant="outline" onClick={() => exportCSV(appointments, 'appuntamenti')}>
          <Download className="h-4 w-4 mr-2" />Export CSV
        </Button>
      </div>

      <Tabs value={activeReportTab} onValueChange={setActiveReportTab}>
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="clients">Clienti</TabsTrigger>
          <TabsTrigger value="appointments">Appuntamenti</TabsTrigger>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="documents">Documenti</TabsTrigger>
          <TabsTrigger value="payments">Pagamenti</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Nuovi clienti" value={monthlyOwners.length} subtitle="questo mese" icon={User} color="blue" onClick={() => setActiveReportTab('clients')} />
            <StatCard title="Appuntamenti" value={monthlyAppts.length} subtitle="questo mese" icon={Calendar} color="coral" 
              trend={lastMonthAppts.length > 0 ? Math.round(((monthlyAppts.length - lastMonthAppts.length) / lastMonthAppts.length) * 100) : 0} onClick={() => setActiveReportTab('appointments')} />
            <StatCard title="Documenti inviati" value={monthlyDocs.length} subtitle="questo mese" icon={FileText} color="green" onClick={() => setActiveReportTab('documents')} />
            <StatCard title="Incassi tracciati" value={`€${monthlyRevenue}`} subtitle="questo mese" icon={Euro} color="emerald"
              trend={lastMonthRevenue > 0 ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0} onClick={() => setActiveReportTab('payments')} />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setActiveReportTab('appointments')}>
              <CardHeader>
                <CardTitle className="text-base">Distribuzione appuntamenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-coral-500"></div>
                      <span className="text-sm">In presenza</span>
                    </div>
                    <span className="font-medium">{inPersonAppts.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Video consulto</span>
                    </div>
                    <span className="font-medium">{videoAppts.length}</span>
                  </div>
                  <Progress value={monthlyAppts.length > 0 ? (inPersonAppts.length / monthlyAppts.length) * 100 : 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setActiveReportTab('documents')}>
              <CardHeader>
                <CardTitle className="text-base">Documenti - Tasso apertura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-green-600">{openRate}%</p>
                  <p className="text-sm text-gray-500 mt-1">dei documenti inviati sono stati scaricati</p>
                  <div className="flex justify-center gap-8 mt-4 text-sm">
                    <div><span className="font-medium text-gray-800">{docsSent}</span> <span className="text-gray-500">inviati</span></div>
                    <div><span className="font-medium text-gray-800">{docsDownloaded}</span> <span className="text-gray-500">scaricati</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CLIENTS */}
        <TabsContent value="clients" className="mt-6">
          <button onClick={() => setActiveReportTab('overview')} className="flex items-center gap-2 text-gray-500 hover:text-coral-600 transition mb-4 group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Torna alla Panoramica</span>
          </button>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <StatCard title="Nuovi clienti" value={monthlyOwners.length} subtitle="questo mese" icon={User} color="blue" onClick={() => onNavigate('owners')} />
            <StatCard title="Clienti attivi" value={(owners || []).length} subtitle="totale" icon={Users} color="green" onClick={() => onNavigate('owners')} />
            <StatCard title="Tasso ritorno" value="--%" subtitle="da calcolare" icon={RefreshCw} color="amber" onClick={() => onNavigate('owners')} />
          </div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista clienti</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportCSV(owners || [], 'clienti')}>
                  <Download className="h-4 w-4 mr-1" />Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(owners || []).length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nessun cliente registrato</p>
              ) : (
                <div className="space-y-2">
                  {(owners || []).slice(0, 10).map((owner, i) => {
                    const ownerPets = (pets || []).filter(p => p.ownerId === owner.id);
                    return (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedOwnerDetail(owner)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{owner.name}</p>
                            <p className="text-sm text-gray-500">{owner.email}</p>
                            {ownerPets.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {ownerPets.map(pet => (
                                  <Badge key={pet.id} variant="outline" className="text-xs bg-coral-50 text-coral-700 border-coral-200">
                                    {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'} {pet.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-400">{owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : '-'}</p>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPOINTMENTS */}
        <TabsContent value="appointments" className="mt-6">
          <button onClick={() => setActiveReportTab('overview')} className="flex items-center gap-2 text-gray-500 hover:text-coral-600 transition mb-4 group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Torna alla Panoramica</span>
          </button>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Totale" value={monthlyAppts.length} subtitle="questo mese" icon={Calendar} color="coral" onClick={() => onNavigate('agenda')} />
            <StatCard title="In presenza" value={inPersonAppts.length} icon={Stethoscope} color="coral" onClick={() => onNavigate('agenda')} />
            <StatCard title="Video consulto" value={videoAppts.length} icon={Video} color="blue" onClick={() => onNavigate('agenda')} />
            <StatCard title="No-show" value="0" subtitle="cancellazioni" icon={X} color="red" onClick={() => onNavigate('agenda')} />
          </div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Storico appuntamenti</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportCSV(appointments, 'appuntamenti')}>
                  <Download className="h-4 w-4 mr-1" />Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nessun appuntamento</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {appointments.slice(0, 20).map((appt, i) => {
                    const pet = (pets || []).find(p => p.id === appt.petId || p.name === appt.petName);
                    const owner = (owners || []).find(o => o.id === appt.ownerId || o.name === appt.ownerName);
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-coral-50 cursor-pointer transition-colors"
                        onClick={() => {
                          if (pet) {
                            setSelectedPetDetail(pet);
                          } else if (owner) {
                            setSelectedOwnerDetail(owner);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${appt.type === 'videoconsulto' ? 'bg-blue-100' : 'bg-coral-100'}`}>
                            {appt.type === 'videoconsulto' ? <Video className="h-5 w-5 text-blue-600" /> : <PawPrint className="h-5 w-5 text-coral-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{appt.petName}</p>
                            <p className="text-sm text-gray-500">{appt.ownerName} • {appt.reason || appt.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-medium">{appt.date}</p>
                            <p className="text-xs text-gray-500">{appt.time}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INBOX */}
        <TabsContent value="inbox" className="mt-6">
          <button onClick={() => setActiveReportTab('overview')} className="flex items-center gap-2 text-gray-500 hover:text-coral-600 transition mb-4 group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Torna alla Panoramica</span>
          </button>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <StatCard title="Ticket aperti" value={openTickets} icon={Inbox} color="amber" onClick={() => onNavigate('inbox')} />
            <StatCard title="Ticket chiusi" value={closedTickets} subtitle="questo mese" icon={CheckCircle} color="green" onClick={() => onNavigate('inbox')} />
            <StatCard title="Tempo medio risposta" value="--" subtitle="da calcolare" icon={Clock} color="blue" onClick={() => onNavigate('inbox')} />
          </div>
        </TabsContent>

        {/* DOCUMENTS */}
        <TabsContent value="documents" className="mt-6">
          <button onClick={() => setActiveReportTab('overview')} className="flex items-center gap-2 text-gray-500 hover:text-coral-600 transition mb-4 group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Torna alla Panoramica</span>
          </button>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Documenti inviati" value={docsSent} icon={Send} color="coral" onClick={() => onNavigate('documents')} />
            <StatCard title="Scaricati" value={docsDownloaded} icon={Download} color="green" onClick={() => onNavigate('documents')} />
            <StatCard title="Tasso apertura" value={`${openRate}%`} icon={Eye} color="blue" onClick={() => onNavigate('documents')} />
            <StatCard title="Tempo medio invio" value="--" subtitle="post-visita" icon={Clock} color="amber" onClick={() => onNavigate('documents')} />
          </div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Storico documenti</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportCSV(documents, 'documenti')}>
                  <Download className="h-4 w-4 mr-1" />Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nessun documento</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {documents.slice(0, 20).map((doc, i) => {
                    return (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-coral-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedDocDetail(doc)}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-coral-500" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500">{doc.petName} • {doc.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.emailSent ? (
                            <Badge variant="outline" className="text-green-600 border-green-300">Inviato</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">Bozza</Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENTS */}
        <TabsContent value="payments" className="mt-6">
          <button onClick={() => setActiveReportTab('overview')} className="flex items-center gap-2 text-gray-500 hover:text-coral-600 transition mb-4 group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Torna alla Panoramica</span>
          </button>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <StatCard title="Incassi questo mese" value={`€${monthlyRevenue}`} icon={Euro} color="emerald" onClick={() => onNavigate('settings')} />
            <StatCard title="Transazioni" value={monthlyAppts.filter(a => a.price > 0).length} icon={Receipt} color="blue" onClick={() => onNavigate('settings')} />
            <StatCard title="Ticket medio" value={monthlyAppts.length > 0 ? `€${Math.round(monthlyRevenue / monthlyAppts.length)}` : '€0'} icon={CreditCard} color="coral" onClick={() => onNavigate('settings')} />
          </div>
          
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800">Collega Stripe per tracciare i pagamenti</h3>
                  <p className="text-sm text-amber-700 mt-1">Attualmente mostri solo gli incassi tracciati in piattaforma. Collega Stripe per abilitare pagamenti video-consulti e avere report completi.</p>
                  <Button className="mt-3 bg-amber-600 hover:bg-amber-700">Connetti Stripe</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Dettaglio Cliente */}
      <Dialog open={!!selectedOwnerDetail} onOpenChange={() => setSelectedOwnerDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              {selectedOwnerDetail?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedOwnerDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-sm">{selectedOwnerDetail.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Telefono</p>
                  <p className="font-medium text-sm">{selectedOwnerDetail.phone || 'N/D'}</p>
                </div>
              </div>
              {selectedOwnerDetail.address && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Indirizzo</p>
                  <p className="font-medium text-sm">{selectedOwnerDetail.address}</p>
                </div>
              )}
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600">Animali</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(pets || []).filter(p => p.ownerId === selectedOwnerDetail.id).map(pet => (
                    <Badge key={pet.id} className="bg-blue-100 text-blue-700">{pet.name}</Badge>
                  ))}
                  {(pets || []).filter(p => p.ownerId === selectedOwnerDetail.id).length === 0 && (
                    <span className="text-sm text-gray-500">Nessun animale</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" className="flex-1 min-w-[90px]" onClick={() => window.location.href = `mailto:${selectedOwnerDetail.email}`}>
                  <Mail className="h-4 w-4 mr-2" />Email
                </Button>
                {selectedOwnerDetail.phone && (
                  <>
                    <Button variant="outline" className="flex-1 min-w-[90px]" onClick={() => window.location.href = `tel:${selectedOwnerDetail.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />Chiama
                    </Button>
                    <Button variant="outline" className="flex-1 min-w-[90px] text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => window.open(`https://wa.me/${selectedOwnerDetail.phone.replace(/\s+/g, '').replace(/^\+/, '')}`, '_blank')}>
                      <MessageCircle className="h-4 w-4 mr-2" />WhatsApp
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Dettaglio Animale */}
      <Dialog open={!!selectedPetDetail} onOpenChange={() => setSelectedPetDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 bg-coral-100 rounded-full flex items-center justify-center">
                <PawPrint className="h-5 w-5 text-coral-600" />
              </div>
              {selectedPetDetail?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPetDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Specie</p>
                  <p className="font-medium text-sm">{selectedPetDetail.species === 'dog' ? '🐕 Cane' : selectedPetDetail.species === 'cat' ? '🐱 Gatto' : selectedPetDetail.species}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Razza</p>
                  <p className="font-medium text-sm">{selectedPetDetail.breed || 'N/D'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Età</p>
                  <p className="font-medium text-sm">{selectedPetDetail.birthDate ? `${Math.floor((new Date() - new Date(selectedPetDetail.birthDate)) / (365.25 * 24 * 60 * 60 * 1000))} anni` : 'N/D'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Peso</p>
                  <p className="font-medium text-sm">{selectedPetDetail.weight ? `${selectedPetDetail.weight} kg` : 'N/D'}</p>
                </div>
              </div>
              {selectedPetDetail.microchip && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Microchip</p>
                  <p className="font-medium text-sm">{selectedPetDetail.microchip}</p>
                </div>
              )}
              {(selectedPetDetail.allergies || selectedPetDetail.medications) && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-600">⚠️ Condizioni Mediche</p>
                  {selectedPetDetail.allergies && <p className="text-sm mt-1"><strong>Allergie:</strong> {selectedPetDetail.allergies}</p>}
                  {selectedPetDetail.medications && <p className="text-sm mt-1"><strong>Farmaci:</strong> {selectedPetDetail.medications}</p>}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Dettaglio Documento */}
      <Dialog open={!!selectedDocDetail} onOpenChange={() => setSelectedDocDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 bg-coral-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-coral-600" />
              </div>
              {selectedDocDetail?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedDocDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="font-medium text-sm">{selectedDocDetail.type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Animale</p>
                  <p className="font-medium text-sm">{selectedDocDetail.petName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Proprietario</p>
                  <p className="font-medium text-sm">{selectedDocDetail.ownerName || 'N/D'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Data</p>
                  <p className="font-medium text-sm">{selectedDocDetail.createdAt ? new Date(selectedDocDetail.createdAt).toLocaleDateString('it-IT') : 'N/D'}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Stato</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedDocDetail.emailSent ? (
                    <Badge className="bg-green-100 text-green-700">✓ Inviato via email</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700">Bozza</Badge>
                  )}
                  {selectedDocDetail.downloaded && <Badge className="bg-blue-100 text-blue-700">Scaricato</Badge>}
                </div>
              </div>
              {selectedDocDetail.content && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Contenuto</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedDocDetail.content}</p>
                </div>
              )}
              <div className="flex gap-2">
                {(selectedDocDetail.url || selectedDocDetail.fileUrl) && (
                  <Button className="flex-1 bg-coral-500 hover:bg-coral-600" onClick={() => window.open(selectedDocDetail.url || selectedDocDetail.fileUrl, '_blank')}>
                    <Download className="h-4 w-4 mr-2" />Scarica
                  </Button>
                )}
                <Button variant="outline" className="flex-1" onClick={() => { setSelectedDocDetail(null); onNavigate('documents'); }}>
                  <FileText className="h-4 w-4 mr-2" />Vai a Documenti
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ==================== SUBSCRIPTION PLANS ====================

export default ClinicReports;
