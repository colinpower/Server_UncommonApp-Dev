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

