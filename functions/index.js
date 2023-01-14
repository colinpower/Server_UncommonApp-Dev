//Set up Firebase
import admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);

//Required Firebase on every file
import functions from "firebase-functions";

//Pull in all the functions from the dif files

//need to figure out how to file my functions into folders, and then also how to add mini functions to the code that can be reused

// ------- FIRESTORE COLLECTIONS --------
// auth_link            { uuid }        PURPOSE     store request for login link        OBSERVED BY     auth_link.js
// auth_otp             { uuid }        PURPOSE     store OTP code                      OBSERVED BY     auth_otp.js, auth_otp_UPDATE.js
// auth_shopify         { domain }      PURPOSE     store shop's shopify auth details   OBSERVED BY     auth_shopify.js
// campaigns            { uuid }        PURPOSE     store data for shop's campaigns     N/A
// cash                 { uuid }        PURPOSE     store transfers & payouts           OBSERVED BY     ---- 1. on create cash/id=PAYOUT, trigger payout.   2. on create cash/id=TRANSFER, reload stripe/id balance  ----
// codes                { uuid }        PURPOSE     all codes (referral, reward)        OBSERVED BY     codes.js, codes_modify.js
// memberships          { uid-shopid }  PURPOSE     user's personal shop membership     OBSERVED BY     memberships.js
// orders               { uuid }        PURPOSE     store order details                 OBSERVED BY     orders.js, orders_UPDATE.js
// referrals            { uuid }        PURPOSE     store details of a referral         OBSERVED BY     referrals_modify.js
// shops                { uuid }        PURPOSE     store details of a shop             N/A
// stripe_account       { userid }      PURPOSE     store user's stripe acct            OBSERVED BY     stripe_account_check.js
// users                { uuid }        PURPOSE     store details of a user             N/A

// ------- FIRESTORE TRIGGERS --------
// auth_link.js         CREATE          auth_link       THEN            create login link, send via sendgrid
// auth_otp.js          CREATE          auth_otp        THEN            create OTP, send via twilio
// auth_otp_UPDATE.js   UPDATE          auth_otp        THEN            check OTP, update users/id with phone_verified=TRUE
// auth_shopify.js      CREATE          shopify         THEN            create shop/id, campaign/id (mostly empty) for the shop to edit in the Shopify App
// auth_user.js         CREATE          USER            THEN            create users, stripe_account          
// cash.js              CREATE          cash            THEN            trigger a TRANSFER or a PAYOUT
// codes.js             CREATE          codes           THEN            create the code in shopify using graphql
// codes_modify.js      CREATE          codes/modify    THEN            try to change the code in shopify
// memberships.js       CREATE          memberships     THEN            create a new code/id using the default campaign
// orders.js            CREATE          orders          THEN            check for code usage
// orders_UPDATE.js     UPDATE          orders          THEN            if order cancelled, mark discount code unused, delete referral
// referrals_UPDATE.js  UPDATE          referrals       THEN            either CONFIRM, FLAG, CANCEL... if CONFIRM, create the cash/id or the code/id and mark the id
// stripe_account_check.js      CREATE      .../check       THEN            check whether all details of the user's account are complete
// stripe_account_link.js       CREATE      .../link        THEN            create the accountlink for the first time, post to the stripe_account/id
// stripe_account_balance.js    CREATE      .../balance     THEN            reload the user's balance

// ------- API ENDPOINTS --------
// api_shopify.js       api/shopify/            FOR         webhook for create order                POST TO         orders
//                      api/shopify/            FOR         webhook for cancel order                UPDATE          orders
// api_stripe.js        api/stripe/refresh      FOR         refresh account_signup URL              REDIRECT        to /new_signup_url
//                      api/stripe/             FOR         listen to signup success                POST TO         stripe_account
// api_sendgrid.js      api/sendgrid            FOR         unsubscribe user from email             POST TO         unsubscribe

// ------- PRIVATE FIRESTORE FUNCTIONS --------
// sendWithTwilio
// sendWithSendgrid
// createStripePayout
// createStripeTransfer
// createShopifyCode
// modifyShopifyCode
// createLoginLink
// createOTP

// ------- OTHER PRIVATE FUNCTIONS --------
// sendWithTwilio
// sendWithSendgrid
// createStripePayout
// createStripeTransfer
// createShopifyCode
// modifyShopifyCode
// createLoginLink
// createOTP

// ------- SCHEMAE --------
// auth_link
                // email
                // timestamp

// auth_otp
                // correct_code
                // submitted_code
                // uuid.auth_otp
                // uuid.user
                // phone
                // timestamp.created
                // timestamp.expires
                // timestamp.submitted

// auth_shopify / { domain }
                // shop {}
                // session.scope
                // session.shop
                // session.token
                // timestamp.created
                // timestamp.updated
                // timestamp.deleted
                // uuid.shop

// campaigns                                                
                // commission {}        
                // color                    
                // requirements.customers_only              
                // requirements.referral_count              
                // requirements.users                        
                // offer {}                                  
                // status                                    
                // timestamp.created                         
                // timestamp.expires                         
                // timestamp.starts

// cash
                // shop {}
                // status
                // timestamp.created
                // timestamp.transfer
                // uuid {}
                // value

// codes
                // code {}                
                // purpose = REWARD / REFERRAL
                // shop {}
                // stats.usage_count
                // stats.usage_limit
                // status = PENDING / ACTIVE / FAILED / DELETED / EXPIRED
                // timestamp.created
                // timestamp.deleted
                // timestamp.last_used
                // timestamp.pending
                // uuid {}

// codes/{id}/modify
                // code {}
                // new_code
                // shop {}
                // status = PENDING / ACTIVE / FAILED / DELETED / EXPIRED
                // timestamp.created
                // timestamp.updated
                // uuid

// memberships
                // campaigns
                // default_campaign
                        // commission {}
                        // offer {}
                        // uuid.code
                        // uuid.campaign
                // shop {}
                // shopify_customer_id
                // status
                // timestamp.created
                // timestamp.disabled
                // uuid {}

// orders
                // codes.amount
                // codes.code
                // codes.type
                // order.email
                // order.first_item_title
                // order.number
                // order.confirmation_url
                // order.phone
                // order.price
                // order.shopify_order_id
                // order.status
                // shop {}
                // timestamp.created
                // timestamp.disabled
                // timestamp.updated
                // uuid {} -> refers to the person who made the order!
                // referrer.code
                // referrer.membership
                // referrer.uuid

// referrals
                // commission {}
                // code
                // revenue
                // shop {}
                // status
                // modifiedBy
                // timestamp.created
                // timestamp.completed
                // timestamp.returned
                // timestamp.flagged
                // timestamp.deleted
                // uuid {}

// shops
                // profile {}
                // campaigns
                // shop {}
                // timestamp.created
                // timestamp.deleted
                // uuid.shop

// stripe_accounts
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

// stripe_accounts /check /link /balance
                // timestamp
                // acct_id

// users
                // profile{}
                // settings.has_notifications
                // timestamp.created
                // timestamp.deleted
                // uuid.user

// -> code
        // code.code
        // code.color
        // code.graphql_id
        // code.is_default

// -> commission
        // duration_pending
        // offer
        // type
        // value

// -> offer
        // one_per_customer
        // minimum_spend
        // offer
        // type
        // timestamp.expires
        // timestamp.starts
        // total_usage_limit
        // value

// -> profile
        // email
        // name.first
        // name.last
        // phone
        // phone_verified

// -> shop
        // category
        // description
        // domain
        // name
        // website

// -> uuid
        // campaign
        // cash
        // code
        // membership
        // order
        // referral
        // shop
        // user


// ----- NEW FUNCTIONS SYSTEM HERE ------
import sendLoginEmail from "./send-login-email.js";     // auth_Create                  ->      api_sendgrid
import requestVerificationCodeOnCreate from "./requestVerificationCode-onCreate.js"; // ->      api_twilio
import checkOTPOnUpdate from "./checkOTP-onUpdate.js";  // user_authrequest_Create      ->      api_twilio__onUpdate
import authOnCreate from "./auth-onCreate.js";          // auth_Create  (RENAME!)       ->      auth
import codeOnCreate from "./code-on-create.js";         // code_Create                  ->      code
import codeOnUpdate from "./code-on-update.js";         // code_updateCreate            ->      code__change
import orderOnCreate from "./on-create.js";             // order_Create                 ->      order
import stripeCreate from "./stripe-create.js";          // stripe_Create                ->      stripe_acct
import stripeRetrieve from "./stripe-retrieve.js";      // stripe_retrieveCreate        ->      stripe_acct__retrieve

import scheduledFunction from "./_scheduler.js";      


export const stripe_create = stripeCreate;
export const send_login_email = sendLoginEmail;
export const auth_onCreate = authOnCreate;
export const order_onCreate = orderOnCreate;
export const code_onCreate = codeOnCreate;
export const code_onUpdate = codeOnUpdate;
export const stripe_retrieve = stripeRetrieve;
export const requestVerificationCode_OnCreate = requestVerificationCodeOnCreate;
export const checkOTP_OnUpdate = checkOTPOnUpdate;

export const scheduler = scheduledFunction;


// ---- Shopify Import ----
import shopifyAuth from "./shopify-auth.js";                // express app for auth     ->      api_shopify
import shopifyCreateCode from "./shopify-create-code.js";   // REDO as helper function
import shopifyUpdateCode from "./shopify-update-code.js";   // REDO as helper function

import shopifyWebhook from "./shopify-webhook.js";          // endpoint for receiving orders
import emailUnsubscribe from "./email-unsubscribe.js";      // endpoint for email unsubscribe
import stripeRouter from "./stripe-refresh.js";             // endpoint for creating new reauth link

import firestoreWebhook from "./firestore-webhook.js";          // endpoint for receiving orders


// ---- Shopify Export ----
export const shopify_auth = functions.https.onRequest(shopifyAuth);
export const shopify_webhook = functions.https.onRequest(shopifyWebhook);
export const shopify_create_code = functions.https.onRequest(shopifyCreateCode);
export const shopify_update_code = functions.https.onRequest(shopifyUpdateCode);
export const email_unsubscribe = functions.https.onRequest(emailUnsubscribe);
export const stripe = functions.https.onRequest(stripeRouter);


export const firestore = functions.https.onRequest(firestoreWebhook);