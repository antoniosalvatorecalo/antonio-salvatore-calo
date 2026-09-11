const widths = [320, 640, 960, 1280, 1600];

export function getSanityImageSources(
  url: string,
  width?: number,
  sizes = '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 72rem',
) {
  if (!url.includes('cdn.sanity.io')) return {};
  const candidates = widths
    .filter((candidate) => !width || candidate < width)
    .concat(width ? [width] : []);
  const unique = [...new Set(candidates)].sort((a, b) => a - b);
  const build = (candidate: number) =>
    `${url}${url.includes('?') ? '&' : '?'}auto=format&fit=max&w=${candidate}`;
  return {
    src: build(unique.at(-1) ?? 1280),
    srcSet: unique.map((candidate) => `${build(candidate)} ${candidate}w`).join(', '),
    sizes,
  };
}
