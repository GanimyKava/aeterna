// Echoes of Eternity AR 
window.onload = function () {
    // Component that binds a marker's found/lost to its child video plane and asset
    AFRAME.registerComponent('videohandler', {
        init: function () {
            const markerEl = this.el;
            const videoPlane = markerEl.querySelector('.video-plane');
            if (!videoPlane) return;

            const src = videoPlane.getAttribute('src');
            if (!src || !src.startsWith('#')) return;
            const videoId = src.substring(1);
            const videoElement = document.getElementById(videoId);
            if (!videoElement) return;

            markerEl.addEventListener('markerFound', function () {
                // Lazy load video source on first activation
                if (!videoElement.getAttribute('src') && videoElement.dataset && videoElement.dataset.src) {
                    videoElement.setAttribute('src', videoElement.dataset.src);
                    try { videoElement.load(); } catch (e) {}
                }
                videoPlane.setAttribute('visible', true);
                videoElement.play();
            });

            markerEl.addEventListener('markerLost', function () {
                videoPlane.setAttribute('visible', false);
                videoElement.pause();
                videoElement.currentTime = 0;
            });
        }
    });

    // Bootstrap: load NFT/video config and render dynamically
    (async function bootstrap() {
        try {
            const response = await fetch('db/config.json', { cache: 'no-cache' });
            const config = await response.json();

            const assetsEl = document.getElementById('dynamic-assets');
            const markersContainer = document.getElementById('markers-container');
            const gpsContainer = document.getElementById('gps-places-container');

            if (!Array.isArray(config?.items)) return;

            config.items.forEach(function (item) {
                const idSafe = String(item.id || '').trim();
                if (!idSafe) return;

                // Create <video> asset (lazy: no src until activation)
                const videoEl = document.createElement('video');
                const videoId = 'vid-' + idSafe;
                videoEl.setAttribute('id', videoId);
                // Store target source for lazy loading
                videoEl.setAttribute('data-src', item.videoSrc);
                videoEl.setAttribute('preload', 'none');
                videoEl.setAttribute('response-type', 'arraybuffer');
                videoEl.setAttribute('loop', '');
                videoEl.setAttribute('crossorigin', 'anonymous');
                videoEl.setAttribute('webkit-playsinline', '');
                videoEl.setAttribute('playsinline', '');
                videoEl.setAttribute('muted', '');
                assetsEl.appendChild(videoEl);

                // Create <a-nft> marker
                const markerEl = document.createElement('a-nft');
                markerEl.setAttribute('videohandler', '');
                markerEl.setAttribute('type', 'nft');
                markerEl.setAttribute('url', item.nftBaseUrl);
                markerEl.setAttribute('smooth', 'true');
                markerEl.setAttribute('smoothCount', '10');
                markerEl.setAttribute('smoothTolerance', '0.01');
                markerEl.setAttribute('smoothThreshold', '5');
                markerEl.setAttribute('emitevents', 'true');
                markerEl.setAttribute('id', 'nft-' + idSafe);

                // Create child <a-video>
                const aVideo = document.createElement('a-video');
                aVideo.setAttribute('src', '#' + videoId);
                aVideo.setAttribute('width', item.videoWidth || '300');
                aVideo.setAttribute('height', item.videoHeight || '175');
                aVideo.setAttribute('position', item.position || '0 0 0');
                aVideo.setAttribute('rotation', item.rotation || '-90 0 0');
                aVideo.setAttribute('class', 'video-plane');
                aVideo.setAttribute('visible', 'false');

                markerEl.appendChild(aVideo);
                markersContainer.appendChild(markerEl);

                // Create location-based AR entity if coordinates provided
                if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
                    const placeEl = document.createElement('a-entity');
                    placeEl.setAttribute('gps-entity-place', `latitude: ${item.latitude}; longitude: ${item.longitude}`);
                    placeEl.setAttribute('id', 'geo-' + idSafe);

                    const geoVideo = document.createElement('a-video');
                    geoVideo.setAttribute('src', '#' + videoId);
                    geoVideo.setAttribute('width', item.videoWidth || '300');
                    geoVideo.setAttribute('height', item.videoHeight || '175');
                    // For geo, orient upright and face the user camera by default
                    geoVideo.setAttribute('rotation', '0 180 0');
                    geoVideo.setAttribute('class', 'geo-video-plane');
                    geoVideo.setAttribute('visible', 'false');

                    placeEl.appendChild(geoVideo);
                    gpsContainer.appendChild(placeEl);
                }
            });

            // If any geo items exist, start geolocation watcher to auto-activate videos
            const hasGeo = config.items.some(function (item) { return typeof item.latitude === 'number' && typeof item.longitude === 'number'; });
            if (hasGeo && navigator.geolocation) {
                const itemsById = {};
                const geoActive = {}; // track active state per item to avoid flapping
                config.items.forEach(function (item) { itemsById[item.id] = item; });

                const toRad = function (value) { return value * Math.PI / 180; };
                const distanceMeters = function (lat1, lon1, lat2, lon2) {
                    const R = 6371000; // meters
                    const dLat = toRad(lat2 - lat1);
                    const dLon = toRad(lon2 - lon1);
                    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    return R * c;
                };

                navigator.geolocation.watchPosition(function (pos) {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;

                    config.items.forEach(function (item) {
                        if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') return;
                        const radius = typeof item.radiusMeters === 'number' ? item.radiusMeters : 100;
                        const hysteresis = Math.max(10, Math.min(50, Math.round(radius * 0.1))); // 10% buffer (10-50m)
                        const dist = distanceMeters(lat, lon, item.latitude, item.longitude);

                        const videoId = 'vid-' + item.id;
                        const videoElement = document.getElementById(videoId);
                        const geoPlane = document.querySelector('#geo-' + item.id + ' .geo-video-plane');
                        if (!videoElement || !geoPlane) return;

                        const currentlyActive = !!geoActive[item.id];
                        if (!currentlyActive && dist <= radius) {
                            if (!videoElement.getAttribute('src') && videoElement.dataset && videoElement.dataset.src) {
                                videoElement.setAttribute('src', videoElement.dataset.src);
                                try { videoElement.load(); } catch (e) {}
                            }
                            geoActive[item.id] = true;
                            geoPlane.setAttribute('visible', true);
                            if (videoElement.paused) { videoElement.play(); }
                        } else if (currentlyActive && dist > (radius + hysteresis)) {
                            geoActive[item.id] = false;
                            geoPlane.setAttribute('visible', false);
                            if (!videoElement.paused) {
                                videoElement.pause();
                                videoElement.currentTime = 0;
                            }
                        }
                    });
                }, function (err) {
                    console.warn('Geolocation error:', err);
                }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });
            }
        } catch (e) {
            // Fail silently to avoid crashing the AR scene in case of fetch errors
            // Consider logging to console for development
            console.error('Failed to load NFT config:', e);
        }
    })();

    // Tap-to-unmute overlay removed; videos remain muted to satisfy autoplay policies

    // Ensure scene resizes correctly on orientation changes
    (function handleOrientationResize() {
        const triggerResize = function () {
            try { window.dispatchEvent(new Event('resize')); } catch (e) {}
            // If any video planes are visible, ensure their media keeps playing
            const videos = document.querySelectorAll('video');
            videos.forEach(function (v) {
                const plane = document.querySelector(`[src="#${v.id}"]`);
                if (plane && plane.getAttribute && plane.getAttribute('visible')) {
                    v.play().catch(function () {});
                }
            });
        };
        window.addEventListener('orientationchange', function () {
            setTimeout(triggerResize, 150);
        });
        window.addEventListener('resize', function () {
            setTimeout(triggerResize, 150);
        });
    })();
};

