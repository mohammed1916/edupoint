const functions = require('firebase-functions');
const fetch = require('node-fetch');

exports.googleTasklists = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'Missing access token' });
  const googleRes = await fetch(
    'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const data = await googleRes.json();
  res.json({ items: data.items || [] });
});
