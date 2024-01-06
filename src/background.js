'use strict';
import ratings from '@mtucourses/rate-my-professors';
// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.request === 'startSearch') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id;
      chrome.tabs.sendMessage(activeTabId, { action: 'startSearchInContentScript' });
    });
  } else if (request.action === 'teacherInfo') {
    (async () => {
      try {
        const teacher = await ratings.searchTeacher(`${request.profName}`, 'U2Nob29sLTE1OQ==');
        sendResponse({
          teacher
        });
      } catch (error) {
        sendResponse({
          error: error,
        });
      }
    })();
    return true;
  } else if (request.action === 'teacherRating') {
    (async () => {
      try {
        const rating = await ratings.getTeacher(`${request.profID}`);
        sendResponse({
          rating
        });
      } catch (error) {
        sendResponse({
          error: error,
        });
      }
    })();
    return true;  
  }
});