const LOADED_KEY = "__aeternaLoadedScripts__";
const PROMISE_KEY = "__aeternaScriptPromises__";

declare global {
  interface Window {
    [LOADED_KEY]?: Record<string, true>;
    [PROMISE_KEY]?: Record<string, Promise<void>>;
  }
}

export function loadScript(src: string): Promise<void> {
  window[LOADED_KEY] ||= {};
  window[PROMISE_KEY] ||= {};

  if (window[LOADED_KEY]?.[src]) {
    return Promise.resolve();
  }

  if (window[PROMISE_KEY]?.[src]) {
    return window[PROMISE_KEY]![src];
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        window[LOADED_KEY]![src] = true;
        resolve();
      } else {
        existing.addEventListener("load", () => {
          existing.dataset.loaded = "true";
          window[LOADED_KEY]![src] = true;
          resolve();
        }, { once: true });
        existing.addEventListener("error", () => {
          delete window[PROMISE_KEY]![src];
          reject(new Error(`Failed to load script ${src}`));
        }, { once: true });
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
    }, { once: true });
    script.addEventListener("error", () => {
      delete window[PROMISE_KEY]![src];
      reject(new Error(`Failed to load script ${src}`));
    }, { once: true });
    document.head.appendChild(script);
  }).finally(() => {
    if (window[LOADED_KEY]?.[src]) {
      window[PROMISE_KEY]![src] = Promise.resolve();
    }
  });

  window[PROMISE_KEY]![src] = promise;
  return promise;
}


