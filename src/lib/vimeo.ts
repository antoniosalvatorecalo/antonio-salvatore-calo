export function isVimeoUrl(src: string): boolean {
  if (typeof src !== 'string' || !src) return false;
  try {
    const hostname = new URL(src).hostname.toLowerCase();
    return hostname === 'vimeo.com' || hostname.endsWith('.vimeo.com');
  } catch {
    return /^(?:https?:\/\/)?(?:[\w-]+\.)*vimeo\.com(?:\/|$)/i.test(src);
  }
}

export function getVimeoEmbedUrl(src: string): string {
  const id = getVimeoVideoId(src);
  if (id) {
    return `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1&controls=0&playsinline=1`;
  }
  if (!src) return src;
  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}background=1&autoplay=1&loop=1&muted=1&controls=0&playsinline=1`;
}

export function getVimeoVideoId(src: string): string | null {
  const match = typeof src === 'string'
    ? src.match(/vimeo\.com\/(?:video\/|manage\/videos\/)?(\d+)/i)
    : null;
  return match?.[1] ?? null;
}

export function getVimeoThumbnailUrl(src: string): string {
  const id = getVimeoVideoId(src);
  return id ? `https://vumbnail.com/${id}.jpg` : '';
}
