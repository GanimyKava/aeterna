(function () {
  const DEFAULT_DATA_URL = '/data/attractions.yaml';

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

  function overlayWithLocalEdits(attractions) {
    try {
      const raw = localStorage.getItem('eternity.attractions.override');
      if (!raw) return attractions;
      const edits = JSON.parse(raw);
      return Array.isArray(edits) && edits.length ? edits : attractions;
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
    return overlayWithLocalEdits(base);
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


