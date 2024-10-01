// background.js

// Listen for the command from the manifest
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-pip") {
      // Query the active tab in the current window
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Execute the script in the active tab
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id }, // Get the active tab's ID
          function: togglePictureInPicture // Call the PiP toggle function
        });
      });
    }
  });
  
  // Function to toggle Picture-in-Picture mode
  function togglePictureInPicture() {
    const video = document.querySelector('video'); // Select the video element
    if (!video) {
      console.error("No video found on the page."); // Log error if no video is found
      return;
    }
  
    // Check if PiP is already active
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture() // Exit PiP if it's active
        .catch(error => console.error('Error exiting PiP:', error));
    } else {
      video.requestPictureInPicture() // Activate PiP if it's not active
        .catch(error => console.error('Error requesting PiP:', error));
    }
  }
  