//Set up Firebase
import admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);

//Required Firebase on every file
import functions from "firebase-functions";

//Pull in all the functions from the dif files

//need to figure out how to file my functions into folders, and then also how to add mini functions to the code that can be reused

// ------- FIRESTORE COLLECTIONS --------
// ---DONE--- auth_email            { uuid }        PURPOSE     store request for login link        OBSERVED BY     auth_link.js
// ---DONE--- auth_phone             { uuid }        PURPOSE     store OTP code                      OBSERVED BY     auth_otp.js, auth_otp_UPDATE.js
// ---DONE--- auth_shopify         { domain }      PURPOSE     store shop's shopify auth details   OBSERVED BY     auth_shopify.js
// ---DONE--- campaigns            { uuid }        PURPOSE     store data for shop's campaigns     N/A
// cash                 { uuid }        PURPOSE     store transfers & payouts           OBSERVED BY     ---- 1. on create cash/id=PAYOUT, trigger payout.   2. on create cash/id=TRANSFER, reload stripe/id balance  ----
// codes                { uuid }        PURPOSE     all codes (referral, reward)        OBSERVED BY     codes.js, codes_modify.js
// memberships          { uid-shopid }  PURPOSE     user's personal shop membership     OBSERVED BY     memberships.js
// orders               { uuid }        PURPOSE     store order details                 OBSERVED BY     orders.js, orders_UPDATE.js
// referrals            { uuid }        PURPOSE     store details of a referral         OBSERVED BY     referrals_modify.js
// shops                { uuid }        PURPOSE     store details of a shop             N/A
// stripe_accounts      { userid }      PURPOSE     store user's stripe acct            OBSERVED BY     stripe_account_check.js
// users                { uuid }        PURPOSE     store details of a user             N/A

// ------- FIRESTORE TRIGGERS --------
// ---DONE--- create_auth_email.js          CREATE          auth_email        THEN            create login link, send via sendgrid
// ---DONE--- create_auth_phone.js          CREATE          auth_phone        THEN            create OTP, send via twilio
// ---DONE--- update_auth_phone.js          UPDATE          auth_phone        THEN            check OTP, update users/id with phone_verified=TRUE
// ---DONE--- create_auth_shopify.js      CREATE          shopify         THEN            get Shopify shop info, create shop/id, campaign/id (mostly empty) for the shop to edit in the Shopify App
// ---DONE--- create_auth_user.js         CREATE          USER            THEN            create users, stripe_account          
// ---MUST TEST--- create_cash.js              CREATE          cash            THEN            trigger a TRANSFER or a PAYOUT
// ---MUST TEST--- create_code.js             CREATE          codes           THEN            create the code in shopify using graphql
// ---MUST TEST--- code_modify.js      CREATE          codes/modify    THEN            try to change the code in shopify
// ---NOT NEEDED-- memberships.js       CREATE          memberships     THEN            create a new code/id using the default campaign
// create_order.js            CREATE          orders          THEN            check for code usage
// ---LATER---      orders_UPDATE.js     UPDATE          orders          THEN            if order cancelled, mark discount code unused, delete referral
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
// getShopifyShopInfo                                           // https://shopify.dev/api/admin-graphql/2023-01/queries/shop
// createShopifyShopSubscription                                // https://shopify.dev/api/admin-graphql/2023-01/mutations/appSubscriptionCreate
// createShopifyShopUsageRecord                                 // https://shopify.dev/api/admin-graphql/2023-01/mutations/appUsageRecordCreate
// createLoginLink                                              
// createOTP

// ------- SCHEMAE --------
// auth_email
                // email                                                STRING
                // timestamp                                            INT

// auth_phone
                // correct_code                                         STRING
                // submitted_code                                       STRING
                // phone                                                STRING
                // timestamp.created                                    INT
                // timestamp.expires                                    INT
                // timestamp.submitted                                  INT
                // uuid.auth_phone                                      STRING
                // uuid.user                                            STRING

// auth_shopify / { domain }
                // shop {}                                              MAP
                // session.scope                                        STRING
                // session.shop                                         STRING
                // session.token                                        STRING
                // subscription.description
                // subscription.capped_amount
                // timestamp.created
                // timestamp.subscribed
                // timestamp.updated
                // timestamp.deleted
                // uuid.auth_shopify
                // uuid.shop

// campaigns                                                
                // commission {}        
                // color                    
                // requirements.customers_only              
                // requirements.referral_count              
                // requirements.users                        
                // offer {}                                  
                // status      
                // title                              
                // timestamp.created                         
                // timestamp.expires                         
                // timestamp.starts
                // uuid.campaign
                // uuid.shop

// cash
                // shop {}
                // status
                // type
                // timestamp.created
                // timestamp.transfer
                // timestamp.payout
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
        // code.UPPERCASED
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
        // contact_support_email

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
import create_authEmail from "./create-auth-email.js";                  // auth-link                   ->      api_sendgrid
import create_authPhone from "./create-auth-phone.js";                  // ->      api_twilio
import update_authPhone from "./update-auth-phone.js";                  // user_authrequest_Create      ->      api_twilio__onUpdate
import create_authShopify from "./create-auth-shopify.js";              // user_authrequest_Create      ->      api_twilio__onUpdate
import create_authUser from "./create-auth-user.js";                    // auth_Create  (RENAME!)       ->      auth
import create_Cash from "./create-cash.js";
import create_Code from "./create-code.js";                             // code_Create                  ->      code
import create_code__modify from "./create-code--modify.js";             // code_updateCreate            ->      code__change
import create_order from "./create-order.js";                             // order_Create                 ->      order


import stripeCreate from "./stripe-create.js";                          // stripe_Create                ->      stripe_acct
import stripeRetrieve from "./stripe-retrieve.js";                      // stripe_retrieveCreate        ->      stripe_acct__retrieve

//import scheduledFunction from "./_scheduler.js";      
export const create_auth_email = create_authEmail;
export const create_auth_phone = create_authPhone;
export const update_auth_phone = update_authPhone;
export const create_auth_shopify = create_authShopify;
export const create_auth_user = create_authUser;
export const create_cash = create_Cash;
export const create_code = create_Code;
export const create_code__modify = create_code__modify;
export const create_order = create_order;


export const stripe_create = stripeCreate;
export const stripe_retrieve = stripeRetrieve;

//export const scheduler = scheduledFunction;


// ---- Shopify Import ----
import shopifyAuth from "./api/shopify-auth.js";                // express app for auth     ->      
import shopifyWebhook from "./api/shopify-webhook.js";          // endpoint for receiving orders

import emailUnsubscribe from "./api/email-unsubscribe.js";      // endpoint for email unsubscribe

import stripeRouter from "./stripe-refresh.js";             // endpoint for creating new reauth link

import firestoreWebhook from "./api/firestore-webhook.js";          // endpoint for receiving orders

// ---- Shopify Export ----
export const shopify_auth = functions.https.onRequest(shopifyAuth);
export const shopify_webhook = functions.https.onRequest(shopifyWebhook);

export const email_unsubscribe = functions.https.onRequest(emailUnsubscribe);
export const stripe = functions.https.onRequest(stripeRouter);


export const firestore = functions.https.onRequest(firestoreWebhook);
