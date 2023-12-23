const chicoID = 'U2Nob29sLTE1OQ=='
const baseUrl = 'https://cmsweb.csuchico.edu/psp/CCHIPRD/EMPLOYEE/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main?';
let intervalId;
let prevUrl;

const getTeacherInfo = (nameArray) => {
  try {
    chrome.runtime.sendMessage({ action: 'teacherInfo' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log(response);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

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
    // Check if the iframe is available
    if (iframe) {
        // Access the contentDocument property of the iframe
        let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        // Use getElementsByClassName within the iframe document
        let anchorElements = iframeDocument.getElementsByClassName('MuiLink-underlineHover');
        let classNames = iframeDocument.getElementsByClassName('css-1e88sj6')
        if(anchorElements.length > 0 && intervalId) {
            clearInterval(intervalId)
            let anchorArray = Array.from(anchorElements);
            let nameArray = [];
            anchorArray.forEach((anchorElement, i) => {
                let splitName = classNames[i].textContent.split(' | ');
                let finalClassName = splitName[1].trim().split(' ')[0];
                nameArray.push({class: finalClassName, profName: anchorElement.textContent})
            });
            console.log(nameArray)
            getTeacherInfo(nameArray)
        }
    } else {
        console.log('Iframe with ID "main_iframe" not found.');
    }
};

setInterval(() => {
  if (window.location.href !== prevUrl) {
        prevUrl = window.location.href;
        startInterval();
    }
}, 2500);
