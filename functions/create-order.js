import admin from "firebase-admin";
import functions from "firebase-functions";
import { getTimestamp } from "./helpers/helper.js";

const create_Order = functions.firestore
  .document('orders/{doc_id}')
  .onCreate(async (snap, context) => {

    const doc_id = context.params.doc_id;
    const order = snap.data();
    const user = await checkForUser(order.order.email, order.order.phone);
    const membership = await checkForMembership(user, order.uuid.shop);
    
    if (order.codes.code[0]) {                                    // CODE USED... -->

        const code = await checkForCode(order.codes.code[0], order.shop.domain);

        if (code) {                                             //      --> & FROM UNCOMMON


            console.log("THIS WAS THE CODE IN THE SWITCH STATEMENT");
            console.log(code);

            if (code._PURPOSE == "REWARD") {                     //      --> & FROM UNCOMMON, AS REWARD
                
                return makeUpdatesForRewardCodeUsage(doc_id, order, code);

            } else if (code._PURPOSE == "REFERRAL") {            //      --> & FROM UNCOMMON, AS REFERRAL

                console.log("THIS WAS A REFERRAL CODE");

                return makeUpdatesForReferralCodeUsage(doc_id, order, user, membership, code)

            } else {                                            //      --> & ERROR FINDING TYPE

                console.log("error!!! did not match code correctly");
                return
            }
        } else {                                                //      --> & NOT FROM UNCOMMON

            return updateDoc(doc_id, order, user, membership);

        }

    } else {                                                    // NO CODE USED

        return updateDoc(doc_id, order, user, membership);
        
    }
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
        .limit(1)
        .get()
        .then(result => {

            if (result.empty) {

                console.log("NO EMAIL");

                return admin.firestore().collection("users")    //First, check whether shop exists for domain
                    .where("profile.phone", "==", phone)
                    .limit(1)
                    .get()
                    .then(result => {
                        if (result.empty) {
                            return
                        } else {
                            return result.docs[0].data();
                        }
                    })

            } else {
                console.log("YES EMAIL");
                return result.docs[0].data();
            }
        });
};
// #endregion

// #region checkForMembership(user, shop_id)
const checkForMembership = async (user, shop_id) => {

    if (user) {

        const membership_id = user.uuid.user + "-" + shop_id;

        return admin.firestore().collection("shops").doc(membership_id).get()
        .then((result) => {
            if (result) {
                return result.data();
            } else {
                return;
            }
        })
    } else {
        return
    }
};
// #endregion

// #region checkForCode(code, domain)
const checkForCode = async (code, domain) => {

    return admin.firestore().collection("codes")    //First, check whether shop exists for domain
        .where("code.UPPERCASED", "==", code.toUpperCase())
        .where("shop.domain", "==", domain)
        .limit(1)
        .get()
        .then((result) => {
            if (result) {
                console.log("THIS IS THE CODE FOUND");
                console.log(result.docs[0].data());
                return result.docs[0].data();
            } else {
                return
            }
        })
       
};
// #endregion

// #region makeUpdatesForRewardCodeUsage(doc_id, doc, code)
const makeUpdatesForRewardCodeUsage = async (doc_id, doc, code) => {            // update code, update doc

    code.stats.usage_count = code.stats.usage_count + 1;
    code.status = "USED";
    code.timestamp.last_used = getTimestamp();
    code.uuid.order = doc.uuid.order;

    await admin.firestore().collection("codes").doc(code.uuid.code).update(code);


    doc.uuid.campaign = code.uuid.campaign;
    doc.uuid.code = code.uuid.code;
    doc.uuid.membership = code.uuid.membership;
    doc.uuid.user = code.uuid.user;

    return admin.firestore().collection("orders").doc(doc_id).update(doc);

}
// #endregion

// #region makeUpdatesForReferralCodeUsage(doc_id, order, user, membership, code)
const makeUpdatesForReferralCodeUsage = async (doc_id, order, user, membership, code) => {            // update code, add referral, update order

    code.stats.usage_count = code.stats.usage_count + 1;
    code.timestamp.last_used = getTimestamp();
    code.uuid.order = order.uuid.order;

    await admin.firestore().collection("codes").doc(code.uuid.code).update(code);

    const referral_id = await createReferral(code, order);

    order.referrer.code = code.code.code;
    order.referrer.membership = code.uuid.membership;
    order.referrer.user = code.uuid.user;
    order.uuid.campaign = code.uuid.campaign;
    order.uuid.code = code.uuid.code;
    order.uuid.membership = ((membership) ? membership.uuid.membership : "");
    order.uuid.referral = referral_id;
    order.uuid.user = ((user) ? user.uuid.user : "");

    return admin.firestore().collection("orders").doc(doc_id).update(order);
};
// #endregion

// #region createReferral(code, user)
const createReferral = async (code, order) => {

    //must first post a new /referral/{id}
    //then return the referral_id

    const campaign = await getCampaign(code);

    if (campaign) {

        console.log("FOUND CAMPAIGN");
        console.log(campaign);

        const referral_ref = admin.firestore().collection("referrals").doc();

        console.log("THIS IS THE REFERRAL REFERENCE")
        console.log(referral_ref.id);

        var object = {
            
            _STATUS: "PENDING",
            code: code.code.code,
            commission: {
                duration_pending: campaign.commission.duration_pending,
                offer: campaign.commission.offer,
                type: campaign.commission.type,
                value: campaign.commission.value,
            },
            modified_by: "",
            revenue: order.order.price,
            shop: {
                domain: code.shop.domain,
                name: code.shop.name,
                category: code.shop.category,
                contact_support_email: code.shop.contact_support_email,
                description: code.shop.description,
                website: code.shop.website,
            },
            status: "ACTIVE",
            timestamp: {
                created: getTimestamp(),
                completed: 0,
                returned: 0,
                flagged: 0,
                deleted: 0
            },
            uuid: {
                campaign: campaign.uuid.campaign,
                cash: "",
                code: code.uuid.code,
                membership: code.uuid.membership,
                order: order.uuid.order,
                referral: referral_ref.id,
                reward_code: "",
                shop: code.uuid.shop,
                user: code.uuid.user,
            }
        }
      
        await referral_ref.set(object);

        console.log("THIS IS THE REFERRAL REFERENCE")

        return referral_ref.id

    } else {
        console.log("ERROR!! CAN'T FIND CAMPAIGN!!!")
        return;
    }
};
// #endregion

// #region getCampaign(code)
const getCampaign = async (code) => {

    return admin.firestore().collection("campaigns").doc(code.uuid.campaign).get()
        .then((result) => {
            if (result) {
                return result.data();
            } else {
                return;
            }
        });
};
// #endregion

// #region updateDoc(user, membership, doc)
const updateDoc = (doc_id, doc, user, membership) => {

    if ((user) || (membership)) {
        
        if (user) {

            doc.uuid.user = user.uuid.user;

        }
            
        if (membership) {

            doc.uuid.membership = membership.uuid.membership;

        }

        return admin.firestore().collection("orders").doc(doc_id).update(doc);

    } else {
        return
    }  
};
// #endregion