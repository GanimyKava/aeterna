// Location-based AR page initialization
window.EternityMetrics.recordVisit('ar-location');

(function requestQodForLocationPage() {
  const phoneNumber = "+61491570156";
  const profileId = "premium-video";

  if (!window.CamaraApi || typeof CamaraApi.requestQualityOnDemand !== "function") {
    console.warn("CamaraApi.requestQualityOnDemand is unavailable on ar-location page");
    return;
  }

  CamaraApi.requestQualityOnDemand(phoneNumber, profileId)
    .then((session) => {
      alert("QoD requested for location-based AR: " + (session && session.sessionId ? session.sessionId : "mock-session"));
    })
    .catch((error) => {
      console.error("Failed to request QoD for location-based AR", error);
    });
})();

(function retrieveLocationOnLoad() {
  const phoneNumber = "+61491570156";

  if (!window.CamaraApi || typeof CamaraApi.retrieveLocation !== "function") {
    console.warn("CamaraApi.retrieveLocation is unavailable on ar-location page");
    return;
  }

  CamaraApi.retrieveLocation(phoneNumber)
    .then((response) => {
      const coords = response && response.location && response.location.coordinates;
      const label = coords ? `${coords.lat}, ${coords.lon}` : "unknown";
      alert(`Retrieved device location: ${label}`);
    })
    .catch((error) => {
      console.error("Failed to retrieve location", error);
    });
})();

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
    const radius = a.location.radiusMeters || 80;
    const isLoaded = loadedVideos.get(a.id);

    const ensureVideoPlaying = () => {
      if (!uiVideo) return;
      uiVideo.classList.add('visible');
      uiVideo.loop = true;
      uiVideo.autoplay = true;
      uiVideo.muted = false;
      uiVideo.play().catch(err => {
        if (err && err.name === 'NotAllowedError') {
          uiVideo.muted = true;
          uiVideo.play().then(() => {
            setTimeout(() => {
              uiVideo.muted = false;
            }, 150);
          }).catch(() => {});
        }
      });
    };

    if (d <= radius) {
      if (!isLoaded) {
        if (uiVideo) {
          uiVideo.src = a.videoUrl;
          uiVideo.currentTime = 0;
          uiVideo.load();
          uiVideo.addEventListener('loadeddata', ensureVideoPlaying, { once: true });
          uiVideo.addEventListener('canplay', ensureVideoPlaying, { once: true });
          ensureVideoPlaying();
        }
        loadedVideos.set(a.id, true);
        window.EternityMetrics.recordAttractionView(a.id);
      } else {
        ensureVideoPlaying();
      }
    } else if (isLoaded) {
      if (uiVideo) {
        uiVideo.pause();
        uiVideo.currentTime = 0;
        uiVideo.classList.remove('visible');
        uiVideo.src = '';
      }
      loadedVideos.delete(a.id);
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

    const selected = list.find(a => a.id === 'sydney-opera-house');
    const finalList = selected ? [selected] : list;
    
    // Create GPS entities for selected location attractions
    finalList.forEach(attraction => {
      const entity = createGpsEntity(attraction);
      if (entity) {
        gpsRoot.appendChild(entity);
        if (typeof entity.__tryLoadVideo === 'function') {
          entity.__tryLoadVideo(attraction.location.latitude, attraction.location.longitude);
        }
      }
    });

    if (finalList.length > 0) {
      const reference = finalList[0];
      window.dispatchEvent(new CustomEvent('gps-camera-update-position', {
        detail: {
          position: {
            latitude: reference.location.latitude,
            longitude: reference.location.longitude
          }
        }
      }));
    }
  } catch (e) {
    console.error('Error loading location attractions:', e);
  }
})();

// Stop all videos when back button is clicked
(function() {
  const backButton = document.querySelector('a.back-btn[href*="index.html"]');
  if (backButton) {
    backButton.addEventListener('click', function(e) {
      // Stop UI video
      if (uiVideo) {
        uiVideo.pause();
        uiVideo.currentTime = 0;
        uiVideo.src = '';
        uiVideo.classList.remove('visible');
      }
      
      // Stop all A-Frame video elements
      const scene = document.querySelector('a-scene');
      if (scene) {
        const aFrameVideos = scene.querySelectorAll('video');
        aFrameVideos.forEach(video => {
          video.pause();
          video.currentTime = 0;
          if (video.hasAttribute('src')) {
            video.setAttribute('src', '');
          }
        });
      }
      
      // Clear loaded videos map
      if (typeof loadedVideos !== 'undefined' && loadedVideos instanceof Map) {
        loadedVideos.clear();
      }
      
      // Allow navigation to proceed
      // Navigation will happen via href
    });
  }
})();


