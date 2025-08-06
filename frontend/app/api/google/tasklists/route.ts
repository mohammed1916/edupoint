import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json();
  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
  }

  // Fetch all task lists for the user
  const googleRes = await fetch(
    'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await googleRes.json();
  return NextResponse.json({ items: data.items || [] });
}
