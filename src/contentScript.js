import { clickButtons } from "./scheduleBuilderScript";
import { getProfInfo } from "./teacherUtils";
import { addEventListeners, createButton, createContainer, createHiddenDiv, saveButton } from "./ratingUtils";

let styles = 'font-family: "Poppins", sans-serif; letter-spacing: 2px; margin-left: 3px; width: 50px; font-weight: bold; cursor: pointer; transition: 100ms ease-in-out;';
const goodStyle = 'background: #ECFDF5; border: 1px solid #008964; color: #047857;';
const okStyle = 'background: #FFFBEB; border: 1px solid #FFC524; color: #FBBF24;';
const badStyle = 'background: #FEF2F2; border: 1px solid #FF7676; color: #F87171;';

let mutationButton = null;
let globalObserver = null;
let classAndProf = null;

// Get's Called If A Mutation Happens
async function checkButtonClass(button, iframeDocument) {
  if (globalObserver) {
    globalObserver.disconnect();
    globalObserver = null;
  }
  button = null;
  await removeExistingContainers(iframeDocument);
  getProfNames();
}

// Remove Any Existing Ratings On Build Scheduler Classes
async function removeExistingContainers(iframeDocument) {
  const containers = iframeDocument.querySelectorAll('.container');
  containers.forEach((container) => container.remove());
}

// Setups Up A Mutation Watcher
function setupButtonObserver(button, iframeDocument) {
  if (!globalObserver) {
    const observer = new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type) {
          checkButtonClass(button, iframeDocument);
        }
      });
    });
    globalObserver = observer.observe(button, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }
}

async function otherPage(iframeDocument) {

  let nodeList = document.querySelectorAll("ThisReturnsAnEmptyNodeList");
  if(window.innerWidth < 1024) {

    let smallerSelectSections = Array.from(iframeDocument.querySelectorAll('dd.cx-MuiTypography-root.css-1xnpogb.d-flex.align-items-center.pb-1.pr-1.cx-MuiTypography-body1'));
    smallerSelectSections = smallerSelectSections.filter((_, i) => ((i == 4 || ( (i - 4) % 9 )== 0)));
    smallerSelectSections.forEach((element) => {
      nodeList.forEach((node) => node.appendChild(element.cloneNode(true)));
    });
    if(smallerSelectSections.length) {
      return { targetElements: smallerSelectSections, version: 6 };
    }

    let smallerMySchedule = Array.from(iframeDocument.querySelectorAll('p.cx-MuiTypography-root.cx-MuiTypography-body1'))
	    .filter(element => element.classList.length === 2);
    let filteredSmallerMySchedule = smallerMySchedule.filter((_, i) => (i % 6) === 0);
    filteredSmallerMySchedule.forEach((element) => {
      nodeList.forEach((node) => node.appendChild(element.cloneNode(true)));
    });
    if(filteredSmallerMySchedule.length) {
      return { targetElements: filteredSmallerMySchedule, version: 5 };
    }
  }

  // check if user is on select sections page
  let version = 1;
  let onSelectSections = Array.from(iframeDocument.querySelectorAll("div.cx-MuiTypography-root.cx-MuiTypography-body2.cx-MuiTypography-noWrap")).filter(element => element.classList.length === 3);
  let onFilteredSelectSections = onSelectSections.filter((_, i) => (i - 2) % 7 === 0);
  if (onFilteredSelectSections.length) {
    onFilteredSelectSections.forEach((element) => {
      nodeList.forEach((node) => node.appendChild(element.cloneNode(true)));
    });
    return { targetElements: onFilteredSelectSections, version };
  }

  // check if user is on schedle builder -> build schedule
  version = 2;
  classAndProf = await clickButtons();
  const onScheduleBuilderGenerator = classAndProf.map((classBtn) => classBtn.btn);
  if (onScheduleBuilderGenerator.length) {
    return { targetElements: onScheduleBuilderGenerator, version };
  }

  // check if user is on my schedule or friends page
  version = 4;
  let allElements = Array.from(iframeDocument.querySelectorAll('p.cx-MuiTypography-root.cx-MuiTypography-body1'))
    .filter(element => element.classList.length === 2);
  let filteredallElements = allElements.filter((_, i) => (i - 1) % 7 === 0);
  filteredallElements.forEach((element) => {
  nodeList.forEach((node) => node.appendChild(element.cloneNode(true)));
  });
  if (filteredallElements.length) {
  return { targetElements: filteredallElements, version };
  }  

  if(allElements.length) {
    return { targetElements: allElements, version };
  }
    // check if user is in shopping cart
    version = 3;
    let onShoppingCart = Array.from(iframeDocument.querySelectorAll('p.cx-MuiTypography-root.cx-MuiTypography-body1'))
      .filter((div, i) => (i % 8) == 6 && div !== undefined);
    onShoppingCart.forEach((element) => {
      nodeList.forEach((node) => node.appendChild(element.cloneNode(true)));
    });
    console.log(onShoppingCart)
    if (onShoppingCart.length) {
      return { targetElements: onShoppingCart, version };
    }  
  
  
  return {targetElements: '', version: 0};
}

async function getVersionAndElements(iframeDocument) {
  // if user is under enroll in classes
  let targetElements = Array.from(iframeDocument.querySelectorAll('a.cx-MuiTypography-body1'));
  console.log(targetElements)
  if (!targetElements.length) {
    // clearly not on that page...so find the correct page
    return await otherPage(iframeDocument);
  }
  return { targetElements, version: 0};
}

const getCorrectParentNode = (element, version) => {
  switch (version) {
    case 0:
      return element.parentNode.parentNode.parentNode;
    case 2:
      return element.parentNode.parentNode;
    case 3:
      return element.parentNode;
    case 4:
      return element.firstChild;
    default:
      return element;
  }
}

const getProfNames = async () => {
  return new Promise(async (resolve) => {
    // All classes that get inserted in are in an iframe...so I have to get the iframe content 
    const iframe = document.getElementById('main_iframe') || document.getElementById('ptifrmtgtframe');
    if (!iframe) {
      throw new Error("Iframe does not exist.")
    }

    // Get the document inside the iframe so I can query it
    let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    // Get Correct Element Depending On The Page
    const { targetElements, version } = await getVersionAndElements(iframeDocument);
    if (!targetElements.length > 0) {
      throw new Error("Target Element(s) Do Not Exist.")
    }

    // Create an array out of the target Elements...
    let anchorArray = version != 2 ? Array.from(targetElements) : classAndProf;
    let nameArray = [];

    // Push an object that contains each professor's name
    anchorArray.forEach((anchorElement) => {
      nameArray.push({
        profName: anchorElement.textContent.trim()
      });
    });

    // Processes each professor by creating an array from targetElements and then waits for all results to be resolved
    await Promise.all(Array.from(targetElements).map(async (prof, i) => {
      if (!prof.parentNode.classList.contains('prof-rating')) {
        // Going to insert the button inside a certain div depending on the version
        let parentElement = getCorrectParentNode(prof, version);
        console.log(version)
        // Styling Changes Needed For Build Schedule Page
        if (version == 2) {
          parentElement.style.overflow = 'visible';
          parentElement.style.flexFlow = 'unset';
        } else if (version == 5) {
          parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.style.overflow = 'unset';
        } else if (version == 6) {
          parentElement.style.overflowX = 'unset';
          parentElement.parentElement.parentElement.parentElement.style.overflowX = 'unset';
        }
        // Get all the info
        const difficulty = await getProfInfo(nameArray[i].profName);

        // Create Create Create
        if (difficulty != null && difficulty.wouldTakeAgainPercent != -1) {
          let Newstyles =
            difficulty.avgRating >= 4 ?
            styles + goodStyle :
            difficulty.avgRating >= 3 ?
            styles + okStyle :
            styles + badStyle;

          const container = createContainer();
          let hiddenDiv = createHiddenDiv(difficulty);
          const button = createButton(difficulty, Newstyles);
          container.appendChild(hiddenDiv);
          container.appendChild(button);
          const sButton = saveButton(difficulty, Newstyles);
          if(version != 2) {
            chrome.storage.sync.get('buttonsData', function(data) {
              if (data.buttonsData) {
                let buttonsData = JSON.parse(data.buttonsData);
                buttonsData.forEach(obj => {
                  if(obj.id == difficulty.id){
                    sButton.disabled=true;
                    sButton.style.opacity = '0.5';
                    sButton.style.cursor = 'not-allowed';
                  }
                })
              }
            });
            container.append(sButton);


          } 
          // If we're under Schedule Builder, Buttons need to be bigger
          if (version != 0 && version != 3) {
            button.style.height = '100%';
            container.style.height = '100%';
          }

          parentElement.appendChild(container);
          addEventListeners(button, hiddenDiv, difficulty.legacyId, sButton);
          version != 0 ? hiddenDiv.style.height = '134px' :
            version != 2 ? prof.parentNode.classList.add('prof-rating') : '';
          
          // no idea how this is working NGL, but it's a mutation watcher that watches if a user switches pages on scheduler builder -> build schedule
          if (version == 2 && (!mutationButton || !mutationButton.classList.contains('cx-MuiButton-containedPrimary'))) {
            const buttons = iframeDocument.querySelectorAll('.cx-MuiButton-containedPrimary');
            mutationButton = buttons[buttons.length - 1]
            globalObserver = null;
            setupButtonObserver(mutationButton, iframeDocument);
          }
        }
      }
    }));
    resolve();
  });
};

// Wait for the user to click the button
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'startSearchInContentScript') {
    globalObserver = null;
    mutationButton = null;
    classAndProf = null;
    await getProfNames();
    // indicate to the user that searching is done
    chrome.runtime.sendMessage({
      action: 'updatePopup'
    });
  } else if (request.action === 'enableButton') {
    const iframe = document.getElementById('main_iframe') || document.getElementById('ptifrmtgtframe');
    if (!iframe) {
      return;
    }
    let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    const elements = iframeDocument.getElementsByClassName(request.profId);
    Array.from(elements).forEach(saveButton => {
      saveButton.removeAttribute("disabled");
      saveButton.style.opacity = '100%';
      saveButton.style.cursor = 'pointer';
     })
  }
});