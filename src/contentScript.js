import { clickButtons } from "./scheduleBuilderScript";
import { getProfInfo } from "./teacherUtils";
import { addEventListeners, createButton, createContainer, createHiddenDiv } from "./ratingUtils";

let styles =
  'font-family: "Poppins", sans-serif; border-radius: 5px; letter-spacing: 2px; margin-left: 3px; width: 50px; font-weight: bold; cursor: pointer;';
const goodStyle =
  'background: #ECFDF5; border: 1px solid #008964; color: #047857;';
const okStyle =
  'background: #FFFBEB; border: 1px solid #FFC524; color: #FBBF24;';
const badStyle =
  'background: #FEF2F2; border: 1px solid #FF7676; color: #F87171;';

  let mutationButton = null;
  let globalObserver = null;
  
  async function checkButtonClass(button, iframeDocument) {
    if (globalObserver) {
      globalObserver.disconnect();
      globalObserver = null;
    }
    button = null;
    await removeExistingContainers(iframeDocument);
    getProfNames();
}
  
  async function removeExistingContainers(iframeDocument) {
    const containers = iframeDocument.querySelectorAll('.container');
    containers.forEach((container) => container.remove());
  }
  
  function setupButtonObserver(button, iframeDocument) {
    if (!globalObserver) {
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (mutation.type) {
            checkButtonClass(button, iframeDocument);
          }
        });
      });
      globalObserver = observer.observe(button, { childList: true, subtree: true, attributes: true });
    }
  }

const getProfNames = async () => {
  // Return a promise, so I can signal it's done to re-enable the button later
  return new Promise(async (resolve) => {
    // All classes that get inserted in are in an iframe...so I have to get the iframe content 
    const iframe = document.getElementById('main_iframe') || document.getElementById('ptifrmtgtframe');
    // If iframe
    if (iframe) {
      let version = 0;
      let classAndProf;
      
      // Get the document inside the iframe so I can query it
      let iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;
      /*
        If this returns anything to targetElements that means
        user is currently under Enrollment -> Enroll In Classes 
      */
      let targetElements = iframeDocument.getElementsByClassName(
        'MuiLink-underlineHover'
      );
      /*
          If this is true, User is on Schedule Builder, since it failed to find
          the targetElements that should be included under Enroll In Classes
      */
      if(!targetElements.length) {
        // Signal that User is at least in Schedule Builder
        version = 1;
        // This checks if User is in Schedule Builder -> Select Sections
        targetElements = Array.from(iframeDocument.querySelectorAll("div.cx-MuiGrid-root.px-1.d-flex.css-t8n52r.cx-MuiGrid-item.cx-MuiGrid-zeroMinWidth.cx-MuiGrid-grid-xs-4"))
          .filter((div, i) => i % 5 === 0 && div !== undefined);
        // Check if we're in Enrollment -> Shopping Cart
        if(!targetElements.length) {
          version = 3;
          targetElements = Array.from(iframeDocument.querySelectorAll('p.cx-MuiTypography-root.css-geruia.cx-MuiTypography-body2.cx-MuiTypography-colorInherit.cx-MuiTypography-noWrap.cx-MuiTypography-alignLeft'))
            .filter((div, i) => (i % 8) == 6 && div !== undefined);
        } 
        // If previous check returns empty, we MUST be in Schedule Builder -> Build Schedule
        if(!targetElements.length){
          // Signal that we're in Build Schedule
          version = 2;
          // Simulate Button Clicks and Get Prof Names
          classAndProf = await clickButtons();
          targetElements = classAndProf.map((classBtn) => classBtn.btn);
        } else if(version != 3){
          version = 1;
          // Need to get a node list to convert the array back into a node list
          const nodeList = document.querySelectorAll("ThisReturnsAnEmptyNodeList");
          // Now just turn the node list which we turned into an array back into a node list...
          targetElements.forEach((element) => {
            nodeList.forEach((node) => node.appendChild(element.cloneNode(true)));
          });
        }
      }

      // If we're on any of the three pages now
      if (targetElements.length > 0) {
        // Create an array out of the target Elements...
        let anchorArray = version != 2 ? Array.from(targetElements) : classAndProf;
        let nameArray = [];

        // Push an object that contains each professor's name
        anchorArray.forEach((anchorElement) => {
          nameArray.push({ profName: anchorElement.textContent });
        });
        // Processes each professor by creating an array from targetElements and then waits for all results to be resolved
        await Promise.all(Array.from(targetElements).map(async (prof, i) => {
          if (!prof.parentNode.classList.contains('prof-rating')) {
            // Going to insert the button inside a certain div depending on the version
            let parentElement =
                version == 0 ?
                  prof.parentNode.parentNode.parentNode :
                version == 2 ?
                  prof.parentNode.parentNode :
                version === 3 ?
                  prof.parentNode :
                prof;
            // Styling Changes Needed For Build Schedule Page
            if(version == 2) {
              parentElement.style.overflow = 'visible';
              parentElement.style.flexFlow = 'unset';
            }
            // Get all the info
            const difficulty = await getProfInfo(nameArray[i].profName);
            // Create Create Create
            if (difficulty != null && difficulty.wouldTakeAgainPercent != -1) {
              let Newstyles =
                difficulty.avgRating >= 4
                  ? styles + goodStyle
                  : difficulty.avgRating >= 3
                  ? styles + okStyle
                  : styles + badStyle;

              const container = createContainer();
              let hiddenDiv = createHiddenDiv(difficulty);
              const button = createButton(difficulty, Newstyles);

              container.appendChild(hiddenDiv);
              container.appendChild(button);
              
              // If we're under Schedule Builder, Buttons need to be bigger
              if(version != 0 && version != 3){
                button.style.height = '100%';
                container.style.height = '100%';
              }
              parentElement.appendChild(container);
              addEventListeners(button, hiddenDiv, difficulty.legacyId);
              version != 0 ? hiddenDiv.style.height = '134px' : ''
              version != 2 ? prof.parentNode.classList.add('prof-rating'): '';
              if (version == 2 && (!mutationButton || !mutationButton.classList.contains('cx-MuiButton-containedPrimary'))) {
                const buttons = iframeDocument.querySelectorAll('.cx-MuiButton-containedPrimary');
                mutationButton = buttons[buttons.length - 1]
                globalObserver = null;
                setupButtonObserver(mutationButton, iframeDocument);
              }              
            }
          }
        }));
      }
    } else {
      console.error('Iframe with ID "main_iframe" not found.');
    }
    resolve();
  });
};

// Wait for the user to click the button
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'startSearchInContentScript') {
    globalObserver = null;
    mutationButton = null;
    await getProfNames();
    // indicate to the user that searching is done
    chrome.runtime.sendMessage({action: 'updatePopup'});
  }
});
