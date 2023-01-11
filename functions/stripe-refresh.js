//testing URL
//https://us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth/auth?shop=everlain.myshopify.com
//https://us-central1-uncommonapp-dev.cloudfunctions.net/shopify_auth/auth?shop=outweigh.myshopify.com

import admin from "firebase-admin";
import functions from "firebase-functions";
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51LpX0FI2TxC7l4Yf57QKnsPHQplHG5TW7IR3fQMwssScbJcSQ8kZMzsxridu1FvPzby7AveWjuAFWtkBRM3NLax80037hMRtyH');
const stripeRouter = express();
//const baseURL = "https://us-central1-uncommonapp-dev.cloudfunctions.net/stripe";

// /stripe/refresh


stripeRouter.get('/refresh', (req, res) => {
    
    //must include ?uid={user.uuid}
    const uid = req.query.uid;
  
    if (uid) { 

      const redirectUri = baseURL + '/auth/callback';
      const installUrl = 'https://' + shop + '/admin/oauth/authorize?client_id=' + apiKey +
        '&scope=' + scopes +
        '&state=' + state +
        '&redirect_uri=' + redirectUri;
  
      //normally you'd want to encrypt this, but do that later?? how to encrypt cookies??
      res.cookie('state', state)
    
      //then, redirect to URL we just built
      res.redirect(installUrl);
    } else {
      return res.status(400).send('Missing {uid} in request. Please retry or email colin@uncommon.app')
    }
  });


export default stripeRouter;