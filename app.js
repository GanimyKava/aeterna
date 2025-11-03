// Echoes of Eternity AR - Main Application Logic

// Sample historical attractions data
const attractions = [
    {
        id: 1,
        name: "Ancient Colosseum",
        description: "Experience the grandeur of ancient Rome. This iconic amphitheater hosted gladiatorial contests and public spectacles.",
        icon: "🏛️",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Replace with actual audio URL
        marker: "marker1",
        year: "70-80 AD",
        location: { lat: 41.8902, lng: 12.4922 }
    },
    {
        id: 2,
        name: "Pyramids of Giza",
        description: "Discover the mysteries of ancient Egypt. These magnificent structures have stood for over 4,500 years.",
        icon: "🔺",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        marker: "marker2",
        year: "2580-2560 BC",
        location: { lat: 29.9792, lng: 31.1342 }
    },
    {
        id: 3,
        name: "Great Wall of China",
        description: "Walk along the longest wall in the world, built to protect ancient Chinese states from invasions.",
        icon: "🧱",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        marker: "marker1",
        year: "7th century BC",
        location: { lat: 40.4319, lng: 116.5704 }
    },
    {
        id: 4,
        name: "Taj Mahal",
        description: "Marvel at this white marble mausoleum, a symbol of eternal love built by Emperor Shah Jahan.",
        icon: "🕌",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        marker: "marker2",
        year: "1632-1653 AD",
        location: { lat: 27.1751, lng: 78.0421 }
    },
    {
        id: 5,
        name: "Acropolis of Athens",
        description: "Explore the citadel of ancient Athens, home to the Parthenon and other iconic Greek monuments.",
        icon: "🏺",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        marker: "marker1",
        year: "5th century BC",
        location: { lat: 37.9715, lng: 23.7267 }
    },
    {
        id: 6,
        name: "Stonehenge",
        description: "Uncover the secrets of this prehistoric monument, a mysterious circle of standing stones.",
        icon: "🪨",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        marker: "marker2",
        year: "3000-2000 BC",
        location: { lat: 51.1789, lng: -1.8262 }
    }
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
});

function initializeApp() {
    showScreen('main-menu');
    loadAttractions();
}

function setupEventListeners() {
    // Marker event listeners
    const marker1 = document.getElementById('marker1');
    const marker2 = document.getElementById('marker2');
    
    if (marker1) {
        marker1.addEventListener('markerFound', () => {
            showARInfo(attractions.find(a => a.marker === 'marker1'));
        });
        
        marker1.addEventListener('markerLost', () => {
            hideARInfo();
        });
    }
    
    if (marker2) {
        marker2.addEventListener('markerFound', () => {
            showARInfo(attractions.find(a => a.marker === 'marker2'));
        });
        
        marker2.addEventListener('markerLost', () => {
            hideARInfo();
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
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support camera access. Please use a modern browser with camera permissions enabled.');
        return;
    }
    
    showScreen('ar-screen');
    requestCameraPermission();
    
    // Wait for scene to load
    setTimeout(() => {
        const scene = document.getElementById('ar-scene');
        if (scene) {
            scene.setAttribute('arjs', 'sourceType: webcam; videoTexture: true; debugUIEnabled: false;');
        }
    }, 100);
}

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

