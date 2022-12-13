import express from 'express';
//import dotenv from 'dotenv';

//import admin from "firebase-admin";
import functions from "firebase-functions";


import { Shopify } from '@shopify/shopify-api';

import cookie from "cookie";
import axios from 'axios';


//const {SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_API_SCOPES, HOST} = process.env;

Shopify.Context.initialize({
    API_KEY: "650afd8232a48d97a3ab1bf10f20e649",
    API_SECRET_KEY: "9d78520328f4e81e780b901e86899ca0",
    SCOPES: ["read_products","read_orders","write_discounts","write_price_rules"],
    HOST_NAME: "us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth",
    IS_EMBEDDED_APP: true,
});


const apiKey="650afd8232a48d97a3ab1bf10f20e649"
const apiSecret="9d78520328f4e81e780b901e86899ca0"
// SHOPIFY_API_SCOPES=read_products,read_orders,write_discounts,write_price_rules
// HOST="us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth"


const shops = {};

const shopifyAuth = express();


shopifyAuth.get('/', async (req, res) => {

    if (typeof shops[req.query.shop] !== 'undefined') {
        res.send('Hey there! You are already authenticated with Uncommon Loyalty :)');
    } else {
        //send the shop to the auth flow, including the shop name
        //res.redirect(`/auth?shop=${req.query.shop}`);
        res.redirect(`/shopify_auth/auth?shop=${req.query.shop}`);
    }
});

shopifyAuth.get('/auth', async (req, res) => {
    //once you redirect them to the /auth route, attempt to authenticate. Then redirect to /auth/callback   

    const authRoute = await Shopify.Auth.beginAuth(
        req,
        res,
        req.query.shop,
        '/auth/callback',
        false,
    )
    res.redirect(authRoute);

});

shopifyAuth.get('/auth/callback', async (req, res) => {
    
    console.log("got to /auth/callback!");

    //Get the query parameters that Shopify sent
    const { shop, hmac, code, state } = req.query;

    //SKIPPING STATE CHECK FOR NOW, NEED TO FIX LATER

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
        axios.post(accessTokenRequestUrl, accessTokenPayload)
        .then((accessTokenResponse) => {
            console.log("received response");
            console.log(accessTokenResponse.data.accessToken);
            console.log(accessTokenResponse.data);
            const accessToken = accessTokenResponse.data.access_token; //this is where you save your access token
            console.log("shop token" + accessToken);
            res.status(200).send("Got an access token, let's do something with it!" + accessTokenResponse.data.access_token);

        }).catch((error) => {
            res.status(error.statusCode).send(error.error.error_description);
        });
    } else {
        return res.status(400).send('Required parameters mising');
    }

});


export default shopifyAuth;