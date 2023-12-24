const chicoID = 'U2Nob29sLTE1OQ==';
const baseUrl = 'https://cmsweb.csuchico.edu/psp/CCHIPRD/EMPLOYEE/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main?';

let styles = "border-radius: 5px; letter-spacing: 2px; margin-left: 3px; padding: 1px 12px; font-style: inherit; font-weight: bold; cursor: pointer;"
const goodStyle = "background: #ECFDF5; border: 1px solid #047857; color: #047857;"
const okStyle = "background: #FFFBEB; border: 1px solid #FBBF24; color: #FBBF24;"
const badStyle = "background: #FEF2F2; border: 1px solid #F87171; color: #F87171;"

const getTeacherInfo = async (profName) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({ action: 'teacherInfo', profName: profName }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
};

const getTeacherRating = async (profID) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({ action: 'teacherRating', profID: profID }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
};

const getProfInfo = async (profName) => {
  const teacherInfo = await getTeacherInfo(profName)
  if(teacherInfo.teacher.length > 0 ) {
    console.log(teacherInfo)
    const teacherRating = await getTeacherRating(teacherInfo.teacher[0].id);
    return teacherRating.rating;
  } else {
    return null;
  }
}

const createContainer = () => {
  const container = document.createElement('div');
  container.classList.add('container');
  container.style.flexDirection = 'column';
  container.style.position = 'relative';
  container.innerHTML =
  `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,200;0,400;0,700;1,400;1,700&display=swap');
    </style>
  `
  return container;
};

const createHiddenDiv = (difficulty) => {
  const hiddenDiv = document.createElement('div');
  hiddenDiv.classList.add('hiddenDiv');
  hiddenDiv.style.display = 'none';
  hiddenDiv.style.padding = '2px';
  hiddenDiv.style.width = '100%';
  hiddenDiv.style.borderRadius = '5px';
  hiddenDiv.style.background = difficulty.avgRating >= 4 ? '#ECFDF5' : difficulty.avgRating >= 3 ? '#FFFBEB' : '#FEF2F2';
  hiddenDiv.style.border = difficulty.avgRating >= 4 ? '1px solid #047857' : difficulty.avgRating >= 3 ? '1px solid #FBBF24' : '1px solid #F87171';
  hiddenDiv.style.width = '250px';
  hiddenDiv.style.height = '150px';
  hiddenDiv.style.position = 'absolute';
  hiddenDiv.style.top = '-175px';
  hiddenDiv.style.left = '-90px';
  hiddenDiv.style.overflow = 'auto';

  hiddenDiv.innerHTML = `
      <div style="font-family: 'Poppins', sans-serif; display: flex; justify-content: space-between; width: 100%;">
          <span><a href = "https://www.ratemyprofessors.com/professor/${difficulty.legacyId}" target = "_blank" ">${difficulty.firstName + ' ' + difficulty.lastName}</a></span>
          <span class="closeBtn"><strong>X</strong></span>
      </div>
      <hr style="margin-top: 1px; color: black;" />
      <div style="font-size: .85rem; font-family: 'Poppins', sans-serif; display: flex; flex-direction: column;">
          <span style = "text-transform: uppercase;"><strong style = "font-size: 1.15rem;" >${difficulty.numRatings}</strong> total ratings</span>
          <span style = "text-transform: uppercase;"><strong style = "font-size: 1.15rem;" >${difficulty.avgRating}</strong> average rating</span>
          <span style = "text-transform: uppercase;"><strong style = "font-size: 1.15rem;" >${difficulty.avgDifficulty}</strong> average difficulty</span>
          <span style = "text-transform: uppercase;"><strong style = "font-size: 1.15rem;" >${difficulty.wouldTakeAgainPercent}%</strong> would take again </span>
      </div>
  `;

  return hiddenDiv;
};

const createButton = (difficulty, Newstyles) => {
  const button = document.createElement('button');
  button.classList.add('rmpBtn');
  button.style = Newstyles;
  button.innerText = difficulty.avgRating;

  return button;
};

const addEventListeners = (button, hiddenDiv) => {
  button.addEventListener('click', () => {
    hiddenDiv.style.display = 'block';
  });

  hiddenDiv.querySelector('.closeBtn').addEventListener('click', () => {
    hiddenDiv.style.display = 'none';
  });
};

const getProfNames = async () => {
  const iframe = document.getElementById('main_iframe');
  if (iframe) {
    let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    let anchorElements = iframeDocument.getElementsByClassName('MuiLink-underlineHover');
    let profNames = iframeDocument.querySelectorAll('a.MuiTypography-root.MuiLink-root.MuiLink-underlineHover.d-inline.MuiTypography-body1.MuiTypography-colorPrimary');
    if (anchorElements.length > 0) {
      let anchorArray = Array.from(anchorElements);
      let nameArray = [];
      anchorArray.forEach((anchorElement) => {
        nameArray.push({ profName: anchorElement.textContent })
      });
      profNames.forEach(async (prof, i) => {
        let parentElement = prof.parentNode.parentNode.parentNode;
        const difficulty = await getProfInfo(nameArray[i].profName)
        if (difficulty != null && difficulty.wouldTakeAgainPercent != -1) {
          let Newstyles = difficulty.avgRating >= 4 ? styles + goodStyle : difficulty.avgRating >= 3 ? styles + okStyle : styles + badStyle

          const container = createContainer();
          const hiddenDiv = createHiddenDiv(difficulty);
          const button = createButton(difficulty, Newstyles);

          container.appendChild(hiddenDiv);
          container.appendChild(button);
          parentElement.appendChild(container);

          addEventListeners(button, hiddenDiv);
        }
      });
    }
  } else {
    console.log('Iframe with ID "main_iframe" not found.');
  }
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'startSearchInContentScript') {
    await getProfNames();
  }
});