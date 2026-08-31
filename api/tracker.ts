import { Redis } from '@upstash/redis'

// Try explicit REST env vars first
let restUrl =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.STORAGE_REST_URL;

let restToken =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.STORAGE_REST_TOKEN;

// Fallback: parse REDIS_URL (format: rediss://default:TOKEN@host:port)
if (!restUrl || !restToken) {
    const rawUrl = process.env.REDIS_URL;
    if (rawUrl) {
        try {
            const parsed = new URL(rawUrl);
            restUrl = restUrl || `https://${parsed.hostname}`;
            restToken = restToken || parsed.password;
        } catch (_) { /* ignore */ }
    }
}

const redis = restUrl && restToken ? new Redis({ url: restUrl, token: restToken }) : null;

const REDIS_KEY = 'study_tracker_data';

export default async function handler(req: any, res: any) {
    // Debug endpoint
    if (req.query?.debug === '1') {
        return res.status(200).json({
            connected: !!redis,
            hasUrl: !!restUrl,
            hasToken: !!restToken,
            envKeysFound: Object.keys(process.env).filter(k =>
                k.includes('REDIS') || k.includes('KV') || k.includes('STORAGE') || k.includes('UPSTASH')
            )
        });
    }

    if (!redis) {
        if (req.method === 'GET') {
            return res.status(200).json({});
        }
        return res.status(200).json({ success: true, warning: 'Redis not configured' });
    }

    if (req.method === 'GET') {
        try {
            const raw = await redis.get(REDIS_KEY);
            // Handle both string and object responses from Upstash
            let data = raw;
            if (typeof raw === 'string') {
                try { data = JSON.parse(raw); } catch (_) { data = raw; }
            }
            return res.status(200).json(data || {});
        } catch (error) {
            console.error('Redis GET error:', error);
            return res.status(500).json({ error: 'Failed to fetch data' });
        }
    } else if (req.method === 'POST') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            // Store as plain JSON string - redis.set with a string avoids double-encoding
            await redis.set(REDIS_KEY, JSON.stringify(body));
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Redis POST error:', error);
            return res.status(500).json({ error: 'Failed to save data' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
