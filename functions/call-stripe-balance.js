// #region Import and Setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import { checkBalance } from "./helpers/stripe-helper.js";
import { getTimestamp } from "./helpers/helper.js";
// #endregion

const call_stripe_balance = functions.https.onCall(async (data, context) => {
 
    // Message text passed from the client.
    const acct_id = data.acct_id;

    // Authentication / user information is automatically added to the request.
    const user_id = context.auth.uid;

    const balance = await checkBalance(acct_id); 

    if (balance.available) {
    
        console.log(balance);

        const object = {
            "account.balance": ((balance.available) ? balance.available[0].amount : 0)
        };

        await admin.firestore().collection("stripe_accounts").doc(user_id).update(object);

        return { "result": "SUCCESS" };

    } else {
        return { "result": "ERROR" };
    }
});

export default call_stripe_balance;