'use strict';
import ratings from '@mtucourses/rate-my-professors';

/*

  This is the background script that handles all the API calls since background scripts are the only files that are allowed to make API calls.

*/

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.request === 'startSearch') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id;
      chrome.tabs.sendMessage(activeTabId, { action: 'startSearchInContentScript' });
    });
  } else if(request.action === 'renableButton') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id;
      chrome.tabs.sendMessage(activeTabId, { 
        action: 'enableButton', 
        profId: request.profId
      });
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
  } else if (request.action === 'updatePopup') {
  }
});