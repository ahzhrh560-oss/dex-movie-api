// ============================================
// DEX MOVIE — Scraper Engine
// سحب روابط m3u8 مباشرة من السيرفرات
// ============================================

let vidsrcBypass = null;

// محاولة تحميل vidsrc-bypass ديناميكياً
async function loadBypass() {
  if (vidsrcBypass) return vidsrcBypass;
  try {
    vidsrcBypass = await import('vidsrc-bypass');
    return vidsrcBypass;
  } catch (e) {
    console.error('vidsrc-bypass not available:', e.message);
    return null;
  }
}

// ============================================
// VidLink Pro — الأفضل حالياً
// ============================================
export async function getVidLink(tmdbId, type, season = null, episode = null) {
  try {
    const mod = await loadBypass();
    if (!mod) return null;

    const params = type === 'movie'
      ? { id: String(tmdbId), type: 'movie' }
      : { id: String(tmdbId), season: Number(season), episode: Number(episode), type: 'tv' };

    const result = await mod.getVidLinkProVideo(params);

    if (!result || !result.stream || !result.stream.url) return null;

    return {
      name: 'VidLink Pro',
      url: result.stream.url,
      subtitles: (result.subtitles || []).map(s => ({
        lang: s.lang || s.language || 'en',
        url: s.url || s.file,
        label: s.label || s.lang || 'Subtitle'
      })),
      quality: 'auto',
      referer: 'https://vidlink.pro/'
    };
  } catch (e) {
    console.error('VidLink error:', e.message);
    return null;
  }
}

// ============================================
// Embed.su
// ============================================
export async function getEmbedSu(tmdbId, type, season = null, episode = null) {
  try {
    const mod = await loadBypass();
    if (!mod) return null;

    // 1. جلب تفاصيل الفيديو
    const details = type === 'movie'
      ? await mod.getEmbedSuVideo(tmdbId)
      : await mod.getEmbedSuVideo(tmdbId, season, episode);

    if (!details || !details.servers || !details.servers.length) return null;

    // 2. سحب رابط البث من أول سيرفر
    const stream = await mod.getEmbedSuStreamUrl(details.servers[0].hash);

    if (!stream || !stream.url) return null;

    return {
      name: 'Embed.su',
      url: stream.url,
      subtitles: (stream.subtitles || []).map(s => ({
        lang: s.lang || 'en',
        url: s.url || s.file,
        label: s.label || s.lang || 'Subtitle'
      })),
      quality: 'auto',
      referer: 'https://embed.su/'
    };
  } catch (e) {
    console.error('Embed.su error:', e.message);
    return null;
  }
}

// ============================================
// VidSrc.rip
// ============================================
export async function getVidSrcRip(tmdbId, type, season = null, episode = null) {
  try {
    const mod = await loadBypass();
    if (!mod) return null;

    const streamUrl = await mod.getVidSrcRipStreamUrl(tmdbId, type === 'movie' ? null : season, type === 'movie' ? null : episode);

    if (!streamUrl) return null;

    return {
      name: 'VidSrc.rip',
      url: typeof streamUrl === 'string' ? streamUrl : streamUrl.url,
      subtitles: [],
      quality: 'auto',
      referer: 'https://vidsrc.rip/'
    };
  } catch (e) {
    console.error('VidSrc.rip error:', e.message);
    return null;
  }
}

// ============================================
// VidSrc.icu
// ============================================
export async function getVidSrcIcu(tmdbId, type, season = null, episode = null) {
  try {
    const mod = await loadBypass();
    if (!mod) return null;

    const stream = await mod.getVidSrcIcuStreamUrl(tmdbId, season, episode);

    if (!stream) return null;

    return {
      name: 'VidSrc.icu',
      url: typeof stream === 'string' ? stream : stream.url,
      subtitles: [],
      quality: 'auto',
      referer: 'https://vidsrc.icu/'
    };
  } catch (e) {
    console.error('VidSrc.icu error:', e.message);
    return null;
  }
}