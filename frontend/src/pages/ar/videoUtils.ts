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
  video.muted = false;
  assets.appendChild(video);
  return video;
}

export function playVideo(
  videoEl: HTMLVideoElement,
  uiVideo: HTMLVideoElement | null,
  id: string,
  metrics: Metrics,
): void {
  const attempt = (video: HTMLVideoElement, muted = false): Promise<void> => {
    video.muted = muted;
    return video
      .play()
      .then(() => {
        metrics.recordVideoPlay(id);
        if (uiVideo && video === videoEl) {
          uiVideo.muted = muted;
        }
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "NotAllowedError" && !muted) {
          return attempt(video, true);
        }
        console.warn("AR video playback blocked", error);
        return Promise.resolve();
      });
  };

  attempt(videoEl);
  if (uiVideo) {
    attempt(uiVideo);
  }
}

