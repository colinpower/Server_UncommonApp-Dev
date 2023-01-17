// #region Import and Setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import { getTimestamp } from "./helpers/helper.js";
// #endregion

const create_authUser = functions.auth.user().onCreate(async (user) => {
    
    if (!user.emailVerified) {
        console.log("email not verified yet??!!")
        return;
    } else {

        await createStripeAccount(user);
        return createUsersDocument(user);

    }
});

export default create_authUser;

// #region createStripeAccount(user)
const createStripeAccount = async (user) => {

    const object = {
        setup: {
            charges_enabled: false,
            currently_due: [],
            details_submitted: false,
            eventually_due: [],
            link: ""
        },
        account: {
            balance: 0,
            acct_id: "",
            bank_id: "",
            methods: [],
            link: ""
        },
        profile: {
            email: user.email,
            name: {
                first: "",
                last: ""
            },
            phone: "",
            phone_verified: false
        },
        timestamp: {
            created: 0,
            last_updated: 0
        },
        uuid: {
            stripe_account: user.uid,
            user: user.uid
        }
    };

    return admin.firestore().collection("stripe_accounts").doc(user.uid).set(object);
};


// #endregion

// #region createUsersDocument(user)
const createUsersDocument = async (user) => {

    //create their first loyalty program
    const object = {
        profile: {
            email: user.email,
            name: {
                first: "",
                last: ""
            },
            phone: "",
            phone_verified: false
        },
        settings: {
            has_notifications: false
        },
        timestamp: {
            created: getTimestamp(),
            deleted: 0
        }
    };

    return admin.firestore().collection("users").doc(user.uid).set(object);
};
// #endregion