// #region setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import { checkAccount, createPayout } from "./helpers/stripe-helper.js";
import { getTimestamp } from "./helpers/helper.js";
// #endregion

//JUST NEED THE ACCT_ID & THE AMOUNT_IN_CENTS FOR WHEN YOU POST THIS!

const create_stripeAccount_payout = functions.firestore
  .document('stripe_accounts/{user_id}/payout/{doc_id}')
  .onCreate(async (snap, context) => {

    const user_id = context.params.user_id;
    const account_id = snap.data().acct_id;
    const amount_in_cents = snap.data().amount_in_cents;

    //step 1: retrieve the account and then grab the external account's properties (i.e. bank_account vs. card, payout_methods = standard / instant)
    //step 2: create a payout, add a new entry to /cash with id = {payout_id}
    //step 3: indicate whether the payout succeeded or not

    const account = await checkAccount(account_id);

    if (account.external_accounts) {

        const source_type = account.external_accounts.data[0].object;
        const methods = account.external_accounts.data[0].available_payout_methods;
        const method = ((methods.includes("instant")) ? "instant" : "standard");
        
        const payout = await createPayout(account_id, amount_in_cents, method, source_type);

        console.log(payout);

        return admin.firestore().collection("cash").doc(payout.id).update({"amount": amount_in_cents});

    } else {
        console.log("NO EXTERNAL ACCOUNTS LISTED!!")

        return;
    }
});

export default create_stripeAccount_payout;
