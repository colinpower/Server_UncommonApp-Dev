// #region Import and Setup
import admin from "firebase-admin";
import functions from "firebase-functions";
// #endregion

const callable2 = functions.https.onCall((data, context) => {
 
    // Message text passed from the client.
    const text = data.text;

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;
    
    // Get the image URL from Firebase or from Shopify
    const url = "https://cdn.shopify.com/s/files/1/0634/2770/7135/products/ScreenShot2022-03-20at10.15.45AM.png?v=1647789507";

    // Return the url
    return { text: url };
});

export default callable2;



// query {
//     product(id: "gid://shopify/Product/7585260634367") {
//       title
//       media(first: 1) {
//         edges {
//           node {
//             ...fieldsForMediaTypes
//           }
//         }
//       }
//     }
//   }
  
//   fragment fieldsForMediaTypes on Media {
//     alt
//     mediaContentType
//     preview {
//       image {
//         id
//         altText
//         originalSrc
//       }
//     }
//     status
//     ... on MediaImage {
//       id
//       image {
//         altText
//         originalSrc
//       }
//     }
//   }
  