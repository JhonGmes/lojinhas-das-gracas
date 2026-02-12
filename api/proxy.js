/* eslint-disable no-undef */
export default async function handler(req, res) {
    // Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    const target = req.query.target;
    if (!target) {
        return res.status(400).json({ error: 'Missing target' });
    }

    try {
        const options = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            options.body = JSON.stringify(req.body);
        }

        const response = await fetch(target, options);
        const data = await response.json();

        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
