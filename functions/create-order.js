import admin from "firebase-admin";
import functions from "firebase-functions";

const create_Order = functions.firestore
  .document('orders/{doc_id}')
  .onCreate(async (snap, context) => {

    const doc_id = context.params.doc_id;
    const doc = snap.data();
    
    console.log(order);
    console.log(order.order.email);

    const user = await checkForUser(doc.order.email, doc.order.phone);
 
    if (doc.codes.code) {
        const existing_code = await checkForCode(doc.codes.code[0]);
        
        object.code = codeResult.docs[0].data().code.CODE;
            let referral_ref = admin.firestore().collection("referrals").doc();
            await createReferral(codeResult.docs[0].data(), order, referral_ref)
    }
        if (!codeResult.empty) {

            
        }


    } else {

        

    }
    

    

    if (!userResult.empty) {
        object.abc = userResult.docs[0].data().profile.email
    } else {
        console.log("we not find an email");
    }
    
    let new_post = admin.firestore().collection("ABCDEF").doc();

    return new_post.set(object);

    //const code = await getCode(order);

    // if (!code.empty) {
    //     if (code.timestamp.deleted < 1000) {                    //Just a random check.. should check if code is of type "REFERRAL" or "REWARD"
    //         const referral = await createReferral(code, user, order);
    //         const result = await updateReferralCode(code, user, order, referral);
    //         return await updateOrder(code, user, order);
    //     } else {
    //         // const reward = await updateReward(code, user, order);
    //         // const result = await updateRewardCode(code, user, order, reward);
    //         // return await updateRewardOrder(code, user, order, reward);
    //     };
    // } else {
    //     return await updateOrder(code, user, order);
    // }
});

export default create_Order;

// #region checkForUser(email, phone)
const checkForUser = async (email, phone) => {

    if (!email) {
        email = "XXXXXXXXXXX"
    }
    if (!phone) {
        phone = "XXXXXXXXXXX"
    }
        
    return admin.firestore().collection("users")    //First, check whether shop exists for domain
        .where("profile.email", "==", email)
        .get()
        .then(result => {

            if (result.empty) {

                console.log("NO EMAIL");

                return admin.firestore().collection("users")    //First, check whether shop exists for domain
                    .where("profile.phone", "==", order.order.phone)
                    .get();

            } else {
                console.log("YES EMAIL");
                return result
            }
        });
};
// #endregion

// #region checkForCode(code)
const checkForCode = async (code) => {

    return admin.firestore().collection("codes")    //First, check whether shop exists for domain
        .where("code.UPPERCASED", "==", order.codes.code[0].toUpperCase())
        .get()
       
};
// #endregion

// #region createReferral(code, user, referral_ref)
const createReferral = async (code, order, referral_ref) => {

    return admin.firestore().collection("campaigns")    //First, check whether shop exists for domain
        .where("uuid.campaign", "==", code.uuid.campaign)
        .get()
        .then(result => {

            if (result.empty) {
                console.log("Error: Can't find the campaign for the following code");
                console.log(code);
                return;
            } else {

                let campaign = result.docs[0].data();

                const current_timestamp_milliseconds = new Date().getTime();
                const timestamp = Math.round(current_timestamp_milliseconds / 1000);

                var offer_summary = "";

                if (campaign.commission.offer == "PERCENT"){
                    offer_summary = campaign.commission.value + "%"
                } else {
                    offer_summary = "$" + campaign.commission.value
                }

                var object = {
                    commission: {
                        duration_pending: campaign.commission.duration_pending,
                        offer: campaign.commission.offer,
                        type: campaign.commission.type,
                        value: campaign.commission.value,
                    },
                    offer: offer_summary,
                    revenue: order.order.price,
                    shop: {
                        domain: code.shop.domain,
                        icon: code.shop.icon,
                        name: code.shop.name,
                        website: code.shop.website,
                    },
                    status: "PENDING",
                    timestamp: {
                        completed: -1,
                        created: timestamp,
                        deleted: -1,
                        flagged: -1,
                        returned: -1,
                    },
                    uuid: {
                        campaign: campaign.uuid.campaign,
                        cash_reward: "",
                        code: code.uuid.code,
                        discount_reward: "",
                        membership: code.uuid.membership,
                        order: order.uuid.order,
                        referral: referral_ref.id,
                        shop: code.uuid.shop,
                        user: code.uuid.user,
                    },
                };

                return referral_ref.set(object);
            }
        })
};
// #endregion

// #region updateReferralCode(code, user, order, referral)

// #region updateReferredOrder(code, user, order, referral)
const updateOrder = async (code, user, order) => {
    
    var object = order;
    var buyer_id = "";
    var referrer_id = "";
    var code_id = "";
    var campaign_id = "";

    if (!user.empty) {
        buyer_id = user.doc_id;
    };

    if (!code.empty) {
        code_id = code.uuid.code;
        campaign_id = code.uuid.campaign;
        referrer_id = code.uuid.user;
    };

    object.uuid.campaign = campaign_id;
    object.uuid.code = code_id;
    object.uuid.user.buyer = user_id;
    object.uuid.user.referrer = referrer_id;

    return admin.firestore().collection("orders").doc(order.uuid.order).update(object);
};
// #endregion

// #region updateOrder(order, user, code)
// const updateOrder = async (code, user, order) => {
    
//     var object = order;
    

//     object.stats.usage_count = object.stats.usage_count + 1;
//     object.timestamp.used = timestamp;

//     return admin.firestore().collection("codes").doc(code.uuid.code).update(object);
// };

// #region updateRewardCode(code, user, order, discount)
// async function updateRewardCode(code, user, order, discount) {
    
//     var object = code;
//     const current_timestamp_milliseconds = new Date().getTime();
//     const timestamp = Math.round(current_timestamp_milliseconds / 1000);

//     object.stats.usage_count = object.stats.usage_count + 1;
//     object.timestamp.used = timestamp;

//     return admin.firestore().collection("codes").doc(code.uuid.code).update(object);
// };
// #endregion

// // #region getUser(Order)
// const getUser = async (order) => {

//     const emails = await admin.firestore().collection("users")    //First, check whether shop exists for domain
//             .where("profile.email", "==", order.order.email)
//             .get();

//             return(emails.docs[0].data());



