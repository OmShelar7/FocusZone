(function() {
  // Overlay elements for focus mode
  // Removed the top overlay as per your request
  // const topOverlay = document.createElement('div'); // This line is commented out now
  const bottomOverlay = document.createElement('div');
  bottomOverlay.id = 'focus-bottom-overlay';
  const leftOverlay = document.createElement('div');
  leftOverlay.id = 'focus-left-overlay';
  const rightOverlay = document.createElement('div');
  rightOverlay.id = 'focus-right-overlay';

  document.body.appendChild(bottomOverlay); // Append only bottom, left, and right overlays
  document.body.appendChild(leftOverlay);
  document.body.appendChild(rightOverlay);

  let isPiPActive = false;

  function updateOverlay() {
    chrome.storage.local.get('focusModeEnabled', (data) => {
      const path = window.location.pathname;
      const isHomePage = path === '/' || path.startsWith('/feed');
      const isSearchPage = path.startsWith('/results');
      const video = document.querySelector('video');
      const searchForm = document.querySelector('#search-form');

      // Hide overlays on the homepage, search results page, or if focus mode is disabled
      if (isHomePage || isSearchPage || !data.focusModeEnabled) {
        hideOverlays();
        return;
      }

      if (video && searchForm) {
        const rect = video.getBoundingClientRect();
        const searchBarHeight = searchForm.offsetHeight;

        // Adjust overlays based on video position
        // Removed topOverlay logic since it's commented out
        bottomOverlay.style.top = `${rect.bottom}px`;
        bottomOverlay.style.height = `calc(100% - ${rect.bottom}px)`;
        bottomOverlay.style.width = '100%';

        leftOverlay.style.top = `${rect.top}px`;
        leftOverlay.style.height = `${rect.height}px`;
        leftOverlay.style.width = `${rect.left}px`;

        rightOverlay.style.top = `${rect.top}px`;
        rightOverlay.style.height = `${rect.height}px`;
        rightOverlay.style.left = `${rect.right}px`;
        rightOverlay.style.width = `calc(100% - ${rect.right}px)`;

        showOverlays();
      } else {
        hideOverlays();
      }
    });
  }

  function hideOverlays() {
    bottomOverlay.style.display = 'none';
    leftOverlay.style.display = 'none';
    rightOverlay.style.display = 'none';
  }

  function showOverlays() {
    bottomOverlay.style.display = 'block';
    leftOverlay.style.display = 'block';
    rightOverlay.style.display = 'block';
  }

  // Listen for fullscreen change events
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      // If entering fullscreen, hide overlays
      hideOverlays();
    } else {
      // If exiting fullscreen, update overlays
      updateOverlay();
    }
  });

  // MutationObserver to detect new video elements
  const observer = new MutationObserver(() => {
    const video = document.querySelector('video');
    if (video) {
      updateOverlay();  // Re-check overlays when a video is detected
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Handle page navigation
  window.addEventListener('yt-navigate-finish', updateOverlay);

  // Initialize everything
  function initialize() {
    updateOverlay();

    window.addEventListener('resize', updateOverlay);
    document.addEventListener('play', updateOverlay, true);
    document.addEventListener('pause', updateOverlay, true);
    document.addEventListener('seeked', updateOverlay, true);
  }

  // Function to toggle Picture-in-Picture mode
  async function togglePiP() {
    const video = document.querySelector('video');
    if (!video) {
      console.error("No video found on the page.");
      return;
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture(); // Exit PiP if it's already active
      } else {
        await video.requestPictureInPicture(); // Activate PiP
      }
    } catch (error) {
      console.error('Error with Picture-in-Picture:', error);
    }
  }

  // Listen for the keyboard shortcut: Ctrl + Shift + Z
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyZ') {
      togglePiP();  // Call the toggle function
    }
  });

  // Run the initialize function
  initialize();
})();
