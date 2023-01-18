import admin from "firebase-admin";
import functions from "firebase-functions";
import { getTimestamp } from "./helpers/helper.js";

const create_Order = functions.firestore
  .document('orders/{doc_id}')
  .onCreate(async (snap, context) => {

    const doc_id = context.params.doc_id;
    const doc = snap.data();
    const user = await checkForUser(doc.order.email, doc.order.phone);
    const membership = await checkForMembership(user, doc.uuid.shop);
    
    if (doc.codes.code[0]) {                                    // CODE USED... -->

        const code = await checkForCode(doc.codes.code[0], doc.shop.domain);

        if (code) {                                             //      --> & FROM UNCOMMON

            if (code.purpose == "REWARD") {                     //      --> & FROM UNCOMMON, AS REWARD
                
                return makeUpdatesForRewardCodeUsage(doc_id, doc, code);

            } else if (code.purpose == "REFERRAL") {            //      --> & FROM UNCOMMON, AS REFERRAL

                return makeUpdatesForReferralCodeUsage(doc_id, doc, user, membership, code)

            } else {                                            //      --> & ERROR FINDING TYPE

                console.log("error!!! did not match code correctly");
                return
            }
        } else {                                                //      --> & NOT FROM UNCOMMON

            return updateDoc(doc_id, doc, user, membership);

        }


    } else {                                                    // NO CODE USED

        return updateDoc(doc_id, doc, user, membership);
        
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

// #region makeUpdatesForReferralCodeUsage(doc_id, doc, user, membership, code)
const makeUpdatesForReferralCodeUsage = async (doc_id, doc, user, membership, code) => {            // update code, add referral, update order

    code.stats.usage_count = code.stats.usage_count + 1;
    code.timestamp.last_used = getTimestamp();
    code.uuid.order = doc.uuid.order;

    await admin.firestore().collection("codes").doc(code.uuid.code).update(code);

    const referral_id = createReferral(doc, code);

    doc.referrer.code = code.code.code;
    doc.referrer.membership = code.uuid.membership;
    doc.referrer.user = code.uuid.user;
    doc.uuid.campaign = code.uuid.campaign;
    doc.uuid.code = code.uuid.code;
    doc.uuid.membership = ((membership) ? membership.uuid.membership : "");
    doc.uuid.referral = referral_id;
    doc.uuid.user = ((user) ? user.uuid.user : "");

    return admin.firestore().collection("orders").doc(doc_id).update(doc);
};
// #endregion

// #region createReferral(code, user, referral_ref)
const createReferral = async (code, order, referral_ref) => {

    //must first post a new /referral/{id}
    //then return the referral_id

    const campaign = await getCampaign(code);

    if (campaign) {

        const referral_ref = admin.firestore().collection("referrals").doc();

        var object = {}

        object.commission = campaign.commission;
        object.code = code.code.code;
        object.revenue = order.order.price;
        object.shop = code.shop;
        object.status = "ACTIVE";
        object.modified_by = "";
        object.timestamp.created = getTimestamp();
        object.timestamp.completed = 0;
        object.timestamp.returned = 0;
        object.timestamp.flagged = 0;
        object.timestamp.deleted = 0;
        object.uuid.campaign = campaign.uuid.campaign;
        object.uuid.cash = "";
        object.uuid.code = code.uuid.code;
        object.uuid.membership = code.uuid.membership;
        object.uuid.order = order.uuid.order;
        object.uuid.referral = referral_ref.id;
        object.uuid.shop = code.uuid.shop;
        object.uuid.user = code.uuid.user;
      
        await referral_ref.set(object);

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
