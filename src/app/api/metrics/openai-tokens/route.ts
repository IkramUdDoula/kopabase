import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { openaiKey } = await req.json();
  if (!openaiKey) {
    return NextResponse.json({ error: 'Missing OpenAI key' }, { status: 400 });
  }
  // Get today's date range in UTC
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString().split('T')[0];
  const url = `https://api.openai.com/v1/dashboard/billing/usage?start_date=${start}&end_date=${end}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
    },
  });
  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch OpenAI usage' }, { status: 500 });
  }
  const data = await response.json();
  // Sum tokens for today
  let totalTokens = 0;
  if (data.daily_costs && Array.isArray(data.daily_costs)) {
    for (const day of data.daily_costs) {
      if (day.timestamp && day.line_items) {
        for (const item of day.line_items) {
          if (item.n_tokens_total) {
            totalTokens += item.n_tokens_total;
          }
        }
      }
    }
  }
  return NextResponse.json({ tokens: totalTokens });
} 