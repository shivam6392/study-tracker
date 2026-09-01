// GitHub Repository JSON database handler
// Uses GitHub API for both reading and writing to ensure fresh data always

const REPO_OWNER = 'shivam6392';
const REPO_NAME = 'study-tracker';
const FILE_PATH = 'data/tracker.json';
const BRANCH = 'sister-version';

// Base URL (no query params) - used for PUT commits
const BASE_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
// GET URL with ref param to read from the correct branch
const GET_API_URL = `${BASE_API_URL}?ref=${BRANCH}`;

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Prevent Vercel edge caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    if (req.method === 'GET') {
        try {
            const headers: Record<string, string> = {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Vercel-Study-Tracker',
                'If-None-Match': '',
            };
            if (githubToken) {
                headers['Authorization'] = `Bearer ${githubToken}`;
            }

            const response = await fetch(GET_API_URL, { headers });

            if (!response.ok) {
                return res.status(200).json({});
            }

            const fileInfo = await response.json();
            const content = Buffer.from(fileInfo.content, 'base64').toString('utf-8');
            const data = JSON.parse(content);
            return res.status(200).json(data || {});
        } catch (err) {
            console.error('GET error:', err);
            return res.status(200).json({});
        }
    }

    if (req.method === 'POST') {
        if (!githubToken) {
            return res.status(200).json({
                success: false,
                warning: 'GITHUB_TOKEN env variable not set in Vercel.'
            });
        }

        try {
            const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2);
            const contentBase64 = Buffer.from(bodyData).toString('base64');

            // 1. Get current file SHA (use GET_API_URL with ref param)
            const getRes = await fetch(GET_API_URL, {
                headers: {
                    'Authorization': `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Vercel-Study-Tracker'
                }
            });

            let sha = undefined;
            if (getRes.ok) {
                const fileInfo = await getRes.json();
                sha = fileInfo.sha;
            }

            // 2. Commit updated JSON file (use BASE_API_URL without query params)
            const putRes = await fetch(BASE_API_URL, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Vercel-Study-Tracker'
                },
                body: JSON.stringify({
                    message: 'update: sync study tracker progress [skip ci]',
                    content: contentBase64,
                    sha: sha,
                    branch: BRANCH
                })
            });

            if (!putRes.ok) {
                const errorText = await putRes.text();
                console.error('GitHub commit error:', errorText);
                return res.status(200).json({ success: false, error: 'GitHub commit failed' });
            }

            return res.status(200).json({ success: true });
        } catch (err: any) {
            console.error('POST error:', err?.message || err);
            return res.status(200).json({ success: false, error: err?.message });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
