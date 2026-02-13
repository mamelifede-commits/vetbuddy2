import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Scarica un documento (PDF)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: 'ID documento mancante' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Recupera il documento
    const document = await db.collection('documents').findOne({ id: documentId });
    
    if (!document) {
      return NextResponse.json({ error: 'Documento non trovato' }, { status: 404 });
    }

    if (!document.content) {
      return NextResponse.json({ error: 'Contenuto documento non disponibile' }, { status: 404 });
    }

    // Converti da base64 a buffer
    const pdfBuffer = Buffer.from(document.content, 'base64');

    // Restituisci il PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': document.mimeType || 'application/pdf',
        'Content-Disposition': `attachment; filename="${document.fileName || 'documento.pdf'}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Document download error:', error);
    return NextResponse.json(
      { error: 'Errore durante il download del documento' },
      { status: 500 }
    );
  }
}
