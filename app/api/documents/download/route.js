import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export const dynamic = 'force-dynamic';

// Helper function to return user-friendly error page
function errorPage(message, details = '') {
  const html = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Errore - VetBuddy</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #FFF5F5 0%, #FFF0F0 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        h1 {
          color: #FF6B6B;
          font-size: 24px;
          margin-bottom: 12px;
        }
        p {
          color: #666;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 24px;
        }
        .back-btn {
          display: inline-block;
          background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
          color: white;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 16px;
        }
        .details {
          margin-top: 20px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 8px;
          font-size: 12px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📄❌</div>
        <h1>${message}</h1>
        <p>Non è stato possibile caricare il documento richiesto. Torna indietro e riprova.</p>
        <a href="javascript:history.back()" class="back-btn">← Torna indietro</a>
        ${details ? `<div class="details">${details}</div>` : ''}
      </div>
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

// GET - Scarica un documento (PDF)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return errorPage('ID documento mancante', 'Nessun ID fornito nella richiesta');
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Recupera il documento
    const document = await db.collection('documents').findOne({ id: documentId });
    
    if (!document) {
      return errorPage('Documento non trovato', `ID: ${documentId}`);
    }

    // Check if we have content or a URL
    if (!document.content && !document.fileUrl && !document.s3_url) {
      return errorPage('Contenuto non disponibile', 'Il file non è stato salvato correttamente');
    }

    // If we have a URL, redirect to it
    if (!document.content && (document.fileUrl || document.s3_url)) {
      const url = document.fileUrl || document.s3_url;
      return NextResponse.redirect(url);
    }

    // Converti da base64 a buffer
    let base64Content = document.content;
    // Remove data URL prefix if present
    if (base64Content.startsWith('data:')) {
      base64Content = base64Content.split(',')[1];
    }
    
    const pdfBuffer = Buffer.from(base64Content, 'base64');

    // Determine content type
    const contentType = document.mimeType || document.fileType || 'application/pdf';
    
    // Determine filename
    const filename = document.fileName || document.name || 'documento.pdf';

    // Restituisci il PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Document download error:', error);
    return errorPage('Errore di sistema', error.message);
  }
}
