document.getElementById('startButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({ request: 'startSearch' });
    document.getElementById('btn-span').textContent = 'searching...';
    document.getElementById('startButton').disabled = true;
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'updatePopup') {  
    document.getElementById('btn-span').textContent = 'get ratings';
    document.getElementById('startButton').disabled = false;
  }
});


chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
  const tabUrl = tab[0].url;
  if (!tabUrl.includes("csuchico")) {
    document.getElementById('startButton').disabled = true;
    document.getElementById('startButton').innerHTML = '<span id = "error">Navigate to CSUC Portal</span>';
  }
});
