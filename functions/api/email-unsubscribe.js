// //simple overview of shopify webhooks.. also use beeceptor to test
// //https://gist.github.com/magician11/08a226555161d633e21fc2bcf374e708


// import admin from "firebase-admin";
// import functions from "firebase-functions";
// import express from "express";
// import bodyParser from "body-parser";
// import { title } from "process";



// const emailUnsubscribe = express();
// emailUnsubscribe.use(bodyParser.json());
// emailUnsubscribe.use(bodyParser.urlencoded({
//     extended: true,
// }));

// emailUnsubscribe.get("/", async (req, res) => {


//     //must include ?email={email}
//     const email = req.query.email;
//     const current_timestamp_milliseconds = new Date().getTime();
//     const current_timestamp = current_timestamp_milliseconds / 1000;
    
//     console.log("requested unsubcribe for");
//     console.log(email);

//     const unsubObject = {
//         eml: email,
//         timestamp: current_timestamp
//     };

//     await admin.firestore().collection("unsubscribe").add(unsubObject)
//     .then(() => {
//         res.redirect("https://www.uncommon.app/unsubscribed");
//     });
    
// });

// export default emailUnsubscribe;