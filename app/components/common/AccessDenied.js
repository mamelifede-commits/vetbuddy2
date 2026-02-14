'use client';

import { AlertCircle, PawPrint, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function AccessDenied({ userRole, requiredRole, onGoBack }) {
  const roleLabels = {
    clinic: 'Clinica',
    owner: 'Proprietario',
    staff: 'Staff'
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-xl text-gray-900">Accesso non autorizzato</CardTitle>
          <CardDescription>
            Questa sezione è riservata agli account <strong>{roleLabels[requiredRole]}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              Il tuo account è registrato come: <Badge variant="outline" className="ml-1">{roleLabels[userRole]}</Badge>
            </p>
          </div>
          <Button onClick={onGoBack} className="w-full bg-coral-500 hover:bg-coral-600">
            {userRole === 'owner' ? (
              <><PawPrint className="h-4 w-4 mr-2" />Vai all'area Proprietario</>
            ) : (
              <><Building2 className="h-4 w-4 mr-2" />Vai all'area Clinica</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccessDenied;
