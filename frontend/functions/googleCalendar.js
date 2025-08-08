const functions = require('firebase-functions');
const fetch = require('node-fetch');

exports.googleCalendar = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { accessToken, timeMin } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'Missing access token' });

  const params = new URLSearchParams();
  if (timeMin) params.append('timeMin', timeMin);
  params.append('singleEvents', 'true');
  params.append('orderBy', 'startTime');

  const googleRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const data = await googleRes.json();
  res.json({ items: data.items || [] });
});
