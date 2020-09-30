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
  // const authed = context.req.signedCookies.authorization
  // const loggedIn = context.req.cookies
  const tokenCookie = await context.req.signedCookies.authorization 
  const Authorization = await context.req.get("Authorization");
  // console.log(context.req.cookies)
  if (Authorization) {
    // try {
      // let user;
      // if (context.req && context.req.headers.authorization) {
        const token = await context.req.headers.authorization.split("Bearer ")[1]
        const decodedToken =  await verifyToken(token);
        const metadata = await decodedToken["https://everybodyleave.com/claims/user_metadata"]
        const userId = metadata["user_metaData"].userId
       
        console.log(userId)
        return userId
      } 
  if (tokenCookie) {
        const token = await context.req.headers.authorization.split("Bearer ")[1]
        const { userId } = jwt.verify(tokenCookie, `${process.env.APP_SECRET}`)
        console.log("user: ", userId)
        return userId
      }


      // const user = await getPrismaUser(token)
      // return user.id
    // const token = Authorization.replace("Bearer ", "");

    // const decoded = await verifyToken(token)
    // const auth0ID = await decoded.sub.split("|")[1]
    // // console.log("auth0Id: ", me.auth0Id())
    // user = await context.prisma.users({ auth0Id: auth0ID }).eblID()
    //  console.log("user", user)
    // return user
    // } catch (err) {
    //   console.log("error getting prisma user", err)
    // }
   
  // }
  // } else {
  //   if (tokenCookie) {
  //     const { userId } = await jwt.verify(tokenCookie, `${process.env.APP_SECRET}`)
  //     return userId
  //   }
  // }
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