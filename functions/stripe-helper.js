import admin from "firebase-admin";
import dotenv from "dotenv";
import Stripe from 'stripe';

dotenv.config();
const stripe_token = process.env.STRIPE_TOKEN
const stripe = new Stripe(stripe_token);

// #region createAccount(stripe_user)
export async function createAccount(stripe_user) {

    const email = stripe_user.info.email;
    const phone = stripe_user.info.phone;
    const first_name = stripe_user.info.first_name;
    const last_name = stripe_user.info.last_name;

    const account = await stripe.accounts.create({
        type: 'express',
        email: email,
        capabilities: {transfers: {requested: true}},
        business_type: 'individual',
        business_profile: {url: 'https://uncommon.app'},
        individual: {
            first_name: first_name,
            last_name: last_name,
            phone: phone
        },
        settings: {
            payouts: {
                schedule: {
                    interval: 'manual'
                }
            }
        }
    });

    return account;
};
// #endregion

// #region createAccountLink(account_id)
export async function createAccountLink(account_id) {

    const refresh_url = "https://us-central1-uncommonapp-dev.cloudfunctions.net/stripe/refresh?uid=" + account_id

    const account_link = await stripe.accountLinks.create({
        account: account_id,
        refresh_url: refresh_url,
        return_url: 'https://uncommonapp.page.link/stripe',
        type: 'account_onboarding',
    });

    return account_link.url;
};
// #endregion

// #region transferCash(account_id, amount, referral_id)
export async function transferCash(account_id, amount, referral_id) {

    const transfer = await stripe.transfers.create({
        amount: amount,
        currency: 'usd',
        destination: 'account_id',
        transfer_group: 'referral_id',
      });

    return transfer.id;
};
//https://stripe.com/docs/api/transfers/create
// #endregion



