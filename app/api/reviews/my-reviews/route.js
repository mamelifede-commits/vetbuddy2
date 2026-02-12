import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URL);

// GET /api/reviews/my-reviews - Get all reviews written by the current user
export async function GET(request) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    await client.connect();
    const db = client.db('vetbuddy');
    
    // Find the user
    const user = await db.collection('users').findOne({ 
      $or: [{ id: token }, { email: token }] 
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }
    
    // Get all reviews by this user
    const reviews = await db.collection('reviews')
      .find({ ownerId: user.id })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Enrich with clinic info
    const enrichedReviews = await Promise.all(reviews.map(async (review) => {
      const clinic = await db.collection('users').findOne({ id: review.clinicId });
      return {
        ...review,
        clinicName: clinic?.clinicName || clinic?.name || 'Clinica',
        clinicAddress: clinic?.address ? `${clinic.address}, ${clinic.city}` : ''
      };
    }));
    
    return NextResponse.json(enrichedReviews);
    
  } catch (error) {
    console.error('Error fetching my reviews:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
