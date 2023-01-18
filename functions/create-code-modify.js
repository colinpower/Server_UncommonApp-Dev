// #region Import and Setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import { getTimestamp } from "./helpers/helper.js";
import { getToken } from "./helpers/firestore-helper.js";
import { updateShopifyCode } from "./helpers/shopify-helper.js";
// #endregion

const create_Code_modify = functions.firestore
  .document('codes/{code_id}/modify/{doc_id}')
  .onCreate(async (snap, context) => {

    const code_id = context.params.code_id;
    const doc_id = context.params.doc_id;
    const doc = snap.data();

    // code {}
    // new_code
    // shop {}
    // status = PENDING / ACTIVE / FAILED / DELETED / EXPIRED
    // timestamp.created
    // timestamp.updated
    // uuid

    const object = {
        new_code: doc.new_code,
        graphql_id: doc.code.graphql_id,
    };

    const token = await getToken(doc.shop.domain);
    const graphql_id = await updateShopifyCode(doc.shop.domain, token, object);

    if (graphql_id) {
        await updateModifyDocument(code_id, doc_id, doc, "ACTIVE")
        return updateDocumentWithNewCode(code_id, doc.new_code);
    } else {
        console.log("ERROR trying to update the code.. no graphql_id returned")
        return updateModifyDocument(code_id, doc_id, doc, "FAILED")
    }
});

export default create_Code_modify;


// #region updateModifyDocument(code_id, doc_id, doc, status)
const updateModifyDocument = async (code_id, doc_id, doc, status) => {

    doc.status = status
    doc.timestamp.updated = getTimestamp();
    return admin.firestore().collection("codes").doc(code_id).collection("modify").doc(doc_id).update(doc);
};
// #endregion

// #region updateDocumentWithNewCode(code_id, new_code)
const updateDocumentWithNewCode = async (code_id, new_code) => {

    var uppercased = new_code.toUpperCase();

    var object = {
        "code.code": new_code,
        "code.UPPERCASED": uppercased
    }

    return admin.firestore().collection("codes").doc(code_id).update(object);
};
// #endregion
