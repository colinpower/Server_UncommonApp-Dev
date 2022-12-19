// setup dependencies
import admin from "firebase-admin";
import functions from "firebase-functions";

const checkOTPOnUpdate = functions.firestore
  .document('users/{userID}/auth_request/{authUUID}')
  .onUpdate(async (change, context) => {

    //First, get the entire new verification object (to be updated later)
    const newVerificationObject = change.after.data();

    if (newVerificationObject.auth_code_submitted == "") {
        return;
    } else {

        //Then, get the userID and the verificationID
        const userID = context.params.userID;
        const authUUID = context.params.authUUID;

        //Then, grab the other relevant values
        const phone = newVerificationObject.phone;
        const timestamp_expires = newVerificationObject.timestamp_expires;

        const current_timestamp_milliseconds = new Date().getTime();
        const timestamp_submitted = Math.round(current_timestamp_milliseconds / 1000);
        
        
        // "phone": phone,
        //     "timestampCreated": timestampCreated,
        //     "timestampExpires": timestampExpires,
        //     "timestampSubmitted": -1,
        //     "uncommonGeneratedCode": "",
        //     "userSubmittedCode": "",

        //Then, get the user's submitted code
        const auth_code_submitted = newVerificationObject.auth_code_submitted;
        const auth_code_generated = newVerificationObject.auth_code_generated;

        //ALSO CHECK IF TIME HAS EXPIRED!!
        if ((auth_code_submitted == auth_code_generated) && (timestamp_submitted < timestamp_expires)) {

            var verificationUpdate = {
                "profile.phone_verified": true,
                "profile.phone": phone
            }

            await admin.firestore().collection("users").doc(userID).update(verificationUpdate);

        } 
        // else {
            
        //     var verificationUpdate = {
        //         "isVerified": true,
        //         "phone": phone,
        //         "timestamp": timestampSubmitted,
        //         "verificationID": verificationID
        //     } 
        // }

        //return admin.firestore().collection("users").doc(userID).collection("getVerificationResult").doc(verificationID).set(verificationUpdate);
    }
});

export default checkOTPOnUpdate;