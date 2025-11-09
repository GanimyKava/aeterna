import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type CameraPermissionStatus = "unknown" | "prompt" | "granted" | "denied" | "unsupported";

type UseCameraPermissionOptions = {
  autoRequest?: boolean;
};

const STORAGE_KEY = "aeterna.cameraPermission";

function getInitialStatus(): CameraPermissionStatus {
  if (typeof window === "undefined") {
    return "unknown";
  }
  const stored = window.sessionStorage.getItem(STORAGE_KEY);
  if (stored === "granted") {
    return "granted";
  }
  return "unknown";
}

export function useCameraPermission({ autoRequest = false }: UseCameraPermissionOptions = {}): {
  status: CameraPermissionStatus;
  error: string | null;
  requestPermission: () => Promise<void>;
} {
  const [status, setStatus] = useState<CameraPermissionStatus>(() => getInitialStatus());
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(false);

  const supportsCamera = useMemo(
    () => typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
    [],
  );

  const requestPermission = useCallback(async () => {
    if (!supportsCamera) {
      setStatus("unsupported");
      setError("Camera access is not available on this device or browser.");
      return;
    }

    try {
      requestedRef.current = true;
      setStatus("prompt");
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      stream.getTracks().forEach((track) => track.stop());

      sessionStorage.setItem(STORAGE_KEY, "granted");
      setStatus("granted");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Camera permission was blocked. Check your browser settings and retry.";
      setError(message);
      setStatus("denied");
    }
  }, [supportsCamera]);

  useEffect(() => {
    if (!supportsCamera) {
      setStatus("unsupported");
      return;
    }

    if (status === "unknown" && autoRequest && !requestedRef.current) {
      requestPermission().catch(() => {
        // handled in requestPermission
      });
    }
  }, [autoRequest, requestPermission, status, supportsCamera]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored === "granted" && status !== "granted") {
          setStatus("granted");
          setError(null);
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status]);

  return { status, error, requestPermission };
}


