import admin from "firebase-admin";

export function getTimestamp() {

    const current_timestamp_milliseconds = new Date().getTime();
    const timestamp = Math.round(current_timestamp_milliseconds / 1000);

    return timestamp;
};

export async function getCampaign(code) {
    return admin.firestore().collection("campaigns").doc(code.uuid.campaign).get()
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