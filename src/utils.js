const jwt = require('jsonwebtoken')
// const jwksClient = require("jwks-rsa");

// const client = jwksClient({
//     jwksUri: `https://everybodyleave.auth0.com/.well-known/jwks.json`
//   });
// function getKey(header, callback) {
//     client.getSigningKey(header.kid, function(err, key) {
//       const signingKey = key.publicKey || key.rsaPublicKey;
//       callback(null, signingKey);
//     })
//   }
function getUserId(context) {
  const Authorization = context.request.get("Authorization");
  
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const { userId } = jwt.verify(token, `${process.env.APP_SECRET}`) 
      console.log(userId)
    return userId
  }
  throw new AuthError()
}

class AuthError extends Error {
  constructor() {
    super('Not authorized')
  }
}

module.exports = {
  getUserId,
  AuthError
}