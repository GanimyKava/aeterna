function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function waitForArSystem(scene: HTMLElement, maxAttempts = 40, intervalMs = 75): Promise<void> {
  if (!scene) {
    return;
  }

  let attempts = 0;
  while (attempts < maxAttempts) {
    const systems = (scene as unknown as { systems?: Record<string, unknown> }).systems ?? {};
    if (systems.arjs || systems["ar-system"] || systems["arjs-system"]) {
      return;
    }
    attempts += 1;
    await delay(intervalMs);
  }

  console.warn("AR.js system not detected after waiting for scene initialisation.");
}


