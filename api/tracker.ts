// Complete, bulletproof Vercel API Route for Upstash Redis

export default async function handler(req: any, res: any) {
    // CORS Headers for cross-origin peace of mind
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Extract REST endpoint and token from any standard Vercel Upstash env configuration
    let restUrl =
        process.env.KV_REST_API_URL ||
        process.env.UPSTASH_REDIS_REST_URL ||
        process.env.STORAGE_REST_URL || '';

    let restToken =
        process.env.KV_REST_API_TOKEN ||
        process.env.UPSTASH_REDIS_REST_TOKEN ||
        process.env.STORAGE_REST_TOKEN || '';

    // Fallback: parse standard REDIS_URL / STORAGE_URL
    if (!restUrl || !restToken) {
        const rawUrl = process.env.REDIS_URL || process.env.STORAGE_URL;
        if (rawUrl) {
            try {
                const parsed = new URL(rawUrl);
                restUrl = restUrl || `https://${parsed.hostname}`;
                restToken = restToken || parsed.password;
            } catch (_) { /* ignore */ }
        }
    }

    // Debug endpoint
    if (req.query?.debug === '1') {
        return res.status(200).json({
            connected: !!(restUrl && restToken),
            restUrl: restUrl ? restUrl.substring(0, 25) + '...' : null,
            hasToken: !!restToken,
        });
    }

    if (!restUrl || !restToken) {
        if (req.method === 'GET') return res.status(200).json({});
        return res.status(200).json({ success: true, warning: 'Database credentials missing' });
    }

    const REDIS_KEY = 'study_tracker_data';

    try {
        if (req.method === 'GET') {
            // Upstash REST API GET format: GET {url}/get/{key}
            const response = await fetch(`${restUrl}/get/${REDIS_KEY}`, {
                headers: { Authorization: `Bearer ${restToken}` }
            });

            if (!response.ok) {
                return res.status(200).json({});
            }

            const json = await response.json();
            let rawResult = json.result;

            if (!rawResult) {
                return res.status(200).json({});
            }

            if (typeof rawResult === 'string') {
                try {
                    rawResult = JSON.parse(rawResult);
                } catch (_) { /* ignore parse error */ }
            }

            return res.status(200).json(rawResult);
        }

        if (req.method === 'POST') {
            const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

            // Upstash REST API SET format: POST {url}/set/{key} with body as raw string OR POST {url} with ["SET", key, value]
            const response = await fetch(`${restUrl}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${restToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(["SET", REDIS_KEY, bodyData])
            });

            if (!response.ok) {
                console.error('Upstash SET status:', response.status);
                return res.status(200).json({ success: false });
            }

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (err: any) {
        console.error('API catch:', err?.message || err);
        return res.status(200).json({ success: false, error: err?.message });
    }
}
