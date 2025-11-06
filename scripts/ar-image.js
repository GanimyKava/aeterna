// Image-based AR (NFT) page initialization
// Dynamically loads all attractions from attractions.yaml and sets up NFT markers
window.EternityMetrics.recordVisit('ar-image');

const nftRoot = document.getElementById('nftRoot');
const uiVideo = document.getElementById('video');

// Store attraction data for each marker
const attractionMap = new Map();

// Reset video elements on page load to ensure clean state after reload
function resetVideoElements() {
  // Reset UI video
  if (uiVideo) {
    uiVideo.pause();
    uiVideo.currentTime = 0;
    uiVideo.src = '';
    uiVideo.style.display = 'none';
    uiVideo.classList.remove('visible');
  }
  
  // Clear any existing video assets in a-assets
  const scene = document.querySelector('a-scene');
  if (scene) {
    const assets = scene.querySelector('a-assets');
    if (assets) {
      // Remove all video elements except the default one
      const videos = assets.querySelectorAll('video');
      videos.forEach(video => {
        if (video.id !== 'video-asset') {
          video.pause();
          video.currentTime = 0;
          if (video.hasAttribute('src')) {
            video.setAttribute('src', '');
          }
          video.remove();
        }
      });
    }
  }
  
  // Clear nftRoot to remove any existing markers
  if (nftRoot) {
    nftRoot.innerHTML = '';
  }
}

function setupForAttraction(a) {
  const nft = a.imageNFT && a.imageNFT.nftBaseUrl;
  if (!nft || !a.videoUrl) {
    console.warn(`Skipping attraction ${a.id || a.name}: missing nftBaseUrl or videoUrl`);
    return;
  }

  // Create unique video asset for each attraction
  const videoId = `video-asset-${a.id}`;
  const assetsEl = document.querySelector('a-assets');
  const videoEl = document.createElement('video');
  videoEl.id = videoId;
  videoEl.setAttribute('src', '');
  videoEl.setAttribute('preload', 'none'); // Lazy load - only load when marker detected
  videoEl.setAttribute('crossorigin', 'anonymous');
  videoEl.setAttribute('muted', 'false'); // Unmuted for sound
  videoEl.setAttribute('playsinline', 'true');
  videoEl.setAttribute('loop', 'true');
  videoEl.setAttribute('autoplay', 'true');
  if (assetsEl) {
    assetsEl.appendChild(videoEl);
  }

  // Create NFT marker element
  const markerEl = document.createElement('a-nft');
  markerEl.setAttribute('type', 'nft');
  markerEl.setAttribute('url', nft);
  markerEl.setAttribute('smooth', 'true');
  markerEl.setAttribute('smoothCount', '10');
  markerEl.setAttribute('smoothTolerance', '0.01');
  markerEl.setAttribute('smoothThreshold', '5');
  // Ensure marker is visible and ready
  markerEl.setAttribute('emitevents', 'true');
  
  // Store attraction ID on marker for reference
  markerEl.setAttribute('data-attraction-id', a.id);

  // Create video plane that will display when marker is detected
  const plane = document.createElement('a-video');
  plane.setAttribute('width', '1.6');
  plane.setAttribute('height', '0.9');
  plane.setAttribute('position', '0 0.5 0'); // Slightly above marker
  plane.setAttribute('rotation', '-90 0 0');
  plane.setAttribute('src', `#${videoId}`);

  // Track if video has been loaded for this marker
  let loaded = false;
  
  // When marker is detected (user points camera at the image)
  markerEl.addEventListener('markerFound', () => {
    console.log(`Image marker detected: ${a.name} (${a.id})`);
    
    // Load video immediately when marker is detected
    if (!loaded && a.videoUrl) {
      console.log(`Loading video for ${a.name}: ${a.videoUrl}`);
      
      // Set video source for A-Frame video element
      videoEl.setAttribute('src', a.videoUrl);
      
      // Also set for UI video element (bottom overlay)
      if (uiVideo) {
        uiVideo.src = a.videoUrl;
        uiVideo.muted = false; // Unmuted for sound
        uiVideo.loop = true;
        uiVideo.autoplay = true;
        // Show the video element when marker is detected
        uiVideo.classList.add('visible');
        uiVideo.style.display = 'block';
      }
      
      loaded = true;
      
      // Function to play video - call it multiple times to ensure it plays
      const playVideo = () => {
        console.log(`Attempting to play video for ${a.name}`);
        if (videoEl) {
          // Ensure video is unmuted
          videoEl.muted = false;
          videoEl.play().catch(err => {
            console.warn(`Failed to play A-Frame video for ${a.name}:`, err);
            // If autoplay fails due to browser policy, try muted first then unmute
            if (err.name === 'NotAllowedError') {
              console.log('Autoplay blocked, trying muted first then unmuting...');
              videoEl.muted = true;
              videoEl.play().then(() => {
                // Unmute after play starts
                setTimeout(() => {
                  videoEl.muted = false;
                }, 100);
              }).catch(() => {});
            }
          });
        }
        if (uiVideo) {
          uiVideo.muted = false;
          uiVideo.play().catch(err => {
            console.warn(`Failed to play UI video for ${a.name}:`, err);
            // If autoplay fails, try muted first then unmute
            if (err.name === 'NotAllowedError') {
              uiVideo.muted = true;
              uiVideo.play().then(() => {
                setTimeout(() => {
                  uiVideo.muted = false;
                }, 100);
              }).catch(() => {});
            }
          });
        }
      };
      
      // Try to play immediately when marker is detected
      playVideo();
      
      // Also try when video can play
      videoEl.addEventListener('canplay', () => {
        console.log(`Video can play for ${a.name}`);
        playVideo();
      }, { once: true });
      
      // Also try when video has loaded data
      videoEl.addEventListener('loadeddata', () => {
        console.log(`Video loaded data for ${a.name}`);
        playVideo();
      }, { once: true });
      
      // Also try when video is ready to play
      videoEl.addEventListener('canplaythrough', () => {
        console.log(`Video can play through for ${a.name}`);
        playVideo();
      }, { once: true });
      
      // Fallback: try again after short delays
      setTimeout(() => {
        playVideo();
      }, 300);
      setTimeout(() => {
        playVideo();
      }, 800);
    } else if (loaded) {
      // Video already loaded, restart and play it when marker is re-detected
      console.log(`Re-visiting marker: ${a.name} - restarting video`);
      
      // Ensure video source is still set (might have been cleared on reload)
      if (videoEl && !videoEl.getAttribute('src')) {
        videoEl.setAttribute('src', a.videoUrl);
      }
      if (uiVideo && !uiVideo.src) {
        uiVideo.src = a.videoUrl;
      }
      
      // Function to restart and play video
      const restartVideo = () => {
        if (videoEl) {
          videoEl.muted = false; // Ensure unmuted
          videoEl.currentTime = 0; // Restart from beginning
          // Ensure video is loaded
          videoEl.load();
          videoEl.play().catch(err => {
            console.warn(`Failed to replay A-Frame video for ${a.name}:`, err);
            if (err.name === 'NotAllowedError') {
              videoEl.muted = true;
              videoEl.play().then(() => {
                setTimeout(() => { videoEl.muted = false; }, 100);
              }).catch(() => {});
            }
          });
        }
        if (uiVideo) {
          uiVideo.muted = false;
          uiVideo.currentTime = 0; // Restart from beginning
          // Show video when marker is detected again
          uiVideo.style.display = 'block';
          uiVideo.classList.add('visible');
          // Reload video to ensure it plays
          uiVideo.load();
          uiVideo.play().catch(err => {
            console.warn(`Failed to replay UI video for ${a.name}:`, err);
            if (err.name === 'NotAllowedError') {
              uiVideo.muted = true;
              uiVideo.play().then(() => {
                setTimeout(() => { uiVideo.muted = false; }, 100);
              }).catch(() => {});
            }
          });
        }
      };
      
      // Restart video immediately
      restartVideo();
      
      // Also try after a short delay to ensure it plays
      setTimeout(() => {
        restartVideo();
      }, 100);
      
      // Try again when video can play
      if (videoEl) {
        videoEl.addEventListener('canplay', () => {
          restartVideo();
        }, { once: true });
      }
      if (uiVideo) {
        uiVideo.addEventListener('canplay', () => {
          restartVideo();
        }, { once: true });
      }
    }
    
    // Record metrics
    window.EternityMetrics.recordAttractionView(a.id);
    
    // Store reference for potential UI updates
    attractionMap.set(a.id, a);
  });
  
  // When marker is lost (user moves camera away)
  markerEl.addEventListener('markerLost', () => {
    console.log(`Image marker lost: ${a.name}`);
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0; // Reset to beginning
    }
    if (uiVideo) {
      uiVideo.pause();
      uiVideo.currentTime = 0; // Reset to beginning
      // Hide video when marker is lost
      uiVideo.style.display = 'none';
      uiVideo.classList.remove('visible');
    }
  });

  markerEl.appendChild(plane);
  
  // Add marker to the scene with error handling
  if (nftRoot) {
    try {
      nftRoot.appendChild(markerEl);
      console.log(`✓ Added NFT marker to scene: ${a.name} (nftBaseUrl: ${nft})`);
    } catch (err) {
      console.error(`✗ Error adding NFT marker for ${a.name}:`, err);
      // Try alternative approach - add directly to scene
      try {
        const scene = document.querySelector('a-scene');
        if (scene) {
          scene.appendChild(markerEl);
          console.log(`✓ Added NFT marker directly to scene: ${a.name}`);
        }
      } catch (err2) {
        console.error(`✗ Failed to add NFT marker to scene:`, err2);
      }
    }
  } else {
    console.error(`✗ Failed to add NFT marker: nftRoot not found for ${a.name}`);
  }
}

// Initialize: Load all attractions from YAML and setup NFT markers
(async function init() {
  // Reset video elements first to ensure clean state
  resetVideoElements();
  
  // Wait for A-Frame scene to be ready
  const scene = document.querySelector('a-scene');
  if (!scene) {
    console.error('A-Frame scene not found');
    return;
  }
  
  // Function to initialize markers after scene is ready
  async function initializeMarkers() {
    try {
      console.log('A-Frame scene ready, initializing NFT markers...');
      
      // Load attractions data in parallel with AR.js initialization check
      const [attractions, arSystem] = await Promise.all([
        window.EternityData.loadAttractions(),
        (async () => {
          // Wait for AR.js to initialize - NFT markers need more time
          let system = null;
          let attempts = 0;
          while (!system && attempts < 15) {
            system = scene.systems['arjs'];
            if (!system) {
              await new Promise(resolve => setTimeout(resolve, 100));
              attempts++;
            }
          }
          return system;
        })()
      ]);
      
      if (arSystem) {
        console.log('AR.js system found and ready');
      } else {
        console.warn('AR.js system not found after waiting, but continuing anyway...');
      }
      
      // NFT markers need more time to initialize than regular markers
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check if nftRoot exists
      if (!nftRoot) {
        console.error('nftRoot element not found!');
        return;
      }
      
      console.log(`Loaded ${attractions.length} total attractions`);
      
      // Filter for attractions with valid NFT and video URLs (regardless of type)
      // This allows attractions with type: location or type: imageNFT to work
      const imageNFTAttractions = attractions.filter(a => 
        a.imageNFT && 
        a.imageNFT.nftBaseUrl && 
        a.videoUrl
      );
      
      console.log(`Found ${imageNFTAttractions.length} attractions with NFT markers:`, 
        imageNFTAttractions.map(a => `${a.name} (${a.id})`));
      
      if (imageNFTAttractions.length === 0) {
        console.warn('No attractions with NFT markers found in attractions.yaml');
        console.warn('Make sure attractions have imageNFT.nftBaseUrl and videoUrl fields');
        return;
      }
      
      // Setup NFT markers for each attraction dynamically
      imageNFTAttractions.forEach((attraction, index) => {
        console.log(`Setting up marker ${index + 1}/${imageNFTAttractions.length}: ${attraction.name}`);
        try {
          setupForAttraction(attraction);
        } catch (err) {
          console.error(`Error setting up marker for ${attraction.name}:`, err);
        }
      });
      
      // Give NFT markers time to load their descriptor files
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Successfully setup ${imageNFTAttractions.length} NFT markers`);
      console.log('Markers are ready. Point camera at trained images to see AR content.');
    } catch (e) {
      console.error('Error loading NFT image attractions from YAML:', e);
    }
  }
  
  // Wait for scene to be loaded
  const startInitialization = () => {
    // Debounce fullscreen function to prevent excessive calls
    let fullscreenTimeout = null;
    const ensureFullscreen = () => {
      if (fullscreenTimeout) return;
      fullscreenTimeout = setTimeout(() => {
        fullscreenTimeout = null;
      }, 50);
      
      // Get actual viewport dimensions - use screen size for mobile
      const vw = window.innerWidth || document.documentElement.clientWidth || screen.width;
      let vh = window.innerHeight || document.documentElement.clientHeight;
      
      // For mobile, use visual viewport if available
      if (window.visualViewport && window.visualViewport.height) {
        vh = Math.max(vh, window.visualViewport.height);
      }
      // Fallback to screen height
      if (vh < 100) {
        vh = screen.height;
      }
      
      // Ensure body and html are transparent and positioned
      document.body.style.background = 'transparent';
      document.body.style.backgroundColor = 'transparent';
      document.documentElement.style.background = 'transparent';
      document.documentElement.style.backgroundColor = 'transparent';
      
      const canvas = scene.canvas || scene.querySelector('canvas');
      if (canvas) {
        // Reset any transforms or positioning
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.right = '0';
        canvas.style.bottom = '0';
        canvas.style.margin = '0';
        canvas.style.padding = '0';
        canvas.style.width = vw + 'px';
        canvas.style.height = vh + 'px';
        canvas.style.maxWidth = vw + 'px';
        canvas.style.minWidth = vw + 'px';
        canvas.style.transform = 'none';
        canvas.style.transformOrigin = 'center center';
        canvas.style.background = 'transparent';
        canvas.style.backgroundColor = 'transparent';
        canvas.width = vw;
        canvas.height = vh;
      }
      
      // Ensure AR.js video is fullscreen and centered
      const arVideo = scene.querySelector('video');
      if (arVideo && arVideo !== uiVideo) {
        arVideo.style.position = 'fixed';
        arVideo.style.top = '0';
        arVideo.style.left = '0';
        arVideo.style.right = '0';
        arVideo.style.bottom = '0';
        arVideo.style.margin = '0';
        arVideo.style.padding = '0';
        arVideo.style.width = vw + 'px';
        arVideo.style.height = vh + 'px';
        arVideo.style.maxWidth = vw + 'px';
        arVideo.style.minWidth = vw + 'px';
        arVideo.style.transform = 'none';
        arVideo.style.transformOrigin = 'center center';
        arVideo.style.background = 'transparent';
        arVideo.style.backgroundColor = 'transparent';
      }
      
      // Also ensure scene element is positioned correctly
      scene.style.position = 'fixed';
      scene.style.top = '0';
      scene.style.left = '0';
      scene.style.right = '0';
      scene.style.bottom = '0';
      scene.style.margin = '0';
      scene.style.padding = '0';
      scene.style.width = vw + 'px';
      scene.style.height = vh + 'px';
      scene.style.background = 'transparent';
      scene.style.backgroundColor = 'transparent';
      scene.style.transform = 'none';
      
      // Also check for .a-canvas container
      const aCanvas = scene.querySelector('.a-canvas');
      if (aCanvas) {
        aCanvas.style.position = 'fixed';
        aCanvas.style.top = '0';
        aCanvas.style.left = '0';
        aCanvas.style.right = '0';
        aCanvas.style.bottom = '0';
        aCanvas.style.margin = '0';
        aCanvas.style.padding = '0';
        aCanvas.style.width = vw + 'px';
        aCanvas.style.height = vh + 'px';
        aCanvas.style.transform = 'none';
        aCanvas.style.background = 'transparent';
        aCanvas.style.backgroundColor = 'transparent';
      }
    };
    
    // Ensure fullscreen immediately
    ensureFullscreen();
    
    // Debounced resize handler
    let resizeTimeout = null;
    window.addEventListener('resize', () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(ensureFullscreen, 100);
    });
    
    // Also ensure fullscreen after scene renders (once)
    scene.addEventListener('renderstart', () => {
      ensureFullscreen();
      setTimeout(ensureFullscreen, 200);
    }, { once: true });
    
    // Reduced delayed fullscreen checks - only essential ones
    setTimeout(ensureFullscreen, 100);
    setTimeout(ensureFullscreen, 500);
    
    // Handle orientation change (debounced)
    let orientationTimeout = null;
    window.addEventListener('orientationchange', () => {
      if (orientationTimeout) clearTimeout(orientationTimeout);
      orientationTimeout = setTimeout(() => {
        ensureFullscreen();
      }, 200);
    });
    
    // Handle visual viewport changes (mobile browsers) - debounced
    if (window.visualViewport) {
      let viewportTimeout = null;
      window.visualViewport.addEventListener('resize', () => {
        if (viewportTimeout) clearTimeout(viewportTimeout);
        viewportTimeout = setTimeout(ensureFullscreen, 100);
      });
    }
    
    // Initialize markers after a short delay to ensure AR.js is fully ready
    setTimeout(() => {
      initializeMarkers();
    }, 200);
  };
  
  if (scene.hasLoaded) {
    startInitialization();
  } else {
    scene.addEventListener('loaded', startInitialization, { once: true });
  }
})();

// Stop all videos when back button is clicked
(function() {
  const backButton = document.querySelector('a.btn[href*="index.html"]');
  if (backButton) {
    backButton.addEventListener('click', function(e) {
      // Stop UI video
      if (uiVideo) {
        uiVideo.pause();
        uiVideo.currentTime = 0;
        uiVideo.src = '';
        uiVideo.style.display = 'none';
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
        
        // Also stop videos in a-assets
        const assets = scene.querySelector('a-assets');
        if (assets) {
          const assetVideos = assets.querySelectorAll('video');
          assetVideos.forEach(video => {
            video.pause();
            video.currentTime = 0;
            if (video.hasAttribute('src')) {
              video.setAttribute('src', '');
            }
          });
        }
      }
      
      // Allow navigation to proceed
      // Navigation will happen via href
    });
  }
})();


