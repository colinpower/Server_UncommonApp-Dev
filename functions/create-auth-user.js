// #region Import and Setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import { getTimestamp } from "./helpers/helper.js";
// #endregion

const create_authUser = functions.auth
    .user()
    .onCreate(async (user) => {
    
    // return admin.firestore().collection("asldfkjasf").doc().set({"asldfk": user.uid});
    // if (!user.emailVerified) {
    //     console.log("email not verified yet??!!")
    //     return;
    // } else {

        await createStripeAccount(user);
        return createUsersDocument(user);

    // }
});

export default create_authUser;

// #region createStripeAccount(user)
const createStripeAccount = async (user) => {

    const object = {
        account: {
            acct_id: "",
            balance: 0,
            link: {
                created: 0,
                object: "",
                url: ""
            },
            methods_available: [],
            source_type: ""
        },
        profile: {
            email: user.email,
            email_verified: user.emailVerified,
            name: {
                first: "",
                last: ""
            },
            phone: "",
            phone_verified: false
        },
        setup: {
            charges_enabled: false,
            currently_due: [],
            details_submitted: false,
            eventually_due: [],
            link: ""
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
            email_verified: user.emailVerified,
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
        },
        uuid: {
            user: user.uid
        }
    };

    return admin.firestore().collection("users").doc(user.uid).set(object);
};
// #endregion