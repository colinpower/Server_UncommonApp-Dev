// setup dependencies
import admin from "firebase-admin";
import functions from "firebase-functions";
import Twilio from 'twilio';


//setup Twilio
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const client = Twilio("ACb29e6d7564942b03df0c5d5bde934d15", "15f1191b9ffd31b9209d810446eb2689");
const twilioNumber = '+18656012429'


const requestVerificationCodeOnCreate = functions.firestore
  .document('users/{userID}/auth_request/{authUUID}')
  .onCreate(async (snap, context) => {

    //First, get the entire verification object (to be updated later)
    const verificationObject = snap.data();

    //Then, get the userID and the verificationID
    const userID = context.params.userID;
    const authUUID = context.params.authUUID;

    //Then, get the user's phone number
    const phone = snap.data().phone

    //Confirm that the phone number is in the correct format (i.e. +1 and then 10 digits)
    
    // TO DO LATER

    //Then, create a random 4 digit code
    const chars = "1234567890";
    const randomArray = Array.from(
        { length: 4 },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );

    const uncommonGeneratedCode = randomArray.join("");

    var verificationUpdate = {
        "auth_code_generated": uncommonGeneratedCode
    }

    await admin.firestore().collection("users").doc(userID).collection("auth_request").doc(authUUID).update(verificationUpdate);

    const messageToUser = "Uncommon App: Your verification code is " + uncommonGeneratedCode + ". This code expires in 3 minutes."

    //Then, send this code to the user
    return client.messages
        .create({
            body: messageToUser,
            from: twilioNumber,
            to: phone
        })
        .then(message => console.log(message.sid));

});

export default requestVerificationCodeOnCreate;
    
