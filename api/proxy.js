/* eslint-disable no-undef */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const target = req.query.target;
  if (!target) return res.status(400).json({ error: 'Missing target' });

  try {
    const isPost = req.method === 'POST';
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (isPost) {
      // Vercel auto-parses req.body if content-type is json
      options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(target, options);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
