import type { Attraction } from "../../types/attraction";
import { createVideoAsset, ensureAssets, attachVideoPlayback, type Metrics } from "./videoUtils";
import { normalizeAssetPath } from "../../utils/assetPaths";
import { setupArViewport } from "./viewport";
import { waitForArSystem } from "./waitForArSystem";

type MarkerExperienceOptions = {
  attractions: Attraction[];
  scene: HTMLElement | null;
  markerRoot: HTMLElement | null;
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
      console.info("CamaraApi.requestQualityOnDemand unavailable - using demo mode.");
    }
  } catch (error) {
    console.error("Failed to start QoD session", error);
  }
}

export function initMarkerExperience({
  attractions,
  scene,
  markerRoot,
  uiVideo,
  metrics,
}: MarkerExperienceOptions): () => void {
  if (!scene || !markerRoot) {
    console.warn("Marker experience missing scene or marker root.");
    return () => {};
  }

  metrics.recordVisit("ar-marker");
  requestQualityOnDemand();

  const assetsEl = ensureAssets(scene);
  const cleanupFns: Array<() => void> = [setupArViewport(scene, uiVideo ?? undefined)];
  let cancelled = false;

  const run = async () => {
    await waitForArSystem(scene);
    if (cancelled) {
      return;
    }

    const relevantAttractions = attractions.filter(
      (attraction) => attraction.marker && attraction.videoUrl,
    );

    relevantAttractions.forEach((attraction) => {
      if (cancelled) {
        return;
      }

      const videoEl = createVideoAsset(assetsEl, attraction);

      const markerEl = document.createElement("a-marker");
      configureMarker(markerEl, attraction);

      markerEl.setAttribute("data-attraction-id", attraction.id);

      const plane = document.createElement("a-video");
      plane.setAttribute("width", "1.6");
      plane.setAttribute("height", "0.9");
      plane.setAttribute("position", "0 0.5 0");
      plane.setAttribute("rotation", "-90 0 0");
      plane.setAttribute("src", `#${videoEl.id}`);

      markerEl.appendChild(plane);
      markerRoot.appendChild(markerEl);

      let loaded = false;
      let releasePlayback: (() => void) | undefined;

      const onMarkerFound = () => {
        if (cancelled) {
          return;
        }
        metrics.recordAttractionView(attraction.id);
        if (!loaded && attraction.videoUrl) {
          const videoSrc = normalizeAssetPath(attraction.videoUrl);
          if (!videoSrc) {
            console.warn(`Video URL missing or invalid for attraction ${attraction.id}`);
            return;
          }
          videoEl.setAttribute("src", videoSrc);
          videoEl.src = videoSrc;
          if (uiVideo) {
            uiVideo.src = videoSrc;
            uiVideo.load();
            uiVideo.loop = true;
            uiVideo.muted = false;
            uiVideo.classList.add("visible");
          }
          loaded = true;
        }
        releasePlayback?.();
        releasePlayback = attachVideoPlayback({
          primary: videoEl,
          overlay: uiVideo ?? undefined,
          id: attraction.id,
          metrics,
        });
      };

      const onMarkerLost = () => {
        releasePlayback?.();
        releasePlayback = undefined;
        videoEl.pause();
        videoEl.currentTime = 0;
        if (uiVideo) {
          uiVideo.pause();
          uiVideo.currentTime = 0;
          uiVideo.classList.remove("visible");
        }
      };

      markerEl.addEventListener("markerFound", onMarkerFound);
      markerEl.addEventListener("markerLost", onMarkerLost);

      cleanupFns.push(() => {
        releasePlayback?.();
        markerEl.removeEventListener("markerFound", onMarkerFound);
        markerEl.removeEventListener("markerLost", onMarkerLost);
        markerEl.remove();
        videoEl.remove();
      });
    });
  };

  run();

  return () => {
    cancelled = true;
    cleanupFns.forEach((fn) => fn());
  };
}

function configureMarker(markerEl: HTMLElement, attraction: Attraction) {
  const marker = attraction.marker ?? {};
  if (marker.patternUrl) {
    markerEl.setAttribute("type", "pattern");
    const patternUrl = normalizeAssetPath(marker.patternUrl);
    if (!patternUrl) {
      console.warn(`Pattern URL missing or invalid for marker attraction ${attraction.id}`);
      return;
    }
    markerEl.setAttribute("url", patternUrl);
  } else if (marker.preset && ["hiro", "kanji"].includes(marker.preset)) {
    markerEl.setAttribute("preset", marker.preset);
  } else if (marker.barcodeValue !== undefined && marker.barcodeValue !== null) {
    markerEl.setAttribute("type", "barcode");
    markerEl.setAttribute("value", String(marker.barcodeValue));
  } else {
    markerEl.setAttribute("preset", marker.preset ?? "hiro");
  }
}


