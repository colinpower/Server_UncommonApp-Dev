
import admin from "firebase-admin";
import dotenv from "dotenv";
import {Headers} from "cross-fetch";
import { Shopify } from '@shopify/shopify-api';
import express from "express";
import bodyParser from "body-parser";  
const { json } = bodyParser;
import { getToken } from "./helper.js";

dotenv.config();

global.Headers = global.Headers || Headers;


const shopifyUpdateCode = express();
shopifyUpdateCode.use(bodyParser.json());
shopifyUpdateCode.use(bodyParser.urlencoded({
    extended: true,
}));
  

shopifyUpdateCode.post("/", async (req, res) => {
    
    const new_code = req.body.code;
    const domain = req.body.domain;
    const graphql_id = req.body.graphql_id;
    const token = await getToken(domain);

    var discountMutation = `mutation updateDiscount($id:ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicUpdate(id:$id, basicCodeDiscount: $basicCodeDiscount) {
            codeDiscountNode {
                id: id
                }
                userErrors { 
                extraInfo
                code
                field
                message
                }
        }
    }`

    var variables = {
        "id": String(graphql_id),
        "basicCodeDiscount": {
          "code": String(new_code),
        },
    };

    //Auth with Shopify
    const client = new Shopify.Clients.Graphql(domain, token);
      
    //Making request to endpoint
    const response = await client.query({
        data: {
            query: discountMutation,
            variables: variables,
        },
    });
     
    
    //Step 4. return the products
    if (response.body.data.discountCodeBasicUpdate.userErrors.length > 0) {             //409 Error: conflict with current state (i.e. existing discount code)
        
        if (response.body.data.discountCodeBasicUpdate.userErrors[0].messsage) {

            var errorMessageFromShopify = result.body.data.discountCodeBasicUpdate.userErrors[0].messsage;
            console.log(errorMessageFromShopify);
        }
        
        console.log("error, duplicate code");
        res.sendStatus(409);

    } else if (response.body.data.discountCodeBasicUpdate.userErrors.length == 0) {       //no error

        console.log("No errors");
        res.sendStatus(201);                                                                  //201 Created.

    } else {
        console.log("unspecified error");                                               //500 Error. Other error...
        res.sendStatus(500)
    }
});

export default shopifyUpdateCode;

// const getToken = async (domain) => {
//     return admin.firestore().collection("shopify").doc(domain)
//         .get()
//         .then(result => {

//             console.log(domain);
//             console.log(result.data());
//             console.log(result.data().token.token);

//             if (!result.empty) {
//                 return result.data().token.token;
//             } else {
//                 return
//             }
//         })
// };






// MORE CODE
// const query = gql`
//   query OrdersForEmailAddress($emailQuery: String!) {
//       orders(first: 100 query: $emailQuery) {
//         edges {
//           cursor
//           node {
//             id
//             discountCode
//             processedAt
//           }
//         }
//         pageInfo {
//           hasNextPage
//         }
//       }
//     }
//   `

// const variables = {
//     emailQuery: "email:colinjpower1@gmail.com"
// }


// curl -X POST \
//   https://hello-vip.myshopify.com/admin/api/2022-07/graphql.json \
//   -H 'Content-Type: application/graphql' \
//   -H 'X-Shopify-Access-Token: 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' \
//   -d '
//   {
//     products(first: 3) {
//       edges {
//         node {
//           id
//           title
//         }
//       }
//     }
//   }