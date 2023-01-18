import admin from "firebase-admin";
import dotenv from "dotenv";
import Stripe from 'stripe';

dotenv.config();
const stripe_token = process.env.STRIPE_TOKEN
const stripe = new Stripe(stripe_token);

// #region createAccount(autofill_object)
export async function createAccount(object) {

    const email = object.email;
    const phone = object.phone;
    const first_name = object.first;
    const last_name = object.last;

    if ((email != "") && (phone != "") && (first_name != "") && (last_name != "")) {
    
        const account = await stripe.accounts.create({
            type: 'express',
            email: email,
            capabilities: {transfers: {requested: true}},
            business_type: 'individual',
            business_profile: {url: 'https://uncommon.app'},
            individual: {
                first_name: first_name,
                last_name: last_name,
                phone: phone
            },
            settings: {
                payouts: {
                    schedule: {
                        interval: 'manual'
                    }
                }
            }
        });

        return account;

    } else {

        const account = await stripe.accounts.create({
            type: 'express',
            capabilities: {transfers: {requested: true}},
            business_type: 'individual',
            business_profile: {url: 'https://uncommon.app'},
            settings: {
                payouts: {
                    schedule: {
                        interval: 'manual'
                    }
                }
            }
        });

        return account;
    }
};
// #endregion

// #region createAccountLink(account_id)
export async function createAccountLink(account_id) {

    const refresh_url = "https://us-central1-uncommonapp-dev.cloudfunctions.net/api/stripe/refresh?account_id=" + account_id
    
    const account_link = await stripe.accountLinks.create({
        account: account_id,
        refresh_url: refresh_url,
        return_url: 'https://uncommonapp.page.link/stripe',
        type: 'account_onboarding',
    });

    return account_link.url;
};
// #endregion


export async function createLoginLink(acct_id) {
    
    const loginLink = await stripe.accounts.createLoginLink(acct_id);
    
    return loginLink;
}



// #region checkAccount(account_id)
export async function checkAccount(account_id) {

    const account = await stripe.accounts.retrieve(
        account_id
    );

    return account;
}

// #region checkBalance(account_id)
export async function checkBalance(account_id){

    const balance = await stripe.balance.retrieve({
        stripeAccount: account_id
    });

    return balance;
}
// #endregion

// #region checkBalance(account_id)
export async function checkMyBalance() {

    const balance = await stripe.balance.retrieve();

    return balance;

}

// #region transferCash(acct_id, amount, referral_id)
export async function transferCash(amount, acct_id, referral_id) {

    const transfer = await stripe.transfers.create({
        amount: amount,
        currency: 'usd',
        destination: acct_id,
        transfer_group: referral_id,
      });

    return transfer.id;
};


// NOTE: SOURCE_TYPE REFERS TO THE SOURCE OF UNCOMMON'S MONEY (I.E. WILL ALWAYS BE A BANK ACCT IN PROD, BUT WILL BE A CARD IN DEV?)
export async function createPayout(account_id, amount_in_cents, method, source_type) {
    
    const payout = await stripe.payouts.create(
        {amount: amount_in_cents, currency: 'usd', method: method, source_type: source_type},
        {stripeAccount: account_id}
      );

    return payout
}






//THE BALANCE OBJECT: https://stripe.com/docs/api/balance/balance_object




//https://stripe.com/docs/api/transfers/create
// #endregion

// #region createAccountLink -> Should be http Callable fx from iOS
    // const loginLink = await stripe.accounts.createLoginLink(
    //     'acct_1LpX0FI2TxC7l4Yf'
    //   );
// #endregion

// #region checkIfInstantPayoutsAvailable -> see bank acct ID on the account object
    // const bankAccount = await stripe.accounts.retrieveExternalAccount(
    //     'acct_1LpX0FI2TxC7l4Yf',
    //     'ba_1MP1uAI2TxC7l4Yffj6BkZhl'
    //   );
    //https://stripe.com/docsc/api/external_account_bank_accounts/retrieve
    // The object for the bank will tell you if instant payments available
        // {
        //     "id": "card_9CUH5DBY1jTgQ0",
        //     "object": "card",
        //     ...
        //     "account": "acct_1032D82eZvKYlo2C",
        //     "available_payout_methods": ["standard", "instant"],
        //   }
// #endregion


// #region createPayout....
    // const payout = await stripe.payouts.create(
    //     {amount: 1000, currency: '$merchant.currency', method: 'instant', source_type: 'card'},    //this refers to the account's card / bank acct that they've linked... always send $ to just one of them
    //     {stripeAccount: '{{CONNECTED_ACCOUNT_ID}}'}
    //   );
    //https://stripe.com/docs/connect/instant-payouts
// #endregion



                // setup.charges_enabled
                // setup.currently_due
                // setup.details_submitted
                // setup.eventually_due
                // setup.link
                // account.balance
                // account.acct_id
                // account.bank_id
                // account.methods
                // account.link
                // profile{}
                // timestamp.created
                // timestamp.last_updated
                // uuid.stripe_account
                // uuid.user



// import admin from "firebase-admin";
// import functions from "firebase-functions";
// import express from 'express';
// import fetch from "node-fetch";
// import dotenv from "dotenv";
// import Stripe from 'stripe';


// dotenv.config();
// const stripe_token = process.env.STRIPE_TOKEN

// const stripe = new Stripe(stripe_token);

// const createStripeAccountOnCreate = functions.firestore
//   .document('stripe/{user_id}/createAccount/{request_id}')
//   .onCreate(async (snap, context) => {

//     console.log("STRIPE TOKEN");
//     console.log(process.env.STRIPE_TOKEN);

//     const user_id = context.params.user_id;
//     const request_id = context.params.request_id;
//     const createAccount_obj = snap.data();

//     const name = createAccount_obj.name;

//     const account = await stripe.accounts.create({       //country: 'US',
//         type: 'express',
//         email: 'colin@uncommon.app',
//         capabilities: {transfers: {requested: true}},
//         business_type: 'individual',
//         business_profile: {url: 'https://uncommon.app'},
//         individual: {
//             first_name: name,
//             last_name: request_id,
//             phone: '+16177772994'    //"+16177772994"
//         },
//         settings: {
//             payouts: {
//                 schedule: {
//                     interval: 'manual'
//                 }
//             }
//         }
//     });

//     console.log(account.id);

//     const refresh_url = "https://us-central1-uncommonapp-dev.cloudfunctions.net/stripe/refresh?uid=" + account.id

//     const accountLink = await stripe.accountLinks.create({
//         account: account.id,
//         refresh_url: refresh_url,
//         return_url: 'https://uncommonapp.page.link/stripe',
//         type: 'account_onboarding',
//     });

//     console.log(accountLink.url);

//     var temp_object = {
//         "account_id": account.id,
//         "url": accountLink.url
//     }
//                             //.document('stripe/{user_id}/createAccount/{request_id}')
//     return admin.firestore().collection("stripe").doc(user_id).update({response: temp_object});
// });

// export default createStripeAccountOnCreate;

//Save account info to the user's profile

//Create account link (temporary)

//   const account_id = account.id;


//   const accountLink = await stripe.accountLinks.create({
//     account: account_id,
//     refresh_url: 'https://example.com/reauth',
//     return_url: 'https://example.com/return',
//     type: 'account_onboarding',
//   });




//return_url -> the way that the user returns to your application from stripe
    //no state is passed
    //doesn't mean user entered everything properly
    //you must still check whether details are correct
    //after a user is redirected, check the state of details_submitted parameter by either:
        //listening to account.updated events with a Connect Webhook
        //retrieving the account via API

//refresh_url -> should trigger a method on server to call Account LInks again with the same parameters and redirect user to Connect Onboarding flow
    //user is redirected here in a few cases:
        //link expired
        //user already visited URL
        //platform can no longer access account
        //account rejected


//EXAMPLE FOR REFRESH URL... ?KEY=VALUE
//https://www.google.com/refresh?uid={user.uuid}
    //Then in your function, retrieve the param with:
        //const uid = req.query.uid;

// ACCOUNT LINK OBJECT FROM STRIPE
// {
//     "object": "account_link",
//     "created": 1673381069,
//     "expires_at": 1673381369,
//     "url": "https://connect.stripe.com/setup/s/acct_1LpX0FI2TxC7l4Yf/xEGeaqzmZAs4"
//   }



// ACCOUNT OBJECT FROM STRIPE when you do -> const account = ....
//   {
//     "id": "acct_1MOnz2IyWZNEPOdu",
//     "object": "account",
//     "business_profile": {
//       "mcc": null,
//       "name": null,
//       "product_description": null,
//       "support_address": null,
//       "support_email": null,
//       "support_phone": null,
//       "support_url": null,
//       "url": null
//     },
//     "business_type": null,
//     "capabilities": {},
//     "charges_enabled": false,
//     "country": "US",
//     "created": 1673380785,
//     "default_currency": "usd",
//     "details_submitted": false,
//     "email": null,
//     "external_accounts": {
//       "object": "list",
//       "data": [],
//       "has_more": false,
//       "total_count": 0,
//       "url": "/v1/accounts/acct_1MOnz2IyWZNEPOdu/external_accounts"
//     },
//     "future_requirements": {
//       "alternatives": [],
//       "current_deadline": null,
//       "currently_due": [],
//       "disabled_reason": null,
//       "errors": [],
//       "eventually_due": [],
//       "past_due": [],
//       "pending_verification": []
//     },
//     "login_links": {
//       "object": "list",
//       "data": [],
//       "has_more": false,
//       "total_count": 0,
//       "url": "/v1/accounts/acct_1MOnz2IyWZNEPOdu/login_links"
//     },
//     "metadata": {},
//     "payouts_enabled": false,
//     "requirements": {
//       "alternatives": [],
//       "current_deadline": null,
//       "currently_due": [
//         "external_account",
//         "tos_acceptance.date",
//         "tos_acceptance.ip"
//       ],
//       "disabled_reason": "requirements.past_due",
//       "errors": [],
//       "eventually_due": [
//         "external_account",
//         "tos_acceptance.date",
//         "tos_acceptance.ip"
//       ],
//       "past_due": [
//         "external_account",
//         "tos_acceptance.date",
//         "tos_acceptance.ip"
//       ],
//       "pending_verification": []
//     },
//     "settings": {
//       "bacs_debit_payments": {},
//       "branding": {
//         "icon": null,
//         "logo": null,
//         "primary_color": null,
//         "secondary_color": null
//       },
//       "card_issuing": {
//         "tos_acceptance": {
//           "date": null,
//           "ip": null
//         }
//       },
//       "card_payments": {
//         "decline_on": {
//           "avs_failure": false,
//           "cvc_failure": false
//         },
//         "statement_descriptor_prefix": null,
//         "statement_descriptor_prefix_kana": null,
//         "statement_descriptor_prefix_kanji": null
//       },
//       "dashboard": {
//         "display_name": null,
//         "timezone": "Etc/UTC"
//       },
//       "payments": {
//         "statement_descriptor": null,
//         "statement_descriptor_kana": null,
//         "statement_descriptor_kanji": null
//       },
//       "payouts": {
//         "debit_negative_balances": true,
//         "schedule": {
//           "delay_days": 2,
//           "interval": "daily"
//         },
//         "statement_descriptor": null
//       },
//       "sepa_debit_payments": {}
//     },
//     "tos_acceptance": {
//       "date": null,
//       "ip": null,
//       "user_agent": null
//     },
//     "type": "express"





// Create customer in Stripe.. I don't think I need this?
// const customer = await stripe.customers.create({
//   email: 'customer@example.com',
// });

// console.log(customer.id)



// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
// const stripe = require('stripe')('sk_test_51LpX0FI2TxC7l4Yf57QKnsPHQplHG5TW7IR3fQMwssScbJcSQ8kZMzsxridu1FvPzby7AveWjuAFWtkBRM3NLax80037hMRtyH');

// const payout = await stripe.payouts.create(
//   {amount: 1000, currency: '$merchant.currency', method: 'instant', source_type: 'card'},
//   {stripeAccount: '{{CONNECTED_ACCOUNT_ID}}'}
// );


//https://stripe.com/docs/connect/instant-payouts



//RETRIEVE BALANCE
//https://stripe.com/docs/api/balance/balance_retrieve





// CREATE A TRANSFER
//https://stripe.com/docs/connect/charges-transfers

// // Set your secret key. Remember to switch to your live secret key in production.
// // See your keys here: https://dashboard.stripe.com/apikeys
// const stripe = require('stripe')('sk_test_51LpX0FI2TxC7l4Yf57QKnsPHQplHG5TW7IR3fQMwssScbJcSQ8kZMzsxridu1FvPzby7AveWjuAFWtkBRM3NLax80037hMRtyH');

// // Create a PaymentIntent:
// const paymentIntent = await stripe.paymentIntents.create({
//   amount: 10000,
//   currency: 'usd',
//   transfer_group: '{ORDER10}',
// });

// // Create a Transfer to the connected account (later):
// const transfer = await stripe.transfers.create({
//   amount: 7000,
//   currency: 'usd',
//   destination: '{{CONNECTED_STRIPE_ACCOUNT_ID}}',
//   transfer_group: '{ORDER10}',
// });

// // Create a second Transfer to another connected account (later):
// const secondTransfer = await stripe.transfers.create({
//   amount: 2000,
//   currency: 'usd',
//   destination: '{{OTHER_CONNECTED_STRIPE_ACCOUNT_ID}}',
//   transfer_group: '{ORDER10}',
// });


//CREATE A LOGIN LINK -> SHOULD USE THE FIREBASE CALLABLE FUNCTIONS FOR THIS!!!
//https://stripe.com/docs/api/account/create_login_link
//https://firebase.google.com/docs/functions/callable

// const stripe = require('stripe')('sk_test_51LpX0FI2TxC7l4Yf57QKnsPHQplHG5TW7IR3fQMwssScbJcSQ8kZMzsxridu1FvPzby7AveWjuAFWtkBRM3NLax80037hMRtyH');

// const loginLink = await stripe.accounts.createLoginLink(
//   'acct_1LpX0FI2TxC7l4Yf'
// );

// LOGIN LINK RESPONSE FROM STRIPE
// {
//     "object": "login_link",
//     "created": 1673387596,
//     "url": "https://connect.stripe.com/express/hGtkVmo9L2eD",
//     "id": "lael_N980GNHfagFbyw"
//   }