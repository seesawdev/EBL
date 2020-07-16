var jwt = require("express-jwt");
var Express = require("express");
var request = require("request");
// var Webtask = require("webtask-tools");
var bodyParser = require("body-parser");
var _ = require("lodash");

var app = Express();

// app.use(
//   jwt({
//     secret: function(req, payload, done) {
//       done(null, new Buffer(request.webtaskContext.data.client_secret, "base64"));
//     },
//   })
// );


const checkOptions = async (request, response, next) =>{
  if (request.method.toLowerCase() === "options") {
    request.end();
  } else {
    next();
  }
};

const endpoint = 
    "https://" +
    request.webtaskContext.data.domain +
    "/api/v2/users/" +
    request.user.sub;
  

// app.get("/", function(request, response) {
//   request(
//     {
//       url: request.endpoint,
//       headers: {
//         Authorization: "Bearer " + request.webtaskContext.data.app_token,
//       },
//     },
//     function(error, response, body) {
//       response.write(body).end();
//     }
//   );
// });

const updateProfile = async (request, response, next) => {
  
    var email = request.body.email;
    delete request.body.email;

    var app_metadata = {
      account_options: request.body.account_options,
      account_checks: _.isArray(request.body.account_checks)
        ? request.body.account_checks
        : [request.body.account_checks],
    };

    delete request.body.account_options;
    delete request.body.account_checks;

    request.payload = {
      email: email,
      app_metadata: app_metadata,
      user_metadata: request.body,
    };
  
 
  const myHeaders = new Headers();
  myHeaders.append( "Authorization", `Bearer ${access_token}`)
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  const requestOptions = { 
    method: 'PATCH',
    headers: myHeaders,
    redirect: 'follow',
    body: JSON.stringify(request.payload)
  }
  try {
    const updateProfile = await fetch(`https://everybodyleave.auth0.com/${auth0User}`, requestOptions)
    const response = await updateProfile.json()
    return await response
  } catch (err) {
    console.log(err);
  }
}
    // fetch
    //     url: request.endpoint,
    //     method: "PATCH",
    //     headers: {
    //       authorization: "Bearer " + request.webtaskContext.data.app_token,
    //       accept: "application/json",
    //       "content-type": "application/json",
    //     },
    //     body: JSON.stringify(request.payload),
    //   },
    //   function(error, response, body) {
    //     return response
    //       .status(response.statusCode)
    //       .write(body)
    //       .end();
  
// }
module.exports = Webtask.fromExpress(app);
