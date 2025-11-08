const LOADED_KEY = "__aeternaLoadedScripts__";

declare global {
  interface Window {
    [LOADED_KEY]?: Record<string, true>;
  }
}

export function loadScript(src: string): Promise<void> {
  if (!window[LOADED_KEY]) {
    window[LOADED_KEY] = {};
  }

  if (window[LOADED_KEY]?.[src]) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        window[LOADED_KEY]![src] = true;
        resolve();
      } else {
        existing.addEventListener("load", () => {
          window[LOADED_KEY]![src] = true;
          resolve();
        });
        existing.addEventListener("error", () => reject(new Error(`Failed to load script ${src}`)));
      }
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      window[LOADED_KEY]![src] = true;
      resolve();
    });
    script.addEventListener("error", () => {
      reject(new Error(`Failed to load script ${src}`));
    });
    document.head.appendChild(script);
  });
}

