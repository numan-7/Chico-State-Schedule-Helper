# RateMyProfessor Chrome Extension Documentation

Documenation for the Chrome Extension. Currently WIP.

## Table of Contents

- [Overview](#overview)
  - [contentScript.js](#contentscriptjs)
    - [Usage](#usage-of-contentscriptjs)
    - [Main Functions](#main-functions-in-contentscriptjs)
    - [Chrome Extension Message Handling](#chrome-extension-message-handling-in-contentscriptjs)
  - [scheduleBuilderScript.js](#schedulebuilderscriptjs)
    - [Usage](#usage-of-schedulebuilderscriptjs)
    - [Main Functions](#main-functions-in-schedulebuilderscriptjs)
  - [popup.js](#popupjs)
    - [Usage](#usage-of-popupjs)
    - [Main Functions](#main-functions-in-popupjs)
    - [Data Management](#data-management-in-popupjs)
  - [teacherUtils.js](#teacherutilsjs)
    - [Usage](#usage-of-teacherutilsjs)
    - [Main Functions](#main-functions-in-teacherutilsjs)
  - [background.js](#backgroundjs)
    - [Usage](#usage-of-backgroundjs)
    - [Message Types](#message-types-in-backgroundjs)
    - [Key Functions](#key-functions-in-backgroundjs)

## Overview

This documentation explains the scripts that make up the RateMyProfessor Chrome extension for the Chico State University student portal. Each script is responsible for enhancing the portal by injecting professor ratings, managing user interactions, and fetching data from external APIs (e.g., Rate My Professors).

## contentScript.js

### What It Does

The `contentScript.js` is the primary script that operates on the Chico State University student portal pages. It injects professor ratings, observes mutations for dynamic page changes, and handles the UI updates within the portal. This script interacts with the Chrome extension's background script and API to fetch and display professor ratings on various portal sections, like "Enroll in Classes," "Schedule Builder," and more.

### Usage of contentScript.js

This script is automatically injected into relevant pages of the student portal by the Chrome extension. It activates when the user navigates the portal and runs in the background to insert professor ratings dynamically as the user interacts with the portal.

### Main Functions in contentScript.js

- **`checkButtonClass(button, iframeDocument)`**: Observes changes to button classes and updates the UI when a professor’s rating button is available.
- **`removeExistingContainers(iframeDocument)`**: Ensures that multiple instances of the rating containers are not rendered by removing existing ones.
- **`setupButtonObserver(button, iframeDocument)`**: Uses a MutationObserver to track changes in buttons (e.g., when new buttons are added) and updates the interface.
- **`otherPage(iframeDocument)`**: Identifies which page the user is on (e.g., schedule builder, enrollment) and returns the relevant elements to interact with.
- **`getVersionAndElements(iframeDocument)`**: Determines the portal version based on the structure and returns the necessary target elements.
- **`getCorrectParentNode(element, version)`**: Finds the correct parent node to insert professor ratings based on the page version.
- **`getProfNames()`**: Retrieves professor names from the portal and inserts rating buttons for each professor dynamically.

### Chrome Extension Message Handling in contentScript.js

The script listens for two types of messages from the Chrome extension background or popup scripts:

1. **`startSearchInContentScript`**: Triggers the process of searching for professor ratings and inserting them into the portal.
2. **`enableButton`**: Re-enables specific save buttons for professors in case they were disabled after saving or modifying ratings.

## scheduleBuilderScript.js

### What It Does

The `scheduleBuilderScript.js` handles interactions with the schedule builder page of the student portal. It works within an iframe to identify buttons for selecting classes, extracts professor names from popups, and returns this information to be used by the main content script. This script is crucial for retrieving professor names from dynamic elements within the iframe on the schedule builder page.

### Usage of scheduleBuilderScript.js

This script is imported and used by the main `contentScript.js` file. The `clickButtons()` function is the primary method called when interaction with the schedule builder page is required to extract professor names.

### Main Functions in scheduleBuilderScript.js

- **getButtons(iframeDocument)**: Retrieves unique button elements from the iframe document representing classes that users can click to view professor names.
- **clickButtons()**: Interacts with the schedule builder page by clicking each class button, extracting the professor’s name from the resulting popup, and returning an array of objects containing both the button and professor name.
- **delay(ms)**: Creates a delay for better handling of asynchronous interactions, such as waiting for popups to appear.

## popup.js

### What It Does

The `popup.js` script manages the behavior of the popup window that appears when the user clicks the Chrome extension icon. It handles user interactions, such as initiating searches for professor ratings or deleting saved ratings, and dynamically updates the popup content to display saved professors' ratings.

### Usage of popup.js

This script runs automatically when the extension's popup is opened by the user. It listens for user actions, such as clicking buttons to search for ratings or delete saved ratings, and communicates with other parts of the extension to carry out these tasks.

### Main Functions in popup.js

- **Event Listeners**:
  - **`Start Button Click`**: Sends a message to the background script to start searching for professor ratings. It also disables the button and changes its text to "searching...".
  - **`Chrome Runtime Message Listener`**: Listens for a message to reset the start button (e.g., after a search is completed).
  - **`Tab URL Check`**: Disables the start button if the user is not on the Chico State University student portal.
  - **`Delete Button Click`**: Handles the deletion of a saved professor rating by removing it from storage and updating the UI.
- **`handleDelete(eventData)`**: Removes a saved professor rating from storage based on its ID and updates the display.
- **`renderList(buttonsData)`**: Renders a list of saved professor ratings in the popup. If no data exists, it displays a message prompting users to save ratings.

### Data Management in popup.js

- The script uses Chrome’s storage API to store and retrieve saved professor ratings. The stored data includes professor names, ratings, and any other relevant information the user has interacted with.
- The `renderList` function displays this saved data dynamically in the popup when opened.

## teacherUtils.js

### What It Does

The `teacherUtils.js` script is responsible for managing communication between the content script and the background script to retrieve professor information and ratings from an external API (Rate My Professors). It offers utility functions that help the content script fetch detailed information about professors, including their ratings.

### Usage of teacherUtils.js

This module is imported and used by the content script to retrieve professor information and ratings. The primary function to call is `getProfInfo(profName)`, which handles the entire process of fetching and returning professor ratings.

### Main Functions in teacherUtils.js

- **`getTeacherInfo(profName)`**: Retrieves basic information about a professor, including their ID, by querying the background script.
- **`getTeacherRating(profID)`**: Fetches detailed ratings for a professor using their unique ID. This is done by querying the background script.
- **`getProfInfo(profName)`**: Combines the previous two functions to retrieve comprehensive information about a professor, including their ratings. If the professor is found, it returns the ratings; otherwise, it returns `null`.

## background.js

### What It Does

The `background.js` script acts as the background script for the Chrome extension, facilitating communication between the content script and external services, such as the Rate My Professors API. It handles API calls, processes data, and manages messaging between different parts of the extension. It also listens for incoming requests from content and popup scripts to fetch professor data or trigger actions.

### Usage of background.js

This script runs continuously while the Chrome extension is active and responds to messages from the content script and popup. It is responsible for making external API requests to fetch professor information and ratings and for managing other asynchronous processes.

### Message Types in background.js

- **`startSearch`**: Triggered when the content script requests a search for professor ratings.
- **`renableButton`**: Re-enables a button in the content script after a rating is deleted from the popup.
- **`teacherInfo`**: Queries the Rate My Professors API to retrieve basic information (e.g., ID) for a professor based on their name.
- **`teacherRating`**: Fetches detailed ratings for a professor using their ID.
- **`updatePopup`**: Placeholder for a future function that may be used to update the popup dynamically.

### Key Functions in background.js

- **Search Teacher Information**: This function searches for a professor using their name and the specific school identifier for Chico State University (`'U2Nob29sLTE1OQ=='`). It is used to get basic information such as the professor’s ID.
- **Get Teacher Ratings**: This function retrieves detailed ratings for a professor using their ID from Rate My Professors.
