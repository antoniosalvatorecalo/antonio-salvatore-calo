export function isVimeoUrl(src: string): boolean {
  return typeof src === 'string' && src.includes('vimeo.com');
}

export function getVimeoEmbedUrl(src: string): string {
  const match = src.match(/vimeo\.com\/(\d+)/);
  if (match) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return src;
}

export function getVimeoThumbnailUrl(src: string): string {
  const match = src.match(/vimeo\.com\/(\d+)/);
  if (match) {
    return `https://vumbnail.com/${match[1]}.jpg`;
  }
  return '';
}