/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/popup.js ***!
  \**********************/
document.getElementById('startButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({ request: 'startSearch' });
    document.getElementById('btn-span').textContent = 'searching...';
    document.getElementById('startButton').disabled = true;
    setTimeout(() => {
        document.getElementById('startButton').disabled = false;
        document.getElementById('btn-span').textContent = 'get ratings';
    }, 2500)
});
  
/******/ })()
;
//# sourceMappingURL=popup.js.map