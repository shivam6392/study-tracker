// Clean, robust serverless API handler for Vercel + Upstash Redis

export default async function handler(req: any, res: any) {
    // Debug endpoint
    if (req.query?.debug === '1') {
        return res.status(200).json({
            envKeys: Object.keys(process.env).filter(k =>
                k.includes('REDIS') || k.includes('KV') || k.includes('STORAGE') || k.includes('UPSTASH')
            ),
            redisUrl: !!process.env.REDIS_URL,
            storageUrl: !!process.env.STORAGE_URL,
            upstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
            kvUrl: !!process.env.KV_REST_API_URL,
        });
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

    // Fallback: parse standard REDIS_URL (format: rediss://default:TOKEN@host:port)
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

    // If database credentials are not present, return empty JSON gracefully
    if (!restUrl || !restToken) {
        if (req.method === 'GET') return res.status(200).json({});
        return res.status(200).json({ success: true, warning: 'Database credentials not found' });
    }

    const REDIS_KEY = 'study_tracker_data';

    try {
        if (req.method === 'GET') {
            const response = await fetch(`${restUrl}/get/${REDIS_KEY}`, {
                headers: { Authorization: `Bearer ${restToken}` }
            });

            if (!response.ok) {
                console.error('Upstash GET error HTTP:', response.status);
                return res.status(200).json({});
            }

            const json = await response.json();
            let rawResult = json.result;

            if (!rawResult) {
                return res.status(200).json({});
            }

            // If data is JSON string, parse it before sending
            if (typeof rawResult === 'string') {
                try {
                    rawResult = JSON.parse(rawResult);
                } catch (_) { /* keep as string if not JSON */ }
            }

            return res.status(200).json(rawResult);
        }

        if (req.method === 'POST') {
            const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

            const response = await fetch(`${restUrl}/set/${REDIS_KEY}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${restToken}` },
                body: bodyString
            });

            if (!response.ok) {
                console.error('Upstash SET error HTTP:', response.status);
                return res.status(500).json({ error: 'Failed to write to database' });
            }

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (err: any) {
        console.error('Handler catch error:', err?.message || err);
        // Graceful fallback on GET so app loads even if backend errors out
        if (req.method === 'GET') {
            return res.status(200).json({});
        }
        return res.status(500).json({ error: err?.message || 'Server Error' });
    }
}
