// #region Import and Setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import { checkAccount, checkBalance, checkMyBalance, createPayout } from "./helpers/stripe-helper.js";
import { createCashPayout } from "./helpers/firestore-helper.js";
import { getTimestamp } from "./helpers/helper.js";
// #endregion

const call_stripe_payout = functions.https.onCall(async (data, context) => {
 
    // Message text passed from the client.
    const account_id = data.acct_id;
    const amount_in_cents = data.amount_in_cents;

    // Authentication / user information is automatically added to the request.
    const user_id = context.auth.uid;

    const my_balance = await checkMyBalance();

    const sources = my_balance.available[0].source_types;
    var source = ""

    console.log(sources);

    if ("card" in sources) { 
        source = "card" 
    } else if ("bank_account" in sources) {
        source = "bank_account"
    }

    console.log("SELECTED SOURCE!!!");
    console.log(source);

    const userBalance = await checkBalance(account_id);

    const account = await checkAccount(account_id);

    console.log("user account");
    console.log(account.external_accounts.data);

    if (account.external_accounts) {

        const methods = account.external_accounts.data[0].available_payout_methods;
        const method = ((methods.includes("instant")) ? "instant" : "standard");
    
        const payout = await createPayout(account_id, amount_in_cents, method, source);

        console.log(payout);

        if (payout) {

            await createCashPayout(user_id, payout.id, amount_in_cents); 

            return { "result": "SUCCESS" };
            
        } else {
            return { "result": "ERROR_PAYOUT_FAILED" };
        }
        

    } else {
        console.log("NO EXTERNAL ACCOUNTS LISTED!!")

        return { "result": "ERROR_NO_ACCOUNTS_LISTED" };
    }


});

export default call_stripe_payout;