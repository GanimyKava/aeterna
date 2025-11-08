import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAttractions } from "../hooks/useAttractions";
import { useMetrics } from "../hooks/useMetrics";
import { useArScripts } from "./ar/useArScripts";
import { useArBodyClass } from "./ar/useArBodyClass";
import { initMarkerExperience } from "./ar/initMarkerExperience";
import "./ar/ArExperience.css";

function MarkerPage(): JSX.Element {
  useArBodyClass();
  const { data: attractions, isLoading, isError } = useAttractions();
  const { recordVisit, recordAttractionView, recordVideoPlay } = useMetrics();
  const { ready, error } = useArScripts("marker");

  const sceneRef = useRef<HTMLElement>(null);
  const markerRootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ready || !attractions || !sceneRef.current) {
      return;
    }

    let dispose: (() => void) | undefined;
    const scene = sceneRef.current;

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
      {!ready && <div className="hint">Loading AR runtime...</div>}
      {error && <div className="hint">Failed to load AR scripts: {error}</div>}
      {isError && <div className="hint">Unable to load attractions from the API.</div>}
      {isLoading && !attractions && <div className="hint">Loading attractions...</div>}

      <a-scene
        ref={sceneRef as React.MutableRefObject<any>}
        embedded
        vr-mode-ui="enabled: false"
        renderer="logarithmicDepthBuffer: true; precision: medium;"
        arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled: false;"
      >
        <a-assets />
        <a-entity ref={markerRootRef as React.MutableRefObject<any>} />
        <a-entity camera />
      </a-scene>

      <video ref={videoRef} id="video" className="bottom-video" playsInline controls={false} />

      <Link to="/" className="back-btn" aria-label="Back to home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>
    </div>
  );
}

export default MarkerPage;

