/**
 * Server-side proxy for Crelate RSS (avoids browser CORS + flaky public proxies).
 * Deploy on Vercel: same-origin fetch from /api/crelate-rss
 */
const CRELATE_RSS = 'https://jobs.crelate.com/portal/sourceabilityinc/rss';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const upstream = await fetch(CRELATE_RSS, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
        'User-Agent': 'SourceAbility-Website/1.0 (+https://www.sourceabilityinc.com)',
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'Upstream feed error',
        status: upstream.status,
      });
    }

    const text = await upstream.text();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(text);
  } catch (err) {
    console.error('crelate-rss proxy:', err);
    return res.status(502).json({ error: 'Failed to fetch RSS feed' });
  }
};
