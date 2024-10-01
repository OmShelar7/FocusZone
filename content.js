(function() {
  // Overlay elements for focus mode
  const topOverlay = document.createElement('div');
  //topOverlay.id = 'focus-top-overlay';..............................REMOVED THE TOP OVERLAY.
  const bottomOverlay = document.createElement('div');
  bottomOverlay.id = 'focus-bottom-overlay';
  const leftOverlay = document.createElement('div');
  leftOverlay.id = 'focus-left-overlay';
  const rightOverlay = document.createElement('div');
  rightOverlay.id = 'focus-right-overlay';

  document.body.appendChild(topOverlay);
  document.body.appendChild(bottomOverlay);
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

        // Set the overlays, ensuring they start below the search bar
        topOverlay.style.top = `${searchBarHeight}px`; // Start just below the search bar
        topOverlay.style.height = `${rect.top - searchBarHeight}px`; // Height from search bar to video
        topOverlay.style.width = '100%';

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
    topOverlay.style.display = 'none';
    bottomOverlay.style.display = 'none';
    leftOverlay.style.display = 'none';
    rightOverlay.style.display = 'none';
  }

  function showOverlays() {
    topOverlay.style.display = 'block';
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

  initialize();
})();
