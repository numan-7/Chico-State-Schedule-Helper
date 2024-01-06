// Chico State's ID on Rate my Professor
const chicoID = 'U2Nob29sLTE1OQ==';

let styles =
  'font-family: "Poppins", sans-serif; border-radius: 5px; letter-spacing: 2px; margin-left: 3px; width: 50px; font-weight: bold; cursor: pointer;';
  const goodStyle =
  'background: #ECFDF5; border: 1px solid #008964; color: #047857;';
const okStyle =
  'background: #FFFBEB; border: 1px solid #FFC524; color: #FBBF24;';
const badStyle =
  'background: #FEF2F2; border: 1px solid #FF7676; color: #F87171;';

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
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;700;800;900&display=swap');
      .thingy:after {
        content:'';
        position: absolute;
        top: 116px;
        right: 0;
        left: 81px;
        margin: 0 auto;
        width: 0;
        height: 0;
        border-top: solid 10px rgb(0,0,0,.25);
        border-left: solid 10px transparent;
        border-right: solid 10px transparent;     
      }
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
  hiddenDiv.style.fontFamily = "'Poppins', sans-serif";
  hiddenDiv.style.padding = '5px';
  hiddenDiv.style.width = '210px';
  hiddenDiv.style.background = '#ffffff';
  hiddenDiv.style.borderRadius = '5px';
  hiddenDiv.style.border =
    difficulty.avgRating >= 4
      ? '1px solid #03654B'
      : difficulty.avgRating >= 3
      ? '1px solid #EBB521'
      : '1px solid #EE5F5F';
  hiddenDiv.style.height = '120px';
  hiddenDiv.style.position = 'absolute';
  hiddenDiv.style.top = '-145px';
  hiddenDiv.style.left = '-70px';
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


// button by proffesor's name
const createButton = (difficulty, Newstyles) => {
  const button = document.createElement('button');
  button.classList.add('rmpBtn');
  button.style = Newstyles;
  button.innerText = difficulty.avgRating;
  return button;
};

// if someone clicks the button open up the popup
const addEventListeners = (button, hiddenDiv, profID) => {
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.02)';
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
};

const getProfNames = async () => {
  // return a promise, so i can signal it's done to renable button later
  return new Promise(async (resolve) => {
    // all classes that get inserted in are in an iframe...so I have to get the iframe content 
    const iframe = document.getElementById('main_iframe') || document.getElementById('ptifrmtgtframe');
    // if iframe
    if (iframe) {
      let version = 0;
      // get the document inside the iframe so I can query it
      let iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;
      // get all the a tags with that class, which is only the professor name a tag
      let anchorElements = iframeDocument.getElementsByClassName(
        'MuiLink-underlineHover'
      );

      if(!anchorElements.length) {
        // signal that we're on schedule builder section page ^-^
        version = 1;
        anchorElements = Array.from(iframeDocument.querySelectorAll("div.cx-MuiGrid-root.px-1.d-flex.css-t8n52r.cx-MuiGrid-item.cx-MuiGrid-zeroMinWidth.cx-MuiGrid-grid-xs-4"))
          .filter((div, i) => i % 5 === 0 && div !== undefined);
        // need to get a node list to convert the array back into a node list
        const nodeList = document.querySelectorAll("meoooooowwwwwwwwwwwwwwww");
        // now just turn the node list which we turned into an array back into a node list...
        anchorElements.forEach((element) => {
          nodeList.forEach((node) => node.appendChild(element.cloneNode(true)));
        });
      }

      // if found
      if (anchorElements.length > 0) {
        // create an array out of the a tags
        let anchorArray = Array.from(anchorElements);
        let nameArray = [];
        // push an object that contains each professor's name from each a tag's text content
        anchorArray.forEach((anchorElement) => {
          nameArray.push({ profName: anchorElement.textContent });
        });
        // processes each professor by creating an array from anchorElements and then waits for all results to be resolved
        await Promise.all(Array.from(anchorElements).map(async (prof, i) => {
          if (!prof.parentNode.classList.contains('prof-rating')) {
            // going to insert the button inside the parent div of the professor a tag
            let parentElement = version == 0 ? prof.parentNode.parentNode.parentNode : prof;
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
              let hiddenDiv = createHiddenDiv(difficulty);
              version == 1 ? hiddenDiv.style.height = '134px' : '';
              const button = createButton(difficulty, Newstyles);

              container.appendChild(hiddenDiv);
              container.appendChild(button);
              parentElement.appendChild(container);

              addEventListeners(button, hiddenDiv, difficulty.legacyId);
              prof.parentNode.classList.add('prof-rating');
            }
          }
        }));
        resolve();
      }
    } else {
      console.error('Iframe with ID "main_iframe" not found.');
    }
  });
};

// Wait for the user to click the button
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'startSearchInContentScript') {
    await getProfNames();
    // indicate to user that searching is done
    chrome.runtime.sendMessage({action: 'updatePopup'});
  }
});