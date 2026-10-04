// ============================================
// DEX MOVIE — Main Stream API
// ============================================

import { getVidSrcNet, getVidSrcXyz, get2Embed, getAutoEmbed } from '../lib/scraper.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, type = 'movie', s, e } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'id parameter is required' });
  }

  const season = s ? parseInt(s) : null;
  const episode = e ? parseInt(e) : null;

  if (type === 'tv' && (!season || !episode)) {
    return res.status(400).json({ success: false, error: 'season and episode required for tv' });
  }

  const startTime = Date.now();

  // اجلب من كل المصادر بالتوازي
  const results = await Promise.allSettled([
    getVidSrcNet(id, type, season, episode),
    getVidSrcXyz(id, type, season, episode),
    get2Embed(id, type, season, episode),
    getAutoEmbed(id, type, season, episode)
  ]);

  const sources = results
    .filter(r => r.status === 'fulfilled' && r.value && r.value.url)
    .map(r => r.value);

  const elapsed = Date.now() - startTime;

  if (sources.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'No sources available',
      id, type, season, episode, elapsed
    });
  }

  return res.status(200).json({
    success: true,
    id, type, season, episode,
    sources,
    count: sources.length,
    elapsed
  });
}
