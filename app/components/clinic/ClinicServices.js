'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, Clock, Euro, Plus, Scissors, Search, Settings, Star, Stethoscope, Trash2, X } from 'lucide-react';
import api from '@/app/lib/api';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

function ClinicServices({ onNavigate, user }) {
  const [serviceCatalog, setServiceCatalog] = useState({});
  // selectedServices now stores objects: { id, price } or for custom: { id, name, description, price, isCustom: true }
  const [selectedServices, setSelectedServices] = useState([]);
  const [customServices, setCustomServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', description: '', price: '' });
  const [editingPrice, setEditingPrice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadServiceCatalog();
    // Parse user services - could be array of IDs (old format) or array of objects (new format)
    if (user?.services) {
      if (Array.isArray(user.services)) {
        // Check if old format (array of strings) or new format (array of objects)
        if (user.services.length > 0 && typeof user.services[0] === 'string') {
          // Convert old format to new
          setSelectedServices(user.services.map(id => ({ id, price: null })));
        } else {
          setSelectedServices(user.services.filter(s => !s.isCustom));
          setCustomServices(user.services.filter(s => s.isCustom) || []);
        }
      }
    }
    if (user?.customServices) {
      setCustomServices(user.customServices);
    }
  }, []);

  const loadServiceCatalog = async () => {
    try {
      const response = await api.get('services');
      // L'API restituisce { services, categories, grouped }
      // Usiamo 'grouped' che ha il formato corretto per il catalogo
      if (response.grouped) {
        setServiceCatalog(response.grouped);
      } else if (response.categories) {
        // Fallback: costruisci il catalogo dalle categorie
        const catalog = {};
        for (const cat of response.categories) {
          catalog[cat.id] = {
            ...cat,
            services: (response.services || []).filter(s => s.category === cat.id)
          };
        }
        setServiceCatalog(catalog);
      } else {
        setServiceCatalog(response);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const isServiceSelected = (serviceId) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  const getServicePrice = (serviceId) => {
    const service = selectedServices.find(s => s.id === serviceId);
    return service?.price || '';
  };

  const toggleService = (serviceId) => {
    if (isServiceSelected(serviceId)) {
      setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
    } else {
      setSelectedServices(prev => [...prev, { id: serviceId, price: null }]);
    }
  };

  const updateServicePrice = (serviceId, price) => {
    setSelectedServices(prev => prev.map(s => 
      s.id === serviceId ? { ...s, price: price ? parseFloat(price) : null } : s
    ));
  };

  const addCustomService = () => {
    if (!customForm.name.trim()) {
      alert('Inserisci il nome del servizio');
      return;
    }
    const newService = {
      id: 'custom_' + Date.now(),
      name: customForm.name,
      description: customForm.description,
      price: customForm.price ? parseFloat(customForm.price) : null,
      isCustom: true
    };
    setCustomServices(prev => [...prev, newService]);
    setCustomForm({ name: '', description: '', price: '' });
    setShowAddCustom(false);
  };

  const removeCustomService = (serviceId) => {
    setCustomServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const updateCustomServicePrice = (serviceId, price) => {
    setCustomServices(prev => prev.map(s => 
      s.id === serviceId ? { ...s, price: price ? parseFloat(price) : null } : s
    ));
  };

  const saveServices = async () => {
    setSaving(true);
    try {
      await api.put('clinic/services', { 
        services: selectedServices,
        customServices: customServices 
      });
      alert('✅ Servizi e prezzi salvati con successo!');
    } catch (error) {
      alert('❌ Errore nel salvataggio: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const selectAll = (categoryId) => {
    const category = serviceCatalog[categoryId];
    if (!category || !category.services) return;
    const categoryServiceIds = category.services.map(s => s.id);
    const allSelected = categoryServiceIds.every(id => isServiceSelected(id));
    if (allSelected) {
      setSelectedServices(prev => prev.filter(s => !categoryServiceIds.includes(s.id)));
    } else {
      const newServices = categoryServiceIds
        .filter(id => !isServiceSelected(id))
        .map(id => ({ id, price: null }));
      setSelectedServices(prev => [...prev, ...newServices]);
    }
  };

  const getCategoryIcon = (iconName) => {
    const icons = { Stethoscope, UserCog: Settings, Scissors, Search, Plus };
    return icons[iconName] || Stethoscope;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><div className="text-center"><Stethoscope className="h-8 w-8 text-coral-500 mx-auto mb-2 animate-pulse" /><p className="text-gray-500">Caricamento servizi...</p></div></div>;
  }

  const allCatalogServices = Object.entries(serviceCatalog).flatMap(([catId, cat]) => 
    (cat?.services || []).map(s => ({ ...s, categoryId: catId, categoryName: cat?.name || catId }))
  );

  const baseFilteredServices = activeCategory === 'all' 
    ? allCatalogServices 
    : activeCategory === 'custom'
    ? []
    : serviceCatalog[activeCategory]?.services.map(s => ({ ...s, categoryId: activeCategory, categoryName: serviceCatalog[activeCategory].name })) || [];

  // Apply search filter
  const filteredServices = searchQuery.trim() 
    ? baseFilteredServices.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : baseFilteredServices;

  const totalActiveServices = selectedServices.length + customServices.length;

  return (
    <div>
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🏥 Servizi e Listino Prezzi</h2>
          <p className="text-gray-500 text-sm">Seleziona i servizi che offri e imposta i prezzi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddCustom(true)}>
            <Plus className="h-4 w-4 mr-2" />Nuovo Servizio
          </Button>
          <Button onClick={saveServices} disabled={saving} className="bg-coral-500 hover:bg-coral-600">
            {saving ? <><Clock className="h-4 w-4 mr-2 animate-spin" />Salvataggio...</> : <><Check className="h-4 w-4 mr-2" />Salva tutto</>}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-coral-50 to-white border-coral-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-coral-500">{totalActiveServices}</p>
            <p className="text-sm text-gray-500">Servizi attivi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{selectedServices.filter(s => s.price).length}</p>
            <p className="text-sm text-gray-500">Con prezzo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{customServices.length}</p>
            <p className="text-sm text-gray-500">Servizi custom</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">{selectedServices.filter(s => !s.price).length}</p>
            <p className="text-sm text-gray-500">Senza prezzo</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cerca servizi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant={activeCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory('all')} className={activeCategory === 'all' ? 'bg-coral-500' : ''}>
          Catalogo ({allCatalogServices.length})
        </Button>
        {Object.entries(serviceCatalog).map(([catId, cat]) => {
          if (!cat?.services) return null;
          const Icon = getCategoryIcon(cat.icon);
          const selectedCount = cat.services.filter(s => isServiceSelected(s.id)).length;
          return (
            <Button key={catId} variant={activeCategory === catId ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory(catId)} className={activeCategory === catId ? 'bg-coral-500' : ''}>
              <Icon className="h-4 w-4 mr-1" />{cat.name} ({selectedCount}/{cat.services.length})
            </Button>
          );
        })}
        <Button variant={activeCategory === 'custom' ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory('custom')} className={activeCategory === 'custom' ? 'bg-purple-500' : ''}>
          <Star className="h-4 w-4 mr-1" />I miei servizi ({customServices.length})
        </Button>
      </div>

      {/* Custom Services Section */}
      {activeCategory === 'custom' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Servizi personalizzati</h3>
            <Button size="sm" onClick={() => setShowAddCustom(true)} className="bg-purple-500 hover:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />Aggiungi
            </Button>
          </div>
          {customServices.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Non hai ancora creato servizi personalizzati</p>
                <Button variant="outline" onClick={() => setShowAddCustom(true)}>
                  <Plus className="h-4 w-4 mr-2" />Crea il tuo primo servizio
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customServices.map((service) => (
                <Card key={service.id} className="border-purple-200 bg-purple-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Badge className="bg-purple-500 text-white mb-2">Personalizzato</Badge>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.description && <p className="text-sm text-gray-500 mt-1">{service.description}</p>}
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeCustomService(service.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Euro className="h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="Prezzo €" 
                        value={service.price || ''} 
                        onChange={(e) => updateCustomServicePrice(service.id, e.target.value)}
                        className="h-8 w-24"
                      />
                      <span className="text-sm text-gray-500">€</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Select All for category */}
      {activeCategory !== 'all' && activeCategory !== 'custom' && serviceCatalog[activeCategory]?.services && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Seleziona tutti i servizi di questa categoria</span>
          <Button variant="outline" size="sm" onClick={() => selectAll(activeCategory)}>
            {serviceCatalog[activeCategory]?.services?.every(s => isServiceSelected(s.id)) ? 'Deseleziona tutti' : 'Seleziona tutti'}
          </Button>
        </div>
      )}

      {/* Services Grid */}
      {activeCategory !== 'custom' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const isSelected = isServiceSelected(service.id);
            const price = getServicePrice(service.id);
            return (
              <Card key={service.id} className={`transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-coral-500 bg-coral-50' : 'hover:border-gray-300'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => toggleService(service.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{service.categoryName}</Badge>
                      </div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                    </div>
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 cursor-pointer ${isSelected ? 'bg-coral-500 border-coral-500' : 'border-gray-300'}`} onClick={() => toggleService(service.id)}>
                      {isSelected && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-coral-200">
                      <Euro className="h-4 w-4 text-coral-400" />
                      <Input 
                        type="number" 
                        placeholder="Prezzo" 
                        value={price} 
                        onChange={(e) => updateServicePrice(service.id, e.target.value)}
                        className="h-8 w-24 border-coral-200 focus:border-coral-400"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm text-gray-500">€</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredServices.length === 0 && activeCategory !== 'custom' && (
        <div className="text-center py-12">
          <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nessun servizio in questa categoria</p>
        </div>
      )}

      {/* Add Custom Service Dialog */}
      <Dialog open={showAddCustom} onOpenChange={setShowAddCustom}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Servizio Personalizzato</DialogTitle>
            <DialogDescription>Crea un servizio che non è presente nel catalogo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome servizio *</Label>
              <Input 
                value={customForm.name} 
                onChange={(e) => setCustomForm({...customForm, name: e.target.value})}
                placeholder="Es: Consulto nutrizionale"
              />
            </div>
            <div>
              <Label>Descrizione</Label>
              <Textarea 
                value={customForm.description} 
                onChange={(e) => setCustomForm({...customForm, description: e.target.value})}
                placeholder="Descrivi brevemente il servizio..."
                rows={2}
              />
            </div>
            <div>
              <Label>Prezzo (€)</Label>
              <Input 
                type="number"
                value={customForm.price} 
                onChange={(e) => setCustomForm({...customForm, price: e.target.value})}
                placeholder="50"
              />
            </div>
            <Button onClick={addCustomService} className="w-full bg-purple-500 hover:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />Aggiungi servizio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== VIDEO CONSULT CONFIGURATION ====================

export default ClinicServices;
