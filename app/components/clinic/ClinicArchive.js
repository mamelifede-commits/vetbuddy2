'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, ClipboardList, Download, Eye, FileText, FolderArchive, GraduationCap, Loader2, Receipt, Stethoscope, Upload } from 'lucide-react';

function ClinicArchive({ user }) {
  const [archiveFiles, setArchiveFiles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', category: 'protocolli', description: '' });

  const categories = [
    { id: 'all', label: 'Tutti', icon: FolderArchive, color: 'gray' },
    { id: 'protocolli', label: 'Protocolli Clinici', icon: ClipboardList, color: 'blue', desc: 'Procedure, linee guida, SOP' },
    { id: 'casi_studio', label: 'Casi Studio', icon: BookOpen, color: 'purple', desc: 'Case history interessanti' },
    { id: 'template', label: 'Template', icon: FileText, color: 'green', desc: 'Moduli consenso, contratti' },
    { id: 'formazione', label: 'Formazione', icon: GraduationCap, color: 'amber', desc: 'Materiale didattico staff' },
    { id: 'schede_tecniche', label: 'Schede Tecniche', icon: Stethoscope, color: 'red', desc: 'Farmaci, attrezzature' },
    { id: 'amministrazione', label: 'Amministrazione', icon: Receipt, color: 'indigo', desc: 'Certificazioni, GDPR, assicurazioni' },
  ];

  useEffect(() => {
    loadArchive();
  }, []);

  const loadArchive = async () => {
    try {
      const token = localStorage.getItem('vetbuddy_token');
      const res = await fetch('/api/clinic/archive', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setArchiveFiles(data.files || []);
      }
    } catch (err) {
      console.error('Error loading archive:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('archive-file-input');
    if (!fileInput?.files?.length) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('vetbuddy_token');
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      formData.append('name', uploadForm.name || fileInput.files[0].name);
      formData.append('category', uploadForm.category);
      formData.append('description', uploadForm.description);

      const res = await fetch('/api/clinic/archive', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setShowUploadModal(false);
        setUploadForm({ name: '', category: 'protocolli', description: '' });
        loadArchive();
      }
    } catch (err) {
      console.error('Error uploading:', err);
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = activeCategory === 'all' 
    ? archiveFiles 
    : archiveFiles.filter(f => f.category === activeCategory);

  const getCategoryInfo = (catId) => categories.find(c => c.id === catId) || categories[0];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderArchive className="h-7 w-7 text-blue-500" />
            Archivio Clinica
          </h1>
          <p className="text-gray-500">Documenti, protocolli e materiale della clinica</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="bg-blue-500 hover:bg-blue-600">
          <Upload className="h-4 w-4 mr-2" /> Carica Documento
        </Button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {categories.map(cat => {
          const count = cat.id === 'all' ? archiveFiles.length : archiveFiles.filter(f => f.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-4 rounded-xl text-left transition-all ${
                activeCategory === cat.id 
                  ? `bg-${cat.color}-100 border-2 border-${cat.color}-500` 
                  : 'bg-white border-2 border-transparent hover:border-gray-200'
              }`}
            >
              <cat.icon className={`h-6 w-6 mb-2 text-${cat.color}-500`} />
              <p className="font-medium text-sm text-gray-900">{cat.label}</p>
              <p className="text-xs text-gray-500">{count} file</p>
            </button>
          );
        })}
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderArchive className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun documento</h3>
          <p className="text-gray-500 mb-4">
            {activeCategory === 'all' 
              ? "L'archivio è vuoto. Carica il primo documento!"
              : `Nessun documento nella categoria "${getCategoryInfo(activeCategory).label}"`}
          </p>
          <Button onClick={() => setShowUploadModal(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" /> Carica Documento
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file, i) => {
            const cat = getCategoryInfo(file.category);
            return (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg bg-${cat.color}-100`}>
                      <cat.icon className={`h-6 w-6 text-${cat.color}-500`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                      <p className="text-xs text-gray-500">{cat.label}</p>
                      {file.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{file.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">
                          {new Date(file.createdAt).toLocaleDateString('it-IT')}
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-7">
                          <Eye className="h-3 w-3 mr-1" /> Apri
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7">
                          <Download className="h-3 w-3 mr-1" /> Scarica
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              Carica Documento nell'Archivio
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label>File *</Label>
              <Input type="file" id="archive-file-input" required />
            </div>
            <div>
              <Label>Nome documento</Label>
              <Input 
                value={uploadForm.name} 
                onChange={e => setUploadForm({...uploadForm, name: e.target.value})}
                placeholder="Lascia vuoto per usare nome file"
              />
            </div>
            <div>
              <Label>Categoria *</Label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={uploadForm.category}
                onChange={e => setUploadForm({...uploadForm, category: e.target.value})}
              >
                {categories.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label} - {cat.desc}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Descrizione</Label>
              <textarea 
                className="w-full p-2 border rounded-lg"
                rows={3}
                value={uploadForm.description}
                onChange={e => setUploadForm({...uploadForm, description: e.target.value})}
                placeholder="Descrizione opzionale del documento..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={uploading} className="bg-blue-500 hover:bg-blue-600">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Carica
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== CLINIC EVENTS ====================

export default ClinicArchive;
