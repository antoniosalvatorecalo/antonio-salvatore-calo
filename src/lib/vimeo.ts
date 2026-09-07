export function isVimeoUrl(src: string): boolean {
  return typeof src === 'string' && src.includes('vimeo.com');
}

export function getVimeoEmbedUrl(src: string): string {
  const match = src.match(/vimeo\.com\/(\d+)/);
  if (match) {
    return `https://player.vimeo.com/video/${match[1]}?background=1&autoplay=1&loop=1&muted=1&controls=0&playsinline=1`;
  }
  if (!src) return src;
  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}background=1&autoplay=1&loop=1&muted=1&controls=0&playsinline=1`;
}

export function getVimeoThumbnailUrl(src: string): string {
  const match = src.match(/vimeo\.com\/(\d+)/);
  if (match) {
    return `https://vumbnail.com/${match[1]}.jpg`;
  }
  return '';
}
