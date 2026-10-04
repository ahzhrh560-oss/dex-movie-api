import {
  getFlixHQ,
  getVidSrcNet,
  get2Embed,
  getAutoEmbed,
  getVidSrcXyz
} from '../lib/scraper.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, type = 'movie', s, e } = req.query;
  if (!id) return res.status(400).json({ success: false, error: 'id مطلوب' });

  const season = s ? parseInt(s) : null;
  const episode = e ? parseInt(e) : null;
  const tmdbKey = process.env.TMDB_KEY || '7f74dd818170c3ca2bdf4e35a10ee2eb';

  const results = await Promise.allSettled([
    getFlixHQ(id, type, season, episode, tmdbKey),
    getVidSrcNet(id, type, season, episode),
    getVidSrcXyz(id, type, season, episode),
    get2Embed(id, type, season, episode),
    getAutoEmbed(id, type, season, episode)
  ]);

  const sources = results
    .filter(r => r.status === 'fulfilled' && r.value && r.value.url)
    .map(r => r.value);

  if (sources.length === 0) {
    return res.status(404).json({ success: false, error: 'No sources', id, type });
  }

  return res.status(200).json({
    success: true, id, type, season, episode,
    sources, count: sources.length
  });
}
