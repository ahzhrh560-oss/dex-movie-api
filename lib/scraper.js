// ============================================
// DEX MOVIE — Scraper Engine
// ============================================

const CONSUMET_BASE = 'https://api.consumet.org';

// ====== Consumet: FlixHQ ======
export async function getConsumetFlixHQ(tmdbId, type, season = null, episode = null, tmdbKey) {
  try {
    // 1. جلب اسم الفيلم من TMDB
    const tmdbRes = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${tmdbKey}&language=en`
    );
    const tmdb = await tmdbRes.json();
    const title = tmdb.title || tmdb.name;
    if (!title) return null;

    // 2. البحث في FlixHQ
    const searchRes = await fetch(
      `${CONSUMET_BASE}/movies/flixhq/${encodeURIComponent(title)}`
    );
    const search = await searchRes.json();
    if (!search.results || !search.results.length) return null;

    const flixId = search.results[0].id;

    // 3. جلب تفاصيل الفيلم
    const infoRes = await fetch(`${CONSUMET_BASE}/movies/flixhq/info?id=${flixId}`);
    const info = await infoRes.json();

    let episodeId;
    if (type === 'movie') {
      episodeId = info.episodes[0].id;
    } else {
      const ep = info.episodes.find(e => e.season === season && e.number === episode);
      if (!ep) return null;
      episodeId = ep.id;
    }

    // 4. جلب رابط الفيديو
    const streamRes = await fetch(
      `${CONSUMET_BASE}/movies/flixhq/watch?episodeId=${episodeId}&mediaId=${flixId}`
    );
    const stream = await streamRes.json();

    if (!stream.sources || !stream.sources.length) return null;

    const best = stream.sources.find(s => s.quality === '1080p')
              || stream.sources.find(s => s.quality === '720p')
              || stream.sources[0];

    return {
      name: 'FlixHQ',
      url: best.url,
      quality: best.quality,
      subtitles: (stream.subtitles || []).map(s => ({
        lang: s.lang,
        url: s.url,
        label: s.lang
      }))
    };
  } catch (e) {
    console.error('FlixHQ error:', e.message);
    return null;
  }
}

// ====== VidSrc.net (embed) ======
export async function getVidSrcNet(tmdbId, type, season = null, episode = null) {
  const url = type === 'movie'
    ? `https://vidsrc.net/embed/movie/${tmdbId}`
    : `https://vidsrc.net/embed/tv/${tmdbId}/${season}/${episode}`;
  return { name: 'VidSrc.net', url, subtitles: [], quality: 'auto' };
}

// ====== 2Embed ======
export async function get2Embed(tmdbId, type, season = null, episode = null) {
  const url = type === 'movie'
    ? `https://www.2embed.cc/embed/${tmdbId}`
    : `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
  return { name: '2Embed', url, subtitles: [], quality: 'auto' };
}

// ====== AutoEmbed ======
export async function getAutoEmbed(tmdbId, type, season = null, episode = null) {
  const url = type === 'movie'
    ? `https://player.autoembed.cc/embed/movie/${tmdbId}`
    : `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
  return { name: 'AutoEmbed', url, subtitles: [], quality: 'auto' };
}

// ====== VidSrc.xyz ======
export async function getVidSrcXyz(tmdbId, type, season = null, episode = null) {
  const url = type === 'movie'
    ? `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`
    : `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
  return { name: 'VidSrc.xyz', url, subtitles: [], quality: 'auto' };
}
