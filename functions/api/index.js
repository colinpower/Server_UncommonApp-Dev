// #region Imports
import admin from "firebase-admin";
import functions from "firebase-functions";
import express from "express";
import bodyParser from "body-parser";
import { getTimestamp } from "./../helpers/helper.js";
import { title } from "process";
import { read } from "fs";
import cookie from "cookie";
import axios from 'axios';
import fetch from "node-fetch";
import dotenv from 'dotenv';
import Stripe from 'stripe';
const { randomUUID } = await import('node:crypto');

dotenv.config();

const stripe_token = process.env.STRIPE_TOKEN
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const scopes = process.env.SHOPIFY_API_SCOPES;
const host = process.env.HOST;
const baseURL = "https://" + host;

const stripe = new Stripe(stripe_token);
//#endregion


// routes:
// Page         /
// Page         /login
// Page         /signup
// Page         /dashboard

// DONE -- API          /api/shopify/auth
// DONE -- API          /api/shopify/auth/callback
// DONE -- API          /api/shopify/order
// DONE -- API          /api/sendgrid/unsubscribe
// DONE -- API          /api/stripe/refresh
// API          /api/firebase/webhook

// Shopify   entry point:     https://us-central1-uncommonapp-dev.cloudfunctions.net/api/shopify/auth?shop=everlain.myshopify.com
// Webhook   entry point:     https://us-central1-uncommonapp-dev.cloudfunctions.net/api/shopify/order
// Stripe    entry point:     https://us-central1-uncommonapp-dev.cloudfunctions.net/api/stripe/refresh?uid={user.uuid}
// Sendgrid  entry point:     https://us-central1-uncommonapp-dev.cloudfunctions.net/api/sendgrid/unsubscribe?email={email}

// https://us-central1-uncommonapp-dev.cloudfunctions.net/api/stripe/refresh?uid=EdZzl43o5fTespxaelsTEnobTtJ2

// #region Initialize express app
const express_app = express();
express_app.use(bodyParser.json());
express_app.use(bodyParser.urlencoded({
    extended: true,
}));
// #endregion

// #region GET /api/shopify/auth
express_app.get('/shopify/auth', (req, res) => {
    
    //must include ?shop={myshopifyurl}
    const shop = req.query.shop;
  
    if (shop) { 

      const state = randomUUID();
      const redirectUri = baseURL + '/shopify/auth/callback';
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
// #endregion

// #region GET /api/shopify/auth/callback
express_app.get('/shopify/auth/callback', async (req, res) => {
    
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

        var object = {
            shop: {
                category: "",
                contact_support_email: "",
                description: "",
                domain: shop,
                name: "",
                website: ""
            },
            session: {
                scope: "",
                shop: shop,
                token: ""
            },
            subscription: {
                description: "",
                capped_amount: 0
            },
            timestamp: {
                created: getTimestamp(),
                subscribed: 0,
                updated: 0,
                deleted: 0
            },
            uuid: {
                auth_shopify: shop,
                shop: shop
            }
        };

        const shopExists = await admin.firestore().collection("auth_shopify").doc(shop)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    return true
                } else {
                    return false
                }
            });


        axios.post(accessTokenRequestUrl, accessTokenPayload)
        .then((accessTokenResponse) => {
               
            mapValues(object, accessTokenResponse.data)

        })
        .then(() => {

            if (!shopExists) {
                admin.firestore().collection("auth_shopify").doc(shop).set(object);
            } else {
                return;
            }
        })
        .then(() => {
            return res.redirect("https://uncommon.app/blog");
        })
        .catch(error => {
            console.log("ERROR WITH PROMISE");
            console.log(error)
            return res.status(500).send(error);
        })    
    } else {
        return res.status(400).send('Required parameters mising');
    }

});
//#endregion

// #region POST /api/shopify/order
express_app.post("/shopify/order", async (req, res) => {

    const domain = req.header('x-shopify-shop-domain');
    const topic = req.header('x-shopify-topic');
    const order_id = req.header('x-shopify-order-id');
    
    const object = req.body;
    const shop = await getShop(domain);

    if (shop) {
        await addOrder(object, shop)
        res.sendStatus(201);
    } else {
        log_domain_not_found(req);
        res.sendStatus(200);
    }
});
// #endregion

// #region GET /api/sendgrid/unsubscribe?email={email}
express_app.get("/sendgrid/unsubscribe", async (req, res) => {


    //must include ?email={email}
    const email = req.query.email;
    const current_timestamp_milliseconds = new Date().getTime();
    const current_timestamp = current_timestamp_milliseconds / 1000;
    
    console.log("requested unsubcribe for");
    console.log(email);

    const unsubObject = {
        eml: email,
        timestamp: current_timestamp
    };

    await admin.firestore().collection("unsubscribe").add(unsubObject)
    .then(() => {
        res.redirect("https://www.uncommon.app/unsubscribed");
    });
    
});
// #endregion

// #region GET /api/stripe/refresh
express_app.get('/stripe/refresh', async (req, res) => {
    
    //must include ?acct={acct_id}
    const acct_id = req.query.acct;
  
    if (acct_id) {

      //get the user's stripe account from Firebase

      //IN THE SHORT TERM, JUST PASS THE STRIPE ACCOUNT IN THE URL
      const refresh_url = "https://us-central1-uncommonapp-dev.cloudfunctions.net/api/stripe/refresh?acct=" + acct_id

      const accountLink = await stripe.accountLinks.create({
        account: acct_id,
        refresh_url: refresh_url,
        return_url: 'https://uncommonapp.page.link/stripe',
        type: 'account_onboarding',
      });

      const account_url = accountLink.url

      //then, redirect to URL we just built
      res.redirect(account_url);
    } else {
      return res.status(400).send('Missing {acct=acct_id} in request. Please retry or email colin@uncommon.app')
    }
  });
// #endregion

// #region POST /api/firebase/users/create
express_app.post('/firebase/users/create', async (req, res) => {
    
    const o = req.body;
    const uuid = o.doc_id;

    const user_obj = {
        account: {
            available_cash: o.account.available_cash,
            available_discounts: o.account.available_discounts
        },
        doc_id: o.doc_id,
        profile: {
            email: o.profile.email,
            first_name: o.profile.first_name,
            last_name: o.profile.last_name,
            phone: o.profile.phone,
            phone_verified: o.profile.phone_verified
        },
        settings: {
            notifications: o.settings.notifications
        },
        timestamps: {
            joined: o.timestamps.joined
        }
    };

    await admin.firestore().collection("users").doc(uuid).set(user_obj);

    return res.sendStatus(201);

});
// #endregion

// #region POST /api/firebase/auth_shopify/create
express_app.post('/firebase/auth_shopify/create', async (req, res) => {

    const o = req.body;
    const doc_id = o.shop.domain;

    const tstamp = getTimestamp();

    const object = {
        "shop": {
            "category": o.shop.category,
            "contact_support_email": o.shop.contact_support_email,
            "description": o.shop.description,
            "domain": o.shop.domain,
            "name": o.shop.name,
            "website": o.shop.website,
        },
        "session": {
            "scope": o.session.scope,
            "shop": o.shop.domain,
            "token": o.session.token
        },
        "subscription": {
            "description": o.subscription.description,
            "capped_amount": o.subscription.capped_amount
        },
        "timestamp": {
            "created": tstamp,
            "subscribed": 0,
            "updated": 0,
            "deleted": 0
        },
        "uuid": {
            "auth_shopify": o.shop.domain,
            "shop": ""
        }
    };
    

    await admin.firestore().collection("auth_shopify").doc(doc_id).set(object);

    return res.sendStatus(201);

});
// #endregion

// #region POST /api/firebase/shops/create
express_app.post('/firebase/shops/create', async (req, res) => {
    
    const o = req.body;
    const ref = admin.firestore().collection("shops").doc();

    const object = {
        account: {
            email: o.account.email,
            name: {
                first: o.account.name.first,
                last: o.account.name.last
            }
        },
        campaigns: o.campaigns,
        info: {
            category: o.info.category,
            description: o.info.description,
            domain: o.info.domain,
            icon: o.info.icon,
            name: o.info.name,
            website: o.info.website
        }, 
        timestamp: {
            created: o.timestamp.created
        },
        uuid: {
            shop: ref.id
        }
    };

    await ref.set(object);

    return res.sendStatus(201);

});
// #endregion

// #region POST /api/firebase/auth_phone/create
express_app.post('/firebase/auth_phone/create', async (req, res) => {
    
    const o = req.body;

    const ref = admin.firestore().collection("auth_phone").doc(o.uuid.auth_phone);

    const object = {
        correct_code: o.correct_code,
        phone: o.phone,
        submitted_code: o.submitted_code,
        timestamp: {
            created: o.timestamp.created,
            expires: o.timestamp.expires,
            submitted: o.timestamp.submitted
        },
        uuid: {
            auth_phone: o.uuid.auth_phone,
            user: o.uuid.user
        }
    };

    await ref.set(object);

    return res.sendStatus(201);

});
// #endregion

// #region POST /api/firebase/auth_phone/update
express_app.post('firebase/auth_phone/update', async (req, res) => {
    
    const o = req.body;

    const ref = admin.firestore().collection("auth_phone").doc(o.uuid.auth_phone);

    const tstamp = getTimestamp();

    const object = {
        "submitted_code": o.submitted_code,
        "timestamp.submitted": tstamp
    };

    await ref.update(object);

    return res.sendStatus(201);

});
// #endregion


export default express_app;








// ----- HELPER FUNCTIONS ------

// #region mapValues(object, data)
const mapValues = (object, data) => {
    
    object.session.token = data.access_token
    object.session.scope = data.scope
    
    return object
}
// #endregion


// // #region getAccessToken(accessTokenRequestUrl, accessTokenPayload)
// const getAccessToken = (accessTokenRequestUrl, accessTokenPayload) => new Promise((resolve, reject) => {

//     axios.post(accessTokenRequestUrl, accessTokenPayload)
//         .then(response => {
//             resolve(response)
//         })
//         .catch(error => {
//             reject(error)
//         })   
// });
// // #endregion

// #region addShopIfNewShop(domain, object)
// const addShopIfNewShop = async (domain, object, data) => {

//     var docRef = admin.firestore().collection("auth_shopify").doc(domain);

//     return docRef.get().then((doc) => {

//         if (doc.exists) {

//             console.log("SHOP ALREADY EXISTS.. DO NOTHING");
//             return res.redirect("https://uncommon.app/blog");

//         } else {

//             const new_object = mapValues(object, data)
            
//             console.log("NEW SHOP BEING ADDED");
//             docRef.set(new_object).then(() => {
//                 return res.redirect("https://uncommon.app/blog");
//             })
//         }
//     }).catch((error) => {
//         console.log("Error getting document:", error);
//         return res.status(500).send(error);
//     });
// };
// #endregion

// #region getShop(domain)
const getShop = async (domain) => {

    const shop = await admin.firestore().collection("shops") 
        .where("shop.domain", "==", domain)
        .limit(1)
        .get();
    
    if (shop) {
        return shop.data();
    } else {
        return
    }
};
// #endregion

// #region logError
function log_domain_not_found(req) {
    console.log("error, no shop_object found for this domain:");
    console.log(req.header('x-shopify-shop-domain'));
    console.log(req.body);
    return;
}
// #endregion

// #region addOrder(object, shop)
const addOrder = async (object, shop) => {

    let ref = admin.firestore().collection("orders").doc();     

    var type = ((req.body.discount_codes[0]) ? [req.body.discount_codes[0].type] : []);
    var amount = ((req.body.discount_codes[0]) ? [req.body.discount_codes[0].amount] : []);
    var code = ((req.body.discount_codes[0]) ? [req.body.discount_codes[0].code] : []);
    var phone = ((req.body.phone) ? req.body.phone : "");
    
    // #region Create order object for Firebase
    var new_order = {

        codes: {
            type: type,
            amount: amount,
            code: code,
        },
        order: {
            email: object.email,
            first_item_title: object.line_items[0].title,
            number: object.order_number,
            confirmation_url: object.order_status_url,
            phone: phone,              
            price: object.total_line_items_price,
            shopify_order_id: object.id,
            status: "PAID"
        },        
        referrer: {
            code: "",           // this is the literal code
            membership: "",     // this is the referrer's membership
            user: ""            // this is the referrer UserID
        },
        shop: {
            category: shop.shop.category,
            description: shop.shop.description,
            domain: shop.shop.domain,
            name: shop.shop.name,
            website: shop.shop.website,
            contact_support_url: shop.shop.contact_support_url
        },
        timestamp: {
            created: getTimestamp(),
            disabled: 0,
            updated: 0
        },
        uuid: {
            campaign: "",       // will be linked to a campaign for the REFERRAL or REWARD_CODE
            cash: "",           // will not be linked to either
            code: "",           // will be linked to a code for REFERRAL or REWARD_CODE
            membership: "",     // if REWARD_CODE, it's the buyer for both. if REFERRAL, this is the buyer and /referrer is the referrer
            order: ref.id,
            referral: "",       // will be linked ONLY if it's a REFERRAL
            shop: shop.uuid.shop,
            user: ""            // this is the buyer in either case
        }
    };
    // #endregion

    return ref.set(new_order);
}
// #endregion