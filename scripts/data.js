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
    
    // Special case: if we have only 1 part (repo name), we're at the repo root
    // Since all HTML files are now in root, any HTML file should use './'
    if (parts.length === 1) {
      // We're at repo root (e.g., /aeterna/ar-image.html -> parts = ['aeterna'] after removing filename)
      // All HTML files are in root, so always return './'
      return './';
    }
    
    // We have 2+ directory parts, so we're in a subdirectory
    // Go up (parts.length - 1) levels to reach repo root
    // Example: /aeterna/subdir/file.html -> parts = ['aeterna', 'subdir'] -> go up 1 -> '../'
    const depth = parts.length - 1;
    return '../'.repeat(depth);
  };
  
  // Get default data URL dynamically (not at module load time)
  const getDefaultDataUrl = () => {
    const basePath = getBasePath();
    // Construct relative path
    const relativePath = basePath === './' ? 'data/attractions.yaml' : basePath + 'data/attractions.yaml';
    
    // Use URL constructor to ensure path is resolved correctly relative to current document
    try {
      // Resolve relative to current document location
      const url = new URL(relativePath, window.location.href);
      return url.pathname; // Return just the pathname part
    } catch (e) {
      // Fallback to relative path if URL construction fails
      console.warn('Failed to construct absolute URL, using relative path:', relativePath);
      return relativePath;
    }
  };

  async function fetchYaml(url) {
    // If no URL provided, get the default dynamically
    if (!url) {
      url = getDefaultDataUrl();
    }
    
    // Log for debugging (can be removed in production)
    console.log('Fetching YAML from:', url, 'from pathname:', window.location.pathname);
    
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

  // Convert asset paths to be relative to the HTML document (for GitHub Pages compatibility)
  // A-Frame resolves assets relative to the document, so we need paths relative to the document location
  function normalizeAssetPath(path) {
    if (!path || typeof path !== 'string') return path;
    
    // If it's already an absolute URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // If path starts with /, it's absolute from domain root - convert to relative
    if (path.startsWith('/')) {
      // Remove leading slash and get base path to repo root
      path = path.substring(1);
      const basePath = getBasePath();
      return basePath + path;
    }
    
    // Path is already relative - ensure it's relative to document
    // If it doesn't start with ../ or ./, prepend base path
    if (!path.startsWith('../') && !path.startsWith('./')) {
      const basePath = getBasePath();
      return basePath + path;
    }
    
    // Path already starts with ../ or ./, return as-is
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
    const base = await fetchYaml(url || getDefaultDataUrl());
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


