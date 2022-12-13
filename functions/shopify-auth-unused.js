
    // console.log(req.query.shop);
    // console.log(req.headers.cookie.shopify_app_session.sig);

    // //grab the cookie from the incoming request
    // const shop_app_session = cookie.parse(req.headers.cookie.shopify_app_session);
    // const shop_app_sessionSIG = cookie.parse(req.headers.cookie.shopify_app_session.sig);

    // res.cookie("shopify_app_session", shop_app_session);
    // res.cookie("shopify_app_session.sig", shop_app_sessionSIG);

    // const cookies = new Cookies(request, response, {
    //     keys: [Context.API_SECRET_KEY],
    //     secure: true,
    //   });

    // //take the request to /auth/callback from the shop and Shopify. Then exchange short term token for long term one.
    // const shopSession = await Shopify.Auth.validateAuthCallback(
    //     req,
    //     res,
    //     req.query
    // );

    // //store the long-term auth token for future use
    // console.log(shopSession.accessToken);

    //store the store for future use
    //shops[shopSession.shop] = shopSession;

    //once you get the long term auth token and shop, redirect the user back to the location of the shop
    //res.redirect(`https://${req.query.shop}/admin/apps/uncommon-app`);
    












// console.log(callbackResponse)
    // console.log(callbackResponse.session)
    // console.log(callbackResponse.session.accessToken)
    
    // const token1 = callbackResponse.session.accessToken;
    // const shop1 = callbackResponse.session.shop;

    // const sessionObject = {
    //     "token": token1,
    //     "shop": shop1
    // };

    // let shopifyRef = admin.firestore().collection("shopify").doc();

    // await shopifyRef.set(sessionObject);

    // var sessionObject = {

    //     accessToken: callbackResponse.session.accessToken,
    //     // expires: session1.expires,
    //     // id: session1.id,
    //     // scope: session1.scope,
    //     // shop: session1.shop,
    //     // state: session1.state
    // };

    //Post the item to firestore
    // await shopifyRef.set(sessionObject);
    
    //res.redirect(`https://${shopSession.shop}/admin/apps/uncommon-app`);
    //res.redirect("/testing123");

    // const shopSession = await shopify.auth.validateAuthCallback(
    //     req,
    //     res,
    //     req.query
    // );

    // //store the long-term auth token for future use
    // console.log(shopSession);

    // //store the store for future use
    // shops[shopSession.shop] = shopSession;

    // //once you get the long term auth token and shop, redirect the user back to the location of the shop
    // res.redirect(`https://${shopSession.shop}/admin/apps/uncommon-app`);








//#region Athleisure access token (Aug 15)
// Session {
//     id: 'offline_athleisure-la.myshopify.com',
//     shop: 'athleisure-la.myshopify.com',
//     state: '747143013473658',
//     isOnline: false,
//     accessToken: 'shpua_2d7b02871ee6b3cf1094875025e269c4',
//     scope: 'read_products,read_orders,write_discounts,write_price_rules'
//   }
//#endregion

//#region Hello-Vip access token (Aug 15)
// Session {
//     id: 'offline_hello-vip.myshopify.com',
//     shop: 'hello-vip.myshopify.com',
//     state: '118739299662392',
//     isOnline: false,
//     accessToken: 'shpua_bbb2ae8010e6ac28e288722234983f03',
//     scope: 'read_products,read_orders,write_discounts,write_price_rules'
//   }
//#endregion

//#region Hello-Vip-Test-1 access token (Aug 15)
// Session {
//     id: 'offline_hello-vip-test-1.myshopify.com',
//     shop: 'hello-vip-test-1.myshopify.com',
//     state: '967928987420190',
//     isOnline: false,
//     accessToken: 'shpua_3e80c4fc97887f4d700426804466e152',
//     scope: 'read_products,read_orders,write_discounts,write_price_rules'
//   }
//#endregion

//#region Attempting to set the access token in firebase
// const accessTokenInfo = {
//     id: shopSession.id,
//     shop: shopSession.shop,
//     state: shopSession.state,
//     isOnline: shopSession.isOnline,
//     accessToken: shopSession.accessToken || "token not found",
//     scope: shopSession.scope
// };

// const resultOfFirebaseSet = admin.firestore().collection("onboarding").doc(shopSession.shop).set(accessTokenInfo);

//log the response from firebase
//console.log("Set: ", resultOfFirebaseSet);
//#endregion