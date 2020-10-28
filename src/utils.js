const jwt = require('jsonwebtoken')
const { getPrismaUser } = require('./helpers/auth0Authentication')
const { verifyToken } = require('./helpers/auth0Authentication')
const { validateAndParseToken } = require('./helpers/validateAndParseToken')
const { fromString } = require("uuidv4");

function isLoggedIn(context) {
  const loggedInStatus = context.req.cookies["auth0.is.authenticated"]
  return loggedInStatus
}

//if using jwt authentication
async function getUserId(context){
  const Authorization = await context.req.get("Authorization");
  if (Authorization) {
        const token = await context.req.headers.authorization.split("Bearer ")[1]
        const decodedToken =  await verifyToken(token);
        const metadata = await decodedToken["https://everybodyleave.com/claims/user_metadata"]
        const userId = metadata.userId     
        console.log("userId: ", userId)
        return userId
      } 
  throw new AuthError()
}
// function getUserAuth0Id(context) {
//   const Authorization = context.req.get("Authorization");

//   if(Authorization) {
//     const token = Authorization.replace('Bearer ', '');
//     const { auth0Id } = jwt.verify(token, `${process.env.APP_SECRET}`)
//       console.log(auth0Id)
//       return auth0Id
//   }
//   throw new AuthError()
// }
//if using session cookies
// function getUserIdFromCookie(context) {
//   if (context.request.session.userId) {
//     return context.request.session.userId
//   }
//   throw new AuthError();
// }
const refresh = (context) => {
  const refreshToken =  context.req.signedCookies.refresh_token
  const accessToken = context.req.signedCookies.authorization;
  const leeway = 3000
  if (!accessToken) {
    throw new AuthError()
  }
  let payload;
  try {
    payload = jwt.verify(accessToken, `${process.env.APP_SECRET}`)
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return context.res.status(401).end();
    }
    return context.res.status(400).end();
  }
  const nowSeconds = Math.round(Number(new Date()) / 1000)
  if (payload.exp - nowSeconds > 30) {
    return context.res.status(400).end();
  }
  //TODO decode refresh_token and request new auth0 access_token before next step (newToken)
  const newToken = jwt.sign
}
const createToken =  (userId) => jwt.sign({ userId, expiresIn: "7d"}, `${process.env.App_SECRET}`)
class AuthError extends Error {
  constructor() {
    super('Not authorized. You must be logged in to perform this function')
  }
}
module.exports = {
  createToken,
  getUserId,
  // getUserAuth0Id,
  AuthError
}