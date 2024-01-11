import { clickButtons } from "./scheduleBuilderScript";
import { getProfInfo } from "./teacherUtils";
import { addEventListeners, createButton, createContainer, createHiddenDiv } from "./ratingUtils";

let styles = 'font-family: "Poppins", sans-serif; border-radius: 5px; letter-spacing: 2px; margin-left: 3px; width: 50px; font-weight: bold; cursor: pointer;';
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

async function getShoppingCartOrSchedulePage(iframeDocument) {
  // check if user is on select sections page
  let version = 1;
  let onSelectSections = Array.from(iframeDocument.querySelectorAll("div.cx-MuiGrid-root.px-1.d-flex.css-t8n52r.cx-MuiGrid-item.cx-MuiGrid-zeroMinWidth.cx-MuiGrid-grid-xs-4"))
    .filter((div, i) => i % 5 === 0 && div !== undefined);
  const nodeList = document.querySelectorAll("ThisReturnsAnEmptyNodeList");
  if (onSelectSections.length) {
    onSelectSections.forEach((element) => {
      nodeList.forEach((node) => node.appendChild(element.cloneNode(true)));
    });
    return { page: onSelectSections, version };
  }

  // check if user is on schedle builder -> build schedule
  version = 2;
  classAndProf = await clickButtons();
  const onScheduleBuilderGenerator = classAndProf.map((classBtn) => classBtn.btn);
  if (onScheduleBuilderGenerator.length) {
    return { targetElements: onScheduleBuilderGenerator, version };
  }

  // check if user is in shopping cart
  version = 3;
  let onShoppingCart = Array.from(iframeDocument.querySelectorAll('p.cx-MuiTypography-root.css-geruia.cx-MuiTypography-body2.cx-MuiTypography-colorInherit.cx-MuiTypography-noWrap.cx-MuiTypography-alignLeft'))
    .filter((div, i) => (i % 8) == 6 && div !== undefined);
  onShoppingCart.forEach((element) => {
    nodeList.forEach((node) => node.appendChild(element.cloneNode(true)));
  });
  if (onShoppingCart.length) {
    return { targetElements: onShoppingCart, version };
  }

}

async function getVersionAndElements(iframeDocument) {
  // if user is under enroll in classes
  let targetElements = Array.from(iframeDocument.getElementsByClassName('MuiLink-underlineHover'));
  if (!targetElements.length) {
    // clearly not on that page...so find the correct page
    return await getShoppingCartOrSchedulePage(iframeDocument);
  }
  return { targetElements, version: 0};
}

const getCorrectParentNode = (element, version) => {
  return version == 0 ?
    element.parentNode.parentNode.parentNode :
      version == 2 ?
    element.parentNode.parentNode :
      version === 3 ?
    element.parentNode :
      element;
}

const getProfNames = async () => {
  return new Promise(async (resolve) => {
    // All classes that get inserted in are in an iframe...so I have to get the iframe content 
    const iframe = document.getElementById('main_iframe') || document.getElementById('ptifrmtgtframe');
    if (!iframe) {
      throw new error("Iframe does not exist.")
    }

    // Get the document inside the iframe so I can query it
    let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    // Get Correct Element Depending On The Page
    const { targetElements, version } = await getVersionAndElements(iframeDocument);
    if (!targetElements.length > 0) {
      throw new error("Target Element(s) Do Not Exist.")
    }

    // Create an array out of the target Elements...
    let anchorArray = version != 2 ? Array.from(targetElements) : classAndProf;
    let nameArray = [];

    // Push an object that contains each professor's name
    anchorArray.forEach((anchorElement) => {
      nameArray.push({
        profName: anchorElement.textContent
      });
    });

    // Processes each professor by creating an array from targetElements and then waits for all results to be resolved
    await Promise.all(Array.from(targetElements).map(async (prof, i) => {
      if (!prof.parentNode.classList.contains('prof-rating')) {
        // Going to insert the button inside a certain div depending on the version
        let parentElement = getCorrectParentNode(prof, version);
        // Styling Changes Needed For Build Schedule Page
        if (version == 2) {
          parentElement.style.overflow = 'visible';
          parentElement.style.flexFlow = 'unset';
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

          // If we're under Schedule Builder, Buttons need to be bigger
          if (version != 0 && version != 3) {
            button.style.height = '100%';
            container.style.height = '100%';
          }

          parentElement.appendChild(container);
          addEventListeners(button, hiddenDiv, difficulty.legacyId);
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
  }
});