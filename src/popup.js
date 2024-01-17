/*

  This JS file is associated with the popup that appears when the extension icon is clicked.

*/

const savedWrapper = document.getElementById('savedWrapper')

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
    document.getElementById('startButton').innerHTML = '<span id = "error">navigate to csuc portal</span>';
  }
});

const handleDelete = (eventData) => {
  // Get the id of the item to be deleted
  const deleteId = eventData.target.getAttribute('data-id');
  // Get the existing data from storage
  chrome.storage.sync.get('buttonsData', function(data) {
    if (data.buttonsData) {
      let buttonsData = JSON.parse(data.buttonsData);
      // Filter out the item to be deleted
      buttonsData = buttonsData.filter(item => item.id !== deleteId);
      // Update local storage
      chrome.storage.sync.set({
        'buttonsData': JSON.stringify(buttonsData)
      }, function() {
        console.log('Data updated after deletion');
      });
      // Update the displayed list
      renderList(buttonsData);
    }
  });
};

const renderList = (buttonsData) => {
  savedWrapper.innerHTML = '';
  if (!buttonsData.length) {
    savedWrapper.innerHTML = `
      <div class="empty">
          <img style="opacity: 75%; height: 100px; width: 100px;" src="./imgs/save.svg" />
          <span style="font-weight: 400; color: grey; text-align: center;">save ratings by clicking the save icon next to the rating button!</span>
      </div>
      `;
    return;
  }

  buttonsData.forEach(profData => {
    savedWrapper.innerHTML += `
        <div style = "margin-bottom: 5px; background: #ffffff; border: 1px solid black; width: 100%; padding: 5px; border-radius: 5px;">
          <div class="titleBar" style="overflow: hidden; margin-top: -5px; font-family: 'Poppins', sans-serif; position: relative; display: flex; width: 100%;">
          <span style="position: relative; font-weight: 900; font-size: 1.35rem;">
          ${profData.avgRating} 
            <span style="position: absolute; top: 7px; color: grey; font-weight: 700; font-size: .55rem;">
              /5 
            </span>
          </span>  
          <span id = "delete" data-id = "${profData.id}" style = "position: absolute; right: 0px; ">X</span>
          </div>
          <div style="margin-top: -5px; margin-bottom: -5px; font-weight: 800; font-size: .65rem;">Overall Quality Based on <u>${profData.numRatings} ratings</u></div>
          <span class = "name" style="font-size: 1.35rem; font-weight: 900; overflow: hidden; text-overflow: ellipsis;  white-space: nowrap;">
          <a href = "https://www.ratemyprofessors.com/professor/${profData.profID}" target="_blank">${profData.name}</a>:&nbsp;
        </span>
          <div style=" font-size: .85rem; font-family: 'Poppins', sans-serif; display: flex; flex-direction: row; justify-content: space-between;">
            <div style="font-size: 1.1rem; font-weight: 900; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <span style="font-weight: 900;">${profData.percent}%</span>
              <span style="text-align: center; color: grey; font-size: .6rem; font-weight: 400;">Would Take again</span>
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <span style="font-weight: 900;">${profData.avgDifficulty}</span>
              <span style="text-align: center; color: grey; font-size: .6rem; font-weight: 400;">Level of Difficulty</span>
            </div>
          </div>
        </div>
      `;
  });
};

chrome.storage.sync.get(null, function(items) {
  if (Object.keys(items).length === 0) {
    savedWrapper.innerHTML = `
      <div class="empty">
          <img style="opacity: 75%; height: 100px; width: 100px;" src="./imgs/save.svg" />
          <span style="font-weight: 400; color: grey; text-align: center;">save ratings by clicking the save icon next to the rating button!</span>
      </div>
      `
  } else {
    for (let key in items) {
      if (key === 'buttonsData') {
        let buttonsData = JSON.parse(items[key]);
        renderList(buttonsData);
      }
    }
  }
});

savedWrapper.addEventListener("click", function(e) {
  if (e.target && e.target.id === "delete") {
    chrome.runtime.sendMessage({
      action: 'renableButton',
      profId: e.target.getAttribute('data-id')
    })
    handleDelete(e);
  }
});