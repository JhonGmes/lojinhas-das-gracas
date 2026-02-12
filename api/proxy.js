export default async function handler(req, res) {
    const { target } = req.query;
    if (!target) return res.status(400).json({ error: 'Missing target' });

    try {
        const response = await fetch(target, {
            method: req.method,
            headers: { 'Content-Type': 'application/json' },
            body: req.method === 'POST' ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
