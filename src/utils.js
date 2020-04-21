const jwt = require('jsonwebtoken')
const jwksClient = require("jwks-rsa");

function getUserId(context) {
  const Authorization = context.request.get("Authorization");
  const client = jwksClient({
    jwksUri: `https://everybodyleave.auth0.com/.well-known/jwks.json`
  });
  function getKey(header, callback) {
    client.getSigningKey(header.kid, function(err, key) {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    })
  }
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const { userId } = jwt.verify(token, getKey, function(err, decoded) {
      console.log(decoded)
    })
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