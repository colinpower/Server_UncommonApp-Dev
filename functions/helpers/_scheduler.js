// import admin from "firebase-admin";
// import functions from "firebase-functions";

// import { getTimestamp } from "./helper.js";

// const scheduledFunction = functions.pubsub.schedule("every 5 minutes").onRun((context) => {
    
//     const object = {
//         title: "this ran",
//         timestamp: getTimestamp()
//     };

//     return admin.firestore().collection("scheduler").add(object);
// });

// export default scheduledFunction;