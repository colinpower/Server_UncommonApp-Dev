// //testing URL
// //https://us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth/auth?shop=everlain.myshopify.com
// //https://us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth/auth?shop=outweigh.myshopify.com

// import admin from "firebase-admin";
// import functions from "firebase-functions";

// import cookie from "cookie";
// import axios from 'axios';
// import express from 'express';
// import fetch from "node-fetch";
// //import dotenv from 'dotenv';

// const { randomUUID } = await import('node:crypto');

// const apiKey="650afd8232a48d97a3ab1bf10f20e649";
// const apiSecret="9d78520328f4e81e780b901e86899ca0";
// const scopes = "read_products, read_orders, write_discounts, write_price_rules";
// const baseURL = "https://us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth";

// const shopifyAuth = express();

// shopifyAuth.get('/auth', (req, res) => {
    
//     //must include ?shop={myshopifyurl}
//     const shop = req.query.shop;
  
//     if (shop) { 

//       const state = randomUUID();
//       const redirectUri = baseURL + '/auth/callback';
//       const installUrl = 'https://' + shop + '/admin/oauth/authorize?client_id=' + apiKey +
//         '&scope=' + scopes +
//         '&state=' + state +
//         '&redirect_uri=' + redirectUri;
  
//       //normally you'd want to encrypt this, but do that later?? how to encrypt cookies??
//       res.cookie('state', state)
    
//       //then, redirect to URL we just built
//       res.redirect(installUrl);
//     } else {
//       return res.status(400).send('missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request')
//     }
//   });

// shopifyAuth.get('/auth/callback', async (req, res) => {
    
//     console.log("got to /auth/callback!");

//     //Get the query parameters that Shopify sent
//     const { shop, hmac, code, state } = req.query;
//     const stateCookie = cookie.parse(req.headers.cookie).state; //verify that the state matches the one we just sent

//     if (state !== stateCookie) {    //NOTE: NEED TO STORE COOKIE AS ENCRYPTED AND THEN DECRYPT!!!
//       return res.status(400).send('Request origin cannot be verified due to state cookie');
//     }

//     //check if you have these params, then validate that the hmac signature from shopify matches what you expect
//     if (shop && hmac && code) {   

//         const map = Object.assign({}, req.query);  //map all query params to an object
//         delete map['hmac'];
//         const params = new URLSearchParams(map)
//         const message = params.toString();

//         //SKIPPING HMAC CHECK FOR NOW, NEED TO FIX LATER
        
//         //when you get here, you want to store the access token
//         const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
        
//         const accessTokenPayload = {
//             client_id: apiKey,
//             client_secret: apiSecret,
//             code //also want the code param.. once you've validated, you may not get this code.. may want to calculate signature using params minus hmac
//         };

//         //Then make the request with the accessTokenRequest and Payload

//         var newShopObject = {
//             token: "",
//             scopes: "",
//             shopURL: shop
//         };

//         axios.post(accessTokenRequestUrl, accessTokenPayload)
//         .then((accessTokenResponse) => {
//             mapValues(newShopObject, accessTokenResponse.data)          
//         })
//         .then(() => {
//             //console.log(newShopObject);
//             admin.firestore().collection("shopify").doc(shop).set(newShopObject);
//         })
//         .then(() => {
//             res.redirect("https://uncommon.app/blog");
//         })
//         .catch((error) => {
//             return res.status(500).send(error);
//         });

//     } else {
//         return res.status(400).send('Required parameters mising');
//     }

// });


// export default shopifyAuth;

// const mapValues = (object, data) => {
    
//     object.token = data.access_token
//     object.scopes = data.scope
    
//     return object
// }




// //#region Athleisure access token (Aug 15)
// // Session {
// //     id: 'offline_athleisure-la.myshopify.com',
// //     shop: 'athleisure-la.myshopify.com',
// //     state: '747143013473658',
// //     isOnline: false,
// //     accessToken: 'shpua_2d7b02871ee6b3cf1094875025e269c4',
// //     scope: 'read_products,read_orders,write_discounts,write_price_rules'
// //   }
// //#endregion

// //#region Hello-Vip access token (Aug 15)
// // Session {
// //     id: 'offline_hello-vip.myshopify.com',
// //     shop: 'hello-vip.myshopify.com',
// //     state: '118739299662392',
// //     isOnline: false,
// //     accessToken: 'shpua_bbb2ae8010e6ac28e288722234983f03',
// //     scope: 'read_products,read_orders,write_discounts,write_price_rules'
// //   }
// //#endregion

// //#region Hello-Vip-Test-1 access token (Aug 15)
// // Session {
// //     id: 'offline_hello-vip-test-1.myshopify.com',
// //     shop: 'hello-vip-test-1.myshopify.com',
// //     state: '967928987420190',
// //     isOnline: false,
// //     accessToken: 'shpua_3e80c4fc97887f4d700426804466e152',
// //     scope: 'read_products,read_orders,write_discounts,write_price_rules'
// //   }
// //#endregion

// //#region Attempting to set the access token in firebase
// // const accessTokenInfo = {
// //     id: shopSession.id,
// //     shop: shopSession.shop,
// //     state: shopSession.state,
// //     isOnline: shopSession.isOnline,
// //     accessToken: shopSession.accessToken || "token not found",
// //     scope: shopSession.scope
// // };

// // const resultOfFirebaseSet = admin.firestore().collection("onboarding").doc(shopSession.shop).set(accessTokenInfo);

// //log the response from firebase
// //console.log("Set: ", resultOfFirebaseSet);
// //#endregion