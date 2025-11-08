import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAttractions } from "../hooks/useAttractions";
import { useMetrics } from "../hooks/useMetrics";
import { useArScripts } from "./ar/useArScripts";
import { useArBodyClass } from "./ar/useArBodyClass";
import { initLocationExperience } from "./ar/initLocationExperience";
import "./ar/ArExperience.css";

function LocationPage(): JSX.Element {
  useArBodyClass();
  const { data: attractions, isLoading, isError } = useAttractions();
  const { recordVisit, recordAttractionView, recordVideoPlay } = useMetrics();
  const { ready, error } = useArScripts("marker+location");

  const gpsRootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setHasLocationPermission(true),
        () => setHasLocationPermission(false),
        { enableHighAccuracy: true },
      );
    }
  }, []);

  useEffect(() => {
    if (!ready || !attractions) {
      return;
    }

    const dispose = initLocationExperience({
      attractions,
      gpsRoot: gpsRootRef.current,
      uiVideo: videoRef.current,
      metrics: {
        recordVisit,
        recordAttractionView,
        recordVideoPlay,
      },
    });

    return () => {
      dispose?.();
    };
  }, [ready, attractions, recordVisit, recordAttractionView, recordVideoPlay]);

  return (
    <div className="ar-experience ar-location-page">
      {(!hasLocationPermission || !ready) && (
        <div className="camera-placeholder">
          <div className="camera-placeholder__frame">
            <img src="/images/TheSydneyOperaHouse_Australia.jpg" alt="Sydney Opera House" />
          </div>
          <p className="camera-placeholder__message">
            Enable location services and point your device towards the horizon. When you enter a configured geofence,
            Echoes of Eternity will reveal immersive overlays automatically.
          </p>
        </div>
      )}

      {error && <div className="hint">Failed to load AR scripts: {error}</div>}
      {isError && <div className="hint">Unable to load attractions from the API.</div>}
      {isLoading && !attractions && <div className="hint">Loading attractions...</div>}

      <a-scene
        embedded
        vr-mode-ui="enabled: false"
        renderer="logarithmicDepthBuffer: true; precision: medium;"
        arjs="sourceType: webcam; debugUIEnabled: false;"
      >
        <a-entity ref={gpsRootRef as React.MutableRefObject<any>} />
        <a-entity camera gps-camera rotation-reader />
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

export default LocationPage;

