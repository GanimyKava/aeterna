export function normalizeAssetPath(path?: string | null): string | undefined {
  if (!path) {
    return undefined;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  let normalized = path.trim();
  if (normalized.startsWith("./")) {
    normalized = normalized.slice(2);
  }
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  return normalized.replace(/\/\/+/g, "/");
}

