import { useEffect, useState } from "react";
import { loadScript } from "../../utils/loadScript";

const BASE_URL = document.querySelector("base")?.getAttribute("href") ?? "/";

const scriptMap = {
  aframe: `${BASE_URL}scripts/aframe/1.6.0/aframe.min.js`,
  arMarker: `${BASE_URL}scripts/arjs/3.4.7/aframe-ar.js`,
  arLocation: `${BASE_URL}scripts/arjs/3.4.7/ar-threex-location-only.js`,
} as const;

export type ArScriptProfile = "marker" | "location";

const profileScripts: Record<ArScriptProfile, string[]> = {
  marker: [scriptMap.aframe, scriptMap.arMarker],
  location: [scriptMap.aframe, scriptMap.arMarker, scriptMap.arLocation],
};

let registerPatchApplied = false;

function patchAframeRegisterComponent(): void {
  if (registerPatchApplied) {
    return;
  }
  if (typeof window === "undefined") {
    return;
  }
  const AFRAME = (window as typeof window & { AFRAME?: any }).AFRAME;
  if (!AFRAME?.registerComponent) {
    // A-Frame might not be fully initialised yet; try again on the next tick.
    window.setTimeout(patchAframeRegisterComponent, 0);
    return;
  }

  const original = AFRAME.registerComponent.bind(AFRAME);
  const originalSystem = typeof AFRAME.registerSystem === "function" ? AFRAME.registerSystem.bind(AFRAME) : null;
  const originalPrimitive =
    typeof AFRAME.registerPrimitive === "function" ? AFRAME.registerPrimitive.bind(AFRAME) : null;

  if ((AFRAME.registerComponent as any).__patched) {
    registerPatchApplied = true;
    return;
  }

  function patchedRegister(name: string, definition: unknown) {
    if (AFRAME.components?.[name]) {
      // Skip duplicate registrations to avoid AR.js bundle assertions in SPA navigation.
      console.debug(`[useArScripts] Skipping duplicate component registration for ${name}`);
      return AFRAME.components[name];
    }
    return original(name, definition);
  }

  (patchedRegister as any).__patched = true;
  AFRAME.registerComponent = patchedRegister;

  if (originalSystem && !(AFRAME.registerSystem as any).__patched) {
    AFRAME.registerSystem = function patchedRegisterSystem(name: string, definition: unknown) {
      if (AFRAME.systems?.[name]) {
        console.debug(`[useArScripts] Skipping duplicate system registration for ${name}`);
        return AFRAME.systems[name];
      }
      return originalSystem(name, definition);
    };
    (AFRAME.registerSystem as any).__patched = true;
  }

  if (originalPrimitive && !(AFRAME.registerPrimitive as any).__patched) {
    AFRAME.registerPrimitive = function patchedRegisterPrimitive(name: string, definition: unknown) {
      if (AFRAME.primitives?.primitives?.[name]) {
        console.debug(`[useArScripts] Skipping duplicate primitive registration for ${name}`);
        return AFRAME.primitives.primitives[name];
      }
      return originalPrimitive(name, definition);
    };
    (AFRAME.registerPrimitive as any).__patched = true;
  }

  registerPatchApplied = true;
}

export function useArScripts(profile: ArScriptProfile = "marker"): { ready: boolean; error: string | null } {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        for (const src of profileScripts[profile]) {
          await loadScript(src);
          if (src === scriptMap.aframe) {
            patchAframeRegisterComponent();
          } else {
            // In case A-Frame finished initialising slightly later.
            patchAframeRegisterComponent();
          }
        }
        if (!cancelled) {
          setReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load AR scripts");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  return { ready, error };
}

