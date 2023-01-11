import admin from "firebase-admin";
import functions from "firebase-functions";
import express from 'express';
import fetch from "node-fetch";
import dotenv from "dotenv";
import Stripe from 'stripe';


dotenv.config();
const stripe_token = process.env.STRIPE_TOKEN

const stripe = new Stripe(stripe_token);

const stripeRetrieve = functions.firestore
  .document('stripe/{user_id}/retrieve/{request_id}')
  .onCreate(async (snap, context) => {

    const user_id = context.params.user_id;
    const request_id = context.params.request_id;
    const new_obj = snap.data();

    const account_id = new_obj.account;

    const account = await stripe.accounts.retrieve(
        account_id
      );

    const refresh_url = "https://us-central1-uncommonapp-dev.cloudfunctions.net/stripe/refresh?uid=" + account_id

    const accountLink = await stripe.accountLinks.create({
        account: account_id,
        refresh_url: refresh_url,
        return_url: 'https://uncommonapp.page.link/stripe',
        type: 'account_onboarding',
    });

    console.log(account);

    var temp_object = {
        "charges_enabled": account.charges_enabled,
        "details_submitted": account.details_submitted,
        "currently_due": account.requirements.currently_due,
        "eventually_due": account.requirements.eventually_due,
        "accountLink": accountLink.url
    };

    return admin.firestore().collection("stripe").doc(user_id).collection("retrieve").doc(request_id).update({response: temp_object});
});

export default stripeRetrieve;
