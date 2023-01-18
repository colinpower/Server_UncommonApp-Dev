// #region setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import { checkBalance } from "./helpers/stripe-helper.js";
import { getTimestamp } from "./helpers/helper.js";
// #endregion

//JUST NEED AN ACCOUNT_ID FOR WHEN YOU POSTED THIS!

const create_stripeAccount_balance = functions.firestore
  .document('stripe_accounts/{user_id}/balance/{doc_id}')
  .onCreate(async (snap, context) => {

    const user_id = context.params.user_id;
    const acct_id = snap.data().acct_id;
    
    const balance = await checkBalance(acct_id);

    console.log(balance);

    const object = {
        "account.balance": ((balance.available) ? balance.available[0].amount : 0)
    };

    return admin.firestore().collection("stripe_accounts").doc(user_id).update(object);
});

export default create_stripeAccount_balance;

//acct_1MRSxRRMzqhAloMa