/** Wait for the actual destination image (or video poster), not a second request. */
export function waitForProjectMedia(plane: HTMLElement, signal: AbortSignal): Promise<boolean> {
  const image = plane.querySelector<HTMLImageElement>('[data-transition-media]');
  if (!image || signal.aborted) return Promise.resolve(false);

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
