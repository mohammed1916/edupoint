const functions = require('firebase-functions');

exports.googleRoute = functions.https.onRequest(async (req, res) => {
  // Equivalent to GET /api/google
  if (req.method === 'GET') {
    res.json({ message: 'Google API route working!' });
  } else {
    res.status(405).send('Method Not Allowed');
  }
});
