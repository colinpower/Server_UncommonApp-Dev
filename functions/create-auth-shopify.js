// #region Import and Setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import { getTimestamp } from "./helpers/helper.js";
import { getShopInfo } from "./helpers/shopify-helper.js";
// #endregion

const create_authShopify = functions.firestore
  .document('auth_shopify/{doc_id}')
  .onCreate(async (snap, context) => {
 
    const doc_id = context.params.doc_id;
    const doc = snap.data();

    const domain = doc.shop.domain;
    const token = doc.session.token;

    const new_shop_ref = admin.firestore().collection("shops").doc();
    const new_campaign_ref = admin.firestore().collection("campaigns").doc();

    const info = await getShopInfo(domain, token)
    
    await updateDocumentWithShopInfo(doc_id, doc, info, new_shop_ref)
     
    await createEmptyShopsDocument(new_shop_ref, new_campaign_ref, doc, info)

    return createEmptyCampaignsDocument(new_shop_ref, new_campaign_ref)
});

export default create_authShopify;


// #region updateDocumentWithShopInfo(doc_id, doc, info)
const updateDocumentWithShopInfo = async (doc_id, doc, info, ref) => {

    doc.shop.contact_support_email = info.contact_support_email;
    doc.shop.description = info.description;
    doc.shop.name = info.name;
    doc.shop.website = info.website;
    doc.timestamp.created = getTimestamp();
    doc.uuid.shop = ref.id;

    return admin.firestore().collection("auth_shopify").doc(doc_id).update(doc);
};
// #endregion

// #region createEmptyShopsDocument(new_shop_ref, new_campaign_ref, doc, info)
const createEmptyShopsDocument = async (new_shop_ref, new_campaign_ref, doc, info) => {

    const tstamp = getTimestamp();

    const object = {
        _STATUS: "PENDING",
        campaigns: [new_campaign_ref.id],
        profile: {
            email: info.email,
            email_verified: false,
            name: {
                first: "",
                last: ""
            },
            phone: "",
            phone_verified: false
        },
        shop: {
            category: "",
            contact_support_email: info.contact_support_email,
            description: info.description,
            domain: doc.shop.domain,
            name: info.name,
            website: info.website
        },
        timestamp: {
            created: tstamp,
            deleted: 0
        },
        uuid: {
            shop: doc.shop.domain
        }
    };


    return new_shop_ref.set(object);
};
// #endregion

// #region createEmptyCampaignsDocument(new_shop_ref, new_campaign_ref)
const createEmptyCampaignsDocument = async (new_shop_ref, new_campaign_ref) => {

    const tstamp = getTimestamp();
                      
    const object = {
        commission: {
            duration_pending: 0,
            offer: "",
            type: "",
            value: ""
        },
        color: [],
        requirements: {
            customers_only: false,
            referral_count: 0,
            users: []
        },
        title: "",
        offer: {
            one_per_customer: false,
            minimum_spend: 0,
            offer: "",
            type: "",
            timestamp: {
                expires: 0,
                starts: 0
            },
            total_usage_limit: 0,
            value: ""
        },
        status: "EMPTY",
        timestamp: {
            created: tstamp,
            expires: 0,
            starts: 0
        },
        uuid: {
            shop: new_shop_ref.id,
            campaign: new_campaign_ref.id
        }
    };

    return new_campaign_ref.set(object);
};
// #endregion

