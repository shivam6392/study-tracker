// GitHub Repository JSON database handler
// Reads and writes data/tracker.json directly using GitHub REST API or raw content

const REPO_OWNER = 'shivam6392';
const REPO_NAME = 'study-tracker';
const FILE_PATH = 'data/tracker.json';

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    if (req.method === 'GET') {
        try {
            // Fetch raw JSON file directly from GitHub main branch
            const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/master/${FILE_PATH}`;
            const response = await fetch(rawUrl, {
                headers: { 'Cache-Control': 'no-cache' }
            });

            if (!response.ok) {
                return res.status(200).json({});
            }

            const data = await response.json();
            return res.status(200).json(data || {});
        } catch (err) {
            console.error('GET github JSON error:', err);
            return res.status(200).json({});
        }
    }

    if (req.method === 'POST') {
        if (!githubToken) {
            return res.status(200).json({
                success: false,
                warning: 'GITHUB_TOKEN env variable not set in Vercel. Updates saved locally in browser.'
            });
        }

        try {
            const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2);
            const contentBase64 = Buffer.from(bodyData).toString('base64');

            // 1. Get current file SHA from GitHub API
            const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
            const getRes = await fetch(apiUrl, {
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

            // 2. Commit updated JSON file back to GitHub
            const putRes = await fetch(apiUrl, {
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
                    branch: 'master'
                })
            });

            if (!putRes.ok) {
                const errorText = await putRes.text();
                console.error('GitHub API error:', errorText);
                return res.status(200).json({ success: false, error: 'GitHub API commit failed' });
            }

            return res.status(200).json({ success: true });
        } catch (err: any) {
            console.error('POST github commit catch error:', err?.message || err);
            return res.status(200).json({ success: false, error: err?.message });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
