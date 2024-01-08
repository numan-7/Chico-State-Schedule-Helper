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
          left: 93px;
          margin: 0 auto;
          width: 0;
          height: 0;
          border-top: solid 10px rgb(0,0,0,.85);
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
    hiddenDiv.style.border = '1px solid black';
    hiddenDiv.style.height = '120px';
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.top = '-145px';
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
        <div style = "width: 50%; border-left: 1px solid black; font-size: 1.2rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; justify-content: center;">
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

// if someone hovers the button open up the popup
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


export {addEventListeners, createButton, createContainer, createHiddenDiv}