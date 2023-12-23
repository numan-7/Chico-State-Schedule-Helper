const chicoID = 'U2Nob29sLTE1OQ==';
const baseUrl = 'https://cmsweb.csuchico.edu/psp/CCHIPRD/EMPLOYEE/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main?';
let screenWidth = window.innerWidth;
let intervalId;
let prevUrl;

const styles = "border-radius: 5px; letter-spacing: 2px; background: #ffffff; margin-left: 3px; padding: 1px 12px; font-style: inherit; font-weight: bold; border: 1px solid #ac9f9f; cursor: pointer;"

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

const handleClick = async (e) => {
  const profName = e.target.dataset.profName
  const teacherInfo = await getTeacherInfo(profName)
  const teacherRating = await getTeacherRating(teacherInfo.teacher[0].id)
  console.log(teacherRating.rating)
}

const startInterval = () => {
    clearInterval(intervalId)
    intervalId = setInterval(() => {
        if (window.location.href.includes(baseUrl)) {
            getProfNames();
        }
    }, 2500);
}

const getProfNames = () => {
    const iframe = document.getElementById('main_iframe');
    if (iframe) {
        let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        let anchorElements = iframeDocument.getElementsByClassName('MuiLink-underlineHover');
        let profNames = iframeDocument.querySelectorAll('a.MuiTypography-root.MuiLink-root.MuiLink-underlineHover.d-inline.MuiTypography-body1.MuiTypography-colorPrimary');
        if(anchorElements.length > 0 && intervalId) {
            clearInterval(intervalId)
            let anchorArray = Array.from(anchorElements);
            let nameArray = [];
            anchorArray.forEach((anchorElement, i) => {
                nameArray.push({profName: anchorElement.textContent})
            });
            profNames.forEach((prof, i) => {
              let parentElement = prof.parentNode;
              parentElement.innerHTML +=(
                `<button class = "rmpBtn" style="${styles}" data-prof-name="${nameArray[i].profName}">
                  RMP
                </button>`);
            })
            iframeDocument.querySelectorAll('.rmpBtn').forEach((button) => {
              button.addEventListener('click', (e) => handleClick(e));
            });        
          }
    } else {
        console.log('Iframe with ID "main_iframe" not found.');
    }
};

setInterval(() => {
  if (window.location.href !== prevUrl || screenWidthCalculation()) {
        prevUrl = window.location.href;
        startInterval();
    }
}, 2500);


const screenWidthCalculation = () => {
  if(screenWidth > 1182) {
    if(window.innerWidth <= 1182 ) {
      console.log("Case 1:" + screenWidth + " " + window.innerWidth)
      screenWidth = window.innerWidth;
      return true
    }
  } else {
    if(window.innerWidth > 1182 && screenWidth < 1182) {
      console.log("Case 2" + screenWidth + " " + window.innerWidth)
      screenWidth = window.innerWidth;
      return true
    }
  }
  return false
};
