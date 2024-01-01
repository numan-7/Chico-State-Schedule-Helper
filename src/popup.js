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
  