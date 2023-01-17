// #region setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import { createAccount, createAccountLink } from "./helpers/stripe-helper.js";
import { getTimestamp } from "./helpers/helper.js";
// #endregion

const stripeCreate = functions.firestore
  .document('stripe/{stripe_id}')
  .onCreate(async (snap, context) => {

    const user_id = context.params.stripe_id;

    const stripe_user = snap.data();

    const account = await createAccount(stripe_user);

    console.log(account.id);

    const link = await createAccountLink(account.id);

    console.log(link);

    const update = createUpdateObject(stripe_user, account, link)

    return admin.firestore().collection("stripe").doc(user_id).update(update);
});

export default stripeCreate;

// #region private helper createUpdateObject(stripe_user, account, link)
const createUpdateObject = (stripe_user, account, link) => {

    const update = {
        "account": {
            "id": account.id,
            "link": link,
            "charges_enabled": account.charges_enabled,
            "details_submitted": account.details_submitted,
            "currently_due": account.requirements.currently_due,
            "eventually_due": account.requirements.eventually_due
        },
        "timestamp": {
            "created": stripe_user.timestamp.created,
            "last_updated": getTimestamp()
        }
    }

    return update;
};
// #endregion
