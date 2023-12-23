'use strict';
import ratings from '@mtucourses/rate-my-professors';
// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'teacherInfo') {
    (async () => {
      try {
        const schools = await ratings.searchTeacher('herring', 'U2Nob29sLTE1OQ==');
        sendResponse({
          schools
        });
      } catch (error) {
        console.error('Error:', error);
        sendResponse({
          error: 'An error occurred while searching for schools.',
        });
      }
    })();
    return true;
  }
});

