'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, Download } from 'lucide-react';

export default function PetDocumentsTab({ documents, onOpenDocument, onDownloadDocument }) {
  return (
    <Tabs defaultValue="clinic">
      <TabsList className="mb-4">
        <TabsTrigger value="clinic">Dalla clinica</TabsTrigger>
        <TabsTrigger value="mine">Caricati da me</TabsTrigger>
      </TabsList>
      <TabsContent value="clinic">
        {documents.filter(d => !d.fromClient).length === 0 ? (
          <Card><CardContent className="p-8 text-center text-gray-500">Nessun documento dalla clinica</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {documents.filter(d => !d.fromClient).map((doc, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onOpenDocument(doc)}><Eye className="h-4 w-4 mr-1" />Apri</Button>
                    <Button size="sm" variant="outline" onClick={() => onDownloadDocument(doc)}><Download className="h-4 w-4 mr-1" />Scarica</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="mine">
        {documents.filter(d => d.fromClient).length === 0 ? (
          <Card><CardContent className="p-8 text-center text-gray-500">Nessun documento caricato</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {documents.filter(d => d.fromClient).map((doc, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="text-green-600">Inviato</Badge>
                    <Button size="sm" variant="outline" onClick={() => onOpenDocument(doc)}><Eye className="h-4 w-4 mr-1" />Apri</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
