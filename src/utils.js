const jwt = require('jsonwebtoken')

function isLoggedIn(context) {
  const loggedInStatus = context.req.cookies["auth0.is.authenticated"]
  return loggedInStatus
}
//if using jwt authentication
function getUserId(context) {
  const tokenCookie = context.req.signedCookies.authorization
  const Authorization = context.req.get("Authorization");
  
  if (Authorization) {
    const token = Authorization.replace("Bearer ", "");
    const { userId } = jwt.verify(token, `${process.env.APP_SECRET}`) 
    return userId
  } else {
    if (tokenCookie) {
      const { userId } = jwt.verify(tokenCookie, `${process.env.APP_SECRET}`)
      return userId
    }
  }
  throw new AuthError()
}

function getUserAuth0Id(context) {
  const Authorization = context.req.get("Authorization");

  if(Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const { auth0Id } = jwt.verify(token, `${process.env.APP_SECRET}`)
      console.log(auth0Id)
      return auth0Id
  }
  throw new AuthError()
}
//if using session cookies
// function getUserIdFromCookie(context) {
//   if (context.request.session.userId) {
//     return context.request.session.userId
//   }
//   throw new AuthError();
// }
const createToken =  (userId) => jwt.sign({ userId, expiresIn: "7d"}, `${process.env.App_SECRET}`)
class AuthError extends Error {
  constructor() {
    super('Not authorized. You must be logged in to perform this function')
  }
}
module.exports = {
  createToken,
  getUserId,
  getUserAuth0Id,
  AuthError
}