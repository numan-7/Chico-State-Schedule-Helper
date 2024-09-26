// container div 
const createContainer = () => {
  const container = document.createElement('div');
  container.classList.add('container');
  container.style.display = 'flex';
  container.style.position = 'relative';
  return container;
};

// the popup div 
const createHiddenDiv = (difficulty) => {
  const hiddenDiv = document.createElement('div');
  hiddenDiv.classList.add('hiddenDiv');
  hiddenDiv.setAttribute('id', 'hiddenDiv')
  hiddenDiv.style.display = 'none';
  hiddenDiv.style.fontFamily = "'Poppins', sans-serif";
  hiddenDiv.style.padding = '5px';
  hiddenDiv.style.width = '215px';
  hiddenDiv.style.background = '#ffffff';
  hiddenDiv.style.borderRadius = '5px';
  hiddenDiv.style.border = '1px solid black';
  hiddenDiv.style.height = '140px';
  hiddenDiv.style.position = 'absolute';
  hiddenDiv.style.top = '-150px';
  hiddenDiv.style.left = '-81px';
  hiddenDiv.style.zIndex = '99999';

  hiddenDiv.innerHTML = `
    <span class = "thingy" style="position: relative; text-transform: uppercase;">
      <span style = "font-weight: 900; font-size: 1.55rem;">${difficulty.avgRating}</span>
      <span style = "color: grey; font-weight: 700; font-size: .55rem; position: absolute; right: -15px; top: -3px;"> / 5</span>
    </span>
    <br/>
    <div style = "margin-top: -5px; font-weight: 800; font-size: .65rem;">Overall Quality Based on <u>${difficulty.numRatings} ratings</u></div>
    <div class="titleBar" style="overflow: hidden; margin-top: -5px; font-family: 'Poppins', sans-serif; display: flex; justify-content: space-between; width: 100%;">
          <span style="font-size: 1.55rem; font-weight: 800; overflow: hidden; text-overflow: ellipsis;  white-space: nowrap;">${difficulty.firstName + ' ' + difficulty.lastName}</span>
    </div>
    <div style=" font-size: .85rem; font-family: 'Poppins', sans-serif; display: flex; justify-content: space-between; flex-direction: row;">
      <div style = "font-size: 1.2rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <span>${Math.ceil(difficulty.wouldTakeAgainPercent)}%</span>
          <span style = "color: grey; font-size: .6rem; font-weight: 400;">Would Take again</span>
      </div>
      <div style = "font-size: 1.2rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <span>${difficulty.avgDifficulty}</span>
          <span style = "color: grey; font-size: .6rem; font-weight: 400;">Level of Difficulty</span>
      </div>
    </div>
  `;
  return hiddenDiv;
};

// save button 
const saveButton = (difficulty, Newstyles) => {
const button = document.createElement('button');
button.setAttribute('data-avgDifficulty', difficulty.avgDifficulty);
button.setAttribute('data-percent', Math.ceil(difficulty.wouldTakeAgainPercent));
button.setAttribute('data-avgRating', difficulty.avgRating);
button.setAttribute('data-numRatings',difficulty.numRatings);
button.setAttribute('data-name', difficulty.firstName + ' ' + difficulty.lastName);
button.setAttribute('data-id', difficulty.id);
button.classList.add(difficulty.id);
button.style = Newstyles;
button.style.width = '25px';
button.style.letterSpacing = '';
button.style.textAlign = '';
button.style.display = 'flex';
button.style.justifyContent = 'center';
button.style.alignItems = 'center';
button.style.borderBottomRightRadius = '5px';
button.style.marginLeft = '0px';
button.style.borderLeft = '0';
const imageUrl = chrome.runtime.getURL("imgs/save.svg");
const img = document.createElement('img');
img.src = imageUrl;
img.style.cssText = "pointer-events: none; opacity: 100%; height: 20px; width: 20px;";
button.insertAdjacentElement('beforeend', img);
return button;
};


// button by proffesor's name
const createButton = (difficulty, Newstyles) => {
  const button = document.createElement('button');
  button.classList.add('rmpBtn');
  button.style = Newstyles;
  button.style.borderTopLeftRadius = '5px';
  button.innerText = difficulty.avgRating;
  return button;
};

// if someone hovers the button open up the popup
const addEventListeners = (button, hiddenDiv, profID, sButton) => {
  button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.03)';
      button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      hiddenDiv.style.display = 'block';
  });

  button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = ''
      hiddenDiv.style.display = 'none';
  });

  button.addEventListener('click', () => {
      const profURL = `https://www.ratemyprofessors.com/professor/${profID}`;
      window.open(profURL, '_blank');
  })

  sButton.addEventListener('mouseenter', () => {
    sButton.style.transform = 'scale(1.03)';
    sButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  });

  sButton.addEventListener('mouseleave', () => {
    sButton.style.transform = 'scale(1)';
    sButton.style.boxShadow = ''
  });

  sButton.addEventListener('click', (e) => {
    // Get button from event
    const button = e.target;
    // Disable all buttons associated with that professor
    const iframe = document.getElementById('main_iframe') || document.getElementById('ptifrmtgtframe');
    if (!iframe) {
      return;
    }
    let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    const elements = iframeDocument.getElementsByClassName(button.getAttribute('data-id'));
    Array.from(elements).forEach(saveButton => {
      saveButton.disabled = true;
      saveButton.style.opacity = '0.5';
      saveButton.style.cursor = 'not-allowed';
    })
  
    // Create an object with all data attributes
    const newData = {
      avgDifficulty: button.getAttribute('data-avgDifficulty'),
      percent: button.getAttribute('data-percent'),
      avgRating: button.getAttribute('data-avgRating'),
      numRatings: button.getAttribute('data-numRatings'),
      name: button.getAttribute('data-name'),
      id: button.getAttribute('data-id'),
      profID: profID
    };
  
    // The general key for storing the array of button data
    const storageKey = 'buttonsData';
    // Retrieve current array from storage and update it
    chrome.storage.sync.get([storageKey], (result) => {
      let buttonsData = result[storageKey] ? JSON.parse(result[storageKey]) : [];
      // Check if the newData is already in the array to avoid duplicates
      if (!buttonsData.some(buttonData => buttonData.id === newData.id)) {
        buttonsData.push(newData);
        // Update the storage with the new array
        chrome.storage.sync.set({ [storageKey]: JSON.stringify(buttonsData) });
      }
    });
  });
  
};


export {addEventListeners, createButton, createContainer, createHiddenDiv, saveButton}