// Chico State's ID on Rate my Professor
const chicoID = 'U2Nob29sLTE1OQ==';

let styles =
  'border-radius: 5px; letter-spacing: 2px; margin-left: 3px; padding: 1px 12px; font-style: inherit; font-weight: bold; cursor: pointer;';
const goodStyle =
  'background: #ECFDF5; border: 1px solid #047857; color: #047857;';
const okStyle =
  'background: #FFFBEB; border: 1px solid #FBBF24; color: #FBBF24;';
const badStyle =
  'background: #FEF2F2; border: 1px solid #F87171; color: #F87171;';

// get's teacher info, only looking at the id from this 
const getTeacherInfo = async (profName) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(
        { action: 'teacherInfo', profName: profName },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        }
      );
    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
};

// gets the teacher's ratings and all that
const getTeacherRating = async (profID) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(
        { action: 'teacherRating', profID: profID },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        }
      );
    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
};

const getProfInfo = async (profName) => {
  // get teacher's info, just looking for the id
  const teacherInfo = await getTeacherInfo(profName);
  // if a teacher is found
  if (teacherInfo.teacher.length > 0) {
    // using that teacher's id, return the teachers rating
    const teacherRating = await getTeacherRating(teacherInfo.teacher[0].id);
    return teacherRating.rating;
  } else {
    // teacher not found
    return null;
  }
};

// container div 
const createContainer = () => {
  const container = document.createElement('div');
  container.classList.add('container');
  container.style.flexDirection = 'column';
  container.style.position = 'relative';
  container.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,200;0,400;0,700;1,400;1,700&display=swap');
    </style>
  `;
  return container;
};

// the popup div 
const createHiddenDiv = (difficulty) => {
  const hiddenDiv = document.createElement('div');
  hiddenDiv.classList.add('hiddenDiv');
  hiddenDiv.setAttribute('id', 'hiddenDiv')
  hiddenDiv.style.display = 'none';
  hiddenDiv.style.padding = '2px';
  hiddenDiv.style.width = '100%';
  hiddenDiv.style.borderRadius = '5px';
  hiddenDiv.style.background =
    difficulty.avgRating >= 4
      ? '#ECFDF5'
      : difficulty.avgRating >= 3
      ? '#FFFBEB'
      : '#FEF2F2';
  hiddenDiv.style.border =
    difficulty.avgRating >= 4
      ? '1px solid #047857'
      : difficulty.avgRating >= 3
      ? '1px solid #FBBF24'
      : '1px solid #F87171';
  hiddenDiv.style.width = '250px';
  hiddenDiv.style.height = '150px';
  hiddenDiv.style.position = 'absolute';
  hiddenDiv.style.top = '-175px';
  hiddenDiv.style.left = '-90px';
  hiddenDiv.style.overflow = 'auto';
  hiddenDiv.style.zIndex = '99999';

  hiddenDiv.innerHTML = `
      <div class = "titleBar" style="font-family: 'Poppins', sans-serif; display: flex; justify-content: space-between; width: 100%;">
          <span><a href = "https://www.ratemyprofessors.com/professor/${
            difficulty.legacyId
          }" target = "_blank" ">${
    difficulty.firstName + ' ' + difficulty.lastName
  }</a></span>
          <span class="closeBtn"><strong>X</strong></span>
      </div>
      <hr style="margin-top: 1px; color: black;" />
      <div style="font-size: .85rem; font-family: 'Poppins', sans-serif; display: flex; flex-direction: column;">
          <span style = "text-transform: uppercase;"><strong style = "font-size: 1.15rem;" >${
            difficulty.numRatings
          }</strong> total ratings</span>
          <span style = "text-transform: uppercase;"><strong style = "font-size: 1.15rem;" >${
            difficulty.avgRating
          }</strong> average rating</span>
          <span style = "text-transform: uppercase;"><strong style = "font-size: 1.15rem;" >${
            difficulty.avgDifficulty
          }</strong> average difficulty</span>
          <span style = "text-transform: uppercase;"><strong style = "font-size: 1.15rem;" >${
            difficulty.wouldTakeAgainPercent
          }%</strong> would take again </span>
      </div>
  `;
  // from: https://www.w3schools.com/howto/howto_js_draggable.asp
  dragElement(hiddenDiv);
  return hiddenDiv;
};

function dragElement(elmnt) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const titleBar = elmnt.querySelector('.titleBar');
  const iframe = document.getElementById('main_iframe');
  const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

  titleBar.addEventListener('mousedown', (e) => dragMouseDown(e, iframeDocument));

  function dragMouseDown(e, iframeDocument) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    iframeDocument.addEventListener('mouseup', closeDragElement);
    iframeDocument.addEventListener('mousemove', elementDrag);
  }

  function elementDrag(e) {
    e.preventDefault();
    console.log("dragging and all that");
    // Calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // Stop moving when the mouse button is released:
    iframeDocument.removeEventListener('mouseup', closeDragElement);
    iframeDocument.removeEventListener('mousemove', elementDrag);
  }
}


// button by proffesor's name
const createButton = (difficulty, Newstyles) => {
  const button = document.createElement('button');
  button.classList.add('rmpBtn');
  button.style = Newstyles;
  button.innerText = difficulty.avgRating;
  return button;
};

// if someone clicks the button open up the popup
const addEventListeners = (button, hiddenDiv) => {
  button.addEventListener('click', () => {
    hiddenDiv.style.display = 'block';
  });

  // if someone clicks the hidden div close button, hide it
  hiddenDiv.querySelector('.closeBtn').addEventListener('click', () => {
    hiddenDiv.style.display = 'none';
  });
};

const getProfNames = async () => {
  // all classes that get inserted in are in an iframe...so i have to get the iframe content 
  const iframe = document.getElementById('main_iframe');
  // if iframe
  if (iframe) {
    // get the document inside the iframe so i can query it
    let iframeDocument =
      iframe.contentDocument || iframe.contentWindow.document;
    // get all the a tags with that class, which is only the professor name a tag
    let anchorElements = iframeDocument.getElementsByClassName(
      'MuiLink-underlineHover'
    );
    // same thing as above ngl lol
    let profNames = iframeDocument.querySelectorAll(
      'a.MuiTypography-root.MuiLink-root.MuiLink-underlineHover.d-inline.MuiTypography-body1.MuiTypography-colorPrimary'
    );
    // if found
    if (anchorElements.length > 0) {
      // create an array out of the a tags
      let anchorArray = Array.from(anchorElements);
      let nameArray = [];
      // push an object that contains each professor's name from each a tag's text content
      anchorArray.forEach((anchorElement) => {
        nameArray.push({ profName: anchorElement.textContent });
      });
      // for each professor, create the rating button/popup
      profNames.forEach(async (prof, i) => {
        if (!prof.parentNode.classList.contains('prof-rating')) {
          // going to insert the button inside the parent div of the professor a tag
          let parentElement = prof.parentNode.parentNode.parentNode;
          // get all the info
          const difficulty = await getProfInfo(nameArray[i].profName);
          // create create create
          if (difficulty != null && difficulty.wouldTakeAgainPercent != -1) {
            let Newstyles =
              difficulty.avgRating >= 4
                ? styles + goodStyle
                : difficulty.avgRating >= 3
                ? styles + okStyle
                : styles + badStyle;

            const container = createContainer();
            const hiddenDiv = createHiddenDiv(difficulty);
            const button = createButton(difficulty, Newstyles);

            container.appendChild(hiddenDiv);
            container.appendChild(button);
            parentElement.appendChild(container);

            addEventListeners(button, hiddenDiv);
            prof.parentNode.classList.add('prof-rating');
          }
        }
      });
    }
  } else {
    console.log('Iframe with ID "main_iframe" not found.');
  }
};

// Wait for the user to click the button
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'startSearchInContentScript') {
    await getProfNames();
  }
});