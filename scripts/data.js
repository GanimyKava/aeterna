(function () {
  const DEFAULT_DATA_URL = 'data/attractions.yaml';

  // Resolve asset paths to include repository path for GitHub Pages
  function resolveAssetPath(path) {
    if (!path || typeof path !== 'string') return path;
    
    // If it's already an absolute URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Resolve relative path relative to current document
    // This ensures GitHub Pages paths include the repo name
    try {
      const url = new URL(path, window.location.href);
      return url.pathname; // Return absolute pathname (includes repo name on GitHub Pages)
    } catch (e) {
      // Fallback: return path as-is if URL construction fails
      return path;
    }
  }

  // Normalize asset paths in an attraction object for GitHub Pages
  function normalizeAttractionPaths(attraction) {
    const normalized = { ...attraction };
    
    if (normalized.videoUrl) {
      normalized.videoUrl = resolveAssetPath(normalized.videoUrl);
    }
    
    if (normalized.marker && normalized.marker.patternUrl) {
      normalized.marker = { ...normalized.marker };
      normalized.marker.patternUrl = resolveAssetPath(normalized.marker.patternUrl);
    }
    
    if (normalized.imageNFT && normalized.imageNFT.nftBaseUrl) {
      normalized.imageNFT = { ...normalized.imageNFT };
      normalized.imageNFT.nftBaseUrl = resolveAssetPath(normalized.imageNFT.nftBaseUrl);
    }
    
    if (normalized.thumbnail) {
      normalized.thumbnail = resolveAssetPath(normalized.thumbnail);
    }
    
    return normalized;
  }

  async function fetchYaml(url) {
    // Use default URL if none provided
    if (!url) {
      url = DEFAULT_DATA_URL;
    }
    
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error('Failed to fetch YAML:', url, 'Status:', res.status, res.statusText);
      throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }
    const text = await res.text();
    // Parse YAML using js-yaml library (must be loaded before this script)
    // js-yaml exposes as jsyaml or jsYAML depending on version
    const yaml = typeof jsyaml !== 'undefined' ? jsyaml : (typeof jsYAML !== 'undefined' ? jsYAML : null);
    if (yaml) {
      return yaml.load(text);
    } else {
      throw new Error('js-yaml library not loaded. Please include js-yaml.min.js');
    }
  }

  function overlayWithLocalEdits(attractions) {
    try {
      const raw = localStorage.getItem('eternity.attractions.override');
      if (!raw) return attractions;
      const edits = JSON.parse(raw);
      // Normalize paths in overrides as well
      return Array.isArray(edits) && edits.length 
        ? edits.map(normalizeAttractionPaths)
        : attractions;
    } catch (_) {
      return attractions;
    }
  }

  function haversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (d) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function sortByDistance(attractions, lat, lon) {
    return attractions
      .map(a => {
        let d = Number.POSITIVE_INFINITY;
        if (a.location && typeof a.location.latitude === 'number' && typeof a.location.longitude === 'number') {
          d = haversineMeters(lat, lon, a.location.latitude, a.location.longitude);
        }
        return Object.assign({}, a, { __distanceMeters: d });
      })
      .sort((a, b) => (a.__distanceMeters - b.__distanceMeters));
  }

  async function loadAttractions(url) {
    const base = await fetchYaml(url || DEFAULT_DATA_URL);
    const withOverrides = overlayWithLocalEdits(base);
    // Normalize all asset paths to include repository path for GitHub Pages
    return Array.isArray(withOverrides) 
      ? withOverrides.map(normalizeAttractionPaths)
      : normalizeAttractionPaths(withOverrides);
  }

  function saveAttractionsOverride(attractions) {
    localStorage.setItem('eternity.attractions.override', JSON.stringify(attractions));
  }

  function clearAttractionsOverride() {
    localStorage.removeItem('eternity.attractions.override');
  }

  window.EternityData = {
    loadAttractions,
    saveAttractionsOverride,
    clearAttractionsOverride,
    sortByDistance,
    haversineMeters,
  };
})();


