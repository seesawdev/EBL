const User = {
  posts: ({ id }, args, context) => {
    return context.prisma.user({ id }).posts()
  },

  email: ({ id }, args, context) => {
    return context.prisma.user({ id }).email()
  },
}
module.exports = {
  User,
}