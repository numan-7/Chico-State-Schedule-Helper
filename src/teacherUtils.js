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

const getProfInfo = async (profName) => {
    // get teacher's info, just looking for the id
    const teacherInfo = await getTeacherInfo(profName);
    // if a teacher is found
    if (teacherInfo.teacher.length > 0) {
        // using that teacher's id, return the teachers rating
        const teacherRating = await getTeacherRating(teacherInfo.teacher[0].id);
        return teacherRating.rating;
    } else {
        // teacher not found
        return null;
    }
};

export {getProfInfo}