const functions = require('firebase-functions');

exports.apiRoute = functions.https.onRequest(async (req, res) => {
  // Equivalent to GET /api
  if (req.method === 'GET') {
    res.json({ message: 'API route working!' });
  } else {
    res.status(405).send('Method Not Allowed');
  }
});
