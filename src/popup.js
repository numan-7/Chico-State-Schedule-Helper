document.getElementById('startButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({ request: 'startSearch' });
});
  