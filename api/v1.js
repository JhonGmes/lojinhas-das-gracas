/* eslint-disable no-undef */
import fetch from 'node-fetch';

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { target } = req.query;
    if (!target) return res.status(400).json({ error: 'Faltando destino (target)' });

    try {
        const options = {
            method: req.method,
            headers: { 'Content-Type': 'application/json' }
        };

        if (req.method === 'POST') {
            options.body = JSON.stringify(req.body);
        }

        const response = await fetch(target, options);
        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ error: 'Erro no servidor de pagamento: ' + error.message });
    }
}
