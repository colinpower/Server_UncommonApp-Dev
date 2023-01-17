// #region Import and Setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import { getTimestamp } from "./helpers/helper.js";
import { transferCash } from "./helpers/stripe-helper.js";
// #endregion

const create_Cash = functions.firestore
  .document('cash/{doc_id}')
  .onCreate(async (snap, context) => {
 
    const doc_id = context.params.doc_id;
    const doc = snap.data();

    if ( doc.type == "TRANSFER" ) {

        const amount = doc.value * 100;
        const acct_id = getStripeAccountID(doc.uuid.user)

        const transaction_id = await transferCash(amount, acct_id, doc.uuid.referral)

        if (transaction_id) {
            console.log("success + " (transaction_id.toString()));
            return updateDocumentWithStatus(doc_id, doc, "SUCCESS")
        } else {
            console.log("ERROR... didn't do the transaction correctly");
            return updateDocumentWithStatus(doc_id, doc, "FAILURE")
        }

    } else if ( doc.type == "PAYOUT" ) {

        // get the user's stripe_account
        // request a transfer of $X to their account
        // update "STATUS" to "DONE" or "FAILED"

    } else {
        console.log("error.. neither a TRANSFER nor a PAYOUT")
        return;
    }

    // shop {}
    // status
    // type
    // timestamp.created
    // timestamp.transfer
    // timestamp.payout
    // uuid {}
    // value
});

export default create_Cash;


// #region getStripeAccountID(uid)
export async function getStripeAccountID(uid) {
    
    const stripe_user = await admin.firestore().collection("stripe_accounts").doc(uid).get()

    return stripe_user.account.acct_id;
};
// #endregion


// #region updateDocumentWithStatus(uid, status)
export async function updateDocumentWithStatus(doc_id, doc, status) {

    doc.status = status
    doc.timestamp.transfer = getTimestamp();
    
    return admin.firestore().collection("cash").doc(doc_id).update(doc)

};
// #endregion