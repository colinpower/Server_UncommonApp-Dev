// #region Import and Setup
import admin from "firebase-admin";
import functions from "firebase-functions";
// #endregion

const update_authPhone = functions.firestore
  .document('auth_phone/{doc_id}')
  .onUpdate(async (change, context) => {

    const doc_after = change.after.data();

    const isVerified = checkVerification(doc_after);
    
    if (isVerified) {

        return updateUserWithVerifiedPhone(doc_after);

    } else {

        return;
    }
});

export default update_authPhone;


// #region checkVerification(doc_after)
const checkVerification = (doc) => {

    //Check if a code has been submitted
    var a = (doc.submitted_code != "");

    //Check if codes match
    var b = (doc.submitted_code == doc.correct_code);
    
    //Check if timestamps exceeded
    var c = (doc.timestamp.submitted < doc.timestamp.expires);

    return (a && b && c)
};
// #endregion

// #region updateUserWithVerifiedPhone(doc_after)
const updateUserWithVerifiedPhone = async (doc) => {

    var object = {
        "profile.phone": doc.phone,
        "profile.phone_verified": true
    }

    var user_id = doc.uuid.user

    return admin.firestore().collection("users").doc(user_id).update(object);
};
// #endregion
