// Echoes of Eternity AR - Main Application Logic

// Sample historical attractions data
const attractions = [
    // Australian Tourist Attractions & Museums
    {
        id: 1,
        name: "Sydney Opera House",
        description: "Experience the architectural marvel designed by Jørn Utzon. This UNESCO World Heritage site is one of the world's most distinctive and famous buildings, hosting over 1,500 performances annually.",
        icon: "🎭",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        marker: "marker1",
        year: "1973",
        location: { lat: -33.8568, lng: 151.2153 }
    },
    {
        id: 2,
        name: "Sydney Harbour Bridge",
        description: "Discover the iconic 'Coathanger', one of Australia's most recognized landmarks. Opened in 1932, it's the world's largest steel arch bridge with breathtaking harbor views.",
        icon: "🌉",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        marker: "marker2",
        year: "1932",
        location: { lat: -33.8523, lng: 151.2108 }
    },
    {
        id: 3,
        name: "Uluru (Ayers Rock)",
        description: "Explore the sacred red monolith sacred to the Anangu people. This massive sandstone formation rises 348 meters above the surrounding desert and holds deep spiritual significance.",
        icon: "🪨",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        marker: "marker1",
        year: "Formed 550 million years ago",
        location: { lat: -25.3444, lng: 131.0369 }
    },
    {
        id: 4,
        name: "Great Barrier Reef",
        description: "Dive into the world's largest coral reef system, home to thousands of species of marine life. This UNESCO World Heritage site spans over 2,300 kilometers along the Queensland coast.",
        icon: "🐠",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        marker: "marker2",
        year: "Millions of years old",
        location: { lat: -16.2864, lng: 145.7003 }
    },
    {
        id: 5,
        name: "Australian War Memorial",
        description: "Honor the sacrifice of Australian servicemen and women. This national memorial combines a shrine, museum, and archive, commemorating Australia's military history from colonial times to present.",
        icon: "🇦🇺",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
        marker: "marker1",
        year: "1941",
        location: { lat: -35.2805, lng: 149.1490 }
    },
    {
        id: 6,
        name: "Melbourne Museum",
        description: "Explore Australia's largest museum featuring exhibits on natural history, Indigenous culture, and science. The Bunjilaka Aboriginal Cultural Centre provides deep insights into First Nations heritage.",
        icon: "🏛️",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
        marker: "marker2",
        year: "2000",
        location: { lat: -37.8033, lng: 144.9717 }
    },
    {
        id: 7,
        name: "Port Arthur Historic Site",
        description: "Step into Australia's most significant convict heritage site. This former penal settlement tells the story of over 12,000 convicts who were imprisoned here between 1833 and 1877.",
        icon: "⛓️",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
        marker: "marker1",
        year: "1830-1877",
        location: { lat: -43.1419, lng: 147.8519 }
    },
    {
        id: 8,
        name: "Royal Exhibition Building",
        description: "Discover Melbourne's architectural gem and the first Australian building to receive UNESCO World Heritage status. Built for the 1880 Melbourne International Exhibition, it showcases Victorian era grandeur.",
        icon: "🏰",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
        marker: "marker2",
        year: "1880",
        location: { lat: -37.8047, lng: 144.9718 }
    },
    {
        id: 9,
        name: "Kakadu National Park",
        description: "Experience Australia's largest national park, home to ancient Aboriginal rock art sites dating back over 20,000 years. This UNESCO World Heritage site showcases remarkable biodiversity and cultural heritage.",
        icon: "🦘",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
        marker: "marker1",
        year: "Aboriginal presence for 65,000+ years",
        location: { lat: -12.8254, lng: 132.8323 }
    },
    {
        id: 10,
        name: "Hyde Park Barracks",
        description: "Explore the convict-built barracks that housed thousands of male convicts in colonial Sydney. This UNESCO World Heritage site reveals the harsh realities of convict life in early Australia.",
        icon: "🏢",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
        marker: "marker2",
        year: "1819",
        location: { lat: -33.8702, lng: 151.2119 }
    },
    {
        id: 11,
        name: "Old Melbourne Gaol",
        description: "Step inside one of Australia's most notorious prisons where over 130 people were executed, including the infamous bushranger Ned Kelly. Experience the chilling history of 19th-century punishment.",
        icon: "🚪",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3",
        marker: "marker1",
        year: "1841-1924",
        location: { lat: -37.8075, lng: 144.9652 }
    },
    {
        id: 12,
        name: "Australian National Maritime Museum",
        description: "Discover Australia's rich maritime heritage from Aboriginal watercraft to modern naval vessels. Explore interactive exhibits on exploration, migration, and Australia's connection to the sea.",
        icon: "⛵",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3",
        marker: "marker2",
        year: "1991",
        location: { lat: -33.8694, lng: 151.1986 }
    },
    {
        id: 13,
        name: "Fremantle Prison",
        description: "Experience Western Australia's only World Heritage-listed building. Built by convicts in the 1850s, this maximum-security prison operated until 1991, showcasing over 140 years of penal history.",
        icon: "🔒",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-19.mp3",
        marker: "marker1",
        year: "1850s-1991",
        location: { lat: -32.0553, lng: 115.7531 }
    },
    {
        id: 14,
        name: "Twelve Apostles",
        description: "Marvel at the iconic limestone stacks along Victoria's Great Ocean Road. Formed by erosion over millions of years, these natural wonders showcase the power of ocean and time.",
        icon: "🌊",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-20.mp3",
        marker: "marker2",
        year: "Formed over 20 million years",
        location: { lat: -38.6633, lng: 143.1047 }
    },
    {
        id: 15,
        name: "Australian Museum",
        description: "Explore Australia's oldest natural history museum, founded in 1827. Discover extensive collections on Australian natural history, Indigenous cultures, and scientific research.",
        icon: "🦋",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-21.mp3",
        marker: "marker1",
        year: "1827",
        location: { lat: -33.8737, lng: 151.2130 }
    },
    {
        id: 16,
        name: "Bondi Beach",
        description: "Experience Australia's most famous beach, a cultural icon of Sydney's beach lifestyle. From ancient Aboriginal occupation to modern surf culture, Bondi embodies Australian coastal heritage.",
        icon: "🏖️",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-22.mp3",
        marker: "marker2",
        year: "Aboriginal heritage for 40,000+ years",
        location: { lat: -33.8915, lng: 151.2767 }
    },
    {
        id: 17,
        name: "Federation Square",
        description: "Discover Melbourne's cultural heart, a modern architectural landmark opened for Australia's Centenary of Federation. Home to galleries, museums, and cultural institutions.",
        icon: "🎨",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-23.mp3",
        marker: "marker1",
        year: "2002",
        location: { lat: -37.8180, lng: 144.9691 }
    },
    {
        id: 18,
        name: "Queen Victoria Building",
        description: "Explore Sydney's magnificent Victorian-era shopping center, opened in 1898. This beautifully restored Romanesque Revival building showcases 19th-century architectural grandeur.",
        icon: "🏛️",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-24.mp3",
        marker: "marker2",
        year: "1898",
        location: { lat: -33.8715, lng: 151.2067 }
    },
    {
        id: 19,
        name: "Ancient Colosseum",
        description: "Experience the grandeur of ancient Rome. This iconic amphitheater hosted gladiatorial contests and public spectacles.",
        icon: "🏛️",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Replace with actual audio URL
        marker: "marker1",
        year: "70-80 AD",
        location: { lat: 41.8902, lng: 12.4922 }
    },
    {
        id: 20,
        name: "Pyramids of Giza",
        description: "Discover the mysteries of ancient Egypt. These magnificent structures have stood for over 4,500 years.",
        icon: "🔺",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        marker: "marker2",
        year: "2580-2560 BC",
        location: { lat: 29.9792, lng: 31.1342 }
    },
    {
        id: 21,
        name: "Great Wall of China",
        description: "Walk along the longest wall in the world, built to protect ancient Chinese states from invasions.",
        icon: "🧱",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        marker: "marker1",
        year: "7th century BC",
        location: { lat: 40.4319, lng: 116.5704 }
    },
    {
        id: 22,
        name: "Taj Mahal",
        description: "Marvel at this white marble mausoleum, a symbol of eternal love built by Emperor Shah Jahan.",
        icon: "🕌",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        marker: "marker2",
        year: "1632-1653 AD",
        location: { lat: 27.1751, lng: 78.0421 }
    },
    {
        id: 23,
        name: "Acropolis of Athens",
        description: "Explore the citadel of ancient Athens, home to the Parthenon and other iconic Greek monuments.",
        icon: "🏺",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        marker: "marker1",
        year: "5th century BC",
        location: { lat: 37.9715, lng: 23.7267 }
    },
    {
        id: 24,
        name: "Stonehenge",
        description: "Uncover the secrets of this prehistoric monument, a mysterious circle of standing stones.",
        icon: "🪨",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        marker: "marker2",
        year: "3000-2000 BC",
        location: { lat: 51.1789, lng: -1.8262 }
    },
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

// Demo Mode Functions (No Camera Required)
function startDemoMode() {
    showScreen('demo-screen');
    
    // Populate attraction selector
    const select = document.getElementById('demo-attraction-select');
    if (select) {
        select.innerHTML = '<option value="">-- Choose an Attraction --</option>' +
            attractions.map(attraction => 
                `<option value="${attraction.id}">${attraction.icon} ${attraction.name}</option>`
            ).join('');
    }
    
    // Hide info panel initially
    const infoPanel = document.getElementById('demo-info-panel');
    if (infoPanel) {
        infoPanel.style.display = 'none';
    }
    
    // Clear any previous content
    clearDemoContent();
}

function exitDemoMode() {
    // Stop audio
    const audio = document.getElementById('demo-audio');
    if (audio) {
        audio.pause();
        audio.src = '';
    }
    
    clearDemoContent();
    showMainMenu();
}

function clearDemoContent() {
    const content = document.getElementById('demo-content');
    if (content) {
        content.innerHTML = '';
    }
}

function loadDemoAttraction(attractionId) {
    if (!attractionId) {
        clearDemoContent();
        const infoPanel = document.getElementById('demo-info-panel');
        if (infoPanel) {
            infoPanel.style.display = 'none';
        }
        return;
    }
    
    const attraction = attractions.find(a => a.id == attractionId);
    if (!attraction) return;
    
    // Show info panel
    const infoPanel = document.getElementById('demo-info-panel');
    const title = document.getElementById('demo-title');
    const description = document.getElementById('demo-description');
    const audio = document.getElementById('demo-audio');
    
    if (infoPanel && title && description) {
        title.textContent = attraction.name;
        description.textContent = `${attraction.description} Built: ${attraction.year}`;
        infoPanel.style.display = 'block';
        
        if (audio && attraction.audio) {
            audio.src = attraction.audio;
            const audioEnabled = document.getElementById('audio-enabled');
            if (audioEnabled && audioEnabled.checked) {
                audio.play().catch(err => {
                    console.log('Auto-play prevented:', err);
                });
            }
        }
    }
    
    // Create 3D model based on attraction
    createDemo3DModel(attraction);
}

function createDemo3DModel(attraction) {
    const content = document.getElementById('demo-content');
    if (!content) return;
    
    // Clear previous content
    content.innerHTML = '';
    
    // Create different 3D models based on attraction type
    let model;
    
    // Determine model type based on attraction icon or name
    if (attraction.icon === '🏛️' || attraction.icon === '🏰' || attraction.icon === '🎭') {
        // Buildings - create a box with texture-like appearance
        model = document.createElement('a-box');
        model.setAttribute('position', '0 1 -3');
        model.setAttribute('rotation', '0 45 0');
        model.setAttribute('width', '2');
        model.setAttribute('height', '2');
        model.setAttribute('depth', '2');
        model.setAttribute('color', '#4CC3D9');
        model.setAttribute('animation', 'property: rotation; to: 0 405 0; loop: true; dur: 4000');
    } else if (attraction.icon === '🪨' || attraction.icon === '🌊') {
        // Natural formations - create a cylinder or sphere
        model = document.createElement('a-cylinder');
        model.setAttribute('position', '0 1 -3');
        model.setAttribute('radius', '1');
        model.setAttribute('height', '2');
        model.setAttribute('color', '#EF2D5E');
        model.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 6000');
    } else if (attraction.icon === '🌉') {
        // Bridge - create an arch-like structure
        model = document.createElement('a-torus');
        model.setAttribute('position', '0 1 -3');
        model.setAttribute('radius', '1.5');
        model.setAttribute('radius-tubular', '0.3');
        model.setAttribute('color', '#FFC107');
        model.setAttribute('rotation', '90 0 0');
    } else if (attraction.icon === '🐠' || attraction.icon === '⛵') {
        // Water-related - create a wavy surface
        model = document.createElement('a-plane');
        model.setAttribute('position', '0 0 -3');
        model.setAttribute('rotation', '-90 0 0');
        model.setAttribute('width', '4');
        model.setAttribute('height', '4');
        model.setAttribute('color', '#2196F3');
        model.setAttribute('animation', 'property: rotation; to: -90 360 0; loop: true; dur: 8000');
    } else if (attraction.icon === '🦘' || attraction.icon === '🦋') {
        // Wildlife/Nature - create a sphere
        model = document.createElement('a-sphere');
        model.setAttribute('position', '0 1 -3');
        model.setAttribute('radius', '1');
        model.setAttribute('color', '#4CAF50');
        model.setAttribute('animation', 'property: scale; from: 1 1 1; to: 1.2 1.2 1.2; loop: true; dur: 2000; dir: alternate');
    } else {
        // Default - create a geometric shape
        model = document.createElement('a-box');
        model.setAttribute('position', '0 1 -3');
        model.setAttribute('rotation', '0 45 0');
        model.setAttribute('width', '1.5');
        model.setAttribute('height', '1.5');
        model.setAttribute('depth', '1.5');
        model.setAttribute('color', '#9C27B0');
        model.setAttribute('animation', 'property: rotation; to: 0 405 0; loop: true; dur: 4000');
    }
    
    // Add text label
    const text = document.createElement('a-text');
    text.setAttribute('value', attraction.name);
    text.setAttribute('align', 'center');
    text.setAttribute('position', '0 2.5 -3');
    text.setAttribute('color', '#FFF');
    text.setAttribute('scale', '2 2 2');
    
    // Add year badge
    const yearText = document.createElement('a-text');
    yearText.setAttribute('value', attraction.year);
    yearText.setAttribute('align', 'center');
    yearText.setAttribute('position', '0 2 -3');
    yearText.setAttribute('color', '#FFC107');
    yearText.setAttribute('scale', '1.5 1.5 1.5');
    
    // Add particles effect for visual appeal
    const particles = document.createElement('a-plane');
    particles.setAttribute('position', '0 0 -2');
    particles.setAttribute('rotation', '0 0 0');
    particles.setAttribute('width', '0.1');
    particles.setAttribute('height', '0.1');
    particles.setAttribute('color', '#FFFFFF');
    particles.setAttribute('opacity', '0.5');
    particles.setAttribute('animation', 'property: position; to: 0 3 -2; loop: true; dur: 3000; easing: easeInOut');
    
    content.appendChild(model);
    content.appendChild(text);
    content.appendChild(yearText);
    content.appendChild(particles);
    
    // Haptic feedback if enabled
    const vibrationEnabled = document.getElementById('vibration-enabled');
    if (vibrationEnabled && vibrationEnabled.checked && navigator.vibrate) {
        navigator.vibrate(100);
    }
}

// VR Mode Functions (Immersive)
function startVRMode() {
    showScreen('vr-screen');

    // Populate VR selector
    const select = document.getElementById('vr-attraction-select');
    if (select) {
        select.innerHTML = '<option value="">-- Choose an Attraction --</option>' +
            attractions.map(attraction => 
                `<option value="${attraction.id}">${attraction.icon} ${attraction.name}</option>`
            ).join('');
    }

    // Prepare base VR scene
    clearVRContent();
}

function exitVRMode() {
    clearVRContent();
    showMainMenu();
}

function clearVRContent() {
    const content = document.getElementById('vr-content');
    if (content) content.innerHTML = '';
}

function loadVRAttraction(attractionId) {
    if (!attractionId) {
        clearVRContent();
        return;
    }

    const attraction = attractions.find(a => a.id == attractionId);
    if (!attraction) return;

    createVRReconstruction(attraction);
}

function createVRReconstruction(attraction) {
    const content = document.getElementById('vr-content');
    if (!content) return;

    // Reset content
    content.innerHTML = '';

    // Common elements
    const title = document.createElement('a-text');
    title.setAttribute('value', attraction.name);
    title.setAttribute('align', 'center');
    title.setAttribute('position', '0 3 -4');
    title.setAttribute('color', '#ffffff');
    title.setAttribute('scale', '3 3 3');

    const subtitle = document.createElement('a-text');
    subtitle.setAttribute('value', attraction.year);
    subtitle.setAttribute('align', 'center');
    subtitle.setAttribute('position', '0 2.5 -4');
    subtitle.setAttribute('color', '#ffc107');
    subtitle.setAttribute('scale', '2 2 2');

    // Simple reconstruction primitives
    let centerpiece;
    if (attraction.icon === '🎭' || attraction.icon === '🏛️' || attraction.icon === '🏰') {
        centerpiece = document.createElement('a-box');
        centerpiece.setAttribute('position', '0 1 -4');
        centerpiece.setAttribute('depth', '3');
        centerpiece.setAttribute('height', '2');
        centerpiece.setAttribute('width', '4');
        centerpiece.setAttribute('color', '#3f8abf');
        centerpiece.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 12000');
    } else if (attraction.icon === '🌉') {
        centerpiece = document.createElement('a-torus');
        centerpiece.setAttribute('position', '0 1.2 -4');
        centerpiece.setAttribute('radius', '2');
        centerpiece.setAttribute('radius-tubular', '0.2');
        centerpiece.setAttribute('rotation', '90 0 0');
        centerpiece.setAttribute('color', '#ffd166');
    } else if (attraction.icon === '🪨' || attraction.icon === '🌊') {
        centerpiece = document.createElement('a-sphere');
        centerpiece.setAttribute('position', '0 1.2 -4');
        centerpiece.setAttribute('radius', '1.2');
        centerpiece.setAttribute('color', '#ef476f');
        centerpiece.setAttribute('animation', 'property: position; to: 0 1.5 -4; dir: alternate; loop: true; dur: 3000');
    } else if (attraction.icon === '🐠' || attraction.icon === '⛵') {
        centerpiece = document.createElement('a-plane');
        centerpiece.setAttribute('position', '0 0 -4');
        centerpiece.setAttribute('rotation', '-90 0 0');
        centerpiece.setAttribute('width', '8');
        centerpiece.setAttribute('height', '8');
        centerpiece.setAttribute('color', '#118ab2');
        centerpiece.setAttribute('animation', 'property: rotation; to: -90 360 0; loop: true; dur: 15000');
    } else if (attraction.icon === '🦘' || attraction.icon === '🦋') {
        centerpiece = document.createElement('a-icosahedron');
        centerpiece.setAttribute('position', '0 1.2 -4');
        centerpiece.setAttribute('radius', '1');
        centerpiece.setAttribute('color', '#06d6a0');
        centerpiece.setAttribute('animation', 'property: scale; from: 1 1 1; to: 1.3 1.3 1.3; loop: true; dir: alternate; dur: 3000');
    } else {
        centerpiece = document.createElement('a-box');
        centerpiece.setAttribute('position', '0 1 -4');
        centerpiece.setAttribute('depth', '2');
        centerpiece.setAttribute('height', '2');
        centerpiece.setAttribute('width', '2');
        centerpiece.setAttribute('color', '#9c27b0');
        centerpiece.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 8000');
    }

    // Informational billboard
    const board = document.createElement('a-plane');
    board.setAttribute('position', '0 1.2 -2');
    board.setAttribute('rotation', '0 0 0');
    board.setAttribute('width', '3.5');
    board.setAttribute('height', '1.5');
    board.setAttribute('color', '#263238');
    board.setAttribute('opacity', '0.9');

    const boardText = document.createElement('a-text');
    boardText.setAttribute('value', attraction.description);
    boardText.setAttribute('position', '-1.6 0.4 -2');
    boardText.setAttribute('wrap-count', '30');
    boardText.setAttribute('width', '3.2');
    boardText.setAttribute('color', '#e0f7fa');

    // Add ambient particles
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('a-sphere');
        p.setAttribute('radius', '0.03');
        p.setAttribute('color', '#ffffff');
        const x = (Math.random() - 0.5) * 8;
        const y = Math.random() * 3 + 0.5;
        const z = - (Math.random() * 8 + 2);
        p.setAttribute('position', `${x} ${y} ${z}`);
        p.setAttribute('animation', `property: position; to: ${x} ${y + 0.8} ${z}; dir: alternate; loop: true; dur: ${2000 + Math.random()*2000}`);
        content.appendChild(p);
    }

    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(centerpiece);
    content.appendChild(board);
    content.appendChild(boardText);
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
window.startDemoMode = startDemoMode;
window.exitDemoMode = exitDemoMode;
window.loadDemoAttraction = loadDemoAttraction;

