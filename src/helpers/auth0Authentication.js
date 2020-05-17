const jwt = require("jsonwebtoken");
const jwkRsa = require("jwks-rsa");
const  axios = require('axios')
const config = require("./auth0Config")
const { fetchApiAccessToken } = require("./managementClient")
const validateAndParseIdToken = require('./validateAndParseIdToken')
//Validates the request JWT token
const verifyToken = token =>
  new Promise(resolve => {
    //Decode the JWT Token
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header || !decoded.header.kid) {
      throw new Error("Unable to retrieve key identifier from token");
    }
    if (decoded.header.alg !== "RS256") {
      throw new Error(
        `Wrong signature algorithm, expected RS256, got ${decoded.header.alg}`
      );
    }
    const jkwsClient = jwkRsa({
      cache: true,
      jwksUri: `https://everybodyleave.auth0.com/.well-known/jwks.json`
    });
    //Retrieve the JKWS's signing key using the decode token's key identifier (kid)
    jkwsClient.getSigningKey(decoded.header.kid, (err, key) => {
      if (err) throw new Error(err);
      const signingKey = key.publicKey || key.rsaPublicKey;
      //If the JWT Token was valid, verify its validity against the JKWS's signing key
      jwt.verify(
        token,
        signingKey,
        {
          algorithms: ["RS256"],
          audience: [`https://everybodyleave.auth0.com/api/v2/`, `https://everybodyleave.auth0.com/userinfo`],
          ignoreExpiration: false,
          issuer: `https://everybodyleave.auth0.com/`
        },
        (err, decoded) => {
          if (err) throw new Error(err);
          return resolve(decoded);
        }
      );
    });
  });


const getAuth0userEmail = (accessToken) => {
  fetch(`https://everybodyleave.auth0.com/userinfo?access_token=${accessToken}`).then(response => response.json())
    .then(json => json.email)
} 
const getAuth0UserInfo = async () => {
  try {
    const userInfo = await axios.get('https://everybodyleave.auth0.com/userinfo', {
      authorization: `Bearer ${access_token}`
    })
    const response = await userInfo.data;
    console.log(response)
    return await response 
  } catch (err) {
    console.log("error retrieving your user info", err);
  }
}
   
    // const baseUrl = "https://everybodyleave.auth0.com"
    // const apiToken =
    //   "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlFVSkdPRVpEUWprMU4wSkZORGs0UkRWRFFqTkJNa016TnpkR01qZERRMFV4T1VZNVJUTXdOQSJ9.eyJpc3MiOiJodHRwczovL2V2ZXJ5Ym9keWxlYXZlLmF1dGgwLmNvbS8iLCJzdWIiOiJ1M1JLWFQ3MXZhSE4xYUxTU3JkQjA4Z2ZaVDFTYkZFU0BjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9ldmVyeWJvZHlsZWF2ZS5hdXRoMC5jb20vYXBpL3YyLyIsImlhdCI6MTU4ODA2OTkzMSwiZXhwIjoxNTg4MTU2MzMxLCJhenAiOiJ1M1JLWFQ3MXZhSE4xYUxTU3JkQjA4Z2ZaVDFTYkZFUyIsInNjb3BlIjoicmVhZDp1c2VycyB1cGRhdGU6dXNlcnMgY3JlYXRlOnVzZXJzIHJlYWQ6dXNlcnNfYXBwX21ldGFkYXRhIHVwZGF0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgZGVsZXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBjcmVhdGU6dXNlcnNfYXBwX21ldGFkYXRhIHJlYWQ6c3RhdHMgcmVhZDp1c2VyX2lkcF90b2tlbnMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.w3wW3Ky5MpAgcdTm1L7BLSEjhHHOLmjPrMniOkQfQg9isaZyIxLXRE9RgSTOjgWIBCZpDOR-UCOn11Cl-mV0kC-MJm6DRi4iaU8ykU0ZtmsTrCpAmnZjvHuaZmop1z1zciuhhU1Aq8Y77bRxwLTZh9g6k5HFNGwoPnhZ2DRQEpDb7ZlU04sUP4uqJMjvyzs5qRuJPotAlbf1u1pyJcJRZknXLjmK44vD4Kz1Y1thBOgWuFj4zQ9VIIw9gSh51aU58q9v0ByXeFk0nl9mBMJE0Lxh98agLYLQH0gAqMlqKp8Rpxvg7F9Zsx0QFCG9716PznwVUe_mJ8rwcA794OGnsQ";
    // const decodedToken = await verifyToken(apiToken)
   
    // console.log(decodedToken['sub'])
    // const auth0Id = await decodedToken['sub']
    // try { 
    //   const user_claims = await axios.get(
    //     `https://everybodyleave.auth0.com/api/v2/users/` + auth0Id,
    //     {
    //       "Authorization":"Bearer " + apiToken
    //     }
    //   );
    // const response = await user_claims.data
    // console.log("successfully retrieved userinfo", user_claims)
    // return user_claims.data
    // }catch (err) {
    //   console.log("Error retrieving user claims", err)
    // }
  // }

const getPrismaUser = async (parent, { accessToken }, context) => {
  let email;
  const decodedToken = await verifyToken(accessToken)
  const auth0Id = sub.split("|")[1]
  const prismaUser = await context.prisma.user({auth0Id})
  if (prismaUser === null) {
    if (decodedToken.scope.includes('email')) {
      email = await fetchAuth0UserEmail(accessToken)
      return await email
    }
  }
}

module.exports = { verifyToken, getAuth0UserInfo, getAuth0userEmail, getPrismaUser, }