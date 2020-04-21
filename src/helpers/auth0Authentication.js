const jwt = require("jsonwebtoken");
const jwkRsa = require("jwks-rsa");
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
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
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
          audience: `${process.env.AUTH0_AUDIENCE}`,
          ignoreExpiration: false,
          issuer: `https://${process.env.AUTH0_DOMAIN}/`
        },
        (err, decoded) => {
          if (err) throw new Error(err);
          return resolve(decoded);
        }
      );
    });
  });
const getAuth0userEmail = (accessToken) => {
  fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo?access_token=${accessToken}`).then(response => response.json())
    .then(json => json.email)
} 
const getAuth0Claims = (accessToken) => {
  fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo?access_token=${accessToken}`).then(response => response.json())
}

const getPrismaUser = async (parent, { accessToken }, context) => {
  let email,
  const decodedToken = await verifyToken(accessToken)
  const auth0Id = sub.split("|")[1]
  const prismaUser = await context.prisma.user({auth0Id})
  if (prismaUser === null) {
    if (decodedToken.scope.includes('email')) {
      email = await fetchAuth0UserEmail(accessToken)
    }
  }
}