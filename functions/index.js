//Set up Firebase
import admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);

//Required Firebase on every file
import functions from "firebase-functions";

//Pull in all the functions from the dif files

// ---- Shopify Import ----
import shopifyAuth from "./shopify-auth.js";
//import shopifyReceiveWebhook from "./shopify-receiveWebhook.js";
// import shopifyReceiveWebhook2 from "./shopify-receiveWebhook2.js";
// import shopifyCreateDiscount from "./shopify-createDiscount.js";
// import shopifyUpdateDiscount from "./shopify-updateDiscount.js";

// ---- Shopify Export ----
export const shopify_auth = functions.https.onRequest(shopifyAuth);
// export const shopify_receiveWebhook = functions.https.onRequest(shopifyReceiveWebhook);
// export const shopify_receiveWebhook2 = functions.https.onRequest(shopifyReceiveWebhook2);
// export const shopify_createDiscount = functions.https.onRequest(shopifyCreateDiscount);
// export const shopify_updateDiscount = functions.https.onRequest(shopifyUpdateDiscount);

// ---- Firestore Function Import ----
import sendLoginEmail from "./send-login-email.js";
// import discountOnCreate from "./discount-onCreate.js";
// import discountAdditionOnCreate from "./discountAddition-onCreate.js";
// import itemOnCreate from "./item-onCreate.js";
// import orderOnCreate from "./order-onCreate.js";
// import reviewOnCreate from "./review-onCreate.js";
// import referralOnCreate from "./referral-onCreate.js";

// ---- Firestore Function Export ----
export const send_login_email = sendLoginEmail;
// export const discount_onCreate = discountOnCreate;
// export const discountAddition_onCreate = discountAdditionOnCreate;
// export const item_onCreate = itemOnCreate;
// export const order_onCreate = orderOnCreate;
// export const review_onCreate = reviewOnCreate;
// export const referral_onCreate = referralOnCreate;