// #region Import and Setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import { checkMyBalance, transferCash } from "./helpers/stripe-helper.js";
// #endregion

const update_Referrals = functions.firestore
  .document('referrals/{doc_id}')
  .onUpdate(async (change, context) => {

    const doc_id = context.params.doc_id;

    const doc_before = change.before.data();
    const doc_after = change.after.data();

    const isApproved = checkForApproval(doc_before, doc_after);
    
    if (isApproved) {
        console.log("APPROVED");
        // create a CODE or create a TRANSFER depending on what the /referral.commission is
        if (true) {       //check whether CODE or TRANSFER

            const balance = await checkMyBalance();     //figure out how much cash I have in the bank

            console.log(balance);

            const value = 100;      // figure out how much i gotta transfer

            const acct_id = await getAcctID(doc_after.uuid.user)

            console.log(acct_id);

            console.log(balance.available[0].amount);

            if (balance.available[0].amount > value) {

                console.log("about to transfer");

                const transfer_id = await transferCash(value, acct_id, doc_id);

                console.log(transfer_id);

                return

            } else {

                console.log("ERROR.. NOT ENOUGH $ TO PAY THIS PERSON")

            }

        }

        return;

    } else {

        console.log("NOT APPROVED");
        return;
    }
});

export default update_Referrals;


// #region checkForApproval(doc_before, doc_after)
const checkForApproval = (doc_before, doc_after) => {

    const before = doc_before.status;
    const after = doc_after.status;

    return (((after) == "APPROVED") && ((before) != "APPROVED"))
};
// #endregion

// #region getAcctID(user_id)
const getAcctID = async (user_id) => {

    const acct_id = await admin.firestore().collection("stripe_accounts").doc(user_id).get()
    .then((result) => {
        if (result) {
            return result.data().account.acct_id;
        } else {
            return;
        }
    });
    
    return acct_id;

};
// #endregion

