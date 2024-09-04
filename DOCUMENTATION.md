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
