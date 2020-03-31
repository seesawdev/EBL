const getUser = async (req, res, next, context) => {
  if (!req.user) return 
  const user = await context.prisma.user({ where: { auth0id: req.user.sub.split(`|`)[1] } })
  req.user = { token: req.user, ...user }
  next()
}

module.exports = { getUser }