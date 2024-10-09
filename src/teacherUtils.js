/*

    This code sends messages to the background script [background.js] and signals to make the API
    to get the information

*/


// get's teacher info, only looking at the id from this 
const getTeacherInfo = async (profName) => {
    return new Promise((resolve, reject) => {
        try {
            chrome.runtime.sendMessage({
                    action: 'teacherInfo',
                    profName: profName
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(response);
                    }
                }
            );
        } catch (error) {
            console.error('Error:', error);
            reject(error);
        }
    });
};

// gets the teacher's ratings and all that
const getTeacherRating = async (profID) => {
    return new Promise((resolve, reject) => {
        try {
            chrome.runtime.sendMessage({
                    action: 'teacherRating',
                    profID: profID
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(response);
                    }
                }
            );
        } catch (error) {
            console.error('Error:', error);
            reject(error);
        }
    });
};

const getSimilarity = (s1, s2) => {
    let longer = s1.length > s2.length ? s1 : s2;
    let shorter = s1.length > s2.length ? s2 : s1;
    let sameCharCount = 0;

    for (let i = 0; i < shorter.length; i++) {
        if (longer[i] && longer[i].toLowerCase() === shorter[i].toLowerCase()) {
            sameCharCount++;
        }
    }

    return (sameCharCount / longer.length) * 100;
};

const getProfInfo = async (profName) => {
    // Split the input professor name into first and last name
    const [inputFirstName, inputLastName] = profName.split(" ");

    // Get teacher's info, just looking for the id
    const teacherInfo = await getTeacherInfo(profName);
    
    // If a teacher is found
    if (teacherInfo.teacher.length > 0) {
        let chosenId;
        const threshold = 80;
        
        // First pass: look for an exact match
        for (let i = 0; i < teacherInfo.teacher.length; i++) {
            const firstName = teacherInfo.teacher[i].firstName.trim();
            const lastName = teacherInfo.teacher[i].lastName.trim();

            if (firstName === inputFirstName && lastName === inputLastName) {
                chosenId = teacherInfo.teacher[i].id;
                break; 
            }
        }

        // If no exact match, proceed with similarity check
        if (!chosenId) {
            let bestMatchPercentage = 0;
            for (let i = 0; i < teacherInfo.teacher.length; i++) {
                const firstName = teacherInfo.teacher[i].firstName.trim();
                const lastName = teacherInfo.teacher[i].lastName.trim();

                // Check if first letters of first/last names match
                if (firstName[0].toLowerCase() == inputFirstName[0].toLowerCase() && lastName[0].toLowerCase() == inputLastName[0].toLowerCase()) {
                    // Calculate similarity for both first and last names
                    const firstNameSimilarity = getSimilarity(firstName, inputFirstName);
                    const lastNameSimilarity = getSimilarity(lastName, inputLastName);

                    // Average similarity of first and last name
                    const totalSimilarity = (firstNameSimilarity + lastNameSimilarity) / 2;

                    if (totalSimilarity >= threshold && totalSimilarity > bestMatchPercentage) {
                        bestMatchPercentage = totalSimilarity;
                        chosenId = teacherInfo.teacher[i].id;
                    }
                }
            }
        }

        if (!chosenId) {
            return null;
        } 

        const teacherRating = await getTeacherRating(chosenId);
        return teacherRating.rating;
    } else {
        // No teacher found in the info
        return null;
    }
};


export {getProfInfo}