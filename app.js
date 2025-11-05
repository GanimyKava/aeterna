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

            if (!Array.isArray(config?.items)) return;

            config.items.forEach(function (item) {
                const idSafe = String(item.id || '').trim();
                if (!idSafe) return;

                // Create <video> asset
                const videoEl = document.createElement('video');
                const videoId = 'vid-' + idSafe;
                videoEl.setAttribute('id', videoId);
                videoEl.setAttribute('src', item.videoSrc);
                videoEl.setAttribute('preload', 'auto');
                videoEl.setAttribute('response-type', 'arraybuffer');
                videoEl.setAttribute('loop', '');
                videoEl.setAttribute('crossorigin', 'anonymous');
                videoEl.setAttribute('webkit-playsinline', '');
                videoEl.setAttribute('playsinline', '');
                assetsEl.appendChild(videoEl);

                // Create <a-nft> marker
                const markerEl = document.createElement('a-nft');
                markerEl.setAttribute('videohandler', '');
                markerEl.setAttribute('type', 'nft');
                markerEl.setAttribute('url', item.nftBaseUrl);
                markerEl.setAttribute('smooth', 'true');
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
            });
        } catch (e) {
            // Fail silently to avoid crashing the AR scene in case of fetch errors
            // Consider logging to console for development
            console.error('Failed to load NFT config:', e);
        }
    })();
};

