import admin from "firebase-admin";

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