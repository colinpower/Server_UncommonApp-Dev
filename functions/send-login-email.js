import admin from "firebase-admin";
import functions from "firebase-functions";
import fetch from "node-fetch";

import sgMail from "@sendgrid/mail";
//const sgMail = require('@sendgrid/mail')
import dotenv from "dotenv";
import { getAuth } from "firebase-admin/auth";

dotenv.config();

const sendLoginEmail = functions.firestore
  .document('auth/{authID}')
  .onCreate(async (snap, context) => {

    //NOTE: This could be a user who is logging in, or signing up for the first time
    const userObject = snap.data();
    const userEmail = userObject.email;

    sgMail.setApiKey("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");

    var msg = {
        to: 'colin@uncommon.app', // Change to your recipient
        from: 'info@uncommon.app', // Change to your verified sender
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };


    const actionCodeSettings = {
        url: 'https://uncommonapp.page.link/sign-in',
        handleCodeInApp: true,
        iOS: {
          bundleId: 'UncommonInc.UncommonApp',
        },
        dynamicLinkDomain: 'uncommonapp.page.link',
      };
    
    
    getAuth()
        .generateSignInWithEmailLink(userEmail, actionCodeSettings)
        .then((link) => {
            // Construct sign-in with email link template, embed the link and
            // send using custom SMTP server.
            console.log(link);
            return updateEmailWithLink(msg, link)
            //return sendSignInEmail(userEmail, displayName, link);
        })
        .then((msg) => {
            sgMail.send(msg)
                .then(() => {
                    console.log('Email sent')
                })
                .catch((error) => {
                    console.error(error)
                })
        })
        .catch((error) => {
            // Some error occurred.
        });

    //send to Sendgrid

    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs
    //const sgMail = require('@sendgrid/mail')
    
    //sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    

    
});

export default sendLoginEmail;


const updateEmailWithLink = (object, link) => {
    
    object.html = '<a href="' + link + '">link text</a>'
    
    return object
}




   // //Create the additional variables you need
    // const title = code + " for $" + rewardAmount.toString() + " (spent " + pointsSpent.toString() + " Points)";


    // //Create the JSON to send to the GraphQL API
    // const createJSON = {
    //     code: code,
    //     rewardAmount: rewardAmount,
    //     domain: domain,
    //     title: title,
    //     usageLimit: 1
    // }; 

    // //make a request to create the discount
    // const response = await fetch("https://us-central1-uncommon-loyalty.cloudfunctions.net/shopify_createDiscount", {
    //     method: "POST", 
    //     body: JSON.stringify(createJSON),
    //     headers: { "Content-Type": "application/json" }
    // });
    
    // if (response.status == 201) {

    //     console.log(code);
    //     console.log("Discount created successfully!");

    //     // grab the response from Shopify
    //     const responseData = await response.json();
        
    //     // grab updates for the discount object
    //     const gid = responseData.graphqlID;

    //     //check to see if it's a PERSONAL-CARD-PERMANENT or just a regular single-use code
    //     const cardType = snap.data().card.cardType;

    //     if (cardType == "PERSONAL-CARD-PERMANENT") {

    //         //if so, mark it as pending (don't know if user wants it yet)
    //         discountObject.status.status = "CREATED-PendingUserApproval";

    //     } else {

    //         discountObject.status.status = "ACTIVE";

    //     }


    //     discountObject.ids.graphQLID = gid; 

    //     return admin.firestore().collection("discount").doc(discountID).update(discountObject);

    // } else {

    //     console.log(code);
    //     console.log("ERROR CREATING DISCOUNT");

    //     // const discountUpdate = {
    //     //     code: code,
    //     //     available: false
    //     // };

    //     discountObject.status.failedToBeCreated = true;
    //     discountObject.status.status = "UNAVAILABLE";

    //     return admin.firestore().collection("discount").doc(discountID).update(discountObject);
    // }
