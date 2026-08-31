import { Redis } from '@upstash/redis'

// Initialize the Redis client. 
// Vercel automatically sets KV_REST_API_URL and KV_REST_API_TOKEN 
// when you link an Upstash Redis (KV) database in your Vercel Dashboard.
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Only initialize if we have the credentials, so it doesn't crash during local dev without env vars
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export default async function handler(req: any, res: any) {
    // Use a hardcoded string as the key to store data for you.
    // If you ever needed multiple users, you would use an auth library here.
    const REDIS_KEY = `study_tracker_data`;

    // If redis isn't configured, silently return mock data so local dev doesn't break
    if (!redis) {
        if (req.method === 'GET') {
            return res.status(200).json({});
        }
        return res.status(200).json({ success: true, warning: 'Redis not configured locally' });
    }

    if (req.method === 'GET') {
        try {
            const data = await redis.get(REDIS_KEY);
            res.status(200).json(data || {});
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch data' });
        }
    } else if (req.method === 'POST') {
        try {
            await redis.set(REDIS_KEY, req.body);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to save data' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
