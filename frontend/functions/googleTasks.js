const functions = require('firebase-functions');
const fetch = require('node-fetch');

exports.googleTasks = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { accessToken, taskListId } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'Missing access token' });
  const listId = taskListId || '@default';
  const googleRes = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const data = await googleRes.json();
  res.json({ items: data.items || [] });
});
