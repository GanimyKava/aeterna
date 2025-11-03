// Echoes of Eternity AR - Main Application Logic

// Sample historical attractions data
const attractions = [
    // Australian Tourist Attractions & Museums
    {
        id: 1,
        name: "Uluru (Ayers Rock)",
        description: "Explore the sacred red monolith sacred to the Anangu people. This massive sandstone formation rises 348 meters above the surrounding desert and holds deep spiritual significance.",
        icon: "🪨",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        marker: "marker1",
        year: "Formed 550 million years ago",
        location: { lat: -25.3444, lng: 131.0369 }
    },
    {
        id: 2,
        name: "Great Barrier Reef",
        description: "Dive into the world's largest coral reef system, home to thousands of species of marine life. This UNESCO World Heritage site spans over 2,300 kilometers along the Queensland coast.",
        icon: "🐠",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        marker: "marker2",
        year: "Millions of years old",
        location: { lat: -16.2864, lng: 145.7003 }
    },
    /*{
        id: 3,
        name: "Sydney Opera House",
        description: "Experience the architectural marvel designed by Jørn Utzon. This UNESCO World Heritage site is one of the world's most distinctive and famous buildings, hosting over 1,500 performances annually.",
        icon: "🎭",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        marker: "marker1",
        year: "1973",
        location: { lat: -33.8568, lng: 151.2153 }
    },
    {
        id: 4,
        name: "Sydney Harbour Bridge",
        description: "Discover the iconic 'Coathanger', one of Australia's most recognized landmarks. Opened in 1932, it's the world's largest steel arch bridge with breathtaking harbor views.",
        icon: "🌉",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        marker: "marker2",
        year: "1932",
        location: { lat: -33.8523, lng: 151.2108 }
    },
    {
        id: 5,
        name: "Ancient Colosseum",
        description: "Experience the grandeur of ancient Rome. This iconic amphitheater hosted gladiatorial contests and public spectacles.",
        icon: "🏛️",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Replace with actual audio URL
        marker: "marker1",
        year: "70-80 AD",
        location: { lat: 41.8902, lng: 12.4922 }
    },
    {
        id: 6,
        name: "Pyramids of Giza",
        description: "Discover the mysteries of ancient Egypt. These magnificent structures have stood for over 4,500 years.",
        icon: "🔺",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        marker: "marker2",
        year: "2580-2560 BC",
        location: { lat: 29.9792, lng: 31.1342 }
    },
    {
        id: 7,
        name: "Great Wall of China",
        description: "Walk along the longest wall in the world, built to protect ancient Chinese states from invasions.",
        icon: "🧱",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        marker: "marker1",
        year: "7th century BC",
        location: { lat: 40.4319, lng: 116.5704 }
    },
    {
        id: 8,
        name: "Taj Mahal",
        description: "Marvel at this white marble mausoleum, a symbol of eternal love built by Emperor Shah Jahan.",
        icon: "🕌",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        marker: "marker2",
        year: "1632-1653 AD",
        location: { lat: 27.1751, lng: 78.0421 }
    },
    {
        id: 9,
        name: "Acropolis of Athens",
        description: "Explore the citadel of ancient Athens, home to the Parthenon and other iconic Greek monuments.",
        icon: "🏺",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        marker: "marker1",
        year: "5th century BC",
        location: { lat: 37.9715, lng: 23.7267 }
    },
    {
        id: 10,
        name: "Stonehenge",
        description: "Uncover the secrets of this prehistoric monument, a mysterious circle of standing stones.",
        icon: "🪨",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        marker: "marker2",
        year: "3000-2000 BC",
        location: { lat: 51.1789, lng: -1.8262 }
    },*/
];

// Application State
let currentScreen = 'main-menu';
let currentAttraction = null;
let userLocation = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    checkLocationPermission();
    configureARAvailabilityUI();
});

function initializeApp() {
    showScreen('main-menu');
    loadAttractions();
}

function isSecureContextForCamera() {
    // Camera requires secure context on mobile; allow localhost for dev
    const isHttps = window.location.protocol === 'https:';
    const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    return isHttps || isLocalhost;
}

function isCameraUsable() {
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    return hasMediaDevices && isSecureContextForCamera();
}

function configureARAvailabilityUI() {
    const startArBtn = document.querySelector('button[onclick="startAR()"]');
    const demoBtn = document.querySelector('button[onclick="startDemoMode()"]');

    if (!startArBtn) return;

    if (!isCameraUsable()) {
        // Hide/disable Start AR if camera won't work (e.g., iPhone Firefox over http)
        startArBtn.disabled = true;
        startArBtn.title = 'Camera AR requires HTTPS or localhost and a supported browser.';
        startArBtn.classList.add('disabled');
    }
}

function showARStatus(message, show = true) {
    const el = document.getElementById('ar-status');
    if (!el) return;
    el.textContent = message || '';
    el.style.display = show ? 'block' : 'none';
}

function setupARSceneListeners(scene) {
    if (!scene) return;
    // Status while initializing
    showARStatus('Initializing camera...');

    scene.addEventListener('camera-init', () => {
        showARStatus('Camera ready', true);
        setTimeout(() => showARStatus('', false), 800);
    });

    scene.addEventListener('camera-error', (e) => {
        console.error('AR.js camera error:', e && e.detail);
        showARStatus('Camera failed. Please enable camera permissions and use HTTPS.', true);
        setTimeout(() => { showARStatus('', false); showMainMenu(); }, 1200);
    });

    // Safety fallback: if no video is attached shortly, switch to video AR
    setTimeout(() => {
        const videos = scene.renderer && scene.renderer.domElement ? document.querySelectorAll('video') : document.querySelectorAll('video');
        const anyPlaying = Array.from(videos).some(v => !v.paused && v.readyState >= 2);
        if (!anyPlaying) {
            console.warn('No active camera video detected');
            showARStatus('No camera stream detected. Check HTTPS and permissions.', true);
            setTimeout(() => { showARStatus('', false); showMainMenu(); }, 1200);
        }
    }, 4000);
}

function setupEventListeners() {
    // Marker event listeners
    const marker1 = document.getElementById('marker1');
    const marker2 = document.getElementById('marker2');
    
    if (marker1) {
        marker1.addEventListener('markerFound', () => {
            const attraction = attractions.find(a => a.marker === 'marker1');
            showARInfo(attraction);
            playMarkerVideo('marker1', attraction);
        });
        
        marker1.addEventListener('markerLost', () => {
            hideARInfo();
            stopMarkerVideo('marker1');
        });
    }
    
    if (marker2) {
        marker2.addEventListener('markerFound', () => {
            const attraction = attractions.find(a => a.marker === 'marker2');
            showARInfo(attraction);
            playMarkerVideo('marker2', attraction);
        });
        
        marker2.addEventListener('markerLost', () => {
            hideARInfo();
            stopMarkerVideo('marker2');
        });
    }

    // Settings listeners
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('volume-value').textContent = value + '%';
            const audio = document.getElementById('narration-audio');
            if (audio) {
                audio.volume = value / 100;
            }
        });
    }

    // Audio enabled checkbox
    const audioEnabled = document.getElementById('audio-enabled');
    if (audioEnabled) {
        audioEnabled.addEventListener('change', (e) => {
            const audio = document.getElementById('narration-audio');
            if (audio) {
                audio.muted = !e.target.checked;
            }
        });
    }
}

function playMarkerVideo(markerId, attraction) {
    if (!attraction || !attraction.video) return;
    const videoDomId = markerId === 'marker1' ? 'video1' : 'video2';
    const planeId = markerId === 'marker1' ? 'marker1-video' : 'marker2-video';

    const videoEl = document.getElementById(videoDomId);
    const planeEl = document.getElementById(planeId);
    if (!videoEl || !planeEl) return;

    // Prepare video for iOS autoplay
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('webkit-playsinline', '');
    const audioEnabled = document.getElementById('audio-enabled');
    const shouldMute = !(audioEnabled && audioEnabled.checked);
    videoEl.muted = shouldMute; // unmute only if user enabled audio

    if (videoEl.src !== attraction.video) {
        videoEl.src = attraction.video;
        videoEl.load();
    }

    planeEl.setAttribute('visible', 'true');
    const tryPlay = () => videoEl.play().catch(() => {});
    tryPlay();
}

function stopMarkerVideo(markerId) {
    const videoDomId = markerId === 'marker1' ? 'video1' : 'video2';
    const planeId = markerId === 'marker1' ? 'marker1-video' : 'marker2-video';
    const videoEl = document.getElementById(videoDomId);
    const planeEl = document.getElementById(planeId);
    if (videoEl) {
        videoEl.pause();
    }
    if (planeEl) {
        planeEl.setAttribute('visible', 'false');
    }
}

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

function showMainMenu() {
    showScreen('main-menu');
    exitAR();
}

function showAttractions() {
    showScreen('attractions-screen');
}

function showSettings() {
    showScreen('settings-screen');
}

function showLocationBased() {
    showScreen('location-screen');
    if (!userLocation) {
        requestLocation();
    } else {
        showNearbyPlaces();
    }
}

// AR Functions
function startAR() {
    if (!isCameraUsable()) {
        alert('Camera AR is unavailable. Use HTTPS (or localhost) and allow camera.');
        return;
    }
    
    showScreen('ar-screen');
    requestCameraPermission();
    
    // Wait for scene to load
    setTimeout(() => {
        const scene = document.getElementById('ar-scene');
        if (scene) {
            scene.setAttribute('arjs', 'sourceType: webcam; videoTexture: true; debugUIEnabled: false; facingMode: environment;');
            setupARSceneListeners(scene);
        }
    }, 100);
}

// sample video AR removed

function exitAR() {
    // Stop all audio
    const audio = document.getElementById('narration-audio');
    if (audio) {
        audio.pause();
        audio.src = '';
    }
    
    hideARInfo();
    showMainMenu();
}

function requestCameraPermission() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            console.log('Camera access granted');
            // Stream is handled by AR.js
        })
        .catch(error => {
            console.error('Camera access denied:', error);
            alert('Camera access is required for AR features. Please enable camera permissions.');
            showMainMenu();
        });
}

function showARInfo(attraction) {
    if (!attraction) return;
    
    currentAttraction = attraction;
    const panel = document.getElementById('ar-info-panel');
    const title = document.getElementById('ar-title');
    const description = document.getElementById('ar-description');
    const audio = document.getElementById('narration-audio');
    
    if (panel && title && description) {
        title.textContent = attraction.name;
        description.textContent = `${attraction.description} Built: ${attraction.year}`;
        
        if (audio && attraction.audio) {
            audio.src = attraction.audio;
            const audioEnabled = document.getElementById('audio-enabled');
            if (audioEnabled && audioEnabled.checked) {
                audio.play().catch(err => {
                    console.log('Auto-play prevented:', err);
                });
            }
        }
        
        panel.classList.add('active');
        
        // Haptic feedback if enabled
        const vibrationEnabled = document.getElementById('vibration-enabled');
        if (vibrationEnabled && vibrationEnabled.checked && navigator.vibrate) {
            navigator.vibrate(200);
        }
    }
}

function hideARInfo() {
    const panel = document.getElementById('ar-info-panel');
    if (panel) {
        panel.classList.remove('active');
    }
    
    const audio = document.getElementById('narration-audio');
    if (audio) {
        audio.pause();
    }
}

// Attractions Functions
function loadAttractions() {
    const container = document.getElementById('attractions-list');
    if (!container) return;
    
    container.innerHTML = attractions.map(attraction => `
        <div class="attraction-card" onclick="selectAttraction(${attraction.id})">
            <div class="card-icon">${attraction.icon}</div>
            <h3>${attraction.name}</h3>
            <p>${attraction.description}</p>
            <span class="card-badge">${attraction.year}</span>
        </div>
    `).join('');
}

function selectAttraction(id) {
    const attraction = attractions.find(a => a.id === id);
    if (!attraction) return;
    
    // For demo purposes, we'll show AR with the selected attraction
    // In a real app, you might want to show more details or start AR with specific marker
    currentAttraction = attraction;
    startAR();
}

// Location Functions
function requestLocation() {
    if (!navigator.geolocation) {
        document.getElementById('location-status').innerHTML = 
            '<p>Geolocation is not supported by your browser.</p>';
        return;
    }
    
    document.getElementById('location-status').innerHTML = 
        '<p class="loading">Requesting location permission...</p>';
    
    navigator.geolocation.getCurrentPosition(
        position => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            document.getElementById('location-status').innerHTML = 
                `<p>✓ Location found!</p>`;
            showNearbyPlaces();
        },
        error => {
            console.error('Location error:', error);
            document.getElementById('location-status').innerHTML = 
                `<p>Location access denied. Please enable location permissions.</p>
                 <button onclick="requestLocation()" class="location-btn">Try Again</button>`;
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function checkLocationPermission() {
    // Check if location was previously granted
    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then(result => {
            if (result.state === 'granted') {
                requestLocation();
            }
        });
    }
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lng2 - lng1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

function showNearbyPlaces() {
    if (!userLocation) {
        document.getElementById('nearby-places').innerHTML = 
            '<p>Please enable location to see nearby places.</p>';
        return;
    }
    
    const places = attractions.map(attraction => {
        const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            attraction.location.lat,
            attraction.location.lng
        );
        return { ...attraction, distance };
    }).sort((a, b) => a.distance - b.distance);
    
    const container = document.getElementById('nearby-places');
    if (!container) return;
    
    container.innerHTML = places.map(place => `
        <div class="place-item" onclick="selectAttraction(${place.id})">
            <h4>${place.icon} ${place.name}</h4>
            <p>${place.description}</p>
            <span class="distance">📍 ${place.distance.toFixed(1)} km away • ${place.year}</span>
        </div>
    `).join('');
}



// Export functions to global scope for inline event handlers
window.showMainMenu = showMainMenu;
window.showAttractions = showAttractions;
window.startAR = startAR;
window.exitAR = exitAR;
window.selectAttraction = selectAttraction;
window.showLocationBased = showLocationBased;
window.showSettings = showSettings;
window.requestLocation = requestLocation;
// demo mode removed

