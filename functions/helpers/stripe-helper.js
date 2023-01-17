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

// #region transferCash(acct_id, amount, referral_id)
export async function transferCash(amount, acct_id, referral_id) {

    const transfer = await stripe.transfers.create({
        amount: amount,
        currency: 'usd',
        destination: acct_id,
        transfer_group: referral_id,
      });

    return transfer.id;
};

//https://stripe.com/docs/api/transfers/create
// #endregion

// #region createAccountLink -> Should be http Callable fx from iOS
    // const loginLink = await stripe.accounts.createLoginLink(
    //     'acct_1LpX0FI2TxC7l4Yf'
    //   );
// #endregion

// #region checkIfInstantPayoutsAvailable -> see bank acct ID on the account object
    // const bankAccount = await stripe.accounts.retrieveExternalAccount(
    //     'acct_1LpX0FI2TxC7l4Yf',
    //     'ba_1MP1uAI2TxC7l4Yffj6BkZhl'
    //   );
    //https://stripe.com/docs/api/external_account_bank_accounts/retrieve
    // The object for the bank will tell you if instant payments available
        // {
        //     "id": "card_9CUH5DBY1jTgQ0",
        //     "object": "card",
        //     ...
        //     "account": "acct_1032D82eZvKYlo2C",
        //     "available_payout_methods": ["standard", "instant"],
        //   }
// #endregion


// #region createPayout....
    // const payout = await stripe.payouts.create(
    //     {amount: 1000, currency: '$merchant.currency', method: 'instant', source_type: 'card'},    //this refers to the account's card / bank acct that they've linked... always send $ to just one of them
    //     {stripeAccount: '{{CONNECTED_ACCOUNT_ID}}'}
    //   );
    //https://stripe.com/docs/connect/instant-payouts
// #endregion