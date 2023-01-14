import admin from "firebase-admin";
import functions from "firebase-functions";
import fetch from "node-fetch";

//import { getTimestamp } from "./helper.js";
//import { getCampaign } from "./code_on_create.js";
import { getTimestamp } from "./helper.js";

//const tstampvar = await getTimestamp();

const codeOnUpdate = functions.firestore
  .document('codes/{code_id}/updates/{update_id}')
  .onCreate(async (snap, context) => {

    //const tstamp = getCampaign({"code": "asfasdf"});
    // console.log(tstampvar);
    // const tstamp2 = await getTimestamp2();
    // console.log(tstamp2);

    const code_id = context.params.code_id;
    const update_id = context.params.update_id;
    const update_obj = snap.data();

    const gql_obj = {
        code: update_obj.code.new,
        domain: update_obj.domain,
        graphql_id: update_obj.code.graphql_id,
    };

    //make a request to create the discount
    const response = await fetch("https://us-central1-uncommonapp-dev.cloudfunctions.net/shopify_update_code", {
        method: "POST", 
        body: JSON.stringify(gql_obj),
        headers: { "Content-Type": "application/json" }
    });
    
    //const current_timestamp_milliseconds = new Date().getTime();

    var updateObject = snap.data();
    //updateObject.timestamp.updated = Math.round(current_timestamp_milliseconds / 1000);
    updateObject.timestamp.updated = getTimestamp();

    console.log(response.status);

    if (response.status == 409) {

        return updateUpdateID(updateObject, "TAKEN", code_id, update_id)
        
    } else if (response.status == 500) {

        return updateUpdateID(updateObject, "FAILED", code_id, update_id)
        
    } else if (response.status == 201) {

        await updateUpdateID(updateObject, "SUCCESS", code_id, update_id)
        return updateCodeID(updateObject, code_id)
    } else {

        return updateUpdateID(updateObject, "UNKNOWN", code_id, update_id)

    }
});

export default codeOnUpdate;


// #region updateUpdateID(object, value, code_id, update_id)
const updateUpdateID = async (object, value, code_id, update_id) => {

    object.status = value
    return admin.firestore().collection("codes").doc(code_id).collection("updates").doc(update_id).set(object);
};
// #endregion

// #region updateCodeID(object, code_id)
const updateCodeID = async (object, code_id) => {

    // var codeObject = {
    //   "code": object.code.new,
    //   "color": object.code.color,
    //   "graphql_id": object.code.graphql_id,
    //   "is_default": object.code.is_default
    // };

    return admin.firestore().collection("codes").doc(code_id).update({"code.code": object.code.new});
};
// #endregion









// // #region createReferral(code, user, referral_ref)
// const createReferral = async (code, order, referral_ref) => {

//     return admin.firestore().collection("campaigns")    //First, check whether shop exists for domain
//         .where("uuid.campaign", "==", code.uuid.campaign)
//         .get()
//         .then(result => {

//             if (result.empty) {
//                 console.log("Error: Can't find the campaign for the following code");
//                 console.log(code);
//                 return;



//mutation updateDiscount($id:ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
//     discountCodeBasicUpdate(id:$id, basicCodeDiscount: $basicCodeDiscount) {
//         codeDiscountNode {
//             id: id
//             }
//             userErrors { 
//             extraInfo
//             code
//             field
//             message
//             }
//     }
// }


// {
//     "id": "gid://shopify/DiscountCodeNode/1206751002879",
//     "basicCodeDiscount": {
//       "usageLimit": 2,
//         "customerGets": {
//         "value": {
//             "discountAmount": {
//             "amount": 20
//                 }
//             }
//         }
//     }
// }
