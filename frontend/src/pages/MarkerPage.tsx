import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAttractions } from "../hooks/useAttractions";
import { useMetrics } from "../hooks/useMetrics";
import { useArScripts } from "./ar/useArScripts";
import { initMarkerExperience } from "./ar/initMarkerExperience";
import "./ar/ArExperience.css";

function MarkerPage(): JSX.Element {
  const { data: attractions, isLoading, isError } = useAttractions();
  const { recordVisit, recordAttractionView, recordVideoPlay } = useMetrics();
  const { ready, error } = useArScripts("marker");

  const sceneRef = useRef<HTMLElement | null>(null);
  const markerRootRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!ready || !attractions || !scene) {
      return;
    }

    let dispose: (() => void) | undefined;

    const start = () => {
      dispose = initMarkerExperience({
        attractions,
        scene,
        markerRoot: markerRootRef.current,
        uiVideo: videoRef.current,
        metrics: {
          recordVisit,
          recordAttractionView,
          recordVideoPlay,
        },
      });
    };

    if ((scene as any).hasLoaded) {
      start();
    } else {
      scene.addEventListener("loaded", start, { once: true });
    }

    return () => {
      dispose?.();
    };
  }, [ready, attractions, recordVisit, recordAttractionView, recordVideoPlay]);

  return (
    <div className="ar-experience ar-marker-page">
      <header className="ar-header">
        <h1>Echoes of Eternity AR</h1>
      </header>

      <video
        ref={videoRef}
        id="video"
        className="bottom-video"
        autoPlay
        muted
        loop
        playsInline
        controls={false}
      />

      <a-scene
        ref={sceneRef as React.MutableRefObject<any>}
        embedded
        vr-mode-ui="enabled: false"
        renderer="logarithmicDepthBuffer: true; precision: medium;"
        arjs="sourceType: webcam; debugUIEnabled: false;"
      >
        <a-assets>
          <video
            id="video-asset"
            src=""
            preload="none"
            crossOrigin="anonymous"
            autoPlay
            playsInline
            loop
          />
        </a-assets>
        <a-entity ref={markerRootRef as React.MutableRefObject<any>} />
        <a-camera camera />
      </a-scene>

      <Link to="/" className="back-btn" aria-label="Back to home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>
    </div>
  );
}

export default MarkerPage;

