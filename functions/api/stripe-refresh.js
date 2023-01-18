// import admin from "firebase-admin";
// import functions from "firebase-functions";
// import express from 'express';
// import fetch from "node-fetch";
// import dotenv from "dotenv";
// import Stripe from 'stripe';

// dotenv.config();
// const stripe_token = process.env.STRIPE_TOKEN
// const stripe = new Stripe(stripe_token);
// const stripeRouter = express();
// //const baseURL = "https://us-central1-uncommonapp-dev.cloudfunctions.net/stripe";

// stripeRouter.get('/refresh', async (req, res) => {
    
//     //must include ?uid={user.uuid}
//     const uid = req.query.uid;
  
//     if (uid) {

//       //get the user's stripe account from Firebase

//       //IN THE SHORT TERM, JUST PASS THE STRIPE ACCOUNT IN THE URL
//       const refresh_url = "https://us-central1-uncommonapp-dev.cloudfunctions.net/stripe/refresh?uid=" + uid

//       const accountLink = await stripe.accountLinks.create({
//         account: uid,
//         refresh_url: refresh_url,
//         return_url: 'https://uncommonapp.page.link/stripe',
//         type: 'account_onboarding',
//       });

//       const account_url = accountLink.url

//       //then, redirect to URL we just built
//       res.redirect(account_url);
//     } else {
//       return res.status(400).send('Missing {uid} in request. Please retry or email colin@uncommon.app')
//     }
//   });

// export default stripeRouter;







//export default express_app;


// ----- HELPER FUNCTIONS ------














//const baseURL = "https://us-central1-uncommonapp-dev.cloudfunctions.net/stripe";
//const baseURL = "https://us-central1-uncommonapp-dev.cloudfunctions.net/firestore";
//testing URL
//https://us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth/auth?shop=everlain.myshopify.com
//https://us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth/auth?shop=outweigh.myshopify.com





