import type { Attraction } from "../../types/attraction";
import { normalizeAssetPath } from "../../utils/assetPaths";
import { type Metrics } from "./videoUtils";
import { setupArViewport } from "./viewport";
import { waitForArSystem } from "./waitForArSystem";

type LocationExperienceOptions = {
  attractions: Attraction[];
  scene: HTMLElement | null;
  gpsRoot: HTMLElement | null;
  uiVideo: HTMLVideoElement | null;
  metrics: Metrics;
};

const PHONE_NUMBER = "+61491570156";
const PROFILE_ID = "premium-video";

async function requestQualityOnDemand() {
  try {
    if (window.CamaraApi?.requestQualityOnDemand) {
      const session = await window.CamaraApi.requestQualityOnDemand(PHONE_NUMBER, PROFILE_ID);
      console.info("QoD session started:", session?.sessionId ?? "mock-session");
    } else {
      console.info("CamaraApi.requestQualityOnDemand unavailable - demo mode.");
    }
  } catch (error) {
    console.error("Location AR QoD request failed", error);
  }
}

export function initLocationExperience({
  attractions,
  scene,
  gpsRoot,
  uiVideo,
  metrics,
}: LocationExperienceOptions): () => void {
  if (!gpsRoot) {
    console.warn("Location experience missing gps root.");
    return () => {};
  }

  metrics.recordVisit("ar-location");
  requestQualityOnDemand();

  const cleanupFns: Array<() => void> = [];
  let cancelled = false;

  const run = async () => {
    if (scene) {
      cleanupFns.push(setupArViewport(scene, uiVideo ?? undefined));
      await waitForArSystem(scene);
      if (cancelled) {
        return;
      }
    }

    const loadedVideos = new Map<string, boolean>();
    const overlayListenerCleanup: Array<() => void> = [];
    const overlayTimeouts: number[] = [];

    const clearOverlayPlayback = () => {
      while (overlayListenerCleanup.length) {
        overlayListenerCleanup.pop()?.();
      }
      while (overlayTimeouts.length) {
        const timeoutId = overlayTimeouts.pop();
        if (typeof timeoutId === "number") {
          window.clearTimeout(timeoutId);
        }
      }
    };

    const locationAttractions = attractions.filter(
      (attraction) =>
        attraction.location &&
        typeof attraction.location.latitude === "number" &&
        typeof attraction.location.longitude === "number" &&
        attraction.videoUrl,
    );

    const tryLoadVideo = (
      attraction: Attraction,
      lat: number,
      lon: number,
    ) => {
      if (cancelled) {
        return;
      }

      const details = attraction.location!;
      const radius = details.radiusMeters ?? 120;

      const distance = haversineMeters(lat, lon, details.latitude!, details.longitude!);
      const isWithin = distance <= radius;
      const alreadyLoaded = loadedVideos.get(attraction.id);

      if (isWithin) {
        if (!alreadyLoaded) {
          const videoSrc = normalizeAssetPath(attraction.videoUrl);
          if (!videoSrc) {
            console.warn(`Video URL missing or invalid for attraction ${attraction.id}`);
            return;
          }
          if (uiVideo) {
            clearOverlayPlayback();
            uiVideo.src = videoSrc;
            uiVideo.load();
            uiVideo.currentTime = 0;
            uiVideo.loop = true;
            uiVideo.muted = false;
            uiVideo.classList.add("visible");

            const triggerPlayback = () => {
              if (cancelled) {
                return;
              }
              uiVideo
                .play()
                .catch((error) => {
                  if (error instanceof DOMException && error.name === "NotAllowedError") {
                    uiVideo.muted = true;
                    uiVideo
                      .play()
                      .then(() => {
                        window.setTimeout(() => {
                          uiVideo.muted = false;
                        }, 200);
                      })
                      .catch(() => {});
                  }
                });
            };

            ["loadeddata", "canplay", "canplaythrough"].forEach((event) => {
              const handler = () => triggerPlayback();
              uiVideo.addEventListener(event, handler, { once: true });
              overlayListenerCleanup.push(() => uiVideo.removeEventListener(event, handler));
            });

            [0, 160, 400].forEach((delay) => {
              const timeoutId = window.setTimeout(triggerPlayback, delay);
              overlayTimeouts.push(timeoutId);
            });
          }

          metrics.recordAttractionView(attraction.id);
          metrics.recordVideoPlay(attraction.id);
          loadedVideos.set(attraction.id, true);
        }
      } else if (alreadyLoaded) {
        if (uiVideo) {
          clearOverlayPlayback();
          uiVideo.pause();
          uiVideo.currentTime = 0;
          uiVideo.classList.remove("visible");
          uiVideo.removeAttribute("src");
        }
        loadedVideos.delete(attraction.id);
      }
    };

    const entities: HTMLElement[] = [];

    locationAttractions.forEach((attraction) => {
      if (cancelled) {
        return;
      }

      const wrapper = document.createElement("a-entity");
      const { latitude, longitude } = attraction.location!;
      wrapper.setAttribute("gps-entity-place", `latitude: ${latitude}; longitude: ${longitude};`);

      const plane = document.createElement("a-plane");
      plane.setAttribute("width", "1.6");
      plane.setAttribute("height", "0.9");
      plane.setAttribute("color", "#1d4ed8");
      plane.setAttribute("opacity", "0.8");
      plane.setAttribute("position", "0 1.5 0");
      plane.setAttribute(
        "text",
        `value: ${attraction.name}; color: #fff; align: center; width: 3`,
      );
      wrapper.appendChild(plane);

      (wrapper as any).__tryLoadVideo = (lat: number, lon: number) => tryLoadVideo(attraction, lat, lon);
      entities.push(wrapper);
      gpsRoot.appendChild(wrapper);
    });

    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const lat = detail?.position?.latitude;
      const lon = detail?.position?.longitude;
      if (typeof lat === "number" && typeof lon === "number") {
        localStorage.setItem("eternity.lastPosition", JSON.stringify({ latitude: lat, longitude: lon }));
        entities.forEach((entity) => {
          const fn = (entity as any).__tryLoadVideo;
          if (typeof fn === "function") {
            fn(lat, lon);
          }
        });
      }
    };

    window.addEventListener("gps-camera-update-position", handler);

    cleanupFns.push(() => {
      window.removeEventListener("gps-camera-update-position", handler);
      entities.forEach((entity) => entity.remove());
      clearOverlayPlayback();
    });

    const lastPositionRaw = localStorage.getItem("eternity.lastPosition");
    if (lastPositionRaw) {
      try {
        const parsed = JSON.parse(lastPositionRaw);
        if (typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
          entities.forEach((entity) => {
            const fn = (entity as any).__tryLoadVideo;
            if (typeof fn === "function") {
              fn(parsed.latitude, parsed.longitude);
            }
          });
        }
      } catch (error) {
        console.warn("Failed to parse cached position", error);
      }
    }

    cleanupFns.push(() => {
      if (uiVideo) {
        uiVideo.pause();
        uiVideo.currentTime = 0;
        uiVideo.classList.remove("visible");
        uiVideo.removeAttribute("src");
      }
    });
  };

  const teardown = () => {
    cancelled = true;
    cleanupFns.forEach((fn) => fn());
  };

  run().catch((error) => {
    console.error("Failed to initialise location experience", error);
    teardown();
  });

  return teardown;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

