import admin from "firebase-admin";
import { getTimestamp } from "./helper.js";

export async function getCampaign(code) {
    const snap = await admin.firestore().collection("campaigns").doc(code.uuid.campaign).get()
    return snap.data();
};

export async function getToken(domain) {
    return admin.firestore().collection("auth_shopify").doc(domain)
        .get()
        .then(result => {

            if (result) {
                return result.data().session.token;
            } else {
                return
            }
        })
};

export async function getUser(uid) {
    const snap = await admin.firestore().collection("users").doc(uid).get()
    return snap.data();
};

export async function createCashPayout(user_uuid, cash_uuid, amount_in_cents) {

    //create the object
    const object = {
        _PURPOSE: "PAYOUT",
        shop: {
            category: "",
            contact_support_email: "",
            description: "",
            domain: "",
            name: "",
            website: ""
        },
        status: "SUCCESS",
        timestamp: {
            created: getTimestamp(),
            payout: getTimestamp(),
            transfer: 0
        },
        uuid: {
            campaign: "",
            cash: cash_uuid,
            code: "",
            membership: "",
            order: "",
            referral: "",
            reward_code: "",
            shop: "",
            user: user_uuid,
        },
        value: String(amount_in_cents)
    };

    return admin.firestore().collection("cash").doc(cash_uuid).set(object);
};