// ============================================
// DEX MOVIE — Scraper Engine
// ============================================

let scraper = null;

async function loadScraper() {
  if (scraper) return scraper;
  try {
    scraper = await import('@definisi/vidsrc-scraper');
    return scraper;
  } catch (e) {
    console.error('scraper not available:', e.message);
    return null;
  }
}

// ====== VidSrc.net ======
export async function getVidSrcNet(tmdbId, type, season = null, episode = null) {
  try {
    const mod = await loadScraper();
    if (!mod) return null;

    const params = type === 'movie'
      ? { tmdbId: String(tmdbId), type: 'movie' }
      : { tmdbId: String(tmdbId), season: Number(season), episode: Number(episode), type: 'tv' };

    const result = await mod.getVidSrc(params);

    if (!result || !result.sources || !result.sources.length) return null;

    return {
      name: 'VidSrc.net',
      url: result.sources[0].url,
      subtitles: result.subtitles || [],
      quality: 'auto',
      referer: 'https://vidsrc.net/'
    };
  } catch (e) {
    console.error('VidSrc.net error:', e.message);
    return null;
  }
}

// ====== VidSrc.xyz ======
export async function getVidSrcXyz(tmdbId, type, season = null, episode = null) {
  try {
    const url = type === 'movie'
      ? `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`
      : `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;

    // نرجع embed URL كـ fallback
    return {
      name: 'VidSrc.xyz',
      url: url,
      subtitles: [],
      quality: 'auto',
      referer: 'https://vidsrc.xyz/'
    };
  } catch (e) {
    return null;
  }
}

// ====== 2Embed ======
export async function get2Embed(tmdbId, type, season = null, episode = null) {
  try {
    const url = type === 'movie'
      ? `https://www.2embed.cc/embed/${tmdbId}`
      : `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;

    return {
      name: '2Embed',
      url: url,
      subtitles: [],
      quality: 'auto',
      referer: 'https://www.2embed.cc/'
    };
  } catch (e) {
    return null;
  }
}

// ====== AutoEmbed ======
export async function getAutoEmbed(tmdbId, type, season = null, episode = null) {
  try {
    const url = type === 'movie'
      ? `https://player.autoembed.cc/embed/movie/${tmdbId}`
      : `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;

    return {
      name: 'AutoEmbed',
      url: url,
      subtitles: [],
      quality: 'auto',
      referer: 'https://player.autoembed.cc/'
    };
  } catch (e) {
    return null;
  }
}
