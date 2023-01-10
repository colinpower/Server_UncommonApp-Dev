
import admin from "firebase-admin";
import dotenv from "dotenv";
import {Headers} from "cross-fetch";
import { Shopify } from '@shopify/shopify-api';
import express from "express";
import bodyParser from "body-parser";  
const { json } = bodyParser;

dotenv.config();

global.Headers = global.Headers || Headers;


const shopifyCreateCode = express();
shopifyCreateCode.use(bodyParser.json());
shopifyCreateCode.use(bodyParser.urlencoded({
    extended: true,
}));
  





// shopifyCreateDiscount.get("/", async (req, res) => {

//     //https://us-central1-uncommon-loyalty.cloudfunctions.net/makeDiscountRequestGQL",

//     const bodyOfPOST = {
//         code: "B4",
//         company: "Athleisure",
//         dollarAmount: 10,
//         title: "fake title",
//         usageLimit: 1
//     };


//     const response = await fetch("https://8ed3-205-178-78-227.ngrok.io", {
//         method: "POST", 
//         body: JSON.stringify(bodyOfPOST),
//         headers: { "Content-Type": "application/json" }
//     });

//     //console.log(response.json());
//     //const response3 = response2.clone();
//     const data = await response.json();

//     console.log(typeof data);
//     console.log(data.graphqlID);
//     // const data2 = await JSON.parse(data);

//     // console.log(data2);
//     // const data3 = data2.graphqlID;

//     //console.log(gqlLink);

//     //console.log(responseJSON1);
//     //console.log(responseJSON1.body);
//     //const variable1 = JSON.parse(responseJSON1)
//     //console.log("ABOUT TO RESPOND TO POSTMAN");
//     //console.log(responseJSON1);

//     //console.log("REPSONSE IS" + JSON.parse(response.json));

//     res.sendStatus(200)
// })



shopifyCreateCode.post("/", async (req, res) => {

    const value_string = req.body.value;
    const value_var = Number(value_string)
    
    const code_var = req.body.code;
    const title_var = req.body.title;
    const usage_limit_var = req.body.usage_limit;
    
    const domain = req.body.domain;
    const graphql_id = req.body.graphql_id;

    console.log("this is the code:");
    console.log(code_var);
    console.log(value_var);

    const token = await getToken(domain);
    //const token = await token_doc.data().token.token;


    var discountMutation = `mutation OneFixedDiscountNoExpiration($usage_limit: Int, $value: Decimal, $code: String, $title: String) {
        discountCodeBasicCreate(basicCodeDiscount: {title: $title, usageLimit: $usage_limit, startsAt: "2016-01-01", customerSelection: {all: true}, code: $code, customerGets: {value: {discountAmount: {amount: $value, appliesOnEachItem: false}}, items: {all: true}}}) {
          userErrors {
            field
            message
            code
          }
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                usageLimit
                summary
                startsAt
                status
                codes(first: 1) {
                  edges {
                    node {
                      code
                    }
                  }
                }
              }
            }
          }
        }
      }`

    // var variables = {
    //     "code": code_var,
    //     "value": value_var,
    //     "title": title_var,
    //     "usage_limit": usage_limit_var
    // };


    var variables = {
        "code": code_var,
        "value": value_var,
        "title": title_var,
        "usage_limit": usage_limit_var,
    };

    // variables.code = String(code_var);
    // variables.value = Number(value_var);
    // variables.title = String(title_var);
    // variables.usage_limit = Number(usage_limit_var);

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
    if (response.body.data.discountCodeBasicCreate.userErrors.length > 0) {             //409 Error: conflict with current state (i.e. existing discount code)
        console.log(response.body.data.discountCodeBasicCreate.userErrors)
        console.log("error, duplicate code");
        res.sendStatus(409);
    } else if (response.body.data.discountCodeBasicCreate.userErrors.length == 0) {       //no error

        console.log("No errors");
        console.log(response.body.data.discountCodeBasicCreate.codeDiscountNode.id);
        console.log(typeof response.body.data.discountCodeBasicCreate.codeDiscountNode.id);

        const new_graphql_id = response.body.data.discountCodeBasicCreate.codeDiscountNode.id
        const res_obj = {
            graphql_id: new_graphql_id
        };
                            
        res.status(201).json(res_obj);                                                  //201 Created. Pass back e.g. gid://shopify/DiscountCodeNode/1197363626239
    } else {
        console.log("unspecified error");                                               //500 Error. Other error...
        res.sendStatus(500)
    }
});

export default shopifyCreateCode;


const getToken = async (domain) => {
    return admin.firestore().collection("shopify").doc(domain)
        .get()
        .then(result => {

            console.log(domain);
            console.log(result.data());
            console.log(result.data().token.token);

            if (!result.empty) {
                return result.data().token.token;
            } else {
                return
            }
        })
};




//const queryData = await graphQLClient.request(query, variables).then((data) => console.log(JSON.stringify(data, undefined, 2)))

//console.log(JSON.stringify(queryData, undefined, 2))
  //return JSON.stringify(queryData, undefined, 2)
//};










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