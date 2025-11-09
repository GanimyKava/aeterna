import type { Attraction } from "../../types/attraction";

export type Metrics = {
  recordVisit: (page: string) => void;
  recordAttractionView: (id: string) => void;
  recordVideoPlay: (id: string) => void;
};

export function ensureAssets(scene: Element): HTMLElement {
  const existing = scene.querySelector<HTMLElement>("a-assets");
  if (existing) {
    return existing;
  }
  const assets = document.createElement("a-assets");
  scene.appendChild(assets);
  return assets;
}

export function createVideoAsset(assets: HTMLElement, attraction: Attraction): HTMLVideoElement {
  const video = document.createElement("video");
  video.id = `video-${attraction.id}`;
  video.setAttribute("preload", "none");
  video.setAttribute("crossorigin", "anonymous");
  video.setAttribute("playsinline", "true");
  video.setAttribute("loop", "true");
  video.setAttribute("autoplay", "true");
  video.muted = false;
  assets.appendChild(video);
  return video;
}

type PlaybackOptions = {
  primary: HTMLVideoElement;
  overlay?: HTMLVideoElement | null;
  id: string;
  metrics: Metrics;
};

export function attachVideoPlayback({ primary, overlay, id, metrics }: PlaybackOptions): () => void {
  let disposed = false;
  let recorded = false;

  const attempt = (video: HTMLVideoElement, muted = false): void => {
    if (disposed) return;

    video.muted = muted;
    const playPromise = video.play();

    if (playPromise?.then) {
      playPromise
        .then(() => {
          if (video === primary && !recorded) {
            recorded = true;
            metrics.recordVideoPlay(id);
          }
          if (video === overlay && overlay) {
            overlay.muted = muted;
          }
          if (muted && video !== overlay) {
            window.setTimeout(() => {
              if (!disposed) {
                video.muted = false;
              }
            }, 160);
          }
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "NotAllowedError" && !muted) {
            attempt(video, true);
            return;
          }
          if (import.meta.env.DEV) {
            console.warn("AR video playback blocked", error);
          }
        });
    }
  };

  const tick = () => {
    attempt(primary, false);
    if (overlay) {
      attempt(overlay, false);
    }
  };

  const listeners: Array<{ target: HTMLVideoElement; type: keyof HTMLVideoElementEventMap; handler: () => void }> = [];

  const register = (target: HTMLVideoElement, type: keyof HTMLVideoElementEventMap) => {
    const handler = () => tick();
    target.addEventListener(type, handler, { once: false });
    listeners.push({ target, type, handler });
  };

  ["loadeddata", "canplay", "canplaythrough"].forEach((event) => {
    register(primary, event as keyof HTMLVideoElementEventMap);
    if (overlay) {
      register(overlay, event as keyof HTMLVideoElementEventMap);
    }
  });

  [0, 160, 400, 800].forEach((delay) => {
    window.setTimeout(() => {
      if (!disposed) {
        tick();
      }
    }, delay);
  });

  tick();

  return () => {
    disposed = true;
    listeners.forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler);
    });
  };
}

