// pages/api/graphql.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const wpGraphqlUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://findaitools.com.br/graphql';

    try {
        const wpRes = await fetch(wpGraphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        const data = await wpRes.json();
        res.status(wpRes.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao conectar ao WordPress GraphQL', details: error });
    }
}
