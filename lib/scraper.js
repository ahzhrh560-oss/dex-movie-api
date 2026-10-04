// ============================================
// DEX MOVIE — Scraper Engine (بدون Consumet API)
// ============================================

import { MOVIES } from '@consumet/extensions';

// ====== FlixHQ ======
export async function getFlixHQ(tmdbId, type, season, episode, tmdbKey) {
  try {
    // 1. جلب اسم الفيلم من TMDB
    const tmdbRes = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${tmdbKey}&language=en`
    );
    const tmdb = await tmdbRes.json();
    const title = tmdb.title || tmdb.name;
    if (!title) return null;

    const flixhq = new MOVIES.FlixHQ();

    // 2. البحث
    const search = await flixhq.search(title);
    if (!search.results || !search.results.length) return null;

    const mediaId = search.results[0].id;

    // 3. جلب معلومات
    const info = await flixhq.fetchMediaInfo(mediaId);

    let episodeId;
    if (type === 'movie') {
      episodeId = info.episodes[0].id;
    } else {
      const ep = info.episodes.find(e => e.season == season && e.number == episode);
      if (!ep) return null;
      episodeId = ep.id;
    }

    // 4. جلب روابط البث
    const stream = await flixhq.fetchEpisodeSources(episodeId, mediaId);
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
      })),
      isDirect: best.isM3U8 || best.url.includes('.m3u8')
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
  return { name: 'VidSrc.net', url, subtitles: [], quality: 'auto', isDirect: false };
}

// ====== 2Embed ======
export async function get2Embed(tmdbId, type, season = null, episode = null) {
  const url = type === 'movie'
    ? `https://www.2embed.cc/embed/${tmdbId}`
    : `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
  return { name: '2Embed', url, subtitles: [], quality: 'auto', isDirect: false };
}

// ====== AutoEmbed ======
export async function getAutoEmbed(tmdbId, type, season = null, episode = null) {
  const url = type === 'movie'
    ? `https://player.autoembed.cc/embed/movie/${tmdbId}`
    : `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
  return { name: 'AutoEmbed', url, subtitles: [], quality: 'auto', isDirect: false };
}

// ====== VidSrc.xyz ======
export async function getVidSrcXyz(tmdbId, type, season = null, episode = null) {
  const url = type === 'movie'
    ? `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`
    : `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
  return { name: 'VidSrc.xyz', url, subtitles: [], quality: 'auto', isDirect: false };
}
