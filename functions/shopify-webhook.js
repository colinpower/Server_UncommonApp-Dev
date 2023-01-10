// #region Imports
import admin from "firebase-admin";
import functions from "firebase-functions";
import express from "express";
import bodyParser from "body-parser";
import { title } from "process";
//#endregion

// #region Initialize express app
const shopifyWebhook = express();
shopifyWebhook.use(bodyParser.json());
shopifyWebhook.use(bodyParser.urlencoded({
    extended: true,
}));
// #endregion

shopifyWebhook.post("/", async (req, res) => {

    const domain = req.header('x-shopify-shop-domain');
    const topic = req.header('x-shopify-topic');
    const order_id = req.header('x-shopify-order-id');
    
    const shop = await admin.firestore().collection("shops")    //First, check whether shop exists for domain
        .where("info.domain", "==", domain)
        .get();

    if (shop.empty) {                                           //If domain not found, log error and escape
        log_domain_not_found(req);
        return;
    }

    let ref = admin.firestore().collection("orders").doc();     

    await ref.set(create_object(ref, req, shop));

    res.sendStatus(200);
});

export default shopifyWebhook;


////////ERRORS
function log_domain_not_found(req) {
    console.log("error, no shop_object found for this domain:");
    console.log(req.header('x-shopify-shop-domain'));
    console.log(req.body);
    return;
}

////////POST TO FIREBASE
const create_object = (ref, req, shops) => {

    let shop = shops.docs[0].data();

    // #region Massage values from webhook
    var type = [];
    var amount = [];
    var code = [];
    var phone = "";

    if (req.body.discount_codes.length > 0) {                                   //may have multiple discounts used
        type[0] = req.body.discount_codes[0].type;
        amount[0] = req.body.discount_codes[0].amount;
        code[0] = req.body.discount_codes[0].code;
    }
    if (req.body.phone != null) {                                               //need to check if phone is null
        phone = req.body.phone;
    }
    const current_timestamp_milliseconds = new Date().getTime();
    const timestamp = Math.round(current_timestamp_milliseconds / 1000);
    // #endregion
    
    // #region Create order object for Firebase
    var object = {
        uuid: {
            shop: shop.uuid.shop,
            code: "",
            campaign: "",
            user: {
                buyer: "",
                referrer: "",
            },
            order: ref.id,
            shopifyOrderID: req.body.id
        },
        codes: {
            type: type,
            amount: amount,
            code: code,
        },
        order: {
            shop_name: shop.info.name,
            domain: shop.info.domain,
            email: req.body.email,
            firstItemTitle: req.body.line_items[0].title,
            orderNumber: req.body.order_number,
            orderStatusURL: req.body.order_status_url,
            phone: phone,              
            price: req.body.total_line_items_price,
            status: "PAID",
            timestampCreated: timestamp,
            timestampUpdated: -1,
        }
    };
    // #endregion

    return object;
}

// const mapValues = (object, data) => {
    
//     object.token = data.access_token
//     object.scopes = data.scope
    
//     return object
// }

// async function postCode(code) {
    
//     let new_post = admin.firestore().collection("ABCDEF").doc();

//     let object = {
//         abc: code
//     };

//     await new_post.set(object);
    
//     return
// }




// //Step 5: determine the scenario
    
// if (numberOfOrderDiscountCodes > 0) {           //it's a KNOWN USER + KNOWN DISCOUNT, KNOWN USER + UNKNOWN DISCOUNT, UNKNOWN USER + KNOWN REFERRAL, UNKNOWN USER + UNKNOWN DISCOUNT
//     //HAS DISCOUNT CODE

//     const orderDiscountCode = webhookData.discount_codes[0].code;
//     const orderDiscountAmount = webhookData.total_discounts;        

//     //Does the user have a loyalty account?
//     if (!loyaltyprogramResult.empty) {          //it's a KNOWN USER + KNOWN DISCOUNT, KNOWN USER + UNKNOWN DISCOUNT

//         //Is the discount one of the ones created in the app?
//         const discountResult = await admin.firestore().collection("discount")
//             .where("domain", "==", shopDomain)
//             .where("code", "==", orderDiscountCode)
//             .get()

//         if (!discountResult.empty) {            //it's a KNOWN USER + KNOWN DISCOUNT
            
//             var additionalPoints = Number(webhookData.total_line_items_price) * pointsPerDollar;
//             var currentPoints = loyaltyprogramResult.docs[0].data().currentPointsBalance;
//             var lifetimePoints = loyaltyprogramResult.docs[0].data().lifetimePoints;

//             // Step 1: modify the order object as needed, then add it
//             orderObject.pointsEarned = additionalPoints;  // set the amount of points earned
//             orderObject.discountAmount = orderDiscountAmount;  // set the amount of the discount
//             orderObject.discountCode = orderDiscountCode;  // set the amount of the discount
//             orderObject.discountCodeID = discountResult.docs[0].id;  // set the ID of the associated discount
//             await newOrderRef.set(orderObject);  // add the order

//             // Step 2: modify the history object as needed, then add it
//             historyObject.pointsEarned = additionalPoints;  // set the amount of points earned
//             await newHistoryRef.set(historyObject);  // add history (order)

//             // Step 3: update loyaltyprogram
//             var loyaltyprogramUpdate = {
//                 currentPointsBalance: currentPoints + additionalPoints,
//                 lifetimePoints: lifetimePoints + additionalPoints
//             };
//             await admin.firestore().collection("loyaltyprograms").doc(loyaltyprogramResult.docs[0].id).update(loyaltyprogramUpdate);

//             // Step 4: update discount (used)
//             var discountUpdate = {
//                 status: "USED",
//                 timestamp_Used: current_timestamp,
//                 usedOnOrderID: newOrderRef.id
//             };
//             console.log("the discount ID is...")
//             console.log(discountResult.docs[0].id)
//             await admin.firestore().collection("discount").doc(discountResult.docs[0].id).update(discountUpdate);

//             // Step 5: End and send 200 status
//             console.log("known user, known discount code");
//             res.sendStatus(200);
        
//         } else {                                //it's a KNOWN USER + UNKNOWN DISCOUNT

//             console.log("known user, unknown discount code");
//             res.sendStatus(200);

//             // add order
//             // add history (order)
//             // add history (discount)
//             // update loyaltyprogram (points)
//         }

//     } else {                                    //it's an UNKNOWN USER + KNOWN REFERRAL, UNKNOWN USER + UNKNOWN DISCOUNT

//         //Is the discount a referral code?
//         const referralResult = await admin.firestore().collection("referral")
//             .where("domain", "==", shopDomain)
//             .where("referralCode", "==", orderDiscountCode)
//             .get()

//         if (!referralResult.empty) {            //it's an UNKNOWN USER + KNOWN REFERRAL

//             console.log("unknown user, known referral code");
//             res.sendStatus(200);

//         } else {                                //it's an UNKNOWN USER + UNKNOWN DISCOUNT

//             console.log("unknown user, unknown discount code");
//             res.sendStatus(200);

//         }
//     }

// } else {                                        //it's a KNOWN USER or an UNKNOWN USER
//     //DOES NOT HAVE DISCOUNT CODE
    
//     //Does the user have a loyalty account?
//     if (!loyaltyprogramResult.empty) {          //it's a KNOWN USER

//         var additionalPoints = Number(webhookData.total_line_items_price) * pointsPerDollar;
//         var currentPoints = loyaltyprogramResult.docs[0].data().currentPointsBalance;
//         var lifetimePoints = loyaltyprogramResult.docs[0].data().lifetimePoints;

//         // Step 1: modify the order object as needed, then add it
//         orderObject.pointsEarned = additionalPoints;  // set the amount of points earned
//         await newOrderRef.set(orderObject);  // add the order

//         // Step 2: modify the history object as needed, then add it
//         historyObject.pointsEarned = additionalPoints;  // set the amount of points earned
//         await newHistoryRef.set(historyObject);  // add history (order)

//         // Step 3: update loyaltyprogram
//         var loyaltyprogramUpdate = {
//             currentPointsBalance: currentPoints + additionalPoints,
//             lifetimePoints: lifetimePoints + additionalPoints
//         };
//         await admin.firestore().collection("loyaltyprograms").doc(loyaltyprogramResult.docs[0].id).update(loyaltyprogramUpdate);

//         // Step 4: End and send 200 status
//         console.log("known user, no discount code");
//         res.sendStatus(200);

//     } else {                                    //it's a UNKNOWN USER
//         console.log("it's an unknown user");
//         res.sendStatus(200);
//     }
// }