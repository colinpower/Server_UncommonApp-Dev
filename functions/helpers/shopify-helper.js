import {Headers} from "cross-fetch";
import { Shopify } from '@shopify/shopify-api';
import dotenv from "dotenv";

dotenv.config();
global.Headers = global.Headers || Headers;
  

// #region getShopInfo(domain, token)
export async function getShopInfo(domain, token) {

    const client = new Shopify.Clients.Graphql(domain, token);
      
    const response = await client.query({
        data: `query {
            shop {
            contactEmail
            description
            email
            name
            url
            }
        }`,
    });

    if (response.body.errors) {
        
        console.log(response.body.errors[0].message);
        return;

    } else {

        const o = response.body.data.shop

        const object = {
            contact_support_email: ((o.contactEmail) ? o.contactEmail : ""),
            description: ((o.description) ? o.description : ""),
            email: ((o.email) ? o.email : ""),
            name: ((o.name) ? o.name : ""),
            website: ((o.url ? o.url : ""))
        }

        return object;
    }
};
// #endregion





// #region createShopifyCode(domain, token, object)
export async function createShopifyCode(domain, token, object) {

    const value_string = object.value;
    const value_var = Number(value_string)
    const code_var = object.code;
    const title_var = object.title;
    const usage_limit_var = object.usage_limit;

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

    var variables = {
        "code": code_var,
        "value": value_var,
        "title": title_var,
        "usage_limit": usage_limit_var
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

    console.log("RESPONSE")
    console.log(response.body);
     
    if (response.body.errors) {
        
        console.log(response.body.errors[0].message);
        return;

    } else {

        console.log("ABOUT TO RETURN");
        console.log(response.body.data.discountCodeBasicCreate.codeDiscountNode);
        
        const graphql_id = response.body.data.discountCodeBasicCreate.codeDiscountNode.id

        return graphql_id;
    }
};
// #endregion

// #region updateShopifyCode(domain, token, object)
export async function updateShopifyCode(domain, token, object) {

    const new_code = object.new_code;
    const graphql_id = object.graphql_id;

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

    const client = new Shopify.Clients.Graphql(domain, token);
      
    const response = await client.query({
        data: {
            query: discountMutation,
            variables: variables,
        },
    });
     
    if (response.body.errors) {
        
        console.log(response.body.errors[0].message);
        return;

    } else {

        return response.body.data.discountCodeBasicUpdate.codeDiscountNode.id;

    }
};
// #endregion