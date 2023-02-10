// #region setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import { checkAccount, createLoginLink } from "./helpers/stripe-helper.js";
import { getTimestamp } from "./helpers/helper.js";
// #endregion

//JUST NEED THE ACCT_ID and TIMESTAMP FOR WHEN YOU POSTED THIS!

const create_stripeAccount_check = functions.firestore
  .document('stripe_accounts/{user_id}/check/{doc_id}')
  .onCreate(async (snap, context) => {

    const user_id = context.params.user_id;
    const account_id = snap.data().acct_id;

    const account = await checkAccount(account_id);
    const link = await createLoginLink(account_id);

    var update = {
        "setup.charges_enabled": account.charges_enabled,
        "setup.details_submitted": account.details_submitted,
        "setup.currently_due": account.requirements.currently_due,
        "setup.eventually_due": account.requirements.eventually_due,
        "account.link": link,
        "timestamp.last_updated": getTimestamp()
    };

    return admin.firestore().collection("stripe_accounts").doc(user_id).update(update);
});

export default create_stripeAccount_check;
