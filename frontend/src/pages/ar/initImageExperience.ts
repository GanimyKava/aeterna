import type { Attraction } from "../../types/attraction";
import { normalizeAssetPath } from "../../utils/assetPaths";
import { createVideoAsset, ensureAssets, playVideo, type Metrics } from "./videoUtils";

type ImageExperienceOptions = {
  attractions: Attraction[];
  scene: HTMLElement | null;
  nftRoot: HTMLElement | null;
  uiVideo: HTMLVideoElement | null;
  metrics: Metrics;
};

const PHONE_NUMBER = "+61491570156";
const PROFILE_ID = "gaming-low-latency";

async function requestQualityOnDemand() {
  try {
    if (window.CamaraApi?.requestQualityOnDemand) {
      const session = await window.CamaraApi.requestQualityOnDemand(PHONE_NUMBER, PROFILE_ID);
      console.info("QoD session started:", session?.sessionId ?? "mock-session");
    } else {
      console.info("CamaraApi.requestQualityOnDemand unavailable - demo mode.");
    }
  } catch (error) {
    console.error("Image AR QoD request failed", error);
  }
}

export function initImageExperience({
  attractions,
  scene,
  nftRoot,
  uiVideo,
  metrics,
}: ImageExperienceOptions): () => void {
  if (!scene || !nftRoot) {
    console.warn("Image experience missing scene or nft root.");
    return () => {};
  }

  metrics.recordVisit("ar-image");
  requestQualityOnDemand();

  const assetsEl = ensureAssets(scene);
  const cleanupFns: Array<() => void> = [];

  const relevantAttractions = attractions.filter(
    (attraction) => attraction.imageNFT?.nftBaseUrl && attraction.videoUrl,
  );

  relevantAttractions.forEach((attraction) => {
    const videoEl = createVideoAsset(assetsEl, attraction);
    const markerEl = document.createElement("a-nft");
    markerEl.setAttribute("type", "nft");
    const nftUrl = normalizeAssetPath(attraction.imageNFT!.nftBaseUrl);
    if (!nftUrl) {
      console.warn(`NFT URL missing or invalid for attraction ${attraction.id}`);
      return;
    }
    markerEl.setAttribute("url", nftUrl);
    markerEl.setAttribute("smooth", "true");
    markerEl.setAttribute("smoothCount", "10");
    markerEl.setAttribute("smoothTolerance", "0.01");
    markerEl.setAttribute("smoothThreshold", "5");
    markerEl.setAttribute("emitevents", "true");
    markerEl.setAttribute("data-attraction-id", attraction.id);

    const plane = document.createElement("a-video");
    plane.setAttribute("width", "1.6");
    plane.setAttribute("height", "0.9");
    plane.setAttribute("position", "0 0.6 0");
    plane.setAttribute("rotation", "-90 0 0");
    plane.setAttribute("src", `#${videoEl.id}`);
    markerEl.appendChild(plane);

    nftRoot.appendChild(markerEl);

    let loaded = false;

    const onMarkerFound = () => {
      metrics.recordAttractionView(attraction.id);
      if (!loaded) {
        const videoSrc = normalizeAssetPath(attraction.videoUrl);
        if (!videoSrc) {
          console.warn(`Video URL missing or invalid for attraction ${attraction.id}`);
          return;
        }
        videoEl.src = videoSrc;
        if (uiVideo) {
          uiVideo.src = videoSrc;
          uiVideo.loop = true;
          uiVideo.classList.add("visible");
        }
        loaded = true;
      }
      playVideo(videoEl, uiVideo, attraction.id, metrics);
    };

    const onMarkerLost = () => {
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
      markerEl.removeEventListener("markerFound", onMarkerFound);
      markerEl.removeEventListener("markerLost", onMarkerLost);
      markerEl.remove();
      videoEl.remove();
    });
  });

  return () => {
    cleanupFns.forEach((fn) => fn());
  };
}

