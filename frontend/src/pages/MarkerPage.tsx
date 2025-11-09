import { useEffect, useMemo, useRef } from "react";
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

  const hintContent = useMemo(() => {
    if (!ready) {
      return "Loading AR runtime...";
    }
    if (error) {
      return `Failed to load AR scripts: ${error}`;
    }
    if (isError) {
      return "Unable to load attractions from the API.";
    }
    if (isLoading && !attractions) {
      return "Loading attractions...";
    }
    return "Allow camera access when prompted, then point your device at an AR marker.";
  }, [error, isError, isLoading, attractions, ready]);

  return (
    <div className="ar-experience ar-marker-page">
      {hintContent && <div className="hint">{hintContent}</div>}

      <header className="ar-header">
        <h1>Echoes of Eternity AR</h1>
      </header>

      <video id="video" autoplay muted loop playsinline class="bottom-video"></video>

      <a-scene 
        vr-mode-ui="enabled: false" 
        embedded 
        renderer="logarithmicDepthBuffer: true; precision: mediump"
        arjs="sourceType: webcam; debugUIEnabled: false;">

        <a-assets>
          <video id="video-asset" src="" preload="none" crossorigin="anonymous"></video>
        </a-assets>

        <a-entity id="markerRoot"></a-entity>

        <a-entity camera></a-entity>
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

