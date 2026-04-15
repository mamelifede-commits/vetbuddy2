// modules/rewards.js - Rewards/Premi management
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { corsHeaders } from './constants';

export async function handleRewardsGet(path, request) {
  if (path === 'rewards/types') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const rewards = await getCollection('rewards');
    const rewardTypes = await rewards.find({ clinicId: user.id, type: 'definition' }).toArray();
    return NextResponse.json(rewardTypes, { headers: corsHeaders });
  }
  
  if (path === 'rewards/assigned') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const rewards = await getCollection('rewards');
    const query = { clinicId: user.id, type: 'assigned' };
    if (ownerId) query.ownerId = ownerId;
    const assignedRewards = await rewards.find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(assignedRewards, { headers: corsHeaders });
  }
  
  if (path === 'rewards/my-rewards') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const rewards = await getCollection('rewards');
    const myRewards = await rewards.find({ ownerId: user.id, type: 'assigned' }).sort({ createdAt: -1 }).toArray();
    const users = await getCollection('users');
    const enrichedRewards = await Promise.all(myRewards.map(async (reward) => {
      const clinic = await users.findOne({ id: reward.clinicId }, { projection: { clinicName: 1, phone: 1, whatsappNumber: 1 } });
      return { ...reward, clinicName: clinic?.clinicName, clinicPhone: clinic?.phone, clinicWhatsapp: clinic?.whatsappNumber };
    }));
    return NextResponse.json(enrichedRewards, { headers: corsHeaders });
  }

  return null;
}

export async function handleRewardsPost(path, request, body) {
  // Create reward type
  if (path === 'rewards/types') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Solo le cliniche possono creare tipi di premio' }, { status: 401, headers: corsHeaders });
    const { name, description, rewardType, value, icon } = body;
    if (!name || !rewardType) return NextResponse.json({ error: 'Nome e tipo premio sono obbligatori' }, { status: 400, headers: corsHeaders });
    const rewards = await getCollection('rewards');
    const rewardDef = { id: uuidv4(), clinicId: user.id, type: 'definition', name, description: description || '', rewardType, value: value || 0, icon: icon || 'Gift', active: true, createdAt: new Date().toISOString() };
    await rewards.insertOne(rewardDef);
    return NextResponse.json(rewardDef, { headers: corsHeaders });
  }

  // Assign reward to owner
  if (path === 'rewards/assign') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Solo le cliniche possono assegnare premi' }, { status: 401, headers: corsHeaders });
    const { ownerId, rewardTypeId, reason, expiresAt } = body;
    if (!ownerId || !rewardTypeId) return NextResponse.json({ error: 'Proprietario e tipo premio sono obbligatori' }, { status: 400, headers: corsHeaders });
    
    const rewards = await getCollection('rewards');
    const rewardType = await rewards.findOne({ id: rewardTypeId, clinicId: user.id, type: 'definition' });
    if (!rewardType) return NextResponse.json({ error: 'Tipo premio non trovato' }, { status: 404, headers: corsHeaders });
    const users = await getCollection('users');
    const owner = await users.findOne({ id: ownerId });
    if (!owner) return NextResponse.json({ error: 'Proprietario non trovato' }, { status: 404, headers: corsHeaders });

    const generateRedeemCode = () => { const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let code = ''; for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length)); return code; };
    const redeemCode = generateRedeemCode();
    const clinic = await users.findOne({ id: user.id });
    
    const assignedReward = {
      id: uuidv4(), clinicId: user.id, clinicName: clinic?.clinicName || clinic?.name || 'Clinica',
      clinicEmail: clinic?.email, clinicWhatsapp: clinic?.whatsapp,
      ownerId, ownerName: owner.name, ownerEmail: owner.email,
      type: 'assigned', rewardTypeId, rewardName: rewardType.name,
      rewardDescription: rewardType.description, rewardType: rewardType.rewardType,
      rewardValue: rewardType.value, rewardIcon: rewardType.icon,
      redeemCode, reason: reason || 'Premio fedeltà',
      status: 'available', expiresAt: expiresAt || null,
      createdAt: new Date().toISOString(), redeemedAt: null, usedAt: null
    };
    await rewards.insertOne(assignedReward);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
      let rewardValueDisplay = '';
      if (rewardType.rewardType === 'discount_percent') rewardValueDisplay = `<p style="font-size: 32px; color: #27AE60; font-weight: bold; margin: 15px 0 0 0;">-${rewardType.value}%</p>`;
      else if (rewardType.rewardType === 'discount_fixed') rewardValueDisplay = `<p style="font-size: 32px; color: #27AE60; font-weight: bold; margin: 15px 0 0 0;">-€${rewardType.value}</p>`;
      else rewardValueDisplay = `<p style="font-size: 22px; color: #27AE60; font-weight: bold; margin: 15px 0 0 0;">🎁 GRATIS</p>`;
      
      await sendEmail({
        to: owner.email,
        subject: `🎁 Hai ricevuto un premio da ${clinic?.clinicName || 'la tua clinica'}!`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #FF6B6B, #FFD93D); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px;">🎁 Hai un Premio!</h1></div><div style="padding: 30px; background: #f9f9f9;"><p style="color: #666;">Ciao <strong>${owner.name || ''}</strong>,</p><p style="color: #666;"><strong>${clinic?.clinicName}</strong> ti ha assegnato un premio!</p><div style="background: white; padding: 25px; border-radius: 15px; margin: 25px 0; text-align: center; border: 2px dashed #FFD93D;"><h2 style="color: #FF6B6B; margin: 0 0 10px 0;">${rewardType.name}</h2><p style="color: #666; margin: 0;">${rewardType.description || ''}</p>${rewardValueDisplay}</div><div style="background: #333; padding: 25px; border-radius: 15px; margin: 25px 0; text-align: center;"><p style="color: #FFD93D; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 3px;">🎟️ Il tuo codice premio</p><p style="color: white; margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 10px; font-family: 'Courier New', monospace;">${redeemCode}</p><p style="color: #aaa; margin: 15px 0 0 0; font-size: 12px;">Comunica questo codice in clinica</p></div><div style="text-align: center; margin: 30px 0;"><a href="${baseUrl}?action=rewards" style="display: inline-block; background: #FF6B6B; color: white; padding: 16px 40px; border-radius: 30px; text-decoration: none; font-weight: bold;">🎁 Riscatta Online</a></div></div><div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;"><p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p></div></div>`
      });
    } catch (emailErr) { console.error('Error sending reward email:', emailErr); }
    return NextResponse.json(assignedReward, { headers: corsHeaders });
  }

  // Redeem reward online
  if (path === 'rewards/redeem') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'owner') return NextResponse.json({ error: 'Solo i proprietari possono riscattare i premi' }, { status: 401, headers: corsHeaders });
    const { rewardId } = body;
    if (!rewardId) return NextResponse.json({ error: 'ID premio obbligatorio' }, { status: 400, headers: corsHeaders });
    const rewards = await getCollection('rewards');
    const reward = await rewards.findOne({ id: rewardId, ownerId: user.id, type: 'assigned' });
    if (!reward) return NextResponse.json({ error: 'Premio non trovato' }, { status: 404, headers: corsHeaders });
    if (reward.status !== 'available') return NextResponse.json({ error: 'Questo premio non è più disponibile' }, { status: 400, headers: corsHeaders });
    if (reward.expiresAt && new Date(reward.expiresAt) < new Date()) {
      await rewards.updateOne({ id: rewardId }, { $set: { status: 'expired' } });
      return NextResponse.json({ error: 'Questo premio è scaduto' }, { status: 400, headers: corsHeaders });
    }
    await rewards.updateOne({ id: rewardId }, { $set: { status: 'pending', redeemedAt: new Date().toISOString() } });
    try {
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: reward.clinicId });
      const owner = await users.findOne({ id: user.id });
      if (clinic?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
        await sendEmail({
          to: clinic.email,
          subject: `🎁 Richiesta riscatto premio da ${owner?.name || 'un cliente'}`,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #FF6B6B, #FFD93D); padding: 25px; text-align: center;"><h1 style="color: white; margin: 0;">🎁 Richiesta Riscatto Premio</h1></div><div style="padding: 30px; background: #f9f9f9;"><p><strong>${owner?.name || 'Un cliente'}</strong> vuole riscattare un premio!</p><div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FFD93D;"><h3 style="color: #FF6B6B;">${reward.rewardName}</h3><p>Codice: <strong style="font-family: monospace; font-size: 18px;">${reward.redeemCode}</strong></p></div><div style="text-align: center; margin: 25px 0;"><a href="${baseUrl}?tab=rewards" style="display: inline-block; background: #FF6B6B; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">✓ Gestisci Premi</a></div></div></div>`
        });
      }
    } catch (emailErr) { console.error('Error sending redemption notification:', emailErr); }
    return NextResponse.json({ success: true, message: 'Premio riscattato! La clinica è stata notificata.', reward: { ...reward, status: 'pending', redeemedAt: new Date().toISOString() } }, { headers: corsHeaders });
  }

  // Mark reward as used
  if (path === 'rewards/use') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Solo le cliniche possono segnare i premi come usati' }, { status: 401, headers: corsHeaders });
    const { rewardId } = body;
    if (!rewardId) return NextResponse.json({ error: 'ID premio obbligatorio' }, { status: 400, headers: corsHeaders });
    const rewards = await getCollection('rewards');
    const reward = await rewards.findOne({ id: rewardId, clinicId: user.id, type: 'assigned' });
    if (!reward) return NextResponse.json({ error: 'Premio non trovato' }, { status: 404, headers: corsHeaders });
    if (reward.status === 'used') return NextResponse.json({ error: 'Premio già utilizzato' }, { status: 400, headers: corsHeaders });
    await rewards.updateOne({ id: rewardId }, { $set: { status: 'used', usedAt: new Date().toISOString() } });
    return NextResponse.json({ success: true, message: 'Premio segnato come utilizzato' }, { headers: corsHeaders });
  }

  return null;
}
