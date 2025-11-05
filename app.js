// Echoes of Eternity AR 
window.onload = function () {
    AFRAME.registerComponent('videohandler', {
        init: function () {
            const nftMarker = document.querySelector('#nft-marker');
            const videoElement = document.querySelector('#vid');
            const videoPlane = document.querySelector('#video-plane');

            nftMarker.addEventListener('markerFound', function () {
                console.log('Marker found!');
                videoPlane.setAttribute('visible', true);
                videoElement.play();
            });

            nftMarker.addEventListener('markerLost', function () {
                console.log('Marker lost!');
                videoPlane.setAttribute('visible', false);
                videoElement.pause();
                videoElement.currentTime = 0; // Optional: reset video to start
            });
        }
    });
};

