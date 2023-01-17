import admin from "firebase-admin";
import functions from "firebase-functions";
import express from 'express';
import { getTimestamp } from "./../helpers/helper.js";


const firestoreWebhook = express();
//const baseURL = "https://us-central1-uncommonapp-dev.cloudfunctions.net/firestore";

// #region /user
firestoreWebhook.post('/users', async (req, res) => {
    
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

// #region /auth_shopify
firestoreWebhook.post('/auth_shopify', async (req, res) => {

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

// #region /shops
firestoreWebhook.post('/shops', async (req, res) => {
    
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


// #region /auth_phone
firestoreWebhook.post('/auth_phone', async (req, res) => {
    
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

// #region UPDATE /auth_phone
firestoreWebhook.post('/update_auth_phone', async (req, res) => {
    
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



export default firestoreWebhook;