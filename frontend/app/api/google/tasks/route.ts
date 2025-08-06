import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { accessToken, taskListId } = await req.json();
  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
  }

  // Default to 'tasks' if no taskListId provided
  const listId = taskListId || '@default';
  const googleRes = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await googleRes.json();
  return NextResponse.json({ items: data.items || [] });
}
