const APPLY_DELAYS = [0, 80, 200, 500];

function calculateViewport(): { width: number; height: number } {
  const vw = Math.max(window.innerWidth, document.documentElement.clientWidth || 0, screen.width || 0);
  let vh = Math.max(window.innerHeight, document.documentElement.clientHeight || 0);

  if (window.visualViewport?.height) {
    vh = Math.max(vh, window.visualViewport.height);
  }

  if (!vh || vh < 100) {
    vh = screen.height || vh || 0;
  }

  return { width: vw, height: vh };
}

function applyFullscreen(scene: HTMLElement, overlayVideo?: HTMLVideoElement | null) {
  if (!scene.isConnected) {
    return;
  }

  const { width, height } = calculateViewport();

  document.documentElement.style.background = "transparent";
  document.documentElement.style.backgroundColor = "transparent";
  document.body.style.background = "transparent";
  document.body.style.backgroundColor = "transparent";

  const setRect = (el: HTMLElement | null, zIndex?: string) => {
    if (!el) return;
    el.style.position = "fixed";
    el.style.top = "0";
    el.style.left = "0";
    el.style.right = "0";
    el.style.bottom = "0";
    el.style.margin = "0";
    el.style.padding = "0";
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.maxWidth = `${width}px`;
    el.style.minWidth = `${width}px`;
    el.style.background = "transparent";
    el.style.backgroundColor = "transparent";
    el.style.transform = "none";
    el.style.transformOrigin = "center center";
    if (zIndex) {
      el.style.zIndex = zIndex;
    }
  };

  setRect(scene, "1");

  const canvas = (scene as any).canvas ?? scene.querySelector("canvas");
  if (canvas instanceof HTMLElement) {
    setRect(canvas, "1");
    (canvas as HTMLCanvasElement).width = width;
    (canvas as HTMLCanvasElement).height = height;
  }

  const arVideo = scene.querySelector("video");
  if (arVideo instanceof HTMLVideoElement && (!overlayVideo || arVideo !== overlayVideo)) {
    setRect(arVideo, "0");
    arVideo.style.objectFit = "cover";
  }

  const container = scene.querySelector(".a-canvas");
  if (container instanceof HTMLElement) {
    setRect(container, "1");
  }
}

export function setupArViewport(scene: HTMLElement, overlayVideo?: HTMLVideoElement | null): () => void {
  let disposed = false;

  const html = document.documentElement;
  const body = document.body;
  const previousHtmlBackground = html.style.background;
  const previousHtmlBackgroundColor = html.style.backgroundColor;
  const previousBodyBackground = body.style.background;
  const previousBodyBackgroundColor = body.style.backgroundColor;

  const scheduleApply = () => {
    APPLY_DELAYS.forEach((delay) => {
      window.setTimeout(() => {
        if (!disposed) {
          applyFullscreen(scene, overlayVideo);
        }
      }, delay);
    });
  };

  const onResize = () => {
    if (!disposed) {
      applyFullscreen(scene, overlayVideo);
    }
  };

  const onOrientationChange = () => {
    window.setTimeout(() => {
      if (!disposed) {
        applyFullscreen(scene, overlayVideo);
      }
    }, 150);
  };

  const onRenderStart = () => {
    scheduleApply();
  };

  const onViewportResize = () => {
    if (!disposed) {
      applyFullscreen(scene, overlayVideo);
    }
  };

  applyFullscreen(scene, overlayVideo);
  scheduleApply();

  scene.addEventListener("renderstart", onRenderStart, { once: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onOrientationChange);
  window.visualViewport?.addEventListener("resize", onViewportResize);

  return () => {
    disposed = true;
    scene.removeEventListener("renderstart", onRenderStart);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onOrientationChange);
    window.visualViewport?.removeEventListener("resize", onViewportResize);
    html.style.background = previousHtmlBackground;
    html.style.backgroundColor = previousHtmlBackgroundColor;
    body.style.background = previousBodyBackground;
    body.style.backgroundColor = previousBodyBackgroundColor;
    // Restore styles on HTML/body.
    html.classList.remove("ar-mode");
    body.classList.remove("ar-mode");
  };
}


