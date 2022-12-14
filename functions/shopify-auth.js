//testing URL
//https://us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth/auth?shop=everlain.myshopify.com
//https://us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth/auth?shop=outweigh.myshopify.com

import admin from "firebase-admin";
import functions from "firebase-functions";

import cookie from "cookie";
import axios from 'axios';
import express from 'express';
import fetch from "node-fetch";
//import dotenv from 'dotenv';

const { randomUUID } = await import('node:crypto');

const apiKey="650afd8232a48d97a3ab1bf10f20e649";
const apiSecret="9d78520328f4e81e780b901e86899ca0";
const scopes = "read_products, read_orders, write_discounts, write_price_rules";
const baseURL = "https://us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth";

const shopifyAuth = express();

shopifyAuth.get('/auth', (req, res) => {
    
    //must include ?shop={myshopifyurl}
    const shop = req.query.shop;
  
    if (shop) { 

      const state = randomUUID();
      const redirectUri = baseURL + '/auth/callback';
      const installUrl = 'https://' + shop + '/admin/oauth/authorize?client_id=' + apiKey +
        '&scope=' + scopes +
        '&state=' + state +
        '&redirect_uri=' + redirectUri;
  
      //normally you'd want to encrypt this, but do that later?? how to encrypt cookies??
      res.cookie('state', state)
    
      //then, redirect to URL we just built
      res.redirect(installUrl);
    } else {
      return res.status(400).send('missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request')
    }
  });

shopifyAuth.get('/auth/callback', async (req, res) => {
    
    console.log("got to /auth/callback!");

    //Get the query parameters that Shopify sent
    const { shop, hmac, code, state } = req.query;
    const stateCookie = cookie.parse(req.headers.cookie).state; //verify that the state matches the one we just sent

    if (state !== stateCookie) {    //NOTE: NEED TO STORE COOKIE AS ENCRYPTED AND THEN DECRYPT!!!
      return res.status(400).send('Request origin cannot be verified due to state cookie');
    }

    //check if you have these params, then validate that the hmac signature from shopify matches what you expect
    if (shop && hmac && code) {   

        const map = Object.assign({}, req.query);  //map all query params to an object
        delete map['hmac'];
        const params = new URLSearchParams(map)
        const message = params.toString();

        //SKIPPING HMAC CHECK FOR NOW, NEED TO FIX LATER
        
        //when you get here, you want to store the access token
        const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
        
        const accessTokenPayload = {
            client_id: apiKey,
            client_secret: apiSecret,
            code //also want the code param.. once you've validated, you may not get this code.. may want to calculate signature using params minus hmac
        };

        //Then make the request with the accessTokenRequest and Payload

        var newShopObject = {
            token: "",
            scopes: "",
            shopURL: shop
        };

        axios.post(accessTokenRequestUrl, accessTokenPayload)
        .then((accessTokenResponse) => {
            mapValues(newShopObject, accessTokenResponse.data)          
        })
        .then(() => {
            //console.log(newShopObject);
            admin.firestore().collection("shopify").doc(shop).set(newShopObject);
        })
        .then(() => {
            res.redirect("https://uncommon.app/blog");
        })
        .catch((error) => {
            return res.status(500).send(error);
        });

    } else {
        return res.status(400).send('Required parameters mising');
    }

});


export default shopifyAuth;

const mapValues = (object, data) => {
    
    object.token = data.access_token
    object.scopes = data.scope
    
    return object
}




// async function addNewShopToken(object) {
//     const result = await admin.firestore().collection("shopify").add(object);
//     console.log(result);
// }


   // const accessTokenResponse = await axios.post(accessTokenRequestUrl, accessTokenPayload);

        // const newToken = await accessTokenResponse.data.accessToken;

        // console.log(newToken);


        // //if this works, add in a call to Firebase here..


        //   .then((accessTokenResponse) => {

        //     //console.log(accessTokenResponse.data.accessToken);

        //     //res.redirect("https://uncommon.app/blog")

        //     //Need the SHOP, ACCESS_TOKEN, SCOPES, and ID (if available)

        //     const createJSON = {
        //         code: accessTokenResponse.data.accessToken,
        //     };
        
        //     fetch("https://4f9c-205-178-78-227.ngrok.io/", {
        //         method: "POST", 
        //         body: JSON.stringify(createJSON),
        //         headers: { "Content-Type": "application/json" }
        //     });


        //     res.redirect("https://uncommon.app/blog")

        //     // var sessionObject1 = {
        //     //     auth_token: accessTokenResponse.data.accessToken,
        //     //     auth_scopes: accessTokenResponse.data.scope,
        //     //     shop_url: shop
        //     // };

        //     // axios.post("https://example.com")
        //     // return admin.firestore().collection("shopify").add(sessionObject1);

        // //     //return res.redirect("https://uncommon.app/blog")

        // //     //auth_scopes: accessTokenResponse.data.scope,
            
        // //     // .then(() => {
        // //     //     return res.redirect("https://uncommon.app/blog")
        // //     // })


        // }).catch((error) => {
        //     res.status(error.statusCode).send(error.error.error_description);
        // });