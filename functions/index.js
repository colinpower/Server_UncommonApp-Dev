import admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);
import functions from "firebase-functions";


// ----- ON CREATE ------
import create_authEmail from "./create-auth-email.js";                  // auth-link                   ->      api_sendgrid
import create_authPhone from "./create-auth-phone.js";                  // ->      api_twilio
import create_authShopify from "./create-auth-shopify.js";              // user_authrequest_Create      ->      api_twilio__onUpdate
import create_authUser from "./create-auth-user.js";                    // auth_Create  (RENAME!)       ->      auth
import create_Cash from "./create-cash.js";
import create_Code from "./create-code.js";                             // code_Create                  ->      code
import create_Code_modify from "./create-code-modify.js";             // code_updateCreate            ->      code__change
import create_Order from "./create-order.js";                             // order_Create                 ->      order
import create_stripeAccount_balance from "./create-stripe-account-balance.js"
import create_stripeAccount_check from "./create-stripe-account-check.js"
import create_stripeAccount_link from "./create-stripe-account-link.js"
import create_stripeAccount_payout from "./create-stripe-account-payout.js"

export const create_auth_email = create_authEmail;
export const create_auth_phone = create_authPhone;
export const create_auth_shopify = create_authShopify;
export const create_auth_user = create_authUser;
export const create_cash = create_Cash;
export const create_code = create_Code;
export const create_code_modify = create_Code_modify;
export const create_order = create_Order;
export const create_stripe_account_balance = create_stripeAccount_balance
export const create_stripe_account_check = create_stripeAccount_check
export const create_stripe_account_link = create_stripeAccount_link
export const create_stripe_account_payout = create_stripeAccount_payout


// ----- ON UPDATE ------
import update_authPhone from "./update-auth-phone.js";                  // user_authrequest_Create      ->      api_twilio__onUpdate
import update_Referrals from "./update-referrals.js";                  // user_authrequest_Create      ->      api_twilio__onUpdate
export const update_auth_phone = update_authPhone;
export const update_referrals = update_Referrals;


// ----- CALLABLE -----
import callable from "./callable.js";
import callable2 from "./callable2.js";
import call_stripe_payout from "./call-stripe-payout.js";
import call_stripe_balance from "./call-stripe-balance.js";
export const callable_fx = callable;
export const callable2_fx = callable2;
export const call_stripe_payout_fx = call_stripe_payout;
export const call_stripe_balance_fx = call_stripe_balance;


// ----- API ------
import express_app from "./api/index.js";
export const api = functions.https.onRequest(express_app);