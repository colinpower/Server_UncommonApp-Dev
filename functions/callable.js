// #region Import and Setup
import admin from "firebase-admin";
import functions from "firebase-functions";
// #endregion

const callable = functions.https.onCall((data, context) => {
 
    // Message text passed from the client.
    const text = data.text;
    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;
    const name = context.auth.token.name || null;
    const email = context.auth.token.email || null;

    var newString = text + uid;
    
    console.log(name)
    console.log(email)

    return { text: newString };
});

export default callable;



// To return data after an asynchronous operation, return a promise

// // Saving the new message to the Realtime Database.
// const sanitizedMessage = sanitizer.sanitizeText(text); // Sanitize the message.
// return admin.database().ref('/messages').push({
//   text: sanitizedMessage,
//   author: { uid, name, picture, email },
// }).then(() => {
//   console.log('New Message written');
//   // Returning the sanitized message to the client.
//   return { text: sanitizedMessage };
// })

//HANDLE ERRORS
// // Checking attribute.
// if (!(typeof text === 'string') || text.length === 0) {
//     // Throwing an HttpsError so that the client gets the error details.
//     throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
//         'one arguments "text" containing the message text to add.');
//   }
//   // Checking that the user is authenticated.
//   if (!context.auth) {
//     // Throwing an HttpsError so that the client gets the error details.
//     throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
//         'while authenticated.');
//   }