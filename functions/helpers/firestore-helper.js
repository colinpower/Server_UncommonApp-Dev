import admin from "firebase-admin";

export async function getCampaign(code) {
    const snap = await admin.firestore().collection("campaigns").doc(code.uuid.campaign).get()
    return snap.data();
};

export async function getToken(domain) {
    return admin.firestore().collection("shopify").doc(domain)
        .get()
        .then(result => {

            console.log(domain);
            console.log(result.data());
            console.log(result.data().token.token);

            if (!result.empty) {
                return result.data().token.token;
            } else {
                return
            }
        })
};

export async function getUser(uid) {
    const snap = await admin.firestore().collection("users").doc(uid).get()
    return snap.data();
};