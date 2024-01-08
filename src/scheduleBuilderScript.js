/*

    This script interacts with an iframe containing buttons of a specific class. It clicks on each button, 
    extracts the professor's name from the resulting popup, and returns an array of objects containing the 
    button and its associated professor's name.

    Note:
    - The script assumes the presence of an iframe with the ID 'ptifrmtgtframe'.
    - The professor's name is extracted from the third 'dd' element with a specific class.

*/

const getButtons = (iframeDocument) => {
    const buttonNodes = iframeDocument.querySelectorAll('button.cx-MuiButtonBase-root.p-1.h-100.w-100.d-flex.flex-column.align-items-stretch.justify-content-start.text-left');
    const uniqueTextContents = new Set();
    const allButtons = [];
    
    for (let i = 0; i < buttonNodes.length; i++) {
        const button = buttonNodes[i];
        const firstPTag = button.querySelector('p.cx-MuiTypography-root');
        if (firstPTag) {
            const textContent = firstPTag.textContent.trim();
            if (!uniqueTextContents.has(textContent)) {
                uniqueTextContents.add(textContent);
                allButtons.push(button);
            }
        }
    }
    return allButtons;
}

function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function clickButtons() {
    const iframe = document.getElementById('main_iframe') || document.getElementById('ptifrmtgtframe');
    if(iframe){
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const buttons = getButtons(iframeDocument);
        let btnAndName = [];
        for (let i = 0; i < buttons.length; i++) {
            const b = buttons[i];
            b.click();
            const elements = Array.from(iframeDocument.querySelectorAll("dd.cx-MuiTypography-root.css-1xnpogb.d-flex.align-items-center.pb-1.pr-1.cx-MuiTypography-body1"));
            if(elements) {
                btnAndName.push({ btn: b, textContent: elements[3].textContent });
                const popupButtons = iframeDocument.querySelectorAll('.cx-MuiButtonBase-root.cx-MuiIconButton-root');
                if (popupButtons[3]) {
                    popupButtons[3].click();
                }
            }
        }
        return btnAndName;
    }
    return [];
}
  
export {clickButtons}