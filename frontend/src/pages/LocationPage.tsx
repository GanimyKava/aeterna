import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAttractions } from "../hooks/useAttractions";
import { useMetrics } from "../hooks/useMetrics";
import { useArScripts } from "./ar/useArScripts";
import { initLocationExperience } from "./ar/initLocationExperience";
import "./ar/ArExperience.css";

function LocationPage(): JSX.Element {
  const { data: attractions, isLoading, isError } = useAttractions();
  const { recordVisit, recordAttractionView, recordVideoPlay } = useMetrics();
  const { ready, error } = useArScripts("location");

  const sceneRef = useRef<HTMLElement | null>(null);
  const gpsRootRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const locationRequestedRef = useRef(false);
  const watchIdRef = useRef<number | null>(null);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const requestLocationAccess = useCallback(() => {
    if (!("geolocation" in navigator) || !navigator.geolocation.watchPosition) {
      setHasLocationPermission(false);
      setGeoError("This device does not support geolocation.");
      return;
    }

    setGeoError(null);
    clearWatch();
    try {
      const watchId = navigator.geolocation.watchPosition(
        () => {
          setHasLocationPermission(true);
          setGeoError(null);
          clearWatch();
        },
        (err) => {
          setHasLocationPermission(false);
          setGeoError(err?.message || "Unable to access location. Check your browser settings and try again.");
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
      );
      watchIdRef.current = watchId;
    } catch (err) {
      setHasLocationPermission(false);
      setGeoError(err instanceof Error ? err.message : "Unable to access location. Check your browser settings and try again.");
    }
  }, [clearWatch]);

  useEffect(() => {
    if (!locationRequestedRef.current) {
      locationRequestedRef.current = true;
      requestLocationAccess();
    }
  }, [requestLocationAccess]);

  useEffect(() => clearWatch, [clearWatch]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!ready || !attractions || !scene) {
      return;
    }

    const dispose = initLocationExperience({
      attractions,
      scene,
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
        arjs="sourceType: webcam; debugUIEnabled: false; cameraParametersUrl: /scripts/arjs/3.4.7/camera_para.dat;"
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
        <a-entity id="gps-root" ref={gpsRootRef as React.MutableRefObject<any>} />
        <a-camera camera gps-camera="simulateLatitude: -33.8568; simulateLongitude: 151.2153;" rotation-reader />
      </a-scene>

      <Link to="/" className="back-btn" aria-label="Back to home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>
    </div>
  );
}

export default LocationPage;

