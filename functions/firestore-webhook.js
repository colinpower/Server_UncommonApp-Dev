import admin from "firebase-admin";
import functions from "firebase-functions";
import express from 'express';


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

// #region /shopify
firestoreWebhook.post('/shopify', async (req, res) => {
    
    const o = req.body;
    const doc_id = o.shop.domain;

    const object = {
        "lastUpdated": 0,
        "shop": {
            "domain": o.shop.domain,
            "name": o.shop.name,
            "uuid": o.shop.uuid,
        }, 
        "token": {
            "scopes": o.token.scopes,
            "token": o.token.token
        }
    };
    

    await admin.firestore().collection("shopify").doc(doc_id).set(object);

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
export default firestoreWebhook;