
//not using this. instead using the getMe function and attaching that to context since we are issuing jwt token for backend after authenticating with auth0 access token.
const getUser = async (request, response, next, context) => {
  if (!request.user) return 
  const user = await context.prisma.user({ where: { auth0Id: request.user.sub.split(`|`)[1] } })
  request.user = { token: request.user, ...user }
  next()
}

const getCookie = async(request, response, next, context) => {
  console.log("request.cookies", request.signedCookies)
  const { prismaToken }  = request.signedCookies;
  if (!prismaToken ) {
    next()
  }
  try {
    const { userId } = await jwt.verify(prismaToken, `${process.env.APP_SECRET}`);
    if(request.user.id === userId) ;
    console.log("userId from cookie", userId)
    return userId
  } catch (err) {
    const refreshToken = await request.cookies['refresh_token']
    if (!refreshToken) {
      next() 
    }
  }
}
module.exports = { getUser, getCookie }