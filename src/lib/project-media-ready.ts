/** Decode the destination cards that become visible during the shared 3D turn. */
export async function waitForProjectMedia(
  plane: HTMLElement,
  signal: AbortSignal,
): Promise<boolean> {
  const images = Array.from(plane.querySelectorAll<HTMLImageElement>('[data-transition-media]'));
  if (!images.length || signal.aborted) return false;
  const ready = await Promise.all(images.map((image) => waitForImage(image, signal)));
  return ready.every(Boolean);
}

function waitForImage(image: HTMLImageElement, signal: AbortSignal): Promise<boolean> {
  if (signal.aborted) return Promise.resolve(false);

  return new Promise((resolve) => {
    let done = false;
    const finish = (ready: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      image.removeEventListener('load', decode);
      image.removeEventListener('error', fail);
      signal.removeEventListener('abort', fail);
      resolve(ready);
    };
    const fail = () => finish(false);
    const decode = () => {
      if (!image.naturalWidth) return fail();
      void image.decode().then(() => finish(true), fail);
    };
    const timeout = window.setTimeout(fail, 6000);
    signal.addEventListener('abort', fail, { once: true });
    image.addEventListener('load', decode, { once: true });
    image.addEventListener('error', fail, { once: true });
    if (image.complete) decode();
  });
}
