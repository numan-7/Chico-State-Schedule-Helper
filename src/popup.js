/*

  This JS file is associated with the popup that appears when the extension icon is clicked.

*/

// Adds a click event listener to the 'startButton' in the popup
document.getElementById('startButton').addEventListener('click', () => {
  // Sends a message to the background script to initiate the search
  chrome.runtime.sendMessage({
      request: 'startSearch'
  });

  // Updates Button Text
  document.getElementById('btn-span').textContent = 'searching...';
  document.getElementById('startButton').disabled = true;
});

// Listens for messages from the content script that the search is done
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'updatePopup') {
      // Updates Button Text
      document.getElementById('btn-span').textContent = 'get ratings';
      document.getElementById('startButton').disabled = false;
  }
});

// Checks if the current tab's URL contains "csuchico"
chrome.tabs.query({
  active: true,
  currentWindow: true
}, function(tab) {
  const tabUrl = tab[0].url;

  // Disables the startButton and displays an error message if not on the CSUC Portal
  if (!tabUrl.includes("csuchico")) {
      document.getElementById('startButton').disabled = true;
      document.getElementById('startButton').innerHTML = '<span id = "error">Navigate to CSUC Portal</span>';
  }
});