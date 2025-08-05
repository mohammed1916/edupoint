import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { accessToken, timeMin } = await req.json();
  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
  }

  const params = new URLSearchParams();
  if (timeMin) params.append('timeMin', timeMin);
  params.append('singleEvents', 'true'); // recommended for event instances
  params.append('orderBy', 'startTime'); // recommended for sorting

  const googleRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await googleRes.json();
  // location is included in each event if present
  return NextResponse.json({ items: data.items || [] });
}
