import { useEffect, useState } from "react";
import { loadScript } from "../../utils/loadScript";

const BASE_URL = document.querySelector("base")?.getAttribute("href") ?? "/";

const scriptMap = {
  aframe: `${BASE_URL}scripts/aframe/1.6.0/aframe.min.js`,
  marker: `${BASE_URL}scripts/arjs/3.4.7/aframe-ar.js`,
  imageNft: `${BASE_URL}scripts/arjs/3.4.7/aframe-ar-nft.js`,
  location: `${BASE_URL}scripts/arjs/3.4.7/ar-threex-location-only.js`,
} as const;

export type ArScriptProfile = "marker" | "image" | "location" | "marker+location";

const profileScripts: Record<ArScriptProfile, string[]> = {
  marker: [scriptMap.aframe, scriptMap.marker],
  image: [scriptMap.aframe, scriptMap.imageNft],
  location: [scriptMap.aframe, scriptMap.marker, scriptMap.location],
  "marker+location": [scriptMap.aframe, scriptMap.marker, scriptMap.location],
};

export function useArScripts(profile: ArScriptProfile = "marker"): { ready: boolean; error: string | null } {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        for (const src of profileScripts[profile]) {
          await loadScript(src);
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

