// #region Import and Setup
import admin from "firebase-admin";
import functions from "firebase-functions";
import Twilio from 'twilio';
import dotenv from "dotenv";
import { getTimestamp } from "./helpers/helper.js";

dotenv.config();

const tw_acct = process.env.TWILIO_SID;
const tw_token = process.env.TWILIO_TOKEN;
const tw_client = Twilio(tw_acct, tw_token);
// #endregion

const create_authPhone = functions.firestore
  .document('auth_phone/{doc_id}')
  .onCreate(async (snap, context) => {

    const doc_id = context.params.doc_id;
    const doc = snap.data();
    const phone = doc.phone;            //Confirm that the phone number is in the correct format (i.e. +1 and then 10 digits)
    const code = createOTP();

    await updateDocumentWithCorrectCode(doc_id, doc, code);

    
    const text = "Uncommon App: Your verification code is " + code + ". This code expires in 3 minutes."
    const number = process.env.TWILIO_NUMBER

    return tw_client.messages
        .create({
            body: text,
            from: number,
            to: phone
        })
        .then(message => console.log(message.sid));

});

export default create_authPhone;
    

// #region createOTP()
const createOTP = () => {

    var chars = "1234567890";
    var otp_array = Array.from(
        { length: 4 },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );

    return otp_array.join("");
};
// #endregion

// #region updateDocumentWithCorrectCode(doc_id, doc, code)
const updateDocumentWithCorrectCode = async (doc_id, doc, code) => {

    doc.correct_code = code;
    doc.timestamp.created = getTimestamp();
    doc.timestamp.expires = getTimestamp() + 300;

    return admin.firestore().collection("auth_phone").doc(doc_id).update(doc);
};
// #endregion