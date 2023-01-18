
// import admin from "firebase-admin";
// import dotenv from "dotenv";
// import {Headers} from "cross-fetch";
// import { Shopify } from '@shopify/shopify-api';
// import express from "express";
// import bodyParser from "body-parser";  
// const { json } = bodyParser;

// import { getToken } from "../helpers/firestore-helper.js";

// dotenv.config();

// global.Headers = global.Headers || Headers;


// const dummyEndpoint = express();
// dummyEndpoint.use(bodyParser.json());
// dummyEndpoint.use(bodyParser.urlencoded({
//     extended: true,
// }));
  



// dummyEndpoint.get("/", async (req, res) => {

//     //const value_string = req.body.value;
    
//     //const token = await getToken(domain);
    
//     //Auth with Shopify
//     //const client = new Shopify.Clients.Graphql(domain, token);
      
//     //Making request to endpoint
//     // const response = await client.query({
//     //     data: {
//     //         query: discountMutation,
//     //         variables: variables,
//     //     },
//     // });
     
//     const object = {
//         value: 120
//     };
                        
//     res.status(201).json(object); 
// });

// export default dummyEndpoint;
