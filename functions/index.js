//Set up Firebase
import admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);

//Required Firebase on every file
import functions from "firebase-functions";

//Pull in all the functions from the dif files

//need to figure out how to file my functions into folders, and then also how to add mini functions to the code that can be reused

// ----- API --------
// Designed to protect secret keys from being used in the main code

// /shopify/auth
// /shopify/webhook
// /shopify/code/create
// /shopify/code/update

// /stripe/auth
// /stripe/refresh
// /shopify/code/create
// /shopify/code/update

// ----- FUNCTIONS --------
// Designed to protect secret keys from being used in the main code

// /auth-create

// /code-create
// /code-update

// /check-OTP-update

// /auth-create
// /auth-create
// /shopify/webhook
// /shopify/code/create
// /shopify/code/update

// /stripe/auth
// /stripe/refresh
// /shopify/code/create
// /shopify/code/update


// ----- NEW FUNCTIONS SYSTEM HERE ------
import stripeCreate from "./stripe-create.js";
export const stripe_create = stripeCreate;


// ---- Shopify Import ----
import shopifyAuth from "./shopify-auth.js";
import shopifyWebhook from "./shopify-webhook.js";
// import shopifyReceiveWebhook2 from "./shopify-receiveWebhook2.js";
import shopifyCreateCode from "./shopify-create-code.js";
import shopifyUpdateCode from "./shopify-update-code.js";
// import shopifyUpdateDiscount from "./shopify-updateDiscount.js";

// ---- Shopify Export ----
export const shopify_auth = functions.https.onRequest(shopifyAuth);
export const shopify_webhook = functions.https.onRequest(shopifyWebhook);
// export const shopify_receiveWebhook2 = functions.https.onRequest(shopifyReceiveWebhook2);
export const shopify_create_code = functions.https.onRequest(shopifyCreateCode);
export const shopify_update_code = functions.https.onRequest(shopifyUpdateCode);
// export const shopify_updateDiscount = functions.https.onRequest(shopifyUpdateDiscount);
export const email_unsubscribe = functions.https.onRequest(emailUnsubscribe);

// ---- Stripe Import & Export ----
import stripeRouter from "./stripe-refresh.js";
export const stripe = functions.https.onRequest(stripeRouter);

// ---- Firestore Function Import ----
import sendLoginEmail from "./send-login-email.js";
import authOnCreate from "./auth-onCreate.js";
import orderOnCreate from "./on-create.js";
import codeOnCreate from "./code-on-create.js";
import codeOnUpdate from "./code-on-update.js";

//import createStripeAccountOnCreate from "./stripe-setup.js"
import stripeRetrieve from "./stripe-retrieve.js"
// import discountAdditionOnCreate from "./discountAddition-onCreate.js";
// import itemOnCreate from "./item-onCreate.js";
// import orderOnCreate from "./order-onCreate.js";
// import reviewOnCreate from "./review-onCreate.js";
// import referralOnCreate from "./referral-onCreate.js";
import requestVerificationCodeOnCreate from "./requestVerificationCode-onCreate.js";
import checkOTPOnUpdate from "./checkOTP-onUpdate.js";
import emailUnsubscribe from "./email-unsubscribe.js";

// ---- Firestore Function Export ----
export const send_login_email = sendLoginEmail;
export const auth_onCreate = authOnCreate;
export const order_onCreate = orderOnCreate;
export const code_onCreate = codeOnCreate;
export const code_onUpdate = codeOnUpdate;


//export const create_stripe_account_onCreate = createStripeAccountOnCreate;
export const stripe_retrieve = stripeRetrieve;

// export const discountAddition_onCreate = discountAdditionOnCreate;
// export const item_onCreate = itemOnCreate;
// export const order_onCreate = orderOnCreate;
// export const review_onCreate = reviewOnCreate;
// export const referral_onCreate = referralOnCreate;
export const requestVerificationCode_OnCreate = requestVerificationCodeOnCreate;
export const checkOTP_OnUpdate = checkOTPOnUpdate;



// export async function getTimestamp() {

//     const current_timestamp_milliseconds = new Date().getTime();
//     const timestamp = Math.round(current_timestamp_milliseconds / 1000);

//     return timestamp;
// };

// export async function getTimestamp2() {

//     const current_timestamp_milliseconds = new Date().getTime();
//     const timestamp = Math.round(current_timestamp_milliseconds / 1000);

//     return timestamp;
// };