import admin from "firebase-admin";
import functions from "firebase-functions";
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51LpX0FI2TxC7l4Yf57QKnsPHQplHG5TW7IR3fQMwssScbJcSQ8kZMzsxridu1FvPzby7AveWjuAFWtkBRM3NLax80037hMRtyH');


// const customer = await stripe.customers.create({
//   email: 'customer@example.com',
// });

// console.log(customer.id);



// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys


const account = await stripe.accounts.create({type: 'express'});

const account = await stripe.accounts.create({
    country: 'US',
    type: 'express',
    email: 'colin@uncommon.app',
    capabilities: {transfers: {requested: true}},
    business_type: 'individual',
    business_profile: {url: 'https://uncommon.app'},
    individual: {
        first_name: 'first_name',
        last_name: 'last_name',
        phone: 'phone_number'    //"+16177772994"
        // address: {
        //   city: 'city',
        //   line1: 'address1',
        //   line2: 'address2',
        //   postal_code: 'zip_code'
        // }
      }
  });

//Save account info to the user's profile

//Create account link (temporary)

  const account_id = account.id;


  const accountLink = await stripe.accountLinks.create({
    account: account_id,
    refresh_url: 'https://example.com/reauth',
    return_url: 'https://example.com/return',
    type: 'account_onboarding',
  });

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