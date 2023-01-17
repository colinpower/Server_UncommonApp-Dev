// #region Imports
import admin from "firebase-admin";
import functions from "firebase-functions";
import express from "express";
import bodyParser from "body-parser";
import { getTimestamp } from "./../helpers/helper.js";
import { title } from "process";
import { read } from "fs";
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
    
    const object = req.body;
    const shop = await getShop(domain);

    if (shop) {
        await addOrder(object, shop)
        res.sendStatus(201);
    } else {
        log_domain_not_found(req);
        res.sendStatus(200);
    }
});

export default shopifyWebhook;

// #region getShop(domain)
const getShop = (domain) => {

    const shop = await admin.firestore().collection("shops") 
        .where("shop.domain", "==", domain)
        .limit(1)
        .get();
    
    if (shop) {
        return shop.data();
    } else {
        return
    }
};
// #endregion

// #region logError
function log_domain_not_found(req) {
    console.log("error, no shop_object found for this domain:");
    console.log(req.header('x-shopify-shop-domain'));
    console.log(req.body);
    return;
}
// #endregion

// #region addOrder(object, shop)
const addOrder = async (object, shop) => {

    let ref = admin.firestore().collection("orders").doc();     

    var type = ((req.body.discount_codes[0]) ? [req.body.discount_codes[0].type] : []);
    var amount = ((req.body.discount_codes[0]) ? [req.body.discount_codes[0].amount] : []);
    var code = ((req.body.discount_codes[0]) ? [req.body.discount_codes[0].code] : []);
    var phone = ((req.body.phone) ? req.body.phone : "");
    
    // #region Create order object for Firebase
    var new_order = {
        
        codes: {
            type: type,
            amount: amount,
            code: code,
        },
        order: {
            email: object.email,
            first_item_title: object.line_items[0].title,
            number: object.order_number,
            confirmation_url: object.order_status_url,
            phone: phone,              
            price: object.total_line_items_price,
            shopify_order_id: object.id,
            status: "PAID"
        },        
        referrer: {
            code: "",
            membership: "",
            uuid: ""
        },
        shop: {
            category: shop.shop.category,
            description: shop.shop.description,
            domain: shop.shop.domain,
            name: shop.shop.name,
            website: shop.shop.website,
            contact_support_url: shop.shop.contact_support_url
        },
        timestamp: {
            created: getTimestamp(),
            disabled: 0,
            updated: 0
        },
        uuid: {
            campaign: "",
            cash: "",
            code: "",
            membership: "",
            order: ref.id,
            referral: "",
            shop: shop.uuid.shop,
            user: ""
        }
    };
    // #endregion

    return ref.set(new_order);
}
// #endregion