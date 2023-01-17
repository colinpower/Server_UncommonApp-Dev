// #region Import and Setup
import admin from "firebase-admin";
import functions from "firebase-functions";

import { getCampaign, getToken, getUser } from "./helpers/firestore-helper.js";
import { getTimestamp } from "./helpers/helper.js";
import { createShopifyCode } from "./helpers/shopify-helper.js";

const create_Code = functions.firestore
  .document('codes/{code_id}')
  .onCreate(async (snap, context) => {

    const doc_id = context.params.doc_id;
    const doc = snap.data();
    const campaign = await getCampaign(doc);
    const temp_code = await makeTempCode(doc);

    const object = {
        value: campaign.offer.value,
        code: temp_code,
        title: campaign.title,
        usage_limit: campaign.offer.usage_limit,
    };

    const token = await getToken(doc.shop.domain);
    const graphql_id = await createShopifyCode(doc.shop.domain, token, object);

    return updateDocumentWithTempCode(doc_id, doc, temp_code, graphql_id, campaign)
});

export default create_Code;

// #region makeTempCode(doc)
const makeTempCode = async (doc) => {

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    const randomArray = Array.from(
        { length: 4 },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
        );
    
    const user = await getUser(doc.uuid.user);

    return user.profile.name.first + randomArray.join("");
};
// #endregion

// #region updateDocumentWithTempCode(doc_id, doc, graphql_id)
const updateDocumentWithTempCode = async (doc_id, doc, temp_code, graphql_id, campaign) => {

    var uppercased = temp_code.toUpperCase();

    doc.code.code = temp_code;
    doc.code.UPPERCASED = uppercased;
    doc.code.graphql_id = graphql_id;
    doc.status = "ACTIVE"
    doc.timestamp.created = getTimestamp();
    doc.uuid.campaign = campaign.uuid.campaign;

    return admin.firestore().collection("auth_shopify").doc(doc_id).update(doc);
};
// #endregion