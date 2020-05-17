const jwt = require('jsonwebtoken')
//if using jwt authentication
// function getUserId(context) {
//   const Authorization = context.request.get("Authorization");
  
//   if (Authorization) {
//     const token = Authorization.replace('Bearer ', '')
//     const { userId } = jwt.verify(token, `${process.env.APP_SECRET}`) 
//       console.log(userId)
//     return userId
//   }
//   throw new AuthError()
// }
// function getUserAuth0Id(context) {
//   const Authorization = context.request.get("Authorization");

//   if(Authorization) {
//     const token = Authorization.replace('Bearer ', '');
//     const { auth0Id } = jwt.verify(token, `${process.env.APP_SECRET}`)
//       console.log(auth0Id)
//       return auth0Id
//   }
//   throw new AuthError()
// }
//if using session cookies
function getUserId(context) {
  if (context.request.session.userId) {
    return context.request.session.userId
  }
  throw new AuthError();
}

class AuthError extends Error {
  constructor() {
    super('Not authorized. You must be logged in to perform this function')
  }
}

module.exports = {
  getUserId,
  // getUserAuth0Id,
  AuthError
}