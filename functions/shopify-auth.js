//import { onRequest } from 'firebase-functions/v1/https';

//Tutorial on Shopify Auth!
//https://www.youtube.com/watch?v=oKGR9RVCUDs



//import dotenv from 'dotenv';

import admin from "firebase-admin";
import functions from "firebase-functions";


import '@shopify/shopify-api/adapters/node';
import {shopifyApi, LATEST_API_VERSION} from '@shopify/shopify-api';
import express from 'express';
//import { callback } from "@shopify/shopify-api/lib/auth/oauth/oauth";
//import { callback } from '@shopify/shopify-api/lib/auth/oauth/oauth';

// dotenv.config('./.env');
// const {SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_API_SCOPES, HOST} = process.env;

// const shopify = shopifyApi({
//     apiKey: SHOPIFY_API_KEY,
//     apiSecretKey: SHOPIFY_API_SECRET,
//     scopes: SHOPIFY_API_SCOPES,
//     hostName: HOST,
//     isEmbeddedApp: true
// });


const shopify = shopifyApi({
    apiKey: "650afd8232a48d97a3ab1bf10f20e649",
    apiSecretKey: "9d78520328f4e81e780b901e86899ca0",
    scopes: ["read_products","read_orders","write_discounts","write_price_rules"],
    hostName: "us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth",
    isEmbeddedApp: true
});


// SHOPIFY_API_KEY="650afd8232a48d97a3ab1bf10f20e649"
// SHOPIFY_API_SECRET="9d78520328f4e81e780b901e86899ca0"
// SHOPIFY_API_SCOPES=read_products,read_orders,write_discounts,write_price_rules
// HOST="us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth"


const shops = {};

const shopifyAuth = express();


shopifyAuth.get('/', async (req, res) => {
    // res.send("hello world132123412");
    if (typeof shops[req.query.shop] !== 'undefined') {
        res.send('Hey there! You are already authenticated with Uncommon Loyalty :)');
    } else {
        //send the shop to the auth flow, including the shop name
        res.redirect(`/shopify_auth/auth?shop=${req.query.shop}`);
    }
});

shopifyAuth.get('/auth', async (req, res) => {
    //once you redirect them to the /auth route, attempt to authenticate. Then redirect to /auth/callback   
    
    // Library handles redirecting
    await shopify.auth.begin({
        shop: shopify.utils.sanitizeShop(req.query.shop, true),
        callbackPath: '/auth/callback',
        isOnline: false,
        rawRequest: req,
        rawResponse: res,
    });
});

shopifyAuth.get('/auth/callback', async (req, res) => {
    console.log("got here!");
    //take the request to /auth/callback from the shop and Shopify. Then exchange short term token for long term one.

    const callbackResponse = await shopify.auth.callback({
        rawRequest: req,
        rawResponse: res,
    });

    res.redirect('/dashboard');

    //MUST STORE THE SESSION HERE
    // app stores Session in its own storage mechanism
    //await addSessionToStorage(callbackResponse.session.toObject());

    // console.log(callbackResponse.session.toObject());

    // const shopPath = await callbackResponse.session.toObject().shop
    // //res.redirect(callbackResponse);

    // res.redirect(`https://${shopPath}/admin/apps/uncommon-app`);



    // const host = shopify.utils.sanitizeHost(req.query.host);
    // const redirectUrl = shopify.config.isEmbeddedApp 
    //     ? await shopify.auth.getEmbeddedAppUrl({
    //         rawRequest: req,
    //         rawResponse: res,
    //     })
    //     : `/?shop=${callbackResponse.session.shop}&host=${encodeURIComponent(host)}`;



    // try {
    //     const callback = await shopify.auth.callback({
    //         rawRequest: req,
    //         rawResponse: res
    //     });

    //     // Store offline session
    //     const shop = shopify.utils.sanitizeShop(req.query.shop, true);
    //     const sessionId = await shopify.session.getOfflineId(shop);
    //     console.log(sessionId);
    //     //await sessionStorage.storeCallback(sessionId, callback.session);
    // } catch (error) {
    //     console.log(error);
    // }

    // res.redirect(`/auth?host=${req.query.host}&shop=${req.query.shop}`);


    // res.redirect(`/auth?host=${req.query.host}&shop=${req.query.shop}`);

    // const callbackResponse = await shopify.auth.callback({
    //     rawRequest: req,
    //     rawResponse: res,
    //     });
    
    
    // console.log("got here 2")
    // console.log(callback.session);

    //res.redirect("https://uncommon.app");

    // console.log(callbackResponse)
    // console.log(callbackResponse.session)
    // console.log(callbackResponse.session.accessToken)
    
    // const token1 = callbackResponse.session.accessToken;
    // const shop1 = callbackResponse.session.shop;

    // const sessionObject = {
    //     "token": token1,
    //     "shop": shop1
    // };

    // let shopifyRef = admin.firestore().collection("shopify").doc();

    // await shopifyRef.set(sessionObject);

    // var sessionObject = {

    //     accessToken: callbackResponse.session.accessToken,
    //     // expires: session1.expires,
    //     // id: session1.id,
    //     // scope: session1.scope,
    //     // shop: session1.shop,
    //     // state: session1.state
    // };

    //Post the item to firestore
    // await shopifyRef.set(sessionObject);
    
    //res.redirect(`https://${shopSession.shop}/admin/apps/uncommon-app`);
    //res.redirect("/testing123");

    // const shopSession = await shopify.auth.validateAuthCallback(
    //     req,
    //     res,
    //     req.query
    // );

    // //store the long-term auth token for future use
    // console.log(shopSession);

    // //store the store for future use
    // shops[shopSession.shop] = shopSession;

    // //once you get the long term auth token and shop, redirect the user back to the location of the shop
    // res.redirect(`https://${shopSession.shop}/admin/apps/uncommon-app`);

});


shopifyAuth.get('/dashboard', async (req, res) => {
    res.redirect("https://uncommon.app");
});


// shopifyAuth.listen(port, () => {
//     console.log(`Server running at http://${host}:${port}`)
// });

//uncomment this if you want to use a prod resource for allowing 
export default shopifyAuth;

//#region Athleisure access token (Aug 15)
// Session {
//     id: 'offline_athleisure-la.myshopify.com',
//     shop: 'athleisure-la.myshopify.com',
//     state: '747143013473658',
//     isOnline: false,
//     accessToken: 'shpua_2d7b02871ee6b3cf1094875025e269c4',
//     scope: 'read_products,read_orders,write_discounts,write_price_rules'
//   }
//#endregion

//#region Hello-Vip access token (Aug 15)
// Session {
//     id: 'offline_hello-vip.myshopify.com',
//     shop: 'hello-vip.myshopify.com',
//     state: '118739299662392',
//     isOnline: false,
//     accessToken: 'shpua_bbb2ae8010e6ac28e288722234983f03',
//     scope: 'read_products,read_orders,write_discounts,write_price_rules'
//   }
//#endregion

//#region Hello-Vip-Test-1 access token (Aug 15)
// Session {
//     id: 'offline_hello-vip-test-1.myshopify.com',
//     shop: 'hello-vip-test-1.myshopify.com',
//     state: '967928987420190',
//     isOnline: false,
//     accessToken: 'shpua_3e80c4fc97887f4d700426804466e152',
//     scope: 'read_products,read_orders,write_discounts,write_price_rules'
//   }
//#endregion

//#region Attempting to set the access token in firebase
// const accessTokenInfo = {
//     id: shopSession.id,
//     shop: shopSession.shop,
//     state: shopSession.state,
//     isOnline: shopSession.isOnline,
//     accessToken: shopSession.accessToken || "token not found",
//     scope: shopSession.scope
// };

// const resultOfFirebaseSet = admin.firestore().collection("onboarding").doc(shopSession.shop).set(accessTokenInfo);

//log the response from firebase
//console.log("Set: ", resultOfFirebaseSet);
//#endregion