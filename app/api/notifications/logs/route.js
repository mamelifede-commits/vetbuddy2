import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Get notification logs for a clinic
export async function GET(request) {
  try {
    const clinicId = request.headers.get('x-clinic-id');
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const channel = searchParams.get('channel'); // 'whatsapp', 'email', or null for all
    const status = searchParams.get('status'); // 'sent', 'delivered', 'failed', etc.
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    // Build query
    const query = {};
    
    if (clinicId) {
      query.clinicId = clinicId;
    }
    
    if (channel === 'whatsapp') {
      query.channel = 'whatsapp';
    } else if (channel === 'email') {
      query.channel = 'email';
    }
    
    if (status) {
      query.status = status;
    }
    
    if (dateFrom || dateTo) {
      query.sentAt = {};
      if (dateFrom) query.sentAt.$gte = new Date(dateFrom);
      if (dateTo) query.sentAt.$lte = new Date(dateTo);
    }
    
    // Get logs from both collections
    const whatsappLogs = await db.collection('whatsapp_logs')
      .find(query)
      .sort({ sentAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    const emailLogs = await db.collection('email_logs')
      .find(query)
      .sort({ sentAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    // Combine and sort
    const allLogs = [...whatsappLogs.map(l => ({ ...l, channel: 'whatsapp' })),
                     ...emailLogs.map(l => ({ ...l, channel: 'email' }))]
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
      .slice(0, limit);
    
    // Get counts
    const whatsappCount = await db.collection('whatsapp_logs').countDocuments(query);
    const emailCount = await db.collection('email_logs').countDocuments(query);
    
    // Get stats
    const stats = {
      total: whatsappCount + emailCount,
      whatsapp: whatsappCount,
      email: emailCount,
      byStatus: {
        sent: await db.collection('whatsapp_logs').countDocuments({ ...query, status: 'sent' }) +
              await db.collection('email_logs').countDocuments({ ...query, status: 'sent' }),
        delivered: await db.collection('whatsapp_logs').countDocuments({ ...query, status: 'delivered' }),
        failed: await db.collection('whatsapp_logs').countDocuments({ ...query, status: 'failed' }) +
                await db.collection('email_logs').countDocuments({ ...query, status: 'failed' })
      },
      byTemplate: {}
    };
    
    // Group by template
    const templateCounts = await db.collection('whatsapp_logs').aggregate([
      { $match: query },
      { $group: { _id: '$template', count: { $sum: 1 } } }
    ]).toArray();
    
    templateCounts.forEach(t => {
      stats.byTemplate[t._id] = t.count;
    });
    
    return NextResponse.json({
      success: true,
      logs: allLogs,
      stats,
      pagination: {
        page,
        limit,
        total: whatsappCount + emailCount,
        pages: Math.ceil((whatsappCount + emailCount) / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching notification logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
