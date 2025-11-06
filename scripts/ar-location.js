// Location-based AR page initialization
window.EternityMetrics.recordVisit('ar-location');

const gpsRoot = document.getElementById('gpsRoot');
const uiVideo = document.getElementById('video');

// Store loaded videos per attraction to prevent multiple loads
const loadedVideos = new Map();

function createGpsEntity(a) {
  if (!a.location || !a.videoUrl) return null;

  const wrapper = document.createElement('a-entity');
  wrapper.setAttribute('gps-entity-place', `latitude: ${a.location.latitude}; longitude: ${a.location.longitude};`);

  const plane = document.createElement('a-plane');
  plane.setAttribute('width', '1.6');
  plane.setAttribute('height', '0.9');
  plane.setAttribute('color', '#222');
  plane.setAttribute('position', '0 1.5 0');

  wrapper.appendChild(plane);

  function tryLoadVideo(userLat, userLon) {
    const d = window.EternityData.haversineMeters(userLat, userLon, a.location.latitude, a.location.longitude);
    const isLoaded = loadedVideos.get(a.id);
    
    if (!isLoaded && d <= (a.location.radiusMeters || 80)) {
      uiVideo.src = a.videoUrl;
      uiVideo.play().catch(()=>{});
      loadedVideos.set(a.id, true);
      window.EternityMetrics.recordAttractionView(a.id);
    }
  }

  // Store the tryLoadVideo function for this attraction
  wrapper.__tryLoadVideo = tryLoadVideo;
  wrapper.__attractionId = a.id;

  return wrapper;
}

// Single GPS position update listener that checks all attractions
window.addEventListener('gps-camera-update-position', (e) => {
  const detail = e.detail;
  const lat = detail && detail.position && detail.position.latitude;
  const lon = detail && detail.position && detail.position.longitude;
  
  if (typeof lat === 'number' && typeof lon === 'number') {
    localStorage.setItem('eternity.lastPosition', JSON.stringify({ latitude: lat, longitude: lon }));
    
    // Check all GPS entities for proximity
    const gpsEntities = gpsRoot.querySelectorAll('[gps-entity-place]');
    gpsEntities.forEach(entity => {
      if (entity.__tryLoadVideo) {
        entity.__tryLoadVideo(lat, lon);
      }
    });
  }
});

(async function init() {
  // Wait for A-Frame scene to be ready
  const scene = document.querySelector('a-scene');
  if (!scene) {
    console.error('A-Frame scene not found');
    return;
  }
  
  
  try {
    const attractions = await window.EternityData.loadAttractions();
    const list = attractions.filter(a => 
      a.type === 'location' && 
      a.location && 
      a.location.latitude && 
      a.location.longitude &&
      a.videoUrl
    );
    
    // Create GPS entities for all location attractions dynamically
    list.forEach(attraction => {
      const entity = createGpsEntity(attraction);
      if (entity) {
        gpsRoot.appendChild(entity);
      }
    });
  } catch (e) {
    console.error('Error loading location attractions:', e);
  }
})();


