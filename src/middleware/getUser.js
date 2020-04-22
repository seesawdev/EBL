
//not using this. instead using the getMe function and attaching that to context since we are issuing jwt token for backend after authenticating with auth0 access token.
const getUser = async (req, res, next, context) => {
  if (!req.user) return 
  const user = await context.prisma.user({ where: { auth0id: req.user.sub.split(`|`)[1] } })
  req.user = { token: req.user, ...user }
  next()
}

module.exports = { getUser }