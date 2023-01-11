// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
// const stripe = require('stripe')('sk_test_51LpX0FI2TxC7l4Yf57QKnsPHQplHG5TW7IR3fQMwssScbJcSQ8kZMzsxridu1FvPzby7AveWjuAFWtkBRM3NLax80037hMRtyH');

// const payout = await stripe.payouts.create(
//   {amount: 1000, currency: '$merchant.currency', method: 'instant', source_type: 'card'},
//   {stripeAccount: '{{CONNECTED_ACCOUNT_ID}}'}
// );


//https://stripe.com/docs/connect/instant-payouts



//RETRIEVE BALANCE
//https://stripe.com/docs/api/balance/balance_retrieve





// CREATE A TRANSFER
//https://stripe.com/docs/connect/charges-transfers

// // Set your secret key. Remember to switch to your live secret key in production.
// // See your keys here: https://dashboard.stripe.com/apikeys
// const stripe = require('stripe')('sk_test_51LpX0FI2TxC7l4Yf57QKnsPHQplHG5TW7IR3fQMwssScbJcSQ8kZMzsxridu1FvPzby7AveWjuAFWtkBRM3NLax80037hMRtyH');

// // Create a PaymentIntent:
// const paymentIntent = await stripe.paymentIntents.create({
//   amount: 10000,
//   currency: 'usd',
//   transfer_group: '{ORDER10}',
// });

// // Create a Transfer to the connected account (later):
// const transfer = await stripe.transfers.create({
//   amount: 7000,
//   currency: 'usd',
//   destination: '{{CONNECTED_STRIPE_ACCOUNT_ID}}',
//   transfer_group: '{ORDER10}',
// });

// // Create a second Transfer to another connected account (later):
// const secondTransfer = await stripe.transfers.create({
//   amount: 2000,
//   currency: 'usd',
//   destination: '{{OTHER_CONNECTED_STRIPE_ACCOUNT_ID}}',
//   transfer_group: '{ORDER10}',
// });


//CREATE A LOGIN LINK -> SHOULD USE THE FIREBASE CALLABLE FUNCTIONS FOR THIS!!!
//https://stripe.com/docs/api/account/create_login_link
//https://firebase.google.com/docs/functions/callable

// const stripe = require('stripe')('sk_test_51LpX0FI2TxC7l4Yf57QKnsPHQplHG5TW7IR3fQMwssScbJcSQ8kZMzsxridu1FvPzby7AveWjuAFWtkBRM3NLax80037hMRtyH');

// const loginLink = await stripe.accounts.createLoginLink(
//   'acct_1LpX0FI2TxC7l4Yf'
// );

// LOGIN LINK RESPONSE FROM STRIPE
// {
//     "object": "login_link",
//     "created": 1673387596,
//     "url": "https://connect.stripe.com/express/hGtkVmo9L2eD",
//     "id": "lael_N980GNHfagFbyw"
//   }