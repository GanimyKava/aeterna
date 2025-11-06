(function () {
  // Detect base path for GitHub Pages compatibility
  // Returns the relative path from current page to repo root (where index.html is)
  const getBasePath = () => {
    const pathname = window.location.pathname;
    
    // Handle root path
    if (pathname === '/' || pathname === '') {
      return './';
    }
    
    // Count directory levels: split by '/' and count non-empty parts (excluding filename)
    const parts = pathname.split('/').filter(p => p);
    
    // Remove the HTML filename if present (last part ending in .html)
    if (parts.length > 0 && parts[parts.length - 1].endsWith('.html')) {
      parts.pop();
    }
    
    // If we're at root (no directory parts), return './'
    if (parts.length === 0) {
      return './';
    }
    
    // Special case: if pathname is exactly '/repo-name' or '/repo-name/index.html',
    // we're at the repo root
    if (parts.length === 1) {
      // Check if this looks like the repo root page
      if (pathname === `/${parts[0]}` || 
          pathname === `/${parts[0]}/` ||
          pathname === `/${parts[0]}/index.html` ||
          (pathname.includes('index.html') && pathname.split('/').filter(p => p).length === 2)) {
        return './';
      }
      // Otherwise, we're in a subdirectory like /view/file.html
      return '../';
    }
    
    // We have 2+ directory parts, so we're in a subdirectory
    // Go up (parts.length - 1) levels to reach repo root
    // Example: /aeterna/view/file.html -> parts = ['aeterna', 'view'] -> go up 1 -> '../'
    const depth = parts.length - 1;
    return '../'.repeat(depth);
  };
  const DEFAULT_DATA_URL = getBasePath() + 'data/attractions.yaml';

  async function fetchYaml(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch ' + url);
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

  // Convert asset paths to be relative to current page (for GitHub Pages compatibility)
  function normalizeAssetPath(path) {
    if (!path || typeof path !== 'string') return path;
    // If path starts with /, it's absolute - remove it
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    // If path doesn't start with http:// or https://, make it relative to repo root
    if (!path.startsWith('http://') && !path.startsWith('https://')) {
      const basePath = getBasePath();
      // Only prepend base path if it's not already relative (doesn't start with ../ or ./)
      if (!path.startsWith('../') && !path.startsWith('./')) {
        return basePath + path;
      }
    }
    return path;
  }

  // Normalize all asset paths in an attraction object
  function normalizeAttractionPaths(attraction) {
    const normalized = { ...attraction };
    if (normalized.videoUrl) {
      normalized.videoUrl = normalizeAssetPath(normalized.videoUrl);
    }
    if (normalized.marker && normalized.marker.patternUrl) {
      normalized.marker = { ...normalized.marker };
      normalized.marker.patternUrl = normalizeAssetPath(normalized.marker.patternUrl);
    }
    if (normalized.imageNFT && normalized.imageNFT.nftBaseUrl) {
      normalized.imageNFT = { ...normalized.imageNFT };
      normalized.imageNFT.nftBaseUrl = normalizeAssetPath(normalized.imageNFT.nftBaseUrl);
    }
    if (normalized.thumbnail) {
      normalized.thumbnail = normalizeAssetPath(normalized.thumbnail);
    }
    return normalized;
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
    // Normalize all asset paths to be relative to current page
    return Array.isArray(withOverrides) 
      ? withOverrides.map(normalizeAttractionPaths)
      : withOverrides;
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


