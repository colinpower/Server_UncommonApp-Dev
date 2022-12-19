import admin from "firebase-admin";
import functions from "firebase-functions";

const authOnCreate = functions.auth
.user()
.onCreate(async (user) => {
    
    if (user.emailVerified) {

        var email = "";
        email = user.email

        var userID = "";
        userID = user.uid;

        const current_timestamp_milliseconds = new Date().getTime();
        const current_timestamp = Math.round(current_timestamp_milliseconds / 1000);

        //create their first loyalty program
        const userDoc = {
            account: {
                available_cash: 0,
                available_discounts: 0
            },
            doc_id: userID,
            profile: {
                email: email,
                first_name: "NOTSET",
                last_name: "NOTSET",
                phone: "NOTSET",
                phone_verified: false
            },
            settings: {
                notifications: false
            },
            timestamps: {
                joined: current_timestamp
            }
        };

        return admin.firestore().collection("users").doc(userID).set(userDoc);
        
    } else {
        return
    }
});

export default authOnCreate;