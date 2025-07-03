import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { projectUrl, serviceRoleKey } = await req.json();
  console.log('[API] projectUrl:', projectUrl);
  console.log('[API] serviceRoleKey:', serviceRoleKey);
  if (!projectUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing projectUrl or serviceRoleKey' }, { status: 400 });
  }
  const endpoint = `${projectUrl}/rest/v1/rpc/get_db_size`;
  console.log('[API] Supabase endpoint:', endpoint);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
  });
  const text = await response.text();
  console.log('[API] Supabase response:', text);
  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch db size', details: text }, { status: 500 });
  }
  return NextResponse.json({ size: JSON.parse(text) });
} 