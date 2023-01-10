import admin from "firebase-admin";
import functions from "firebase-functions";
import fetch from "node-fetch";

const codeOnCreate = functions.firestore
  .document('codes/{code_id}')
  .onCreate(async (snap, context) => {

    //get the new discount ID
    const code_obj = snap.data();
    const campaign_doc = await getCampaign(code_obj);
    const campaign_obj = campaign_doc.data();
    const current_timestamp_milliseconds = new Date().getTime();
    const timestamp = Math.round(current_timestamp_milliseconds / 1000);


    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    const randomArray = Array.from(
        { length: 4 },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
        );
    
    const code_text = "COLIN" + randomArray.join("");

    //Create the JSON to send to the GraphQL API
    const gql_obj = {
        code: code_text,
        value: campaign_obj.offer.value,
        domain: campaign_obj.domain,
        graphql_id: "",
        title: "Uncommon Campaign 1",
        usage_limit: 100
    };

    //make a request to create the discount
    const response = await fetch("https://us-central1-uncommonapp-dev.cloudfunctions.net/shopify_create_code", {
        method: "POST", 
        body: JSON.stringify(gql_obj),
        headers: { "Content-Type": "application/json" }
    });
    
    // create entry for this discount
    const response_obj = await response.json();
    const graphql_id = response_obj.graphql_id;
    
    var updated_code_obj = snap.data();
    updated_code_obj.code.code = code_text;
    updated_code_obj.code.graphql_id = graphql_id;
    updated_code_obj.status.status = "ACTIVE";
    updated_code_obj.status.did_creation_succeed = true;
    updated_code_obj.timestamp.created = timestamp;
    
    
    return admin.firestore().collection("codes").doc(code_obj.uuid.code).update(updated_code_obj);
});

export default codeOnCreate;


const getCampaign = async (code) => {
    return admin.firestore().collection("campaigns").doc(code.uuid.campaign).get()
};




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