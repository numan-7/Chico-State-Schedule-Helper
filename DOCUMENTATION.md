# ratingUtils.js

## Overview

`ratingUtils.js` contains utility functions for creating and managing the UI components of the RateMyProfessor Chrome extension for Chico State University's student portal. These functions handle the creation of buttons, popups, and event listeners that display professor ratings and information.

## Functions

### `createContainer()`

Creates and returns a container div for the rating components.

**Returns:**

- `HTMLDivElement`: A div element with necessary styles and a CSS import for the Poppins font.

### `createHiddenDiv(difficulty)`

Creates a hidden div that serves as a popup displaying detailed professor information.

**Parameters:**

- `difficulty` (Object): Contains professor rating information.

**Returns:**

- `HTMLDivElement`: A styled div element with professor rating details.

### `saveButton(difficulty, Newstyles)`

Creates a "save" button for storing professor information.

**Parameters:**

- `difficulty` (Object): Contains professor rating information.
- `Newstyles` (String): CSS styles to be applied to the button.

**Returns:**

- `HTMLButtonElement`: A styled button element with professor data attributes.

### `createButton(difficulty, Newstyles)`

Creates the main button displayed next to the professor's name.

**Parameters:**

- `difficulty` (Object): Contains professor rating information.
- `Newstyles` (String): CSS styles to be applied to the button.

**Returns:**

- `HTMLButtonElement`: A styled button element displaying the professor's average rating.

### `addEventListeners(button, hiddenDiv, profID, sButton)`

Adds event listeners to the rating buttons for interactivity.

**Parameters:**

- `button` (HTMLButtonElement): The main rating button.
- `hiddenDiv` (HTMLDivElement): The popup div with detailed information.
- `profID` (String): The professor's ID.
- `sButton` (HTMLButtonElement): The save button.

**Functionality:**

- Handles hover effects for buttons.
- Opens the RateMyProfessor page for the professor when clicked.
- Saves professor data to Chrome storage when the save button is clicked.

## Usage

These functions are exported and can be imported in other parts of the extension to create and manage the rating UI components within the Chico State student portal.

```javascript
import {
  createContainer,
  createHiddenDiv,
  saveButton,
  createButton,
  addEventListeners,
} from './ratingUtils.js';
```

## Note

This file relies on the Chrome extension API for storage and accessing extension resources. Ensure that the necessary permissions are set in the extension's manifest file.

# contentScript.js

## Overview

This script is the main content script for the RateMyProfessor Chrome extension for Chico State University's student portal. It handles the insertion of professor ratings into various pages of the portal, manages UI updates, and interacts with the Chrome extension API.

## Imports

```javascript
import { clickButtons } from './scheduleBuilderScript';
import { getProfInfo } from './teacherUtils';
import {
  addEventListeners,
  createButton,
  createContainer,
  createHiddenDiv,
  saveButton,
} from './ratingUtils';
```

## Global Variables

- `styles`: Base styles for rating buttons.
- `goodStyle`, `okStyle`, `badStyle`: Style variations based on rating.
- `mutationButton`, `globalObserver`, `classAndProf`: Used for mutation observation and caching.

## Main Functions

### `checkButtonClass(button, iframeDocument)`

Handles mutations in the observed button class.

### `removeExistingContainers(iframeDocument)`

Removes existing rating containers from the page.

### `setupButtonObserver(button, iframeDocument)`

Sets up a mutation observer for the specified button.

### `otherPage(iframeDocument)`

Identifies the current page type and returns relevant elements.

### `getVersionAndElements(iframeDocument)`

Determines the page version and retrieves target elements.

### `getCorrectParentNode(element, version)`

Returns the correct parent node based on the page version.

### `getProfNames()`

Main function to retrieve professor names and insert rating information.

## Page Versions

The script handles different page versions:

- 0: Enroll in classes
- 1: Select sections
- 2: Schedule builder
- 3: Shopping cart
- 4: My schedule or friends page
- 5, 6: Smaller viewport versions

## Chrome Extension Message Handling

Listens for two types of messages:

1. `startSearchInContentScript`: Triggers the professor rating search and insertion.
2. `enableButton`: Re-enables save buttons for specific professors.

## Key Processes

1. Identifies the current page in the student portal.
2. Retrieves professor names from the page.
3. Fetches professor ratings and information.
4. Creates and inserts rating buttons and popups.
5. Manages save functionality for professor information.
6. Handles responsive design for different viewport sizes.

## Notes

- The script extensively uses iframe manipulation to insert content into the student portal.
- It implements mutation observers to handle dynamic page changes.
- Chrome storage is used to persist saved professor data.

## Usage

This script is automatically injected into the student portal pages by the Chrome extension. It runs in the background, enhancing the portal with professor rating information as the user navigates through different sections.

# scheduleBuilderScript.js

## Overview

This script is designed to interact with the schedule builder page in the student portal iframe. It identifies and clicks buttons representing classes, extracts professor names from the resulting popups, and returns an array of objects containing both the button elements and the associated professor names.

## Functions

### `getButtons(iframeDocument)`

Retrieves unique buttons from the iframe document.

#### Parameters

- `iframeDocument`: The document object of the iframe.

#### Returns

- `Array`: An array of unique button elements.

#### Process

1. Queries all buttons with a specific class.
2. Filters for unique buttons based on their first `<p>` tag content.
3. Returns an array of unique button elements.

### `delay(ms)`

A utility function to create a delay.

#### Parameters

- `ms`: Number of milliseconds to delay.

#### Returns

- `Promise`: Resolves after the specified delay.

### `clickButtons()`

The main function that interacts with the schedule builder page.

#### Returns

- `Array`: An array of objects, each containing a button element and its associated professor name.

#### Process

1. Locates the iframe in the document.
2. Retrieves unique buttons using `getButtons()`.
3. Iterates through each button:
   - Clicks the button.
   - Extracts the professor's name from the resulting popup.
   - Closes the popup.
   - Stores the button and professor name in an array.
4. Returns the array of button-professor name pairs.

## Usage

This script is designed to be imported and used by the main content script of the Chrome extension. The `clickButtons()` function is the primary export, which should be called when interaction with the schedule builder page is needed.

```javascript
import { clickButtons } from './scheduleBuilderScript';

// Later in your code
const buttonAndProfessorData = await clickButtons();
```

## Notes

- The script assumes the presence of an iframe with the ID 'main_iframe' or 'ptifrmtgtframe'.
- It relies on specific class names and DOM structures within the iframe. Any changes to the student portal's HTML structure may require updates to this script.
- The professor's name is extracted from the fourth (index 3) 'dd' element with a specific class in the popup.
- The script includes error handling to prevent issues if expected elements are not found.

## Dependencies

This script doesn't have external dependencies, but it is designed to work within the context of the larger Chrome extension, particularly in conjunction with the main content script.

# popup.js

## Overview

`popup.js` manages the functionality of the popup that appears when the extension icon is clicked. It handles user interactions, displays saved professor ratings, and communicates with other parts of the extension.

## Key Elements

- `savedWrapper`: The container for displaying saved professor ratings.
- `startButton`: The button to initiate the search for professor ratings.

## Main Functions

### Event Listeners

1. **Start Button Click**

   - Sends a message to the background script to start the search.
   - Updates button text to "searching..." and disables the button.

2. **Chrome Runtime Message Listener**

   - Listens for the 'updatePopup' action to reset the start button.

3. **Tab URL Check**

   - Disables the start button if not on the CSUC Portal.

4. **Delete Button Click**
   - Removes a saved professor rating from storage and updates the display.

### `handleDelete(eventData)`

Removes a saved professor rating from storage based on its ID.

### `renderList(buttonsData)`

Renders the list of saved professor ratings in the popup.

- If no data, displays a message to save ratings.
- For each professor, creates a styled div with rating information.
- Adds hover effects to delete buttons.

## Data Management

- Uses Chrome's storage API to store and retrieve saved professor ratings.
- Parses and stringifies data for storage operations.

## UI Updates

- Dynamically updates the popup content based on stored data.
- Provides visual feedback for user interactions (e.g., hover effects on delete buttons).

## External Communications

- Sends messages to the background script to initiate searches.
- Sends messages to re-enable buttons in the content script when a rating is deleted.

## Usage

This script runs automatically when the extension popup is opened. It doesn't need to be manually invoked but will respond to user interactions with the popup interface.

## Notes

- Relies on specific HTML structure in the popup (e.g., elements with IDs 'savedWrapper', 'startButton').
- Uses inline styles for dynamic content, which may need to be updated if the design changes.
- Error handling is minimal; consider adding more robust error checks and user feedback.

# teacherUtils.js

## Overview

`teacherUtils.js` manages the communication between the content script and the background script to fetch professor information and ratings from an external API. It provides utility functions to retrieve teacher information and ratings based on the professor's name.

## Functions

### `getTeacherInfo(profName)`

Retrieves basic information about a teacher, primarily their ID.

#### Parameters

- `profName` (string): The name of the professor to search for.

#### Returns

- `Promise`: Resolves with the teacher's information or rejects with an error.

#### Process

1. Sends a message to the background script with the action 'teacherInfo'.
2. Waits for the response from the background script.
3. Resolves with the teacher's information or rejects with an error.

### `getTeacherRating(profID)`

Retrieves detailed ratings for a specific teacher.

#### Parameters

- `profID` (string): The ID of the professor to get ratings for.

#### Returns

- `Promise`: Resolves with the teacher's ratings or rejects with an error.

#### Process

1. Sends a message to the background script with the action 'teacherRating'.
2. Waits for the response from the background script.
3. Resolves with the teacher's ratings or rejects with an error.

### `getProfInfo(profName)`

Main function to get comprehensive professor information including ratings.

#### Parameters

- `profName` (string): The name of the professor to get information for.

#### Returns

- `Promise`: Resolves with the professor's ratings or null if not found.

#### Process

1. Calls `getTeacherInfo(profName)` to get the professor's ID.
2. If a professor is found, calls `getTeacherRating(profID)` to get their ratings.
3. Returns the ratings if found, or null if the professor is not found.

## Usage

This module is designed to be imported and used by other parts of the extension, primarily the content script. The main function to use is `getProfInfo`:

```javascript
import { getProfInfo } from './teacherUtils';

// Later in your code
const professorRatings = await getProfInfo('John Doe');
if (professorRatings) {
  // Use the ratings
} else {
  // Handle case where professor is not found
}
```

## Error Handling

Each function includes error handling:

- Logs errors to the console.
- Rejects the promise with the error for the calling code to handle.

## Notes

- This module relies on the background script (`background.js`) to make actual API calls.
- It uses Chrome's `runtime.sendMessage` API for communication with the background script.
- The module doesn't handle rate limiting or caching; consider implementing these in the background script if needed.

## Dependencies

While this module doesn't have direct external dependencies, it depends on:

- Chrome Extension API, specifically `chrome.runtime.sendMessage`.
- A properly configured background script that can handle 'teacherInfo' and 'teacherRating' actions.

# background.js

## Overview

`background.js` serves as the background script for the Chrome extension. It handles API calls to Rate My Professors and manages communication between different parts of the extension (popup, content scripts). This script is necessary because background scripts are the only components allowed to make API calls in Chrome extensions.

## Imports

```javascript
import ratings from '@mtucourses/rate-my-professors';
```

The script uses the `@mtucourses/rate-my-professors` library to interact with the Rate My Professors API.

## Message Listener

The script uses `chrome.runtime.onMessage.addListener()` to handle various types of messages from other parts of the extension.

### Message Types

1. **'startSearch'**

   - Triggers a search in the content script of the active tab.

2. **'renableButton'**

   - Re-enables a button in the content script, typically after a rating is deleted.

3. **'teacherInfo'**

   - Searches for a teacher's basic information using the Rate My Professors API.

4. **'teacherRating'**

   - Retrieves detailed ratings for a specific teacher using their ID.

5. **'updatePopup'**
   - Currently empty, potentially for future use to update the popup.

## Key Functions

### Search Teacher Information

```javascript
const teacher = await ratings.searchTeacher(
  `${request.profName}`,
  'U2Nob29sLTE1OQ=='
);
```

- Searches for a teacher using their name and a school identifier.
- The school identifier 'U2Nob29sLTE1OQ==' appears to be for a specific institution (likely Chico State University).

### Get Teacher Ratings

```javascript
const rating = await ratings.getTeacher(`${request.profID}`);
```

- Retrieves detailed ratings for a teacher using their ID.

## Error Handling

Each API call is wrapped in a try-catch block to handle potential errors. Errors are sent back to the requesting script via `sendResponse`.

## Asynchronous Processing

The script uses async/await for API calls and returns `true` from the listener to indicate that the response will be sent asynchronously.

## Usage

This background script runs continuously while the extension is active. It doesn't need to be manually invoked but responds to messages from other parts of the extension.

## Notes

- The school identifier ('U2Nob29sLTE1OQ==') is hardcoded.
- The 'updatePopup' action is currently empty. This might be a placeholder for future functionality.
- Ensure that the necessary permissions are declared in the `manifest.json` file for API calls and tab interactions.

## Dependencies

- Chrome Extension API
- `@mtucourses/rate-my-professors` library
