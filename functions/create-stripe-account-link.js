// #region setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import { createAccount, createAccountLink } from "./helpers/stripe-helper.js";
import { getTimestamp } from "./helpers/helper.js";
import { getUser } from "./helpers/firestore-helper.js";
// #endregion

//JUST NEED A TIMESTAMP FOR WHEN YOU POSTED THIS!

const create_stripeAccount_link = functions.firestore
  .document('stripe_accounts/{user_id}/link/{doc_id}')
  .onCreate(async (snap, context) => {

    const user_id = context.params.user_id;
    const user = await getUser(user_id)

    const autofill_object = {
        email: user.profile.email,
        phone: user.profile.phone,
        first: user.profile.name.first,
        last: user.profile.name.last
    };

    const account = await createAccount(autofill_object);
    
    const link = await createAccountLink(account.id);

    return updateStripeAccountUponCreation(user_id, account, link);
});

export default create_stripeAccount_link;

// #region private helper updateStripeAccountUponCreation(user_id, account, link)
const updateStripeAccountUponCreation = async (user_id, account, link) => {

    const update = {
        "setup.charges_enabled": account.charges_enabled,
        "setup.details_submitted": account.details_submitted,
        "setup.currently_due": account.requirements.currently_due,
        "setup.eventually_due": account.requirements.eventually_due,
        "setup.link": link,
        "account.acct_id": account.id,
        "timestamp.created": getTimestamp(),
    };

    return admin.firestore().collection("stripe_accounts").doc(user_id).update(update);
};
// #endregion
