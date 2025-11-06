(function () {
  const KEY = 'eternity.metrics.v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (_) { return {}; }
  }
  function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

  function inc(path) {
    const data = load();
    const parts = path.split('.');
    let node = data;
    for (let i = 0; i < parts.length - 1; i++) {
      node[parts[i]] = node[parts[i]] || {};
      node = node[parts[i]];
    }
    const leaf = parts[parts.length - 1];
    node[leaf] = (node[leaf] || 0) + 1;
    save(data);
  }

  function recordVisit(page) { inc(`visits.${page}`); }
  function recordAttractionView(id) { inc(`attractionViews.${id}`); }
  function recordVideoPlay(id) { inc(`videoPlays.${id}`); }

  window.EternityMetrics = {
    load, recordVisit, recordAttractionView, recordVideoPlay,
  };
})();


